import { shell, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { setStyles, sendStyles, sendCaptionLog } from './data'
import { captionWindow } from './caption'

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
        sendStyles(this.window);
        sendCaptionLog(this.window);
      }
    }, 1000);
    

    this.window.on('ready-to-show', () => {
      this.window?.show()
    })
  
    this.window.on('closed', () => {
      console.log('INFO control window closed')
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
      console.log('GET control.style.change', args)
      setStyles(args)
      if(captionWindow.window){
        sendStyles(captionWindow.window)
      }
    })
    // 控制窗口请求创建字幕窗口
    ipcMain.on('control.captionWindow.activate', () => {
      if(!captionWindow.window){
        captionWindow.createWindow()
        console.log('GET control.captionWindow.activate')
      }
      else {
        captionWindow.window.show()
      }
    })
  }
}

export const controlWindow = new ControlWindow()