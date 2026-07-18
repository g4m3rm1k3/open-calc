# Lesson 32: A Real Frontend Project

## What you will build

A genuine npm/Vite-based Vue project, `frontend/`, sitting alongside
`backend/` — replacing the CDN `<script>` tag from Lessons 29–31 with
real tooling: a dev server that recompiles on every save, real Single
File Components (`.vue` files with `<template>` and `<script>`
together), and a production build step. This lesson doesn't migrate
any of `index.html`'s actual features yet — it proves the new
environment works, completely on its own, before anything real gets
built on top of it. That's deliberate, the same sequencing discipline
Lesson 15 used for `auth.py` and Lesson 6 used for extracting
`run_python`: verify the piece nothing else can afford to have wrong,
by itself, before building on it.

## What you need to know first

`Lesson 1 - The Skeleton.md` — `requirements.txt`, `pip install`,
`pip freeze`, and specifically the SE Lens on *why* pinning exact
versions matters; this lesson's `package-lock.json` solves the
identical problem, automatically. `Lesson 29 - An App That Watches Its
Own Data.md` through `Lesson 31` — the Vue concepts themselves
(`data()`/`ref()` aside, everything about templates, directives, and
reactivity carries forward unchanged). This lesson is entirely new
*tooling*, not new Vue.

---

## Concept Unit: a JavaScript project with dependencies of its own

### The Problem

Lessons 29–31 loaded Vue from a CDN — one `<script src="...">` tag,
zero installation, zero project structure. That was a deliberate,
named tradeoff (Lesson 29's SE Lens) to isolate learning Vue itself
from learning a build toolchain. Now that Vue's own concepts are
established, the CDN approach's real limits are showing: no way to
split code across real files that import each other, no compilation
step, and — as felt directly, hand-editing one 900-plus-line
`index.html` — no separation between markup, logic, and structure at
all.

### What This Proves

No throwaway lab for this unit — it's demonstrated with the real
project below, and directly mirrors Lesson 1's own `pip`/`requirements.txt`
treatment closely enough to reuse that explanation rather than
duplicate it. `npm` is JavaScript's package manager, the same role
`pip` plays for Python. `package.json` is `requirements.txt`'s
JavaScript counterpart — a manifest naming what a project directly
depends on. Running `npm install` against this lesson's real
`package.json`:

```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.5.39"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.7",
    "vite": "^8.1.1"
  }
}
```

`"scripts"` names the three commands this file's own later units actually
run — `npm run dev`, `npm run build`, and `npm run preview` (serving the
built output locally) all resolve to this block, the same way
`package.json` itself resolves `npm install`'s target. Installing it —
installed 35 packages, not 3 — actual output, this exact run:

```
added 35 packages, and audited 36 packages in 5s
```

The same transitive-dependency resolution Lesson 1 found with `pip`
(`fastapi` pulling in `pydantic`, `starlette`, and others): `vue` and
`vite` each depend on smaller packages of their own, and `npm`
resolves that whole chain automatically, installing everything into a
`node_modules/` folder — never committed to git, listed in
`frontend/.gitignore` exactly like `backend/.venv` is for Python.

### CS Lens — automatic reproducibility, not a manual discipline

Lesson 1 needed an explicit second step — `pip freeze`, then
overwriting `requirements.txt` by hand — to pin every dependency to
its exact installed version, because `pip install` alone doesn't do
that automatically. `npm install` writes `package-lock.json` on every
single install, unprompted, recording the exact resolved version of
every package, direct and transitive. `package.json`'s own
`"vue": "^3.5.39"` still allows some drift (`^` permits newer
compatible versions) — but `package-lock.json`, committed to git
alongside it, is what actually guarantees a fresh `npm install` months
from now reproduces this exact dependency tree. Same underlying
problem as Lesson 1's, solved with an automatic mechanism instead of a
remembered manual step.

Also recognized in: `pip freeze` itself (Lesson 1), a `Cargo.lock` in
any Rust project, a `Gemfile.lock` in Ruby — every serious package
manager eventually grows a lock-file mechanism, because "install
whatever's currently newest" is a moving target no real project can
safely build on.

---

## Concept Unit: code split across files, on purpose

### The Problem

Every function in `index.html`, across 31 lessons, has lived in one
giant inline `<script>` block, reachable by every other function
purely because they all share one scope. A real project needs pieces
in separate files that explicitly declare what they share with each
other — otherwise "everything can see everything" stops being
convenient and starts being how a thousand-line file turns into ten
thousand.

### Concept Lab

Two real, separate files, saved side by side — the whole point being
demonstrated is that they're not one shared scope. `greeting.mjs`:

```javascript
export function greet(name) {
    return "Hello, " + name + "!";
}
```

`main.mjs`, in the same folder, reaching into the first file by name:

```javascript
import { greet } from "./greeting.mjs";

console.log(greet("Ivy"));
```

Run `node main.mjs` — actual output, this exact run:

```
Hello, Ivy!
```

Deleting the `import` line and running the file again — actual output,
this exact run:

```
ReferenceError: greet is not defined
```

### What This Proves

`export function greet(...)` — first appearance of `export` — marks
`greet` as available to *other files that explicitly ask for it*,
unlike every function this project has written so far, implicitly
shared just by sitting in the same `<script>` block.
`import { greet } from "./greeting.mjs"` — first appearance of
`import` — pulls that one named export into `main.mjs`'s own scope;
the `{ }` names exactly which export is being pulled in, not
everything the file happens to define. The second run, with the
`import` line removed, proves the point directly: `greet` is *not*
some ambient global anymore — without an explicit `import`, it simply
doesn't exist in this file, confirmed by the real `ReferenceError`.
This is what `"type": "module"` in `package.json` and `<script type="module">`
in an HTML file both turn on: real, file-scoped code instead of one
shared global scope.

### Discard

`greeting.mjs` and `main.mjs` are deleted now — neither appears in the
project. The real `frontend/src/main.js`, next, uses this identical
`import` shape to pull in Vue's own `createApp` and this project's
first real component.

---

## Concept Unit: a real project, running for real

### The Problem

`npm`, `import`/`export`, and Vue itself all need to come together
into one actual, running project — scaffolded correctly, trimmed of
template boilerplate that doesn't belong to this project, and proven
to serve real, compiled output before a single feature gets migrated
into it.

### Project Change

- **Files affected** — a brand-new directory tree, `frontend/`,
  sitting alongside `backend/` at the project root; `index.html` (the
  old one, at the project root) is untouched and still the real,
  working app for now.
- **Change type** — create.
- **Location** — project root.
- **Dependencies** — Node.js and `npm`, already present on this
  machine; nothing to install beyond what `npm install` pulls in.

### Commands needed to make this unit real

```powershell
npm create vite@latest frontend -- --template vue
cd frontend
npm install
```

`npm create vite@latest` runs Vite's own official scaffolding tool,
generating a starting project structure. `-- --template vue` passes
`--template vue` through to that tool, choosing the Vue variant over
Vite's other framework templates (React, Svelte, plain JavaScript,
several more) — the same "pass arguments through" shape as
`git commit -m "..."`, just a different program on the receiving end.
`npm install` reads the scaffolded `package.json` and installs
everything, per this lesson's first unit.

