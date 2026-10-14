"""Qwen3.8 LiveTranslate: streaming source transcription and translation."""
import base64
import json
import os
import queue
import re
import threading
from collections import OrderedDict
from datetime import datetime, timedelta

import websocket
from utils import shared_data, stdout_cmd, stdout_obj, stdout_err

MODEL = 'qwen3.8-livetranslate-flash-realtime'
LANGUAGES = ('zh', 'en', 'ja', 'ko', 'de', 'fr', 'ru', 'es', 'it', 'pt')


class LiveTranslateRecognizer:
    def __init__(self, target, api_key='', workspace_id='', region='cn-beijing'):
        self.api_key = api_key or os.getenv('DASHSCOPE_API_KEY', '')
        workspace_id = workspace_id or os.getenv('DASHSCOPE_WORKSPACE_ID', '')
        if not self.api_key:
            raise ValueError('LiveTranslate requires an API key or DASHSCOPE_API_KEY.')
        if not re.fullmatch(r'[A-Za-z0-9-]+', workspace_id):
            raise ValueError('LiveTranslate requires a valid DashScope workspace ID.')
        if region not in ('cn-beijing', 'ap-southeast-1'):
            raise ValueError('Unsupported DashScope region.')
        if target is not None and target not in LANGUAGES:
            raise ValueError('Unsupported LiveTranslate target language: ' + target)
        self.target = target
        self.url = f'wss://{workspace_id}.{region}.maas.aliyuncs.com/api-ws/v1/realtime?model={MODEL}'
        self.socket = None
        self.receiver = None
        self.ready = threading.Event()
        self.finished = threading.Event()
        self.stopping = False
        self.failed = False
        self.records = OrderedDict()
        self.translations = OrderedDict()
        self.index = 0
        self.last_time = datetime.min

    def fail(self, message):
        if not self.failed:
            self.failed = True
            stdout_err(message)
            shared_data.status = 'kill'
            stdout_cmd('kill')
        self.ready.set()
        self.finished.set()

    def send(self, event):
        self.socket.send(json.dumps(event))

    def start(self):
        self.socket = websocket.create_connection(
            self.url, header={'Authorization': 'Bearer ' + self.api_key}, timeout=10)
        self.socket.settimeout(0.5)
        self.receiver = threading.Thread(target=self.receive, daemon=True)
        self.receiver.start()
        self.send({'type': 'session.update', 'session': {
            'output_modalities': ['text'],
            'audio': {'input': {'turn_detection': {'type': 'server_vad'}}},
            'translation': {'language': self.target or 'en'}
        }})
        if not self.ready.wait(10):
            self.fail('LiveTranslate session configuration timed out.')
        if not self.failed:
            stdout_cmd('info', 'Qwen LiveTranslate recognizer started.')

    def receive(self):
        try:
            while not self.finished.is_set():
                try:
                    message = self.socket.recv()
                except websocket.WebSocketTimeoutException:
                    continue
                if not message:
                    if not self.finished.is_set():
                        self.fail('LiveTranslate connection closed before session.finished.')
                    break
                self.on_event(json.loads(message))
        except Exception as error:
            if not self.finished.is_set():
                self.fail(str(error))

    def record(self, item_id):
        if item_id not in self.records:
            self.index += 1
            now = max(datetime.now(), self.last_time + timedelta(milliseconds=1))
            self.last_time = now
            self.records[item_id] = {
                'command': 'caption', 'index': self.index, 'update_by_time': True,
                'time_s': now.strftime('%H:%M:%S.%f')[:-3],
                'text': '', 'translation': ''
            }
            if len(self.records) > 256:
                self.records.popitem(last=False)
        return self.records[item_id]

    def publish(self, record):
        if record['text'].strip():
            stdout_obj({**record, 'time_t': datetime.now().strftime('%H:%M:%S.%f')[:-3]})

    def translated(self, item_id):
        if item_id not in self.translations:
            self.translations[item_id] = {'source_id': None, 'text': ''}
            if len(self.translations) > 256:
                self.translations.popitem(last=False)
        return self.translations[item_id]

    def publish_translation(self, translation):
        source_id = translation['source_id']
        if not self.target or not source_id:
            return
        record = self.record(source_id)
        record['translation'] = translation['text']
        if record['text'].strip():
            stdout_obj({'command': 'translation', 'time_s': record['time_s'],
                        'text': record['text'], 'translation': record['translation']})

    def on_event(self, event):
        kind = event.get('type', '')
        if kind == 'session.updated':
            self.ready.set()
        elif kind == 'session.finished':
            if not self.stopping:
                self.fail('LiveTranslate session ended unexpectedly.')
            self.finished.set()
        elif kind in ('error', 'conversation.item.input_audio_transcription.failed'):
            self.fail(str(event.get('error', {}).get('message', 'LiveTranslate request failed.')))
        elif kind == 'input_audio_buffer.speech_started':
            self.record(event['item_id'])
        elif kind == 'conversation.item.created' and event.get('item', {}).get('role') == 'assistant':
            translation = self.translated(event['item']['id'])
            translation['source_id'] = event.get('previous_item_id')
            self.publish_translation(translation)
        elif kind == 'conversation.item.input_audio_transcription.delta':
            record = self.record(event['item_id'])
            record['text'] += event.get('delta', '')
            self.publish(record)
        elif kind == 'conversation.item.input_audio_transcription.completed':
            record = self.record(event['item_id'])
            record['text'] = event.get('transcript', record['text'])
            self.publish(record)
        elif kind in ('response.text.delta', 'response.text.done'):
            translation = self.translated(event['item_id'])
            if kind.endswith('.delta'):
                translation['text'] += event.get('delta', '')
            else:
                translation['text'] = event.get('text', translation['text'])
            self.publish_translation(translation)
        elif kind == 'response.done' and event.get('response', {}).get('status') in ('failed', 'incomplete'):
            self.fail('LiveTranslate response failed or was incomplete.')

    def translate(self):
        while shared_data.status == 'running':
            try:
                chunk = shared_data.chunk_queue.get(timeout=0.2)
            except queue.Empty:
                continue
            if shared_data.status != 'running':
                break
            self.send({'type': 'input_audio_buffer.append',
                       'audio': base64.b64encode(chunk).decode('ascii')})

    def stop(self):
        self.stopping = True
        if self.socket is None:
            return
        try:
            if not self.failed:
                self.send({'type': 'session.finish'})
                if not self.finished.wait(2.5):
                    stdout_cmd('warn', 'LiveTranslate finish timed out; final results may be incomplete.')
        except Exception as error:
            if not self.failed:
                stdout_err(str(error))
        finally:
            self.finished.set()
            self.socket.close()
            if self.receiver:
                self.receiver.join(timeout=0.5)
