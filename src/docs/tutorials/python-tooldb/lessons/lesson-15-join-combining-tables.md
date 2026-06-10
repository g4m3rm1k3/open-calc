# Python Tool Database — LAB 15 — JOIN: Combining Tables

**Prerequisites:** Lab 14. You have `insert_job`, `add_assembly_to_job`, `list_assemblies_for_job` in `queries.py`. All tests pass. You understand foreign keys and the junction table pattern.

**What this lab adds:**
- `INNER JOIN` — combining rows from two tables where a condition matches both sides
- `LEFT JOIN` — all rows from the left table, matched rows from the right, NULL where no match
- Joining three tables (`assemblies` → `tools`, `assemblies` → `holders`)
- `get_assembly_details`, `list_jobs_with_assembly_names` in `queries.py`
- The mental model: JOIN as "connecting rows by a shared key"

**Time:** 60–75 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `assemblies` stores `tool_id = 3`. `tools` has a row with `id = 3` named `"EM-0750"`. What does `INNER JOIN tools ON tool_id = tools.id` add to the result row?
> 2. You write `SELECT * FROM tools LEFT JOIN assemblies ON tools.id = assembly.tool_id`. Tool id 5 has no assemblies. Does tool id 5 appear in the result? What value does `assemblies.name` have for that row?
> 3. Why is `assemblies.tool_id` called a "foreign key"? What makes it "foreign"?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lesson you will have two new query functions in `tooldb/queries.py`:

```python
get_assembly_details(conn, assembly_id)
# → {"assembly_name": "EM-0500 in CAT40-ER32 1.5\"",
#    "tool_name": "EM-0500", "tool_type": "endmill",
#    "holder_name": "CAT40-ER32", "holder_taper": "CAT40",
#    "stickout_inches": 1.5}

list_jobs_with_assembly_names(conn)
# → [{"job_name": "Part-001-Rev2", "assembly_name": "EM-0500 in CAT40-ER32 1.5\"",
#     "tool_position": 1}, ...]
```

Running `pytest tests/test_joins.py -v` will show:

```
PASSED tests/test_joins.py::test_get_assembly_details
PASSED tests/test_joins.py::test_get_assembly_details_tool_and_holder_names
PASSED tests/test_joins.py::test_list_jobs_with_assembly_names
PASSED tests/test_joins.py::test_left_join_shows_unlinked_tools
```

---

## Step 1 — The Problem Without JOIN

The `assemblies` table stores `tool_id` and `holder_id` — integers. When you display an assembly to a user, they need to see names, not IDs.

Without JOIN, you need two separate queries:

```python
# Query 1: get the assembly
assembly_row = conn.execute(
    "SELECT name, tool_id, holder_id, stickout_inches FROM assemblies WHERE id = ?",
    (assembly_id,)
).fetchone()

# Query 2: get the tool name from the tools table
tool_row = conn.execute(
    "SELECT name, tool_type FROM tools WHERE id = ?",
    (assembly_row["tool_id"],)
).fetchone()

# Query 3: get the holder name from the holders table
holder_row = conn.execute(
    "SELECT name, taper FROM holders WHERE id = ?",
    (assembly_row["holder_id"],)
).fetchone()

# Manually assemble the result:
result = {
    "assembly_name": assembly_row["name"],
    "tool_name": tool_row["name"],
    "tool_type": tool_row["tool_type"],
    "holder_name": holder_row["name"],
    "holder_taper": holder_row["taper"],
    "stickout_inches": assembly_row["stickout_inches"],
}
```

Three round trips to the database for one logical result. And to display a list of 50 assemblies, you would need 1 + 50 + 50 = 101 queries. This is called the **N+1 query problem** — a well-known performance antipattern.

JOIN solves this with a single query that combines the rows automatically:

```sql
SELECT a.name      AS assembly_name,
       t.name      AS tool_name,
       t.tool_type,
       h.name      AS holder_name,
       h.taper     AS holder_taper,
       a.stickout_inches
FROM assemblies a
JOIN tools   t ON a.tool_id   = t.id
JOIN holders h ON a.holder_id = h.id
WHERE a.id = ?
```

One query. One result. No manual assembly.

---

