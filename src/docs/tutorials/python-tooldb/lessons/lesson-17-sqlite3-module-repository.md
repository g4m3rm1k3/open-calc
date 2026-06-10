# Python Tool Database — LAB 17 — Raw SQL with Python's sqlite3 Module

**Prerequisites:** Lab 16. You have `create_assembly_with_transaction` in `queries.py`. You understand INSERT, SELECT, JOINs, transactions, and FK enforcement. All tests pass.

**What this lab adds:**
- The difference between a connection and a cursor
- SQL injection — what it is, how it works, why `?` placeholders prevent it
- `fetchall()` vs cursor iteration — eager vs lazy loading
- `row_factory = sqlite3.Row` — named column access explained fully
- A `ToolRepository` class that wraps all tool-related SQL into a single, cohesive object

**Time:** 55–70 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. What is a cursor? You have `conn = sqlite3.connect("tools.db")` and `cursor = conn.cursor()`. What is the difference between `conn` and `cursor`?
> 2. A user types their username into a login form. You write: `f"SELECT * FROM users WHERE name = '{username}'"`. The user types `admin' --`. What SQL does the database receive? What happens?
> 3. You have 100,000 tool rows. `fetchall()` returns all 100,000. What is the downside? What do you use instead?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `ToolRepository` class in a new file `tooldb/tool_repository.py`:

```python
repo = ToolRepository(conn)

repo.insert("EM-0500", diameter_inches=0.5, material="carbide", tool_type="endmill")
repo.get_all()              # → list of all tools as dicts
repo.get_by_id(1)           # → one tool dict, or None
repo.search_by_material("carbide")  # → list of carbide tools
```

Running `pytest tests/test_tool_repository.py -v` will show:

```
PASSED tests/test_tool_repository.py::test_insert_returns_id
PASSED tests/test_tool_repository.py::test_get_all_returns_inserted_tools
PASSED tests/test_tool_repository.py::test_get_by_id_returns_correct_tool
PASSED tests/test_tool_repository.py::test_get_by_id_returns_none_for_missing
PASSED tests/test_tool_repository.py::test_search_by_material_returns_matches
PASSED tests/test_tool_repository.py::test_sql_injection_is_prevented
```

---

## Step 1 — Connection vs Cursor

The `sqlite3` module has two key objects. They are often confused.

### Concept: `sqlite3.Connection` vs `sqlite3.Cursor`

**`sqlite3.Connection`:**

Represents the open file. It manages:
- The file handle to `tools.db`
- Transaction state (BEGIN / COMMIT / ROLLBACK)
- The connection-level settings (`row_factory`, `isolation_level`)

```python
conn = sqlite3.connect("tools.db")   # opens the file (or creates it)
conn.execute("PRAGMA foreign_keys = ON")   # connection-level setting
conn.commit()                             # transaction-level operation
conn.close()                              # releases the file handle
```

**`sqlite3.Cursor`:**

Represents one in-progress SQL statement. It manages:
- The result set of the last executed query
- The current position when iterating results
- `lastrowid` — the auto-assigned id of the last inserted row

```python
cursor = conn.execute("SELECT name FROM tools")   # executes and returns a Cursor
row = cursor.fetchone()    # fetches the first result row
rows = cursor.fetchall()   # fetches all remaining result rows
cursor.lastrowid           # the id of the row inserted by the last INSERT statement
```

**`conn.execute()` is a shortcut.** It creates a cursor internally and returns it. You have been using this shortcut throughout the project:

```python
# Long form:
cursor = conn.cursor()
cursor.execute("SELECT name FROM tools")
rows = cursor.fetchall()

# Short form (equivalent):
cursor = conn.execute("SELECT name FROM tools")
rows = cursor.fetchall()
```

The short form is used everywhere in this project. The long form is only necessary when you need the cursor object before executing a statement.

**You will see this again in:** Every use of Python's `sqlite3` module. The connection/cursor separation also appears in other database drivers: `psycopg2` (PostgreSQL), `mysql-connector` (MySQL), `pyodbc` (SQL Server). They all use the same pattern.

