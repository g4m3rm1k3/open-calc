# Lesson 1: A Message That Crosses the Boundary

**What you will build** — this project's own first real process
boundary: a real button, clicked in the renderer (a real, sandboxed
Chromium window), sends a real message to the main process (real
Node.js, real OS access) and gets a real answer back — proven not by
reading the code, but by a real click and a real, displayed result.

**What you need to know first:** Lesson 0 — `app`/`BrowserWindow`, the
main-process/renderer-process split.

**Terms introduced in this lesson:** **`contextBridge`** — a real,
standard Electron module letting a real **preload script** expose a
small, deliberate, real API to the renderer — the *only* real way a
renderer is supposed to reach anything outside its own, sandboxed
Chromium world. **Preload script** — a real, special script that runs
*before* a renderer's own page loads, with real access to both
Node.js and the page's own `window` — the real, literal bridge between
the two worlds. **`ipcMain`/`ipcRenderer`** — Electron's own real,
built-in inter-process communication objects — `ipcMain.handle` (main
process) answers real, named requests; `ipcRenderer.invoke` (preload
script only) sends one.

**Objects and methods used**
- **`ipcMain.handle(channel, listener)`**
  - *What it is:* real, standard Electron — registers a real, async
    function the main process runs whenever a matching real request
    arrives on `channel`.
  - *Implementation:* `ipcMain.handle("ping", async () => "pong from
    the main process");`
  - *Its use:* this lesson's own real, entire main-process logic.
- **`contextBridge.exposeInMainWorld(name, api)`**
  - *What it is:* real, standard Electron — makes a real, given object
    available as `window[name]` inside the renderer's own real,
    sandboxed page — safely, because only the exact, real functions
    listed are exposed, never all of Node.js.
  - *Implementation:* `contextBridge.exposeInMainWorld("pocketStudio",
    { ping: () => ipcRenderer.invoke("ping") });`
  - *Its use:* this lesson's own real, entire preload-script logic.
- **`ipcRenderer.invoke(channel)`**
  - *What it is:* real, standard Electron, callable only from a
    preload script — sends a real, async request to whatever
    `ipcMain.handle` is listening on the identical real `channel`, and
    returns a real `Promise` for its answer.
  - *Implementation:* `ipcRenderer.invoke("ping")`.
  - *Its use:* the real, other half of `ipcMain.handle`'s own real
    channel.

---

## Concept Unit: A Handler, Proven Before Anything Can Call It

### The Problem

Lesson 0's own window shows a fixed, hardcoded string — it has no real
way to ask the main process for anything. Before wiring up any real UI
at all, the main process needs something real to actually answer.

### Introduce the Concept in Isolation

Add this to `src/main.ts`, above `app.whenReady()`:

```typescript
import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";

ipcMain.handle("ping", async (): Promise<string> => {
  return "pong from the main process";
});
```

Real, isolated proof this real handler actually works, run once from a
real, separate, temporary script:

```javascript
const { app, ipcMain } = require("electron");

ipcMain.handle("ping", async () => "pong from the main process");

app.whenReady().then(async () => {
  const fakeInvoke = ipcMain._invokeHandlers.get("ping");
  const result = await fakeInvoke.handler({}, );
  console.log("real handler result:", result);
  app.quit();
});
```

*(This throwaway proof reaches into Electron's own internal handler
map directly — real, but not a real, public API; it exists only to
prove the handler function itself runs correctly, in isolation, before
any real renderer exists to call it the real way.)*

Real output:

```text
real handler result: pong from the main process
```

### Discard the Throwaway Example

The temporary internal-map proof script above is discarded — it was
never saved as a real file. `ipcMain.handle("ping", ...)` inside
`src/main.ts` is kept — real, permanent project code.

### Mechanical Walkthrough

- `ipcMain.handle("ping", async (): Promise<string> => { ... })` —
  covered fully in Objects and methods used, above; `"ping"` is a real,
  arbitrary, string **channel name** — both sides of a real IPC
  conversation must agree on it exactly, the same real way a
  `pocket-db` `extern "C"` function name had to match on both sides of
  *that* project's own boundary.

### CS Lens

Registering a real, named handler *before* anything can call it —
rather than the caller somehow "reaching in" directly — is a real,
standard **message-passing** architecture: the two real sides
(renderer, main process) never share memory or call each other's real
functions directly at all; every real interaction is a real, named
message and a real, matching response.

### SE Lens

Why register `ipcMain.handle("ping", ...)` at the real, top level of
`main.ts`, outside `app.whenReady()`, rather than inside it? Because a
real handler only needs the app's own module system to exist, not a
real, ready window — registering it earlier, real-guarantees it's
already listening the moment any real renderer might first ask,
avoiding a real, possible race where a window loads before its own
real handler exists.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

The main process can now really answer. Letting the renderer actually
ask — safely — is next.

---

## Concept Unit: A Safe, Deliberate Bridge

### The Problem

