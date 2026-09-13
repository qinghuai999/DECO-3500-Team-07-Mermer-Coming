# Social Compliance Gaming Discord Bot
## Product / Prototype Requirements Document V1.3

> Document Status: Interaction Architecture Iteration  
> Core Context: Multiplayer Team Gaming + Discord Communication  
> Core Theme: Social Compliance / Social Power in Team Gaming


### AI Use Statement

The core ideas and feature designs were collaboratively developed and discussed by the team. AI was used only to assist with translating, refining, and improving the clarity and presentation of the written content.

---

## 1. Project Background

This project focuses on **social compliance and social power dynamics in multiplayer gaming teams**.

Within multiplayer gaming groups, social influence may not be distributed equally. For example, game organisers, more dominant members, or players who are more familiar with others may have greater influence over:

- whether the group continues for another round;
- how opinions about other players' gameplay are expressed;
- who is invited when the team needs another player;
- whose needs or disagreements are easier to express.

Members with less social influence may still have different preferences, but may choose to comply because they want to avoid awkwardness, do not want to disrupt the group atmosphere, or feel that they are “not the organiser”.

Therefore, this project proposes a Discord Bot that introduces **lightweight, humorous, playful, and system-mediated interaction mechanisms** to provide team members with more equal opportunities to:

1. express an intention to leave the gaming session;
2. express perceptions of another member's gameplay or behaviour;
3. participate in team-related decisions.

The project does not attempt to completely remove social hierarchy. Instead, it explores:

> **Whether system-mediated interactions can reduce the social cost of expressing individual preferences and provide members with more equal opportunities for expression and decision-making.**

---

## 2. Core Design Goal

The primary design goal is:

> **To use playful, system-mediated interactions to reduce unequal social pressure in multiplayer gaming teams and provide members with more equal opportunities to express themselves and participate in decisions.**

The three core features correspond to three different forms of agency:

| Feature | Social Issue | Intended Form of Agency |
|---|---|---|
| Feature 1: Funny Exit Generator | A player wants to leave but feels uncomfortable expressing it directly | Right to leave and express intention |
| Feature 2: Collaborative Player Portrait | Direct evaluation may feel targeted, confrontational, or dominated by a small number of members | Right to express and self-express |
| Feature 3: Random Picker | Team formation and invitation decisions may be concentrated in the organiser | Right to participate in team decisions |

Together, the three features address:

> **Leave — Express — Decide**

rather than functioning as three unrelated entertainment features.

---

## 3. Target Users

The primary target users are:

> **Players who communicate through Discord while participating in multiplayer team-based games.**

The prototype is particularly relevant to situations where:

- players regularly participate in multiplayer team games;
- team members have different levels of familiarity with one another;
- some members have greater social influence;
- gaming sessions are commonly organised by the same one or two people;
- some members are less comfortable expressing disagreement directly;
- Discord is an important communication channel during gaming sessions.

The project does not assume that every gaming group has serious power-related problems. Instead, it focuses on:

> **Whether system design can help members express their preferences more comfortably when differences in social influence are present.**

---

## 4. Overall Design Principles

### 4.1 Playfulness and Humour

Bot interactions should fit the informal and entertaining context of multiplayer gaming.

### 4.2 User Agency

Users are allowed to provide no input. If a user does not respond, the system should use explicit timeout and automatic handling mechanisms rather than wait indefinitely.

### 4.3 System Mediation

For interactions that may create social pressure, the Bot should act as an intermediary rather than requiring one member to directly target another.

### 4.4 Non-Offensive Content

Humour should focus on gameplay behaviour and in-game situations rather than a player's personality, identity, or real-world characteristics.

---

# 5. Unified Bot Control Panel

## 5.1 Design Purpose

The three core features no longer require users to trigger separate Slash Commands such as `/excuse`, `/portrait`, or `/recruit`.

Instead, the Bot provides a persistent unified control panel in a designated Discord channel, for example:

```text
┌────────────────────────────────────┐
│          TEAM SOCIAL PANEL         │
│                                    │
│  [🎭 Funny Exit]                   │
│  [🎨 Collaborative Portrait]       │
│  [🎲 Random Picker]             │
└────────────────────────────────────┘
```

Users can activate a feature by clicking the corresponding button without remembering or entering a command.

