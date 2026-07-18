# Lesson 26: Check In, Check Out

## What you will build

A file can now be locked to exactly one user at a time. Checking a file
out records who holds it; only that user can save changes to it while
it's checked out; everyone else can still open and read it, but a save
attempt is refused. Checking it back in releases the lock so someone
else can take it. This is the core of a real request from earlier in
this project: "only allow the user who checked out the file to be
allowed to edit the file, but other users can download and view the
file." The transferable idea is a **database constraint modeling
exclusive ownership** — at most one row can ever claim a given file, and
the database itself, not application logic, is what makes that true.

## What you need to know first

`Lesson 25 - A Token That Remembers Who It Belongs To.md` —
`current_user: str = Depends(require_auth)`, used by every route in
this lesson. `Lesson 16 - Storing Users for Real.md` (or wherever
`sqlite3`, parameterized `?` queries, and `INSERT`/`SELECT` were first
taught) — reused here for a second table. `Lesson 3`'s traversal-safety
check (`.resolve()` + `.is_relative_to(CONTENT_DIR)`), repeated
identically in every route below.

---

## Concept Unit: a table that can only ever agree with itself

### The Problem

Locking a file to one user means the system needs to answer, for any
given path: is it locked, and if so, by whom? That's state that must
survive between requests — one person checks a file out in one HTTP
request, a different person tries to save it in a completely separate
request minutes later — so it can't live in a Python variable the way
`openTabs` does in the browser. It needs to live in the database, next
to `users`.

### Concept Lab

```python
import sqlite3

connection = sqlite3.connect(":memory:")
connection.execute("""
    CREATE TABLE claims (
        item TEXT PRIMARY KEY,
        claimant TEXT NOT NULL
    )
""")
connection.execute("INSERT INTO claims (item, claimant) VALUES (?, ?)", ("axe", "conan"))
connection.commit()

try:
    connection.execute("INSERT INTO claims (item, claimant) VALUES (?, ?)", ("axe", "xena"))
    connection.commit()
except sqlite3.IntegrityError as error:
    print("Rejected:", error)
```

Run it — actual output, this exact run:

```
Rejected: UNIQUE constraint failed: claims.item
```

### What This Proves

`PRIMARY KEY` on `item` — first appearance in this project outside the
`users` table's own `id` — declares that no two rows may share the same
value in that column. `sqlite3.connect(":memory:")` reuses the exact
`sqlite3` module and `.execute()`/`.commit()` calls already used for
`users`, just against a throwaway in-memory database instead of a file,
so nothing here touches the real project. The second `INSERT`, for the
same `item` value `"axe"`, doesn't silently overwrite or silently get
ignored — it raises `sqlite3.IntegrityError`, caught here and printed.
The database itself refuses the conflicting row; nothing in the Python
code had to check "does an axe claim already exist?" before attempting
the second insert — the guarantee comes from the table's own schema,
not from application logic remembering to check.

### Discard

`claims`, `"axe"`, `"conan"`, `"xena"` are deleted now — none of these
names appear in the project. The real table below applies the identical
`PRIMARY KEY` idea to file paths.

---

## Concept Unit: the locks table

### Project Change

- **Files affected** — `backend/db.py`, existing file.
- **Change type** — add, one new `CREATE TABLE` block inside `init_db`.
- **Location** — directly after the existing `users` table's
  `CREATE TABLE IF NOT EXISTS users (...)` block, still inside `init_db`,
  before its closing `connection.commit()`.
- **Dependencies** — none new; reuses `sqlite3`, already imported.

### The New Code — type this

```python
connection.execute("""
    CREATE TABLE IF NOT EXISTS locks (
        path TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        checked_out_at TEXT NOT NULL
    )
""")
```

### The Updated Project — where this lives

`init_db`, in full — the entire second `connection.execute(...)` call is
the new addition, marked with a `diff`-style `+` in the margin rather
than inline comments, since inline comments would land inside the
literal SQL string itself and change what actually gets sent to SQLite:

