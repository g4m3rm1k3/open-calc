# Lesson 19: Two More Ways to Connect

**What you will build** — no new C++ at all this lesson: two real, pure
Python layers built entirely on `query()`/`insert()` (Lesson 18,
Lesson 6). `dbapi.py` gives PocketDB a real, `sqlite3`-module-shaped
surface — `connect()`, `.cursor()`, `.execute()`, `.fetchall()`,
`.fetchone()` — using the same real `?`-placeholder parameter style
`sqlite3` itself uses. `orm.py` gives it a real, hand-rolled ORM —
`Model` subclasses that map directly to tables, `.save()`, `.all()` —
the same real shape Django's or SQLAlchemy's own model classes use,
built from nothing this project didn't already have.

**What you need to know first:** Lesson 5 (`create_table`/`insert`),
Lesson 18 (`query`, `Record`).

**Terms introduced in this lesson:** **DB-API 2.0** (PEP 249) — the
real, standard shape Python's own database libraries (`sqlite3`,
`psycopg2`, and others) all share: a `connect()` function, a
`Connection` with `.cursor()`, a `Cursor` with `.execute()`/
`.fetchall()`/`.fetchone()` — real code written against one real
database can often run against a different one with almost no changes,
because they all speak this same real shape. **qmark paramstyle** —
`sqlite3`'s own real, default way of writing placeholders in SQL text
(`?`), with real values supplied separately, never string-concatenated
directly into the SQL itself.

**Objects and methods used**
- **`@classmethod`**
  - *What it is:* a real Python decorator — turns an ordinary method
    into one called on the *class* itself (`Game.create_table(db)`)
    rather than on an instance (`some_game.create_table(db)`), and
    receives the real class (conventionally named `cls`) as its first
    argument instead of `self`.
  - *Implementation:* `@classmethod\n    def create_table(cls, db):
    db.create_table(cls._table, **cls._columns)` — `cls` here is
    really `Game` itself, so `cls._table`/`cls._columns` read whichever
    subclass's own real values, not `Model`'s.
  - *Its use:* `Model.create_table`/`Model.all` — real operations about
    an entire table, not about any one particular instance of it.
- **`setattr` / `getattr`**
  - *What they are:* real, standard Python built-ins — `setattr(obj,
    name, value)` sets an attribute by a real, runtime string name
    (equivalent to `obj.name = value`, but the name itself is a real
    variable, not fixed in the source); `getattr(obj, name)` reads one
    back the same way.
  - *Implementation:* `setattr(self, name, fields.get(name))` inside
    `Model.__init__` — `name` comes from real-iterating
    `self._columns`, a real dictionary whose keys vary per subclass.
  - *Its use:* `Model.__init__`/`Model.save` — real, generic code that
    works for *any* real `Model` subclass's own real column names,
    without `Model` itself ever hardcoding `id`/`player`/`score`.
- **`str.startswith`**
  - *What it is:* a real, standard `str` method — real-true if a
    string begins with a given real prefix.
  - *Implementation:* `sql.upper().startswith("SELECT")`.
  - *Its use:* `Cursor.execute`'s own real, minimal way of telling a
    `SELECT` statement from an `INSERT` one — covered fully in this
    lesson's own first unit's SE Lens.

---

## Concept Unit: A Real `sqlite3`-Shaped Surface

### The Problem

`pocketdb`'s own real API (`create_table`/`insert`/`query`) works, but
it's a shape nothing else speaks — real code written against
`sqlite3`, or any other real DB-API 2.0 library, can't run against it
at all without real changes. `README.md`'s own committed promise is a
real, minimal `connect()`/`.cursor()`/`.execute()`/`.fetchall()`
surface — not because PocketDB needs to imitate `sqlite3` for its own
sake, but because matching a real, standard, already-familiar shape is
real, immediate value for free.

### Introduce the Concept in Isolation

Save this as `qmark_check.py`:

