import { BrowserWindow } from 'electron'

export interface Styles {
  fontFamily: string,
  fontSize: number,
  fontColor: string,
  background: string,
  opacity: number,
  transDisplay: boolean,
  transFontFamily: string,
  transFontSize: number,
  transFontColor: string
}

export interface CaptionItem {
  index: number,
  time_s: string,
  time_t: string,
  text: string,
  translation: string
}

export let styles: Styles = {
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
}

export function sendStyles(window: BrowserWindow) {
  window.webContents.send('caption.style.set', styles)
  console.log('SNED caption.style.set')
}

export let captionLog: CaptionItem[] = []

export function sendCaptionLog(window: BrowserWindow) {
  window.webContents.send('both.log.set', captionLog)
  console.log('SEND both.log.set')
}

export function addCaptionLog(log: CaptionItem) {
  if(captionLog.length && captionLog[captionLog.length - 1].index === log.index) {
    captionLog.splice(captionLog.length - 1, 1)
    captionLog.push(log)
  }
  else {
    captionLog.push(log)
  }
  console.log('ADD caption')
  for(const window of BrowserWindow.getAllWindows()){
    sendCaptionLog(window)
  }
}