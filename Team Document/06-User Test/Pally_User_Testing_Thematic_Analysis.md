# Thematic Analysis of User Testing: Social Compliance and Group Interaction in Gaming

## Theme Map

| Theme | What We Observed | Participant Evidence | Brief Analysis |
| --- | --- | --- | --- |
| **Theme 1 — Decision-making power was uneven, but Random Pick could temporarily change who had the right to decide** | Without the tool, more vocal and persistent players were more likely to control the discussion, while quieter members tended to step back. After Random Pick was used, the selected member gained a decision-making opportunity that was more readily accepted by the group. | P1: “**Just follow me and play.**” “**Look at my KDA.**” P2: “**The other two were more willing to express their opinions and easily got into arguments, while I usually did not dare to express mine.**” After using the tool: “**When Random Pick chose me to make the decision, they usually agreed with me.**” | The value of Random Pick was not simply its randomness. The Bot gave a member who normally had less influence **temporary legitimacy** to make a decision. However, the selected member still asked whether the others agreed, suggesting that the existing power relationship was reduced rather than fully removed. |
| **Theme 2 — Anonymous feedback could reduce pressure to express opinions, but anonymity itself was fragile** | Some participants felt that anonymity made it easier to express evaluations. However, in a small group of familiar friends, members might still guess who submitted a comment based on tone or content. Randomly selecting the person being evaluated could also reduce the relevance of the feedback. | P3: “**For example, if someone is more introverted... I might not say it directly because I am worried about hurting them... but if I use this tool, I would be more likely to evaluate them based on what I actually think.**” P2: “**We all know each other too well... they could probably guess it was me.**” P1: “**I would prefer to choose a specific person and give feedback to them.**” | Trait Picker may reduce direct confrontation, but **technical anonymity does not necessarily create perceived anonymity**. There is also a tension between fairness and relevance: random selection feels less targeted, but the person a user genuinely wants to evaluate may not be the person selected by the system. |
| **Theme 3 — Leaving was not simply an individual action, but a group negotiation process** | Even after a player clearly said they wanted to leave, other members might still persuade them to continue. The Excuse Generator did not directly end the interaction; instead, it made the intention to leave visible within the group discussion. | P1: “**I’m done, I’m leaving.**” → “**Come on, play another one.**” After using the tool, responses still included: “**One more game?**” and “**Let’s play the last one.**” P3: “**During the game, I might easily ignore this message... or not really take it seriously.**” | The Excuse Generator is better understood as an **exit signal / conversation opener**, rather than a tool that directly helps users leave. The next design focus should be on making the group notice, understand, and take the intention to leave seriously. |
| **Theme 4 — The value of the tools depended on relationship familiarity and existing group norms** | Participants gave different responses when comparing close friends and less familiar players. Some felt the tools would be more useful with people they did not know well, while others felt it was actually easier to leave when playing with strangers. | P3: “**If I was playing with people I didn’t know very well... it might be harder to say directly that I want to leave, so this tool could help.**” P2: “**When I play with people I’m not familiar with... I feel less pressure about leaving.**” P1: “**For people who are not familiar with each other... this gives them a better platform to express their voice.**” | We cannot simply conclude that Pally is more useful for close friends or for strangers. A more appropriate interpretation is that **relationship context changes the form of social pressure and therefore changes how Pally is used and valued.** |

---

# Concise Product Analysis

## Random Pick — Strongest Current Result

Random Pick has the clearest evidence across both observed behaviour and interview data.

> **Random Pick gave quieter members a temporary and socially accepted opportunity to make a decision.**

It did not fully remove the existing hierarchy, but it changed who could legitimately make the final call.

---

## Trait Picker — Promising, but the Interaction Needs Refinement

The key tension is:

> **Protection vs Relevance**

Anonymous input can reduce direct social exposure, but anonymity is weaker in small friendship groups. Randomly selecting someone to evaluate may also feel unnecessary when users have no meaningful feedback for that person.

The next questions are:

> **How anonymous does it actually feel?**  
> **Should users be able to choose who they want to evaluate?**

---

## Excuse Generator — Better Understood as an Exit Signal

Current evidence does not show that it allows users to leave immediately.

A more accurate interpretation is:

> **It makes the intention to leave visible and opens a group negotiation.**

The main design problem is therefore not generating a funnier excuse, but balancing:

> **playfulness + clarity + seriousness**

so teammates understand that the player genuinely wants to leave.

---

# Overall Product Insight

The strongest overall finding is:

> **Pally works best when it acts as a neutral social mediator during awkward group interactions.**

Instead of directly solving the disagreement, Pally changes **how the interaction happens**:

> **Person vs Person**  
> becomes  
> **People interacting through a shared system or procedure.**

This can be seen across all three features:

| Feature | Original Interaction | Pally-Mediated Interaction |
| --- | --- | --- |
| **Random Pick** | “Why should we listen to you?” | “The shared system temporarily gives this person the right to decide.” |
| **Trait Picker** | “I directly criticise you.” | “I contribute privately and the system produces a shared result.” |
| **Excuse Generator** | “I directly reject the group.” | “The system helps surface my intention to leave.” |
