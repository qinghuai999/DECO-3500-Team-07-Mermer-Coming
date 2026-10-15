# Pally Heuristic Evaluation Analysis Report

- **Recording date:** 14 October 2026
- **Participants:** Two experts and one moderator

## Key Findings

The material shows that Pally's main workflows operate, including the control panel, random player selection, anonymous trait selection, portrait replies and excuse previews. The highest priorities are the inability to clear a selected trait, which is still submitted automatically when the user no longer wishes to contribute, and the unresponsive /excuse command, whose application name differs from the working panel. The paths for finding the panel, returning to categories and accessing instructions should then be improved.

Seven improvement items were identified: one with a proposed severity of 3, five with a severity of 2, and one with a severity of 1. There is insufficient evidence to assign a severity of 4. These ratings are proposed by this analysis; they have not been jointly confirmed by the two experts and are not an overall usability score for the product.

## Materials and Attribution

| Evidence ID | Material | Attribution and Duration |
|---|---|---|
| E1 | Expert 1.mov | Expert 1's perspective; 33 min 53 sec |
| E2-A | Expert 2-1.mp4 | Expert 2, first part; 18 min 48 sec |
| E2-B | Expert 2-2.mp4 | Expert 2, second part; 14 min 22 sec |
| Tasks | Two Pally expert task documents (.docx) | Task scope; written feedback appended to Expert 2's document |

Expert 2-1 and Expert 2-2 belong to the same expert and are not counted as two people. The three recordings total approximately 67 minutes, but include duplicated audio from the same session. They cannot be treated as 67 minutes of independent evaluation, nor can the same conversation appearing in two recordings be counted as independent detection by two experts.

## Analysis Method

The existing local tool was reused to automatically transcribe all three audio tracks. Verbal feedback was reviewed by task and event and checked against the corresponding screen footage and written feedback. Comments with the same triggering conditions, behaviour and user impact were consolidated into a single issue, mapped to Nielsen's heuristics, and documented with observations, impact, recommendations and retest conditions.

All timestamps are measured from the beginning of the referenced file. The recordings contain conversations between the moderator and experts, and reliable speaker separation was not performed for every segment. Sources are therefore identified as verbal feedback within a particular recording, without calculating individual detection rates. The analysis excerpts are summaries of verbal feedback, not transcripts manually checked sentence by sentence. Suspected noise or background content was excluded from judgement.

## Overview of Improvement Items

| ID | Improvement Item | Primary Heuristic | Proposed Rating |
|---|---|---|---|
| HE01 | Selected traits cannot be cleared and are still submitted at the deadline | H3 | 3 |
| HE02 | The direct command is unresponsive and application names differ | H4 | 2 |
| HE03 | The panel and new results are separated, requiring repeated scrolling | H7 | 2 |
| HE04 | Changing an excuse category requires cancelling and reopening | H3 | 2 |
| HE05 | Some humorous English excuses are difficult to understand | H2 | 2 |
| HE06 | Centralised instructions are hard to find; some rules require moderator explanation | H10 | 2 |
| HE07 | Surprise Me can be mistaken for a separate excuse category | H2 | 1 |

**Rating Basis:** 0: not a problem; 1: a minor presentation or comprehension issue; 2: a minor issue with a workaround; 3: a major issue requiring priority correction; 4: must be resolved before release. Ratings consider expected frequency, impact and persistence rather than mechanically multiplying them. The number of experts is not used to estimate how often users will encounter an issue.

## Recommended Order of Changes

- First batch: HE01, add a way to clear the selection or decline to contribute; HE02, verify and clean up the applications and command entry points in the actual server. The former affects control over expression, while the latter is an observed entry-point failure.

- Second batch: HE03, shorten the paths for finding the panel and results; HE04, support changing excuse categories directly; HE06, provide instructions that are easy to find.

- Third batch: HE05, validate and rewrite difficult excuses with target users; HE07, clarify that Surprise Me randomly selects a category. Text changes are relatively inexpensive and can proceed alongside the first two batches.

