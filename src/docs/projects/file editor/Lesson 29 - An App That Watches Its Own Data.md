# Lesson 29: An App That Watches Its Own Data

## What you will build

A small, real "Backend Status" widget — click a button, it checks
whether the backend is reachable and says so — built with Vue 3 instead
of the hand-written DOM-manipulation pattern every other feature in
this project uses. The feature itself is intentionally tiny. The actual
subject is the first appearance of a completely different way of
building a UI: instead of writing code that says *how* to update the
screen step by step, this lesson writes code that says *what* the
screen should show for the current data, and lets a library figure out
the "how." This is the first lesson of a longer arc that will
eventually convert the rest of this project's frontend to the same
approach.

## What you need to know first

Every `render*()` function this project has written so far —
`renderTabs`, `renderEditor`, `renderFileList`, `renderLockStatus`
(Lessons 2 through 28) — each one a hand-written function that reads
some piece of JavaScript state and manually pushes matching changes
into the DOM via `document.getElementById(...).textContent = ...` or
similar. `fetch`, `.then()`, `.catch()` (Lesson 1 onward). This lesson
doesn't remove or modify any of that code — it adds something new,
completely alongside it.

---

## Concept Unit: an app that owns a piece of state

### The Problem

Every dynamic value displayed in this app so far — a save status, a
lock status, a diagnostic message — is written to the screen by a line
of code that explicitly names the element and sets its `textContent`.
Every one of those call sites has to be found and updated correctly, by
hand, anywhere that value can change. Nothing connects "this value
changed" to "these places on screen show it" automatically.

### Concept Lab

Saved as a standalone throwaway file and opened directly in a browser:

```html
<script src="https://unpkg.com/vue@3.5.40/dist/vue.global.js"></script>
<div id="app">
    <p>{{ greeting }}</p>
</div>
<script>
    Vue.createApp({
        data() {
            return { greeting: "hello" };
        },
    }).mount("#app");
</script>
```

Confirmed by mounting this exact code against a real Vue instance and
inspecting the rendered result — actual output, this exact run:

```
<p>hello</p>
```

### What This Proves

`Vue.createApp({...})` builds a new Vue application from a plain
JavaScript object describing it — `Vue` is a global object this CDN
script attaches to the page, the same way no import statement has ever
been needed for anything in this project's browser code so far.
`data()` is a function returning an object — here, one key, `greeting`
— and Vue wraps everything that function returns in its own tracking
system, so it always knows the current value and notices when it
changes. `.mount("#app")` tells Vue which real DOM element to take over
— everything inside `<div id="app">` becomes this app's **template**.
`{{ greeting }}` — first appearance of Vue's **interpolation** syntax —
is not literal text; Vue replaces it with the current value of
`greeting` from `data()`, and re-checks it automatically any time
`greeting` changes, without anything re-running the render by hand.

### Discard

This exact file is deleted now — it never appears in the project. The
real widget, later in this lesson, uses this identical `createApp` /
`data()` / `{{ }}` shape for something genuinely useful.

---

## Concept Unit: a click that changes data, not the DOM directly

### The Problem

Every click handler in this project so far follows the same shape:
`addEventListener("click", () => { ... reach into the DOM and change
it ... })`. Vue's whole premise is that the DOM should never be touched
directly — so a click needs to do something else instead.

### Concept Lab

```html
<script src="https://unpkg.com/vue@3.5.40/dist/vue.global.js"></script>
<div id="app">
    <button @click="count++">Count: {{ count }}</button>
</div>
<script>
    Vue.createApp({
        data() {
            return { count: 0 };
        },
    }).mount("#app");
</script>
```

Confirmed against a real, mounted instance — actual output, this exact
run:

```
Initial render: <button>Count: 0</button>
After one click:  <button>Count: 1</button>
```

### What This Proves

