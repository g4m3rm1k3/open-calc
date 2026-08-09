# Lesson 77: What Actually Changed — a Diff and Patch Tool from Scratch

**What you will build:** a `diff(a, b)` function that computes a real,
minimal line-by-line difference between two files, a `format_diff`
that renders it readably, and an `apply_patch` that reconstructs one
file from the other plus the diff — and, critically, refuses to do so
silently if the starting file has drifted from what the diff expects.
The working feature is a real diff/patch pair. The transferable
problem: comparing two versions of something isn't the same problem
as comparing item-by-item at matching positions — a single insertion
anywhere in the middle breaks positional comparison completely, and
this lesson builds the actual technique (not a shortcut) that survives
that.

**What you need to know first:** Lesson 16 (compare two folders / sync
two directories) — that lesson compared *whole files* against each
other (same file, different, missing); this lesson goes one level
deeper, comparing the *contents* of two individual files, line by
line. Lesson 69 (merge sort) — this lesson's core structure is a 2D
table filled bottom-up, a different flavor of "break a problem into
smaller solved subproblems" than merge sort's split-in-half recursion,
worth contrasting directly. Track 12 as a whole is capstone-flavored —
this lesson leans on reasoning built across the entire curriculum
(2D arrays, backtracking through a table, sequence reconstruction)
without re-deriving any of it from zero.

---

## Concept Unit: The Problem — Position Isn't Identity

### The Problem

The obvious way to compare two files is line-by-line, at matching
positions: is line 0 of A the same as line 0 of B, line 1 the same as
line 1, and so on. This breaks the instant a single line is inserted
or removed anywhere before the end — every line *after* that point
shifts position, and a comparison keyed on position reports every one
of them as "different," even though most of them are actually
unchanged text that simply moved.

### The New Code

```python
file_a = ["def greet():", "    print('hello')", "    return None"]
file_b = ["def greet():", "    print('hi there')", "    print('hello')", "    return None"]

print("naive comparison, index by index:")
for i in range(max(len(file_a), len(file_b))):
    a_line = file_a[i] if i < len(file_a) else "<missing>"
    b_line = file_b[i] if i < len(file_b) else "<missing>"
    same = "same" if a_line == b_line else "DIFFERENT"
    print(f"  line {i}: {same}")
```

### Run It

```
naive comparison, index by index:
  line 0: same
  line 1: DIFFERENT
  line 2: DIFFERENT
  line 3: DIFFERENT
```

One line was inserted (`"    print('hi there')"`) — a single,
genuine change. Positional comparison reports **three** differences,
not one, because everything after the insertion shifted down by one
slot. This is discarded now; the rest of this lesson builds a
comparison that tracks *content*, not position.

### CS Lens

Comparing by position instead of by content is a recurring source of
cascading false positives, not unique to text diffing. Also recognized
in: comparing two versions of a spreadsheet by cell address after a
row was inserted, comparing two audio tracks sample-by-sample after
one has a slightly different start offset, comparing two DNA sequences
letter-by-letter after a single insertion mutation — all of these need
the same underlying idea this lesson builds: find what's genuinely
shared, and let insertions and deletions explain everything else.

---

## Concept Unit: The Longest Common Subsequence Table

### The Problem

What's actually needed is: the longest sequence of lines that appears,
*in the same relative order*, in both files (not necessarily
contiguous — lines can have other lines between them in either file
and still count). Once that's known, everything in A not part of it
was deleted, and everything in B not part of it was inserted. This
shared sequence is called the **longest common subsequence (LCS)**,
and it's computed by filling in a 2D table, one cell at a time, each
cell built from cells already solved.

### The New Code

```python
a = ["A", "B", "C"]
b = ["A", "X", "B", "C"]

rows, cols = len(a), len(b)
dp = [[0] * (cols + 1) for _ in range(rows + 1)]

for i in range(1, rows + 1):
    for j in range(1, cols + 1):
        if a[i - 1] == b[j - 1]:
            dp[i][j] = dp[i - 1][j - 1] + 1
        else:
            dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

for row in dp:
    print(row)
print("length of longest common subsequence:", dp[rows][cols])
```

