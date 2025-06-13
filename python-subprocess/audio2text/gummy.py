from dashscope.audio.asr import \
    TranslationRecognizerCallback, \
    TranscriptionResult, \
    TranslationResult, \
    TranslationRecognizerRealtime

class Callback(TranslationRecognizerCallback):
    """
    语音大模型流式传输回调对象
    """
    def __init__(self):
        super().__init__()
        self.usage = 0
        self.sentences = []
        self.translations = []
    
    def on_open(self) -> None:
        print("\nGummy 流式翻译开始...\n")

    def on_close(self) -> None:
        print(f"\nTokens消耗：{self.usage}")
        print(f"流式翻译结束...\n")
        for i in range(len(self.sentences)):
            print(f"\n{self.sentences[i]}\n{self.translations[i]}\n")

    def on_event(
        self,
        request_id,
        transcription_result: TranscriptionResult,
        translation_result: TranslationResult,
        usage
    ) -> None:
        if transcription_result is not None:
            id = transcription_result.sentence_id
            text = transcription_result.text
            if transcription_result.stash is not None:
                stash = transcription_result.stash.text
            else:
                stash = ""
            print(f"#{id}: {text}{stash}")
            if usage: self.sentences.append(text)
        
        if translation_result is not None:
            lang = translation_result.get_language_list()[0]
            text = translation_result.get_translation(lang).text
            if translation_result.get_translation(lang).stash is not None:
                stash = translation_result.get_translation(lang).stash.text
            else:
                stash = ""
            print(f"#{lang}: {text}{stash}")
            if usage: self.translations.append(text)
        
        if usage: self.usage += usage['duration']


def getGummpyTranslator(rate) -> TranslationRecognizerRealtime:
    translator = TranslationRecognizerRealtime(
        model = "gummy-realtime-v1",
        format = "pcm",
        sample_rate = rate,
        transcription_enabled = True,
        translation_enabled = True,
        source_language = "ja",
        translation_target_languages = ["zh"],
        callback = Callback()
    )
    return translator
