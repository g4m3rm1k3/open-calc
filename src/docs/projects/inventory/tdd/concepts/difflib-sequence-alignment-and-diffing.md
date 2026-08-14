# Concept: Sequence Alignment and Diffing (`difflib.SequenceMatcher`)

**What you'll understand by the end:** how `difflib.SequenceMatcher`
finds the real, longest matching blocks between two sequences and
expresses everything else as `equal`/`replace`/`delete`/`insert`
opcodes, how a `"replace"` opcode's two sides can genuinely differ in
length, and how this connects to the broader, formal **sequence
alignment** / **edit distance** family of problems.

**Prerequisites:** `python-tuple-unpacking.md`,
`python-zip-builtin-and-strict.md`, `python-dataclasses.md`.

## Setup

Python 3, no packages needed (`difflib` is standard library).

## The Problem

Comparing two real, related sequences (two versions of a text file,
two lists of names) to show *what changed* — not just "these differ"
but specifically which parts are the same, which were changed, added,
or removed — is a genuinely nontrivial algorithmic problem: naive
line-by-line comparison breaks completely the moment a single line is
inserted or deleted partway through, since every line *after* the
change would then appear to differ, even though most of the real
content is identical.

## The Isolated Example

```python
import difflib

left = ["apple", "banana", "cherry", "date"]
right = ["apple", "blueberry", "cherry", "date", "fig"]

matcher = difflib.SequenceMatcher(None, left, right)

for tag, i1, i2, j1, j2 in matcher.get_opcodes():
    print(f"{tag:8} left[{i1}:{i2}]={left[i1:i2]!r}  right[{j1}:{j2}]={right[j1:j2]!r}")

print("real similarity ratio:", matcher.ratio())
```

**Real output, run this session:**
```
equal    left[0:1]=['apple']  right[0:1]=['apple']
replace  left[1:2]=['banana']  right[1:2]=['blueberry']
equal    left[2:4]=['cherry', 'date']  right[2:4]=['cherry', 'date']
insert   left[4:4]=[]  right[4:5]=['fig']
real similarity ratio: 0.6666666666666666
```

**What this proves:** `SequenceMatcher` correctly identified
`"apple"` and the `["cherry", "date"]` run as real, unchanged, matching
blocks (`equal`), despite `"banana"`/`"blueberry"` differing between
them and `"fig"` only existing on the right — it aligned the *rest* of
the sequence correctly around that one real change, rather than
treating everything after the difference as also different.

A real, complete `DiffRow`-building example, showing a `"replace"`
segment whose two sides genuinely differ in length:

```python
import difflib
from dataclasses import dataclass


@dataclass
class DiffRow:
    left: str | None
    right: str | None
    kind: str


def diff_lines(left_text, right_text):
    left_lines = left_text.splitlines()
    right_lines = right_text.splitlines()
    matcher = difflib.SequenceMatcher(None, left_lines, right_lines)
    rows = []
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        left_segment = left_lines[i1:i2]
        right_segment = right_lines[j1:j2]
        if tag == "equal":
            for l, r in zip(left_segment, right_segment, strict=True):
                rows.append(DiffRow(l, r, "equal"))
        elif tag == "replace":
            length = max(len(left_segment), len(right_segment))
            for idx in range(length):
                l = left_segment[idx] if idx < len(left_segment) else None
                r = right_segment[idx] if idx < len(right_segment) else None
                rows.append(DiffRow(l, r, "replace"))
        elif tag == "delete":
            for l in left_segment:
                rows.append(DiffRow(l, None, "delete"))
        elif tag == "insert":
            for r in right_segment:
                rows.append(DiffRow(None, r, "insert"))
    return rows


left_text = "one\ntwo\nthree\nfour"
right_text = "one\nTWO\nTOO\nthree\nfive"

for row in diff_lines(left_text, right_text):
    print(row)
```

**Real output, run this session:**
```
DiffRow(left='one', right='one', kind='equal')
DiffRow(left='two', right='TWO', kind='replace')
DiffRow(left=None, right='TOO', kind='replace')
DiffRow(left='three', right='three', kind='equal')
DiffRow(left='four', right='five', kind='replace')
```

**What this proves:** the second real `"replace"` block genuinely
spans **one** left line (`"two"`) against **two** right lines
(`"TWO"`, `"TOO"`) — a real, uneven replace, correctly producing one
`DiffRow` with a real value on both sides, and a second `DiffRow` with
`left=None` (nothing left to pair it with) — direct, real proof that a
`"replace"` opcode's two sides are not guaranteed equal length, and
that padding the shorter side with `None` is genuinely necessary, not
a defensive nicety for a case that can't happen.

