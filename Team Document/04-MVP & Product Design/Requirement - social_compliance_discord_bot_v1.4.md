# Social Compliance Gaming Discord Bot — Pally
## Product / Prototype Requirements Document V1.4

> Document Status: Aligned with the deployed prototype; Evaluated Player Reply added  
> Core Context: Multiplayer Team Gaming + Discord Communication  
> Core Theme: Social Compliance / Social Power in Team Gaming


### AI Use Statement

The core ideas and feature designs were collaboratively developed and discussed by the team. AI was used only to assist with translating, refining, and improving the clarity and presentation of the written content.

---

## What Changed in V1.4

V1.4 makes two kinds of change.

**1. A new interaction.** Following tutor feedback, the player who is described in Feature 2 can now answer the group's portrait. The reply is written back onto the same result card. See Section 7.12.

**2. Alignment with the deployed prototype.** V1.3 described the design before it was built. The following points now describe what the running Bot actually does.

| Area | V1.3 | V1.4 (as built) |
|---|---|---|
| Product and feature names | Funny Exit, Collaborative Player Portrait, Random Picker | The Bot is called **Pally**. Its features are **Excuse Generator**, **Trait Picker** and **Random Pick** |
| Opening the panel | A persistent panel only | `/social` posts the panel in the current channel without showing who asked for it. A pinned panel is optional |
| Who takes part | "Team members" | The players who are in the configured game voice channel at that moment |
| Feature 1 content | One kind of excuse, for leaving | Six categories: Leave, Decline, Cancel, Blame, Delay, Surprise Me |
| Feature 2 timing | 10 seconds, no submit action | 30 seconds, with a **Submit** button; the round ends early once everyone has submitted |
| Feature 2 text | AI-generated sentence and title | Predefined templates. AI generation is a future extension |
| Feature 2 vocabulary | An example list | 17 fixed words in three groups |
| Feature 2 result | The round ended at the result | The described player can reply (new in V1.4) |
| Feature 3 purpose | Choosing who may invite the next player | Choosing who makes the group's current decision |
| Feature 3 Pass / Draw Again | Required | Removed |
| Fair rotation memory | Per session | Saved to disk, so it survives a Bot restart |

---

## 1. Project Background

This project focuses on **social compliance and social power dynamics in multiplayer gaming teams**.

Within multiplayer gaming groups, social influence may not be distributed equally. For example, game organisers, more dominant members, or players who are more familiar with others may have greater influence over:

- whether the group continues for another round;
- how opinions about other players' gameplay are expressed;
- which choice the group makes, such as what to play next or who is invited;
- whose needs or disagreements are easier to express.

Members with less social influence may still have different preferences, but may choose to comply because they want to avoid awkwardness, do not want to disrupt the group atmosphere, or feel that they are “not the organiser”.

Therefore, this project proposes a Discord Bot, **Pally**, that introduces **lightweight, humorous, playful, and system-mediated interaction mechanisms** to provide team members with more equal opportunities to:

1. say no: leave, decline, cancel or delay;
2. express perceptions of another member's gameplay or behaviour, and answer the perceptions others hold of them;
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
| Feature 1: Excuse Generator | A player wants to leave, decline or delay but feels uncomfortable saying so directly | Right to leave and to say no |
| Feature 2: Trait Picker | Direct evaluation may feel targeted, confrontational, or dominated by a small number of members; the person evaluated usually has no comfortable way to answer | Right to express, to self-express, and to reply |
| Feature 3: Random Pick | Group decisions may be concentrated in the organiser or the most vocal members | Right to participate in team decisions |

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

Users are allowed to provide no input. If a user does not respond, the system should use explicit timeout and automatic handling mechanisms rather than wait indefinitely. Not responding is never announced publicly.

### 4.3 System Mediation

For interactions that may create social pressure, the Bot should act as an intermediary rather than requiring one member to directly target another.

### 4.4 Non-Offensive Content

Humour should focus on gameplay behaviour and in-game situations rather than a player's personality, identity, or real-world characteristics.

---

# 5. Unified Bot Control Panel

## 5.1 Design Purpose

The three core features are opened from one control panel instead of three separate commands.

Any member can type `/social` in the team's text channel. The Bot then posts the panel at the bottom of that channel:

```text
┌──────────────────────────────────────────────────────────┐
│  🎮 Pally Together!                                      │
│  Play together. Enjoy together.                          │
│                                                          │
│  🎲 Random Pick · Let chance make the choice.            │
│  🎨 Trait Picker · Share a word. Build a portrait.       │
│  🎭 Excuse Generator · Find your wonderfully unlikely    │
│     excuse.                                              │
│                                                          │
│  [🎲 Random Pick] [🎨 Trait Picker] [🎭 Excuse Generator] │
└──────────────────────────────────────────────────────────┘
```

The panel is a normal Bot message. It does not show who typed `/social`, and the person who typed it only receives a private confirmation. Each use of `/social` posts a fresh panel at the bottom of the channel; older panels keep working.

Teams that prefer a fixed location can also have the developer publish one pinned panel in a dedicated channel. This is optional.

Users activate a feature by clicking its button. This improves discoverability and usability, but it also directly supports the project's Social Compliance goals. For Feature 2 and Feature 3, the public channel does not reveal who clicked the feature button. This avoids introducing additional social meanings such as:

> “That person specifically wanted everyone to evaluate someone.”

or:

> “That person specifically requested that the decision be handed to someone else.”

`/excuse` remains available as a shortcut that opens the Excuse Generator's private flow directly.

---

## 5.2 Trigger Privacy Principle

Technically, Discord and the Bot backend still receive the identity of the user who clicks a button so that the interaction can be processed.

However:

> **For Feature 2 and Feature 3, the identity of the triggering user remains anonymous to other participants.**

The system must not publicly post messages such as:

```text
Kiki started Trait Picker.
```

or:

```text
Arthur started Random Pick.
```

Instead, it only publishes system-level messages, such as:

```text
🎨 Time for a review!
The lucky one is… @Arthur
```

or:

```text
🔎 Finding players in the game voice channel…
```

Therefore, “anonymous” in this document means:

> **Other participants cannot determine from the Bot's public interaction who triggered the feature.**

It does not mean that the Bot backend is technically unable to identify the triggering user.

---

## 5.3 Who Takes Part

Trait Picker and Random Pick are group activities. The Bot treats **the players who are currently in the team's game voice channel** as the group:

- only those players can start Trait Picker or Random Pick, and only from the team's text channel;
- a player who is not in the voice channel receives a private note asking them to join it first;
- players who join the voice channel after a round has started take part from the next round;
- players who leave the voice channel during a round are removed from that round.

