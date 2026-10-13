# 字幕引擎通信协议

本文档记录当前 Python 字幕引擎与 Electron 主进程的通信约定。

实现入口：[主进程引擎管理](../../src/main/utils/CaptionEngine.ts)、[字幕记录处理](../../src/main/utils/AllConfig.ts)、[Python 引擎入口](../../engine/main.py)、[Socket 服务](../../engine/utils/server.py)、[输出工具](../../engine/utils/sysout.py) 和 [翻译工具](../../engine/utils/translation.py)。

## 连接与生命周期

1. Electron 主进程通过 `child_process.spawn()` 启动引擎，并通过 `-p <port>` 传入随机选择的端口（1024–65535）。自定义引擎也会收到追加的 `-p` 参数。
2. Python 引擎在 `localhost` 上启动 TCP Socket 服务，监听成功后通过标准输出发送 `connect` 消息。`connect.content` 不提供端口，主进程使用启动时传入的端口。
3. 主进程收到 `connect` 后发起 Socket 连接，将状态设为 `running`，并向控制窗口推送配置和 `control.engine.started`。当前实现不等待 Socket 连接回调再更新状态。该消息只表示通信服务已开始监听，不保证模型初始化和音频采集均已完成。
4. 关闭时，主进程通过 Socket 发送 `stop`，随后关闭连接并进入 `stopping` 状态；4 秒后仍处于该状态，则尝试强制终止引擎进程。
5. 子进程触发 `close` 后，主进程清理进程和连接引用，将状态设为 `stopped`，并推送 `engineEnabled: false` 的配置和 `control.engine.stopped`。

启动后若在 `Controls.startTimeoutSeconds` 指定的时间内仍处于 `starting` 状态、没有收到 `connect`，主进程报告启动超时并尝试强制终止引擎；默认等待 30 秒。Python 单独运行时 `--port` 默认为 0，此时不启动 Socket 服务。

## 标准输出与错误输出

数据方向：字幕引擎进程 → Electron 主进程。

协议消息通过 `sys.stdout` 发送，每行是一个完整 JSON 对象，以 `\n` 结束并及时 flush。每个对象都包含字符串字段 `command`。使用现有 `stdout()`、`stdout_cmd()` 或 `stdout_obj()` 工具发送协议消息，普通日志也应包装成相应的 JSON 消息。

`sys.stderr` 可以输出普通文本；主进程将非空行记录为 ERROR 软件日志，当前不会仅因 stderr 输出而向界面发送错误通知或终止引擎。

当前主进程按每次 stdout `data` 事件的数据块进行换行分割，没有缓存跨块的半行 JSON。解析失败会记录 ERROR 日志，无法解析的片段不会重试；自定义引擎应避免输出不必要的大消息，但完整行仍可能被流拆分。这是当前接收实现的限制。

下面示例均为实际 JSON 消息；类型和字段语义另行说明。未知 `command` 会被主进程记录为 WARN 日志。

### `connect`

```json
{ "command": "connect", "content": "" }
```

Socket 服务开始监听，要求主进程连接该服务。主进程忽略 `content`，使用启动参数中的端口。

### `kill`

```json
{ "command": "kill", "content": "" }
```

请求主进程强制终止引擎进程；主进程在状态不是 `stopped` 时处理该请求。内置引擎可能在 Socket 监听失败或识别发生不可恢复错误时发送此消息。

### `caption`

```json
{
  "command": "caption",
  "index": 1,
  "time_s": "12:34:56.100",
  "time_t": "12:34:57.250",
  "text": "Hello world.",
  "translation": "你好，世界。"
}
```

| 字段          | 类型     | 含义                                                                                            |
| ------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `index`       | `number` | 引擎的句子标识；同一句的连续识别结果沿用同一标识，新句使用新标识。不同引擎的初始值可能为 0 或 1 |
| `time_s`      | `string` | 该句的起始标记，内置引擎使用本地时间 `HH:mm:ss.SSS`，同一句保持一致                             |
| `time_t`      | `string` | 本次字幕结果生成时的本地时间，格式为 `HH:mm:ss.SSS`                                             |
| `text`        | `string` | 当前识别文本，流式引擎可能反复发送尚未完成的文本                                                |
| `translation` | `string` | 当前翻译文本；没有翻译或异步翻译尚未返回时为空字符串                                            |

主进程比较新消息的引擎 `index` 与最近一次识别的标识：记录非空且标识相同则替换最后一条，否则追加记录。保存后将记录的 `index` 改写为从 1 开始的记录序号，再通过 `both.captionLog.add` 或 `both.captionLog.upd` 发送给窗口。因此界面中的 `index` 不一定等于引擎传入的标识。

这些时间来自引擎本地时钟，不是模型返回的精确音频时间戳。当前协议没有单独的“句子最终完成”字段。

### `translation`

```json
{
  "command": "translation",
  "time_s": "12:34:56.100",
  "text": "Hello world.",
  "translation": "你好，世界。"
}
```

用于返回异步翻译结果。`time_s`、`text`、`translation` 均为字符串；`time_s` 必须与原始字幕完全一致。

主进程从后向前查找相同 `time_s` 的字幕，只更新其 `translation` 字段，再通过 `both.captionLog.upd` 发送完整记录。未找到则忽略消息；`text` 不参与匹配，也不会覆盖原始文本。翻译结果可以对应较早的记录，不限于最后一条。

Paraformer、Vosk、SOSV 和 GLM 引擎使用外部翻译服务时会发送此消息。Paraformer 在完整句子返回后触发翻译，识别片段通过相同 index 和 time_s 更新字幕。

### `print`

```json
{ "command": "print", "content": "Audio recording..." }
```

`content` 为字符串，主进程仅使用 `console.log()` 输出，不加入软件日志列表。

### `info`

```json
{ "command": "info", "content": "Paraformer recognizer started." }
```

`content` 为字符串，主进程记录为 INFO 软件日志。

### `warn`

```json
{ "command": "warn", "content": "Translation request failed." }
```

`content` 为字符串，主进程记录为 WARN 软件日志。

### `error`

```json
{ "command": "error", "content": "GLM request failed." }
```

`content` 为字符串，主进程记录为 ERROR 软件日志，并通过 `control.error.occurred` 向已存在的控制窗口发送错误通知。该消息本身不会自动终止引擎；需要强制终止时另发 `kill`。

### `usage`

```json
{ "command": "usage", "content": "60" }
```

当前内置引擎不发送此消息；保留供自定义引擎使用。主进程将 content 原样记录到 INFO 日志，不计算费用。

## TCP Socket 命令

数据方向：Electron 主进程 → 字幕引擎进程。

主进程将 `{ command: string, content: string }` 使用 `JSON.stringify()` 序列化后调用 `Socket.write()`，不会追加换行。Python 服务使用 UTF-8 解码后解析 JSON；当前只处理 `stop` 命令。

### `stop`

```json
{ "command": "stop", "content": "" }
```

要求引擎停止当前任务。Python 服务忽略 `content`，将 `shared_data.status` 设为 `stop` 并关闭客户端连接，由引擎和音频采集循环根据共享状态退出。客户端断开连接或接收、解码、JSON 解析发生异常时，也会将状态设为 `stop`；通信异常会输出到 stderr。

当前服务直接对单次 `recv(4096)` 的结果调用 `json.loads()`，没有消息长度或分隔符，也没有处理跨次接收的拆包和一次接收中的多条消息。现有业务只发送单个小型停止命令，但 TCP 不保证消息与接收数据块一一对应，即使单条命令也可能被拆分；扩展为连续命令时需先完善双方的消息分帧逻辑。