```diff
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
+     connection.execute("""
+         CREATE TABLE IF NOT EXISTS locks (
+             path TEXT PRIMARY KEY,
+             username TEXT NOT NULL,
+             checked_out_at TEXT NOT NULL
+         )
+     """)
      connection.commit()
      connection.close()
```

`init_db` now creates two tables instead of one, both `IF NOT EXISTS`
(Lesson 16), both created inside the same connection before it commits
and closes — a fresh database file gets `users` and `locks` together,
the very first time this function runs against it.

### Mechanical Walkthrough

`CREATE TABLE IF NOT EXISTS locks (...)` — reappearance of the exact
SQL statement shape from Lesson 16's `users` table; no restatement
needed beyond naming the reuse. `path TEXT PRIMARY KEY` — first
appearance of `PRIMARY KEY` on a column that isn't an autoincrementing
ID: here it's the file's own path, meaning the table structurally
cannot hold two rows for the same path, exactly as this lesson's lab
just demonstrated with `item`. `username TEXT NOT NULL` — reappearance
of `NOT NULL` from the `users` table, requiring every lock row to name
who holds it. `checked_out_at TEXT NOT NULL` — same `NOT NULL`
constraint, storing a timestamp as text, the type SQLite uses for
`datetime()` values.

### CS Lens — a constraint that enforces mutual exclusion

`PRIMARY KEY` here isn't identifying a row for lookup purposes (that's
what it does for `users.id`) — it's being used specifically to make
"at most one lock per file" a fact the database itself guarantees,
rather than a rule the application code has to remember to check every
time. This is **mutual exclusion**: a constraint on shared state
ensuring only one holder can claim a given resource at once.

Also recognized in: a `UNIQUE` constraint on a seat-booking table (one
seat, one booking), a mutex in multithreaded programming (one thread
holds the lock at a time), a DNS record for a domain name (one
authoritative answer per name), a physical library's card-catalog
checkout slip (one slip per book).

### SE Lens — pushing the invariant into the schema, not the code

The alternative would be trusting every route that touches `locks` to
first `SELECT` and check nothing's already there before inserting —
correct as long as every future line of code remembers to do that
check, and wrong the moment one doesn't. Declaring `path` as
`PRIMARY KEY` means the guarantee holds even against code that forgets,
including code not written yet. The cost: any insert that *would*
violate it doesn't fail quietly — it raises `sqlite3.IntegrityError`,
which the next unit's code doesn't yet handle. That gap is this lesson's
own debt, addressed directly in the next lesson.

### Commands needed to make this unit real

None beyond what Lesson 16 already established — `init_db()` runs
automatically on server startup (`backend/main.py`'s
`init_db()` call, present since Lesson 16), creating both tables in
`users.db` the first time it's called against a fresh file.

### Run It

Confirmed against a real running server this session: a fresh
`users.db`, created by starting the server after deleting any existing
one, contains both tables — verified by every checkout/checkin call in
this lesson's later units succeeding against it without a missing-table
error.

---

## Concept Unit: recording and releasing a claim

### The Problem

The `locks` table can hold rows, but nothing yet writes one when a file
is checked out, removes one when it's checked back in, or reads one to
check current status.

### Project Change

- **Files affected** — `backend/db.py`, existing file.
- **Change type** — add, three new functions.
- **Location** — after `get_user`, at the end of the file.
- **Dependencies** — `get_connection` (Lesson 16), the `locks` table
  from this lesson's previous unit.

### The New Code — type this

```python
def checkout_file(path: str, username: str) -> None:
    connection = get_connection()
    connection.execute(
        "INSERT INTO locks (path, username, checked_out_at) VALUES (?, ?, datetime('now'))",
        (path, username),
    )
    connection.commit()
    connection.close()
```

Checking a file back in is the same shape, in reverse — `DELETE`
instead of `INSERT`, first appearance of `DELETE` in this project:

```python
def checkin_file(path: str) -> None:
    connection = get_connection()
    connection.execute("DELETE FROM locks WHERE path = ?", (path,))
    connection.commit()
    connection.close()
```

