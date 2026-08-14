# Concept: Electron's Main Process — `app` and `BrowserWindow`

**What you'll understand by the end:** how a desktop app built with Electron actually starts up — the real lifecycle from "the process launched" to "a real native window is showing a web page" — and the two core objects that make it happen.

**Prerequisites:** `javascript-commonjs-require.md`, `event-driven-ui-callbacks.md`, `client-server-architecture.md`.

## Setup

```
npm install --save-dev electron
```
Requires a `package.json` with a `"main"` field pointing at the entry file, and that file run via `electron .` (not plain `node`) — Electron's binary, not Node's, is what actually provides the `electron` module's real contents (`require("electron")` under plain Node returns only a path string, not the API).

## The Problem

A normal Node.js script runs top to bottom and exits. A desktop app needs to do something categorically different: start up, wait until the underlying OS windowing system is actually ready to create windows, then open one or more real, native windows, each showing content — and keep running afterward, reacting to further events (windows closing, the app being reactivated), not exiting once its first task is done.

## The Isolated Example

```javascript
const { app, BrowserWindow } = require("electron");

console.log("app.isReady() before whenReady:", app.isReady());

app.whenReady().then(() => {
  console.log("app.isReady() inside whenReady:", app.isReady());
  const win = new BrowserWindow({ width: 400, height: 300, show: false });
  console.log("BrowserWindow created, id:", win.id);
  win.loadURL("data:text/html,<h1>lab</h1>");
  win.webContents.on("did-finish-load", () => {
    console.log("did-finish-load fired");
    app.quit();
  });
});
```

**Real output, run this session** (via Electron's own binary, `electron .`, not plain `node`):
```
app.isReady() before whenReady: false
app.isReady() inside whenReady: true
BrowserWindow created, id: 1
did-finish-load fired
```

**What this proves:** `app.isReady()` genuinely changes from `false` to `true` only once Electron's own startup has actually finished — code run too early would be acting on a process that isn't ready to create windows yet, which is exactly why `BrowserWindow` is only constructed *inside* the `.then(...)` callback, never before it. `did-finish-load` firing confirms the window really loaded real content, not just that it was constructed.

## Mechanical Walkthrough

- `const { app, BrowserWindow } = require("electron")` — **(b) reappearing** CommonJS `require` plus destructuring (`javascript-commonjs-require.md`) — `electron`'s own module exports both as named properties on one object, the same shape any CommonJS module can export.
- `app` — **(a) first appearance.** A single, real object representing the whole running application (one per process) — analogous to Flask's own `app = Flask(__name__)` (Lesson 1) as "one object the rest of the file attaches behavior to," here provided by Electron itself rather than constructed.
- `app.isReady()` — **(a) first appearance** — a plain method reporting real, current process state at the moment it's called; called twice here specifically to prove that state actually changes.
- `app.whenReady()` — **(a) first appearance** — returns a real `Promise` that resolves once Electron's own native startup (initializing the OS-level windowing system) has genuinely finished; `.then(...)` — **(b) reappearing** Promise chaining (Lesson 1) — schedules the callback for exactly that moment, never before.
- `new BrowserWindow({ width: 400, height: 300, show: false })` — **(a) first appearance** — constructs one real native OS window (not yet visible — `show: false` — since this lab only needs to prove the API works, not be looked at). The object literal argument is a real, already-known JavaScript construct; what's new is which named options a `BrowserWindow` specifically understands (`width`/`height`/`show` here, several dozen more exist).
- `win.id` — **(a) first appearance** — a real, unique integer Electron assigns each window, confirming a real, distinct native object was created, not a placeholder.
- `win.loadURL("data:text/html,...")` — **(a) first appearance** — tells the window's own web content to navigate to a URL, exactly like a browser tab navigating; full treatment of the `data:` scheme itself: `data-url-scheme.md`.
- `win.webContents` — **(a) first appearance** — a separate object from the window itself, representing specifically the *web page* the window displays (its DOM, its navigation state) — this split exists because a window and the page inside it are genuinely separate concerns in Electron's own model (a window could, in principle, load a different page later; `webContents` is what actually changed).
- `.on("did-finish-load", () => {...})` — **(b) reappearing, extended** the general event-driven-callback model `event-driven-ui-callbacks.md` already covers — but a different concrete API than that file's own DOM `addEventListener` example: this is Node's `EventEmitter` pattern (`.on(eventName, handler)`), which `webContents` (and `app`, and most Electron objects) implement, not the browser's DOM event system. Same idea — register a named reaction, don't block waiting for it — different real method on a different real object.
- `app.quit()` — **(a) first appearance** — ends the whole application process; used here only to make this lab exit on its own once it's proven its point, rather than sit open waiting to be closed by hand.

## CS Lens

Electron's `app` object embodies the same **application lifecycle** idea most real GUI frameworks expose in some form (a defined sequence of startup → ready → running → shutdown phases, with hooks at each transition) — `app.whenReady()` is this project's first encounter with a framework-managed startup phase specifically, as opposed to a script or a web server (Lesson 1) that's simply "running" from its very first line.

Also recognized in: any GUI toolkit's own "app delegate"/lifecycle object (iOS's `AppDelegate`, Android's `Application` class), and — directly relevant to this project's actual subject — a real CNC controller's own power-on sequence (self-test and homing before any program can run), the same "don't act until the system reports it's actually ready" discipline applied to different hardware.

## SE Lens

The alternative — constructing a `BrowserWindow` immediately, at the top of the file, with no `whenReady()` gate — is a real, common mistake for exactly the reason this lab exists to demonstrate: Electron's own windowing system isn't guaranteed ready the instant the process starts, so an early `BrowserWindow` construction can fail or behave inconsistently depending on the OS and timing, a class of bug that's hard to reproduce reliably (works most of the time, fails occasionally) rather than failing loudly and consistently. Gating every window-creating call behind `whenReady()` costs one extra `.then(...)` wrapper and removes that entire failure class.

## Connection

Builds on `javascript-commonjs-require.md` (Electron's main process is CommonJS by default) and `event-driven-ui-callbacks.md` (extended to Node's `EventEmitter` API surface, not just DOM events). `data-url-scheme.md` covers `loadURL`'s argument in full. Directly relevant to any desktop app built with Electron, Node's own `EventEmitter` class (what `.on(...)` comes from generally, beyond Electron specifically), and any framework with a startup-lifecycle gate before its main APIs are safe to call.

## Try It Yourself

1. Move the `new BrowserWindow(...)` call to before `app.whenReady()`, outside the `.then(...)` callback entirely, and observe what actually happens when you run it — reason about whether it fails loudly or behaves unreliably.
2. Change `show: false` to `show: true` (or remove it — `true` is the default) and rerun the lab, watching the real, brief window appear before `app.quit()` closes it.
3. Add a second `.on("did-finish-load", ...)` listener on the same `webContents`, alongside the first, and confirm both real listeners fire independently for the same one event — the same independent-reactions model `event-driven-ui-callbacks.md` already proved, now shown on this different API.
