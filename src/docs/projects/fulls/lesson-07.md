# Lesson 7: Commenting on Posts

**What you will build**
A `comments` table linked to both `posts` and `members`, an endpoint to add a comment, and an endpoint that returns a post *with its comments nested inside it* — the first time our API returns hierarchical data instead of a flat list. The problem we're solving: a comment doesn't just relate to one thing, it relates to two (the post it's on, and the member who wrote it), and displaying it usefully means joining across both at once.

**What you need to know first**
Lesson 6 (full CRUD). Lesson 3 (`JOIN`).

---

## Concept Unit: Chaining Multiple JOINs

### The Problem

To show a comment properly, we need the comment's own text, plus the *commenter's* username (a join to `members`), while the comment itself is also tied to a specific post (a join to `posts`). That's two separate relationships converging on one row — more than any query we've written so far.

### The failing test

```python
def test_add_and_list_comments():
    post = client.post("/posts", json={"author_id": 1, "content": "topic"}).json()
    client.post(f"/posts/{post['id']}/comments", json={"author_id": 2, "content": "nice post"})
    response = client.get(f"/posts/{post['id']}/comments")
    assert response.status_code == 200
    data = response.json()
    assert data[0]["content"] == "nice post"
    assert data[0]["username"] == "grace"
```

Run it:

```bash
pytest tests/
```

```text
FAILED tests/test_api.py::test_add_and_list_comments
404 != 200
```

### Introduce the concept in isolation

Create `lab_multijoin.py`:

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row
conn.execute("CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT)")
conn.execute("CREATE TABLE books (id INTEGER PRIMARY KEY, author_id INTEGER, title TEXT)")
conn.execute("CREATE TABLE reviews (id INTEGER PRIMARY KEY, book_id INTEGER, reviewer_id INTEGER, text TEXT)")

conn.execute("INSERT INTO authors VALUES (1, 'Ada')")
conn.execute("INSERT INTO authors VALUES (2, 'Grace')")
conn.execute("INSERT INTO books VALUES (1, 1, 'Notes on the Analytical Engine')")
conn.execute("INSERT INTO reviews VALUES (1, 1, 2, 'Excellent')")

rows = conn.execute("""
    SELECT reviews.text, reviewer.name AS reviewer_name, books.title
    FROM reviews
    JOIN books ON reviews.book_id = books.id
    JOIN authors reviewer ON reviews.reviewer_id = reviewer.id
""").fetchall()

for row in rows:
    print(dict(row))
```

Run it:

```bash
python lab_multijoin.py
```

Output:

```text
{'text': 'Excellent', 'reviewer_name': 'Grace', 'title': 'Notes on the Analytical Engine'}
```

*What this proves:* a single query can join three tables, not just two — each `JOIN` adds one more relationship into the same result row. Notice `authors reviewer` — the *same table* (`authors`) is joined in under an alias (`reviewer`) because it's playing a specific role here (who reviewed it), distinct from the book's own author, even though both would technically come from the same `authors` table if we'd also wanted the book's author's name in this query.

### Discard the throwaway example

Delete `lab_multijoin.py`. Build the real `comments` table and its two-way join.

### Project Change

* **Files affected:** `db.py`, `schemas.py`, `main.py`.
* **Change type:** Modify.

### The New Code

```python
# db.py — add inside init_db()
conn.execute("""
    CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY,
        post_id INTEGER NOT NULL,
        author_id INTEGER NOT NULL,
        content TEXT NOT NULL CHECK (length(content) > 0),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (author_id) REFERENCES members(id)
    )
""")
```

```python
# schemas.py — add
class CommentCreate(BaseModel):
    author_id: int
    content: str = Field(min_length=1)

class CommentRead(BaseModel):
    id: int
    content: str
    username: str
    created_at: str
```

```python
# main.py — add
@app.post("/posts/{post_id}/comments", response_model=CommentRead, status_code=201)
def add_comment(post_id: int, comment: CommentCreate):
    conn = get_connection()
    cursor = conn.execute(
        "INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)",
        (post_id, comment.author_id, comment.content),
    )
    conn.commit()
    row = conn.execute("""
        SELECT comments.id, comments.content, comments.created_at, members.username
        FROM comments
        JOIN members ON comments.author_id = members.id
        WHERE comments.id = ?
    """, (cursor.lastrowid,)).fetchone()
    conn.close()
    return dict(row)

@app.get("/posts/{post_id}/comments", response_model=list[CommentRead])
def list_comments(post_id: int):
    conn = get_connection()
    rows = conn.execute("""
        SELECT comments.id, comments.content, comments.created_at, members.username
        FROM comments
        JOIN members ON comments.author_id = members.id
        WHERE comments.post_id = ?
        ORDER BY comments.created_at ASC
    """, (post_id,)).fetchall()
    conn.close()
    return [dict(row) for row in rows]
```

### Mechanical walkthrough

1. `CHECK (length(content) > 0)`: (first appearance). A **table-level constraint**, enforced by SQLite itself, not by Pydantic. This is deliberately redundant with `Field(min_length=1)` on `CommentCreate` — both exist, checking the same rule at two different layers.
2. `FOREIGN KEY (post_id) REFERENCES posts(id)` and a second `FOREIGN KEY` line for `author_id`: (already-established single foreign key syntax, first appearance of *two* foreign keys on one table). `comments` relates to two different parent tables at once — this is exactly the "chaining" the isolation example demonstrated.
3. `WHERE comments.post_id = ?` in `list_comments`: (already-established `WHERE` + join pattern) — filters the joined result down to one post's comments specifically, the same filtering idea as every prior lesson, just applied after a join instead of before.

### CS Lens

**Transitive relationships aren't automatic.** `comments` relates to `posts`, and `posts` relates to `members`. That does *not* mean `comments` automatically relates to `members` through `posts` in some magical way — every relationship you want to query has to be explicitly joined. That's why `comments` has its *own* `author_id`, directly pointing at `members`, rather than relying on "well, you could look up the post's author." A comment's author and a post's author are two independently meaningful facts.

### SE Lens

**Defense in depth: validating the same rule at two layers isn't wasted effort.** `Field(min_length=1)` catches an empty comment at the API boundary, with a friendly `422` and a clear message. `CHECK (length(content) > 0)` catches it again at the database itself — which matters because Pydantic can only protect data that arrives *through* your API. A future script, a database migration, or a different service writing directly to this database bypasses Pydantic entirely, but not the database's own constraint. The API-level check is for good error messages; the database-level check is the actual last line of defense.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 14 items

tests/test_api.py ..............                                         [100%]

============================== 14 passed in 0.14s ===============================
```

### Connecting sentence

Comments can be listed on their own — but a post's page in a real app needs the post *and* its comments together, in one response, nested — not two separate requests the client has to stitch together itself.

---

## Concept Unit: Nested Response Data

### The Problem

SQL rows are inherently flat — every row is a fixed set of columns, side by side. But the natural shape of "a post, with a list of its comments attached" is hierarchical: one post, containing many comments, each comment containing its own fields. We need to bridge that gap between the database's flat shape and the response's nested shape.

### The failing test

```python
def test_post_detail_includes_nested_comments():
    post = client.post("/posts", json={"author_id": 1, "content": "topic"}).json()
    client.post(f"/posts/{post['id']}/comments", json={"author_id": 2, "content": "first!"})
    response = client.get(f"/posts/{post['id']}")
    data = response.json()
    assert data["content"] == "topic"
    assert data["comments"][0]["content"] == "first!"
```

### Introduce the concept in isolation

Create `lab_nesting.py`:

```python
from pydantic import BaseModel

class Comment(BaseModel):
    text: str

class Post(BaseModel):
    title: str
    comments: list[Comment]

p = Post(title="hello", comments=[{"text": "hi"}, {"text": "nice"}])
print(p.model_dump())
```

Run it:

```bash
python lab_nesting.py
```

Output:

```text
{'title': 'hello', 'comments': [{'text': 'hi'}, {'text': 'nice'}]}
```

*What this proves:* a Pydantic model's field can itself be a list of *another* Pydantic model — Pydantic validates every layer, nested lists included, not just the top level. `Post` and `Comment` remain two independent, reusable classes; nesting is just `comments: list[Comment]` as a field declaration, nothing more exotic than that.

### Discard the throwaway example

Delete `lab_nesting.py`. Build the real nested response — which requires two separate queries (one for the post, one for its comments), then assembling them in Python, since a single flat SQL query can't directly produce a nested JSON shape.

### Project Change

* **Files affected:** `schemas.py`, `main.py`.
* **Change type:** Modify.

### The New Code

```python
# schemas.py — add
class PostDetail(BaseModel):
    id: int
    content: str
    comments: list[CommentRead]
```

```python
# main.py — add
@app.get("/posts/{post_id}", response_model=PostDetail)
def get_post_detail(post_id: int):
    conn = get_connection()
    post_row = conn.execute("SELECT id, content FROM posts WHERE id = ?", (post_id,)).fetchone()
    if post_row is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Post not found")

    comment_rows = conn.execute("""
        SELECT comments.id, comments.content, comments.created_at, members.username
        FROM comments
        JOIN members ON comments.author_id = members.id
        WHERE comments.post_id = ?
        ORDER BY comments.created_at ASC
    """, (post_id,)).fetchall()
    conn.close()

    return {
        "id": post_row["id"],
        "content": post_row["content"],
        "comments": [dict(row) for row in comment_rows],
    }
```

### Mechanical walkthrough

1. `class PostDetail(BaseModel): comments: list[CommentRead]`: (already-established from the isolation example, applied for real). `CommentRead` is the exact same class defined earlier in this lesson — reused, not redefined, for the nested field.
2. Two separate `conn.execute` calls, one after another: (first appearance of assembling a response from more than one query deliberately). We *could* try to force this into one query with a single `JOIN`, but that would produce one flat row *per comment*, duplicating the post's `content` across every row — the database has no native concept of "one post, list of comments" as a single row shape. Two queries, assembled in Python, is the more honest match for the actual data shape we want.
3. The final `return {...}` dict: matches `PostDetail`'s shape exactly, with `comments` set to a plain list of dicts — Pydantic validates each one against `CommentRead` automatically because of the `list[CommentRead]` field declaration.

### CS Lens

**The relational-to-hierarchical mismatch.** This gap — relational data is flat tables, but application data is naturally nested objects/trees — is significant enough to have a name in the industry ("object-relational impedance mismatch"), and it's the entire reason ORMs (which we adopt formally in Lesson 17) exist: they automate exactly the two-query-then-assemble pattern you just wrote by hand.

### SE Lens

**Two queries is a legitimate choice, not a compromise to feel bad about.** It would be possible to fetch this with one cleverer SQL query and post-process the flat, duplicated rows in Python instead — but that's *more* code doing the same conceptual job, for a marginal reduction in database round-trips that doesn't matter at this scale. Choosing the simpler-to-read two-query version is a real, defensible tradeoff, not a beginner's shortcut — this is exactly the kind of decision Lesson 21's window functions and Lesson 23's caching will revisit once "database round-trips" actually starts to matter at a larger scale.

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

Comments relate a member to a post they didn't write. The next lesson introduces a relationship between two members *directly* — liking a post — which needs a structure neither `bios` (one-to-one) nor `comments` (many-to-one) quite covers.

---

## Closing

**Connect the pieces**
`GET /posts/{id}` runs two queries: one for the post itself, one joining `comments` to `members` for every comment on it. Both results are assembled by hand into one Python dict matching `PostDetail`'s nested shape, which Pydantic validates layer by layer — the post's own fields, and every item inside the `comments` list — before serializing the whole structure to JSON in one response.

**What breaks without this**
Without the `CHECK` constraint at the database layer, a comment inserted by anything other than our API (a script, a future service, a bug in a migration) could contain an empty string, silently — Pydantic's `Field(min_length=1)` only ever sees data that actually passes through this specific FastAPI app.

**Exercises**
1. Try inserting an empty-content comment directly via `sqlite3` (bypassing the API entirely) and confirm the `CHECK` constraint rejects it, proving the database-level check works independently of Pydantic.
2. Add a `comment_count` field to `PostDetail`, computed as `len(comments)` in Python, without any additional SQL query.

**Definition of Done**
* [x] `comments` table joins to both `posts` and `members`.
* [x] `POST`/`GET /posts/{id}/comments` work with a two-table `JOIN`.
* [x] `GET /posts/{id}` returns a nested `PostDetail` assembled from two queries.
* [x] A `CHECK` constraint enforces non-empty content at the database layer, redundant with Pydantic's own check.
* [x] Commit: `feat: comments with multi-join queries and nested post detail response`

---

## Context Snapshot (End of Lesson 7)

**2. Schema State (addition):**
- `comments (id INTEGER PRIMARY KEY, post_id INTEGER NOT NULL, author_id INTEGER NOT NULL, content TEXT NOT NULL CHECK (length(content) > 0), created_at TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY (post_id) REFERENCES posts(id), FOREIGN KEY (author_id) REFERENCES members(id))`

**3. API Manifest (additions):**
- `POST /posts/{post_id}/comments` → `CommentRead`, status `201`
- `GET /posts/{post_id}/comments` → `list[CommentRead]`
- `GET /posts/{post_id}` → `PostDetail {id, content, comments: [CommentRead]}`

**5. Test State:** 15 tests, 15 passing.

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Multi-way JOIN | L7 | Joining three or more tables in one query, chaining relationships |
| Table alias (`AS`/implicit) | L7 | Naming the same table differently per role when joined more than once |
| `CHECK` constraint | L7 | A database-enforced rule beyond just column type, independent of application code |
| Defense in depth | L7 | Enforcing the same rule at multiple layers (API and database) for independent protection |
| Nested Pydantic models | L7 | A model field typed as `list[OtherModel]`, validated at every level |
| Object-relational impedance mismatch | L7 | The structural gap between flat relational rows and nested application objects |

**7. Lesson Completion State:**
- Completed: Lessons 1-7, Interludes A and C
- Next: Lesson 8 — Liking Posts (many-to-many, junction tables, transactions)

**8. Current Architecture State:**
- HTTP Layer: 11 routes
- Business Logic: not introduced
- Data Access: `db.py`, first multi-join queries, first nested response assembly
- ORM: not introduced
- Authentication: not introduced
