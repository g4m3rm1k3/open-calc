# TypeScript — LAB 12 — Functions

**Prerequisites:** LAB 11 (Arrays & Generics). You know: typed arrays, `Array<T>`, generic functions, `<T extends Something>`, `ReadonlyArray`.

**What this lab adds:**
- Parameter type annotations on every function
- Return type annotations — including `void` for functions that return nothing
- Optional parameters with `?` and default values with `=`
- Function types as values — `(bullet: Bullet) => void`
- Typing the Observer pattern callbacks from LAB 07

**Time:** 60–75 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In LAB 07, the Observer pattern stored callbacks in an array: `subscribers: {}`. What type would you give to an array of callbacks that each receive an `Asteroid` and return nothing?
> 2. A function `drawShip` draws the ship and returns nothing. What return type annotation should it have?
> 3. In `fireBullet(fromShip, speedOverride)`, the `speedOverride` parameter is optional — most callers don't pass it. How would you annotate that?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Fully typed versions of five core Asteroids functions — each with parameter types, return types, and correct optional parameters:

```ts
function updateBullet(bullet: Bullet): void { ... }
function createBullet(fromShip: Ship, speedOverride?: number): Bullet { ... }
function circlesOverlap(ax: number, ay: number, ar: number,
                        bx: number, by: number, br: number): boolean { ... }
function removeExpiredBullets(bullets: Bullet[]): Bullet[] { ... }

// And a fully typed Observer event emitter:
type AsteroidCallback = (asteroid: Asteroid) => void;
const listeners: AsteroidCallback[] = [];
```

---

## Concept: Function Parameter Types

**What it is:** Type annotations on each function parameter, placed after the parameter name with `: type`. TypeScript checks that callers pass the correct types.

**The problem before:**
```ts
// No parameter types — any value accepted:
function moveShip(ship, dx, dy) {
  ship.x += dx; // what if dx is a string? Bug at runtime, no warning here
  ship.y += dy;
}

moveShip(ship, "fast", null); // no TypeScript error — crashes at runtime
```

**The solution:**
```ts
function moveShip(ship: Ship, dx: number, dy: number): void {
  ship.x += dx; // ✓ — TypeScript knows dx is number
  ship.y += dy; // ✓
}

moveShip(ship, "fast", null); // ERROR: string not assignable to number
moveShip(ship, 3);            // ERROR: expected 3 arguments, got 2
```

**What it hides:**
Parameter type annotations hide the need for manual argument validation inside functions. The invariant: **every call to a typed function passes the correct number of arguments at the correct types** — TypeScript checks this at every call site, not just inside the function.

**Canonical example:**
```ts
function add(a: number, b: number): number {
  return a + b;
}

add(2, 3);         // ✓ — returns 5, type: number
add("2", "3");     // ERROR: strings not assignable to number
add(2);            // ERROR: expected 2 arguments, got 1
add(2, 3, 4);      // ERROR: expected 2 arguments, got 3
```

**Project Application:** Every function in `main.ts` that takes game entities needs typed parameters. `updateBullet(bullet: Bullet)`, `drawAsteroid(asteroid: Asteroid, ctx: CanvasRenderingContext2D)`, `checkCollision(ship: Ship, asteroid: Asteroid)` — TypeScript catches every wrong-type call.

**Watch for:** TypeScript checks the number of arguments too — not just their types. Missing required arguments and extra unexpected arguments are both errors. This is stricter than JavaScript, which silently ignores extra arguments and sets missing ones to `undefined`.

---

## Concept: Return Type Annotations

**What it is:** A type annotation after the closing `)` of a function signature, stating what type the function returns.

**The syntax:**
```ts
function functionName(param: Type): ReturnType {
//                               ^^^^^^^^^^^^
//                              the return type
```

**The four common return types:**

| Return type | Meaning | When to use |
|---|---|---|
| `: number` | Returns a number | `function getSpeed(): number` |
| `: Bullet` | Returns a Bullet object | `function createBullet(): Bullet` |
| `: boolean` | Returns true or false | `function isExpired(): boolean` |
| `: void` | Returns nothing | `function drawShip(): void` |

**What `void` means:**
`void` is the return type for functions that don't return a value — they do their work as a side effect (drawing, updating state, logging). Calling them for their return value makes no sense.

