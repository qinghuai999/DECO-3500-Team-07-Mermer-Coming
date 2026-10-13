<!--
TODO before submission (delete this comment when done):
1. Add links to the poster, pitch and promotional material in "Start here".
2. Replace "in progress" with links once the Wiki pages exist.
-->

# Pally — playful social tools for gaming groups on Discord

[![CI](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/actions/workflows/ci.yml/badge.svg)](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/actions/workflows/ci.yml)

DECO3500 Social & Mobile Computing · Design Project · Team 07, MermerComing

Pally is a Discord bot for friends who play multiplayer games together. In these groups the same one or two people often decide what happens next, and quieter members go along with it rather than make things awkward. Our project studies this **social compliance** and asks whether playful, system-mediated interaction can lower the cost of speaking up.

Pally gives every player the same three moves:

| Tool | What a player can do | The social problem behind it |
|---|---|---|
| 🎲 **Random Pick** | Hand the group's current decision to one fairly chosen player | Decisions are usually made by the most vocal members |
| 🎨 **Trait Picker** | Describe a teammate's play with one anonymous word. The group's words become a playful portrait, and the player described can reply to it | Honest feedback feels risky, and the person described has no easy way to answer |
| 🎭 **Excuse Generator** | Say “I'm leaving”, “not this time” or “give me a minute” through an obviously absurd excuse | Leaving or declining feels like letting the group down |

Together they cover **Leave — Express — Decide**.

## Start here

