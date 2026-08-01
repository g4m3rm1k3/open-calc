# Async Concurrency: Coroutine, async/await, Future/Promise, Event Loop

## What you will build

Four connected programs in both Python and TypeScript showing how modern
languages handle concurrent I/O without threads — what a coroutine is,
how `async`/`await` makes asynchronous code readable, what a Future/Promise
actually represents, and how the event loop orchestrates all of it. By
the end you'll understand the mechanism behind every `await` you write,
and why Node.js can handle thousands of simultaneous connections in a
single thread.

## What you need to know first

This post assumes comfort with basic Python (variables, functions,
classes) and basic TypeScript orientation from the TypeScript Prereq
posts. Glossary 17 (Thread, Process, Race Condition) provides useful
context — specifically the comparison between threading and the event
loop — but this post stands alone. No prior async/await knowledge is
assumed.

## Setting up to run TypeScript

```
npx tsc filename.ts
node filename.js
```

---

## The problem all four concepts are solving

In Glossary 17, threads were the tool for doing multiple things
"at once." Threads work, but they have costs: shared memory creates race
conditions, locks create deadlocks, and threads themselves consume memory
(typically 1–8MB per thread). A web server handling 10,000 simultaneous
connections would need 10,000 threads — potentially gigabytes of memory
for threads that spend almost all their time *waiting* for network data.

The insight behind async concurrency: **waiting is not working**. A thread
blocked waiting for a database response is doing nothing useful. If instead
of blocking we could *pause* that operation, do other work while waiting,
and *resume* it when the data arrives — we could handle thousands of
concurrent operations in a single thread, with no shared memory, no race
conditions, and no deadlocks.

This is what coroutines, async/await, and the event loop provide.

---

## Concept 1: Coroutine

A **coroutine** is a function that can be paused at specific points and
resumed later, preserving its local state across the pause. Ordinary
functions run to completion once called — they can't be suspended
mid-execution. Coroutines can be.

### Python

Python's `yield` (from Glossary 12's Iterator) created generators — a
kind of coroutine. Python's `async def` creates a proper coroutine:

```python
import asyncio


async def greet(name, delay):
    print(f"  [{name}] Starting...")
    await asyncio.sleep(delay)
    print(f"  [{name}] Done after {delay}s!")
    return f"Hello from {name}"
```

**Walkthrough — new syntax.** `async def` marks a function as a
**coroutine function**. Calling `greet("Alice", 1)` does *not* run
the function body — it returns a **coroutine object**, a paused execution
waiting to be run. `await` is the keyword that suspends the current
coroutine until what follows it completes. `await asyncio.sleep(delay)`
suspends `greet` for `delay` seconds — but unlike `time.sleep()` from
Glossary 17, it doesn't block the whole thread. It tells the event loop
"I'm waiting, go run something else."

```python
async def main():
    print("Starting coroutines:")
    result = await greet("Alice", 0.1)
    print(f"  Got: {result}")

asyncio.run(main())
```

```
Starting coroutines:
  [Alice] Starting...
  [Alice] Done after 0.1s!
  Got: Hello from Alice
```

**Walkthrough:** `asyncio.run(main())` starts the event loop and runs the
`main` coroutine to completion. `await greet("Alice", 0.1)` runs the
coroutine and waits for its result. This sequential form doesn't show
concurrency yet — the next concept does.

**CS lens — coroutine vs function.** An ordinary function has one entry
point (its first line) and one exit point (`return`). A coroutine has one
entry point, multiple *suspension* points (`await`), and one exit point
(`return`). Each `await` is a voluntary checkpoint where the coroutine
says "I'm waiting for something external — schedule me to resume when
it's ready." The coroutine's local variables, its current execution
position, and its call stack frame are all preserved across each `await`.

---

## Concept 2: Event Loop

The **event loop** is the engine that runs coroutines. It maintains a
queue of coroutines that are ready to run, runs each one until it hits
an `await`, suspends it, and picks up the next ready coroutine. When
an awaited operation completes (a timer fires, network data arrives),
the suspended coroutine is put back on the ready queue.

### Python — running multiple coroutines concurrently

```python
import asyncio
import time


async def fetch_data(source, delay):
    print(f"  Fetching from {source}...")
    await asyncio.sleep(delay)
    print(f"  {source} responded after {delay}s")
    return f"data from {source}"


async def main():
    start = time.perf_counter()

    results = await asyncio.gather(
        fetch_data("database",   0.3),
        fetch_data("cache",      0.1),
        fetch_data("api",        0.2),
    )

    elapsed = time.perf_counter() - start
    print(f"\nAll results: {results}")
    print(f"Total time: {elapsed:.2f}s (not {0.3 + 0.1 + 0.2:.1f}s!)")


asyncio.run(main())
```

