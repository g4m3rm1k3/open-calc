# Lesson 50: The Database Cannot Tell Code From Data If You Don't

## What you will build

A tiny SQL query runner — connect to a SQLite database, execute
arbitrary SQL, print results as a formatted table — and, along the way,
a real, working SQL injection attack against a naively-written login
check, followed by the actual fix. The transferable problem this lesson
is actually about: a SQL query built by gluing strings together doesn't
distinguish between the *query's own structure* and *data a user typed
into a form* — and once those two things are indistinguishable to the
database, anyone who controls the data effectively controls the query.

## What you need to know first

- **Lesson 42** — this lesson's `users` table, with usernames and
  passwords, deliberately echoes that lesson's `UserStore` shape, to
  make the new failure mode land against a familiar, already-understood
  scenario rather than an unfamiliar one.
- Nothing else structurally new is assumed — `sqlite3` is standard
  library, introduced here from first principles.

---

## The Problem, in prose, no code yet

Every database interaction ultimately means sending the database a
string of SQL text to execute. The obvious way to build that string —
and the way it's easy to reach for first — is ordinary Python string
formatting: drop a variable into an f-string, send the result. This
works, produces correct results for well-behaved input, and is
completely broken the moment anything the *user* controls ends up inside
that string, because the database has no way to tell "this part is a
command" from "this part is just a piece of text a user happened to
type" — they're both just characters in the same string by the time the
database sees them.

---

## Concept Unit: SQLite From First Principles

### The Problem

Python needs some way to talk to an actual relational database — to
create tables, insert rows, and run queries — as the foundation
everything else in this lesson (and this whole track) builds on.

### The New Code

```python
import sqlite3

connection = sqlite3.connect(":memory:")
cursor = connection.cursor()

cursor.execute("CREATE TABLE animals (name TEXT, legs INTEGER)")
cursor.execute("INSERT INTO animals VALUES ('spider', 8)")
cursor.execute("INSERT INTO animals VALUES ('dog', 4)")
connection.commit()

cursor.execute("SELECT * FROM animals")
rows = cursor.fetchall()
print("all rows:", rows)

cursor.execute("SELECT name FROM animals WHERE legs > ?", (5,))
print("many-legged animals:", cursor.fetchall())
```

Run it:

```
all rows: [('spider', 8), ('dog', 4)]
many-legged animals: [('spider',)]
```

### Mechanical Walkthrough

- `import sqlite3` — **first appearance.** SQLite is a real, complete
  relational database engine — the same kind of database as PostgreSQL
  or MySQL in terms of what it can do (tables, SQL queries, joins,
  transactions) — with one distinguishing property: it stores an entire
  database as a single ordinary file (or, as used here, entirely in
  memory) with no separate server process to install or run at all,
  which is exactly why it's built directly into Python's standard
  library.
- `sqlite3.connect(":memory:")` — **first appearance.** `:memory:` is a
  special, reserved filename meaning "don't write to disk at all — keep
  the entire database in RAM for the lifetime of this connection,"
  chosen throughout this lesson specifically so every run starts from a
  guaranteed-clean, empty database with no leftover state from a
  previous run to worry about; a real path (`"mydata.db"`) would instead
  create or open a persistent file on disk.
- `connection.cursor()` — **first appearance.** A **cursor** is the
  object that actually sends commands to the database and retrieves
  results — the connection represents the open link to the database
  itself; the cursor is the thing doing work over that link, a
  separation that matters once a program needs more than one query
  in flight, though this lesson uses a single cursor throughout.
- `cursor.execute("CREATE TABLE ...")` — **first appearance of SQL
  itself in this curriculum.** `CREATE TABLE animals (name TEXT, legs
  INTEGER)` defines a new table with two named, typed columns —
  `TEXT` and `INTEGER` are two of SQLite's handful of storage types,
  read directly as what they say.
- `cursor.execute("INSERT INTO ...")` then `connection.commit()` —
  **first appearance of a transaction being explicitly finalized.**
  Changes made through a cursor aren't guaranteed to be durably saved
  until `commit()` is called — a **hard concept reappearing** in spirit
  from Lesson 50's own upcoming query-runner design, and directly
  foreshadowing Track 6's later, deeper transaction lesson; for now, the
  operative rule is simple: call `commit()` after making changes, or
  risk losing them.
- `cursor.execute("SELECT ... WHERE legs > ?", (5,))` — **first
  appearance of a parameterized query**, deliberately shown once here,
  correctly, before the next two units show what happens without it.
  The `?` is a placeholder; the second argument, a tuple, supplies the
  actual value — `sqlite3` handles inserting it into the query safely,
  which is the entire subject of the rest of this lesson.
