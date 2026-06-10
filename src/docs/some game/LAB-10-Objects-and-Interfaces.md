# TypeScript — LAB 10 — Objects & Interfaces

**Prerequisites:** LAB 09 (Primitive Types & Inference). You know all seven primitive types, `null`, `undefined`, `any`, `unknown`, the `string | null` union syntax, and when to annotate vs infer.

**What this lab adds:**
- Object type annotations — describing the shape of `{}` objects
- Interfaces — named, reusable descriptions of object shapes
- Optional properties with `?`
- Readonly properties with `readonly`
- Typed versions of `Ship`, `Bullet`, and `Asteroid` from the Asteroids game

**Time:** 60–75 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In the Asteroids game, `const ship = { x: 0, y: 0, angle: 0, vx: 0, vy: 0 }`. What would TypeScript infer as the type of `ship`?
> 2. What happens if you access `ship.health` — a property that doesn't exist on the ship object?
> 3. If two functions both accept a "thing with x and y properties," do you have to write the type description twice?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

TypeScript interfaces for the three core game entities. By the end, you can write this — and TypeScript enforces every property:

```ts
interface Ship {
  x:     number;
  y:     number;
  angle: number;
  vx:    number;
  vy:    number;
}

const ship: Ship = {
  x: 0, y: 0, angle: 0, vx: 0, vy: 0
};

ship.health; // ERROR: Property 'health' does not exist on type 'Ship'
ship.x = "left"; // ERROR: Type 'string' is not assignable to type 'number'
```

---

## Concept: Object Type Annotation

**What it is:** A description of an object's shape — what properties it has and what type each property holds — written inline as `{ propertyName: type; ... }`.

**The problem before:**
```ts
// Plain JavaScript object — TypeScript has no idea what's inside:
const ship = { x: 0, y: 0 };
ship.x = "left";   // TypeScript infers x is number from initialisation — actually catches this
ship.halth = 100;  // Typo: 'halth' instead of 'health' — TypeScript also catches this
// Wait — TypeScript actually does infer types from object literals!
// The real problem is when you pass the object to a function:

function moveShip(s) { // 's' has type 'any' — no protection
  s.x += s.vx;        // TypeScript can't check if 's' even HAS 'vx'
}
```

**The solution — inline object type:**
```ts
function moveShip(s: { x: number; y: number; vx: number; vy: number }) {
  s.x += s.vx; // ✓ TypeScript knows s has vx of type number
  s.angle;     // ERROR: Property 'angle' does not exist on this type
}
```

**What it hides:**
Object type annotations hide the need to manually check every property access for correctness. The invariant: **every property access on a typed object is checked at compile time** — accessing a non-existent property, or using a property as the wrong type, is an error before the code runs.

**The problem with inline types — repetition:**
```ts
function moveShip(s: { x: number; y: number; vx: number; vy: number }) { ... }
function drawShip(s: { x: number; y: number; vx: number; vy: number }) { ... }
function wrapShip(s: { x: number; y: number; vx: number; vy: number }) { ... }
// Same description typed three times — fix one, must fix all three
```

**The solution — interfaces:**
```ts
interface Ship { x: number; y: number; vx: number; vy: number; }

function moveShip(s: Ship) { ... } // Ship used by name
function drawShip(s: Ship) { ... } // Ship used by name
function wrapShip(s: Ship) { ... } // Ship used by name
// Change Ship once → all three functions update automatically
```

---

## Concept: Interface

**What it is:** A named, reusable description of an object's shape. An interface declares what properties an object must have and what types they must be. It does NOT create any runtime code — interfaces vanish entirely when TypeScript compiles to JavaScript.

**Pattern category:** Structural typing (TypeScript's type system is structural — objects are compatible if their shapes match, not just if they're declared as the same type)

**The problem before:**
```ts
// Without interfaces, every function must re-describe the shape:
function updateBullet(b: { x: number; y: number; vx: number; vy: number; lifetime: number }) {
  b.x += b.vx;
  b.lifetime -= 1;
}
// 5 properties × N functions = 5N descriptions to maintain
```

**The solution:**
```ts
interface Bullet {
  x:        number;
  y:        number;
  vx:       number;
  vy:       number;
  lifetime: number;
}

function updateBullet(b: Bullet) {
  b.x += b.vx;
  b.lifetime -= 1;
}
// Change Bullet once → TypeScript tells you everywhere that needs updating
```

