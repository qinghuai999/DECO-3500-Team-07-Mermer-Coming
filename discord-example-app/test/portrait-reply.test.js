import test from 'node:test';
import assert from 'node:assert/strict';
import { createPortrait } from '../portrait.js';
import { portraitTone, REPLIES, WORDS, wordLabel } from '../portrait-text.js';

const guildId = '1542404404680982550', voiceChannelId = '1542404405301878860', textChannelId = '100000000000000001';
const A = '100000000000000010', B = '100000000000000011';
let nextId = 200000000000000100n;
function body(action, user, extra) {
  return { id: String(nextId++), type: 3, guild_id: guildId, channel_id: textChannelId,
    application_id: '100000000000000020', token: `private-test-token-${nextId}`,
    member: { user: { id: user } }, data: { custom_id: action }, ...extra };
}
// Messages are kept like Discord keeps them, so the bot can read a card back before writing a reply.
function harness() {
  let clock = 100_000, failing = null, state = { seen: [], active: null };
  const tasks = new Set(), calls = [], messages = new Map(), reports = [];
  const config = { guildId, voiceChannelId, textChannelId, now: () => clock, choose: () => 0,
    roster: { snapshot: () => ({ ready: true, ids: [A, B] }), subscribe: () => () => {} },
    store: { load: () => structuredClone(state), save: data => { state = structuredClone(data); } },
    api: async (path, options) => {
      calls.push({ path, ...structuredClone(options) });
      if (failing?.(path, options)) throw Object.assign(new Error('unavailable'), { status: 503 });
      const id = /^channels\/\d+\/messages\/(\d+)$/.exec(path)?.[1];
      if (options.method === 'POST') {
        const message = { id: String(nextId++), ...structuredClone(options.body) };
        messages.set(message.id, message);
        return message;
      }
      if (id && options.method === 'PATCH') return Object.assign(messages.get(id), structuredClone(options.body));
      return id ? structuredClone(messages.get(id)) : { id: String(nextId++) };
    },
    schedule: (fn, delay) => { const task = { fn, due: clock + delay }; tasks.add(task); return task; },
    unschedule: task => tasks.delete(task), report: () => reports.push('error'),
  };
  const h = { portrait: createPortrait(config), config, calls, tasks, reports,
    fail(rule) { failing = rule; },
    async advance(ms) { clock += ms; for (const task of [...tasks]) if (task.due <= clock) { tasks.delete(task); await task.fn(); } },
    async act(action, user, extra) {
      const result = h.portrait.handle(body(action, user, extra));
      await result.afterReply?.();
      return result.response;
    },
    click: (card, user) => h.act(card.components[0].components[0].custom_id, user, { message: { id: card.id } }),
    written: (action, user, value, extra) => h.act(action, user, { type: 5, ...extra,
      data: { custom_id: action, components: [{ type: 1, components: [{ type: 4, custom_id: 'text', value }] }] } }),
    // Plays one whole round and returns its public card, which later edits keep up to date.
    async play(picks) {
      await h.act('mermer:panel:portrait', B);
      const card = [...messages.values()].at(-1);
      const open = card.components[0].components[0].custom_id;
      for (const [user, word] of picks) {
        let view = await h.act(open, user);
        while (!buttons(view).some(button => button.label === wordLabel(word))) view = await h.act(find(view, 'Other…'), user);
        view = await h.act(find(view, wordLabel(word)), user);
        await h.act(find(view, 'Submit'), user);
      }
      if (picks.length < 2) await h.advance(30_000);
      return card;
    },
  };
  return h;
}
const buttons = view => view.data.components.flatMap(row => row.components);
const find = (view, label) => buttons(view).find(button => button.label === label).custom_id;
const lastPrivate = h => h.calls.findLast(call => call.path.startsWith('webhooks/')).body;

