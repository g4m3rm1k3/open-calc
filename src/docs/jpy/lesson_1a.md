# Lesson 1a: Nesting Elements — the First Real Tree

**What you will build:** `Element` gains a `children` list, and
`render()` learns to call itself on each child — so a `div` containing
an `h1` and a `p` renders as real nested HTML, at any depth. The
transferable problem: every UI you'll ever describe is a *tree*, not a
flat list — a page is boxes containing boxes containing text. This
lesson is where `Element` stops being a single tag and starts being
able to represent an actual page structure.

**What you need to know first:** Lesson 0b — `Element`'s `__init__`,
instance attributes, and `render()` as a method. This lesson adds to
that class; it doesn't replace anything about how it works.

**Pipeline:** Still

```
Python Component → render() → HTML string → Flask response → Browser
```

This lesson touches **Component** and **render()** again — `Element`
itself is changing, and so is what `render()` has to do. One concrete
value carried through every stage, before and after:

| Stage | Before (0b) | After (1a) |
|---|---|---|
| Component | `Element("h1", "Hello from Flask")` | `Element("div", children=[Element("h1", "Hello from Flask"), Element("p", "This paragraph is a child element.")])` |
| render() | `"<h1>Hello from Flask</h1>"` | `"<div><h1>Hello from Flask</h1><p>This paragraph is a child element.</p></div>"` |
| HTML string | `"<h1>Hello from Flask</h1>"` | `"<div>...</div>"`, above |
| Flask response | 200 OK, that string | 200 OK, the new string |
| Browser | one heading | one heading and one paragraph, inside a div |

---

## Concept Unit: Default Parameter Values

### The Problem

Every call to `Element(...)` so far has required exactly two
arguments, `tag` and `text`. We want to add a third thing, `children`
— but we don't want to force every *existing* call in the project to
suddenly start passing an empty list it doesn't care about.

### Introduce the Concept in Isolation

```python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Ana"))
print(greet("Ana", "Hi"))
```

Run:

```
Hello, Ana!
Hi, Ana!
```

Calling `greet("Ana")` with only one argument still works — `greeting`
falls back to `"Hello"`. Calling it with two arguments overrides that
fallback. This is called a **default parameter value**: a value a
parameter takes on automatically when the caller doesn't supply one.

### Discard

`u1_l1a.py` is deleted.

---

## Concept Unit: The Mutable Default Argument Trap (and the Fix)

### The Problem

The obvious way to give `children` a default is `children=[]`, so
callers who don't care about children get an empty list automatically.
That specific pattern hides a real, well-known Python bug.

### Introduce the Concept in Isolation

```python
def add_item(item, bucket=[]):
    bucket.append(item)
    return bucket

print(add_item("a"))
print(add_item("b"))
```

Run:

```
['a']
['a', 'b']
```

That second call should arguably print `['b']` — a fresh bucket,
since no bucket was passed either time. It doesn't. Python evaluates a
default value **once**, when the function is *defined*, not once per
call — so every call that omits `bucket` is silently sharing and
mutating the exact same list. This is the **mutable default argument
trap**.

The fix: default to `None` (immutable, safe to share) and build the
real list *inside* the function body when needed:

```python
def add_item(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket

print(add_item("a"))
print(add_item("b"))
```

Run:

```
['a']
['b']
```

Now each call that omits `bucket` gets its own fresh list, because the
`[]` is created fresh *inside* the function body every time it runs —
not once, at definition time.

### Discard

`u2_l1a.py` and `u2b_l1a.py` are both deleted. Both versions existed
only to prove the trap and its fix side by side.

---

## Concept Unit: Recursion — a Method Calling Itself Through Its Own Children

### The Problem

`render()` currently only knows how to describe its own tag and text.
It has no way to include a child's HTML — and a child might itself
have children, arbitrarily deep. We need `render()` to somehow include
the result of calling `render()` again, on each child, however deep
that goes.

### Introduce the Concept in Isolation

```python
class Box:
    def __init__(self, label, children=None):
        self.label = label
        self.children = children if children is not None else []

    def describe(self):
        inner = ""
        for child in self.children:
            inner += child.describe()
        return f"[{self.label}{inner}]"

leaf = Box("leaf")
print("no nesting:      ", leaf.describe())

root = Box("root", [leaf])
print("one level deep:  ", root.describe())

mid = Box("mid", [leaf])
outer = Box("outer", [mid])
print("two levels deep: ", outer.describe())
```

