# Auto Caption 用户手册

对应版本：v1.2.0

## 软件简介

Auto Caption 是一个跨平台的字幕显示软件，能够实时获取系统音频输入（录音）或输出（播放声音）的流式数据，并调用音频转文字的模型生成对应音频的字幕。默认 Paraformer 引擎支持八种源语言（含粤语），翻译通过外部服务提供。

目前软件默认字幕引擎在 Windows、 macOS 和 Linux 平台下均拥有完整功能，在 macOS 要获取系统音频输出需要额外配置。

测试过可正常运行的操作系统信息如下，软件不能保证在非下列版本的操作系统上正常运行。

| 操作系统版本        | 处理器架构 | 获取系统音频输入 | 获取系统音频输出 |
| ------------------ | ---------- | ---------------- | ---------------- |
| Windows 11 24H2    | x64        | ✅                | ✅                |
| macOS Sequoia 15.5 | arm64      | ✅需要额外配置    | ✅                |
| Ubuntu 24.04.2     | x64        | ✅    | ✅                |
| Kali Linux 2022.3     | x64        | ✅    | ✅                |
| Kylin Server V10 SP3 | x64 | ✅ | ✅ |

![](../../assets/media/main_zh.png)

### 项目关于

点击主界面“项目关于”下的 GitHub 图标，打开关于窗口。窗口顶部展示软件图标，显示软件版本、更新日期和作者信息，并以两行两列的卡片布局提供项目仓库、用户手册、字幕引擎手册和更新日志入口，各链接显示完整地址。手册链接随界面语言切换，更新日志链接指向统一的更新记录，窗口配色跟随深浅主题。点击作者姓名 [HiMeditator](https://github.com/HiMeditator) 可在默认浏览器中打开作者的 GitHub 主页。

### 软件缺点

要使用默认的 Paraformer 字幕引擎需要获取阿里云的 API KEY。

在 macOS 平台获取音频输出需要额外配置。

软件使用 Electron 构建，因此软件体积不可避免的较大。

## Paraformer Realtime v2

默认引擎为阿里云 `paraformer-realtime-v2`，通过 DashScope Recognition SDK 双向流式识别。上传音频为 16kHz、16bit、单声道 PCM；支持中文、英文、日语、韩语、德语、法语、俄语及粤语，`auto` 不指定语言提示。模型不提供内置翻译；开启翻译后需配置 Ollama、OpenAI 兼容服务或 Google 翻译，完整句子返回后异步翻译。设置中的阿里云 API Key 或 `DASHSCOPE_API_KEY` 环境变量用于鉴权（所有平台）；CLI 参数为 `--dashscope_api_key`。当前使用北京地域默认端点，API Key 必须匹配该地域。旧 Gummy 引擎选项和 API Key 自动迁移，旧西班牙语/意大利语源语言改为自动检测；旧自定义命令需手动更新。详见[阿里云官方 SDK 文档](https://help.aliyun.com/zh/model-studio/paraformer-real-time-speech-recognition-python-sdk)。

## Qwen LiveTranslate

Qwen LiveTranslate 使用 `qwen3.8-livetranslate-flash-realtime`，在同一个 WebSocket 会话中流式返回原文和译文，无需配置外部翻译服务。默认仍为 Paraformer。选择此引擎后填写业务空间 ID、地域（北京或新加坡），并在更多设置中填写该业务空间和地域的阿里云 API Key；也可使用 `DASHSCOPE_WORKSPACE_ID` 和 `DASHSCOPE_API_KEY` 环境变量。源语言自动检测，界面提供中、英、日、韩、德、法、俄、西、意作为翻译目标语言。音频上传为 16kHz、16bit、单声道 PCM，仅输出文字，不播放翻译语音。关闭翻译仅隐藏译文，服务端仍执行翻译；只需要识别时建议选择 Paraformer。

[API / WebSocket](https://help.aliyun.com/zh/model-studio/qwen3-5-livetranslate-flash-realtime)

```bash
uv run python main.py -e livetranslate -t zh --dashscope_api_key <api-key> --dashscope_workspace_id <workspace-id> --dashscope_region cn-beijing
```

## GLM 引擎使用前准备

需要先获取 API KEY，参考：[Quick Start](https://docs.bigmodel.cn/en/guide/start/quick-start)。

## Vosk 引擎使用前准备

如果要使用 Vosk 本地字幕引擎，首先需要在 [Vosk Models](https://alphacephei.com/vosk/models) 页面下载你需要的模型。然后将下载的模型安装包解压到本地，并将对应的模型文件夹的路径添加到软件的设置中。

![](../../assets/media/config_zh.png)

## 使用 SOSV 模型

使用 SOSV 模型的方式和 Vosk 一样，下载地址如下：https://github.com/HiMeditator/auto-caption/releases/tag/sosv-model

## macOS 获取系统音频输出

> 基于 [Setup Multi-Output Device](https://github.com/ExistentialAudio/BlackHole/wiki/Multi-Output-Device) 教程编写

字幕引擎无法在 macOS 平台直接获取系统的音频输出，需要安装额外的驱动。目前字幕引擎采用的是 [BlackHole](https://github.com/ExistentialAudio/BlackHole)。首先打开终端，执行以下命令中的其中一个（建议选择第一个）：

```bash
brew install blackhole-2ch
brew install blackhole-16ch
brew install blackhole-64ch
```

![](../img/03.png)

安装完成后打开 `音频 MIDI 设置`（`cmd + space` 打开搜索，可以搜索到）。观察设备列表中是否有 BlackHole 设备，如果没有需要重启电脑。

![](../img/04.png)

在确定安装好 BlackHole 设备后，在 `音频 MIDI 设置` 页面，点击左下角的加号，选择“创建多输出设备”。在输出中包含 BlackHole 和你想要的音频输出目标。最后将该多输出设备设置为默认音频输出设备。

![](../img/05.png)

现在字幕引擎就能捕获系统的音频输出并生成字幕了。

## Linux 获取系统音频输出

首先在控制台执行：

```bash
pactl list short sources
```

如果有以下类似的输出内容则无需额外配置：

```bash
220     alsa_output.pci-0000_02_02.0.3.analog-stereo.monitor    PipeWire        s16le 2ch 48000Hz       SUSPENDED
221     alsa_input.pci-0000_02_02.0.3.analog-stereo     PipeWire        s16le 2ch 48000Hz       SUSPENDED
```

否则，执行以下命令安装 `pulseaudio` 和 `pavucontrol`：

```bash
# Debian or Ubuntu, etc.
sudo apt install pulseaudio pavucontrol
# CentOS, etc.
sudo yum install pulseaudio pavucontrol
```

## 软件使用

### 修改设置

字幕设置可以分为三类：通用设置、字幕引擎设置、字幕样式设置。需要注意的是，修改通用设置是立即生效的。但是对于其他两类设置，修改后需要点击对应设置模块右上角的“应用”选项，更改才会真正生效。如果点击“取消更改”那么当前修改将不会被保存，而是回退到上次修改的状态。

字幕样式预览框右上角提供与字幕窗口相同样式的关闭图标，图标颜色跟随原文字幕颜色。点击后立即隐藏预览，并将“字幕样式设置”中的“显示预览”开关关闭，同时弹出提示说明预览已关闭，可在字幕样式设置中重新开启。重新开启该开关即可显示预览；点击“应用样式”保存此设置，点击“取消更改”则恢复上次保存的状态。

### 启动和关闭字幕

在修改完全部配置后，点击界面的“启动字幕引擎”按钮，即可启动字幕。如果需要独立的字幕展示窗口，单击界面的“打开字幕窗口”按钮即可激活独立的字幕展示窗口。如果需要暂停字幕识别，单击界面的“关闭字幕引擎”按钮即可。

### 调整字幕展示窗口

如下图为字幕展示窗口，该窗口实时展示当前最新字幕。窗口右上角三个按钮的功能分别是：关闭字幕展示窗口、打开字幕控制窗口、启用鼠标穿透。该窗口宽度可以调整，将鼠标移动至窗口的左右边缘，拖动鼠标即可调整宽度。

![](../img/01.png)

### 字幕记录的导出

在字幕控制窗口中可以看到当前收集的所有字幕的记录，点击“导出字幕”按钮，即可将字幕记录导出为 JSON 或 SRT 文件。

## 字幕引擎

字幕引擎选项按 Qwen LiveTranslate 3.8、Paraformer、GLM-ASR、Vosk、SOSV 排列，云端模型在前。本地模型标注运行位置：`本地 / CPU / Vosk`、`本地 / CPU / SOSV`。

在字幕引擎设置中，每个模型的描述显示在模型设置顶部，介绍识别方式、配置要求和翻译支持。切换模型时描述立即更新；描述框带有边框，背景和边框使用当前主题色的配色，并适配明暗主题。

浅色主题选择最后一种黑色主题色时，模型和翻译描述框使用浅灰背景与灰色边框，保持文字清晰可读。

模型、音频、自定义引擎和更多设置位于前半部分；启用翻译与启用录制在后半部分的同一行显示，其后为翻译语言、翻译服务及其模型名称、Base URL 和 API Key。两部分之间显示与模型描述相同样式的翻译服务说明，随 Ollama、OpenAI 兼容服务或 Google 翻译的选择立即更新。选择 Qwen LiveTranslate 时显示内置翻译说明，不显示外部翻译服务的配置项。

将鼠标悬停在“音频类型”“启用录制”“自定义引擎”“启用翻译”或“更多设置”的标签上，可查看对应功能和配置要求。选择 Qwen LiveTranslate 时，“业务空间 ID”和“阿里云地域”也提供悬浮说明，提示业务空间、API Key 与地域的匹配要求，以及业务空间 ID 留空时使用环境变量。业务空间 ID 的说明还提供[阿里云百炼业务空间设置](https://bailian.console.aliyun.com/cn-beijing/settings/workspace)链接，方便获取自己的业务空间 ID。带有悬浮说明的标签使用主题色显示；Qwen LiveTranslate 的翻译提示会说明关闭翻译仅隐藏译文、服务端仍执行翻译。

所谓的字幕引擎实际上是一个子程序，它会实时获取系统音频输入（录音）或输出（播放声音）的流式数据，并调用音频转文字的模型生成对应音频的字幕。生成的字幕通过转换为字符串的 JSON 数据，并通过标准输出传递给主程序。主程序读取字幕数据，处理后显示在窗口上。

软件提供了五个内置字幕引擎，如果你需要其他的字幕引擎，可以通过打开自定义引擎选项来调用其他字幕引擎（其他引擎需要针对该软件进行开发）。其中引擎路径是自定义字幕引擎在你的电脑上的路径，引擎指令是自定义字幕引擎的运行参数，这部分需要按该字幕引擎的规则进行填写。

![](../img/02_zh.png)

注意使用自定义字幕引擎时，前面的字幕引擎的设置将全部不起作用，自定义字幕引擎的配置完全通过引擎指令进行配置。

如果你是开发者，想开发自定义字幕引擎，请查看[字幕引擎说明文档](../engine-manual/zh.md)。

## 单独使用字幕引擎

### 运行参数说明

> 以下内容默认用户对使用终端运行程序有一定了解。

字幕引擎可用使用的完整的运行参数如下：

![](../img/06.png)

而在单独使用时其中某些参数并不需要使用，或者不适合进行修改。

下面的运行参数说明仅包含必要的参数。

#### `-e , --caption_engine`

需要选择的字幕引擎模型，目前有五个可用，分别为：`paraformer, livetranslate, glm, vosk, sosv`。

该项的默认值为 `paraformer`。

该项适用于所有模型。

#### `-a, --audio_type`

需要识别的音频类型，其中 `0` 表示系统音频输出，`1` 表示麦克风音频输入。

该项的默认值为 `0`。

该项适用于所有模型。

#### `-d, --display_caption`

是否在控制台显示字幕，`0` 表示不显示，`1` 表示显示。

该项默认值为 `0`，只使用字幕引擎的话建议选 `1`。

该项适用于所有模型。

#### `-t, --target_language`

> 其中 Vosk 和 SOSV 模型分句效果较差，会导致翻译内容难以理解，不太建议这两个模型使用翻译。

需要翻译成的目标语言，所有模型都支持的翻译语言如下：

- `none` 不进行翻译
- `zh` 简体中文
- `en` 英语
- `ja` 日语
- `ko` 韩语

除此之外 `vosk` 和 `sosv` 模型还支持如下翻译：

- `de` 德语
- `fr` 法语
- `ru` 俄语
- `es` 西班牙语
- `it` 意大利语

该项的默认值为 `none`。

该项适用于所有模型。

#### `-s, --source_language`

需要识别的语言的源语言，默认值为 `auto`，表示不指定源语言。

但是指定源语言能在一定程度上提高识别准确率，可用使用上面的语言代码指定源语言。

该项适用于 Paraformer、GLM 和 SOSV 模型。

Paraformer 支持 `zh, en, ja, ko, de, fr, ru, yue` 和 `auto`，不支持西班牙语和意大利语识别。

GLM 模型支持指定的语言有：英语、中文、日语、韩语。

SOSV 模型支持指定的语言有：英语、中文、日语、韩语、粤语。

#### `--dashscope_api_key`

指定 Paraformer 和 Qwen LiveTranslate 使用的阿里云 API Key；留空时读取 `DASHSCOPE_API_KEY` 环境变量，密钥须与服务地域匹配。

该项默认值为空。

该项适用于 Paraformer 和 Qwen LiveTranslate 模型。

#### `--dashscope_workspace_id`

Qwen LiveTranslate 的业务空间 ID，默认值为空，留空时读取 `DASHSCOPE_WORKSPACE_ID` 环境变量。请在[阿里云百炼业务空间设置](https://bailian.console.aliyun.com/cn-beijing/settings/workspace)中获取自己的业务空间 ID，业务空间、API Key 和地域必须匹配。

#### `--dashscope_region`

Qwen LiveTranslate 的服务地域，默认 `cn-beijing`（北京），也支持 `ap-southeast-1`（新加坡）。Paraformer 当前使用北京默认端点，不使用此参数。

#### `-gkey, --glm_api_key`

指定 `glm` 模型需要使用的 API KEY，默认为空。

#### `-gmodel, --glm_model`

指定 `glm` 模型需要使用的模型名称，默认为 `glm-asr-2512`。

#### `-gurl, --glm_url`

指定 `glm` 模型需要使用的 API URL，默认值为：`https://open.bigmodel.cn/api/paas/v4/audio/transcriptions`。

#### `--translation_provider`

指定 Paraformer、Vosk、SOSV 和 GLM 字幕引擎使用的翻译服务，默认为 `ollama`。

该项支持的值有：

- `ollama` 使用本地 Ollama 模型进行翻译，需要用户安装 Ollama 软件和对应的模型
- `openai` 使用 OpenAI API 兼容服务进行翻译
- `google` 使用 Google 翻译 API 进行翻译，无需额外配置，但是需要有能访问 Google 的网络

该项仅适用于没有内置翻译功能的字幕引擎。

#### `--translation_model`

指定 Ollama 或 OpenAI API 兼容服务使用的模型名称。Google 翻译不使用此参数。

如果使用 Ollama 模型，建议使用参数量小于 1B 的模型，比如： `qwen2.5:0.5b`, `qwen3:0.6b`。需要在 Ollama 中下载了对应的模型才能正常使用。

默认值为空。

#### `--translation_base_url`

OpenAI API 兼容服务的基础请求地址，例如 `https://api.openai.com/v1`。仅当 `--translation_provider openai` 时使用。

默认值为空，适用于 Paraformer、GLM、Vosk 和 SOSV。

#### `--translation_api_key`

指定调用 OpenAI API 兼容服务的 API Key。仅当 `--translation_provider openai` 时使用。

默认值为空，适用于 Paraformer、GLM、Vosk 和 SOSV。

#### `-vosk, --vosk_model`

指定需要调用的 Vosk 模型的本地文件夹的路径。该项默认值为空。

该项仅适用于 Vosk  模型。

#### `-sosv, --sosv_model`

指定需要调用的 SOSV 模型的本地文件夹的路径。该项默认值为空。

该项仅适用于 SOSV  模型。

### 使用源代码运行字幕引擎

> 以下内容默认使用该方式的用户对 Python 环境配置和使用有所了解。

下载项目源代码并安装 [uv](https://docs.astral.sh/uv/getting-started/installation/)，然后进入 `engine` 目录。依赖由 `pyproject.toml` 声明，`uv.lock` 在本地自动生成并由 Git 忽略，默认使用 Python 3.12：

```bash
cd engine
uv sync
uv run python main.py --help
```

无需激活虚拟环境；下列源码命令均在 `engine` 目录使用 `uv run python main.py` 执行。录音所需的平台系统依赖见 README 的引擎构建说明。发布版应用使用内置引擎，不需要安装 uv。

比如要使用 Paraformer 模型，指定音频类型为系统音频输出，源语言为英语，翻译语言为中文，执行的命令如下：

> 注意：为了更直观，下面的命令写在了多行，如果执行失败，尝试去掉反斜杠，并改换单行命令执行。

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

指定 Vosk 模型，指定音频类型为系统音频输出，翻译语言为英语，使用 Ollama `qwen3:0.6b` 模型进行翻译：

```bash
uv run python main.py \
-e vosk \
-vosk D:\Projects\auto-caption\engine\models\vosk-model-small-cn-0.22 \
-a 0 \
-d 1 \
-t en \
--translation_provider ollama \
--translation_model qwen3:0.6b
```

如果改用 OpenAI API 兼容服务，需要明确指定服务类型、模型和 Base URL：

```bash
uv run python main.py \
-e vosk \
-vosk D:\Projects\auto-caption\engine\models\vosk-model-small-cn-0.22 \
-t en \
--translation_provider openai \
--translation_model gpt-4.1-mini \
--translation_base_url https://api.openai.com/v1 \
--translation_api_key sk-********************************
```

指定 SOSV 模型，指定音频类型为麦克风，自动选择源语言，不翻译，执行的命令如下：

```bash
uv run python main.py \
-e sosv \
-sosv D:\\Projects\\auto-caption\\engine\\models\\sosv-int8 \
-a 1 \
-d 1 \
-s auto \
-t none
```

使用 Paraformer 模型的运行效果如下：

![](../img/07.png)

### 运行字幕引擎可执行文件

首先在 [GitHub Release](https://github.com/HiMeditator/auto-caption/releases/tag/engine) 中下载对应平台的可执行文件（目前仅提供 Windows 和 Linux 平台的字幕引擎可执行文件）。

然后再字幕引擎可执行文件所在目录打开终端，执行命令进行运行字幕引擎。

只需要将上述指令中的 `uv run python main.py` 替换为可执行文件名称即可（比如：`engine-win.exe`）。

LiveTranslate CLI：`--dashscope_workspace_id` 指定业务空间 ID（空值时读取环境变量），`--dashscope_region` 指定地域，默认为 `cn-beijing`，也支持 `ap-southeast-1`。`--dashscope_api_key` 与 Paraformer 共用。`-s` 不用于该模型；`-t none` 仅隐藏译文。外部翻译参数不用于 LiveTranslate。
