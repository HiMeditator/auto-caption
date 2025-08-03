import { exec, spawn } from 'child_process'
import { app } from 'electron'
import { is } from '@electron-toolkit/utils'
import path from 'path'
import net from 'net'
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
  status: 'running' | 'starting' | 'stopping' | 'stopped' = 'stopped'
  timerID: NodeJS.Timeout | undefined

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
          this.appPath = path.join(process.resourcesPath, 'engine', 'main')
        }
      }

      this.command.push('-a', allConfig.controls.audio ? '1' : '0')
      this.port = Math.floor(Math.random() * (65535 - 1024 + 1)) + 1024
      this.command.push('-p', this.port.toString())

      if(allConfig.controls.engine === 'gummy') {
        this.command.push('-e', 'gummy')
        this.command.push('-s', allConfig.controls.sourceLang)
        this.command.push(
          '-t', allConfig.controls.translation ?
          allConfig.controls.targetLang : 'none'
        )
        if(allConfig.controls.API_KEY) {
          this.command.push('-k', allConfig.controls.API_KEY)
        }
      }
      else if(allConfig.controls.engine === 'vosk'){
        this.command.push('-e', 'vosk')
        
        this.command.push('-m', `"${allConfig.controls.modelPath}"`)        
      }
    }
    Log.info('Engine Path:', this.appPath)
    Log.info('Engine Command:', this.command)
    return true
  }

  public connect() {
    Log.info('Connecting to caption engine server...')
    if(this.client) { Log.warn('Client already exists, ignoring...') }
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
          controlWindow.sendErrorMessage(/*i18n('engine.error') +*/ line)
          console.error(line)          
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
      Log.info(`Engine exited with code ${code}`)
    });
  }

  public stop() {
    if(this.status !== 'running'){
      Log.warn('Trying to stop engine which is not running, current status:', this.status)
      return
    }
    this.sendCommand('stop')
    if(this.client){
      this.client.destroy()
      this.client = undefined
    }
    this.status = 'stopping'
    Log.info('Caption engine process stopping...')
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
    Log.warn('Trying to kill engine process, PID:', this.process.pid)
    if(this.client){
      this.client.destroy()
      this.client = undefined
    }
    if (this.process.pid) {
      let cmd = `kill ${this.process.pid}`;
      if (process.platform === "win32") {
        cmd = `taskkill /pid ${this.process.pid} /t /f`
      }
      exec(cmd)
    }
    this.status = 'stopping'
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
  else if(data.command === 'print') {
    Log.info('Engine Print:', data.content)
  }
  else if(data.command === 'info') {
    Log.info('Engine Info:', data.content)
  }
  else if(data.command === 'usage') {
    Log.info('Engine Usage: ', data.content)
  }
  else {
    Log.warn('Unknown command:', data)
  }
}

export const captionEngine = new CaptionEngine()
