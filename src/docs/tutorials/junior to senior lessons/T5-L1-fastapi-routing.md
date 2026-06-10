# Junior to Senior — T5·L1 — FastAPI Routing

**Prerequisites:** T5·L1a (Pydantic v2). You can write validated Pydantic models.
This lesson builds the first working FastAPI HTTP endpoints for the task API.

**What this lab adds:**
- `@app.get`, `@app.post`, `@app.patch`, `@app.delete` — route decorators
- Path parameters: `/tasks/{task_id}` — typed automatically by FastAPI
- Query parameters: `?priority=high&done=false` — declared as function parameters
- Request body: a Pydantic model as a parameter
- `response_model=TaskResponse` — controls what FastAPI serialises in the response
- `HTTPException` — raising HTTP errors with status codes and detail messages
- `APIRouter` — grouping related routes into a separate module

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. FastAPI auto-generates documentation at which two URLs? How is this possible
>    without you writing a single documentation line?
> 2. `/tasks/{task_id}` — the `task_id` is declared `task_id: int` in the function
>    signature. The URL is `/tasks/abc`. What happens?
> 3. `response_model=TaskResponse` — the handler returns a `TaskModel` with 20
>    fields. `TaskResponse` only has 5. What does the response contain?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A working HTTP API with four endpoints, tested directly with `curl`:

```bash
POST /tasks/          → 201 Created (new task)
GET  /tasks/          → 200 OK (list of tasks)
GET  /tasks/t-1       → 200 OK (one task)
DELETE /tasks/t-1     → 204 No Content

GET  /health          → 200 {"status": "ok"}
GET  /docs            → Interactive API documentation (auto-generated)
```

---

### Concept: What FastAPI Does

**What it is:** FastAPI is a Python web framework that maps HTTP routes to Python
functions. It automatically handles: JSON serialisation, request validation,
response serialisation, and OpenAPI documentation generation.

**The problem before (writing HTTP handling manually):**

```python
# With the built-in http.server module:
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/tasks/':
            tasks = get_all_tasks()
            body  = json.dumps([t.__dict__ for t in tasks]).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', len(body))
            self.end_headers()
            self.wfile.write(body)
# 15 lines for one GET endpoint; 0 validation; 0 documentation
```

**The solution:**

```python
from fastapi import FastAPI
from src.api.models import TaskResponse

app = FastAPI()

@app.get('/tasks/', response_model=list[TaskResponse])
def list_tasks() -> list[TaskResponse]:
    return get_all_tasks()
# FastAPI handles: Content-Type header, JSON serialisation, OpenAPI docs
```

**What it hides:** HTTP mechanics. FastAPI handles status codes, headers, JSON
serialisation, and content negotiation. You write Python functions; FastAPI maps them
to HTTP.

**Canonical example:** FastAPI is like a restaurant's POS system. The POS translates
"order #4" into kitchen tickets, coordinates the response, handles payment — the
waiter (you) only needs to tell it what to order. FastAPI translates HTTP requests
into Python function calls and back.

**You will see this again in:**
- Every Python REST API project: FastAPI, Flask, Django REST Framework all use this pattern
- The route decorator pattern (`@app.get('/path')`) appears in Flask, Node Express, Go Gin
- Standard in industry for building microservices and web APIs

**Watch for:** FastAPI routes are registered at IMPORT TIME, not at call time.
`@app.get('/tasks/')` runs when the module is loaded — before any request arrives.
This means the route is registered once and used for every request.

---

## Step 1 — Install FastAPI and Run the Server

```bash
pip install fastapi uvicorn
```

Create `src/main.py`:

```python
# src/main.py
from fastapi import FastAPI

app = FastAPI(
    title='Task Manager API',
    version='1.0.0',
)

@app.get('/health')
def health_check() -> dict[str, str]:
    return {'status': 'ok'}
```

### SAVE AND TRY

```bash
uvicorn src.main:app --reload
```

