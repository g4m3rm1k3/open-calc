# Lesson 31: A List That Renders Itself

## What you will build

The file browser sidebar — `renderFileList`, hand-written since
Lesson 2 — rebuilt as a Vue component. Navigating into a folder, going
back up, and opening a file all keep working exactly as before; the
difference is entirely underneath: nothing calls `document.createElement`
or `.appendChild` in a loop anymore. The actual subject is `v-for`,
Vue's directive for rendering a list from an array, and its constant
companion `:key` — plus a second real, honest instance of this
project's now-familiar seam between Vue and the still-vanilla rest of
the app.

## What you need to know first

`Lesson 30 - A Login Screen That Doesn't Read Its Own Inputs.md` — the
`.mount()`-return-value pattern, used again here for the exact same
reason. `Lesson 2 - Browsing the File System.md` — the original
`renderFileList`, `loadFolder`, and the `for` loop it was built on;
`openFile` (Lesson 4), unchanged, still called from this new component.

---

## Concept Unit: a list that draws itself from an array

### The Problem

`renderFileList` (Lesson 2) is a `for` loop that builds one `<li>` per
entry by hand — `document.createElement`, set its text, set its class,
attach a listener, `appendChild` it — then throws the whole thing away
and rebuilds it from scratch on every single folder navigation. Nothing
connects the `entries` array itself to what's on screen; the loop is
the only thing keeping them in sync, and it has to be re-run in full
every time.

### Concept Lab

```html
<script src="https://unpkg.com/vue@3.5.40/dist/vue.global.js"></script>
<ul id="app">
    <li v-for="animal in animals" :key="animal">{{ animal }}</li>
</ul>
<script>
    Vue.createApp({
        data() {
            return { animals: ["bear", "wolf", "otter"] };
        },
    }).mount("#app");
</script>
```

Confirmed against a real, mounted instance — actual output, this exact
run:

```
initial: <li>bear</li><li>wolf</li><li>otter</li>
after animals.push("fox"): <li>bear</li><li>wolf</li><li>otter</li><li>fox</li>
```

### What This Proves

`v-for="animal in animals"` — first appearance — renders the element
it's attached to once per item in `animals`, with `animal` bound to the
current item inside that one copy; this replaces the entire
`entries.forEach((entry) => { ... document.createElement ... })` shape
with a single templated element. `:key="animal"` — first appearance of
`:`, shorthand for `v-bind:`, the same directive family as `@` (short
for `v-on:`) already used for `@click`, just binding an *attribute*
instead of listening for an *event*. `key` specifically tells Vue which
real DOM element corresponds to which array item across re-renders, so
it can match them up correctly instead of guessing by position — every
Vue tutorial and Vue's own console both treat `v-for` without a paired
`:key` as a mistake waiting to happen. `vm.animals.push("fox")` proves
something further: Vue's reactivity tracks *array mutation methods*
like `.push()`, not just whole-array reassignment — appending one item
re-renders exactly one new `<li>`, nothing about the existing three is
touched or rebuilt.

### Discard

`animals` and this exact list are deleted now — neither appears in the
project. The real sidebar, next, uses this identical `v-for`/`:key`
pair on the actual file entries a folder returns.

---

## Concept Unit: the real file browser

### The Problem

`renderFileList`, `loadFolder`'s calls into it, and the global
`currentPath` variable it depends on all need to become one real Vue
component — without breaking `openFile` (Lesson 4) or any other part of
the app that isn't being touched this lesson.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — replace, `#file-list`'s inner HTML; remove, the
  `renderFileList` function and the global `let currentPath = "";`
  entirely; replace, `loadFolder`'s body; add, a new `sidebarApp` Vue
  application.
- **Location** — `#file-list`, inside `#sidebar` (Lesson 2); the top of
  the script, where `currentPath` used to be declared alongside
  `openTabs`; `loadFolder` (Lesson 2); `renderFileList`'s old location,
  now `sidebarApp`'s.
- **Dependencies** — this lesson's own `v-for`/`:key` pair; `loadFolder`
  and `openFile`, both still plain vanilla functions this component
  calls into, exactly the way `loginApp` calls `loadFolder` after a
  successful login (Lesson 30).

### The New Code — type this

The template — three independent conditions, not a chain, since an
error clears both `currentPath` and `entries`:

```html
<li v-if="errorMessage !== ''">{{ errorMessage }}</li>
<li v-if="currentPath !== ''" class="clickable" @click="goUp">.. (up)</li>
<li v-for="entry in entries" :key="entry.name" class="clickable" @click="handleEntryClick(entry)">{{ entry.is_directory ? entry.name + "/" : entry.name }}</li>
```

