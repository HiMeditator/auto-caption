<div align="center" >
    <img src="./resources/icon.png" width="100px" height="100px"/>
    <h1 align="center">auto-caption</h1>
    <p>Auto Caption はクロスプラットフォームのリアルタイム字幕表示ソフトウェアです。</p>
    <p>
        | <a href="./README.md">簡体中文</a>
        | <a href="./README_en.md">英語</a>
        | <b>日本語</b> |
    </p>
    <p><i>v0.2.0 バージョンがリリースされました。ローカル字幕エンジンを追加予定の v1.0.0 バージョンが開発中...</i></p>
</div>

![](./assets/media/main_ja.png)

## 📥 ダウンロード

[GitHub Releases](https://github.com/HiMeditator/auto-caption/releases)

## 📚 関連ドキュメント

[Auto Caption ユーザーマニュアル](./docs/user-manual/ja.md)

[字幕エンジン説明文書](./docs/engine-manual/ja.md)

[プロジェクト API ドキュメント（中国語）](./docs/api-docs/electron-ipc.md)

### 基本的な使用方法

現在、Windows プラットフォーム向けのインストール可能なバージョンのみ提供されています。デフォルトの Gummy 字幕エンジンを使用する場合、まず Alibaba Cloud 百煉プラットフォームの API キーを取得し、環境変数に設定する必要があります。これによりモデルが正常に動作します。

**アリババクラウドの国際版には Gummy モデルが提供されていないため、中国以外のユーザーは現在、デフォルトの字幕エンジンを使用できません。すべてのユーザーが利用できるように、新しいローカルの字幕エンジンを開発中です。**

関連チュートリアル：
- [API キーの取得（中国語）](https://help.aliyun.com/zh/model-studio/get-api-key)
- [環境変数への API キーの設定（中国語）](https://help.aliyun.com/zh/model-studio/configure-api-key-through-environment-variables)。

字幕エンジンの仕組みを理解したい場合、または独自の字幕エンジンを開発したい場合は、[字幕エンジン説明文書](./docs/engine-manual/ja.md)を参照してください。
## ✨ 特徴

- 複数言語のインターフェースサポート
- 豊富な字幕スタイル設定
- 柔軟な字幕エンジン選択
- 複数言語の認識と翻訳
- 字幕記録の表示とエクスポート
- オーディオ出力とマイク入力の字幕生成

注意事項：
- Windows プラットフォームでは、オーディオ出力とマイク入力の両方の字幕生成がサポートされています。
- Linux プラットフォームでは、現在マイク入力の字幕生成のみがサポートされています。
- 現在、macOS プラットフォームには対応していません。

## 🚀 プロジェクトの実行

![](./assets/media/structure_ja.png)

### 依存関係のインストール

```bash
npm install
```

### 字幕エンジンのビルド

まず、`caption-engine` フォルダに移動し、以下のコマンドを実行して仮想環境を作成します：

```bash
python -m venv subenv
```

次に、仮想環境をアクティブ化します：

```bash
# Windows
subenv/Scripts/activate
# Linux
source subenv/bin/activate
```

次に、依存関係をインストールします（Linux 環境の場合、`requirements.txt` の `PyAudioWPatch` をコメントアウトする必要があります。このモジュールは Windows 環境でのみ適用されます）：

```bash
pip install -r requirements.txt
```

次に、`pyinstaller` を使用してプロジェクトをビルドします：

```bash
pyinstaller --onefile main-gummy.py
```

この時点でプロジェクトのビルドが完了し、`caption-engine/dist` フォルダで対応する実行ファイルを見つけることができます。その後、必要な操作を行ってください。

### プロジェクトの実行

```bash
npm run dev
```
### プロジェクトのビルド

現在、ソフトウェアは macOS プラットフォームに対応していません。Windows または Linux システムを使用してビルドしてください。完全な機能を備えた Windows プラットフォームが推奨されます。

```bash
# For Windows
npm run build:win
# For macOS, not avaliable yet
npm run build:mac
# For Linux
npm run build:linux
```
