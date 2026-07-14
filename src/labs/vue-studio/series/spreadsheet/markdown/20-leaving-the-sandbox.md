# Vue Spreadsheet — Lesson 20 — Leaving the Sandbox

## What you will build

The exact project you have been building since Lesson 01 — grid, formulas, formatting, keyboard navigation, plugins, virtualization, multiple sheets — running as a real local project on your own machine: started with one terminal command, tracked in a real `git` history with real commits, tested with real Vitest instead of Lesson 14's hand-built harness, and deployed to a real, public URL anyone can open in a browser. Nothing about what the *spreadsheet does* changes in this lesson — one internal reorganization happens along the way (Part 7 moves the formula engine into its own file, because a real test runner needs a real module to import, which `<script setup>` alone can never provide), but every feature, every pixel, every keystroke behaves exactly as it did in Vue Studio. Everything about *how it runs* is what changes.

---

## What you need to know first

The whole project, conceptually — every lesson from 01 through 19. Nothing about a terminal, `npm`, `git`, or a real build tool has been taught anywhere in this series, on purpose: Lesson 01 said, on its very first page, that Vue Studio does all of that invisibly "so this lesson can focus on one thing at a time," and promised it would be "deferred until there is a reason to open it up." This lesson is that reason. Every term below is genuinely new — this is this series' last, and largest, batch of true first appearances.

---

## Concept: what Vue Studio has been secretly doing for nineteen lessons

Every time you clicked ▶ Run, Vue Studio's sandbox (Lesson 01) did, invisibly, in order: read your `.vue` files, ran the TypeScript compiler, ran Vue's template compiler, resolved every `import` between your files, and handed the browser plain, ready-to-run JavaScript. A real project needs every one of those same steps to happen too — nothing about *why* they're needed has changed. What changes is *who* does them: instead of a sandbox running invisibly in an iframe, a collection of real, separately-installed programs on your own machine now does this work, and this lesson's job is naming every one of them, the same way this series has named everything else since Lesson 01.

---

## Part 1 — The terminal, a program for talking to your computer in text

A **terminal** (also called a **shell**) is a program that accepts typed text commands and runs them, showing you text output — the same fundamental idea as a browser's address bar, but for your operating system instead of the web. Every command has the same basic shape: a **program name**, optionally followed by **arguments** (extra words telling the program what to act on) and **flags** (words usually starting with `-` or `--`, turning on optional behavior). `ls -la` — a real command shown below — is the program `ls`, with the flag `-la` (`-l`, list in long detail, and `-a`, include hidden files, combined into one flag).

A handful of commands are universal enough to know before anything else:

- **`pwd`** ("print working directory") — shows which folder the terminal is currently "in."
- **`ls`** (macOS/Linux) or **`dir`** (Windows) — lists the files and folders in the current directory.
- **`cd <folder-name>`** ("change directory") — moves into a folder. `cd ..` moves up one level, to the folder containing the current one.
- **`mkdir <name>`** ("make directory") — creates a new, empty folder.

Every command this lesson introduces from here on follows this exact shape — a program, arguments, flags — and every one will be explained the same way: what program, what it does, what success and failure look like.

---

## Part 2 — Node.js, npm, and npx: JavaScript outside a browser, and the tools that manage it

Every line of JavaScript and TypeScript in this entire series has run inside a browser — Vue Studio's sandbox is, itself, a browser tab. **Node.js** is a program that runs JavaScript *outside* a browser, directly on your computer, with no page, no DOM, no `document`. It exists because build tools, test runners, and package managers — everything this lesson is about to install — are themselves written in JavaScript, and need somewhere to run that isn't a webpage. Installing Node.js (from nodejs.org, a one-time setup step this lesson assumes is already done) is what makes every command below possible at all.

**npm** ("Node Package Manager") installs and manages **packages** — reusable code other people have published, that your project depends on. It is installed automatically alongside Node.js. **`npx`** runs a package's command-line tool *without* permanently installing it into your project first — used below to scaffold a brand-new project, a one-time action that doesn't need to stick around afterward.

---

## Part 3 — Scaffolding a real project

Open a terminal, navigate (`cd`) to wherever you want this project to live, and run:

```
npx create-vite@latest vue-spreadsheet --template vue-ts
```

**What this command does, piece by piece:** `npx` runs `create-vite` (a real, official Vite scaffolding tool) without installing it permanently. `@latest` requests its newest published version. `vue-spreadsheet` is the name of the new folder it will create. `--template vue-ts` tells it which starting template to use — Vue plus TypeScript, matching everything this series has written since Lesson 01's `lang="ts"`.

