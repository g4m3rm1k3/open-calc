# CAD/CAM — Lesson 15 — The Python Backend

## What You Will Build

A Python FastAPI server starts alongside the Vite frontend. The frontend sends a
sketch JSON object and a depth to `POST /api/extrude`. The backend computes the
solid geometry and returns a `Solid` JSON object. The solid is rendered in the
viewport exactly as before. The TypeScript extrusion function from lesson 12 is
replaced by the network call — the visual result is identical, but computation now
happens in Python.

## What You Need to Know First

Lessons 01–14 for the frontend. Python 3.10+ must be installed (`python --version`
in the terminal). No Python libraries are required yet beyond what pip installs.

---

## The Problem

Geometry computation in TypeScript works for simple extrusions, but CAD operations
quickly become complex: Boolean operations (cutting a hole through a solid),
surface offsetting (polygon offset for tool radius), and NURBS surfaces require
significant mathematical infrastructure. Python's scientific computing ecosystem
(NumPy, SciPy, later pythonocc) provides this infrastructure. JavaScript does not.

The decision to move computation to a backend is not about correctness — the
TypeScript extrusion was correct. It is about **what language is appropriate for
what task**. Python is the correct language for geometry computation. TypeScript is
the correct language for rendering and UI. Separating them by a network boundary
enforces this separation of concerns and makes each side independently testable.

**SE lens — client-server as a separation of concerns:**
The frontend "owns" the question "what does the user see and how do they interact?"
The backend "owns" the question "what are the geometric results of this operation?"
The API is the **contract** between them: a JSON protocol that neither side violates.
Changing the backend's internal implementation (from hand-written geometry to
pythonocc) requires no frontend changes if the contract is preserved.

---

## Step 1 — Python Project Setup

### Create the backend directory

```
mkdir backend
cd backend
```

**Why a separate directory:**
The frontend (TypeScript/Vite) and backend (Python/FastAPI) are two separate
programs. They share a running process only during development (Vite and the Python
server run simultaneously). In production, they could be deployed on separate
servers. Separating them in the file system makes this boundary explicit.

### Create `backend/pyproject.toml`

```toml
[project]
name = "cam-backend"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = [
    "fastapi>=0.111.0",
    "uvicorn>=0.30.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

**`pyproject.toml` — first appearance:**
`pyproject.toml` is the modern Python project configuration file (PEP 517/518). It
replaces the older `setup.py` and `requirements.txt`. `[project]` defines metadata.
`dependencies` lists required packages — the equivalent of `package.json` dependencies.

**`fastapi`:** A modern Python web framework for building APIs. It generates OpenAPI
documentation automatically, validates request/response data using Python type hints,
and achieves near Node.js performance through its async architecture.

**`uvicorn`:** An ASGI server — the program that runs the FastAPI application and
handles HTTP connections. ASGI (Asynchronous Server Gateway Interface) is the Python
equivalent of Node.js's event loop: it handles many concurrent connections without
blocking. Uvicorn is the production-quality ASGI server recommended by FastAPI.

### Create a Python virtual environment

```
python -m venv .venv
```

**Virtual environment — first appearance:**
`python -m venv .venv` creates a **virtual environment** — an isolated Python
installation inside the `.venv` directory. Virtual environments solve the same
problem as `node_modules` in Node.js: they allow each project to have its own
specific package versions without conflicting with other projects on the same machine.

Activate the virtual environment before running any Python or pip commands:
- **Windows PowerShell:** `.\.venv\Scripts\Activate.ps1`
- **Mac/Linux:** `source .venv/bin/activate`

When activated, the terminal prompt shows `(.venv)` and `python`/`pip` commands
use the virtual environment's packages.

### Install dependencies

```
pip install -e ".[dev]"
```

**`pip` — first appearance:**
`pip` is Python's package manager — the Python equivalent of `npm`. `pip install`
downloads and installs packages from PyPI (the Python Package Index at `pypi.org`).
The `-e` flag installs in "editable" mode — changes to the project source code are
immediately reflected without reinstalling. The `.` refers to the current directory
(the project with `pyproject.toml`).

### Add `.venv` to `.gitignore`

In the root `.gitignore`:
```
node_modules/
dist/
.DS_Store
backend/.venv/
__pycache__/
*.pyc
```

**`__pycache__/` and `*.pyc`:**
Python compiles `.py` files to bytecode (`.pyc`) and caches them in `__pycache__`
directories. Like `node_modules`, these are reproducible from source and should not
be committed.

---

## Step 2 — The FastAPI Application

### Create `backend/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CAM Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**`FastAPI()` — first appearance:**
`FastAPI()` creates the application object. It registers routes, middleware, and
configuration. `title` and `version` appear in the auto-generated API documentation
at `http://localhost:8000/docs`.