This improves discoverability and usability, but it also directly supports the project's Social Compliance goals. For Feature 2 and Feature 3, the public channel does not reveal who clicked the feature button. This avoids introducing additional social meanings such as:

> “That person specifically wanted everyone to evaluate someone.”

or:

> “That person specifically requested that selection opportunity be redistributed.”

---

## 5.2 Trigger Privacy Principle

Technically, Discord and the Bot backend still receive the identity of the user who clicks a button so that the interaction can be processed.

However:

> **For Feature 2 and Feature 3, the identity of the triggering user remains anonymous to other participants.**

The system must not publicly post messages such as:

```text
Kiki started Player Portrait.
```

or:

```text
Arthur started Random Picker.
```

Instead, it should only publish system-level status messages, such as:

```text
🎨 Player Portrait is starting...
```

or:

```text
🎲 Random Picker is starting...
```

Therefore, “anonymous” in this document means:

> **Other participants cannot determine from the Bot's public interaction who triggered the feature.**

It does not mean that the Bot backend is technically unable to identify the triggering user.

---

## 5.3 Behaviour of the Three Panel Buttons

### Feature 1: Funny Exit

Feature 1 represents an individual exit intention. Clicking the button first opens a private interaction for the user.

```text
Click [🎭 Funny Exit]
        ↓
Bot provides a private preview
        ↓
[Send] [Another One] [Cancel]
        ↓
Only after the user selects Send
        ↓
The final exit message is posted publicly
```

Other members do not need to know that a player is currently generating or refreshing an exit message.

### Feature 2: Collaborative Player Portrait

```text
Any member clicks [🎨 Collaborative Player Portrait]
        ↓
Bot receives the interaction in the backend
        ↓
Triggering user's identity is not publicly revealed
        ↓
Bot uses fair random selection to choose the evaluated player
        ↓
The 10-second evaluation process begins
```

The public channel only knows:

> **A Player Portrait activity has started.**

It does not reveal who started it.

### Feature 3: Random Picker

```text
Any member clicks [🎲 Random Picker]
        ↓
Bot receives the interaction in the backend
        ↓
Triggering user's identity is not publicly revealed
        ↓
Bot begins the fair random draw
        ↓
The Recruiter for the round is announced
```

The public channel only knows:

> **A Random Picker activity has started.**

It does not reveal who requested it.

---

## 5.4 Panel Usability Requirements

- **FR0.1** The Bot shall provide a unified Control Panel containing the three core features.
- **FR0.2** Users shall be able to activate a feature by clicking a button without entering a Slash Command.
- **FR0.3** The panel shall remain easily accessible, for example through a persistent Bot message in a designated channel or a pinned Bot message.
- **FR0.4** The three features shall use clear, consistent, and understandable button labels.
- **FR0.5** Public messages for Feature 2 and Feature 3 shall not reveal the identity of the triggering user.
- **FR0.6** The preparation process for Feature 1 shall remain private until the user confirms that the final exit message should be sent.
- **FR0.7** The Bot may use the interaction user ID internally to process the request, but shall not expose the triggering user's identity to other members for Feature 2 or Feature 3.

---

## 5.5 Concurrency and Duplicate Trigger Control

Because multiple users may click the panel at any time, the system must prevent the same feature from being started multiple times simultaneously.

The Bot should maintain feature state at the channel or current gaming-session level, for example:

```text
portraitActive = true / false
pickerActive = true / false
```

If Feature 2 is already active and another user clicks `[Collaborative Player Portrait]`:

- a second evaluation process must not be created;
- the current process must not be interrupted;
- the new clicking user should receive a private message such as:

```text
A Player Portrait is already in progress.
```

Feature 3 follows the same principle.

When the feature finishes, the corresponding Active state should be released so that a new round can be started.

- **FR0.8** Within the same channel/session, only one active instance of the same multiplayer feature may exist at a time.
- **FR0.9** Duplicate clicks shall not create duplicate processes.
- **FR0.10** Duplicate-trigger feedback shall be visible only to the user who clicked, so that their action is not exposed publicly.
- **FR0.11** When a feature completes, is cancelled, or terminates because of an error, the system shall correctly release its Active state.
- **FR0.12** The system shall prevent errors from leaving a feature permanently locked in an Active state.

---

# 6. Feature 1: Funny Exit Generator

## 6.1 Purpose

When a player wants to end their current gaming session, the Bot can provide an obviously exaggerated, absurd, and humorous reason for leaving.

