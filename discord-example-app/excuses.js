import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const excuses = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'excuses.json'), 'utf8')
);

export function getRandomExcuse() {
  return excuses[Math.floor(Math.random() * excuses.length)];
}
