# Lesson 01 — Monorepos and Package Structure
## When one repository holds many packages, and how to wire them together

---

## What You Will Understand

- What a monorepo is and when to use one
- What pnpm workspaces are and how they work
- What a build pipeline is and why build order matters
- How to structure a TypeScript project with multiple packages
- What gets published to npm versus what stays local

---

## What You Need To Know First

- Lesson 00: Node.js, npm, pnpm, TypeScript basics, git

---

# Part 1: The Problem a Monorepo Solves

## One project, multiple packages

Some projects are naturally split into parts that should be
independently installable.

A charting library might have:
```
@charts/core     — the rendering engine
@charts/react    — React components built on core
@charts/themes   — optional theme packs
```

Someone building a plain HTML page only wants `@charts/core`.
Someone building a React app wants `@charts/react`, which
automatically pulls in `@charts/core` as a dependency.

## The problem with separate repositories

If each package lives in its own repository:

- You make a change to `@charts/core`
- You publish the new version to npm
- You update `@charts/react`'s package.json to use the new version
- You install the new version in `@charts/react`
- Now you can test whether they work together

Every change to core requires a full publish-install cycle before
you can test the effect in react. For a project you are actively
developing, this is extremely slow.

## What a monorepo does

A monorepo puts all packages in one repository. When `@charts/react`
imports from `@charts/core`, the package manager links directly to
the local folder — no publish-install cycle. You edit core and
see the result in react immediately.

One repository. One `git clone`. One `pnpm install`.

---

# Part 2: pnpm Workspaces

## What a workspace is

A pnpm workspace is pnpm's name for a monorepo. You declare it
with a file called `pnpm-workspace.yaml` in the root of your project.

Create `workspace-demo/pnpm-workspace.yaml`:

```yaml
packages:
  - "packages/*"
```

This tells pnpm: everything inside `packages/` is a workspace package.
Each subfolder of `packages/` that contains a `package.json` is
treated as a separate npm package.

## What workspace:* means

When one package depends on another in the same workspace,
you use the workspace protocol:

```json
{
  "dependencies": {
    "@charts/core": "workspace:*"
  }
}
```

`workspace:*` means: resolve `@charts/core` to the local workspace
package, whatever version it currently is. When you publish to npm,
pnpm replaces `workspace:*` with the actual version number automatically.

## Try it: a minimal workspace

Create this structure:

```
workspace-demo/
├── pnpm-workspace.yaml
├── package.json
└── packages/
    ├── core/
    │   ├── package.json
    │   └── src/
    │       └── index.ts
    └── app/
        ├── package.json
        └── src/
            └── index.ts
```

`workspace-demo/package.json`:

```json
{
  "name": "workspace-demo",
  "version": "1.0.0",
  "private": true
}
```

`"private": true` — never publish the root. The root is not a
package. It is just the container for the workspace.

`packages/core/package.json`:

```json
{
  "name": "@demo/core",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "type": "module"
}
```

`packages/core/src/index.ts`:

```typescript
export function greet(name: string): string {
    return `Hello from core, ${name}.`;
}
```

`packages/app/package.json`:

```json
{
  "name": "@demo/app",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@demo/core": "workspace:*"
  }
}
```

`packages/app/src/index.ts`:

```typescript
import { greet } from '@demo/core';

console.log(greet('workspace'));
```

Now from `workspace-demo/`:

```powershell
pnpm install
```

pnpm reads `pnpm-workspace.yaml`, finds both packages, and links
`@demo/core` into `@demo/app`'s `node_modules` as a symlink
pointing to the local folder.

```powershell
cd packages/app
node src/index.ts
```

Output:
```
Hello from core, workspace.
```

`@demo/app` imported `@demo/core` using its published package name,
but pnpm resolved it to the local folder. No npm publish needed.

---

# Part 3: What Gets Published vs What Stays Local

## The "files" field

When you run `npm publish`, npm uploads your package to the registry.
By default it uploads everything. You almost never want that.

The `"files"` field in `package.json` limits what gets uploaded:

```json
{
  "name": "@demo/core",
  "files": ["dist"]
}
```

This means: when publishing, only include the `dist/` folder.
Source code, tests, and config files stay local. Users only
get the compiled output.

## What users actually need

When someone installs your package, they need:

```
dist/index.js      — the compiled JavaScript they run
dist/index.d.ts    — TypeScript type definitions for autocomplete
dist/index.js.map  — source maps for debugging
```

