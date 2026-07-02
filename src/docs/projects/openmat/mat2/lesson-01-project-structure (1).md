# Lesson 01 — The Project Structure
## Modules, Packages, Monorepos, and TypeScript Configuration

---

## What You Will Build

By the end of this lesson you will have:

- A monorepo with three packages: `@mikelab/core`, `@mikelab/parser`, `@mikelab/ui`
- Each package compiles TypeScript to JavaScript
- Each package has one passing test
- The build system runs all three packages in the correct order
- Everything committed to git

You will not write any math yet. This lesson builds the project
skeleton that every future lesson adds to. When Lesson 02 adds
a browser UI, it will drop into this structure. When Lesson 04
adds the Matrix class, it will drop into `@mikelab/core`. The
structure you build today is the foundation of the whole system.

---

## What You Need To Know First

From Lesson 00:

```
✓ What Node.js is and what pnpm does
✓ What package.json is
✓ How to run files with node
✓ How to take a git commit
✓ TypeScript basic syntax: variables, functions, classes, type annotations
```

This lesson introduces concepts that build directly on those.

---

# Part 1: What a Module System Is

## The Problem Modules Solve

In Lesson 00 you wrote JavaScript in single files. Every variable
and function was in one place. That works for small programs.
It does not work for a system like MikeLab.

Imagine putting the entire MikeLab codebase in one file: the
Matrix class, the lexer, the parser, the evaluator, the UI code,
the tests. Thousands of lines. Any name you use for a variable
must be unique across the whole file. Any bug could be anywhere.
Any change to one piece could accidentally affect another.

A module system solves this by letting you split code across
multiple files, with each file explicitly declaring what it
exposes to other files and what it imports from them.

## ES Modules vs CommonJS

JavaScript has two module systems. You need to know both because
you will encounter both in the wild.

**CommonJS** is the older system. It was invented for Node.js before
JavaScript had a standard module system. It uses `require()` to import
and `module.exports` to export.

```javascript
// CommonJS — the old way
const Matrix = require('./Matrix');

module.exports = { Matrix };
```

**ES Modules** (ESM) is the modern standard, part of the JavaScript
language specification since 2015. It uses `import` and `export`.

```javascript
// ES Modules — the modern way
import { Matrix } from './Matrix.js';

export { Matrix };
```

**MikeLab uses ES Modules exclusively.** Here is why:

ES Modules are statically analysable — a build tool can read
your import statements and know exactly which files depend on
which, without running any code. This enables tree shaking:
if you import `@mikelab/core` but only use the Matrix class,
the build tool can remove everything else from the output.
CommonJS imports are dynamic — they can be inside if statements,
loops, and function calls — so a build tool cannot know at
build time what will be imported.

## How import and export Work

**Exporting** means making something available to other files.

```typescript
// src/math/add.ts

// Named export: other files can import this by name
export function add(a: number, b: number): number {
    return a + b;
}

// Another named export
export const PI = 3.14159;

// Default export: each file can have at most one
// Imported without braces (shown below)
export default function multiply(a: number, b: number): number {
    return a * b;
}
```

**Importing** means bringing exported things into the current file.

```typescript
// src/calculator.ts

// Named imports: use curly braces, name must match exactly
import { add, PI } from './math/add.js';

// Default import: name you choose yourself, no braces
import multiply from './math/add.js';

// Import everything as a namespace object
import * as MathUtils from './math/add.js';
// Now use: MathUtils.add(1, 2), MathUtils.PI

console.log(add(1, 2));      // 3
console.log(PI);              // 3.14159
console.log(multiply(3, 4)); // 12
console.log(MathUtils.add(5, 6)); // 11
```

**Why the `.js` extension in import paths?**

When you write TypeScript and import from another TypeScript file,
you write `.js` — not `.ts`. This seems wrong but is correct.
TypeScript compiles to JavaScript. The import statement in the
compiled output will refer to the compiled `.js` file. TypeScript
is smart enough to resolve `.js` imports to `.ts` source files
during development. Always write `.js` in TypeScript import paths.

**Create `module-demo.ts` and run it to verify you understand:**

