# Lesson 18: Parameterized Queries and SQL Injection

**What you will build:** a real, working attack against Lesson 17's own
`execute` pattern — a single crafted string that makes a "find one part
by name" query return every real row in the table instead — and the
real, one-argument fix that closes it completely.

**What you need to know first:** [Lesson 17](lesson-17-connecting-from-python.md)
— `cur.execute()`'s own basic shape, used correctly there with hardcoded
SQL strings; this lesson proves what changes the instant part of that
string comes from outside the program.

**Terms introduced in this lesson:**
- **SQL injection** — a real, named vulnerability class: untrusted text,
  concatenated directly into a SQL string, that an attacker can shape to
  change the query's own real meaning rather than merely supplying a
  value inside it.
- **Parameterized query** — a real, structurally different way to
  combine SQL with a value: the value is passed *separately* from the
  SQL text, never concatenated into it at all, closing injection off at
  the mechanism level rather than by filtering input.

**Objects and methods used:**

**`Cursor.execute()` (parameterized form)**
- *What it is:* the identical real method from Lesson 17, used here
  with its second, optional real argument for the first time.
- *Implementation:* `cur.execute(sql_with_placeholders, values_tuple)` —
  every literal `?` in `sql_with_placeholders` is bound, positionally,
  to the matching element of `values_tuple`, by the real SQLite driver
  itself, never by Python string formatting.
- *Its use:* the real, permanent fix this lesson's own second unit
  proves closes the exact vulnerability its first unit opens.

---

## Concept Unit: A Real, Working Injection Attack

### The Problem

Lesson 17's own `execute` calls all used fixed, hardcoded SQL strings.
A real "search parts by name" feature (Arc 4's own backend, genuinely,
soon) has to accept a real name from *outside* the program — typed by
a real user — and combine it with a query. Is combining trusted SQL
text with untrusted external text as simple as it looks?

### Introduce the Concept in Isolation

The naive, real way most tutorials first show this — and the real,
working attack it enables:

```python
import sqlite3

conn = sqlite3.connect("pocket_hardware.db")
cur = conn.cursor()

user_input = "Hammer' OR '1'='1"
query = f"SELECT name, price FROM parts WHERE name = '{user_input}'"
print(query)
cur.execute(query)
print(cur.fetchall())
```

```
$ python inject.py
SELECT name, price FROM parts WHERE name = 'Hammer' OR '1'='1'
[('Hammer', 12.99), ('Wrench', 8.5), ('Drill', 45.0), ('Tape Measure', 6.25), ('Level', 14.75), ('Screwdriver Set', 19.99), ('Chisel', 9.99), ('Stud Finder', 24.99)]
```

Every single real row in `parts` — not just `Hammer` — came back. The
printed `query` line shows exactly why: Python's own f-string spliced
`user_input` directly into the SQL text, and the attacker-supplied
`' OR '1'='1` closed the intended string literal early (the first real
`'`), then added a real, always-true condition (`'1'='1'`, genuine SQL,
not data) that `OR`s against the original `WHERE`. The database has no
way to tell the difference between "SQL the programmer wrote" and "text
an attacker shaped to look like SQL" — by the time `execute` sees it,
both are just one, single, ordinary string.

A real, further proof — attempting to also destroy data, not just leak
it:

```python
user_input = "x'; DROP TABLE parts; --"
query = f"SELECT name, price FROM parts WHERE name = '{user_input}'"
cur.execute(query)
```

```
sqlite3.ProgrammingError: You can only execute one statement at a time.
```

This specific, further attack genuinely fails — a real, honest nuance
worth knowing precisely: Python's own `sqlite3.Cursor.execute()`
refuses, by design, to run more than one real SQL statement in a single
call, so a semicolon-separated second statement like `DROP TABLE parts`
never actually executes here. **This is not the fix, and this lesson is
not relying on it as one** — the first attack above, which stays inside
a single statement, already leaked every real row with no error at all;
a different real driver, or Python's own `executescript()` used
carelessly, would not stop the second attack either.

