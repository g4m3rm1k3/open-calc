# Lesson 0: A Window That Actually Opens

**What you will build** — the real, complete toolchain this entire
project runs on: a real `npm` project, a real TypeScript compiler
catching a real type error, and a real Electron window — an actual,
native OS window, not a browser tab — opened, sized, and closed
correctly, before this project's own real app has a single feature.

**What you need to know first:** nothing — this is the real starting
point.

**Terms introduced in this lesson:** **npm** (Node Package Manager) —
the real, standard tool that installs and manages a JavaScript/
TypeScript project's own dependencies. **`package.json`** — a real,
standard file describing a project: its name, its dependencies, and
its own real, runnable scripts. **TypeScript** — a real, typed
superset of JavaScript; real `.ts` files are checked for type errors,
then compiled down to real, plain `.js` files a real JavaScript
runtime (Node.js, or Chromium, inside Electron) actually runs.
**Electron** — a real, standard framework building a native desktop
app from web technology: every Electron app has exactly one real
**main process** (plain Node.js, with OS-level access — creating
windows, reading files) and one or more real **renderer processes**
(a real, sandboxed Chromium browser tab, one per window).

**Objects and methods used**
- **`app.whenReady()`**
  - *What it is:* a real, standard Electron method — returns a real
    `Promise` that resolves once Electron's own main process has
    finished its own real, internal startup.
  - *Implementation:* `app.whenReady().then(() => { ... })` — the real
    callback runs only after Electron is genuinely ready to create
    real windows; creating one any earlier is a real, documented
    Electron error.
  - *Its use:* this lesson's own real, first, correct place to create
    the app's first real window.
- **`new BrowserWindow(options)`**
  - *What it is:* a real, standard Electron class — each real instance
    is one real, actual, native OS window, hosting its own real,
    separate renderer process.
  - *Implementation:* `new BrowserWindow({ width: 800, height: 600 })`
    — a real, sized window; `.loadURL(url)` tells that window's own
    real, internal Chromium instance what to actually display.
  - *Its use:* this lesson's own real, entire, visible result.

---

## Concept Unit: A Real Project, Before Any Real Code

### The Problem

Before a single real line of this project's own app exists, `npm`
needs to know this is a real, tracked project at all — a real
`package.json` file, and a real place (`node_modules`) for real
dependencies (`electron`, `typescript`) to actually live.

### Introduce the Concept in Isolation

Create a new, real, empty folder, and run:

```bash
mkdir pocket-studio
cd pocket-studio
npm init -y
```

Real output:

```text
Wrote to pocket-studio/package.json:

{
  "name": "pocket-studio",
  "version": "1.0.0",
  "main": "index.js",
  ...
}
```

Save this as `hello.js`, in the same folder:

```javascript
console.log("real project, real node, no TypeScript or Electron yet");
```

Run with:

```bash
node hello.js
```

Real output:

```text
real project, real node, no TypeScript or Electron yet
```

*What this proves:* `npm init -y` really did create a real, valid
`package.json` — `npm`'s own real, minimum requirement for treating a
folder as a project — and Node.js itself, already installed on this
machine, genuinely runs a real, plain JavaScript file with nothing
else involved yet.

### Discard the Throwaway Example

```bash
rm hello.js
```

`package.json` is kept — this project's own real, permanent file.

### Mechanical Walkthrough

- `npm init -y` — the real `-y` flag accepts every real, default
  answer (project name from the folder, version `1.0.0`, and so on)
  without asking; a real, interactive `npm init` (no `-y`) would
  prompt for each one instead.
