# TypeScript — LAB 08 — What TypeScript Is & Why

**Prerequisites:** LAB 01–07 (the Asteroids series). You know: JavaScript variables, functions, objects, arrays, if statements, the game loop. You do NOT need to know TypeScript — this lab starts from zero.

**What this lab adds:**
- TypeScript installed and running — you can compile `.ts` files to `.js`
- Your first type annotation on a real variable
- Your first type error — caught before the code runs
- A mental model for what TypeScript actually does under the hood

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In LAB 04 you wrote `let bullets = []`. What is the type of `bullets`? How does JavaScript know?
> 2. If you accidentally write `ship.x = "hello"` instead of `ship.x = 300`, when does JavaScript tell you something is wrong?
> 3. What do you think "compiling" means — and why would a scripting language like JavaScript need it?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Not a game feature this time. Something more important: a **development environment** that catches your mistakes before you make them.

```
Before TypeScript:                After TypeScript:
──────────────────────────────    ──────────────────────────────
You write buggy code              You write buggy code
             ↓                                 ↓
You open the browser              TypeScript compiler reads it
             ↓                                 ↓
You play the game                 RED UNDERLINE appears in editor
             ↓                                 ↓
Something weird happens           Error: "string is not assignable
             ↓                     to type number" — line 12
You spend 30 min debugging                     ↓
                                  You fix it in 10 seconds
```

By the end of this lab: one `.ts` file, one type annotation, one intentional error caught by the compiler, and a clear understanding of why this matters.

---

## Concept: What TypeScript Is

**What it is:** TypeScript is JavaScript with an optional type system on top. You write `.ts` files instead of `.js` files. A program called the **TypeScript compiler** (`tsc`) reads your `.ts` files, checks them for type errors, and outputs plain `.js` files that browsers and Node.js can run.

**The key insight — TypeScript disappears at runtime:**
```
Your .ts file         TypeScript compiler        What runs in browser
──────────────        ───────────────────        ────────────────────
let x: number = 5;  ──────────────────────►    let x = 5;
                       (removes the `: number`
                        annotation — browsers
                        don't understand it)
```

TypeScript is a **compile-time** tool. It only runs during development. By the time your code reaches the browser, it is plain JavaScript — exactly as if you'd never used TypeScript at all.

**What it hides:**
TypeScript hides the category of bug where you pass the wrong kind of data to a function — a string where a number was expected, `null` where an object was expected, a missing property on an object. The invariant it protects: **every value in your program has a known type, and the type is checked before the code runs** — not after, not only when that code path is exercised in the browser.

**Canonical example (General Explanation):**

Imagine a recipe that asks for "2 cups of flour." In plain cooking (JavaScript), you could pour in 2 cups of sand — the recipe doesn't check. At some point during baking, something goes wrong, and you have to figure out where.

TypeScript is a recipe that checks every ingredient before you start. It says: "This step requires flour. You gave me sand. Fix it now, before you waste 2 hours of baking time."

```js
// JavaScript — no complaint here:
function moveShip(x) {
  ship.x += x; // what if x is "fast"? bug happens silently at runtime
}
moveShip("fast"); // no error — ship.x becomes NaN, which breaks everything

// TypeScript — caught immediately:
function moveShip(x: number) { // ← ": number" means "x must be a number"
  ship.x += x;
}
moveShip("fast"); // ← ERROR: Argument of type 'string' is not assignable
                  //          to parameter of type 'number'
```

**Project Application (The "Why" here):**
In the Asteroids codebase, `ship.x`, `ship.vx`, `bullet.lifetime` are all numbers. `gameState` is always one of four specific strings. `asteroid.tier` is always `'large'`, `'medium'`, or `'small'`. Right now JavaScript trusts you to keep all this straight. TypeScript enforces it.

**Why it matters here:** Every bug TypeScript catches is a bug you would have spent time finding manually in the browser. As codebases grow, this compounds — TypeScript is the single biggest productivity multiplier in professional JavaScript development.

**Watch for:** TypeScript is NOT a different programming language. It is JavaScript with annotations. Everything you learned in LABs 01–07 works in TypeScript. You are not starting over — you are adding a layer of safety to what you already know.

---

## Concept: Type Annotation

**What it is:** A label you add after a variable name — `: type` — that tells TypeScript what kind of value that variable is allowed to hold.

**The syntax:**
```ts
let variableName: typeName = value;
//              ^^^^^^^^^^
//              the annotation
```

