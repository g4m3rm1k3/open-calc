# PyReact — LAB 6 — FastAPI + WebSocket: Server-Authoritative State

**Prerequisites:** Labs 1–5. Full file set intact. You understand VNodes, patches, the DOM patcher, JSX, and useState. Both `python server.py` and `npm run dev` run without errors.

**What this lab adds:**
- A FastAPI server that replaces our simple HTTP server
- A WebSocket endpoint that holds state in Python
- A browser WebSocket client that receives patches and applies them automatically
- A counter whose state lives entirely in Python — the browser only displays and sends events

**Time:** 90–105 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. HTTP works like a letter: you send a request, you get one response, the connection closes. What would be the problem with using HTTP to push real-time updates from server to browser?
> 2. In Lab 5, state lived in `_slots` in the browser. If two users opened the app simultaneously, would they share state or have independent state? Why?
> 3. If the browser is "just a display" and Python holds all state — what does the browser need to send to the server when a button is clicked?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab the architecture looks like this:

```
Python (FastAPI)                    Browser
────────────────                    ───────
state = {"count": 0}               Shows: Count: 0

User clicks [+]
                    ←── {"event": "increment"} ───
state["count"] += 1
new_vnode = render(state)
patch = diff(old, new)
                    ─── {"patch": [...]} ────────→
                                   applyPatch(patch)
                                   Shows: Count: 1
```

The browser sends event names. Python updates state, re-renders, diffs, and sends back patches. The browser applies them. Python is the authority — the browser is a thin display layer.

This is exactly how Phoenix LiveView works. It is also how server-side rendering with hydration works. Understanding this architecture unlocks a whole category of production systems.

---

## Concept: HTTP vs WebSocket

**What it is:** Two different protocols for communication between a browser and a server. HTTP is request-response. WebSocket is a persistent two-way channel.

**The problem before:**

HTTP was designed for documents: browser asks, server answers, connection closes. This model breaks down for real-time UIs:

```
Browser wants to receive an update from server:

Option 1 — Polling:
  Every 500ms: browser asks "anything new?"
  Server says "no" 99% of the time.
  Wasteful. Slow. Still half a second of latency.

Option 2 — Long polling:
  Browser asks. Server holds the connection open until there's news.
  Sends the update. Connection closes. Browser immediately asks again.
  Hacky. Connection overhead on every update.

Option 3 — Server-Sent Events:
  One-way stream from server to browser. Browser can't send back.
  Fine for dashboards. Useless for interactive UIs.
```

**The solution:** WebSocket. The browser and server perform an HTTP handshake to upgrade the connection, then keep it open indefinitely. Either side can send a message at any time. No request-response cycle. No connection overhead per message. Full duplex — simultaneous send and receive.

**What it hides:** WebSocket hides the TCP connection management, framing, masking, ping/pong keepalives, and close handshake behind a simple send/receive API. The invariant it protects: **once a WebSocket connection is established, either side can send a message at any time and the other side will receive it in order, with no additional protocol overhead.**

**Canonical example (General):**

HTTP is a walkie-talkie with a push-to-talk button — one side talks, the other listens, then they swap. WebSocket is a phone call — both sides can speak and listen simultaneously, the line stays open, and either side can say something at any moment without waiting for the other to finish.

**Project application (The "Why" here):**

Our framework needs two flows: browser → server (user clicked a button), and server → browser (here is a patch). Both directions happen independently. WebSocket is the only protocol that supports both directions on one persistent connection without polling.

**Watch for:** WebSocket messages are strings (or binary data). We'll send JSON strings in both directions. The browser sends `JSON.stringify({event: "increment"})`. Python receives that string and parses it with `json.loads()`. Python sends `JSON.dumps(patch)`. The browser receives that string and parses it with `JSON.parse()`.

---

## Concept: ASGI

**What it is:** Asynchronous Server Gateway Interface — the Python standard for async web servers and frameworks. FastAPI is built on ASGI. It replaces the older WSGI standard that Flask and Django originally used.

**The problem before:**

The original Python web standard (WSGI) was synchronous — one request at a time per thread. For a WebSocket that stays open indefinitely, a synchronous server would need one thread per connected client. Ten thousand connected clients would need ten thousand threads — impractical.

**The solution:** ASGI uses Python's `async/await` system. One thread handles thousands of connections by switching between them whenever one is waiting for I/O. A WebSocket waiting for a message from a client doesn't block the thread — the thread handles other connections while it waits.

**What it hides:** ASGI hides the event loop, coroutine scheduling, and I/O multiplexing behind `async def` functions and `await` expressions. The invariant it protects: **an `async def` endpoint can handle thousands of concurrent connections without blocking — the framework switches between them automatically whenever an `await` is reached.**