The actual message being communicated is:

> **“I want to stop playing now.”**

The feature is not intended to help players create believable lies.

Instead, the excuses function as a **Humorous Exit Signal** that the group can recognise, reducing the social pressure associated with directly saying “I don't want to keep playing.”

---

## 6.2 Trigger

The user activates the feature through the unified Bot Control Panel by clicking:

```text
[🎭 Funny Exit]
```

Any ordinary team member should be able to use this button.

After the button is clicked, the Bot first interacts privately with that user. The exit content becomes public only after the user confirms **Send**.

---

## 6.3 User Flow

```text
Player wants to leave the gaming session
        ↓
Clicks [🎭 Funny Exit] on the panel
        ↓
Bot generates a random exaggerated excuse
        ↓
Private preview is shown only to that user
        ↓
[Send] [Another One] [Cancel]
        ↓
User selects Send
        ↓
Bot posts the final excuse to the public channel
        ↓
Other players understand that the member intends to leave
```

---

## 6.4 Functional Requirements

- **FR1.1** A user shall be able to start the Funny Exit Generator through the `[Funny Exit]` button on the unified Bot Control Panel.
- **FR1.2** The system shall generate one humorous, exaggerated, and obviously playful exit reason at a time.
- **FR1.3** The generated content shall clearly communicate that the player intends to leave.
- **FR1.4** If the user is dissatisfied with the current result, they shall be able to request another one.
- **FR1.5** The user shall be able to cancel the interaction.
- **FR1.6** The system shall not publicly post preview content before user confirmation.
- **FR1.7** The final public message shall make it clear which player intends to leave.

---

## 6.5 Content Generation Strategy

### MVP

The MVP uses a predefined JSON excuse library.

```text
Click [Funny Exit]
   ↓
Random selection from JSON
   ↓
Private preview
   ↓
Send / Another One / Cancel
```

Example:

> “Emergency: my refrigerator has just declared independence and I need to handle the diplomatic crisis immediately.”

### Future AI Version

The generation process may later be upgraded to:

```text
Click [Funny Exit]
   ↓
Construct Prompt
   ↓
Call AI
   ↓
Content safety validation
   ↓
Private preview
   ↓
Send / Regenerate / Cancel
```

AI can then provide richer and more varied humorous exit messages.

---

## 6.6 Content Safety Requirements

Generated content must not include:

- death;
- serious illness;
- accidents involving family members;
- suicide or self-harm;
- major emergencies that could reasonably be interpreted as real;
- discriminatory content relating to race, gender, religion, or similar characteristics;
- sexual harassment;
- personal attacks against other players;
- personally identifying information.

Preferred style:

> **Absurd + obviously fictional + humorous**

For example:

> ✓ “My toaster has officially filed a lawsuit against me. I need to deal with it.”

Rather than:

> ✗ “My mum has suddenly been taken to hospital.”

---

# 7. Feature 2: Collaborative Player Portrait

## 7.1 Purpose

This feature aims to give every team member an equal opportunity to express:

> **“How do I perceive this player's gameplay or behaviour in this round?”**

The system does not use:

- 1–5 numerical ratings;
- Good / Bad binary judgments;
- free-text evaluations;
- public display of raw evaluation input.

Instead, the Bot provides a **Controlled Vocabulary**. Each participant may select a maximum of one word to describe the evaluated player's gameplay or behaviour during the round.

The evaluated player follows **exactly the same evaluation process** as everyone else and can therefore self-evaluate.

Users may also choose nothing. There is no separate Skip action.

The Bot does not publish the selected keywords as a separate list, frequency table, or vote result. Instead, it aggregates the valid keywords internally and asks AI to produce two outputs:

1. one interesting and humorous sentence that naturally connects and explicitly includes the selected evaluation words; and
2. one concise, playful, non-targeted title that summarises the overall impression.

The selected words therefore appear only as part of the generated sentence rather than as a standalone evaluation result.

---

## 7.2 Trigger and Trigger Privacy

Any ordinary team member can start the activity through the unified Bot Control Panel by clicking:

```text
[🎨 Collaborative Player Portrait]
```

Users do not need to enter `/portrait`, and they cannot select the evaluated player.

The click remains hidden from other participants. The Bot backend may identify the source of the interaction, but the public channel must not reveal who initiated the Player Portrait round.

