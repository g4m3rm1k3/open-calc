# Calculator — Lesson 02 — Buttons and Types

## What You Will Build

The calculator grows a button grid: four rows of four buttons covering digits,
operators, equals, clear, decimal, and parentheses. Every button is rendered
by TypeScript from a data array — not written by hand in HTML. Open the page,
click any button, and the browser console logs its type (`DIGIT`, `OPERATOR`,
`EQUALS`) and value (`'7'`, `'+'`, `'='`). This is the first TypeScript file
in the project and the first demonstration of why a type system exists.

## What You Need to Know First

Lesson 01 — the HTML and CSS shell. The `.calculator` div built there is where
the button grid attaches. The CSS token system defined there is what the new
button styles extend.

This lesson also introduces the full development toolchain: **Node.js**, **npm**,
**TypeScript**, and **Vite**. None of these are assumed. Each is explained at the
moment it enters the project.

---

## Before First Code: What `type="module"` Means

Lesson 01 ended with this line in `index.html`:

```html
<script type="module" src="/src/main.ts"></script>
```

The `type="module"` attribute was not explained there. Before writing any
TypeScript, it needs to be.

A browser can load JavaScript in two modes.

The **old mode** — no `type` attribute, or `type="text/javascript"` — runs the
script in **global scope**. Every variable declared at the top level becomes a
global variable. Every script tag on the page shares the same namespace. Two
scripts that both declare `const result` will collide silently.

`type="module"` enables the **ECMAScript module system** (ES modules). In module
mode:

- Each file is its own isolated scope. Variables at the top level are private
  to that file.
- Code in one file uses code from another by explicitly **importing** it:
  `import { ButtonType } from './types.js'`
- Code in a file is available to other files only if explicitly **exported**:
  `export const ButtonType = ...`

The `import` and `export` keywords **do not work** without `type="module"`. Without
it, the browser treats `import` as a syntax error and the script silently fails to
load — the page appears but the TypeScript never runs. When a page loads but
nothing happens, the browser console (F12 → Console) is the first place to look.

**The `.js` extension in imports:**
TypeScript files are imported with a `.js` extension: `import { ButtonType } from
'./types.js'`. The file on disk is `types.ts` — the `.js` extension looks wrong
but is correct. TypeScript compiles to JavaScript. The import statement names the
compiled output. TypeScript (and Vite) know to resolve `.js` imports back to `.ts`
source files. Using `.ts` in the import would be rejected by certain tools.

---

## Step 1 — Project Setup

### The problem

TypeScript cannot run in a browser directly. The browser understands JavaScript.
Before writing a single TypeScript file, three things are needed:

1. A tool that compiles TypeScript to JavaScript (the TypeScript compiler, `tsc`)
2. A tool that serves the compiled project to the browser during development (Vite)
3. A way to install, track, and run those tools (npm)

### What Node.js and npm are

**Node.js** is a JavaScript runtime — a program that runs JavaScript outside of a
browser. It was released in 2009 and made JavaScript usable for servers, build
tools, and command-line programs. Node.js does not run the calculator (the
calculator runs in the browser). It is the platform on which the development
tools — TypeScript, Vite — run.

**npm** is the Node Package Manager, a command-line tool installed alongside
Node.js. It does three things:

1. **Downloads packages** from the npm registry (a public database of open-source
   JavaScript libraries) into a local directory called `node_modules/`
2. **Records what was downloaded** in `package.json` and `package-lock.json` so
   that anyone who checks out the project can reproduce the same setup exactly
3. **Runs scripts** defined in `package.json` — `npm run dev` starts the dev
   server, `npm run build` compiles for production

Verify Node.js and npm are installed:

```
node --version
npm --version
```

You will see version numbers like `v20.11.0` and `10.2.4`. If you see
`command not found`, install Node.js from nodejs.org — npm is included.

### Create `package.json`

`package.json` is the project manifest. It records the project's name, version,
and every package the project depends on. Every JavaScript project has one. It
lives at the project root.

Create `package.json`:

```json
{
  "name": "calculator",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev":   "vite",
    "build": "tsc && vite build",
    "test":  "vitest"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite":       "^5.0.0",
    "vitest":     "^1.0.0"
  }
}
```

**Walkthrough — every field:**

`"name": "calculator"` — the project's identifier. Used if this project were ever
published as a package. For a private project it is informational.

`"version": "0.1.0"` — follows **semantic versioning** (semver): **major.minor.patch**.
A patch release fixes bugs without changing behaviour. A minor release adds
features without breaking existing ones. A major release introduces breaking
changes. The format is universal — every package in the npm registry uses it.

`"type": "module"` — tells Node.js that `.js` files in this project use ES module
syntax (`import`/`export`). Without this, running `npm run dev` would fail with a
syntax error when Vite tries to parse ES module imports in `.js` files.

