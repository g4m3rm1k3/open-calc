# Lesson 06 — Running on Mobile and Desktop

## What You Will Build

Run the exact same codebase on your phone via Expo Go, and wrap it in Electron so it
opens as a standalone desktop app. By the end, the same three-tab app from Lesson 05
runs in Chrome, on your phone, and in a desktop window — no code changes between targets.

---

## What You Need to Know First

- Lesson 01–05: The full app as built
- Lesson 01: Node.js, npm, the terminal

---

## The Lesson

### Step 1 — Running on Your Phone with Expo Go

**What Expo Go is:** Expo Go is a mobile app available on the iOS App Store and Android
Play Store. Instead of building a full native app binary for development (a process that
takes minutes), Expo Go downloads your app bundle from Expo's development server over
your local Wi-Fi network.

**Requirements:**
- Your phone and computer must be on the same Wi-Fi network
- Expo Go installed on your phone

**Run the dev server in network mode:**
```bash
$ npm run start
```

In the Expo dev server output, you see a QR code. Scan it with:
- iOS: the system camera app (no additional app needed)
- Android: the Expo Go app's QR scanner

**What QR scanning does:** The QR code encodes a URL like `exp://192.168.1.5:8081`.
Your phone's Expo Go app opens that URL, connects to your computer's Expo dev server,
downloads the JavaScript bundle, and runs it. Your phone becomes a thin client that
executes your app's JavaScript remotely-served code.

**What happens when you save a file:** The dev server detects the change, recompiles the
bundle, and sends a **fast refresh** message over the network connection. Expo Go
receives it and updates the app — typically in under a second, without losing any state.

### Step 2 — Compilation Targets

The same TypeScript source compiles to different output depending on the **compilation target**:

| Target | Tool | Output |
|---|---|---|
| Web browser | Babel/Metro + Vite | JavaScript for Chrome/Firefox/Safari |
| iOS | Metro + Xcode | Native iOS bundle |
| Android | Metro + Gradle | Native Android APK |
| Desktop | Electron | JavaScript running in Electron's Node.js |

A **compilation target** is a specification of the platform the output will run on.
The same TypeScript code produces different JavaScript output (different module format,
different polyfills, different bundled size) for each target. This is why `package.json`
has separate scripts for `web`, `ios`, `android`, and why adding Electron requires a
separate entry point.

**What Metro is:** Metro is Expo's JavaScript bundler — the tool that reads your source
files, resolves imports, applies transforms (TypeScript → JavaScript), and produces a
single bundle. Metro is a development-focused bundler optimised for fast refresh. For
production web builds, Expo uses Webpack or Vite instead.

### Step 3 — Abstraction Layers

React Native is an **abstraction layer** over native iOS and Android UI.

```
Your React Native code
         ↓
  React Native runtime
         ↓
  Bridge / JSI (JavaScript Interface)
         ↓
  Native code (iOS UIKit / Android Views)
         ↓
  Hardware
```

When you write `<View style={{ flex: 1 }}>`, React Native translates it to:
- iOS: a `UIView` with Auto Layout constraints
- Android: an `android.view.View` with layout parameters
- Web: a `<div>` with CSS Flexbox

The abstraction pays a price: some platform-specific behaviours are smoothed out, some
native capabilities are not exposed, and there is an overhead in the translation layer.
The benefit: one codebase runs on three platforms.

**CS lens:** An abstraction layer is a module that translates between two different
interfaces. The cost of abstraction is the translation overhead and the loss of
platform-specific capabilities. The benefit is that code above the abstraction is
portable. Every abstraction in software makes the same tradeoff.

### Step 4 — Adding Electron

**What Electron is:** Electron is a framework that packages a web browser (specifically
Chromium) and Node.js together into a single desktop application. Electron apps are web
apps with full system access: they can read the filesystem, open TCP connections, and
spawn processes — things a browser tab cannot do.

VS Code is built on Electron. So is Slack, Discord, Figma, and 1Password.

**The Electron process model:**
Electron runs two types of processes:
1. **Main process** — a Node.js process. It accesses the filesystem, creates windows,
   handles system events. There is exactly one main process.
2. **Renderer process** — a Chromium browser instance that renders your React app.
   There is one renderer per window. The renderer cannot access Node.js APIs directly.

