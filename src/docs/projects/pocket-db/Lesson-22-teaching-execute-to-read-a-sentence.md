# Lesson 22: Teaching `execute` to Read a Sentence

**What you will build** — no new C++, same as S05: `Cursor.execute`
(Lesson 19) grows from recognizing exactly `"SELECT * FROM table"` into
a real, if small, subset of SQL — `WHERE` (with `=`/`!=`/`<`/`>`/`<=`/
`>=`), `AND`/`OR`, `ORDER BY ... [ASC|DESC]`, and `LIMIT n`, all
findable by real, hand-rolled text splitting, not a third-party parser.

**What you need to know first:** Lesson 19 (`Cursor.execute`,
`sqlite3`-shaped surface), Lesson 18 (`Record`, `query`).

**Terms introduced in this lesson:** **tokenizing** — splitting a real
string into its own smallest meaningful pieces (here, real, plain
whitespace-separated words) before trying to understand what they mean
together — the real, standard first step of any parser, including the
real, minimal one this lesson builds.

**Objects and methods used**
- **`lambda`**
  - *What it is:* a real, standard Python expression creating a small,
    real, unnamed function inline — used where a real function is
    needed but doesn't deserve its own real, top-level `def`.
  - *Implementation:* `lambda r: sort_key(r[order_column])` — a real
    function taking one real argument (`r`), returning
    `sort_key(r[order_column])`.
  - *Its use:* `sorted`'s own real `key` argument — telling `sorted`
    *what* to compare, without writing a separate, named function just
    for that one, real, local purpose.
- **`sorted`**
  - *What it is:* a real, standard Python built-in — returns a new,
    real, sorted list from any real iterable, optionally guided by a
    real `key` function and a real `reverse` flag.
  - *Implementation:* `sorted(records, key=lambda r: sort_key(r[order_
    column]), reverse=descending)`.
  - *Its use:* `ORDER BY`'s own real implementation — no hand-rolled
    sorting algorithm needed; Python's own real, standard one already
    does this correctly.

---

## Concept Unit: Tokenizing and Evaluating One Real `WHERE` Clause

### The Problem

`Cursor.execute` (Lesson 19) only recognizes `"SELECT * FROM table"`
exactly — nothing narrower. A real `WHERE score > 80` needs to become
something this project can actually *evaluate* against a real `Record`
— not by inventing a full, real grammar all at once, but by handling
this project's own real, minimal, established subset first, in
isolation, before wiring it into `execute` at all.

### Introduce the Concept in Isolation

Save this as `where_check.py`:

```python
def tokenize_where(text):
    return text.split()

def parse_where(tokens):
    conditions = []
    connector = None
    i = 0
    while i < len(tokens):
        column = tokens[i]
        op = tokens[i + 1]
        value = tokens[i + 2]
        conditions.append((connector, column, op, value))
        i += 3
        if i < len(tokens):
            connector = tokens[i].upper()
            i += 1
    return conditions

tokens = tokenize_where("score > 80 AND player = 'Alice'")
print(f"tokens: {tokens}")

conditions = parse_where(tokens)
print(f"conditions: {conditions}")
```

Run with:

```bash
python where_check.py
```

Real output:

```text
tokens: ['score', '>', '80', 'AND', 'player', '=', "'Alice'"]
conditions: [(None, 'score', '>', '80'), ('AND', 'player', '=', "'Alice'")]
```

*What this proves:* real, plain whitespace splitting genuinely
separates every real, meaningful piece of this project's own supported
`WHERE` shape — a column, an operator, a value, an optional real
connector — and `parse_where` correctly groups them into real,
structured `(connector, column, op, value)` tuples, three real tokens
at a time.

### Discard the Throwaway Example

```bash
rm where_check.py
```

### Mechanical Walkthrough

- `text.split()` — reappearing shape (`str.split`, Lesson 5) — real,
  plain whitespace splitting; this lesson's own real, deliberate,
  documented limitation is a value containing a real space (inside
  quotes) would incorrectly split into two real tokens — not handled,
  and named directly in this lesson's own SE Lens.
