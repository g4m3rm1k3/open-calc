# Lesson 10: Searching for People

**What you will build**
A search endpoint using SQL's `LIKE`, then a real index to speed it up — with the actual cost of each measured directly via `EXPLAIN QUERY PLAN`, not just asserted. The problem we're solving: everything read so far has been by exact id or a full unfiltered list. Search is different — partial, fuzzy, and the first place where "how many rows did the database actually have to look at" becomes a question worth answering precisely instead of trusting the code "looks right."

**What you need to know first**
Interlude B (hashing, O(1) vs O(n), B-trees mentioned but not yet seen directly).

---

## Concept Unit: `LIKE` and Its Real Cost

### The Problem

Finding "members whose username contains `gr`" isn't an exact match — `WHERE username = ?` can't express "contains." SQL needs a pattern-matching operator, and we need to understand exactly what that operator costs before assuming it scales.

### The failing test

```python
def test_search_members_by_partial_username():
    response = client.get("/members/search", params={"q": "gr"})
    assert response.status_code == 200
    usernames = [m["username"] for m in response.json()]
    assert "grace" in usernames
    assert "ada" not in usernames
```

Run it:

```bash
pytest tests/
```

```text
FAILED tests/test_api.py::test_search_members_by_partial_username
404 != 200
```

### Introduce the concept in isolation

Create `lab_like.py`:

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE members (id INTEGER PRIMARY KEY, username TEXT)")
for name in ["ada", "grace", "grant", "bob"]:
    conn.execute("INSERT INTO members (username) VALUES (?)", (name,))

rows = conn.execute("SELECT username FROM members WHERE username LIKE ?", ("%gr%",)).fetchall()
print(rows)

plan = conn.execute("EXPLAIN QUERY PLAN SELECT username FROM members WHERE username LIKE ?", ("%gr%",)).fetchall()
print(plan)
```

Run it:

```bash
python lab_like.py
```

Output:

```text
[('grace',), ('grant',)]
[(2, 0, 0, 'SCAN members')]
```

*What this proves:* `LIKE '%gr%'` correctly matches both `grace` and `grant`. `EXPLAIN QUERY PLAN` — a command that shows *how* SQLite intends to execute a query, without actually running it — reports `SCAN members`, meaning: check every single row, one at a time. This is the exact O(n) cost from Interlude B's linear search, now visible directly rather than just asserted.

### Explain the mechanism

`%` matches any sequence of characters (including none), at that position. A **leading** `%` (as in `%gr%`) is the problem: it means "gr could start anywhere in the string," which makes it fundamentally impossible to jump directly to matching rows the way a B-tree or hash structure could — those structures work by narrowing down based on *where a value starts*, and a leading wildcard removes exactly that information. This is why `SCAN` appears instead of `SEARCH` — there is no shortcut available for this specific pattern, no matter what indexes exist.

### Discard the throwaway example

Delete `lab_like.py`. Build the real search endpoint.

### Project Change

* **Files affected:** `main.py`.
* **Change type:** Modify.

### The New Code

```python
@app.get("/members/search", response_model=list[Member])
def search_members(q: str):
    conn = get_connection()
    rows = conn.execute(
        "SELECT id, username FROM members WHERE username LIKE ?",
        (f"%{q}%",),
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]
```

### Mechanical walkthrough

1. `q: str`: (already-established required query parameter, contrast with Lesson 5's `limit`/`offset` which had defaults). No default means FastAPI requires `?q=` on every request to this route, returning `422` automatically if it's missing.
2. `f"%{q}%"`: (first appearance of wildcard construction in the real project, already understood from isolation). Wraps the user's search term in wildcards so it can match anywhere in `username`.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 17 items

tests/test_api.py .................                                      [100%]

============================== 17 passed in 0.17s ===============================
```

### CS Lens

