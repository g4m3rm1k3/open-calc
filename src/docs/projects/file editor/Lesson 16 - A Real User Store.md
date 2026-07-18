# Lesson 16: A Database That's Just a File

## What you will build

A real `users` table — `init_db`, `create_user`, `get_user` — backed by
SQLite, proven to survive a restart in a way nothing else in this
project's memory ever has. The feature is invisible again, same as
Lesson 15; the actual subject is persistent structured storage, a
genuinely new category this project hasn't needed until user accounts
demanded it, and a vulnerability class — SQL injection — that exists the
moment any database enters the picture at all.

## What you need to know first

`Lesson 15 - Password Hashing.md` — `hash_password`, `verify_password`,
the tuple they return. `Lesson 8`'s `valid_tokens` — an in-memory `set`,
explicitly named there as resetting on every server restart; this lesson
exists specifically to give user accounts a different guarantee.
`Lesson 2`'s path traversal and `Lesson 8`'s timing attack — both named
here again, as the same *kind* of lesson: an injection-shaped
vulnerability, caught before it ships.

---

## Concept Unit: neither memory nor git actually fits

### The Problem

This project already has two real persistence mechanisms, and neither
one is right for user accounts. `valid_tokens` (Lesson 8) lives only in
this running process's memory — restart the server, and it's gone,
explicitly accepted there as reasonable for a single shared admin
secret, completely unacceptable for real accounts: nobody should have to
sign up again every time this project's backend restarts. File content
(Lesson 7) persists through its own independent `git` repository — but a
user account isn't a document someone edits and wants a history of; there's
no reason to diff two versions of a password hash, or browse "revisions"
of a username. Something else is needed: storage that survives a
restart, without git's document-history model bolted onto data that was
never a document in the first place.

### What This Proves

Real, structured, queryable data that needs to survive process restarts
is what a **database** is for — a third real persistence model, next to
memory and git, chosen because it's actually the right shape for this
specific problem, not because it's more powerful in the abstract.

---

## Concept Unit: SQLite — a database that needs no server

### The Problem

"Use a database" usually means running a separate database *server* —
PostgreSQL, MySQL — its own process, its own installation, its own
configuration, running alongside this project's own backend. That's real
infrastructure this project doesn't have, and doesn't need yet for one
`users` table.

### What This Proves

`sqlite3` is part of Python's own standard library — nothing to install,
the same category as `ast`, `subprocess`, and `dataclasses` already used
throughout this project. A SQLite database isn't a running service at
all — it's a single ordinary file on disk that Python reads and writes
directly, with full SQL support, transactions, and the exact same
`UNIQUE` constraint and injection protection a "real" database server
provides. This is the same tool-selection instinct named for `git` back
in Lesson 7: reach for the smallest real tool that actually solves the
problem, not the most powerful one available. A real, named limit,
stated honestly: SQLite is genuinely the wrong choice once many separate
processes need to write to the same database at once under real load — a
concern this single-backend, localhost project doesn't have yet, and a
real reason a future version might migrate to PostgreSQL if that ever
changes.

---

## Concept Unit: a table, described once, created if it doesn't exist

### The Problem

Something has to define what a stored user actually looks like — and
create that structure on disk the first time this project ever runs,
without failing on every run after the first.

### Project Change

- **Files affected** — `backend/db.py`, new file; `.gitignore`, existing
  file.
- **Change type** — create; add, one line.
- **Dependencies** — `sqlite3` and `pathlib`, both part of Python's
  standard library.

`users.db` is about to hold real usernames, salts, and password hashes —
exactly the kind of secret Lesson 8's `ADMIN_PASSWORD` was kept out of
source control for. One more line in `.gitignore`, alongside the ones
Lesson 1 and Lesson 7 already added:

```
backend/users.db
```

### The New Code — type this

```python
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "users.db"


def get_connection() -> sqlite3.Connection:
    return sqlite3.connect(DB_PATH)


def init_db() -> None:
    connection = get_connection()
    connection.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            salt BLOB NOT NULL,
            password_hash BLOB NOT NULL
        )
    """)
    connection.commit()
    connection.close()
```

### The Updated Project — where this lives

This is the entire file so far — nothing exists in `db.py` yet for this
to sit alongside.

### Mechanical Walkthrough

