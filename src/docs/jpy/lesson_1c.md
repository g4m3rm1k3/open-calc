# Lesson 1c: Function Components — Naming and Reusing Pieces of a Tree

**What you will build:** `Heading`, `Paragraph`, and `Page` — plain
Python functions that each build and return an `Element` tree, instead
of the whole page being constructed inline inside `index()`. The
transferable problem: `index()` currently has to know the entire page's
structure, in one place, with no way to reuse a piece of it anywhere
else. This lesson doesn't add any new Python syntax at all — `Element`
itself doesn't change — it's about a design pattern: wrapping tree
construction in named, reusable, *composable* functions. This is
specifically what "component" means for the rest of this project.

**What you need to know first:** Lesson 1b — `Element` with `tag`,
`text`, `children`, and `**attrs`, fully working. This lesson uses
`Element` exactly as it already is; nothing about the class itself
changes.

**Pipeline:** Still

```
Python Component → render() → HTML string → Flask response → Browser
```

The **Component** stage is what actually changes shape this lesson —
not what it produces, but how it's built. One concrete value carried
through every stage, before and after:

| Stage | Before (1b) | After (1c) |
|---|---|---|
| Component | `Element("div", children=[Element("h1", "Hello from Flask"), Element("p", "This paragraph is a child element.", id="intro")], class_="container")`, built inline in `index()` | `Page()`, which internally calls `Heading(...)` and `Paragraph(...)` |
| render() | `'<div class="container"><h1>...</h1><p id="intro">...</p></div>'` | identical string |
| HTML string | same | same |
| Flask response | 200 OK, that string | 200 OK, the same string |
| Browser | one styled div with a heading and paragraph | the exact same page — this lesson is invisible from the browser's side |

---

## Concept Unit: Function Components — Wrapping Construction in a Named Function

### The Problem

Right now, if some other route ever wanted the exact same heading —
`Element("h1", "Hello from Flask")` — the only option is to copy that
line verbatim into that route too. There's no smaller, nameable,
reusable unit than "everything `index()` builds."

### Introduce the Concept in Isolation

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

def origin():
    return Point(0, 0)

p1 = Point(0, 0)
p2 = origin()
print(p1.x == p2.x and p1.y == p2.y)
```

Run:

```
True
```

`origin()` is a completely ordinary function — nothing about `def` or
`return` is new here — but wrapping `Point(0, 0)` inside it means
"the origin point" now has a name you can call from anywhere,
producing an object exactly as valid as one built inline. This pattern
— a function whose entire job is to construct and return an object —
is called a **factory function**. Applied specifically to building UI
trees like `Element`, this exact pattern is what **component** means
for the rest of this project.

### Discard

`u1_l1c.py` is deleted. `Point`/`origin` were never real project
concepts — they existed only to prove a factory function produces
something equivalent to inline construction.

### Project Change

- **Reference Source:** No reference counterpart — from scratch. (This
  is also, not coincidentally, exactly what a React function component
  is: a function that returns a tree, callable by name.)
- **Files affected:** `app.py` (modify)
- **Change type:** add (`Heading`, `Paragraph`), replace (`index()`'s
  body)
- **Location:** after the `Element` class from Lesson 1b, before
  `index()`.
- **Dependencies:** none beyond Lesson 1b's state.

### The New Code — type it yourself

```python
def Heading(text):
    return Element("h1", text)


def Paragraph(text, **attrs):
    return Element("p", text, **attrs)
```

### The Updated Project

```python
class Element:
    def __init__(self, tag, text="", children=None, **attrs):
        self.tag = tag
        self.text = text
        self.children = children if children is not None else []
        self.attrs = attrs

    def render(self):
        attrs_html = ""
        for key, value in self.attrs.items():
            clean_key = key.rstrip("_")
            attrs_html += f' {clean_key}="{value}"'
        children_html = ""
        for child in self.children:
            children_html += child.render()
        return f"<{self.tag}{attrs_html}>{self.text}{children_html}</{self.tag}>"

def Heading(text):                              # ← new
    return Element("h1", text)                    # ← new

def Paragraph(text, **attrs):                     # ← new
    return Element("p", text, **attrs)              # ← new

@app.route("/")
def index():
    heading = Heading("Hello from Flask")                                 # ← changed
    paragraph = Paragraph("This paragraph is a child element.", id="intro")  # ← changed
    container = Element("div", children=[heading, paragraph], class_="container")
    return container.render()