### Concept: JOIN — Combining Rows from Two Tables

**What it is:** A SQL operation that combines rows from two tables by matching values in a specified column. The result is a new set of rows where each row contains columns from both tables.

**The mental model:**

Imagine two tables side by side, printed on paper. You draw a line between every row in table A and every row in table B where the condition is true. Each pair of connected rows becomes one row in the result.

```
assemblies:                   tools:
id | name       | tool_id     id | name     | tool_type
1  | "setup A"  | 3           3  | "EM-0750"| endmill
2  | "setup B"  | 5           5  | "DR-0250"| drill

JOIN condition: assemblies.tool_id = tools.id

Result (combined rows):
assembly_name | tool_id | tools.id | tool_name  | tool_type
"setup A"     | 3       | 3        | "EM-0750"  | endmill
"setup B"     | 5       | 5        | "DR-0250"  | drill
```

**`INNER JOIN` vs `JOIN`:** They are the same thing. `JOIN` without a qualifier means `INNER JOIN`. The word INNER is optional.

**Syntax:**

```sql
SELECT a.column1, b.column2
FROM table_a a          -- "a" is an alias: shortens the table name for the rest of the query
JOIN table_b b          -- "b" is an alias for table_b
  ON a.foreign_key = b.id   -- the JOIN condition: which column in a matches which column in b
```

**Column aliases with `AS`:**

When both tables have a column named `name`, the result would have two `name` columns — ambiguous and hard to use. `AS` renames them:

```sql
SELECT a.name AS assembly_name, t.name AS tool_name
FROM assemblies a
JOIN tools t ON a.tool_id = t.id
```

**What it hides:** The nested loop that the database engine would otherwise need: for each assembly row, find the tools row where `tools.id = assembly.tool_id`. With an index on `tools.id` (which primary keys have automatically), this lookup is O(1) per assembly row. The JOIN syntax hides this implementation — you declare the relationship; the engine chooses how to execute it.

**Canonical example (General Explanation):**

An order system. `orders` table has `customer_id`. `customers` table has customer details. Without JOIN:

```python
order = get_order(5)         # → {"customer_id": 12, ...}
customer = get_customer(12)  # → {"name": "Alice", ...}
```

With JOIN:

```sql
SELECT o.id, o.total, c.name AS customer_name, c.email
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.id = 5
-- Returns one row: order fields plus customer name and email, together
```

One query. One row. The relationship is expressed in SQL, not in application code.

**You will see this again in:** Every multi-table database query ever written. SQLAlchemy generates JOINs automatically when you access related attributes. REST APIs that return "expanded" objects (assembly with tool details embedded) use JOINs under the hood. This is the most important SQL operation after SELECT and WHERE.

**Career signal:** "Write a JOIN query to get all assemblies with their tool and holder names" is a direct interview question. Being able to write multi-table JOINs fluently separates candidates who understand relational databases from those who only know single-table SQL.

**Watch for:** The JOIN condition must use `=`, not `IS`. `ON a.tool_id = t.id` is correct. The column on the left of `=` and the column on the right can be from either table — the order does not matter for the result, only for readability. Conventionally, put the foreign key on the left.

---

## Step 2 — Red: Write the Tests

Create `tests/test_joins.py`:

```python
import sqlite3
import pytest
from tooldb.schema import create_schema
from tooldb.queries import (
    insert_tool,
    insert_holder,
    insert_assembly,
    insert_job,
    add_assembly_to_job,
    get_assembly_details,          # ← new
    list_jobs_with_assembly_names, # ← new
)


def make_db(tmp_path):
    conn = sqlite3.connect(str(tmp_path / "test.db"))
    create_schema(conn)
    return conn


def seed_full_assembly(conn):
    """Insert a complete chain: tool → holder → assembly. Returns assembly_id."""
    tool_id = insert_tool(conn, name="EM-0500", diameter_inches=0.5,
                          material="carbide", tool_type="endmill", flutes=4)
    holder_id = insert_holder(conn, name="CAT40-ER32", taper="CAT40",
                               collet_size_inches=0.787)
    return insert_assembly(
        conn,
        name='EM-0500 in CAT40-ER32 1.5"',
        tool_id=tool_id,
        holder_id=holder_id,
        stickout_inches=1.5,
    )


def test_get_assembly_details(tmp_path):
    conn = make_db(tmp_path)
    assembly_id = seed_full_assembly(conn)

    details = get_assembly_details(conn, assembly_id)

    assert details is not None
    assert details["assembly_name"] == 'EM-0500 in CAT40-ER32 1.5"'
    assert details["stickout_inches"] == 1.5


def test_get_assembly_details_tool_and_holder_names(tmp_path):
    conn = make_db(tmp_path)
    assembly_id = seed_full_assembly(conn)

    details = get_assembly_details(conn, assembly_id)

    # These names come from the tools and holders tables via JOIN
    assert details["tool_name"] == "EM-0500"
    assert details["tool_type"] == "endmill"
    assert details["holder_name"] == "CAT40-ER32"
    assert details["holder_taper"] == "CAT40"


def test_list_jobs_with_assembly_names(tmp_path):
    conn = make_db(tmp_path)
    job_id = insert_job(conn, name="Part-001-Rev2")
    assembly_id = seed_full_assembly(conn)
    add_assembly_to_job(conn, job_id=job_id, assembly_id=assembly_id, tool_position=1)

    results = list_jobs_with_assembly_names(conn)

    assert len(results) == 1
    assert results[0]["job_name"] == "Part-001-Rev2"
    assert results[0]["assembly_name"] == 'EM-0500 in CAT40-ER32 1.5"'
    assert results[0]["tool_position"] == 1


def test_left_join_shows_unlinked_tools(tmp_path):
    """A LEFT JOIN from tools to assemblies includes tools with no assemblies."""
    conn = make_db(tmp_path)

    # Insert a tool with an assembly and a tool with no assembly
    t1_id = insert_tool(conn, name="EM-0500", diameter_inches=0.5,
                        material="carbide", tool_type="endmill")
    t2_id = insert_tool(conn, name="DR-0250", diameter_inches=0.25,
                        material="carbide", tool_type="drill")

    holder_id = insert_holder(conn, name="CAT40-ER32", taper="CAT40", collet_size_inches=0.787)
    insert_assembly(conn, name="EM-0500 setup", tool_id=t1_id, holder_id=holder_id,
                    stickout_inches=1.5)
    # DR-0250 (t2_id) has no assembly

    conn.row_factory = sqlite3.Row

    # INNER JOIN: only tools with at least one assembly
    inner_rows = conn.execute(
        """
        SELECT t.name AS tool_name, a.name AS assembly_name
        FROM tools t
        JOIN assemblies a ON t.id = a.tool_id
        """
    ).fetchall()
    inner_names = [r["tool_name"] for r in inner_rows]
    assert "EM-0500" in inner_names
    assert "DR-0250" not in inner_names   # excluded — no assembly

    # LEFT JOIN: all tools, NULL assembly_name for tools with no assembly
    left_rows = conn.execute(
        """
        SELECT t.name AS tool_name, a.name AS assembly_name
        FROM tools t
        LEFT JOIN assemblies a ON t.id = a.tool_id
        """
    ).fetchall()
    left_names = [r["tool_name"] for r in left_rows]
    assert "EM-0500" in left_names
    assert "DR-0250" in left_names   # included — NULL assembly_name

    # Find the DR-0250 row and verify assembly_name is NULL
    dr_row = next(r for r in left_rows if r["tool_name"] == "DR-0250")
    assert dr_row["assembly_name"] is None   # NULL: no matching assembly
```

Run:

```
pytest tests/test_joins.py -v
```

**You should see:** All 4 failing with `ImportError`. Red.

---

## Step 3 — Green: Add `get_assembly_details`

Add to `tooldb/queries.py`:

```python
def get_assembly_details(conn: sqlite3.Connection, assembly_id: int) -> dict | None:
    """Return assembly details with tool and holder names joined in.

    Returns a dict with keys: assembly_name, tool_name, tool_type,
    holder_name, holder_taper, stickout_inches.
    Returns None if no assembly with that id exists.
    """
    conn.row_factory = sqlite3.Row
    row = conn.execute(
        """
        SELECT
            a.name          AS assembly_name,
            a.stickout_inches,
            t.name          AS tool_name,
            t.tool_type,
            h.name          AS holder_name,
            h.taper         AS holder_taper
        FROM assemblies a
        JOIN tools   t ON a.tool_id   = t.id
        JOIN holders h ON a.holder_id = h.id
        WHERE a.id = ?
        """,
        (assembly_id,),
        # Three tables in one query: assemblies is the "anchor", tools and holders are joined in
        # The JOIN conditions follow the foreign key relationships: a.tool_id = t.id
    ).fetchone()

    if row is None:
        return None
    return dict(row)   # convert sqlite3.Row to a plain dict for easier downstream use
```

Run the first two tests:

```
pytest tests/test_joins.py::test_get_assembly_details tests/test_joins.py::test_get_assembly_details_tool_and_holder_names -v
```

**You should see:** Both `PASSED`. Green.

### SAVE AND TRY

```
pytest tests/test_joins.py -v
```

**You should see:** 2 tests passing, 2 still failing. Good — partial green, moving forward.

**Change something:** In the SELECT, rename `a.name AS assembly_name` to just `a.name`. Then in the test, change `details["assembly_name"]` to `details["name"]`. The test still passes — the alias is just a convenience. Change both back to the original.

---

## Step 4 — Green: Add `list_jobs_with_assembly_names`

Add to `tooldb/queries.py`:

```python
def list_jobs_with_assembly_names(conn: sqlite3.Connection) -> list:
    """Return all job-assembly links with the job name and assembly name joined in.

    Each row represents one assembly used in one job.
    Ordered by job name, then tool position.
    """
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT
            j.name   AS job_name,
            a.name   AS assembly_name,
            ja.tool_position,
            ja.added_at
        FROM job_assemblies ja
        JOIN jobs       j ON ja.job_id      = j.id
        JOIN assemblies a ON ja.assembly_id = a.id
        ORDER BY j.name, ja.tool_position
        """,
        # job_assemblies is the anchor — it is the junction table
        # We join jobs to get the job name, and assemblies to get the assembly name
        # The result: one row per job-assembly link, with names instead of IDs
    ).fetchall()
    return [dict(row) for row in rows]   # convert each sqlite3.Row to a plain dict
```

Run:

```
pytest tests/test_joins.py -v
```

**You should see:**

```
PASSED tests/test_joins.py::test_get_assembly_details
PASSED tests/test_joins.py::test_get_assembly_details_tool_and_holder_names
PASSED tests/test_joins.py::test_list_jobs_with_assembly_names
FAILED tests/test_joins.py::test_left_join_shows_unlinked_tools
```

Three green. One failing — the LEFT JOIN test uses raw SQL directly and should already work. Run it alone:

```
pytest tests/test_joins.py::test_left_join_shows_unlinked_tools -v
```

**You should see:** `PASSED`. The test may have been failing due to import errors earlier. Run all four again.

```
pytest tests/test_joins.py -v
```

**You should see:** All 4 passing. Green.

---

### SAVE AND TRY

```
pytest tests/ -v
```

**You should see:** All tests across all files passing.

**Change something:** In `list_jobs_with_assembly_names`, change `JOIN jobs j` to `LEFT JOIN jobs j`. The result is the same (because every `job_assemblies` row has a valid `job_id` due to the FK constraint). Now remove the FK from the schema and insert a `job_assemblies` row with an invalid `job_id` — a LEFT JOIN would include it with NULL job fields. A regular JOIN would not. This is the LEFT JOIN difference: it includes left-table rows even when no matching right-table row exists.

---

## Step 5 — LEFT JOIN: Including Rows with No Match

### Concept: `LEFT JOIN` — All Rows from the Left, NULLs on the Right

**What it is:** A JOIN that includes all rows from the left table regardless of whether a matching row exists in the right table. Columns from the right table are `NULL` when no match is found.

**INNER JOIN vs LEFT JOIN:**