**You should see:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process ...
```

Open `http://localhost:8000/health` in a browser. Expected: `{"status":"ok"}`

Open `http://localhost:8000/docs`. Expected: Interactive Swagger UI showing one endpoint.
This was auto-generated from your code — no documentation was written.

```bash
curl http://localhost:8000/health
```

Expected: `{"status":"ok"}`

**Change something:** Change `'ok'` to `'healthy'`, save. Expected: the server
reloads automatically (`--reload` flag) and the browser shows `{"status":"healthy"}`.
Change back to `"ok"`.

---

### Concept: Path Parameters, Query Parameters, and Request Bodies

**What it is:** FastAPI determines what comes from the URL path, query string, or
request body based on the function signature and route definition.

**The rules:**
1. A parameter name that appears in `{braces}` in the path → **path parameter**
2. A parameter that is a Pydantic model (subclass of `BaseModel`) → **request body**
3. Everything else → **query parameter**

```python
# Path parameter — appears in {task_id}:
@app.get('/tasks/{task_id}')
def get_task(task_id: str) -> dict:
    # task_id comes from the URL: GET /tasks/t-42 → task_id='t-42'
    ...

# Query parameter — not in path, has a default:
@app.get('/tasks/')
def list_tasks(priority: str | None = None, done: bool | None = None) -> list:
    # priority and done come from query string:
    # GET /tasks/?priority=high&done=false → priority='high', done=False
    ...

# Request body — Pydantic model parameter:
@app.post('/tasks/')
def create_task(body: CreateTaskRequest) -> TaskResponse:
    # body comes from the JSON request body: POST /tasks/ {"title":"..."}
    ...
```

**What it hides:** JSON parsing, type coercion, and validation. `done: bool = None`
in a query parameter means FastAPI accepts `?done=true`, `?done=True`, `?done=1`,
`?done=false` — all are properly converted to Python `bool`.

**Project application:** The task router uses all three: `task_id` from the path,
`priority` and `done` from the query string, `CreateTaskRequest` from the body.

**Smallest possible example:**

```python
@app.get('/items/{item_id}')
def get_item(
    item_id:  int,                # path parameter — auto-converted to int
    page:     int  = 1,           # query parameter with default
    category: str | None = None,  # optional query parameter
) -> dict:
    return {'id': item_id, 'page': page, 'category': category}

# GET /items/42 → {'id': 42, 'page': 1, 'category': None}
# GET /items/42?page=2&category=books → {'id': 42, 'page': 2, 'category': 'books'}
# GET /items/abc → 422 Unprocessable Entity (abc is not an int)
```

**You will see this again in:**
- Every REST API framework: path params, query params, and body are universal concepts
- Express.js: `req.params.id`, `req.query.page`, `req.body` — same three sources
- Django REST Framework: URL patterns with `<int:pk>`, `request.query_params`

**Watch for:** A parameter that is a simple type (str, int, bool) AND appears in the
path is a path parameter. A simple-type parameter NOT in the path is a query parameter.
Pydantic models are ALWAYS bodies, never query parameters.

---

### Concept: `HTTPException` — Raising HTTP Errors

**What it is:** `HTTPException(status_code=404, detail='Task not found')` stops the
current handler and sends an error response with the given status code and message.

**The problem before:**

```python
def get_task(task_id: str):
    task = find_task(task_id)
    if task is None:
        return {'error': 'not found'}, 404   # ← wrong: returns a tuple, not HTTP
```

Returning a tuple from a FastAPI handler does not produce a 404 response —
it serialises the tuple as JSON (poorly).

**The solution:**

```python
from fastapi import HTTPException

def get_task(task_id: str):
    task = find_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail=f'Task {task_id!r} not found')
    return task
```

`raise HTTPException(...)` — not `return` — sends the HTTP error response.
FastAPI catches `HTTPException` internally and formats it as `{"detail": "..."}` JSON.

**What it hides:** The HTTP response construction for error cases. You only specify
the status code and detail message; FastAPI handles headers, body format, and `Content-Type`.

