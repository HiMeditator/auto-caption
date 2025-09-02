<div align="center" >
    <img src="./build/icon.png" width="100px" height="100px"/>
    <h1 align="center">auto-caption</h1>
    <p>Auto Caption はクロスプラットフォームのリアルタイム字幕表示ソフトウェアです。</p>
    <p>
      <a href="https://github.com/HiMeditator/auto-caption/releases"><img src="https://img.shields.io/badge/release-0.7.0-blue"></a>
      <a href="https://github.com/HiMeditator/auto-caption/issues"><img src="https://img.shields.io/github/issues/HiMeditator/auto-caption?color=orange"></a>
      <img src="https://img.shields.io/github/languages/top/HiMeditator/auto-caption?color=royalblue">
      <img src="https://img.shields.io/github/repo-size/HiMeditator/auto-caption?color=green">
      <img src="https://img.shields.io/github/stars/HiMeditator/auto-caption?style=social">
    </p>
    <p>
        | <a href="./README.md">简体中文</a>
        | <a href="./README_en.md">English</a>
        | <b>日本語</b> |
    </p>
    <p><i>バージョン 0.7.0 がリリースされ、ソフトウェアインターフェースが最適化され、ログ記録表示機能が追加されました。ローカルの字幕エンジンは現在開発中であり、Pythonコードの形式でリリースされる予定です...</i></p>
</div>

![](./assets/media/main_ja.png)

## 📥 ダウンロード

