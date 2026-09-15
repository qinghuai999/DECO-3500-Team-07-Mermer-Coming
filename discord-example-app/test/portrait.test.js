import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPortrait } from '../portrait.js';
import { createPortraitStore } from '../portrait-store.js';
import { portraitText, WORDS } from '../portrait-text.js';
import { createInteractions } from '../interactions.js';

const guildId = '1542404404680982550', voiceChannelId = '1542404405301878860', textChannelId = '100000000000000001';
const A = '100000000000000010', B = '100000000000000011', C = '100000000000000012';
let nextId = 100000000000000100n;
function body(action = 'mermer:panel:portrait', user = B, values) {
  return { id: String(nextId++), type: 3, guild_id: guildId, channel_id: textChannelId,
    application_id: '100000000000000020', token: 'private-test-token',
    member: { user: { id: user } }, data: { custom_id: action, ...(values ? { values } : {}) } };
}
function harness({ saved, apiHook, saveHook } = {}) {
  let clock = 100_000, ids = [A, B], ready = true, state = saved ?? { seen: [], active: null };
  const listeners = new Set(), tasks = new Set(), calls = [], reports = [];
  const store = { load: () => structuredClone(state), save: data => { saveHook?.(data); state = structuredClone(data); } };
  const roster = {
    snapshot: () => ({ ready, ids: [...ids] }),
    subscribe: fn => { listeners.add(fn); return () => listeners.delete(fn); },
  };
  const config = { guildId, voiceChannelId, textChannelId, roster, store, now: () => clock, choose: () => 0,
    api: async (path, options) => {
      calls.push({ path, ...structuredClone(options) });
      await apiHook?.(path, options);
      return { id: String(nextId++) };
    },
    schedule: (fn, delay) => { const task = { fn, due: clock + delay }; tasks.add(task); return task; },
    unschedule: task => tasks.delete(task), report: () => reports.push('error'),
  };
  const portrait = createPortrait(config);
  return { portrait, config, calls, reports, store, tasks,
    state: () => state,
    async advance(ms) { clock += ms; for (const task of [...tasks]) if (task.due <= clock) { tasks.delete(task); await task.fn(); } },
    change(next, connected = true) { ids = next; ready = connected; for (const fn of listeners) fn(); },
    async start(user = B) {
      const response = portrait.handle(body(undefined, user));
      if (response.afterReply) await response.afterReply();
      return response;
    },
    open(user = B) {
      const prompt = calls.findLast(call => call.method === 'POST');
      return portrait.handle(body(prompt.body.components[0].components[0].custom_id, user)).response;
    },
  };
}
const select = view => view.data.components[0].components[0].custom_id;
const refresh = view => view.data.components[1].components[0].custom_id;
const result = h => h.calls.findLast(call => call.path.startsWith('channels/') && call.method === 'PATCH');

test('all 256 vocabulary combinations produce deterministic English prose including every valid word', () => {
  for (let mask = 0; mask < 1 << WORDS.length; mask++) {
    const words = WORDS.filter((_, i) => mask & (1 << i));
    const output = portraitText(words);
    assert.deepEqual(output, portraitText([...words].reverse().concat(words)));
    assert.doesNotMatch(JSON.stringify(output), /\p{Script=Han}/u);
    assert.ok(output.title && output.sentence && output.sentence.length < 1500);
    for (const word of words) assert.ok(output.sentence.includes(word));
  }
  assert.equal(portraitText(['lucky', 'adventurous']).title, 'The Accidental Expedition Leader');
  assert.deepEqual(portraitText(['untrusted insult']), portraitText([]));
});

test('only bound voice members in the bound text channel may start; disconnects fail closed', () => {
  const h = harness();
  for (const request of [body(undefined, C), { ...body(), guild_id: 'wrong' }, { ...body(), channel_id: 'wrong' }]) {
    const response = h.portrait.handle(request);
    assert.equal(response.response.data.flags, 64);
    assert.equal(response.afterReply, undefined);
  }
  h.change([A, B], false);
  assert.match(h.portrait.handle(body()).response.data.content, /not ready/);
  assert.equal(h.calls.length, 0);
});

test('anonymous start is acknowledged before publishing; simultaneous and replayed triggers do not duplicate rounds', async () => {
  const h = harness();
  const request = body();
  const start = h.portrait.handle(request);
  assert.deepEqual(start.response, { type: 5, data: { flags: 64 } });
  assert.equal(h.calls.length, 0);
  assert.match(h.portrait.handle(body()).response.data.content, /already in progress/);
  await start.afterReply();
  const publicMessage = h.calls[0];
  assert.equal(publicMessage.path, `channels/${textChannelId}/messages`);
  assert.match(publicMessage.body.content, new RegExp(A));
  assert.equal(JSON.stringify(publicMessage.body).includes(B), false);
  assert.equal(publicMessage.body.message_reference, undefined);
  assert.equal(publicMessage.body.interaction_metadata, undefined);
  assert.deepEqual(publicMessage.body.allowed_mentions, { parse: [] });
  assert.equal(publicMessage.body.enforce_nonce, true);
  await h.advance(10_000);
  assert.equal(h.portrait.handle(request).afterReply, undefined);
  assert.equal(h.calls.filter(call => call.method === 'POST').length, 1);
});