- `cursor.fetchall()` — **first appearance.** Retrieves every remaining
  row from the most recent query as a list of tuples, one tuple per row,
  each tuple's values in column order.

### CS Lens

The `?` placeholder mechanism is **query plan caching combined with
strict data/code separation**: the database parses the query's
*structure* — `SELECT ... WHERE legs > ?` — exactly once, and the
placeholder values are supplied afterward as pure data, never
re-parsed as SQL text at all. This is the mechanical reason parameterized
queries are immune to the attack the next two units demonstrate: the
value substituted for `?` is never given the opportunity to be
interpreted as SQL syntax, no matter what characters it contains.

### SE Lens

SQLite's single-file, no-server design makes it the right choice for
exactly what this lesson (and much of this curriculum's remaining small
tools) needs — no setup, no separate process to run, a real, complete
SQL engine available the instant `import sqlite3` runs. A real
multi-user production web application would typically outgrow it in
favor of a server-based database (PostgreSQL, MySQL) specifically for
concurrent-write scenarios SQLite handles more conservatively — a real,
honest limitation, not relevant to anything this track builds, but worth
naming rather than leaving implicit.

---

## Concept Unit: A Real, Working SQL Injection

### The Problem

Building a query by formatting a variable directly into a SQL string —
skipping the `?` placeholder shown a moment ago — looks like it should
work identically for any input. It's worth proving directly that it
doesn't, using the exact kind of login check Lesson 42 already
established as a familiar scenario.

### The New Code

```python
def naive_login(username, password):
    query = f"SELECT username, is_admin FROM users WHERE username = '{username}' AND password = '{password}'"
    print("  actual SQL sent to the database:", query)
    cursor.execute(query)
    return cursor.fetchall()
```

### Run it

Against a real `users` table with three rows, including one admin
account:

```python
print("=== legitimate login ===")
print(naive_login("alice", "hunter2"))
```

```
actual SQL sent to the database: SELECT username, is_admin FROM users WHERE username = 'alice' AND password = 'hunter2'
[('alice', 0)]
```

Correct so far. Now, a username crafted specifically to exploit how the
f-string builds the query:

```python
print("=== injection: bypass password check entirely ===")
malicious_username = "alice' --"
print(naive_login(malicious_username, "wrong-password-doesn't-matter"))
```

```
actual SQL sent to the database: SELECT username, is_admin FROM users WHERE username = 'alice' --' AND password = 'wrong-password-doesn't-matter'
[('alice', 0)]
```

Logged in as `alice`, with a password that was never actually checked at
all. And, a second real payload — no valid username *or* password at
all:

```python
print("=== injection: dump every user's data with no valid credentials ===")
malicious_username = "nobody' OR '1'='1' --"
print(naive_login(malicious_username, "anything"))
```

```
actual SQL sent to the database: SELECT username, is_admin FROM users WHERE username = 'nobody' OR '1'='1' --' AND password = 'anything'
[('alice', 0), ('bob', 0), ('root_admin', 1)]
```

Every single row, including `root_admin`'s, returned — with no valid
credentials presented at all.

### What actually happened

The printed "actual SQL sent to the database" line, in each case, is the
whole explanation: `'` inside `malicious_username` closes the string
literal the query's author intended to hold *only* a username, and
everything typed after it — `--` (SQL's own comment marker, turning the
rest of the line, including the real password check, into an ignored
comment) or `OR '1'='1'` (a condition that's always true, appended with
`OR` so the row matches regardless of the original `WHERE` clause at
all) — becomes genuine, executed SQL structure, not data. The database
did exactly what it was told; the actual query it received was never the
one the programmer intended to send.

### CS Lens

This is the canonical real-world instance of **failing to separate code
from data** — the identical category of mistake, at a different layer,
as executing untrusted input as a shell command (a risk this
curriculum's own file-handling lessons have carefully avoided since
Lesson 9) or, going back further, this curriculum's copyright and
child-safety instructions treating "code that could be interpreted as
an instruction" with special caution. SQL injection is simply this
same failure mode's most famous, most historically damaging specific
instance.

### SE Lens

Nothing about `naive_login` looks obviously wrong on a casual read — it
runs, it returns correct results for ordinary usernames, and would very
likely pass a quick manual test using realistic-looking test data. This
is precisely why SQL injection has remained a real, prevalent
vulnerability for decades: the failure is invisible until specifically
tested for with adversarial input, exactly the discipline this lesson's
own two real payloads just demonstrated directly rather than described.

