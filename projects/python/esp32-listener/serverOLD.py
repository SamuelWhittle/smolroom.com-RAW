#!/usr/bin/env python3

# WS server example that synchronizes state across clients

import asyncio
import json
import logging
import websockets
import websocket
import ssl

logging.basicConfig()
ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)

# Generate with Lets Encrypt, copied to this location, chown to current user and 400 permissions
ssl_cert = "/etc/letsencrypt/live/smolroom.com/fullchain.pem"
ssl_key = "/etc/letsencrypt/live/smolroom.com/privkey.pem"

ssl_context.load_cert_chain(ssl_cert, keyfile=ssl_key)

STATE = {"value": 0}
clientPicture = [0] * 3600
picture = [0] * 3600

USERS = set()

ws = websocket.WebSocket()

def fillPicture(color):
    for i in range(900):
        for j in range(4):
            picture[(i*4)+j] = color[j]

def fillClientPicture(color):
    for i in range(900):
        for j in range(4):
            clientPicture[(i*4)+j] = color[j]

def setClientPixel(index, color):
    relativeIndex = index[0] * 30 + index[1]
    for i in range(4):
        clientPicture[(relativeIndex * 4) + i] = color[i]

def getIndex(index):
    return 899 - (index[1]*30+index[0], index[1]*30+(30-1-index[0]))[index[1]%2]

def setPixel(index, color):
    for i in range(4):
        picture[getIndex(index) * 4 + i] = color[i]

def state_event():
    return json.dumps({"type": "state", "picture" : clientPicture})

def users_event():
    return json.dumps({"type": "users", "count": len(USERS)})

async def notify_state():
    if USERS:  # asyncio.wait doesn't accept an empty list
        message = state_event()
        await asyncio.wait([user.send(message) for user in USERS])


async def notify_users():
    if USERS:  # asyncio.wait doesn't accept an empty list
        message = users_event()
        await asyncio.wait([user.send(message) for user in USERS])


async def register(websocket):
    USERS.add(websocket)
    await notify_users()


async def unregister(websocket):
    USERS.remove(websocket)
    await notify_users()


async def counter(websocket, path):
    # register(websocket) sends user_event() to websocket
    await register(websocket)
    try:
        await websocket.send(state_event())
        async for message in websocket:
            data = json.loads(message)
            if data["action"] == "allOff":    
                fillPicture([0,0,0,0])
                fillClientPicture([0,0,0,0])
                ws.connect("ws://192.168.1.203/")
                ws.send_binary([1])
                ws.send_binary(picture)
                ws.send_binary([0])
                ws.close()
                await notify_state()
            elif data["action"] == "allOn":
                fillPicture(data["color"])
                fillClientPicture([255, 255, 255, 0])
                ws.connect("ws://192.168.1.203/")
                ws.send_binary([1])
                ws.send_binary(picture)
                ws.send_binary([0])
                ws.close()
                await notify_state()
            elif data["action"] == "pixel":
                setClientPixel(data["index"], data["color"])
                setPixel(data["index"], data["color"])
                ws.connect("ws://192.168.1.203/")
                ws.send_binary([1])
                ws.send_binary(picture)
                ws.send_binary([0])
                ws.close()
                await notify_state()
            else:
                logging.error("unsupported event: {}", data)
    finally:
        await unregister(websocket)

start_server = websockets.serve(counter, "0.0.0.0", 8001, ssl=ssl_context)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
