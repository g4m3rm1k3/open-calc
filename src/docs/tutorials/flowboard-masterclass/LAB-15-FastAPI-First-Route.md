# FlowBoard Masterclass — LAB 15 — The Backend Begins: FastAPI and Your First Route

**Prerequisites:** LAB-14 — Custom hooks. The full React frontend is working with localStorage persistence.

**What this lab adds:**
- Python virtual environment — an isolated Python install for this project
- FastAPI — a Python web framework for building APIs
- HTTP request/response cycle — what happens when a browser fetches a URL
- `fetch` API — JavaScript's built-in tool for making HTTP requests
- `async/await` in JavaScript — reading a response without blocking the UI
- Your first `/api/ping` endpoint
- CORS (Cross-Origin Resource Sharing) — why the browser blocks same-machine requests

**Time:** 60–80 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. Right now the board data lives in the browser's localStorage. What data is lost if a second person opens the app on a different computer?
> 2. `fetch('http://localhost:8000/api/ping')` — what do you think this does? What does "fetch" mean here, and what is `localhost:8000`?
> 3. `async/await` lets you write asynchronous code that looks sequential. What does "asynchronous" mean for a network request — why is it necessary?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A Python server runs on port 8000. The browser's frontend (port 5173) makes a fetch request to the server and displays a message from it. This is the first end-to-end client-server communication in the project.

```
Browser (port 5173)          Server (port 8000)
      │                              │
      │  GET /api/ping               │
      │ ─────────────────────────→   │
      │                              │
      │  200 OK                      │
      │  { "message": "pong" }       │
      │ ←─────────────────────────   │
      │                              │
      │  Display "pong"              │
      │  in the UI                   │
```

---

## Concept: The HTTP Request/Response Cycle

**What it is:** Every time the browser communicates with a server, it follows a standard protocol: send a request, receive a response. HTTP (HyperText Transfer Protocol) is the language they use.

**The parts of an HTTP request:**

```
GET /api/ping HTTP/1.1
Host: localhost:8000
```

- **Method:** `GET` (read data), `POST` (create), `PUT/PATCH` (update), `DELETE` (remove)
- **Path:** `/api/ping` — what resource you want
- **Host:** who you are asking — `localhost:8000`

**The parts of an HTTP response:**

```
HTTP/1.1 200 OK
Content-Type: application/json

{"message": "pong"}
```

- **Status code:** `200` = success. `404` = not found. `500` = server error. `401` = unauthorized.
- **Body:** the data — in this case a JSON object

**The client-server mental model:**

The browser (client) asks for things. The server decides what to give back. They communicate over HTTP. The client cannot read the server's variables. The server cannot read the browser's state. They exchange only what is explicitly sent in requests and responses.

**You will see this again in:** Every API call in this project. Lab 16 (fetch board data), Lab 17 (create cards), Lab 18 (update and delete), Lab 20 (auth). HTTP is the foundation of everything on the internet.

---

## Concept: Python Virtual Environments

**What it is:** An isolated Python installation for one project. Dependencies (packages) installed in a virtual environment do not affect other projects or the system Python.

**Why this matters:** If Project A requires `fastapi==0.100` and Project B requires `fastapi==0.80`, they cannot coexist in the same Python installation. Virtual environments solve this by giving each project its own isolated package directory.

**Commands:**

```bash
# Create a virtual environment in a folder called "venv"
python -m venv venv

# Activate it (Windows PowerShell)
venv\Scripts\activate

# Activate it (Mac/Linux)
source venv/bin/activate

# When active, your terminal prompt shows (venv)
# pip install now installs into venv, not globally
```

**You will see this again in:** Every Python project. The virtual environment folder (`venv/`) is always in `.gitignore` — it is regenerated, not committed.

---

## Concept: `async/await` in JavaScript

**What it is:** A syntax for writing code that waits for something (like a network response) without freezing the browser.

**The problem — synchronous blocking:**

```js
// WRONG — this is how you might THINK fetch works
const response = fetch('http://localhost:8000/api/ping');
// Code stops here, waiting for the response
// The browser cannot scroll, animate, or respond to clicks
// This would freeze the UI for the duration of the network round-trip
```

JavaScript does not actually work this way — `fetch` returns a Promise, not the data directly. But if it DID work synchronously, the browser would freeze.

**The solution — async/await:**

```js
// CORRECT — non-blocking
async function checkServer() {
  // fetch starts the request and immediately returns a Promise
  // The browser remains responsive during the wait
  const response = await fetch('http://localhost:8000/api/ping');
  
  // When the response arrives, execution resumes here
  // The browser was free to do other things while waiting
  const data = await response.json();  // parse JSON from response body
  
  console.log(data.message);  // "pong"
}
```

`await` means: "start this, come back here when it's done, but let other things run in between."
`async` means: "this function contains `await` and therefore returns a Promise."