`"scripts"` — named shell commands that `npm run <name>` executes:
- `"dev": "vite"` — starts Vite's development server
- `"build": "tsc && vite build"` — first runs the TypeScript compiler to check
  types, then Vite bundles for production. The `&&` means: only run `vite build`
  if `tsc` succeeds. A type error aborts the build.
- `"test": "vitest"` — runs the test runner (used from lesson 04 onward)

`"devDependencies"` — packages needed to **develop** the project (compile, test,
serve) but not to **run** it in production. The compiled output delivered to users
does not include TypeScript or Vite — only the compiled JavaScript. Compare to
`"dependencies"`, which lists packages whose code is shipped with the application.
All three tools here belong in `devDependencies`.

`"^5.0.0"` — the **caret range** in semver. This means "any version ≥5.0.0 and
<6.0.0." The caret allows npm to install newer patch and minor versions, but not
a new major version, which may break the API. When you run `npm install`, npm
installs the newest version within this range.

### Install packages

Run:

```
npm install
```

**What `npm install` does:**

1. Reads `devDependencies` in `package.json`
2. Contacts the npm registry to find the newest version of each package within
   the caret range
3. Downloads those packages — and all their own dependencies — into `node_modules/`
4. Records the exact version of every installed package in `package-lock.json`

**What you will see:**

```
added 47 packages in 8s
```

The exact number and time vary. npm downloads Vite, TypeScript, Vitest, and their
transitive dependencies.

**`package-lock.json`:**
Created by `npm install`. It records the exact version of every package — not
`^5.0.0` but `5.0.3`. When another developer or a CI system runs `npm install` on
this project, `package-lock.json` ensures they get exactly the same versions.
Commit it to version control. Never edit it by hand.

**`node_modules/`:**
The directory where npm places downloaded package source code — often hundreds of
megabytes containing thousands of files. It must never be committed to version
control. It is not portable (some packages contain paths compiled for your specific
machine), it is enormous, and it can always be recreated exactly from `package.json`
by running `npm install`. A repository that commits `node_modules/` is unusable on
another machine.

### Add `.gitignore`

From lesson 01: `.gitignore` tells Git which files to never track. Create it now:

```
node_modules/
dist/
```

`node_modules/` — never committed, as explained above.

`dist/` — the compiled output of `npm run build`. Compiled output is reproducible
from source code and does not belong in version control.

After creating `.gitignore`, run `git status`. Notice `node_modules/` does not
appear in the untracked files list — Git is already ignoring it.

---

## Step 2 — TypeScript Configuration

### The problem

TypeScript is a **compiled language**. You write `.ts` files; a program called
`tsc` (the TypeScript compiler) translates them to `.js` files the browser can
run. `tsconfig.json` controls how that translation works: which JavaScript version
to target, how strict to be about types, where to write the output.

### What TypeScript is

JavaScript was designed in ten days in 1995. It was not intended for large
applications. As codebases grew to hundreds of thousands of lines, JavaScript's
dynamic type system — where any variable can hold any value and type errors only
appear at runtime — became a source of expensive, hard-to-find bugs.

TypeScript adds a **static type system** to JavaScript. You annotate variables and
function parameters with types. The TypeScript compiler checks those types before
the code runs. A type error is a **compile error** — reported in your editor, in
the terminal, before the browser ever executes the code.

The compiled output is standard JavaScript. The browser never sees TypeScript. It
sees only the compiled JavaScript. TypeScript is a development tool, not a runtime.

### Create `tsconfig.json`

```json
{
  "compilerOptions": {
    "target":             "ES2022",
    "module":             "ESNext",
    "moduleResolution":   "bundler",
    "strict":             true,
    "noUnusedLocals":     true,
    "noUnusedParameters": true,
    "outDir":             "dist"
  },
  "include": ["src"]
}
```

**Walkthrough — every field:**

`"target": "ES2022"` — the JavaScript version to compile to. `ES2022` uses modern
JavaScript features supported by all current browsers. Targeting an older version
(e.g., `ES5`) would produce less readable output with polyfills for features that
now exist natively. For a project not targeting browsers from 2015, `ES2022` is
correct.

`"module": "ESNext"` — the module format of the compiled output. `ESNext` means
ES module syntax (`import`/`export`). This matches `"type": "module"` in
`package.json`.

`"moduleResolution": "bundler"` — how TypeScript resolves import paths. `"bundler"`
mode is designed for projects using a tool like Vite that handles the final
resolution. It allows importing `.ts` files as `.js` without TypeScript complaining.
Without `"bundler"`, TypeScript would reject `import { ButtonType } from
'./types.js'` because `types.js` does not exist on disk at compile time.

`"strict": true` — enables a group of checks that together prevent the most common
class of type errors. The checks it enables include:
- `noImplicitAny` — every variable must have a known type. Without this,
  TypeScript silently assigns type `any` to untyped variables, making the type
  system useless.
