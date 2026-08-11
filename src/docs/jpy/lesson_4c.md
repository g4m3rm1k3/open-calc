# Lesson 4c: Keyed Children — Diffing Lists Correctly

**What you will build:** An optional `key` on `Element`, and a real
diffing strategy that matches children by that key instead of by raw
position — fixing the exact bug Lesson 4b's closing section reproduced
on purpose: prepending one new item made three *unchanged* items look
like they'd all been rewritten.

**What you need to know first:** Lesson 4b — `diff()`, patches, and
paths. Specifically, the reordering bug demonstrated in 4b's "What
Breaks Without This": prepending `"D"` to `[A, B, C]` produced four
patches, three of them false content changes.

**Pipeline:** Still

```
Old Component + New Component → diff() → Patch List → (eventually) Browser
```

Touching the **diff()** stage again — specifically, how it handles
children lists. One concrete value carried through: the same
prepend-`D` scenario from 4b, before and after this lesson.

| Scenario | Before (4b) | After (4c) |
|---|---|---|
| `[A, B, C]` → `[D, A, B, C]` | 4 patches: 3 *false* `update_text`, 1 `insert` | 4 patches: 1 real `insert`, 3 correctly-typed `move` — zero false content changes |

---

## Concept Unit: Giving Elements an Identity Beyond Position

### The Problem

4b's diff matches children purely by index — position 0 against
position 0, and so on. That can't distinguish "this item moved" from
"this item's content changed," because position is the *only* thing
it looks at. We need some other way to say "this specific item is the
same item as before," independent of where it currently sits.

### Introduce the Concept in Isolation

```python
old_items = [{"key": "a", "text": "Apple"}, {"key": "b", "text": "Banana"}]
new_items = [{"key": "c", "text": "Cherry"}, {"key": "a", "text": "Apple"}, {"key": "b", "text": "Banana"}]

old_by_key = {item["key"]: item for item in old_items}

for item in new_items:
    if item["key"] in old_by_key:
        print(f"{item['key']}: existing item, found by key, not by position")
    else:
        print(f"{item['key']}: brand new item")
```

Run:

```
c: brand new item
a: existing item, found by key, not by position
b: existing item, found by key, not by position
```

Even though `"c"` now sits at position 0 — where `"a"` used to be —
looking items up by their own stable `"key"` correctly identifies `a`
and `b` as pre-existing, and only `c` as genuinely new. This stable
identifier is called a **key**. React uses the exact same idea, for
the exact same reason.

### Discard

`u1_l4c.py` is deleted.

### Project Change

