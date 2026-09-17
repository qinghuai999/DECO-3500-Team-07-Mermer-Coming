"""Exercise deployment/rollback with fake Git, Docker and HTTP. Never touches AWS."""
import io
import json
import os
from pathlib import Path
import subprocess
import tarfile
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'deploy-main.sh'
MOCK = r'''#!/usr/bin/env python3
import json, os, pathlib, sys
name = pathlib.Path(sys.argv[0]).name
args = sys.argv[1:]
root = pathlib.Path(os.environ['MOCK_ROOT'])
state = json.loads((root/'state.json').read_text())
fail = os.environ.get('MOCK_FAILURE', '')
with (root/'calls.jsonl').open('a') as log:
    log.write(json.dumps([name]+args)+'\n')
def save(): (root/'state.json').write_text(json.dumps(state))
def out(value): print(value)
if name == 'sudo':
    os.execvp(args[1], args[1:])
elif name == 'flock':
    sys.exit(1 if fail == 'locked' else 0)
elif name == 'sleep':
    pass
elif name == 'curl':
    if fail == 'health': sys.exit(22)
    out('ok')
elif name == 'git':
    if 'fetch' in args:
        if fail == 'fetch': sys.exit(128)
    elif 'init' in args: pathlib.Path(args[-1]).mkdir(parents=True)
    elif 'rev-parse' in args: out('a'*40)
    elif 'archive' in args: sys.stdout.buffer.write((root/'source.tar').read_bytes())
elif name == 'docker':
    containers = state['containers']
    op = args[0]
    if op in ('info', 'network', 'volume', 'tag'): pass
    elif op == 'build':
        if fail == 'build': sys.exit(1)
    elif op == 'container':
        sys.exit(0 if args[-1] in containers else 1)
    elif op == 'inspect':
        item = containers.get(args[-1])
        if not item: sys.exit(1)
        fmt = args[2]
        if 'State.Running' in fmt: out(str(item['running']).lower())
        elif 'RestartPolicy.Name' in fmt: out(item['policy'])
        elif 'MaximumRetryCount' in fmt: out('0')
        elif '.Mounts' in fmt: out(item.get('mount', 'volume:mermer-data'))
        elif 'mermer.deployment' in fmt: out(item.get('owner',''))
    elif op == 'update':
        containers[args[-1]]['policy'] = args[1].split('=',1)[1]; save()
    elif op == 'stop':
        containers[args[-1]]['running'] = False; save()
    elif op == 'rename':
        if fail == 'rename' and args[1] == 'mermer-bot': sys.exit(1)
        if args[2] in containers: sys.exit(1)
        containers[args[2]] = containers.pop(args[1]); save()
    elif op == 'run':
        if fail == 'run': sys.exit(1)
        target = args[args.index('--name')+1]
        if target in containers: sys.exit(1)
        owner = next(x.split('=',1)[1] for x in args if x.startswith('mermer.deployment='))
        containers[target] = {'running':True,'policy':'unless-stopped','owner':owner,'version':'new'}; save()
        out('new-container-id')
    elif op == 'rm':
        containers.pop(args[-1], None); save()
    elif op == 'start':
        containers[args[-1]]['running'] = True; save()
    else: raise RuntimeError(args)
else: raise RuntimeError(name)
'''


