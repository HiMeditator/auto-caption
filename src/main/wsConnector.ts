import WebSocket from 'ws';

export class WebSocketConnector {
  ws: WebSocket | null;

  constructor() {
    this.ws = null;
  }

  connect() {
    this.ws = new WebSocket('ws://localhost:8765');

    this.ws.on('open', () => {
      console.log('INFO websocket server connected');
      this.send({ message: 'Electron Initialized' });
    });

    this.ws.on('message', this.handleMessage);

    this.ws.on('close', () => {
      console.log('INFO websocket connection closed');
    });

    this.ws.on('error', (error) => {
      console.error('ERROR websocket error:', error);
    });
  }

  handleMessage(data: any) { 
    const message = JSON.parse(data.toString());
    console.log('INFO get message from webscoket:', message);
  }

  send(data: object) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('ERROR send error: websocket not connected');
    }
  }

}