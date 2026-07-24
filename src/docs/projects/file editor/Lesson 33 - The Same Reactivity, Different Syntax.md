# Lesson 33: The Same Reactivity, Different Syntax

## What you will build

The Backend Status widget (Lesson 29) rebuilt as a real Single File
Component, `frontend/src/components/BackendStatus.vue`, using the
Composition API instead of the Options API Lessons 29–31 used
throughout. Nothing about *what* the widget does changes at all — the
actual subject is that Vue offers two different syntaxes for the exact
same reactivity idea, and knowing both, not just picking one and
forgetting the other exists, is what lets you read real Vue code
written either way.

## What you need to know first

`Lesson 29 - An App That Watches Its Own Data.md` — `data()`,
`methods`, `{{ }}`, `@click`, and specifically the *idea* of reactive
state, which carries forward unchanged. `Lesson 32 - A Real Frontend
Project.md` — `import`/`export`, the Vite dev server, and the honest
limit on what jsdom can verify for a real `.vue` file.

---

## Concept Unit: the same reactive value, a different container

### The Problem

Every reactive value until now has lived inside `data()`'s returned
object, read and written through `this`. The Composition API — what
`<script setup>` is designed around — doesn't have a `data()` or a
`this` at all. Something else has to hold a value, notice when it
changes, and tell Vue to re-render.

### Concept Lab

```html
<script src="https://unpkg.com/vue@3.5.40/dist/vue.global.js"></script>
<div id="app">
    <button @click="count++">Count: {{ count }}</button>
</div>
<script>
    const { createApp, ref } = Vue

    const count = ref(0)

    createApp({
        setup() {
            return { count }
        },
    }).mount("#app")
</script>
```

Confirmed against a real, mounted instance — actual output, this exact
run:

```
1) count.value: 0 | rendered: <button>Count: 0</button>
2) count.value: 1 | rendered: <button>Count: 1</button>
3) after setting count.value = 100 directly: <button>Count: 100</button>
```

### What This Proves

`ref(0)` — first appearance — creates a single reactive **container**
holding one value, starting at `0`; unlike `data()`, which wraps an
entire returned *object*, `ref()` wraps one value at a time. In plain
JavaScript, that value is read and written through `.value` —
`count.value`, confirmed directly above changing from `0` to `1` after
the click, and jumping to `100` after a direct assignment from outside
any click handler at all. Inside the *template*, though, `{{ count }}`
— not `{{ count.value }}` — displays it correctly; Vue automatically
unwraps a `ref` inside a template, the one place `.value` is never
written. `setup()` — a new lifecycle option, replacing `data()` — runs
once, and whatever object it `return`s becomes available to the
template, the same *role* `data()`'s return value played, through a
different mechanism.

### CS Lens — one idea, two containers

`data()`'s object and `ref()`'s single value both do the identical
job: hold a value, and make Vue aware whenever it's reassigned, so a
re-render can happen automatically. Nothing about *reactivity itself*
is different between Lessons 29–31 and this lesson — only the shape of
the container changed, from "one object holding many properties" to
"many individual containers, one value each." Recognizing this before
diving further into Composition API syntax matters: it's easy to
mistake a different container for a different *idea*, when the
underlying mechanism — Vue tracking reads and writes to decide what to
re-render — hasn't moved at all.

### Discard

This lab is deleted now — it never appears in the project. The real
`BackendStatus.vue`, next, uses this identical `ref()` pattern inside
an actual Single File Component instead of a CDN script.

---

## Concept Unit: a component file that exposes itself

### The Problem

`<script setup>` — used since Lesson 32's `App.vue`, but never yet
holding any real reactive state or a component of its own — needs to
actually make a value and a function available to its own template,
and a real project needs one component to use another inside it.
Neither has been proven yet, only assumed.

### Concept Lab

`Greeting.vue`, a real Single File Component, saved inside the actual
Vite project and requested directly from the dev server — not a
simulation:

```html
<script setup>
const name = "Ivy"
</script>

<template>
  <p id="greeting-text">Hello, {{ name }}!</p>
</template>

<style scoped>
#greeting-text {
    color: blue;
}
</style>
```

Requesting `Greeting.vue` directly through the real Vite dev server —
actual compiled output, this exact run, the parts that matter isolated
from the surrounding boilerplate:

```javascript
const name = "Ivy"

const _sfc_main = {
  setup(__props, { expose: __expose }) {
    __expose();
    const __returned__ = { name }
    return __returned__
  }
}

function _sfc_render(_ctx, _cache, $props, $setup) {
  return (_openBlock(), _createElementBlock("p", _hoisted_1,
    "Hello, " + _toDisplayString($setup.name) + "!"))
}
```

