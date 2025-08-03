# 字幕引擎说明文档

对应版本：v0.6.0

![](../../assets/media/structure_zh.png)

## 字幕引擎介绍

所谓的字幕引擎实际上是一个子程序，它会实时获取系统音频输入（麦克风）或输出（扬声器）的流式数据，并调用音频转文字的模型生成对应音频的字幕。生成的字幕转换为 JSON 格式的字符串数据，并通过标准输出传递给主程序（需要保证主程序读取到的字符串可以被正确解释为 JSON 对象）。主程序读取并解释字幕数据，处理后显示在窗口上。

**字幕引擎进程和 Electron 主进程之间的通信遵循的标准为：[caption engine api-doc](../api-docs/caption-engine.md)。**

## 运行流程

主进程和字幕引擎通信的流程：

### 启动引擎

- 主进程：使用 `child_process.spawn()` 启动字幕引擎进程
- 字幕引擎进程：创建 TCP Socket 服务器线程，创建后在标准输出中输出转化为字符串的 JSON 对象，该对象中包含 `command` 字段，值为 `connect`
- 主进程：监听字幕引擎进程的标准输出，尝试将标准输出按行分割，解析为 JSON 对象，并判断对象的 `command` 字段值是否为 `connect`，如果是则连接 TCP Socket 服务器

### 字幕识别

- 字幕引擎进程：在主线程监听系统音频输出，并将音频数据块发送给字幕引擎解析，字幕引擎解析音频数据块，通过标准输出发送解析的字幕数据对象字符串
- 主进程：继续监听字幕引擎的标准输出，并根据解析的对象的 `command` 字段采取不同的操作

### 关闭引擎

- 主进程：当用户在前端操作关闭字幕引擎时，主进程通过 Socket 通信给字幕引擎进程发送 `command` 字段为 `stop` 的对象字符串
- 字幕引擎进程：接收主引擎进程发送的字幕数据对象字符串，将字符串解析为对象，如果对象的 `command` 字段为 `stop`，则将全局变量 `thread_data.status` 的值设置为 `stop`
- 字幕引擎进程：主线程循环监听系统音频输出，当 `thread_data.status` 的值不为 `running` 时，则结束循环，释放资源，结束运行
- 主进程：如果检测到字幕引擎进程结束，进行相应处理，并向前端反馈


## 项目已经实现的功能

以下功能已经实现，可以直接复用。

### 标准输出

可以输出普通信息、命令和错误信息。

样例：

```python
from utils import stdout, stdout_cmd, stdout_obj, stderr
stdout("Hello") # {"command": "print", "content": "Hello"}\n
stdout_cmd("connect", "8080") # {"command": "connect", "content": "8080"}\n
stdout_obj({"command": "print", "content": "Hello"})
stderr("Error Info")
```

### 创建 Socket 服务

该 Socket 服务会监听指定端口，会解析 Electron 主程序发送的内容，并可能改变 `thread_data.status` 的值。

样例：

```python
from utils import start_server
from utils import thread_data
port = 8080
start_server(port)
while thread_data == 'running':
    # do something
    pass
```

### 音频获取

`AudioStream` 类用于获取音频数据，实现是跨平台的，支持 Windows、Linux 和 macOS。该类初始化包含两个参数：

- `audio_type`: 获取音频类型，0 表示系统输出音频（扬声器），1 表示系统输入音频（麦克风）
- `chunk_rate`: 音频数据获取频率，每秒音频获取的音频块的数量

该类包含三个方法：

- `open_stream()`: 开启音频获取
- `read_chunk() -> bytes`: 读取一个音频块
- `close_stream()`: 关闭音频获取

样例：

```python
from sysaudio import AudioStream
audio_type = 0
chunk_rate = 20
stream =  AudioStream(audio_type, chunk_rate)
stream.open_stream()
while True:
    data = stream.read_chunk()
    # do something with data
    pass
stream.close_stream()
```

### 音频处理

获取到的音频流在转文字之前可能需要进行预处理。一般需要将多通道音频转换为单通道音频，还可能需要进行重采样。本项目提供了三个音频处理函数：

