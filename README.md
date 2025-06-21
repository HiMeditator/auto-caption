<div align="center" >
    <img src="./resources/icon.png" width="100px" height="100px"/>
    <h1 align="center">auto-caption</h1>
    <p>Auto Caption 是一个跨平台的视频播放和字幕显示软件。</p>
    <b>项目还在初步开发阶段。</b>
</div>

<hr>

## 📥 下载

暂无

## 📚 用户手册

暂无

## ✨ 特性

- 丰富的字幕样式设置
- 灵活的字幕引擎选择
- 多语言识别与翻译
- 字幕记录展示与导出

## 🚀 项目运行

### 安装依赖

```bash
npm install
```

### 构建字幕引擎

字幕引擎原理：所谓的字幕引擎实际上是一个子程序，它会实时获取系统音频输入（录音）或输出（播放声音）的流式数据，并调用音频转文字的模型生成对应音频的字幕。生成的字幕通过 IPC 输出为转换为字符串的 JSON 数据，并返回给主程序。主程序读取字幕数据，处理后显示在窗口上。

目前项目默认使用 [阿里云 Gummy 模型](https://help.aliyun.com/zh/model-studio/gummy-speech-recognition-translation/)，需要有阿里云百炼平台的 API KEY 才能正常使用该模型。

gummy 字幕引擎是一个 python 子程序，可以选择配置好 python 环境后直接运行该程序，也可以使用 pyinstaller 构建一个可执行文件。 运行字幕引擎子程序的代码在 `src\main\utils\engine.ts` 文件中

### 运行项目

```bash
npm run dev
```
### 构建项目

注意目前软件没有适配 macOS 平台，请使用 Windows 或 Linux 系统进行构建。

```bash
# For windows
npm run build:win
# For macOS
npm run build:mac
# For Linux
npm run build:linux
```