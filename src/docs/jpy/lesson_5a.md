# Lesson 5a: The Patch Applier — Turning Patches Into Real DOM Changes

**What you will build:** A small, fixed piece of JavaScript —
`getNodeByPath`, `applyPatch`, and `applyPatches` — that takes the
exact patch format Lesson 4b/4c's `diff()` already produces, and
mutates a real browser DOM to match. This is the first JavaScript
written for this project. Verified against a genuine headless Chromium
browser via Playwright, not a simulation — every result below is real
DOM state, before and after.

**What you need to know first:** Lessons 4a–4c — the patch format
(`type`, `path`, and per-type fields like `text`/`attrs`/`tag`), and
specifically that `path` is a list of child indices from the root,
exactly as proven in 4b's `get_by_path` lab. This lesson builds the
JavaScript-side twin of that same idea.

**Pipeline:** The full pipeline now has a real client-side stage:

```
Old Component + New Component → diff() → Patch List → applyPatches() → Real DOM
```

One concrete value carried through every stage, this lesson using the
real `Page(state)` structure:

| Stage | Value |
|---|---|
| Old Component | `Page(state)` with `state.count == 0` |
| New Component | `Page(state)` with `state.count == 1` |
| Patch List | `[{"type": "update_text", "path": [2], "text": "Count: 1"}]` — real Python `diff()` output |
| applyPatches() | walks the list, calls `applyPatch` once |
| Real DOM | the counter `<p>`'s actual `textContent` becomes `"Count: 1"`, confirmed in a real browser |

---

## Concept Unit: Locating a DOM Node by Path

### The Problem

`diff()` already addresses every patch with a `path` — a list of
child indices. Nothing yet can take that same path and find the
*actual* corresponding element in a real page.

### Introduce the Concept in Isolation

A real page:

```html
<div id="root">
  <h1>Hello</h1>
  <p>World</p>
</div>
```

```javascript
function getNodeByPath(root, path) {
    let node = root;
    for (const index of path) {
        node = node.children[index];
    }
    return node;
}
```

Run in a real headless browser, looking up both children of `#root`:

```json
{
  "path0": { "tag": "H1", "text": "Hello" },
  "path1": { "tag": "P", "text": "World" }
}
```

Exactly the same idea as `get_by_path` from Lesson 4b's Python lab —
`node.children[index]`, repeated once per index in the path — except
`node.children` here is a real, live DOM API returning the actual
element nodes in the page, not a Python tuple.

### Discard

`u1_l5a.html` and `u1_l5a_test.js` are deleted.

---

## Concept Unit: Mutating a Node — `update_text` and `update_attrs`

### The Problem

Finding a node is only half the job. Once found, `applyPatch` needs to
actually change it according to what the patch says.

### Introduce the Concept in Isolation

Starting from the real rendered page (the exact HTML Lesson 1b's
`Element.render()` would produce for `Page(state)`):

```html
<div id="root">
  <h1>Hello from Flask</h1>
  <p id="intro">This paragraph is a child element.</p>
  <p>Count: 0</p>
</div>
```

```javascript
function applyPatch(root, patch) {
    const node = getNodeByPath(root, patch.path);

    if (patch.type === "update_text") {
        node.textContent = patch.text;
    } else if (patch.type === "update_attrs") {
        for (const [key, value] of Object.entries(patch.attrs)) {
            node.setAttribute(key, value);
        }
    }
}
```

Applying `{type: "update_text", path: [2], text: "Count: 1"}` and
`{type: "update_attrs", path: [1], attrs: {id: "intro-updated"}}`,
real before/after DOM:

```
BEFORE:
<h1>Hello from Flask</h1>
<p id="intro">This paragraph is a child element.</p>
<p>Count: 0</p>

AFTER:
<h1>Hello from Flask</h1>
<p id="intro-updated">This paragraph is a child element.</p>
<p>Count: 1</p>
```

Both patches applied correctly, confirmed by reading the real DOM's
`innerHTML` before and after, in a real browser page.