- `strictNullChecks` — `null` and `undefined` are not valid values unless
  explicitly declared. Without this, `querySelector('.calculator')` returns
  `Element | null` but TypeScript lets you use it as `Element` — which throws a
  runtime error if the element is missing.
- `strictFunctionTypes` — function parameter types are checked precisely when
  functions are passed as arguments.

`"noUnusedLocals": true` and `"noUnusedParameters": true` — compile errors if a
local variable or function parameter is declared but never read. Unused identifiers
are almost always a mistake: a renamed variable, a forgotten delete, a copy-paste
error.

`"outDir": "dist"` — where compiled `.js` files are written when `tsc` runs. Vite
in dev mode does not write to `dist/` — it compiles in memory. `dist/` is
populated by `npm run build`.

`"include": ["src"]` — which directories the compiler processes. Only `src/`
contains TypeScript source files. Configuration files at the root (`package.json`,
`tsconfig.json`) are not TypeScript.

---

## Step 3 — What Vite Does

Before writing code, understand what `npm run dev` actually does.

### The development server

`npm run dev` executes the `"dev": "vite"` script in `package.json`. Vite starts
a **local web server** — a program that listens for HTTP requests and responds
with files.

When your browser requests `http://localhost:5173`:

1. The browser sends an HTTP GET request to port 5173 on your machine
2. Vite receives the request and serves `index.html`
3. The browser parses `index.html` and encounters `<script type="module"
   src="/src/main.ts">`
4. The browser sends another HTTP GET request — this time for `/src/main.ts`
5. Vite receives that request, compiles `src/main.ts` from TypeScript to
   JavaScript on demand, and sends the result to the browser
6. The browser runs the JavaScript. If `main.ts` imports `./buttons.js`, the
   browser requests that file. Vite compiles `buttons.ts` and sends it.

Vite compiles each file as the browser requests it — not all at once up front.
This is why dev servers start in milliseconds even in large projects.

**What `localhost` is:**
`localhost` is a network name that routes back to your own machine. Traffic to
`localhost` never leaves your computer. When Vite listens on `localhost:5173`,
only your machine can reach it.

**What a port is:**
A port is a number from 0 to 65535 that routes a network connection to a specific
program on a machine. Many programs run simultaneously; ports prevent them from
intercepting each other's traffic. Port 5173 is Vite's default. Port 443 is
HTTPS. Port 80 is HTTP. If another program is already using port 5173, Vite
picks a different port and tells you in the terminal.

**Hot module replacement (HMR):**
When you save a file, Vite detects the change, recompiles it, and pushes the
updated module to the browser — without a full page reload. The display keeps its
current value while the button styles update. This is one reason Vite is preferred
over simpler setups.

### Production

`npm run build` runs `tsc && vite build`. Vite reads every file starting from
`src/main.ts`, follows every import, bundles them into one or a few JavaScript
files, minifies them (shortening variable names, removing whitespace to reduce
file size), and writes the result to `dist/`. The `dist/` directory is what is
deployed to a web server. There is no Vite process running in production — only
static files.

---

## Step 4 — The ButtonType Enum

### The problem

The calculator has six kinds of buttons: digits, operators, equals, clear,
decimal, and parentheses. The input state machine in lesson 03 will behave
differently depending on which kind was pressed. Before writing the state
machine, we need a way to represent "kind of button" that the type system can
verify.

The naive answer is plain strings: `'digit'`, `'operator'`, `'equals'`. This
works until someone writes `'opertor'` — a typo that JavaScript accepts without
complaint and that silently breaks the state machine because no case matches it.
We will not accept silent bugs.

### The code

Create `src/types.ts`:

```typescript
export const ButtonType = {
  DIGIT:    'DIGIT',
  OPERATOR: 'OPERATOR',
  EQUALS:   'EQUALS',
  CLEAR:    'CLEAR',
  DECIMAL:  'DECIMAL',
  PAREN:    'PAREN',
} as const

export type ButtonType = typeof ButtonType[keyof typeof ButtonType]
```

**What `src/types.ts` is:**
`types.ts` is the project's central type registry. It owns shared type definitions
that multiple other files import. Types defined here — `ButtonType`, and later
`CalculatorState`, `HistoryEntry` — form the shared vocabulary of the application.
Without a central location, definitions would be duplicated across files and drift
apart.

### Walkthrough — `ButtonType`

**The object:**
`const ButtonType = { DIGIT: 'DIGIT', ... } as const` defines a plain JavaScript
object. Each key maps to a string value that matches the key name. This is
intentional — `ButtonType.DIGIT` evaluates to the string `'DIGIT'`, which is
readable in the console and in test output.