Why separated? **The principle of least privilege.** The renderer process renders
untrusted web content (your app's JavaScript). If it had full Node.js access, any
JavaScript vulnerability (XSS, a malicious npm package) could read your files or spawn
processes. Separating the processes means the renderer can only do what you explicitly
expose to it — nothing more.

**Install Electron:**
```bash
$ npm install --save-dev electron
$ npm install --save-dev electron-builder
$ npm install --save-dev concurrently wait-on
```

- `electron` — the Electron framework (dev dependency: users install the packaged app,
  not Electron itself)
- `electron-builder` — packages the Electron app into a distributable binary (`.dmg`
  on macOS, `.exe` on Windows, `.AppImage` on Linux)
- `concurrently` — runs multiple commands simultaneously in one terminal
- `wait-on` — waits for a URL or file to be available before running the next command

**`main.js` — the Electron main process:**

Create `electron/main.js`:

```javascript
const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,  // security: renderer cannot access Node.js APIs
      contextIsolation: true,  // security: preload script runs in isolated context
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // In development, load the Expo dev server
  // In production, load the built static files
  const isDev = process.env.NODE_ENV !== 'production'
  if (isDev) {
    mainWindow.loadURL('http://localhost:8081')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../web-build/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS, re-create the window when the dock icon is clicked and no windows are open
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  // On macOS, apps stay in the dock even when all windows are closed
  if (process.platform !== 'darwin') app.quit()
})
```

**`require('electron')` vs `import`:** This file uses CommonJS `require` syntax (not
ES Module `import`) because it runs in Node.js's main process, which historically used
CommonJS. Modern Node.js supports ES modules, but Electron's documentation uses CommonJS
for the main process for compatibility.

**`BrowserWindow` explained:**
`BrowserWindow` creates a new desktop window. `webPreferences` configures the security
and capabilities of the renderer (browser) process:
- `nodeIntegration: false` — the renderer's JavaScript cannot call `require('fs')` or
  any other Node.js API. This is the default and must remain `false`.
- `contextIsolation: true` — the preload script's variables and functions are isolated
  from the renderer's page scripts. A malicious script in the renderer cannot access
  anything defined in the preload. This must remain `true`.
- `preload` — path to the preload script (explained below)

**`process.env.NODE_ENV`:** `NODE_ENV` is a conventional environment variable that
signals whether the app is running in development or production. `process.env` is
Node.js's object holding all environment variables. In development, we load the Expo
dev server URL. In production, we load the built static files.

**`preload.js` — the bridge:**

Create `electron/preload.js`:

```javascript
const { contextBridge } = require('electron')

// Expose safe APIs from the main process to the renderer
// This is the ONLY way the renderer should access Electron features
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
})
```

**`contextBridge.exposeInMainWorld` explained:**
The preload script runs in a privileged context (it can access both Electron APIs and
the renderer's DOM). `contextBridge.exposeInMainWorld` creates a safe bridge: it places
an object (`electronAPI`) on the renderer's `window` object, but the object is a copy —
the renderer cannot access the original preload scope, preventing prototype pollution attacks.

We expose only `platform` for now. In later lessons (Lesson 29), we will expose more APIs
like file dialogs and system notifications.

**Add electron scripts to `package.json`:**
```json
"scripts": {
  "start": "expo start",
  "electron:dev": "concurrently \"npm run web\" \"wait-on http://localhost:8081 && electron electron/main.js\"",
  "electron:build": "expo export:web && electron-builder --config electron-builder.json"
}
```

`concurrently "A" "B"` runs two commands simultaneously. `wait-on` waits for the web
dev server to be ready before launching Electron (if Electron starts before the server
is ready, it loads a blank page).

**Run the desktop app:**
```bash
$ npm run electron:dev
```

A desktop window opens showing your app, identical to the browser version.

### Step 5 — The Principle of Least Privilege

**What it means:** Every process, user, or component should have the minimum permissions
needed to do its job — and nothing more.

In Electron:
- The **renderer** renders HTML and runs React. It needs: DOM access, JavaScript engine.
  It does not need: filesystem access, spawning processes.
- The **main process** manages windows and accesses system resources. It needs: Node.js APIs.
  It should not be directly accessible from the renderer.

By keeping `nodeIntegration: false` and `contextIsolation: true`, Electron enforces
least privilege architecturally. If a React component has an XSS vulnerability — if an
attacker manages to inject JavaScript into the renderer — that JavaScript has browser-level
access only, not filesystem access. The attack is contained.

This principle reappears in Lesson 09 (the iframe sandbox for user code execution) and
Lesson 18 (authorization: give each user the minimum database access they need).

---

## Connect the Pieces

The Electron process model introduced here — main process (privileged, system access)
and renderer process (unprivileged, UI only) — is the same separation principle as the
client/server model introduced in Lesson 11. The renderer is the client; the main process
is the server. The boundary between them is the `contextBridge`, just as the boundary in
Lesson 11 is the HTTP API.

In Lesson 29, the Electron deep dive, `contextBridge` will expose file dialog, native
menu, and system tray APIs. Every API exposed will be explicitly declared — not a blanket
exposure of Node.js.

React Native's abstraction layer model — write once, translate to native — is the same
model as the executor registry introduced in Lesson 21: one interface, multiple
implementations for different targets. The pattern is universal.

---

## What Breaks Without This

Without `nodeIntegration: false`, a React component that renders user-provided text could
be exploited: `<Text>{dangerousInput}</Text>` would be safe normally, but if the input
reached a `dangerouslySetInnerHTML` in the web layer, and Electron's renderer could call
`require('fs')`, an attacker could read the user's SSH keys. The separation between
renderer and main process is the guard against this.

Without `wait-on`, the `electron:dev` script launches Electron before the Expo dev
server is ready. Electron loads `http://localhost:8081` and finds no server — the window
shows a connection error. The developer must restart manually.

---

## Definition of Done

- [ ] `npm run start` + Expo Go on mobile shows the same three-tab app
- [ ] `npm run electron:dev` opens a desktop window showing the same app
- [ ] The desktop app has `nodeIntegration: false` and `contextIsolation: true`
- [ ] You can answer: what is the Electron main process and what does it have access to?
- [ ] You can answer: what is the renderer process and what does it not have access to?
- [ ] You can answer: what does `contextBridge.exposeInMainWorld` do and why is it safer than enabling `nodeIntegration`?
- [ ] You can answer: what is the principle of least privilege?
- [ ] `git commit` with a message explaining why — "Add Electron desktop shell — same codebase runs on web, mobile, and desktop"
