# Mermer Discord bot

使用 `/social` 在当前频道调出三按钮面板（Random Pick、Trait Picker、Excuse Generator），不向其他频道成员显示触发者。Excuse Generator 先私密选择六个类别之一，再预览、换一条、发送或取消；也可以直接用 `/excuse` 打开。Trait Picker 与 Random Pick 仅允许绑定的游戏语音频道成员在指定文字频道参与。

Trait Picker 每轮最多 30 秒：点词只是高亮，可以随时更换，`Other…` 换一组词且不延长时间，按 `Submit` 才锁定；全部参与者提交后立即出结果，否则到时自动提交当前高亮的词，未选词按空白处理。结果来自本地英文模板，无外部 AI。Random Pick 公平轮换选人，用同一条消息依次显示查找、滚动、结果，约 3 秒完成，没有 Pass / Draw Again。语音名单自动同步，新加入者从下一轮参与。

Trait Picker 出结果后，被评价者可以回应，回应写回原结果卡片，不另发消息。卡片下方的 `Reply` 只有被评价者能用，其他人点击只收到私密提示。点击后私密显示三句回应，句子本身就是按钮，点一下即发出；`Another batch` 换一批，`Write my own` 弹出输入框自己写（最多 200 字）。回应句按画像语气选取：只有正面词用好评语料，只有负面词用差评语料，正负混合或只有中性词用中性语料，三类各 10 句，定义在 `portrait-text.js` 的 `REPLIES`，每句不超过 80 字符（Discord 按钮上限）。快捷回应限时 60 秒，到时不发任何“未回应”提示，卡片按钮变为 `Write a reply`；自己写没有时间限制，机器人重启后仍可用。每张卡片只能回应一次；全员空白的画像没有回应入口；回应阶段不占用“进行中”状态，可以立刻开始下一轮。

运行配置使用 `.env.sample` 中的 `GUILD_ID`、`GAME_VOICE_CHANNEL_ID`、`SOCIAL_TEXT_CHANNEL_ID`。Docker 保留 `STATE_DIR=/app/data` 和 `-v mermer-data:/app/data`，两个功能分别保存轮换记录；私密选词、回应候选及交互 token 不写入数据文件。建议机器人在指定文字频道拥有 Read Message History（读取消息历史）权限，写入回应前会先读回卡片确认没有重复回应；没有该权限时回应仍可发出。更新后重建并替换容器，再用 `/social` 调出新面板，无需新增命令注册或环境变量。测试使用 `npm test`，不调用真实 Discord。原来的 [部署说明](./PANEL.md) 保留为早期部署参考，其中待开放状态与画像计时规则以本段为准。

以下为项目继承的 Discord 入门示例文档，示例中的游戏功能和文件结构不代表当前实现。线上部署使用 EC2 + Caddy，无需本机公网隧道。

## Original starter guide

This project contains a basic rock-paper-scissors-style Discord app written in JavaScript, built for the [getting started guide](https://discord.com/developers/docs/getting-started).

![Demo of app](https://github.com/discord/discord-example-app/raw/main/assets/getting-started-demo.gif?raw=true)

## Project structure
Below is a basic overview of the project structure:

```
├── examples    -> short, feature-specific sample apps
│   ├── app.js  -> finished app.js code
│   ├── button.js
│   ├── command.js
│   ├── modal.js
│   ├── selectMenu.js
├── .env.sample -> sample .env file
├── app.js      -> main entrypoint for app
├── commands.js -> slash command payloads + helpers
├── game.js     -> logic specific to RPS
├── utils.js    -> utility functions and enums
├── package.json
├── README.md
└── .gitignore
```

## Running app locally

Before you start, you'll need to install [NodeJS](https://nodejs.org/en/download/) and [create a Discord app](https://discord.com/developers/applications) with the proper permissions:
- `applications.commands`
- `bot` (with Send Messages enabled)


Configuring the app is covered in detail in the [getting started guide](https://discord.com/developers/docs/getting-started).

### Setup project

First clone the project:
```
git clone https://github.com/discord/discord-example-app.git
```

Then navigate to its directory and install dependencies:
```
cd discord-example-app
npm install
```
### Get app credentials

Fetch the credentials from your app's settings and add them to a `.env` file (see `.env.sample` for an example). You'll need your app ID (`APP_ID`), bot token (`DISCORD_TOKEN`), and public key (`PUBLIC_KEY`).

Fetching credentials is covered in detail in the [getting started guide](https://discord.com/developers/docs/getting-started).

> 🔑 Environment variables can be added to the `.env` file in Glitch or when developing locally, and in the Secrets tab in Replit (the lock icon on the left).

### Install slash commands

The commands for the example app are set up in `commands.js`. All of the commands in the `ALL_COMMANDS` array at the bottom of `commands.js` will be installed when you run the `register` command configured in `package.json`:

```
npm run register
```

### Run the app

After your credentials are added, go ahead and run the app:

```
node app.js
```

> ⚙️ A package [like `nodemon`](https://github.com/remy/nodemon), which watches for local changes and restarts your app, may be helpful while locally developing.

If you aren't following the [getting started guide](https://discord.com/developers/docs/getting-started), you can move the contents of `examples/app.js` (the finished `app.js` file) to the top-level `app.js`.

### Set up interactivity

The project needs a public endpoint where Discord can send requests. To develop and test locally, you can use something like [`ngrok`](https://ngrok.com/) to tunnel HTTP traffic.

Install ngrok if you haven't already, then start listening on port `3000`:

```
ngrok http 3000
```

You should see your connection open:

```
Tunnel Status                 online
Version                       2.0/2.0
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://1234-someurl.ngrok.io -> localhost:3000

Connections                  ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

Copy the forwarding address that starts with `https`, in this case `https://1234-someurl.ngrok.io`, then go to your [app's settings](https://discord.com/developers/applications).

On the **General Information** tab, there will be an **Interactions Endpoint URL**. Paste your ngrok address there, and append `/interactions` to it (`https://1234-someurl.ngrok.io/interactions` in the example).

Click **Save Changes**, and your app should be ready to run 🚀

## Other resources
- Read **[the documentation](https://discord.com/developers/docs/intro)** for in-depth information about API features.
- Browse the `examples/` folder in this project for smaller, feature-specific code examples
- Join the **[Discord Developers server](https://discord.gg/discord-developers)** to ask questions about the API, attend events hosted by the Discord API team, and interact with other devs.
- Check out **[community resources](https://discord.com/developers/docs/topics/community-resources#community-resources)** for language-specific tools maintained by community members.
