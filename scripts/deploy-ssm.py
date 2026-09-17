#!/usr/bin/env python3
"""GitHub runner -> SSM Run Command. No credentials or bot env are sent in the payload."""
import base64
import json
import os
from pathlib import Path
import re
import shlex
import signal
import subprocess
import tempfile
import time

ROOT = Path(__file__).resolve().parent
REGION = 'ap-southeast-2'
INSTANCE = 'i-0fb34ffbb056595e0'
REPOSITORY = 'qinghuai999/DECO-3500-Team-07-Mermer-Coming'


class AwsError(RuntimeError):
    pass


def aws_call(*args):
    result = subprocess.run(
        ['aws', '--region', REGION, '--no-cli-pager', '--cli-connect-timeout', '10',
         '--cli-read-timeout', '20', 'ssm', *args, '--output', 'json'],
        capture_output=True, text=True, timeout=40,
        env={**os.environ, 'AWS_PAGER': '', 'AWS_CLI_AUTO_PROMPT': 'off',
             'AWS_MAX_ATTEMPTS': '1'},
    )
    if result.returncode:
        raise AwsError(result.stderr.strip() or f'AWS CLI exited {result.returncode}')
    return json.loads(result.stdout or '{}')


def build_request(sha, run_id, attempt, script):
    if not re.fullmatch(r'[0-9a-f]{40}', sha):
        raise ValueError('Deployment requires the full tested commit SHA.')
    if not re.fullmatch(r'[0-9]+', run_id) or not re.fullmatch(r'[0-9]+', attempt):
        raise ValueError('Invalid GitHub run ID or attempt.')
    encoded = base64.b64encode(script).decode('ascii')
    path = f'/home/ec2-user/mermer-runtime/deploy-actions-{run_id}-{attempt}.sh'
    # SSM runs as root; only install the reviewed script as root, then deploy as ec2-user.
    # Use a unique file so replacing the manual deployment script cannot affect an active run.
    command = '\n'.join([
        'set -eu', 'umask 077',
        'install -d -m 700 -o ec2-user -g ec2-user /home/ec2-user/mermer-runtime',
        f'trap {shlex.quote("rm -f -- " + shlex.quote(path))} EXIT',
        f'printf %s {shlex.quote(encoded)} | base64 --decode > {shlex.quote(path)}',
        f'chown ec2-user:ec2-user {shlex.quote(path)}',
        f'chmod 700 {shlex.quote(path)}',
        f'sudo -H -u ec2-user bash {shlex.quote(path)} {shlex.quote(sha)}',
    ])
    return {
        'InstanceIds': [INSTANCE], 'DocumentName': 'AWS-RunShellScript',
        'Comment': f'main {sha[:12]} - GitHub run {run_id}',
        'TimeoutSeconds': 120,
        'Parameters': {'commands': [command], 'executionTimeout': ['900']},
    }


def wait_for_result(command_id, call=aws_call, clock=time.monotonic, sleep=time.sleep):
    deadline = clock() + 1080  # Includes delivery, build and rollback; AWS waiter defaults are too short.
    previous = None
    while clock() < deadline:
        try:
            result = call('get-command-invocation', '--command-id', command_id, '--instance-id', INSTANCE)
        except AwsError as error:
            if 'InvocationDoesNotExist' not in str(error) and 'Throttling' not in str(error):
                raise
            sleep(5)
            continue
        status = result.get('Status', 'Unknown')
        if status != previous:
            print(f'SSM status: {status}', flush=True)
            previous = status
        if status not in ('Pending', 'InProgress', 'Delayed', 'Cancelling'):
            return result
        sleep(5)
    raise TimeoutError('Timed out waiting for SSM. Check the command in AWS Systems Manager.')


def append_summary(text):
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'], 'a', encoding='utf8') as summary:
            summary.write(text + '\n')


def main():
    if (os.environ.get('GITHUB_REF') != 'refs/heads/main'
            or os.environ.get('GITHUB_REPOSITORY') != REPOSITORY
            or os.environ.get('GITHUB_EVENT_NAME') != 'workflow_dispatch'):
        raise ValueError('Run Deploy EC2 manually from main in the configured repository.')
    sha = os.environ['GITHUB_SHA']
    payload = build_request(sha, os.environ['GITHUB_RUN_ID'], os.environ['GITHUB_RUN_ATTEMPT'],
                            (ROOT / 'deploy-main.sh').read_bytes())
    # Dispatch once: retrying an uncertain SendCommand could create a second deployment.
    with tempfile.TemporaryDirectory(prefix='mermer-ssm-') as temporary:
        request = Path(temporary) / 'request.json'
        request.write_text(json.dumps(payload), encoding='utf8')
        response = aws_call('send-command', '--cli-input-json', f'file://{request}')
    command_id = response['Command']['CommandId']
    print(f'SSM command: {command_id}', flush=True)
    append_summary(f'Commit: `{sha}`\n\nInstance: `{INSTANCE}`\n\nSSM command: `{command_id}`')

    def interrupted(signum, _frame):
        raise InterruptedError(f'Workflow interrupted (signal {signum}).')

    signal.signal(signal.SIGTERM, interrupted)
    signal.signal(signal.SIGINT, interrupted)
    try:
        result = wait_for_result(command_id)
    except (Exception, KeyboardInterrupt):
        try:
            aws_call('cancel-command', '--command-id', command_id, '--instance-ids', INSTANCE)
        except Exception:
            print('Could not confirm cancellation. Check the SSM command before deploying again.', flush=True)
        append_summary('Deployment monitoring failed or was interrupted. Check the SSM command and EC2 state.')
        raise

    # Disable GitHub workflow-command processing while displaying remote log text.
    marker = 'mermer-remote-output-' + command_id
    print(f'::stop-commands::{marker}')
    print(result.get('StandardOutputContent', ''))
    print(result.get('StandardErrorContent', ''))
    print(f'::{marker}::')
    successful = result.get('Status') == 'Success' and result.get('ResponseCode') == 0
    append_summary('Result: **deployment succeeded**.' if successful else
                   'Result: **deployment failed**. Review the log for rollback status.')
    if not successful:
        raise RuntimeError(f'SSM deployment failed: {result.get("Status")} / exit {result.get("ResponseCode")}')


if __name__ == '__main__':
    main()
