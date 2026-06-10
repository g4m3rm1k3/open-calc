# TypeScript — LAB 11 — Arrays & Generics

**Prerequisites:** LAB 10 (Objects & Interfaces). You have `Ship`, `Bullet`, and `Asteroid` interfaces. You know: object type annotations, optional properties, `readonly`, structural typing.

**What this lab adds:**
- Typed arrays: `Bullet[]` and `Array<Bullet>` — what they mean and when each syntax is used
- Generics: what `<T>` means and why it exists
- Why `any[]` is dangerous and how to replace it
- Typed versions of the `bullets`, `asteroids`, and `spawnQueue` arrays from the Asteroids game
- A generic `removeExpired<T>` function that works for any entity with a `lifetime` property

**Time:** 60–75 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In LAB 04, `let bullets = []` was typed as `never[]` or `any[]` in TypeScript. What does `never[]` mean, and why is it the inferred type of an empty array?
> 2. If `bullets` is `Bullet[]`, and you accidentally call `bullets.push(ship)`, what would TypeScript do?
> 3. What is the difference between `Array<number>` and `number[]`? (Guess — you'll know the answer by the end.)
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Three properly typed entity arrays — replacing the `any[]` and untyped arrays from the Asteroids game:

```ts
const bullets:    Bullet[]   = [];   // only Bullets allowed
const asteroids:  Asteroid[] = [];   // only Asteroids allowed
const spawnQueue: Asteroid[] = [];   // pending asteroid spawns

// TypeScript now catches:
bullets.push(ship);           // ERROR: Ship not assignable to Bullet
asteroids[0].health;          // ERROR: 'health' does not exist on Asteroid
spawnQueue.push({ x: 0 });   // ERROR: missing required Asteroid properties
```

And a generic `filter` utility that works across all entity types — written once, used for bullets, asteroids, anything with the right shape.

---

## Concept: Typed Arrays

**What they are:** Arrays where every element must be a specific type. TypeScript prevents adding wrong-type elements and narrows the type of retrieved elements automatically.

**The problem before:**
```ts
// Untyped array — TypeScript has no idea what's inside:
let bullets: any[] = [];

bullets.push({ x: 100, y: 200, vx: 5, vy: 0, lifetime: 60 }); // fine
bullets.push({ x: 400, y: 300 }); // also "fine" — any[] accepts everything
bullets.push(42);     // also "fine" — absurd but TypeScript doesn't complain
bullets.push("oops"); // also "fine" — complete nonsense, no error

// Later:
bullets[0].lifetime -= 1; // might work
bullets[2].lifetime -= 1; // NaN — 42 doesn't have lifetime — bug, no TypeScript warning
```

**The solution:**
```ts
let bullets: Bullet[] = [];

bullets.push({ x: 100, y: 200, vx: 5, vy: 0, lifetime: 60 }); // ✓ satisfies Bullet
bullets.push({ x: 400, y: 300 }); // ERROR: missing vx, vy, lifetime
bullets.push(42);     // ERROR: number is not Bullet
bullets.push("oops"); // ERROR: string is not Bullet

// Retrieved elements are automatically typed as Bullet:
const first = bullets[0]; // TypeScript knows: first is Bullet
first.lifetime -= 1;      // ✓ — TypeScript knows Bullet has lifetime: number
first.health   -= 1;      // ERROR: 'health' does not exist on Bullet
```

**What it hides:**
A typed array hides the need to manually verify the type of each element when you retrieve it. The invariant: **every element in a `Bullet[]` is a valid `Bullet`** — TypeScript enforces this at every `push`, every assignment, and narrows the type of every retrieval automatically.

**The two syntaxes — both identical:**
```ts
let bullets: Bullet[]       = []; // shorthand syntax — most common
let bullets: Array<Bullet>  = []; // generic syntax — explicit, used in complex types
```

Both mean exactly the same thing. The `Bullet[]` shorthand is more common in practice; `Array<Bullet>` is used when nested in more complex type expressions (LAB 13).

**Canonical example (General Explanation):**

A filing cabinet with labelled drawers. The "Bullets" drawer only accepts bullet-shaped papers. The "Asteroids" drawer only accepts asteroid-shaped papers. Trying to file a ship form in the bullets drawer: the cabinet rejects it. When you pull a paper from the bullets drawer, you know exactly what shape it is — no inspection needed.

```ts
const numbers: number[] = [1, 2, 3];
numbers.push(4);     // ✓
numbers.push("5");   // ERROR: string not assignable to number

const first = numbers[0]; // TypeScript knows: first is number
first.toFixed(2);         // ✓ — number method — TypeScript knows this is valid
first.toUpperCase();      // ERROR: toUpperCase is a string method, not number
```

**Project Application (The "Why" here):**
`bullets`, `asteroids`, and `spawnQueue` each hold one kind of entity. Typing them as `Bullet[]`, `Asteroid[]`, and `Asteroid[]` respectively means TypeScript catches every wrong-type insertion and narrows every retrieval — no manual type checking needed in `update()` or `render()`.

**Why it matters here:** This replaces the most common source of silent runtime bugs in the Asteroids codebase — accessing properties on array elements that don't have them.

**Watch for:** TypeScript infers `never[]` for `[]` — an empty array with no type information. `never` is a type that means "this value can never exist." An array of `never` can hold nothing — pushing anything into it is an error. Always annotate empty arrays explicitly: `let bullets: Bullet[] = []`.

---

## Concept: Generics — `<T>`

**What it is:** A way to write a function, interface, or type that works with any type — but is still type-safe. The `T` is a **type parameter** — a placeholder for a specific type that is filled in when the function is called.

**Why generics exist — the problem without them:**
```ts
// A function that returns the first element of an array.
// Version 1 — only works for number arrays:
function first(arr: number[]): number {
  return arr[0];
}

// Version 2 — only works for string arrays:
function first(arr: string[]): string {
  return arr[0];
}
// You'd need a separate version for EVERY type.
// With 10 entity types: 10 copies of the same function.

// Version 3 — uses 'any' to avoid repetition:
function first(arr: any[]): any {
  return arr[0];
}
first([1, 2, 3]);    // returns any — TypeScript doesn't know it's a number
first(['a', 'b']);   // returns any — TypeScript doesn't know it's a string
// We've lost all type safety.
```

**The solution — generics:**
```ts
function first<T>(arr: T[]): T {
  // T is a placeholder type — filled in at each call site
  return arr[0];
}

const num    = first([1, 2, 3]);    // T is inferred as number — returns number
const str    = first(['a', 'b']);   // T is inferred as string — returns string
const bullet = first(bullets);     // T is inferred as Bullet — returns Bullet

num.toFixed(2);      // ✓ — TypeScript knows num is number
str.toUpperCase();   // ✓ — TypeScript knows str is string
bullet.lifetime;     // ✓ — TypeScript knows bullet is Bullet
```

**What it hides:**
Generics hide the need to write duplicate implementations for different types. The invariant: **the type of the return value is always the same as the type of the input** — `first<number>` returns `number`, `first<Bullet>` returns `Bullet`. The relationship is enforced by TypeScript, not guessed.

**Canonical example (General Explanation):**

A vending machine that accepts any coin and returns the same coin back. The machine doesn't care which coin you insert — it just returns whatever you gave it. The type of "what comes back" is always the same as "what went in."

```ts
function identity<T>(value: T): T {
  return value; // returns exactly what was passed in — same type
}

identity(42);       // returns 42, type: number
identity("hello");  // returns "hello", type: string
identity(true);     // returns true, type: boolean
// One function, infinite type safety — no duplication, no any
```

**Reading generic syntax:**
```ts
function first<T>(arr: T[]): T
//             ^^^            ^
//     T is declared here    T is used here as the return type
//                  ^^^
//               T[] = array of T elements
```

**Project Application (The "Why" here):**
We'll write `removeExpired<T>` — a function that takes an array of any entity with a `lifetime` property and returns only the non-expired ones. One function, works for bullets, power-ups, particles, any future entity with lifetimes.

**Why it matters here:** Generics are everywhere in TypeScript's standard library — `Array<T>`, `Promise<T>`, `Map<K, V>`. You don't need to write your own generics until you're building utilities, but you need to READ them constantly.

**Watch for:** The `T` is just a conventional name — it stands for "Type." You can use any name: `<ElementType>`, `<Item>`, `<Entity>`. `T` is used by convention because it's short. When a function has two type parameters, `<T, U>` is conventional.

---

## Step 1 — Set Up This Lab

Add **`src/arrays.ts`** to your `typescript-lab-08` project. Make sure your interfaces from LAB 10 are accessible — either copy them to the top of `arrays.ts`, or add this at the top:

```ts
// LAB 11 — Arrays & Generics
// (Copy the Ship, Bullet, Asteroid interfaces from LAB 10 here,
//  or we'll handle imports properly in LAB 14)

interface Ship {
  x: number; y: number; angle: number; vx: number; vy: number;
}

interface Bullet {
  x: number; y: number; vx: number; vy: number; lifetime: number;
}

interface Asteroid {
  x: number; y: number; radius: number;
  vx: number; vy: number; tier: string;
  orbitCentreX?: number; orbitCentreY?: number;
  orbitAngle?: number; orbitSpeed?: number; orbitRadius?: number;
  phase?: number;
}
```

---

## Step 2 — Declare the Three Entity Arrays

Add to **`src/arrays.ts`**:

```ts
// ─── Entity Arrays ────────────────────────────────────────────────────────────
let bullets:    Bullet[]   = [];
// Bullet[] — only Bullet objects allowed inside
// Started empty — TypeScript needs the annotation because [] alone gives never[]

let asteroids:  Asteroid[] = [];
// Asteroid[] — only Asteroid objects allowed

let spawnQueue: Asteroid[] = [];
// The pending-spawn queue from LAB 05 — also Asteroid[] because
// entries are full Asteroid objects waiting to be moved into asteroids[]

console.log('Arrays initialised:',
  bullets.length,    // 0
  asteroids.length,  // 0
  spawnQueue.length  // 0
);
```

### SAVE AND TRY

```bash
npx tsc
node dist/arrays.js
```

**Expected:** `Arrays initialised: 0 0 0`

**In watch mode — test wrong-type insertion:**

Add temporarily:
```ts
bullets.push(42);        // ← uncomment to test
```

**Expected error:**
```
error TS2345: Argument of type 'number' is not assignable to parameter of type 'Bullet'.
```

Remove it.

---

## Step 3 — Push and Retrieve with Full Type Safety

Add to **`src/arrays.ts`**:

```ts
// ─── Populate the arrays ──────────────────────────────────────────────────────

// Push valid bullets — TypeScript checks every property:
bullets.push({
  x: 400, y: 300,
  vx: Math.cos(0) * 8, // cos(0) = 1, so vx = 8
  vy: Math.sin(0) * 8, // sin(0) = 0, so vy = 0
  lifetime: 90,
});
// TypeScript checked: does this object satisfy Bullet? Yes — 5 properties, all correct.

bullets.push({
  x: 200, y: 150,
  vx: -3, vy: 2,
  lifetime: 45,
});

// Push a valid asteroid:
asteroids.push({
  x: 600, y: 200,
  radius: 40,
  vx: 0.5, vy: -0.3,
  tier: 'large',
  orbitCentreX: 600, orbitCentreY: 200,
  orbitAngle: 0, orbitSpeed: 0.01, orbitRadius: 60,
});

// ─── Retrieve with automatic type narrowing ───────────────────────────────────
const firstBullet = bullets[0];
// TypeScript knows: firstBullet is Bullet — no annotation needed
// Because bullets is Bullet[], indexing gives Bullet

firstBullet.lifetime -= 1;
// ✓ — TypeScript knows lifetime is a number property of Bullet
console.log('First bullet lifetime:', firstBullet.lifetime); // 89

const firstAsteroid = asteroids[0];
console.log('Asteroid tier:', firstAsteroid.tier); // 'large'

// The orbit data is optional — TypeScript requires null-checking to use it:
const orbitR = firstAsteroid.orbitRadius;
// orbitR type: number | undefined — because orbitRadius is optional

// Safe access with fallback:
const orbitRadius = firstAsteroid.orbitRadius ?? 0;
// ?? 0: if orbitRadius is undefined, use 0 as fallback
console.log('Orbit radius:', orbitRadius); // 60
```

### SAVE AND TRY

```bash
npx tsc
node dist/arrays.js
```

**Expected output:**
```
Arrays initialised: 0 0 0
First bullet lifetime: 89
Asteroid tier: large
Orbit radius: 60
```

**Change something:** Access `firstBullet.health`. **Expected:**
```
error TS2339: Property 'health' does not exist on type 'Bullet'.
```
Remove it.

---

## Step 4 — Loop Over Typed Arrays

Add to **`src/arrays.ts`**:

```ts
// ─── Typed iteration ──────────────────────────────────────────────────────────

// Standard for loop — bullet has type Bullet inside the loop:
for (let bulletIndex = 0; bulletIndex < bullets.length; bulletIndex++) {
  const bullet = bullets[bulletIndex]; // TypeScript knows: Bullet
  bullet.x        += bullet.vx;        // ✓ — both are number
  bullet.y        += bullet.vy;        // ✓
  bullet.lifetime -= 1;                // ✓
}

// for...of loop — cleaner when you don't need the index:
for (const asteroid of asteroids) {
  // 'asteroid' is inferred as Asteroid — TypeScript knows
  asteroid.x += asteroid.vx; // ✓
  asteroid.y += asteroid.vy; // ✓
}
// for...of: iterates over each element directly (no index variable needed)
// Use when: you need every element and don't need to know its position
// Use standard for: when you need the index (to remove elements, skip some, etc.)

console.log('After update — bullet 0 x:', bullets[0].x);
```

### SAVE AND TRY

```bash
npx tsc
node dist/arrays.js
```

**Expected:** Bullet x position updated by vx (8). First output shows x=400, after loop x=408.

**Change something:** Inside the `for...of` loop, add `asteroid.health -= 1`. **Expected:**
```
error TS2339: Property 'health' does not exist on type 'Asteroid'.
```
Remove it.

---

## Concept: Generic Constraints — `<T extends Something>`

**What it is:** A generic type parameter that must satisfy a minimum shape. Instead of accepting any type, the generic requires the type to have specific properties.

**The problem without constraints:**
```ts
function removeExpired<T>(entities: T[]): T[] {
  return entities.filter(entity => entity.lifetime > 0);
  //                               ^^^^^^^^^^^^^^^^^
  // ERROR: Property 'lifetime' does not exist on type 'T'
  // TypeScript doesn't know T has a lifetime property — T could be anything
}
```

**The solution — constrain T:**
```ts
// Define the minimum shape required:
interface HasLifetime {
  lifetime: number;
}

// T must extend (satisfy) HasLifetime — meaning T must have a lifetime property:
function removeExpired<T extends HasLifetime>(entities: T[]): T[] {
  return entities.filter(entity => entity.lifetime > 0);
  //                               ✓ — T is guaranteed to have lifetime
}
```

**What it hides:**
Generic constraints hide the need for manual type checks inside generic functions. The invariant: **a constrained generic `T extends HasLifetime` is guaranteed to have every property of `HasLifetime`** — inside the function, you can access `lifetime` without checking if it exists.

**Reading the constraint:**
```ts
function removeExpired<T extends HasLifetime>(entities: T[]): T[]
//                     ^^^^^^^^^^^^^^^^^^^^^^^^^^
//     "T can be any type, as long as it has at least the shape of HasLifetime"
//
// T could be: Bullet (has lifetime + x,y,vx,vy)
//             PowerUp (has lifetime + x,y,type)
//             Particle (has lifetime + x,y,radius,opacity)
//             Any future entity with a lifetime property
```

**Project Application (The "Why" here):**
Both bullets and future particle effects have `lifetime`. Writing `removeExpired` as a generic with a `HasLifetime` constraint means one function handles both — and any future entity with `lifetime` — without any changes.

**Why it matters here:** This is the most common real-world use of generics in game code. Utility functions that work across entity types.

**Watch for:** Without `extends HasLifetime`, TypeScript doesn't know T has `lifetime` — accessing it is an error. The constraint is the "proof" that the property exists.

---

## Step 5 — Write a Generic Utility Function

Add to **`src/arrays.ts`**:

```ts
// ─── Generic constraint ───────────────────────────────────────────────────────
interface HasLifetime {
  lifetime: number;
  // Minimum shape: any object with a lifetime number satisfies this
}

// removeExpired: works for ANY array of objects that have a lifetime property
function removeExpired<T extends HasLifetime>(entities: T[]): T[] {
  return entities.filter(entity => entity.lifetime > 0);
  // entity is typed as T — we can safely access entity.lifetime
  // because the constraint T extends HasLifetime guarantees it exists
}

// Test it with bullets (Bullet extends HasLifetime — Bullet has lifetime: number):
const liveBullets: Bullet[] = removeExpired(bullets);
// TypeScript inferred T = Bullet from the argument
// Return type is Bullet[] — not any[], not HasLifetime[] — the FULL type is preserved

console.log('Live bullets:', liveBullets.length);
// 0 or more depending on whether lifetimes are still > 0

// If we had particles with lifetimes, we could reuse the same function:
interface Particle {
  x: number; y: number;
  opacity: number;
  lifetime: number; // ← has lifetime, satisfies HasLifetime
}
const particles: Particle[] = [
  { x: 100, y: 200, opacity: 0.8, lifetime: 30 },
  { x: 150, y: 250, opacity: 0.3, lifetime: 0 },  // expired
];

const liveParticles: Particle[] = removeExpired(particles);
// Same function — different type. TypeScript checks both correctly.
console.log('Live particles:', liveParticles.length); // 1 — the expired one removed
```

### SAVE AND TRY

```bash
npx tsc
node dist/arrays.js
```

**Expected:** `Live particles: 1` — the particle with `lifetime: 0` was removed.

**In watch mode — test wrong type:**

```ts
removeExpired([{ x: 0, y: 0 }]); // ← no lifetime property
```

**Expected error:**
```
error TS2345: Argument of type '{ x: number; y: number; }[]' is not assignable to parameter of type 'HasLifetime[]'.
  Property 'lifetime' is missing in type '{ x: number; y: number; }'.
```
Remove it.

---

## 🎯 Challenge: Generic `clampAll` Function

**You know:** Generic functions, constraints, typed arrays, and the `clamp` concept from LAB 03.

**Task:** Write a generic function `clampSpeed<T extends HasVelocity>(entities: T[], maxSpeed: number): T[]` that takes any array of entities with `vx` and `vy` and clamps their speed to `maxSpeed` (like the speed cap in `update()` from LAB 03). It should return the same array with all velocities clamped in place.

First define the `HasVelocity` constraint interface. Then write the function. Test it with a `Bullet[]` and verify the return type is still `Bullet[]`, not `HasVelocity[]`.

**Starting code:**
```ts
interface HasVelocity {
  // define vx and vy here
}

function clampSpeed<T extends HasVelocity>(entities: T[], maxSpeed: number): T[] {
  // for each entity:
  //   compute current speed (sqrt of vx² + vy²)
  //   if speed > maxSpeed, scale vx and vy down
  // return the modified array
}
```

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
interface HasVelocity {
  vx: number; // horizontal velocity component
  vy: number; // vertical velocity component
}

function clampSpeed<T extends HasVelocity>(entities: T[], maxSpeed: number): T[] {
  for (const entity of entities) {
    const speed = Math.sqrt(entity.vx * entity.vx + entity.vy * entity.vy);
    // compute current speed — distance formula applied to velocity vector
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      // scale: ratio to bring speed exactly to maxSpeed while preserving direction
      entity.vx *= scale;
      entity.vy *= scale;
    }
  }
  return entities; // mutates in place AND returns the array
}

