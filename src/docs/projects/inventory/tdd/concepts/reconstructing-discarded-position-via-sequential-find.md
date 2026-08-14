# Concept: Reconstructing a Discarded Position via Sequential `.find()`

**What you'll understand by the end:** how to recover each item's real
position in an original string when an upstream step returned only the
items themselves (in order) but discarded where each one was found —
and the real, concrete bug that appears if the search doesn't advance
forward between items.

**Prerequisites:** `python-string-indexing-and-slicing.md`.

## Setup

Python 3, no packages needed.

## The Problem

A lower layer sometimes returns a clean, ordered list of items
extracted from a string — but not *where* in the string each one was
found, because that lower layer's own job never needed to remember it.
A downstream consumer that genuinely needs each item's real position
(to underline it, highlight it, or report an error at the right
column) has to reconstruct that position itself — and a real, subtle
bug appears the moment the original text contains the **same value
more than once**.

## The Isolated Example

```python
text = "G01 X1 G01 X2"
tokens = ["G01", "X1", "G01", "X2"]  # a lower layer already found these,
                                      # in order, but discarded their positions

# CORRECT: advance `position` past each match before searching for the next.
positions_correct = []
position = 0
for token in tokens:
    start = text.find(token, position)
    positions_correct.append(start)
    position = start + len(token)
print("correct positions:", positions_correct)

# BROKEN: always search from position 0 -- finds the SAME earlier
# occurrence again instead of the real, later one.
positions_broken = []
for token in tokens:
    start = text.find(token, 0)
    positions_broken.append(start)
print("broken positions:  ", positions_broken)

print("correct handles the repeated 'G01' differently each time:",
      positions_correct[0] != positions_correct[2])
print("broken finds the SAME position for both 'G01' occurrences:",
      positions_broken[0] == positions_broken[2])
```

**Real output, run this session:**
```
correct positions: [0, 4, 7, 11]
broken positions:   [0, 4, 0, 11]
correct handles the repeated 'G01' differently each time: True
broken finds the SAME position for both 'G01' occurrences: True
```

**What this proves:** the correct version found the second `"G01"` at
its own real, distinct position (`7`), genuinely different from the
first (`0`). The broken version, always searching from position `0`,
found the **identical** position (`0`) for both occurrences of
`"G01"` — a real, silent bug: the second `"G01"` genuinely exists at
position `7`, but the broken code reports it as if it were still at
position `0`.

## Mechanical Walkthrough

- `str.find(sub, start)` searches for `sub` beginning at real index
  `start`, returning the position of the **first** match at or after
  that point — never before it.
- The correct technique keeps a running `position` variable, updated
  after every match: `position = start + len(token)` — the next
  search always begins immediately after where the current token
  ended, guaranteeing it can never re-find an earlier occurrence of the
  same text.
- This reconstruction is only valid under one real, necessary
  guarantee: the tokens must already be known to appear in the
  original text in **left-to-right order**, matching the list's own
  order — if that guarantee doesn't hold (the list were shuffled, say),
  sequential `.find()` calls would produce nonsense, not just
  duplicates.
- The broken version's mistake is subtle specifically because it's
  **silent** — `.find()` never raises an error when it locates the
  wrong (but real, valid) match; it just confidently returns an
  incorrect position with no signal anything went wrong.

## CS Lens

This is a real, concrete instance of a **stateful scan** — each search
depends on the *result* of the previous one, not just the current
item being searched for. It's conceptually the inverse of
`offset-preserving-blank-and-rescan.md`'s own technique: that file
keeps a string's length fixed so positions found *later* stay valid
against the *original* text; this technique instead walks *forward*
through a single string, using each found position to bound where the
next search may begin, recovering information (position) that a prior
processing stage had already thrown away.

Also recognized in: any incremental text-scanning algorithm that
processes matches strictly left-to-right, carrying a cursor position
forward (a simple, hand-rolled tokenizer walking its own input one
token at a time is doing the identical thing, just without an
intermediate `.find()` call).

## SE Lens

The real, practical cost of the broken version: it doesn't crash,
doesn't warn, and produces a plausible-looking (if wrong) result —
exactly the kind of bug that survives casual testing on text with no
repeated tokens, then manifests specifically the first time real,
repeated content (a `G01` appearing twice in the same line, entirely
normal in real G-code) reaches it. This is a strong, concrete argument
for testing this kind of reconstruction specifically against inputs
with deliberately repeated values, not just varied ones — a repeated
value is exactly the case a naive, always-restart-from-zero
implementation gets wrong.

## Connection

Builds on `python-string-indexing-and-slicing.md`. Distinct from, but
related in spirit to, `offset-preserving-blank-and-rescan.md` and
`cumulative-offset-range-mapping.md` — all three solve real, different
"recover position information a transformation didn't directly
preserve" problems, worth recognizing as a small family of related but
genuinely distinct techniques, not variations of the identical one.

## Try It Yourself

1. Construct a real input with **three** repeated occurrences of the
   same token and confirm the correct version finds all three at their
   own distinct, real positions while the broken version collapses all
   three to the same first position.
2. Deliberately violate the left-to-right ordering guarantee (shuffle
   `tokens` before reconstructing positions) and observe the real,
   incorrect (or even negative, meaning "not found from here") results
   this produces — concrete proof the technique depends on that
   ordering guarantee actually holding.
3. Rewrite the correct version to raise a real, explicit exception if
   `text.find(...)` ever returns `-1` (not found at all from the
   current position) — reasoning about what real, upstream bug such a
   failure would actually indicate, given the ordering guarantee this
   technique assumes.
