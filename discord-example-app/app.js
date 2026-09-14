import 'dotenv/config';
import express from 'express';
import {
  InteractionResponseType,
  InteractionType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomExcuse } from './excuses.js';
import { getRandomEmoji } from './utils.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', function (_req, res) {
  return res.send('ok');
});

app.get('/api/excuse', function (_req, res) {
  return res.json(getRandomExcuse());
});

app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  const { type, data, member, user } = req.body;

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
      const userId = member?.user?.id ?? user?.id;
      const excuse = getRandomExcuse();

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `<@${userId}> 不得不暂时下线：\n> ${excuse.text}\n-# 不是不想玩，是宇宙不让。`,
        },
      });
    }

    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Listening on port', PORT);
});
