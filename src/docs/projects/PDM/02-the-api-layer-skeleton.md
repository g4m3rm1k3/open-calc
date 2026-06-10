# Vault PDM — Lesson 02 — The API Layer Skeleton

## What You Will Build

The Express HTTP server starts inside the Electron main process. The renderer makes a
`fetch` request to `/api/health` and displays "API: connected" in the status bar.
For the first time, the two Electron processes communicate — the renderer (browser)
talks to the API layer (Node.js) over HTTP. The layered architecture has two working
layers.

## What You Need to Know First

Lesson 01. The four-layer folder structure, the main process, and the renderer process
are in place. This lesson adds the API layer — the Express server that sits between
the renderer and the domain/data layers.

---

## The Problem

The renderer process is sandboxed — it cannot directly access business logic, the
database, or external APIs. It needs a controlled channel for making requests. The API
layer is that channel: an HTTP server that the renderer calls with `fetch`, just as a
web browser calls a web server.

This design has two consequences:

1. **All requests are explicit.** The renderer cannot accidentally touch the database —
   it must go through a named API endpoint. Every operation has a name, a method, and
   a response contract.

2. **The API layer is the only entry point to the system's logic.** A bug, a security
   check, or a logging statement added to the API layer applies to every operation
   that passes through it.

---

## Step 1 — What HTTP Is

### The problem

The renderer and the API layer communicate via HTTP. HTTP is the protocol of the web —
it needs to be understood precisely, not just used.

**HTTP — first appearance:**
**HTTP (Hypertext Transfer Protocol)** is a request/response protocol. A **client**
sends a request to a **server**; the server sends back a response.

Every HTTP request has:
- A **method** — the action being requested:
  - `GET`: retrieve data (no side effects)
  - `POST`: submit data (creates or changes something)
  - `PUT`: replace an existing resource
  - `PATCH`: partially update an existing resource
  - `DELETE`: remove a resource
- A **URL** — where the request is directed (`http://localhost:3001/api/health`)
- **Headers** — metadata about the request (content type, authorisation token, etc.)
- A **body** — optional data payload (used with POST, PUT, PATCH)

Every HTTP response has:
- A **status code** — a three-digit number indicating what happened:
  - `2xx` — success: `200 OK`, `201 Created`, `204 No Content`
  - `3xx` — redirection: `301 Moved Permanently`, `304 Not Modified`
  - `4xx` — client error: `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`
  - `5xx` — server error: `500 Internal Server Error`, `503 Service Unavailable`
- **Headers** — metadata about the response
- A **body** — the response data (JSON, HTML, binary, etc.)

**Why HTTP for same-machine communication:**
The main process and renderer process are on the same machine. They could communicate
via IPC (introduced in lesson 19). HTTP is used here for a different reason: the API
layer must eventually be callable from outside the app — from tests, from the command
line, from future clients. If it only spoke IPC, it would be locked to Electron. An
HTTP server can be called by anything that can send HTTP requests.

---

## Step 2 — What Express Is

**Express — first appearance:**
Express is a minimal Node.js framework for building HTTP servers. It provides:
- **Route registration** — `app.get('/path', handler)` maps a URL to a function
- **Middleware** — functions that run before the route handler (logging, auth checks,
  body parsing)
- **Request and response objects** — `req` and `res` with helper methods

Express does not handle: authentication, database connections, business rules,
or file serving by default. It is deliberately minimal — it handles HTTP, and
everything else is your job.

**Why Express and not the built-in Node.js `http` module:**
Node.js's `http` module can build an HTTP server, but it requires manually parsing
URLs, manually routing requests, and manually setting response headers. Express
abstracts these into a readable, composable API. For a learning project, Express's
readability is more valuable than the marginal overhead of the abstraction.

Install Express and its TypeScript types (already in `package.json` from lesson 01):
```
npm install
```
This installs everything from `package.json`, including Express. No additional install
needed.

---

## Step 3 — The Express Server

### Create `src/api/server.ts`

```typescript
import express from 'express'

const app = express()

app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export { app }
```

**`express()` — first appearance:**
`express()` creates an Express application object. The `app` object has methods for
registering routes (`app.get`, `app.post`, etc.), adding middleware (`app.use`), and
starting the server (`app.listen`). The `app` object itself does nothing until routes
are registered and it starts listening.

