# Python Tool Database — LAB 15b — Aggregation: GROUP BY, COUNT, SUM, AVG

**Prerequisites:** Lab 15. You have `get_assembly_details` and `list_jobs_with_assembly_names` in `queries.py`. You understand SELECT, WHERE, and JOIN. All tests pass.

**What this lab adds:**
- Aggregate functions: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`
- `GROUP BY` — collapsing many rows into one summary row per group
- `HAVING` — filtering groups after aggregation (not the same as WHERE)
- `COUNT(*)` vs `COUNT(column)` — why they differ when NULLs are present
- `tool_counts_by_type`, `average_diameter_by_material`, `materials_with_more_than_n_tools` in `queries.py`

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You run `SELECT COUNT(*) FROM tools WHERE material = 'carbide'`. What does this return? A list of rows or a single number?
> 2. `COUNT(*)` vs `COUNT(flutes)` on the `tools` table. You have 10 tools; 3 have NULL flutes. What does each return?
> 3. What is the difference between `WHERE` and `HAVING`? Why can't you use `WHERE` to filter the result of a `COUNT`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Three new query functions in `tooldb/queries.py`:

```python
tool_counts_by_type(conn)
# → [{"tool_type": "endmill", "count": 4},
#    {"tool_type": "drill",   "count": 3},
#    {"tool_type": "facemill","count": 1}]

average_diameter_by_material(conn)
# → [{"material": "carbide", "avg_diameter": 0.5125, "tool_count": 7},
#    {"material": "HSS",     "avg_diameter": 0.4375, "tool_count": 3}]

materials_with_more_than_n_tools(conn, min_count)
# → materials where COUNT(*) > min_count
```

Running `pytest tests/test_aggregation.py -v` will show:

```
PASSED tests/test_aggregation.py::test_tool_counts_by_type
PASSED tests/test_aggregation.py::test_counts_sum_to_total
PASSED tests/test_aggregation.py::test_average_diameter_by_material
PASSED tests/test_aggregation.py::test_materials_with_more_than_n_tools
PASSED tests/test_aggregation.py::test_count_star_vs_count_column
```

---

## Step 1 — The Problem Without Aggregation

You have 10 tools in the database and want to know: how many are endmills?

**Without aggregation (Python loop):**

```python
rows = conn.execute("SELECT tool_type FROM tools").fetchall()
count = sum(1 for row in rows if row[0] == "endmill")
```

You fetched every tool row, transferred all that data from SQLite to Python, and counted in Python. For 10 tools this is fine. For 100,000 tools, you transfer 100,000 rows to count one number.

**With aggregation:**

```sql
SELECT COUNT(*) FROM tools WHERE tool_type = 'endmill'
```

SQLite counts internally, returns one row with one number. No data transfer.

But what if you want the count for *every* tool type, all at once?

**Without GROUP BY:**

```python
types = conn.execute("SELECT DISTINCT tool_type FROM tools").fetchall()
for (tool_type,) in types:
    count = conn.execute("SELECT COUNT(*) FROM tools WHERE tool_type = ?",
                         (tool_type,)).fetchone()[0]
    print(tool_type, count)
# One query per type — N+1 again
```

**With GROUP BY:**

```sql
SELECT tool_type, COUNT(*) AS count
FROM tools
GROUP BY tool_type
```

One query. SQLite groups the rows by `tool_type` and returns one summary row per distinct value.

---

### Concept: Aggregate Functions — Collapsing Many Rows into One

**What they are:** Functions that compute a single value from a set of rows. They operate on a group of rows and return one result per group.

**The five standard aggregate functions:**

| Function | What it returns |
|----------|----------------|
| `COUNT(*)` | Number of rows in the group |
| `COUNT(column)` | Number of non-NULL values in the column |
| `SUM(column)` | Sum of all non-NULL values |
| `AVG(column)` | Arithmetic mean of non-NULL values |
| `MIN(column)` | Smallest non-NULL value |
| `MAX(column)` | Largest non-NULL value |

**Smallest possible example:**

```python
import sqlite3
conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE t (val REAL)")
conn.executemany("INSERT INTO t VALUES (?)", [(1.0,), (2.0,), (3.0,), (None,)])

