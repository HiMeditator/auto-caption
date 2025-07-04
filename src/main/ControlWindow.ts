import { shell, BrowserWindow, ipcMain, nativeTheme } from 'electron'
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
      minWidth: 750,
      minHeight: 500,
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
    nativeTheme.on('updated', () => {
      if(allConfig.uiTheme === 'system'){
        if(nativeTheme.shouldUseDarkColors && this.window){
          this.window.webContents.send('control.nativeTheme.change', 'dark')
        }
        else if(!nativeTheme.shouldUseDarkColors && this.window){
          this.window.webContents.send('control.nativeTheme.change', 'light')
        }
      }
    })

    ipcMain.handle('both.window.mounted', () => {
      return allConfig.getFullConfig()
    })

    ipcMain.handle('control.nativeTheme.get', () => {
      if(nativeTheme.shouldUseDarkColors) return 'dark'
      return 'light'
    })

    ipcMain.on('control.uiLanguage.change', (_, args) => {
      allConfig.uiLanguage = args
      if(captionWindow.window){
        captionWindow.window.webContents.send('control.uiLanguage.set', args)
      }
    })

    ipcMain.on('control.uiTheme.change', (_, args) => {
      allConfig.uiTheme = args
    })

    ipcMain.on('control.leftBarWidth.change', (_, args) => {
      allConfig.leftBarWidth = args
    })

    ipcMain.on('control.styles.change', (_, args) => {
      allConfig.setStyles(args)
      if(captionWindow.window){
        allConfig.sendStyles(captionWindow.window)
      }
    })

    ipcMain.on('control.styles.reset', () => {
      allConfig.resetStyles()
      if(this.window){
        allConfig.sendStyles(this.window)
      }
      if(captionWindow.window){
        allConfig.sendStyles(captionWindow.window)
      }
    })

    ipcMain.on('control.captionWindow.activate', () => {
      if(!captionWindow.window){
        captionWindow.createWindow()
      }
      else {
        captionWindow.window.show()
      }
    })

    ipcMain.on('control.controls.change', (_, args) => {
      allConfig.setControls(args)
    })

    ipcMain.on('control.engine.start', () => {
      captionEngine.start()
    })

    ipcMain.on('control.engine.stop', () => {
      captionEngine.stop()
    })

    ipcMain.on('control.captionLog.clear', () => {
      allConfig.captionLog.splice(0)
    })
  }

  public sendErrorMessage(message: string) {
    this.window?.webContents.send('control.error.occurred', message)
  }
}

export const controlWindow = new ControlWindow()
