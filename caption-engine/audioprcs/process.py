import samplerate
import numpy as np

def mergeChunkChannels(chunk, channels):
    """
    将当前多通道音频数据块转换为单通道音频数据块

    Args:
        chunk: (bytes)多通道音频数据块
        channels: 通道数

    Returns:
        (bytes)单通道音频数据块
    """
    # (length * channels,)
    chunk_np = np.frombuffer(chunk, dtype=np.int16)
    # (length, channels)
    chunk_np = chunk_np.reshape(-1, channels)
    # (length,)
    chunk_mono_f = np.mean(chunk_np.astype(np.float32), axis=1)
    chunk_mono = np.round(chunk_mono_f).astype(np.int16)
    return chunk_mono.tobytes()


def resampleRawChunk(chunk, channels, orig_sr, target_sr, mode="sinc_best"):
    """
    将当前多通道音频数据块转换成单通道音频数据块，然后进行重采样

    Args:
        chunk: (bytes)多通道音频数据块
        channels: 通道数
        orig_sr: 原始采样率
        target_sr: 目标采样率
        mode: 重采样模式，可选：'sinc_best' | 'sinc_medium' | 'sinc_fastest' | 'zero_order_hold' | 'linear'

    Return:
        (bytes)单通道音频数据块
    """
    # (length * channels,)
    chunk_np = np.frombuffer(chunk, dtype=np.int16)
    # (length, channels)
    chunk_np = chunk_np.reshape(-1, channels)
    # (length,)
    chunk_mono_f = np.mean(chunk_np.astype(np.float32), axis=1)
    chunk_mono = chunk_mono_f.astype(np.int16)
    ratio = target_sr / orig_sr
    chunk_mono_r =  samplerate.resample(chunk_mono, ratio, converter_type=mode)
    chunk_mono_r = np.round(chunk_mono_r).astype(np.int16)
    return chunk_mono_r.tobytes()