The Excuse Generator is individual. Any member of the server can use it.

Participation depends on being present in the voice channel, never on a Discord role. See Section 10.

---

## 5.4 Behaviour of the Three Panel Buttons

### Feature 1: Excuse Generator

Feature 1 represents an individual intention. Clicking the button first opens a private interaction for the user.

```text
Click [🎭 Excuse Generator]
        ↓
Bot privately shows six categories
        ↓
User picks a category
        ↓
Bot provides a private preview
        ↓
[Send] [Another One] [Cancel]
        ↓
Only after the user selects Send
        ↓
The final excuse is posted publicly
```

Other members do not need to know that a player is currently choosing or refreshing an excuse.

### Feature 2: Trait Picker

```text
Any player in the voice channel clicks [🎨 Trait Picker]
        ↓
Bot receives the interaction in the backend
        ↓
Triggering user's identity is not publicly revealed
        ↓
Bot uses fair random selection to choose the described player
        ↓
The 30-second round begins
        ↓
Result card is published
        ↓
The described player may reply on the card
```

The public channel only knows:

> **A Trait Picker round has started.**

It does not reveal who started it.

### Feature 3: Random Pick

```text
Any player in the voice channel clicks [🎲 Random Pick]
        ↓
Bot receives the interaction in the backend
        ↓
Triggering user's identity is not publicly revealed
        ↓
Bot begins the fair random draw
        ↓
The player who makes this decision is announced
```

The public channel only knows:

> **A Random Pick draw has started.**

It does not reveal who requested it.

---

## 5.5 Panel Usability Requirements

- **FR0.1** The Bot shall provide a unified Control Panel containing the three core features.
- **FR0.2** Once the panel is visible, users shall be able to activate every feature by clicking a button, without entering a further command.
- **FR0.3** The panel shall remain easily accessible: any member can bring it to the bottom of the channel with `/social`, and a pinned panel may be published in a dedicated channel.
- **FR0.4** The three features shall use clear, consistent, and understandable button labels.
- **FR0.5** Public messages for Feature 2 and Feature 3 shall not reveal the identity of the triggering user.
- **FR0.6** The preparation process for Feature 1 shall remain private until the user confirms that the final excuse should be sent.
- **FR0.7** The Bot may use the interaction user ID internally to process the request, but shall not expose the triggering user's identity to other members for Feature 2 or Feature 3.
- **FR0.13** The panel posted by `/social` shall not show, quote or mention the user who requested it.
- **FR0.14** Feature 2 and Feature 3 shall be available only to players in the configured game voice channel, and only from the configured text channel. Anyone else shall receive a private explanation.

---

## 5.6 Concurrency and Duplicate Trigger Control

Because multiple users may click the panel at any time, the system must prevent the same feature from being started multiple times simultaneously.

The Bot keeps one active state per multiplayer feature for the team's channel:

```text
Trait Picker round in progress: yes / no
Random Pick draw in progress:   yes / no
```

If a Trait Picker round is already active and another user clicks `[🎨 Trait Picker]`:

- a second round is not created;
- the current round is not interrupted;
- the new clicking user receives a private message:

```text
A Trait Picker is already in progress.
```

Random Pick follows the same principle.

When the feature finishes, the active state is released so that a new round can be started. The reply step of Feature 2 (Section 7.12) happens **after** the active state is released, so a team never has to wait for a reply before starting the next round.

If the Bot restarts in the middle of a round, it closes the interrupted public message with a short notice and releases the state.

- **FR0.8** Within the same channel/session, only one active instance of the same multiplayer feature may exist at a time.
- **FR0.9** Duplicate clicks shall not create duplicate processes.
- **FR0.10** Duplicate-trigger feedback shall be visible only to the user who clicked, so that their action is not exposed publicly.
- **FR0.11** When a feature completes, is cancelled, or terminates because of an error, the system shall correctly release its Active state.
- **FR0.12** The system shall prevent errors from leaving a feature permanently locked in an Active state, including after a Bot restart.

---

# 6. Feature 1: Excuse Generator

## 6.1 Purpose

When a player wants to step away from what the group is doing, the Bot can provide an obviously exaggerated, absurd, and humorous reason.

The actual message being communicated is one of:

> **“I want to stop now.” / “Not this time.” / “I can't make it.” / “That wasn't my fault.” / “Give me a moment.”**

The feature is not intended to help players create believable lies.

Instead, the excuses function as a **Humorous Exit Signal** that the group can recognise, reducing the social pressure associated with directly saying “I don't want to keep playing.”

---

## 6.2 Trigger

The user activates the feature through the unified Bot Control Panel by clicking:

```text
[🎭 Excuse Generator]
```

or by typing `/excuse`.

Any ordinary member should be able to use it.

After the button is clicked, the Bot first interacts privately with that user. The excuse becomes public only after the user confirms **Send**.

---

## 6.3 Categories

The private menu offers six categories, so the excuse matches what the player actually wants to say.

| Category | What the player means | Public announcement |
|---|---|---|
| 🚪 Leave | I wanna go | “@player is signing off for now!” |
| ✋ Decline | Not this time | “@player is sitting this one out!” |
| 📅 Cancel | Can't make it | “@player has a change of plans!” |
| 👉 Blame | Not my fault | “@player has an explanation!” |
| ⏰ Delay | Maybe later | “@player needs a little more time!” |
| 🎲 Surprise Me | I'm feeling lucky | Uses the announcement of whichever category the drawn excuse belongs to |

The announcement line states the intention plainly, so the humour of the excuse does not hide what the player is asking for.

---

## 6.4 User Flow

```text
Player wants to leave, decline, cancel, explain or delay
        ↓
Clicks [🎭 Excuse Generator] on the panel
        ↓
Private menu: choose a category
        ↓
Bot picks a random exaggerated excuse from that category
        ↓
Private preview is shown only to that user
        ↓
[Send] [Another One] [Cancel]
        ↓
User selects Send
        ↓
Bot posts the announcement and the excuse to the public channel
        ↓
Other players understand what the member intends
```

Example public message:

```text
🎭 @Ping is signing off for now!
> My noodles have scheduled a mandatory meeting, and the agenda is getting soggy.
```

---

## 6.5 Functional Requirements

