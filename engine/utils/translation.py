from ollama import chat
from ollama import ChatResponse
import asyncio
from googletrans import Translator
from .sysout import stdout_cmd, stdout_obj

lang_map = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh-cn': 'Chinese'
}

def ollama_translate(model: str, target: str, text: str, time_s: str):
    response: ChatResponse = chat(
        model=model,
        messages=[
            {"role": "system", "content": f"/no_think Translate the following content into {lang_map[target]}, and do not output any additional information."},
            {"role": "user", "content": text}
        ]
    )
    content = response.message.content or ""
    if content.startswith('<think>'):
        index = content.find('</think>')
        if index != -1:
            content = content[index+8:]
    stdout_obj({
        "command": "translation",
        "time_s": time_s,
        "translation": content.strip()
    })

def google_translate(model: str, target: str, text: str, time_s: str):
    translator = Translator()
    try:
        res = asyncio.run(translator.translate(text, dest=target))
        stdout_obj({
            "command": "translation",
            "time_s": time_s,
            "translation": res.text
        })
    except Exception as e:
        stdout_cmd("warn", f"Google translation request failed, please check your network connection...")