**The problem before (no annotations — JavaScript):**
```js
let playerScore = 0;
// Is playerScore a number? A string? An object?
// JavaScript doesn't care. TypeScript can't tell without more information.
playerScore = "zero"; // JavaScript: fine. TypeScript: error.
```

**The solution:**
```ts
let playerScore: number = 0;
// TypeScript now KNOWS playerScore must always be a number.
playerScore = "zero"; // ERROR: Type 'string' is not assignable to type 'number'
playerScore = 100;    // Fine.
```

**The four primitive types you need right now:**

| Annotation | Meaning | Example value |
|---|---|---|
| `: number` | Any numeric value | `0`, `3.14`, `-1`, `NaN` |
| `: string` | Any text value | `'hello'`, `"world"`, `` `template` `` |
| `: boolean` | True or false only | `true`, `false` |
| `: void` | No value (return type for functions that return nothing) | — |

**Smallest possible example:**
```ts
let shipX: number  = 400;    // x-position must be a number
let shipName: string  = 'Player 1'; // name must be a string
let isAlive: boolean = true;  // alive-flag must be a boolean

shipX    = 300;      // ✓ — number assigned to number
shipX    = "left";   // ✗ — ERROR: string not assignable to number
isAlive  = 0;        // ✗ — ERROR: number not assignable to boolean
```

**Why it matters here:** Every variable in our game has a natural type. Annotating them makes the compiler our bug-catcher.

**Watch for:** You do NOT have to annotate every variable. TypeScript can often figure out the type from context (this is called **inference** — covered in LAB 09). Start by annotating things that are likely to be misused: function parameters and variables that start as one type and might accidentally become another.

---

## Concept: The TypeScript Compiler (`tsc`)

**What it is:** A command-line program that reads `.ts` files, checks for type errors, and outputs `.js` files. Installed via `npm` (Node Package Manager).

**What `npm` is:** `npm` — Node Package Manager — is a tool for installing JavaScript programs and libraries from the internet onto your computer. It comes bundled with Node.js.

**What Node.js is:** Node.js is a JavaScript runtime — it lets you run JavaScript programs on your computer (outside the browser). We need it only to install and run `tsc`. Our game still runs in the browser.

**The compilation step:**
```
You write:        tsc reads:        Browser runs:
main.ts    ──►    main.ts    ──►    main.js
                  (type checks)     (no types — plain JS)
```

**Why it matters here:** This is the tool that turns your annotated `.ts` files into browser-runnable `.js` files. You'll run it once now and then configure it to run automatically.

**Watch for:** If `tsc` reports errors, it still outputs the `.js` file (unless you configure it otherwise). The browser runs the output regardless. TypeScript errors are warnings about correctness — they don't prevent the code from running. This is intentional: it means you can adopt TypeScript gradually.

---

## Step 1 — Install Node.js

Node.js is required to install and run the TypeScript compiler.

**Check if you already have it:**

Open your terminal (on Mac: Terminal app. On Windows: Command Prompt or PowerShell).

```bash
node --version
```

**Expected:** Something like `v20.11.0` or `v22.3.0`. Any version 16 or higher is fine.

If you see "command not found" — download Node.js from `https://nodejs.org` and install the LTS version. After installing, close and reopen your terminal, then run `node --version` again.

### SAVE AND TRY

```bash
node --version
npm --version
```

**Expected:** Two version numbers. `npm` comes with Node.js — if `node` works, `npm` works too.

**You should see:** Something like:
```
v20.11.0
10.2.4
```

The exact numbers don't matter — just that both commands return a version, not an error.

---

## Step 2 — Create Your TypeScript Project

Create a new folder called `typescript-lab-08`. Open your terminal and navigate into it.

```bash
mkdir typescript-lab-08
cd typescript-lab-08
```

**Initialise an npm project** — this creates a `package.json` file that tracks your project's dependencies:

```bash
npm init -y
```

**`-y`** means "yes to all defaults" — skips the interactive questions and creates `package.json` with sensible defaults.

**Expected output:** Something like:
```
Wrote to /path/to/typescript-lab-08/package.json
```

**Install TypeScript:**

```bash
npm install typescript --save-dev
```

**`--save-dev`** means "this is a development tool, not part of the final product." TypeScript is never shipped to users — only the compiled `.js` output is.

**Expected output:** Several lines ending with something like:
```
added 1 package in 2s
```

### SAVE AND TRY

```bash
npx tsc --version
```

