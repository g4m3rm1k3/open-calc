# Lesson 6: Editing My Post

**What you will build**
`PUT /posts/{id}` and `DELETE /posts/{id}`, both restricted so only the post's author can perform them. The problem we're solving: everything built so far only ever adds data. Real systems need to change and remove it — and the moment that's possible, "can *this* client actually do *this* action" becomes a real question for the first time.

**What you need to know first**
Lesson 4 (`INSERT`, `PostCreate`). Lesson 3 (`WHERE`).

---

## Concept Unit: UPDATE and a First Authorization Check

### The Problem

A post, once created, is permanent — there's no code path that changes an existing row. We need one. But updating *any* post given *any* id is dangerous the instant more than one member exists: nothing should let member 2 rewrite member 1's post. That's a different kind of check than anything we've built — not "does this data exist" (Lesson 3's `404`), but "is this specific client *allowed* to do this to this specific row."

### The failing test

```python
def test_update_own_post():
    created = client.post("/posts", json={"author_id": 1, "content": "original"}).json()
    response = client.put(f"/posts/{created['id']}", json={"editor_id": 1, "content": "edited"})
    assert response.status_code == 200
    assert response.json()["content"] == "edited"

def test_cannot_update_someone_elses_post():
    created = client.post("/posts", json={"author_id": 1, "content": "original"}).json()
    response = client.put(f"/posts/{created['id']}", json={"editor_id": 2, "content": "hijacked"})
    assert response.status_code == 403
```

Run it:

```bash
pytest tests/
```

```text
FAILED tests/test_api.py::test_update_own_post
405 != 200
```

*Why this fails:* `PUT` isn't a method any route currently accepts — FastAPI returns `405 Method Not Allowed` for a path that exists under `GET`/`POST` but not `PUT`.

### Introduce the concept in isolation

Create `lab_update.py`:

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE notes (id INTEGER PRIMARY KEY, text TEXT)")
conn.execute("INSERT INTO notes VALUES (1, 'original')")

cursor = conn.execute("UPDATE notes SET text = ? WHERE id = ?", ("edited", 1))
print("rows affected:", cursor.rowcount)

cursor = conn.execute("UPDATE notes SET text = ? WHERE id = ?", ("nothing", 999))
print("rows affected:", cursor.rowcount)

print(conn.execute("SELECT text FROM notes WHERE id = 1").fetchone())
```

Run it:

```bash
python lab_update.py
```

Output:

```text
rows affected: 1
rows affected: 0
('edited',)
```

*What this proves:* `UPDATE` doesn't error when nothing matches its `WHERE` clause — it just quietly affects zero rows. `cursor.rowcount` is how you find that out; without checking it, an `UPDATE` against a nonexistent id would look like it succeeded even though it changed nothing.

### Discard the throwaway example

Delete `lab_update.py`. Build the real endpoint, including the ownership check.

### Project Change

* **Files affected:** `schemas.py`, `main.py`.
* **Change type:** Modify.

### The New Code

```python
# schemas.py — add
class PostUpdate(BaseModel):
    editor_id: int
    content: str = Field(min_length=1)
```

```python
# main.py — add
@app.put("/posts/{post_id}", response_model=PostRead)
def update_post(post_id: int, update: PostUpdate):
    conn = get_connection()
    row = conn.execute("SELECT author_id FROM posts WHERE id = ?", (post_id,)).fetchone()
    if row is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Post not found")
    if row["author_id"] != update.editor_id:
        conn.close()
        raise HTTPException(status_code=403, detail="Not the author of this post")

    conn.execute("UPDATE posts SET content = ? WHERE id = ?", (update.content, post_id))
    conn.commit()
    conn.close()
    return {"id": post_id, "author_id": update.editor_id, "content": update.content}
```

### Mechanical walkthrough

1. `@app.put(...)`: (first appearance). A third HTTP method, alongside `GET` and `POST`. By convention, `PUT` means "replace this resource's data," which matches what we're doing here.
2. The `row is None` check, then the `row["author_id"] != update.editor_id` check: (first appearance of layered checks — deliberately two separate conditions, not one). Notice the *order*: existence is checked before ownership. Checking ownership first on a post that doesn't exist would mean comparing `None`'s author to `editor_id`, an error, not a clean `403` or `404`.
3. `403` vs `404`: (first appearance of `403`, contrasted with `404` from Lesson 3). `404` means "this doesn't exist, as far as you're concerned." `403` means "this exists, but you specifically aren't allowed to act on it." Conflating these into one generic error would hide the real reason a request failed.
4. `cursor.execute("UPDATE ... WHERE id = ?", ...)` here doesn't check `.rowcount` — because we already confirmed the row exists in the line above, via the `SELECT`. The isolation example's lesson (always check `rowcount`, or already know the row exists) is applied here by structuring the function so existence is already proven before `UPDATE` runs.

### CS Lens

**Authorization vs. authentication — a distinction, not yet the real thing.** *Authentication* is proving who you are. *Authorization* is deciding what you, specifically, are allowed to do. Today's `editor_id` is not real authentication — a client can claim to be anyone, the same weakness `author_id` had since Lesson 4. But the *authorization logic* — "does the acting identity match the resource's owner" — is genuinely correct and will be unchanged once Lesson 14 adds real authentication; only *where the identity comes from* changes, from a client-supplied field to a verified login session.

### SE Lens

**Fail on the more specific condition, in the right order.** Checking existence before ownership isn't arbitrary — it produces the more informative, more correct response in every case. Get this order backwards in a real system and you risk leaking information (e.g., a `403` where a `404` should be, revealing that *something* exists at that id even to someone who shouldn't be able to tell).

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 11 items

tests/test_api.py ...........                                            [100%]

============================== 11 passed in 0.11s ===============================
```

### Connecting sentence

Editing is authorized correctly now — deleting needs the identical check, applied to a destructive, irreversible operation instead of a reversible one.

---

## Concept Unit: DELETE

### The Problem

Same ownership problem as `UPDATE`, but higher stakes: a wrongly-authorized delete can't be undone by re-editing, the data is simply gone.

### The failing test

```python
def test_delete_own_post():
    created = client.post("/posts", json={"author_id": 1, "content": "to delete"}).json()
    response = client.delete(f"/posts/{created['id']}", params={"editor_id": 1})
    assert response.status_code == 204
    assert client.get("/feed").json()[0]["content"] != "to delete"
```

### Introduce the concept in isolation

Create `lab_delete.py`:

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE notes (id INTEGER PRIMARY KEY, text TEXT)")
conn.execute("INSERT INTO notes VALUES (1, 'gone soon')")

conn.execute("DELETE FROM notes WHERE id = ?", (1,))
print(conn.execute("SELECT * FROM notes").fetchall())

conn.execute("DELETE FROM notes WHERE id = ?", (1,))
print("second delete caused no error")
```

Run it:

```bash
python lab_delete.py
```

Output:

```text
[]
[]
second delete caused no error
```

*What this proves:* `DELETE ... WHERE` behaves like `UPDATE` — it doesn't error on zero matching rows. Deleting something already gone is silently a no-op, not a crash. This is worth noticing deliberately: calling `DELETE` on the same id twice leaves the system in the exact same end state either time — which is a form of idempotency, even though the *second* call in our real endpoint will actually return `404` (because we check existence explicitly, the same way `UPDATE` did).

### Discard the throwaway example

Delete `lab_delete.py`.

### Project Change

* **Files affected:** `main.py`.
* **Change type:** Modify.

### The New Code

```python
@app.delete("/posts/{post_id}", status_code=204)
def delete_post(post_id: int, editor_id: int):
    conn = get_connection()
    row = conn.execute("SELECT author_id FROM posts WHERE id = ?", (post_id,)).fetchone()
    if row is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Post not found")
    if row["author_id"] != editor_id:
        conn.close()
        raise HTTPException(status_code=403, detail="Not the author of this post")

    conn.execute("DELETE FROM posts WHERE id = ?", (post_id,))
    conn.commit()
    conn.close()
```

### Mechanical walkthrough

1. `def delete_post(post_id: int, editor_id: int):`: (already-established query parameter pattern from Lesson 5, applied to `DELETE`). `editor_id` isn't in the path or a JSON body, so FastAPI treats it as a required query parameter — matching how the test calls it (`params={"editor_id": 1}`).
2. `status_code=204`: (first appearance). `204 No Content` means "succeeded, and there's deliberately nothing to send back" — appropriate for a delete, where there's no remaining resource to describe. Note there's no `return` statement at all; a `204` response must have an empty body, so returning data here would actually violate the HTTP spec FastAPI is enforcing.
3. The existence/ownership checks: identical structure to `update_post` — deliberately, since it's the same authorization problem applied to a different operation.

### CS Lens

**Idempotency, revisited.** `DELETE` is conventionally idempotent — repeating it should leave the system in the same state (nothing there) as the first call, matching what the isolation example showed at the raw SQL level. Our endpoint's *response* isn't fully idempotent (first call: `204`; second call: `404`, since we now check existence explicitly) — but the *system's actual state* after either call is identical, which is the property that matters in practice.

### SE Lens

**Repeated authorization logic is a signal, not (yet) a problem to fix.** `update_post` and `delete_post` now contain nearly identical existence/ownership checks. Duplicating it twice is fine — three or four times, across every future mutating endpoint, would be a real maintenance risk (a fix applied to one copy and forgotten in another). Lesson 16's Repository/Service layers exist specifically to solve this once there's enough repetition to justify the abstraction — naming it now, rather than abstracting prematurely, is itself a real design decision.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 13 items

tests/test_api.py .............                                          [100%]

============================== 13 passed in 0.13s ===============================
```

### Connecting sentence

We now have real create/read/update/delete behavior with basic ownership checks. Before adding more features, it's worth deliberately breaking something and practicing how to track down *why* — which is exactly what Interlude C does next.

---

## Closing

**Connect the pieces**
`PUT` and `DELETE` both follow the same shape: confirm the row exists (`404` if not), confirm the acting id matches the row's `author_id` (`403` if not), only then mutate. `UPDATE`'s and `DELETE`'s own SQL-level tolerance for "zero rows matched" is never actually exercised in our endpoints, because we deliberately check existence *before* running either statement — proving we understand the underlying SQL behavior well enough to guard against relying on it.

**What breaks without this**
Skip the ownership check on either endpoint, and any member can edit or delete any other member's content by guessing sequential ids — which, since posts use auto-incrementing integer ids, are trivially guessable.

**Exercises**
1. Write `test_cannot_delete_someone_elses_post`, following the pattern of `test_cannot_update_someone_elses_post`.
2. Call `DELETE` on a post id that never existed (e.g. `99999`) and confirm you get `404`, not `403` or a crash.

**Definition of Done**
* [x] `PUT /posts/{id}` and `DELETE /posts/{id}` both check existence then ownership, in that order.
* [x] Correct status codes used throughout: `404`, `403`, `204`.
* [x] Commit: `feat: post editing and deletion with ownership authorization`

---

## Context Snapshot (End of Lesson 6)

**1-2.** Schema unchanged from Lesson 5.

**3. API Manifest (additions):**
- `PUT /posts/{post_id}` → accepts `PostUpdate`, returns `PostRead`; `404`/`403` on failure
- `DELETE /posts/{post_id}?editor_id=` → `204`; `404`/`403` on failure

**5. Test State:** 13 tests, 13 passing.

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| `PUT` | L6 | HTTP method conventionally meaning "replace this resource" |
| `UPDATE` / `cursor.rowcount` | L6 | SQL statement to modify existing rows; rowcount reveals how many actually matched |
| `403 Forbidden` vs `404 Not Found` | L6 | Exists-but-not-allowed vs. doesn't-exist-to-you |
| Authorization vs. authentication | L6 | Authentication = proving who you are; authorization = what you're allowed to do once known |
| `DELETE` (SQL and HTTP) | L6 | Removes rows / removes a resource; both tolerate "nothing matched" without erroring |
| `204 No Content` | L6 | Success with a deliberately empty response body |

**7. Lesson Completion State:**
- Completed: Lesson 1, Interlude A, Lessons 2-6
- Next: Interlude C — Debugging as Method, then Lesson 7 (comments)

**8. Current Architecture State:**
- HTTP Layer: 8 routes
- Business Logic: not introduced
- Data Access: `db.py`, full read/write/update/delete now present
- ORM: not introduced
- Authentication: not introduced (ownership checks are correct in logic, but identity is still client-claimed)
