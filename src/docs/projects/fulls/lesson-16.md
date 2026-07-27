# Lesson 16: Code I Can Maintain

**What you will build**
A `PostRepository` class that owns all of `posts`' raw SQL, injected into routes via `Depends()` the same way `get_current_member` was — replacing scattered `conn.execute(...)` calls and the ownership-check logic duplicated since Lesson 6. The problem we're solving: nothing is currently broken, but the amount of near-identical SQL spread across route functions has reached the point where a single mistake (a typo in one copy of an ownership check) could silently diverge from its sibling copies elsewhere.

**What you need to know first**
Lessons 6, 9, 11 (each independently flagged repeated logic as worth revisiting here). Lesson 14 (`Depends()` for identity — today applies the identical mechanism to data access).

**Exemption from the failing-test-first rule:** this lesson changes *structure*, not *behavior* — every existing test should still pass, unchanged, after the refactor. The existing test suite is the safety net proving that, which is a different (and equally valid) use of tests than Rule 3's usual "spec new behavior first."

---

## Concept Unit: The Repository Pattern

### The Problem

`create_post`, `update_post`, `delete_post`, and `get_post_detail` each independently open a connection, write raw SQL, and close it. `update_post` and `delete_post` each independently implement "check the post exists, then check ownership." If the `posts` table's shape ever needs to change, or that ownership check ever needs a bug fix, there are multiple places to find and update correctly — and no guarantee all of them get found.

### Baseline: confirm the current suite passes

```bash
pytest tests/
```

```text
============================= test session starts ==============================
collected 23 items

tests/test_api.py .......................                                [100%]

============================== 23 passed in 0.24s ===============================
```

*Why this matters here specifically:* this passing baseline is what today's refactor is measured against — after every change in this lesson, this exact command should produce this exact result again, unchanged.

### Introduce the concept in isolation

Create `lab_repository.py`:

```python
class NoteRepository:
    def __init__(self, conn):
        self.conn = conn

    def create(self, text: str) -> int:
        cursor = self.conn.execute("INSERT INTO notes (text) VALUES (?)", (text,))
        self.conn.commit()
        return cursor.lastrowid

    def get(self, note_id: int):
        return self.conn.execute("SELECT * FROM notes WHERE id = ?", (note_id,)).fetchone()

import sqlite3
conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row
conn.execute("CREATE TABLE notes (id INTEGER PRIMARY KEY, text TEXT)")

repo = NoteRepository(conn)
new_id = repo.create("remember this")
print(dict(repo.get(new_id)))
```

Run it:

```bash
python lab_repository.py
```

Output:

```text
{'id': 1, 'text': 'remember this'}
```

*What this proves:* nothing about `repo.create(...)` or `repo.get(...)` reveals that SQL is involved at all, from the caller's perspective. `NoteRepository` **encapsulates** — hides behind a simple method interface — every detail of how notes are actually stored. Calling code depends only on "a thing with `.create()` and `.get()` methods," not on SQL syntax, table names, or column layouts directly.

### Discard the throwaway example

Delete `lab_repository.py`. Build the real `PostRepository`, and migrate the routes to use it.

### Project Change

* **Files affected:** Create `repositories.py`. Modify `main.py`.
* **Change type:** Add + Modify (behavior-preserving).

### The New Code

```python
# repositories.py
class PostRepository:
    def __init__(self, conn):
        self.conn = conn

    def create(self, author_id: int, content: str) -> dict:
        cursor = self.conn.execute(
            "INSERT INTO posts (author_id, content) VALUES (?, ?)",
            (author_id, content),
        )
        self.conn.commit()
        return {"id": cursor.lastrowid, "author_id": author_id, "content": content}

    def get_by_id(self, post_id: int):
        return self.conn.execute("SELECT * FROM posts WHERE id = ?", (post_id,)).fetchone()

    def can_modify(self, post_id: int, member_id: int, role: str) -> tuple[bool, str | None]:
        row = self.get_by_id(post_id)
        if row is None:
            return False, "not_found"
        if row["author_id"] != member_id and role != "admin":
            return False, "forbidden"
        return True, None

    def update_content(self, post_id: int, content: str) -> None:
        self.conn.execute("UPDATE posts SET content = ? WHERE id = ?", (content, post_id))
        self.conn.commit()

    def delete(self, post_id: int) -> None:
        self.conn.execute("DELETE FROM posts WHERE id = ?", (post_id,))
        self.conn.commit()
```

