<div align="center" >
    <img src="./build/icon.png" width="100px" height="100px"/>
    <h1 align="center">auto-caption</h1>
    <p>Auto Caption is a cross-platform real-time caption display software.</p>
    <p>
      <a href="https://github.com/HiMeditator/auto-caption/releases"><img src="https://img.shields.io/badge/version-1.2.0-blue"></a>
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
    <p><i>Current software version: v1.2.0. See the <a href="./docs/CHANGELOG.md">changelog</a> for updates.</i></p>
</div>

![](./assets/media/main_en.png)

## 📥 Download

Software Download: [GitHub Releases](https://github.com/HiMeditator/auto-caption/releases)

Vosk Model Download: [Vosk Models](https://alphacephei.com/vosk/models)

SOSV Model Download: [Shepra-ONNX SenseVoice Model](https://github.com/HiMeditator/auto-caption/releases/tag/sosv-model)

## 📚 Documentation

[Standalone Engine Usage and Build Guide (Chinese)](./engine/README.md)

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
- Flexible caption engine selection (Aliyun Paraformer cloud model,GLM-ASR cloud model, local Vosk model, local SOSV model, or you can develop your own model)
- Multi-language recognition and translation (see below "⚙️ Built-in Subtitle Engines")
- Subtitle record display and export (supports exporting `.srt` and `.json` formats)

## 📖 Basic Usage

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
| [Paraformer Realtime v2](https://help.aliyun.com/zh/model-studio/paraformer-real-time-speech-recognition-python-sdk) | Streaming ASR | External translation | Cloud / Alibaba Cloud | 8 languages including Cantonese | Ollama / OpenAI-compatible / Google | Current Alibaba Cloud pricing |
| [Qwen LiveTranslate 3.8](https://help.aliyun.com/zh/model-studio/qwen3-5-livetranslate-flash-realtime) | Streaming ASR | Streaming translation | Cloud / Alibaba Cloud | Auto detection | Built-in translation | API Key + workspace ID; official pricing |
| [glm-asr-2512](https://docs.bigmodel.cn/cn/guide/models/sound-and-video/glm-asr-2512) | Very good 😊 | Poor 😞 | Cloud / Zhipu AI | 4 languages | Requires additional configuration | Paid, approximately 0.72 CNY/hour |
| [Vosk](https://alphacephei.com/vosk) | Poor 😞 | Very good 😊 | Local / CPU | Over 30 languages | Requires additional configuration | Supports many languages |
| [SOSV](https://k2-fsa.github.io/sherpa/onnx/sense-voice/index.html) | Average 😐 | Average 😐 | Local / CPU | 5 languages | Requires additional configuration | Only one model |
| Self-developed | 🤔 | 🤔 | Custom | Custom | Custom | Develop your own using Python according to the [documentation](./docs/engine-manual/en.md) |

Qwen LiveTranslate includes translation; other caption engines require an external translation service when translation is enabled.

### Configuring Translation Models

![](./assets/media/engine_en.png)

> Note: Translation is not real-time. The translation model is only called after each sentence recognition is completed.

#### Ollama Local Model

> Note: Using models with too many parameters will lead to high resource consumption and translation delays. It is recommended to use models with less than 1B parameters, such as: `qwen2.5:0.5b`, `qwen3:0.6b`.

Before using this model, confirm that [Ollama](https://ollama.com/) is installed locally and that the required model has been downloaded. Select `Ollama Local Model` as the translation service and enter the model name; Ollama uses its default local service address.

#### OpenAI Compatible Model

If the local Ollama model is not suitable, select `OpenAI-compatible Model` as the translation service and enter its model name, Base URL, and API key separately.

Here are some model provider `Base URL`s:
- OpenAI: https://api.openai.com/v1
- DeepSeek: https://api.deepseek.com
- Alibaba Cloud: https://dashscope.aliyuncs.com/compatible-mode/v1

The API Key needs to be obtained from the corresponding model provider.

#### Google Translate API

> Note: Google Translate API is not available in some regions.

No configuration required, just connect to the internet to use.

### Qwen LiveTranslate

Qwen LiveTranslate uses `qwen3.8-livetranslate-flash-realtime` to stream source transcripts and translated text in one WebSocket session, with no external translation service. Paraformer remains the default. Select this engine, enter the workspace ID and region (Beijing or Singapore), and enter an Alibaba Cloud API Key for that workspace and region in More Settings. Alternatively, use `DASHSCOPE_WORKSPACE_ID` and `DASHSCOPE_API_KEY`. The source language is detected automatically. The UI offers Chinese, English, Japanese, Korean, German, French, Russian, Spanish and Italian as target languages. Audio is uploaded as 16kHz, 16-bit mono PCM. Only text is returned; translated speech is not played. Disabling translation only hides the translation, while the service still translates. Use Paraformer for recognition only.

[API / WebSocket](https://help.aliyun.com/zh/model-studio/qwen3-5-livetranslate-flash-realtime)

```bash
uv run python main.py -e livetranslate -t zh --dashscope_api_key <api-key> --dashscope_workspace_id <workspace-id> --dashscope_region cn-beijing
```

### Paraformer Realtime v2

The default engine is Alibaba Cloud `paraformer-realtime-v2`, using the DashScope Recognition SDK for duplex streaming ASR. Audio is uploaded as 16kHz, 16-bit mono PCM. Supported source languages are Chinese, English, Japanese, Korean, German, French, Russian and Cantonese; `auto` sends no language hint. There is no built-in translation: configure Ollama, an OpenAI-compatible service or Google Translate to translate finalized sentences asynchronously. Set the Alibaba Cloud API Key in settings or the `DASHSCOPE_API_KEY` environment variable on any platform; the CLI option is `--dashscope_api_key`. The current endpoint is the default Beijing endpoint and requires a matching regional API Key. Old Gummy selections and API Keys migrate automatically; old Spanish/Italian source selections switch to auto detection. Update old custom commands manually. See the [official SDK documentation](https://help.aliyun.com/zh/model-studio/paraformer-real-time-speech-recognition-python-sdk).

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

For source execution, install uv, enter `engine`, and run `uv sync` first. Run the example below in that directory. Packaged executables do not require uv.

For runtime parameters and detailed usage instructions, please refer to the [User Manual](./docs/user-manual/en.md#using-caption-engine-standalone).

```bash
uv run python main.py \
-e paraformer \
--dashscope_api_key sk-******************************** \
--translation_provider ollama \
--translation_model qwen2.5:0.5b \
-a 0 \
-d 1 \
-s en \
-t zh
```

![](./docs/img/07.png)

## ⚙️ Built-in Subtitle Engines

Currently, the software comes with 5 caption engines, with new engines under development. Their detailed information is as follows.

### Paraformer Realtime v2

The default engine is Alibaba Cloud `paraformer-realtime-v2`, using the DashScope Recognition SDK for duplex streaming ASR. Audio is uploaded as 16kHz, 16-bit mono PCM. Supported source languages are Chinese, English, Japanese, Korean, German, French, Russian and Cantonese; `auto` sends no language hint. There is no built-in translation: configure Ollama, an OpenAI-compatible service or Google Translate to translate finalized sentences asynchronously. Set the Alibaba Cloud API Key in settings or the `DASHSCOPE_API_KEY` environment variable on any platform; the CLI option is `--dashscope_api_key`. The current endpoint is the default Beijing endpoint and requires a matching regional API Key. Old Gummy selections and API Keys migrate automatically; old Spanish/Italian source selections switch to auto detection. Update old custom commands manually. See the [official SDK documentation](https://help.aliyun.com/zh/model-studio/paraformer-real-time-speech-recognition-python-sdk).

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

### Manage and Build the Subtitle Engine

Install [uv](https://docs.astral.sh/uv/getting-started/installation/) first. Engine dependencies are declared in `engine/pyproject.toml`. uv generates `engine/uv.lock` locally; Git ignores it. `engine/.python-version` selects Python 3.12 by default. Fresh clones resolve dependencies again, so versions can differ between developers or builds. Run these commands from the repository root:

```bash
npm run engine:sync
npm run engine:test
npm run build:engine
```

`engine:sync` prefers existing locked versions, updates the lockfile when dependency configuration changes, and creates or synchronizes `engine/.venv`, including PyInstaller. No manual environment creation or activation is needed. Electron development mode uses Python in this environment; the packaged app uses the bundled engine and does not require uv or Python on the user's machine.

On macOS, PyAudio requires PortAudio (for example, `brew install portaudio`). Linux audio capture requires `pactl` and `parec` (`pulseaudio-utils` on Ubuntu) and a working PulseAudio server or PipeWire PulseAudio compatibility service. See the [user manual](./docs/user-manual/en.md) for other platform settings.

`build:engine` runs PyInstaller in the uv-managed environment and produces a single executable: `engine/dist/main.exe` on Windows or `engine/dist/main` on macOS/Linux. The Vosk package path is discovered from the current Python environment; no manual edits to `main.spec` are needed. Installers copy the executable to `resources/engine/main.exe` on Windows or `resources/engine/main` on macOS/Linux (the macOS resources directory is `Contents/Resources` inside the app).

Use `uv add --project engine <package>` for runtime dependencies and `uv add --project engine --dev <package>` for development dependencies. For intentional upgrades, run `uv lock --project engine --upgrade`, followed by `npm run engine:sync`, and commit dependency declaration changes in `pyproject.toml`; do not commit the local `uv.lock`. Sherpa-ONNX and `sherpa-onnx-core` are explicitly pinned to matching versions because source package metadata can omit the native runtime dependency; update both version pins together.

### Run Project

```bash
npm run dev
```

### Code Checks

Run these commands from the repository root:

```bash
npm run lint
npm run typecheck
```

ESLint checks the desktop JavaScript, TypeScript and Vue source files and build configuration, excluding build outputs, dependency environments, models and experimental directories. The Python engine is outside ESLint's scope.

### Build Project

```bash
# For windows
npm run build:win
# For macOS
npm run build:mac
# For Linux
npm run build:linux
```

These installer commands build the engine before the desktop app. Run each command on its target operating system; PyInstaller does not cross-compile the engine for another OS.

### GitHub CI / CD

The [workflow](./.github/workflows/ci.yml) runs ESLint, type checks, desktop builds, offline engine tests, and release detection tests on Windows, macOS, and Linux for pull requests targeting `main` and pushes to `main`. It uses Node.js 22, Python 3.12, and uv, installs PortAudio on macOS, and temporarily removes the two mirror settings from `.npmrc` to use the default official download sources. Local mirror settings remain unchanged. Packaging separately overrides the Electron mirror in `electron-builder.yml`.

On a push to `main`, including a merged PR, it compares `package.json` versions before and after the entire push. A version change and successful checks on all platforms trigger x64 installers containing the Python engine: Windows NSIS `.exe`, macOS Intel `.dmg`, and Linux `.tar.gz`. Each packaged engine also undergoes a `--help` startup check. After every build succeeds, it creates a `v<version>` tag and GitHub Release with generated release notes and all three installers. Versions such as `1.3.0-rc.1` become pre-releases. Unchanged versions and initial branch creation only run CI.

To release, run `npm version 1.3.0 --no-git-tag-version` with the desired version to update both `package.json` and `package-lock.json`, update the changelog, and merge into `main`. Update `engine/pyproject.toml` if the engine version also changes. No manual tag or PAT is needed: publishing uses the built-in `GITHUB_TOKEN` with `contents: write`. Repository/organization policies must allow GitHub Actions and this permission; tag rules must allow the workflow to create `v*` tags. The three `Check (...)` jobs can be required status checks for merging.

Installers currently have no code signing or macOS notarization and do not include speech models. Linux users still need system audio dependencies. Actions artifacts are retained for 14 days. Use Re-run failed jobs on the original run to recover: interrupted uploads leave a draft, which becomes public only after all uploads finish. An already published release for the same commit is skipped; a tag or an untagged release draft targeting another commit fails and requires a new version. Subsequent main pushes do not cancel releases, which always target the triggering commit.