The scaffold includes a demo component and starter styling that belong
to Vite's own template, not this project — removed entirely:

```
rm src/components/HelloWorld.vue
rm src/assets/hero.png src/assets/vite.svg src/assets/vue.svg
rm README.md
rm public/icons.svg
```

### The New Code — type this

`src/App.vue` — the scaffold's demo content replaced with a minimal,
real starting point:

```html
<script setup>
</script>

<template>
  <h1>Engineering Workspace Platform</h1>
</template>
```

`src/style.css` — trimmed to the one rule Lesson 1's original
`index.html` also started with:

```css
body {
    margin: 0;
}
```

### The Updated Project — where this lives

`src/main.js`, generated by the scaffold and left completely
unmodified — the exact `import`/`export` shape this lesson's previous
unit just lab'd, now for real:

```javascript
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
```

`frontend/index.html` — Vite's own HTML entry point, distinct from the
project root's existing `index.html`, with only the `<title>` changed
to match:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Code Editor</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

### Mechanical Walkthrough

`import { createApp } from 'vue'` — this lesson's own `import` syntax,
now pulling from a package name (`'vue'`) rather than a relative file
path; Vite resolves `'vue'` by looking inside `node_modules/vue`,
installed by this lesson's earlier `npm install`. `import './style.css'`
— first appearance of importing a CSS file directly from JavaScript;
Vite recognizes the `.css` extension and injects that stylesheet into
the page, rather than treating it as JavaScript to execute.
`import App from './App.vue'` — importing a Vue Single File Component
exactly like importing any other module; `App` here is the *default*
export (no `{ }`), matching `App.vue`'s `<script setup>` block, which
implicitly exports the whole component as its default. `createApp(App).mount('#app')`
reuses `createApp`/`.mount()` from Lesson 29 exactly — the only
difference from `Vue.createApp(...)` is reaching `createApp` through
this file's own `import` instead of a CDN-attached global `Vue` object.
`<script type="module" src="/src/main.js">` in `frontend/index.html`
is the *browser's* side of the same module system this whole unit
relies on — `type="module"` is what makes `import`/`export` legal
inside a browser-loaded script at all, not just inside Node.

### CS Lens — a compiler in the loop, not just a file server

Every previous lesson's `index.html` was served (or opened) exactly as
written — no step between the file on disk and what the browser
received. Vite's dev server is different: it intercepts the request
for `App.vue`, **compiles** it — turning `<template>` into a real
JavaScript render function, the same conceptual step Lesson 6's
`rustc` performs on `.rs` source — and serves the compiled result,
never the raw `.vue` text itself. `npm run build` performs the same
compilation ahead of time for every file at once, bundling the results
into a small number of optimized static files instead of compiling
on-demand per request. Two different times to do the identical
compilation work: on every request during development (fast to start,
slower per-request, live-reloads instantly on save), or once, upfront,
for a fixed set of files to actually deploy (slower to produce, but
what real users would receive).