**Common status codes for task CRUD:**

| Code | Constant | When to use |
|---|---|---|
| 200 | `HTTP_200_OK` | Default for GET, PATCH |
| 201 | `HTTP_201_CREATED` | POST that creates a resource |
| 204 | `HTTP_204_NO_CONTENT` | DELETE (no body) |
| 400 | `HTTP_400_BAD_REQUEST` | Client error — bad request data |
| 404 | `HTTP_404_NOT_FOUND` | Resource not found |
| 409 | `HTTP_409_CONFLICT` | Resource already exists |
| 422 | `HTTP_422_UNPROCESSABLE_ENTITY` | Pydantic auto-uses this for validation failures |

**Project application:** `GET /tasks/{task_id}` raises `404` when the task doesn't exist.
`DELETE /tasks/{task_id}` raises `404` when deleting a nonexistent task.

**Smallest possible example:**

```python
from fastapi import HTTPException

@app.get('/items/{item_id}')
def get_item(item_id: int) -> dict:
    if item_id > 100:
        raise HTTPException(status_code=404, detail=f'Item {item_id} not found')
    return {'id': item_id}

# GET /items/42 → 200 {'id': 42}
# GET /items/999 → 404 {"detail": "Item 999 not found"}
```

**You will see this again in:**
- Every FastAPI endpoint that handles missing resources
- Flask: `abort(404)` is equivalent
- Django: `raise Http404` is equivalent

**Watch for:** `raise` not `return`. Returning `HTTPException` sends it as a JSON
response but with a 200 status code — the exception is not raised. Always `raise`.

---

### Concept: `APIRouter` — Grouping Related Routes

**What it is:** `APIRouter` is a mini-application that holds route definitions.
The main `app` includes one or more routers with `app.include_router(router)`.

**The problem before:**

```python
# Everything in main.py:
app = FastAPI()

@app.get('/tasks/')
def list_tasks(): ...

@app.post('/tasks/')
def create_task(): ...

@app.get('/tasks/{id}')
def get_task(): ...

# Also users:
@app.get('/users/')
def list_users(): ...

# And projects:
@app.get('/projects/')
def list_projects(): ...

# 300 lines in main.py — unmaintainable
```

**The solution:**

```python
# src/api/tasks_router.py:
from fastapi import APIRouter

router = APIRouter(prefix='/tasks', tags=['tasks'])

@router.get('/')           # full path: GET /tasks/
def list_tasks(): ...

@router.post('/')          # full path: POST /tasks/
def create_task(): ...

# src/main.py:
from src.api.tasks_router import router as tasks_router
app.include_router(tasks_router)
```

**What it hides:** The routing table management. Routes are registered into the
router, then the router is mounted at a prefix. Adding a new route only touches the
relevant router file.

**Project application:** The task API has a `tasks_router` registered at `/tasks`.
Future routers for users, projects, and authentication will be separate files.

**Smallest possible example:**

```python
from fastapi import APIRouter, FastAPI

health_router = APIRouter(tags=['health'])

@health_router.get('/health')
def health() -> dict:
    return {'status': 'ok'}

app = FastAPI()
app.include_router(health_router)
```

**You will see this again in:**
- Every production FastAPI application has multiple routers
- Flask: `Blueprint` is the equivalent
- Django: `include()` in `urls.py` is the equivalent
- Express.js: `Router()` is the equivalent

**Watch for:** The `prefix` on the router does NOT include a trailing slash by default.
`APIRouter(prefix='/tasks')` + `@router.get('/')` = `GET /tasks/`.
`APIRouter(prefix='/tasks/')` + `@router.get('/')` = `GET /tasks//` (double slash — wrong).

---

## Step 2 — Build the Task Router

Create `src/api/tasks_router.py`:

```python
# src/api/tasks_router.py
from fastapi import APIRouter, HTTPException, status
from src.api.models import CreateTaskRequest, UpdateTaskRequest, TaskResponse
from src.domain.task import Task

router = APIRouter(prefix='/tasks', tags=['tasks'])

# In-memory store for this lesson — replaced with a database in T5-L3:
_tasks: dict[str, Task] = {}
_next_id = 1
```

