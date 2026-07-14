---
concept: 007-collection-iteration
name: Collection Iteration (for-each)
---

## Definition

Collection iteration repeats a block of code once for each item already in a
collection, giving direct access to each item's value rather than a numeric
counter you have to use to look the item up yourself.

## Problem

Counted iteration (see that concept) needs you to compute an index and then use it
to look up each item (`items[i]`) — extra machinery that has nothing to do with
what you actually want, which is just "do this for every item." Collection
iteration removes the index entirely when you don't need it.

## Computer Science

Collection iteration is built on the **iterator pattern** — the collection exposes
a way to produce its items one at a time, in sequence, without exposing how it
stores them internally (an array, a linked list, a tree — the loop doesn't need to
know or care). This is a real abstraction boundary, not just shorter syntax.

Tags: Iterator pattern, Abstraction, Encapsulation of storage

## Software Engineering

Preferring collection iteration over counted iteration whenever you don't actually
need the index removes an entire class of off-by-one and out-of-bounds bugs — there's
no index to get wrong, because there's no index at all.

Tags: Bug prevention, Readability, Intent over mechanics

## Common Mistakes

- Reaching for a counted loop with manual indexing (`for (let i = 0; i < arr.length; i++) { arr[i] }`) when a collection loop would do the same job with no index bookkeeping at all.
- Trying to modify a collection's size while iterating over it directly — most languages either throw an error or produce surprising skipped/duplicated items.

## Exercises

- In the JavaScript example, add a running total variable and accumulate the sum of all the numbers using the for-of loop.
- In Python, try iterating with `enumerate(numbers)` instead of the plain loop, to get both the index and the value.

## javascript

```javascript
const numbers = [10, 20, 30]
for (const n of numbers) {
  console.log(n)
}
// prints 10, 20, 30 — no index anywhere
```
Walkthrough: `for...of` asks the array for its items one at a time, binding each
one to `n` in turn. There's no counter to manage — `numbers[0]`, `numbers[1]`,
`numbers[2]` are never written explicitly; the loop handles that internally.

## python

```python
numbers = [10, 20, 30]
for n in numbers:
    print(n)
```
Walkthrough: Python's `for n in numbers` is collection iteration directly — this is
in fact Python's *only* loop shape (see Counted Iteration's walkthrough); there's
no separate `for-of` keyword because Python's `for` always iterates a sequence.

## java

```java
int[] numbers = {10, 20, 30};
for (int n : numbers) {
    System.out.println(n);
}
```
Walkthrough: Java's `for (int n : numbers)` — read as "for each int n in numbers" —
is its collection-iteration form, distinct from the counted `for (int i = 0; ...)`
form. Like the other two languages, there's no index variable here at all; `n` is
bound directly to each element.
