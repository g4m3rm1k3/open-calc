---
concept: 077-regular-expressions
name: Regular Expressions
---

## Definition

A regular expression (regex) is a pattern that describes a set of matching
text — used to search, validate, or extract substrings that fit a
particular shape, rather than matching one exact literal string.

## Problem

Checking whether a string "looks like" an email address, a phone number, or
contains any word starting with a capital letter can't be done with a plain
equality check or even a simple substring search — the shape being matched
has variable, optional, or repeated parts. Regex gives a compact, standard
notation for describing shapes like that directly.

## Execution

Pattern: `\d{3}-\d{4}` (three digits, a dash, four digits)
↓
Scanning input "Call 555-1234 now"
↓
The engine tries to match starting at each position in turn
↓
At the position where "555-1234" begins: `\d{3}` matches "555", `-` matches
"-", `\d{4}` matches "1234"
↓
Full match found: "555-1234"

## Computer Science

A regex is compiled internally into a finite automaton — a state machine —
that consumes the input one character at a time, transitioning between
states based on which pattern element matches next. This is why matching is
fast for most patterns (each character examined roughly once), though
certain constructs (heavy backtracking combined with nested repetition) can
degrade to exponential time on adversarial input — a real, named
vulnerability class (ReDoS).

Tags: Finite automaton, Pattern matching, Backtracking, ReDoS

## Software Engineering

Regex is powerful but famously hard to read back later — a complex pattern
with no comments or names is often described as "write-only." Most
languages support named capture groups and verbose/extended modes
specifically to make a regex somewhat self-documenting, and it's worth
reaching for a plain string method instead of regex whenever the pattern
being matched is actually just a literal substring.

Tags: Readability, Named capture groups, Overuse, Input validation

## Common Mistakes

- Reaching for regex to validate something with much stricter rules than it can actually enforce (like "a genuinely deliverable email address") — regex can check the general shape, but true validation requires more than pattern matching.
- Writing a pattern with nested repetition against untrusted input — certain nested-repetition patterns can force the matching engine into catastrophic backtracking, taking exponential time on a maliciously crafted input (ReDoS).

## Exercises

- Write a regex that matches a simple phone-number shape and test it against a few strings that should and shouldn't match.
- Look up "catastrophic backtracking" / ReDoS and find one real, historical incident where a regex pattern caused a production outage.

## javascript

```javascript
const phonePattern = /\d{3}-\d{4}/

console.log(phonePattern.test('Call 555-1234 now'))   // true
console.log(phonePattern.test('no numbers here'))     // false

const match = 'Call 555-1234 now'.match(phonePattern)
console.log(match[0])   // '555-1234'
```
Walkthrough: `\d{3}` matches exactly three digits, `-` matches a literal
dash, `\d{4}` matches exactly four digits — together they only match text
with that exact shape. `.test()` returns whether any match exists anywhere
in the string; `.match()` returns the actual matched substring, found
starting at the first position where the whole pattern lines up.

## python

```python
import re

phone_pattern = r'\d{3}-\d{4}'

print(bool(re.search(phone_pattern, 'Call 555-1234 now')))   # True
print(bool(re.search(phone_pattern, 'no numbers here')))     # False

match = re.search(phone_pattern, 'Call 555-1234 now')
print(match.group())   # '555-1234'
```
Walkthrough: identical pattern and identical matching behavior to the
JavaScript version — Python's `re.search` returns a match object (or
`None`) rather than a boolean directly, and `.group()` extracts the actual
matched substring from it, playing the same role as JavaScript's
`.match()[0]`.