## Strength of Evidence

HE01 and HE02 have verbal or written feedback supported by screen evidence. HE03, HE04 and HE07 are mainly supported by specific actions and verbal feedback. HE05 is explicit written feedback from Expert 2; an equivalent verbal comment was not separately located. HE06 has verbal evidence of difficulty finding information, but moderator guidance and confusion between features limit the conclusion to help being difficult to find.

The HE02 failure was observed, but its cause remains unknown. The failed command is associated with MerMer in the recording, while the working panel is associated with Mermer2.0. This suggests possible use of an old application or mixed command entry points. Actual command ownership must be checked; the evidence does not establish a code defect in the new version.

## Priority Issues and Recommendations

### HE01 Selected traits cannot be cleared and are still submitted at the deadline

**Heuristics and Rating:** H3 User Control and Freedom; related: H5 Error Prevention. Proposed severity: 3.

**Evidence:** E1 11:33–11:45 and 13:21–14:20; screen at E1 13:50. E2-A 11:37–11:56 and 13:29–14:25.

**Observation:** The evaluator tried clicking the selected trait again to deselect it, without success. Retesting still allowed only changing the trait, not returning to a state of no contribution. The selected trait was automatically submitted when the countdown ended, even without clicking Submit.

**User Impact:** After an accidental choice or a change of mind, the user cannot remain silent. A contribution they no longer wish to make is included in the teammate's public portrait.

**Rating Rationale:** This affects control over expression in a public social context. It can occur whenever someone wants to withdraw a selected trait, and waiting does not restore that control.

**Recommendation:** Provide Clear selection or Do not contribute before submission. After clearing, explicitly show that nothing is selected and treat the response as blank at the deadline. Changing to another trait alone is insufficient.

**Retest:** Select a trait, then clear it or withdraw from the round and wait until the deadline. Confirm that the trait is not submitted and that the result excludes the withdrawn contribution.

### HE02 The direct command is unresponsive and application names differ

**Heuristics and Rating:** H4 Consistency and Standards; related: H7 Efficiency and H9 Error Recovery. Proposed severity: 2.

**Evidence:** E2-B 04:30–04:46 and 06:03–06:17; screens at E1 24:10 and E2-B 06:40; written note at the end of Expert 2's task document.

**Observation:** Using /excuse produced the message 'The application did not respond.' The failed message names MerMer, while the working panel and successful results come from Mermer2.0. The panel button can still generate and send excuses.

**User Impact:** Users following the task or recalling the shortcut cannot proceed and must guess which alternative entry point to use. Similar application names further increase the risk of choosing the wrong one.

**Rating Rationale:** The shortcut is blocked and the platform error does not provide product-specific recovery steps. However, the panel offers an alternative path, supporting a rating of 2 rather than a conclusion that the entire excuse feature is unavailable.

**Recommendation:** Check the applications actually installed in the server and the ownership of their commands. Remove invalid or old commands and make visible names consistent. Provide clear instructions for returning from the error to the correct panel.

**Retest:** Confirm the application name in the command menu, then run /excuse. Verify in both clients that the command and panel open the same tool. Without reproducing the cause in the backend, it cannot be attributed conclusively to code, network or permissions.

## Navigation Issues and Recommendations

### HE03 The panel and new results are separated, requiring repeated scrolling

**Heuristics and Rating:** H7 Flexibility and Efficiency of Use; related: H6 Recognition and H1 Visibility of System Status. Proposed severity: 2.

**Evidence:** E1 03:56–04:04; written note at the end of Expert 2's task document. E2-A 04:10–04:16 captures the same conversation.

**Observation:** As results and chat messages accumulate, the action buttons remain in an older message. The evaluator must scroll up to find the panel and then find the new result after clicking. The written note also expresses uncertainty about whether entering /social again will affect existing content.

**User Impact:** Repeated draws or switching between tools requires a longer navigation path. Users may overlook a new result or round among historical messages.

**Rating Rationale:** This recurs during common actions. Scrolling or reopening the panel provides a workaround, but the efficiency cost persists.