test('private self-evaluation, refresh, one final word, late click and neutral blanks obey a fixed 10-second deadline', async () => {
  const h = harness();
  await h.start();
  let view = h.open(A);
  assert.equal(view.data.flags, 64);
  const stale = select(view);
  view = h.portrait.handle(body(select(view), A, ['lucky'])).response;
  assert.equal(view.type, 7);
  assert.match(h.portrait.handle(body(stale, A, ['steady'])).response.data.content, /most recently/);
  const deadline = [...h.tasks][0].due;
  await h.advance(9000);
  view = h.portrait.handle(body(refresh(view), A)).response;
  assert.equal([...h.tasks][0].due, deadline);
  assert.match(view.data.content, /lucky/); // Refresh keeps the current selection.
  assert.match(h.portrait.handle(body(select(view), A, ['injected'])).response.data.content, /displayed words/);
  assert.match(h.portrait.handle(body(select(view), A, ['clutch', 'creative'])).response.data.content, /displayed words/);
  view = h.portrait.handle(body(select(view), A, ['creative'])).response;
  const late = select(view);
  await h.advance(1000);
  assert.match(result(h).body.content, /creative/);
  assert.doesNotMatch(result(h).body.content, /lucky/);
  assert.deepEqual(result(h).body.components, []);
  assert.match(h.portrait.handle(body(late, A, ['clutch'])).response.data.content, /closed/);
  await h.start();
  await h.advance(10_000);
  assert.match(result(h).body.content, /Intergalactic Loading Screen/);
});

test('new members wait until next round; leaving voters lose their word; target leaving cancels and unlocks', async () => {
  const h = harness();
  await h.start();
  const view = h.open(B);
  h.portrait.handle(body(select(view), B, ['lucky']));
  h.change([A, B, C]);
  assert.match(h.open(C).data.content, /next round/);
  h.change([A, C]);
  h.change([A, B, C]);
  await h.advance(10_000);
  assert.match(result(h).body.content, /Intergalactic Loading Screen/);
  await h.start(); // B is selected in the same fair rotation.
  h.change([A, C]);
  await new Promise(resolve => setImmediate(resolve));
  assert.match(result(h).body.content, /selected player left/);
  assert.equal(h.state().active, null);
  assert.equal(h.tasks.size, 0);
  assert.ok((await h.start(A)).afterReply);
  h.portrait.dispose();
});

test('fair rotation survives restart and interrupted messages are closed without storing private selections', async () => {
  const h = harness();
  await h.start();
  h.portrait.handle(body(select(h.open(B)), B, ['lucky']));
  assert.equal(JSON.stringify(h.state()).includes('lucky'), false);
  assert.equal(JSON.stringify(h.state()).includes('private-test-token'), false);
  h.portrait.dispose();
  const restored = createPortrait(h.config);
  assert.match(restored.handle(body()).response.data.content, /recovering/);
  await restored.recover();
  assert.match(result(h).body.content, /restarted/);
  await restored.handle(body()).afterReply();
  assert.match(h.calls.findLast(call => call.method === 'POST').body.content, new RegExp(B));
  restored.dispose();
});

test('publication failure, final edit failure, and lost Gateway connection cannot leave an active lock', async () => {
  let failPost = true, failPatch = false;
  const h = harness({ apiHook: (_path, options) => {
    if ((failPost && options.method === 'POST') || (failPatch && options.method === 'PATCH')) throw Object.assign(new Error('denied'), { status: 403 });
  } });
  await h.start();
  assert.equal(h.state().active, null);
  assert.deepEqual(h.state().seen, []);
  failPost = false;
  await h.start();
  failPatch = true;
  await h.advance(10_000);
  assert.equal(h.state().active, null);
  failPatch = false;
  await h.start();
  h.change([A, B], false);
  await new Promise(resolve => setImmediate(resolve));
  assert.match(result(h).body.content, /interrupted/);
  assert.equal(h.state().active, null);
  h.change([A, B]);
  assert.ok((await h.start()).afterReply);
  h.portrait.dispose();
});

test('storage failure prevents a public round and disables unsafe further starts', () => {
  const h = harness({ saveHook: () => { throw new Error('disk full'); } });
  assert.equal(h.portrait.handle(body()).response.data.flags, 64);
  assert.equal(h.calls.length, 0);
  assert.match(h.portrait.handle(body()).response.data.content, /recovering/);
});

test('state file is persistent, scoped and refuses corrupt data rather than silently resetting fairness', () => {
  const dir = mkdtempSync(join(tmpdir(), 'mermer-portrait-'));
  try {
    const store = createPortraitStore(dir, `${guildId}:${voiceChannelId}`);
    store.save({ seen: [A], active: { channel: textChannelId, message: '100000000000000999' } });
    assert.deepEqual(createPortraitStore(dir, `${guildId}:${voiceChannelId}`).load().seen, [A]);
    assert.throws(() => createPortraitStore(dir, 'wrong-scope').load(), /different channel/);
    assert.equal(readFileSync(join(dir, 'portrait-state.json'), 'utf8').includes('token'), false);
  } finally { rmSync(dir, { recursive: true }); }
});

test('main interaction router dispatches portrait buttons and restricts future picker to voice members', async () => {
  const h = harness();
  const handle = createInteractions({ api: h.config.api, guildId, portrait: h.portrait });
  const started = handle(body());
  assert.equal(started.response.type, 5);
  await started.afterReply();
  assert.match(handle(body('mermer:panel:picker', C)).response.data.content, /Join/);
  assert.match(handle(body('mermer:panel:picker', B)).response.data.content, /coming soon/);
  h.portrait.dispose();
});
