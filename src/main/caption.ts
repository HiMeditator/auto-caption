import { shell, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { controlWindow } from './control'
import { sendStyles } from './data'

class CaptionWindow { 
  window: BrowserWindow | undefined;
  
  public createWindow(): void { 
    this.window = new BrowserWindow({
      icon: icon,
      width: 900,
      height: 320,
      show: false,
      // center: true,
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
      }
    }, 1000);

    this.window.on('ready-to-show', () => {
      this.window?.show()
    })

    this.window.on('closed', () => {
      console.log('INFO caption window closed')
      this.window = undefined
    })

    this.window.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })
  
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/caption`)
    } else {
      this.window.loadFile(path.join(__dirname, '../renderer/index.html'), {
        hash: 'caption'
      })
    }
  }

  public handleMessage() {
    // 字幕窗口请求创建控制窗口
    ipcMain.on('caption.controlWindow.create', () => {
      if(!controlWindow.window){
        controlWindow.createWindow()
        console.log('caption.controlWindow.create')
      }
    })
  }
}

export const captionWindow = new CaptionWindow()