**What successful output looks like:** a new folder, `vue-spreadsheet/`, containing several files and folders. `cd vue-spreadsheet` to move into it, then `ls` to see what was generated:

- **`src/`** — where your actual application code lives. `App.vue` and `main.ts` already exist here, generated by the template — you will replace them with this project's own.
- **`index.html`** — the one real HTML file the browser actually loads; it contains a `<script type="module" src="/src/main.ts">`, the entry point into everything else.
- **`package.json`** — this project's manifest: its name, its **dependencies** (packages needed to *run* the finished app — here, `vue` itself) and **devDependencies** (packages needed only to *build and test* it, never shipped to a user — here, the TypeScript compiler, Vite itself). A version like `"vue": "^3.4.0"` uses **semantic versioning (semver)**: `^` permits automatic updates to any version `≥3.4.0` and `<4.0.0` (new features and fixes, never a breaking major version change) the next time packages are installed.
- **`vite.config.ts`** — configures **Vite**, the real build tool standing in for everything Vue Studio's sandbox did invisibly: in development, it runs a local web server and compiles files on demand as the browser requests them; for production, it bundles everything into optimized, minified output.
- **`tsconfig.json`** — configures the TypeScript compiler: which language features to allow, how strict its checks are (`"strict": true` — the same bundle of checks named in this project's very first `lang="ts"` explanation, now controlled by a real file instead of assumed).

---

## Part 4 — Moving this project's real code in, and `npm install`

Copy this project's actual files — `App.vue`, every file under `src/components/`, `src/composables/`, `src/plugins/` — into the new project's `src/` folder, replacing the generated placeholders. Then run:

```
npm install
```

**What this does:** reads every dependency listed in `package.json` (and any new ones your copied code needs — this project only ever imported from `'vue'` itself, so nothing new is required here), downloads each one, and places it inside a new folder, **`node_modules/`**. `node_modules/` is never committed to version control (Part 6 explains why) — it is entirely reproducible by running `npm install` again from `package.json` alone. A second new file, **`package-lock.json`**, is also created: it records the *exact* version of every package actually installed (not just the `^3.4.0`-style range from `package.json`), so that anyone else running `npm install` against the same lock file gets byte-for-byte identical versions — `package-lock.json` **is** committed, specifically so a project behaves identically on every machine that clones it.

---

## Part 5 — `npm run dev`, and what a real dev server actually is

```
npm run dev
```

**What this does:** runs the `"dev"` script defined in `package.json` (generated by the template), which starts Vite's development server. Terminal output shows something like `Local: http://localhost:5173/`. Open that address in a browser: the real spreadsheet, running for the first time entirely outside Vue Studio.

**`localhost` and ports, defined precisely:** `localhost` is the **loopback address** — a network address that always routes back to the same machine it was requested from. Your computer is simultaneously the client (the browser tab) and the server (Vite) — no network traffic ever leaves your machine. `5173` is a **port**: a number that routes an incoming connection to one specific program. Only one program can listen on a given port at a time; running a second dev server while the first is still active fails with an "address already in use" error, or Vite silently picks the next free port instead.

**What's different from clicking ▶ Run, now that the mystery is gone:** Vite watches your files and recompiles automatically the instant you save one — this is **Hot Module Replacement (HMR)**, updating the running app in the browser without a full page reload, preserving state like `selectedCoordinate` mid-edit. Vue Studio's ▶ Run button was a manual trigger for the same underlying compile step Vite now performs continuously and automatically.

---

## Part 6 — Real `git`, and the commit message format this project has been implicitly practicing since Lesson 01

Lesson 01 named **Definition of Done** as real Scrum vocabulary this project had already been using structurally. **Version control** is the same idea, one level earlier: Git records a history of every change made to a project, lets you return to any previous state, and — for anyone working alone, exactly this series' target learner — is how you recover from mistakes and understand your own history months later, not just a tool for teams.

```
git init
```

**What this does:** turns the current folder into a real Git repository — creates a hidden `.git/` folder that will hold this project's entire history from this point forward.

**The three states of a file, precisely:** **modified** — you've changed a file, but Git hasn't been told about it yet. **staged** — you've told Git "include this specific change in the next snapshot" (`git add`). **committed** — the change is permanently recorded in the project's history (`git commit`).

Before the first commit, create a `.gitignore` file containing:

```
node_modules/
dist/
```

**Why:** `node_modules/` is fully reproducible from `package.json` via `npm install` (Part 4) — committing it would add hundreds of thousands of files to the repository's history for no benefit. `dist/` is Part 8's build output, equally reproducible from source, equally excluded.

```
git add .
git commit -m "Initial commit: spreadsheet project migrated from Vue Studio"
```

**What `git add .` does:** stages every modified and new file in the current folder (`.`) for the next commit — everything except what `.gitignore` excludes. **What `git commit -m "..."` does:** permanently records everything staged as one snapshot, with the given message.

**A commit message communicates *why*, not *what* — this project's convention from this point forward.** Git already knows, automatically, exactly which files changed and exactly what changed inside them — repeating that in the message adds nothing. `"Added a function"` describes what git already knows. `"Add circular reference detection so a self-referencing formula shows #CIRCULAR instead of crashing the tab"` (Lesson 10's own actual change, described this way) explains a reason a future reader — very often your own future self — cannot recover from the diff alone.

