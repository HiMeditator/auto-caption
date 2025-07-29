import sys
import json

def stdout(text: str):
    stdout_cmd("print", text)

def stdout_cmd(command: str, content = ""):
    msg = { "command": command, "content": content }
    sys.stdout.write(json.dumps(msg) + "\n")
    sys.stdout.flush()

def stdout_obj(obj):
    sys.stdout.write(json.dumps(obj) + "\n")
    sys.stdout.flush()

def stderr(text: str):
    sys.stderr.write(text + "\n")
    sys.stderr.flush()