conn.execute("SELECT COUNT(*) FROM t").fetchone()     # → (4,) — counts all rows including NULL
conn.execute("SELECT COUNT(val) FROM t").fetchone()   # → (3,) — counts only non-NULL values
conn.execute("SELECT SUM(val) FROM t").fetchone()     # → (6.0,) — NULLs ignored
conn.execute("SELECT AVG(val) FROM t").fetchone()     # → (2.0,) — 6.0 / 3 non-NULL values
conn.execute("SELECT MIN(val) FROM t").fetchone()     # → (1.0,)
conn.execute("SELECT MAX(val) FROM t").fetchone()     # → (3.0,)
```

**`COUNT(*)` vs `COUNT(column)` — the NULL difference:**

`COUNT(*)` counts rows. Rows cannot be NULL — every row exists. Result: counts ALL rows including those where the column is NULL.

`COUNT(column)` counts non-NULL values in that column. A row with `flutes = NULL` is not counted.

```sql
-- tools table: 10 rows, 3 have flutes = NULL
SELECT COUNT(*)      FROM tools   -- → 10
SELECT COUNT(flutes) FROM tools   -- → 7 (only non-NULL flutes values)
```

This is a frequent source of incorrect reports. `COUNT(column)` is not "how many rows have this column" — it is "how many rows have a non-NULL value in this column."

**You will see this again in:** Every analytics query, every dashboard, every report. "How many tools of each type do we have?" — GROUP BY + COUNT. "What is the average lead time for each supplier?" — GROUP BY + AVG. Database interviews always include aggregate function questions.

**Watch for:** `AVG` divides by the count of non-NULL values, not total rows. If 3 of 10 tools have `flutes = NULL`, `AVG(flutes)` averages the 7 non-NULL values. The 3 NULL rows are excluded from both the sum and the denominator.

---

### Concept: `GROUP BY` — One Summary Row Per Distinct Value

**What it is:** A clause that divides result rows into groups based on a column's value, then applies aggregate functions to each group independently.

**The mental model:**

Imagine sorting the tools table by `material`, then drawing a line between each material group:

```
id | name     | diameter | material    |
1  | EM-0500  | 0.500    | carbide     | ← group: carbide
2  | EM-0375  | 0.375    | carbide     |
3  | DR-0250  | 0.250    | carbide     |
--------------------------------------------
4  | EM-0500-HSS | 0.500 | HSS         | ← group: HSS
5  | DR-0500-HSS | 0.500 | HSS         |
```

`GROUP BY material` collapses each group into one summary row:

```sql
SELECT material, COUNT(*) AS count, AVG(diameter_inches) AS avg_diameter
FROM tools
GROUP BY material
```

Result:

```
material | count | avg_diameter
carbide  | 3     | 0.375
HSS      | 2     | 0.500
```

**The rule:** Any column in the SELECT that is not inside an aggregate function must appear in the GROUP BY clause. You cannot select a non-grouped, non-aggregated column:

```sql
-- WRONG: name is not aggregated and not in GROUP BY
SELECT material, name, COUNT(*) FROM tools GROUP BY material

-- CORRECT: only material (the group key) and COUNT (aggregated)
SELECT material, COUNT(*) FROM tools GROUP BY material

