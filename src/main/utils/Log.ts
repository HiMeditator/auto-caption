import { controlWindow } from "../ControlWindow"
import { type SoftwareLogItem } from "../types"

let logIndex = 0
const logQueue: SoftwareLogItem[] = []

function getTimeString() {
  const now = new Date()
  const HH = String(now.getHours()).padStart(2, '0')
  const MM = String(now.getMinutes()).padStart(2, '0')
  const SS = String(now.getSeconds()).padStart(2, '0')
  const MS = String(now.getMilliseconds()).padStart(3, '0')
  return `${HH}:${MM}:${SS}.${MS}`
}

export class Log {
  static getAndClearLogQueue() {
    const copiedQueue = structuredClone(logQueue)
    logQueue.length = 0
    return copiedQueue
  }

  static handleLog(logType: "INFO" | "WARN" | "ERROR", ...msg: any[]) {
    const timeStr = getTimeString()
    const logPre = `[${logType} ${timeStr}]`
    let logStr = ""
    for(let i = 0; i < msg.length; i++) {
      logStr += i ? " " : ""
      if(typeof msg[i] === "string") logStr += msg[i]
      else logStr += JSON.stringify(msg[i], undefined, 2)
    }
    console.log(logPre, logStr)
    const logItem: SoftwareLogItem = {
      type: logType,
      index: ++logIndex,
      time: timeStr,
      text: logStr
    }
    if(controlWindow.mounted && controlWindow.window) {
      controlWindow.window.webContents.send('control.softwareLog.add', logItem)
    }
    else {
      logQueue.push(logItem)
    }
  }

  static info(...msg: any[]){
    this.handleLog("INFO", ...msg)
  }

  static warn(...msg: any[]){
    this.handleLog("WARN", ...msg)
  }

  static error(...msg: any[]){
    this.handleLog("ERROR", ...msg)
  }
}