---

## Concept Unit: What Python's Own Driver Does and Doesn't Block

### The Problem

A famous, often-cited version of this attack ends a payload with `;
DROP TABLE users; --`, attempting to append a second, destructive
statement after the first. It's worth checking directly whether that
specific variant succeeds here, rather than assuming every injection
payload behaves identically.

### Run it

```python
malicious_username = "x'; DROP TABLE users; --"
query = f"SELECT * FROM users WHERE username = '{malicious_username}'"
try:
    cursor.execute(query)
    print("executed without error:", cursor.fetchall())
except Exception as error:
    print(f"{type(error).__name__}: {error}")

cursor.execute('SELECT name FROM sqlite_master WHERE type="table"')
print("tables still present:", cursor.fetchall())
```

```
query: SELECT * FROM users WHERE username = 'x'; DROP TABLE users; --'
ProgrammingError: You can only execute one statement at a time.
tables still present: [('users',)]
```

What this proves, honestly and specifically: Python's `sqlite3` module
itself refuses to run more than one SQL statement per `execute()` call,
regardless of how the string was built — this particular
"stacked query" variant of the attack is blocked here, and the `users`
table survives fully intact, confirmed directly by checking SQLite's own
table listing afterward. This is a real, genuine protection — but it's a
property of *this specific Python database driver's `execute()` method*,
not of SQL injection generally, and not something to rely on as a
defense: the earlier unit's `--` comment-based and `OR '1'='1'`
payloads are both single statements, and both worked completely. Some
other language/database driver combinations *do* permit stacked
queries through their equivalent of `execute()` — this protection is not
universal, and treating one blocked variant as proof the underlying
approach is safe would be a real, dangerous mistake.

### CS Lens

This is a distinction between a **narrow, incidental mitigation** (one
specific driver blocking one specific attack shape) and an **actual
fix** (removing the underlying code/data conflation entirely) — the
next unit builds the second kind.

### SE Lens

Relying on this specific protection would mean the actual safety of this
code depends on an implementation detail of one particular database
driver that happens not to be documented as a security guarantee at
all — exactly the kind of fragile, accidental safety this curriculum's
own `LessonContract` warns against trusting, and precisely why the next
unit's fix addresses the root cause rather than this one blocked
symptom.

---

## Concept Unit: The Real Fix

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `query_runner.py`.
- **Change type:** add.
- **Location:** replacing `naive_login`'s approach entirely.

### The New Code

```python
def safe_login(cursor, username, password):
    query = "SELECT username, is_admin FROM users WHERE username = ? AND password = ?"
    cursor.execute(query, (username, password))
    return cursor.fetchall()
```

### Mechanical Walkthrough

Every piece here is a **hard concept reappearing** from the very first
unit's own correctly-shown example: the query text is a fixed, constant
string — no f-string, no concatenation, nothing built from
`username`/`password` at all — with `username` and `password` supplied
entirely separately, as a tuple, for `sqlite3` to bind in as pure data.

### Run it

The identical malicious payload that fully bypassed `naive_login`,
tried again against `safe_login`:

```python
malicious_username = "alice' --"
result = safe_login(cursor, malicious_username, "wrong-password-doesn't-matter")
print("result:", result)
```

```
result: []
```

An empty result — correctly rejected. The database searched for a user
whose username is *literally* the eleven-character string
`"alice' --"`, found no such row (there is no user with a quote and two
dashes in their actual username), and returned nothing. The exact
characters that broke `naive_login` are, to `safe_login`, just an
ordinary, if unusual, string value — never SQL syntax at all.

### CS Lens and SE Lens

Both already fully covered under the first unit's own explanation of the
`?` placeholder — this is that mechanism, now proven directly against
the two real attacks the intervening units demonstrated, rather than
merely asserted to be safe.

---

## Concept Unit: A Small, Real Query Runner

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `query_runner.py`.
- **Change type:** add.
- **Location:** below `safe_login`.

### The New Code

```python
def run_query(cursor, sql_text):
    cursor.execute(sql_text)
    if cursor.description is None:
        return None, None  # not a row-returning statement (e.g. INSERT/CREATE)
    column_names = [description[0] for description in cursor.description]
    rows = cursor.fetchall()
    return column_names, rows


def print_table(column_names, rows):
    if column_names is None:
        print("(no result set)")
        return
    widths = [len(name) for name in column_names]
    for row in rows:
        for index, value in enumerate(row):
            widths[index] = max(widths[index], len(str(value)))

    header = " | ".join(name.ljust(widths[index]) for index, name in enumerate(column_names))
    print(header)
    print("-+-".join("-" * width for width in widths))
    for row in rows:
        print(" | ".join(str(value).ljust(widths[index]) for index, value in enumerate(row)))
```

