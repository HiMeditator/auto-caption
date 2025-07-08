<div align="center" >
    <img src="./build/icon.png" width="100px" height="100px"/>
    <h1 align="center">auto-caption</h1>
    <p>Auto Caption はクロスプラットフォームのリアルタイム字幕表示ソフトウェアです。</p>
    <p>
        | <a href="./README.md">简体中文</a>
        | <a href="./README_en.md">English</a>
        | <b>日本語</b> |
    </p>
    <p><i>v0.3.0 バージョンがリリースされました。ローカル字幕エンジンを追加予定の v1.0.0 バージョンを現在開発中...</i></p>
</div>

![](./assets/media/main_ja.png)

## 📥 ダウンロード

[GitHub Releases](https://github.com/HiMeditator/auto-caption/releases)

## 📚 関連ドキュメント

[Auto Caption ユーザーマニュアル](./docs/user-manual/ja.md)

[字幕エンジン説明ドキュメント](./docs/engine-manual/ja.md)

[プロジェクト API ドキュメント（中国語）](./docs/api-docs/electron-ipc.md)

現在、Windows と macOS プラットフォーム向けのインストール可能なバージョンを提供しています。デフォルトの Gummy 字幕エンジンを使用するには、まず Alibaba Cloud Bailian プラットフォームから API KEY を取得し、その API KEY をソフトウェア設定に追加するか、環境変数に設定する必要があります（Windows プラットフォームのみ環境変数からの API KEY 読み取りをサポートしています）。

![](./assets/media/api_ja.png)

**国際版の Alibaba Cloud サービスには Gummy モデルが提供されていないため、現在中国以外のユーザーはデフォルトの字幕エンジンを使用できません。すべてのユーザーがデフォルトの字幕エンジンを使用できるように、新しいローカル字幕エンジンを開発中です。**

関連チュートリアル：

- [API KEY の取得（中国語）](https://help.aliyun.com/zh/model-studio/get-api-key)
- [環境変数への API Key 設定（中国語）](https://help.aliyun.com/zh/model-studio/configure-api-key-through-environment-variables)

字幕エンジンの動作原理を理解したい場合、または独自の字幕エンジンを開発したい場合は、[字幕エンジン説明ドキュメント](./docs/engine-manual/ja.md)を参照してください。

## ✨ 特徴

- クロスプラットフォーム、多言語 UI サポート
- 豊富な字幕スタイル設定
- 柔軟な字幕エンジン選択
- 多言語認識と翻訳
- 字幕記録の表示とエクスポート
- オーディオ出力またはマイク入力からの字幕生成

注記：
- Windows と macOS プラットフォームはオーディオ出力とマイク入力の両方からの字幕生成をサポートしていますが、**macOS プラットフォームでシステムオーディオ出力を取得するには設定が必要です。詳細は[Auto Caption ユーザーマニュアル](./docs/user-manual/ja.md)をご覧ください。**
- Linux プラットフォームは現在システムオーディオ出力を取得できず、マイク入力からの字幕生成のみをサポートしています。

## ⚙️ 字幕エンジン説明

現在ソフトウェアには1つの字幕エンジンが組み込まれており、2つの新しいエンジンを計画中です。詳細は以下の通りです。

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

[vosk-api](https://github.com/alphacep/vosk-api) をベースに開発予定で、現在実験中です。

### FunASR字幕エンジン（ローカル）

可能であれば、[FunASR](https://github.com/modelscope/FunASR) をベースに開発予定です。まだ調査と実現可能性の検証を行っていません。

## 🚀 プロジェクト実行

![](./assets/media/structure_ja.png)

### 依存関係のインストール

```bash
npm install
```

### 字幕エンジンの構築

まず `caption-engine` フォルダに入り、以下のコマンドを実行して仮想環境を作成します：

```bash
# ./caption-engine フォルダ内
python -m venv subenv
# または
python3 -m venv subenv
```

次に仮想環境をアクティブにします：

```bash
# Windows
subenv/Scripts/activate
# Linux または macOS
source subenv/bin/activate
```

その後、依存関係をインストールします（Linux または macOS 環境の場合、`requirements.txt` 内の `PyAudioWPatch` をコメントアウトする必要があります。このモジュールは Windows 環境専用です）。

> このステップでエラーが発生する場合があります。一般的にはビルド失敗が原因で、エラーメッセージに基づいて対応するビルドツールパッケージをインストールする必要があります。

```bash
pip install -r requirements.txt
```

その後、`pyinstaller` を使用してプロジェクトをビルドします：

```bash
pyinstaller --onefile main-gummy.py
```

これでプロジェクトのビルドが完了し、`caption-engine/dist` フォルダ内に対応する実行可能ファイルが確認できます。その後、次の操作に進むことができます。

### プロジェクト実行

```bash
npm run dev
```

### プロジェクト構築

現在、ソフトウェアは Windows と macOS プラットフォームでのみ構築とテストが行われており、Linux プラットフォームでの正しい動作は保証できません。

```bash
# Windows 用
npm run build:win
# macOS 用
npm run build:mac
# Linux 用
npm run build:linux
```
