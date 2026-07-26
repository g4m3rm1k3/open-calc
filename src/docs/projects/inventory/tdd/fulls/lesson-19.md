# Lesson 19: Seeing Trending Posts

**What you will build**
A `/trending` endpoint ranking posts by a combined score of likes and comments — the first query that summarizes *many* rows into one number per post, rather than retrieving rows as-is. The problem we're solving: every query so far has returned rows more or less directly. "Trending" needs a genuinely different kind of question answered: not "what are the comments on this post," but "how many comments does each post have," computed across the whole table at once.

**What you need to know first**
Lesson 8 (`like_count`, denormalization). Lesson 12 (multi-table joins, `EXPLAIN QUERY PLAN`). NexusInventory's recursive CTE (today's CTE is simpler — no recursion — but the same `WITH` syntax).

---

## Concept Unit: Aggregation with `GROUP BY`

### The Problem

`posts.like_count` already exists as a denormalized column (Lesson 8) — fast to read directly. Comment counts don't have an equivalent column; counting them means asking, for every post, "how many rows in `comments` have this `post_id`" — a fundamentally different shape of question than anything queried directly before.

### The failing test

```python
def test_trending_ranks_by_combined_engagement():
    popular = client.post("/posts", json={"content": "popular"}, headers=auth_header(1)).json()
    quiet = client.post("/posts", json={"content": "quiet"}, headers=auth_header(1)).json()
    client.post(f"/posts/{popular['id']}/comments", json={"content": "wow"}, headers=auth_header(2))
    client.post(f"/posts/{popular['id']}/comments", json={"content": "nice"}, headers=auth_header(2))

    response = client.get("/trending")
    ids_in_order = [p["id"] for p in response.json()]
    assert ids_in_order.index(popular["id"]) < ids_in_order.index(quiet["id"])
```

Run it:

```bash
pytest tests/
```

```text
FAILED tests/test_api.py::test_trending_ranks_by_combined_engagement
404 != 200
```

### Introduce the concept in isolation

Create `lab_groupby.py`:

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY, customer TEXT)")
for customer in ["ada", "ada", "grace", "ada", "grace"]:
    conn.execute("INSERT INTO orders (customer) VALUES (?)", (customer,))

rows = conn.execute("""
    SELECT customer, COUNT(*) as order_count
    FROM orders
    GROUP BY customer
""").fetchall()
print(rows)
```

Run it:

```bash
python lab_groupby.py
```

Output:

```text
[('ada', 3), ('grace', 2)]
```

*What this proves:* `GROUP BY customer` collapses every row sharing the same `customer` value into a single output row, and `COUNT(*)` — an **aggregate function**, computed once per group rather than once per row — reports how many original rows fed into each group. Five input rows became two output rows, each summarizing several of the originals rather than representing any single one of them.

### Explain the mechanism

Every `SELECT` so far has returned roughly one output row per matching input row (filtered, joined, ordered — but still fundamentally row-shaped). `GROUP BY` changes that: rows are first partitioned into buckets by the grouping column's value, then every column in the `SELECT` list must either be the grouping column itself, or an aggregate function summarizing each bucket — there's no way to also select an individual row's own, ungrouped value once grouping is in play, because a group might contain many differing values for it.

### Discard the throwaway example

Delete `lab_groupby.py`. Build the real trending query — but grouping and joining together needs one more concept first, introduced in the second unit below.

---

## Concept Unit: CTEs and `LEFT JOIN`

### The Problem

Combining `like_count` (a direct column) with a `COUNT` of comments (an aggregate over a joined table) in one query gets tangled quickly if written as one flat `SELECT`. Worse: a straightforward `JOIN` between `posts` and `comments` would silently *drop* any post with zero comments — because a plain `JOIN` only keeps rows that found a match on both sides, and a post with no comments has nothing to match.

### Introduce the concept in isolation

Create `lab_left_join.py`:

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row
conn.execute("CREATE TABLE posts (id INTEGER PRIMARY KEY, title TEXT)")
conn.execute("CREATE TABLE comments (post_id INTEGER)")
conn.execute("INSERT INTO posts VALUES (1, 'popular')")
conn.execute("INSERT INTO posts VALUES (2, 'quiet, no comments')")
conn.execute("INSERT INTO comments VALUES (1)")

print("Regular JOIN:")
rows = conn.execute("SELECT posts.title FROM posts JOIN comments ON posts.id = comments.post_id").fetchall()
print([r["title"] for r in rows])

print("LEFT JOIN:")
rows = conn.execute("SELECT posts.title FROM posts LEFT JOIN comments ON posts.id = comments.post_id").fetchall()
print([r["title"] for r in rows])
```

