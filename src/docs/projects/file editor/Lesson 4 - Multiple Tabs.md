# Lesson 4: Tracking More Than One Thing at Once

## What you will build

Multiple files open simultaneously, each in its own tab, each keeping
its own unsaved edits independently. Every lesson so far tracked exactly
one piece of "what's currently active" state — one folder path, one open
file. This lesson is about what changes, structurally, the moment there
can be more than one of something at a time.

## What you need to know first

`Lesson 3 - Viewing, Editing, and Saving a File.md` — `<textarea>`,
`loadFile`/`saveFile`'s shape, `.style.display` toggling, `addEventListener`.
This lesson replaces `loadFile` entirely — the old single-file functions
no longer exist afterward.

---

## Concept Unit: many things instead of one thing

### The Problem

`currentPath` (Lesson 2) and the single open file (Lesson 3) both assumed
exactly one active thing at a time. Multiple tabs means tracking a
*collection* of open files, each with its own independent content, plus
which one is currently visible.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add.
- **Location** — two new `let` declarations, alongside the existing
  `let currentPath = "";` at the top of the `<script>` block.
- **Dependencies** — none new.

### The New Code — type this

```javascript
let openTabs = [];
let activeTabPath = null;
```

### The Updated Project — where this lives

Now see it in place:

```javascript
let currentPath = "";
let openTabs = [];          // ← new
let activeTabPath = null;   // ← new
```

`currentPath` — the sidebar's own state from Lesson 2 — is untouched;
these two new lines simply sit alongside it. From this point on, the
editor pane's state lives in `openTabs`/`activeTabPath`, entirely
separate from which folder the sidebar happens to be showing.

### Mechanical Walkthrough

`openTabs = []` is an empty **array** — the same list construct from
Lesson 2's Python `for` loop lab, here holding JavaScript objects instead
of strings. Each entry will be an object shaped `{ path: ..., content: ... }`
— a small **record**: several named pieces of data traveling together as
one unit, the same shape every backend route in this project has already
been returning as JSON. `activeTabPath = null` starts as `null` — a value
meaning "nothing," distinct from `""` (`currentPath`'s empty state, which
still means a real location: the root folder). No tab is open yet, so
there's no path at all to point to, not even an empty one.

### CS Lens

`currentPath` was **single-value state** — one variable, one thing to
reason about. `openTabs` is **collection state** — a variable number of
independent records, each of which can change on its own, plus a second
variable (`activeTabPath`) tracking which one currently matters for
display. This is a genuinely different shape of problem, not just a
bigger version of the same one: every function that touches tabs now has
to find the *right* record inside the collection before doing anything,
rather than reading one variable directly.

---

## Concept Unit: markup for more than one tab

### The Problem

The editor pane, as Lesson 3 left it, assumed exactly one file: a single
`<h1 id="file-title">` heading and one always-present `<textarea>`.
Multiple tabs need a visible row of tabs above the editor, and a
distinct "nothing open" state — not Lesson 3's placeholder text sitting
inside an editable textarea, which would be saved as real file content
if anyone clicked Save before opening anything.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — replace (Lesson 3's `<h1 id="file-title">`, bare
  `<textarea>`, and always-visible Save button); add (four new CSS
  rules, appended to the existing `<style>` block after `#file-content`).
- **Location** — inside `.main-content`, replacing everything Lesson 3
  put there.
- **Dependencies** — none new.

### The New Code — type this

```html
<div id="tab-bar" class="tab-bar"></div>
<div id="editor-empty">Click a file in the sidebar to open it.</div>
<div id="editor-pane" style="display: none;">
    <textarea id="file-content"></textarea>
    <div>
        <button id="save-button">Save</button>
        <span id="save-status"></span>
    </div>
</div>
```

The CSS that makes a `.tab`/`.tab-close` actually look and space out
like tabs:

```css
.tab-bar {
    display: flex;
    border-bottom: 1px solid #ccc;
    margin-bottom: 8px;
}
.tab {
    padding: 6px 10px;
    border: 1px solid #ccc;
    border-bottom: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
}
.tab.active {
    background-color: #eee;
    font-weight: bold;
}
.tab-close {
    cursor: pointer;
    color: #888;
}
.tab-close:hover {
    color: #000;
}
```

