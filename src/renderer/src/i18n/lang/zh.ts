export default {
  lang: "zh",
  example: {
    "original": "This is a preview of caption styles. ",
    "translation": "（翻译）这是字幕样式预览。"
  },
  noti: {
    "restarted": "字幕引擎重启成功",
    "started": "字幕引擎启动成功",
    "sLang": "源语言：",
    "trans": "，是否翻译：",
    "engine": "，字幕引擎：",
    "audio": "，音频类型：",
    "sysout": "系统音频输出（扬声器）",
    "sysin": "系统音频输入（麦克风）",
    "tLang": "，翻译语言：",
    "custom": "类型：自定义引擎，引擎路径：",
    "args": "，命令参数：",
    "pidInfo": "，字幕引擎进程 PID：",
    "stopped": "字幕引擎停止",
    "stoppedInfo": "字幕引擎已经停止，可点击“启动字幕引擎”按钮重新启动",
    "error": "发生错误",
    "engineChange": "字幕引擎配置已更改",
    "changeInfo": "如果字幕引擎已经启动，需要重启字幕引擎修改才会生效",
    "styleChange": "字幕样式已修改",
    "styleInfo": "字幕样式修改已经保存并生效"
  },
  general: {
    "title": "通用设置",
    "uiLanguage": "界面语言",
    "barWidth": "左侧宽度",
    "note": "通用设置修改后立即生效。注意字幕引擎设置和字幕样式的设置修改后需要点击应用后才会生效。",
    "theme": "主题",
    "light": "浅色",
    "dark": "深色",
    "system": "系统"
  },
  engine: {
    "title": "字幕引擎设置",
    "applyChange": "应用更改",
    "cancelChange": "取消更改",
    "sourceLang": "源语言",
    "transLang": "翻译语言",
    "captionEngine": "字幕引擎",
    "audioType": "音频类型",
    "systemOutput": "系统音频输出（扬声器）",
    "systemInput": "系统音频输入（麦克风）",
    "enableTranslation": "启用翻译",
    "showMore": "更多设置",
    "apikey": "API KEY",
    "modelPath": "模型路径",
    "customEngine": "自定义引擎",
    custom: {
      "title": "自定义字幕引擎",
      "attention": "注意事项",
      "note": "说明：允许用户使用自定义引擎提供字幕。提供的引擎要能通过命令行启动，且可以提供命令行指令来指定参数。引擎需要使用标准输出与软件 node.js 后端进行通信。详细信息参考项目文档。",
      "app": "引擎路径",
      "command": "引擎指令"
    }
  },
  style: {
    "title": "字幕样式设置",
    "applyStyle": "应用样式",
    "cancelChange": "取消更改",
    "resetStyle": "恢复默认",
    "longCaption": "长字幕",
    "fontFamily": "字体族",
    "fontColor": "字体颜色",
    "fontSize": "字体大小",
    "fontWeight": "字体粗细",
    "background": "背景颜色",
    "opacity": "不透明度",
    "preview": "显示预览",
    "translation": "显示翻译",
    trans: {
      "title": "翻译样式设置",
      "useSame": "使用原文样式"
    },
    "textShadow": "文本阴影",
    shadow: {
      "title": "文本阴影设置",
      "offsetX": "X轴偏移",
      "offsetY": "Y轴偏移",
      "blur": "模糊半径",
      "color": "阴影颜色"
    }
  },
  status: {
    "engine": "字幕引擎",
    "customized": "自定义",
    "status": "引擎状态",
    "started": "已启动",
    "stopped": "未启动",
    "logNumber": "字幕数量",
    "aboutProj": "项目关于",
    "openCaption": "打开字幕窗口",
    "startEngine": "启动字幕引擎",
    "restartEngine": "重启字幕引擎",
    "stopEngine": "关闭字幕引擎",
    about: {
      "title": "关于本项目",
      "proj": "Auto Caption 项目",
      "desc": "一个跨平台的支持多种语言的实时字幕显示软件。",
      "version": "软件版本",
      "author": "项目作者",
      "projLink": "项目链接",
      "manual": "用户手册",
      "engineDoc": "字幕引擎手册",
      "date": "2025 年 7 月 9 日"
    }
  },
  log: {
    "title": "字幕记录",
    "export": "导出字幕记录",
    "copy": "复制到剪贴板",
    "copyOptions": "复制选项",
    "addIndex": "添加序号",
    "copyTime": "复制时间",
    "copyContent": "复制内容",
    "both": "原文与翻译",
    "source": "仅原文",
    "translation": "仅翻译",
    "copySuccess": "字幕已复制到剪贴板",
    "clear": "清空字幕记录"
  }
}
