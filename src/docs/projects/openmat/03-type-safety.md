# OpenMAT — Lesson 03 — Type Safety

## What You Will Build

The visible result of this lesson is the same page you had at the end of lesson
02 — the triangle and the working console. What this lesson adds is invisible
and more important: a build toolchain that compiles TypeScript, a `strict`
configuration that enforces type safety, and a demonstration of the compiler
catching a real bug before any code runs.

You will also write an enum — a closed set of named values enforced at compile
time — and see TypeScript reject a typo and a wrong type, both immediately in
your editor, before you press Reload.

---

## What You Need to Know First

Lessons 01 and 02 complete. You have `index.html`, `src/style.css`,
`src/main.ts`, and `src/console.ts`. From lesson 01 you know how to use Git
commits and commit messages. From lesson 02 you know type assertions (`as`),
the `!` non-null assertion, the module system (`export`), and the security
boundary between `textContent` and `innerHTML`.

These files reference TypeScript (`.ts`) but your browser cannot run TypeScript
directly — no browser can. This lesson sets up the build tool that compiles
TypeScript to JavaScript so the browser can run it.

---

## Concept: Compiled vs Interpreted Languages

A *compiled language* is translated from source code to a runnable form before
execution. The compiler reads the entire source, checks it for errors, and
produces output only if the source is valid. TypeScript is a compiled language:
`tsc` (the TypeScript compiler) reads `.ts` files and produces `.js` files. If
the TypeScript has type errors, no output is produced.

An *interpreted language* is translated and executed line by line at runtime.
JavaScript in the browser is interpreted: the browser reads each statement and
executes it immediately. There is no pre-execution check — errors only appear
when the specific statement with the error is reached.

```
Compiled (TypeScript):
  source.ts → [compiler checks types] → source.js → browser runs

Interpreted (JavaScript):
  source.js → browser reads line 1 and runs it
            → browser reads line 2 and runs it
            → browser reaches the broken line → error at runtime
```

The consequence: TypeScript can reject a bug on line 47 before line 1 has ever
run. JavaScript can only find it when line 47 executes — which might be under a
specific condition that rarely occurs, making it hard to detect and reproduce.

---

## Concept: Static vs Dynamic Type Systems

A *type* describes what kind of data a variable holds: a number, a string, an
array of tokens, a function that takes a string and returns nothing.

**Dynamic typing** (JavaScript, Python): types are checked at runtime. A
variable can hold any type at any time. The runtime discovers type mismatches
only when the mismatched operation actually executes.

```javascript
// JavaScript — no error until the code runs
let tokenCount = 5;
tokenCount = 'hello';       // silently allowed
tokenCount + 1;             // produces 'hello1', not 6
```

**Static typing** (TypeScript, Java, Rust): types are checked at compile time.
Every variable has a declared type; the compiler verifies every assignment and
call against those types before producing any output.

```typescript
// TypeScript — error at compile time
let tokenCount: number = 5;
tokenCount = 'hello';       // ❌ Type 'string' is not assignable to type 'number'
```

For a project like OpenMAT, static typing is essential. The interpreter has four
stages — lexer, parser, evaluator, environment — and data flows between them. A
type mismatch between the lexer's output and the parser's input would produce
silently wrong behaviour. TypeScript makes the data contracts between stages
explicit and machine-verified.

---

## Step 1 — Set Up the Build Toolchain

**The problem:** The browser cannot run `.ts` files. We need a tool that
compiles TypeScript to JavaScript and serves it. Vite is that tool.

**What Vite does.** Vite does two things. In development, it runs a local web
server and compiles TypeScript files on demand as the browser requests them — you
save a file, the browser updates instantly without a manual reload. For
production, it bundles all files into a single optimised output that loads faster
than individual requests. Without Vite (or a similar tool), you would have to run
the TypeScript compiler manually after every change and refresh the browser
yourself.

In your project folder, run:

```bash
npm create vite@latest . -- --template vanilla-ts
```

`npm` is the Node Package Manager — a command-line tool installed alongside
Node.js. `create` is a subcommand that runs a project-generation tool. `vite@latest`
means "use the latest version of Vite's generator." The `.` means "generate into
the current directory." `--` separates `npm create`'s own flags from the flags
being passed to Vite's generator. `--template vanilla-ts` tells Vite to generate
a plain TypeScript project (no framework). When prompted about overwriting files,
say yes — the Vite template creates a starter project, but we will replace it
with the files we built in lessons 01 and 02.

Now run:

```bash
npm install
```

**What `npm install` does — in full.**

