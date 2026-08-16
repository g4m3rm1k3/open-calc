# Lesson 3: Never Build SQL Out of Your Data

**What you will build.** A new script, `seed_tools.py`, that inserts
real tool rows into `tools` — first one, by hand, then several at once —
without ever splicing a Python variable directly into a SQL string.

The transferable problem this lesson is actually about: there's a real
difference between a SQL statement that happens to work on the values
you tested with, and one that's genuinely safe to build from data you
don't fully control. That difference is invisible until the exact moment
it isn't — a value with a stray apostrophe, or a value someone crafted
on purpose.

**What you need to know first.** Lesson 1's connect / cursor / execute /
commit / close lifecycle. Lesson 2's `tools` schema — `id INTEGER
PRIMARY KEY` (auto-assigned), `tool_number`, `description`, `tool_type`
(all `TEXT` affinity), `diameter` (`REAL`), `in_stock` (`INTEGER`) — and
the fact that SQLite won't stop you from putting the wrong shape of
value in a column.

**Terms introduced**

- **Parameter placeholder (`?`)** — a stand-in inside a SQL string that
  tells the database driver "a value belongs here, supplied separately,"
  instead of being woven into the string by Python itself.
- **SQL injection** — a vulnerability where data, spliced directly into
  a SQL string, ends up interpreted as SQL syntax instead of as a plain
  value.
- **Batch insert** — inserting several rows with a single call, instead
  of one `execute()` per row.

---

## Concept Unit: `INSERT INTO` With an Explicit Column List

### The Problem

`tools` has a real shape now, but zero rows in it. You need a way to add
one — naming which columns you're supplying values for, since you're
deliberately *not* supplying `id` (Lesson 2 set that column up to
auto-assign).

### Introduce the Concept in Isolation

Throwaway file `scratch.py`:

```python
import sqlite3

conn = sqlite3.connect("scratch.db")
cur = conn.cursor()
cur.execute("CREATE TABLE demo (id INTEGER PRIMARY KEY, label TEXT)")
cur.execute("INSERT INTO demo (label) VALUES ('first row')")
conn.commit()
conn.close()
```

Verify with the CLI, the same way Lesson 1 verified `CREATE TABLE`:

```
$ python scratch.py
$ sqlite3 scratch.db "SELECT id, label FROM demo"
1|first row
```

What this proves: naming `(label)` explicitly and providing one value
for it worked — `id` was left out entirely and SQLite auto-assigned it
`1`, exactly as Lesson 2 predicted. `INSERT INTO <table> (<columns>)
VALUES (<values>)` only needs to name the columns you're actually
supplying; anything omitted either auto-assigns (like `id` here) or
becomes `NULL`.

### Discard the Throwaway Example

Delete `scratch.py` and `scratch.db`. This `demo`/`label` table won't
reappear.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch, this is
  the first row of your own seed data.
- **Files affected:** created `seed_tools.py`.
- **Change type:** add.
- **Location:** n/a — brand-new file.
- **Dependencies:** `tool_inventory.db` must already exist with the
  `tools` table from Lesson 2 (`python create_db.py`, if you haven't run
  it since the last schema change).

### The New Code

Create `seed_tools.py`:

```python
import sqlite3

conn = sqlite3.connect("tool_inventory.db")
cur = conn.cursor()
cur.execute(
    "INSERT INTO tools (tool_number, description, diameter, tool_type, in_stock) "
    "VALUES ('T-100', '1/2 inch 4-flute endmill', 0.5, 'endmill', 12)"
)
conn.commit()
conn.close()
```

### The Updated Project

This is the whole file so far — brand-new file, nothing larger to return
to yet (Project Change already covers this case).

### Mechanical Walkthrough

- `"INSERT INTO tools (tool_number, description, diameter, tool_type, "`
  `"in_stock) VALUES (...)"` — **first appearance**, and it bundles two
  ideas worth naming separately even though they sit in one statement:
  - `INSERT INTO tools (...)` — names the table and, in parentheses, the
    exact columns being supplied — deliberately every column *except*
    `id`.
  - `VALUES (...)` — one value per named column, in the same order as
    the column list.
- Two adjacent string literals written back to back
  (`"INSERT ... " "VALUES ..."`) — **first appearance** of a small
  Python detail: adjacent string literals with nothing but whitespace
  between them are concatenated automatically at parse time, purely so
  a long statement can be split across lines without `+`.
- `'T-100'`, `'1/2 inch 4-flute endmill'`, `0.5`, `'endmill'`, `12` —
  literal values, basic syntax already known; no new concept.

### Execution Trace

No loop, recursion, repeated same-kind calls, or state-dependent branch
— linear trace:

1. `cur.execute(...)` sends the `INSERT` statement, with its five
   literal values already embedded in the string, to SQLite.
2. SQLite parses it, matches each value to its named column
   (`tool_number` ← `'T-100'`, `description` ← `'1/2 inch 4-flute
   endmill'`, `diameter` ← `0.5`, `tool_type` ← `'endmill'`, `in_stock` ←
   `12`), and — since `id` was omitted — assigns it the next available
   integer, `1`, exactly per Lesson 2's rowid-aliasing behavior.
