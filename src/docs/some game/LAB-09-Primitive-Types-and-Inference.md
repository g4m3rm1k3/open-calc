# TypeScript — LAB 09 — Primitive Types & Inference

**Prerequisites:** LAB 08 (What TypeScript Is & Why). You have TypeScript installed, `tsc` compiling `.ts` files, and you've written your first annotations. You know: `: number`, `: string`, `: boolean`, what compile time means, what inference is.

**What this lab adds:**
- All seven TypeScript primitive types — including `null`, `undefined`, and `any`
- Why `null` and `undefined` are different and why that matters
- The `any` type — what it is, why it exists, and why you almost never want it
- Type inference rules — when TypeScript can figure it out vs when you must annotate
- A practical audit of the LAB 01 constants: which need annotations, which don't

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In JavaScript, what is the difference between `null` and `undefined`? If you don't know — guess.
> 2. If a variable could be either a number or `null`, what type annotation would you write?
> 3. What do you think happens in TypeScript if you write `let x;` with no initial value and no annotation?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A type-audited version of the LAB 01 constants block — the same game constants from your Asteroids game, but now with correct TypeScript annotations and a clear understanding of what each type means and why.

```ts
// Before (plain JavaScript):
const DOT_RADIUS = 12;
const DOT_SPEED  = 3;
const DOT_COLOR  = '#ffffff';
const BG_COLOR   = '#000000';

// After (typed TypeScript):
const DOT_RADIUS: number = 12;    // inferred fine, annotation optional
const DOT_SPEED:  number = 3;     // inferred fine, annotation optional
const DOT_COLOR:  string = '#ffffff'; // inferred fine
const BG_COLOR:   string = '#000000'; // inferred fine
// TypeScript catches: DOT_RADIUS = "big" — ERROR before any code runs
```

By the end: you know all seven primitives, you can read TypeScript type errors confidently, and you understand exactly when to annotate vs when to let inference do the work.

---

## Concept: The Seven Primitive Types

**What they are:** The seven basic value types that exist in TypeScript (inherited from JavaScript). Every value in a program is one of these — or a combination of them (covered in later labs).

| Type | What it holds | Example values |
|---|---|---|
| `number` | Any numeric value — integer or decimal | `0`, `3.14`, `-1`, `NaN`, `Infinity` |
| `string` | Any text value | `'hello'`, `"world"`, `` `template ${x}` `` |
| `boolean` | Exactly `true` or `false` | `true`, `false` |
| `null` | The intentional absence of a value | `null` |
| `undefined` | A value that hasn't been set yet | `undefined` |
| `bigint` | Integers larger than `Number.MAX_SAFE_INTEGER` | `9007199254740993n` |
| `symbol` | A unique, unforgeable identifier | `Symbol('id')` |

**For game development, you use the first five constantly. `bigint` and `symbol` are rare — you may never need them.**

**Why it matters here:** Every variable in the Asteroids game is one of these types. Knowing them lets you read type errors and write correct annotations.

**Watch for:** `NaN` (Not a Number) has type `number` in TypeScript. This surprises everyone. `NaN` is JavaScript's way of representing an invalid numeric operation — `Math.sqrt(-1)`, `0/0`, `parseInt("hello")`. It's a number in the sense that it occupies a number slot, but it behaves like poison: any arithmetic involving `NaN` produces `NaN`. TypeScript can't save you from `NaN` at compile time — it's a runtime value of type `number`.

---

### Concept: `null` — The Intentional Absence

**What it is:** A primitive value that explicitly means "this variable has no value right now — and that is deliberate."

**The problem `null` solves:**
```ts
// A player can have a name, or they might not have entered one yet.
// How do you represent "no name entered"?

let playerName: string = ""; // empty string — but "" is a valid name, not "no name"
let playerName: string = "none"; // the string "none" — but that's a lie about the type
let playerName: string | null = null; // ← correct: null means "no name yet"
```

**`null` is explicit:** When you see `null`, a programmer deliberately set the value to nothing. It's a signal: "I know this variable exists, and I know it currently has no value."

**Smallest possible example:**
```ts
let activeTarget: string | null = null;
// No target selected yet — null is the honest answer

activeTarget = 'Asteroid-01'; // now a target is selected
activeTarget = null;           // target was destroyed — back to null
```

**Why it matters here:** In the Asteroids game, when the ship is destroyed and waiting to respawn, `activeTarget` might be null. In LAB 10, asteroid children have a `childTier` property that is `null` for small asteroids (no children). TypeScript lets you express this cleanly.

