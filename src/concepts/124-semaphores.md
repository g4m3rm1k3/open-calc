---
concept: 124-semaphores
name: Semaphores
---

## Definition

A semaphore controls access to a resource by allowing up to N threads to
hold it concurrently — not just one, like a mutex — with any additional
thread trying to acquire it beyond that limit having to wait until one of
the current holders releases it.

## Problem

Some resources can safely support a limited number of concurrent users — a
connection pool with 5 slots, a rate limiter allowing 3 simultaneous
requests — not zero (exclusive access) and not unlimited (no protection at
all). A semaphore enforces exactly that "up to N at a time" limit.

## Execution

Semaphore initialized with a count of 2 (allows 2 concurrent holders)
↓
Thread A acquires — count drops to 1 remaining slot — A proceeds
↓
Thread B acquires — count drops to 0 remaining slots — B proceeds (still allowed, since 2 was the limit)
↓
Thread C tries to acquire — 0 slots remaining — C WAITS
↓
Thread A releases — count goes back up to 1 — Thread C's wait ends, C now acquires and proceeds

## Computer Science

A mutex is exactly a semaphore with a count of 1 — semaphores are the more
general primitive, and a mutex is the special case that only ever allows
exclusive, one-at-a-time access. The counting mechanism itself —
incrementing on release, decrementing on acquire, blocking when the count
would go negative — is what a semaphore actually is underneath.

Tags: Counting semaphore, Mutex as special case, Resource pool

## Software Engineering

Semaphores are the standard tool for rate-limiting and connection pooling
— capping how many requests, connections, or workers can run concurrently,
protecting a downstream resource from being overwhelmed by unlimited
concurrent access.

Tags: Rate limiting, Connection pooling, Concurrency limiting

## Common Mistakes

- Confusing a semaphore's count with a mutex's simple locked/unlocked state — a semaphore with count N genuinely allows N simultaneous holders, not just faster sequential access.
- Forgetting to release a semaphore slot after use — exactly like a leaked mutex, this permanently reduces the pool's effective capacity, eventually starving every future acquirer once enough slots leak away.

## Exercises

- Modify the example to use a semaphore count of 3 instead of 2, and confirm 3 workers can proceed concurrently before a 4th has to wait.
- Explain, in one sentence, why "a mutex is a semaphore with count 1" is an accurate description.

## javascript

```javascript
class Semaphore {
  #count
  #waiting = []
  constructor(count) { this.#count = count }
  async acquire() {
    if (this.#count > 0) { this.#count--; return }
    await new Promise(resolve => this.#waiting.push(resolve))
  }
  release() {
    const next = this.#waiting.shift()
    if (next) next()
    else this.#count++
  }
}

async function main() {
  const sem = new Semaphore(2)
  const log = []

  async function worker(name) {
    await sem.acquire()
    log.push(`${name} acquired`)
    sem.release()
    log.push(`${name} released`)
  }

  await Promise.all([worker('A'), worker('B'), worker('C')])
  console.log(log.length)   // 6 — all three workers acquired and released successfully
}

main()
```
Walkthrough: the semaphore starts with `count = 2`, allowing two workers
through immediately; a third worker waits only if the first two haven't
released yet. Because `release()` is called right after `acquire()` here,
in practice all three complete quickly, but the semaphore's count still
correctly limits how many could be "in the critical section" at once to 2.

## python

```python
import threading

class Semaphore:
    def __init__(self, count):
        self._semaphore = threading.Semaphore(count)

    def acquire(self):
        self._semaphore.acquire()

    def release(self):
        self._semaphore.release()


sem = Semaphore(2)
log = []
lock = threading.Lock()

def worker(name):
    sem.acquire()
    with lock:
        log.append(f'{name} acquired')
    sem.release()
    with lock:
        log.append(f'{name} released')

threads = [threading.Thread(target=worker, args=(name,)) for name in ['A', 'B', 'C']]
for t in threads:
    t.start()
for t in threads:
    t.join()

print(len(log))   # 6 -- all three workers acquired and released successfully
```
Walkthrough: identical counting-semaphore mechanics as the JavaScript
version — Python's built-in `threading.Semaphore(2)` allows up to 2
concurrent holders, blocking any additional acquirer until a slot is
released.
