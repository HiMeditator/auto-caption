from dashscope.audio.asr import (
    TranslationRecognizerCallback,
    TranscriptionResult,
    TranslationResult,
    TranslationRecognizerRealtime    
)
from datetime import datetime
import json
import sys

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
        pass

    def on_close(self) -> None:
        pass

    def on_event(
        self,
        request_id,
        transcription_result: TranscriptionResult,
        translation_result: TranslationResult,
        usage
    ) -> None:
        caption = {}
        if transcription_result is not None:
            caption['index'] = transcription_result.sentence_id
            caption['text'] = transcription_result.text
            if caption['index'] != self.cur_id:
                self.cur_id = caption['index']
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

        # print(caption)
        self.send_to_node(caption)

    def send_to_node(self, data):
        """
        将数据发送到 Node.js 进程
        """
        try:
            json_data = json.dumps(data) + '\n'
            sys.stdout.write(json_data)
            sys.stdout.flush()
        except Exception as e:
            print(f"Error sending data to Node.js: {e}", file=sys.stderr)

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
