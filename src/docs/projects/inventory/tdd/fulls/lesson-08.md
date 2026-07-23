# Lesson 8: Liking Posts

**What you will build**
A `likes` junction table connecting members and posts many-to-many, plus a transaction-wrapped write that keeps a fast, denormalized like count in sync with the actual like rows. The problem we're solving: every relationship so far has had a clear "one side, many side" — a member has many posts, a post has many comments. Liking is different: one member can like many posts, *and* one post can be liked by many members, simultaneously. Neither table can just hold a foreign key to the other.

**What you need to know first**
Lesson 7 (multi-table joins). Lesson 6 (mutating endpoints).

---

## Concept Unit: Many-to-Many and the Junction Table

### The Problem

A foreign key on `posts` pointing to one liking member wouldn't work — a post can have many likers. A foreign key on `members` pointing to one liked post wouldn't work either, for the same reason in reverse. Neither table can hold "the" relationship, because it isn't one-to-anything — it's genuinely many-to-many.

### The failing test

```python
def test_like_and_unlike_post():
    post = client.post("/posts", json={"author_id": 1, "content": "topic"}).json()
    response = client.post(f"/posts/{post['id']}/likes", json={"member_id": 2})
    assert response.status_code == 201
    detail = client.get(f"/posts/{post['id']}").json()
    assert detail["like_count"] == 1

    duplicate = client.post(f"/posts/{post['id']}/likes", json={"member_id": 2})
    assert duplicate.status_code == 409
```

Run it:

```bash
pytest tests/
```

```text
FAILED tests/test_api.py::test_like_and_unlike_post
404 != 201
```

### Introduce the concept in isolation

Create `lab_junction.py`:

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT)")
conn.execute("CREATE TABLE courses (id INTEGER PRIMARY KEY, title TEXT)")
conn.execute("""
    CREATE TABLE enrollments (
        student_id INTEGER,
        course_id INTEGER,
        PRIMARY KEY (student_id, course_id)
    )
""")

conn.execute("INSERT INTO students VALUES (1, 'Ada')")
conn.execute("INSERT INTO courses VALUES (1, 'Algebra')")
conn.execute("INSERT INTO courses VALUES (2, 'History')")
conn.execute("INSERT INTO enrollments VALUES (1, 1)")
conn.execute("INSERT INTO enrollments VALUES (1, 2)")

try:
    conn.execute("INSERT INTO enrollments VALUES (1, 1)")  # duplicate enrollment
except sqlite3.IntegrityError as e:
    print(f"Blocked duplicate: {e}")

rows = conn.execute("""
    SELECT courses.title FROM enrollments
    JOIN courses ON enrollments.course_id = courses.id
    WHERE enrollments.student_id = 1
""").fetchall()
print(rows)
```

Run it:

```bash
python lab_junction.py
```

Output:

```text
Blocked duplicate: UNIQUE constraint failed: enrollments.student_id, enrollments.course_id
[('Algebra',), ('History',)]
```

*What this proves:* `enrollments` isn't "owned" by either `students` or `courses` — it's a third table that exists purely to record which pairs are connected, holding two foreign keys side by side. `PRIMARY KEY (student_id, course_id)` — a **composite primary key**, made of two columns together instead of one — makes the *pair* unique, not either column individually, which is exactly what blocked the duplicate enrollment attempt.

### Discard the throwaway example

Delete `lab_junction.py`. Build the real `likes` junction table.

### Project Change

* **Files affected:** `db.py`, `schemas.py`, `main.py`.
* **Change type:** Modify.

### The New Code

```python
# db.py — add inside init_db()
conn.execute("""
    CREATE TABLE IF NOT EXISTS likes (
        post_id INTEGER NOT NULL,
        member_id INTEGER NOT NULL,
        PRIMARY KEY (post_id, member_id),
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (member_id) REFERENCES members(id)
    )
""")
```

```python
# schemas.py — add
class LikeCreate(BaseModel):
    member_id: int
```

```python
# main.py — add
@app.post("/posts/{post_id}/likes", status_code=201)
def like_post(post_id: int, like: LikeCreate):
    conn = get_connection()
    try:
        conn.execute(
            "INSERT INTO likes (post_id, member_id) VALUES (?, ?)",
            (post_id, like.member_id),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=409, detail="Already liked")
    conn.close()
    return {"liked": True}
