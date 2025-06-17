import { spawn } from 'child_process'
import { app } from 'electron'
import path from 'path'
import { addCaptionLog } from './data'

export class PythonProcess { 
    public start() { 
        const basePath = app.getAppPath()
        const pythonPath = path.join(
            basePath,
            'python-subprocess', 'subenv', 'Scripts', 'python.exe'
        )
        const targetPath = path.join(basePath, 'python-subprocess', 'main.py')

        console.log(pythonPath)
        console.log(targetPath)

        const pythonProcess = spawn(pythonPath, [targetPath])

        pythonProcess.stdout.on('data', (data) => {
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
        
        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
        });
        
        pythonProcess.on('close', (code) => {
            console.log(`Python process exited with code ${code}`);
        });
    }
}