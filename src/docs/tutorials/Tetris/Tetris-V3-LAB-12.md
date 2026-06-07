# Tetris V3 — LAB 12 — Generic Constraints and TypeScript Built-ins

**Prerequisites:** LAB-11 complete. The game is fully playable: ghost piece,
7-bag, next preview, scoring, levels, game over, restart. `Queue<T>` exists.

**What this lab adds:**
- Type constraints: `<T extends ...>` — restricting what T can be
- When to add constraints vs when to leave T unconstrained
- TypeScript's built-in generic types in context: `Array<T>`, `Map<K, V>`,
  `Record<K, V>`, `Readonly<T>`
- An optional refactor: `PieceQueue` rebuilt as a thin wrapper around a
  truly general `Queue<T>` with explicit constraints

**Time:** 45–60 minutes (conceptual — less code than previous labs)

---

## What You Will Build

No new visual features. This lab solidifies your understanding of generics
and wraps the series. After this lab you will understand:

- Why TypeScript needs type parameters at all
- When `<T extends SomeInterface>` is appropriate
- How every TypeScript collection you will ever use (`Array<T>`, `Map<K,V>`,
  `Promise<T>`) follows the same pattern you built in LAB-11

---

> **Quick Check — try to answer before reading further:**
>
> 1. What does `T extends object` mean? What does it prevent?
> 2. TypeScript's `Array<T>` is generic. What is T when you write `number[]`?
> 3. *(Prediction)* Could you use `Queue<number>` to store piece shape indices
>    instead of `Queue<Piece>`? What would be the tradeoff?
>
> *(Answers at the end of this lab)*

---

## Concept: Generic Type Constraints — `<T extends SomeType>`

**What it is:** A restriction on what types are allowed as T. Without a constraint,
T can be ANY type (number, string, Piece, null, anything). A constraint limits
T to types that have at least certain properties.

**The problem without constraints:**

```ts
class Queue<T> {
  public enqueue(item: T): void { this.items.push(item); }
  public dequeue(): T | undefined { return this.items.shift(); }
}

// This works — but so do these (which may be undesirable):
const numberQueue = new Queue<number>();
const nullQueue   = new Queue<null>();       // queue of nulls — probably wrong
const voidQueue   = new Queue<undefined>(); // queue of undefineds — almost certainly wrong
```

**The solution — constrain T:**

```ts
// T must be an object — not a primitive:
class Queue<T extends object> {
  // ...same implementation...
}

const pieceQueue = new Queue<Piece>();      // ✅ Piece is an object
const numberQueue = new Queue<number>();   // ❌ ERROR: number does not satisfy 'object'
```

**When to constrain vs not:**

| Situation | Constraint | Reason |
|-----------|------------|--------|
| Queue that stores UI components | `<T extends HTMLElement>` | Must have `.remove()` method |
| Queue that stores anything | `<T>` (no constraint) | Maximum flexibility |
| Function that needs `.toString()` | `<T extends { toString(): string }>` | Structural constraint |
| Our PieceQueue | `<T extends object>` | Prevent primitive misuse; no specific methods needed |

**Canonical example:**

```ts
// A function that needs items to have a 'name' property:
function printName<T extends { name: string }>(item: T): void {
  console.log(item.name);  // ✅ TypeScript knows T has 'name: string'
}

printName({ name: 'Alice', age: 30 });  // ✅
printName({ name: 'Bob' });             // ✅
printName(42);                          // ❌ number has no 'name'
```

**Project Application (The "Why" here):**

Our `Queue<T>` stores Piece objects (objects). Adding `T extends object` prevents
accidental use of `Queue<number>` for storing raw piece indices — we always want
to store full Piece objects, not just numbers, because the Piece carries its
position and rotation state.

**Watch for:** `object` (lowercase) means "any non-primitive" — excludes `number`,
`string`, `boolean`, `null`, `undefined`. `Object` (uppercase) is subtly different
(it accepts everything except `null` and `undefined`). Use lowercase `object` for
the "not a primitive" constraint.

