# Lesson 8: A File That Isn't Really There

**What you will build** — a real, packaged, standalone `PocketStudio.exe`
on disk, built with `electron-builder`, that opens, spawns its own real
Python sidecar, and creates/queries a real `.pdb` file — the same, full,
real capability this project has had since Lesson 6, now working from a
genuinely installed build instead of `npm start`. The real, transferable
problem underneath: a packaging step that changes *how files are stored*
can silently break code that assumed a plain filesystem, especially code
reaching outside the packaging tool's own runtime (this project's own
Python child process) — and that breakage has to be proven, not assumed
fixed by reading the fix.

**What you need to know first:** Lesson 2 (`child_process.spawn`, the
real DLL-PATH gotcha — the *shape* of "a spawned process's environment
isn't automatically identical to a dev shell's" reappears here in a new
form), Lesson 0 (`__dirname`, TypeScript's compiled output living in
`dist/`).

**Terms introduced in this lesson:**
- **asar** — Electron's own, real, single-file archive format. Every
  `electron-builder` build packs an app's own real `files` (this
  project's `dist/`, `index.html`, `package.json`, and — until this
  lesson fixes it — `query_server.py` and its own Python dependencies)
  into one real file, `app.asar`, instead of leaving them as loose files
  in `resources/`. It exists for two real reasons: a single, real file
  reads faster off disk than thousands of small ones (fewer real
  filesystem `open`/`stat` calls), and it's a mild, real deterrent
  against a casual user browsing an installed app's own source straight
  out of Explorer. Electron's own, patched Node `fs`/`require` know how
  to reach *into* a real `.asar` file transparently — a completely
  separate, real, external process does not.
- **electron-builder** — a real, third-party, open-source packaging
  tool (not part of Electron itself) that turns this project's own dev
  source tree into a real, actual build a user could run without
  `npm`/`node` installed at all.
- **Chrome DevTools Protocol (CDP)** — a real, standard, documented
  remote-debugging protocol every Chromium-based process — including
  every real Electron app — can expose over a local port. Every earlier
  lesson's own verification worked by requiring a dev-mode `.js` script
  straight into a locally-run `electron` binary; a genuinely packaged,
  signed `PocketStudio.exe` is a real, standalone binary with no script
  argument to require — CDP is the real, external replacement.

**Objects and methods used**
- **`electron-builder`'s `"build"` config** (the `"build"` key in
  `package.json`, read by the real `electron-builder` CLI)
  - *What it is:* a real, declarative config object, not a Node API —
    `electron-builder` reads it directly out of `package.json` and
    never runs any of it as code.
  - *Implementation:* the real, relevant keys this project uses:
    `appId: string`, `productName: string`, `files: string[]` (glob
    patterns, relative to the project root, choosing what becomes part
    of the real build), `asarUnpack: string[]` (glob patterns, a
    *subset* of `files`, choosing what stays real, loose files instead
    of going inside `app.asar`), `directories.output: string`,
    `win.target: string`.
  - *Its use:* this lesson's own entire real subject — the thing that
    turns "runs under `npm start`" into "a real file exists on disk."
