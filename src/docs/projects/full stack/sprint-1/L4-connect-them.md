# Sprint 1 · Lesson 4 — Connect them: React fetches from FastAPI

## What you will build

By the end of this lesson, data from your Python server appears in your React browser application. The React app calls `fetch()`, receives JSON from FastAPI, and renders it. You will hit the CORS error that every developer hits on their first cross-origin request, understand exactly why the browser produces it, and fix it correctly. You will read HTTP requests in the browser Network tab, understand Promises and async/await, and understand why `useEffect` exists. This is the moment the two halves of your stack connect.

---

## What you need to know first

- Lesson 2: React app running at `localhost:5173`, `useState` and component rendering understood.
- Lesson 3: FastAPI server running at `localhost:8000`, returning JSON from `GET /`.
- Both servers must be running simultaneously for this lesson. Open two terminal tabs/windows: one running `npm run dev` (from `frontend/`), one running `uvicorn main:app --reload` (from `backend/`).

**Concepts carried forward:** fetch, HTTP request/response cycle, status codes, JSON, ports, localhost, useState, components, JSX.

---

## The lesson

---

### 1. Add a message endpoint to FastAPI

**The problem:** The React app needs something to fetch. The root endpoint (`/`) is fine, but a dedicated endpoint with a clearer name is better practice.

Edit `backend/main.py` to add one route:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "FastAPI is running"}

@app.get("/api/message")
def get_message():
    return {"text": "Hello from Python", "source": "FastAPI"}
```

**Walkthrough:** `@app.get("/api/message")` registers a new route. The path `/api/` prefix is a convention for API routes — it distinguishes them from any static file routes your server might serve. `get_message` returns a dict with two fields: `text` and `source`. FastAPI serialises this to `{"text": "Hello from Python", "source": "FastAPI"}`.

Visit `http://localhost:8000/api/message` to confirm it works before touching React.

**SE lens — verify before integrating.** Before connecting two components, verify each works independently. Testing the endpoint in the browser first means that when the integration fails, you know the problem is in the integration (the fetch call, the CORS headers) — not in the endpoint itself. This habit — build and verify each piece before connecting them — is the engineering discipline behind test-driven development and vertical slice architecture.

---

### 2. Write the fetch call in React

**The problem:** React needs to call `http://localhost:8000/api/message` when the app loads and display the response.

Replace the contents of `frontend/src/App.tsx` with:

```typescript
import { useState, useEffect } from 'react'

interface ApiMessage {
  text: string
  source: string
}

function App() {
  const [message, setMessage] = useState<ApiMessage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://localhost:8000/api/message')
      .then(response => response.json())
      .then(data => {
        setMessage(data)
        setIsLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setIsLoading(false)
      })
  }, [])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Full Stack Connected</h1>
      <p>Message: {message?.text}</p>
      <p>Source: {message?.source}</p>
    </div>
  )
}

export default App
```

Save this file. You will see a CORS error in the browser console before fixing it — that is expected and taught next.

**Walkthrough of every new construct:**

**`interface ApiMessage`** — an interface is a TypeScript type definition for an object shape. `interface ApiMessage { text: string; source: string }` declares: an `ApiMessage` is an object that has a `text` property (a string) and a `source` property (a string). TypeScript uses this to check that wherever `ApiMessage` is used, the object has these fields. The interface exists only at compile time — TypeScript strips it before the browser sees the code.

**`useState<ApiMessage | null>(null)`** — `useState` with a **type parameter**. The `<ApiMessage | null>` between the function name and the `()` is TypeScript's **generic syntax** — you are telling TypeScript what type the state holds. `ApiMessage | null` is a **union type**: the state is either an `ApiMessage` object or `null`. It starts as `null` (no data yet) and becomes an `ApiMessage` once the fetch completes. TypeScript now knows that `message` is `ApiMessage | null` and will warn you if you try to access `message.text` without checking that `message` is not null.

**`useState<string | null>(null)` for `error`** — same pattern. The error is a string (an error message) or `null` (no error).

**`useEffect(() => { ... }, [])` — why you cannot fetch in the component body:**

React calls your component function (`App`) every time it needs to render — on the initial load and every time state changes. If you wrote `fetch(...)` directly inside `App()`, every re-render would fire a new fetch call. State changes trigger re-renders, which would trigger more fetches, which would trigger more state changes — an infinite loop.

