<div align="center" >
    <img src="./build/icon.png" width="100px" height="100px"/>
    <h1 align="center">auto-caption</h1>
    <p>Auto Caption はクロスプラットフォームのリアルタイム字幕表示ソフトウェアです。</p>
    <p>
      <a href="https://github.com/HiMeditator/auto-caption/releases"><img src="https://img.shields.io/badge/release-1.1.0-blue"></a>
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
    <p><i>v1.1.0 バージョンがリリースされました。GLM-ASR クラウド字幕モデルと OpenAI 互換モデル翻訳が追加されました...</i></p>
</div>

![](./assets/media/main_ja.png)

## 📥 ダウンロード

ソフトウェアダウンロード: [GitHub Releases](https://github.com/HiMeditator/auto-caption/releases)

Vosk モデルダウンロード: [Vosk Models](https://alphacephei.com/vosk/models)

SOSV モデルダウンロード: [Shepra-ONNX SenseVoice Model](https://github.com/HiMeditator/auto-caption/releases/tag/sosv-model)

## 📚 関連ドキュメント

[Auto Caption ユーザーマニュアル](./docs/user-manual/ja.md)

[字幕エンジン説明ドキュメント](./docs/engine-manual/ja.md)

[更新履歴](./docs/CHANGELOG.md)

## ✨ 特徴

- 音声出力またはマイク入力からの字幕生成
- ローカルのOllamaモデル、クラウド上のOpenAI互換モデル、またはクラウド上のGoogle翻訳APIを呼び出して翻訳を行うことをサポートしています
- クロスプラットフォーム（Windows、macOS、Linux）、多言語インターフェース（中国語、英語、日本語）対応
- 豊富な字幕スタイル設定（フォント、フォントサイズ、フォント太さ、フォント色、背景色など）
- 柔軟な字幕エンジン選択（阿里云Gummyクラウドモデル、GLM-ASRクラウドモデル、ローカルVoskモデル、ローカルSOSVモデル、または独自にモデルを開発可能）
- 多言語認識と翻訳（下記「⚙️ 字幕エンジン説明」参照）
- 字幕記録表示とエクスポート（`.srt` および `.json` 形式のエクスポートに対応）

## 📖 基本使い方

> ⚠️ 注意：現在、Windowsプラットフォームのソフトウェアの最新バージョンのみがメンテナンスされており、他のプラットフォームの最終バージョンはv1.0.0のままです。

このソフトウェアは Windows、macOS、Linux プラットフォームに対応しています。テスト済みのプラットフォーム情報は以下の通りです：

| OS バージョン | アーキテクチャ | システムオーディオ入力 | システムオーディオ出力 |
| ------------------ | ------------ | ------------------ | ------------------- |
| Windows 11 24H2    | x64          | ✅                 | ✅                   |
| macOS Sequoia 15.5 | arm64        | ✅ [追加設定が必要](./docs/user-manual/ja.md#macos-でのシステムオーディオ出力の取得方法)    | ✅                   |
| Ubuntu 24.04.2     | x64          | ✅                 | ✅                   |
| Kali Linux 2022.3  | x64          | ✅                 | ✅                   |
| Kylin Server V10 SP3 | x64 | ✅ | ✅ |

macOS および Linux プラットフォームでシステムオーディオ出力を取得するには追加設定が必要です。詳細は[Auto Captionユーザーマニュアル](./docs/user-manual/ja.md)をご覧ください。

ソフトウェアをダウンロードした後、自分のニーズに応じて対応するモデルを選択し、モデルを設定する必要があります。

|                                                              | 正確性 | 実時間性 | デプロイタイプ | 対応言語 | 翻訳 | 備考 |
| ------------------------------------------------------------ | -------- | --------- | -------------- | -------- | ---- | ---- |
| [Gummy](https://help.aliyun.com/zh/model-studio/gummy-speech-recognition-translation) | とても良い😊 | とても良い😊 | クラウド / アリババクラウド | 10言語 | 内蔵翻訳 | 有料、0.54元/時間 |
| [glm-asr-2512](https://docs.bigmodel.cn/cn/guide/models/sound-and-video/glm-asr-2512) | とても良い😊 | 悪い😞 | クラウド / Zhipu AI | 4言語 | 追加設定が必要 | 有料、約0.72元/時間 |
| [Vosk](https://alphacephei.com/vosk) | 悪い😞 | とても良い😊 | ローカル / CPU | 30言語以上 | 追加設定が必要 | 多くの言語に対応 |
| [SOSV](https://k2-fsa.github.io/sherpa/onnx/sense-voice/index.html) | 普通😐 | 普通😐 | ローカル / CPU | 5言語 | 追加設定が必要 | 1つのモデルのみ |
| 自分で開発 | 🤔 | 🤔 | カスタム | カスタム | カスタム | [ドキュメント](./docs/engine-manual/ja.md)に従ってPythonを使用して自分で開発 |

Gummyモデル以外を選択した場合、独自の翻訳モデルを設定する必要があります。

### 翻訳モデルの設定

![](./assets/media/engine_ja.png)

> 注意：翻訳はリアルタイムではありません。翻訳モデルは各文の認識が完了した後にのみ呼び出されます。

#### Ollama ローカルモデル

> 注意：パラメータ数が多すぎるモデルを使用すると、リソース消費と翻訳遅延が大きくなります。1B未満のパラメータ数のモデルを使用することを推奨します。例：`qwen2.5:0.5b`、`qwen3:0.6b`。

このモデルを使用する前に、ローカルマシンに[Ollama](https://ollama.com/)ソフトウェアがインストールされており、必要な大規模言語モデルをダウンロード済みであることを確認してください。設定で呼び出す必要がある大規模モデル名を「モデル名」フィールドに入力し、「Base URL」フィールドが空であることを確認してください。

#### OpenAI互換モデル

ローカルのOllamaモデルの翻訳効果が良くないと感じる場合や、ローカルにOllamaモデルをインストールしたくない場合は、クラウド上のOpenAI互換モデルを使用できます。

いくつかのモデルプロバイダの「Base URL」：
- OpenAI: https://api.openai.com/v1
- DeepSeek: https://api.deepseek.com
- アリババクラウド: https://dashscope.aliyuncs.com/compatible-mode/v1

API Keyは対応するモデルプロバイダから取得する必要があります。

#### Google翻訳API

> 注意：Google翻訳APIは一部の地域では使用できません。

設定不要で、ネット接続があれば使用できます。

### Gummyモデルの使用

> 阿里云の国際版サービスにはGummyモデルが提供されていないため、現在中国以外のユーザーはGummy字幕エンジンを使用できない可能性があります。

デフォルトのGummy字幕エンジン（クラウドモデルを使用した音声認識と翻訳）を使用するには、まず阿里云百煉プラットフォームのAPI KEYを取得し、API KEYをソフトウェア設定に追加するか環境変数に設定する必要があります（Windowsプラットフォームのみ環境変数からのAPI KEY読み取りをサポート）。関連チュートリアル：

- [API KEYの取得](https://help.aliyun.com/zh/model-studio/get-api-key)
- [環境変数へのAPI Keyの設定](https://help.aliyun.com/zh/model-studio/configure-api-key-through-environment-variables)

### GLM-ASR モデルの使用

使用前に、Zhipu AI プラットフォームから API キーを取得し、それをソフトウェアの設定に追加する必要があります。

API キーの取得についてはこちらをご覧ください：[クイックスタート](https://docs.bigmodel.cn/ja/guide/start/quick-start)。

### Voskモデルの使用

> Voskモデルの認識効果は不良のため、注意して使用してください。

Voskローカル字幕エンジンを使用するには、まず[Vosk Models](https://alphacephei.com/vosk/models)ページから必要なモデルをダウンロードし、ローカルにモデルを解凍し、モデルフォルダのパスをソフトウェア設定に追加してください。

![](./assets/media/config_ja.png)

### SOSVモデルの使用

SOSVモデルの使用方法はVoskと同じで、ダウンロードアドレスは以下の通りです：https://github.com/HiMeditator/auto-caption/releases/tag/sosv-model

## ⌨️ ターミナルでの使用

ソフトウェアはモジュール化設計を採用しており、ソフトウェア本体と字幕エンジンの2つの部分に分けることができます。ソフトウェア本体はグラフィカルインターフェースを通じて字幕エンジンを呼び出します。コアとなる音声取得および音声認識機能はすべて字幕エンジンに実装されており、字幕エンジンはソフトウェア本体から独立して単独で使用できます。

字幕エンジンはPythonを使用して開発され、PyInstallerによって実行可能ファイルとしてパッケージ化されます。したがって、字幕エンジンの使用方法は以下の2つがあります：

1. プロジェクトの字幕エンジン部分のソースコードを使用し、必要なライブラリがインストールされたPython環境で実行する
2. パッケージ化された字幕エンジンの実行可能ファイルをターミナルから実行する

実行引数および詳細な使用方法については、[User Manual](./docs/user-manual/en.md#using-caption-engine-standalone)をご参照ください。

```bash
python main.py \
-e gummy \
-k sk-******************************** \
-a 0 \
-d 1 \
-s en \
-t zh
```

![](./docs/img/07.png)

## ⚙️ 字幕エンジン説明

現在、ソフトウェアには4つの字幕エンジンが搭載されており、新しいエンジンが計画されています。それらの詳細情報は以下の通りです。

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

### GLM-ASR 字幕エンジン（クラウド）

https://docs.bigmodel.cn/ja/guide/models/sound-and-video/glm-asr-2512

### Vosk字幕エンジン（ローカル）

[vosk-api](https://github.com/alphacep/vosk-api)をベースに開発。この字幕エンジンの利点は選択可能な言語モデルが非常に多く（30言語以上）、欠点は認識効果が比較的悪く、生成内容に句読点がないことです。

### SOSV 字幕エンジン（ローカル）

[SOSV](https://github.com/HiMeditator/auto-caption/releases/tag/sosv-model)は統合パッケージで、主に[Shepra-ONNX SenseVoice](https://k2-fsa.github.io/sherpa/onnx/sense-voice/index.html)をベースにし、エンドポイント検出モデルと句読点復元モデルを追加しています。このモデルが認識をサポートする言語は：英語、中国語、日本語、韓国語、広東語です。

## 🚀 プロジェクト実行

![](./assets/media/structure_ja.png)

### 依存関係のインストール

```bash
npm install
```

### 字幕エンジンの構築

まず `engine` フォルダに入り、以下のコマンドを実行して仮想環境を作成します（Python 3.10 以上が必要で、Python 3.12 が推奨されます）：

```bash
cd ./engine
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
