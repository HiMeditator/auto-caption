"""Compare package versions across the complete push, including squash merges."""
import json
import os
import re
import subprocess
from pathlib import Path


def release_outputs(previous, current):
    match = re.fullmatch(
        r'(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)'
        r'(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?'
        r'(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?', current)
    if not match or (match[4] and any(
            part.isdigit() and len(part) > 1 and part.startswith('0')
            for part in match[4].split('.'))):
        raise ValueError(f'Invalid package.json SemVer: {current!r}')
    return {
        'changed': str(previous is not None and previous != current).lower(),
        'version': current,
        'tag': f'v{current}',
        'prerelease': str(match[4] is not None).lower(),
    }


def main():
    event = json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_text(encoding='utf-8'))
    before = event['before']
    current = json.loads(Path('package.json').read_text(encoding='utf-8'))['version']
    previous = None
    if before != '0' * 40:
        # checkout fetch-depth: 0 normally supplies this object; a force push may not.
        available = subprocess.run(['git', 'cat-file', '-e', f'{before}^{{commit}}'],
                                   capture_output=True)
        if available.returncode:
            subprocess.run(['git', 'fetch', 'origin', before], check=True)
        content = subprocess.check_output(['git', 'show', f'{before}:package.json'],
                                          encoding='utf-8')
        previous = json.loads(content)['version']
    outputs = release_outputs(previous, current)
    with Path(os.environ['GITHUB_OUTPUT']).open('a', encoding='utf-8') as output:
        for key, value in outputs.items():
            output.write(f'{key}={value}\n')
    print(f'Version: {previous!r} -> {current!r}; release: {outputs["changed"]}')


if __name__ == '__main__':
    main()