**`as const`:**
Without `as const`, TypeScript infers `ButtonType.DIGIT` as type `string` — a
wide type that accepts any string. With `as const`, TypeScript infers it as the
**literal type** `'DIGIT'` — a narrow type that accepts only exactly the string
`'DIGIT'`. This difference is what makes the type system catch typos.

`as const` also makes the object **deeply immutable** at the type level: every
property is `readonly`, so `ButtonType.DIGIT = 'something'` is a compile error.
The object is defined once and never modified.

**`typeof ButtonType[keyof typeof ButtonType]` — inside-out:**

This type expression is read in layers, from the inside out.

`typeof ButtonType` — the type of the `ButtonType` object. Because we used
`as const`, this is precisely:

```
{ readonly DIGIT: 'DIGIT', readonly OPERATOR: 'OPERATOR', readonly EQUALS: 'EQUALS',
  readonly CLEAR: 'CLEAR', readonly DECIMAL: 'DECIMAL', readonly PAREN: 'PAREN' }
```

`keyof typeof ButtonType` — the union of all keys of that type:

```
'DIGIT' | 'OPERATOR' | 'EQUALS' | 'CLEAR' | 'DECIMAL' | 'PAREN'
```

`typeof ButtonType[keyof typeof ButtonType]` — index the type with all its keys.
For each key, this retrieves the value type at that key. The result is the union
of all value types:

```
'DIGIT' | 'OPERATOR' | 'EQUALS' | 'CLEAR' | 'DECIMAL' | 'PAREN'
```

The exported `type ButtonType` is exactly this union. A function parameter typed
as `ButtonType` accepts any of these six strings and rejects everything else —
including `'OPERTOR'`.

Note that `ButtonType` is both a const object (for use as `ButtonType.DIGIT`) and
a type (for use in type annotations like `type: ButtonType`). TypeScript allows
the same name for both — they live in separate namespaces.

**CS lens — closed enumeration:**
A type system is useful when it expresses constraints. `string` is no constraint
— it accepts everything. `ButtonType` is a constraint that accepts exactly six
values. This is a **closed enumeration**: a finite set of named members. Most
languages have dedicated syntax (`enum` in Java, C#, Rust). TypeScript's `as const`
pattern achieves the same result using the type system's own machinery and produces
better JavaScript output than TypeScript's built-in `enum` keyword (which generates
extra runtime code).

**SE lens — single extension point:**
When lesson 09 adds a `FUNCTION` button type, there is exactly one place to make
the change: add `FUNCTION: 'FUNCTION'` to this object. Every file that uses
`ButtonType` automatically gains the ability to handle the new value. Any switch
statement that handles every `ButtonType` value and is missing the new case can be
flagged by TypeScript. The closed set is **open for extension** at one point; all
callers are **closed for modification**.

---

## Step 5 — Button Configuration

### The problem

The HTML for 19 buttons could be written by hand. But hand-written HTML for data
that TypeScript will read creates two sources of truth that can drift apart. If a
button's type changes, the HTML and TypeScript must both be updated in sync. The
solution is to define the button data once, in TypeScript, and generate the HTML
from it.

### The code

Create `src/buttons.ts`:

```typescript
import { ButtonType } from './types.js'

export interface ButtonConfig {
  label:     string
  type:      ButtonType
  value:     string
  cssClass?: string
}

export const BUTTON_GRID: ButtonConfig[] = [
  { label: 'C',  type: ButtonType.CLEAR,    value: 'clear'                      },
  { label: '(',  type: ButtonType.PAREN,    value: '('                          },
  { label: ')',  type: ButtonType.PAREN,    value: ')'                          },
  { label: '/',  type: ButtonType.OPERATOR, value: '/', cssClass: 'operator'    },
  { label: '7',  type: ButtonType.DIGIT,    value: '7'                          },
  { label: '8',  type: ButtonType.DIGIT,    value: '8'                          },
  { label: '9',  type: ButtonType.DIGIT,    value: '9'                          },
  { label: '*',  type: ButtonType.OPERATOR, value: '*', cssClass: 'operator'    },
  { label: '4',  type: ButtonType.DIGIT,    value: '4'                          },
  { label: '5',  type: ButtonType.DIGIT,    value: '5'                          },
  { label: '6',  type: ButtonType.DIGIT,    value: '6'                          },
  { label: '-',  type: ButtonType.OPERATOR, value: '-', cssClass: 'operator'    },
  { label: '1',  type: ButtonType.DIGIT,    value: '1'                          },
  { label: '2',  type: ButtonType.DIGIT,    value: '2'                          },
  { label: '3',  type: ButtonType.DIGIT,    value: '3'                          },
  { label: '+',  type: ButtonType.OPERATOR, value: '+', cssClass: 'operator'    },
  { label: '0',  type: ButtonType.DIGIT,    value: '0', cssClass: 'span-two'    },
  { label: '.',  type: ButtonType.DECIMAL,  value: '.'                          },
  { label: '=',  type: ButtonType.EQUALS,   value: '=', cssClass: 'equals'      },
]
```

