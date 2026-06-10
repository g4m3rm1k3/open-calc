# Python Tool Database — LAB 12 — INSERT, SELECT, WHERE, ORDER BY, LIMIT

**Prerequisites:** Lab 11. You have a working `create_schema(conn)` function and `tests/test_schema.py` passing. You know what a table is, what a primary key is, and how `NOT NULL` constraints work.

**What this lab adds:**
- `INSERT INTO` — writing rows into a table
- `SELECT` — reading rows back out
- `WHERE` — filtering rows by condition
- `ORDER BY` and `LIMIT` — sorting and paging results
- NULL three-valued logic — why `WHERE notes = NULL` silently returns nothing
- A `queries.py` module with four functions backed by real tests

**Time:** 60–75 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You have a table with 500 rows. You write `SELECT * FROM tools WHERE material = NULL`. How many rows come back? Why?
> 2. SQL is a "declarative" language. What does that mean? How is it different from a Python `for` loop?
> 3. What is the difference between `SELECT *` and `SELECT name, diameter_inches`? When does the difference matter?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lesson you will have `tooldb/queries.py` with four working functions, and a test suite that verifies every query against a real (but temporary) database:

```
tooldb/
    queries.py      ← NEW: insert_tool, find_carbide_tools,
                             find_endmills_larger_than, top_tools_by_diameter
tests/
    test_queries.py ← NEW: 6 tests, all passing
```

Running `pytest tests/test_queries.py -v` will show:

```
PASSED tests/test_queries.py::test_insert_and_count_tools
PASSED tests/test_queries.py::test_find_carbide_tools
PASSED tests/test_queries.py::test_find_endmills_larger_than
PASSED tests/test_queries.py::test_top_tools_by_diameter_returns_correct_count
PASSED tests/test_queries.py::test_top_tools_by_diameter_correct_order
PASSED tests/test_queries.py::test_null_notes_not_found_with_equals
```

---

## Step 1 — SQL as a Language for Describing Data

Before writing a single line of Python, read this comparison carefully. It is the most important idea in this lesson.

Imagine you want all carbide tools from the database. Here is the Python approach:

```python
# imperative — describes HOW to get the answer step by step
carbide_tools = []
for tool in all_tools:        # step 1: iterate every tool
    if tool.material == "carbide":   # step 2: check each one
        carbide_tools.append(tool)   # step 3: collect matches
```

Here is the SQL approach:

```sql
-- declarative — describes WHAT you want, not HOW to get it
SELECT name, diameter_inches, material
FROM tools
WHERE material = 'carbide'
```

The SQL does not say "iterate from the first row." It says "I want tools whose material is carbide." The database engine decides how to fetch them — whether to scan every row, use an index, or do something else entirely. You describe the result, not the steps to get there.

---

### Concept: SQL — Declarative vs Imperative

**What it is:** SQL (Structured Query Language) is a declarative language — you describe the shape of the answer you want, and the database decides how to produce it. Python is imperative — you describe the steps to get the answer.

**The problem before:** With a Python list of dictionaries, finding all carbide tools over 0.5" and sorted by diameter requires writing a loop, appending to a new list, sorting, and slicing. That is 4–6 lines that must be correct, tested, and maintained. With 500,000 tools in memory, it is also slow.

**The solution:** SQL lets you express the same query in one statement. The database optimizes execution using indexes and statistics you do not have to manage.

**What it hides:** The execution plan — the sequence of operations the database uses to produce the result. The engine may use a full table scan, an index lookup, or a hash join. You write the WHAT; the engine owns the HOW. The invariant SQL protects: results are always a valid set of rows matching the stated conditions, regardless of how the engine fetches them.

**Canonical example (General Explanation):**

A restaurant order card. You write "I want a cheeseburger, medium rare, no pickles." You do not write "step 1: take a beef patty, step 2: heat grill to 375°F, step 3: place patty on grill for 3 minutes per side..." That is declarative ordering — describe the desired result, not the process.

```sql
-- You write the order:
SELECT name, price
FROM menu
WHERE category = 'burger' AND is_available = 1
ORDER BY price

-- The kitchen (database engine) decides HOW to make it
```

**Project Application:** Every query in this project tells SQLite what data we want. SQLite decides how to retrieve it from the file. For a small database like ours, that means a table scan. For a larger database, adding an index to `material` or `tool_type` would change the execution plan without changing the query at all.

**Smallest possible example:**

```python
import sqlite3
conn = sqlite3.connect(":memory:")   # :memory: creates a temporary in-RAM database — no file
conn.execute("CREATE TABLE t (name TEXT, val INTEGER)")
conn.execute("INSERT INTO t VALUES ('a', 10)")
conn.execute("INSERT INTO t VALUES ('b', 20)")
rows = conn.execute("SELECT name, val FROM t WHERE val > 15").fetchall()
print(rows)   # → [('b', 20)]
```

