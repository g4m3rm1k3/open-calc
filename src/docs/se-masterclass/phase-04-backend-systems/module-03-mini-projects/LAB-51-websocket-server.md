# SE Masterclass — LAB-51 — WebSocket Server

**Language: Python (FastAPI)** — same module as LAB-50.

**Prerequisites:** LAB-13 (the connection-lifecycle state machine from LAB-13 Step 4 was a direct preview of this lab), LAB-22 (broadcasting to many connections IS LAB-22's event bus, with real network sockets as subscribers).

**What this lab adds:**
- Why HTTP's request/response model is wrong for real-time, two-way communication
- A persistent WebSocket connection: one handshake, then a free-flowing stream of messages either side
- Broadcasting: one client's message reaching ALL connected clients — LAB-22's pattern, with real sockets
- Structured message types (join/leave/chat) dispatched like LAB-13's state machine events

**Time:** 90–110 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. To build a live chat with plain HTTP, a client would need to repeatedly ASK "any new messages?" (polling). What's wasteful about that, specifically?
> 2. A WebSocket connection starts with an HTTP request. What happens to that connection AFTER the "upgrade" succeeds — is it still HTTP?
> 3. If Client A sends a chat message, and the server needs to deliver it to Clients B, C, and D — what LAB-22 concept describes this delivery pattern?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `uvicorn main:app --reload` and connecting multiple WebSocket clients (via a browser console or `websocat`) shows:

```
=== Echo Server ===
client sends: "hello"
server echoes: "hello"

=== Broadcast: One Message, All Clients ===
3 clients connected: [client-1, client-2, client-3]
client-1 sends: "hi everyone"
client-1 receives: "hi everyone" (echoed back)
client-2 receives: "hi everyone" (broadcast)
client-3 receives: "hi everyone" (broadcast)

=== Structured Messages: Join/Leave/Chat ===
client-4 connects -> broadcast: {"type":"join","user":"client-4"}
client-4 sends: {"type":"chat","text":"hello"}
all clients receive: {"type":"chat","user":"client-4","text":"hello"}
client-4 disconnects -> broadcast: {"type":"leave","user":"client-4"}

=== Heartbeat: Detecting Dead Connections ===
client-5: last pong at t=0s
client-5: last pong at t=30s (ping/pong healthy)
client-6: no pong received in 60s -> marked DEAD, removed from active connections
```

---

### Concept: Why HTTP Is Wrong for Real-Time

**What it is:** HTTP (LAB-44) is a REQUEST/RESPONSE protocol — the client asks, the server answers, the connection is done. There's no way for the SERVER to spontaneously send something to the client without the client asking first. For a live chat, this means the client would have to repeatedly POLL ("any new messages? any new messages? any new messages?"), wasting requests on "no" answers most of the time, and adding LATENCY (a message isn't seen until the NEXT poll happens to run).

**The solution — WebSocket:** A WebSocket connection starts as an HTTP request with an `Upgrade: websocket` header. If the server agrees, the SAME underlying TCP connection is repurposed — no more HTTP request/response cycles; instead, either side can send a MESSAGE at any time, over the persistent, open connection, with no new "request" needed.

---

## Step 1 — A Minimal Echo Server

```bash
pip install fastapi uvicorn "uvicorn[standard]"
```

```python
# main.py
from fastapi import FastAPI, WebSocket

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()                 # ← add: complete the "upgrade" handshake
    while True:
        message = await websocket.receive_text()    # ← add: waits (non-blocking, LAB-47's asyncio) for the NEXT message
        await websocket.send_text(f"echo: {message}")
```

### SAVE AND TRY

```bash
uvicorn main:app --reload
```

In a browser's DevTools console (any page, since we're just testing the raw connection):
```js
const ws = new WebSocket('ws://localhost:8000/ws')
ws.onmessage = (e) => console.log('received:', e.data)
ws.onopen = () => ws.send('hello')
```

**Expected console output:**
```
=== Echo Server ===
received: echo: hello
```

**Confirm the connection stays OPEN:** Run `ws.send('another message')` again in the SAME console — confirm you get another `echo: ...` response, WITHOUT any new HTTP request/handshake happening. This is the entire point: one handshake, then a free-flowing stream of messages, both directions, for as long as the connection stays open.

---

## Step 2 — Broadcast to All Connected Clients

