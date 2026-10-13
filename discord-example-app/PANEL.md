# Setting up the control panel in Discord

This page covers the Discord side of running Pally: channels, permissions, configuration, commands, the optional pinned panel, and a checklist for confirming that everything works. What each tool does is described in [README.md](./README.md). Deploying the bot to the server is described in [`scripts/CICD-EC2.md`](../scripts/CICD-EC2.md).

## How the panel works

- Any member types `/social` in the team's text channel. The command is acknowledged privately, and the panel is sent as an ordinary bot message that does not show the caller, quote the command or mention the user.
- The panel has three buttons: **Random Pick**, **Trait Picker** and **Excuse Generator**.
- Each call sends a new panel at the bottom of the channel. Old panels are not deleted and keep working.
- “Anonymous” means that the person who triggered something is not shown to other channel members. Discord and the bot still know who it was.

## Channels

Pally is configured for one server, one text channel and one voice channel.

| Channel | Setting | Used for |
|---|---|---|
| Text channel | `SOCIAL_TEXT_CHANNEL_ID` | The panel, and all Trait Picker and Random Pick messages. These two tools only work from this channel |
| Voice channel | `GAME_VOICE_CHANNEL_ID` | Defines who is playing. Trait Picker and Random Pick only accept players who are in this voice channel |

Excuse Generator works in any channel of the server and for any member.

To copy an ID, turn on Discord User Settings → Advanced → Developer Mode, then right-click the server or channel and choose Copy ID. `GUILD_ID` is the server ID, not a channel ID.

## Permissions

| Who | Where | Permissions |
|---|---|---|
| Bot | Text channel | View Channel, Send Messages, Embed Links, Read Message History |
| Bot | Text channel, only for a pinned panel | Pin Messages |
| Bot | Voice channel | View Channel |
| Players | Text channel | Use Application Commands |
| Players | Voice channel | Connect |

Administrator does not need to be granted.

Read Message History lets the bot read a result card back before adding a reply to it, and is required by the pinned-panel command, which searches the channel for an existing panel. Without it, replies can still be posted.

## Configuration

Set these in `.env` locally, or in `bot.env` on the server. `.env.sample` lists them all.

| Variable | Required | Meaning |
|---|---|---|
| `APP_ID`, `DISCORD_TOKEN`, `PUBLIC_KEY` | Yes | The Discord application's ID, bot token and public key |
| `GUILD_ID` | Yes | The server |
| `GAME_VOICE_CHANNEL_ID` | Yes | The voice channel whose members take part |
| `SOCIAL_TEXT_CHANNEL_ID` | Yes | The text channel for the panel and results |
| `STATE_DIR` | No | Where rotation history is stored. Defaults to `./data`; in Docker it is `/app/data` on the `mermer-data` volume |
| `RESULT_CHANNEL_ID` | No | Where Excuse Generator posts a sent excuse. If empty, it posts in the channel where the excuse was opened |
| `PANEL_CHANNEL_ID` | Only for a pinned panel | The channel in which `npm run panel` publishes |
| `PANEL_MESSAGE_ID` | No | The exact pinned panel message to update |

If `GUILD_ID`, `GAME_VOICE_CHANNEL_ID` or `SOCIAL_TEXT_CHANNEL_ID` is missing or not a valid ID, Trait Picker and Random Pick are switched off: their buttons answer privately that the tool is not configured yet. Excuse Generator still works.

## Registering the commands

The slash commands `/social`, `/excuse` and `/test` are registered with:

```bash
npm run register
```

On the server, run it inside the container:

```bash
sudo docker exec mermer-bot npm run register
```

This replaces the application's command list, for the server in `GUILD_ID` and globally. It only needs to be run again when the command definitions in `commands.js` change. Server commands can usually be used straight away; reopen the Discord command picker if a new command does not appear.

## Optional: a pinned panel

A team that wants the panel in a fixed place can publish one pinned panel:

```bash
sudo docker exec mermer-bot npm run panel
```