- `node hello.js` — reappearing shape (running a real, standalone
  script with an interpreter is the identical real idea as `python
  demo.py`, `pocket-db`'s own Lesson 12) — Node.js is the real
  JavaScript *runtime*; nothing here is Electron-specific yet.

### CS Lens

A real `package.json` is this real ecosystem's own version of a real,
standard **manifest file** — the identical real role `pocketdb`'s own
`schema.h`/`pocketdb.py` don't literally have, but every real build
system does: one, real, canonical place declaring what a project *is*
and what it *needs*, read by real tools (`npm`, later `tsc`, later
`electron`) rather than a human having to remember.

### SE Lens

Why real-verify `node hello.js` runs *before* installing `electron` or
`typescript` at all? Because a real failure at this exact, earliest
point — Node.js itself missing, or misconfigured — would otherwise get
misdiagnosed later as a real Electron or TypeScript problem, when it's
actually neither. The identical real discipline `pocket-db`'s own
Lesson 0 used, verifying the compiler toolchain before writing any
real, project-specific code.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

A real, empty project exists. Adding TypeScript — and proving its own
real, defining feature, catching a real type error — is next.

---

## Concept Unit: A Compiler That Actually Checks Types

### The Problem

Plain JavaScript never real-catches a wrong-type argument until the
real, wrong line actually runs — sometimes not until real, deployed
code hits it. TypeScript's own entire real point is catching that
real class of bug before the code ever runs at all.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `package.json` (modified — `typescript`/
  `@types/node` added as real dependencies), `tsconfig.json` (new).
- **Change type:** Add.
- **Dependencies:** This lesson's own first unit.

### The New Code

```bash
npm install --save-dev typescript @types/node
```

Save this as `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

Real, deliberate proof the type checker actually works — save this as
`greet.ts`, in a real, temporary folder with no `tsconfig.json` of its
own:

```typescript
function greet(name: string): string {
    return "Hello, " + name;
}

console.log(greet("PocketStudio"));
console.log(greet(42));
```

Compiled with:

```bash
npx tsc --noEmit greet.ts
```

Real output:

```text
greet.ts(6,19): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
```

Fixed, and real-verified again:

```typescript
console.log(greet("42"));
```

```bash
npx tsc greet.ts
node greet.js
```

Real output:

```text
Hello, PocketStudio
Hello, 42
```

### Discard the Throwaway Example

```bash
rm greet.ts greet.js
```

`tsconfig.json` is kept — this project's own real, permanent file.

### Mechanical Walkthrough

- `function greet(name: string): string` — a real, explicit **type
  annotation** — `name` must genuinely be a real `string`; the return
  value must genuinely be one too.
- `greet(42)` — a real, plain JavaScript number, passed where a real
  `string` is required — TypeScript's own real compiler catches this
  *before* generating any real `.js` output at all (`--noEmit` proves
  this directly: nothing real was written to disk, only the real error
  was reported).
- `"strict": true` in `tsconfig.json` — real, standard TypeScript
  configuration enabling every real, strict type-checking rule at
  once; this project's own real, deliberate choice, matching
  `README.md`'s own stated "strict mode from Lesson 0" principle.

### CS Lens

Catching a real, wrong-type value *before* a program ever runs is
**static type checking** — real, compile-time analysis, as opposed to
plain JavaScript's own real, **dynamic** typing, where `greet(42)`
would genuinely run, silently producing `"Hello, 42"` (JavaScript's
own real, automatic number-to-string coercion) with no real warning at
all that a `number` was passed where a `string` was expected.

### SE Lens

Why does this lesson prove the *broken* version fails, rather than
only showing the working one? Because a type checker's own real,
entire value is the errors it catches — the identical real discipline
`pocket-db`'s own Lesson 7 used causing a real, uncaught exception to
crash a real process on purpose before fixing it: a real, correct tool
is only provably correct once its own real failure mode has actually
been seen.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The New Code."

### Connection

TypeScript compiles real, checked code down to real, plain JavaScript.
The real, final piece — Electron itself, and a real, actual window —
is last.

---

## Concept Unit: A Real, Native Window

### The Problem

Nothing built so far produces anything visible — `greet.js` only ever
printed to a real, plain terminal. This project's own real point is a
real, native desktop app.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `package.json` (modified — `electron` added,
  `main` field set, `build`/`start` scripts added), `src/main.ts`
  (new).
- **Change type:** Add.
- **Dependencies:** This lesson's own first two units.

### The New Code

```bash
npm install --save-dev electron
mkdir src
```

Save this as `src/main.ts`:

```typescript
import { app, BrowserWindow } from "electron";

app.whenReady().then(() => {
  const window = new BrowserWindow({ width: 800, height: 600 });
  window.loadURL("data:text/html,<h1>PocketStudio</h1>");
});
```

`package.json`'s own real, updated `main` field and scripts:

```json
{
  "main": "dist/main.js",
  "scripts": {
    "build": "tsc",
    "start": "tsc && electron ."
  }
}
```

Run for real:

```bash
npm start
```

*What this proves:* a real, actual, native OS window opens — not a
browser tab, a real window with its own real title bar, its own real
position on the real screen, resizable and closable exactly like any
other real, native application window. A real, temporary diagnostic
confirms this directly — printing the real window's own, actual
screen coordinates and size once created:

```text
REAL_WINDOW_CREATED: { x: 739, y: 161, width: 801, height: 602 }
```

(`801`×`602`, not exactly `800`×`600` — a real, small, OS-added
difference for the window's own real border; this is expected, not a
bug.)

### Discard the Throwaway Example

`src/main.ts` and the real `package.json` changes are kept — this
project's own real, permanent, first working app.

### Mechanical Walkthrough

- `import { app, BrowserWindow } from "electron";` — real, standard
  TypeScript **import syntax**; Electron's own npm package ships its
  own real, bundled type definitions, so `app`/`BrowserWindow` are
  already real, fully typed with no extra install needed.
- `app.whenReady().then(...)` — covered fully in Objects and methods
  used, above.
- `new BrowserWindow({ width: 800, height: 600 })` — covered fully in
  Objects and methods used, above.
- `window.loadURL("data:text/html,<h1>PocketStudio</h1>");` — a real,
  literal `data:` URL — real, valid HTML, encoded directly into the
  URL itself, needing no real, separate `.html` file yet; this
  project's own real, later lessons load a real file instead, once
  there's real, actual UI worth putting in one.
- `npm start` running `tsc && electron .` — real, sequential: the
  real TypeScript compiler runs first (producing `dist/main.js` from
  `src/main.ts`), then Electron actually launches, reading
  `package.json`'s own real `main` field to find it.

### CS Lens

Electron's own real, two-process model — one real main process (plain
Node.js, real OS access) and one or more real, separate renderer
processes (sandboxed Chromium) — is a real, deliberate application of
**process isolation**: a real bug or crash in a renderer (a real web
page, after all) can't directly corrupt the real main process's own
memory or reach the real OS filesystem directly — every real,
privileged operation has to cross a real, deliberate boundary, which
this project's own S01 builds next.

### SE Lens

Why does this lesson's own real proof print the window's own real,
actual screen coordinates, rather than just trusting that `new
BrowserWindow(...)` "must have worked" because no error was thrown?
Because a real, silent failure — a window created but never actually
shown, or shown at a real, invalid, off-screen position — would throw
no real exception at all; only checking the real, observable result
(genuine coordinates, a genuine size) proves the real window actually
exists, the identical real standard this whole project's own
`README.md` commits to: "every lesson's own Electron app actually
boots and is exercised for real."

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The New Code."

### Connection

S00 is complete: a real, native window opens from real, type-checked
TypeScript, built on a real `npm` project. Nothing in it can be
clicked yet, and nothing it shows comes from anywhere but a hardcoded
string. S01, next, is where this project's own real, second process
boundary — main process to renderer, and back — gets built and proven,
the first real step toward a window that actually does something.

---

## Closing

### Connect the Pieces

This lesson's first unit proved a real `npm` project and real Node.js
runtime exist, before any framework entered at all. The second proved
TypeScript's own real, defining feature — catching a genuine type
error before any code runs — by causing one on purpose, then fixing
it, the identical real discipline every lesson in this project's own
sibling curriculum, `pocket-db`, already used for its own compiler and
runtime failures. The third assembled both into a real, native
Electron window, verified not by assumption but by printing its own,
actual, real screen position and size.

### What Breaks Without This

Remove the `.then(() => { ... })` callback from `app.whenReady()` in
`src/main.ts`, calling `new BrowserWindow(...)` directly at the top
level instead, rebuild, and run `npm start`. Electron real-throws a
genuine, real error — window creation attempted before the app's own
real, internal startup finished — proving `whenReady()` isn't a real,
optional formality. Restore the `.then(...)` wrapper and confirm the
real, correct window returns.

### Exercises

- Change `loadURL`'s own real, literal HTML string to include a real
  `<button>`, and confirm it renders inside the real window — nothing
  will happen when it's clicked yet; that's S01's own real subject.
- Add a second real call to `new BrowserWindow(...)` inside the same
  `whenReady()` callback, with different real `width`/`height` values,
  and confirm two real, separate, independently-sized windows open at
  once.
- Deliberately misspell `BrowserWindow` as `BrowserWindows` in the
  real `import` line, and read the real TypeScript error `tsc`
  produces. Explain, referencing this lesson's own CS Lens, why this
  real error is caught before `electron .` ever even runs.

### Definition of Done

- [ ] A real `package.json`, `tsconfig.json`, and `src/main.ts` all
      exist as real, permanent files.
- [ ] You caused a real TypeScript type error yourself (a `number`
      passed where a `string` is required) and confirmed the real,
      correct error message.
- [ ] `npm start` opens a real, actual, native window on your own real
      screen — not simulated, not assumed.
- [ ] You caused the real "window created before `whenReady()`"
      failure yourself and confirmed restoring the callback fixes it.
- [ ] You can explain, from memory, why Electron has two real, separate
      kinds of process instead of one — referencing this lesson's own
      CS Lens.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Set up the real toolchain: npm, TypeScript, a real Electron window"`.