**What it hides:**
An interface hides the repetition of describing an object's shape in every location that uses it. The invariant: **any object used where a `Bullet` is expected must have ALL required properties at the correct types** — TypeScript checks this structurally, not by name. An object `{ x: 0, y: 0, vx: 1, vy: 0, lifetime: 90 }` satisfies `Bullet` even without being explicitly declared as one.

**Canonical example (General Explanation):**

Think of an interface as a job description. "Must have: 5 years experience, JavaScript skill, degree." Any candidate who meets those requirements can fill the role — you don't care about their name, only their qualifications. TypeScript's interfaces work the same way: any object that has the required properties, at the right types, satisfies the interface.

```ts
interface Greetable {
  name: string;
  greet(): string; // functions are properties too — covered in LAB 12
}

const alice = { name: 'Alice', greet: () => 'Hello!' };
const robot = { name: 'R2D2', greet: () => 'Beep!', batteryLevel: 80 };

// Both satisfy Greetable — they have name and greet.
// robot has an extra property (batteryLevel) — that's fine.
// Missing a property = error. Wrong type = error. Extra = fine.
```

**Project Application (The "Why" here):**
The Asteroids game has three entity types that are passed to many functions: `Ship`, `Bullet`, and `Asteroid`. Without interfaces, every function that takes a ship must re-describe what a ship looks like. With interfaces, you write the description once and reference it everywhere.

**Why it matters here:** Interfaces are the foundation of TypeScript's type system for objects. Every lab from here on uses them.

**Watch for:** Interfaces describe ONLY structure — what properties an object has and their types. They do NOT contain implementation (actual code). For objects that contain both data and methods (functions), interfaces describe both — but the implementation is in the object or class that satisfies the interface.

---

### Concept: Optional Properties (`?`)

**What it is:** A property marked with `?` that may or may not be present on an object. Accessing it gives `T | undefined` — TypeScript forces you to handle the case where it's missing.

**The problem before:**
```ts
// Some asteroids have orbit data, others don't.
// Without optional properties, you must either:
// 1. Put orbit data on ALL asteroids (wasteful, misleading)
// 2. Use 'any' for the asteroid type (defeats the purpose)
interface Asteroid {
  x: number;
  orbitCentreX: number; // MUST be present — but small asteroids don't orbit!
}
```

**The solution:**
```ts
interface Asteroid {
  x: number;
  orbitCentreX?: number; // ← the ? means: present or absent — both are fine
}

const large: Asteroid = { x: 100, orbitCentreX: 100 }; // ✓ has orbit data
const small: Asteroid = { x: 200 };                     // ✓ no orbit data — that's fine

// But accessing it requires a null check:
function getOrbitCentre(a: Asteroid): number {
  return a.orbitCentreX;        // ERROR: possibly undefined
  return a.orbitCentreX ?? 0;  // ✓ — ?? provides a fallback if undefined
  //                    ^^
  // The nullish coalescing operator: "use orbitCentreX if it exists, else 0"
}
```

**What it hides:**
Optional properties hide the need to manually check every object for the presence of a property that might not exist. The invariant: **TypeScript knows which properties are optional** — accessing an optional property without handling `undefined` is a compile-time error, not a runtime surprise.

**Smallest possible example:**
```ts
interface Config {
  volume:    number;
  fullscreen?: boolean; // optional — games may not need this
}

const config1: Config = { volume: 80 };            // ✓ fullscreen omitted
const config2: Config = { volume: 60, fullscreen: true }; // ✓ fullscreen present

// Using it:
const isFullscreen: boolean = config1.fullscreen ?? false;
// ?? means: "if fullscreen is undefined, use false instead"
```

**Why it matters here:** The `Asteroid` interface needs optional orbit properties (only large asteroids orbit), optional phase data (only small asteroids sine-wave), etc. Optional properties let one interface cover all tiers without lying about what's present.

**Watch for:** Accessing an optional property gives you `T | undefined`, not `T`. TypeScript requires you to handle the `undefined` case — either with `?? defaultValue`, an `if` check, or the optional chaining operator `?.` (covered in LAB 13).

---

### Concept: Readonly Properties

**What it is:** A property marked `readonly` that can be set on creation but never changed afterwards. TypeScript prevents reassignment.

**The problem before:**
```ts
// Constants that shouldn't change, but CAN:
const config = { maxLives: 3, bulletSpeed: 8 };
config.maxLives = 10; // Oops — changed a value that should be fixed
// JavaScript doesn't stop you. TypeScript with readonly does.
```

