# Vault PDM — Lesson 29 — Packaging and Distribution

## What You Will Build

The Vault Electron app is packaged into a platform-native installer: `.dmg` on macOS,
`.exe` (NSIS installer) on Windows, `.AppImage` on Linux. `electron-builder` handles
the build. The resulting installer can be copied to another machine and installed
without Node.js, without npm, without any developer tooling. Code signing is explained
— unsigned apps trigger OS security warnings.

## What You Need to Know First

Lessons 01–28. Vault is fully functional. This lesson adds the build and packaging
configuration.

---

## The Problem

Running Vault with `npm run dev` requires Node.js, npm, and all dev dependencies
installed. A team member who is not a developer cannot run it this way. A
distributable installer packages everything — Node.js, Chromium, all dependencies,
the compiled TypeScript — into a single file that a non-developer can double-click.

---

## Step 1 — What electron-builder Does

**`electron-builder` — first appearance:**
`electron-builder` is a build tool for packaging Electron apps. It:
1. Reads the compiled TypeScript from `dist/`
2. Bundles it with the Electron binary (Chromium + Node.js)
3. Includes all `dependencies` from `package.json`
4. Creates a platform-native installer
5. Optionally code-signs the output

**The difference between dev and production builds:**
- **Dev (`npm run dev`):** Vite serves TypeScript files on demand. Source maps are
  included. The renderer loads from `localhost:5173`. Electron devtools are available.
- **Production (`npm run build`):** Vite compiles and minifies all TypeScript to static
  files. No source maps. The renderer loads from the built files. Devtools disabled.
  `electron-builder` wraps the compiled output with the Electron binary.

**Minification — first appearance:**
**Minification** removes whitespace, renames variables to short names, and reduces
code to the smallest possible size while preserving behaviour. `greeting = 'Hello'`
becomes `g='Hello'`. Minified files are faster to load (smaller download) and harder
to read (not impossible — reverse-engineering minified code is called deobfuscation).
Vite minifies automatically for production builds.

---

## Step 2 — Installation

```json
"devDependencies": {
  "electron-builder": "^24.0.0"
}
```

Run: `npm install`

Add to `package.json` scripts:
```json
"dist": "npm run build && electron-builder"
```

---

## Step 3 — electron-builder Configuration

Add to `package.json`:

```json
"build": {
  "appId":       "com.vault.app",
  "productName": "Vault",
  "directories": {
    "output": "release/"
  },
  "files": [
    "dist/**/*",
    "node_modules/**/*",
    "package.json"
  ],
  "mac": {
    "category": "public.app-category.productivity",
    "target":   [{ "target": "dmg", "arch": ["x64", "arm64"] }]
  },
  "win": {
    "target": [{ "target": "nsis", "arch": ["x64"] }]
  },
  "linux": {
    "target": [{ "target": "AppImage", "arch": ["x64"] }]
  },
  "nsis": {
    "oneClick":         false,
    "allowToChangeInstallationDirectory": true,
    "installerIcon":    "assets/icon.ico",
    "uninstallerIcon":  "assets/icon.ico"
  }
}
```

**`"appId": "com.vault.app"` — first appearance:**
The app ID is a **reverse domain name identifier** — a globally unique identifier
for this application. It is used by macOS for code signing, the Windows registry for
uninstall information, and Linux for desktop entries. The reverse domain convention
(`com.company.product`) ensures uniqueness: `com.vault.app` is controlled by
whoever owns the `vault.app` domain. For an internal app, any unique string works —
the convention is still good practice.

**`"files"` — what is bundled:**
`"dist/**/*"` includes all compiled TypeScript output. `"node_modules/**/*"` includes
all runtime dependencies. `electron-builder` uses the `"dependencies"` list in
`package.json` to determine which `node_modules` to include — `devDependencies` are
excluded from the installer.

**`"mac": { "target": [{ "arch": ["x64", "arm64"] }] }` — universal binary:**
Modern Macs use Apple Silicon (ARM), while older Macs use Intel (x86). Building for
both `x64` and `arm64` produces a **universal binary** that runs on both
architectures without translation. The installer is larger but covers all Mac users.

**`"nsis"` — the Windows NSIS installer:**
NSIS (Nullsoft Scriptable Install System) is the standard Windows installer format.
`oneClick: false` shows the installation wizard (choose directory, create shortcuts).
`allowToChangeInstallationDirectory: true` lets the user choose where to install.

---

## Step 4 — Code Signing

**Code signing — first appearance:**
**Code signing** is the process of attaching a digital signature to the installer.
The signature:
1. Proves the installer came from a specific developer or organisation
2. Proves the installer has not been tampered with since signing

