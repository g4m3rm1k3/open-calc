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

Builds on `function-composition.md` — composition is the concrete mechanism that usually makes "open for extension" possible in practice. This is exactly the reasoning behind keeping an existing, working function completely unedited while a new, separate function handles an additional concern layered on top of it. A real, applied instance of this file's own second facet, from this project's own history: a G-code parsing function's internal, hardcoded code-to-meaning mappings (which numeric G-code means "rapid move," which means "absolute positioning") promoted into overridable parameters with real, public, named defaults — real code comments naming the actual, concrete future extension point directly (different real controller dialects use different codes for the same real concepts) without building any dialect-specific logic yet.

## Try It Yourself

1. Add a *third* variant, `tokenize_reversed`, built the same way (composing `tokenize`, not modifying it). Confirm all three — `tokenize`, `tokenize_lowercase`, `tokenize_reversed` — coexist and each works correctly, with `tokenize` itself still never edited.
2. Deliberately violate the principle: edit `tokenize` directly to add lowercase behavior *inside* it, removing the separate `tokenize_lowercase` function. Note what a caller who wanted the original, case-sensitive behavior would now experience — a real, concrete cost of modification instead of extension.
3. Write a tiny "test" (a plain `assert`) confirming `tokenize("Hello World") == ["Hello", "World"]` (case preserved). Run it before and after adding `tokenize_lowercase` the composed way, and confirm it passes both times — then run it again after the deliberate violation in step 2, and watch it fail, a concrete, automated demonstration of what "closed for modification" is actually protecting.

## A Second Real Facet: Extension via an Overridable Data Parameter, Not Composition

This file's own first facet gets "open for extension" through
**composition** — wrapping the existing function inside a new one.
A genuinely different real mechanism reaches the identical goal by
promoting a hardcoded internal value into an **overridable parameter**
with a public, named default:

```python
DEFAULT_STATUS_CODES = {200: "OK", 404: "Not Found", 500: "Server Error"}


def describe_status(code, status_codes=None):
    if status_codes is None:
        status_codes = DEFAULT_STATUS_CODES
    return status_codes.get(code, "Unknown")


print(describe_status(200))
print(describe_status(404))
```

**Real output, run this session:**
```
OK
Not Found
```

**What this proves:** every existing caller of `describe_status`,
written before any thought of a second vocabulary, keeps working
completely unchanged — closed for modification. Now a genuinely new,
real requirement (a caller with its own, different status vocabulary)
arrives:

```python
CUSTOM_CODES = {200: "OK", 404: "Not Found", 999: "Custom Vendor Code"}
print(describe_status(999, status_codes=CUSTOM_CODES))
print(describe_status(200, status_codes=CUSTOM_CODES))
```

**Real output, run this session:**
```
Custom Vendor Code
OK
```

**What this proves:** `describe_status` itself was never touched — no
new `elif`, no edited lookup table — yet it correctly serves a
genuinely new, real vocabulary it was never written with in mind,
purely by a caller supplying different *data* through the parameter
that was already there. Open for extension, with zero composition or
wrapping involved at all.

**Mechanical note — how this differs from the first facet:** the
first facet's extension mechanism was a **new function** layered
around an old, unmodified one; this facet's extension mechanism is a
**new argument** passed into the *same*, single function, which was
written once to accept configuration rather than hardcode it. Both
achieve the identical real property (existing behavior untouched,
new behavior addable) through genuinely different means — worth
recognizing both as real instances of the same principle rather than
only recognizing composition-based extension.

### Try It Yourself (second facet)

1. Add a third, real status vocabulary, `LEGACY_CODES`, and call
   `describe_status` with it — confirm zero changes to
   `describe_status` itself were needed, the identical real property
   this file's first facet demonstrated through composition instead.
2. Compare this facet's approach against literally hardcoding a
   second `elif vocabulary == "custom":` branch inside
   `describe_status` — reasoning about why that alternative would
   violate "closed for modification" the moment a *third* vocabulary
   shows up, while the data-parameter version never needs to change
   at all.
3. Revisit `capability-based-modeling-vs-type-hierarchy.md`'s own
   "Odd Gantry Hybrid" example and identify which of this file's two
   facets it more closely resembles — reasoning about what the two
   genuinely share (a fixed function/interface, varying data) despite
   solving different real problems.