```typescript
// module-demo.ts

// This is a self-contained demonstration of named exports.
// In a real project, these would be in separate files.

// We simulate a module's exports with a plain object for now.
// Real module imports are shown below.

function square(x: number): number {
    return x * x;
}

function cube(x: number): number {
    return x * x * x;
}

// In a real file you would write:
// export { square, cube };
// And in another file:
// import { square, cube } from './module-demo.js';

// For now, just verify these functions work:
console.log("2 squared:", square(2));    // 4
console.log("3 cubed:", cube(3));        // 27
```

```powershell
tsc module-demo.ts
node module-demo.js
```

---

# Part 2: What a Monorepo Is

## The Problem

MikeLab has three packages: `@mikelab/core`, `@mikelab/parser`, `@mikelab/ui`.

Each is its own npm package — independently installable, independently
versioned, independently publishable. Someone who only wants the math
engine installs `@mikelab/core`. They do not get the UI. Someone who
wants everything installs `@mikelab/ui`, which pulls in the others
automatically.

But during development, you are working on all three simultaneously.
If `@mikelab/parser` needs a change to `@mikelab/core`, you want to
see that change immediately — not publish `@mikelab/core` to npm,
wait for it to propagate, then install the new version in `@mikelab/parser`.

## What a Monorepo Solves

A monorepo puts all three packages in one git repository with one
root-level configuration. The packages can import each other directly
using their published package names (`@mikelab/core`) but pnpm
resolves those imports to the local folder, not the npm registry.

```
mikelab/                      ← one git repository
├── packages/
│   ├── core/                 ← @mikelab/core package
│   │   ├── src/
│   │   └── package.json
│   ├── parser/               ← @mikelab/parser package
│   │   ├── src/
│   │   └── package.json
│   └── ui/                   ← @mikelab/ui package
│       ├── src/
│       └── package.json
├── package.json              ← root: never published, just config
├── pnpm-workspace.yaml       ← tells pnpm where the packages are
└── tsconfig.base.json        ← shared TypeScript config
```

This gives you:
- One `git clone` to get everything
- One `pnpm install` to install all dependencies
- Local package resolution (no publish/install cycle during development)
- Shared tooling configuration (one TypeScript config to rule them all)

## What pnpm Workspaces Are

A pnpm workspace is pnpm's name for a monorepo. You declare it with
a file called `pnpm-workspace.yaml`. This file tells pnpm: "look in
these folders for packages."

```yaml
packages:
  - "packages/*"
```

The `*` is a glob pattern meaning "any subfolder of packages/".
So pnpm treats `packages/core`, `packages/parser`, and `packages/ui`
as workspace packages.

When `@mikelab/parser`'s `package.json` lists `@mikelab/core` as a
dependency, pnpm does not download it from npm. It links directly to
`packages/core` on your machine. This is called a workspace link.

---

# Part 3: What Turborepo Does

## The Build Order Problem

With three packages, building them in the wrong order causes failures.

`@mikelab/parser` imports from `@mikelab/core`. If you build
`@mikelab/parser` before `@mikelab/core` is compiled, the import
will fail — the files it needs do not exist yet.

With three packages this is manageable manually. With thirty packages,
tracking the build order by hand is impossible and error-prone.

## What Turborepo Is

Turborepo is a build system for monorepos. It:

1. Reads each package's dependencies from `package.json`
2. Builds a dependency graph: which package depends on which
3. Runs builds in the correct order, parallelising where possible
4. Caches build outputs: if nothing changed, it skips the rebuild

You define pipelines in `turbo.json`. A pipeline is a named task
(like `build` or `test`) with rules about ordering and caching.

## What tsup Does

TypeScript compiles to JavaScript with `tsc`. But `tsc` produces one
output file per input file — it does not bundle. For a library, you
want a single compiled output file that users can import.

`tsup` is a TypeScript bundler built on top of `esbuild` (a very
fast JavaScript bundler). It takes your TypeScript source, compiles
it, and produces:

- A CommonJS file (`.js`) — for older Node.js and bundlers
- An ES module file (`.mjs`) — for modern environments
- A TypeScript declaration file (`.d.ts`) — so TypeScript users
  of your library get type checking and autocomplete

