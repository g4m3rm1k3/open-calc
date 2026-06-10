# Junior to Senior — T11·L1 — HTTP vs WebSocket vs SSE

**Prerequisites:** T10·L8 (DXF Import). You have the complete geometry library.
This lesson starts Topic 11 by building the communication mechanism for the CAD/CAM
job runner — starting with the simplest protocol first, then comparing all three to
understand when each fits.

**What this lab adds:**
- HTTP: why the server cannot push to the client without a request
- SSE: how a single HTTP connection streams data continuously to the browser
- WebSocket: how a protocol upgrade creates a bidirectional persistent channel
- The EXACT SSE wire format — `data: ...\n\n` — why those characters, what they mean

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You open `http://localhost:8000/health` in a browser. The browser sends an HTTP
>    request. The server responds. Can the server send another message 5 seconds later
>    WITHOUT the browser asking again?
> 2. `yield f'data: {json}\n\n'` — why exactly TWO newlines? What happens with one?
> 3. The G-code generation job takes 30 seconds. The user wants a progress bar.
>    HTTP, WebSocket, or SSE — which one and why?
>
> *(Answers at the end of this lab)*

---

## The Problem This Lesson Solves

The CAD/CAM application needs to report progress while a toolpath generation job runs.
The job runs on the server. The progress needs to appear in the browser.

The naive solution — poll the server every second — creates 30 unnecessary HTTP requests,
each with its own connection setup, headers, and teardown. There is a better way.

This lesson builds the better way from scratch, explaining exactly why each piece
of the protocol is written the way it is.

---

### Concept: Why HTTP Cannot Push

**What it is:** HTTP is a request-response protocol. The client sends a request;
the server sends exactly one response; the connection closes. There is no mechanism
for the server to initiate contact.

**The mechanism — why the server cannot push:**

When your browser connects to `http://localhost:8000/health`:

```
1. Browser opens a TCP connection to the server
2. Browser sends: GET /health HTTP/1.1\r\nHost: localhost\r\n\r\n
3. Server sends: HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"status":"ok"}
4. Server closes the TCP connection
```

The server has no way to send step 5, 6, or 7 — the connection is closed. Even if the
server had new data 5 seconds later, there is no open channel to send it through.
It would have to wait for the browser to ask again.

**The problem this creates:**

```python
# To show progress, you would have to poll:
# Browser: GET /jobs/123/status → {"percent": 0}
# Browser: GET /jobs/123/status → {"percent": 10}   (1 second later)
# Browser: GET /jobs/123/status → {"percent": 20}   (1 second later)
# ... 30 HTTP requests total
# Each request: new TCP connection, TLS handshake, full headers, response, teardown
```

This is wasteful. The fix is to keep the connection open.

**You will see this again in:**
- Every REST API uses HTTP for this reason — stateless, per-request
- HTTP/2 and HTTP/3 add multiplexing but still don't give the server push-without-ask ability for most use cases
- This is why WebSockets and SSE were invented

**Watch for:** HTTP/2 has a "server push" feature, but it is for pre-sending CSS/JS assets
the browser is about to request — not for streaming data from background jobs.

---

## Step 1 — See the HTTP Limitation

Start the FastAPI server:

```bash
uvicorn src.main:app --reload
```

In a second terminal:

```bash
curl -v http://localhost:8000/health
```

**You should see:**
```
* Trying 127.0.0.1:8000...
* Connected to localhost (127.0.0.1) port 8000
> GET /health HTTP/1.1
> Host: localhost:8000
< HTTP/1.1 200 OK
< content-type: application/json
<
{"status":"ok"}
* Connection #0 to host localhost closed.
```

The last line is the key: `Connection #0 to host localhost closed.` The connection was
opened, used once, and immediately closed. There is no way for the server to send more data.

**Change something:** Run curl again with `--no-close`:

```bash
curl --no-close http://localhost:8000/health
```

**Expected:** Same output — the server controls when to close. The client cannot force it
to stay open. The server decides the connection lifetime for HTTP.

---

