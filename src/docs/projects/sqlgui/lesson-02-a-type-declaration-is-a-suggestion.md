# Lesson 2: A Type Declaration Is a Suggestion

**What you will build.** The `tools` table grows from one column to a
real shape — a description, a diameter, a type, a stock count, and a
proper surrogate id — and survives being run twice in a row without
crashing.

The transferable problem this lesson is actually about: SQLite's type
system doesn't work the way it does in most databases, and assuming
otherwise is exactly the kind of assumption that produces a bug nobody
notices until much later (a diameter silently stored as text, sorted
alphabetically instead of numerically, three months from now). Alongside
that: making a setup script safe to run more than once, and understanding
what `PRIMARY KEY` really commits a column to.

**What you need to know first.** Lesson 1 — the connect / cursor /
execute / commit / close lifecycle, basic `CREATE TABLE` syntax, and the
`sqlite3` command-line tool's `.tables` command.

**Terms introduced**

- **Storage class** — the actual, low-level type SQLite uses to store one
  specific value (`INTEGER`, `REAL`, `TEXT`, `BLOB`, or `NULL`),
  independent of what a column's declared type says.
- **Type affinity** — a column's declared type acting as a *preference*
  for which storage class incoming values get converted toward, not a
  strict rule that rejects the wrong type outright.
- **Idempotent** — an operation that produces the same end state no
  matter how many times it runs; here, a setup script that doesn't error
  the second time you run it.
- **rowid** — an automatically-maintained 64-bit integer SQLite assigns
  to every row in an ordinary table, used internally to find rows fast.

---

## Concept Unit: Type Affinity

### The Problem

Right now `tools` has exactly one column: `tool_number`, declared
`TEXT`. Real tool data needs more than that — a diameter (a number with
a decimal point), whether it's in stock (a whole count), a short
description. Before writing that `CREATE TABLE`, you need to know what
declaring a column's type in SQLite actually guarantees — because if you
assume it works like most other databases, you'll write a schema that
looks safe and isn't.

### Introduce the Concept in Isolation

This one's easiest to see directly in the `sqlite3` command-line tool
you already used in Lesson 1 — not Python yet. (Inserting and querying
from Python each get their own proper lesson next — Lessons 3 and 4 —
this is CLI exploration only, the same way `.tables` was in Lesson 1.)

```
$ sqlite3 scratch.db
SQLite version 3.45.1 2024-01-30 16:01:20
Enter ".help" for usage hints.
sqlite> CREATE TABLE demo (n INTEGER);
sqlite> INSERT INTO demo VALUES (42);
sqlite> INSERT INTO demo VALUES ('hello');
sqlite> SELECT n, typeof(n) FROM demo;
42|integer
hello|text
sqlite> .quit
```

What this proves: declaring `n INTEGER` did **not** stop SQLite from
accepting the string `'hello'`. It accepted both values. `42` (which
looks like a number) got stored using the `integer` storage class, and
`'hello'` (which doesn't) got stored using the `text` storage class,
right there in the same column. The column's declared type nudges
values toward a preferred storage class — SQLite calls this **type
affinity** — but it isn't a wall that rejects the wrong shape. That's a
real behavioral difference from something like PostgreSQL, which would
simply refuse the second `INSERT` outright.

### Discard the Throwaway Example

Delete `scratch.db`. This `demo` table and its two rows exist only to
prove what affinity does; they won't appear in your real project.

### Project Change

- **Reference Source:** No reference counterpart available in this
  session — this schema is a from-scratch design, not a verified port of
  Mastercam's actual ToolDB tables. If you're able to share that
  database's real schema later, a future lesson can align this one to
  it as a genuine reference source instead of a guess.
- **Files affected:** modified `create_db.py`.
- **Change type:** replace.
- **Location:** replacing the entire
  `cur.execute("CREATE TABLE tools (tool_number TEXT PRIMARY KEY)")`
  line from Lesson 1.
- **Dependencies:** none new.

### The New Code

Replace the `cur.execute(...)` line in `create_db.py` with:

```python
cur.execute("""
    CREATE TABLE tools (
        tool_number TEXT PRIMARY KEY,
        description TEXT,
        diameter REAL,
        tool_type TEXT,
        in_stock INTEGER
    )
""")
```

### The Updated Project

`create_db.py` now reads, in full:

```python
import sqlite3

conn = sqlite3.connect("tool_inventory.db")
cur = conn.cursor()
cur.execute("""
    CREATE TABLE tools (
        tool_number TEXT PRIMARY KEY,
        description TEXT,
        diameter REAL,
        tool_type TEXT,
        in_stock INTEGER
    )
""")
conn.commit()
conn.close()
```

As a whole, the script now defines a table shaped like a real tool
record — a number, a description, a size, a type, and a stock count —
instead of just an identifying string.

### Mechanical Walkthrough

- `"""..."""` — **first appearance.** A Python triple-quoted string,
  used here so a long SQL statement can span multiple lines readably.
  It's passed to `execute()` exactly like Lesson 1's single-line string
  was — `execute()` itself is already taught, no new treatment needed.
- `description TEXT` — reuses `TEXT` affinity, already established by
  `tool_number` in Lesson 1; no new treatment.
- `diameter REAL` — **first appearance.** Tells SQLite this column
  prefers to store values as floating-point numbers.
- `tool_type TEXT` — reuses `TEXT` again.
- `in_stock INTEGER` — **first appearance.** Prefers to store values as
  whole numbers.

### Execution Trace

No loop, recursion, repeated calls, or state-dependent branching present
— linear trace:

1. `cur.execute(...)` runs, sending the multi-line `CREATE TABLE`
   string to SQLite.
2. SQLite parses it and recognizes five column definitions for the
   `tools` table, recording each column's name and affinity (`TEXT`,
   `TEXT`, `REAL`, `TEXT`, `INTEGER`, in that order) as part of the
   current, uncommitted transaction.

