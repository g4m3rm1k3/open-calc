# Concept: `Array.prototype.find`

**What you'll understand by the end:** how to get the one real element matching a condition out of an array, directly, instead of filtering to a list and then reaching into it.

**Prerequisites:** `javascript-array-map.md`.

## Setup

Any modern JavaScript/TypeScript runtime.

## The Isolated Example

```javascript
const tabs = [{ id: "dro", label: "DRO" }, { id: "tools", label: "Tools" }];

const found = tabs.find((tab) => tab.id === "tools");
console.log("found:", found);

const missing = tabs.find((tab) => tab.id === "nope");
console.log("missing:", missing);
```

**Real output, run this session:**
```
found: { id: 'tools', label: 'Tools' }
missing: undefined
```

**What this proves:** `.find()` returned the real, actual matching object itself — not a one-item array, not an index — and returned exactly `undefined`, not an error or an empty object, for a condition nothing in the array satisfies.

## Mechanical Walkthrough

- `tabs.find((tab) => tab.id === "tools")` — **(a) first appearance** — calls the given function once per element, in order, and returns the *first* element for which it returns a truthy value, stopping immediately without checking the rest of the array — **(b) reappearing** the same callback-per-element shape `.map()`/`.filter()` already established, applied here to stop-and-return instead of transform-every-element or keep-a-subset.
- The `missing` case — **(a) first appearance** of `.find()`'s own "nothing matched" behavior: `undefined`, specifically — not `null`, not an exception — the same real value a plain object property access returns when a key doesn't exist, letting a caller check `if (!result)` without needing a `try`/`catch`.

## CS Lens

This is a **linear search**, stopping at the first match — the same underlying algorithm as scanning a list by hand, formalized as a single built-in method rather than a hand-written loop with a `break`.

Also recognized in: SQL's `WHERE ... LIMIT 1` (find one matching row, stop), and Python's own `next((x for x in items if condition), None)` idiom — the identical "first match or a clear absence value" shape, a more verbose spelling in that language.

## SE Lens

The real alternative — `tabs.filter((tab) => tab.id === "tools")[0]` — works, but builds an entire intermediate array just to immediately discard everything but its first element, and, worse, silently returns `undefined` for `[][0]` in a way that reads identically to a real, found-but-empty result, whereas `.find()`'s intent (find *one* thing, or confirm nothing matches) is stated directly in the method's own name rather than inferred from array-indexing syntax.

## Connection

Builds on `javascript-array-map.md`'s callback-per-element shape. Directly relevant to any case where exactly one specific item (never a list of them) needs to be pulled out of a collection by some real property — used in this project to find which of a panel's open tabs is the currently active one.

## Try It Yourself

1. Change the callback to `(tab) => tab.label.startsWith("D")` and confirm it still returns the `dro` object — direct proof the condition can be any real expression, not just an equality check.
2. Look up `.findIndex()` (a real sibling method) and predict what it would return for the same two calls above, before checking — reasoning about when a caller needs the matching *element* versus its *position*.
3. Call `.find()` on an array of primitive numbers instead of objects (e.g. `[3, 7, 12, 4].find((n) => n > 10)`) and confirm the returned value is the number itself, not wrapped in anything — the same direct-value-back behavior, independent of what the array actually holds.
