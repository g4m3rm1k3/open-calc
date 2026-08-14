# Concept: Chained Comparison Operators (`a <= b <= c`)

**What you'll understand by the end:** how Python's `a <= b <= c`
reads as one real, combined range check, and the real, easy-to-miss
reason it isn't just shorthand for `a <= b and b <= c` — the middle
expression is only ever evaluated **once**.

**Prerequisites:** none beyond the assumed floor.

## Setup

None — plain Python, no packages.

## The Problem

Checking whether a real value falls within a range — `low <= value`
and `value <= high`, both true — is common enough to want real, direct
syntax for it, rather than writing out two separate comparisons joined
by `and` every time.

## The Isolated Example

```python
def is_in_range_chained(value, low, high):
    return low <= value <= high


def is_in_range_and(value, low, high):
    return low <= value and value <= high


print(is_in_range_chained(5, 1, 10))
print(is_in_range_and(5, 1, 10))
```

**Real output, run this session:**
```
True
True
```

Both produce the identical real result — but they're not always
interchangeable:

```python
call_count = {"n": 0}


def get_value():
    call_count["n"] += 1
    return 5


print(1 <= get_value() <= 10)
print("real number of get_value() calls (chained -- only ONE):", call_count["n"])

call_count["n"] = 0
print(1 <= get_value() and get_value() <= 10)
print("real number of get_value() calls (manual 'and' -- TWO):", call_count["n"])
```

**Real output, run this session:**
```
True
real number of get_value() calls (chained -- only ONE): 1
True
real number of get_value() calls (manual 'and' -- TWO): 2
```

**What this proves:** the chained form (`1 <= get_value() <= 10`)
called `get_value()` exactly **once**, real proof the middle expression
is only ever evaluated a single time no matter how many comparisons
chain around it. The manual `and`-joined version called it **twice** —
once for each real comparison, since each `get_value()` in that
version is a completely separate, independent expression, evaluated
its own time.

## Mechanical Walkthrough

- `a <= b <= c` is real, single Python syntax — not two separate
  comparison expressions combined afterward — Python evaluates `a`,
  `b`, and `c` each exactly once, then checks `a <= b` **and** `b <=
  c` using those already-computed real values.
- This differs genuinely from writing `a <= b and b <= c` by hand,
  where `b` is written out as **two separate expressions** in the real
  source code — if `b` were something more than a plain variable (a
  function call, an expensive computation), each written-out occurrence
  is a real, separate evaluation.
- Chained comparisons can combine more than just `<=` — any real
  sequence of comparison operators works (`a < b <= c < d`), each
  checked against its immediate real neighbors, all real comparisons
  required to be true for the whole expression to be `True`.
- This is also why chained comparisons **short-circuit** the identical
  real way `and` does — if an early comparison in the chain is already
  `False`, later ones are never evaluated at all.

## CS Lens

This is real, deliberate syntactic sugar with a genuine, non-cosmetic
semantic guarantee — not merely "fewer characters to type," but a real
promise about evaluation count that a naive `and`-based rewrite
doesn't automatically preserve. Recognizing when a piece of syntax is
*purely* stylistic versus when it carries a real, additional guarantee
is a worthwhile, general skill — the same real distinction
`javascript-logical-or-default-fallback.md`'s own short-circuit framing
touches, here specific to chained comparisons rather than boolean
fallbacks.

Also recognized in: mathematical notation itself (`1 ≤ x ≤ 10` is the
real, standard way mathematicians write a range constraint,
notationally identical to Python's own chained form) — a real,
deliberate design choice making Python's syntax mirror familiar
mathematical notation directly.

## SE Lens

The real, practical payoff beyond brevity: whenever the middle
expression in a range check is genuinely expensive or has a real,
observable side effect (a function call, a property access that
triggers real computation), the chained form is not just shorter, it's
**correct** in a way the `and`-joined manual version isn't — using the
manual form there would silently perform the real, expensive or
side-effecting operation twice, a real, easy-to-miss cost or bug.

## Connection

Directly relevant to any real range check — this project's own real
`s.start_line <= i <= s.end_line` (checking whether a line index falls
inside a sequence's real range) is exactly this shape, and `i` here is
a cheap loop variable, so the single-vs-double-evaluation distinction
doesn't matter for correctness in that specific case — but recognizing
*when* it would matter is the real, general skill this file teaches.

## Try It Yourself

1. Chain four comparisons together (`a < b < c < d < e`) and confirm it
   correctly requires all four individual real comparisons to hold.
2. Construct a real case where chained comparison's short-circuiting
   genuinely saves work — an expensive real function as the *last*
   term in a chain that fails early, confirming that function is never
   even called.
3. Rewrite `s.start_line <= i <= s.end_line` as two explicit
   comparisons joined by `and`, and reason about whether the difference
   in evaluation count could ever matter for this specific real case —
   what would have to change about `i` for it to start mattering?