- **FR1.1** A user shall be able to start the Excuse Generator through the `[Excuse Generator]` button on the unified Bot Control Panel.
- **FR1.2** The system shall generate one humorous, exaggerated, and obviously playful excuse at a time.
- **FR1.3** The public message shall clearly communicate the player's intention through a plain announcement line.
- **FR1.4** If the user is dissatisfied with the current result, they shall be able to request another one. The same excuse shall not be shown twice in a row.
- **FR1.5** The user shall be able to cancel the interaction.
- **FR1.6** The system shall not publicly post preview content before user confirmation.
- **FR1.7** The final public message shall make it clear which player the excuse belongs to.
- **FR1.8** The user shall choose a category before an excuse is shown.
- **FR1.9** A private preview shall expire after 10 minutes.
- **FR1.10** Only the user who opened a preview shall be able to send it, and pressing Send more than once shall not post the excuse more than once.

---

## 6.6 Content Generation Strategy

### Current Version

The prototype uses a predefined JSON library of 61 excuses across the five content categories.

```text
Click [Excuse Generator]
   ↓
Choose a category
   ↓
Random selection from the JSON library
   ↓
Private preview
   ↓
Send / Another One / Cancel
```

Example:

> “My fridge and washing machine have declared independence. I have to attend their first cabinet meeting.”

### Future AI Version

The generation process may later be upgraded to:

```text
Click [Excuse Generator]
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

AI can then provide richer and more varied excuses.

---

## 6.7 Content Safety Requirements

Excuses must not include:

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

# 7. Feature 2: Trait Picker

## 7.1 Purpose

This feature aims to give every team member an equal opportunity to express:

> **“How do I perceive this player's gameplay or behaviour in this round?”**

and to give the player being described an equal opportunity to answer:

> **“This is how that sounds to me.”**

The system does not use:

- 1–5 numerical ratings;
- Good / Bad binary judgments;
- free-text evaluations;
- public display of raw evaluation input.

Instead, the Bot provides a **Controlled Vocabulary**. Each participant may select a maximum of one word to describe the selected player's gameplay or behaviour during the round.

The selected player follows **exactly the same evaluation process** as everyone else and can therefore self-evaluate.

Users may also choose nothing. There is no separate Skip action.

The Bot does not publish the selected words as a separate list, frequency table, or vote result. Instead, it combines the valid words internally and produces two outputs:

1. one humorous sentence that naturally connects and explicitly includes the selected words; and
2. one concise, playful, non-targeted title that summarises the overall impression.

The selected words therefore appear only as part of the generated sentence rather than as a standalone evaluation result.

After the result is published, the selected player may reply to it. The reply is added to the same card (Section 7.12).

---

## 7.2 Trigger and Trigger Privacy

Any player in the game voice channel can start the activity through the unified Bot Control Panel by clicking:

```text
[🎨 Trait Picker]
```

Users cannot select the player to be described.

The click remains hidden from other participants. The Bot backend may identify the source of the interaction, but the public channel must not reveal who initiated the round.

Therefore, the public flow begins with:

```text
🎨 Time for a review!
The lucky one is… @Arthur
Everyone in the game voice channel, including the selected player, can share one word anonymously.
Choose below, then press Submit, or your last choice will be submitted automatically in 30 seconds.

[Choose Traits]
```

rather than:

```text
Kiki started Trait Picker.
```

---

## 7.3 Selected Player Rotation

To preserve randomness while providing relatively equal opportunities, the Bot uses:

> **Randomised Fair Rotation**

The candidates are the players currently in the game voice channel. For example:

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

After every present member has been selected once, the candidate pool resets.

This prevents unrestricted random patterns such as:

```text
A → A → C → A
```

from repeatedly selecting the same player.

The rotation history is saved, so restarting the Bot does not reset it.

---

## 7.4 User Flow

```text
Any player anonymously clicks [🎨 Trait Picker]
        ↓
Bot randomly selects a player who has not yet been selected in this cycle
        ↓
Bot announces the selected player and shows [Choose Traits]
        ↓
Each participant, including the selected player, opens a private word selector
        ↓
Each participant may:
[Highlight one word] / [Other…] / [Submit] / [Do nothing]
        ↓
30-second countdown continues
        ↓
Everyone has pressed Submit, or 30 seconds expire
        ↓
System collects every submitted word and every highlighted word
        ↓
No word highlighted = blank evaluation
        ↓
Bot privately combines all valid words
        ↓
Is there at least one valid word?
        │
     ┌──┴──┐
     │     │
    Yes    No
     │     │
     ↓     ↓
Words are combined       No performance is
into a humorous          inferred; a neutral
sentence and title       result is shown
     │                         │
     ↓                         ↓
Result card published    Result card published
with a reply invitation  with no reply invitation
     │
     ↓
Selected player may reply on the card (Section 7.12)
```

No words, frequencies, counts, or individual choices are revealed at any step.

---

## 7.5 Controlled Vocabulary Requirements

The vocabulary is predefined by the system and contains only words describing **gameplay behaviour or performance**. The current vocabulary has 17 words:

| Leaning | Words |
|---|---|
| Positive | supportive, strategic, funny, creative, patient, adaptable, encouraging |
| Negative | reckless, distracted, hesitant, impatient, overconfident, chaotic |
| Neutral | energetic, lucky, cautious, adventurous |

The “leaning” of a word is used only to choose suitable reply suggestions (Section 7.12). It is never shown to users.

The words are arranged in three groups of seven. Each participant sees one group at a time. Different participants start on different groups, so the team does not all see the same seven words first.

The vocabulary must not contain direct personal attacks such as:

- trash;
- useless;
- brain-dead;
- stupid;
- disgusting;
- other terms attacking personality, identity, or real-world personal characteristics.

Neither the current version nor later planned versions allow users to enter arbitrary free-text **evaluation words**, reducing uncontrolled and potentially aggressive input. The only free text in this feature is the selected player's own signed reply (Section 7.12), which is public and attributed to its author.

---

## 7.6 Showing Other Words

If the currently displayed words do not represent what a user wants to express, they may select:

> **Other…**

The Bot then shows the next group of words from the controlled vocabulary.

Rules:

- users may press Other… at any time before the countdown ends;
- pressing Other… does not reset or extend the 30-second countdown;
- each user may still keep only one selection;
- a word that is already highlighted stays visible and highlighted while browsing other groups;
- a user may browse several times and still submit no selection.

---

## 7.7 Selecting, Submitting, Blank Evaluation and Timeout

Each evaluation round remains open for at most:

> **30 seconds**

All participants follow the same rules:

- clicking a word highlights it as the user's current choice; it is not yet final;
- users may change their highlighted word as often as they like;
- pressing **Submit** locks the highlighted word, closes the private selector and cannot be undone;
- when every participant has pressed Submit, the round ends immediately without waiting for the countdown;
- when 30 seconds expire, the system automatically submits every word that is highlighted at that moment;
- users may do nothing; there is no separate Skip button;
- users with no highlighted word are recorded as blank evaluations;
- one or more non-responsive users must not block the round;
- the evaluation process must never wait indefinitely.

Changes in the voice channel during a round:

- a player who joins after the round started is told privately that they can take part in the next round;
- a player who leaves loses their word for this round, even if they return;
- if the selected player leaves, the round is cancelled with a short public notice and no result is produced;
- if the Bot loses its connection to the voice channel, the round is cancelled in the same way.

---

## 7.8 Privacy and Result Display Rules

This is a permanent design requirement for Feature 2, not a temporary MVP decision.

The Bot must not publish the selected evaluation words as a separate list, frequency table, vote count, or participant-by-participant result.

For example, the system must not display:

```text
Strategic × 2
Impatient × 1
Overconfident × 1
```

and must not display:

```text
Arthur → Strategic
Ping → Impatient
Kiki → Overconfident
```

However, the original selected evaluation words **must be naturally incorporated into the generated sentence**.

For example, if the valid words are:

```text
strategic
impatient
overconfident
```

the public result is:

```text
🎨 Group Reflection
The Pocket-Sized Grandmaster
@Arthur

