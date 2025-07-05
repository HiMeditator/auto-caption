# Caption Engine Documentation

![](../../assets/media/structure_en.png)

## Introduction to the Caption Engine

The so-called caption engine is actually a subprocess that fetches real-time streaming audio data from system audio input (recording) or output (playing sound) and calls an audio-to-text model to generate captions for the corresponding audio. The generated captions are converted into JSON formatted string data and passed to the main program via standard output (it must be ensured that the string read by the main program can be correctly interpreted as a JSON object). The main program reads and interprets the caption data, processes it, and displays it on the window.

## Features the Caption Engine Needs to Implement

### Audio Acquisition

First, your caption engine needs to acquire streaming audio data from system audio input (recording) or output (playing sound). If developing with Python, you can use the PyAudio library to get microphone audio input data (cross-platform). Use the PyAudioWPatch library to get system audio output (only applicable to Windows platform).

The acquired audio stream data is usually in the form of short audio chunks, and the size of these chunks should be adjusted according to the model. For example, Alibaba Cloud's Gummy model performs better with 0.05-second audio chunks than with 0.2-second audio chunks.

### Audio Processing

The acquired audio stream may need preprocessing before being converted to text. For instance, Alibaba Cloud's Gummy model can only recognize single-channel audio streams, while the collected audio streams are generally dual-channel, so you need to convert the dual-channel audio stream to a single channel. The conversion of channels can be achieved using methods from the NumPy library.

You can directly use the audio acquisition and processing modules I've developed (path: `caption-engine/sysaudio`):

```python
if sys.platform == 'win32':
    from sysaudio.win import AudioStream, mergeStreamChannels
elif sys.platform == 'linux':
    from sysaudio.linux import AudioStream, mergeStreamChannels
else:
    raise NotImplementedError(f"Unsupported platform: {sys.platform}")

# Create an instance of the audio stream object
stream = AudioStream(audio_type)
# Open the audio stream
stream.openStream()
while True:  # Loop to read audio data
    # Read audio data
    data = stream.stream.read(stream.CHUNK)
    # Convert dual-channel audio data to single-channel
    data = mergeStreamChannels(data, stream.CHANNELS)
    # Call the audio-to-text model
    # ... ...
```

### Audio to Text Conversion

Once you have the appropriate audio stream, you can convert it to text. Various models are typically used to achieve this. You can choose the model based on your requirements.

### Data Transmission

After obtaining the text for the current audio stream, you need to pass the text to the main program. The caption engine process passes the caption data to the Electron main process through standard output.

The content transmitted must be a JSON string, where the JSON object should include the following parameters:

```typescript
export interface CaptionItem {
  index: number, // Caption sequence number
  time_s: string, // Start time of the current caption
  time_t: string, // End time of the current caption
  text: string, // Caption content
  translation: string // Caption translation
}
```

**It is essential to ensure that every time a caption JSON data is output, the buffer is flushed, ensuring that the string received by the Electron main process each time can be interpreted as a JSON object.**

If using Python, you can refer to the following method to pass data to the main program:

```python
# caption-engine\main-gummy.py
sys.stdout.reconfigure(line_buffering=True)

# caption-engine\audio2text\gummy.py
...
    def send_to_node(self, data):
        """
        Send data to the Node.js process
        """
        try:
            json_data = json.dumps(data) + '\n'
            sys.stdout.write(json_data)
            sys.stdout.flush()
        except Exception as e:
            print(f"Error sending data to Node.js: {e}", file=sys.stderr)
...
```

The code for the data receiving end is as follows:

```typescript
// src\main\utils\engine.ts
...
    this.process.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      lines.forEach((line: string) => {
        if (line.trim()) {
          try {
            const caption = JSON.parse(line);
            addCaptionLog(caption);
          } catch (e) {
            controlWindow.sendErrorMessage('Cannot parse caption engine output as JSON object: ' + e)
            console.error('[ERROR] Error parsing JSON:', e);
          }
        }
      });
    });

    this.process.stderr.on('data', (data) => {
      controlWindow.sendErrorMessage('Caption engine error: ' + data)
      console.error(`[ERROR] Subprocess Error: ${data}`);
    });
...
```

## Code Reference

The default caption engine entry point code is located in the `main-gummy.py` file under the `caption-engine` folder of this project. The `src\main\utils\engine.ts` file contains the server-side code for acquiring and processing caption engine data. You can read and understand the implementation details and the complete runtime process of the caption engine as needed.