### SE Lens — a real, honest verification gap

Confirming this unit's actual rendered output the way every prior Vue
lesson has — loading the real page in a headless DOM and reading back
what's in `#app` — does not work here: jsdom, used throughout Lessons
29–31, does not execute `<script type="module">` content at all,
confirmed directly by trying the simplest possible inline module
script and finding it silently doesn't run. This isn't specific to
Vite; it's a real limitation of the verification tool used until now,
not of the project. What's verified below instead is every piece that
*can* be checked directly: the dev server's real HTTP response, the
actual compiled output Vite produces for `App.vue`, and a real,
successful production build. Actually opening `http://localhost:5173`
in a real browser and seeing "Engineering Workspace Platform" on
screen is this lesson's own first exercise — named honestly as not yet
witnessed here, the same honesty Lesson 24 already applied to
keyboard-shortcut behavior a terminal can't exercise either.

### Run It

The dev server, started with `npm run dev`, responding to a real
request — actual output, this exact run:

```
<!doctype html>
<html lang="en">
  <head>
    <script type="module" src="/@vite/client"></script>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Code Editor</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

`/@vite/client`, injected automatically, is Vite's own hot-reload
connection — not written by this project, added by the dev server
itself. Requesting `App.vue` directly through the dev server — the
actual compiled output, confirming the template really did compile to
a real render function producing exactly the text this lesson wrote:

```javascript
function _sfc_render(_ctx, _cache) {
  return (_openBlock(), _createElementBlock("h1", null, "Engineering Workspace Platform"))
}
```

A real production build, `npm run build` — actual output, this exact
run:

```
vite v8.1.5 building client environment for production...
transforming...✓ 12 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                  0.46 kB │ gzip:  0.29 kB
dist/assets/index-TZrNw7dA.css   0.01 kB │ gzip:  0.03 kB
dist/assets/index-bDCgJHmS.js   59.31 kB │ gzip: 23.48 kB

✓ built in 186ms
```

Twelve modules — Vue itself plus this project's own two files — bundled
into one JavaScript file and one CSS file, ready to be served as
static files by anything at all, with no Node.js or Vite required at
runtime.

---

## Connect the pieces

`npm create vite@latest frontend -- --template vue` scaffolds a real
project; `npm install` resolves and locks its dependencies, the same
problem `pip`/`requirements.txt` solved in Lesson 1, now automatic.
`frontend/index.html` loads `src/main.js` as a real ES module;
`main.js` `import`s `createApp` from the installed `vue` package and
this project's own `App.vue`, then mounts it — the identical
`createApp(...).mount(...)` shape from Lesson 29, reached through
`import` instead of a CDN global. Editing `App.vue` and saving
triggers Vite to recompile just that file and push the update over the
`/@vite/client` connection — instantly, without a full page reload,
something no version of the CDN-script approach could ever do. None of
this yet touches a single feature from the real app; that starts next
lesson.

## What breaks without this

Confirmed directly, both ways: without `"type": "module"` and the
matching `<script type="module">` tag, `import`/`export` syntax is a
real `SyntaxError` in a browser — modules are opt-in, not the default.
Without `npm install` having been run at all, `frontend/index.html`'s
`import { createApp } from 'vue'` fails immediately, since nothing
exists yet at `node_modules/vue` for Vite to resolve that import
against — confirmed by this lesson's own real installation step being
a prerequisite for anything else in it to work.

## Exercises

1. Run `npm run dev` yourself, open the printed `localhost` URL in a
   real browser, and confirm "Engineering Workspace Platform" actually
   appears — the exercise this lesson's own SE Lens named as not yet
   witnessed here.
2. Edit the text inside `App.vue`'s `<h1>`, save, and confirm the
   browser updates without a manual refresh.
3. Run `npm run build`, then open `dist/index.html` directly as a
   local file (no dev server running) — confirm it still displays
   correctly, proving the built output is genuinely static.
4. Explain, without looking back at this lesson, what `package-lock.json`
   guarantees that `package.json` alone does not.
5. Explain why this lesson left the project root's original
   `index.html` completely untouched, rather than deleting it now that
   `frontend/` exists.

## Definition of done

- [ ] You've run `npm run dev` and seen the real page in an actual
      browser, not just in this lesson's pasted output
- [ ] You've edited `App.vue` and watched the dev server hot-reload it
- [ ] You've run a real production build and confirmed the static
      output works standalone
- [ ] You can explain what `export`/`import` actually do, using the
      real `ReferenceError` this lesson produced by removing one
- [ ] You can explain why `package-lock.json` is committed to git while
      `node_modules/` is not
- [ ] `git commit` this lesson's code with a message explaining why
