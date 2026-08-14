# Lesson 1: Trusting a File as a Database

**What you will build.** A script that creates a database file, opens a
connection to it, creates one table inside it, and proves — by actually
checking, not by assuming — that the table exists. No tool data yet.

The transferable problem this lesson is really about: SQLite is not a
server you connect to over a network. It is a library that reads and
writes a single file directly. Every operation you perform is a
synchronous round trip against that file, mediated by two objects — a
**Connection** and a **Cursor** — and a boundary called a
**transaction**. That four-step lifecycle (connect → cursor → execute →
commit → close) is the skeleton every later lesson's code sits inside,
including the eventual version where a dozen people on your network each
have their own file and you join them all into one view.

**What you need to know first.** Nothing — this is Lesson 1. Ordinary
Python (variables, function calls, `print`) is assumed.

**Terms introduced**

- **Connection** — an open handle to a SQLite database file, through
  which every command you issue actually travels.
- **Cursor** — an object, created from a Connection, that executes SQL
  statements and lets you read back whatever they return.
- **Transaction** — a group of changes that take effect together, only
  when you explicitly say so (`commit`), or not at all (`rollback`).
- **Schema** — the definition of what tables and columns a database
  contains, independent of the data inside them.

---

## Concept Unit: Connecting to a Database File

### The Problem

Right now you have an empty folder. No database exists, no file exists.
Before you can create a table or store a single tool number, you need a
way to say "open (or create) this specific file, and hand me something I
can issue commands through." That's it — that's the whole problem this
unit solves.

### Introduce the Concept in Isolation

Create a throwaway file, `scratch.py`, anywhere outside your real
project folder:

```python
import sqlite3

conn = sqlite3.connect("scratch.db")
print(type(conn))
conn.close()
```

Run it:

```
$ python scratch.py
<class 'sqlite3.Connection'>
$ ls
scratch.db  scratch.py
```

What this output proves: `sqlite3.connect(path)` did two things in one
call — it created a file named `scratch.db` on disk (it didn't exist
before you ran this), and it handed back a `Connection` object, which is
a real Python object with a type, not a magic string or a file path.
Nothing about your table structure or your data exists yet — this call
only opens (and, if needed, creates) the *file*.

### Discard the Throwaway Example

Delete `scratch.py` and `scratch.db`. Neither will appear again — they
existed only to prove what `connect()` returns and what it does to disk.

### Project Change

- **Reference Source:** No reference counterpart — this is a
  from-scratch addition. It's the first file of your own project, not a
  port of Mastercam's ToolDB.
- **Files affected:** created `create_db.py` (new file). Running it will
  also create `tool_inventory.db` as a side effect — you don't create
  that file yourself; `connect()` does.
- **Change type:** add
- **Location:** n/a — brand-new file, nothing to locate a position
  within.
- **Dependencies:** none beyond Python 3 itself — `sqlite3` ships in the
  standard library, no `pip install` needed.

### The New Code

In your project folder, create `create_db.py`:

```python
import sqlite3

conn = sqlite3.connect("tool_inventory.db")
```

### The Updated Project

This *is* the whole file so far — there's no larger enclosing structure
to return to yet (Project Change already covers this: a brand-new file
has nothing to locate a position within). That's the entire content of
`create_db.py` at this point in the lesson.

### Mechanical Walkthrough

Enumerating every distinct element in the block above, in order:

- `import sqlite3` — brings the standard-library `sqlite3` module into
  scope. Ordinary Python import syntax, already assumed as prior
  knowledge; not re-explained.
- `sqlite3.connect(...)` — **first appearance.** A function on the
  `sqlite3` module. Given a file path, it opens that file as a SQLite
  database if it already exists, or creates a new, empty database file
  at that path if it doesn't. Either way, it returns a `Connection`
  object bound to that file — every future command you run against this
  database goes through that object.
- `"tool_inventory.db"` — a string literal naming the file. Basic,
  already-known syntax; no new concept.
- `conn = ...` — ordinary variable assignment. No new concept.

### Execution Trace