Run:

```
no nesting:       [leaf]
one level deep:   [root[leaf]]
two levels deep:  [outer[mid[leaf]]]
```

`describe()` calls `.describe()` on each of its own children — which,
if those children have children of their own, means `.describe()`
keeps calling itself, one level deeper each time, automatically. This
is called **recursion**: a method whose own body calls that same
method again, on different objects, until it hits an object with no
children to recurse into — the **base case** — which is exactly why
`leaf.describe()` alone doesn't loop forever: its `children` list is
empty, so its `for` loop simply does nothing and returns immediately.

### Discard

`u3_l1a.py` is deleted. `Box`/`describe` were never real project
concepts — they existed only to prove that a method calling itself
through nested children, at increasing depth, produces correctly
nested output and terminates on its own.

### Project Change

- **Reference Source:** No reference counterpart — from scratch.
- **Files affected:** `app.py` (modify)
- **Change type:** replace (`Element.__init__` and `Element.render`),
  replace (`index()`'s body)
- **Location:** the `Element` class and `index()` function added in
  Lesson 0b.
- **Dependencies:** none beyond this lesson's own prior two units.

### The New Code — type it yourself

```python
class Element:
    def __init__(self, tag, text="", children=None):
        self.tag = tag
        self.text = text
        self.children = children if children is not None else []

    def render(self):
        children_html = ""
        for child in self.children:
            children_html += child.render()
        return f"<{self.tag}>{self.text}{children_html}</{self.tag}>"
```

Then `index()`:

```python
def index():
    heading = Element("h1", "Hello from Flask")
    paragraph = Element("p", "This paragraph is a child element.")
    container = Element("div", children=[heading, paragraph])
    return container.render()
```

### The Updated Project

```python
from flask import Flask

app = Flask(__name__)

class Element:
    def __init__(self, tag, text="", children=None):    # ← changed
        self.tag = tag
        self.text = text
        self.children = children if children is not None else []    # ← new

    def render(self):
        children_html = ""                                # ← new
        for child in self.children:                        # ← new
            children_html += child.render()                  # ← new
        return f"<{self.tag}>{self.text}{children_html}</{self.tag}>"    # ← changed

@app.route("/")
def index():
    heading = Element("h1", "Hello from Flask")                        # ← new
    paragraph = Element("p", "This paragraph is a child element.")     # ← new
    container = Element("div", children=[heading, paragraph])          # ← new
    return container.render()                                           # ← changed

if __name__ == "__main__":
    app.run(debug=True)
```

`Element` can now represent an actual tree, not just one tag, and
`render()` walks that whole tree, however deep it goes, producing one
complete nested HTML string.

### Mechanical Walkthrough

- `def __init__(self, tag, text="", children=None):` — **(b) hard
  concept reappearing** (default parameter values, just proven) for
  `text=""` and `children=None` both. Worth noting: `text=""` is
  perfectly safe as a plain default with no trap, because strings are
  immutable — nothing about `text` can be mutated in place the way the
  `bucket` list was. The trap is specific to mutable defaults like
  lists and dicts.
- `self.children = children if children is not None else []` — **(b)
  hard concept reappearing.** The exact `None`-default fix just proven
  — build a fresh list inside `__init__`, only when the caller didn't
  supply one.
- `children_html = ""` — **(c) already basic.** A plain string
  variable, initialized empty, about to be built up.
- `for child in self.children:` — **(c) already basic.** An ordinary
  `for` loop over a list — the loop itself isn't new; what's new is
  what happens inside it.
- `children_html += child.render()` — **(a) first appearance** of the
  actual recursive call, though the *mechanism* — a method calling
  itself through nested children — was just proven with `Box.describe`
  above. Every iteration calls `.render()` on a child `Element`, which
  may itself have children and recurse further, before returning a
  string that gets appended here.
- `f"<{self.tag}>{self.text}{children_html}</{self.tag}>"` — **(c)
  already basic** as an f-string; the only change from Lesson 0b is one
  more value, `children_html`, interpolated alongside the existing two.
- `container = Element("div", children=[heading, paragraph])` — **(c)
  already basic.** A keyword argument (`children=...`) skipping past
  the positional `text` parameter to use its default — ordinary Python
  call syntax, not new to this project.

### Execution Trace

Tracing `container.render()` for the real tree built in `index()`:

1. `container.render()` starts. `self.tag = "div"`, `self.text = ""`,
   `self.children = [heading, paragraph]`. `children_html` starts as
   `""`.
2. Loop iteration 1: `child = heading`. `heading.render()` runs — its
   own `self.children` is `[]` (never passed), so *its* loop body never
   executes, and it returns `"<h1>Hello from Flask</h1>"` immediately.
   `children_html` becomes that string.
3. Loop iteration 2: `child = paragraph`. Same shape: `paragraph`'s
   `children` is empty, so `paragraph.render()` returns
   `"<p>This paragraph is a child element.</p>"` directly.
   `children_html` becomes the concatenation of both children's HTML.
4. `container.render()`'s own `for` loop ends (only two children).
   `self.text` is `""` (the container itself carries no direct text),
   so the final f-string is `"<div>"` + `""` + `children_html` +
   `"</div>"` — the two children's HTML, wrapped in the container's own
   tag.

### CS Lens

A method calling itself on smaller pieces of the same structure until
it reaches a piece with nothing left to recurse into is **recursion
over a tree**. Also recognized in: file-system directory listings
(`os.walk`, recursively descending into subdirectories), a JSON
parser recursively parsing nested objects and arrays, a compiler's
syntax tree being walked node by node, and a real browser's DOM
render tree — the exact structure this project is heading toward
building.

### SE Lens

The alternative not chosen: keep `render()` non-recursive, and have
some *other*, separate piece of code walk the whole tree externally,
calling `.render()` on each `Element` itself and stitching the strings
together by hand outside the class. The tradeoff: that would keep
`Element` "simpler" in isolation, but it would mean *every* piece of
code that ever wants to render a tree has to reimplement the same
walking logic — and `Element` itself would no longer be a
self-contained thing that knows how to describe itself, breaking the
same encapsulation idea Lesson 0b built `render()` around in the first
place. Recursion costs a moment of "wait, doesn't this call itself
forever?" the first time you read it — it doesn't, because of the base
case an empty `children` list naturally provides.

### Run It

```
$ curl -s http://127.0.0.1:5000/
<div><h1>Hello from Flask</h1><p>This paragraph is a child element.</p></div>
```

Matches the traced output exactly, confirmed by actually running the
server and requesting it.

### Connect

`Element` can now represent real page structure, not just one tag —
every future concept (attributes, event handlers, diffing) will be
built on top of a tree that already knows how to render itself,
however deep it is.

---

## Closing

### Connect the Pieces

Already traced in full above (Execution Trace) — from `container`'s
construction, through both children's independent `render()` calls,
to the final nested string `index()` returns.

### What Breaks Without This

Reintroducing the mutable-default trap directly into a copy of
`Element`, on purpose:

```python
class BrokenElement:
    def __init__(self, tag, text="", children=[]):  # the trap, reintroduced
        self.tag = tag
        self.text = text
        self.children = children

a = BrokenElement("span", "first")
b = BrokenElement("span", "second")

a.children.append("oops")

print("a.children:", a.children)
print("b.children:", b.children)
```

Real output:

```
a.children: ['oops']
b.children: ['oops']
```

`b` never touched `a`, and never had anything appended to it directly
— yet it silently gained `a`'s appended child, because both instances
were sharing the exact same default list object. In a real app, this
is the kind of bug that shows up as "unrelated components mysteriously
showing each other's content" — exactly the shared-default trap the
`None` fix exists to prevent.

### Exercises

- Add a third child to `container` — another `Element("p", ...)` — and
  confirm it shows up in the right place in the rendered HTML.
- Build a three-level-deep tree in a scratch script (not `app.py`) —
  a `div` containing a `div` containing an `h1` — and confirm
  `render()` handles it with no changes to `Element` itself.

### Definition of Done

- [ ] `Element.__init__` accepts `text=""` and `children=None`, with
      the `None`-default fix applied — not `children=[]`.
- [ ] `Element.render()` recursively renders every child before
      wrapping its own tag around the result.
- [ ] `curl http://127.0.0.1:5000/` returns the correct nested HTML,
      confirmed by actually running it.
- [ ] The mutable-default bug was reproduced on purpose in a throwaway
      class, confirmed with real output, and is *not* present in the
      real `Element`.
- [ ] Committed with a message explaining *why*: something like
      `"Give Element a children list and make render() recursive, so
      it can represent a real page tree instead of one tag"` — not
      `"add children support"`.
