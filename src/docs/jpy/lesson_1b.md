# Lesson 1b: Props — Giving Elements Real HTML Attributes

**What you will build:** `Element` gains the ability to carry arbitrary
HTML attributes — `id`, `class`, `style`, `data-*`, anything — and
`render()` writes them into the opening tag. The transferable problem:
a real UI element is never just a tag and some text; it needs a way to
be styled, identified, and configured, without hardcoding a parameter
for every possible HTML attribute that exists.

**What you need to know first:** Lesson 1a — `Element`'s current
`__init__(self, tag, text="", children=None)` and its recursive
`render()`. This lesson adds one more thing to both; nothing from 1a
is removed.

**Pipeline:** Still

```
Python Component → render() → HTML string → Flask response → Browser
```

Touching **Component** and **render()** again. One concrete value
carried through every stage, before and after:

| Stage | Before (1a) | After (1b) |
|---|---|---|
| Component | `Element("div", children=[heading, paragraph])` | `Element("div", children=[heading, paragraph], class_="container")` |
| render() | `"<div><h1>...</h1><p>...</p></div>"` | `'<div class="container"><h1>...</h1><p id="intro">...</p></div>'` |
| HTML string | same as above | same as above |
| Flask response | 200 OK, that string | 200 OK, the new string |
| Browser | an unstyled div | a div with a real `class` attribute a stylesheet could target |

---

## Concept Unit: `**kwargs` — Collecting Arbitrary Keyword Arguments

### The Problem

We want `Element` to accept *any* HTML attribute — `id`, `class`,
`style`, `data-tooltip`, anything at all — without editing `__init__`'s
signature every single time a new attribute is needed.

### Introduce the Concept in Isolation

```python
def describe(**kwargs):
    print(kwargs)

describe(id="main", role="button")
describe(color="red")
```

Run:

```
{'id': 'main', 'role': 'button'}
{'color': 'red'}
```

Neither `id`, `role`, nor `color` was ever declared as a parameter of
`describe` — yet both calls work, and every keyword argument the
caller happened to supply gets collected into one dict, under whatever
name you gave that final parameter (`kwargs`, here). This is called
**`**kwargs`** — collecting an arbitrary number of keyword arguments
into a dictionary.

### Discard

`u1_l1b.py` is deleted.

---

## Concept Unit: The Reserved-Word Attribute Problem

### The Problem

One of the most common real HTML attributes is `class`. But `class` is
a reserved Python keyword — it can't be used as a variable name, a
parameter name, or a keyword argument name.

### Introduce the Concept in Isolation

```python
def make_tag(**attrs):
    return attrs

print(make_tag(class="container"))
```

Run:

```
  File "u2_l1b_fail.py", line 4
    print(make_tag(class="container"))
                   ^^^^^
SyntaxError: invalid syntax
```

That's not a runtime bug — Python refuses to even parse this file.
`class` can never be used as a keyword argument name, full stop. The
common convention: append a trailing underscore, `class_`, which *is*
a valid identifier, then strip it back off before the value ever
reaches the actual HTML:

```python
def make_tag(**attrs):
    return attrs

print(make_tag(class_="container"))

key = "class_"
print(key.rstrip("_"))
```

Run:

```
{'class_': 'container'}
class
```

`class_="container"` is accepted, stored under the key `"class_"` —
and `.rstrip("_")` strips the trailing underscore back off when it's
time to actually write the attribute name into HTML, giving back the
real word `class`.

### Discard

`u2_l1b_fail.py` and `u2_l1b.py` are both deleted — the first existed
only to prove the `SyntaxError` is real, the second only to prove the
`class_` / `rstrip` fix works.

### Project Change

- **Reference Source:** No reference counterpart — from scratch. (This
  exact `class_` convention is also how the real Dash framework's
  `html.Div(className=...)` and Python's own `dataclasses` handle
  reserved-word collisions, though neither is being ported here.)
