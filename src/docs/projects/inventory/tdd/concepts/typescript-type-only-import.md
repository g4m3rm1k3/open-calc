# Concept: Type-Only Imports (`import { type X }`)

**What you'll understand by the end:** how to tell TypeScript that a specific imported name is only ever needed for type checking, and why that distinction matters once code is compiled to plain JavaScript.

**Prerequisites:** `typescript-interfaces.md`, `javascript-es-modules-import-export.md`.

## Setup

Node.js with TypeScript installed:
```
npm install --save-dev typescript
```

## The Problem

An `import` statement can bring in a mix of things — real, runtime values (functions, classes) and TypeScript-only types (interfaces, type aliases) — from the same file, in a single statement. But an `interface` has no runtime existence at all (see `typescript-interfaces.md`) — it vanishes entirely once TypeScript compiles to JavaScript. Without some way to mark *which* imported names are type-only, a compiler has to guess, or conservatively assume every imported name might be needed at runtime.

## The Isolated Example

`shapes.ts`:
```typescript
export interface Point {
    x: number;
    y: number;
}

export function distance(a: Point, b: Point): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
```

`main.ts`:
```typescript
import { distance, type Point } from "./shapes.ts";

const a: Point = { x: 0, y: 0 };
const b: Point = { x: 3, y: 4 };
console.log(distance(a, b));
```

**Real output:**
```
5
```

**Inspecting the real compiled JavaScript output (`tsc` with `noEmit` turned off):**
```javascript
import { distance } from "./shapes.js";
const a = { x: 0, y: 0 };
const b = { x: 3, y: 4 };
console.log(distance(a, b));
```

**What this proves:** `Point` is completely absent from the compiled output — `type Point` in the original import told TypeScript, unambiguously, that this specific name would never be needed at runtime, so it was safe to erase entirely; `distance`, a real function, was preserved because it's an actual runtime value.

## Mechanical Walkthrough

- `import { distance, type Point } from "./shapes.ts"` — a single import statement mixing an ordinary (runtime) import (`distance`) with an inline type-only import (`type Point`), marked per-name with the `type` keyword directly before it.
- Every use of `Point` in `main.ts` is purely as a type annotation (`const a: Point = ...`) — never as a value (never called, never passed as data) — which is exactly what makes it eligible to be marked `type`.
- TypeScript also supports marking an entire import statement type-only (`import type { Point } from "./shapes.ts"`), useful when *every* name being imported from a file is type-only; the inline per-name form (`{ distance, type Point }`) is for mixed imports, exactly this lesson's real case.
- Because an `interface` never has runtime existence in the first place (per `typescript-interfaces.md`), it would actually still be erased correctly even *without* the explicit `type` marker in most real setups — the marker's real value is being unambiguous and explicit for both the reader and certain stricter build tools that require it.

## CS Lens

This is a small, explicit instance of the same **erasable type information** idea `typescript-interfaces.md` and `typescript-type-annotations.md` already establish — types exist for the compiler/checker's benefit only and disappear before anything runs; a type-only import marker simply makes that erasure decision unambiguous and explicit at each individual import, rather than inferred.

Also recognized in: any language with a fully-erased type system needing to distinguish compile-time-only names from runtime ones when importing across module boundaries — this is a comparatively young, TypeScript-specific refinement, added specifically because some faster build tools (which transpile files one at a time, without full cross-file type information available) cannot always correctly infer on their own whether an imported name is a type or a value.

## SE Lens

For most everyday TypeScript work, this marker is a small correctness/clarity detail rather than a strictly required one — but it becomes genuinely necessary with certain fast, per-file build tools (which strip types without doing full program analysis) that cannot otherwise tell whether an imported name needs to survive into the compiled output. Using it consistently is a small, cheap habit that avoids a real, occasionally confusing class of build error tied to *how* a specific build tool processes imports, not to the TypeScript language itself.

## Connection

Builds on `typescript-interfaces.md` and `javascript-es-modules-import-export.md`. Directly useful anywhere a module exports both real functions/values and interfaces/types describing their inputs or outputs, which is the common shape once code is organized into small, focused files.

## Try It Yourself

1. Remove the `type` keyword from `import { distance, type Point }`, leaving `import { distance, Point }`, and confirm the code still compiles and runs identically in a standard `tsc` setup — then look up which faster, per-file transpilers (e.g. esbuild, SWC, or Vite's own default transform) would instead fail or warn on this same code, to see the real, concrete case this marker exists for.
2. Add a second interface and a second function to `shapes.ts`, and import all four names in one statement, marking only the two type-only ones with `type` — confirm the compiled output still contains exactly the two real functions and nothing else.
3. Try marking a real, runtime function (`distance`) with `type` by mistake (`import { type distance, Point }`) and attempt to actually call `distance(a, b)` — read the real `tsc` error this produces, confirming the marker isn't just documentation, it's actively checked.
