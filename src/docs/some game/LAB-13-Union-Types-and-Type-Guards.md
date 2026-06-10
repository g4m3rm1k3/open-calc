# TypeScript — LAB 13 — Union Types & Type Guards

**Prerequisites:** LAB 12 (Functions). You know: parameter types, return types, `void`, optional parameters, function types as values, generic event emitters.

**What this lab adds:**
- Union types: `'playing' | 'paused' | 'gameOver'` — values that can be one of several specific options
- Literal types — the difference between `string` and `'large'`
- Type guards — narrowing a union to one specific type with `if`, `typeof`, `in`, and `switch`
- Exhaustiveness checking — TypeScript telling you when a `switch` misses a case
- A fully type-safe `gameState` and `asteroid.tier`

**Time:** 60–75 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In LAB 06, `gameState` was typed as `string`. What's the problem with that? What invalid values does `string` allow?
> 2. A function receives a value that is either a `number` or a `string`. How would you write code that handles each case differently?
> 3. The `switch` statement in `update()` has four cases. What happens if you add a fifth game state but forget to add a case for it?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A fully type-safe game state system — where TypeScript prevents invalid states at every level:

```ts
type GameState = 'title' | 'playing' | 'paused' | 'gameOver';
type AsteroidTier = 'large' | 'medium' | 'small';

let gameState: GameState = 'title';
gameState = 'manu';     // ERROR: '"manu"' is not assignable to type 'GameState'
gameState = 'playing';  // ✓

// TypeScript forces you to handle ALL cases:
switch (gameState) {
  case 'title':    break;
  case 'playing':  break;
  case 'paused':   break;
  // Forgot 'gameOver'?
  // TypeScript: error — 'gameOver' is not handled
}
```

---

## Concept: Union Types

**What it is:** A type that can be one of several specific values or types, written with `|` (the pipe character, meaning "or"). The value must satisfy exactly one of the listed options.

**The problem before:**
```ts
// gameState typed as string — too broad:
let gameState: string = 'title';
gameState = 'playing';     // ✓
gameState = 'manu';        // ✓ — typo! TypeScript can't catch this
gameState = 'GAME OVER';   // ✓ — wrong casing
gameState = '';            // ✓ — empty string makes no sense
gameState = 'asdfjkl;';   // ✓ — nonsense, no error
// TypeScript knows nothing about which strings are valid.
```

**The solution — literal union type:**
```ts
type GameState = 'title' | 'playing' | 'paused' | 'gameOver';
// This type has EXACTLY FOUR valid values — nothing else.

let gameState: GameState = 'title';
gameState = 'playing';  // ✓ — in the union
gameState = 'manu';     // ERROR: '"manu"' is not assignable to type 'GameState'
gameState = '';         // ERROR: not in the union
```

**What it hides:**
A union type hides the need for manual validation (checking if a string is one of the allowed values at runtime). The invariant: **a variable of union type `'a' | 'b' | 'c'` can only hold one of exactly those three values** — TypeScript enforces this at every assignment.

**Canonical example (General Explanation):**

A traffic light has exactly three states: Red, Yellow, Green. You'd never say a traffic light can be in "any string state" — that would include "purple" and "flashing" and "broken." A union type is TypeScript's way of encoding "exactly these options and nothing else."

```ts
type TrafficLight = 'red' | 'yellow' | 'green';

let light: TrafficLight = 'red';
light = 'green';   // ✓
light = 'purple';  // ERROR: '"purple"' is not assignable to type 'TrafficLight'
light = 'Red';     // ERROR: capitalisation counts — 'Red' ≠ 'red'
```

**Union types with different value types:**
```ts
// A union can mix types:
type IdOrName = number | string;
// This value can be either a numeric ID or a name string.

let playerId: IdOrName = 42;
playerId = 'Player_1'; // ✓
playerId = true;       // ERROR: boolean not in the union

// More complex — a value that could be a Bullet, Asteroid, or Ship:
type GameEntity = Bullet | Asteroid | Ship;
```

**Project Application (The "Why" here):**
`gameState`, `asteroid.tier`, and `childTier` all have a fixed set of valid values. Union types make those constraints explicit and enforced — no more misspelled game states reaching the `switch` statement.

