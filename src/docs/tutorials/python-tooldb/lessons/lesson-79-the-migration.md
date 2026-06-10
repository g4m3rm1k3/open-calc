# Python Tool Database — LAB 79 — The Migration: API Replaces the Desktop UI

**Prerequisites:** Lab 72 (packaging). Lab 78 (CORS). You have a packaged desktop app and a working REST API. This lesson is the transition: the API server becomes the backend, and the PySide6 UI becomes a client of the API instead of the service layer.

**What this lab adds:**
- Why the migration exists: the architectural shift from local to network
- What changes and what stays the same — the service layer survives
- Replacing `ToolService(session)` calls with `httpx` calls in the UI
- The `ApiClient` class: a typed wrapper around HTTP calls
- What to do when the UI and API disagree

**Time:** 60–75 minutes

---

## What Changes

**Before (Labs 1–72):** Desktop app, one process, direct service access:
```
[PySide6 MainWindow]
       ↓ imports
[ToolService(session)]
       ↓ uses
[SQLAlchemy → SQLite]
```

**After (Labs 73–79):** Desktop app calls the API; API owns the service layer:
```
[PySide6 MainWindow]
       ↓ HTTP (httpx)
[FastAPI server]
       ↓ imports
[ToolService(session)]
       ↓ uses
[SQLAlchemy → SQLite or PostgreSQL]
```

**What stays the same:**
- `ToolORM`, `JobORM`, `AssemblyORM` — no changes
- `ToolCreate`, `ToolRead`, `ToolUpdate` — no changes
- `ToolService`, `JobService` — no changes
- All the filtering and audit logic — no changes

**What changes:**
- The UI no longer imports from `tooldb.services.*`
- The UI no longer creates `SessionLocal()` sessions
- The UI calls `ApiClient.get_tools()` instead of `service.get_all_tools()`
- `ApiClient` wraps `httpx` calls and returns the same Pydantic types

---

> **Quick Check — try to answer before reading:**
>
> 1. The desktop app currently imports `ToolService` and creates sessions. After the migration, it uses `httpx`. What does this do to the desktop app's dependency on SQLAlchemy?
> 2. `ApiClient.get_tools()` makes a network call. `ToolService.get_all_tools()` makes a database call. Both return `list[ToolRead]`. From the UI's perspective, what is the difference?
> 3. The API server is not running and the user opens the desktop app. What should happen?
>
> *(Answers at the end of this lab)*

---

## Concept: The Service Layer Survives

This is the payoff for building the three-layer architecture (Labs 48–56).

The UI never called SQLAlchemy directly — it called `ToolService`. The service's interface (`create_tool(ToolCreate) → ToolRead`) did not change when we moved to the API. The API's routes call the same service. The UI will call an `ApiClient` that has the same interface.

**Before:**
```python
# In the UI:
service = ToolService(session)
tools = service.get_all_tools()   # returns list[ToolRead]
```

**After:**
```python
# In the UI:
client = ApiClient(base_url="http://localhost:8000")
tools = client.get_tools()       # returns list[ToolRead] — same type
```

The rest of the UI — `ToolTableModel`, the filter proxy, the report tab — uses `list[ToolRead]` regardless of where it came from. Those components do not change.

This is the architectural value of the three-layer pattern: layers that depend on abstractions (not implementations) can swap their dependencies. The UI depended on "something that gives me `list[ToolRead]`." Whether that something is a service or an HTTP client is irrelevant to the table model.

---

## Step 1 — The `ApiClient` Class

Create `tooldb_ui/api_client.py`:

```python
import httpx
from tooldb.schemas.tool_schemas import ToolCreate, ToolRead, ToolUpdate
from tooldb.schemas.job_schemas import JobCreate, JobRead, AssemblyRead
from typing import Optional
```

```python
class ApiClient:
    """
    Typed HTTP client for the Tool Database API.
    Returns Pydantic models — the same types the local service layer returned.
    Raises ApiError for HTTP errors (4xx, 5xx).
    """

    def __init__(self, base_url: str = "http://127.0.0.1:8000"):
        self._client = httpx.Client(
            base_url=base_url,
            timeout=10.0,    # 10-second timeout — fail fast, don't hang the UI
        )
```