**Canonical example (General):**

A restaurant with one waiter (one thread). Without async: the waiter takes an order, stands at the kitchen window staring at the chef until the food is ready, then serves it — blocking all other tables the entire time. With async: the waiter takes an order, hands it to the kitchen, and immediately attends to the next table. When the kitchen calls "order up," the waiter returns to deliver. One waiter, many tables, nobody waiting unnecessarily.

**Project application (The "Why" here):**

Our WebSocket endpoint is `async def`. When it `await`s a message from the browser (`await websocket.receive_text()`), Python's event loop handles other connections. When a message arrives, the loop returns control to our handler. This is why FastAPI can handle multiple browser connections simultaneously with a single Python process.

**Watch for:** `async def` functions must be `await`ed when called from other async functions. If you forget `await`, you get a coroutine object instead of the result — a common async bug. We'll mark every `await` with an explanation of why it's there.

---

## Step 1 — Install FastAPI and Uvicorn

Stop `python server.py` (Ctrl+C). We're replacing it.

In your terminal from the `pyreact/` folder:

```
pip install fastapi uvicorn --break-system-packages
```

**What each package is:**

`fastapi` — the web framework. Handles routing, request parsing, WebSocket protocol, and response formatting. Built on Starlette (an ASGI toolkit) and Pydantic (data validation).

`uvicorn` — the ASGI server. It's the program that actually listens on port 8000, accepts TCP connections, and runs your FastAPI app. FastAPI is the framework; uvicorn is the engine that runs it. Their relationship is like Django (framework) and gunicorn (server).

### SAVE AND TRY

```
python -c "import fastapi; print(fastapi.__version__)"
python -c "import uvicorn; print(uvicorn.__version__)"
```

**Expected:** Two version numbers. No ImportError.

---

## Concept: The Server-Side Component

**What it is:** A Python function that accepts state and returns a VNode tree — the server-side equivalent of our JSX component functions.

**The problem before:**

In Lab 5, components were JavaScript functions. State lived in `_slots` in the browser. The server knew nothing about the UI. This works for client-only apps, but it means:

- State is lost on page refresh
- Two users can't share state
- The server can't push updates proactively (a new message, a price change, a notification)

**The solution:** Move the component to Python. State lives in a Python dictionary. The component is a Python function that takes state and returns a VNode tree using our `create_element` from Lab 1. The browser receives VNodes and patches — it never owns state.

**What it hides:** The server-side component model hides state management, persistence, and multi-user synchronization from the browser entirely. The browser is a rendering terminal — it shows what the server tells it to show. The invariant it protects: **the server's state is always the source of truth. The browser's displayed UI is always a reflection of server state — never ahead of it, never behind it after a patch is applied.**

**Canonical example (General):**

A flight departure board at an airport. The board (browser) shows whatever the central system (server) tells it. Gate changes, delays, cancellations — all pushed from the central system. The board doesn't decide anything. Multiple boards in different terminals show the same state because they're all connected to the same source.

**Project application (The "Why" here):**

Our Python component will be a function `render(state)` that produces a VNode tree from the current state dictionary. When state changes, we call `render(state)` again, diff against the previous tree, and send the patch over the WebSocket. The browser applies it. This is the complete server-authoritative rendering loop.

---

## Step 2 — Create the FastAPI Server

Create `pyreact/app.py` (note: `app.py`, not `app.jsx`):

```python
# app.py
# FastAPI server with WebSocket support.
# This replaces server.py for serving both static files and WebSocket connections.

import json
import asyncio
from fastapi import FastAPI, WebSocket
# FastAPI: the framework class — we create one instance and add routes to it
# WebSocket: the type annotation for WebSocket connection parameters

from fastapi.staticfiles import StaticFiles
# StaticFiles: serves files from a directory over HTTP
# We use it to serve index.html, bundle.js, patcher.js just like server.py did

from vdom import create_element, serialize
# create_element: builds VNode trees (from Lab 1)
# serialize: converts VNode trees to plain dicts for JSON encoding

from reconciler import diff, serialize_node
# diff: compares two VNode trees and produces a patch (from Lab 2)
# serialize_node: handles VNode objects in json.dumps (from Lab 2)

app = FastAPI()
# Create the FastAPI application instance.
# All routes (HTTP endpoints and WebSocket endpoints) are registered on this object.
```

**Why `app.py` instead of a different name?**

`app` is the FastAPI convention — uvicorn's default command looks for `app:app`, meaning "the object named `app` inside the file named `app`." We follow the convention so the run command is predictable.

### SAVE AND TRY

```
python -c "from app import app; print(type(app))"
```

**Expected:** `<class 'fastapi.applications.FastAPI'>` — FastAPI imported and the app object created without errors.