**Watch for:** Confusing cursor iteration state. After `fetchall()`, the cursor is exhausted — calling `fetchall()` again returns an empty list. Create a new cursor (new `conn.execute()`) for each query.

---

## Step 2 — SQL Injection: The Threat and the Defense

### Concept: SQL Injection — and Why `?` Placeholders Prevent It

**What it is:** SQL injection is an attack where user-supplied input is interpreted as SQL commands rather than as data. It is consistently one of the top web application vulnerabilities.

**The attack — building SQL with string formatting:**

```python
# VULNERABLE: user-supplied material is inserted directly into the SQL string
def search_by_material_bad(conn, material):
    query = f"SELECT * FROM tools WHERE material = '{material}'"
    return conn.execute(query).fetchall()

# Normal input: material = "carbide"
# SQL: SELECT * FROM tools WHERE material = 'carbide'   ← correct

# Malicious input: material = "'; DELETE FROM tools; --"
# SQL: SELECT * FROM tools WHERE material = ''; DELETE FROM tools; --'
# The database receives TWO statements:
#   SELECT * FROM tools WHERE material = ''
#   DELETE FROM tools;        ← ENTIRE TABLE WIPED
# The "--" comments out the trailing quote
```

The attacker injects the `'; DELETE FROM tools; --` string, which ends the string literal, adds a destructive second statement, and comments out the rest.

**The defense — parameter placeholders:**

```python
# SAFE: material is a parameter, not part of the SQL string
def search_by_material_safe(conn, material):
    return conn.execute(
        "SELECT * FROM tools WHERE material = ?",
        (material,),   # material is escaped and quoted by SQLite, not Python
    ).fetchall()

# With input: "'; DELETE FROM tools; --"
# SQLite receives it as a string value, not SQL syntax.
# The database treats the entire input as the search string.
# It finds no tools with that material name. No deletion.
```

**What `?` actually does:** The `?` is a parameter placeholder. Python's `sqlite3` module sends the SQL template and the parameter values separately. SQLite receives the SQL and the parameters as distinct inputs — it never concatenates them. The value is treated as data, not as SQL. Special characters like `'`, `;`, and `--` have no syntactic meaning.

**What it hides:** The escaping and quoting logic that would be required to safely interpolate user values into SQL strings. Correct manual escaping is error-prone — a single missed character creates a vulnerability. Parameterized queries remove the problem entirely by keeping data and code on separate channels.

**Canonical example (General Explanation):**

A library catalog. You search for books by author:

```python
# Bad: author is part of the SQL
query = f"SELECT * FROM books WHERE author = '{author}'"

# If author = "'; DROP TABLE books; --":
# SELECT * FROM books WHERE author = ''; DROP TABLE books; --'
# The library's entire catalog is deleted.

# Good: author is a parameter
conn.execute("SELECT * FROM books WHERE author = ?", (author,))
# Even if author = "'; DROP TABLE books; --":
# SQLite searches for a book by an author whose name is literally "'; DROP TABLE books; --"
# No injection. No deletion.
```

**You will see this again in:** Every SQL query that uses user input. `psycopg2` uses `%s` instead of `?` but the concept is identical. SQLAlchemy uses named parameters (`:name`). The principle is universal: never build SQL strings with string formatting. Always use parameterized queries. OWASP lists SQL injection as one of the top 10 web application security risks every year.

**Career signal:** SQL injection is the most famous database vulnerability. "How do you prevent SQL injection?" is asked in almost every web developer interview. The answer is always: parameterized queries / prepared statements. Knowing *why* they work (data and code on separate channels) — not just that they exist — signals security awareness.

**Watch for:** Using `?` for values but not for table or column names. Parameterized queries only work for values, not for identifiers. You cannot write `SELECT * FROM ? WHERE id = ?` and pass the table name as a parameter. If table or column names must come from user input, use a whitelist (allow only known-good values) rather than parameterization.

---

## Step 3 — `fetchall()` vs Cursor Iteration

### Concept: Eager vs Lazy Result Loading

**`fetchall()` — eager loading:** Returns all rows immediately as a list. All rows are loaded into Python's memory at once.

```python
rows = conn.execute("SELECT * FROM tools").fetchall()
# All 100,000 tool rows are now in Python's memory as a list.
# len(rows) → 100000
# for row in rows: ...   ← iterates the in-memory list, no database calls
```

**Cursor iteration — lazy loading:** Fetches rows one at a time as you iterate. Only one row exists in memory at a time.

```python
cursor = conn.execute("SELECT * FROM tools")
for row in cursor:            # ← fetches one row per iteration from SQLite
    process(row)              # row is in memory; previous row is discarded
    # only one row in Python's memory at any time