### Discard

`inject.py`, `user_input`, and the crafted strings above are real,
disposable proof — deleted now, never a real part of this project's
own code.

### Mechanical Walkthrough

- `user_input = "Hammer' OR '1'='1"` — **(c) already basic**, an
  ordinary Python string literal; its *content*, not its syntax, is
  this unit's entire point.
- `query = f"SELECT name, price FROM parts WHERE name = '{user_input}'"`
  — **(a) first appearance** of the real, dangerous pattern: an
  f-string (already-known Python syntax) splicing untrusted text
  directly into a SQL string — new specifically as a *named, recognized
  anti-pattern*, not as new syntax.
- `cur.execute(query)` — **(b) hard concept reappearing**, Lesson 17's
  own `execute`, unchanged; the vulnerability lives entirely in what
  string was built before this line, not in `execute` itself.

### CS Lens

SQL injection is the database-specific instance of a real, general
vulnerability class: **failing to separate code from data**. The
database engine parses a SQL string expecting it to be entirely code
(or entirely data, inside a string literal) — and once untrusted text
is concatenated directly into that string, the boundary between "code
the programmer wrote" and "data a user supplied" has genuinely
collapsed, and the parser cannot recover it.

Also recognized in: cross-site scripting/XSS (untrusted text rendered
directly as HTML, letting an attacker inject real `<script>` tags), OS
command injection (untrusted text concatenated into a shell command),
`eval()` on untrusted text in any language — every case, the identical
underlying failure: treating data as if it were trusted code, at the
exact point a parser can no longer tell them apart.

### SE Lens

The real alternative that does **not** actually fix this — commonly
attempted, genuinely insufficient — is *filtering* or *escaping*
dangerous characters (stripping `'`, blocking the word `OR`) before
concatenating. That approach has a real, honest cost: it requires
correctly anticipating every real way SQL syntax can be abused, in
every real context the value might end up in, forever — a real,
open-ended list an attacker only has to find one gap in. This lesson's
own next unit takes the structurally different approach instead:
removing string concatenation from the picture entirely.

## Concept Unit: Parameterized Queries — Closing the Gap Structurally

### The Problem

Filtering dangerous characters is real, ongoing, losable work. Is there
a way to accept the exact same untrusted `user_input` and make the
*mechanism itself* safe, rather than trying to sanitize every possible
value?

### Introduce the Concept in Isolation

The identical real attack string, against the fixed real form:

```python
import sqlite3

conn = sqlite3.connect("pocket_hardware.db")
cur = conn.cursor()

user_input = "Hammer' OR '1'='1"
cur.execute("SELECT name, price FROM parts WHERE name = ?", (user_input,))
print(cur.fetchall())
```

```
$ python safe.py
[]
```

A real, empty result — not every row, not an error, not a leak. `?` is
a real, literal placeholder; the tuple `(user_input,)` is passed to
`execute` as a genuinely separate, second argument, never concatenated
into the SQL string at all. SQLite's own real driver binds
`user_input`'s entire, exact text — `Hammer' OR '1'='1`, quote
characters and all — as one single, literal value to compare `name`
against. No real row in `parts` has that exact, bizarre string as its
`name`, so the query correctly, safely returns nothing — proof the
attacker's own text was treated as inert data, never as SQL syntax at
all.

### Discard

Nothing throwaway — `?`-parameterized `execute` calls are this
project's real, permanent, only-acceptable way to combine SQL with any
value that didn't originate as a fixed literal in the program's own
source code, starting now and enforced for the rest of this series.

### Mechanical Walkthrough

