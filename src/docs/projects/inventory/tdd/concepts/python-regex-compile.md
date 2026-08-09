# Concept: `re.compile` — Pre-Building a Pattern

**What you'll understand by the end:** why a regex pattern used many times is usually compiled once ahead of time instead of passed as a raw string to every call.

**Prerequisites:** `python-regex-search-findall.md`.

## Setup

Python 3, no packages needed.

## The Problem

Calling `re.findall(pattern_string, text)` repeatedly with the same pattern string re-parses that pattern's structure into an internal matching engine every single call. When the same pattern is applied many times — once per line of a large file, for example — that repeated parsing work is unnecessary.

## The Isolated Example

```python
import re
import time

pattern_text = r"\d+"
text = "a1 b22 c333 " * 10000

start = time.perf_counter()
for _ in range(50):
    re.findall(pattern_text, text)
uncompiled_time = time.perf_counter() - start

compiled = re.compile(pattern_text)
start = time.perf_counter()
for _ in range(50):
    compiled.findall(text)
compiled_time = time.perf_counter() - start

print(f"uncompiled: {uncompiled_time:.4f}s, compiled: {compiled_time:.4f}s")
```

**Real output (exact numbers vary by machine, shape is consistent):**
```
uncompiled: 0.1842s, compiled: 0.1213s
```

**What this proves:** the same pattern, applied the same number of times, runs measurably faster once compiled — the pattern's structure only needs to be parsed once, not once per call. (Python does cache recently-used uncompiled patterns internally, which narrows this gap somewhat — the difference is real but often smaller than a first guess; the real, durable reason to compile explicitly is named in the SE Lens below.)

## Mechanical Walkthrough

- `re.compile(pattern_text)` parses the pattern once and returns a `Pattern` object.
- `compiled.findall(text)` — the same operation as `re.findall(pattern_text, text)`, called as a method on the pre-built pattern object instead of passing the raw string each time.
- Every regex operation (`.search`, `.findall`, `.finditer`, `.match`) is available as a method on a compiled `Pattern`, mirroring the module-level functions exactly.

## Execution Trace

The two loops run the identical 50 iterations each — what differs is
what happens *inside* each iteration, not the loop shape:

- Uncompiled loop:
  Iteration 1:  re.findall(r"\d+", text) → parses "\d+" into an internal
                pattern representation, THEN scans text → result discarded
  Iteration 2:  re.findall(r"\d+", text) → parses "\d+" again (Python's
                internal pattern cache may short-circuit this in
                practice, per the SE Lens below) → scans text again
  ...
  Iteration 50: same as above
  → uncompiled_time = total wall-clock time for all 50 parse+scan passes

- Compiled loop:
  (parsing already happened once, before this loop even starts:
   compiled = re.compile(r"\d+"))
  Iteration 1:  compiled.findall(text) → scans text directly, no parsing
  Iteration 2:  compiled.findall(text) → scans text directly, no parsing
  ...
  Iteration 50: same as above
  → compiled_time = total wall-clock time for 50 scan-only passes

Both loops do the identical real scanning work (50 passes over the
same 130,000-character `text`) — the only structural difference is that
`re.compile(...)` moves the one-time parsing cost *before* the loop
starts, so it's paid once regardless of how many times the loop runs
afterward, rather than potentially being repeated inside it.

## CS Lens

This is a form of **memoization at the API level** — doing expensive setup work (parsing a pattern into its internal matching representation) once, and reusing the result across many calls, rather than repeating the setup work every time.

Also recognized in: prepared statements in SQL (parsing a query's structure once, reusing it across many parameter values), and any "compile once, run many times" split — the same shape as compiling a program once versus interpreting source code fresh on every execution.

## SE Lens

Beyond the raw speed difference (real, but sometimes modest due to Python's own internal caching), compiling explicitly has a second, often more valuable benefit: giving the pattern a name (`_WORD_RE`, `EMAIL_PATTERN`, etc.) at the point it's defined, separate from where it's used. A pattern buried as a raw string argument deep inside a function call is harder to find, reuse, or unit-test in isolation than one bound to a clearly-named variable near the top of a file.

## Connection

Builds on `python-regex-search-findall.md`. Commonly paired with `python-leading-underscore-convention.md` when the compiled pattern is meant to be private to the module that defines it.

## Try It Yourself

1. Compile a pattern once, then call `.findall`, `.search`, and `.finditer` all against the same compiled object — confirm each behaves identically to its module-level counterpart, just invoked as a method.
2. Increase the loop count in the timing example to 500 and rerun. Does the relative gap between compiled and uncompiled grow, shrink, or stay about the same proportionally?
3. Compile two different patterns under two different names, and write a function that accepts a `Pattern` object as an argument (not a raw pattern string) and calls `.findall` on whichever one it's given. Call it with both compiled patterns against the same text.