### CS Lens

Type affinity is a form of **gradual / optional typing** — the
declaration expresses intent without a runtime engine strictly enforcing
it.

Also recognized in: Python's own dynamic typing (a type hint like
`x: int` is a documentation aid, not enforced at runtime without a
separate checker), JavaScript's loose type coercion, a JSON Schema that
describes a shape without anything forcing incoming data to match it,
TypeScript's types, which are erased entirely by the time the code
actually runs.

### SE Lens

Why did SQLite choose affinity over strict enforcement? The alternative
not chosen is what PostgreSQL or MySQL do: reject `INSERT`s that don't
match a column's declared type, outright, at write time.

The tradeoff: SQLite's leniency is genuinely useful for a language like
Python, where a value's exact type isn't always pinned down before it
reaches the database — you're not fighting the schema during
prototyping. The cost is real, too: a mistake that Postgres would catch
immediately (accidentally storing `"N/A"` in a numeric column) passes
silently here, and only surfaces later — during a sort, a `SUM()`, a
comparison that quietly does the wrong thing. That means the
responsibility for getting types right shifts from the schema onto your
Python code's own discipline, starting with how you write `INSERT`
statements in Lesson 3.

### Commands Needed

None new — `sqlite3 <file>` interactively, as just used above, is the
same tool from Lesson 1.

### Run It

```
$ rm tool_inventory.db
$ python create_db.py
$ sqlite3 tool_inventory.db ".schema tools"
CREATE TABLE tools (
        tool_number TEXT PRIMARY KEY,
        description TEXT,
        diameter REAL,
        tool_type TEXT,
        in_stock INTEGER
    );
```

(`.schema <table>` is a sibling of `.tables` from Lesson 1 — instead of
listing table names, it prints the exact `CREATE TABLE` statement
currently on file for the one you name.)

### Connecting Sentence

The schema now captures a real tool's shape — but there's a bug from
Lesson 1 still waiting: run `create_db.py` a second time right now, and
it crashes.

---

## Concept Unit: Idempotent Schema Creation

### The Problem

Lesson 1's third exercise had you notice this yourself: run
`create_db.py` twice in a row without deleting `tool_inventory.db`
first, and it raises an error, because `CREATE TABLE` assumes the table
doesn't already exist. Real setup scripts get run more than once — by
you, by a teammate, by an installer — and a script that crashes the
second time is broken in a way that only shows up later.

### Introduce the Concept in Isolation

Throwaway file `scratch.py`:

```python
import sqlite3

conn = sqlite3.connect("scratch.db")
cur = conn.cursor()
cur.execute("CREATE TABLE greeting (message TEXT)")
conn.commit()
cur.execute("CREATE TABLE greeting (message TEXT)")
conn.commit()
conn.close()
```

```
$ python scratch.py
Traceback (most recent call last):
  ...
sqlite3.OperationalError: table greeting already exists
```

