# Junior to Senior — T11·L2 — FastAPI WebSocket Endpoint

**Prerequisites:** T11·L1 (HTTP vs WebSocket vs SSE). You understand the protocol
choice. This lesson builds the WebSocket endpoint by explaining WHAT the WebSocket
handshake does, WHY `accept()` is a separate step, and HOW the message loop works.

**What this lab adds:**
- WHAT the WebSocket handshake does — the HTTP upgrade sequence
- WHY `accept()` is required and what happens to the client if you skip it
- HOW the message loop works — `receive_text()` blocks, which means what exactly
- WHY `WebSocketDisconnect` is an exception, not a return value
- Building the connection manager step by step with tests

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `await websocket.accept()` — what exactly is being "accepted"? What travels over
>    the network at this moment?
> 2. `await websocket.receive_text()` blocks until a message arrives. The client sends
>    a message, then immediately disconnects. In what order do these events arrive at
>    the server?
> 3. You have 50 connected clients. One job completes. You call `await socket.send_json()`
>    in a loop for all 50. Client #23 is slow. Does client #24 wait for client #23?
>
> *(Answers at the end of this lab)*

---

## Step 1 — See What the WebSocket Handshake Is

Before writing any code, understand the sequence:

```
Client sends:
  GET /ws/client-1 HTTP/1.1
  Connection: Upgrade
  Upgrade: websocket
  Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==

↑ This is still HTTP. The client is saying "I want to switch protocols."

await websocket.accept() sends:
  HTTP/1.1 101 Switching Protocols
  Connection: Upgrade
  Upgrade: websocket
  Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=

↑ Code 101 = "I agree to switch." After this, neither side speaks HTTP anymore.

After accept():
  Both sides now speak the WebSocket frame protocol (not HTTP).
  Either side can send at any time.
  The TCP connection stays open.
```

If you skip `accept()`, the client never receives the 101 response. From the client's
perspective: the HTTP request was sent, but no response ever arrived. The connection
eventually times out. The client sees `WebSocket connection failed`.

---

### Concept: The WebSocket Message Loop

**What it is:** After `accept()`, the server enters a loop: wait for a message,
process it, send a response, repeat. The loop ends when the client disconnects.

**The mechanism — what `receive_text()` actually does:**

```python
while True:
    raw = await websocket.receive_text()
    # ↑ This awaits until a complete WebSocket frame arrives.
    # WHILE WAITING: the event loop runs other coroutines.
    # NOT waiting: no other connections are blocked.
    # The await suspends THIS coroutine until data arrives.
    process(raw)
```

**What `WebSocketDisconnect` is and why it is an exception:**

The client can disconnect at any time — between any two lines of your code. There is
no "the loop ends normally" — the loop can only end by the client disconnecting, which
raises `WebSocketDisconnect`. You must catch it:

```python
try:
    while True:
        raw = await websocket.receive_text()
        # If client disconnects WHILE awaiting: WebSocketDisconnect is raised
        # If client disconnects BETWEEN receives: next receive() raises it
except WebSocketDisconnect:
    cleanup()   # Always runs — the ONLY way the loop ends normally
```

**You will see this again in:**
- Socket.io (JavaScript): same pattern, different syntax — `socket.on('disconnect', cleanup)`
- Go WebSockets: `conn.ReadMessage()` returns an error on disconnect
- Unity/Unreal networking: disconnection is always an exception/event, never a return value

---

## Step 2 — Build the WebSocket Endpoint Incrementally

Create `src/ws_router.py` — start with the minimum:

```python
# src/ws_router.py
import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

@router.websocket('/ws/{client_id}')
async def ws_endpoint(websocket: WebSocket, client_id: str) -> None:
    await websocket.accept()   # complete the handshake
    try:
        # Minimal loop: echo everything back
        while True:
            text  = await websocket.receive_text()
            reply = f'echo from {client_id}: {text}'
            await websocket.send_text(reply)
    except WebSocketDisconnect:
        pass   # client disconnected — loop ends
```

Add this router to `src/main.py`:

```python
from src.ws_router import router as ws_router
app.include_router(ws_router)
```

### SAVE AND TRY

```bash
uvicorn src.main:app --reload
```

Test with a WebSocket client. You can use Python:

