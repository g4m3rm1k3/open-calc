# Python Tool Database — LAB 77 — Search and Filter Routes

**Prerequisites:** Lab 75 (CRUD routes). Lab 67–68 (FilterState, proxy filter). You have CRUD routes and filter logic from the desktop app. This lesson exposes filtering as API query parameters.

**What this lab adds:**
- Query parameters: `GET /tools?tool_type=endmill&min_diameter=6`
- `Optional` query parameters with defaults in FastAPI
- Translating HTTP query parameters to `FilterState` and to a SQLAlchemy query
- Pagination: `limit` and `offset` query parameters

**Time:** 40–50 minutes

---

## What You Will Build

A single endpoint that handles all filtering in one place:

```
GET /tools?tool_type=endmill&min_diameter=6&max_diameter=13&search=EM&limit=20&offset=0
```

Returns only the tools that match all filters, up to `limit` results starting at `offset`.

---

> **Quick Check — try to answer before reading:**
>
> 1. `GET /tools?tool_type=endmill` — where does `tool_type` live in the HTTP request? In the URL, the headers, or the body?
> 2. A query parameter is optional — `GET /tools` with no parameters should return all tools. How do you declare an optional parameter with a default in a FastAPI route function?
> 3. Returning all 10,000 tools in one response is slow for both the server and the client. What are the two numbers that define a "page" of results?
>
> *(Answers at the end of this lab)*

---

## Concept: Query Parameters

**What they are:** Key-value pairs appended to a URL after a `?`, separated by `&`. They are part of the URL, not the request body.

```
GET /tools?tool_type=endmill&min_diameter=6.0
                ↑ first param              ↑ second param
```

**The problem before:** The desktop app (Labs 67–68) applied filters via the proxy's `filterAcceptsRow()` — all data was already in memory. The API client sends a request and expects only the matching rows. The filter must happen in the database — not after fetching everything.

**The solution:** Add query parameters to the route function signature. FastAPI automatically binds URL query parameters to function parameters with matching names. Parameters declared as `Optional` with a default value do not need to be present in the URL.

**What it hides:** URL parsing, type coercion (the string "6.0" in the URL becomes a `float`), and validation. FastAPI validates query parameters the same way it validates path parameters and request bodies — invalid types return 422.

**You will see this again in:** Every REST API with search, filter, or pagination. `GET /users?role=admin&active=true` — filter users. `GET /products?category=tools&sort=price&page=2` — paginated filtered list. Query parameters for filtering are universal.

---

## Step 1 — Optional Query Parameters

**How FastAPI recognizes query parameters:** Function parameters that are not path parameters (not in `{}` in the URL) and not Pydantic models (not request bodies) are query parameters.

```python
from typing import Optional

@app.get("/tools")
def list_tools(
    tool_type   : Optional[str]   = None,    # ?tool_type=endmill
    min_diameter: Optional[float] = None,    # ?min_diameter=6.0
    max_diameter: Optional[float] = None,    # ?max_diameter=13.0
    search      : Optional[str]   = None,    # ?search=EM
    limit       : int             = 50,      # ?limit=20 — default 50
    offset      : int             = 0,       # ?offset=40 — default 0
):
    ...
```

`Optional[float] = None` — this parameter is not required. If absent from the URL, its value is `None`. If present (`?min_diameter=6.0`), FastAPI converts the string `"6.0"` to `float(6.0)`.

`limit: int = 50` — always present, defaults to 50 if not specified.

### SAVE AND TRY

Add these parameters to the existing `list_tools` route (replacing the no-parameter version from Lab 74). Add a `print()` to inspect what FastAPI passes in:

```python
@app.get("/tools", response_model=list[ToolRead])
def list_tools(
    tool_type   : Optional[str]   = None,
    min_diameter: Optional[float] = None,
    max_diameter: Optional[float] = None,
    search      : Optional[str]   = None,
    limit       : int             = 50,
    offset      : int             = 0,
    session: Session = Depends(get_db),
):
    print(f"tool_type={tool_type}, min={min_diameter}, max={max_diameter}, "
          f"search={search}, limit={limit}, offset={offset}")
    return ToolService(session).get_all_tools()   # filtering comes in Step 2
```

Navigate to `http://127.0.0.1:8000/tools?tool_type=endmill&min_diameter=6`.

**You should see** in the server terminal:
```
tool_type=endmill, min=6.0, max=None, search=None, limit=50, offset=0
```

The string `"6"` from the URL was converted to `float(6.0)`. `max_diameter` defaulted to `None`.

**Change something:** Navigate to `http://127.0.0.1:8000/tools?min_diameter=abc`. You should get a 422 response — `"abc"` cannot be converted to `float`. FastAPI's type validation caught it. Change it back to a valid float.

---

## Step 2 — Filtering in the Service Layer

The desktop app filtered in the proxy (in memory). The API filters in SQLAlchemy (in the database). Add a `search_tools` method to `ToolService`:

```python
# In tooldb/services/tool_service_orm.py — add method:

from sqlalchemy import and_, or_

def search_tools(
    self,
    tool_type   : str   | None = None,
    min_diameter: float | None = None,
    max_diameter: float | None = None,
    search      : str   | None = None,
    limit       : int          = 50,
    offset      : int          = 0,
) -> list[ToolRead]:
    """
    Returns tools matching all provided filters.
    None values are ignored (no filter applied for that field).
    """
    stmt = select(ToolORM)

    if tool_type:
        stmt = stmt.where(ToolORM.tool_type == tool_type)

    if min_diameter is not None:
        stmt = stmt.where(ToolORM.diameter >= min_diameter)

    if max_diameter is not None:
        stmt = stmt.where(ToolORM.diameter <= max_diameter)

    if search:
        stmt = stmt.where(ToolORM.name.ilike(f"%{search}%"))
        # ilike = case-insensitive LIKE — SQL equivalent of "name.lower() contains search.lower()"

    stmt = stmt.offset(offset).limit(limit)

    tools = self._session.scalars(stmt).all()
    return [ToolRead.model_validate(t) for t in tools]
```

`ToolORM.name.ilike(f"%{search}%")` — `ilike` is SQLAlchemy's case-insensitive LIKE. `%` is the SQL wildcard — it matches any characters. `%search%` means "search appears anywhere in the name." `ilike` vs `like`: `like` is case-sensitive, `ilike` is case-insensitive (SQL standard).

`stmt.offset(offset).limit(limit)` — pagination at the database level. `OFFSET 40 LIMIT 20` skips the first 40 rows and returns the next 20. This is the standard SQL pagination approach.

### SAVE AND TRY

```python
from tooldb.orm.session import SessionLocal
from tooldb.services.tool_service_orm import ToolService

with SessionLocal() as session:
    svc = ToolService(session)

    # All tools:
    all_tools = svc.search_tools()
    print(f"All: {len(all_tools)}")

    # Filter by type:
    endmills = svc.search_tools(tool_type="endmill")
    print(f"Endmills: {len(endmills)}")

    # Pagination — first 2:
    page1 = svc.search_tools(limit=2, offset=0)
    print(f"Page 1: {[t.name for t in page1]}")

    # Pagination — second 2:
    page2 = svc.search_tools(limit=2, offset=2)
    print(f"Page 2: {[t.name for t in page2]}")
```

**You should see** the correct counts and pagination behavior.

---

## Step 3 — Wire Filters to the Route

Update `list_tools` in `tooldb_api/routes/tools.py` to use `search_tools`:

```python
@router.get("/", response_model=list[ToolRead])
def list_tools(
    tool_type   : Optional[str]   = None,
    min_diameter: Optional[float] = None,
    max_diameter: Optional[float] = None,
    search      : Optional[str]   = None,
    limit       : int             = 50,
    offset      : int             = 0,
    session: Session = Depends(get_db),
):
    return ToolService(session).search_tools(
        tool_type=tool_type,
        min_diameter=min_diameter,
        max_diameter=max_diameter,
        search=search,
        limit=limit,
        offset=offset,
    )
```

The query parameters and the service method parameters have the same names — FastAPI injects them; you pass them through. No transformation needed.

### SAVE AND TRY

Open `/docs`. The `GET /tools` route now shows all six query parameters. Try:

- `http://127.0.0.1:8000/tools?tool_type=endmill`
- `http://127.0.0.1:8000/tools?search=EM&min_diameter=6&max_diameter=12`
- `http://127.0.0.1:8000/tools?limit=2&offset=0` (page 1)
- `http://127.0.0.1:8000/tools?limit=2&offset=2` (page 2)

**You should see** correctly filtered and paginated results.

---

## Concept: Pagination — `limit` and `offset`

**What it is:** Splitting a large result set into pages. The client requests page N by specifying how many results to skip (`offset`) and how many to return (`limit`).

**The problem before:** `GET /tools` with 10,000 tools returns all 10,000 in one response. Serializing 10,000 JSON objects takes time. Transmitting them takes bandwidth. The client waits for the full response before displaying anything.

**The solution:** `limit` and `offset` (sometimes called `page_size` and `page`):

```
Page 1: limit=20, offset=0   → rows 1–20
Page 2: limit=20, offset=20  → rows 21–40
Page 3: limit=20, offset=40  → rows 41–60
```

`offset = (page_number - 1) * page_size` converts page number to offset.

**What it hides:** The SQL `LIMIT` and `OFFSET` clauses. SQLAlchemy's `.limit()` and `.offset()` methods generate these automatically.

**The protected invariant:** The server never returns more than `limit` rows. A rogue client cannot cause a server to load all data by sending `limit=1000000`.

**Watch for:** Offset pagination has a performance problem at large offsets. `OFFSET 100000` forces the database to scan and skip 100,000 rows before returning results. For large datasets, cursor-based pagination (using the last ID seen as a starting point) is faster. For a tool database with thousands of tools, offset pagination is fine.

---

## Step 4 — Total Count Header

Clients need to know the total number of results to show "Page 3 of 47." Add a `X-Total-Count` response header:

```python
from fastapi import Response as FastAPIResponse

@router.get("/", response_model=list[ToolRead])
def list_tools(
    ...,   # all the same parameters
    session: Session = Depends(get_db),
    response: FastAPIResponse = None,   # ← inject the response object
):
    service = ToolService(session)

    # Get total count (without limit/offset):
    total = service.count_tools(tool_type=tool_type, search=search,
                                min_diameter=min_diameter, max_diameter=max_diameter)
    response.headers["X-Total-Count"] = str(total)

    return service.search_tools(tool_type=tool_type, min_diameter=min_diameter,
                                max_diameter=max_diameter, search=search,
                                limit=limit, offset=offset)
```

Add `count_tools` to `ToolService`:

```python
from sqlalchemy import func

def count_tools(self, tool_type=None, min_diameter=None,
                max_diameter=None, search=None) -> int:
    stmt = select(func.count(ToolORM.id))
    if tool_type:
        stmt = stmt.where(ToolORM.tool_type == tool_type)
    if min_diameter is not None:
        stmt = stmt.where(ToolORM.diameter >= min_diameter)
    if max_diameter is not None:
        stmt = stmt.where(ToolORM.diameter <= max_diameter)
    if search:
        stmt = stmt.where(ToolORM.name.ilike(f"%{search}%"))
    return self._session.scalar(stmt)
```

### SAVE AND TRY

Call `http://127.0.0.1:8000/tools?limit=2` and inspect the response headers (visible in the `/docs` UI under "Response headers" or in browser DevTools Network tab).

**You should see:** A header `X-Total-Count: 4` (or however many tools you have). The body contains 2 tools.

---

## 🎯 Challenge: Sorting Query Parameter

**You know:** SQLAlchemy `.order_by()`. FastAPI query parameters. The tools have `name`, `diameter`, and `tool_type` columns.

**Task:** Add a `sort_by` query parameter to `list_tools` and `search_tools`. Valid values: `"name"`, `"diameter"`, `"tool_type"`. Default: `"name"`. An invalid value (e.g., `"password"`) should return 422.

**Hint:** Use Python's `Enum` (Lab 61 concept) for the valid values — FastAPI validates and documents enums automatically:

```python
from enum import Enum

class ToolSortField(str, Enum):
    name      = "name"
    diameter  = "diameter"
    tool_type = "tool_type"
```

---

<details>
<summary>▶ Show Solution</summary>

```python
from enum import Enum

class ToolSortField(str, Enum):
    name      = "name"
    diameter  = "diameter"
    tool_type = "tool_type"
```

In the route:

```python
sort_by: ToolSortField = ToolSortField.name
```

In `search_tools`:

```python
def search_tools(self, ..., sort_by: str = "name") -> list[ToolRead]:
    _SORT_COLUMNS = {
        "name":      ToolORM.name,
        "diameter":  ToolORM.diameter,
        "tool_type": ToolORM.tool_type,
    }
    sort_col = _SORT_COLUMNS.get(sort_by, ToolORM.name)
    stmt = stmt.order_by(sort_col)
    ...
```

**Key insight:** Using `str, Enum` (a string enum) means FastAPI displays the valid values in the docs UI and validates against them automatically — `?sort_by=password` returns 422 without touching your code. The `_SORT_COLUMNS` dict maps the string value to the SQLAlchemy column object. This is the same data-driven dispatch pattern from Lab 70 — the dict is the branching logic.

</details>

---

## Final Check

| What to verify | How to verify |
|---|---|
| `?tool_type=endmill` filters correctly | Only endmills in response |
| `?min_diameter=abc` returns 422 | Type validation works |
| `?limit=2&offset=0` returns first 2 | Count and check names |
| `?limit=2&offset=2` returns next 2 | Different tools than page 1 |
| `X-Total-Count` header present | Check response headers in `/docs` or DevTools |
| No params returns all tools (up to default limit) | `GET /tools` returns up to 50 |

---

## Quick Check Answers

**1. Where does `tool_type` live in `GET /tools?tool_type=endmill`?**
In the URL, as part of the query string — after the `?`. Not in headers (which are metadata about the request), not in the body (which GET requests typically don't have). The query string is the portion of the URL after `?`. Each key=value pair is a query parameter. They are visible in the browser address bar, in logs, and in bookmarks — which means they should not contain sensitive data.

**2. How do you declare an optional query parameter with a default?**
`parameter_name: Optional[type] = default_value`. The `Optional[float]` type annotation tells Python (and FastAPI) that `None` is a valid value. The `= None` (or `= 50`) provides the default. If the parameter is absent from the URL, the default is used. FastAPI recognizes these as query parameters because they are not path parameters (no `{}` in the URL) and not Pydantic models (not request bodies).

**3. What two numbers define a page of results?**
`limit` (how many results per page) and `offset` (how many results to skip before starting). `limit=20, offset=40` returns items 41–60 — it skips the first 40 and returns the next 20. An alternative naming convention is `page_size` and `page` (where `page` is the page number, not the count to skip). Both are common. The `offset` approach is lower-level and maps directly to SQL; the `page` approach is more user-friendly but requires the client to know `page_size`.