**Recommendation:** Provide an entry point for reopening tools from results, or a clearly discoverable fixed entry point. Explain that /social only displays the panel again and does not clear history. The implementation must fit Discord's capabilities.

**Retest:** First create multiple chat and result messages, then use all three tools repeatedly. Check whether substantial scrolling up and down is still required and whether the current result is easy to identify.

### HE04 Changing an excuse category requires cancelling and reopening

**Heuristics and Rating:** H3 User Control and Freedom; related: H7 Efficiency. Proposed severity: 2.

**Evidence:** E1 20:27–22:21. E2-B 01:17–02:34; E1 22:06–22:21 indicates that cancelling and reopening is possible and not confusing.

**Observation:** After opening an excuse preview for a category, there is no discoverable path back to the six categories. The evaluator must cancel the preview and reopen the tool. The evaluator also states that this workaround did not cause confusion.

**User Impact:** Changing the social intention requires repeating entry steps, adding effort. There is no evidence that this completely prevented the expert from completing the task.

**Rating Rationale:** This is recoverable workflow redundancy. The evaluator's statement that it was not confusing is retained as counterevidence rather than overstating the issue as a major blockage.

**Recommendation:** Add Back to categories or Change category while keeping the current private preview state. Distinguish this action from cancelling the preview.

**Retest:** Change directly from the Cancel category to Delay. Check that this can be completed without leaving the tool and without accidentally sending a message.

## Content Comprehension and Help Issues

### HE05 Some humorous English excuses are difficult to understand

**Heuristics and Rating:** H2 Match Between the System and the Real World. Proposed severity: 2.

**Evidence:** At the end of Expert 2's task document: 'Although the sentences are somewhat humorous, I do not understand some of them.'

**Observation:** Expert 2 recognises the humour in the excuses but reports not understanding some sentences. The displayed excuses use personification and relatively long English sentences.

**User Impact:** Users cannot quickly decide whether an excuse fits the situation. They may choose wording that does not match their intended meaning or repeatedly request another sentence.

**Rating Rationale:** This affects comprehension and selection, but users can request another sentence or cancel. The feedback comes from this Chinese-language evaluation context and cannot be generalised to all English-speaking users.

**Recommendation:** Retain the light tone while reducing difficult metaphors and complex sentences. Decide whether to provide Chinese, simpler wording or tone choices based on the actual target users.

**Retest:** Ask target users to explain each sentence without translation and judge whether it suits leaving, declining, cancelling or delaying. Record the specific entries that are misunderstood.

### HE06 Centralised instructions are hard to find and some rules require moderator explanation

**Heuristics and Rating:** H10 Help and Documentation; related: H6 Recognition Rather than Recall. Proposed severity: 2.

**Evidence:** E2-B 11:46–12:19 and 13:20–13:57; E1 31:00–33:19 captures the same conversation.

**Observation:** The question 'Where is the help?' arose during the search for information. Some privacy and reply rules were confirmed only after the moderator directed attention to the current prompts. The interface already contains contextual instructions about private visibility, automatic submission and preview expiry. Later footage remains on the excuse preview while the evaluator searches for portrait-reply instructions. This confusion between features does not establish that custom replies are unavailable.

**User Impact:** When rules are forgotten or the product is used for the first time, users cannot easily find complete instructions independently. They must rely on others or remember information scattered across screens.

**Rating Rationale:** Existing contextual prompts should not be described as a complete absence of help. The issue is that rules are difficult to find in one place and this can recur across workflows.

**Recommendation:** Add a short, visible entry point for gameplay and privacy instructions. Cover participation channels, anonymous versus named actions, withdrawing a trait, reply time limits and recovery from old previews. Retain existing contextual prompts.

**Retest:** Without moderator explanation, ask new users to find a specified rule and state the next step. Check that the instructions match the actual interface.

### HE07 Surprise Me can be mistaken for a separate excuse category

**Heuristics and Rating:** H2 Match Between the System and the Real World; related: H4 Consistency. Proposed severity: 1.

