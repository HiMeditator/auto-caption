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

export let styles: Styles = {
  fontFamily: 'sans-serif',
  fontSize: 24,
  fontColor: '#000000',
  background: '#dbe2ef',
  opacity: 50,
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