Run it:

```bash
python lab_left_join.py
```

Output:

```text
Regular JOIN:
['popular']
LEFT JOIN:
['popular', 'quiet, no comments']
```

*What this proves:* a regular `JOIN` (every join used so far in this project has been this kind, technically an **inner join**) silently excludes "quiet, no comments" entirely, because it never matched any `comments` row. `LEFT JOIN` keeps every row from the left-hand table (`posts`) regardless of whether a match exists on the right, filling in `NULL` for the unmatched side's columns instead of dropping the row.

### Explain the mechanism, and why this matters here specifically

Every `JOIN` used in this project through Lesson 18 happened to be safe as an inner join, because the relationship being queried always guaranteed a match would exist (a post always has an author; a comment always has a post). Trending is different: a brand new post, with zero comments, is exactly the case an inner join would silently erase from the results — not an error, not a crash, just a post that should appear ranked last quietly missing from the list entirely. This is a real, easy-to-miss bug class: the query *runs*, returns a *plausible-looking* result, and is *wrong* in a way no error message reveals.

### Discard the throwaway example

Delete `lab_left_join.py`. Build the real trending endpoint, combining `GROUP BY`, `LEFT JOIN`, and a CTE to keep the whole thing readable.

### Project Change

* **Files affected:** `main.py`.
* **Change type:** Modify.

### The New Code

```python
@app.get("/trending", response_model=list[FeedPost])
def get_trending():
    conn = get_connection()
    rows = conn.execute("""
        WITH comment_counts AS (
            SELECT post_id, COUNT(*) AS comment_count
            FROM comments
            GROUP BY post_id
        )
        SELECT
            posts.id,
            posts.content,
            posts.created_at,
            members.username,
            posts.like_count + COALESCE(comment_counts.comment_count, 0) AS score
        FROM posts
        JOIN members ON posts.author_id = members.id
        LEFT JOIN comment_counts ON posts.id = comment_counts.post_id
        ORDER BY score DESC
    """).fetchall()
    conn.close()
    return [dict(row) for row in rows]
```

### Mechanical walkthrough