### Run It

```
[0, 0, 0, 0, 0]
[0, 1, 1, 1, 1]
[0, 1, 1, 2, 2]
[0, 1, 1, 2, 3]
length of longest common subsequence: 3
```

### Mechanical Walkthrough

- `dp = [[0] * (cols + 1) for _ in range(rows + 1)]` — **first
  appearance of a 2D table in this project**, sized one larger than
  each input in both dimensions — reappearing the same
  "extra sentinel row/column avoids special-casing the edge" idea
  from Lesson 72's sentinel-bounded linked list, applied here to array
  indices instead of pointers: `dp[0][j]` and `dp[i][0]` represent
  "the LCS of an empty sequence with anything," which is always `0` —
  no special-case code needed, the table's own extra row and column
  already encode that fact.
- `if a[i - 1] == b[j - 1]:` — **note the `-1`.** `dp[i][j]` represents
  the answer for the first `i` lines of `a` and first `j` lines of
  `b`, but list indices are zero-based, so the *i-th* line of `a` is
  actually `a[i-1]`. This off-by-one is a real, easy-to-get-wrong
  detail worth naming explicitly, not glossing over.
- `dp[i][j] = dp[i - 1][j - 1] + 1` — **the core recurrence, case 1.**
  If the current lines match, the LCS length here is exactly one more
  than the LCS length *without* either of these two matching lines —
  `dp[i-1][j-1]`, the cell diagonally up-and-left, already solved.
- `dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])` — **case 2.** If the
  current lines don't match, the best LCS at this point is whichever
  is better: ignoring this line of `a` (`dp[i-1][j]`) or ignoring this
  line of `b` (`dp[i][j-1]`) — both already-solved smaller
  subproblems, one cell up, one cell left.
- Every cell depends only on cells already filled (up, left, or
  diagonal) — this is why the nested loop can fill the table in one
  pass, top-to-bottom, left-to-right, with no cell ever needed before
  it's been computed.

Reading the printed table: `dp[3][4] = 3` — matching the printed
`"length of longest common subsequence: 3"` — because `A, B, C` is a
length-3 subsequence common to both `["A","B","C"]` and
`["A","X","B","C"]` (with `X` simply skipped in `b`), and no longer
common subsequence exists.

### CS Lens

Solving a problem by filling in a table of subproblem answers,
bottom-up, so each cell reuses already-computed smaller answers
instead of recomputing them, is called **dynamic programming** — a
different strategy from Lesson 69's merge sort, worth contrasting
directly: merge sort recursively splits a problem in half and combines
solved halves back together (a top-down, divide-and-conquer shape);
this table fills bottom-up, left-to-right, with every cell reusing
neighbors already computed in the *same* pass, no recursive calls at
all. Also recognized in: Lesson 72's own bucket-array sizing tradeoff
(reusing already-computed bucket state rather than rescanning), any
"memoized" recursive function that caches subproblem results, and the
classic edit-distance problem (how many single-character edits turn
one string into another), which uses almost the identical table shape
as this one.

---

## Concept Unit: Backtracking Through the Table — Building the Diff

### The Problem

The table's bottom-right cell gives the LCS *length* — a single
number. To get an actual line-by-line diff (which lines matched, which
were removed, which were added), the table needs to be read
*backward*, from that final cell, reconstructing the path that
produced it.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition, extending the previous unit's table with backtracking
  logic.
- **Files affected:** `difftool.py` (new file).
- **Change type:** add.
- **Location:** n/a — brand-new file; `_lcs_table` moves here
  unchanged from the previous unit's lab.
- **Dependencies:** `_lcs_table`.

### The New Code

