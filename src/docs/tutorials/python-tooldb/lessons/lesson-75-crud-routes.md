# Python Tool Database — LAB 75 — CRUD Routes and Dependency Injection

**Prerequisites:** Lab 74 (FastAPI running, `/health` and `GET /tools` working). You have a server. This lesson adds the remaining CRUD routes and introduces FastAPI's dependency injection system.

**What this lab adds:**
- `POST /tools` — create a tool from a JSON body
- `PATCH /tools/{id}` — partial update using ToolUpdate
- `DELETE /tools/{id}` — delete a tool
- FastAPI dependency injection: `Depends(get_db)` for session management
- Testing routes with the `/docs` UI and with `httpx` in a script

**Time:** 50–60 minutes

---

## What You Will Build

The complete CRUD API for tools:

```
GET     /tools          list all tools
GET     /tools/{id}     get one tool
POST    /tools          create a tool
PATCH   /tools/{id}     partial update
DELETE  /tools/{id}     delete (returns 204 No Content)
```

All five routes, each tested from the `/docs` UI.

---

> **Quick Check — try to answer before reading:**
>
> 1. `POST /tools` receives a JSON body. FastAPI validates it against `ToolCreate`. If a required field is missing, what HTTP status code does the client receive?
> 2. `PATCH` updates only the fields provided — the rest stay unchanged. `PUT` replaces the entire resource. Your `ToolUpdate` from Lab 51 has all-optional fields. Which HTTP method does it match: PUT or PATCH?
> 3. `DELETE /tools/42` succeeds. What should the response body contain?
>
> *(Answers at the end of this lab)*

---

## Concept: FastAPI Dependency Injection

**What it is:** A system where FastAPI automatically creates and passes shared resources (like database sessions) to route handlers that declare them as parameters.

**The problem before:** In Lab 74, every route created a session inline:

```python
@app.get("/tools")
def list_tools():
    with SessionLocal() as session:         # ← repeated in every handler
        service = ToolService(session)
        return service.get_all_tools()
```

If you have 10 routes, you write `with SessionLocal() as session` 10 times. Changing the session setup (for tests or different databases) requires editing all 10.

**The solution:** Define a *dependency* — a function that produces the shared resource — and declare it as a parameter with `Depends()`. FastAPI calls the dependency function and injects its result:

```python
from fastapi import Depends
from sqlalchemy.orm import Session

def get_db():
    """Dependency: yields a session and ensures it closes after the request."""
    with SessionLocal() as session:
        yield session   # ← yield, not return — execution pauses here while the route runs
```

```python
@app.get("/tools")
def list_tools(session: Session = Depends(get_db)):
    service = ToolService(session)
    return service.get_all_tools()
```

`yield` instead of `return`: the `with SessionLocal()` block keeps the session open while the route handler runs. After the handler returns, execution resumes after the `yield`, and the `with` block exits — closing the session. If the handler raises an exception, the `with` block's `__exit__` still runs — session cleanup is guaranteed.

**What it hides:** The lifecycle management of the dependency — when it is created, when it is cleaned up, and how it is threaded through to each handler. You declare what you need; FastAPI delivers it.

**The protected invariant:** Sessions are never leaked. Even if the handler raises an exception, the `yield`-based dependency ensures the `with` block exits and the session closes.

**You will see this again in:** Authentication checking (`Depends(get_current_user)`), rate limiting, database connection management, and any shared resource that has setup and teardown. The `Depends` pattern is FastAPI's core feature and appears in every professional FastAPI codebase.

**Career signal:** FastAPI's dependency injection is a simplified version of the dependency injection pattern that appears in Spring (Java), Angular (TypeScript), and .NET Core (C#). Understanding "declare what you need, a system provides it" is a skill that transfers across languages.

---

## Step 1 — The Database Dependency

Update `tooldb_api/main.py`:

```python
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from tooldb.orm.session import SessionLocal
from tooldb.services.tool_service_orm import ToolService
from tooldb.schemas.tool_schemas import ToolCreate, ToolRead, ToolUpdate
```

```python
def get_db():
    """
    FastAPI dependency that yields a database session.
    The session is closed after the route handler returns (or raises).
    """
    with SessionLocal() as session:
        yield session    # ← execution pauses here while the route runs
```