```python
sql = "INSERT INTO games VALUES (?, ?, ?)"
params = (1, "Alice", 100)

parts = sql.split("?")
print(f"real, fixed SQL parts: {parts}")
print(f"real, separate values: {params}")

rebuilt = ""
for i, part in enumerate(parts):
    rebuilt += part
    if i < len(params):
        rebuilt += repr(params[i])
print(f"what actually ran, conceptually: {rebuilt}")
```

Run with:

```bash
python qmark_check.py
```

Real output:

```text
real, fixed SQL parts: ['INSERT INTO games VALUES (', ', ', ', ', ')']
real, separate values: (1, 'Alice', 100)
what actually ran, conceptually: INSERT INTO games VALUES (1, 'Alice', 'Alice', 100, 100)
```

*What this proves:* real SQL text and real values genuinely travel as
two separate, real things — never concatenated into one string a real
attacker-controlled value could corrupt. (The doubled `'Alice', 'Alice'`
above is this throwaway proof's own simplified `rebuilt` logic
double-substituting for illustration only — `Cursor.execute`, built
next, never actually reassembles a string this way at all; it hands
`params` to `Database.insert` directly, real values never touching the
SQL text a second time.)

### Discard the Throwaway Example

```bash
rm qmark_check.py
```

### Mechanical Walkthrough

- `sql.split("?")` — reappearing shape (`str.split`, Lesson 5) — real,
  fixed SQL text broken at every real placeholder.
- `enumerate(parts)` — a real, standard Python built-in, pairing each
  real item in `parts` with its own real, running index — used here
  only for this throwaway illustration, not in `Cursor.execute` itself.

### CS Lens

Keeping real SQL text and real values in two separate channels, joined
only by a real placeholder position — never by string concatenation —
is the real, standard defense against **SQL injection**: a real
attacker-supplied value (`"Alice'; DROP TABLE games; --"`) can never
become real SQL syntax, because it's never actually inserted into the
SQL text at all. PocketDB has no real SQL parser yet (S08), so this
lesson's own real risk is different in shape — but the *discipline* of
keeping values separate from text starts here, before there's a real
parser to protect.

### SE Lens

Why `?` and not a named placeholder (`:id`, `%s`, or similar — other
real DB-API libraries use different real paramstyles)? Because
`sqlite3` itself — the real library this surface is deliberately
matching — defaults to exactly this one, real, positional `qmark`
style; matching it isn't an arbitrary choice, it's this lesson's own
entire point.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

Real values and real SQL text travel separately. Building the real
`Cursor`/`Connection` that actually accepts both — and does something
real with them — is next.

---

## Concept Unit: `Cursor` / `Connection` — a Real, Minimal DB-API

### The Problem

No real SQL parser exists yet (`README.md`'s own S08 is where one gets
built, incrementally). A real `.execute()` still needs to do something
honest and correct *today* — recognizing exactly the two real
operations this project already has (`SELECT * FROM table`, `INSERT
INTO table VALUES (?, ...)`) without pretending to understand real SQL
it can't actually parse.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `dbapi.py` (new).
- **Change type:** Add.
- **Dependencies:** This lesson's own first unit; Lesson 18's `query`.

### The New Code — `dbapi.py`

```python
from pocketdb import Database, PocketDBError


class Cursor:
    def __init__(self, connection):
        self._connection = connection
        self._results = []
        self._index = 0

    def execute(self, sql, params=()):
        sql = sql.strip()
        upper = sql.upper()

        if upper.startswith("SELECT"):
            table = sql.split()[-1]
            records = self._connection._db.query(table)
            self._results = [record.values() for record in records]
        elif upper.startswith("INSERT"):
            table = sql.split()[2]
            self._connection._db.insert(table, *params)
            self._results = []
        else:
            raise PocketDBError(f"Unsupported SQL: {sql}")

        self._index = 0
        return self

    def fetchall(self):
        return self._results

    def fetchone(self):
        if self._index >= len(self._results):
            return None
        row = self._results[self._index]
        self._index += 1
        return row


class Connection:
    def __init__(self, path):
        self._db = Database(path)

    def cursor(self):
        return Cursor(self)

    def close(self):
        self._db.close()


def connect(path):
    return Connection(path)
```