// Test with Bullet[] — T is inferred as Bullet:
const fastBullets: Bullet[] = [
  { x: 0, y: 0, vx: 20, vy: 20, lifetime: 90 }, // speed = √(400+400) ≈ 28.3
];

const clamped = clampSpeed(fastBullets, 8);
// TypeScript knows clamped is Bullet[] — not HasVelocity[]
// The generic preserved the full type

console.log('Clamped speed:', Math.sqrt(clamped[0].vx ** 2 + clamped[0].vy ** 2).toFixed(2));
// Expected: 8.00 — clamped to exactly maxSpeed
console.log('Direction preserved — vx equals vy:', Math.abs(clamped[0].vx - clamped[0].vy) < 0.001);
// Expected: true — 45° direction unchanged
```

**Key insight:** The function returns `T[]`, not `HasVelocity[]`. This means the caller gets back `Bullet[]` when they pass `Bullet[]` — the FULL type, with `lifetime`, `x`, `y`, and all other properties accessible. If the return type were `HasVelocity[]`, callers would lose access to bullet-specific properties. This is the core value of constrained generics: the output type is as specific as the input type, not degraded to the constraint.

</details>

---

## 🎯 Challenge: `findByTier` Function

**You know:** Generic functions, typed arrays, `Asteroid` interface.

**Task:** Write a typed function `findByTier(asteroids: Asteroid[], tier: string): Asteroid | undefined` that returns the first asteroid of the given tier, or `undefined` if none is found.

Then call it and safely use the result — TypeScript requires you to handle the `undefined` case before accessing properties.

**Starting code:**
```ts
function findByTier(asteroids: Asteroid[], tier: string): Asteroid | undefined {
  // return the first asteroid where asteroid.tier === tier
  // return undefined if none found
}