`loadFolder` now writes into the component instead of calling a render
function:

```javascript
sidebarApp.currentPath = data.path;
sidebarApp.entries = data.entries;
sidebarApp.errorMessage = "";
```

Its failure path clears the same three values into a known, consistent
error state:

```javascript
sidebarApp.currentPath = "";
sidebarApp.entries = [];
sidebarApp.errorMessage = "Could not reach backend.";
```

The component itself:

```javascript
const sidebarApp = Vue.createApp({
    data() {
        return {
            currentPath: "",
            entries: [],
            errorMessage: "",
        };
    },
    methods: {
        goUp() {
            const parentPath = this.currentPath.split("/").slice(0, -1).join("/");
            loadFolder(parentPath);
        },
        handleEntryClick(entry) {
            const entryPath = this.currentPath === "" ? entry.name : this.currentPath + "/" + entry.name;
            if (entry.is_directory) {
                loadFolder(entryPath);
            } else {
                openFile(entryPath);
            }
        },
    },
}).mount("#file-list");
```

### The Updated Project — where this lives

`#file-list`, in full — the surrounding `#sidebar` div, untouched, is
shown for orientation:

```html
<div class="sidebar" id="sidebar">
    <ul id="file-list">
        <li v-if="errorMessage !== ''">{{ errorMessage }}</li>
        <li v-if="currentPath !== ''" class="clickable" @click="goUp">.. (up)</li>
        <li v-for="entry in entries" :key="entry.name" class="clickable" @click="handleEntryClick(entry)">{{ entry.is_directory ? entry.name + "/" : entry.name }}</li>
    </ul>
</div>
```

`loadFolder`, in full, with the changed lines marked — the request
itself, `authenticatedFetch` and the URL, is exactly Lesson 2's own
code:

```javascript
function loadFolder(path) {
    authenticatedFetch("http://127.0.0.1:8000/files?path=" + encodeURIComponent(path))
        .then((response) => response.json())
        .then((data) => {
            sidebarApp.currentPath = data.path;      // ← changed: was currentPath = data.path;
            sidebarApp.entries = data.entries;        // ← changed: was renderFileList(data.entries);
            sidebarApp.errorMessage = "";              // ← new
        })
        .catch((error) => {
            sidebarApp.currentPath = "";                // ← new
            sidebarApp.entries = [];                     // ← new
            sidebarApp.errorMessage = "Could not reach backend.";  // ← changed: was document.getElementById("file-list").textContent = ...
        });
}
```

Gone entirely: `renderFileList` (Lesson 2) and the top-level
`let currentPath = "";` declaration — nothing outside `loadFolder` and
`sidebarApp` ever read the global `currentPath`, confirmed by checking
every use of it before making this change, so removing it outright
introduces no dangling reference anywhere else in the file.

