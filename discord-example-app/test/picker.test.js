import test from 'node:test';
import assert from 'node:assert/strict';
import { createPicker } from '../picker.js';
import { createInteractions } from '../interactions.js';
import { createPortraitStore } from '../portrait-store.js';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const guildId = '1542404404680982550', voiceChannelId = '1542404405301878860', textChannelId = '1542404405301878856';
const A = '100000000000000010', B = '100000000000000011', C = '100000000000000012';
let id = 100000000000000100n;
const request = (action = 'mermer:panel:picker', user = C) => ({
  id: String(id++), type: 3, guild_id: guildId, channel_id: textChannelId,
  application_id: '100000000000000099', token: 'private-token',
  member: { user: { id: user } }, data: { custom_id: action },
});
function harness({ apiHook, saveHook } = {}) {
  let clock = 100_000, ids = [A, B, C], ready = true, state = { seen: [], active: null };
  const listeners = new Set(), tasks = new Set(), calls = [];
  const config = { guildId, voiceChannelId, textChannelId, now: () => clock, choose: () => 0,
    roster: { snapshot: () => ({ ready, ids: [...ids] }), subscribe: fn => { listeners.add(fn); return () => listeners.delete(fn); } },
    store: { load: () => structuredClone(state), save: data => { saveHook?.(); state = structuredClone(data); } },
    api: async (path, options) => { calls.push({ path, ...structuredClone(options) }); await apiHook?.(path, options); return { id: String(id++) }; },
    schedule: (fn, delay) => { const task = { fn, due: clock + delay }; tasks.add(task); return task; },
    unschedule: task => tasks.delete(task), report: () => {},
  };
  const picker = createPicker(config);
  return { picker, config, calls, tasks, state: () => state,
    async start(user = C) { const action = picker.handle(request(undefined, user)); await action.afterReply?.(); return action; },
    current: () => calls.findLast(call => call.path.startsWith('channels/')),
    async click(index, user) {
      const latest = calls.findLast(call => call.path.startsWith('channels/'));
      const action = picker.handle(request(latest.body.components[0].components[index].custom_id, user));
      await action.afterReply?.(); return action;
    },
    change(next, connected = true) { ids = next; ready = connected; for (const fn of listeners) fn(); },
    async advance(ms) { clock += ms; for (const task of [...tasks]) if (task.due <= clock) { tasks.delete(task); await task.fn(); } },
  };
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test('picker is anonymous, restricted to bound voice/text/guild and excludes simultaneous starts', async () => {
  const h = harness();
  for (const body of [request(undefined, 'outsider'), { ...request(), guild_id: 'wrong' }, { ...request(), channel_id: 'wrong' }]) {
    const action = h.picker.handle(body);
    assert.equal(action.response.data.flags, 64);
    assert.equal(action.afterReply, undefined);
  }
  const startRequest = request();
  const start = h.picker.handle(startRequest);
  assert.deepEqual(start.response, { type: 5, data: { flags: 64 } });
  assert.equal(h.calls.length, 0);
  assert.match(h.picker.handle(request()).response.data.content, /already in progress/);
  await start.afterReply();
  const message = h.current().body;
  assert.match(message.content, new RegExp(A));
  assert.equal(JSON.stringify(message).includes(C), false);
  assert.equal(message.message_reference, undefined);
  assert.equal(message.interaction_metadata, undefined);
  assert.equal(message.enforce_nonce, true);
  assert.deepEqual(message.allowed_mentions, { parse: [] });
  await h.click(0, A);
  assert.equal(h.picker.handle(startRequest).afterReply, undefined);
});

test('only the selected player can pass or accept, repeated clicks cannot draw twice, everyone passing ends', async () => {
  const h = harness();
  await h.start();
  const pass = h.current().body.components[0].components[1].custom_id;
  assert.match(h.picker.handle(request(pass, B)).response.data.content, /Only the selected/);
  const first = h.picker.handle(request(pass, A));
  assert.equal(first.response.data.flags, 64);
  assert.match(h.picker.handle(request(pass, A)).response.data.content, /already being processed/);
  await first.afterReply();
  assert.match(h.current().body.content, new RegExp(B));
  assert.match(h.picker.handle(request(pass, A)).response.data.content, /moved on/);
  await h.click(1, B);
  assert.match(h.current().body.content, new RegExp(C));
  await h.click(1, C);
  assert.match(h.current().body.content, /Everyone has passed or left/);
  assert.deepEqual(h.current().body.components, []);
  assert.equal(h.state().active, null);
  assert.equal(h.tasks.size, 0);
  assert.equal(h.calls.filter(call => call.method === 'POST').length, 1);
});

test('accept ends the round; fair rotation continues across rounds and resets after all have a turn', async () => {
  const h = harness();
  for (const selected of [A, B, C, A]) {
    await h.start();
    assert.match(h.current().body.content, new RegExp(selected));
    await h.click(0, selected);
    assert.match(h.current().body.content, /accepted the invitation opportunity/);
    assert.deepEqual(h.current().body.components, []);
    assert.equal(h.state().active, null);
  }
});

test('selected player leaving redraws; late joiners wait for next round; rejoining cannot reclaim a passed turn', async () => {
  const h = harness();
  h.change([A, B]);
  await h.start(B);
  h.change([A, B, C]);
  h.change([B, C]);
  await flush();
  assert.match(h.current().body.content, new RegExp(B));
  h.change([A, B, C]);
  await h.click(1, B);
  assert.match(h.current().body.content, /Everyone has passed or left/);
  assert.deepEqual(h.current().body.components, []);
});

test('timeout and Gateway disconnect close the public controls and release the round', async () => {
  const h = harness();
  await h.start();
  const old = h.current().body.components[0].components[1].custom_id;
  await h.advance(60_000);
  assert.match(h.current().body.content, /without a response/);
  assert.equal(h.state().active, null);
  assert.match(h.picker.handle(request(old, A)).response.data.content, /closed/);
  await h.start();
  h.change([A, B, C], false);
  await flush();
  assert.match(h.current().body.content, /interrupted/);
  assert.deepEqual(h.current().body.components, []);
  assert.equal(h.state().active, null);
  assert.equal(h.tasks.size, 0);
});

test('restart closes interrupted picker and preserves its separate fair rotation', async () => {
  const h = harness();
  await h.start();
  h.picker.dispose();
  assert.equal(JSON.stringify(h.state()).includes('private-token'), false);
  const restored = createPicker(h.config);
  assert.match(restored.handle(request()).response.data.content, /recovering/);
  await restored.recover();
  assert.match(h.current().body.content, /restarted/);
  await restored.handle(request()).afterReply();
  assert.match(h.current().body.content, new RegExp(B));
  restored.dispose();
});

test('API failures release locks and disk failures prevent a draw; no automatic duplicate POST', async () => {
  let failing = 'POST';
  const h = harness({ apiHook: (path, options) => {
    if (path.startsWith('channels/') && options.method === failing) throw Object.assign(new Error('denied'), { status: 403 });
  } });
  await h.start();
  assert.equal(h.state().active, null);
  assert.deepEqual(h.state().seen, []);
  assert.equal(h.calls.filter(call => call.method === 'POST').length, 1);
  failing = null;
  await h.start();
  failing = 'PATCH';
  await h.click(1, A);
  assert.equal(h.state().active, null);
  assert.equal(h.tasks.size, 0);
  const broken = harness({ saveHook: () => { throw new Error('disk full'); } });
  assert.equal(broken.picker.handle(request()).afterReply, undefined);
  assert.equal(broken.calls.length, 0);
});

test('voice changes during an in-flight public POST are reconciled after publication', async () => {
  let release;
  const wait = new Promise(resolve => { release = resolve; });
  const h = harness({ apiHook: (_path, options) => options.method === 'POST' ? wait : undefined });
  const pending = h.picker.handle(request()).afterReply();
  h.change([B, C]);
  release();
  await pending;
  assert.match(h.current().body.content, new RegExp(B));
  assert.equal(h.calls.filter(call => call.method === 'POST').length, 1);
  h.picker.dispose();
});

test('existing portrait state and picker state remain separate in the same data volume', () => {
  const dir = mkdtempSync(join(tmpdir(), 'mermer-picker-'));
  try {
    const portrait = createPortraitStore(dir, 'scope');
    const picker = createPortraitStore(dir, 'scope', 'picker-state.json');
    portrait.save({ seen: [A], active: null });
    picker.save({ seen: [B], active: null });
    assert.deepEqual(portrait.load().seen, [A]);
    assert.deepEqual(picker.load().seen, [B]);
  } finally { rmSync(dir, { recursive: true }); }
});

test('HTTP interaction router connects both picker start and pass buttons', async () => {
  const h = harness();
  const handle = createInteractions({ api: h.config.api, guildId, picker: h.picker });
  const start = handle(request());
  await start.afterReply();
  const pass = handle(request(h.current().body.components[0].components[1].custom_id, A));
  await pass.afterReply();
  assert.match(h.current().body.content, new RegExp(B));
  h.picker.dispose();
});
