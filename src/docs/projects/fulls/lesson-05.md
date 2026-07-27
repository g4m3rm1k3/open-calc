# Lesson 5: Seeing My Feed

**What you will build**
A `/feed` endpoint returning posts from every member, newest first, with each post showing who wrote it — plus pagination, so the endpoint stays usable once there are thousands of posts instead of two. The problem we're solving: `posts` exists, but there's still no way to *read* them back in a useful order, and "just return everything" stops working the moment real usage begins.

**What you need to know first**
Lesson 4 (`posts` table). Lesson 3 (`JOIN`).

---

## Concept Unit: One-to-Many, and Ordering by Time

### The Problem

One member can write many posts — `members` and `posts` are not a one-to-one pair like `members` and `bios` were in Lesson 3. Reading the feed means joining across that one-to-many relationship, and doing it in a specific order: newest first, the way every feed you've ever used works. Right now `posts` doesn't even record *when* something was written, so "newest first" isn't possible yet.

### The failing test

```python
def test_feed_returns_posts_newest_first_with_author():
    client.post("/posts", json={"author_id": 1, "content": "first"})
    client.post("/posts", json={"author_id": 2, "content": "second"})
    response = client.get("/feed")
    assert response.status_code == 200
    data = response.json()
    assert data[0]["content"] == "second"
    assert data[0]["username"] == "grace"
```

Run it:

```bash
pytest tests/
```

```text
FAILED tests/test_api.py::test_feed_returns_posts_newest_first_with_author
404 != 200
```

### Introduce the concept in isolation

Create `lab_order.py`:

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE events (label TEXT, created_at TEXT)")
conn.execute("INSERT INTO events VALUES ('first', '2024-01-01 10:00:00')")
conn.execute("INSERT INTO events VALUES ('second', '2024-01-01 10:05:00')")

rows = conn.execute("SELECT label FROM events ORDER BY created_at DESC").fetchall()
print(rows)
```

Run it:

```bash
python lab_order.py
```

Output:

```text
[('second',), ('first',)]
```

*What this proves:* without `ORDER BY`, SQL makes no promise at all about what order rows come back in — it might happen to match insertion order, or might not, and relying on that accidental behavior is a bug waiting to surface. `ORDER BY created_at DESC` makes the order an explicit, guaranteed part of the query rather than an accident of storage.

### Discard the throwaway example

Delete `lab_order.py`. Add a real timestamp to `posts` and build the feed query.

### Project Change

* **Files affected:** `db.py`, `schemas.py`, `main.py`.
* **Change type:** Modify.

### The New Code

```python
# db.py — modify the posts table definition
conn.execute("""
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY,
        author_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (author_id) REFERENCES members(id)
    )
""")
```

```python
# schemas.py — add
class FeedPost(BaseModel):
    id: int
    content: str
    username: str
    created_at: str
```

```python
# main.py — add
@app.get("/feed", response_model=list[FeedPost])
def get_feed():
    conn = get_connection()
    rows = conn.execute("""
        SELECT posts.id, posts.content, posts.created_at, members.username
        FROM posts
        JOIN members ON posts.author_id = members.id
        ORDER BY posts.created_at DESC
    """).fetchall()
    conn.close()
    return [dict(row) for row in rows]
