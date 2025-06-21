import sys

if sys.platform == 'win32':
    from sysaudio.win import AudioStream, mergeStreamChannels
elif sys.platform == 'linux':
    from sysaudio.linux import AudioStream, mergeStreamChannels
else:
    raise NotImplementedError(f"Unsupported platform: {sys.platform}")

from audio2text.gummy import GummyTranslator
import sys
import argparse

def convert_audio_to_text(s_lang, t_lang, audio_type):
    sys.stdout.reconfigure(line_buffering=True)
    stream = AudioStream(audio_type)
    stream.openStream()

    if t_lang == 'none':
        gummy = GummyTranslator(stream.RATE, s_lang, None)
    else:
        gummy = GummyTranslator(stream.RATE, s_lang, t_lang)
    gummy.translator.start()

    while True:
        try:
            if not stream.stream: continue
            data = stream.stream.read(stream.CHUNK)
            data = mergeStreamChannels(data, stream.CHANNELS)
            gummy.translator.send_audio_frame(data)
        except KeyboardInterrupt:
            stream.closeStream()
            gummy.translator.stop()
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
        0 if args.audio_type == '0' else 1
    )
    