```ts
function drawShip(ship: Ship): void {
  ctx.save();
  // ... draw the ship ...
  ctx.restore();
  // no 'return' statement — returns undefined implicitly
}

const result = drawShip(ship); // result has type 'void' — meaningless to use
```

**Why annotate return types explicitly?**

Two reasons:
1. **Documentation:** the return type tells callers what they get back, without reading the function body
2. **Correctness check:** if your implementation accidentally returns the wrong type, TypeScript catches it

```ts
// Without annotation — TypeScript infers the return type:
function getRadius(asteroid: Asteroid) {
  return asteroid.radius; // TypeScript infers: returns number
}
// Fine if you trust yourself. Not fine if the function is complex.

// With annotation — TypeScript verifies your implementation:
function getRadius(asteroid: Asteroid): number {
  return asteroid.tier; // ERROR: string not assignable to number
  // You meant asteroid.radius — annotation caught the typo
}
```

**What it hides:**
Return type annotations hide the need to read an entire function body to know what it produces. The invariant: **a function annotated `: T` will always return a value satisfying `T`** — TypeScript checks every `return` statement in the function body.

**Watch for:** A function annotated `: number` that has a code path that doesn't return anything (returns `undefined` implicitly) is a TypeScript error — "not all code paths return a value." This catches bugs where you forget a `return` in an `if` branch.

---

## Step 1 — Type the Core Update Functions

Add **`src/functions.ts`** to your project:

```ts
// LAB 12 — Functions
// Copy interfaces from earlier labs — in LAB 14 we'll use proper imports

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

Now add the typed update functions:

```ts
// ─── Update functions with full parameter and return type annotations ─────────

function updateBullet(bullet: Bullet): void {
  // bullet: Bullet — TypeScript checks the caller passes a Bullet
  // : void — this function modifies bullet in place and returns nothing
  bullet.x        += bullet.vx; // move horizontally
  bullet.y        += bullet.vy; // move vertically
  bullet.lifetime -= 1;          // count down to removal
}

function isExpired(bullet: Bullet): boolean {
  // : boolean — returns true if the bullet should be removed, false otherwise
  return bullet.lifetime <= 0
    || bullet.x < 0
    || bullet.x > 1920  // placeholder — real code uses canvas.width
    || bullet.y < 0
    || bullet.y > 1080; // placeholder — real code uses canvas.height
}

function updateAsteroid(asteroid: Asteroid): void {
  // void return — modifies in place
  asteroid.x += asteroid.vx;
  asteroid.y += asteroid.vy;
}

// Test:
const testBullet: Bullet = { x: 100, y: 200, vx: 5, vy: 0, lifetime: 90 };
updateBullet(testBullet);
console.log('After update — x:', testBullet.x, 'lifetime:', testBullet.lifetime);
// Expected: x: 105, lifetime: 89

console.log('Is expired:', isExpired(testBullet));
// Expected: false — lifetime 89 > 0, position within bounds
```

### SAVE AND TRY

```bash
npx tsc
node dist/functions.js
```

**Expected:**
```
After update — x: 105 lifetime: 89
Is expired: false
```

**Change something:** Change the return type of `isExpired` from `: boolean` to `: number`. **Expected:**
```
error TS2322: Type 'boolean' is not assignable to type 'number'.
```
Change it back.

---

## Step 2 — Optional Parameters and Default Values

### Concept: Optional Parameters (`?`) and Default Values

**What it is:** Parameters that callers can omit. An optional parameter is annotated with `?` and has type `T | undefined`. A default value parameter uses `= value` and automatically uses the default when the caller omits it.

**The problem before:**
```ts
// Every call must pass speedOverride — even when using the default speed:
function fireBullet(fromShip: Ship, speedOverride: number): Bullet {
  // ...
}
fireBullet(ship, 8);  // must always pass 8 — caller must know the default
```

**The solution — two approaches:**

**Optional parameter** — caller can omit, function receives `undefined`:
```ts
function fireBullet(fromShip: Ship, speedOverride?: number): Bullet {
  //                                              ^
  //                                    ? = can be omitted
  const speed = speedOverride ?? 8; // use override if provided, else 8
  // speedOverride is: number | undefined — MUST handle undefined case
}

fireBullet(ship);     // ✓ — speedOverride is undefined, ?? gives 8
fireBullet(ship, 12); // ✓ — speedOverride is 12
```

**Default value** — caller can omit, function automatically uses the default:
```ts
function fireBullet(fromShip: Ship, speed: number = 8): Bullet {
  //                                              ^^^
  //                                    default value
  // speed is always a number — either what the caller passed, or 8
  // No need to handle undefined — TypeScript/JS fills in the default
}