[GitHub Releases](https://github.com/HiMeditator/auto-caption/releases)

## 📚 関連ドキュメント

[Auto Caption ユーザーマニュアル](./docs/user-manual/ja.md)

[字幕エンジン説明ドキュメント](./docs/engine-manual/ja.md)

[プロジェクト API ドキュメント（中国語）](./docs/api-docs/)

[更新履歴](./docs/CHANGELOG.md)

## ✨ 特徴

- 音声出力またはマイク入力からの字幕生成
- クロスプラットフォーム（Windows、macOS、Linux）、多言語インターフェース（中国語、英語、日本語）対応
- 豊富な字幕スタイル設定（フォント、フォントサイズ、フォント太さ、フォント色、背景色など）
- 柔軟な字幕エンジン選択（阿里雲 Gummy クラウドモデル、ローカル Vosk モデル、独自開発モデル）
- 多言語認識と翻訳（下記「⚙️ 字幕エンジン説明」参照）
- 字幕記録表示とエクスポート（`.srt` および `.json` 形式のエクスポートに対応）

## 📖 基本使い方

このソフトウェアは Windows、macOS、Linux プラットフォームに対応しています。テスト済みのプラットフォーム情報は以下の通りです：

| OS バージョン | アーキテクチャ | システムオーディオ入力 | システムオーディオ出力 |
| ------------------ | ------------ | ------------------ | ------------------- |
| Windows 11 24H2    | x64          | ✅                 | ✅                   |
| macOS Sequoia 15.5 | arm64        | ✅ [追加設定が必要](./docs/user-manual/ja.md#macos-でのシステムオーディオ出力の取得方法)    | ✅                   |
| Ubuntu 24.04.2     | x64          | ✅                 | ✅                   |
| Kali Linux 2022.3  | x64          | ✅                 | ✅                   |
| Kylin Server V10 SP3 | x64 | ✅ | ✅ |

macOS および Linux プラットフォームでシステムオーディオ出力を取得するには追加設定が必要です。詳細は[Auto Captionユーザーマニュアル](./docs/user-manual/ja.md)をご覧ください。

> 阿里雲の国際版サービスでは Gummy モデルを提供していないため、現在中国以外のユーザーは Gummy 字幕エンジンを使用できません。

デフォルトの Gummy 字幕エンジン（クラウドベースのモデルを使用した音声認識と翻訳）を使用するには、まず阿里雲百煉プラットフォームから API KEY を取得する必要があります。その後、API KEY をソフトウェア設定に追加するか、環境変数に設定します（Windows プラットフォームのみ環境変数からの API KEY 読み取りをサポート）。関連チュートリアル：

- [API KEY の取得（中国語）](https://help.aliyun.com/zh/model-studio/get-api-key)
- [環境変数を通じて API Key を設定（中国語）](https://help.aliyun.com/zh/model-studio/configure-api-key-through-environment-variables)

> Vosk モデルの認識精度は低いため、注意してご使用ください。

Vosk ローカル字幕エンジンを使用するには、まず [Vosk Models](https://alphacephei.com/vosk/models) ページから必要なモデルをダウンロードし、ローカルに解凍した後、モデルフォルダのパスをソフトウェア設定に追加してください。現在、Vosk 字幕エンジンは字幕の翻訳をサポートしていません。

![](./assets/media/vosk_ja.png)

**上記の字幕エンジンがご要望を満たさず、かつ Python の知識をお持ちの場合、独自の字幕エンジンを開発することも可能です。詳細な説明は[字幕エンジン説明書](./docs/engine-manual/ja.md)をご参照ください。**

## ⚙️ 字幕エンジン説明

現在、ソフトウェアには2つの字幕エンジンが搭載されており、新しいエンジンが計画されています。それらの詳細情報は以下の通りです。

### Gummy 字幕エンジン（クラウド）

Tongyi Lab の [Gummy 音声翻訳大規模モデル](https://help.aliyun.com/zh/model-studio/gummy-speech-recognition-translation/)をベースに開発され、[Alibaba Cloud Bailian](https://bailian.console.aliyun.com) の APIを使用してこのクラウドモデルを呼び出します。

**モデル詳細パラメータ：**

- サポートするオーディオサンプルレート：16kHz以上
- オーディオサンプルビット深度：16bit
- サポートするオーディオチャンネル：モノラル
- 認識可能な言語：中国語、英語、日本語、韓国語、ドイツ語、フランス語、ロシア語、イタリア語、スペイン語
- サポートする翻訳：
  - 中国語 → 英語、日本語、韓国語
  - 英語 → 中国語、日本語、韓国語
  - 日本語、韓国語、ドイツ語、フランス語、ロシア語、イタリア語、スペイン語 → 中国語または英語

**ネットワークトラフィック消費量：**

字幕エンジンはネイティブサンプルレート（48kHz と仮定）でサンプリングを行い、サンプルビット深度は 16bit、アップロードオーディオはモノラルチャンネルのため、アップロードレートは約：

$$
48000\ \text{samples/second} \times 2\ \text{bytes/sample} \times 1\ \text{channel}  = 93.75\ \text{KB/s}
$$

また、エンジンはオーディオストームを取得したときのみデータをアップロードするため、実際のアップロードレートはさらに小さくなる可能性があります。モデル結果の返信トラフィック消費量は小さく、ここでは考慮していません。

### Vosk字幕エンジン（ローカル）

[vosk-api](https://github.com/alphacep/vosk-api) をベースに開発されています。現在は音声に対応する原文の生成のみをサポートしており、翻訳コンテンツはサポートしていません。

### 新規計画字幕エンジン

以下は候補モデルであり、モデルの性能と統合の容易さに基づいて選択されます。

- [faster-whisper](https://github.com/SYSTRAN/faster-whisper)
- [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx)
- [SenseVoice](https://github.com/FunAudioLLM/SenseVoice)
- [FunASR](https://github.com/modelscope/FunASR)

## 🚀 プロジェクト実行

![](./assets/media/structure_ja.png)

### 依存関係のインストール

```bash
npm install
```

### 字幕エンジンの構築

まず `engine` フォルダに入り、以下のコマンドを実行して仮想環境を作成します（Python 3.10 以上が必要で、Python 3.12 が推奨されます）：

```bash
# ./engine フォルダ内
python -m venv .venv
# または
python3 -m venv .venv
```

次に仮想環境をアクティブにします：

```bash
# Windows
.venv/Scripts/activate
# Linux または macOS
source .venv/bin/activate
```

次に依存関係をインストールします（このステップでは macOS と Linux でエラーが発生する可能性があります。通常はビルド失敗によるもので、エラーメッセージに基づいて対処する必要があります）：

```bash
pip install -r requirements.txt
```

Linux システムで `samplerate` モジュールのインストールに問題が発生した場合、以下のコマンドで個別にインストールを試すことができます：

```bash
pip install samplerate --only-binary=:all:
```

その後、`pyinstaller` を使用してプロジェクトをビルドします：

```bash
pyinstaller ./main.spec
```

`main-vosk.spec` ファイル内の `vosk` ライブラリのパスが正しくない可能性があるため、実際の状況（Python 環境のバージョンに関連）に応じて設定する必要があります。

```
# Windows
vosk_path = str(Path('./.venv/Lib/site-packages/vosk').resolve())
# Linux または macOS
vosk_path = str(Path('./.venv/lib/python3.x/site-packages/vosk').resolve())
```

これでプロジェクトのビルドが完了し、`engine/dist` フォルダ内に対応する実行可能ファイルが確認できます。その後、次の操作に進むことができます。

### プロジェクト実行

```bash
npm run dev
```

### プロジェクト構築

```bash
# Windows 用
npm run build:win
# macOS 用
npm run build:mac
# Linux 用
npm run build:linux
```