**Why it matters here:** Union types are the foundation of type-safe state machines, the `tier` system, and event discrimination. They're used throughout professional TypeScript code.

**Watch for:** String literal union types are case-sensitive. `'GameOver'` and `'gameOver'` are different types. Consistency in naming (all camelCase, all lowercase, etc.) prevents hard-to-find bugs.

---

## Concept: Type Aliases (`type`)

**What it is:** A name you give to any type — primitive, union, object, function — so you can reference it by that name instead of repeating the full type expression.

**The syntax:**
```ts
type AliasName = TypeExpression;
```

**The problem before:**
```ts
// Using the union inline everywhere:
function setGameState(state: 'title' | 'playing' | 'paused' | 'gameOver'): void { ... }
function isValidState(state: 'title' | 'playing' | 'paused' | 'gameOver'): boolean { ... }
// Adding 'levelSelect' to the union: must update every function signature manually
```

**The solution:**
```ts
type GameState = 'title' | 'playing' | 'paused' | 'gameOver';

function setGameState(state: GameState): void { ... }
function isValidState(state: GameState): boolean { ... }
// Adding 'levelSelect': update ONE type alias — all functions update automatically
```

**Interface vs type alias — when to use each:**

| `interface` | `type` |
|---|---|
| Object shapes (preferred) | Unions, primitives, function types |
| Can be extended with `extends` | Cannot be extended (can be intersected with `&`) |
| Error messages use the interface name | Error messages show the full type |
| Best for: entity shapes | Best for: unions, aliases, function types |

**For game code rule of thumb:** Use `interface` for objects (`Ship`, `Bullet`, `Asteroid`). Use `type` for unions (`GameState`, `AsteroidTier`) and function types (`AsteroidCallback`).

**Smallest possible example:**
```ts
type Tier = 'large' | 'medium' | 'small';
type Score = number; // aliasing a primitive — gives it a meaningful name

let asteroidTier: Tier  = 'large';
let playerScore:  Score = 0;

asteroidTier = 'tiny'; // ERROR: not in Tier union
```

---

## Step 1 — Define the Game's Union Types

Add **`src/unions.ts`** to your project:

```ts
// LAB 13 — Union Types & Type Guards

// Copy interfaces:
interface Ship     { x: number; y: number; angle: number; vx: number; vy: number; }
interface Bullet   { x: number; y: number; vx: number; vy: number; lifetime: number; }
interface Asteroid { x: number; y: number; radius: number; vx: number; vy: number;
                     tier: AsteroidTier; // ← will use the union type below
                     orbitCentreX?: number; orbitCentreY?: number;
                     orbitAngle?: number; orbitSpeed?: number; orbitRadius?: number;
                     phase?: number; }

// ─── Union Type Aliases ───────────────────────────────────────────────────────
type GameState    = 'title' | 'playing' | 'paused' | 'gameOver';
// The four valid game states — and only these four.

type AsteroidTier = 'large' | 'medium' | 'small';
// The three valid asteroid tiers — replaces the plain 'string' annotation.

type ChildTier    = AsteroidTier | null;
// Child tier: one of the three asteroid tiers, OR null (no children for small).
// AsteroidTier | null is a union of a union and null — TypeScript flattens this to:
// 'large' | 'medium' | 'small' | null

// ─── Use them ─────────────────────────────────────────────────────────────────
let gameState: GameState = 'title';
gameState = 'playing'; // ✓
// gameState = 'menu'; // uncomment to see the error

const tier: AsteroidTier = 'large';
// tier = 'huge'; // ERROR: '"huge"' is not assignable to type 'AsteroidTier'

const childTier: ChildTier = null; // small asteroid — no children
// childTier = 'medium'; // also fine — ChildTier allows AsteroidTier values

console.log('gameState:', gameState);
console.log('tier:', tier);
console.log('childTier:', childTier);
```

### SAVE AND TRY

```bash
npx tsc
node dist/unions.js
```

**Expected:**
```
gameState: playing
tier: large
childTier: null
```

**Change something:** Change `gameState = 'playing'` to `gameState = 'PLAYING'`. **Expected:**
```
error TS2322: Type '"PLAYING"' is not assignable to type 'GameState'.
```
Change it back.