In the team's eyes, this player is strategic with every tiny advantage,
impatient with doors that open too slowly and overconfident before checking
the health bar. Together, these traits turn an ordinary mission into a story
worth retelling.

Built from anonymous group input · Pally Together!
```

Therefore:

- the original words are not separately displayed;
- no vote counts or frequencies are shown; a word chosen by several people appears once;
- the words always appear in the vocabulary's fixed order, so their position reveals nothing about who chose them or when;
- no participant is linked to a specific word;
- the selected words remain visible only within the generated humorous sentence;
- the title is a broader, playful, non-targeted summary rather than a direct label based on one negative word;
- private selections are held only in memory for the length of the round and are never written to disk.

## 7.9 Portrait Generation Logic

### Current Version: Templates

The prototype builds the portrait from predefined text, without an external AI service:

- every vocabulary word has one humorous phrase that contains the word, for example *lucky* → “lucky when the dice escape gravity”;
- the phrases of the valid words are joined into one sentence;
- every vocabulary word also has one playful title, for example *distracted* → “The Side Quest Magnet”; the title of the first valid word is used;
- three word combinations have their own title: strategic + chaotic → “The Strategist with a Confetti Cannon”, patient + impatient → “The Zen Master of Fast Forward”, lucky + adventurous → “The Accidental Expedition Leader”.

The generator is not responsible for independently judging the player. Its role is:

> **To connect the evaluation words already provided by participants into a humorous shared expression, then summarise that expression with a playful and non-targeted title.**

### Case A: At Least One Valid Evaluation Exists

Assume the internal results from four participants are:

```text
Member A → strategic
Member B → impatient
Member C → blank
Selected player → overconfident
```

The Bot internally extracts the valid evaluation words:

```text
strategic
impatient
overconfident
```

The system does not publish this list. It publishes the card shown in Section 7.8.

### Case B: All Evaluations Are Blank

If the round ends with every evaluation blank, the system must not infer that:

- the player was skilled;
- the player was unskilled;
- the player performed averagely;
- the player lacked presence;
- or any other gameplay characteristic.

Instead, it shows a fixed result that is neither positive nor negative and unrelated to actual gameplay ability:

> **The Unwritten Legend**
>
> “No traits were submitted this time. This player's next adventure is still a blank page.”

### Future AI Version

AI generation of the sentence and title remains the planned next step for this feature. The requirements in Section 7.10 apply to the templates today and will apply unchanged to an AI generator.

---

## 7.10 Portrait Text Requirements

- **FR2.1** When valid keywords exist, the generator shall use the semantic meaning of the valid system-provided evaluation words.
- **FR2.2** The generator shall produce one coherent and humorous sentence that naturally connects and explicitly includes the valid evaluation words.
- **FR2.3** The generator shall additionally produce one concise, playful, and non-targeted title that summarises the combined evaluation.
- **FR2.4** The title shall not simply repeat one potentially negative evaluation word as a direct label for the player.
- **FR2.5** The generator shall not introduce unsupported negative judgments that participants did not express.
- **FR2.6** The generator shall not produce personal attacks, humiliating content, or other offensive content.
- **FR2.7** The generator shall not infer real-world personal characteristics from usernames, avatars, or similar information.
- **FR2.8** The output shall remain clearly humorous, exaggerated, and game-oriented.
- **FR2.9** If all evaluations are blank, the generator shall produce a neutral, non-directional result without inferring player performance.
- **FR2.10** The generator shall not infer player skill, behaviour, or personality from blank evaluations.
- **FR2.11** The system shall not separately publish the raw keyword list, keyword frequencies, vote counts, or participant-to-keyword mappings.

## 7.11 Feature 2 Functional Requirements

- **FR2.12** Any player in the game voice channel shall be able to start Feature 2 through the `[Trait Picker]` button on the Control Panel.
- **FR2.13** The triggering user's identity shall not be publicly revealed to other participants, and the triggering user shall not be able to select the described player.
- **FR2.14** The Bot shall randomly select one participant who has not yet been selected in the current cycle.
- **FR2.15** All participants, including the selected player, shall use exactly the same evaluation process.
- **FR2.16** Each user may select a maximum of one controlled keyword.
- **FR2.17** Users may change their selection until they press Submit or the countdown expires.
- **FR2.18** Users may browse other groups of keywords with `Other…`.
- **FR2.19** Browsing other keywords shall not restart or extend the 30-second countdown.
- **FR2.20** Users may submit no keyword.
- **FR2.21** The system shall not provide a separate Skip process.
- **FR2.22** Each evaluation round shall remain open for at most 30 seconds.
- **FR2.23** After 30 seconds, the system shall automatically submit the currently highlighted word of every participant.
- **FR2.24** A participant with no highlighted keyword shall automatically be recorded as a blank evaluation.
- **FR2.25** Non-responsive users shall not block the overall evaluation process.
- **FR2.26** The system shall not separately publish keyword lists, frequencies, vote counts, or individual selections; valid evaluation words may appear only as part of the generated sentence.
- **FR2.27** When valid keywords exist, the system shall produce one humorous sentence explicitly incorporating the valid evaluation words and one concise, non-targeted playful title.
- **FR2.28** When all evaluations are blank, the system shall produce neutral and non-directional content.
- **FR2.29** The final public output shall contain the generated sentence and title; the evaluation words shall not be displayed separately from that sentence.
- **FR2.30** A participant shall be able to lock their word early with a Submit button; a submitted word cannot be changed.
- **FR2.31** When every participant has submitted, the round shall end immediately.
- **FR2.32** A player who joins the voice channel after a round started shall take part from the next round; a player who leaves shall lose their word for the current round.
- **FR2.33** If the selected player leaves the voice channel during the round, the round shall be cancelled and no portrait shall be published.
- **FR2.34** Fair-rotation history shall survive a Bot restart.

Requirements for the reply step are listed in Section 7.12.

---

## 7.12 Evaluated Player Reply (New in V1.4)

### Purpose

Until V1.3 the round ended when the portrait was published. The person described could only receive it. A quieter member who did not recognise themselves in the portrait had no comfortable way to say so, which is exactly the kind of compliance this project studies.

V1.4 gives the selected player a **right of reply**:

> **The group says how it saw the player. The player says how that sounds. Both end up on the same card.**

The reply follows the same principles as the rest of the Bot. It is optional, it is playful, the Bot offers the words so that answering costs little effort, and it never points at an individual evaluator, because the reply answers the portrait as a whole.

### Reply Suggestions Match the Portrait

Offering “I disagree and I'm kicking you all” under a kind portrait, or “Thanks, everyone” under a critical one, would make no sense. The Bot therefore reads the tone of the portrait from its words (Section 7.5) and offers lines that fit.

| Words in the portrait | Tone | Suggestions offered |
|---|---|---|
| Positive words only, with or without neutral words | Positive | Accepting, grateful or modest lines |
| Negative words only, with or without neutral words | Negative | Lines that own it with humour, protest playfully, or offer an excuse |
| Both positive and negative words, or neutral words only | Neutral | Non-committal and “half right” lines |

A portrait that mixes praise and teasing is deliberately treated as neutral. “Half of this is true” is the most honest answer to a mixed portrait, and a player should not be pushed to either thank the team or reject it outright.

### Reply Library

Each tone has ten predefined lines. Three are shown at a time, in a random order that is decided once per card. **Another batch** shows the next three, and all ten lines are shown before any line repeats.

Every line is written in the first person, is about the game, and aims any playful push-back at the whole squad or at the portrait itself, never at one person.

**Positive portrait**

1. Aww, stop it. Actually, don’t stop. Carry on.
2. Finally, my talents are recognised. Autographs after the match.
3. I accept this portrait and will be framing it above my respawn point.
4. High-fives all round. You lot aren’t so bad yourselves.
5. Thanks, squad. I dedicate this to my keyboard, who did most of the work.
6. Too kind. I was mostly pressing buttons and hoping.
7. Screenshotting this before anyone changes their mind.
8. This is going straight on my gamer CV.
9. Flattery accepted. Next round’s snacks are on me. Imaginary snacks.
10. Accurate. I’d blush, but my character model doesn’t support it.

**Negative portrait**

1. Guilty as charged. My lawyer advises me to say nothing further.
2. Objection! I’m drop-kicking this portrait straight back to the squad.
3. Bold words from people standing this close to my respawn point.
4. That wasn’t a mistake. That was an advanced strategy you haven’t unlocked yet.
5. I blame the lag, the moon, and whoever was holding the snacks.
6. Noted. I’ll file this under things to fix right after one more game.
7. Fair. In my defence, it seemed like a great idea at the time.
8. I reject this portrait and demand a recount. And a rematch.
9. Ouch. Launching a friendly pie at the entire team. Nobody is safe.
10. Okay, a tiny bit true. Character development arrives next patch.

**Neutral or mixed portrait**

1. Half of this is true. I’m not telling you which half.
2. I neither confirm nor deny. The investigation continues.
3. Interesting. I’ll be reviewing the replay with my legal team.
4. I’ll take the nice bits. The rest can go back for a refund.
5. Hmm. That’s one way to describe what I was doing.
6. So that’s how it looked from over there. From here it was pure genius.
7. Equal parts flattered and suspicious.
8. I contain multitudes. Some of them were apparently on screen.
9. No comment. My character speaks only through questionable decisions.
10. A fair summary. One gentle nudge to the squad for the cheeky bits.

Each line is at most 80 characters, because it is displayed as a Discord button.

### User Flow

```text
Result card is published with at least one word
        ↓