**The solution:**
```ts
interface GameConfig {
  readonly maxLives:    number; // set once, never changed
  readonly bulletSpeed: number;
  volume:               number; // can be changed (player adjusts volume)
}

const config: GameConfig = { maxLives: 3, bulletSpeed: 8, volume: 80 };
config.volume    = 60;  // ✓ — volume is mutable
config.maxLives  = 10;  // ERROR: Cannot assign to 'maxLives' because it is read-only
```

**What it hides:**
`readonly` hides the defensive logic that would otherwise be needed to prevent mutation of constant data. The invariant: **a readonly property's value is set exactly once (at object creation) and is never changed after that** — TypeScript enforces this at compile time without any runtime overhead.

**Project Application (The "Why" here):**
The `ASTEROID_TIERS` data from LAB 05 should never be modified at runtime — it's configuration. Marking its properties as `readonly` makes this contract explicit and enforced.

**Watch for:** `readonly` only prevents reassignment of the property itself — it does NOT deep-freeze nested objects. A `readonly arr: number[]` prevents reassigning `arr`, but you can still call `arr.push(5)`. For deeply immutable arrays, use `readonly number[]` or `ReadonlyArray<number>` — covered in LAB 11.

---

## Step 1 — Create the Interfaces File

Add **`src/interfaces.ts`** to your `typescript-lab-08` project:

```ts
// LAB 10 — Objects & Interfaces
// Core game entity interfaces for the Asteroids game
```

Watch mode will pick it up automatically.

---

## Step 2 — The `Ship` Interface

Add to **`src/interfaces.ts`**:

```ts
// ─── Ship ─────────────────────────────────────────────────────────────────────
interface Ship {
  x:     number; // horizontal position in canvas pixels
  y:     number; // vertical position in canvas pixels
  angle: number; // facing direction in radians (0 = right)
  vx:    number; // horizontal velocity in pixels per frame
  vy:    number; // vertical velocity in pixels per frame
}
// This describes the minimum shape of a ship.
// Any object with these five number properties satisfies Ship.

// Create a ship that satisfies the interface:
const ship: Ship = {
  x:     0,
  y:     0,
  angle: 0,
  vx:    0,
  vy:    0,
};

// Valid use — all properties present and correct type:
ship.x     = 400;    // ✓ number
ship.angle = 1.57;   // ✓ number (approximately π/2 radians)

// Invalid uses — TypeScript catches these:
// ship.x      = "left"; // ERROR: string not assignable to number
// ship.health = 100;    // ERROR: 'health' does not exist on Ship
// ship.angle;           // ✓ fine to read — just can't assign wrong type

console.log('Ship created:', ship);
```

### SAVE AND TRY

```bash
npx tsc
node dist/interfaces.js
```

**Expected output:**
```
Ship created: { x: 400, y: 0, angle: 1.57, vx: 0, vy: 0 }
```

**In your terminal — verify the compiled output has no interface:**
```bash
cat dist/interfaces.js
```

**Expected:** The interface is completely gone — only the object literal remains. Interfaces are purely compile-time constructs.

**Change something:** Add `ship.health = 100;` to the file and save. Watch mode shows:
```
error TS2339: Property 'health' does not exist on type 'Ship'.
```
Remove it.

---

## Step 3 — The `Bullet` Interface

Add to **`src/interfaces.ts`**:

```ts
// ─── Bullet ───────────────────────────────────────────────────────────────────
interface Bullet {
  x:        number; // current horizontal position
  y:        number; // current vertical position
  vx:       number; // horizontal velocity — fired in the direction the ship faces
  vy:       number; // vertical velocity
  lifetime: number; // frames remaining before removal (counts down to 0)
}

// Create a bullet fired from the ship's position in the ship's facing direction:
function createBullet(fromShip: Ship): Bullet {
  // fromShip: Ship means this function requires an object that satisfies Ship
  return {
    x:        fromShip.x,
    y:        fromShip.y,
    vx:       Math.cos(fromShip.angle) * 8, // 8 = BULLET_SPEED constant
    vy:       Math.sin(fromShip.angle) * 8,
    lifetime: 90, // 90 frames ≈ 1.5 seconds at 60fps
  };
}
// TypeScript checks: does the returned object have all Bullet properties?
// Missing 'lifetime'? ERROR. Extra 'colour'? Fine (extra properties allowed).

const testBullet: Bullet = createBullet(ship);
console.log('Bullet created:', testBullet);
```

