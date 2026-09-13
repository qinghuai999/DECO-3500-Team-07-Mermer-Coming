import 'dotenv/config';
import { InstallGlobalCommands, InstallGuildCommands } from './utils.js';

const TEST_COMMAND = {
  name: 'test',
  description: 'Check that the bot is awake',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const EXCUSE_COMMAND = {
  name: 'excuse',
  description: 'Send a ridiculous excuse to leave the game',
  description_localizations: {
    'zh-CN': '生成一条夸张借口，幽默地宣布要下线休息',
    'zh-TW': '產生一條誇張藉口，幽默地宣布要下線休息',
  },
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const ALL_COMMANDS = [TEST_COMMAND, EXCUSE_COMMAND];

if (process.env.GUILD_ID) {
  await InstallGuildCommands(process.env.APP_ID, process.env.GUILD_ID, ALL_COMMANDS);
  console.log('Registered guild commands for', process.env.GUILD_ID);
}

await InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
console.log('Registered global commands');