### The Updated Project — where this lives

The `<style>` block, in full, with the four new rules added after
`#file-content`:

```html
<style>
    body {
        margin: 0;
    }
    .layout {
        display: flex;
        height: 100vh;
    }
    .sidebar {
        width: 250px;
        min-width: 150px;
        max-width: 500px;
        resize: horizontal;
        overflow: auto;
        border-right: 1px solid #ccc;
        padding: 8px;
        box-sizing: border-box;
    }
    .sidebar ul {
        list-style: none;
        margin: 0;
        padding: 0;
    }
    .sidebar li {
        padding: 4px 6px;
        border-radius: 4px;
    }
    .sidebar li.clickable {
        cursor: pointer;
    }
    .sidebar li.clickable:hover {
        background-color: #eee;
    }
    .main-content {
        flex: 1;
        padding: 16px;
    }
    #file-content {
        width: 100%;
        height: 400px;
        box-sizing: border-box;
        font-family: monospace;
        font-size: 14px;
        padding: 8px;
    }
    .tab-bar {                          /* ← new */
        display: flex;                  /* ← new */
        border-bottom: 1px solid #ccc;  /* ← new */
        margin-bottom: 8px;             /* ← new */
    }                                    /* ← new */
    .tab {                               /* ← new */
        padding: 6px 10px;              /* ← new */
        border: 1px solid #ccc;         /* ← new */
        border-bottom: none;            /* ← new */
        cursor: pointer;                /* ← new */
        display: flex;                  /* ← new */
        align-items: center;            /* ← new */
        gap: 6px;                       /* ← new */
    }                                    /* ← new */
    .tab.active {                        /* ← new */
        background-color: #eee;         /* ← new */
        font-weight: bold;               /* ← new */
    }                                    /* ← new */
    .tab-close {                         /* ← new */
        cursor: pointer;                /* ← new */
        color: #888;                     /* ← new */
    }                                    /* ← new */
    .tab-close:hover {                   /* ← new */
        color: #000;                     /* ← new */
    }                                    /* ← new */
</style>
```

And `.main-content`'s contents, replacing Lesson 3's heading/textarea/
button entirely:

```html
<div class="main-content">
    <div id="tab-bar" class="tab-bar"></div>                          <!-- ← new -->
    <div id="editor-empty">Click a file in the sidebar to open it.</div>  <!-- ← new -->
    <div id="editor-pane" style="display: none;">                      <!-- ← new -->
        <textarea id="file-content"></textarea>                       <!-- ← changed: starts empty, no placeholder text -->
        <div>
            <button id="save-button">Save</button>                    <!-- ← changed: no longer starts hidden -->
            <span id="save-status"></span>
        </div>
    </div>                                                              <!-- ← new -->
</div>
```

Lesson 3's `<h1 id="file-title">` is gone entirely — nothing in this
lesson replaces it; the active file's path is shown in the tab itself
instead, built later in this lesson. The `<textarea>` now starts empty
rather than holding placeholder text, because that text would otherwise
be indistinguishable from real file content the moment `openFile`
writes into it. The Save button no longer starts hidden with its own
inline `style="display: none;"` the way Lesson 3 had it — hiding the
*entire* `#editor-pane` around it makes an individual toggle on the
button itself redundant.

### Mechanical Walkthrough

`#tab-bar` is an empty `<div>` — nothing shown yet, filled in later this
lesson by `renderTabs`. `#editor-empty` holds the same "click a file"
message Lesson 3 put directly in the `<p>` it replaced, now its own
dedicated element instead of shared with the textarea's placeholder
text. `#editor-pane`, wrapping the `<textarea>` and Save row, starts
with an inline `style="display: none;"` — the same hide-by-default
technique Lesson 3 used on the Save button, applied here to the whole
pane at once. `.tab-bar { display: flex; ... }` lays tabs out
horizontally, reusing the flex layout from Lesson 2's `.layout`.
`.tab { border: 1px solid #ccc; border-bottom: none; ... }` gives each
tab three sides of a border but not the fourth, which — combined with
`.tab-bar`'s own `border-bottom` — is what makes a tab look visually
attached to the pane below it rather than floating separately.
`.tab.active { background-color: #eee; font-weight: bold; }` reuses the
two-class-selector shape from nowhere yet in this project — this is its
first appearance: a rule that only applies to an element carrying
*both* `tab` and `active` at once, matching how Lesson 2's
`.sidebar li.clickable` combined a base element selector with a class,
just two classes together here instead. `.tab-close` and
`.tab-close:hover` style the "x" icon, reusing `:hover` from Lesson 2's
sidebar rule.

