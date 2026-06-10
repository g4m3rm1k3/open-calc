# Python Tool Database — LAB 74 — FastAPI: First Route

**Prerequisites:** Lab 73 (REST concepts: methods, status codes, JSON). Lab 52 (ToolService and schemas). You know what a REST API is. This lesson creates the server and the first working route.

**What this lab adds:**
- Installing FastAPI and uvicorn
- `@app.get()` — defining a route handler
- Running the dev server and seeing the auto-generated docs
- `JSONResponse` vs returning a dict vs returning a Pydantic model
- The `/health` endpoint: the simplest route and why every API has one

**Time:** 35–45 minutes

---

## What You Will Build

A running FastAPI server with two routes:

```
GET /health   →  {"status": "ok", "version": "1.0.0"}
GET /tools    →  [{"id": 1, "name": "EM-0500", ...}, ...]
```

Open `http://127.0.0.1:8000/docs` in a browser and see an interactive API explorer — generated automatically from your code.

---

> **Quick Check — try to answer before reading:**
>
> 1. `@app.get("/tools")` is a Python decorator. A decorator is a function that wraps another function. What does `@app.get("/tools")` actually do to the function it decorates?
> 2. FastAPI generates API documentation automatically. Where does it get the information to generate it?
> 3. You return a `list[ToolRead]` from a route. FastAPI serializes it to JSON. Which `ToolRead` method does it call to convert the Pydantic model to a dict?
>
> *(Answers at the end of this lab)*

---

## Concept: FastAPI

**What it is:** A Python web framework for building REST APIs. You define functions decorated with HTTP method + URL path. FastAPI handles routing, request parsing, response serialization, and validation.

**The problem before:** Flask (the older alternative) requires:
- Manual request body parsing (`request.get_json()`)
- Manual validation (write your own checks or use a separate library)
- Manual serialization (convert objects to dicts by hand)
- Separate documentation (maintained manually, always out of sync)

**The solution:** FastAPI reads your Python type annotations to do all of these automatically:
- Request body: declared as a Pydantic model parameter → auto-validated
- Response: declared as the return type → auto-serialized
- Documentation: generated from type annotations → always in sync

**What it hides:** The ASGI application layer, request/response parsing, JSON serialization/deserialization, and the HTTP-to-Python-function routing table. You write functions with typed parameters; FastAPI handles the HTTP layer.

**The protected invariant:** If a request body does not match the declared Pydantic model, the server returns 422 automatically — you never receive invalid data in your handler. Validation cannot be skipped.

**You will see this again in:** FastAPI is the dominant Python API framework as of 2024, overtaking Flask in new projects. It uses the same patterns as Django REST Framework and is structurally similar to Express.js (Node) and Gin (Go). Every job posting for Python backend work lists it.

**Career signal:** "FastAPI, SQLAlchemy, Pydantic" is the standard modern Python backend stack. Knowing all three — which you now do — is the same professional footing as knowing React + TypeScript on the frontend.

---

## Step 1 — Install FastAPI and uvicorn

```
pip install fastapi uvicorn[standard]
```

`fastapi` is the framework. `uvicorn` is the **ASGI server** — the process that listens on a port and hands HTTP requests to FastAPI. ASGI (Asynchronous Server Gateway Interface) is the protocol between the server and the framework, the same way WSGI worked for Flask.

`[standard]` installs uvicorn with websocket support and a faster HTTP parser. Without it, uvicorn still works but is slower.

### SAVE AND TRY

```python
# test_install.py
import fastapi
import uvicorn
print(f"FastAPI: {fastapi.__version__}")
print(f"uvicorn: {uvicorn.__version__}")
```

**You should see** two version numbers. If either import fails, the installation did not complete.

---

## Step 2 — The FastAPI App and the `/health` Route

Create `tooldb_api/main.py`:

```python
from fastapi import FastAPI
```

`FastAPI` is the application class — one per server process. It registers routes, middleware, and lifecycle hooks.

```python
app = FastAPI(
    title="Tool Database API",
    description="REST API for CNC tool management",
    version="1.0.0",
)
```

`title`, `description`, and `version` appear in the auto-generated documentation at `/docs`. They are not required, but naming the API is professional practice.

