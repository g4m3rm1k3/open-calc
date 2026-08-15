# Lesson 54: Encryption Overview

**What you will build:** nothing new in this project's own real code —
this lesson is a deliberately lighter, honest overview: direct,
re-confirmed proof that `pocket_hardware.db` is genuinely,
currently readable by anyone with file access, what SQLCipher (a real,
genuine tool that changes that) actually does and does not protect, and
why this series' own real project doesn't use it.

**What you need to know first:** [Lesson 01](lesson-01-what-a-database-is-and-why-sqlite.md)
— its own real hex dump of `SQLite format 3`, reused directly as this
lesson's own opening proof.

**Terms introduced in this lesson:**
- **SQLCipher** — a real, open-source extension of SQLite adding
  transparent, full-database AES-256 encryption at rest — a genuinely
  separate project and package from the standard `sqlite3` module this
  entire series has used throughout.
- **Encryption at rest** — protecting real, stored data from anyone who
  can read the raw file bytes directly, without going through the
  database engine's own real, normal access path at all.

**Objects and methods used:** none — this lesson is a real,
conceptual overview; SQLCipher itself is deliberately not installed or
used in this project's own real code.

---

## Concept Unit: `pocket_hardware.db` Is Genuinely, Currently Plaintext

### The Problem

Every real password, business rule, and safeguard this series has
built — Lesson 18's own SQL injection defense, Lesson 30's own
validation, Lesson 36's own CORS policy — protects this project's data
*through* its own real, intended access paths: the CLI, the Python
`sqlite3` module, Arc 4's own HTTP API. None of them protect the real,
raw file itself from someone who can simply read it directly.

### Introduce the Concept in Isolation

The identical real proof Lesson 01 already ran, reconfirmed directly:

```
$ xxd pocket_hardware.db | head -2
00000000: 5351 4c69 7465 2066 6f72 6d61 7420 3300  SQLite format 3.
00000010: 1000 0101 0040 2020 0000 0001 0000 0002  .....@  ........
```

The real, literal text `SQLite format 3` — and, deeper in the same
real file, every real row this project has ever written, including
`suppliers.email` and every other value this series has never treated
as secret but also never explicitly protected — sits in the file as
genuinely readable bytes. Anyone with real, direct read access to this
file — a stolen laptop, a misconfigured backup left somewhere public, a
real, compromised account with filesystem access — can open it with
the ordinary `sqlite3` CLI, no password, no key, nothing beyond Lesson
01's own original `sqlite3 pocket_hardware.db` command, and read every
real row directly.

### Discard

Nothing throwaway — this is a real, current, honest fact about this
project's own live database, not a hypothetical.

### Mechanical Walkthrough