- `merge_chunk_channels(chunk: bytes, channels: int) -> bytes`： 将多通道音频块转换为单通道音频块
- `resample_chunk_mono(chunk: bytes, channels: int, orig_sr: int, target_sr: int, mode="sinc_best") -> bytes`：将当前多通道音频数据块转换成单通道音频数据块，然后进行重采样
- `resample_mono_chunk(chunk: bytes, orig_sr: int, target_sr: int, mode="sinc_best") -> bytes`：将当前单通道音频块进行重采样

## 字幕引擎需要实现的功能

### 音频转文字

在得到了合适的音频流后，需要将音频流转换为文字了。一般使用各种模型（云端或本地）来实现音频流转文字。需要根据需求选择合适的模型。

这部分建议封装为一个类，需要实现三个方法：

- `start(self)`：启动模型
- `send_audio_frame(self, data: bytes)`：处理当前音频块数据，**生成的字幕数据通过标准输出发送给 Electron 主进程**
- `stop(self)`：停止模型

完整的字幕引擎实例如下：

- [gummy.py](../../engine/audio2text/gummy.py)
- [vosk.py](../../engine/audio2text/vosk.py)

### 字幕翻译

有的语音转文字模型并不提供翻译，如果有需求，需要再添加一个翻译模块。

### 字幕数据发送

在获取到当前音频流的文字后，需要将文字发送给主程序。字幕引擎进程通过标准输出将字幕数据传递给 Electron 主进程。

传递的内容必须是 JSON 字符串，其中 JSON 对象需要包含的参数如下：

```typescript
export interface CaptionItem {
  command: "caption",
  index: number, // 字幕序号
  time_s: string, // 当前字幕开始时间
  time_t: string, // 当前字幕结束时间
  text: string, // 字幕内容
  translation: string // 字幕翻译
}
```

**注意必须确保每输出一次字幕 JSON 数据就得刷新缓冲区，确保 electron 主进程每次接收到的字符串都可以被解释为 JSON 对象。**

建议使用项目已经实现的 `stdout_obj` 函数来发送。

### 命令行参数的指定

自定义字幕引擎的设置提供命令行参数指定，因此需要设置好字幕引擎的参数，本项目目前用到的参数如下：

```python
import argparse
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Convert system audio stream to text')
    # both
    parser.add_argument('-e', '--caption_engine', default='gummy', help='Caption engine: gummy or vosk')
    parser.add_argument('-a', '--audio_type', default=0, help='Audio stream source: 0 for output, 1 for input')
    parser.add_argument('-c', '--chunk_rate', default=10, help='Number of audio stream chunks collected per second')
    parser.add_argument('-p', '--port', default=8080, help='The port to run the server on, 0 for no server')
    # gummy only
    parser.add_argument('-s', '--source_language', default='en', help='Source language code')
    parser.add_argument('-t', '--target_language', default='zh', help='Target language code')
    parser.add_argument('-k', '--api_key', default='', help='API KEY for Gummy model')
    # vosk only
    parser.add_argument('-m', '--model_path', default='', help='The path to the vosk model.')
```

比如对于本项目的字幕引擎，我想使用 Gummy 模型，指定原文为日语，翻译为中文，获取系统音频输出的字幕，每次截取 0.1s 的音频数据，那么命令行参数如下：

```bash
python main.py -e gummy -s ja -t zh -a 0 -c 10 -k <dashscope-api-key>
```

## 其他

### 通信规范

[caption engine api-doc](../api-docs/caption-engine.md)

### 程序入口

[main.py](../../engine/main.py)

### 开发建议

除音频转文字外，其他建议直接复用本项目代码。如果这样，那么需要添加的内容为：

- `engine/audio2text/`：添加新的音频转文字类（文件级别）
- `engine/main.py`：添加新参数设置、流程函数（参考 `main_gummy` 函数和 `main_vosk` 函数）

### 打包

在完成字幕引擎的开发和测试后，需要将字幕引擎打包成可执行文件。一般使用 `pyinstaller` 进行打包。如果打包好的字幕引擎文件执行报错，可能是打包漏掉了某些依赖库，请检查是否缺少了依赖库。

### 运行

有了可以使用的字幕引擎，就可以在字幕软件窗口中通过指定字幕引擎的路径和字幕引擎的运行指令（参数）来启动字幕引擎了。

![](../img/02_zh.png)
