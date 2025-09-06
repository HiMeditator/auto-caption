import samplerate
import numpy as np
import numpy.core.multiarray # do not remove

def merge_chunk_channels(chunk: bytes, channels: int) -> bytes:
    """
    将当前多通道音频数据块转换为单通道音频数据块

    Args:
        chunk: 多通道音频数据块
        channels: 通道数

    Returns:
        单通道音频数据块
    """
    if channels == 1: return chunk
    # (length * channels,)
    chunk_np = np.frombuffer(chunk, dtype=np.int16)
    # (length, channels)
    chunk_np = chunk_np.reshape(-1, channels)
    # (length,)
    chunk_mono_f = np.mean(chunk_np.astype(np.float32), axis=1)
    chunk_mono = np.round(chunk_mono_f).astype(np.int16)
    return chunk_mono.tobytes()


def resample_chunk_mono(chunk: bytes, channels: int, orig_sr: int, target_sr: int, mode="sinc_best") -> bytes:
    """
    将当前多通道音频数据块转换成单通道音频数据块，然后进行重采样

    Args:
        chunk: 多通道音频数据块
        channels: 通道数
        orig_sr: 原始采样率
        target_sr: 目标采样率
        mode: 重采样模式，可选：'sinc_best' | 'sinc_medium' | 'sinc_fastest' | 'zero_order_hold' | 'linear'

    Return:
        单通道音频数据块
    """
    if channels == 1:
        chunk_mono = np.frombuffer(chunk, dtype=np.int16)
        chunk_mono = chunk_mono.astype(np.float32)
    else:
        # (length * channels,)
        chunk_np = np.frombuffer(chunk, dtype=np.int16)
        # (length, channels)
        chunk_np = chunk_np.reshape(-1, channels)
        # (length,)
        chunk_mono = np.mean(chunk_np.astype(np.float32), axis=1)

    if orig_sr == target_sr:
        return chunk_mono.astype(np.int16).tobytes()
    
    ratio = target_sr / orig_sr
    chunk_mono_r = samplerate.resample(chunk_mono, ratio, converter_type=mode)
    chunk_mono_r = np.round(chunk_mono_r).astype(np.int16)
    real_len = round(chunk_mono.shape[0] * ratio)
    if(chunk_mono_r.shape[0] > real_len):
        chunk_mono_r = chunk_mono_r[:real_len]
    else:
        while chunk_mono_r.shape[0] < real_len:
            chunk_mono_r = np.append(chunk_mono_r, chunk_mono_r[-1])
    return chunk_mono_r.tobytes()


def resample_chunk_mono_np(chunk: bytes, channels: int, orig_sr: int, target_sr: int, mode="sinc_best", dtype=np.float32) -> np.ndarray:
    """
    将当前多通道音频数据块转换成单通道音频数据块，然后进行重采样，返回 Numpy 数组

    Args:
        chunk: 多通道音频数据块
        channels: 通道数
        orig_sr: 原始采样率
        target_sr: 目标采样率
        mode: 重采样模式，可选：'sinc_best' | 'sinc_medium' | 'sinc_fastest' | 'zero_order_hold' | 'linear'
        dtype: 返回 Numpy 数组的数据类型

    Return:
        单通道音频数据块
    """
    if channels == 1:
        chunk_mono = np.frombuffer(chunk, dtype=np.int16)
        chunk_mono = chunk_mono.astype(np.float32)
    else:
        # (length * channels,)
        chunk_np = np.frombuffer(chunk, dtype=np.int16)
        # (length, channels)
        chunk_np = chunk_np.reshape(-1, channels)
        # (length,)
        chunk_mono = np.mean(chunk_np.astype(np.float32), axis=1)

    if orig_sr == target_sr:
        return chunk_mono.astype(dtype)

    ratio = target_sr / orig_sr
    chunk_mono_r = samplerate.resample(chunk_mono, ratio, converter_type=mode)
    chunk_mono_r = chunk_mono_r.astype(dtype)
    real_len = round(chunk_mono.shape[0] * ratio)
    if(chunk_mono_r.shape[0] > real_len):
        chunk_mono_r = chunk_mono_r[:real_len]
    else:
        while chunk_mono_r.shape[0] < real_len:
            chunk_mono_r = np.append(chunk_mono_r, chunk_mono_r[-1])
    return chunk_mono_r


def resample_mono_chunk(chunk: bytes, orig_sr: int, target_sr: int, mode="sinc_best") -> bytes:
    """
    将当前单通道音频块进行重采样

    Args:
        chunk: 单通道音频数据块
        orig_sr: 原始采样率
        target_sr: 目标采样率
        mode: 重采样模式，可选：'sinc_best' | 'sinc_medium' | 'sinc_fastest' | 'zero_order_hold' | 'linear'

    Return:
        单通道音频数据块
    """
    if orig_sr == target_sr: return chunk
    chunk_np = np.frombuffer(chunk, dtype=np.int16)
    chunk_np = chunk_np.astype(np.float32)
    ratio = target_sr / orig_sr
    chunk_r =  samplerate.resample(chunk_np, ratio, converter_type=mode)
    chunk_r = np.round(chunk_r).astype(np.int16)
    real_len = round(chunk_np.shape[0] * ratio)
    if(chunk_r.shape[0] > real_len):
        chunk_r = chunk_r[:real_len]
    else:
        while chunk_r.shape[0] < real_len:
            chunk_r = np.append(chunk_r, chunk_r[-1])
    return chunk_r.tobytes()