- **`app.isPackaged`** (Electron's `app` module)
  - *What it is:* a real, built-in boolean Electron itself sets — `true`
    only inside a build a packager produced, `false` under `npm start`.
  - *Implementation:* `readonly isPackaged: boolean`.
  - *Its use:* lets `main.ts` compute the right real path for
    `query_server.py` at runtime, without a separate build-time flag or
    a second, parallel config file.
- **`process.resourcesPath`** (Electron's patched Node `process`)
  - *What it is:* the real, absolute path to a packaged app's own
    `resources/` directory — the folder `app.asar` (and, after this
    lesson's fix, `app.asar.unpacked/`) actually live inside. Only
    real and meaningful once `app.isPackaged` is `true`.
  - *Implementation:* `readonly resourcesPath: string`.
  - *Its use:* the real anchor this lesson's fix builds
    `app.asar.unpacked/query_server.py`'s own full path from.
- **`--remote-debugging-port=<port>`** (a real Chromium command-line
  switch, not an Electron-specific one)
  - *What it is:* tells the process's own embedded Chromium to open a
    real, local CDP server on the given port the moment it starts.
  - *Implementation:* passed as a plain string in the `args` array to
    Node's own `spawn`, exactly like any other command-line argument.
  - *Its use:* this lesson's own real replacement for
    `electron.exe some-script.js` — the only way left, once the app is
    a genuine standalone `.exe`, to reach into its real running window
    from an outside script.

---

## Concept Unit: A Real, Installable Build

### The Problem

Every previous lesson's own "real, running window" has meant one thing:
`npm start`, inside this project's own dev folder, with `node_modules`
and Python both sitting right there. Nobody outside this machine could
run any of it. `electron-builder` is the real, standard tool that turns
this project's own source into a build that doesn't need `npm`, `tsc`,
or a checked-out repo at all.

### Project Change

- **Reference Source:** No reference counterpart — packaging is a
  from-scratch addition; the real reference project's own final state
  *is* what this lesson produces, not something ported from elsewhere.
- **Files affected:** `package.json` (modified — a new `"build"` key, a
  new `"package"` script).
- **Change type:** Configure.
- **Location:** `package.json`, alongside the existing `"scripts"` key.
- **Dependencies:** `electron-builder` installed as a real dev
  dependency (`npm install --save-dev electron-builder`).

### The New Code — `package.json`

```json
"scripts": {
  "package": "npm run build && electron-builder"
},
"build": {
  "appId": "com.pocketstudio.app",
  "productName": "PocketStudio",
  "files": [
    "dist/**/*",
    "index.html",
    "query_server.py",
    "pocketdb.py",
    "dbapi.py",
    "where_parser.py",
    "pocketdb_engine.dll",
    "package.json"
  ],
  "directories": {
    "output": "release"
  },
  "win": {
    "target": "dir"
  }
}
```

### The Updated Project — `package.json`

```json
{
  "name": "pocket-studio",
  "version": "1.0.0",
  "description": "",
  "main": "dist/main.js",
  "scripts": {
    "build:main": "tsc",
    "build:renderer:types": "tsc -p tsconfig.renderer.json",
    "build:renderer:bundle": "esbuild src/renderer.tsx --bundle --outfile=dist/renderer.js",
    "build": "npm run build:main && npm run build:renderer:types && npm run build:renderer:bundle",
    "start": "npm run build && electron .",
    "package": "npm run build && electron-builder",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "build": {
    "appId": "com.pocketstudio.app",
    "productName": "PocketStudio",
    "files": [
      "dist/**/*",
      "index.html",
      "query_server.py",
      "pocketdb.py",
      "dbapi.py",
      "where_parser.py",
      "pocketdb_engine.dll",
      "package.json"
    ],
    "directories": {
      "output": "release"
    },
    "win": {
      "target": "dir"
    }
  },
  "devDependencies": {
    "@types/node": "^26.2.0",
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.4",
    "electron": "^43.4.0",
    "electron-builder": "^26.15.3",
    "esbuild": "^0.28.2",
    "typescript": "^7.0.2"
  },
  "dependencies": {
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
  }
}
```

`main`, `scripts.start`, `scripts.build`, `devDependencies`,
`dependencies` are all unchanged from Lesson 7's own end state; only
`scripts.package` and the whole `"build"` key are new. `package.json`
now describes both how to run this project in dev (`start`) and how to
produce a real, standalone copy of it (`package`).

### Mechanical Walkthrough

- `"package": "npm run build && electron-builder"` — reappearing
  syntax (`&&` sequencing two npm scripts, already established since
  `"start"` in Lesson 0); the new part is the second command,
  `electron-builder`, a real binary `npm install` placed in
  `node_modules/.bin/`, run with zero arguments, meaning "read the
  `"build"` config out of this same `package.json` and produce
  whatever `win.target` says."
- `"appId": "com.pocketstudio.app"` — first appearance. A real, reverse-
  DNS-style string `electron-builder` uses internally to identify this
  app to the OS (Windows' own registry entries, for anything beyond a
  `"dir"` target); an arbitrary but conventionally unique string, not
  validated against any real registry.
- `"productName": "PocketStudio"` — first appearance. The real, literal
  name used for the output `.exe` (`PocketStudio.exe`) and any window
  title Electron doesn't otherwise override — distinct from `"name"` at
  the top of `package.json` (`"pocket-studio"`, npm's own, separately-
  governed, lowercase-only package name).
- `"files": [...]` — first appearance. A real array of glob patterns,
  each one either included or excluded from the packaged app; this
  project's own list is deliberately exact rather than "everything" —
  `node_modules/react` and `node_modules/react-dom` are picked up
  automatically because `electron-builder` always includes a pruned
  copy of real runtime dependencies, but `src/` (the real TypeScript
  source, never needed at runtime — only `dist/`'s own compiled output
  is) and every dev-only file are deliberately left out.
- `"directories": { "output": "release" }` — first appearance. Where
  `electron-builder` writes the real, finished build; this project's
  own choice, `release/`, keeps it out of `dist/` (already owned by
  `tsc`/`esbuild`'s own real build step) and out of version control the
  same way `dist/` already is.
- `"win": { "target": "dir" }` — first appearance. Tells
  `electron-builder` to produce a real, plain, unpacked folder
  (`release/win-unpacked/`, containing `PocketStudio.exe` directly)
  instead of a real NSIS installer `.exe` — chosen deliberately for
  this curriculum: a `"dir"` build is faster to produce and to launch
  again for the next real verification step, at the real cost of not
  proving the separate, real concern of installer behavior (registry
  entries, uninstall entries, Start Menu shortcuts) at all.

### CS Lens

`electron-builder` is a real, ordinary **build tool** in the same
family as `esbuild` (Lesson 3) or `g++` (`pocket-db`'s own Lesson 0) —
something that reads a project's own real, checked-in source and
declared config, and deterministically produces a real, different
artifact from it. The `"build"` key is not executed; it's read, the
same way `tsconfig.json` is read by `tsc` and never run as code —
**declarative configuration**, one of this whole session's own
recurring shapes.

Also recognized in: Docker's own `Dockerfile` (declarative instructions
read by the `docker build` tool, never executed as a shell script by
the reader), a Java project's `pom.xml`, any CI pipeline's own YAML
file.

### SE Lens

Why reach for a real, external, third-party tool instead of hand-
rolling a script that copies `dist/`, `index.html`, and a `node_modules`
folder into a zip? Because a real, correct Windows build has to handle
several genuinely nontrivial, real concerns this project would
otherwise have to solve itself: which `node_modules` entries are real
runtime dependencies versus dev-only cruft, generating a real,
executable-signed `.exe` with Electron's own prebuilt binary correctly
renamed and embedded, and — the concern this lesson's own next unit
exists because of — producing the real `app.asar` archive at all. The
real, honest cost: `electron-builder` is a large, real, additional dev
dependency (its own install pulls in `@electron/rebuild`, seen in this
lesson's own real build logs), and its own packaging conventions (like
asar) can silently interact with a project's own runtime assumptions in
ways a hand-rolled zip never would have — exactly the real problem the
next unit uncovers.

### Commands Needed

```bash
npm install --save-dev electron-builder
npm run package
```

`npm install --save-dev` — reappearing syntax (Lesson 0) — adds
`electron-builder` to `devDependencies`. `npm run package` runs this
lesson's own new script: a full `npm run build` (Lesson 3's own
three-stage `tsc`/`tsc`/`esbuild` pipeline), then `electron-builder`
itself.

### Run It

Real output from this session's own packaging run:

```text
• electron-builder  version=26.15.3 os=10.0.26200
• loaded configuration  file=package.json ("build" field)
• executing @electron/rebuild  electronVersion=43.4.0 arch=x64 buildFromSource=false
• installing native dependencies  arch=x64
• completed installing native dependencies
• packaging       platform=win32 arch=x64 electron=43.4.0 appOutDir=release\win-unpacked
• downloaded electron zip extracted successfully  output=...\release\win-unpacked
• updating asar integrity executable resource  executablePath=release\win-unpacked\PocketStudio.exe
• signing with signtool.exe  path=release\win-unpacked\PocketStudio.exe
```

A real `release/win-unpacked/PocketStudio.exe` exists on disk. Whether
it actually *works* is the rest of this lesson.

### Connection

A real build exists. The next unit finds out — for real, not by
assumption — whether this project's own Python sidecar still works
inside it.

---

## Concept Unit: Why Python Can't See Inside `app.asar`

### The Problem

`getDbClient()` (Lesson 2) builds `query_server.py`'s own path with
`path.join(__dirname, "..", "query_server.py")`. Under `npm start`,
`__dirname` is a real, ordinary folder (`dist/`) sitting next to a real,
ordinary `query_server.py`. Inside the packaged build this lesson's
first unit just produced, `query_server.py` was one of this project's
own `"files"` entries — which means `electron-builder` packed it into
`app.asar`, exactly like `dist/main.js` itself. `__dirname` inside that
build resolves to a path *inside* `app.asar` — and `query_server.py`
gets spawned as a real, separate, external `python.exe` process, not
run by Electron's own patched Node at all.

### Introduce the Concept in Isolation

The real, exact command Node's own `spawn` would run, executed directly
in a terminal against this lesson's own first, unfixed build:

```bash
python "release/win-unpacked/resources/app.asar/query_server.py"
```

Real, captured output:

```text
C:\Users\g4m3r\AppData\Local\Microsoft\WindowsApps\python.exe: can't open file 'C:\...\release\win-unpacked\resources\app.asar\query_server.py': [Errno 2] No such file or directory
EXIT CODE: 2
```

*What this proves:* `app.asar` is a real, single, ordinary file on
disk — `resources\app.asar\query_server.py` is not a real path
Windows or Python understands at all, the identical real shape as
trying to open `C:\photo.jpg\thumbnail.png` — a normal file with
something appended past its own end. Electron's own patched Node
`fs`/`require` quietly special-case any path containing `.asar` and
reach inside the archive; a plain `python.exe`, launched as a genuinely
separate OS process, has no such patch and never will.

This is the real, second, honest finding this project's own
`PocketDBClient` (Lesson 2) surfaces here: it never listens to
`this.process.on("exit", ...)` or reads `this.process.stderr` at all —
so this exact, real failure doesn't even produce a rejected `Promise`.
`getDbClient()`'s own `await dbClient.request("open", ...)` just never
resolves. A real, instrumented launch of this lesson's own first,
unfixed build confirms it: the renderer's own `listTables()` call hangs
indefinitely, with nothing — no error, no console message — showing why.
Named here as a real, deliberate, deferred exercise (below), not fixed
in this lesson: this lesson's own, narrow, real scope is the asar path
itself, the same honest incremental-scope judgment Lesson 7's own
closing section already used.

### Discard the Throwaway Example

The direct `python resources/app.asar/query_server.py` command above
was run only to isolate and confirm the real root cause; it is not part
of the project and is not run again.

### Mechanical Walkthrough

- `python "release/...app.asar/query_server.py"` — reappearing syntax
  (the real `python <script>` invocation form, established
  `pocket-db`-side and reused since this project's own Lesson 2); the
  new, real fact is only in the *path itself*, not the syntax.
- `[Errno 2] No such file or directory` — Python's own real, standard
  `OSError` errno for "the path doesn't resolve to a real file" —
  identical, real errno Python raises for a plain, ordinary typo in a
  path; nothing asar-specific about the error text itself, which is
  exactly why the *cause* needed a deliberate, isolated proof rather
  than being inferred from the message alone.

### CS Lens

A build step that changes *how* files are stored while leaving code
that assumes an ordinary filesystem untouched is a real, recurring
shape: something outside the packaging tool's own runtime has to be
told about the change explicitly, or it silently breaks.

Also recognized in: a Java `.jar`'s own bundled native `.so`/`.dll`
libraries, which the JVM must extract to a real, loose temp file before
`System.loadLibrary` (a real OS-level dynamic linker, exactly like
`pocket-db`'s own `ctypes.CDLL`) can open them; a Docker image's own
files, invisible to any process running outside that specific
container unless explicitly bind-mounted; a Python `.whl` bundling
compiled C-extension binaries, unpacked to real disk before `import`
can load them.

### SE Lens

Why does Electron default to packing *everything* — including files a
real, external process needs — into `app.asar`, instead of defaulting
to loose files everywhere? Because for the overwhelmingly common case
(an app with no external, non-Electron process at all), a single real
file is a genuine, measurable win: far fewer real filesystem `open`
syscalls on startup, and a mild, real deterrent against casual
tampering. The real, honest cost is exactly what this unit found:
whatever narrow set of files a genuinely external process needs by a
real path has to be named, explicitly, or the packaging tool's own
default silently breaks it — invisible until someone actually runs the
packaged build, not the dev one.

### Commands Needed

No new commands for this unit — the isolating command above reuses
`python`, already established.

### Run It

Shown above, under "Introduce the Concept in Isolation."

### Connection

The real, exact cause is confirmed, not assumed. Fixing it is next.

---

## Concept Unit: `asarUnpack` and a Packaged-Aware Path

### The Problem

`query_server.py` and its own real Python dependencies
(`pocketdb.py`, `dbapi.py`, `where_parser.py`, `pocketdb_engine.dll`)
need to exist as real, loose files on disk once packaged — but only
those five; everything else (`dist/`, `index.html`) can stay inside
`app.asar` exactly as before, since Electron's own patched Node reads
those just fine.

### Project Change

- **Reference Source:** No reference counterpart — the real reference
  project's own final `package.json`/`main.ts` state *is* what this
  unit produces.
- **Files affected:** `package.json` (modified — a new `asarUnpack`
  key), `src/main.ts` (modified — `resourceDir()`, and every path built
  from it).
- **Change type:** Add.
- **Location:** `package.json`, inside the existing `"build"` key,
  alongside `"files"`; `src/main.ts`, replacing the two
  `path.join(__dirname, "..", ...)` calls inside `getDbClient()`.
- **Dependencies:** This lesson's own first two units.

### The New Code — `package.json`

```json
"asarUnpack": [
  "query_server.py",
  "pocketdb.py",
  "dbapi.py",
  "where_parser.py",
  "pocketdb_engine.dll"
]
```

### The Updated Project — `package.json`

```json
"build": {
  "appId": "com.pocketstudio.app",
  "productName": "PocketStudio",
  "files": [
    "dist/**/*",
    "index.html",
    "query_server.py",
    "pocketdb.py",
    "dbapi.py",
    "where_parser.py",
    "pocketdb_engine.dll",
    "package.json"
  ],
  "asarUnpack": [
    "query_server.py",
    "pocketdb.py",
    "dbapi.py",
    "where_parser.py",
    "pocketdb_engine.dll"
  ],
  "directories": {
    "output": "release"
  },
  "win": {
    "target": "dir"
  }
}
```

`"build"` as a whole is unchanged from this lesson's own first unit
except for the new `"asarUnpack"` key, placed alongside `"files"` —
the same real config object, now telling `electron-builder` that five
of the files it already packs into `app.asar` need a real, loose copy
sitting next to it too.

### The New Code — `src/main.ts`

```typescript
function resourceDir(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, "app.asar.unpacked")
    : path.join(__dirname, "..");
}
```

### The Updated Project — `src/main.ts`

```typescript
let dbClient: PocketDBClient | null = null;

function resourceDir(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, "app.asar.unpacked")
    : path.join(__dirname, "..");
}

async function getDbClient(): Promise<PocketDBClient> {
  if (!dbClient) {
    const dir = resourceDir();
    dbClient = new PocketDBClient(
      "python",
      path.join(dir, "query_server.py"),
      "C:\\msys64\\ucrt64\\bin"
    );
    await dbClient.request("open", { path: path.join(dir, "games.pdb") });
  }
  return dbClient;
}
```

`getDbClient()`'s own real, lazy-initialization shape (Lesson 2) is
unchanged — still creates one, real, shared `PocketDBClient` on first
use. The only real change: both paths it builds now go through
`resourceDir()` instead of a bare `path.join(__dirname, "..")`, so the
exact same function correctly serves both `npm start` and a packaged
build without a second, separate code path for each.

### Mechanical Walkthrough

- `"asarUnpack": [...]` — first appearance. A real array of glob
  patterns, matched against the same set `"files"` already includes;
  every matching file is still *listed* inside `app.asar` (a real,
  small stub entry pointing at the real, unpacked copy — confirmed this
  session via `asar list`, which still shows `query_server.py` in the
  archive's own listing) but its real, actual bytes are extracted to a
  sibling, real, ordinary folder, `app.asar.unpacked/`, at package time.
- `app.isPackaged` — first appearance (see Header). A real, direct
  boolean read, no method call.
- `path.join(process.resourcesPath, "app.asar.unpacked")` —
  `path.join` is reappearing syntax (Lesson 0); `process.resourcesPath`
  is first appearance (see Header) — the real, absolute path to
  `release/win-unpacked/resources/`, the folder `app.asar` and
  `app.asar.unpacked/` are real, actual siblings inside.
- `path.join(__dirname, "..")` (the dev-mode branch) — reappearing,
  unchanged from Lesson 2 — `__dirname` here still means `dist/`, still
  a real, ordinary folder, since `npm start` never touches `app.asar`
  at all.
- The ternary `app.isPackaged ? ... : ...` — reappearing syntax
  (already used inside `App.tsx` since Lesson 4's own conditional
  rendering); the new, real fact is only that this ternary picks
  between two real filesystem locations, not two pieces of JSX.

### CS Lens

`resourceDir()` is a small, real instance of **environment-aware
configuration** — one function computing the correct real value for
"where do my own files live" by checking which real environment it's
actually running in, instead of the caller (`getDbClient()`) needing to
know or care.

Also recognized in: an app reading `NODE_ENV` to pick a real
development-vs-production database URL; a mobile app choosing a real
debug or release API endpoint at build time; `pocket-db`'s own
`ctypes.CDLL` needing a different real path depending on whether it's
loading `pocketdb_engine.dll` from a dev build directory or an
installed one.

### SE Lens

Why fix this by branching on `app.isPackaged` inside `main.ts`, instead
of just never asar-packing anything at all (`"asar": false` is a real,
valid `electron-builder` option)? Because the real, honest tradeoff
runs the other way for this specific project: only five, real, small
files genuinely need to be loose; `dist/main.js`, `dist/renderer.js`,
and the rest of this project's own real, compiled TypeScript output
have no real reason to leave `app.asar` at all, and turning packing off
entirely would give up asar's own real, small, legitimate benefits
(fewer real file reads, the mild real tamper-deterrent) project-wide to
solve a problem that only ever touched five specific files.

### Commands Needed

```bash
npm run build
npx electron-builder --dir
```

`npx electron-builder --dir` — reappearing tool (this lesson's own
first unit), the new part is the explicit `--dir` flag, forcing the
`"dir"` target directly from the command line without re-reading
`win.target` — used here, and for the rest of this lesson's own real
verification, to iterate faster than the full `npm run package` script.

### Run It

Real output confirming the fix took effect — `app.asar`'s own listing
still names the five files, and `app.asar.unpacked/` now genuinely
exists beside it:

```text
--- app.asar contents (excerpt) ---
\dbapi.py
\dist\main.js
\pocketdb.py
\pocketdb_engine.dll
\query_server.py
\where_parser.py

--- unpacked dir ---
-rw-r--r-- 1 g4m3r 197610   2989 dbapi.py
-rw-r--r-- 1 g4m3r 197610   6994 pocketdb.py
-rwxr-xr-x 1 g4m3r 197610 992878 pocketdb_engine.dll
-rw-r--r-- 1 g4m3r 197610   1662 query_server.py
-rw-r--r-- 1 g4m3r 197610   1365 where_parser.py
```

Whether it actually *runs* correctly from inside the real, packaged
`.exe` — not just whether the files exist — is the final unit.

### Connection

The real fix is in place. The next, final unit proves it end-to-end,
against the real, standalone binary this time, not a dev script.

---

## Concept Unit: Proving It Against the Real, Standalone Binary

### The Problem

Every earlier lesson's own real verification worked by requiring a
`.js` file straight into a local `electron` binary
(`electron.exe some-script.js`), letting the script call
`BrowserWindow`, attach listeners, and drive the whole thing directly.
`release/win-unpacked/PocketStudio.exe` is a real, different kind of
thing — a genuinely standalone, signed executable with no script
argument slot at all. Proving this lesson's own fix actually works
needs a real way to reach into *that* window from the outside.

### Introduce the Concept in Isolation

Every real Chromium-based process — including this real
`PocketStudio.exe` — can be started with a real, standard flag asking
it to open a debugging port:

```bash
./PocketStudio.exe --remote-debugging-port=9333
```

Then, from a separate, real Node script, the real CDP handshake:

```javascript
const res = await fetch("http://127.0.0.1:9333/json");
const targets = await res.json();
const page = targets.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
```

Real, captured result — the exact shape `targets` comes back as (one
entry, trimmed to its real, relevant fields):

```json
[
  {
    "type": "page",
    "title": "PocketStudio",
    "webSocketDebuggerUrl": "ws://127.0.0.1:9333/devtools/page/<id>"
  }
]
```

*What this proves:* `--remote-debugging-port` really does open a real,
local HTTP server describing every real, currently-open window as JSON
— `fetch`, a browser/Node API already used since this project's own
`App.tsx`, works against it exactly like any other real HTTP endpoint.
This is called the **Chrome DevTools Protocol**, named in the Header
above — the same real protocol tools like Puppeteer and Playwright are
themselves built on.

### Discard the Throwaway Example

The isolated `fetch`/target-discovery snippet above is absorbed
directly into this project's own real verification script, shown next
— nothing here is thrown away, since the verification script *is* the
real, permanent artifact this unit produces.

### Project Change

- **Reference Source:** No reference counterpart — this is this
  project's own new, real verification tooling, not app code.
- **Files affected:** a new, standalone Node script (kept outside the
  packaged app itself — real verification tooling, not a runtime
  dependency).
- **Change type:** Add.
- **Location:** N/A — a new, freestanding script.
- **Dependencies:** This unit's own first step (the real CDP handshake).

### The New Code — real verification script (excerpt)

```javascript
await send("Runtime.enable", {});
const domResult = await send("Runtime.evaluate", {
  expression: "document.getElementById('root').innerHTML",
  returnByValue: true,
});
const ipcResult = await send("Runtime.evaluate", {
  expression: "window.pocketStudio.listTables().then(r => JSON.stringify(r))",
  awaitPromise: true,
  returnByValue: true,
});
```

### The Updated Project — full round-trip proof

```javascript
const evalExpr = `
  (async () => {
    await window.pocketStudio.createTable("games", { id: 0, player: 1, score: 0 });
    await window.pocketStudio.insertRow("games", ["1", "'alice'", "42"]);
    const tables = await window.pocketStudio.listTables();
    const rows = await window.pocketStudio.getRows("games");
    return JSON.stringify({ tables, rows });
  })()
`;
const result = await send("Runtime.evaluate", {
  expression: evalExpr,
  awaitPromise: true,
  returnByValue: true,
});
```

This reuses `send`, the same small `Runtime.evaluate`-over-WebSocket
helper the excerpt above already established, now driving this
project's own full, real feature set — `createTable`, `insertRow`,
`listTables`, `getRows`, all four already real, working, permanent
`window.pocketStudio` methods since Lessons 1 and 6 — against the
genuinely packaged binary.

### Mechanical Walkthrough

- `"Runtime.enable"` — first appearance of a real, named CDP *domain
  method*, sent as a JSON message over the WebSocket opened above; a
  required real handshake step before `Runtime.evaluate` will accept
  any further calls.
- `"Runtime.evaluate"` — first appearance. Runs a real string of
  JavaScript directly inside the real, remote page's own execution
  context — the real, CDP-native equivalent of typing into that
  window's own DevTools console by hand.
- `expression: "document.getElementById('root').innerHTML"` —
  reappearing syntax (`getElementById`, `.innerHTML`, both already used
  since this project's own earlier, dev-mode `executeJavaScript`
  verification calls) — the new, real fact is only *how* it's sent
  (over CDP instead of Electron's own `webContents.executeJavaScript`),
  not what it reads.
- `awaitPromise: true` — first appearance. A real CDP option telling
  `Runtime.evaluate` that the given expression returns a real `Promise`
  it should wait on before replying — without it, `Runtime.evaluate`
  would return the pending `Promise` object itself, not its real,
  eventual value.
- `returnByValue: true` — first appearance. A real CDP option asking
  for the real, actual JSON-serializable value back, instead of a
  remote object reference a caller would need a second, separate call
  to dereference.
- `window.pocketStudio.createTable(...)`,`.insertRow(...)`,
  `.listTables()`, `.getRows(...)` — all reappearing, unchanged real
  methods (Lessons 1, 6) — the real point of this walkthrough step is
  that *nothing about the app's own real code changed* to make it
  testable this way; only the outside verification technique did.

### CS Lens

Reaching a real, running process through a real, documented protocol
instead of requiring code into it directly is **black-box testing** —
verifying real, observable behavior (the DOM, the real IPC responses)
without any special access to, or dependency on, the internals being
tested.

Also recognized in: Selenium/Playwright driving a real, ordinary
browser the exact same way; a database's own real, separate admin port
(distinct from its main query port); Android's own `adb`, bridging a
real, physical device over USB using a comparable real, documented
protocol.

### SE Lens

Why not just double-click `PocketStudio.exe` and look at it? Because a
real, one-time manual glance can't be rerun automatically, can't be
included in a real CI pipeline, and — the standard this whole
curriculum has held since `pocket-db`'s own first lesson — isn't
provable the same way a captured, real, pasted result is. The real,
honest cost: CDP-based verification is a heavier, real script than
`executeJavaScript` ever needed, and only exists because a genuinely
packaged, signed binary can't be required into like a dev script — a
real, permanent asymmetry between verifying dev builds and verifying
shipped ones.

### Commands Needed

No new commands beyond `node <script>.js`, already established.

### Run It

Real, captured output from this session's own packaged binary, run
against the fix from this lesson's own third unit:

```text
ROUND_TRIP_RESULT: {"tables":["games"],"rows":{"columns":["id","player","score"],"rows":[["1","''alice''","42"]]}}
```

And, checked directly on disk immediately after, confirming the real
`.pdb` file this run created genuinely persisted inside
`app.asar.unpacked/` — not a temp location, not silently discarded:

```text
-rw-r--r-- games.pdb
```

*What this proves:* the real, packaged `PocketStudio.exe` spawns its
own real Python sidecar, finds `query_server.py` and every one of its
own real dependencies correctly from `app.asar.unpacked/`, creates and
writes a real `.pdb` file there, and returns real, correct results back
across both of this project's own real process boundaries — all from a
genuinely standalone binary, with no dev tooling involved at all.

### Connection

S08 is complete. Every real capability this project has built since
Lesson 1 now provably works from an actual, installed build — not just
`npm start`.

---

## Closing

### Connect the Pieces

`npm run package` (Unit 1) produced a real `PocketStudio.exe` — which
this lesson's own second unit proved, for real, could not actually
open a database at all, because `query_server.py` had been packed
inside `app.asar`, a real, ordinary file no external `python.exe` can
read past. The third unit's own `asarUnpack` config plus
`resourceDir()`'s real `app.isPackaged` branch fixed exactly that,
extracting five, real, specific files to `app.asar.unpacked/` and
teaching `main.ts` where to find them at runtime. The fourth unit
proved the fix — not assumed it — by opening a real CDP connection into
the actual, standalone `.exe` and driving this project's own full,
real feature set (`createTable`, `insertRow`, `listTables`, `getRows`)
against it directly, confirming a real `games.pdb` file was created and
correctly persisted inside the packaged build's own real,
unpacked resources.

### What Breaks Without This

Remove `asarUnpack` from `package.json`, rebuild, repackage, and launch
the real `.exe` again with the identical CDP verification script.
`window.pocketStudio.listTables()` never resolves at all — this
lesson's own second unit's real finding — because `PocketDBClient`
never listens for the spawned Python process's own real exit or
stderr, so a real
`can't open file '...app.asar\query_server.py': [Errno 2] No such file or directory`
happens invisibly, inside a process nothing in this project reads from.
Restore `asarUnpack` and confirm the real round-trip result returns
again.

### Exercises

- `PocketDBClient` (Lesson 2) still has no real handling for its own
  spawned process exiting or writing to `stderr` — this lesson's own
  second unit named it directly. Add a real `this.process.on("exit", ...)`
  listener that rejects every still-`pending` request with a real,
  readable error, so a future packaging mistake fails loudly instead of
  hanging forever.
- This lesson's own `win.target: "dir"` never produces a real installer
  — a user still has to be handed a whole folder. Change it to `"nsis"`
  and produce a real, actual `PocketStudioSetup.exe`; note which of
  this lesson's own real assumptions (`process.resourcesPath`,
  `asarUnpack`) still hold identically, and which real, new concerns
  (a real Windows install location, likely `C:\Program Files\`,
  possibly not writable without elevation — this project's own
  `games.pdb` currently gets created right next to
  `query_server.py`, inside the app's own install directory) an
  installer target would newly introduce.
- Add a real app icon (`win.icon` in the `"build"` config, pointing at
  a real `.ico` file) instead of `electron-builder`'s own default,
  confirmed via this lesson's own build log's
  `"default Electron icon is used"` line.

### Definition of Done

- [ ] `package.json`'s own `"build"` key includes `asarUnpack` naming
      all five real Python-side files.
- [ ] `src/main.ts`'s own `resourceDir()` exists and both real paths in
      `getDbClient()` are built from it.
- [ ] You reproduced the real, unfixed failure yourself (the direct
      `python resources/app.asar/query_server.py` command, or a full
      CDP-instrumented launch of an unfixed build) and saw the real
      `[Errno 2]` error or the real, silent hang.
- [ ] `npm run package` produces a real `release/win-unpacked/PocketStudio.exe`.
- [ ] A CDP-instrumented run against that real `.exe` shows a real,
      successful `createTable`/`insertRow`/`listTables`/`getRows`
      round trip, and a real `games.pdb` file exists afterward inside
      `app.asar.unpacked/`.
- [ ] Committed with a message stating why, for example:
      `git commit -m "Unpack the Python sidecar from asar so the packaged build can actually spawn it"`.
