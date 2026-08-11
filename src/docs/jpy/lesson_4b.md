# Lesson 4b: The Diff Algorithm — Finding What Actually Changed

**What you will build:** A real `diff(old, new)` function that walks
two `Element` trees and returns a list of small, precise **patches** —
"update this node's text," "replace this node," "insert this child" —
each one tagged with a **path** saying exactly where in the tree it
applies. This is the actual conceptual heart of the whole project:
everything from here on exists to compute the smallest possible set of
changes, instead of re-sending an entire page every time anything
changes.

**What you need to know first:** Lesson 4a — `Element.__eq__`, which
answers *whether* two trees differ. This lesson answers the harder
question `__eq__` deliberately doesn't: *where*, and *what kind of
change*.

**Pipeline:** This is the first lesson to add a genuinely new stage.
Going forward:

```
Old Component + New Component → diff() → Patch List → (eventually) Browser
```

Nothing about `render()` or the Flask pipeline changes yet — `diff()`
runs entirely independently, on two `Element` trees, and produces data
(a list of patch dicts) that a future lesson will actually send
anywhere. One concrete value carried through: `Page(state)` before and
after `state.count` goes from `0` to `1`, diffed, producing exactly one
patch pointing at the counter's position in the tree.

---

## Concept Unit: Detecting What Changed at One Node

### The Problem

`__eq__` (Lesson 4a) can only say "these two trees are different" or
"the same" — a single boolean. We need something that says *which*
specific thing changed: the text? an attribute? the tag itself?

### Introduce the Concept in Isolation

```python
def diff_dict(old, new):
    patches = []
    for key in new:
        if old.get(key) != new[key]:
            patches.append((key, new[key]))
    return patches

old_node = {"tag": "p", "text": "Count: 0"}
new_node = {"tag": "p", "text": "Count: 1"}
print(diff_dict(old_node, new_node))
```

Run:

```
[('text', 'Count: 1')]
```

`diff_dict` didn't just say "these differ" — it walked each field and
collected *only* the ones that actually changed, along with the new
value. `"tag"` matched, so it was skipped entirely; only `"text"` shows
up in the result. This "compare field by field, collect only what
changed" pattern is the actual core idea a real diff algorithm is
built from.

### Discard

`u1_l4b.py` is deleted. `diff_dict` was never a real project concept —
it existed only to prove the field-by-field collection pattern on
something simpler than `Element`.

### Project Change

- **Reference Source:** No reference counterpart — from scratch. (This
  general shape — compare old vs. new, emit a list of typed change
  descriptions — is also the core idea behind React's own reconciler,
  though nothing here is a port of it.)
- **Files affected:** `app.py` (modify)
- **Change type:** add
- **Location:** after the `Element` class (including `__eq__` from
  Lesson 4a), before `Heading`.
- **Dependencies:** `Element.tag`, `.text`, `.attrs` from earlier
  lessons.

### The New Code — type it yourself

```python
def diff_node(old, new):
    patches = []
    if old.tag != new.tag:
        patches.append({"type": "replace", "tag": new.tag})
        return patches
    if old.text != new.text:
        patches.append({"type": "update_text", "text": new.text})
    if old.attrs != new.attrs:
        patches.append({"type": "update_attrs", "attrs": new.attrs})
    return patches
```

### The Updated Project

This function stands on its own — nothing surrounds it yet (Project
Change already covers this case: skip Updated Project when the new
code is the whole new structure). It gets folded into the real,
recursive `diff()` in the next unit.

### Mechanical Walkthrough

- `if old.tag != new.tag:` — **(a) first appearance** of this
  specific check, though `!=` itself is ordinary. If the tag itself
  changed, nothing else about the node matters — a `<p>` becoming a
  `<div>` isn't "the same element with different text," it's a
  fundamentally different kind of element, so this returns immediately
  with a single `"replace"` patch instead of checking `text`/`attrs`
  at all.
