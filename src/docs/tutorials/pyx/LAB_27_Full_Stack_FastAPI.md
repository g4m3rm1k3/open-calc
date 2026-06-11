# PyX — LAB 27 — Full Stack: PyX Frontend + FastAPI Backend

**Prerequisites:** Lab 26 complete. The to-do app runs in Vite.

**What this lab adds:**
- A FastAPI server that serves a REST API and the compiled frontend
- CORS configuration so the browser can fetch from the API
- `useEffect` + `fetch` in the PyX frontend to load data
- The complete full-stack development workflow

**Time:** 45–60 minutes.

---

## What You Will Build

A FastAPI server that:
1. Serves the Vite-built frontend at `/` (static files)
2. Provides a `/api/todos` endpoint that returns JSON
3. The PyX frontend fetches from `/api/todos` on mount

```
Browser → GET /         → FastAPI → serves dist/index.html
Browser → GET /api/todos → FastAPI → returns JSON list
PyX Component → fetch('/api/todos') → gets data → renders it
```

---

> **Quick Check:**
>
> 1. CORS prevents the browser from fetching from a different origin. When you run `npm run dev` (Vite on port 5173) and FastAPI on port 8000, are they the same origin?
> 2. In development you need CORS. In production the frontend is served by FastAPI. Why does serving from the same server solve the CORS problem?
> 3. FastAPI serves static files with `StaticFiles`. What is the one thing you must do before serving static files from the Vite build?
>
> *(Answers at the end)*

---

## Concept: CORS

**What it is:** **Cross-Origin Resource Sharing (CORS)** is a browser security mechanism that blocks JavaScript from making HTTP requests to a different origin (scheme + host + port) than the page's origin.

When your PyX app is at `http://localhost:5173` (Vite dev server) and you try to `fetch('http://localhost:8000/api/todos')` (FastAPI), the browser blocks the request because the origins differ (5173 vs 8000).

**The fix:** The server adds an `Access-Control-Allow-Origin` header. If the server says "I allow requests from localhost:5173," the browser permits it.

FastAPI's CORS middleware does this automatically:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

In production (where FastAPI serves the static files directly), the same origin is used — no CORS needed.

---

## Step 1 — Create the FastAPI Server

Create `backend/main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# Development: allow requests from Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample data — in a real app, this would come from a database
_todos = [
    {"id": 1, "text": "Learn PyX compiler", "done": True},
    {"id": 2, "text": "Build the runtime", "done": True},
    {"id": 3, "text": "Ship something", "done": False},
]
_next_id = 4


@app.get("/api/todos")
def get_todos():
    return _todos


@app.post("/api/todos")
def create_todo(todo: dict):
    global _next_id
    new_todo = {"id": _next_id, "text": todo["text"], "done": False}
    _todos.append(new_todo)
    _next_id += 1
    return new_todo


@app.patch("/api/todos/{todo_id}")
def toggle_todo(todo_id: int):
    for todo in _todos:
        if todo["id"] == todo_id:
            todo["done"] = not todo["done"]
            return todo
    return {"error": "not found"}, 404


@app.delete("/api/todos/{todo_id}")
def delete_todo(todo_id: int):
    global _todos
    _todos = [t for t in _todos if t["id"] != todo_id]
    return {"ok": True}


# Production: serve the built Vite frontend
dist_dir = os.path.join(os.path.dirname(__file__), "..", "app", "dist")
if os.path.exists(dist_dir):
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="static")
```

Install FastAPI:

```
> pip install fastapi uvicorn[standard]
```

Start the server:

```
> uvicorn backend.main:app --reload
```

---

## Step 2 — Update the PyX Component to Fetch from the API

Create `examples/full-stack/app.pyx`:

```python
from pyx import useState, useEffect

def TodoItem(props):
    item = props["item"]
    on_toggle = props["onToggle"]
    on_delete = props["onDelete"]
    done_class = "todo-item done" if item["done"] else "todo-item"

    return (
        <li class={done_class}>
            <span onClick={lambda: on_toggle(item["id"])}>{item["text"]}</span>
            <button class="delete" onClick={lambda: on_delete(item["id"])}>×</button>
        </li>
    )


def TodoApp():
    items, set_items = useState([])
    loading, set_loading = useState(True)
    error, set_error = useState(None)

    def load_todos():
        fetch("/api/todos").then(
            lambda r: r.json()
        ).then(
            lambda data: (set_items(data), set_loading(False))
        ).catch(
            lambda e: (set_error(str(e)), set_loading(False))
        )

    useEffect(load_todos, [])

    def toggle_item(id):
        fetch(f"/api/todos/{id}", {"method": "PATCH"}).then(
            lambda r: r.json()
        ).then(
            lambda updated: set_items([
                updated if i["id"] == id else i
                for i in items
            ])
        )

    def delete_item(id):
        fetch(f"/api/todos/{id}", {"method": "DELETE"}).then(
            lambda _: set_items([i for i in items if i["id"] != id])
        )

    if loading:
        return <div class="loading">Loading...</div>

    if error:
        return <div class="error">Error: {error}</div>

    done_count = len([i for i in items if i["done"]])
    total = len(items)

    return (
        <div class="todo-app">
            <h1>PyX Full Stack</h1>
            <p class="stats">{done_count}/{total} complete</p>
            <ul class="todo-list">
                {[<TodoItem
                    key={item["id"]}
                    item={item}
                    onToggle={toggle_item}
                    onDelete={delete_item}
                /> for item in items]}
            </ul>
        </div>
    )
```