```
tools:              assemblies:
id | name           id | tool_id | name
1  | EM-0500        1  | 1       | "setup A"
2  | DR-0250        -- (no assembly for tool 2)
3  | FM-0750        2  | 3       | "setup B"

INNER JOIN result (only tools with assemblies):
tool_name | assembly_name
EM-0500   | setup A
FM-0750   | setup B
-- DR-0250 is absent: no matching assembly row

LEFT JOIN result (all tools, NULL where no assembly):
tool_name | assembly_name
EM-0500   | setup A
DR-0250   | NULL          ← included; no matching assembly
FM-0750   | setup B
```

**When to use LEFT JOIN:**

Use LEFT JOIN when you need all rows from one table regardless of whether they have related rows in another table:
- All tools, whether or not they have been put in an assembly yet
- All holders, whether or not they are currently used
- All jobs, even if no assemblies have been added yet

Use INNER JOIN when you only want rows that have a complete relationship:
- Assemblies with their tool AND holder details (both must exist — and they do, by FK constraint)
- Job-assembly links with names (the link only exists if both job and assembly exist)

**There is no RIGHT JOIN in SQLite.** SQLite does not support `RIGHT JOIN`. The workaround is to swap the tables and use LEFT JOIN: `A RIGHT JOIN B` = `B LEFT JOIN A`.

**You will see this again in:** Any query where you want "all X, even those without Y." In SQLAlchemy: `outerjoin()` generates LEFT JOIN. In analytics queries: "which products have no sales this month?" is a LEFT JOIN with a NULL filter. REST API endpoints that return a list with optional related data often use LEFT JOIN.

**Watch for:** Filtering on a LEFT JOIN column with `WHERE col IS NOT NULL` effectively turns it into an INNER JOIN — you are excluding the NULL rows that LEFT JOIN included. If you want to filter on left-joined columns, use `WHERE col IS NULL` (to find rows without a match) or move the filter into the `ON` clause.

---

## 🎯 Challenge: `find_tools_not_in_any_assembly`

**You know:** LEFT JOIN, NULL filtering, WHERE IS NULL.

**Task:** Add `find_tools_not_in_any_assembly(conn)` to `queries.py`. Use a LEFT JOIN from `tools` to `assemblies` and filter for rows where the assembly is NULL — these are tools that have never been put in an assembly.

**Starting code:**

```python
def find_tools_not_in_any_assembly(conn: sqlite3.Connection) -> list:
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT t.id, t.name, t.diameter_inches, t.tool_type
        FROM tools t
        LEFT JOIN assemblies a ON ???
        WHERE ???
        ORDER BY t.name
        """,
    ).fetchall()
    return [dict(row) for row in rows]
```

**Test to add to `tests/test_joins.py`:**

```python
from tooldb.queries import find_tools_not_in_any_assembly   # add to import

def test_find_tools_not_in_any_assembly(tmp_path):
    conn = make_db(tmp_path)

    # Insert two tools: one with an assembly, one without
    t1_id = insert_tool(conn, name="EM-0500", diameter_inches=0.5,
                        material="carbide", tool_type="endmill")
    t2_id = insert_tool(conn, name="DR-0250", diameter_inches=0.25,
                        material="carbide", tool_type="drill")

    holder_id = insert_holder(conn, name="CAT40-ER32", taper="CAT40", collet_size_inches=0.787)
    insert_assembly(conn, name="EM-0500 setup", tool_id=t1_id, holder_id=holder_id,
                    stickout_inches=1.5)
    # DR-0250 has no assembly

    results = find_tools_not_in_any_assembly(conn)
    assert len(results) == 1
    assert results[0]["name"] == "DR-0250"
```

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```python
def find_tools_not_in_any_assembly(conn: sqlite3.Connection) -> list:
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT t.id, t.name, t.diameter_inches, t.tool_type
        FROM tools t
        LEFT JOIN assemblies a ON t.id = a.tool_id
        WHERE a.id IS NULL     -- a.id is NULL when no matching assembly row exists
        ORDER BY t.name
        """,
    ).fetchall()
    return [dict(row) for row in rows]
```

**Key insight:** The pattern `LEFT JOIN ... WHERE right_table.id IS NULL` is the standard SQL idiom for "rows in the left table with no match in the right table." It is used constantly for "find X that has no Y" queries. The `a.id IS NULL` condition specifically checks a column from the right table — if the LEFT JOIN found no match, all right-table columns are NULL.

</details>

---

