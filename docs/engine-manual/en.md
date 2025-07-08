# Caption Engine Documentation

Corresponding Version: v0.3.0

![](../../assets/media/structure_en.png)

## Introduction to the Caption Engine

The so-called caption engine is actually a subprogram that captures real-time streaming data from the system's audio input (recording) or output (playing sound) and calls an audio-to-text model to generate captions for the corresponding audio. The generated captions are converted into a JSON-formatted string and passed to the main program through standard output (it must be ensured that the string read by the main program can be correctly interpreted as a JSON object). The main program reads and interprets the caption data, processes it, and then displays it on the window.

## Functions Required by the Caption Engine

### Audio Acquisition

First, your caption engine needs to capture streaming data from the system's audio input (recording) or output (playing sound). If using Python for development, you can use the PyAudio library to obtain microphone audio input data (cross-platform). Use the PyAudioWPatch library to get system audio output (Windows platform only).

Generally, the captured audio stream data consists of short audio chunks, and the size of these chunks should be adjusted according to the model. For example, Alibaba Cloud's Gummy model performs better with 0.05-second audio chunks compared to 0.2-second ones.

### Audio Processing

The acquired audio stream may need preprocessing before being converted to text. For instance, Alibaba Cloud's Gummy model can only recognize single-channel audio streams, while the collected audio streams are typically dual-channel, thus requiring conversion from dual-channel to single-channel. Channel conversion can be achieved using methods in the NumPy library.

You can directly use the audio acquisition (`caption-engine/sysaudio`) and audio processing (`caption-engine/audioprcs`) modules I have developed.

### Audio to Text Conversion

After obtaining the appropriate audio stream, you can convert it into text. This is generally done using various models based on your requirements.

A nearly complete implementation of a caption engine is as follows:

```python
import sys
import argparse

# Import system audio acquisition module
if sys.platform == 'win32':
    from sysaudio.win import AudioStream
elif sys.platform == 'darwin':
    from sysaudio.darwin import AudioStream
elif sys.platform == 'linux':
    from sysaudio.linux import AudioStream
else:
    raise NotImplementedError(f"Unsupported platform: {sys.platform}")

# Import audio processing functions
from audioprcs import mergeChunkChannels
# Import audio-to-text module
from audio2text import InvalidParameter, GummyTranslator


def convert_audio_to_text(s_lang, t_lang, audio_type, chunk_rate, api_key):
    # Set standard output to line buffering
    sys.stdout.reconfigure(line_buffering=True) # type: ignore

    # Create instances for audio acquisition and speech-to-text
    stream = AudioStream(audio_type, chunk_rate)
    if t_lang == 'none':
        gummy = GummyTranslator(stream.RATE, s_lang, None, api_key)
    else:
        gummy = GummyTranslator(stream.RATE, s_lang, t_lang, api_key)

    # Start instances
    stream.openStream()
    gummy.start()

    while True:
        try:
            # Read audio stream data
            chunk = stream.read_chunk()
            chunk_mono = mergeChunkChannels(chunk, stream.CHANNELS)
            try:
                # Call the model for translation
                gummy.send_audio_frame(chunk_mono)
            except InvalidParameter:
                gummy.start()
                gummy.send_audio_frame(chunk_mono)
        except KeyboardInterrupt:
            stream.closeStream()
            gummy.stop()
            break
```

### Data Transmission

After obtaining the text of the current audio stream, it needs to be transmitted to the main program. The caption engine process passes the caption data to the Electron main process through standard output.

The content transmitted must be a JSON string, where the JSON object must contain the following parameters:

```typescript
export interface CaptionItem {
  index: number, // Caption sequence number
  time_s: string, // Caption start time
  time_t: string, // Caption end time
  text: string, // Caption content
  translation: string // Caption translation
}
```

**It is essential to ensure that each time we output caption JSON data, the buffer is flushed, ensuring that the string received by the Electron main process can always be interpreted as a JSON object.**

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

Data receiver code is as follows:


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
            controlWindow.sendErrorMessage('Unable to parse the output from the caption engine as a JSON object: ' + e)
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

## Reference Code

The `main-gummy.py` file under the `caption-engine` folder in this project serves as the entry point for the default caption engine. The `src\main\utils\engine.ts` file contains the server-side code for acquiring and processing data from the caption engine. You can read and understand the implementation details and the complete execution process of the caption engine as needed.