**Watch for:** TypeScript's `strict` mode enables **strictNullChecks** — which means `null` is NOT automatically a valid value for every type. `let x: number = null` is an error in strict mode. This is correct behaviour: a number should be a number, not potentially nothing. You must explicitly opt in: `let x: number | null = null`.

---

### Concept: `undefined` — The Unset Value

**What it is:** A primitive value that means "this variable exists but has never been given a value." JavaScript assigns `undefined` automatically to variables that are declared but not initialised.

**`null` vs `undefined` — the distinction:**

| | `null` | `undefined` |
|---|---|---|
| **Set by** | You, deliberately | JavaScript, automatically |
| **Meaning** | "I know there's no value here" | "Nobody set this yet" |
| **Analogy** | An empty box you deliberately left empty | A box that was never filled |

```ts
let declared: string;
console.log(declared); // undefined — JavaScript set this automatically

let intentional: string | null = null;
console.log(intentional); // null — you set this deliberately
```

**In strict TypeScript:**
```ts
function findAsteroid(tier: string): string | undefined {
  // might return a tier name, or undefined if not found
  if (tier === 'large') return 'large';
  return undefined; // explicitly: nothing found
}
```

**Why it matters here:** Function return values that "might not find anything" should return `T | undefined`, not `null`. The convention in TypeScript: use `null` for deliberate absence, `undefined` for "not yet set" or "not found."

**Watch for:** Many APIs return `undefined` when a key doesn't exist — `array[99]` when the array only has 3 items, `document.getElementById('missing')`. TypeScript's strict mode forces you to handle these cases, preventing the classic `Cannot read properties of undefined` runtime error.

---

### Math: None Required

This lab is pure type theory — no new math. But here is a logic truth table that matters for `null` and `undefined` checks:

### Logic: Null/Undefined Check

**What it decides:** Is this value safe to use — or might it be absent?

**Truth table:**

| Value | `value === null` | `value === undefined` | `value == null` |
|---|---|---|---|
| `null` | `true` | `false` | `true` |
| `undefined` | `false` | `true` | `true` |
| `0` | `false` | `false` | `false` |
| `""` | `false` | `false` | `false` |
| `42` | `false` | `false` | `false` |

**The code:**
```ts
// Check for exactly null:
if (value === null) { /* value is null */ }

// Check for exactly undefined:
if (value === undefined) { /* value is undefined */ }

// Check for either null OR undefined (the loose equality shortcut):
if (value == null) { /* value is null or undefined — both cases */ }
// Note: == (not ===) intentionally here — the one valid use of loose equality
```

**Watch for:** `value == null` (double equals) catches BOTH null and undefined. `value === null` (triple equals) catches ONLY null. In TypeScript, you'll use `value == null` as a safe "is this absent?" check — it's the rare valid use of double equals.

---

## Concept: `any` — TypeScript's Escape Hatch

**What it is:** A special type that opts a variable OUT of type checking entirely. A variable typed as `any` can hold any value and TypeScript will never complain about how it's used.

**The problem `any` solves (legitimately):**
```ts
// Sometimes you genuinely don't know the type — e.g. data from a server:
const response = await fetch('/api/scores');
const data: any = await response.json();
// JSON could be anything — TypeScript can't verify server data at compile time
// 'any' is the honest annotation: "I don't know yet"
```

**Why `any` is dangerous (in most cases):**
```ts
let x: any = 42;
x = "hello";   // no error — x is any
x = true;      // no error — x is any
x.foo();       // no error — TypeScript assumes any method exists
x.bar.baz();   // no error — even this chain compiles fine
// These will all explode at runtime, but TypeScript said nothing.
```

**What it hides (the wrong way):**
`any` disables every protection TypeScript provides. A value typed as `any` has no invariant — it can be anything, accessed in any way, passed anywhere. Using `any` is equivalent to writing plain JavaScript for that variable.

**Canonical example:**
```ts
// The correct approach — explicit types:
let score: number = 0;
score = "reset"; // ERROR: caught at compile time ✓

// The 'any' escape hatch — all protection gone:
let score: any = 0;
score = "reset"; // no error — TypeScript gives up
console.log(score + 1); // "reset1" at runtime — wrong, uncaught ✗
```

**Project Application (The "Why" here):**
In the LAB 01 `main.js`, `let bullets = []` becomes `let bullets: any[]` in TypeScript if you're not careful — TypeScript can't infer the type of an empty array. This silently disables type checking for all bullet operations. LAB 11 fixes this with `Array<Bullet>`.

