from dashscope.audio.asr import (
    TranslationRecognizerCallback,
    TranscriptionResult,
    TranslationResult,
    TranslationRecognizerRealtime
)
import dashscope
from datetime import datetime
from utils import stdout_cmd, stdout_obj


class Callback(TranslationRecognizerCallback):
    """
    语音大模型流式传输回调对象
    """
    def __init__(self):
        super().__init__()
        self.index = 0
        self.usage = 0
        self.cur_id = -1
        self.time_str = ''

    def on_open(self) -> None:
        self.usage = 0
        self.cur_id = -1
        self.time_str = ''
        stdout_cmd('info', 'Gummy translator started.')

    def on_close(self) -> None:
        stdout_cmd('info', 'Gummy translator closed.')
        stdout_cmd('usage', str(self.usage))

    def on_event(
        self,
        request_id,
        transcription_result: TranscriptionResult,
        translation_result: TranslationResult,
        usage
    ) -> None:
        caption = {}

        if transcription_result is not None:
            if self.cur_id != transcription_result.sentence_id:
                self.time_str = datetime.now().strftime('%H:%M:%S.%f')[:-3]
                self.cur_id = transcription_result.sentence_id
                self.index += 1  
            caption['command'] = 'caption'
            caption['index'] = self.index
            caption['time_s'] = self.time_str
            caption['time_t'] = datetime.now().strftime('%H:%M:%S.%f')[:-3]
            caption['text'] = transcription_result.text
            caption['translation'] = ""

        if translation_result is not None:
            lang = translation_result.get_language_list()[0]
            caption['translation'] = translation_result.get_translation(lang).text

        if usage:
            self.usage += usage['duration']

        if 'text' in caption:
            stdout_obj(caption)


class GummyTranslator:
    """
    使用 Gummy 引擎流式处理的音频数据，并在标准输出中输出与 Auto Caption 软件可读取的 JSON 字符串数据

    初始化参数：
        rate: 音频采样率
        source: 源语言代码字符串（zh, en, ja 等）
        target: 目标语言代码字符串（zh, en, ja 等）
    """
    def __init__(self, rate: int, source: str, target: str | None, api_key: str | None):
        if api_key:
            dashscope.api_key = api_key
        self.translator = TranslationRecognizerRealtime(
            model = "gummy-realtime-v1",
            format = "pcm",
            sample_rate = rate,
            transcription_enabled = True,
            translation_enabled = (target is not None),
            source_language = source,
            translation_target_languages = [target],
            callback = Callback()
        )

    def start(self):
        """启动 Gummy 引擎"""
        self.translator.start()

    def send_audio_frame(self, data):
        """发送音频帧，擎将自动识别并将识别结果输出到标准输出中"""
        self.translator.send_audio_frame(data)

    def stop(self):
        """停止 Gummy 引擎"""
        self.translator.stop()
