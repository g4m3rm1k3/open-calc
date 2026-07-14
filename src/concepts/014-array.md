---
concept: 014-array
name: Array
---

## Definition

An array is an ordered collection of values, each accessible by its numeric
position (index), starting at 0.

## Problem

Storing related values one at a time in separate named variables (`item1`,
`item2`, `item3`) doesn't scale and can't be looped over — an array holds any
number of values under one name, accessible by position.

## Computer Science

A classic array stores its elements in one contiguous block of memory, which is
what makes looking up any element by index an O(1) — constant time — operation:
the address of element `i` is computed directly (`base address + i * element size`),
no searching required. This is different from a linked structure, where reaching
element `i` means following `i` links one at a time.

Tags: Contiguous memory, O(1) index access, Zero-indexing

## Software Engineering

Arrays are the right tool when you need ordered data and mostly access it either
by position or by iterating the whole thing. They're the wrong tool when you need
fast lookup by some other key (see Map/Dictionary) or need to add/remove from the
middle frequently (insertion/removal there requires shifting every element after it).

Tags: Data structure selection, Insertion cost, Access patterns

## Common Mistakes

- Accessing an index beyond the array's length (`arr[10]` on a 3-element array) — some languages return `undefined`/`None` silently, others throw immediately; assuming the wrong one for your language is a real bug source.
- Forgetting arrays are zero-indexed — the first element is at index `0`, and the last is at `length - 1`, not `length`.

## Exercises

- In the JavaScript example, try accessing an index past the array's length and observe what comes back.
- In Python, try a negative index like `fruits[-1]` and predict what it returns before running it.

## javascript

```javascript
const fruits = ['apple', 'banana', 'cherry']
console.log(fruits[0])        // 'apple'
console.log(fruits.length)    // 3
fruits.push('date')
console.log(fruits)
```
Walkthrough: `fruits[0]` reads the first element directly by index. `.length`
reports the current count. `.push('date')` appends a new element, growing the
array to four items — JavaScript arrays resize dynamically; you never declare a
fixed size up front.

## python

```python
fruits = ['apple', 'banana', 'cherry']
print(fruits[0])          # 'apple'
print(len(fruits))        # 3
fruits.append('date')
print(fruits)
```
Walkthrough: Python's list (its version of a dynamic array) behaves the same way —
zero-indexed, resizes with `.append()`. `len(fruits)` is a builtin function here,
not a property on the list itself, a real syntactic difference from JavaScript's
`.length`.

## java

```java
int[] numbers = {10, 20, 30};
System.out.println(numbers[0]);     // 10
System.out.println(numbers.length); // 3
// numbers has a FIXED size — there is no numbers.push(...)
```
Walkthrough: Java's built-in array (`int[]`) has a **fixed size**, set at creation
and never changeable — there's no `.push()` because there's nowhere to grow into.
Adding an element requires either creating a new, larger array, or using
`ArrayList` (Java's resizable-array class) instead, which does support adding and
removing elements the way JavaScript's array and Python's list do.
