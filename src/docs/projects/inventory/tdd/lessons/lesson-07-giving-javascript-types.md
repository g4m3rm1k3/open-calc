# Lesson 7: Giving JavaScript Types

## What you will build

A real, second project: `cnc-web` — a TypeScript frontend built with Vite,
running on its own dev server, fetching real path data from `cnc-service`
across a real network origin boundary. It hits a real error along the
way — the browser's CORS policy blocking the request outright — and fixes
it for real, the same way Lesson 1 named this exact moment back when the
frontend was still a page Flask served itself. The transferable problem:
**plain JavaScript only checks whether your code runs — TypeScript checks
whether it's internally consistent, before it ever runs at all**, and
**a browser will not let one origin silently reach into another's
server without that server's explicit permission**, regardless of how
harmless the request actually is.

## What you need to know first

Lesson 1: `fetch`, `.then` chains, arrow functions, the DOM
(`document.getElementById`), `JSON.stringify`. Lesson 6: `/api/path` and
the shape of the data it returns (a list of `{x, y, z}` points). This
lesson doesn't change `cnc-service`'s logic at all except adding CORS
support — everything built in Lessons 1–6 keeps working exactly as before.

## Concepts cataloged from this lesson

Full standalone treatments live in `../concepts/`. Pointers to each are
also placed inline at their point of use below.

- `../concepts/npm-project-scaffolding.md`
- `../concepts/npm-package-json.md`
- `../concepts/typescript-tsconfig.md`
- `../concepts/typescript-type-annotations.md`
- `../concepts/static-vs-dynamic-typing.md`
- `../concepts/typescript-interfaces.md`
- `../concepts/typescript-array-types.md`
- `../concepts/typescript-generics.md`
- `../concepts/typescript-non-null-assertion.md`
- `../concepts/dom-query-selector.md`
- `../concepts/typescript-async-await.md`
- `../concepts/javascript-object-shorthand-property.md`
- `../concepts/cors-same-origin-policy.md`
- `../concepts/default-deny-security-pattern.md`
- `../concepts/vite-dev-server-config.md`
- `../concepts/typescript-union-types.md` — supporting concept, not
  independently a first appearance in this lesson's own walkthroughs, but
  underlies the `T | null` shape `typescript-generics.md` and
  `typescript-non-null-assertion.md` both build on here.
- `../concepts/javascript-es-modules-import-export.md` — added
  retroactively, found missing while auditing Lesson 9: `vite.config.ts`'s
  `import { defineConfig } from "vite"` / `export default
  defineConfig({...})` is this project's real first use of ES module
  syntax.
- `../concepts/retry-timeout-and-backoff.md` — added retroactively,
  found missing while cross-referencing a professional-software-
  engineering-concepts checklist: `fetchPath`'s real network call has no
  timeout or retry logic anywhere in this project.

## No pipeline diagram change

