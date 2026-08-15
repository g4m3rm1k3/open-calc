# Lesson 50: Concurrency and Locking

**What you will build:** a real, deliberately caused `database is
locked` error — two genuine writers colliding on `pocket_hardware.db`
at the same real time — and the real, correct fix, plus a direct,
honest correction of a real, common misconception this lesson exists
specifically to prevent.

**What you need to know first:** [Lesson 20](lesson-20-transactions-in-python.md)
— Python's own real, implicit transaction behavior, now examined under
genuine concurrency rather than one script running alone. [Lesson 01](lesson-01-what-a-database-is-and-why-sqlite.md)
— its own SE Lens already named this exact lesson directly, as the real
cost SQLite's embedded, serverless design (as opposed to a real
client-server database) eventually charges.

**Terms introduced in this lesson:**
- **Lock** — SQLite's own real, internal mechanism ensuring at most one
  real connection can write to a database file at any given real
  moment, preventing two writers from corrupting each other's changes.
- **`SQLITE_BUSY`** — SQLite's own real, internal result code, surfaced
  to Python as `sqlite3.OperationalError: database is locked`, raised
  when a connection cannot acquire a lock it needs within its own real,
  configured wait time.

**Objects and methods used:**

**`sqlite3.connect(..., timeout=...)`**
- *What it is:* a real, already-used function (Lesson 17), given its
  own real, optional `timeout` parameter full treatment for the first
  time.
- *Implementation:* `sqlite3.connect(path, timeout=seconds)` — if a
  real lock this connection needs is currently held elsewhere, it waits
  and automatically retries for up to `seconds` real seconds before
  raising `OperationalError`; Python's own real default is `5.0`.
- *Its use:* both causing this lesson's own real failure (`timeout=0`,
  no retry at all) and fixing it (a real, longer, deliberate wait).

**`BEGIN IMMEDIATE`**
- *What it is:* a real, specific form of SQL's own `BEGIN` (Lesson 14).
- *Implementation:* `BEGIN IMMEDIATE;` — acquires a real, write-
  intent lock immediately, rather than SQLite's own real, ordinary
  default (a *deferred* transaction, which waits until the first actual
  write statement to acquire one).
- *Its use:* making this lesson's own demonstration reliably reproduce
  a real lock, at a precise, known moment, rather than depending on
  exactly when a later statement happens to run.

---

## Concept Unit: Two Real Writers, One Real Lock

### The Problem

Lesson 01's own SE Lens already named the real cost of SQLite's
embedded design directly: no server process exists to arbitrate two
real, simultaneous writers the way a real client-server database's own
server naturally would. What actually happens when two real, genuine
writers — Arc 4's own backend, say, and a second real process — try to
write to `pocket_hardware.db` at the exact same real moment?

### Introduce the Concept in Isolation

Two real, concurrent threads, deliberately colliding:

```python
import sqlite3
import threading
import time


def slow_writer():
    conn = sqlite3.connect("pocket_hardware.db", timeout=0)
    conn.execute("BEGIN IMMEDIATE")
    conn.execute("UPDATE parts SET quantity = quantity + 1 WHERE id = 1")
    time.sleep(2)
    conn.commit()
    conn.close()


def fast_writer():
    time.sleep(0.5)
    conn = sqlite3.connect("pocket_hardware.db", timeout=0)
    conn.execute("UPDATE parts SET quantity = quantity + 1 WHERE id = 2")
    conn.close()


t1 = threading.Thread(target=slow_writer)
t2 = threading.Thread(target=fast_writer)
t1.start()
t2.start()
t1.join()
t2.join()
```

```
$ python lock_collision.py
Exception in thread Thread-1:
sqlite3.OperationalError: database is locked
```

A real, genuine failure — `fast_writer`, starting half a real second
after `slow_writer` already acquired a real, write-intent lock via
`BEGIN IMMEDIATE`, tries to begin its own real write while that lock
is still held, with `timeout=0` giving it no real time to wait and
retry at all. This is `SQLITE_BUSY`, real and unavoidable by design:
SQLite allows at most one real connection to hold a write lock at a
time, unconditionally, regardless of journal mode — the concrete,
provable cost Lesson 01 already named honestly, now actually felt.