**What `src/buttons.ts` is:**
`buttons.ts` owns the button configuration data. It knows what buttons exist and
what each one is. It does not know how they are rendered — that is `main.ts`'s job.
It does not know what buttons do when clicked — that is lesson 03's job. One file,
one responsibility.

### Walkthrough — imports, interfaces, and data

**The import:**
`import { ButtonType } from './types.js'` — `./` means "same directory as this
file." We import only `ButtonType` because that is the only thing from `types.ts`
that this file needs. Importing specifically, rather than importing the entire
module, makes the dependency explicit: a reader sees immediately that `buttons.ts`
depends on the button type definitions, nothing else.

**`interface ButtonConfig`:**
An **interface** in TypeScript is a named type definition for an object shape. It
says: any object that claims to be a `ButtonConfig` must have a `label` (string),
a `type` (`ButtonType`), and a `value` (string). TypeScript will report an error
if any required field is missing or has the wrong type.

`cssClass?` — the `?` before the colon marks a field as **optional**. An object is
a valid `ButtonConfig` whether or not it includes `cssClass`. When `cssClass` is
absent, its type is `string | undefined` — TypeScript requires you to handle the
`undefined` case before using the value.

Interfaces are erased during compilation and produce no runtime code. They exist
only for TypeScript's type checking.

**`export`:**
Both `ButtonConfig` and `BUTTON_GRID` are exported, making them available to files
that import from `buttons.ts`. Without `export`, they are private to this file.

**`ButtonConfig[]`:**
The `[]` suffix after a type means "array of this type." `ButtonConfig[]` is an
array where every element must satisfy the `ButtonConfig` interface. TypeScript
will report an error if any element is missing a required field.

**CS lens — data-driven UI:**
`BUTTON_GRID` is a data structure, not HTML. The rendering code reads this array
and generates HTML from it. This is the **data-driven UI** pattern: the UI is a
pure function of data. To add a button, add an entry to the array. To change a
label, change one field. The rendering code never changes. Every major UI framework
— React, Vue, Angular — is built on this principle: a component renders whatever
its data says to render.

**SE lens — interface as contract:**
`ButtonConfig` is a contract between the data definition in `buttons.ts` and the
rendering code in `main.ts`. If the interface changes — `label` is renamed
`displayText` — TypeScript reports errors in every file that uses the old name.
The contract enforces consistency and makes the change location obvious.

---

## Step 6 — Rendering Buttons

### The problem

`BUTTON_GRID` is an array in memory. The user sees HTML elements on screen.
Something must translate the array into DOM elements and attach them to the page.

### The code

Create `src/main.ts`:

```typescript
import { BUTTON_GRID } from './buttons.js'
import { ButtonType }  from './types.js'

function renderButtons(): void {
  const calculatorElement = document.querySelector<HTMLDivElement>('.calculator')
  if (calculatorElement === null) {
    throw new Error('Calculator element not found in DOM')
  }

  const buttonGrid = document.createElement('div')
  buttonGrid.className = 'button-grid'

  for (const buttonConfig of BUTTON_GRID) {
    const buttonElement = document.createElement('button')
    buttonElement.textContent = buttonConfig.label
    buttonElement.dataset['type']  = buttonConfig.type
    buttonElement.dataset['value'] = buttonConfig.value

    if (buttonConfig.cssClass !== undefined) {
      buttonElement.classList.add(buttonConfig.cssClass)
    }

    buttonElement.addEventListener('click', () => {
      console.log(`Button clicked — type: ${buttonConfig.type}, value: ${buttonConfig.value}`)
    })

    buttonGrid.appendChild(buttonElement)
  }

  calculatorElement.appendChild(buttonGrid)
}

renderButtons()
```

**What `src/main.ts` is:**
`main.ts` is the **entry point** — the first file Vite loads when the browser
requests the page. It is responsible for wiring the application together: reading
data, creating DOM elements, registering event handlers. It does not own button
data (`buttons.ts`) or type definitions (`types.ts`). It uses both.

### Walkthrough — execution of `renderButtons()`

When the browser runs `main.ts`, the call `renderButtons()` at the bottom of the
file executes immediately.

**Finding the calculator element:**
`document.querySelector<HTMLDivElement>('.calculator')` searches the DOM tree for
the first element matching the CSS selector `.calculator`. The DOM tree is the
browser's in-memory representation of `index.html` — every HTML tag is a node,
nested exactly as written in the file.

`querySelector` returns either the matching `HTMLDivElement` or `null` if no
element matches. `<HTMLDivElement>` is a **type parameter** — it tells TypeScript
what kind of element we expect, so the result has the correct type. TypeScript with
`strictNullChecks` knows the return can be `null` and will not let you call methods
on it without first checking.