---

## Concept: Type Guards — Narrowing

**What it is:** Code that checks what specific type a union value currently holds, allowing TypeScript to treat it as that specific type within the guarded block.

**The problem without type guards:**
```ts
type GameState = 'title' | 'playing' | 'paused' | 'gameOver';

function handleState(state: GameState): void {
  // state is GameState here — all four values possible
  state.toUpperCase(); // ✓ — all strings have toUpperCase
  // But what if you want to do something only when playing?
  doPlayingStuff(); // you'd call this unconditionally — bug
}
```

**The solution — type guards narrow the type:**
```ts
function handleState(state: GameState): void {
  if (state === 'playing') {
    // Inside this if: TypeScript KNOWS state is 'playing'
    // Not just GameState — the specific value 'playing'
    console.log('Currently playing'); // ✓
  }
  // Outside the if: state is back to GameState (all four possibilities)
}
```

**What narrowing means:**
TypeScript tracks what checks you've performed. After `if (state === 'playing')`, TypeScript narrows the type of `state` from `GameState` to `'playing'` inside the if block. This is called **narrowing** — the union type is narrowed to a more specific type.

**What it hides:**
Type guards hide the need for manual type casting. The invariant: **inside a guarded block, TypeScript knows the exact type of the value** — you can access type-specific properties and methods without error or casting.

**Canonical example:**
```ts
type Shape = 'circle' | 'square' | 'triangle';

function describe(shape: Shape): string {
  if (shape === 'circle') {
    return 'Round'; // TypeScript: shape is 'circle' here
  }
  if (shape === 'square') {
    return 'Four equal sides'; // TypeScript: shape is 'square' here
  }
  return 'Three sides'; // TypeScript: shape must be 'triangle' here
}
```

**The four type guard patterns:**

| Pattern | Example | Use when |
|---|---|---|
| Equality check | `if (x === 'playing')` | String/number literal unions |
| `typeof` | `if (typeof x === 'string')` | Primitive type unions |
| `in` operator | `if ('lifetime' in obj)` | Object unions with different shapes |
| `switch` | `switch (gameState)` | Multiple cases in one structure |

---

## Step 2 — Narrow with Equality and `switch`

Add to **`src/unions.ts`**:

```ts
// ─── Type Guards ──────────────────────────────────────────────────────────────

// Guard 1 — equality check:
function describeState(state: GameState): string {
  if (state === 'playing') {
    return 'Game is active — ship is controllable';
    // TypeScript: state is 'playing' inside this block
  }
  if (state === 'paused') {
    return 'Game is frozen — press P to resume';
  }
  // TypeScript: state is 'title' | 'gameOver' here (playing and paused are excluded)
  return 'Not in an active game';
}

// Guard 2 — switch statement (the most common pattern for FSM states):
function updateForState(state: GameState): void {
  switch (state) {
    case 'title':
      console.log('Title: waiting for ENTER');
      break;
    case 'playing':
      console.log('Playing: running game logic');
      // Inside this case: TypeScript narrows state to 'playing'
      break;
    case 'paused':
      console.log('Paused: game logic frozen');
      break;
    case 'gameOver':
      console.log('Game over: showing final score');
      break;
    // No default needed — GameState only has four values
    // If we add a fifth, TypeScript warns us to add a case
  }
}

updateForState('playing');
updateForState('title');
console.log(describeState('paused'));
```

### SAVE AND TRY

```bash
npx tsc
node dist/unions.js
```

**Expected:**
```
Playing: running game logic
Title: waiting for ENTER
Game is frozen — press P to resume
```

**In watch mode — test exhaustiveness:**

Delete the `case 'gameOver':` block from `updateForState`. Does TypeScript warn you? Not yet with this pattern — we need exhaustiveness checking, which comes next.

Restore the case.

---

## Concept: Exhaustiveness Checking

**What it is:** A TypeScript technique that produces a compile-time error if a `switch` statement doesn't handle all cases of a union type. Ensures that adding a new state automatically flags every `switch` that needs updating.

