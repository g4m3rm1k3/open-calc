# Lesson 01: What a Database Is, and Why SQLite

**What you will build:** nothing shipped yet — this lesson's real,
provable deliverable is a working, verified `sqlite3` command-line
install and a proven, on-disk fact about exactly when a SQLite database
file comes into existence. The transferable problem: every later lesson
in this series assumes you already know what a database actually *is*
(as opposed to a plain data file) and why this specific one — SQLite —
needs no server, no daemon, no install beyond one file, before it can
answer a single question.

**What you need to know first:** nothing. This is Lesson 1 of the whole
series — real programming experience in some language is assumed (per
this series' own [README](README.md)), but zero prior database or SQL
knowledge is assumed anywhere below.

**Terms introduced in this lesson:**
- **Flat file** — data stored as plain text or bytes with no attached
  engine capable of answering a question about it; every question
  requires a bespoke, hand-written scan of the whole file.
- **Database** — structured, persistent data paired with real software
  that can answer structured questions about it without a bespoke script
  per question.
- **DBMS (Database Management System)** — the real software that *is*
  the "engine" half of a database: it stores the data, enforces rules
  about what data is allowed in, and answers queries.
- **SQL (Structured Query Language)** — a declarative language for
  asking a DBMS a question or requesting a change, without writing the
  scan/filter/combine logic yourself.
- **Client-server database** — a DBMS that runs as its own
  always-on background process (a server), reachable only over a network
  protocol, that every consuming application connects *to* rather than
  reads directly (Postgres, MySQL, SQL Server all work this way).
- **Embedded (serverless) database** — a DBMS with no separate server
  process at all: the database *is* a single file, and the DBMS is a
  library linked directly into whatever program opens that file. SQLite
  is this kind.

**Objects and methods used:**

**`sqlite3` (the command-line program)**
- *What it is:* the real, official SQLite command-line shell —
  a standalone executable, not a script or wrapper, built and
  distributed by the SQLite project itself.
- *Implementation:* invoked as `sqlite3 <filename>` from a real
  terminal; with no filename it opens a transient in-memory database
  instead. Drops into an interactive `sqlite>` prompt that accepts both
  real SQL statements (terminated with `;`) and the program's own
  meta-commands (each starting with `.`).
- *Its use:* every SQL statement and every dot-command in this entire
  Arc runs through this one program.

**`.help`**
- *What it is:* a dot-command — one of `sqlite3`'s own built-in
  meta-commands, handled entirely by the CLI program itself, never sent
  to the database engine underneath it.
- *Implementation:* `.help ?-all? ?PATTERN?` — prints a line of
  usage text for every dot-command, or ones matching `PATTERN` if given.
- *Its use:* proves, in this lesson's first lab, that not every
  `sqlite3` command needs a real database file to run.

**`.databases`**
- *What it is:* a dot-command that asks the database engine which
  files are currently attached to this session.
- *Implementation:* `.databases` — prints one line per attached
  database, in the form `name: /full/path r/w`. Every session has at
  least one attachment named `main`, even if that file doesn't exist on
  disk yet.
- *Its use:* the exact command that proves this lesson's central claim
  — asking the engine anything at all, even pure metadata, is enough to
  make the file appear on disk.

**`.tables`**
- *What it is:* a dot-command that lists real tables in the
  currently-open database.
- *Implementation:* `.tables ?PATTERN?` — queries `sqlite_master`
  (this series' own Lesson 16 subject) internally and prints table
  names, or none if there aren't any yet.
- *Its use:* used here only as a second, independent proof of the same
  file-materialization fact `.databases` proves — not yet used for its
  real purpose (this series has no tables until Lesson 02).

---

## Concept Unit: Why a Database at All — the Real Cost of a Flat File

### The Problem

Suppose the data for this series' running project — a small hardware
store's parts inventory — starts life as the simplest possible thing: a
plain text file, one row per part.

### Introduce the Concept in Isolation

```
name,price,qty
Hammer,12.99,4
Wrench,8.50,10
Drill,45.00,2
```

A real, single, plain-text question against it — "which parts cost more
than $10?" — answered with a real, general-purpose text tool (not part
of this curriculum; shown once, purely as evidence, and never used
again):

```
$ grep -E '^[^,]+,[0-9]+\.[0-9]+' parts.csv | awk -F',' '$2+0 > 10'
Hammer,12.99,4
Drill,45.00,2
```

This real command produces the real, correct two-row answer. It also
proves the actual problem: answering it required a hand-written text
scan, tuned specifically to this file's exact column layout, that
understands nothing about "price" as a concept — asking a *second*
question ("which parts have fewer than 5 in stock?") means writing a
*second*, differently-tuned scan from scratch, and asking a question
that spans a second file (a `suppliers.csv`, say) means hand-writing a
join, by hand, in a general-purpose scripting tool never designed for
it. Nothing here is reusable, checked, or general — every new question
is a new bespoke program.

This is called a **flat file**: real, genuine data, with no engine
attached that understands its structure or can answer a question about
it on its own. The alternative — real, structured software that stores
data *and* understands how to answer structured questions about it,
without a bespoke script per question — is called a **database**, and
the real software providing that engine is a **DBMS**: a Database
Management System. The language used to ask it a question is **SQL**
— Structured Query Language — starting for real in Lesson 02.

### Discard

`parts.csv` and the `grep`/`awk` command above are both disposable —
neither is part of this curriculum's own subject matter, and neither
reappears. The *data* they represent (hardware-store parts) is exactly
what Lesson 02 recreates for real, inside an actual database.

### Mechanical Walkthrough

`grep`/`awk` are general Unix text tools, not this lesson's subject —
they don't get the full enumeration treatment reserved for this series'
own material (SQL, SQLite, Python, FastAPI, `pywebview`, jQuery). Stated
briefly, for trust in the real output shown above: `grep -E '...'`
selects lines matching a regular expression (a comma-separated line with
a decimal price), and `awk -F',' '$2+0 > 10'` splits each surviving line
on commas and numerically compares the second field against `10`. The
one fact worth carrying forward is *not* this specific syntax — it's
that this logic is invented fresh, per question, per file, with nothing
underneath it checking correctness or reusing work already done.

### CS Lens

SQL (starting Lesson 02) is a **declarative** language: you state *what*
you want ("rows where price > 10"), not *how* to scan for it — the DBMS
itself decides the how (Lesson 13's query planner). The `grep`/`awk`
line above is the opposite: **imperative** — a manually specified
procedure for finding the answer.

Also recognized in: regular expression engines (the pattern states what
counts as a match, not how to scan for it), CSS selectors (which
elements, not how to walk the DOM to find them), build tools with
declarative targets (Make, CMake), GraphQL (what shape of data, not what
joins/lookups produce it).

### SE Lens

The real design principle here is **separation of concerns**: pushing
"how do I find, filter, and combine data" out of every single
application that needs an answer, and into one shared, purpose-built,
independently-tested engine, instead of re-deriving it inside every
consumer. The alternative genuinely not chosen — hand-rolled
parsing/filtering logic, duplicated across every script, backend, and
report that ever needs to ask a question of this data — has a real,
honest cost: N independent, untested, subtly-different implementations
of "find rows where X," each capable of being wrong in its own way. The
real tradeoff going the other direction: learning SQL's own syntax
before any of this pays off — an upfront cost this series pays across
its next several lessons, in exchange for never hand-writing a scan,
filter, or join again for the rest of it.

## Concept Unit: SQLite Is a Real File on Disk — Materialized Only When Actually Needed

### The Problem

"Embedded" and "serverless" are terms, not proof. What does either
one actually *mean*, concretely, in terms of what appears on disk and
when?

### Introduce the Concept in Isolation

Three real, disposable database filenames, each asked a different real
first question, each checked against the real filesystem immediately
after:

```
$ sqlite3 probe-a.db
sqlite> .help
[... real usage text for every dot-command ...]
sqlite> .quit
```

```
$ ls probe-a.db
ls: cannot access 'probe-a.db': No such file or directory
```

`.help` is answered entirely by the `sqlite3` program itself — it never
asks the database engine anything — and no file appeared.

```
$ sqlite3 probe-b.db
sqlite> .databases
main: /full/path/probe-b.db r/w
sqlite> .quit
```

```
$ ls -la probe-b.db
-rw-r--r-- 1 g4m3r 197610 0 Aug 14 20:38 probe-b.db
```

`.databases` *does* ask the engine something — "which files are you
holding open?" — even though the answer involves no table, no row, not
one byte of real content. That's enough: the file now exists, real and
empty, **zero bytes**, confirmed by `ls -la`'s own `0` in the size
column.

```
$ sqlite3 probe-c.db "CREATE TABLE probe (x INTEGER);"
```

(`CREATE TABLE`'s own real syntax and meaning is Lesson 02's whole
subject — used here only as the smallest possible real *write*, to
complete this proof.)

```
$ ls -la probe-c.db
-rw-r--r-- 1 g4m3r 197610 8192 Aug 14 20:39 probe-c.db
$ xxd probe-c.db | head -2
00000000: 5351 4c69 7465 2066 6f72 6d61 7420 3300  SQLite format 3.
00000010: 1000 0101 0040 2020 0000 0001 0000 0002  .....@  ........
```

Now the file is a real 8192 bytes — one full database page — and its
first 16 bytes spell out the literal ASCII text `SQLite format 3\0`, the
real, documented magic header every genuine SQLite file starts with.

This three-step real result — nothing, then an empty real file, then a
real file with actual content — proves the concrete meaning of
**embedded (serverless)**: there is no separate server process anywhere
in this sequence, no daemon to start, no network handshake, no
authentication step. The database *is* the file, the file is created
lazily by the exact same program reading and writing it, and its
existence and size are both directly, honestly inspectable with
ordinary filesystem tools — nothing hidden behind a process boundary.

### Discard

`probe-a.db`, `probe-b.db`, and `probe-c.db` are all disposable scratch
files, deleted now. None of the three carries into this series' real
project.

### Mechanical Walkthrough

- `sqlite3 probe-a.db` — **(a) first appearance**, real usage. Launches
  the real `sqlite3` program, telling it which filename this session is
  associated with — not yet a guarantee that file exists.
- `.help` — **(a) first appearance.** A dot-command, handled entirely
  inside the CLI program, that never reaches the database engine at
  all — the reason it leaves no trace on disk.
- `.quit` — **(a) first appearance.** Ends the interactive session; like
  `.help`, handled by the CLI itself.
- `.databases` — **(a) first appearance.** Unlike `.help`, this
  dot-command's answer ("which files are attached?") requires asking the
  actual database engine, not just the CLI shell around it — the exact
  reason it, and not `.help`, causes the file to appear.
- `CREATE TABLE probe (x INTEGER);` — **(a) first appearance of SQL
  itself in this series**, deliberately given only enough treatment to
  prove today's specific claim ("a real write occurred"); its actual
  syntax, its column-type rules, and SQLite's own distinctive type
  affinity are Lesson 02's dedicated subject, not this one's.
- `xxd probe-c.db` — not part of this curriculum (a generic hex-dump
  utility); shown once as direct, inspectable proof of the real magic
  header, never used again.

### CS Lens

This is **lazy initialization**: deferring real, costly work (creating
and formatting persistent storage) until the moment it's actually
needed, rather than eagerly doing it up front.

Also recognized in: the lazy singleton pattern (an object built on first
use, not at program start), Python generators (values computed only as
each one is requested), operating-system demand paging (a page of memory
mapped in only when first touched), copy-on-write process forking (a
memory page duplicated only the instant either process writes to it).

### SE Lens

This is the concrete, on-disk meaning of the real design decision named
in this lesson's Header: SQLite is **embedded**, not **client-server**.
The alternative genuinely not chosen here — Postgres, MySQL, SQL Server
— requires an always-running background server process, a real network
protocol, and a real authentication handshake, all of which exist and
must succeed *before* the very first query can run, regardless of how
trivial that query is. SQLite's alternative removes every one of those
steps — no process to start, no port to bind, no credentials to check —
at a real, honest cost this series is not going to hide: a client-server
database can safely arbitrate many processes writing at once because one
central server process owns all the coordination; SQLite, with no server
to do that job, has real, load-bearing limits on concurrent writers —
the actual subject of this series' own Lesson 50, once this project has
two real processes (Arc 4's backend, and something else) both wanting to
write to the same file.

## Connect the pieces

Two proofs, same underlying fact from two different angles. First: a
flat file (`parts.csv`) holds real data but answers nothing about
itself — every question is a new bespoke script, which is exactly the
gap a **database** and its **DBMS** exist to close. Second: SQLite's own
`.db` file is not created the instant you *open* it, or even the
instant you ask it a question that touches no data — the real file
proven above stayed completely absent through `.help`, appeared empty
at `.databases`, and only became a real, structured 8192-byte SQLite
file the instant real content (`CREATE TABLE`) was written to it. Both
proofs point at the same place Lesson 02 starts for real: an empty
`pocket_hardware.db`, about to get this series' first real table.

## What breaks without this

Point the real `sqlite3` CLI at a file that is real, exists, and holds
real data — but isn't a SQLite database at all: this lesson's own
`parts.csv`.

```
$ sqlite3 parts.csv ".tables"
Error: file is not a database
```

```
$ sqlite3 parts.csv "SELECT * FROM sqlite_master;"
Error: in prepare, file is not a database (26)
```

Both real, genuine errors — not "file not found," since the file
genuinely exists and genuinely has bytes in it. SQLite checks the
opened file's actual header bytes (the same `SQLite format 3\0` magic
text proven above) before trusting it as a real database at all, and
`parts.csv`'s real header is plain CSV text, not that. The second
error even names its own internal SQLite result code, `26`, which is
the real, documented `SQLITE_NOTADB` constant. This is direct, provable
proof that a `.db` extension is a human convention only — SQLite trusts
the file's real bytes, never its name.

## Exercises

1. Reproduce this lesson's three-tier proof yourself, using three new
   scratch filenames of your own choosing: confirm `.help` alone leaves
   no file, confirm `.databases` alone produces a real but 0-byte file,
   and confirm a real `CREATE TABLE` statement grows that file to a real
   8192 bytes with the real `SQLite format 3` header at the start.
2. Pick any real, non-SQLite file already on your machine (a `.txt`, a
   `.png`, anything) and run `sqlite3 <that file> ".tables"` against it.
   Confirm you get the same real `Error: file is not a database` this
   lesson's own closing section proved against `parts.csv` — regardless
   of that file's real extension.

## Definition of Done

- [ ] You ran `sqlite3 --version` yourself and confirmed a real SQLite
      CLI is installed and runnable.
- [ ] You reproduced the flat-file problem: a real multi-row data file,
      answered with a hand-written, single-purpose scan that generalizes
      to nothing else.
- [ ] You reproduced this lesson's three-tier file-materialization
      proof and can state, from memory, which real dot-command causes
      the jump from "no file" to "empty file."
- [ ] You caused the real `Error: file is not a database` failure
      yourself and understood why SQLite reports this instead of a
      generic "cannot read file" error.
- [ ] You completed both exercises.

## Next

[Lesson 02 — `CREATE TABLE` and SQLite's Type Affinity](lesson-02-create-table-and-type-affinity.md)
gives `CREATE TABLE` — used above only to prove a file-write occurred —
its own full, real treatment: this series' actual first table, and
SQLite's own genuinely distinctive departure from how most other
databases handle column types.
