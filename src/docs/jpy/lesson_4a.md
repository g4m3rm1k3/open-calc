# Lesson 4a: A Diffable Tree — Teaching `Element` What "Equal" Means

**What you will build:** `Element.__eq__`, so two separately-built
trees can be compared with `==` and correctly report whether they're
structurally the same — not whether they're literally the same object
in memory. The transferable problem: this is the actual foundation
Stage 4's real diffing algorithm needs. A diff has to know *whether*
two trees differ before it can figure out *where* — and right now,
`Element` can't answer even that first question correctly.

**What you need to know first:** Lesson 1a (children), Lesson 1b
(attrs), and Lesson 2a/2b (`State`, `Page(state)`). This lesson adds
one method to the same `Element` class from those lessons; nothing
about `render()` changes.

**Pipeline:** Still

```
Python Component → render() → HTML string → Flask response → Browser
```

This lesson touches **Component** again — specifically, what it means
to compare two components. No visible change to the rendered page at
all; this groundwork is invisible until the real diff (4b) uses it.

---

## Concept Unit: Default Object Equality Is Identity, Not Structure

### The Problem

To ever compare "the old tree" against "the new tree" and ask "did
anything change," we need `==` on `Element` to mean something sensible.
Does it, by default?

### Introduce the Concept in Isolation

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

p1 = Point(1, 2)
p2 = Point(1, 2)
print(p1 == p2)
print(p1 is p2)
```

Run:

```
False
False
```

`p1` and `p2` hold identical `x`/`y` values — and `p1 == p2` still
reports `False`. By default, a plain Python class's `==` falls back to
the exact same check as `is`: are these two names pointing at the
*literal same object in memory*? Nothing about the values stored
inside is considered at all.

### Discard

`u1_l4a.py` is deleted.

---

## Concept Unit: Defining `__eq__` for Structural Equality

### The Problem

For diffing, "equal" has to mean "same tag, same text, same
attributes, same children" — not "same object." We need to teach
Python a new meaning for `==`, specific to this class.

### Introduce the Concept in Isolation

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

p1 = Point(1, 2)
p2 = Point(1, 2)
print(p1 == p2)
print(p1 is p2)
```

Run:

```
True
False
```

Same two points as before — but now `p1 == p2` is `True`, because
Python calls `__eq__` (this exact method) whenever `==` is used on a
`Point` instance, instead of falling back to identity. `p1 is p2` is
still correctly `False` — they're genuinely two separate objects in
memory; only what `==` *means* changed. Defining `__eq__` to give your
own class a custom meaning for `==` is called **operator
overloading**. `__eq__` itself — a method Python calls automatically
for a built-in operator, named with leading and trailing double
underscores — is called a **dunder method**.

### Discard

`u2_l4a.py` is deleted.

### Project Change

- **Reference Source:** No reference counterpart — from scratch.
- **Files affected:** `app.py` (modify)
- **Change type:** add
- **Location:** inside the `Element` class, directly after `__init__`,
  before `render()`.
- **Dependencies:** none beyond `Element`'s existing `tag`, `text`,
  `attrs`, and `children`.

### The New Code — type it yourself

```python
def __eq__(self, other):
    if not isinstance(other, Element):
        return False
    return (
        self.tag == other.tag
        and self.text == other.text
        and self.attrs == other.attrs
        and self.children == other.children
    )
```

### The Updated Project

```python
class Element:
    def __init__(self, tag, text="", children=None, **attrs):
        self.tag = tag
        self.text = text
        self.children = children if children is not None else []
        self.attrs = attrs

    def __eq__(self, other):                                # ← new
        if not isinstance(other, Element):                     # ← new
            return False                                          # ← new
        return (                                                  # ← new
            self.tag == other.tag                                   # ← new
            and self.text == other.text                              # ← new
            and self.attrs == other.attrs                             # ← new
            and self.children == other.children                        # ← new
        )                                                             # ← new

    def render(self):
        attrs_html = ""
        for key, value in self.attrs.items():
            clean_key = key.rstrip("_")
            attrs_html += f' {clean_key}="{value}"'
        children_html = ""
        for child in self.children:
            children_html += child.render()
        return f"<{self.tag}{attrs_html}>{self.text}{children_html}</{self.tag}>"
```

`Element` now has a real, working notion of structural equality —
`render()` is completely untouched.

### Mechanical Walkthrough

- `def __eq__(self, other):` — **(b) hard concept reappearing.** The
  exact dunder method just proven with `Point`, now on the real
  project class.
- `if not isinstance(other, Element): return False` — **(a) first
  appearance** of `isinstance`. Guards against comparing an `Element`
  to something that isn't one at all (a string, `None`, a number) —
  without this, `other.tag` a few lines down would raise an
  `AttributeError` instead of a sensible `False`.
- `self.tag == other.tag` / `self.text == other.text` — **(c) already
  basic.** Plain string comparison — strings already have correct
  structural equality built in, no override needed for them.
- `self.attrs == other.attrs` — **(c) already basic**, but worth
  noting explicitly: dicts, like strings, already compare
  structurally by default — `{"id": "x"} == {"id": "x"}` is `True`
  out of the box. `Element` needed its *own* `__eq__` specifically
  because it's a custom class, unlike `dict` or `str`, which Python's
  standard library already gave sensible equality to.