Now change both `CREATE TABLE` lines to add three words, delete
`scratch.db`, and rerun:

```python
cur.execute("CREATE TABLE IF NOT EXISTS greeting (message TEXT)")
conn.commit()
cur.execute("CREATE TABLE IF NOT EXISTS greeting (message TEXT)")
conn.commit()
conn.close()
```

```
$ rm scratch.db
$ python scratch.py
$ echo $?
0
```

What this proves: the exact same "create it twice" pattern that crashed
a moment ago now exits cleanly, with the only change being the three
words `IF NOT EXISTS`. That clause is doing all the work.

### Discard the Throwaway Example

Delete `scratch.py` and `scratch.db`. This `greeting` table never
appears in your real project.

### Project Change

- **Reference Source:** No reference counterpart — `IF NOT EXISTS` is a
  standard SQL idiom, not something specific to any reference schema.
- **Files affected:** modified `create_db.py`.
- **Change type:** refactor (three words added inside the existing
  string).
- **Location:** the `CREATE TABLE` line written in the previous unit.
- **Dependencies:** none new.

### The New Code

Change the first line inside the SQL string in `create_db.py`:

```python
CREATE TABLE IF NOT EXISTS tools (
```

### The Updated Project

`create_db.py` now reads, in full:

```python
import sqlite3

conn = sqlite3.connect("tool_inventory.db")
cur = conn.cursor()
cur.execute("""
    CREATE TABLE IF NOT EXISTS tools (
        tool_number TEXT PRIMARY KEY,
        description TEXT,
        diameter REAL,
        tool_type TEXT,
        in_stock INTEGER
    )
""")
conn.commit()
conn.close()
```

As a whole, the script is now safe to run any number of times — the
first run creates `tools`; every run after that finds it already there
and does nothing further for that statement, instead of raising.

### Mechanical Walkthrough

- `IF NOT EXISTS` — **first appearance.** A clause on `CREATE TABLE`
  that makes the statement a no-op — not an error — when a table with
  that name already exists in the database.

### Execution Trace

No loop/recursion/repeated-call/state-branching trigger from the list —
but this unit's whole point is comparing two runs, so the trace covers
both, linearly:

1. **First run:** `tools` does not yet exist in `tool_inventory.db`.
   SQLite creates it, as in the previous unit.
2. **Second run, same file, not deleted in between:** SQLite checks its
   schema for a table named `tools`, finds one already there, and — 
   because of `IF NOT EXISTS` — takes no further action for that
   statement. Execution continues to `conn.commit()` and `conn.close()`
   with no error raised.

### CS Lens

This is **idempotency** — an operation whose result is the same
regardless of how many times it's applied.

