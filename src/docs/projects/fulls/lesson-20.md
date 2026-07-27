# Lesson 20: Recommended Content

**What you will build**
A `/recommendations` endpoint: posts from people the current member follows, excluding posts they've already liked — the first query personalized to *who's asking*, using a query nested inside another query. The problem we're solving: every query so far answers the same question for everyone. Recommendations need "posts from authors *this specific member* follows" — a filter that depends on the caller's identity and their relationships, not a fixed condition.

**What you need to know first**
Lesson 19 (`WITH`, aggregation). Lesson 9 (`follows`). Lesson 14 (`get_current_member`).

---

## Concept Unit: Subqueries

### The Problem

We have `follows` (who follows whom) and `posts` (who wrote what) as separate tables. Filtering posts down to "written by someone I follow" means using one query's *result* as an input condition to another query — nothing built so far has queried like that; every `WHERE` condition has compared a column against a literal value or a parameter, never against the output of another query.

### The failing test

```python
def test_recommendations_only_show_followed_authors():
    token1 = login_and_get_token("carol", "hunter2000")
    token2 = login_and_get_token("dave", "correcthorse")
    client.post("/members/2/follow", json={}, headers=auth_header(token1))  # carol follows dave
    client.post("/posts", json={"content": "from dave"}, headers=auth_header(token2))
    client.post("/posts", json={"content": "from someone not followed"}, headers=auth_header(token1))

    response = client.get("/recommendations", headers=auth_header(token1))
    contents = [p["content"] for p in response.json()]
    assert "from dave" in contents
    assert "from someone not followed" not in contents
```

Run it:

```bash
pytest tests/
```

```text
FAILED tests/test_api.py::test_recommendations_only_show_followed_authors
404 != 200
```

### Introduce the concept in isolation

Create `lab_subquery.py`:

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, grade INTEGER)")
conn.execute("CREATE TABLE honor_roll (student_id INTEGER)")
for name, grade in [("ada", 95), ("grace", 70), ("bob", 88)]:
    conn.execute("INSERT INTO students (name, grade) VALUES (?, ?)", (name, grade))
conn.execute("INSERT INTO honor_roll VALUES (1)")  # ada
conn.execute("INSERT INTO honor_roll VALUES (3)")  # bob

rows = conn.execute("""
    SELECT name FROM students
    WHERE id IN (SELECT student_id FROM honor_roll)
""").fetchall()
print([r[0] for r in rows])
```

Run it:

```bash
python lab_subquery.py
```

Output:

```text
['ada', 'bob']
```

*What this proves:* `(SELECT student_id FROM honor_roll)` runs as its own complete query, producing a list of ids — `[1, 3]` — which `WHERE id IN (...)` then treats exactly like a literal list, the same `IN` operator behavior you'd get from `WHERE id IN (1, 3)` written by hand. The inner query doesn't reference anything from the outer `students` table at all; it's a complete, standalone question ("which student ids are on the honor roll"), whose answer is then used to filter a different table entirely.

### Explain the mechanism

This particular kind of subquery is **uncorrelated** — it can be evaluated once, completely independently of the outer query, because nothing inside it depends on any row the outer query is currently looking at. This matters for the next unit, which introduces a subquery that *isn't* independent in this way.

### Discard the throwaway example

Delete `lab_subquery.py`. Apply this to filter posts by followed authors.

### Project Change

* **Files affected:** `main.py`.
* **Change type:** Modify.

### The New Code

```python
@app.get("/recommendations", response_model=list[FeedPost])
def get_recommendations(current_member: dict = Depends(get_current_member)):
    conn = get_connection()
    rows = conn.execute("""
        SELECT posts.id, posts.content, posts.created_at, members.username
        FROM posts
        JOIN members ON posts.author_id = members.id
        WHERE posts.author_id IN (
            SELECT followed_id FROM follows WHERE follower_id = ?
        )
        ORDER BY posts.created_at DESC
    """, (current_member["id"],)).fetchall()
    conn.close()
    return [dict(row) for row in rows]
```

### Mechanical walkthrough

1. `WHERE posts.author_id IN (SELECT followed_id FROM follows WHERE follower_id = ?)`: (already-established `IN` + subquery from isolation, real usage). The inner query answers "who does this specific member follow," parameterized by `current_member["id"]"; the outer query then keeps only posts whose author appears in that list.
2. This subquery is technically uncorrelated *per request* — its result depends on `current_member["id"]`, supplied once via the `?` parameter, but doesn't change per row of the outer `posts` table being examined. That distinction — "depends on an outer parameter, but not on the current outer *row*" — is what keeps it in the uncorrelated category, and is worth sitting with, since it's easy to conflate with the correlated case introduced next.

