# Concept: Fail-Fast Validation

**What you'll understand by the end:** why rejecting invalid input immediately, before any of it is processed, is safer than processing as much as possible and only failing when something breaks.

**Prerequisites:** `python-custom-exceptions.md`.

## Setup

Python 3, no packages needed.

## The Problem

Given input that's only partially valid, a program could either process the valid-looking parts as it encounters them and stop wherever it happens to break, or check the *entire* input's validity first and refuse to process any of it if anything is wrong. These produce genuinely different, and differently trustworthy, results.

## The Isolated Example

```python
class InvalidOrderError(Exception):
    pass


def process_order_lazy(items):
    total = 0
    for name, price in items:
        if price < 0:
            raise InvalidOrderError(f"{name} has a negative price")
        total += price
        print(f"charged for {name}")
    return total


def process_order_fail_fast(items):
    for name, price in items:
        if price < 0:
            raise InvalidOrderError(f"{name} has a negative price")
    total = sum(price for _, price in items)
    for name, _ in items:
        print(f"charged for {name}")
    return total


order = [("widget", 10), ("gadget", -5), ("gizmo", 20)]

try:
    process_order_lazy(order)
except InvalidOrderError as e:
    print("lazy version failed after already charging some items:", e)

try:
    process_order_fail_fast(order)
except InvalidOrderError as e:
    print("fail-fast version failed before charging anything:", e)
```

**Real output:**
```
charged for widget
lazy version failed after already charging some items: gadget has a negative price
fail-fast version failed before charging anything: gizmo has a negative price
```

**What this proves:** the lazy version already printed `"charged for widget"` — a real, committed side effect — before discovering the order was invalid. The fail-fast version validated the *entire* list first, and failed before charging for anything at all, including the perfectly valid `"widget"` and `"gizmo"` entries. For an operation with a real side effect (charging someone), that difference is the difference between a clean rejection and a partially-completed, now-inconsistent operation.

## Mechanical Walkthrough

- `process_order_lazy` interleaves validation and processing — it discovers `"gadget"` is invalid only after already having "charged" for `"widget"`.
- `process_order_fail_fast` performs a complete validation pass over every item *before* any processing begins — the loop that checks prices touches nothing else; only after it completes without raising does any real work happen.
- Both raise the identical exception type with a similar message — the difference is entirely about *when* the check happens relative to any side effects, not what gets checked.

## CS Lens

**Fail-fast validation**: rejecting invalid input at the earliest possible point, before any of it has been acted upon, rather than discovering a problem partway through processing. This trades "maybe get partway through, then fail with partial results already committed" for "either the whole thing is confirmed valid and fully processed, or none of it is touched at all."

Also recognized in: a compiler refusing to produce any output at all from a source file with a type error, rather than compiling everything up to the error and stopping (imagine a program that "mostly" compiled); database transactions validating all constraints before committing any change, rather than applying rows one at a time and stopping partway through on a violation; a real CNC controller checking an entire program for unsupported codes before cutting begins, rather than discovering one mid-cut.

## SE Lens

Fail-fast validation costs a real, extra full pass over the input before any processing starts — for the lazy version, work already done before the failure (charging for `"widget"`) is genuinely wasted or, worse, needs to be manually undone. The upfront pass trades that small extra cost for a strong, simple guarantee: either everything succeeds, or nothing happens — no partial, inconsistent state to reason about or clean up afterward. This matters most exactly where "partially applied" is a real, bad state to be in (financial transactions, machine motion, database writes) — for read-only or trivially-undoable operations, the lazy approach's simplicity may be the better tradeoff instead.

## Connection

Builds on `python-custom-exceptions.md`. This is the general principle behind checking every word on a line is supported *before* updating any state based on that line — updating state, then discovering the line was actually invalid, would leave that state changed by a rejected operation.

## Try It Yourself

1. Reorder `process_order_fail_fast`'s two loops (do the charging loop first, the validation loop second) and rerun against the same `order`. Confirm this "reordered" version now behaves exactly like the lazy one — proof that fail-fast isn't about which lines of code exist, but strictly about their order relative to any side effect.
2. Change the order so the invalid item is *last* instead of in the middle (`[("widget", 10), ("gizmo", 20), ("gadget", -5)]`). Confirm the lazy version now charges for two full items before failing — the later the invalid entry, the more the lazy version has already committed before discovering the problem.
3. Extend the fail-fast version to collect *every* validation error instead of stopping at the first one (accumulate a list of problems across the full validation pass, then raise once with all of them listed). Compare the usefulness of that error message against one that only ever reports the single, first problem found.
