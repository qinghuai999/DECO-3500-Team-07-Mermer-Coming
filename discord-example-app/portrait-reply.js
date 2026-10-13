import { REPLIES } from './portrait-text.js';

const mentions = { parse: [] };
const reply = content => ({ response: { type: 4, data: { content, flags: 64, allowed_mentions: mentions } } });
const closed = content => ({ content, components: [], embeds: [], allowed_mentions: mentions });
const cardButton = /^mermer:portrait:reply:([a-f0-9]{20}):(\d{17,20}):(positive|negative|neutral):(\d{1,15})$/;
const sent = '✅ Your reply is on the card.';
// A written reply is signed by its author, but it must not ping, mask a link or leave its quote line.
const clean = value => [...String(value ?? '').replace(/\s+/g, ' ').trim()].slice(0, 200).join('').replace(/[\\*_~`|>[\]<@]/g, '\\$&');
const keep = ({ title, description, color, author, footer }) => ({ title, description, color,
  author: author && { name: author.name }, footer: footer && { text: footer.text } });

// The result card is the source of truth: while it still carries its button, the selected player may reply.
// Suggested lines live in memory for 60 seconds; writing your own has no deadline and survives restarts.
export function createPortraitReply({ api, guildId, textChannelId, now, choose, schedule, unschedule, report }) {
  const sessions = new Map(), posting = new Map(), cards = new Map();
  const busy = message => (posting.get(message) ?? 0) > now();
  // A claim expires by itself, so a lost HTTP reply cannot lock a card forever.
  function claim(message) {
    for (const [id, expires] of posting) if (expires <= now()) posting.delete(id);
    posting.set(message, now() + 30_000);
  }
  const prompt = (session, open) => open
    ? `<@${session.target}>, how does this sound? Quick replies close <t:${Math.floor(session.deadline / 1000)}:R>.`
    : `Quick replies have closed. <@${session.target}> can still write a reply.`;
  const button = (session, open) => ({ type: 1, components: [{ type: 2, style: open ? 1 : 2,
    label: open ? 'Reply' : 'Write a reply', emoji: { name: open ? '💬' : '✍️' },
    custom_id: `mermer:portrait:reply:${session.id}:${session.target}:${session.tone}:${session.deadline}` }] });
  const writeButton = message => ({ type: 2, style: 2, label: 'Write my own', emoji: { name: '✍️' }, custom_id: `mermer:portrait:write:${message}` });
  const modal = message => ({ response: { type: 9, data: { custom_id: `mermer:portrait:own:${message}`, title: 'Reply to your portrait',
    components: [{ type: 1, components: [{ type: 4, custom_id: 'text', style: 1, label: 'Your reply, posted under your name',
      min_length: 1, max_length: 200, required: true, placeholder: 'Bold words from people who followed me into that room.' }] }] } } });

  async function editPrivate(body, content, components = []) {
    await api(`webhooks/${body.application_id}/${body.token}/messages/@original`, { method: 'PATCH', body: { ...closed(content), components } });
  }
  async function updatePanels(session, content, components) {
    await Promise.all([...session.panels.values()].filter(panel => panel.ready).map(async panel => {
      try { await editPrivate(panel, content, components); } catch { report(); }
    }));
  }
  function open({ id, target, message, tone, embed, deadline = now() + 60_000 }) {
    // Shuffle once, so Another batch walks through all ten lines before any repeats.
    const order = REPLIES[tone].map((_, index) => index);
    for (let last = order.length - 1; last > 0; last--) {
      const pick = choose(last + 1);
      [order[last], order[pick]] = [order[pick], order[last]];
    }
    const session = { id, target, message, tone, embed, deadline, order, offset: 0, version: 0, panels: new Map() };
    sessions.set(id, session);
    // Private panels outlive the quick replies, so their Write my own still knows its card for a while.
    for (const [key, item] of cards) if (item.deadline + 15 * 60_000 <= now()) cards.delete(key);
    cards.set(message, session);
    session.timer = schedule(() => expire(session).catch(report), Math.max(0, deadline - now()));
    session.timer?.unref?.();
    return session;
  }
  function end(session, outcome) {
    session.outcome = outcome;
    unschedule(session.timer);
    if (sessions.get(session.id) === session) sessions.delete(session.id);
  }
  const ending = session => session.outcome === 'replied' ? [sent]
    : ['Quick replies have closed. You can still write your own.', [{ type: 1, components: [writeButton(session.message)] }]];
  // No reply is a valid answer: the window closes without any public "did not respond" note.
  async function expire(session) {
    if (sessions.get(session.id) !== session) return;
    end(session, 'expired');
    // A reply already on its way to the card replaces the prompt by itself.
    if (busy(session.message)) return;
    try {
      // Omitting embeds leaves the portrait untouched.
      await api(`channels/${textChannelId}/messages/${session.message}`, { method: 'PATCH',
        body: { content: prompt(session, false), components: [button(session, false)], allowed_mentions: mentions } });
    } catch { report(); }
    await updatePanels(session, ...ending(session));
  }
  const known = session => session?.embed && { components: [button(session, true)], embeds: [session.embed] };
  // Reads the card first, so a reply can never be added twice or by anyone but the selected player.
  async function post(message, user, text, seen) {
    try {
      // Without Read Message History the bot cannot read its card back; use what this interaction already showed.
      const card = await api(`channels/${textChannelId}/messages/${message}`, { method: 'GET' }).catch(() => seen);
      if (!card) return 'Could not read the card. Use the button on the card itself.';
      const found = card?.components?.flatMap(row => row.components ?? []).map(item => cardButton.exec(item.custom_id ?? '')).find(Boolean);
      const embed = card?.embeds?.[0];
      if (!found || !embed) return 'This portrait already has a reply, or is no longer open.';
      if (found[2] !== user) return `Only <@${found[2]}> can reply to this portrait.`;
      await api(`channels/${textChannelId}/messages/${message}`, { method: 'PATCH', body: { ...closed(''),
        embeds: [{ ...keep(embed), description: `${embed.description}\n\n💬 **<@${user}>’s reply**\n> ${text}` }] } });
      cards.delete(message);
      const session = sessions.get(found[1]);
      if (session) { end(session, 'replied'); await updatePanels(session, ...ending(session)); }
      return sent;
    } catch {
      // A timed-out edit may have succeeded; the next attempt re-reads the card before writing.
      report();
      return 'Could not add your reply. Check the card before trying again.';
    } finally { posting.delete(message); }
  }

  const visible = session => [0, 1, 2].map(step => session.order[(session.offset + step) % session.order.length]);
  function suggestions(session, body, initial) {
    const id = operation => `mermer:portrait:${operation}:${session.id}:${session.version}`;
    const rendered = { response: { type: initial ? 4 : 7, data: {
      ...(initial ? { flags: 64 } : {}),
      content: `💬 **Pick a reply to your portrait**\nClicking a line posts it on the card under your name. Quick replies close <t:${Math.floor(session.deadline / 1000)}:R>.`,
      allowed_mentions: mentions,
      components: [
        ...visible(session).map(index => ({ type: 1, components: [{ type: 2, style: 2, label: REPLIES[session.tone][index], custom_id: `${id('say')}:${index}` }] })),
        { type: 1, components: [{ type: 2, style: 2, label: 'Another batch', emoji: { name: '🔄' }, custom_id: id('batch') }, writeButton(session.message)] },
      ],
    } } };
    if (initial) {
      const panel = { application_id: body.application_id, token: body.token, ready: false };
      session.panels.set(body.token, panel);
      rendered.afterReply = async () => {
        panel.ready = true;
        // The window can close while the HTTP response is being delivered.
        if (session.outcome) { try { await editPrivate(panel, ...ending(session)); } catch { report(); } }
      };
    }
    return rendered;
  }
  function fromCard(body, user) {
    const match = cardButton.exec(body.data.custom_id);
    const message = body.message?.id;
    if (!match || !/^\d{17,20}$/.test(message ?? '')) return reply('This reply button is no longer supported.');
    const [, id, target, tone, deadline] = match;
    if (user !== target) return reply(`Only <@${target}> can reply to this portrait.`);
    if (busy(message)) return reply('Your reply is already being posted.');
    if (now() >= Number(deadline)) return modal(message);
    // After a restart the card itself still says which quick replies to reopen, and until when.
    const session = sessions.get(id) ?? open({ id, target, message, tone, embed: body.message.embeds?.[0], deadline: Number(deadline) });
    session.version++;
    return suggestions(session, body, true);
  }
  function quick(body, user, operation, [id, version, index]) {
    const stop = content => ({ response: { type: 7, data: closed(content) } });
    const session = sessions.get(id);
    if (!session || now() >= session.deadline) return stop('These quick replies are no longer available. Check the card.');
    if (user !== session.target) return reply(`Only <@${session.target}> can reply to this portrait.`);
    if (String(session.version) !== version) return reply('Please use your most recently opened reply panel.');
    if (operation === 'batch') {
      session.offset = (session.offset + 3) % session.order.length;
      session.version++;
      return suggestions(session, body, false);
    }
    if (!/^\d$/.test(index ?? '') || !visible(session).includes(Number(index))) return reply('Please choose one of the displayed replies.');
    if (busy(session.message)) return stop('Your reply is already being posted.');
    claim(session.message); // Claim synchronously, before any network awaits.
    const text = REPLIES[session.tone][Number(index)];
    return { response: { type: 7, data: closed('Posting your reply…') },
      afterReply: async () => editPrivate(body, await post(session.message, user, text, known(session))) };
  }
  function own(body, user, message) {
    const text = clean(body.data.components?.[0]?.components?.[0]?.value);
    if (!text) return reply('Write a reply first.');
    if (busy(message)) return reply('Your reply is already being posted.');
    claim(message);
    return { response: { type: 5, data: { flags: 64 } },
      afterReply: async () => editPrivate(body, await post(message, user, text, body.message?.id === message ? body.message : known(cards.get(message)))) };
  }

  return {
    // Returns the prompt and button that the result card should carry.
    offer(round) {
      const session = open(round);
      return { content: prompt(session, true), components: [button(session, true)] };
    },
    cancel(id) { const session = sessions.get(id); if (session) { end(session, 'expired'); cards.delete(session.message); } },
    handle(body) {
      if (body.guild_id !== guildId || body.channel_id !== textChannelId) return reply(`Please use this in <#${textChannelId}>.`);
      const [, , operation, ...rest] = (body.data?.custom_id ?? '').split(':');
      const user = body.member?.user?.id;
      if (operation === 'reply') return fromCard(body, user);
      if (operation === 'say' || operation === 'batch') return quick(body, user, operation, rest);
      if (rest.length === 1 && /^\d{17,20}$/.test(rest[0])) {
        if (operation === 'write') return modal(rest[0]);
        if (operation === 'own') return own(body, user, rest[0]);
      }
      return reply('This reply button is no longer supported.');
    },
    dispose() { for (const session of sessions.values()) unschedule(session.timer); sessions.clear(); cards.clear(); },
  };
}
