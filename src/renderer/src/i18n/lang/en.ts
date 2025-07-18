export default {
  lang: "en",
  example: {
    "original": "这是字幕样式预览。",
    "translation": "(Translation) This is a preview of caption styles."
  },
  noti: {
    "restarted": "Caption Engine Restarted Successfully",
    "started": "Caption Engine Started Successfully",
    "sLang": "Source language: ",
    "trans": ", translation: ",
    "engine": ", caption engine: ",
    "audio": ", audio type: ",
    "sysout": "system audio output (speaker)",
    "sysin": "system audio input (microphone)",
    "tLang": ", target language: ",
    "custom": "Type: Custom engine, engine path: ",
    "args": ", command arguments: ",
    "pidInfo": ", caption engine process PID: ",
    "empty": "Model Path is Empty",
    "emptyInfo": "The Vosk model path is empty. Please set the Vosk model path in the additional settings of the subtitle engine settings.",
    "stopped": "Caption Engine Stopped",
    "stoppedInfo": "The caption engine has stopped. You can click the 'Start Caption Engine' button to restart it.",
    "error": "An error occurred",
    "engineChange": "Cpation Engine Configuration Changed",
    "changeInfo": "If the caption engine is already running, you need to restart it for the changes to take effect.",
    "styleChange": "Caption Style Changed",
    "styleInfo": "Caption style changes have been saved and applied."
  },
  general: {
    "title": "General Settings",
    "uiLanguage": "Language",
    "barWidth": "Width",
    "note": "General Settings take effect immediately. Please note that changes to the Caption Engine Settings and Caption Style Settings will only take effect after clicking Apply.",
    "theme": "Theme",
    "light": "light",
    "dark": "dark",
    "system": "system"
  },
  engine: {
    "title": "Caption Engine Settings",
    "applyChange": "Apply Changes",
    "cancelChange": "Cancel Changes",
    "sourceLang": "Source",
    "transLang": "Translation",
    "captionEngine": "Engine",
    "audioType": "Audio Type",
    "systemOutput": "System Audio Output (Speaker)",
    "systemInput": "System Audio Input (Microphone)",
    "enableTranslation": "Translation",
    "showMore": "More Settings",
    "apikey": "API KEY",
    "modelPath": "Model Path",
    "apikeyInfo": "API KEY required for the Gummy subtitle engine, which needs to be obtained from the Alibaba Cloud Bailing platform. For more details, see the project user manual.",
    "modelPathInfo": "The folder path of the model required by the Vosk subtitle engine. You need to download the required model to your local machine in advance. For more details, see the project user manual.",
    "customEngine": "Custom Engine",
    custom: {
      "title": "Custom Caption Engine",
      "attention": "Attention",
      "note": "Note: Allows users to provide captions using a custom engine. The provided engine should be able to start via the command line and can specify parameters through command-line instructions. The engine needs to communicate with the node.js backend using standard output. For more information, refer to the project's documentation.",
      "app": "Engine Path",
      "command": "Command"
    }
  },
  style: {
    "title": "Caption Style Settings",
    "applyStyle": "Apply",
    "cancelChange": "Cancel",
    "resetStyle": "Reset",
    "longCaption": "LongCaption",
    "fontFamily": "Font Family",
    "fontColor": "Font Color",
    "fontSize": "Font Size",
    "fontWeight": "Font Weight",
    "background": "Background",
    "opacity": "Opacity",
    "preview": "Preview",
    "translation": "Show Translation",
    trans: {
      "title": "Translation Style Settings",
      "useSame": "Use Original Style"
    },
    "textShadow": "Text Shadow",
    shadow: {
      "title": "Text Shadow Settings",
      "offsetX": "Offset X",
      "offsetY": "Offset Y",
      "blur": "Blur",
      "color": "Color"
    }
  },
  status: {
    "engine": "Caption Engine",
    "engineStatus": "Caption Engine Status",
    "pid": "Process ID",
    "ppid": "Parent Process ID",
    "cpu": "CPU Usage",
    "mem": "Memory Usage",
    "elapsed": "Running Time",
    "customized": "Customized",
    "status": "Engine Status",
    "started": "Started",
    "stopped": "Not Started",
    "logNumber": "Caption Count",
    "aboutProj": "About Project",
    "openCaption": "Open Caption Window",
    "startEngine": "Start Caption Engine",
    "restartEngine": "Restart Caption Engine",
    "stopEngine": "Stop Caption Engine",
    about: {
      "title": "About This Project",
      "proj": "Auto Caption Project",
      "desc": "A cross-platform real-time caption display software supporting multiple languages.",
      "version": "Software Version",
      "author": "Project Author",
      "projLink": "Project Link",
      "manual": "User Manual",
      "engineDoc": "Caption Engine Manual",
      "date": "July 17, 2025"
    }
  },
  log: {
    "title": "Caption Log",
    "changeTime": "Modify Time",
    "baseTime": "First Caption Start Time",
    "hour": "Hour",
    "min": "Minute",
    "sec": "Second",
    "ms": "Millisecond",
    "export": "Export Log",
    "copy": "Copy Log",
    "exportOptions": "Export Options",
    "exportFormat": "Format",
    "exportContent": "Content",
    "copyOptions": "Copy Options",
    "addIndex": "Add Index",
    "copyTime": "Copy Time",
    "copyContent": "Content",
    "both": "Both",
    "source": "Original",
    "translation": "Translation",
    "copySuccess": "Subtitle copied to clipboard",
    "clear": "Clear Log"
  }
}