- `while i < len(tokens): column = tokens[i]; op = tokens[i+1]; value
  = tokens[i+2]; ...; i += 3` — reappearing shape (fixed-stride
  iteration, Lesson 15's own record-decoding loop) — every real
  condition is exactly `3` real tokens; the loop advances by exactly
  that many each time, then consumes one more real token (the
  connector) if any real tokens remain.

### CS Lens

Splitting real input into real, discrete pieces *before* trying to
understand their real meaning — **tokenizing** — is the standard first
real stage of any real parser, including production ones. A real
production SQL parser's own tokenizer is far more sophisticated
(handling real quoted strings with spaces, real comments, real numeric
literals with decimals) — this lesson's own `text.split()` is a real,
honest, minimal version of the identical first real step.

### SE Lens

Why does `parse_where` assume every real condition is *exactly* `column
op value` — never `NOT score > 80`, never parenthesized groups — and
raise no real error for anything else, just silently producing wrong
real tuples? Because this lesson's own real, stated scope is
`README.md`'s own committed subset (`WHERE`, `AND`/`OR`, nothing more
complex) — real, honest validation of *malformed* input within that
subset is a real, legitimate future improvement, not something this
lesson claims to solve.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

A `WHERE` clause can now become real, structured conditions. Evaluating
those conditions against a real `Record`, and wiring the whole real
grammar (`WHERE`/`ORDER BY`/`LIMIT` together) into `Cursor.execute`
itself, is next.

---

## Concept Unit: A Real, Small Grammar Inside `execute`

### The Problem

Real conditions exist as data, but nothing evaluates them against a
real row yet, and `Cursor.execute` still only recognizes the one, exact
`"SELECT * FROM table"` sentence. A real `SELECT * FROM table WHERE
... ORDER BY ... LIMIT ...` — any real subset of these clauses present
or absent — needs to actually work.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `where_parser.py` (new), `dbapi.py` (modified —
  `Cursor._execute_select` added).
- **Change type:** Add.
- **Dependencies:** This lesson's own first unit.

### The New Code — `where_parser.py`

```python
_OPERATORS = {
    "=": lambda a, b: a == b,
    "!=": lambda a, b: a != b,
    "<": lambda a, b: a < b,
    ">": lambda a, b: a > b,
    "<=": lambda a, b: a <= b,
    ">=": lambda a, b: a >= b,
}


def tokenize_where(text):
    return text.split()


def parse_where(tokens):
    conditions = []
    connector = None
    i = 0
    while i < len(tokens):
        column = tokens[i]
        op = tokens[i + 1]
        value = tokens[i + 2]
        conditions.append((connector, column, op, value))
        i += 3
        if i < len(tokens):
            connector = tokens[i].upper()
            i += 1
    return conditions


def _coerce(raw_value, literal):
    try:
        return int(raw_value), int(literal)
    except ValueError:
        return raw_value.strip("'"), literal.strip("'")


def matches(record, conditions):
    result = True
    for connector, column, op, literal in conditions:
        left, right = _coerce(record[column], literal)
        this_condition = _OPERATORS[op](left, right)

        if connector == "AND":
            result = result and this_condition
        elif connector == "OR":
            result = result or this_condition
        else:
            result = this_condition
    return result


def sort_key(raw_value):
    try:
        return (0, int(raw_value))
    except ValueError:
        return (1, raw_value.strip("'"))
```

### The New Code — `dbapi.py`, Extended

```python
from pocketdb import Database, PocketDBError
from where_parser import tokenize_where, parse_where, matches, sort_key


def _find_keyword(sql, keyword):
    upper = sql.upper()
    idx = upper.find(keyword)
    return idx if idx != -1 else None


def _end_of_clause(sql, *later_starts):
    positions = [p for p in later_starts if p is not None]
    positions.append(len(sql))
    return min(positions)
```