**Why it matters here:** Every function in `queries.py` will send a SQL string to SQLite. Understanding that SQL is declarative explains why there are no loops in these functions — the database does the iteration internally.

**You will see this again in:** Every relational database ever built (PostgreSQL, MySQL, SQL Server, Oracle). SQLAlchemy (Block 5) generates SQL from Python method chains — same declarative model, different syntax. SQL is asked in almost every software engineering interview that touches a database. "Write a query to find all tools with diameter above 0.5 and material carbide" is a common whiteboard question.

**Career signal:** SQL is one of the most-asked skills in software engineering interviews. Interviewers test SQL at every level — junior to senior. Understanding the declarative model is what makes SQL readable, not just memorized. "Explain the difference between declarative and imperative code" is also a direct interview question.

**Watch for:** Thinking of SQL as "instructions for the computer." It is not. It is a description of the desired result. If your query is getting the wrong results, the problem is almost always in the WHERE clause (wrong condition), not in how you asked the database to iterate.

---

## Step 2 — INSERT: Writing Rows

### Concept: `INSERT INTO`

**What it is:** The SQL statement that adds a new row to a table.

**Syntax:**

```sql
INSERT INTO table_name (column1, column2, column3)
VALUES (value1, value2, value3)
```

The column list and value list must match in order and count. Columns not listed receive either their `DEFAULT` value or `NULL`.

**Two forms:**

```sql
-- Form 1: name the columns (safe — order doesn't matter, optional columns can be omitted)
INSERT INTO tools (name, diameter_inches, material, tool_type)
VALUES ('EM-0500', 0.5, 'carbide', 'endmill')

-- Form 2: omit column list (fragile — values must be in exact column creation order)
INSERT INTO tools VALUES (NULL, 'EM-0500', 0.5, NULL, 'carbide', 'endmill', NULL)
```

**Always use Form 1.** If a column is added to the table later, Form 2 breaks silently — a value lands in the wrong column. Form 1 only breaks if a required column is removed, which is a schema change you will notice.

**The `?` placeholder — never use string formatting for SQL:**

```python
# WRONG — SQL injection vulnerability: name could be "'; DROP TABLE tools; --"
conn.execute(f"INSERT INTO tools (name) VALUES ('{name}')")

# CORRECT — SQLite escapes the value safely
conn.execute("INSERT INTO tools (name) VALUES (?)", (name,))
```

The `?` is a parameter placeholder. SQLite replaces it with the value after escaping any special characters. This prevents SQL injection — a category of attack where user-supplied data is interpreted as SQL commands.

**What it hides:** The encoding and escaping of string values, the type conversion from Python to SQLite storage types, and the journal write that ensures durability. You pass Python values; SQLite handles storage format, escaping, and write-ahead log entries.

**You will see this again in:** Every database write in this project. In SQLAlchemy (Block 5): `session.add(tool)` generates an `INSERT` under the hood. The `?` placeholder pattern is universal — PostgreSQL uses `%s`, but the concept is identical. SQL injection via string formatting is a top-10 OWASP vulnerability — this pattern is the defense.

**Watch for:** The `(name,)` trailing comma in the parameter tuple. A single-element Python tuple requires it: `(name)` is just a parenthesized expression (same as `name`), while `(name,)` is a tuple. The sqlite3 module requires a sequence, not a scalar.

---

### Red: Write the INSERT Test

Create `tests/test_queries.py`:

```python
import sqlite3
import pytest
from tooldb.schema import create_schema    # from lesson-11
from tooldb.queries import insert_tool     # ← will fail: module does not exist yet


def make_db(tmp_path):
    """Create a fresh in-memory-equivalent test database using tmp_path."""
    db_path = tmp_path / "test.db"         # each test gets its own temp directory
    conn = sqlite3.connect(str(db_path))   # open (creating) the .db file
    create_schema(conn)                    # create all tables
    return conn


def test_insert_and_count_tools(tmp_path):
    conn = make_db(tmp_path)

    insert_tool(conn, name="EM-0500", diameter_inches=0.5,
                material="carbide", tool_type="endmill")
    insert_tool(conn, name="DR-0250", diameter_inches=0.25,
                material="carbide", tool_type="drill")

    count = conn.execute("SELECT COUNT(*) FROM tools").fetchone()[0]
    assert count == 2   # both rows inserted
```

Run the test. It will fail with `ModuleNotFoundError: No module named 'tooldb.queries'`.