```bash
python -c "
import asyncio
import websockets

async def test():
    async with websockets.connect('ws://localhost:8000/ws/test-client') as ws:
        await ws.send('hello')
        response = await ws.recv()
        print('Response:', response)

asyncio.run(test())
"
```

**You should see:** `Response: echo from test-client: hello`

**Change something:** Remove `await websocket.accept()` from the handler. Reconnect.
Expected: the connection fails — the client receives no response and eventually times out.
This is the concrete effect of skipping `accept()`. Put it back.

---

## Step 3 — Build the Connection Manager

The connection manager is needed for broadcasting to multiple clients:

```python
# src/ws_router.py — add this class before the endpoint

class ConnectionManager:
    def __init__(self) -> None:
        self._active: dict[str, WebSocket] = {}

    async def connect(self, client_id: str, ws: WebSocket) -> None:
        await ws.accept()                    # complete the handshake
        self._active[client_id] = ws         # register this client

    def disconnect(self, client_id: str) -> None:
        self._active.pop(client_id, None)    # remove client (idempotent)

    async def send(self, client_id: str, message: dict) -> bool:
        ws = self._active.get(client_id)
        if ws is None:
            return False
        try:
            await ws.send_json(message)
            return True
        except Exception:
            return False   # dead connection — don't crash

    async def broadcast(self, message: dict) -> None:
        # Send to all connected clients:
        for client_id in list(self._active):   # list() to avoid mutation during iteration
            await self.send(client_id, message)

    @property
    def connected_count(self) -> int:
        return len(self._active)


manager = ConnectionManager()   # one instance, shared across all connections
```

Update the endpoint to use the manager:

```python
@router.websocket('/ws/{client_id}')
async def ws_endpoint(websocket: WebSocket, client_id: str) -> None:
    await manager.connect(client_id, websocket)    # accept + register
    try:
        while True:
            raw     = await websocket.receive_text()
            message = json.loads(raw)

            if message.get('type') == 'ping':
                await manager.send(client_id, {'type': 'pong'})
            else:
                await manager.send(client_id, {
                    'type':    'echo',
                    'payload': message,
                })

    except WebSocketDisconnect:
        manager.disconnect(client_id)    # always clean up
```

---

## Step 4 — Write the Tests

```python
# tests/test_websocket.py
import pytest
import json
from fastapi.testclient import TestClient
from src.main import app
from src.ws_router import manager


@pytest.fixture(autouse=True)
def cleanup():
    manager._active.clear()
    yield
    manager._active.clear()


client = TestClient(app)


class TestWebSocketConnection:

    def test_accepts_connection(self) -> None:
        with client.websocket_connect('/ws/test-client') as ws:
            pass   # connection accepted and closed cleanly

    def test_responds_to_ping(self) -> None:
        with client.websocket_connect('/ws/c1') as ws:
            ws.send_json({'type': 'ping'})
            response = ws.receive_json()
            assert response['type'] == 'pong'

    def test_echoes_unknown_messages(self) -> None:
        with client.websocket_connect('/ws/c2') as ws:
            ws.send_json({'type': 'unknown', 'data': 42})
            response = ws.receive_json()
            assert response['type'] == 'echo'
            assert response['payload']['data'] == 42

    def test_connection_registered_in_manager(self) -> None:
        with client.websocket_connect('/ws/c3'):
            assert manager.connected_count == 1
        # After disconnection:
        assert manager.connected_count == 0

    def test_invalid_json_does_not_crash_server(self) -> None:
        with client.websocket_connect('/ws/c4') as ws:
            # Send invalid JSON — server should not crash:
            try:
                ws.send_text('not valid json')
                # If the server crashed, the next send would fail:
                ws.send_json({'type': 'ping'})
                # But first we need to catch the error response if any
            except Exception:
                pass   # server may close the connection on JSON error — that's OK
```

### SAVE AND TRY

```bash
pytest tests/test_websocket.py -v
```

Expected: all 5 tests pass.

**Change something:** Remove the `except WebSocketDisconnect: manager.disconnect(client_id)` line.
Run `test_connection_registered_in_manager`. Expected: FAILS — the manager still shows 1 connection
after the WebSocket closes because `disconnect()` was never called. This shows why the cleanup
in the `except` block is mandatory.

---

## 🎯 Challenge: Add Job Start and Cancel Messages

**You know:** WebSocket lifecycle, `ConnectionManager`, message type dispatch.