### Discard

`u2_l5a.html` and `u2_l5a_test.js` are deleted.

---

## Concept Unit: Structural Patches — `insert`, `remove`, `replace`

### The Problem

`update_text` and `update_attrs` mutate a node that already exists.
`insert`, `remove`, and `replace` change *which* nodes exist at all —
which means operating on a node's *parent*, not the node itself
(`remove` is the one exception — it only needs the node itself).

### Introduce the Concept in Isolation

```html
<ul id="root">
  <li>A</li>
  <li>B</li>
</ul>
```

```javascript
function getParentAndIndex(root, path) {
    const parentPath = path.slice(0, -1);
    const index = path[path.length - 1];
    const parent = parentPath.length === 0 ? root : getNodeByPath(root, parentPath);
    return { parent, index };
}

function createElement(tag, text, attrs) {
    const el = document.createElement(tag);
    el.textContent = text || "";
    for (const [key, value] of Object.entries(attrs || {})) {
        el.setAttribute(key, value);
    }
    return el;
}
```

Extending `applyPatch` with three more branches:

```javascript
if (patch.type === "replace") {
    const { parent, index } = getParentAndIndex(root, patch.path);
    const newEl = createElement(patch.tag, patch.text, patch.attrs);
    parent.children[index].replaceWith(newEl);
}
if (patch.type === "insert") {
    const { parent, index } = getParentAndIndex(root, patch.path);
    const newEl = createElement(patch.tag, patch.text, patch.attrs);
    const referenceNode = parent.children[index] || null;
    parent.insertBefore(newEl, referenceNode);
}
if (patch.type === "remove") {
    getNodeByPath(root, patch.path).remove();
}
```

`insert` at `[2]` (`{tag: "li", text: "C"}`) and `remove` at `[0]`,
real before/after:

```
BEFORE:
<li>A</li>
<li>B</li>

AFTER (inserted C at end, removed A):
<li>B</li>
<li>C</li>
```

`replace` at `[0]` (swapping a `<li>` for a completely different
`<span>`), real before/after:

```
BEFORE:
<li>A</li>
<li>B</li>

AFTER (li replaced with span):
<span>Replaced</span>
<li>B</li>
```

### Discard

`u3_l5a.html` and its test scripts are deleted — the real,
consolidated version below is the actual project file.

### Project Change

- **Reference Source:** No reference counterpart — from scratch.
- **Files affected:** `applyPatches.js` (new — the project's first
  JavaScript file)
- **Change type:** add
- **Location:** n/a — new file
- **Dependencies:** `diff()`'s patch format from Lessons 4b/4c.

### The New Code — type it yourself

The full, consolidated applier, combining all three concept units:

```javascript
function getNodeByPath(root, path) {
    let node = root;
    for (const index of path) {
        node = node.children[index];
    }
    return node;
}

function getParentAndIndex(root, path) {
    const parentPath = path.slice(0, -1);
    const index = path[path.length - 1];
    const parent = parentPath.length === 0 ? root : getNodeByPath(root, parentPath);
    return { parent, index };
}

function createElement(tag, text, attrs) {
    const el = document.createElement(tag);
    el.textContent = text || "";
    for (const [key, value] of Object.entries(attrs || {})) {
        el.setAttribute(key, value);
    }
    return el;
}

function applyPatch(root, patch) {
    if (patch.type === "update_text") {
        getNodeByPath(root, patch.path).textContent = patch.text;
        return;
    }
    if (patch.type === "update_attrs") {
        const node = getNodeByPath(root, patch.path);
        for (const [key, value] of Object.entries(patch.attrs)) {
            node.setAttribute(key, value);
        }
        return;
    }
    if (patch.type === "replace") {
        const { parent, index } = getParentAndIndex(root, patch.path);
        const newEl = createElement(patch.tag, patch.text, patch.attrs);
        parent.children[index].replaceWith(newEl);
        return;
    }
    if (patch.type === "insert") {
        const { parent, index } = getParentAndIndex(root, patch.path);
        const newEl = createElement(patch.tag, patch.text, patch.attrs);
        const referenceNode = parent.children[index] || null;
        parent.insertBefore(newEl, referenceNode);
        return;
    }
    if (patch.type === "remove") {
        getNodeByPath(root, patch.path).remove();
        return;
    }
}

function applyPatches(root, patches) {
    for (const patch of patches) {
        applyPatch(root, patch);
    }
}
```

