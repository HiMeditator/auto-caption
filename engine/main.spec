# -*- mode: python ; coding: utf-8 -*-

from pathlib import Path
import sys

if sys.platform == 'win32':
    vosk_path = str(Path('./.venv/Lib/site-packages/vosk').resolve())
else:
    venv_lib = Path('./.venv/lib')
    python_dirs = list(venv_lib.glob('python*'))
    if python_dirs:
        vosk_path = str((python_dirs[0] / 'site-packages' / 'vosk').resolve())
    else:
        vosk_path = str(Path('./.venv/lib/python3.12/site-packages/vosk').resolve())

a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=[(vosk_path, 'vosk')],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='main',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    onefile=True,
)
