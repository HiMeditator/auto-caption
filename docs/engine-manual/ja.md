# キャプションエンジンの説明文書

![](../../assets/media/structure_ja.png)

この文書は大規模モデルを使用して翻訳されていますので、内容に正確でない部分があるかもしれません。

## キャプションエンジンの紹介

キャプションエンジンとは、実際にはサブプログラムであり、システムの音声入力（録音）または出力（音声再生）のストリーミングデータをリアルタイムで取得し、音声をテキストに変換するモデルを呼び出して対応する音声のキャプションを生成します。生成されたキャプションはJSON形式の文字列データに変換され、標準出力を通じてメインプログラムに渡されます（メインプログラムが読み取った文字列がJSONオブジェクトとして正しく解釈できるようにする必要があります）。メインプログラムはキャプションデータを読み取り、解釈し、処理してウィンドウ上に表示します。

## キャプションエンジンが必要とする機能

### 音声の取得

まず、あなたのキャプションエンジンはシステムの音声入力（録音）または出力（音声再生）のストリーミングデータを取得する必要があります。Pythonを使用して開発する場合、PyAudioライブラリを使用してマイクからの音声入力データを取得できます（全プラットフォーム対応）。PyAudioWPatchライブラリを使用してシステムの音声出力を取得することができます（Windowsプラットフォームのみ対応）。

一般的に取得される音声ストリームデータは、比較的短い時間の音声ブロックで構成されています。モデルに合わせて音声ブロックのサイズを調整する必要があります。例えば、アリババクラウドのGummyモデルでは、0.05秒の音声ブロックを使用した認識精度が0.2秒の音声ブロックよりも優れています。

### 音声の処理

取得した音声ストリームは、テキストに変換する前に前処理を行う必要があるかもしれません。例えば、アリババクラウドのGummyモデルは単一チャンネルの音声ストリームしか認識できませんが、収集された音声ストリームは通常二重チャンネルです。そのため、二重チャンネルの音声ストリームを単一チャンネルに変換する必要があります。チャンネル数の変換はNumPyライブラリのメソッドを使用して行うことができます。

既に開発済みの音声取得と音声処理モジュール（パス：`caption-engine/sysaudio`）を使用することもできます：

```python
if sys.platform == 'win32':
    from sysaudio.win import AudioStream, mergeStreamChannels
elif sys.platform == 'linux':
    from sysaudio.linux import AudioStream, mergeStreamChannels
else:
    raise NotImplementedError(f"サポートされていないプラットフォーム: {sys.platform}")

# 音声ストリームオブジェクトのインスタンスを作成
stream = AudioStream(audio_type)
# 音声ストリームを開く
stream.openStream()
while True:  # 音声データを繰り返し読み込む
    # 音声データを読み込む
    data = stream.stream.read(stream.CHUNK)
    # 二重チャンネルの音声データを単一チャンネルに変換
    data = mergeStreamChannels(data, stream.CHANNELS)
    # 音声をテキストに変換するモデルを呼び出す
    # ... ...
```

### 音声からテキストへの変換

適切な音声ストリームを得た後、それをテキストに変換することができます。通常、様々なモデルを使用してこの変換を行います。必要に応じてモデルを選択してください。

### データの伝送

現在の音声ストリームのテキストを取得したら、それをメインプログラムに伝送する必要があります。キャプションエンジンプロセスは標準出力を通じてキャプションデータをElectronのメインプロセスに伝送します。

伝送する内容はJSON文字列でなければならず、JSONオブジェクトには以下のパラメータを含める必要があります：

```typescript
export interface CaptionItem {
  index: number, // キャプション番号
  time_s: string, // 現在のキャプションの開始時間
  time_t: string, // 現在のキャプションの終了時間
  text: string, // キャプションの内容
  translation: string // キャプションの翻訳
}
```

**注意：キャプションJSONデータを出力するたびに必ずバッファをフラッシュし、Electronのメインプロセスが受け取る文字列が常にJSONオブジェクトとして解釈できるようにする必要があります。**

Pythonを使用する場合、以下のようにデータをメインプログラムに伝送できます：

```python
# caption-engine\main-gummy.py
sys.stdout.reconfigure(line_buffering=True)

# caption-engine\audio2text\gummy.py
...
    def send_to_node(self, data):
        """
        データをNode.jsプロセスに送信
        """
        try:
            json_data = json.dumps(data) + '\n'
            sys.stdout.write(json_data)
            sys.stdout.flush()
        except Exception as e:
            print(f"Node.jsへのデータ送信エラー: {e}", file=sys.stderr)
...
```

データ受信側のコードは以下の通りです：

```typescript
// src\main\utils\engine.ts
...
    this.process.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      lines.forEach((line: string) => {
        if (line.trim()) {
          try {
            const caption = JSON.parse(line);
            addCaptionLog(caption);
          } catch (e) {
            controlWindow.sendErrorMessage('キャプションエンジンの出力内容がJSONオブジェクトとして解析できません: ' + e)
            console.error('[ERROR] JSON解析エラー:', e);
          }
        }
      });
    });

    this.process.stderr.on('data', (data) => {
      controlWindow.sendErrorMessage('キャプションエンジンエラー: ' + data)
      console.error(`[ERROR] サブプロセスエラー: ${data}`);
    });
...
```

## 参考コード

本プロジェクトの `caption-engine` フォルダにある `main-gummy.py` ファイルは、デフォルトのキャプションエンジンのエントリポイントコードです。`src\main\utils\engine.ts` はサーバーサイドでキャプションエンジンのデータを取得および処理するためのコードです。必要に応じて、キャプションエンジンの実装詳細と完全な実行プロセスを理解するために読み込むことができます。