### Connects To

None of this is wired to anything yet — `#tab-bar` stays empty and
`#editor-pane` stays hidden until `renderTabs` and `renderEditor`,
built later in this lesson, actually read `openTabs` and decide what to
show.

---

## Concept Unit: finding an already-open tab

### The Problem

Clicking a file that's already open in a tab shouldn't open a second,
duplicate tab — it should just switch to the existing one.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — replace. `loadFile` no longer exists; a new `openFile`
  function takes its place, and every call site that named `loadFile`
  has to be updated to name `openFile` instead — including one inside
  `renderFileList`, from Lesson 3, that this unit's own code doesn't
  touch directly.
- **Location** — same position in the `<script>` block `loadFile`
  occupied; also, inside `renderFileList`'s `forEach`, the `else` branch
  built in Lesson 3's "deciding which function a click should call" unit.
- **Dependencies** — `openTabs` from the previous unit.

### The New Code — type this

```javascript
const existingTab = openTabs.find((tab) => tab.path === path);
if (existingTab) {
    activeTabPath = path;
    renderTabs();
    renderEditor();
    return;
}
```

### The Updated Project — where this lives

This replaces Lesson 3's `loadFile` entirely — same position in the
`<script>` block, new name, new body. See it in place:

```javascript
function openFile(path) {
    const existingTab = openTabs.find((tab) => tab.path === path);   // ← new
    if (existingTab) {                                                // ← new
        activeTabPath = path;                                         // ← new
        renderTabs();                                                 // ← new
        renderEditor();                                               // ← new
        return;                                                       // ← new
    }                                                                  // ← new

    fetch("http://127.0.0.1:8000/file?path=" + encodeURIComponent(path))
        .then((response) => response.json())
        .then((data) => {
            openTabs.push({ path: data.path, content: data.content });  // ← new
            activeTabPath = data.path;                                 // ← new
            renderTabs();                                              // ← new
            renderEditor();                                            // ← new
        })
        .catch((error) => {
            document.getElementById("save-status").textContent = "Could not load file.";
        });
}
```

The `fetch(...)` below the new block is the same request shape from
Lesson 3's `loadFile` — only what happens with the result changed:
`openTabs.push({ path: data.path, content: data.content })` adds a new
record instead of overwriting a single variable. `renderTabs` and
`renderEditor`, called in both branches, don't exist yet — the next two
units build them; until then, `openFile` can be typed and read but not
run standalone.

Renaming a function doesn't rename its callers — `renderFileList`,
untouched since Lesson 3, still calls `loadFile` by name, which no
longer exists after this unit. One line, inside the `else` branch built
in Lesson 3's click-dispatch unit, needs to change to match:

```javascript
} else {
    item.addEventListener("click", () => {
        openFile(entryPath);   // ← changed: was loadFile(entryPath)
    });
}
```

Every other line inside `renderFileList` — the `if (entry.is_directory)`
branch, `entryPath`'s computation, `item.className` — is exactly what
Lesson 3 left in place; only the one call this unit's rename affects.

### Mechanical Walkthrough

`.find()` is an array method: it calls the function passed to it once
per item, and returns the *first* item for which that function returns
`true` — or `undefined` if none match. `(tab) => tab.path === path`
checks each tab's `path` against the one just clicked. If a match exists,
this function ends immediately (`return`) after just switching which tab
is active — no new fetch, no duplicate tab. `openTabs.push({ path:
data.path, content: data.content })` is this project's first use of
`.push()` — an array method that adds one item to the *end* of an array,
mutating it in place, unlike `.filter()`'s later habit of returning a new
array instead. The object literal passed to it, `{ path: ..., content:
... }`, is the same record shape described in the previous unit,
constructed here for the first time.

---

## Concept Unit: closing a tab

### The Problem