3. The new row is added to the current transaction, not yet durable.
4. `conn.commit()` writes it to disk permanently.

### CS Lens

Routine syntax — no CS Lens needed for `INSERT` itself; the concept
worth carrying elsewhere is next unit's, not this one's.

### SE Lens

Why name columns explicitly (`INSERT INTO tools (tool_number, ...)`
instead of the shorter `INSERT INTO tools VALUES (...)`, which fills
every column in schema order)? Alternative not chosen: the bare form.
Tradeoff: it's shorter to type, but it silently breaks the moment the
schema changes — add a column to `tools` in a later lesson (Lesson 4's
exercises will, in fact), and every bare `INSERT INTO tools VALUES
(...)` in the codebase either errors on a wrong value count or, worse,
still runs and puts values in the wrong columns. Naming columns
explicitly costs a few extra keystrokes now and survives schema changes
without silently breaking later.

### Commands Needed

None new.

### Run It

```
$ python create_db.py
$ python seed_tools.py
$ sqlite3 tool_inventory.db "SELECT * FROM tools"
1|T-100|1/2 inch 4-flute endmill|0.5|endmill|12
```

### Connecting Sentence

That worked — but every value above was typed by hand, as a literal,
directly into the SQL string. The next tool's description is `won't
fit in the same string safely`, and that's not a contrived example.

---

## Concept Unit: Parameter Placeholders and SQL Injection

### The Problem

Real tool descriptions have apostrophes in them — `"5/8 ball, won't
chip"` is a completely ordinary thing for someone to type. If you try to
build the previous unit's SQL string by mixing in a Python variable the
obvious way — an f-string — that apostrophe breaks the SQL itself, not
just your formatting. And "breaks with an error" isn't even the worst
case.

### Introduce the Concept in Isolation

Throwaway file `scratch.py`:

```python
import sqlite3

conn = sqlite3.connect("scratch.db")
cur = conn.cursor()
cur.execute("CREATE TABLE demo (id INTEGER PRIMARY KEY, label TEXT)")

description = "5/8 ball, won't chip"
cur.execute(f"INSERT INTO demo (label) VALUES ('{description}')")
conn.commit()
conn.close()
```

```
$ python scratch.py
Traceback (most recent call last):
  ...
sqlite3.OperationalError: near "t": syntax error
```

The apostrophe in `won't` closed the SQL string early, and everything
after it — `t chip'` — got interpreted as SQL syntax, which isn't valid,
hence the error. Now see the more dangerous version, where the "value"
is deliberately crafted instead of just containing an ordinary
apostrophe:

```python
import sqlite3

conn = sqlite3.connect("scratch.db")
cur = conn.cursor()
cur.execute("CREATE TABLE demo (id INTEGER PRIMARY KEY, label TEXT)")

description = "x'); DROP TABLE demo; --"
cur.execute(f"INSERT INTO demo (label) VALUES ('{description}')")
conn.commit()

cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
print(cur.fetchall())
conn.close()
```

```
$ rm scratch.db
$ python scratch.py
[]
```

What this proves: that crafted string didn't just fail to insert — it
closed the `VALUES (...)` clause early, ended the `INSERT` statement,
and appended a second statement, `DROP TABLE demo`, which SQLite then
executed as real SQL. The final `SELECT` proves it: the `demo` table
itself is gone. This is **SQL injection** — the f-string didn't just
format text, it let the data control the structure of the SQL being
run.

The fix is to never splice a value into the SQL string at all. Use `?`
as a placeholder in the string, and pass the actual value separately:

```python
import sqlite3

conn = sqlite3.connect("scratch.db")
cur = conn.cursor()
cur.execute("CREATE TABLE demo (id INTEGER PRIMARY KEY, label TEXT)")

description = "x'); DROP TABLE demo; --"
cur.execute("INSERT INTO demo (label) VALUES (?)", (description,))
conn.commit()

cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
print(cur.fetchall())
conn.close()
```

```
$ rm scratch.db
$ python scratch.py
[('demo',)]
```