## Mechanical Walkthrough

- `SequenceMatcher(None, a, b)`'s first argument is a real, optional
  "junk" filter callback — `None` means no elements are treated as
  junk (ignored for matching purposes); real use cases like diffing
  source code sometimes pass a function ignoring purely-whitespace
  lines so they don't dominate the matching.
- `.get_opcodes()` returns a real, ordered list of 5-tuples
  `(tag, i1, i2, j1, j2)` — `tag` is one of `"equal"`, `"replace"`,
  `"delete"`, `"insert"`; `left[i1:i2]` and `right[j1:j2]` are the real
  corresponding slices on each side for that one opcode.
- The opcodes, taken together, always cover the **entire** real length
  of both sequences, in order — every real element of both `left` and
  `right` appears in exactly one opcode's own slice.
- `"equal"` opcodes always have same-length slices on both sides (by
  definition — they matched exactly); `"replace"` opcodes have **no**
  such guarantee, since the algorithm decided these two segments
  correspond even though they differ in real content and potentially
  real length too.
- `str.splitlines()` — used here to turn each real text blob into a
  list of lines — recognizes several real line-boundary characters
  (`\n`, `\r\n`, and others), not just a bare `\n`, a real, small
  advantage over a naive `.split("\n")` when a file's real line endings
  aren't guaranteed consistent.

## CS Lens

This is a real, concrete instance of the **sequence alignment**
problem — finding a correspondence between two sequences that
maximizes (or, depending on framing, minimizes some cost of) matching
elements, a problem family that also includes **edit distance**
(the minimum number of insertions/deletions/substitutions to transform
one sequence into another) and **longest common subsequence**, both
typically taught via dynamic programming. `SequenceMatcher` implements
a *specific*, real, named algorithm for this — Ratcliff/Obershelp
"gestalt pattern matching," which recursively finds the longest
matching contiguous block, then recurses on the real, remaining pieces
before and after it — genuinely different from the Myers diff
algorithm most real-world command-line diff tools (including `git
diff`) actually use, though both solve the same underlying real
problem and can produce similar (not always identical) real results.

Also recognized in: `git diff`'s own line-level comparison; spell-
checkers' "did you mean" suggestions (built on real edit-distance
calculations); bioinformatics sequence alignment (comparing real DNA/
protein sequences) — the identical underlying mathematical problem,
applied to biological rather than textual sequences.

## SE Lens

The real, practical value of reaching for a battle-tested, standard-
library implementation (`difflib`) rather than hand-rolling a diff
algorithm: sequence alignment has real, easy-to-get-subtly-wrong edge
cases (this file's own uneven-`"replace"` case among them) that a
correct, well-tested implementation already handles — `diff_lines`'s
own real job is just the *presentation* layer (turning opcodes into
`DiffRow`s a UI can render row by row), not reimplementing the
underlying alignment algorithm itself.

## Connection

Builds on `python-tuple-unpacking.md` (5-element opcode unpacking),
`python-zip-builtin-and-strict.md` (`zip(..., strict=True)` pairing
equal-length `"equal"` segments, deliberately relying on the
`"equal"` opcode's own guarantee that both sides really are the same
length there), and `python-dataclasses.md` (`DiffRow`). Distinct from
`cumulative-offset-range-mapping.md` and `group-consecutive-elements-
by-a-sticky-key.md` — checked directly: neither solves this real,
different problem (aligning two independent sequences against each
other, rather than recovering positions within one flattened sequence
or grouping consecutive elements by a shared key).

## Try It Yourself

1. Diff two real sequences with **no** overlap at all (completely
   different content) and confirm the opcodes correctly report one
   giant `"replace"` (or a `"delete"` plus `"insert"` pair) spanning
   everything, with no spurious `"equal"` blocks.
2. Call `matcher.get_matching_blocks()` instead of `.get_opcodes()`
   — a real, related method reporting *only* the matching runs — and
   compare its output to the `"equal"` opcodes extracted from
   `get_opcodes()` above.
3. Look up the Myers diff algorithm's own real, high-level approach
   (used by `git diff`) and identify one concrete way its results can
   differ from `SequenceMatcher`'s, even when diffing the identical
   two real sequences.
