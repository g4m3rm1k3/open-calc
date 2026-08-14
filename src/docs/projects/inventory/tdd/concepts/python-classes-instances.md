# Concept: Python Classes and Instances

**What you'll understand by the end:** how to define a type that remembers its own state across separate method calls, and why two instances of the same class don't share that state.

**Prerequisites:** none.

## Setup

Python 3, no packages needed.

## The Problem

A plain function has no memory between calls — call it twice, get independent results, with nothing carried over. Some problems genuinely need something that *does* remember — a running total, a current mode, a connection that stays open — across multiple separate calls, without that memory being a global variable shared by everything in the program.

## The Isolated Example

```python
class Counter:
    def __init__(self):
        self.count = 0

    def increment(self):
        self.count += 1
        return self.count


a = Counter()
b = Counter()
print(a.increment())
print(a.increment())
print(b.increment())
```

**Real output:**
```
1
2
1
```

**What this proves:** `a` and `b` are two separate **instances** — each created by calling the class like a function (`Counter()`). Each instance gets its own `self.count`, starting at `0` independently. Calling `a.increment()` twice shows `count` persisting *across* those two calls (`1`, then `2`) — proof an instance remembers state between method calls. Calling `b.increment()` afterward and getting `1`, not `3`, proves that memory is *per-instance* — `b` never saw anything that happened to `a`.

## Mechanical Walkthrough

- `class Counter:` declares a new type. Everything indented under it is part of that type's definition.
- `def __init__(self):` is a special method Python calls automatically every time `Counter()` is called to create a new instance — its job is to set up that instance's starting state. The double-underscore name is a Python convention for methods the interpreter itself calls, rather than ones a programmer calls directly by name.
- `self` is the first parameter of every method on a class, and refers to *this specific instance* — the one the method was actually called on. `self.count = 0` means "on this instance specifically, store `0` under the name `count`" — not a value shared by every `Counter`.
- `a = Counter()` **calls** the class, which Python recognizes as "create a new instance," automatically invoking `__init__(self)` with `self` bound to the brand-new instance being built — a programmer never passes `self` explicitly; Python supplies it.
- `a.increment()` looks up `increment` on `a`'s class (`Counter`), and calls it with `self` automatically bound to `a`. Inside, `self.count += 1` reads and rewrites `a`'s own `count`.

## Execution Trace

Two instances, three calls total, traced against the real output above:

- a = Counter()  → a new instance; a.count = 0 (own, independent storage)
- b = Counter()  → a second, separate instance; b.count = 0 (own, independent storage)

- a.increment():  self = a.  self.count (0) += 1 → a.count = 1.  return 1.
  → printed: 1

- a.increment():  self = a.  self.count (1) += 1 → a.count = 2.  return 2.
  → printed: 2

- b.increment():  self = b.  self.count (0) += 1 → b.count = 1.  return 1.
  → printed: 1

`b.increment()` returns `1`, not `3` — proof `a.count` and `b.count`
are two separate storage locations, not one shared value: nothing that
happened to `a` across its two calls is visible from `b` at all.

## CS Lens

A class instance's attributes are **object state** — memory that outlives any single method call and belongs to that specific instance, not the class as a whole. This is the general mechanism behind any "object that remembers something."

Also recognized in: every object-oriented language's instance variables (Java fields, C# properties, JavaScript class instance properties) — the same underlying idea, per-instance memory bound to a method's implicit receiver, expressed with different syntax per language.

## SE Lens

The alternative — a plain function taking and returning whatever state it needs explicitly (`increment(count) -> new_count`) — keeps things fully stateless, at the cost of every caller having to manually carry that value through every call, in order, without mistakes. A class trades a small amount of hidden state (a method's behavior now depends on *which* instance it's called on, not just its arguments) for removing that bookkeeping from every caller — worthwhile specifically when the state being tracked is a real, ongoing property of "the thing" the class represents, not incidental plumbing.

## Connection

Directly enables any design where an object needs to track something across many operations — a parser remembering the currently active mode across many lines, a network connection remembering whether it's open, a game character remembering its current health.

## Try It Yourself

1. Add a `reset()` method that sets `self.count` back to `0`. Confirm calling it on `a` doesn't affect `b`'s count.
2. Add a second piece of state, `self.history = []`, appended to inside `increment()` (`self.history.append(self.count)`). Confirm each instance accumulates its own independent history.
3. Create a `Counter` instance and inspect its `__dict__` attribute directly (`print(a.__dict__)`) — a real, built-in way to see exactly what instance state an object is currently holding, as a plain dict.
