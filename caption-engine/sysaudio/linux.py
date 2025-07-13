"""获取 Linux 系统音频输入流"""

import subprocess

def findMonitorSource():
    result = subprocess.run(
        ["pactl", "list", "short", "sources"],
        stdout=subprocess.PIPE, text=True
    )
    lines = result.stdout.splitlines()

    for line in lines:
        parts = line.split('\t')
        if len(parts) >= 2 and ".monitor" in parts[1]:
            return parts[1]

    raise RuntimeError("System output monitor device not found")

def findInputSource():
    result = subprocess.run(
        ["pactl", "list", "short", "sources"],
        stdout=subprocess.PIPE, text=True
    )
    lines = result.stdout.splitlines()

    for line in lines:
        parts = line.split('\t')
        name = parts[1]
        if ".monitor" not in name:
            return name
    raise RuntimeError("Microphone input device not found")

class AudioStream:
    """
    获取系统音频流

    初始化参数：
        audio_type: 0-系统音频输出流（不支持，不会生效），1-系统音频输入流（默认）
        chunk_rate: 每秒采集音频块的数量，默认为20
    """
    def __init__(self, audio_type=1,  chunk_rate=20):
        self.audio_type = audio_type

        if self.audio_type == 0:
            self.source = findMonitorSource()
        else:
            self.source = findInputSource()

        self.process = None

        self.SAMP_WIDTH = 2
        self.FORMAT = 16
        self.CHANNELS = 2
        self.RATE = 48000
        self.CHUNK = self.RATE // chunk_rate

    def printInfo(self):
        dev_info = f"""
        音频捕获进程：
            - 捕获类型：{"音频输出" if self.audio_type == 0 else "音频输入"}
            - 设备源：{self.source}
            - 捕获进程PID：{self.process.pid if self.process else "None"}

        音频样本块大小：{self.CHUNK}
        样本位宽：{self.SAMP_WIDTH}
        采样格式：{self.FORMAT}
        音频通道数：{self.CHANNELS}
        音频采样率：{self.RATE}
        """
        print(dev_info)

    def openStream(self):
        """
        启动音频捕获进程
        """
        self.process = subprocess.Popen(
            ["parec", "-d", self.source, "--format=s16le", "--rate=48000", "--channels=2"],
            stdout=subprocess.PIPE
        )

    def read_chunk(self):
        """
        读取音频数据
        """
        if self.process:
            return self.process.stdout.read(self.CHUNK)
        return None

    def closeStream(self):
        """
        关闭系统音频捕获进程
        """
        if self.process:
            self.process.terminate()