Now update the existing `list_tools` route to use it:

```python
@app.get("/tools", response_model=list[ToolRead])
def list_tools(session: Session = Depends(get_db)):    # ← was: no parameters
    return ToolService(session).get_all_tools()
```

The function body is now one line. The session arrives via `Depends` — no `with SessionLocal()` block inside the handler.

### SAVE AND TRY

The server should still be running with `--reload`. Navigate to `http://127.0.0.1:8000/tools`.

**You should see:** The same response as before — refactoring to use `Depends` changed nothing visible.

**Change something:** Remove `= Depends(get_db)` from the parameter. Try calling the route. FastAPI will now try to get `session` from the request query parameters — it finds nothing and returns `422 Unprocessable Entity`. Add `= Depends(get_db)` back.

---

## API Contract: `POST /tools`

```
POST /tools
Request body: ToolCreate fields (name, tool_type required; others optional)
Response (201): ToolRead (the created tool with its new ID)
Response (422): Validation error if required fields are missing
```

---

## Step 2 — `POST /tools` (Create)

```python
from fastapi import status   # ← add to imports

@app.post("/tools", response_model=ToolRead, status_code=status.HTTP_201_CREATED)
def create_tool(tool_data: ToolCreate, session: Session = Depends(get_db)):
    """
    Creates a new tool. Returns the created tool with its assigned ID.
    Validates the request body against ToolCreate before calling the service.
    """
    return ToolService(session).create_tool(tool_data)
```

`tool_data: ToolCreate` — a parameter with a Pydantic model type, not a path parameter and not `Depends`. FastAPI sees a Pydantic model as a **request body**. It parses the incoming JSON, validates it against `ToolCreate`, and injects the validated object as `tool_data`. If validation fails, FastAPI returns 422 before your function is called.

`status_code=status.HTTP_201_CREATED` — POST that creates a resource should return 201, not 200. Using the `status` module's constants (`HTTP_201_CREATED`, `HTTP_404_NOT_FOUND`) avoids magic numbers.

### SAVE AND TRY

Open `http://127.0.0.1:8000/docs`. Find `POST /tools`. Click "Try it out". In the request body field, enter:

```json
{"name": "EM-TEST-001", "tool_type": "endmill", "diameter": 8.0}
```

Click "Execute".

**You should see:** A `201` response with the created tool including its new `id`:
```json
{"id": 5, "name": "EM-TEST-001", "tool_type": "endmill", "diameter": 8.0, ...}
```

**Change something:** Try submitting a body without the required `name` field: `{"tool_type": "endmill"}`. You should receive a `422` response with a message like `"field required"` for the `name` field. This is Pydantic validation working automatically — you wrote no validation code in the handler.

---

## API Contract: `PATCH /tools/{tool_id}`

```
PATCH /tools/{tool_id}
Path parameter: tool_id (integer)
Request body: ToolUpdate fields (all optional — send only the fields to change)
Response (200): ToolRead (the full tool with the update applied)
Response (404): If no tool with that ID exists
```

---

## Step 3 — `PATCH /tools/{tool_id}` (Partial Update)

```python
@app.patch("/tools/{tool_id}", response_model=ToolRead)
def update_tool(tool_id: int, update_data: ToolUpdate, session: Session = Depends(get_db)):
    """
    Partially updates a tool. Only the provided fields are changed.
    Sends only the fields you want to update — omit fields to keep their current value.
    """
    service = ToolService(session)
    tool = service.update_tool(tool_id, update_data)
    if tool is None:
        raise HTTPException(status_code=404, detail=f"Tool {tool_id} not found")
    return tool
```

Both `tool_id: int` (path parameter) and `update_data: ToolUpdate` (request body) are injected by FastAPI. Path parameters are matched by the `{tool_id}` placeholder in the URL. Request body is inferred because `ToolUpdate` is a Pydantic model.

### SAVE AND TRY

In `/docs`, find `PATCH /tools/{tool_id}`. Try it with `tool_id=1` and body:

```json
{"flute_count": 4}
```

**You should see:** A 200 response with the full tool, with only `flute_count` updated. All other fields are unchanged. This works because `ToolUpdate` has all-optional fields and `model_dump(exclude_none=True)` (Lab 51) only includes the fields you sent.