**The problem without it:**
```ts
type GameState = 'title' | 'playing' | 'paused' | 'gameOver';

switch (gameState) {
  case 'title':    renderTitle(); break;
  case 'playing':  renderGame();  break;
  case 'paused':   renderPause(); break;
  // Forgot 'gameOver' — TypeScript says nothing.
  // At runtime: 'gameOver' state falls through with no rendering.
}
// Later: you add 'levelSelect' to GameState.
// You update some switches but forget this one. TypeScript: silence.
```

**The solution — the `never` trick:**
```ts
function assertNever(value: never): never {
  // This function's parameter is 'never' — it should be unreachable.
  // If TypeScript can reach this call, it means a case was missed.
  throw new Error('Unexpected value: ' + JSON.stringify(value));
}

switch (gameState) {
  case 'title':    renderTitle(); break;
  case 'playing':  renderGame();  break;
  case 'paused':   renderPause(); break;
  case 'gameOver': renderOver();  break;
  default:
    assertNever(gameState);
    // TypeScript: if all cases are handled, gameState is 'never' here ✓
    // If you add 'levelSelect' to GameState without a case:
    // TypeScript: ERROR — 'levelSelect' is not assignable to 'never'
    // The error tells you exactly which case is missing.
}
```

**What it hides:**
Exhaustiveness checking hides the risk of "forgotten cases" in switch statements. The invariant: **if the code compiles without error at the `assertNever` call, ALL cases of the union are handled** — adding a new union member automatically breaks compilation until all switches are updated.

**Canonical example:**
```ts
type Direction = 'north' | 'south' | 'east' | 'west';

function move(dir: Direction): void {
  switch (dir) {
    case 'north': y -= 1; break;
    case 'south': y += 1; break;
    case 'east':  x += 1; break;
    case 'west':  x -= 1; break;
    default: assertNever(dir); // ✓ all four handled
  }
}
// Add 'up' to Direction: assertNever(dir) immediately errors
// — TypeScript: 'up' is not assignable to 'never'
// You know exactly where to add the new case.
```

**Project Application:** The `update()` and `render()` switches in LAB 06 will use `assertNever` — so adding a new `GameState` value (e.g. `'cutscene'`) immediately flags every unhandled switch.

**Why it matters here:** In LAB 06 you had four game states. A real game might eventually have ten. Without exhaustiveness checking, forgotten cases become invisible bugs. With it, they become compile errors.

**Watch for:** `assertNever` must be in the `default` branch (not just at the end). The `default` branch runs when no case matched — and if all cases ARE handled, TypeScript narrows the type to `never`, making the `assertNever(value: never)` call valid. If a case is missing, the value at `default` has a non-`never` type, and passing it to `assertNever(never)` is a type error.

---

## Step 3 — Add Exhaustiveness Checking

Add to **`src/unions.ts`**:

```ts
// ─── Exhaustiveness checking ──────────────────────────────────────────────────

function assertNever(value: never): never {
  // If TypeScript reaches this function at compile time, it means
  // a union case was not handled in a switch above.
  // At runtime: this throws an error as a safety net.
  throw new Error('Unhandled case: ' + JSON.stringify(value));
}

// The FSM switch — now exhaustiveness-checked:
function render(state: GameState): void {
  switch (state) {
    case 'title':
      console.log('[RENDER] Title screen');
      break;
    case 'playing':
      console.log('[RENDER] Game world');
      break;
    case 'paused':
      console.log('[RENDER] Game world + pause overlay');
      break;
    case 'gameOver':
      console.log('[RENDER] Game world + game over overlay');
      break;
    default:
      assertNever(state);
      // If all four cases are handled: state is 'never' here — no error ✓
      // If you add 'levelSelect' to GameState without a new case:
      // error TS2345: Argument of type 'string' is not assignable to
      //              parameter of type 'never'
  }
}

render('title');
render('playing');
render('gameOver');
```

### SAVE AND TRY

```bash
npx tsc
node dist/unions.js
```

**Expected:**
```
[RENDER] Title screen
[RENDER] Game world
[RENDER] Game world + game over overlay
```

**Test exhaustiveness — add a new state:**

Change the type alias:
```ts
type GameState = 'title' | 'playing' | 'paused' | 'gameOver' | 'levelSelect'; // ← ADD
```

