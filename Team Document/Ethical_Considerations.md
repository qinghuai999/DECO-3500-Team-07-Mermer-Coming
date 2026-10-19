# Ethical Considerations — Pally

**Project:** Pally — A Discord Bot for Better Social Gameplay\
**Course:** DECO3500 Social & Mobile Computing\
**Team:** Team 07 — Mermer Coming\
**Review basis:** Player-group testing, post-test interviews, groupware evaluation, and expert heuristic evaluation recorded on 14 October 2026\
**Document status:** Final Wiki version, reviewed on 19 October 2026. The team is not planning further prototype changes for this submission. Evaluation findings and unresolved limitations are reported honestly; they are not presented as fixed.

## 1. Ethical Framework and Design Position

We use the **Ethical Disclaimer** framework from [Ethics for Designers](https://www.ethicsfordesigners.com/ethical-disclaimer) to examine our project. We consider the design context, the people affected, our intentions, possible harmful situations, and the responsibilities we should take as designers. For this final submission, we use it to reflect on research and testing evidence, acknowledge design limitations, and explain the responsibilities that remain even when no further prototype changes are planned.

Pally began in the course domain of *combatting computer game addiction*. Our research and tutor feedback led us to focus more specifically on **social compliance and group interactions in multiplayer gaming**. We are interested in moments when a player goes along with others, finds it awkward to express an opinion, or struggles to say no. Pally is **not** designed to diagnose addiction or force behaviour change.

Our central ethical principle is:

> **A tool intended to reduce social pressure should not create new pressure or remove a player's freedom to say no, change their mind, or leave.**

## 2. The Design and Who It Affects

Pally is an exploratory Discord bot with three features:

| **Feature**                  | **Intended social role**                                                                                                                                           | **Main ethical question**                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| **Random Pick — Decide**     | Give a group member a temporary opportunity to make a decision. The implemented fair rotation randomly selects a player who has not yet been chosen in the current round; a new round starts after everyone eligible has had a turn.                       | Could a neutral-looking selection be treated as an order, or place unwanted responsibility on a quieter player?       |
| **Trait Picker — Express**   | Let players select from curated, game-related traits and turn combined responses into a playful player portrait. Individual selections are not publicly displayed. | Can feedback become hurtful, identifiable, or public after the person no longer wants to submit it?                   |
| **Excuse Generator — Leave** | Let a player privately preview an absurd or humorous message and choose whether to post it to the group.                                                           | Will the group recognise a real intention to leave, or treat the signal as a joke and continue pressuring the player? |

Stakeholders include players using the features; players being evaluated; quieter or less influential teammates; the wider friendship group; Discord moderators and developers; and people participating in our research. We consider their **autonomy, dignity, trust, privacy, understanding of the interface, and freedom to participate or withdraw**.

## 3. What We Learned from Evaluation

### 3.1 Player-group testing: social and interpersonal risks

Our player evaluation compared group interaction **without Pally (Session A)** and **with Pally (Session B)**, followed by interviews. Ping, Arthur, and Jeric observed the sessions using a groupware evaluation framework; Elsie synthesised the findings into four themes. These are qualitative findings from a particular group context, not general effects proven for all gaming groups.

**Decision-making power was uneven.** More vocal members often influenced the discussion. Random Pick gave a quieter member a temporary, socially accepted chance to decide, but the player could still seek approval from more influential teammates. This shows that **random selection does not automatically remove a group's existing power hierarchy**.

**Anonymous feedback helped some players express opinions, but anonymity was fragile.** Participants noted that friends may infer who submitted a response from its content or their shared history. We should distinguish between **hiding an account name in the interface** and **guaranteeing that a person cannot be identified socially**.

**Leaving remained a negotiation.** The Excuse Generator could make someone's wish to stop more visible, but teammates could still suggest “one more game.” A playful message does not ensure that others respect the decision to leave.

**Relationship context mattered.** Participants disagreed about whether Pally was more useful with close friends or less familiar players. We therefore should not assume that everyone experiences group pressure in the same way.

### 3.2 Expert heuristic evaluation: control and usability risks

A separate heuristic evaluation recorded on **14 October 2026** involved **two experts and one moderator**. The subsequent analysis identified **seven improvement items (HE01–HE07)**: one proposed at severity 3, five at severity 2, and one at severity 1. These are **the analyst's proposed ratings**, not scores independently confirmed by both experts.

The most important finding was **HE01 — users could not clear an already selected Trait Picker word**. Even without pressing Submit, the selected word could be included when the timer ended. A player who changes their mind might therefore contribute an unwanted judgement to a public group portrait. This is not just an efficiency issue; it concerns **autonomy, consent to expression, and the ability to withdraw**.

The expert review also identified an unresponsive `/excuse` command associated with an inconsistent application name (**HE02**), difficulties locating the current panel (**HE03**), no direct way to switch excuse categories during preview (**HE04**), some hard-to-understand English humour (**HE05**), fragmented help and rule explanations (**HE06**), and an unclear *Surprise Me* label (**HE07**).

We also found protections that should be preserved: repeated random draws were blocked while one was in progress; excuse previews were private; cancelling an excuse did not publish it; and only the intended player could use the portrait-reply action. The expert evidence **did not establish a public anonymity leak or a defect in the no-repeat selection mechanism**, and we do not claim otherwise.

## 4. Ethical Risks, Existing Measures, and Final-Prototype Limitations

The following table describes what the **evaluated version of Pally** does, what our testing revealed, and the ethical implications for the final project. Because the team is not making further prototype changes for this submission, these reflections are **not an implementation plan or a list of promised fixes**.

| **Ethical concern** | **Evidence and existing measures** | **Ethical reflection and remaining limitation** |
| --- | --- | --- |
| **Control over submitted feedback** | **HE01:** A selected Trait Picker word could not be cleared and could be included after the timer expired, even without pressing Submit. | **This remains an important unresolved limitation.** A user might change their mind but still contribute a judgement to the public portrait. The final prototype should not be described as giving users full control over withdrawing feedback. This finding highlights the importance of withdrawal options in future interaction design. |
| **Expectations of anonymity** | Trait Picker hides individual selections from public output. Player interviews showed that close friends might still guess who gave feedback; the expert review did not demonstrate a technical public identity leak. | We distinguish **hidden submissions** from **guaranteed anonymity**. The final design cannot prevent people from making guesses based on relationships or context. Any demonstration or documentation should explain this limitation rather than promise complete anonymity. |
| **Hurtful evaluation or embarrassment** | The poster describes **24 curated, game-related traits** and controls against insulting language. A combined, playful portrait is shown to the group. | The structured vocabulary reduces some risks of direct insults, but it cannot guarantee that every recipient finds a label funny or comfortable. Feedback remains socially sensitive, even when it uses playful wording. Participation and personal boundaries should be respected. |
| **New pressure from Random Pick** | Player testing showed that Random Pick sometimes gave quieter members a more accepted chance to decide. The implemented selection avoids picking someone again until all eligible members have had a turn. Existing group influence remained; this technical rotation does not establish social equality. | Random selection is a **temporary decision opportunity**, not proof of equal social power or a command that everyone must obey. The current interface has no dedicated **Pass** button, although any member can initiate another draw. A selected player may therefore still feel pressured. We avoid claiming that the rotation removes group hierarchy. |
| **A wish to leave being ignored** | In user testing, teammates sometimes asked for another game after a player expressed an intention to leave. Expert testing observed a private excuse preview and cancellation without public posting. | Excuse Generator helps **communicate** a wish to leave; it does not enforce departure or ensure that others respect it. Its humour can also make the message seem less serious. The final project therefore treats it as an exit signal, not a solution that automatically removes social pressure. |
| **Unclear private/public boundaries** | The expert review observed private excuse previews and reply restrictions. **HE06** noted that rules and help were not easy to find in one place. | Existing safeguards reduce accidental public posting in the observed excuse flow, but users may still misunderstand visibility or timeout behaviour. We should not claim that every privacy rule is self-explanatory. When presenting Pally, we can explain which actions are private and which become visible to the group. |
| **Commands and navigation difficulties** | **HE02–HE04:** the `/excuse` command failed in one expert flow with inconsistent bot names; current panels were difficult to locate in busy chat; changing an excuse category required cancelling and reopening. The cause of the command failure was not established. | These are **known limitations of the evaluated interaction**, not proof that the whole bot cannot operate. The panel-based excuse flow worked in the observed expert session. We distinguish this working route from the failed command and do not present the unresolved navigation issues as corrected. |
| **Language and interpretation** | **HE05:** some humorous English excuses were difficult for one expert to understand. **HE07:** *Surprise Me* could be misunderstood as its own category rather than a random-category option. | Playful wording may not communicate the same meaning to everyone. These observations are limited and cannot be generalised to all users. In our project explanation, we can clarify what *Surprise Me* does and acknowledge that the English humour may not suit every player. |
| **Storage of personal information** | The README and Requirements §12.4 describe persistent storage of fair-rotation history (including previously selected Discord IDs) and information needed to recover an active round after restart. The storage code supports this design. Private word selections, excuse previews, reply suggestions, and interaction tokens are not intended to be written to disk. The retention period and deletion policy for saved rotation records, and any separate hosting logs, have not been established here. Recordings and quotations may also contain identifying information. | The prototype **does store limited rotation data**, so we must not describe it as storing nothing. Holding private choices in memory rather than on disk reduces one privacy risk, but does not by itself establish a retention/deletion policy for saved identifiers or what Discord retains after public posting. Public project materials should avoid identifiable recordings, unnecessary Discord IDs and private conversations without appropriate consent. |
| **Discomfort during research** | Testing deliberately introduced disagreements, peer evaluation, and attempts to leave a session. These are potentially sensitive social situations. | Participants' comfort, recording consent, and ability to withdraw remain important. We present these outcomes as observations from staged, small-scale evaluation rather than naturally occurring behaviour or evidence that the same effect applies to everyone. |

## 5. Responsibilities and Boundaries

At the final submission stage, our responsibility is to **describe the prototype accurately and communicate its limits**, rather than suggest that every issue found in testing has been resolved. Pally is designed to support voluntary social interaction, but the current Trait Picker flow does **not** fully protect a user's ability to withdraw a selected word before timeout (**HE01**). We explicitly acknowledge this tension between our design intention and the observed behaviour.

The existing prototype also includes safeguards that were observed during evaluation, such as private excuse previews, cancellation without public posting, and restrictions on who can reply to a player portrait. These are meaningful design decisions, but they do not remove every privacy or interpersonal risk. In particular, technical hiding of individual feedback is not the same as guaranteed anonymity among friends.

For the exhibition and project documentation, ethical responsibility also includes presenting the three features without exaggerated claims, making their limitations understandable, and protecting research participants' privacy. We should check that any recordings, quotations, screenshots or Discord identifiers shared publicly are appropriate to disclose. The README, requirements and persistence code describe what the prototype saves; this is **not an independent audit of all server logs, retention settings or Discord platform storage**.

There are limits to what Pally can guarantee. It cannot make teammates accept a decision, ensure that an exit request is respected, eliminate social pressure, or control Discord's platform-wide privacy and moderation. We report the expert issues **HE01–HE07** as evaluation findings; the final version is **not presented as having implemented fixes for them**.

## 6. Reflection

Our two forms of evaluation highlighted different sides of the same ethical challenge. **Player-group testing** showed that Pally sometimes gave quieter players a voice and offered less direct ways to communicate, but existing friendships, group norms and social pressure still influenced what happened. **Expert evaluation** showed that even a playful interface can limit user autonomy, especially when a chosen Trait Picker word cannot be withdrawn before automatic submission.

These findings changed how we understand Pally's role. Rather than claiming to solve social compliance or make multiplayer groups equal, we see Pally as an **experimental social mediator** that can offer alternative ways to negotiate a decision, express feedback or signal a wish to leave.

At this final project stage, **we are not planning further prototype modifications**. This does not mean that the identified problems are unimportant or that they have been fixed. Instead, we include them as transparent limitations of the evaluated design. The main lesson for future work is that a system intended to reduce social pressure must also make **choice, privacy, consent and the freedom to change one's mind** central to its interactions.

---

## References and Project Evidence

**Ethical framework**

- Ethics for Designers. [Ethical Disclaimer](https://www.ethicsfordesigners.com/ethical-disclaimer).

**Implementation and data-handling evidence**

- [Repository README](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/blob/main/README.md) — fair rotation and prototype behaviour.
- [Requirements v1.5, §§11.3 and 12.4](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/blob/main/Team%20Document/04-MVP%20%26%20Product%20Design/Requirement%20-%20social_compliance_discord_bot_v1.5.md) — no dedicated Pass control and the intended privacy/storage rules.
- [Random Pick implementation](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/blob/main/discord-example-app/picker.js) and [persistence module](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/blob/main/discord-example-app/portrait-store.js) — selection without repetition and saved rotation state.

**Existing team Wiki pages**

- [Home](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/Home) — exhibition poster and pamphlet links.
- [Literature Research](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/Literature-Research) — social compliance and related academic research.
- [User Research: Interviews](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/User-Research%3A-Interviews) — interviews and affinity analysis.
- [Requirements](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/Requirements) — experience and functional requirements.
- [Designs](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/Designs) — concept and interaction development.
- [Prototype](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/Prototype) — prototype and usage information.
- [User Testing Plan](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/User-Testing-Plan) — comparative group-testing scenarios.
- [User Testing Findings](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/User-Testing-Findings) — user-testing themes and evidence.
- [Groupware Heuristics Evaluation](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/Groupware-Heuristics-Evaluation) — observations about group interaction.
- [Heuristic Evaluation Plan](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/Heuristic-Evaluation-Plan) — expert task instructions.
- [Heuristic Evaluation Results](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/Heuristic-Evaluation-Results) — detailed HE01–HE07 evidence and priorities.
- [Stand-up and Meeting Records](https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming/wiki/Stand-up-and-Meeting-Records) — project progress, including Meetings 9 and 10.

**Evidence note:** The user-testing and poster documents should be checked for consistency in how participant numbers are counted before using a single participant total in public reporting. This page does not rely on a combined sample-size claim. Findings are reported as qualitative, context-specific observations.
