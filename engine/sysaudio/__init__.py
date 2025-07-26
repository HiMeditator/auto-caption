import sys

if sys.platform == "win32":
    from .win import AudioStream
elif sys.platform == "darwin":
    from .darwin import AudioStream
elif sys.platform == "linux":
    from .linux import AudioStream
else:
    raise NotImplementedError(f"Unsupported platform: {sys.platform}")