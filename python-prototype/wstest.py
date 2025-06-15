import asyncio
import websockets
import json  # 导入 json 模块

# WebSocket 服务器处理函数
async def echo(websocket):
    async for message in websocket:
        print(f"收到客户端消息: {message}")
        # 发送响应给客户端
        response = {"respond": "Hello, Client!"}
        await websocket.send(json.dumps(response))  # 将字典转换为 JSON 字符串
        print(f"已发送响应: {response}")

# 启动服务器
async def main():
    async with websockets.serve(echo, "localhost", 8765):
        await asyncio.Future()  # 保持服务器运行

if __name__ == "__main__":
    print("WebSocket 服务器已启动，监听 ws://localhost:8765")
    asyncio.run(main())