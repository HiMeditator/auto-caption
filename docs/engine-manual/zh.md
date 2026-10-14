# 字幕引擎说明文档

对应版本：v1.2.0

![](../../assets/media/structure_zh.png)

## 字幕引擎介绍

所谓的字幕引擎实际上是一个子程序，它会实时获取系统音频输入（麦克风）或输出（扬声器）的流式数据，并调用音频转文字的模型生成对应音频的字幕。生成的字幕转换为 JSON 格式的字符串数据，并通过标准输出传递给主程序（需要保证主程序读取到的字符串可以被正确解释为 JSON 对象）。主程序读取并解释字幕数据，处理后显示在窗口上。

**字幕引擎进程和 Electron 主进程之间的通信遵循的标准为：[caption engine api-doc](../api-docs/caption-engine.md)。**

## 运行流程

主进程和字幕引擎通信的流程：

### 启动引擎

- Electron 主进程：使用 `child_process.spawn()` 启动字幕引擎进程
- 字幕引擎进程：创建 TCP Socket 服务器线程，创建后在标准输出中输出转化为字符串的 JSON 对象，该对象中包含 `command` 字段，值为 `connect`
- 主进程：监听字幕引擎进程的标准输出，尝试将标准输出按行分割，解析为 JSON 对象，并判断对象的 `command` 字段值是否为 `connect`，如果是则连接 TCP Socket 服务器

### 字幕识别

- 字幕引擎进程：新建线程监听系统音频输出，将获取的音频数据块放入共享队列中（`shared_data.chunk_queue`）。字幕引擎不断读取共享队列中的音频数据块并解析。字幕引擎还可能新建线程执行翻译操作。最后字幕引擎通过标准输出发送解析的字幕数据对象字符串
- Electron 主进程：持续监听字幕引擎的标准输出，并根据解析的对象的 `command` 字段采取不同的操作

### 关闭引擎

- Electron 主进程：当用户在前端操作关闭字幕引擎时，主进程通过 Socket 通信给字幕引擎进程发送 `command` 字段为 `stop` 的对象字符串
- 字幕引擎进程：接收主引擎进程发送的字幕数据对象字符串，将字符串解析为对象，如果对象的 `command` 字段为 `stop`，则将全局变量 `shared_data.status` 的值设置为 `stop`
- 字幕引擎进程：主线程循环监听系统音频输出，当 `shared_data.status` 的值不为 `running` 时，则结束循环，释放资源，结束运行
- Electron 主进程：如果检测到字幕引擎进程结束，进行相应处理，并向前端反馈

## 项目已经实现的功能

以下功能已经实现，可以直接复用。

### 标准输出

可以输出普通信息、命令和错误信息。

样例：

```python
from utils import stdout, stdout_cmd, stdout_obj, stderr
# {"command": "print", "content": "Hello"}\n
stdout("Hello")
# {"command": "connect", "content": ""}\n
stdout_cmd("connect")
# {"command": "print", "content": "print"}\n
stdout_obj({"command": "print", "content": "print"})
# sys.stderr.write("Error Info" + "\n")
stderr("Error Info")
```

### 创建 Socket 服务

该 Socket 服务会监听指定端口，会解析 Electron 主程序发送的内容，并可能改变 `shared_data.status` 的值。

样例：

```python
import threading
import time
from utils import start_server, shared_data

port = 8080
threading.Thread(target=start_server, args=(port,), daemon=True).start()
while shared_data.status == 'running':
    time.sleep(0.1)
```

### 音频获取

`AudioStream` 类用于获取音频数据，实现是跨平台的，支持 Windows、Linux 和 macOS。该类初始化包含两个参数：

- `audio_type`: 获取音频类型，0 表示系统输出音频（扬声器），1 表示系统输入音频（麦克风）
- `chunk_rate`: 音频数据获取频率，每秒音频获取的音频块的数量，默认为 10

该类包含四个方法：

- `open_stream()`: 开启音频获取
- `read_chunk() -> bytes`: 读取一个音频块
- `close_stream()`: 关闭音频获取
- `close_stream_signal()` 线程安全的关闭系统音频输入流

样例：

```python
from sysaudio import AudioStream
from utils import shared_data

stream = AudioStream(0, 20)
stream.open_stream()
try:
    while shared_data.status == 'running':
        data = stream.read_chunk()
        if data is None:
            continue
        # Process the audio chunk here.
finally:
    stream.close_stream()
```

### 音频处理

获取到的音频流在转文字之前可能需要进行预处理。一般需要将多通道音频转换为单通道音频，还可能需要进行重采样。本项目提供了两个音频处理函数：

- `merge_chunk_channels(chunk: bytes, channels: int) -> bytes`： 将多通道音频块转换为单通道音频块
- `resample_chunk_mono(chunk: bytes, channels: int, orig_sr: int, target_sr: int) -> bytes`：将当前多通道音频数据块转换成单通道音频数据块，然后进行重采样