1. `WITH comment_counts AS (SELECT post_id, COUNT(*) AS comment_count FROM comments GROUP BY post_id)`: (already-established `WITH` syntax from NexusInventory's recursive CTE, non-recursive use here). Names this grouped-and-counted result `comment_counts`, so the main query below can reference it like an ordinary table, rather than nesting the whole aggregation inline.
2. `LEFT JOIN comment_counts ON posts.id = comment_counts.post_id`: (already-established from the isolation example). A post with zero comments has no row in `comment_counts` at all (since `GROUP BY` only produces a group for `post_id`s that actually appear in `comments`), so this correctly keeps it, with `NULL` where `comment_count` would be.
3. `COALESCE(comment_counts.comment_count, 0)`: (first appearance). Replaces a `NULL` with a specific fallback value — necessary here because `posts.like_count + NULL` would evaluate to `NULL` in SQL (not `posts.like_count`), silently corrupting the score for every post with zero comments if left unhandled.
4. `ORDER BY score DESC`: (already-established `ORDER BY` from Lesson 5), now sorting by a column computed inline in the `SELECT` list itself, rather than a column stored directly in a table.

### CS Lens

**CTEs as named, composable intermediate results — the SQL equivalent of extracting a helper function.** `comment_counts` could have been written as a nested subquery inline instead of a named `WITH` block, with identical results — the CTE exists purely for readability and reuse, the same motivation behind Lesson 16 extracting `can_modify` out of two duplicated route bodies. Complex queries, like complex code, benefit from being broken into named, individually-understandable pieces.

### SE Lens

**Choosing `LEFT JOIN` over `JOIN` is a correctness decision, not a style preference.** This is worth being explicit about because the two produce identical results whenever every row happens to have a match — exactly the situation every prior join in this project has been in, which is why the distinction never mattered until now. The instinct to check "could the right-hand side of this join legitimately be empty for some valid rows on the left?" is the actual skill; get it wrong and the bug is a silently incomplete result set, not a crash — arguably worse, since nothing signals anything went wrong at all.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 26 items

tests/test_api.py .........................                              [ 96%]
tests/test_units.py .                                                    [100%]

============================== 26 passed in 0.10s ===============================
```

### Connecting sentence

Trending ranks everyone by the same global formula. The next lesson personalizes results — recommending content based on *who's asking*, which needs a different SQL tool: subqueries and `EXISTS`.

---

## Closing

**Connect the pieces**
The `comment_counts` CTE groups and counts comments per post once, named for reuse. The main query `LEFT JOIN`s that result onto every post — deliberately, so a brand-new post with zero comments still appears rather than silently vanishing — combines it with the already-denormalized `like_count` via `COALESCE` to handle the `NULL` gap correctly, and orders by the resulting score.

**What breaks without this**
Using a regular `JOIN` instead of `LEFT JOIN` here would mean any post with zero comments simply never appears in `/trending` at all — not ranked last, not visible with a score of however-many-likes, just absent, with the endpoint returning `200` and a plausible-looking list the whole time, no error anywhere to reveal the gap.

**Exercises**
1. Temporarily change `LEFT JOIN` back to a regular `JOIN`, create a fresh post with zero comments and zero likes, and confirm it disappears from `/trending` entirely — direct, hands-on proof of the bug this lesson exists to prevent.
2. Add a `WITH like_details AS (...)` CTE breaking the like count out explicitly too (even though it's already denormalized on `posts`), purely as an exercise in reading and writing multiple CTEs chained together in one `WITH` clause.

**Definition of Done**
* [x] `/trending` combines denormalized likes with live-aggregated comment counts.
* [x] `LEFT JOIN` used deliberately, with `COALESCE` handling the resulting `NULL`s.
* [x] A CTE names the aggregation step for readability.
* [x] Commit: `feat: trending posts via CTE aggregation with correct LEFT JOIN semantics`

---

## Context Snapshot (End of Lesson 19)

**3. API Manifest (addition):** `GET /trending` → `list[FeedPost]`, ordered by likes + comments.

**5. Test State:** 26 tests, 26 passing.

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Aggregate function (`COUNT`) | L19 | A function computed once per group, not once per row |
| `GROUP BY` | L19 | Partitions rows into buckets by a column's value before aggregating |
| Inner join (implicit, all prior `JOIN`s) | L19 | Only keeps rows with a match on both sides — silently drops the rest |
| `LEFT JOIN` | L19 | Keeps every row from the left table regardless of a match, filling `NULL` where unmatched |
| `COALESCE` | L19 | Replaces a `NULL` with a specified fallback value |
| CTE for non-recursive staging | L19 | `WITH` naming an intermediate result for readability, without recursion |

**7. Lesson Completion State:**
- Completed: Lessons 1-19, Interludes A, B, C, D
- Next: Lesson 20 — Recommended Content (subqueries, `EXISTS`)

**8. Current Architecture State:**
- HTTP Layer: 21 routes
- Business Logic: `extract_hashtags`, `create_access_token`, `get_current_member`
- Data Access: first aggregation query, first deliberate `LEFT JOIN`
- ORM: partially adopted
- Authentication: complete