---

## Step 3 — Add the Server-Side Component

Add the following to `app.py` below the imports:

```python
# ─── Server-Side State ────────────────────────────────────────

def get_initial_state():
    return {"count": 0}
    # A function instead of a module-level dict because each WebSocket
    # connection gets its own independent state.
    # If we used one shared dict, all users would share one counter.
    # Calling get_initial_state() per connection gives each user their own.

# ─── Server-Side Component ────────────────────────────────────

def render(state):
    # render: accepts a state dict, returns a VNode tree.
    # This is the Python equivalent of our JSX component functions.
    # It is a pure function — same state always produces same VNode.
    # "Pure" means: no side effects, no reading from outside state,
    # output determined entirely by the input argument.

    count = state["count"]
    # Read the current count from state.
    # In JSX we wrote: const [count, setCount] = useState(0)
    # Here we just read from the dict — Python holds the state directly.

    return create_element(
        "div", {"id": "app"},
        create_element("p", {}, f"Count: {count}"),
        # f"Count: {count}" is a Python f-string — embeds the variable inline
        # Equivalent to JSX's: <p>Count: {count}</p>

        create_element(
            "button",
            {"data-event": "increment"},
            # data-event is a custom HTML attribute — we use it to identify
            # which event to send when this button is clicked.
            # We can't use onClick here because this VNode is serialized to JSON
            # and sent to the browser — functions can't be serialized to JSON.
            # The browser will read data-event and send it to the server.
            "+"
        ),
        create_element(
            "button",
            {"data-event": "decrement"},
            "-"
        ),
    )
```

**Why `data-event` instead of `onClick`?**

In Lab 5, `onClick` was a JavaScript function stored directly in the VNode props. That worked because the VNode never left the browser — it was created and consumed in the same runtime.

Now the VNode is created in Python and serialized to JSON for transport. Functions cannot be serialized to JSON. We need a different mechanism: a string attribute (`data-event`) that names the event. The browser reads this attribute, and when the element is clicked, sends the event name to the server as a JSON message. The server handles the event in Python.

`data-*` attributes are the HTML standard for custom attributes. They don't affect browser behavior — they're just metadata for your code to read.

### SAVE AND TRY

Open a Python interactive session from `pyreact/`:

```
python
```

```python
from app import render, get_initial_state
from vdom import serialize
import json

state = get_initial_state()
tree = render(state)
print(json.dumps(serialize(tree), indent=2))
```

**Expected:** A JSON VNode tree with a `div` containing a `p` with `"Count: 0"` and two buttons.

```python
state["count"] = 5
tree = render(state)
print(json.dumps(serialize(tree), indent=2))
```

**Expected:** Same structure but `"Count: 5"`. The component is a pure function of state.

Exit with `exit()`.

---

## Concept: The WebSocket Lifecycle

**What it is:** The sequence of events that occur from the moment a browser opens a WebSocket connection to the moment it closes.

**The problem before:**

HTTP handlers are simple: receive request, send response, done. A WebSocket handler is fundamentally different — it must stay alive for the entire duration of the connection, which could be seconds, minutes, or hours. It needs to handle multiple messages arriving at unpredictable times.

**The solution:** An async loop. The handler runs indefinitely, `await`ing messages. Each message is processed, a response may be sent, and the loop continues. The loop exits when the connection closes.

**The lifecycle we'll implement:**

```
1. Browser connects
   → Server creates fresh state for this connection
   → Server renders initial VNode
   → Server sends full serialized VNode to browser
   → Browser mounts the VNode (full initial render)

2. Browser sends event (user clicked a button)
   → Server receives event name ("increment")
   → Server updates state
   → Server renders new VNode
   → Server diffs old vs new
   → Server sends patch to browser
   → Browser applies patch (incremental update)
   → old_vnode = new_vnode

3. Repeat step 2 for every subsequent event

4. Browser disconnects (tab closed, network lost)
   → Server's async loop exits
   → State for this connection is garbage collected
```

**Project application (The "Why" here):**

Step 1 sends the full VNode (not a patch) because there's no "old" VNode to diff against — this is the browser's first render. From step 2 onward, only patches are sent. This matches our `init()` logic from Lab 5: first render uses `mount()`, subsequent renders use `diff()` + `applyPatch()`.

**Watch for:** The browser uses two different message types: `{type: "mount", vnode: {...}}` for the initial render and `{type: "patch", patch: [...]}` for updates. The browser checks the `type` field and calls the appropriate function.

---

## Step 4 — Add the WebSocket Endpoint

Add the following to `app.py` below the component:

```python
# ─── WebSocket Endpoint ───────────────────────────────────────

@app.websocket("/ws")
# @app.websocket("/ws") registers this function as a WebSocket handler
# at the path /ws — browsers connect to ws://localhost:8000/ws
# The @ syntax is a Python decorator — it wraps our function with
# FastAPI's WebSocket connection management logic

async def websocket_endpoint(websocket: WebSocket):
    # async def — this is a coroutine, not a regular function
    # Python's event loop can pause it at every "await" point
    # websocket: WebSocket — FastAPI injects the connection object automatically

    await websocket.accept()
    # await: pause here until the WebSocket handshake completes
    # accept() performs the HTTP → WebSocket protocol upgrade
    # Without this, the browser's connection attempt is rejected

    # Initialize independent state for this connection
    state = get_initial_state()
    # Each connected browser gets its own state dict
    # Two users connecting simultaneously each get {"count": 0}

    # Initial render — send the full VNode tree
    initial_vnode = render(state)
    await websocket.send_text(
        json.dumps({
            "type": "mount",
            "vnode": serialize(initial_vnode)
            # serialize() converts VNode → plain dict → json.dumps → JSON string
        })
    )
    # send_text: send a string message to the browser
    # await: pause until the message is fully sent

    old_vnode = initial_vnode
    # Remember the initial VNode so we can diff against it on next render

    # ─── Event Loop ───────────────────────────────────────────
    try:
        while True:
            # Loop forever — keep the connection alive
            # This loop is the heart of the WebSocket handler

            text = await websocket.receive_text()
            # await: pause here until the browser sends a message
            # While paused, Python's event loop handles other connections
            # When a message arrives, execution resumes here

            message = json.loads(text)
            # Parse the JSON string the browser sent
            # We expect: {"event": "increment"} or {"event": "decrement"}

            event = message.get("event")
            # .get() returns None if "event" key doesn't exist
            # Safer than message["event"] which raises KeyError on missing key

            # ─── Event Handlers ───────────────────────────────
            if event == "increment":
                state["count"] += 1
            elif event == "decrement":
                state["count"] -= 1
            # Add more event handlers here as the app grows
            # Each handler mutates state — the render function reads it

            # ─── Re-render and Diff ───────────────────────────
            new_vnode = render(state)
            # Re-run the component with updated state
            # Same pattern as scheduleRender() in Lab 5

            patch = []
            diff(old_vnode, new_vnode, patch)
            # Compare old and new VNode trees
            # patch is now a list of operations

            if patch:
                await websocket.send_text(
                    json.dumps(
                        {"type": "patch", "patch": patch},
                        default=serialize_node
                        # serialize_node handles VNode objects inside patch
                        # (ADD_CHILD operations contain new_node VNodes)
                    )
                )
                # Only send a message if something actually changed

            old_vnode = new_vnode
            # New becomes old — ready for next event

    except Exception:
        pass
        # When the browser disconnects (tab closed, network error),
        # receive_text() raises an exception.
        # We catch it silently and let the handler function return.
        # Returning from the handler closes the connection cleanly.
        # The state dict is garbage collected — no memory leak.
```

**Why `while True` instead of a fixed number of iterations?**

A WebSocket connection stays open until one side closes it. We don't know in advance how many events a user will send — it could be zero, it could be a thousand. `while True` correctly models "handle events until the connection closes." The `try/except` around it is the exit condition: when the connection drops, `receive_text()` raises, we catch it, the loop exits, the function returns.

**Why catch all exceptions with bare `except Exception`?**

In production you'd catch specific WebSocket disconnect exceptions and log unexpected ones. For an educational framework, silently catching all exceptions is acceptable — the important behavior (clean exit on disconnect) is the same. We'll note the production improvement in the considerations section.

### SAVE AND TRY

Add the static files mount and run command to the bottom of `app.py`:

```python
# ─── Static Files ─────────────────────────────────────────────

app.mount("/", StaticFiles(directory=".", html=True), name="static")
# StaticFiles serves everything in the current directory over HTTP
# html=True means requests to "/" serve index.html automatically
# This replaces our old server.py entirely
# Must be added LAST — FastAPI routes are matched in registration order
# If this came before the WebSocket route, "/" would catch everything
```

Now run the new server:

```
uvicorn app:app --reload --port 8000
```

**What each part means:**
- `app:app` — file named `app`, object named `app` inside it
- `--reload` — restart the server automatically when Python files change
- `--port 8000` — same port as before, browser bookmarks still work

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Application startup complete.
```

Open `http://localhost:8000`. You should see the blank page — the same `index.html` as before. Open DevTools → Console — no errors yet. The WebSocket client doesn't exist yet. That's Step 5.

---

## Step 5 — Build the Browser WebSocket Client

