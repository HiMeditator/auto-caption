# Electron IPC 通信协议

本文档记录当前 Electron 主进程和两个渲染窗口（控制窗口、字幕窗口）的通信约定。

实现入口：[控制窗口](../../src/main/ControlWindow.ts)、[字幕窗口](../../src/main/CaptionWindow.ts)、[配置与字幕记录](../../src/main/utils/AllConfig.ts)、[引擎管理](../../src/main/utils/CaptionEngine.ts)、[日志](../../src/main/utils/Log.ts)。

## 调用方式和类型

- 请求与返回：渲染进程使用 `window.electron.ipcRenderer.invoke(channel, ...args)`，主进程使用 `ipcMain.handle`，返回值通过 Promise 获取。
- 渲染进程发送事件：使用 `window.electron.ipcRenderer.send(channel, ...args)`，主进程使用 `ipcMain.on`；这些通道没有直接返回值。
- 主进程推送事件：使用目标窗口的 `webContents.send(channel, ...args)`，渲染进程使用 `window.electron.ipcRenderer.on(channel, (_, payload) => ...)` 接收。回调第一个参数是事件对象，第二个参数才是本文描述的数据。

两个窗口都会通过 `App.vue` 初始化共用的 `generalSetting` store，因此主题查询及语言、主题、主题色、侧栏宽度的变更消息均可能由任一窗口发出（包括配置初始化触发的 watcher）。其余通道按当前界面的主要调用位置说明发起方；主进程处理器没有按来源窗口限制这些通道。

类型定义见 [主进程类型](../../src/main/types/index.ts) 和 [渲染进程类型](../../src/renderer/src/types/index.ts)：

- `UILanguage`：`'zh' | 'en' | 'ja'`。
- `UITheme`：`'light' | 'dark' | 'system'`；实际应用的主题为 `'light' | 'dark'`。
- `FullConfig`：包含 `platform`、`uiLanguage`、`uiTheme`、`uiColor`、`leftBarWidth`、`styles`、`controls`、`captionLog` 和 `softwareLog`；不包含持久化的字幕窗口宽度。
- `Controls`：字幕引擎和翻译配置，当前包括 `translationProvider`、`ollamaModel`、`openaiModel`、`openaiBaseUrl`、`openaiApiKey`、`dashscopeApiKey` 和 `startTimeoutSeconds` 等字段。`engineEnabled` 由主进程维护，配置变更不会覆盖该状态。
- `Styles`：字幕及翻译的显示样式；字段以源码类型定义为准。
- `CaptionItem`：`index`、`time_s`、`time_t`、`text`、`translation`；主进程发送给界面的 `index` 是从 1 开始的记录序号。渲染进程按 `time_s` 匹配更新记录。
- `SoftwareLogItem`：`type: 'INFO' | 'WARN' | 'ERROR'`、`index: number`、`time: string`、`text: string`。
- `EngineInfo`：`pid`、`ppid`、`port`、`cpu`、`mem`、`elapsed` 均为 `number`；CPU 为百分比，内存为字节，已运行时间为毫秒。

## 命名方式

本项目渲染进程包含两个：字幕窗口和控制窗口，主进程需要分别和两者进行通信。通信命令的命名规则如下：

1. 命令一般由三个关键字组成，由点号隔开。
2. 第一个关键字通常表示关联的窗口或范围：
   - `control` 表示控制窗口相关操作或事件
   - `caption` 表示字幕窗口相关操作或事件
   - `both` 表示两个窗口共用的通道
   - 前缀不保证实际接收窗口，例如 `control.uiLanguage.set` 当前发送给字幕窗口；接收方以各通道说明为准
3. 第二个关键字表示需要修改的对象 / 发生改变的对象，采用小驼峰命名
4. 第三个关键字一般是动词，表示通信发生时对应动作 / 需要进行的操作

根据上面的描述可以看出通信命令一般有两种语义，一种表示要求执行的操作，另一种表示当前发生的事件。

## 请求与返回（`invoke` / `handle`）

### `both.window.mounted`

**介绍：** 前端窗口挂载完毕，请求完整配置、字幕记录及积压的软件日志。调用会将控制窗口的 `mounted` 标记设为 `true`，并取出、清空日志队列；`softwareLog` 不是完整的历史日志。

**发起方：** 前端

**接收方：** 后端

**数据类型：**

- 发送：无数据
- 接收：`FullConfig`

### `control.nativeTheme.get`