const found = findByTier(asteroids, 'large');
// How do you safely access found.radius here?
// found might be undefined — TypeScript will tell you if you don't check
```

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
function findByTier(asteroids: Asteroid[], tier: string): Asteroid | undefined {
  for (const asteroid of asteroids) {
    if (asteroid.tier === tier) {
      return asteroid; // found — return it immediately
    }
  }
  return undefined; // exhausted the array — not found
}

const found = findByTier(asteroids, 'large');

// TypeScript knows found is Asteroid | undefined.
// Accessing found.radius directly is an ERROR:
// found.radius // ERROR: Object is possibly 'undefined'

// Safe option 1 — if check (type narrowing):
if (found !== undefined) {
  console.log('Found large asteroid, radius:', found.radius);
  // Inside this if: TypeScript narrows found to Asteroid (not undefined)
}

// Safe option 2 — optional chaining:
console.log('Radius:', found?.radius);
// found?.radius: returns found.radius if found exists, undefined if found is undefined
// The ?. is the optional chaining operator — covered fully in LAB 13

// Safe option 3 — nullish coalescing with fallback:
const radius = found?.radius ?? 0;
// If found is undefined, radius = 0. If found exists, radius = found.radius.
console.log('Radius with fallback:', radius);
```

**Key insight:** The return type `Asteroid | undefined` forces every CALLER to acknowledge that the function might not find anything. Without it (if the return type were just `Asteroid`), you'd get a false promise — TypeScript would let you access `found.radius` without checking, then crash at runtime when the asteroid isn't there. Making the absence explicit in the type means TypeScript catches every case where you forgot to handle it.

