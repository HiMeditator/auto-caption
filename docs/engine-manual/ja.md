# 字幕エンジンの説明文書

対応バージョン：v0.3.0

この文書は大規模モデルを使用して翻訳されていますので、内容に正確でない部分があるかもしれません。

![](../../assets/media/structure_ja.png)

## 字幕エンジンの紹介

所謂字幕エンジンは実際にはサブプログラムであり、システムの音声入力（録音）または出力（音声再生）のストリーミングデータをリアルタイムで取得し、音声からテキストへの変換モデルを使って対応する音声の字幕を生成します。生成された字幕はJSON形式の文字列データに変換され、標準出力を通じてメインプログラムに渡されます（メインプログラムが読み取った文字列が正しいJSONオブジェクトとして解釈されることが保証される必要があります）。メインプログラムは字幕データを読み取り、解釈して処理し、ウィンドウ上に表示します。

## 字幕エンジンが必要な機能

### 音声の取得

まず、あなたの字幕エンジンはシステムの音声入力（録音）または出力（音声再生）のストリーミングデータを取得する必要があります。Pythonを使用して開発する場合、PyAudioライブラリを使ってマイクからの音声入力データを取得できます（全プラットフォーム共通）。また、WindowsプラットフォームではPyAudioWPatchライブラリを使ってシステムの音声出力を取得することもできます。

一般的に取得される音声ストリームデータは、比較的短い時間間隔の音声ブロックで構成されています。モデルに合わせて音声ブロックのサイズを調整する必要があります。例えば、アリババクラウドのGummyモデルでは、0.05秒の音声ブロックを使用した認識結果の方が0.2秒の音声ブロックよりも優れています。

### 音声の処理

取得した音声ストリームは、テキストに変換する前に前処理が必要な場合があります。例えば、アリババクラウドのGummyモデルは単一チャンネルの音声ストリームしか認識できませんが、収集された音声ストリームは通常二重チャンネルであるため、二重チャンネルの音声ストリームを単一チャンネルに変換する必要があります。チャンネル数の変換はNumPyライブラリのメソッドを使って行うことができます。

あなたは私によって開発された音声の取得（`caption-engine/sysaudio`）と音声の処理（`caption-engine/audioprcs`）モジュールを直接使用することができます。

### 音声からテキストへの変換

適切な音声ストリームを得た後、それをテキストに変換することができます。通常、様々なモデルを使って音声ストリームをテキストに変換します。必要に応じてモデルを選択することができます。

ほぼ完全な字幕エンジンの実装例：

```python
import sys
import argparse

# システム音声の取得に関する設定
if sys.platform == 'win32':
    from sysaudio.win import AudioStream
elif sys.platform == 'darwin':
    from sysaudio.darwin import AudioStream
elif sys.platform == 'linux':
    from sysaudio.linux import AudioStream
else:
    raise NotImplementedError(f"Unsupported platform: {sys.platform}")

# 音声処理関数のインポート
from audioprcs import mergeChunkChannels
# 音声からテキストへの変換モジュールのインポート
from audio2text import InvalidParameter, GummyTranslator


def convert_audio_to_text(s_lang, t_lang, audio_type, chunk_rate, api_key):
    # 標準出力をラインバッファリングに設定
    sys.stdout.reconfigure(line_buffering=True) # type: ignore

    # 音声の取得と音声からテキストへの変換のインスタンスを作成
    stream = AudioStream(audio_type, chunk_rate)
    if t_lang == 'none':
        gummy = GummyTranslator(stream.RATE, s_lang, None, api_key)
    else:
        gummy = GummyTranslator(stream.RATE, s_lang, t_lang, api_key)

    # インスタンスを開始
    stream.openStream()
    gummy.start()

    while True:
        try:
            # 音声ストリームデータを読み込む
            chunk = stream.read_chunk()
            chunk_mono = mergeChunkChannels(chunk, stream.CHANNELS)
            try:
                # モデルを使って翻訳を行う
                gummy.send_audio_frame(chunk_mono)
            except InvalidParameter:
                gummy.start()
                gummy.send_audio_frame(chunk_mono)
        except KeyboardInterrupt:
            stream.closeStream()
            gummy.stop()
            break
```

### データの伝送

現在の音声ストリームのテキストを得たら、それをメインプログラムに渡す必要があります。字幕エンジンプロセスは標準出力を通じて電子メール主プロセスに字幕データを渡します。

渡す内容はJSON文字列でなければなりません。JSONオブジェクトには以下のパラメータを含める必要があります：

```typescript
export interface CaptionItem {
  index: number, // 字幕番号
  time_s: string, // 現在の字幕開始時間
  time_t: string, // 現在の字幕終了時間
  text: string, // 字幕内容
  translation: string // 字幕翻訳
}
```

**必ず、字幕JSONデータを出力するたびにバッファをフラッシュし、electron主プロセスが受け取る文字列が常にJSONオブジェクトとして解釈できるようにする必要があります。**

Python言語を使用する場合、以下の方法でデータをメインプログラムに渡すことができます：

```python
# caption-engine\main-gummy.py
sys.stdout.reconfigure(line_buffering=True)

# caption-engine\audio2text\gummy.py
...
    def send_to_node(self, data):
        """
        Node.jsプロセスにデータを送信する
        """
        try:
            json_data = json.dumps(data) + '\n'
            sys.stdout.write(json_data)
            sys.stdout.flush()
        except Exception as e:
            print(f"Error sending data to Node.js: {e}", file=sys.stderr)
...
```

データ受信側のコードは