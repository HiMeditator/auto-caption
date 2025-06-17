import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { controlWindow } from './control'
import { captionWindow } from './caption'

import { PythonProcess } from './pythonProcess'
const pySubProcess = new PythonProcess()

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.himeditator.autocaption')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  controlWindow.handleMessage()
  captionWindow.handleMessage()

  controlWindow.createWindow()

  pySubProcess.start()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0){
      controlWindow.createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