```python
def _lcs_table(a, b):
    rows, cols = len(a), len(b)
    dp = [[0] * (cols + 1) for _ in range(rows + 1)]
    for i in range(1, rows + 1):
        for j in range(1, cols + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp


def diff(a, b):
    dp = _lcs_table(a, b)
    i, j = len(a), len(b)
    ops = []
    while i > 0 and j > 0:
        if a[i - 1] == b[j - 1]:
            ops.append((' ', a[i - 1]))
            i -= 1
            j -= 1
        elif dp[i - 1][j] >= dp[i][j - 1]:
            ops.append(('-', a[i - 1]))
            i -= 1
        else:
            ops.append(('+', b[j - 1]))
            j -= 1
    while i > 0:
        ops.append(('-', a[i - 1]))
        i -= 1
    while j > 0:
        ops.append(('+', b[j - 1]))
        j -= 1
    ops.reverse()
    return ops
```

### Run It

```python
>>> from difftool import diff
>>> a = ["def greet():", "    print('hello')", "    return None"]
>>> b = ["def greet():", "    print('hi there')", "    print('hello')", "    return None"]
>>> for tag, line in diff(a, b):
...     print(tag, line)
  def greet():
+     print('hi there')
      print('hello')
      return None
```

(Displayed as printed — the leading space before unchanged lines is
the `' '` tag itself, same width as `'+'`/`'-'` so lines visually
align.)

### Mechanical Walkthrough

- `i, j = len(a), len(b)` — start at the table's bottom-right corner —
  the cell that represents "comparing everything against everything,"
  the same cell whose value was printed as the LCS length in the
  previous unit.
- `while i > 0 and j > 0:` — **first appearance of walking a table
  backward.** Each iteration looks at how the *current* cell's value
  was derived, and steps to whichever neighbor produced it — moving
  toward `dp[0][0]`, the table's other corner, one step at a time.
- `if a[i - 1] == b[j - 1]: ops.append((' ', a[i - 1])); i -= 1; j -= 1`
  — if these two lines matched (the same condition checked while
  *building* the table), this line was part of the LCS — record it as
  unchanged (`' '`) and step diagonally, matching exactly how this
  cell's value was computed going forward.
- `elif dp[i - 1][j] >= dp[i][j - 1]: ops.append(('-', a[i - 1])); i -= 1`
  — otherwise, this line wasn't part of the LCS on this path; check
  which neighbor (`dp[i-1][j]` or `dp[i][j-1]`) actually produced this
  cell's `max(...)` value during construction, and step that
  direction. Stepping up (`i -= 1`) means "this line of `a` wasn't
  used" — recorded as a **deletion**.
- `else: ops.append(('+', b[j - 1])); j -= 1` — stepping left instead
  means "this line of `b` wasn't used" — recorded as an **insertion**.
- The two `while i > 0:` / `while j > 0:` loops after the main loop —
  handle running off one edge of the table before the other (one file
  fully "explained," lines still remaining in the other) by recording
  the rest as pure deletions or pure insertions.
- `ops.reverse()` — the backward walk necessarily builds the list from
  the *end* of both files toward the beginning, so reversing restores
  natural reading order — the exact same reasoning as Lesson 71's
  `shortest_path`, reversing a path built backward from the goal.

### Execution Trace

`a = ["def greet():", "    print('hello')", "    return None"]`,
`b = ["def greet():", "    print('hi there')", "    print('hello')", "    return None"]`
— table built as in the previous unit's mechanism, backtrack from
`dp[3][4]`:

1. `dp[3][4]`: `a[2]="    return None"` vs `b[3]="    return None"` —
   match. Record `(' ', "    return None")`, step to `dp[2][3]`.
2. `dp[2][3]`: `a[1]="    print('hello')"` vs `b[2]="    print('hello')"`
   — match. Record `(' ', "    print('hello')")`, step to `dp[1][2]`.
3. `dp[1][2]`: `a[0]="def greet():"` vs `b[1]="    print('hi there')"`
   — no match. Compare `dp[0][2]` vs `dp[1][1]` to decide which
   neighbor produced this cell; stepping left records
   `('+', "    print('hi there')")`, moving to `dp[1][1]`.