`@click="count++"` — first appearance of a Vue **directive**, a special
attribute Vue recognizes and treats differently from an ordinary HTML
attribute. `@click` is shorthand for `v-on:click` — "run this
expression when this element is clicked." `count++` is a plain
JavaScript expression, evaluated in the same scope `data()` returned —
no `addEventListener` was written anywhere, and nothing in this code
ever names the `<button>` element or calls `.textContent` on anything.
The button's own visible text still changes, from `Count: 0` to
`Count: 1`, purely as a side effect of `count` itself changing — Vue
re-renders wherever `{{ count }}` appears, automatically, because it's
already tracking that value from `data()`.

### Discard

This counter is deleted now — it never appears in the project. The real
widget below uses `@click` to trigger a real network check instead of
incrementing a number.

---

## Concept Unit: a real Backend Status widget

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add. A new CDN `<script>` tag; a new `#backend-status`
  `<div>`, placed before `#login-screen` so it's visible regardless of
  login state; a new CSS rule positioning it; a new
  `Vue.createApp(...).mount(...)` call at the very end of the existing
  `<script>` block.
- **Location** — the CSS rule goes inside the existing `<style>` block,
  directly after `#login-status` (Lesson 18). The CDN script tag goes
  directly before the project's existing inline `<script>` tag, so the
  `Vue` global exists before that script runs. The `#backend-status` div
  is the new first child of `<body>`. The Vue mount call is the last
  thing in the existing script, after the `"keydown"` listener from
  Lesson 24.
- **Dependencies** — none installed; the CDN script is fetched directly
  by the browser, no build step, no `npm`.

### The New Code — type this

A CSS rule, keeping the widget out of the way of everything else on
screen regardless of which state the page is in:

```css
#backend-status {
    position: fixed;
    top: 8px;
    right: 8px;
    font-size: 12px;
    color: #666;
}
```

The CDN tag itself, making the `Vue` global available to the page:

```html
<script src="https://unpkg.com/vue@3.5.40/dist/vue.global.js"></script>
```

The HTML — this becomes Vue's template the moment it's mounted:

```html
<div id="backend-status">
    <span>{{ statusText }}</span>
    <button @click="checkBackend">Check Now</button>
</div>
```

The Vue app itself, mounted onto that div:

```javascript
Vue.createApp({
    data() {
        return {
            statusText: "Not checked yet.",
        };
    },
    methods: {
        checkBackend() {
            this.statusText = "Checking...";
            fetch("http://127.0.0.1:8000/health")
                .then((response) => {
                    this.statusText = response.ok ? "Backend reachable." : "Backend returned an error.";
                })
                .catch(() => {
                    this.statusText = "Backend unreachable.";
                });
        },
    },
}).mount("#backend-status");
```

### The Updated Project — where this lives

The CSS rule is a complete, freestanding new rule, added directly after
`#login-status` (Lesson 18) — nothing existing is modified, so there's
no enclosing structure to show it inside of; the block shown above is
everything there is to see.

The CDN tag, sitting directly before the project's existing inline
script:

```html
</div>

<script src="https://unpkg.com/vue@3.5.40/dist/vue.global.js"></script>   <!-- ← new -->
<script>
    let currentPath = "";
```

The very top of `<body>`, with the new div marked:

```html
<body>
    <div id="backend-status">                              <!-- ← new -->
        <span>{{ statusText }}</span>                       <!-- ← new -->
        <button @click="checkBackend">Check Now</button>    <!-- ← new -->
    </div>                                                   <!-- ← new -->
    <div id="login-screen">
        <div class="auth-card">
```

The very end of the existing `<script>` block, with the new call marked
— everything above it, including the `"keydown"` listener from
Lesson 24, is unchanged:

