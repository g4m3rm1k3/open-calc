# Junior to Senior — T11·L2 — FastAPI WebSocket Endpoint

**Prerequisites:** T11·L1 (HTTP vs WebSocket vs SSE). You know when to use
WebSocket. This lesson builds the FastAPI WebSocket endpoint for the job runner.

**What this lab adds:**
- `@app.websocket("/ws/{client_id}")` — WebSocket route
- `await websocket.accept()` — completing the handshake
- `await websocket.send_json({...})` — sending structured messages
- `await websocket.receive_text()` — receiving from the client
- `WebSocketDisconnect` — handling client disconnection
- Broadcasting to multiple connections

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `await websocket.accept()` — what happens if you skip this call?
> 2. The client disconnects mid-session. Your handler is stuck in `receive_text()`.
>    What exception is raised?
> 3. You have 50 clients connected. One job completes. How do you notify all 50?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A WebSocket endpoint that:
- Accepts connections
- Sends progress updates as a job runs
- Handles "cancel" messages from the client
- Cleans up when the client disconnects

---

### Concept: WebSocket Lifecycle

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

@app.websocket('/ws/{client_id}')
async def websocket_endpoint(websocket: WebSocket, client_id: str) -> None:
    await websocket.accept()   # complete the handshake

    try:
        while True:
            data = await websocket.receive_text()   # blocks until message arrives
            await websocket.send_json({'echo': data})

    except WebSocketDisconnect:
        print(f'Client {client_id} disconnected')
    finally:
        # Cleanup — always runs even if exception occurs:
        pass
