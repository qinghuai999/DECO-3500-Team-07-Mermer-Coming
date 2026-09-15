import { randomBytes, randomInt } from 'node:crypto';
import { WORD_GROUPS, portraitText } from './portrait-text.js';

const mentions = { parse: [] };
const reply = content => ({ response: { type: 4, data: { content, flags: 64, allowed_mentions: mentions } } });
const closed = content => ({ content, components: [], embeds: [], allowed_mentions: mentions });

export function createPortrait({ api, roster, store, guildId, voiceChannelId, textChannelId,
  now = Date.now, choose = length => randomInt(length), schedule = setTimeout, unschedule = clearTimeout,
  report = () => console.error('Portrait operation failed; check permissions, connection and state volume.'),
}) {
  let { seen, active: interrupted } = store.load();
  let active = null, healthy = true, recovering = Boolean(interrupted);
  const requests = new Map();
  function save(round = active) {
    try {
      store.save({ seen, active: round ? { channel: round.channel, message: round.message ?? null } : null });
    } catch (error) { healthy = false; throw error; }
  }
  function eligibility(body) {
    if (body.guild_id !== guildId) return 'Please use this panel in the configured server.';
    if (body.channel_id !== textChannelId) return `Please use the panel in <#${textChannelId}>.`;
    if (!healthy || recovering) return 'Player Portrait is recovering. Please try again shortly.';
    const snapshot = roster.snapshot();
    if (!snapshot.ready) return 'The game voice channel is not ready. Please wait for the bot to reconnect, or check its channel access.';
    if (!snapshot.ids.includes(body.member?.user?.id)) return `Join <#${voiceChannelId}> to participate.`;
    return null;
  }
  async function editPrivate(body, content) {
    await api(`webhooks/${body.application_id}/${body.token}/messages/@original`, { method: 'PATCH', body: closed(content) });
  }
  function privateStatus(round, user) {
    if (round.cancelReason) return 'This round has ended. Start a new Player Portrait from /social.';
    if (round.submitted.has(user)) return `✅ Submitted: **${round.submitted.get(user)}**. ${round.status === 'open' ? 'Waiting for the other players.' : 'This round has ended.'}`;
    return 'This round has ended. No word was submitted.';
  }
  async function cleanPanels(round, user) {
    await Promise.all([...round.panels.values()].filter(panel => panel.ready && (!user || panel.user === user)).map(async panel => {
      try { await editPrivate(panel, privateStatus(round, panel.user)); }
      catch { report(); }
    }));
  }
  function allSubmitted(round) {
    const snapshot = roster.snapshot();
    return snapshot.ready && snapshot.ids.includes(round.target)
      && snapshot.ids.filter(id => round.participants.has(id)).every(id => round.submitted.has(id));
  }
  function privateView(round, user, body, initial) {
    const rendered = view(round, user, initial);
    let panel;
    if (initial) {
      panel = { application_id: body.application_id, token: body.token, user, ready: false };
      round.panels.set(body.token, panel);
    }
    rendered.afterReply = async () => {
      if (panel) panel.ready = true;
      // The deadline can pass while the HTTP response is being delivered.
      if (round.status !== 'open' || round.submitted.has(user)) {
        if (panel) { try { await editPrivate(panel, privateStatus(round, user)); } catch { report(); } }
        else await editPrivate(body, privateStatus(round, user));
      }
    };
    return rendered;
  }
  async function finish(round, reason) {
    if (active !== round || round.status !== 'open') return;
    round.status = 'closing';
    unschedule(round.timer);
    const snapshot = roster.snapshot();
    let content = reason;
    if (!content && !snapshot.ready) content = 'Player Portrait ended because the voice connection was interrupted. Please try again.';
    if (!content && !snapshot.ids.includes(round.target)) content = 'Player Portrait ended because the selected player left the game voice channel.';
    round.cancelReason = content;
    if (!content) {
      const words = [...round.choices].filter(([user]) => snapshot.ids.includes(user)).map(([, word]) => word);
      const result = portraitText(words);
      content = `🎨 **Player Portrait: <@${round.target}>**\n**${result.title}**\n${result.sentence}`;
    }
    try {
      // Editing a normal bot message does not expose who triggered the round.
      await api(`channels/${round.channel}/messages/${round.message}`, { method: 'PATCH', body: closed(content) });
    } catch { report(); }
    finally {
      await cleanPanels(round);
      round.choices.clear(); round.views.clear();
      round.panels.clear();
      active = null;
      try { save(); } catch { report(); }
    }
  }
  const unsubscribe = roster.subscribe(() => {
    const round = active;
    if (!round || round.status === 'closing') return;
    const snapshot = roster.snapshot();
    if (!snapshot.ready) round.cancelReason = 'Player Portrait ended because the voice connection was interrupted. Please try again.';
    else if (!snapshot.ids.includes(round.target)) round.cancelReason = 'Player Portrait ended because the selected player left the game voice channel.';
    // Leaving loses this round's selection; rejoining cannot restore a stale vote.
    if (snapshot.ready) for (const user of round.choices.keys()) {
      if (!snapshot.ids.includes(user)) round.choices.delete(user);
    }
    if (round.status === 'open' && (round.cancelReason || allSubmitted(round))) void finish(round, round.cancelReason).catch(report);
  });

  function start(body) {
    const error = eligibility(body);
    if (error) return reply(error);
    for (const [id, expires] of requests) if (expires <= now()) requests.delete(id);
    if (requests.has(body.id)) return reply('This request has already been handled. Please check the channel.');
    if (active) return reply('A Player Portrait is already in progress.');
    if (requests.size >= 1000) return reply('Please try again shortly.');
    const ids = [...new Set(roster.snapshot().ids)];
    let pool = ids.filter(id => !seen.includes(id));
    const previousSeen = [...seen];
    if (!pool.length) { seen = []; pool = ids; }
    const target = pool[choose(pool.length)];
    const round = { id: randomBytes(10).toString('hex'), channel: body.channel_id,
      target, participants: new Set(ids), choices: new Map(), submitted: new Map(), views: new Map(), panels: new Map(), status: 'preparing' };
    seen.push(target);
    active = round;
    try { save(); } catch { active = null; seen = previousSeen; report(); return reply('Player Portrait could not save its state. Please ask the developer to check the data volume.'); }
    requests.set(body.id, now() + 15 * 60 * 1000);
    return {
      response: { type: 5, data: { flags: 64 } },
      afterReply: async () => {
        try {
          round.deadline = now() + 10_000;
          const message = await api(`channels/${round.channel}/messages`, { method: 'POST', body: {
            content: `🎨 **Player Portrait: <@${target}>**\nChoose one word to submit immediately. The player can take part too!\nCloses when everyone submits, or <t:${Math.floor(round.deadline / 1000)}:R>. No selection is also fine.`,
            allowed_mentions: mentions, nonce: body.id, enforce_nonce: true,
            components: [{ type: 1, components: [{ type: 2, style: 1, label: 'Choose a Word', custom_id: `mermer:portrait:open:${round.id}` }] }],
          } });
          round.message = message.id;
          save(round);
          round.status = 'open';
          const snapshot = roster.snapshot();
          if (!snapshot.ready) round.cancelReason = 'Player Portrait ended because the voice connection was interrupted. Please try again.';
          else if (!snapshot.ids.includes(target)) round.cancelReason = 'Player Portrait ended because the selected player left the game voice channel.';
          if (round.cancelReason) await finish(round, round.cancelReason);
          else {
            round.timer = schedule(() => finish(round).catch(report), Math.max(0, round.deadline - now()));
            round.timer?.unref?.();
          }
        } catch (error) {
          // A timed-out POST may have succeeded; never repeat it automatically.
          if (round.message) {
            round.status = 'open';
            await finish(round, 'Player Portrait could not start safely. Please try again later.');
          } else {
            active = null;
            if (error.status && error.status < 500) seen = previousSeen;
            try { save(); } catch { report(); }
          }
          await editPrivate(body, 'Could not start Player Portrait. Check the channel before trying again.');
          return;
        }
        await editPrivate(body, 'Player Portrait has been posted in this channel.');
      },
    };
  }

  function view(round, user, initial) {
    const current = round.views.get(user);
    return { response: { type: initial ? 4 : 7, data: {
      ...(initial ? { flags: 64 } : {}),
      content: `🎨 Describe <@${round.target}>'s gameplay.\nChoose one word to submit immediately. You cannot change it after submitting.\nRefresh before choosing, or leave this blank. Closes <t:${Math.floor(round.deadline / 1000)}:R>.`,
      allowed_mentions: mentions,
      components: [
        { type: 1, components: [{ type: 3, custom_id: `mermer:portrait:select:${round.id}:${current.version}`,
          placeholder: 'Choose a word to submit', min_values: 1, max_values: 1,
          options: WORD_GROUPS[current.group].map(word => ({ label: word, value: word })),
        }] },
        { type: 1, components: [{ type: 2, style: 2, label: 'Refresh', custom_id: `mermer:portrait:refresh:${round.id}:${current.version}` }] },
      ],
    } } };
  }
  function handle(body) {
    if (body.data?.custom_id === 'mermer:panel:portrait') return start(body);
    const match = /^mermer:portrait:(open|select|refresh):([a-f0-9]{20})(?::(\d+))?$/.exec(body.data?.custom_id ?? '');
    if (!match) return reply('This portrait button is no longer supported.');
    const terminal = content => match[1] === 'open' ? reply(content) : { response: { type: 7, data: closed(content) } };
    const error = eligibility(body);
    if (error) return terminal(error);
    const round = active;
    if (!round || round.id !== match[2] || round.status !== 'open' || now() >= round.deadline) {
      return terminal('This round has closed. Open a new Player Portrait from /social.');
    }
    const user = body.member.user.id;
    if (!round.participants.has(user)) return reply('You joined after this round started. You can take part in the next round.');
    if (round.submitted.has(user)) return terminal(privateStatus(round, user));
    const previous = round.views.get(user);
    if (match[1] === 'open') {
      round.views.set(user, { group: previous?.group ?? 0, version: (previous?.version ?? 0) + 1 });
      return privateView(round, user, body, true);
    }
    if (!previous || String(previous.version) !== match[3]) return reply('Please use your most recently opened word selector.');
    if (match[1] === 'refresh') previous.group = (previous.group + 1) % WORD_GROUPS.length;
    else {
      const values = body.data.values;
      if (!Array.isArray(values) || values.length !== 1 || !WORD_GROUPS[previous.group].includes(values[0])) {
        return reply('Please choose one of the displayed words.');
      }
      round.choices.set(user, values[0]);
      round.submitted.set(user, values[0]);
      return {
        response: { type: 7, data: closed(`✅ Submitted: **${values[0]}**. ${allSubmitted(round) ? 'The portrait is ready to reveal.' : 'Waiting for the other players.'}`) },
        afterReply: async () => {
          if (round.status === 'open' && allSubmitted(round)) await finish(round);
          else await cleanPanels(round, user);
        },
      };
    }
    previous.version++;
    return privateView(round, user, body, false);
  }
  return {
    handle, eligibility,
    async recover() {
      if (!interrupted) return;
      try {
        if (interrupted.message) await api(`channels/${interrupted.channel}/messages/${interrupted.message}`, {
          method: 'PATCH', body: closed('This Player Portrait ended when the bot restarted. Start a new round from /social.'),
        });
      } catch { report(); }
      finally { interrupted = null; recovering = false; save(null); }
    },
    dispose() { unsubscribe(); if (active?.timer) unschedule(active.timer); },
  };
}
