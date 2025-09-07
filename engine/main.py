import wave
import argparse
import threading
import datetime
from utils import stdout, stdout_cmd
from utils import shared_data, start_server
from utils import merge_chunk_channels, resample_chunk_mono
from audio2text import GummyRecognizer
from audio2text import VoskRecognizer
from audio2text import SosvRecognizer
from sysaudio import AudioStream


def audio_recording(stream: AudioStream, resample: bool, record = False, path = ''):
    global shared_data
    stream.open_stream()
    wf = None
    full_name = ''
    if record:
        if path != '' and path[-1] != '/':
            path += '/'
        cur_dt = datetime.datetime.now()
        name = cur_dt.strftime("audio-%Y-%m-%dT%H-%M-%S")
        full_name = f'{path}{name}.wav'
        wf = wave.open(full_name, 'wb')
        wf.setnchannels(stream.CHANNELS)
        wf.setsampwidth(stream.SAMP_WIDTH)
        wf.setframerate(stream.RATE)
        stdout_cmd("info", "Audio recording...")
    while shared_data.status == 'running':
        raw_chunk = stream.read_chunk()
        if record: wf.writeframes(raw_chunk) # type: ignore
        if raw_chunk is None: continue
        if resample:
            chunk = resample_chunk_mono(raw_chunk, stream.CHANNELS, stream.RATE, 16000)
        else:
            chunk = merge_chunk_channels(raw_chunk, stream.CHANNELS)
        shared_data.chunk_queue.put(chunk)
    if record:
        stdout_cmd("info", f"Audio saved to {full_name}")
        wf.close() # type: ignore
    stream.close_stream_signal()


def main_gummy(s: str, t: str, a: int, c: int, k: str, r: bool, rp: str):
    """
    Parameters:
        s: Source language
        t: Target language
        k: Aliyun Bailian API key
        r: Whether to record the audio
        rp: Path to save the recorded audio
    """
    stream = AudioStream(a, c)
    if t == 'none':
        engine = GummyRecognizer(stream.RATE, s, None, k)
    else:
        engine = GummyRecognizer(stream.RATE, s, t, k)

    engine.start()
    stream_thread = threading.Thread(
        target=audio_recording,
        args=(stream, False, r, rp),
        daemon=True
    )
    stream_thread.start()
    try:
        engine.translate()
    except KeyboardInterrupt:
        stdout("Keyboard interrupt detected. Exiting...")
    engine.stop()


def main_vosk(a: int, c: int, vosk: str, t: str, tm: str, omn: str, r: bool, rp: str):
    """
    Parameters:
        a: Audio source: 0 for output, 1 for input
        c: Chunk number in 1 second
        vosk: Vosk model path
        t: Target language
        tm: Translation model type, ollama or google
        omn: Ollama model name
        r: Whether to record the audio
        rp: Path to save the recorded audio
    """
    stream = AudioStream(a, c)
    if t == 'none':
        engine = VoskRecognizer(vosk, None, tm, omn)
    else:
        engine = VoskRecognizer(vosk, t, tm, omn)

    engine.start()
    stream_thread = threading.Thread(
        target=audio_recording,
        args=(stream, True, r, rp),
        daemon=True
    )
    stream_thread.start()
    try:
        engine.translate()
    except KeyboardInterrupt:
        stdout("Keyboard interrupt detected. Exiting...")
    engine.stop()


def main_sosv(a: int, c: int, sosv: str, s: str, t: str, tm: str, omn: str, r: bool, rp: str):
    """
    Parameters:
        a: Audio source: 0 for output, 1 for input
        c: Chunk number in 1 second
        sosv: Sherpa-ONNX SenseVoice model path
        s: Source language
        t: Target language
        tm: Translation model type, ollama or google
        omn: Ollama model name
        r: Whether to record the audio
        rp: Path to save the recorded audio
    """
    stream = AudioStream(a, c)
    if t == 'none':
        engine = SosvRecognizer(sosv, s, None, tm, omn)
    else:
        engine = SosvRecognizer(sosv, s, t, tm, omn)

    engine.start()
    stream_thread = threading.Thread(
        target=audio_recording,
        args=(stream, True, r, rp),
        daemon=True
    )
    stream_thread.start()
    try:
        engine.translate()
    except KeyboardInterrupt:
        stdout("Keyboard interrupt detected. Exiting...")
    engine.stop()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Convert system audio stream to text')
    # all
    parser.add_argument('-e', '--caption_engine', default='gummy', help='Caption engine: gummy or vosk')
    parser.add_argument('-a', '--audio_type', default=0, help='Audio stream source: 0 for output, 1 for input')
    parser.add_argument('-c', '--chunk_rate', default=10, help='Number of audio stream chunks collected per second')
    parser.add_argument('-p', '--port', default=0, help='The port to run the server on, 0 for no server')
    parser.add_argument('-t', '--target_language', default='zh', help='Target language code, "none" for no translation')
    parser.add_argument('-r', '--record', default=0, help='Whether to record the audio, 0 for no recording, 1 for recording')
    parser.add_argument('-rp', '--record_path', default='', help='Path to save the recorded audio')
    # gummy and sosv
    parser.add_argument('-s', '--source_language', default='auto', help='Source language code')
    # gummy only
    parser.add_argument('-k', '--api_key', default='', help='API KEY for Gummy model')
    # vosk and sosv
    parser.add_argument('-tm', '--translation_model', default='ollama', help='Model for translation: ollama or google')
    parser.add_argument('-omn', '--ollama_name', default='', help='Ollama model name for translation')
    # vosk only
    parser.add_argument('-vosk', '--vosk_model', default='', help='The path to the vosk model.')
    # sosv only
    parser.add_argument('-sosv', '--sosv_model', default=None, help='The SenseVoice model path')

    args = parser.parse_args()
    if int(args.port) == 0:
        shared_data.status = "running"
    else:
        start_server(int(args.port))
    
    if args.caption_engine == 'gummy':
        main_gummy(
            args.source_language,
            args.target_language,
            int(args.audio_type),
            int(args.chunk_rate),
            args.api_key,
            True if int(args.record) == 1 else False,
            args.record_path
        )
    elif args.caption_engine == 'vosk':
        main_vosk(
            int(args.audio_type),
            int(args.chunk_rate),
            args.vosk_model,
            args.target_language,
            args.translation_model,
            args.ollama_name,
            True if int(args.record) == 1 else False,
            args.record_path
        )
    elif args.caption_engine == 'sosv':
        main_sosv(
            int(args.audio_type),
            int(args.chunk_rate),
            args.sosv_model,
            args.source_language,
            args.target_language,
            args.translation_model,
            args.ollama_name,
            True if int(args.record) == 1 else False,
            args.record_path
        )
    else:
        raise ValueError('Invalid caption engine specified.')
    
    if shared_data.status == "kill":
        stdout_cmd('kill')