`httpx.Client` is a persistent HTTP client — it reuses the underlying TCP connection for multiple requests. Creating a new `Client` per request would re-establish the TCP connection each time (slow). One client per `ApiClient` instance is the correct pattern.

```python
    # --- Tools ---

    def get_tools(self, tool_type=None, min_diameter=None,
                  max_diameter=None, search=None, limit=200) -> list[ToolRead]:
        params = {
            "tool_type":    tool_type,
            "min_diameter": min_diameter,
            "max_diameter": max_diameter,
            "search":       search,
            "limit":        limit,
        }
        # Remove None values — don't send ?tool_type=None to the server:
        params = {k: v for k, v in params.items() if v is not None}

        response = self._client.get("/tools", params=params)
        response.raise_for_status()    # raises httpx.HTTPStatusError for 4xx/5xx
        return [ToolRead.model_validate(item) for item in response.json()]
```

`response.raise_for_status()` — if the server returned 4xx or 5xx, this raises `httpx.HTTPStatusError`. Without it, a 500 response would silently return empty data or cause a parse error. `raise_for_status()` surfaces the failure immediately.

`ToolRead.model_validate(item)` — parse the JSON dict from the API response into a `ToolRead` Pydantic model. This is the same as `ToolRead.model_validate(tool_orm)` from Lab 50, but now the source is a dict (from JSON) instead of an ORM object. Pydantic handles both because `ToolRead` does not require `from_attributes=True` — plain dicts work with the default config.

The write methods follow the same pattern — but notice `data.model_dump(exclude_none=True)`:

```python
    def create_tool(self, data: ToolCreate) -> ToolRead:
        response = self._client.post("/tools", json=data.model_dump(exclude_none=True))
        # model_dump(exclude_none=True): don't send fields that were never set
        # The server treats absent fields as "use the column default"
        response.raise_for_status()
        return ToolRead.model_validate(response.json())
```

`exclude_none=True` matters here. Without it, every optional field (`flute_count`, `material`, etc.) would be sent as `null` in the JSON body. The server would treat `null` as "please set this to null" — overwriting any default. With `exclude_none=True`, those fields are absent from the JSON, and the server keeps its defaults.

```python
    def update_tool(self, tool_id: int, data: ToolUpdate) -> ToolRead:
        response = self._client.patch(f"/tools/{tool_id}",
                                      json=data.model_dump(exclude_none=True))
        response.raise_for_status()
        return ToolRead.model_validate(response.json())
```

The PATCH route uses the same `ToolUpdate` + `exclude_none=True` combination from Lab 51. Only the fields you actually set are sent. The URL `f"/tools/{tool_id}"` — Python f-string inserts the integer ID directly into the path string.

```python
    def delete_tool(self, tool_id: int) -> None:
        response = self._client.delete(f"/tools/{tool_id}")
        response.raise_for_status()
        # No response body to parse — DELETE returns 204 No Content
```

Now the job methods. Notice they follow the identical pattern: build URL, call, raise_for_status, validate:

```python
    # --- Jobs ---

    def get_jobs(self) -> list[JobRead]:
        response = self._client.get("/jobs")
        response.raise_for_status()
        return [JobRead.model_validate(item) for item in response.json()]

    def create_job(self, data: JobCreate) -> JobRead:
        response = self._client.post("/jobs", json=data.model_dump())
        response.raise_for_status()
        return JobRead.model_validate(response.json())

    def close(self) -> None:
        """Call when the app closes — releases the connection pool."""
        self._client.close()
```

`close()` releases the TCP connection pool. If you skip it, the OS eventually reclaims the file descriptors — but calling it explicitly is correct resource management, the same as closing a database connection.

### SAVE AND TRY

With the API server running (`uvicorn tooldb_api.main:app`), run this in a separate terminal:

```python
from tooldb_ui.api_client import ApiClient
from tooldb.schemas.tool_schemas import ToolCreate

client = ApiClient()

# Read:
tools = client.get_tools()
print(f"Tools: {len(tools)}")

# Write:
new_tool = client.create_tool(ToolCreate(name="API-CLIENT-TEST", tool_type="endmill"))
print(f"Created: {new_tool.id} — {new_tool.name}")

# Delete:
client.delete_tool(new_tool.id)
print("Deleted")
client.close()
```