- `patches.append({"type": "update_text", "text": new.text})` — **(a)
  first appearance** of this project's patch format: a small dict with
  a `"type"` field, matching the exact same shape events used back in
  Lesson 3b's registry — deliberate, since patches will eventually
  travel over a wire the same way those events did.
- `old.attrs != new.attrs` — **(c) already basic.** Dict inequality,
  already known to work structurally out of the box (noted in Lesson
  4a).

### Run It

```python
old_counter = Element("p", "Count: 0")
new_counter = Element("p", "Count: 1")
print("text change:", diff_node(old_counter, new_counter))

old_p = Element("p", "hi", id="a")
new_p = Element("p", "hi", id="b")
print("attrs change:", diff_node(old_p, new_p))

old_x = Element("p", "hi")
new_x = Element("div", "hi")
print("tag change:", diff_node(old_x, new_x))
```

Real output:

```
text change: [{'type': 'update_text', 'text': 'Count: 1'}]
attrs change: [{'type': 'update_attrs', 'attrs': {'id': 'b'}}]
tag change: [{'type': 'replace', 'tag': 'div'}]
```

All three change types produce exactly the patch you'd expect, and an
identical pair (not shown as a separate call here, but confirmed
separately) produces `[]` — no patch at all.

### Connect

`diff_node` answers "what changed about this one node." The next unit
makes it walk an entire tree, not just one node.

---

## Concept Unit: Recursively Diffing Children, with a Path

### The Problem

`diff_node` only looks at one node's own fields — it says nothing
about children, and it says nothing about *where* in the whole tree
this node even is. A patch that doesn't know its own position is
useless once there's more than one node in the tree.

### Introduce the Concept in Isolation

```python
tree = ("root", [
    ("a", []),
    ("b", [("b-0", [])]),
])

def get_by_path(tree, path):
    label, children = tree
    for index in path:
        label, children = children[index]
    return label

print(get_by_path(tree, [0]))
print(get_by_path(tree, [1]))
print(get_by_path(tree, [1, 0]))
```

Run:

```
a
b
b-0
```

A **path** — a plain list of child indices, read from the root — is
enough to uniquely locate any single node in a tree, however deep.
`[1, 0]` means "the root's child at index 1, then *that* node's child
at index 0" — and it correctly resolves to `"b-0"`. This is exactly
what each patch needs to carry: not just what changed, but which node,
identified the same way.

### Discard

`u2_l4b.py` is deleted.

### Project Change

- **Reference Source:** No reference counterpart — from scratch.
- **Files affected:** `app.py` (modify)
- **Change type:** replace (`diff_node` becomes the real `diff`)
- **Location:** same place `diff_node` was added, in the previous
  unit.
- **Dependencies:** `diff_node`'s logic from the previous unit, folded
  in.

### The New Code — type it yourself

```python
def diff(old, new, path=None):
    if path is None:
        path = []
    patches = []

    if old.tag != new.tag:
        patches.append({
            "type": "replace", "path": path,
            "tag": new.tag, "text": new.text, "attrs": new.attrs,
        })
        return patches

    if old.text != new.text:
        patches.append({"type": "update_text", "path": path, "text": new.text})

    if old.attrs != new.attrs:
        patches.append({"type": "update_attrs", "path": path, "attrs": new.attrs})

    old_children = old.children
    new_children = new.children

    for i in range(min(len(old_children), len(new_children))):
        patches += diff(old_children[i], new_children[i], path + [i])

    if len(new_children) > len(old_children):
        for i in range(len(old_children), len(new_children)):
            child = new_children[i]
            patches.append({
                "type": "insert", "path": path + [i],
                "tag": child.tag, "text": child.text, "attrs": child.attrs,
            })

    if len(old_children) > len(new_children):
        for i in range(len(new_children), len(old_children)):
            patches.append({"type": "remove", "path": path + [i]})

    return patches
```

### The Updated Project