**You will see this again in:** Every API call in the app. `useEffect` with data fetching (Lab 16), form submissions (Lab 17), auth (Labs 20–24). `async/await` is the standard way to handle all network communication in modern JavaScript.

---

## Concept: CORS

**What it is:** Cross-Origin Resource Sharing. A browser security policy that blocks JavaScript on one domain from reading responses from a different domain — unless the server explicitly allows it.

**The problem:**

The frontend runs on `http://localhost:5173` (Vite's dev server).
The backend runs on `http://localhost:8000` (FastAPI server).

These are different "origins" (different port = different origin). The browser will refuse to let JavaScript at port 5173 read responses from port 8000 unless port 8000 says "I allow requests from port 5173."

**Why this security policy exists:**

Without CORS, malicious code on `evil.com` could make requests to `bank.com` on your behalf, read the responses, and steal your data. CORS prevents this by requiring servers to explicitly list which origins they trust.

**The FastAPI fix:**

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:5173"],  # trust Vite's dev server
  allow_methods=["*"],
  allow_headers=["*"],
)
```

In production, `allow_origins` would list the actual production domain, not localhost.

**You will see this again in:** Every backend in this project. CORS must be configured on every server that serves a web frontend. Getting a CORS error is one of the most common beginner mistakes in full-stack development — now you know exactly what it means and how to fix it.

---

## Step 1 — Set up the backend directory

Create a `backend/` folder at the root of your project (next to `src/` and `flowbard/`).

From your terminal (in the flowboard-masterclass directory, or from your project root):

```powershell
mkdir flowboard-masterclass\backend
cd flowboard-masterclass\backend
```

Or create it in VS Code Explorer manually.

---

## Step 2 — Create a Python virtual environment

In the `backend/` directory:

```powershell
# Create a virtual environment
python -m venv venv

# Activate it (Windows PowerShell)
venv\Scripts\activate

# Your prompt should now show (venv) prefix
```

If `python` is not found, try `python3`. If neither works, install Python from python.org.

---

## Step 3 — Install FastAPI and Uvicorn

```powershell
# With venv active:
pip install fastapi uvicorn[standard]
```

- `fastapi` — the web framework
- `uvicorn` — the ASGI server that runs FastAPI (like Vite for Python)
- `[standard]` — includes WebSocket support and performance extras

Save the dependencies to a `requirements.txt` file so others (and future you) can reinstall them:

```powershell
pip freeze > requirements.txt
```

---

## Step 4 — Create the FastAPI app

Create `backend/main.py`:

```python
# backend/main.py
# The FlowBoard backend API.
# Run with: uvicorn main:app --reload

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create the FastAPI application instance
app = FastAPI(title="FlowBoard API", version="0.1.0")

# Configure CORS — allow the Vite dev server to make requests to this server.
# Without this, the browser blocks all requests from port 5173 to port 8000.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server origin
    allow_credentials=True,
    allow_methods=["*"],   # allow GET, POST, PUT, DELETE, PATCH, OPTIONS
    allow_headers=["*"],   # allow all headers
)


# The /api/ping endpoint — a simple health check.
# GET /api/ping returns {"message": "pong"} with status 200.
@app.get("/api/ping")
async def ping():
    return {"message": "pong"}
```

`@app.get("/api/ping")` is a Python decorator. It tells FastAPI: "when someone makes a GET request to /api/ping, call the `ping` function and return its result as JSON."

---

## Step 5 — Start the backend server

```powershell
# In the backend/ directory, with venv active:
uvicorn main:app --reload
```

- `main` — the Python file (`main.py`)
- `app` — the variable name inside that file
- `--reload` — restart on file save (like Vite's HMR)

**You should see:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

### SAVE AND TRY

Open a browser tab at `http://localhost:8000/api/ping`.

**You should see:** `{"message":"pong"}` displayed as JSON in the browser.

Also visit `http://localhost:8000/docs` — FastAPI auto-generates interactive API documentation (Swagger UI) from your code. Every route you add appears here automatically.

---

## Step 6 — Fetch the ping from the React frontend

Now wire the React frontend to call the backend. Add a status indicator to the `app-header` that shows "Server: online" or "Server: offline".

Update `App.tsx`:

```tsx
// App.tsx — add server status

import { useState, useEffect } from 'react';

// Inside App function, add:
const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

useEffect(() => {
  // Check server health on mount
  async function checkServer() {
    try {
      const response = await fetch('http://localhost:8000/api/ping');
      if (response.ok) {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch {
      // fetch throws if the server is unreachable (network error, server down)
      setServerStatus('offline');
    }
  }

  checkServer();
}, []); // Empty dependency array — run once on mount
```

Add the status indicator to the header JSX:

```tsx
<header className="app-header">
  <span className="app-name">FlowBoard</span>
  <span className="board-title-text">{activeBoard.title}</span>
  
  {/* Server status indicator */}
  <span className={`server-status server-status--${serverStatus}`}>
    {serverStatus === 'checking' ? '⋯ checking' : serverStatus === 'online' ? '● online' : '○ offline'}
  </span>
  
  {isDev && <button className="dev-reset-btn" onClick={handleReset}>Reset</button>}
</header>
```

