export const WORD_GROUPS = [
  ['steady', 'lucky', 'adventurous', 'support-focused'],
  ['clutch', 'cautious', 'energetic', 'creative'],
];
export const WORDS = WORD_GROUPS.flat();
const phrases = {
  steady: 'steady at the wheel', lucky: 'lucky at every turn',
  adventurous: 'adventurous on every detour', 'support-focused': 'support-focused when the team needs a hand',
  clutch: 'clutch when the clock runs out', cautious: 'cautious around mysterious buttons',
  energetic: 'energetic even on the loading screen', creative: 'creative with every unexpected obstacle',
};
const titles = {
  steady: 'The Unshakeable Quest Captain', lucky: 'The Fortune Cookie Champion',
  adventurous: 'The Side Quest Navigator', 'support-focused': 'The Backpack of Backup Plans',
  clutch: 'The Last-Second Magician', cautious: 'The Seatbelt-equipped Explorer',
  energetic: 'The Human Loading Screen Skip', creative: 'The Improvised Strategy Department',
};

// Deterministic local templates. No model calls, player IDs, counts or raw input lists.
export function portraitText(input) {
  const words = WORDS.filter(word => input.includes(word));
  if (!words.length) return {
    title: 'The Intergalactic Loading Screen',
    sentence: 'Somewhere in the galaxy, a rubber duck has been promoted to quest manager.',
  };
  let title = titles[words[0]];
  if (words.includes('lucky') && words.includes('adventurous')) title = 'The Accidental Expedition Leader';
  else if (words.includes('steady') && words.includes('support-focused')) title = 'The Team’s Emergency Lighthouse';
  else if (words.includes('clutch') && words.includes('cautious')) title = 'The Last-Second Safety Inspector';
  const parts = words.map(word => phrases[word]);
  const joined = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`;
  return { title, sentence: `Always ${joined}, this player turns an ordinary mission into a story worth retelling.` };
}
