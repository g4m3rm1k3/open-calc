# 005 — JavaScript Modules

*Encapsulation, the module graph, and why import/export replaced global variables*

---

## What You Will Build

You will split `browser-intro.js` into two files that communicate through explicit imports and exports. One file will own the requirements data. The other will own the DOM interaction. Neither will use global variables to share state.

Open `index.html` in a browser after this lesson and the page will behave identically to lesson 004. But the code will be structured so that changing the requirements data requires touching only the file that owns it, and changing the DOM behaviour requires touching only the file that owns that.

This is separation of concerns applied at the JavaScript file level — the same principle from lesson 001, now visible in code.

---

## What You Need to Know First

Lesson 004 — What a Browser Actually Does. You need `index.html` and `browser-intro.js` from that lesson. This lesson modifies them.

Lesson 003 — Version Control First. You will commit the changes.

---

## The Lesson

### The global variable problem

Every JavaScript file loaded in a browser before modules existed shared the same global scope. The **global scope** is the namespace everything is in by default — a single flat collection of names that every script can read and write.

This was a design decision that made early JavaScript simple. It became a maintenance problem as programs grew.

Here is what the problem looks like:

Imagine you have two files. `utils.js` defines a helper called `formatItem`. `app.js` also defines a function called `formatItem` because the developer of `app.js` did not know `utils.js` had one with the same name.

```html
<script src="utils.js"></script>
<script src="app.js"></script>
```

The second file silently overwrites the first file's `formatItem`. No error. No warning. The wrong `formatItem` is called everywhere from that point on. The bug only manifests when `formatItem` is used in a way that relies on the `utils.js` implementation.

In a project with ten scripts, you have ten windows into the same namespace. Any name collision between any two scripts produces silent overwriting. The only solution was naming conventions — prefixing every name with the library's name (`jQuery.ajax`, `Underscore.each`) — which is verbose and still error-prone.

**The module system solves this.** Each module file has its own scope. Names defined in a module are private to that module unless explicitly exported. Names from other modules are unavailable unless explicitly imported. There are no collisions, no silent overwrites, and no need for namespace prefixes.

---

**CS lens — modules as encapsulation:**

**Encapsulation** is the principle that an object or module hides its internal implementation and exposes only what it chooses to expose through a defined interface.

Before modules, JavaScript had no encapsulation at the file level. Every name in every file was visible to every other file. The "internal" and "public" distinction did not exist.

ES modules introduce file-level encapsulation. A module's internal variables are private by default. Only names explicitly marked with `export` are part of the module's public interface. This is the same principle as `private` and `public` in Java or C++, applied to files instead of classes.

---

**SE lens — the module boundary as a contract:**

From lesson 001, the Mars Climate Orbiter failed because two modules shared data through an undocumented, implicit interface — numbers with no agreed unit.

The module system makes interfaces explicit. When `app.js` imports `{ requirements }` from `data.js`, the import statement is documentation: this name, from this file. When `data.js` changes its export (renames `requirements` to `labRequirements`), the import in `app.js` breaks with a clear error: "does not provide an export named 'requirements'." The contract violation is detected immediately, not silently at runtime.

Explicit imports are self-documenting dependency declarations. Every import answers three questions: where does this come from, what specifically is being imported, and why is it needed here.

---

### ES modules syntax

JavaScript modules use two keywords: `export` and `import`.

**`export`** marks a name as part of a module's public interface:

```javascript
// A named export — anyone importing this module can use this name
export const pi = 3.14159

// A function export
export function formatNumber(value) {
  return value.toFixed(2)
}

// A default export — each module can have at most one
export default function main() {
  // ...
}
```

A **named export** exports a specific name. Importers must use that exact name (or rename it with `as`). A **default export** is the module's primary value — importers can give it any name they choose.

**`import`** brings exported names into the current module's scope:

```javascript
// Named import — must match an exported name
import { pi, formatNumber } from './math.js'

// Rename on import
import { pi as PI } from './math.js'

// Default import — name is chosen by the importer
import main from './app.js'

// Import everything as a namespace object
import * as math from './math.js'
// Access: math.pi, math.formatNumber
```