### SAVE AND TRY

```
pytest tests/test_queries.py::test_insert_and_count_tools -v
```

**You should see:**

```
FAILED tests/test_queries.py::test_insert_and_count_tools
ModuleNotFoundError: No module named 'tooldb.queries'
```

Good. Red.

---

### Green: Create `tooldb/queries.py`

Create `tooldb/queries.py`:

```python
import sqlite3


def insert_tool(
    conn: sqlite3.Connection,
    name: str,
    diameter_inches: float,
    material: str,
    tool_type: str,
    flutes: int = None,         # nullable — drills don't track this
    notes: str = None,          # nullable — free text
) -> int:
    """Insert a tool row and return the auto-assigned id."""
    cursor = conn.execute(
        """
        INSERT INTO tools (name, diameter_inches, material, tool_type, flutes, notes)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (name, diameter_inches, material, tool_type, flutes, notes),
        # six ? placeholders match the six values in the tuple — order must match column list
    )
    conn.commit()           # write changes to disk; without this, the insert stays pending
    return cursor.lastrowid # SQLite sets this to the auto-incremented id of the new row
```

Run the test again:

```
pytest tests/test_queries.py::test_insert_and_count_tools -v
```

**You should see:**

```
PASSED tests/test_queries.py::test_insert_and_count_tools
```

Green.

### SAVE AND TRY

```
pytest tests/test_queries.py -v
```

**You should see:**

```
PASSED tests/test_queries.py::test_insert_and_count_tools
```

**Change something:** In the test, change `assert count == 2` to `assert count == 3`. Run. It fails: `AssertionError: assert 2 == 3`. Change it back.

**Try the return value:** Add a `print(insert_tool(...))` call in `test_insert_and_count_tools` temporarily. The first insert returns `1`, the second returns `2`. AUTOINCREMENT assigns IDs starting at 1.

---

## Step 3 — SELECT: Reading Rows Back

### Concept: `SELECT` and Result Rows

**What it is:** The SQL statement that reads rows from a table. Every query returns a sequence of rows; each row is a tuple of values.

**Syntax:**

```sql
SELECT column1, column2   -- which columns you want (projection)
FROM table_name           -- which table to read from
```

**`fetchone()` vs `fetchall()`:**

```python
# fetchone() — returns one row as a tuple, or None if no rows
row = conn.execute("SELECT name FROM tools WHERE name = 'EM-0500'").fetchone()
# → ('EM-0500',)   (a tuple with one element)

# fetchall() — returns all rows as a list of tuples
rows = conn.execute("SELECT name, diameter_inches FROM tools").fetchall()
# → [('EM-0500', 0.5), ('DR-0250', 0.25)]
```

**`cursor` iteration** — for large result sets, iterate instead of loading all rows into memory:

```python
cursor = conn.execute("SELECT name FROM tools")
for row in cursor:     # one row at a time — never loads all rows into memory
    print(row[0])      # row is a tuple; index 0 is the first selected column
```

**`conn.row_factory = sqlite3.Row`** — makes rows accessible by column name instead of index:

```python
conn.row_factory = sqlite3.Row   # must set before executing queries
row = conn.execute("SELECT name, diameter_inches FROM tools").fetchone()
row["name"]           # → 'EM-0500'  (by column name)
row["diameter_inches"] # → 0.5
row[0]                # → 'EM-0500'  (still works by index too)
```

**We will use `row_factory = sqlite3.Row` in this project.** Column names are more readable and do not break when column order changes.

---

### Concept: `SELECT *` vs Named Columns

**What it is:** `SELECT *` means "select all columns." `SELECT name, diameter_inches` means "select only these two columns."

**The problem with `SELECT *`:**

```sql
-- Today this works fine:
SELECT * FROM tools
-- Returns: id, name, diameter_inches, flutes, material, tool_type, notes

-- Next month a column is added: stickout_inches
SELECT * FROM tools
-- Now returns: id, name, diameter_inches, flutes, material, tool_type, notes, stickout_inches
-- Any code that accesses row[5] expecting "tool_type" now gets "notes" instead
```

`SELECT *` is brittle — the column positions shift silently when the schema changes. It also transfers unnecessary data when only two columns are needed.

**The rule:** Name your columns explicitly. `SELECT name, diameter_inches FROM tools` is safe even if the schema changes — it will always return exactly those two columns.

**Exception:** `SELECT *` is acceptable in exploratory queries in a SQL browser when you are inspecting data. It is not acceptable in application code.

**You will see this again in:** Every codebase that uses SQL. Code reviewers will flag `SELECT *` in application code. In ORMs (SQLAlchemy), the ORM generates named-column SELECT statements automatically.

