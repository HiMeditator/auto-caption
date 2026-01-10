"""
Shepra-ONNX SenseVoice Model

This code file references the following:

https://github.com/k2-fsa/sherpa-onnx/blob/master/python-api-examples/simulate-streaming-sense-voice-microphone.py
"""

import time
from datetime import datetime
import sherpa_onnx
import threading
import numpy as np

from utils import shared_data
from utils import stdout_cmd, stdout_obj
from utils import google_translate, ollama_translate


class SosvRecognizer:
    """
    使用 Sense Voice 非流式模型处理流式音频数据，并在标准输出中输出 Auto Caption 软件可读取的 JSON 字符串数据

    初始化参数：
        model_path: Shepra ONNX Sense Voice 识别模型路径
        vad_model: Silero VAD 模型路径
        source: 识别源语言(auto, zh, en, ja, ko, yue)
        target: 翻译目标语言
        trans_model: 翻译模型名称
        ollama_name: Ollama 模型名称
    """
    def __init__(self, model_path: str, source: str, target: str | None, trans_model: str, ollama_name: str, ollama_url: str = '', ollama_api_key: str = ''):
        if model_path.startswith('"'):
            model_path = model_path[1:]
        if model_path.endswith('"'):
            model_path = model_path[:-1]
        self.model_path = model_path
        self.ext = ""
        if self.model_path[-4:] == "int8":
            self.ext = ".int8"
        self.source = source
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

    def start(self):
        """启动 Sense Voice 模型"""
        self.recognizer = sherpa_onnx.OfflineRecognizer.from_sense_voice(
            model=f"{self.model_path}/sensevoice/model{self.ext}.onnx",
            tokens=f"{self.model_path}/sensevoice/tokens.txt",
            language=self.source,
            num_threads = 2,
        )
        
        vad_config = sherpa_onnx.VadModelConfig()
        vad_config.silero_vad.model = f"{self.model_path}/silero_vad.onnx"
        vad_config.silero_vad.threshold = 0.5
        vad_config.silero_vad.min_silence_duration = 0.1
        vad_config.silero_vad.min_speech_duration = 0.25
        vad_config.silero_vad.max_speech_duration = 5
        vad_config.sample_rate = 16000
        self.window_size = vad_config.silero_vad.window_size
        self.vad = sherpa_onnx.VoiceActivityDetector(vad_config, buffer_size_in_seconds=100)

        if self.source == 'en':
            model_config = sherpa_onnx.OnlinePunctuationModelConfig(
                cnn_bilstm=f"{self.model_path}/punct-en/model{self.ext}.onnx",
                bpe_vocab=f"{self.model_path}/punct-en/bpe.vocab"
            )
            punct_config = sherpa_onnx.OnlinePunctuationConfig(
                model_config=model_config,
            )
            self.punct = sherpa_onnx.OnlinePunctuation(punct_config)
        else:
            punct_config = sherpa_onnx.OfflinePunctuationConfig(
                model=sherpa_onnx.OfflinePunctuationModelConfig(
                    ct_transformer=f"{self.model_path}/punct/model{self.ext}.onnx"
                ),
            )
            self.punct = sherpa_onnx.OfflinePunctuation(punct_config)

        self.buffer = []
        self.offset = 0
        self.started = False
        self.started_time = .0
        self.time_str = datetime.now().strftime('%H:%M:%S.%f')[:-3]
        stdout_cmd('info', 'Shepra ONNX Sense Voice recognizer started.')

    def send_audio_frame(self, data: bytes):
        """
        发送音频帧给 SOSV 引擎，引擎将自动识别并将识别结果输出到标准输出中

        Args:
            data: 音频帧数据，采样率必须为 16000Hz
        """
        caption = {}
        caption['command'] = 'caption'
        caption['translation'] = ''

        data_np = np.frombuffer(data, dtype=np.int16).astype(np.float32)
        self.buffer = np.concatenate([self.buffer, data_np])
        while self.offset + self.window_size < len(self.buffer):
            self.vad.accept_waveform(self.buffer[self.offset: self.offset + self.window_size])
            if not self.started and self.vad.is_speech_detected():
                self.started = True
                self.started_time = time.time()
            self.offset += self.window_size

        if not self.started:
            if len(self.buffer) > 10 * self.window_size:
                self.offset -= len(self.buffer) - 10 * self.window_size
                self.buffer = self.buffer[-10 * self.window_size:]

        if self.started and time.time() - self.started_time > 0.2:
            stream = self.recognizer.create_stream()
            stream.accept_waveform(16000, self.buffer)
            self.recognizer.decode_stream(stream)
            text = stream.result.text.strip()
            if text and self.prev_content != text:
                caption['index'] = self.cur_id
                caption['text'] = text
                caption['time_s'] = self.time_str
                caption['time_t'] = datetime.now().strftime('%H:%M:%S.%f')[:-3]
                self.prev_content = text
                stdout_obj(caption)
            self.started_time = time.time()
        
        while not self.vad.empty():
            stream = self.recognizer.create_stream()
            stream.accept_waveform(16000, self.vad.front.samples)
            self.vad.pop()
            self.recognizer.decode_stream(stream)
            text = stream.result.text.strip()

            if self.source == 'en':
                text_with_punct = self.punct.add_punctuation_with_case(text)
            else:
                text_with_punct = self.punct.add_punctuation(text)

            caption['index'] = self.cur_id
            caption['text'] = text_with_punct
            caption['time_s'] = self.time_str
            caption['time_t'] = datetime.now().strftime('%H:%M:%S.%f')[:-3]
            if text:
                stdout_obj(caption)
                if self.target:
                    th = threading.Thread(
                        target=self.trans_func,
                        args=(self.ollama_name, self.target, caption['text'], self.time_str, self.ollama_url, self.ollama_api_key),
                        daemon=True
                    )
                    th.start()    
                self.cur_id += 1
            self.prev_content = ''
            self.time_str = datetime.now().strftime('%H:%M:%S.%f')[:-3]
            self.buffer = []
            self.offset = 0
            self.started = False
            self.started_time = .0

    def translate(self):
        """持续读取共享数据中的音频帧，并进行语音识别，将识别结果输出到标准输出中"""
        global shared_data
        while shared_data.status == 'running':
            chunk = shared_data.chunk_queue.get()
            self.send_audio_frame(chunk)
    
    def stop(self):
        """停止 Sense Voice 模型"""
        stdout_cmd('info', 'Shepra ONNX Sense Voice recognizer closed.')
