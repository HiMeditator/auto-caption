import socket
import threading
import json
# import time
from utils import thread_data, stdout_cmd, stderr


def handle_client(client_socket):
    global thread_data
    while thread_data.status == 'running':
        try:
            data = client_socket.recv(4096).decode('utf-8')
            if not data:
                break
            data = json.loads(data)

            if data['command'] == 'stop':
                thread_data.status = 'stop'
                break
        except Exception as e:
            stderr(f'Communication error: {e}')
            break
    
    thread_data.status = 'stop'
    client_socket.close()


def start_server(port: int):
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        server.bind(('localhost', port))
        server.listen(1)
    except Exception as e:
        stderr(str(e))
        stdout_cmd('kill')
        return
    # time.sleep(20)
    stdout_cmd('connect')

    client, addr = server.accept()
    client_handler = threading.Thread(target=handle_client, args=(client,))
    client_handler.daemon = True
    client_handler.start()