**Walkthrough — new syntax.** `time.perf_counter()` returns a high-resolution
timer value in seconds — subtracting the start from the end gives elapsed
time. `asyncio.gather(coro1, coro2, coro3)` runs multiple coroutines
**concurrently** — it starts all three, then awaits all three to finish,
collecting their return values. This is not parallel (not using multiple
CPU cores) — it's concurrent: the event loop interleaves them.

```
  Fetching from database...
  Fetching from cache...
  Fetching from api...
  cache responded after 0.1s
  api responded after 0.2s
  database responded after 0.3s

All results: ['data from database', 'data from cache', 'data from api']
Total time: 0.30s (not 0.6s!)
```

**Walkthrough:** All three fetches start immediately (all three "Fetching
from..." lines appear before any responses). The event loop runs
`fetch_data("database")` until it hits `await asyncio.sleep(0.3)` — pause.
Runs `fetch_data("cache")` until it hits `await asyncio.sleep(0.1)` — pause.
Runs `fetch_data("api")` until it hits `await asyncio.sleep(0.2)` — pause.
Now all three are suspended. After 0.1 seconds, the cache timer fires —
the cache coroutine resumes and prints its response. After 0.2 seconds,
the api timer fires. After 0.3 seconds, the database timer fires. Total
elapsed: 0.30 seconds — the time of the *slowest* operation, not the sum
of all three. Three "simultaneous" I/O operations in one thread.

**CS lens — concurrency vs parallelism.** This is **concurrent** but not
**parallel**. Parallel means truly running at the same time on different
CPU cores. Concurrent means *making progress on multiple things
interleaved* — only one runs at any moment, but the switching is fast
enough that they appear simultaneous. For I/O-bound work (waiting for
network, database, files), concurrency is as fast as parallelism: while
one operation is waiting for data, another runs. For CPU-bound work
(computation), you need actual parallelism (multiple cores).

**SE lens — why Node.js can handle 10,000 connections.** A Node.js server
handling 10,000 HTTP requests isn't running 10,000 threads. It's running
one event loop that has 10,000 pending async operations (socket reads).
When data arrives on any socket, the event loop wakes up the corresponding
handler. Between arrivals, the one thread is free to process other events.
This is why Node.js became popular for high-concurrency web servers: the
event loop model matches perfectly with the "mostly waiting for I/O"
nature of web request handling.

---

## Concept 3: Future/Promise

A **Future** (Python) or **Promise** (JavaScript/TypeScript) is an object
that represents a value that doesn't exist yet but will be available at
some point in the future. It's the standard return type for asynchronous
operations — a placeholder you can attach handlers to or `await`.

### Python

```python
import asyncio


async def slow_computation(value):
    await asyncio.sleep(0.1)
    return value * value


async def main():
    future = asyncio.ensure_future(slow_computation(7))
    print(f"  Future created. Done? {future.done()}")

    await asyncio.sleep(0.15)
    print(f"  After waiting. Done? {future.done()}")
    print(f"  Result: {future.result()}")

    result = await slow_computation(8)
    print(f"  Direct await result: {result}")


asyncio.run(main())
```

**Walkthrough — new syntax.** `asyncio.ensure_future(coro)` schedules a
coroutine to run on the event loop and returns a `Future` object
immediately — without waiting for it to finish. The `Future` starts
"pending" (`.done()` returns `False`). After `await asyncio.sleep(0.15)`,
enough time has passed for the computation to complete — `.done()` is now
`True` and `.result()` returns the computed value. `await slow_computation(8)`
is the more common pattern: `await` on a coroutine directly, getting the
result when it completes, without explicitly creating a Future object.

```
  Future created. Done? False
  After waiting. Done? True
  Result: 49
  Direct await result: 64
```

**CS lens — Future as a value container.** A Future has three states:
**pending** (the operation hasn't finished), **fulfilled/resolved** (it
finished successfully, holding a result), and **rejected/failed** (it
finished with an error). You can check which state it's in, attach
callbacks to run when it completes, or `await` it to pause your coroutine
until it resolves. This is the same concept as a "promise" you'd make
to a friend: "I promise to give you the answer later." The promise object
exists now; the actual answer comes later.

### TypeScript

```typescript
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function slowComputation(value: number): Promise<number> {
  await delay(100);
  return value * value;
}

async function main(): Promise<void> {
  const promise = slowComputation(7);
  console.log(`  Promise created. Is a Promise? ${promise instanceof Promise}`);

  const result = await promise;
  console.log(`  Awaited result: ${result}`);

  const direct = await slowComputation(8);
  console.log(`  Direct await result: ${direct}`);

  const [r1, r2, r3] = await Promise.all([
    slowComputation(3),
    slowComputation(4),
    slowComputation(5),
  ]);
  console.log(`  Parallel results: ${r1}, ${r2}, ${r3}`);
}

main();
```

**Walkthrough — new syntax.** `new Promise((resolve) => setTimeout(resolve,
ms))` — a `Promise` constructor takes a function called the **executor**,
which receives two callbacks: `resolve` (call this when the work is done)
and optionally `reject` (call this if it failed). `setTimeout(resolve, ms)`
schedules `resolve` to be called after `ms` milliseconds — the standard
way to create a timed delay in JavaScript. `promise instanceof Promise`
checks whether `promise` is an instance of the built-in `Promise` class —
confirming it's a pending Promise, not yet a resolved value.

`Promise.all([p1, p2, p3])` runs multiple Promises concurrently and
resolves with an array of all results when every one has completed —
TypeScript/JavaScript's equivalent of Python's `asyncio.gather`. `const
[r1, r2, r3] = await Promise.all(...)` uses **array destructuring** to
unpack the resulting array into three separate variables in one step.

```
  Promise created. Is a Promise? true
  Awaited result: 49
  Direct await result: 64
  Parallel results: 9, 16, 25
```

---

## Concept 4: async/await in full context

`async`/`await` is the syntax sugar that makes working with coroutines
and Promises readable. Without it, you'd need to chain `.then()` callbacks
(JavaScript) or use `yield from` (older Python) — patterns that become
deeply nested and hard to follow for anything more than one step. With
`async`/`await`, asynchronous code reads almost exactly like synchronous
code.

### Python — a realistic pipeline

```python
import asyncio


async def authenticate(username):
    await asyncio.sleep(0.05)
    return {"user_id": 42, "username": username, "role": "admin"}


async def fetch_permissions(user_id):
    await asyncio.sleep(0.05)
    return ["read", "write", "delete"]


async def load_user_data(user_id):
    await asyncio.sleep(0.1)
    return {"orders": 17, "balance": 250.00}


async def handle_request(username):
    print(f"  Handling request for '{username}'...")

    user        = await authenticate(username)
    permissions, user_data = await asyncio.gather(
        fetch_permissions(user["user_id"]),
        load_user_data(user["user_id"])
    )

    print(f"  User: {user['username']} (role={user['role']})")
    print(f"  Permissions: {permissions}")
    print(f"  Orders: {user_data['orders']}, Balance: ${user_data['balance']:.2f}")
    return "Request handled successfully"


async def main():
    import time
    start = time.perf_counter()

    results = await asyncio.gather(
        handle_request("alice"),
        handle_request("bob"),
    )

    elapsed = time.perf_counter() - start
    print(f"\nBoth requests handled in {elapsed:.2f}s")
    for r in results:
        print(f"  {r}")


asyncio.run(main())
```

```
  Handling request for 'alice'...
  Handling request for 'bob'...
  User: alice (role=admin)
  User: bob (role=admin)
  Permissions: ['read', 'write', 'delete']
  Orders: 17, Balance: $250.00
  Permissions: ['read', 'write', 'delete']
  Orders: 17, Balance: $250.00

Both requests handled in 0.15s
  Request handled successfully
  Request handled successfully
```

**Walkthrough:** Two requests run concurrently. Each request awaits
`authenticate` (0.05s), then concurrently fetches permissions and user
data (0.05 + 0.1s in parallel → 0.1s). Total per request: ~0.15s. Both
requests run concurrently, so total time is still ~0.15s rather than 0.30s.
The `async`/`await` syntax makes this multi-step, concurrent pipeline
read like ordinary sequential code — which is precisely the point.

### TypeScript — the same pipeline

```typescript
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface User { userId: number; username: string; role: string; }
interface UserData { orders: number; balance: number; }

async function authenticate(username: string): Promise<User> {
  await delay(50);
  return { userId: 42, username, role: "admin" };
}

async function fetchPermissions(userId: number): Promise<string[]> {
  await delay(50);
  return ["read", "write", "delete"];
}

async function loadUserData(userId: number): Promise<UserData> {
  await delay(100);
  return { orders: 17, balance: 250.00 };
}

async function handleRequest(username: string): Promise<string> {
  console.log(`  Handling request for '${username}'...`);

  const user = await authenticate(username);
  const [permissions, userData] = await Promise.all([
    fetchPermissions(user.userId),
    loadUserData(user.userId),
  ]);

  console.log(`  User: ${user.username} (role=${user.role})`);
  console.log(`  Permissions: ${JSON.stringify(permissions)}`);
  console.log(`  Orders: ${userData.orders}, Balance: $${userData.balance.toFixed(2)}`);
  return "Request handled successfully";
}

async function main(): Promise<void> {
  const start = Date.now();

  const results = await Promise.all([
    handleRequest("alice"),
    handleRequest("bob"),
  ]);

  const elapsed = (Date.now() - start) / 1000;
  console.log(`\nBoth requests handled in ${elapsed.toFixed(2)}s`);
  results.forEach((r) => console.log(`  ${r}`));
}

main();
```

**Walkthrough — new syntax.** `Date.now()` returns the current time in
milliseconds — dividing by 1000 converts to seconds. `interface User` and
`interface UserData` are TypeScript interfaces typed exactly to the shape
of each returned object — the compiler verifies every property access
against these shapes. `const [permissions, userData] = await Promise.all([...])`
— destructuring the Promise.all result into named variables, the same
array destructuring from the earlier section.

```
  Handling request for 'alice'...
  Handling request for 'bob'...
  User: alice (role=admin)
  User: bob (role=admin)
  Permissions: ["read","write","delete"]
  Orders: 17, Balance: $250.00
  Permissions: ["read","write","delete"]
  Orders: 17, Balance: $250.00

Both requests handled in 0.15s
  Request handled successfully
  Request handled successfully
```

---

## Connect the pieces

**Coroutine** is the fundamental unit — a function that can pause and
resume, preserving its state across pauses. **The Event Loop** is the
engine that runs coroutines, switching between them at every `await` point.
**Future/Promise** is the return value of an async operation — a
placeholder for a value that will arrive later, which you can `await` to
pause until it's ready. **async/await** is the syntax that makes all of
this readable — without it, chaining async operations would require nested
callbacks or explicit Future manipulation for every step.

Python's `async`/`await` and JavaScript/TypeScript's `async`/`await`
are functionally equivalent — they solve the same problem with almost
identical syntax. The difference is in the event loop: Python requires
`asyncio.run()` or a similar call to start the loop; Node.js runs its
event loop automatically, which is why `main()` at the end of a TypeScript
file just works without any `run()` call. Python's `asyncio.gather()`
and TypeScript's `Promise.all()` are direct equivalents. Python's
`asyncio.Future` and TypeScript's `Promise` are direct equivalents.

The comparison to Glossary 17's threading: threads achieve concurrency
by running code simultaneously on different CPU cores, sharing memory.
Async/await achieves concurrency on a single thread by pausing at I/O
boundaries and doing other work in between — no shared memory, no race
conditions, no deadlocks, but also no CPU parallelism. The right tool
depends on the workload: I/O-bound → async/await; CPU-bound → processes
or worker threads.

## What breaks without understanding this

Writing `time.sleep()` inside an async function blocks the entire event
loop — all other coroutines freeze until the sleep finishes, defeating
the purpose of async entirely. Similarly, running a CPU-intensive loop
inside an async function without any `await` points blocks the loop.
`await` is not just syntax — it's the explicit surrender of control back
to the event loop, the checkpoint that makes concurrency possible.
Without regular `await` points, an async function is just a regular
function with extra overhead.

## Definition of done

- [ ] You can explain what a coroutine is and how it differs from a
      regular function — specifically what `await` does to execution.
- [ ] You can explain what the event loop does — what it runs, when it
      switches, and what "pending" means for a waiting coroutine.
- [ ] You can explain what a Future/Promise is and its three states
      (pending, fulfilled, rejected).
- [ ] You can explain why `asyncio.gather()` / `Promise.all()` takes
      less total time than running the same operations sequentially.
- [ ] You've run both the Python and TypeScript pipeline examples and
      confirmed the timing shows concurrency working correctly.
- [ ] You can explain the difference between concurrency (async/await,
      one thread) and parallelism (multiple threads/processes, multiple
      CPUs) and which one async/await provides.
