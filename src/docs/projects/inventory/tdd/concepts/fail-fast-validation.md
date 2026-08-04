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

**Real output — corrected, this session: the third line named the wrong
item; re-run directly to confirm.**
```
charged for widget
lazy version failed after already charging some items: gadget has a negative price
fail-fast version failed before charging anything: gadget has a negative price
```

**What this proves:** the lazy version already printed `"charged for widget"` — a real, committed side effect — before discovering the order was invalid. The fail-fast version validated the *entire* list first, and failed before charging for anything at all, including the perfectly valid `"widget"` and `"gizmo"` entries. For an operation with a real side effect (charging someone), that difference is the difference between a clean rejection and a partially-completed, now-inconsistent operation.

## Mechanical Walkthrough

- `process_order_lazy` interleaves validation and processing — it discovers `"gadget"` is invalid only after already having "charged" for `"widget"`.
- `process_order_fail_fast` performs a complete validation pass over every item *before* any processing begins — the loop that checks prices touches nothing else; only after it completes without raising does any real work happen.
- Both raise the identical exception type with a similar message — the difference is entirely about *when* the check happens relative to any side effects, not what gets checked.

## Execution Trace

Both functions run against the identical
`order = [("widget", 10), ("gadget", -5), ("gizmo", 20)]`:

```
process_order_lazy(order):
  ("widget", 10): 10 < 0? No  → total=10 → print "charged for widget"
  ("gadget", -5): -5 < 0? Yes → raise InvalidOrderError("gadget has a negative price")
  → exits here, "gizmo" is never even reached

process_order_fail_fast(order):
  Validation-only pass:
    ("widget", 10): 10 < 0? No
    ("gadget", -5): -5 < 0? Yes → raise InvalidOrderError("gadget has a negative price")
  → exits here, inside the validation loop — the sum() and second
    "charged for" loop below it never run at all
```

The real, visible difference: `process_order_lazy` already printed
`"charged for widget"` — a real, committed side effect — before it ever
reached `"gadget"` and failed. `process_order_fail_fast` raises on the
exact same item, but its *first* loop only ever checks prices, so
nothing gets "charged" (the second loop, and the real work) before the
whole order is confirmed valid.

## CS Lens

**Fail-fast validation**: rejecting invalid input at the earliest possible point, before any of it has been acted upon, rather than discovering a problem partway through processing. This trades "maybe get partway through, then fail with partial results already committed" for "either the whole thing is confirmed valid and fully processed, or none of it is touched at all."

Also recognized in: a compiler refusing to produce any output at all from a source file with a type error, rather than compiling everything up to the error and stopping (imagine a program that "mostly" compiled); database transactions validating all constraints before committing any change, rather than applying rows one at a time and stopping partway through on a violation; a real CNC controller checking an entire program for unsupported codes before cutting begins, rather than discovering one mid-cut.

## SE Lens

Fail-fast validation costs a real, extra full pass over the input before any processing starts — for the lazy version, work already done before the failure (charging for `"widget"`) is genuinely wasted or, worse, needs to be manually undone. The upfront pass trades that small extra cost for a strong, simple guarantee: either everything succeeds, or nothing happens — no partial, inconsistent state to reason about or clean up afterward. This matters most exactly where "partially applied" is a real, bad state to be in (financial transactions, machine motion, database writes) — for read-only or trivially-undoable operations, the lazy approach's simplicity may be the better tradeoff instead.

## Connection

Builds on `python-custom-exceptions.md`. This is the general principle behind checking every word on a line is supported *before* updating any state based on that line — updating state, then discovering the line was actually invalid, would leave that state changed by a rejected operation. A real, applied instance in this project's own history, with a further, worth-naming benefit beyond avoiding partial state: a mesh-generation function detecting upfront that every point in its own input profile is degenerate (collapsed onto its sweep axis, nothing real to revolve) and raising immediately, with a clear, specific message — rather than letting that invalid input reach a third-party graphics library several calls downstream, where it would fail with a confusing, unrelated-looking error pointing nowhere near the actual real cause. Failing fast here isn't just about avoiding partial work — it's about keeping the error message itself diagnosable, raised at the real point of the mistake rather than wherever it happens to first blow something up.