When a user downloads and runs an unsigned installer:
- **macOS**: Gatekeeper shows "This app cannot be opened because it is from an
  unidentified developer." The user must right-click → Open to bypass it.
- **Windows**: SmartScreen shows "Windows protected your PC" and hides the "Run"
  button. The user must click "More info" → "Run anyway."
- **Linux**: No signing requirement.

**What signing requires:**
- **macOS**: An Apple Developer account ($99/year). A Developer ID Application
  certificate issued by Apple. The app must also be **notarised** (submitted to
  Apple's servers for malware scanning before distribution).
- **Windows**: A code signing certificate from a trusted CA (Sectigo, DigiCert, etc.)
  — $100–500/year. EV certificates (Extended Validation) bypass SmartScreen
  immediately; standard certificates require building a reputation.

**For a learning project:**
Sign if the app will be distributed beyond your machine. For internal team use,
distribute via a shared drive and instruct users to accept the unsigned warning.

**How to configure signing in electron-builder** (macOS):

```json
"mac": {
  "identity": "Developer ID Application: Your Name (TEAMID)",
  "hardenedRuntime": true,
  "entitlements":         "build/entitlements.mac.plist",
  "entitlementsInherit":  "build/entitlements.mac.plist",
  "notarize": {
    "teamId": "YOURTEAMID"
  }
}
```

**Entitlements — first appearance:**
Electron's hardened runtime (required for Apple notarisation) restricts what the app
can do. **Entitlements** are permissions the app declares it needs:
```xml
<!-- build/entitlements.mac.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "...">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key><true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key><true/>
</dict>
</plist>
```
Electron requires these two entitlements for its V8 JavaScript engine (which
generates machine code at runtime — "just-in-time" compilation).

---

## Step 5 — Running the Build

```
npm run dist
```

**Expected output:**
```
  • electron-builder  version=24.x
  • loaded configuration  file=package.json
  • writing effective config  file=release/builder-effective-config.yaml
  • packaging       platform=mac arch=x64 electron=31.x appOutDir=release/mac/
  • packaging       platform=mac arch=arm64 electron=31.x appOutDir=release/mac-arm64/
  • building        target=DMG name=Vault arch=universal
  • building        target=DMG name=Vault-1.0.0.dmg
```

The installer appears in `release/`:
- macOS: `Vault-1.0.0.dmg`
- Windows: `Vault Setup 1.0.0.exe`
- Linux: `Vault-1.0.0.AppImage`

**Add `release/` to `.gitignore`:**
Installers are binary, large, and reproducible from the source. Never commit them.

---

## Connect the Pieces

The production build pipeline:

```
npm run dist
  → npm run build (Vite compiles TypeScript → dist/)
  → electron-builder reads dist/ and node_modules/
  → packages with Electron binary
  → produces platform installer in release/
```

The installer copies the database connection string from `.env` — **wait**: the
`.env` file is not bundled (it is in `.gitignore`). A packaged Vault app needs its
database configuration at runtime. For distribution, use `electron-store` or
environment variables set during installation. For the learning context, document
that users must set `DATABASE_URL` before running the packaged app.

---

## What Breaks Without This

**Without `"type": "dependencies"` distinction:**
If all packages were in `dependencies` (including Vitest, TypeScript, Vite),
`electron-builder` would bundle them into the installer. The installer would be
hundreds of MB larger and include code that serves no purpose at runtime. The
`dependencies` / `devDependencies` separation exists precisely for this.

**Without the `entitlements.plist` on macOS:**
The notarisation step fails with "The executable requires com.apple.security.cs..."
errors. Without notarisation, the DMG cannot be distributed outside your own machine
on macOS 10.15+ — Gatekeeper rejects it.

---

## Definition of Done

- [ ] `npm run dist` completes without errors
- [ ] The installer file appears in `release/`
- [ ] Installing the app on a machine without Node.js opens Vault correctly
- [ ] The app loads the Connect screen (requires PostgreSQL to be running)
- [ ] `release/` is in `.gitignore`
- [ ] You can explain code signing — what it proves, what happens without it, what it costs
- [ ] You can explain minification — what it does to code, why production builds use it
- [ ] You can explain `appId` and the reverse domain convention
- [ ] You can explain the difference between `"dependencies"` and `"devDependencies"` in the context of electron-builder
- [ ] Run:
      ```
      git add package.json build/
      git commit -m "Add electron-builder packaging: DMG/NSIS/AppImage targets, universal macOS binary, code signing configuration"
      ```

---

*Next: Lesson 30 — The Extension Exercise. The student designs and implements a new
feature from the out-of-scope list. The open/closed principle is applied: the
extension adds new code without modifying what already works.*
