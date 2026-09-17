"""Test the GitHub-to-SSM boundary without contacting AWS or a live bot."""
import base64
import importlib.util
import os
from pathlib import Path
import subprocess
import unittest
from unittest.mock import Mock, patch

spec = importlib.util.spec_from_file_location('deploy_ssm', Path(__file__).resolve().parents[1] / 'deploy-ssm.py')
ssm = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ssm)
SHA = 'a' * 40
ENV = {'GITHUB_REF': 'refs/heads/main', 'GITHUB_REPOSITORY': ssm.REPOSITORY,
       'GITHUB_EVENT_NAME': 'workflow_dispatch', 'GITHUB_SHA': SHA,
       'GITHUB_RUN_ID': '123', 'GITHUB_RUN_ATTEMPT': '2'}


class SsmTest(unittest.TestCase):
    def test_payload_targets_one_instance_and_runs_tested_commit_as_ec2_user(self):
        script = b'#!/bin/bash\necho "hello"\n'
        request = ssm.build_request(SHA, '123', '2', script)
        self.assertEqual(request['InstanceIds'], [ssm.INSTANCE])
        self.assertEqual(request['Parameters']['executionTimeout'], ['900'])
        command = request['Parameters']['commands'][0]
        self.assertIn(base64.b64encode(script).decode(), command)
        self.assertIn('sudo -H -u ec2-user bash', command)
        self.assertIn('deploy-actions-123-2.sh ' + SHA, command)
        self.assertEqual(subprocess.run(['sh', '-n'], input=command, text=True).returncode, 0)

    def test_rejects_untrusted_values_before_generating_shell(self):
        for sha, run, attempt in [('main', '123', '1'), (SHA, '1;id', '1'), (SHA, '123', '../2')]:
            with self.subTest(sha=sha, run=run, attempt=attempt):
                with self.assertRaises(ValueError):
                    ssm.build_request(sha, run, attempt, b'echo hello')

    def test_eventual_consistency_and_throttling_do_not_redispatch(self):
        success = {'Status': 'Success', 'ResponseCode': 0}
        call = Mock(side_effect=[ssm.AwsError('InvocationDoesNotExist'),
                                {'Status': 'Pending'}, ssm.AwsError('ThrottlingException'),
                                {'Status': 'InProgress'}, success])
        result = ssm.wait_for_result('cmd', call=call, clock=lambda: 0, sleep=lambda _: None)
        self.assertEqual(result, success)
        self.assertTrue(all(args.args[0] == 'get-command-invocation' for args in call.call_args_list))

    def test_terminal_failure_returns_and_access_denied_is_not_retried(self):
        failed = {'Status': 'Failed', 'ResponseCode': 1}
        call = Mock(return_value=failed)
        self.assertEqual(ssm.wait_for_result('cmd', call=call), failed)
        call = Mock(side_effect=ssm.AwsError('AccessDeniedException'))
        with self.assertRaises(ssm.AwsError):
            ssm.wait_for_result('cmd', call=call)
        self.assertEqual(call.call_count, 1)

    def test_timeout_does_not_poll_forever(self):
        with self.assertRaises(TimeoutError):
            ssm.wait_for_result('cmd', call=Mock(), clock=Mock(side_effect=[0, 1081]))

    def test_wrong_branch_repository_or_event_never_calls_aws(self):
        for key, value in [('GITHUB_REF', 'refs/heads/feature'), ('GITHUB_REPOSITORY', 'other/repo'),
                           ('GITHUB_EVENT_NAME', 'pull_request')]:
            with self.subTest(key=key), patch.dict(os.environ, {**ENV, key: value}, clear=True), \
                    patch.object(ssm, 'aws_call') as call:
                with self.assertRaises(ValueError):
                    ssm.main()
                call.assert_not_called()

    def test_monitor_failure_cancels_known_command_without_second_deploy(self):
        with patch.dict(os.environ, ENV, clear=True), patch.object(ssm.signal, 'signal'), \
                patch.object(ssm, 'aws_call', return_value={'Command': {'CommandId': 'cmd'}}) as call, \
                patch.object(ssm, 'wait_for_result', side_effect=TimeoutError('timeout')):
            with self.assertRaises(TimeoutError):
                ssm.main()
            self.assertEqual([c.args[0] for c in call.call_args_list], ['send-command', 'cancel-command'])

    def test_uncertain_send_is_not_retried(self):
        with patch.dict(os.environ, ENV, clear=True), \
                patch.object(ssm, 'aws_call', side_effect=ssm.AwsError('network error')) as call:
            with self.assertRaises(ssm.AwsError):
                ssm.main()
            self.assertEqual(call.call_count, 1)

    def test_success_requires_both_status_and_zero_exit_code(self):
        for status, code, should_fail in [('Success', 0, False), ('Success', 1, True), ('Failed', 0, True)]:
            with self.subTest(status=status, code=code), patch.dict(os.environ, ENV, clear=True), \
                    patch.object(ssm.signal, 'signal'), \
                    patch.object(ssm, 'aws_call', return_value={'Command': {'CommandId': 'cmd'}}), \
                    patch.object(ssm, 'wait_for_result', return_value={'Status': status, 'ResponseCode': code}):
                if should_fail:
                    with self.assertRaises(RuntimeError):
                        ssm.main()
                else:
                    ssm.main()


if __name__ == '__main__':
    unittest.main()
