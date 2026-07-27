# Lesson 4: Creating a Post

**What you will build**
A `POST /posts` endpoint that accepts new post content from a client and writes it into a new `posts` table, linked to the member who wrote it. Every route so far has only ever *read* data that `init_db()` put there. This is the first time data enters the system from outside — which changes what we have to worry about.

**What you need to know first**
Lesson 3 (foreign keys, `JOIN`). Lesson 1 (Pydantic `BaseModel`, but used so far only for *responses* — today we use it for the opposite direction).

---

## Concept Unit: POST, Request Bodies, and Input Validation

### The Problem

Every route so far follows the same shape: client asks, server answers, nothing changes. A social network needs the reverse direction too — a client *sending* the server new data to store. `GET` requests can carry a little information in the URL (as we saw with `{member_id}`), but URLs are a poor place to send something like an entire post's text — there are practical length limits, and it would show up in browser history and server logs, which is a bad place for arbitrary user content to sit. We need a channel designed to carry a real payload.

### The failing test

```python
def test_create_post():
    response = client.post("/posts", json={"author_id": 1, "content": "Hello, network!"})
    assert response.status_code == 201
    data = response.json()
    assert data["content"] == "Hello, network!"
    assert "id" in data

def test_create_post_rejects_empty_content():
    response = client.post("/posts", json={"author_id": 1, "content": ""})
    assert response.status_code == 422
```

Run it:

```bash
pytest tests/
```

```text
FAILED tests/test_api.py::test_create_post
404 != 201
```

*Why this fails:* no `/posts` route exists yet, in either direction.

### Introduce the concept in isolation

Create `lab_post.py`:

```python
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()

class Message(BaseModel):
    text: str

@app.post("/echo")
def echo(message: Message):
    return {"you_sent": message.text, "length": len(message.text)}

client = TestClient(app)
print(client.post("/echo", json={"text": "hi"}).json())
print(client.post("/echo", json={"wrong_field": "hi"}).status_code)
```

Run it:

```bash
python lab_post.py
```

Output:

```text
{'you_sent': 'hi', 'length': 2}
422
```

*What this proves:* declaring `message: Message` as a function *parameter* (not a `response_model=`) tells FastAPI to read the request's JSON body, validate it against `Message`, and hand you back an actual Python object with real attributes (`message.text`) — not a raw dict you'd have to trust and unpack yourself. When the body didn't match the shape (`wrong_field` instead of `text`), FastAPI rejected it with `422` *before* `echo()`'s code ever ran — the validation happens at the boundary, not inside your logic.

### Explain the mechanism

This is the same `BaseModel` mechanism from Lesson 1, used in the opposite direction. `response_model` checks data *leaving* your function; a `BaseModel` typed as a parameter checks data *entering* it. Both are the same underlying idea — Pydantic enforcing a shape — applied at the two different boundaries where untrusted or unverified data crosses into your code: what your function returns, and what it receives. Data entering from a client is the more dangerous of the two, because unlike your own `return` statement, you don't control what a client actually sends — it could be malformed, incomplete, or actively malicious, which is exactly why "validate before insert" matters and isn't optional.

### Discard the throwaway example

Delete `lab_post.py`. Now build the real `posts` table and endpoint.

### Project Change

* **Files affected:** `db.py`, `schemas.py`, `main.py`.
* **Change type:** Modify.

### The New Code

```python
# db.py — add inside init_db()
conn.execute("""
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY,
        author_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        FOREIGN KEY (author_id) REFERENCES members(id)
    )
""")
```

```python
# schemas.py — add
from pydantic import BaseModel, Field

# Input shape: what a client is allowed to send us
class PostCreate(BaseModel):
    author_id: int
    content: str = Field(min_length=1)

# Output shape: what we send back — deliberately different from PostCreate
class PostRead(BaseModel):
    id: int
    author_id: int
    content: str
```

```python
# main.py — add
@app.post("/posts", response_model=PostRead, status_code=201)
def create_post(post: PostCreate):
    conn = get_connection()
    cursor = conn.execute(
        "INSERT INTO posts (author_id, content) VALUES (?, ?)",
        (post.author_id, post.content),
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"id": new_id, "author_id": post.author_id, "content": post.content}
```

### The Updated Project

(Excerpts shown above are the complete additions; everything from Lessons 1-3 is unchanged.)

### Mechanical walkthrough

1. `Field(min_length=1)`: (first appearance). Adds a validation rule *beyond* just "must be a string" — Pydantic will reject an empty string before `create_post()` ever runs, which is exactly what makes `test_create_post_rejects_empty_content` pass without a single `if` statement in our own code.
2. `class PostCreate` / `class PostRead`: (first appearance of the input/output split). `PostCreate` has no `id` field — a client can't invent their own id, the database assigns it. `PostRead` has `id` because *we* know it after the insert. Using two different classes for "what comes in" and "what goes out," even though they overlap, keeps each one honest about exactly what it represents.
3. `def create_post(post: PostCreate):`: (already-established parameter-validation pattern from the isolation example, now doing real work).
4. `INSERT INTO posts (author_id, content) VALUES (?, ?)`: (first appearance of `INSERT` with explicit columns, extending the `?`-placeholder pattern from `WHERE` in Lesson 3). Writes a new row; `id` is omitted because it's an `INTEGER PRIMARY KEY`, which SQLite auto-assigns.
5. `cursor.lastrowid`: (first appearance). After an `INSERT`, this holds the id SQLite just assigned — the only way to know it, since we never specified it ourselves.
6. `status_code=201`: (first appearance). `201 Created` is the HTTP convention for "a new resource now exists," distinct from `200 OK`'s "here's some existing data." Using it correctly means anything consuming this API (a frontend, another service, an AI agent calling it) can tell the two situations apart without inspecting the response body.