```python
# main.py — a repository dependency, following get_current_member's pattern
def get_post_repository():
    conn = get_connection()
    try:
        yield PostRepository(conn)
    finally:
        conn.close()
```

```python
# main.py — update_post, migrated
@app.put("/posts/{post_id}", response_model=PostRead)
def update_post(
    post_id: int,
    update: PostUpdate,
    current_member: dict = Depends(get_current_member),
    posts: PostRepository = Depends(get_post_repository),
):
    can_modify, reason = posts.can_modify(post_id, current_member["id"], current_member["role"])
    if not can_modify:
        status = 404 if reason == "not_found" else 403
        raise HTTPException(status_code=status, detail=reason)
    posts.update_content(post_id, update.content)
    return {"id": post_id, "author_id": current_member["id"], "content": update.content}
```

### Mechanical walkthrough

1. `def get_post_repository(): ... yield ... finally: conn.close()`: (first appearance of a **generator-based dependency**, extending `Depends()` beyond Lesson 14's simple return-a-value pattern). `yield` hands `PostRepository(conn)` to the route while the function is paused; once the route finishes (successfully or via an exception), execution resumes after `yield`, running the `finally: conn.close()` — guaranteeing the connection closes exactly once, regardless of what happened in between. This is the same connection-per-request lifecycle every route has managed by hand since Lesson 2, now handled in exactly one place.
2. `can_modify(...)`: (first appearance — this method *is* the ownership-check logic from Lesson 6/15, moved, not rewritten). Notice it doesn't raise `HTTPException` itself — it returns a tuple describing the result, leaving the *HTTP-specific* decision (which status code, which message) to the route. This split matters: `PostRepository` has no idea it's being used by a web API at all, and shouldn't need to.
3. `posts: PostRepository = Depends(get_post_repository)`: (already-established `Depends()` pattern from Lesson 14, applied to data access instead of identity). `update_post` now receives a ready-to-use repository, the same way it receives a verified `current_member` — neither one is constructed by the route itself.

### CS Lens

**Encapsulation.** `PostRepository` hides its internal representation (raw SQL, connection objects) behind a small set of methods describing *what* can be done with a post, not *how* it's stored. This is the same idea the isolation example demonstrated with `NoteRepository` — callers depend on behavior, not implementation.

### SE Lens

**The Dependency Inversion Principle — the 'D' in SOLID.** Before today, `update_post` depended directly on a concrete detail: raw SQL against SQLite. Now it depends only on `PostRepository`'s method interface — `can_modify`, `update_content` — not on how those methods are implemented. This is the formal name for a pattern you've actually been building toward since `db.py` was split out in Lesson 2: high-level code (routes) should depend on abstractions (repository methods), not on low-level implementation details (raw SQL) directly. The concrete payoff arrives in Lesson 18: a route depending on `PostRepository`'s *interface* can be tested against a fake, in-memory repository instead of a real database, without changing the route's code at all.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 23 items

tests/test_api.py .......................                                [100%]

============================== 23 passed in 0.25s ===============================
```

*Exactly the same 23 tests, exactly the same result as the baseline* — proof the refactor changed structure without changing behavior.

### Connecting sentence

`delete_post` has the identical shape as `update_post` — check `can_modify`, then act — and migrates using the exact same repository, no new logic needed at all.

---

## Concept Unit: Finishing the Migration

### The New Code

```python
@app.delete("/posts/{post_id}", status_code=204)
def delete_post(
    post_id: int,
    current_member: dict = Depends(get_current_member),
    posts: PostRepository = Depends(get_post_repository),
):
    can_modify, reason = posts.can_modify(post_id, current_member["id"], current_member["role"])
    if not can_modify:
        status = 404 if reason == "not_found" else 403
        raise HTTPException(status_code=status, detail=reason)
    posts.delete(post_id)
```

### Mechanical walkthrough

1. Compare this to `update_post` above: the authorization block — `can_modify`, the `if not can_modify` branch, the status-code selection — is now **identical text** in both routes, rather than two independently-written, only-similar-looking copies as it was through Lesson 15. That repetition is now visibly, deliberately shared through `can_modify` itself, rather than coincidentally similar and prone to silently drifting apart.

### SE Lens

**A refactor is complete when duplication becomes visible sameness, not just shorter code.** The two routes above still each call `can_modify` and branch on its result — that's fine, and arguably clearer than hiding it further. The goal was never "zero repeated characters," it was "one place that defines what 'can this member modify this post' actually means," which is now true even though both routes still reference it.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 23 items

tests/test_api.py .......................                                [100%]

============================== 23 passed in 0.25s ===============================
```

### Connecting sentence

`posts` now has a proper boundary between HTTP concerns and data access. `db.py`'s `init_db()` and raw table creation are still hand-written SQL strings — the next lesson replaces that specific piece with a tool designed for it, once schema changes (like Lesson 13's `UNIQUE` gap) need to happen safely, without deleting the database.