```javascript
document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        saveFile();
    }
});

Vue.createApp({                                              // ← new
    data() {                                                  // ← new
        return {                                              // ← new
            statusText: "Not checked yet.",                   // ← new
        };                                                     // ← new
    },                                                          // ← new
    methods: {                                                 // ← new
        checkBackend() {                                       // ← new
            this.statusText = "Checking...";                   // ← new
            fetch("http://127.0.0.1:8000/health")               // ← new
                .then((response) => {                           // ← new
                    this.statusText = response.ok ? "Backend reachable." : "Backend returned an error.";  // ← new
                })                                                // ← new
                .catch(() => {                                   // ← new
                    this.statusText = "Backend unreachable.";     // ← new
                });                                                // ← new
        },                                                          // ← new
    },                                                               // ← new
}).mount("#backend-status");                                          // ← new
```

`#backend-status` now sits completely outside `#login-screen` and
`#app-layout`, mounted and managed entirely by Vue — none of the
existing vanilla JS in this file knows or needs to know it exists, and
it doesn't touch `openTabs`, `activeTabPath`, `authToken`, or any other
variable the rest of the app depends on.

### Mechanical Walkthrough

`<script src="...">` — every `<script>` tag in this project until now
has been inline, its content written directly between the opening and
closing tags. `src` is new: instead of inline content, it tells the
browser to fetch a separate file — here, from `unpkg.com` — and run it
as though it were written inline at that exact point in the page.
Because this tag sits before the project's own `<script>` block, the
`Vue` global it defines already exists by the time any of this
project's own code runs.

`position: fixed` — first appearance of CSS positioning in this
project; every element so far has used the browser's default layout
flow (`static` positioning), where an element's location is determined
entirely by the elements around it. `fixed` removes an element from
that flow entirely and positions it relative to the browser window
itself, unaffected by scrolling or by `#login-screen`/`#app-layout`
toggling their own `display` — exactly why this widget stays visible
and in the same spot regardless of which screen is showing. `top: 8px`
and `right: 8px` — with `fixed` positioning, these properties place the
element's edges a fixed distance from the corresponding edge of the
browser window; `font-size: 12px` and `color: #666` reuse already-
established CSS properties, matching `#login-status`'s own small,
muted styling.

`data()` and `{{ statusText }}` reuse this lesson's own first unit
exactly, now with a real, meaningful initial value instead of
`"hello"`. `methods: { checkBackend() { ... } }` — first appearance of
the `methods` option: a place for functions the template can call by
name, here via `@click="checkBackend"` rather than an inline expression
like the previous unit's `count++`. `this.statusText` — inside a Vue
method, `this` refers to the component instance itself, and reading or
assigning `this.statusText` reads or assigns the exact same reactive
value `data()` returned; setting it here is what makes `{{ statusText
}}` update on screen, with no separate render step written anywhere.
`fetch("http://127.0.0.1:8000/health")` reuses `fetch` and the
`/health` route from Lesson 1, unchanged; `.then()`/`.catch()` are
Lesson 1's own Promise handling, reused verbatim — the only difference
from every earlier use of this exact pattern is that the success and
failure branches assign to `this.statusText` instead of calling
`document.getElementById(...).textContent = ...`.

### CS Lens — declarative rendering, and where it keeps showing up

Every `render*()` function in this project is **imperative**: it says,
step by step, *how* to update the screen — find this element, set its
text, clear that one, toggle this class. `{{ statusText }}` is
**declarative**: it says *what* the screen should show, given the
current data, and never says how or when to update it — Vue's own
internal machinery decides that. This is the same fundamental shift as
SQL (Lesson 16) over hand-rolled file searching: a `SELECT` statement
says *what rows are wanted*, not the loop that would find them. It's
also the same shift `git diff`/`difflib.unified_diff` (Lessons 21, 22)
represent over hand-written comparison logic — describing the *desired
result* and trusting a well-tested system underneath to produce it.

Also recognized in: spreadsheet formulas (a cell says what value it
should hold, not the steps to recompute it), CSS itself (a rule says
what an element should look like, not the paint operations to achieve
it), React and every other reactive UI framework, `pandas` DataFrame
operations, database views.

### SE Lens — a new kind of dependency, and what it actually costs