样例：

```python
from sysaudio import AudioStream
from utils import resample_chunk_mono, shared_data

stream = AudioStream(1)
stream.open_stream()
try:
    while shared_data.status == 'running':
        raw_chunk = stream.read_chunk()
        if raw_chunk is None:
            continue
        chunk = resample_chunk_mono(raw_chunk, stream.CHANNELS, stream.RATE, 16000)
        # Send the mono PCM chunk to the recognizer here.
finally:
    stream.close_stream()
```

## 字幕引擎需要实现的功能

### 音频转文字

在得到了合适的音频流后，需要将音频流转换为文字了。一般使用各种模型（云端或本地）来实现音频流转文字。需要根据需求选择合适的模型。

这部分建议封装为一个类，需要实现四个方法：

- `start(self)`：启动模型
- `send_audio_frame(self, data: bytes)`：处理当前音频块数据，**生成的字幕数据通过标准输出发送给 Electron 主进程**
- `translate(self)`：持续从 `shared_data.chunk_queue` 中取出数据块，并调用 `send_audio_frame` 方法处理数据块
- `stop(self)`：停止模型

完整的字幕引擎实例如下：

- [paraformer.py](../../engine/audio2text/paraformer.py)
- [livetranslate.py](../../engine/audio2text/livetranslate.py)
- [glm.py](../../engine/audio2text/glm.py)
- [vosk.py](../../engine/audio2text/vosk.py)
- [sosv.py](../../engine/audio2text/sosv.py)

### 字幕翻译

有的语音转文字模型并不提供翻译，如果有需求，需要再添加一个翻译模块，也可以使用自带的翻译模块。

样例：

```python
from utils import google_translate, ollama_translate, openai_translate
text = "这是一个翻译测试。"
google_translate("", "en", text, "time_s")
ollama_translate("qwen3:0.6b", "en", text, "time_s")
openai_translate("gpt-4.1-mini", "en", text, "time_s", "https://api.openai.com/v1", "<api-key>")
```

### 字幕数据发送

在获取到当前音频流的文字后，需要将文字发送给主程序。字幕引擎进程通过标准输出将字幕数据传递给 Electron 主进程。

传递的内容必须是 JSON 字符串，其中 JSON 对象需要包含的参数如下：

```typescript
export interface CaptionItem {
  command: "caption",
  index: number,        // 字幕序号
  time_s: string,       // 当前字幕开始时间
  time_t: string,       // 当前字幕结束时间
  text: string,         // 字幕内容
  translation: string   // 字幕翻译
}
```

**注意必须确保每输出一次字幕 JSON 数据就得刷新缓冲区，确保 electron 主进程每次接收到的字符串都可以被解释为 JSON 对象。** 建议使用项目已经实现的 `stdout_obj` 函数来发送。

### 命令行参数的指定

自定义字幕引擎的设置提供命令行参数指定，因此需要设置好字幕引擎的参数，本项目目前用到的参数如下：

```python
import argparse

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Convert system audio stream to text')
    # all
    parser.add_argument('-e', '--caption_engine', default='paraformer', choices=['paraformer', 'livetranslate', 'glm', 'vosk', 'sosv'], help='Caption engine: paraformer, livetranslate, glm, vosk or sosv')
    parser.add_argument('-a', '--audio_type', type=int, default=0, help='Audio stream source: 0 for output, 1 for input')
    parser.add_argument('-c', '--chunk_rate', type=int, default=10, help='Number of audio stream chunks collected per second')
    parser.add_argument('-p', '--port', type=int, default=0, help='The port to run the server on, 0 for no server')
    parser.add_argument('-d', '--display_caption', type=int, default=0, help='Display caption on terminal, 0 for no display, 1 for display')
    parser.add_argument('-t', '--target_language', default='none', help='Target language code, "none" for no translation')
    parser.add_argument('-r', '--record', type=int, default=0, help='Whether to record the audio, 0 for no recording, 1 for recording')
    parser.add_argument('-rp', '--record_path', default='', help='Path to save the recorded audio')
    # paraformer and sosv and glm
    parser.add_argument('-s', '--source_language', default='auto', help='Source language code')
    # Alibaba Cloud engines
    parser.add_argument('--dashscope_api_key', default='', help='API key for Alibaba Cloud caption engines')
    parser.add_argument('--dashscope_workspace_id', default='', help='LiveTranslate workspace ID (or DASHSCOPE_WORKSPACE_ID)')
    parser.add_argument('--dashscope_region', choices=['cn-beijing', 'ap-southeast-1'], default='cn-beijing', help='LiveTranslate API region')
    # External translation: Paraformer, GLM, Vosk and SOSV
    parser.add_argument('--translation_provider', choices=['ollama', 'openai', 'google'], default='ollama', help='Translation service provider')
    parser.add_argument('--translation_model', default='', help='Translation model name (for Ollama or OpenAI-compatible services)')
    parser.add_argument('--translation_base_url', default='', help='OpenAI-compatible API base URL')
    parser.add_argument('--translation_api_key', default='', help='OpenAI-compatible API key')
    # vosk only
    parser.add_argument('-vosk', '--vosk_model', default='', help='The path to the vosk model.')
    # sosv only
    parser.add_argument('-sosv', '--sosv_model', default=None, help='The SenseVoice model path')
    # glm only
    parser.add_argument('-gurl', '--glm_url', default='https://open.bigmodel.cn/api/paas/v4/audio/transcriptions', help='GLM API URL')
    parser.add_argument('-gmodel', '--glm_model', default='glm-asr-2512', help='GLM Model Name')
    parser.add_argument('-gkey', '--glm_api_key', default='', help='GLM API Key')

    args = parser.parse_args()
```

