<div align="center" >
    <img src="./resources/icon.png" width="100px" height="100px"/>
    <h1 align="center">auto-caption</h1>
    <p>Auto Caption is a cross-platform real-time caption display software.</p>
    <p>
        | <a href="./README.md">Chinese</a>
        | <b>English</b>
        | <a href="./README_ja.md">Japanese</a> |
    </p>
    <p><i>Version v0.2.0 has been released. Version v1.0.0, which is expected to add a local caption engine, is under development...</i></p>
</div>

![](./assets/media/main_en.png)

## 📥 Download

[GitHub Releases](https://github.com/HiMeditator/auto-caption/releases)

## 📚 Related Documentation

[Auto Caption User Manual](./docs/user-manual/en.md)

[Caption Engine Explanation Document](./docs/engine-manual/en.md)

[Project API Documentation (Chinese)](./docs/api-docs/electron-ipc.md)

### Basic Usage

Currently, only an installable version for the Windows platform is provided. If you want to use the default Gummy caption engine, you first need to obtain an API KEY from the Alibaba Cloud Model Studio and configure it in the environment variables. This is necessary to use the model properly.

**The international version of Alibaba Cloud does not provide the Gummy model, so non-Chinese users currently cannot use the default caption engine. I am trying to develop a new local caption engine to ensure that all users have access to a default caption engine.**

Relevant tutorials:
- [Obtain API KEY (Chinese)](https://help.aliyun.com/zh/model-studio/get-api-key)
- [Configure API Key in Environment Variables (Chinese)](https://help.aliyun.com/zh/model-studio/configure-api-key-through-environment-variables).

If you want to understand how the caption engine works or if you want to develop your own caption engine, please refer to the [Caption Engine Explanation Document](./docs/engine-manual/en.md).
## ✨ Features

- Multi-language interface support
- Rich caption style settings
- Flexible caption engine selection
- Multi-language recognition and translation
- Caption record display and export
- Generate captions for audio output and microphone input

Notes:
- The Windows platform supports generating captions for both audio output and microphone input.
- The Linux platform currently only supports generating captions for microphone input.
- The macOS platform is not yet supported.

## 🚀 Project Execution

![](./assets/media/structure_en.png)

### Install Dependencies

```bash
npm install
```

### Build Caption Engine

First, navigate to the `caption-engine` folder and execute the following command to create a virtual environment:

```bash
python -m venv subenv
```

Then activate the virtual environment:

```bash
# Windows
subenv/Scripts/activate
# Linux
source subenv/bin/activate
```

Next, install the dependencies (note that if you are in a Linux environment, you should comment out `PyAudioWPatch` in `requirements.txt`, as this module is only applicable to the Windows environment):

```bash
pip install -r requirements.txt
```

Then build the project using `pyinstaller`:

```bash
pyinstaller --onefile main-gummy.py
```

At this point, the project is built. You can find the executable file in the `caption-engine/dist` folder and proceed with further operations.

### Run the Project

```bash
npm run dev
```
### Build the Project

Note that the software is currently not adapted for the macOS platform. Please use Windows or Linux systems for building, with Windows being more recommended due to its full functionality.

```bash
# For Windows
npm run build:win
# For macOS, not avaliable yet
npm run build:mac
# For Linux
npm run build:linux
```