You need to output both CommonJS and ESM because not everyone has
upgraded to ESM yet. A library that only outputs ESM will break
in projects that use CommonJS.

## What Vitest Is

Vitest is a test runner. A test runner is a program that:

1. Finds your test files (files ending in `.test.ts`)
2. Runs the test functions inside them
3. Reports which tests passed and which failed
4. Shows you exactly what went wrong for failed tests

You write tests using three functions:

```typescript
describe('group name', () => {
    it('what this test checks', () => {
        expect(someValue).toBe(expectedValue);
    });
});
```

- `describe` groups related tests together — purely organisational
- `it` (or `test`) defines one test case
- `expect` starts an assertion — a check that must be true
- `.toBe` checks strict equality (like `===`)

If the assertion fails, Vitest stops the test and reports the
actual vs expected values. If it passes, it moves to the next test.

A test that passes proves your code does what you think it does.
A test that fails proves it does not. This is more reliable than
running the code manually and checking by eye, because:

1. You can run 500 tests in under a second
2. Tests run every time you change code — you cannot forget
3. Tests document expected behaviour for anyone reading the code later

---

# Part 4: Building the Structure

Now build it. Every command is explained before you type it.

## Step 1: Create the Root Files

You should already have the `mikelab` folder from Lesson 00
with `package.json` and `.gitignore`. We are adding to it now.

**Update `.gitignore`** — add these lines:

```
node_modules
dist
.turbo
*.tsbuildinfo
```

`.turbo` — Turborepo's cache folder. No need to commit it.
`*.tsbuildinfo` — TypeScript's incremental build cache. Generated,
not source code.

**Create `pnpm-workspace.yaml`** in the `mikelab` root:

```yaml
packages:
  - "packages/*"
```

This file has no `{` or `[` — it uses YAML, a format that uses
indentation to express structure. The `-` prefix means "list item".
This file says: "the packages/ directory contains workspace packages".

**Create `turbo.json`** in the `mikelab` root:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**What each field means:**

`"$schema"` — a URL pointing to the JSON schema for turbo.json.
VS Code uses this to give you autocomplete and validation inside
turbo.json. Not used at runtime.

`"pipeline"` — defines the named tasks Turborepo knows about.

`"build"` — the build task:
- `"dependsOn": ["^build"]` — the `^` means "the build task of
  my dependencies". So before building this package, Turborepo
  first builds every package this one depends on. This enforces
  the correct build order automatically.
- `"outputs": ["dist/**"]` — these are the files Turborepo caches.
  The `**` means "any file inside dist/". Next time you run build
  with no changes, Turborepo restores from cache instead of rebuilding.

