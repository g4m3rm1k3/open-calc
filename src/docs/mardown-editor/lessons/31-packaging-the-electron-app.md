# Lesson 31 — Packaging the Electron App

## What You Will Build

`npm run build:electron` produces a distributable installer for macOS (`.dmg`) and Windows
(`.exe`). The resulting app bundles all dependencies — Node.js, Electron, and native addons
including `better-sqlite3` — so the user does not need to install anything. This lesson
explains what `electron-builder` does, why unsigned apps trigger OS security warnings, and
how to handle native Node.js addons during packaging.

---

## What You Need to Know First

- Lesson 1: the monorepo structure, `apps/electron`, `package.json` scripts
- Lesson 27: `better-sqlite3` — a native Node.js addon that requires special handling
- Lesson 6: the executor package and how it is imported

---

## The Lesson

### Step 1 — What Packaging Means

In development, running `npm run dev` works because:
- Node.js is installed on your machine
- `node_modules` contains all dependencies
- Electron loads unbundled TypeScript (via ts-node or Vite)

A distributable app must work on a machine that has *none* of this. Packaging does three
things:

1. **Bundles your code.** TypeScript is compiled to JavaScript. Separate files are combined
   into fewer, larger bundles. Dynamic imports are pre-loaded.
2. **Includes Electron.** The Electron binary (which is a Chromium + Node.js runtime) is
   packaged inside the `.app` or `.exe`. The user does not need Electron installed.
3. **Includes dependencies.** `node_modules` are included (after pruning dev dependencies).
   Native addons (`.node` files) are rebuilt for the target Electron version.

The result is a self-contained package — thousands of files inside a folder structure that
the OS treats as a single installable application.

**Installer vs portable app:**
- A `.dmg` on macOS contains an `.app` bundle. The user drags it to `/Applications`.
- An `.exe` on Windows is an NSIS installer. It copies files to `Program Files` and adds
  a Start menu entry.
- A `.AppImage` on Linux is a portable single-file executable.

`electron-builder` produces all of these from the same codebase.

### Step 2 — Install and Configure `electron-builder`

```bash
$ npm install --save-dev electron-builder
```

Add to `apps/electron/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "package": "npm run build && electron-builder"
  },
  "build": {
    "appId": "com.codex.app",
    "productName": "Codex",
    "directories": {
      "output": "dist-packages"
    },
    "files": [
      "dist/**/*",
      "node_modules/**/*",
      "!node_modules/.cache/**/*"
    ],
    "mac": {
      "category": "public.app-category.education",
      "target": [{ "target": "dmg", "arch": ["x64", "arm64"] }]
    },
    "win": {
      "target": [{ "target": "nsis", "arch": ["x64"] }]
    },
    "linux": {
      "target": [{ "target": "AppImage", "arch": ["x64"] }]
    }
  }
}
```

**`appId` explained:**
The app ID is a reverse-domain identifier — `com.yourcompany.appname`. On macOS, this
is used for the app bundle identifier, which is how the OS tracks the app's saved state,
preferences, and code signature. Choose a unique ID; it cannot easily be changed after
distribution because users' data is stored under this identifier.

**`"arch": ["x64", "arm64"]` on macOS:**
Modern Macs use Apple Silicon (arm64). Older Macs and most development machines use Intel
(x64). Specifying both architectures produces a "universal binary" — one `.dmg` that works
on both. Electron-builder produces two separate builds and merges them.

### Step 3 — Native Addons and `electron-rebuild`

`better-sqlite3` is a **native Node.js addon** — it includes compiled C code (a `.node`
file) that Node.js loads directly. Native addons are compiled for a specific combination
of:
- Node.js major version (e.g., Node 18, Node 20)
- CPU architecture (x64, arm64)
- Electron version (because Electron embeds its own Node.js, not the system Node.js)

The `better-sqlite3` binary in `node_modules` was compiled for your development Node.js.
When Electron loads it, it uses Electron's embedded Node.js, which may be a different
version. The result: a crash with `Error: The module was compiled against a different
Node.js version`.

**`electron-rebuild` fixes this.** It recompiles every native addon in `node_modules`
for the exact Electron version specified in `package.json`.

```bash
$ npm install --save-dev @electron/rebuild
```