Add styles in `App.css`:

```css
.server-status {
  font-size: 12px;
  margin-left: 12px;
}

.server-status--online { color: #68d391; }
.server-status--offline { color: #fc8181; }
.server-status--checking { color: rgba(255,255,255,0.5); }
```

### SAVE AND TRY

Save. With the backend running, the header shows "● online".

**Test offline behavior:** Stop the backend server (Ctrl+C in the terminal). Refresh the page. The header shows "○ offline" after a brief "⋯ checking" state.

Restart the backend. Refresh again — "● online" returns.

---

## 🎯 Challenge: Show the backend version in the status indicator

**You know:** FastAPI routes, the `fetch` API, `async/await`, React state

**Task:** The `/api/ping` endpoint currently returns `{"message": "pong"}`. Add a `version` field to the response: `{"message": "pong", "version": "0.1.0"}`. Update the frontend to display the version number next to the status: "● online v0.1.0".

**Hints:**
- In Python, the function returns a dict — add a key: `return {"message": "pong", "version": "0.1.0"}`
- In the frontend, `data.version` after parsing the JSON response
- Update the state type: `{ status: 'online' | 'offline' | 'checking', version: string }`

---

<details>
<summary>▶ Show Solution</summary>

In `backend/main.py`:
```python
@app.get("/api/ping")
async def ping():
    return {"message": "pong", "version": "0.1.0"}
```

In `App.tsx`:
```tsx
// Update state type
type ServerStatus = { status: 'checking' | 'online' | 'offline'; version: string };
const [serverStatus, setServerStatus] = useState<ServerStatus>({ status: 'checking', version: '' });

// Update checkServer:
async function checkServer() {
  try {
    const response = await fetch('http://localhost:8000/api/ping');
    if (response.ok) {
      const data = await response.json();
      setServerStatus({ status: 'online', version: data.version ?? '' });
    } else {
      setServerStatus({ status: 'offline', version: '' });
    }
  } catch {
    setServerStatus({ status: 'offline', version: '' });
  }
}

// Updated display:
{serverStatus.status === 'online'
  ? `● online ${serverStatus.version}`
  : serverStatus.status === 'offline'
  ? '○ offline'
  : '⋯ checking'}
```

**Key insight:** The frontend and backend are now coupled by a contract: the response shape `{"message": ..., "version": ...}`. If the backend changes this shape without updating the frontend, the frontend breaks silently (version would be `undefined`). In Lab 16, you will formalize this contract with TypeScript types that represent the expected API response shapes — making the coupling explicit and detectable by the compiler.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| `backend/` directory exists | VS Code Explorer |
| `backend/main.py` exists with CORS configured | Check the file |
| `backend/requirements.txt` exists | `pip freeze > requirements.txt` was run |
| `http://localhost:8000/api/ping` returns JSON | Open in browser — see `{"message":"pong"}` |
| FastAPI docs accessible | Open `http://localhost:8000/docs` |
| Frontend shows "● online" when backend is running | Check header indicator |
| Frontend shows "○ offline" when backend is stopped | Stop server — header updates |
| `useEffect` runs on mount only (empty deps) | Check the dependency array `[]` |
| CORS middleware configured for `localhost:5173` | Check main.py |
| No TypeScript errors | Problems panel clean |

---

## Quick Check Answers

**1. What data is lost if another person opens the app on a different computer?**

Everything — all boards, lists, and cards. `localStorage` is per-browser, per-origin. It stores data in the user's browser on their machine. A second person on a different machine has their own empty `localStorage`. This is why a server and database are needed: the server is a shared store that multiple users and devices can read from and write to.

**2. What does `fetch('http://localhost:8000/api/ping')` do?**

It makes an HTTP GET request to port 8000 on `localhost` (the same machine), asking for the resource at path `/api/ping`. `localhost` is a special hostname that always means "this computer." Port 8000 is where the FastAPI server is listening. The browser sends the request to the server, the server processes it, and returns a response. `fetch` returns a Promise that resolves with the response object.

**3. Why is `async/await` necessary for network requests?**

Network requests take time — milliseconds to seconds. JavaScript runs on a single thread. If the code blocked (waited synchronously) for a response, no other JavaScript could run during that time — no UI updates, no event handling, no animations. The browser would appear frozen. `async/await` (and the underlying Promise mechanism) allows JavaScript to start the request, immediately return to the event loop to process other work, and resume the `checkServer` function when the response arrives. The illusion is that the code is sequential, but the reality is that the browser stays responsive during the wait.

---

## Next Lab

In **LAB-16**, you will move board data from `localStorage` to the backend. The server will store boards in memory (for now), serve them via a GET endpoint, and accept new boards via POST. The frontend's `useBoardState` hook will fetch from the server on mount and send updates on every change.