---

## Step 4 — WHERE: Filtering Rows

### Concept: `WHERE` Clause

**What it is:** A condition that filters which rows the query returns. Only rows where the condition is `TRUE` are included.

**Syntax:**

```sql
SELECT name, diameter_inches
FROM tools
WHERE material = 'carbide'          -- only rows where material equals 'carbide'
```

**Operators in WHERE:**

```sql
WHERE diameter_inches > 0.5         -- greater than
WHERE diameter_inches >= 0.5        -- greater than or equal
WHERE diameter_inches < 1.0         -- less than
WHERE name = 'EM-0500'             -- equality
WHERE name != 'EM-0500'            -- not equal (also: <>)
WHERE material = 'carbide'
  AND tool_type = 'endmill'         -- both conditions must be true
WHERE material = 'carbide'
  OR material = 'HSS'               -- either condition must be true
WHERE NOT material = 'carbide'      -- negate the condition
```

**Operator precedence:** `AND` binds tighter than `OR`. Use parentheses when mixing both:

```sql
-- Ambiguous (AND evaluates first): endmills over 0.5" OR any HSS tool
WHERE tool_type = 'endmill' AND diameter_inches > 0.5 OR material = 'HSS'

-- Clear intent: endmills over 0.5" OR HSS over 0.5"
WHERE (tool_type = 'endmill' OR material = 'HSS') AND diameter_inches > 0.5
```

When mixing `AND` and `OR`, always use parentheses. The rule is not about knowing the precedence — it is about making intent explicit so the next reader does not have to look it up.

**You will see this again in:** Every SQL query ever written. Boolean logic in WHERE clauses is the most common interview SQL topic: "Write a query to find tools that are either carbide endmills or HSS drills."

---

### Concept: Three-Valued Logic and `IS NULL`

**What it is:** SQL has three truth values — `TRUE`, `FALSE`, and `NULL` (unknown). A comparison with `NULL` returns `NULL`, not `FALSE`. Rows where the condition is `NULL` are not returned — the same as `FALSE`.

**The problem:** You have tools where `notes` is NULL. You write:

```sql
WHERE notes = NULL
```

This returns zero rows. Always. Even if 400 rows have `NULL` notes.

**Why:** `NULL` represents "unknown." Is "unknown" equal to "unknown"? The answer is "unknown" — you cannot know if two unknown values are the same. So `NULL = NULL` evaluates to `NULL`, not `TRUE`. The row fails the condition.

**The fix:** Use `IS NULL` and `IS NOT NULL`:

```sql
WHERE notes IS NULL         -- rows where notes has no value
WHERE notes IS NOT NULL     -- rows where notes has a value
```

**Three-valued logic in full:**

```
NULL = NULL        → NULL   (not TRUE — row excluded)
NULL = 'carbide'   → NULL   (not TRUE — row excluded)
NULL IS NULL       → TRUE   (row included)
NULL IS NOT NULL   → FALSE  (row excluded)
1 = 1              → TRUE   (row included)
1 = 2              → FALSE  (row excluded)
```

**Project Application:** `tools.flutes` is nullable — drills do not have this field. A query for "tools with no flute count" must use `WHERE flutes IS NULL`. `WHERE flutes = NULL` returns nothing.

**Smallest possible example:**

```python
import sqlite3
conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE t (name TEXT, notes TEXT)")
conn.execute("INSERT INTO t VALUES ('A', NULL)")
conn.execute("INSERT INTO t VALUES ('B', 'some note')")

wrong = conn.execute("SELECT name FROM t WHERE notes = NULL").fetchall()
print(wrong)   # → []  — returns nothing! NULL = NULL is NULL, not TRUE

correct = conn.execute("SELECT name FROM t WHERE notes IS NULL").fetchall()
print(correct) # → [('A',)]  — correct
```

**You will see this again in:** Every query on nullable columns. This is a classic SQL interview question: "Why does `WHERE column = NULL` return no rows?" Three-valued logic appears in SQL Server, PostgreSQL, MySQL, and SQLite — it is part of the SQL standard.

**Career signal:** SQL NULL handling trips up experienced developers. Explaining three-valued logic cold in an interview signals real SQL understanding, not just syntax familiarity.

**Watch for:** `WHERE column != 'value'` also excludes NULL rows. `SELECT * FROM tools WHERE material != 'carbide'` will not return tools where `material IS NULL`. If you want those rows, you must write `WHERE material != 'carbide' OR material IS NULL`.

---

### Red: Write the WHERE Tests

Add to `tests/test_queries.py`:

```python
from tooldb.queries import insert_tool, find_carbide_tools   # ← add find_carbide_tools


def seed_tools(conn):
    """Insert 10 tools for testing. Returns nothing — the conn has the data."""
    tools = [
        #  name          diameter  material    tool_type   flutes  notes
        ("EM-0500",      0.500,  "carbide",  "endmill",      4,   None),
        ("EM-0375",      0.375,  "carbide",  "endmill",      3,   None),
        ("EM-0625",      0.625,  "carbide",  "endmill",      4,   "roughing"),
        ("DR-0250",      0.250,  "carbide",  "drill",        None, None),
        ("DR-0312",      0.3125, "carbide",  "drill",        None, None),
        ("FM-0750",      0.750,  "carbide",  "facemill",     None, None),
        ("EM-0500-HSS",  0.500,  "HSS",      "endmill",      2,   None),
        ("EM-0375-HSS",  0.375,  "HSS",      "endmill",      2,   None),
        ("DR-0500-HSS",  0.500,  "HSS",      "drill",        None, None),
        ("EM-1000",      1.000,  "carbide",  "endmill",      4,   "only used for surfacing"),
    ]
    for name, diam, mat, tt, fl, notes in tools:
        insert_tool(conn, name=name, diameter_inches=diam,
                    material=mat, tool_type=tt, flutes=fl, notes=notes)


def test_find_carbide_tools(tmp_path):
    conn = make_db(tmp_path)
    seed_tools(conn)

    results = find_carbide_tools(conn)

    # 6 carbide tools in the seed data: EM-0500, EM-0375, EM-0625, DR-0250, DR-0312, FM-0750, EM-1000
    assert len(results) == 7
    for row in results:
        assert row["material"] == "carbide"   # every result must be carbide


def test_null_notes_not_found_with_equals(tmp_path):
    conn = make_db(tmp_path)
    seed_tools(conn)

    # This query uses = NULL — it should return 0 rows even though 8 tools have no notes
    rows = conn.execute("SELECT name FROM tools WHERE notes = NULL").fetchall()
    assert len(rows) == 0   # three-valued logic: NULL = NULL → NULL, not TRUE
```

Run the tests:

```
pytest tests/test_queries.py -v
```