class DeployTest(unittest.TestCase):
    def run_deploy(self, failure='', mode='ssh', mount='volume:mermer-data', initial=True,
                   expected_commit=None):
        with tempfile.TemporaryDirectory(prefix='mermer-deploy-test-') as tmp:
            root = Path(tmp)
            runtime = root/'runtime'
            runtime.mkdir()
            (runtime/'bot.env').write_text('\n'.join(f'{key}=test-only' for key in (
                'APP_ID', 'PUBLIC_KEY', 'DISCORD_TOKEN', 'GUILD_ID', 'GAME_VOICE_CHANNEL_ID', 'SOCIAL_TEXT_CHANNEL_ID')))
            if mode is not None:
                (runtime/'github-auth-mode').write_text(mode)
            for filename in ('github-deploy-key', 'github-known-hosts', 'github-credentials'):
                (runtime/filename).write_text('FAKE-SECRET-NOT-A-REAL-CREDENTIAL')
            old = {'mermer-bot': {'running': True, 'policy': 'unless-stopped', 'version':'old', 'mount':mount}}
            (root/'state.json').write_text(json.dumps({'containers': old if initial else {}}))
            with tarfile.open(root/'source.tar', 'w') as tar:
                data = b'FROM node:24-alpine\n'
                entry = tarfile.TarInfo('discord-example-app/Dockerfile')
                entry.size = len(data)
                tar.addfile(entry, io.BytesIO(data))
            bindir = root/'bin'
            bindir.mkdir()
            for command in ('sudo', 'docker', 'git', 'curl', 'flock', 'sleep'):
                path = bindir/command
                path.write_text(MOCK)
                path.chmod(0o700)
            env = {**os.environ, 'PATH':str(bindir)+os.pathsep+os.environ['PATH'], 'MOCK_ROOT':tmp,
                   'MOCK_FAILURE':failure, 'MERMER_RUNTIME_DIR':str(runtime), 'MERMER_DEPLOY_DIR':str(root/'deploy')}
            args = ['bash', str(SCRIPT)]
            if expected_commit is not None:
                args.append(expected_commit)
            run = subprocess.run(args, env=env, capture_output=True, text=True, timeout=45)
            state = json.loads((root/'state.json').read_text())['containers']
            call_file = root/'calls.jsonl'
            calls = [json.loads(line) for line in call_file.read_text().splitlines()] if call_file.exists() else []
            self.assertNotIn('FAKE-SECRET', run.stdout+run.stderr)
            self.assertFalse(list((root/'deploy').glob('build.*')))
            return run, state, calls

    def test_success_fetches_main_preserves_data_and_retains_stopped_backup(self):
        run, state, calls = self.run_deploy()
        self.assertEqual(run.returncode, 0, run.stdout+run.stderr)
        self.assertEqual(state['mermer-bot']['version'], 'new')
        backup = next(value for key, value in state.items() if key.startswith('mermer-bot-backup-'))
        self.assertFalse(backup['running'])
        self.assertEqual(backup['policy'], 'no')
        fetch = next(call for call in calls if call[0] == 'git' and 'fetch' in call)
        self.assertIn('+refs/heads/main:refs/heads/main', fetch)
        launch = next(call for call in calls if call[:2] == ['docker','run'])
        self.assertIn('mermer-data:/app/data', launch)
        self.assertIn('STATE_DIR=/app/data', launch)
        build_idx = next(i for i,call in enumerate(calls) if call[:2] == ['docker','build'])
        stop_idx = next(i for i,call in enumerate(calls) if call[:2] == ['docker','stop'])
        self.assertLess(build_idx, stop_idx)

    def test_https_uses_scoped_helper_and_clean_url(self):
        run, state, calls = self.run_deploy(mode='https')
        self.assertEqual(run.returncode, 0, run.stdout+run.stderr)
        fetch = next(call for call in calls if call[0]=='git' and 'fetch' in call)
        self.assertIn('credential.useHttpPath=true', fetch)
        self.assertIn('https://github.com/qinghuai999/DECO-3500-Team-07-Mermer-Coming.git', fetch)

    def test_preflight_fetch_build_and_mount_failures_leave_current_bot_running(self):
        for failure, mount in [('locked','volume:mermer-data'), ('fetch','volume:mermer-data'), ('build','volume:mermer-data'), ('','bind:')]:
            with self.subTest(failure=failure, mount=mount):
                run, state, calls = self.run_deploy(failure, mount=mount)
                self.assertNotEqual(run.returncode, 0)
                self.assertEqual(state['mermer-bot']['version'], 'old')
                self.assertTrue(state['mermer-bot']['running'])
                self.assertFalse(any(call[:2]==['docker','stop'] for call in calls))

    def test_rename_run_and_health_failures_restore_old_name_policy_and_running_state(self):
        for failure in ('rename', 'run', 'health'):
            with self.subTest(failure=failure):
                run, state, calls = self.run_deploy(failure)
                self.assertNotEqual(run.returncode, 0)
                self.assertEqual(list(state), ['mermer-bot'])
                self.assertEqual(state['mermer-bot']['version'], 'old')
                self.assertEqual(state['mermer-bot']['policy'], 'unless-stopped')
                self.assertTrue(state['mermer-bot']['running'])
                self.assertFalse(any(call[:3]==['docker','volume','rm'] for call in calls))

    def test_failed_first_deploy_removes_only_the_new_container(self):
        run, state, calls = self.run_deploy('health', initial=False)
        self.assertNotEqual(run.returncode, 0)
        self.assertEqual(state, {})

    def test_changed_or_invalid_commit_never_replaces_running_bot(self):
        for sha in ('b'*40, 'main; exit 0'):
            with self.subTest(sha=sha):
                run, state, calls = self.run_deploy(expected_commit=sha)
                self.assertNotEqual(run.returncode, 0)
                self.assertTrue(state['mermer-bot']['running'])
                self.assertFalse(any(call[:2] in (['docker', 'build'], ['docker', 'stop']) for call in calls))

    def test_matching_commit_and_legacy_https_credentials_can_deploy(self):
        run, state, calls = self.run_deploy(mode=None, expected_commit='a'*40)
        self.assertEqual(run.returncode, 0, run.stdout+run.stderr)
        self.assertEqual(state['mermer-bot']['version'], 'new')
        fetch = next(call for call in calls if call[0]=='git' and 'fetch' in call)
        self.assertIn('credential.useHttpPath=true', fetch)


if __name__ == '__main__':
    unittest.main()
