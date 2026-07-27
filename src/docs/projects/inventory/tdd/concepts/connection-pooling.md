# Concept: Connection Pooling

**What you'll understand by the end:** why opening a fresh database connection for every single operation has a real cost, and how a pool of reusable connections avoids paying it repeatedly.

**Prerequisites:** `sqlite-file-based-database.md`.

## Setup

No install needed beyond a real database driver — the isolated example reasons about connection cost generically; the concept applies to any real client-server database (PostgreSQL, MySQL), not file-based SQLite specifically (see the SE Lens below for why).

## The Problem

Establishing a real connection to a client-server database is genuinely expensive relative to running one query: a real network round-trip, authentication, and server-side setup all happen before a single row can be read. A program that opens a brand-new connection for every individual query, then closes it immediately after, pays that full setup cost every single time — even though the exact same, reusable connection could often have served the next query too.

## The Isolated Example

```python
import time

def fake_connect():
    time.sleep(0.05)  # stands in for a real network round-trip + auth handshake
    return "a real connection object"

def without_pooling(n_queries):
    start = time.time()
    for _ in range(n_queries):
        conn = fake_connect()  # a new connection, every single query
        # ... run one query ...
    return time.time() - start

class FakePool:
    def __init__(self, size):
        self.connections = [fake_connect() for _ in range(size)]  # paid once, upfront

    def borrow(self):
        return self.connections[0]  # simplified: always "hand back" the same one

def with_pooling(n_queries, pool):
    start = time.time()
    for _ in range(n_queries):
        conn = pool.borrow()  # reuse an already-open connection
        # ... run one query ...
    return time.time() - start

pool = FakePool(size=5)
print(f"without pooling, 20 queries: {without_pooling(20):.2f}s")
print(f"with pooling, 20 queries:    {with_pooling(20, pool):.2f}s")
```

**Real output:**
```
without pooling, 20 queries: 1.00s
with pooling, 20 queries:    0.00s
```

**What this proves:** the *real query work* is identical in both versions — only when the connection setup cost is paid differs. Paying it once, upfront, for a small set of reusable connections (the pool), versus paying it fresh for every single query, is the entire measurable difference between the two timings.

## Mechanical Walkthrough

- A **connection pool** maintains a real, already-established set of open connections, handed out ("borrowed") to code that needs one and returned when done, rather than closed — the next borrower reuses the exact same underlying connection instead of paying to establish a new one.
- Pool size is a real, tunable tradeoff: too small, and concurrent operations queue up waiting for a connection to free up; too large, and the database server itself may be overwhelmed by more simultaneous open connections than it can efficiently handle.
- A pooled connection must be correctly "returned" (not left borrowed forever) after each use — a real, common bug class is a **connection leak**, where code that borrows a connection but never returns it (due to a missed `.close()`/return call, especially on an error path) gradually exhausts the pool until nothing can get a connection at all.
- Most real ORMs and database frameworks provide connection pooling built in, configured with a few parameters (pool size, timeout) rather than requiring an application to implement pooling by hand.

## Execution Trace

`FakePool(size=5)`'s own constructor loop, then the two 20-query runs —
traced against the real 0.05s-per-`fake_connect()` cost and the real
timings above:

```
FakePool(size=5) construction:
  self.connections = [fake_connect() for _ in range(5)]
  → 5 calls to fake_connect(), each sleeping 0.05s → ~0.25s paid once, upfront

without_pooling(20):
  Iteration 1:  conn = fake_connect()  → sleeps 0.05s
  Iteration 2:  conn = fake_connect()  → sleeps 0.05s
  ...
  Iteration 20: conn = fake_connect()  → sleeps 0.05s
  → 20 real 0.05s sleeps, one per iteration → total ≈ 1.00s

with_pooling(20, pool):
  Iteration 1:  conn = pool.borrow()  → returns connections[0], no sleep
  Iteration 2:  conn = pool.borrow()  → returns connections[0] again, no sleep
  ...
  Iteration 20: conn = pool.borrow()  → returns connections[0] again, no sleep
  → 0 real sleeps inside the loop → total ≈ 0.00s
```

The loop shape is identical in both functions — 20 iterations, one
`conn = ...` per iteration — the entire real cost difference comes from
what that one line does inside the loop: pay the connection cost every
time, or reuse a connection paid for once, before the loop ever started.

## CS Lens

This is the same **space-time tradeoff via reuse** that `caching-and-memoization.md` describes for computed values, applied instead to an expensive-to-establish *resource* (a connection) rather than a computed result — keep a limited number of costly-to-create things ready and share them, rather than creating and discarding one per use. The general pattern — a pool of pre-allocated, reusable resources handed out and returned on demand — recurs anywhere acquiring a resource is expensive relative to using it.

Also recognized in: thread pools (reusing a fixed set of worker threads rather than spawning a new OS thread per task), object pools in game engines (reusing bullet/particle objects rather than allocating and garbage-collecting one per frame), and HTTP client libraries that pool and reuse TCP connections to the same server across multiple requests (HTTP "keep-alive").

## SE Lens

Whether pooling is worth the real, added complexity depends entirely on how expensive connection setup actually is relative to the work done per connection — this is exactly why an embedded, file-based database (see `sqlite-file-based-database.md`) commonly opens a fresh connection per operation with no pooling at all and suffers little real cost: there's no network round-trip or server-side authentication handshake to pay for, only a cheap local file handle. A real client-server database, reached over a network, is a fundamentally different cost profile, where pooling is close to mandatory for anything beyond the lowest-traffic use.

## Connection

Builds on `sqlite-file-based-database.md` and `caching-and-memoization.md`'s shared underlying tradeoff. Directly relevant to `orm-session-unit-of-work.md`'s own choice of a fresh session/connection per logical operation — a choice whose real cost depends entirely on which kind of database sits underneath it.

## Try It Yourself

1. Increase `FakePool`'s size and reason about (or simulate, with real concurrent tasks) what happens when more simultaneous borrowers exist than the pool has connections for — what should happen: block and wait, or fail immediately?
2. Deliberately "leak" a connection in a modified version of `FakePool` (borrow but never track it as returned) across many operations, and reason about what real, eventual failure mode this produces once every pooled connection has been leaked out.
3. Research your own real database driver or ORM's actual pooling configuration (pool size, max overflow, connection timeout) and reason about what real, appropriate values might look like for a small application versus a high-traffic production service.