---

## Step 1 — Add `extends object` to Queue

Open `src/queue.ts`. Update the class signature:

```ts
export class Queue<T extends object> {  // ← add 'extends object'
  private items: T[] = [];
  // ...rest unchanged...
}
```

### SAVE AND TRY

Save. Look at your editor.

**Expected:** No errors — `Piece` is an object, so `Queue<Piece>` still works.

**Test the constraint:** Temporarily add this in `main.ts`:

```ts
const badQueue = new Queue<number>();  // ← try this
```

**Expected error:** `Type 'number' does not satisfy the constraint 'object'.`

Delete the test line.

---

## Concept: TypeScript's Built-in Generic Types

The generics pattern you built in LAB-11 is the same pattern powering every
TypeScript collection. Recognizing it makes reading TypeScript documentation
natural.

### `Array<T>` — the array you have used all along

```ts
// These two are identical:
const board: CellValue[][]    // shorthand syntax
const board: Array<Array<CellValue>>  // explicit generic syntax

// TypeScript infers T when you initialize:
const nums = [1, 2, 3];   // TypeScript infers: Array<number>
```

### `Map<K, V>` — a key-value store with typed keys and values

```ts
// Map<K, V>: K is the key type, V is the value type.
const colorMap = new Map<number, string>();
colorMap.set(1, '#00f0f0');   // key: number, value: string
colorMap.set(2, '#0000f0');

colorMap.get(1);    // returns: string | undefined (key might not exist)
colorMap.get('x');  // ❌ ERROR: 'x' is a string, not a number (key type is number)
```

**When to use Map vs Record:**

```ts
// Record<K, V>: compile-time only — keys must be known in advance (literal types).
// Used for lookup tables where all possible keys are known.
const BASE_SCORES: Record<number, number> = { 0: 0, 1: 40, 2: 100, 3: 300, 4: 1200 };

// Map<K, V>: runtime — keys can be added dynamically.
// Used when the set of keys grows at runtime (e.g., player scores by ID).
const playerScores = new Map<string, number>();
playerScores.set('alice', 5000);  // key added at runtime
```

### `Promise<T>` — asynchronous value that will eventually be type T

```ts
// A function that fetches score data — returns a Promise of a number:
async function fetchHighScore(): Promise<number> {
  // ... network request ...
  return 9999;  // TypeScript checks: 9999 is a number ✅
}

const score: number = await fetchHighScore();  // TypeScript knows: this is a number
```

### `Readonly<T>` — makes all properties of T read-only

```ts
// Readonly<T> takes any interface or type and marks every field readonly:
interface Vec2 { x: number; y: number; }

const mutablePos: Vec2 = { x: 3, y: 0 };
mutablePos.x = 5;   // ✅ allowed

const frozenPos: Readonly<Vec2> = { x: 3, y: 0 };
frozenPos.x = 5;    // ❌ ERROR: Cannot assign to 'x' because it is a read-only property
```

**Project relevance:** `Readonly<Vec2>` would prevent any function from modifying
a position vector it received as a parameter — useful for expressing "this
function only reads position, it does not move the piece."

---

## Step 2 — Optional Refactor: Type the Piece Queue

The current `PieceQueue` hardcodes `Queue<Piece>` internally. As a deeper
TypeScript exercise, refactor it to be typed at the boundary:

```ts
// src/randomizer.ts — updated class signature

// PieceQueue is NOT generic itself — it always stores Pieces.
// But it uses the generic Queue<Piece> internally, demonstrating that generics
// are composed, not always exposed at the outer layer.
export class PieceQueue {
  private readonly queue: Queue<Piece>;  // ← add 'readonly' — queue reference never changes

  constructor() {
    this.queue = new Queue<Piece>();   // explicit type argument — T = Piece
    this.fillBag();
    this.fillBag();
  }

  // ... methods unchanged ...

  // get size: expose queue size without exposing the Queue itself:
  public get size(): number {
    return this.queue.size;   // delegate to Queue's getter
  }
}
```