`if (calculatorElement === null) { throw new Error(...) }` satisfies this
requirement and fails with a clear message if the HTML structure is ever broken.
A runtime error that says "Calculator element not found in DOM" is infinitely more
useful than a generic `TypeError: Cannot read properties of null` two lines later.

**Creating the grid container:**
`document.createElement('div')` creates a new `<div>` element in memory. It does
not yet exist in the visible page — it floats in memory until attached. Setting
`buttonGrid.className = 'button-grid'` assigns its CSS class.

**The loop:**
`for (const buttonConfig of BUTTON_GRID)` iterates over the array. The `for...of`
loop is the modern way to iterate over any collection. On each iteration,
`buttonConfig` is one `ButtonConfig` object. `const` prevents reassignment of
`buttonConfig` within the loop body — on the next iteration, `buttonConfig` refers
to a new element, not the same variable reassigned.

After the last element, the loop exits. The 19 button elements now exist in
`buttonGrid` but are not yet visible — `buttonGrid` is still disconnected from the
document.

**Creating each button:**
`document.createElement('button')` creates a `<button>` element in memory.

`buttonElement.textContent = buttonConfig.label` sets the button's visible text.

**Security — `textContent` vs `innerHTML`:**
`textContent` sets content as **plain text**. If `buttonConfig.label` were
`'<b>7</b>'`, the button would literally show the characters `<b>7</b>` — no bold,
no HTML interpretation.

`innerHTML` is different: it **parses the assigned string as HTML**. If user-
provided content is assigned to `innerHTML`, the browser executes any HTML or
`<script>` tags in it. This is a **Cross-Site Scripting (XSS)** vulnerability: an
attacker injects malicious code through an input field, the application renders it
via `innerHTML`, and the browser executes it — stealing session tokens, redirecting
the user, or defacing the page.

For this project, button labels come from `BUTTON_GRID` — hardcoded in our own
source code. XSS is not a risk here. But the habit of using `textContent` must be
established now. When lesson 03 renders user-typed characters to the display, the
safe API will already be in use. Use `innerHTML` only when assembling HTML from
fully controlled, trusted sources — and explain why every time.

**`dataset`:**
`buttonElement.dataset['type'] = buttonConfig.type` sets a **data attribute** on
the element. In the rendered HTML, this becomes `data-type="DIGIT"`. Data
attributes are custom attributes for embedding data in HTML elements. They can be
read by JavaScript (`element.dataset['type']`) and targeted by CSS attribute
selectors (`button[data-type='DIGIT'] { ... }`). Using data attributes keeps
button metadata visible in the DOM, where it can be inspected with browser dev
tools.

**Optional class:**
`if (buttonConfig.cssClass !== undefined)` — the `undefined` check is required
because `cssClass` is optional. Without the check, `buttonElement.classList.add(
buttonConfig.cssClass)` would receive `undefined` when `cssClass` is absent, and
TypeScript with `strictNullChecks` reports this as an error.

`classList` is a `DOMTokenList` — an object that manages an element's CSS classes
as a collection. `.add(className)` adds a class without disturbing others.