`useEffect` is the solution. It accepts two arguments: a function to run, and a **dependency array**. The dependency array `[]` is empty, which means: run this effect exactly once — after the component first renders, and never again. React guarantees: the component renders first (showing `Loading...`), then the effect runs (the fetch fires), then when the fetch completes the state updates, then React re-renders the component with the data.

**`fetch('http://localhost:8000/api/message')`** — `fetch` is a built-in browser function. It sends an HTTP request to the given URL and returns a **Promise**. A Promise is a JavaScript object representing a value that does not exist yet but will in the future. `fetch` returns immediately — it does not wait for the network response. The actual response arrives asynchronously (at some later time) and the Promise resolves with it.

**`.then(response => response.json())`** — `.then` is a Promise method. It registers a callback to run when the Promise resolves. `response` is the HTTP response object. `response.json()` reads the response body and parses it as JSON — it also returns a Promise (because reading the network stream is also asynchronous). The `.then` chain handles each asynchronous step in sequence: first the response arrives, then the body is read and parsed.

**`.then(data => { setMessage(data); setIsLoading(false) })`** — the second `.then` receives the parsed JavaScript object. `setMessage(data)` stores it in state. `setIsLoading(false)` marks loading as complete. Both state updates trigger a React re-render.

**`.catch(err => { setError(err.message); setIsLoading(false) })`** — `.catch` handles any error in the Promise chain — a network failure, a CORS block, a JSON parse error. `err.message` is a string describing the error.

**`if (isLoading) return <div>Loading...</div>`** — early return: if still loading, render a loading message and stop. React's component function can return different JSX based on state — this is **conditional rendering**. The component renders nothing else until loading is false.

**`message?.text`** — the `?.` is the **optional chaining operator**. `message?.text` means: if `message` is null or undefined, return undefined instead of throwing `Cannot read property 'text' of null`. TypeScript enforces this: because `message` is typed as `ApiMessage | null`, you cannot write `message.text` — the compiler requires you to handle the null case.

**CS lens — Promises and asynchronous computation.** JavaScript is single-threaded — only one piece of code runs at a time. If `fetch` waited (blocked) for the network response before returning, the entire browser would freeze — no animations, no keyboard input, nothing — for as long as the network request took. Promises solve this: `fetch` registers a callback for "when the response arrives" and returns immediately. The browser continues running other code. When the network response arrives, the JavaScript event loop picks up the registered callback and runs it. This is the **event loop model** — the same model used by Node.js. Understanding it explains why `await` exists and why you cannot use network results without either `.then` or `await`.

**SE lens — loading/error/data as the three states of async UI.** Every piece of asynchronous data in a UI has exactly three states: loading (the request is in flight), error (the request failed), and data (the request succeeded). The component above models all three with three state variables. This pattern — always model all three states — prevents bugs where you render a partially-loaded UI because you forgot to handle the loading state. In Sprint 2 you will use TanStack Query, which manages all three states automatically. The pattern is the same; the machinery is different.

**What breaks without this:** If you forget the `[]` dependency array in `useEffect`, the effect runs after every render — including renders triggered by `setMessage` and `setIsLoading`. Each of those renders triggers a new fetch, which triggers new state updates, which trigger new renders: infinite loop. The browser tab becomes unresponsive and the network tab shows thousands of requests.

---

### 3. The CORS error — why it happens and how to fix it

**The problem:** After saving `App.tsx`, the browser console shows a red error like:

```
Access to fetch at 'http://localhost:8000/api/message' from origin 'http://localhost:5173'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the
requested resource.
```

This is the CORS error. It will happen to every developer who connects a frontend to a backend for the first time. It is not a bug in your code. It is the browser enforcing a security policy.

**What CORS is:**

CORS stands for Cross-Origin Resource Sharing. An **origin** is the combination of protocol, domain, and port. `http://localhost:5173` and `http://localhost:8000` are different origins — same domain, different ports. The browser's **same-origin policy** says: JavaScript code loaded from one origin cannot read responses from a different origin by default. This is a security measure.

**Why the same-origin policy exists:** Imagine you are logged into your bank at `bank.com`. A malicious website at `evil.com` opens a tab and runs JavaScript that calls `fetch('https://bank.com/account/balance')`. Without the same-origin policy, the browser would send your bank's cookies with the request (because cookies are sent to their domain automatically), your bank would see a valid authenticated request, and the malicious script would receive and read your account balance. The same-origin policy prevents this: the browser refuses to give `evil.com`'s JavaScript access to `bank.com`'s response.