The string after `from` is the **module specifier** — the path to the file. Paths starting with `./` or `../` are relative to the current file. The `.js` extension is required in browser modules and recommended everywhere.

---

**CS lens — the module graph:**

Every `import` statement creates a directed edge in a graph: the importing module depends on the imported module. The collection of all modules and their dependencies forms the **module graph** (also called the dependency graph or import graph).

When the browser encounters `<script type="module" src="app.js">`, it:
1. Fetches `app.js`
2. Parses its `import` statements to find its dependencies
3. Fetches each dependency
4. Repeats recursively until all modules in the graph are fetched
5. Executes them in dependency order — dependencies before dependents

This traversal is depth-first. The browser builds the full graph before executing any module. In a build tool like Vite (lesson 007), this graph traversal is where bundling happens — the tool follows the same dependency edges to find all code that must be included in the output.

---

**SE lens — the module graph as an architectural map:**

The module graph is the code-level representation of the system architecture. If you draw the dependency graph of a well-structured codebase, the arrows point in one direction: from high-level modules toward low-level modules. High-level modules (the shell, the router) depend on low-level modules (utilities, data). Low-level modules do not depend on high-level ones.

This one-directional flow is called the **Dependency Inversion Principle** (from SOLID, a set of object-oriented design principles). When the dependency graph has cycles — A imports B, B imports A — neither module can change without affecting the other. Changes cascade infinitely.

In lesson 022, when you build the lab registry, you will see this principle enforced architecturally: the shell depends on the registry, labs register themselves into the registry, but the registry does not depend on any specific lab. The dependency graph has no cycles.

---

### Split browser-intro.js into two modules

You will create two new files to replace `browser-intro.js`:

- `requirements-data.js` — owns the data: the requirements arrays
- `dom-interaction.js` — owns the behaviour: finding elements, handling events

**Step 1 — Create requirements-data.js:**

```javascript
// requirements-data.js
//
// Single responsibility: owns the requirements data for the platform.
// Nothing in this file touches the DOM.

export const functionalRequirements = [
  'A learner can open any lab and interact with it',
  'A learner can navigate between labs without losing state in any of them',
  'A learner can return to the home screen at any time',
  'A lab can be added to the platform without modifying navigation code',
  'A lab can be removed without breaking any other lab',
  'A broken lab fails in isolation without affecting the shell or other labs',
]

export const nonFunctionalRequirements = [
  'Any lab loads within 2 seconds on a 4G connection',
  'Navigation between previously-visited pages takes under 100 milliseconds',
  'The app works offline after first load',
  'A developer can add a new lab by reading fewer than 50 lines of existing code',
]

export const architecturalConstraints = [
  'Labs are independent: one lab cannot import from another',
  'The shell does not import from any lab',
  'Each lab loads its code on demand',
]
```

**Walkthrough:**

`export const functionalRequirements = [...]` — the `export` keyword placed before `const` makes `functionalRequirements` a named export. Without `export`, this name would be private to this file — invisible to any other module.

This file has no `import` statements. It has no dependencies. It is a **leaf node** in the module graph — nothing feeds into it. This is correct: data definitions should not depend on anything; everything else depends on them.

The comment "Nothing in this file touches the DOM" is a self-enforcing contract. If a future developer adds `document.getElementById` to this file, the comment becomes false and serves as a signal to remove the DOM code.

---

**Step 2 — Create dom-interaction.js:**