---

## Part 7 — Real Vitest, replacing Lesson 14's hand-built harness

Lesson 14 built `test`/`expectEqual` by hand, specifically because Vue Studio's sandbox has no real test runner installed. That constraint is gone.

```
npm install -D vitest
```

**What this does:** installs Vitest as a **devDependency** (`-D`) — needed to run tests during development, never shipped to a user, the exact `dependencies` vs. `devDependencies` distinction Part 3 named. Add a script to `package.json`'s `"scripts"` section: `"test": "vitest"`.

**The problem a real test runner surfaces immediately: `tokenize`, `parse`, `evaluate`, `columnLetter`, `cellId`, and `formatNumber` cannot actually be imported from `App.vue` — not in Vite, not anywhere.** Every one of them is declared inside `<script setup>`, and `<script setup>` compiles into a component's internal `setup()` function body — nothing declared there is reachable from outside the component, in a real build any more than in the sandbox. This is not the same problem Lesson 12 fixed (a `<script setup>` block cannot contain an `export` statement at all); it's a level deeper: even the *dual plain-`<script>`-plus-`<script setup>`* pattern Lesson 12 used doesn't help here, because that plain `<script>` block's own top-level code runs *before* `setup()` is ever called and has no way to reach inside it — a plain `<script>` block can export something *it* declares, never something only `<script setup>` declares.

**The fix: give the formula engine its own file, for real this time.** This project has already done exactly this three times — `spreadsheet-context.ts` (Lesson 12), `rendererPlugins.ts` (Lesson 16), `trie.ts` (Lesson 18) — each time because the thing being extracted was genuinely independent of any one component. `tokenize`, `parse`, `evaluate`, `columnLetter`, `cellId`, and `formatNumber` (plus every type and helper they depend on: `Token`, every `ExpressionNode` variant, `ParseResult`, `EvalResult`, `BUILT_IN_FUNCTIONS`, `assertNever`, `applyOperator`, `isDigit`, `isUppercaseLetter`) have never once touched `ref`, `computed`, or anything Vue-specific — they are, and always were, plain functions. Real testing is what finally makes moving them mandatory rather than optional: a real test runner imports real modules, and a component's internals were never a real module to begin with.

Create `src/formula.ts`, moving these declarations out of `App.vue`'s `<script setup>` verbatim, `export`ing each one, and importing `Coordinate`, `CellId`, `Cell` from `./spreadsheet-context.ts` (the same three domain types `App.vue` itself already imports from there):

```typescript
import type { Coordinate, CellId, Cell } from './spreadsheet-context.ts'

export type Token =
  | { type: 'number';     value: number }
  | { type: 'cell';       name: string  }
  | { type: 'identifier'; name: string  }
  | { type: 'operator';   value: '+' | '-' | '*' | '/' }
  | { type: 'paren';      value: '(' | ')' }
  | { type: 'comma' }
  | { type: 'bang' }

export interface NumberNode { kind: 'Number'; value: number }
export interface UnaryExpressionNode { kind: 'UnaryExpression'; operator: '-'; operand: ExpressionNode }
export interface BinaryExpressionNode {
  kind: 'BinaryExpression'
  operator: '+' | '-' | '*' | '/'
  left: ExpressionNode
  right: ExpressionNode
}
export interface CellReferenceNode { kind: 'CellReference'; name: string; sheetId?: string }
export interface FunctionCallNode { kind: 'FunctionCall'; name: string; args: ExpressionNode[] }

export type ExpressionNode =
  | NumberNode
  | UnaryExpressionNode
  | BinaryExpressionNode
  | CellReferenceNode
  | FunctionCallNode

export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`)
}

