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
