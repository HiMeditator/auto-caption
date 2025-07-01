import { shell, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { captionWindow } from './CaptionWindow'
import { allConfig } from './utils/AllConfig'
import { captionEngine } from './utils/CaptionEngine'

class ControlWindow {
  window: BrowserWindow | undefined;

  public createWindow(): void {
    this.window = new BrowserWindow({
      icon: icon,
      width: 1200,
      height: 800,
      minWidth: 600,
      minHeight: 400,
      show: false,
      center: true,
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    allConfig.readConfig()

    setTimeout(() => {
      if (this.window) {
        allConfig.sendStyles(this.window)
        allConfig.sendControls(this.window)
        allConfig.sendCaptionLog(this.window, 'set')
      }
    }, 1000);

    this.window.on('ready-to-show', () => {
      this.window?.show()
    })

    this.window.on('closed', () => {
      this.window = undefined
      allConfig.writeConfig()
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
    // 样式变更
    ipcMain.on('control.style.change', (_, args) => {
      allConfig.setStyles(args)
      if(captionWindow.window){
        allConfig.sendStyles(captionWindow.window)
      }
    })

    // 样式重置
    ipcMain.on('control.style.reset', () => {
      allConfig.resetStyles()
      if(this.window){
        allConfig.sendStyles(this.window)
      }
      if(captionWindow.window){
        allConfig.sendStyles(captionWindow.window)
      }
    })

    // 激活字幕窗口
    ipcMain.on('control.captionWindow.activate', () => {
      if(!captionWindow.window){
        captionWindow.createWindow()
      }
      else {
        captionWindow.window.show()
      }
    })

    // 字幕引擎配置更新
    ipcMain.on('control.control.change', (_, args) => {
      allConfig.setControls(args)
    })

    // 启动字幕引擎
    ipcMain.on('control.engine.start', () => {
      if(allConfig.controls.engineEnabled){
        this.window?.webContents.send('control.engine.already')
      }
      else {
        captionEngine.start()
      }
    })

    // 停止字幕引擎
    ipcMain.on('control.engine.stop', () => {
      captionEngine.stop()
      this.window?.webContents.send('control.engine.stopped')
    })

    // 清空字幕记录
    ipcMain.on('control.caption.clear', () => {
      allConfig.captionLog.splice(0)
    })
  }

  public sendErrorMessage(message: string) {
    this.window?.webContents.send('control.error.send', message)
  }
}

export const controlWindow = new ControlWindow()