### Mechanical Walkthrough
`v-if="errorMessage !== ''"` reuses `v-if` from nowhere yet in this
project's Vue code — first appearance, though it's the exact same
directive family as `v-model` and `v-on`/`@`, just choosing whether an
element exists in the DOM at all rather than binding a value or a
listener to it. `v-for="entry in entries"` and `:key="entry.name"`
apply this lesson's own lab directly, using each file's own `name` as
the key — unique within any one folder listing, the same uniqueness
`entries.append({"name": entry.name, ...})` on the backend
(`backend/main.py`'s `list_files`) already guarantees by construction.
`@click="goUp"`/`@click="handleEntryClick(entry)"` reuse `@click`
(Lesson 29); note `handleEntryClick(entry)` is called *with an
- argument* here, unlike every previous `@click` in this project — inside
a `v-for`, each rendered copy has its own `entry` in scope, so this
expression calls the method with *that specific copy's* item, not a
shared value. `this.currentPath.split("/").slice(0, -1).join("/")`
inside `goUp` is Lesson 2's exact parent-path logic, unchanged, just
reading `this.currentPath` instead of the old global. `handleEntryClick`
reuses the identical `is_directory` branch `renderFileList` always had
- — same decision, same two functions called (`loadFolder`/`openFile`),
now living inside a Vue method instead of an inline click-listener
callback.

### CS Lens — keyed reconciliation

Vue's `:key` requirement points at a real, general problem: given a new
list and an old list, which old element corresponds to which new item?
Without a stable key, a UI library can only guess by position — item 3
is "the same" as whatever was previously at position 3, even if the
data reordered entirely. `:key="entry.name"` gives Vue a stable
identity to match against instead, so if a future feature re-sorted
`entries` (alphabetically vs. folders-first, say), Vue would move the
existing `<li>` elements to match rather than mutating every one of
them in place.

Also recognized in: React's own identical `key` prop, database
migrations diffing old and new schema by primary key rather than
column position, `git`'s own diff algorithm matching lines by content
rather than line number, version-control merge tools reconciling two
edited copies of the same file.

### SE Lens — the same seam, a second time

`goUp` and `handleEntryClick` both call the plain, global `loadFolder`
function — Vue code reaching *out* into vanilla JS, the mirror image of
Lesson 30's `logout()` reaching *in* to `loginApp`. This is the same
real seam named there, showing up again because it's structural to
incremental migration, not a one-off: as long as some features are Vue
and others aren't, the boundary between them has to be crossed
somewhere, in one direction or the other, and this project is choosing
to cross it with plain function calls and direct property assignment —
the simplest mechanism available — rather than introducing a
message-passing system this small amount of cross-talk doesn't yet
justify.

### Run It

Confirmed by driving the actual `index.html` file exactly as a person
would, against a real running backend, real folders and files, not
fixtures invented for this lesson:

```
Logged in; file list at root:
  README.md
  src/

Clicking src/:
  .. (up)
  broken.rs
  duplicate_axis.nc
  hello.rs
  infinite_loop.py
  main.py
  motion_conflict.nc
  sample.nc
  utils.py

Clicking .. (up):
  README.md
  src/

Clicking README.md:
  editor pane becomes visible, a real tab labeled README.md opens —
  openFile (Lesson 4), completely unmodified, still works exactly as
  before
```

The error path, confirmed separately by simulating a failed request
directly against a mounted instance: `errorMessage` set, `entries` and
`currentPath` cleared, and the rendered list shows only
`"Could not reach backend."` — no stale up-button, no stale entries
left over from before the failure.

---

## Connect the pieces

Logging in calls `loadFolder("")`, unchanged since Lesson 2. Its
success handler now writes `sidebarApp.currentPath`,
`sidebarApp.entries`, and clears `sidebarApp.errorMessage` instead of
calling a render function — Vue's own `v-if`/`v-for` bindings pick up
those changes and redraw `#file-list` automatically. Clicking a folder
runs `handleEntryClick`, which computes the same `entryPath` the old
code always did and calls `loadFolder` again — a real network request,
whose result flows back into the exact same three reactive values,
closing the loop. Clicking a file instead calls `openFile`, entirely
untouched by this lesson, proving the boundary between "converted to
Vue" and "still vanilla" can sit in the middle of a single click
handler without either side needing to know about the other's
internals.

## What breaks without this

Confirmed by tracing `handleEntryClick` and `goUp` directly: without
`:key`, Vue still renders correctly for this specific list, since
`entries` is always replaced wholesale on navigation rather than
reordered in place — the console warning it produces is real, but this
lesson's own list never hits the actual bug `:key` prevents. Named
honestly rather than hidden: `:key` is included here because it's
correct practice whenever `v-for` is used, not because this exact list
would visibly misbehave without it.

## Exercises

1. Navigate into `src/`, back up, and into `src/` again through the
   real running app — confirm the file list is correct every time.
2. Stop the backend server, click a folder, and confirm
   "Could not reach backend." appears with no stale up-button or
   leftover entries — then restart the server and confirm navigation
   works again.
3. In the browser console, with the app loaded, run
   `sidebarApp.entries.push({ name: "fake.txt", is_directory: false })`
   directly — confirm a new, real, clickable `<li>` appears immediately,
   with no network request involved.
4. Explain, without looking back at this lesson, why `:key="entry.name"`
   was chosen instead of, say, `:key="index"` (the item's position in
   the array).
5. Explain why `handleEntryClick` and `goUp` call the global
   `loadFolder` function instead of each containing their own `fetch`
   call.

## Definition of done

- [ ] You've navigated into a folder, back up, and opened a file, all
      through the real running app
- [ ] You've caused and observed the real error state by stopping the
      backend mid-session
- [ ] You can explain what `:key` does and why `v-for` almost always
      appears together with it
- [ ] You can explain why `let currentPath` could be deleted outright,
      rather than kept alongside `sidebarApp.currentPath`
- [ ] `git commit` this lesson's code with a message explaining why