### Mechanical Walkthrough

- `cursor.description` — **first appearance.** After any `execute()`
  call, this attribute holds metadata about the result columns — a
  sequence of tuples, one per column, whose first element is the column
  name (the only piece this function uses; the rest is reserved by the
  Python DB-API standard for information SQLite doesn't populate). It's
  `None` specifically when the last executed statement doesn't produce
  rows at all (a `CREATE TABLE` or `INSERT`, for instance) — checked
  here so `run_query` can be handed *any* SQL text, not just `SELECT`
  statements, without crashing.
- `[description[0] for description in cursor.description]` — reused
  list comprehension, extracting just the column names.
- `print_table`'s width calculation — reused `max()`, string `.ljust()`
  (left-justify padding, **first appearance** of this specific string
  method), computing each column's needed width from the longest of its
  header or any actual value, so the printed table's columns align
  regardless of content length.

### Run it

```python
column_names, rows = run_query(cursor, "SELECT username, is_admin FROM users ORDER BY username")
print_table(column_names, rows)
```

```
username   | is_admin
-----------+---------
alice      | 0
bob        | 0
root_admin | 1
```

A real, readable, aligned table, built from a real query run against the
same database this lesson has used throughout.

### CS Lens

`cursor.description`'s dual meaning (populated for row-returning
statements, `None` otherwise) is the database driver's own way of
reporting **what kind of statement just ran** without a separate,
explicit "statement type" field — `run_query`'s `None` check is reading
that signal directly rather than trying to parse or guess the statement
type from the SQL text itself.

### SE Lens

Accepting *any* SQL text (rather than only `SELECT` statements) makes
`run_query` genuinely reusable as the core of a general query runner —
but it also means this function inherits every one of this lesson's own
warnings: it does nothing to prevent injection on its own. A caller
building `sql_text` from untrusted input via string formatting would
reproduce this lesson's central mistake immediately; `run_query`
executes whatever it's given, exactly as `cursor.execute()` always has,
and the responsibility for using parameters correctly still belongs
entirely to whoever calls it.

---

## Connect the pieces

One malicious username, `"alice' --"`, followed through the whole
lesson: against `naive_login`'s f-string-built query, it closed the
intended string literal early and turned the rest of the query,
including the real password check, into a SQL comment — a complete
authentication bypass, demonstrated with real output. Against
`safe_login`'s parameterized version — built from the exact same `?`
mechanism the very first, correct example in this lesson already used —
the identical string is treated as pure data from start to finish,
correctly failing to match any real user. `run_query` and `print_table`
then generalize the *safe* pattern into a small, real tool capable of
running and displaying any query — inheriting the responsibility to
keep using `?` parameters, not a license to stop.

## What breaks without this

Already demonstrated three times over, with real, working exploits: a
comment-based payload achieves a full authentication bypass against
`naive_login`; an `OR '1'='1'` payload dumps every row in the table,
including the admin account, with no valid credentials at all; and,
while a stacked `DROP TABLE` payload happens to be blocked by Python's
own `sqlite3` driver specifically, that block is a narrow, incidental
protection, not a reason to trust string-formatted queries in general.

## Definition of done

- [ ] `naive_login` with a `' --` payload logs in as an existing user
      with no correct password.
- [ ] `naive_login` with an `OR '1'='1' --` payload returns every row in
      the table.
- [ ] `safe_login` with the identical payloads returns an empty result
      both times.
- [ ] `run_query` correctly returns `(None, None)` for a non-row-
      returning statement like `CREATE TABLE`, and real column
      names/rows for a `SELECT`.
- [ ] `print_table` renders an aligned table for a real query result.
- [ ] You can explain, without looking back at this lesson, why the
      `; DROP TABLE` variant of the attack failed here specifically,
      and why that shouldn't be treated as general reassurance.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add query_runner.py
  git commit -m "Add SQL query runner with parameterized queries — proved f-string-built queries are exploitable with two real working injections before fixing them with the ? placeholder mechanism"
  ```

## What's next

Every remaining lesson in this track — CSV import (51), backup/migration
(52), the password vault (53), and the CRUD app (54) — builds on this
lesson's `sqlite3` foundation directly, and every one of them must use
this lesson's `?` parameter style for any query touching data that
didn't originate as a fixed string literal in the program's own source
code, with no exceptions carried forward.
