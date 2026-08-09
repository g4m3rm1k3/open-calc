# Concept: Draining a Mutable Collection With a `while` Loop

**What you'll understand by the end:** a small, common idiom for removing every element from a live collection in place, and why it's written as a `while` loop checking length rather than a `for` loop over indices.

**Prerequisites:** none.

## Setup

Any JavaScript or TypeScript runtime — no install needed. The isolated example below uses a plain array; the same shape applies to any collection type exposing a length and a remove-one-element operation.

## The Problem

Some collection APIs (a UI framework's child-node list, a 3D scene graph's group of objects) need to be fully emptied before being repopulated — the *old* contents must be gone before the *new* contents are added, or both would coexist incorrectly. Iterating such a collection with an ordinary `for` loop by index while also removing elements from it is a classic, real source of bugs: removing an element shifts every later element's index down by one, so a loop incrementing its index normally will skip every other element.

## The Isolated Example

```javascript
const items = [1, 2, 3, 4, 5];

// Broken: a for-loop over indices while removing elements
const broken = [1, 2, 3, 4, 5];
for (let i = 0; i < broken.length; i++) {
    broken.splice(i, 1);
}
console.log(broken);

// Correct: drain by always removing index 0
const drained = [1, 2, 3, 4, 5];
while (drained.length) {
    drained.splice(0, 1);
}
console.log(drained);
```

**Real output:**
```
[ 2, 4 ]
[]
```

**What this proves:** the `for`-loop version left two elements behind — removing index `0` shifted everything down, so by the time the loop's `i` reached `1`, the *original* index `2`'s element had already slid into position `1` and was skipped; incrementing `i` while the collection shrinks under it silently skips elements. The `while (drained.length)` version, always removing whatever is currently at index `0` and re-checking the *current* length each iteration, correctly empties the entire array.

## Mechanical Walkthrough

- `while (collection.length) { ... }` — `collection.length` is truthy (nonzero) as long as any elements remain; the loop's condition is re-evaluated fresh every iteration, always against the collection's *current*, post-removal state — not a length captured once at the start.
- Removing index `0` specifically (rather than any other index) means every remaining element shifts down by exactly one position each time, but the *next* element to remove is always, again, whatever is now at index `0` — the loop never needs to track or compute an index itself, sidestepping the shifting-index bug entirely.
- This pattern terminates because the collection strictly shrinks by one every iteration, and the loop condition depends on that same shrinking value — a loop invariant simple enough to verify by inspection.

## Execution Trace

The broken version, run for real against `[1, 2, 3, 4, 5]` — the array
shrinks *underneath* the index `i` as the loop runs:

- i=0: array=[1,2,3,4,5], i < length(5) → true. splice(0,1) removes value 1
     → array=[2,3,4,5], length now 4
- i=1: array=[2,3,4,5], i < length(4) → true. splice(1,1) removes value 3
     → array=[2,4,5], length now 3
- i=2: array=[2,4,5], i < length(3) → true. splice(2,1) removes value 5
     → array=[2,4], length now 2
- i=3: array=[2,4], i < length(2) → 3 < 2 is false → loop ends
- Final: broken = [2, 4]

Values `1`, `3`, and `5` were removed; `2` and `4` were never visited by
a matching `i`, because each `splice` shifted them one position to the
*left*, into an index the loop had already passed. The while-loop
version, removing whatever is currently at index `0` every time instead
of tracking a separate counter, never has this problem:

- Start: drained=[1,2,3,4,5], length=5 → truthy, loop runs
- splice(0,1) removes 1 → drained=[2,3,4,5], length=4 → truthy
- splice(0,1) removes 2 → drained=[3,4,5],   length=3 → truthy
- splice(0,1) removes 3 → drained=[4,5],     length=2 → truthy
- splice(0,1) removes 4 → drained=[5],       length=1 → truthy
- splice(0,1) removes 5 → drained=[],        length=0 → falsy, loop ends
- Final: drained = []

## CS Lens

This is a small, real instance of a broader principle: **iterating over a mutable collection while also mutating it is unsafe unless the iteration strategy specifically accounts for the mutation.** Different data structures and languages solve this differently — some collection types raise a runtime error the instant they detect concurrent modification during iteration (a deliberate safety check, precisely because this bug class is common and easy to introduce silently); the drain-by-always-removing-index-0 idiom instead sidesteps the problem structurally, by never holding onto a stale index across iterations at all.

Also recognized in: Java's `ConcurrentModificationException` (a language-level guard against exactly this mistake), Python's own well-known "don't modify a list while iterating over it with a `for` loop" pitfall, and any queue-draining loop (`while (!queue.isEmpty()) { queue.poll(); }`) in any language — the identical drain shape, applied to a different collection type.

## SE Lens

This idiom is worth recognizing specifically because its *broken* sibling (a `for` loop over indices, removing as it goes) looks superficially reasonable and often passes casual testing — a small test array might happen to only skip an element that wouldn't be noticed, making this exactly the kind of bug that survives into a codebase unnoticed until a specific input exposes it. Recognizing the shape ("removing while iterating by index") as a red flag, independent of the specific collection type involved, is the transferable skill; the `while (length)` idiom is simply the fix, not the whole lesson.

## Connection

Used to clear a 3D scene graph group's previous contents before adding new ones — see `threejs-geometry-material-object.md` for the surrounding context this idiom commonly appears in (removing a stale drawn object before drawing an updated one).

## Try It Yourself

1. Reproduce the broken `for`-loop version above with a longer starting array (10+ elements) and manually trace through the first several iterations by hand, confirming exactly which elements get skipped and why.
2. Rewrite the drain loop counting *downward* from the last index instead (`for (let i = collection.length - 1; i >= 0; i--) { collection.splice(i, 1); }`) — confirm this also correctly empties the array, and reason about why removing from the *end* backward avoids the same shifting-index problem removing from the *start* forward runs into.
3. Look up your language/framework's actual "remove all children" or "clear" method if one exists (many DOM APIs and UI frameworks provide one directly, e.g. `element.replaceChildren()`) — compare its behavior and performance characteristics to the hand-written drain loop, and reason about when reaching for a built-in method is preferable to writing this idiom by hand.
