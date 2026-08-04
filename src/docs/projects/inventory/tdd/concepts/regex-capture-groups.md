# Concept: Regex Capture Groups

**What you'll understand by the end:** how parentheses in a regex pattern let you extract specific pieces of a match instead of the whole matched text, and the difference between a capturing and non-capturing group.

**Prerequisites:** `python-regex-search-findall.md`.

## Setup

Python 3, no packages needed.

## The Problem

Sometimes a match needs to be broken into named pieces — a date matched as one string is less useful than the year, month, and day matched as three separate, retrievable pieces.

## The Isolated Example

```python
import re

print(re.findall(r"([a-z])(\d+)", "a1 b22"))
```

**Real output:**
```
[('a', '1'), ('b', '22')]
```

**What this proves:** parentheses `(...)` in a pattern create **capture groups** — instead of just matching, the pattern remembers *which part* matched each parenthesized piece. `[a-z]` matches one lowercase letter; `\d+` matches one-or-more digits. With two groups, `findall` returns a list of tuples — one tuple per match, one element per group — instead of whole-match strings.

A non-capturing group, grouping without extracting:
```python
print(re.findall(r"\d+(?:px|em)", "10px 2em 5px"))
```
```
['10px', '2em', '5px']
```

**What this proves:** `(?:px|em)` groups the alternation `px|em` together (so `|` applies to the whole unit, not just part of the pattern) without creating a numbered capture — the result is still whole matched strings, not tuples, because nothing was captured.

## Mechanical Walkthrough

- `([a-z])` — a capturing group: exactly one lowercase letter, remembered as "group 1."
- `(\d+)` — a second capturing group: one or more digits, remembered as "group 2."
- With `re.search`, `.group(1)` and `.group(2)` retrieve each captured piece individually from a single match. With `re.findall` and multiple groups, each match becomes a tuple of its captured pieces, in order.
- `(?:...)` is a non-capturing group — parentheses that group pattern pieces together (so a quantifier like `?` or an alternation like `|` applies to the whole group at once) without creating a numbered capture to retrieve later.

## CS Lens

Capture groups implement a form of **structured extraction** on top of pattern matching — the regex engine doesn't just answer "does this match," it tracks *which substring* corresponds to each labeled sub-pattern, turning unstructured text into structured pieces in one pass.

Also recognized in: any parsing tool that extracts named fields from matched text — log parsers pulling a timestamp and a message out of one line, URL routers extracting path parameters (`/users/:id`) from a matched route.

## SE Lens

Non-capturing groups exist specifically for cases where grouping is needed for the pattern's own structure (attaching a quantifier to an alternation, for example) but the matched text of that sub-piece isn't actually needed afterward. Using a capturing group when the value is never read adds noise to every result (an extra tuple element to ignore) — a small but real readability cost that non-capturing groups avoid.

## Connection

Builds directly on `python-regex-search-findall.md`. This is the exact mechanism a real G-code-style tokenizer needs — one group for a letter, one for the number following it, extracted as a pair per match rather than as one undifferentiated matched string.

## Try It Yourself

1. Add a third capture group to the pattern (e.g. `([a-z])(\d+)(!*)` matching an optional trailing run of `!` characters) against `"a1! b22"`. Confirm each tuple now has three elements, including an empty string where no `!` was present.
2. Use `re.search` (not `findall`) with the two-group pattern against `"x9"` and call `.group(1)` and `.group(2)` separately. Also try `.groups()` (no arguments) and observe it returns all captured groups as one tuple.
3. Replace one of the capturing groups with a non-capturing one (`(?:[a-z])(\d+)`) and rerun `findall` against the same input. Confirm the result is now a plain list of strings (just the digits), not tuples — proof that only *capturing* groups affect the result shape.

## A Second Real Facet: Inspecting `.groups` to Decide *Whether* a Value Was Captured

Every use of capture groups so far assumed the pattern's own shape —
how many groups it has — was already known when the code was written.
A real, genuinely different situation: a pattern supplied **at
runtime**, arbitrary, never written by the code reading it, where the
code itself has to first ask "does this pattern even have a capture
group?" before it can safely call `.group(1)` at all.

```python
import re

# A pattern WITH a capture group.
p1 = re.compile(r"M3([0-9][0-9])")
print("p1.groups (count):", p1.groups)
m1 = p1.search("N10 M300")
print("m1.group(1):", m1.group(1))

# A pattern with NO capture group -- a plain fixed code.
p2 = re.compile(r"M100")
print("p2.groups (count):", p2.groups)
m2 = p2.search("N10 M100")
print("m2 matched:", m2.group(0))
try:
    m2.group(1)
except IndexError as e:
    print(f"IndexError: {e}")
```

**Real output, run this session:**
```
p1.groups (count): 1
m1.group(1): 00
p2.groups (count): 0
m2 matched: M100
IndexError: no such group
```

**What this proves:** `p1.groups` — a real, plain **integer attribute**
on a compiled `Pattern` object, not the `match.groups()` *method* this
file's own Try It Yourself #2 already uses — correctly reported `1` for
a pattern with one capture group, and `0` for a pattern with none.
Calling `m2.group(1)` against a match with no capture group at all
genuinely **raised** `IndexError` — there's no "group 1" to return,
because `p2`'s own pattern text never defined one. Checking `p1.groups
>= 1` (or, equivalently here, `> 0`) *before* calling `.group(1)` is
what makes it safe to handle both a plain, fixed literal-as-regex
(`M100`, no group) and a genuinely parameterized pattern (`M3([0-9][0-9])`,
one group) with the identical code path, deciding at runtime which case
applies rather than assuming one or the other in advance.

**Mechanical note:** `regex.groups` (an attribute, no parentheses) and
`match.groups()` (a method call) are two genuinely different, easily
confused real APIs — the attribute is a single integer, known the
moment the pattern is compiled, entirely independent of any specific
match; the method returns a tuple of the *actual matched text* for
every group, and only exists on a real `Match` object, after a search
has already succeeded.

### Try It Yourself (second facet)

1. Compile a pattern with **two** capture groups and confirm
   `.groups` correctly reports `2` — direct, real proof the attribute
   counts groups defined in the pattern text itself, not anything about
   a particular match.
2. Write a small function `extract_value(pattern_text, line)` that
   compiles `pattern_text`, searches `line`, and returns `match.group(1)`
   if a capture group exists or `None` otherwise — using `.groups` to
   decide, exactly as this facet's own example does inline. Call it with
   both a grouped and an ungrouped pattern and confirm both produce
   sensible results, with neither ever raising `IndexError`.
3. Explain, in your own words, why this "check-before-you-call" pattern
   matters specifically when the regex pattern itself is **user-supplied
   at runtime** (this file's own hardcoded examples never needed it) —
   connect your answer to `exception-vs-return-value-invalid-input-
   signaling.md`'s own framing of anticipated-vs-unanticipated failure.
