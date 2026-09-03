import wave
import argparse
import threading
import datetime
from utils import stdout, stdout_cmd, change_caption_display
from utils import shared_data, start_server
from utils import merge_chunk_channels, resample_chunk_mono
from audio2text import GummyRecognizer
from audio2text import VoskRecognizer
from audio2text import SosvRecognizer
from audio2text import GlmRecognizer
from sysaudio import AudioStream


def audio_recording(stream: AudioStream, resample: bool, record = False, path = ''):
    global shared_data
    stream.open_stream()
    wf = None
    full_name = ''
    if record:
        if path != '':
            if path.startswith('"') and path.endswith('"'):
                path = path[1:-1]
            if path[-1] != '/':
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


def main_vosk(a: int, c: int, vosk: str, t: str, translation_provider: str, translation_model: str, translation_base_url: str, translation_api_key: str, r: bool, rp: str):
    """
    Parameters:
        a: Audio source: 0 for output, 1 for input
        c: Chunk number in 1 second
        vosk: Vosk model path
        t: Target language
        translation_provider: Translation service: ollama, openai or google
        translation_model: Model name used by the translation service
        translation_base_url: OpenAI-compatible API base URL
        translation_api_key: OpenAI-compatible API key
        r: Whether to record the audio
        rp: Path to save the recorded audio
    """
    stream = AudioStream(a, c)
    if t == 'none':
        engine = VoskRecognizer(vosk, None, translation_provider, translation_model, translation_base_url, translation_api_key)
    else:
        engine = VoskRecognizer(vosk, t, translation_provider, translation_model, translation_base_url, translation_api_key)

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


def main_sosv(a: int, c: int, sosv: str, s: str, t: str, translation_provider: str, translation_model: str, translation_base_url: str, translation_api_key: str, r: bool, rp: str):
    """
    Parameters:
        a: Audio source: 0 for output, 1 for input
        c: Chunk number in 1 second
        sosv: Sherpa-ONNX SenseVoice model path
        s: Source language
        t: Target language
        translation_provider: Translation service: ollama, openai or google
        translation_model: Model name used by the translation service
        translation_base_url: OpenAI-compatible API base URL
        translation_api_key: OpenAI-compatible API key
        r: Whether to record the audio
        rp: Path to save the recorded audio
    """
    stream = AudioStream(a, c)
    if t == 'none':
        engine = SosvRecognizer(sosv, s, None, translation_provider, translation_model, translation_base_url, translation_api_key)
    else:
        engine = SosvRecognizer(sosv, s, t, translation_provider, translation_model, translation_base_url, translation_api_key)

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


