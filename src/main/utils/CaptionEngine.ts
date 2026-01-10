import { exec, spawn } from 'child_process'
import { app } from 'electron'
import { is } from '@electron-toolkit/utils'
import * as path from 'path'
import * as net from 'net'
import { controlWindow } from '../ControlWindow'
import { allConfig } from './AllConfig'
import { i18n } from '../i18n'
import { Log } from './Log'

export class CaptionEngine {
  appPath: string = ''
  command: string[] = []
  process: any | undefined
  client: net.Socket | undefined
  port: number = 8080
  status: 'running' | 'starting' | 'stopping' | 'stopped' | 'starting-timeout' = 'stopped'
  timerID: NodeJS.Timeout | undefined
  startTimeoutID: NodeJS.Timeout | undefined

  private getApp(): boolean {
    if (allConfig.controls.customized) {
      Log.info('Using customized caption engine')
      this.appPath = allConfig.controls.customizedApp
      this.command = allConfig.controls.customizedCommand.split(' ')
      this.port = Math.floor(Math.random() * (65535 - 1024 + 1)) + 1024
      this.command.push('-p', this.port.toString())
    }
    else {
      if(allConfig.controls.engine === 'gummy' && 
        !allConfig.controls.API_KEY && !process.env.DASHSCOPE_API_KEY
      ) {
        controlWindow.sendErrorMessage(i18n('gummy.key.missing'))
        return false
      }
      this.command = []
      if (is.dev) {
        if(process.platform === "win32") {
          this.appPath = path.join(
            app.getAppPath(), 'engine',
            '.venv', 'Scripts', 'python.exe'
          )
          this.command.push(path.join(
            app.getAppPath(), 'engine', 'main.py'
          ))
          // this.appPath = path.join(app.getAppPath(), 'engine', 'dist', 'main.exe')
        }
        else {
          this.appPath = path.join(
            app.getAppPath(), 'engine',
            '.venv', 'bin', 'python3'
          )
          this.command.push(path.join(
            app.getAppPath(), 'engine', 'main.py'
          ))
        }
      }
      else {
        if(process.platform === 'win32') {
          this.appPath = path.join(process.resourcesPath, 'engine', 'main.exe')
        }
        else {
          this.appPath = path.join(process.resourcesPath, 'engine', 'main', 'main')
        }
      }
      this.command.push('-a', allConfig.controls.audio ? '1' : '0')
      if(allConfig.controls.recording) {
        this.command.push('-r', '1')
        this.command.push('-rp', `"${allConfig.controls.recordingPath}"`)
      }
      this.port = Math.floor(Math.random() * (65535 - 1024 + 1)) + 1024
      this.command.push('-p', this.port.toString())
      this.command.push(
        '-t', allConfig.controls.translation ?
        allConfig.controls.targetLang : 'none'
      )

      if(allConfig.controls.engine === 'gummy') {
        this.command.push('-e', 'gummy')
        this.command.push('-s', allConfig.controls.sourceLang)
        if(allConfig.controls.API_KEY) {
          this.command.push('-k', allConfig.controls.API_KEY)
        }
      }
      else if(allConfig.controls.engine === 'vosk'){
        this.command.push('-e', 'vosk')
        this.command.push('-vosk', `"${allConfig.controls.voskModelPath}"`)
        this.command.push('-tm', allConfig.controls.transModel)
        this.command.push('-omn', allConfig.controls.ollamaName)
        if(allConfig.controls.ollamaUrl) this.command.push('-ourl', allConfig.controls.ollamaUrl)
        if(allConfig.controls.ollamaApiKey) this.command.push('-okey', allConfig.controls.ollamaApiKey)
      }
      else if(allConfig.controls.engine === 'sosv'){
        this.command.push('-e', 'sosv')
        this.command.push('-s', allConfig.controls.sourceLang)
        this.command.push('-sosv', `"${allConfig.controls.sosvModelPath}"`)
        this.command.push('-tm', allConfig.controls.transModel)
        this.command.push('-omn', allConfig.controls.ollamaName)
        if(allConfig.controls.ollamaUrl) this.command.push('-ourl', allConfig.controls.ollamaUrl)
        if(allConfig.controls.ollamaApiKey) this.command.push('-okey', allConfig.controls.ollamaApiKey)
      }
      else if(allConfig.controls.engine === 'glm'){
        this.command.push('-e', 'glm')
        this.command.push('-s', allConfig.controls.sourceLang)
        this.command.push('-gurl', allConfig.controls.glmUrl)
        this.command.push('-gmodel', allConfig.controls.glmModel)
        if(allConfig.controls.glmApiKey) {
          this.command.push('-gkey', allConfig.controls.glmApiKey)
        }
        this.command.push('-tm', allConfig.controls.transModel)
        this.command.push('-omn', allConfig.controls.ollamaName)
        if(allConfig.controls.ollamaUrl) this.command.push('-ourl', allConfig.controls.ollamaUrl)
        if(allConfig.controls.ollamaApiKey) this.command.push('-okey', allConfig.controls.ollamaApiKey)
      }
    }
    Log.info('Engine Path:', this.appPath)
    if(this.command.length > 2 && this.command[this.command.length - 2] === '-k') {
      const _command = [...this.command]
      _command[_command.length -1] = _command[_command.length -1].replace(/./g, '*')
      Log.info('Engine Command:', _command)
    }
    else Log.info('Engine Command:', this.command)
    return true
  }

