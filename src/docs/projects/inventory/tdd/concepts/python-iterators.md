# Concept: Python Iterators (`finditer` and the Iterator Protocol)

**What you'll understand by the end:** the difference between a function that returns a full list immediately and one that yields items one at a time, and why that difference matters.

**Prerequisites:** `python-regex-search-findall.md`.

## Setup

Python 3, no packages needed.

## The Problem

Some operations naturally produce a sequence of results that could be very long, or expensive to compute all at once. Building the *entire* result as a list before returning anything wastes memory and time when the caller only needs to look at results one at a time, possibly stopping early.

## The Isolated Example

```python
import re

text = "a1 b22 c333"

all_at_once = re.findall(r"\d+", text)
print(type(all_at_once), all_at_once)

one_at_a_time = re.finditer(r"\d+", text)
print(type(one_at_a_time))
for match in one_at_a_time:
    print("got a Match object:", match, "->", match.group())
```

**Real output:**
```
<class 'list'> ['1', '22', '333']
<class 'callable_iterator'>
got a Match object: <re.Match object; span=(1, 2), match='1'> -> 1
got a Match object: <re.Match object; span=(4, 6), match='22'> -> 22
got a Match object: <re.Match object; span=(8, 11), match='333'> -> 333
```

**What this proves:** `findall` computed and returned every result as a real, complete `list` before the `print` even ran. `finditer` returned an **iterator** immediately — not the results themselves, but something a `for` loop can step through, producing one full `Match` object at a time as the loop asks for the next one. Note also what each yields: `findall` reduced each match down to a plain string; `finditer` hands back the full `Match` object, which is why `.group()` is available in the loop above but wouldn't be needed (or possible, on a plain string) with `findall`'s results.

## Mechanical Walkthrough

- `re.findall(...)` matches everything and builds a full `list` before returning — the entire result exists in memory at once, whether the caller ends up using all of it or not.
- `re.finditer(...)` returns an iterator object — calling it doesn't do any matching work yet. Each step of the `for` loop pulls the *next* match, doing just enough work to find it, not the whole text at once.
- A `for` loop over any iterator repeatedly asks it "what's next," until it signals there's nothing left, at which point the loop ends automatically.

## CS Lens

This is **lazy evaluation** — deferring work until its result is actually needed, one piece at a time, rather than computing everything eagerly up front. The **iterator protocol** is the general mechanism behind it: any object implementing "give me the next item, or tell me you're done" can be looped over with `for`, regardless of what it represents internally.

Also recognized in: database query cursors (fetching rows one batch at a time instead of loading an entire table into memory), file objects read line-by-line (`for line in open(path)`), and generator functions (`yield`) — a different syntax producing the same lazy, one-at-a-time behavior.

## SE Lens

For a small input, the difference is invisible — both approaches finish instantly. The real payoff shows up with large or expensive-to-produce sequences: an iterator lets code process the first result the moment it's available, and lets a loop `break` early without ever computing the remaining items — a real, meaningful savings `findall`'s eager, everything-up-front approach cannot offer, since by the time you have the list, all the work is already done regardless of whether you use it.

## Connection

Builds on `python-regex-search-findall.md`. This distinction (eager list vs. lazy iterator) recurs constantly in real Python code well beyond regex — `range()`, `dict.items()`, and file objects all follow the same "why build the whole thing up front" reasoning.

## Try It Yourself

1. Time `re.findall` versus looping `re.finditer` and `break`-ing after the first match, against a very large string (e.g. `"x1 " * 1_000_000`). Confirm the `finditer`-with-early-break version is dramatically faster, since it never needs to find the remaining matches at all.
2. Call `next()` manually on a `finditer` result (`it = re.finditer(...); next(it)`) twice in a row without a `for` loop, and observe you get one `Match` object per call — the exact mechanism a `for` loop is doing on your behalf. Call `next()` one time too many and observe the real `StopIteration` exception a `for` loop normally catches invisibly.
3. Convert an iterator into a real list explicitly with `list(re.finditer(...))`. Confirm this now behaves like `findall` in terms of "all the work happens immediately" — but still yields full `Match` objects, not strings, showing the "list vs. iterator" and "what each match becomes" are two independent choices, not the same one.