比如对于本项目的字幕引擎，我想使用 Paraformer 模型，指定原文为日语，翻译为中文，获取系统音频输出的字幕，每次截取 0.1s 的音频数据，那么命令行参数如下：

```bash
uv run python main.py -e paraformer -s ja -t zh -a 0 -c 10 --dashscope_api_key <dashscope-api-key> --translation_provider ollama --translation_model qwen2.5:0.5b
```

## 其他

### 通信规范

[caption engine api-doc](../api-docs/caption-engine.md)

### 程序入口

[main.py](../../engine/main.py)

### 开发建议

除音频转文字和翻译外，其他（音频获取、音频重采样、与主进程通信）建议直接复用本项目代码。如果这样，那么需要添加的内容为：

- `engine/audio2text/`：添加新的音频转文字类（文件级别）
- `engine/main.py`：添加新参数设置、流程函数（参考 `main_paraformer` 函数和 `main_vosk` 函数）

### 打包

引擎使用 uv 管理依赖：`engine/pyproject.toml` 声明运行依赖与 PyInstaller 开发依赖，`engine/uv.lock` 在本地自动生成并由 Git 忽略，默认 Python 为 3.12。在仓库根目录执行：

```bash
npm run engine:sync
npm run engine:test
npm run build:engine
```

也可在 `engine` 目录执行 `uv run pyinstaller --noconfirm --clean main.spec`。Vosk 路径由当前环境自动发现。PyInstaller 生成单文件 `engine/dist/main.exe`（Windows）或 `engine/dist/main`（macOS/Linux），安装包分别复制至资源目录的 `engine/main.exe` 或 `engine/main`，与主进程启动路径一致。安装包构建命令会自动先构建引擎；必须在目标操作系统上构建。平台音频依赖见三语 README，发布版无需安装 uv 或 Python。

### 运行

有了可以使用的字幕引擎，就可以在字幕软件窗口中通过指定字幕引擎的路径和字幕引擎的运行指令（参数）来启动字幕引擎了。

![](../img/02_zh.png)

默认引擎为阿里云 `paraformer-realtime-v2`，通过 DashScope Recognition SDK 双向流式识别。上传音频为 16kHz、16bit、单声道 PCM；支持中文、英文、日语、韩语、德语、法语、俄语及粤语，`auto` 不指定语言提示。模型不提供内置翻译；开启翻译后需配置 Ollama、OpenAI 兼容服务或 Google 翻译，完整句子返回后异步翻译。设置中的阿里云 API Key 或 `DASHSCOPE_API_KEY` 环境变量用于鉴权（所有平台）；CLI 参数为 `--dashscope_api_key`。当前使用北京地域默认端点，API Key 必须匹配该地域。旧 Gummy 引擎选项和 API Key 自动迁移，旧西班牙语/意大利语源语言改为自动检测；旧自定义命令需手动更新。详见[阿里云官方 SDK 文档](https://help.aliyun.com/zh/model-studio/paraformer-real-time-speech-recognition-python-sdk)。

## Qwen LiveTranslate

Qwen LiveTranslate 使用 `qwen3.8-livetranslate-flash-realtime`，在同一个 WebSocket 会话中流式返回原文和译文，无需配置外部翻译服务。默认仍为 Paraformer。选择此引擎后填写业务空间 ID、地域（北京或新加坡），并在更多设置中填写该业务空间和地域的阿里云 API Key；也可使用 `DASHSCOPE_WORKSPACE_ID` 和 `DASHSCOPE_API_KEY` 环境变量。源语言自动检测，界面提供中、英、日、韩、德、法、俄、西、意作为翻译目标语言。音频上传为 16kHz、16bit、单声道 PCM，仅输出文字，不播放翻译语音。关闭翻译仅隐藏译文，服务端仍执行翻译；只需要识别时建议选择 Paraformer。

[API / WebSocket](https://help.aliyun.com/zh/model-studio/qwen3-5-livetranslate-flash-realtime)

```bash
uv run python main.py -e livetranslate -t zh --dashscope_api_key <api-key> --dashscope_workspace_id <workspace-id> --dashscope_region cn-beijing
```