| What | Where | Status |
|---|---|---|
| Poster (A2) | To be linked here | In progress |
| Pitch and promotional material | To be linked here | In progress |
| Try the prototype | [Try the prototype](#try-the-prototype) below | Available |
| Design Process Overview | [Wiki](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki) | In progress |
| Ethical Considerations | [Wiki](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki) | In progress |
| Stand-up and meeting records | [Wiki: Stand-up and Meeting Records](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/Stand-up-and-Meeting-Records) | Available |
| Research, requirements, designs, evaluation | [Documentation](#documentation) below | Available |
| Source code | [`discord-example-app/`](discord-example-app) | Available |

## Try the prototype

The bot runs on a cloud server and is normally online. In Discord it appears under the name **Mermer2.0**. There are two ways to try it.

### Option 1 — With the team

At the tradeshow, or by arrangement, we run the demo on our own Discord accounts, which are already in the server and the voice channel. You do not need an account or any login.

### Option 2 — Join our Discord server yourself

You only need your own Discord account. There are no other login details, and nothing to install.

1. Open the invite link: **<https://discord.gg/xFxty6PXum>**. It takes you to our server, **DECO3500**, and does not expire.
2. Join the voice channel **Game**. Random Pick and Trait Picker work with whoever is in this voice channel at that moment. Both work alone, but they are designed for a group, so bring one or two people if you can.
3. In the text channel **#general**, which is where the invite link opens, type `/social`. Pally posts its panel in the channel. Nobody can see who asked for it.
4. Click one of the three buttons.

### What to try

**🎲 Random Pick**

1. Click `Random Pick`. A single message moves from “Finding players…” to “Rolling…” to the result in about three seconds.
2. The selected player makes the group's decision.
3. Run it again. The rotation is fair: nobody is picked a second time until everyone in the voice channel has had a turn.

**🎨 Trait Picker**

1. Click `Trait Picker`. Pally names one player, chosen by the same fair rotation. Nobody can see who started the round.
2. Everyone in the voice channel, including the named player, presses `Choose Traits` and privately picks one of 24 words. `Other…` shows more words, and `Submit` locks the choice. The round lasts 30 seconds and ends early once everyone has submitted.
3. Pally publishes a title and a short text written for that combination of words. It never shows a list of words, counts, or who chose what.
4. The named player can press `Reply`. They privately see three suggested lines that match the tone of the portrait, can ask for `Another batch`, or can `Write my own`. The reply is added to the same card. Suggestions close after 60 seconds; a written reply has no time limit.

**🎭 Excuse Generator**

1. Click `Excuse Generator`, or type `/excuse`. Only you see what follows.
2. Choose a category: Leave, Decline, Cancel, Defence, Delay or Surprise Me.
3. Read the preview. `Another One` swaps it, `Cancel` drops it, and only `Send` posts it publicly with your name.

Messages marked “Only you can see this” are private to you. If the bot does not answer, please tell a team member; you can also check that the server is up at <https://mermerteam07.duckdns.org/>, which should show `ok`.

## What is real and what is simulated

This is a proof-of-concept. The social mechanics are real; the content is prepared in advance.

| Real | Simulated or prepared in advance |
|---|---|
| A live bot inside Discord, used by several people at once with their own accounts | Portrait text is not generated by AI. It comes from a hand-written library: 24 words, with a title and sentence for every word and every pair of words (300 entries) |
| Awareness of who is in the voice channel, including people joining and leaving mid-round | Excuses come from a library of 61 lines in five categories |
| Fair rotation that is remembered across restarts | Reply suggestions come from 30 lines, ten for each tone |
| Anonymous triggering, private word selection, and one round at a time per tool | The bot is set up for one server, one voice channel and one text channel. It is not a public bot that any server can add |
| Hosted on AWS with automated tests and a one-click deployment | There are no Pally accounts or settings; it relies on Discord identities |

## Documentation

Our process documentation is on the [Wiki](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki). The source files are kept in [`Team Document/`](Team%20Document).

| Stage | Wiki page | Source files |
|---|---|---|
| Team | [Team Charter](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/Team-Charter) | [Charter](Team%20Document/00-Charter/Team%20Charter.md) |
| Stand-ups | [Stand-up and Meeting Records](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/Stand-up-and-Meeting-Records) | [Meeting records 1–8](Team%20Document/01-Meeting%20Records) |
| Research: literature | [Literature Research](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/Literature-Research) | [Literature research](Team%20Document/03-Literature/Literature_Research.md) |
| Research: interviews | [User Research: Interviews](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/User-Research-Interviews) | [Round 1](Team%20Document/02-Interview%20%26%20Analysis/Round1) and [round 2](Team%20Document/02-Interview%20%26%20Analysis/Round2) transcripts and affinity maps |
| Requirements | [Requirements](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/Requirements) | [Requirements document V1.5](Team%20Document/04-MVP%20%26%20Product%20Design/Requirement%20-%20social_compliance_discord_bot_v1.5.md) |
| Designs | [Designs](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/Designs) | [Product design document](Team%20Document/04-MVP%20%26%20Product%20Design/Product_Design_Document.pdf) |
| Prototype | [Prototype](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/Prototype) | [`discord-example-app/`](discord-example-app) |
| Evaluation: plan | [User Testing Plan](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/User-Testing-Plan) | [Test plan](Team%20Document/06-User%20Test/Test%20Plan.pdf) |
| Evaluation: findings | [User Testing Findings](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/User-Testing-Findings) | [Thematic analysis](Team%20Document/06-User%20Test/Pally_User_Testing_Thematic_Analysis.md); transcripts [P01](Team%20Document/06-User%20Test/P01/P01_Transcripts.md), [P02](Team%20Document/06-User%20Test/P02/P02-Interview-Transcripts.md), [P03](Team%20Document/06-User%20Test/P03/P03-Interview-Transcript.md) |
| Evaluation: heuristics | [Groupware Heuristics Evaluation](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/Groupware-Heuristics-Evaluation) | [Coding sheets](Team%20Document/06-User%20Test/Groupware_Heuristics_Evaluation) |
| Ethics | In progress | |
| Design process overview | In progress | |

## Repository layout

```text
.
├── README.md                 this guide
├── Team Document/            research, requirements, designs, evaluation, meeting records
├── discord-example-app/      the prototype: the Pally bot and its tests
│   ├── app.js                HTTP entry point for Discord interactions
│   ├── panel.js              the three-button control panel
│   ├── picker.js             Random Pick
│   ├── portrait*.js          Trait Picker, its word library and the reply step
│   ├── portrait-lines.json   titles and sentences for every word and pair of words
│   ├── excuses.js / .json    Excuse Generator and its excuse library
│   ├── voice-roster.js       who is in the voice channel right now
│   └── test/                 automated tests, run without contacting Discord
├── scripts/                  deployment to AWS EC2
└── .github/workflows/        CI and the manual deployment workflow
```

## Run and deploy

You do not need this section to try the prototype. It is for running your own copy.

**Requirements:** Node.js 24, a Discord application with a bot token and public key, and a public HTTPS address that Discord can send interactions to.

```bash
cd discord-example-app
npm ci
npm test
```

The tests use a stand-in for Discord and send nothing to a real server.

To run the bot:

1. Copy `.env.sample` to `.env` and fill in `APP_ID`, `DISCORD_TOKEN` and `PUBLIC_KEY`, then the server, voice channel and text channel IDs.
2. Register the commands `/social`, `/excuse` and `/test` with `npm run register`.
3. Start it with `npm start`, and set the application's Interactions Endpoint URL in the Discord developer portal to `https://<your-host>/interactions`.

In the text channel the bot needs View Channel, Send Messages, Embed Links and Read Message History. It also needs to see the voice channel.

**Deployment.** The bot runs in a Docker container on an AWS EC2 instance behind Caddy. Every push and pull request to `main` runs the tests. Deployment is started by hand from GitHub: Actions → **Deploy EC2** → Run workflow. It runs the tests again, builds the image on the server, replaces the container and checks that it answers. The full setup is described in [`scripts/CICD-EC2.md`](scripts/CICD-EC2.md) and [`scripts/DEPLOY-EC2.md`](scripts/DEPLOY-EC2.md), which are written in Chinese.

## Team

| Member | Program |
|---|---|
| Arthur Zhou (team leader) | Master of Interaction Design |
| Kiki Su (primary contact) | Master of Information Technology |
| Jeric Zhang | Master of Interaction Design |
| Elsie Xiao | Master of Interaction Design |
| Ping Cheng | Master of Interaction Design |

Who did what is described in the Design Process Overview on the Wiki.

## Acknowledgements

The bot started from Discord's [example app](https://github.com/discord/discord-example-app), which is released under the MIT licence; see [`discord-example-app/LICENSE`](discord-example-app/LICENSE).