### Concept: SSE — Keeping the Connection Open

**What it is:** Server-Sent Events (SSE) repurposes HTTP. Instead of closing the connection
after one response, the server keeps the connection open and sends multiple lines of data,
each formatted as `data: <content>\n\n`. The browser reads each line as it arrives.

**The wire format — exactly what travels over the network:**

```
HTTP/1.1 200 OK
Content-Type: text/event-stream   ← tells browser: keep this connection open
Cache-Control: no-cache           ← prevents any proxy from buffering the stream
X-Accel-Buffering: no             ← prevents nginx from buffering (if behind nginx)

data: {"percent": 0}\n\n          ← one event (TWO newlines = event boundary)
data: {"percent": 10}\n\n         ← next event
data: {"percent": 20}\n\n         ← next event
...
```

**Why `\n\n` (two newlines)?**

The SSE protocol specification says: a single `\n` is a line separator within one event;
a blank line (`\n\n` = two consecutive newlines) marks the END of one event. Without the
second newline, the browser accumulates the data but does not fire the `onmessage` event.

```
data: first line\n        ← still part of the current event (no onmessage yet)
data: second line\n       ← still part of the current event (no onmessage yet)
\n                         ← blank line — event is complete! onmessage fires
```

In practice, single-line events use `f'data: {json}\n\n'` — the first `\n` ends the
`data:` line; the second `\n` is the blank line that completes the event.

**What it hides:** The TCP stream handling, event buffering, and retry logic. The browser's
`EventSource` API reads the raw TCP stream and assembles events from the `data:\n\n` markers.
You never touch the TCP layer.

**Canonical example:** A ticker tape. The printer (server) keeps printing. Each line ends
with a period (single `\n`) and each message ends with a blank line (double `\n\n`).
The reader (browser) collects lines until they see the blank line, then processes the full message.

**Project Application:** The toolpath job generator yields one SSE event per 10% of
progress. The browser receives each event and updates the progress bar.

**Smallest possible example:**

```python
# This is the ENTIRE SSE protocol from the server's perspective:
async def stream():
    yield "data: first message\n\n"   # event 1 — fires onmessage in browser
    await asyncio.sleep(1)
    yield "data: second message\n\n"  # event 2 — fires onmessage again
```

**You will see this again in:**
- GitHub: uses SSE to stream CI build logs in real time
- Twitter/X: uses SSE for streaming new tweets on the timeline
- Any application with server-initiated push that only flows in one direction

**Watch for:** `Content-Type: text/event-stream` is required. Without it, the browser
treats the response as plain text and does not process the `data:` format.

---

## Step 2 — Build the SSE Endpoint, Line by Line

Create `src/api/sse_router.py`. Build it incrementally — one piece at a time.

First, the generator function that yields SSE-formatted events:

```python
# src/api/sse_router.py
import asyncio
import json
from typing import AsyncGenerator


async def progress_generator(job_id: str) -> AsyncGenerator[str, None]:
    """
    Yields SSE-formatted events for a simulated long-running job.
    Each yield is one complete SSE event (data line + blank line terminator).
    """
    for percent in range(0, 101, 10):
        # Build the JSON payload:
        payload = json.dumps({'job_id': job_id, 'percent': percent})

        # SSE format: 'data: <payload>\n\n'
        # First \n  = end of the 'data:' line
        # Second \n = blank line = end of this SSE event (fires onmessage in browser)
        yield f'data: {payload}\n\n'

        await asyncio.sleep(0.5)   # simulates the actual work happening
```

### SAVE AND TRY

```bash
python -c "
import asyncio
from src.api.sse_router import progress_generator

async def test():
    async for event in progress_generator('test-job'):
        print(repr(event))   # repr() shows the \n characters explicitly

asyncio.run(test())
"
```

**You should see:**
```
'data: {"job_id": "test-job", "percent": 0}\n\n'
'data: {"job_id": "test-job", "percent": 10}\n\n'
'data: {"job_id": "test-job", "percent": 20}\n\n'
...
'data: {"job_id": "test-job", "percent": 100}\n\n'
```