- The command sends a panel message in `PANEL_CHANNEL_ID` and pins it. That channel must be an ordinary text channel in `GUILD_ID`.
- **Set `PANEL_CHANNEL_ID` to the same channel as `SOCIAL_TEXT_CHANNEL_ID`.** In any other channel only Excuse Generator works; Trait Picker and Random Pick tell the player to use the configured text channel.
- Running it again finds this bot's existing panel in the channel and updates it instead of creating a second one. To update one exact message, pass the ID that the command printed:

```bash
sudo docker exec -e PANEL_MESSAGE_ID=<message-id> mermer-bot npm run panel
```

- If it reports that the panel was saved but could not be pinned, give the bot the Pin Messages permission and run it again.
- Do not run several publish commands for the same channel at the same time.
- Restarting the bot does not publish the panel again, and the bot never publishes it by itself.

A pinned Discord message does not stay floating at the top of the chat window; players open it from the channel's pinned messages. For everyday use, `/social` is quicker.

## Acceptance checklist

Use two or three accounts. The accounts that test Random Pick and Trait Picker must be in the voice channel.

**Panel**

1. Type `/social` in the text channel. You get a private confirmation, and the panel appears.
2. From another account, confirm that nothing shows who brought up the panel.

**Excuse Generator**

3. Click `Excuse Generator`. Only you see the six categories; nothing appears in the channel.
4. Choose a category. `Another One` changes the excuse, and `Cancel` ends the preview with no public message.
5. Open a preview again and press `Send`. One message appears with your name and a plain announcement line. Clicking repeatedly does not send it again.

**Random Pick**

6. Click `Random Pick`. One message moves from “Finding players…” to “Rolling…” to the result in about three seconds. The person who clicked gets no private message, and nothing shows who clicked.
7. Click it again while a draw is running, from any account. Only that account sees “A Random Pick is already in progress.”
8. Run several draws. Nobody is selected twice before everyone in the voice channel has been selected once.

**Trait Picker**

9. Click `Trait Picker`. The bot names one player and shows `Choose Traits`.
10. Each account presses `Choose Traits`, picks a word and presses `Submit`. `Other…` shows more words. Word selection is visible only to the player making it.
11. When everyone has submitted, or after 30 seconds, the result card shows a title and a short text. It shows no list of words, no counts and no names of who chose what.
12. From an account that is not the named player, press `Reply`. Only that account sees “Only … can reply to this portrait.”
13. As the named player, press `Reply`, try `Another batch`, then click a line. The reply is added to the same card and the button disappears.
14. Run another round and wait 60 seconds without replying. The button changes to `Write a reply`, with no message about not responding. Pressing it opens a pop-up; submitting adds the reply to the card.

**Access**

15. From an account that is not in the voice channel, click `Random Pick` or `Trait Picker`. Only that account sees a note asking it to join the voice channel.

## Limits to know about

- Private previews and word selections are held in the memory of one process. Restarting the bot ends a round in progress and invalidates open private panels; start again from the panel. A reply can still be written on an existing result card after a restart.
- An excuse preview expires after 10 minutes.
- Running several copies of the bot at once is not supported.
- If a network timeout leaves it uncertain whether a message was sent, the bot does not resend it. Check the channel first.

## Deploying and rolling back

Deployment replaces the container and keeps the previous one as a backup; if the new container fails to start or fails its health check, the deployment script tries to restore the old one. See [`scripts/CICD-EC2.md`](../scripts/CICD-EC2.md) for deploying from GitHub and [`scripts/DEPLOY-EC2.md`](../scripts/DEPLOY-EC2.md) for running the deployment script by hand.

Local verification: `npm test`. All writes to Discord are handled by test stand-ins, and no real message is published.

References: [Discord's notes on pinning](https://support.discord.com/hc/en-us/articles/221421867-Pin-Messages-FAQ), [Discord message API](https://docs.discord.com/developers/resources/message).