Under the card:
“@Arthur, how does this sound? Quick replies close in 60 seconds.”
[💬 Reply]
        ↓
Only the selected player can use the button.
Anyone else is told privately: “Only @Arthur can reply to this portrait.”
        ↓
Selected player clicks [💬 Reply]
        ↓
Private panel, visible only to them:
three suggested lines, each one a button
[🔄 Another batch] [✍️ Write my own]
        ↓
   ┌─────────────────┬──────────────────────┬───────────────────────┐
   │                 │                      │                       │
Click a line    Another batch         Write my own            Do nothing
   │                 │                      │                       │
   ↓                 ↓                      ↓                       ↓
Line is posted   Next three lines     Pop-up text box,       After 60 seconds the
on the card      (does not extend     up to 200 characters   quick replies close
at once          the 60 seconds)      no time limit          quietly; writing a
   │                                        │                reply stays possible
   └──────────────────┬─────────────────────┘
                      ↓
The reply is added to the same result card.
The invitation and the button disappear.
```

### What the Card Looks Like

Before a reply:

```text
@Arthur, how does this sound? Quick replies close in 60 seconds.

🎨 Group Reflection
The Red-Button Expedition Leader
@Arthur

In the team's eyes, this player is reckless around mysterious red buttons,
distracted by every shiny side quest and overconfident before checking the
health bar. Together, these traits turn an ordinary mission into a story
worth retelling.

Built from anonymous group input · Pally Together!

[💬 Reply]
```

After the selected player replies:

```text
🎨 Group Reflection
The Red-Button Expedition Leader
@Arthur

In the team's eyes, this player is reckless around mysterious red buttons,
distracted by every shiny side quest and overconfident before checking the
health bar. Together, these traits turn an ordinary mission into a story
worth retelling.

💬 @Arthur’s reply
> I blame the lag, the moon, and whoever was holding the snacks.

Built from anonymous group input · Pally Together!
```

If 60 seconds pass without a reply:

```text
Quick replies have closed. @Arthur can still write a reply.

🎨 Group Reflection
…portrait unchanged…