-- CORRECT: if you also want to group by name
SELECT material, tool_type, COUNT(*) FROM tools GROUP BY material, tool_type
```

**You will see this again in:** SQL reporting of every kind. In SQLAlchemy: `query.group_by(Tool.material)`. In Pandas: `df.groupby("material").count()` — the same mental model, different syntax. This is one of the most used SQL features after SELECT and WHERE.

**Career signal:** `GROUP BY` appears in almost every SQL interview. "Write a query to count how many tools of each type we have" is a direct GROUP BY question. Explaining *why* GROUP BY requires that non-aggregated columns appear in the GROUP BY clause signals real understanding.

**Watch for:** Selecting a column not in GROUP BY and not in an aggregate. SQLite is permissive — it allows it, picking an arbitrary value from the group. Other databases (PostgreSQL, MySQL strict mode) reject the query with an error. Always write explicit GROUP BY to match all non-aggregated SELECT columns.

---

### Concept: `HAVING` — Filtering Groups After Aggregation

**What it is:** A clause that filters the *grouped results* after aggregation — the post-aggregation equivalent of WHERE.

**Why WHERE cannot filter aggregate results:**

```sql
-- WRONG: WHERE runs before GROUP BY — COUNT doesn't exist yet when WHERE executes
SELECT material, COUNT(*) AS count
FROM tools
WHERE COUNT(*) > 2     -- ERROR: aggregate functions are not allowed in WHERE
GROUP BY material

-- CORRECT: HAVING runs after GROUP BY — COUNT has already been computed
SELECT material, COUNT(*) AS count
FROM tools
GROUP BY material
HAVING COUNT(*) > 2    -- filter groups where count is greater than 2
```

**The execution order:**

SQL clauses execute in this order (even though you write them in a different order):

```
1. FROM     — which table(s)
2. WHERE    — filter individual rows
3. GROUP BY — form groups
4. HAVING   — filter groups
5. SELECT   — compute output columns
6. ORDER BY — sort the output
7. LIMIT    — cap the rows
```

WHERE runs on individual rows before grouping. HAVING runs on group summaries after grouping. They are not interchangeable.

**Combined example:**

```sql
-- "Find materials with more than 2 carbide tools under 0.5 inch diameter"
SELECT material, COUNT(*) AS count
FROM tools
WHERE material = 'carbide'        -- WHERE: filter individual rows first
  AND diameter_inches < 0.5
GROUP BY material                 -- GROUP BY: form one group per material
HAVING COUNT(*) > 2               -- HAVING: keep only groups with more than 2 rows
```

**You will see this again in:** Any query that reports summaries with a filter on the summary itself. "Which departments have more than 10 employees?" "Which products sold more than 100 units?" These always use GROUP BY + HAVING.

**Watch for:** Writing `WHERE COUNT(*) > N` and getting a confusing error. The fix is always to move that condition to `HAVING`. If a filter applies to individual rows, it goes in WHERE. If it applies to the aggregate result, it goes in HAVING.

---

## Step 2 — Red: Write the Tests

Create `tests/test_aggregation.py`:

```python
import sqlite3
import pytest
from tooldb.schema import create_schema
from tooldb.queries import (
    insert_tool,
    tool_counts_by_type,           # ← new
    average_diameter_by_material,  # ← new
    materials_with_more_than_n_tools,  # ← new
)


def make_db(tmp_path):
    conn = sqlite3.connect(str(tmp_path / "test.db"))
    create_schema(conn)
    return conn


def seed_tools(conn):
    """Insert 10 tools for aggregation testing."""
    tools = [
        #  name              diameter  material    type       flutes
        ("EM-0500",          0.500,  "carbide",  "endmill",     4),
        ("EM-0375",          0.375,  "carbide",  "endmill",     3),
        ("EM-0625",          0.625,  "carbide",  "endmill",     4),
        ("EM-1000",          1.000,  "carbide",  "endmill",     4),
        ("DR-0250",          0.250,  "carbide",  "drill",    None),
        ("DR-0312",          0.3125, "carbide",  "drill",    None),
        ("FM-0750",          0.750,  "carbide",  "facemill", None),
        ("EM-0500-HSS",      0.500,  "HSS",      "endmill",     2),
        ("EM-0375-HSS",      0.375,  "HSS",      "endmill",     2),
        ("DR-0500-HSS",      0.500,  "HSS",      "drill",    None),
    ]
    for name, diam, mat, tt, fl in tools:
        insert_tool(conn, name=name, diameter_inches=diam,
                    material=mat, tool_type=tt, flutes=fl)