Also recognized in: HTTP's `PUT` method (idempotent by specification,
unlike `POST`), a `Makefile` target that does nothing if its output file
is already newer than its inputs, the Unix `mkdir -p` flag, the entire
design philosophy behind tools like Terraform or Ansible ("declare the
desired end state; running `apply` twice is always safe"), a database
`UPSERT`.

### SE Lens

The alternative not chosen here is handling this in Python instead of
SQL — wrapping `cur.execute(...)` in a `try/except sqlite3.OperationalError`
and ignoring the "already exists" case. That would work, but it means
every script that might create this table needs its own copy of that
boilerplate, and a broad `except` clause risks silently swallowing a
*different*, real error that happens to raise the same exception type.
Putting `IF NOT EXISTS` directly in the SQL keeps the idempotency
guarantee in exactly one place — the schema definition itself — instead
of scattered across every script that touches it.

### Commands Needed

None new.

### Run It

```
$ python create_db.py
$ python create_db.py
$ echo $?
0
```

Run twice in a row, on purpose, with no `rm` in between — no error
either time.

### Connecting Sentence

The schema is solid and safe to (re)create now. Last piece of this
lesson: understanding exactly what `tool_number TEXT PRIMARY KEY`
commits you to, compared to the integer primary key you'll see in
almost every other schema you ever read.

---

## Concept Unit: `INTEGER PRIMARY KEY` and the rowid

### The Problem

`tool_number` is marked `PRIMARY KEY`, and it's `TEXT`. That's a
deliberate, reasonable choice — but nearly every SQLite tutorial or
reference schema you'll ever see instead uses `id INTEGER PRIMARY KEY`.
Before Lesson 8 builds other tables that reference `tools` by key, it's
worth knowing exactly what that specific combination does that yours
currently doesn't — because it changes how efficiently other tables can
point back at this one.

### Introduce the Concept in Isolation

Same CLI-exploration approach as the first unit in this lesson:

```
$ sqlite3 scratch.db
sqlite> CREATE TABLE demo (id INTEGER PRIMARY KEY, label TEXT);
sqlite> INSERT INTO demo (label) VALUES ('first');
sqlite> INSERT INTO demo (label) VALUES ('second');
sqlite> SELECT id, label FROM demo;
1|first
2|second
sqlite> .quit
```

What this proves: `id` was never supplied in either `INSERT` — only
`label` was — and SQLite assigned `1` and `2` on its own, in order. That
only happens because the column is declared as *both* `INTEGER` and
`PRIMARY KEY` together; that exact combination is a special case in
SQLite where the column becomes a direct alias for the table's internal
**rowid**, and leaving it out of an `INSERT` causes SQLite to
auto-assign the next available integer. Your `tool_number TEXT PRIMARY
KEY` has none of this behavior — because it isn't declared `INTEGER`,
it does not alias the rowid, and you'll have to supply a value for it
explicitly every time, starting in Lesson 3.

### Discard the Throwaway Example

Delete `scratch.db`. This `demo`/`label` table won't reappear.

### Project Change

- **Reference Source:** No reference counterpart — this is a deliberate
  design decision for this project, documented here rather than copied
  from anywhere.
- **Files affected:** modified `create_db.py`.
- **Change type:** refactor — add a surrogate `id` column as the new
  first column; `tool_number` stops being the primary key.
- **Location:** inside the `CREATE TABLE IF NOT EXISTS tools (...)`
  statement from the previous two units.
- **Dependencies:** none new.

### The New Code

Inside the `CREATE TABLE` statement in `create_db.py`, replace
`tool_number TEXT PRIMARY KEY,` with:

```python
id INTEGER PRIMARY KEY,
tool_number TEXT,
```

### The Updated Project

`create_db.py` now reads, in full:

```python
import sqlite3

conn = sqlite3.connect("tool_inventory.db")
cur = conn.cursor()
cur.execute("""
    CREATE TABLE IF NOT EXISTS tools (
        id INTEGER PRIMARY KEY,
        tool_number TEXT,
        description TEXT,
        diameter REAL,
        tool_type TEXT,
        in_stock INTEGER
    )
""")
conn.commit()
conn.close()
```

As a whole, `tools` now has a fast, SQLite-managed integer identity
(`id`) separate from the human-meaningful `tool_number`. That will make
Lesson 8's joins against this table cheaper — at the cost of
`tool_number` no longer being guaranteed unique by the schema itself.
That gap is intentional and temporary: Lesson 13 closes it properly with
an explicit `UNIQUE` constraint, once constraints are actually taught.

### Mechanical Walkthrough

- `id INTEGER PRIMARY KEY` — **first appearance of this exact
  combination.** Because the column is declared `INTEGER` *and*
  `PRIMARY KEY` together, SQLite makes it a direct alias for the table's
  own internal rowid — auto-assigned on insert when omitted, always
  unique, always the fastest possible column to look a row up by.
- `tool_number TEXT` — reuses `TEXT` affinity (already taught). Losing
  `PRIMARY KEY` is worth one clause on its own: it's now an ordinary
  column with no uniqueness guarantee yet — see the note above.

### Execution Trace

No loop/recursion/repeated-call/state-branching trigger — linear:

1. `cur.execute(...)` runs the updated `CREATE TABLE IF NOT EXISTS`
   statement.
2. SQLite parses six column definitions. Recognizing `id INTEGER
   PRIMARY KEY`, it makes `id` an alias for the table's rowid rather
   than a separately-stored value.
3. The schema change is recorded in the pending transaction;
   `conn.commit()` (already taught, Lesson 1) makes it durable.

### CS Lens

This is the distinction between a **surrogate key** and a **natural
key** — a surrogate key exists purely to identify a row, with no
meaning outside the database; a natural key is a real-world value that
happens to be unique.

Also recognized in: almost every relational schema ever designed (a
`users` table with a separate `id` column instead of using `email` as
the key), Git's commit hashes acting as a surrogate identity for a
commit rather than its message or timestamp, a library's Dewey Decimal
number standing in for a book's actual title, a driver's license number
standing in for your name.

### SE Lens

The alternative not chosen: keep `tool_number` as the sole primary
key, exactly as Lesson 1 originally set it up. Tradeoff: a natural key
like `tool_number` is meaningful to read and query directly — no
mental translation needed — but it isn't guaranteed stable forever (a
tool could theoretically get renumbered) and isn't the most efficient
possible join target the way SQLite's own rowid-backed integer is.
Adding a surrogate `id` costs one extra column, and one more thing to
explain (this whole unit). For a single, small table that cost is
arguably not worth paying yet — but it's the standard shape any schema
takes once foreign keys exist, so it's cheaper to adopt the habit now,
while the table is still empty, than to migrate real data into this
shape later, in Lesson 22.