A tab needs to be removable — and if the one being removed is the active
one, something else has to become active instead.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, a new `closeTab` function.
- **Location** — directly after `openFile`.
- **Dependencies** — `openTabs`, `activeTabPath`.

### The New Code — type this

```javascript
function closeTab(path) {
    openTabs = openTabs.filter((tab) => tab.path !== path);

    if (activeTabPath === path) {
        activeTabPath = openTabs.length > 0 ? openTabs[openTabs.length - 1].path : null;
    }

    renderTabs();
    renderEditor();
}
```

### The Updated Project — where this lives

This is a complete, freestanding new function, placed directly after
`openFile` — nothing existing is modified, so there's no enclosing
structure to show it inside of; the block above is everything there is
to see. Nothing calls it yet — a later unit wires a close button's click
to it.

### Mechanical Walkthrough

`.filter()` is another array method: it calls the function passed to it
once per item and builds a *new* array containing only the items where
that function returned `true`. `(tab) => tab.path !== path` keeps every
tab except the one being closed. `openTabs[openTabs.length - 1]` reads a
specific array element directly by its numeric position — square
brackets after an array, with the index inside; `.length - 1` is the last
valid index, since indices start at `0`.

### SE Lens

If the closed tab wasn't the active one, nothing about `activeTabPath`
needs to change — the `if` guards against unnecessarily reassigning it.
If it *was* active, falling back to whatever tab is now last in the list
is a deliberate, simple choice — not "the most recently used tab" (which
would need its own tracking) or "the tab to its left" (which would need
knowing position, not just membership). The simplest correct behavior
that doesn't require new state is chosen over a marginally nicer one that
would.

---

## Concept Unit: two click targets that overlap

### The Problem

Each tab needs to be clickable to switch to it, *and* have its own close
button that does something different — and the close button sits
visually inside the clickable tab.

### Concept Lab — event bubbling

```html
<div id="outer" style="padding: 20px; background: lightblue;">
    outer
    <button id="inner">inner</button>
</div>

<script>
    document.getElementById("outer").addEventListener("click", () => {
        console.log("outer clicked");
    });
    document.getElementById("inner").addEventListener("click", () => {
        console.log("inner clicked");
    });
</script>
```

Click the button. The Console prints *both* lines: `"inner clicked"`,
then `"outer clicked"` — even though only the button was clicked, not the
surrounding `<div>`.

Now add one line to the inner handler:

```javascript
document.getElementById("inner").addEventListener("click", (event) => {
    event.stopPropagation();
    console.log("inner clicked");
});
```

Click the button again. Only `"inner clicked"` prints this time.

### What This Proves

A click doesn't just notify the exact element clicked — it **bubbles**
upward afterward, notifying every ancestor element that also has a click
listener, all the way up the DOM tree. This is a real, load-bearing
browser behavior, not a bug: it's what lets a single listener on a parent
handle clicks on any of its children without attaching one to each child
individually. `event` is an argument every event handler receives
automatically, describing the event that happened; `.stopPropagation()`
is a method on it that halts the bubbling — the click still fires on the
element it happened on, but ancestors never find out.

### CS Lens

An event notifying every interested ancestor in turn, with an explicit
way to stop that notification partway, isn't unique to the DOM. Also
recognized in: Android and iOS touch events, which bubble up a view
hierarchy the same way and offer the same kind of "stop here" call; a
GUI toolkit like WPF or Java Swing routing an input event through
nested containers before reaching the control that was actually
clicked; a pub/sub system with hierarchical topics, where a message
published to `orders.created.us` also reaches a subscriber listening on
the broader `orders.created` or `orders`; a DOM `KeyboardEvent`
bubbling the same way a `click` does. The shared shape: notify from the
most specific listener outward, and give the specific one a way to
claim the event before anything broader sees it.

### Discard

This code is deleted now — `outer` and `inner` never appear in the
project. The real tab bar has exactly this shape: a tab element with a
click handler, containing a close button with its own click handler.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, a new `renderTabs` function.
- **Location** — directly after `closeTab`.
- **Dependencies** — `openTabs`, `activeTabPath`, `closeTab`,
  `document.createElement`/`.appendChild` from Lesson 2.

### The New Code — type this

