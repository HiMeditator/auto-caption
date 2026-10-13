"""DashScope Paraformer duplex streaming ASR adapter."""
import os
import queue
import threading
from datetime import datetime

import dashscope
from dashscope.audio.asr import Recognition, RecognitionCallback, RecognitionResult
from utils import shared_data, stdout_cmd, stdout_obj, stdout_err, get_translation_function


class Callback(RecognitionCallback):
    def __init__(self, owner):
        super().__init__()
        self.owner = owner
        self.index = 0
        self.sentence_key = None
        self.time_str = ''
        self.finished = False

    def on_open(self):
        stdout_cmd('info', 'Paraformer recognizer started.')

    def on_close(self):
        stdout_cmd('info', 'Paraformer recognizer closed.')
        if not self.owner.stopping and shared_data.status == 'running':
            self.owner.fail('Paraformer connection closed unexpectedly.')

    def on_complete(self):
        if not self.owner.stopping and shared_data.status == 'running':
            self.owner.fail('Paraformer recognition ended unexpectedly.')

    def on_error(self, result):
        self.owner.fail(str(result.message))

    def on_event(self, result: RecognitionResult):
        sentence = result.get_sentence()
        if not isinstance(sentence, dict) or not sentence.get('text', '').strip():
            return
        key = (result.get_request_id(), sentence.get('begin_time'))
        if key != self.sentence_key:
            self.index += 1
            self.sentence_key = key
            self.time_str = datetime.now().strftime('%H:%M:%S.%f')[:-3]
            self.finished = False
        if self.finished:
            return
        text = sentence['text']
        stdout_obj({
            'command': 'caption', 'index': self.index,
            'time_s': self.time_str,
            'time_t': datetime.now().strftime('%H:%M:%S.%f')[:-3],
            'text': text, 'translation': ''
        })
        if RecognitionResult.is_sentence_end(sentence):
            self.finished = True
            if self.owner.target:
                threading.Thread(
                    target=self.owner.translation_function,
                    args=(self.owner.translation_model, self.owner.target, text,
                          self.time_str, self.owner.translation_base_url,
                          self.owner.translation_api_key), daemon=True
                ).start()


class ParaformerRecognizer:
    def __init__(self, rate, source, target, api_key, translation_provider,
                 translation_model, translation_base_url='', translation_api_key=''):
        if source not in ('auto', 'zh', 'en', 'ja', 'yue', 'ko', 'de', 'fr', 'ru'):
            raise ValueError('Unsupported Paraformer source language: ' + source)
        dashscope.api_key = api_key or os.environ.get('DASHSCOPE_API_KEY', '')
        if not dashscope.api_key:
            raise ValueError('Paraformer requires an API key or DASHSCOPE_API_KEY.')
        self.target = target
        self.translation_function = get_translation_function(translation_provider)
        self.translation_model = translation_model
        self.translation_base_url = translation_base_url
        self.translation_api_key = translation_api_key
        self.stopping = False
        self.failed = False
        self.recognizer = Recognition(
            model='paraformer-realtime-v2', format='pcm', sample_rate=rate,
            language_hints=[] if source == 'auto' else [source],
            heartbeat=True, callback=Callback(self)
        )

    def fail(self, message):
        if not self.failed:
            self.failed = True
            stdout_err(message)
            shared_data.status = 'kill'
            stdout_cmd('kill')

    def start(self):
        self.recognizer.start()

    def translate(self):
        while shared_data.status == 'running':
            try:
                chunk = shared_data.chunk_queue.get(timeout=0.2)
            except queue.Empty:
                continue
            if shared_data.status != 'running':
                break
            try:
                self.recognizer.send_audio_frame(chunk)
            except Exception as error:
                self.fail(str(error))
                break

    def stop(self):
        self.stopping = True
        try:
            self.recognizer.stop()
        except Exception as error:
            if not self.failed:
                stdout_err(str(error))
