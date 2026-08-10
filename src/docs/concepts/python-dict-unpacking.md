# Concept: Dictionary Unpacking (`**`) in a Dict Literal

**What you'll understand by the end:** how to build a new dictionary out of an existing one's contents plus extra fields, without repeating every key by hand.

**Prerequisites:** `dict-as-lookup-table.md`.

## Setup

Python 3, no install needed:
```
python3 --version
```

## The Problem

A function sometimes needs to return a dictionary that's "everything an existing dictionary already has, plus one or two more fields." Writing that by hand means naming every one of the original dictionary's keys again, one at a time — real, error-prone repetition that also silently goes stale if the original dictionary's shape ever changes (a new key added there wouldn't automatically show up here).

## The Isolated Example

```python
def position():
    return {"x": 10, "y": 20, "z": 0}

# Written by hand, repeating every key
by_hand = {"motion": "G1", "x": position()["x"], "y": position()["y"], "z": position()["z"]}

# Using ** unpacking
unpacked = {"motion": "G1", **position()}

print(by_hand)
print(unpacked)
print(by_hand == unpacked)
```

**Real output:**
```
{'motion': 'G1', 'x': 10, 'y': 20, 'z': 0}
{'motion': 'G1', 'x': 10, 'y': 20, 'z': 0}
True
```

**What this proves:** `**position()` produced a dictionary identical to the fully-spelled-out version, without the calling code ever having to know or name `position()`'s individual keys — if `position()` later returned a fourth field, `unpacked` would automatically include it; `by_hand` would not, silently.

## Mechanical Walkthrough

- `**some_dict` inside a `{...}` dict literal **unpacks** every key-value pair from `some_dict` directly into the new dictionary being built, as if each pair had been written out individually.
- Order matters when keys collide: `{"x": 1, **{"x": 2}}` evaluates left to right, so later keys overwrite earlier ones — here, the unpacked `"x": 2` would win, ending up as `{"x": 2}`.
- Multiple `**` unpackings can appear in one literal (`{**a, **b, "extra": 1}`), combining several dictionaries' contents plus explicit extra keys into one.
- This is a different use of the same `**` symbol from **exponentiation** (`2 ** 3` = 8) — the two meanings are determined entirely by context (inside a dict literal versus between two numbers) and share no actual relationship beyond the character.

## CS Lens

This is **structural composition at the value level** — building a larger, correct value out of smaller, already-correct pieces, without needing to name or duplicate their internal structure. It's the data-level counterpart to composing functions or objects out of smaller, already-correct pieces: the caller trusts `position()`'s result is correct and complete, and simply folds it into a larger structure wholesale.

Also recognized in: JavaScript's near-identical object spread syntax (`{...obj, extra: 1}` — see `javascript-object-shorthand-property.md`'s neighboring shorthand-property concept for a related JS object-literal convenience), and, at a broader level, any "merge" or "combine" operation across two structured records in any language.

## SE Lens

Unpacking keeps the *caller* decoupled from the exact shape of the dictionary being unpacked — if `position()`'s implementation later adds a new field, every place that does `{**position()}` automatically picks it up with no code change required there, while every place that hand-listed `position()["x"]`, `["y"]`, `["z"]` individually would need to be found and updated by hand. The real risk in exchange: a caller relying on unpacking gets *whatever* the unpacked dictionary happens to contain, including fields it may not have anticipated — worth being deliberate about when the unpacked source's shape isn't fully controlled or trusted.

## Connection

Builds on `dict-as-lookup-table.md`. Commonly used to build an API response or a return value that combines a computed sub-result (like a position) with additional context (like which operation produced it).

## Try It Yourself

1. Add a fourth key to `position()`'s return value (e.g. `"units": "mm"`) without changing either `by_hand` or `unpacked`'s own code, and confirm only `unpacked` picks up the new field automatically.
2. Deliberately create a key collision (`{"x": 999, **position()}`) and confirm `position()`'s own `"x"` value wins, since it's unpacked *after* the explicit `"x": 999` — then reverse the order and confirm the opposite happens.
3. Write a function that merges two dictionaries with `{**first, **second}` where both share a key, and predict, before running it, which dictionary's value for that key will appear in the result — then verify.