Notice the `\n\n` at the end of every string — the SSE event boundary. **Change something:**
Remove one `\n` to make it `\n`:

```python
yield f'data: {payload}\n'   # only ONE newline
```

Run the test. The events are still generated. But when the browser receives them, `onmessage`
does NOT fire because the event boundary (blank line) is never sent. Change it back to `\n\n`.

Now add the FastAPI route that wraps the generator in a `StreamingResponse`:

```python
# Add to src/api/sse_router.py
from fastapi           import APIRouter
from fastapi.responses import StreamingResponse   # streams a generator to the client

router = APIRouter(prefix='/jobs', tags=['jobs'])


@router.get('/{job_id}/progress')
async def job_progress(job_id: str) -> StreamingResponse:
    """
    Returns a streaming SSE response.
    StreamingResponse calls next() on the generator for each client read.
    The client receives each yield as it becomes available.
    """
    return StreamingResponse(
        progress_generator(job_id),
        media_type='text/event-stream',  # tells browser: keep connection open, parse SSE format
        headers={
            'Cache-Control': 'no-cache',        # prevents any proxy from buffering events
            'X-Accel-Buffering': 'no',          # prevents nginx from buffering (common in deployment)
        },
    )
```

Add to `src/main.py`:

```python
from src.api.sse_router import router as sse_router
app.include_router(sse_router)
```

### SAVE AND TRY

```bash
uvicorn src.main:app --reload
```

In a second terminal, watch the events arrive:

```bash
curl -N http://localhost:8000/jobs/my-job/progress
```

**The `-N` flag tells curl to disable buffering** — without it, curl waits to collect the
entire response before printing, which defeats the purpose of streaming.

**You should see** (with 0.5-second pauses between each line):
```
data: {"job_id": "my-job", "percent": 0}

data: {"job_id": "my-job", "percent": 10}

data: {"job_id": "my-job", "percent": 20}
...
data: {"job_id": "my-job", "percent": 100}
```

Notice the blank line between each message — that is the second `\n` in `\n\n`, rendered
as a blank line in the terminal.

**Change something:** Remove `'Cache-Control': 'no-cache'` from the headers. The events
still arrive — for a local test without a proxy, this header makes no difference. But in
production with nginx or a CDN, without it the proxy buffers ALL events and delivers them
in one burst at the end.

---

### Concept: Browser-Side — `EventSource`

**What it is:** `EventSource` is a built-in browser API that opens an SSE connection and
fires `onmessage` for each complete event. It automatically reconnects if the connection drops.

**The mechanism — what happens in the browser:**

```js
// 1. Create the connection:
const source = new EventSource('/jobs/123/progress');
// → Browser opens a GET to /jobs/123/progress with Accept: text/event-stream header
// → Server keeps the connection open and streams events

// 2. The browser parses the stream in the background:
//    - Reads bytes as they arrive
//    - Assembles lines until it sees a blank line (\n\n)
//    - Fires onmessage with the assembled data

source.onmessage = (event) => {
  // event.data is the text after "data: " — e.g., '{"percent": 42}'
  const data = JSON.parse(event.data);   // parse the JSON string
  console.log(`${data.percent}% complete`);

  if (data.percent === 100) {
    source.close();  // disconnect when done — otherwise connection stays open forever
  }
};

// 3. Error handling:
source.onerror = () => {
  console.error('SSE connection failed');
  // EventSource automatically retries — you do not need to reconnect manually
};
```

**What it hides:** The HTTP connection management, retry logic, and event parsing. You
provide callbacks; EventSource handles the protocol.

**The invariant EventSource protects:** Auto-reconnect. If the network drops, EventSource
reconnects automatically (using the `Retry:` SSE header or a default retry interval).
Your `onmessage` callback continues to receive events after reconnection.

**Project Application:** The React progress component uses `EventSource` to receive job
updates. The component closes the connection when the job completes or the component unmounts.

