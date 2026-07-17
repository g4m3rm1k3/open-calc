---
concept: 075-iterators
name: Iterators
---

## Definition

An iterator is an object that produces a sequence of values one at a time,
on demand, via a `next()`-style method that returns each value along with
whether the sequence is finished — the underlying mechanism a for-each loop
uses without ever showing it to you directly.

## Problem

A for-each loop (see the Collection Iteration concept) hides *how* "get the
next item" actually works. Writing a custom sequence of your own — a range
of numbers, values pulled lazily from a linked list — requires implementing
that "get the next item" mechanism explicitly, since the for-each loop isn't
itself the mechanism, just a convenient way to drive it.

## Execution

Get an iterator from a collection
↓
Call next() → returns { value: firstItem, done: false }
↓
Call next() → returns { value: secondItem, done: false }
↓
... continues until the sequence is exhausted ...
↓
Call next() → returns { value: undefined, done: true } — the sequence has ended
↓
A for-each loop repeatedly calls next() itself, stopping the instant it sees done: true

## Computer Science

This shape — a method returning a value plus a "done" flag — is the
**iterator protocol**, and it's the same underlying mechanism whether the
sequence is finite (a fixed array) or conceptually infinite (an endless
stream of numbers): the protocol never needs to know the sequence's length
in advance, only whether *this particular call* was the last one.

Tags: Iterator protocol, Lazy evaluation, Iterables vs iterators, Sequence abstraction

## Software Engineering

Writing a custom iterator lets a type participate in for-each loops, spread
syntax, and destructuring without first converting everything into an
array. This matters most for large or infinite sequences, where
materializing the whole thing into an array upfront would be wasteful or
outright impossible.

Tags: Custom iteration, Memory efficiency, Infinite sequences, API design

## Common Mistakes

- Confusing an "iterable" (something that CAN produce an iterator, like an array) with an "iterator" (the actual stateful object doing the producing, one call at a time) — an array is iterable, but you generally need its iterator, not the array itself, to call `next()` directly.
- Exhausting an iterator and then trying to iterate it again, expecting it to restart — most iterators are single-use once "done" is reached; getting a fresh iterator (or a fresh iterable) is required to go through the sequence again.

## Exercises

- Manually call an array's iterator three times and print each result object, before ever using a for-each loop over the same array.
- Write a custom iterator that produces the first n even numbers, and confirm it works correctly inside a real for-each loop.

## javascript

```javascript
function range(start, end) {
  let current = start
  return {
    [Symbol.iterator]() {
      return {
        next() {
          if (current < end) {
            return { value: current++, done: false }
          }
          return { value: undefined, done: true }
        }
      }
    }
  }
}

for (const n of range(1, 4)) {
  console.log(n)   // 1, then 2, then 3
}
```
Walkthrough: `range(1, 4)` returns an object implementing `Symbol.iterator` —
the protocol JavaScript's `for...of` loop looks for. Each call to `next()`
returns one value and advances `current`, until `current` reaches `end`, at
which point `done: true` signals the loop to stop. `for...of` is just
repeatedly calling `next()` and checking `done` on your behalf.

## python

```python
class Range:
    def __init__(self, start, end):
        self.current = start
        self.end = end

    def __iter__(self):
        return self

    def __next__(self):
        if self.current < self.end:
            value = self.current
            self.current += 1
            return value
        raise StopIteration


for n in Range(1, 4):
    print(n)   # 1, then 2, then 3
```
Walkthrough: Python's iterator protocol uses `__iter__` (return the iterator
itself) and `__next__` (return the next value, or raise `StopIteration` when
finished) instead of a `{value, done}` object — `StopIteration` plays the
same role JavaScript's `done: true` does. A `for` loop calls `__next__`
repeatedly and catches `StopIteration` internally to know when to stop.