- `self.children == other.children` — **(a) first appearance** of a
  genuinely elegant consequence: `children` is a plain `list` of
  `Element`s. Python's built-in list `==` compares element-by-element
  — and each of *those* elements is itself an `Element`, so comparing
  them invokes this very same `__eq__` again, recursively, for every
  node in the tree, all the way down, entirely for free.

### CS Lens

Comparing two trees for structural equality by recursively comparing
corresponding nodes is the same underlying idea as `render()`'s own
recursion from Lesson 1a — a method (here, `__eq__` via `==`) calling
the same operation on smaller pieces of the same structure. Also
recognized in: version control systems detecting that two files (or
directory trees) are identical without a byte-for-byte scan of
everything below the top, deep-equality checks in testing libraries,
and structural hashing schemes like Git's own tree objects, which
detect identical subtrees by their content rather than their location.

### SE Lens

The alternative not chosen: comparing rendered HTML strings instead of
comparing `Element` trees directly — `old_tree.render() ==
new_tree.render()`. The tradeoff: string comparison would technically
answer "did anything change" correctly too, and needs no `__eq__` at
all. But it throws away exactly the information a real diff needs
next: *where* in the tree something changed. Two long HTML strings
differing by one character tell you nothing about which node that
character belonged to; two `Element` trees, compared node by node, can
point at the exact child that changed. This lesson's `__eq__` costs a
few extra lines on `Element`; the payoff is a tree that can be compared
*structurally*, not just as flat text.

### Run It

```python
state_a = State()          # count = 0
state_b = State()          # count = 0, separate object

tree_a = Page(state_a)
tree_b = Page(state_b)

print("two separately-built trees, same state values, == :", tree_a == tree_b)
print("same trees, is (identity) :", tree_a is tree_b)

state_b.count = 1
tree_b_changed = Page(state_b)
print("after state_b.count changes to 1, == :", tree_a == tree_b_changed)
```

Real output:

```
two separately-built trees, same state values, == : True
same trees, is (identity) : False
after state_b.count changes to 1, == : False
```

Two entirely separate `Page(state)` calls, built from two separate
`State` objects, compare equal when their data matches — and correctly
stop comparing equal the moment a real change (`count` going from `0`
to `1`) happens anywhere in the tree, however deep.

### Connect

`Element` can now genuinely answer "did anything change" — the exact
question Lesson 4b's real diff algorithm needs answered, recursively,
at every node, before it can produce a list of what actually needs to
be patched in the browser.

---

## Closing

### Connect the Pieces

Trace `tree_a == tree_b_changed`, both built from `Page(state)`: `==`
calls `Element.__eq__` on the outer `div`s — `tag` and `attrs` match,
so it proceeds to `self.children == other.children`, which compares
the `heading`, `paragraph`, and `counter` `Element`s pairwise. The
first two are identical, so their own `__eq__` calls return `True`.
The third pair — the counter `Element`s — differ in `text` (`"Count:
0"` vs `"Count: 1"`), so *that* nested `__eq__` call returns `False`,
which makes the `children` list comparison `False`, which makes the
outer `div`'s `__eq__` return `False` overall — the difference,
however deep, propagates correctly all the way back up.

### What Breaks Without This

Without `__eq__`, even byte-for-byte identical trees never compare
equal:

```python
class ElementNoEq:
    def __init__(self, tag, text="", children=None, **attrs):
        self.tag = tag
        self.text = text
        self.children = children if children is not None else []
        self.attrs = attrs
    # no __eq__ defined

tree_a = ElementNoEq("div", children=[ElementNoEq("h1", "Hello")])
tree_b = ElementNoEq("div", children=[ElementNoEq("h1", "Hello")])

print("identical-content trees, == :", tree_a == tree_b)
```

Real output:

```
identical-content trees, == : False
```

Two trees with completely identical content report as different,
purely because they're two separate objects in memory. A diffing
algorithm built on top of this would conclude *everything* changed, on
every single render, no matter what — which would mean re-sending the
entire page over the wire every time, defeating the entire purpose of
diffing before it even starts.

### Exercises

- Add a `__repr__` to `Element` (returning something like
  `Element(h1, 'Hello')`) so failed equality comparisons in a debugger
  or test failure are readable, instead of showing a bare memory
  address.
- Build two `Page(state)` trees where only the `paragraph`'s `id`
  attribute differs, and confirm `__eq__` correctly reports them as
  unequal — proving attribute changes are caught, not just text
  changes.

### Definition of Done

- [ ] `Element.__eq__` compares `tag`, `text`, `attrs`, and `children`.
- [ ] Two separately-built, structurally identical trees compare
      `True` with `==` and `False` with `is`, confirmed with real
      output.
- [ ] A real state change (`count` going from `0` to `1`) is correctly
      detected by `==`, confirmed with real output.
- [ ] The no-`__eq__` failure mode was reproduced on purpose, showing
      identical trees incorrectly comparing unequal.
- [ ] Committed with a message explaining *why*: something like
      `"Add Element.__eq__ for structural equality, so trees can be
      compared for real differences instead of only by identity — the
      foundation the next lesson's diff algorithm needs"` — not `"add
      eq method"`.