Same malicious string, same table — but this time `demo` still exists.
The `?` placeholder told SQLite "this is one value, not SQL text," so
the entire string — apostrophes, semicolons, and all — was stored as
plain data in the `label` column, never parsed as SQL at all.

### Discard the Throwaway Example

Delete `scratch.py` and `scratch.db`. None of `demo`, `label`, or the
crafted string reappear in your real project.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch.
- **Files affected:** modified `seed_tools.py`.
- **Change type:** refactor — replace the literal-embedded `INSERT` with
  a parameterized one.
- **Location:** the `cur.execute(...)` call written in the previous
  unit.
- **Dependencies:** none new.

### The New Code

Replace the `cur.execute(...)` call in `seed_tools.py`:

```python
cur.execute(
    "INSERT INTO tools (tool_number, description, diameter, tool_type, in_stock) "
    "VALUES (?, ?, ?, ?, ?)",
    ("T-100", "1/2 inch 4-flute endmill", 0.5, "endmill", 12)
)
```

### The Updated Project

`seed_tools.py` now reads, in full:

```python
import sqlite3

conn = sqlite3.connect("tool_inventory.db")
cur = conn.cursor()
cur.execute(
    "INSERT INTO tools (tool_number, description, diameter, tool_type, in_stock) "
    "VALUES (?, ?, ?, ?, ?)",
    ("T-100", "1/2 inch 4-flute endmill", 0.5, "endmill", 12)
)                                                                # ← changed
conn.commit()
conn.close()
```

As a whole, the script now inserts the exact same row as before, but the
values are no longer part of the SQL text at all — they're handed to
`execute()` as a separate tuple, which is the only change needed to make
this safe for values you don't fully control.

### Mechanical Walkthrough

- `?, ?, ?, ?, ?` — **first appearance.** Five placeholders, one per
  value that will be supplied, in the same order as the column list.
  Each `?` tells SQLite "a value goes here, provided separately" — it is
  never treated as SQL syntax, no matter what it contains.
- `cur.execute(sql, params_tuple)` — **first appearance of this
  two-argument form.** `execute()` (already taught, Lesson 1) gains a
  second, optional argument here: a tuple of values, matched to the
  `?` placeholders in order. SQLite substitutes them safely — the way
  it does that substitution is exactly what protects against the
  injection shown above.
- `("T-100", "1/2 inch 4-flute endmill", 0.5, "endmill", 12)` — an
  ordinary Python tuple; basic syntax, no new concept.

### Execution Trace

No loop/recursion/repeated-call/state-branch — linear:

1. `cur.execute(sql, params)` runs. SQLite parses `sql` first, on its
   own, recognizing five `?` placeholders in the `VALUES` clause — at
   this stage, the SQL's *structure* is already fixed and can't be
   changed by anything in `params`.
2. SQLite then binds each element of `params`, in order, to its
   matching `?`: `"T-100"` → the first placeholder, `"1/2 inch 4-flute
   endmill"` → the second, and so on through `12`.
3. The row is added to the current transaction with `id` auto-assigned,
   same as the previous unit.
4. `conn.commit()` makes it durable.

### CS Lens

SQL injection is one specific case of a broader, hard-earned security
principle: **never let untrusted data be interpreted as code or
control-flow instructions.**