- **Reference Source:** No reference counterpart — from scratch. (This
  is, not coincidentally, the same purpose React's own `key` prop
  serves — nothing here is a port of React's implementation.)
- **Files affected:** `app.py` (modify)
- **Change type:** add (`key` parameter and field, new diffing
  functions), replace (`diff`'s children-handling section)
- **Location:** `Element.__init__` and `__eq__`, both from Lesson 4a;
  `diff`, from Lesson 4b.
- **Dependencies:** `diff()` and `Element` as they stood at the end of
  Lesson 4b.

### The New Code — type it yourself

`Element` gains a `key`:

```python
def __init__(self, tag, text="", children=None, key=None, **attrs):
    self.tag = tag
    self.text = text
    self.children = children if children is not None else []
    self.key = key
    self.attrs = attrs
```

And `__eq__` compares it too:

```python
def __eq__(self, other):
    if not isinstance(other, Element):
        return False
    return (
        self.tag == other.tag
        and self.text == other.text
        and self.attrs == other.attrs
        and self.key == other.key
        and self.children == other.children
    )
```

Then the actual keyed diffing logic, replacing the children-handling
part of `diff`:

```python
def diff_children(old_children, new_children, path):
    has_keys = any(child.key is not None for child in old_children + new_children)

    if not has_keys:
        return diff_children_by_index(old_children, new_children, path)

    return diff_children_by_key(old_children, new_children, path)


def diff_children_by_key(old_children, new_children, path):
    patches = []
    old_by_key = {
        child.key: (i, child)
        for i, child in enumerate(old_children)
        if child.key is not None
    }
    matched_old_indices = set()

    for new_index, new_child in enumerate(new_children):
        if new_child.key in old_by_key:
            old_index, old_child = old_by_key[new_child.key]
            matched_old_indices.add(old_index)
            if old_index != new_index:
                patches.append({
                    "type": "move", "path": path + [new_index],
                    "from_index": old_index, "to_index": new_index,
                })
            patches += diff(old_child, new_child, path + [new_index])
        else:
            patches.append({
                "type": "insert", "path": path + [new_index],
                "tag": new_child.tag, "text": new_child.text,
                "attrs": new_child.attrs, "key": new_child.key,
            })

    for old_index, old_child in enumerate(old_children):
        if old_child.key is not None and old_index not in matched_old_indices:
            patches.append({"type": "remove", "path": path + [old_index]})

    return patches
```

### The Updated Project

```python
class Element:
    def __init__(self, tag, text="", children=None, key=None, **attrs):    # ← changed
        self.tag = tag
        self.text = text
        self.children = children if children is not None else []
        self.key = key                                                      # ← new
        self.attrs = attrs

    def __eq__(self, other):
        if not isinstance(other, Element):
            return False
        return (
            self.tag == other.tag
            and self.text == other.text
            and self.attrs == other.attrs
            and self.key == other.key                                        # ← new
            and self.children == other.children
        )

    def render(self):
        # unchanged from Lesson 1b — key is diffing metadata, never rendered
        ...

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

    patches += diff_children(old.children, new.children, path)              # ← changed

    return patches

def diff_children(old_children, new_children, path):                         # ← new
    has_keys = any(child.key is not None for child in old_children + new_children)  # ← new
    if not has_keys:                                                            # ← new
        return diff_children_by_index(old_children, new_children, path)           # ← new
    return diff_children_by_key(old_children, new_children, path)                 # ← new

def diff_children_by_index(old_children, new_children, path):                 # ← new (was inline in diff)
    # exact body from Lesson 4b's diff(), unchanged

def diff_children_by_key(old_children, new_children, path):                   # ← new
    # shown above in full
```

`diff` now delegates all children-handling to `diff_children`, which
picks a strategy: the original position-based approach from 4b when no
child has a `key` at all (so every earlier lesson's diffing — `Page`,
`Heading`, `Paragraph` — is completely unaffected), or the new
key-matching approach the moment any child *does* have one.

### Mechanical Walkthrough

- `key=None` on `__init__` — **(b) hard concept reappearing** (default
  parameter value, Lesson 1a). Defaulting to `None` keeps every
  existing `Element(...)` call in this project valid with no changes.
- `self.key == other.key` in `__eq__` — **(c) already basic**
  comparison, added to keep equality consistent with the new field —
  two elements with identical content but different explicit keys are
  now correctly treated as different identities.
- `has_keys = any(child.key is not None for child in old_children +
  new_children)` — **(a) first appearance** of this specific check —
  deciding *which* diffing strategy to use, based on whether keys are
  actually in play anywhere in this particular children list.
- `old_by_key = {child.key: (i, child) for i, child in
  enumerate(old_children) if child.key is not None}` — **(b) hard
  concept reappearing** for the key-lookup pattern just proven,
  rebuilt as a real dict comprehension over `Element`s instead of
  plain dicts, storing each old child's *position* alongside itself so
  a later match can tell if it moved.
- `if old_index != new_index:` — **(a) first appearance** of the
  `"move"` patch type — a matched child whose position changed, even
  though its content didn't.
- `patches += diff(old_child, new_child, path + [new_index])` — **(c)
  already basic** as a recursive call (Lesson 4b); notice it always
  runs for a matched pair, whether or not a `"move"` patch was also
  emitted — a moved item can *also* have changed content, and both
  need reporting independently.
- The final loop, `for old_index, old_child in enumerate(old_children):
  if old_child.key is not None and old_index not in
  matched_old_indices:` — **(a) first appearance.** Anything with a
  key that was never matched to a new child is gone — a `"remove"`
  patch, at its *original* position.

### CS Lens

Matching items across two versions of a collection by a stable
identity, rather than by position, is the same idea behind **primary
keys** in a database table — a row is "the same row" across updates
because of its key, not because it happens to still be the fifth row.
Also recognized in: version control systems tracking a file's identity
across renames (Git does this by content similarity, a close cousin of
this idea), and object-identity tracking in garbage collectors, which
must recognize "the same object" across a moving/compacting collection
cycle.

### SE Lens

Being honest about a real limitation this lesson does *not* fully
solve: matching by key correctly stops false content rewrites, but the
`"move"` patches it produces aren't necessarily the *fewest possible*.
Prepending one item to a three-item list still produces one `insert`
plus three `move` patches here — because every existing item's index
genuinely did shift by one. A truly optimal algorithm (the kind real
frameworks like Vue 3 use, based on finding the *longest increasing
subsequence* of unmoved items) could recognize that zero of those three
items actually need to move in the DOM, since their *relative* order
never changed — only inserting `D` at the front does. That's a real,
known technique, deliberately out of scope here: implementing it
correctly is a meaningfully bigger undertaking, and the bug this
lesson actually needed to fix — content silently misattributed to the
wrong item — is fully fixed regardless. Correct-but-not-minimal is a
reasonable place to stop for now.

### Run It

The exact scenario from 4b's "What Breaks," now with keys:

```python
old_tree = Element("ul", children=[
    Element("li", "A", key="a"), Element("li", "B", key="b"), Element("li", "C", key="c"),
])
new_tree = Element("ul", children=[
    Element("li", "D", key="d"), Element("li", "A", key="a"),
    Element("li", "B", key="b"), Element("li", "C", key="c"),
])
patches = diff(old_tree, new_tree)
```

Real output:

```json
[
  {"type": "insert", "path": [0], "tag": "li", "text": "D", "attrs": {}, "key": "d"},
  {"type": "move", "path": [1], "from_index": 0, "to_index": 1},
  {"type": "move", "path": [2], "from_index": 1, "to_index": 2},
  {"type": "move", "path": [3], "from_index": 2, "to_index": 3}
]
```

Still four patches — but now every single one is *correct*: one real
insert, three correctly-typed moves, and critically, **zero**
`update_text` patches — `A`, `B`, and `C`'s actual content was never
touched, exactly as it should be.

A cleaner case, swapping two items with no insert or remove at all,
also confirmed with real output — two `"move"` patches, no false
content changes whatsoever. And the existing unkeyed `Page(state)`
diff (no `key` anywhere in that tree) was re-run and confirmed to
produce the exact same single `update_text` patch as Lesson 4b — fully
backward compatible.

### Connect

`diff` can now handle both the simple case (no keys, position-based,
everything from Stage 0–3) and real dynamic lists (keyed, content
correctly tracked through reordering) — the actual shape any real list
of components (rows, list items, cards) will need going forward.

---

## Closing

### Connect the Pieces

Trace the swap case: `diff_children` sees at least one `key`, so it
calls `diff_children_by_key`. `old_by_key` maps `"a"` → `(0, A)` and
`"b"` → `(1, B)`. Walking `new_children`: at `new_index=0` is `B`,
whose key `"b"` is found at `old_index=1` — different from `0`, so a
`"move"` patch is emitted, then `diff(B_old, B_new, ...)` runs and
finds no content difference. Same story for `A` at `new_index=1`,
found at `old_index=0`. No child in `old_children` is left unmatched,
so no `"remove"` patches. Two moves, zero false content changes —
exactly what actually happened.

### What Breaks Without This

Already demonstrated at length in Lesson 4b's own closing section —
the unkeyed version of this exact scenario, reproduced there with real
output, showing three false `update_text` patches. This lesson's real
output above is the direct, verified fix.

### Exercises

- Remove the middle item (`"b"`) from a keyed three-item list and
  confirm `diff` produces exactly one `"remove"` patch at the correct
  original position, with no false patches on the other two.
- Mix a content change *and* a reorder in the same diff — swap two
  items and also change one of their text — and confirm the output
  contains both a `"move"` and an `"update_text"` patch for the same
  item.

### Definition of Done

- [ ] `Element` accepts an optional `key`, defaulting to `None`, and
      `__eq__` accounts for it.
- [ ] `diff_children` picks index-based or key-based diffing
      automatically, based on whether any child has a key.
- [ ] The 4b reordering bug, re-run with keys, produces zero false
      content patches, confirmed with real output.
- [ ] A clean swap (no insert/remove) produces only `"move"` patches,
      confirmed with real output.
- [ ] Existing unkeyed diffs (`Page(state)`) still produce identical
      output to Lesson 4b, confirmed with real output — full backward
      compatibility.
- [ ] Committed with a message explaining *why*: something like
      `"Add optional Element keys and key-based child diffing, so
      reordered lists no longer misattribute content changes to the
      wrong item"` — not `"add keys"`.