`renderTabs` is a brand-new function — nothing existing is being modified
— so unlike a small fragment dropped into existing code, the whole thing
needs building. The one piece that's genuinely new *behavior*, though, is
the close button — everything around it reuses shapes already taught:

```javascript
const closeButton = document.createElement("span");
closeButton.textContent = "x";
closeButton.className = "tab-close";
closeButton.addEventListener("click", (event) => {
    event.stopPropagation();
    closeTab(tab.path);
});
tabElement.appendChild(closeButton);
```

### The Updated Project — where this lives

Now see it in place, as the complete new function:

```javascript
function renderTabs() {
    const tabBar = document.getElementById("tab-bar");
    tabBar.textContent = "";

    openTabs.forEach((tab) => {
        const tabElement = document.createElement("div");
        tabElement.className = tab.path === activeTabPath ? "tab active" : "tab";
        tabElement.addEventListener("click", () => {
            activeTabPath = tab.path;
            renderTabs();
            renderEditor();
        });

        const label = document.createElement("span");
        label.textContent = tab.path;
        tabElement.appendChild(label);

        const closeButton = document.createElement("span");           // ← new
        closeButton.textContent = "x";                                 // ← new
        closeButton.className = "tab-close";                           // ← new
        closeButton.addEventListener("click", (event) => {             // ← new
            event.stopPropagation();                                   // ← new
            closeTab(tab.path);                                        // ← new
        });                                                             // ← new
        tabElement.appendChild(closeButton);                           // ← new

        tabBar.appendChild(tabElement);
    });
}
```

Nothing calls `renderTabs` yet from anywhere new in this file — it's
already being called from inside `openFile`, built in the previous unit,
which is what will actually run it once both functions exist.

### Mechanical Walkthrough

`document.getElementById("tab-bar")` and `tabBar.textContent = ""` reuse
the exact lookup-and-clear pattern `renderFileList` used on `#file-list`
in Lesson 2, now against a different element. `openTabs.forEach((tab) =>
{ ... })` is the same array method from Lesson 2, iterating the
collection this lesson introduced instead of the backend's `entries`.
`document.createElement("div")` reuses `createElement` from Lesson 2,
building a `<div>` instead of an `<li>`. `tabElement.className = tab.path
=== activeTabPath ? "tab active" : "tab"` combines two already-taught
pieces — the ternary from Lesson 2, and `.className` assignment from the
same lesson — in a new way worth a clause: the string assigned is two
space-separated CSS classes, `"tab active"`, not one, when this tab is
the active one; a single `.className` assignment can carry as many
classes as fit in the string, space-separated. `tabElement.addEventListener("click",
() => { ... })` reuses `addEventListener` from Lesson 2 to switch which
tab is active, re-render the tab bar, and re-render the editor — the same
three-call pattern `openFile` used when it found an existing tab.
`document.createElement("span")` and `label.textContent = tab.path`
reuse the same construction pattern a second time for a different
element. `tabElement.appendChild(label)` reuses `appendChild` from
Lesson 2. Then the new code from this unit: `document.createElement("span")`
for `closeButton`, its `.textContent`/`.className` set the same reused
way, and `.addEventListener("click", (event) => { ... })` — the first
time this project's event handler has actually used the `event` argument
handed to every listener automatically. `event.stopPropagation()` is new:
without it, clicking the close button would fire *both* handlers —
`closeTab` (removing the tab) and, via bubbling, `tabElement`'s own click
handler (setting `activeTabPath` to the tab that just got removed) —
leaving `activeTabPath` pointing at a tab that no longer exists. This is
the exact bug the concept lab demonstrated, now with a real, breaking
consequence if left out. `tabElement.appendChild(closeButton)` and, at
the end of the loop, `tabBar.appendChild(tabElement)` both reuse
`appendChild` again to finish assembling and inserting each tab.

---

## Concept Unit: showing the active tab's content

### The Problem

Only one tab's content should be visible in the editor at a time — the
active one — and there needs to be a distinct empty state when no tabs
are open at all.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, a new `renderEditor` function.
- **Location** — directly after `renderTabs`.
- **Dependencies** — `#editor-empty` and `#editor-pane`, two `<div>`
  elements already added to the page body alongside the tab bar.

### The New Code — type this