Not applicable — this unit re-confirms an already-explained real fact
(Lesson 01's own hex dump) rather than introducing new syntax.

### CS Lens

This is the real, concrete meaning of **plaintext storage**: data
whose own on-disk representation requires no real secret at all to
read — the direct opposite of what real encryption at rest provides.

### SE Lens

The real, honest reason this fact matters, stated plainly: every real
safeguard this series has built lives at the *application* or *API*
layer — a real, correct, necessary layer, and also a genuinely
different one from *storage*. A real attacker who never goes through
Arc 4's own backend at all, and instead reads `pocket_hardware.db`
directly off disk, bypasses every one of this series' own real
defenses simultaneously, because none of them were ever designed to
operate at the storage layer in the first place.

## Concept Unit: What SQLCipher Changes — and What It Doesn't

### The Problem

A real, genuine tool exists specifically to close the exact gap this
lesson's first unit just proved. What does it actually do, and what
does it leave unsolved?

### Introduce the Concept in Isolation

SQLCipher, a real, separate, open-source project (not part of the
standard `sqlite3` module or the standard SQLite distribution this
entire series has used), adds real, transparent AES-256 encryption to
every page of a database file. Its own real, standard usage pattern,
described here rather than run (this project's own real code
deliberately never installs it):

```python
import sqlcipher3  # a real, separate package — not the standard library sqlite3

conn = sqlcipher3.connect("encrypted.db")
conn.execute("PRAGMA key = 'a-real-secret-passphrase'")
conn.execute("CREATE TABLE parts (id INTEGER PRIMARY KEY, name TEXT)")
```

The real, resulting file, opened with an ordinary, unmodified
`sqlite3` CLI instead of the real key-aware SQLCipher tooling, would
show genuinely unreadable, encrypted bytes where Lesson 01's own real
`SQLite format 3` header currently sits in plain text — real, direct
proof encryption at rest actually changes what's on disk, not merely
what an application chooses to display.

**What it does not change, stated directly rather than left implied:**
once a real connection has correctly supplied `PRAGMA key`, every
query against it runs exactly like ordinary SQLite, with the identical
real risk profile this entire series has already covered — a real SQL
injection vulnerability (Lesson 18) inside an *unlocked*, already-keyed
connection reads real, decrypted data exactly as easily as it would
against a plain, unencrypted file; encryption at rest says nothing at
all about what a legitimate, already-authenticated connection is
allowed to do. Nor does it protect the real key itself — a real,
hardcoded passphrase sitting in plain application source code defeats
the entire real point, the identical failure mode as a real password
committed directly into version control.

### Discard

Nothing throwaway — this is real, accurate, conceptual knowledge about
a real tool, deliberately not installed or exercised in this project's
own code.

### Mechanical Walkthrough

Not applicable — no real code from this unit runs against this
project's own database.

### CS Lens

SQLCipher's own real design is a direct, concrete instance of
**defense at the correct layer for the correct threat**: encryption at
rest defends specifically against a real attacker with raw file access
and no valid key — a genuinely different real threat from an attacker
who can already issue queries through a legitimately unlocked
connection or a real, exposed API endpoint, which is exactly why
Lesson 18's own parameterized queries and Lesson 30's own validation
remain necessary regardless of whether the underlying file is
encrypted.

### SE Lens

The real, honest reasons this series' own `pocket_hardware.db` never
uses SQLCipher, stated directly rather than left as an unexamined gap:
first, this project's own real threat model, throughout every lesson
in this series, has been the *application boundary* — Lesson 18's own
injection, Lesson 30's own validation, Lesson 36's own CORS — never a
stolen-laptop or exposed-backup scenario specifically. Second, adopting
it would mean a real, non-standard dependency (a separate package, a
separate native binary) in a series deliberately built on Python's own
real, standard-library `sqlite3` module throughout, a genuine,
deliberate tradeoff against this series' own teaching goals. Third,
Arc 5's own real, single-user desktop deployment already sits on top of
a real, different, and often better-fitting layer for this exact
threat: the operating system's own full-disk encryption (BitLocker,
FileVault), protecting *every* file on a real, stolen device — this
project's database included — without this project's own code needing
to manage a real encryption key at all. A real, genuinely multi-tenant
server deployment, storing real, sensitive data for many real users on
shared infrastructure, is a real, legitimate case where SQLCipher's own
tradeoffs would likely be worth it — a real, honest, different scenario
than this series' own project ever became.

## Connect the pieces

One real, re-confirmed fact — `pocket_hardware.db`'s own bytes are
genuinely, currently plaintext, provable with the identical hex dump
Lesson 01 first ran — and one real, honest comparison: SQLCipher, a
real, genuine tool, closes exactly that gap, transparently encrypting
every real byte at rest, while leaving every other real threat this
series has already addressed — injection, validation, CORS — entirely
unchanged and still necessary. This project's own real, deliberate
choice not to adopt it is a real, considered tradeoff, not an oversight
this lesson pretends doesn't exist.

## What breaks without this

Not applicable in this lesson's usual sense — there is no real,
deliberate failure to cause and restore here; the entire "break" this
lesson names is the real, already-standing, honest fact this lesson's
own first unit already proved directly: `pocket_hardware.db`, right
now, on your own real machine, is genuinely readable by anyone with
file access, with nothing in this series' own code preventing it.

## Exercises

1. Locate `pocket_hardware.db` on your own real machine and check its
   own real, current file permissions (`ls -l` on macOS/Linux,
   `Get-Acl` in PowerShell on Windows) — state, honestly, who else on
   this real machine could currently read it.
2. Research one real, genuine SQLCipher-adjacent alternative — SQLite's
   own official, separately-licensed "SQLite Encryption Extension"
   (SEE) — and write two or three real sentences comparing it to
   SQLCipher: what it has in common, and one real, genuine difference
   between the two (licensing is a real, legitimate, correct answer).

## Definition of Done

- [ ] You reconfirmed, directly, that `pocket_hardware.db`'s own real
      bytes are plaintext.
- [ ] You can state, precisely, what SQLCipher protects against and
      what it does not.
- [ ] You can state, in your own words, all three real reasons this
      series' own project doesn't use it.
- [ ] You completed both exercises.

## Next

[Arc 8](lesson-56-loading-states-in-pywebview.md) extends this series
past its own original, planned scope, built directly from a real,
working desktop app's own production pain points: a slow load with no
feedback, data that looks stale, joining more than one real database
live, safely syncing a local replica out from under a user who might
already have it open, and untangling a real, growing pile of
hand-written joins. [Arc 9](lesson-62-connecting-to-a-real-enterprise-server-database.md)
extends it once more, past SQLite entirely. [Lesson 66 — Series
Complete](lesson-66-series-complete.md) is this series' own true final
lesson, after both.