**Template literals:**
`` `Button clicked — type: ${buttonConfig.type}, value: ${buttonConfig.value}` ``
is a **template literal**. Backticks (`` ` ``) delimit it. `${expression}` embeds
the result of any expression into the string at that position. This is equivalent
to `'Button clicked — type: ' + buttonConfig.type + ', value: ' +
buttonConfig.value` but more readable, especially when embedding multiple values.
Template literals also preserve line breaks inside the backticks — useful for
multi-line strings.

**Arrow functions:**
`() => { console.log(...) }` is an **arrow function**. The `()` is the parameter
list — empty here because the click handler does not need the event object. The
`{ ... }` is the function body. Arrow functions are shorthand for anonymous
functions: `function() { console.log(...) }`. They are used when the function is
short, anonymous, and does not need its own `this` binding.

**The event loop:**
`addEventListener('click', handler)` registers `handler` to be called when a
click event fires on that element. JavaScript is **single-threaded** — only one
piece of code runs at a time. The browser's **event loop** runs continuously,
checking for events (clicks, keypresses, network responses). When the user clicks
a button, the loop finds the registered handler and calls it. Your code does not
run constantly — it runs only when an event triggers it. This is **event-driven
programming**: idle by default, reactive to events. The event loop is explored in
more depth in lesson 03 when keypresses are added.

**`appendChild`:**
`buttonGrid.appendChild(buttonElement)` inserts `buttonElement` as the last child
of `buttonGrid` in the DOM tree. After the loop, `buttonGrid` contains all 19
button elements. `calculatorElement.appendChild(buttonGrid)` then inserts the
entire grid into the visible `.calculator` element and triggers a single repaint.
The browser does not repaint for every individual `appendChild` call to a
disconnected element — only when the element joins the live document.

**`void` return type:**
`function renderButtons(): void` — `void` is a TypeScript type that means "this
function returns no value." It is the correct type for functions whose purpose is
to perform a side effect (modifying the DOM) rather than to compute and return a
value.

### Running the application for the first time

With `package.json`, `tsconfig.json`, `src/types.ts`, `src/buttons.ts`, and
`src/main.ts` written, run:

```
npm run dev
```

**What you will see in the terminal:**

```
  VITE v5.x.x  ready in 312 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Open `http://localhost:5173` in a browser. The calculator shell from lesson 01
appears, now with a grid of 19 buttons below the display.

Open the browser console with **F12**, then click **Console**. Click any button.
You will see:

```
Button clicked — type: DIGIT, value: 7
```

**Reading the console:**
The browser console shows: JavaScript errors (red), warnings (yellow), and
`console.log` output (grey/white). If the page is blank or buttons do not appear,
look here first. A red line includes the error type, message, file name, and line
number. The line number is a link — clicking it opens the source at that line.

---

## Step 7 — Button Styles

### The problem

The buttons render but without CSS they are browser defaults — grey, unstyled,
full-width. The calculator needs a four-column grid, coloured buttons by type,
and hover states.

### The code

Add to `src/style.css`, extending the `:root` block with new tokens and adding
new rules after the existing ones:

```css
:root {
  /* Add to existing root tokens */
  --colour-button-bg:      #1e293b;
  --colour-button-text:    #e2e8f0;
  --colour-button-hover:   #334155;
  --colour-operator-bg:    #1d4ed8;
  --colour-operator-hover: #2563eb;
  --colour-equals-bg:      #16a34a;
  --colour-equals-hover:   #15803d;
  --colour-clear-bg:       #dc2626;
  --colour-clear-hover:    #b91c1c;
  --size-button-height:    3.5rem;
  --gap-button-grid:       0.5rem;
}

/* ── Button grid ────────────────────────────────────────────────────────── */

.button-grid {
  display:               grid;
  grid-template-columns: repeat(4, 1fr);
  gap:                   var(--gap-button-grid);
  margin-top:            var(--space-md);
}

/* ── Buttons ────────────────────────────────────────────────────────────── */

button {
  background-color: var(--colour-button-bg);
  color:            var(--colour-button-text);
  border:           1px solid var(--colour-border);
  border-radius:    var(--radius-display);
  height:           var(--size-button-height);
  font-size:        1.1rem;
  font-family:      var(--font-display);
  cursor:           pointer;
  transition:       background-color 0.1s ease;
}

button:hover {
  background-color: var(--colour-button-hover);
}

button.operator {
  background-color: var(--colour-operator-bg);
}
button.operator:hover {
  background-color: var(--colour-operator-hover);
}

button.equals {
  background-color: var(--colour-equals-bg);
}
button.equals:hover {
  background-color: var(--colour-equals-hover);
}

button[data-type='CLEAR'] {
  background-color: var(--colour-clear-bg);
}
button[data-type='CLEAR']:hover {
  background-color: var(--colour-clear-hover);
}

button.span-two {
  grid-column: span 2;
}
```

Save. Vite detects the change and reloads the styles instantly — the buttons now
have colours and the grid layout is visible.

### Walkthrough — CSS grid

**`display: grid`:**
`display: grid` turns `.button-grid` into a **CSS Grid container**. Its direct
children — the button elements — become **grid items**. CSS Grid is a
two-dimensional layout system (rows and columns) designed for arranging elements
in a structured pattern. It replaced fragile techniques like CSS floats for this
kind of layout.

**`grid-template-columns: repeat(4, 1fr)`:**
Defines the column structure: four columns, each taking one fractional unit
(`1fr`) of available space. `repeat(4, 1fr)` is shorthand for `1fr 1fr 1fr 1fr`.
`1fr` means "one share of the remaining space after fixed widths are allocated."
With four equal shares, each column is 25% of the grid width. Grid places items
left-to-right, top-to-bottom, wrapping to the next row automatically after the
fourth column.

**`button.span-two { grid-column: span 2; }`:**
`grid-column: span 2` tells this grid item to occupy two columns instead of one.
The `0` button uses this class — it spans two columns to fill the space that two
single-column buttons would occupy.

**`button[data-type='CLEAR']`:**
An **attribute selector** targets HTML elements based on attribute values.
`button[data-type='CLEAR']` matches `<button data-type="CLEAR">` — the element
rendered for the C button, whose `data-type` attribute was set by
`buttonElement.dataset['type'] = buttonConfig.type`. This colours the Clear
button red without requiring an additional CSS class on the element.

**`transition: background-color 0.1s ease`:**
Animates the `background-color` property when it changes. `0.1s` is the duration
(100 milliseconds). `ease` is the timing function — the animation starts slightly
faster and slows to the final value. When the user hovers, the colour shifts
smoothly instead of snapping. Transitions are CSS-only; no JavaScript is involved.

---

## Connect the Pieces

```
src/types.ts    ButtonType — the shared vocabulary for button kinds; imports nothing
src/buttons.ts  BUTTON_GRID — configuration data; imports ButtonType
src/main.ts     renderButtons() — reads BUTTON_GRID, writes to the DOM
src/style.css   visual rules for .button-grid and button variants
```

The dependency direction flows one way: `main.ts` imports from `buttons.ts` and
`types.ts`. `buttons.ts` imports from `types.ts`. `types.ts` imports nothing. This
single-direction flow means changes cascade downward, never back up. Changing a
token name in `types.ts` does not know or care about `main.ts`.

In lesson 03, the input state machine imports `ButtonType` directly from `types.ts`.
It reads `buttonConfig.type` to decide what to do. It never reads from the DOM.
This separation is what makes the state machine unit-testable without a browser.

---

## What Breaks Without This

**Without `as const` on `ButtonType`:**
Remove `as const`. TypeScript infers `ButtonType.DIGIT` as type `string`. The
`ButtonConfig.type` field becomes `string`. TypeScript now accepts:

```typescript
{ label: '/', type: 'OPERTOR', value: '/' }
```

No error. The state machine in lesson 03 switches on `buttonConfig.type`, reaches
no matching case for `'OPERTOR'`, and silently ignores every operator button press.
No message, no stack trace, just broken behaviour.

With `as const`, that entry is a compile error: `Type '"OPERTOR"' is not assignable
to type 'ButtonType'`. The bug is found before the code runs.

**Without `strictNullChecks` (what happens without `strict: true`):**
`document.querySelector('.calculator')` can return `null`. Without strict null
checks, TypeScript lets you call `calculatorElement.appendChild(buttonGrid)`
without checking. Rename `.calculator` to `.calc` in `index.html` and the page
loads silently — then throws:

```
TypeError: Cannot read properties of null (reading 'appendChild')
    at renderButtons (main.ts:9:22)
```

With `strictNullChecks`, the null check is required at compile time. The code
cannot be written without handling the missing-element case.

**Without `node_modules/` in `.gitignore`:**
Run `git status`. The output lists thousands of untracked files — source code from
every installed package. Committing them would make the repository gigabytes in
size, take minutes to clone, and fail on other machines because some packages
contain absolute paths. The single `.gitignore` entry prevents this permanently.

---

## Definition of Done

- [ ] `npm install` completes without errors
- [ ] `npm run dev` shows the localhost URL in the terminal
- [ ] `localhost:5173` shows the calculator with a button grid
- [ ] Clicking any button logs its type and value to the browser console
- [ ] Changing `ButtonType.OPERTOR` (intentional typo) in `BUTTON_GRID` produces a
      TypeScript compile error (the editor shows a red underline)
- [ ] `npm run build` completes without errors
- [ ] No hardcoded colour values in the new CSS — all values use `var(--...)`
- [ ] `node_modules/` and `dist/` appear in `.gitignore` and not in `git status`
- [ ] You can explain what `type="module"` on a `<script>` tag enables and what
      breaks without it
- [ ] You can explain what `npm install` does, where the packages go, and why
      `node_modules/` is not committed
- [ ] You can explain the difference between `dependencies` and `devDependencies`
- [ ] You can explain what `package-lock.json` is and why it is committed
- [ ] You can explain what Vite does in development: compile on request, serve
      files, push changes via HMR
- [ ] You can explain what `localhost` is (loopback address, traffic stays on your
      machine) and what a port is (routes to a specific program)
- [ ] You can explain what `strict: true` in `tsconfig.json` enables — name the
      three checks: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`
- [ ] You can explain what `as const` does and what changes without it
- [ ] You can explain `typeof ButtonType[keyof typeof ButtonType]` in three layers
- [ ] You can explain why `textContent` is used instead of `innerHTML` and what
      XSS is
- [ ] You can explain what the browser event loop is and how `addEventListener`
      fits into it
- [ ] You can explain what `for...of` does
- [ ] You can explain what a template literal is (backticks, `${}` interpolation)
- [ ] Run:
      ```
      git add .gitignore package.json package-lock.json tsconfig.json src/types.ts src/buttons.ts src/main.ts src/style.css
      git commit -m "Introduce the development toolchain and button grid: TypeScript, Vite, and npm enter the project at the moment the first logic file is needed"
      ```

---

*Next: Lesson 03 — Input. The buttons stop logging to console and start updating
the display. The input state machine is introduced: the precise rules for what each
button does depending on the calculator's current state — and why those rules cannot
be expressed as a series of if-else checks.*
