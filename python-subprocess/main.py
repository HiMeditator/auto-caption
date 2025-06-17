import asyncio
from sysaudio.win import LoopbackStream, mergeStreamChannels
from audio2text.gummy import GummyTranslator

def main():
    loopback = LoopbackStream()
    loopback.openStream()

    gummy = GummyTranslator(loopback.RATE, "zh", "en")
    gummy.translator.start()

    try:
        for _ in range(0, 400):
            if not loopback.stream: continue
            data = loopback.stream.read(loopback.CHUNK)
            data = mergeStreamChannels(data, loopback.CHANNELS)
            gummy.translator.send_audio_frame(data)
    finally:
        gummy.translator.stop()
        loopback.closeStream()

if __name__ == "__main__":
    main()