fireBullet(ship);     // ✓ — speed is automatically 8
fireBullet(ship, 12); // ✓ — speed is 12
```

**When to use each:**
- Use `?` (optional) when you want to KNOW if the caller provided the argument (check `=== undefined`)
- Use `= default` when you just want a fallback and don't care if the caller provided it

**What it hides:**
Default values hide the `?? default` pattern that would otherwise be at the top of every function body. The invariant: **inside a function with `param = default`, the parameter is always the specified type — never `undefined`** — you never need to null-check it.

**Watch for:** Optional parameters must come AFTER required parameters. `function f(a?: number, b: string)` is an error — required `b` comes after optional `a`. TypeScript enforces this because otherwise callers can't know which argument they're providing.

---

Add to **`src/functions.ts`**:

```ts
// ─── Optional parameters and default values ───────────────────────────────────

// Version 1 — optional parameter with ?? fallback:
function createBulletOptional(fromShip: Ship, speedOverride?: number): Bullet {
  // speedOverride is number | undefined — handle both cases
  const speed = speedOverride ?? 8;
  // ?? 8: if speedOverride is undefined (caller omitted it), use 8
  return {
    x:        fromShip.x,
    y:        fromShip.y,
    vx:       Math.cos(fromShip.angle) * speed,
    vy:       Math.sin(fromShip.angle) * speed,
    lifetime: 90,
  };
}

// Version 2 — default value parameter (cleaner — recommended):
function createBullet(fromShip: Ship, speed: number = 8): Bullet {
  // speed is always a number — either passed by caller or the default 8
  // No undefined check needed — TypeScript/runtime fills in 8 automatically
  return {
    x:        fromShip.x,
    y:        fromShip.y,
    vx:       Math.cos(fromShip.angle) * speed,
    vy:       Math.sin(fromShip.angle) * speed,
    lifetime: 90,
  };
}

// Test both:
const testShip: Ship = { x: 400, y: 300, angle: 0, vx: 0, vy: 0 };

const normalBullet = createBullet(testShip);         // uses default speed = 8
const fastBullet   = createBullet(testShip, 16);     // overrides to speed = 16

console.log('Normal bullet vx:', normalBullet.vx.toFixed(2)); // 8.00 (cos(0)*8)
console.log('Fast bullet vx:',   fastBullet.vx.toFixed(2));   // 16.00
```

### SAVE AND TRY

```bash
npx tsc
node dist/functions.js
```

**Expected:**
```
Normal bullet vx: 8.00
Fast bullet vx: 16.00
```

**Change something:** Call `createBullet(testShip, "fast")`. **Expected:**
```
error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
```
Remove it.

---

## 🎯 Challenge: Type `circlesOverlap`

**You know:** Parameter types, return types, and all the primitive types.

**Task:** Write a fully typed version of `circlesOverlap` from LAB 04. Six number parameters (two circles, each with x, y, radius). Returns boolean. Then call it with two test circles and verify the return type.

Also write an overloaded-style version that accepts two objects (`a: { x: number; y: number; radius: number }`, `b: { x: number; y: number; radius: number }`) instead of six separate numbers. Which version is easier to use at the call site?

**Starting code:**
```ts
// Version 1 — six separate parameters:
function circlesOverlap(
  ax: number, ay: number, ar: number,
  bx: number, by: number, br: number
): ??? {
  // return true if the circles overlap
}

// Version 2 — two objects:
interface Circle {
  x: number; y: number; radius: number;
}
function circlesOverlapObj(a: ???, b: ???): ??? {
  // same logic, different signature
}
```

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// Version 1 — six separate parameters:
function circlesOverlap(
  ax: number, ay: number, ar: number,
  bx: number, by: number, br: number
): boolean {
  const dx = bx - ax;
  const dy = by - ay;
  const distSquared = dx * dx + dy * dy;
  const radiiSum    = ar + br;
  return distSquared < radiiSum * radiiSum;
}

// Version 2 — two Circle objects:
interface Circle {
  x:      number;
  y:      number;
  radius: number;
}

function circlesOverlapObj(a: Circle, b: Circle): boolean {
  return circlesOverlap(a.x, a.y, a.radius, b.x, b.y, b.radius);
  // delegates to Version 1 — no logic duplication
}

// Test both:
const hit   = circlesOverlap(0, 0, 10, 5, 0, 10); // distance=5, radii sum=20: true
const miss  = circlesOverlap(0, 0, 5,  20, 0, 5);  // distance=20, radii sum=10: false
console.log('Hit:', hit);   // true
console.log('Miss:', miss); // false

const circA: Circle = { x: 0,  y: 0, radius: 10 };
const circB: Circle = { x: 5,  y: 0, radius: 10 };
console.log('Object version hit:', circlesOverlapObj(circA, circB)); // true
```

