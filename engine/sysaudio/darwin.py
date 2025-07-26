"""获取 MacOS 系统音频输入/输出流"""

import pyaudio
from textwrap import dedent


def get_blackhole_device(mic: pyaudio.PyAudio):
    """
    获取 BlackHole 设备
    """
    device_count = mic.get_device_count()
    for i in range(device_count):
        dev_info = mic.get_device_info_by_index(i)
        if 'blackhole' in str(dev_info["name"]).lower():    
            return dev_info
    raise Exception("The device containing BlackHole was not found.")


class AudioStream:
    """
    获取系统音频流（如果要捕获输出音频，仅支持 BlackHole 作为系统音频输出捕获）

    初始化参数：
        audio_type: 0-系统音频输出流（需配合 BlackHole），1-系统音频输入流
        chunk_rate: 每秒采集音频块的数量，默认为20
    """
    def __init__(self, audio_type=0, chunk_rate=20):
        self.audio_type = audio_type
        self.mic = pyaudio.PyAudio()
        if self.audio_type == 0:
            self.device = get_blackhole_device(self.mic)
        else:
            self.device = self.mic.get_default_input_device_info()
        self.stop_signal = False
        self.stream = None
        self.INDEX = self.device["index"]
        self.FORMAT = pyaudio.paInt16
        self.SAMP_WIDTH = pyaudio.get_sample_size(self.FORMAT)
        self.CHANNELS = int(self.device["maxInputChannels"])
        self.RATE = int(self.device["defaultSampleRate"])
        self.CHUNK = self.RATE // chunk_rate

    def get_info(self):
        dev_info = f"""
        采样设备：
            - 设备类型：{ "音频输出" if self.audio_type == 0 else "音频输入" }
            - 设备序号：{self.device['index']}
            - 设备名称：{self.device['name']}
            - 最大输入通道数：{self.device['maxInputChannels']}
            - 默认低输入延迟：{self.device['defaultLowInputLatency']}s
            - 默认高输入延迟：{self.device['defaultHighInputLatency']}s
            - 默认采样率：{self.device['defaultSampleRate']}Hz
            - 是否回环设备：{self.device['isLoopbackDevice']}

        设备序号：{self.INDEX}
        样本格式：{self.FORMAT}
        样本位宽：{self.SAMP_WIDTH}
        样本通道数：{self.CHANNELS}
        样本采样率：{self.RATE}
        样本块大小：{self.CHUNK}
        """
        return dedent(dev_info).strip()

    def open_stream(self):
        """
        打开并返回系统音频输出流
        """
        if self.stream: return self.stream
        self.stream = self.mic.open(
            format = self.FORMAT,
            channels = int(self.CHANNELS),
            rate = self.RATE,
            input = True,
            input_device_index = int(self.INDEX)
        )
        return self.stream

    def read_chunk(self):
        """
        读取音频数据
        """
        if self.stop_signal:
            self.close_stream()
            return None
        if not self.stream: return None
        return self.stream.read(self.CHUNK, exception_on_overflow=False)

    def close_stream_signal(self):
        """
        线程安全的关闭系统音频输入流，不一定会立即关闭
        """
        self.stop_signal = True

    def close_stream(self):
        """
        立即关闭系统音频输入流
        """
        if self.stream is not None:
            self.stream.stop_stream()
            self.stream.close()
            self.stream = None
        self.stop_signal = False