[✍️ Write a reply]
```

The reply is written into the original card rather than posted as a new message. The portrait and its answer stay together, and the channel is not filled with extra messages.

### Time Rules

- Suggested lines are available for **60 seconds** from the moment the result card is published.
- `Another batch` does not extend the 60 seconds.
- When the 60 seconds end, the Bot does not announce that the player “did not respond”. The invitation is simply replaced, and the private panel loses its suggested lines.
- **A written reply has no time limit.** The card keeps its `[✍️ Write a reply]` button until the selected player uses it, including after a Bot restart.
- Discord cannot place a text box inside a message, or show part of a public message to one person only. The written reply therefore opens as a pop-up window after the selected player presses a button. Only they see the pop-up and what they type until they submit it.

### Why a Written Reply Is Allowed Here

Section 7.5 forbids free-text evaluation words because they would be anonymous, uncontrolled and aimed at another person. The reply is the opposite on each point: it is public, it is signed by its author, and it is about the author's own portrait. It carries the same accountability as an ordinary chat message.

The Bot still limits it:

- at most 200 characters, on a single line;
- text formatting, mentions and disguised links are neutralised, so a reply cannot ping people, imitate the Bot's own layout or hide a link;
- one reply per card. Once posted it cannot be changed or replaced.

### Privacy Rules

- The reply answers the portrait as a whole. There is no way to reply to one word, because that would single out whoever chose it.
- Choosing a line happens privately. Other members never see which suggestions were offered or how many batches the player looked at.
- A posted reply does not show whether it was a suggested line or one the player wrote.
- Only the selected player's identity is attached to the reply. Evaluators stay anonymous.

### Functional Requirements

- **FR2.35** When a portrait contains at least one valid word, the result card shall invite the selected player to reply. A blank portrait shall carry no invitation.
- **FR2.36** Only the selected player shall be able to reply. Any other member who presses the button shall receive a private explanation and nothing shall change publicly.
- **FR2.37** The system shall classify the portrait as positive, negative or neutral from its words, and shall offer only reply suggestions written for that tone.
- **FR2.38** The reply library shall contain ten predefined lines for each of the three tones.
- **FR2.39** The system shall show three suggestions at a time and shall let the player request another batch; all ten lines shall be shown before any repeats.
- **FR2.40** Suggestions shall be shown privately to the selected player.
- **FR2.41** Selecting a suggested line shall post it on the card immediately.
- **FR2.42** Suggested lines shall be available for 60 seconds after the result is published; requesting another batch shall not extend this time.
- **FR2.43** When the 60 seconds expire without a reply, the system shall close the suggestions without any public statement that the player did not respond.
- **FR2.44** The selected player shall be able to write their own reply of up to 200 characters, with no time limit.
- **FR2.45** A written reply shall be shown as written by its author, shall not notify or mention other users, and shall not be able to alter the layout of the card.
- **FR2.46** The reply shall be added to the original result card, together with the name of the selected player; no additional public message shall be posted.
- **FR2.47** Each card shall accept at most one reply, and a posted reply shall be final. Repeated or simultaneous clicks shall not add a second reply.
- **FR2.48** The reply shall address the portrait as a whole and shall never identify or target an individual evaluator.
- **FR2.49** The reply step shall not keep Feature 2 in its Active state; a new round may start while an earlier card still awaits a reply.
- **FR2.50** The ability to write a reply shall survive a Bot restart.

---

# 8. Feature 3: Random Pick

## 8.1 Purpose

In multiplayer teams, decisions such as what to play next, whether to continue, or whom to invite may naturally become concentrated among:

- the game organiser;
- more socially dominant members;
- central social figures within the group.

Other members may also have a preference but may feel uncomfortable insisting on it because they are not the organiser.

This feature therefore uses the Bot to:

> **Temporarily hand the right to make the current decision to one fairly chosen member.**

The Bot does not decide **what the group should do**. Instead, it determines:

> **Who receives the opportunity to make that decision this time.**

User testing suggested that the value lies less in the randomness than in the temporary legitimacy it gives: one quieter participant reported that when Random Pick chose them to decide, the others usually agreed.

V1.3 limited this feature to deciding who may invite an extra player. The prototype applies it to any group decision. This matches the team's interview finding that session choices such as what to play, whom to invite, or when to stop are typically made by the more vocal members.

---

## 8.2 Trigger and Trigger Privacy

When the team has a decision to make, any player in the game voice channel may click:

```text
[🎲 Random Pick]
```

on the unified Bot Control Panel.

The triggering user's identity remains hidden from other participants. The Bot backend may process the interaction information, but the public channel must not reveal who started the draw.

The Bot does not detect when a decision is needed. Team members decide when to use the feature.

---

## 8.3 User Flow

```text
Team has a decision to make
        ↓
Any player anonymously clicks [🎲 Random Pick]
        ↓
One public message appears:
“🔎 Finding players in the game voice channel…”
        ↓
The same message changes to:
“🎲 Rolling…” with the list of players in the draw
        ↓
The same message changes to:
“🎉 A player has been selected!
 @Kiki
 You get to make the decision!”
        ↓