```javascript
function renderEditor() {
    const emptyState = document.getElementById("editor-empty");
    const editorPane = document.getElementById("editor-pane");

    if (activeTabPath === null) {
        emptyState.style.display = "block";
        editorPane.style.display = "none";
        return;
    }

    const activeTab = openTabs.find((tab) => tab.path === activeTabPath);
    emptyState.style.display = "none";
    editorPane.style.display = "block";
    document.getElementById("file-content").value = activeTab.content;
    document.getElementById("save-status").textContent = "";
}
```

### The Updated Project — where this lives

This is a complete, freestanding new function, placed directly after
`renderTabs` — nothing existing is modified, so there's no enclosing
structure to show it inside of; the block above is everything there is
to see. It's already being called from both `openFile` and the tab-click
handler inside `renderTabs`, built in earlier units — this is the last
piece needed before either of those can actually run without erroring.

### Mechanical Walkthrough

This reuses `.style.display` toggling from Lesson 3 — nothing new in the
mechanism, only in the decision it's making: with no active tab, show the
empty-state message and hide the editor entirely; with one, do the
reverse and fill the `<textarea>` from that specific tab's `content`,
found the same way `openFile` found an existing tab.

---

## Concept Unit: typing without losing it when you switch tabs

### The Problem

If a tab's `content` only updates when you click Save, switching to
another tab and back would discard whatever you'd typed but not yet
saved.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, a new event listener at the bottom of the
  `<script>` block, alongside the existing save-button listener.
- **Dependencies** — `openTabs`, `activeTabPath`.

### The New Code — type this

```javascript
document.getElementById("file-content").addEventListener("input", () => {
    if (activeTabPath === null) {
        return;
    }
    const activeTab = openTabs.find((tab) => tab.path === activeTabPath);
    activeTab.content = document.getElementById("file-content").value;
});
```

### The Updated Project — where this lives

Now see it in place, alongside the existing save-button listener from
Lesson 3:

```javascript
document.getElementById("save-button").addEventListener("click", saveFile);

document.getElementById("file-content").addEventListener("input", () => {   // ← new
    if (activeTabPath === null) {                                           // ← new
        return;                                                             // ← new
    }                                                                       // ← new
    const activeTab = openTabs.find((tab) => tab.path === activeTabPath);   // ← new
    activeTab.content = document.getElementById("file-content").value;     // ← new
});                                                                          // ← new
```

Both lines run immediately when the script loads, registering two
independent listeners on two different elements — the save button's
click listener from Lesson 3 is untouched; this is a second, new
listener on the `<textarea>` itself.

### Mechanical Walkthrough

`"input"` is a different event type than `"click"`, used everywhere else
so far — it fires on every keystroke that changes a text input's value,
not on a discrete click. Each time it fires, this finds the currently
active tab's record and overwrites its `content` directly with whatever
the textarea now holds — keeping the in-memory tab state continuously
current, so switching tabs is purely a *read* from `openTabs` in
`renderEditor`, never a place where unsaved typing could be lost.

---

## Concept Unit: saving the tab that's actually active

### The Problem

Save needs to write the *active* tab's content — not a single
global path the way Lesson 3's `saveFile` assumed.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — replace. `saveFile`'s first two lines change; a new
  line is added inside the success callback.
- **Location** — same `saveFile` function from Lesson 3.
- **Dependencies** — `activeTabPath`, `openTabs`.

### The New Code — type this

The guard clause goes at the very top of the function, before anything
else runs:

```javascript
if (activeTabPath === null) {
    return;
}
```

And a second, separate addition goes inside the success callback, after
the fetch itself succeeds:

```javascript
const activeTab = openTabs.find((tab) => tab.path === activeTabPath);
activeTab.content = content;
```

### The Updated Project — where this lives

Now see both pieces in place, inside Lesson 3's `saveFile`:

```javascript
function saveFile() {
    if (activeTabPath === null) {                                   // ← new
        return;                                                      // ← new
    }                                                                 // ← new

    const content = document.getElementById("file-content").value;

    fetch("http://127.0.0.1:8000/file?path=" + encodeURIComponent(activeTabPath), {  // ← changed: was `path`
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: content }),
    })
        .then((response) => response.json())
        .then((data) => {
            const activeTab = openTabs.find((tab) => tab.path === activeTabPath);  // ← new
            activeTab.content = content;                              // ← new
            document.getElementById("save-status").textContent = "Saved.";
        })
        .catch((error) => {
            document.getElementById("save-status").textContent = "Could not save.";
        });
}
```