**介绍：** 获取当前应使用的主题。配置为 `system` 时按系统主题返回，否则返回配置的 `light` 或 `dark`。

**发起方：** 前端控制窗口或字幕窗口（共用 `generalSetting` store）

**接收方：** 后端控制窗口实例

**数据类型：**

- 发送：无数据
- 接收：`'light' | 'dark'`

### `control.folder.select`

**介绍：** 打开文件夹选择器，并返回所选文件夹路径；取消选择时返回空字符串 `''`。

**发起方：** 前端控制窗口

**接收方：** 后端控制窗口实例

**数据类型：**

- 发送：无数据
- 接收：`string`

### `control.engine.info`

**介绍：** 获取字幕引擎进程及资源信息。引擎状态不是 `running` 时，返回所有字段均为 0 的 `EngineInfo`。

**发起方：** 前端控制窗口

**接收方：** 后端控制窗口实例

**数据类型：**

- 发送：无数据
- 接收：`EngineInfo`

## 渲染进程发送事件（`send` / `on`）

### `control.uiLanguage.change`

**介绍：** 前端修改界面语言，将修改同步给主进程；字幕窗口存在时，通过 `control.uiLanguage.set` 同步给字幕窗口。

**发起方：** 前端控制窗口或字幕窗口（共用 `generalSetting` store）

**接收方：** 后端控制窗口实例

**数据类型：** `UILanguage`

### `control.uiTheme.change`

**介绍：** 前端修改界面主题，将修改同步给后端

**发起方：** 前端控制窗口或字幕窗口（共用 `generalSetting` store）

**接收方：** 后端控制窗口实例

**数据类型：** `UITheme`

### `control.uiColor.change`

**介绍：** 前端修改界面主题颜色，将修改同步给后端

**发起方：** 前端控制窗口或字幕窗口（共用 `generalSetting` store）

**接收方：** 后端控制窗口实例

**数据类型：** `string`

### `control.leftBarWidth.change`

**介绍：** 前端修改边栏宽度，将修改同步给后端

**发起方：** 前端控制窗口或字幕窗口（共用 `generalSetting` store）

**接收方：** 后端控制窗口实例

**数据类型：** `number`

### `control.captionLog.clear`

**介绍：** 清空主进程中的字幕记录。发起方的 Pinia store 同时清空自己的记录；当前主进程不会向其他窗口广播清空事件。

**发起方：** 前端控制窗口

**接收方：** 后端控制窗口实例

**数据类型：** 无数据

### `control.styles.change`

**介绍：** 前端修改字幕样式，将修改同步给主进程，并通过 `both.styles.set` 同步给已存在的字幕窗口。

**发起方：** 前端控制窗口

**接收方：** 后端控制窗口实例

**数据类型：** `Styles`

### `control.styles.reset`

**介绍：** 将字幕样式恢复为默认，并通过 `both.styles.set` 同步给已存在的控制窗口和字幕窗口。

**发起方：** 前端控制窗口

**接收方：** 后端控制窗口实例

**数据类型：** 无数据

### `control.controls.change`

**介绍：** 前端修改字幕引擎配置，将最新配置发送给主进程。主进程只更新已知配置字段，保留自身维护的 `engineEnabled` 状态；此操作不会立即广播 `control.controls.set`。

**发起方：** 前端控制窗口

**接收方：** 后端控制窗口实例

**数据类型：** `Controls`

### `control.captionWindow.activate`

**介绍：** 显示字幕窗口；窗口不存在时创建。

**发起方：** 前端控制窗口

**接收方：** 后端控制窗口实例

**数据类型：** 无数据

### `control.engine.start`

**介绍：** 启动字幕引擎

**发起方：** 前端控制窗口

**接收方：** 后端控制窗口实例

**数据类型：** 无数据

### `control.engine.stop`

**介绍：** 请求关闭字幕引擎，向引擎发送 Socket `stop` 命令并关闭连接；4 秒后仍处于停止过程中则尝试强制终止。

**发起方：** 前端控制窗口

**接收方：** 后端控制窗口实例

**数据类型：** 无数据

### `control.engine.forceKill`

**介绍：** 强制终止当前引擎进程。界面在启动过程中提供此操作；主进程处理器本身不要求先发生启动超时。

**发起方：** 前端控制窗口

**接收方：** 后端控制窗口实例

**数据类型：** 无数据

### `caption.windowHeight.change`

