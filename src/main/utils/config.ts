import { Styles, CaptionItem, Controls } from '../types'
import { BrowserWindow } from 'electron'
import { CaptionEngine } from './engine'

export const captionEngine = new CaptionEngine()

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
  audio: 0,
  engineEnabled: false,
  translation: true,
  customized: false,
  customizedApp: '',
  customizedCommand: ''
}

export let engineRunning: boolean = false

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
  console.log(`[INFO] Send Styles to #${window.id}:`, styles)
}

export function sendCaptionLog(window: BrowserWindow, command: string) {
  if(command === 'add'){
    window.webContents.send(`both.log.add`, captionLog[captionLog.length - 1])
  }
  else if(command === 'set'){
    window.webContents.send(`both.log.${command}`, captionLog)
  }
}

export function addCaptionLog(log: CaptionItem) {
  if(captionLog.length && captionLog[captionLog.length - 1].index === log.index) {
    captionLog.splice(captionLog.length - 1, 1, log)
  }
  else {
    captionLog.push(log)
  }
  for(const window of BrowserWindow.getAllWindows()){
    sendCaptionLog(window, 'add')
  }
}

export function setControls(args: any) {
  controls.sourceLang = args.sourceLang
  controls.targetLang = args.targetLang
  controls.engine = args.engine
  controls.audio = args.audio
  controls.translation = args.translation
  controls.customized = args.customized
  controls.customizedApp = args.customizedApp
  controls.customizedCommand = args.customizedCommand
  console.log('[INFO] Set Controls:', controls)
}

export function sendControls(window: BrowserWindow) {
  window.webContents.send('control.control.set', controls)
  console.log(`[INFO] Send Controls to #${window.id}:`, controls)
}