**You will see this again in:**
- The MDN documentation for `EventSource` is the canonical reference
- React: in `useEffect`, create `EventSource`, return cleanup that calls `source.close()`
- Node.js client: `eventsource` npm package implements the same API server-side

**Watch for:** Always call `source.close()` when done or when the React component unmounts.
An open `EventSource` connection keeps the backend streaming events even after the user
navigates away — server resources and network bandwidth are wasted.

---

## Step 3 — Test the Full SSE Flow

Create `tests/test_sse.py`:

```python
# tests/test_sse.py
import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


def test_sse_endpoint_streams_progress_events() -> None:
    """
    Verifies that the SSE endpoint returns a streaming response
    with the correct content type and SSE-formatted events.
    """
    with client.stream('GET', '/jobs/test-job/progress') as response:
        assert response.status_code == 200
        assert 'text/event-stream' in response.headers['content-type']

        events = []
        for line in response.iter_lines():
            if line.startswith('data: '):
                import json
                data = json.loads(line[6:])   # strip 'data: ' prefix
                events.append(data)
                if data['percent'] == 100:
                    break   # stop reading after completion

    assert len(events) > 0
    assert events[0]['percent'] == 0
    assert events[-1]['percent'] == 100
    assert all(e['job_id'] == 'test-job' for e in events)


def test_sse_event_format_has_double_newline_boundary() -> None:
    """
    Verifies the raw SSE wire format — each event ends with \\n\\n.
    This is the protocol requirement the browser relies on.
    """
    # We check the generator directly, not through HTTP:
    import asyncio
    from src.api.sse_router import progress_generator

    async def collect_events():
        events = []
        async for event in progress_generator('format-test'):
            events.append(event)
            if len(events) == 2:   # just check the first two
                break
        return events

    events = asyncio.run(collect_events())

    for event in events:
        assert event.startswith('data: '),  'Every SSE line must start with "data: "'
        assert event.endswith('\n\n'),       'Every SSE event must end with \\n\\n'
```

### SAVE AND TRY

```bash
pytest tests/test_sse.py -v
```

**You should see:**
```
tests/test_sse.py::test_sse_endpoint_streams_progress_events PASSED
tests/test_sse.py::test_sse_event_format_has_double_newline_boundary PASSED

2 passed
```

**The second test is the critical one:** It verifies the exact wire format — `data:` prefix
and `\n\n` terminator. If you change the format, that test fails immediately.

---

### Concept: WebSocket vs SSE — When Bidirectional Matters

**What it is:** WebSocket requires an HTTP Upgrade handshake, then operates as a persistent
TCP connection where EITHER side can send data at ANY time. Unlike SSE (server→client only),
WebSocket allows the client to send messages too.

**The mechanism — the WebSocket handshake:**

```
1. Client sends:  GET /ws HTTP/1.1
                  Connection: Upgrade
                  Upgrade: websocket
                  Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==

2. Server sends:  HTTP/1.1 101 Switching Protocols
                  Connection: Upgrade
                  Upgrade: websocket
                  Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=

3. Both sides:    Now send raw WebSocket frames (NOT HTTP) bidirectionally
```

After step 2, HTTP is abandoned. Both sides speak the WebSocket frame protocol — a
binary format where each message has a 2-14 byte header indicating the message type,
length, and whether it is masked.

**When SSE is enough vs when you need WebSocket:**

| Need | Use |
|---|---|
| Server sends data to client | SSE — simpler |
| Client also sends data to server | WebSocket |
| Reconnection should be automatic | SSE — built-in |
| You need binary data (images, audio) | WebSocket |
| Progress bars, notifications, live feeds | SSE |
| Chat, collaborative editing, multiplayer | WebSocket |

**Project Application:**
- **Progress updates:** SSE — the server sends percent; the client only listens
- **Cancel button:** HTTP DELETE — a single request, not streaming
- **Collaborative CAD editing:** WebSocket — users send geometry changes to each other

**You will see this again in:**
- T11-L2 builds the WebSocket endpoint for the job runner
- Socket.io, Pusher, Ably — libraries that abstract WebSocket for production

