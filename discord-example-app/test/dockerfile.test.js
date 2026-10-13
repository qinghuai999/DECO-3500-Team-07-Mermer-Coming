import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

// The image copies files by name, so a new module that is not listed only fails once deployed.
test('the Docker image contains every local file the bot loads', () => {
  const read = name => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
  const copied = new Set(read('Dockerfile').split('\n').filter(line => line.startsWith('COPY '))
    .flatMap(line => line.split(/\s+/).slice(1, -1)));
  const scripts = Object.values(JSON.parse(read('package.json')).scripts).map(script => /^node (\S+\.js)$/.exec(script)?.[1]).filter(Boolean);
  const seen = new Set();
  for (const pending = [...scripts]; pending.length;) {
    const file = pending.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    assert.ok(copied.has(file), `${file} is missing from the Dockerfile`);
    for (const [, target] of read(file).matchAll(/(?:from|import\()\s*['"]\.\/([\w.-]+)['"]/g)) pending.push(target);
    // Data files that exist in the repository; state files created at run time are not part of the image.
    for (const [, data] of read(file).matchAll(/['"](?:\.\/)?([\w-]+\.json)['"]/g)) {
      if (existsSync(new URL(`../${data}`, import.meta.url))) assert.ok(copied.has(data), `${data} is missing from the Dockerfile`);
    }
  }
});