Save. **Expected error immediately in watch mode:**
```
error TS2345: Argument of type '"levelSelect"' is not assignable to parameter of type 'never'.
```

TypeScript found the missing case — in the render function's default branch. Add `case 'levelSelect':` with a break, then save — error disappears. Remove `'levelSelect'` from the type alias when done.

---

## 🎯 Challenge: Exhaustive Tier Switch

**You know:** `AsteroidTier` union type, exhaustiveness checking, `assertNever`.

**Task:** Write a function `getTierScore(tier: AsteroidTier): number` that returns the score for destroying an asteroid of that tier (large=20, medium=50, small=100). Use an exhaustive switch. Then test that adding `'tiny'` to `AsteroidTier` immediately produces a compile error.

**Starting code:**
```ts
function getTierScore(tier: AsteroidTier): number {
  switch (tier) {
    // cases here
    default: return assertNever(tier);
    // Note: assertNever returns 'never' — and 'never' is assignable
    // to any type (including number), so this compiles correctly.
  }
}
```

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
function getTierScore(tier: AsteroidTier): number {
  switch (tier) {
    case 'large':  return 20;
    case 'medium': return 50;
    case 'small':  return 100;
    default:       return assertNever(tier);
    // assertNever's return type is 'never', which TypeScript considers
    // assignable to any type — so 'return assertNever(tier)' satisfies
    // the number return type annotation. This is correct and intentional.
  }
}

console.log(getTierScore('large'));  // 20
console.log(getTierScore('medium')); // 50
console.log(getTierScore('small'));  // 100

// Test exhaustiveness — add 'tiny' to AsteroidTier:
// type AsteroidTier = 'large' | 'medium' | 'small' | 'tiny'; // uncomment
// Expected error: '"tiny"' is not assignable to parameter of type 'never'
// in the getTierScore switch's default branch.
// Fix by adding: case 'tiny': return 200;
```

**Key insight:** `assertNever`'s return type is `never` — the TypeScript type for "this can never produce a value." `never` is special: it's assignable to every type (because code after it is unreachable). So `return assertNever(tier)` satisfies `number` return type, `string` return type, any return type — because it never actually returns. This is the TypeScript way of saying "this code is unreachable and we both know it."

</details>

---

## Concept: `typeof` Type Guard

**What it is:** Using the JavaScript `typeof` operator as a type guard for primitive unions. When TypeScript sees `if (typeof x === 'string')`, it narrows `x` to `string` inside the if block.

**The problem:**
```ts
type NumberOrString = number | string;

function process(value: NumberOrString): string {
  return value.toUpperCase(); // ERROR: toUpperCase exists on string, not number
  // TypeScript: value could be a number — numbers don't have toUpperCase
}
```

**The solution:**
```ts
function process(value: NumberOrString): string {
  if (typeof value === 'string') {
    return value.toUpperCase(); // ✓ — narrowed to string inside this block
  }
  // TypeScript: value is number here (string is excluded by the if above)
  return value.toFixed(2); // ✓ — toFixed is a number method
}
```

**Smallest possible example:**
```ts
function display(id: number | string): string {
  if (typeof id === 'number') {
    return 'ID #' + id.toFixed(0);    // id is number here
  }
  return 'ID: ' + id.toUpperCase(); // id is string here
}

console.log(display(42));        // "ID #42"
console.log(display('player1')); // "ID: PLAYER1"
```

**Why it matters here:** In the Asteroids game, event data can sometimes be different types. `typeof` guards let you write one handler that branches correctly.

---

## Concept: `in` Type Guard

**What it is:** Using the `in` operator to check if a property exists on an object, as a way to narrow between object union types that have different shapes.

**The problem:**
```ts
type Entity = Bullet | Asteroid;
// Bullet has: x, y, vx, vy, lifetime
// Asteroid has: x, y, vx, vy, radius, tier

