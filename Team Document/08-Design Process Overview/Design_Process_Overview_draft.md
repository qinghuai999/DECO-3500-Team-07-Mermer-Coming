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

Our tutor told us that this was not really addiction. It was social compliance: people often follow the group decision even when they want something else. So we changed our topic from game addiction to social compliance in gaming (Meeting 5). Hancock et al. (2009) show that people use small "butler lies" to leave a conversation politely. Postmes and Lea (2000) show that anonymity can change how people take part in group decisions, especially when they want to criticise. Ömerbaş (2023) and Ertac and Gurdal (2019) explain how power and leadership work in groups. These readings and researches spark three questions: how players leave, how they give feedback, and who makes the decisions.

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

### 7. Expert Evaluation

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
| Arthur Zhou | - Conduct interview questions for round 1 & 2<br> - Participated in internal prototype testing<br> - Hosted 2 user testing sessions<br> - Designed and conducted heuristic evaluations for the final prototype<br> - Contributed in team meetings and decision makings|
| Kiki Su | - Conducted the product requirement document <br> - Responsible for transforming design documents into actual prototypes, including code development, project GitHub construction, server deployment, and bug testing <br> -Established and maintained the wiki page - Actively participating in group meetings<br>|
| Jeric Zhang | - Analysed the data from both rounds of user interviews (game addiction and social compliance). <br> - Designed the interaction and visual design of the Pally bot and its three tools. <br> - Wrote the protocol for the groupware heuristic user test. - Helped organise and run the groupware heuristic user test. <br> - Designed the exhibition poster. <br> - Took part in team meetings and group decisions.|
| Elsie Xiao | - Conducted user interviews<br> - Reviewed academic literature on social compliance and group dynamics<br> - Participated in prototype testing, analysed user testing results through thematic analysis<br> - Organised GitHub Wiki documentation, including meeting records and ethical considerations |
| Ping Cheng | - Co-designed and conducted user interviews<br> - Contributed to concept and feature discussions<br> - Participated in internal prototype testing<br> - Moderated and observed testing sessions<br> - Designed and printed the promotional pamphlet for the tradeshow<br>|

## References

- Baker, K., Greenberg, S., & Gutwin, C. (2001). Heuristic evaluation of groupware based on the mechanics of collaboration.
- Ertac, S., & Gurdal, M. Y. (2019). Preference communication and leadership in group decision-making.
- Gielen, M., & De Wever, B. (2015). Structuring peer assessment: Comparing the impact of the degree of structure on peer feedback content.
- Hancock, J., Birnholtz, J., Bazarova, N., Guillory, J., Perlin, J., & Amos, B. (2009). Butler lies: Awareness, deception and design.
- Nielsen, J. (1994). 10 usability heuristics for user interface design.
- Ömerbaş, A. C. (2023). The power bases in multiplayer video games.
- Postmes, T., & Lea, M. (2000). Social processes and group decision making: Anonymity in group decision support systems.
