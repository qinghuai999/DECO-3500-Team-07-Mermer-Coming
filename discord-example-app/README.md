# Pally Discord bot

This directory contains the prototype: a Discord bot with three tools, **Random Pick**, **Trait Picker** and **Excuse Generator**. The Discord application is named Mermer2.0.

- To try the bot, or for an overview of the project, see the [repository README](../README.md).
- To set up channels, permissions and configuration in Discord, see [PANEL.md](./PANEL.md).
- To deploy to the server, see [`scripts/CICD-EC2.md`](../scripts/CICD-EC2.md).

## How it behaves

### The panel

`/social` brings up the three-button panel in the current channel without showing other channel members who asked for it. Trait Picker and Random Pick can only be used by members of the configured game voice channel, from the configured text channel. Excuse Generator can be used by anyone in the server.

When Trait Picker or Random Pick starts successfully, the person who clicked gets no private confirmation: the public message is the confirmation. A note that only the clicker can see is sent only when the tool is already in progress (including near-simultaneous clicks), when the clicker is not in the voice channel or not in the configured text channel, or when the start fails.

### Excuse Generator

Excuse Generator first asks privately for one of six categories (Leave, Decline, Cancel, Defence, Delay, Surprise Me), then shows a private preview with `Send`, `Another One` and `Cancel`. Only `Send` posts publicly, with the player's name and a plain announcement line. It can also be opened directly with `/excuse`. The excuses are in `excuses.json`.

### Random Pick

Random Pick selects one player from the voice channel by fair rotation: nobody is selected twice before everyone present has been selected once. It shows finding, rolling and result in a single message in about three seconds. There is no Pass or Draw Again; anyone can start another draw.

### Trait Picker

A round lasts at most 30 seconds. The bot names one player by fair rotation, and every player in the voice channel, including the one named, privately picks one word.

- Clicking a word only highlights it, and it can be changed at any time.
- `Other…` shows another group of words without extending the time.
- `Submit` locks the choice.
- The result is published as soon as every participant has submitted. Otherwise the highlighted words are submitted automatically at the deadline, and no selection counts as blank.

The vocabulary has 24 words in three groups of eight. Each word appears in exactly one group, and every group mixes positive, negative and neutral words. The voice channel roster is kept in sync automatically: players who join late take part from the next round, and a player who leaves loses their word for the current round.

### Portrait text

All portrait text is written by hand, with no fixed sentence frame and no external AI. It lives in `portrait-lines.json`:

- every word has its own title, sentence and two closing lines (24 entries);
- every pair of words has its own title and sentence (276 entries).

One selected word uses the word entry and two use the pair entry. Three or more are split into pairs, pairing the words whose leanings contrast most first; each pair uses its own sentence, a word left over adds one of its closing lines, and the title is that of the first pair. The result depends only on which words were selected, not on who selected them, in what order, or how many times.

After editing the library, run `npm test`. The tests check that all 300 entries exist, that each sentence contains exactly its own words and no other vocabulary word, that titles contain no vocabulary word, and that nothing is duplicated.

### Replying to a portrait

After a result, the player described can reply. The reply is written onto the original result card and no extra message is sent.

- Only that player can use the `Reply` button under the card. Anyone else who clicks it gets a private note.
- Clicking it privately shows three reply lines. Each line is itself a button, and one click posts it.
- `Another batch` shows three more. `Write my own` opens a pop-up for a reply of up to 200 characters.
- Reply lines match the tone of the portrait: positive words only use the positive lines, negative words only use the negative lines, and a mix of both or neutral words only use the neutral lines. There are ten lines for each tone, defined as `REPLIES` in `portrait-text.js`. Each is at most 80 characters, which is Discord's limit for a button label.
- Quick replies are limited to 60 seconds. When the time is up no “did not respond” note is posted, and the button on the card becomes `Write a reply`.
- Writing your own has no time limit and still works after the bot restarts.
- Each card accepts one reply. A portrait where everyone was blank has no reply button.
- The reply step does not hold the “in progress” state, so the next round can start straight away.

## Files

| File | Purpose |
|---|---|
| `app.js` | HTTP entry point. Verifies Discord's signature and passes interactions on |
| `interactions.js` | Routes commands, buttons and pop-up submissions; contains the Excuse Generator flow |
| `panel.js`, `publish-panel.js` | The three-button panel, and the optional pinned panel |
| `commands.js` | Definitions and registration of `/social`, `/excuse` and `/test` |
| `excuses.js`, `excuses.json` | Excuse categories and the excuse library |
| `picker.js` | Random Pick |
| `portrait.js` | Trait Picker rounds |
| `portrait-text.js`, `portrait-lines.json` | Vocabulary, portrait generation, and the reply lines |
| `portrait-reply.js` | The reply step |
| `portrait-store.js` | Saves rotation history to `STATE_DIR` |
| `portrait-runtime.js` | Starts Trait Picker and Random Pick with the voice channel roster |
| `voice-roster.js` | Tracks who is in the voice channel through the Discord Gateway |
| `discord-api.js`, `utils.js` | Calls to the Discord REST API |
| `test/` | Automated tests |
| `Dockerfile` | The container image. It copies files by name, so a new module must be added to it; a test checks this |
| `examples/`, `game.js`, `assets/` | Left over from Discord's example app. Pally does not use them |

The server answers `GET /` with `ok` as a health check, returns one random excuse as JSON at `GET /api/excuse`, and receives interactions at `POST /interactions`.

## Running it

**Requirements:** Node.js 24, and a Discord application with the `bot` and `applications.commands` scopes that has been added to your server.

```bash
npm ci
npm test
```

The tests use stand-ins for Discord and send nothing to a real server.

To run the bot:

1. Copy `.env.sample` to `.env` and fill it in. The variables are explained in [PANEL.md](./PANEL.md#configuration).
2. Register the commands:

   ```bash
   npm run register
   ```

3. Start the bot:

   ```bash
   npm start
   ```

4. Discord sends interactions to a public HTTPS address. In the Discord developer portal, set the application's Interactions Endpoint URL to `https://<your-host>/interactions`. For local development, a tunnel such as [ngrok](https://ngrok.com/) can provide that address; the live deployment uses EC2 and Caddy instead.

The bot also keeps a Gateway connection open to follow who is in the voice channel. It uses the Guilds and Guild Voice States intents, which need no special approval.

## Data and privacy

- The only data written to disk is the fair-rotation history of each tool and the location of a round in progress, so that it can be closed after a restart. With Docker, keep `STATE_DIR=/app/data` and the volume `-v mermer-data:/app/data`. The two tools store their history separately.
- Private word selections, reply suggestions and interaction tokens are never written to the data files.

## Updating a running bot

After an update, rebuild and replace the container, then bring up a new panel with `/social`. Commands only need to be registered again when their definitions change.

## Acknowledgement

The bot started from Discord's [example app](https://github.com/discord/discord-example-app) and its [getting started guide](https://discord.com/developers/docs/getting-started). The example is released under the MIT licence; see [LICENSE](./LICENSE).