def test_tool_counts_by_type(tmp_path):
    conn = make_db(tmp_path)
    seed_tools(conn)

    results = tool_counts_by_type(conn)

    # Convert to dict for easy lookup
    counts = {row["tool_type"]: row["count"] for row in results}
    assert counts["endmill"] == 6     # EM-0500, EM-0375, EM-0625, EM-1000, EM-0500-HSS, EM-0375-HSS
    assert counts["drill"] == 3       # DR-0250, DR-0312, DR-0500-HSS
    assert counts["facemill"] == 1    # FM-0750


def test_counts_sum_to_total(tmp_path):
    conn = make_db(tmp_path)
    seed_tools(conn)

    results = tool_counts_by_type(conn)
    total_from_groups = sum(row["count"] for row in results)
    total_in_table = conn.execute("SELECT COUNT(*) FROM tools").fetchone()[0]
    assert total_from_groups == total_in_table   # group counts must sum to total


def test_average_diameter_by_material(tmp_path):
    conn = make_db(tmp_path)
    seed_tools(conn)

    results = average_diameter_by_material(conn)
    by_material = {row["material"]: row for row in results}

    assert "carbide" in by_material
    assert "HSS" in by_material
    assert by_material["carbide"]["tool_count"] == 7
    assert by_material["HSS"]["tool_count"] == 3

    # Verify avg is a reasonable number (between min and max diameter)
    carbide_avg = by_material["carbide"]["avg_diameter"]
    assert 0.25 < carbide_avg < 1.0   # within carbide diameter range


def test_materials_with_more_than_n_tools(tmp_path):
    conn = make_db(tmp_path)
    seed_tools(conn)

    # With min_count=3: carbide has 7 tools (>3), HSS has 3 tools (NOT >3)
    results = materials_with_more_than_n_tools(conn, min_count=3)
    materials = [row["material"] for row in results]
    assert "carbide" in materials
    assert "HSS" not in materials   # HSS has exactly 3 — HAVING COUNT > 3 excludes it

    # With min_count=2: both qualify (7 > 2 and 3 > 2)
    results_2 = materials_with_more_than_n_tools(conn, min_count=2)
    assert len(results_2) == 2


def test_count_star_vs_count_column(tmp_path):
    """Verify COUNT(*) and COUNT(flutes) differ because of NULL values."""
    conn = make_db(tmp_path)
    seed_tools(conn)

    count_star = conn.execute("SELECT COUNT(*) FROM tools").fetchone()[0]
    count_flutes = conn.execute("SELECT COUNT(flutes) FROM tools").fetchone()[0]

    assert count_star == 10          # all 10 rows
    assert count_flutes == 6         # only 6 tools have non-NULL flutes
    assert count_star != count_flutes  # they differ because of NULLs
```

Run:

```
pytest tests/test_aggregation.py -v
```

**You should see:** All 5 failing with `ImportError`. Red.

---

## Step 3 — Green: Add the Aggregation Functions

Add to `tooldb/queries.py`:

```python
def tool_counts_by_type(conn: sqlite3.Connection) -> list:
    """Return the count of tools for each tool_type, ordered by count descending."""
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT tool_type, COUNT(*) AS count
        FROM tools
        GROUP BY tool_type       -- one row per distinct tool_type value
        ORDER BY count DESC      -- most common type first
        """
    ).fetchall()
    return [dict(row) for row in rows]
```

Run the first two tests:

```
pytest tests/test_aggregation.py::test_tool_counts_by_type tests/test_aggregation.py::test_counts_sum_to_total -v
```

**You should see:** Both `PASSED`. Now add the other two functions:

```python
def average_diameter_by_material(conn: sqlite3.Connection) -> list:
    """Return average diameter and tool count for each material."""
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT
            material,
            AVG(diameter_inches) AS avg_diameter,
            COUNT(*)             AS tool_count
        FROM tools
        GROUP BY material
        ORDER BY material
        """
    ).fetchall()
    return [dict(row) for row in rows]


