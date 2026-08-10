# Concept: `str.startswith`

**What you'll understand by the end:** how to check whether a string begins with a specific prefix, without manually slicing or indexing.

**Prerequisites:** none.

## Setup

Python 3, no install needed:
```
python3 --version
```

## The Problem

Checking whether a string begins with a specific character or sequence — a comment marker, a command prefix, a protocol scheme like `"https://"` — by hand means slicing out the right number of characters and comparing, correctly handling the case where the string is shorter than the prefix being checked, every single time this comes up.

## The Isolated Example

```python
line = "/G1 X20"

# By hand
by_hand = len(line) >= 1 and line[0] == "/"

# str.startswith
built_in = line.startswith("/")

print(by_hand, built_in)
print("hi".startswith("hello"))
print("".startswith("/"))
```

**Real output:**
```
True True
False
False
```

**What this proves:** `startswith` produced the identical result to the hand-written slice-and-compare check, and correctly handled two edge cases (a string shorter than the prefix, and an empty string) without the caller having to think about either — both simply return `False`, never an error.

## Mechanical Walkthrough

- `string.startswith(prefix)` returns `True` if `string` begins with exactly the characters in `prefix`, `False` otherwise — case-sensitive, exact-character comparison.
- It safely handles a `prefix` longer than `string` itself (returns `False`, no exception) and an empty `string` (also `False`, unless `prefix` is itself empty, in which case every string "starts with" the empty string, and it returns `True`).
- `startswith` also accepts a **tuple** of prefixes (`line.startswith(("G", "M", "T"))`), returning `True` if the string starts with *any* one of them — useful for checking against several possible prefixes without chaining multiple `or`-joined calls.
- A matching `str.endswith(suffix)` method exists for the mirror-image check at the end of a string.

## CS Lens

This is a small, real instance of preferring a **named, intention-revealing operation** over an equivalent hand-assembled one built from more primitive pieces (indexing, slicing, comparison) — the built-in method states the *intent* ("does this start with X?") directly, while the hand-written version requires a reader to reconstruct that intent from its individual mechanical steps.

Also recognized in: nearly every mainstream language provides an equivalent built-in — JavaScript's `String.prototype.startsWith`, Java's `String.startsWith`, C#'s `String.StartsWith` — the identical operation, differing only in casing convention per language.

## SE Lens

Beyond readability, the built-in method is also less error-prone than a hand-written equivalent: a manually written version (`string[:len(prefix)] == prefix`, for instance) is an easy place to introduce an off-by-one slicing mistake, or to forget the case where `string` is shorter than `prefix` (which would raise no error in Python's own forgiving slice semantics, but *would* in some other languages' equivalent manual indexing) — using the built-in sidesteps having to get any of that right by hand, every time the check is needed.

## Connection

Commonly used to recognize a marker or prefix at the very start of a line of text — checking for G-code's block-skip marker, a comment marker, or any other syntactically-significant leading character, before any further parsing of that line begins.

## Try It Yourself

1. Check a string against a tuple of possible prefixes (`"G1 X10".startswith(("G", "M"))`) and confirm it returns `True` because at least one matches — then try a case where none match and confirm `False`.
2. Combine `startswith` with slicing to strip a confirmed prefix off a string (`line[1:]` after confirming `line.startswith("/")`) — the exact real pattern used to remove a recognized marker before further processing.
3. Write your own `my_startswith(string, prefix)` function using only slicing and comparison, matching the built-in's behavior for the edge cases shown above (prefix longer than string, empty string), and confirm it agrees with the real `str.startswith` across several test cases.