**Not every query can be sped up by adding structure.** Interlude B showed hashing beats linear search; this unit's `EXPLAIN QUERY PLAN` output shows a leading-wildcard `LIKE` gets no such benefit, from any structure — hash map or B-tree. Big-O isn't just a property of data size; it's a property of *what question you're asking* of that data. "Does this exact value exist" and "does this value exist anywhere inside any string" are fundamentally different problems, with fundamentally different achievable costs — full-text search engines (like NexusInventory's FTS5 work) exist specifically to make the second problem fast, using an entirely different structure (the inverted index) than either a hash map or a B-tree.

### SE Lens

**Measure before optimizing, and know what "fast enough" means for your actual data size.** `SCAN members` on a table with 4 rows is irrelevant — it'll return in microseconds regardless. The same `SCAN` on a table with 10 million rows is a real problem. `EXPLAIN QUERY PLAN` is how you find out which situation you're actually in, rather than guessing or reflexively adding indexes everywhere "just in case."

### Connecting sentence

`LIKE '%gr%'` can't be sped up by an index — but not every search needs a leading wildcard, and the next unit shows a case where an index genuinely helps, measured the same way.

---

## Concept Unit: Indexes, Measured Before and After

### The Problem

If a search only ever needed to match the *start* of a username (`gr%`, no leading wildcard), an index could help — but only if one actually exists. Right now, `username` has no index at all; even an exact match (`WHERE username = ?`) currently costs a full scan, unlike `id`, which is fast only because it's the primary key.

### Introduce the concept in isolation

Create `lab_index.py`:

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE members (id INTEGER PRIMARY KEY, username TEXT)")
for name in ["ada", "grace", "grant", "bob"]:
    conn.execute("INSERT INTO members (username) VALUES (?)", (name,))

print("Before index:")
print(conn.execute("EXPLAIN QUERY PLAN SELECT * FROM members WHERE username = 'grace'").fetchall())

conn.execute("CREATE INDEX idx_username ON members(username)")

print("After index:")
print(conn.execute("EXPLAIN QUERY PLAN SELECT * FROM members WHERE username = 'grace'").fetchall())
```

Run it:

```bash
python lab_index.py
```

Output:

```text
Before index:
[(2, 0, 0, 'SCAN members')]
After index:
[(3, 0, 0, 'SEARCH members USING INDEX idx_username (username=?)')]
```

*What this proves:* the exact same query changed from `SCAN` (check every row) to `SEARCH ... USING INDEX` (jump nearly directly to matching rows) purely by adding an index — no change to the query itself. This `SEARCH` is the B-tree lookup named in Interlude B, now observed directly rather than taken on faith.

### Discard the throwaway example

Delete `lab_index.py`. Add the real index.

### Project Change

* **Files affected:** `db.py`.
* **Change type:** Modify.

### The New Code

```python
# db.py — add inside init_db(), after the members table is created
conn.execute("CREATE INDEX IF NOT EXISTS idx_members_username ON members(username)")
```

### Mechanical walkthrough

1. `CREATE INDEX IF NOT EXISTS idx_members_username ON members(username)`: (already-established from isolation, real syntax). Builds a B-tree structure alongside the table, keyed on `username`, maintained automatically by SQLite on every future `INSERT`/`UPDATE`/`DELETE`.

### CS Lens

**An index doesn't help every query, only ones matching its structure.** `WHERE username = 'grace'` and `WHERE username LIKE 'gr%'` (no leading wildcard) can both use this index, because both can be answered by "narrow down based on where the string starts." `WHERE username LIKE '%gr%'` (leading wildcard, from the previous unit) still cannot, even with the index in place — the structural limitation from before is unchanged by adding this index.

### SE Lens

**Indexes aren't free — the tradeoff is write cost for read speed.** Every `INSERT` into `members` now also has to update `idx_members_username`, a real (if usually small) extra cost on every write, in exchange for faster reads. This is the same class of tradeoff as Lesson 8's denormalized `like_count`: a deliberate cost accepted somewhere in the system to buy speed somewhere else, not a free improvement. Indexing every column "just in case" would slow down every write for indexes that may rarely pay off in faster reads.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 17 items

tests/test_api.py .................                                      [100%]

============================== 17 passed in 0.17s ===============================
```

---

## Debouncing: A Forward-Looking Note

`/members/search` will eventually be called from a real search box, likely re-querying on every keystroke. Firing a request for every single keystroke — `"g"`, then `"gr"`, then `"gra"` — wastes requests on inputs the user will immediately replace. **Debouncing** is a frontend technique: wait a short pause (e.g. 300ms) after the user stops typing before actually sending the request, canceling any pending request if they type again first. This is a client-side concern, not something this backend endpoint needs to know about — it's named here because it directly determines *how often* `/members/search` actually gets called in a real app, which matters once you're reasoning about the query cost patterns from this lesson at real traffic volumes. This will be implemented for real once Phase 3's React frontend is built.

---

## Closing

**Connect the pieces**
`GET /members/search?q=gr` runs `LIKE '%gr%'` — a leading wildcard, which `EXPLAIN QUERY PLAN` confirms costs a full `SCAN` regardless of any index, because a leading wildcard removes the "starts with" structure any index needs to help. The separate `idx_members_username` index was added and *proven* effective for a different pattern (`= 'grace'` or a non-leading-wildcard `LIKE`) using the exact same measurement tool, not assumed effective because "indexes are supposed to make things faster."

**What breaks without this**
Without ever running `EXPLAIN QUERY PLAN`, you'd have no way to know `/members/search`'s cost doesn't improve even after adding an index — you might add the index, see no measurable difference at small scale, and wrongly conclude indexes "don't really matter," rather than correctly understanding this specific query can't benefit from one.

**Exercises**
1. Run `EXPLAIN QUERY PLAN` on `WHERE username LIKE 'gr%'` (no leading `%`) both before and after the index exists, and confirm it *does* show `SEARCH`, unlike the leading-wildcard version.
2. Time (roughly, using Python's `time` module) 1,000 calls to `WHERE username = 'grace'` before and after dropping the index, on a members table seeded with a few thousand rows, to see the real-world difference `EXPLAIN QUERY PLAN`'s prediction translates to.

**Definition of Done**
* [x] `/members/search` implements `LIKE`-based partial matching.
* [x] `EXPLAIN QUERY PLAN` used to observe `SCAN` vs `SEARCH` directly, before asserting either.
* [x] An index added and verified to help one query pattern, and verified *not* to help another.
* [x] Commit: `feat: member search with measured index effectiveness`

---

## Context Snapshot (End of Lesson 10)

**2. Schema State (addition):** `idx_members_username` index on `members(username)`.

**3. API Manifest (addition):** `GET /members/search?q=` → `list[Member]`.

**5. Test State:** 17 tests, 17 passing.

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| `LIKE` / `%` wildcard | L10 | SQL pattern matching; leading `%` prevents any index from helping |
| `EXPLAIN QUERY PLAN` | L10 | Shows how SQLite intends to execute a query, without running it |
| `SCAN` vs `SEARCH` | L10 | Full table check vs. index-assisted lookup, visible directly in the query plan |
| `CREATE INDEX` | L10 | Builds a B-tree structure on a column, sped up reads at the cost of slower writes |
| Debouncing | L10 | Client-side delay before firing a request, to avoid one request per keystroke |

**7. Lesson Completion State:**
- Completed: Lessons 1-10, Interludes A, B, C
- Next: Lesson 11 — Organizing Posts with Hashtags (normalization, string parsing)

**8. Current Architecture State:**
- HTTP Layer: 16 routes
- Business Logic: not introduced
- Data Access: `db.py`, first index, first query-plan-verified cost
- ORM: not introduced
- Authentication: not introduced
