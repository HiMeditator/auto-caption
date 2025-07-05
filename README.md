<div align="center" >
    <img src="./resources/icon.png" width="100px" height="100px"/>
    <h1 align="center">auto-caption</h1>
    <p>Auto Caption 是一个跨平台的实时字幕显示软件。</p>
    <p>
        | <b>简体中文</b>
        | <a href="./README_en.md">English</a>
        | <a href="./README_ja.md">日本語</a> |
    </p>
    <p><i>v0.2.0版本已经发布。预计将添加本地字幕引擎的v1.0.0版本正在开发中...</i></p>
</div>

![](./assets/media/main_zh.png)

## 📥 下载

[GitHub Releases](https://github.com/HiMeditator/auto-caption/releases)

## 📚 相关文档

[Auto Caption 用户手册](./docs/user-manual/zh.md)

[字幕引擎说明文档](./docs/engine-manual/zh.md)

[项目 API 文档](./docs/api-docs/electron-ipc.md)

### 基本使用

目前仅提供了 Windows 平台的可安装版本。如果要使用默认的 Gummy 字幕引擎，首先需要获取阿里云百炼平台的 API KEY 并配置到环境变量中，这样才能正常使用该模型。

**国际版的阿里云服务并没有提供 Gummy 模型，因此目前非中国用户无法使用默认字幕引擎。我正在开发新的本地字幕引擎，以确保所有用户都有默认字幕引擎可以使用。**

相关教程：

- [获取 API KEY](https://help.aliyun.com/zh/model-studio/get-api-key)
- [将 API Key 配置到环境变量](https://help.aliyun.com/zh/model-studio/configure-api-key-through-environment-variables)。

如果你想了解字幕引擎的工作原理，或者你想开发自己的字幕引擎，请参考[字幕引擎说明文档](./docs/engine-manual/zh.md)。
## ✨ 特性

- 多界面语言支持
- 丰富的字幕样式设置
- 灵活的字幕引擎选择
- 多语言识别与翻译
- 字幕记录展示与导出
- 生成音频输出和麦克风输入的字幕

说明：
- Windows 平台支持生成音频输出和麦克风输入的字幕
- Linux 平台目前仅支持生成麦克风输入的字幕
- 目前还没有适配 macOS 平台

## 🚀 项目运行

![](./assets/media/structure_zh.png)

### 安装依赖

```bash
npm install
```

### 构建字幕引擎

首先进入 `caption-engine` 文件夹，执行如下指令创建虚拟环境：

```bash
python -m venv subenv
```

然后激活虚拟环境：

```bash
# Windows
subenv/Scripts/activate
# Linux
source subenv/bin/activate
```

然后安装依赖（注意如果是 Linux 环境，需要注释掉 `requirements.txt` 中的 `PyAudioWPatch`，该模块仅适用于 Windows 环境）：

```bash
pip install -r requirements.txt
```

然后使用 `pyinstaller` 构建项目：

```bash
pyinstaller --onefile main-gummy.py
```

此时项目构建完成，在进入 `caption-engine/dist` 文件夹可见对应的可执行文件。即可进行后续操作。

### 运行项目

```bash
npm run dev
```
### 构建项目

注意目前软件没有适配 macOS 平台，请使用 Windows 或 Linux 系统进行构建，更建议使用实现了完整功能的 Windows 平台。

```bash
# For windows
npm run build:win
# For macOS, not avaliable yet
npm run build:mac
# For Linux
npm run build:linux
```
