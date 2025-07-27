import { spawn, exec } from 'child_process'
import { app } from 'electron'
import { is } from '@electron-toolkit/utils'
import path from 'path'
import { controlWindow } from '../ControlWindow'
import { allConfig } from './AllConfig'
import { i18n } from '../i18n'
import { Log } from './Log'

export class CaptionEngine {
  appPath: string = ''
  command: string[] = []
  process: any | undefined
  processStatus: 'running' | 'stopping' | 'stopped' = 'stopped'

  private getApp(): boolean {
    if (allConfig.controls.customized && allConfig.controls.customizedApp) {
      Log.info('Using customized engine')
      this.appPath = allConfig.controls.customizedApp
      this.command = allConfig.controls.customizedCommand.split(' ')
    }
    else if (allConfig.controls.engine === 'gummy') {
      allConfig.controls.customized = false
      if(!allConfig.controls.API_KEY && !process.env.DASHSCOPE_API_KEY) {
        controlWindow.sendErrorMessage(i18n('gummy.key.missing'))
        return false
      }
      let gummyName = 'main-gummy'
      if (process.platform === 'win32') { gummyName += '.exe' }
      this.command = []
      if (is.dev) {
        this.appPath = path.join(
          app.getAppPath(), 'engine',
          'subenv', 'Scripts', 'python.exe'
        )
        this.command.push(path.join(
          app.getAppPath(), 'engine', 'main-gummy.py'
        ))
      }
      else {
        this.appPath = path.join(
          process.resourcesPath, 'engine', gummyName
        )
      }
      this.command.push('-s', allConfig.controls.sourceLang)
      this.command.push(
        '-t', allConfig.controls.translation ?
        allConfig.controls.targetLang : 'none'
      )
      this.command.push('-a', allConfig.controls.audio ? '1' : '0')
      if(allConfig.controls.API_KEY) {
        this.command.push('-k', allConfig.controls.API_KEY)
      }
    }
    else if(allConfig.controls.engine === 'vosk'){
      allConfig.controls.customized = false
      let voskName = 'main-vosk'
      if (process.platform === 'win32') { voskName += '.exe' }
      this.command = []
      if (is.dev) {
        this.appPath = path.join(
          app.getAppPath(), 'engine',
          'subenv', 'Scripts', 'python.exe'
        )
        this.command.push(path.join(
          app.getAppPath(), 'engine', 'main-vosk.py'
        ))
      }
      else {
        this.appPath = path.join(
          process.resourcesPath, 'engine', voskName
        )
      }
      this.command.push('-a', allConfig.controls.audio ? '1' : '0')
      this.command.push('-m', `"${allConfig.controls.modelPath}"`)
    }
    Log.info('Engine Path:', this.appPath)
    Log.info('Engine Command:', this.command)
    return true
  }

  public start() {
    if (this.processStatus !== 'stopped') {
      Log.warn('Caption engine status is not stopped, cannot start')
      return
    }
    if(!this.getApp()){ return }

    try {
      this.process = spawn(this.appPath, this.command)
    }
    catch (e) {
      controlWindow.sendErrorMessage(i18n('engine.start.error') + e)
      Log.error('Error starting engine:', e)
      return
    }

    this.processStatus = 'running'
    Log.info('Caption Engine Started, PID:', this.process.pid)

    allConfig.controls.engineEnabled = true
    if(controlWindow.window){
      allConfig.sendControls(controlWindow.window)
      controlWindow.window.webContents.send(
        'control.engine.started',
        this.process.pid
      )
    }

    this.process.stdout.on('data', (data: any) => {
      const lines = data.toString().split('\n');
      lines.forEach((line: string) => {
        if (line.trim()) {
          try {
            const data_obj = JSON.parse(line)
            handleEngineData(data_obj)
          } catch (e) {
            controlWindow.sendErrorMessage(i18n('engine.output.parse.error') + e)
            Log.error('Error parsing JSON:', e)
          }
        }
      });
    });

    this.process.stderr.on('data', (data: any) => {
      if(this.processStatus === 'stopping') return
      controlWindow.sendErrorMessage(i18n('engine.error') + data)
      Log.error(`Engine Error: ${data}`);
    });

    this.process.on('close', (code: any) => {
      this.process = undefined;
      allConfig.controls.engineEnabled = false
      if(controlWindow.window){
        allConfig.sendControls(controlWindow.window)
        controlWindow.window.webContents.send('control.engine.stopped')
      }
      this.processStatus = 'stopped'
      Log.info(`Engine exited with code ${code}`)
    });
  }

  public stop() {
    if(this.processStatus !== 'running') return
    if (this.process.pid) {
      Log.info('Trying to stop process, PID:', this.process.pid)
      let cmd = `kill ${this.process.pid}`;
      if (process.platform === "win32") {
        cmd = `taskkill /pid ${this.process.pid} /t /f`
      }
      exec(cmd, (error) => {
        if (error) {
          controlWindow.sendErrorMessage(i18n('engine.shutdown.error') + error)
          Log.error(`Failed to kill process: ${error}`)
        }
      })
    }
    else {
      this.process = undefined;
      allConfig.controls.engineEnabled = false
      if(controlWindow.window){
        allConfig.sendControls(controlWindow.window)
        controlWindow.window.webContents.send('control.engine.stopped')
      }
      this.processStatus = 'stopped'
      Log.info('Process PID undefined, caption engine process stopped')
      return
    }
    this.processStatus = 'stopping'
    Log.info('Caption engine process stopping')
  }
}

function handleEngineData(data: any) {
  if(data.command === 'caption') {
    allConfig.updateCaptionLog(data);
  }
  else if(data.command === 'print') {
    Log.info('Engine print:', data.content)
  }
  else if(data.command === 'info') {
    Log.info('Engine info:', data.content)
  }
  else if(data.command === 'usage') {
    Log.info('Caption engine usage: ', data.content)
  }
}

export const captionEngine = new CaptionEngine()