```

### The Updated Project

(Excerpts shown are the complete additions.)

### Mechanical walkthrough

1. `created_at TEXT NOT NULL DEFAULT (datetime('now'))`: (first appearance). `DEFAULT` means: if an `INSERT` doesn't mention this column, fill it in automatically with the given expression, evaluated at insert time. Lesson 4's `INSERT INTO posts (author_id, content) VALUES (?, ?)` never mentioned `created_at` — and yet every post now gets a real timestamp, because the table itself, not the application code, is responsible for it.
2. `ORDER BY posts.created_at DESC`: (already-established from the isolation example, applied to the real join). `DESC` (descending) means largest/most-recent first; `ASC` (ascending, the default if omitted) would mean oldest first.
3. `JOIN members ON posts.author_id = members.id`: (already-established `JOIN` pattern from Lesson 3, now joining in the opposite direction — many `posts` rows to one `members` row, instead of one-to-one).

### CS Lens

**One-to-many cardinality.** Lesson 3's `members`↔`bios` was one-to-one: each member has at most one bio. `members`↔`posts` is one-to-many: each member can have any number of posts, but each post has exactly one author. The `JOIN` mechanism is identical in both cases — what differs is only how many rows on each side can match — but this distinction matters immediately for the next concept: a one-to-many feed can grow without bound, in a way a one-to-one profile lookup never will.

### SE Lens

**Let the database guarantee invariants your application code shouldn't have to.** We could have set `created_at` in Python (`datetime.now()`) before every insert — but that means *every single place* in the codebase that inserts a post has to remember to do it correctly and consistently. A column `DEFAULT` guarantees it structurally, once, regardless of how many different code paths eventually insert posts.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 8 items

tests/test_api.py ........                                               [100%]

============================== 8 passed in 0.09s ===============================
```

### Connecting sentence

The feed works correctly for a handful of posts — but it currently has no limit at all. If this table held a million rows, `GET /feed` would try to load and serialize all of them, every single time.

---

## Concept Unit: Pagination

### The Problem

`SELECT ... ORDER BY posts.created_at DESC` with no limit returns *every* row that matches, no matter how many there are. A feed is exactly the kind of data that grows without bound. We need a way to ask for a specific, bounded slice — "the 20 most recent" — rather than everything.

### The failing test

```python
def test_feed_respects_limit():
    for i in range(5):
        client.post("/posts", json={"author_id": 1, "content": f"post {i}"})
    response = client.get("/feed?limit=2")
    assert len(response.json()) == 2
```

### Introduce the concept in isolation

Create `lab_limit.py`:

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE numbers (n INTEGER)")
for i in range(10):
    conn.execute("INSERT INTO numbers VALUES (?)", (i,))

rows = conn.execute("SELECT n FROM numbers ORDER BY n DESC LIMIT 3").fetchall()
print(rows)

rows = conn.execute("SELECT n FROM numbers ORDER BY n DESC LIMIT 3 OFFSET 3").fetchall()
print(rows)
```

Run it:

```bash
python lab_limit.py
```

Output:

```text
[(9,), (8,), (7,)]
[(6,), (5,), (4,)]
```

*What this proves:* `LIMIT` caps how many rows come back. `OFFSET` skips a number of rows before starting to return results — the second query skipped the top 3 and returned the next 3, which is exactly how "page 2" of a feed works: same query, same order, different offset.

### Discard the throwaway example

Delete `lab_limit.py`. Wire `limit`/`offset` into `/feed` as query parameters.

### Project Change

* **Files affected:** `main.py`.
* **Change type:** Modify.

### The New Code

```python
@app.get("/feed", response_model=list[FeedPost])
def get_feed(limit: int = 20, offset: int = 0):
    limit = min(limit, 100)
    conn = get_connection()
    rows = conn.execute("""
        SELECT posts.id, posts.content, posts.created_at, members.username
        FROM posts
        JOIN members ON posts.author_id = members.id
        ORDER BY posts.created_at DESC
        LIMIT ? OFFSET ?
    """, (limit, offset)).fetchall()
    conn.close()
    return [dict(row) for row in rows]