  public connect() {
    if(this.client) { Log.warn('Client already exists, ignoring...') }
    if (this.startTimeoutID) {
      clearTimeout(this.startTimeoutID)
      this.startTimeoutID = undefined
    }
    this.client = net.createConnection({ port: this.port }, () => {
      Log.info('Connected to caption engine server');
    });
    this.status = 'running'
    allConfig.controls.engineEnabled = true
    if(controlWindow.window){
      allConfig.sendControls(controlWindow.window, false)
      controlWindow.window.webContents.send(
        'control.engine.started',
        this.process.pid
      )
    }
  }

  public sendCommand(command: string, content: string = "") {
    if(this.client === undefined) {
      Log.error('Client not initialized yet')
      return
    }
    const data = JSON.stringify({command, content})
    this.client.write(data);
    Log.info(`Send data to python server: ${data}`);
  }

  public start() {
    if (this.status !== 'stopped') {
      Log.warn('Caption engine is not stopped, current status:', this.status)
      return
    }
    if(!this.getApp()){ return }

    this.process = spawn(this.appPath, this.command)
    this.status = 'starting'
    Log.info('Caption Engine Starting, PID:', this.process.pid)

    const timeoutMs = allConfig.controls.startTimeoutSeconds * 1000
    this.startTimeoutID = setTimeout(() => {
      if (this.status === 'starting') {
        Log.warn(`Engine start timeout after ${allConfig.controls.startTimeoutSeconds} seconds, forcing kill...`)
        this.status = 'starting-timeout'
        controlWindow.sendErrorMessage(i18n('engine.start.timeout'))
        this.kill()
      }
    }, timeoutMs)
    
    this.process.stdout.on('data', (data: any) => {
      const lines = data.toString().split('\n')
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
      const lines = data.toString().split('\n')
      lines.forEach((line: string) => {
        if(line.trim()){
          Log.error(line)       
        }
      })
    });

    this.process.on('close', (code: any) => {
      this.process = undefined;
      this.client = undefined
      allConfig.controls.engineEnabled = false
      if(controlWindow.window){
        allConfig.sendControls(controlWindow.window, false)
        controlWindow.window.webContents.send('control.engine.stopped')
      }
      this.status = 'stopped'
      clearInterval(this.timerID)
      if (this.startTimeoutID) {
        clearTimeout(this.startTimeoutID)
        this.startTimeoutID = undefined
      }
      Log.info(`Engine exited with code ${code}`)
    });
  }

  public stop() {
    if(this.status !== 'running'){
      Log.warn('Trying to stop engine which is not running, current status:', this.status)
    }
    this.sendCommand('stop')
    if(this.client){
      this.client.destroy()
      this.client = undefined
    }
    this.status = 'stopping'
    this.timerID = setTimeout(() => {
      if(this.status !== 'stopping') return
      Log.warn('Engine process still not stopped, trying to kill...')
      this.kill()
    }, 4000);
  }

  public kill(){
    if(!this.process || !this.process.pid) return
    if(this.status !== 'running'){
      Log.warn('Trying to kill engine which is not running, current status:', this.status)
    }
    Log.warn('Killing engine process, PID:', this.process.pid)

    if (this.startTimeoutID) {
      clearTimeout(this.startTimeoutID)
      this.startTimeoutID = undefined
    }
    if(this.client){
      this.client.destroy()
      this.client = undefined
    }
    if (this.process.pid) {
      let cmd = `kill -9 ${this.process.pid}`;
      if (process.platform === "win32") {
        cmd = `taskkill /pid ${this.process.pid} /t /f`
      }
      exec(cmd, (error) => {
        if (error) {
          Log.error('Failed to kill process:', error)
        } else {
          Log.info('Process killed successfully')
        }
      })
    }
  }
}

function handleEngineData(data: any) {
  if(data.command === 'connect'){
    captionEngine.connect()
  }
  else if(data.command === 'kill') {
    if(captionEngine.status !== 'stopped') {
      Log.warn('Error occurred, trying to kill caption engine...')
      captionEngine.kill()
    }
  }
  else if(data.command === 'caption') {
    allConfig.updateCaptionLog(data);
  }
  else if(data.command === 'translation') {
    allConfig.updateCaptionTranslation(data);
  }
  else if(data.command === 'print') {
    console.log(data.content)
  }
  else if(data.command === 'info') {
    Log.info('Engine Info:', data.content)
  }
  else if(data.command === 'warn') {
    Log.warn('Engine Warn:', data.content)
  }
  else if(data.command === 'error') {
    Log.error('Engine Error:', data.content)
    controlWindow.sendErrorMessage(/*i18n('engine.error') +*/ data.content)
  }
  else if(data.command === 'usage') {
    Log.info('Engine Token Usage: ', data.content)
  }
  else {
    Log.warn('Unknown command:', data)
  }
}

export const captionEngine = new CaptionEngine()
