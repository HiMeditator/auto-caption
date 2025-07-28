# caption engine api-doc

本文档主要介绍字幕引擎和 Electron 主进程进程的通信约定。

## 原理说明

本项目的 Python 进程通过标准输出向 Electron 主进程发送数据。Python 进程标准输出 (`sys.stdout`) 的内容一定为一行一行的字符串。且每行字符串均可以解释为一个 JSON 对象。每个 JSON 对象一定有 `command` 参数。

Electron 主进程通过 WebSocket 向 Python 进程发送数据。发送的数据均是转化为字符串的对象，对象格式一定为：

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

字幕引擎 WebSocket 服务已经准备好，命令 Electron 主进程连接字幕引擎 WebSocket 服务

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

### `print`

```js
{
  command: "print",
  content: string
}
```

输出 Python 端打印的内容。

### `info`

```js
{
  command: "info",
  content: string
}
```

Python 端打印的提示信息，比起 `print`，该信息更希望 Electron 端的关注。

### `usage`

```js
{
  command: "usage",
  content: string
}
```

Gummy 字幕引擎结束时打印计费消耗信息。

## WebSocket

> 数据传递方向：Electron 主进程 => 字幕引擎进程

当 JSON 对象的 `command` 参数为下列值时，表示的对应的含义：

### `stop`

命令当前字幕引擎停止监听并结束任务。