Checking this code against the trigger list (loop, recursion,
short-circuit search, repeated same-kind calls, branch on carried
state): none of those are present. The trace is a linear sequence, not
numbered iterations.

1. The Python interpreter starts and executes `import sqlite3`, loading
   the standard-library module into memory.
2. `sqlite3.connect("tool_inventory.db")` runs. The interpreter checks
   the current directory for a file named `tool_inventory.db`. It does
   not exist yet, so SQLite creates a new, empty file with that name.
3. `connect()` returns a `Connection` object, bound to that file, which
   is assigned to the name `conn`.

### CS Lens

This is the general pattern of **acquiring a handle to a resource**
before you can use it — you don't manipulate the file directly; you go
through an object that manages access to it on your behalf.

Also recognized in: opening a file handle in any language (`open()` in
Python, `fopen` in C), acquiring a network socket, checking out a
connection from a database connection pool, requesting a lock from an
operating system.

### SE Lens

SQLite's design choice here is **embedded, not client/server**. The
alternative not chosen: something like PostgreSQL or MySQL, where you'd
need a separate server process running somewhere, and your `connect()`
call would open a network connection to it instead of a local file.

The tradeoff: SQLite's model needs zero setup — no server to install,
configure, or keep running, which is exactly why it's a reasonable
choice for something like a per-user tool database. The cost you take on
in exchange is that *all* concurrency control has to happen through file
locks on that one file, rather than a server arbitrating between clients
for you. That cost is invisible right now, with one file and one
process — it becomes real and directly relevant the moment more than one
person's script tries to touch the same file at once, which is exactly
the situation your actual project will be in by Lesson 8.

### Commands Needed

- `python create_db.py` — runs the script. Success output is *no* error
  output at all; the only visible effect is a new file appearing in the
  directory listing.

### Run It

```
$ python create_db.py
$ ls
create_db.py  tool_inventory.db
```

No printed output — the file's existence is the proof. (We'll verify
what's *inside* it once there's something to check, in the next unit.)

### Connecting Sentence

With a `Connection` open, the next problem is: a Connection alone can't
run SQL — you need a `Cursor` to actually issue a command through it.

---

## Concept Unit: The Cursor and Creating a Table

### The Problem

You have an open connection to a file, but an empty file isn't a
database with any structure. You need to define a table — name it, name
its columns, and say what kind of data each column holds — before you
can store a single row.

### Introduce the Concept in Isolation

New throwaway file, `scratch.py`:

```python
import sqlite3

conn = sqlite3.connect("scratch.db")
cur = conn.cursor()
print(type(cur))
cur.execute("CREATE TABLE greeting (message TEXT)")
conn.close()
```

Run it:

```
$ python scratch.py
<class 'sqlite3.Cursor'>
```

Then check what actually landed on disk, using the `sqlite3` command-line
tool that ships alongside the Python library:

```
$ sqlite3 scratch.db ".tables"
greeting
```

What this proves: `conn.cursor()` returns a distinct object — a
`Cursor` — separate from the `Connection` itself. It's the Cursor,
not the Connection, that has an `.execute()` method for running SQL.
And `CREATE TABLE` really did take effect: an independent tool
(`sqlite3` the CLI, not your script) can see the `greeting` table sitting
in the file afterward.

### Discard the Throwaway Example

Delete `scratch.py` and `scratch.db`. The `greeting` table was only ever
there to prove that `execute()` changes the file; it will not appear in
your real project.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition;
  `tool_inventory` is your own schema, not a port of an existing one.
- **Files affected:** modified `create_db.py`.
- **Change type:** add (appending two new lines).
- **Location:** at the end of `create_db.py`, directly after the
  `conn = sqlite3.connect(...)` line written in the previous unit.
- **Dependencies:** the `conn` object created in the previous unit.

### The New Code

Add this to `create_db.py`, after the `conn = sqlite3.connect(...)`
line:

```python
cur = conn.cursor()
cur.execute("CREATE TABLE tools (tool_number TEXT PRIMARY KEY)")
```

### The Updated Project

`create_db.py` now reads, in full:

```python
import sqlite3

conn = sqlite3.connect("tool_inventory.db")
cur = conn.cursor()                                                # ← new
cur.execute("CREATE TABLE tools (tool_number TEXT PRIMARY KEY)")   # ← new
```

As a whole, the script now does more than open a file — it opens the
file *and* defines one table's structure inside it: a `tools` table with
a single column, `tool_number`, marked as that table's primary key.

### Mechanical Walkthrough

- `conn.cursor()` — **first appearance.** A method on `Connection` that
  returns a new `Cursor` object, bound to that connection. All SQL
  execution goes through a Cursor, not through the Connection directly.
- `cur.execute(...)` — **first appearance.** A method on `Cursor` that
  sends a string of SQL to SQLite and runs it. Here, the SQL is a
  `CREATE TABLE` statement, so nothing is returned to read back yet —
  `execute()`'s return value only matters when the SQL is a query, which
  isn't until Lesson 4.
- `"CREATE TABLE tools (tool_number TEXT PRIMARY KEY)"` — this is SQL,
  not Python, and it bundles two new SQL-level concepts, per the
  Recursive Concept Extraction Rule:
  - `CREATE TABLE tools (...)` — **first appearance.** Defines a new
    table named `tools` with the column list given in parentheses. This
    is schema definition: it describes structure, not data.
  - `tool_number TEXT PRIMARY KEY` — **first appearance**, and itself two
    ideas riding together: `TEXT` is a column's declared type (SQLite
    calls this a *type affinity* — covered properly in Lesson 2, where
    column types get their own unit; here, treat it as "this column
    holds text"). `PRIMARY KEY` marks `tool_number` as the column that
    uniquely identifies each row — SQLite will reject two rows with the
    same `tool_number`. Both get a fuller treatment in Lesson 2; this
    lesson only needs you to recognize that a table needs at least one
    column and, conventionally, something marking which column is
    unique.

### Execution Trace

Checked against the trigger list: no loop, no recursion, no repeated
same-kind calls, no branch depending on prior state. Linear trace:

1. `conn.cursor()` runs. The `Connection` object creates a new `Cursor`
   object bound to itself and returns it; `cur` now refers to that
   Cursor.
2. `cur.execute("CREATE TABLE tools (tool_number TEXT PRIMARY KEY)")`
   runs. The Cursor sends that exact string to SQLite's SQL engine.
   SQLite parses it, recognizes a `CREATE TABLE` statement, and adds a
   new table definition named `tools`, with one column `tool_number`, to
   the database's internal schema — held in memory, as part of the
   current, not-yet-committed transaction (that boundary is the subject
   of the next unit).

### CS Lens