</details>

---

## Concept: `ReadonlyArray<T>` — Immutable Arrays

**What it is:** An array type where none of the mutating methods (`push`, `pop`, `shift`, `splice`) are available. Elements can be read but not modified.

**The problem before:**
```ts
// ASTEROID_TIERS should never be modified — but nothing stops this:
const TIER_LIST: Asteroid[] = [largeAsteroid, mediumAsteroid];
TIER_LIST.push(tinyAsteroid); // TypeScript: fine, Asteroid[] allows push
// Configuration data was accidentally mutated at runtime.
```

**The solution:**
```ts
const TIER_LIST: ReadonlyArray<Asteroid> = [largeAsteroid, mediumAsteroid];
// or equivalently:
const TIER_LIST: readonly Asteroid[] = [largeAsteroid, mediumAsteroid];

TIER_LIST.push(tinyAsteroid); // ERROR: Property 'push' does not exist on ReadonlyArray<Asteroid>
TIER_LIST[0] = someOther;     // ERROR: Index signature in type 'readonly Asteroid[]' only permits reading
```

**What it hides:**
`ReadonlyArray` hides all mutation operations. The invariant: **the array's contents cannot change after creation** — the length and all elements are fixed.

**Smallest possible example:**
```ts
const scores: readonly number[] = [100, 250, 75];
scores[0];       // ✓ — reading is fine
scores.length;   // ✓ — reading length is fine
scores.push(50); // ERROR: push doesn't exist on readonly array
scores[0] = 999; // ERROR: index assignment not allowed
```

