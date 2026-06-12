# FOUNDATIONS — LAB-010 — Modules and Imports

**Series:** FOUNDATIONS — Part II: Programming Fundamentals
**Environment:** A standalone HTML file opened in the browser. You will create two JavaScript files and one HTML file — no server required.
**Time:** 55–70 minutes.

---

## What You Will Build

Two JavaScript module files that import from each other, served via a standalone HTML file using `type="module"` script tags. One module exports math utility functions; a second module imports them and performs calculations. You will observe the difference between ES modules (explicit exports, no global pollution) and classic script tags (implicit globals, everything shared). After this lab, you will understand what every `import` and `export` statement in every codebase you read is actually doing.

---

## What You Need to Know First

**From LAB-006 and LAB-007:** Functions are values. Closures give modules private state. A module is a file-level closure — variables declared in a module are private to it unless explicitly exported.

**From LAB-009:** Errors thrown in one module propagate normally across import boundaries. The module system does not change exception mechanics.

**New tooling introduced this lab:** You will create local files and open them in the browser using `file://` protocol with `type="module"` scripts. This works without any server. The constraint: `type="module"` scripts require either a server or modern browser security settings that allow file:// module loading — if it does not work on your machine, open the browser console and follow the alternative REPL instructions provided in each step.

---

> **Quick Check — try to answer before reading:**
>
> 1. You have two script files loaded with `<script src="a.js">` and `<script src="b.js">`. `a.js` defines a variable `total`. Can `b.js` read `total`? What if the order of the script tags is reversed?
> 2. What would change if, instead of exporting only one function from a module, you exported ten? What if you wanted to import only three of them?
> 3. What is the difference between `export default` and a named export?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — The Problem That Modules Solve

**The problem this step solves:** Experience the global scope pollution problem that modules eliminate.

**The code — what happens without modules:**

Create a folder called `lab-010`. Inside it, create `index.html`:

```html
<!DOCTYPE html>
<html>
<head><title>Lab 010</title></head>
<body>
  <script src="script-a.js"></script>
  <script src="script-b.js"></script>
  <script>
    console.log("From index.html: result =", result);
  </script>
</body>
</html>
```

Create `script-a.js`:

```js
var helper = function(x) { return x * 2; };
var result = helper(5);
```

Create `script-b.js`:

```js
// This file has no idea what 'helper' is — but it CAN use it
// because var declarations are global
var result = helper(10);   // overwrites script-a.js's result
```

**The walkthrough — what the browser does:**

1. The browser parses `index.html` from top to bottom.
2. It encounters `<script src="script-a.js">`. It downloads (or reads from cache) `script-a.js` and executes it. `helper` is created as a global variable on `window`. `result` is created as `window.result = 10`.
3. It encounters `<script src="script-b.js">`. Executes it. `helper` is still available globally. `window.result` is overwritten to `20`.
4. The inline script runs. `result` is `20` — `script-a.js`'s computation was silently overwritten.

`var` — the original JavaScript variable declaration. Unlike `let` and `const`, `var` declared at the top level of a script (not inside a function) creates a property on the global `window` object. Any script loaded on the same page can read or overwrite it. This is called **global scope pollution**.

**CS lens — the namespace collision problem:**

When multiple scripts share a global namespace, any two variables with the same name collide. A library named `utils.js` and another library also named `utils.js` break each other. jQuery had to claim the global `$` and `jQuery` — names no other library could use. This is a global resource allocation problem. The larger the program and the more third-party code it uses, the worse it gets.

**SE lens — implicit dependencies are invisible dependencies:**

`script-b.js` depends on `helper` from `script-a.js`. But this dependency is invisible: you cannot read `script-b.js` alone and know it needs `script-a.js`. You cannot reorder the script tags without breaking the code. You cannot use `script-b.js` in a different project unless `script-a.js` also happens to be present. Explicit imports — `import { helper } from './script-a.js'` — make every dependency visible in the file that needs it.

**What breaks without modules:**

