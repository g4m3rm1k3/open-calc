# Lesson 8: SQL Fundamentals — Connections, Parameters, and Real Injection

**What you will build:** a `recordkeeper/store.py` module with
`connect`, `insert_contacts`, `find_by_name`, and `all_contacts`,
backed by the standard library's `sqlite3`, storing `Contact` objects
in a real on-disk database. The transferable problem: what a database
connection and cursor actually are and do; why building a SQL query by
gluing strings together is a real, exploitable vulnerability — proven
by actually exploiting a naive version of `recordkeeper`'s own
code — not a theoretical concern; and what a transaction actually
guarantees when a batch operation fails partway through, proven with a
real rollback.

**What you need to know first:** Lesson 4 — `Contact`. Lesson 7 —
`chunked`, used here to insert contacts in batches.

**Terms used in this lesson**

- **Connection** — a live link between a running program and a
  specific database, through which every operation against that
  database has to pass. It exists because a database is, like a file
  (Lesson 1), a shared external resource the operating system or
  database engine manages — a program needs an explicit, established
  channel to it before it can do anything, the same underlying need
  `open()` served for files.
- **Cursor** — an object that executes SQL statements against a
  connection and manages the results a query produces. It exists as a
  separate object from the connection itself because a single
  connection can have multiple cursors, each independently executing
  statements and tracking its own current position within its own
  results, without those separate result streams interfering with each
  other.
- **Transaction** — a group of one or more database operations treated
  as a single, all-or-nothing unit: either every operation in the group
  is permanently applied, or none of them are. It exists because a
  batch of related changes (inserting ten rows that are only
  individually meaningless as a complete set) is often only actually
  correct if *all* of them succeed — a transaction is the database's
  own mechanism for guaranteeing that a failure partway through never
  leaves the data in a half-updated, inconsistent state.
- **SQL injection** — a vulnerability where untrusted input is inserted
  directly into a SQL statement's own text, letting that input change
  the statement's actual structure rather than being treated as pure
  data. It exists as a real, exploitable category of bug — not a
  hypothetical one — anywhere a query string is built by directly
  combining fixed SQL text with a value that ultimately came from
  outside the program's own control.
- **Parameterized query (placeholder)** — a SQL statement containing a
  placeholder marker (`?` in `sqlite3`) instead of a value spliced
  directly into the statement's text, with the actual value supplied
  separately, alongside the statement, rather than as part of it. It
  exists specifically to prevent SQL injection: the database driver
  keeps a placeholder's value structurally separate from the
  statement's own syntax, so that value can never be interpreted as
  additional SQL, no matter what characters it happens to contain.

**Objects and methods used**

