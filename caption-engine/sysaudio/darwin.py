"""获取 MacOS 系统音频输入/输出流"""

import pyaudio


class AudioStream:
    """
    获取系统音频流（支持 BlackHole 作为系统音频输出捕获）

    初始化参数：
        audio_type: 0-系统音频输出流（需配合 BlackHole），1-系统音频输入流
        chunk_rate: 每秒采集音频块的数量，默认为20
    """
    def __init__(self, audio_type=0, chunk_rate=20):
        self.audio_type = audio_type
        self.mic = pyaudio.PyAudio()
        if self.audio_type == 0:
            self.device = self.getOutputDeviceInfo()
        else:
            self.device = self.mic.get_default_input_device_info()
        self.stream = None
        self.SAMP_WIDTH = pyaudio.get_sample_size(pyaudio.paInt16)
        self.FORMAT = pyaudio.paInt16
        self.CHANNELS = self.device["maxInputChannels"]
        self.RATE = int(self.device["defaultSampleRate"])
        self.CHUNK = self.RATE // chunk_rate
        self.INDEX = self.device["index"]

    def getOutputDeviceInfo(self):
        """查找指定关键词的输入设备"""
        device_count = self.mic.get_device_count()
        for i in range(device_count):
            dev_info = self.mic.get_device_info_by_index(i)
            if 'blackhole' in dev_info["name"].lower():    
                return dev_info
        raise Exception("The device containing BlackHole was not found.")

    def printInfo(self):
        dev_info = f"""
        采样输入设备：
            - 设备类型：{ "音频输出" if self.audio_type == 0 else "音频输入" }
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
        return self.stream.read(self.CHUNK, exception_on_overflow=False)

    def closeStream(self):
        """
        关闭系统音频输出流
        """
        if self.stream is None: return
        self.stream.stop_stream()
        self.stream.close()
        self.stream = None
