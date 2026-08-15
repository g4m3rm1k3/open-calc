# Lesson 25: Opening the Same `.db` From Node.js

**What you will build:** the exact, unmodified `pocket_hardware.db`
file — the same one Arc 1 built at the CLI and Arc 2 read and wrote
from Python — opened and queried for the first time from a completely
different language and runtime, with zero conversion step of any kind.

**What you need to know first:** [Lesson 17](lesson-17-connecting-from-python.md)
— `sqlite3.connect`/`execute`/`fetchall`'s own real shape in Python;
this lesson proves the identical real capability exists in Node.js,
against the identical real file.

**Terms introduced in this lesson:** none new — this lesson applies
already-established ideas (a database file, a query, a result set) in a
new language; nothing SQLite-conceptual is new here.

**Objects and methods used:**

**`node:sqlite`'s `DatabaseSync`**
- *What it is:* Node.js's own real, built-in SQLite module (added to
  Node.js core; on some Node versions still gated behind a real
  `--experimental-sqlite` command-line flag — check `node --version`
  and Node's own current release notes if this flag is required on
  your installed version).
- *Implementation:* `new DatabaseSync(path)` opens a real, synchronous
  connection to the file at `path`; `.prepare(sql)` returns a real,
  reusable statement object, with `.all(...params)` running it and
  returning every real row as a plain JavaScript object per row, and
  `.run(...params)` for statements with no rows to return.
- *Its use:* reading `parts` directly from Node.js, with no separate
  package install required on a Node version where it's already
  available.

---

## Concept Unit: The Same File, a Different Language, the Same Real Data

### The Problem

Every real byte of `pocket_hardware.db` was written by SQLite's own
engine — never by Python specifically. Does anything about the file
itself actually depend on Python, or was Arc 2's own `sqlite3` module
just one specific, real *client* of a file that has no real opinion
about which language opens it?

### Introduce the Concept in Isolation

The exact same real question Lesson 04 first asked in SQL, and Lesson
17 first asked in Python, asked a third time, from Node.js:

```js
const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync("pocket_hardware.db");
const rows = db.prepare("SELECT name, price FROM parts WHERE price > ?").all(10);
console.log(rows);
db.close();
```

```
$ node read_parts.js
[
  { name: 'Hammer', price: 12.99 },
  { name: 'Drill', price: 45 },
  { name: 'Level', price: 14.75 }
]
```

The identical real three rows Lesson 04's own CLI query and Lesson 17's
own Python script both already proved — read this time by a Node.js
process that has never run a single line of Python or touched the
`sqlite3` CLI at all. `pocket_hardware.db` itself never changed, was
never exported, and was never converted to any other format — this is
direct, provable proof that a SQLite file's own real format is a
public, language-agnostic contract, not a Python-specific artifact.

### Discard

`read_parts.js` is real, disposable proof of this lesson's own single
point; no real, permanent Node.js code is added to this project — Arc
4's own backend stays in Python throughout this series.

### Mechanical Walkthrough

- `const { DatabaseSync } = require("node:sqlite");` — **(a) first
  appearance**, full treatment above.
- `new DatabaseSync("pocket_hardware.db")` — **(a) first appearance**,
  full treatment above; the real, direct parallel to Python's own
  `sqlite3.connect(...)` (Lesson 17), spelled differently in a
  different language for the identical real operation.
- `.prepare("SELECT name, price FROM parts WHERE price > ?").all(10)` —
  **(a) first appearance** of `.prepare`/`.all` together, full
  treatment above; the SQL string itself and its `?` placeholder — **(b)
  hard concept reappearing**, Lesson 04's own `WHERE price > ...` and
  Lesson 18's own real `?` parameterization, both unchanged in a new
  language.

### CS Lens

This is real, direct proof of a **stable, documented file format**
acting as a genuine interface boundary between processes that share
nothing else at all — no shared memory, no shared language runtime, not
even both processes running at the same real time.

Also recognized in: a `.csv` file readable by Excel, Python, and a
shell script alike, a `.pdf` renderable by entirely different real PDF
libraries in different languages, an `.mp3` file playable by any real
program that implements the real, public MP3 format — every case, real
interoperability purchased by a format's own public specification, not
by every consumer sharing an implementation.

### SE Lens

The real, practical value this lesson exists to prove, beyond
curiosity: choosing SQLite for this project's own data was never a
Python-specific lock-in decision. A real, future tool written in any
other language — a real reporting script, a real second application, a
teammate's own preferred stack — can open `pocket_hardware.db` directly,
today, with no export, no API call to this project's own code, and no
cooperation required from Arc 4's own Python backend at all. The real
tradeoff, honestly named: this also means nothing stops a badly-behaved
external tool from writing directly to the file and bypassing every
real safeguard this series has built in Python (Lesson 18's own safe
parameterization, Lesson 07's own constraints still apply at the SQL
engine level regardless of language — but any *application-level* rule
enforced only in Python code, not in the schema itself, is bypassed
completely by a tool that never runs that Python code at all).

## Connect the pieces

One real file, read successfully by three genuinely different real
clients across this series so far: the `sqlite3` CLI (Arc 1), Python's
own `sqlite3` module (Arc 2), and now Node.js's own `node:sqlite`
module — each one a real, independent implementation of the same
public SQLite file format, each returning the identical real data with
no conversion step between any of them.

## What breaks without this

Attempt to open a file that is real, but genuinely isn't a SQLite
database — reusing Lesson 01's own real `parts.csv`:

```
$ node -e "const { DatabaseSync } = require('node:sqlite'); new DatabaseSync('parts.csv');"
node:internal/errors:...
Error: file is not a database
```

The identical real error family Lesson 01 already proved from the CLI
directly — `node:sqlite` performs the exact same real header check
every other genuine SQLite implementation does, confirming this
project's own file-format contract is enforced consistently, by every
real client, not just the official CLI.

## Exercises

1. Write a real Node.js script that inserts a new real row into `parts`
   using `.prepare(sql).run(...)`, then confirm it independently at the
   real `sqlite3` CLI — direct proof a write from Node.js is exactly as
   real and permanent as one from Python or the CLI.
2. Confirm `node:sqlite` rejects an unparameterized, string-concatenated
   query built from untrusted input the same real way Lesson 18 proved
   for Python — by first reproducing a real, working injection with
   naive string concatenation, then fixing it with a real `?`
   placeholder, entirely in Node.js this time.

## Definition of Done

- [ ] You read real `parts` rows from Node.js and confirmed they match
      Lesson 04 and Lesson 17's own results exactly.
- [ ] You caused the real "file is not a database" error against
      `parts.csv` from Node.js specifically.
- [ ] You completed both exercises.

## Next

[Lesson 26 — Opening the Same `.db` From C#](lesson-26-opening-the-same-db-from-csharp.md)
proves the identical real fact a third time, from a statically-typed
language this time, against the same unmodified file once more.
