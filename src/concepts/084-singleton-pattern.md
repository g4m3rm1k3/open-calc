---
concept: 084-singleton-pattern
name: Singleton Pattern
---

## Definition

The Singleton pattern ensures a class has only one instance for the entire
program, and provides one global point of access to it.

## Problem

Some resources genuinely need exactly one shared instance — a single
connection pool, a single configuration object — and accidentally creating
a second one would cause inconsistent state or wasted resources. Singleton
guarantees only one instance can ever exist, no matter how many times
"get the instance" is called.

## Execution

Call getInstance() the first time → no instance exists yet → create one, store it, return it
↓
Call getInstance() again → an instance already exists → return the SAME stored instance, without creating a new one
↓
Every caller, no matter how many times they call getInstance(), receives a
reference to the identical single object

## Computer Science

Enforcing "only one instance" requires making the constructor itself
inaccessible from outside the class and routing all instance creation
through one controlled access point that checks whether an instance already
exists before creating one. That check-then-create logic itself needs to be
safe under concurrent access in multi-threaded contexts, or two threads
could both pass the "no instance yet" check simultaneously and create two
instances.

Tags: Global state, Lazy initialization, Thread safety, Access control

## Software Engineering

Singleton is one of the most overused and criticized patterns in practice —
it introduces hidden global state that's hard to test, since tests can't
easily swap in a different instance, and creates a hidden dependency that
isn't visible in a class's constructor signature the way Dependency
Injection makes dependencies explicit. Many teams prefer creating one
instance explicitly at startup and passing it around via DI instead of a
Singleton class enforcing it internally.

Tags: Global state, Testability, Dependency Injection, Overuse

## Common Mistakes

- Reaching for Singleton just because "there should only be one" conceptually, when a single instance created once at program startup and passed around (via Dependency Injection) achieves the same guarantee without the hidden global-access-point downsides.
- Implementing the instance-check without considering concurrent access — in a multi-threaded environment, two threads can both see "no instance yet" and both create one, silently violating the entire point of the pattern.

## Exercises

- Call `getInstance()` three times in a row and print whether all three returned references are the exact same object (identity equality, not just equal-looking values).
- Try to construct the class directly, bypassing `getInstance()`, and observe what stops you.

## javascript

```javascript
class Configuration {
  static #instance = null
  #settings = {}
  constructor() {
    if (Configuration.#instance) {
      throw new Error('Use Configuration.getInstance() instead of new Configuration()')
    }
  }
  static getInstance() {
    if (!Configuration.#instance) {
      Configuration.#instance = new Configuration()
    }
    return Configuration.#instance
  }
  set(key, value) { this.#settings[key] = value }
  get(key) { return this.#settings[key] }
}

const a = Configuration.getInstance()
const b = Configuration.getInstance()
a.set('theme', 'dark')
console.log(a === b)          // true — the exact same object
console.log(b.get('theme'))   // 'dark' — set through 'a', visible through 'b'
```
Walkthrough: `getInstance()` only constructs a `Configuration` the first
time it's called, storing it in the private static `#instance`. Every
subsequent call returns that same stored object — proven here by
`a === b` being `true`, and by a value set through `a` being visible
through `b`, since they're literally the same object in memory.

## python

```python
class Configuration:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._settings = {}
        return cls._instance

    def set(self, key, value):
        self._settings[key] = value

    def get(self, key):
        return self._settings.get(key)


a = Configuration()
b = Configuration()
a.set('theme', 'dark')
print(a is b)             # True -- the exact same object
print(b.get('theme'))     # 'dark' -- set through 'a', visible through 'b'
```
Walkthrough: Python overrides `__new__` (which controls object creation
itself, before `__init__` runs) to return the same stored `_instance` every
time `Configuration()` is called, instead of always creating a fresh object
— `a is b` confirms both variables reference the identical object.