`package.json` is the project's manifest: its name, version, and list of
dependencies. It is a contract — anyone who has this file can reproduce the
project's exact set of packages by running `npm install`. Open it and you will
see a `devDependencies` section listing Vite, TypeScript, and related tools.

When `npm install` runs, it reads `package.json`, downloads every listed package
from the npm registry, and places the downloaded files in `node_modules/`. That
directory contains hundreds of thousands of individual files — the full source
code of every package and every package those packages depend on (transitive
dependencies). `node_modules/` is never committed to Git. It can always be
regenerated by running `npm install` again.

`package-lock.json` records the exact version of every package installed,
including transitive dependencies. It is committed to Git. This ensures that
`npm install` on any machine — yours, a colleague's, a CI server — produces the
exact same result, byte for byte. Without `package-lock.json`, two developers
could run `npm install` and end up with different patch versions of the same
library, causing behaviour differences that are extremely difficult to diagnose.

**`dependencies` vs `devDependencies`.** Packages in `dependencies` are needed
to run the application in production — if this project were a server, those
packages would be deployed alongside it. Packages in `devDependencies` (Vite,
TypeScript, Vitest) are needed only during development: building, testing, and
type-checking. A production deployment typically installs only `dependencies`,
skipping `devDependencies` to reduce the deployed footprint.

**Semantic versioning.** Look at the version numbers in `package.json`. A version
like `^5.0.0` means "any version ≥5.0.0 and <6.0.0". The caret `^` allows npm
to install minor and patch updates (bug fixes and new features that do not break
existing APIs) but not major version changes (which may change the API in
breaking ways). `package-lock.json` records the specific version that was actually
installed. When you need to pin a version exactly — for example in a
security-sensitive environment — remove the caret: `"5.0.0"` installs exactly
that version and nothing else.

Now look at what Vite created:

```
openmat/
  index.html          ← replace with our lesson 01 version
  src/
    main.ts           ← replace with our lesson 01/02 version
    style.css         ← replace with our lesson 01/02 version
    vite-env.d.ts     ← leave this — Vite type declarations
    counter.ts        ← delete this — Vite demo code
  tsconfig.json       ← TypeScript configuration — examine this
  package.json        ← project metadata and scripts
  package-lock.json   ← exact versions of all installed packages
```

**`vite-env.d.ts`** is a declaration file — a TypeScript file that defines types
but contains no runtime code. Vite uses it to tell TypeScript about Vite-specific
global variables (like `import.meta.env`) that exist at runtime but are not part
of the standard TypeScript library. The `.d.ts` extension signals "declarations
only." Deleting it would cause TypeScript to report errors on any Vite-specific
APIs.

Delete the demo file:

```bash
rm src/counter.ts
```

`rm` is the Unix command to remove a file. `src/counter.ts` is the path. This
does not ask for confirmation — the file is gone. Because we have Git, that is
safe: the history preserves anything previously committed, and this file was never
committed by us.

Now restore the files you wrote in lessons 01 and 02:
- Replace `index.html` with the version from lesson 01
- Replace `src/main.ts` with the version from lesson 02 (canvas + console init)
- Replace `src/style.css` with the version from lesson 02 (all tokens included)
- Copy `src/console.ts` from lesson 02 into `src/console.ts`

**Set up `.gitignore`.**

Before running the dev server, tell Git to ignore the directories that should
never be committed. Create (or update) `.gitignore` at the root of your project
with these entries:

```
node_modules/
dist/
```

`node_modules/` must be ignored because it contains hundreds of thousands of
files generated by `npm install`. Committing it would bloat the repository
irreversibly and serve no purpose — anyone can regenerate it from `package.json`.

`dist/` is the output directory Vite writes to when you run `npm run build` for
production. It contains compiled, minified JavaScript. Like `node_modules/`, it
is generated and can always be regenerated — it does not belong in version
control.

These two entries are standard in every JavaScript and TypeScript project. A
missing `.gitignore` is one of the most common beginner mistakes — it leads to
either accidentally committing thousands of library files or having to rewrite
Git history to remove them.

Run the dev server:

```bash
npm run dev
```

`npm run` executes a script defined in `package.json`'s `"scripts"` section. The
`dev` script is Vite's development server command. When it runs, it starts a
local web server that listens for browser requests and compiles TypeScript on
demand.

**What the URL means.**

The terminal will show a URL such as `http://localhost:5173`. Both parts of that
address have precise meanings.

`localhost` is the loopback address — a special network address that routes back
to the same machine. Your browser and Vite are both running on your computer. No
network traffic leaves your machine. This is why you can develop without an
internet connection and why no one else can access your dev server at that address.

