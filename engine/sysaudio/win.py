"""获取 Windows 系统音频输入/输出流"""

import pyaudiowpatch as pyaudio


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


class AudioStream:
    """
    获取系统音频流

    初始化参数：
        audio_type: 0-系统音频输出流（默认），1-系统音频输入流
        chunk_rate: 每秒采集音频块的数量，默认为20
    """
    def __init__(self, audio_type=0, chunk_rate=20):
        self.audio_type = audio_type
        self.mic = pyaudio.PyAudio()
        if self.audio_type == 0:
            self.device = getDefaultLoopbackDevice(self.mic, False)
        else:
            self.device = self.mic.get_default_input_device_info()
        self.stream = None
        self.SAMP_WIDTH = pyaudio.get_sample_size(pyaudio.paInt16)
        self.FORMAT = pyaudio.paInt16
        self.CHANNELS = int(self.device["maxInputChannels"])
        self.RATE = int(self.device["defaultSampleRate"])
        self.CHUNK = self.RATE // chunk_rate
        self.INDEX = self.device["index"]

    def printInfo(self):
        dev_info = f"""
        采样设备：
            - 设备类型：{ "音频输出" if self.audio_type == 0 else "音频输入" }
            - 序号：{self.device['index']}
            - 名称：{self.device['name']}
            - 最大输入通道数：{self.device['maxInputChannels']}
            - 默认低输入延迟：{self.device['defaultLowInputLatency']}s
            - 默认高输入延迟：{self.device['defaultHighInputLatency']}s
            - 默认采样率：{self.device['defaultSampleRate']}Hz
            - 是否回环设备：{self.device['isLoopbackDevice']}

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
            channels = self.CHANNELS,
            rate = self.RATE,
            input = True,
            input_device_index = self.INDEX
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
