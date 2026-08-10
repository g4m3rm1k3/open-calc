# Concept: Electron's Preload/`contextBridge`/`ipcRenderer` Security Boundary

**What you'll understand by the end:** why Electron's main process (real
Node.js, full filesystem/OS access) and its renderer process (a real web
page, potentially showing untrusted content) are deliberately *not*
allowed to touch each other directly, and the one narrow, deliberate
bridge Electron provides instead.

**Prerequisites:** `electron-main-process-and-browserwindow.md`,
`event-driven-ui-callbacks.md`.

## Setup

```
npm install --save-dev electron
```
A `BrowserWindow` constructed with `webPreferences: { preload: "<path>"
}` — the file at that path runs once, before the page's own scripts,
in a special, privileged context.

## The Problem

A renderer process is, mechanically, a real Chromium web page — the same
engine that renders any website, including one showing content this app
didn't author (a loaded remote URL, a pasted snippet, a malicious `.nc`
file comment containing HTML if it were ever rendered unescaped). If
that page's own JavaScript could call Node's `fs.readFileSync` or
`require("child_process")` directly, any way to get *any* script running
in that page — a bug, a bad third-party library, a maliciously crafted
file — would mean full filesystem and process access, not just "a web
page misbehaving." Electron's main process needs a real, narrow gate
between "what the renderer can ask for" and "what actually touches the
real operating system."

## The Isolated Example

`preload-lab.js` (a disposable host — never touched again after this
lab; this exact filename and shape don't reappear in the real project):
```javascript
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("labApi", {
  square: (n) => n * n,
});
```

`lab.html`, loaded by a `BrowserWindow` with `webPreferences: {
preload: path.join(__dirname, "preload-lab.js") }`:
```html
<script>
  console.log("typeof require:", typeof require);
  console.log("labApi.square(4):", window.labApi.square(4));
</script>
```

**Real output, this session (in the renderer's DevTools console):**
```
typeof require: undefined
labApi.square(4): 16
```

**What this proves:** `require` is genuinely `undefined` inside the
page's own script — real proof the page has no Node access at all —
while `window.labApi.square`, a function this project's own preload
script deliberately chose to expose, works. The page got exactly one
narrow capability (`square`), not a general-purpose bridge to Node.

## Mechanical Walkthrough

- **The preload script** runs in a third, special context: it has
  access to a limited set of Node APIs (like `require("electron")`
  itself) *and* can see the page's real `window` object — no other real
  JavaScript in this system straddles that line.
- `contextBridge.exposeInMainWorld("labApi", { square: (n) => n * n })`
  — **(a) first appearance.** Creates a real, new global,
  `window.labApi`, inside the page's own JavaScript world — but *only*
  containing exactly the functions/values explicitly listed here.
  Nothing about the preload script's own scope (it could have required
  `fs` at the top, read secrets, anything real Node code can do) leaks
  through — only what's named inside this one call.
- `typeof require === "undefined"` inside `lab.html`'s own script proves
  **context isolation** is genuinely active: the page's JavaScript world
  and the preload script's JavaScript world are two real, separate
  environments, even though they're rendering side by side and even
  though `contextBridge` lets one narrow bridge cross between them.

## CS Lens

This is the **principle of least privilege**, applied at a process
boundary: grant the smallest set of real capabilities a component
actually needs, never the full set available to the process it runs
inside. `contextBridge.exposeInMainWorld` is a real, enforced
**capability-based security** mechanism — the page can do exactly what
it was explicitly handed, and provably nothing else, rather than trusted
to simply not misuse a bigger set of access it technically has.

Also recognized in: browser extensions' own content-script/background-
script split (nearly identical shape, different vendor), a REST API
exposing specific endpoints instead of direct database access, and a
CNC controller's own front panel exposing "jog," "start cycle," and
"feed hold" as the only real interface to the drive electronics —
never raw register writes, no matter how technically capable the
underlying hardware is.

## SE Lens

The alternative — `nodeIntegration: true`, an older Electron setting
that gives the renderer full, direct Node access with no bridge at all
— is real, still-possible-to-configure, and is exactly the vulnerability
class this whole pattern exists to close: any XSS-style script injection
into that renderer becomes a full system compromise, not a contained
UI bug. Electron's own security documentation names this as the single
most important setting in the entire framework for exactly this reason.
Naming *specifically* what a preload script exposes (`square`, or in the
real project, `onProgramLoaded`) also makes the entire real, available
attack surface of a given window auditable by reading one short file,
rather than "everything Node can do."

## Connection

Builds on `electron-main-process-and-browserwindow.md` (the same `app`/
`BrowserWindow` startup this lab's host window uses) and
`event-driven-ui-callbacks.md` (the general callback-registration shape
`ipcRenderer.on`, used in the real project's own preload script, extends
directly). Directly relevant to any Electron app loading real, taught
project code next: `cnc-editor-electron/src/preload.ts` uses this exact
`contextBridge.exposeInMainWorld` call, exposing `onProgramLoaded`
instead of this lab's disposable `square`.

This lab's own code — `preload-lab.js`, `lab.html` — is deleted now; it
was written only to prove this mechanism works before trusting it inside
the real project.

## Try It Yourself

1. Add a second exposed function, `reverse: (s) => s.split("").reverse().join("")`,
   and call it from `lab.html`. Confirm it works exactly like `square`
   did, reinforcing that `exposeInMainWorld`'s second argument is a
   plain object — any number of named functions/values can live on it.
2. Try calling `contextBridge.exposeInMainWorld("labApi", { fs: require("fs") })`
   — exposing the *entire* `fs` module directly, not one narrow
   function — and reason about why this defeats the whole point of this
   pattern even though it's syntactically identical to the safe version:
   the renderer would now have `window.labApi.fs.readFileSync` on
   arbitrary uses, cabable of reading anything on the entire disk this
   process has permission for.
3. Remove `webPreferences: { preload: ... }` entirely from the lab
   window's constructor and rerun. Confirm `window.labApi` is now
   `undefined` in the page — proof the bridge exists only because a
   window was explicitly wired to this specific preload file, not
   automatically for every window Electron creates.