```

**When to use each:**

| Use `fetchall()` | Use cursor iteration |
|-----------------|---------------------|
| Result fits comfortably in memory | Result could be very large |
| You need to pass the list to another function | You only need to process each row once |
| You need to count or slice the results | You want to stop early with `break` |
| The query is known to return few rows | Memory is a concern |

**For this project:** `fetchall()` is correct everywhere. The tool database will have at most a few thousand rows — always small enough to fit in memory. Cursor iteration is the right pattern for large exports, streaming responses, or bulk processing.

**You will see this again in:** Every database-backed application. ORM lazy loading (SQLAlchemy's `lazy='dynamic'`) is cursor iteration applied to relationship queries. Pandas' `chunksize` parameter in `read_sql` is cursor iteration for large dataset loading.

---

## Step 4 — `row_factory = sqlite3.Row`

You have used `conn.row_factory = sqlite3.Row` in several functions already. This step explains it fully.

**Without `row_factory`:**

```python
conn = sqlite3.connect("tools.db")
rows = conn.execute("SELECT name, diameter_inches FROM tools").fetchall()
# rows is a list of tuples:
# [('EM-0500', 0.5), ('DR-0250', 0.25), ...]

row = rows[0]
row[0]   # → 'EM-0500'  (by index — fragile: breaks if column order changes)
row[1]   # → 0.5
```

**With `row_factory = sqlite3.Row`:**

```python
conn = sqlite3.connect("tools.db")
conn.row_factory = sqlite3.Row   # must be set before any execute calls
rows = conn.execute("SELECT name, diameter_inches FROM tools").fetchall()
# rows is a list of sqlite3.Row objects:

row = rows[0]
row["name"]             # → 'EM-0500'  (by column name — safe regardless of column order)
row["diameter_inches"]  # → 0.5
row[0]                  # → 'EM-0500'  (still works by index)
dict(row)               # → {"name": "EM-0500", "diameter_inches": 0.5}
```

**`sqlite3.Row` is a named-tuple-like object.** It supports both index access and name access, and can be converted to a dict.

**The `ToolRepository` will set `row_factory` once** at initialization, so every query automatically returns named rows without repeating the line in each method.

---

## Step 5 — The Repository Pattern

Before building the class, understand the pattern it implements.

### Concept: Repository Pattern — Encapsulating Data Access

**What it is:** A class that provides a domain-focused interface to database operations, hiding all SQL behind method calls. Code that uses a `ToolRepository` never writes SQL — it calls `repo.get_by_id(3)` and gets a tool back.

**What it hides:** All SQL — the specific SELECT, INSERT, and WHERE clauses. Code outside the repository does not know how tools are stored (SQLite, PostgreSQL, a JSON file, or a web API could all be hidden behind the same interface). The invariant the Repository protects: SQL is written in exactly one place. If the schema changes, only the repository changes; no other code needs updating.

**The three-layer structure:**

```
UI / Service layer:
    repo.search_by_material("carbide")  ← knows nothing about SQL

Repository layer (ToolRepository):
    def search_by_material(self, material):
        return self.conn.execute(
            "SELECT name, diameter_inches FROM tools WHERE material = ?",
            (material,)
        ).fetchall()                    ← the only place this SQL appears

