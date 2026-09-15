import { randomBytes, randomInt } from 'node:crypto';

const closed = content => ({ content, components: [], allowed_mentions: { parse: [] } });
const reply = content => ({ response: { type: 4, data: { ...closed(content), flags: 64 } } });

export function createPicker({ api, roster, store, guildId, voiceChannelId, textChannelId,
  now = Date.now, choose = length => randomInt(length), schedule = setTimeout, unschedule = clearTimeout,
  report = () => console.error('Random Picker operation failed; check connection, permissions and data volume.'),
}) {
  let { seen, active: interrupted } = store.load();
  let active = null, healthy = true, recovering = Boolean(interrupted);
  const requests = new Map();
  function save() {
    try { store.save({ seen, active: active ? { channel: textChannelId, message: active.message ?? null } : null }); }
    catch (error) { healthy = false; throw error; }
  }
  function eligibility(body) {
    if (body.guild_id !== guildId) return 'Please use this panel in the configured server.';
    if (body.channel_id !== textChannelId) return `Please use the panel in <#${textChannelId}>.`;
    if (!healthy || recovering) return 'Random Picker is recovering. Please try again shortly.';
    const snapshot = roster.snapshot();
    if (!snapshot.ready) return 'The game voice channel is not ready. Please wait for the bot to reconnect.';
    if (!snapshot.ids.includes(body.member?.user?.id)) return `Join <#${voiceChannelId}> to participate.`;
    return null;
  }
  async function privateResult(body, content) {
    await api(`webhooks/${body.application_id}/${body.token}/messages/@original`, { method: 'PATCH', body: closed(content) });
  }
  function draw(round) {
    const snapshot = roster.snapshot();
    if (!snapshot.ready) return 'Random Picker ended because the voice connection was interrupted.';
    const candidates = snapshot.ids.filter(id => round.members.has(id) && !round.offered.has(id) && !round.departed.has(id));
    if (!candidates.length) return 'Random Picker ended. Everyone has passed or left the game voice channel.';
    let pool = candidates.filter(id => !seen.includes(id));
    if (!pool.length) { seen = []; pool = candidates; }
    round.target = pool[choose(pool.length)];
    round.offered.add(round.target);
    seen.push(round.target);
    round.revision++;
    round.deadline = now() + 60_000;
    save();
    return null;
  }
  function message(round) {
    return {
      content: `🎲 **Random Picker**\n<@${round.target}> has the opportunity to invite a friend!\nChoose **I'll Invite Someone** to finish, or **Pass / Draw Again**.\nOnly the selected player can choose. Closes <t:${Math.floor(round.deadline / 1000)}:R> if there is no response.`,
      allowed_mentions: { parse: [] },
      components: [{ type: 1, components: [
        { type: 2, style: 3, label: "I'll Invite Someone", custom_id: `mermer:picker:accept:${round.id}:${round.revision}` },
        { type: 2, style: 2, label: 'Pass / Draw Again', custom_id: `mermer:picker:pass:${round.id}:${round.revision}` },
      ] }],
    };
  }
  async function end(round, content) {
    if (active !== round || round.status === 'closing') return;
    round.status = 'closing'; unschedule(round.timer);
    try {
      if (round.message) await api(`channels/${textChannelId}/messages/${round.message}`, { method: 'PATCH', body: closed(content) });
    } catch { report(); }
    finally { active = null; try { save(); } catch { report(); } }
  }
  async function waitForChoice(round) {
    if (active !== round) return;
    const snapshot = roster.snapshot();
    if (!snapshot.ready || round.disconnected) return end(round, 'Random Picker ended because the voice connection was interrupted.');
    if (!snapshot.ids.includes(round.target) || round.departed.has(round.target)) return advance(round);
    round.status = 'waiting';
    const revision = round.revision;
    round.timer = schedule(() => {
      if (active === round && round.status === 'waiting' && round.revision === revision) {
        return end(round, 'Random Picker ended without a response. Start a new round from /social.');
      }
    }, Math.max(0, round.deadline - now()));
    round.timer?.unref?.();
  }
  async function advance(round) {
    round.status = 'updating'; unschedule(round.timer);
    try {
      const reason = draw(round);
      if (reason) return await end(round, reason);
      await api(`channels/${textChannelId}/messages/${round.message}`, { method: 'PATCH', body: message(round) });
      await waitForChoice(round);
    } catch {
      report();
      await end(round, 'Random Picker could not continue safely. Please start a new round later.');
    }
  }
  const unsubscribe = roster.subscribe(() => {
    const round = active;
    if (!round || round.status === 'closing') return;
    const snapshot = roster.snapshot();
    if (!snapshot.ready) round.disconnected = true;
    else for (const id of round.members) if (!snapshot.ids.includes(id)) round.departed.add(id);
    if (round.status === 'waiting') {
      if (round.disconnected) void end(round, 'Random Picker ended because the voice connection was interrupted.').catch(report);
      else if (round.departed.has(round.target)) void advance(round).catch(report);
    }
  });
  function start(body) {
    const error = eligibility(body);
    if (error) return reply(error);
    for (const [id, expires] of requests) if (expires <= now()) requests.delete(id);
    if (requests.has(body.id)) return reply('This request has already been handled. Please check the channel.');
    if (active) return reply('A Random Picker is already in progress.');
    if (requests.size >= 1000) return reply('Please try again shortly.');
    const previousSeen = [...seen];
    const round = { id: randomBytes(10).toString('hex'), members: new Set(roster.snapshot().ids),
      offered: new Set(), departed: new Set(), revision: 0, status: 'preparing' };
    active = round;
    try { draw(round); } catch { active = null; seen = previousSeen; report(); return reply('Random Picker could not save its state. Please check the data volume.'); }
    requests.set(body.id, now() + 15 * 60 * 1000);
    return {
      response: { type: 5, data: { flags: 64 } },
      afterReply: async () => {
        try {
          const sent = await api(`channels/${textChannelId}/messages`, { method: 'POST', body: { ...message(round), nonce: body.id, enforce_nonce: true } });
          round.message = sent.id; save();
          await waitForChoice(round);
        } catch (error) {
          if (!round.message && error.status && error.status < 500) seen = previousSeen;
          await end(round, 'Random Picker could not start safely. Please try again later.');
          await privateResult(body, 'Could not confirm the draw. Check the channel before trying again.');
          return;
        }
        await privateResult(body, 'Random Picker has been posted in this channel.');
      },
    };
  }
  function handle(body) {
    if (body.data?.custom_id === 'mermer:panel:picker') return start(body);
    const match = /^mermer:picker:(accept|pass):([a-f0-9]{20}):(\d+)$/.exec(body.data?.custom_id ?? '');
    if (!match) return reply('This picker button is no longer supported.');
    const error = eligibility(body);
    if (error) return reply(error);
    const round = active;
    if (!round || round.id !== match[2] || round.revision !== Number(match[3]) || now() >= round.deadline) return reply('This draw has closed or moved on. Use the current Random Picker message.');
    if (round.target !== body.member.user.id) return reply('Only the selected player can accept or pass.');
    if (round.status !== 'waiting') return reply('This choice is already being processed.');
    round.status = 'updating'; unschedule(round.timer); // Claim before acknowledging.
    return {
      response: { type: 5, data: { flags: 64 } },
      afterReply: async () => {
        if (match[1] === 'pass') await advance(round);
        else if (!roster.snapshot().ready || round.disconnected) await end(round, 'Random Picker ended because the voice connection was interrupted.');
        else if (!roster.snapshot().ids.includes(round.target) || round.departed.has(round.target)) await advance(round);
        else await end(round, `🎲 <@${round.target}> accepted the invitation opportunity. You can now invite your friend!\nRandom Picker complete.`);
        await privateResult(body, 'Your choice has been processed. Please check the channel.');
      },
    };
  }
  return {
    handle,
    async recover() {
      if (!interrupted) return;
      try {
        if (interrupted.message) await api(`channels/${interrupted.channel}/messages/${interrupted.message}`, {
          method: 'PATCH', body: closed('Random Picker ended when the bot restarted. Start a new round from /social.'),
        });
      } catch { report(); }
      finally { interrupted = null; recovering = false; save(); }
    },
    dispose() { unsubscribe(); if (active?.timer) unschedule(active.timer); },
  };
}