### SAVE AND TRY

Save. No behavioral change — this is a refactor. All existing functionality works.

**In DevTools Console:**

```js
state.pieceQueue.size   // Expected: >= 7 (two bags minus pieces already dequeued)
```

---

## 🎯 Challenge: A Generic `shuffle<T>` Function

**You know:** `fisherYatesShuffle` only works on `number[]`. Generics allow
the same function to shuffle any array type.

**Task:** Write a generic `shuffle<T>(array: readonly T[]): T[]` function that
works on arrays of any type. Update `PieceQueue` to use it.

**Constraints on T:** None needed — the Fisher-Yates algorithm only swaps
elements; it does not inspect their values. Any type works.

**Starting code:**

```ts
function shuffle<T>(array: readonly T[]): T[] {
  const result = [...array];   // copy — never mutate the input
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

**Task:** Verify that TypeScript correctly infers T when you call:

```ts
shuffle([1, 2, 3, 4])        // T inferred as number
shuffle(['a', 'b', 'c'])     // T inferred as string
shuffle([new Piece(1), new Piece(2)])  // T inferred as Piece
```

And that the return type matches: `shuffle([1, 2, 3])` returns `number[]`,
not `any[]`.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// Generic shuffle — T can be any type (no constraint needed):
export function shuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Usage in PieceQueue — TypeScript infers T = number from the array literal:
private fillBag(): void {
  const shuffledIndices = shuffle(ALL_SHAPE_INDICES);
  //                                ↑ T inferred as number — shuffledIndices is number[]
  for (const shapeIndex of shuffledIndices) {
    this.queue.enqueue(new Piece(shapeIndex));
  }
}
```

**Key insight:** TypeScript infers generic type parameters from the arguments
at the call site — you rarely need to write `shuffle<number>(...)` explicitly.
The `readonly T[]` input type ensures the original array is not modified
(TypeScript enforces this — you cannot call mutating methods on `readonly`).
The return type `T[]` (mutable) is correct because the caller may need to
modify the shuffled result.

</details>

---

## Series Summary — What You Built and What You Learned

### TypeScript

| Lab | TypeScript Feature |
|-----|--------------------|
| 01 | Type annotations, non-null assertion `!`, `HTMLCanvasElement` |
| 02 | `type` alias, union types (`0 \| 1 \| 2 \| ...`), `readonly` |
| 03 | `interface`, `class`, `constructor`, `this`, access modifiers |
| 04 | Method return types, pure functions, type narrowing |
| 05 | Boolean return types, function parameter types |
| 06 | `interface` for data objects, `GameState` contract |
| 07 | Class refactor, private encapsulation, `Board` class |
| 08 | `readonly` arrays, `Array.every`, `Array.filter` types |
| 09 | `enum`, `Record<K, V>`, `const enum` |
| 10 | Discriminated unions, type narrowing in `switch` |
| 11 | Generics `<T>`, generic classes `Queue<T>` |
| 12 | `<T extends ...>`, built-in generics `Map<K,V>`, `Readonly<T>`, `shuffle<T>` |

### OOP

| Lab | OOP Concept |
|-----|-------------|
| 03 | Class, constructor, properties, methods |
| 03 | Access modifiers: `private`, `public` |
| 03 | Encapsulation (data + behavior together) |
| 04 | Pure functions vs methods — when to use each |
| 06 | Interface as contract |
| 07 | Board class — full encapsulation, controlled mutation |
| 09 | Strategy Pattern (scoring via data table) |
| 10 | State Pattern (Finite State Machine) |
| 11 | Composition (PieceQueue uses Queue<T>) |
| 11 | Queue class — FIFO with O(1) enqueue |

### Linear Algebra and Math

