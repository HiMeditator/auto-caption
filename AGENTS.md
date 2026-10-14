# AGENTS.md

## 项目概述

Auto Caption 是跨平台的实时字幕显示软件，可识别系统音频输出或麦克风输入，支持字幕翻译、样式设置、字幕记录和导出。

- 桌面端：Electron + TypeScript，使用 electron-vite 构建；界面使用 Vue 3、Ant Design Vue、Pinia、Vue Router 和 vue-i18n。
- 字幕引擎：Python，包含 Paraformer、Qwen LiveTranslate、GLM-ASR、Vosk 和 SOSV 识别实现，以及 Ollama、OpenAI 兼容服务和 Google 翻译支持。
- 通信：渲染进程通过 Electron IPC 与主进程交互；主进程启动 Python 子进程，引擎通过标准输出发送逐行 JSON 消息，主进程通过 TCP Socket 向引擎发送命令。

## 项目结构

```text
src/
  main/                    Electron 主进程
    index.ts               应用入口和生命周期
    ControlWindow.ts       控制窗口及其 IPC 处理
    CaptionWindow.ts       字幕窗口及其 IPC 处理
    utils/                 引擎进程管理、配置持久化、日志等
    types/                 主进程类型定义
    i18n/                  主进程中英日文案
  preload/                 向渲染进程暴露 Electron API 和类型
  renderer/
    src/
      views/               控制页面和字幕页面
      components/          设置、引擎控制、字幕样式和日志组件
      stores/              Pinia 状态管理
      router/              页面路由
      i18n/                界面中英日文案及选项配置
      types/               渲染进程类型定义
      utils/               界面工具函数
      assets/              界面样式等资源
engine/
  README.md                独立引擎使用、测试和构建说明（中文）
  main.py                  引擎入口、命令行参数和运行流程
  audio2text/              各语音识别引擎实现
  sysaudio/                Windows、macOS、Linux 音频采集实现
  utils/                   音频处理、翻译、共享状态和通信工具
  pyproject.toml           uv 项目配置和 Python 依赖
  uv.lock                  本地自动生成的依赖锁文件（Git 忽略）
  .python-version          默认 Python 版本
  main.spec                PyInstaller 打包配置
  models/                  本地模型（Git 忽略）
  notebook/                实验笔记和示例（Git 忽略）
docs/                      用户手册、引擎说明、通信协议和更新日志
assets/                    README 和文档使用的图片等资源
build/                     Electron 打包资源，如图标和 macOS 权限配置
electron.vite.config.ts    桌面端构建配置
electron-builder.yml       安装包配置和引擎资源复制规则
```

`out/`、`dist/`、`engine/build/` 和 `engine/dist/` 为构建产物目录，`node_modules/` 和 `engine/.venv/` 为依赖环境；应修改源文件而不是这些目录中的生成内容。

## 项目文档

以下路径均相对于仓库根目录：

| 文档                               | 中文                                 | English                                   | 日本語                                       |
| ---------------------------------- | ------------------------------------ | ----------------------------------------- | -------------------------------------------- |
| 项目介绍、安装和构建               | [README.md](README.md)               | [README_en.md](README_en.md)              | [README_ja.md](README_ja.md)                 |
| 独立字幕引擎使用、测试和构建       | [引擎 README](engine/README.md)      | —                                        | —                                           |
| 用户手册、设置和引擎命令行参数     | [用户手册](docs/user-manual/zh.md)   | [User manual](docs/user-manual/en.md)     | [ユーザーマニュアル](docs/user-manual/ja.md) |
| 引擎架构、运行流程和自定义引擎开发 | [引擎说明](docs/engine-manual/zh.md) | [Engine manual](docs/engine-manual/en.md) | [字幕エンジン説明](docs/engine-manual/ja.md) |

- [Electron IPC 协议](docs/api-docs/electron-ipc.md)：主进程与渲染进程的通信约定。
- [字幕引擎通信协议](docs/api-docs/caption-engine.md)：Electron 主进程与字幕引擎的通信约定。
- [更新日志](docs/CHANGELOG.md)：版本变更记录。
- [待办事项](docs/TODO.md)：已完成事项和后续计划。
- [GitHub 仓库](https://github.com/HiMeditator/auto-caption)。

说明文档统一对应最新发布版本；开发时应结合当前源码核对，遇到与本次变更相关的不一致时同步修正。

## 开发规则

1. **功能修改后同步更新文档。** 如果现有文档有对应内容，应在同一次变更中更新相关说明、参数、示例和限制，确保文档与实际行为一致：

   - 用户操作、设置、字幕显示或导出行为变更：更新用户手册；README 中有对应介绍时也要更新。
   - 引擎运行流程、模型接入、翻译配置或命令行参数变更：更新引擎说明和用户手册中的对应章节。
   - IPC 通道、消息字段或引擎通信格式变更：更新对应的 `docs/api-docs/` 协议文档。
   - 对于有中英日版本的对应内容，同步维护各语言版本。
   - 需要记录的功能变更和修复写入 `docs/CHANGELOG.md` 的“未发布”部分。

2. **保持模块职责和接口一致。** 窗口与系统能力由主进程处理，界面与交互由渲染进程处理，音频采集和识别由 Python 引擎处理。修改配置或通信接口时，检查发送端、接收端、默认配置及两端类型定义；引擎供主进程解析的标准输出应保持逐行 JSON，使用现有输出工具发送消息。
3. **同步维护界面语言。** 新增或修改用户可见文案时，检查 `src/main/i18n/lang/` 和 `src/renderer/src/i18n/lang/` 中对应的中文、英文、日文内容。

## 常用开发命令

在仓库根目录执行：

```bash
npm install                 # 安装桌面端依赖
npm run engine:sync         # 使用 uv 同步引擎依赖
npm run engine:test         # 运行引擎离线测试
npm run build:engine        # 使用 uv 和 PyInstaller 构建引擎
npm run dev                 # 启动开发环境
npm run typecheck           # 主进程和渲染进程类型检查
npm run lint                # ESLint 检查
npm run build               # 类型检查并构建桌面端
npm run build:win           # 构建 Windows 安装包
npm run build:mac           # 构建 macOS 安装包
npm run build:linux         # 构建 Linux 安装包
```

引擎使用 uv 管理，默认 Python 版本由 `engine/.python-version` 指定为 3.12。运行 `npm run engine:sync` 在本地生成或更新 `engine/uv.lock`，并同步到 `engine/.venv/`。锁文件由 Git 忽略，不提交；新增或更新依赖时维护并提交 `pyproject.toml`。开发模式直接调用此环境中的 Python 运行 `engine/main.py`，Windows 为 `.venv/Scripts/python.exe`，macOS/Linux 为 `.venv/bin/python`。

uv 命令优先复用 `uv.lock` 中的版本，依赖配置变化时自动更新锁文件，不使用 `--locked` 强制检查。安装包命令先运行 `npm run build:engine`，通过 uv 环境中的 PyInstaller 构建单文件引擎；Vosk 的依赖路径自动发现。Windows 产物 `engine/dist/main.exe` 复制到资源目录的 `engine/main.exe`，macOS/Linux 产物 `engine/dist/main` 复制到资源目录的 `engine/main`。必须在目标操作系统上构建；详细步骤和系统音频依赖见 README。