They do not need:
```
src/               — your TypeScript source (you compiled it for them)
*.test.ts          — your tests (they run their own tests)
tsconfig.json      — your build config (irrelevant to them)
node_modules/      — their package manager handles this
```

## devDependencies vs dependencies

```json
{
  "dependencies": {
    "@demo/core": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

`"dependencies"` — packages needed at runtime. Installed when
someone does `npm install @demo/app`.

`"devDependencies"` — packages needed only during development.
TypeScript, test runners, bundlers. Not installed when someone
installs your package.

---

# Part 4: Build Order and Why It Matters

## The problem

`@demo/app` imports from `@demo/core`. For the import to work,
`@demo/core` must be compiled first — its `dist/` folder must exist.

With two packages this is obvious. With twenty, tracking the correct
build order by hand is error-prone and tedious.

## What a build pipeline does

A build pipeline reads your package dependencies, determines the
correct order, and runs builds in that order.

Turborepo is one such tool. You install it at the root:

```powershell
pnpm add -D turbo
```

Create `turbo.json` at the root:

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
    }
  }
}
```

Every field:

`"build"` — the build task.

`"dependsOn": ["^build"]` — the `^` means "the build task of
my dependencies." Before building this package, first build
everything this package depends on. This is what enforces
correct build order automatically.

`"outputs": ["dist/**"]` — Turborepo caches these files.
Next time you run build with no changes, it restores from
cache instead of rebuilding.

`"test"` — the test task.

`"dependsOn": ["build"]` — no `^`, so this means "my own build"
not "my dependencies' builds." Tests run after this package
is built.

Add build scripts to each package's `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "test": "vitest run"
  }
}
```

Now from the root:

```powershell
pnpm turbo build
```

Turborepo builds all packages in dependency order automatically.

---

# Part 5: The exports Field

## Why main is not enough

The `"main"` field in `package.json` tells Node.js which file to
load when someone imports your package:

```json
{
  "main": "./dist/index.js"
}
```

This works but is limited. Modern projects need to serve different
files to different environments:

- A bundler building for the browser wants ES modules
- An older Node.js project wants CommonJS
- TypeScript wants the type declarations

## The exports field

`"exports"` is the modern way to declare what your package exposes:

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

`"."` — the root import: what you get when you write
`import something from '@demo/core'` with no path after.

`"import"` — the file served when using ES module syntax.

`"require"` — the file served when using CommonJS require().

`"types"` — the TypeScript declaration file. TypeScript reads
this for type checking and autocomplete.

Why provide both `import` and `require`? Not everyone has
migrated to ES modules. A library that only provides ES modules
breaks in CommonJS projects. You serve both formats from one package.

---

# Part 6: tsup — Building a Library

## What tsup is

`tsc` compiles TypeScript but produces one output file per input
file. For a library you usually want:

- A single bundled file
- Both CommonJS and ES module formats
- TypeScript declarations generated automatically

`tsup` is a TypeScript bundler that does all three with
minimal configuration.

Install it:

```powershell
pnpm add -D tsup
```

Add a build script:

```json
{
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts --clean"
  }
}
```

Every flag:

`src/index.ts` — the entry point. tsup starts here and follows
all imports.

`--format esm,cjs` — produce both ES module (`.js`) and
CommonJS (`.cjs`) output files.

`--dts` — generate TypeScript declaration files (`.d.ts`).

`--clean` — delete the `dist/` folder before building.
Prevents stale files from previous builds.

Run it:

```powershell
pnpm build
```

Look at `dist/`. You should see:

```
dist/
├── index.js        ES module output
├── index.cjs       CommonJS output
├── index.d.ts      TypeScript declarations
└── index.d.ts.map  Source map for declarations
```

Open `index.js` and `index.cjs`. Notice the difference:

`index.js` uses ES module syntax:
```javascript
export { greet };
```

`index.cjs` uses CommonJS syntax:
```javascript
exports.greet = greet;
```

Same code, two formats, automatically generated.

---

# Part 7: Vitest — Testing

## What a test runner is

A test runner finds your test files, runs the test functions
inside them, and reports which pass and which fail.

Install Vitest:

```powershell
pnpm add -D vitest
```

Create `src/index.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { greet } from './index.js';

