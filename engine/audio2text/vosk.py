import json
import threading
import time
from datetime import datetime

from vosk import Model, KaldiRecognizer, SetLogLevel
from utils import shared_data
from utils import stdout_cmd, stdout_obj, get_translation_function


class VoskRecognizer:
    """
    使用 Vosk 引擎流式处理的音频数据，并在标准输出中输出与 Auto Caption 软件可读取的 JSON 字符串数据

    初始化参数：
        model_path: Vosk 识别模型路径
        target: 翻译目标语言
        translation_provider: 翻译服务
        translation_model: 翻译模型名称
    """
    def __init__(self, model_path: str, target: str | None, translation_provider: str, translation_model: str, translation_base_url: str = '', translation_api_key: str = ''):
        SetLogLevel(-1)
        if model_path.startswith('"'):
            model_path = model_path[1:]
        if model_path.endswith('"'):
            model_path = model_path[:-1]
        self.model_path = model_path
        self.target = target
        self.translation_function = get_translation_function(translation_provider)
        self.translation_model = translation_model
        self.translation_base_url = translation_base_url
        self.translation_api_key = translation_api_key
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
                    target=self.translation_function,
                    args=(self.translation_model, self.target, caption['text'], self.time_str, self.translation_base_url, self.translation_api_key),
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