**Also try:** `tool_id=9999`. You should see a `404` response.

---

## API Contract: `DELETE /tools/{tool_id}`

```
DELETE /tools/{tool_id}
Path parameter: tool_id (integer)
Response (204): No content — deletion succeeded
Response (404): If no tool with that ID exists
```

---

## Step 4 — `DELETE /tools/{tool_id}`

```python
from fastapi import Response   # ← add to imports

@app.delete("/tools/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tool(tool_id: int, session: Session = Depends(get_db)):
    """
    Deletes a tool permanently. Returns 204 No Content on success.
    204 means the operation succeeded but there is no data to return.
    """
    service = ToolService(session)
    deleted = service.delete_tool(tool_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Tool {tool_id} not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
    # Return explicit Response to prevent FastAPI from trying to serialize None
```

`status_code=204` — successful delete returns no body. Using `Response(status_code=204)` explicitly tells FastAPI "no body, just the status code." Returning `None` from a handler with `status_code=204` also works in FastAPI, but is less explicit.

### SAVE AND TRY

In `/docs`, try `DELETE /tools/{tool_id}` with the ID of the tool you created in Step 2.

**You should see:** A `204` response with no response body. Try calling `GET /tools/{that_id}` now — you should get `404`.

**Change something:** Try `DELETE /tools/9999`. You should get `404`. This is idempotent in behavior but not technically idempotent in HTTP — the first delete returns 204, the second returns 404. Some APIs return 204 for both (true idempotency). The choice is a policy decision — both are valid.

---

## Step 5 — Testing Routes with `httpx`

The `/docs` UI is convenient but not scriptable. `httpx` is an HTTP client library for Python — `requests` but async-capable:

```
pip install httpx
```

```python
# test_api.py — run while the server is running
import httpx

BASE_URL = "http://127.0.0.1:8000"

with httpx.Client(base_url=BASE_URL) as client:
    # Create a tool:
    response = client.post("/tools", json={"name": "EM-HTTPX-TEST", "tool_type": "endmill"})
    assert response.status_code == 201, response.text
    tool_id = response.json()["id"]
    print(f"Created tool: id={tool_id}")

    # Read it:
    response = client.get(f"/tools/{tool_id}")
    assert response.status_code == 200
    print(f"Read: {response.json()['name']}")

    # Update it:
    response = client.patch(f"/tools/{tool_id}", json={"flute_count": 6})
    assert response.status_code == 200
    print(f"Updated flute_count: {response.json()['flute_count']}")

    # Delete it:
    response = client.delete(f"/tools/{tool_id}")
    assert response.status_code == 204
    print("Deleted")

    # Confirm deletion:
    response = client.get(f"/tools/{tool_id}")
    assert response.status_code == 404
    print("Confirmed 404 after delete")

print("All assertions passed")
```

### SAVE AND TRY

Start the server (`uvicorn tooldb_api.main:app --reload`), then run the test script in a separate terminal.

**You should see:**
```
Created tool: id=6
Read: EM-HTTPX-TEST
Updated flute_count: 6
Deleted
Confirmed 404 after delete
All assertions passed
```

This script is a manual integration test — you ran all five operations end-to-end against the real running server. In a CI pipeline, you would run FastAPI in test mode (using `TestClient`) so no real server is needed.

---

## 🎯 Challenge: Route Organization with `APIRouter`

**You know:** All five routes are in `main.py`. As the API grows to include holders, assemblies, and jobs, `main.py` will become very long.

**Task:** Move the five tool routes into `tooldb_api/routes/tools.py` using FastAPI's `APIRouter`. Register it in `main.py` with a prefix of `/tools` so all routes keep the same URLs.

**Starting code:**

```python
# tooldb_api/routes/tools.py
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from tooldb_api.main import get_db   # ← import the shared dependency
from tooldb.services.tool_service_orm import ToolService
from tooldb.schemas.tool_schemas import ToolCreate, ToolRead, ToolUpdate

router = APIRouter()

@router.get("/", response_model=list[ToolRead])  # ← "/" not "/tools" — prefix is added at registration
def list_tools(session: Session = Depends(get_db)):
    ...
```

In `main.py`:

