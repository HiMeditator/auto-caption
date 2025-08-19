import argparse
from utils import stdout_cmd, stderr
from utils import thread_data, start_server
from utils import merge_chunk_channels, resample_chunk_mono
from audio2text import InvalidParameter, GummyRecognizer
from audio2text import VoskRecognizer
from sysaudio import AudioStream


def main_gummy(s: str, t: str, a: int, c: int, k: str):
    global thread_data
    stream = AudioStream(a, c)
    if t == 'none':
        engine = GummyRecognizer(stream.RATE, s, None, k)
    else:
        engine = GummyRecognizer(stream.RATE, s, t, k)

    stream.open_stream()
    engine.start()

    restart_count = 0
    while thread_data.status == "running":
        try:
            chunk = stream.read_chunk()
            if chunk is None: continue
            chunk_mono = merge_chunk_channels(chunk, stream.CHANNELS)
            try:
                engine.send_audio_frame(chunk_mono)
            except InvalidParameter as e:
                restart_count += 1
                if restart_count > 8:
                    stderr(str(e))
                    thread_data.status = "kill"
                    break
                else:
                    stdout_cmd('info', f'Gummy engine stopped, trying to restart #{restart_count}')
        except KeyboardInterrupt:
            break

    stream.close_stream()
    engine.stop()


def main_vosk(a: int, c: int, m: str):
    global thread_data
    stream = AudioStream(a, c)
    engine = VoskRecognizer(m)

    stream.open_stream()
    engine.start()

    while thread_data.status == "running":
        try:
            chunk = stream.read_chunk()
            if chunk is None: continue
            chunk_mono = resample_chunk_mono(chunk, stream.CHANNELS, stream.RATE, 16000)
            engine.send_audio_frame(chunk_mono)
        except KeyboardInterrupt:
            break

    stream.close_stream()
    engine.stop()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Convert system audio stream to text')
    # both
    parser.add_argument('-e', '--caption_engine', default='gummy', help='Caption engine: gummy or vosk')
    parser.add_argument('-a', '--audio_type', default=0, help='Audio stream source: 0 for output, 1 for input')
    parser.add_argument('-c', '--chunk_rate', default=10, help='Number of audio stream chunks collected per second')
    parser.add_argument('-p', '--port', default=8080, help='The port to run the server on, 0 for no server')
    # gummy only
    parser.add_argument('-s', '--source_language', default='en', help='Source language code')
    parser.add_argument('-t', '--target_language', default='zh', help='Target language code')
    parser.add_argument('-k', '--api_key', default='', help='API KEY for Gummy model')
    # vosk only
    parser.add_argument('-m', '--model_path', default='', help='The path to the vosk model.')

    args = parser.parse_args()
    if int(args.port) == 0:
        thread_data.status = "running"
    else:
        start_server(int(args.port))

    if args.caption_engine == 'gummy':
        main_gummy(
            args.source_language,
            args.target_language,
            int(args.audio_type),
            int(args.chunk_rate),
            args.api_key
        )
    elif args.caption_engine == 'vosk':
        main_vosk(
            int(args.audio_type),
            int(args.chunk_rate),
            args.model_path
        )
    else:
        raise ValueError('Invalid caption engine specified.')
    
    if thread_data.status == "kill":
        stdout_cmd('kill')