### The Updated Project

`applyPatches.js` is a brand-new file — nothing surrounds it yet
(Project Change already covers this: a new file has nothing to locate
a position within). The full listing above *is* the file.

### Mechanical Walkthrough

- `for (const index of path)` — **(a) first appearance** of a
  JavaScript `for...of` loop; behaves the same as Python's `for x in
  ...` — iterating values directly, not indices.
- `node.children[index]` — **(b) hard concept reappearing** — the
  exact path-navigation idea proven in the first lab, now against a
  real live DOM tree instead of a Python data structure.
- `path.slice(0, -1)` — **(a) first appearance.** JavaScript's
  `.slice(0, -1)` returns every element except the last — "the path to
  this node's *parent*," stripping off the final index, which
  identifies the node's position *within* that parent instead.
- `parentPath.length === 0 ? root : getNodeByPath(...)` — **(a) first
  appearance** of JavaScript's ternary operator (`condition ? a : b`),
  same idea as Python's `a if condition else b`. Needed because a
  top-level child's parent *is* `root` itself — an empty path can't be
  looked up with `getNodeByPath` the normal way.
- `document.createElement(tag)` — **(a) first appearance.** The real
  DOM API for constructing a brand-new element — the JavaScript-side
  counterpart to Python's `Element(tag, ...)` constructor, except this
  one produces something the browser can actually display.
- `Object.entries(patch.attrs)` — **(a) first appearance.** Converts a
  plain JS object into an array of `[key, value]` pairs — the
  JavaScript equivalent of Python's `dict.items()`, from Lesson 1b.
- `parent.children[index].replaceWith(newEl)` — **(a) first
  appearance** of `.replaceWith()`, a real DOM method that swaps one
  element for another in place, keeping its position among siblings.
- `parent.insertBefore(newEl, referenceNode)` — **(a) first
  appearance.** Inserts `newEl` immediately before `referenceNode`; if
  `referenceNode` is `null` (meaning "insert at the very end," since
  `parent.children[index]` is `undefined` past the last real index),
  `insertBefore` treats `null` as "append at the end" — a real,
  documented DOM behavior, not a special case this code has to handle
  itself.
- `node.remove()` — **(a) first appearance.** A real DOM method that
  detaches a node from its parent entirely.

### CS Lens

Walking a data structure that describes *changes* and replaying each
one against a real, mutable target is the same shape as **applying a
diff/patch file** to a real file on disk (`patch`/`git apply`), or a
database applying a write-ahead log to reach a consistent state after
a crash — a list of small, ordered operations, each one moving the
real target one step closer to the intended final state.

### SE Lens

The alternative not chosen: instead of small targeted patches, just
re-render the entire tree to a fresh HTML string and replace the whole
page's content wholesale (`root.innerHTML = newHtml`) every time
anything changes. The tradeoff: that's dramatically simpler — this
entire file wouldn't need to exist. The real cost, at scale: replacing
`innerHTML` destroys and rebuilds *every* DOM node inside it, even
unchanged ones — losing focus state on an input the user was typing
in, restarting any CSS animation, and forcing the browser to redo far
more layout/paint work than the one line that actually changed. Patch
application costs this file's worth of real complexity, in exchange
for touching only what genuinely changed — the entire reason Stage 4's
diffing exists in the first place.

One known gap, carried forward on purpose: this applier has no
handling for `"move"` patches (from Lesson 4c's keyed diffing) yet —
relocating an *existing* node to a new position without recreating it.
Every patch type this project's current, real usage actually produces
(`Page(state)`'s plain, unkeyed tree) is fully covered; keyed-list
UIs, once built, will need `"move"` support added here too.

### Run It

The full pipeline, end to end — real Python `diff()` output fed
directly into this real JavaScript applier, against a real DOM:

```
Patches from real Python diff(): [{"type":"update_text","path":[2],"text":"Count: 1"}]