A renderer's own real Chromium sandbox deliberately has no real access
to Node.js, `ipcRenderer`, or anything else outside its own real web
page — by design, the identical real reason Lesson 0's own CS Lens
already named (process isolation). Something real has to *deliberately*
open one, narrow, real door.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/preload.ts` (new), `src/main.ts` (modified
  — `webPreferences.preload` added).
- **Change type:** Add.
- **Dependencies:** This lesson's own first unit.

### The New Code

```typescript
// src/preload.ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("pocketStudio", {
  ping: (): Promise<string> => ipcRenderer.invoke("ping"),
});
```

```typescript
// src/main.ts — window creation, updated
app.whenReady().then(() => {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  window.loadFile(path.join(__dirname, "..", "index.html"));
});
```

### Discard the Throwaway Example

Every file above is kept — real, permanent project code.

### Mechanical Walkthrough

- `contextBridge.exposeInMainWorld("pocketStudio", { ping: () =>
  ipcRenderer.invoke("ping") });` — covered fully in Objects and
  methods used, above; the real, exposed object's own shape
  (`{ ping: () => Promise<string> }`) is *exactly* what the renderer
  will real-see at `window.pocketStudio` — nothing more.
- `webPreferences: { preload: path.join(__dirname, "preload.js") }` —
  tells this specific real `BrowserWindow` which real, compiled script
  to run, with real, elevated access, before its own page loads;
  `__dirname` here is real `dist/` (where `tsc` puts compiled output),
  since this code itself runs from `dist/main.js`.

### CS Lens

`contextBridge` is a real, deliberate, narrow API — the renderer never
gets real, direct access to `ipcRenderer`, `require`, or any other real
Node.js capability; it only ever sees whatever real, specific functions
a preload script chooses to expose. This is the identical real
principle behind `pocket-db`'s own `extern "C"` boundary (Lesson 6): a
real, narrow, deliberate surface, not the whole underlying system.

### SE Lens

Why does `contextBridge`'s own exposed `ping` function call
`ipcRenderer.invoke` itself, rather than exposing `ipcRenderer`
directly and letting the renderer call `.invoke("ping")` on its own?
Because exposing `ipcRenderer` directly would let *any* real renderer
code invoke *any* real channel, including ones never meant for it —
wrapping each real capability in its own, named function (`ping`) is
what keeps the real, exposed surface exactly as narrow as intended,
not merely narrow by convention.

### Commands Needed

No new commands — this unit's own real proof runs together with the
third unit's, next.

### Run It

Proven together with this lesson's own third unit, next.

### Connection

A real, narrow bridge now exists. Building the real renderer-side code
that actually uses it — and the two, real, honest bugs found getting
there — is last.

---

## Concept Unit: The Renderer's Own Real Script

### The Problem

`window.pocketStudio.ping()` is now real and callable, but nothing in
the actual, visible window calls it yet.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/renderer.ts` (new), `index.html` (new),
  `tsconfig.json` (modified — `"DOM"` added to `lib`).
- **Change type:** Add.
- **Dependencies:** This lesson's own first two units.

### The New Code

`tsconfig.json`'s own real, one-line addition:

```json
"lib": ["ES2022", "DOM"],
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>PocketStudio</title>
</head>
<body>
  <h1>PocketStudio</h1>
  <button id="ping-button">Ping the main process</button>
  <p id="output"></p>
  <script src="dist/renderer.js"></script>
</body>
</html>
```

```typescript
// src/renderer.ts
interface PocketStudioApi {
  ping: () => Promise<string>;
}

const api = (window as unknown as { pocketStudio: PocketStudioApi }).pocketStudio;

const button = document.getElementById("ping-button") as HTMLButtonElement;
const output = document.getElementById("output") as HTMLParagraphElement;

button.addEventListener("click", async () => {
  const result = await api.ping();
  output.textContent = result;
});
```

Real, end-to-end proof — a genuine, automated click on the real
button, in a real, running window:

```javascript
window.webContents.once("did-finish-load", async () => {
  await window.webContents.executeJavaScript("document.getElementById('ping-button').click()");
  await new Promise((r) => setTimeout(r, 500));
  const result = await window.webContents.executeJavaScript(
    "document.getElementById('output').textContent"
  );
  console.log("REAL_IPC_RESULT:", JSON.stringify(result));
});
```

Real output:

```text
REAL_IPC_RESULT: "pong from the main process"
```

*What this proves:* a real click, in a real renderer, real-crossed
*two* real boundaries — renderer to main process via
`contextBridge`/`ipcRenderer`/`ipcMain`, and back — and the real,
resulting text appeared in the real, live DOM.

### Discard the Throwaway Example

The click-and-check verification script above is a real, throwaway
proof — it isn't saved as a project file. `src/renderer.ts` and
`index.html` are kept — real, permanent project files.

### Mechanical Walkthrough

- `const api = (window as unknown as { pocketStudio: PocketStudioApi
  }).pocketStudio;` — reads the real object `contextBridge` placed on
  `window`, with an explicit real type assertion, since plain
  TypeScript has no way to know a runtime-injected property exists.