Kiki makes the decision for the group
```

The whole draw takes about three seconds and uses a single message that changes in place.

---

## 8.4 Fairness Mechanism

Feature 3 also uses:

> **Randomised Fair Rotation**

The candidates are the players who were in the game voice channel when the draw started and are still there when the result is revealed. For example:

```text
[A, B, C, D, E]
```

If A has already been selected, subsequent draws choose from:

```text
[B, C, D, E]
```

until all present members have had a turn.

The candidate pool then resets.

This prevents the original organiser from repeatedly receiving decision-making power simply because of random outcomes.

The rotation history is saved, so restarting the Bot does not reset it. Feature 2 and Feature 3 keep separate rotation histories.

---

## 8.5 Pass / Draw Again (Removed)

V1.3 gave the selected member `Pass` and `Draw Again` buttons. The deployed prototype does not have them: the draw ends when the selected member is announced.

A selected member who does not want to decide is not forced to. Anyone can start another draw, and fair rotation gives the turn to a player who has not yet been selected.

---

## 8.6 Functional Requirements

- **FR3.1** Any player in the game voice channel shall be able to start Random Pick through the `[Random Pick]` button on the Control Panel.
- **FR3.2** The triggering user's identity shall not be publicly revealed to other participants, and the triggering user shall not be able to choose the selected member.
- **FR3.3** The Bot shall use fair random selection among eligible members.
- **FR3.4** The selected member shall receive the opportunity to make the group's current decision.
- **FR3.5** *(Removed in V1.4 — Pass.)*
- **FR3.6** *(Removed in V1.4 — removal from the pool after passing.)*
- **FR3.7** *(Removed in V1.4 — automatic redraw after passing.)*
- **FR3.8** The system shall avoid repeatedly selecting the same member before others receive an opportunity.
- **FR3.9** The candidate pool shall reset after all eligible members have received an opportunity.
- **FR3.10** *(Removed in V1.4 — ending when everyone passes.)*
- **FR3.11** The draw shall be shown in a single public message that moves through finding, rolling and result.
- **FR3.12** A member who leaves the voice channel during the draw shall be removed from it; a member who joins during the draw shall take part from the next draw.
- **FR3.13** If every eligible member leaves, or the Bot loses its connection to the voice channel, the draw shall end with a short notice and no member shall be selected.
- **FR3.14** Fair-rotation history shall survive a Bot restart, and a draw interrupted by a restart shall not use up anyone's turn.

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

- type `/social` to bring up the panel;
- click `[Excuse Generator]`;
- click `[Trait Picker]`;
- participate in Feature 2 keyword selection;
- be randomly selected as the described player in Feature 2;
- self-evaluate in Feature 2;
- reply to their own portrait in Feature 2;
- click `[Random Pick]`;
- be selected to make the decision in Feature 3.

Features 2 and 3 are open to whoever is in the game voice channel. This is a statement about who is playing right now, not about rank.

Otherwise, the design would contradict itself:

> **The project aims to redistribute social power, while the technical permission model would return control to administrators or organisers.**

---

# 11. Failure and Edge Cases

## 11.1 Feature 1

### User Cancels

No content is posted to the public channel.

### Preview Left Open

The preview expires after 10 minutes. Opening the Excuse Generator again starts a new one.

### Bot Restarts

Open previews are lost. Nothing was posted, and the user can open a new preview.

### Delivery Cannot Be Confirmed

The Bot does not resend automatically, so an excuse cannot appear twice. The user is asked to check the channel.

### AI API Unavailable (future AI version)

Automatically fall back to the predefined JSON excuse library.

---

## 11.2 Feature 2

### Some Members Do Not Respond

After 30 seconds, their responses are recorded as blank evaluations and the process continues.

### All Members Submit Blank Evaluations

The fixed neutral result is shown, and no reply is invited.

### Everyone Has Already Been Selected

Reset the candidate pool and begin a new fair-random cycle.

### Selected Player Leaves the Voice Channel

The round is cancelled with a short notice. No portrait is published.

### Connection to the Voice Channel Is Lost

The round is cancelled with a short notice, and the feature can be started again once the Bot has reconnected.

### Bot Restarts During a Round

The interrupted public message is closed with a notice. Private selections are not kept.

### Small Number of Participants

The feature is not blocked. A single player in the voice channel can run a round alone.

### Selected Player Does Not Reply

Nothing is announced. After 60 seconds the suggested lines close; a written reply stays possible.

### Someone Else Tries to Reply

They receive a private explanation. The card does not change.

### Selected Player Leaves the Voice Channel After the Result

They can still reply. Replying depends only on being the selected player.

### Two Replies Are Sent at the Same Time

Only the first is accepted. The card never carries more than one reply.

### Bot Restarts After the Result

Within the 60 seconds, suggested lines can be reopened from the card. After that, the written reply continues to work.

### AI API Unavailable (future AI version)

Fall back to the current templates:

- if valid keywords exist, use the predefined phrases and titles;
- if all evaluations are blank, use the fixed neutral result.

---

## 11.3 Feature 3

### Selected Member Does Not Want to Decide

There is no Pass button. Any member can start another draw; fair rotation selects a player who has not yet had a turn.

### Member Leaves During the Draw

That member is removed from the draw.

### Everyone Leaves, or the Connection to the Voice Channel Is Lost

The draw ends with a short notice.

### Bot Restarts During a Draw

The interrupted message is closed with a notice, and nobody's turn is used up.

---

# 12. Non-Functional Requirements

## 12.1 Usability

First-time users should be able to understand the main interactions through Bot prompts, buttons, and short instructions.

## 12.2 Responsiveness

Users should receive timely feedback after clicking buttons or interacting with the Bot. Every click is acknowledged immediately; slower work, such as publishing a message, happens after the acknowledgement.

## 12.3 Reliability

The prototype does not depend on any external AI service. When AI generation is added, its failure should not make the core prototype unusable.

An error in one round must not leave a feature locked (Section 5.6).

## 12.4 Privacy

The system should retain only the data required for the current functionality.

- The only data written to disk is the fair-rotation history and the location of a round in progress, so that it can be closed after a restart.
- Private word selections, excuse previews and reply suggestions exist only in memory and only while they are needed.

For Feature 2 in particular:

> Raw evaluation keywords are used only for backend generation and are never publicly exposed.

## 12.5 Safety

All system-generated content must follow the non-offensive content principles. This covers the excuse library, the portrait phrases and titles, and the reply library.

## 12.6 Consistency

All three features should use consistent:

- Bot tone;
- button styles;
- prompts;
- naming conventions;
- humour style.

## 12.7 Deployment

The Bot runs as a single container on a cloud server and is reached by Discord over HTTPS. Changes are tested automatically before a deployment, and a deployment is started deliberately by a team member rather than on every change.

---

# 13. Prototype Scope

## 13.1 Feature 1

Implemented:

```text
Click [Excuse Generator] or type /excuse
→ Choose one of six categories
→ Random excuse from the JSON library
→ Private preview
→ Another One
→ Send, with a plain announcement line
→ Cancel
```

AI generation is reserved for a later iteration.

---

## 13.2 Feature 2

Implemented:

```text
Click [Trait Picker]
→ Hide triggering user's identity
→ Fair random selection of the described player, remembered across restarts
→ Controlled vocabulary of 17 words for all participants
→ Maximum one word per participant
→ Other… to browse more words
→ Self-evaluation supported
→ Blank input allowed
→ Submit to lock a word; early finish when everyone has submitted
→ 30-second countdown; highlighted words are submitted on timeout
→ Private combination of valid keywords
→ No separate public list of evaluation words or vote counts
→ Template sentence naturally incorporating the selected words
→ Playful, non-targeted summary title
→ Neutral result when all inputs are blank
→ Reply invitation for the described player
→ Three tone-matched suggestions, Another batch, 60-second limit
→ Written reply with no time limit
→ Reply added to the original card
```

AI generation of the sentence and title is reserved for a later iteration.

---

## 13.3 Feature 3

Implemented:

```text
Click [Random Pick]
→ Hide triggering user's identity
→ Finding players → Rolling → Result, in one message
→ Fair random selection, remembered across restarts
→ Announce who makes the decision
```

Pass and Draw Again were removed (Section 8.5). Automatic detection of when a decision is needed is outside the scope.

---

# 14. Future Extensions

Possible future iterations include:

- AI-generated excuses for Feature 1;
- AI-generated portraits and reply suggestions for Feature 2;
- letting the team choose whom to describe, which user testing raised as a tension between protection and relevance;
- making an excuse harder to overlook, so that teammates take the intention seriously;
- automatic Gaming Session detection;
- expanded controlled keyword libraries;
- different humour styles;
- group-specific custom vocabulary;
- configurable Bot personality.

Voice channel awareness and fair rotation that persists across sessions were listed as future work in V1.3 and are now part of the prototype.

---

# 15. User Evaluation Focus

User evaluation should not focus only on:

> **“Is the Bot fun?”**

Instead, it should test the Social Mechanism behind each feature.

## 15.1 Feature 1: Excuse Generator

Key questions:

- Does the feature make it easier for players to express an intention to leave, decline or delay?
- Does it reduce the awkwardness of directly saying “I don't want to keep playing”?
- Can teammates correctly understand what the player genuinely intends?
- Can humour make the intention unclear, or easy to ignore?
- Do the categories, the preview and “Another One” provide enough user control?

---

## 15.2 Feature 2: Trait Picker

Key questions about expressing:

- Do users feel that they have an opportunity to express their views?
- Does the selected player still feel personally targeted?
- Does system-based random selection reduce the feeling of being targeted?
- Is the controlled vocabulary expressive enough for users' intended gameplay observations?
- Is `Other…` useful?
- Is 30 seconds too long or too short?
- Does allowing users to provide no input reduce participation pressure?
- Does avoiding a separate display of raw keywords and vote counts make users more comfortable expressing themselves?
- Does the generated sentence naturally connect the selected words while remaining humorous?
- Does the result introduce offensive or unsupported interpretations that were not present in the original input?
- When everyone submits blank input, does the neutral result feel natural?
- How anonymous does the input actually feel in a small group of friends?
- Does the mechanism unintentionally create new peer pressure?

Key questions about replying:

- Does being able to reply reduce the selected player's feeling of being targeted?
- Does the selected player feel free to push back on a portrait they disagree with, or do they feel expected to accept it?
- Do the suggested lines fit the portrait they are answering?
- Do players use the suggestions, or prefer to write their own? Does that differ between more and less dominant members?
- Is 60 seconds enough to read the suggestions and choose?
- Does knowing that the selected player can reply change which words the others choose?
- Does a public reply create pressure of its own, for example an expectation to always respond?

---

## 15.3 Feature 3: Random Pick

Key questions:

- Do ordinary members feel that they have more opportunity to participate in team decisions?
- Does the fair-random mechanism feel fair?
- Are members who are not normally organisers more willing to make the call when selected?
- Does the group accept the selected member's decision?
- Does the original organiser still influence the final decision?
- Does a selected member who would rather not decide feel able to say so without a Pass button?
- Does temporarily assigning decision-making opportunity change how players experience social power within the team?

---

# 16. Overall Conceptual Structure

```text
                Social Compliance
                       │
              Unified Bot Control Panel
                       │
          /social brings up one panel for all
                       │
     Feature 2 / 3 hide the triggering user's identity
                       │
              Unequal Social Influence
                       │
        ┌──────────────┼──────────────┐
        │              │              │
       LEAVE          EXPRESS        DECIDE
        │              │              │
    Excuse          Trait          Random
   Generator        Picker          Pick
        │              │              │
        ↓              ↓              ↓
