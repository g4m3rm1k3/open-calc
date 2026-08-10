# Concept: Deep (Structural) Equality vs. Reference Equality

**What you'll understand by the end:** the difference between "these two values look the same" and "these two variables point at the literally same object," and why testing tools provide separate ways to check each.

**Prerequisites:** `mutable-object-aliasing.md`.

## Setup

Any JavaScript or TypeScript runtime — no install needed. The isolated example uses Vitest's real assertion API (`npm install --save-dev vitest`), though the underlying distinction it demonstrates exists independent of any particular testing tool.

## The Problem

Two variables can hold objects or arrays that contain exactly the same data, without being *the same object in memory* — a naive equality check (`===` in JavaScript) only catches the second case, silently reporting "not equal" for two values that any reasonable person would call equal, purely because they happen to be two separate, independently-built objects.

## The Isolated Example

```javascript
const a = { x: 1, y: 2 };
const b = { x: 1, y: 2 };
const c = a;

console.log(a === b);
console.log(a === c);
console.log(JSON.stringify(a) === JSON.stringify(b));
```

**Real output:**
```
false
true
true
```

**What this proves:** `a === b` is `false` even though `a` and `b` contain identical data — `===` checks whether both variables reference the exact same object in memory, and `a`/`b` are two separate objects that merely happen to look alike. `a === c` is `true` because `c` was assigned directly from `a` — both names refer to the *same* underlying object. Comparing their serialized string forms (`JSON.stringify`) sidesteps the reference check entirely and confirms the *content* really is identical.

## Mechanical Walkthrough

- **Reference equality** (`===` in JavaScript, `is` in Python, `==` for objects in Java by default) checks whether two variables point to the exact same location in memory — the same underlying object — not whether their contents match.
- **Deep** (or **structural**) **equality** checks whether two values have the same *contents*, recursively comparing every field/element, regardless of whether they're the same object in memory.
- Primitive values (numbers, strings, booleans) have no meaningful distinction between the two — `5 === 5` is `true` because there's only one possible representation of the number `5`; the distinction only matters for compound values (objects, arrays).
- Testing frameworks provide explicit, separate assertions for each: Vitest's `.toBe(x)` checks reference equality (via `Object.is`, nearly identical to `===`); `.toEqual(x)` checks deep/structural equality, recursively comparing every field.

## CS Lens

This distinction reflects two genuinely different questions a program can ask about two values: **identity** ("are these the same object?") versus **equivalence** ("do these represent the same value?"). Many languages make this an explicit, first-class distinction (Lisp's `eq` versus `equal`; Python's `is` versus `==`, see `python-is-vs-equals.md`) precisely because both questions are real and useful, in different situations — checking whether a cache returned the exact cached object (identity) is a different, valid question from checking whether two independently-computed results agree (equivalence).

Also recognized in: database row equality (two rows with identical column values but different primary keys — same content, different identity), and any caching or memoization system, where "is this the same instance I already computed" is the entire point of the check.

## SE Lens

Using reference equality (`.toBe`) to compare two objects/arrays that were independently constructed — even with identical intended contents — produces a real, common, confusing test failure: the assertion fails, but the printed "expected" and "actual" values look completely identical to a human reading the output, because the failure is about identity, not content. Recognizing which kind of equality a specific test actually needs — almost always deep equality, when comparing computed data — and choosing the matching assertion avoids this entire class of confusing false failure.

## Connection

Builds on `mutable-object-aliasing.md` and the earlier `python-is-vs-equals.md` (the identical distinction, a different language's syntax). Directly relevant to any automated test asserting the shape of a computed object or array result — see the surrounding testing concept this file was extracted alongside for the fuller picture of writing such assertions.

## Try It Yourself

1. Reproduce the confusing failure directly: assert `expect(a).toBe(b)` for the two independently-built objects above, read the real failure output, and confirm it shows two values that look printed identically despite the assertion failing.
2. Change the same assertion to `.toEqual` instead and confirm it passes — using the exact same two objects, only the *check* changed.
3. Test a nested case: two arrays of objects (`[{x: 1}, {x: 2}]` built twice, independently) — confirm `.toEqual` still correctly reports them equal even with this nested structure, proving the comparison is genuinely recursive, not just one level deep.