**`app.use(express.json())` — first appearance:**
`app.use(middleware)` registers a **middleware** function that runs before every route
handler. `express.json()` is a built-in middleware that reads the HTTP request body,
parses it from JSON text to a JavaScript object, and places the result in `req.body`.
Without it, `req.body` is always `undefined` — POST requests that send JSON data
would arrive with no body.

**Middleware — first appearance:**
A **middleware** function is a function that runs between receiving a request and
sending a response. It has the signature `(request, response, next) => void`. Calling
`next()` passes control to the next middleware or route handler. Not calling `next()`
ends the chain — useful for authentication middleware that rejects unauthenticated
requests. Middleware is the Express mechanism for cross-cutting concerns: logging,
authentication, body parsing, CORS headers.

**`app.get('/api/health', handler)` — route registration:**
`app.get(path, handler)` registers a route that responds to `GET` requests at `path`.
The handler receives a `request` object and a `response` object:

- `request` (conventionally `req`) — the incoming request. Contains headers, URL
  parameters, query string, and body.
- `response` (conventionally `res`) — the outgoing response. Has methods like
  `res.json(data)` (sends data as JSON with `Content-Type: application/json`) and
  `res.status(code)` (sets the status code).

The underscore prefix `_request` is TypeScript convention for a parameter that is
declared but not used. Without it, TypeScript would produce "unused parameter" error
if `"noUnusedParameters": true` is set in `tsconfig.json`. The underscore is not
a language feature — it is a convention that communicates "this parameter must be
declared for the function signature but is not needed here."

**`response.json(...)` — what it sends:**
`res.json(obj)` serialises `obj` to a JSON string and sends it as the response body,
with `Content-Type: application/json` in the response headers. The client receives
a valid JSON string that it can parse.

**Why `export { app }` rather than starting the server here:**
`server.ts` creates and configures the Express app but does not call `app.listen()`.
Starting the server (choosing a port and binding to it) is the responsibility of the
main process. Separating creation from starting enables tests to import `app` and
make requests without starting a real server on a real port — standard practice in
Express testing.

---

## Step 4 — Starting the Server in the Main Process

### Update `src/main/main.ts`

```typescript
import { app, BrowserWindow }   from 'electron'
import path                      from 'path'
import { app as expressApp }     from '../api/server.js'

const API_PORT = 3001

expressApp.listen(API_PORT, '127.0.0.1', () => {
  console.log(`Vault API listening on http://127.0.0.1:${API_PORT}`)
})

function createWindow(): void {
  // ... (unchanged from lesson 01)
}

app.whenReady().then(() => {
  createWindow()
  // ...
})
```

**`import { app as expressApp }` — rename on import:**
Both the Electron module and the Express module export a value named `app`. Importing
both as `app` would cause a name collision. The `import { app as expressApp }` syntax
renames the Express `app` to `expressApp` in this file. The `as` keyword in import
statements is the standard way to resolve name collisions or to give an import a more
descriptive name in context.

**`expressApp.listen(port, host, callback)` — first appearance:**
`.listen(port, host, callback)` starts the HTTP server:
- `port: 3001` — the TCP port the server listens on
- `host: '127.0.0.1'` — the network address to bind to
- `callback` — a function called when the server is ready

**Port — first appearance (in this project):**
A **port** is a 16-bit number (0–65535) that routes a network connection to a specific
program on a machine. Port 80 is HTTP. Port 443 is HTTPS. Port 5432 is PostgreSQL.
We use 3001 for the Vault API because:
- Ports below 1024 require OS administrator privileges (avoid them for development)
- Port 3000 and 3001 are common development choices
- Vite uses port 5173 (from lesson 01), so 3001 avoids conflict

**`'127.0.0.1'` — why not `'0.0.0.0'`:**
`'127.0.0.1'` is the **loopback address** — it only accepts connections from the
same machine. `'0.0.0.0'` binds to all network interfaces — any device on the
network can connect.

**Security lens — binding to loopback:**
The Vault API has no authentication layer yet (that comes in phase 2). If it bound to
`0.0.0.0`, anyone on the same Wi-Fi network could call `/api/health` — and eventually
`/api/files/:id/checkout`, with any user ID they fabricated. Binding to `127.0.0.1`
limits the attack surface to the local machine. The renderer process is on the same
machine, so it can still reach the API. Nobody else can.

---

## Step 5 — The Fetch Call in the Renderer

### The problem

The renderer must call the API and display the response. This requires two React
hooks: `useState` and `useEffect`.

**React `useState` — first appearance in this project:**
`useState` is a React hook that adds state to a function component. State is data
that, when changed, causes the component to re-render.

```typescript
const [value, setValue] = useState(initialValue)
```

- `value` — the current state value
- `setValue` — a function that updates the state and schedules a re-render
- `initialValue` — the state at first render

**React `useEffect` — first appearance:**
`useEffect` is a React hook for side effects — operations that happen outside of
rendering, such as:
- Fetching data from an API
- Setting up a timer
- Subscribing to events

```typescript
useEffect(() => {
  // side effect here
  return () => { /* cleanup here */ }
}, [dependencies])
```

The second argument `[dependencies]` controls when the effect runs:
- `[]` — run once after the first render (on mount). Use for one-time setup like
  initial data fetches.
- `[value1, value2]` — run after the first render AND whenever `value1` or `value2`
  changes.
- No second argument — run after every render. Almost never correct.

**The cleanup function:**
The optional return from `useEffect` is a cleanup function. It runs when the
component unmounts (is removed from the DOM) or before the effect runs again. For
fetch calls, this prevents state updates on unmounted components — a common source
of React warnings.

### Update `src/renderer/App.tsx`

```typescript
import { useState, useEffect } from 'react'
import './App.css'