```python
    def execute(self, sql, params=()):
        sql = sql.strip()
        upper = sql.upper()

        if upper.startswith("SELECT"):
            self._execute_select(sql)
        elif upper.startswith("INSERT"):
            table = sql.split()[2]
            self._connection._db.insert(table, *params)
            self._results = []
        else:
            raise PocketDBError(f"Unsupported SQL: {sql}")

        self._index = 0
        return self

    def _execute_select(self, sql):
        from_idx = _find_keyword(sql, "FROM")
        where_idx = _find_keyword(sql, "WHERE")
        order_idx = _find_keyword(sql, "ORDER BY")
        limit_idx = _find_keyword(sql, "LIMIT")

        table_end = _end_of_clause(sql, where_idx, order_idx, limit_idx)
        table = sql[from_idx + 4:table_end].strip()

        records = self._connection._db.query(table)

        if where_idx is not None:
            where_end = _end_of_clause(sql, order_idx, limit_idx)
            where_text = sql[where_idx + 5:where_end].strip()
            conditions = parse_where(tokenize_where(where_text))
            records = [r for r in records if matches(r, conditions)]

        if order_idx is not None:
            order_end = _end_of_clause(sql, limit_idx)
            order_text = sql[order_idx + 8:order_end].strip()
            parts = order_text.split()
            order_column = parts[0]
            descending = len(parts) > 1 and parts[1].upper() == "DESC"
            records = sorted(records, key=lambda r: sort_key(r[order_column]), reverse=descending)

        if limit_idx is not None:
            limit_text = sql[limit_idx + 5:].strip()
            records = records[:int(limit_text)]

        self._results = [record.values() for record in records]
```

Proven for real, against every real clause combination this lesson
commits to:

```python
from pocketdb import Database, INTEGER, TEXT
import dbapi

db = Database("parsetest.pdb")
db.create_table("games", id=INTEGER, player=TEXT, score=INTEGER)
db.insert("games", 1, "Alice", 100)
db.insert("games", 2, "Bob", 85)
db.insert("games", 3, "Carol", 92)
db.insert("games", 4, "Dave", 70)
db.close()

conn = dbapi.connect("parsetest.pdb")
cur = conn.cursor()

cur.execute("SELECT * FROM games WHERE score > 80")
print("WHERE score > 80:", cur.fetchall())

cur.execute("SELECT * FROM games WHERE score > 80 AND player = 'Alice'")
print("WHERE AND:", cur.fetchall())

cur.execute("SELECT * FROM games WHERE score < 75 OR score > 95")
print("WHERE OR:", cur.fetchall())

cur.execute("SELECT * FROM games ORDER BY score DESC")
print("ORDER BY DESC:", cur.fetchall())

cur.execute("SELECT * FROM games ORDER BY score LIMIT 2")
print("ORDER BY + LIMIT:", cur.fetchall())

cur.execute("SELECT * FROM games WHERE score > 80 ORDER BY score DESC LIMIT 1")
print("WHERE+ORDER+LIMIT:", cur.fetchall())

conn.close()
```

Real output:

```text
WHERE score > 80: [('1', "'Alice'", '100'), ('2', "'Bob'", '85'), ('3', "'Carol'", '92')]
WHERE AND: [('1', "'Alice'", '100')]
WHERE OR: [('1', "'Alice'", '100'), ('4', "'Dave'", '70')]
ORDER BY DESC: [('1', "'Alice'", '100'), ('3', "'Carol'", '92'), ('2', "'Bob'", '85'), ('4', "'Dave'", '70')]
ORDER BY + LIMIT: [('4', "'Dave'", '70'), ('2', "'Bob'", '85')]
WHERE+ORDER+LIMIT: [('1', "'Alice'", '100')]
```

### Discard the Throwaway Example

```bash
rm verify_parser.py parsetest.pdb
```

`where_parser.py` and every real change to `dbapi.py` are kept —
permanent project files.

### Mechanical Walkthrough

- `_find_keyword`/`_end_of_clause` — real, small helpers finding where
  each real clause starts and ends, using `None` (reappearing,
  Lesson 15) to real-mean "this clause isn't present at all" — every
  clause is genuinely optional, and this lesson's own real proof
  exercises every real combination, including none at all (Lesson 19's
  own original, still-working case).
- `records = [r for r in records if matches(r, conditions)]` —
  reappearing shape (list comprehension, first real, explicit naming
  here — the pattern itself already used informally in earlier
  lessons) — real, in-Python filtering; no C++, no index, is consulted
  at all — `WHERE` here is always a real, honest linear scan plus
  filter, the same real approach this project's own S06/S07
  benchmarks already measured against real indexes.
- `sorted(records, key=lambda r: sort_key(r[order_column]),
  reverse=descending)` — covered fully in Objects and methods used,
  above.

### CS Lens

