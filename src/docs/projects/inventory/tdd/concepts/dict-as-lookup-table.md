# Concept: Using a Dict as a Lookup Table Instead of a Branch Chain

**What you'll understand by the end:** how to translate a `switch`-style "one of these fixed cases" decision into a dictionary lookup, and when that translation is a genuine improvement rather than just a different way to write the same thing.

**Prerequisites:** none.

## Setup

Python 3, no packages needed.

## The Problem

Code that maps a small, fixed set of input values to output values is often first written as a chain of comparisons. As the number of cases grows, that chain gets longer and more repetitive, and adding a new case means adding another branch in a specific, easy-to-mis-order place.

## The Isolated Example

```python
def day_name_branching(n):
    if n == 0:
        return "Sunday"
    elif n == 1:
        return "Monday"
    elif n == 2:
        return "Tuesday"
    else:
        return "Unknown"


_DAY_NAMES = {0: "Sunday", 1: "Monday", 2: "Tuesday"}

def day_name_lookup(n):
    return _DAY_NAMES.get(n, "Unknown")


for n in [0, 1, 2, 5]:
    assert day_name_branching(n) == day_name_lookup(n)
print("all match:", [day_name_lookup(n) for n in [0, 1, 2, 5]])
```

**Real output:**
```
all match: ['Sunday', 'Monday', 'Tuesday', 'Unknown']
```

**What this proves:** both functions produce identical results for every input — the dict version isn't a different behavior, it's the same fixed mapping expressed as data instead of code. `_DAY_NAMES.get(n, "Unknown")` replaces the entire `if`/`elif`/`else` chain with one line: look the key up, fall back to a default if it's missing.

## Mechanical Walkthrough

- `_DAY_NAMES = {0: "Sunday", 1: "Monday", 2: "Tuesday"}` — the mapping itself, expressed as data rather than as a sequence of comparisons.
- `.get(key, default)` looks up `key` in the dict, returning `default` if it isn't present — avoiding a `KeyError` that a bare `_DAY_NAMES[n]` would raise for an unmapped value.
- Adding a new case to the lookup-table version means adding one new dict entry; adding one to the branching version means inserting a new `elif` in the right place among the existing ones.

## CS Lens

This is the **dispatch table pattern**, applied to *values* rather than *behavior* — the same underlying idea as looking up a function to call by name (see `http-routing-dispatch-table.md`), just mapping to a plain result instead of a callable. Both are instances of replacing a decision expressed as *code* (a branch) with a decision expressed as *data* (a lookup).

Also recognized in: a real interpreter translating a numeric opcode into a specific operation (exactly the shape of porting a `switch` statement's cases into a dict, one case per entry), configuration systems mapping a string key to a setting, and any place a fixed correspondence table exists in a spec or a reference document — it usually translates directly into a literal dict rather than a chain of comparisons.

## SE Lens

The branching version and the lookup version are behaviorally identical for a small, truly fixed set of cases — the real advantage of the dict form is that the mapping is now **data**, inspectable and iterable on its own (`_DAY_NAMES.keys()`, checking `n in _DAY_NAMES` without calling the function at all) in a way a branch chain never allows without executing it. The tradeoff runs the other way once cases need to run different, non-trivial logic rather than return a fixed value — a dict mapping to functions (see `http-routing-dispatch-table.md`) handles that too, but a dict mapping to plain values, as here, is specifically suited to fixed-correspondence cases, not arbitrary per-case behavior.

## Connection

A specialized case of `http-routing-dispatch-table.md`'s general pattern — that file dispatches to callable functions; this one dispatches directly to plain values. Both replace a branch chain with a data lookup for the same underlying reason.

## Try It Yourself

1. Add three more day-number mappings to `_DAY_NAMES` and confirm both functions still agree — but notice how much less new code the lookup version needed compared to adding three more `elif` branches.
2. Build the reverse mapping (name to number) as a second dict, and write a function using it to convert `"Tuesday"` back to `2`. Confirm a fixed correspondence can be looked up in either direction, as two independent dicts.
3. Replace `.get(n, "Unknown")` with a bare `_DAY_NAMES[n]` and call it with an unmapped key. Read the real `KeyError`, and reason about when you'd actually prefer that loud failure over `.get`'s quiet default — this exact tension is what a later lesson's "fail loudly instead of silently" decision revisits directly.
