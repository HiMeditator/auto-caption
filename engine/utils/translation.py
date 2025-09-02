from ollama import chat
from ollama import ChatResponse
import asyncio
from googletrans import Translator
from .sysout import stdout, stdout_obj

lang_map = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese'
}

def ollama_translate(model: str, target: str, text: str, chunk_size = 3):
    stream = chat(
        model=model,
        messages=[
            {"role": "system", "content": f"/no_think Translate the following content into {lang_map[target]}, and do not output any additional information."},
            {"role": "user", "content": text}
        ],
        stream=True
    )
    chunk_content = ""
    in_thinking = False
    count = 0
    for chunk in stream:
        if count == 0 and chunk['message']['content'].startswith("<think>"):
            in_thinking = True
        if in_thinking:
            if "</think>" in chunk['message']['content']:
                in_thinking = False
            continue
        chunk_content += ' '.join(chunk['message']['content'].split('\n'))
        count += 1
        if count % chunk_size == 0:
            print(chunk_content, end='')
            chunk_content = ""
            count = 0
    if chunk_content:
        print(chunk_content)

def google_translate(text: str, target: str, time_s: str):
    translator = Translator()
    try:
        res = asyncio.run(translator.translate(text, dest=target))
        stdout_obj({
            "command": "translation",
            "time_s": time_s,
            "translation": res.text
        })
    except Exception as e:
        stdout(f"Google Translation Request failed: {str(e)}")