**You should see:**
```
Tools: 4
Created: 7 — API-CLIENT-TEST
Deleted
```

**Change something:** Remove `response.raise_for_status()` from `create_tool`. Then send invalid data — `ToolCreate(name="", tool_type="endmill")`. Without `raise_for_status()`, a 422 from the server is silently treated as success and `response.json()` tries to parse the error body as a `ToolRead` — you get a Pydantic `ValidationError` with a confusing message. With `raise_for_status()`, you get `HTTPStatusError: 422 Unprocessable Entity` immediately, pointing at the HTTP layer. Add it back.

---

## Step 2 — Updating the Main Window

The main window currently holds a `ToolService` (or creates one on demand). Replace it with an `ApiClient`:

```python
# In tooldb_ui/main.py — change the constructor:

# OLD:
from tooldb.orm.session import SessionLocal
from tooldb.services.tool_service_orm import ToolService

# NEW:
from tooldb_ui.api_client import ApiClient
```

```python
# In __init__:

# OLD:
self._session = SessionLocal()
self._service = ToolService(self._session)

# NEW:
self._client = ApiClient()  # connects to localhost:8000 by default
```

```python
# In _load_tools — OLD:
tools = self._service.get_all_tools()

# NEW:
tools = self._client.get_tools()
```

```python
# In closeEvent — add cleanup:
def closeEvent(self, event):
    self._client.close()   # ← add this
    super().closeEvent(event)
```

### SAVE AND TRY

Start the API server in one terminal. Start the UI in another. Use the app normally.

**You should see:** The same tools, the same filters, the same table. All features work — but now each action makes an HTTP call instead of a direct service call.

**Change something:** Stop the API server. Try to use a feature in the UI (load tools, add a tool). You should see an error dialog or an exception. The UI needs error handling for network failures — that is the next step.

---

## Step 3 — Error Handling for Network Failures

The local service layer never had network errors. The API client does. Add a wrapper for the main window operations:

```python
# In main.py:

import httpx
from PySide6.QtWidgets import QMessageBox

def _load_tools(self) -> None:
    try:
        tools = self._client.get_tools()
    except httpx.ConnectError:
        QMessageBox.critical(self, "Connection Error",
                             "Cannot connect to the Tool Database server.\n"
                             "Make sure the server is running at http://localhost:8000")
        tools = []
    except httpx.HTTPStatusError as error:
        QMessageBox.critical(self, "Server Error",
                             f"Server returned {error.response.status_code}:\n{error.response.text}")
        tools = []

    self._model.set_tools(tools)
```

`httpx.ConnectError` — the server is not running or is unreachable.
`httpx.HTTPStatusError` — the server returned a 4xx or 5xx response.

Displaying a message box and showing an empty table is better than crashing. The user knows what went wrong and can act on it.

---

## Step 4 — What to Do When UI and API Disagree

**The version mismatch problem:** The desktop app (v1.0) calls `GET /tools`. The API (v2.0) removed a field that the UI expected. The UI tries to parse the response and gets a `ValidationError`.

**The correct approach:** API versioning — `/api/v1/tools` and `/api/v2/tools` as separate routes. The v1 routes remain until all clients migrate. This is future work — the current app has only one client.

**The practical defense now:** Wrap `model_validate` calls in try/except:

```python
def get_tools(self, ...) -> list[ToolRead]:
    response = self._client.get("/tools", params=params)
    response.raise_for_status()
    tools = []
    for item in response.json():
        try:
            tools.append(ToolRead.model_validate(item))
        except Exception as error:
            print(f"Skipping malformed tool: {error}")
    return tools
```

This is tolerant parsing — skip records that don't match, log the problem, continue with the valid ones. The same policy as the import pipeline (Lab 55): a bad record should not prevent the rest from loading.

---

## 🎯 Challenge: API URL from Settings

**You know:** `AppSettings` (Lab 71) stores configuration. `ApiClient` takes a `base_url` parameter. The server may not always be on `localhost:8000` — a shop floor might run it on a dedicated machine.

**Task:** Add an `api_url` setting to `AppSettings`:

```python
def api_url(self) -> str:
    return self._settings.value("api/url", "http://127.0.0.1:8000", type=str)

def set_api_url(self, url: str) -> None:
    self._settings.setValue("api/url", url)
```

Add an "API Server URL" field to `SettingsDialog` (Lab 71's challenge). When the user changes it and clicks OK, the main window creates a new `ApiClient` with the new URL. Warn the user if the new URL is unreachable (call `GET /health` and check the response).

---

<details>
<summary>▶ Show Solution</summary>

Add to `SettingsDialog.__init__`:

```python
self._api_url_edit = QLineEdit(self._settings.api_url())
```

Add to `_on_ok`:

```python
new_url = self._api_url_edit.text().strip()
# Test connectivity:
try:
    httpx.get(f"{new_url}/health", timeout=3.0).raise_for_status()
    self._settings.set_api_url(new_url)
    self.accept()
except Exception:
    QMessageBox.warning(self, "Cannot Reach Server",
                        f"Could not connect to {new_url}\n"
                        f"The URL was not saved. Check the address and try again.")
```

In the main window, after `SettingsDialog` closes with `Accepted`:

```python
def _on_settings_changed(self) -> None:
    self._client.close()
    self._client = ApiClient(base_url=self._app_settings.api_url())
    self._load_tools()
```

**Key insight:** The settings dialog tests connectivity before saving. This prevents the user from accidentally saving a bad URL that makes the app unusable on next launch. Testing at save-time (not at startup) gives the user immediate feedback and the opportunity to correct the mistake. The `GET /health` endpoint (Lab 74) exists exactly for this purpose — a lightweight, side-effect-free check that the server is alive.

</details>

---

## The Full Architecture

After Lab 79, the project has two independent deployable pieces:

**The API server** (`tooldb_api/`):
- Runs anywhere with Python and the dependencies
- Owns the database and all business logic
- Exposes a documented REST API
- Can serve any client — desktop, browser, mobile, script

**The desktop client** (`tooldb_ui/`):
- Runs on Windows after `pyinstaller` packaging (Lab 72)
- Has no database dependency — needs only `httpx`
- Connects to the API server over HTTP
- Uses the same Pydantic schemas for type safety

The service layer (`tooldb/`) is shared code — both the API server and any future clients can import from it.

---

## Final Check

| What to verify | How to verify |
|---|---|
| `ApiClient.get_tools()` returns `list[ToolRead]` | Type and contents match what the service returned |
| UI loads tools from the API | Start server + UI, verify tools appear |
| `ConnectError` shows a message box | Stop server, use UI — error dialog appears, UI stays open |
| UI no longer imports `SessionLocal` | `grep -r "SessionLocal" tooldb_ui/` — should find nothing |
| `client.close()` called on app exit | Add a print to `close()` — see it printed when the window closes |

---

## Quick Check Answers

**1. What does migrating to `httpx` do to the desktop app's dependency on SQLAlchemy?**
It eliminates it. The desktop app no longer imports `SessionLocal`, `ToolService`, or any SQLAlchemy model. It only needs `httpx` for HTTP calls and the Pydantic schemas for parsing responses. This means the desktop app could be distributed without SQLAlchemy installed — a much smaller dependency footprint. The `tooldb/` package (service layer + ORM) is still needed for the schema definitions, but a future step could separate those schemas into their own package for true independence.

**2. From the UI's perspective, what is the difference between `ApiClient.get_tools()` and `ToolService.get_all_tools()`?**
Latency and failure modes. Both return `list[ToolRead]`. But `ApiClient.get_tools()` makes a network call — it takes 1–100ms instead of microseconds, and it can fail with a connection error or a server error. The UI must handle failure cases that the local service never produced. The actual data type and structure is identical — this is the benefit of keeping the same schemas on both sides of the API boundary.

**3. The API server is not running — what should happen?**
The UI should display an error message explaining that it cannot connect to the server, and show an empty (or last-cached) tool list rather than crashing. The user should see enough information to know what to do: "Cannot connect to http://localhost:8000 — make sure the server is running." The app should remain open and usable for read-only operations if a cache is available, or clearly disabled if not. Crashing with an unhandled exception is never the right response to a predictable network failure.
