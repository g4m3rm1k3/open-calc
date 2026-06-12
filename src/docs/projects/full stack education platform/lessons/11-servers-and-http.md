# Lesson 11 — Servers and HTTP From First Principles

## What You Will Build

A Node.js + Express server with one route: `GET /api/health` returns
`{ "status": "ok" }`. Your app fetches it and displays the server status on screen.
This lesson is the entire client-server foundation. Everything that follows — lesson
data, user accounts, progress tracking — builds on this single working request/response.

---

## What You Need to Know First

- Lesson 01: Node.js, npm, the terminal, `package.json`

---

## The Lesson

### Step 1 — The Client-Server Model

Two programs communicate over a network:
- **The client** makes requests — asks for data or asks for an action to be performed
- **The server** receives requests and sends responses

Your React app is the client. The Express server you are building is the server.

The client and server are separate programs, running independently, communicating over
a defined interface. The client does not know how the server stores data. The server does
not know how the client displays it. This is **separation of concerns** at the system level.

**Why have a server at all?** The client (your app) runs in the user's browser. It cannot
safely store passwords — the browser is a public device. It cannot persist data — closing
the tab loses everything. It cannot trust itself — a user can open DevTools and modify
any JavaScript variable. The server runs in an environment you control, with your rules.

### Step 2 — HTTP

**HTTP** (HyperText Transfer Protocol) is a text-based request/response protocol. Every
interaction between your app and your server is an HTTP exchange.

**A request has four parts:**
1. **Method** — what action to perform: `GET` (read), `POST` (create), `PUT` (replace),
   `PATCH` (update), `DELETE` (remove)
2. **Path** — which resource: `/api/health`, `/api/lessons`, `/api/users/42`
3. **Headers** — metadata: `Content-Type: application/json`, `Authorization: Bearer ...`
4. **Body** (optional) — data sent with the request (for `POST`/`PUT`/`PATCH`)

