export default {
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
    "stopped": "Caption Engine Stopped",
    "stoppedInfo": "The caption engine has stopped. You can click the 'Start Caption Engine' button to restart it.",
    "error": "An error occurred",
    "engineChange": "Cpation Engine Configuration Changed",
    "changeInfo": "If the caption engine is already running, you need to restart it for the changes to take effect."
  },
  general: {
    "title": "General Settings",
    "uiLanguage": "Language",
    "barWidth": "Width",
    "note": "General Settings take effect immediately. Please note that changes to the Caption Engine Settings and Caption Style Settings will only take effect after clicking Apply.",
    "theme": "theme",
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
    "fontFamily": "Font Family",
    "fontColor": "Font Color",
    "fontSize": "Font Size",
    "background": "Background",
    "opacity": "Opacity",
    "preview": "Preview",
    "translation": "Show Translation",
    trans: {
      "title": "Translation Style Settings",
      "useSame": "Use Original Style"
    }
  },
  status: {
    "engine": "Caption Engine",
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
      "date": "June 26, 2026"
    }
  },
  log: {
    "title": "Caption Log",
    "export": "Export Caption Log",
    "clear": "Clear Caption Log"
  }
}
