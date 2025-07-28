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
  status: 'running' | 'starting' | 'stopping' | 'stopped' = 'stopped'

  private getApp(): boolean {
    if (allConfig.controls.customized) {
      Log.info('Using customized caption engine')
      this.appPath = allConfig.controls.customizedApp
      this.command = allConfig.controls.customizedCommand.split(' ')
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
        this.appPath = path.join(
          app.getAppPath(), 'engine',
          'subenv', 'Scripts', 'python.exe'
        )
        this.command.push(path.join(
          app.getAppPath(), 'engine', 'main.py'
        ))
        // this.appPath = path.join(app.getAppPath(), 'engine', 'dist', 'main.exe')
      }
      else {
        this.appPath = path.join(process.resourcesPath, 'engine', 'main.exe')
      }

      if(allConfig.controls.engine === 'gummy') {
        this.command.push('-e', 'gummy')
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
        this.command.push('-e', 'vosk')
        this.command.push('-a', allConfig.controls.audio ? '1' : '0')
        this.command.push('-m', `"${allConfig.controls.modelPath}"`)        
      }
    }
    Log.info('Engine Path:', this.appPath)
    Log.info('Engine Command:', this.command)
    return true
  }

  public connect() {
    if(this.client) { Log.warn('Client already exists, ignoring...') }
    Log.info('Connecting to caption engine server...');
    this.client = net.createConnection({ port: 7070 }, () => {
      Log.info('Connected to caption engine server');
    });
    this.status = 'running'
    allConfig.controls.engineEnabled = true
    if(controlWindow.window){
      allConfig.sendControls(controlWindow.window)
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
      Log.warn('Casption engine is not stopped, current status:', this.status)
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
        allConfig.sendControls(controlWindow.window)
        controlWindow.window.webContents.send('control.engine.stopped')
      }
      this.status = 'stopped'
      Log.info(`Engine exited with code ${code}`)
    });
  }

  public stop() {
    if(this.status !== 'running'){
      Log.warn('Engine is not running, current status:', this.status)
      return
    }
    this.sendCommand('stop')
    if(this.client){
      this.client.destroy()
      this.client = undefined
    }
    this.status = 'stopping'
    Log.info('Caption engine process stopping...')
  }

  public kill(){
    if(this.status !== 'running'){
      Log.warn('Engine is not running, current status:', this.status)
      return
    }
    if (this.process.pid) {
      Log.warn('Trying to kill engine process, PID:', this.process.pid)
      if(this.client){
        this.client.destroy()
        this.client = undefined
      }
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
      Log.warn('Error occurred, trying to kill Gummy engine...')
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
    Log.info('Gummy Engine Usage: ', data.content)
  }
  else {
    Log.warn('Unknown command:', data)
  }
}

export const captionEngine = new CaptionEngine()