```javascript
// dom-interaction.js
//
// Single responsibility: DOM interaction for the index.html page.
// Imports data from requirements-data.js.
// Does not contain any raw data — it renders data, it does not define it.

import { functionalRequirements } from './requirements-data.js'

const statusMessage = document.getElementById('status-message')
const toggleButton  = document.getElementById('toggle-button')

if (statusMessage === null) {
  throw new Error('Element with id "status-message" not found.')
}
if (toggleButton === null) {
  throw new Error('Element with id "toggle-button" not found.')
}

let isShowingRequirements = false

function buildRequirementsList(items) {
  const list = document.createElement('ul')
  items.forEach((itemText) => {
    const listItem     = document.createElement('li')
    listItem.textContent = itemText
    list.appendChild(listItem)
  })
  return list
}

function toggleRequirements() {
  if (isShowingRequirements) {
    statusMessage.textContent = 'No application code has been built yet.'
    toggleButton.textContent  = 'Show requirements'
    isShowingRequirements     = false
  } else {
    statusMessage.textContent = ''
    statusMessage.appendChild(buildRequirementsList(functionalRequirements))
    toggleButton.textContent  = 'Hide requirements'
    isShowingRequirements     = true
  }
}

toggleButton.addEventListener('click', toggleRequirements)
```

**Walkthrough:**

`import { functionalRequirements } from './requirements-data.js'` — this is a named import. The curly braces `{ }` indicate named imports — they must match an exported name in the target file. `from './requirements-data.js'` specifies the path. `./` means "in the same directory as this file." The `.js` extension is required in browser modules.

This import statement communicates three things:
1. **Where**: `./requirements-data.js` — the same directory
2. **What**: `functionalRequirements` — this specific export
3. **Why** (implied by context): this file renders requirements, so it needs the requirements data

`function buildRequirementsList(items)` — the function now accepts `items` as a parameter instead of referencing the array directly. This makes the function **pure** with respect to its data: its output depends only on what is passed in, not on any global or module-level state it reaches outside its parameters. A function that receives its data as arguments is easier to test — you call it with different arrays and verify the output.

---

**Step 3 — Update index.html:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>my-platform</title>
</head>
<body>
  <h1>my-platform</h1>
  <p id="status-message">No application code has been built yet.</p>
  <button id="toggle-button">Show requirements</button>

  <script type="module" src="dom-interaction.js"></script>
</body>
</html>
```

Two changes from lesson 004:

`type="module"` — this attribute on the `<script>` tag tells the browser to load the file as an **ES module** instead of a classic script. Without `type="module"`, `import` statements throw a `SyntaxError: Cannot use import statement outside a module`. With it, the browser processes the module graph: it fetches `dom-interaction.js`, sees it imports `requirements-data.js`, fetches that too, and executes them in dependency order.

`src="dom-interaction.js"` — points to the entry module (the one that starts the module graph). The browser fetches this file first and follows its imports from there. We no longer reference `requirements-data.js` directly in HTML — it is a dependency of `dom-interaction.js`, and the browser discovers it through the import graph.

---

**CS lens — module scope isolation:**

Open browser developer tools. In the console, try:

```javascript
functionalRequirements
```

You will get `ReferenceError: functionalRequirements is not defined`. Even though the page loaded `requirements-data.js`, the variable is not in the global scope — it is in the module's private scope. Module exports are only accessible through `import` statements, not through the global scope. This is the encapsulation working correctly.

Compare this to lesson 004's `browser-intro.js`, which used `const requirements = [...]` without module syntax. If you loaded that as a classic script (without `type="module"`), `requirements` would be in the global scope and accessible from the console.

---

**SE lens — import statements as dependency documentation:**

Every `import` statement in a codebase is a dependency declaration — a permanent, machine-readable record of what depends on what. When you want to understand where the requirements data is used, search the codebase for imports of `requirements-data.js`. Every file that imports it is a file that uses the data.

This is a form of documentation that cannot become stale. Unlike a comment that says "this function uses the requirements data," an `import` statement is mechanically checked by the JavaScript runtime — if `requirements-data.js` is renamed, every file that imports it reports an error.

The architectural constraint from lesson 001 — "labs are independent: one lab cannot import from another" — is enforced at this level. A linting rule can check that no file in the `labs/` directory imports from any other file in `labs/`. The import graph makes the architectural boundary visible and toolable.

---

### Verify it works

Open `index.html` in the browser. The page should behave identically to lesson 004 — click the button, see the requirements, click again to hide them.

If you see an error in the console mentioning CORS or "module scripts cannot use `file://`", you are loading the file directly from the file system. ES modules require a server even for local files. Two options:

