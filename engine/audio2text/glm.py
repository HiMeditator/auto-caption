import threading
import io
import wave
import struct
import math
import audioop
import requests
from datetime import datetime

from utils import shared_data
from utils import stdout_cmd, stdout_obj, google_translate, ollama_translate

class GlmRecognizer:
    """
    使用 GLM-ASR 引擎处理音频数据，并在标准输出中输出 Auto Caption 软件可读取的 JSON 字符串数据

    初始化参数：
        url: GLM-ASR API URL
        model: GLM-ASR 模型名称
        api_key: GLM-ASR API Key
        source: 源语言
        target: 目标语言
        trans_model: 翻译模型名称
        ollama_name: Ollama 模型名称
    """
    def __init__(self, url: str, model: str, api_key: str, source: str, target: str | None, trans_model: str, ollama_name: str, ollama_url: str = '', ollama_api_key: str = ''):
        self.url = url
        self.model = model
        self.api_key = api_key
        self.source = source
        self.target = target
        if trans_model == 'google':
            self.trans_func = google_translate
        else:
            self.trans_func = ollama_translate
        self.ollama_name = ollama_name
        self.ollama_url = ollama_url
        self.ollama_api_key = ollama_api_key
        
        self.audio_buffer = []
        self.is_speech = False
        self.silence_frames = 0
        self.speech_start_time = None
        self.time_str = ''
        self.cur_id = 0
        
        # VAD settings (假设 16k 16bit, chunk size 1024 or similar)
        # 16bit = 2 bytes per sample.
        # RMS threshold needs tuning. 500 is a conservative guess for silence.
        self.threshold = 500 
        self.silence_limit = 15 # frames (approx 0.5-1s depending on chunk size)
        self.min_speech_frames = 10 # frames

    def start(self):
        """启动 GLM 引擎"""
        stdout_cmd('info', 'GLM-ASR recognizer started.')

    def stop(self):
        """停止 GLM 引擎"""
        stdout_cmd('info', 'GLM-ASR recognizer stopped.')

    def process_audio(self, chunk):
        # chunk is bytes (int16)
        rms = audioop.rms(chunk, 2)
        
        if rms > self.threshold:
            if not self.is_speech:
                self.is_speech = True
                self.time_str = datetime.now().strftime('%H:%M:%S.%f')[:-3]
                self.audio_buffer = []
            self.audio_buffer.append(chunk)
            self.silence_frames = 0
        else:
            if self.is_speech:
                self.audio_buffer.append(chunk)
                self.silence_frames += 1
                if self.silence_frames > self.silence_limit:
                    # Speech ended
                    if len(self.audio_buffer) > self.min_speech_frames:
                        self.recognize(self.audio_buffer, self.time_str)
                    self.is_speech = False
                    self.audio_buffer = []
                    self.silence_frames = 0
    
    def recognize(self, audio_frames, time_s):
        audio_bytes = b''.join(audio_frames)
        
        wav_io = io.BytesIO()
        with wave.open(wav_io, 'wb') as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(16000)
            wav_file.writeframes(audio_bytes)
        wav_io.seek(0)
        
        threading.Thread(
            target=self._do_request, 
            args=(wav_io.read(), time_s, self.cur_id)
        ).start()
        self.cur_id += 1

    def _do_request(self, audio_content, time_s, index):
        try:
            files = {
                'file': ('audio.wav', audio_content, 'audio/wav')
            }
            data = {
                'model': self.model,
                'stream': 'false'
            }
            headers = {
                'Authorization': f'Bearer {self.api_key}'
            }
            
            response = requests.post(self.url, headers=headers, data=data, files=files, timeout=15)
            
            if response.status_code == 200:
                res_json = response.json()
                text = res_json.get('text', '')
                if text:
                    self.output_caption(text, time_s, index)
            else:
                try:
                    err_msg = response.json()
                    stdout_cmd('error', f"GLM API Error: {err_msg}")
                except:
                    stdout_cmd('error', f"GLM API Error: {response.text}")
                
        except Exception as e:
            stdout_cmd('error', f"GLM Request Failed: {str(e)}")

    def output_caption(self, text, time_s, index):
        caption = {
            'command': 'caption',
            'index': index,
            'time_s': time_s,
            'time_t': datetime.now().strftime('%H:%M:%S.%f')[:-3],
            'text': text,
            'translation': ''
        }
        
        if self.target:
             if self.trans_func == ollama_translate:
                 th = threading.Thread(
                    target=self.trans_func,
                    args=(self.ollama_name, self.target, caption['text'], time_s, self.ollama_url, self.ollama_api_key),
                    daemon=True
                )
             else:
                 th = threading.Thread(
                    target=self.trans_func,
                    args=(self.ollama_name, self.target, caption['text'], time_s),
                    daemon=True
                )
             th.start()
        
        stdout_obj(caption)

    def translate(self):
        global shared_data
        while shared_data.status == 'running':
            chunk = shared_data.chunk_queue.get()
            self.process_audio(chunk)
