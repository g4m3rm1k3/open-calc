# Concept: Applying Batch Position-Based Edits in Reverse Order

**What you'll understand by the end:** why applying a batch of several
pre-computed text edits, each identified by a character position,
must be done from the **highest** position to the **lowest** whenever
a replacement's length can differ from the original — and the real,
concrete corruption that happens if it isn't.

**Prerequisites:** `python-string-indexing-and-slicing.md`.

## Setup

None — plain Python, no packages.

## The Problem

A real tool that finds several matches in a string, computes what each
one should become, and then needs to actually apply all those changes
— a find-and-replace-all feature, a refactoring tool, a patch
applier — faces a genuine, easy-to-miss trap: every match's position
was computed against the **original**, unmodified text, all at once,
before any edits happened. The moment the *first* edit is applied, if
its replacement text is a different length than the original match,
every position recorded for matches *after* it is now wrong.

## The Isolated Example

```python
def apply_edits(text, edits):
    """edits: list of (start, end, replacement), applied via string slicing."""
    for start, end, replacement in edits:
        text = text[:start] + replacement + text[end:]
    return text


original = "AB AB"
# Both real matches of "AB", found BEFORE any edits happen.
matches = [(0, 2), (3, 5)]  # positions of the two "AB" occurrences

# BROKEN: apply in forward order (lowest position first).
forward_edits = [(start, end, "X") for start, end in sorted(matches)]
broken_result = apply_edits(original, forward_edits)
print("forward order (BROKEN):", repr(broken_result))

# CORRECT: apply in reverse order (highest position first).
reverse_edits = [(start, end, "X") for start, end in sorted(matches, reverse=True)]
correct_result = apply_edits(original, reverse_edits)
print("reverse order (correct):", repr(correct_result))
```

**Real output, run this session:**
```
forward order (BROKEN): 'X AX'
reverse order (correct): 'X X'
```

**What this proves:** replacing both real occurrences of `"AB"` with
the shorter `"X"` should produce `'X X'` — and reverse order genuinely
does. Forward order produces `'X AX'` — **visibly wrong**: the second
"AB" (originally at positions `3`-`5`) got corrupted into `"AX"`
instead of being cleanly replaced, because the *first* edit (replacing
positions `0`-`2` with the shorter `"X"`) shifted every real character
after it two positions to the left — but the second edit still used
its original, now-stale position `3`-`5`, which after the shift landed
in the wrong place entirely.

## Mechanical Walkthrough

- `matches` holds real positions computed **once**, against the
  original text, all before any editing begins — this is completely
  correct and necessary; a batch operation naturally needs to know
  every match *before* deciding what to do with any of them.
- Applying an edit at an earlier position, when its replacement is a
  **different length** than the original matched text, shifts every
  character after it — the string genuinely gets shorter or longer at
  that point, and every position downstream of the edit no longer
  refers to the same real characters it used to.
- Processing edits from **highest position to lowest** sidesteps this
  entirely: every edit still queued up is always at a position
  *before* whatever was just modified — so it can never be
  invalidated by an edit that hasn't happened yet from its own
  perspective, since edits at higher positions are always handled
  first, entirely independently of what happens later (at lower
  positions) in the same pass.
- This technique specifically requires the edits to be genuinely
  **non-overlapping** — real matches derived from the same original
  text via a correct search never overlap each other, which is exactly
  why this precondition reliably holds for real find/replace-style
  batches.

## CS Lens

This is a real, general technique whenever a batch of position-based
mutations must be applied to a single, shared, indexed structure —
process them in an order that guarantees an edit already applied can
never invalidate the position of one still pending. Reverse order is
the natural, correct choice specifically because earlier edits (lower
positions) are the ones whose *validity* depends on later ones not
having shifted anything yet — processing high-to-low means every edit
executes while its own recorded position is still guaranteed accurate.

Also recognized in: any real diff/patch-applying tool operating on
line or character positions; refactoring tools that rename or replace
several identifiers found via one static-analysis pass, then apply all
the edits back to the original source; database migration scripts
that must apply several row-position-dependent changes without
one invalidating another's target.

## SE Lens

The real, practical danger of this bug: it's **silent** and
**data-dependent** — it never raises an exception, and it produces
subtly, visibly wrong output only when a replacement's length actually
differs from the original match's length, across **multiple**
matches in the same batch. A test suite using only same-length
replacements (`"cat"` → `"dog"`, both 3 characters) would never catch
a regression here, even if the underlying code was accidentally
"simplified" back to forward order — exactly the kind of real,
present test-coverage gap worth naming explicitly rather than assuming
passing tests mean the code is fully proven correct for every real
case it claims to handle.

## Connection

Builds on `python-string-indexing-and-slicing.md`. Distinct from
`cumulative-offset-range-mapping.md` (which recovers a position within
an already-flattened sequence via a running prefix sum) and
`offset-preserving-blank-and-rescan.md` (which keeps a string's length
fixed throughout to preserve positions) — this file's own technique
instead accepts that positions *will* shift, and orders the real work
specifically to never depend on a position that's already been
invalidated.

A second, real, applied instance: a G-code coordinate-transform
function finding every real axis-word (an `X`/`Y`/`Z`/... letter
followed by a number) on one line, then splicing in each replacement
value from **last** match to **first** — identical real reasoning to
this file's own first instance, applied at the scale of one line's
several words rather than a whole document's several matches, and for
the identical real reason: a transformed value's own formatted text
length (`"1"` vs. `"1.2345"`) isn't guaranteed to match the original's,
so later-in-line positions would silently go stale the moment an
earlier splice on the same line changed the text's own length.

## Try It Yourself

1. Construct a batch where one replacement is **longer** than its
   original match (instead of shorter) and confirm forward order
   still corrupts the result, in the opposite direction (matches
   shifting right instead of left).
2. Add a third match to the example and confirm reverse order still
   produces the fully correct result regardless of how many matches
   are batched together.
3. Write a real, generic `assert` helper that verifies a batch of
   edits are genuinely non-overlapping (no match's end position
   exceeds the next match's start) before applying them — the real,
   necessary precondition this technique depends on, made explicit and
   checked rather than assumed.
