# Concept: The Open/Closed Principle

**What you'll understand by the end:** what it means for code to be "open for extension, closed for modification," and why that's a real, checkable property, not just a slogan.

**Prerequisites:** `function-composition.md`.

## Setup

Python 3, no packages needed.

## The Problem

Fixing a bug or adding a capability by editing an existing, already-working function risks breaking whatever currently depends on that function's exact behavior — every caller is a potential casualty of a change made for one specific reason. Sometimes new behavior can be added *without* touching the existing, working code at all.

## The Isolated Example

```python
def tokenize(text):
    return text.split()

# existing, working behavior — untouched
print(tokenize("hello world"))

# new capability added WITHOUT modifying tokenize itself
def tokenize_lowercase(text):
    return tokenize(text.lower())

print(tokenize_lowercase("HELLO WORLD"))
```

**Real output:**
```
['hello', 'world']
['hello', 'world']
```

**What this proves:** `tokenize` was never edited — its source is identical before and after the new capability existed. `tokenize_lowercase` adds new behavior (case-insensitivity) by *composing* the existing function, not by modifying its internals. Anything that already depends on `tokenize`'s exact current behavior (including case-sensitivity, if something relied on that) is completely unaffected by the new function's existence.

## Mechanical Walkthrough

- `tokenize` remains byte-for-byte the same function — **closed for modification**: nothing about adding the new capability required editing it.
- `tokenize_lowercase` is new code, added alongside the old — **open for extension**: new behavior arrived by adding something new, not by changing something that already worked.
- Any existing caller of `tokenize` — code written before `tokenize_lowercase` ever existed — continues to run against the exact same function it always called, with zero risk of the new addition breaking it.

## CS Lens

The **open/closed principle**: software entities (functions, classes, modules) should be open for extension but closed for modification — new behavior should be addable without editing code that already works and that other things already depend on.

Also recognized in: plugin architectures generally (adding a new plugin doesn't require editing the plugin host's own code), browser extensions (installing one doesn't modify the browser's own source), and any system designed so a new capability is a new file/module/registration rather than a diff to an existing, shared one.

## SE Lens

This isn't a rule to apply universally without judgment — sometimes editing existing code directly really is the right move (fixing an actual bug *in* that function, for instance, should change that function, not route around it with a wrapper). The principle applies specifically when new, additional behavior is wanted *alongside* existing, still-correct behavior: in that case, composing something new around the old, unmodified piece keeps the blast radius of the change limited to exactly what's new, verifiably not touching anything that was already relied upon.

## Connection

Builds on `function-composition.md` — composition is the concrete mechanism that usually makes "open for extension" possible in practice. This is exactly the reasoning behind keeping an existing, working function completely unedited while a new, separate function handles an additional concern layered on top of it.

## Try It Yourself

1. Add a *third* variant, `tokenize_reversed`, built the same way (composing `tokenize`, not modifying it). Confirm all three — `tokenize`, `tokenize_lowercase`, `tokenize_reversed` — coexist and each works correctly, with `tokenize` itself still never edited.
2. Deliberately violate the principle: edit `tokenize` directly to add lowercase behavior *inside* it, removing the separate `tokenize_lowercase` function. Note what a caller who wanted the original, case-sensitive behavior would now experience — a real, concrete cost of modification instead of extension.
3. Write a tiny "test" (a plain `assert`) confirming `tokenize("Hello World") == ["Hello", "World"]` (case preserved). Run it before and after adding `tokenize_lowercase` the composed way, and confirm it passes both times — then run it again after the deliberate violation in step 2, and watch it fail, a concrete, automated demonstration of what "closed for modification" is actually protecting.