Reading current status without changing anything reuses `get_user`'s
exact `SELECT ... WHERE ... .fetchone()` shape:

```python
def get_lock(path: str):
    connection = get_connection()
    row = connection.execute(
        "SELECT path, username, checked_out_at FROM locks WHERE path = ?",
        (path,),
    ).fetchone()
    connection.close()
    return row
```

### The Updated Project — where this lives

All three functions are brand-new, freestanding, added one after
another at the end of `backend/db.py`, directly below the existing
`get_user`:

```python
def get_user(username: str):
    connection = get_connection()
    row = connection.execute(
        "SELECT id, username, salt, password_hash FROM users WHERE username = ?",
        (username,),
    ).fetchone()
    connection.close()
    return row


def checkout_file(path: str, username: str) -> None:
    connection = get_connection()
    connection.execute(
        "INSERT INTO locks (path, username, checked_out_at) VALUES (?, ?, datetime('now'))",
        (path, username),
    )
    connection.commit()
    connection.close()


def checkin_file(path: str) -> None:
    connection = get_connection()
    connection.execute("DELETE FROM locks WHERE path = ?", (path,))
    connection.commit()
    connection.close()


def get_lock(path: str):
    connection = get_connection()
    row = connection.execute(
        "SELECT path, username, checked_out_at FROM locks WHERE path = ?",
        (path,),
    ).fetchone()
    connection.close()
    return row
```

`db.py` now offers three operations on `locks`, matching the three
things this feature needs to do: claim a file, release a claim, and
check the current claim without altering it.

### Mechanical Walkthrough

`INSERT INTO locks (path, username, checked_out_at) VALUES (?, ?,
datetime('now'))` — the `?` placeholders and passed-tuple parameter
binding are a direct reapplication of Lesson 16's SQL-injection fix,
now protecting `path` and `username` the same way it already protects
`username` in `create_user`. `datetime('now')` is SQLite's own function
for the current UTC timestamp as text, called from inside the SQL
string itself rather than computed in Python and passed in — first
appearance of a SQL-side function call in this project. `DELETE FROM
locks WHERE path = ?` — first appearance of `DELETE`; like `INSERT` and
`SELECT`, it takes a `WHERE` clause, and without one it would delete
every row in the table, not just the one requested. `get_lock`'s body is
a verbatim structural repeat of `get_user` — a `SELECT`, a
parameterized `WHERE`, `.fetchone()`, close, return — reapplying an
already-taught shape to a new table, no new mechanic.

### CS Lens

No new CS concept in this unit — it's the direct application of
already-taught SQL operations (`INSERT`, `SELECT`, and now `DELETE`) to
a new table.

### SE Lens — three narrow functions instead of one general one

Each function does exactly one thing to exactly one table, mirroring
`create_user`/`get_user`'s existing split rather than folding
checkout/checkin/lookup into one function with a mode flag
(`manage_lock(path, action="checkout")`). The narrow version is easier
to call correctly from `main.py` — each call site states its intent by
which function it calls, not by which flag value it passes — at the
cost of three function definitions instead of one.

### Run It

Not independently runnable yet — nothing in `main.py` calls these three
functions. This unit connects to the next one, where `/checkout` and
`/checkin` routes call them for real.

---

## Concept Unit: routes that check a file out and back in

### The Problem

`checkout_file`, `checkin_file`, and `get_lock` exist, but nothing on
the HTTP surface lets a browser trigger them, and `write_file` itself
still has no idea a lock exists at all — it will happily overwrite any
file for any authenticated user, exactly as it has since Lesson 3.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add two new routes (`/checkout`, `/checkin`);
  modify `write_file`'s existing body.
- **Location** — new routes placed directly after `write_file`
  (Lesson 3, gated in Lesson 8, given `current_user` in Lesson 25);
  `write_file`'s body itself, between the existing traversal/existence
  checks and the `target_file.write_text(...)` call.