**Why it matters here:** You'll encounter `any` in error messages and other people's code. Recognising it — and knowing to replace it with a specific type — is a core TypeScript skill.

**Watch for:** TypeScript's `strict` mode doesn't ban `any`, but it does flag when TypeScript can't infer a type and falls back to `any` (this is called an "implicit any" error). Explicit `any` is your choice — implicit `any` is TypeScript telling you it needs help.

---

## Step 1 — Set Up This Lab

Create **`src/primitives.ts`** in your `typescript-lab-08` project (from LAB 08):

```ts
// LAB 09 — Primitive Types & Inference
```

With watch mode still running (`npx tsc --watch`), this file will compile automatically when you save.

### SAVE AND TRY

```bash
ls dist/
```
**Expected:** Both `main.js` and `primitives.js` now exist in `dist/`.

---

## Step 2 — All Seven Primitives, Side by Side

Add to **`src/primitives.ts`**:

```ts
// ── The seven primitive types ─────────────────────────────────────────────────

const framesPerSecond: number  = 60;
// number: any numeric value — integers, decimals, negatives, NaN, Infinity

const gameTitle: string  = 'Asteroid Field';
// string: any text, any quote style — '', "", ``

const soundEnabled: boolean = true;
// boolean: exactly true or false — nothing else

let selectedAsteroid: string | null = null;
// null: deliberate absence — "no asteroid selected yet"
// string | null means: "this can hold a string OR null"
// The | symbol means "or" — we'll cover this in full in LAB 13

let lastSaveTime: number | undefined;
// undefined: not yet set — the variable exists but has no value
// number | undefined: either a timestamp or nothing yet

const veryLargeScore: bigint = 9007199254740993n;
// bigint: integers beyond Number.MAX_SAFE_INTEGER (rarely needed in games)
// The 'n' suffix marks a bigint literal

const entityId: symbol = Symbol('asteroid-01');
// symbol: a unique, unforgeable identifier — rarely needed in games

console.log(framesPerSecond, gameTitle, soundEnabled);
console.log(selectedAsteroid, lastSaveTime);
```

### SAVE AND TRY

Watch mode should compile automatically. If not:
```bash
npx tsc
```

```bash
node dist/primitives.js
```

**Expected output:**
```
60 Asteroid Field true
null undefined
```

**In DevTools Console equivalent:**
```bash
node -e "console.log(typeof 60, typeof 'hello', typeof true, typeof null, typeof undefined)"
```
**Expected:** `number string boolean object undefined`

**Note the surprise:** `typeof null` is `'object'` in JavaScript — a famous historical bug in the language. TypeScript knows `null` is its own type; JavaScript's `typeof` operator just has this quirk. TypeScript's type system is more accurate than `typeof`.

**Change something:** Change `const framesPerSecond: number = 60` to `const framesPerSecond: number = "sixty"`. Watch mode shows an error immediately. Change it back.

---

## Step 3 — Observe Inference in Action

Add to **`src/primitives.ts`**:

```ts
// ── Inference — TypeScript figuring it out ────────────────────────────────────

const shipRadius   = 15;       // inferred: number
const shipColour   = '#fff';   // inferred: string
const thrustActive = false;    // inferred: boolean

// Hover over these in VS Code — the tooltip shows the inferred type.
// In the terminal, inference is silent — no errors means TypeScript accepted it.

// Inference still protects you — these will error:
// shipRadius = "big";    // ERROR even without annotation
// thrustActive = 1;      // ERROR even without annotation
```

### SAVE AND TRY

```bash
npx tsc --noEmit
```
**Expected:** No errors. Inference worked.

**Now test that inference still protects:**

Add this temporarily:
```ts
const testRadius = 15;
// testRadius = "large"; // ← uncomment this line and save
```

Uncomment the second line. Watch mode shows:
```
error TS2588: Cannot assign to 'testRadius' because it is a constant.
```

Interesting — a different error! `const` variables can never be reassigned — TypeScript catches that too. Change `const` to `let`:

```ts
let testRadius = 15;
testRadius = "large"; // ← still errors: string not assignable to number
```

**Expected:** `error TS2322: Type 'string' is not assignable to type 'number'` — the inference protection.

Delete the test lines when done.

---

## Concept: `const` vs `let` — Literal Types

**What it is:** When you use `const`, TypeScript infers a **literal type** — the exact value — not just the general type. When you use `let`, TypeScript infers the general type.