**A response has three parts:**
1. **Status code** — what happened:
   - `200 OK` — success
   - `201 Created` — resource created successfully
   - `400 Bad Request` — the client sent bad data (your fault)
   - `401 Unauthorized` — authentication required
   - `403 Forbidden` — authenticated but not permitted
   - `404 Not Found` — the resource does not exist
   - `500 Internal Server Error` — the server crashed (server's fault)
2. **Headers** — `Content-Type: application/json`
3. **Body** — the response data, usually JSON

**Status code categories:** 2xx = success, 3xx = redirect, 4xx = client error, 5xx = server error.
The category tells you who is at fault and what to do: 4xx means fix your request, 5xx
means the server is broken.

**JSON:** JavaScript Object Notation — a text format for structured data. JSON can
represent: strings, numbers, booleans, null, objects (key-value pairs), and arrays.
JSON cannot represent: functions, undefined, dates (represented as strings), circular
references. JSON is the standard data format for web APIs because every language can
parse and generate it.

### Step 3 — TCP/IP (the layer beneath HTTP)

HTTP runs over **TCP** (Transmission Control Protocol). TCP is the protocol that guarantees:
- Delivery (every byte arrives, or the connection fails with an error)
- Order (bytes arrive in the order they were sent)
- Error detection (corrupted data is detected and retransmitted)

**IP** (Internet Protocol) routes data between machines — it figures out the path from
your computer to the server. An **IP address** (`192.168.1.1`, `8.8.8.8`) is a number
that identifies a machine on the network.

When you connect to `localhost:3000`:
- `localhost` is resolved to `127.0.0.1` (the loopback IP — your own machine)
- `:3000` is the port (TCP routes the connection to the program listening on port 3000)
- TCP establishes a connection, HTTP sends the request over it

You do not need to understand TCP deeply — Express handles it. But you need to know it
exists, so that "why does the server need a port?" has an answer: TCP needs a port to
route connections to the right program.

### Step 4 — Setting Up the Server

Create a `server/` directory at the project root:

```bash
$ mkdir server
$ cd server
$ npm init -y
```

`npm init -y` creates a `package.json` in the `server/` directory with defaults
(`-y` accepts all defaults without asking). The server has its own `package.json`
because it is a separate Node.js program with its own dependencies.

**Install Express:**
```bash
$ npm install express
$ npm install --save-dev typescript @types/node @types/express tsx
```

- `express` — the HTTP framework (production dependency)
- `typescript` — the TypeScript compiler (dev: the server ships compiled JavaScript)
- `@types/node` — TypeScript type definitions for Node.js built-ins (`fs`, `path`,
  `process`, etc.)
- `@types/express` — TypeScript type definitions for Express
- `tsx` — runs TypeScript files directly without a separate compile step (dev: for
  `npm run dev`, not production)

**`@types/` packages explained:** TypeScript needs to know the types of every function
you call. For packages written in JavaScript (like Express), TypeScript types are
published separately as `@types/express`. These are type-only packages — no runtime
code, just declarations. They go in `devDependencies` because they are not needed at
runtime.

**`server/tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true
  }
}
```

`"module": "commonjs"` — Node.js historically uses CommonJS (`require/module.exports`).
`"esModuleInterop": true` — allows `import express from 'express'` syntax even though
Express exports using CommonJS. Without it, you must write `import * as express from 'express'`.

### Step 5 — The First Route

Create `server/src/index.ts`:

```typescript
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env['PORT'] ?? 3000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
```

**`import express from 'express'` explained:**
`express` is the default export of the `express` package. Calling it as a function
(`express()`) creates a new Express application — an object with methods for defining
routes and middleware.

**`const app = express()` — what `app` is:**
`app` is an Express application. It is a function (it can be passed to Node.js's
`http.createServer`) but also an object with methods:
- `app.get(path, handler)` — define a GET route
- `app.post(path, handler)` — define a POST route
- `app.use(middleware)` — add middleware (runs on every request)
- `app.listen(port, callback)` — start the server

**`process.env['PORT'] ?? 3000`:**
`process.env` is an object holding all environment variables set in the shell. `PORT` is
a conventional environment variable for the port number. On hosting platforms like Railway
and Heroku, the platform sets `PORT` automatically. The `?? 3000` fallback is for local
development when `PORT` is not set.

**Install `cors`:**
```bash
$ npm install cors
$ npm install --save-dev @types/cors
```

**What CORS is:** **Cross-Origin Resource Sharing** — a browser security mechanism.
When your React app at `localhost:8081` makes a request to your server at `localhost:3000`,
the browser blocks it by default. The two have different ports, making them different
origins. The browser does this to prevent malicious websites from making requests to
your bank's API using your login cookies.

CORS headers tell the browser which origins are permitted to make requests. `cors()`
middleware adds these headers to every response:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
```

`Access-Control-Allow-Origin: *` means "any origin can make requests." For production,
you restrict this to your app's specific origin: `cors({ origin: 'https://codex-edu.com' })`.

**`app.use(express.json())`:** This middleware parses the JSON body of incoming requests.
Without it, `req.body` is `undefined` even when the client sends JSON. The middleware
reads the raw bytes, parses the JSON string, and sets `req.body` to the parsed object.

**`app.get('/api/health', (_req, res) => { ... })`:**
`app.get` registers a handler for `GET /api/health`. When a request matches, Express calls
the handler function with:
- `_req` — the request object (prefixed with `_` to signal: we do not use this here)
- `res` — the response object — methods: `.status(code)`, `.json(object)`, `.send(text)`

`res.status(200).json({ status: 'ok' })` chains two method calls: set status to 200,
then send JSON. The response is sent once `json()` is called.

### Step 6 — Middleware

**What middleware is:** A function that runs on every request before the route handler.
Middleware has the signature `(req, res, next) => void`. After doing its work, it calls
`next()` to pass control to the next middleware or route handler.

```
Request arrives
    ↓
cors() middleware (adds CORS headers)
    ↓
express.json() middleware (parses JSON body)
    ↓
Route handler (handles the specific route)
    ↓
Response sent
```

This is the **middleware chain** — a **pipeline** pattern. Each middleware does one thing
and passes to the next. If a middleware does not call `next()`, the chain stops and the
response must be sent there.

**SE lens — the chain of responsibility pattern:** The middleware chain is an instance
of the **chain of responsibility** design pattern: a request passes through a sequence
of handlers; each handler either processes the request or passes it along. Handlers are
composable and reorderable.

### Step 7 — Running and Testing the Server

**Add a dev script to `server/package.json`:**
```json
"scripts": {
  "dev": "tsx watch src/index.ts"
}
```

`tsx watch` runs the TypeScript file directly and restarts when any file changes.
Like `nodemon` but built into `tsx`.

**Start the server:**
```bash
$ npm run dev
Server running on http://localhost:3000
```

**Test with curl:**
```bash
$ curl http://localhost:3000/api/health
{"status":"ok","timestamp":"2024-01-15T10:00:00.000Z"}
```

`curl` is a command-line HTTP client. `curl URL` sends a GET request to that URL and
prints the response body. Every flag:
- No flags: GET request, print body to stdout
- `-X POST`: change the method
- `-H "Content-Type: application/json"`: add a header
- `-d '{"key":"value"}'`: send a request body

**Fetching from the app:** In `App.tsx`:

```typescript
import { useEffect, useState } from 'react'

function useHealthCheck() {
  const [status, setStatus] = useState<string>('checking...')

  useEffect(() => {
    fetch('http://localhost:3000/api/health')
      .then(response => response.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus('offline'))
  }, [])

  return status
}
```

`fetch` is a browser API for making HTTP requests. It returns a Promise. `.then(response => response.json())`
parses the JSON body (also a Promise). The chain: `fetch` → `response.json()` → `setStatus`.

---

## Connect the Pieces

`GET /api/health` is the simplest possible API route. In Lesson 12, you will add
`GET /api/lessons` to fetch real data. In Lesson 14, you will build the full CRUD API.
In Lesson 17, you will add `POST /api/auth/login`. Each route follows the same pattern:
method + path + handler.

The CORS configuration established here (`cors()` middleware) will need to be tightened
in Lesson 31 (deployment): restrict `Access-Control-Allow-Origin` to your production
domain so that arbitrary websites cannot make authenticated requests to your API.

The middleware pipeline pattern appears again in Lesson 15 (error handling: a global
error middleware catches unhandled errors) and Lesson 18 (authorization: auth middleware
runs before route handlers).

---

## What Breaks Without This

Without `cors()` middleware, the browser blocks every request from the React app
with the error: `Access to fetch at 'http://localhost:3000/api/health' from origin
'http://localhost:8081' has been blocked by CORS policy`. The request never reaches
the server. The fix is one line of middleware.

Without `express.json()`, `req.body` is `undefined` for POST requests. The first
`POST /api/lessons` in Lesson 14 fails silently — the lesson is created with `undefined`
fields in the database.

---

## Definition of Done

- [ ] `npm run dev` in the `server/` directory starts the server at `localhost:3000`
- [ ] `curl http://localhost:3000/api/health` returns `{"status":"ok",...}`
- [ ] The app fetches the health endpoint and shows "ok" (or "offline" if the server is not running)
- [ ] You can answer: what is the difference between a 400 and a 500 status code?
- [ ] You can answer: what is CORS and why does the browser block cross-origin requests without it?
- [ ] You can answer: what does middleware do and what happens if middleware does not call `next()`?
- [ ] You can answer: what is `process.env` and why is the port configured there?
- [ ] `git commit` with a message explaining why — "Add Express server with health check endpoint — establishes client-server boundary"
