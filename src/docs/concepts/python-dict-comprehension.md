# Concept: Python Dict Comprehensions

**What you'll understand by the end:** how to build a new dictionary from an iterable in one expression, including filtering which entries are included.

**Prerequisites:** `dict-as-lookup-table.md`.

## Setup

Python 3, no install needed:
```
python3 --version
```

## The Problem

Building a new dict by selecting and transforming entries from an existing collection — keeping only certain keys, computing new values — by hand requires an empty dict, a loop, a conditional, and repeated assignment: real, mechanical scaffolding around what is conceptually a single, declarative statement of "which entries, mapped how."

## The Isolated Example

```python
body = {"name": "face_mill_50", "type": "Face Mill", "unexpected_field": "danger", "diameter_mm": 50}
allowed_fields = ("name", "type", "diameter_mm")

# By hand
by_hand = {}
for field in allowed_fields:
    if field in body:
        by_hand[field] = body[field]

# Dict comprehension
comprehension = {field: body[field] for field in allowed_fields if field in body}

print(by_hand)
print(comprehension)
print(by_hand == comprehension)
```

**Real output:**
```
{'name': 'face_mill_50', 'type': 'Face Mill', 'diameter_mm': 50}
{'name': 'face_mill_50', 'type': 'Face Mill', 'diameter_mm': 50}
True
```

**What this proves:** both versions produced the identical filtered dict — `unexpected_field` was excluded by both, since it's not in `allowed_fields` — the comprehension expressing the exact same logic (iterate, filter, map to a key-value pair) in one line instead of four.

## Mechanical Walkthrough

- `{key_expr: value_expr for item in iterable if condition}` — the general shape: for every `item` in `iterable` that satisfies the optional `if condition`, evaluate `key_expr` and `value_expr` and add that pair to the resulting new dict.
- Here, `field` plays the role of `item` (drawn from `allowed_fields`), `field` itself is `key_expr` (the resulting dict uses the same names), `body[field]` is `value_expr` (the actual value looked up from the source dict), and `if field in body` is the filtering condition (skip any allowed field the client didn't actually send).
- The `if` clause is fully optional — a dict comprehension without one (`{field: body[field] for field in allowed_fields}`) would instead raise a real `KeyError` the moment `field` isn't actually present in `body`, since there's no filter protecting against that case.
- A dict comprehension always produces a **new** dict — the original `body` is never modified by building `comprehension` from it, exactly like list comprehensions never modify their source iterable.

## Execution Trace

Both versions iterate the same `allowed_fields = ("name", "type", "diameter_mm")` against the same `body`:

- By hand:
  Start: by_hand = {}
  field="name":         "name" in body?         → True  → by_hand["name"] = "face_mill_50"
  field="type":         "type" in body?         → True  → by_hand["type"] = "Face Mill"
  field="diameter_mm":  "diameter_mm" in body?  → True  → by_hand["diameter_mm"] = 50
  Final: by_hand = {'name': 'face_mill_50', 'type': 'Face Mill', 'diameter_mm': 50}

- Comprehension — identical 3 checks, same order:
  field="name":         in body → include ("name", "face_mill_50")
  field="type":         in body → include ("type", "Face Mill")
  field="diameter_mm":  in body → include ("diameter_mm", 50)
  Final: comprehension = {'name': 'face_mill_50', 'type': 'Face Mill', 'diameter_mm': 50}

`"unexpected_field"` never appears in either trace at all — both loops
only ever iterate `allowed_fields` (3 items), never `body`'s own keys
(4 items), which is *why* the unlisted field is excluded: it's never a
candidate `field` value in the first place, not filtered out after the
fact.

## CS Lens

This is the identical **comprehension** concept `python-tuple-unpacking.md`'s neighboring list-comprehension idiom applies, extended to build key-value pairs instead of single values — Python's list, set, and dict comprehensions all share the same underlying "iterate, optionally filter, transform" grammar, differing only in the literal syntax (`[]`, `{}` with one expression, `{}` with a `key: value` pair) surrounding the result.

Also recognized in: JavaScript's `Object.fromEntries(array.filter(...).map(...))` (achieving the identical filtered-and-transformed-object result through composed array methods rather than one dedicated comprehension syntax), and any language offering a dedicated, declarative syntax for "build a collection from another, filtered and transformed."

## SE Lens

A dict comprehension used specifically to build an **allow-list-filtered** dict — as here, keeping only known-safe fields from an untrusted source — is a real, common, and valuable idiom: it expresses "construct a new, safe dict containing only these specific fields" as one clear, auditable line, rather than the intent being spread across several lines of a hand-written loop where a bug (an inverted condition, a forgotten `if`) is easier to introduce and easier to miss on review.

## Connection

Builds on `dict-as-lookup-table.md`. Directly used to filter an untrusted request body down to only its known-safe fields before passing it to a stricter consumer — see `orm-object-relational-mapping.md`'s discussion of an ORM model rejecting unexpected keyword arguments, which this exact filtering pattern is commonly used to prevent from ever being reached with bad input.

## Try It Yourself

1. Remove the `if field in body` clause, keep a `body` missing one of `allowed_fields`, and observe the real `KeyError` this produces — then restore the clause and confirm the missing field is simply, safely omitted from the result instead.
2. Write a dict comprehension that also transforms the *value*, not just filters keys — e.g., uppercasing every string value (`{k: v.upper() if isinstance(v, str) else v for k, v in body.items()}`) — iterating over `.items()` instead of a separate allow-list.
3. Write the equivalent allow-list filter as a one-liner using `dict.keys()` intersection instead of a comprehension (hint: `{k: body[k] for k in body.keys() & set(allowed_fields)}`) and compare readability against the original — reasoning about which version more clearly communicates "keep only the allowed fields" to a future reader.