describe('greet', () => {
    it('returns a string containing the name', () => {
        const result = greet('world');
        expect(result).toContain('world');
    });

    it('returns a string', () => {
        expect(typeof greet('test')).toBe('string');
    });
});
```

Every part:

`describe('greet', () => { ... })` — groups related tests under
a label. The label appears in test output.

`it('returns a string containing the name', () => { ... })` —
one test case. The string describes what this test checks.
If this test fails, you see this string in the output.

`expect(result).toContain('world')` — an assertion.
`expect(result)` — "I am about to make a claim about result."
`.toContain('world')` — "result must contain the string 'world'."
If it does not, the test fails and Vitest shows you what result
actually contained.

Add a test script:

```json
{
  "scripts": {
    "test": "vitest run"
  }
}
```

Run tests:

```powershell
pnpm test
```

Output when tests pass:
```
✓ src/index.test.ts (2)
  ✓ greet > returns a string containing the name
  ✓ greet > returns a string

Test Files  1 passed (1)
Tests       2 passed (2)
```

Output when a test fails:
```
✗ src/index.test.ts (2)
  ✗ greet > returns a string containing the name
    AssertionError: expected 'Hi from core, world.' to contain 'hello'
      Expected: "hello"
      Received: "Hi from core, world."
```

Vitest tells you exactly what went wrong: what the test expected
and what it actually got.

## Test-first development

The most important practice in this series:
write the test before writing the code it tests.

1. Write a test for behaviour that does not exist yet
2. Run the test — it fails (the code is not written)
3. Write the minimum code to make the test pass
4. Run the test — it passes
5. Repeat

This forces you to think about what the code should do before
thinking about how to implement it. It also means you always
have a test for every piece of code you write.

---

# Micro-Project

You understand monorepos, workspaces, build pipelines, and testing.
Apply it to MikeLab.

MikeLab needs three packages:

```
@mikelab/core      the math engine
@mikelab/parser    the MATLAB parser
@mikelab/ui        the browser interface
```

The dependency direction:
```
@mikelab/ui  →  @mikelab/parser  →  @mikelab/core
```

Build it:

- Create the `packages/` folder with `core/`, `parser/`, and `ui/`
  subfolders
- Give each a `package.json` with the correct name, version,
  type, exports, scripts (build + test), and dependencies
  (parser depends on core, ui depends on both)
- Give each a `tsconfig.json` that extends a root `tsconfig.base.json`
- Give each a `src/index.ts` that exports one simple function
- Give each a `src/index.test.ts` with two tests for that function
- Create `pnpm-workspace.yaml` at the root
- Create `turbo.json` at the root with build and test pipelines
- Run `pnpm install` from the root
- Run `pnpm turbo build` — all three packages should build
- Run `pnpm turbo test` — all tests should pass

When it works, `git log --oneline` should show a meaningful
commit for this step.

---

# Challenges

**Challenge 1:**

Add a fourth package `@mikelab/config` that exports a single
object with MikeLab's name and version:

```typescript
export const config = {
    name: 'mikelab',
    version: '0.1.0',
};
```

Make `@mikelab/core` depend on `@mikelab/config` and use it in
its exported function. Write tests. Verify the build order is
correct by running `pnpm turbo build` and checking that config
builds before core.

**Challenge 2:**

Turborepo caches build outputs. Run `pnpm turbo build` twice.
The second run should be nearly instant. Look at the output —
Turborepo prints which tasks it ran and which it restored from cache.

Now change one character in `@mikelab/core/src/index.ts`.
Run `pnpm turbo build` again. Which packages rebuilt? Which were
served from cache? Why?

**Challenge 3:**

The `"exports"` field controls what a package exposes. Try to
import a file that is not in `"exports"`:

```typescript
// In @mikelab/parser/src/index.ts
import { something } from '@mikelab/core/internal';
```

Add a file `packages/core/src/internal.ts` that exports something.
Do NOT add it to the exports field. Try to import it. What happens?

Now add it to the exports field:

```json
{
  "exports": {
    ".": { ... },
    "./internal": {
      "import": "./dist/internal.js",
      "types": "./dist/internal.d.ts"
    }
  }
}
```

Try the import again. What changes?

---

# Definition of Done

```
□ You can explain what a monorepo is and when to use one
□ You can explain what workspace:* means in package.json
□ pnpm turbo build runs all three packages in the correct order
□ pnpm turbo test shows all tests passing
□ You ran pnpm turbo build twice and observed caching
□ dist/ folders exist in core and parser after building
□ dist/ contains .js, .cjs, and .d.ts files
□ You can explain the difference between "import" and "require"
   in the exports field
□ All three challenges completed
□ Changes committed with a meaningful message
```