### Discard

`lock_collision.py` is real, disposable proof of a genuine failure
mode — never intentionally reproduced in this project's own real code.

### Mechanical Walkthrough

- `sqlite3.connect("pocket_hardware.db", timeout=0)` — **(a) first
  appearance** of the real `timeout` parameter, full treatment above;
  `0` — a real, deliberate choice removing any retry window at all, to
  make this lesson's own failure reproduce reliably rather than only
  occasionally.
- `conn.execute("BEGIN IMMEDIATE")` — **(a) first appearance**, full
  treatment above.
- `time.sleep(2)` — **(b) hard concept reappearing**, ordinary,
  already-used standard-library timing, holding the real lock open long
  enough for `fast_writer` to reliably collide with it.
- `threading.Thread(...).start()` — **(b) hard concept reappearing**,
  Lesson 42's own real threading pattern, applied here to deliberately
  create real concurrency instead of avoiding a race.

### CS Lens

This is real, direct, felt proof of **mutual exclusion**: SQLite's own
real locking guarantees that writing to the database file is a real,
exclusive operation — only one real writer at a time, by design, the
identical underlying guarantee a real mutex or lock provides for shared
memory in any concurrent program, applied here to a shared file
instead.

Also recognized in: a real file lock preventing two processes from
writing the same file simultaneously, a mutex protecting a shared data
structure in a multithreaded program, a real database transaction
isolation level preventing two transactions from corrupting each
other's uncommitted changes.

### SE Lens

The real, honest, concrete cost this lesson exists to make undeniable:
a real client-server database (Postgres, Lesson 01's own original
comparison) has a real, single server process mediating every writer,
naturally queuing concurrent write requests rather than rejecting one
outright. SQLite, with no such process, pushes that real responsibility
onto every individual connection instead — this lesson's own real
`timeout=0` failure is not a bug in SQLite; it's the real, direct,
provable shape of the tradeoff Lesson 01 named honestly from this
series' very first lesson.

## Concept Unit: The Real Fix, and a Real, Common Misconception

### The Problem

`timeout=0` was a deliberate, artificial choice to make this lesson's
own failure reproducible. What's the real, correct fix for genuine
production code?

### Introduce the Concept in Isolation

The identical real script, `fast_writer`'s own timeout changed from
`0` to a real, deliberate wait:

```python
def fast_writer():
    time.sleep(0.5)
    conn = sqlite3.connect("pocket_hardware.db", timeout=5.0)
    conn.execute("UPDATE parts SET quantity = quantity + 1 WHERE id = 2")
    conn.close()
```

```
$ python lock_retry.py
```

No error at all — `fast_writer` now waits, real and automatically,
retrying internally until `slow_writer`'s own 2-second transaction
commits and releases its lock, well within the real, configured
5-second window. This is the real, correct, standard fix: a real,
deliberate `timeout`, long enough to outlast this project's own
genuinely longest-held real transaction, rather than `0`'s own
artificial impatience.

**A real, common, and genuinely important misconception, corrected
directly rather than left for a reader to discover the hard way:**
switching `pocket_hardware.db` to **WAL mode**
(`PRAGMA journal_mode=WAL;`, a real, genuinely different, and
genuinely valuable SQLite feature) does **not** fix this specific
lesson's own failure. WAL mode's own real, documented benefit is
allowing real *readers* to proceed without ever being blocked by an
active real writer, and vice versa — a real, significant improvement
for a project with many concurrent readers (Arc 4's own backend,
serving many real simultaneous `GET` requests, is exactly this case).
It does **not** allow two real, simultaneous *writers* — that
real limit, one writer at a time, is unconditional in SQLite,
regardless of journal mode, and `timeout`/`busy_timeout` remains the
real, correct, only fix for writer-vs-writer contention specifically,
exactly as this unit's own fix just proved directly.