**Evidence:** E2-B 06:38–06:56 and 07:41–07:58; E1 27:00–27:22 captures the same conversation.

**Observation:** The evaluator initially understood Surprise Me as a content category at the same level as the others. After using it, they realised it randomly selects from the existing categories.

**User Impact:** The resulting category differs from the initial expectation, but the preview allows the user to inspect it and cancel.

**Rating Rationale:** There is a comprehension cost, but no observed accidental sending or task failure. A severity of 1 is therefore proposed.

**Recommendation:** Rename it Random category or add a short explanation such as 'Randomly choose a category' to avoid presenting it as a separate content type.

**Retest:** Check whether first-time users can predict, before clicking, that it will generate an excuse from one of the existing categories at random.

## Effective Designs and Behaviours That Should Not Automatically Be Classified as Defects

| Observation | Evidence and Analysis |
|---|---|
| Repeated draws are blocked | E2-A 05:14–05:24 and screen at 04:04: a private prompt states that a draw is already in progress. This supports error prevention rather than indicating duplicate generation. |
| Selection and submission are distinguishable | E1 08:20–08:27 and E2-A 08:30–08:35: the verbal feedback states that the two can be distinguished. An item should not be classified as a defect merely because the task asks experts to inspect it. |
| Reply authorisation works | E1 09:26–09:48 and E2-A 09:26–09:49: someone other than the target receives a prompt that only the target may reply. Reducing unusable buttons could be considered, but this is not an authorisation vulnerability. |
| Drafts remain after closing | E1 13:01–13:10 and E2-A 13:09–13:19: after closing and reopening the custom-reply dialog, the input remains. |
| Cancelling does not publish an excuse | E2-B 02:06–02:34 and screen at E1 20:50: the cancellation prompt confirms that nothing was posted. |
| Sending has clear prompts before and after | E2-B 06:24–06:33, 08:09 and screen at 10:50: the preview states the channel and confirmation boundary; both the success prompt and public message are visible. |
| Long text is constrained | E1 18:23–18:45: the 1–200 range is mentioned after long text is entered. An advance character count could be considered, but there is insufficient evidence that overlength text can bypass the restriction. |

## Items Retained for Verification

- Anonymity failure has not been established. The caller's own interface displays the command invocation and a private confirmation; another account states at E1 02:09–02:18 that the initiator is not visible. Text shown to the caller alone should not be treated as disclosure to the whole channel.

- Incorrect random rotation has not been established. The roster initially contained two members and later changed to three. A short sequence of draws with membership changes cannot validate the entire algorithm. Further testing should use a fixed roster across consecutive rotations.

- Expiry does not mean that feedback is absent. The screen at E1 29:00 displays an expiry or restart message and an instruction to reopen the tool, while the verbal feedback mentions seeing nothing new. The position and visibility of the update should be retested; the evidence does not establish that expiry feedback was never implemented.

- The absence of later custom replies has not been established. This feature was used earlier. Later footage remains on the excuse tool while instructions are being sought, indicating confusion between the task and the location of the relevant feature.

## Evidence of Task Execution

| Task | Scope Supported by the Material | Remaining Gaps |
|---|---|---|
| T1 Entry and eligibility | Channel guidance and private prompts for users not in the voice channel were observed. | The wrong-text-channel scenario was not sufficiently located. |
| T2 Drawing players | Finding, rolling, results and repeated-click prompts. | A short sample cannot establish long-term fairness. |
| T3 Traits and replies | Selection, reselection, submission, replies and authorisation. | The complete vocabulary and all tones were not checked individually. |
| T4 No submission and custom replies | Failed deselection, automatic submission and draft retention; an all-blank result is also visible. | Spaces-only input and exact 200/201-character tests were not sufficiently verified. |
| T5 Changing one's mind | Another sentence, cancellation and difficulty returning to categories. | Not a complete content review of all six categories. |
| T6 Direct command and sending | An unresponsive command; sending through the button; no observed duplicate public messages. | The failed application's root cause was not reproduced in the backend. |
| T7 Expiry and help | Old preview changes, reopening and verbal feedback about finding instructions. | Some comments conflict with the footage; the later portion of E1 is a black screen. |