| Lab | Math Concept |
|-----|-------------|
| 01 | Canvas coordinate system (x right, y down) |
| 02 | Matrix as 2D grid, row-major indexing |
| 03 | 2D vectors: position and direction |
| 03 | Vector addition for movement |
| 04 | 2D rotation matrix R(-90°) |
| 04 | Transpose + row-reverse = 90° CW rotation |
| 04 | Why 4× CW = identity (rotation group of order 4) |
| 06 | Delta time: speed × time = distance |
| 08 | Universal quantification `∀` = `Array.every` |
| 08 | Set comprehension = `Array.filter` |
| 09 | Tetris scoring formula (geometric multiplier) |
| 11 | Fisher-Yates shuffle (uniform permutation) |

### Data Structures and Algorithms

| Lab | DSA Topic |
|-----|-----------|
| 02 | 2D array as matrix, shared-reference trap |
| 05 | Predicate functions (guard clause pattern) |
| 07 | Encapsulated mutable state (Board class) |
| 08 | `Array.filter` + `Array.every` as formal algorithms |
| 08 | Time complexity: O(ROWS × COLS) for clear pass |
| 10 | Finite State Machine (formal model) |
| 11 | Queue ADT (abstract data type) |
| 11 | 7-bag randomizer (fair distribution via shuffle) |
| 12 | Generic data structures, type constraints |

---

## Final Check — Full Series

| Skill | Where to demonstrate |
|-------|---------------------|
| TypeScript compiles without errors | `npm run build` — zero errors |
| OOP: all game objects are classes | Piece, Board, Queue, PieceQueue — all classes |
| Rotation uses matrix math | `rotateMatrix([[0,1,0],[1,1,1],[0,0,0]])` returns T rotated CW |
| Collision uses predicate | `isValidPosition(...)` tested at walls, floor, locked cells |
| Game loop uses delta time | `DROP_INTERVAL_MS / level` — speed increases with level |
| FSM for game phase | `state.phase.kind` only ever equals `'playing'` or `'gameover'` |
| Queue is FIFO | 7 pieces served, no repeats — 7-bag verified by streak counter |
| Generics are typed | `Queue<number>` causes TypeScript error (constraint: `T extends object`) |

---

## Quick Check Answers

**1. What does `T extends object` mean?**

It means T must be a non-primitive type — an object (class instance, plain
object, array). Primitives (`number`, `string`, `boolean`, `null`, `undefined`)
are excluded. This constraint prevents `Queue<number>` while allowing
`Queue<Piece>`, `Queue<Vec2>`, and `Queue<HTMLElement>`. The constraint does not
say T must have any specific properties — just that it is not a primitive.

**2. `Array<T>` — what is T when you write `number[]`?**

`T` is `number`. The `number[]` shorthand is syntactic sugar for `Array<number>`.
Every method on the array is typed accordingly: `push(item: number)` accepts
only numbers; `.map(fn: (item: number) => R)` guarantees the callback receives
numbers. TypeScript infers T automatically from the array contents in most cases:
`const nums = [1, 2, 3]` produces `Array<number>` without writing `Array<number>`
explicitly.

**3. Could `Queue<number>` store piece indices instead of `Queue<Piece>`?**

With the `T extends object` constraint — no, TypeScript would refuse. Without it
— yes, technically. The tradeoff: storing raw indices `Queue<number>` is simpler
(less memory), but you lose type safety about WHICH index is valid (1–7 only) and
the queue does not carry piece state (position, rotation). When you dequeue an
index, you must still `new Piece(index)` to get a usable piece. Storing
`Queue<Piece>` means the pieces are fully constructed at enqueue time, with their
spawn positions already set — ready to become the `activePiece` immediately.

---

*Congratulations — Tetris V3 is complete. You built a full Tetris game in
TypeScript using OOP design patterns, linear algebra for rotation, and formal
data structures. The concepts introduced here (generics, FSMs, encapsulation,
rotation matrices, shuffle algorithms) appear in every serious software project.*