Open `patcher.js`. Add the following to the bottom of the file:

```javascript
// ─── WebSocket Client ─────────────────────────────────────────

export function connectWebSocket(rootElement) {
    // connectWebSocket: opens a WebSocket connection to our Python server
    // and handles the two message types: mount and patch.
    // rootElement: the DOM node to render into

    const socket = new WebSocket("ws://localhost:8000/ws");
    // new WebSocket(url): opens a connection to the server's /ws endpoint
    // "ws://" is the WebSocket protocol — like "http://" but for WebSockets
    // "wss://" is the secure version (like "https://") used in production
    // This call returns immediately — the connection happens asynchronously

    socket.addEventListener("open", () => {
        // "open" fires when the connection is established
        // We don't need to send anything on open — the server sends first
        console.log("PyReact: WebSocket connected");
    });

    socket.addEventListener("message", (event) => {
        // "message" fires every time the server sends a message
        // event.data contains the raw string the server sent

        const message = JSON.parse(event.data);
        // Parse the JSON string into a JavaScript object
        // We expect either:
        //   { type: "mount", vnode: {...} }
        //   { type: "patch", patch: [...] }

        if (message.type === "mount") {
            mount(rootElement, message.vnode);
            // Full initial render — build the entire DOM from the VNode
            // mount() is defined above in this file
        }

        else if (message.type === "patch") {
            applyPatch(rootElement, message.patch);
            // Incremental update — apply only the changed operations
        }
    });

    socket.addEventListener("close", () => {
        console.log("PyReact: WebSocket disconnected");
        // Connection closed — tab closed on server side, or network issue
        // A production client would attempt to reconnect here
    });

    socket.addEventListener("error", (error) => {
        console.error("PyReact: WebSocket error", error);
    });

    return socket;
    // Return the socket so the caller can send messages back to the server
}
```

**Why do we return the `socket` from `connectWebSocket`?**

The browser needs to send event messages back to the server when buttons are clicked. The click handler needs access to the socket to call `socket.send(...)`. By returning the socket, the caller can pass it into the UI setup. We'll use this in Step 6.

### SAVE AND TRY

The build step (`npm run dev`) is still running. Update `app.jsx` to use `connectWebSocket` instead of `init`:

```jsx
/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx, Fragment } from "./runtime.js";
import { connectWebSocket } from "./patcher.js";
// ← removed: useState, init (state now lives in Python)
// ← removed: mount (connectWebSocket handles mounting)
// ← added: connectWebSocket

const root = document.getElementById("root");
const socket = connectWebSocket(root);
// Open the WebSocket connection.
// The server sends the initial VNode immediately on connect.
// connectWebSocket calls mount() when that message arrives.

window.PyReactSocket = socket;
// Expose the socket globally so click handlers can send events.
// We'll use this in Step 6.
```

**Wait — we removed all our JSX components. What renders the UI?**

The Python server. `render(state)` in `app.py` returns a VNode tree. The server sends it as JSON. The browser's `connectWebSocket` receives it and calls `mount()`. The browser no longer decides what to render — it only executes what the server sends.

This is the fundamental shift of this lab: the browser goes from being a rendering engine to being a display terminal.

Save `app.jsx`. esbuild rebuilds. Refresh `http://localhost:8000`.

**You should see:**
```
Count: 0
[+] [-]
```

Rendered from Python. Open DevTools → Network → WS tab. You should see the WebSocket connection and the initial `mount` message.

The buttons don't work yet — click handlers aren't wired up. That's Step 6.

---

## Concept: Event Delegation Over WebSocket

**What it is:** A pattern where the browser reads a data attribute from a clicked element and sends the event name to the server, instead of running client-side logic directly.

**The problem before:**

In Lab 5, `onClick` was a JavaScript function. Click → function runs → state updates locally. Now state is in Python. A click needs to:

1. Not run any local state logic
2. Tell the server which button was clicked
3. Wait for the server to respond with a patch

We can't serialize Python functions into JSON. We need a different way to label buttons.

**The solution:** `data-event` attributes. Each button carries a string label. The browser attaches one global click listener to the root element. When any click bubbles up to the root, the listener checks if the clicked element has a `data-event` attribute. If it does, it sends that value to the server as `{"event": "increment"}` or `{"event": "decrement"}`.

**What it hides:** Event delegation hides the per-element listener management. Without it, we'd attach a listener to every interactive element individually. The invariant it protects: **any element with a `data-event` attribute will send its event to the server when clicked, without any additional wiring code per element.**

**Canonical example (General):**

A hotel concierge desk. Any guest (any click) can walk up (bubble up to root). The concierge reads the guest's room card (data-event attribute) to identify what they need, then routes the request appropriately (sends to server). The hotel doesn't need a dedicated staff member outside every room door (listener per element) — one concierge handles all guests.