**You should see:** `FAILED` for `test_find_carbide_tools` (function doesn't exist yet) and `PASSED` for `test_null_notes_not_found_with_equals` (this test uses raw SQL directly — it passes because the SQL behavior is already true).

---

### Green: Add `find_carbide_tools` to `queries.py`

Add to `tooldb/queries.py`:

```python
def find_carbide_tools(conn: sqlite3.Connection) -> list:
    """Return all tools made of carbide, ordered by name."""
    conn.row_factory = sqlite3.Row   # rows accessible by column name, not just index
    rows = conn.execute(
        """
        SELECT name, diameter_inches, material, tool_type, flutes
        FROM tools
        WHERE material = 'carbide'
        ORDER BY name
        """,
        # no parameters needed — 'carbide' is a constant, not user input
        # if material came from user input, we'd use: WHERE material = ?
    ).fetchall()
    return list(rows)   # fetchall() returns a list already; explicit for clarity
```

Run:

```
pytest tests/test_queries.py -v
```

**You should see:**

```
PASSED tests/test_queries.py::test_insert_and_count_tools
PASSED tests/test_queries.py::test_find_carbide_tools
PASSED tests/test_queries.py::test_null_notes_not_found_with_equals
```

### SAVE AND TRY

```
pytest tests/test_queries.py -v
```

**You should see:** 3 tests passing.

**Change something:** Change the WHERE condition to `WHERE material = 'HSS'`. Run. The test fails (`AssertionError: assert 3 != 7`). Change it back.

---

## 🎯 Challenge: `find_endmills_with_notes`

**You know:** WHERE with AND, and IS NOT NULL.

**Task:** Add a function `find_endmills_with_notes(conn)` that returns only endmills that have a non-null `notes` field. Write a test that seeds the 10-tool set and asserts the correct count is returned.

**Starting code (add to `queries.py`):**

```python
def find_endmills_with_notes(conn: sqlite3.Connection) -> list:
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT name, tool_type, notes
        FROM tools
        WHERE ???
        """,
    ).fetchall()
    return list(rows)
```

**Hints:**

1. You need two conditions: `tool_type = 'endmill'` AND `notes IS NOT NULL`
2. In the seed data, only `EM-0625` (notes="roughing") and `EM-1000` (notes="only used for surfacing") qualify

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```python
def find_endmills_with_notes(conn: sqlite3.Connection) -> list:
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT name, tool_type, notes
        FROM tools
        WHERE tool_type = 'endmill'
          AND notes IS NOT NULL
        """,
        # IS NOT NULL is the correct test for "has a value" — notes != NULL would return nothing
    ).fetchall()
    return list(rows)
```

Test:

```python
from tooldb.queries import find_endmills_with_notes

def test_find_endmills_with_notes(tmp_path):
    conn = make_db(tmp_path)
    seed_tools(conn)

    results = find_endmills_with_notes(conn)
    assert len(results) == 2
    names = [row["name"] for row in results]
    assert "EM-0625" in names
    assert "EM-1000" in names
```

**Key insight:** `notes IS NOT NULL` is the only way to test for the presence of a value in a nullable column. `notes != NULL` evaluates to `NULL` (unknown) for every row — no rows are returned. Always use `IS NULL` and `IS NOT NULL` when testing for null presence.

</details>

---

## Step 5 — WHERE with Multiple Conditions

Add to `tests/test_queries.py`:

```python
from tooldb.queries import insert_tool, find_carbide_tools, find_endmills_larger_than  # ← add


def test_find_endmills_larger_than(tmp_path):
    conn = make_db(tmp_path)
    seed_tools(conn)

    results = find_endmills_larger_than(conn, min_diameter=0.5)

    # Endmills with diameter > 0.5: EM-0625 (0.625), EM-1000 (1.000)
    # EM-0500 has diameter EQUAL to 0.5 — greater-than is strict, so it is excluded
    assert len(results) == 2
    for row in results:
        assert row["tool_type"] == "endmill"
        assert row["diameter_inches"] > 0.5
```

Run:

```
pytest tests/test_queries.py::test_find_endmills_larger_than -v
```

**You should see:** `FAILED` — `find_endmills_larger_than` does not exist yet.

### Green: Add `find_endmills_larger_than`

Add to `tooldb/queries.py`:

```python
def find_endmills_larger_than(conn: sqlite3.Connection, min_diameter: float) -> list:
    """Return all endmills with diameter strictly greater than min_diameter."""
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT name, diameter_inches, material, tool_type
        FROM tools
        WHERE tool_type = 'endmill'
          AND diameter_inches > ?
        ORDER BY diameter_inches DESC
        """,
        (min_diameter,),   # single-element tuple: the trailing comma is required
    ).fetchall()
    return list(rows)
```

Run:

```
pytest tests/test_queries.py -v
```

**You should see:** 4 tests passing.

### SAVE AND TRY

```
pytest tests/test_queries.py -v
```

**Change something:** Change `> ?` to `>= ?`. The test fails because `EM-0500` (diameter exactly 0.5) is now included — `len(results) == 3` but the test expects 2. Change it back.

---

## Step 6 — ORDER BY and LIMIT: Sorting and Paging

### Concept: `ORDER BY`

**What it is:** A clause that sorts the result rows before they are returned.

**Syntax:**

```sql
SELECT name, diameter_inches
FROM tools
ORDER BY diameter_inches DESC     -- largest first (descending)

ORDER BY diameter_inches ASC      -- smallest first (ascending) — ASC is the default
ORDER BY material, diameter_inches -- sort by material first, then diameter within each material
```

Without `ORDER BY`, the row order is undefined — SQLite may return rows in any order, and that order can change between queries. Never rely on "natural order" in a SQL result.

**You will see this again in:** Every query that displays results to a user. "Show me all tools sorted by diameter" is a direct `ORDER BY`. Pagination (showing 20 results at a time) requires a consistent `ORDER BY` to make the pages stable.

**Watch for:** Sorting on a nullable column. NULLs sort as lowest in ascending order and highest in descending order in SQLite. `ORDER BY flutes ASC` puts all NULL-flutes tools first.

---

### Concept: `LIMIT`

**What it is:** A clause that caps the number of rows returned to at most N rows.

**Syntax:**

```sql
SELECT name, diameter_inches
FROM tools
ORDER BY diameter_inches DESC
LIMIT 5     -- return at most 5 rows
```

`LIMIT` always comes after `ORDER BY`. Without `ORDER BY`, `LIMIT 5` returns 5 rows in undefined order — you might get different rows on different runs.

**`OFFSET` for pagination:**

```sql
ORDER BY name
LIMIT 10 OFFSET 20    -- skip the first 20 rows, return rows 21–30
```

`OFFSET` is how SQL implements pages: page 1 is `LIMIT 10 OFFSET 0`, page 2 is `LIMIT 10 OFFSET 10`, page 3 is `LIMIT 10 OFFSET 20`.

**You will see this again in:** Every API endpoint that returns a list of items. "Get the first page of tools" is `LIMIT 20 OFFSET 0`. "Get page 3" is `LIMIT 20 OFFSET 40`. This pattern appears in every REST API and every web frontend that displays paginated tables.

**Watch for:** `LIMIT` without `ORDER BY` gives non-deterministic results. Always pair them.

---

### Red: Write the ORDER BY + LIMIT Tests

Add to `tests/test_queries.py`:

```python
from tooldb.queries import (         # update this import
    insert_tool,
    find_carbide_tools,
    find_endmills_larger_than,
    top_tools_by_diameter,           # ← add
)


def test_top_tools_by_diameter_returns_correct_count(tmp_path):
    conn = make_db(tmp_path)
    seed_tools(conn)

    results = top_tools_by_diameter(conn, limit=5)
    assert len(results) == 5   # exactly 5 rows


def test_top_tools_by_diameter_correct_order(tmp_path):
    conn = make_db(tmp_path)
    seed_tools(conn)

    results = top_tools_by_diameter(conn, limit=3)

    # Top 3 by diameter: EM-1000 (1.0"), FM-0750 (0.75"), EM-0625 (0.625")
    assert results[0]["name"] == "EM-1000"    # largest first
    assert results[1]["name"] == "FM-0750"
    assert results[2]["name"] == "EM-0625"
```

Run:

```
pytest tests/test_queries.py -v
```

**You should see:** 2 new failures. Red.

### Green: Add `top_tools_by_diameter`

Add to `tooldb/queries.py`:

```python
def top_tools_by_diameter(conn: sqlite3.Connection, limit: int) -> list:
    """Return the top N tools by diameter, largest first."""
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT name, diameter_inches, material, tool_type
        FROM tools
        ORDER BY diameter_inches DESC    -- largest diameter first
        LIMIT ?
        """,
        (limit,),   # limit comes from Python code, not user input here, but parameterize anyway
    ).fetchall()
    return list(rows)
```

Run:

```
pytest tests/test_queries.py -v
```

**You should see:** All 6 tests passing. Green.

---

### Refactor: Extract `_open_db`

Looking at the queries, every function sets `conn.row_factory = sqlite3.Row` before executing. That is duplication — if we add a function and forget that line, it will return tuples instead of named rows.

The fix: set `row_factory` once when the connection is opened, not inside every function.

In a production codebase, the connection would be opened in one place and passed everywhere with `row_factory` already set. For now, note this pattern as a future refactor. We will address it in Block 3 when we build the `DatabaseConnection` adapter.

The duplication is acceptable for now — the tests protect us from forgetting `row_factory` because they access results by column name (`row["name"]`), which would raise a `TypeError` if `row_factory` were not set.

### SAVE AND TRY

```
pytest tests/test_queries.py -v
```

**You should see:**

```
PASSED tests/test_queries.py::test_insert_and_count_tools
PASSED tests/test_queries.py::test_find_carbide_tools
PASSED tests/test_queries.py::test_find_endmills_larger_than
PASSED tests/test_queries.py::test_top_tools_by_diameter_returns_correct_count
PASSED tests/test_queries.py::test_top_tools_by_diameter_correct_order
PASSED tests/test_queries.py::test_null_notes_not_found_with_equals
```

All green.

**Change something:** In `top_tools_by_diameter`, change `DESC` to `ASC`. The order test fails because the smallest tools come first. Change it back.

---

## 🎯 Challenge: `find_tools_by_material_and_type`

**You know:** WHERE with AND, named columns, ORDER BY.

**Task:** Add `find_tools_by_material_and_type(conn, material, tool_type)` that accepts both as parameters and returns matching tools ordered by diameter ascending. Then write a test that seeds 10 tools and asserts the correct count for `("carbide", "endmill")` and `("HSS", "endmill")`.

**Starting code (add to `queries.py`):**

```python
def find_tools_by_material_and_type(
    conn: sqlite3.Connection,
    material: str,
    tool_type: str,
) -> list:
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT ???
        FROM tools
        WHERE ???
        ORDER BY ???
        """,
        ???,
    ).fetchall()
    return list(rows)
```

**Hints:**

1. Two `?` placeholders, two values in the tuple
2. In the seed data: carbide endmills are EM-0500, EM-0375, EM-0625, EM-1000 (4 tools); HSS endmills are EM-0500-HSS, EM-0375-HSS (2 tools)

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```python
def find_tools_by_material_and_type(
    conn: sqlite3.Connection,
    material: str,
    tool_type: str,
) -> list:
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT name, diameter_inches, material, tool_type
        FROM tools
        WHERE material = ?
          AND tool_type = ?
        ORDER BY diameter_inches ASC
        """,
        (material, tool_type),   # two values — order matches the two ? placeholders
    ).fetchall()
    return list(rows)
```

Test:

```python
from tooldb.queries import find_tools_by_material_and_type

def test_find_tools_by_material_and_type(tmp_path):
    conn = make_db(tmp_path)
    seed_tools(conn)

    carbide_endmills = find_tools_by_material_and_type(conn, "carbide", "endmill")
    assert len(carbide_endmills) == 4

    hss_endmills = find_tools_by_material_and_type(conn, "HSS", "endmill")
    assert len(hss_endmills) == 2

    # Verify ascending order: first result has smallest diameter
    assert carbide_endmills[0]["diameter_inches"] < carbide_endmills[-1]["diameter_inches"]
```

**Key insight:** Two `?` placeholders map to two values in the tuple, in the same left-to-right order. If the tuple order and the placeholder order diverge, the wrong values filter the wrong columns — a silent bug that only shows up in wrong results, not an error. The parameter tuple is the single place where order matters.

</details>

---

## Step 7 — LIKE and BETWEEN (Appendix)

Two common WHERE operators that did not fit the main steps:

**`LIKE` — pattern matching:**

```sql
WHERE name LIKE 'EM-%'      -- names starting with "EM-"
WHERE name LIKE '%HSS%'     -- names containing "HSS" anywhere
WHERE name LIKE '__-0%'     -- underscore _ matches exactly one character
```

`%` matches any sequence of zero or more characters. `_` matches exactly one character. `LIKE` is case-insensitive in SQLite for ASCII characters.

**`BETWEEN` — range inclusively:**

```sql
WHERE diameter_inches BETWEEN 0.25 AND 0.75
-- equivalent to: WHERE diameter_inches >= 0.25 AND diameter_inches <= 0.75
-- BETWEEN is always inclusive on both ends
```

**`IN` — membership:**

```sql
WHERE material IN ('carbide', 'HSS')
-- equivalent to: WHERE material = 'carbide' OR material = 'HSS'
-- cleaner when testing against more than two values
```

These operators will appear throughout the project. No challenge here — they follow the same WHERE rules you have already learned.

---

## Final Check

| Feature | How to verify |
|---|---|
| `insert_tool` inserts a row and returns its id | Run `test_insert_and_count_tools` — passes, and `lastrowid` is 1 for first insert |
| `find_carbide_tools` returns only carbide tools | Run `test_find_carbide_tools` — 7 rows, all `material == "carbide"` |
| `find_endmills_larger_than` excludes equal diameter | Run `test_find_endmills_larger_than` with `min_diameter=0.5` — EM-0500 excluded |
| `top_tools_by_diameter` respects LIMIT | Run `test_top_tools_by_diameter_returns_correct_count` — exactly 5 rows |
| `top_tools_by_diameter` returns largest first | Run `test_top_tools_by_diameter_correct_order` — EM-1000 first |
| `WHERE notes = NULL` returns zero rows | Run `test_null_notes_not_found_with_equals` — zero rows even though 8 tools have NULL notes |
| `? ` placeholder prevents SQL injection | Inspect any function in `queries.py` — no f-strings or string concatenation in SQL |
| All 6 tests pass | `pytest tests/test_queries.py -v` — 6 PASSED, 0 FAILED |

---

## Quick Check Answers

**1. You write `WHERE material = NULL` — how many rows come back?**

Zero, always. SQL uses three-valued logic: a comparison with `NULL` evaluates to `NULL` (unknown), not `TRUE` or `FALSE`. Rows are only included when the WHERE condition is `TRUE`. Since `NULL = NULL` evaluates to `NULL` (not `TRUE`), no rows satisfy the condition, even rows that actually have a NULL value in that column. The correct test is `WHERE material IS NULL`, which evaluates to `TRUE` for rows where the column has no value.

**2. What does "declarative" mean? How is it different from a Python `for` loop?**

Declarative means you describe the result you want, not the steps to produce it. `SELECT name FROM tools WHERE material = 'carbide'` says "I want names of carbide tools" — it says nothing about how to find them. A Python `for` loop is imperative: it describes step by step how to check each tool and collect matches. The database engine receives the declarative SQL and chooses its own execution plan — it might scan every row, use an index, or use a hash join. You never write that logic.

**3. What is the difference between `SELECT *` and `SELECT name, diameter_inches`?**

`SELECT *` returns every column, in the order they were defined when the table was created. `SELECT name, diameter_inches` returns only those two named columns, in that order, regardless of how the table is structured. The practical difference: if a new column is added to the table later, `SELECT *` silently returns it (breaking any code that accesses columns by index). Named-column SELECT is stable — it only returns the columns you asked for, and their positions in the result do not change if the table schema changes.