Every JavaScript file loaded with `<script>` shares the same global object (`window`). Name collisions are inevitable in any project using more than a few files or any third-party libraries. The original 1995 JavaScript design decision to make top-level `var` global was a mistake that caused a decade of workarounds before the module system was standardized.

---

### SAVE AND TRY

Create the three files above, open `index.html` in Chrome or Firefox (File → Open File), and open the DevTools Console (F12).

Expected: `From index.html: result = 20` — `script-a.js`'s value was overwritten by `script-b.js`.

**Change something:** Swap the order of `<script src="script-a.js">` and `<script src="script-b.js">`. Expected: an error — `helper is not defined` — because `script-b.js` runs before `script-a.js` defines `helper`. This illustrates that implicit global dependencies create a fragile load-order dependency that is invisible in the code.

---

### Step 2 — ES Modules: Explicit Exports and Imports

**The problem this step solves:** Replace global scope sharing with explicit, declared dependencies.

**`type="module"` in HTML:**

Update `index.html`:

```html
<!DOCTYPE html>
<html>
<head><title>Lab 010 — Modules</title></head>
<body>
  <script type="module" src="main.js"></script>
</body>
</html>
```

`type="module"` — this attribute on a `<script>` tag tells the browser to treat the file as an ES module rather than a classic script. ES modules differ from classic scripts in three ways: (1) they use `import`/`export` syntax, (2) they run in **strict mode** automatically (`var` declarations are no longer global), and (3) they are **deferred** by default — they execute after the HTML is fully parsed, not when encountered.

Create `math-utils.js`:

```js
// Named exports — multiple things exported from one module
export function double(x) {
  return x * 2;
}

export function square(x) {
  return x * x;
}

export function clamp(value, minimum, maximum) {
  if (value < minimum) return minimum;
  if (value > maximum) return maximum;
  return value;
}

// Private — not exported. Only code inside this file can use this.
function internalHelper() {
  return "only visible inside math-utils.js";
}

// Named export of a constant
export const PI = 3.14159265358979;
```

Create `main.js`:

```js
import { double, square, PI } from './math-utils.js';
// We did not import clamp or internalHelper — they are not available here

console.log(double(5));     // → 10
console.log(square(4));     // → 16
console.log(PI);            // → 3.14159265358979
```

**The walkthrough — what the browser does:**

1. The browser loads `index.html`. Encounters `<script type="module" src="main.js">`.
2. It downloads `main.js` and finds `import { double, square, PI } from './math-utils.js'`.
3. It downloads `math-utils.js` and evaluates it. The module's code runs. `double`, `square`, `clamp`, and `PI` are created, but they are **not global** — they exist only in `math-utils.js`'s module scope.
4. Only the three **named exports** (`double`, `square`, `PI`) are made available to importers. `internalHelper` is not exported — it is permanently private.
5. `main.js` receives the three requested bindings. `double(5)` calls the function from `math-utils.js`. Logs `10`.

**`import { double, square, PI } from './math-utils.js'`** — this import statement has three parts:
- `{ double, square, PI }` — a **destructuring-style** list of the named exports to import. Only these three are imported; `clamp` is not.
- `from './math-utils.js'` — the **module specifier**. The `./` prefix means "relative to the current file." Without `./`, the browser would look for an installed package, not a local file.
- The imported names (`double`, `square`, `PI`) are **live bindings**, not copies. If `math-utils.js` changed the value of `PI` (it cannot, because `const` prevents this — but hypothetically), `main.js` would see the new value.

**CS lens — modules as namespaces:**

A module creates an isolated namespace. Variables declared in a module are scoped to that module and are invisible outside unless exported. This is the same concept as a class's private members, a function's local variables (from LAB-007), or an operating system process's private memory. Namespacing is the mechanism that allows large programs to be composed from independently developed pieces without interference.

**SE lens — explicit is better than implicit:**

