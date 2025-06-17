import json
import websockets

class WebSocketServer:

    def __init__(self):
        self.server = None
        self.websocket = None

    async def start(self, port=8765):
        """启动 WebSocket 服务器"""
        self.server = await websockets.serve(self.handle_client, "localhost", port)
        print(f"INFO websocket server started on ws://localhost:{port}")

    async def stop(self):
        """关闭 WebSocket 服务器"""
        if self.server:
            try:
                if self.websocket:
                    await self.close()
                self.server.close()
                await self.server.wait_closed()
                print("INFO server closed successfully")
            except Exception as e:
                print(f"ERROR failed to close server: {e}")
            finally:
                self.server = None

    async def handle_client(self, websocket, path="/"):
        """处理客户端连接"""
        try:
            self.websocket = websocket
            async for message in websocket:
                print(f"INFO received: {message}")
        except websockets.exceptions.ConnectionClosed:
            print("INFO client disconnected")
            self.websocket = None

    async def send(self, data):
        """向连接的客户端发送数据"""
        if self.websocket:
            try:
                await self.websocket.send(json.dumps(data))
                print(f"INFO sent: {data}")
                return True
            except websockets.exceptions.ConnectionClosed:
                print("ERROR: Client disconnected while sending data")
                self.websocket = None
                return False
        return False

    async def close(self):
        """安全地断开WebSocket连接"""
        if self.websocket:
            try:
                await self.websocket.close()
                print("INFO connection closed successfully")
            except Exception as e:
                print(f"ERROR failed to close connection: {e}")
            finally:
                self.websocket = None