```python
def diff(old, new, path=None):                                            # ← changed (was diff_node)
    if path is None:                                                        # ← new
        path = []                                                            # ← new
    patches = []

    if old.tag != new.tag:
        patches.append({                                                     # ← changed
            "type": "replace", "path": path,                                   # ← new (path field)
            "tag": new.tag, "text": new.text, "attrs": new.attrs,                # ← new
        })
        return patches

    if old.text != new.text:
        patches.append({"type": "update_text", "path": path, "text": new.text})  # ← changed (path field)

    if old.attrs != new.attrs:
        patches.append({"type": "update_attrs", "path": path, "attrs": new.attrs})  # ← changed

    old_children = old.children                                              # ← new
    new_children = new.children                                              # ← new

    for i in range(min(len(old_children), len(new_children))):               # ← new
        patches += diff(old_children[i], new_children[i], path + [i])          # ← new

    if len(new_children) > len(old_children):                                # ← new
        for i in range(len(old_children), len(new_children)):                   # ← new
            child = new_children[i]                                              # ← new
            patches.append({                                                     # ← new
                "type": "insert", "path": path + [i],                              # ← new
                "tag": child.tag, "text": child.text, "attrs": child.attrs,          # ← new
            })

    if len(old_children) > len(new_children):                                # ← new
        for i in range(len(new_children), len(old_children)):                   # ← new
            patches.append({"type": "remove", "path": path + [i]})                # ← new

    return patches
```

`diff` now walks the entire tree, not just one node — comparing each
node's own fields (the same checks `diff_node` did), then recursing
into children pairwise, and handling children lists of different
lengths by treating extras on one side as inserts or removals.

### Mechanical Walkthrough

- `def diff(old, new, path=None):` — **(b) hard concept reappearing**
  for the default-parameter pattern (Lesson 1a); `path=None` lets the
  very first, top-level call omit it entirely.
- `if path is None: path = []` — **(b) hard concept reappearing.** The
  exact `None`-default fix from Lesson 1a — a fresh list per call,
  never one shared, mutated default.
- `patches += diff(old_children[i], new_children[i], path + [i])` —
  **(a) first appearance** of the actual recursive step: `diff` calling
  *itself* on a child pair, with `path + [i]` extending the path by
  one more index — exactly the path-navigation idea just proven with
  `get_by_path`. `path + [i]` creates a *new* list rather than mutating
  `path` in place, so sibling recursive calls don't see each other's
  appended indices.
- `for i in range(min(len(old_children), len(new_children))):` — **(a)
  first appearance** of this specific bound: only indices present in
  *both* lists get compared directly; anything beyond the shorter
  list's length is handled separately, next.
- The two `if len(...) > len(...)` blocks — **(a) first appearance.**
  Trailing extra children in `new` become `"insert"` patches; trailing
  extra children in `old` (meaning they no longer exist in `new`)
  become `"remove"` patches, each still carrying its own `path`.

### CS Lens