```

---

### Concept: Connection Manager

A connection manager tracks all active WebSocket connections and provides
broadcast functionality:

```python
from typing import Dict
import asyncio


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: Dict[str, WebSocket] = {}

    async def connect(self, client_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections[client_id] = websocket

    def disconnect(self, client_id: str) -> None:
        self._connections.pop(client_id, None)

    async def send_to(self, client_id: str, message: dict) -> None:
        ws = self._connections.get(client_id)
        if ws:
            await ws.send_json(message)

    async def broadcast(self, message: dict) -> None:
        for ws in list(self._connections.values()):
            try:
                await ws.send_json(message)
            except Exception:
                pass  # dead connections silently skipped
```

---

## Step 1 — Build the Job Runner WebSocket

Create `src/websocket_router.py`:

```python
from __future__ import annotations
import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


class ConnectionManager:
    def __init__(self) -> None:
        self._active: dict[str, WebSocket] = {}

    async def connect(self, client_id: str, ws: WebSocket) -> None:
        await ws.accept()
        self._active[client_id] = ws

    def disconnect(self, client_id: str) -> None:
        self._active.pop(client_id, None)

    async def send(self, client_id: str, message: dict) -> bool:
        ws = self._active.get(client_id)
        if ws is None:
            return False
        try:
            await ws.send_json(message)
            return True
        except Exception:
            return False

    async def broadcast(self, message: dict) -> None:
        for client_id in list(self._active):
            await self.send(client_id, message)

    @property
    def connected_count(self) -> int:
        return len(self._active)


manager = ConnectionManager()


async def simulate_job(client_id: str, job_id: str, cancel_flag: dict) -> None:
    """Simulates a long-running job with progress updates."""
    for step in range(0, 101, 10):
        if cancel_flag.get('cancelled'):
            await manager.send(client_id, {
                'type':   'cancelled',
                'job_id': job_id,
            })
            return

        await manager.send(client_id, {
            'type':    'progress',
            'job_id':  job_id,
            'percent': step,
        })
        await asyncio.sleep(0.2)  # simulate work

    await manager.send(client_id, {
        'type':   'complete',
        'job_id': job_id,
    })


@router.websocket('/ws/{client_id}')
async def websocket_endpoint(
    websocket: WebSocket,
    client_id: str,
) -> None:
    await manager.connect(client_id, websocket)
    cancel_flag: dict = {'cancelled': False}
    current_task: asyncio.Task | None = None

    try:
        while True:
            raw = await websocket.receive_text()

            try:
                message = json.loads(raw)
            except json.JSONDecodeError:
                await manager.send(client_id, {'type': 'error', 'detail': 'Invalid JSON'})
                continue

            msg_type = message.get('type')

            if msg_type == 'start_job':
                job_id = message.get('job_id', 'job-1')
                cancel_flag = {'cancelled': False}
                current_task = asyncio.create_task(
                    simulate_job(client_id, job_id, cancel_flag)
                )

            elif msg_type == 'cancel':
                cancel_flag['cancelled'] = True

            else:
                await manager.send(client_id, {
                    'type':    'error',
                    'detail':  f'Unknown message type: {msg_type}',
                })

    except WebSocketDisconnect:
        if current_task and not current_task.done():
            current_task.cancel()
    finally:
        manager.disconnect(client_id)
```

---

## Step 2 — Write Tests

Create `tests/test_websocket.py`:

```python
import pytest
import asyncio
import json
from fastapi.testclient import TestClient
from fastapi import FastAPI
from src.websocket_router import router, manager


@pytest.fixture
def app() -> FastAPI:
    app = FastAPI()
    app.include_router(router)
    return app


@pytest.fixture(autouse=True)
def cleanup_connections():
    yield
    manager._active.clear()


class TestWebSocketEndpoint:

    def test_accepts_connection(self, app: FastAPI) -> None:
        with TestClient(app).websocket_connect('/ws/test-client') as ws:
            pass  # Connection accepted and closed cleanly

    def test_starts_a_job_and_receives_progress(self, app: FastAPI) -> None:
        with TestClient(app).websocket_connect('/ws/client-1') as ws:
            ws.send_json({'type': 'start_job', 'job_id': 'j-1'})

            messages = []
            for _ in range(12):  # 11 progress + 1 complete
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

    def test_cancel_stops_the_job(self, app: FastAPI) -> None:
        with TestClient(app).websocket_connect('/ws/client-2') as ws:
            ws.send_json({'type': 'start_job', 'job_id': 'j-2'})

            # Receive first progress, then cancel:
            msg1 = ws.receive_json()
            assert msg1['type'] == 'progress'

            ws.send_json({'type': 'cancel'})

            # Wait for cancellation confirmation:
            messages = []
            for _ in range(20):
                try:
                    msg = ws.receive_json()
                    messages.append(msg)
                    if msg.get('type') == 'cancelled':
                        break
                except Exception:
                    break

            assert any(m['type'] == 'cancelled' for m in messages)

    def test_invalid_json_returns_error(self, app: FastAPI) -> None:
        with TestClient(app).websocket_connect('/ws/client-3') as ws:
            ws.send_text('not valid json')
            error = ws.receive_json()
            assert error['type'] == 'error'
```

### SAVE AND TRY

```bash
pytest tests/test_websocket.py -v
```

Expected: all tests pass.

---

## 🎯 Challenge: Add Authentication to WebSocket

**You know:** WebSocket lifecycle, connection manager, JWT from T5·L7.

**Task:** Modify the WebSocket endpoint to require a valid JWT token as a
query parameter:

```
ws://localhost:8000/ws/{client_id}?token=eyJ...
```

The handler should close the connection with code 4001 if the token is invalid.

Write 2 tests: one with a valid token, one with an invalid token.

---

<details>
<summary>▶ Show Solution</summary>

```python
from fastapi import Query
from src.auth.tokens import decode_access_token

@router.websocket('/ws/secure/{client_id}')
async def authenticated_websocket(
    websocket: WebSocket,
    client_id: str,
    token: str = Query(...),
) -> None:
    try:
        claims = decode_access_token(token)
    except ValueError:
        await websocket.close(code=4001)
        return

    await manager.connect(client_id, websocket)
    try:
        await manager.send(client_id, {'type': 'connected', 'user': claims.email})
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(client_id)
```

**Tests:**
```python
def test_invalid_token_closes_connection(app: FastAPI) -> None:
    with pytest.raises(Exception):
        with TestClient(app).websocket_connect(
            '/ws/secure/client?token=invalid.token.here'
        ) as ws:
            ws.receive_json()  # Should fail — connection closed

def test_valid_token_accepted(app: FastAPI) -> None:
    from src.auth.tokens import create_access_token
    token = create_access_token('u-1', 'test@e.com')
    with TestClient(app).websocket_connect(
        f'/ws/secure/client?token={token}'
    ) as ws:
        msg = ws.receive_json()
        assert msg['type'] == 'connected'
```

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| `accept()` required | Skip it — client sees connection refused |
| `WebSocketDisconnect` | Close browser tab — handler's `except` block runs |
| Cancel flag | Start job, send cancel, verify progress stops |
| Connection manager | Connect 2 clients, broadcast — both receive |
| Task cleanup | Cancel running task in `except WebSocketDisconnect` |

---

## Quick Check Answers

**1. Skip `await websocket.accept()` — what happens?**

The client's WebSocket upgrade request is never completed. The client receives a
connection error. FastAPI logs an error about the WebSocket not being accepted.
`accept()` completes the HTTP→WebSocket upgrade handshake — without it, the
WebSocket connection never opens.

**2. Client disconnects mid-session, handler stuck in `receive_text()`. What exception?**

`WebSocketDisconnect`. FastAPI raises this when the client closes the connection
while the server is waiting for a message. Always catch this exception in a
`try/except` block to handle cleanup gracefully. If not caught, the exception
propagates up and the handler terminates with an unhandled exception.

**3. 50 clients, one job completes — how to notify all 50?**

`await manager.broadcast(message)`. The `ConnectionManager` iterates all active
WebSocket connections and sends the message to each. Errors (dead connections)
are caught individually so one failed send does not prevent the others. Each
`send_json` is awaited — the broadcast is sequential but fast (all 50 sends
happen in one event loop run without yielding for I/O between them).