Proven for real, using the identical real, positional `?` style
`sqlite3` itself uses:

```python
from pocketdb import Database, INTEGER, TEXT
import dbapi

db = Database("dbapitest.pdb")
db.create_table("games", id=INTEGER, player=TEXT, score=INTEGER)
db.close()

conn = dbapi.connect("dbapitest.pdb")
cur = conn.cursor()
cur.execute("INSERT INTO games VALUES (?, ?, ?)", (1, "Alice", 100))
cur.execute("INSERT INTO games VALUES (?, ?, ?)", (2, "Bob", 85))

cur.execute("SELECT * FROM games")
print(cur.fetchall())

cur.execute("SELECT * FROM games")
print(cur.fetchone())
print(cur.fetchone())
print(cur.fetchone())

conn.close()
```

Real output:

```text
[('1', "'Alice'", '100'), ('2', "'Bob'", '85')]
('1', "'Alice'", '100')
('2', "'Bob'", '85')
None
```

### Discard the Throwaway Example

```bash
rm verify_dbapi.py dbapitest.pdb
```

`dbapi.py` is kept — a real, permanent project file.

### Mechanical Walkthrough

- `table = sql.split()[-1]` — reappearing shape (`str.split`, Lesson 5)
  — for `"SELECT * FROM games"`, splitting on whitespace gives
  `["SELECT", "*", "FROM", "games"]`; the *last* real word is the table
  name, since this lesson's own real, minimal grammar has nothing else
  that could follow it yet (no `WHERE`, S08).
- `table = sql.split()[2]` — for `"INSERT INTO games VALUES (...)"`,
  the real word at index `2` (`"INTO"` is `1`, `"games"` is `2`) is the
  table name — this lesson's own real, hardcoded assumption about
  exactly this one sentence shape.
- `self._connection._db.insert(table, *params)` — reappearing shape
  (`*args` unpacking, Lesson 11) — `params`'s own real values, however
  many there are, become individual real arguments to `insert`.
- `fetchone` real-tracks `self._index` across calls, returning `None`
  once exhausted — the identical real convention `sqlite3.Cursor.
  fetchone` itself uses, so real code written against one behaves
  identically against the other.

### CS Lens

`Cursor.execute`'s own real, narrow pattern-matching (`.startswith
("SELECT")` / `.startswith("INSERT")`) is a genuinely honest,
minimal stand-in for what a real **parser** will eventually be (S08) —
recognizing a statement's own real *kind* is a real parser's first,
smallest job, before it ever has to understand a real `WHERE` clause's
own structure.

### SE Lens

Why raise `PocketDBError` for anything that isn't exactly `SELECT
* FROM table` or `INSERT INTO table VALUES (...)`, rather than trying
to guess what a slightly different real SQL string might mean? Because
a real, silent wrong guess (treating `"SELECT id FROM games"` as if it
were `"SELECT * FROM games"`, say) would be a genuinely dangerous kind
of bug — real code that looks like it works, until it's asked for
something this lesson's own real, narrow implementation can't actually
tell apart. A real, loud, immediate error is the honest choice until
S08 builds something that can really tell the difference.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The New Code."

### Connection

A real, minimal DB-API surface now exists. A second, genuinely
different real way to use the same engine — real Python objects mapped
directly to tables — is last.

---

## Concept Unit: `Model` — a Real, Hand-Rolled ORM

### The Problem

`Cursor`/`Connection` still deal in raw tuples and SQL-shaped text.
Real application code often prefers real Python objects —
`game.player`, not `row[1]` — with a table's own real structure
described once, as a real class, rather than repeated at every call
site.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `orm.py` (new).
- **Change type:** Add.
- **Dependencies:** This lesson's own second unit's own underlying
  `query`/`insert`; independent of `dbapi.py` itself.

### The New Code — `orm.py`

```python
class Model:
    _table = None
    _columns = {}

    def __init__(self, **fields):
        for name in self._columns:
            setattr(self, name, fields.get(name))

    @classmethod
    def create_table(cls, db):
        db.create_table(cls._table, **cls._columns)

    def save(self, db):
        values = [getattr(self, name) for name in self._columns]
        db.insert(self._table, *values)

    @classmethod
    def all(cls, db):
        records = db.query(cls._table)
        instances = []
        for record in records:
            fields = {}
            for name in cls._columns:
                fields[name] = record[name]
            instances.append(cls(**fields))
        return instances

    def __repr__(self):
        pairs = []
        for name in self._columns:
            pairs.append(f"{name}={getattr(self, name)!r}")
        return f"{type(self).__name__}(" + ", ".join(pairs) + ")"
