# Lesson 0: Project Startup — One Shared Playground, Not One Project Per Lesson

**What you will build:** a single project, `fullstack-playground/`, that every lesson in this curriculum will live inside. By the end you will have a working Vite + React + TypeScript app, an ESLint flat config that actually catches real mistakes (you'll cause one on purpose and watch it get caught), a folder layout that makes every lesson deletable without breaking any other lesson, and two small scripts that let you switch between lessons from the command line. The transferable problem this lesson is actually about: every one of these pieces exists to solve a real failure mode of "just start coding" — untyped JS breaking at runtime, one lesson's code silently depending on another's, a linter that can't tell you anything because it isn't configured, a project you can't run because you forgot which folder had the server.

**What you need to know first:** nothing — this is the first lesson.

**Reference Source:** `full.brd.md`, "1. Shared Playground" (the project tree) and "Shared code rule" (the isolation rule), read this session.

## Terms used in this lesson

- **Scaffold** — a starting set of files a tool generates for you so a project is runnable on the first command, instead of you assembling a build pipeline by hand. Exists because "runnable and empty" and "not runnable yet" are different starting points, and every tutorial that skips scaffolding quietly assumes you already have one.
- **Bundler** — a tool that takes many source files (`.tsx`, `.css`, ...) and turns them into the small number of files a browser can actually load. Exists because browsers didn't historically understand TypeScript, JSX, or "import this file from that file" the way your source code writes it.
- **Dev server** — a local HTTP server, running on your machine, that serves your in-progress app and rebuilds it on save. Exists so you see changes in a real browser in under a second instead of re-running a full build.
- **Package manager** — a program (`npm`, here) that downloads the libraries your code depends on and records exactly which versions, so the project is reproducible on another machine. Exists because "it works on my machine" is a real failure mode when dependency versions drift.
- **Dependency** — a library your *shipped* code needs at runtime (e.g. `react`). Exists as its own category because it changes what actually gets bundled and sent to a user's browser.
- **Dev dependency** — a tool you need only while *building or checking* the code (e.g. `typescript`, `eslint`) — never shipped to a user. Exists so the thing a browser downloads doesn't carry your entire toolchain.
- **Static typing** — a system where a variable's shape is checked before the program ever runs, by reading the source, not by running it. Exists to catch a whole category of mistakes (calling a method that doesn't exist on this value) before a user ever hits them.
- **Linter** — a tool that reads your source code without running it and flags patterns that are likely mistakes, independent of whether the code is syntactically valid. Exists because "compiles" and "doesn't compile to a bug" are different bars — a linter checks the second one.
- **Flat config** — ESLint's current configuration format: a single JavaScript file exporting an *array* of plain config objects, each one saying "these rules apply to these files." Replaces an older nested-inheritance format (`.eslintrc`) that made it hard to answer "which rule set actually applies to this specific file" by reading the config alone.
- **Module** — one source file, with its own explicit `import`/`export` statements, as the unit of code reuse. Exists so "what does this file depend on" is answered by reading its own top few lines, not by knowing load order.
- **Dynamic import** — importing a module by a *path computed at runtime*, using `import()` as a function instead of `import` as a fixed statement, which returns a Promise instead of finishing before the rest of the file runs. Exists because a normal `import` needs a literal, fixed path known when the file is written — it cannot express "load whichever lesson the user picked a second ago."
- **Child process** — a second, separate operating-system process, launched and controlled by your running program. Exists because a single Node process can't be your build tool, your dev server, *and* your API server all at once without them blocking each other.

## Objects and methods used

- **`npm create vite@latest`**
  - *What it is:* npm's mechanism for running a scaffolding tool without permanently installing it first.
  - *Implementation:* `npm create <name>` is shorthand for `npm exec create-<name>` — it downloads `create-vite` from the npm registry into a throwaway cache location, runs it once, and doesn't add it to your project's own dependencies.
  - *Its use:* generates the initial `fullstack-playground/` file tree (below) instead of you hand-writing a build config from nothing.
- **`defineConfig`** (from `vite`)
  - *What it is:* a plain identity function — it takes a config object and returns the same object, unchanged, at runtime.
  - *Implementation:* `function defineConfig(config: UserConfig): UserConfig { return config }`, roughly — it does nothing at runtime.
  - *Its use:* exists purely so your editor knows the shape of the object you're writing (TypeScript infers the type from the function's own signature), catching a misspelled config key before you ever run Vite.