### CS Lens

**Subqueries as function composition.** `(SELECT followed_id FROM follows WHERE follower_id = ?)` behaves like a small function returning a set of ids, whose output becomes another query's input — the same compositional idea as passing one function's return value as another function's argument in ordinary code, expressed here entirely within SQL.

### SE Lens

**Filtering in SQL instead of in Python is a real performance decision, not just style.** An alternative would be: fetch every post in Python, fetch the follow list separately, and filter with a Python list comprehension. That works, but transfers every post row over the connection only to discard most of them in application code — wasted work directly proportional to how many posts exist, the same category of unnecessary cost Lesson 10's unindexed search demonstrated. Pushing the filter into the query means only the rows that actually matter ever leave the database at all.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 27 items

tests/test_api.py ..........................                             [ 96%]
tests/test_units.py .                                                    [100%]

============================== 27 passed in 0.11s ===============================
```

### Connecting sentence

Recommendations now correctly scope to followed authors — but they'll keep re-showing posts the member has already liked, forever. Excluding those needs a subquery that *does* depend on the specific outer row being examined.

---

## Concept Unit: `EXISTS` and Correlated Subqueries

### The Problem

"Exclude posts I've already liked" means, for *each individual post* being considered, asking "does a row in `likes` exist for *this specific post* and *this specific member*" — a question whose answer genuinely differs per outer row, unlike the previous unit's follow-list, which was the same fixed set for every post examined.

### Introduce the concept in isolation

Create `lab_exists.py`:

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE posts (id INTEGER PRIMARY KEY, title TEXT)")
conn.execute("CREATE TABLE likes (post_id INTEGER, member_id INTEGER)")
conn.execute("INSERT INTO posts VALUES (1, 'liked already')")
conn.execute("INSERT INTO posts VALUES (2, 'not liked yet')")
conn.execute("INSERT INTO likes VALUES (1, 99)")

rows = conn.execute("""
    SELECT title FROM posts
    WHERE NOT EXISTS (
        SELECT 1 FROM likes WHERE likes.post_id = posts.id AND likes.member_id = 99
    )
""").fetchall()
print([r[0] for r in rows])
```

Run it:

```bash
python lab_exists.py
```

Output:

```text
['not liked yet']
```

*What this proves:* `likes.post_id = posts.id` inside the subquery references `posts.id` — a column from the *outer* query, not from `likes` at all. This is only meaningful because the subquery is conceptually re-evaluated once per outer row: for post 1, it checks "does a like by member 99 exist for post 1" (yes, excluded); for post 2, "for post 2" (no, included). This is a **correlated subquery** — its condition and result genuinely depend on which outer row is currently being considered, unlike the previous unit's follow-list subquery.

### Explain `EXISTS` specifically

`SELECT 1 FROM likes WHERE ...` — selecting the literal value `1` is a common convention signaling "we don't care what columns come back, only whether *any* row matches at all." `EXISTS` (and `NOT EXISTS`) only ever needs a yes/no answer, so the database engine can stop searching the instant it finds one matching row, rather than needing to enumerate every match — unlike `IN` with a large subquery result, or a `COUNT(*) > 0` style check, both of which conceptually need to fully determine the set (or the count) before answering, when a single match would already settle the question.

### Discard the throwaway example

Delete `lab_exists.py`. Add the exclusion to `/recommendations`.

### Project Change

* **Files affected:** `main.py`.
* **Change type:** Modify.

### The New Code

```python
@app.get("/recommendations", response_model=list[FeedPost])
def get_recommendations(current_member: dict = Depends(get_current_member)):
    conn = get_connection()
    rows = conn.execute("""
        SELECT posts.id, posts.content, posts.created_at, members.username
        FROM posts
        JOIN members ON posts.author_id = members.id
        WHERE posts.author_id IN (
            SELECT followed_id FROM follows WHERE follower_id = ?
        )
        AND NOT EXISTS (
            SELECT 1 FROM likes
            WHERE likes.post_id = posts.id AND likes.member_id = ?
        )
        ORDER BY posts.created_at DESC
    """, (current_member["id"], current_member["id"])).fetchall()
    conn.close()
    return [dict(row) for row in rows]
```

