#!/usr/bin/env python3

# WS server example that synchronizes state across clients

import asyncio
import json
import logging
import websockets
import websocket
import ssl
import threading
from time import sleep

logging.basicConfig()
ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)

# Generate with Lets Encrypt, copied to this location, chown to current user and 400 permissions
ssl_cert = "/etc/letsencrypt/live/smolroom.com/fullchain.pem"
ssl_key = "/etc/letsencrypt/live/smolroom.com/privkey.pem"

ssl_context.load_cert_chain(ssl_cert, keyfile=ssl_key)

clientPicture = [0] * 3600
picture = [0] * 3600

# reference array with indexes corresponding to 
serverIndexRef = [0] * 900

USERS = set()

# Fill reference Array with index's
def fillServerIndexRef():
    for i in range(30):
        for j in range(30):
            serverIndexRef[getClientIndex(i, j)] = getServerIndex(i, j)

# Fill the whole grid with a single color
def fillServerPictureWithColor(color):
    for i in range(900):
        for j in range(4):
            picture[(serverIndexRef[i] * 4) + j] = color[j]

def fillClientPictureWithColor(color):
    for i in range(900):
        for j in range(4):
            clientPicture[(i*4)+j] = color[j]



# Fill a single pixel with a color
def setServerPixel(index, color):
    for i in range(4):
        picture[serverIndexRef[index] * 4 + i] = color[i]

def setClientPixel(index, color):
    for i in range(4):
        clientPicture[(index * 4) + i] = color[i]



def fillServerPictureWithFrame(frame):
    for i in range(900):
            setServerPixel(i, [frame[i * 4], frame[i * 4 + 1], frame[i * 4 + 2], frame[i * 4 + 3]])

def fillClientPictureWithFrame(frame):
    for i in range(900):
            setClientPixel(i, [frame[i * 4], frame[i * 4 + 1], frame[i * 4 + 2], frame[i * 4 + 3]])



# given i = x and j = y find single dimensional array that works with the CLIENT PICTURE/front end matrix orientation
def getClientIndex(i, j):
   return i * 30 + j

# given i = x and j = y find the single dimensional array that works with the SERVER PICTURE/physical matrix orientation
def getServerIndex(i, j):
    return 899 - (j*30+i, j*30+(30-1-i))[j%2]



# return a json dump with the client picture for sending back to the client after a change
def state_event():
    return json.dumps({"type": "state", "picture" : clientPicture})

# return a json dump with the number of active users to send to the client when there is a disconnect or connect
def users_event():
    return json.dumps({"type": "users", "count": len(USERS)})



# send the client picture to all connected users
async def notify_state():
    if USERS:  # asyncio.wait doesn't accept an empty list
        message = state_event()
        await asyncio.wait([user.send(message) for user in USERS])

# send the user count to all active users
async def notify_users():
    if USERS:  # asyncio.wait doesn't accept an empty list
        message = users_event()
        await asyncio.wait([user.send(message) for user in USERS])

# add a new socket to the user list
async def register(websocket):
    USERS.add(websocket)
    await notify_users()

# remove a socket from the user list
async def unregister(websocket):
    USERS.remove(websocket)
    await notify_users()

# main function being ran by the asyncio websocket server when it receives a connection
async def counter(websocket, path):
    # register(websocket) sends user_event() to websocket
    await register(websocket)
    try:
        await websocket.send(state_event())
        async for message in websocket:
            data = json.loads(message)
            if data["action"] == "allOff":    
                fillServerPictureWithColor([0,0,0,0])
                fillClientPictureWithColor([0,0,0,0])
                await notify_state()
            elif data["action"] == "frame":
                fillServerPictureWithFrame(data["frame"])
                fillClientPictureWithFrame(data["frame"])
                await notify_state()
            elif data["action"] == "pixel":
                setServerPixel(data["index"], data["color"])
                setClientPixel(data["index"], data["color"])
                await notify_state()
            else:
                logging.error("unsupported event: {}", data)
    finally:
        await unregister(websocket)

# thread class for running the connection to the esp32 on a separate thread
class esp32Thread (threading.Thread):
    def __init__(self, name):
        threading.Thread.__init__(self)
        self.name = name

    def run(self):
#        print(self.name + ": Starting")

        state = False

        wsapp = websocket.WebSocket()
        wsapp.settimeout(5)

        while True:
            try:
                wsapp.connect("ws://192.168.1.203/")
                state = True
                while state:
                    try:
                        wsapp.send_binary([1])
                        wsapp.send_binary(picture)
                        wsapp.send_binary([0])
                        sleep(1/24)
                    except Exception as inst:
#                        print(self.name + ": " + str(inst))
                        state = False

            except Exception as inst:
#                print(self.name + ": " + str(inst))
                sleep(5)

        print(self.name + ": thread closing")


fillServerIndexRef()

# start esp32 thread
esp32thread = esp32Thread("esp32thread")
esp32thread.start()

# websockets server
start_server = websockets.serve(counter, "0.0.0.0", 8001, ssl=ssl_context)

# start the websockets server via asyncio and have it run forever
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