A port is a number that routes a network connection to a specific program on a
machine. Your operating system runs many programs simultaneously; ports let the OS
deliver each incoming network connection to the right one. Port 5173 is where
Vite listens. Port 443 is HTTPS. Port 80 is HTTP. Two programs cannot share a
port — if you try to start two Vite servers at the same time, the second one
fails immediately with "address already in use."

**What happens mechanically when you open `http://localhost:5173`.**

Your browser sends an HTTP request: `GET http://localhost:5173/`. Vite receives
it, reads `index.html`, and sends it back. The browser parses the HTML and finds
a `<script type="module" src="/src/main.ts">` tag. It sends a second request:
`GET http://localhost:5173/src/main.ts`. Vite receives that request, compiles
`main.ts` from TypeScript to JavaScript on demand, and returns the compiled
JavaScript in the HTTP response. The browser runs it. This happens for every
`.ts` file, on every save, without any manual step on your part.

In production there is no dev server. All files are pre-compiled to a `dist/`
folder by running `npm run build`, and a static file server like nginx serves
them. The compiled files are minified — variable names shortened to single
letters to reduce file size — and there is no on-demand compilation.

Open the URL in the terminal. The triangle and console should appear. TypeScript
is now compiling your `.ts` files to JavaScript automatically, and the browser
reloads on every save.

---

## Step 2 — Read the TypeScript Configuration

Open `tsconfig.json`. Vite generates a configuration that looks roughly like this:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true
  },
  "include": ["src"]
}
```

**`tsconfig.json`** is the TypeScript compiler's configuration file. It is JSON
and is read by `tsc` (the TypeScript compiler executable) and by Vite's
TypeScript integration every time a file is compiled. Every field you touch here
changes what the compiler will accept or reject.

**The important settings:**

`"strict": true` enables a group of TypeScript checks that together prevent the
most common category of type errors. This is not a single check — it is a
shorthand that activates several:
- `noImplicitAny` — every variable must have a known type; the compiler rejects
  any variable whose type cannot be inferred and is not explicitly declared
- `strictNullChecks` — `null` and `undefined` are not valid values for typed
  variables unless the type explicitly includes them; this prevents the most
  common class of runtime crash (`TypeError: Cannot read properties of null`)
- `strictFunctionTypes` — function parameter types are checked precisely,
  preventing subtle bugs where a callback accepts a narrower type than the caller
  provides

`"target": "ES2020"` tells the compiler which version of JavaScript to produce.
Modern browsers understand ES2020; the compiler translates TypeScript down to
that target, rewriting any newer syntax into equivalent older forms.

`"noEmit": true` means the compiler does not write output files. Vite handles
file output through its own pipeline. TypeScript's role here is type-checking
only — it finds errors but Vite does the actual compilation to JavaScript.

`"lib": ["ES2020", "DOM"]` tells the compiler which built-in types are available
in the runtime environment. `DOM` is why TypeScript knows what `document`,
`HTMLCanvasElement`, and `CanvasRenderingContext2D` are. Without `DOM` in this
list, every DOM operation we wrote in lessons 01 and 02 would be a type error —
TypeScript would not know those browser globals exist.

`"include": ["src"]` tells the compiler to type-check only files inside the
`src/` directory. Configuration files and test utilities outside `src/` are not
checked.

**SE lens — configuration as documentation.**

`tsconfig.json` documents the project's strictness decisions. A developer joining
the project sees immediately: strict mode is on, every variable must be typed,
null values must be handled explicitly. These are not guesses — they are stated
requirements that the compiler enforces on every file. Treat `tsconfig.json` as
part of the project's specification, the same way you treat `package.json`.

**Real-world connection.** `strict: true` is the same configuration used in
Microsoft's own TypeScript-heavy projects, in Angular (which requires TypeScript
and enforces strict mode by default), and in every large-scale TypeScript codebase.
Projects that start without strict mode and try to add it later typically discover
hundreds or thousands of pre-existing type errors. The cost of retrofitting strict
mode is so high that many teams never complete it. Starting strict is far cheaper
than adding it later.

---

## Concept: What `strictNullChecks` Catches

With `strictNullChecks` off, this code compiles:

```typescript
const element = document.getElementById('canvas');
element.width = 500;    // element could be null — crash at runtime if ID not found
```

With `strictNullChecks` on (which `strict: true` enables):

```typescript
const element = document.getElementById('canvas');
element.width = 500;    // ❌ Object is possibly 'null'
```

TypeScript knows `getElementById` returns `HTMLElement | null` — the element
might not exist. To proceed, you must handle the null case:

```typescript
// Option A: non-null assertion (use when you know the element always exists)
const element = document.getElementById('canvas')!;

