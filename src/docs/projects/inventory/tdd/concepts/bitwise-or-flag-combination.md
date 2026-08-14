# Concept: Bitwise OR for Combining Flag Constants (`|`, Not `or`)

**What you'll understand by the end:** how `|` combines two or more
integer flag constants into a single value naming "all of these at
once," what the resulting number actually means at the bit level, and
why this is a genuinely different operation from Python's `or` keyword
despite the visual similarity.

**Prerequisites:** none beyond the assumed floor.

## Setup

Python 3 with `pip install PySide6` (used here for real, ready-made flag
constants — the underlying mechanism is plain Python integer math, not
Qt-specific).

## The Problem

Some real APIs need a parameter that means "any combination of these
independent options, all at once" — which buttons a dialog should show,
which alignment flags apply to a widget, which file-open modes are
active. Passing a list or a set would work, but many real, established
APIs (Qt among them) instead use a single integer, where each real
option occupies its own, distinct **bit**, and combining options means
combining their bits — not a boolean decision between them.

## The Isolated Example

```python
from PySide6.QtWidgets import QMessageBox

Yes = QMessageBox.StandardButton.Yes
No = QMessageBox.StandardButton.No
Cancel = QMessageBox.StandardButton.Cancel

print("Yes as an int:   ", int(Yes))
print("No as an int:    ", int(No))
print("Cancel as an int:", int(Cancel))

combined = Yes | No
print("Yes | No as an int:", int(combined))
print("Yes | No == Yes | No (same combo, recomputed):", combined == (Yes | No))

# membership-style checks against the combined flag
print("does combined include Yes?   ", bool(combined & Yes))
print("does combined include No?    ", bool(combined & No))
print("does combined include Cancel?", bool(combined & Cancel))

# contrast: plain boolean `or` on two ints is NOT this
print("Yes or No (plain boolean 'or', NOT the same thing):", Yes or No)
```

**Real output, run this session:**
```
Yes as an int:    16384
No as an int:     65536
Cancel as an int: 4194304
Yes | No as an int: 81920
Yes | No == Yes | No (same combo, recomputed): True
does combined include Yes?    True
does combined include No?     True
does combined include Cancel? False
Yes or No (plain boolean 'or', NOT the same thing): 16384
```

**What this proves:** `Yes` and `No` are real, distinct integers
(`16384` and `65536`) — each is a **power of two**, meaning each
occupies exactly one bit position with no overlap between them.
`Yes | No` produces `81920` — exactly their sum here, *because* they
share no bits — a single new integer whose bits say "both `Yes` and
`No` are present." Checking membership with `&` (bitwise AND) correctly
reports `Yes` and `No` as both present in `combined`, and `Cancel`
(a different bit entirely) as absent. The final line proves the real
trap: `Yes or No` — plain Python `or` — evaluates to just `16384`
(`Yes` alone, since it's truthy and `or` short-circuits on the first
truthy operand) — a completely different, and here silently wrong,
result from the `81920` that combining both flags actually requires.

## Mechanical Walkthrough

- Each real flag constant (`Yes`, `No`, `Cancel`, ...) is defined so
  that, in binary, exactly one bit is set — `16384` is `1` followed by
  fourteen zeros in binary; `65536` is `1` followed by sixteen zeros;
  no real flag constant in a well-designed set like this overlaps with
  another's bit position.
- `|` is the **bitwise OR** operator: applied to two integers, it
  compares them bit-by-bit and produces a new integer where a bit is
  `1` if it was `1` in *either* input. Because `Yes` and `No` occupy
  entirely separate bit positions, OR-ing them together simply turns on
  both bits at once, with nothing lost or overwritten.
- `&` is **bitwise AND** — used here in the opposite direction, to
  *check* whether a specific bit is present in a combined value:
  `combined & Yes` is non-zero (truthy) exactly when `combined`'s `Yes`
  bit is set, regardless of whatever other bits are also set alongside
  it.
- Python's `or` keyword is a completely unrelated, **boolean
  short-circuit** operator: `a or b` evaluates `a`; if `a` is truthy, it
  returns `a` immediately without even looking at `b`. It was never
  designed to "combine" two values at all — it picks (at most) one of
  them.

## CS Lens

This is a real, direct use of a **bitmask** — a single fixed-width
integer used to represent a whole *set* of independent boolean flags
at once, each flag occupying its own reserved bit. Combining flags is
OR; checking membership is AND; removing a flag from a combination uses
AND with a bitwise-NOT of the flag being removed. This is a genuinely
different, lower-level representation of "a set of options" than
Python's own `set` type — more compact, and native to APIs (like Qt's,
inherited from C++) designed before, or independent of, high-level
collection types being the natural choice.

Also recognized in: Unix file permission bits (`chmod`'s `rwxrwxrwx`,
each a real bit), regular-expression compile flags in many languages
(`re.IGNORECASE | re.MULTILINE` in Python's own `re` module is the
identical real pattern), and low-level networking/graphics APIs across
virtually every systems-level language.

## SE Lens

The real, practical reason this matters beyond trivia: `Yes or No`
compiles, runs, and produces *a* real value — Python raises no error at
all — which makes this a genuinely dangerous, silent bug class rather
than one that announces itself. A caller who means "offer the user both
Yes and No" but reaches for `or` out of habit gets a dialog offering
only `Yes`, with no exception, no warning, nothing but a real, wrong UI
turning up at runtime. Recognizing `|` as the deliberate, correct
choice here — and knowing *why* `or` silently does something different
— is the entire real value of learning this distinction explicitly.

## Connection

First real appearance is `pyside6-qmessagebox-dialogs.md`'s
`QMessageBox.question(..., Yes | No)` call — this file exists
specifically to give that one line's real mechanism its own full
treatment, since it's a genuinely different construct from anything the
assumed floor or earlier lessons cover.

## Try It Yourself

1. Combine three flags at once (`Yes | No | Cancel`) and confirm, with
   `&`, that all three are individually detectable as present in the
   result.
2. Try `Yes | Yes` (the same flag combined with itself) and confirm the
   result equals plain `Yes` — OR-ing a bit with itself changes nothing,
   a real, useful property that makes accidentally combining a flag
   twice harmless.
3. Write a plain-Python bitmask from scratch with no Qt involved — three
   your own constants (`READ = 1`, `WRITE = 2`, `EXECUTE = 4`, each a
   distinct power of two) — combine two with `|`, and check membership
   with `&`, to confirm the identical mechanism works with no framework
   behind it at all.