`import { double } from './math-utils.js'` makes the dependency on `math-utils.js` visible in the file that needs it. You can read `main.js` and immediately know: this file needs `double`, `square`, and `PI` from `math-utils.js`. Deleting `math-utils.js` produces an immediate error at `main.js`'s import statement, pointing directly to the problem. Compare to the classic script version, where deleting a dependency produces a `ReferenceError` at the first *use* of the variable, which may be far from the load point.

**What breaks without explicit exports:**

If `internalHelper` were accessible from outside (by not being private), external code could call it and depend on its behavior. If the module's author later renames or removes `internalHelper`, that external code breaks. The module author cannot safely refactor their private implementation. By keeping `internalHelper` private (unexported), the module author is free to change it without breaking any code outside the module. This is the **public/private surface distinction** — the first principle of modular design.

---

### SAVE AND TRY

Create `math-utils.js` and `main.js` as above, open `index.html` in the browser, and check the console.

Expected: `10`, `16`, `3.14159265358979`.

**Change something:** In `main.js`, add `import { clamp } from './math-utils.js'` to the existing import (add `clamp` to the destructuring list). Use it: `console.log(clamp(15, 0, 10))`. Expected: `10`. Then try to import `internalHelper`: `import { internalHelper } from './math-utils.js'`. Expected: an error — `internalHelper` is not exported.

---

### Step 3 — Default Exports and Namespace Imports

**The problem this step solves:** Handle the two cases: a module that exports one primary thing, and a module where you want to import everything at once under one name.

**Default exports:**

```js
// calculator.js
export default class Calculator {
  constructor() {
    this.result = 0;
  }

  add(n)      { this.result += n; return this; }
  subtract(n) { this.result -= n; return this; }
  multiply(n) { this.result *= n; return this; }
  getValue()  { return this.result; }
}
```

`export default` — a module can have at most one **default export**. It represents the module's primary thing. Unlike named exports, the importer can give the default export any name they want:

```js
// main.js — importing a default export
import Calculator from './calculator.js';
// The name 'Calculator' is chosen by the importer — any name works

const calc = new Calculator();
calc.add(10).multiply(3).subtract(5);
console.log(calc.getValue());   // → 25
```

`import Calculator from './calculator.js'` — no curly braces. The absence of `{}` signals a default import. The name (`Calculator`) is the importer's choice — the exporting file does not dictate the name for default exports.

**Namespace imports:**

```js
// main.js — importing everything from math-utils.js under one name
import * as MathUtils from './math-utils.js';

console.log(MathUtils.double(5));   // → 10
console.log(MathUtils.square(4));   // → 16
console.log(MathUtils.PI);          // → 3.14159...
```

`import * as MathUtils` — imports all named exports from the module and makes them properties of the `MathUtils` object. This is called a **namespace import**. It is useful when you need many exports from a module and want to avoid listing them all. The trade-off: it makes it less clear which specific things from the module are actually used.

**CS lens — aliasing and namespacing:**

Default exports solve a common pattern: a module whose single purpose is to provide one class, one function, or one configuration object. The importer gets to name it in a way that makes sense in their context. Named exports solve the opposite pattern: a utilities module that provides many independent tools, each of which can be imported selectively.

**SE lens — why not always use default exports?**

Default exports have worse tooling support for refactoring. When you rename a default export, every importer uses whatever name they chose — there is no canonical name to search for. Named exports have a canonical name (`double` is always `double`). Renaming them requires finding every `import { double }` statement. This is easy with a code editor's "find references" feature. Many JavaScript style guides prohibit `export default` for this reason.

**What breaks without the distinction:**

A module that exports only `export default` cannot selectively export multiple things without the importer having to destructure the default. `import utils from './utils.js'` then `utils.double(5)` — the importer must always go through the default object. Named exports let the importer take exactly what they need: `import { double } from './utils.js'`.

---

### SAVE AND TRY

Create `calculator.js` with the `Calculator` class above. Update `main.js`:

```js
import Calculator from './calculator.js';
import * as MathUtils from './math-utils.js';

const calc = new Calculator();
calc.add(10).multiply(3).subtract(5);
console.log("Calculator result:", calc.getValue());   // → 25

console.log("MathUtils.double(7):", MathUtils.double(7));   // → 14
console.log("MathUtils.PI:", MathUtils.PI);
```