// Option B: type guard (use when the element might genuinely not exist)
const element = document.getElementById('canvas');
if (element !== null) {
  element.width = 500;
}
```

In `src/main.ts` we use option A with `!` because the canvas element always
exists — it is in `index.html` which we control. A missing canvas is a bug in
our own HTML, not a runtime condition we need to handle gracefully. The `!` was
introduced in lesson 02; we are using it here in a new context: a type-checked
project where the compiler actively requires us to acknowledge the null
possibility before it will compile our code.

---

## Step 3 — See the Compiler at Work

**The problem:** We need to see TypeScript catch a real bug — not a
hypothetical one.

**Reading TypeScript compiler errors.** This is the first lesson where TypeScript
errors will appear deliberately in the editor. TypeScript errors show up in two
places: as red underlines in the editor immediately as you type, and in the
terminal where `npm run dev` is running. Both sources show the same error.

The error format looks like this:

```
src/main.ts:15:25 - error TS2322: Type 'string' is not assignable to type 'number'.
```

Reading each part:
- `src/main.ts` — the file where the error is
- `15` — the line number; go to this line in the editor
- `25` — the column number; the error starts at this character position on that line
- `TS2322` — the error code; you can look this up in the TypeScript documentation
  or search for it directly to find detailed explanations and examples
- `Type 'string' is not assignable to type 'number'` — the error message: what
  TypeScript found and what it expected

TypeScript tells you what it found (`'string'`), what it expected (`'number'`),
and where the mismatch is. It does not tell you what to fix — that requires
understanding why the types differ. The process: read the error, go to the line
it points to, understand what value you have and what type is expected, then fix
the mismatch. Do not disable TypeScript's checks to silence an error. Silencing
the check removes the protection — the bug still exists, TypeScript just stops
telling you about it.

Open `src/main.ts`. Find the line that sets the canvas drawing surface size:

```typescript
canvasElement.width  = canvasElement.clientWidth;
canvasElement.height = canvasElement.clientHeight;
```

Introduce a type error — change the first line to:

```typescript
canvasElement.width = canvasElement.clientWidth.toString();
```

**Immediately** — without saving, without reloading — your editor should show
a red underline under `canvasElement.width` with the message:

```
Type 'string' is not assignable to type 'number'.
```

`canvasElement.width` expects a `number`. `clientWidth.toString()` produces a
`string`. TypeScript refuses the assignment. The bug is caught before any code
runs.

Revert the change. The underline disappears.

**Why this matters:**

In plain JavaScript, `canvas.width = '500'` would sometimes silently coerce
the string to a number. The behaviour depends on the browser and context. In
some cases it would work; in others it would produce `NaN` for the width,
making every drawing coordinate wrong. You would see a blank canvas and have
no error pointing to the cause. TypeScript makes this impossible to ship.

---

## Concept: Enums as Contracts

**The problem:**

In lesson 04, the lexer will classify each character it reads into a category:
is this a number? an operator? an identifier? The natural approach is a string:

```typescript
const tokenType = 'Number';    // or 'Plus', or 'Identifier'
```

The problem:

```typescript
// In the lexer:
const token = { type: 'Numbr', value: 42 };   // typo — no error

// In the evaluator, checking for a number:
if (token.type === 'Number') {                 // never matches
  return token.value;
}
```

The typo produces no error. The evaluator silently skips every number token. You
see wrong results with no error message pointing to where the bug is.

**Enums solve this:**

An *enum* is a named, closed set of values. You declare every member once; the
compiler enforces that only declared members are used:

```typescript
enum TokenType {
  Number,
  Plus,
  Minus,
  Identifier,
  // ... all other token types
}
```

Add this to `src/main.ts` to experience the enforcement:

```typescript
enum Direction {
  North,
  South,
  East,
  West,
}