### SAVE AND TRY

```bash
python -c "from src.api.tasks_router import router; print(router.prefix)"
```

Expected: `/tasks`

Now add a helper and the first endpoint:

```python
# src/api/tasks_router.py
from fastapi import APIRouter, HTTPException, status
from src.api.models import CreateTaskRequest, UpdateTaskRequest, TaskResponse
from src.domain.task import Task

router  = APIRouter(prefix='/tasks', tags=['tasks'])
_tasks: dict[str, Task] = {}
_next_id = 1


def _task_to_response(task_id: str, task: Task) -> TaskResponse:
    """Converts a domain Task to an API TaskResponse."""
    return TaskResponse(
        id       = task_id,
        title    = task.title,
        priority = task.priority,
        done     = task.done,
    )


@router.get('/', response_model=list[TaskResponse])           # ← add this endpoint
def list_tasks(
    priority: str | None  = None,
    done:     bool | None = None,
) -> list[TaskResponse]:
    """Lists all tasks with optional filters."""
    items = list(_tasks.items())

    if priority is not None:
        if priority.lower() not in {'low', 'medium', 'high'}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f'Invalid priority {priority!r}',
            )
        items = [(tid, t) for tid, t in items if t.priority == priority.lower()]

    if done is not None:
        items = [(tid, t) for tid, t in items if t.done == done]

    return [_task_to_response(tid, t) for tid, t in items]
```

Update `src/main.py` to include the router:

```python
# src/main.py
from fastapi             import FastAPI
from src.api.tasks_router import router as tasks_router   # ← add this

app = FastAPI(title='Task Manager API', version='1.0.0')
app.include_router(tasks_router)                           # ← add this

@app.get('/health')
def health_check() -> dict[str, str]:
    return {'status': 'ok'}
```

### SAVE AND TRY

```bash
uvicorn src.main:app --reload
```

```bash
curl http://localhost:8000/tasks/
```

**You should see:** `[]` — empty list.

```bash
curl "http://localhost:8000/tasks/?priority=invalid"
```

**Expected:** `{"detail":"Invalid priority 'invalid'"}` with 400 status.

Open `http://localhost:8000/docs`. Expected: see the `/tasks/` GET endpoint with
documented query parameters `priority` and `done`.

---

## Step 3 — Add CREATE, GET BY ID, and DELETE

Add to `src/api/tasks_router.py`:

```python
@router.post('/', response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(body: CreateTaskRequest) -> TaskResponse:       # ← add this
    """Creates a new task."""
    global _next_id
    task_id = f't-{_next_id}'
    _next_id += 1

    task = Task.from_dict(body.model_dump())
    _tasks[task_id] = task
    return _task_to_response(task_id, task)
```

### SAVE AND TRY

```bash
curl -X POST http://localhost:8000/tasks/ \
  -H "Content-Type: application/json" \
  -d '{"title": "Write tests", "priority": "high"}'
```

**You should see:**
```json
{"id":"t-1","title":"Write tests","priority":"high","done":false,"due_date":null,"tags":[]}
```

Now add GET by ID:

```python
@router.get('/{task_id}', response_model=TaskResponse)
def get_task(task_id: str) -> TaskResponse:                     # ← add this
    """Gets a task by ID."""
    task = _tasks.get(task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f'Task {task_id!r} not found',
        )
    return _task_to_response(task_id, task)
```

### SAVE AND TRY

```bash
curl http://localhost:8000/tasks/t-1
```

**You should see:** The task you just created.

```bash
curl http://localhost:8000/tasks/nonexistent
```

**Expected:** `{"detail":"Task 'nonexistent' not found"}` with 404 status.

Add PATCH and DELETE:

```python
@router.patch('/{task_id}', response_model=TaskResponse)
def update_task(task_id: str, body: UpdateTaskRequest) -> TaskResponse:  # ← add
    """Updates specific fields of a task."""
    task = _tasks.get(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail=f'Task {task_id!r} not found')

    if body.title    is not None: task.title    = body.title
    if body.priority is not None: task.priority = body.priority
    if body.done     is not None and body.done and not task.done:
        task.complete()

    return _task_to_response(task_id, task)


@router.delete('/{task_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: str) -> None:                                   # ← add
    """Deletes a task."""
    if task_id not in _tasks:
        raise HTTPException(status_code=404, detail=f'Task {task_id!r} not found')
    del _tasks[task_id]
```

### SAVE AND TRY

```bash
# Create, then delete:
curl -X DELETE http://localhost:8000/tasks/t-1
```

**You should see:** No body (204 No Content). Now try to get it:

```bash
curl http://localhost:8000/tasks/t-1
```

**Expected:** `{"detail":"Task 't-1' not found"}` — it was deleted.

---

## Step 4 — Write the Tests

Create `tests/test_tasks_router.py`:

```python
# tests/test_tasks_router.py
import pytest
from fastapi.testclient import TestClient
from src.main import app
import src.api.tasks_router as router_module


@pytest.fixture(autouse=True)
def reset_tasks():
    """Clear in-memory store before each test to prevent state leaks."""
    router_module._tasks.clear()
    router_module._next_id = 1
    yield


client = TestClient(app)


class TestHealthCheck:
    def test_health_returns_ok(self) -> None:
        response = client.get('/health')
        assert response.status_code == 200
        assert response.json() == {'status': 'ok'}


class TestListTasks:
    def test_empty_list_when_no_tasks(self) -> None:
        response = client.get('/tasks/')
        assert response.status_code == 200
        assert response.json() == []

    def test_returns_created_tasks(self) -> None:
        client.post('/tasks/', json={'title': 'Task A'})
        client.post('/tasks/', json={'title': 'Task B'})
        response = client.get('/tasks/')
        assert response.status_code == 200
        assert len(response.json()) == 2

    def test_filters_by_priority(self) -> None:
        client.post('/tasks/', json={'title': 'High task', 'priority': 'high'})
        client.post('/tasks/', json={'title': 'Low task',  'priority': 'low'})
        response = client.get('/tasks/?priority=high')
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]['priority'] == 'high'

    def test_returns_400_for_invalid_priority_filter(self) -> None:
        response = client.get('/tasks/?priority=urgent')
        assert response.status_code == 400


class TestCreateTask:
    def test_creates_task_and_returns_201(self) -> None:
        response = client.post('/tasks/', json={'title': 'Write tests'})
        assert response.status_code == 201
        body = response.json()
        assert body['title'] == 'Write tests'
        assert body['id']    == 't-1'
        assert body['done']  is False

    def test_returns_422_for_empty_title(self) -> None:
        response = client.post('/tasks/', json={'title': ''})
        assert response.status_code == 422

    def test_returns_422_for_invalid_priority(self) -> None:
        response = client.post('/tasks/', json={'title': 'Task', 'priority': 'urgent'})
        assert response.status_code == 422

    def test_sequential_ids_assigned(self) -> None:
        r1 = client.post('/tasks/', json={'title': 'A'})
        r2 = client.post('/tasks/', json={'title': 'B'})
        assert r1.json()['id'] == 't-1'
        assert r2.json()['id'] == 't-2'


class TestGetTask:
    def test_returns_task_by_id(self) -> None:
        client.post('/tasks/', json={'title': 'Deploy'})
        response = client.get('/tasks/t-1')
        assert response.status_code == 200
        assert response.json()['title'] == 'Deploy'

    def test_returns_404_for_unknown_id(self) -> None:
        response = client.get('/tasks/t-999')
        assert response.status_code == 404
        assert 'detail' in response.json()


class TestDeleteTask:
    def test_deletes_task_and_returns_204(self) -> None:
        client.post('/tasks/', json={'title': 'Write tests'})
        response = client.delete('/tasks/t-1')
        assert response.status_code == 204
        assert client.get('/tasks/t-1').status_code == 404

    def test_returns_404_for_unknown_id(self) -> None:
        assert client.delete('/tasks/t-999').status_code == 404
```

