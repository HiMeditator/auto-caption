# Auto Caption 字幕引擎

对应版本：v1.2.0

[项目首页](../README.md)

Auto Caption 的 Python 字幕引擎负责系统音频或麦克风采集、语音识别和翻译。可以独立通过命令行运行，也可以作为 Electron 应用的子进程使用；独立使用无需 Node.js 或 npm。

## 环境准备

安装 [uv](https://docs.astral.sh/uv/getting-started/installation/)，下载或克隆项目后进入 `engine`。除注明“仓库根目录”的 npm 命令外，下文命令均在此目录执行。

```bash
cd engine
uv sync
uv run python main.py --help
```

`uv.lock` 在本地由 uv 自动生成，已加入 `.gitignore`，不提交到仓库。`uv sync` 优先复用已有的本地锁文件，文件不存在或依赖配置变化时会生成或更新它；测试和构建使用的 `uv run` 也会自动同步环境。不同开发者或新克隆环境可能解析到不同版本。

`.python-version` 默认选择 Python 3.12。uv 按照 `pyproject.toml` 和 `uv.lock` 创建或同步 `.venv`，无需手动激活环境；首次准备需要联网下载依赖。默认包含 PyInstaller 开发依赖。仅运行源码时可用 `uv sync --no-dev`，后续对应使用 `uv run --no-dev python main.py ...`。

| 平台    | 音频准备                                                                                                             |
| ------- | -------------------------------------------------------------------------------------------------------------------- |
| Windows | uv 安装 PyAudioWPatch；系统音频输出通过播放设备的回环采集                                                            |
| macOS   | PyAudio 需要 PortAudio，例如 `brew install portaudio`；系统音频输出需要 BlackHole 和音频路由配置，麦克风需要系统授权 |
| Linux   | 需要 `pactl`、`parec`，Ubuntu 可安装 `pulseaudio-utils`；需要可用的 PulseAudio 或 PipeWire PulseAudio 兼容服务       |

macOS/Linux 的配置步骤见[用户手册](../docs/user-manual/zh.md)。

## 识别引擎

| `-e`                 | 引擎                               | 运行前需要准备                                            |
| -------------------- | ---------------------------------- | --------------------------------------------------------- |
| `paraformer`（默认） | 阿里云 Paraformer Realtime v2      | 北京地域 API Key；翻译使用外部服务                        |
| `livetranslate`      | 阿里云 Qwen LiveTranslate          | API Key、业务空间 ID、匹配的地域；自带流式翻译            |
| `glm`                | GLM-ASR                            | 智谱 API Key，通过 `--glm_api_key` 指定；模型和端点可配置 |
| `vosk`               | 本地 Vosk                          | 下载并解压模型，使用 `--vosk_model` 指定目录              |
| `sosv`               | 本地 Sherpa-ONNX SenseVoice 整合包 | 下载 SOSV 整合包，使用 `--sosv_model` 指定目录            |

uv 不下载本地识别模型。下载入口：[Vosk Models](https://alphacephei.com/vosk/models)、[SOSV 整合包](https://github.com/HiMeditator/auto-caption/releases/tag/sosv-model)。SOSV 需要整合包内的识别、端点检测和标点模型，不能只提供单个 SenseVoice 模型文件。

云端识别会将采集的音频发送给提供商；本地识别开启云端翻译时，会将字幕文本发送给翻译服务。

## 快速运行

示例均为单行命令，适用于 PowerShell 和常见 Unix Shell。替换模型路径、API Key 和业务空间 ID 后运行，按 `Ctrl+C` 停止。

### Vosk：麦克风识别，不翻译

```bash
uv run python main.py -e vosk -a 1 --vosk_model "./models/vosk-model-small-cn-0.22" -t none
```

### Paraformer：中文麦克风识别，不翻译

```bash
uv run python main.py -e paraformer -a 1 -s zh -t none --dashscope_api_key "your-api-key"
```

也可通过 `DASHSCOPE_API_KEY` 环境变量提供密钥。Paraformer 当前使用北京地域默认端点，密钥需要匹配该地域。

### LiveTranslate：麦克风识别并翻译为英语

```bash
uv run python main.py -e livetranslate -a 1 -t en --dashscope_api_key "your-api-key" --dashscope_workspace_id "your-workspace-id" --dashscope_region cn-beijing
```

业务空间 ID 可通过 `DASHSCOPE_WORKSPACE_ID` 提供。地域支持 `cn-beijing` 和 `ap-southeast-1`，需要与业务空间和密钥匹配。源语言自动检测；`-t none` 只隐藏译文，服务端仍执行翻译。只需要识别时可选择 Paraformer。

### Vosk + Ollama：本地识别与翻译

先启动 Ollama 并准备模型，再运行：

```bash
uv run python main.py -e vosk -a 1 --vosk_model "./models/vosk-model-small-cn-0.22" -t en --translation_provider ollama --translation_model "qwen2.5:0.5b"
```

外部翻译还支持 `openai` 和 `google`。OpenAI 兼容服务需要 `--translation_model`、`--translation_base_url` 及服务要求的 `--translation_api_key`。Ollama 和 OpenAI 启用翻译时必须指定模型，OpenAI 还必须指定 Base URL。LiveTranslate 不使用外部翻译参数。

## 常用参数与输出

| 参数                       | 作用及默认值                                                    |
| -------------------------- | --------------------------------------------------------------- |
| `-e` / `--caption_engine`  | 识别引擎，默认 `paraformer`                                     |
| `-a` / `--audio_type`      | `0` 为系统音频输出（默认），`1` 为麦克风                        |
| `-s` / `--source_language` | 源语言，默认 `auto`；支持语言取决于引擎，LiveTranslate 自动检测 |
| `-t` / `--target_language` | 翻译目标语言，默认 `none`；LiveTranslate 的隐藏译文行为见上文   |
| `-c` / `--chunk_rate`      | 每秒音频块数，默认 `10`                                         |
| `-r` / `--record`          | `1` 启用 WAV 录音，默认 `0`                                     |
| `-rp` / `--record_path`    | 录音目录，默认为当前工作目录；请预先创建目录                    |
| `-p` / `--port`            | 本地 TCP 命令端口，默认 `0` 表示不启动 Socket 服务              |

字幕结果和引擎事件使用逐行 JSON，例如：

```json
{
  "command": "caption",
  "index": 1,
  "time_s": "12:00:00.000",
  "time_t": "12:00:01.000",
  "text": "Hello",
  "translation": ""
}
```

完整参数见 `--help` 和[用户手册](../docs/user-manual/zh.md#单独使用字幕引擎)。接入其他宿主时，按[字幕引擎通信协议](../docs/api-docs/caption-engine.md)处理消息、生命周期及当前通信限制。JSON 输出不会自动保存为 SRT 文件，桌面端提供字幕记录和导出功能。

## 测试与依赖维护

```bash
uv run python -m unittest discover -s tests -v
```

现有离线测试使用模拟服务，覆盖 Paraformer 和 LiveTranslate 的参数、事件处理及停止逻辑，不需要 API Key、音频设备或模型文件；环境准备仍可能需要联网。真实音频、云端服务及其他平台需要另行验证。

运行依赖使用 `uv add <package>` 添加，开发依赖使用 `uv add --dev <package>`。有意更新本地锁定版本时执行 `uv lock --upgrade`，然后 `uv sync` 并运行测试。依赖声明变更提交 `pyproject.toml`，不提交本地 `uv.lock`。

Sherpa-ONNX 与 `sherpa-onnx-core` 固定为匹配版本，避免源码包元数据遗漏原生运行库，升级时应同时修改两个版本。检查依赖一致性可用 `uv pip check --python .venv/Scripts/python.exe`（Windows）或 `uv pip check --python .venv/bin/python`（macOS/Linux）。

## 打包

```bash
uv run pyinstaller --noconfirm --clean main.spec
```

Vosk 路径从当前 Python 环境自动发现，无需手动修改 `main.spec`。必须在目标操作系统上构建；PyInstaller 不支持跨操作系统编译。

| 平台        | 本目录内的单文件产物 | 桌面端资源目录中的位置 |
| ----------- | -------------------- | ---------------------- |
| Windows     | `dist/main.exe`      | `engine/main.exe`      |
| macOS/Linux | `dist/main`          | `engine/main`          |

Windows 可用 `./dist/main.exe --help` 检查产物，macOS/Linux 使用 `./dist/main --help`。打包后的引擎运行无需 uv 或 Python，本地模型和平台音频配置仍需单独准备。macOS 应用资源位于 `Contents/Resources`。

仓库根目录还提供 `npm run engine:sync`、`npm run engine:test`、`npm run build:engine`。`npm run build:win`、`npm run build:mac`、`npm run build:linux` 会先构建引擎，再构建桌面端安装包；这些命令需要桌面端的 Node.js/npm 环境。

## 目录与开发资料

```text
main.py          CLI 入口与运行流程
audio2text/      五种识别引擎的适配器
sysaudio/        平台音频采集
utils/          音频处理、翻译、共享状态和通信
tests/          离线测试
pyproject.toml   uv 项目与依赖配置
uv.lock          本地自动生成的依赖锁文件（Git 忽略）
.python-version 默认 Python 版本
main.spec        PyInstaller 配置
```

`models/` 放置自行下载的模型，`.venv/`、`build/`、`dist/` 为本地环境或构建产物，不应作为源码提交。开发自定义引擎或新增适配器，请参考[引擎说明](../docs/engine-manual/zh.md)与[通信协议](../docs/api-docs/caption-engine.md)。许可证见 [LICENSE](../LICENSE)。