---

## Step 3 — Build for Production

To test the full production setup (no CORS, frontend served by FastAPI):

```
> cd app && npm run build
```

This creates `app/dist/` with the compiled, optimised frontend.

Start FastAPI:

```
> uvicorn backend.main:app
```

Open `http://localhost:8000`. The PyX app loads, FastAPI serves the API, no CORS middleware needed (same origin).

---

### SAVE AND TRY

Development (Vite + FastAPI separately):

```
Terminal 1: uvicorn backend.main:app --reload
Terminal 2: cd app && npm run dev
```

Open `http://localhost:5173`. The app should:
- Show "Loading..." briefly
- Load todos from the API
- Toggle and delete work by hitting the API

---

## Challenge: Add Item Creation to the Frontend

**Task:** Add an input form to `TodoApp` that:
1. Sends a `POST /api/todos` request with `{"text": newText}`
2. On success, adds the returned todo to the `items` list

The backend already has `POST /api/todos` — you only need to update the frontend.

Try writing the `add_item` handler before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```python
def add_item(text):
    fetch("/api/todos", {
        "method": "POST",
        "headers": {"Content-Type": "application/json"},
        "body": JSON.stringify({"text": text})
    }).then(lambda r: r.json()).then(lambda new_item: set_items(items + [new_item]))
```

Add an `AddForm` component and call `add_item` from its submit handler. Pass `onAdd={add_item}` as a prop.

**Key insight:** The `.then()` chain handles the asynchronous response. `r.json()` returns a Promise that resolves to the parsed JSON object. The second `.then` receives the new todo item and calls `set_items` to append it — this triggers a re-render showing the new item. In Python, `.then(lambda r: r.json())` compiles to `.then((r) => r.json())` in the generated JavaScript.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| FastAPI starts | `uvicorn backend.main:app` shows Uvicorn running |
| API returns JSON | `curl http://localhost:8000/api/todos` returns JSON array |
| Frontend loads todos | Browser shows the todo items from the API |
| CORS headers present | Check browser dev tools Network tab — response has `Access-Control-Allow-Origin` |
| Production build works | `npm run build` + `uvicorn` at port 8000 serves the built app |

---

## Your Complete Files

### New files this lab

**`backend/main.py`** — FastAPI app with `GET /api/todos`, `POST /api/todos`, CORS middleware, and static file serving. Full content in Steps 1–2.

**`backend/requirements.txt`** — `fastapi`, `uvicorn[standard]`.

**`examples/todo.pyx`** — updated to fetch from `/api/todos` using `useEffect`.

### Project structure at end of Lab 27

```
pyx/
├── .venv/
├── backend/                   ← new
│   ├── main.py
│   └── requirements.txt
├── compiler/                  ← unchanged
├── runtime/                   ← unchanged
├── examples/
│   ├── counter.pyx  /  counter.jsx
│   ├── hello.pyx
│   └── todo.pyx               ← updated (fetches from API)
└── pyproject.toml
```

---

## Quick Check Answers

**1. Are localhost:5173 and localhost:8000 the same origin?**

No. Origin = scheme + host + port. Both have `http://localhost` but different ports (5173 vs 8000). The browser treats them as different origins and applies CORS restrictions. This means `fetch('http://localhost:8000/...')` from a page served at `localhost:5173` is blocked by default.

**2. Why does serving from the same server solve the CORS problem?**

Because the origin becomes identical. When FastAPI serves the frontend at `http://localhost:8000/`, and the frontend then fetches from `http://localhost:8000/api/todos`, both are the same origin — scheme, host, and port all match. The browser allows same-origin requests without any CORS headers.

**3. What must you do before serving static files from the Vite build?**

Run `npm run build` to create the `dist/` directory. Vite compiles all TypeScript and JSX to optimised JavaScript, processes CSS, and writes the final deployable files to `dist/`. The `StaticFiles` middleware in FastAPI then serves these files. Without the build step, the `dist/` directory does not exist.

---

*End of LAB 27.*

*Lab 28 builds the Vite plugin — a single configuration that invokes `pyxc` automatically when a `.pyx` file changes. The developer writes `.pyx`, saves, and the browser hot-reloads. No manual `pyxc build` step needed.*
