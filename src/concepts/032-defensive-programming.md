---
concept: 032-defensive-programming
name: Defensive Programming
---

## Definition

Defensive programming is writing code that checks its own assumptions and fails
clearly the moment they're violated, instead of trusting that inputs and internal
state will always be what the code expects.

## Problem

A function that blindly trusts its inputs will, sooner or later, be called with
something it wasn't designed for — and without a check, it won't fail where the
bad data entered. It'll fail somewhere else entirely, often much later and for a
completely different reason, making the real cause hard to find.

## Computer Science

Defensive programming treats every function boundary as a place where the
"contract" — what this function expects to receive, what it promises to return —
might be violated, and checks at that boundary. The earlier a bad value is
caught, the smaller the gap between the actual bug and where it surfaces.

Tags: Contracts, Preconditions, Fail-fast

## Software Engineering

In practice this means validating parameters, checking for null before
dereferencing, and guarding against edge cases like empty collections — every
tool already covered in this series (throw, try/catch, assertions) is something
defensive programming uses. The discipline is applying them consistently at every
boundary, not just where a bug has already been found once.

Tags: Input validation, Null checks, Guard clauses

## Common Mistakes

- Only adding a defensive check after a bug caused by its absence has already happened once, instead of checking the assumption at every boundary from the start.
- Being so defensive that every function is wrapped in redundant checks for conditions the type system or the calling code already guarantees — this adds noise without adding real safety.

## Exercises

- In the JavaScript example, call `getFirstChar` with an empty string and observe the guard clause catch it before the risky code ever runs.
- In Python, remove the guard check entirely and predict which line would actually fail, and with what kind of error, once the check is gone.

## javascript

```javascript
function getFirstChar(text) {
  if (typeof text !== 'string' || text.length === 0) {
    throw new TypeError('getFirstChar expects a non-empty string')
  }
  return text[0]
}
console.log(getFirstChar(''))
```
Walkthrough: the guard clause checks the assumption `getFirstChar` actually
depends on — a non-empty string — before touching `text[0]` at all. Without it,
`text[0]` on an empty string would just silently return `undefined`, a bug that
could go unnoticed instead of failing loudly right where the bad input came in.

## python

```python
def get_first_char(text):
    if not isinstance(text, str) or len(text) == 0:
        raise TypeError('get_first_char expects a non-empty string')
    return text[0]

print(get_first_char(''))
```
Walkthrough: same guard-clause shape — checking the assumption up front means
the failure has a clear message pointing at the actual violated assumption,
instead of Python's own `IndexError` on `text[0]` further down, which wouldn't
explain *why* the string was empty in the first place.

## java

```java
static char getFirstChar(String text) {
    if (text == null || text.isEmpty()) {
        throw new IllegalArgumentException("getFirstChar expects a non-empty string");
    }
    return text.charAt(0);
}

System.out.println(getFirstChar(""));
```
Walkthrough: same defensive check, catching both `null` and empty-string cases
before `charAt(0)` runs — without it, an empty string would throw Java's own
`StringIndexOutOfBoundsException` instead, accurate but silent about the real
problem: the caller passed an empty string.