```python
from tooldb_api.routes.tools import router as tools_router
app.include_router(tools_router, prefix="/tools", tags=["Tools"])
```

---

<details>
<summary>▶ Show Solution</summary>

```python
# tooldb_api/routes/tools.py
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from tooldb_api.dependencies import get_db   # moved to shared module
from tooldb.services.tool_service_orm import ToolService
from tooldb.schemas.tool_schemas import ToolCreate, ToolRead, ToolUpdate

router = APIRouter()

@router.get("/", response_model=list[ToolRead])
def list_tools(session: Session = Depends(get_db)):
    return ToolService(session).get_all_tools()

@router.get("/{tool_id}", response_model=ToolRead)
def get_tool(tool_id: int, session: Session = Depends(get_db)):
    tool = ToolService(session).get_tool(tool_id)
    if tool is None:
        raise HTTPException(status_code=404, detail=f"Tool {tool_id} not found")
    return tool

@router.post("/", response_model=ToolRead, status_code=status.HTTP_201_CREATED)
def create_tool(tool_data: ToolCreate, session: Session = Depends(get_db)):
    return ToolService(session).create_tool(tool_data)

@router.patch("/{tool_id}", response_model=ToolRead)
def update_tool(tool_id: int, update_data: ToolUpdate, session: Session = Depends(get_db)):
    tool = ToolService(session).update_tool(tool_id, update_data)
    if tool is None:
        raise HTTPException(status_code=404, detail=f"Tool {tool_id} not found")
    return tool

@router.delete("/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tool(tool_id: int, session: Session = Depends(get_db)):
    deleted = ToolService(session).delete_tool(tool_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Tool {tool_id} not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
```

Move `get_db` to `tooldb_api/dependencies.py`:

```python
# tooldb_api/dependencies.py
from tooldb.orm.session import SessionLocal

def get_db():
    with SessionLocal() as session:
        yield session
```

Register in `main.py`:

```python
from tooldb_api.routes.tools import router as tools_router
app.include_router(tools_router, prefix="/tools", tags=["Tools"])
```

**Key insight:** `APIRouter` with `prefix="/tools"` means every route in the router is automatically under `/tools`. A route declared as `@router.get("/")` becomes `GET /tools/`. `@router.get("/{tool_id}")` becomes `GET /tools/{tool_id}`. The router does not know its own prefix — the prefix is applied at registration. This means the same router could be registered under `/api/v1/tools` or `/v2/tools` by changing one line in `main.py`.

</details>

---

## Final Check

| What to verify | How to verify |
|---|---|
| `POST /tools` returns 201 with the new tool | Try from `/docs` — response code and body |
| `POST /tools` with missing name returns 422 | Submit `{"tool_type": "endmill"}` — see 422 |
| `PATCH /tools/{id}` updates only sent fields | Patch `flute_count`, verify `diameter` unchanged |
| `DELETE /tools/{id}` returns 204 | Delete a tool — response has no body |
| `DELETE /tools/{id}` then `GET` returns 404 | Run the httpx test script |
| `Depends(get_db)` shared across routes | Session setup only in `get_db`, not in handlers |

---

## Quick Check Answers

**1. What status code when a required field is missing from `POST /tools`?**
422 Unprocessable Entity. FastAPI validates the request body against `ToolCreate` before calling your handler. If `name` is missing and it is required (not Optional with no default), Pydantic raises a `ValidationError`, which FastAPI converts to a 422 response with a detailed error body explaining which field failed and why. Your handler is never called.

**2. `ToolUpdate` with all-optional fields — PUT or PATCH?**
PATCH. HTTP's PUT means "replace the entire resource with this representation." If `ToolUpdate` has all-optional fields and you send `{"flute_count": 6}`, a PUT would be interpreted as "the new tool has only `flute_count` — replace the entire tool with this." PATCH means "apply these specific changes to the existing resource." Since `ToolUpdate` uses `exclude_none=True` to update only the provided fields, PATCH is semantically correct.

**3. What should the response body of a successful DELETE contain?**
Nothing — 204 No Content. The status code communicates success; there is nothing left to describe (the resource no longer exists). Returning the deleted resource body (200 with the tool data) is also valid in some API designs but is redundant — the client already has the data (it's about to delete it). 204 with no body is the standard REST convention for successful deletion.
