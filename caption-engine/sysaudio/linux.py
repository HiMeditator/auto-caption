"""获取 Linux 系统音频输入流"""

import pyaudio


class AudioStream:
    """
    获取系统音频流

    初始化参数：
        audio_type: 0-系统音频输出流（不支持，不会生效），1-系统音频输入流（默认）
        chunk_rate: 每秒采集音频块的数量，默认为20
    """
    def __init__(self, audio_type=1,  chunk_rate=20):
        self.audio_type = audio_type
        self.mic = pyaudio.PyAudio()
        self.device = self.mic.get_default_input_device_info()
        self.stream = None
        self.SAMP_WIDTH = pyaudio.get_sample_size(pyaudio.paInt16)
        self.FORMAT = pyaudio.paInt16
        self.CHANNELS = self.device["maxInputChannels"]
        self.RATE = int(self.device["defaultSampleRate"])
        self.CHUNK = self.RATE // chunk_rate
        self.INDEX = self.device["index"]

    def printInfo(self):
        dev_info = f"""
        采样输入设备：
            - 设备类型：{ "音频输入（Linux平台目前仅支持该项）" }
            - 序号：{self.device['index']}
            - 名称：{self.device['name']}
            - 最大输入通道数：{self.device['maxInputChannels']}
            - 默认低输入延迟：{self.device['defaultLowInputLatency']}s
            - 默认高输入延迟：{self.device['defaultHighInputLatency']}s
            - 默认采样率：{self.device['defaultSampleRate']}Hz

        音频样本块大小：{self.CHUNK}
        样本位宽：{self.SAMP_WIDTH}
        采样格式：{self.FORMAT}
        音频通道数：{self.CHANNELS}
        音频采样率：{self.RATE}
        """
        print(dev_info)

    def openStream(self):
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
        if not self.stream: return None
        return self.stream.read(self.CHUNK)

    def closeStream(self):
        """
        关闭系统音频输出流
        """
        if self.stream is None: return
        self.stream.stop_stream()
        self.stream.close()
        self.stream = None