```python
class ConnectionManager:                        # ← add: LAB-22's EventBus, adapted for real network connections
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:      # ← add: LAB-22's emit() loop, over REAL sockets instead of function callbacks
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            message = await websocket.receive_text()
            await manager.broadcast(message)               # ← add: EVERY connected client gets it, not just the sender
    except Exception:
        manager.disconnect(websocket)
```

### SAVE AND TRY

Open the SAME browser page in 3 separate tabs (or 3 DevTools consoles), running the `ws = new WebSocket(...)` code from Step 1 in each. In ONE tab, run `ws.send('hi everyone')`.

**Expected:** ALL THREE tabs' consoles log `received: hi everyone` — including the tab that SENT it (since `broadcast` includes every connection, sender included).

**Confirm this is LAB-22's `emit()`, with real sockets as listeners:** `manager.active_connections` is LAB-22's `subscribers` list; `broadcast()`'s `for` loop is LAB-22's `emit()` loop — the ONLY difference is calling `connection.send_text(...)` (a real network write) instead of calling a JavaScript function directly. The PATTERN — one event, many independent recipients, none of them knowing about each other — is identical.

---

## Step 3 — Structured Messages: Join/Leave/Chat

```python
import json

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, username: str = "anonymous"):
    await manager.connect(websocket)
    await manager.broadcast(json.dumps({"type": "join", "user": username}))    # ← add: announce arrival to everyone

    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)

            if data["type"] == "chat":                                          # ← add: LAB-09's dispatch, on message TYPE
                await manager.broadcast(json.dumps({"type": "chat", "user": username, "text": data["text"]}))
            # additional message types (e.g. "typing") could be added here — LAB-18's OCP, one new 'if' branch, nothing else touched

    except Exception:
        manager.disconnect(websocket)
        await manager.broadcast(json.dumps({"type": "leave", "user": username}))   # ← add: announce departure to everyone
```

### SAVE AND TRY

Connect with `new WebSocket('ws://localhost:8000/ws?username=client-4')`, then send `ws.send(JSON.stringify({type: 'chat', text: 'hello'}))`.

**Expected (all connected clients receive):**
```
=== Structured Messages: Join/Leave/Chat ===
{"type":"join","user":"client-4"}
{"type":"chat","user":"client-4","text":"hello"}
```

Close the connection (`ws.close()`):
```
{"type":"leave","user":"client-4"}
```

**Confirm the message TYPE field is a dispatch key, exactly LAB-13's `(state, event)` pattern:** `data["type"]` decides HOW the server reacts — `"chat"` broadcasts a chat message; a hypothetical future `"typing"` type could broadcast a typing indicator, WITHOUT touching the `"chat"` handling at all. This is the SAME "add a new case, don't edit existing ones" extensibility as every dispatch table in this curriculum.

---

## Step 4 — Heartbeat: Detecting Dead Connections

**The problem:** A client's network connection can die SILENTLY (laptop closed, wifi dropped) without either side getting a clean "disconnect" signal. Without checking, the server would keep a DEAD connection in `active_connections` forever, still trying (and failing) to broadcast to it.

```python
import asyncio
import time

connection_last_pong: dict[WebSocket, float] = {}

async def heartbeat_check():                          # ← add: a background task, checking periodically
    while True:
        await asyncio.sleep(30)
        now = time.time()
        for ws, last_pong in list(connection_last_pong.items()):
            if now - last_pong > 60:                     # ← add: no pong in 60s -> consider it dead
                print(f"client: no pong received in 60s -> marked DEAD, removed from active connections")
                manager.disconnect(ws)
                del connection_last_pong[ws]

@app.on_event("startup")
async def start_heartbeat():
    asyncio.create_task(heartbeat_check())               # ← add: runs CONCURRENTLY with request handling — LAB-47/48's asyncio
```

*(A full implementation also sends periodic `ping` frames and updates `connection_last_pong[ws] = time.time()` on receiving each `pong` — omitted here for brevity, but follows directly from the pattern above.)*

### SAVE AND TRY

Conceptually verify: a connection that stops responding to pings for over 60 seconds gets removed from `active_connections` automatically, without needing the client to send an explicit "goodbye" message.

**Expected (illustrative log output over time):**
```
=== Heartbeat: Detecting Dead Connections ===
client-5: last pong at t=0s
client-5: last pong at t=30s (ping/pong healthy)
client-6: no pong received in 60s -> marked DEAD, removed from active connections
```