test('tone follows the submitted words, and each tone has ten distinct button-sized English replies', () => {
  assert.equal(portraitTone([]), null);
  assert.equal(portraitTone(['untrusted insult']), null);
  assert.equal(portraitTone(['supportive', 'funny']), 'positive');
  assert.equal(portraitTone(['supportive', 'lucky']), 'positive');
  assert.equal(portraitTone(['reckless', 'cautious']), 'negative');
  assert.equal(portraitTone(['strategic', 'impatient']), 'neutral');
  assert.equal(portraitTone(['lucky', 'energetic']), 'neutral');
  for (const word of WORDS) assert.ok(REPLIES[portraitTone([word])]);
  assert.deepEqual(Object.keys(REPLIES), ['positive', 'negative', 'neutral']);
  const lines = Object.values(REPLIES).flat();
  assert.ok(Object.values(REPLIES).every(pool => pool.length === 10));
  assert.equal(new Set(lines).size, 30);
  for (const line of lines) {
    assert.ok(line.length <= 80, line);
    assert.doesNotMatch(line, /\p{Script=Han}|[<>@*_`\n]/u);
  }
});

test('a portrait with words invites only the selected player to reply; a blank portrait offers nothing', async () => {
  const h = harness();
  const card = await h.play([[A, 'supportive'], [B, 'funny']]);
  assert.equal(card.content, `<@${A}>, how does this sound? Quick replies close <t:160:R>.`);
  assert.deepEqual(card.allowed_mentions, { parse: [] });
  assert.match(card.embeds[0].description, /supportive/i);
  assert.equal(buttons({ data: card }).length, 1);
  assert.match(card.components[0].components[0].custom_id, new RegExp(`^mermer:portrait:reply:[a-f0-9]{20}:${A}:positive:160000$`));
  const before = h.calls.length;
  const refused = await h.click(card, B);
  assert.equal(refused.data.flags, 64);
  assert.match(refused.data.content, new RegExp(`Only <@${A}> can reply`));
  assert.equal((await h.act(card.components[0].components[0].custom_id, A, { channel_id: 'wrong', message: { id: card.id } })).data.flags, 64);
  assert.equal(h.calls.length, before);
  const blank = await h.play([]);
  assert.match(blank.embeds[0].title, /Unwritten Legend/);
  assert.equal(blank.content, '');
  assert.deepEqual(blank.components, []);
  h.portrait.dispose();
});

test('quick replies match the tone, rotate through all ten lines, and one click writes the line onto the card', async () => {
  for (const [tone, words] of [['positive', ['supportive', 'funny']], ['negative', ['reckless', 'distracted']], ['neutral', ['strategic', 'impatient']]]) {
    const h = harness();
    const card = await h.play([[A, words[0]], [B, words[1]]]);
    let panel = await h.click(card, A);
    assert.equal(panel.type, 4);
    assert.equal(panel.data.flags, 64);
    const seen = new Set();
    for (let batch = 0; batch < 4; batch++) {
      const lines = buttons(panel).slice(0, 3).map(button => button.label);
      assert.ok(lines.every(line => REPLIES[tone].includes(line)));
      for (const line of lines) seen.add(line);
      assert.deepEqual(buttons(panel).slice(3).map(button => button.label), ['Another batch', 'Write my own']);
      if (batch < 3) panel = await h.act(find(panel, 'Another batch'), A);
    }
    assert.equal(seen.size, 10);
    assert.match((await h.act(buttons(panel)[0].custom_id.replace(/\d$/, '9'), A)).data.content, /displayed replies/);
    const { title, description, footer } = structuredClone(card.embeds[0]);
    const line = buttons(panel)[0];
    const sending = await h.act(line.custom_id, A);
    assert.equal(sending.type, 7);
    assert.deepEqual(sending.data.components, []);
    assert.equal(card.content, '');
    assert.deepEqual(card.components, []);
    assert.deepEqual(card.embeds[0], { ...card.embeds[0], title, footer, description: `${description}\n\n💬 **<@${A}>’s reply**\n> ${line.label}` });
    assert.equal(JSON.stringify(card).includes(B), false);
    assert.match(lastPrivate(h).content, /Your reply is on the card/);
    assert.equal(h.tasks.size, 0);
    assert.equal(h.calls.filter(call => call.method === 'POST').length, 1); // The reply never adds a second public message.
  }
});

test('after 60 seconds quick replies close without comment, and a written reply stays possible with no deadline', async () => {
  const h = harness();
  const card = await h.play([[A, 'reckless'], [B, 'chaotic']]);
  const reply = card.components[0].components[0].custom_id;
  const panel = await h.click(card, A);
  const portrait = structuredClone(card.embeds);
  await h.advance(59_999);
  assert.match(card.content, /Quick replies close/);
  await h.advance(1);
  assert.equal(card.content, `Quick replies have closed. <@${A}> can still write a reply.`);
  assert.deepEqual(card.embeds, portrait);
  assert.equal(h.calls.findLast(call => call.path.startsWith('channels/')).body.embeds, undefined);
  assert.deepEqual(card.components[0].components.map(button => [button.label, button.custom_id]), [['Write a reply', reply]]);
  assert.equal(h.calls.filter(call => call.method === 'POST').length, 1);
  assert.match(lastPrivate(h).content, /Quick replies have closed/);
  assert.deepEqual(lastPrivate(h).components[0].components.map(button => button.label), ['Write my own']);
  const stale = await h.act(buttons(panel)[0].custom_id, A);
  assert.equal(stale.type, 7);
  assert.match(stale.data.content, /no longer available/);
  await h.advance(7 * 24 * 60 * 60 * 1000);
  assert.match((await h.click(card, B)).data.content, /Only/);
  const modal = await h.click(card, A);
  assert.equal(modal.type, 9);
  assert.equal(modal.data.custom_id, `mermer:portrait:own:${card.id}`);
  assert.equal(modal.data.components[0].components[0].max_length, 200);
  const posted = await h.written(modal.data.custom_id, A, 'Still  proud\nof it. **bold** <@123> [x](http://y) @everyone');
  assert.deepEqual(posted, { type: 5, data: { flags: 64 } });
  assert.ok(card.embeds[0].description.endsWith(`💬 **<@${A}>’s reply**\n> Still proud of it. \\*\\*bold\\*\\* \\<\\@123\\> \\[x\\](http://y) \\@everyone`));
  assert.deepEqual(card.components, []);
  assert.deepEqual(card.allowed_mentions, { parse: [] });
  assert.match(lastPrivate(h).content, /Your reply is on the card/);
});

test('write my own works inside the window, rejects blanks and impostors, is capped, and survives a restart', async () => {
  const h = harness();
  const card = await h.play([[A, 'lucky'], [B, 'energetic']]);
  const modal = await h.act(find(await h.click(card, A), 'Write my own'), A);
  assert.equal(modal.type, 9);
  const portrait = card.embeds[0].description;
  assert.match((await h.written(modal.data.custom_id, A, ' \n ')).data.content, /Write a reply first/);
  await h.written(modal.data.custom_id, B, 'Speaking for someone else.');
  assert.match(lastPrivate(h).content, new RegExp(`Only <@${A}> can reply`));
  assert.equal(card.embeds[0].description, portrait);
  h.portrait.dispose();
  h.portrait = createPortrait(h.config);
  // The card alone is enough to reopen quick replies while the window lasts.
  assert.ok(buttons(await h.click(card, A)).slice(0, 3).every(button => REPLIES.neutral.includes(button.label)));
  await h.written(modal.data.custom_id, A, 'x'.repeat(250));
  assert.equal(card.embeds[0].description, `${portrait}\n\n💬 **<@${A}>’s reply**\n> ${'x'.repeat(200)}`);
  assert.equal(h.tasks.size, 0);
  await h.written(modal.data.custom_id, A, 'A second opinion.');
  assert.match(lastPrivate(h).content, /already has a reply/);
  assert.doesNotMatch(card.embeds[0].description, /second opinion/);
  h.portrait.dispose();
});

test('a reply window never blocks the next round, and duplicate or failed posts cannot add a second reply', async () => {
  const h = harness();
  const first = await h.play([[A, 'supportive'], [B, 'funny']]);
  const second = await h.play([[A, 'reckless'], [B, 'hesitant']]);
  assert.notEqual(first.id, second.id);
  assert.match(second.components[0].components[0].custom_id, new RegExp(`:${B}:negative:`));
  const older = await h.click(first, A);
  const newer = await h.click(first, A);
  assert.match((await h.act(buttons(older)[0].custom_id, A)).data.content, /most recently opened/);
  const one = h.portrait.handle(body(buttons(newer)[0].custom_id, A));
  const two = h.portrait.handle(body(buttons(newer)[1].custom_id, A));
  assert.match(two.response.data.content, /already being posted/);
  assert.equal(two.afterReply, undefined);
  h.fail((path, options) => options.method === 'PATCH' && path.startsWith('channels/'));
  await one.afterReply();
  assert.match(lastPrivate(h).content, /Could not add your reply/);
  assert.equal(h.reports.length, 1);
  assert.doesNotMatch(first.embeds[0].description, /reply/);
  h.fail(null);
  const retry = await h.click(first, A);
  await h.act(buttons(retry)[0].custom_id, A);
  assert.match(first.embeds[0].description, new RegExp(`<@${A}>’s reply`));
  assert.equal((first.embeds[0].description.match(/’s reply/g) ?? []).length, 1);
  assert.equal(second.components[0].components[0].label, 'Reply');
  assert.doesNotMatch(second.embeds[0].description, /reply/);
  h.portrait.dispose();
});

test('replies still land when the bot may not read its own card back', async () => {
  const h = harness();
  h.fail((path, options) => options.method === 'GET');
  const quick = await h.play([[A, 'supportive'], [B, 'funny']]);
  await h.act(buttons(await h.click(quick, A))[0].custom_id, A);
  assert.match(quick.embeds[0].description, new RegExp(`<@${A}>’s reply`));
  // From a private panel, after the quick replies closed.
  const late = await h.play([[A, 'reckless'], [B, 'hesitant']]);
  const panel = await h.click(late, B);
  await h.advance(60_000);
  const fromPanel = await h.act(find(panel, 'Write my own'), B);
  await h.written(fromPanel.data.custom_id, B, 'Worth it.');
  assert.ok(late.embeds[0].description.endsWith(`<@${B}>’s reply**\n> Worth it.`));
  // From the card's own button after a restart, when only Discord remembers the card.
  const old = await h.play([[A, 'lucky'], [B, 'cautious']]);
  await h.advance(60_000);
  h.portrait.dispose();
  h.portrait = createPortrait(h.config);
  const fromCard = await h.click(old, A);
  await h.written(fromCard.data.custom_id, A, 'Lost and unreadable.');
  assert.match(lastPrivate(h).content, /Could not read the card/);
  await h.written(fromCard.data.custom_id, B, 'Not mine.', { message: structuredClone(old) });
  assert.match(lastPrivate(h).content, new RegExp(`Only <@${A}> can reply`));
  await h.written(fromCard.data.custom_id, A, 'Found it.', { message: structuredClone(old) });
  assert.ok(old.embeds[0].description.endsWith(`<@${A}>’s reply**\n> Found it.`));
  assert.deepEqual(old.components, []);
  h.portrait.dispose();
});