**Key insight:** Version 2 is easier at the call site because you can pass your `Asteroid` and `Ship` objects directly (both satisfy `Circle` structurally — they both have `x`, `y`, and `radius`). Version 1 requires extracting six values. In a real codebase, both exist: Version 1 is the core implementation, Version 2 is a convenience wrapper. This is a common pattern — a low-level precise function and a high-level ergonomic wrapper around it.

</details>

---

## Concept: Function Types as Values

**What it is:** In TypeScript, functions are values — they can be stored in variables, passed as arguments, and returned from other functions. The type of a function value describes its parameters and return type.

**The syntax:**
```ts
(paramName: ParamType, ...) => ReturnType
```

**Examples:**
```ts
// A function that takes a number and returns a number:
type NumberTransform = (value: number) => number;

// A function that takes a Bullet and returns nothing:
type BulletCallback = (bullet: Bullet) => void;

// A function that takes two Bullets and returns boolean:
type BulletComparator = (a: Bullet, b: Bullet) => boolean;
```

**Assigning functions to typed variables:**
```ts
type NumberTransform = (value: number) => number;

const double: NumberTransform = (n) => n * 2;
// TypeScript infers the parameter 'n' is number (from the type annotation)
// TypeScript checks: does this function match NumberTransform? Yes.

const stringify: NumberTransform = (n) => n.toString();
// ERROR: string not assignable to number (return type mismatch)
```

**What it hides:**
Function types hide the specific implementation of a callback, requiring only that the shape (parameters and return type) matches. The invariant: **any function stored as `BulletCallback` accepts exactly one `Bullet` argument and returns `void`** — callers can invoke it without knowing the implementation.

**Canonical example:**
```ts
// Array.filter takes a predicate — a function that returns boolean:
// filter<T>(predicate: (value: T) => boolean): T[]

const numbers = [1, 2, 3, 4, 5];
const evens = numbers.filter((n) => n % 2 === 0);
// The arrow function (n) => n % 2 === 0 satisfies (value: number) => boolean
// TypeScript infers this automatically
```

**Project Application:** The Observer pattern from LAB 07 stores callbacks in arrays. These arrays can now be properly typed — instead of `any[]`, we use `((asteroid: Asteroid) => void)[]`.

**Why it matters here:** Once you type callbacks, TypeScript checks that every subscriber in the Observer pattern receives the correct event data — preventing the bug where an asteroid callback accidentally receives a ship object.

**Watch for:** Arrow functions `(x) => ...` and regular functions `function(x) { ... }` both satisfy function types. You can mix them freely — TypeScript only checks the shape.

---

## Step 3 — Type the Observer Callbacks

Add to **`src/functions.ts`**:

```ts
// ─── Function types and the Observer pattern ─────────────────────────────────

// Define named function types for our event callbacks:
type AsteroidHitCallback = (asteroid: Asteroid) => void;
// A function that receives an asteroid and returns nothing.
// This is the type of every subscriber to the 'asteroidHit' event.

type ShipHitCallback = () => void;
// The ship hit event carries no data — callbacks take no parameters.

// Typed event emitter (simplified version of LAB 07's Observer):
interface EventEmitter {
  asteroidHitSubscribers: AsteroidHitCallback[];
  // Array of functions — each is: (asteroid: Asteroid) => void

  shipHitSubscribers: ShipHitCallback[];
  // Array of functions — each is: () => void
}

const emitter: EventEmitter = {
  asteroidHitSubscribers: [],
  shipHitSubscribers:     [],
};

// Register a subscriber — TypeScript checks the callback matches the type:
emitter.asteroidHitSubscribers.push((asteroid: Asteroid) => {
  console.log('Asteroid hit:', asteroid.tier, 'at', asteroid.x, asteroid.y);
});
// ✓ — the arrow function matches AsteroidHitCallback: (Asteroid) => void

emitter.asteroidHitSubscribers.push((asteroid: Asteroid) => {
  // score += SCORE_TABLE[asteroid.tier]; // would update score in real game
  console.log('Score updated for', asteroid.tier);
});

// Emit the event — call all subscribers with the asteroid data:
function emitAsteroidHit(asteroid: Asteroid): void {
  for (const callback of emitter.asteroidHitSubscribers) {
    callback(asteroid); // TypeScript knows callback is (Asteroid) => void
    // ✓ — calling with an Asteroid matches the parameter type
  }
}

// Test:
const hitAsteroid: Asteroid = {
  x: 300, y: 200, radius: 40, vx: 0.5, vy: -0.3, tier: 'large',
};
emitAsteroidHit(hitAsteroid);
```