Option 1 — use VS Code's Live Server extension. Install "Live Server" from the Extensions panel. Right-click `index.html` and select "Open with Live Server." It starts a local server and opens the page at `localhost:5500`.

Option 2 — use Node.js to start a simple server:

```bash
npx serve .
```

`npx` is a tool installed alongside npm. It runs a package without installing it globally — it downloads it temporarily, runs it, and discards it. `serve` is a package that starts a static file server in the current directory. `npx serve .` starts it in the current directory and shows you the local URL (usually `localhost:3000`).

`npx serve .` — first time: `npx` downloads the `serve` package and runs it. The `.` argument tells `serve` to serve files from the current directory.

---

**CS lens — why file:// breaks ES modules:**

ES modules were designed for web servers. The CORS (Cross-Origin Resource Sharing) policy that browsers enforce to prevent cross-origin requests also affects `file://` URLs, but inconsistently across browsers. The safest and most consistent approach is always to load modules through a server — either VS Code's Live Server or Node.js's `serve`.

This is a preview of why the dev server in lesson 007 exists: development through a local server (`localhost:5173`) is always more predictable than loading files directly from the file system.

---

## Connect the Pieces

You have split one 40-line file into two 25-line files that are easier to understand, easier to change, and better structured for the lessons ahead.

The connection to lesson 001: the architectural constraint "content is separate from labs: content modules do not import lab code" is the same pattern you just applied — data lives in one file, behaviour in another, the behaviour file imports data, data never imports behaviour.

The connection to lesson 007: Vite (the build tool) traverses the module graph you just created. It starts at the entry module, follows import statements, and bundles everything it finds into optimised output. The module graph is not just a browser concept — it is the input to the build tool.

The connection to lesson 022: the lab registry is a module. The shell imports the registry. Each lab module registers itself by importing the registry and calling a registration function. The module system is the mechanism that makes this work without any globals.

---

## What Breaks Without This

Without modules — loading files as classic scripts:

```html
<!-- Old approach — all classic scripts, shared global scope -->
<script src="utils.js"></script>
<script src="requirements-data.js"></script>
<script src="dom-interaction.js"></script>
```

Any `const requirements = [...]` in `requirements-data.js` would create a global named `requirements`. If `dom-interaction.js` also defines a global named `requirements` for any reason, the second silently overwrites the first. No error. You will only discover this when `requirements` is used and contains the wrong data.

The name collision problem scales badly. In a project with 50 scripts sharing a global scope, every name in every file is a potential collision with every name in every other file. This is why jQuery (`$`) and Lodash (`_`) used single-character globals — to minimise the collision surface. Minimising the public API surface is the right instinct; modules implement it correctly.

With modules, the error is immediate and clear:

```
SyntaxError: The requested module './requirements-data.js'
does not provide an export named 'requirements'
```

You know exactly what is wrong, exactly which file is wrong, and exactly what needs to change.

---

## Definition of Done

- [ ] `requirements-data.js` exists with named exports for `functionalRequirements`, `nonFunctionalRequirements`, and `architecturalConstraints`
- [ ] `dom-interaction.js` exists and imports from `requirements-data.js`
- [ ] `index.html` loads `dom-interaction.js` with `type="module"`
- [ ] Opening `index.html` through a server (not `file://`) shows the page and the button works correctly
- [ ] In browser developer tools console, `functionalRequirements` returns `ReferenceError` (module scope is private)
- [ ] You can explain what `export` and `import` do in one sentence each
- [ ] You can explain why `type="module"` is required on the `<script>` tag
- [ ] You can explain why `file://` causes problems with ES modules
- [ ] Git commit:
  ```
  git add requirements-data.js dom-interaction.js index.html
  git commit -m "Split browser-intro.js into data and interaction modules

  requirements-data.js owns the data with no DOM dependencies.
  dom-interaction.js owns the behaviour and imports the data it needs.
  Each file has one responsibility and one reason to change.
  This is the module system enforcing separation of concerns."
  ```
