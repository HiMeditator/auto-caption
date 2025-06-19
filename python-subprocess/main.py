from sysaudio.win import LoopbackStream, mergeStreamChannels
from audio2text.gummy import GummyTranslator
import sys
import argparse

def convert_audio_to_text(s_lang, t_lang, audio_source):
    sys.stdout.reconfigure(line_buffering=True)
    loopback = LoopbackStream()
    loopback.openStream()

    gummy = GummyTranslator(loopback.RATE, s_lang, t_lang)
    gummy.translator.start()

    while True:
        if not loopback.stream: continue
        data = loopback.stream.read(loopback.CHUNK)
        data = mergeStreamChannels(data, loopback.CHANNELS)
        gummy.translator.send_audio_frame(data)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Convert system audio stream to text')
    parser.add_argument('-s', '--s_lang', default='en', help='Source language code')
    parser.add_argument('-t', '--t_lang', default='zh', help='Target language code')
    parser.add_argument('-a', '--audio', default=0, help='Audio stream source: 0 for output audio stream, 1 for input audio stream')
    args = parser.parse_args()
    convert_audio_to_text(args.s_lang, args.t_lang, args.audio)