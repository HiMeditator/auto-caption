# caption engine api-doc

本文档主要 Electron 主进程和字幕引擎进程的通信约定。

## 原理说明

本项目的 Python 进程通过标准输出向 Electron 主进程发送数据。

Python 进程标准输出 (`sys.stdout`) 的内容一定为一行一行的字符串。且每行字符串均可以解释为一个 JSON 对象。每个 JSON 对象一定有 `command` 参数。

## 输出约定

当 JSON 对象的 `command` 参数为下列值时，表示的对应的含义：

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

Python 端打印的提示信息。

### `caption`

```js
{
  command: "caption",
  index: number,
  time_s: string,
  time_t: string,
  end: boolean,
  text: string,
  translation: string
}
```

Python 端监听到的音频流转换为的字幕数据。