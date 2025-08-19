<div align="center" >
    <img src="./build/icon.png" width="100px" height="100px"/>
    <h1 align="center">auto-caption</h1>
    <p>Auto Caption 是一个跨平台的实时字幕显示软件。</p>
    <p>
      <a href="https://github.com/HiMeditator/auto-caption/releases"><img src="https://img.shields.io/badge/release-0.7.0-blue"></a>
      <a href="https://github.com/HiMeditator/auto-caption/issues"><img src="https://img.shields.io/github/issues/HiMeditator/auto-caption?color=orange"></a>
      <img src="https://img.shields.io/github/languages/top/HiMeditator/auto-caption?color=royalblue">
      <img src="https://img.shields.io/github/repo-size/HiMeditator/auto-caption?color=green">
      <img src="https://img.shields.io/github/stars/HiMeditator/auto-caption?style=social">
    </p>
    <p>
        | <b>简体中文</b>
        | <a href="./README_en.md">English</a>
        | <a href="./README_ja.md">日本語</a> |
    </p>
    <p><i>v0.7.0 版本已经发布，优化了软件界面，添加了日志记录显示。本地的字幕引擎正在尝试开发中，预计以 Python 代码的形式进行发布...</i></p>
</div>

![](./assets/media/main_zh.png)

## 📥 下载