**CORS middleware — first appearance:**
**CORS** (Cross-Origin Resource Sharing) is a browser security mechanism that prevents
a web page from making requests to a different origin (domain + port) than the one
that served it. The frontend at `localhost:5174` trying to call the backend at
`localhost:8000` is a **cross-origin request** — different ports mean different
origins.

Without CORS middleware, the browser blocks the request. `CORSMiddleware` tells the
backend to include the response headers that permit the frontend origin. `allow_origins=["http://localhost:5174"]` specifically allows only the Vite dev server —
not arbitrary origins. In production, this would be the deployed frontend URL.

**Security — CORS is not authentication:**
CORS only restricts which web pages can call the API from a browser. A command-line
tool (`curl`) or server-side code can still call the API directly. CORS is not a
security gate — it is a browser-enforced restriction that prevents malicious websites
from making requests on behalf of logged-in users (CSRF prevention). For our local
development server, the restriction to `localhost:5174` is sufficient.

### Create the shared data models

```python
from pydantic import BaseModel
from typing import Optional

class SketchPoint(BaseModel):
    x: float
    y: float

class SketchLine(BaseModel):
    id: str
    start: SketchPoint
    end:   SketchPoint

class Sketch(BaseModel):
    lines:   list[SketchLine]
    circles: list = []
    arcs:    list = []

class ExtrudeRequest(BaseModel):
    sketch: Sketch
    depth:  float

class SolidVertex(BaseModel):
    x: float
    y: float
    z: float

class SolidFace(BaseModel):
    vertexIndices: tuple[int, int, int]
    normalX: float
    normalY: float
    normalZ: float

class SolidResponse(BaseModel):
    id:       str
    vertices: list[SolidVertex]
    faces:    list[SolidFace]
```

**Pydantic `BaseModel` — first appearance:**
Pydantic is a Python data validation library. A class inheriting from `BaseModel`
automatically validates data against its field type annotations. `ExtrudeRequest`
requires `sketch` to be a `Sketch` object and `depth` to be a `float`. If the
request JSON is missing a field or has the wrong type, FastAPI returns a 422
Validation Error automatically — no manual validation code needed.

**`list[SketchLine]` in Python type hints:**
`list[SketchLine]` is a Python 3.9+ type hint: a list of `SketchLine` objects.
This is the Python equivalent of `SketchLine[]` in TypeScript. Pydantic uses this
hint to validate and parse the JSON array into Python objects.

**Why models are duplicated from TypeScript:**
Both the TypeScript frontend and the Python backend define the same data structures
(`SketchLine`, `Sketch`, `Solid`). This is necessary because they are different
programs in different languages. The **contract** is the JSON structure that flows
between them. In a larger project, a schema language like JSON Schema or Protocol
Buffers generates both sides from one definition — but for this curriculum, the
duplication is acceptable and educational.

---

## Step 3 — The Extrude Endpoint

```python
import math

_next_solid_id = 0

def _extract_closed_loop(sketch: Sketch) -> list[SketchPoint] | None:
    if not sketch.lines:
        return None

    start_map: dict[tuple[float, float], SketchLine] = {}
    for line in sketch.lines:
        key = (round(line.start.x, 6), round(line.start.y, 6))
        start_map[key] = line

    first_line = sketch.lines[0]
    loop = [first_line.start]
    current = first_line

    for _ in range(len(sketch.lines)):
        end_key = (round(current.end.x, 6), round(current.end.y, 6))
        next_line = start_map.get(end_key)

        if next_line is None:
            return None

        start_key = (round(first_line.start.x, 6), round(first_line.start.y, 6))
        if end_key == start_key:
            return loop

        loop.append(next_line.start)
        current = next_line

    return None


@app.post("/api/extrude", response_model=SolidResponse)
def extrude(request: ExtrudeRequest) -> SolidResponse:
    global _next_solid_id

    ordered = _extract_closed_loop(request.sketch)
    if ordered is None or len(ordered) < 3:
        from fastapi import HTTPException
        raise HTTPException(status_code=422, detail="Sketch does not form a closed loop")

    vertices: list[SolidVertex] = []
    faces:    list[SolidFace]   = []

    top_start    = len(vertices)
    for point in ordered:
        vertices.append(SolidVertex(x=point.x, y=point.y, z=0))

    bottom_start = len(vertices)
    for point in ordered:
        vertices.append(SolidVertex(x=point.x, y=point.y, z=-request.depth))

    count = len(ordered)

    for index in range(1, count - 1):
        faces.append(SolidFace(
            vertexIndices=(top_start, top_start + index, top_start + index + 1),
            normalX=0, normalY=0, normalZ=1,
        ))

    for index in range(1, count - 1):
        faces.append(SolidFace(
            vertexIndices=(bottom_start, bottom_start + index + 1, bottom_start + index),
            normalX=0, normalY=0, normalZ=-1,
        ))

    for index in range(count):
        next_index = (index + 1) % count
        top_a    = top_start    + index
        top_b    = top_start    + next_index
        bottom_a = bottom_start + index
        bottom_b = bottom_start + next_index

        edge_dx = ordered[next_index].x - ordered[index].x
        edge_dy = ordered[next_index].y - ordered[index].y
        edge_len = math.hypot(edge_dx, edge_dy)

        if edge_len < 1e-10:
            continue

        normal_x =  edge_dy / edge_len
        normal_y = -edge_dx / edge_len

        faces.append(SolidFace(
            vertexIndices=(top_a, top_b, bottom_a),
            normalX=normal_x, normalY=normal_y, normalZ=0,
        ))
        faces.append(SolidFace(
            vertexIndices=(top_b, bottom_b, bottom_a),
            normalX=normal_x, normalY=normal_y, normalZ=0,
        ))

    solid_id = f"solid-{_next_solid_id}"
    _next_solid_id += 1

    return SolidResponse(id=solid_id, vertices=vertices, faces=faces)
```

