import sys
import json
import argparse
from datetime import datetime
import numpy.core.multiarray

from sysaudio import AudioStream
from vosk import Model, KaldiRecognizer, SetLogLevel
from utils import resample_chunk_mono

SetLogLevel(-1)

def convert_audio_to_text(audio_type, chunk_rate, model_path):
    sys.stdout.reconfigure(line_buffering=True) # type: ignore

    if model_path.startswith('"'):
        model_path = model_path[1:]
    if model_path.endswith('"'):
        model_path = model_path[:-1]

    model = Model(model_path)
    recognizer = KaldiRecognizer(model, 16000)

    stream = AudioStream(audio_type, chunk_rate)
    stream.open_stream()

    time_str = ''
    cur_id = 0
    prev_content = ''

    while True:
        chunk = stream.read_chunk()
        if chunk is None: continue
        chunk_mono = resample_chunk_mono(chunk, stream.CHANNELS, stream.RATE, 16000)

        caption = {}
        if recognizer.AcceptWaveform(chunk_mono):
            content = json.loads(recognizer.Result()).get('text', '')
            caption['index'] = cur_id
            caption['text'] = content
            caption['time_s'] = time_str
            caption['time_t'] = datetime.now().strftime('%H:%M:%S.%f')[:-3]
            caption['translation'] = ''
            prev_content = ''
            cur_id += 1
        else:
            content = json.loads(recognizer.PartialResult()).get('partial', '')
            if content == '' or content == prev_content:
                continue
            if prev_content == '':
                time_str = datetime.now().strftime('%H:%M:%S.%f')[:-3]
            caption['command'] = 'caption'
            caption['index'] = cur_id
            caption['text'] = content
            caption['time_s'] = time_str
            caption['time_t'] = datetime.now().strftime('%H:%M:%S.%f')[:-3]
            caption['translation'] = ''
            prev_content = content
        try:
            json_str = json.dumps(caption) + '\n'
            sys.stdout.write(json_str)
            sys.stdout.flush()
        except Exception as e:
            print(e)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Convert system audio stream to text')
    parser.add_argument('-a', '--audio_type', default=0, help='Audio stream source: 0 for output audio stream, 1 for input audio stream')
    parser.add_argument('-c', '--chunk_rate', default=20, help='The number of audio stream chunks collected per second.')
    parser.add_argument('-m', '--model_path', default='', help='The path to the vosk model.')
    args = parser.parse_args()
    convert_audio_to_text(
        int(args.audio_type),
        int(args.chunk_rate),
        args.model_path
    )