function updateEntity(entity: Entity): void {
  entity.lifetime -= 1; // ERROR: 'lifetime' might not exist — Asteroid has no lifetime
  entity.radius;        // ERROR: 'radius' might not exist — Bullet has no radius
}
```

**The solution:**
```ts
function updateEntity(entity: Entity): void {
  if ('lifetime' in entity) {
    // TypeScript: entity is Bullet here (only Bullet has lifetime)
    entity.lifetime -= 1; // ✓
  } else {
    // TypeScript: entity is Asteroid here (the other branch)
    entity.radius;  // ✓
  }
}
```

**What `in` checks:** `'property' in obj` returns `true` if `obj` has a property called `'property'` (own or inherited). TypeScript uses this as a type narrowing hint.

**Project Application:** In a game with multiple entity types in one array (`type Entity = Ship | Bullet | Asteroid`), `in` guards let you write a single update function that handles each type correctly.

**Watch for:** The discriminating property must exist on ONLY ONE of the union types for `in` narrowing to work cleanly. If both `Bullet` and `Asteroid` had a `radius` property, `'radius' in entity` wouldn't narrow to just `Asteroid`.

---

## Step 4 — Update the Asteroid Interface to Use Union Types

Add to **`src/unions.ts`**:

```ts
// ─── Improved Asteroid interface using union types ────────────────────────────

interface AsteroidV2 {
  x:      number;
  y:      number;
  radius: number;
  vx:     number;
  vy:     number;
  tier:   AsteroidTier; // ← was: string. Now: only 'large' | 'medium' | 'small'
  orbitCentreX?: number;
  orbitCentreY?: number;
  orbitAngle?:   number;
  orbitSpeed?:   number;
  orbitRadius?:  number;
  phase?:        number;
}

// Now tier is constrained — TypeScript catches invalid tiers:
const badAsteroid: AsteroidV2 = {
  x: 0, y: 0, radius: 40, vx: 0, vy: 0,
  tier: 'huge', // ERROR: '"huge"' is not assignable to type 'AsteroidTier'
};
// Fix it:
const goodAsteroid: AsteroidV2 = {
  x: 0, y: 0, radius: 40, vx: 0, vy: 0,
  tier: 'large', // ✓
};

// And the score function works directly with AsteroidV2:
const score = getTierScore(goodAsteroid.tier);
// getTierScore expects AsteroidTier — goodAsteroid.tier IS AsteroidTier ✓
console.log('Score for large:', score); // 20
```

### SAVE AND TRY

```bash
npx tsc
node dist/unions.js
```

The `badAsteroid` line will error — temporarily comment it out to compile:

```ts
// const badAsteroid: AsteroidV2 = { ... tier: 'huge' ... };
```

**Expected output includes:**
```
Score for large: 20
```

**Change something:** Change `'large'` in `goodAsteroid.tier` to `'Large'` (capital L). **Expected:**
```
error TS2322: Type '"Large"' is not assignable to type 'AsteroidTier'.
```
The union type is case-sensitive. Change back.

---

## 🎯 Challenge: Type-Safe `splitAsteroid`

**You know:** `AsteroidTier`, `ChildTier`, exhaustive switch, and the `Asteroid` interface.

**Task:** Write a typed `getChildTier(tier: AsteroidTier): ChildTier` function using an exhaustive switch. It should return `'medium'` for `'large'`, `'small'` for `'medium'`, and `null` for `'small'`. Then write `getSplitSpeed(tier: AsteroidTier): number` similarly.

After writing them, call them in a typed `splitAsteroid` function that returns `AsteroidV2[]` (the children).

**Starting code:**
```ts
function getChildTier(tier: AsteroidTier): ChildTier {
  switch (tier) {
    // ...
    default: return assertNever(tier);
  }
}