**介绍：** 根据前端内容高度设置字幕窗口高度（像素），保留窗口宽度。

**发起方：** 前端字幕窗口

**接收方：** 后端字幕窗口实例

**数据类型：** `number`

### `caption.mouseEvents.ignore`

**介绍：** 设置字幕窗口是否忽略鼠标事件，`true` 启用鼠标穿透，`false` 关闭；同时将 `forward` 选项设为同一值。

**发起方：** 前端字幕窗口

**接收方：** 后端字幕窗口实例

**数据类型：** `boolean`

### `caption.controlWindow.activate`

**介绍：** 显示控制窗口；窗口不存在时创建。

**发起方：** 前端字幕窗口

**接收方：** 后端字幕窗口实例

**数据类型：** 无数据

### `caption.window.close`

**介绍：** 关闭字幕窗口

**发起方：** 前端字幕窗口

**接收方：** 后端字幕窗口实例

**数据类型：** 无数据

## 主进程推送事件（`webContents.send` / `on`）

### `control.uiLanguage.set`

**介绍：** 后端将最新界面语言发送给前端，前端进行设置

**发起方：** 后端

**接收方：** 字幕窗口

**数据类型：** `UILanguage`

### `control.nativeTheme.change`

**介绍：** 系统主题变化时，若应用主题配置为 `system`，向控制窗口发送最新的实际主题。

**发起方：** 后端

**接收方：** 前端控制窗口

**数据类型：** `'light' | 'dark'`

### `control.engine.started`

**介绍：** 主进程收到引擎 `connect` 消息并发起 Socket 连接后发送，参数为引擎进程 ID；当前实现发送时不等待 Socket 的连接回调。此前会先推送 `control.controls.set`，其中 `engineEnabled` 为 `true`。

**发起方：** 后端

**接收方：** 前端控制窗口

**数据类型：** `number`

### `control.engine.stopped`

**介绍：** 引擎子进程触发 `close` 后发送。此前会先推送 `control.controls.set`，其中 `engineEnabled` 为 `false`。

**发起方：** 后端

**接收方：** 前端控制窗口

**数据类型：** 无数据

### `control.error.occurred`

**介绍：** 发送错误

**发起方：** 后端

**接收方：** 前端控制窗口

**数据类型：** `string`

### `control.controls.set`

**介绍：** 后端将最新字幕引擎配置发送给前端，前端进行设置

**发起方：** 后端

**接收方：** 前端控制窗口

**数据类型：** `Controls`

### `control.softwareLog.add`

**介绍：** 添加一条新的日志数据

**发起方：** 后端

**接收方：** 前端控制窗口

**数据类型：** `SoftwareLogItem`

控制窗口已经挂载时即时推送；否则日志进入队列，在下一次 `both.window.mounted` 的返回值中提供。

### `both.styles.set`

**介绍：** 后端将最新字幕样式发送给前端，前端进行设置

**发起方：** 后端

**接收方：** 前端

**数据类型：** `Styles`

### `both.captionLog.add`

**介绍：** 添加一条新的字幕数据

**发起方：** 后端

**接收方：** 前端

**数据类型：** `CaptionItem`

### `both.captionLog.upd`

**介绍：** 更新一条已有字幕数据，可以是当前识别中的最后一条，也可以是异步翻译完成的较早记录。渲染进程从后向前查找相同 `time_s` 的记录并替换；未找到则不修改。

**发起方：** 后端

**接收方：** 前端

**数据类型：** `CaptionItem`

### `both.captionLog.set`

**介绍：** 替换全部字幕数据。当前主进程保留了发送分支，渲染进程也注册了监听，但现有业务流程没有调用该分支；初始化记录来自 `both.window.mounted` 返回的 `FullConfig.captionLog`。

**发起方：** 后端

**接收方：** 前端

**数据类型：** `CaptionItem[]`

旧配置的 `engine: "gummy"` 自动迁移为 `"paraformer"`，`gummyApiKey`（或更早的 `API_KEY`）迁移为 `dashscopeApiKey`。新的显式密钥优先。Paraformer 使用外部翻译服务，与其他引擎共享翻译配置。

LiveTranslate 配置：`engine: "livetranslate"`，`dashscopeWorkspaceId: string`（默认空），`dashscopeRegion: "cn-beijing" | "ap-southeast-1"`（默认北京）。与 Paraformer 共用 `dashscopeApiKey`。使用内置翻译，不使用外部翻译配置；源语言自动检测。