Database:
    tools table                        ← the actual storage
```

**Pattern category:** Behavioral (GoF is not the original source — it is from "Patterns of Enterprise Application Architecture" by Martin Fowler, 2002)

**Pain before:** SQL scattered everywhere:

```python
# In main.py:
rows = conn.execute("SELECT name, diameter_inches FROM tools WHERE material = 'carbide'").fetchall()

# In api.py:
rows = conn.execute("SELECT name, diameter_inches FROM tools WHERE material = 'carbide'").fetchall()

# In report.py:
rows = conn.execute("SELECT name, diameter FROM tools WHERE mat = 'carbide'").fetchall()
#                                                       ↑ typo: "mat" not "material"
```

The same SQL in three places, one with a typo. When the column name changes from `diameter_inches` to `diameter_mm`, you must find and fix all three.

**Solution:** All SQL in the repository:

```python
# In main.py, api.py, and report.py — all the same:
tools = repo.search_by_material("carbide")
```

**Tradeoff:** A repository adds a class and an abstraction. For a tiny one-file script, it is over-engineering. For any application that uses data in more than one place, it pays for itself immediately.

**You will see this again in:** Every domain-driven design, every layered architecture. SQLAlchemy sessions are built on the repository pattern. This is a named design pattern in Martin Fowler's "Patterns of Enterprise Application Architecture." Block 3 of this project: `ToolRepositoryPort` (the interface) and `SqliteToolRepository` (this class's successor).

---

## Step 6 — Red: Write the Tests

Create `tests/test_tool_repository.py`:

```python
import sqlite3
import pytest
from tooldb.schema import create_schema
from tooldb.tool_repository import ToolRepository   # ← new file, doesn't exist yet


def make_repo(tmp_path) -> ToolRepository:
    """Create a fresh ToolRepository backed by a temp database."""
    conn = sqlite3.connect(str(tmp_path / "test.db"))
    create_schema(conn)
    return ToolRepository(conn)


def test_insert_returns_id(tmp_path):
    repo = make_repo(tmp_path)

    tool_id = repo.insert(
        name="EM-0500",
        diameter_inches=0.5,
        material="carbide",
        tool_type="endmill",
        flutes=4,
    )
    assert tool_id == 1


def test_get_all_returns_inserted_tools(tmp_path):
    repo = make_repo(tmp_path)
    repo.insert("EM-0500", diameter_inches=0.5, material="carbide", tool_type="endmill")
    repo.insert("DR-0250", diameter_inches=0.25, material="carbide", tool_type="drill")

    tools = repo.get_all()

    assert len(tools) == 2
    names = [t["name"] for t in tools]
    assert "EM-0500" in names
    assert "DR-0250" in names


def test_get_by_id_returns_correct_tool(tmp_path):
    repo = make_repo(tmp_path)
    tool_id = repo.insert("EM-0500", diameter_inches=0.5, material="carbide", tool_type="endmill")

    tool = repo.get_by_id(tool_id)

    assert tool is not None
    assert tool["name"] == "EM-0500"
    assert tool["diameter_inches"] == 0.5
    assert tool["material"] == "carbide"


def test_get_by_id_returns_none_for_missing(tmp_path):
    repo = make_repo(tmp_path)

    result = repo.get_by_id(9999)   # no tool with id 9999
    assert result is None


def test_search_by_material_returns_matches(tmp_path):
    repo = make_repo(tmp_path)
    repo.insert("EM-0500",     diameter_inches=0.5,   material="carbide", tool_type="endmill")
    repo.insert("EM-0375",     diameter_inches=0.375, material="carbide", tool_type="endmill")
    repo.insert("EM-0500-HSS", diameter_inches=0.5,   material="HSS",     tool_type="endmill")

    carbide_tools = repo.search_by_material("carbide")

    assert len(carbide_tools) == 2
    for tool in carbide_tools:
        assert tool["material"] == "carbide"


