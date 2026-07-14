---
concept: string-slicing
name: String Slicing
---

## Definition

Slicing returns a new string containing only a requested range of characters from
an existing string — the original string is unchanged.

## Problem

Sometimes you only want part of a string instead of the whole thing — the first
few characters, everything after a prefix, or the last N characters. Writing that
range-extraction by hand, one character at a time, is tedious and easy to get
off-by-one wrong.

## Computer Science

Slicing returns a *copy* of a range, not a reference into the original — the
original string's characters are never mutated, because strings are immutable in
every language shown here. This is different from slicing a mutable array, where
some languages return a view into the same underlying memory instead of a copy.

Tags: Immutability, Copy vs reference, Off-by-one errors

## Software Engineering

Reaching for a slice instead of a manual character-by-character loop states intent
directly — "I want this range" — instead of the mechanics of getting there. It also
removes an entire category of off-by-one bugs: the start/end bounds are handled
once, by the language, not re-derived by hand at every call site.

Tags: Readability, Intent over mechanics, API design

## Common Mistakes

- Assuming slicing mutates the original string — it always returns a new one.
- Off-by-one errors when hand-rolling the same logic instead of using the
  language's built-in slice/substring operation.

## Exercises

- Change the start index in each language's example and predict the output before running it.
- Try slicing the *last* three characters of `"Hello"` in each language — the syntax for "from the end" differs more than the syntax for "from the start".

## javascript

```javascript
const s = "Hello"
console.log(s.slice(1))   // "ello"
```
Walkthrough: `slice(1)` returns every character from index 1 onward — a new
string, `"ello"`. `s` itself is never modified; `console.log(s)` afterward
would still print `"Hello"`.

## python

```python
s = "Hello"
print(s[1:])   # "ello"
```
Walkthrough: `s[1:]` is Python's slice syntax — everything from index 1 to
the end (the part after the colon is left blank, meaning "to the end").
Same result, `"ello"`, and `s` is unchanged afterward for the same reason —
Python strings are immutable too.

## java

```java
String s = "Hello";
System.out.println(s.substring(1));
```
Walkthrough: `substring(1)` returns a new `String` starting at index 1 —
`"ello"`. Java's `String` is also immutable, so `s` still refers to
`"Hello"` after this call.