**Project application (The "Why" here):**

We attach one listener to `document.body`. Every click in the entire page bubbles up to it. We check `event.target.dataset.event` — the `data-event` attribute value, accessible through the browser's `dataset` API. If it exists, we send it to the server. This is also how React's synthetic event system works — one delegated listener at the root, not per-element listeners.

---

## Step 6 — Wire Up Event Delegation

Add the following to `patcher.js`, below `connectWebSocket`:

```javascript
// ─── Event Delegation ─────────────────────────────────────────

export function setupEventDelegation(socket) {
    // setupEventDelegation: attaches one click listener to the document body.
    // Any element with a data-event attribute will send that event to the server.
    // socket: the WebSocket connection to send events through

    document.body.addEventListener("click", (event) => {
        // "click" on document.body catches every click anywhere on the page
        // because click events bubble up from the target element through
        // all ancestors to the root of the document

        const target = event.target;
        // event.target: the specific element the user actually clicked
        // (could be the button, or text inside the button, etc.)

        const eventName = target.dataset.event;
        // dataset is the browser's API for reading data-* attributes
        // target.dataset.event reads the data-event attribute
        // If the element has data-event="increment", eventName is "increment"
        // If the element has no data-event attribute, eventName is undefined

        if (!eventName) return;
        // If there's no data-event, this click is not a framework event
        // Return early — don't send anything to the server

        socket.send(JSON.stringify({ event: eventName }));
        // JSON.stringify converts { event: "increment" } to a JSON string
        // socket.send() transmits it to the Python server
        // The server's while True loop receives it and handles it
    });
}
```

Now update `app.jsx` to call `setupEventDelegation`:

```jsx
/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx, Fragment } from "./runtime.js";
import { connectWebSocket, setupEventDelegation } from "./patcher.js";
// ← added: setupEventDelegation to the import

const root = document.getElementById("root");
const socket = connectWebSocket(root);

setupEventDelegation(socket);
// ← add this line
// Attach the delegated click listener.
// Any element with data-event will now send to the server on click.

window.PyReactSocket = socket;
```

### SAVE AND TRY

esbuild rebuilds automatically. Refresh `http://localhost:8000`.

**You should see:**
```
Count: 0
[+] [-]
```

Click `[+]`.

**Expected:** `Count: 1` — updated without page reload, driven by Python.

Click `[+]` three more times.

**Expected:** `Count: 4`.

Click `[-]`.

**Expected:** `Count: 3`.

Open DevTools → Network → WS tab. Click on the WebSocket connection entry. You should see the Messages panel showing:

```
← {"type": "mount", "vnode": {...}}     (server → browser, initial)
→ {"event": "increment"}                 (browser → server, your click)
← {"type": "patch", "patch": [...]}     (server → browser, response)
→ {"event": "increment"}
← {"type": "patch", "patch": [...]}
```

This is the full bidirectional protocol. Every click produces one outgoing message and one incoming patch.