**`npx`** — Node Package Execute — runs a program from your local `node_modules` folder without installing it globally. `npx tsc` runs the TypeScript compiler that was just installed.

**Expected:** `Version 5.x.x` (the exact version number doesn't matter).

**Change something:** Run `npx tsc --help`. **Expected:** A long list of TypeScript compiler options. This confirms it's installed correctly. Press `q` or `Ctrl+C` to exit if it pauses.

---

## Step 3 — Configure TypeScript

TypeScript needs a configuration file — `tsconfig.json` — that tells it where your source files are and what version of JavaScript to output.

**Create `tsconfig.json` in your project folder:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "outDir": "./dist",
    "strict": true,
    "noEmitOnError": false
  },
  "include": ["src/**/*"]
}
```

**What each line means:**

```json
"target": "ES2020"
```
Output JavaScript that uses ES2020 syntax — supported by all modern browsers. TypeScript will compile your code to this version.

```json
"outDir": "./dist"
```
Put the compiled `.js` files in a folder called `dist` (short for "distribution"). Your `.ts` source files stay in `src`. The browser loads from `dist`.

```json
"strict": true
```
Enable all of TypeScript's strictest checks. This catches the most bugs. When you're learning, strict mode teaches you to write correct code from the start.

```json
"noEmitOnError": false
```
Still output `.js` files even when there are type errors. This lets you see the running game while you fix errors one at a time — important for incremental adoption.

```json
"include": ["src/**/*"]
```
Only compile files inside the `src` folder. `**/*` means "all files in all subfolders."

**Create the folder structure:**

```bash
mkdir src dist
```

### SAVE AND TRY

```bash
npx tsc --noEmit
```

**`--noEmit`** runs the type-checker without producing output files — useful for checking errors only.

**Expected:** No output at all. No errors means everything is configured correctly. If you see errors about `tsconfig.json`, check that the file is in the project root (not inside `src` or `dist`).

---

## Step 4 — Write Your First TypeScript File

Create **`src/main.ts`**:

```ts
// LAB 08 — First TypeScript file

// Type annotations on variables:
let playerScore: number = 0;
// playerScore must always be a number — TypeScript enforces this

let playerName: string = 'Player 1';
// playerName must always be a string

let gameActive: boolean = false;
// gameActive must always be true or false

// This is fine — number assigned to number:
playerScore = 100;

// This is fine — string assigned to string:
playerName = 'Player 2';

// Console output so we can see it ran:
console.log('Score:', playerScore);
console.log('Name:', playerName);
console.log('Active:', gameActive);
```

**Compile it:**

```bash
npx tsc
```

**Expected:** No output (silence = success). Check that `dist/main.js` was created:

```bash
ls dist/
```

**Expected:** `main.js`

**Run the compiled JavaScript:**

```bash
node dist/main.js
```

### SAVE AND TRY

**Expected output:**
```
Score: 100
Name: Player 2
Active: false
```

**In your terminal — look at what TypeScript produced:**

```bash
cat dist/main.js
```

**Expected:** Plain JavaScript with NO type annotations:
```js
"use strict";
let playerScore = 0;
let playerName = 'Player 1';
let gameActive = false;
playerScore = 100;
playerName = 'Player 2';
console.log('Score:', playerScore);
console.log('Name:', playerName);
console.log('Active:', gameActive);
```

The `: number`, `: string`, `: boolean` annotations are completely gone. The browser sees plain JavaScript.

**Change something:** Change `playerScore = 100` to `playerScore = "one hundred"`. Run `npx tsc`. **Expected:** An error message before any `.js` is produced:
```
src/main.ts:13:16 - error TS2322: Type 'string' is not assignable to type 'number'.
```
Change it back to `100` and run `npx tsc` again — clean output.

---

## Step 5 — Trigger Your First Intentional Type Error

Now we write code that is WRONG ON PURPOSE to see TypeScript catch it.

**Add this to the bottom of `src/main.ts`:**

```ts
// ── Intentional errors — TypeScript should catch these ──────────────────────

let shipX: number = 400;
// shipX: the horizontal position of the ship — must be a number

shipX = "left edge"; // ← ADD: intentionally wrong — string assigned to number
// TypeScript error expected here
```

**Run the compiler:**

```bash
npx tsc
```

### SAVE AND TRY

**Expected output:**
```
src/main.ts:XX:8 - error TS2322: Type 'string' is not assignable to type 'number'.

XX   shipX = "left edge";
             ~~~~~~~~~~~
```

**Read the error:**
- `src/main.ts:XX:8` — the file name, line number, and column number of the error
- `error TS2322` — TypeScript's internal error code (useful for searching docs)
- `Type 'string' is not assignable to type 'number'` — exactly what went wrong
- The underlined code shows which token caused it

This is the core experience of TypeScript — errors with precise locations and clear descriptions, before you even open a browser.

**In DevTools Console equivalent (terminal):**
```bash
npx tsc 2>&1 | grep "error"
```
**Expected:** One line per error. With one mistake: one line.

**Change something:** Add a second error below the first:

```ts
let isAlive: boolean = true;
isAlive = 1; // ← ADD: 1 is a number, not a boolean
```

Run `npx tsc`. **Expected:** TWO error lines — one for each mistake. TypeScript reports all errors in one pass, not just the first one. Fix both errors and run `npx tsc` again — clean.

---

## 🎯 Challenge: Type Four Game Variables

**You know:** The four primitive types (`number`, `string`, `boolean`, `void`) and how to write type annotations.

**Task:** In `src/main.ts`, declare and annotate these four variables — matching the types they'd have in the Asteroids game. Then deliberately assign the wrong type to each one and verify TypeScript catches all four errors.

```ts
// Declare and annotate these:
let bulletSpeed  = ???; // bullets travel at 8 pixels per frame
let asteroidTier = ???; // the tier name, e.g. 'large'
let canFire      = ???; // whether the player is allowed to fire right now
let lives        = ???; // how many lives the player has left
```

**Hints:**
1. What type is `8`? What type is `'large'`? What type is `true`? What type is `3`?
2. After annotating, try assigning `bulletSpeed = "fast"`, `canFire = 1`, etc. — one wrong assignment per variable.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// Correct annotations:
let bulletSpeed:  number  = 8;
let asteroidTier: string  = 'large';
let canFire:      boolean = true;
let lives:        number  = 3;

// Intentional wrong assignments — TypeScript catches all four:
bulletSpeed  = "fast";    // ERROR: string not assignable to number
asteroidTier = 42;        // ERROR: number not assignable to string
canFire      = 1;         // ERROR: number not assignable to boolean
lives        = "three";   // ERROR: string not assignable to number
```

Running `npx tsc` produces four errors — one per wrong assignment.

**Key insight:** Notice that `bulletSpeed` and `lives` are both `: number`, even though they represent very different things (pixels-per-frame vs a life count). TypeScript's primitive types describe the *structure* of a value (is it numeric?), not its *meaning* (is it a speed?). Giving meaning to numeric values is the job of variable names, comments, and — as you'll learn in LAB 10 — interfaces that group related data together.

</details>

---

## Step 6 — Set Up Watch Mode

Running `npx tsc` manually after every change is tedious. **Watch mode** recompiles automatically whenever you save a file.

**Open a second terminal window** (keep the first one available for commands). In the project folder, run:

```bash
npx tsc --watch
```

**Expected output:**
```
[HH:MM:SS AM] Starting compilation in watch mode...
[HH:MM:SS AM] Found 0 errors. Watching for file changes.
```

Now open `src/main.ts`, make any change (add a space, change a value), and save. **Expected:** Within 1–2 seconds, the terminal updates:
```
[HH:MM:SS AM] File change detected. Starting incremental compilation...
[HH:MM:SS AM] Found 0 errors. Watching for file changes.
```

If you introduce an error, the watch output shows it immediately:
```
[HH:MM:SS AM] src/main.ts:12:8 - error TS2322: Type 'string' is not assignable to type 'number'.
[HH:MM:SS AM] Found 1 error. Watching for file changes.
```

### SAVE AND TRY

With watch mode running, add this intentional error to `main.ts`:

```ts
let testVar: number = "this is wrong"; // ← ADD
```

Save the file. **Expected:** Watch mode immediately shows the error. Delete the line and save. **Expected:** Watch mode immediately shows `Found 0 errors`.

**Change something:** Try changing the type annotation itself: `let testVar: string = "this is wrong"`. Save. **Expected:** No error — now the annotation and value match.

Leave watch mode running in its terminal for the rest of this lab. Press `Ctrl+C` to stop it when you're done.

---

## Concept: Inference — TypeScript Guessing the Type

**What it is:** TypeScript's ability to figure out a variable's type automatically from its initial value, without you writing an annotation.

**The problem before (every annotation explicit):**
```ts
// This is valid TypeScript, but unnecessarily verbose:
let score: number = 0;      // TypeScript already knows 0 is a number
let name: string = 'Alice'; // TypeScript already knows 'Alice' is a string
```

**The solution — let TypeScript infer:**
```ts
let score = 0;       // TypeScript infers: number
let name  = 'Alice'; // TypeScript infers: string
let alive = true;    // TypeScript infers: boolean
// Same type safety, less typing.

score = "zero";  // still an ERROR — inference gives the same protection as annotation
```

**What it hides:**
Inference hides the need to manually annotate every single variable. The invariant: **once a variable's type is inferred from its initial value, that type is fixed** — TypeScript enforces it exactly as if you had written the annotation yourself.

**Canonical example:**
```ts
let x = 42;      // inferred: number
let y = "hello"; // inferred: string
let z = true;    // inferred: boolean

// TypeScript treats these identically to:
let x: number  = 42;
let y: string  = "hello";
let z: boolean = true;
```

**When to annotate explicitly anyway:**
- Function parameters (inference can't know what callers will pass)
- Variables that start as one type and you want to document clearly
- Variables declared without an initial value: `let score;` — TypeScript infers `any` (dangerous — covered in LAB 11)

**Project Application (The "Why" here):**
In the Asteroids game, `let bullets = []` starts empty — TypeScript can't infer what kind of things go in it. That's when explicit annotation matters most. But `const DOT_RADIUS = 12` — TypeScript correctly infers `number` and you don't need to annotate it.

**Why it matters here:** You'll use inference constantly. Annotations are for when inference can't figure it out, or when you want to document intent explicitly.

**Watch for:** `let x;` without an initial value gives `x` the type `any` — which disables type checking entirely for that variable. Always initialise variables when you declare them, or annotate explicitly if you can't.

---

## 🎯 Challenge: Inference vs Annotation

**You know:** Type inference and when to annotate explicitly.

**Task:** Look at the six variables below. For each one, decide: should you write an explicit annotation, or is inference good enough? Explain your reasoning, then write the correct TypeScript.

```ts
// Decide: annotate or let TypeScript infer?
let frameCount = 0;
let currentState; // will be set to 'playing' or 'gameOver' later
let pi = 3.14159;
let asteroidRadius; // will be set to a random number between 20 and 45
let debugMode = false;
let welcomeMessage = "Welcome to Asteroid Field";
```

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
let frameCount = 0;
// Inference: fine. TypeScript sees 0 and infers number. No annotation needed.

let currentState: string; // ← annotate: no initial value, inference gives 'any'
currentState = 'playing';
// Explicit annotation prevents the dangerous 'any' type.
// (In LAB 13 we'll narrow this further to only allow specific strings.)

let pi = 3.14159;
// Inference: fine. TypeScript sees 3.14159 and infers number.

let asteroidRadius: number; // ← annotate: no initial value
asteroidRadius = 20 + Math.random() * 25;
// Must annotate because there's no initial value TypeScript can read.

let debugMode = false;
// Inference: fine. TypeScript sees false and infers boolean.

let welcomeMessage = "Welcome to Asteroid Field";
// Inference: fine. TypeScript sees a string literal and infers string.
```

**Key insight:** The rule is simple — only annotate when TypeScript can't infer, or when you want to document intent for the next developer (often yourself, 3 months later). Every variable declared without an initial value MUST be annotated — otherwise TypeScript infers `any`, which turns off type checking for that variable and defeats the purpose of using TypeScript.

</details>

---

## Mental Model: Compile Time vs Runtime

**Name:** Compile Time vs Runtime

**Why it exists:** TypeScript operates at a completely different moment from your game code. Understanding when each thing runs prevents confusion about what TypeScript can and can't catch.

```
COMPILE TIME                    RUNTIME
(during development)            (when the player plays)
────────────────────────────    ────────────────────────────
You save main.ts                Browser loads main.js
tsc reads main.ts               JavaScript executes
tsc checks types                Functions run
tsc reports errors              Game loop ticks
tsc outputs main.js             Events fire
                                Values change

TypeScript lives HERE ──────►   TypeScript does NOT exist here
```

**A concrete example from this lab:**
- TypeScript knows that `playerScore: number` must always hold a number — it checks this at compile time.
- At runtime, `playerScore` is just a plain JavaScript variable. JavaScript doesn't know or care about the `: number` annotation — it was stripped out by `tsc`.

**What TypeScript CAN catch (compile time):**
- Wrong type assigned to a variable
- Missing property on an object
- Calling a function with wrong argument types
- Accessing a property that doesn't exist

**What TypeScript CANNOT catch (runtime only):**
- `fetch()` returning unexpected data from a server
- `Math.random()` producing a value that breaks your logic
- User input that your code doesn't handle
- Race conditions between async operations

**Where it appears again:** Every lab in this series. Whenever you see a TypeScript error, ask: "Is this a compile-time check or a runtime problem?" If TypeScript can't see it, you need a runtime check (an `if` statement, a validation function, a try/catch).

---

## Final Check

| Feature | How to verify |
|---|---|
| Node.js installed | `node --version` → a version number |
| npm installed | `npm --version` → a version number |
| TypeScript installed | `npx tsc --version` → `Version 5.x.x` |
| `tsconfig.json` correct | `npx tsc --noEmit` → no errors |
| `.ts` file compiles | `npx tsc` → `dist/main.js` created |
| Type annotations work | Add `: number` to a variable — no error |
| Wrong type caught | Assign a string to a number variable → error with line number |
| Watch mode works | `npx tsc --watch` → errors appear immediately on save |
| Compiled output is plain JS | `cat dist/main.js` → no `: number`, `: string` annotations visible |
| Inference works | Remove annotation from `let score = 0` → still caught if assigned a string |

---

## Complete `src/main.ts` Reference

```ts
// LAB 08 — What TypeScript Is & Why

// ── Explicit annotations ───────────────────────────────────────────────────────
let playerScore: number  = 0;    // must always be a number
let playerName:  string  = 'Player 1'; // must always be a string
let gameActive:  boolean = false; // must always be true or false

playerScore = 100;     // ✓ number
playerName  = 'Player 2'; // ✓ string

console.log('Score:', playerScore);
console.log('Name:', playerName);
console.log('Active:', gameActive);

// ── Game variable examples ─────────────────────────────────────────────────────
let bulletSpeed:  number  = 8;
let asteroidTier: string  = 'large';
let canFire:      boolean = true;
let lives:        number  = 3;

// ── Inference examples (no annotation needed) ──────────────────────────────────
let frameCount = 0;        // TypeScript infers: number
let debugMode  = false;    // TypeScript infers: boolean

// ── Declared without initial value (annotation required) ──────────────────────
let currentState: string;
currentState = 'playing';

let asteroidRadius: number;
asteroidRadius = 20 + Math.random() * 25;
```

---

## What's Next

In **LAB 09** you'll meet all seven primitive types TypeScript knows about — including two that trip up every beginner: `null` and `undefined`. You'll also meet `any` (TypeScript's escape hatch that you should almost never use) and learn exactly when inference is enough vs when you must annotate. The lab ends by auditing the LAB 01 constants and explaining which ones TypeScript can infer and which need help.

---

## Quick Check Answers

**1. In LAB 04, what is the type of `let bullets = []`? How does JavaScript know?**

JavaScript doesn't know — and that's the problem. `[]` is an empty array, but JavaScript doesn't track what kind of elements are supposed to go in it. You could push a number, then a string, then an object — JavaScript accepts all of it. TypeScript also struggles here: it infers `never[]` (an array that can never have elements), which means pushing anything is an error. This is exactly why LAB 11 introduces `Array<T>` — typed arrays that declare what kind of elements they hold.

**2. If you write `ship.x = "hello"`, when does JavaScript tell you?**

JavaScript never tells you directly. `ship.x` becomes the string `"hello"`. The next time code tries to do math with `ship.x` (like `ship.x += ship.vx`), the result is `NaN` (Not a Number). NaN silently propagates through every calculation — the ship disappears, nothing moves correctly, and you spend time debugging. TypeScript catches `ship.x = "hello"` at compile time, before you ever open the browser.

**3. What does "compiling" mean — and why would JavaScript need it?**

Compiling is the process of translating code written in one language (TypeScript) into another (JavaScript). JavaScript itself doesn't need compiling — browsers run it directly. But TypeScript is not JavaScript: it has syntax (like `: number`) that browsers don't understand. The TypeScript compiler (`tsc`) strips those annotations and produces plain JavaScript. The compile step is also when type-checking happens — the compiler reads your TypeScript, checks it for correctness, and only then produces output.

---

*End of LAB 08. Next: [[LAB-09-Primitive-Types-and-Inference]]*
