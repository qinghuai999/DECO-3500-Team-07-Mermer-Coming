export const PANEL_MARKER = 'mermer:team-social-panel:v1';
export const PANEL_ACTIONS = {
  exit: 'mermer:panel:exit',
  portrait: 'mermer:panel:portrait',
  picker: 'mermer:panel:picker',
};

export function panelMessage() {
  return {
    content: '',
    allowed_mentions: { parse: [] },
    embeds: [{
      title: 'TEAM SOCIAL PANEL',
      description: 'Leave · Express · Decide\nChoose a button to get started. Your first response is visible only to you.',
      color: 0x5865f2,
      fields: [
        { name: '🎭 Funny Exit', value: 'Find a playful way to leave. Preview privately, then send when you are ready.' },
        { name: '🎨 Collaborative Portrait', value: 'Join the game voice channel. Choose a word to submit immediately; the portrait appears when everyone submits or after 10 seconds.' },
        { name: '🎲 Random Picker', value: 'Join the game voice channel. Take turns getting the opportunity to invite a friend, or pass to another player.' },
      ],
      footer: { text: PANEL_MARKER },
    }],
    components: [{ type: 1, components: [
      { type: 2, style: 1, custom_id: PANEL_ACTIONS.exit, label: 'Funny Exit', emoji: { name: '🎭' } },
      { type: 2, style: 2, custom_id: PANEL_ACTIONS.portrait, label: 'Collaborative Portrait', emoji: { name: '🎨' } },
      { type: 2, style: 2, custom_id: PANEL_ACTIONS.picker, label: 'Random Picker', emoji: { name: '🎲' } },
    ] }],
  };
}

export function isPanel(message, botId) {
  return message.author?.id === botId && message.embeds?.some(embed => embed.footer?.text === PANEL_MARKER);
}

// Deployment-only operation. Never run this automatically on application boot.
// Run only one publisher at a time for a given channel.
export async function publishPanel({ api, channelId, guildId, messageId }) {
  if (!/^\d{17,20}$/.test(channelId ?? '')) throw new Error('PANEL_CHANNEL_ID must be a Discord channel ID.');
  if (messageId && !/^\d{17,20}$/.test(messageId)) throw new Error('Invalid PANEL_MESSAGE_ID.');
  if (!/^\d{17,20}$/.test(guildId ?? '')) throw new Error('GUILD_ID must be a Discord server ID.');
  const bot = await api('users/@me');
  const channel = await api(`channels/${channelId}`);
  if (channel.guild_id !== guildId || channel.type !== 0) {
    throw new Error('Choose a regular text channel in GUILD_ID.');
  }
  let existing;
  if (messageId) {
    existing = await api(`channels/${channelId}/messages/${messageId}`);
    if (!isPanel(existing, bot.id)) throw new Error('PANEL_MESSAGE_ID is not this bot’s control panel.');
  } else {
    // Search history, including an unpinned message left by a failed pin attempt.
    // A bound prevents a mistaken channel from causing an unbounded scan.
    let before;
    for (let page = 0; page < 100; page++) {
      const messages = await api(`channels/${channelId}/messages?limit=100${before ? `&before=${before}` : ''}`);
      existing = messages.find(message => isPanel(message, bot.id));
      if (existing || messages.length < 100) break;
      before = messages.at(-1).id;
      if (page === 99) throw new Error('Channel history is too large. Set PANEL_MESSAGE_ID or use a dedicated panel channel.');
    }
  }
  const message = await api(`channels/${channelId}/messages${existing ? `/${existing.id}` : ''}`, {
    method: existing ? 'PATCH' : 'POST', body: panelMessage(),
  });
  try {
    await api(`channels/${channelId}/messages/pins/${message.id}`, { method: 'PUT' });
  } catch (error) {
    throw new Error(`Panel ${message.id} was saved but could not be pinned. Check Pin Messages permission; rerun with PANEL_MESSAGE_ID=${message.id}. ${error.message}`);
  }
  return { id: message.id, updated: Boolean(existing), url: `https://discord.com/channels/${guildId}/${channelId}/${message.id}` };
}