Lower the social   More equal       Shared opportunity
cost of saying no  expression,      to make team decisions
                   and a reply
```

The core logic of the three features can be summarised as:

> **Feature 1:** The Bot does not decide whether a player should leave. It reduces the social cost of expressing “I want to leave”, “not this time” or “give me a moment”.

> **Feature 2:** The Bot does not independently judge a player. Instead, all members, including the selected player, use the same controlled mechanism to express their perspectives. The selected words are not displayed separately; they are connected into a humorous sentence under a playful, non-targeted title. The selected player can then answer on the same card.

> **Feature 3:** The Bot does not decide what the group should do. It fairly redistributes the opportunity to decide.

---

## 17. Current Version: Confirmed Design Decisions

The following product rules are confirmed in V1.4:

1. The Bot is named Pally. Its features are Excuse Generator, Trait Picker and Random Pick.
2. All three features are opened from one Control Panel, which any member can bring up with `/social` without being identified.
3. The triggering identities for Feature 2 and Feature 3 are used only for backend interaction processing and are not publicly revealed to other participants.
4. Feature 2 and Feature 3 are open to the players currently in the configured game voice channel.
5. Feature 1 offers six categories and uses a JSON excuse library; AI generation is a later iteration.
6. Feature 1 begins as a private interaction and becomes public only when the user confirms the final excuse.
7. Feature 2's described player is selected by the system and cannot be manually specified by a user.
8. Feature 2 and Feature 3 use Randomised Fair Rotation, and the rotation history survives a Bot restart.
9. All users follow exactly the same Feature 2 evaluation process, including the selected player.
10. Feature 2 does not provide a Skip button; users may simply provide no input.
11. Feature 2 uses a 30-second evaluation window with a Submit button. The round ends early when everyone has submitted; at 30 seconds, highlighted words are submitted automatically and everything else is blank.
12. Feature 2 lets users browse more words with `Other…`, which does not extend the countdown.
13. Feature 2 never displays selected words as a separate list, frequencies, vote counts, or participant-to-word mappings; selected words appear only inside the generated sentence.
14. Feature 2 builds its sentence and title from predefined templates; AI generation is a later iteration and must follow the same text requirements.
15. If all Feature 2 evaluations are blank, a fixed neutral result is shown with no positive or negative direction.
16. The Feature 2 text must not introduce personal attacks or additional negative judgments that are not supported by the input.
17. The player described in Feature 2 may reply to the portrait, and the reply is written onto the original result card.
18. Reply suggestions are chosen to match the tone of the portrait: positive, negative, or neutral. Each tone has ten predefined lines, shown three at a time with `Another batch`.
19. Suggested replies are available for 60 seconds. A reply the player writes themselves has no time limit.
20. Not replying is never announced. Each card accepts one reply, which is final.
21. A reply answers the portrait as a whole and never targets an individual evaluator.
22. Free text is not allowed for evaluation words. It is allowed for the selected player's own signed reply, limited to 200 characters.
23. Feature 3 is manually activated by users and selects who makes the group's current decision.
24. Feature 3 has no Pass or Draw Again; another draw can be started by anyone.
25. Feature 2 and Feature 3 require Active State / concurrency control to prevent simultaneous clicks from creating duplicate processes. The reply step does not hold this state.
26. Duplicate-trigger or “already active” feedback must be returned privately to the clicking user so that the triggering action is not exposed.


AI Use Statement: The core ideas and feature designs were collaboratively developed and discussed by the team. AI was used only to assist with translating, refining, and improving the clarity and presentation of the written content.