def test_sql_injection_is_prevented(tmp_path):
    repo = make_repo(tmp_path)
    repo.insert("EM-0500", diameter_inches=0.5, material="carbide", tool_type="endmill")

    # Attempt SQL injection via search_by_material
    # If injection works, this would return all rows (WHERE material = '' OR 1=1)
    # or crash the database
    injected_input = "'; DROP TABLE tools; --"
    results = repo.search_by_material(injected_input)

    # Parameterized queries treat the input as a string value, not SQL
    assert results == []   # no tools with this weird "material" — no injection occurred

    # Verify the tools table still exists and has data
    all_tools = repo.get_all()
    assert len(all_tools) == 1   # EM-0500 still there — table was not dropped
```

Run:

```
pytest tests/test_tool_repository.py -v
```

**You should see:** All 6 failing with `ModuleNotFoundError: No module named 'tooldb.tool_repository'`. Red.

---

## Step 7 — Green: Create `tooldb/tool_repository.py`

Create `tooldb/tool_repository.py`:

```python
import sqlite3


class ToolRepository:
    """Encapsulates all SQL for the tools table.

    Callers use method names like insert, get_by_id, search_by_material.
    No SQL appears outside this class.
    """

    def __init__(self, conn: sqlite3.Connection) -> None:
        self.conn = conn
        self.conn.execute("PRAGMA foreign_keys = ON")
        self.conn.row_factory = sqlite3.Row   # set once here — all queries return named rows