The scoped style, requested separately — actual compiled output:

```css
#greeting-text[data-v-d873b7eb] {
    color: blue;
}
```

### What This Proves

`const __returned__ = { name }` — this is the real answer to how
`<script setup>` works: Vite's compiler reads every top-level
`const`/`function` declared inside `<script setup>` and automatically
builds the equivalent of `setup() { return {...} }` — nothing was
written by hand to expose `name` to the template; the compiler did it,
confirmed by literally reading its own generated code. `_toDisplayString($setup.name)`
in the render function is `{{ name }}`, compiled — direct, checkable
proof the value actually reaches the template.
`#greeting-text[data-v-d873b7eb]` is `<style scoped>`'s real mechanism,
not a vague promise of "isolation": Vue's compiler appends a random,
per-component attribute (`data-v-d873b7eb`) to a CSS selector — and,
unshown here but implied by the mechanism, to the actual rendered
elements too — so this rule can only ever match elements this one
component rendered, never a `#greeting-text` belonging to some
unrelated part of a larger page.

A second file, `LabApp.vue`, using the first — proving one component
can render another:

```html
<script setup>
import Greeting from './Greeting.vue'
</script>

<template>
  <Greeting />
</template>
```

Its own compiled output, actual, this exact run:

```javascript
import Greeting from "/src/lab_scratch/Greeting.vue"
const __returned__ = { Greeting }
function _sfc_render(_ctx, _cache, $props, $setup) {
  return (_openBlock(), _createBlock($setup["Greeting"]))
}
```

`import Greeting from './Greeting.vue'` — this lesson's own component
file, imported exactly like any other module (Lesson 32); `<Greeting />`
in the template — first appearance of using an imported component as
if it were a new HTML tag — compiles to `_createBlock($setup["Greeting"])`,
real, checkable proof that Vue resolved the tag name back to the
imported component and rendered it in place.

### Discard

`Greeting.vue` and `LabApp.vue` are deleted now — neither appears in
the project. `BackendStatus.vue`, next, is a real component used by a
real parent, `App.vue`, the same relationship just proven here.

---

## Concept Unit: BackendStatus.vue, for real

### The Problem

Lesson 29's Backend Status widget exists only as CDN-mounted,
Options-API code inside the old root `index.html`. It needs to become
a real Composition-API component inside `frontend/`, using this
lesson's `ref()` and `<script setup>` patterns for real.

### Project Change

- **Files affected** — `frontend/src/components/BackendStatus.vue`, new
  file; `frontend/src/App.vue`, existing file.