**`@app.post("/api/extrude")` — decorator and routing:**
`@app.post(path)` is a **decorator** that registers the function below it as the
handler for `POST` requests to the given path. A **decorator** in Python is a
function that wraps another function, adding behaviour. `@app.post` adds the function
to FastAPI's routing table.

**HTTP methods — first appearance:**
`POST` is one of the standard HTTP request methods:
- `GET`: retrieve a resource (no body, idempotent — the same request always returns
  the same resource)
- `POST`: create or process (sends a body, may create new data)
- `PUT`: replace a resource entirely
- `PATCH`: partially update a resource
- `DELETE`: remove a resource

Extrusion uses `POST` because it sends data (the sketch and depth) and receives a
result (the solid). It is not idempotent — calling it twice creates two solids with
different IDs.

**`HTTPException` for error responses:**
`raise HTTPException(status_code=422, detail="...")` returns an HTTP error response
to the client. Status code `422` means "Unprocessable Entity" — the request was
syntactically valid but semantically wrong (no closed loop). Status codes are a
universal HTTP protocol:
- 200: Success
- 400: Bad Request (client error, invalid syntax)
- 422: Unprocessable Entity (valid syntax, invalid semantics)
- 500: Internal Server Error (server error)

---

## Step 4 — Run the Backend

From the `backend/` directory:

```
uvicorn main:app --reload --port 8000
```

**What this command does:**
`uvicorn` is the ASGI server (installed in step 1). `main:app` tells uvicorn to find
the `app` object in `main.py`. `--reload` watches for file changes and restarts the
server automatically (development mode only — equivalent to Vite's hot module
replacement). `--port 8000` sets the listening port.

After running, the server is available at `http://localhost:8000`. The auto-generated
API documentation is at `http://localhost:8000/docs` — a Swagger UI showing every
endpoint with example requests and responses. Test the `/api/extrude` endpoint
directly from the browser.

---

## Step 5 — Frontend API Call

### Create `src/api/backendApi.ts`

