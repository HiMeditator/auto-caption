# caption engine api-doc

本文档主要介绍字幕引擎和 Electron 主进程进程的通信约定。

## 原理说明

本项目的 Python 进程通过标准输出向 Electron 主进程发送数据。Python 进程标准输出 (`sys.stdout`) 的内容一定为一行一行的字符串。且每行字符串均可以解释为一个 JSON 对象。每个 JSON 对象一定有 `command` 参数。

Electron 主进程通过 TCP Socket 向 Python 进程发送数据。发送的数据均是转化为字符串的对象，对象格式一定为：

```js
{
  command: string,
  content: string
}
```

## 标准输出约定

> 数据传递方向：字幕引擎进程 => Electron 主进程

当 JSON 对象的 `command` 参数为下列值时，表示的对应的含义：

### `connect`

```js
{
  command: "connect",
  content: ""
}
```

字幕引擎 TCP Socket 服务已经准备好，命令 Electron 主进程连接字幕引擎 Socket 服务

### `kill`

```js
{
  command: "connect",
  content: ""
}
```

命令 Electron 主进程强制结束字幕引擎进程。

### `caption`

```js
{
  command: "caption",
  index: number,
  time_s: string,
  time_t: string,
  text: string,
  translation: string
}
```

Python 端监听到的音频流转换为的字幕数据。

### `translation`

```js
{
  command: "translation",
  time_s: string,
  text: string,
  translation: string
}
```

语音识别的内容的翻译，可以根据起始时间确定对应的字幕。

### `print`

```js
{
  command: "print",
  content: string
}
```

输出 Python 端打印的内容，不计入日志。

### `info`

```js
{
  command: "info",
  content: string
}
```

Python 端打印的提示信息，会计入日志。

### `warn`

```js
{
  command: "warn",
  content: string
}
```

Python 端打印的警告信息，会计入日志。

### `error`

```js
{
  command: "error",
  content: string
}
```

Python 端打印的错误信息，该错误信息会在前端弹窗显示。

### `usage`

```js
{
  command: "usage",
  content: string
}
```

Gummy 字幕引擎结束时打印计费消耗信息。

## TCP Socket

> 数据传递方向：Electron 主进程 => 字幕引擎进程

当 JSON 对象的 `command` 参数为下列值时，表示的对应的含义：

### `stop`

```js
{
  command: "stop",
  content: ""
}
```

命令当前字幕引擎停止监听并结束任务。