Separating "the connection to a resource" from "the thing that issues
commands through it" is the same shape as separating a database
connection from a *statement* or *session* object in almost every other
DB-API library (this is in fact a deliberate, standardized pattern —
Python's own PEP 249, the DB-API 2.0 spec, which `sqlite3` implements).

Also recognized in: JDBC's `Connection` vs. `Statement` in Java, a
requests `Session` vs. individual `.get()` calls, a shell process vs. the
individual commands you type into it.

### SE Lens

Why require a separate Cursor at all, instead of letting `Connection`
itself have an `.execute()` method? The real reason: a single Connection
can have *multiple* Cursors open on it at once, each independently
tracking its own position in a result set (relevant once you're
`fetchone()`-ing through rows, starting in Lesson 4). Folding execution
directly into `Connection` would make it impossible to run two queries
"at once" through the same connection without them interfering with each
other's position.

The cost: one extra object to create and remember before you can do
anything. For a one-table, one-script project this feels like ceremony —
but by Lesson 9, iterating a Cursor per attached database while another
stays open is exactly the shape you'll need.

### Commands Needed

- `sqlite3 <file> ".tables"` — the SQLite command-line shell (ships with
  most SQLite installs; if `sqlite3 --version` fails, install it via
  your OS package manager). `.tables` lists every table currently
  defined in the given file. This is how you check "did my `CREATE
  TABLE` actually happen" from outside your Python script — an
  independent witness, not just trusting that no exception was raised.

### Run It

```
$ python create_db.py
$ sqlite3 tool_inventory.db ".tables"

```

Notice: the `.tables` output is *empty* — no `tools` table listed, even
though your script ran with no errors. That's not a mistake in the code
above; it's the exact problem the next unit exists to explain and fix.

### Connecting Sentence

`execute()` changed SQLite's in-memory view of the schema, but nothing
has been written to the file yet — that gap is the transaction boundary,
and closing it is the next unit.

---

## Concept Unit: Committing the Transaction

### The Problem

You just ran the lesson and saw it yourself: `CREATE TABLE` executed
with no error, but `.tables` still showed nothing. SQLite didn't fail —
it did exactly what it's designed to do. Something is missing between
"run a command" and "the file on disk actually reflects it."

### Introduce the Concept in Isolation

New throwaway file, `scratch.py`:

```python
import sqlite3

conn = sqlite3.connect("scratch.db")
cur = conn.cursor()
cur.execute("CREATE TABLE greeting (message TEXT)")
conn.close()
```

Run it, then check from a fresh connection — a second script,
`check.py`:

```python
import sqlite3

conn2 = sqlite3.connect("scratch.db")
cur2 = conn2.cursor()
cur2.execute("SELECT name FROM sqlite_master WHERE type='table'")
print(cur2.fetchall())
conn2.close()
```

```
$ python scratch.py
$ python check.py
[]
```

Empty list. Now add exactly one line — `conn.commit()` — to `scratch.py`,
right before `conn.close()`, delete `scratch.db` so you're starting
clean, and rerun both:

```
$ rm scratch.db
$ python scratch.py
$ python check.py
[('greeting',)]
```

What this proves: the *only* difference between the two runs is the
presence of `conn.commit()`. Without it, `CREATE TABLE` took effect only
inside your script's own in-progress transaction — invisible to anything
else, including a second connection from your own process, and gone
entirely once the connection closed without saving. `commit()` is the
line that actually writes the transaction to the file for good.

### Discard the Throwaway Example

Delete `scratch.py`, `check.py`, and `scratch.db`. None of these
filenames will reappear in your real project.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** modified `create_db.py`.
- **Change type:** add (one line).
- **Location:** directly after the `cur.execute("CREATE TABLE ...")`
  line added in the previous unit.
- **Dependencies:** the open `conn` from the first unit.

### The New Code

Add this to `create_db.py`, after the `cur.execute(...)` line:

```python
conn.commit()
```

### The Updated Project

`create_db.py` now reads, in full:

```python
import sqlite3

conn = sqlite3.connect("tool_inventory.db")
cur = conn.cursor()
cur.execute("CREATE TABLE tools (tool_number TEXT PRIMARY KEY)")
conn.commit()                                                      # ← new
```

As a whole, the script now does three things in sequence: opens (or
creates) the file, defines the `tools` table's structure in that
connection's transaction, and — with this new line — actually saves that
transaction to disk, so it's still there the next time anything opens
this file.

### Mechanical Walkthrough

- `conn.commit()` — **first appearance.** A method on `Connection` that
  ends the current transaction by writing all of its pending changes to
  the database file, permanently. Everything executed on any Cursor tied
  to this Connection since the last commit (or since the connection was
  opened, the first time) becomes durable and visible to any other
  connection that opens the same file afterward.

### Execution Trace

No loop, recursion, repeated calls, or state-dependent branching — linear
trace, continuing from where the previous unit's trace left off:

1. (From the previous unit) `cur.execute("CREATE TABLE ...")` has added
   the `tools` table to the current transaction's in-memory state — not
   yet on disk.
2. `conn.commit()` runs. SQLite writes that pending transaction to
   `tool_inventory.db` on disk and marks it complete. From this point on,
   any connection — including a brand-new one opened by a different
   script — that opens `tool_inventory.db` will see the `tools` table.

### CS Lens

This is the durability half of the **ACID** properties (Atomicity,
Consistency, Isolation, Durability) that transactional databases
guarantee. Specifically: a change isn't considered to have "really
happened" from the outside until it's committed — before that, it's
provisional and can vanish (via `rollback`, covered in Lesson 6, or
simply never being committed at all, as you just saw).

Also recognized in: a text editor that holds unsaved changes in memory
until you hit "save," a shopping cart that isn't a real order until you
confirm checkout, `git commit` itself — changes exist in your working
directory, but aren't part of the project's real history until
committed.

### SE Lens

Why does SQLite require an explicit commit instead of writing every
`execute()` straight to disk immediately? The alternative not chosen —
auto-committing every single statement — would mean there's no way to
group several related changes (say, inserting a tool *and* updating a
count in another table) so that either both happen or neither does. Batch
several statements into one transaction, and a crash or error partway
through leaves the file exactly as it was before you started, not
half-updated.

The cost: it's easy to forget the commit, exactly as this unit just
demonstrated — code that runs with no error at all, and still silently
fails to save. That's not a hypothetical; it's the literal bug you just
watched happen and fixed with one line.

### Commands Needed

None new — `python create_db.py` and `sqlite3 ... ".tables"`, both
introduced already.

### Run It

```
$ rm tool_inventory.db
$ python create_db.py
$ sqlite3 tool_inventory.db ".tables"
tools
```

The `tools` table is now really there — durable, visible to a completely
separate process (the `sqlite3` CLI), not just to the script that
created it.

### Connecting Sentence

The data is committed, but your script never explicitly released the
file — the last piece of this lesson's lifecycle is closing the
connection cleanly.

---

## Concept Unit: Closing the Connection

### The Problem

Your script currently ends right after `conn.commit()`, with `conn`
still open. That's a loose end: an open Connection holds resources (an
open file handle, internal locks) that stay held until something closes
it. Left open across many runs, or across a program that keeps creating
connections without closing them, this is exactly the kind of resource
leak that eventually causes "why can't a second program open this file"
errors — which will matter a great deal once multiple people are opening
the same database.

### Introduce the Concept in Isolation

Throwaway file, `scratch.py`:

```python
import sqlite3

conn = sqlite3.connect("scratch.db")
conn.close()

try:
    conn.execute("CREATE TABLE x (y TEXT)")
except sqlite3.ProgrammingError as e:
    print("Got an error:", e)
```

```
$ python scratch.py
Got an error: Cannot operate on a closed database.
```

What this proves: `close()` doesn't just "tidy up" — it actively
invalidates the Connection. Any attempt to use it afterward is a real
error you can observe, not a silent no-op. Closing is a hard boundary.

### Discard the Throwaway Example

Delete `scratch.py` and `scratch.db`. This deliberately-broken example
exists only to show that a closed connection really is unusable
afterward; it isn't part of your real project.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** modified `create_db.py`.
- **Change type:** add (one line).
- **Location:** at the very end of the file, after `conn.commit()`.
- **Dependencies:** the open `conn` from the first unit.

### The New Code

Add this to the end of `create_db.py`:

```python
conn.close()
```

### The Updated Project

`create_db.py` now reads, in full — this is the complete Lesson 1
result:

```python
import sqlite3

conn = sqlite3.connect("tool_inventory.db")
cur = conn.cursor()
cur.execute("CREATE TABLE tools (tool_number TEXT PRIMARY KEY)")
conn.commit()
conn.close()                                                       # ← new
```

As a whole, the script now completes the full lifecycle cleanly: open a
connection, get a cursor, define a table, save that definition
permanently, and release the connection — leaving nothing open behind
it when the script exits.

### Mechanical Walkthrough

- `conn.close()` — **first appearance.** A method on `Connection` that
  releases the underlying file handle and any resources SQLite is
  holding for this connection. After this call, `conn` can no longer be
  used to execute anything — attempting to do so raises
  `sqlite3.ProgrammingError`, as shown in the isolation lab.

### Execution Trace

No loop, recursion, repeated calls, or state-dependent branching —
linear trace, continuing the sequence:

1. (From the previous unit) the transaction creating `tools` has been
   committed; `tool_inventory.db` on disk now contains that table.
2. `conn.close()` runs. SQLite releases the file handle and any internal
   locks this connection held. `conn` is no longer usable for anything
   further.
3. The script has no more statements, so the Python process exits.

### CS Lens

This is **resource cleanup / releasing a handle** — the closing half of
the same acquire/release pattern introduced with `connect()` at the start
of this lesson. Acquiring and releasing are two ends of the same
lifecycle, and a program that only ever acquires is a program that leaks.

### SE Lens

Why does this matter enough to be its own step, for something as small
as a script that's about to exit anyway (where the OS would reclaim the
handle regardless)? Because this exact script's shape — open, do work,
close — is about to be reused inside a *long-running* program (your
eventual pywebview app), where connections get opened and closed
repeatedly for as long as the program runs, not just once before exit.
Building the habit of explicit `close()` now, while it's low-stakes,
means it's already correct once forgetting it means quietly running out
of file handles over hours of runtime — a much harder bug to notice or
diagnose than the one you just triggered on purpose above.

### Commands Needed

None new.

### Run It

```
$ python create_db.py
$ echo $?
0
```

Exit code `0` confirms the script ran to completion with no unhandled
error — consistent with the connection having closed cleanly.

### Connecting Sentence

Connect, cursor, execute, commit, close — every unit so far is one link
in that chain; the closing section below traces one value through all
five in a row.

---

## Closing

**Connect the pieces.** Follow `"tools"` through the whole lifecycle,
start to finish, in the finished `create_db.py`:

1. `sqlite3.connect("tool_inventory.db")` opens (creating, since it
   didn't exist) the file, returning a `Connection`.
2. `conn.cursor()` returns a `Cursor` bound to that Connection.
3. `cur.execute("CREATE TABLE tools (...)")` adds the `tools` table
   definition to the current, uncommitted transaction.
4. `conn.commit()` writes that transaction to `tool_inventory.db`
   permanently — from this instant, `tools` exists as far as *any*
   connection to this file is concerned, not just this one.
5. `conn.close()` releases the connection. The file itself, with
   `tools` durably inside it, persists on disk regardless.

**What breaks without this.** Comment out `conn.commit()` and rerun,
after deleting `tool_inventory.db` first:

```python
# conn.commit()
```

```
$ rm tool_inventory.db
$ python create_db.py
$ sqlite3 tool_inventory.db ".tables"

```

No error anywhere — the script exits with code `0`, same as before. But
`.tables` shows nothing: the table you defined never made it to disk.
This is the exact failure you already reproduced deliberately in the
Commit unit above, now shown one more time in its final, complete
context. Restore the line:

```python
conn.commit()
```

**Exercises.**

1. Change the table name from `tools` to `inventory` and rerun. Confirm
   with `sqlite3 tool_inventory.db ".tables"` that the name actually
   changed on disk.
2. Add a second `cur.execute("CREATE TABLE ... ")` call for a totally
   different table (any name, any single text column) before the
   `commit()`. Run once, then check `.tables` — confirm *both* tables
   appear, proving one `commit()` can cover more than one statement in
   the same transaction.
3. Delete `tool_inventory.db` and run `create_db.py` twice in a row
   without deleting it between runs. You'll get an error. Read it, and
   figure out — you don't need to fix it yet — what SQLite is objecting
   to. (This is a deliberate preview of a problem Lesson 2 solves
   properly.)

**Definition of done.**

- [ ] `create_db.py` runs with no errors and exits with code `0`.
- [ ] `sqlite3 tool_inventory.db ".tables"` lists `tools`.
- [ ] You reproduced the "no commit, no table" failure yourself and
      understood why it happened, not just read about it.
- [ ] All three exercises above completed.
- [ ] Commit:

  ```
  git add create_db.py
  git commit -m "Create tool_inventory.db with an empty tools table

  Established the connect/cursor/execute/commit/close lifecycle every
  later lesson's code will reuse. Nothing is committed to disk until
  commit() runs — verified this by triggering the failure on purpose."
  ```