- **`sqlite3.connect`**
  - *What it is:* A function from the standard library's `sqlite3`
    module that opens a connection to a SQLite database file (or an
    in-memory database, given the special path `":memory:"`).
  - *Implementation:* `sqlite3.connect(path) -> a Connection`; creates
    the database file if it doesn't already exist.
  - *Its use:* What `connect` (this lesson's own project function)
    calls to open `recordkeeper`'s database.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    standard-library function; responsible for establishing a real
    connection to a specific SQLite database, creating the underlying
    file if needed; depends on a valid file path (or `":memory:"`);
    called directly inside `connect`; shape is one path `str` in, one
    `Connection` object out.

- **`Connection.execute` / `Connection.executemany`**
  - *What they are:* Methods on a `Connection` that run a SQL
    statement, using a cursor created and managed automatically.
  - *Implementation:* `conn.execute(sql, params=()) -> a Cursor`
    (params filling any `?` placeholders in `sql`); `conn.executemany(sql,
    seq_of_params) -> a Cursor` (runs `sql` once per item in
    `seq_of_params`, each supplying its own set of placeholder values).
  - *Their use:* `execute` for the schema-creation statement and single-
    row lookups; `executemany` for inserting a whole batch of contacts
    in one call.
  - *Type / Responsibility / Depends on / Connects to / Shape:*
    Instance methods on `Connection`; responsible for sending SQL text
    (and, for placeholders, separate parameter values) to the database
    engine and returning a `Cursor` positioned to read any results;
    depend on an open connection and syntactically valid SQL; called
    throughout `store.py`; shape is a SQL `str` (plus optional
    parameters) in, a `Cursor` out.

- **`Cursor.fetchall` / `Cursor.fetchone`**
  - *What they are:* Methods that retrieve a query's result rows from
    an already-executed cursor.
  - *Implementation:* `cur.fetchall() -> list[tuple]` (every remaining
    row); `cur.fetchone() -> tuple or None` (the next single row, or
    `None` if there isn't one).
  - *Their use:* Read back the rows a `SELECT` statement produced,
    inside `find_by_name` and `all_contacts`.
  - *Type / Responsibility / Depends on / Connects to / Shape:*
    Instance methods on `Cursor`; responsible for pulling already-
    computed result rows out of the database driver's own result
    buffer; depend on a cursor that has just executed a query
    producing rows; called on the `Cursor` object `conn.execute(...)`
    returns; shape is no arguments in, either a `list[tuple]` or a
    single `tuple`-or-`None` out — each row itself a plain tuple of
    column values, in column order, with no field names attached.

- **`Connection.commit` / `Connection.rollback`**
  - *What they are:* Methods that end the current transaction, either
    making its changes permanent or discarding them entirely.
  - *Implementation:* `conn.commit() -> None` (permanently applies
    every change made since the last commit or rollback);
    `conn.rollback() -> None` (discards every change made since the
    last commit or rollback, as if they never happened).
  - *Their use:* `insert_contacts` commits a batch insert if it
    succeeds, or rolls it back entirely if any row in the batch fails.
  - *Type / Responsibility / Depends on / Connects to / Shape:*
    Instance methods on `Connection`; responsible for ending the
    current transaction one of two ways — full treatment of what a
    transaction actually guarantees is in Terms, above; depend on an
    open connection with a transaction potentially in progress; called
    at the end of `insert_contacts`'s `try`/`except`; shape is no
    arguments in, `None` out — their effect is entirely what they
    finalize or discard.

- **`sqlite3.IntegrityError`**
  - *What it is:* An exception raised when an operation would violate a
    database constraint (here, `contacts.id`'s `PRIMARY KEY`
    uniqueness).
  - *Implementation:* A subclass of `sqlite3.DatabaseError`, itself a
    subclass of the builtin `Exception`; raised by `sqlite3`'s own
    driver when the underlying SQLite engine reports a constraint
    violation.
  - *Its use:* Caught inside `insert_contacts` to trigger a `rollback`
    instead of leaving a partially-applied batch in place.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    standard-library exception class, raised automatically by
    `sqlite3`'s own internals, never constructed directly by
    `recordkeeper`'s own code; responsible for signaling, with a real
    message, exactly which constraint was violated; depends on an
    `execute`/`executemany` call actually attempting a
    constraint-violating write; caught in `insert_contacts`'s own
    `except` clause; shape is an exception object whose `str()` names
    the specific violated constraint, not a normal return value.

---

## Concept Unit: Connections, cursors, and the shape of a row

### The Problem

Every data source `recordkeeper` has used so far — CSV, JSON, XML — is
a self-contained file, read start to finish. A database is different:
it's a live, running service (even SQLite, technically a library
linked into the same process, presents the same connection-based
interface real client/server databases use), and a program has to
establish an explicit connection to it before running any query at
all, the same way `open()` established an explicit connection to a
file.

> **Stop and think:** `csv.DictReader` (Lesson 3) handed back each row
> as a `dict`, keyed by column name. A SQL `SELECT` statement also
> returns rows made of named columns. Given that `sqlite3` is a
> different library serving a different purpose, would you expect a row
> it returns to also come back as a `dict` automatically — or is there
> a simpler, more primitive shape a database driver might reasonably
> default to instead, leaving the dict-like convenience as something
> added on top if wanted?

### Introduce the concept in isolation

```python
import sqlite3

conn = sqlite3.connect(":memory:")
cur = conn.cursor()

cur.execute("CREATE TABLE contacts (id TEXT PRIMARY KEY, name TEXT, email TEXT, notes TEXT)")
cur.execute(
    "INSERT INTO contacts VALUES ('1', 'Alice Smith', 'alice@example.com', 'Prefers email, not calls')"
)
conn.commit()

cur.execute("SELECT * FROM contacts")
print("fetchall ->", cur.fetchall())

cur.execute("SELECT * FROM contacts WHERE id = '1'")
row = cur.fetchone()
print("fetchone ->", row, "type:", type(row))

conn.close()
```

Real output:

```
fetchall -> [('1', 'Alice Smith', 'alice@example.com', 'Prefers email, not calls')]
fetchone -> ('1', 'Alice Smith', 'alice@example.com', 'Prefers email, not calls') type: <class 'tuple'>
```

`sqlite3.connect(":memory:")` opens a real, working SQLite database
that exists only in memory for this process's lifetime — useful for
labs like this one, where nothing needs to persist to disk.
`cur.execute(...)` for the `CREATE TABLE` and `INSERT` statements runs
each one against that connection; `conn.commit()` (full treatment
above, in Objects and methods used) makes the insert permanent.
`fetchone`'s real output answers this unit's own question directly: a
row comes back as a plain `tuple`, values in column order, with no
column names attached at all — `sqlite3`'s own default row shape is
more primitive than `csv.DictReader`'s dicts, not because SQL rows
lack named columns, but because attaching those names is left as an
optional, separate step `sqlite3` doesn't do automatically.

### Discard the throwaway example

This lab's in-memory connection and its data are discarded; nothing
persists past the `conn.close()` call, and no code from this lab
carries into the project unchanged.

### Project Change

- **Reference Source** — none; from-scratch, as in every prior lesson.
- **Files affected** — new file `recordkeeper/store.py`.
- **Change type** — add.
- **Location** — n/a (new file).
- **Dependencies** — `sqlite3` (standard library);
  `recordkeeper.models.Contact` (Lesson 4).

### The New Code

```python
import sqlite3

from recordkeeper.models import Contact

SCHEMA = """
CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    notes TEXT NOT NULL
)
"""


def connect(path):
    conn = sqlite3.connect(path)
    conn.execute(SCHEMA)
    conn.commit()
    return conn


def all_contacts(conn):
    cur = conn.execute("SELECT id, name, email, notes FROM contacts")
    return [Contact(*row) for row in cur.fetchall()]
```

### The Updated Project

Brand-new file, nothing surrounding this fragment yet — covered by
Project Change above.

### Mechanical walkthrough

- **`SCHEMA = """..."""`** — a triple-quoted string literal assigned
  to a module-level constant, holding the `CREATE TABLE` statement as
  plain text; `IF NOT EXISTS` means running this statement against a
  database that already has the table does nothing, rather than
  raising an error — safe to run every time `connect` is called.
- **`sqlite3.connect(path)`** — full treatment above (Objects and
  methods used); here called with a real file path rather than
  `":memory:"`, so `recordkeeper`'s contacts persist on disk between
  runs.
- **`conn.execute(SCHEMA)`** — full treatment of `Connection.execute`
  above; runs the table-creation statement, using `Connection.execute`
  directly rather than first creating a separate cursor object with
  `conn.cursor()`, since nothing here needs to read the statement's own
  result.
- **`conn.commit()`** — full treatment above; makes the table creation
  (if it happened) permanent.
- **`conn.execute("SELECT id, name, email, notes FROM contacts")`** —
  a `SELECT` naming the four columns explicitly, in the exact order
  `Contact`'s own fields expect, rather than `SELECT *` — this ordering
  is what lets the next line unpack each row directly into `Contact`'s
  constructor positionally.
- **`[Contact(*row) for row in cur.fetchall()]`** — a list
  comprehension (the same shape used throughout `csv_source.py`,
  `json_source.py`, and `xml_source.py`); `*row` unpacks each fetched
  tuple's four values as *positional* arguments into `Contact`'s
  constructor — different from Lesson 4's `Contact(**row)` keyword
  unpacking, because a database row (per this unit's own lab) is a
  plain tuple with no field names to unpack by keyword at all, only
  values in a known, fixed order.

### CS lens

A connection object managing access to a shared external resource,
separate from the cursors/statements that actually use it, is the same
**resource-handle** idea `open()`'s file object (Lesson 1) already
embodied — a live, explicit link to something external, obtained
before use and requiring explicit release when done (`.close()`, or a
`with` block, the same context-manager protocol from Lesson 1, which
`sqlite3.Connection` also supports).

```
Also recognized in: a network socket object representing an open TCP
connection, a graphics API's device/context object representing access
to a GPU, an operating system's own file-descriptor table underlying
every open file handle
```

### SE lens

The alternative not chosen is having `all_contacts` (and every other
query function) return raw tuples directly, the way `cur.fetchall()`
handed them back in the isolated lab. That's less code — no `Contact(*row)`
conversion at all. The tradeoff is the exact same one Lesson 4's whole
lesson was about: a raw tuple has no fixed, checked shape a typo or a
column-order mistake would get caught against, while
`Contact(*row)` fails loudly, immediately, if a query's column order
or count doesn't match what `Contact`'s constructor expects — the same
protection Lesson 4 gave CSV rows, now given to database rows at the
exact same seam, one conversion, right where the data enters
`recordkeeper`'s own code.

### Commands needed

None new.

### Run it

Shown above under "Introduce the concept in isolation" — real output.

### Connect

This unit establishes what a connection and a row actually are; the
next unit builds `insert_contacts` and `find_by_name`, and shows why
building either one's SQL text by hand, out of untrusted values, is a
real, exploitable mistake.

---

## Concept Unit: Parameterized queries, and a real exploit

### The Problem

A query like "find the contact named X" needs `X` to come from
somewhere outside the fixed SQL text itself — a function parameter,
ultimately traceable back to user input in a real application. The
most direct-looking way to build that query is string formatting,
splicing the value straight into the SQL text — exactly the same
technique `count_event`'s f-string used safely, back in Lesson 7, to
build a search string for plain Python `in` checks. SQL is not plain
Python `in`, though — a value spliced into SQL text isn't just
searched for, it becomes part of the *statement itself*.

> **Stop and think:** If a query is built as `f"SELECT * FROM contacts
> WHERE name = '{name}'"`, and `name` is supplied by whoever is calling
> this function, what would happen if `name` itself contained a single
> quote character — the same character SQL uses to end a string
> literal? Could a caller construct a `name` value that changes what
> the query actually *does*, rather than just what it searches for?

### Introduce the concept in isolation

```python
import sqlite3

conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.execute("CREATE TABLE contacts (id TEXT PRIMARY KEY, name TEXT, email TEXT)")
cur.execute("INSERT INTO contacts VALUES ('1', 'Alice Smith', 'alice@example.com')")
cur.execute("INSERT INTO contacts VALUES ('2', 'Bob Lee', 'bob@example.com')")
conn.commit()

def find_by_name_unsafe(name):
    query = f"SELECT * FROM contacts WHERE name = '{name}'"
    print("  query executed:", query)
    cur.execute(query)
    return cur.fetchall()

print(find_by_name_unsafe("Alice Smith"))

malicious = "x' OR '1'='1"
print(find_by_name_unsafe(malicious))

def find_by_name_safe(name):
    cur.execute("SELECT * FROM contacts WHERE name = ?", (name,))
    return cur.fetchall()

print(find_by_name_safe(malicious))
print(find_by_name_safe("Bob Lee"))
```

Real output:

```
  query executed: SELECT * FROM contacts WHERE name = 'Alice Smith'
[('1', 'Alice Smith', 'alice@example.com')]
  query executed: SELECT * FROM contacts WHERE name = 'x' OR '1'='1'
[('1', 'Alice Smith', 'alice@example.com'), ('2', 'Bob Lee', 'bob@example.com')]
[]
[('2', 'Bob Lee', 'bob@example.com')]
```

This is a real, working **SQL injection**, named here in full — not a
contrived example. `malicious`'s own single quote closes the string
literal early, right where the f-string spliced it in; everything
after it — `OR '1'='1'` — becomes real, executed SQL, and `'1'='1'` is
always true, so the resulting query matches *every* row regardless of
name, leaking both Alice's and Bob's data to a caller who searched for
neither. `find_by_name_safe`, using a **parameterized query** (also
named here in full) with a `?` placeholder, gets the identical
`malicious` string and correctly finds nothing — because `sqlite3`
never inserts `name`'s text into the SQL statement at all; it hands
the value to the database driver separately, which compares it,
as pure data, against the `name` column's actual contents. No sequence
of characters inside a parameterized value can ever change the
statement's structure, which is exactly why `'Bob Lee'` — an ordinary,
non-malicious name — still works correctly through the same safe
function right after.

### Discard the throwaway example

This lab's in-memory connection, `find_by_name_unsafe`, and `malicious`
are discarded; `find_by_name_unsafe` never appears in
`recordkeeper` — only the parameterized pattern it was built to fail
against carries forward.

### Project Change

- **Reference Source** — none; from-scratch, as in the previous unit.
- **Files affected** — `recordkeeper/store.py` (modified, adding
  `find_by_name`).
- **Change type** — add.
- **Location** — after `all_contacts`, already present from the
  previous unit.
- **Dependencies** — none new.

### The New Code

```python
def find_by_name(conn, name):
    cur = conn.execute(
        "SELECT id, name, email, notes FROM contacts WHERE name = ?", (name,)
    )
    return [Contact(*row) for row in cur.fetchall()]
```

### The Updated Project

```python
 1  import sqlite3
 2
 3  from recordkeeper.models import Contact
 4
 5  SCHEMA = """
 6  CREATE TABLE IF NOT EXISTS contacts (
 7      id TEXT PRIMARY KEY,
 8      name TEXT NOT NULL,
 9      email TEXT NOT NULL,
10      notes TEXT NOT NULL
11  )
12  """
13
14
15  def connect(path):
16      conn = sqlite3.connect(path)
17      conn.execute(SCHEMA)
18      conn.commit()
19      return conn
20
21
22  def find_by_name(conn, name):                              # ← new
23      cur = conn.execute(                                     # ← new
24          "SELECT id, name, email, notes FROM contacts WHERE name = ?", (name,)  # ← new
25      )                                                        # ← new
26      return [Contact(*row) for row in cur.fetchall()]         # ← new
27
28
29  def all_contacts(conn):
30      cur = conn.execute("SELECT id, name, email, notes FROM contacts")
31      return [Contact(*row) for row in cur.fetchall()]
```

`find_by_name` is built the safe way from the start, per this unit's
own lab: the `?` in its SQL text is a placeholder, and `(name,)` — a
one-element tuple — supplies its value separately, the same
`Connection.execute(sql, params)` signature already given full
treatment above.

### Mechanical walkthrough

- **`"... WHERE name = ?"`** — a SQL string containing one `?`
  placeholder, full treatment of parameterized queries already given
  above, in Terms.
- **`(name,)`** — a one-element tuple literal; the trailing comma is
  required — without it, `(name)` would just be `name` itself in
  parentheses, not a tuple at all — supplying exactly one value to fill
  the query's one `?` placeholder, in order.
- **`conn.execute(sql, params)`** — full treatment of
  `Connection.execute` above; this two-argument form is what actually
  keeps `name`'s value structurally separate from the SQL text, per
  this unit's own proven exploit and fix.

### CS lens

Keeping a value's data separate from a statement's own syntax, so that
value can never be interpreted as syntax no matter its content, is a
specific instance of the same **escaping/separation-of-data-and-code**
idea Lesson 3's CSV quoting already embodied — there, keeping a field's
own comma from being read as a column separator; here, keeping a
value's own quote character from being read as SQL syntax.

```
Also recognized in: prepared statements in every major SQL database
driver, shell commands built with an argument list instead of a single
interpolated string (avoiding shell injection), template engines that
auto-escape user-supplied values before inserting them into HTML
(avoiding cross-site scripting)
```

### SE lens

The alternative not chosen — string formatting, as
`find_by_name_unsafe` did — isn't a shortcut with a minor downside; per
this unit's own real, executed exploit, it's a direct path to leaking
every row in a table to a caller who supplied one crafted string, with
no crash, no error, no warning that anything went wrong. The
parameterized version costs nothing extra in readability, and this
lesson deliberately never gives `find_by_name_unsafe` a chance to be
copied into `recordkeeper`'s own code at all — `find_by_name` is
written the safe way from its very first line, precisely because a
"fix it later" version of a SQL-building function is exactly the kind
of debt that survives into production by accident, one deadline at a
time.

### Commands needed

None new.

### Run it

Shown above under "Introduce the concept in isolation" — real output,
including the actual exploit succeeding against the unsafe version and
failing to succeed against the safe one.

### Connect

The previous unit established the connection/cursor/row basics this
unit's `find_by_name` builds on; this unit proves, with a real working
exploit, why every query `recordkeeper` writes uses a placeholder for
any value that didn't come from the code itself — the next unit turns
to what happens when a whole *batch* of writes needs to succeed or fail
together.

---

## Concept Unit: Transactions — succeeding or failing as one unit

### The Problem

`recordkeeper`'s `Contact` records need to be inserted in batches — the
exact scenario Lesson 7's `chunked` was built for. A batch of, say,
three rows could fail partway through — the third row violating the
table's `PRIMARY KEY` uniqueness constraint, for instance — and nothing
so far has established what happens to the first two rows in that
situation: do they stay inserted, or does the whole batch's effect
disappear?

> **Stop and think:** If a batch of three `INSERT`s runs one at a time,
> and the third one fails with a constraint violation, what would you
> *want* to be true about the first two rows — already, individually,
> successfully inserted before the failure happened? Would leaving them
> in place, with the third missing, ever be a genuinely correct outcome
> for a caller who asked for "insert this whole batch"?

### Introduce the concept in isolation

```python
import sqlite3

conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.execute("CREATE TABLE contacts (id TEXT PRIMARY KEY, name TEXT)")
conn.commit()

def insert_batch(rows):
    try:
        cur.executemany("INSERT INTO contacts (id, name) VALUES (?, ?)", rows)
        conn.commit()
        print("  batch committed")
    except sqlite3.IntegrityError as e:
        conn.rollback()
        print(f"  {type(e).__name__}: {e}")
        print("  batch rolled back")

insert_batch([("1", "Alice"), ("2", "Bob")])
cur.execute("SELECT * FROM contacts")
print("table now:", cur.fetchall())

insert_batch([("3", "Cara"), ("1", "Duplicate Alice"), ("4", "Dax")])
cur.execute("SELECT * FROM contacts")
print("table now:", cur.fetchall())
```

Real output:

```
  batch committed
table now: [('1', 'Alice'), ('2', 'Bob')]
  IntegrityError: UNIQUE constraint failed: contacts.id
  batch rolled back
table now: [('1', 'Alice'), ('2', 'Bob')]
```

The first batch, with no conflicts, commits cleanly — the table holds
exactly Alice and Bob afterward. The second batch's middle row,
`("1", "Duplicate Alice")`, collides with Alice's already-existing
`id`, and `executemany` raises a real `sqlite3.IntegrityError` (full
treatment above, in Objects and methods used), naming the exact
constraint violated. The table afterward is *identical* to before that
second batch was attempted — Cara and Dax, which individually would
have inserted without any conflict at all, are both gone too. This is
what a **transaction** (named here in full, per Terms above)
guarantees: `executemany` inside this `try` block ran as one
transaction, and `conn.rollback()` discarded every change made since
the last commit, including the parts of the batch that never conflicted
with anything — proof that "all or nothing" really does mean *all*, not
"whichever ones happened not to fail."

### Discard the throwaway example

This lab's in-memory connection and `insert_batch` are discarded;
`recordkeeper`'s own `insert_contacts` (Concept Unit 1, above) already
follows this exact commit-or-rollback shape.

### Project Change

- **Reference Source** — none; from-scratch, as in the previous unit.
- **Files affected** — `recordkeeper/store.py` (modified, adding
  `insert_contacts`).
- **Change type** — add.
- **Location** — after `connect`, before `find_by_name`.
- **Dependencies** — none new.

### The New Code

```python
def insert_contacts(conn, contacts):
    rows = [(c.id, c.name, c.email, c.notes) for c in contacts]
    try:
        conn.executemany(
            "INSERT INTO contacts (id, name, email, notes) VALUES (?, ?, ?, ?)",
            rows,
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.rollback()
        raise
```

### The Updated Project

`recordkeeper/store.py`, complete:

```python
 1  import sqlite3
 2
 3  from recordkeeper.models import Contact
 4
 5  SCHEMA = """
 6  CREATE TABLE IF NOT EXISTS contacts (
 7      id TEXT PRIMARY KEY,
 8      name TEXT NOT NULL,
 9      email TEXT NOT NULL,
10      notes TEXT NOT NULL
11  )
12  """
13
14
15  def connect(path):
16      conn = sqlite3.connect(path)
17      conn.execute(SCHEMA)
18      conn.commit()
19      return conn
20
21
22  def insert_contacts(conn, contacts):                        # ← new
23      rows = [(c.id, c.name, c.email, c.notes) for c in contacts]  # ← new
24      try:                                                     # ← new
25          conn.executemany(                                    # ← new
26              "INSERT INTO contacts (id, name, email, notes) VALUES (?, ?, ?, ?)",  # ← new
27              rows,                                             # ← new
28          )                                                     # ← new
29          conn.commit()                                        # ← new
30      except sqlite3.IntegrityError:                            # ← new
31          conn.rollback()                                       # ← new
32          raise                                                  # ← new
33
34
35  def find_by_name(conn, name):
36      cur = conn.execute(
37          "SELECT id, name, email, notes FROM contacts WHERE name = ?", (name,)
38      )
39      return [Contact(*row) for row in cur.fetchall()]
40
41
42  def all_contacts(conn):
43      cur = conn.execute("SELECT id, name, email, notes FROM contacts")
44      return [Contact(*row) for row in cur.fetchall()]
```

`store.py` is now complete: `connect` opens a database and ensures its
schema exists; `insert_contacts` converts a list of `Contact` objects
into plain tuples and inserts all of them as one transaction,
committing on success or rolling back entirely and re-raising the real
error on any constraint violation; `find_by_name` and `all_contacts`
both read rows back and convert them into `Contact` objects at the
same seam every other source in this curriculum has used since Lesson
4.

### Mechanical walkthrough

- **`rows = [(c.id, c.name, c.email, c.notes) for c in contacts]`** —
  a list comprehension building one plain tuple per `Contact`, in the
  exact column order `INSERT INTO contacts (id, name, email, notes)`
  expects — the reverse of `all_contacts`'s `Contact(*row)`, converting
  real objects back into the flat, positional shape a database row
  needs.
- **`try: ... except sqlite3.IntegrityError: ... raise`** — full
  treatment of `sqlite3.IntegrityError` already given above; `raise`
  with no argument, inside an `except` block, re-raises the exact
  exception just caught — so a caller of `insert_contacts` still learns
  a batch failed and why, rather than the failure being silently
  swallowed after the rollback runs.
- **`conn.executemany(sql, rows)`** — full treatment of
  `Connection.executemany` above; runs the parameterized `INSERT`
  once per tuple in `rows`, all within the same transaction.
- **`conn.commit()` / `conn.rollback()`** — full treatment above; the
  exact commit-or-rollback pattern this unit's own isolated lab proved
  really does discard an entire failed batch, not just the row that
  caused the failure.

### CS lens

A transaction's all-or-nothing guarantee is the **atomicity** property
— the "A" in the classic ACID guarantees (Atomicity, Consistency,
Isolation, Durability) real databases aim to provide for transactions.

```
Also recognized in: a filesystem's own atomic rename operation
(replacing a file's old contents with new ones with no window where
neither exists), a payment system ensuring a transfer either debits and
credits both accounts or does neither, version control systems treating
a commit as one indivisible unit of change
```

### SE lens

The alternative not chosen is inserting each row individually, outside
any explicit transaction management — letting whichever rows succeed
stay inserted, and only the failing row get skipped or reported. That
would mean Cara and Dax, from this unit's own lab, would have ended up
in the table even though the batch that included them technically
"failed" — a real, silent inconsistency between what a caller asked for
("insert this batch") and what actually happened. Wrapping the whole
batch in one transaction costs nothing extra to write — `executemany`
already runs as one transaction by default — and turns "partially
applied" into an outcome that's structurally impossible, rather than
something calling code has to separately detect and clean up after.

### Commands needed

None new.

### Run it

Real output, from an actual run against `recordkeeper`'s own real data,
combining every source and tool this curriculum has built:

```python
import sqlite3
from recordkeeper.store import connect, insert_contacts, find_by_name, all_contacts
from recordkeeper.ingest.csv_source import load_contacts_csv
from recordkeeper.ingest.util import chunked

contacts = load_contacts_csv("data/contacts.csv")
conn = connect("data/recordkeeper.db")

for batch in chunked(contacts, 1):
    insert_contacts(conn, batch)

print(all_contacts(conn))
print(find_by_name(conn, "Alice Smith"))
print(find_by_name(conn, "x' OR '1'='1"))

try:
    insert_contacts(conn, contacts)  # same ids again -> should fail and roll back
except sqlite3.IntegrityError as e:
    print(f"{type(e).__name__}:", e)

print("table unchanged after failed batch:", all_contacts(conn))
```

```
[Contact(id='1', name='Alice Smith', email='alice@example.com', notes='Prefers email, not calls'), Contact(id='2', name='Bob Lee', email='bob@example.com', notes='Referred by Alice\nFollow up in June')]
[Contact(id='1', name='Alice Smith', email='alice@example.com', notes='Prefers email, not calls')]
[]
IntegrityError: UNIQUE constraint failed: contacts.id
table unchanged after failed batch: [Contact(id='1', name='Alice Smith', email='alice@example.com', notes='Prefers email, not calls'), Contact(id='2', name='Bob Lee', email='bob@example.com', notes='Referred by Alice\nFollow up in June')]
```

Both contacts inserted, one `chunked` batch at a time; a genuine
injection attempt against `find_by_name` correctly returns nothing;
and re-inserting the same contacts a second time fails with a real
`IntegrityError` and leaves the table exactly as it was — nothing
silently duplicated, nothing silently half-applied.

### Connect

The previous unit made every value entering a query safe from
injection; this unit makes every batch of writes atomic — between
them, `insert_contacts` and `find_by_name` never trust a value's
content to be safe (parameterized always) and never leave a batch
half-applied (transactional always), the two real guarantees this
whole lesson was built to prove, not just assert.

---

## Connect the pieces

`recordkeeper.store.connect` opens a real, on-disk SQLite database and
ensures its `contacts` table exists, using the exact `IF NOT EXISTS`
schema statement this lesson's first unit introduced.
`recordkeeper.ingest.csv_source.load_contacts_csv` (Lesson 3) loads
`recordkeeper`'s two real contacts; `recordkeeper.ingest.util.chunked`
(Lesson 7) groups them for batch insertion; `insert_contacts` writes
each batch inside one transaction, per this lesson's third unit,
committing on success. `find_by_name`, built the safe, parameterized
way from its very first line per this lesson's second unit, correctly
returns nothing at all when handed the exact SQL-injection payload this
lesson proved genuinely bypasses an unsafe version of the same
function. Attempting to insert the same two contacts a second time
fails with a real `IntegrityError`, and the table — checked directly
afterward with `all_contacts` — comes back completely unchanged: both
real, verified guarantees this lesson set out to prove, not merely
describe, holding at once, against `recordkeeper`'s own real data.