BEFORE (real DOM):
<div id="root" class="container">
  <h1>Hello from Flask</h1>
  <p id="intro">This paragraph is a child element.</p>
  <p>Count: 0</p>
</div>

AFTER (real DOM, patched by real JS):
<div id="root" class="container">
  <h1>Hello from Flask</h1>
  <p id="intro">This paragraph is a child element.</p>
  <p>Count: 1</p>
</div>
```

Confirmed in a real headless Chromium browser via Playwright — the
patch Python's `diff()` actually computed for `state.count` going from
`0` to `1` was handed, unmodified, to this JavaScript, and the real DOM
changed exactly as intended, with nothing else touched.

### Connect

This is the actual client-side half of the whole project's "React
feeling" — Stage 6 will wire real browser events into sending data
back to Python, and Stage 7's Transport abstraction will decide how
patches like these actually arrive in the browser (a WebSocket
message, pywebview's bridge, or something built by hand) — but
whichever it is, `applyPatches` is what receives them.

---

## Closing

### Connect the Pieces

Trace the real end-to-end run above: `state.count` changes from `0` to
`1` in Python → `diff(Page(old_state), Page(new_state))` walks the
tree, finds the counter `<p>` at path `[2]` differs in `text`, and
returns exactly one `update_text` patch → that patch, as real JSON,
is handed to `applyPatches` → `getNodeByPath(root, [2])` walks
`root.children[2]` and finds the real counter element in the actual
page → `.textContent = "Count: 1"` mutates it directly. One value,
traced through Python, across a serialization boundary, into a real
browser's actual rendered page.

### What Breaks Without This

Using `.childNodes` (every node, including whitespace text between
tags) instead of `.children` (element nodes only) — a real, classic
DOM mistake:

```javascript
function getNodeByPathBroken(root, path) {
    let node = root;
    for (const index of path) {
        node = node.childNodes[index];   // BUG
    }
    return node;
}
```

Looking up path `[2]` — which should be the counter `<p>` — against
the real, indented HTML from earlier:

```json
{
  "nodeType": 3,
  "description": "Text node containing: \"\\n  \""
}
```

`nodeType: 3` means a **text node** — specifically, the whitespace
sitting *between* the `<p id="intro">` tag and the counter `<p>` tag
in the original indented HTML — not the counter element at all.
`.childNodes` counts that whitespace as a real child; `.children`
(what the actual applier uses) correctly counts elements only, which
is exactly why path `[2]` reliably means "the third real element,"
matching what Python's `diff()` meant by it.

### Exercises

- Add `"move"` support to `applyPatch`, using `insertBefore` to
  relocate an *existing* node (found via `from_index`) to its new
  position (`to_index`), without creating a new element.
- Feed the applier the real patches from Lesson 4c's keyed-reorder
  example (one `insert`, three `move`s) and confirm which patch types
  it currently handles correctly and which it silently ignores.

### Definition of Done

- [ ] `getNodeByPath`, `applyPatch`, and `applyPatches` all defined in
      `applyPatches.js`.
- [ ] All five patch types (`update_text`, `update_attrs`, `replace`,
      `insert`, `remove`) confirmed against a real DOM in a real
      headless browser, with real before/after HTML shown.
- [ ] The full pipeline — real Python `diff()` output, unmodified,
      applied by this real JavaScript — confirmed end to end.
- [ ] The `childNodes`-vs-`children` bug was reproduced on purpose,
      with real output showing a whitespace text node resolved instead
      of the intended element.
- [ ] Committed with a message explaining *why*: something like
      `"Add applyPatches.js, the client-side half of the diff/patch
      pipeline, so a real DOM can be updated from Python's diff()
      output without a full re-render"` — not `"add patch applier"`.
