import { spawn, exec } from 'child_process'
import { app } from 'electron'
import { is } from '@electron-toolkit/utils'
import path from 'path'
import { controlWindow } from '../ControlWindow'
import { allConfig } from './AllConfig'
import { i18n } from '../i18n'

export class CaptionEngine {
  appPath: string = ''
  command: string[] = []
  process: any | undefined

  private getApp(): boolean {
    if (allConfig.controls.customized && allConfig.controls.customizedApp) {
      this.appPath = allConfig.controls.customizedApp
      this.command = [allConfig.controls.customizedCommand]
    }
    else if (allConfig.controls.engine === 'gummy') {
      allConfig.controls.customized = false
      if(!process.env.DASHSCOPE_API_KEY) {
        controlWindow.sendErrorMessage(i18n('gummy.env.missing'))
        return false
      }
      let gummyName = ''
      if (process.platform === 'win32') {
        gummyName = 'main-gummy.exe'
      }
      else if (process.platform === 'linux') {
        gummyName = 'main-gummy'
      }
      else {
        controlWindow.sendErrorMessage(i18n('platform.unsupported') + process.platform)
        throw new Error(i18n('platform.unsupported'))
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
      this.command.push('-s', allConfig.controls.sourceLang)
      this.command.push(
        '-t', allConfig.controls.translation ?
        allConfig.controls.targetLang : 'none'
      )
      this.command.push('-a', allConfig.controls.audio ? '1' : '0')

      console.log('[INFO] Engine Path:', this.appPath)
      console.log('[INFO] Engine Command:', this.command)
    }
    return true
  }

  public start() {
    if (this.process) { this.stop() }
    if(!this.getApp()){ return }

    try {
      this.process = spawn(this.appPath, this.command)
    }
    catch (e) {
      controlWindow.sendErrorMessage(i18n('engine.start.error') + e)
      console.error('[ERROR] Error starting subprocess:', e)
      return
    }

    console.log('[INFO] Caption Engine Started')

    allConfig.controls.engineEnabled = true

    if(controlWindow.window){
      allConfig.sendControls(controlWindow.window)
      controlWindow.window.webContents.send('control.engine.started')
    }

    this.process.stdout.on('data', (data: any) => {
      const lines = data.toString().split('\n');
      lines.forEach((line: string) => {
        if (line.trim()) {
          try {
            const caption = JSON.parse(line);
            allConfig.updateCaptionLog(caption);
          } catch (e) {
            controlWindow.sendErrorMessage(i18n('engine.output.parse.error') + e)
            console.error('[ERROR] Error parsing JSON:', e);
          }
        }
      });
    });

    this.process.stderr.on('data', (data) => {
      controlWindow.sendErrorMessage(i18n('engine.error') + data)
      console.error(`[ERROR] Subprocess Error: ${data}`);
    });

    this.process.on('close', (code: any) => {
      console.log(`[INFO] Subprocess exited with code ${code}`);
      this.process = undefined;
      allConfig.controls.engineEnabled = false
      if(controlWindow.window){
        allConfig.sendControls(controlWindow.window)
      }
    });
  }

  public stop() {
    if (this.process) {
      if (process.platform === "win32" && this.process.pid) {
        exec(`taskkill /pid ${this.process.pid} /t /f`, (error) => {
          if (error) {
            controlWindow.sendErrorMessage(i18n('engine.shutdown.error') + error)
            console.error(`[ERROR] Failed to kill process: ${error}`)
          }
        });
      } else {
        this.process.kill('SIGKILL');
      }
    }
    this.process = undefined;
    allConfig.controls.engineEnabled = false;
    console.log('[INFO] Caption engine process stopped')
    if(controlWindow.window) {
      allConfig.sendControls(controlWindow.window)
    }
  }
}

export const captionEngine = new CaptionEngine()
