# Lesson 2: Community Members Listing

**What you will build**
An endpoint that returns a list of community members, backed by a real SQLite database file instead of hardcoded data. The problem we're solving: `homepage()` in Lesson 1 could only ever return the one fixed message baked into the code — nothing your app does can be remembered between requests, or between restarts, unless it's written somewhere that outlives the running Python process.

**What you need to know first**
Lesson 1 (routes, response models). Interlude A (references vs values — matters below, since a database connection is itself an object you'll pass around by reference).

**The Pipeline**
`Client Request → FastAPI (Routing) → db.py (Data Access) → SQLite (Storage) → Response`
Today adds the missing middle stage: something that talks to storage.

---

## Concept Unit: Persistent Storage and the SQLite Connection

### The Problem

Right now, if you wanted `homepage()` to return different data each time, your only option is a Python variable — and Python variables live in RAM, inside your running process. The moment that process stops (you restart the server, the machine reboots), everything held only in a variable is gone. We need a way to store data that survives the program itself ending.

### The failing test

Create/extend `tests/test_api.py`:

```python
def test_list_members_returns_seeded_data():
    response = client.get("/members")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "username" in data[0]
```

Run it:

```bash
pytest tests/
```

Output:

```text
FAILED tests/test_api.py::test_list_members_returns_seeded_data
404 != 200
```

*Why this fails:* there is no `/members` route yet, so FastAPI's default "not found" response comes back instead. This is our target for the rest of the lesson.

### Introduce the concept in isolation

Create `lab_sqlite.py`:

```python
import sqlite3

# A file-backed connection — data written here outlives this script
conn = sqlite3.connect("lab.db")
conn.execute("CREATE TABLE IF NOT EXISTS notes (text TEXT)")
conn.execute("INSERT INTO notes VALUES ('remember me')")
conn.commit()
conn.close()

# A brand new, separate connection, as if this were a totally different run
conn2 = sqlite3.connect("lab.db")
cursor = conn2.execute("SELECT text FROM notes")
print(cursor.fetchall())
conn2.close()
```

Run it twice in a row:

```bash
python lab_sqlite.py
python lab_sqlite.py
```

Output (first run):
```text
[('remember me',)]
```

Output (second run):
```text
[('remember me',), ('remember me',)]
```

*What this proves:* even though `conn` and `conn2` are two entirely separate Python objects — created in what's effectively two separate program runs — the second one sees data written by the first. Nothing about that data lived in a Python variable between the two `sqlite3.connect()` calls; it lived in the file `lab.db` on disk the whole time. Running the script a second time proves it further: the row from the *first* run is still there.

### Explain the mechanism

RAM (where your stack frames and heap objects from Interlude A live) is **volatile** — it's fast, but it's wiped the instant the process stops. A disk file is **non-volatile** — slower to read and write, but it survives the process ending entirely. `sqlite3.connect("lab.db")` doesn't load the whole database into a Python object; it opens a channel to a database *engine* that reads and writes that file directly. `conn.execute(...)` sends a command (written in SQL, a language for describing what to store or retrieve) through that channel to the engine, which does the actual disk work. This is why `conn` and `conn2` — different objects, different variables — see the same data: they're both just channels to the same underlying file, not containers holding the data themselves.

### Discard the throwaway example

Delete `lab_sqlite.py` and `lab.db`. We now build the real data layer.

### Project Change

* **Files affected:** Create `db.py`, `models.py`. Modify `main.py`, `schemas.py`.
* **Change type:** Add + Modify.
* **Location:** Project root.
* **Dependencies:** `sqlite3` is part of Python's standard library — no install needed.

### The New Code

```python
# db.py
import sqlite3

DB_PATH = "social.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS members (
            id INTEGER PRIMARY KEY,
            username TEXT NOT NULL
        )
    """)
    conn.execute("INSERT OR IGNORE INTO members (id, username) VALUES (1, 'ada')")
    conn.execute("INSERT OR IGNORE INTO members (id, username) VALUES (2, 'grace')")
    conn.commit()
    conn.close()
```

```python
# schemas.py — add
class Member(BaseModel):
    id: int
    username: str
```

```python
# main.py — add
from db import get_connection, init_db
from schemas import Member

init_db()

@app.get("/members", response_model=list[Member])
def list_members():
    conn = get_connection()
    rows = conn.execute("SELECT id, username FROM members").fetchall()
    conn.close()
    return [dict(row) for row in rows]
```

### The Updated Project

`db.py` (new file, entire contents — as above).

`schemas.py` (updated):

```python
from pydantic import BaseModel

class HomepageResponse(BaseModel):
    message: str

# ← new: shape of one community member
class Member(BaseModel):
    id: int
    username: str
```

`main.py` (updated):

```python
from fastapi import FastAPI
from schemas import HomepageResponse, Member
from db import get_connection, init_db

app = FastAPI()

# ← new: creates the table and seed data on startup
init_db()

@app.get("/", response_model=HomepageResponse)
def homepage():
    return {"message": "Welcome to the Developer Social Network"}

# ← new: reads real rows from social.db
@app.get("/members", response_model=list[Member])
def list_members():
    conn = get_connection()
    rows = conn.execute("SELECT id, username FROM members").fetchall()
    conn.close()
    return [dict(row) for row in rows]
```

### Mechanical walkthrough

1. `conn.row_factory = sqlite3.Row`: (first appearance). By default, SQLite returns each row as a plain tuple — `(1, 'ada')` — with no field names attached, so you'd have to remember that index `0` is the id and index `1` is the username. Setting `row_factory` changes what `fetchall()` gives you: rows that support both index *and* name access (`row["username"]`), which is what makes `dict(row)` below actually work correctly.
2. `CREATE TABLE IF NOT EXISTS`: (first appearance). SQL for "define this table's structure, but don't error if it already exists" — safe to run every time the app starts.
3. `INSERT OR IGNORE`: (first appearance). Adds a row, but silently does nothing if a row with that primary key already exists — this is what makes `init_db()` safe to call on every restart without duplicating seed data.
4. `conn.execute("SELECT id, username FROM members")`: (first appearance). `SELECT columns FROM table` is SQL's basic retrieval statement — read these specific columns from this table.
5. `.fetchall()`: (first appearance). Pulls every matching row from the engine back into Python, as a list.
6. `[dict(row) for row in rows]`: (already-established list syntax, new context). Converts each `sqlite3.Row` into a plain dict (`{"id": 1, "username": "ada"}`), because that's the shape `response_model=list[Member]` expects to validate against.
7. `response_model=list[Member]`: (first appearance, extends Lesson 1's `response_model`). Same enforcement mechanism as before, now applied to a *list* of a shape rather than a single one — every item must satisfy `Member`, not just the top-level response.
8. `conn.close()`: (first appearance). Releases the channel to the database file. Not closing it is a real resource leak — each open connection holds a file handle, and a busy server that never closes connections will eventually run out of them.

### CS Lens

**Volatile vs. non-volatile storage, and durability.** RAM (stack and heap, from Interlude A) is fast and volatile. Disk is slower and non-volatile. Every system you'll ever build makes an explicit tradeoff about what lives where — data you can afford to lose (a cache, a temp calculation) stays in RAM for speed; data you can't afford to lose (a user's post, their account) goes to disk. This isn't a SQLite-specific idea — it's the same reason your browser's undo history disappears on refresh but your saved bookmarks don't.

### SE Lens

**Separation of concerns: why `db.py` exists as its own file.** We could have written the `sqlite3.connect(...)` and `SELECT` calls directly inside `list_members()` in `main.py`. Putting them in `db.py` instead means `main.py`'s job stays "translate HTTP requests into calls," and `db.py`'s job is "know how to talk to storage." The tradeoff today is one extra file and one extra import for barely any benefit yet — but this boundary is exactly what will let us swap SQLite for something else later (Lesson 16 formalizes this as the Repository pattern) without touching a single route function.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 2 items

tests/test_api.py ..                                                     [100%]

============================== 2 passed in 0.05s ===============================
```

### Connecting sentence

We can list every member, but not one specific member by name or id — the next lesson adds a route parameter and a `WHERE` clause to narrow the query down.

---

## Closing

**Connect the pieces**
A `GET /members` request arrives, FastAPI routes it to `list_members()`. That function asks `db.py` for a connection — a channel to the `social.db` file on disk, not a copy of the data in memory. It sends a `SELECT` command through that channel; SQLite's engine reads the file and returns matching rows. Each row is converted to a dict, and `response_model=list[Member]` validates the whole list's shape before it's serialized to JSON. The data existed on disk before this request came in, and will still exist after the response is sent and the connection is closed.

**What breaks without this**
If `init_db()` used `CREATE TABLE` without `IF NOT EXISTS`, restarting the server (which re-runs `init_db()`) would immediately crash with "table already exists." If seeding used plain `INSERT` instead of `INSERT OR IGNORE`, every restart would silently duplicate Ada and Grace — you'd have 2 members after one restart, 4 after two, and an ever-growing junk table that "just happens" from restarting your dev server.

**Exercises**
1. Run `pytest tests/`, then stop and restart nothing — just run `pytest tests/` again. Confirm you still get exactly 2 members, not 4. This is `INSERT OR IGNORE` doing its job.
2. Open a Python shell, `import sqlite3; conn = sqlite3.connect("social.db"); print(conn.execute("SELECT * FROM members").fetchall())` — see the raw rows outside of FastAPI entirely, proving the data lives independently of your app.

**Definition of Done**
* [x] `/members` returns real rows from `social.db`, validated against `list[Member]`.
* [x] `init_db()` is safe to call on every startup without duplicating data.
* [x] Failing test written before the route existed; now passing.
* [x] Commit: `feat: members listing backed by persistent SQLite storage`

---

## Context Snapshot (End of Lesson 2)

**1. File Tree:**
```
main.py
schemas.py
db.py
social.db
tests/test_api.py
```

**2. Schema State:**
- `members (id INTEGER PRIMARY KEY, username TEXT NOT NULL)` — seeded with 2 rows.

**3. API Manifest:**
- `GET /` → `HomepageResponse {message: str}`
- `GET /members` → `list[Member] {id: int, username: str}`

**4. Dependencies:** fastapi, uvicorn, pydantic, pytest, httpx, sqlite3 (stdlib)

**5. Test State:** 2 tests, 2 passing.

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Volatile / non-volatile storage | L2 | RAM is wiped when the process stops; disk survives it |
| SQL | L2 | The language used to describe what to store or retrieve |
| Connection (`sqlite3.connect`) | L2 | A channel to the database engine, not a copy of the data |
| `row_factory` | L2 | Makes rows accessible by column name, not just position |
| `SELECT` | L2 | SQL statement for retrieving specific columns from a table |
| `CREATE TABLE IF NOT EXISTS` | L2 | Defines a table's structure without erroring if it already exists |
| `INSERT OR IGNORE` | L2 | Adds a row unless one with that key already exists |
| Separation of concerns | L2 | Each module has one job — `db.py` talks to storage, `main.py` handles HTTP |

**7. Lesson Completion State:**
- Completed: Lesson 1, Interlude A, Lesson 2
- Next: Lesson 3 — Viewing a User's Profile (routing parameters, `WHERE`, foreign keys, one-to-one, JOIN basics)

**8. Current Architecture State:**
- HTTP Layer: 2 routes
- Business Logic: not introduced
- Data Access: introduced (`db.py`)
- ORM: not introduced
- Authentication: not introduced
