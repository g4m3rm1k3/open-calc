---
concept: string-slicing
name: String Slicing
---

Sometimes you only want part of a string instead of the entire string.
Slicing returns a new string containing only the characters you requested —
the original string is unchanged.

**CS lens:** Slicing returns a *copy* of a range, not a reference into the
original — the original string's characters are never mutated, because
strings are immutable in every language shown here. This is different from
slicing a mutable array, where some languages return a view into the same
underlying memory instead of a copy.

**SE lens:** Reaching for a slice instead of a manual character-by-character
loop states intent directly — "I want this range" — instead of the mechanics
of getting there. It also removes an entire category of off-by-one bugs: the
start/end bounds are handled once, by the language, not re-derived by hand
at every call site.

```javascript
const s = "Hello"
console.log(s.slice(1))   // "ello"
```
Walkthrough: `slice(1)` returns every character from index 1 onward — a new
string, `"ello"`. `s` itself is never modified; `console.log(s)` afterward
would still print `"Hello"`.

```python
s = "Hello"
print(s[1:])   # "ello"
```
Walkthrough: `s[1:]` is Python's slice syntax — everything from index 1 to
the end (the part after the colon is left blank, meaning "to the end").
Same result, `"ello"`, and `s` is unchanged afterward for the same reason —
Python strings are immutable too.

```java
String s = "Hello";
System.out.println(s.substring(1));
```
Walkthrough: `substring(1)` returns a new `String` starting at index 1 —
`"ello"`. Java's `String` is also immutable, so `s` still refers to
`"Hello"` after this call.
