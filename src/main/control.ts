import { shell, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { captionWindow } from './caption'
import {
  captionEngine,
  captionLog,
  controls,
  setStyles,
  resetStyles,
  sendStyles,
  sendCaptionLog,
  setControls,
  sendControls,
  readConfig
} from './utils/config'

class ControlWindow {
  window: BrowserWindow | undefined;

  public createWindow(): void {
    this.window = new BrowserWindow({
      icon: icon,
      width: 1200,
      height: 800,
      minWidth: 900,
      minHeight: 600,
      show: false,
      center: true,
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    setTimeout(() => {
      if (this.window) {
        readConfig()
        sendStyles(this.window) // 配置初始样式
        sendCaptionLog(this.window, 'set') // 配置当前字幕记录
        sendControls(this.window) // 配置字幕引擎配置
      }
    }, 1000);
    

    this.window.on('ready-to-show', () => {
      this.window?.show()
    })
  
    this.window.on('closed', () => {
      this.window = undefined
    })
  
    this.window.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })
  
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.window.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      this.window.loadFile(path.join(__dirname, '../renderer/index.html'))
    }
  }

  public handleMessage() {
    // 控制窗口样式更新
    ipcMain.on('control.style.change', (_, args) => {
      setStyles(args)
      if(captionWindow.window){
        sendStyles(captionWindow.window)
      }
    })
    ipcMain.on('control.style.reset', () => {
      resetStyles()
      if(captionWindow.window){
        sendStyles(captionWindow.window)
      }
      if(this.window){
        sendStyles(this.window)
      }
    })
    // 控制窗口请求创建字幕窗口
    ipcMain.on('control.captionWindow.activate', () => {
      if(!captionWindow.window){
        captionWindow.createWindow()
      }
      else {
        captionWindow.window.show()
      }
    })
    // 字幕引擎控制配置更新并启动引擎
    ipcMain.on('control.control.change', (_, args) => {
      setControls(args)
    })
    // 启动字幕引擎
    ipcMain.on('control.engine.start', () => {
      if(controls.engineEnabled){
        this.window?.webContents.send('control.engine.already')
      }
      else {
        if(
          process.env.DASHSCOPE_API_KEY ||
          (controls.customized && controls.customizedApp)
        ) {
          if(this.window){
            captionEngine.start(this.window)
          }
        }
        else {
          this.sendErrorMessage('没有检测到 DASHSCOPE_API_KEY 环境变量，如果要使用 gummy 引擎，需要在阿里云百炼平台获取 API Key 并添加到本机环境变量')
        }
      }
    })
    // 停止字幕引擎
    ipcMain.on('control.engine.stop', () => {
      captionEngine.stop()
      this.window?.webContents.send('control.engine.stopped')
    })
    // 清空字幕记录
    ipcMain.on('control.caption.clear', () => {
      captionLog.splice(0)
    })
  }

  public sendErrorMessage(message: string) {
    this.window?.webContents.send('control.error.send', message)
  }
}

export const controlWindow = new ControlWindow()