```

### Mechanical walkthrough

1. `PRIMARY KEY (post_id, member_id)`: (already-established composite key idea from isolation, applied for real). The pair `(post_id, member_id)` must be unique — one member can like a given post at most once, but can freely like many *different* posts, and a post can be liked by many *different* members. This single constraint is what makes "many-to-many, but no duplicates" enforceable without any application-level checking logic.
2. `except sqlite3.IntegrityError`: (first appearance of catching a database constraint violation in Python, contrast with Lesson 3's constraint which we never triggered deliberately). The `PRIMARY KEY` constraint does the actual duplicate-prevention work; Python's job here is only to translate that low-level database error into a meaningful HTTP response.
3. `409 Conflict`: (first appearance). The HTTP status specifically meaning "this request conflicts with the resource's current state" — distinct from `403` (not allowed at all) and `404` (doesn't exist): here, liking *is* allowed, and the post *does* exist, it's just already been done.

### CS Lens

**Many-to-many cardinality, and the junction table pattern.** This is the third and final basic relationship shape, after Lesson 3's one-to-one and Lesson 5's one-to-many. A junction table is really just an edge in a graph — each row is a connection between two nodes (a member and a post), exactly the kind of structure that shows up anywhere two things can each relate to many of the other: tags on articles, students in courses, actors in movies.

### SE Lens

**Let the constraint do the work, don't just check in application code.** We could have written `if already_liked(...): raise HTTPException(409)` as a `SELECT` check before the `INSERT`. The composite primary key is a stronger guarantee: it's correct even if two requests to like the same post arrive at nearly the same instant — a `SELECT`-then-`INSERT` check in application code has a small window where both requests could pass the check before either inserts, defeating it. The database constraint has no such window because it's enforced atomically by the engine itself.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 15 items

tests/test_api.py .....F.........                                        [ 93%]
```

*This is expected to still fail* — `like_count` doesn't exist on `PostDetail` yet. That's the next problem.

---

## Concept Unit: Transactions and a Denormalized Count

### The Problem

`GET /posts/{id}` could compute the like count with `SELECT COUNT(*) FROM likes WHERE post_id = ?` every time it's requested — and for now, that would be simplest. But counting rows on every single read gets more expensive as `likes` grows into the millions, for a number that changes relatively rarely compared to how often it's *read*. We'll instead store the count directly on `posts`, updated whenever a like is added — which means a single "like" action now has to make *two* writes (insert the like, increment the count), and both need to succeed together or not at all.

### Introduce the concept in isolation

Create `lab_transaction.py`:

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE accounts (name TEXT, balance INTEGER)")
conn.execute("INSERT INTO accounts VALUES ('alice', 100)")
conn.execute("INSERT INTO accounts VALUES ('bob', 100)")
conn.commit()

try:
    conn.execute("BEGIN")
    conn.execute("UPDATE accounts SET balance = balance - 50 WHERE name = 'alice'")
    raise RuntimeError("simulated crash mid-transfer")
    conn.execute("UPDATE accounts SET balance = balance + 50 WHERE name = 'bob'")
    conn.commit()
except RuntimeError:
    conn.rollback()
    print("Rolled back after simulated crash")

print(conn.execute("SELECT * FROM accounts").fetchall())
```

Run it:

```bash
python lab_transaction.py
```

Output:

```text
Rolled back after simulated crash
[('alice', 100), ('bob', 100)]
```

*What this proves:* even though `alice`'s balance was already decremented before the crash, `conn.rollback()` undid it — because it was never `commit()`-ed. `BEGIN` marks the start of a group of changes that all succeed together or all disappear together; nothing takes permanent effect until `commit()`, and anything since the last `BEGIN` can be entirely discarded with `rollback()`.

### Explain the mechanism

This is **atomicity** — one of the core guarantees a real database makes (the "A" in the acronym ACID, which you'll see the rest of across this project). Without it, a crash between two related writes could leave the system in a state that never should have existed — alice down $50, bob unchanged, money gone nowhere. Wrapping both writes in one transaction guarantees that can't happen: either the whole group applies, or none of it does.

### Discard the throwaway example

Delete `lab_transaction.py`. Wrap the like-insert and count-increment together.

### Project Change

* **Files affected:** `db.py`, `main.py`.
* **Change type:** Modify.

### The New Code

```python
# db.py — add a like_count column to posts
conn.execute("""
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY,
        author_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        like_count INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (author_id) REFERENCES members(id)
    )
""")
```

```python
# main.py — replace like_post
@app.post("/posts/{post_id}/likes", status_code=201)
def like_post(post_id: int, like: LikeCreate):
    conn = get_connection()
    try:
        conn.execute("BEGIN")
        conn.execute(
            "INSERT INTO likes (post_id, member_id) VALUES (?, ?)",
            (post_id, like.member_id),
        )
        conn.execute(
            "UPDATE posts SET like_count = like_count + 1 WHERE id = ?",
            (post_id,),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=409, detail="Already liked")
    conn.close()
    return {"liked": True}
```

```python
# schemas.py — PostDetail gains like_count
class PostDetail(BaseModel):
    id: int
    content: str
    like_count: int
    comments: list[CommentRead]