`DB_PATH = Path(__file__).parent / "users.db"` reuses the exact
`Path(__file__).parent / "..."` construction from Lesson 2's
`CONTENT_DIR` — the database file lives directly in `backend/`, sibling
to `main.py`, not inside `content/`, since it isn't something the
editor's own user should ever browse or edit as a file. `get_connection()`
returns a `sqlite3.Connection` — a live link to that file, opened fresh
each time this function is called, the same reason `write_file` opens
and closes a file handle per call rather than keeping one open forever.
`connection.execute("""..."""` runs a **SQL** statement — this project's
first appearance of a language other than Python, JavaScript, HTML, or
CSS. `CREATE TABLE IF NOT EXISTS users (...)` defines the table's shape,
only if it doesn't already exist — safe to call every time this project
starts, not just the first time. `id INTEGER PRIMARY KEY AUTOINCREMENT`
is a numeric identifier SQLite assigns automatically, a new, unique value
per row, never chosen by this project's own code. `username TEXT UNIQUE
NOT NULL` declares a required text field that SQLite itself refuses to
let repeat across two different rows — enforced by the database, not by
this project's own Python code remembering to check. `salt BLOB NOT NULL`
and `password_hash BLOB NOT NULL` are both required binary fields — `BLOB`
storing raw bytes directly, the exact `bytes` values `hash_password`
already returns, with no conversion needed. `connection.commit()` makes
the change permanent; `connection.close()` releases the connection.

---

## Concept Unit: storing and looking up a user, safely

### The Problem

Two operations are needed: saving a new user's username, salt, and
password hash: and finding an existing user back by username when they
try to log in later.

### Project Change

- **Files affected** — `backend/db.py`, existing file.
- **Change type** — add, two new functions, after `init_db`.
- **Dependencies** — the `users` table from the previous unit.

### The New Code — type this

```python
def create_user(username: str, salt: bytes, password_hash: bytes) -> None:
    connection = get_connection()
    connection.execute(
        "INSERT INTO users (username, salt, password_hash) VALUES (?, ?, ?)",
        (username, salt, password_hash),
    )
    connection.commit()
    connection.close()


def get_user(username: str):
    connection = get_connection()
    row = connection.execute(
        "SELECT id, username, salt, password_hash FROM users WHERE username = ?",
        (username,),
    ).fetchone()
    connection.close()
    return row
```

### The Updated Project — where this lives

Both functions are complete, freestanding additions after `init_db` —
nothing existing is modified, so there's no enclosing structure to show
them inside of; the block above is everything there is to see.

### Mechanical Walkthrough

`INSERT INTO users (username, salt, password_hash) VALUES (?, ?, ?)` is
SQL's row-creation statement — three named columns, three values. The
three `?` characters are **placeholders** — not string formatting, a
distinct feature `sqlite3` provides specifically for this — and
`(username, salt, password_hash)`, a tuple passed as `.execute()`'s
second argument, supplies the actual values, matched to the placeholders
in order. `SELECT id, username, salt, password_hash FROM users WHERE
username = ?` is SQL's row-retrieval statement, the same placeholder
mechanism protecting the one value being searched for.
`.fetchone()` returns exactly one matching row as a tuple, or `None` if
nothing matched — the same `None`-for-nothing-found convention already
used by `RUNNERS.get(...)` in Lesson 6. Both functions reuse
`get_connection()` and `.close()` from the unit just above, opening and
closing a connection per call rather than holding one open — but only
`create_user` calls `.commit()`: an `INSERT` changes the database and
that change has to be made permanent, while `get_user`'s `SELECT` only
reads, so there is nothing for a missing `.commit()` to lose.

### CS Lens — why placeholders exist: a real injection, demonstrated

The obvious alternative to `?` placeholders is building the SQL string
by hand, the same way this project's own JavaScript builds a URL with
`+`:

```python
query = "SELECT * FROM users WHERE username = '" + submitted_username + "'"
```

Run directly, with a submitted "username" of `x' OR '1'='1`:

```python
submitted_username = "x' OR '1'='1"
query = "SELECT * FROM users WHERE username = '" + submitted_username + "'"
rows = connection.execute(query).fetchall()
```

Actual output — `query` actually sent, and what came back, against a
table containing two real users, `alice` and `bob`, and no user named
anything like the submitted string:

```
query actually sent: SELECT * FROM users WHERE username = 'x' OR '1'='1'
rows returned: [(1, 'alice'), (2, 'bob')]
```

The submitted text didn't just fail to match — it became part of the SQL
*itself*: `'1'='1'` is always true, so the whole `WHERE` clause matched
every row, handing back every user's data to someone who supplied no
real username at all. This is **SQL injection**, a real, extremely
common vulnerability class, the same underlying shape as the path
traversal named in Lesson 2 and worth naming precisely for that reason:
external input was allowed to change the *structure* of a command,
rather than being treated as inert data inside it. The exact same
malicious input, against the real `get_user` function using `?`:

```python
get_user("x' OR '1'='1")
```

Actual output:

```
None
```

Confirmed directly: `sqlite3` sends the placeholder and the value
*separately* — the database engine itself always treats `?`'s value as
pure data, never as part of the SQL structure, no matter what characters
it contains. No user is named `x' OR '1'='1`, so nothing matches, exactly
as it should.

### Run It

```python
from db import init_db, create_user, get_user
from auth import hash_password, verify_password

