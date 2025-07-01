import { Styles, CaptionItem, Controls } from '../types'
import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import * as fs from 'fs'

const defaultStyles: Styles = {
  fontFamily: 'sans-serif',
  fontSize: 24,
  fontColor: '#000000',
  background: '#dbe2ef',
  opacity: 80,
  transDisplay: true,
  transFontFamily: 'sans-serif',
  transFontSize: 24,
  transFontColor: '#000000'
};

const defaultControls: Controls = {
  sourceLang: 'en',
  targetLang: 'zh',
  engine: 'gummy',
  audio: 0,
  engineEnabled: false,
  translation: true,
  customized: false,
  customizedApp: '',
  customizedCommand: ''
};


class AllConfig {
  styles: Styles = {...defaultStyles};
  controls: Controls = {...defaultControls};
  captionLog: CaptionItem[] = [];

  constructor() {}

  public readConfig() {
    const configPath = path.join(app.getPath('userData'), 'config.json')
    if(fs.existsSync(configPath)){
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      this.setStyles(config.styles)
      this.setControls(config.controls)
      console.log('[INFO] Read Config from:', configPath)
    }
  }

  public writeConfig() {
    const config = {
      controls: this.controls,
      styles: this.styles
    }
    const configPath = path.join(app.getPath('userData'), 'config.json')
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    console.log('[INFO] Write Config to:', configPath)
  }

  public setStyles(args: any) {
    this.styles = {...args}
    console.log('[INFO] Set Styles:', this.styles)
  }

  public resetStyles() {
    this.setStyles(defaultStyles)
  }

  public sendStyles(window: BrowserWindow) {
    window.webContents.send('caption.style.set', this.styles)
    console.log(`[INFO] Send Styles to #${window.id}:`, this.styles)
  }

  public setControls(args: any) {
    const engineEnabled = args.engineEnabled
    this.controls = {...args}
    this.controls.engineEnabled = engineEnabled
    console.log('[INFO] Set Controls:', this.controls)
  }

  public sendControls(window: BrowserWindow) {
    window.webContents.send('control.control.set', this.controls)
    console.log(`[INFO] Send Controls to #${window.id}:`, this.controls)
  }

  public updateCaptionLog(log: CaptionItem) {
    if(this.captionLog.length && this.captionLog[this.captionLog.length - 1].index === log.index) {
      this.captionLog.splice(this.captionLog.length - 1, 1, log)
    }
    else {
      this.captionLog.push(log)
    }
    for(const window of BrowserWindow.getAllWindows()){
      this.sendCaptionLog(window, 'add')
    }
  }

  public sendCaptionLog(window: BrowserWindow, command: 'add' | 'set') {
    if(command === 'add'){
      window.webContents.send(`both.log.add`, this.captionLog[this.captionLog.length - 1])
    }
    else if(command === 'set'){
      window.webContents.send(`both.log.${command}`, this.captionLog)
    }
  }
}

export const allConfig = new AllConfig()