**This matters:**
```ts
const speed = 3;     // inferred type: 3  (the literal number 3, not just "any number")
let   speed = 3;     // inferred type: number (any number)

const tier = 'large'; // inferred type: 'large'  (the literal string, not just "any string")
let   tier = 'large'; // inferred type: string   (any string)
```

**Why `const` gets literal types:** A `const` can never be reassigned — so TypeScript knows the value will ALWAYS be exactly `3` or `'large'`. It would be a lie to say the type is just `number` when it will always be `3`.

**Why this matters in the Asteroids game:**
```ts
const ASTEROID_TIERS = {
  large:  { radius: 40 },
  medium: { radius: 22 },
};
// TypeScript infers ASTEROID_TIERS.large.radius as exactly 40, not just number
// This lets it catch: ASTEROID_TIERS.nonexistent — ERROR: property doesn't exist
```

**Watch for:** In LAB 13, literal types become the foundation of **union types** — where `gameState` can only be `'title' | 'playing' | 'paused' | 'gameOver'`, not any arbitrary string.

---

## Step 4 — Audit the LAB 01 Constants

Now apply everything to the actual Asteroids constants. Create **`src/lab01-audit.ts`**:

```ts
// ── LAB 01 Constants — TypeScript audit ───────────────────────────────────────
// For each constant: does it need an explicit annotation, or is inference enough?

// VERDICT: inference is fine — TypeScript sees numeric literals
const DOT_RADIUS = 12;   // inferred: 12 (literal) — or number if let
const DOT_SPEED  = 3;    // inferred: 3 (literal)

// VERDICT: inference is fine — TypeScript sees string literals
const DOT_COLOR  = '#ffffff'; // inferred: '#ffffff' (literal)
const BG_COLOR   = '#000000'; // inferred: '#000000' (literal)

// ── Game state variables — these NEED annotation ──────────────────────────────

// PROBLEM: let x; with no initial value → TypeScript infers 'any'
// let currentFrame;             // BAD: inferred 'any'
// SOLUTION: annotate explicitly
let currentFrame: number = 0;  // GOOD: number, starts at 0

// PROBLEM: empty array → TypeScript infers 'never[]' (can hold nothing)
// let bullets = [];             // BAD: inferred 'never[]'
// SOLUTION: annotate (full fix comes in LAB 11 with Array<T>)
let bullets: any[] = [];       // acceptable for now — LAB 11 makes this typed

// PROBLEM: gameState is a string, but what strings are valid?
// let gameState = 'title';      // inferred: string — too broad
// SOLUTION for now: annotate as string (LAB 13 narrows to exact values)
let gameState: string = 'title'; // LAB 13 will make this: 'title' | 'playing' | 'paused' | 'gameOver'

// ── The null case ─────────────────────────────────────────────────────────────
// In LAB 05, ASTEROID_TIERS had childTier: null for small asteroids.
// How do you type a property that can be a string or null?
let childTier: string | null = null;   // correct: explicitly both types
childTier = 'medium'; // fine — string
childTier = null;     // fine — null
childTier = 42;       // ERROR: number not assignable to string | null

console.log('Audit complete — no type errors');
```

### SAVE AND TRY

```bash
npx tsc
node dist/lab01-audit.js
```

**Expected:** `Audit complete — no type errors`

**In watch mode terminal — check for errors:**
The line `childTier = 42` should show an error. Uncomment it and verify, then comment it out again.

**Change something:** Change `let currentFrame: number = 0` to `let currentFrame: number = "zero"`. **Expected:** `error TS2322: Type 'string' is not assignable to type 'number'`. Change it back.

---

## 🎯 Challenge: Annotate Five Game Variables

**You know:** All seven primitive types, `null`, `undefined`, `any`, and when to annotate vs infer.

**Task:** For each variable below, decide the correct TypeScript type (including `null` or `undefined` where appropriate) and explain your reasoning. There is one trap — a variable where `any` is tempting but wrong.

```ts
// Decide the correct type for each:

// 1. The ship's current rotation angle in radians
let shipAngle = ???;

// 2. A bullet's time-to-live in frames (starts full, reaches 0 = remove)
let bulletLifetime = ???;

// 3. The name the player typed in (they might not have typed anything yet)
let playerName = ???;

// 4. Whether the game audio is muted
let audioMuted = ???;

// 5. The raw JSON data returned from a leaderboard API
//    (you don't know the structure yet)
let leaderboardData = ???;
```

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// 1. The ship's current rotation angle in radians
let shipAngle: number = 0;
// Angles are always numbers — radians are just decimal numbers.
// Inference would work here (= 0 → infers number), but explicit annotation
// documents intent: this must always be numeric, never a string.