Therefore, the public flow begins with:

```text
🎨 Player Portrait is starting...
```

rather than:

```text
Kiki started Player Portrait.
```

The Bot then automatically chooses the evaluated player from the current fair-rotation candidate pool.

---

## 7.3 Evaluated Player Selection

To preserve randomness while providing relatively equal opportunities, the Bot uses:

> **Randomised Fair Rotation**

For example:

```text
[A, B, C, D, E]
```

If the first random selection is:

```text
C
```

the candidate pool becomes:

```text
[A, B, D, E]
```

The next player can only be randomly selected from the remaining members.

After every participating member has been evaluated at least once, the candidate pool resets.

This prevents unrestricted random patterns such as:

```text
A → A → C → A
```

from repeatedly selecting the same player.

---

## 7.4 User Flow

```text
Any member anonymously clicks [🎨 Collaborative Player Portrait]
        ↓
Bot randomly selects a member who has not yet been evaluated
        ↓
Bot announces the evaluated player
        ↓
Bot provides controlled keywords to all participants
        ↓
Everyone, including the evaluated player, follows the same process
        ↓
Each participant may:
[Select one word] / [Refresh] / [Do nothing]
        ↓
10-second countdown continues
        ↓
10 seconds expire
        ↓
System automatically submits everyone's current state
        ↓
No keyword selected = blank evaluation
        ↓
Bot privately aggregates all valid keywords
        ↓
Is there at least one valid keyword?
        │
     ┌──┴──┐
     │     │
    Yes    No
     │     │
     ↓     ↓
AI combines valid        AI does not analyse
keywords humorously      player performance
     │                   and generates a neutral,
     │                   absurd result
     └─────────┬─────────┘
               ↓
Bot publishes only the final AI-generated result
               ↓
No keywords, frequencies, counts, or individual choices are revealed
```

---

## 7.5 Controlled Vocabulary Requirements

The vocabulary is predefined by the system and contains only words describing **gameplay behaviour or performance**.

Examples include:

- aggressive;
- steady;
- Carry;
- lucky;
- lost;
- rushing;
- clutch;
- cautious;
- adventurous;
- talkative;
- quiet;
- team-oriented;
- kill-stealing;
- defensive;
- support-focused.

The vocabulary must not contain direct personal attacks such as:

- trash;
- useless;
- brain-dead;
- stupid;
- disgusting;
- other terms attacking personality, identity, or real-world personal characteristics.

Neither the MVP nor later planned versions allow users to enter arbitrary free-text evaluation words, reducing uncontrolled and potentially aggressive input.

---

## 7.6 Refresh Mechanism

If the currently displayed keywords do not represent what a user wants to express, they may select:

> **Refresh**

The Bot then provides another subset of words from the controlled vocabulary.

Rules:

- users may refresh before the countdown ends;
- refreshing does not reset or extend the 10-second countdown;
- each user may still retain only one final selection;
- a user may refresh multiple times and still submit no selection.

---

## 7.7 Blank Evaluation and Timeout

Each evaluation round remains open for exactly:

> **10 seconds**

All participants follow the same rules:

- users may select one word during the 10-second period;
- users may change their current selection;
- users may refresh the keyword set;
- users may do nothing;
- there is no separate Skip button;
- when 10 seconds expire, the system automatically submits everyone's current state;
- users with no selected keyword are recorded as blank evaluations;
- one or more non-responsive users must not block the round;
- the evaluation process must never wait indefinitely.

---

## 7.8 Privacy and Result Display Rules

This is a permanent design requirement for Feature 2, not a temporary MVP decision.

The Bot must not publish the selected evaluation words as a separate list, frequency table, vote count, or participant-by-participant result.

For example, the system must not display:

```text
Aggressive × 2
Lucky × 1
Carry × 1
```

and must not display:

```text
Arthur → Aggressive
Ping → Lucky
Kiki → Lost
```

However, the original selected evaluation words **must be naturally incorporated into the AI-generated sentence**.

For example, if the valid words are:

```text
aggressive
lucky
carry
lost
```

the public result may be:

> **Title: The Accidental Battlefield Tour Guide**

> “Aggressive when charging in, lucky when getting lost, and somehow still able to carry the team back home.”

Therefore:

- the original words are not separately displayed;
- no vote counts or frequencies are shown;
- no participant is linked to a specific word;
- the selected words remain visible only within the generated humorous sentence;
- the title should be a broader, playful, non-targeted summary rather than a direct label based on one negative word.

