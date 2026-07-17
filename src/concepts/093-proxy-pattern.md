---
concept: 093-proxy-pattern
name: Proxy Pattern
---

## Definition

The Proxy pattern provides a stand-in object that controls access to a real
object, letting extra logic — checking permissions, delaying creation,
logging — run before or instead of forwarding the call through to the real
thing.

## Problem

Adding cross-cutting behavior (access control, lazy loading, caching,
logging) directly inside the real object mixes that behavior with the
object's actual core responsibility. A proxy sits in front of the real
object, implementing the same interface, adding that extra behavior around
a forwarded call, without the real object needing to know a proxy is even
involved.

## Execution

Caller calls proxy.request()
↓
Proxy checks something first (permission, cache, whether the real object has even been created yet)
↓
If the check passes, proxy forwards the call to the real object's
request(), returning its result
↓
If the check FAILS, proxy can refuse to forward the call at all — the real
object's request() never runs

## Computer Science

A proxy implements the identical interface as the real subject it stands
in for, so calling code can't tell the difference between talking to the
proxy or the real object directly — this is exactly what allows the extra
behavior to be inserted transparently, without changing a single line of
the calling code.

Tags: Interface conformance, Lazy initialization, Access control, Transparent forwarding

## Software Engineering

Common real-world proxy variants: a **protection proxy** (checks
permissions before forwarding), a **virtual proxy** (defers creating an
expensive real object until it's actually first needed), and a **caching
proxy** (returns a cached result instead of forwarding, when possible) —
all three share the identical "stand in, decide, maybe forward" shape.

Tags: Protection proxy, Virtual proxy, Caching proxy, Lazy loading

## Common Mistakes

- Confusing Proxy with Adapter — a proxy implements the SAME interface as the real object for transparent substitution, while an adapter deliberately translates between two DIFFERENT interfaces.
- Putting real business logic inside the proxy instead of just access-control, caching, or lazy-loading — a proxy should only decide whether or when to forward, not replace the real object's actual behavior.

## Exercises

- Implement a caching proxy around an expensive `fetchData(id)` function, and confirm the second call with the same `id` doesn't re-run the expensive function.
- Implement a protection proxy that refuses to forward `deleteRecord()` unless an `isAdmin` flag is true, and test it with both `true` and `false`.

## javascript

```javascript
class RealDatabase {
  query(sql) { return `Result of: ${sql}` }
}

class LoggingProxy {
  #real = new RealDatabase()
  #log = []
  query(sql) {
    this.#log.push(sql)
    return this.#real.query(sql)
  }
  getLog() { return this.#log }
}

const db = new LoggingProxy()
console.log(db.query('SELECT * FROM users'))
console.log(db.query('SELECT * FROM orders'))
console.log(db.getLog())   // [ 'SELECT * FROM users', 'SELECT * FROM orders' ]
```
Walkthrough: `LoggingProxy` implements the same `query(sql)` method the
real database has, but records every call before forwarding it — calling
code interacts with `db.query(...)` exactly as if it were talking to
`RealDatabase` directly, with the logging happening transparently in
between.

## python

```python
class RealDatabase:
    def query(self, sql):
        return f'Result of: {sql}'


class LoggingProxy:
    def __init__(self):
        self._real = RealDatabase()
        self._log = []

    def query(self, sql):
        self._log.append(sql)
        return self._real.query(sql)

    def get_log(self):
        return self._log


db = LoggingProxy()
print(db.query('SELECT * FROM users'))
print(db.query('SELECT * FROM orders'))
print(db.get_log())   # ['SELECT * FROM users', 'SELECT * FROM orders']
```
Walkthrough: identical transparent-forwarding-plus-logging mechanics as the
JavaScript version — `LoggingProxy` matches `RealDatabase`'s interface
exactly, inserting logging around every forwarded call.