// 2. A bullet's time-to-live in frames
let bulletLifetime: number = 90;
// Always a non-negative integer. Inference works, annotation is optional.

// 3. The player name — might not have been entered yet
let playerName: string | null = null;
// null is correct: the player hasn't typed a name yet.
// undefined would also be valid, but null is the conventional choice for
// "this slot exists, it's just empty" — a deliberate design decision.

// 4. Whether audio is muted
let audioMuted: boolean = false;
// Always true or false. Inference works fine here.

// 5. Leaderboard data from an API
let leaderboardData: unknown = null;
// 'unknown' is the correct answer — NOT 'any'.
// 'any': TypeScript gives up and lets you do anything without checking.
// 'unknown': TypeScript knows the value exists but forces you to check
//            what it is before using it. Safer than 'any'.
// (We'll cover 'unknown' more in LAB 13 — for now, know it exists
//  and is always better than 'any' for external data.)
```

**Key insight:** `unknown` is the type-safe alternative to `any` for data whose structure you don't yet know. Both say "I don't know the type." But `any` says "...so don't check anything," while `unknown` says "...so force me to check before I use it." In professional TypeScript, `any` almost always has a better replacement: `unknown` for unverified data, proper type annotations for everything else. The rule: if you find yourself reaching for `any`, ask "is this actually `unknown`?"

</details>

---

## 🎯 Challenge: Spot the Five Errors

**You know:** All seven primitives and what TypeScript considers a type error.

**Task:** The code below has exactly five type errors. Find all five. Do NOT run `tsc` yet — read the code and spot them yourself first. Then verify with `tsc`.

```ts
// spot-errors.ts — contains exactly 5 type errors

const BULLET_SPEED: number = 8;
const MAX_ASTEROIDS: number = 10;
const PLAYER_NAME: string = 'Player 1';
const INVINCIBLE: boolean = false;

let shipX: number = canvas.width / 2;
let shipY: number = canvas.height / 2;

const tier: string = 42;
const childTier: string | null = 'medium';
const isGameOver: boolean = "false";

let lives: number = 3;
lives = lives - 1;
lives = null;

let score: number = 0;
const highScore: number = score;
highScore = 9999;
```

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// Error 1: tier is annotated as string but assigned a number
const tier: string = 42;
// Fix: const tier: number = 42; OR const tier: string = '42';

// Error 2: isGameOver is annotated as boolean but assigned a string
const isGameOver: boolean = "false";
// Fix: const isGameOver: boolean = false;
// Note: "false" (with quotes) is the STRING "false", not the boolean false

// Error 3: lives is annotated as number but assigned null
lives = null;
// Fix: let lives: number | null = 3; — then lives = null is allowed

// Error 4: highScore is const but assigned after declaration
highScore = 9999;
// Fix: let highScore: number = score; — then assignment is legal
// (Note: this is not strictly a TYPE error — it's a const reassignment error.
//  TypeScript catches both. Error message: "Cannot assign to 'highScore'
//  because it is a constant.")

// Error 5 (the subtle one): shipX and shipY reference 'canvas' 
// which doesn't exist in this file
let shipX: number = canvas.width / 2;
let shipY: number = canvas.height / 2;
// Fix: canvas must be declared and typed in scope, or these values
// must be computed differently. This is a "cannot find name 'canvas'" error.
```

**Key insight:** Error 2 — `"false"` vs `false` — is one of the most common beginner bugs. In JavaScript, `"false"` (a string) is truthy (all non-empty strings are), while `false` (the boolean) is falsy. They look similar but behave opposite. TypeScript catches this at compile time; JavaScript silently allows the bug, which then breaks every if-statement that checks `isGameOver`.

</details>

---

## Concept: `unknown` — The Safe Alternative to `any`

**What it is:** A type that says "this value exists but I don't know its type yet — check before using."

**`any` vs `unknown` — the critical difference:**
```ts
let valueAny: any = fetchSomething();
valueAny.foo();     // No error — TypeScript lets you do anything
valueAny + 1;       // No error — even arithmetic

let valueUnknown: unknown = fetchSomething();
valueUnknown.foo(); // ERROR: Object is of type 'unknown'
valueUnknown + 1;   // ERROR: Operator '+' cannot be applied to unknown

// To use 'unknown', you must first check its type:
if (typeof valueUnknown === 'number') {
  valueUnknown + 1; // ✓ — now TypeScript knows it's a number
}
```