## 7.9 AI Generation Logic

### Case A: At Least One Valid Evaluation Exists

Assume the internal results from five participants are:

```text
Member A → aggressive
Member B → lucky
Member C → carry
Member D → blank
Evaluated player → lost
```

The Bot internally extracts the valid evaluation words:

```text
aggressive
lucky
carry
lost
```

The system does not publish this list.

Instead, AI must generate:

1. **one humorous sentence that naturally connects and explicitly includes the valid evaluation words**; and
2. **one concise, playful, non-targeted title that summarises the combined impression**.

For example:

> **Title: The Accidental Battlefield Tour Guide**

> “Aggressive when charging in, lucky when getting lost, and somehow still able to carry the team back home.”

The AI is not responsible for independently judging the player. Its role is:

> **To connect the evaluation words already provided by participants into a humorous shared expression, then summarise that expression with a playful and non-targeted title.**

### Case B: All Evaluations Are Blank

If the 10-second round ends with:

```text
Member A → Blank
Member B → Blank
Member C → Blank
Member D → Blank
Evaluated player → Blank
```

the system must not infer that:

- the player was skilled;
- the player was unskilled;
- the player performed averagely;
- the player lacked presence;
- or any other gameplay characteristic.

Instead, AI directly generates content that is:

- neither positive nor negative;
- unrelated to actual gameplay ability;
- absurd;
- exaggerated;
- humorous.

For example:

> **“Honorary Director of the Rift Weather Bureau”**

or:

> **“The only player this round officially certified in battlefield aerodynamics.”**

---

## 7.10 AI Behaviour Requirements

- **FR2.1** When valid keywords exist, AI shall use the semantic meaning of the valid system-provided evaluation words.
- **FR2.2** AI shall generate one coherent and humorous sentence that naturally connects and explicitly includes the valid evaluation words.
- **FR2.3** AI shall additionally generate one concise, playful, and non-targeted title that summarises the combined evaluation.
- **FR2.4** The title shall not simply repeat one potentially negative evaluation word as a direct label for the player.
- **FR2.5** AI shall not introduce unsupported negative judgments that participants did not express.
- **FR2.6** AI shall not generate personal attacks, humiliating content, or other offensive content.
- **FR2.7** AI shall not infer real-world personal characteristics from usernames, avatars, or similar information.
- **FR2.8** AI output shall remain clearly humorous, exaggerated, and game-oriented.
- **FR2.9** If all evaluations are blank, AI shall generate a neutral, non-directional, absurd sentence and a playful title without inferring player performance.
- **FR2.10** AI shall not infer player skill, behaviour, or personality from blank evaluations.
- **FR2.11** The system shall not separately publish the raw keyword list, keyword frequencies, vote counts, or participant-to-keyword mappings.

## 7.11 Feature 2 Functional Requirements

- **FR2.12** Any ordinary team member shall be able to start Feature 2 through the `[Collaborative Player Portrait]` button on the Control Panel.
- **FR2.13** The triggering user's identity shall not be publicly revealed to other participants, and the triggering user shall not be able to select the evaluated player.
- **FR2.14** The Bot shall randomly select one participant who has not yet been evaluated in the current cycle.
- **FR2.15** All participants, including the evaluated player, shall use exactly the same evaluation process.
- **FR2.16** Each user may select a maximum of one controlled keyword.
- **FR2.17** Users may change their selection before the countdown expires.
- **FR2.18** Users may refresh the current keyword set.
- **FR2.19** Refreshing the keyword set shall not restart or extend the 10-second countdown.
- **FR2.20** Users may submit no keyword.
- **FR2.21** The system shall not provide a separate Skip process.
- **FR2.22** Each evaluation round shall remain open for exactly 10 seconds.
- **FR2.23** After 10 seconds, the system shall automatically submit the current state of all participants.
- **FR2.24** A participant with no selected keyword shall automatically be recorded as a blank evaluation.
- **FR2.25** Non-responsive users shall not block the overall evaluation process.
- **FR2.26** The system shall not separately publish keyword lists, frequencies, vote counts, or individual selections; valid evaluation words may appear only as part of the AI-generated sentence.
- **FR2.27** When valid keywords exist, AI shall generate one humorous sentence explicitly incorporating the valid evaluation words and one concise, non-targeted playful title.
- **FR2.28** When all evaluations are blank, AI shall generate neutral, absurd, and non-directional content.
- **FR2.29** The final public output shall contain the AI-generated sentence and title; the evaluation words shall not be displayed separately from that sentence.

