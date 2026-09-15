import { randomBytes } from 'node:crypto';
import { getRandomExcuse } from './excuses.js';
import { PANEL_ACTIONS, panelMessage } from './panel.js';

const privateReply = content => ({ type: 4, data: { content, flags: 64, allowed_mentions: { parse: [] } } });
const update = content => ({ type: 7, data: { content, components: [], allowed_mentions: { parse: [] } } });

// Only private drafts live in memory. Restarts invalidate drafts, never the panel.
// Multiplayer sessions will require durable storage in the next implementation.
export function createInteractions({ api, resultChannelId, guildId, now = Date.now, randomExcuse = getRandomExcuse }) {
  const drafts = new Map();
  const socialRequests = new Map();
  const lifetime = 10 * 60 * 1000;

  function social(body) {
    if (!body.guild_id || (guildId && body.guild_id !== guildId)) {
      return { response: privateReply('Please use /social in the configured server.') };
    }
    for (const [id, expires] of socialRequests) if (expires <= now()) socialRequests.delete(id);
    const response = { type: 5, data: { flags: 64 } };
    if (socialRequests.has(body.id)) return { response };
    if (socialRequests.size >= 1000) return { response: privateReply('The bot is busy. Please try again shortly.') };
    socialRequests.set(body.id, now() + 15 * 60 * 1000);
    return {
      response,
      afterReply: async () => {
        let content;
        try {
          // A normal bot message has no command-response attribution. Never use
          // an interaction follow-up or reply reference for the public panel.
          await api(`channels/${body.channel_id}/messages`, { method: 'POST', body: {
            ...panelMessage(), nonce: body.id, enforce_nonce: true,
          } });
          content = 'The social panel is ready in this channel.';
        } catch (error) {
          content = error.status && error.status < 500
            ? 'Discord rejected the panel. Check the bot’s Send Messages and Embed Links permissions in this channel.'
            : 'Could not confirm delivery. Check this channel before trying /social again.';
        }
        await api(`webhooks/${body.application_id}/${body.token}/messages/@original`, {
          method: 'PATCH', body: { content, allowed_mentions: { parse: [] } },
        });
      },
    };
  }

  function preview(id, draft, initial) {
    return {
      type: initial ? 4 : 7,
      data: {
        ...(initial ? { flags: 64 } : {}),
        content: `🎭 **Your Funny Exit**\n> ${draft.text}\n\nSend will announce that you are leaving in <#${draft.targetChannel}>. Nothing is posted until you confirm.\nThis preview expires after 10 minutes.`,
        allowed_mentions: { parse: [] },
        components: [{ type: 1, components: [
          { type: 2, style: 3, label: 'Send', custom_id: `mermer:exit:send:${id}` },
          { type: 2, style: 2, label: 'Another One', custom_id: `mermer:exit:another:${id}` },
          { type: 2, style: 2, label: 'Cancel', custom_id: `mermer:exit:cancel:${id}` },
        ] }],
      },
    };
  }

  function start(body) {
    if (!body.guild_id || (guildId && body.guild_id !== guildId)) {
      return { response: privateReply('Please use the panel in the configured server.') };
    }
    for (const [id, draft] of drafts) if (draft.expires <= now()) drafts.delete(id);
    const owner = body.member?.user?.id ?? body.user?.id;
    // Re-delivery of the same interaction returns the same private draft.
    for (const [id, draft] of drafts) {
      if (draft.interactionId === body.id && draft.owner === owner) return { response: preview(id, draft, true) };
    }
    if (drafts.size >= 1000) return { response: privateReply('The bot is busy. Please try again shortly.') };
    const id = randomBytes(12).toString('hex');
    const draft = {
      owner, guild: body.guild_id, channel: body.channel_id,
      targetChannel: resultChannelId || body.channel_id,
      text: randomExcuse().text, expires: now() + lifetime,
      status: 'open', interactionId: body.id,
    };
    drafts.set(id, draft);
    return { response: preview(id, draft, true) };
  }

  return function handle(body) {
    if (body.type === 2 && body.data?.name === 'social') return social(body);
    const action = body.data?.custom_id;
    if ((body.type === 2 && body.data?.name === 'excuse') || action === PANEL_ACTIONS.exit) return start(body);
    if (action === PANEL_ACTIONS.portrait) return { response: privateReply('🎨 Collaborative Portrait is coming soon. No activity has started, and your click has not been announced.') };
    if (action === PANEL_ACTIONS.picker) return { response: privateReply('🎲 Random Picker is coming soon. No draw has started, and your click has not been announced.') };
    const match = /^mermer:exit:(send|another|cancel):([a-f0-9]{24})$/.exec(action ?? '');
    if (!match) return { response: privateReply('This button is no longer supported. Please use the control panel.') };
    const [, operation, id] = match;
    const draft = drafts.get(id);
    const owner = body.member?.user?.id ?? body.user?.id;
    if (!draft || draft.expires <= now()) return { response: update('This preview expired or the bot restarted. Open Funny Exit again.') };
    if (draft.owner !== owner || draft.channel !== body.channel_id || draft.guild !== body.guild_id) {
      return { response: privateReply('This preview belongs to another player or channel.') };
    }
    if (draft.status !== 'open') return { response: privateReply('This preview has already been handled. Please check the result channel.') };
    if (operation === 'cancel') {
      draft.status = 'cancelled';
      return { response: update('Cancelled. Nothing was posted.') };
    }
    if (operation === 'another') {
      for (let attempt = 0; attempt < 10; attempt++) {
        const next = randomExcuse().text;
        if (next !== draft.text) { draft.text = next; break; }
      }
      return { response: preview(id, draft, false) };
    }
    draft.status = 'sending'; // Claim synchronously, before any network awaits.
    return {
      response: { type: 6 }, // Acknowledge immediately; edit the private preview later.
      afterReply: async () => {
        let content;
        try {
          await api(`channels/${draft.targetChannel}/messages`, { method: 'POST', body: {
            content: `<@${draft.owner}> 不得不暂时下线：\n> ${draft.text}\n-# 不是不想玩，是宇宙不让。`,
            allowed_mentions: { parse: [], users: [draft.owner] },
            nonce: id, enforce_nonce: true,
          } });
          draft.status = 'sent';
          content = `Your exit message was sent to <#${draft.targetChannel}>.`;
        } catch (error) {
          // A timeout can mean Discord accepted the message. Never blindly resend.
          draft.status = 'failed';
          content = error.status && error.status < 500
            ? 'Discord rejected the message. Ask the team to check the bot’s channel permissions, then open a new preview.'
            : 'Could not confirm delivery. Check the result channel before opening another preview.';
        }
        await api(`webhooks/${body.application_id}/${body.token}/messages/@original`, {
          method: 'PATCH', body: update(content).data,
        });
      },
    };
  };
}