`"test"` — the test task:
- `"dependsOn": ["build"]` — tests run after the build (no `^`
  means "my own build", not my dependencies' builds).

`"dev"` — the development task (watch mode):
- `"cache": false` — never cache dev builds (source changes constantly)
- `"persistent": true` — keep running (watch mode stays alive)

**Create `tsconfig.base.json`** in the `mikelab` root:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**What every field means:**

`"target": "ES2020"` — what version of JavaScript to compile to.
ES2020 is well-supported by all modern environments (Node.js 14+,
all modern browsers). Older targets require more polyfills (code
that adds missing features). ES2020 gives us modern features like
optional chaining (`?.`) and nullish coalescing (`??`).

`"module": "ESNext"` — what module format to use in the output.
`ESNext` means use the latest ES module syntax (`import`/`export`).
We want ES modules, not CommonJS. tsup will handle producing both
formats from this output.

`"moduleResolution": "bundler"` — how TypeScript resolves import
paths. `bundler` is the modern setting for projects that use a
bundler like tsup or Vite. It allows imports without file extensions
in some contexts and correctly handles the `exports` field in package.json.

`"declaration": true` — generate `.d.ts` type declaration files.
When someone installs `@mikelab/core`, TypeScript reads these files
to know what types the library exports. Without them, TypeScript
users of your library get no type checking or autocomplete.

`"declarationMap": true` — generate `.d.ts.map` files. These map
the generated declaration files back to your TypeScript source.
When a user using VS Code clicks "Go to definition" on a MikeLab
function, they jump to your TypeScript source, not the compiled output.

`"sourceMap": true` — generate `.js.map` files. These map compiled
JavaScript lines back to TypeScript source lines. When an error
occurs at runtime, the stack trace shows TypeScript line numbers
instead of compiled JavaScript line numbers. Makes debugging possible.

`"strict": true` — enables a group of TypeScript checks that together
catch the most common bugs. Specifically it enables:
- `noImplicitAny`: every variable must have a known type — TypeScript
  will not silently assume `any` (the escape hatch that turns off type checking)
- `strictNullChecks`: null and undefined are not valid values for a
  variable unless you explicitly say so — prevents the most common
  runtime error in JavaScript ("cannot read properties of null")
- `strictFunctionTypes`: function parameter types are checked precisely

Always use `strict: true`. The bugs it catches are real bugs.

`"esModuleInterop": true` — allows cleaner default imports from
CommonJS packages. Most npm packages are still CommonJS. Without this,
importing them in TypeScript requires awkward syntax. With it, you
can write `import fs from 'fs'` instead of the uglier alternative.

`"skipLibCheck": true` — skip type checking of `.d.ts` files in
`node_modules`. Some packages have incorrect or incompatible type
declarations. Without this flag, TypeScript errors in packages you
did not write would stop your compilation. This flag ignores those.

`"forceConsistentCasingInFileNames": true` — on Windows, the
filesystem is case-insensitive: `Matrix.ts` and `matrix.ts` refer
to the same file. On Linux (where servers typically run), they do not.
This flag catches import paths that differ only in case, preventing
code that works on your Windows machine but breaks on a Linux server.

**Update `package.json`** in the `mikelab` root:

```json
{
  "name": "mikelab",
  "version": "0.0.1",
  "private": true,
  "description": "A MATLAB-compatible math engine for JavaScript and TypeScript",
  "scripts": {
    "build": "turbo build",
    "test": "turbo test",
    "dev": "turbo dev"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "^5.0.0"
  }
}
```

`"scripts"` — commands you can run with `pnpm <name>`.
`pnpm build` runs `turbo build`, which builds all packages.
`pnpm test` runs `turbo test`, which tests all packages.

`"devDependencies"` — packages needed to build and develop,
not needed at runtime. Turborepo and TypeScript are development
tools — they are not shipped to users of `@mikelab/core`.

**Install Turborepo:**

```powershell
pnpm install
```

`pnpm install` reads `package.json`, downloads the listed packages
into `node_modules`, and records exact versions in `pnpm-lock.yaml`.
You should see Turborepo being downloaded.

## Step 2: Create the Three Packages

Create the folder structure:

```powershell
mkdir packages
mkdir packages\core
mkdir packages\parser
mkdir packages\ui
```

Each of the three `mkdir` commands creates one folder.
`packages\core` on Windows is the same as `packages/core` on Mac/Linux.
The backslash vs forward slash difference is Windows-specific.

## Step 3: Set Up @mikelab/core

**Create `packages/core/package.json`:**

```json
{
  "name": "@mikelab/core",
  "version": "0.1.0",
  "description": "Core linear algebra engine for MikeLab",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts --clean",
    "test": "vitest run",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "vitest": "^1.0.0",
    "typescript": "^5.0.0"
  },
  "files": [
    "dist"
  ]
}
```

**What each new field means:**

`"type": "module"` — tells Node.js that `.js` files in this package
use ES module syntax (`import`/`export`), not CommonJS (`require`).
Without this, Node.js assumes CommonJS for `.js` files.

`"main"` — the entry point for CommonJS consumers (old `require()` style).
Points to the CJS output tsup will produce.

`"module"` — the entry point for ES module consumers. Points to the
ESM output. Not a standard field, but all major bundlers (Vite, webpack,
Rollup) recognise it.

`"types"` — points to the TypeScript declaration file. TypeScript
reads this to know what types the package exports.

`"exports"` — the modern, standard way to declare entry points.
Takes precedence over `main` and `module` for tools that support it.
The `"."` key means "the root import" — what you get when you
write `import something from '@mikelab/core'`.
Inside, `"import"` is the ESM path, `"require"` is the CJS path,
`"types"` is the declaration file path.

`"scripts"`:
- `"build": "tsup src/index.ts --format esm,cjs --dts --clean"`:
  - `tsup` — the bundler we use
  - `src/index.ts` — the entry point to bundle from
  - `--format esm,cjs` — produce both ES module and CommonJS outputs
  - `--dts` — also generate TypeScript declaration files
  - `--clean` — delete the `dist` folder before building (prevents stale files)
- `"test": "vitest run"` — run all tests once and exit
- `"dev": "tsup ... --watch"` — rebuild whenever source files change

`"files": ["dist"]` — when publishing to npm, only include the `dist`
folder. Do not publish source code, tests, or configuration files.
Users of the package only need the compiled output.

**Create `packages/core/tsconfig.json`:**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

`"extends": "../../tsconfig.base.json"` — inherit all settings from
the root config. The `../../` navigates up two directories from
`packages/core/` to the `mikelab/` root. We only override what
must be different for this specific package.

`"outDir": "dist"` — compiled JavaScript goes into the `dist` folder.
This is what `tsup` and `tsc` both use when producing output.

`"rootDir": "src"` — TypeScript source files live in `src/`.
This tells TypeScript: preserve the directory structure relative
to `src/` when writing to `dist/`.

`"include": ["src/**/*"]` — only compile files inside `src/`.
The `**/*` means "any file in any subfolder".

`"exclude": ["node_modules", "dist"]` — never compile these folders.
`node_modules` contains other people's code. `dist` contains already-compiled output.

**Create the src folder:**

```powershell
mkdir packages\core\src
```

**Create `packages/core/src/index.ts`:**

```typescript
// packages/core/src/index.ts
//
// This is the entry point for @mikelab/core.
// Everything exported from this file is part of the public API —
// the surface that users of @mikelab/core can access.
//
// Right now it exports a single greeting function.
// By the end of Lesson 04 it will export the Matrix class.
// We start minimal so we can verify the build pipeline works
// before adding complexity.

export function greet(name: string): string {
    return `MikeLab core is ready. Hello, ${name}.`;
}
```

**Create `packages/core/src/index.test.ts`:**

```typescript
// packages/core/src/index.test.ts
//
// Tests for the public API of @mikelab/core.
// This file is found automatically by Vitest because it ends in .test.ts
//
// import { describe, it, expect } from 'vitest':
//   describe — groups related tests under a label
//   it       — defines one test case with a description
//   expect   — starts an assertion: a check that must be true

import { describe, it, expect } from 'vitest';
import { greet } from './index.js';

// 'greet function' — the label for this group of tests.
// Shown in test output to help you find which tests failed.
describe('greet function', () => {

    // Each it() call is one test case.
    // The string describes what this specific test checks.
    it('returns a string containing the name', () => {

        // Call greet with "World" and store the result.
        const result: string = greet('World');

        // expect(result) — "I am about to make an assertion about result"
        // .toContain('World') — "result must contain the string 'World'"
        // If it does not, Vitest marks this test as failed and shows
        // both the actual value and the expected condition.
        expect(result).toContain('World');
    });

    it('returns a string', () => {
        const result = greet('MikeLab');

        // typeof result gives the JavaScript type as a string.
        // For a string value, typeof returns "string".
        expect(typeof result).toBe('string');
    });
});
```

**Install dependencies for core:**

```powershell
cd packages\core
pnpm install
```

`pnpm install` inside a workspace package installs that package's
`devDependencies` (tsup, vitest, typescript) into a shared location
that pnpm manages, and links them so they are accessible here.

## Step 4: Set Up @mikelab/parser

Go back to the root first:

```powershell
cd ..\..
```

`cd ..` navigates up one directory. `cd ..\..` navigates up two.
This takes you from `packages\core` back to `mikelab`.

**Create `packages/parser/package.json`:**

```json
{
  "name": "@mikelab/parser",
  "version": "0.1.0",
  "description": "MATLAB language parser for MikeLab",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts --clean",
    "test": "vitest run",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch"
  },
  "dependencies": {
    "@mikelab/core": "workspace:*"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "vitest": "^1.0.0",
    "typescript": "^5.0.0"
  },
  "files": [
    "dist"
  ]
}
```

Notice `"dependencies"` (not `"devDependencies"`) contains
`@mikelab/core`. This is a runtime dependency — the parser
needs core when it is actually running, not just during development.

`"workspace:*"` is a pnpm workspace protocol. It means: resolve
`@mikelab/core` to the local workspace package, whatever version
it currently is. The `*` means "any version". When you publish
the parser to npm, pnpm replaces `workspace:*` with the actual
version number.

**Create `packages/parser/tsconfig.json`:**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Create `packages/parser/src/index.ts`:**

```typescript
// packages/parser/src/index.ts
//
// Entry point for @mikelab/parser.
// The parser depends on @mikelab/core — notice the import.
// Right now it just re-exports greet to prove the dependency works.
// By Lesson 14 this will export the lexer, parser, and evaluator.

import { greet } from '@mikelab/core';

export function parserStatus(): string {
    const coreMessage = greet('parser');
    return `${coreMessage} Parser is ready.`;
}
```

**Create `packages/parser/src/index.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest';
import { parserStatus } from './index.js';

describe('parserStatus function', () => {
    it('returns a string containing Parser', () => {
        const result = parserStatus();
        expect(result).toContain('Parser');
    });

    it('returns a string containing core message', () => {
        const result = parserStatus();
        // The core greet function includes "MikeLab core is ready"
        // If the core dependency is not working, this test fails.
        expect(result).toContain('MikeLab core is ready');
    });
});
```

**Install parser dependencies:**

```powershell
cd packages\parser
pnpm install
cd ..\..
```

## Step 5: Set Up @mikelab/ui

**Create `packages/ui/package.json`:**

```json
{
  "name": "@mikelab/ui",
  "version": "0.1.0",
  "description": "Browser workspace UI for MikeLab",
  "type": "module",
  "scripts": {
    "build": "echo 'UI build not yet configured'",
    "test": "vitest run",
    "dev": "echo 'UI dev not yet configured'"
  },
  "dependencies": {
    "@mikelab/core": "workspace:*",
    "@mikelab/parser": "workspace:*"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "typescript": "^5.0.0"
  }
}
```

The UI's build and dev scripts say `echo 'not yet configured'`
because the UI uses Vite, which we set up in Lesson 02. For now
we just need the package to exist with correct dependencies.

**Create `packages/ui/tsconfig.json`:**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Create `packages/ui/src/index.ts`:**

```typescript
// packages/ui/src/index.ts
//
// Entry point for @mikelab/ui.
// Depends on both @mikelab/core and @mikelab/parser.
// In Lesson 02 this becomes a real browser application.
// For now it exists to prove the full dependency chain works.

import { greet } from '@mikelab/core';
import { parserStatus } from '@mikelab/parser';

export function uiStatus(): string {
    return `${greet('UI')} | ${parserStatus()}`;
}
```

**Create `packages/ui/src/index.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest';
import { uiStatus } from './index.js';

describe('uiStatus function', () => {
    it('returns a string containing UI', () => {
        const result = uiStatus();
        expect(result).toContain('UI');
    });

    it('proves the full dependency chain works', () => {
        const result = uiStatus();
        // If core or parser are broken, this string will not contain
        // what the parser produces. This test verifies all three
        // packages are wired together correctly.
        expect(result).toContain('MikeLab core is ready');
        expect(result).toContain('Parser is ready');
    });
});
```

**Install all dependencies from the root:**

```powershell
cd packages\ui
pnpm install
cd ..\..
pnpm install
```

The final `pnpm install` from the root installs everything across
all workspace packages and resolves the `workspace:*` links between them.

## Step 6: Build and Test Everything

**Build all packages:**

```powershell
pnpm build
```

This runs `turbo build`. Turborepo reads the dependency graph:
`@mikelab/ui` depends on `@mikelab/parser` which depends on
`@mikelab/core`. So Turborepo builds them in this order:

```
1. @mikelab/core    (no dependencies — builds first)
2. @mikelab/parser  (depends on core — builds second)
3. @mikelab/ui      (depends on both — builds last)
```

You should see output from tsup for each package, ending with
the compiled files in each package's `dist/` folder.

**Run all tests:**

```powershell
pnpm test
```

This runs `turbo test`. You should see all 5 tests pass across
the three packages.

If any test fails, read the output carefully. Vitest tells you:
- Which test file the failure is in
- Which `it()` block failed
- What the actual value was vs what was expected

**What your dist folders contain:**

After a successful build, look inside `packages/core/dist/`:

```
dist/
├── index.js      ← ES module output (import syntax)
├── index.cjs     ← CommonJS output (require syntax)
├── index.d.ts    ← TypeScript declarations
└── index.d.ts.map  ← Source map for declarations
```

These are the files that get published to npm and that users install.

---

# Connect the Pieces

What you built today is the skeleton every future lesson adds to:

```
@mikelab/core    → Lessons 04-12 fill this with the math engine
@mikelab/parser  → Lessons 13-22 fill this with the MATLAB parser
@mikelab/ui      → Lessons 02-03, 23-27 fill this with the browser UI
```

The dependency chain you verified with tests:

```
@mikelab/ui
    imports @mikelab/parser
        imports @mikelab/core
            imports nothing
```

This direction never reverses. `@mikelab/core` will never import
from `@mikelab/parser`. This is the **dependency rule**: dependencies
point toward lower-level abstractions only. Violating it creates
circular dependencies that are impossible to resolve cleanly.

---

# What Breaks Without This

## Without the correct build order

If you tried to build `@mikelab/parser` before `@mikelab/core`:

```
Error: Cannot find module '@mikelab/core' or its corresponding type declarations
```

The import in `parser/src/index.ts` would fail because core's
`dist/` folder does not exist yet. Turborepo's `"^build"` dependency
prevents this.

## Without `"type": "module"` in package.json

Node.js would treat `.js` files as CommonJS and fail when it
encounters `import` syntax:

```
SyntaxError: Cannot use import statement in a module
```

## Without `strict: true` in tsconfig

TypeScript would accept code like this without error:

```typescript
function broken(matrix) {      // matrix has type 'any' — no checking
    return matrix.rows * 2;    // no error even if matrix is undefined
}
```

At runtime this crashes with "Cannot read properties of undefined".
With `strict: true` TypeScript catches it at compile time.

---

# Challenges

**Challenge 1:**

Add a fourth exported function to `@mikelab/core` called `version()`
that returns the string `"0.1.0"`. Write a test for it in
`packages/core/src/index.test.ts`. Run `pnpm test` and verify
all tests still pass.

Then import and use `version()` in `@mikelab/parser`'s `parserStatus()`
function so that its output includes the core version number.
Update the parser's tests accordingly.

**Challenge 2:**

TypeScript interfaces describe the shape of objects. Add an interface
called `MikeLabInfo` to `packages/core/src/index.ts`:

```typescript
export interface MikeLabInfo {
    name: string;
    version: string;
    description: string;
}
```

Write a function called `getInfo(): MikeLabInfo` that returns an
object matching this interface. Write a test that checks each field.

**Challenge 3:**

Look inside `packages/core/dist/` after running `pnpm build`.
Open `index.js` and `index.cjs` in your editor.

Answer these questions in a comment at the top of
`packages/core/src/index.ts`:

1. What is different between `index.js` and `index.cjs`?
2. What happened to the TypeScript type annotations in the output?
3. What does `index.d.ts` contain and who is it for?

---

# Definition of Done

```
□ pnpm build runs without errors and produces dist/ in core and parser
□ pnpm test shows 5 passing tests (2 in core, 2 in parser, 2 in ui —
  adjust count if you added Challenge 1's test)
□ packages/core/dist/ contains index.js, index.cjs, and index.d.ts
□ You can explain what tsup does and why we need both .js and .cjs output
□ You can explain what "workspace:*" means in package.json
□ You can explain why @mikelab/core must build before @mikelab/parser
□ All three challenges completed
```

**Your commit for this lesson:**

```powershell
git add .
git commit -m "lesson 01: monorepo structure with three packages, build pipeline, and tests"
```

This message explains what the commit establishes — the monorepo
structure and the build pipeline — not just "add files".
