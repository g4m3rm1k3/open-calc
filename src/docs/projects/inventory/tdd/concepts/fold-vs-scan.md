# Concept: Fold vs. Scan

**What you'll understand by the end:** the distinction between accumulating a sequence down to one final result versus recording every intermediate result along the way — two related but genuinely different operations.

**Prerequisites:** `fold-reduce-pattern.md`.

## Setup

Python 3, no packages needed.

## The Problem

Given a sequence of updates to a running value, sometimes only the *final* value matters; sometimes the full *history* of intermediate values matters just as much. Using the same code for both, or not distinguishing them clearly, risks either doing unnecessary work or silently losing information the caller actually needed.

## The Isolated Example

```python
def running_total_fold(numbers):
    total = 0
    for n in numbers:
        total += n
    return total


def running_total_scan(numbers):
    total = 0
    history = []
    for n in numbers:
        total += n
        history.append(total)
    return history


numbers = [3, 1, 4, 1, 5]
print("fold:", running_total_fold(numbers))
print("scan:", running_total_scan(numbers))
```

**Real output:**
```
fold: 14
scan: [3, 4, 8, 9, 14]
```

**What this proves:** the fold returns exactly one value — the final total, `14`. The scan returns a list with one entry per input, each entry being the running total *at that point* — `[3, 4, 8, 9, 14]`. The scan's very last element equals the fold's entire result — a fold is what you get by taking only the scan's final entry and discarding the rest.

## Mechanical Walkthrough

- Both functions maintain the identical `total` accumulator, updated the identical way, one number at a time.
- The fold version only ever returns `total` once, after the loop finishes — every intermediate value is computed but immediately discarded, overwritten by the next iteration.
- The scan version additionally appends `total` to `history` on *every* iteration — nothing about the accumulation itself changed; an extra line preserves what the fold version throws away.

## CS Lens

A **fold** reduces a sequence to one final accumulated value. A **scan** (sometimes called a running/cumulative fold) produces a sequence of the same length as the input, where each output is the fold's result *up to that point*. A scan contains strictly more information than a fold — the fold is recoverable from a scan (its last element), but a fold alone cannot reconstruct a scan (the intermediate values are gone).

Also recognized in: a bank statement (a scan — a running balance shown after every transaction) versus a bank balance (a fold — only the current total); Python's own `itertools.accumulate` (a real, built-in scan implementation, distinct from `sum`/`functools.reduce`, which are folds); a version-control system's log (every intermediate commit state, a scan) versus checking out only the latest commit (a fold).

## SE Lens

Choosing a fold when only the final result is ever needed is the right, cheaper choice — no memory is spent keeping history nothing will read. Choosing a fold when the *history* turns out to matter after all forces recomputing it later, potentially re-running the entire sequence of updates again from scratch just to recover data a scan would have kept the first time free of any extra pass. This is a real, concrete design decision that should be made deliberately, based on what a caller will actually need — not accidentally, by whichever shape happened to be easiest to write first.

## Connection

Builds on `fold-reduce-pattern.md`. This distinction matters directly the moment a project needs not just "where did the machine end up" (a fold — the final position) but "what path did it take to get there" (a scan — every intermediate position along the way, needed to draw a picture of the whole motion, not just report its endpoint).

## Try It Yourself

1. Use `itertools.accumulate(numbers)` and confirm it produces the identical list to `running_total_scan`, with less hand-written code.
2. Write a scan version of the `MachineState`-style "fold-a-position" example from `fold-reduce-pattern.md` — instead of returning only the final `{"x", "y", "z"}`, return a list of the position *after every command applied*, one entry per command.
3. Given only a scan's output (the full list of intermediate totals), write a function that recovers the *original input sequence* that must have produced it (hint: each original number is the difference between consecutive scan entries). Confirm this is possible from a scan but would be impossible starting from only the fold's single final result.