- `cur.execute("SELECT name, price FROM parts WHERE name = ?", (user_input,))`
  — **(a) first appearance** of `execute`'s real, two-argument
  parameterized form, full treatment above. `?` inside the SQL string
  — **(a) first appearance** of a real positional placeholder. `(user_input,)`
  — **(c) already basic**, an ordinary one-element Python tuple (the
  trailing comma is required syntax for a real one-element tuple, not
  new to this lesson).

### CS Lens

A parameterized query is a real, direct instance of **separating code
from data** — the exact fix this lesson's own CS Lens above named as
the missing piece: the SQL text (code) is fixed, known, and trusted at
the moment the program was written; the value (data) travels through an
entirely separate channel, and the database driver itself — not string
concatenation — is responsible for combining them safely.

### SE Lens

The real, honest cost of this fix: essentially none, once known —
every `execute` call in this lesson's own safe version is no more
verbose than the vulnerable one, and often shorter, since no manual
escaping code is ever needed. This is the real reason parameterized
queries are treated, industry-wide, as a hard requirement rather than a
best practice to weigh against alternatives: the fix is free, and the
failure mode it prevents (this lesson's own first unit, a real, working
data leak from a five-line script) is severe. Every dynamic query in
this project's own Arc 4 backend — starting the moment a real HTTP
request supplies a search term, a filter value, or an ID — uses this
exact `?`-placeholder form, unconditionally, with no exception carved
out for "this one value feels safe."

## Connect the pieces

One real string, `Hammer' OR '1'='1`, used identically twice: spliced
directly into SQL text with an f-string, it leaked every real row in
`parts` — proof that combining trusted SQL and untrusted text by
concatenation genuinely breaks the query's own intended meaning. Passed
instead through `execute`'s own second, parameterized argument, the
exact same string was treated as one inert value, correctly matching
nothing — proof the fix isn't filtering the *value*, it's changing the
*mechanism* that combines it with SQL at all.

## What breaks without this

Reuse `sqlite3.connect`'s own default configuration and attempt a
second real statement inside one `execute` call, deliberately, to
confirm this lesson's own earlier claim rather than take it on faith:

```
$ python -c "import sqlite3; sqlite3.connect('pocket_hardware.db').execute('SELECT 1; SELECT 2;')"
sqlite3.ProgrammingError: You can only execute one statement at a time.
```

A real, genuine rejection — confirmed directly, not assumed — of any
`execute` call containing more than one real statement, regardless of
whether either half came from untrusted input. Restated plainly, since
this is easy to misread as "so injection is already prevented": this
protection only blocks *stacking a second statement* — it does nothing
at all to stop this lesson's own first, real attack, which stayed
entirely inside one single `SELECT` and still leaked every row. Relying
on this behavior as an injection defense, rather than on real
parameterized queries, would be a real, serious mistake.

## Exercises

1. Reproduce this lesson's own real `OR '1'='1'` leak yourself, then
   fix the exact same script using a `?` placeholder, and confirm the
   fixed version correctly returns zero rows for that same malicious
   input.
2. Craft a *different* real injection string — one that doesn't use
   `OR`, but instead comments out the rest of the original query with
   SQL's own `--` line-comment syntax (real, valid SQL, first
   encountered here) — and prove it also succeeds against the
   vulnerable f-string version and fails safely against the
   parameterized one.

## Definition of Done

- [ ] You reproduced the real `OR '1'='1'` attack and saw every row in
      `parts` leak from a query meant to match exactly one.
- [ ] You confirmed the real stacked-statement attempt fails on its
      own, and can explain precisely why that fact alone does not make
      string-concatenated SQL safe.
- [ ] You fixed the vulnerable query with a `?` placeholder and
      confirmed the identical malicious input now safely matches
      nothing.
- [ ] You completed both exercises.

## Next

[Lesson 19 — `sqlite3.Row` and Dict-Like Access](lesson-19-sqlite3-row-and-dict-like-access.md)
fixes a real, separate, non-security awkwardness Lesson 17 left
behind: reading a column by its numeric tuple position instead of its
real name.