Expected: `25`, `14`, and the PI value.

**Change something:** Try importing `Calculator` under a different name: `import Calc from './calculator.js'`. Works fine — default exports allow any name. Try accessing `MathUtils.internalHelper` — expected `undefined`, because it was not exported.

---

### Step 4 — Re-Exports and Barrel Files

**The problem this step solves:** Create a single entry point that re-exports from multiple modules, so importers do not need to know the internal file structure.

**The code:**

Create `geometry/circle.js`:

```js
export const PI = Math.PI;   // more precise than our manual PI

export function circleArea(radius) {
  return PI * radius * radius;
}

export function circumference(radius) {
  return 2 * PI * radius;
}
```

Create `geometry/rectangle.js`:

```js
export function rectangleArea(width, height) {
  return width * height;
}

export function perimeter(width, height) {
  return 2 * (width + height);
}
```

Create `geometry/index.js` — the barrel file:

```js
export { circleArea, circumference } from './circle.js';
export { rectangleArea, perimeter } from './rectangle.js';
// PI is intentionally not re-exported — it is an implementation detail
```

Now `main.js` can import from one place instead of two:

```js
import { circleArea, rectangleArea } from './geometry/index.js';

console.log("Circle area (r=5):", circleArea(5).toFixed(2));      // → "78.54"
console.log("Rectangle area:", rectangleArea(4, 6));               // → 24
```

`toFixed(2)` — the `Number` method that returns a string representation of a number rounded to the given number of decimal places. `(3.14159).toFixed(2)` returns the string `"3.14"`.

**The walkthrough — what happens at import:**

1. `main.js` imports from `./geometry/index.js`.
2. The browser loads `index.js`. It encounters two `export ... from` statements.
3. It loads `./circle.js` and `./rectangle.js`.
4. It re-exports the specified names from `index.js`.
5. `main.js` receives `circleArea` and `rectangleArea`.
6. `main.js` has no idea `circle.js` and `rectangle.js` exist. It only knows about the barrel file.

**CS lens — indirection through a barrel:**

A **barrel file** (often named `index.js`) is a module that re-exports from other modules. It creates an **indirection layer**: consumers import from the barrel; the barrel imports from the implementation files. The internal file structure can be reorganized (splitting `circle.js` into `circle-area.js` and `circle-perimeter.js`, for example) without changing any consumer imports — only the barrel file needs to change.

**SE lens — encapsulating package internals:**

A barrel file defines the **public API** of a folder of modules. Everything exported from `index.js` is public. Everything else is private to the folder. This mirrors how package-level visibility works in Java (`public` vs package-private) and Go (exported identifiers start with a capital letter). The consumer (`main.js`) depends on the public API; the implementation details can evolve freely.

**What breaks without this:**

Without a barrel, every consumer imports directly from the implementation file: `import { circleArea } from './geometry/circle.js'`. If you later split `circle.js` into two files, every import statement that referenced `circle.js` must be updated. With a barrel, only the barrel changes.

---

### SAVE AND TRY

Create the three geometry files above, update `main.js` with the barrel import, refresh the page.

Expected: `Circle area (r=5): 78.54` and `Rectangle area: 24`.

**Change something:** Add `export { PI } from './circle.js'` to `geometry/index.js`. Now `main.js` can `import { PI } from './geometry/index.js'`. Try it. Expected: `Math.PI` (approximately `3.14159265358979`). Then remove the re-export from `index.js`. Expected: an import error in `main.js` — `PI` is no longer available through the barrel.

---

## Connect the Pieces

**What you built:** Two module files with named and default exports, a barrel file that re-exports, and the direct experience of why global scripts cause name collisions.

**How it connects to LAB-007 (Closures):** A module file is a closure at file scope. Variables declared in a module are scoped to the module — invisible outside — exactly like variables declared inside an IIFE. The `export` keyword selectively punches holes in that closure to allow specific values out. This is the module pattern from LAB-007 provided natively by the language instead of manually via an IIFE.