## Try It Yourself

1. Reorder `process_order_fail_fast`'s two loops (do the charging loop first, the validation loop second) and rerun against the same `order`. Confirm this "reordered" version now behaves exactly like the lazy one — proof that fail-fast isn't about which lines of code exist, but strictly about their order relative to any side effect.
2. Change the order so the invalid item is *last* instead of in the middle (`[("widget", 10), ("gizmo", 20), ("gadget", -5)]`). Confirm the lazy version now charges for two full items before failing — the later the invalid entry, the more the lazy version has already committed before discovering the problem.
3. Extend the fail-fast version to collect *every* validation error instead of stopping at the first one (accumulate a list of problems across the full validation pass, then raise once with all of them listed). Compare the usefulness of that error message against one that only ever reports the single, first problem found.

## A Second Real Facet: Collecting Every Error, Not Just the First

Fail-fast-and-raise-immediately is the right real choice when a single
problem is enough to reject the whole operation and no more
information helps. A real, different situation — showing a user
*everything* wrong with their input at once — calls for a genuinely
different technique: validate everything, collect every real problem
into a list, and never raise on the first one at all.

```python
class InvalidOrderError(Exception):
    pass


def validate_fail_fast(items):
    for name, price in items:
        if price < 0:
            raise InvalidOrderError(f"{name} has a negative price")


def validate_collect_all(items):
    errors = []
    for name, price in items:
        if price < 0:
            errors.append(f"{name} has a negative price")
    return errors


order = [("widget", 10), ("gadget", -5), ("gizmo", -3), ("thing", 8)]

try:
    validate_fail_fast(order)
except InvalidOrderError as e:
    print("fail-fast reports only the FIRST problem:", e)

errors = validate_collect_all(order)
print("collect-all reports EVERY problem:", errors)
```

**Real output, run this session:**
```
fail-fast reports only the FIRST problem: gadget has a negative price
collect-all reports EVERY problem: ['gadget has a negative price', 'gizmo has a negative price']
```

**What this proves:** the identical real input has **two** genuine
problems (`gadget` and `gizmo` both have negative prices). The
fail-fast version's exception only ever names the first one it
happened to reach — a user fixing `gadget` and resubmitting would only
*then* discover `gizmo`'s problem, one round-trip later. The
collect-all version reports both real problems in a single pass — a
genuinely more useful real result whenever a user benefits from seeing
everything wrong at once, rather than fixing one problem at a time
across repeated attempts.

**The real, honest distinction this draws:** both techniques still
validate the *entire* input before any real, side-effecting processing
happens — neither one abandons this file's own core fail-fast
guarantee (no partial, inconsistent state). They differ only in what
happens *once validation itself is complete*: raise immediately on the
first real problem found, or finish the full pass and hand back every
real problem found, together, as data rather than an exception. Which
is correct depends entirely on what the caller actually needs — a
single, blocking failure reason, or a complete, real picture of
everything to fix.

### Try It Yourself (second facet)

1. Change `validate_collect_all` to return real, structured error
   objects (not just strings) each carrying the item's own name and
   the specific real problem — useful for a caller that wants to
   highlight *which* real input field each error applies to.
2. Combine both techniques: call `validate_collect_all` first, then
   `raise InvalidOrderError(errors)` only if the list is non-empty —
   a real, hybrid approach that still raises one exception, but with
   every real problem attached, not just the first.
3. Reason about a real, concrete case where collecting all errors
   would be actively wrong — a case where continuing to check for
   *more* problems after finding the first one is itself unsafe or
   meaningless (hint: think about validations where a later check's
   own correctness depends on an earlier one having already passed).