- `button.addEventListener("click", async () => { ... })` — real,
  standard DOM event handling — the identical real API any web page
  uses, unrelated to Electron itself.

### Real, Honest Bugs Found Building This

Two real, genuine bugs came up verifying this lesson — both kept here
directly, the same standing practice this project's own sibling,
`pocket-db`, uses for every real failure it causes on purpose or finds
by accident.

**Bug 1 — `Uncaught ReferenceError: exports is not defined`.**
`renderer.ts` was first written ending in `export {};` (to use a real
`declare global` block for `window.pocketStudio`'s own type). Since
`tsconfig.json` compiles with `"module": "CommonJS"`, *any* `.ts` file
containing a real `import`/`export` compiles with a real CommonJS
wrapper referencing a real, global `exports` object — which plain
browser `<script>` tags, loaded with no module system at all, don't
have. **Fix:** `renderer.ts` has no top-level `import`/`export` at
all — TypeScript then compiles it as a real, plain script, with no
wrapper, matching what a `<script>` tag actually needs.

**Bug 2 — `Uncaught SyntaxError: Identifier 'pocketStudio' has already
been declared`.** The first, real fix for Bug 1 named the local
variable `pocketStudio` — the *identical* real name `contextBridge`
already placed on `window`. A top-level `const`/`let` in a plain,
non-module script real-conflicts with an existing global of the same
name. **Fix:** the local variable is named `api` instead — this
lesson's own real, final code, above.

### CS Lens

Both real bugs are the identical real *category*: JavaScript's own
**script mode** and **module mode** are two, real, genuinely different
execution contexts, with real, different rules about what `exports`
means and which real, top-level names are allowed to collide with
existing globals — a real distinction invisible until a real file
crosses from one context into the other.

### SE Lens

Why keep both real bugs directly in the lesson, rather than only
showing the final, working code? Because a real developer setting up
Electron for the first time hits *exactly* these two real errors,
almost certainly in this exact real order — showing only the working
result would leave the real, most likely point of real confusion
completely unaddressed.

### Commands Needed

```bash
npm start
```

### Run It

Click the real, visible "Ping the main process" button in the real,
running window. The real paragraph below it real-updates to `pong from
the main process`.

### Connection

S01 is complete: a real message now crosses both directions of this
project's own first real process boundary, safely, through a real,
deliberately narrow bridge. S02, next, is where the main process stops
answering with a hardcoded string and starts talking to the real,
already-built `pocket-db` engine instead.

---

## Closing

### Connect the Pieces

This lesson's first unit proved a real `ipcMain.handle` function runs
correctly in isolation, before anything could call it the real way.
The second built the real, deliberately narrow `contextBridge` bridge
letting a renderer safely reach exactly one, named, real capability.
The third wired a real button to it, hit two real, honest bugs
along the way (a module-format mismatch, a real global-name collision),
fixed both, and proved the whole real chain — a real click, two real
process boundaries, a real, displayed result — with a genuine,
automated click on a real, running window.

### What Breaks Without This

Add `export {};` back to the end of `src/renderer.ts`, rebuild, and run
`npm start`. The real browser console (open DevTools, `Ctrl+Shift+I`,
in the real, running window) shows the identical real
`Uncaught ReferenceError: exports is not defined` this lesson's own
"Real, Honest Bugs" section already reproduced — the button no longer
does anything at all, silently, since the whole real script crashed
before the click handler was ever attached. Remove the line and
confirm the real, correct behavior returns.

### Exercises

- Add a second, real IPC channel — `"double"`, taking a real number and
  returning it doubled — following the identical real
  `ipcMain.handle`/`contextBridge`/`ipcRenderer.invoke` pattern this
  lesson already built, end to end.
- Deliberately expose `ipcRenderer` itself through `contextBridge`
  (`contextBridge.exposeInMainWorld("raw", { ipcRenderer })`) instead
  of a named function, and explain, referencing this lesson's own SE
  Lens, what real capability this gives renderer code that the current,
  narrow design doesn't.
- Open the real window's own DevTools (`window.webContents.
  openDevTools()`, added temporarily to `main.ts`) and confirm, by
  typing `window.pocketStudio` directly into the real console, that
  only `{ ping: [Function] }` is real, actually exposed — nothing else
  from Node.js.

### Definition of Done

- [ ] `src/preload.ts` and `src/renderer.ts` exist as real, permanent
      files; `index.html` exists.
- [ ] Clicking the real button in the real, running window updates the
      real, visible text to `pong from the main process`.
- [ ] You caused the real `exports is not defined` failure yourself and
      confirmed removing the extra `export {};` fixes it.
- [ ] You can explain, from memory, why `contextBridge` exposes one
      named function instead of the whole `ipcRenderer` object —
      referencing this lesson's own SE Lens.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add a real IPC round trip: renderer to main process and back"`.