### SAVE AND TRY

```bash
npx tsc
node dist/functions.js
```

**Expected:**
```
Asteroid hit: large at 300 200
Score updated for large
```

**In watch mode — test wrong callback type:**

```ts
emitter.asteroidHitSubscribers.push((ship: Ship) => {
  console.log(ship.angle);
}); // ← wrong parameter type
```

**Expected error:**
```
error TS2345: Argument of type '(ship: Ship) => void' is not assignable to parameter of type 'AsteroidHitCallback'.
  Types of parameters 'ship' and 'asteroid' are incompatible.
```
TypeScript caught the wrong parameter type on a callback — a bug that would only surface at runtime without types. Remove it.

---

## 🎯 Challenge: Fully Type the Generic `events` Object from LAB 07

**You know:** Function types, generic types, arrays of callbacks, interfaces.

**Task:** Write a generic `EventEmitter<T>` interface where `T` is the event data type. It should have two methods: `on(callback: (data: T) => void): void` and `emit(data: T): void`. Then create two emitter instances: one for asteroid hits (`EventEmitter<Asteroid>`) and one for ship hits (`EventEmitter<void>`).

**Hint for `void` event data:** When the event carries no data, `T = void`. An emitter of type `EventEmitter<void>` has `emit()` that takes no arguments and `on(callback: () => void)` that takes a no-argument callback.

**Starting code:**
```ts
interface EventEmitter<T> {
  on(callback: ???): void;
  emit(data: ???): void;
}
```

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
interface EventEmitter<T> {
  on(callback: (data: T) => void): void;
  // on takes a callback that receives T and returns void
  // When called, registers the callback as a subscriber

  emit(data: T): void;
  // emit takes event data of type T and calls all registered callbacks
}

// Implementation using a class-free approach (plain object with closure):
function createEmitter<T>(): EventEmitter<T> {
  const subscribers: ((data: T) => void)[] = [];
  // Array of callbacks — each matches (data: T) => void

  return {
    on(callback: (data: T) => void): void {
      subscribers.push(callback);
    },
    emit(data: T): void {
      for (const callback of subscribers) {
        callback(data);
      }
    },
  };
}

// Create typed emitters:
const asteroidHitEmitter = createEmitter<Asteroid>();
// T is Asteroid — on() and emit() both work with Asteroid

const shipHitEmitter = createEmitter<void>();
// T is void — on() takes () => void, emit() takes no data argument

// Use them:
asteroidHitEmitter.on((asteroid) => {
  // TypeScript infers: asteroid is Asteroid
  console.log('Hit asteroid:', asteroid.tier);
});

asteroidHitEmitter.emit({ x: 100, y: 200, radius: 40, vx: 0, vy: 0, tier: 'medium' });
// Expected: Hit asteroid: medium

shipHitEmitter.on(() => {
  console.log('Ship was hit!');
});
shipHitEmitter.emit(undefined as void);
// void emit — no data to pass (TypeScript allows undefined for void)
```

**Key insight:** `createEmitter<T>()` is a generic factory function — it returns a new, independent emitter whose type is fixed at creation time. `createEmitter<Asteroid>()` returns an emitter that only works with asteroids; `createEmitter<Ship>()` returns one that only works with ships. The generic parameter `T` flows through the entire emitter — `on`, `emit`, and the internal `subscribers` array are all correctly typed with one type parameter. This is generics working at a system level, not just a utility function level.

</details>

---

## Concept: `void` vs `undefined`

**What it is:** Two similar but distinct types. `void` is a function return type meaning "I return nothing." `undefined` is a value meaning "this exists but has no value."

**The key distinction:**
```ts
// A function returning void:
function draw(): void {
  ctx.fillRect(0, 0, 100, 100);
  // No return statement — returns undefined implicitly
}

