# Caption Engine Documentation  

Corresponding Version: v0.6.0  

![](../../assets/media/structure_en.png)  

## Introduction to the Caption Engine  

The so-called caption engine is essentially a subprogram that continuously captures real-time streaming data from the system's audio input (microphone) or output (speakers) and invokes an audio-to-text model to generate corresponding captions for the audio. The generated captions are converted into JSON-formatted string data and passed to the main program via standard output (ensuring the string can be correctly interpreted as a JSON object by the main program). The main program reads and interprets the caption data, processes it, and displays it in the window.  

**The communication standard between the caption engine process and the Electron main process is: [caption engine api-doc](../api-docs/caption-engine.md).**  

## Workflow  

The communication flow between the main process and the caption engine:  

### Starting the Engine  

- **Main Process**: Uses `child_process.spawn()` to launch the caption engine process.  
- **Caption Engine Process**: Creates a TCP Socket server thread. After creation, it outputs a JSON object string via standard output, containing a `command` field with the value `connect`.  
- **Main Process**: Monitors the standard output of the caption engine process, attempts to split it line by line, parses it into a JSON object, and checks if the `command` field value is `connect`. If so, it connects to the TCP Socket server.  

### Caption Recognition  

- **Caption Engine Process**: The main thread monitors system audio output, sends audio data chunks to the caption engine for parsing, and outputs the parsed caption data object strings via standard output.  
- **Main Process**: Continues to monitor the standard output of the caption engine and performs different operations based on the `command` field of the parsed object.  

### Closing the Engine  

- **Main Process**: When the user closes the caption engine via the frontend, the main process sends a JSON object string with the `command` field set to `stop` to the caption engine process via Socket communication.  
- **Caption Engine Process**: Receives the object string, parses it, and if the `command` field is `stop`, sets the global variable `thread_data.status` to `stop`.  
- **Caption Engine Process**: The main thread's loop for monitoring system audio output ends when `thread_data.status` is not `running`, releases resources, and terminates.  
- **Main Process**: Detects the termination of the caption engine process, performs corresponding cleanup, and provides feedback to the frontend.  

## Implemented Features  

The following features are already implemented and can be reused directly.  

### Standard Output  

Supports printing general information, commands, and error messages.  

Example:  

```python  
from utils import stdout, stdout_cmd, stdout_obj, stderr  
stdout("Hello") # {"command": "print", "content": "Hello"}\n  
stdout_cmd("connect", "8080") # {"command": "connect", "content": "8080"}\n  
stdout_obj({"command": "print", "content": "Hello"})  
stderr("Error Info")  
```  

### Creating a Socket Service  

This Socket service listens on a specified port, parses content sent by the Electron main program, and may modify the value of `thread_data.status`.  

Example:  

```python  
from utils import start_server  
from utils import thread_data  
port = 8080  
start_server(port)  
while thread_data == 'running':  
    # do something  
    pass  
```  

### Audio Capture  

The `AudioStream` class captures audio data and is cross-platform, supporting Windows, Linux, and macOS. Its initialization includes two parameters:  

- `audio_type`: The type of audio to capture. `0` for system output audio (speakers), `1` for system input audio (microphone).  
- `chunk_rate`: The frequency of audio data capture, i.e., the number of audio chunks captured per second.  

The class includes three methods:  

- `open_stream()`: Starts audio capture.  
- `read_chunk() -> bytes`: Reads an audio chunk.  
- `close_stream()`: Stops audio capture.  

Example:  

```python  
from sysaudio import AudioStream  
audio_type = 0  
chunk_rate = 20  
stream = AudioStream(audio_type, chunk_rate)  
stream.open_stream()  
while True:  
    data = stream.read_chunk()  
    # do something with data  
    pass  
stream.close_stream()  
```  

### Audio Processing  

The captured audio stream may require preprocessing before conversion to text. Typically, multi-channel audio needs to be converted to mono, and resampling may be necessary. This project provides three audio processing functions:  

