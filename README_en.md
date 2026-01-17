<div align="center" >
    <img src="./build/icon.png" width="100px" height="100px"/>
    <h1 align="center">auto-caption</h1>
    <p>Auto Caption is a cross-platform real-time caption display software.</p>
    <p>
      <a href="https://github.com/HiMeditator/auto-caption/releases"><img src="https://img.shields.io/badge/release-1.1.0-blue"></a>
      <a href="https://github.com/HiMeditator/auto-caption/issues"><img src="https://img.shields.io/github/issues/HiMeditator/auto-caption?color=orange"></a>
      <img src="https://img.shields.io/github/languages/top/HiMeditator/auto-caption?color=royalblue">
      <img src="https://img.shields.io/github/repo-size/HiMeditator/auto-caption?color=green">
      <img src="https://img.shields.io/github/stars/HiMeditator/auto-caption?style=social">
    </p>
    <p>
        | <a href="./README.md">简体中文</a>
        | <b>English</b>
        | <a href="./README_ja.md">日本語</a> |
    </p>
    <p><i>v1.1.0 has been released, adding the GLM-ASR cloud caption model and OpenAI compatible model translation...</i></p>
</div>

![](./assets/media/main_en.png)

## 📥 Download

Software Download: [GitHub Releases](https://github.com/HiMeditator/auto-caption/releases)

Vosk Model Download: [Vosk Models](https://alphacephei.com/vosk/models)

SOSV Model Download: [Shepra-ONNX SenseVoice Model](https://github.com/HiMeditator/auto-caption/releases/tag/sosv-model)

## 📚 Documentation

[Auto Caption User Manual](./docs/user-manual/en.md)

[Caption Engine Documentation](./docs/engine-manual/en.md)

[Changelog](./docs/CHANGELOG.md)

## 👁️‍🗨️ Preview

https://github.com/user-attachments/assets/9c188d78-9520-4397-bacf-4c8fdcc54874

## ✨ Features

- Generate captions from audio output or microphone input
- Supports calling local Ollama models, cloud-based OpenAI compatible models, or cloud-based Google Translate API for translation
- Cross-platform (Windows, macOS, Linux) and multi-language interface (Chinese, English, Japanese) support
- Rich caption style settings (font, font size, font weight, font color, background color, etc.)
- Flexible caption engine selection (Aliyun Gummy cloud model,GLM-ASR cloud model, local Vosk model, local SOSV model, or you can develop your own model)
- Multi-language recognition and translation (see below "⚙️ Built-in Subtitle Engines")
- Subtitle record display and export (supports exporting `.srt` and `.json` formats)

## 📖 Basic Usage

> ⚠️ Note: Currently, only the latest version of the software on Windows platform is maintained, while the last versions for other platforms remain at v1.0.0.

The software has been adapted for Windows, macOS, and Linux platforms. The tested platform information is as follows:

| OS Version         | Architecture | System Audio Input | System Audio Output |
| ------------------ | ------------ | ------------------ | ------------------- |
| Windows 11 24H2    | x64          | ✅                 | ✅                   |
| macOS Sequoia 15.5 | arm64        | ✅ [Additional config required](./docs/user-manual/en.md#capturing-system-audio-output-on-macos) | ✅        |
| Ubuntu 24.04.2     | x64          | ✅                 | ✅                   |

Additional configuration is required to capture system audio output on macOS and Linux platforms. See [Auto Caption User Manual](./docs/user-manual/en.md) for details.


After downloading the software, you need to select the corresponding model according to your needs and then configure the model.

|                                                              | Accuracy | Real-time | Deployment Type | Supported Languages | Translation | Notes |
| ------------------------------------------------------------ | -------- | --------- | --------------- | ------------------- | ----------- | ----- |
| [Gummy](https://help.aliyun.com/zh/model-studio/gummy-speech-recognition-translation) | Very good 😊 | Very good 😊 | Cloud / Alibaba Cloud | 10 languages | Built-in translation | Paid, 0.54 CNY/hour |
| [glm-asr-2512](https://docs.bigmodel.cn/cn/guide/models/sound-and-video/glm-asr-2512) | Very good 😊 | Poor 😞 | Cloud / Zhipu AI | 4 languages | Requires additional configuration | Paid, approximately 0.72 CNY/hour |
| [Vosk](https://alphacephei.com/vosk) | Poor 😞 | Very good 😊 | Local / CPU | Over 30 languages | Requires additional configuration | Supports many languages |
| [SOSV](https://k2-fsa.github.io/sherpa/onnx/sense-voice/index.html) | Average 😐 | Average 😐 | Local / CPU | 5 languages | Requires additional configuration | Only one model |
| Self-developed | 🤔 | 🤔 | Custom | Custom | Custom | Develop your own using Python according to the [documentation](./docs/engine-manual/en.md) |

If you choose a model other than Gummy, you also need to configure your own translation model.

### Configuring Translation Models

![](./assets/media/engine_en.png)

> Note: Translation is not real-time. The translation model is only called after each sentence recognition is completed.

#### Ollama Local Model

> Note: Using models with too many parameters will lead to high resource consumption and translation delays. It is recommended to use models with less than 1B parameters, such as: `qwen2.5:0.5b`, `qwen3:0.6b`.

Before using this model, you need to confirm that the [Ollama](https://ollama.com/) software is installed on your local machine and that you have downloaded the required large language model. Simply add the name of the large model you want to call to the `Model Name` field in the settings, and ensure that the `Base URL` field is empty.

#### OpenAI Compatible Model

If you feel the translation effect of the local Ollama model is not good enough, or don't want to install the Ollama model locally, then you can use cloud-based OpenAI compatible models.

Here are some model provider `Base URL`s:
- OpenAI: https://api.openai.com/v1
- DeepSeek: https://api.deepseek.com
- Alibaba Cloud: https://dashscope.aliyuncs.com/compatible-mode/v1

The API Key needs to be obtained from the corresponding model provider.

#### Google Translate API

> Note: Google Translate API is not available in some regions.

No configuration required, just connect to the internet to use.

### Using Gummy Model

> The international version of Alibaba Cloud services does not seem to provide the Gummy model, so non-Chinese users may not be able to use the Gummy caption engine at present.

To use the default Gummy caption engine (using cloud models for speech recognition and translation), you first need to obtain an API KEY from Alibaba Cloud Bailian platform, then add the API KEY to the software settings or configure it in the environment variables (only Windows platform supports reading API KEY from environment variables), so that the model can be used normally. Related tutorials:

- [Get API KEY](https://help.aliyun.com/zh/model-studio/get-api-key)
- [Configure API Key through Environment Variables](https://help.aliyun.com/zh/model-studio/configure-api-key-through-environment-variables)

### Using the GLM-ASR Model

Before using it, you need to obtain an API KEY from the Zhipu AI platform and add it to the software settings.

For API KEY acquisition, see: [Quick Start](https://docs.bigmodel.cn/en/guide/start/quick-start).

### Using Vosk Model

> The recognition effect of the Vosk model is poor, please use it with caution.

To use the Vosk local caption engine, first download the model you need from the [Vosk Models](https://alphacephei.com/vosk/models) page, unzip the model locally, and add the path of the model folder to the software settings.

![](./assets/media/config_en.png)

### Using SOSV Model

The way to use the SOSV model is the same as Vosk. The download address is as follows: https://github.com/HiMeditator/auto-caption/releases/tag/sosv-model

## ⌨️ Using in Terminal

The software adopts a modular design and can be divided into two parts: the main software body and caption engine. The main software calls caption engine through a graphical interface. Audio acquisition and speech recognition functions are implemented in the caption engine, which can be used independently without the main software.

Caption engine is developed using Python and packaged as executable files via PyInstaller. Therefore, there are two ways to use caption engine:

1. Use the source code of the project's caption engine part and run it with a Python environment that has the required libraries installed
2. Run the packaged executable file of the caption engine through the terminal

For runtime parameters and detailed usage instructions, please refer to the [User Manual](./docs/user-manual/en.md#using-caption-engine-standalone).

```bash
python main.py \
-e gummy \
-k sk-******************************** \
-a 0 \
-d 1 \
-s en \
-t zh
```

![](./docs/img/07.png)

## ⚙️ Built-in Subtitle Engines

Currently, the software comes with 4 caption engines, with new engines under development. Their detailed information is as follows.

### Gummy Subtitle Engine (Cloud)

Developed based on Tongyi Lab's [Gummy Speech Translation Model](https://help.aliyun.com/zh/model-studio/gummy-speech-recognition-translation/), using [Alibaba Cloud Bailian](https://bailian.console.aliyun.com) API to call this cloud model.

**Model Parameters:**

- Supported audio sample rate: 16kHz and above
- Audio sample depth: 16bit
- Supported audio channels: Mono
- Recognizable languages: Chinese, English, Japanese, Korean, German, French, Russian, Italian, Spanish
- Supported translations:
  - Chinese → English, Japanese, Korean
  - English → Chinese, Japanese, Korean
  - Japanese, Korean, German, French, Russian, Italian, Spanish → Chinese or English

**Network Traffic Consumption:**

The caption engine uses native sample rate (assumed to be 48kHz) for sampling, with 16bit sample depth and mono channel, so the upload rate is approximately:

$$
48000\ \text{samples/second} \times 2\ \text{bytes/sample} \times 1\ \text{channel}  = 93.75\ \text{KB/s}
$$

The engine only uploads data when receiving audio streams, so the actual upload rate may be lower. The return traffic consumption of model results is small and not considered here.

### GLM-ASR Caption Engine (Cloud)

https://docs.bigmodel.cn/en/guide/models/sound-and-video/glm-asr-2512

### Vosk Subtitle Engine (Local)

Developed based on [vosk-api](https://github.com/alphacep/vosk-api). The advantage of this caption engine is that there are many optional language models (over 30 languages), but the disadvantage is that the recognition effect is relatively poor, and the generated content has no punctuation.

### SOSV Subtitle Engine (Local)

[SOSV](https://github.com/HiMeditator/auto-caption/releases/tag/sosv-model) is an integrated package, mainly based on [Shepra-ONNX SenseVoice](https://k2-fsa.github.io/sherpa/onnx/sense-voice/index.html), with added endpoint detection model and punctuation restoration model. The languages supported by this model for recognition are: English, Chinese, Japanese, Korean, and Cantonese.

## 🚀 Project Setup

![](./assets/media/structure_en.png)

### Install Dependencies

```bash
npm install
```

### Build Subtitle Engine

First enter the `engine` folder and execute the following commands to create a virtual environment (requires Python 3.10 or higher, with Python 3.12 recommended):

```bash
cd ./engine
# in ./engine folder
python -m venv .venv
# or
python3 -m venv .venv
```

Then activate the virtual environment:

```bash
# Windows
.venv/Scripts/activate
# Linux or macOS
source .venv/bin/activate
```

Then install dependencies (this step might result in errors on macOS and Linux, usually due to build failures, and you need to handle them based on the error messages):

```bash
pip install -r requirements.txt
```

Then use `pyinstaller` to build the project:

```bash
pyinstaller ./main.spec
```

Note that the path to the `vosk` library in `main-vosk.spec` might be incorrect and needs to be configured according to the actual situation (related to the version of the Python environment).

```
# Windows
vosk_path = str(Path('./.venv/Lib/site-packages/vosk').resolve())
# Linux or macOS
vosk_path = str(Path('./.venv/lib/python3.x/site-packages/vosk').resolve())
```

After the build completes, you can find the executable file in the `engine/dist` folder. Then proceed with subsequent operations.

### Run Project

```bash
npm run dev
```

### Build Project

```bash
# For windows
npm run build:win
# For macOS
npm run build:mac
# For Linux
npm run build:linux
```
