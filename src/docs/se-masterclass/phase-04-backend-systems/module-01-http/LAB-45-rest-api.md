# SE Masterclass — LAB-45 — REST API Design

**Language: Python (FastAPI)** — same module as LAB-44, now using the framework.

**Prerequisites:** LAB-44 (HTTP Protocol — everything FastAPI does automatically here, you already did by hand). LAB-17 (contracts — Pydantic models are LAB-17's `interface` pattern, enforced on real HTTP data).

**What this lab adds:**
- REST: treating URLs as RESOURCES (nouns) and HTTP methods as ACTIONS (verbs) on them
- FastAPI routing — LAB-44's `if path == ...` chain, replaced with a real dispatch mechanism
- Request/response validation via Pydantic — LAB-25's boundary validation, automated
- Full CRUD (Create, Read, Update, Delete) with the correct status code for each

**Time:** 90–110 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `POST /users` and `GET /users/5/delete` both COULD delete a user, technically. Which one follows REST conventions, and why does it matter?
> 2. A successful `POST` that CREATES a new resource conventionally returns status `201`, not `200`. What's the difference in MEANING?
> 3. If `PUT /users/5` is called TWICE with the identical body, should the end result differ from calling it once? What about `POST /users` called twice with the identical body?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `uvicorn main:app --reload` and testing with `curl` shows:

```
=== GET /users (list) ===
$ curl http://localhost:8000/users
[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]

=== GET /users/{id} (read one) ===
$ curl http://localhost:8000/users/1
{"id":1,"name":"Alice"}
$ curl -i http://localhost:8000/users/999
HTTP/1.1 404 Not Found
{"detail":"User 999 not found"}

=== POST /users (create) ===
$ curl -X POST http://localhost:8000/users -d '{"name":"Carol"}'
HTTP/1.1 201 Created
{"id":3,"name":"Carol"}

=== Validation: Bad Request Body ===
$ curl -X POST http://localhost:8000/users -d '{"wrong_field": 123}'
HTTP/1.1 422 Unprocessable Entity
{"detail":[{"loc":["body","name"],"msg":"field required", ...}]}

=== PUT /users/{id} (update, idempotent) ===
$ curl -X PUT http://localhost:8000/users/1 -d '{"name":"Alice Updated"}'
HTTP/1.1 200 OK
{"id":1,"name":"Alice Updated"}

=== DELETE /users/{id} ===
$ curl -i -X DELETE http://localhost:8000/users/1
HTTP/1.1 204 No Content
```

---

### Concept: Resources Are Nouns, Methods Are Verbs

**What it is:** REST (REpresentational State Transfer) organizes an API around RESOURCES — nouns, like `/users` or `/orders` — and uses HTTP METHODS to express the ACTION: `GET` (read), `POST` (create), `PUT`/`PATCH` (update), `DELETE` (remove). The URL never contains a VERB — `/users/5/delete` breaks this convention; `DELETE /users/5` follows it.

**The problem before:** `GET /getUsers`, `POST /createUser`, `POST /deleteUser/5` — encoding the action in the URL AND the method — is redundant and inconsistent (why is delete a `POST`? why does the URL repeat what the method already says?). Every API designed this way invents its own private conventions, making every new endpoint a fresh guessing game for whoever integrates with it.

**The solution:** ONE noun per resource type. The METHOD carries the verb.

```
GET    /users        -> list all users
GET    /users/5      -> read user 5
POST   /users        -> create a new user
PUT    /users/5      -> replace user 5 entirely
DELETE /users/5      -> remove user 5
```

**Project Application (The "Why" here):** This is LAB-09's dispatch table again, at the scale of an entire API: instead of a chain of `if path == '/users/5/delete'`, a well-designed REST API dispatches on `(method, path pattern)` PAIRS, exactly like LAB-13's state machine dispatched on `(state, event)` pairs.

---

## Step 1 — A Minimal FastAPI App

```bash
pip install fastapi uvicorn
```

```python
# main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello, World!"}
```

### SAVE AND TRY

```bash
uvicorn main:app --reload
```

```bash
curl http://localhost:8000/
```

**Expected:** `{"message":"Hello, World!"}`

**Confirm what FastAPI automated, compared to LAB-44:** `@app.get("/")` registers a route — LAB-44's `if path == '/': ...` chain, replaced. Returning a plain Python `dict` is AUTOMATICALLY converted to JSON with the correct `Content-Type: application/json` header and correctly computed `Content-Length` — every manual step from LAB-44's `build_response` happened, just invisibly.

---

## Step 2 — Resource Routes With Path Parameters

```python
users = {                                          # ← add: an in-memory "database" — a plain dict, LAB-04's hash map
    1: {"id": 1, "name": "Alice"},
    2: {"id": 2, "name": "Bob"},
}
next_id = 3

@app.get("/users")
def list_users():
    return list(users.values())

@app.get("/users/{user_id}")
def get_user(user_id: int):                          # ← add: FastAPI extracts {user_id} from the URL and CONVERTS it to int
    if user_id not in users:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    return users[user_id]
```

### SAVE AND TRY

```bash
curl http://localhost:8000/users
curl http://localhost:8000/users/1
curl -i http://localhost:8000/users/999
```

**Expected:**
```
=== GET /users (list) ===
[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]

=== GET /users/{id} (read one) ===
{"id":1,"name":"Alice"}

HTTP/1.1 404 Not Found
{"detail":"User 999 not found"}
```

**Confirm `user_id: int` is a REAL type conversion, not just a naming convention:** Try `curl http://localhost:8000/users/abc` — FastAPI responds with `422 Unprocessable Entity`, because `"abc"` cannot be converted to `int`. This is LAB-01's `Number("abc") = NaN` lesson, but enforced AUTOMATICALLY at the framework boundary instead of something you'd have to check by hand, the way LAB-44's raw parsing would have required.

---

## Step 3 — Request Bodies With Validation (Pydantic)

```python
from pydantic import BaseModel

class UserCreate(BaseModel):                          # ← add: LAB-17's interface pattern, enforced on REAL incoming JSON
    name: str

@app.post("/users", status_code=201)                    # ← add: 201, not the default 200 — see Concept box below
def create_user(user: UserCreate):
    global next_id
    new_user = {"id": next_id, "name": user.name}
    users[next_id] = new_user
    next_id += 1
    return new_user
```

### SAVE AND TRY

```bash
curl -i -X POST http://localhost:8000/users -H "Content-Type: application/json" -d '{"name":"Carol"}'
```

**Expected:**
```
=== POST /users (create) ===
HTTP/1.1 201 Created
{"id":3,"name":"Carol"}
```

Now send a malformed body:

```bash
curl -i -X POST http://localhost:8000/users -H "Content-Type: application/json" -d '{"wrong_field": 123}'
```

**Expected:**
```
=== Validation: Bad Request Body ===
HTTP/1.1 422 Unprocessable Entity
{"detail":[{"loc":["body","name"],"msg":"field required", ...}]}
```

**Confirm `UserCreate` is doing EXACTLY LAB-25's `validateConfig` job, automatically:** Declaring `class UserCreate(BaseModel): name: str` means FastAPI validates EVERY incoming request body against this shape BEFORE `create_user`'s code ever runs — a missing `name` field is rejected with a CLEAR error (LAB-09's precision instinct) at the BOUNDARY, exactly like LAB-25's config validation ran before the rest of the application ever touched potentially-broken data.

---

### Concept: Status Codes That Actually Mean Something

**What it is:** `200 OK` means "success, here's the result." `201 Created` means "success, AND I made a new resource — here it is." `204 No Content` means "success, and there is deliberately NOTHING to return." Using the RIGHT code isn't decoration — API clients (and automated tools) make real decisions based on it.

---

## Step 4 — Full CRUD With Correct Status Codes

```python
class UserUpdate(BaseModel):
    name: str

@app.put("/users/{user_id}")
def update_user(user_id: int, user: UserUpdate):
    from fastapi import HTTPException
    if user_id not in users:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    users[user_id] = {"id": user_id, "name": user.name}
    return users[user_id]

@app.delete("/users/{user_id}", status_code=204)          # ← add: 204 — success, nothing to return
def delete_user(user_id: int):
    from fastapi import HTTPException
    if user_id not in users:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    del users[user_id]
    return None
```

### SAVE AND TRY

```bash
curl -X PUT http://localhost:8000/users/1 -H "Content-Type: application/json" -d '{"name":"Alice Updated"}'
curl -i -X DELETE http://localhost:8000/users/1
```

**Expected:**
```
=== PUT /users/{id} (update, idempotent) ===
{"id":1,"name":"Alice Updated"}

=== DELETE /users/{id} ===
HTTP/1.1 204 No Content
```

**Confirm `PUT` is idempotent — call it 3 times in a row with the SAME body.** Each call returns the SAME result (`{"id":1,"name":"Alice Updated"}`), and the SERVER'S final state is identical regardless of whether `PUT` was called once or three times — this is what "idempotent" means: repeating the SAME request produces the SAME end result, safely.

---

## 🎯 Challenge: Nested Resources and Query Parameters

**You know:** A resource can contain SUB-resources (`/users/5/orders` — "orders belonging to user 5"), and query parameters (`?status=active`) filter a collection without needing a new endpoint per filter.

**Task:** Add `GET /users/{user_id}/orders?status=<value>` that returns orders for a specific user, optionally filtered by status.

<details>
<summary>▶ Show Solution</summary>

```python
orders = [
    {"id": 1, "user_id": 1, "status": "shipped"},
    {"id": 2, "user_id": 1, "status": "pending"},
    {"id": 3, "user_id": 2, "status": "shipped"},
]

from typing import Optional

@app.get("/users/{user_id}/orders")
def get_user_orders(user_id: int, status: Optional[str] = None):   # ← query param, with a default — LAB-01's default-parameter pattern
    result = [o for o in orders if o["user_id"] == user_id]
    if status:
        result = [o for o in result if o["status"] == status]
    return result

# GET /users/1/orders            -> both of user 1's orders
# GET /users/1/orders?status=shipped -> only the shipped one
```

**Key insight:** `status: Optional[str] = None` is FastAPI's way of saying "this is an OPTIONAL query parameter" — appearing in the URL as `?status=...` when present, and simply absent (defaulting to `None`) when not. This mirrors LAB-25's layered config defaults: the ENDPOINT works correctly whether or not the caller specifies the extra filter, with a sensible default behavior (return everything) when they don't.

</details>

---

## Mental Model: LAB-44 vs. LAB-45, Side by Side

| LAB-44 (raw) | LAB-45 (FastAPI) |
|---|---|
| `if parsed['path'] == '/': ...` | `@app.get("/")` |
| Manual `Content-Length`/`Content-Type` | Automatic, from the return value's type |
| No validation — trust the body blindly | Pydantic models — automatic, boundary-enforced validation |
| Hardcoded status codes in `build_response` | `status_code=201` parameter, or automatic `200`/`422`/`500` |

**Where you will see this again:** LAB-46 (Auth Basics) adds authentication to routes exactly like these. LAB-50 (Auth Service) builds a full, production-shaped auth system on this exact foundation.

---

## Final Check

| Feature | How to verify |
|---|---|
| `GET /users` lists all users; `GET /users/{id}` returns one or a 404 | Step 2 |
| `POST /users` creates a new user with status `201` | Step 3 |
| A malformed request body is rejected with `422` and a clear error | Step 3 |
| `PUT /users/{id}` is genuinely idempotent — repeated calls produce the same result | Step 4 |
| `DELETE /users/{id}` returns `204` with no body | Step 4 |
| A nested resource endpoint with an optional query filter works correctly | Challenge |

---

## Quick Check Answers

**1. `POST /users` vs. `GET /users/5/delete` for deleting — which follows REST, and why does it matter?**

`DELETE /users/5` is the REST-conventional way — the noun (`/users/5`) identifies WHAT, and the HTTP method (`DELETE`) identifies the ACTION, with no verb embedded in the URL itself. `GET /users/5/delete` breaks this in two ways: it puts the verb IN the path (redundant with a proper method choice), and using `GET` for something DESTRUCTIVE is dangerous — `GET` requests are supposed to be safe to retry, cache, or pre-fetch, and a caching proxy or browser pre-fetcher could accidentally trigger a delete just by "reading" the URL.

**2. `201 Created` vs. `200 OK` — what's the difference in meaning?**

`200 OK` means "the request succeeded, here is a result" — generic success. `201 Created` means SPECIFICALLY "the request succeeded AND a new resource now exists as a result" — a more precise signal that lets client code (and tooling) distinguish "I fetched something" from "I just created something new," which matters for things like knowing whether to update a local cache with a brand-new item versus just refreshing an existing one.

**3. `PUT` called twice vs. `POST` called twice with the same body — same result?**

`PUT` (Step 4) is IDEMPOTENT by convention — calling it once or three times with the same body should leave the resource in the EXACT same final state (`{"id":1,"name":"Alice Updated"}`, regardless of call count). `POST` (Step 3) is generally NOT idempotent — calling `POST /users` with `{"name":"Carol"}` twice creates TWO separate users with two different IDs, because `POST`'s whole purpose is "create a NEW thing," and doing that twice legitimately produces two things, not one.

---

*Next: [LAB-46 — Authentication Basics](LAB-46-auth-basics.md) — Python (FastAPI), same module*