- **Files affected:** `app.py` (modify)
- **Change type:** replace (`Element.__init__` and `Element.render`),
  replace (`index()`'s body)
- **Location:** the `Element` class and `index()` function from Lesson
  1a.
- **Dependencies:** none beyond this lesson's own prior unit.

### The New Code — type it yourself

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
```

Then `index()`:

```python
def index():
    heading = Element("h1", "Hello from Flask")
    paragraph = Element("p", "This paragraph is a child element.", id="intro")
    container = Element("div", children=[heading, paragraph], class_="container")
    return container.render()
```

### The Updated Project

```python
from flask import Flask

app = Flask(__name__)

class Element:
    def __init__(self, tag, text="", children=None, **attrs):    # ← changed
        self.tag = tag
        self.text = text
        self.children = children if children is not None else []
        self.attrs = attrs                                        # ← new

    def render(self):
        attrs_html = ""                                            # ← new
        for key, value in self.attrs.items():                       # ← new
            clean_key = key.rstrip("_")                               # ← new
            attrs_html += f' {clean_key}="{value}"'                    # ← new

        children_html = ""
        for child in self.children:
            children_html += child.render()

        return f"<{self.tag}{attrs_html}>{self.text}{children_html}</{self.tag}>"    # ← changed

@app.route("/")
def index():
    heading = Element("h1", "Hello from Flask")
    paragraph = Element("p", "This paragraph is a child element.", id="intro")    # ← changed
    container = Element("div", children=[heading, paragraph], class_="container")  # ← changed
    return container.render()

if __name__ == "__main__":
    app.run(debug=True)
```

`Element` can now carry any number of real HTML attributes, and
`render()` writes each one into the opening tag before the children's
HTML is appended.

### Mechanical Walkthrough

- `**attrs` in the `__init__` signature — **(b) hard concept
  reappearing.** The exact `**kwargs` mechanism just proven, named
  `attrs` here instead of `kwargs` — the name is just a variable name,
  the collecting behavior is identical.
- `self.attrs = attrs` — **(c) already basic.** A plain instance
  attribute assignment, same pattern as `self.tag`/`self.text`.
- `for key, value in self.attrs.items():` — **(a) first appearance**
  of `.items()`. Iterating a plain dict with `for x in some_dict`
  would give you only the keys; `.items()` gives back each key
  *paired with* its value in one step, which is why the loop can
  unpack both `key` and `value` at once.
- `key.rstrip("_")` — **(b) hard concept reappearing.** The exact fix
  just proven — the only new thing here is that it's now running once
  per attribute, inside a loop, instead of on one hardcoded string.
- `attrs_html += f' {clean_key}="{value}"'` — **(c) already basic** as
  an f-string and string accumulation — the same accumulation pattern
  `children_html` already used in Lesson 1a. Note the literal leading
  space inside the f-string — without it, two attributes would run
  together with no separator (`class="x"id="y"`).
- `f"<{self.tag}{attrs_html}>...` — **(c) already basic.** The only
  change from 1a's version is `{attrs_html}` inserted directly after
  the tag name and before the closing `>` of the opening tag.

### CS Lens

Turning an in-memory key-value structure into a specific textual
format is **serialization**. Also recognized in: `JSON.stringify`
turning a JS object into text, a URL's query string
(`?key=value&key2=value2`), CSV row generation from a dict, and HTTP
headers themselves, which are just `Key: Value` pairs written one per
line — the exact same idea `attrs_html` is doing for HTML attributes.

### SE Lens

The alternative not chosen: give `Element.__init__` one explicit named
parameter per possible HTML attribute — `id=None, class_=None,
style=None, ...` and so on. The tradeoff: explicit parameters give
real autocomplete and catch typos immediately (`Element("div",
clas_="x")` would be a genuine `TypeError`, not silently wrong HTML).
But real HTML has dozens of standard attributes, plus unlimited custom
`data-*` attributes — hardcoding all of them would make `__init__`'s
signature enormous and still permanently incomplete. `**attrs` scales
to anything, at the cost of exactly that typo protection — a cost made
concrete below.

### Run It

```
$ curl -s http://127.0.0.1:5000/
<div class="container"><h1>Hello from Flask</h1><p id="intro">This paragraph is a child element.</p></div>
```

Confirmed by actually running the server and requesting it — matches
the pipeline table above exactly.

### Connect

`Element` can now represent real, stylable, identifiable HTML — the
next stages (state, diffing) will need attributes to change over time,
which is only meaningful now that they exist at all.

---

## Closing

### Connect the Pieces

Trace `class_="container"` end to end: passed as a keyword argument to
`Element("div", ...)` → collected into `self.attrs` as `{"class_":
"container"}` by `**attrs` → in `render()`'s loop, `key = "class_"`,
`clean_key = "class"` after `.rstrip("_")` → `attrs_html` becomes `'
class="container"'` → the final f-string places it directly after
`<div`, producing `<div class="container">` — exactly what `curl`
returned.

### What Breaks Without This

The exact cost named in the SE Lens, made real. A typo'd attribute
name compiles and runs with no error at all:

```python
# typo: "clas_" instead of "class_"
broken = Element("div", "oops", clas_="container")
print(broken.render())
```

Real output:

```
<div clas="container">oops</div>
```

`clas` is not a real HTML attribute — any browser will simply ignore
it — but Python never raised an error anywhere, because `**attrs`
accepts *any* keyword name without checking it against a known list.
This is the direct tradeoff the SE Lens named: flexibility for typo
safety.

### Exercises

- Add a `style` attribute to one of the `Element`s (e.g. `style="color:
  red;"`) and confirm it renders correctly.
- Try passing an attribute whose value is a number instead of a string
  (e.g. `Element("input", type_="number", maxlength=10)`) — run it and
  see what the f-string produces. Does it still work? Why?

### Definition of Done

- [ ] `Element.__init__` accepts `**attrs` and stores them on
      `self.attrs`.
- [ ] `Element.render()` writes each attribute into the opening tag,
      with `class_` correctly rendering as `class`.
- [ ] `curl http://127.0.0.1:5000/` returns HTML with a real `class`
      and `id` attribute present, confirmed by actually running it.
- [ ] The typo'd-attribute failure mode was reproduced on purpose with
      real output, confirming it fails silently rather than raising an
      error.
- [ ] Committed with a message explaining *why*: something like
      `"Let Element accept arbitrary HTML attributes via **kwargs, so
      components can be styled and identified, not just structured"`
      — not `"add attrs"`.