def materials_with_more_than_n_tools(conn: sqlite3.Connection, min_count: int) -> list:
    """Return materials where the tool count exceeds min_count.

    Uses HAVING to filter groups after aggregation —
    WHERE cannot filter on aggregate function results.
    """
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT material, COUNT(*) AS count
        FROM tools
        GROUP BY material
        HAVING COUNT(*) > ?     -- HAVING filters groups; WHERE filters individual rows
        ORDER BY count DESC
        """,
        (min_count,),
    ).fetchall()
    return [dict(row) for row in rows]
```

Run all aggregation tests:

```
pytest tests/test_aggregation.py -v
```

**You should see:**

```
PASSED tests/test_aggregation.py::test_tool_counts_by_type
PASSED tests/test_aggregation.py::test_counts_sum_to_total
PASSED tests/test_aggregation.py::test_average_diameter_by_material
PASSED tests/test_aggregation.py::test_materials_with_more_than_n_tools
PASSED tests/test_aggregation.py::test_count_star_vs_count_column
```

All green.

### SAVE AND TRY

```
pytest tests/ -v
```

**You should see:** All tests across all files passing.

**Change something:** In `materials_with_more_than_n_tools`, change `HAVING COUNT(*) > ?` to `HAVING COUNT(*) >= ?`. Run `test_materials_with_more_than_n_tools`. The test for `min_count=3` now fails because HSS (3 tools) satisfies `>= 3` and appears in the results. Change it back.

---

## 🎯 Challenge: `diameter_stats_by_type`

**You know:** GROUP BY with multiple aggregate functions, AVG, MIN, MAX.

**Task:** Add `diameter_stats_by_type(conn)` that returns, for each tool type: the minimum diameter, maximum diameter, average diameter, and count. Then write a test that seeds the 10 tools and verifies the stats for `"endmill"`.

**Starting code:**

```python
def diameter_stats_by_type(conn: sqlite3.Connection) -> list:
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT
            tool_type,
            MIN(???) AS min_diameter,
            MAX(???) AS max_diameter,
            AVG(???) AS avg_diameter,
            COUNT(?) AS tool_count
        FROM tools
        GROUP BY ???
        ORDER BY tool_type
        """,
    ).fetchall()
    return [dict(row) for row in rows]