This lesson doesn't add a pipeline stage — it gives the existing `Points`
stage's output (Lesson 6) a second, real consumer (`cnc-web`) alongside
the plain-JS page `cnc-service` has served since Lesson 1. Both will keep
existing side by side for now; `cnc-web` is where real visualization
(`Picture`, the pipeline's last stage) will eventually be built.

---

## Concept Unit: A Second Real Project, Scaffolded by a Tool

*(Full standalone treatment: ../concepts/npm-project-scaffolding.md.)*

### The Problem

`cnc-service`'s frontend has been one HTML file with inline
`<script>` tags since Lesson 1 — a deliberate, named scope choice to prove
the request/response loop before adding build tooling. That choice's bill
comes due now: TypeScript files need to be *compiled* to plain JavaScript
before a browser can run them (browsers don't understand `interface`,
type annotations, or many newer JavaScript features directly), and
managing that by hand — watching files, recompiling, serving the output —
is exactly the repetitive, mechanical work a build tool exists to remove.

### Commands, Run for Real

```
npm create vite@latest cnc-web -- --template vanilla-ts
```
`npm` — the Node Package Manager, already introduced in `cnc-service`'s
own Lesson 1 for Python's `pip`; this is its JavaScript-ecosystem
counterpart, installed alongside Node.js. `create vite@latest` runs
Vite's own project-scaffolding tool (`create-vite`), fetching its latest
published version and running it immediately rather than installing it
permanently — the same "run without installing" idea Lesson 1 named for
Python's `pip`/`-m`, here spelled `npm create <name>` instead.
`-- --template vanilla-ts` passes `--template vanilla-ts` through to the
scaffolding tool itself (everything after a bare `--` is handed to the
underlying command, not consumed by `npm` itself) — `vanilla-ts` selects
the plainest possible starting point: TypeScript with no framework
(no React yet — that's a later, separate, planned lesson).

**Real output:**
```
◇  Scaffolding project in .../cam project/cnc-web...
└  Done. Now run:
  cd cnc-web
  npm install
  npm run dev
```
The scaffold produced a real `package.json`, `tsconfig.json`,
`index.html`, and a `src/` folder with demo content — **named, deliberate
choice**: the generated demo (hero images, a counter button, framework
logos) was deleted immediately, keeping only the real structural files
(`index.html`, `tsconfig.json`, `package.json`), because this curriculum
builds from the smallest real piece up, not from a vendor's marketing
starter page.

```
npm install
```
Reads `package.json`'s `devDependencies` (`vite`, `typescript`) and
downloads them into a new `node_modules/` folder — **(b) reappearing**
concept, Python's `pip install` (Lesson 1) and its JavaScript-ecosystem
counterpart, same idea, different registry (npm's, not PyPI). **Real
output:** `added 16 packages, and audited 17 packages in 4s`.

### Project Change

- **Reference Source** — none; the reference app has no build tooling
  documented in `CURRICULUM.md` beyond "it's a React app" — the specific
  choice of Vite for *this* project's early, plain-TypeScript stage is
  this project's own, named in `CURRICULUM.md`'s target architecture
  (chosen because the reference app itself is eventually React, and Vite
  is React's own recommended tool, so nothing changes tools later when
  Stage 2 begins).
- **Files affected** — new top-level directory `cnc-web/`, sibling to
  `cnc-service/`, `cnc/`, and `cnc-sim/`.
- **Change type** — add.
- **Location** — project root.
- **Dependencies** — Node.js and `npm` (verified installed: Node
  `v24.12.0`, npm `11.6.2`).

### CS Lens / SE Lens

A **scaffolding tool** generating a working starting structure, rather
than a developer hand-assembling config files from documentation, is the
same idea as Python's own project templates (`cookiecutter`, or Flask's
own minimal-app convention already followed in `cnc-service`) — a known-
good starting arrangement of files, so early mistakes are about the
*application*, not about getting a build pipeline working at all. The
real cost of scaffolding tools generally: they generate files you didn't
type yourself, which is exactly why every generated file this lesson
keeps gets its own explanation below — nothing is "just what Vite makes
you have."

---

## Concept Unit: What Two New Config Files Actually Control

### `package.json`, the Fields That Matter Here

*(Full standalone treatment: ../concepts/npm-package-json.md.)*

```json
{
  "name": "cnc-web",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "typescript": "~6.0.2",
    "vite": "^8.1.1"
  }
}
```
- `"name"`/`"version"` — identify this package; `"private": true` — **(a)
  first appearance** — tells `npm` to refuse to accidentally publish this
  project to the public npm registry (it's an application, not a library
  meant for others to install).
- `"type": "module"` — **(a) first appearance** — tells Node.js to treat
  `.js` files in this project as ECMAScript modules (`import`/`export`
  syntax) rather than Node's older `require`/`module.exports` system;
  relevant here because Vite's own config file (next unit) is a `.ts`
  file using `import`.
- `"scripts"` — **(a) first appearance** — named shortcuts run via
  `npm run <name>` (or bare `npm dev` for a script literally named
  `dev`... actually requires `npm run dev`); `"dev": "vite"` means
  `npm run dev` starts Vite's own development server.
- `"devDependencies"` — **(b) reappearing** concept, Lesson 1's
  Python `requirements.txt` distinction between what's needed to build/
  test versus what ships; **(a) new in this ecosystem**: JavaScript
  project tooling (`vite`, `typescript` itself) almost always lives here,
  since a browser never runs `vite` or `tsc` directly — only the
  *output* of a build ships.

### `tsconfig.json`, the Fields That Matter Here

*(Full standalone treatment: ../concepts/typescript-tsconfig.md.)*

```json
{
  "compilerOptions": {
    "target": "es2023",
    "module": "esnext",
    "lib": ["ES2023", "DOM"],
    "moduleResolution": "bundler",
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src"]
}
```
- **Its purpose and reader**: this file configures `tsc`, the TypeScript
  compiler, and any tool built on it (Vite's own TypeScript handling
  reads it too). Nothing else reads it.
- `"target": "es2023"` — which JavaScript language version the compiled
  output should be written in; modern browsers understand ES2023
  natively, so nothing older needs to be down-leveled.
- `"lib": ["ES2023", "DOM"]` — which built-in type definitions TypeScript
  assumes exist — `"DOM"` is what makes `document`, `fetch`, and
  `HTMLPreElement` (used later this lesson) recognized types at all;
  without it, TypeScript would report every browser API as unknown.
- `"noEmit": true` — **(a) first appearance** — tells `tsc` to only
  *check* types, never write `.js` output files; Vite itself handles the
  actual compiling-for-the-browser step, so `tsc`'s only job in this
  project is verification — exactly the role it plays in this lesson's
  concept labs below.
- `"noUnusedLocals"`/`"noUnusedParameters"` — real, opinionated checks:
  a variable or parameter declared but never used is flagged as an error,
  not just a warning — catching real, if minor, mistakes (a typo'd
  reference to the wrong name leaving the intended one unused) before
  they can hide silently in the code.
- `"include": ["src"]` — only files inside `src/` are type-checked;
  `vite.config.ts` (added later this lesson) deliberately lives outside
  `src/`, so it is *not* checked against this same set of rules — a real,
  specific reason `npx tsc --noEmit` never complains about it.

---

## Concept Unit: Type Annotations — Checked Before the Code Ever Runs

*(Full standalone treatment: ../concepts/typescript-type-annotations.md.)*

### The Problem

Nothing about plain JavaScript stops a function expecting a number from
being called with a string, an object, or nothing at all — the mistake
only surfaces (if it surfaces at all) when the wrong-shaped value hits
code that assumes something it isn't. TypeScript's whole reason to exist
is catching that class of mistake *before* the program runs, not during.

### The Concept, Isolated

```typescript
function shout(message: string): string {
    return message.toUpperCase();
}

const result: string = shout("hello");
console.log(result);
```
**Real output, run this session with `node`:**
```
HELLO
```
`message: string` and the trailing `): string` are **type annotations** —
`message` must be a `string`; the function must return a `string`.
`const result: string = ...` — a type annotation on a variable, mostly
redundant here since TypeScript would infer it anyway, shown explicitly
once to name the syntax.

**Now, the exact same shape, called wrong on purpose:**
```typescript
function shout(message: string): string {
    return message.toUpperCase();
}

const result: string = shout(42);
console.log(result);
```
**Real output — `node`, which only strips the type annotations away and
runs whatever JavaScript is left, performing no checking at all:**
```
TypeError: message.toUpperCase is not a function
    at shout (...)
```
It **crashed**, at runtime, because `42` (a number) has no
`.toUpperCase` method — the exact bug the type annotation exists to
prevent, and `node` alone did nothing to stop it; type annotations are
just comments as far as `node`'s own execution is concerned.

**The same broken file, checked by this project's real, locally-installed
compiler instead of run:**
```
npx tsc --noEmit
```
**Real output:**
```
error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
```
Caught, by name, with the exact reason, **before anything executed at
all** — this is the entire value proposition of TypeScript in one
concrete, caused-and-observed pair of results: the same mistake, one path
crashing a running program, the other rejecting it at the keyboard.

### Discard

Both `shout` examples are deleted now. They will not appear in the
project again.

### CS Lens

*(Full standalone treatment of the static/dynamic contrast:
../concepts/static-vs-dynamic-typing.md.)*

This is **static type checking** — verifying a program's internal
consistency by analyzing its source text alone, without running it —
contrasted directly with **dynamic typing**, where a value's type is only
checked (if ever) at the moment an operation actually uses it, which is
all plain JavaScript (and, differently, Python — though Python does check
types dynamically at each operation, unlike JavaScript silently coercing
many mismatches instead of erroring) ever does.

Also recognized in: every statically-typed language (Java, C#, Rust, C++,
Go), a spreadsheet program refusing to let you type text into a
column formatted as currency, and — a direct real-world parallel — a real
CNC controller's own G-code validation pass, which some real controllers
run *before* moving any axis, specifically to catch a malformed program
before it can move real, expensive machinery based on garbage input.

### SE Lens

The real, honest cost: type annotations are more to type, and TypeScript
can occasionally reject code that would have actually run fine (a
legitimate value shaped slightly differently than TypeScript expected).
The real, concrete benefit, demonstrated above rather than just claimed:
an entire class of bug is caught at the moment of writing the code,
often directly in an editor, rather than discovered live — potentially
in front of a user, potentially days later, potentially only under a rare
input. `cnc-service`'s Python side gets an analogous, though weaker,
benefit from its own request-validation code (Lesson 2's `isinstance`
checks) — those checks are hand-written and only run for the specific
cases someone thought to check; TypeScript's checking is automatic and
exhaustive across every line, for every type-annotated value, without
anyone having to remember to write a check for each one.

---

## Concept Unit: Interfaces — Naming a Shape

*(Full standalone treatment: ../concepts/typescript-interfaces.md.)*

### The Problem

`/api/path`'s response isn't a single value — it's a specific *shape*:
an object with one field, `points`, itself a list of objects each shaped
`{x, y, z}`. Nothing so far gives that shape a name TypeScript can check
values against.

### The Concept, Isolated

```typescript
interface Dog {
    name: string;
    age: number;
}

const rex: Dog = { name: "Rex", age: 3 };
console.log(rex.name, "is", rex.age, "years old");
```
**Real output:**
```
Rex is 3 years old
```
`interface Dog { ... }` declares a **named type** describing an object
shape — any value assigned to something typed `Dog` must have (at least)
a `string` `name` and a `number` `age`. Unlike Lesson 3's Python `class`
(`Parser`, `MachineState`), an `interface` has **no behavior, no methods,
no runtime existence at all** — it exists purely for `tsc` to check
against, and vanishes completely once TypeScript is compiled away; a
browser never sees `interface Dog` in any form.

**The same interface, an object missing a required field:**
```typescript
const rex: Dog = { name: "Rex" };
```
**Real `tsc` output:**
```
error TS2741: Property 'age' is missing in type '{ name: string; }' but required in type 'Dog'.
```
Caught by name — exactly which property, exactly which type it was
required by.

### Discard

The `Dog` interface and both `rex` examples are deleted now. They will
not appear in the project again.

### Project Change

- **Reference Source** — none; `interface` is a TypeScript language
  feature. The *shape itself* this lesson actually needs (`{x, y, z}`
  points, a `points` array) is real, however — it's `/api/path`'s own
  response shape, built in Lesson 6.
- **Files affected** — new `cnc-web/src/main.ts` (replacing the
  scaffold's deleted demo content).
- **Change type** — add.
- **Location** — top of `src/main.ts`.
- **Dependencies** — none.

### The New Code

```typescript
interface Point {
  x: number;
  y: number;
  z: number;
}

interface PathResponse {
  points: Point[];
}
```

### Mechanical Walkthrough
- `interface Point { x: number; y: number; z: number; }` — **(b)
  reappearing** interface syntax, applied to the exact real shape Lesson
  6's `MachineState.position()` returns.
- `interface PathResponse { points: Point[]; }` — **(a) first appearance**
- of `Point[]`: an **array type** — a list where every element must
  satisfy the `Point` interface. `PathResponse` names the *whole* real
  JSON body `/api/path` returns (`{"points": [...]}`), not just one point.
  *(Full standalone treatment: ../concepts/typescript-array-types.md.)*

---

## Concept Unit: Generics and the Non-Null Assertion

*(Full standalone treatments: ../concepts/typescript-generics.md,
../concepts/typescript-non-null-assertion.md,
../concepts/dom-query-selector.md.)*

### The Problem

`document.querySelector("#points")` could, in principle, return `null`
(the element might not exist) — and it returns a very general `Element`
type by default, not specifically "an element with a `.textContent`
you're about to set." Something needs to say "trust me, this exists, and
it's specifically this kind of element."

### The Concept, Isolated

```typescript
function findFirst<T>(items: T[]): T | null {
    return items.length > 0 ? items[0] : null;
}

const maybeName = findFirst<string>(["Alice", "Bob"]);
console.log(maybeName!.toUpperCase());
```
**Real output:**
```
ALICE
```
`<T>` after `findFirst` declares a **generic type parameter** — `T` is a
placeholder for "whatever type this gets called with," filled in at each
call site (`findFirst<string>` fixes `T` to `string` for this call).
`T | null` — **(a) first appearance** of a **union type**: the return
value is *either* a `T` *or* `null`, never guaranteed to be one
specifically. `maybeName!` — the **non-null assertion operator** — tells
TypeScript "I know this specific value can't actually be `null` here,
stop requiring me to check." `maybeName!.toUpperCase()` only compiles
because of that `!`.

**The identical call, `.toUpperCase()` without the `!`:**
```typescript
const maybeName = findFirst<string>(["Alice", "Bob"]);
console.log(maybeName.toUpperCase());
```
**Real `tsc` output:**
```
error TS18047: 'maybeName' is possibly 'null'.
```
Caught, by name — TypeScript will not let `.toUpperCase()` be called on
something it can't prove is never `null`, unless told to trust it with
`!`.

### Discard

`findFirst` and both `maybeName` examples are deleted now. They will not
appear in the project again.

### The New Code

```typescript
const pointsElement = document.querySelector<HTMLPreElement>("#points")!;
```

### Mechanical Walkthrough
- `document.querySelector<HTMLPreElement>("#points")` — **(b)
  reappearing** `document.querySelector` (functionally identical to
  Lesson 1's `getElementById`, matching any CSS selector instead of only
- an id — here, `"#points"` selects by id, same target, different
  syntax); **(a) new**: the `<HTMLPreElement>` generic argument tells
  TypeScript *which specific* element type to assume the result is,
- rather than the general `Element` it would otherwise infer — necessary
  because `.textContent` (used below) exists on the general type too,
  but this annotation is what lets more specific `<pre>`-only properties
  be used safely if ever needed later.
- The trailing `!` — **(b) reappearing**, the non-null assertion just
- proven — asserting that an element with `id="points"` really exists in
  `index.html` (it does, added this lesson), so TypeScript doesn't force
  a null-check for a case that, here, genuinely cannot happen.

### CS Lens

Generics are **parametric polymorphism** — writing one function or type
that works correctly for *any* type, without losing type information
(`findFirst<string>` is known to return `string | null`, not just
`unknown | null`) — a different mechanism from Lesson 3's Python
duck-typing (where `tokenize` works on any string with no type
declared at all, because Python never checks until runtime).

Also recognized in: Java/C#'s own generics (`List<T>`), C++ templates,
and this project's own future `Array<Point>`-shaped data appearing
throughout the eventual visualizer.

### SE Lens

The non-null assertion (`!`) is a real, deliberate escape hatch — it
tells TypeScript to stop checking, which means it can be **wrong**: if
`index.html`'s `id="points"` were ever renamed without updating
`main.ts`, `querySelector` would return `null` at runtime, `!` would have
silently promised otherwise, and the *next* line
(`pointsElement.textContent = ...`) would throw a real runtime error —
exactly the class of bug type-checking exists to prevent, reintroduced on
purpose by asserting past it. Used here because the id is hardcoded in
the very same lesson, in a file this project fully controls — a real,
bounded case where the assertion is genuinely safe, not a habit to reach
for by default.

---

## Concept Unit: `async`/`await` — Sequential-Looking Code That Isn't Blocking

*(Full standalone treatment: ../concepts/typescript-async-await.md.)*

### The Problem

`cnc-service`'s own frontend (Lessons 1–6) has used `.then()` chains for
every asynchronous operation, a deliberate scope choice named back in
Lesson 1. `async`/`await` is an alternative syntax for the exact same
underlying mechanism (Promises), written to *read* like ordinary,
top-to-bottom sequential code.

### The Concept, Isolated

```typescript
function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run(): Promise<void> {
    console.log("start");
    await delay(100);
    console.log("after delay");
}

run();
console.log("this runs before the delay finishes");
```
**Real output, run this session:**
```
start
this runs before the delay finishes
after delay
```
**What this proves:** `"start"` prints immediately when `run()` is
called. `await delay(100)` pauses *only the inside of `run`* until the
100ms Promise resolves — it does **not** pause the rest of the program,
proven by `"this runs before the delay finishes"` printing *before*
`"after delay"`, even though it's the *last* line of the script textually.
`async function run(): Promise<void>` — **(a) first appearance** — the
`async` keyword marks a function as one that can use `await` inside it,
and makes it always return a `Promise` itself (here, one that resolves to
`void` — nothing meaningful, once its body finishes). `await` — **(a)
first appearance** — pauses execution *of that function only* until the
Promise to its right resolves, then continues with the resolved value
(unused here, since `delay` resolves to nothing).

### Discard

`delay`/`run` are deleted now. They will not appear in the project again.

### Project Change

- **Reference Source** — none; this is JavaScript/TypeScript language
  syntax, an alternative to the `.then()` chains already covering the
  same mechanism since Lesson 1.
- **Files affected** — `cnc-web/src/main.ts`.
- **Change type** — add.
- **Location** — below the two interfaces.
- **Dependencies** — the `Point`/`PathResponse` interfaces, above.

### The New Code

```typescript
async function fetchPath(program: string): Promise<Point[]> {
  const response = await fetch("http://127.0.0.1:5000/api/path", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ program }),
  });
  const data: PathResponse = await response.json();
  return data.points;
}
```

### The Updated Project

The complete, new `cnc-web/src/main.ts` at this point in the lesson:
```typescript
interface Point {
  x: number;
  y: number;
  z: number;
}

interface PathResponse {
  points: Point[];
}

async function fetchPath(program: string): Promise<Point[]> {
  const response = await fetch("http://127.0.0.1:5000/api/path", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ program }),
  });
  const data: PathResponse = await response.json();
  return data.points;
}

const program = "G0 X10 Y20\nX30\nG1 Z-5 F100";
const pointsElement = document.querySelector<HTMLPreElement>("#points")!;

fetchPath(program).then((points) => {
  pointsElement.textContent = JSON.stringify(points, null, 2);
});
```
As a whole: `fetchPath` reads like ordinary sequential code — "fetch,
then get the JSON, then return the points" — even though every one of
those steps is genuinely asynchronous; calling it (bottom of the file)
still uses `.then()`, since the *caller* isn't itself an `async`
function here — both styles interoperate freely.

### Mechanical Walkthrough
- `async function fetchPath(program: string): Promise<Point[]>` — **(b)
- reappearing** `async`, just proven; `Promise<Point[]>` — **(a) first
  appearance** of a **generic type applied to a built-in type**: `Promise`
  itself takes a type parameter describing what it eventually resolves
- to — here, an array of `Point`.
- `const response = await fetch(...)` — **(b) reappearing** `fetch`
- (Lesson 1) and its options object (`method`, `headers`, `body` —
  Lesson 2's `POST`-with-JSON-body pattern), now awaited instead of
  chained with `.then`.
  *(Added retroactively, found missing while cross-referencing a real
  "what every professional developer should know" checklist: this real
  network call has zero timeout and zero retry logic — a genuinely
  honest, still-open gap, not yet closed anywhere in this project. Full
  standalone treatment: ../concepts/retry-timeout-and-backoff.md.)*
- `{ program }` — **(a) first appearance** of
  **object shorthand property syntax**: equivalent to `{ program:
  program }`, using the variable's own name as the key when they match.
  *(Full standalone treatment: ../concepts/javascript-object-shorthand-property.md.)*
- `const data: PathResponse = await response.json();` — **(b)
  reappearing** `.json()` (Lesson 1); **(a) new**: the explicit
  `PathResponse` type annotation tells TypeScript to trust that the
  parsed JSON really has this shape — TypeScript cannot verify this on
  its own (the data is coming from a real network response, outside its
  analysis), which is a real, named limit worth stating honestly: nothing
  stops the *actual* JSON from having a different shape than claimed
  here; that mismatch would only surface at runtime, the same as
  plain JavaScript, this specific line being the one place this file
  trusts an external claim rather than checking it.
- `return data.points;` — already-known basic property access, now typed:
  TypeScript knows `data.points` is `Point[]`, specifically, because
  `PathResponse` said so.
- `fetchPath(program).then((points) => { ... })` — **(c) already
  established** `.then()` (Lesson 1), called on the `Promise<Point[]>`
  `fetchPath` returns; `points` inside the callback is correctly typed as
- `Point[]`, inferred from `fetchPath`'s own declared return type — no
  annotation needed here, TypeScript already knows.

### CS Lens

`async`/`await` is **syntactic sugar** over the exact same Promise
mechanism `.then()` chains use — the CS lens already covered in
`cnc-service`'s own Lesson 6 async note doesn't need repeating in full;
what's new here is the *syntax*, not the underlying model. The two are
interchangeable; this project uses both deliberately, in different
files, so both are genuinely familiar by the time a real codebase (which
will inevitably mix styles across files written at different times) is
read.

### SE Lens

`.then()` chains scale awkwardly once several asynchronous steps depend
on each other in sequence (each new step nests another `.then`, or
requires returning a Promise from inside a Promise callback);
`async`/`await` reads top-to-bottom regardless of how many sequential
steps exist, at the real cost of needing the calling context to also be
`async` (or, as here, to fall back to `.then()` at the boundary where a
non-`async` context calls in). This project's own `cnc-service` page
stays on `.then()` deliberately (per Lesson 1's own named scope decision)
rather than being retrofitted — both are correct, and this lesson is
where the *reason* to prefer `async`/`await` for anything more than one
step becomes concrete, not just asserted.

---

## Concept Unit: A Server on One Origin Reaching Another, and the Browser Saying No

*(Full standalone treatment: ../concepts/cors-same-origin-policy.md.)*

### The Problem

`cnc-web` runs on its own dev server (Vite), on its own port — a genuinely
different **origin** from `cnc-service` (Flask, port `5000`), even though
both run on the same machine. `cnc-service`'s own page (Lessons 1–6) never
hit this, because it fetched from *itself* — same origin, always allowed.

### Caused for Real, This Session

```
npm run dev
```
started Vite; the browser loaded `cnc-web`'s page and ran `fetchPath`,
which called `cnc-service`'s real `/api/path`. **Real browser console
output, captured live via Playwright, this session:**
```
Access to fetch at 'http://127.0.0.1:5000/api/path' from origin 'http://localhost:5180' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
Failed to load resource: net::ERR_FAILED
```
And the page itself showed exactly what Lesson 1's own "What Breaks
Without This" pattern would predict: the `<pre id="points">` element
still read `"loading..."` — the fetch never resolved successfully, so
the `.then` callback that would have replaced it never ran.

**What this proves, precisely:** `127.0.0.1:5000` and `localhost:5180`
are, to a browser, two different **origins** — even on the same machine,
even both being `localhost`-ish addresses — because an origin is defined
by the exact combination of scheme (`http`), hostname, *and* port, and
`5000` ≠ `5180`. **CORS** (Cross-Origin Resource Sharing) is the real
browser security mechanism this is: by default, a script from one origin
cannot read a response from a different origin, specifically to stop a
malicious page from silently reading data out of, say, your bank's site
just because your browser happens to be logged into it there too. The
server on the *other* side has to explicitly opt in, via a response
header, before the browser will release the response to the requesting
page's own JavaScript.

### The Fix, Real, Verified

```
.\.venv\Scripts\python.exe -m pip install flask-cors
```
**Real output (abridged):** `Successfully installed flask-cors-6.0.5`.

### Project Change

- **Reference Source** — none; CORS configuration is infrastructure, not
  ported logic. The *need* for it is a direct, real consequence of
  `CURRICULUM.md`'s own architecture decision (a real backend the
  reference app never had) meeting a real second dev server.
- **Files affected** — `cnc-service/app.py` (modified); `cnc-web/
  vite.config.ts` (new).
- **Change type** — add (CORS) / add (a config file that didn't exist,
  since the scaffold left the port to Vite's own default).
- **Location** — `app.py`, immediately after `app = Flask(__name__)`.
- **Dependencies** — `flask-cors`, added to `requirements.txt`.

### The New Code

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:5180"])
```
```typescript
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5180,
    strictPort: true,
  },
});
```
*(`import { defineConfig } from "vite"` / `export default defineConfig({...})`
— added retroactively, found missing while auditing Lesson 9: this is this
project's real first use of JavaScript/TypeScript's ES module `import`/
`export` syntax. Full standalone treatment:
../concepts/javascript-es-modules-import-export.md.)*

### Mechanical Walkthrough
- `from flask_cors import CORS` / `CORS(app, origins=[...])` — **(a)
  first appearance.** `flask_cors` is a real, third-party Flask extension
  (installed via `pip`, same as `flask` itself); calling `CORS(app,
  ...)` wraps every route on `app` so its responses include the
  `Access-Control-Allow-Origin` header the browser was missing.
- `origins=["http://localhost:5180"]` — **(a) a deliberate, named
  choice**: allowing *only* this one, specific origin, rather than `"*"`
  (allow literally anyone) — the narrower, real-world-appropriate option,
  since this backend will eventually hold real data (Lesson 10 onward)
  that no arbitrary website should be able to read just by asking.
- `vite.config.ts`'s `server.port: 5180` / `strictPort: true` — **(a)
  first appearance** of Vite's own config file.
  *(Full standalone treatment: ../concepts/vite-dev-server-config.md.)*
  A real, direct echo of
  this project's already-established "fail loudly, don't drift" principle
  (Lesson 4's `UnsupportedCodeError` is the same instinct, applied to
  code instead of tooling): `strictPort: true` makes Vite **refuse to
  start** rather than silently picking a different port if `5180` is
  already busy — real, observed necessity this session, since ports
  `5173` and `5174` (Vite's own defaults) were already in use by
  something else on this machine, and a silently-different port here
  would have meant `CORS(app, origins=[...])`'s hardcoded allow-list
  quietly stops matching, reintroducing this exact failure with no
  obvious cause.

### CS Lens

*(Full standalone treatment of default-deny:
../concepts/default-deny-security-pattern.md.)*

CORS is the browser enforcing a **same-origin policy** by default and
requiring an explicit, opt-in exception — the general security pattern
of **default-deny**: nothing is permitted unless something specifically
allows it, rather than permitted unless specifically forbidden.

Also recognized in: firewall rules (default-deny is the standard,
recommended posture), file permission systems, and this project's own
`core/parser.py` (Lesson 4) — `UnsupportedCodeError` rejecting anything
not explicitly recognized is the identical default-deny instinct, applied
to G-code instead of network origins.

### SE Lens

The real alternative to real CORS configuration — serving `cnc-web`'s
built files *from* Flask itself, as `cnc-service`'s own page already does
since Lesson 1 — would sidestep this problem entirely by making
everything same-origin, permanently. It's rejected for this project's
frontend going forward specifically because Vite's dev server provides
hot module reloading and fast rebuilds during development that serving
static built files can't — a real, deliberate tradeoff: a small amount of
cross-origin configuration complexity now, in exchange for a much faster
edit-refresh loop for every lesson after this one.

### Commands and Real Output — Verified Live, End to End

Both servers restarted; a real headless browser (Playwright, this
session) loaded `cnc-web`'s actual page:
```
POINTS ELEMENT TEXT: [
  { "x": 0, "y": 0, "z": 0 },
  { "x": 10, "y": 20, "z": 0 },
  { "x": 30, "y": 20, "z": 0 },
  { "x": 30, "y": 20, "z": -5 }
]
```
The exact same four points Lesson 6 produced, now fetched across a real
network origin boundary, through a real browser, with the CORS error
gone. `cnc-service`'s own page (`http://127.0.0.1:5000/`) was re-checked
too — all five existing routes still work unchanged; `CORS(app,
origins=[...])` only adds a header to responses, it doesn't restrict who
Flask itself will *compute* an answer for.

---

## Connect the Pieces

1. `npm run dev` starts Vite on the fixed, real port `5180`.
2. The browser loads `cnc-web`'s `index.html`, which loads
   `src/main.ts` (compiled on the fly by Vite).
3. `fetchPath("G0 X10 Y20\nX30\nG1 Z-5 F100")` runs: `await fetch(...)`
   sends a real cross-origin `POST` to `cnc-service`'s `/api/path`
   (Lesson 6, unchanged).
4. Because `CORS(app, origins=["http://localhost:5180"])` is now
   configured, Flask's response includes the header the browser requires;
   the response is released to `main.ts` instead of being blocked.
5. `await response.json()`, typed as `PathResponse`, `return
   data.points` — the same four real points Lesson 6 computed.
6. `.then((points) => { pointsElement.textContent = ... })` writes them,
   real and verified, into the page.

## What Breaks Without This

Already demonstrated in full, live, this lesson: with `CORS(app, ...)`
temporarily absent, the exact console error above was captured, and the
page silently stayed on `"loading..."` forever — no crash, no visible
error on the page itself, just a request that never completes. Restored
immediately after confirming it.

## Exercises

1. Change `vite.config.ts`'s `origins` port back to something wrong (say,
   `5181`) without changing the actual running port, restart Flask, and
   reproduce the real CORS error yourself.
2. In `main.ts`, remove the `!` from `document.querySelector<
   HTMLPreElement>("#points")!` and run `npx tsc --noEmit`. Read the real
   error and explain, in your own words, what specific risk it's
   protecting against here even though (as this lesson names honestly)
   the risk can't actually occur in this exact file.
3. Change `fetchPath`'s declared return type to `Promise<string>` (wrong
   on purpose) and run `npx tsc --noEmit`. Read the real error TypeScript
   produces and explain why it disagrees with the function's actual
   `return data.points;` line.

## Definition of Done

- [ ] `cnc-web/` exists, scaffolded via Vite, demo content removed.
- [ ] `npx tsc --noEmit` (run from inside `cnc-web/`) passes with no
      errors on the real `main.ts`.
- [ ] `npm run dev` starts Vite on port `5180` with no port conflict.
- [ ] Opening `http://localhost:5180/` in your own browser (with
      `cnc-service` also running) shows real path data, not
      "loading...".
- [ ] You reproduced the real CORS error yourself (Exercise 1) and
      understood why it happened and how the fix addresses it.
- [ ] You completed Exercises 2–3 and read the real `tsc` errors they
      produce.
- [ ] `cnc-service`'s five existing routes (Lessons 1–6) still work
      unchanged.
- [ ] A git commit exists explaining *why* (a real, second, properly-
      tooled frontend now exists, TypeScript's compile-time checking
      demonstrated concretely rather than just described, and a real
      cross-origin request working end to end for the first time).
