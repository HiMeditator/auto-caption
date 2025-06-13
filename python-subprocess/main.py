from sysaudio.win import getDefaultLoopbackDevice
from audio2text.gummy import getGummpyTranslator
import pyaudiowpatch as pyaudio
import numpy as np

mic = pyaudio.PyAudio()
loopback = getDefaultLoopbackDevice(mic)

SAMP_WIDTH = pyaudio.get_sample_size(pyaudio.paInt16)
FORMAT = pyaudio.paInt16
CHANNELS = loopback["maxInputChannels"]
RATE = int(loopback["defaultSampleRate"])
CHUNK = RATE // 10
INDEX = loopback["index"]


RECORD_SECONDS = 20 # 监听时长(s)

stream = mic.open(
    format = FORMAT,
    channels = CHANNELS,
    rate = RATE,
    input = True,
    input_device_index = INDEX
)

translator = getGummpyTranslator(rate=RATE)
translator.start()

for i in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
    data = stream.read(CHUNK)
    data_np = np.frombuffer(data, dtype=np.int16)
    data_np_r = data_np.reshape(-1, CHANNELS)
    mono_data = np.mean(data_np_r.astype(np.float32), axis=1)
    mono_data = mono_data.astype(np.int16)
    mono_data_bytes = mono_data.tobytes()
    translator.send_audio_frame(mono_data_bytes)

translator.stop()
stream.stop_stream()
stream.close()