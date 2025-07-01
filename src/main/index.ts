import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { controlWindow } from './ControlWindow'
import { captionWindow } from './CaptionWindow'
import { allConfig } from './utils/AllConfig'
import { captionEngine } from './utils/CaptionEngine'

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.himeditator.autocaption')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  controlWindow.handleMessage()
  captionWindow.handleMessage()

  controlWindow.createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0){
      controlWindow.createWindow()
    }
  })
})

app.on('will-quit', async () => {
  captionEngine.stop()
  allConfig.writeConfig()
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
