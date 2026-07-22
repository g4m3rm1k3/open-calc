# Concept: CommonJS Modules (`require`/`module.exports`)

**What you'll understand by the end:** the older, synchronous module system Node.js used before `import`/`export` existed, why it looks and behaves differently, and how to recognize which one a given file is using.

**Prerequisites:** `javascript-es-modules-import-export.md`.

## Setup

Any Node.js install — no `"type": "module"` in `package.json`, no special file extension. Plain `.js` files default to CommonJS unless told otherwise.

## The Problem

`import`/`export` (`javascript-es-modules-import-export.md`) is the modern, standard module system — but it's not the only one a real project encounters. Node.js existed for years before `import`/`export` was standardized in JavaScript itself, and built its own module system first: **CommonJS**. Plenty of real, current code — most Node.js tooling configs, many npm packages, and Electron's own main-process entry point — still uses it, either by choice or because the runtime loading that specific file expects it. Recognizing which system a file is written in, and why, matters the moment a project has to mix both.

## The Isolated Example

`greet.js`:
```javascript
function greet(name) {
  return `hello, ${name}`;
}
module.exports = { greet };
```

`main.js`:
```javascript
const { greet } = require("./greet.js");
console.log(greet("world"));
console.log("typeof require:", typeof require);
console.log("typeof module:", typeof module);
```

**Real output, run this session:**
```
hello, world
typeof require: function
typeof module: object
```

**What this proves:** `greet.js` exposed `greet` with no `export` keyword at all — `module.exports = { greet }` did the equivalent job by assigning to a real, pre-existing object (`module.exports`) that Node hands every file automatically. `main.js` pulled it back out with `require(...)`, a plain function call returning that exact object — not special import syntax, ordinary JavaScript. `require` and `module` are both real, already-existing values inside a CommonJS file, confirmed by `typeof` — neither is a language keyword.

## Mechanical Walkthrough

- `module.exports = { greet }` — **(a) first appearance.** Every CommonJS file receives its own private `module` object automatically; `module.exports` starts as an empty object, and whatever is assigned to it becomes the *entire* public surface `require(...)` returns elsewhere — closer to a single default export than to ES modules' several independent named exports.
- `require("./greet.js")` — **(a) first appearance.** An ordinary function call, evaluated **synchronously** — it reads and runs the target file, then returns its `module.exports` value immediately, before the next line runs. `import`, by contrast, is not a function call at all; it's dedicated syntax the language itself resolves, and can be asynchronous (a dynamic `import(...)` returns a Promise) — `require` never does.
- `const { greet } = require(...)` — **(b) reappearing** object destructuring (`javascript-destructuring.md`), applied to whatever plain object `require` happened to return — nothing require-specific about the destructuring itself.
- `typeof require` / `typeof module` — **(c) already established** `typeof`, confirming both are ordinary runtime values (a `function`, an `object`), not syntax.

## CS Lens

This is the same **module system** idea `javascript-es-modules-import-export.md`'s own CS Lens already names — a mechanism for controlling what one unit of code exposes to others — implemented differently: CommonJS resolves and loads modules **synchronously**, at the moment `require` is called, by directly running the target file's code and reading a plain object it built (`module.exports`); ES modules are resolved **statically**, before any code runs, which is what lets a tool analyze an entire `import`/`export` graph ahead of time without executing anything (real, practical payoff: this static structure is what makes tree-shaking and certain compile-time checks possible for ES modules in a way CommonJS's fully-dynamic, run-anything-to-find-out-what-it-exports model cannot support).

Also recognized in: Python's module system being resolved at `import` time too (though via a different mechanism than either JS system), and any plugin/extension system where "load this file and see what it registers" (CommonJS's model) is chosen over a declared, static manifest (ES modules' model) — a real, recurring tradeoff between flexibility and analyzability.

## SE Lens

Node.js added native `import`/`export` support years after CommonJS was already the ecosystem standard — by the time it did, an enormous amount of real, working code (and Electron's own main-process convention, still CommonJS by default today) already existed on `require`/`module.exports`, so both systems remain real and current rather than one having fully replaced the other. The concrete cost of the split: a file's `package.json` (`"type": "module"` or its absence) or file extension (`.mjs`/`.cjs`) silently determines which system a given `.js` file is even allowed to use `import` or `require` in — mixing the two incorrectly in one file is a real, common, sometimes confusing error for exactly this reason, not a hypothetical edge case.

## Connection

Directly contrasted with `javascript-es-modules-import-export.md` — same underlying goal (module boundaries), two real, different mechanisms. `javascript-destructuring.md` is reused, not re-taught, at the `require(...)` call site.

## Try It Yourself

1. Add a second named value to `greet.js`'s `module.exports` (e.g. `farewell`), destructure both in `main.js`, and confirm both work with no other change — direct proof `module.exports` behaves like the plain object it is.
2. Delete the `module.exports = ...` line entirely from `greet.js`, rerun `main.js`, and read the real error — reason about what `require("./greet.js")` actually returned instead (an empty object) and why destructuring `greet` from it fails the way it does.
3. Try adding `"type": "module"` to a `package.json` in this same folder, then rerun `main.js` unchanged, and read the real error Node produces — confirming the module system a file uses isn't just a stylistic choice, it's enforced.
