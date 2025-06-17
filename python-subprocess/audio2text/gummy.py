from dashscope.audio.asr import (
    TranslationRecognizerCallback,
    TranscriptionResult,
    TranslationResult,
    TranslationRecognizerRealtime    
)
from datetime import datetime

class Callback(TranslationRecognizerCallback):
    """
    语音大模型流式传输回调对象
    """
    def __init__(self):
        super().__init__()
        self.usage = 0
        self.cur_id = -1
        self.time_str = ''
    
    def on_open(self) -> None:
        print("INFO gummy translation start...")

    def on_close(self) -> None:
        print(f"INFO tokens useage: {self.usage}")
        print(f"INFO translation end...")

    def on_event(
        self,
        request_id,
        transcription_result: TranscriptionResult,
        translation_result: TranslationResult,
        usage
    ) -> None:
        caption = {}
        if transcription_result is not None:
            caption['id'] = transcription_result.sentence_id
            caption['text'] = transcription_result.text
            if caption['id'] != self.cur_id:
                self.cur_id = caption['id']
                cur_time = datetime.now().strftime('%H:%M:%S')
                caption['time_s'] = cur_time
                self.time_str = cur_time
            else:
                caption['time_s'] = self.time_str
            caption['time_t'] = datetime.now().strftime('%H:%M:%S')
            caption['translation'] = ""
        
        if translation_result is not None:
            lang = translation_result.get_language_list()[0]
            caption['translation'] = translation_result.get_translation(lang).text
        
        if usage:
            self.usage += usage['duration']
        print(caption)

class GummyTranslator:
    def __init__(self, rate, source, target):
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