**Why you are hitting it:** Your React app is served from `localhost:5173`. Your FastAPI server is at `localhost:8000`. From the browser's perspective, they are different origins. The browser enforced the policy.

**The fix — CORS headers from FastAPI:**

The same-origin policy allows the server to explicitly grant cross-origin access using HTTP response headers. If FastAPI includes `Access-Control-Allow-Origin: http://localhost:5173` in its response, the browser knows FastAPI has explicitly permitted requests from the React app's origin and allows the JavaScript to read the response.

Edit `backend/main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "FastAPI is running"}

@app.get("/api/message")
def get_message():
    return {"text": "Hello from Python", "source": "FastAPI"}
```

**Walkthrough:**

`from fastapi.middleware.cors import CORSMiddleware` — imports the CORS middleware from FastAPI. **Middleware** is code that runs on every request and response, before the route handler processes the request and after it returns a response. `CORSMiddleware` specifically inspects every request, checks the `Origin` header, and adds the appropriate `Access-Control-Allow-Origin` response header if the origin is in the allow list.

`app.add_middleware(CORSMiddleware, ...)` — registers the middleware with the FastAPI application. Every request now passes through `CORSMiddleware` before reaching your route handlers.

`allow_origins=["http://localhost:5173"]` — the list of origins that are allowed to read responses from this server. In development, this is your Vite dev server. In production (Sprint 8), this will be your actual domain (`https://yourdomain.com`).

`allow_credentials=True` — allows the browser to include cookies and authentication headers in cross-origin requests. You will need this in Sprint 4 when adding authentication.

`allow_methods=["*"]` — allows all HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, etc.). The `*` wildcard means "any method."

`allow_headers=["*"]` — allows all request headers. The `*` wildcard means "any header."

Save the file. uvicorn reloads automatically. Reload the browser. The CORS error is gone. The React app displays "Hello from Python."

**Walkthrough of what the browser does now:** When the React app calls `fetch('http://localhost:8000/api/message')`, the browser first sends a **preflight request** — an HTTP `OPTIONS` request to the same URL. The preflight asks: "FastAPI, will you allow a GET request from `http://localhost:5173`?" FastAPI's CORS middleware responds with headers confirming it will. The browser proceeds with the actual GET request. FastAPI handles the GET, returns the JSON response, and includes the `Access-Control-Allow-Origin` header. The browser confirms the header is present and allows the JavaScript to read the response.

**CS lens — the preflight as a protocol handshake.** The preflight request is a negotiation before the actual request. This pattern — negotiate capabilities before exchanging data — appears throughout networking. TLS handshakes negotiate encryption algorithms. WebSocket connections start with an HTTP upgrade request. The HTTP/2 protocol starts with a connection preface. The preflight is one instance of a general pattern: two parties agree on what they can exchange before exchanging it.

**SE lens — CORS as defense in depth.** CORS is enforced by the browser, not the server. The server has no say in whether the browser enforces CORS — the browser always does. What the server controls is whether it grants cross-origin access via headers. Setting `allow_origins=["*"]` in production (allowing any origin) defeats the protection entirely. Using a specific allowlist — only your application's domain — is correct. The production version of this middleware will use an environment variable for the allowed origin so the same code works in development and production.

**Real-world connection:** Every API that a browser application calls must handle CORS. Stripe's API, GitHub's API, Google Maps — all include CORS headers. When a developer adds a new frontend domain (because the company launched in a new region, or a mobile web app was added), one of the first steps is adding the new origin to the CORS allowlist. Getting this wrong is one of the most common causes of "works on my machine" bugs when a frontend is deployed.

**What breaks without this:** If `allow_origins` does not include the origin making the request, the browser blocks the response. The error is always the same CORS error. If you use `allow_origins=["*"]` in production (the wildcard), any website can read your API's responses — which includes any authenticated data if you also set `allow_credentials=True`. These two settings together (`"*"` and `allow_credentials=True`) are rejected by the browser; FastAPI warns about this combination.

---

### 4. Add async/await — the cleaner syntax for Promises