[GitHub Releases](https://github.com/HiMeditator/auto-caption/releases)

## 📚 相关文档

[Auto Caption 用户手册](./docs/user-manual/zh.md)

[字幕引擎说明文档](./docs/engine-manual/zh.md)

[项目 API 文档](./docs/api-docs/)

[更新日志](./docs/CHANGELOG.md)

## ✨ 特性

- 生成音频输出或麦克风输入的字幕
- 跨平台（Windows、macOS、Linux）、多界面语言（中文、英语、日语）支持
- 丰富的字幕样式设置（字体、字体大小、字体粗细、字体颜色、背景颜色等）
- 灵活的字幕引擎选择（阿里云 Gummy 云端模型、本地 Vosk 模型、自己开发的模型）
- 多语言识别与翻译（见下文“⚙️ 自带字幕引擎说明”）
- 字幕记录展示与导出（支持导出 `.srt` 和 `.json` 格式）

## 📖 基本使用

软件已经适配了 Windows、macOS 和 Linux 平台。测试过的平台信息如下：

| 操作系统版本        | 处理器架构 | 获取系统音频输入 | 获取系统音频输出 |
| ------------------ | ---------- | ---------------- | ---------------- |
| Windows 11 24H2    | x64        | ✅               | ✅                |
| macOS Sequoia 15.5 | arm64      | ✅需要额外配置     | ✅                |
| Ubuntu 24.04.2     | x64        | ✅               | ✅                |
| Kali Linux 2022.3  | x64        | ✅               | ✅                |
| Kylin Server V10 SP3 | x64 | ✅ | ✅ |

macOS 平台和 Linux 平台获取系统音频输出需要进行额外设置，详见[Auto Caption 用户手册](./docs/user-manual/zh.md)。

> 国际版的阿里云服务并没有提供 Gummy 模型，因此目前非中国用户无法使用 Gummy 字幕引擎。

如果要使用默认的 Gummy 字幕引擎（使用云端模型进行语音识别和翻译），首先需要获取阿里云百炼平台的 API KEY，然后将 API KEY 添加到软件设置中或者配置到环境变量中（仅 Windows 平台支持读取环境变量中的 API KEY），这样才能正常使用该模型。相关教程：

- [获取 API KEY](https://help.aliyun.com/zh/model-studio/get-api-key)
- [将 API Key 配置到环境变量](https://help.aliyun.com/zh/model-studio/configure-api-key-through-environment-variables)

> Vosk 模型的识别效果较差，请谨慎使用。

如果要使用 Vosk 本地字幕引擎，首先需要在 [Vosk Models](https://alphacephei.com/vosk/models) 页面下载你需要的模型，并将模型解压到本地，并将模型文件夹的路径添加到软件的设置中。目前 Vosk 字幕引擎还不支持翻译字幕内容。

![](./assets/media/vosk_zh.png)

**如果你觉得上述字幕引擎不能满足你的需求，而且你会 Python，那么你可以考虑开发自己的字幕引擎。详细说明请参考[字幕引擎说明文档](./docs/engine-manual/zh.md)。**

## ⚙️ 自带字幕引擎说明

目前软件自带 2 个字幕引擎，正在规划新的引擎。它们的详细信息如下。

### Gummy 字幕引擎（云端）

基于通义实验室[Gummy语音翻译大模型](https://help.aliyun.com/zh/model-studio/gummy-speech-recognition-translation/)进行开发，基于[阿里云百炼](https://bailian.console.aliyun.com)的 API 进行调用该云端模型。

**模型详细参数：**

- 音频采样率支持：16kHz及以上
- 音频采样位数：16bit
- 音频通道数支持：单通道
- 可识别语言：中文、英文、日语、韩语、德语、法语、俄语、意大利语、西班牙语
- 支持的翻译：
  - 中文 → 英文、日语、韩语
  - 英文 → 中文、日语、韩语
  - 日语、韩语、德语、法语、俄语、意大利语、西班牙语 → 中文或英文

**网络流量消耗：**

字幕引擎使用原生采样率（假设为 48kHz）进行采样，样本位深为 16bit，上传音频为为单通道，因此上传速率约为：

$$
48000\ \text{samples/second} \times 2\ \text{bytes/sample} \times 1\ \text{channel}  = 93.75\ \text{KB/s}
$$

而且引擎只会获取到音频流的时候才会上传数据，因此实际上传速率可能更小。模型结果回传流量消耗较小，没有纳入考虑。

### Vosk 字幕引擎（本地）

基于 [vosk-api](https://github.com/alphacep/vosk-api) 开发。目前只支持生成音频对应的原文，不支持生成翻译内容。

### 新规划字幕引擎

以下为备选模型，将根据模型效果和集成难易程度选择。

- [faster-whisper](https://github.com/SYSTRAN/faster-whisper)
- [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx)
- [SenseVoice](https://github.com/FunAudioLLM/SenseVoice)
- [FunASR](https://github.com/modelscope/FunASR)

## 🚀 项目运行

![](./assets/media/structure_zh.png)

### 安装依赖

```bash
npm install
```

### 构建字幕引擎

首先进入 `engine` 文件夹，执行如下指令创建虚拟环境（需要使用大于等于 Python 3.10 的 Python 运行环境，建议使用 Python 3.12）：

```bash
# in ./engine folder
python -m venv .venv
# or
python3 -m venv .venv
```

然后激活虚拟环境：

```bash
# Windows
.venv/Scripts/activate
# Linux or macOS
source .venv/bin/activate
```

然后安装依赖（这一步在 macOS 和 Linux 可能会报错，一般是因为构建失败，需要根据报错信息进行处理）：

```bash
pip install -r requirements.txt
```

如果在 Linux 系统上安装 `samplerate` 模块报错，可以尝试使用以下命令单独安装：

```bash
pip install samplerate --only-binary=:all:
```

然后使用 `pyinstaller` 构建项目：

```bash
pyinstaller ./main.spec
```

注意 `main.spec` 文件中 `vosk` 库的路径可能不正确，需要根据实际状况配置（与 Python 环境的版本相关）。

```
# Windows
vosk_path = str(Path('./.venv/Lib/site-packages/vosk').resolve())
# Linux or macOS
vosk_path = str(Path('./.venv/lib/python3.x/site-packages/vosk').resolve())
```

此时项目构建完成，进入 `engine/dist` 文件夹可见对应的可执行文件。即可进行后续操作。

### 运行项目

```bash
npm run dev
```

### 构建项目

```bash
# For windows
npm run build:win
# For macOS
npm run build:mac
# For Linux
npm run build:linux
```

注意，根据不同的平台需要修改项目根目录下 `electron-builder.yml` 文件中的配置内容：

```yml
extraResources:
  # For Windows
  - from: ./engine/dist/main.exe
    to: ./engine/main.exe
  # For macOS and Linux
  # - from: ./engine/dist/main
  #   to: ./engine/main
```