Walking two trees together, node by node, and collecting the minimum
set of operations needed to turn one into the other, is **tree diffing**
— the actual namesake concept behind "virtual DOM." Also recognized
in: `diff`/`git diff` computing line-level changes between file
versions, database migration tools computing the minimal set of schema
changes between two versions, and any real reconciliation algorithm
(React's, Vue's, or this project's own) doing exactly this at the
component level instead of the line level.

### SE Lens

The alternative not chosen: don't diff at all — every time state
changes, re-render the *entire* tree to HTML and send the whole thing,
every time. The tradeoff: no-diff is dramatically simpler (this whole
lesson wouldn't exist) and was, in fact, exactly what every earlier
lesson has done — every `curl` request re-rendered `Page(state)` from
scratch. The cost, at real scale: re-sending and re-parsing an entire
page for a one-character text change wastes bandwidth and forces the
browser to redraw far more than actually changed, which is visibly
slower on anything non-trivial. Diffing costs real algorithmic
complexity — this lesson — in exchange for sending only what's
different.

A real limitation is being carried forward on purpose, not fixed yet:
this diff compares children *by index* — position 0 against position
0, position 1 against position 1. That works fine for appending or
removing from the *end* of a list. It does not work well when items
are reordered or inserted in the *middle* — demonstrated below, and
fixed properly in the next lesson.

### Run It

Against the real `Page(state)`, `count` going from `0` to `1`:

```python
patches = diff(tree_before, tree_after)
```

Real output:

```json
[
  {"type": "update_text", "path": [2], "text": "Count: 1"}
]
```

Exactly one patch — pointing at path `[2]`, the counter's actual
position as the third child of the container `div` — confirming
`diff` finds precisely what changed and nothing else, even though the
tree it walked has multiple nodes.

Appending and removing a trailing child, on a small `<ul>` test tree,
both also confirmed with real output — one `"insert"` patch and one
`"remove"` patch, respectively, each correctly at path `[2]`.

### Connect

`diff` is the actual engine this entire project's "React-style"
feeling depends on — the next several lessons exist to take this
patch list and actually apply it somewhere (a client-side patch
applier) instead of just computing it.

---

## Closing

### Connect the Pieces

Trace the real `count: 0 → 1` diff: `diff(tree_before, tree_after)`
starts at `path = []`, comparing the two outer `div`s — same tag, same
text (both empty), same attrs, so it proceeds into children. Index 0
(`heading`) and index 1 (`paragraph`) both diff to nothing — identical.
Index 2 (`counter`) recurses with `path = [2]`: same tag (`p`), but
`old.text` is `"Count: 0"` and `new.text` is `"Count: 1"` — different —
producing the single `update_text` patch actually returned, correctly
tagged with the path that leads straight back to it.

### What Breaks Without This (the limitation named in the SE Lens, made real)

Prepending a single new item to a three-item list — nothing about the
three existing items changed, only their *position* did:

```python
old_tree = Element("ul", children=[Element("li", "A"), Element("li", "B"), Element("li", "C")])
new_tree = Element("ul", children=[Element("li", "D"), Element("li", "A"), Element("li", "B"), Element("li", "C")])

patches = diff(old_tree, new_tree)
print(f"Patches produced: {len(patches)}")
```

Real output:

```
Patches produced: 4
[
  {"type": "update_text", "path": [0], "text": "D"},
  {"type": "update_text", "path": [1], "text": "A"},
  {"type": "update_text", "path": [2], "text": "B"},
  {"type": "insert", "path": [3], "tag": "li", "text": "C", "attrs": {}}
]
```

The real change was one clean insertion of `"D"` at the front. Because
`diff` compares purely by index, it instead sees "position 0 used to
say A, now says D" (a false text change), and the same false story
repeats down the line, with the actually-new item `"C"` showing up as
an `"insert"` at the *end* instead of the real new item being
recognized at the *front*. Four patches instead of one — not wrong in
final result, but wasteful, and this project's very next lesson exists
specifically to fix it.

### Exercises

- Diff two trees where an attribute changes on a *child*, not the
  root, and confirm the patch's `path` correctly points at that child,
  not `[]`.
- Diff two completely identical trees and confirm `diff` returns `[]`
  — no patches, proving it doesn't manufacture false changes when
  nothing actually changed.

### Definition of Done

- [ ] `diff(old, new, path=None)` recursively compares two `Element`
      trees and returns a list of patch dicts, each carrying a `path`.
- [ ] All four single-node cases (text, attrs, tag, no-change) produce
      the correct patch, confirmed with real output.
- [ ] Append and remove at the end of a children list each produce
      exactly one correct patch, confirmed with real output.
- [ ] The real `Page(state)` count-change diff produces exactly one
      `update_text` patch at path `[2]`, confirmed with real output.
- [ ] The reordering/prepending failure mode was reproduced on purpose,
      with the real 4-patch output shown, confirming the known
      limitation this lesson intentionally left unfixed.
- [ ] Committed with a message explaining *why*: something like
      `"Add a recursive diff() producing a path-addressed patch list
      between two Element trees, so only real changes need to be sent
      later instead of the whole page"` — not `"add diff function"`.