---

## Closing

**Connect the pieces**
`update_post` and `delete_post` both now depend on `PostRepository`'s method interface, injected via `Depends(get_post_repository)`, exactly mirroring how `get_current_member` injects identity. `can_modify` centralizes the ownership/role authorization logic that was previously duplicated, returning a plain result the route interprets into HTTP-specific status codes — keeping `PostRepository` itself entirely unaware that HTTP exists.

**What breaks without this**
Before this refactor, fixing a bug in the ownership check (say, an off-by-one in how roles are compared) would require finding and fixing it in every route that duplicated the logic, with no mechanism to guarantee all copies were found — exactly the kind of drift a growing codebase accumulates silently over time.

**Exercises**
1. Extract a `CommentRepository` and `LikeRepository` following `PostRepository`'s exact shape, migrating `add_comment`, `list_comments`, and `like_post` to use them.
2. Deliberately introduce a bug into `can_modify` (e.g., swap `!=` to `==`) and confirm the existing test suite catches it — proof the tests are actually exercising this logic, not just passing coincidentally.

**Definition of Done**
* [x] `PostRepository` encapsulates all `posts` SQL behind a method interface.
* [x] `update_post` and `delete_post` depend on that interface via `Depends()`, not on raw SQL directly.
* [x] Full existing test suite passes unchanged before and after — behavior preserved through a structural refactor.
* [x] Commit: `refactor: extract PostRepository, centralizing authorization logic behind Dependency Inversion`

---

## Context Snapshot (End of Lesson 16)

**1. File Tree (addition):** `repositories.py`.

**3. API Manifest:** Unchanged — this lesson changed structure, not endpoints or their contracts.

**5. Test State:** 23 tests, 23 passing (identical count and result to the pre-refactor baseline).

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Repository pattern | L16 | A class encapsulating all data access for one entity behind a method interface |
| Encapsulation | L16 | Hiding implementation details behind a behavior-focused interface |
| Generator-based dependency (`yield` in `Depends()`) | L16 | A dependency that runs setup before, and guaranteed cleanup after, the route executes |
| Dependency Inversion Principle | L16 | High-level code should depend on abstractions, not on low-level implementation details directly |

**7. Lesson Completion State:**
- Completed: Lessons 1-16, Interludes A, B, C, D
- Next: Lesson 17 — Managing Database Changes Safely (Alembic, SQLAlchemy models)

**8. Current Architecture State:**
- HTTP Layer: 20 routes
- Business Logic: `extract_hashtags`, `create_access_token`, `get_current_member`
- Data Access: `db.py` (raw connections, schema), `repositories.py` (new — `PostRepository`)
- ORM: not introduced
- Authentication: complete; authorization logic now centralized in `PostRepository.can_modify`