## Step 6 — The N+1 Problem and JOIN

You saw the N+1 problem at the start of this lesson: displaying 50 assemblies with names required 101 queries. Let's count the difference:

**Without JOIN (N+1):**

```python
assemblies = conn.execute("SELECT id, tool_id, holder_id, name FROM assemblies").fetchall()
# 1 query

results = []
for assembly in assemblies:                        # 50 assemblies = 50 iterations
    tool = conn.execute("SELECT name FROM tools WHERE id = ?",
                        (assembly["tool_id"],)).fetchone()   # 50 more queries
    holder = conn.execute("SELECT name FROM holders WHERE id = ?",
                          (assembly["holder_id"],)).fetchone()  # 50 more queries
    results.append({"assembly": assembly["name"], "tool": tool["name"], "holder": holder["name"]})

# Total: 1 + 50 + 50 = 101 queries
```

**With JOIN:**

```sql
SELECT a.name, t.name AS tool_name, h.name AS holder_name
FROM assemblies a
JOIN tools t ON a.tool_id = t.id
JOIN holders h ON a.holder_id = h.id
```

1 query for any number of assemblies. The database engine handles the lookups internally, using indexed primary key lookups. For small databases, the N+1 pattern is acceptable. For large databases or web applications under load, it is a serious performance problem.

**You will see this again in:** SQLAlchemy's "lazy loading" antipattern — accessing a relationship attribute inside a loop generates one query per object. The fix is "eager loading" with `joinedload()`, which generates a JOIN. This is one of the most common performance issues in ORM-backed applications.

---

## Final Check

| Feature | How to verify |
|---|---|
| `get_assembly_details` returns names via JOIN | Run `test_get_assembly_details_tool_and_holder_names` — tool_name, holder_name present |
| `get_assembly_details` returns None for missing assembly | Manually call `get_assembly_details(conn, 9999)` — returns None |
| `list_jobs_with_assembly_names` joins three tables | Run `test_list_jobs_with_assembly_names` — job_name and assembly_name present |
| INNER JOIN excludes unmatched rows | Run `test_left_join_shows_unlinked_tools` — DR-0250 absent from INNER JOIN result |
| LEFT JOIN includes unmatched rows with NULL | Run `test_left_join_shows_unlinked_tools` — DR-0250 present with NULL assembly_name |
| `find_tools_not_in_any_assembly` uses LEFT JOIN + IS NULL | Run challenge test — only unassigned tool returned |
| All tests pass | `pytest tests/ -v` — all PASSED |

---

## Quick Check Answers

**1. `assemblies.tool_id = 3`. `tools.id = 3` is `"EM-0750"`. What does the JOIN add?**

The JOIN combines the assembly row with the matching tools row, creating one wider row that contains all the selected columns from both tables. Before the JOIN: you have `tool_id = 3` (an integer reference). After the JOIN: you have `tool_name = "EM-0750"` and `tool_type = "endmill"` (the actual values from the tools table) alongside the assembly's own columns. The integer `tool_id` is the "wire" that connects the rows; the JOIN follows that wire and returns what is on the other end.

**2. Tool id 5 has no assemblies. Does it appear in a LEFT JOIN result? What is `assemblies.name`?**

Yes — it appears. A LEFT JOIN includes all rows from the left table (tools) regardless of whether a matching row exists in the right table (assemblies). For tool id 5, the database finds no matching assembly row, so all columns from the `assemblies` side of the JOIN are set to `NULL`. `assemblies.name` would be `NULL`. This is how you identify "tools with no assemblies" — after a LEFT JOIN, rows with `NULL` assembly columns are tools that have never been assembled.

**3. Why is `assemblies.tool_id` called a "foreign key"? What makes it "foreign"?**

The word "foreign" means the value originates from another table. `assemblies.tool_id` holds a value that is the primary key *of the tools table* — a table foreign to `assemblies`. The key is "foreign" because it belongs to another table's row, not to the assembly row itself. A primary key identifies a row in its own table (id in tools identifies a tool). A foreign key references a primary key in another (foreign) table. The `REFERENCES tools(id)` declaration makes this explicit: the value stored in `tool_id` must exist as a primary key value in the `tools` table.
