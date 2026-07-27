# Lesson 3: Viewing a User's Profile

**What you will build**
A route that returns one specific member's profile by id, plus a `bio` that lives in a *separate* table linked to that member — the first foreign key and `JOIN` in the project. The problem we're solving: `/members` gives you everyone, undifferentiated. A real app needs to answer "show me *this specific* user," and needs a way to relate two pieces of data (a member, and their bio) that make sense to store separately.

**What you need to know first**
Lesson 2 (SQLite connections, `SELECT`, `response_model`).

---

## Concept Unit: Route Parameters and `WHERE`

### The Problem

`/members` runs one fixed query no matter what. To get *one* member, we need the URL itself to carry information — which id we want — and the SQL query to narrow its results based on that information instead of returning everything.

### The failing test

```python
def test_get_single_member_by_id():
    response = client.get("/members/1")
    assert response.status_code == 200
    assert response.json()["username"] == "ada"

def test_get_nonexistent_member_returns_404():
    response = client.get("/members/9999")
    assert response.status_code == 404
```

Run it:

```bash
pytest tests/
```

Output:

```text
FAILED tests/test_api.py::test_get_single_member_by_id
404 != 200
```

*Why this fails:* there's no route matching `/members/1` yet — FastAPI has no idea `1` is meant to be an id rather than part of a fixed path.

### Introduce the concept in isolation

Create `lab_params.py`:

```python
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/echo/{value}")
def echo(value: str):
    return {"you_sent": value}

client = TestClient(app)
print(client.get("/echo/hello").json())
print(client.get("/echo/42").json())
```

Run it:

```bash
python lab_params.py
```

Output:

```text
{'you_sent': 'hello'}
{'you_sent': '42'}
```

*What this proves:* the `{value}` segment in the path isn't literal text to match — it's a placeholder. Whatever text appears in that position of the actual URL gets passed into `echo()` as the `value` argument, by name. FastAPI is doing the matching and extraction for you; you never parse the URL string yourself.

### Discard the throwaway example

Delete `lab_params.py`. Now use this for a real member id, filtering the SQL query instead of returning everything.

### Project Change

* **Files affected:** `main.py`.
* **Change type:** Modify (add a new route).
* **Location:** Below `list_members()`.

### The New Code

```python
from fastapi import HTTPException

@app.get("/members/{member_id}", response_model=Member)
def get_member(member_id: int):
    conn = get_connection()
    row = conn.execute(
        "SELECT id, username FROM members WHERE id = ?", (member_id,)
    ).fetchone()
    conn.close()
    if row is None:
        raise HTTPException(status_code=404, detail="Member not found")
    return dict(row)
```

### The Updated Project

`main.py` (relevant excerpt):

```python
from fastapi import FastAPI, HTTPException
from schemas import HomepageResponse, Member
from db import get_connection, init_db

app = FastAPI()
init_db()

@app.get("/", response_model=HomepageResponse)
def homepage():
    return {"message": "Welcome to the Developer Social Network"}

@app.get("/members", response_model=list[Member])
def list_members():
    conn = get_connection()
    rows = conn.execute("SELECT id, username FROM members").fetchall()
    conn.close()
    return [dict(row) for row in rows]

# ← new
@app.get("/members/{member_id}", response_model=Member)
def get_member(member_id: int):
    conn = get_connection()
    row = conn.execute(
        "SELECT id, username FROM members WHERE id = ?", (member_id,)
    ).fetchone()
    conn.close()
    if row is None:
        raise HTTPException(status_code=404, detail="Member not found")
    return dict(row)
```

### Mechanical walkthrough

1. `@app.get("/members/{member_id}")`: (already-established decorator pattern, new placeholder). `{member_id}` extracts whatever's in that URL segment.
2. `def get_member(member_id: int):`: (first appearance of parameter type coercion). FastAPI doesn't just hand you the raw text — it converts it to `int` based on the annotation, *and* rejects the request automatically with a `422` error if the text isn't a valid integer (try `/members/abc` later and see this yourself).
3. `WHERE id = ?`: (first appearance). SQL's filtering clause — narrows `SELECT` results to rows matching a condition, instead of returning the whole table.
4. `?` and `(member_id,)`: (already established from your earlier NexusInventory work, restated here) — the placeholder-and-tuple pattern prevents SQL injection and lets SQLite reuse a cached query plan, since the query string itself never changes, only the bound value.
5. `.fetchone()`: (first appearance, contrast with `.fetchall()`). Returns exactly one row, or `None` if nothing matched — appropriate here because an id is a primary key, so at most one row can ever match.
6. `if row is None: raise HTTPException(...)`: (first appearance). `HTTPException` is FastAPI's mechanism for returning a non-200 response with a specific status and message, from anywhere inside a route function.