4. `dp[1][1]`: `a[0]="def greet():"` vs `b[0]="def greet():"` — match.
   Record `(' ', "def greet():")`, step to `dp[0][0]` — loop ends,
   `i=0` and `j=0`.
5. Reverse the collected list: `def greet():` (context), `print('hi
   there')` (insertion), `print('hello')` (context), `return None`
   (context) — matching the real printed output exactly, one
   insertion, zero deletions, for a change that really was a pure
   insertion.

### CS Lens

Reconstructing an actual solution by retracing *how* each table cell
was derived, rather than just reading off a summary number, is the
second half of dynamic programming, often skipped in a first pass at
the technique and worth naming as its own step: computing the table
alone answers "how similar are these two things" (a length, a
distance, a score); backtracking through it answers the usually
more useful question, "specifically how do they differ."

---

## Concept Unit: `format_diff` and `apply_patch`

### The Problem

A list of `(tag, line)` tuples is correct but not directly readable,
and — the "patch" half of this lesson — nothing yet uses a diff for
anything beyond describing a change; a real patch tool applies that
description to reconstruct one file from the other.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `difftool.py`.
- **Change type:** add.
- **Location:** immediately after `diff`.
- **Dependencies:** `diff`'s output format (a list of `(tag, line)`
  tuples).

### The New Code

```python
def format_diff(ops):
    lines = []
    for tag, line in ops:
        lines.append(f"{tag} {line}")
    return "\n".join(lines)


def apply_patch(original, ops):
    result = []
    orig_index = 0
    for tag, line in ops:
        if tag == ' ':
            if orig_index >= len(original) or original[orig_index] != line:
                raise ValueError(f"patch context mismatch at line {orig_index}: expected {line!r}")
            result.append(line)
            orig_index += 1
        elif tag == '-':
            if orig_index >= len(original) or original[orig_index] != line:
                raise ValueError(f"patch context mismatch at line {orig_index}: expected {line!r}")
            orig_index += 1
        elif tag == '+':
            result.append(line)
    return result
```

### Run It

```python
>>> from difftool import diff, format_diff, apply_patch
>>> a = ["def greet():", "    print('hello')", "    return None"]
>>> b = ["def greet():", "    print('hi there')", "    print('hello')", "    return None"]
>>> ops = diff(a, b)
>>> print(format_diff(ops))
  def greet():
+     print('hi there')
      print('hello')
      return None
>>> patched = apply_patch(a, ops)
>>> patched == b
True
```

```
  def greet():
+     print('hi there')
      print('hello')
      return None
---
patched: ['def greet():', "    print('hi there')", "    print('hello')", '    return None']
matches b: True
```

Real round-trip, confirmed: computing `diff(a, b)`, then applying that
exact diff back onto `a`, reproduces `b` exactly.

### Mechanical Walkthrough

- `format_diff` — already-basic string building, no new concepts;
  worth noting only that the tag itself (`' '`, `'-'`, `'+'`) is
  reused directly as the display prefix, the same value serving both
  as internal data and as human-readable output.
- `def apply_patch(original, ops): result = []; orig_index = 0` —
  **first appearance of walking a diff forward to reconstruct a file.**
  `orig_index` tracks position in the *original* file as the patch is
  applied — separate from `result`, which is being built as the new,
  patched file.
- `if tag == ' ': if orig_index >= len(original) or original[orig_index] != line: raise ValueError(...)`
  — **the actual point of a real patch tool, not just line
  replaying.** Before trusting a context or deletion line, this checks
  that the original file, *at the position the patch expects*, still
  contains exactly the line the diff was computed against. If it
  doesn't — because the file changed since the diff was made — this
  raises immediately rather than silently building a corrupted result.
