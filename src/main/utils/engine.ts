import { spawn, exec } from 'child_process'
import { app, BrowserWindow } from 'electron'
import { is } from '@electron-toolkit/utils'
import path from 'path'
import { addCaptionLog, controls, sendControls } from './config'
import { controlWindow } from '../control'

export class CaptionEngine {
  appPath: string = ''
  command: string[] = []
  process: any | undefined

  private getApp() {
    if (controls.customized && controls.customizedApp) {
      this.appPath = controls.customizedApp
      this.command = [controls.customizedCommand]
    }
    else if (controls.engine === 'gummy') {
      controls.customized = false
      let gummyName = ''
      if (process.platform === 'win32') {
        gummyName = 'main-gummy.exe'
      }
      else if (process.platform === 'linux') {
        gummyName = 'main-gummy'
      }
      else {
        controlWindow.sendErrorMessage('不支持的操作系统平台：' + process.platform)
        throw new Error('Unsupported platform')
      }
      if (is.dev) {
        this.appPath = path.join(
          app.getAppPath(),
          'python-subprocess', 'dist', gummyName
        )
      }
      else {
        this.appPath = path.join(
          process.resourcesPath,
          'python-subprocess', 'dist', gummyName
        )
      }
      this.command = []
      this.command.push('-s', controls.sourceLang)
      this.command.push('-t', controls.translation ? controls.targetLang : 'none')
      this.command.push('-a', controls.audio ? '1' : '0')

      console.log('[INFO] Engine Path:', this.appPath)
      console.log('[INFO] Engine Command:', this.command)
    }
  }

  public start(window: BrowserWindow) {
    if (this.process) {
      this.stop();
    }
    this.getApp()
    try {
      this.process = spawn(this.appPath, this.command)
    }
    catch (e) {
      controlWindow.sendErrorMessage('字幕引擎启动失败：' + e)
      console.error('[ERROR] Error starting subprocess:', e)
      return
    }

    console.log('[INFO] Caption Engine Started: ', {
      appPath: this.appPath,
      command: this.command
    })

    controls.engineEnabled = true
    sendControls(window)
    window.webContents.send('control.engine.started')

    this.process.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      lines.forEach((line: string) => {
        if (line.trim()) {
          try {
            const caption = JSON.parse(line);
            addCaptionLog(caption);
          } catch (e) {
            controlWindow.sendErrorMessage('字幕引擎输出内容无法解析为 JSON 对象：' + e)
            console.error('[ERROR] Error parsing JSON:', e);
          }
        }
      });
    });

    this.process.stderr.on('data', (data) => {
      controlWindow.sendErrorMessage('字幕引擎错误：' + data)
      console.error(`[ERROR] Subprocess Error: ${data}`);
    });

    this.process.on('close', (code: any) => {
      console.log(`[INFO] Subprocess exited with code ${code}`);
      this.process = undefined;
    });
  }

  public stop() {
    if (this.process) {
      if (process.platform === "win32" && this.process.pid) {
        exec(`taskkill /pid ${this.process.pid} /t /f`, (error) => {
          if (error) {
            controlWindow.sendErrorMessage('字幕引擎进程关闭失败：' + error)
            console.error(`[ERROR] Failed to kill process: ${error}`);
          }
        });
      } else {
        this.process.kill('SIGKILL');
      }
      this.process = undefined;
      controls.engineEnabled = false;
      console.log('[INFO] Caption engine process stopped');
    }
  }
}