- **Dependencies** — `get_lock`, `checkout_file`, `checkin_file`
  (this lesson's previous unit); `current_user` (Lesson 25); the import
  line at the top of `main.py` grows to include all three:
  `from db import init_db, create_user, get_user, checkout_file,
  checkin_file, get_lock`.

### The New Code — type this

`write_file` gains a check between finding the file and writing to it:

```python
lock = get_lock(relative_path)

if lock is None:
    raise HTTPException(status_code=403, detail="File must be checked out before editing")

lock_path, lock_username, checked_out_at = lock
if lock_username != current_user:
    raise HTTPException(status_code=403, detail=f"Checked out by {lock_username}")
```

The new `/checkout` route is a freestanding function, reusing the exact
traversal and existence checks every file-touching route in this
project already uses:

```python
@app.post("/checkout")
def checkout(path: str, current_user: str = Depends(require_auth)):
    target_file = (CONTENT_DIR / path).resolve()

    if not target_file.is_relative_to(CONTENT_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_file.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    relative_path = target_file.relative_to(CONTENT_DIR).as_posix()
    existing_lock = get_lock(relative_path)

    if existing_lock is not None:
        lock_path, lock_username, checked_out_at = existing_lock
        raise HTTPException(status_code=409, detail=f"Already checked out by {lock_username}")

    checkout_file(relative_path, current_user)
    return {"path": path, "checked_out_by": current_user}
```

`/checkin` is the mirror image, releasing instead of claiming:

```python
@app.post("/checkin")
def checkin(path: str, current_user: str = Depends(require_auth)):
    target_file = (CONTENT_DIR / path).resolve()

    if not target_file.is_relative_to(CONTENT_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_file.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    relative_path = target_file.relative_to(CONTENT_DIR).as_posix()
    existing_lock = get_lock(relative_path)

    if existing_lock is None:
        raise HTTPException(status_code=400, detail="File is not checked out")

    lock_path, lock_username, checked_out_at = existing_lock
    if lock_username != current_user:
        raise HTTPException(status_code=403, detail=f"Checked out by {lock_username}")

    checkin_file(relative_path)
    return {"path": path, "checked_in": True}
```

### The Updated Project — where this lives

`write_file`, in full, with the new lines marked:

```python
@app.put("/file")
def write_file(path: str, edit: FileEdit, current_user: str = Depends(require_auth)):
    target_file = (CONTENT_DIR / path).resolve()

    if not target_file.is_relative_to(CONTENT_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_file.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    relative_path = target_file.relative_to(CONTENT_DIR).as_posix()
    lock = get_lock(relative_path)                                             # ← new

    if lock is None:                                                           # ← new
        raise HTTPException(status_code=403, detail="File must be checked out before editing")  # ← new

    lock_path, lock_username, checked_out_at = lock                            # ← new
    if lock_username != current_user:                                         # ← new
        raise HTTPException(status_code=403, detail=f"Checked out by {lock_username}")  # ← new

    target_file.write_text(edit.content, encoding="utf-8")
    commit_change(relative_path, f"Edit {relative_path}")

    return {"path": path, "saved": True}
```

`write_file` now refuses to save at all unless a lock exists and names
`current_user` as its holder — everything after that check, the actual
write and git commit, is exactly the code that has existed since
Lesson 3. `relative_path` moved one line earlier than before, since the
new lock check needs it before the write happens, not after.

### Mechanical Walkthrough

`get_lock(relative_path)` — a call to this lesson's own function,
returning either `None` (no row found, `.fetchone()`'s documented
behavior on no match) or a tuple of the three selected columns.
`lock_path, lock_username, checked_out_at = lock` — tuple unpacking,
already used throughout this project for `get_user`'s return value
(Lesson 16); `lock_path` and `checked_out_at` are unpacked but unused
in this specific check, kept only because Python's tuple unpacking
requires naming every position. `if lock_username != current_user` —
`current_user`, Lesson 25's new capture, compared directly against the
username stored in the lock row: the entire enforcement decision is one
equality check between two strings. `f"Checked out by {lock_username}"`
— an f-string, already used throughout this project, interpolating the
actual holder's name into the error a rejected user sees.

### CS Lens — a guard clause, now checking ownership instead of existence

Every route in this project already guards against invalid paths and
missing files before doing real work (Lesson 2's traversal check,
Lesson 3's existence check) — this unit adds a third guard clause of
the same shape, but checking a different kind of precondition:
*ownership* of a claimed resource, not just its existence. Same
pattern, applied one level deeper.

### SE Lens — read permission stays separate from write permission

`read_file` (`GET /file`, Lesson 3) is completely untouched by this
lesson — it still only requires `dependencies=[Depends(require_auth)]`,
meaning any authenticated user can open and view any file, locked or
not, exactly matching the original request: "other users can download
and view the file." Only `write_file` gained the ownership check. The
alternative — gating reads behind the same lock check as writes — would
have been simpler to write (one check, reused everywhere) but wrong: it
would block a legitimate use this project explicitly wants to support,
a second user reading the current state of a file someone else is
actively editing.

### Run It

Confirmed against a real running server this session, using two
independent user accounts:

```
PUT  /file (no checkout at all)         → 403 File must be checked out before editing
POST /checkout (dana)                    → 200 checked_out_by: dana
PUT  /file (dana, holds the lock)        → 200 saved: true
PUT  /file (erin, does not hold it)      → 403 Checked out by dana
GET  /file (erin, read-only)             → 200 (full file content returned)
POST /checkout (erin, already locked)    → 409 Already checked out by dana
POST /checkin (erin, not the holder)     → 403 Checked out by dana
POST /checkin (dana, releases it)        → 200 checked_in: true
POST /checkout (erin, now available)     → 200 checked_out_by: erin
POST /checkin (erin)                     → 200 checked_in: true
```

Every one of those ten calls matches this lesson's stated rules exactly:
locked files reject writes from anyone but the holder, reads stay open
to everyone, and a released lock becomes available to the next claimant.

---

## Connect the pieces

Dana checks out `src/main.py`: `/checkout` finds no existing lock via
`get_lock`, so it calls `checkout_file`, inserting a row naming dana as
holder. Dana saves an edit: `write_file` calls `get_lock`, finds the
row, confirms `lock_username == current_user`, and proceeds with the
write it's always done since Lesson 3. Erin tries to save the same
file: the identical `get_lock` call in `write_file` finds the same row,
but this time `lock_username != current_user`, so the save is refused
with a `403` naming dana as the actual holder. Erin can still `GET
/file` and read dana's saved content, because `read_file` never checks
`locks` at all. Once dana calls `/checkin`, `checkin_file` deletes the
row, and the next `get_lock` call — from anyone — finds nothing, opening
the file back up.

## What breaks without this

Confirmed by tracing `write_file`'s code directly, and already true of
this exact function before this lesson: without the `get_lock` check
this unit added, `write_file` behaves exactly as it did through
Lesson 24 — any authenticated user can overwrite any file, regardless
of who else might be actively editing it. That's the literal state of
this project one lesson ago; this lesson's checks are what closes it.

## Exercises

1. Check a file out through the real running app, then try to save an
   edit as a *different* logged-in user (open a second browser, or an
   incognito window, and log in as a different account) — confirm the
   save is rejected and the file is still readable.
2. Check a file out, then check it back in, then confirm a different
   user can now check it out successfully.
3. Query `locks` directly with a SQLite browser or `sqlite3` command
   line against `backend/users.db` while a file is checked out — confirm
   the row's `username` and `checked_out_at` match what you expect.
4. Explain, without looking back at this lesson, why `read_file` was
   left completely unmodified by this feature, when `write_file` was
   not.

## Definition of done

- [ ] You've confirmed, through the real running app, that a locked
      file rejects saves from every user except the one who checked it
      out
- [ ] You've confirmed a different user can read (but not save) a file
      someone else has checked out
- [ ] You've confirmed checking a file back in makes it available to
      the next user
- [ ] You can explain what `PRIMARY KEY` on `locks.path` guarantees,
      and why that guarantee matters for this feature specifically
- [ ] You can explain why read access and write access are gated by two
      different checks, not one shared check
- [ ] `git commit` this lesson's code with a message explaining why