### SAVE AND TRY

```bash
npx tsc
node dist/interfaces.js
```

**Expected:** Ship and bullet both logged. No errors.

**In watch mode — test a missing property:**

Temporarily change `createBullet` to return an object WITHOUT `lifetime`:

```ts
return {
  x:  fromShip.x,
  y:  fromShip.y,
  vx: Math.cos(fromShip.angle) * 8,
  vy: Math.sin(fromShip.angle) * 8,
  // lifetime: 90 — deliberately omitted
};
```

**Expected error:**
```
error TS2741: Property 'lifetime' is missing in type '{ x: number; y: number; vx: number; vy: number; }' but required in type 'Bullet'.
```

This is the error you'd get at runtime as a mysterious `undefined` bug — caught here at compile time. Restore `lifetime: 90`.

---

## 🎯 Challenge: The `Asteroid` Interface

**You know:** How to write interfaces with required and optional properties.

**Task:** Write the `Asteroid` interface. An asteroid must have `x`, `y`, `radius`, `vx`, `vy`, and `tier` (a string). Large asteroids additionally have orbit data: `orbitCentreX`, `orbitCentreY`, `orbitAngle`, `orbitSpeed`, and `orbitRadius` — but these are optional (small and medium asteroids don't use them). Small asteroids have a `phase` number for sine-wave motion — also optional.

After writing the interface, create three asteroid objects (one large, one medium, one small) that satisfy it.

**Starting code:**
```ts
interface Asteroid {
  // required properties here...
  // optional properties here (use ?)...
}
```

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
interface Asteroid {
  // Required on all tiers:
  x:      number; // horizontal position
  y:      number; // vertical position
  radius: number; // collision and visual radius in pixels
  vx:     number; // horizontal drift velocity
  vy:     number; // vertical drift velocity
  tier:   string; // 'large', 'medium', or 'small'

  // Optional — only on large asteroids (orbit movement):
  orbitCentreX?: number; // x-coordinate of the orbit centre
  orbitCentreY?: number; // y-coordinate of the orbit centre
  orbitAngle?:   number; // current angle on the orbit circle (radians)
  orbitSpeed?:   number; // radians per frame — rate of orbit rotation
  orbitRadius?:  number; // distance from orbit centre to asteroid

  // Optional — only on small asteroids (sine-wave movement):
  phase?: number; // current phase of the sine wave (radians)
}

// Large asteroid — has orbit data:
const largeAsteroid: Asteroid = {
  x: 300, y: 200, radius: 40,
  vx: 0.5, vy: -0.3,
  tier: 'large',
  orbitCentreX: 300, orbitCentreY: 200,
  orbitAngle: 0, orbitSpeed: 0.01, orbitRadius: 60,
};

// Medium asteroid — only required properties:
const mediumAsteroid: Asteroid = {
  x: 150, y: 400, radius: 22,
  vx: 0.8, vy: 0.6,
  tier: 'medium',
};

// Small asteroid — has phase for sine-wave:
const smallAsteroid: Asteroid = {
  x: 500, y: 300, radius: 12,
  vx: 1.2, vy: -0.9,
  tier: 'small',
  phase: 1.047, // starting phase (π/3 radians)
};

console.log(largeAsteroid.tier, mediumAsteroid.tier, smallAsteroid.tier);
```

**Key insight:** Optional properties let ONE interface describe entities that have varying data. The alternative — a separate interface per tier — would require three `updateAsteroid` functions (one per type), three `drawAsteroid` functions, etc. Optional properties are the right tool when entities share a core shape but differ in supplementary data.

</details>

---

## Step 4 — The `GameConfig` Interface with Readonly

Add to **`src/interfaces.ts`**:

```ts
// ─── GameConfig ───────────────────────────────────────────────────────────────
interface GameConfig {
  readonly maxLives:     number; // set at startup, never changes
  readonly bulletSpeed:  number; // pixels per frame — game balance constant
  readonly asteroidCount: number; // how many asteroids to spawn per wave
           volume:       number;  // player can adjust this at runtime
           sfxEnabled:   boolean; // player can toggle this
}
// readonly: these properties can be set when the object is created
// but TypeScript prevents any later reassignment.
// Non-readonly properties (volume, sfxEnabled) can be changed any time.

const defaultConfig: GameConfig = {
  maxLives:      3,
  bulletSpeed:   8,
  asteroidCount: 5,
  volume:        80,
  sfxEnabled:    true,
};

// Valid — mutable properties can be changed:
defaultConfig.volume    = 60;  // ✓
defaultConfig.sfxEnabled = false; // ✓

// Invalid — readonly properties cannot be changed:
// defaultConfig.maxLives = 5;    // ERROR: Cannot assign to 'maxLives' — read only
// defaultConfig.bulletSpeed = 12; // ERROR: Cannot assign to 'bulletSpeed' — read only

console.log('Config:', defaultConfig);
```

### SAVE AND TRY

```bash
npx tsc
node dist/interfaces.js
```

**Expected:** All objects logged with no errors.

**Test readonly enforcement:**

Add `defaultConfig.maxLives = 5;` and save. **Expected:**
```
error TS2540: Cannot assign to 'maxLives' because it is a read-only property.
```
Remove it.

**Change something:** Change `volume: number` (no `readonly`) to `readonly volume: number`. Save. Now `defaultConfig.volume = 60` produces an error. Change it back.

---

## Step 5 — Structural Typing in Action

TypeScript checks the SHAPE of an object, not what "type" you declared it as. This is called **structural typing**.

Add to **`src/interfaces.ts`**:

```ts
// ─── Structural Typing ────────────────────────────────────────────────────────
// Any object with the right properties satisfies an interface —
// even if you never said "this is a Ship."

function getShipSpeed(s: Ship): number {
  // s must have vx and vy — the full Ship interface
  return Math.sqrt(s.vx * s.vx + s.vy * s.vy);
}

// This object was NEVER declared as Ship — but it satisfies Ship's shape:
const shipLike = { x: 100, y: 200, angle: 0.5, vx: 3, vy: 4 };
const speed = getShipSpeed(shipLike); // ✓ — shape matches Ship, accepted
console.log('Speed:', speed); // 5 — Pythagorean theorem

// This object is missing 'angle' — does NOT satisfy Ship:
const incompleteShip = { x: 100, y: 200, vx: 3, vy: 4 };
// getShipSpeed(incompleteShip); // ERROR: missing 'angle'

// This object has EXTRA properties — still satisfies Ship:
const enhancedShip = { x: 100, y: 200, angle: 0, vx: 0, vy: 0, health: 100 };
getShipSpeed(enhancedShip); // ✓ — extra properties are fine
```

### SAVE AND TRY

```bash
npx tsc
node dist/interfaces.js
```

**Expected:** Speed output of `5`.

**Key observation:** You never wrote `shipLike: Ship`. TypeScript looked at the shape — five properties, all numbers — and concluded it satisfies `Ship`. This is structural typing: compatibility based on shape, not declaration.

**Change something:** Remove `angle: 0.5` from `shipLike`. **Expected:**
```
error TS2345: Argument of type '{ x: number; y: number; vx: number; vy: number; }' is not assignable to parameter of type 'Ship'. Property 'angle' is missing.
```

---

## 🎯 Challenge: Interface for the Tier Table

**You know:** Interfaces, optional properties, readonly, and structural typing.

**Task:** Write a `TierData` interface that describes one row of the `ASTEROID_TIERS` table from LAB 05. Then write a `TierTable` interface that describes the full table (an object with three keys: `large`, `medium`, `small` — each holding `TierData`). Make all `TierData` properties readonly. Create the actual tier table and confirm TypeScript accepts it.

**Reference from LAB 05:**
```js
const ASTEROID_TIERS = {
  large:  { radius: 40, childTier: 'medium', childCount: 2, speed: 0.8 },
  medium: { radius: 22, childTier: 'small',  childCount: 2, speed: 1.4 },
  small:  { radius: 12, childTier: null,      childCount: 0, speed: 2.0 },
};
```

**Hint:** `childTier` can be a string OR null — remember how to annotate that.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
interface TierData {
  readonly radius:     number;       // asteroid visual and collision radius
  readonly childTier:  string | null; // tier of children when split (null = no children)
  readonly childCount: number;        // how many children to spawn
  readonly speed:      number;        // drift speed in pixels per frame
}

interface TierTable {
  readonly large:  TierData;
  readonly medium: TierData;
  readonly small:  TierData;
}

const ASTEROID_TIERS: TierTable = {
  large:  { radius: 40, childTier: 'medium', childCount: 2, speed: 0.8 },
  medium: { radius: 22, childTier: 'small',  childCount: 2, speed: 1.4 },
  small:  { radius: 12, childTier: null,      childCount: 0, speed: 2.0 },
};

// TypeScript now catches:
// ASTEROID_TIERS.large.radius = 50;    // ERROR: read-only
// ASTEROID_TIERS.huge = { ... };       // ERROR: 'huge' not in TierTable
// ASTEROID_TIERS.medium.childTier = 42; // ERROR: number not assignable to string | null

// Valid use:
const largeRadius = ASTEROID_TIERS.large.radius; // ✓ — number
console.log('Large radius:', largeRadius); // 40
```

**Key insight:** Nested interfaces (`TierTable` containing `TierData` properties) are how TypeScript describes nested objects. TypeScript checks the entire structure recursively — not just the top level. The `readonly` on `TierTable`'s properties prevents replacing an entire tier (`ASTEROID_TIERS.large = ...`), while `readonly` on `TierData`'s properties prevents changing individual values within a tier.

</details>

---

## Concept: Interface Evolution

**In LAB 10** you defined the shape of game entities for the first time.

**In LAB 11** (arrays and generics) these interfaces will appear as `Array<Ship>`, `Array<Bullet>`, `Array<Asteroid>` — typed entity lists.

**In LAB 12** (functions) they'll appear as parameter and return types: `function updateShip(ship: Ship): void`.

**In LAB 13** (union types) `tier: string` will become `tier: 'large' | 'medium' | 'small'` — a much more precise and useful type.

**The progression:** Interfaces start simple and become more precise as you learn more TypeScript features. This is intentional — you can always improve a type later. Starting with `tier: string` is better than starting with `tier: any`.

---

## Final Check

| Feature | How to verify |
|---|---|
| `Ship` interface compiles | `const ship: Ship = { x, y, angle, vx, vy }` → no error |
| Missing property caught | Remove one property from ship object → error naming the missing one |
| Wrong type caught | `ship.x = "left"` → error: string not assignable to number |
| Extra property accepted | Add `health: 100` to ship object when not passing to a function → accepted |
| `Bullet` creation function typed | `createBullet(ship)` returns `Bullet` with no errors |
| Optional properties work | `Asteroid` with no orbit data → no error |
| Accessing optional → `T \| undefined` | `asteroid.orbitRadius.toFixed(2)` → error: possibly undefined |
| `readonly` prevents reassignment | `config.maxLives = 5` → error: read-only |
| Structural typing demonstrated | Object without `Ship` declaration passes to `getShipSpeed` → accepted |
| Interfaces disappear at runtime | `cat dist/interfaces.js` → no `interface` keyword visible |

---

## What's Next

In **LAB 11** you'll meet **generics** — TypeScript's way of writing one function or type that works for many different types. The most important generic you'll use is `Array<T>`: a typed array where `T` is the element type. `Array<Bullet>` only holds bullets. `Array<Asteroid>` only holds asteroids. You'll replace all the `any[]` arrays from the Asteroids game with properly typed versions — and discover that TypeScript can now catch bugs like pushing a `Ship` into the `bullets` array.

---

## Quick Check Answers

**1. What would TypeScript infer as the type of `const ship = { x: 0, y: 0, angle: 0, vx: 0, vy: 0 }`?**

TypeScript infers the type `{ x: number; y: number; angle: number; vx: number; vy: number }` — it reads the initial values and infers a type for each property. This is essentially an anonymous interface. The inferred type is structurally compatible with the `Ship` interface you wrote — in fact, you could pass this `ship` object to any function that expects `Ship`, because its shape matches. The practical reason to write an explicit interface anyway: to give the type a name you can reuse, and to document your intent clearly.

**2. What happens if you access `ship.health` — a property that doesn't exist?**

In plain JavaScript: you get `undefined` at runtime, with no error or warning. The bug might not surface until `ship.health + 1` produces `NaN`, which then corrupts a display or gameplay calculation — possibly far from the original mistake. In TypeScript with the `Ship` interface: `error TS2339: Property 'health' does not exist on type 'Ship'` — caught immediately at compile time, with the exact line number.

**3. If two functions both accept a "thing with x and y properties," do you have to write the type description twice?**

No — that's exactly what interfaces solve. You write `interface Position { x: number; y: number }` once, then both functions accept `Position`. If the shape changes (say, adding a `z` property), you update the interface once and TypeScript immediately flags every function call that doesn't provide `z`. Without an interface, you'd have to find and update every function signature individually — and TypeScript can't help you find them all.

---

*End of LAB 10. Next: [[LAB-11-Arrays-and-Generics]]*
