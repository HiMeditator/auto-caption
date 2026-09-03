from ollama import chat
from ollama import ChatResponse
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None
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
    'zh': 'Chinese',
    'zh-cn': 'Chinese'
}

def _translation_messages(target: str, text: str):
    return [
        {"role": "system", "content": f"/no_think Translate the following content into {lang_map[target]}, and do not output any additional information."},
        {"role": "user", "content": text}
    ]


def _output_translation(content: str, text: str, time_s: str):
    if content.startswith('<think>'):
        index = content.find('</think>')
        if index != -1:
            content = content[index+8:]
    stdout_obj({
        "command": "translation",
        "time_s": time_s,
        "text": text,
        "translation": content.strip()
    })


def ollama_translate(model: str, target: str, text: str, time_s: str, base_url: str = '', api_key: str = ''):
    content = ""
    try:
        response: ChatResponse = chat(model=model, messages=_translation_messages(target, text))
        content = response.message.content or ""
    except Exception as e:
        stdout_cmd("warn", f"Ollama translation failed: {str(e)}")
        return

    _output_translation(content, text, time_s)


def openai_translate(model: str, target: str, text: str, time_s: str, base_url: str = '', api_key: str = ''):
    if OpenAI is None:
        stdout_cmd("warn", "OpenAI translation failed: the openai package is not installed")
        return
    try:
        client = OpenAI(base_url=base_url, api_key=api_key or "not-required")
        response = client.chat.completions.create(
            model=model,
            messages=_translation_messages(target, text)
        )
        content = response.choices[0].message.content or ""
    except Exception as e:
        stdout_cmd("warn", f"OpenAI-compatible translation failed: {str(e)}")
        return

    _output_translation(content, text, time_s)

def google_translate(model: str, target: str, text: str, time_s: str, base_url: str = '', api_key: str = ''):
    translator = Translator()
    try:
        res = asyncio.run(translator.translate(text, dest=target))
        stdout_obj({
            "command": "translation",
            "time_s": time_s,
            "text": text,
            "translation": res.text
        })
    except Exception:
        stdout_cmd("warn", f"Google translation request failed, please check your network connection...")


def get_translation_function(provider: str):
    return {
        'ollama': ollama_translate,
        'openai': openai_translate,
        'google': google_translate
    }[provider]