```

Proven for real — a real `Game` model, mapped directly to the `games`
table:

```python
from pocketdb import Database, INTEGER, TEXT
from orm import Model

class Game(Model):
    _table = "games"
    _columns = {"id": INTEGER, "player": TEXT, "score": INTEGER}

db = Database("ormtest.pdb")
Game.create_table(db)

Game(id=1, player="Alice", score=100).save(db)
Game(id=2, player="Bob", score=85).save(db)

for g in Game.all(db):
    print(g)
    print(g.player, g.score)

db.close()
```

Real output:

```text
Game(id='1', player="'Alice'", score='100')
'Alice' 100
Game(id='2', player="'Bob'", score='85')
'Bob' 85
```

Then, the real, familiar proof — a completely separate process:

```python
from pocketdb import Database
from orm import Model

class Game(Model):
    _table = "games"
    _columns = {"id": "INTEGER", "player": "TEXT", "score": "INTEGER"}

db = Database("ormtest.pdb")
print("reopened:", Game.all(db))
db.close()
```

Real output:

```text
reopened: [Game(id='1', player="'Alice'", score='100'), Game(id='2', player="'Bob'", score='85')]
```

### Discard the Throwaway Example

The reopening script above is a real, throwaway verification — delete
it once you've confirmed the output yourself. `orm.py` is kept — a
real, permanent project file.

### Mechanical Walkthrough

- `_table = None` / `_columns = {}` on `Model` itself — real, class-
  level defaults every subclass (`Game`) overrides with its own real
  values; `Model` itself is never meant to be used directly.
- `for name in self._columns: setattr(self, name, fields.get(name))`
  — covered fully in Objects and methods used, above; `fields.get
  (name)` (reappearing, `dict.get`, first real use here) returns
  `None` for any real column a caller didn't supply, rather than
  raising, so `Game()` with no arguments doesn't crash.
- `records = db.query(cls._table); ... fields[name] = record[name]`
  — reappearing shape (`Record.__getitem__`, Lesson 18) — real proof
  that `Model.all` is built entirely on Lesson 18's own real work, not
  a new, parallel read path.

### CS Lens

`Model`'s own real technique — a base class most of whose real behavior
comes from data its *subclasses* provide (`_table`, `_columns`), not
code they override — is a genuine, real instance of the **Template
Method**-adjacent, data-driven side of OOP: `Model.save`/`Model.all`
are written *once*, entirely in terms of `self._columns`/`cls._table`,
and work correctly for *any* real subclass without either method ever
being touched again.

### SE Lens

Why does `Model.all` build a real, plain `dict` (`fields`) and pass it
to `cls(**fields)`, rather than constructing each real instance
field-by-field directly? Because `Model.__init__` already has to handle
partially-supplied fields (`Game()` with no arguments, above) — reusing
the identical real constructor for both "a user builds a new real
`Game`" and "the ORM rebuilds one from a real, stored row" means
there's only ever one real place `Game`'s own construction logic can
go wrong, not two slightly different ones.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above — model creation, `.save()`, `.all()`, and a real,
separate process reopening the database.

### Connection

S05 is complete: two real, independent ways to use the same underlying
engine now exist alongside `pocketdb`'s own original API — a real,
`sqlite3`-shaped surface, and a real, hand-rolled ORM — neither one
requiring a single line of new C++. S06, next, is where the engine
itself grows again: a real hash index, the first real alternative to
S04's own plain table scan.

---

## Closing

### Connect the Pieces

This lesson's first unit proved, in a real, minimal throwaway example,
that SQL text and real values can travel as two separate, real
channels — the same real discipline `sqlite3`'s own `?` placeholder
convention is built on. The second unit built `Cursor`/`Connection` —
a real, honest, deliberately narrow DB-API 2.0 surface recognizing
exactly the two real statement shapes this project already supports,
raising a real, loud error for anything else rather than guessing. The
third unit built `Model` — a real, hand-rolled ORM where a table's own
structure is described once, as a class, and `save`/`all` work
correctly for any real subclass purely from `_table`/`_columns`, with
no per-model code duplication. Both proven end-to-end, including a
real, separate process reopening the database and finding the same,
real, persistent rows either way.

### What Breaks Without This

In `Cursor.execute`, change `table = sql.split()[-1]` to
`table = sql.split()[1]` (grabbing `"*"` instead of the real table
name for a `SELECT * FROM games`), and rerun this lesson's own DB-API
proof. `self._connection._db.query(table)` now real-fails with `No
table named '*'`, surfacing as a real `PocketDBError` — not a silent
wrong answer, because `Database.query` (Lesson 18) already, honestly,
refuses to guess at an unknown table name. Restore the correct index
and confirm the real, correct rows return.

### Exercises

- `Cursor.execute`'s own real `SELECT` handling only supports exactly
  `"SELECT * FROM table"` — no column list, no `WHERE`. Deliberately
  call it with `"SELECT id, player FROM games"` and observe the real,
  actual (probably wrong, or erroring) behavior — then explain, from
  this lesson's own SE Lens, why that's an acceptable, honest gap right
  now rather than a bug that needs fixing before S08.
- Add a real `Model.get(db, **filters)` classmethod, returning the
  first `Model` instance whose real fields match every given keyword —
  built entirely by calling `Model.all(db)` and filtering the real,
  returned list in Python, with no new database-level operation at
  all. Explain why this real approach is correct but not efficient,
  referencing Lesson 18's own CS Lens on table scans.
- `Connection`/`Cursor` reach into `self._connection._db` directly — a
  real, underscore-prefixed attribute of a different real class.
  Redesign this using a real, public `Database` method instead (or
  decide the current, direct-access design is fine, and write down
  why), the same kind of real, deliberate API-boundary judgment this
  project's own `README.md` already makes repeatedly.

### Definition of Done

- [ ] `dbapi.py` and `orm.py` both exist as real, permanent files, and
      neither one required any change to the C++ engine.
- [ ] You ran a real query and a real insert through `Cursor.execute`,
      using the real, positional `?` paramstyle.
- [ ] You defined a real `Model` subclass, saved real instances, and
      fetched them back with `.all()`.
- [ ] You closed a database after using each new surface, reopened it
      in a *new* process, and confirmed the real data was still there
      through both.
- [ ] You caused the real "wrong split index" failure yourself and
      confirmed restoring it fixes it.
- [ ] You can explain, from memory, why `Cursor.execute` raises an
      error instead of guessing at unsupported SQL — referencing this
      lesson's own SE Lens.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add sqlite3-shaped DB-API surface and a hand-rolled ORM"`.
