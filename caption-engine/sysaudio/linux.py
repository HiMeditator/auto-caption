import pyaudio
import numpy as np

def mergeStreamChannels(data, channels):
    """
    将当前多通道流数据合并为单通道流数据

    Args:
        data: 多通道数据
        channels: 通道数

    Returns:
        mono_data_bytes: 单通道数据
    """
    # (length * channels,)
    data_np = np.frombuffer(data, dtype=np.int16)
    # (length, channels)
    data_np_r = data_np.reshape(-1, channels)
    # (length,)
    mono_data = np.mean(data_np_r.astype(np.float32), axis=1)
    mono_data = mono_data.astype(np.int16)
    mono_data_bytes = mono_data.tobytes()
    return mono_data_bytes


class AudioStream:
    def __init__(self, audio_type=1):
        self.audio_type = audio_type
        self.mic = pyaudio.PyAudio()
        self.device = self.mic.get_default_input_device_info()
        self.stream = None
        self.SAMP_WIDTH = pyaudio.get_sample_size(pyaudio.paInt16)
        self.FORMAT = pyaudio.paInt16
        self.CHANNELS = self.device["maxInputChannels"]
        self.RATE = int(self.device["defaultSampleRate"])
        self.CHUNK = self.RATE // 20
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
        音频数据格式：{self.FORMAT}
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
            channels = self.CHANNELS,
            rate = self.RATE,
            input = True,
            input_device_index = self.INDEX
        )
        return self.stream
    
    def closeStream(self):
        """
        关闭系统音频输出流
        """
        if self.stream is None: return
        self.stream.stop_stream()
        self.stream.close()
        self.stream = None