import 'dotenv/config';
import express from 'express';
import { pathToFileURL } from 'node:url';
import {
  InteractionResponseType,
  InteractionType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomExcuse } from './excuses.js';
import { getRandomEmoji } from './utils.js';
import { discordApi } from './discord-api.js';
import { createInteractions } from './interactions.js';

export function createApp({ api = discordApi, publicKey = process.env.PUBLIC_KEY,
  resultChannelId = process.env.RESULT_CHANNEL_ID, guildId = process.env.GUILD_ID } = {}) {
  const app = express();
  const handleInteraction = createInteractions({ api, resultChannelId, guildId });

  app.get('/', function (_req, res) {
    return res.send('ok');
  });

  app.get('/api/excuse', function (_req, res) {
    return res.json(getRandomExcuse());
  });

  app.post('/interactions', verifyKeyMiddleware(publicKey), function (req, res) {
    const { type, data } = req.body;

    if (type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
    }

    if (type === InteractionType.APPLICATION_COMMAND) {
      const { name } = data;

      if (name === 'test') {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `hello world ${getRandomEmoji()}`,
          },
        });
      }

      if (name === 'excuse') {
        return res.send(handleInteraction(req.body).response);
      }

      console.error(`unknown command: ${name}`);
      return res.status(400).json({ error: 'unknown command' });
    }

    if (type === InteractionType.MESSAGE_COMPONENT) {
      const { response, afterReply } = handleInteraction(req.body);
      if (afterReply) {
        res.once('finish', () => {
          afterReply().catch(() => console.error('Could not update private interaction response.'));
        });
      }
      return res.send(response);
    }

    console.error('unknown interaction type', type);
    return res.status(400).json({ error: 'unknown interaction type' });
  });

  return app;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const PORT = process.env.PORT || 3000;
  createApp().listen(PORT, '0.0.0.0', () => console.log('Listening on port', PORT));
}