**Confirm this is LAB-13's connection-lifecycle state machine, made concrete:** `CONNECTED -> (no pong for 60s) -> DISCONNECTED` is EXACTLY the transition LAB-13's Step 4 example previewed conceptually — this lab implements the REAL mechanism (a periodic background check, LAB-47/48's `asyncio.create_task` running CONCURRENTLY with normal message handling) that actually detects it.

---

## 🎯 Challenge: Rooms — Broadcast Only to Subscribers

**You know:** `ConnectionManager.broadcast` currently sends to EVERY connected client. A real chat app needs separate ROOMS — a message in "general" shouldn't reach someone only connected to "random."

**Task:** Extend `ConnectionManager` to track which room each connection belongs to, and broadcast only within a room.

<details>
<summary>▶ Show Solution</summary>

```python
class RoomConnectionManager:
    def __init__(self):
        self.rooms: dict[str, list[WebSocket]] = {}     # room name -> connections in that room

    async def connect(self, websocket: WebSocket, room: str):
        await websocket.accept()
        self.rooms.setdefault(room, []).append(websocket)

    def disconnect(self, websocket: WebSocket, room: str):
        self.rooms[room].remove(websocket)

    async def broadcast_to_room(self, room: str, message: str):
        for connection in self.rooms.get(room, []):       # ← only THIS room's connections, not every connection globally
            await connection.send_text(message)
```

**Key insight:** This is LAB-04's hash map (`room name -> list of connections`), applied to LAB-22's broadcast pattern — instead of ONE flat subscriber list, subscribers are GROUPED by room, and `broadcast_to_room` only iterates the relevant group. Real chat platforms (Discord, Slack) use exactly this "grouped subscriber lists" structure at massive scale, often with additional layers (a room's subscribers might themselves be spread across multiple SERVERS, requiring a message broker like Redis Pub/Sub between them — LAB-49's territory, generalized).

</details>

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| `ConnectionManager.broadcast` | Discord/Slack's real-time message delivery |
| Structured `{"type": ..., ...}` messages | Every real-time app's message protocol design |
| Heartbeat/ping-pong | How Slack, Discord, and every WebSocket-based app detects dropped connections |
| Rooms | Discord channels, Slack channels — the literal concept |

**Where you will see this again:** LAB-34's frontend state management and LAB-22's event bus are the CLIENT-side half of what this lab builds on the SERVER side — a full-stack real-time app connects both.

---

## Final Check

| Feature | How to verify |
|---|---|
| The echo server correctly responds to messages over a PERSISTENT connection | Step 1 |
| A message from one client is broadcast to ALL connected clients | Step 2 |
| Join/leave/chat messages are correctly dispatched by `type` | Step 3 |
| A dead connection is detected and removed via heartbeat, without an explicit disconnect | Step 4 |
| Room-scoped broadcasting only reaches clients in the SAME room | Challenge |
| You can explain, without notes, why polling is wasteful compared to WebSockets | Concept box |

---

## Quick Check Answers

**1. What's wasteful about polling for new messages?**

Most poll requests return "nothing new" — pure overhead (a full HTTP request/response cycle, LAB-44's format, for zero actual information) — AND there's inherent LATENCY: a message sent right after a poll won't be seen until the NEXT poll happens to run, which could be seconds later depending on the polling interval. A WebSocket (Step 1–2) eliminates both problems: the server pushes a message the INSTANT it happens, with no wasted "nothing new" round trips at all.

**2. Is a WebSocket connection still HTTP after the upgrade?**

No — after the `Upgrade: websocket` handshake succeeds, the SAME underlying TCP connection is repurposed for the WebSocket PROTOCOL (a different framing format), not HTTP anymore. There are no more HTTP request/response cycles on that connection — it's a persistent, message-based stream until either side closes it, confirmed in Step 1, where sending a second message required NO new handshake or request at all.

**3. Client A's message needing to reach B, C, and D — what LAB-22 concept is this?**

Broadcasting — LAB-22's `EventBus.emit()`, where ONE event fires and EVERY subscriber receives it, with the publisher having no direct knowledge of who's listening. Step 2's `ConnectionManager.broadcast` is structurally identical: it loops over every connected client (LAB-22's subscriber list) and sends the SAME message to each, exactly like `emit()` looped over every registered listener.

---

*Next: [LAB-52 — Task Scheduler](LAB-52-task-scheduler.md) — Python, same module*