- `elif tag == '-': ... orig_index += 1` — a deletion is verified the
  same way (it must match what's actually in `original`) and then
  *not* appended to `result` — this is what actually removes it from
  the patched output.
- `elif tag == '+': result.append(line)` — an insertion is appended to
  `result` without touching `orig_index` at all — it doesn't consume
  anything from the original file, because it wasn't there to begin
  with.

### CS Lens

Verifying that the input still matches what an operation was computed
against, before applying that operation, rather than trusting it
blindly, is the same discipline behind a database transaction's
optimistic-concurrency check (has this row changed since I read it?),
a compare-and-swap CPU instruction, and Git's own merge conflict
detection — all refuse to silently overwrite something that's drifted
from an assumed starting state.

---

## What Breaks Without This — Patching a Drifted File

### The New Code

```python
from difftool import diff, apply_patch

a = ["def greet():", "    print('hello')", "    return None"]
b = ["def greet():", "    print('hi there')", "    print('hello')", "    return None"]

ops = diff(a, b)

# Someone else already changed the ORIGINAL file since this diff was made --
# this is drifted, no longer the exact 'a' the diff was computed against.
drifted_a = ["def greet():", "    print('HELLO WORLD')", "    return None"]

try:
    apply_patch(drifted_a, ops)
except ValueError as e:
    print(f"ValueError: {e}")
```

### Run It

```
ValueError: patch context mismatch at line 1: expected "    print('hello')"
```

Real, correct failure: the diff was computed against a specific
version of `a`; `drifted_a` is a *different* file that happens to
share most of its lines. Applying the old patch to it would produce a
result nobody actually asked for — a mix of the original diff's
intent and content it was never checked against. Catching this
requires exactly the verification built into `apply_patch` above;
remove those `if ... raise ValueError` checks, and this same call
would silently produce `["def greet():", "    print('hi there')",
"    print('HELLO WORLD')", "    return None"]` — a file that looks
plausible, compiles, runs, and is quietly wrong, having discarded the
`HELLO WORLD` edit no diff ever accounted for.

## Exercises

- Add line numbers to `format_diff`'s output, tracking a running
  original-file line counter alongside each `' '`/`'-'` line — closer
  to a real unified-diff header.
- Extend `diff` to operate on individual *characters* within a line
  instead of whole lines — the same LCS table and backtracking
  mechanism applies unchanged, just with `a` and `b` as strings
  instead of lists of lines. Compare the output against
  `difflib.ndiff` from Python's standard library on a short example.
- Measure and report the LCS table's memory cost for two 1,000-line
  files (a 1000×1000 table) and research **Hunt–McIlroy** or
  **Myers' diff algorithm** — the actual algorithms real diff tools
  use, which avoid building the full table this lesson does.
- Add a `--reverse` mode to `apply_patch` that takes `b` and the same
  diff and reconstructs `a` — the inverse operation, useful for
  "revert this change."

## Definition of Done

- [ ] `diff`, `format_diff`, and `apply_patch` implemented and run,
      matching every trace above.
- [ ] The naive positional-comparison failure reproduced for real,
      confirming a single insertion cascades into multiple false
      "DIFFERENT" reports.
- [ ] The LCS table for a small real example built and printed,
      confirming the bottom-right cell's value matches the length of
      an actual common subsequence you can point to by hand.
- [ ] The full round-trip confirmed: `apply_patch(a, diff(a, b)) == b`,
      on your own chosen `a` and `b`, not just the example above.
- [ ] The drifted-file patch failure actually triggered, confirming a
      real `ValueError` rather than silent, wrong output.
- [ ] Can explain out loud, without looking at the code, why
      backtracking through the LCS table has to move diagonally on a
      match but up-or-left (chosen by comparing neighbor values) on a
      mismatch.
- [ ] Committed, with a message explaining *why* — e.g. `"Diff and
      patch from scratch: LCS table finds what's shared, backtracking
      reconstructs the edit script, and patch verifies context before
      trusting it"` — not `"add difftool.py"`.