// A function returning undefined:
function find(): undefined {
  return undefined; // explicit — must say 'return undefined'
}

// The practical difference:
const a = draw();   // a has type void    — meaningless, don't use it
const b = find();   // b has type undefined — you could check b === undefined
```

**When to use each:**
- `void` — functions called for their SIDE EFFECTS (drawing, updating state, logging)
- `undefined` — functions that explicitly return "nothing found" as a meaningful result

**In callbacks:**
```ts
// Array.forEach expects callbacks that return void:
// forEach(callback: (value: T) => void): void
bullets.forEach((bullet) => {
  bullet.lifetime -= 1;
  // Implicit return undefined — satisfies 'void' return type ✓
});

// A callback that accidentally returns a value:
bullets.forEach((bullet) => {
  return bullet.lifetime > 0; // returning boolean from a void callback
  // TypeScript: this is actually FINE — void callbacks ignore return values
  // But logically incorrect — use filter() if you need the return value
});
```

**Why it matters here:** `void` is the correct return type for every draw function, every update function, and every Observer callback in the Asteroids game. `undefined` is for "not found" cases in search functions.

**Watch for:** A function annotated `: void` CAN return a value — TypeScript doesn't error. `void` means "callers should not use the return value," not "the function must not have a return statement." This allows void callbacks to work with functions that might return values.

---

## Final Check

| Feature | How to verify |
|---|---|
| Parameter types work | `updateBullet("hello")` → error: string not assignable to Bullet |
| Return type `: void` | `const x = updateBullet(b)` → `x` has type `void` |
| Return type `: boolean` | `const b = isExpired(bullet)` → hover shows `boolean` |
| Wrong return type caught | Annotate `: number`, return string → error |
| Optional parameter works | `createBullet(ship)` (no speed) → uses default 8 |
| Default value works | `createBullet(ship, 16)` → uses 16 |
| Function type as variable | `const cb: (a: Asteroid) => void = (a) => { ... }` → no error |
| Wrong callback type caught | Push `(ship: Ship) => void` into `AsteroidCallback[]` → error |
| Generic emitter typed | `emitter.on()` only accepts callbacks matching `T` |
| Observer pattern typed end-to-end | Full `EventEmitter<Asteroid>` — push, emit, receive all typed |

---

## What's Next

In **LAB 13** you'll meet the two most powerful TypeScript features for game code: **union types** (`'playing' | 'paused' | 'gameOver'`) and **type guards** (narrowing a union to one specific type). The FSM `gameState` variable from LAB 06 becomes fully type-safe — TypeScript will prevent invalid state strings and ensure you handle all cases in every `switch` statement.

---

## Quick Check Answers

**1. What type would you give to an array of callbacks that each receive an `Asteroid` and return nothing?**

`((asteroid: Asteroid) => void)[]` — or more readably, define a type alias first: `type AsteroidCallback = (asteroid: Asteroid) => void`, then `AsteroidCallback[]`. Both mean the same thing. The outer `[]` means "array of", and `(asteroid: Asteroid) => void` is the function type for each element. In the Observer pattern, this is the type of the `subscribers` list for any event that carries asteroid data.

**2. What return type annotation should `drawShip` have?**

`: void` — it draws the ship as a side effect and returns nothing meaningful. Using `: void` signals to callers that they should not capture or use the return value of `drawShip`. It also tells TypeScript to flag any code that tries to use the result: `const result = drawShip(ship); result.x` would be an error because `void` has no properties.

**3. How would you annotate the optional `speedOverride` parameter in `fireBullet`?**

Either `speedOverride?: number` (optional, TypeScript adds `| undefined` automatically) or `speedOverride: number = 8` (default value). The `?` approach requires you to handle `undefined` inside the function body (using `?? 8` to provide a fallback). The `= 8` approach is cleaner — TypeScript fills in the default and the parameter is always `number` inside the function. For simple defaults, prefer `= defaultValue`. Use `?` when you need to distinguish "caller passed undefined explicitly" from "caller omitted the argument."

---

*End of LAB 12. Next: [[LAB-13-Union-Types-and-Type-Guards]]*
