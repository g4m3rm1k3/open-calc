# Lesson 29: A Cursor That Names Its Own Columns

**What you will build** — one real, small, permanent addition:
`Cursor.description`, the real, standard DB-API 2.0 attribute
(PEP 249) `sqlite3`'s own real `Cursor` already has — telling a real
caller what a query's own result columns are actually named, without
that caller already knowing the table it queried.

**What you need to know first:** Lesson 19 (`dbapi.py`'s own
`Cursor`/`Connection`, its own explicit PEP 249 goal), Lesson 22
(`Cursor._execute_select`), Lesson 28 (the identical real shape of
gap — a real, external caller needing one more small, real capability
no earlier lesson needed).

**Terms introduced in this lesson:** None — reusing `dbapi.py`'s own
already-real PEP 249 goal and `pocket-db`'s own already-real `schema`.

**Objects and methods used**
- **`Cursor.description`**
  - *What it is:* the real, standard DB-API 2.0 attribute (PEP 249) —
    after a real `SELECT`, a real sequence of 7-tuples, one per real
    result column; real Python only requires the first element
    (`name`) to be real and meaningful, the rest may be `None`. `None`
    entirely before any real `execute()`, or after a real, non-`SELECT`
    statement.
  - *Implementation:* `self.description = [(name, None, None, None,
    None, None, None) for name in column_names]`.
  - *Its use:* this lesson's own real, entire addition.

---

## Concept Unit: Why This Lesson Exists

### The Problem

`Cursor.fetchall()`/`.fetchone()` (Lesson 19) already return real row
data — real tuples of real values, with no real, attached column
names at all. A real caller who ran `"SELECT * FROM games"` has no
real way to know the first real value in each real tuple is `id`, not
`player` — real `sqlite3` code answers this exact real question with
`cursor.description`; `dbapi.py`'s own `Cursor` never did.

### Introduce the Concept in Isolation

The real data this lesson exposes already exists — proven directly,
reusing `pocket-db`'s own already-real `schema` method. Save this as
`isolation_check.py`:

```python
from pocketdb import Database, INTEGER, TEXT

db = Database("isolation_check.pdb")
db.create_table("games", id=INTEGER, player=TEXT, score=INTEGER)
print("real column names, already available:", db.schema("games"))
db.close()
```

Real output:

```text
real column names, already available: ['id', 'player', 'score']
```

*What this proves:* the real data this lesson needs was never
missing — `Database.schema()` (Lesson 18) has correctly answered "what
are this table's own columns" since it was built. The real gap is only
that `dbapi.py`'s own `Cursor` never attached this already-real answer
to a real query's own result.

### Discard the Throwaway Example

```bash
rm isolation_check.py isolation_check.pdb
```

### Mechanical Walkthrough

- `db.schema("games")` — reappearing shape (Lesson 18) — real, direct
  proof the real column names this lesson needs were already one real
  method call away the whole time.

### CS Lens

This is the identical real shape as Lesson 28's own opening: real data
that already, correctly exists, with one real, small, missing
*connection* between it and a real caller who needs it — not a real,
new capability being invented from nothing.

### SE Lens

Why does `dbapi.py`'s own original design (Lesson 19) never set
`description` in the first place? Because nothing in `dbapi.py`'s own
real, original proof ever needed column *names* separately from
values — real code printing `cur.fetchall()` directly doesn't care
which value is which. A real, external caller building an actual, real
data grid genuinely does.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

The real data was always available. Attaching it to `Cursor` itself,
matching real DB-API 2.0 convention exactly, is next.

---

## Concept Unit: `Cursor.description`

### The Problem

`dbapi.py`'s own `Cursor` has no real, initialized `description`
attribute at all, and `_execute_select` never sets one after a real,
successful query.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `dbapi.py` (modified — `Cursor.description`
  added and set).
- **Change type:** Add.
- **Dependencies:** This lesson's own first unit; Lesson 18's
  `schema`; Lesson 22's `_execute_select`.

### The New Code — `dbapi.py`

```python
class Cursor:
    def __init__(self, connection):
        self._connection = connection
        self._results = []
        self._index = 0
        self.description = None

    def execute(self, sql, params=()):
        sql = sql.strip()
        upper = sql.upper()

        if upper.startswith("SELECT"):
            self._execute_select(sql)
        elif upper.startswith("INSERT"):
            table = sql.split()[2]
            self._connection._db.insert(table, *params)
            self._results = []
            self.description = None
        else:
            raise PocketDBError(f"Unsupported SQL: {sql}")

        self._index = 0
        return self
```

```python
    def _execute_select(self, sql):
        from_idx = _find_keyword(sql, "FROM")
        where_idx = _find_keyword(sql, "WHERE")
        order_idx = _find_keyword(sql, "ORDER BY")
        limit_idx = _find_keyword(sql, "LIMIT")

        table_end = _end_of_clause(sql, where_idx, order_idx, limit_idx)
        table = sql[from_idx + 4:table_end].strip()

        column_names = self._connection._db.schema(table)
        self.description = [(name, None, None, None, None, None, None) for name in column_names]

        records = self._connection._db.query(table)
        # ... unchanged real filtering/ordering/limiting logic follows
```

