# Concept: Converting Units Before Combining Values, Not After

**What you'll understand by the end:** why two real numbers must share
the same real unit *before* they're used together in the same
calculation or the same coordinate space — and why this kind of bug
stays completely invisible until the moment something actually puts
both values side by side.

**Prerequisites:** none beyond arithmetic.

## Setup

No install needed — this is a general software engineering idea,
illustrated here with a plain, dependency-free example.

## The Problem

A real value (a length, a weight, a duration) is only ever "10" — the
number alone says nothing about whether that's 10 millimeters, 10
inches, or 10 of anything else. As long as a value is only ever
displayed on its own, or only ever compared against other values in the
*same* unit, this is invisible — the number just is what it is. The
moment two values that are secretly in *different* real units get
combined — placed in the same coordinate space, added together, drawn
to the same scale — the mismatch becomes real and visible, often as
something that looks like a completely unrelated bug (a shape "in the
wrong place," "too small," "too large") rather than what it actually
is: two numbers that were never really comparable in the first place.

## The Isolated Example

```python
def build_box(width, height, is_metric):
    # A real, live bug: nothing here checks or converts units at all --
    # `width`/`height` are used exactly as given, regardless of what
    # real unit they're actually in.
    return {"width": width, "height": height}

# Two real boxes, one described in millimeters, one in inches -- both
# fed into the same function, in the same "world," with no conversion.
metric_box = build_box(100, 50, is_metric=True)      # 100mm x 50mm
inch_box = build_box(4, 2, is_metric=False)           # 4in x 2in -- really 101.6mm x 50.8mm

print(metric_box)
print(inch_box)
```

**Real output:**
```
{'width': 100, 'height': 50}
{'width': 4, 'height': 2}
```

**What this proves:** `inch_box`'s real, physical size is almost
identical to `metric_box`'s (101.6mm vs. 100mm) — but as raw numbers in
the same space, `4` and `100` look nothing alike. Anything that later
compares, draws, or combines these two boxes assuming they're already
in the same unit will be wrong by a factor of roughly 25, silently.

**The fix — convert before combining, not after:**

```python
INCH_TO_MM = 25.4

def to_millimeters(value, is_metric):
    return value if is_metric else value * INCH_TO_MM

def build_box(width, height, is_metric):
    return {
        "width": to_millimeters(width, is_metric),
        "height": to_millimeters(height, is_metric),
    }

metric_box = build_box(100, 50, is_metric=True)
inch_box = build_box(4, 2, is_metric=False)
print(metric_box)
print(inch_box)
```

**Real output:**
```
{'width': 100, 'height': 50}
{'width': 101.6, 'height': 50.8}
```

**What this proves:** both boxes are now real, comparable numbers in
the identical real unit — `101.6` and `100` are close, exactly as their
real physical sizes actually are, and anything drawing both to the same
scale will show them correctly, proportionally, for the first time.

## Mechanical Walkthrough

- `to_millimeters(value, is_metric)` — a single, tiny function that's
  the *only* place a value's real unit is ever resolved — every caller
  passes its own raw value plus whatever flag says what unit it's
  really in, and gets back a value that's now safe to combine with any
  other output of the same function.
- The conversion happens **before** the value is used for anything else
  (stored, compared, drawn) — converting *after* the fact (e.g., trying
  to "fix" a drawn shape's size after noticing it looks wrong) treats
  the symptom, not the actual mismatched-units cause.
- Nothing about a bare number (`4`, `100`) itself signals which unit
  it's in — that information has to be carried alongside it explicitly
  (a flag, a typed wrapper, a naming convention) and actually *used*,
  not just stored for display.

## CS Lens

This is **dimensional consistency** — the general principle (borrowed
directly from physics and engineering) that a calculation combining
several quantities is only meaningful if they're all expressed in
compatible units first. Some languages/libraries enforce this at the
type level (a "typed unit" library that makes `10.meters + 5.feet` a
real, checked operation, refusing to compile `10.meters + 5` bare); most
general-purpose code, including this example, relies entirely on the
programmer remembering to convert — which is exactly what makes this
class of bug so easy to introduce and so hard to spot by reading code
alone.

Also recognized in: NASA's own 1999 Mars Climate Orbiter, lost because
one team's software produced thrust values in pound-force-seconds while
the receiving system expected newton-seconds, with no conversion
between them — the most famous real-world instance of exactly this
mistake, at a very different scale than the isolated example above, but
the identical root cause.

## SE Lens

The real, dangerous property of this bug class: it produces
**syntactically and often semantically valid results** — the numbers
are real, the math is real, nothing crashes or throws — the result is
just quietly, confidently wrong by whatever the real conversion factor
happens to be. It's also invisible under the most common kind of
testing (checking a value against itself, or against another value
already in the same wrong unit) — it only surfaces once a real,
independent comparison against the *correct* physical scale happens,
often much later, and often as a symptom (a shape looks "too small,"
"in the wrong place") that doesn't obviously point back to "unit
mismatch" at all.

## Connection

Builds on nothing beyond arithmetic. Directly relevant any time two
values from different real sources (a user's own stored preference, an
imported file, a hardcoded default) might carry different real units,
and are ever going to be placed in the same calculation, comparison, or
coordinate space.

## Try It Yourself

1. Add a third unit (say, centimeters) and extend `to_millimeters` (or
   write a more general `convert(value, from_unit, to_unit)`) to handle
   all three — confirm converting `A → B → C` gives the same real
   result as converting `A → C` directly.
2. Deliberately reintroduce the bug (skip the conversion for just one
   caller) and describe, in your own words, what a real symptom of this
   would look like in a system you didn't write yourself — would it
   look like a "units" bug, or would it look like something else
   entirely (as it did here) until it was actually investigated?
3. Consider a case where the *correct* target unit isn't obvious in
   advance (no single "world unit" is established anywhere) — what
   real convention or documentation would a team need, so every future
   contributor knows which unit new code should convert *into*, not
   just that conversion needs to happen at all?
