import {
  UILanguage, UITheme, Styles, Controls,
  CaptionItem, FullConfig, SoftwareLogItem
} from '../types'
import { Log } from './Log'
import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import os from 'os'

interface CaptionTranslation {
  time_s: string,
  translation: string
}

function getDesktopPath() {
  const homeDir = os.homedir()
  return path.join(homeDir, 'Desktop')
}

const defaultStyles: Styles = {
  lineNumber: 1,
  lineBreak: 1,
  fontFamily: 'sans-serif',
  fontSize: 24,
  fontColor: '#000000',
  fontWeight: 4,
  background: '#dbe2ef',
  opacity: 80,
  showPreview: true,
  transDisplay: true,
  transFontFamily: 'sans-serif',
  transFontSize: 24,
  transFontColor: '#000000',
  transFontWeight: 4,
  textShadow: false,
  offsetX: 2,
  offsetY: 2,
  blur: 0,
  textShadowColor: '#ffffff'
};

const defaultControls: Controls = {
  sourceLang: 'en',
  targetLang: 'zh',
  transModel: 'ollama',
  ollamaName: '',
  engine: 'gummy',
  audio: 0,
  engineEnabled: false,
  API_KEY: '',
  voskModelPath: '',
  sosvModelPath: '',
  recordingPath: getDesktopPath(),
  translation: true,
  recording: false,
  customized: false,
  customizedApp: '',
  customizedCommand: '',
  startTimeoutSeconds: 30
};


class AllConfig {
  captionWindowWidth: number = 900;

  uiLanguage: UILanguage = 'zh';
  leftBarWidth: number = 8;
  uiTheme: UITheme = 'system';
  uiColor: string = '#1677ff';
  styles: Styles = {...defaultStyles};
  controls: Controls = {...defaultControls};
  
  lastLogIndex: number = -1;
  captionLog: CaptionItem[] = [];

  constructor() {}

  public readConfig() {
    const configPath = path.join(app.getPath('userData'), 'config.json')
    if(fs.existsSync(configPath)){
      Log.info('Read Config from:', configPath)
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      if(config.captionWindowWidth) this.captionWindowWidth = config.captionWindowWidth
      if(config.uiLanguage) this.uiLanguage = config.uiLanguage
      if(config.uiTheme) this.uiTheme = config.uiTheme
      if(config.uiColor) this.uiColor = config.uiColor
      if(config.leftBarWidth) this.leftBarWidth = config.leftBarWidth
      if(config.styles) this.setStyles(config.styles)
      if(config.controls) this.setControls(config.controls)
    }
  }

  public writeConfig() {
    const config = {
      captionWindowWidth: this.captionWindowWidth,
      uiLanguage: this.uiLanguage,
      uiTheme: this.uiTheme,
      uiColor: this.uiColor,
      leftBarWidth: this.leftBarWidth,
      controls: this.controls,
      styles: this.styles
    }
    const configPath = path.join(app.getPath('userData'), 'config.json')
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    Log.info('Write Config to:', configPath)
  }

  public getFullConfig(softwareLog: SoftwareLogItem[]): FullConfig {
    return {
      platform: process.platform,
      uiLanguage: this.uiLanguage,
      uiTheme: this.uiTheme,
      uiColor: this.uiColor,
      leftBarWidth: this.leftBarWidth,
      styles: this.styles,
      controls: this.controls,
      captionLog: this.captionLog,
      softwareLog: softwareLog
    }
  }

  public setStyles(args: Object) {
    for(let key in this.styles) {
      if(key in args) {
        this.styles[key] = args[key]
      }
    }
    Log.info('Set Styles:', this.styles)
  }

  public resetStyles() {
    this.setStyles(defaultStyles)
  }

  public sendStyles(window: BrowserWindow) {
    window.webContents.send('both.styles.set', this.styles)
    Log.info(`Send Styles to #${window.id}:`, this.styles)
  }

  public setControls(args: Object) {
    const engineEnabled = this.controls.engineEnabled
    for(let key in this.controls){
      if(key in args) {
        this.controls[key] = args[key]
      }
    }
    this.controls.engineEnabled = engineEnabled
    let _controls = {...this.controls}
    _controls.API_KEY = _controls.API_KEY.replace(/./g, '*')
    Log.info('Set Controls:', _controls)
  }

  public sendControls(window: BrowserWindow, info = true) {
    window.webContents.send('control.controls.set', this.controls)
    if(info) Log.info(`Send Controls to #${window.id}:`, this.controls)
  }

  public updateCaptionLog(log: CaptionItem) {
    let command: 'add' | 'upd' = 'add'
    if(
      this.captionLog.length &&
      this.lastLogIndex === log.index
    ) {
      this.captionLog.splice(this.captionLog.length - 1, 1, log)
      command = 'upd'
    }
    else {
      this.captionLog.push(log)
      this.lastLogIndex = log.index
    }
    this.captionLog[this.captionLog.length - 1].index = this.captionLog.length
    for(const window of BrowserWindow.getAllWindows()){
      this.sendCaptionLog(window, command)
    }
  }

  public updateCaptionTranslation(trans: CaptionTranslation){
    for(let i = this.captionLog.length - 1; i >= 0; i--){
      if(this.captionLog[i].time_s === trans.time_s){
        this.captionLog[i].translation = trans.translation
        for(const window of BrowserWindow.getAllWindows()){
          this.sendCaptionLog(window, 'upd', i)
        }
        break
      }
    }
  }
  public sendCaptionLog(
    window: BrowserWindow,
    command: 'add' | 'upd' | 'set',
    index: number | undefined = undefined
  ) {
    if(command === 'add'){
      window.webContents.send(`both.captionLog.add`, this.captionLog.at(-1))
    }
    else if(command === 'upd'){
      if(index !== undefined) window.webContents.send(`both.captionLog.upd`, this.captionLog[index])
      else window.webContents.send(`both.captionLog.upd`, this.captionLog.at(-1))
    }
    else if(command === 'set'){
      window.webContents.send(`both.captionLog.set`, this.captionLog)
    }
  }
}

export const allConfig = new AllConfig()
