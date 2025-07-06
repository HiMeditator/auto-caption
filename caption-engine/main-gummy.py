import sys
import argparse

if sys.platform == 'win32':
    from sysaudio.win import AudioStream
elif sys.platform == 'linux':
    from sysaudio.linux import AudioStream
else:
    raise NotImplementedError(f"Unsupported platform: {sys.platform}")

from audioprcs import mergeChunkChannels
from audio2text import InvalidParameter, GummyTranslator


def convert_audio_to_text(s_lang, t_lang, audio_type):
    sys.stdout.reconfigure(line_buffering=True) # type: ignore
    stream = AudioStream(audio_type)

    if t_lang == 'none':
        gummy = GummyTranslator(stream.RATE, s_lang, None)
    else:
        gummy = GummyTranslator(stream.RATE, s_lang, t_lang)

    stream.openStream()
    gummy.start()

    while True:
        try:
            chunk = stream.read_chunk()
            chunk_mono = mergeChunkChannels(chunk, stream.CHANNELS)
            try:
                gummy.send_audio_frame(chunk_mono)
            except InvalidParameter:
                gummy.start()
                gummy.send_audio_frame(chunk_mono)
        except KeyboardInterrupt:
            stream.closeStream()
            gummy.stop()
            break


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Convert system audio stream to text')
    parser.add_argument('-s', '--source_language', default='en', help='Source language code')
    parser.add_argument('-t', '--target_language', default='zh', help='Target language code')
    parser.add_argument('-a', '--audio_type', default='0', help='Audio stream source: 0 for output audio stream, 1 for input audio stream')
    args = parser.parse_args()
    convert_audio_to_text(
        args.source_language,
        args.target_language,
        int(args.audio_type)
    )