**The problem:** The `.then().catch()` chain in the fetch call works, but it is harder to read than sequential code. `async/await` is syntax that makes asynchronous code look like synchronous code, while still being non-blocking.

Update the `useEffect` in `App.tsx`:

```typescript
useEffect(() => {
  async function loadMessage() {
    try {
      const response = await fetch('http://localhost:8000/api/message')
      const data: ApiMessage = await response.json()
      setMessage(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  loadMessage()
}, [])
```

**Walkthrough:**

`async function loadMessage()` — the `async` keyword marks a function as asynchronous. An async function always returns a Promise. Inside an async function, you can use `await`.

`await fetch(...)` — `await` pauses the async function until the Promise resolves, then returns the resolved value. `const response = await fetch(...)` waits for the HTTP response and stores it. The key insight: `await` does not block the main thread. While the async function is paused waiting for the network, the browser continues to run other code — it processes user events, runs animations, renders other components. Only this async function pauses; nothing else is frozen.

`const data: ApiMessage = await response.json()` — waits for the body to be read and parsed, then stores the result. The `: ApiMessage` type annotation tells TypeScript to treat `data` as an `ApiMessage` object. TypeScript trusts you here — it cannot verify at compile time that the JSON from the server matches the interface. In Sprint 2 you will add Pydantic on the server side and Zod on the client side to validate this at runtime.

`try { ... } catch (err) { ... } finally { ... }` — the synchronous-style error handling equivalent of `.catch()`. `try` wraps code that might fail. `catch` receives the error if any `await` throws. `finally` runs whether success or failure — used here to set `isLoading` to false in both cases.

`err instanceof Error ? err.message : 'Unknown error'` — `catch` receives the thrown value, but JavaScript allows throwing anything — not just `Error` objects. `err instanceof Error` checks whether it is an `Error` instance. If it is, use `.message`. If not (some code throws a string or object), fall back to a generic message. TypeScript 4.0+ types caught errors as `unknown` rather than `any`, requiring this check.

`loadMessage()` — calls the async function. Notice: you cannot make the `useEffect` callback itself async. `useEffect` expects its callback to return either nothing or a cleanup function. An async function always returns a Promise — which `useEffect` would receive and not know what to do with. The solution is to define an async function inside the effect and call it immediately.

**CS lens — async/await as syntactic sugar over Promises.** `async/await` does not change how asynchronous code works — it changes how you write it. Every `await` becomes a `.then()` under the hood, and the entire `async` function becomes a chain of Promises. The JavaScript engine transforms the code. You can verify: an `async` function that throws behaves identically to a Promise that rejects. Understanding that `async/await` is a syntax transformation — not a different execution model — explains why errors from `await` are caught with `try/catch` (same as a throwing `.then` callback) and why an unhandled rejection in an async function still produces an "unhandled promise rejection" warning.

**SE lens — readability as a design goal.** The `.then().catch()` version and the `async/await` version are semantically equivalent. The reason to prefer `async/await` is readability: the code reads top-to-bottom like synchronous code. When there are multiple sequential async operations (fetch, parse, transform, store), `await` keeps them in a linear sequence. `.then()` chains nest each operation inside the previous callback, which becomes visually complex ("callback pyramid"). The functional behaviour is identical; the maintainability is significantly better with `async/await`.

**What breaks without this:** If you write `const response = fetch(...)` without `await`, `response` is a Promise object, not a Response. When you then write `response.json()`, you are calling `.json()` on a Promise — which does not have a `.json()` method. The error is `TypeError: response.json is not a function`. The fix is always `await fetch(...)`.

---

### 5. Read the Network tab

**The problem:** Your fetch call works. But understanding what actually travelled over the network is essential for every debug session you will ever have. Open the browser DevTools now and read the request.

Open `http://localhost:5173`. Press `F12` to open DevTools. Click the **Network** tab. Reload the page with `Cmd+R` (Mac) or `F5` (Windows/Linux). You will see a list of requests.

Find the request to `localhost:8000/api/message`. Click it.

**The Headers panel** shows:
- **Request URL:** `http://localhost:8000/api/message` — the full URL requested
- **Request Method:** `GET`
- **Status Code:** `200 OK` — green, meaning success
- **Response Headers** include `content-type: application/json` (FastAPI set this), `access-control-allow-origin: http://localhost:5173` (the CORS middleware set this)