**What it hides:**
`unknown` hides nothing intentionally — that's the point. It forces you to explicitly check the type before using the value. The invariant: **you cannot use an `unknown` value without first narrowing it to a specific type** — TypeScript enforces this.

**Why it matters here:** External data (server responses, user input, `localStorage` values) should be `unknown`, not `any`. This forces you to validate the data before trusting it — which is exactly what you should do.

**Watch for:** You won't use `unknown` much in the Asteroids game (no server calls yet). But when you see `any` in someone else's TypeScript code, ask: "Should this be `unknown`?" Almost always, the answer is yes.

---

## Final Check

| Feature | How to verify |
|---|---|
| All 7 primitives in one file | `src/primitives.ts` compiles with no errors |
| `null` separate from `undefined` | `console.log(null === undefined)` → `false` |
| `string \| null` annotation works | Assigning both string and null to a `string \| null` var → no errors |
| `any` disables checking | `let x: any = 5; x = "hello"; x.foo()` → no TypeScript errors |
| Inference on `const` gives literal type | Hover over `const X = 3` in VS Code — shows type `3`, not `number` |
| `let` inference gives general type | Hover over `let X = 3` in VS Code — shows type `number` |
| `unknown` is stricter than `any` | `let x: unknown = 5; x + 1` → ERROR in TypeScript |
| LAB 01 audit compiles | `src/lab01-audit.ts` compiles with no errors |

---

## Complete `src/primitives.ts` Reference

```ts
// LAB 09 — Primitive Types & Inference

// ── The seven primitive types ──────────────────────────────────────────────────
const framesPerSecond: number  = 60;
const gameTitle:       string  = 'Asteroid Field';
const soundEnabled:    boolean = true;
let selectedAsteroid:  string | null    = null;
let lastSaveTime:      number | undefined;
const veryLargeScore:  bigint  = 9007199254740993n;
const entityId:        symbol  = Symbol('asteroid-01');

// ── Inference examples ─────────────────────────────────────────────────────────
const shipRadius   = 15;       // inferred: 15 (literal number)
const shipColour   = '#fff';   // inferred: '#fff' (literal string)
const thrustActive = false;    // inferred: false (literal boolean)

// ── null vs undefined ──────────────────────────────────────────────────────────
let childTier: string | null = null;
childTier = 'medium';
childTier = null;

let frameCount: number | undefined;
frameCount = 0;

// ── any vs unknown ─────────────────────────────────────────────────────────────
let safeData: unknown = null;
// Use 'unknown' for data whose type you don't know yet
// Check before using:
if (typeof safeData === 'string') {
  console.log(safeData.toUpperCase()); // ✓ — narrowed to string
}

console.log(framesPerSecond, gameTitle, soundEnabled);
console.log(selectedAsteroid, lastSaveTime);
```

---

## What's Next

In **LAB 10** the simple primitives combine into something more powerful: **objects and interfaces**. An interface is TypeScript's way of describing the shape of an object — what properties it has and what types they are. You'll write interfaces for `Ship`, `Bullet`, and `Asteroid` — the three core entities from the Asteroids game — and discover how TypeScript catches bugs like accessing a property that doesn't exist, or passing a `Bullet` where a `Ship` was expected.

---

## Quick Check Answers

**1. What is the difference between `null` and `undefined`?**

`null` is a value you set deliberately — it means "I know this slot exists and I'm explicitly saying it's empty." `undefined` is what JavaScript assigns automatically to variables that have been declared but never given a value. The practical distinction: use `null` to signal intentional absence (no asteroid selected, no player name entered), and expect `undefined` when accessing array positions that don't exist or properties that were never set.

**2. If a variable could be either a number or `null`, what type annotation would you write?**

`number | null` — the `|` symbol means "or" in TypeScript's type system. This is called a **union type**, which gets a full lab in LAB 13. For now: `let lives: number | null = 3` means `lives` can hold a number or null, and TypeScript enforces that it holds nothing else.

**3. What happens if you write `let x;` with no initial value and no annotation?**

TypeScript infers `any` for `x` — which disables all type checking for that variable. In strict mode, this is flagged as an "implicit any" error: TypeScript is saying "I can't figure out what this is, and I'm not going to pretend I can." The fix is always to either provide an initial value (so inference works) or add an explicit type annotation.

---

*End of LAB 09. Next: [[LAB-10-Objects-and-Interfaces]]*