---

# 8. Feature 3: Random Picker

## 8.1 Purpose

In multiplayer teams, decisions about who should be invited may naturally become concentrated among:

- the game organiser;
- more socially dominant members;
- central social figures within the group.

Other members may also have friends they would like to invite but may feel uncomfortable suggesting them because they are not the organiser.

This feature therefore uses the Bot to:

> **Temporarily redistribute the opportunity to decide who may invite the next player.**

The Bot does not decide **who should be invited**. Instead, it determines:

> **Who receives the opportunity to make that decision for the current round.**

---

## 8.2 Trigger and Trigger Privacy

When the team believes another player is needed, any ordinary member may click:

```text
[🎲 Random Picker]
```

on the unified Bot Control Panel.

Users do not need to enter `/recruit`.

The triggering user's identity remains hidden from other participants. The Bot backend may process the interaction information, but the public channel must not reveal who started the draw.

The MVP does not automatically determine whether the game team actually needs another player. Team members decide when the feature is needed and activate it through the panel.

---

## 8.3 User Flow

```text
Team needs another player
        ↓
Any member anonymously clicks [🎲 Random Picker]
        ↓
Bot identifies eligible current members
        ↓
Bot uses fair random selection to choose one Recruiter
        ↓
Bot announces:
“This round's selection right belongs to: Kiki”
        ↓
Kiki decides whether she has someone she wants to invite
        ↓
      ┌───────────────┴───────────────┐
      │                               │
     Yes                              No
      │                               │
      ↓                               ↓
Invite that friend              [Pass / Draw Again]
      │                               ↓
      │                   Kiki is removed from
      │                   the current draw pool
      │                               ↓
      │                   Bot draws from the
      │                   remaining members
      ↓
     End
```

---

## 8.4 Fairness Mechanism

Feature 3 also uses:

> **Randomised Fair Rotation**

For example:

```text
[A, B, C, D, E]
```

If A has already received the picking opportunity, subsequent draws prioritise:

```text
[B, C, D, E]
```

until all eligible members have received an opportunity.

The candidate pool then resets.

This prevents the original organiser from repeatedly receiving decision-making power simply because of random outcomes.

---

## 8.5 Functional Requirements

- **FR3.1** Any ordinary team member shall be able to start the Random Picker feature through the `[Random Picker]` button on the Control Panel.
- **FR3.2** The triggering user's identity shall not be publicly revealed to other participants, and the triggering user shall not be able to choose the selected picker.
- **FR3.3** The Bot shall use fair random selection among eligible members.
- **FR3.4** The selected member shall receive the first opportunity to invite a new player for that round.
- **FR3.5** The selected member shall be able to Pass.
- **FR3.6** After passing, that member shall be temporarily removed from the current draw pool.
- **FR3.7** The Bot shall then draw again from the remaining eligible members.
- **FR3.8** The system shall avoid repeatedly selecting the same member before others receive an opportunity.
- **FR3.9** The candidate pool may reset after all eligible members have received an opportunity.
- **FR3.10** If all eligible members Pass, the current picking process shall end.

---

# 9. Overall Bot Interaction Style

The Bot personality should remain:

- playful;
- exaggerated;
- friendly;
- humorous;
- lightweight;
- non-preachy.

The Bot should not feel like:

- a health intervention tool;
- a gaming behaviour monitoring system;
- a formal performance evaluation system.

At the same time, it should not become a purely meme-oriented Bot.

The intended balance is:

> **Playful on the surface, with a meaningful social mechanism underneath.**

---

# 10. Permission Model

Core features should not be restricted to:

- Server Admins;
- Server Owners;
- game organisers.

Ordinary team members should be able to:

- click `[Funny Exit]`;
- click `[Collaborative Player Portrait]`;
- participate in Feature 2 keyword selection;
- be randomly selected as the evaluated player in Feature 2;
- self-evaluate in Feature 2;
- click `[Random Picker]`;
- be selected as the Recruiter in Feature 3.

Otherwise, the design would contradict itself:

> **The project aims to redistribute social power, while the technical permission model would return control to administrators or organisers.**