### CS Lens

**Idempotency.** Calling `GET /members/1` five times in a row has the same effect as calling it once — it doesn't change anything, so it's *idempotent*. Calling `POST /posts` five times with the same content creates five separate posts — it is *not* idempotent, each call changes the system's state further. This distinction is why `GET` requests can be safely retried automatically by browsers and networking code, and why `POST` requests generally can't be — retrying a failed `POST` risks creating a duplicate. It's a real design axis you'll keep hitting: does calling this again change anything more?

### SE Lens

**Trust boundaries, and why validation happens before, not during, business logic.** `content: str = Field(min_length=1)` means `create_post()`'s own code never has to check `if not post.content: raise ...` — by the time that function runs, the guarantee already holds. This matters more as logic grows: mixing "is this input even valid" checks into the same function as "what do we do with valid input" makes both harder to read and easier to get subtly wrong. Push validation to the boundary; let the inside of the function assume the input is already trustworthy.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 7 items

tests/test_api.py .......                                                [100%]

============================== 7 passed in 0.08s ===============================
```

### Connecting sentence

One design shortcut here is worth naming honestly: `author_id` is currently something the *client* tells us, which means anyone could claim to be posting as Ada. That's fine for now — there's no login system yet — but Lesson 14 will replace this with an id derived from an actual authenticated session, and this exact endpoint is what we'll come back and fix.

---

## Closing

**Connect the pieces**
`POST /posts` arrives with a JSON body. FastAPI validates it against `PostCreate` before `create_post()` runs at all — an empty `content` never reaches our code. Valid data becomes a real `INSERT`, SQLite assigns and returns the new row's id via `cursor.lastrowid`, and the response is reshaped into `PostRead` (a different, output-only shape) and sent back with `201`, signaling a new resource was created rather than an existing one retrieved.

**What breaks without this**
Without `Field(min_length=1)`, an empty post would be silently accepted and stored — probably fine today, but exactly the kind of missing constraint that becomes a real bug once posts start rendering in a feed as blank, confusing entries. Without splitting `PostCreate`/`PostRead`, a client could include `"id": 99999` in their request; depending on how carelessly that dict was used, it could overwrite an existing post's data instead of creating a new one.

**Exercises**
1. Send a `POST /posts` with `author_id` set to an id that doesn't exist in `members` (e.g. `999`). Notice it currently succeeds — the foreign key is declared, but SQLite only *enforces* foreign keys when explicitly turned on per connection (`PRAGMA foreign_keys = ON`), which we haven't done yet. Add that line to `get_connection()` in `db.py`, rerun, and watch the same request now fail.
2. Add a `test_create_post_rejects_missing_author` test and confirm the behavior after your fix from exercise 1.

**Definition of Done**
* [x] `POST /posts` validates input via `PostCreate`, rejects empty content with `422`.
* [x] A new row is inserted and its real id returned via `PostRead` with status `201`.
* [x] Failing tests written first for both the happy path and the validation rejection.
* [x] Commit: `feat: create post endpoint with input/output schema split`

---

## Context Snapshot (End of Lesson 4)

**1. File Tree:** unchanged filenames from Lesson 3.

**2. Schema State:**
- `members`, `bios` (unchanged from Lesson 3)
- `posts (id INTEGER PRIMARY KEY, author_id INTEGER NOT NULL, content TEXT NOT NULL, FOREIGN KEY (author_id) REFERENCES members(id))`

**3. API Manifest:**
- `GET /`, `GET /members`, `GET /members/{id}`, `GET /members/{id}/profile` (unchanged)
- `POST /posts` → accepts `PostCreate`, returns `PostRead`, status `201`

**4. Dependencies:** unchanged from Lesson 2.

**5. Test State:** 7 tests, 7 passing.

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Request body | L4 | Data sent by the client in a POST, validated against a `BaseModel` parameter |
| Input vs. output schema split | L4 | Separate classes for what a client may send vs. what the server sends back |
| `Field(min_length=...)` | L4 | Validation rule beyond basic type, enforced before the route's own code runs |
| `INSERT` | L4 | SQL statement that adds a new row |
| `cursor.lastrowid` | L4 | The id SQLite assigned to the row just inserted |
| `201 Created` | L4 | HTTP status for "a new resource now exists," distinct from `200 OK` |
| Idempotency | L4 | Whether repeating a request changes system state further (POST) or not (GET) |
| Trust boundary | L4 | The point where unverified external input becomes validated, trustworthy data |

**7. Lesson Completion State:**
- Completed: Lesson 1, Interlude A, Lesson 2, Lesson 3, Lesson 4
- Next: Lesson 5 — Seeing My Feed (one-to-many, `ORDER BY`, pagination, JOINs)

**8. Current Architecture State:**
- HTTP Layer: 5 routes (4 GET, 1 POST)
- Business Logic: not introduced
- Data Access: `db.py`, first `INSERT` path
- ORM: not introduced
- Authentication: not introduced (flagged above — `author_id` is currently client-supplied, revisited in Lesson 14)