function getSplitSpeed(tier: AsteroidTier): number {
  // large → 0.8, medium → 1.4, small → 2.0
}
```

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
function getChildTier(tier: AsteroidTier): ChildTier {
  switch (tier) {
    case 'large':  return 'medium'; // large splits into mediums
    case 'medium': return 'small';  // medium splits into smalls
    case 'small':  return null;     // small disappears — no children
    default:       return assertNever(tier);
  }
}

function getSplitSpeed(tier: AsteroidTier): number {
  switch (tier) {
    case 'large':  return 0.8;
    case 'medium': return 1.4;
    case 'small':  return 2.0;
    default:       return assertNever(tier);
  }
}

function splitAsteroid(asteroid: AsteroidV2): AsteroidV2[] {
  const childTier = getChildTier(asteroid.tier);
  if (childTier === null) return []; // small — no children

  const childSpeed = getSplitSpeed(childTier);
  // childTier is AsteroidTier here (not null — we checked above)
  // TypeScript narrowed ChildTier to AsteroidTier by ruling out null

  const children: AsteroidV2[] = [];
  for (let i = 0; i < 2; i++) {
    const angle = Math.random() * Math.PI * 2;
    children.push({
      x:      asteroid.x,
      y:      asteroid.y,
      radius: childTier === 'medium' ? 22 : 12,
      vx:     Math.cos(angle) * childSpeed,
      vy:     Math.sin(angle) * childSpeed,
      tier:   childTier, // ✓ — childTier is AsteroidTier (not null)
    });
  }
  return children;
}

const children = splitAsteroid(goodAsteroid);
console.log('Children from large:', children.length, '— tier:', children[0]?.tier);
// Expected: Children from large: 2 — tier: medium
```

**Key insight:** Notice the `if (childTier === null) return []` — this is a type guard. After this check, TypeScript narrows `childTier` from `ChildTier` (`AsteroidTier | null`) to just `AsteroidTier`. This is why `tier: childTier` inside `children.push(...)` works without error — TypeScript KNOWS null has been excluded by the if-check above.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `GameState` union prevents typos | `gameState = 'manu'` → error: not assignable to `GameState` |
| `AsteroidTier` union constrains tier | `tier: 'huge'` in Asteroid object → error |
| Exhaustive switch catches missing cases | Add value to `GameState`, don't add case → error at `assertNever` |
| `assertNever` error names the missing case | Error message includes the new state name |
| Equality guard narrows type | Inside `if (state === 'playing')`, state is `'playing'` not `GameState` |
| `switch` narrows each case | Inside `case 'large':`, tier is `'large'` not `AsteroidTier` |
| `typeof` guard narrows primitives | `typeof x === 'string'` → x is `string` inside the if |
| `in` guard narrows object unions | `'lifetime' in entity` → entity is `Bullet` inside the if |
| `ChildTier = AsteroidTier \| null` | Can assign both tier strings and null |
| Null narrowing after null check | After `if (x !== null)`, x is `AsteroidTier` not `ChildTier` |

---

## What's Next

**LAB 14** is the final lab in the TypeScript series — and the most satisfying. You'll take the complete `main.js` file from LAB 07 (the finished Asteroids game with Observer pattern and Strategy pattern) and convert it to a fully typed TypeScript file. Everything from LABs 08–13 comes together: interfaces for all entities, union types for game state and tiers, typed arrays, generic functions, typed Observer callbacks, and exhaustive switches. By the end, you'll have a TypeScript codebase that TypeScript compiles without a single error — and catches dozens of bugs that were previously invisible.

---

## Quick Check Answers

**1. What's the problem with typing `gameState` as `string`?**

`string` allows ANY string — including `'manu'`, `'PAUSED'`, `''`, `'hello world'`. Every typo, every casing mistake, every accidental assignment is invisible to TypeScript. The `switch` statement in `update()` would silently fall through for any invalid state. With `type GameState = 'title' | 'playing' | 'paused' | 'gameOver'`, TypeScript catches all of these at the assignment site — before the wrong value ever reaches a switch.

**2. How would you write a function that handles a `number | string` differently per type?**

Use a `typeof` type guard: `if (typeof value === 'number') { /* handle number */ } else { /* handle string */ }`. Inside the `if` block, TypeScript narrows `value` to `number`. In the `else` block, TypeScript narrows it to `string`. This is the standard pattern for primitive unions — check the type, then use type-specific properties and methods without errors.

**3. What happens if you add a fifth game state but forget to add a case for it?**

Without exhaustiveness checking: the `switch` silently falls through to `default` (or past all cases). The new state renders nothing, updates nothing — a silent invisible bug. With `assertNever` in the `default` branch: TypeScript immediately produces a compile error naming the unhandled state. The error appears in every switch that handles `GameState` — not just the one you're editing. You can't ship the code with the missing case.

---

*End of LAB 13. Next: [[LAB-14-Putting-It-All-Together]]*
