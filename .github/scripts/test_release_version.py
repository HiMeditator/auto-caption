import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from release_version import release_outputs


class ReleaseVersionTests(unittest.TestCase):
    def test_unchanged_and_new_branch_do_not_release(self):
        for previous in ('1.2.0', None):
            self.assertEqual(release_outputs(previous, '1.2.0')['changed'], 'false')

    def test_version_change(self):
        self.assertEqual(release_outputs('1.2.0', '1.3.0'), {
            'changed': 'true', 'version': '1.3.0', 'tag': 'v1.3.0',
            'prerelease': 'false',
        })

    def test_prerelease_and_build_metadata(self):
        result = release_outputs('1.2.0', '1.3.0-rc.1+build.42')
        self.assertEqual(result['prerelease'], 'true')
        self.assertEqual(result['tag'], 'v1.3.0-rc.1+build.42')
        self.assertEqual(release_outputs('1.2.0', '1.3.0+build.42')['prerelease'], 'false')

    def test_reject_unsafe_or_invalid_versions(self):
        for version in ('v1.3.0', '01.3.0', '1.3', '1.3.0-01', '1.3.0\ntag=oops', ''):
            with self.subTest(version=version), self.assertRaises(ValueError):
                release_outputs('1.2.0', version)

    def test_detection_compares_entire_push_not_last_commit(self):
        script = Path(__file__).with_name('release_version.py').resolve()
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)

            def git(*args):
                return subprocess.check_output(['git', *args], cwd=root, encoding='utf-8',
                                               stderr=subprocess.STDOUT).strip()

            def commit(version):
                (root / 'package.json').write_text(json.dumps({'version': version}),
                                                 encoding='utf-8')
                git('add', 'package.json')
                git('-c', 'user.name=CI Test', '-c', 'user.email=ci@example.com',
                    'commit', '--allow-empty', '-m', 'fixture')

            git('init')
            commit('1.2.0')
            before = git('rev-parse', 'HEAD')
            commit('1.3.0')
            commit('1.3.0')  # A later commit does not modify the version.
            event = root / 'event.json'
            output = root / 'output.txt'
            event.write_text(json.dumps({'before': before}), encoding='utf-8')
            environment = {**os.environ, 'GITHUB_EVENT_PATH': str(event),
                           'GITHUB_OUTPUT': str(output)}
            subprocess.run([sys.executable, str(script)], cwd=root, env=environment,
                           check=True, capture_output=True)
            self.assertIn('changed=true', output.read_text(encoding='utf-8'))
            self.assertIn('tag=v1.3.0', output.read_text(encoding='utf-8'))
            event.write_text(json.dumps({'before': '0' * 40}), encoding='utf-8')
            output.write_text('', encoding='utf-8')
            subprocess.run([sys.executable, str(script)], cwd=root, env=environment,
                           check=True, capture_output=True)
            self.assertIn('changed=false', output.read_text(encoding='utf-8'))


if __name__ == '__main__':
    unittest.main()
