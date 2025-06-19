import { Styles, CaptionItem, Controls } from '../types'
import { BrowserWindow } from 'electron'

export const styles: Styles = {
  fontFamily: 'sans-serif',
  fontSize: 24,
  fontColor: '#000000',
  background: '#dbe2ef',
  opacity: 80,
  transDisplay: true,
  transFontFamily: 'sans-serif',
  transFontSize: 24,
  transFontColor: '#000000'
}

export const captionLog: CaptionItem[] = []

export const controls: Controls = {
  sourceLang: 'en',
  targetLang: 'zh',
  engine: 'gummy',
  translation: true,
  customized: false,
  customizedApp: '',
  customizedCommand: ''
}

export function setStyles(args: any) {
  styles.fontFamily = args.fontFamily
  styles.fontSize = args.fontSize
  styles.fontColor = args.fontColor
  styles.background = args.background
  styles.opacity = args.opacity
  styles.transDisplay = args.transDisplay
  styles.transFontFamily = args.transFontFamily
  styles.transFontSize = args.transFontSize
  styles.transFontColor = args.transFontColor
  console.log('[INFO] Set Styles:', styles)
}

export function sendStyles(window: BrowserWindow) {
  window.webContents.send('caption.style.set', styles)
  console.log('[INFO] Send Styles:', styles)
}

export function sendCaptionLog(window: BrowserWindow) {
  window.webContents.send('both.log.set', captionLog)
}

export function addCaptionLog(log: CaptionItem) {
  if(captionLog.length && captionLog[captionLog.length - 1].index === log.index) {
    captionLog.splice(captionLog.length - 1, 1)
    captionLog.push(log)
  }
  else {
    captionLog.push(log)
  }
  for(const window of BrowserWindow.getAllWindows()){
    sendCaptionLog(window)
  }
}

export function setControls(args: any) {
  controls.sourceLang = args.sourceLang
  controls.targetLang = args.targetLang
  controls.engine = args.engine
  controls.translation = args.translation
  controls.customized = args.customized
  controls.customizedApp = args.customizedApp
  controls.customizedCommand = args.customizedCommand
  console.log('[INFO] Set Controls:', controls)
}