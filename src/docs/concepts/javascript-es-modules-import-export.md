# Concept: JavaScript/TypeScript ES Modules (`import`/`export`)

**What you'll understand by the end:** how one file makes a function, class, or value available to another file, and the two different styles of doing so.

**Prerequisites:** none.

## Setup

Any modern JavaScript or TypeScript runtime — Node.js (with `"type": "module"` in `package.json`, or `.mjs` files) or a bundler/dev-server setup like Vite. No install needed beyond the runtime itself.

## The Problem

A program of any real size needs to be split across multiple files, but a function or value defined in one file is, by default, invisible to every other file — something has to explicitly make it available, and something else has to explicitly ask for it, or every file would need to be one giant, unmanageable blob.

## The Isolated Example

`math.js`:
```javascript
export function double(n) {
    return n * 2;
}

export const PI_ISH = 3.14;

export default function triple(n) {
    return n * 3;
}
```

`main.js`:
```javascript
import triple, { double, PI_ISH } from "./math.js";

console.log(double(5));
console.log(PI_ISH);
console.log(triple(5));
```

**Real output:**
```
10
3.14
15
```

**What this proves:** three separate things — a function, a constant, and a "default" export — all defined in one file, were each individually accessible from a completely different file, using two distinct import syntaxes (`triple` with no braces for the default export, `{ double, PI_ISH }` with braces for the named ones) matching how each was originally exported.

## Mechanical Walkthrough

- `export function double(n) { ... }` / `export const PI_ISH = ...` — a **named export**: marks a specific, named declaration as available to other files. A single file can have any number of named exports.
- `export default function triple(n) { ... }` — the **default export**: at most one per file, intended for "the one main thing this file provides." A default export is imported without braces, and can be given *any* name at the import site (`import triple from "./math.js"` — the local name `triple` here is chosen by the importer, not fixed by the exporting file).
- `import { double, PI_ISH } from "./math.js"` — named imports must match the exported names exactly (with braces), though they can be renamed with `as` (`import { double as dbl }`).
- `import triple, { double, PI_ISH } from "./math.js"` — a single `import` statement can combine one default import and any number of named imports together.
- The path (`"./math.js"`) is **relative** when it starts with `./` or `../` — resolved relative to the importing file's own location — versus a **bare specifier** (`"three"`, `"vite"`) which resolves to an installed package inside `node_modules/`, following the language's/tool's own module resolution rules.

## CS Lens

This is a **module system** — a language-level mechanism for controlling what a unit of code exposes to the outside world (its **public interface**) versus what stays private to that file. Everything not explicitly `export`ed remains completely inaccessible from any other file, the same "explicit boundary" idea a class's public methods versus private internals represents, applied at the file level instead of the object level.

Also recognized in: Python's `from module import name` (see `python-import-statement.md` — a different, older module system, but the same underlying goal), Java's `import` plus `public`/`private` access modifiers, and C's `#include` plus header files (a much more primitive, textual version of the same idea).

## SE Lens

Named exports make a file's full public surface explicit and grep-able (every `export` keyword marks something intentionally shared), while a default export signals "this file's one main thing" — useful for files whose whole purpose is a single function or component, but easy to overuse for files that genuinely provide several equally-important things, where forcing an artificial "main" export can be more confusing than simply naming everything explicitly. Many real-world JavaScript/TypeScript style guides recommend named exports over default exports for exactly this reason — a named export's name is fixed and consistent everywhere it's imported, while a default export's local name can silently differ from file to file, making a codebase-wide search for "everywhere this is used" harder.

## Connection

This is the underlying mechanism behind every cross-file `import`/`export` used throughout a TypeScript or Vite-based project — a build tool's own config file exporting its configuration object, one module exporting a function another module calls, one module exporting a type another module's function signatures depend on.

## Try It Yourself

1. Try importing a name that was never exported from `math.js` (e.g. `import { quadruple } from "./math.js";`) and observe the real error — reason about whether it's caught at compile/bundle time (TypeScript/a bundler) or only at runtime (plain Node.js with no type checking).
2. Rename a named import using `as` (`import { double as multiplyByTwo } from "./math.js";`) and confirm the function still works under its new local name, while `math.js` itself is completely unaware anything was renamed.
3. Add a second file that imports from `main.js` (which itself imports from `math.js`), and trace the resulting dependency chain — reasoning about why a module system needs to resolve this chain correctly regardless of how many files deep it goes.