function describeDirection(direction: Direction): string {
  switch (direction) {
    case Direction.North: return 'heading north';
    case Direction.South: return 'heading south';
    case Direction.East:  return 'heading east';
    case Direction.West:  return 'heading west';
  }
}
```

Now try calling it with a wrong type:

```typescript
describeDirection('North');
// ❌ Argument of type 'string' is not assignable to parameter of type 'Direction'
```

Try a typo:

```typescript
describeDirection(Direction.Norht);
// ❌ Property 'Norht' does not exist on type 'typeof Direction'
```

Both errors appear in the editor before the code runs. With string-based token
types, both of these would compile silently and fail at runtime.

**CS lens — what an enum compiles to and what that means at runtime:**

TypeScript enums compile to JavaScript objects:

```javascript
// Compiled output:
var Direction;
(function (Direction) {
  Direction[Direction["North"] = 0] = "North";
  Direction[Direction["South"] = 1] = "South";
  Direction[Direction["East"]  = 2] = "East";
  Direction[Direction["West"]  = 3] = "West";
})(Direction || (Direction = {}));
```

`Direction.North` at runtime is the number `0`. `Direction.South` is `1`.
`Direction.East` is `2`. `Direction.West` is `3`. The compiled JavaScript uses
numbers — the enum members have no special runtime identity, they are just
integers.

TypeScript's type system prevents passing `0` directly where `Direction` is
expected. At compile time, `0` is type `number`, not type `Direction`. This means
the safety is entirely a TypeScript concept: the runtime JavaScript is just
numbers, but TypeScript treats `Direction` as a distinct type that cannot be
freely substituted with `number`. Writing `describeDirection(0)` is a compile
error even though `Direction.North` and `0` are the same value at runtime. The
protection exists only while TypeScript is checking — which is exactly when it is
most useful, before any code runs.

Remove the `Direction` enum and `describeDirection` function from `main.ts`
before proceeding — they were demonstration code.

**The connection to lesson 04:**

The lexer in lesson 04 will define a `TokenType` const object (a modern
alternative to enum that provides better TypeScript integration):

```typescript
const TokenType = {
  NUMBER:     'NUMBER',
  IDENTIFIER: 'IDENTIFIER',
  PLUS:       'PLUS',
  // ...
} as const;
```

The `as const` makes every value a literal type (the string `'NUMBER'` not just
`string`). This gives the same closed-set safety as an enum with better
TypeScript inference. Understanding enums now prepares you to recognise why the
TokenType is designed this way.

---

## Connect the Pieces

```
tsconfig.json       strict mode configuration — enforces type safety in every file
package.json        project manifest — lists dependencies, defines scripts
package-lock.json   exact installed versions — committed, ensures reproducibility
node_modules/       downloaded packages — not committed, regenerated by npm install
.gitignore          tells Git what not to track — node_modules/ and dist/
src/main.ts         typed — canvasElement, drawingContext, triangle coordinates
src/console.ts      typed — onSubmit callback, HTMLInputElement cast
```

From this point, every new file in the project is TypeScript with strict mode
enforced. The lexer, parser, evaluator, and environment will all be typed.
TypeScript will catch mismatches between their interfaces — for example, if the
evaluator expects a node with a `lineNumber` field and the parser produces nodes
without one, TypeScript reports it immediately.

---

## What Breaks Without This

Disable strict mode by removing `"strict": true` from `tsconfig.json`. Now:

```typescript
const element = document.getElementById('nonexistent');
element.style.color = 'red';   // TypeScript allows this — but element is null
```

Without `strictNullChecks`, TypeScript does not flag the null access. In a
browser, this crashes with `TypeError: Cannot set properties of null`. With
strict mode on, the error is caught at compile time — before the browser ever
runs the code. Add `"strict": true` back before continuing.

---

## Definition of Done

- [ ] `npm run dev` starts successfully and the triangle + console appear at the local URL
- [ ] `tsconfig.json` has `"strict": true`
- [ ] Changing `canvasElement.width` to accept a string produces an immediate editor error
- [ ] You can write a `Direction` enum, call `describeDirection` with a string, and see the compile error
- [ ] You can explain the difference between static and dynamic type checking with a concrete example
- [ ] You can explain what `"strict": true` enables and name two of the checks it activates
- [ ] You can explain why enums are safer than string literals for category labels
- [ ] You can explain what `as const` does and why `TokenType` will use it in lesson 04
- [ ] You can explain what `localhost` and port 5173 mean and why no traffic leaves your machine
- [ ] You can explain what `package.json`, `package-lock.json`, and `node_modules/` each are and why only two of the three are committed to Git
- [ ] You can explain the difference between `dependencies` and `devDependencies` and give an example of a package that belongs in each
- [ ] You can read a TypeScript error message and identify the file, line number, column, error code, and the type mismatch it describes
- [ ] `git add tsconfig.json package.json package-lock.json .gitignore` then `git commit -m "Add TypeScript build toolchain: strict mode enabled, Vite dev server running, compiler catches type errors before any code runs"`

---

*Next: Lesson 04 — The Lexer. The first stage of the interpreter reads source
code character by character and produces a list of tokens. This is where the
`TokenType` enum is defined and where TDD (test-driven development) begins.*
