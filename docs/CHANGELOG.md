## v0.0.1

2025-06-22

发布第一版软件。

## v0.1.0

2025-06-26

### 新增功能

- 添加错误通知
- 添加默认引擎的环境变量检查
- 添加配置数据文件保存和载入
- 添加字幕样式恢复默认的选项
- 添加项目关于信息

### 新增文档

- 添加用户说明文档
- 添加字幕引擎说明文档

## v0.2.0

2025-07-05

对项目进行了重构，修复了 bug，添加了新功能。本版本为正式版。

### 新增功能

- 添加多界面语言支持（中文、英语、日语）
- 添加暗色主题

### 提升体验

- 优化界面布局
- 添加更多可保存和载入的配置项
- 为字幕引擎添加更严格的状态限制，防止出现僵尸进程

### 修复bug

- 添加字幕引擎长时间空置后报错的问题

### 新增文档

- 新增日语说明文档
- 新增英语、日语字幕引擎说明文档和用户手册
- 新增 electron ipc api 文档




Here are the translations of the selected macOS audio output configuration section:

### English Translation:
```markdown
### Capturing System Audio Output on macOS

The subtitle engine cannot directly capture system audio output on macOS platform and requires additional driver installation. The current subtitle engine uses [BlackHole](https://github.com/ExistentialAudio/BlackHole). First open Terminal and execute one of the following commands (recommended to choose the first one):

```bash
brew install blackhole-2ch
brew install blackhole-16ch
brew install blackhole-64ch
```

After installation completes, open `Audio MIDI Setup` (searchable via `cmd + space`). Check if BlackHole appears in the device list - if not, restart your computer.

Once BlackHole is confirmed installed, in the `Audio MIDI Setup` page, click the plus (+) button at bottom left and select "Create Multi-Output Device". Include both BlackHole and your desired audio output destination in the outputs. Finally, set this multi-output device as your default audio output device.

Now the subtitle engine can capture system audio output and generate subtitles.
```

### Japanese Translation:
```markdown
### macOSでのシステムオーディオ出力の取得方法

字幕エンジンはmacOSプラットフォームで直接システムオーディオ出力を取得できず、追加のドライバーインストールが必要です。現在の字幕エンジンでは[BlackHole](https://github.com/ExistentialAudio/BlackHole)を使用しています。まずターミナルを開き、以下のいずれかのコマンドを実行してください（最初のオプションを推奨します）：

```bash
brew install blackhole-2ch
brew install blackhole-16ch
brew install blackhole-64ch
```

インストール完了後、`オーディオMIDI設定`（`cmd + space`で検索可能）を開きます。デバイスリストにBlackHoleが表示されているか確認してください - 表示されていない場合はコンピュータを再起動してください。

BlackHoleのインストールが確認できたら、`オーディオMIDI設定`ページで左下のプラス(+)ボタンをクリックし、「マルチ出力デバイスを作成」を選択します。出力にBlackHoleと希望するオーディオ出力先の両方を含めてください。最後に、このマルチ出力デバイスをデフォルトのオーディオ出力デバイスに設定します。

これで字幕エンジンがシステムオーディオ出力をキャプチャし、字幕を生成できるようになります。
```

Key translation notes:
1. Technical terms:
   - "Audio MIDI Setup" → "オーディオMIDI設定" (Japanese)
   - "Multi-Output Device" → "マルチ出力デバイス" (Japanese)
   - Maintained "BlackHole" and "brew" commands as-is

2. Structure:
   - Kept the same section hierarchy with ### headers
   - Preserved all code blocks and formatting
   - Maintained the step-by-step instruction flow

3. Localization:
   - Used appropriate Japanese technical terms
   - Adjusted phrasing for natural reading in each language
   - Kept all terminal commands and interface elements unchanged

Both translations accurately convey the technical procedures while adapting naturally to their target languages.