export function columnLetter(col: number): string {
  return String.fromCharCode(65 + col)
}

export function cellId(coordinate: Coordinate): CellId {
  return `${columnLetter(coordinate.col)}${coordinate.row + 1}`
}

function isDigit(c: string): boolean { return c >= '0' && c <= '9' }
function isUppercaseLetter(c: string): boolean { return c >= 'A' && c <= 'Z' }

export function tokenize(expr: string): Token[] {
  // ...unchanged from Lesson 06 through Lesson 19 — moved, not rewritten
}

export interface ParseError { message: string }
export type ParseResult =
  | { success: true;  ast: ExpressionNode }
  | { success: false; error: ParseError }

export function parse(tokens: Token[]): ParseResult {
  // ...unchanged from Lesson 07 through Lesson 19 — moved, not rewritten
}

export type EvalResult =
  | { kind: 'ok';       value: number }
  | { kind: 'circular'; chain: string[] }
  | { kind: 'error';    message: string }

function applyOperator(operator: '+' | '-' | '*' | '/', left: number, right: number): number {
  // ...unchanged from Lesson 07
}

export type BuiltInFunction = (args: number[]) => number
export const BUILT_IN_FUNCTIONS: Readonly<Record<string, BuiltInFunction>> = {
  // ...unchanged from Lesson 18
}

export function evaluate(
  node: ExpressionNode,
  lookupCell: (name: string, sheetId?: string) => EvalResult
): EvalResult {
  // ...unchanged from Lesson 07 through Lesson 19
}

export function formatNumber(value: number, format: 'plain' | 'currency' | 'percentage'): string {
  // ...unchanged from Lesson 13
}
```

**Delete every one of these from `App.vue`'s `<script setup>` — don't just add the import.** `App.vue`'s `<script setup>` now starts with `import { tokenize, parse, evaluate, columnLetter, cellId, formatNumber, assertNever, type Token, type ExpressionNode, type EvalResult, type ParseResult } from './formula.ts'` in place of *every* function body and type this section moved — `Token` through `formatNumber`, all of it, including `formatNumber` itself, which sits physically far from the rest of the engine (down near `cellStyles`, from Lesson 13) and is easy to miss in a find-and-delete pass focused on the tokenizer/parser/evaluator block. Leaving an original declaration in place while also importing the same name doesn't fail loudly the way you'd expect: `<script setup>`'s contents compile into a nested function scope *inside* the component, one level below the module-level `import` statements, so a local `function formatNumber(...)` doesn't collide with the import at all — it silently **shadows** it, and every call inside `App.vue` keeps hitting the old, now-dead local copy while `formula.ts`'s real export sits unused. The app still looks and behaves correctly either way, since both copies do the same thing, which is exactly what makes this mistake easy to ship unnoticed: nothing breaks, nothing warns you, and you're left with two copies of the same function, one of them permanently dead.

**Walkthrough — what stays in `App.vue`:** `parseRawInput`, `displayCell`, `debugInfo`, and every `lookupCell` closure stay in `App.vue` — they all touch `cells`/`sheets`, real reactive state, and are not independently testable the way the engine above is. This is a real, visible payoff of Lesson 09's dependency-injection design and this project's whole "pure functions first" discipline since Lesson 01: the exact functions built to be easy to test in isolation turn out to be the exact functions that can leave the component file cleanly, because neither ever depended on anything Vue-specific to begin with.

Update `src/formula.test.ts`, importing from the new file instead of `App.vue`:

```typescript
import { describe, it, expect } from 'vitest'
import { tokenize, parse, evaluate, columnLetter, cellId, formatNumber } from './formula.ts'

describe('columnLetter', () => {
  it('returns A for column 0', () => {
    expect(columnLetter(0)).toBe('A')
  })
  it('returns Z at the alphabet boundary', () => {
    expect(columnLetter(25)).toBe('Z')
  })
})