```

Run the first test:

```
pytest tests/test_tool_repository.py::test_insert_returns_id -v
```

**You should see:** `FAILED AttributeError: 'ToolRepository' object has no attribute 'insert'`.

Good. The class exists; now add methods one at a time, running the corresponding test after each.

**Add `insert`:**

```python
    def insert(
        self,
        name: str,
        diameter_inches: float,
        material: str,
        tool_type: str,
        flutes: int = None,
        notes: str = None,
    ) -> int:
        """Insert a tool row and return its auto-assigned id."""
        with self.conn:          # transaction: commit on success, rollback on exception
            cursor = self.conn.execute(
                """
                INSERT INTO tools (name, diameter_inches, material, tool_type, flutes, notes)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (name, diameter_inches, material, tool_type, flutes, notes),
            )
        return cursor.lastrowid
```

Run:

```
pytest tests/test_tool_repository.py::test_insert_returns_id -v
```

**You should see:** `PASSED`.

**Add `get_all`:**

```python
    def get_all(self) -> list[dict]:
        """Return all tools ordered by name."""
        rows = self.conn.execute(
            """
            SELECT id, name, diameter_inches, flutes, material, tool_type, notes
            FROM tools
            ORDER BY name
            """
        ).fetchall()
        return [dict(row) for row in rows]   # convert sqlite3.Row to plain dicts
```

Run:

```
pytest tests/test_tool_repository.py::test_get_all_returns_inserted_tools -v
```

**You should see:** `PASSED`.

**Add `get_by_id`:**

```python
    def get_by_id(self, tool_id: int) -> dict | None:
        """Return one tool by its primary key, or None if not found."""
        row = self.conn.execute(
            """
            SELECT id, name, diameter_inches, flutes, material, tool_type, notes
            FROM tools
            WHERE id = ?
            """,
            (tool_id,),
        ).fetchone()
        return dict(row) if row is not None else None
```

Run:

```
pytest tests/test_tool_repository.py::test_get_by_id_returns_correct_tool tests/test_tool_repository.py::test_get_by_id_returns_none_for_missing -v
```

**You should see:** Both `PASSED`.

**Add `search_by_material`:**

```python
    def search_by_material(self, material: str) -> list[dict]:
        """Return all tools with the given material, ordered by name."""
        rows = self.conn.execute(
            """
            SELECT id, name, diameter_inches, flutes, material, tool_type, notes
            FROM tools
            WHERE material = ?
            ORDER BY name
            """,
            (material,),   # material is a parameter — SQL injection is prevented
        ).fetchall()
        return [dict(row) for row in rows]
```

Run all tests:

```
pytest tests/test_tool_repository.py -v
```

**You should see:**

```
PASSED tests/test_tool_repository.py::test_insert_returns_id
PASSED tests/test_tool_repository.py::test_get_all_returns_inserted_tools
PASSED tests/test_tool_repository.py::test_get_by_id_returns_correct_tool
PASSED tests/test_tool_repository.py::test_get_by_id_returns_none_for_missing
PASSED tests/test_tool_repository.py::test_search_by_material_returns_matches
PASSED tests/test_tool_repository.py::test_sql_injection_is_prevented
```

All green.

### SAVE AND TRY

```
pytest tests/ -v
```

**You should see:** All tests across all files passing.

**Change something:** In `search_by_material`, change `WHERE material = ?` to a string f-string: `f"WHERE material = '{material}'"`. Run `test_sql_injection_is_prevented`. The test FAILS — the injected SQL runs. Then run `test_get_all_returns_inserted_tools` — the table may still exist, but this demonstrates the vulnerability. Restore the parameterized query.

---

### Refactor: The Full Repository Class

Here is the complete `ToolRepository` class for clarity:

```python
import sqlite3


class ToolRepository:
    """All SQL for the tools table. No SQL appears outside this class."""

    def __init__(self, conn: sqlite3.Connection) -> None:
        self.conn = conn
        self.conn.execute("PRAGMA foreign_keys = ON")
        self.conn.row_factory = sqlite3.Row

    def insert(self, name, diameter_inches, material, tool_type, flutes=None, notes=None) -> int:
        with self.conn:
            cursor = self.conn.execute(
                "INSERT INTO tools (name, diameter_inches, material, tool_type, flutes, notes) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (name, diameter_inches, material, tool_type, flutes, notes),
            )
        return cursor.lastrowid

    def get_all(self) -> list[dict]:
        rows = self.conn.execute(
            "SELECT id, name, diameter_inches, flutes, material, tool_type, notes "
            "FROM tools ORDER BY name"
        ).fetchall()
        return [dict(row) for row in rows]

    def get_by_id(self, tool_id: int) -> dict | None:
        row = self.conn.execute(
            "SELECT id, name, diameter_inches, flutes, material, tool_type, notes "
            "FROM tools WHERE id = ?",
            (tool_id,),
        ).fetchone()
        return dict(row) if row is not None else None

    def search_by_material(self, material: str) -> list[dict]:
        rows = self.conn.execute(
            "SELECT id, name, diameter_inches, flutes, material, tool_type, notes "
            "FROM tools WHERE material = ? ORDER BY name",
            (material,),
        ).fetchall()
        return [dict(row) for row in rows]
```

**This is the foundation of Block 3's `SqliteToolRepository`.** In Block 3, this class will implement a `ToolRepositoryPort` abstract base class, so that the service layer is decoupled from SQLite entirely.

---

## 🎯 Challenge: Add `search_by_type_and_min_diameter`

**You know:** Repository pattern, parameterized queries, multiple WHERE conditions.

**Task:** Add `search_by_type_and_min_diameter(self, tool_type, min_diameter_inches)` to `ToolRepository`. Write a test that inserts 5 tools (mix of types and diameters) and verifies the correct subset is returned.

**Starting code (add to `ToolRepository`):**

```python
    def search_by_type_and_min_diameter(
        self,
        tool_type: str,
        min_diameter_inches: float,
    ) -> list[dict]:
        rows = self.conn.execute(
            """
            SELECT id, name, diameter_inches, material, tool_type
            FROM tools
            WHERE ???
            ORDER BY diameter_inches DESC
            """,
            ???,
        ).fetchall()
        return [dict(row) for row in rows]
```

**Hints:**

1. Two conditions: `tool_type = ?` AND `diameter_inches >= ?`
2. Two `?` placeholders → two values in the tuple

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```python
    def search_by_type_and_min_diameter(
        self,
        tool_type: str,
        min_diameter_inches: float,
    ) -> list[dict]:
        rows = self.conn.execute(
            """
            SELECT id, name, diameter_inches, material, tool_type
            FROM tools
            WHERE tool_type = ?
              AND diameter_inches >= ?
            ORDER BY diameter_inches DESC
            """,
            (tool_type, min_diameter_inches),
        ).fetchall()
        return [dict(row) for row in rows]
```

Test:

```python
def test_search_by_type_and_min_diameter(tmp_path):
    repo = make_repo(tmp_path)
    repo.insert("EM-0500", 0.500, "carbide", "endmill")
    repo.insert("EM-0375", 0.375, "carbide", "endmill")
    repo.insert("EM-0625", 0.625, "carbide", "endmill")
    repo.insert("DR-0250", 0.250, "carbide", "drill")
    repo.insert("DR-0500", 0.500, "carbide", "drill")

    # endmills with diameter >= 0.5
    results = repo.search_by_type_and_min_diameter("endmill", 0.5)
    assert len(results) == 2
    names = [r["name"] for r in results]
    assert "EM-0500" in names
    assert "EM-0625" in names
    assert "EM-0375" not in names  # 0.375 < 0.5 — excluded

    # drills with diameter >= 0.5 — only DR-0500
    drill_results = repo.search_by_type_and_min_diameter("drill", 0.5)
    assert len(drill_results) == 1
    assert drill_results[0]["name"] == "DR-0500"
```

**Key insight:** The repository method is the only place this SQL lives. The test never writes SQL — it calls the method and asserts on the result. If the column name changes from `diameter_inches` to `diameter_mm`, you change the SQL in one place (`search_by_type_and_min_diameter`) and all callers continue to work. This is the Repository pattern payoff: SQL is centralized, callers are SQL-free.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `ToolRepository` sets `row_factory` once at init | Check `__init__` — `conn.row_factory = sqlite3.Row` is there |
| `insert` returns auto-assigned id | Run `test_insert_returns_id` — id is 1 |
| `get_all` returns all tools as dicts | Run `test_get_all_returns_inserted_tools` — 2 tools, both present |
| `get_by_id` returns correct tool or None | Run `test_get_by_id_returns_correct_tool` and `test_get_by_id_returns_none_for_missing` |
| `search_by_material` uses `?` placeholder | Inspect the method — no f-string, no string concatenation |
| SQL injection is prevented | Run `test_sql_injection_is_prevented` — injected input returns [] and table survives |
| All tests pass | `pytest tests/ -v` — all PASSED |

---

## Quick Check Answers

**1. What is the difference between `conn` and `cursor`?**

`conn` is the connection — it represents the open database file and manages the transaction state. `cursor` is a temporary object that represents one in-progress SQL statement and holds the result set. You call `conn.execute()` to run a statement (which creates and returns a cursor internally). You call `cursor.fetchone()` or `cursor.fetchall()` to retrieve rows. `cursor.lastrowid` gives the id of the last INSERT. The connection outlives any individual query; cursors are created per query and discarded.

**2. The user types `admin' --`. What SQL does the database receive?**

The query becomes `SELECT * FROM users WHERE name = 'admin' --'`. The `--` begins a SQL comment, which causes everything after it to be ignored. The effective query is `SELECT * FROM users WHERE name = 'admin'` — the attacker logs in as `admin` without knowing the password. With `?` parameterization, the entire `admin' --` string is treated as a literal value to search for. The database searches for a user whose name is literally `admin' --` and finds none. No login bypass.

**3. What is the downside of `fetchall()` on 100,000 rows? What do you use instead?**

`fetchall()` loads all 100,000 rows into Python's memory at once as a list. Each row is a tuple or Row object — say 200 bytes per row — that's 20 MB just for this one result set. If multiple queries are running simultaneously, memory usage multiplies. The alternative is cursor iteration: `for row in cursor` fetches one row at a time from SQLite, processes it, and moves on. At any point, only one row is in Python's memory. For the tool database with at most a few thousand rows, `fetchall()` is perfectly fine. The threshold to consider cursor iteration is roughly when results exceed a few megabytes.
