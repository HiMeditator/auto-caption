import sys
import argparse
from sysaudio import AudioStream
from utils import merge_chunk_channels
from audio2text import InvalidParameter, GummyTranslator


def convert_audio_to_text(s_lang, t_lang, audio_type, chunk_rate, api_key):
    stream = AudioStream(audio_type, chunk_rate)

    if t_lang == 'none':
        gummy = GummyTranslator(stream.RATE, s_lang, None, api_key)
    else:
        gummy = GummyTranslator(stream.RATE, s_lang, t_lang, api_key)

    stream.open_stream()
    gummy.start()

    while True:
        try:
            chunk = stream.read_chunk()
            if chunk is None: continue
            chunk_mono = merge_chunk_channels(chunk, stream.CHANNELS)
            try:
                gummy.send_audio_frame(chunk_mono)
            except InvalidParameter:
                gummy.start()
                gummy.send_audio_frame(chunk_mono)
        except KeyboardInterrupt:
            stream.close_stream()
            gummy.stop()
            break


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Convert system audio stream to text')
    parser.add_argument('-s', '--source_language', default='en', help='Source language code')
    parser.add_argument('-t', '--target_language', default='zh', help='Target language code')
    parser.add_argument('-a', '--audio_type', default=0, help='Audio stream source: 0 for output audio stream, 1 for input audio stream')
    parser.add_argument('-c', '--chunk_rate', default=20, help='The number of audio stream chunks collected per second.')
    parser.add_argument('-k', '--api_key', default='', help='API KEY for Gummy model')
    args = parser.parse_args()
    convert_audio_to_text(
        args.source_language,
        args.target_language,
        int(args.audio_type),
        int(args.chunk_rate),
        args.api_key
    )