### Commands Needed

None new.

### Run It

```
$ rm tool_inventory.db
$ python create_db.py
$ sqlite3 tool_inventory.db ".schema tools"
CREATE TABLE tools (
        id INTEGER PRIMARY KEY,
        tool_number TEXT,
        description TEXT,
        diameter REAL,
        tool_type TEXT,
        in_stock INTEGER
    );
```

### Connecting Sentence

The schema is now in its real working shape — the closing section below
traces what happens to one tool number through everything this lesson
built.

---

## Closing

**Connect the pieces.** Trace a tool number like `"T-100"` through the
finished `create_db.py`, start to finish:

1. `sqlite3.connect("tool_inventory.db")` opens (or creates) the file,
   returning a `Connection`.
2. `conn.cursor()` returns a `Cursor` bound to it.
3. `cur.execute(...)` runs the `CREATE TABLE IF NOT EXISTS` statement.
   SQLite records six column definitions for `tools`: `id` (aliasing the
   rowid, auto-assigned), `tool_number` and `description` and
   `tool_type` (`TEXT` affinity), `diameter` (`REAL` affinity),
   `in_stock` (`INTEGER` affinity) — all still just schema, no data.
4. `conn.commit()` writes that schema to disk permanently.
5. `conn.close()` releases the connection.
6. When `"T-100"` is actually inserted, in Lesson 3, it will land in the
   `tool_number` column exactly as typed — no auto-assignment, unlike
   `id`, which SQLite will pick on its own.

**What breaks without this.** Comment out `IF NOT EXISTS` back to plain
`CREATE TABLE`, keep the file from the last run (don't delete it), and
run twice:

```python
CREATE TABLE tools (
```

```
$ python create_db.py
$ python create_db.py
Traceback (most recent call last):
  ...
sqlite3.OperationalError: table tools already exists
```

The exact bug you first noticed yourself in Lesson 1's exercises,
reproduced on purpose, in its final context. Restore `IF NOT EXISTS`.

**Exercises.**

1. Add a `location TEXT` column (for something like `"Drawer 3"`) to the
   schema, and confirm it landed using `.schema tools`.
2. Using the `sqlite3` CLI on a throwaway table, declare a column `TEXT`
   and insert a plain number into it (`INSERT INTO t VALUES (0.5)`),
   then check `typeof()` on it. Compare that to this lesson's very first
   demo, where an `INTEGER` column kept a non-numeric string as `text`.
   In your own words: what does `TEXT` affinity do to an incoming
   number, and how is that different from what `INTEGER` affinity did to
   an incoming non-numeric string?
3. In a throwaway `INTEGER PRIMARY KEY` table, insert two rows, delete
   the first one, then insert a third. Check its `id`. Does SQLite reuse
   the deleted id, or keep counting up? Write down what you observe —
   you don't need to explain the mechanism yet.

**Definition of done.**

- [ ] `python create_db.py` can be run any number of times in a row with
      no error.
- [ ] `sqlite3 tool_inventory.db ".schema tools"` shows all six columns,
      with `id INTEGER PRIMARY KEY` first.
- [ ] You reproduced the "no `IF NOT EXISTS`" crash yourself and
      understood why, not just read about it.
- [ ] All three exercises above completed.
- [ ] Commit:

  ```
  git add create_db.py
  git commit -m "Give tools its real shape: typed columns, a surrogate id, idempotent setup

  Learned that SQLite's column types are affinities, not enforcement —
  verified by storing text in a declared INTEGER column on purpose.
  Added IF NOT EXISTS so this script is safe to rerun. Replaced the
  TEXT primary key with an INTEGER PRIMARY KEY id, aliasing SQLite's
  own rowid, ahead of Lesson 8's foreign keys."
  ```