### CS Lens

**Linear search vs. indexed lookup.** `WHERE id = ?` against a primary key doesn't scan every row one by one — SQLite automatically builds an index on primary keys, letting it jump almost directly to the matching row, similar in spirit to how a hash map (which you'll build from scratch in an upcoming interlude) finds a value without checking every entry. Contrast this with `WHERE username = ?` on a column with no index — that *would* scan every row. We'll make this cost visible directly with `EXPLAIN QUERY PLAN` in Lesson 12.

### SE Lens

**Fail loudly and specifically, at the boundary.** Returning `404` with a clear message when `member_id` doesn't exist is a deliberate design choice, not the "default" behavior — if we didn't check for `None`, `dict(None)` would throw an unrelated, confusing Python error deep inside the function instead of a clean, expected HTTP response. Handling the "not found" case explicitly is what separates an endpoint that fails predictably from one that fails mysteriously.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 4 items

tests/test_api.py ....                                                   [100%]

============================== 4 passed in 0.06s ===============================
```

### Connecting sentence

We can fetch one member by id — but their profile is still just a username. A real profile needs more data, and that data belongs in its own table, linked back to `members`.

---

## Concept Unit: Foreign Keys and a One-to-One JOIN

### The Problem

We could add a `bio` column directly to `members`. But bios are optional, often large, and conceptually a different kind of thing than "who this member is" — mixing them into one table makes the table represent two ideas at once. We want two tables that are related, not one table doing double duty.

### The failing test

```python
def test_member_profile_includes_bio():
    response = client.get("/members/1/profile")
    assert response.status_code == 200
    assert response.json()["bio"] == "Mathematician and programmer."
```

Run it:

```bash
pytest tests/
```

```text
FAILED tests/test_api.py::test_member_profile_includes_bio
404 != 200
```

### Introduce the concept in isolation

Create `lab_join.py`:

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT)")
conn.execute("CREATE TABLE bios (author_id INTEGER, text TEXT)")
conn.execute("INSERT INTO authors VALUES (1, 'Ada')")
conn.execute("INSERT INTO bios VALUES (1, 'Wrote the first algorithm.')")

rows = conn.execute("""
    SELECT authors.name, bios.text
    FROM authors
    JOIN bios ON authors.id = bios.author_id
""").fetchall()

print(rows)
```

Run it:

```bash
python lab_join.py
```

Output:

```text
[('Ada', 'Wrote the first algorithm.')]
```

*What this proves:* two separate tables, queried together in a single `SELECT`, produce one combined row — as if they'd always been one table — by matching `authors.id` against `bios.author_id`. Nothing links them structurally yet in this throwaway example; the `JOIN ... ON` condition is doing all the work of relating them, each time the query runs.

### Discard the throwaway example

Delete `lab_join.py`. In the real project, we'll also declare the relationship structurally with a `FOREIGN KEY`, not just rely on a matching `JOIN ... ON` condition.

### Project Change

* **Files affected:** `db.py`, `schemas.py`, `main.py`.
* **Change type:** Modify.

### The New Code

```python
# db.py — add inside init_db(), after the members table
conn.execute("""
    CREATE TABLE IF NOT EXISTS bios (
        member_id INTEGER,
        text TEXT NOT NULL,
        FOREIGN KEY (member_id) REFERENCES members(id)
    )
""")
conn.execute("INSERT OR IGNORE INTO bios (rowid, member_id, text) VALUES (1, 1, 'Mathematician and programmer.')")
```

```python
# schemas.py — add
class Profile(BaseModel):
    id: int
    username: str
    bio: str
```

```python
# main.py — add
@app.get("/members/{member_id}/profile", response_model=Profile)
def get_member_profile(member_id: int):
    conn = get_connection()
    row = conn.execute("""
        SELECT members.id, members.username, bios.text AS bio
        FROM members
        JOIN bios ON members.id = bios.member_id
        WHERE members.id = ?
    """, (member_id,)).fetchone()
    conn.close()
    if row is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return dict(row)
```

### The Updated Project

(Excerpts shown — full files now contain both routes from this lesson plus everything from Lessons 1-2.)

### Mechanical walkthrough