- `merge_chunk_channels(chunk: bytes, channels: int) -> bytes`: Converts a multi-channel audio chunk to mono.  
- `resample_chunk_mono(chunk: bytes, channels: int, orig_sr: int, target_sr: int, mode="sinc_best") -> bytes`: Converts a multi-channel audio chunk to mono and resamples it.  
- `resample_mono_chunk(chunk: bytes, orig_sr: int, target_sr: int, mode="sinc_best") -> bytes`: Resamples a mono audio chunk.  

## Features to Be Implemented in the Caption Engine  

### Audio-to-Text Conversion  

After obtaining a suitable audio stream, it needs to be converted to text. Typically, various models (cloud-based or local) are used for this purpose. Choose the appropriate model based on requirements.  

This part is recommended to be encapsulated as a class with three methods:  

- `start(self)`: Starts the model.  
- `send_audio_frame(self, data: bytes)`: Processes the current audio chunk data. **The generated caption data is sent to the Electron main process via standard output.**  
- `stop(self)`: Stops the model.  

Complete caption engine examples:  

- [gummy.py](../../engine/audio2text/gummy.py)  
- [vosk.py](../../engine/audio2text/vosk.py)  

### Caption Translation  

Some speech-to-text models do not provide translation. If needed, a translation module must be added.  

### Sending Caption Data  

After obtaining the text for the current audio stream, it must be sent to the main program. The caption engine process passes caption data to the Electron main process via standard output.  

The content must be a JSON string, with the JSON object including the following parameters:  

```typescript  
export interface CaptionItem {  
  command: "caption",  
  index: number, // Caption sequence number  
  time_s: string, // Start time of the current caption  
  time_t: string, // End time of the current caption  
  text: string, // Caption content  
  translation: string // Caption translation  
}  
```  

**Note: Ensure the buffer is flushed after each JSON output to guarantee the Electron main process receives a string that can be parsed as a JSON object.**  

It is recommended to use the project's `stdout_obj` function for sending.  

### Command-Line Parameter Specification  

Custom caption engine settings are provided via command-line arguments. The current project uses the following parameters:  

```python  
import argparse  
if __name__ == "__main__":  
    parser = argparse.ArgumentParser(description='Convert system audio stream to text')  
    # Common parameters  
    parser.add_argument('-e', '--caption_engine', default='gummy', help='Caption engine: gummy or vosk')  
    parser.add_argument('-a', '--audio_type', default=0, help='Audio stream source: 0 for output, 1 for input')  
    parser.add_argument('-c', '--chunk_rate', default=10, help='Number of audio stream chunks collected per second')  
    parser.add_argument('-p', '--port', default=8080, help='The port to run the server on, 0 for no server')  
    # Gummy-specific parameters  
    parser.add_argument('-s', '--source_language', default='en', help='Source language code')  
    parser.add_argument('-t', '--target_language', default='zh', help='Target language code')  
    parser.add_argument('-k', '--api_key', default='', help='API KEY for Gummy model')  
    # Vosk-specific parameters  
    parser.add_argument('-m', '--model_path', default='', help='The path to the vosk model.')  
```  

For example, to use the Gummy model with Japanese as the source language, Chinese as the target language, and system audio output captions with 0.1s audio chunks, the command-line arguments would be:  

```bash  
python main.py -e gummy -s ja -t zh -a 0 -c 10 -k <dashscope-api-key>  
```  

## Additional Notes  

### Communication Standards  

[caption engine api-doc](../api-docs/caption-engine.md)  

### Program Entry  

[main.py](../../engine/main.py)  

### Development Recommendations  

Apart from audio-to-text conversion, it is recommended to reuse the existing code. In this case, the following additions are needed:  

- `engine/audio2text/`: Add a new audio-to-text class (file-level).  
- `engine/main.py`: Add new parameter settings and workflow functions (refer to `main_gummy` and `main_vosk` functions).  

### Packaging  

After development and testing, the caption engine must be packaged into an executable. Typically, `pyinstaller` is used. If the packaged executable reports errors, check for missing dependencies.  

### Execution  

With a functional caption engine, it can be launched in the caption software window by specifying the engine's path and runtime arguments.  

![](../img/02_en.png)  