// Fixed gameplay vocabulary; descriptions are about play, not personal identity.
export const WORD_GROUPS = [
  ['supportive', 'strategic', 'funny', 'creative', 'patient', 'adaptable', 'encouraging'],
  ['reckless', 'distracted', 'hesitant', 'energetic', 'supportive', 'strategic', 'lucky'],
  ['impatient', 'overconfident', 'chaotic', 'cautious', 'funny', 'creative', 'adventurous'],
];
export const WORDS = [...new Set(WORD_GROUPS.flat())];
export const wordLabel = word => word[0].toUpperCase() + word.slice(1);
const phrases = {
  supportive: 'supportive when a teammate needs a hand', strategic: 'strategic with every tiny advantage',
  funny: 'funny even when the mission goes sideways', creative: 'creative with unexpected obstacles',
  patient: 'patient through the longest loading screens', adaptable: 'adaptable when the plan changes',
  encouraging: 'encouraging after a spectacular team wipe', reckless: 'reckless around mysterious red buttons',
  distracted: 'distracted by every shiny side quest', hesitant: 'hesitant at the boss-room door',
  energetic: 'energetic enough to power the respawn screen', lucky: 'lucky when the dice escape gravity',
  impatient: 'impatient with doors that open too slowly', overconfident: 'overconfident before checking the health bar',
  chaotic: 'chaotic when the plan meets reality', cautious: 'cautious around suspicious treasure chests',
  adventurous: 'adventurous on every detour',
};
const titles = {
  supportive: 'The Team’s Emergency Lighthouse', strategic: 'The Pocket-Sized Grandmaster',
  funny: 'The Respawn Comedy Club', creative: 'The Improvised Strategy Department',
  patient: 'The Unshakeable Quest Captain', adaptable: 'The Walking Backup Plan',
  encouraging: 'The Portable Pep-Talk Machine', reckless: 'The Red-Button Expedition Leader',
  distracted: 'The Side Quest Magnet', hesitant: 'The Boss-Door Philosopher',
  energetic: 'The Human Loading Screen Skip', lucky: 'The Fortune Cookie Champion',
  impatient: 'The Fast-Forward Adventurer', overconfident: 'The One-HP Victory Announcer',
  chaotic: 'The Accidental Fireworks Director', cautious: 'The Seatbelt-equipped Explorer',
  adventurous: 'The Side Quest Navigator',
};

// A portrait's tone decides which replies the selected player is offered.
const PRAISE = ['supportive', 'strategic', 'funny', 'creative', 'patient', 'adaptable', 'encouraging'];
const TEASE = ['reckless', 'distracted', 'hesitant', 'impatient', 'overconfident', 'chaotic'];
export function portraitTone(input) {
  const words = WORDS.filter(word => input.includes(word));
  if (!words.length) return null;
  const praised = words.some(word => PRAISE.includes(word)), teased = words.some(word => TEASE.includes(word));
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

export function portraitText(input) {
  const words = WORDS.filter(word => input.includes(word));
  if (!words.length) return {
    title: 'The Unwritten Legend',
    sentence: 'No traits were submitted this time. This player’s next adventure is still a blank page.',
  };
  let title = titles[words[0]];
  if (words.includes('strategic') && words.includes('chaotic')) title = 'The Strategist with a Confetti Cannon';
  else if (words.includes('patient') && words.includes('impatient')) title = 'The Zen Master of Fast Forward';
  else if (words.includes('lucky') && words.includes('adventurous')) title = 'The Accidental Expedition Leader';
  const parts = words.map(word => phrases[word]);
  const joined = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`;
  return { title, sentence: `In the team's eyes, this player is ${joined}. Together, these traits turn an ordinary mission into a story worth retelling.` };
}