1. `FOREIGN KEY (member_id) REFERENCES members(id)`: (first appearance, matches the pattern you already saw in NexusInventory's self-referencing table — here linking *two different* tables instead of one table to itself). Declares structurally that every `bios.member_id` must correspond to a real row in `members`, and SQLite will reject an insert that violates it.
2. `bios.text AS bio`: (first appearance). Renames a column in the *output* of the query — the table column is `text`, but we want the JSON key to be `bio`, matching our `Profile` schema.
3. `JOIN bios ON members.id = bios.member_id`: (already established from the isolation example). Combines matching rows from both tables into one result row per match.
4. `WHERE members.id = ?`: (already established). Filters the *joined* result down to one member, same mechanism as the previous unit, now applied after the join instead of on a single table.

### CS Lens

**Normalization.** Splitting "who this member is" and "what they wrote about themselves" into two tables, related by a key, is the core idea behind relational database normalization: each table represents exactly one concept, and relationships between concepts are explicit links rather than duplicated or crammed-together data. The tradeoff, which you're already seeing structurally, is that reading combined data now requires a `JOIN` instead of a single-table `SELECT`.

### SE Lens

**One-to-one relationships, and why not just add a column.** A `bio` column directly on `members` would work today, but it commits every member row to always having bio-related storage even if most bios are empty, and it means "profile" and "identity" can never be treated, secured, or evolved separately (e.g., letting bios be edited by a moderation system later, independent of the identity table). The `JOIN` costs a small amount of query complexity in exchange for keeping the two concepts genuinely separate.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 5 items

tests/test_api.py .....                                                  [100%]

============================== 5 passed in 0.07s ===============================
```

### Connecting sentence

Members can now have linked data in a second table — the next lesson lets users actually *create* new data (posts) instead of only reading seeded rows, which means our first `INSERT` coming from user input, not from `init_db()`.

---

## Closing

**Connect the pieces**
`GET /members/1/profile` arrives, FastAPI extracts `member_id=1` from the path and coerces it to `int`. The route sends one SQL statement that joins `members` and `bios` on the foreign key relationship, filtered to id `1`. SQLite returns one combined row (or none, triggering our `404`), which is reshaped by the `AS bio` alias to match `Profile` exactly, validated, and returned.

**What breaks without this**
If the `FOREIGN KEY` constraint were absent and someone inserted a bio with `member_id = 999` (no such member), that row would sit in the database silently, findable by nothing — no member's profile query would ever join to it, and no error would ever have warned you it was orphaned data.

**Exercises**
1. Try `GET /members/1` (from the first Concept Unit) and `GET /members/1/profile` side by side — confirm the first is missing `bio` and the second has it, from two structurally different queries.
2. Add a bio for `grace` (`member_id = 2`) in `init_db()`, restart, and confirm `/members/2/profile` returns it.

**Definition of Done**
* [x] `/members/{id}` returns one member or a `404`.
* [x] `/members/{id}/profile` joins `members` and `bios` via a real foreign key.
* [x] Failing tests written before each route existed.
* [x] Commit: `feat: single-member lookup and joined profile endpoint`

---

## Context Snapshot (End of Lesson 3)

**1. File Tree:** unchanged filenames from Lesson 2 (`main.py`, `schemas.py`, `db.py`, `social.db`, `tests/test_api.py`).

**2. Schema State:**
- `members (id INTEGER PRIMARY KEY, username TEXT NOT NULL)`
- `bios (member_id INTEGER, text TEXT NOT NULL, FOREIGN KEY (member_id) REFERENCES members(id))`

**3. API Manifest:**
- `GET /` → `HomepageResponse`
- `GET /members` → `list[Member]`
- `GET /members/{member_id}` → `Member` or 404
- `GET /members/{member_id}/profile` → `Profile {id, username, bio}` or 404

**4. Dependencies:** unchanged from Lesson 2.

**5. Test State:** 5 tests, 5 passing.

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Route/path parameter | L3 | A placeholder segment in a URL path, extracted and type-coerced automatically |
| Parameter type coercion | L3 | FastAPI converts and validates path text against the annotated type, rejecting bad input with 422 |
| `WHERE` | L3 | SQL clause that filters rows by a condition |
| `.fetchone()` | L3 | Returns exactly one row or `None`, vs `.fetchall()`'s list |
| `HTTPException` | L3 | Returns a specific non-200 response from inside a route function |
| Foreign key (cross-table) | L3 | A column constrained to reference a row in another table |
| `JOIN` | L3 | Combines matching rows from two tables into one result row |
| Normalization | L3 | Splitting distinct concepts into separate, linked tables instead of one combined table |

**7. Lesson Completion State:**
- Completed: Lesson 1, Interlude A, Lesson 2, Lesson 3
- Next: Lesson 4 — Creating a Post (HTML forms, POST, validation, INSERT)

**8. Current Architecture State:**
- HTTP Layer: 4 routes
- Business Logic: not introduced
- Data Access: `db.py`, now with a two-table JOIN
- ORM: not introduced
- Authentication: not introduced
