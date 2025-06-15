import WebSocket from 'ws';

export class PythonConnector {
  ws: WebSocket | null;

  constructor() {
    this.ws = null;
    this.connect();
  }

  connect() {
    this.ws = new WebSocket('ws://localhost:8765');

    this.ws.on('open', () => {
      console.log('Python server connected');
      this.send({ message: 'Electron Initialized' });
    });

    this.ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      console.log('Get message from Python:', message);
      
      // 在这里处理来自 Python 的消息
      if (message.notification) {
        this.handleNotification(message.notification);
      }
    });

    this.ws.on('close', () => {
      console.log('Connection closed. Reconnecting...');
      setTimeout(() => this.connect(), 3000);
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket Error:', error);
    });
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket not connected');
    }
  }

  handleNotification(notification) {
    // 处理 Python 主动推送的通知
    console.log('Handel notification:', notification);
    // 可以在这里更新 UI 或触发其他操作
  }
}