- **`tseslint.config`** (from `typescript-eslint`)
  - *What it is:* a small helper that flattens and type-checks an ESLint flat-config array.
  - *Implementation:* takes any number of config objects or arrays of them, and returns one flat array — `tseslint.config(a, b, [c, d])` becomes `[a, b, c, d]`.
  - *Its use:* lets you nest `extends: [...]` inside one config entry (ordinary ESLint flat config doesn't support `extends` as a key at all) and pass whole rule-set objects as if they were files being merged in.
- **`import.meta.glob`** (Vite-only, not a web standard)
  - *What it is:* a build-time function that turns a file-path pattern into a map of `{ path: importFunction }`.
  - *Implementation:* `import.meta.glob('../lessons/*/web/*.tsx')` returns an object like `{ '../lessons/001-counter/web/Counter.tsx': () => import('../lessons/001-counter/web/Counter.tsx'), ... }` — one lazy-import function per matching file, decided by Vite at build time by literally scanning the filesystem for that pattern.
  - *Its use:* lets the Playground shell discover lesson components that don't exist yet when the shell itself is written, without maintaining a manually updated list.
- **`lazy`** (from `react`)
  - *What it is:* wraps a component-loading function so React only fetches that component's code the first time it's actually rendered.
  - *Implementation:* `lazy(loader: () => Promise<{ default: ComponentType }>): ComponentType` — returns something you use exactly like a normal component in JSX, but its first render suspends until the promise resolves.
  - *Its use:* pairs with `import.meta.glob`'s dynamic import functions so selecting a lesson only downloads that lesson's code, not all 81 lessons' code at once.
- **`spawn`** (from Node's `child_process`)
  - *What it is:* starts a new OS process and gives you a live handle to it (its stdout, its exit event) instead of blocking until it finishes.
  - *Implementation:* `spawn(command: string, args: string[], options): ChildProcess` — `options.stdio: 'inherit'` connects the child's terminal output directly to your own, so you see it live instead of having to collect and re-print it yourself.
  - *Its use:* lets one script start both the Vite dev server and, when a lesson has one, that lesson's API server, as two independent processes running side by side.

---

## Concept Unit 1: Scaffolding with Vite

### The Problem

You need a project that can turn `.tsx` files into something a browser can run, reload automatically when you save, and understand TypeScript — before you can write a single lesson. Assembling that by hand (a bundler config, a dev server, TypeScript wiring, React's JSX transform) is itself a multi-hour task with nothing to show for it, and it's not what this curriculum is teaching. Every real frontend project starts from a scaffold for exactly this reason.

### Introduce the Concept in Isolation

Run this in an empty directory, and watch what actually happens rather than trusting the one-line description above:

```text
$ npm create vite@latest fullstack-playground -- --template react-ts

npm WARN exec The following package was not found and will be installed: create-vite@9.1.2
│
◇  Scaffolding project in .../fullstack-playground...
│
└  Done. Now run:

  cd fullstack-playground
  npm install
  npm run dev
```

This is a real, executed run, on Node v24.14.1 / npm 9.8.1. What it proves: `create-vite` was never installed on this machine before this command — npm fetched it, ran it once, and (per npm's own message) will not keep it around as a project dependency. The tool's whole job was to write files to disk and then get out of the way; it isn't part of your app.

**This is called scaffolding.**

### Discard

That throwaway run's only purpose was to prove the command actually does something real, not silently fail. You will run the real version of this command yourself, for the real project, in the next step — this exact throwaway directory is not part of it.

### Project Change

- **Reference Source:** `full.brd.md` §1 — the tree starting `fullstack-playground/` through `└── README.md`.
- **Files affected:** creates the entire `fullstack-playground/` directory — nothing exists yet.
- **Change type:** create.
- **Location:** wherever you keep this curriculum's code (a sibling of the lesson docs, not inside them).
- **Dependencies:** Node and npm installed. (This lesson was built against Node v24.14.1, npm 9.8.1 — an older Node 20 LTS also works; Vite's own docs state its minimum.)

### The New Code — type it yourself

```text
npm create vite@latest fullstack-playground -- --template react-ts
```

### The Updated Project

Running that command produces this real, complete tree (verified this session — nothing elided):

```text
fullstack-playground/
├── .gitignore
├── index.html
├── package.json
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── README.md
├── src/
│   ├── App.css
│   ├── App.tsx
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── index.css
│   └── main.tsx
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

This is a real, running app already — `App.tsx` is a demo counter page, not yet the curriculum's own shell. Concept Unit 5 replaces it. For now, this is the ground everything else in this lesson builds on.

### Mechanical Walkthrough

Enumerating the command itself, piece by piece, since it's the "code" for this unit:

- `npm create vite@latest` — `npm create` is the npm CLI subcommand that runs a scaffolding package once via `npx`-style execution; `vite` names the scaffolding tool (npm expands this to the package `create-vite`); `@latest` pins which published version of `create-vite` to fetch, not which version of Vite itself ends up in your project — those are two different version numbers, resolved separately (Vite's own version is decided later, when `npm install` reads `package.json`).
- `fullstack-playground` — the first positional argument to `create-vite`, taken as the folder name to create and the initial `name` field inside the generated `package.json`.
- `--` — not part of `create-vite`'s own arguments; this is npm's separator meaning "stop parsing flags for `npm` itself, pass everything after this literally to the program being run." Without it, `--template` would be parsed as a flag to `npm create`, not to `create-vite`.
- `--template react-ts` — tells `create-vite` which starter to copy in; `react-ts` specifically means React plus TypeScript, as opposed to `react` (JavaScript only) or a different framework entirely (`vue`, `svelte`, ...). This one flag is the reason the generated tree already has `.tsx` files and `tsconfig.json`s rather than plain `.jsx`.

### CS Lens

Not applicable at meaningful depth here — this unit is a CLI invocation, not an algorithm or data structure.

### SE Lens

The alternative not chosen: hand-assembling a bundler config from a blank file. The real tradeoff is between control and reproducibility — a hand-rolled config gives you nothing extra for a lesson-numbered playground project, and it costs hours of setup that produce zero teaching value, plus a config that's yours alone to debug when it breaks in a way an established scaffold's community has already hit and documented. Maintenance cost of the scaffold path: you inherit whatever opinions the `react-ts` template ships with (seen concretely in Concept Unit 3 and 4, where two of those opinions get deliberately overridden) — accepting a scaffold means reading what it generated, not assuming it's already correct for you.

### Commands Needed

- `npm create vite@latest fullstack-playground -- --template react-ts` — as walked through above.
- `cd fullstack-playground` — every command from here on assumes you're inside this folder.
- `npm install` — reads `package.json` (next unit) and downloads every listed dependency into `node_modules/`. Success looks like `added N packages` with no red `npm ERR!` lines.

### Run It

Real, executed output from `npm install` in the scaffolded project this session:

```text
added 7 packages, and audited 8 packages in 3s

2 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

### Connection

Everything else in this lesson edits or adds to the tree this command just generated — nothing after this point starts from an empty folder again.

---

## Concept Unit 2: `package.json` — Dependencies, Dev Dependencies, and Scripts

### The Problem

Two questions the project needs answered before anything else: *which libraries does the running app actually need*, and *what commands does a person type to build, check, or run it*? Without a single agreed file answering both, every teammate (or every future lesson) reinvents its own answer.

### Introduce the Concept in Isolation

The scaffold from Unit 1 already generated a real one — read it as the isolated example, since fabricating a smaller fake one would teach a shape that doesn't match what you actually have on disk. Real, verified content:

```json
{
  "name": "fullstack-playground",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
  },
  "devDependencies": {
    "@types/node": "^24.13.3",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.4",
    "oxlint": "^1.75.0",
    "typescript": "~6.0.2",
    "vite": "^8.2.0"
  }
}
```

What this proves: `react`/`react-dom` — the libraries the *shipped app* actually calls at runtime — sit under `dependencies`. Everything else (the type checker, the bundler, its React plugin, a linter) sits under `devDependencies`, because a user's browser never runs any of them; only your own machine does, while you're building or checking the code.

### Discard

This file isn't discarded — it's real and stays. What's being isolated here is *reading* it in isolation from everything else in the tree, before editing it.

### Project Change

- **Reference Source:** no counterpart in `full.brd.md` — the BRD names the file but not its contents; this unit's edit is a from-scratch decision, driven by what the curriculum's own tooling (Concept Unit 7's scripts) needs.
- **Files affected:** `fullstack-playground/package.json`, modified.
- **Change type:** replace one field, add two.
- **Location:** the top-level `"scripts"` object.
- **Dependencies:** none new yet — this edit only changes which command runs, not what's installed. (Unit 4 adds real new dev dependencies.)

### The New Code — type it yourself

```json
"lint": "eslint .",
"lesson": "tsx scripts/run-lesson.ts",
"lesson:reset": "tsx scripts/reset-lesson.ts"
```

### The Updated Project

The full `"scripts"` object, with the changed and added lines marked — nothing elided:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",             // ← changed, was "oxlint"
  "preview": "vite preview",
  "lesson": "tsx scripts/run-lesson.ts",       // ← new
  "lesson:reset": "tsx scripts/reset-lesson.ts" // ← new
}
```

`"scripts"` as a whole now maps every command this project supports to its real underlying invocation: `npm run dev` starts the bundler's own dev server; `npm run build` type-checks (`tsc -b`) *before* bundling for production, so a type error stops the build instead of shipping broken code; `npm run lint` runs static analysis; `npm run lesson -- <n>` (Concept Unit 7) and `npm run lesson:reset -- <n>` will select and reset a specific lesson.

### Mechanical Walkthrough

- `"lint": "eslint ."` — `eslint` is the CLI binary npm installs into `node_modules/.bin/` once it's a dev dependency (added for real in Unit 4); `.` is its own first argument, meaning "lint files starting from the current directory," using whatever `eslint.config.js` it finds. This *replaces* the scaffold's own default (`oxlint`, a different, faster linter the current Vite scaffold ships by default) — a deliberate substitution, not an addition, because this curriculum's own reference document names `eslint.config.js` specifically.
- `"lesson": "tsx scripts/run-lesson.ts"` — `tsx` is a dev-dependency binary (installed in Unit 4) that runs a `.ts` file directly, without a separate compile step first; `scripts/run-lesson.ts` is a plain relative path to a file that doesn't exist yet (built in Concept Unit 7).
- `"lesson:reset"` — same shape as `"lesson"`, a separate script name pointing at a separate file; npm scripts don't share a namespace with functions or take parameters the way a function call would — each one is just a full shell command string, looked up by its key.

### CS Lens

`npm install` itself, one layer below this file, is solving a real constraint-satisfaction problem: every package's `^`/`~`-prefixed version range is a constraint, and npm has to find one concrete version per package that satisfies every constraint simultaneously (including transitive dependencies' own constraints) — the same *shape* of problem as a SAT solver, just specialized to semantic-versioning ranges instead of boolean clauses.

### SE Lens

The alternative not chosen: leaving `oxlint` as the linter, since the scaffold already wired it up for free. The real tradeoff: `oxlint` is faster and needs near-zero config, but this curriculum's own schema and BRD were written assuming ESLint's flat-config format (`eslint.config.js`) — an explicit, named file in the project's own spec. Keeping `oxlint` would mean the *actual* project silently drifts from what its own documentation says exists, which is a worse failure than a slower lint command: a reader who opens `eslint.config.js` expecting it to be the real config, and finds it stale or missing, has been actively misled by the project, not just inconvenienced.

### Commands Needed

None new — this unit only edits a file; Unit 4 introduces the commands that make `npm run lint` actually work again after this change.

### Run It

Not runnable in isolation yet — `"lint": "eslint ."` will fail until `eslint` and its config exist, which is exactly what the next two units build. This is stated here rather than faked, per this schema's own rule against pretending something runs before it can.

### Connection

Unit 1 gave you a runnable app with the *wrong* linter wired in; this unit repoints `"lint"` at the tool this curriculum actually uses, setting up the next two units to make that pointer real.

---

## Concept Unit 3: TypeScript Project References

### The Problem

Your project has two genuinely different kinds of TypeScript file: code that runs *in the browser* (`src/**/*.tsx`, which needs DOM types like `document`) and code that runs *in Node*, on your own machine, while building (`vite.config.ts`, and soon `scripts/*.ts`, which need Node types like `process` and must never accidentally reference `document`). One shared set of compiler rules for both would either wrongly allow browser code to call Node-only APIs, or wrongly disallow config files from calling Node APIs they legitimately need.

### Introduce the Concept in Isolation

The scaffold already split this for you into three real files — read them as the isolated example. `tsconfig.json`, the entry point, is almost empty:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

`tsconfig.app.json` (the browser-side rules — real, verified content, key lines):

```json
{
  "compilerOptions": {
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "moduleResolution": "bundler",
    "noEmit": true,
    "jsx": "react-jsx",
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src"]
}
```

`tsconfig.node.json` (the tooling-side rules, before this lesson's own edit in the next unit):

```json
{
  "compilerOptions": {
    "target": "es2023",
    "lib": ["ES2023"],
    "types": ["node"],
    "module": "nodenext",
    "noEmit": true
  },
  "include": ["vite.config.ts"]
}
```

What this proves: `tsconfig.app.json`'s `"lib"` includes `"DOM"` — browser globals — and nothing names `"node"`; `tsconfig.node.json`'s `"lib"` has no `"DOM"` at all, and explicitly sets `"types": ["node"]`. They are two separately-checked worlds, on purpose.

### Discard

Not applicable — same as Unit 2, this is real project config being read, not a throwaway.

### Project Change

- **Reference Source:** no direct counterpart in `full.brd.md` — the BRD's tree shows a single `tsconfig.json` at the root and doesn't mention project references at all. This split is a from-scratch addition, inherited from Vite's own `react-ts` scaffold rather than the BRD.
- **Files affected:** `fullstack-playground/tsconfig.node.json`, modified.
- **Change type:** configure (add one path to an existing array).
- **Location:** the `"include"` array.
- **Dependencies:** none.

### The New Code — type it yourself

```json
"scripts"
```

(added as a second entry in the array below)

### The Updated Project

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023"],
    "types": ["node"],
    "skipLibCheck": true,
    "module": "nodenext",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts", "scripts"]
}
```

This config now type-checks two things instead of one: `vite.config.ts` as before, plus every `.ts` file under `scripts/` — necessary before Concept Unit 7 can add real files there and have `npm run build`'s `tsc -b` actually check them.

### Mechanical Walkthrough

- `"include": [...]` — a plain JSON array of path globs telling TypeScript's project-reference build (`tsc -b`, from Unit 2's `"build"` script) which files this specific `tsconfig.node.json` is responsible for checking.
- `"vite.config.ts"` — the pre-existing entry, a single file path (Unit 3 doesn't touch this line, shown for real context, not elided).
- `"scripts"` — the new entry, a bare folder name, which TypeScript expands to every `.ts`/`.tsx` file under that folder recursively.

### CS Lens

Project references form a real dependency graph between config files (`tsconfig.json` → its two references), and `tsc -b` (`--build`) walks that graph to decide what needs rechecking — the same incremental-recompilation idea as a `Makefile`: only rebuild the parts whose inputs actually changed, not everything, every time.

### SE Lens

The alternative not chosen: one single `tsconfig.json` covering both `src/` and `vite.config.ts`/`scripts/`. The real tradeoff: a single config would have to include `"DOM"` and `"node"` in the same `"lib"` array to satisfy both halves, which silently makes `document` type-check as valid inside `vite.config.ts` (wrong — there is no DOM there) and makes `process.env` type-check as valid inside `src/` browser code (wrong — there is no Node process there). The two-file split costs one extra file to maintain; the single-file version costs a whole category of "this typo-checks fine but crashes at runtime in the wrong environment" bugs that TypeScript exists specifically to catch.

### Commands Needed

None new.

### Run It

Not independently runnable — this file only matters when `tsc -b` runs, which happens as part of `npm run build`, covered together with Unit 4's fix in that unit's own Run It step.

### Connection

Unit 2 pointed `"build"` at `tsc -b`; this unit makes sure `tsc -b` actually knows about the files Unit 7 is going to add, before they exist.

---

## Concept Unit 4: ESLint's Flat Config

### The Problem

Unit 2 repointed `"lint"` at `eslint .`, but `eslint` isn't installed yet, and even once it is, ESLint needs to be told which rules apply to which files — for a React + TypeScript project specifically, "which variable names are unused," "are React's Hook rules being followed," and "does this file get treated as browser code or Node code" are all real, different questions with different right answers depending on the file.

### Introduce the Concept in Isolation

Install the real tools first — real, executed output this session:

```text
$ npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals tsx

added 157 packages, and audited 158 packages in 22s
found 0 vulnerabilities
```

Now the isolated failure, which is the actual teaching moment. A first, reasonable-looking `eslint.config.js` was written using `reactHooks.configs['recommended-latest']`. Running `npm run lint` against it produced this real error, not a hypothetical one:

```text
Oops! Something went wrong! :(

ESLint: 10.8.1

A config object has a "plugins" key defined as an array of strings.
It looks something like this:

    { "plugins": ["react-hooks"] }

Flat config requires "plugins" to be an object, like this:

    { plugins: { react-hooks: pluginObject } }
```

Checking what `eslint-plugin-react-hooks` actually exports (real, executed this session) explains why:

```text
$ node -e "import('eslint-plugin-react-hooks').then(m => console.log(Array.isArray(m.default.configs['recommended-latest'].plugins)))"
true
```

`configs['recommended-latest']` — the plugin's top-level export — is legacy-format, with `plugins` as an array of name strings, left in place for older ESLint setups. The plugin *also* exports a separately-nested, flat-config-correct copy at `configs.flat['recommended-latest']`, where `plugins` is a real object.

**This is called a flat config**, and the error above is what happens when a legacy-format config object is handed to an ESLint version that only accepts the flat shape.

### Discard

The broken `eslint.config.js` that produced that exact error is not the one that ships — the fixed version is written next, referencing `configs.flat['recommended-latest']` instead.

### Project Change

- **Reference Source:** `full.brd.md`'s own tree names `eslint.config.js` at the project root; the BRD gives no further detail on its contents, so the rule set below is a from-scratch decision built to match a standard Vite + React + TypeScript project, not ported from anywhere.
- **Files affected:** `fullstack-playground/eslint.config.js`, created; `fullstack-playground/.oxlintrc.json`, deleted; `oxlint` uninstalled.
- **Change type:** create (config), remove (the tool Unit 2 stopped pointing at).
- **Location:** project root.
- **Dependencies:** the six packages installed above.

### The New Code — type it yourself

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config(
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
  },
  {
    files: ['scripts/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
)
```

### The Updated Project

This *is* the whole file — a brand-new file has nothing to locate a position within, per this schema's own exception for that case.

### Mechanical Walkthrough

- `import js from '@eslint/js'` — ESLint's own core rule set, published separately from the `eslint` CLI itself, as a plain package.
- `import globals from 'globals'` — a data-only package: a plain object mapping environment names (`"browser"`, `"node"`) to the list of global identifiers that environment defines (`window`, `document` for browser; `process`, `require` for node) — used below so the linter knows `document` isn't an undefined variable in browser files.
- `tseslint.config(...)` — the helper walked through in this lesson's header, flattening everything passed to it into one array; this is the value ultimately assigned to `export default`.
- `globalIgnores(['dist'])` — a small helper (imported from `eslint/config`, ESLint's own package, not a plugin) that expands to a config entry meaning "never lint anything under `dist/`" — necessary because `dist/` holds *built*, bundled output, not source you wrote.
- `files: ['**/*.{ts,tsx}']` — a glob restricting the entry below to `.ts`/`.tsx` files only, using brace-expansion (`{ts,tsx}` matches either extension) — this is what makes flat config "flat": every entry names its own file scope explicitly, instead of inheriting scope implicitly from where a config file sits in a folder tree.
- `extends: [...]` — a `tseslint.config`-specific convenience (ordinary ESLint flat config has no `extends` key at all); each item is a whole config object or array being merged in, in order, later entries able to override earlier ones' rules.
- `js.configs.recommended` — ESLint's own baseline sane-defaults rule set (catches things like unreachable code).
- `tseslint.configs.recommended` — TypeScript-aware rules (e.g. catching a `.ts`-only mistake ESLint's plain JS rules can't see).
- `reactHooks.configs.flat['recommended-latest']` — the corrected reference from the isolated lab above; enforces React's Hook rules (e.g. never call a Hook inside a conditional).
- `reactRefresh.configs.vite` — one rule, tuned for Vite specifically: warns if a file mixes component exports with non-component exports, which would silently break Vite's fast-refresh (a file's live-reload state resets unexpectedly) — a failure you would otherwise only discover by noticing your app re-mounted itself unexpectedly and refresh state got lost while editing.
- `languageOptions: { ecmaVersion: 2023, globals: globals.browser }` — tells ESLint's own parser which JS syntax version to accept, and which identifiers count as "defined" rather than triggering a no-undefined-variable rule.
- The second top-level object, `files: ['scripts/**/*.ts']` with `globals: globals.node` — a *second*, separate config entry, applying only to files under `scripts/` (added for real in Concept Unit 7), telling ESLint that `process`, `require`, and other Node globals are defined there — without this, linting a script that reads `process.argv` would otherwise flag `process` as an undefined variable, because the first config entry's `globals.browser` never defined it.

### CS Lens

ESLint doesn't pattern-match your source text directly — it parses each file into an AST (abstract syntax tree) first, and every rule is really a tree-traversal visitor that runs on specific node types (a `CallExpression`, a `JSXElement`) as the tree is walked. This is the same technique a real compiler's front end uses to analyze code before ever generating anything — also recognized in: TypeScript's own type checker, a code formatter like Prettier, browser DevTools' "find all references."

### SE Lens

The alternative not chosen: leaving the scaffold's own `oxlint` in place, which needed zero config to already pass. The real tradeoff, restated concretely now that you've seen the actual error: ESLint's flat config costs real setup friction (you just watched a legitimate, easy-to-make mistake produce a real crash) in exchange for exact, file-scoped control and a much larger plugin ecosystem than `oxlint` currently has (`eslint-plugin-react-hooks`'s Hook-rule enforcement, specifically, doesn't have a mature `oxlint` equivalent yet). The debt this project is currently carrying: this config's second entry only special-cases `scripts/**/*.ts` for Node globals — if a lesson later adds its own Node-side code somewhere else (an `api/server.ts`, in a later lesson), this config will need a matching third entry, or that file will wrongly get flagged for using `process`.

### Commands Needed

- `npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals tsx` — `-D` (short for `--save-dev`) records these under `devDependencies`, matching Unit 2's own rule for what belongs there.
- `npm uninstall oxlint` — removes the package `"lint"` no longer points at.
- delete `.oxlintrc.json` — its own config file, now unused.

### Run It

Real, executed output, this session, after the fix:

```text
$ npm run lint

> fullstack-playground@0.0.0 lint
> eslint .

$
```

No output is the success case for a linter — silence means zero violations found. The earlier, broken version's real crash output is shown above, in the isolated lab, exactly as it happened — not cleaned up or paraphrased.

### Connection

Unit 2 pointed `"lint"` at a command that didn't exist yet; this unit makes that command real, and makes it strict enough to actually mean something (proven by the error you just watched it produce and then stop producing).

---

## Concept Unit 5: The `shared` / `app` / `lessons` Folder Boundary

### The Problem

Once dozens of lessons live in the same project, one lesson's code quietly importing from another lesson's folder becomes the easiest possible way to make lessons undeletable and interdependent for no real reason — the exact opposite of the BRD's own stated goal, that "a lesson can therefore be deleted completely without breaking another lesson."

### Introduce the Concept in Isolation

This isn't a language feature to run in a throwaway file — it's a folder convention, so the "isolated example" is the rule itself, stated in the BRD's own words, real quote from this session's reading of it:

> Lessons may import: `src/shared/...`
> Lessons may never import: `src/lessons/017/...`
> Each lesson owns its: `web/ api/ data/ tests/` as needed.
> A lesson can therefore be deleted completely without breaking another lesson.

What this proves, mechanically, not just as a policy: if no lesson's code ever contains the literal text `../lessons/` in an import path, then deleting any one `lessons/NNN-name/` folder cannot break any other lesson's build — there is no import graph edge between them to break.

### Discard

Not applicable — the rule itself is what's kept; there's no throwaway code here to discard.

### Project Change

- **Reference Source:** `full.brd.md` §1, "Shared code rule," quoted above verbatim.
- **Files affected:** `fullstack-playground/src/App.tsx`, `src/App.css`, `src/assets/*` — deleted (the scaffold's own demo page, no longer needed). `fullstack-playground/src/shared/{db,http,testing,ui}/`, `src/app/`, `src/lessons/` — created.
- **Change type:** remove (demo page), create (real folder structure).
- **Location:** `fullstack-playground/src/`.
- **Dependencies:** none.

### The New Code — type it yourself

```text
mkdir -p src/shared/db src/shared/http src/shared/testing src/shared/ui
mkdir -p src/app src/lessons
rm src/App.tsx src/App.css src/assets/react.svg src/assets/vite.svg src/assets/hero.png
```

### The Updated Project

```text
fullstack-playground/src/
├── app/            # ← new — Concept Unit 6 fills this in
├── assets/          # ← now empty, scaffold's own demo images removed
├── shared/          # ← new
│   ├── db/
│   ├── http/
│   ├── testing/
│   └── ui/
├── lessons/         # ← new — stays empty until a real Lesson 1
├── index.css
└── main.tsx
```

`src/` now has three top-level categories instead of one flat pile of files: `shared/` (infrastructure any lesson may use), `app/` (the shell that decides what to show), `lessons/` (self-contained, deletable units) — the same three-way split the BRD's own tree names.

### Mechanical Walkthrough

- `mkdir -p` — creates a directory, and (the `-p` flag) any missing parent directories along the way, without erroring if it already exists.
- Four separate `db http testing ui` folders under `shared/`, not one flat `shared/` — each is empty right now on purpose: per the BRD's rule, `shared/` holds infrastructure a *second* lesson needs, not a guess at what might be useful; nothing is added here speculatively; the four names exist as the *categories* the BRD's own tree already commits to, waiting to be filled only once a real duplication across two lessons justifies it.
- `rm src/App.tsx ...` — deletes the scaffold's own demo counter page and its assets; this is safe specifically because Unit 6 replaces `main.tsx`'s only reference to `App.tsx` in the same session, not left dangling.

### CS Lens

This is a directed-acyclic-graph constraint, enforced by convention rather than by a compiler: `shared → {app, lessons}` edges are allowed, `lessons/017 → lessons/023` edges are not. The same shape of rule as a layered architecture's "lower layers may not depend on higher ones" — here, "lower" means shared infrastructure, "higher" means any one specific lesson.

### SE Lens

The alternative not chosen: a single flat `src/` with all 81 lessons' files interleaved, importing from each other freely as convenient. The real tradeoff: freely importing between lessons would let a later lesson reuse an earlier one's component with zero extra typing today — but the BRD's own explicit goal (delete one lesson without breaking another) requires the opposite discipline, paid for once, up front, as a folder convention, rather than discovered as an accidental breakage the day someone finally deletes Lesson 017 and Lesson 023 stops building.

### Commands Needed

The three shown above — no new tool, just `mkdir`/`rm`.

### Run It

Not independently runnable — this unit only rearranges folders; `npm run dev` (Unit 6) is what proves the app still runs afterward.

### Connection

Units 1–4 gave you a single-page demo app with no real structure; this unit clears that demo away and lays out the three folders every future lesson will actually live inside.

---

## Concept Unit 6: Dynamic Lesson Loading — `import.meta.glob` and `lazy`

### The Problem

`main.tsx` currently renders the scaffold's deleted `App`. It needs to render *some* lesson's component instead — but which one is a runtime choice (whatever you're currently working on), and most of those lessons don't exist yet. A normal `import Counter from '../lessons/001-counter/web/Counter'` at the top of the file would need that exact file to exist the moment this file is written, and would hard-code exactly one lesson forever.

### Introduce the Concept in Isolation

Real, executed proof that `import.meta.glob` resolves matching files at build time, from this session's actual dev server:

```text
$ curl -s http://localhost:5184/src/app/Playground.tsx
```

returned a real `200`, serving the shell below through Vite's dev server, with zero lesson folders existing yet — proving the glob doesn't error on finding nothing, it just returns an empty map, which the component below turns into "no lessons exist yet" rather than crashing.

### Discard

Not applicable — this is the real shell component.

### Project Change

- **Reference Source:** no counterpart in `full.brd.md` — the BRD names `src/app/Playground.tsx` in its tree but not its behavior; this is a from-scratch design decision.
- **Files affected:** `fullstack-playground/src/app/Playground.tsx`, created; `fullstack-playground/src/main.tsx`, modified.
- **Change type:** create, then update one import.
- **Location:** `main.tsx`'s existing render call.
- **Dependencies:** none new.

### The New Code — type it yourself

```tsx
import { Suspense, lazy, type ComponentType } from 'react'

type LessonModule = { default: ComponentType }

function lessonIdFromPath(path: string): string {
  const match = path.match(/\.\.\/lessons\/([^/]+)\/web\//)
  return match ? match[1] : path
}

const lessonComponents = new Map(
  Object.entries(import.meta.glob<LessonModule>('../lessons/*/web/*.tsx')).map(
    ([path, loadModule]) => [lessonIdFromPath(path), lazy(loadModule)] as const,
  ),
)
```

### The Updated Project

The full component, nothing elided:

```tsx
import { Suspense, lazy, type ComponentType } from 'react'

type LessonModule = { default: ComponentType }

function lessonIdFromPath(path: string): string {
  const match = path.match(/\.\.\/lessons\/([^/]+)\/web\//)
  return match ? match[1] : path
}

// Every lesson's component is wrapped in lazy() once, at module load — not per
// render — so React sees a stable component type across renders.
const lessonComponents = new Map(
  Object.entries(import.meta.glob<LessonModule>('../lessons/*/web/*.tsx')).map(
    ([path, loadModule]) => [lessonIdFromPath(path), lazy(loadModule)] as const,
  ),
)

const availableLessons = [...lessonComponents.keys()].sort()

function findLessonComponent(requestedId: string | undefined) {
  if (!requestedId) return undefined
  const exact = lessonComponents.get(requestedId)
  if (exact) return exact
  const prefixMatch = [...lessonComponents].find(([id]) => id.startsWith(requestedId))
  return prefixMatch?.[1]
}

export function Playground() {
  const requestedId = import.meta.env.VITE_LESSON as string | undefined
  const LessonComponent = findLessonComponent(requestedId)

  if (!LessonComponent) {
    return (
      <main style={{ padding: '2rem', maxWidth: 640, margin: '0 auto' }}>
        <h1>Full-Stack Playground</h1>
        {requestedId ? <p>No lesson found matching "{requestedId}".</p> : <p>No lesson selected.</p>}
        <p>Run a lesson with:</p>
        <pre>npm run lesson -- &lt;lesson-number&gt;</pre>
        {availableLessons.length > 0 ? (
          <>
            <p>Available lessons:</p>
            <ul>{availableLessons.map((id) => <li key={id}>{id}</li>)}</ul>
          </>
        ) : (
          <p>No lessons exist yet.</p>
        )}
      </main>
    )
  }

  return (
    <Suspense fallback={<p>Loading lesson…</p>}>
      <LessonComponent />
    </Suspense>
  )
}
```

`main.tsx` now renders `<Playground />` instead of `<App />` — the whole file otherwise unchanged from the scaffold.

### Mechanical Walkthrough

- `import.meta.glob<LessonModule>('../lessons/*/web/*.tsx')` — the generic `<LessonModule>` tells TypeScript what each matched module's shape is (it can't infer this on its own, since the files don't exist yet); the string pattern itself is not a regular expression, it's a *glob*: `*` matches any single path segment, so this matches `../lessons/001-counter/web/Counter.tsx` but not a file nested one level deeper.
- `Object.entries(...)` — turns the `{path: loaderFn}` object the glob returns into an array of `[path, loaderFn]` pairs, because a plain object can't be `.map()`-ed directly.
- `.map(([path, loadModule]) => [lessonIdFromPath(path), lazy(loadModule)] as const)` — for each pair, computes the lesson's folder name from its path and wraps the loader in `lazy()`, producing a new `[id, LazyComponent]` pair; `as const` tells TypeScript this is a fixed 2-tuple, not a generic array, which is what `Map`'s constructor needs to infer the right key/value types.
- `new Map(...)` — built directly from that array of pairs; a `Map` is used here rather than a plain object specifically so keys can be looked up with `.get()` and iterated with `[...lessonComponents]`, and so a lesson id that happens to collide with a built-in `Object.prototype` property name (unlikely, but real) can never cause a bug.
- `lessonComponents` is built once, at module scope, when this file first loads — not inside the `Playground` function. This matters and is proven by a real bug encountered this session: an earlier version called `lazy()` inside the component function itself (even wrapped in `useMemo`), and ESLint's `react-hooks/static-components` rule flagged it — real, executed error:

  ```text
  Error: Cannot create components during render
  Components created during render will reset their state each time they are created.
  ```

  Moving the `lazy()` calls to module scope, so `findLessonComponent` only ever does a `Map.get`/`.find` lookup at render time and never calls `lazy()` itself, is what made the error go away for real — proven by rerunning `npm run lint` afterward and getting silence again.
- `findLessonComponent` — a plain lookup function; `.get(requestedId)` tries an exact match first, and `[...lessonComponents].find(([id]) => id.startsWith(requestedId))` falls back to a prefix match, so typing just `1` finds `001-counter`.
- `import.meta.env.VITE_LESSON` — Vite's own mechanism for exposing environment variables to browser code, but *only* ones whose name starts with the literal prefix `VITE_` — a deliberate safety boundary, not a stylistic convention: it stops a `.env` file's non-`VITE_`-prefixed secret (a database password, an API key) from ever being bundled into code a browser downloads.
- `<Suspense fallback={...}>` — a built-in React component that catches a `lazy` component's pending Promise and renders `fallback` until it resolves, instead of the app crashing or rendering nothing.

### CS Lens

`import.meta.glob` doing filesystem pattern-matching at build time, then `lazy`/`Suspense` doing it again at runtime with a Promise, is the same underlying idea in two different phases: **lazy evaluation** — don't do the work (reading the filesystem; downloading the code) until the result is actually needed. Also recognized in: a database query plan that doesn't fetch rows until you actually iterate the cursor, a spreadsheet formula that only recalculates when a dependent cell changes, Python generators.

### SE Lens

The alternative not chosen: a manually maintained `import` statement per lesson, in a big `switch` on lesson id. The real tradeoff: the manual version is easier to read for a small number of lessons, but requires editing `Playground.tsx` every single time a lesson is added or removed — coupling this shared shell file to every individual lesson's existence, which is exactly the cross-lesson coupling Concept Unit 5's whole folder rule exists to avoid. The glob-based version costs one layer of indirection (harder to `grep` for "where is Counter.tsx imported") in exchange for `Playground.tsx` never needing to change again as lessons are added.

### Commands Needed

None new.

### Run It

Real, executed output — production build, this session, after this unit's code was in place:

```text
$ npm run build

> fullstack-playground@0.0.0 build
> tsc -b && vite build

vite v8.2.1 building client environment for production...
✓ 16 modules transformed.
dist/index.html                   0.47 kB │ gzip:  0.30 kB
dist/assets/index-CnuHVY1E.css    0.28 kB │ gzip:  0.20 kB
dist/assets/index-CVJZ4uuv.js   191.30 kB │ gzip: 60.35 kB
✓ built in 245ms
```

And `npm run lint` real output, after fixing the static-components error above:

```text
$ npm run lint

> fullstack-playground@0.0.0 lint
> eslint .

$
```

### Connection

Unit 5 gave the project three real, empty folders and nothing rendering them; this unit is the shell that actually reads `lessons/` and shows whatever it finds — the last piece before the project is genuinely ready for a real Lesson 1.

---

## Concept Unit 7: Scripting the Dev Workflow

### The Problem

`Playground.tsx` reads `import.meta.env.VITE_LESSON` to decide what to show — but nothing sets that variable yet, and once a lesson has its own `api/server.ts`, that needs to run as a second process alongside Vite's dev server, not instead of it. Typing all of that by hand, correctly, every single time you switch lessons, is exactly the kind of repetitive, error-prone step a real project automates.

### Introduce the Concept in Isolation

Real, executed proof of the two building blocks, run standalone before being combined into the real script:

```text
$ node -e "const { spawn } = require('child_process'); const p = spawn('node', ['-e', 'console.log(1+1)'], { stdio: 'inherit' }); p.on('exit', c => console.log('child exited', c))"
2
child exited 0
```

This proves `spawn` really does start a second, separate process (`node -e "console.log(1+1)"`), and the parent process really does get told when it exits — the two facts the real script depends on.

### Discard

The one-liner above is not part of the project; the real script, written next, is.

### Project Change

- **Reference Source:** `full.brd.md` §1 names `scripts/run-lesson.ts` and `scripts/reset-lesson.ts` in its tree but specifies no behavior for either — this unit's design is a from-scratch decision.
- **Files affected:** `fullstack-playground/scripts/run-lesson.ts`, created; `fullstack-playground/scripts/reset-lesson.ts`, created.
- **Change type:** create.
- **Location:** new `scripts/` folder at the project root (sibling of `src/`, per the BRD's own tree).
- **Dependencies:** `tsx` (already installed, Concept Unit 4).

### The New Code — type it yourself

The lesson-selection core of `run-lesson.ts`:

```ts
import { existsSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const lessonsDir = path.join(root, 'src', 'lessons')

function listLessons(): string[] {
  if (!existsSync(lessonsDir)) return []
  return readdirSync(lessonsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
}

function findLesson(requested: string): string | undefined {
  return listLessons().find((name) => name === requested || name.startsWith(`${requested}-`))
}
```

### The Updated Project

The complete file, nothing elided:

```ts
import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const lessonsDir = path.join(root, 'src', 'lessons')

function listLessons(): string[] {
  if (!existsSync(lessonsDir)) return []
  return readdirSync(lessonsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
}

function findLesson(requested: string): string | undefined {
  return listLessons().find((name) => name === requested || name.startsWith(`${requested}-`))
}

const requested = process.argv[2]

if (!requested) {
  console.error('Usage: npm run lesson -- <lesson-number>')
  process.exit(1)
}

const lessonId = findLesson(requested)

if (!lessonId) {
  const available = listLessons()
  console.error(`No lesson matching "${requested}".`)
  console.error(available.length > 0 ? `Available: ${available.join(', ')}` : 'No lessons exist yet.')
  process.exit(1)
}

writeFileSync(path.join(root, '.env.local'), `VITE_LESSON=${lessonId}\n`)
console.log(`Selected lesson ${lessonId}`)

const children: ChildProcess[] = []

function shutdown() {
  for (const child of children) child.kill()
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

const apiEntry = path.join(lessonsDir, lessonId, 'api', 'server.ts')
if (existsSync(apiEntry)) {
  console.log(`Starting API: ${path.relative(root, apiEntry)}`)
  const api = spawn('npx', ['tsx', 'watch', apiEntry], { stdio: 'inherit', shell: true })
  children.push(api)
}

const web = spawn('npx', ['vite'], { stdio: 'inherit', shell: true })
children.push(web)
web.on('exit', shutdown)
```

### Mechanical Walkthrough

- `import.meta.dirname` — a Node built-in (no longer needs `path.dirname(fileURLToPath(import.meta.url))`, the older workaround) giving this file's own containing folder as a string.
- `path.resolve(import.meta.dirname, '..')` — this script lives in `scripts/`, so `..` from there is the project root; resolving it once into `root` means every other path in the file is built from a known-correct base, not a relative guess.
- `readdirSync(lessonsDir, { withFileTypes: true })` — reading a directory's entries, but as `Dirent` objects (which carry `.isDirectory()`) rather than bare filename strings — necessary because `src/lessons/` will eventually hold a stray `README.md` alongside real lesson folders, and only the folders count as lessons.
- `.find((name) => name === requested || name.startsWith(`${requested}-`))` — lets you type either the exact folder name or just its numeric prefix (`1`, `001`, or `001-counter` all find `001-counter`).
- `process.argv[2]` — Node's own argument array; index `0` is the `node` binary itself, `1` is the script path, so `2` is the first *real* argument — here, the lesson number typed after `npm run lesson --`.
- `writeFileSync(path.join(root, '.env.local'), \`VITE_LESSON=${lessonId}\n\`)` — this is the real mechanism connecting this script to Concept Unit 6's `import.meta.env.VITE_LESSON`: Vite reads `.env.local` automatically on startup, and any `VITE_`-prefixed key inside it becomes available as `import.meta.env.VITE_LESSON` in browser code.
- `process.on('SIGINT', shutdown)` / `'SIGTERM'` — registers handlers for the two signals your terminal sends on Ctrl-C or a normal kill; without this, killing the parent script would leave the spawned `vite`/`tsx watch` child processes running orphaned in the background.
- `spawn('npx', ['tsx', 'watch', apiEntry], { stdio: 'inherit', shell: true })` — starts a lesson's own API server, only if `api/server.ts` actually exists for that lesson (most early lessons won't have one); `shell: true` is needed specifically on Windows, where `npx` is a `.cmd` shim, not a directly executable binary.
- `web.on('exit', shutdown)` — if the Vite dev server itself exits (you press `q` in its terminal UI, or it crashes), the API child is killed too, rather than left running with no frontend attached to it.

### CS Lens

Registering `shutdown` on both `SIGINT`/`SIGTERM` and the child's own `'exit'` event is the same idea as RAII / a `finally` block in an exception handler: a resource that was acquired (a spawned process) has exactly one place responsible for releasing it, reached no matter which of several different paths triggers the release.

### SE Lens

The alternative not chosen: a plain shell script (`.sh`/`.bat`) instead of a Node/`tsx` script. The real tradeoff: a shell script would need a second, separate implementation for Windows vs. Unix shells (this project's own environment is Windows) to do the same `find-the-right-folder` string logic; a `.ts` script, run through `tsx`, is one file that works identically on any OS Node runs on, at the cost of needing `tsx` installed at all (a real, small dependency cost, already paid in Concept Unit 4).

### Commands Needed

- `npm run lesson -- 001` — runs this script with `001` as `process.argv[2]`; the `--` here is the same npm-to-underlying-command separator from Concept Unit 1, required so `001` reaches the script's own `argv`, not `npm run` itself.

### Run It

Real, executed output, this session, with no lesson folders created yet — proving the no-lessons-yet path works, not just the happy path:

```text
$ npm run lesson -- 001

> fullstack-playground@0.0.0 lesson
> tsx scripts/run-lesson.ts 001

No lesson matching "001".
No lessons exist yet.
```

This exact error message went through one real bug fix this session: an earlier version of `listLessons()` didn't filter by `entry.isDirectory()`, so once a stray `README.md` file existed in `src/lessons/`, the "Available:" list printed `README.md` as if it were a real lesson. Re-running the *fixed* version above, against a `src/lessons/` folder containing only that stray file, correctly prints `No lessons exist yet.` instead — proof the filter works, not just an assertion that it should.

### Connection

Every previous unit built a piece of the project; this is the first unit that ties them together into something you'll actually run every single session from here on — this is what "starting" a lesson means, from Lesson 1 onward.

---

## Closing

### Connect the Pieces

One concrete trace, start to finish: you type `npm run lesson -- 1` → npm looks up `"lesson"` in `package.json` (Unit 2) and runs `tsx scripts/run-lesson.ts 1` → `run-lesson.ts` (Unit 7) reads `src/lessons/` (Unit 5's folder), finds `001-counter`, writes `.env.local` → it spawns `vite`, whose config (Unit 1's `vite.config.ts`) and TypeScript rules (Unit 3) build `main.tsx` → `main.tsx` renders `Playground` (Unit 6), which reads `import.meta.env.VITE_LESSON` from that `.env.local`, finds `001-counter` via `import.meta.glob` (also Unit 6), and renders its component — with ESLint (Unit 4) having checked every file in this chain along the way.

### What Breaks Without This

Delete the `.filter((entry) => entry.isDirectory())` line from `listLessons()` in `run-lesson.ts`, create an empty `src/lessons/README.md`, and run `npm run lesson -- 1` again:

```text
$ npm run lesson -- 1

No lesson matching "1".
Available: README.md
```

A plain file is now listed as if it were a selectable lesson — exactly the real bug this lesson already walked through once, caused again on purpose. Restore the `.filter(...)` line and the message correctly goes back to `No lessons exist yet.`

### Exercises

- Run `npm run build`, then open `dist/index.html` directly — does the app still work with no dev server running? Why, in terms of what `vite build` actually produced.
- Temporarily rename `eslint.config.js` to something else and run `npm run lint` again — what does ESLint's own error say when it can't find a config at all, and how is that different from the flat-config-shape error you saw in Concept Unit 4?
- Create an empty `src/lessons/001-counter/` folder (no files inside it) and run `npm run lesson -- 1` — does `findLesson` match it? Why, based on `findLesson`'s own `startsWith` check.

### Definition of Done

- [ ] `fullstack-playground/` exists, `npm install` completes with no `npm ERR!` lines.
- [ ] `npm run build` completes clean (real output shown in Concept Unit 6).
- [ ] `npm run lint` completes with no errors (real output shown in Concept Unit 4).
- [ ] `npm run lesson -- 1` prints `No lessons exist yet.`, not a crash and not a false "Available" list.
- [ ] `src/App.tsx` and the scaffold's demo assets no longer exist; `src/shared/{db,http,testing,ui}/`, `src/app/Playground.tsx`, and empty `src/lessons/` do.
- [ ] Commit, with a message stating *why* — e.g. "Set up the shared playground so every future lesson has one project to live in, instead of each lesson reinventing its own build config."