### SAVE AND TRY

```bash
pytest tests/test_tasks_router.py -v
```

**You should see:**
```
tests/test_tasks_router.py::TestHealthCheck::test_health_returns_ok PASSED
...
tests/test_tasks_router.py::TestDeleteTask::test_returns_404_for_unknown_id PASSED

13 passed
```

**Change something:** Remove the `reset_tasks` fixture and run the tests again.
Expected: `test_sequential_ids_assigned` likely fails because the ID counter is
polluted from previous tests. Put the fixture back.

---

## 🎯 Challenge: Add `PATCH /tasks/{task_id}/complete`

**You know:** `APIRouter`, `HTTPException`, `response_model`, `status_code`.

**Task:** Add an endpoint that marks a task as done without requiring a body:

```
PATCH /tasks/{task_id}/complete → 200 (with updated task)
```

Returns 404 if the task doesn't exist. Returns 409 Conflict if already done.

Write 3 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```python
@router.patch('/{task_id}/complete', response_model=TaskResponse)
def complete_task(task_id: str) -> TaskResponse:
    task = _tasks.get(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail=f'Task {task_id!r} not found')
    if task.done:
        raise HTTPException(status_code=409, detail=f'Task {task_id!r} is already complete')
    task.complete()
    return _task_to_response(task_id, task)
```

**Tests:**
```python
def test_complete_task_returns_200() -> None:
    client.post('/tasks/', json={'title': 'Write tests'})
    response = client.patch('/tasks/t-1/complete')
    assert response.status_code == 200
    assert response.json()['done'] is True

def test_complete_returns_404_for_unknown_task() -> None:
    assert client.patch('/tasks/nonexistent/complete').status_code == 404

def test_complete_returns_409_for_already_done_task() -> None:
    client.post('/tasks/', json={'title': 'Write tests'})
    client.patch('/tasks/t-1/complete')
    response = client.patch('/tasks/t-1/complete')   # second time
    assert response.status_code == 409
```

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| Auto-generated docs | Open `http://localhost:8000/docs` — all endpoints visible |
| Path parameter type validation | `GET /tasks/abc` when `task_id: int` → 422 |
| Query parameter defaults | `GET /tasks/` with no params → all tasks |
| 422 from Pydantic | `POST /tasks/ {"title": ""}` → 422 |
| 404 from HTTPException | `GET /tasks/nonexistent` → 404 |
| 201 for POST | `POST /tasks/` → status code is 201 |
| 204 for DELETE | `DELETE /tasks/t-1` → status code is 204, no body |
| `reset_tasks` prevents test interference | Remove fixture, check tests pass independently |

---

## Quick Check Answers

**1. Auto-generated docs at which URLs?**

`/docs` (Swagger UI) and `/redoc` (ReDoc). Both are generated by FastAPI reading your
route decorators, parameter annotations, Pydantic model schemas, and docstrings.
Every time you add a route or change a model, the documentation updates automatically.
This is a major productivity advantage over writing API documentation by hand.

**2. `task_id: int`, URL is `/tasks/abc`. What happens?**

FastAPI returns `422 Unprocessable Entity` automatically. It reads the `int` type
annotation for `task_id`, tries to parse `'abc'` as an integer, fails, and returns
a validation error response. The handler function is never called. The 422 response
includes a JSON body explaining which field failed and why.

**3. Handler returns object with 20 fields, `response_model` has 5. Response contains?**

Only the 5 fields declared in `response_model`. FastAPI calls `model.model_dump()` on
the return value and filters it through the response model's schema. Extra fields are
stripped — they never appear in the response. This prevents accidental data leaks (e.g.,
returning password hashes) when the handler returns a database model with sensitive fields.