```

### Mechanical walkthrough

1. `limit: int = 20, offset: int = 0`: (first appearance of **query parameters**). Unlike `{member_id}` in Lesson 3, these aren't part of the URL path — they're the `?limit=2` style seen in the test. Any function parameter not found in the path and not a `BaseModel` is automatically treated by FastAPI as an optional query parameter, with the given default used when the client omits it.
2. `limit = min(limit, 100)`: (first appearance). A defensive cap — without it, a client (or a bug, or a misbehaving script) could request `?limit=1000000` and force the server to load and serialize an enormous result in one response.
3. `LIMIT ? OFFSET ?`: (first appearance in the real project, already understood from isolation). Bounds and positions the slice of ordered results returned.

### CS Lens

**Bounded vs. unbounded queries.** Every query you write from now on should have an answer to "what's the maximum this could ever return?" `/members` in Lesson 2 didn't, and got away with it only because the seed data was tiny — that was a latent version of this exact issue, just not yet visible. This foreshadows Lesson 10/12, where we'll measure the actual *cost* of a query like this directly, not just cap its size defensively.

### SE Lens

**Defaults that make the safe path the easy path.** `limit: int = 20` means a client that does nothing special still gets sensible, bounded behavior — they'd have to deliberately pass a huge `limit` to hit the cap. Good API defaults protect careless callers (including future-you, calling your own API in a hurry) without requiring anyone to remember a rule.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 9 items

tests/test_api.py .........                                              [100%]

============================== 9 passed in 0.10s ===============================
```

### Connecting sentence

Reading posts is solid now — but nothing stops a member from editing or deleting someone *else's* post. The next lesson adds `UPDATE`, `DELETE`, and the first real authorization check.

---

## Closing

**Connect the pieces**
`GET /feed?limit=2` arrives. FastAPI reads `limit` and `offset` as query parameters, defaulting if absent, and caps `limit` defensively. The query joins `posts` to `members` (one-to-many), orders by `created_at DESC` — populated automatically by the table's `DEFAULT`, not application code — and slices the result with `LIMIT`/`OFFSET`. The response is validated against `list[FeedPost]` and returned.

**What breaks without this**
Without `ORDER BY`, the feed's order would be an accident of internal storage, not a guarantee — it could silently change after something as unrelated as a database vacuum operation, with no code change to explain why. Without the `limit = min(limit, 100)` cap, the endpoint has no defense against a request designed (accidentally or not) to make the server do unbounded work.

**Exercises**
1. Call `GET /feed?limit=2&offset=0`, then `GET /feed?limit=2&offset=2` — confirm together they return the same items as `GET /feed?limit=4`, just split into two pages.
2. Remove the `min(limit, 100)` cap temporarily, insert 500 posts in a loop, and observe the response size difference with and without the cap. Restore the cap afterward.

**Definition of Done**
* [x] `/feed` joins posts to authors, ordered newest-first via a real `created_at` column.
* [x] `limit`/`offset` query parameters implement pagination, with a defensive upper cap.
* [x] Commit: `feat: paginated feed ordered by post creation time`

---

## Context Snapshot (End of Lesson 5)

**1. File Tree:** unchanged filenames from Lesson 4.

**2. Schema State:**
- `members`, `bios` (unchanged)
- `posts (id INTEGER PRIMARY KEY, author_id INTEGER NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY (author_id) REFERENCES members(id))`

**3. API Manifest:**
- Previous routes unchanged.
- `GET /feed?limit=&offset=` → `list[FeedPost] {id, content, username, created_at}`

**4. Dependencies:** unchanged.

**5. Test State:** 9 tests, 9 passing.

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| `DEFAULT` (column) | L5 | Auto-fills a column's value at insert time if not explicitly provided |
| `ORDER BY` / `ASC` / `DESC` | L5 | Explicit, guaranteed row ordering — absent it, order is an unreliable accident |
| One-to-many cardinality | L5 | One row on one side can relate to many rows on the other (vs. Lesson 3's one-to-one) |
| Query parameter | L5 | `?key=value` in a URL, distinct from a path parameter, auto-mapped to a function parameter |
| `LIMIT` / `OFFSET` | L5 | Bounds and positions a slice of ordered results — the mechanism behind pagination |
| Bounded vs. unbounded query | L5 | Whether a query has a guaranteed maximum result size |

**7. Lesson Completion State:**
- Completed: Lesson 1, Interlude A, Lessons 2-5
- Next: Lesson 6 — Editing My Post (`UPDATE`, `DELETE`, basic authorization), then Interlude C — Debugging as Method

**8. Current Architecture State:**
- HTTP Layer: 6 routes
- Business Logic: not introduced
- Data Access: `db.py`, first one-to-many `JOIN`, first pagination
- ORM: not introduced
- Authentication: not introduced