describe('tokenize', () => {
  it('keeps multi-digit numbers as one token', () => {
    expect(tokenize('52')).toEqual([{ type: 'number', value: 52 }])
  })
})
```

```
npm run test
```

**What changed, and — just as important — what didn't:** `describe` groups related tests; `it` is Vitest's name for Lesson 14's `test`; `expect(x).toBe(y)` and `expect(x).toEqual(y)` are Vitest's real assertions — `.toBe` for primitives (compared with `===`), `.toEqual` for objects and arrays (compared structurally, exactly what Lesson 14's hand-built `expectEqual` did with `JSON.stringify`, now provided for you). The tests' actual *content* — which functions to call, with which inputs, expecting which outputs — is identical to Lesson 14's, because the practice of testing was never the part Vue Studio's sandbox was standing in for; only the runner was.

---

## Part 8 — Building and deploying

```
npm run build
```

**What this does:** runs Vite's production build — compiles and bundles every file into `dist/`, a small number of highly optimized files. **What's different from `npm run dev`'s output, precisely:** production code is **minified** (variable and function names shortened, whitespace removed, to reduce file size — this is why a production error's stack trace can look unreadable without a **source map**, a separate file mapping minified code back to your original source, which Vite generates automatically). There is no dev server watching for changes in this mode — `dist/` is meant to be handed to a real web server as static files.

Deploying means putting `dist/`'s contents somewhere publicly reachable. Real, free options for a static Vue project like this one include Vercel, Netlify, and GitHub Pages — each accepts a `git` repository (Part 6's history) and rebuilds `dist/` automatically on every push. The mechanism is the same regardless of which you choose: your `git` history is the source of truth; the hosting service runs `npm install && npm run build` on its own servers and serves the resulting `dist/` folder to the world.

---

## Part 9 — Real Agile/Scrum vocabulary, named directly, for a team you'll eventually join

This series has named real Agile terms as they became structurally relevant — Definition of Done (Lesson 01), vertical slice (Lesson 01), YAGNI (Lesson 08), refactor (Lesson 12), technical debt (Lesson 05), "the simplest thing that could possibly work" (Lesson 11) — each one because this project's own structure already used the idea. A few more exist specifically as team-coordination vocabulary a solo learner has no natural occasion to meet, and belong here, at the point this project stops being solo-only and starts resembling how it would actually ship at a company:

- **Sprint** — a fixed, short time period (commonly two weeks) a team commits to completing an agreed set of work within, then reviews and repeats. Each lesson in this series is roughly sprint-sized: one clear vertical slice, with its own Definition of Done.
- **Backlog** — the full list of work not yet started, prioritized, and re-prioritized continuously. This series' own "What's next" pointers, and the roadmap that chose testing and accessibility over "named ranges" earlier in this project's real history, are exactly backlog prioritization in miniature.
- **Standup** — a short, daily, synchronous check-in: what did I finish, what am I doing next, what's blocking me. Not a status report to a manager — a coordination signal to the rest of the team.
- **Story points** — a relative, not absolute, estimate of how much effort a piece of work takes, used to plan how much a team can realistically commit to in one sprint.
- **Retrospective** — after a sprint ends, the team reflects deliberately on what worked and what didn't, and changes something concrete for the next one. This lesson series' own history has one: the "getting small" correction partway through this project's real development is exactly a retrospective finding, acted on immediately rather than filed away.

None of these require new code. They are the vocabulary for the coordination problem that appears the moment more than one person works on a codebase at once — a problem this series, being built by one learner, has never needed to solve until the exact moment this lesson has you push to a shared `git` history a teammate could also push to.

---

## What breaks without this

**Committing `node_modules/`:**

The repository balloons to hundreds of thousands of tracked files, `git` operations slow down noticeably, and cloning the project takes drastically longer for no benefit — everything in `node_modules/` is exactly reproducible from `package.json` in seconds.

**Skipping `package-lock.json`, or excluding it from git:**

Two developers running `npm install` against only `package.json`'s `^3.4.0`-style ranges can silently end up with different exact versions of a dependency — a bug that reproduces on one machine and not another, with no obvious cause, because the two machines are quietly running different code.

**A commit message that restates the diff instead of the reason:**

`git log` six months from now shows forty commits all named some variant of `"update App.vue"` — technically true, entirely useless for understanding why any specific one happened, forcing a future reader (often you) to re-read the actual diff every time, exactly the cost a good commit message exists to avoid paying repeatedly.

**Deploying `src/` directly instead of `dist/`:**

`src/` contains raw, unbundled `.vue` and `.ts` files — no browser can run them directly; they require the exact compilation step `npm run build` performs. A server pointed at `src/` instead of `dist/` serves files the browser cannot execute at all.

**Writing `formula.test.ts` to import from `'./App.vue'` instead of the new `'./formula.ts'`:**

This is not a sandbox-only limitation that quietly stops mattering in a real project — it fails exactly the same way in real Vite. `tokenize`, `parse`, `evaluate`, `columnLetter`, `cellId`, and `formatNumber` are declared inside `<script setup>`, which compiles into a component's internal `setup()` function; nothing declared there is a real module export, in the sandbox or outside it. `npm run test` would fail immediately with an error naming exactly this — no export named `tokenize` (or a similar bundler-specific message) — the first real proof, for anyone who skipped Part 7's extraction, that `<script setup>` was never quietly exporting these functions to begin with; the sandbox simply never had a real module system rigorous enough to ever surface the mistake.

**Adding the `formula.ts` import to `App.vue` without deleting the original declarations:**

Nothing errors, nothing warns, and the app keeps working — which is exactly why this is worth naming explicitly rather than trusting it to be obvious. `<script setup>`'s own content lives in a function scope nested inside the compiled module, one level below the top-level `import` statements, so a leftover local `function formatNumber(...)` doesn't collide with `import { formatNumber }` at all; it shadows it silently. Every call inside `App.vue` keeps hitting the old local copy. `formula.test.ts` still passes, since it imports the real, correctly-exported version directly — so the bug is invisible from both directions at once, discoverable only by actually reading `App.vue` and noticing the same function defined twice.

---

## Connect the pieces

```
Terminal  → runs every command below
Node.js   → the runtime every one of these tools is written to run on
npm       → installs and manages packages (dependencies/devDependencies, package-lock.json)
npx       → runs a package's tool once, without installing it permanently

