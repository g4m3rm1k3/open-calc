# Concept: `Record<K, V>` — a Typed Object-as-Dictionary

**What you'll understand by the end:** how to give an object that's really being used as a lookup table (not a fixed set of named fields) a real, checked type, instead of either `any` or a hand-written index signature.

**Prerequisites:** `typescript-generics.md`, `typescript-interfaces.md`.

## Setup

Node.js with TypeScript installed:
```
npm install --save-dev typescript
```

## The Problem

An `interface` describes an object with a fixed, known set of named fields (`{ name: string; age: number }`). Some objects aren't like that at all — they're used as a lookup table, where the *keys themselves* are data (ids, names) that aren't known ahead of time, and every value has the same shape. Typing that as a plain `interface` doesn't work — there's no fixed field list to write — and typing it as `any` throws away all safety on the values, which is the part that actually matters.

## The Isolated Example

```typescript
interface Score {
  points: number;
  level: string;
}

const scoresByPlayer: Record<string, Score> = {
  alice: { points: 120, level: "gold" },
  bob: { points: 95, level: "silver" },
};

for (const [player, score] of Object.entries(scoresByPlayer)) {
  console.log(`${player}: ${score.points} (${score.level})`);
}

// scoresByPlayer.alice.points = "oops";   // real compile error
// scoresByPlayer.carol;                   // no compile error — TS trusts the key exists
```

**Real output:**
```
alice: 120 (gold)
bob: 95 (silver)
```

**What this proves:** every value TypeScript pulled out of `scoresByPlayer` is a real, checked `Score` — `score.points`/`score.level` autocomplete and type-check normally, with no manual annotation needed at the point of use, even though the object was built from data (player names), not a fixed field list written in the type itself.

## Mechanical Walkthrough

- `Record<K, V>` is a **generic utility type** built into TypeScript's standard library (not a language keyword — it's defined once, in TypeScript's own source, the same way a project's own generic functions are) that expands to "an object type whose keys are all of type `K` and whose values are all of type `V`."
- `Record<string, Score>` — here `K` is `string` (any string is a valid key) and `V` is `Score` (every value, regardless of key, is guaranteed to have that shape).
- The commented-out lines show the actual boundary of what's checked: assigning the wrong *value* type is a real, caught error (`Score.points` is `number`, not `string`); reading a key that was never actually set is **not** caught — `Record`'s promise is about value shape, not about which specific keys exist at runtime. That's a real, worth-knowing limit, not a bug in the type.
- `Object.entries(scoresByPlayer)` returns `[string, Score][]` — TypeScript infers the tuple's second element as `Score` directly from the `Record`'s own value type, with no cast needed.

## Execution Trace

`Object.entries(scoresByPlayer)` returns 2 real `[key, Score]` pairs,
iterated in insertion order:

```
Object.entries(scoresByPlayer) → [["alice", {points:120,level:"gold"}],
                                   ["bob", {points:95,level:"silver"}]]

Iteration 1: [player, score] = ["alice", {points:120, level:"gold"}]
  → console.log("alice: 120 (gold)")
Iteration 2: [player, score] = ["bob", {points:95, level:"silver"}]
  → console.log("bob: 95 (silver)")
```

Every `score` value destructured in this loop is statically known to be
a `Score` — `score.points`/`score.level` are checked against that
shape on both iterations, even though `scoresByPlayer`'s own keys
(`"alice"`, `"bob"`) were never individually declared anywhere in the
`Record<string, Score>` type itself.

## CS Lens

This is the same **associative array / hash map** abstract data type every language has some form of (Python's `dict`, a plain JS object used as a map, Java's `HashMap<K, V>`) — `Record<K, V>` is specifically TypeScript's way of giving that structure a real, generic, checked *type*, on top of a plain JavaScript object at runtime (there is no special `Record` value — it compiles away entirely; only the type-checking is real).

Also recognized in: any TypeScript codebase indexing data by id/name/key rather than modeling it as a fixed-shape object, and directly analogous to Python's `dict[K, V]` type-hint syntax for the identical underlying idea in a different language.

## SE Lens

The alternative, `{ [key: string]: Score }` (a manual index signature), means exactly the same thing and predates `Record` in TypeScript — `Record<K, V>` is preferred now mainly for readability at the call site and because `K` can be a real union of specific string literals (`Record<"gold" | "silver" | "bronze", Score>`), which reads far more clearly as a generic type argument than as an index-signature union. The real cost of reaching for `any` instead, on an object like this: every value read back out loses its shape entirely, and a typo like `score.pnts` would silently return `undefined` at runtime instead of failing to compile.

## Connection

Builds on `typescript-generics.md` (`Record` is itself a generic type, parameterized the same way a hand-written one would be) and `typescript-interfaces.md` (`V` is very often an `interface`, as it is here). A natural companion to `dict-as-lookup-table.md`'s point about *when* a lookup table is the right structure at all — this concept is about typing that structure correctly once the decision to use one is already made.

## Try It Yourself

1. Change `V` to `Record<string, number>` (nesting one `Record` inside another) and store per-player, per-level scores. Confirm TypeScript still checks the innermost value's type correctly.
2. Try `Record<"alice" | "bob", Score>` (a union of specific string literals as `K`) instead of a bare `string`, then try assigning a `"carol"` key — read the real compiler error and explain, from this file's own Mechanical Walkthrough, why this form *does* catch an unknown key when a bare `Record<string, V>` doesn't.
3. Delete the `Score` interface and replace `V` with `any`. Reintroduce the `score.pnts` typo from the SE Lens above and confirm it no longer produces a compile error — direct, caused proof of what `any` actually gives up.
