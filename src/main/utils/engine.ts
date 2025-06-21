import { spawn, exec } from 'child_process'
import { app } from 'electron'
import { is } from '@electron-toolkit/utils'
import path from 'path'
import { addCaptionLog, controls } from './config'

export class CaptionEngine { 
    appPath: string = ''
    command: string[] = []
    process: any | undefined

    private getApp() {
        if(controls.customized && controls.customizedCommand && controls.customizedApp){
            this.appPath = controls.customizedApp
            this.command = [ controls.customizedCommand ]
        }
        else if(controls.engine === 'gummy'){
            let gummyName = ''
            if(process.platform === 'win32'){
                gummyName = 'main-gummy.exe'
            }
            else if(process.platform === 'linux'){
                gummyName = 'main-gummy'
            }
            else{
                throw new Error('Unsupported platform')
            }
            if(is.dev){
                this.appPath = path.join(
                    app.getAppPath(),
                    'python-subprocess', 'dist', gummyName
                )
            }
            else{
                this.appPath = path.join(
                    process.resourcesPath,
                    'python-subprocess', 'dist', gummyName
                )
            }
            this.command = []
            this.command.push('-s', controls.sourceLang)
            this.command.push('-t',  controls.translation ? controls.targetLang : 'none')
            this.command.push('-a', controls.audio ? '1' : '0')

            console.log('[INFO] engine', this.appPath)
            console.log('[INFO] engine command',this.command)
        }
    }

    public start() {
        if (this.process) {
            this.stop();
        }
        this.getApp()
        this.process = spawn(this.appPath, this.command)
        controls.engineEnabled = true

        console.log('[INFO] Caption Engine Started: ', {
            appPath: this.appPath,
            command: this.command
        })

        this.process.stdout.on('data', (data) => {
            const lines = data.toString().split('\n');
            lines.forEach( (line: string) => {
                if (line.trim()) {
                    try {
                        const caption = JSON.parse(line);
                        addCaptionLog(caption);
                    } catch (e) {
                        console.error('Error parsing JSON:', e);
                    }
                }
            });
        });
        
        this.process.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
        });
        
        this.process.on('close', (code: any) => {
            console.log(`Python process exited with code ${code}`);
            this.process = undefined;
        });
    }

    public stop() {
        if (this.process) {
            if (process.platform === "win32" && this.process.pid) {
                exec(`taskkill /pid ${this.process.pid} /t /f`, (error) => {
                    if (error) {
                        console.error(`Failed to kill process: ${error}`);
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