```typescript
import type { Sketch }  from '../scene/sketch.js'
import type { Solid }   from '../scene/solid.js'

const BACKEND_URL = 'http://localhost:8000'

export async function extrudeSketchApi(
  sketch: Sketch,
  depth:  number,
): Promise<Solid | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/extrude`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ sketch, depth }),
    })

    if (!response.ok) {
      console.error('Extrude failed:', response.status, await response.text())
      return null
    }

    const solidData = await response.json() as Solid
    return solidData

  } catch (error) {
    console.error('Network error:', error)
    return null
  }
}
```

**`fetch(url, options)` — first appearance:**
`fetch` is a browser-built-in function that sends HTTP requests. It returns a
`Promise<Response>` — an asynchronous value that resolves when the response arrives.

`method: 'POST'` sets the HTTP method. `headers: { 'Content-Type': 'application/json' }`
tells the server the request body is JSON. `body: JSON.stringify({ sketch, depth })`
serialises the request object to a JSON string.

**`async/await` — first appearance:**
`async function` and `await` are syntax for working with Promises — asynchronous
values — without chaining `.then()` calls.

`await fetch(...)` pauses the function (without blocking the main thread) until the
network response arrives. The function can then use the response normally. Without
`await`, `response` would be a `Promise<Response>`, not a `Response`.

`async function` is required whenever `await` is used inside it. An `async` function
always returns a `Promise` — `Promise<Solid | null>` here.

**`response.ok`:**
`response.ok` is `true` if the HTTP status code is in the 200–299 range (success).
For status codes 400+, `response.ok` is `false`. Always check `response.ok` before
parsing the body — an error response body may not be valid JSON.

**`try/catch` for network errors:**
`fetch` can throw for network errors (server not running, no internet). The `catch`
handles these cases and returns `null` — a silent failure that the caller can handle
by showing an error message.

**Performance — network latency:**
A local network call to `localhost:8000` takes ~1ms. The user clicks Extrude, the
request is sent, the Python server computes the geometry, the response arrives, the
solid renders. For simple extrusions the round-trip is imperceptible. For complex
boolean operations (lesson 15+), the computation takes longer and a loading spinner
would improve UX.

### Update `src/App.tsx`

Replace `extrudeSketch` (the TypeScript function) with `extrudeSketchApi`:

```tsx
async function handleExtrude(depth: number): Promise<void> {
  const newSolid = await extrudeSketchApi(sketch, depth)
  if (newSolid === null) return
  setSolids([...solids, newSolid])
}
```

The `handleExtrude` function is now `async` because it `await`s the network call.
In React, event handlers can be `async` — calling `handleExtrude()` returns a Promise
that React ignores, and the state update in `setSolids` still fires correctly when
the Promise resolves.

---

## Debugging: Common Backend Issues

**Symptom: `fetch` fails with `net::ERR_CONNECTION_REFUSED`**

The Python server is not running. In a second terminal, start it with:
```
cd backend && uvicorn main:app --reload --port 8000
```

**Symptom: CORS error in the browser console**

The `CORSMiddleware` is not configured with the correct frontend origin. Check that
`allow_origins=["http://localhost:5174"]` matches the URL where the Vite server is
running.

**Symptom: `422 Unprocessable Entity` from the backend**

The request body does not match the `ExtrudeRequest` Pydantic model. Check
`http://localhost:8000/docs` for the expected request format. Use the browser
DevTools Network tab to see the exact JSON being sent.

---

## Connect the Pieces

`backendApi.ts` is the boundary between the frontend and backend. It is the only
file that knows the backend URL and HTTP protocol. Every geometry operation that
moves to the backend adds a function to this file. The frontend components call
API functions — they never construct HTTP requests directly.

In lesson 21 (polygon offset), `backendApi.ts` gains `offsetSketchApi`. In lesson
22 (contour toolpath), it gains `generateContourToolpathApi`. The pattern is the
same in every case: send a typed request, receive a typed response, handle errors.

---

## What Breaks Without This

**Without CORS middleware:**
Every API call from the frontend produces a CORS error in the browser console and
the request is blocked. The browser refuses to send the response body to the frontend
JavaScript even though the server sent it — the CORS check happens after the request
completes. The fix is always on the backend: add the `Access-Control-Allow-Origin`
header.

**Without `response.ok` check:**
If the server returns a 422 error (no closed loop), `response.json()` parses the
error body — which is not a `Solid` but a `{ detail: "..." }` object. The frontend
would crash trying to access `solidData.vertices` on an object that has no `vertices`.

---

## Definition of Done

- [ ] `uvicorn main:app --reload --port 8000` starts without errors
- [ ] `http://localhost:8000/docs` shows the API documentation
- [ ] Drawing a rectangle in the sketch and clicking Extrude calls the Python backend
- [ ] The solid renders identically to the lesson 12 TypeScript version
- [ ] A non-closed sketch returns a visible error (console or UI)
- [ ] You can explain the client-server architecture and which side owns what
- [ ] You can explain CORS — what it is, why it exists, and why it is not authentication
- [ ] You can explain `async/await` in terms of Promises — what `await` does to execution
- [ ] You can explain HTTP status codes: 200, 400, 422, 500
- [ ] You can explain `pyproject.toml` vs `package.json` and `pip` vs `npm`
- [ ] You can explain what a virtual environment is and why it exists
- [ ] Run:
      ```
      git add backend/ src/api/
      git commit -m "Add Python FastAPI backend: extrude endpoint accepts sketch JSON, returns solid JSON; CORS configured for Vite dev server; async fetch replaces TypeScript extrusion"
      ```

---

*Next: Lesson 16 — What is G-code. Load a G-code file and display its raw lines.
G-code as a domain-specific language, modal state in machine controllers.*
