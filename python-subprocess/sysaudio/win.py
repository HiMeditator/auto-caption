"""获取 Windows 系统音频输出流"""

import pyaudiowpatch as pyaudio
import numpy as np


def getDefaultLoopbackDevice(mic: pyaudio.PyAudio, info = True)->dict:
    """
    获取默认的系统音频输出的回环设备
    Args:
        mic (pyaudio.PyAudio): pyaudio对象
        info (bool, optional): 是否打印设备信息

    Returns:
        dict: 系统音频输出的回环设备
    """
    try:
        WASAPI_info = mic.get_host_api_info_by_type(pyaudio.paWASAPI)
    except OSError:
        print("Looks like WASAPI is not available on the system. Exiting...")
        exit()

    default_speaker = mic.get_device_info_by_index(WASAPI_info["defaultOutputDevice"])
    if(info): print("wasapi_info:\n", WASAPI_info, "\n")
    if(info): print("default_speaker:\n", default_speaker, "\n")

    if not default_speaker["isLoopbackDevice"]:
        for loopback in mic.get_loopback_device_info_generator():
            if default_speaker["name"] in loopback["name"]:
                default_speaker = loopback
                if(info): print("Using loopback device:\n", default_speaker, "\n")
                break
        else:
            print("Default loopback output device not found.")
            print("Run `python -m pyaudiowpatch` to check available devices.")
            print("Exiting...")
            exit()
            
    if(info): print(f"Output Stream Device: #{default_speaker['index']} {default_speaker['name']}")
    return default_speaker


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

class LoopbackStream:
    def __init__(self):
        self.mic = pyaudio.PyAudio()
        self.loopback = getDefaultLoopbackDevice(self.mic, False)
        self.stream = None
        self.SAMP_WIDTH = pyaudio.get_sample_size(pyaudio.paInt16)
        self.FORMAT = pyaudio.paInt16
        self.CHANNELS = self.loopback["maxInputChannels"]
        self.RATE = int(self.loopback["defaultSampleRate"])
        self.CHUNK = self.RATE // 20
        self.INDEX = self.loopback["index"]

    def printInfo(self):
        dev_info = f"""
        采样输入设备：
            - 序号：{self.loopback['index']}
            - 名称：{self.loopback['name']}
            - 最大输入通道数：{self.loopback['maxInputChannels']}
            - 默认低输入延迟：{self.loopback['defaultLowInputLatency']}s
            - 默认高输入延迟：{self.loopback['defaultHighInputLatency']}s
            - 默认采样率：{self.loopback['defaultSampleRate']}Hz
            - 是否回环设备：{self.loopback['isLoopbackDevice']}

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