```python
@app.get("/health")
def health_check():
    """Returns the server's current status. Used by monitoring tools and load balancers."""
    return {"status": "ok", "version": app.version}
```

`@app.get("/health")` registers this function as the handler for `GET /health`. When a client sends `GET http://localhost:8000/health`, FastAPI calls `health_check()` and serializes its return value as JSON.

Returning a `dict` from a route handler is the simplest case — FastAPI serializes it directly. The `{"status": "ok", ...}` dict becomes `{"status": "ok", "version": "1.0.0"}` in the response body.

### SAVE AND TRY

```
uvicorn tooldb_api.main:app --reload
```

`tooldb_api.main:app` — module path + the variable name of the FastAPI instance.
`--reload` — restart the server when source files change. Never use `--reload` in production.

Open a browser at `http://127.0.0.1:8000/health`.

**You should see:**
```json
{"status": "ok", "version": "1.0.0"}
```

Now open `http://127.0.0.1:8000/docs`.

**You should see:** An interactive API documentation page (Swagger UI) with your `/health` endpoint listed. Click "Try it out" → "Execute" — it calls the endpoint and shows the response.

**Change something:** Change `"status": "ok"` to `"status": "healthy"`. Save. Because `--reload` is active, the server restarts automatically. Refresh the browser.

**You should see:** `{"status": "healthy", "version": "1.0.0"}`. Change it back to `"ok"`.

---

## Concept: Route Handlers and Return Types

**Route handler:** A function decorated with `@app.get()`, `@app.post()`, etc. FastAPI calls it when a matching HTTP request arrives.

**Return type declaration:** FastAPI uses the function's return type annotation to:
1. Validate the response data before sending it
2. Generate the response schema in the documentation
3. Serialize the return value to JSON

```python
from tooldb.schemas.tool_schemas import ToolRead

@app.get("/tools", response_model=list[ToolRead])
def list_tools() -> list[ToolRead]:
    ...
```

`response_model=list[ToolRead]` tells FastAPI: "The response body is a list of ToolRead objects." FastAPI calls `.model_dump()` on each `ToolRead` and serializes the result as JSON. Fields declared in `ToolRead` that should not appear in the API response can be excluded via `response_model_exclude`.

**Three ways to return data from a FastAPI route:**

```python
# 1. Return a dict — FastAPI serializes it directly (no schema validation)
return {"id": 42, "name": "EM-0500"}

# 2. Return a Pydantic model — FastAPI calls .model_dump() and serializes
return ToolRead(id=42, name="EM-0500", ...)

# 3. Return a list of Pydantic models — FastAPI serializes each item
return [ToolRead(id=1, ...), ToolRead(id=2, ...)]
```

**Use option 2 or 3** — they are type-safe and documented. Option 1 is valid for simple endpoints (like `/health`) where no schema is needed.

---

## Step 3 — The `/tools` Route

Add to `tooldb_api/main.py`:

```python
from tooldb.orm.session import SessionLocal
from tooldb.services.tool_service_orm import ToolService
from tooldb.schemas.tool_schemas import ToolRead
```

```python
@app.get("/tools", response_model=list[ToolRead])
def list_tools():
    """Returns all tools in the database."""
    with SessionLocal() as session:
        service = ToolService(session)
        return service.get_all_tools()
```

`SessionLocal()` from Lab 49/52 — opens a session, runs the block, closes it. `ToolService` from Lab 52. `get_all_tools()` returns `list[ToolRead]`. FastAPI serializes the list to JSON.

The route handler creates and closes a session per request. This is the correct pattern for a web server: no session is shared between requests, so there is no risk of one request's transaction affecting another.

### SAVE AND TRY

With the server running (uvicorn with `--reload`), open `http://127.0.0.1:8000/tools`.

**You should see:**
```json
[
  {"id": 1, "name": "EM-0500", "tool_type": "endmill", "diameter": 6.0, ...},
  ...
]
```

Or `[]` if the database is empty — that is also correct.

**Also try:** `http://127.0.0.1:8000/docs` — click `GET /tools` → "Try it out" → "Execute". You see the response in the browser within the docs page.

**Change something:** Add `response_model=None` to the decorator. Run the request again. The response is the same data, but the documentation for this endpoint no longer shows a response schema. FastAPI still works — it just cannot validate or document the response shape. Change it back.

---

## Concept: Dependency Injection — Preview

