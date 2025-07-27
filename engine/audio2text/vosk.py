import json
from datetime import datetime

from vosk import Model, KaldiRecognizer, SetLogLevel
from utils import stdout_obj

class VoskRecognizer:
    """
    使用 Vosk 引擎流式处理的音频数据，并在标准输出中输出与 Auto Caption 软件可读取的 JSON 字符串数据

    初始化参数：
        model_path: Vosk 识别模型路径
    """
    def __int__(self, model_path: str):
        SetLogLevel(-1)
        if model_path.startswith('"'):
            model_path = model_path[1:]
        if model_path.endswith('"'):
            model_path = model_path[:-1]
        self.model_path = model_path
        self.time_str = ''
        self.cur_id = 0
        self.prev_content = ''

        self.model = Model(self.model_path)
        self.recognizer = KaldiRecognizer(self.model, 16000)
    
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
            self.cur_id += 1
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