```

`index()` now calls `Heading(...)` and `Paragraph(...)` instead of
constructing `Element("h1", ...)` and `Element("p", ...)` directly —
the resulting tree is identical, but the pieces are now named and
reusable elsewhere.

### Mechanical Walkthrough

- `def Heading(text):` — **(b) hard concept reappearing.** Ordinary
  function definition syntax, already fully known — what's new is only
  the *pattern* just proven: this function's entire job is to
  construct and return an `Element`, nothing else.
- `return Element("h1", text)` — **(c) already basic.** A completely
  ordinary constructor call and return — `Element` itself hasn't
  changed since Lesson 1b.
- `def Paragraph(text, **attrs):` — **(b) hard concept reappearing**
  for the factory-function pattern; **(b) hard concept reappearing**
  again for `**attrs`, proven back in Lesson 1b, now on a plain
  function instead of a class's `__init__`.
- `return Element("p", text, **attrs)` — **(a) first appearance** of
  `**attrs` used to *forward* arguments on, rather than to collect
  them. Whatever keyword arguments `Paragraph` was called with get
  passed straight through to `Element`'s own `**attrs`, unpacked again
  — so `Paragraph("...", id="intro")` ends up calling
  `Element("p", "...", id="intro")`, exactly as if `id="intro"` had
  been written directly on the `Element` call.
- One naming note, not a syntax concept: `Heading` and `Paragraph` are
  capitalized, unlike ordinary Python functions (which convention says
  should be `snake_case`). This isn't required by Python at all — it's
  a deliberate convention this project is adopting on purpose, to make
  "this function builds and returns UI" visually distinct from an
  ordinary helper function at a glance. (It's also literally required
  syntax in real JSX-based React — lowercase names are treated as raw
  HTML tags, not components — so the convention is being adopted here
  even though nothing forces it in plain Python.)

### CS Lens

Wrapping construction behind a named, callable unit is the **factory**
pattern. Recognized in: a database ORM's `Model.objects.create(...)`
methods, GUI toolkits' widget-builder functions, and — closer to
home — every one of React's own function components, which are
exactly this same pattern applied to JSX trees instead of `Element`
trees.

---

## Concept Unit: Composition — Components Calling Other Components

### The Problem

`index()` still has to know the entire page's structure directly —
it's the one place responsible for assembling `Heading`, `Paragraph`,
and the surrounding `div` together. We want a `Page` component that
owns that assembly itself, so `index()` can just ask for "the page,"
without knowing what's inside it.

### Introduce the Concept in Isolation

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

class Line:
    def __init__(self, start, end):
        self.start = start
        self.end = end

def origin():
    return Point(0, 0)

def unit_line():
    return Line(origin(), Point(1, 1))

line = unit_line()
print(line.start.x, line.start.y, line.end.x, line.end.y)
```

Run:

```
0 0 1 1
```

`unit_line()` doesn't build a `Point` by hand for its start — it calls
`origin()`, another factory function, and uses *its* result. A factory
function calling another factory function, and combining the results
into something bigger, is called **composition**: building a larger
unit out of smaller, already-built units, rather than constructing
everything from scratch in one place.

### Discard

`u2_l1c.py` is deleted. `Point`/`Line`/`origin`/`unit_line` were never
real project concepts — they existed only to prove one factory
function can call another and combine the results.

### Project Change