In the `/tools` handler above, you create a session inside the function. This works but has a problem: every handler creates its own session setup code. If you need to change how sessions are created — for tests, or for a different database — you change every handler.

FastAPI has a built-in dependency injection system for this. You will use it in Lab 75. For now, the inline session is fine and clear.

**Preview of what's coming:**

```python
from fastapi import Depends

def get_db():
    with SessionLocal() as session:
        yield session

@app.get("/tools")
def list_tools(session = Depends(get_db)):
    service = ToolService(session)
    return service.get_all_tools()
```

`Depends(get_db)` tells FastAPI: "Call `get_db()` and inject its result as the `session` parameter." Every route that needs a database session declares `Depends(get_db)`. You change session creation in one place — `get_db`. Lab 75 implements this fully.

---

## 🎯 Challenge: Add the `/tools/{tool_id}` Route

**You know:** `@app.get("/tools")` handles all tools. URL path parameters are declared with `{name}` in the URL and as function parameters with matching names.

**Task:** Add a `GET /tools/{tool_id}` route that returns a single tool by ID. If the tool does not exist, return a 404 response.

**Starting code:**

```python
from fastapi import HTTPException

@app.get("/tools/{tool_id}", response_model=ToolRead)
def get_tool(tool_id: int):    # ← tool_id comes from the URL path
    with SessionLocal() as session:
        service = ToolService(session)
        tool = service.get_tool(tool_id)
        if tool is None:
            raise HTTPException(status_code=404, detail=f"Tool {tool_id} not found")
        return tool
```

Test it: `http://127.0.0.1:8000/tools/1` (existing) and `http://127.0.0.1:8000/tools/9999` (non-existent).

---

<details>
<summary>▶ Show Solution</summary>

The code above is the complete solution. The key pieces:

- `tool_id: int` in the function signature — FastAPI reads `{tool_id}` from the URL, converts it to `int`, and injects it as the `tool_id` parameter. If the URL contains non-integer text (e.g., `/tools/abc`), FastAPI returns 422 automatically.
- `HTTPException(status_code=404, detail=...)` — raising this inside a handler causes FastAPI to return a 404 response with the `detail` string in the body: `{"detail": "Tool 9999 not found"}`.

**Key insight:** FastAPI route parameters are strongly typed. Declaring `tool_id: int` means the function is guaranteed to receive an integer — invalid inputs are rejected before your code runs. This is the same principle as Pydantic models for request bodies: validation at the boundary, not inside your code.

</details>

---

## Final Check

| What to verify | How to verify |
|---|---|
| Server starts | `uvicorn tooldb_api.main:app --reload` — no error on startup |
| `/health` returns JSON | `http://127.0.0.1:8000/health` → `{"status": "ok", ...}` |
| `/tools` returns list | `http://127.0.0.1:8000/tools` → JSON array |
| `/docs` shows all routes | Open `/docs` — both routes listed with their response schemas |
| `/tools/1` returns one tool | Returns `{"id": 1, ...}` for an existing tool |
| `/tools/9999` returns 404 | Returns `{"detail": "Tool 9999 not found"}` with status 404 |

---

## Quick Check Answers

**1. What does `@app.get("/tools")` do to the decorated function?**
It registers the function in FastAPI's routing table. When a `GET /tools` request arrives, FastAPI looks up the registered handler for that method + path combination and calls it. The decorator does not change the function itself — the function can still be called directly (useful for testing). The decorator's job is registration: "file this function under GET /tools."

**2. Where does FastAPI get information to generate documentation?**
From Python type annotations. The function's parameter types tell FastAPI what the request body looks like. The `response_model` kwarg tells FastAPI what the response looks like. The docstring becomes the endpoint description. The `title`, `description`, and `version` on the `FastAPI()` instance become the API-level metadata. All of this is in-code — there is no separate documentation file to maintain.

**3. Which method does FastAPI call to convert `ToolRead` to JSON?**
`model_dump()` — the Pydantic v2 method that converts a model instance to a plain Python dict. FastAPI then serializes that dict to JSON. This is why the `ToolRead` class needs `from_attributes=True` in its `model_config` — it receives SQLAlchemy ORM objects and converts them to plain dicts for serialization. The same Pydantic models used for the desktop app work identically for the API.
