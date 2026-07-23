# Lesson 12: Searching Posts by Tags

**What you will build**
The reverse of Lesson 11: given a tag name, find every post that has it — joining across four tables, and discovering a real limitation of `post_hashtags`' composite primary key along the way. The problem we're solving: Lesson 11 could read a post's tags fast; this lesson's *opposite* direction turns out not to be fast automatically, for a specific, checkable reason.

**What you need to know first**
Lesson 11 (hashtags, junction table). Lesson 10 (`EXPLAIN QUERY PLAN`, indexes).

---

## Concept Unit: The Composite-Key Index Trap

### The Problem

`post_hashtags` has `PRIMARY KEY (post_id, hashtag_id)` from Lesson 8's pattern. That primary key *is* a B-tree index — but on the *pair*, in that specific order. Looking up "everything for this `post_id`" (Lesson 11's direction) can use it directly. Looking up "everything for this `hashtag_id`" (today's direction) might not be able to — and we shouldn't assume either way without checking.

### The failing test

```python
def test_browse_posts_by_hashtag():
    client.post("/posts", json={"author_id": 1, "content": "Learning #rust today"})
    client.post("/posts", json={"author_id": 2, "content": "Also doing #rust this week"})
    response = client.get("/hashtags/rust/posts")
    assert response.status_code == 200
    assert len(response.json()) == 2
```

Run it:

```bash
pytest tests/
```

```text
FAILED tests/test_api.py::test_browse_posts_by_hashtag
404 != 200
```

### Introduce the concept in isolation

Create `lab_composite_index.py`:

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("""
    CREATE TABLE memberships (
        group_id INTEGER,
        person_id INTEGER,
        PRIMARY KEY (group_id, person_id)
    )
""")
for group_id, person_id in [(1, 1), (1, 2), (2, 1), (2, 3)]:
    conn.execute("INSERT INTO memberships VALUES (?, ?)", (group_id, person_id))

print("Lookup by group_id (leftmost column):")
print(conn.execute("EXPLAIN QUERY PLAN SELECT * FROM memberships WHERE group_id = 1").fetchall())

print("Lookup by person_id (NOT leftmost):")
print(conn.execute("EXPLAIN QUERY PLAN SELECT * FROM memberships WHERE person_id = 1").fetchall())
```

Run it:

```bash
python lab_composite_index.py
```

Output:

```text
Lookup by group_id (leftmost column):
[(3, 0, 0, 'SEARCH memberships USING INDEX sqlite_autoindex_memberships_1 (group_id=?)')]
Lookup by person_id (NOT leftmost):
[(3, 0, 0, 'SCAN memberships')]
```

*What this proves:* the exact same table, the exact same composite primary key, produces `SEARCH` for one column and `SCAN` for the other. A composite index built on `(group_id, person_id)` is structured like a phone book sorted by `(last_name, first_name)` — you can jump straight to "Smith," but you can't jump straight to "everyone whose first name is John," because the sort order only helps when you're searching by the *leading* column(s), left to right.

### Explain the mechanism

A B-tree index over `(group_id, person_id)` is physically ordered first by `group_id`, and only *within* each `group_id` by `person_id`. Searching `WHERE group_id = 1` can jump directly to that section. Searching `WHERE person_id = 1` has no such shortcut — matching rows could be scattered anywhere across every `group_id` section, so SQLite falls back to checking every row. This directly explains `post_hashtags`: its primary key `(post_id, hashtag_id)` helps Lesson 11's "tags for this post" (leftmost column) but not today's "posts for this tag" (second column) — exactly the case just demonstrated.

### Discard the throwaway example

Delete `lab_composite_index.py`. Add a real, separate index for this query direction.

### Project Change

* **Files affected:** `db.py`.
* **Change type:** Modify.

### The New Code

```python
# db.py — add inside init_db()
conn.execute("CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag ON post_hashtags(hashtag_id)")
```

### Mechanical walkthrough

1. `CREATE INDEX ... ON post_hashtags(hashtag_id)`: (already-established `CREATE INDEX` from Lesson 10, applied here to a *second* column on a table that already has a composite primary key). This index exists purely to make `hashtag_id`-first lookups fast, entirely separate from the primary key's own index.
2. Worth noting explicitly: `hashtags.name UNIQUE` from Lesson 11 *already* has an implicit index — SQLite automatically creates one for every `UNIQUE` constraint, the same way it does for `PRIMARY KEY`. No extra `CREATE INDEX` was needed for looking up a hashtag by name; that lookup was already fast without anyone deciding so explicitly.

### CS Lens

**Composite index column order is a real design decision, not a formality.** Given the same two columns, `(post_id, hashtag_id)` and `(hashtag_id, post_id)` are genuinely different indexes with different strengths — the first favors "tags for a post," the second favors "posts for a tag." A table can (and, per this lesson, does) have both a composite primary key *and* an additional single-column index, each serving a different query pattern.

### SE Lens

**Design indexes around your actual query patterns, discovered by looking at your endpoints — not guessed in advance.** It would have been easy to assume `post_hashtags`' primary key was "the index" for this table and stop there. The endpoint from Lesson 11 (post → tags) worked fine on that assumption. This lesson's endpoint (tag → posts) would have silently scanned the whole table forever if this gap had never been checked with `EXPLAIN QUERY PLAN`.

### Commands needed

```bash
pytest tests/
```

```text
Still failing — the route itself doesn't exist yet. The index alone doesn't create the endpoint.
```

---

## Concept Unit: The Four-Table Join, Verified

### The Problem

Finding posts by tag means joining `hashtags` (to find the tag by name) → `post_hashtags` (to find matching posts) → `posts` (for content) → `members` (for the author's username) — the longest join chain in the project so far.

### The New Code

```python
@app.get("/hashtags/{tag_name}/posts", response_model=list[FeedPost])
def browse_by_hashtag(tag_name: str):
    conn = get_connection()
    rows = conn.execute("""
        SELECT posts.id, posts.content, posts.created_at, members.username
        FROM hashtags
        JOIN post_hashtags ON hashtags.id = post_hashtags.hashtag_id
        JOIN posts ON post_hashtags.post_id = posts.id
        JOIN members ON posts.author_id = members.id
        WHERE hashtags.name = ?
        ORDER BY posts.created_at DESC
    """, (tag_name,)).fetchall()
    conn.close()
    return [dict(row) for row in rows]
```

### Mechanical walkthrough

1. Four `JOIN`s chained: (already-established pattern, extended from Lesson 7's three-table join to four). Each `JOIN`'s `ON` clause connects one link in the chain — the query reads, left to right, as a description of the path from "a tag by name" to "a post's full display data."
2. Reuses `FeedPost` from Lesson 5 as the response shape: (already-established schema reuse). The output of "posts for a tag" is structurally identical to "posts for the feed" — same fields, different filter — so no new schema class was needed.

### Verify with `EXPLAIN QUERY PLAN`

```bash
python -c "
from db import get_connection
conn = get_connection()
plan = conn.execute('''
    EXPLAIN QUERY PLAN
    SELECT posts.id FROM hashtags
    JOIN post_hashtags ON hashtags.id = post_hashtags.hashtag_id
    JOIN posts ON post_hashtags.post_id = posts.id
    JOIN members ON posts.author_id = members.id
    WHERE hashtags.name = ?
''', ('rust',)).fetchall()
for row in plan:
    print(row)
"
```

Output:

```text
(4, 0, 0, 'SEARCH hashtags USING INDEX sqlite_autoindex_hashtags_1 (name=?)')
(9, 1, 1, 'SEARCH post_hashtags USING INDEX idx_post_hashtags_hashtag (hashtag_id=?)')
(20, 2, 2, 'SEARCH posts USING INTEGER PRIMARY KEY (rowid=?)')
(28, 3, 3, 'SEARCH members USING INTEGER PRIMARY KEY (rowid=?)')
```

*What this proves:* every single one of the four joined tables is resolved with `SEARCH`, not `SCAN` — the `hashtags` lookup uses the implicit `UNIQUE` index, `post_hashtags` uses the index just added this lesson, and `posts`/`members` use their primary keys via the foreign key values already in hand from the previous join step. This is the direct, measured payoff of every indexing decision made across Lessons 10-12 — not assumed, read straight out of the query plan.

### CS Lens

**Join cost compounds across a chain.** Each `SEARCH` here is roughly O(log n); four of them chained is still dramatically better than even one `SCAN` would be at real data volumes — but it's also why the *number* of joins in a query is itself a cost worth noticing, not just whether each individual step is indexed. A query joining ten tables, each perfectly indexed, is still doing meaningfully more work than one joining two.

### SE Lens

**`EXPLAIN QUERY PLAN` as a habit, not a one-time lesson.** The real skill from Lessons 10-12 isn't memorizing that composite indexes have this specific limitation — it's the habit of checking, on any query you're not certain about, rather than assuming correctness from how reasonable the code looks. This is precisely the "looks right" trap named at the start of this whole curriculum, now with a concrete tool that closes it for query performance specifically.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 19 items

tests/test_api.py ...................                                    [100%]

============================== 19 passed in 0.19s ===============================
```

### Connecting sentence

Every table in this project so far has lived directly in `db.py`, with raw SQL in every route function. The next lesson steps back and restructures this — not because anything is broken, but because the amount of near-duplicated database code (get-or-create, ownership checks, junction inserts) has reached the point Lesson 6, 9, and 11's SE Lenses all separately flagged as worth revisiting.

---

## Closing

**Connect the pieces**
`GET /hashtags/rust/posts` chains four `JOIN`s, resolved by `EXPLAIN QUERY PLAN` as four consecutive `SEARCH` operations — made possible by the implicit index on `hashtags.name` (from `UNIQUE`), the explicit index added this lesson on `post_hashtags.hashtag_id` (because the composite primary key alone didn't cover this direction), and the existing primary keys on `posts` and `members`.

**What breaks without this**
Without `idx_post_hashtags_hashtag`, this exact query would still return correct results — just via a full `SCAN` of `post_hashtags` on every single call, a cost invisible in a demo with a handful of posts and catastrophic at real scale, exactly the way Lesson 10's unindexed search would have been.

**Exercises**
1. Temporarily drop `idx_post_hashtags_hashtag` (`DROP INDEX idx_post_hashtags_hashtag`), rerun the `EXPLAIN QUERY PLAN` script above, and confirm the `post_hashtags` line reverts to `SCAN`. Restore the index afterward.
2. Add a `GET /hashtags` endpoint listing every distinct tag with how many posts use it (`COUNT(*)` with a `GROUP BY` — a preview of Lesson 19).

**Definition of Done**
* [x] `GET /hashtags/{name}/posts` correctly returns posts via a four-table join.
* [x] A composite primary key's directional limitation identified and fixed with a targeted second index.
* [x] Every table in the join chain verified `SEARCH`, not `SCAN`, via `EXPLAIN QUERY PLAN`.
* [x] Commit: `feat: browse posts by hashtag with verified index coverage`

---

## Context Snapshot (End of Lesson 12)

**2. Schema State (addition):** `idx_post_hashtags_hashtag` index on `post_hashtags(hashtag_id)`.

**3. API Manifest (addition):** `GET /hashtags/{tag_name}/posts` → `list[FeedPost]`.

**5. Test State:** 19 tests, 19 passing.

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Composite index column order | L12 | A multi-column index only accelerates lookups on its leading column(s), left to right |
| Implicit index (from `UNIQUE`) | L12 | `UNIQUE` (and `PRIMARY KEY`) automatically creates a supporting index, with no separate `CREATE INDEX` needed |
| Join chain cost | L12 | Cost compounds across multiple joins even when each individual step is indexed |

**7. Lesson Completion State:**
- Completed: Lessons 1-12, Interludes A, B, C
- Next: Lesson 13 — Creating an Account (password hashing, salting)

**8. Current Architecture State:**
- HTTP Layer: 18 routes
- Business Logic: `extract_hashtags`
- Data Access: `db.py`, four-table join, composite-index gap identified and closed
- ORM: not introduced
- Authentication: not introduced (Lesson 13 begins this)
