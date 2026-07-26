# Lesson 21: Administrator Analytics

**What you will build**
An admin-only analytics endpoint ranking every member's posts by likes *within that member's own posts*, using a window function — and then wrapping that query in a `VIEW` so it can be reused without repeating the SQL. The problem we're solving: Lesson 19's `GROUP BY` collapsed many rows into one summary row per group. Ranking needs the opposite: keep every individual post visible, while still computing something that depends on how it compares to others in its group.

**What you need to know first**
Lesson 19 (`GROUP BY`, aggregation). Lesson 15's exercise (a `require_admin` dependency, built for real here).

---

## Concept Unit: Window Functions

### The Problem

`GROUP BY post.author_id, COUNT(*)` (Lesson 19's tool) would answer "how many posts does each member have" — but it collapses every member down to one row, losing each individual post entirely. We want the opposite: every post still visible as its own row, with an added column showing where it ranks *among that same author's other posts* by likes.

### The failing test

```python
def test_admin_analytics_ranks_posts_per_author():
    admin_token = login_and_get_token("admin_user", "adminpass123")
    response = client.get("/admin/analytics", headers=auth_header(admin_token))
    assert response.status_code == 200
    data = response.json()
    assert "rank_within_author" in data[0]

def test_non_admin_cannot_access_analytics():
    member_token = login_and_get_token("carol", "hunter2000")
    response = client.get("/admin/analytics", headers=auth_header(member_token))
    assert response.status_code == 403
```

Run it:

```bash
pytest tests/
```

```text
FAILED tests/test_api.py::test_admin_analytics_ranks_posts_per_author
404 != 200
```

### Introduce the concept in isolation

Create `lab_window.py`:

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row
conn.execute("CREATE TABLE sales (rep TEXT, amount INTEGER)")
for rep, amount in [("ada", 100), ("ada", 300), ("ada", 200), ("grace", 150), ("grace", 400)]:
    conn.execute("INSERT INTO sales VALUES (?, ?)", (rep, amount))

rows = conn.execute("""
    SELECT rep, amount,
           RANK() OVER (PARTITION BY rep ORDER BY amount DESC) AS rank_within_rep
    FROM sales
""").fetchall()
for row in rows:
    print(dict(row))
```

Run it:

```bash
python lab_window.py
```

Output:

```text
{'rep': 'ada', 'amount': 300, 'rank_within_rep': 1}
{'rep': 'ada', 'amount': 200, 'rank_within_rep': 2}
{'rep': 'ada', 'amount': 100, 'rank_within_rep': 3}
{'rep': 'grace', 'amount': 400, 'rank_within_rep': 1}
{'rep': 'grace', 'amount': 150, 'rank_within_rep': 2}
```

*What this proves:* every original row is still present — five rows in, five rows out, unlike `GROUP BY`, which would have collapsed this to two rows (one per `rep`). `RANK() OVER (PARTITION BY rep ORDER BY amount DESC)` computed a per-row rank *relative to other rows sharing the same `rep`*, without removing or merging any row.

### Explain the mechanism

`PARTITION BY rep` divides the rows into groups, the same conceptual partitioning `GROUP BY` does — but instead of collapsing each group into one output row, a **window function** computes its value by looking across each row's group ("window") while still returning one output row per *input* row. `ORDER BY amount DESC` inside the `OVER (...)` clause determines the ranking order *within* each partition — a completely separate `ORDER BY` from any that might appear at the end of the whole query, governing final output order.

### Discard the throwaway example

Delete `lab_window.py`. Build the real admin analytics query.

### Project Change

* **Files affected:** `main.py`.
* **Change type:** Modify.

### The New Code

```python
def require_admin(current_member: dict = Depends(get_current_member)) -> dict:
    if current_member["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_member

@app.get("/admin/analytics")
def get_analytics(admin: dict = Depends(require_admin)):
    conn = get_connection()
    rows = conn.execute("""
        SELECT
            posts.id,
            posts.content,
            members.username AS author,
            posts.like_count,
            RANK() OVER (PARTITION BY posts.author_id ORDER BY posts.like_count DESC) AS rank_within_author
        FROM posts
        JOIN members ON posts.author_id = members.id
    """).fetchall()
    conn.close()
    return [dict(row) for row in rows]
```

### Mechanical walkthrough

1. `def require_admin(current_member: dict = Depends(get_current_member)) -> dict`: (first appearance of a **dependency that itself depends on another dependency**). FastAPI resolves `get_current_member` first, hands its result into `require_admin`, which then either raises or passes the same value through — `require_admin` is a thin wrapper adding a role check on top of an already-established dependency, not a rewrite of it.
2. `admin: dict = Depends(require_admin)`: (already-established `Depends()` pattern, chained one level deeper than any route so far). The route itself never checks the role directly; by the time `get_analytics` runs at all, admin access is already guaranteed.
3. `RANK() OVER (PARTITION BY posts.author_id ORDER BY posts.like_count DESC)`: (already-established from isolation, applied for real). Every post keeps its own row; `rank_within_author` reports where it stands among that specific author's other posts, by likes.

### CS Lens

**Window functions vs. `GROUP BY` — same partitioning idea, opposite output shape.** Both divide rows into groups by a key. `GROUP BY` answers "one summary value per group" and discards individual rows. A window function answers "one computed value attached to *each* individual row, informed by its group" and keeps every row. Recognizing which shape a question actually needs — "one row per group" or "every row, annotated" — is the real skill; the SQL syntax is secondary to that recognition.

### SE Lens

**Layered dependencies as composable authorization.** `require_admin` didn't reimplement identity verification — it composed on top of `get_current_member`, adding exactly one more condition. This is the same Dependency Inversion instinct from Lesson 16, now visibly stacking: routes can require exactly the level of access they need, built from small, independently-understandable pieces, rather than one large all-purpose auth function trying to handle every case with internal branching.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 29 items

tests/test_api.py ............................                           [ 97%]
tests/test_units.py .                                                    [100%]

============================== 29 passed in 0.12s ===============================
```

### Connecting sentence

This query is genuinely complex — a join plus a window function. The next unit makes it reusable without repeating that complexity everywhere it's needed.

---

## Concept Unit: Views

### The Problem

If a second endpoint (or a future admin dashboard, or an ad-hoc report) ever needs this same ranked data, copying the query again means two places to keep in sync — exactly the duplication problem Lesson 16 solved for application code, not yet solved for a query this complex.

### Introduce the concept in isolation

Create `lab_view.py`:

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE sales (rep TEXT, amount INTEGER)")
conn.execute("INSERT INTO sales VALUES ('ada', 300)")
conn.execute("INSERT INTO sales VALUES ('ada', 100)")

conn.execute("""
    CREATE VIEW ranked_sales AS
    SELECT rep, amount, RANK() OVER (PARTITION BY rep ORDER BY amount DESC) AS rnk
    FROM sales
""")

print(conn.execute("SELECT * FROM ranked_sales").fetchall())
print(conn.execute("SELECT * FROM ranked_sales WHERE rnk = 1").fetchall())
```

Run it:

```bash
python lab_view.py
```

Output:

```text
[('ada', 300, 1), ('ada', 100, 2)]
[('ada', 300, 1)]
```

*What this proves:* `ranked_sales` can be queried exactly like a real table — including adding its own `WHERE` clause on top, filtering by the computed `rnk` column — even though it's not real, stored data. `CREATE VIEW` saves a *query*, not its *results*; every `SELECT FROM ranked_sales` re-runs the underlying query against current data, which is why it stayed correct with no extra step even after data changes.

### Explain the mechanism

A **view** is a named, saved query that behaves like a read-only table to anything querying it. Unlike a CTE (Lesson 19), which only exists for the duration of one query, a view persists in the database schema itself — any query, from any part of the application, can reference it by name going forward. This is worth being precise about: a view is not a copy of data (that would be a **materialized view**, a different, separate concept SQLite doesn't build in) — it's purely a saved *question*, re-answered fresh every time it's queried.

### Discard the throwaway example

Delete `lab_view.py`. Turn the analytics query into a real view.

### Project Change

* **Files affected:** `db.py`, `main.py`.
* **Change type:** Modify.

### The New Code

```python
# db.py — add inside init_db()
conn.execute("""
    CREATE VIEW IF NOT EXISTS post_rankings AS
    SELECT
        posts.id,
        posts.content,
        members.username AS author,
        posts.like_count,
        RANK() OVER (PARTITION BY posts.author_id ORDER BY posts.like_count DESC) AS rank_within_author
    FROM posts
    JOIN members ON posts.author_id = members.id
""")
```

```python
# main.py — get_analytics, simplified
@app.get("/admin/analytics")
def get_analytics(admin: dict = Depends(require_admin)):
    conn = get_connection()
    rows = conn.execute("SELECT * FROM post_rankings").fetchall()
    conn.close()
    return [dict(row) for row in rows]
```

### Mechanical walkthrough

1. `CREATE VIEW IF NOT EXISTS post_rankings AS SELECT ...`: (already-established from isolation, real syntax, following Lesson 2's `IF NOT EXISTS` habit). The entire window-function query now lives in exactly one place, in `db.py`, alongside the rest of the schema.
2. `SELECT * FROM post_rankings`: (already-established basic `SELECT`, dramatically simpler than the query it replaced). `get_analytics` no longer contains a single `JOIN` or `RANK()` — it queries `post_rankings` as if it were an ordinary table.

### CS Lens

**Views, CTEs, and repositories are the same underlying idea at three different scopes.** A CTE (Lesson 19) names an intermediate result for one query. A view (this lesson) names a query for the whole database, reusable across every future query. A repository method (Lesson 16) names a query for the whole application, reusable across every route. All three exist for the identical reason: give a complex, meaningful computation a name, so it can be referred to instead of re-derived.

### SE Lens

**Choosing view vs. CTE vs. repository method is about scope of reuse, not power — pick the narrowest one that fits.** This query only needed reuse *within the database layer itself*, and only across potentially multiple future queries — a view fits exactly that scope. A CTE would have been too narrow (gone the instant the query finishes). A full repository method would have been a reasonable alternative too, but would tie the reusable logic to application code rather than the database schema itself — a real, debatable design choice, not an obviously correct one.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 29 items

tests/test_api.py ............................                           [ 97%]
tests/test_units.py .                                                    [100%]

============================== 29 passed in 0.12s ===============================
```

### Connecting sentence

Phase 7 is complete — the project can rank, aggregate, and personalize data using real SQL power, not just simple filters. Phase 8 shifts focus entirely: making this system reliable and fast under real-world operating conditions, not just correct.

---

## Closing

**Connect the pieces**
`require_admin` composes on top of `get_current_member`, guaranteeing role before `get_analytics` runs at all. The underlying computation — a join combined with a `RANK() OVER (PARTITION BY ...)` window function — lives in exactly one place, `post_rankings`, a view queried as simply as any real table, re-answering itself fresh against current data every time.

**What breaks without this**
Without the view, any second place needing this same ranked data (a future dashboard endpoint, an ad-hoc admin report) would either duplicate the whole window-function query, or import and call an ad-hoc Python function containing it — either way, drifting apart from the original the moment one copy gets updated and the other doesn't, the identical risk Lesson 16 addressed for authorization logic, now recognized in the schema layer too.

**Exercises**
1. Add `WHERE rank_within_author = 1` to `get_analytics`'s query against `post_rankings`, returning only each author's single top post — direct proof the view behaves like a real, filterable table.
2. Create a second view, `top_taggers`, ranking members by how many distinct hashtags they've used across all their posts (`COUNT(DISTINCT hashtags.name)`, `GROUP BY members.id` — a genuine `GROUP BY` this time, not a window function, since a full collapse per member is exactly what's wanted here).

**Definition of Done**
* [x] `require_admin` composes on `get_current_member`, protecting the analytics endpoint.
* [x] Per-author post ranking computed via `RANK() OVER (PARTITION BY ...)`, preserving every row.
* [x] The query saved as a real, reusable `post_rankings` view.
* [x] Commit: `feat: admin analytics via window-function view with layered authorization`

---

## Context Snapshot (End of Lesson 21)

**2. Schema State (addition):** `post_rankings` view.

**3. API Manifest (addition):** `GET /admin/analytics` (admin-only) → ranked post list.

**5. Test State:** 29 tests, 29 passing.

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Window function (`OVER`, `PARTITION BY`) | L21 | Computes a per-row value relative to a group, without collapsing rows |
| `RANK()` | L21 | A window function ranking rows within their partition |
| Chained/composed dependency | L21 | A `Depends()` that itself depends on another, layering conditions |
| View (`CREATE VIEW`) | L21 | A named, saved query behaving like a read-only table, re-evaluated on every use |
| Materialized view (contrast) | L21 | A saved query's stored *results* (not built into SQLite) — distinct from a regular view's saved *question* |

**7. Lesson Completion State:**
- Completed: Lessons 1-21, Interludes A, B, C, D — **Phase 7 complete**
- Next: Lesson 22 — A Reliable Application (error pages, structured logging)

**8. Current Architecture State:**
- HTTP Layer: 23 routes
- Business Logic: `extract_hashtags`, `create_access_token`, `get_current_member`, `require_admin`
- Data Access: first view, first window function
- ORM: partially adopted
- Authentication: complete, with layered role-based dependencies
