import { readFileSync } from 'node:fs';

// Every title and sentence is written by hand in portrait-lines.json: one entry per word and one per pair of words.
const lines = JSON.parse(readFileSync(new URL('./portrait-lines.json', import.meta.url), 'utf8'));
// Fixed gameplay vocabulary; descriptions are about play, not personal identity.
export const WORDS = Object.keys(lines.words);
// Each word is offered in exactly one group, and every group mixes praise, teasing and neutral words.
export const WORD_GROUPS = [
  ['supportive', 'creative', 'stubborn', 'quiet', 'funny', 'impatient', 'patient', 'competitive'],
  ['strategic', 'reckless', 'lucky', 'clutch', 'distracted', 'energetic', 'greedy', 'talkative'],
  ['adaptable', 'hesitant', 'cautious', 'encouraging', 'overconfident', 'adventurous', 'chaotic', 'sneaky'],
];
export const wordLabel = word => word[0].toUpperCase() + word.slice(1);
const lean = word => ({ positive: 1, negative: -1 })[lines.words[word].tone] ?? 0;

// A portrait's tone decides which replies the selected player is offered.
export function portraitTone(input) {
  const words = WORDS.filter(word => input.includes(word));
  if (!words.length) return null;
  const praised = words.some(word => lean(word) > 0), teased = words.some(word => lean(word) < 0);
  // Praise mixed with teasing, or only neutral words, gets the non-committal replies.
  return praised === teased ? 'neutral' : praised ? 'positive' : 'negative';
}
// Each line is a Discord button label, so it must stay within 80 characters.
export const REPLIES = {
  positive: [
    'Aww, stop it. Actually, don’t stop. Carry on.',
    'Finally, my talents are recognised. Autographs after the match.',
    'I accept this portrait and will be framing it above my respawn point.',
    'High-fives all round. You lot aren’t so bad yourselves.',
    'Thanks, squad. I dedicate this to my keyboard, who did most of the work.',
    'Too kind. I was mostly pressing buttons and hoping.',
    'Screenshotting this before anyone changes their mind.',
    'This is going straight on my gamer CV.',
    'Flattery accepted. Next round’s snacks are on me. Imaginary snacks.',
    'Accurate. I’d blush, but my character model doesn’t support it.',
  ],
  negative: [
    'Guilty as charged. My lawyer advises me to say nothing further.',
    'Objection! I’m drop-kicking this portrait straight back to the squad.',
    'Bold words from people standing this close to my respawn point.',
    'That wasn’t a mistake. That was an advanced strategy you haven’t unlocked yet.',
    'I blame the lag, the moon, and whoever was holding the snacks.',
    'Noted. I’ll file this under things to fix right after one more game.',
    'Fair. In my defence, it seemed like a great idea at the time.',
    'I reject this portrait and demand a recount. And a rematch.',
    'Ouch. Launching a friendly pie at the entire team. Nobody is safe.',
    'Okay, a tiny bit true. Character development arrives next patch.',
  ],
  neutral: [
    'Half of this is true. I’m not telling you which half.',
    'I neither confirm nor deny. The investigation continues.',
    'Interesting. I’ll be reviewing the replay with my legal team.',
    'I’ll take the nice bits. The rest can go back for a refund.',
    'Hmm. That’s one way to describe what I was doing.',
    'So that’s how it looked from over there. From here it was pure genius.',
    'Equal parts flattered and suspicious.',
    'I contain multitudes. Some of them were apparently on screen.',
    'No comment. My character speaks only through questionable decisions.',
    'A fair summary. One gentle nudge to the squad for the cheeky bits.',
  ],
};

// The result depends only on which words were chosen, never on who chose them, how often, or in what order.
export function portraitText(input) {
  const words = WORDS.filter(word => input.includes(word));
  if (!words.length) return { ...lines.blank };
  if (words.length === 1) return { title: lines.words[words[0]].title, sentence: lines.words[words[0]].sentence };
  // Three or more words are told pair by pair. Praise is paired with teasing first, because contrast reads best.
  const left = [...words], told = [];
  while (left.length > 1) {
    let pick;
    for (let a = 0; a < left.length; a++) for (let b = a + 1; b < left.length; b++) {
      const contrast = Math.abs(lean(left[a]) - lean(left[b]));
      if (!pick || contrast > pick.contrast) pick = { a, b, contrast };
    }
    told.push(lines.pairs[`${left[pick.a]}+${left[pick.b]}`]);
    left.splice(pick.b, 1);
    left.splice(pick.a, 1);
  }
  const sentences = told.map(([, sentence]) => sentence);
  if (left.length) {
    // The word without a partner gets its own closing line; which of its lines depends on the whole combination.
    const closing = lines.words[left[0]].extra;
    sentences.push(closing[words.reduce((sum, word) => sum + WORDS.indexOf(word), 0) % closing.length]);
  }
  return { title: told[0][0], sentence: sentences.join(' ') };
}