Add to `apps/electron/package.json` scripts:
```json
"rebuild": "electron-rebuild -f -w better-sqlite3",
"postinstall": "npm run rebuild"
```

`postinstall` runs automatically after `npm install`. `electron-rebuild -f -w better-sqlite3`
rebuilds only `better-sqlite3` (the `-w` flag specifies which package; `-f` forces rebuild
even if the binary seems current).

**`electron-builder` hook:**
`electron-builder` also needs to run `electron-rebuild` before packaging. Add to the
`build` config:

```json
"afterSign": "scripts/rebuild-native.js"
```

Or use the built-in hook:
```json
"buildDependenciesFromSource": true
```

`buildDependenciesFromSource` tells `electron-builder` to recompile native addons from
source for the target architecture. Slower, but correct.

### Step 4 — Code Signing and OS Warnings

**Why unsigned apps show warnings:**
macOS and Windows have gatekeeper systems — they verify that a downloaded app was signed
by a registered developer. Without a signature, macOS shows a dialog saying the app "cannot
be opened because it is from an unidentified developer." The user can bypass this, but it
is alarming.

**What code signing requires:**
- macOS: an Apple Developer account ($99/year). You receive a signing certificate that
  `electron-builder` uses to sign the app and the `.dmg`. After signing, the app can also
  be **notarised** — Apple scans it for malware and certifies it.
- Windows: a code signing certificate from a Certificate Authority (Sectigo, DigiCert, etc.).
  Costs vary.

**For development and personal use:**
Skip signing. Set `ELECTRON_NO_PUBLISHER_NOTARIZATION=true` in the environment and
distribute the `.dmg` / `.exe` with instructions for bypassing the warning (on macOS:
right-click the app → Open → Open). This is acceptable for learning projects and internal
tools.

**In the `build` config, mark signing as optional:**
```json
"mac": {
  "identity": null
}
```

`"identity": null` tells `electron-builder` to skip signing on macOS. Without this, it
tries to find a signing certificate and fails if none is installed.

### Step 5 — Running the Package Build

```bash
# From apps/electron:
$ npm run package
```

This runs:
1. `npm run build` — TypeScript compilation + Vite bundle
2. `electron-builder` — packages the bundle into a platform installer

The output appears in `apps/electron/dist-packages/`. On macOS, you will see a `.dmg` file.
Open it, drag the `.app` to Applications, and launch it. It should work identically to
`npm run dev`, but self-contained.

**Testing the packaged app:**
1. Open the packaged app (not the dev server)
2. Click "Open Library" — verify folder picking works
3. Navigate to a chapter — verify markdown renders
4. Run a Python block — verify execution works (Python must be installed on the machine)
5. Run a SQL block — verify `better-sqlite3` loaded correctly

---

## Connect the Pieces

The packaged app is what the student ships to others. Everything built in lessons 1–30
comes together here. The native addon handling for `better-sqlite3` is the main packaging
complication for this project — most Electron apps do not have native dependencies.

For the web shell (Lesson 12), there is no packaging step — the browser is the shell, and
the server is deployed with normal Node.js hosting. Lesson 35 covers deploying the web shell.

The native addon rebuild problem is not unique to Codex. Every Electron app that uses
`sqlite3`, `sharp` (image processing), `canvas`, or any other native Node.js module faces
the same issue. The `electron-rebuild` step is so common that it is listed in the official
Electron documentation as a required step. Apps like VS Code (`better-sqlite3` for its
extension database), Slack (native crypto addons), and 1Password (native keychain bindings)
all solve this the same way: rebuild native modules for the embedded Node.js version as
part of the package build.

---

## What Breaks Without This

If `electron-rebuild` is not run before packaging, the packaged app crashes on launch
with `Error: The module ... was compiled against a different Node.js version`. The error
is not visible to the user — the app opens a window and then immediately crashes. This is
the most common native addon packaging failure.

---

## Definition of Done

- [ ] `npm run package` completes without errors
- [ ] The packaged `.app` (macOS) or `.exe` (Windows) launches
- [ ] Opening a library folder works in the packaged app
- [ ] Running a Python code block works in the packaged app
- [ ] Running a SQL code block works in the packaged app
- [ ] You can answer: what is a native Node.js addon and why must it be rebuilt for Electron?
- [ ] You can answer: what is code signing and why does macOS require it for trusted apps?
- [ ] `git commit` with a message explaining why