### Mechanical walkthrough

1. Two `?` placeholders now, both bound to `current_member["id"]"` but serving different roles: (already-established parameterization, first time the *same* value is needed in two structurally different places in one query). The first scopes *whose posts* to consider; the second scopes *whose likes* to check against.
2. `AND NOT EXISTS (...)`: (already-established `NOT EXISTS` from isolation, combined with the earlier `IN` condition via `AND`). Both conditions must hold: authored by someone followed, *and* not already liked by this member.

### CS Lens

**Correlated vs. uncorrelated subqueries — a real cost distinction, not just a syntactic one.** The `IN` subquery from the previous unit is evaluated once per request. The `EXISTS` subquery here is conceptually evaluated once *per candidate row* — real database engines optimize this heavily (often turning it into a join internally, checkable via `EXPLAIN QUERY PLAN`), but understanding the conceptual difference is what lets you predict, before measuring, which kind of subquery is more likely to need that optimization to perform well at scale.

### SE Lens

**`EXISTS` over `COUNT(*) > 0` when only presence matters.** It would be possible to write this exclusion as `(SELECT COUNT(*) FROM likes WHERE ...) = 0` instead — same logical result, but phrased as "count everything, then compare," when the actual question was always just "does anything match." `EXISTS` says exactly what's meant, and gives the query engine the clearest possible signal about what it actually needs to compute.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 27 items

tests/test_api.py ..........................                             [ 96%]
tests/test_units.py .                                                    [100%]

============================== 27 passed in 0.11s ===============================
```

### Connecting sentence

Recommendations are personalized correctly now. The final lesson of this phase steps back to the administrator's view — analytics across the whole platform, using window functions, a SQL tool that doesn't collapse rows the way `GROUP BY` does.

---

## Closing

**Connect the pieces**
`/recommendations` combines two subqueries with different characters: an uncorrelated `IN` subquery scoping posts to followed authors (evaluated once, independent of any specific candidate row), and a correlated `NOT EXISTS` subquery excluding already-liked posts (conceptually re-evaluated per candidate row, referencing that row's own `id`). Together they express a genuinely personalized query no single flat `WHERE` clause without subqueries could state as directly.

**What breaks without this**
Without `NOT EXISTS`, recommendations would repeat posts the member has already engaged with indefinitely — functionally correct in that nothing crashes, but a real product failure, since the entire point of a recommendation feed is showing something new.

**Exercises**
1. Add a second exclusion: posts written by the member themself shouldn't appear in their own recommendations, even if (hypothetically) they somehow followed themselves. Use `AND posts.author_id != ?` alongside the existing conditions.
2. Run `EXPLAIN QUERY PLAN` on the final `/recommendations` query and identify which parts use `SEARCH` versus `SCAN` — cross-reference against which columns from Lessons 9 and 12 are and aren't indexed.

**Definition of Done**
* [x] `/recommendations` filters by followed authors via an uncorrelated `IN` subquery.
* [x] Already-liked posts excluded via a correlated `NOT EXISTS` subquery.
* [x] Can explain, without notes, the difference between the two subqueries used in this lesson.
* [x] Commit: `feat: personalized recommendations via correlated and uncorrelated subqueries`

---

## Context Snapshot (End of Lesson 20)

**3. API Manifest (addition):** `GET /recommendations` → `list[FeedPost]`, personalized per authenticated member.

**5. Test State:** 27 tests, 27 passing.

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Subquery | L20 | A query nested inside another, whose result feeds the outer query |
| Uncorrelated subquery | L20 | Evaluable independently, once, with no dependency on the outer query's current row |
| Correlated subquery | L20 | References a column from the outer query's current row; conceptually re-evaluated per row |
| `EXISTS` / `NOT EXISTS` | L20 | Yes/no presence check, able to short-circuit at the first match |

**7. Lesson Completion State:**
- Completed: Lessons 1-20, Interludes A, B, C, D
- Next: Lesson 21 — Administrator Analytics (window functions, views)

**8. Current Architecture State:**
- HTTP Layer: 22 routes
- Business Logic: `extract_hashtags`, `create_access_token`, `get_current_member`
- Data Access: first correlated and uncorrelated subqueries
- ORM: partially adopted
- Authentication: complete