**The Response panel** shows the JSON body: `{"text":"Hello from Python","source":"FastAPI"}`

**The Timing panel** shows how long each phase took: DNS lookup, TCP connection, time to first byte, content download. For localhost requests, these are all near zero. In production, these timings reveal where slowness lives.

**Walkthrough:** Every `fetch()` call produces one or more entries in the Network tab. The preflight `OPTIONS` request (if CORS applies) appears before the actual request. Clicking a request reveals every detail: what was sent, what was received, how long it took. This panel is your primary tool for debugging the gap between "the frontend sent a request" and "the backend received it." If a request never appears in the Network tab, it was never sent (a JavaScript error prevented it). If it appears with a red status code, the server rejected it.

**CS lens — observability at the network boundary.** The Network tab is a form of **observability** — the ability to understand the internal state of a system by examining its outputs. Every HTTP request between the browser and the server is an output you can inspect. In production, the equivalent is server-side request logging: every incoming request is logged with its method, path, status code, and response time. When a production bug is reported, the first tool engineers reach for is the request log — the same information the Network tab shows, on the server side instead of the browser side.

**SE lens — debugging at the right layer.** Knowing which tool to use for which problem is a professional skill. A JavaScript error is in the Console tab. A network problem is in the Network tab. A React state problem is in the React DevTools extension. A Python server error is in the uvicorn terminal output. Using the wrong tool means looking in the wrong place and not finding the answer. Every lesson in this curriculum introduces the right debugging tool for the problems that lesson's code can produce.

**What breaks without this:** The Network tab shows `(blocked:mixed-content)` if you try to `fetch` an `http://` URL from an `https://` page. In production, your frontend will be served over HTTPS. If your API is still HTTP, the browser blocks the request entirely — this is the mixed-content policy. The fix is to run the API over HTTPS in production (Sprint 8).

---

## Connect the pieces

The two halves of your stack are now connected:

```
Browser (port 5173)
  → Vite dev server (Node.js)
  → serves React app
  → App.tsx calls fetch('http://localhost:8000/api/message')
  → Browser sends GET request to port 8000
  → Browser checks CORS: FastAPI responds with Access-Control-Allow-Origin header
  → Browser allows JavaScript to read the response
  → response.json() parses the body
  → setMessage(data) updates React state
  → React re-renders the component
  → Pixels appear on screen
```

This is the full-stack request cycle. Every subsequent lesson in this curriculum adds complexity to one part of this chain — Pydantic models on the FastAPI side, TanStack Query on the React side, Postgres behind FastAPI, JWT tokens in the headers — but the fundamental structure is unchanged.

---

## What breaks without this

**The CORS error returns after deployment:** In production, `localhost:5173` is not your frontend's origin. Your frontend will be at `https://yourdomain.com`. If you deploy the FastAPI backend without updating `allow_origins`, every production request will fail with a CORS error. Fix: use an environment variable for the allowed origin. `allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")]` works in both development and production.

**`TypeError: Failed to fetch`:** The FastAPI server is not running. Check the terminal where you started uvicorn. If it crashed, restart it. If the terminal shows an import error, the Python code has a syntax mistake — read the error message.

**React shows `Error: Unexpected token '<'`:** The fetch URL is wrong — it is hitting the Vite server (which serves HTML) instead of the FastAPI server. Confirm the URL in the `fetch()` call is `http://localhost:8000/...`, not `http://localhost:5173/...`.

---

## Definition of done

- [ ] The React app at `localhost:5173` displays data fetched from FastAPI at `localhost:8000`
- [ ] The browser Network tab shows the request to `localhost:8000/api/message` with status 200
- [ ] The CORS error no longer appears in the browser console
- [ ] You can explain what CORS is and why the browser enforces it
- [ ] You can explain why `fetch` cannot be called directly in the component body (without `useEffect`)
- [ ] You can explain what a Promise is and what `await` does to it
- [ ] You can explain the difference between the loading, error, and data states in the component
- [ ] You can explain what the `Access-Control-Allow-Origin` header does

**Git commit** (from `fullstack-project/`):

```
git add frontend backend
git commit -m "Connect React frontend to FastAPI backend: fetch, CORS middleware, async/await, all three async UI states handled"
```

This commit marks the end of Sprint 1. Your stack is running, connected, and understood from first principles. Every concept introduced in the next seven sprints builds on what you built here.