Also recognized in: shell command injection (building a shell command
with string concatenation instead of an argument list), HTML/JS cross-
site scripting (inserting untrusted text into a page without escaping
it), format-string vulnerabilities in C (`printf(user_input)` instead of
`printf("%s", user_input)`), deserializing untrusted data with a format
that can execute arbitrary code (like Python's `pickle`) instead of one
that can only represent plain data (like JSON).

### SE Lens

The alternative not chosen: escape special characters yourself before
building the string (for example, doubling every apostrophe). That's
exactly the kind of defense that looks reasonable and is still
routinely broken in practice — there's always another character or
encoding edge case an ad hoc escaping function misses, and it has to be
gotten right in every single place a query is built. Parameter
placeholders sidestep the whole category of bug: the SQL engine itself
keeps "this is code" and "this is data" strictly separate, by
construction, so there's no escaping logic to get wrong in the first
place. The cost is genuinely small — a `?` and a tuple — which is part
of why there's no good excuse not to use it, starting today, for every
value that isn't a hardcoded literal you wrote yourself.

### Commands Needed

None new.

### Run It

```
$ rm tool_inventory.db
$ python create_db.py
$ python seed_tools.py
$ sqlite3 tool_inventory.db "SELECT * FROM tools"
1|T-100|1/2 inch 4-flute endmill|0.5|endmill|12
```

Same result as the previous unit — the point of this unit wasn't a
different outcome, it was making the same outcome safe to reach from
data you don't control.

### Connecting Sentence

One tool, safely inserted. A real shop has more than one tool — the last
piece of this lesson is adding several at once, without five separate
`execute()` calls.

---

## Concept Unit: Batch Inserts With `executemany`

### The Problem

Seeding one tool at a time means one `cur.execute(...)` call per row.
For five tools, that's five near-identical calls — repetitive, and
exactly the kind of repetition that becomes a real annoyance building
seed data for a whole shop's worth of tools.

### Introduce the Concept in Isolation

Throwaway file `scratch.py`:

```python
import sqlite3

conn = sqlite3.connect("scratch.db")
cur = conn.cursor()
cur.execute("CREATE TABLE demo (id INTEGER PRIMARY KEY, label TEXT)")

rows = [("first",), ("second",), ("third",)]
cur.executemany("INSERT INTO demo (label) VALUES (?)", rows)
conn.commit()

cur.execute("SELECT id, label FROM demo")
print(cur.fetchall())
conn.close()
```

```
$ python scratch.py
[(1, 'first'), (2, 'second'), (3, 'third')]
```

What this proves: one `executemany()` call, given a list of three
one-element tuples, produced three separate rows — with `id` still
auto-assigning correctly for each, in order — without writing three
separate `execute()` calls.

### Discard the Throwaway Example

Delete `scratch.py` and `scratch.db`.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch seed
  data for this project.
- **Files affected:** modified `seed_tools.py`.
- **Change type:** replace — the single `execute()` insert becomes an
  `executemany()` inserting several real tools.
- **Location:** the `cur.execute(...)` call from the previous unit.
- **Dependencies:** none new.

### The New Code

Replace the `cur.execute(...)` call in `seed_tools.py`:

```python
tools_to_add = [
    ("T-100", "1/2 inch 4-flute endmill", 0.5, "endmill", 12),
    ("T-101", "3/8 inch ball nose", 0.375, "ball nose", 8),
    ("T-102", "1/4 inch drill", 0.25, "drill", 20),
]
cur.executemany(
    "INSERT INTO tools (tool_number, description, diameter, tool_type, in_stock) "
    "VALUES (?, ?, ?, ?, ?)",
    tools_to_add
)
```

### The Updated Project

`seed_tools.py` now reads, in full:

```python
import sqlite3

conn = sqlite3.connect("tool_inventory.db")
cur = conn.cursor()
tools_to_add = [                                                # ← new
    ("T-100", "1/2 inch 4-flute endmill", 0.5, "endmill", 12),
    ("T-101", "3/8 inch ball nose", 0.375, "ball nose", 8),
    ("T-102", "1/4 inch drill", 0.25, "drill", 20),
]
cur.executemany(                                                # ← changed
    "INSERT INTO tools (tool_number, description, diameter, tool_type, in_stock) "
    "VALUES (?, ?, ?, ?, ?)",
    tools_to_add
)
conn.commit()
conn.close()
```

As a whole, the script now seeds three real, distinct tools in one call
instead of one — with the same `?`-placeholder safety as the previous
unit, just applied to a list of rows instead of a single tuple.

### Mechanical Walkthrough

- `tools_to_add = [...]` — a Python list of tuples. Basic syntax already
  known (tuples were used in the previous unit); no new concept in the
  data structure itself.
- `cur.executemany(sql, list_of_tuples)` — **first appearance.** A
  method on `Cursor`, sibling to `execute()`, that runs the same
  parameterized SQL once per tuple in the given list, binding each
  tuple's values to the `?` placeholders in turn — equivalent to calling
  `execute()` in a loop, but as a single call.

### Execution Trace

This unit's own code meets the trigger list directly: `executemany`
runs the same statement multiple times, with results (rows created)
accumulating — the same shape as a loop, even with no `for` keyword
visible. Numbered trace:

1. `cur.executemany(sql, tools_to_add)` begins. SQLite parses `sql`
   once, the same way `execute()` did in the previous unit.
2. Tuple 1, `("T-100", "1/2 inch 4-flute endmill", 0.5, "endmill", 12)`,
   is bound to the five `?` placeholders; a row is inserted with `id`
   auto-assigned `1`.
3. Tuple 2, `("T-101", "3/8 inch ball nose", 0.375, "ball nose", 8)`, is
   bound the same way; a row is inserted with `id` auto-assigned `2`.
4. Tuple 3, `("T-102", "1/4 inch drill", 0.25, "drill", 20)`, is bound;
   a row is inserted with `id` auto-assigned `3`.
5. All three inserts are part of the same pending transaction;
   `conn.commit()` writes all three to disk together.

### CS Lens

Routine syntax layered on an already-taught idea (parameterized
`execute`, repeated) — no separate CS Lens needed here; the injection
principle from the previous unit is what actually carries forward, and
it already got its full treatment there.

### SE Lens

Why does `executemany` commit all three rows in one transaction here,
rather than each `INSERT` being its own implicitly-committed unit? Recall
from Lesson 1: nothing is durable until `conn.commit()` runs, regardless
of how many `execute`/`executemany` calls came before it. The
alternative not chosen would be auto-committing each row as it's
inserted — but that would mean a crash partway through seeding (say,
after tool 2 of 3) leaves the database in a half-seeded state, with no
way to tell from the data alone whether seeding finished. Keeping all
three in one transaction means either all three tools exist, or (if
something fails before `commit()`) none of them do — the database never
sits in an in-between state.

### Commands Needed

None new.

### Run It

```
$ rm tool_inventory.db
$ python create_db.py
$ python seed_tools.py
$ sqlite3 tool_inventory.db "SELECT * FROM tools"
1|T-100|1/2 inch 4-flute endmill|0.5|endmill|12
2|T-101|3/8 inch ball nose|0.375|ball nose|8
3|T-102|1/4 inch drill|0.25|drill|20
```

### Connecting Sentence

Three real tools now exist safely in `tool_inventory.db` — the closing
section traces one of them end to end, and the next lesson (Querying
Back) is what will finally let your *Python* code read them back, not
just the CLI.

---

## Closing

**Connect the pieces.** Trace `"T-101"` through the finished
`seed_tools.py`, start to finish:

1. `sqlite3.connect(...)` and `conn.cursor()` open the same connection
   and cursor lifecycle from Lesson 1.
2. `tools_to_add` holds `("T-101", "3/8 inch ball nose", 0.375, "ball
   nose", 8)` as its second tuple.
3. `cur.executemany(sql, tools_to_add)` parses the parameterized
   `INSERT` once, then binds this tuple's five values to its five `?`
   placeholders on its second iteration through the list.
4. SQLite inserts the row, auto-assigning `id = 2` (since `"T-100"` took
   `id = 1` on the first iteration).
5. `conn.commit()` makes all three rows — including this one — durable
   together, as a single transaction.
6. `conn.close()` releases the connection; the CLI's `SELECT * FROM
   tools` confirms all three rows landed exactly as intended.

**What breaks without this.** Reintroduce the f-string version from the
second unit, on purpose, using a real tool description with an
apostrophe in it (`"won't hold size past 0.001"`), and watch it either
crash outright or — worse — silently corrupt the statement, depending on
exactly what the crafted or accidental text contains. You already proved
both outcomes earlier in this lesson; this is the reminder that the fix
(`?` placeholders) isn't optional cleanup, it's the difference between a
script that happens to work on the values you tried and one that's
actually safe.

**Exercises.**

1. Add a fourth tool to `tools_to_add` with a description that contains
   an apostrophe (something like `"5/8 ball, won't chip"`), rerun, and
   confirm via the CLI that it landed with the apostrophe intact.
2. Try to insert a tool with a `diameter` of `"half an inch"` (a string,
   not a number) using your parameterized `INSERT`. It will succeed —
   explain why, in your own words, using what Lesson 2 taught about type
   affinity.
3. Try to insert a *sixth* tool reusing `"T-100"` as the `tool_number`.
   It will also succeed, silently, with two rows sharing the same tool
   number. Note that down — it's the exact gap Lesson 2 flagged and
   deferred, and Lesson 13's `UNIQUE` constraint is what finally closes
   it.

**Definition of done.**

- [ ] `seed_tools.py` runs cleanly and inserts three tools using
      `executemany` with `?` placeholders — no f-strings, no `%`-
      formatting, no string concatenation of values anywhere in the SQL.
- [ ] You personally triggered the SQL injection demo (the `DROP TABLE`
      one) and watched it actually drop a table, then watched the same
      input be handled safely with `?`.
- [ ] All three exercises completed, including writing down your own
      explanation for exercise 2.
- [ ] Commit:

  ```
  git add seed_tools.py
  git commit -m "Seed tool_inventory.db with real tools, safely

  Learned the difference the hard way: an f-string-built INSERT let a
  crafted string DROP a table outright. Switched to ? placeholders,
  which keep SQL structure and data strictly separate regardless of
  what the data contains. Batched three tools with executemany instead
  of three separate execute() calls."
  ```