def main_glm(a: int, c: int, url: str, model: str, key: str, s: str, t: str, translation_provider: str, translation_model: str, translation_base_url: str, translation_api_key: str, r: bool, rp: str):
    """
    Parameters:
        a: Audio source
        c: Chunk rate
        url: GLM API URL
        model: GLM Model Name
        key: GLM API Key
        s: Source language
        t: Target language
        translation_provider: Translation service: ollama, openai or google
        translation_model: Model name used by the translation service
        translation_base_url: OpenAI-compatible API base URL
        translation_api_key: OpenAI-compatible API key
        r: Record
        rp: Record path
    """
    stream = AudioStream(a, c)
    if t == 'none':
        engine = GlmRecognizer(url, model, key, s, None, translation_provider, translation_model, translation_base_url, translation_api_key)
    else:
        engine = GlmRecognizer(url, model, key, s, t, translation_provider, translation_model, translation_base_url, translation_api_key)
    
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
    parser.add_argument('-e', '--caption_engine', default='gummy', help='Caption engine: gummy, glm, vosk or sosv')
    parser.add_argument('-a', '--audio_type', type=int, default=0, help='Audio stream source: 0 for output, 1 for input')
    parser.add_argument('-c', '--chunk_rate', type=int, default=10, help='Number of audio stream chunks collected per second')
    parser.add_argument('-p', '--port', type=int, default=0, help='The port to run the server on, 0 for no server')
    parser.add_argument('-d', '--display_caption', type=int, default=0, help='Display caption on terminal, 0 for no display, 1 for display')
    parser.add_argument('-t', '--target_language', default='none', help='Target language code, "none" for no translation')
    parser.add_argument('-r', '--record', type=int, default=0, help='Whether to record the audio, 0 for no recording, 1 for recording')
    parser.add_argument('-rp', '--record_path', default='', help='Path to save the recorded audio')
    # gummy and sosv and glm
    parser.add_argument('-s', '--source_language', default='auto', help='Source language code')
    # gummy only
    parser.add_argument('--gummy_api_key', default='', help='API key for the Gummy caption engine')
    # vosk, sosv and glm translation
    parser.add_argument('--translation_provider', choices=['ollama', 'openai', 'google'], default='ollama', help='Translation service provider')
    parser.add_argument('--translation_model', default='', help='Translation model name (for Ollama or OpenAI-compatible services)')
    parser.add_argument('--translation_base_url', default='', help='OpenAI-compatible API base URL')
    parser.add_argument('--translation_api_key', default='', help='OpenAI-compatible API key')
    # vosk only
    parser.add_argument('-vosk', '--vosk_model', default='', help='The path to the vosk model.')
    # sosv only
    parser.add_argument('-sosv', '--sosv_model', default=None, help='The SenseVoice model path')
    # glm only
    parser.add_argument('-gurl', '--glm_url', default='https://open.bigmodel.cn/api/paas/v4/audio/transcriptions', help='GLM API URL')
    parser.add_argument('-gmodel', '--glm_model', default='glm-asr-2512', help='GLM Model Name')
    parser.add_argument('-gkey', '--glm_api_key', default='', help='GLM API Key')

    args = parser.parse_args()

    uses_external_translation = args.caption_engine != 'gummy' and args.target_language != 'none'
    if uses_external_translation and args.translation_provider in ('ollama', 'openai') and not args.translation_model:
        parser.error('--translation_model is required when translation is enabled with Ollama or OpenAI')
    if uses_external_translation and args.translation_provider == 'openai' and not args.translation_base_url:
        parser.error('--translation_base_url is required when translation is enabled with OpenAI')

    if args.port != 0:
        threading.Thread(target=start_server, args=(args.port,), daemon=True).start()

    if args.display_caption == '1':
        change_caption_display(True)

    if args.caption_engine == 'gummy':
        main_gummy(
            args.source_language,
            args.target_language,
            int(args.audio_type),
            int(args.chunk_rate),
            args.gummy_api_key,
            bool(int(args.record)),
            args.record_path
        )
    elif args.caption_engine == 'vosk':
        main_vosk(
            int(args.audio_type),
            int(args.chunk_rate),
            args.vosk_model,
            args.target_language,
            args.translation_provider,
            args.translation_model,
            args.translation_base_url,
            args.translation_api_key,
            bool(int(args.record)),
            args.record_path
        )
    elif args.caption_engine == 'sosv':
        main_sosv(
            int(args.audio_type),
            int(args.chunk_rate),
            args.sosv_model,
            args.source_language,
            args.target_language,
            args.translation_provider,
            args.translation_model,
            args.translation_base_url,
            args.translation_api_key,
            bool(int(args.record)),
            args.record_path
        )
    elif args.caption_engine == 'glm':
        main_glm(
            int(args.audio_type),
            int(args.chunk_rate),
            args.glm_url,
            args.glm_model,
            args.glm_api_key,
            args.source_language,
            args.target_language,
            args.translation_provider,
            args.translation_model,
            args.translation_base_url,
            args.translation_api_key,
            bool(int(args.record)),
            args.record_path
        )
    else:
        raise ValueError('Invalid caption engine specified.')
    
    if shared_data.status == "kill":
        stdout_cmd('kill')