---

## 🎯 Challenge: Protocol Selection With Justification

**You know:** HTTP (stateless, one request/response), SSE (server→client streaming),
WebSocket (bidirectional streaming).

**Task:** For each scenario, name the protocol AND explain the specific mechanism reason.
"WebSocket because it's real-time" is not enough — explain WHAT property of the protocol
makes it the right choice.

1. A real-time stock ticker that updates every second
2. A chat application with 1,000 simultaneous users
3. A file upload endpoint with progress feedback
4. Collaborative whiteboard where all users see each other's drawings
5. Email notification when a background job completes
6. A GPS location that the server streams to a delivery tracking UI

---

<details>
<summary>▶ Show Solution</summary>

**1. Stock ticker → SSE**

The stock exchange sends new prices; the browser only displays them. No client messages
are sent back to the server. SSE's server→client-only design is exactly right. The browser's
`EventSource` handles auto-reconnect automatically — critical for a live financial feed.

**2. Chat → WebSocket**

Chat requires BOTH directions: Alice sends a message to the server; the server forwards
it to Bob; Bob receives it. Bob also sends messages back. SSE cannot receive messages
from the browser — only WebSocket allows both sides to send at any time.

**3. File upload progress → SSE (or polling)**

The upload itself is HTTP POST. Progress feedback flows server→browser only.
SSE is correct: the server tracks bytes received and sends percent-complete events.
A secondary SSE connection for progress while the main POST connection carries the file data.

**4. Collaborative whiteboard → WebSocket**

Every draw event from Alice must reach Bob AND every draw event from Bob must reach Alice.
The server is a relay — it receives from one user and broadcasts to others. Messages flow
in both directions simultaneously. WebSocket is the only protocol that supports this.

**5. Email notification → SSE**

The browser wants to know when the job is done. The server pushes one event.
The browser never sends anything back. SSE is simpler, auto-reconnects, and
the browser doesn't need to manage a WebSocket upgrade.

**6. GPS location tracking → SSE**

The GPS device (server-side) sends location updates; the tracking UI displays them.
One direction only — the UI never sends coordinates back. SSE streams the updates
continuously. The browser's `EventSource` reconnects automatically if the GPS signal
drops.

**Key insight:** The deciding question is always: "Does the client need to SEND data
BACK to the server over the same connection?" If no → SSE. If yes → WebSocket.

</details>

---

## Final Check

| Concept | What to verify |
|---|---|
| HTTP cannot push | `curl -v` shows `Connection ... closed` after one response |
| SSE event format | Raw events start with `data: ` and end with `\n\n` |
| Two newlines required | Remove one `\n` — events accumulate but `onmessage` never fires |
| `Content-Type` required | Remove it — browser treats stream as plain text |
| `Cache-Control` purpose | Without it, nginx/CDN buffers all events and delivers at end |

---

## Quick Check Answers

**1. Server cannot send another message 5 seconds later without the browser asking?**

Correct — with plain HTTP. After responding to `GET /health`, the server closes the TCP
connection. There is no channel for the server to send through. To send more data, the
server must wait for a new request from the browser. SSE solves this by keeping the
connection open with the `Content-Type: text/event-stream` header, which instructs
the browser not to close after the first data chunk.

**2. Why exactly TWO newlines? What happens with one?**

The SSE specification defines event boundaries using blank lines. A single `\n` ends
a field line (e.g., the `data:` line) but does not signal event completion. Two consecutive
newlines (`\n\n`) create a blank line, which tells the browser's `EventSource` parser
"this event is complete — fire `onmessage`." With only one `\n`, the browser keeps
accumulating data but never fires the event handler. Your progress bar never updates.

**3. 30-second job, user wants a progress bar — which protocol?**

SSE. The server generates progress updates and streams them to the browser. The browser
only listens — it never needs to send data back to the job process. SSE is simpler than
WebSocket (no upgrade handshake, no frame protocol, no masking), auto-reconnects if
the connection drops, and the browser's `EventSource` API handles everything.
