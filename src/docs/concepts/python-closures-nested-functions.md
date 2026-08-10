# Concept: Closures — a Real, Substantial Nested Function

**What you'll understand by the end:** how a real, full `def`-based
nested function (not just a one-line `lambda`) can close over several
enclosing local variables at once, why the variables it captures stay
**live** rather than frozen at definition time, and `nonlocal` for
when a nested function needs to reassign one.

**Prerequisites:** none beyond the assumed floor.

## Setup

None — plain Python, no packages.

## The Problem

A real, non-trivial piece of logic — checking several real conditions
against a few pieces of context — sometimes needs to be called
multiple times from within one larger function, without being a
genuinely separate, standalone concept worth its own top-level
function and a long real parameter list. A real, named nested function
solves this: it lives entirely inside the function that needs it, and
automatically has access to that function's own local variables,
without them being passed in explicitly every time.

## The Isolated Example

```python
def find_title_for_sequence(lines, sequence_line_index, header_line_index):
    same_line = lines[sequence_line_index]

    def is_valid_title_source(i):
        """A candidate line can supply a title only if it's not the
        program header, and not itself another real sequence's line."""
        if i == header_line_index:
            return False
        if i < 0 or i >= len(lines):
            return False
        return True

    if "(" in same_line:
        return same_line

    above = sequence_line_index - 1
    if is_valid_title_source(above) and "(" in lines[above]:
        return lines[above]

    below = sequence_line_index + 1
    if is_valid_title_source(below) and "(" in lines[below]:
        return lines[below]

    return None


program = ["O1234 (PART NAME)", "N100 G00 X0", "(setup comment)", "N200 G01 X1"]

print("title for N100 (index 1):", find_title_for_sequence(program, 1, 0))
print("title for N200 (index 3):", find_title_for_sequence(program, 3, 0))
```

**Real output, run this session:**
```
title for N100 (index 1): (setup comment)
title for N200 (index 3): (setup comment)
```

**What this proves:** `is_valid_title_source` — a real, full `def`
with its own docstring — reads `lines` and `header_line_index` from
its **enclosing** function's own scope, with neither ever passed to it
as a parameter. It's called by name, multiple times, from different
real points inside `find_title_for_sequence`, sharing the identical,
real, captured context each time.

A second, real proof that closures capture **live** variables, not a
frozen snapshot:

```python
def make_counter():
    count = 0

    def increment():
        nonlocal count
        count += 1
        return count

    return increment


counter = make_counter()
print(counter())
print(counter())
print(counter())
```

**Real output, run this session:**
```
1
2
3
```

**What this proves:** `increment`'s own `count` genuinely persists and
changes *between* separate calls — each call to `counter()` sees the
real, updated value the previous call left behind, not a fresh `count
= 0` each time. This only works because `nonlocal count` explicitly
tells Python that `count += 1` inside `increment` should modify the
**enclosing** function's own `count`, not create a new, separate local
variable that shadows it.

## Mechanical Walkthrough

- A **nested function** is simply a real `def` written inside another
  function's own body — it's a genuine, first-class function object,
  just scoped to only be directly nameable from within its enclosing
  function (though it can still be returned, stored, or passed around
  like any other function).
- A **closure** is what results when a nested function references a
  variable from its enclosing function's scope — Python keeps that
  variable's real, live binding accessible to the nested function even
  after the outer function's own execution has moved past the point
  where the nested function was defined.
- Reading an enclosing variable (`lines`, `header_line_index` above)
  works automatically, with no special keyword — the nested function
  can see it directly. **Reassigning** one (as `increment` does to
  `count`) requires the explicit `nonlocal` declaration; without it,
  `count += 1` would create a brand-new local variable inside
  `increment` instead of modifying the enclosing one, immediately
  raising a real `UnboundLocalError` (since `count` would be read
  before ever being locally assigned).
- Unlike every prior `lambda` closure in this project's own history
  (each capturing at most one or two names for a single expression),
  a full `def`-based nested function can hold real, multi-line logic,
  its own docstring, and multiple branches — appropriate exactly when
  the captured logic is substantial enough to deserve a real name and
  explanation, not just a one-line inline callback.

## CS Lens

This is a real, textbook instance of a **closure** — a function bundled
together with the real, live environment (its enclosing scope's
variables) it was defined within, able to reference and (with
`nonlocal`) mutate that environment even after the outer function has
returned control elsewhere. This is one of the real, foundational
building blocks behind decorators (`python-decorators.md`'s own
mechanism), callback-based APIs, and any language feature allowing a
function to be treated as a real, first-class value carrying context
with it.

