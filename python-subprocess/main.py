from sysaudio.win import LoopbackStream, mergeStreamChannels
from audio2text.gummy import GummyTranslator

loopback = LoopbackStream()
loopback.openStream()

gummy = GummyTranslator(loopback.RATE, "ja", "zh")
gummy.translator.start()

for i in range(0, 100):
    if not loopback.stream: continue
    data = loopback.stream.read(loopback.CHUNK)
    data = mergeStreamChannels(data, loopback.CHANNELS)
    gummy.translator.send_audio_frame(data)

gummy.translator.stop()
loopback.closeStream()