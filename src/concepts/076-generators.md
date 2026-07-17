---
concept: 076-generators
name: Generators
---

## Definition

A generator is a function that can pause itself mid-execution — at a
`yield` point — and resume later exactly where it left off, producing one
value per pause instead of computing and returning everything at once.

## Problem

Writing a custom iterator by hand (see the Iterators concept) means
manually tracking state between calls — the current index, whatever's
needed to compute the next value — in fields on an object. A generator lets
you write that same sequence as ordinary, linear-looking code with a loop
and a `yield` statement, while the language automatically handles pausing,
resuming, and tracking state for you.

## Execution

Call the generator function → nothing runs yet, it returns a paused generator object
↓
Call next() → the function body runs until it hits the first yield, returns that value, and pauses
↓
Call next() again → execution resumes right after that yield, continues to the next yield (or the end)
↓
... repeats until the function body finishes ...
↓
Final next() → returns { value: undefined, done: true }, matching the iterator protocol exactly

## Computer Science

A generator is a real implementation of the iterator protocol (see the
Iterators concept) — every generator IS an iterator, automatically. What
makes it different from a hand-written iterator is that its "state between
calls" isn't fields on an object you manage yourself — it's the paused call
stack and instruction pointer of the function itself, saved and restored by
the language runtime (a **coroutine**).

Tags: Coroutines, Lazy evaluation, Iterator protocol, Suspended execution

## Software Engineering

Generators are how infinite or very large sequences get processed without
ever materializing the whole sequence in memory — reading a huge file line
by line, or generating "the next Fibonacci number" forever, both work
naturally as generators, since only one value needs to exist in memory at a
time, not the whole sequence.

Tags: Memory efficiency, Streaming data, Infinite sequences, Async generators

## Common Mistakes

- Calling the generator function and expecting the whole sequence back immediately — calling it only creates the (lazy) generator object; nothing inside the function body actually runs until the first `next()` call.
- Forgetting a generator can only be iterated once — like other iterators, once it's exhausted, a fresh call to the generator function is needed to go through the sequence again, not a "reset."

## Exercises

- Rewrite the Iterators concept's custom range iterator as a generator instead, and compare how much shorter and more linear-looking the code becomes.
- Write a generator that yields the first n Fibonacci numbers, and confirm it can be advanced manually as well as used in a for-each loop.

## javascript

```javascript
function* range(start, end) {
  let current = start
  while (current < end) {
    yield current
    current++
  }
}

for (const n of range(1, 4)) {
  console.log(n)   // 1, then 2, then 3
}

const gen = range(10, 12)
console.log(gen.next())   // { value: 10, done: false }
console.log(gen.next())   // { value: 11, done: false }
console.log(gen.next())   // { value: undefined, done: true }
```
Walkthrough: `function*` marks `range` as a generator — calling it doesn't
run the body yet, it returns a paused generator object. Each `next()` call
resumes execution right after the last `yield`, runs until the next `yield`
(or the function ends), and returns exactly the `{value, done}` shape the
iterator protocol expects — the same object shape traced in the Iterators
concept, just produced automatically instead of by hand.

## python

```python
def gen_range(start, end):
    current = start
    while current < end:
        yield current
        current += 1


for n in gen_range(1, 4):
    print(n)   # 1, then 2, then 3

gen = gen_range(10, 12)
print(next(gen))            # 10
print(next(gen))            # 11
print(next(gen, 'done'))    # 'done' -- StopIteration would be raised without a default
```
Walkthrough: Python's `yield` works the same way — calling `gen_range(10, 12)`
returns a paused generator without running any code yet, and each `next()`
call resumes right after the last `yield`. Python's built-in `next()`
function raises `StopIteration` once the generator finishes; passing a
second argument gives it a default to return instead of raising, purely to
make the final line's output visible here without a try/except.