Rebuilt (no C++ change — pure Python), proven for real:

```python
from pocketdb import Database, INTEGER, TEXT
import dbapi

db = Database("l29test.pdb")
db.create_table("games", id=INTEGER, player=TEXT, score=INTEGER)
db.insert("games", 1, "Alice", 100)
db.insert("games", 2, "Bob", 85)
db.close()

conn = dbapi.connect("l29test.pdb")
cur = conn.cursor()
print("description before execute:", cur.description)

cur.execute("SELECT * FROM games WHERE score > 80")
print("description after SELECT:", cur.description)
print("column names:", [d[0] for d in cur.description])
print("rows:", cur.fetchall())

cur.execute("INSERT INTO games VALUES (?, ?, ?)", (3, "Carol", 92))
print("description after INSERT:", cur.description)
conn.close()
```

Real output:

```text
description before execute: None
description after SELECT: [('id', None, None, None, None, None, None), ('player', None, None, None, None, None, None), ('score', None, None, None, None, None, None)]
column names: ['id', 'player', 'score']
rows: [('1', "'Alice'", '100'), ('2', "'Bob'", '85')]
description after INSERT: None
```

### Discard the Throwaway Example

```bash
rm l29test.pdb
```

The real change to `dbapi.py` is kept — permanent project code.

### Mechanical Walkthrough

- `self.description = None` in `__init__` — matches real, standard
  `sqlite3` behavior exactly: `None` before any real query has run at
  all.
- `[(name, None, None, None, None, None, None) for name in
  column_names]` — a real list comprehension (Lesson 22) — real PEP
  249 only requires index `0` (`name`) of each real 7-tuple to be
  meaningful; this project has no real use for type codes, display
  sizes, or the rest, so they're honestly `None`, not invented.
- `self.description = None` again, inside the real `INSERT` branch —
  matches real `sqlite3`: a statement with no real result set has no
  real, meaningful description either.

### CS Lens

Setting `description` from the identical real `table` variable
`_execute_select` already computes for its own real `WHERE`/
`ORDER BY` parsing is a real, small instance of **not duplicating
already-derived information** — the real table name is parsed once,
used for every real, dependent piece of information that follows.

### SE Lens

Why real-match `sqlite3`'s own exact, real 7-tuple shape, rather than
a real, simpler `[name1, name2, ...]` list of plain strings? Because
`dbapi.py`'s own entire, real, stated purpose (Lesson 19) is being "a
real, if partial, drop-in" for real `sqlite3`-shaped code — real code
written against real `sqlite3.Cursor.description` already expects
`description[i][0]` for a name, not `description[i]` directly;
matching the real, exact shape is what makes the real, existing
promise actually true, not approximately true.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The New Code."

### Connection

`dbapi.py`'s own real `Cursor` now answers the one, real, standard
DB-API 2.0 question it was missing — matching its own, already-stated
goal from Lesson 19 a real step further.

---

## Closing

### Connect the Pieces

This lesson's first unit proved the real data it needed —
`pocket-db`'s own already-real `schema` method — was never missing,
only never connected to `Cursor`'s own real, public result. The second
unit connected it, matching real, standard DB-API 2.0 convention
(PEP 249) exactly: `None` before any query, real 7-tuples after a real
`SELECT`, `None` again after a real, non-`SELECT` statement — a real,
small, honest completion of `dbapi.py`'s own real, already-stated goal.

### What Breaks Without This

Remove the `self.description = None` line from `Cursor.__init__`,
rebuild nothing (pure Python), and access `cursor.description` on a
real, freshly-created `Cursor` before ever calling `execute()`. The
real, resulting `AttributeError` (`'Cursor' object has no attribute
'description'`) is a real, worse failure than a real, correct `None`
— real code checking `if cursor.description is not None:` (a real,
standard, defensive DB-API pattern) would itself crash, rather than
correctly branching. Restore the line and confirm real, correct `None`
returns instead.

### Exercises

- Write a real, small function `rows_as_dicts(cursor)` using
  `cursor.description` and `cursor.fetchall()` together to return a
  real list of real, plain dictionaries (`{"id": "1", "player":
  "'Alice'", ...}`) instead of real, unlabeled tuples.
- `description`'s own real 7-tuple carries six `None` placeholders
  this project never populates. Pick one real, plausible use (real
  type information, distinguishing `INTEGER` from `TEXT`) and explain
  what real, additional information `_execute_select` would need to
  fill it in correctly.

### Definition of Done

- [ ] `Cursor.description` exists as real, permanent code, matching
      real DB-API 2.0 (PEP 249) convention.
- [ ] You confirmed `description` is `None` before any query, a real,
      correct list of 7-tuples after a `SELECT`, and `None` again
      after an `INSERT`.
- [ ] You caused the real `AttributeError` failure yourself (removing
      the `__init__` default) and confirmed restoring it fixes it.
- [ ] You can explain, from memory, why this lesson matches `sqlite3`'s
      own exact 7-tuple shape instead of a simpler list of strings —
      referencing this lesson's own SE Lens.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add Cursor.description for real DB-API 2.0 compatibility"`.