npx create-vite ...     → scaffolds src/, index.html, package.json, vite.config.ts, tsconfig.json
npm install              → reads package.json, populates node_modules/
npm run dev              → Vite dev server; localhost:5173; Hot Module Replacement
git init / add / commit  → real version history; .gitignore excludes node_modules/, dist/
formula.ts (new)         → tokenize/parse/evaluate/columnLetter/cellId/formatNumber, extracted from
                            App.vue's <script setup> — real modules need real exports, which
                            <script setup> alone can never provide
npm install -D vitest    → real test runner, replacing Lesson 14's hand-built one; imports formula.ts
npm run build            → dist/; minified, source-mapped, ready to deploy
Vercel / Netlify / GitHub Pages → serves dist/ to the world, rebuilding on every git push
```

---

## Definition of done

Verify, on your own machine, outside Vue Studio entirely:

- [ ] `npm run dev` starts a real local server, and the spreadsheet works identically to how it worked in Vue Studio
- [ ] `git log` shows at least one real commit, with a message explaining *why*, not *what*
- [ ] `npm run test` runs Vitest and shows the same tests Lesson 14 built, passing
- [ ] `npm run build` produces a `dist/` folder, and opening its contents through a real static server (not `file://`) works
- [ ] The project is reachable at a real, public URL
- [ ] `formula.ts` exists, `App.vue` imports from it, and the app still behaves identically to before the extraction
- [ ] `App.vue`'s `<script setup>` has no leftover copy of `tokenize`, `parse`, `evaluate`, `columnLetter`, `cellId`, `formatNumber`, or `assertNever` — search for each name and confirm it appears once, in `formula.ts`
- [ ] You can explain why `tokenize`, `parse`, and `evaluate` could never actually be imported from `App.vue`, in the sandbox or in a real build, until they moved into their own file
- [ ] You can explain why a leftover local copy of one of these functions wouldn't cause an error, and what it would silently cause instead
- [ ] You can explain the difference between `dependencies` and `devDependencies`, using `vue` and `vitest` as your two examples
- [ ] You can explain what `package-lock.json` guarantees that `package.json` alone does not
- [ ] You can explain, in one sentence each, what a sprint, a backlog, and a retrospective are

---

*This is the last lesson in the series as it stands. You started at Lesson 01 assuming nothing — not a variable, not an `if` statement, not what a component was. You have since built a real tokenizer, a real recursive-descent parser, a real tree-walking evaluator, a dependency graph with cycle detection, a Memento-pattern undo system, a Strategy-pattern plugin architecture, a virtualized grid handling ten thousand rows, and a real formula language with autocomplete — and you now know how to take all of it out of a browser sandbox and into the real world. Everything after this point is the same discipline this series has practiced from its first page: state the problem, build the smallest thing that solves it, name what it teaches, and connect it to everything around it.*
