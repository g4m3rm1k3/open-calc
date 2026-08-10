# Concept: Two-Pass Processing

**What you'll understand by the end:** why some real computations
genuinely can't be done in a single forward pass over an input — a
later decision needs a complete picture only a full first pass can
establish — and the real, general technique of splitting the work into
two explicit, sequential passes.

**Prerequisites:** none beyond the assumed floor.

## Setup

None — plain Python, no packages.

## The Problem

Some real per-item decisions genuinely depend on information that
isn't fully known until the *entire* input has been seen — expressing
each line's length as a percentage of the total needs the real, full
total first, which by definition isn't known until every line has been
counted. A single forward loop, computing and using a value in the
same pass, simply cannot express this correctly: whatever "total so
far" it has at any point during the loop is real, but not yet
complete.

## The Isolated Example

```python
lines = ["apple", "banana", "cherry"]

total_length = sum(len(line) for line in lines)

for line in lines:
    percent = 100 * len(line) / total_length
    print(f"{line}: {len(line)} chars, {percent:.1f}% of total")
```

**Real output, run this session:**
```
apple: 5 chars, 29.4% of total
banana: 6 chars, 35.3% of total
cherry: 6 chars, 35.3% of total
```

**What this proves:** every real percentage is correct precisely
because `total_length` was fully, completely known **before** the
second loop ever started computing a single percentage — `"apple"`'s
real `29.4%` is measured against the true, final total (`17`), not
some partial running total that hadn't yet seen `"banana"` or
`"cherry"`. A single, combined loop trying to compute and use a
running total at the same time could never produce this same, correct
result for anything but the very last item.

## Mechanical Walkthrough

- **Pass one** walks the entire real input once, building a complete
  picture of whatever aggregate fact the second pass will need — here,
  the real, final `total_length`.
- **Pass two** walks the real input again (or a derived structure built
  during pass one), now free to use that complete picture for every
  single real item, including the very first one — by the time pass
  two starts, pass one has already finished, so there's no real
  "haven't seen enough yet" state to worry about.
- The two passes are genuinely, structurally **separate** — pass two
  never runs interleaved with pass one; it only begins once pass one
  has fully, completely finished.
- This differs from a real, single accumulating pass (`fold-reduce-
  pattern.md`'s own shape) specifically because a single pass only
  ever has *partial* information at any point during its own run — two
  passes exist exactly when a later step needs the *complete* result
  of an earlier one, not just whatever's accumulated so far.

## CS Lens

This is a real, general technique appearing throughout computing
whenever a computation has a genuine **data dependency** that crosses
the entire input — a decision for item `i` depends on information from
items that might come *after* `i` in the input, which a single forward
pass can never see in time. A real compiler resolving a forward
reference (a function calling another function defined later in the
same file) needs an analogous two-pass shape: one pass to build a
complete symbol table, a second to actually resolve and check each
real reference against it.

Also recognized in: computing z-scores or percentiles in statistics
(needs the complete dataset's mean/standard deviation before any single
value's own score can be computed); a two-pass compiler or assembler
(building a symbol table in pass one, generating real code referencing
those symbols in pass two); rendering a table of contents with real
page numbers (needs to know every section's real length before the
first page number can be printed).

## SE Lens

The real, practical signal that a computation needs two passes rather
than one: try to write it as a single loop, and notice a value being
*used* before it can possibly be *complete* — that's the real, concrete
tell. The cost is real but usually modest: walking the input twice
instead of once, genuinely more real work for large inputs, but
correctness is the priority here — a single-pass version that produces
a *plausible-looking but wrong* result (using an incomplete running
total) is a far worse real outcome than a second, real pass.

## Connection

Directly relevant to any real "infer X from the complete context, not
just what came before it" decision — this project's own real title-
inference logic (a sequence's title decided by checking neighboring
lines, which requires knowing every line's own comment content first)
is exactly this shape: pass one gathers every line's own real facts;
pass two makes each final, informed per-item decision using that
complete picture.

## Try It Yourself

1. Try writing the percentage calculation as a single, combined loop
   (compute a running total and a percentage in the same pass) and
   confirm the real, wrong percentages this produces for every item
   except the very last one.
2. Extend the two-pass version to also report the single line closest
   to the average length — a real, second aggregate fact (the average)
   that also needs pass one's complete picture before pass two can use
   it.
3. Identify a real, existing piece of code (in this project or
   elsewhere) using two explicit passes over the same input, and
   explain, in your own words, exactly what real information the
   second pass needed that the first pass alone couldn't yet provide.