**Why it matters here:** The `ASTEROID_TIERS` configuration table from LAB 05 should be `ReadonlyArray` or use `readonly` on its properties. Combined with the `readonly` properties in `TierData` from LAB 10, this creates a fully immutable configuration object.

**Watch for:** `ReadonlyArray<T>` and `readonly T[]` are the same type. The `readonly` keyword on an array prevents mutation of the array itself — not of the objects inside it. A `readonly Asteroid[]` prevents adding/removing elements but still allows `asteroids[0].x = 99` (modifying an element's property). For deeply immutable data, use both `readonly` on the array AND `readonly` on the interface properties.

---

## Final Check

| Feature | How to verify |
|---|---|
| `Bullet[]` annotation works | `let bullets: Bullet[] = []` — no error |
| Wrong type push caught | `bullets.push(42)` → error: number not assignable to Bullet |
| Missing property caught | `bullets.push({ x:0, y:0 })` → error: missing vx, vy, lifetime |
| Retrieved element typed | `bullets[0].lifetime` → IntelliSense/hover shows `number` |
| `for...of` element typed | `for (const b of bullets)` → `b` is `Bullet` inside loop |
| Generic function infers T | `removeExpired(bullets)` → return type is `Bullet[]`, not `HasLifetime[]` |
| Constraint prevents wrong type | `removeExpired([{ x: 0 }])` → error: missing lifetime |
| `readonly` array prevents push | `const arr: readonly number[] = [1]; arr.push(2)` → error |
| `Asteroid | undefined` forces check | `findByTier(...).radius` without null check → error: possibly undefined |

---

## What's Next

In **LAB 12** you'll type functions completely — parameter types, return types, optional parameters, default values, and the `void` return type. You'll also type the callback functions in the Observer pattern from LAB 07 and discover why `(asteroid: Asteroid) => void` is a type just like `number` or `string`.

---

## Quick Check Answers

**1. What does `never[]` mean, and why is it the inferred type of `[]`?**

`never` is TypeScript's type for "a value that can never exist" — it's used for impossible cases, like the return type of a function that always throws an error. An empty array literal `[]` has no elements, so TypeScript can't infer what type the elements would be. It falls back to `never[]` — "an array whose elements can never exist" — because no element has been provided to infer from. Pushing ANYTHING into a `never[]` is an error because no value satisfies `never`. The fix is always to annotate explicitly: `let bullets: Bullet[] = []`.

**2. If `bullets` is `Bullet[]` and you call `bullets.push(ship)`, what would TypeScript do?**

TypeScript produces an error: `Argument of type 'Ship' is not assignable to parameter of type 'Bullet'`. Even though both `Ship` and `Bullet` have `x`, `y`, `vx`, `vy` — `Bullet` also requires `lifetime`, which `Ship` doesn't have. TypeScript's structural check sees that `Ship` doesn't fully satisfy `Bullet` and rejects it. This prevents the runtime bug where `bullets[i].lifetime -= 1` would give `NaN` for a ship accidentally in the bullets array.

**3. What is the difference between `Array<number>` and `number[]`?**

Nothing — they are identical types. `number[]` is shorthand syntax for `Array<number>`. Both describe an array where every element is a number. The shorthand `T[]` is more common in everyday code. The generic form `Array<T>` is used in more complex type expressions — for example, `Array<Array<number>>` (a 2D array) is clearer than `number[][]`, and `ReadonlyArray<Bullet>` has no shorthand equivalent. In practice: use `T[]` for simple cases, `Array<T>` when nesting or when the generic form is clearer.

---

*End of LAB 11. Next: [[LAB-12-Functions]]*
