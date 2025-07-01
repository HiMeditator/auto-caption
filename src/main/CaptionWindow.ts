import { shell, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { controlWindow } from './ControlWindow'
import { allConfig } from './utils/AllConfig'

class CaptionWindow {
  window: BrowserWindow | undefined;

  public createWindow(): void {
    this.window = new BrowserWindow({
      icon: icon,
      width: 900,
      height: 100,
      minWidth: 480,
      show: false,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
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
        allConfig.sendStyles(this.window);
        allConfig.sendCaptionLog(this.window, 'set');
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
      this.window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/caption`)
    } else {
      this.window.loadFile(path.join(__dirname, '../renderer/index.html'), {
        hash: 'caption'
      })
    }
  }

  public handleMessage() {
    // 激活控制窗口
    ipcMain.on('caption.controlWindow.activate', () => {
      if(!controlWindow.window){
        controlWindow.createWindow()
      }
      else {
        controlWindow.window.show()
      }
    })

    // 字幕窗口高度发生变化
    ipcMain.on('caption.windowHeight.change', (_, height) => {
      if(this.window){
        this.window.setSize(this.window.getSize()[0], height)
      }
    })

    // 关闭字幕窗口
    ipcMain.on('caption.window.close', () => {
      if(this.window){
        this.window.close()
      }
    })

    // 是否固定在最前面
    ipcMain.on('caption.pin.set', (_, pinned) => {
      if(this.window){
        this.window.setAlwaysOnTop(pinned)
      }
    })
  }
}

export const captionWindow = new CaptionWindow()