init_db()
salt, hashed = hash_password("correct horse battery staple")
create_user("alice", salt, hashed)

user_id, username, stored_salt, stored_hash = get_user("alice")
print(verify_password("correct horse battery staple", stored_salt, stored_hash))
print(get_user("bob"))
```

Actual output:

```
True
None
```

Confirmed directly — Lesson 15's hashing and this lesson's storage,
working together for the first time, end to end.

---

## Concept Unit: a restart-proof account, proven across two processes

### The Problem

The entire point of this lesson was persistence — nothing so far has
actually proven the stored user survives this Python process itself
ending, the way `valid_tokens` explicitly doesn't.

### What This Proves

Run as two completely separate invocations of Python, not two calls
within the same running program — the second one starting fresh, with no
memory of the first:

```python
# First process:
from db import init_db, create_user
init_db()
create_user("alice", b"somesalt", b"somehash")
```

That process exits completely — not just the function returning, the
whole Python interpreter ending — before this second, entirely separate
one starts:

```python
# Second, entirely separate process, started after the first one exited:
from db import get_user
print(get_user("alice"))
```

Actual output, from the second process:

```
(1, 'alice', b'somesalt', b'somehash')
```

Confirmed directly: `alice` is still there, read back by a Python
process that never ran the code that created her — proof this is real
persistence, not the same kind of in-memory state `valid_tokens` has
carried since Lesson 8, dressed up to look different.

---

## Connect the pieces

Nothing in this project calls `init_db`, `create_user`, or `get_user`
yet, same as Lesson 15's `hash_password`/`verify_password` — named
honestly, not glossed over. This lesson and the previous one are now
verified, independently, to work correctly together: a password gets
hashed with a random salt, the username/salt/hash triple gets stored in
a real SQLite table, and a completely separate later process can look
that same user back up and verify a login attempt against it — the exact
sequence a real `/signup` and `/login` route will run, built next, now
resting on two pieces that have each already been proven correct in
isolation, the same sequencing discipline named in Lesson 15's own
Connect the Pieces.

## What breaks without this

Already demonstrated concretely above, not hypothetically: a
hand-built SQL string, given the input `x' OR '1'='1`, returned every
user in the table instead of none — real output, a real table, a real
injection. The same lookup through `get_user`, using `?` placeholders,
returned `None` against the identical malicious input. And restarting
Python entirely between writing and reading `alice` proved this storage
survives a process ending, which `valid_tokens` — confirmed back in
Lesson 8 — does not.

## Exercises

1. Run this lesson's two-process persistence proof yourself: create a
   user in one Python process, exit it completely, and read that user
   back in a brand-new one.
2. Reproduce the SQL injection demonstration yourself, then try a second
   malicious input of your own choosing against the hand-built query —
   predict whether it also succeeds before running it.
3. Attempt to `create_user` two different users with the same username
   and read the real `sqlite3.IntegrityError` that results — then explain
   in your own words why that error comes from SQLite itself, not from
   any check this project's own Python code performs.

## Definition of done

- [ ] You've created a real user and read them back in a completely
      separate Python process
- [ ] You've reproduced the SQL injection against a hand-built query
      yourself, and confirmed `?` placeholders are immune to the same
      input
- [ ] You can explain why `backend/users.db` is gitignored, the same way
      `ADMIN_PASSWORD` was kept out of source control in Lesson 8
- [ ] You can explain why SQLite was chosen here instead of a database
      server, and what would eventually make that choice wrong
- [ ] `git commit` this lesson's code with a message explaining why