Every dependency this project has used until now has been either
Python's own standard library or a package installed once via `pip`,
version-pinned in a way this session hasn't yet made explicit. This
CDN script is different: the browser fetches `vue.global.js` from
`unpkg.com`, a third party, on every page load — a real, new trust
boundary (if `unpkg.com` is ever compromised or unreachable, this
project's frontend is affected) and a real, new point of failure (no
internet on page load means no Vue, means `#backend-status` never
renders — everything else in this file still works, since it's
untouched vanilla JS). The version is pinned explicitly —
`vue@3.5.40`, the exact version this lesson's own output was verified
against — rather than the unpinned `vue@3` many tutorials show, which
would silently serve whatever the newest 3.x release happens to be on
any given day, undermining any claim that this lesson's verified output
still matches what a reader's browser actually loads.

### Run It

Confirmed by loading this project's real, actual `index.html` file —
not a copy, not a simplified reconstruction — with both script tags
executing exactly as a browser would run them:

```
Vue version loaded: 3.5.40
initial: <span>Not checked yet.</span><button>Check Now</button>
login screen intact: true
vanilla JS bootstrap ran (auth title): Log In
```

Confirming the reactive flow through all three real states, each
verified with a genuine network request rather than assumed:

```
immediately after click:      Checking...
after a successful response:  Backend reachable.
after a failed connection:    Backend unreachable.
```

The existing vanilla JS — the login screen, `renderAuthMode()`'s
bootstrap logic, every other function in this file — ran exactly as it
always has, confirming Vue's app is fully additive: nothing about how
the rest of the page works changed by adding it.

---

## Connect the pieces

Loading the page: the CDN `<script>` tag fetches Vue 3.5.40 and attaches
it to `window.Vue`, before the project's own inline script runs.
`Vue.createApp({...}).mount("#backend-status")` takes over that one div,
reading its existing HTML — `{{ statusText }}` and `@click` included —
as its template, and renders `"Not checked yet."` immediately.
Clicking Check Now runs `checkBackend()`: `this.statusText = "Checking..."`
updates the reactive value, and Vue immediately re-renders the `<span>`
to match — no code anywhere says "now update the span." The `fetch`
call runs exactly as it has since Lesson 1; whichever branch resolves,
assigning `this.statusText` again is the *only* action taken, and the
screen updates itself as a consequence, not as a second, separate step.

## What breaks without this

Confirmed directly: removing the `Vue.createApp(...).mount(...)` call
entirely leaves `#backend-status` on the page exactly as written in raw
HTML — the browser has no idea `{{ statusText }}` and `@click` mean
anything special, so it displays the literal text `{{ statusText }}`
on screen and the button does nothing at all when clicked. Vue's
template syntax only does anything once an app is actually mounted onto
that element; writing the directives alone accomplishes nothing.

## Exercises

1. Open the real running app in a browser, click Check Now, and confirm
   the status line updates through "Checking..." to a final result.
2. Stop the backend server, click Check Now again, and confirm the
   widget shows "Backend unreachable." — then restart the server and
   confirm a further click shows "Backend reachable." again.
3. Temporarily remove the `Vue.createApp(...).mount(...)` call, reload
   the page, and confirm `{{ statusText }}` appears as literal, un­
   rendered text — then restore it.
4. In the concept lab, add a second reactive value, `clickCount`,
   incremented inside `checkBackend`, and display it in the template —
   confirm it updates correctly alongside `statusText`.
5. Explain, without looking back at this lesson, why `#backend-status`
   was placed as a sibling of `#login-screen` rather than nested inside
   it.

## Definition of done

- [ ] You've clicked Check Now in the real running app and watched the
      status text change through all three states
- [ ] You've caused Vue to fail to activate (by removing the mount
      call) and seen the raw, un-rendered `{{ }}` syntax on screen
- [ ] You can explain the difference between this project's existing
      `render*()` functions (imperative) and Vue's template (declarative)
- [ ] You can explain why the CDN script's version is pinned to an
      exact version number instead of `vue@3`
- [ ] `git commit` this lesson's code with a message explaining why