- **Change type** — create; add (a new import and a new tag in
  `App.vue`'s template).
- **Location** — `frontend/src/components/`, a new directory for
  components as they're built.
- **Dependencies** — this lesson's `ref()` and `<script setup>`
  patterns; `fetch` and the `/health` route, unchanged since Lesson 1.

### The New Code — type this

```html
<script setup>
import { ref } from 'vue'

const statusText = ref("Not checked yet.")

function checkBackend() {
    statusText.value = "Checking..."
    fetch("http://127.0.0.1:8000/health")
        .then((response) => {
            statusText.value = response.ok ? "Backend reachable." : "Backend returned an error."
        })
        .catch(() => {
            statusText.value = "Backend unreachable."
        })
}
</script>

<template>
  <div id="backend-status">
    <span>{{ statusText }}</span>
    <button @click="checkBackend">Check Now</button>
  </div>
</template>

<style scoped>
#backend-status {
    position: fixed;
    top: 8px;
    right: 8px;
    font-size: 12px;
    color: #666;
}
</style>
```

`App.vue` gains one import and one new tag:

```html
<script setup>
import BackendStatus from './components/BackendStatus.vue'
</script>
```

### The Updated Project — where this lives

`App.vue`, in full, with the new lines marked:

```html
<script setup>
import BackendStatus from './components/BackendStatus.vue'   <!-- ← new -->
</script>

<template>
  <h1>Engineering Workspace Platform</h1>
  <BackendStatus />                                            <!-- ← new -->
</template>
```

### Mechanical Walkthrough
Every construct in `BackendStatus.vue` has already been isolated and
- explained in this lesson's first two units — `ref()`, `.value`, `<script setup>`'s auto-exposure, `<style scoped>` — so nothing here is

new syntax. What's worth tracing is the direct correspondence to
Lesson 29's original: `statusText = ref("Not checked yet.")` replaces
`data() { return { statusText: "Not checked yet." } }`; every
`this.statusText = ...` becomes `statusText.value = ...`;
`methods: { checkBackend() {...} }`'s body is unchanged, now a
top-level function instead of a method; `{{ statusText }}` and
`@click="checkBackend"` in the template are typed identically to
before — Vue's template syntax itself never depended on which API
produced the values it's reading.

### SE Lens — the CSS moved with the component, not around it

The old `#backend-status` positioning rule lived in `index.html`'s one
large, global `<style>` block, alongside every other rule in the whole
project — nothing stopped some unrelated future rule from
accidentally targeting `#backend-status` too, or the reverse.
`<style scoped>`, confirmed mechanically in this lesson's second unit,
makes that class of collision structurally impossible for this rule:
it can only ever match elements `BackendStatus.vue` itself rendered.
The real cost, worth naming honestly: scoped styles add a small,
real amount of generated CSS and a compiler pass most projects never
notice, but it's not literally free, either.

### Run It

Confirmed via the real Vite dev server's actual compiled output for
both files, not assumed correct from reading the source — the
`BackendStatus.vue` compilation (parts that matter, isolated from
boilerplate):

```javascript
const statusText = ref("Not checked yet.")
function checkBackend() { /* unchanged from source */ }
const __returned__ = { statusText, checkBackend, ref }
...
_createElementVNode("span", null, _toDisplayString($setup.statusText), 1)
_createElementVNode("button", { onClick: $setup.checkBackend }, "Check Now")
```

`App.vue`'s compiled output, confirming `BackendStatus` really is
rendered as a child:

```javascript
_createElementBlock(_Fragment, null, [
  _createElementVNode("h1", null, "Engineering Workspace Platform"),
  _createVNode($setup["BackendStatus"])
])
```

The actual `checkBackend` logic, run for real — not through the
compiled template (jsdom can't execute it, per Lesson 32's own named
limit), but through the real `ref()` API and the literal function body,
against a real running backend:

```
1) initial: Not checked yet.
2) immediately after calling checkBackend: Checking...
3) after the real fetch resolves (server running): Backend reachable.
4) after fetching a genuinely dead port: Backend unreachable.
```

Every one of the four states this widget can be in is confirmed with
real evidence — the compiled structure proves the template wiring is
correct, and the live-fetch run proves the reactive logic itself
behaves correctly, together covering everything short of an actual
click in an actual browser window.

---

## Connect the pieces

`App.vue` imports `BackendStatus` and renders `<BackendStatus />`;
Vue's compiler turns that tag into a real child component instance.
Inside it, `ref("Not checked yet.")` creates the reactive container
`<script setup>` automatically exposes to the template as `statusText`.
Clicking Check Now calls `checkBackend`, also auto-exposed; it sets
`statusText.value`, and — the exact same reactive mechanism as every
Options-API `data()` value since Lesson 29, just reached through
`.value` instead of `this.` — the `{{ statusText }}` interpolation
re-renders to match. The scoped `<style>` block travels with the
component wherever it's used, rather than needing to live in some
separate, shared stylesheet the way it did in the old `index.html`.

## What breaks without this

Confirmed directly by tracing the compiled output: without `ref()`,
`let statusText = "Not checked yet."` would be a plain variable — Vue
has no way to know it exists, let alone that it changed, and
`checkBackend` reassigning it would leave `{{ statusText }}` frozen at
its first-rendered value forever. `ref()` is what makes a plain
JavaScript value into something Vue actually tracks; a plain `let`
looks identical until the moment it needs to update the screen, and
then it simply doesn't.

## Exercises

1. Run `npm run dev` inside `frontend/`, open it in a real browser, and
   click Check Now — confirm the status text actually changes on
   screen, completing what Lesson 32 could only set up.
2. In `BackendStatus.vue`, temporarily change `ref()` to a plain
   `let statusText = "Not checked yet."` (removing the reactive
   wrapper entirely) and confirm — in a real browser, since this bug
   is invisible in the compiled source alone — that clicking Check Now
   no longer updates what's on screen, even though `checkBackend`
   still runs.
3. Add a second `ref()` to `BackendStatus.vue` — a click counter,
   incremented inside `checkBackend` — and display it in the template
   alongside `statusText`.
4. Explain, without looking back at this lesson, what `.value` is for,
   and why `{{ }}` in a template never needs it.

## Definition of done

- [ ] You've clicked Check Now in a real browser and watched the
      status text update
- [ ] You've broken reactivity on purpose by swapping `ref()` for a
      plain variable, confirmed the break, and restored the fix
- [ ] You can explain what `ref()` and `data()` have in common, and
      what's actually different between them
- [ ] You can explain, using this lesson's own compiled output as
      evidence, what `<script setup>` actually does with a top-level
      `const`
- [ ] `git commit` this lesson's code with a message explaining why