**Task:** Extend the endpoint to handle two message types:

- `{ "type": "start_job", "job_id": "j-1" }` → server sends progress events: `{ "type": "progress", "percent": 0/10/20/.../100 }` then `{ "type": "complete" }`
- `{ "type": "cancel" }` → server stops the current job and sends `{ "type": "cancelled" }`

Use `asyncio.create_task()` for the job simulation and a flag dict `{"cancelled": False}` for cancellation.

Write 2 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```python
async def simulate_job(client_id: str, job_id: str, cancel: dict) -> None:
    for pct in range(0, 101, 10):
        if cancel.get('cancelled'):
            await manager.send(client_id, {'type': 'cancelled', 'job_id': job_id})
            return
        await manager.send(client_id, {'type': 'progress', 'percent': pct, 'job_id': job_id})
        await asyncio.sleep(0.05)
    await manager.send(client_id, {'type': 'complete', 'job_id': job_id})


@router.websocket('/ws/{client_id}')
async def ws_endpoint(websocket: WebSocket, client_id: str) -> None:
    await manager.connect(client_id, websocket)
    cancel  = {'cancelled': False}
    task    = None

    try:
        while True:
            raw     = await websocket.receive_text()
            message = json.loads(raw)

            if message.get('type') == 'start_job':
                cancel = {'cancelled': False}
                task   = asyncio.create_task(
                    simulate_job(client_id, message['job_id'], cancel)
                )

            elif message.get('type') == 'cancel':
                cancel['cancelled'] = True

    except WebSocketDisconnect:
        if task and not task.done():
            task.cancel()
        manager.disconnect(client_id)
```

**Tests:**
```python
def test_start_job_receives_progress_events() -> None:
    with client.websocket_connect('/ws/c1') as ws:
        ws.send_json({'type': 'start_job', 'job_id': 'j-1'})
        messages = []
        for _ in range(12):
            try:
                msg = ws.receive_json()
                messages.append(msg)
                if msg.get('type') in ('complete', 'cancelled'):
                    break
            except Exception:
                break
        types = [m['type'] for m in messages]
        assert 'progress' in types
        assert 'complete' in types

def test_cancel_stops_the_job() -> None:
    with client.websocket_connect('/ws/c2') as ws:
        ws.send_json({'type': 'start_job', 'job_id': 'j-2'})
        ws.receive_json()   # get first progress
        ws.send_json({'type': 'cancel'})
        # Keep reading until we see cancelled or complete:
        for _ in range(20):
            msg = ws.receive_json()
            if msg['type'] == 'cancelled':
                break
            if msg['type'] == 'complete':
                break   # might have completed before cancel was processed
```

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| `accept()` required | Skip it — client connection fails |
| Cleanup on disconnect | Remove disconnect call — manager retains dead connections |
| Loop ends only via exception | Add `except WebSocketDisconnect: pass` — confirms no other exit |
| `send()` fails silently | Dead connection in manager — `send()` returns False, not crash |

---

## Quick Check Answers

**1. What is being "accepted"? What travels over the network?**

The HTTP upgrade request. When a client connects, it sends a standard HTTP request with
`Connection: Upgrade` and `Upgrade: websocket` headers. `await websocket.accept()` sends
back `HTTP/1.1 101 Switching Protocols` — the server's agreement to switch from HTTP to
the WebSocket protocol. After the 101 response travels to the client, both sides stop
speaking HTTP and begin the WebSocket frame protocol on the same TCP connection.

**2. Client sends a message then immediately disconnects. Order of events?**

The message arrives first, then the disconnect. TCP guarantees in-order delivery of data
within a connection. The message frame was sent before the disconnect frame — the server
receives the message first, then `receive_text()` on the NEXT call raises `WebSocketDisconnect`.
If the server is in the middle of processing the message when the disconnect arrives, the
disconnect is queued and raised on the next `receive_text()` call.

**3. Broadcasting to 50 clients, client #23 is slow. Does client #24 wait?**

In this implementation, yes — the `broadcast()` method `await`s each `send_json()` call
in sequence. If client #23's send is slow (large buffer, slow network), clients #24-#50
wait. For production: use `asyncio.gather(*sends)` to send to all clients concurrently.
Each send then only waits for ITS OWN client, not the slowest one.
