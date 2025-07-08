# Auto Caption User Manual

Corresponding Version: v0.3.0

## Software Introduction

Auto Caption is a cross-platform caption display software that can real-time capture system audio input (recording) or output (playback) streaming data and use an audio-to-text model to generate captions for the corresponding audio. The default caption engine provided by the software (using Alibaba Cloud Gummy model) supports recognition and translation in nine languages (Chinese, English, Japanese, Korean, German, French, Russian, Spanish, Italian).

Currently, the default caption engine of the software only has full functionality on Windows and macOS platforms. Additional configuration is required to capture system audio output on macOS.

On Linux platforms, it can only generate captions for audio input (microphone), and currently does not support generating captions for audio output (playback).

![](../../assets/media/main_en.png)

### Software Limitations

To use the default caption service, you need to obtain an API KEY from Alibaba Cloud.

Additional configuration is required to capture audio output on macOS platform.

The software is built using Electron, so the software size is inevitably large.

## Software Usage

### Preparing the Alibaba Cloud Model Studio API KEY

To use the default caption engine (Alibaba Cloud Gummy), you need to obtain an API KEY from the Alibaba Cloud Model Studio and configure it in your local environment variables.

**The international version of Alibaba Cloud does not provide the Gummy model, so non-Chinese users currently cannot use the default caption engine. I am trying to develop a new local caption engine to ensure that all users have access to a default caption engine.**

Alibaba Cloud provides detailed tutorials for this:

- [Obtain API KEY (Chinese)](https://help.aliyun.com/zh/model-studio/get-api-key)
- [Configure API Key in Environment Variables (Chinese)](https://help.aliyun.com/zh/model-studio/configure-api-key-through-environment-variables)

### Capturing System Audio Output on macOS

The caption engine cannot directly capture system audio output on macOS platform and requires additional driver installation. The current caption engine uses [BlackHole](https://github.com/ExistentialAudio/BlackHole). First open Terminal and execute one of the following commands (recommended to choose the first one):

```bash
brew install blackhole-2ch
brew install blackhole-16ch
brew install blackhole-64ch
```

After installation completes, open `Audio MIDI Setup` (searchable via `cmd + space`). Check if BlackHole appears in the device list - if not, restart your computer.

Once BlackHole is confirmed installed, in the `Audio MIDI Setup` page, click the plus (+) button at bottom left and select "Create Multi-Output Device". Include both BlackHole and your desired audio output destination in the outputs. Finally, set this multi-output device as your default audio output device.

Now the caption engine can capture system audio output and generate captions.

### Modifying Settings

Caption settings can be divided into three categories: general settings, caption engine settings, and caption style settings. Note that changes to general settings take effect immediately. For the other two categories, after making changes, you need to click the "Apply" option in the upper right corner of the corresponding settings module for the changes to take effect. If you click "Cancel Changes," the current modifications will not be saved and will revert to the previous state.

### Starting and Stopping Captions

After completing all configurations, click the "Start Caption Engine" button on the interface to start the captions. If you need a separate caption display window, click the "Open Caption Window" button to activate the independent caption display window. To pause caption recognition, click the "Stop Caption Engine" button.

### Adjusting the Caption Display Window

The following image shows the caption display window, which displays the latest captions in real-time. The three buttons in the upper right corner of the window have the following functions: pin the window to the front, open the caption control window, and close the caption display window. The width of the window can be adjusted by moving the mouse to the left or right edge of the window and dragging the mouse.

![](../img/01.png)

### Exporting Caption Records

In the caption control window, you can see the records of all collected captions. Click the "Export Caption Records" button to export the caption records as a JSON file.

## Caption Engine

The so-called caption engine is actually a subprocess that real-time captures system audio input (recording) or output (playback) streaming data and uses an audio-to-text model to generate captions for the corresponding audio. The generated captions are output as JSON data converted to strings and returned to the main program. The main program reads the caption data, processes it, and displays it in the window.

The software provides a default caption engine. If you need other caption engines, you can call them by enabling the custom engine option (other engines need to be developed specifically for this software). The engine path is the path to the custom caption engine on your computer, and the engine command is the runtime parameters for the custom caption engine, which need to be filled out according to the rules of the specific caption engine.

![](../img/02_en.png)

Note that when using a custom caption engine, all previous caption engine settings will be ineffective, and the configuration of the custom caption engine is entirely done through the engine command.

If you are a developer and want to develop a custom caption engine, please refer to the [Caption Engine Explanation Document](../engine-manual/en.md).
