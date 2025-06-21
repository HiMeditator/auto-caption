import { spawn } from 'child_process'
import { app } from 'electron'
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
            this.appPath = path.join(
                app.getAppPath(),
                'python-subprocess', 'subenv', 'Scripts', 'python.exe'
            )
            this.command = []
            this.command.push(path.join(
                app.getAppPath(),
                'python-subprocess', 'main.py'
            ))
            this.command.push('-s', controls.sourceLang)
            this.command.push('-t',  controls.translation ? controls.targetLang : 'none')

            console.log(this.appPath)
            console.log(this.command)
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
            this.process.kill();
            this.process = undefined;
            controls.engineEnabled = false;
            console.log('[INFO] Caption engine process stopped');
        }
    }
}