---

# 11. Failure and Edge Cases

## 11.1 Feature 1

### AI API Unavailable

If the future AI version experiences an API failure:

> automatically fall back to the predefined JSON excuse library.

### User Cancels

No content is posted to the public channel.

---

## 11.2 Feature 2

### Some Members Do Not Respond

After 10 seconds, their responses are automatically recorded as blank evaluations and the process continues.

### All Members Submit Blank Evaluations

AI generates neutral, non-directional, absurd content.

### Everyone Has Already Been Evaluated

Reset the current candidate pool and begin a new fair-random cycle.

### AI API Unavailable

The system should provide a fallback mechanism:

- if valid keywords exist, use predefined humorous templates to construct a result;
- if all evaluations are blank, randomly select from a neutral absurd-result library.

### Small Number of Participants

The system may warn users that participation is limited, but does not need to block the feature.

---

## 11.3 Feature 3

### Selected Recruiter Has Nobody to Invite

The user selects Pass and the Bot draws again.

### Everyone Passes

The current picking process ends.

### Member Leaves During the Process

Remove that member from the current eligible pool.

---

# 12. Non-Functional Requirements

## 12.1 Usability

First-time users should be able to understand the main interactions through Bot prompts, buttons, and short instructions.

## 12.2 Responsiveness

Users should receive timely feedback after clicking buttons or interacting with the Bot.

## 12.3 Reliability

Failure of the AI API should not make the core prototype unusable.

## 12.4 Privacy

The system should retain only the data required for the current functionality.

For Feature 2 in particular:

> Raw evaluation keywords are used only for backend generation and are never publicly exposed.

## 12.5 Safety

All system-generated content must follow the non-offensive content principles.

## 12.6 Consistency

All three features should use consistent:

- Bot tone;
- button styles;
- prompts;
- naming conventions;
- humour style.

---

# 13. MVP Scope

## 13.1 Feature 1 MVP

Required:

```text
Click [Funny Exit]
→ Random JSON excuse
→ Private preview
→ Another One
→ Send
→ Cancel
```

AI generation is reserved for a later iteration.

---

## 13.2 Feature 2 MVP

Required:

```text
Click [Collaborative Player Portrait]
→ Hide triggering user's identity
→ Fair random selection of evaluated player
→ Controlled vocabulary for all participants
→ Maximum one word per participant
→ Refresh supported
→ Self-evaluation supported
→ Blank input allowed
→ Fixed 10-second countdown
→ Blank submission on timeout
→ Private aggregation of valid keywords
→ No separate public list of evaluation words or vote counts
→ AI sentence naturally incorporating the selected words
→ AI-generated playful, non-targeted summary title
→ Neutral absurd result when all inputs are blank
```

Among the three features, Feature 2 is the **highest-priority feature for AI integration in the MVP**.

---

## 13.3 Feature 3 MVP

Required:

```text
Click [Random Picker]
→ Hide triggering user's identity
→ Fair random picker selection
→ Announce selected picker
→ Pass
→ Draw Again
→ End if everyone passes
```

Automatic detection of whether the game team needs another player is outside the MVP scope.

---

# 14. Future Extensions

After the MVP is complete, possible future iterations include:

- AI-generated exit messages for Feature 1;
- richer AI-generated Player Portraits;
- Discord Voice Channel awareness;
- automatic Gaming Session detection;
- expanded controlled keyword libraries;
- different humour styles;
- persistent history for fair rotation across sessions;
- group-specific custom vocabulary;
- configurable Bot personality.

These are not part of the current core MVP.

---

# 15. User Evaluation Focus

User evaluation should not focus only on:

> **“Is the Bot fun?”**

Instead, it should test the Social Mechanism behind each feature.

## 15.1 Feature 1: Funny Exit Generator

Key questions:

- Does the feature make it easier for players to express an intention to leave?
- Does it reduce the awkwardness of directly saying “I don't want to keep playing”?
- Can teammates correctly understand that the player genuinely intends to leave?
- Can humour make the exit intention unclear?
- Do the preview and “Another One” mechanisms provide enough user control?

---

## 15.2 Feature 2: Collaborative Player Portrait

Key questions:

- Do users feel that they have an opportunity to express their views?
- Does the evaluated player still feel personally targeted?
- Does system-based random selection reduce the feeling of being targeted?
- Is the controlled vocabulary expressive enough for users' intended gameplay observations?
- Is the Refresh function useful?
- Is 10 seconds too long or too short?
- Does allowing users to provide no input reduce participation pressure?
- Does avoiding a separate display of raw keywords and vote counts make users more comfortable expressing themselves?
- Does the AI-generated sentence naturally connect the selected words while remaining humorous?
- Does AI introduce offensive or unsupported interpretations that were not present in the original input?
- When everyone submits blank input, does the neutral absurd fallback feel natural and enjoyable?
- Does the mechanism unintentionally create new peer pressure?

---

## 15.3 Feature 3: Random Picker

Key questions:

- Do ordinary members feel that they have more opportunity to participate in team decisions?
- Does the fair-random mechanism feel fair?
- Are members who are not normally organisers more willing to invite their own friends?
- Does the Pass mechanism feel natural?
- Does the original organiser still influence the final decision?
- Does temporarily assigning decision-making opportunity change how players experience social power within the team?

---

# 16. Overall Conceptual Structure

```text
                Social Compliance
                       │
              Unified Bot Control Panel
                       │
        Users click buttons without Slash Commands
                       │
     Feature 2 / 3 hide the triggering user's identity
                       │
              Unequal Social Influence
                       │
        ┌──────────────┼──────────────┐
        │              │              │
       LEAVE          EXPRESS        DECIDE
        │              │              │
 Funny Exit      Collaborative      Random
 Generator       Player Portrait    Recruiter
        │              │              │
        ↓              ↓              ↓
Lower the social   More equal       Shared opportunity
cost of leaving    expression       to make team decisions
```

The core logic of the three features can be summarised as:

> **Feature 1:** The Bot does not decide whether a player should leave. It reduces the social cost of expressing “I want to leave.”

> **Feature 2:** The Bot does not independently judge a player. Instead, all members, including the evaluated player, use the same controlled mechanism to express their perspectives. The selected words are not displayed separately; AI connects them into a humorous sentence and generates a playful, non-targeted summary title.

> **Feature 3:** The Bot does not decide who should be invited. It fairly redistributes the opportunity to decide who gets to make that choice.

---

## 17. Current Version: Confirmed Design Decisions

The following product rules are confirmed in V1.3:

1. Feature 1 uses a JSON excuse library in the MVP; AI generation is a later iteration.
2. Feature 2's evaluated player is selected by the system and cannot be manually specified by a user.
3. Feature 2 uses Randomised Fair Rotation to avoid repeatedly selecting the same player.
4. All users follow exactly the same Feature 2 process, including the evaluated player.
5. Feature 2 does not provide a Skip button; users may simply provide no input.
6. Feature 2 uses a fixed 10-second evaluation window, after which non-responsive users automatically submit blank evaluations.
7. Feature 2 supports Refresh, but refreshing does not extend the 10-second countdown.
8. Feature 2 never displays selected words as a separate list, frequencies, vote counts, or participant-to-word mappings; selected words appear only inside the AI-generated sentence.
9. If at least one valid Feature 2 keyword exists, AI connects the selected words into one humorous sentence and generates a concise, playful, non-targeted summary title.
10. If all Feature 2 evaluations are blank, AI generates a neutral, absurd result with no positive or negative direction.
11. Feature 2 AI must not introduce personal attacks or additional negative judgments that are not supported by the input.
12. Feature 3 is manually activated by users; the MVP does not automatically determine whether the team needs another player.
13. Feature 3, Random Picker, uses Randomised Fair Rotation to select the member who receives the temporary invitation opportunity.
14. A member selected by Feature 3 who has nobody to invite may Pass, after which the Bot draws again.
15. All three features are integrated into a persistent Bot Control Panel and do not require users to enter Slash Commands.
16. The triggering identities for Feature 2 and Feature 3 are used only for backend interaction processing and are not publicly revealed to other participants.
17. Feature 1 begins as a private interaction and becomes public only when the user confirms the final exit message.
18. Feature 2 and Feature 3 require Active State / concurrency control to prevent simultaneous clicks from creating duplicate processes.
19. Duplicate-trigger or “already active” feedback must be returned privately to the clicking user so that the triggering action is not exposed.


AI Use Statement: The core ideas and feature designs were collaboratively developed and discussed by the team. AI was used only to assist with translating, refining, and improving the clarity and presentation of the written content.