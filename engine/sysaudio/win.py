"""获取 Windows 系统音频输入/输出流"""

import pyaudiowpatch as pyaudio
from textwrap import dedent


def get_default_loopback_device(mic: pyaudio.PyAudio, info = True)->dict:
    """
    获取默认的系统音频输出的回环设备
    Args:
        mic: pyaudio对象
        info: 是否打印设备信息

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


class AudioStream:
    """
    获取系统音频流

    初始化参数：
        audio_type: 0-系统音频输出流（默认），1-系统音频输入流
        chunk_rate: 每秒采集音频块的数量，默认为10
    """
    def __init__(self, audio_type=0, chunk_rate=10, chunk_size=-1):
        self.audio_type = audio_type
        self.mic = pyaudio.PyAudio()
        if self.audio_type == 0:
            self.device = get_default_loopback_device(self.mic, False)
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

    def reset_chunk_size(self, chunk_size: int):
        """
        重新设置音频块大小
        """
        self.CHUNK = chunk_size

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
            channels = self.CHANNELS,
            rate = self.RATE,
            input = True,
            input_device_index = self.INDEX
        )
        return self.stream

    def read_chunk(self) -> bytes | None:
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
        关闭系统音频输入流
        """
        if self.stream is not None:
            self.stream.stop_stream()
            self.stream.close()
            self.stream = None
        self.stop_signal = False