```

**Hints:**

1. `COUNT(*)` counts all rows; `COUNT(tool_type)` would also work here since tool_type is NOT NULL
2. From the seed data, endmills have diameters: 0.500, 0.375, 0.625, 1.000, 0.500, 0.375 — min=0.375, max=1.000, count=6

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```python
def diameter_stats_by_type(conn: sqlite3.Connection) -> list:
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT
            tool_type,
            MIN(diameter_inches) AS min_diameter,
            MAX(diameter_inches) AS max_diameter,
            ROUND(AVG(diameter_inches), 4) AS avg_diameter,   -- ROUND avoids float noise
            COUNT(*) AS tool_count
        FROM tools
        GROUP BY tool_type
        ORDER BY tool_type
        """
    ).fetchall()
    return [dict(row) for row in rows]
```

Test:

```python
from tooldb.queries import diameter_stats_by_type

def test_diameter_stats_by_type(tmp_path):
    conn = make_db(tmp_path)
    seed_tools(conn)

    results = diameter_stats_by_type(conn)
    by_type = {row["tool_type"]: row for row in results}

    endmill = by_type["endmill"]
    assert endmill["tool_count"] == 6
    assert endmill["min_diameter"] == pytest.approx(0.375)
    assert endmill["max_diameter"] == pytest.approx(1.000)
```

**Key insight:** `pytest.approx` is used for float comparisons because floating-point arithmetic is imprecise. `0.375 == 0.375` works for simple cases, but aggregated averages may have tiny floating-point errors. `pytest.approx` allows a small tolerance (default: 1e-6). Use it whenever comparing float values in tests.

</details>

---

## Step 4 — Combining GROUP BY with JOIN

Aggregation works with JOIN as well. You can count grouped results across joined tables:

```sql
-- Count assemblies per holder (join to get the holder name, then count)
SELECT h.name AS holder_name, COUNT(a.id) AS assembly_count
FROM holders h
LEFT JOIN assemblies a ON h.id = a.holder_id
GROUP BY h.id, h.name
ORDER BY assembly_count DESC
```

This query:
1. LEFT JOINs holders to assemblies (LEFT so holders with no assemblies appear with count=0)
2. Groups by holder (both id and name — id ensures uniqueness; name for display)
3. Counts assemblies per group

`COUNT(a.id)` counts only rows where `a.id` is not NULL — which means assemblies that matched. Holders with no assemblies have `a.id = NULL` after the LEFT JOIN, so their count is 0. This is why `COUNT(column)` rather than `COUNT(*)` is used here: `COUNT(*)` would count the LEFT JOIN row (where a.id is NULL) as 1, giving a count of 1 for every holder.

This pattern — LEFT JOIN + COUNT(column) — is the standard way to count relationships including zero-count rows.

---

## Final Check

| Feature | How to verify |
|---|---|
| `tool_counts_by_type` groups by type correctly | Run `test_tool_counts_by_type` — 6 endmills, 3 drills, 1 facemill |
| Group counts sum to total row count | Run `test_counts_sum_to_total` — sum of group counts equals 10 |
| `average_diameter_by_material` returns avg and count | Run `test_average_diameter_by_material` — carbide: 7 tools |
| `HAVING` filters by count threshold | Run `test_materials_with_more_than_n_tools` — HSS excluded at min_count=3 |
| `COUNT(*)` vs `COUNT(column)` differ on NULLs | Run `test_count_star_vs_count_column` — 10 vs 6 |
| All tests pass | `pytest tests/ -v` — all PASSED |

---

## Quick Check Answers

**1. `SELECT COUNT(*) FROM tools WHERE material = 'carbide'` — list of rows or a single number?**

A single number — one row with one column. Aggregate functions without `GROUP BY` collapse the entire matching result set into one row. `COUNT(*)` counts all rows matching the WHERE condition and returns that count as a single integer value. The result is a single-row, single-column result set: `[(7,)]` in Python's sqlite3 — access it with `.fetchone()[0]`.

**2. `COUNT(*)` vs `COUNT(flutes)` with 10 tools and 3 having NULL flutes:**

`COUNT(*)` returns 10 — it counts every row in the table, regardless of what values any column has. `COUNT(flutes)` returns 7 — it counts only rows where `flutes` is not NULL. NULL values are excluded from `COUNT(column)`. This is the core difference: `COUNT(*)` is "how many rows exist," `COUNT(column)` is "how many rows have a non-NULL value for this column."

**3. What is `HAVING`? Why can't `WHERE` filter a `COUNT` result?**

`HAVING` filters the grouped results after aggregation. `WHERE` cannot do this because SQL executes `WHERE` before `GROUP BY` — at the time WHERE runs, the groups have not been formed yet and aggregate function results (like `COUNT(*)`) do not exist yet. Trying to write `WHERE COUNT(*) > 2` is a syntax error because COUNT is not yet computed when WHERE executes. `HAVING` runs after `GROUP BY`, when each group's aggregate values have been computed. The rule: `WHERE` filters individual rows before grouping; `HAVING` filters group summaries after grouping.