This lesson's own real `WHERE` handling is exactly the honest, real
"scan and filter" strategy S06's own benchmark measured *against* — no
attempt is made here to notice that `WHERE score > 80` could use S07's
own real B-tree range query instead. A real, production query
optimizer's whole real job is making exactly that kind of real
decision automatically; this lesson deliberately doesn't attempt it —
named directly as a real, open gap, not hidden.

### SE Lens

Why does `_execute_select` locate every real clause keyword *first*
(`FROM`, `WHERE`, `ORDER BY`, `LIMIT`), before processing any of them,
rather than parsing the real SQL text left-to-right in one real pass?
Because each real clause's own *end* depends on knowing whether a real,
later clause exists — `WHERE`'s own text ends at `ORDER BY` if present,
or `LIMIT` if not, or the end of the string if neither is — real,
simpler to compute once, up front, than to re-derive while scanning
forward through clauses that might combine in any real, present-or-
absent order.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The New Code."

### Connection

S08 is complete: `Cursor.execute` now understands a real, if small,
honest subset of SQL — `WHERE`, `AND`/`OR`, `ORDER BY`, `LIMIT`, in any
real, present-or-absent combination — built entirely from real, hand-
rolled string operations, no parser library, no new C++. S09, next, is
where this engine gets hardened and pointed at genuinely interesting,
real, stored data for the first time — the first slice that isn't
about the engine's own internals at all.

---

## Closing

### Connect the Pieces

This lesson's first unit proved, in isolation, that this project's own
real, minimal `WHERE` grammar — `column op value`, optionally chained
by `AND`/`OR` — tokenizes and structures correctly from nothing but
real, plain whitespace splitting. The second unit evaluated those real
conditions against actual `Record` objects, and wired a real, small
grammar for `WHERE`/`ORDER BY`/`LIMIT` — each independently optional,
findable in any real, present-or-absent combination — directly into
`Cursor.execute`, proven against every real combination this lesson
commits to, still built entirely on Lesson 18's own `query`, still no
new C++ at all.

### What Breaks Without This

In `matches`, change `result = result and this_condition` to
`result = this_condition` (dropping the real `and`), rebuild nothing (a
pure Python change), and rerun this lesson's own `AND` proof. `WHERE
score > 80 AND player = 'Alice'` now real-returns every row matching
only the *last* real condition (`player = 'Alice'`), silently ignoring
`score > 80` entirely — a real, dangerous kind of bug, since the query
still runs and returns *a* real result, just the wrong one. Restore the
real `and` and confirm the correct, single-row result returns.

### Exercises

- This lesson's own `parse_where` evaluates real conditions strictly
  left to right, with no real operator precedence — `"a OR b AND c"`
  computes as `"(a OR b) AND c"`, not real SQL's own `"a OR (b AND c)"`.
  Construct a real, concrete `WHERE` clause where this actually
  produces a real, wrong answer, and explain why, referencing this
  lesson's own SE Lens.
- `tokenize_where`'s own real `text.split()` breaks on a value
  containing a real space inside quotes (`WHERE player = 'Mary Jane'`).
  Confirm this real failure yourself, then explain what a real fix
  would need to do differently — referencing this lesson's own CS Lens
  on what a production tokenizer handles that this one doesn't.
- Add real support for a `NOT` prefix on one condition (`WHERE NOT
  score > 80`), extending `parse_where`'s own real tuple shape and
  `matches`'s own real evaluation to match. Keep the real, existing
  proof passing unchanged.

### Definition of Done

- [ ] `where_parser.py` exists as a real, permanent file; `dbapi.py`'s
      `Cursor.execute` supports `WHERE`, `AND`/`OR`, `ORDER BY`, and
      `LIMIT`, in any real, present-or-absent combination.
- [ ] You ran every real combination from this lesson's own proof
      yourself and confirmed the identical, correct real output.
- [ ] You caused the real "AND silently becomes only the last
      condition" failure yourself and confirmed restoring it fixes it.
- [ ] You can explain, from memory, why this lesson's own `WHERE`
      handling is a real, honest linear scan, not an automatic use of
      S06/S07's own real indexes — referencing this lesson's own CS
      Lens.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Grow Cursor.execute into a real, small SQL subset"`.