### Discard

`lock_retry.py` is real, disposable proof of the real fix's own
correctness; `timeout=5.0` (or a real, deliberately chosen value for
this project's own actual workload) is the real, permanent setting Arc
4's own `get_db` (Lesson 31) should carry going forward.

### Mechanical Walkthrough

- `sqlite3.connect("pocket_hardware.db", timeout=5.0)` — **(b) hard
  concept reappearing**, this unit's own first `timeout` parameter,
  changed from a deliberately broken value to a real, working one.
- `PRAGMA journal_mode=WAL;` — **(a) first appearance**, mentioned here
  in prose specifically to correct a real, common misunderstanding
  about what it does and doesn't solve, rather than as code this
  lesson runs.

### CS Lens

The real, precise distinction this unit draws — WAL solves
reader-vs-writer contention, not writer-vs-writer — is a real instance
of understanding a concurrency mechanism's own *exact* guarantee rather
than a vague, generalized belief that "enabling WAL fixes locking." Real
concurrency bugs are frequently caused by exactly this kind of
imprecision: correctly identifying *that* a real concurrency control
exists, while misunderstanding *which specific race* it actually
prevents.

### SE Lens

The real, deliberate choice this project should make, honestly stated:
both real fixes are legitimate and address genuinely different real
problems, and a real, production-grade SQLite-backed application
typically wants **both** — WAL mode, so Arc 4's own many real,
concurrent readers are never blocked by an occasional real write, and a
real, deliberate `timeout`, so the comparatively rare case of two real,
simultaneous writers waits and retries automatically rather than
failing outright the way this lesson's own artificial `timeout=0`
demonstration did.

## Connect the pieces

One real, deliberately caused failure — two genuine writers, one
holding a real lock via `BEGIN IMMEDIATE`, the other configured with no
real patience at all — proved `SQLITE_BUSY`/"database is locked" is a
real, unavoidable consequence of SQLite's own single-writer design, not
a bug. A real, longer `timeout` fixed it directly, by waiting and
retrying automatically. And a real, honest correction closed a genuine,
common misconception: WAL mode is a real, valuable, different fix, for
a genuinely different real problem than the one this lesson caused and
solved.

## What breaks without this

Set `fast_writer`'s own `timeout` to a real value shorter than
`slow_writer`'s own hold time — `timeout=1.0` against a real 2-second
lock:

```
$ python lock_retry_too_short.py
sqlite3.OperationalError: database is locked
```

The identical real failure as this lesson's own original,
`timeout=0` case — direct, provable proof that `timeout` is a real,
finite budget, not a guarantee: it must genuinely exceed the real
longest possible hold time this project's own writers can produce, or
the identical real failure returns, just delayed rather than
eliminated.

## Exercises

1. Reproduce this lesson's own real lock collision, then fix it two
   different real ways independently — first with a longer `timeout`
   alone, then, separately, by having `slow_writer` genuinely finish
   its own transaction faster (a shorter real `time.sleep`) instead of
   widening the window for `fast_writer` to wait through.
2. Add `conn.execute("PRAGMA journal_mode=WAL;")` to this lesson's own
   original, `timeout=0` script, and confirm directly, by actually
   running it, that the real writer-vs-writer failure still occurs —
   direct, hands-on proof of this lesson's own central, corrected
   misconception, rather than taking it on faith.

## Definition of Done

- [ ] You reproduced a real `database is locked` error from two
      genuine, concurrent writers.
- [ ] You fixed it with a real, sufficient `timeout`, and reproduced
      the failure again with one too short to prove the fix isn't
      automatic.
- [ ] You confirmed directly that WAL mode alone does not fix
      writer-vs-writer contention, and can state precisely what it
      does fix instead.
- [ ] You completed both exercises.

## Next

[Lesson 51 — Query Performance and the N+1 Problem](lesson-51-query-performance-and-the-n-plus-1-problem.md)
covers a real, different kind of production concern — not concurrent
access, but a single, real endpoint quietly doing far more work than it
needs to.