```

(`get_post_detail` in `main.py` also needs `posts.like_count` added to its `SELECT` and to the returned dict — same pattern as every other field added so far.)

### Mechanical walkthrough

1. `like_count INTEGER NOT NULL DEFAULT 0`: (already-established `DEFAULT` pattern from Lesson 5). Every post starts at zero likes automatically.
2. `conn.execute("BEGIN")` ... two writes ... `conn.commit()`: (already-established from the isolation example, applied for real). If the `INSERT` fails (duplicate like), we jump to `except` and `rollback()` — the `UPDATE` never happened, so the count can't drift out of sync with the actual like rows.
3. `UPDATE posts SET like_count = like_count + 1`: (first appearance of updating a column relative to its own current value, rather than to a fixed value like Lesson 6's `content = ?`).

### CS Lens

**Denormalization as a deliberate, tracked tradeoff.** Lesson 3 taught normalization — splitting data to avoid duplication. `like_count` is the opposite move on purpose: storing a number that's technically *derivable* (`COUNT(*) FROM likes WHERE post_id = ?`) directly on `posts`, trading a small risk of the two going out of sync (mitigated here by the transaction) for a read that's instant regardless of how many likes exist. Knowing when to normalize and when to deliberately denormalize — and doing the latter safely, with a transaction — is a real, recurring design decision, not a mistake to avoid entirely.

### SE Lens

**Atomicity is what makes denormalization safe enough to use.** Without wrapping both writes in one transaction, a crash between the `INSERT` and the `UPDATE` would leave a like recorded with no corresponding count increment — the exact "drift" the CS Lens above warns about. The transaction is not an optional nicety here; it's the specific thing that makes this denormalization trustworthy rather than a ticking data-integrity bug.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 15 items

tests/test_api.py ...............                                        [100%]

============================== 15 passed in 0.15s ===============================
```

### Connecting sentence

Likes connect a member to a post, symmetrically, with no direction implied. The next lesson introduces a relationship that *does* have a direction — one member following another — using a self-referencing junction table this time, echoing NexusInventory's adjacency-list tree, but many-to-many instead of a strict hierarchy.

---

## Closing

**Connect the pieces**
`POST /posts/{id}/likes` opens a transaction, inserts into the `likes` junction table (whose composite primary key structurally prevents a duplicate like), increments `posts.like_count`, and commits both together. If the insert violates the composite key, the whole transaction rolls back — the count is never touched — and a `409` is returned. `GET /posts/{id}` then reads `like_count` directly, an instant read regardless of how many rows exist in `likes`.

**What breaks without this**
Without the transaction, a duplicate-like attempt that fails the `INSERT` could, depending on code order, still leave `like_count` incremented — a permanent, silent drift between the count and reality that would only ever be noticed by someone manually cross-checking the two, likely much later and far from the code that caused it.

**Exercises**
1. Add an `unlike` endpoint (`DELETE /posts/{id}/likes`) that removes the row from `likes` and decrements `like_count`, wrapped in the same transaction pattern.
2. Temporarily remove the transaction (just run the two statements with two separate `commit()`s) and manually trigger the failure path to observe `like_count` drift from the real count in `likes` — then restore the transaction.

**Definition of Done**
* [x] `likes` junction table with a composite primary key prevents duplicate likes structurally.
* [x] Liking a post is atomic — insert and count-increment succeed or fail together.
* [x] `409` returned on duplicate like attempts.
* [x] Commit: `feat: many-to-many likes with atomic count tracking`

---

## Context Snapshot (End of Lesson 8)

**2. Schema State (additions/changes):**
- `posts` gains `like_count INTEGER NOT NULL DEFAULT 0`
- `likes (post_id INTEGER NOT NULL, member_id INTEGER NOT NULL, PRIMARY KEY (post_id, member_id), FOREIGN KEY (post_id) REFERENCES posts(id), FOREIGN KEY (member_id) REFERENCES members(id))`

**3. API Manifest (addition):**
- `POST /posts/{post_id}/likes` → `{"liked": true}`, status `201`; `409` on duplicate
- `PostDetail` now includes `like_count`

**5. Test State:** 15 tests, 15 passing.

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Many-to-many cardinality | L8 | Both sides of a relationship can relate to many of the other |
| Junction table | L8 | A table existing only to record connections between two other tables |
| Composite primary key | L8 | A uniqueness constraint spanning two or more columns together |
| `409 Conflict` | L8 | Request conflicts with the resource's current state, distinct from 403/404 |
| Transaction / `BEGIN` / `commit` / `rollback` | L8 | A group of writes that all succeed together or all discard together |
| Atomicity | L8 | The guarantee that a transaction can't partially apply |
| Denormalization | L8 | Deliberately storing a derivable value for fast reads, at the cost of needing to keep it in sync |

**7. Lesson Completion State:**
- Completed: Lessons 1-8, Interludes A and C
- Next: Lesson 9 — Following Other Users (self-referencing relationships), then Interlude B — Hash Maps

**8. Current Architecture State:**
- HTTP Layer: 12 routes
- Business Logic: not introduced
- Data Access: `db.py`, first junction table, first explicit transaction
- ORM: not introduced
- Authentication: not introduced