## Analysis Against the Ten Heuristics

| Heuristic | Assessment in This Evaluation |
|---|---|
| H1 Visibility of System Status | Drawing, submission, cancellation and sending have feedback. HE03 identifies separation between entry points and results. The visibility of expiry feedback needs retesting. |
| H2 Match Between the System and the Real World | HE05 excuse comprehension and HE07 random-category naming offer opportunities for improvement. Humour itself is not classified as a problem. |
| H3 User Control and Freedom | HE01: selected traits cannot be cleared. HE04: users cannot return directly to categories. Dialogs can be closed while retaining drafts. |
| H4 Consistency and Standards | HE02: application and command entry points are inconsistent. Widespread conflicts in button meaning were not recorded. |
| H5 Error Prevention | Repeated draws and sending have protections. HE01 can still submit a trait the user no longer wishes to express. |
| H6 Recognition Rather than Recall | HE03 requires finding the panel again. HE06 concerns scattered rules and difficulty locating them. |
| H7 Flexibility and Efficiency of Use | HE02: the shortcut fails. HE03 and HE04 add repeated actions. |
| H8 Aesthetic and Minimalist Design | Cards and buttons are readable. There is insufficient clear evidence of a distinct visual defect; an H8 issue is not invented to fill the category. |
| H9 Error Recovery | Eligibility, authorisation and expiry have prompts. The failed command has no product-specific recovery guidance, and the session relied on the moderator. |
| H10 Help and Documentation | HE06: centralised help is hard to find. Existing contextual prompts should be retained rather than described as a complete absence of instructions. |

## Retesting and Evaluation Boundaries

### Retest Checklist

- Clear a selected trait and wait until the deadline. Confirm that it is excluded from the result, and clearly distinguish changing a trait from declining to contribute.

- Verify the application owning /excuse. Complete direct entry, preview and sending in both clients and confirm that an old application no longer produces an unresponsive command.

- Use all three tools repeatedly in a channel with many chat messages. Check that the main entry point and latest result are easy to find.

- Change categories directly within the excuse preview without cancelling and reopening. Confirm that nothing is published during the change.

- Ask target users to explain the meanings of several excuses and predict the behaviour of Surprise Me before first use.

- Without moderator explanation, locate instructions about anonymity, automatic submission, later replies and preview expiry recovery.

- Retest input boundaries using character-counted blank, spaces-only, 200-character and 201-character samples. Retest rotation with a fixed roster.

### Scope of the Conclusions

This is a secondary heuristic analysis of material from two experts operating together. It cannot establish population-level task success rates, issue occurrence rates or statistical significance. The two task documents specify what should be inspected; they do not prove that every step was actually performed. Moderator explanations may have helped task completion, so success after explanation is not evidence that the interface alone was sufficiently clear.

Automatic transcription can misrecognise English, overlapping speech and proper names. Judgements are based on the context of relevant comments, verifiable screen evidence and written feedback; clearly unrelated transcription phrases were excluded. The later portion of E1 contains a black screen, so later feature judgements rely on E2-B and earlier footage. Complete frame-by-frame verification cannot be claimed.

The next step is for both experts to review the seven issues and proposed severity ratings before retesting against the checklist. Retaining counterevidence such as 'not confusing, but requires extra steps', and discrepancies where a prompt is visible on screen but was not noticed verbally, helps avoid misclassifying task guidance or platform behaviour as product defects.

## Method References

Nielsen's Ten Usability Heuristics: https://www.nngroup.com/articles/ten-usability-heuristics/

Nielsen's Severity Ratings: https://www.nngroup.com/articles/how-to-rate-the-severity-of-usability-problems/

The method organises issues and priorities. The specific Pally findings, ratings and recommendations are derived from this material, not conclusions about Pally supplied by the referenced articles.
