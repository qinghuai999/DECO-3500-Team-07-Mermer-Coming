# Design Process Overview — draft for review

> This draft has an English version followed by a sentence-by-sentence Chinese translation. Please review and edit it. The wiki version will be written from the English text after the team approves it.

---

# English version

## Poster, pamphlet and prototype

- **Poster:** [Exhibition poster (PDF)](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/blob/main/Team%20Document/05-Visual%20Material/Pally%20Exhibition%20Poster%20Final.pdf)
- **Pamphlet:** [outside](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/blob/main/Team%20Document/05-Visual%20Material/Pamphlet-outside.pdf) and [inside](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/blob/main/Team%20Document/05-Visual%20Material/Pamphlet-inside.pdf) (PDF)
- **Prototype:** Pally is a bot in our Discord server. You can try it with any Discord account, and you do not need any other login. The [README](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming#try-the-prototype) explains two ways to try it, gives the invite link, and lists what is real and what is simulated. The code and the deployment are described on the [Prototype](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/Prototype) page.

## Summary

When friends play online games together, not everyone has the same influence. Usually the organiser or the loudest players decide what to play, when to stop, and who played well or badly. Quieter players often just follow, because they do not want to make things awkward. We call this **social compliance**.

Our project, **Pally**, is a Discord bot that gives every player the same chance to speak up, in a light and playful way. It has three tools:

- **Random Pick** chooses one player fairly, and this player makes the group's next decision.
- **Trait Picker** lets everyone describe one player's gameplay with one anonymous word. The bot turns the words into a short, funny portrait, and the player can reply to it.
- **Excuse Generator** helps a player say "I want to leave" or "not this time" with a silly, obviously fake excuse.

In each tool, the bot starts the action instead of a person, so nobody has to challenge a friend directly. Together, the three tools support three actions: leaving, expressing and deciding.

## Process

### 1. From game addiction to social compliance

Our first topic was game addiction. We interviewed ten players about their gaming habits. We found that people often kept playing because of their friends, not because of the game. One player said: "If everyone is still online... leaving the game feels a bit awkward" (Interview 4). Stopping was a group decision, not a personal one.

Our tutor told us that this was not really addiction. It was social compliance: people follow the group even when they want something else. So we changed our topic (Meeting 5). Then we read research in this area. Hancock et al. (2009) show that people use small "butler lies" to leave a conversation politely. Postmes and Lea (2000) show that anonymity can change how people take part in group decisions, especially when they want to criticise. Ömerbaş (2023) and Ertac and Gurdal (2019) explain how power and leadership work in groups. This reading gave us three research questions: how players leave, how they give feedback, and who makes the decisions.

### 2. Second interviews: three kinds of power

We interviewed four more players about these questions. We grouped what they said in an affinity map and found three themes: the power to decide, the power to evaluate and the power to say no. Each theme became one tool in Pally.

![Affinity map from the second interviews](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/images/affinity-map-round-2.jpg)

*Affinity map from the second interviews. Each theme became one of Pally's tools.*

### 3. Designing the tools

We built Pally inside Discord because many groups already use Discord to talk while they play. Our research gave us four design principles:

- **The system acts, not a person.** The bot starts each activity and posts the results. Nobody can see who pressed a button.
- **Controlled words.** Gielen and De Wever (2015) found that the structure of feedback affects what people focus on. So players choose from a fixed list of gameplay words instead of writing free text. The list has no insulting words.
- **Fairness that people can see.** A fair rotation makes sure that nobody is picked twice before everyone has had a turn.
- **Humour.** A joke makes it easier to say something awkward.

![First screen designs for the panel and the three tools](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/images/product-design-document.jpg)

*Our first screen designs for the panel and the three tools.*

We wrote these rules in a requirements document, and we kept updating it as the design changed. It is now version 1.5.

### 4. Building the prototype

Pally is a real Discord bot. Several people can use it at the same time with their own accounts. It knows who is in the game voice channel, and it remembers the fair rotation when it restarts. Some parts are simulated. For example, we planned to use AI to write the portraits, but in the prototype we wrote all the titles and sentences ourselves. The excuses also come from a fixed list of 61.

### 5. Testing with players

We tested Pally with a group of friends who play games together. They played twice: first with Discord voice chat only, and then with Pally. Three team members watched the recordings of both sessions and coded them with the groupware heuristics of Baker, Greenberg and Gutwin (2001). After the sessions, we interviewed the players.

We learned three main things:

- **Random Pick gave quieter players a real chance to decide.** One player said: "When Random Pick chose me to make the decision, they usually agreed with me." However, this player still asked the others to confirm the choice. The old power pattern became weaker, but it did not disappear.
- **Anonymity was not perfect.** In a small group of close friends, people could sometimes guess who chose a word.
- **An excuse started a conversation instead of ending the game.** When a player used it, the others replied with "one last game".

### 6. Improving the design

We made three changes after this feedback:

- **The player being described could not answer.** Our tutor suggested adding a way to respond. Now the player can reply on the same card. They can choose one of three suggested lines that match the tone of the portrait, or write their own reply.
- **The portraits started to feel repetitive.** We replaced the single sentence pattern with hand-written sentences: one for every word and one for every pair of words. This gives 300 different titles and sentences for 24 words.
- **Smaller fixes.** We removed an extra private message that appeared when a tool started, and we renamed the "Blame" excuse category to "Defence".

### 7. Expert review

On 14 October 2026, two experts checked Pally against Nielsen's ten usability heuristics. They found seven issues. The most serious one is that a player cannot clear a word after choosing it, and the word is still sent when the time runs out. This means that players lose control over what they share. The `/excuse` command also did not work during the session. The analysis suggests that an older bot in the same server may have caused this problem. We have not fixed these two issues yet.

## Limitations

- We tested with small groups of friends, so our results show possible directions, not general facts.
- Pally can reduce the power gap in a group, but it cannot remove it. Also, technical anonymity does not always feel anonymous in a small group.
- The jokes are in English, and one expert did not understand some of the excuses.
- Players cannot take back a word after choosing it, and there is no single place that explains who can see what.
- The bot only works in one server, with one voice channel and one text channel.

## Who did what

| Member | Contributions |
|---|---|
| Arthur Zhou | *(to be completed by the team)* |
| Kiki Su | *(to be completed by the team)* |
| Jeric Zhang | *(to be completed by the team)* |
| Elsie Xiao | *(to be completed by the team)* |
| Ping Cheng | *(to be completed by the team)* |

## References

- Baker, K., Greenberg, S., & Gutwin, C. (2001). Heuristic evaluation of groupware based on the mechanics of collaboration.
- Ertac, S., & Gurdal, M. Y. (2019). Preference communication and leadership in group decision-making.
- Gielen, M., & De Wever, B. (2015). Structuring peer assessment: Comparing the impact of the degree of structure on peer feedback content.
- Hancock, J., Birnholtz, J., Bazarova, N., Guillory, J., Perlin, J., & Amos, B. (2009). Butler lies: Awareness, deception and design.
- Nielsen, J. (1994). 10 usability heuristics for user interface design.
- Ömerbaş, A. C. (2023). The power bases in multiplayer video games.
- Postmes, T., & Lea, M. (2000). Social processes and group decision making: Anonymity in group decision support systems.

---

# 中文版（逐句翻译）

## 海报、小册子和原型

- **海报：**[展览海报（PDF）](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/blob/main/Team%20Document/05-Visual%20Material/Pally%20Exhibition%20Poster%20Final.pdf)
- **小册子：**[外页](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/blob/main/Team%20Document/05-Visual%20Material/Pamphlet-outside.pdf)和[内页](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/blob/main/Team%20Document/05-Visual%20Material/Pamphlet-inside.pdf)（PDF）
- **原型：**Pally 是我们 Discord 服务器里的一个机器人。你可以用任何 Discord 账号试用它，不需要其他任何登录。[README](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming#try-the-prototype) 说明了两种试用方式，给出了邀请链接，并列出了哪些是真实的、哪些是模拟的。代码和部署在 [Prototype](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/Prototype) 页面中说明。

## 概述

当朋友们一起玩网络游戏时，并不是每个人都有相同的影响力。通常是组织者或说话最大声的玩家决定玩什么、什么时候停，以及谁玩得好或不好。比较安静的玩家常常只是跟着走，因为他们不想让场面变尴尬。我们把这称为**社会顺从（social compliance）**。

我们的项目 **Pally** 是一个 Discord 机器人，它以一种轻松、有趣的方式，给每位玩家同样的发声机会。它有三个工具：

- **Random Pick** 公平地选出一位玩家，由这位玩家做出小组的下一个决定。
- **Trait Picker** 让每个人用一个匿名的词来描述某一位玩家的游戏表现。机器人把这些词变成一段简短、有趣的画像，被描述的玩家可以回复它。
- **Excuse Generator** 用一个滑稽的、明显是假的借口，帮助玩家说出"我想走了"或"这次就不了"。

在每个工具里，都是机器人而不是某个人来发起行动，所以没有人需要直接去挑战朋友。这三个工具合在一起，支持三种行动：离开、表达和决定。

## 过程

### 1. 从游戏成瘾到社会顺从

我们最初的主题是游戏成瘾。我们就游戏习惯采访了十位玩家。我们发现，人们常常是因为朋友才继续玩，而不是因为游戏本身。一位玩家说："如果大家都还在线……离开游戏会觉得有点尴尬"（访谈 4）。停下来是一个小组的决定，而不是个人的决定。

我们的导师告诉我们，这其实不是成瘾。这是社会顺从：即使人们想要别的东西，也会跟随小组。所以我们更换了主题（第 5 次会议）。然后我们阅读了这一领域的研究。Hancock 等人（2009）指出，人们会用小小的"管家谎言（butler lies）"礼貌地离开一段对话。Postmes 和 Lea（2000）指出，匿名可以改变人们参与小组决策的方式，尤其是在他们想提出批评的时候。Ömerbaş（2023）以及 Ertac 和 Gurdal（2019）解释了权力和领导在小组中是如何运作的。这些阅读给了我们三个研究问题：玩家如何离开、他们如何给出反馈，以及谁来做决定。

### 2. 第二轮访谈：三种权力

我们就这些问题又采访了四位玩家。我们用亲和图把他们说的内容进行分组，找到了三个主题：决定的权力、评价的权力和说不的权力。每个主题都成为了 Pally 中的一个工具。

（图：第二轮访谈的亲和图。每个主题都成为了 Pally 的一个工具。）

### 3. 设计这些工具

我们把 Pally 做在 Discord 里，因为很多小组在玩游戏时已经在用 Discord 聊天。我们的研究给了我们四条设计原则：

- **由系统行动，而不是由人。**机器人发起每个活动并公布结果。没有人能看到是谁按下了按钮。
- **受控的用词。**Gielen 和 De Wever（2015）发现，反馈的结构会影响人们关注的内容。所以玩家是从一份固定的游戏用词列表中选择，而不是自由书写。这份列表里没有侮辱性的词。
- **看得见的公平。**公平轮换确保在每个人都轮到一次之前，没有人会被选中两次。
- **幽默。**一个玩笑能让说出尴尬的话变得更容易。

（图：我们为面板和三个工具设计的第一版界面。）

我们把这些规则写进了一份需求文档，并随着设计的变化不断更新它。它现在是 1.5 版。

### 4. 构建原型

Pally 是一个真实的 Discord 机器人。好几个人可以用自己的账号同时使用它。它知道谁在游戏语音频道里，并且在重启后仍然记得公平轮换的情况。有些部分是模拟的。例如，我们原本计划用 AI 来写画像，但在原型中，所有的称号和句子都是我们自己写的。借口也来自一份固定的 61 条列表。

### 5. 和玩家一起测试

我们和一群经常一起玩游戏的朋友测试了 Pally。他们玩了两次：第一次只用 Discord 语音聊天，第二次使用 Pally。三位团队成员观看了两次测试的录像，并用 Baker、Greenberg 和 Gutwin（2001）的群件启发式原则（groupware heuristics）对它们进行了编码。测试结束后，我们采访了这些玩家。

我们学到了三件主要的事：

- **Random Pick 给了比较安静的玩家一个真正做决定的机会。**一位玩家说："当 Random Pick 选我来做决定时，他们通常都会同意我。"不过，这位玩家仍然请其他人确认这个选择。原有的权力模式变弱了，但并没有消失。
- **匿名并不完美。**在一小群关系很近的朋友里，人们有时能猜到是谁选了某个词。
- **借口开启了一段对话，而不是结束了游戏。**当一位玩家使用它时，其他人回答"最后一局"。

### 6. 改进设计

根据这些反馈，我们做了三项改动：

- **被描述的玩家无法回应。**我们的导师建议增加一种回应的方式。现在这位玩家可以在同一张卡片上回复。他们可以从三句与画像语气相符的建议句中选一句，或者自己写回复。
- **画像开始让人觉得重复。**我们用手写的句子替换了单一的句式：每个词一句，每一对词一句。这为 24 个词提供了 300 个不同的称号和句子。
- **较小的修正。**我们去掉了工具启动时多出现的一条私密消息，并把借口类别"Blame"改名为"Defence"。

### 7. 专家评审

2026 年 10 月 14 日，两位专家对照 Nielsen 的十条可用性启发式原则检查了 Pally。他们发现了七个问题。最严重的一个是：玩家选了一个词之后无法清除它，并且时间到了这个词仍然会被提交。这意味着玩家失去了对自己分享内容的控制。`/excuse` 命令在测试中也没有响应。分析认为，可能是同一服务器中一个较旧的机器人导致了这个问题。这两个问题我们目前还没有修复。

## 局限性

- 我们是在小规模的朋友群中测试的，所以我们的结果显示的是可能的方向，而不是普遍的事实。
- Pally 可以缩小小组中的权力差距，但无法消除它。而且，在小群体中，技术上的匿名并不总是让人感觉匿名。
- 笑话是英文的，有一位专家没能理解其中一些借口。
- 玩家选了一个词之后无法收回，而且没有一个集中的地方说明谁能看到什么。
- 这个机器人只在一个服务器中工作，只对应一个语音频道和一个文字频道。

## 分工

| 成员 | 贡献 |
|---|---|
| Arthur Zhou | *（待团队补充）* |
| Kiki Su | *（待团队补充）* |
| Jeric Zhang | *（待团队补充）* |
| Elsie Xiao | *（待团队补充）* |
| Ping Cheng | *（待团队补充）* |

## 参考文献

参考文献保留英文原文，见英文版。