`saveFile` now saves whichever tab is actually active instead of a single
global path — everything else about it, the options object, the
`.then`/`.catch` chain, is exactly Lesson 3's version, untouched except
for that one renamed variable.

### Mechanical Walkthrough

`if (activeTabPath === null) { return; }` is the same guard-clause shape
`openFile` used earlier in this lesson, reused here for a different
reason: with no tab open at all, there's nothing for Save to do, so the
function exits before touching `document.getElementById("file-content")`
— skipping that call matters, since with no tab open the textarea would
still hold Lesson 3's original placeholder text, not real file content,
and saving it would silently overwrite a file with the wrong thing.
`encodeURIComponent(activeTabPath)` reuses `encodeURIComponent` from
Lesson 2, with `activeTabPath` — this lesson's own state — standing in
for the single global `path` Lesson 3 used to read directly. Inside the
success callback, `openTabs.find((tab) => tab.path === activeTabPath)`
reuses `.find()`, introduced earlier in this lesson, the same lookup
`renderEditor` already performs. `activeTab.content = content` is a
property assignment on the found record — the reason this line exists at
all, rather than trusting the `input` listener from the previous unit to
have already done the job, is explained next.

### SE Lens

`activeTab.content = content` after a successful save is easy to think
unnecessary — the `input` listener already keeps `content` current as you
type. It matters for a subtler reason: it guarantees the in-memory tab
and the just-confirmed-saved-on-disk version are byte-for-byte the same
value at the moment `"Saved."` appears, rather than trusting two separate
code paths to have already agreed by coincidence.

---

## Connect the pieces

```
Click "src/main.py" in sidebar → openFile("src/main.py")
              ↓
.find() checks openTabs for an existing match → none found
              ↓
GET /file?path=src/main.py → openTabs.push({ path, content })
              ↓
activeTabPath set → renderTabs() draws the tab bar → renderEditor() fills the textarea
              ↓
Type in the textarea → "input" event → activeTab.content updated in place
              ↓
Click a second file → same openFile flow → second tab added, first tab's edits preserved in openTabs
              ↓
Click back to the first tab → renderEditor() reads its content from openTabs → unsaved edit still there
              ↓
Click Save → saveFile() writes activeTabPath's content → PUT /file → activeTab.content confirmed in sync
              ↓
Click the second tab's close button → stopPropagation() prevents the tab-switch handler from also firing
              ↓
closeTab() filters it out of openTabs → renderTabs()/renderEditor() redraw from what's left
```

## What breaks without this

Comment out `event.stopPropagation()` in the close button's handler,
reload, open two tabs, and click the second tab's close `x`. Both
handlers fire: `closeTab` removes the tab correctly, but the bubbled
click also reaches `tabElement`'s own listener and sets `activeTabPath`
back to the path that was just removed — `renderEditor` then calls
`.find()` for a tab that no longer exists, and `activeTab` comes back
`undefined`, with `activeTab.content` throwing immediately afterward.
This is worth causing on purpose and reading the actual Console error,
then restoring `stopPropagation()`.

## Exercises

1. Open three tabs, edit two of them without saving, close the active
   one, and confirm the correct remaining tab becomes active.
2. Cause the `stopPropagation()` bug on purpose as described above and
   read the real error in the Console.
3. In the event bubbling lab, add a third, even-more-outer `<div>`
   wrapping `#outer`, with its own click listener. Predict how many lines
   print on a button click, with and without `stopPropagation()`, before
   running it.

## Definition of done

- [ ] You've opened multiple tabs, edited more than one without saving,
      and confirmed switching between them preserves each one's edits
- [ ] You've caused the `stopPropagation()` bug yourself and read the
      real error
- [ ] You can explain the difference between `.find()` and `.filter()` —
      what each returns and when you'd reach for one over the other
- [ ] You can explain why `activeTabPath` starts as `null` rather than
      `""`
- [ ] `git commit` this lesson's code with a message explaining why