**Change something:** Open a second browser tab to `http://localhost:8000`. Increment the counter in one tab. Check the other tab — it stays at 0. Each tab has its own WebSocket connection and its own state. This is the per-connection isolation working correctly. (Shared state across tabs would require a different architecture — we'll describe it in production considerations.)

---

## Step 7 — Add a Reset Event

To verify the event system is extensible, add a reset button. Open `app.py` and update the `render` function:

```python
def render(state):
    count = state["count"]
    return create_element(
        "div", {"id": "app"},
        create_element("p", {}, f"Count: {count}"),
        create_element("button", {"data-event": "increment"}, "+"),
        create_element("button", {"data-event": "decrement"}, "-"),
        create_element(               # ← add this element
            "button",
            {"data-event": "reset"},
            "Reset"
        ),
    )
```

Now add the event handler in the WebSocket endpoint's event section:

```python
            if event == "increment":
                state["count"] += 1
            elif event == "decrement":
                state["count"] -= 1
            elif event == "reset":        # ← add this branch
                state["count"] = 0
```

### SAVE AND TRY

uvicorn detects the Python file change and reloads automatically (because of `--reload`). Refresh the browser.

**You should see:** Three buttons: `[+]`, `[-]`, `[Reset]`.

Click `[+]` five times. Click `[Reset]`.

**Expected:** Count returns to 0. One UPDATE_TEXT patch sent.

**Notice:** You changed Python only — no JavaScript changes, no rebuild needed. The browser automatically received the new VNode structure on reconnect. The `render` function change was reflected immediately. This is the power of server-authoritative UI: update the component in one place, all connected clients get the new structure.

---

## 🎯 Challenge: Add a Step Size Control

**You know:** State is a Python dictionary. Events are strings sent from browser to server. The server updates state and re-renders.

**Task:** Add a "step size" to the state — a number that controls how much `+` and `-` change the count. Add two more buttons: `[Step: 1]` and `[Step: 5]` that change the step size. The `+` and `-` buttons should increment/decrement by the current step.

**Starting state:**
```python
def get_initial_state():
    return {"count": 0, "step": 1}
```

**Expected UI:**
```
Count: 0
[+]  [-]  [Reset]
Step: 1
[Step: 1]  [Step: 5]
```

Clicking `[Step: 5]` changes step to 5. Then clicking `[+]` adds 5 to count.

**Hints:**

1. You only need to change `app.py` — `render()` and the event handler section.
2. In `render()`, read `state["step"]` and display it. Add two new buttons with `data-event` values like `"set-step-1"` and `"set-step-5"`.
3. In the event handler, add two new `elif` branches that set `state["step"]`.

Try for at least 10 minutes before revealing.

---

<details>
<summary>▶ Show Solution</summary>

```python
def get_initial_state():
    return {"count": 0, "step": 1}

def render(state):
    count = state["count"]
    step = state["step"]
    return create_element(
        "div", {"id": "app"},
        create_element("p", {}, f"Count: {count}"),
        create_element("button", {"data-event": "increment"}, "+"),
        create_element("button", {"data-event": "decrement"}, "-"),
        create_element("button", {"data-event": "reset"}, "Reset"),
        create_element("p", {}, f"Step: {step}"),
        create_element("button", {"data-event": "set-step-1"}, "Step: 1"),
        create_element("button", {"data-event": "set-step-5"}, "Step: 5"),
    )

# In the event handler section:
            if event == "increment":
                state["count"] += state["step"]
                # ← was: state["count"] += 1
            elif event == "decrement":
                state["count"] -= state["step"]
                # ← was: state["count"] -= 1
            elif event == "reset":
                state["count"] = 0
            elif event == "set-step-1":
                state["step"] = 1
            elif event == "set-step-5":
                state["step"] = 5
```

**Key insight:** The event system is just strings and if/elif chains. Adding a new interactive element requires three things: a `data-event` attribute in `render()`, an `elif` branch in the event handler, and a state key to store the value. No JavaScript changes. No rebuild. The browser receives the new VNode structure automatically on next connect. This extensibility is the core advantage of server-authoritative state — the entire UI logic lives in one Python file.

</details>

---

## Production Considerations

**Multiple connected clients sharing state:**

Our architecture gives each WebSocket connection independent state. For shared state (a chat room, a collaborative counter, a live leaderboard), you'd store state outside the handler function — in a module-level dictionary keyed by room ID, or in a database. When any client sends an event, you update the shared state and send patches to *all* connected clients. FastAPI supports this with `asyncio` queues or a pub/sub system like Redis.

**WebSocket reconnection:**

Our browser client has no reconnection logic. If the network drops for a second, the WebSocket closes and the UI freezes. A production client would listen for the `close` event and attempt reconnection with exponential backoff — wait 1 second, try again; wait 2 seconds, try again; wait 4 seconds — up to a maximum interval.

**Specific exception handling:**

```python
from fastapi.websockets import WebSocketDisconnect

try:
    while True:
        text = await websocket.receive_text()
        ...
except WebSocketDisconnect:
    pass   # expected — client closed the tab
except Exception as error:
    print(f"Unexpected error: {error}")
    # log it — something unexpected happened
```

Catching `WebSocketDisconnect` specifically lets unexpected errors surface for debugging rather than being silently swallowed.

**Authentication:**

Our WebSocket endpoint accepts any connection with no authentication. Production WebSocket endpoints should validate a session token during the HTTP upgrade handshake — FastAPI supports reading cookies and headers in the WebSocket endpoint's parameters, before `await websocket.accept()`.

**State persistence:**

When the server restarts, all in-memory state is lost. Production systems persist state to a database. The WebSocket handler would load state from the database on connect and write it back after each event. The VNode render and diff logic are unchanged — only the state source changes.

---

## Final Check

| Feature | How to verify |
|---|---|
| FastAPI server starts | `uvicorn app:app --reload --port 8000` → no errors |
| Static files served | `http://localhost:8000` loads `index.html` |
| WebSocket connects | DevTools → Network → WS → connection entry appears |
| Initial mount message received | WS Messages panel shows `{"type": "mount", ...}` |
| UI renders from Python | Page shows "Count: 0" with `[+]` `[-]` buttons |
| Click sends event | WS Messages shows `{"event": "increment"}` on click |
| Server sends patch | WS Messages shows `{"type": "patch", ...}` after click |
| Count increments correctly | `[+]` increases count, `[-]` decreases it |
| Reset works | `[Reset]` returns count to 0 from any value |
| Two tabs are independent | Increment in tab 1 — tab 2 unchanged |
| Server reload updates UI | Change `render()` in Python — refresh browser — new UI appears |

---

## Quick Check Answers

**1. What's the problem with using HTTP for real-time server-to-browser updates?**

HTTP is pull-only — the browser must ask. The server cannot push. To receive updates, the browser would have to poll: send a request every N milliseconds asking "anything new?" This wastes bandwidth (most responses are "no"), adds latency (up to N milliseconds before seeing an update), and scales poorly (1000 clients polling every 500ms = 2000 requests per second, all returning "no"). WebSocket inverts this: the connection stays open and the server pushes exactly when something changes — zero wasted requests, minimal latency.

**2. If two users opened the Lab 5 app simultaneously, would they share state?**

No — they'd have completely independent state. Lab 5 state lived in `_slots` inside the browser's JavaScript runtime. Each browser tab runs its own JavaScript engine with its own memory. `_slots` in tab A has no connection to `_slots` in tab B. For state to be shared, it must live somewhere both tabs can reach — a server. That's exactly what this lab does: state lives in Python, and the server is the shared point.

**3. What does the browser need to send when a button is clicked?**

Just the event name — a string like `"increment"`. The browser doesn't need to send current state (the server owns state), doesn't need to send the new value (the server computes it), and doesn't need to describe the update (the server produces the patch). The message is minimal: `{"event": "increment"}`. The server does all the work.

---

## ▶ Next Session Prompt

```
Series: PyReact — Build React in Python
Completed: Lab 1 — VNode + serialization
           Lab 2 — Reconciler + patch format
           Lab 3 — DOM Patcher + HTTP server
           Lab 4 — JSX Runtime
           Lab 5 — Reactive State (useState)
           Lab 6 — FastAPI + WebSocket server-authoritative state
Next: Lab 7 — Incremental Updates: Fixing What We Skipped

What we built:
  - app.py: FastAPI app with WebSocket endpoint at /ws
    - get_initial_state() → per-connection state dict
    - render(state) → VNode tree (pure function)
    - websocket_endpoint: accept → mount → event loop → diff → patch
    - StaticFiles mount for serving index.html, bundle.js, patcher.js
  - patcher.js additions:
    - connectWebSocket(rootElement) → opens WS, handles mount/patch messages
    - setupEventDelegation(socket) → one delegated click listener on body
  - app.jsx: reduced to 5 lines — connectWebSocket + setupEventDelegation
  - Protocol: mount message (full VNode) on connect, patch messages on events
  - Event system: data-event attributes + delegated listener + socket.send

Key files:
  pyreact/vdom.py         — VNode, create_element, serialize, deserialize
  pyreact/reconciler.py   — Python diff, print_patch, serialize_node
  pyreact/reconciler.js   — JavaScript diff (browser-side)
  pyreact/app.py          — FastAPI server (replaces server.py)
  pyreact/index.html      — HTML shell, loads patcher.js + bundle.js
  pyreact/patcher.js      — full patcher + connectWebSocket + setupEventDelegation
  pyreact/runtime.js      — jsx(), Fragment, useState(), init(), scheduleRender()
  pyreact/app.jsx         — minimal bootstrap (connectWebSocket + setupEventDelegation)
  pyreact/bundle.js       — compiled output, do not edit
  pyreact/package.json    — npm project with esbuild --watch dev script

Run commands:
  Terminal 1: uvicorn app:app --reload --port 8000
  Terminal 2: npm run dev

Key decisions made:
  - data-event attributes replace onClick for server-driven event routing
  - One delegated listener on document.body — not per-element listeners
  - Per-connection state (get_initial_state called per WebSocket) — no sharing
  - mount message on connect (full VNode), patch messages on events (incremental)
  - Bare except Exception for disconnect handling (production should catch WebSocketDisconnect)
  - StaticFiles registered LAST — route order matters in FastAPI

Known issues to fix in Lab 7:
  - Event listener accumulation: applyPatch UPDATE_PROPS adds listeners, never removes old ones
  - No batching: two state changes = two renders (acceptable for now)
  - No reconnection logic in browser WebSocket client
  - server.py is now unused (can be deleted)

Lab 7 will cover:
  - Fixing event listener accumulation with a listener registry
  - Batching multiple state changes into one render cycle
  - Adding a reset/reconnect strategy to the browser client
  - Keyed children — fixing the index-based diffing weakness
  - Cleaning up the project structure (removing server.py, consolidating)
  - End-to-end test: a more complex UI that exercises all fixes

Start Lab 7.
```