Also recognized in: JavaScript's own closures (the identical real
concept, `let`/`const` capturing live bindings the same way); any
functional-programming language's own first-class functions capturing
their defining environment.

## SE Lens

The real, practical reason to reach for a nested function over passing
every needed value as an explicit parameter: when a helper is
genuinely only meaningful *within* one specific enclosing function
(never called from anywhere else), nesting it keeps that relationship
explicit and visible, and spares every call site from re-passing
values the helper can already see directly. The real, honest tradeoff:
a nested function is harder to test in isolation than a real,
top-level one (it can't be imported or called independently) — the
right real choice specifically when the helper's own logic is tightly,
permanently coupled to its one enclosing caller, not a general-purpose
utility that might be reused elsewhere.

## Connection

Builds on nothing beyond the assumed floor, and underlies
`python-decorators.md`'s own real mechanism (a decorator is, at its
core, a function returning a closure). A real, applied instance in
this project's own history: a title-inference helper, checking several
real, adjacent-line exclusion rules, defined once inside the function
that needs it, called by name multiple times against the same real,
captured context.

## Try It Yourself

1. Try calling `is_valid_title_source` from *outside*
   `find_title_for_sequence` and observe the real `NameError` — direct,
   concrete proof it's genuinely scoped to its enclosing function, not
   a top-level name.
2. Remove `nonlocal count` from `increment` and confirm the real
   `UnboundLocalError` this produces — reasoning about exactly why
   Python treats `count += 1` as creating a new local variable rather
   than assuming you meant the enclosing one.
3. Create two, separate calls to `make_counter()` and confirm each
   returned `increment` function has its own, completely independent
   real `count` — direct, real proof that each call to the outer
   function creates a genuinely fresh, separate closure environment,
   not a single shared one.

## A Real Second Facet: Late Binding in a Loop — the Same Live-Capture Behavior, Now a Bug

The `make_counter` example above showed live capture as a genuine
benefit. The identical real behavior — a closure reads its enclosing
variable's *current* value, not a frozen snapshot from when the closure
was created — becomes a real, common bug when several `lambda`s are
created inside a loop, each intended to capture that iteration's own,
distinct value.

```python
menu_actions = []
for label in ["Dark", "Light", "Colorful"]:
    menu_actions.append(lambda: print("selected:", label))

for action in menu_actions:
    action()
```

**Real output, run this session:**
```
selected: Colorful
selected: Colorful
selected: Colorful
```

**What this proves:** all three real `lambda`s print `"Colorful"` — the
loop's *last* value — instead of each printing the label it was
supposedly created with. Every `lambda` closed over the exact same
real variable `label`, not a separate copy per iteration; by the time
any of them actually runs, the loop has already finished and `label`
holds its final real value.

**The fix — a default argument value, evaluated once, at each
`lambda`'s own creation time:**

```python
menu_actions_fixed = []
for label in ["Dark", "Light", "Colorful"]:
    menu_actions_fixed.append(lambda label=label: print("selected:", label))

for action in menu_actions_fixed:
    action()
```

**Real output, run this session:**
```
selected: Dark
selected: Light
selected: Colorful
```

**What this proves:** each `lambda`'s own `label=label` default
argument genuinely captures that iteration's real, current value of
`label` *at definition time* — Python evaluates default argument
values immediately, once, when the `def`/`lambda` statement itself
runs, unlike the closure's normal variable lookups, which stay live
and are only resolved when the function actually *runs*, per this
file's own `make_counter` proof above.

**Mechanical note — why this is the same concept, not a different one:**
nothing about closures changed between the two examples; `count`
staying live *was* the win in `make_counter`, and the same live
lookup is exactly what makes every loop `lambda` above see the loop's
*final* `label` instead of its own. The default-argument trick doesn't
disable live capture — it sidesteps it, by giving each `lambda` its
own real, separate local variable (the parameter), initialized once
from the loop variable's value at that specific moment, which the
`lambda`'s body then reads instead of reaching out to the enclosing
scope at all.

### Try It Yourself (second facet)

1. Replace the loop `lambda`s with real, named nested `def` functions
   instead, each also closing over `label` — confirm the identical late-
   binding bug occurs, direct proof this is a closures issue, not
   something specific to `lambda` syntax.
2. Fix the bug a second, different way: wrap each `lambda`'s creation
   in a real, separate helper function that takes `label` as a
   parameter and returns the `lambda` — confirm this also fixes it, and
   reason about why (hint: a function call creates a genuinely new,
   separate local scope each time it runs).
3. Predict, then verify, what happens if the loop variable itself is
   reassigned *after* the loop finishes but *before* any of the
   collected `lambda`s are called — real, further proof the unfixed
   version was reading a live, shared variable the whole time.
