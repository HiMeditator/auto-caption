import json
import threading
import time
from datetime import datetime

from vosk import Model, KaldiRecognizer, SetLogLevel
from utils import shared_data
from utils import stdout_cmd, stdout_obj, google_translate, ollama_translate


class VoskRecognizer:
    """
    使用 Vosk 引擎流式处理的音频数据，并在标准输出中输出与 Auto Caption 软件可读取的 JSON 字符串数据

    初始化参数：
        model_path: Vosk 识别模型路径
        target: 翻译目标语言
        trans_model: 翻译模型名称
        ollama_name: Ollama 模型名称
    """
    def __init__(self, model_path: str, target: str | None, trans_model: str, ollama_name: str, ollama_url: str = '', ollama_api_key: str = ''):
        SetLogLevel(-1)
        if model_path.startswith('"'):
            model_path = model_path[1:]
        if model_path.endswith('"'):
            model_path = model_path[:-1]
        self.model_path = model_path
        self.target = target
        if trans_model == 'google':
            self.trans_func = google_translate
        else:
            self.trans_func = ollama_translate
        self.ollama_name = ollama_name
        self.ollama_url = ollama_url
        self.ollama_api_key = ollama_api_key
        self.time_str = ''
        self.cur_id = 0
        self.prev_content = ''

        self.model = Model(self.model_path)
        self.recognizer = KaldiRecognizer(self.model, 16000)

    def start(self):
        """启动 Vosk 引擎"""
        stdout_cmd('info', 'Vosk recognizer started.')

    def send_audio_frame(self, data: bytes):
        """
        发送音频帧给 Vosk 引擎，引擎将自动识别并将识别结果输出到标准输出中

        Args:
            data: 音频帧数据，采样率必须为 16000Hz
        """
        caption = {}
        caption['command'] = 'caption'
        caption['translation'] = ''

        if self.recognizer.AcceptWaveform(data):
            content = json.loads(self.recognizer.Result()).get('text', '')
            caption['index'] = self.cur_id
            caption['text'] = content
            caption['time_s'] = self.time_str
            caption['time_t'] = datetime.now().strftime('%H:%M:%S.%f')[:-3]
            self.prev_content = ''
            if content == '': return
            self.cur_id += 1
            
            if self.target:
                th = threading.Thread(
                    target=self.trans_func,
                    args=(self.ollama_name, self.target, caption['text'], self.time_str, self.ollama_url, self.ollama_api_key),
                    daemon=True
                )
                th.start()
        else:
            content = json.loads(self.recognizer.PartialResult()).get('partial', '')
            if content == '' or content == self.prev_content:
                return
            if self.prev_content == '':
                self.time_str = datetime.now().strftime('%H:%M:%S.%f')[:-3]
            caption['index'] = self.cur_id
            caption['text'] = content
            caption['time_s'] = self.time_str
            caption['time_t'] = datetime.now().strftime('%H:%M:%S.%f')[:-3]
            self.prev_content = content
        
        stdout_obj(caption)

    def translate(self):
        """持续读取共享数据中的音频帧，并进行语音识别，将识别结果输出到标准输出中"""
        global shared_data
        while shared_data.status == 'running':
            chunk = shared_data.chunk_queue.get()
            self.send_audio_frame(chunk)

    def stop(self):
        """停止 Vosk 引擎"""
        stdout_cmd('info', 'Vosk recognizer closed.')