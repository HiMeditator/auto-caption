"""获取 Windows 系统音频输出流"""

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


def getOutputStream():
    mic = pyaudio.PyAudio()
    default_speaker = getDefaultLoopbackDevice(mic, False)

    stream = mic.open(
        format = pyaudio.paInt16,
        channels = default_speaker["maxInputChannels"],
        rate = int(default_speaker["defaultSampleRate"]),
        input = True,
        input_device_index = default_speaker["index"]
    )

    return stream