- **Reference Source:** No reference counterpart — from scratch.
- **Files affected:** `app.py` (modify)
- **Change type:** add (`Page`), replace (`index()`'s body)
- **Location:** `Page` goes directly after `Paragraph`, added in the
  previous unit; `index()` is the same function from Lesson 1b.
- **Dependencies:** `Heading` and `Paragraph`, from the previous unit.

### The New Code — type it yourself

```python
def Page():
    heading = Heading("Hello from Flask")
    paragraph = Paragraph("This paragraph is a child element.", id="intro")
    return Element("div", children=[heading, paragraph], class_="container")
```

Then `index()` shrinks to:

```python
@app.route("/")
def index():
    return Page().render()
```

### The Updated Project

```python
def Heading(text):
    return Element("h1", text)

def Paragraph(text, **attrs):
    return Element("p", text, **attrs)

def Page():                                                                    # ← new
    heading = Heading("Hello from Flask")                                       # ← new
    paragraph = Paragraph("This paragraph is a child element.", id="intro")      # ← new
    return Element("div", children=[heading, paragraph], class_="container")      # ← new

@app.route("/")
def index():
    return Page().render()    # ← changed
```

`index()` no longer knows anything about headings, paragraphs, or
`div`s at all — its entire job is now "call `Page()`, render the
result." `Page()` owns the actual structure, and got there by calling
two other components and combining what they returned — the same
pattern the `Line`/`Point` lab just proved.

### Mechanical Walkthrough

- `def Page():` — **(b) hard concept reappearing.** Same
  factory-function pattern as `Heading`/`Paragraph`, taking no
  arguments this time since the whole page's content is fixed.
- `heading = Heading("Hello from Flask")` — **(b) hard concept
  reappearing.** A factory function calling another factory function —
  the exact composition pattern just proven with `unit_line()` calling
  `origin()`.
- `paragraph = Paragraph(...)` — same, second instance.
- `return Element("div", children=[heading, paragraph], class_="container")`
  — **(c) already basic.** Identical to Lesson 1b's `Element`
  construction — the only difference is `heading` and `paragraph` are
  now built by calling components instead of `Element` directly.
- `return Page().render()` — **(c) already basic** as a method call on
  a constructed object; what's worth noticing is the two calls chained
  together: `Page()` runs first, producing an `Element` tree, and
  `.render()` is called on *that result*, not on `Page` itself.

### SE Lens

The alternative not chosen: keep every route function fully
self-contained, building its whole tree inline, with no shared
component functions at all. The tradeoff: inline construction is
arguably easier to read for a single tiny page — there's no need to
jump to another function's definition to see what it builds. But it
means any shared piece of UI (a header, a footer, a repeated card
layout) has to be copy-pasted everywhere it's used, and a later change
to that piece means finding and fixing every copy by hand. Composition
costs one extra layer of indirection (you do have to go look at what
`Page()` actually contains) in exchange for a single source of truth
for anything reused more than once — the entire reason component
libraries like this one exist.

### Run It

```
$ curl -s http://127.0.0.1:5000/
<div class="container"><h1>Hello from Flask</h1><p id="intro">This paragraph is a child element.</p></div>
```

Byte-for-byte identical to Lesson 1b's output, confirmed by actually
running both versions and diffing — proving this lesson changed *how*
the tree gets built, not what it produces.

### Connect

`Page`, `Heading`, and `Paragraph` are the first real, reusable,
named components in this project — every future page this project
ever serves can be built by composing functions exactly like these,
instead of writing `Element(...)` calls from scratch each time.

---

## Closing

### Connect the Pieces

Trace the call chain for one request to `/`:

1. `index()` calls `Page()`.
2. `Page()` calls `Heading("Hello from Flask")`, which calls
   `Element("h1", "Hello from Flask")` and returns that `Element`.
3. `Page()` calls `Paragraph("This paragraph is a child element.",
   id="intro")`, which forwards `id="intro"` through its own `**attrs`
   into `Element("p", "This paragraph is a child element.",
   id="intro")`.
4. `Page()` wraps both results in `Element("div", children=[heading,
   paragraph], class_="container")` and returns that outer `Element`.
5. Back in `index()`, `.render()` is called on `Page()`'s return
   value — the same recursive `render()` from Lesson 1a walks the
   whole tree, unaware that any of it was built by component functions
   rather than by hand.

### What Breaks Without This

The single most common mistake this pattern invites: writing a
component's name without calling it — passing the function itself as
a child, instead of the tree it would have built.

```python
def Heading(text):
    return Element("h1", text)

# BUG: passing Heading itself (no parentheses), not Heading("...")
container = Element("div", children=[Heading])
print(container.render())
```

Real output:

```
Traceback (most recent call last):
  ...
    children_html += child.render()
                     ^^^^^^^^^^^^
AttributeError: 'function' object has no attribute 'render'
```

`Heading` (no parentheses) is the function object itself — never
called, never producing an `Element` at all. `render()`'s loop treats
it like any other child and tries `.render()` on it, which functions
simply don't have. Adding the missing `("Hello from Flask")` back
fixes it.

### Exercises

- Add a `Footer()` component (no arguments, returns a `p` with some
  fixed text) and include it as a third child of `Page()`.
- Give `Heading` its own `**attrs`, like `Paragraph` already has, so a
  caller could add `id="title"` to it — then use that from `Page()`.

### Definition of Done

- [ ] `Heading`, `Paragraph`, and `Page` all exist as factory
      functions returning `Element` trees.
- [ ] `index()`'s entire body is `return Page().render()`.
- [ ] `curl http://127.0.0.1:5000/` returns byte-for-byte the same
      HTML as Lesson 1b, confirmed by actually running and comparing.
- [ ] The forgot-to-call-the-component bug was reproduced on purpose,
      with the real `AttributeError` shown, then fixed.
- [ ] Committed with a message explaining *why*: something like
      `"Extract Heading, Paragraph, and Page as reusable component
      functions, so page structure isn't rebuilt inline in every
      route"` — not `"add components"`.
