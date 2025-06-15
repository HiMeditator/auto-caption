import pyaudiowpatch as pyaudio
import numpy as np
import tkinter as tk
from tkinter import ttk
from dashscope.audio.asr import (
    TranslationRecognizerCallback,
    TranslationRecognizerRealtime
)
import threading
import queue

class AudioCapture:
    def __init__(self):
        self.audio = pyaudio.PyAudio()
        self.stream = None
        self.is_running = False
        self.setup_audio()

    def setup_audio(self):
        try:
            wasapi_info = self.audio.get_host_api_info_by_type(pyaudio.paWASAPI)
        except OSError:
            raise Exception("WASAPI 不可用")

        default_speaker = self.audio.get_device_info_by_index(wasapi_info["defaultOutputDevice"])
        
        if not default_speaker["isLoopbackDevice"]:
            for loopback in self.audio.get_loopback_device_info_generator():
                if default_speaker["name"] in loopback["name"]:
                    default_speaker = loopback
                    break
            else:
                raise Exception("未找到默认回环输出设备")

        self.device_info = default_speaker
        self.channels = default_speaker["maxInputChannels"]
        self.rate = int(default_speaker["defaultSampleRate"])
        self.chunk = self.rate // 10

    def start_stream(self):
        self.stream = self.audio.open(
            format=pyaudio.paInt16,
            channels=self.channels,
            rate=self.rate,
            input=True,
            input_device_index=self.device_info["index"]
        )
        self.is_running = True

    def stop_stream(self):
        if self.stream:
            self.is_running = False
            self.stream.stop_stream()
            self.stream.close()
            self.audio.terminate()

class CaptionCallback(TranslationRecognizerCallback):
    def __init__(self, text_queue):
        super().__init__()
        self.text_queue = text_queue
        self.usage = 0

    def on_open(self) -> None:
        self.text_queue.put(("status", "开始识别..."))

    def on_close(self) -> None:
        self.text_queue.put(("status", f"识别结束，消耗 Tokens: {self.usage}"))

    def on_event(self, request_id, transcription_result, translation_result, usage) -> None:
        if transcription_result is not None:
            text = transcription_result.text
            if transcription_result.stash is not None:
                text += transcription_result.stash.text
            self.text_queue.put(("caption", text))

        if translation_result is not None:
            lang = translation_result.get_language_list()[0]
            text = translation_result.get_translation(lang).text
            if translation_result.get_translation(lang).stash is not None:
                text += translation_result.get_translation(lang).stash.text
            self.text_queue.put(("translation", text))

        if usage:
            self.usage += usage['duration']

class CaptionApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("实时字幕")
        self.root.geometry("800x400")
        
        self.setup_ui()
        self.text_queue = queue.Queue()
        self.audio_capture = AudioCapture()
        self.translator = None
        self.is_running = False
        # 添加字幕缓存
        self.caption_cache = []
        self.translation_cache = []

    def setup_ui(self):
        # 状态标签
        self.status_label = ttk.Label(self.root, text="就绪")
        self.status_label.pack(pady=5)

        # 字幕显示区域
        self.caption_frame = ttk.Frame(self.root)
        self.caption_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)

        # 创建两个标签用于显示字幕和翻译
        self.caption_label1 = ttk.Label(self.caption_frame, text="", font=("Arial", 14))
        self.caption_label1.pack(fill=tk.X, pady=5)
        self.translation_label1 = ttk.Label(self.caption_frame, text="", font=("Arial", 14))
        self.translation_label1.pack(fill=tk.X, pady=5)
        
        self.caption_label2 = ttk.Label(self.caption_frame, text="", font=("Arial", 14))
        self.caption_label2.pack(fill=tk.X, pady=5)
        self.translation_label2 = ttk.Label(self.caption_frame, text="", font=("Arial", 14))
        self.translation_label2.pack(fill=tk.X, pady=5)

        # 控制按钮
        self.control_frame = ttk.Frame(self.root)
        self.control_frame.pack(pady=10)

        self.start_button = ttk.Button(self.control_frame, text="开始", command=self.start_caption)
        self.start_button.pack(side=tk.LEFT, padx=5)

        self.stop_button = ttk.Button(self.control_frame, text="停止", command=self.stop_caption, state=tk.DISABLED)
        self.stop_button.pack(side=tk.LEFT, padx=5)

    def start_caption(self):
        self.is_running = True
        self.start_button.config(state=tk.DISABLED)
        self.stop_button.config(state=tk.NORMAL)
        
        # 初始化翻译器
        self.translator = TranslationRecognizerRealtime(
            model="gummy-realtime-v1",
            format="pcm",
            sample_rate=self.audio_capture.rate,
            transcription_enabled=True,
            translation_enabled=True,
            source_language="ja",
            translation_target_languages=["zh"],
            callback=CaptionCallback(self.text_queue)
        )
        
        # 启动音频捕获和翻译
        self.audio_capture.start_stream()
        self.translator.start()
        
        # 启动处理线程
        threading.Thread(target=self.process_audio, daemon=True).start()
        threading.Thread(target=self.update_ui, daemon=True).start()

    def stop_caption(self):
        self.is_running = False
        self.start_button.config(state=tk.NORMAL)
        self.stop_button.config(state=tk.DISABLED)
        
        if self.translator:
            self.translator.stop()
        self.audio_capture.stop_stream()

    def process_audio(self):
        while self.is_running:
            try:
                data = self.audio_capture.stream.read(self.audio_capture.chunk)
                data_np = np.frombuffer(data, dtype=np.int16)
                data_np_r = data_np.reshape(-1, self.audio_capture.channels)
                mono_data = np.mean(data_np_r.astype(np.float32), axis=1)
                mono_data = mono_data.astype(np.int16)
                mono_data_bytes = mono_data.tobytes()
                self.translator.send_audio_frame(mono_data_bytes)
            except Exception as e:
                self.text_queue.put(("error", str(e)))
                break

    def update_caption_display(self):
        # 更新字幕显示
        if len(self.caption_cache) > 0:
            self.caption_label1.config(text=self.caption_cache[-1])
        if len(self.caption_cache) > 1:
            self.caption_label2.config(text=self.caption_cache[-2])
        else:
            self.caption_label2.config(text="")

        # 更新翻译显示
        if len(self.translation_cache) > 0:
            self.translation_label1.config(text=f"翻译: {self.translation_cache[-1]}")
        if len(self.translation_cache) > 1:
            self.translation_label2.config(text=f"翻译: {self.translation_cache[-2]}")
        else:
            self.translation_label2.config(text="")

    def update_ui(self):
        while self.is_running:
            try:
                msg_type, text = self.text_queue.get(timeout=0.1)
                if msg_type == "status":
                    self.status_label.config(text=text)
                elif msg_type == "caption":
                    self.caption_cache.append(text)
                    if len(self.caption_cache) > 2:
                        self.caption_cache.pop(0)
                    self.update_caption_display()
                elif msg_type == "translation":
                    self.translation_cache.append(text)
                    if len(self.translation_cache) > 2:
                        self.translation_cache.pop(0)
                    self.update_caption_display()
                elif msg_type == "error":
                    self.status_label.config(text=f"错误: {text}")
                    self.stop_caption()
            except queue.Empty:
                continue

    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    app = CaptionApp()
    app.run() 