**How it connects forward:**

- **Every remaining lab:** All code you write from here forward uses ES module syntax. `import` and `export` appear in every project.
- **LAB-039 (TypeScript Async):** TypeScript modules use the same `import`/`export` syntax. The type system layers on top of the module system without changing how imports work.
- **LAB-087 (Layered Architecture):** Modules are the physical manifestation of architectural layers. `presentation/` imports from `domain/`; `domain/` imports from `infrastructure/`. The module dependency graph encodes the architecture.
- **LAB-089 (Hexagonal Architecture):** The ports (interfaces) are exported from the domain module; adapters (implementations) are in separate modules that the main composition module wires together.

**The real-world connection:**

Every React, Vue, Angular, and Node.js codebase is a collection of ES modules. Every `import React from 'react'` you write uses default import syntax from Step 3. Every `import { useState, useEffect } from 'react'` uses named import syntax from Step 2. The npm ecosystem — hundreds of thousands of packages — consists of modules that export their API and keep their internals private.

---

## What Breaks Without This

**Concrete failure — global variable collision with a library:**

Classic scripts would make this happen. Two libraries both name their utility function `utils`:

```html
<script src="library-a.js"></script>   <!-- defines window.utils -->
<script src="library-b.js"></script>   <!-- also defines window.utils, overwrites the first -->
<script>
  utils.formatDate(new Date());   // uses library-b's utils — but which one did you expect?
</script>
```

No error is thrown — the wrong `utils` is silently used. This exact problem existed with jQuery plugins and other pre-module libraries throughout the 2000s and early 2010s. Debugging it required reading the scripts in load order and identifying which `window` property was being set last. The module system eliminates this class of bug entirely by making all module-level variables private by default.

---

## Definition of Done

Verify each item before moving to LAB-011.

- [ ] `math-utils.js` exports `double`, `square`, `clamp`, `PI` as named exports — and `internalHelper` is not exported
- [ ] `main.js` imports and uses `double` and `square` without errors
- [ ] Importing a non-exported name (`internalHelper`) produces an error
- [ ] `Calculator` is exported as a default export and imported under a chosen name
- [ ] `import * as MathUtils from './math-utils.js'` works and `MathUtils.double(5)` returns `10`
- [ ] The barrel `geometry/index.js` allows `main.js` to import `circleArea` and `rectangleArea` without knowing their source files
- [ ] You can explain in one sentence what `export default` means vs a named export

**Git commit:**

```
git add .
git commit -m "LAB-010: ES modules with named/default exports, barrel files, and explicit dependency declarations replacing implicit global sharing"
```

---

## Quick Check Answers

**1. Can `b.js` read `total` from `a.js` when both are loaded with `<script>` tags?**

Yes — if `total` is declared with `var` at the top level of `a.js`, it becomes a property of `window` and is accessible from any script on the same page. Order matters: `a.js` must be loaded before `b.js` tries to use `total`, or `b.js` gets `undefined`. Reversing the script tags causes `b.js` to run first, when `total` does not yet exist. This implicit dependency on load order is one of the problems modules solve.

**2. What changes if you export ten things but only import three?**

Only the three imported names are available in the importing module. The other seven are not loaded lazily — the entire module file is evaluated — but the other seven names are simply not bound in the importing scope. You cannot accidentally use them. A bundler like Webpack or Vite can perform **tree shaking**: it statically analyzes which exports are actually imported across the whole program and removes the unused ones from the production bundle, reducing file size.

**3. What is the difference between `export default` and a named export?**

A named export has a fixed name (`export function double`)— importers use that exact name or explicitly alias it (`import { double as twice }`). A module can have many named exports. A default export has no fixed name — the importer chooses the name freely (`import Calculator` / `import Calc` / `import MyCalc`). A module can have at most one default export. Default exports are typically used for the one primary thing a module provides; named exports are used for utilities, constants, and types.

---

*Next: LAB-011 — Async Programming: Callbacks, Promises, and async/await*