type ApiStatus = 'connecting' | 'connected' | 'error'

export default function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('connecting')

  useEffect(() => {
    let cancelled = false

    fetch('http://localhost:3001/api/health')
      .then((response) => response.json())
      .then((data: { status: string }) => {
        if (!cancelled) {
          setApiStatus(data.status === 'ok' ? 'connected' : 'error')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setApiStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const statusText = {
    connecting: 'Connecting to API...',
    connected:  'API: connected',
    error:      'API: connection failed',
  }[apiStatus]

  return (
    <div className="app-shell">
      <header className="toolbar">
        <span className="app-name">Vault</span>
      </header>
      <main className="content">
        <div className="file-row">
          <span className="file-name">housing-v3.step</span>
          <span className="badge badge--checked-in">Checked In</span>
        </div>
      </main>
      <footer className="status-bar">
        <span
          className={`status-indicator status-indicator--${apiStatus}`}
        >
          {statusText}
        </span>
      </footer>
    </div>
  )
}
```

**`type ApiStatus = 'connecting' | 'connected' | 'error'`:**
A union type that restricts `apiStatus` to exactly three possible values. The status
bar text object `statusText` uses `apiStatus` as a key — TypeScript verifies that
every possible value of `ApiStatus` has a corresponding key in the object. If we add
`'timeout'` to `ApiStatus` later and forget to add it to `statusText`, TypeScript
reports an error at compile time, not at runtime.

**`let cancelled = false` — the cancellation pattern:**
`useEffect` cleanup prevents stale state updates. If the component unmounts (the user
navigates away) before `fetch` completes, `setApiStatus` would update state on an
unmounted component — React logs a warning. The `cancelled` flag, set to `true` in
the cleanup, prevents the `.then` callbacks from calling `setState` after unmount.
This is idiomatic React for fetch-in-effect.

**`.then(response => response.json()).then(data => ...)` — chained Promises:**
`fetch(url)` returns a Promise that resolves with a `Response` object. `response.json()`
is another Promise — parsing the JSON body is asynchronous. Chaining `.then()` calls
handles the two-step process: wait for the response, then wait for the JSON parse.
Each `.then(fn)` returns a new Promise that resolves with the return value of `fn`.
`.catch(fn)` handles any rejection in the chain — network errors, invalid JSON, etc.

**`statusText` object lookup:**
`statusText = { connecting: '...', connected: '...', error: '...' }[apiStatus]`
is a **lookup table** — a JavaScript object used as a map from state to display text.
This is more readable than a chain of if/else conditions and ensures every state value
has exactly one corresponding text. TypeScript validates the completeness.

Add to `App.css`:

```css
.status-indicator--connecting { color: var(--colour-text-muted); }
.status-indicator--connected   { color: var(--colour-checked-in); }
.status-indicator--error       { color: var(--colour-error); }
```

---

## Step 6 — CORS (Cross-Origin Resource Sharing)

### The problem

When the renderer process (running at `http://localhost:5173` in development) fetches
from the API server (`http://localhost:3001`), the browser's same-origin policy blocks
the request. The origins differ (different ports = different origins).

**CORS — first appearance:**
**CORS (Cross-Origin Resource Sharing)** is a browser security mechanism. The
**same-origin policy** prevents scripts on page A from reading responses from server B
unless B explicitly allows it. Two URLs have the same origin if they have the same
scheme, host, AND port. `localhost:5173` and `localhost:3001` differ in port —
different origins.

The browser blocks the fetch and shows an error:
```
Access to fetch at 'http://localhost:3001/api/health' from origin
'http://localhost:5173' has been blocked by CORS policy.
```

**The fix — CORS headers:**
The Express server must include `Access-Control-Allow-Origin` headers that tell the
browser "this origin is allowed to read my responses."

Install the `cors` package:
```json
"cors": "^2.8.5",
"@types/cors": "^2.8.17"
```

Update `src/api/server.ts`:

```typescript
import express from 'express'
import cors    from 'cors'

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export { app }
```

**`cors({ origin: 'http://localhost:5173' })` — not `origin: '*'`:**
`origin: '*'` allows any origin — including malicious websites — to read API
responses. In development, we restrict to the Vite dev server origin. In production
(packaged Electron), the renderer loads from a local file (`file://...`), not from
`localhost:5173`, so CORS is less relevant — but the restriction is still correct
practice.

**Why CORS applies even on localhost:**
CORS is a browser policy. It applies whenever a browser makes a cross-origin request,
regardless of whether the target is local or remote. The Electron renderer is a browser
(Chromium). It enforces CORS just like Chrome or Firefox does.

---

## Connect the Pieces

The full health-check path:

```
User launches app
  ──► main.ts calls expressApp.listen(3001, '127.0.0.1')
  ──► BrowserWindow loads Vite dev server (localhost:5173)
  ──► App.tsx renders, useEffect fires
  ──► fetch('http://localhost:3001/api/health')
  ──► Express GET /api/health handler
  ──► response.json({ status: 'ok', ... })
  ──► .then(data => setApiStatus('connected'))
  ──► React re-renders status bar with 'API: connected'
```

The renderer never imports Express. The API server never imports React. Each layer
knows only what it needs to know. This path will grow in lesson 03 to include a
database ping.

---

## What Breaks Without This

**Without binding to `'127.0.0.1'`:**
The API binds to all interfaces. Another device on the same Wi-Fi can call
`http://your-machine-ip:3001/api/health`. More critically: after phase 4,
`POST /api/files/:id/checkout` would be reachable from any device. A person
on the same network could check out files without being authenticated — bypassing
every security check the application implements.

**Without the `cancelled` cleanup in `useEffect`:**
If the health check fetch takes longer than the component's lifetime (unlikely for
a health endpoint, very likely for slow API calls later), React will attempt to set
state on an unmounted component. In development (with `StrictMode`), React may render
components twice — making this more likely to occur even for fast responses. React
logs: "Warning: Can't perform a React state update on an unmounted component."
This warning masks real bugs where async operations complete after navigating away.

---

## Definition of Done

- [ ] Express server starts when the Electron app launches (visible in the terminal)
- [ ] "API: connected" appears in the status bar with a green colour
- [ ] If the app is launched without the API running, the status bar shows "API: connection failed" in red
- [ ] You can explain the difference between GET and POST, and when to use each
- [ ] You can explain what Express middleware is and give an example of what `express.json()` does
- [ ] You can explain why the server binds to `127.0.0.1` rather than `0.0.0.0`
- [ ] You can explain `useState` and `useEffect` — what each does and why both are needed for a fetch-on-mount
- [ ] You can explain the `cancelled` cleanup pattern and why it prevents a specific React warning
- [ ] You can explain CORS — what it is, why it triggers here, and how the `cors` middleware fixes it
- [ ] You can explain what HTTP status codes 200, 401, 404, and 500 mean
- [ ] Run:
      ```
      git add src/api/ src/main/ src/renderer/
      git commit -m "Add API layer skeleton: Express server on 127.0.0.1:3001, health endpoint, renderer fetch with useState/useEffect"
      ```

---

*Next: Lesson 03 — PostgreSQL and the Data Layer. The Express server connects to
PostgreSQL. The health endpoint queries the database and returns its version. The UI
shows "API: connected | DB: PostgreSQL 16". Secrets live in `.env`, never in git.*
