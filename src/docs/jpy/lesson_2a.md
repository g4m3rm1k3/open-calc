# Lesson 2a: State — Data That Outlives a Single Render

**What you will build:** A `State` object holding a `count`, a `Page`
that displays it, and an `/increment` route that changes it — proving
the exact same render logic, called again after the data changes,
produces different output. No pushing updates to the browser yet (that
needs a live connection, still two stages away) — this lesson is about
the data model itself: something that persists and changes
*independently* of any one render.

**What you need to know first:** Lesson 1c — `Heading`, `Paragraph`,
and `Page` as factory functions, and `Element`'s `render()` fully
working. This lesson doesn't touch `Element` at all; it changes what
gets *passed into* `Page`.

**Pipeline:** Still

```
Python Component → render() → HTML string → Flask response → Browser
```

Every stage still runs the same way — what's new is that **Component**
now depends on something that can change between one request and the
next. One concrete value carried through every stage, across two
separate requests:

| Stage | Request 1: `GET /` | Request 2: `GET /increment` |
|---|---|---|
| Component | `Page(state)` where `state.count == 0` | `Page(state)` where `state.count == 1`, after `state.count += 1` ran |
| render() | `'...<p>Count: 0</p></div>'` | `'...<p>Count: 1</p></div>'` |
| HTML string | same | same |
| Flask response | 200 OK, "Count: 0" | 200 OK, "Count: 1" |
| Browser | shows Count: 0 | shows Count: 1 |

---

## Concept Unit: A State Object — Separating Data From the Tree That Displays It

### The Problem

Every value shown so far — `"Hello from Flask"`, the paragraph text —
has been fixed, baked directly into a component call. Nothing in this
project can currently show a value that changes over time, because
nothing is holding onto a value *separately* from the tree describing
it.

### Introduce the Concept in Isolation

```python
class Counter:
    def __init__(self):
        self.count = 0

def render_counter(counter):
    return f"Count: {counter.count}"

counter = Counter()
print(render_counter(counter))

counter.count += 1
print(render_counter(counter))
```

Run:

```
Count: 0
Count: 1
```

`render_counter` was defined once and never changed. It was called
twice, and produced two different results — purely because `counter`,
the object it reads from, changed in between the two calls. This
object holding changeable data is called **state**. Calling the exact
same render logic again, after state changes, to get updated output,
is called a **manual re-render** — "manual" because nothing is
automatic yet; you have to actually call it again yourself.

### Discard

`u1_l2a.py` is deleted. `Counter`/`render_counter` were never real
project concepts — they existed only to prove the same render function
produces different output once its input data changes.

---

## Concept Unit: Mutating an Attribute vs. Reassigning a Global Name

### The Problem

We want one `state` object living at module scope — outside any
function — so that both `index()` and a new `/increment` route can see
and change the *same* state. Python famously restricts functions from
modifying outer-scope variables without the `global` keyword. Will
`state.count += 1`, written inside a route function, actually work, or
will it need `global` too?

### Introduce the Concept in Isolation

```python
class Counter:
    def __init__(self):
        self.count = 0

counter = Counter()

def bump():
    counter.count += 1   # mutating an attribute — no `global` needed

bump()
bump()
print(counter.count)
```

Run:

```
2
```

That worked, with no `global` declaration anywhere. Now the contrast —
reassigning a plain name instead of mutating an attribute:

```python
total = 0

def bump_broken():
    total += 1   # this tries to reassign the name `total`

bump_broken()
```

Run:

```
Traceback (most recent call last):
  ...
    total += 1   # this tries to reassign the name `total`
    ^^^^^
UnboundLocalError: cannot access local variable 'total' where it is
not associated with a value
```

The rule this proves: **reassigning a name** (`total = total + 1`)
inside a function requires `global` if that name lives outside it —
Python assumes any name assigned anywhere in a function is local,
unless told otherwise. But **mutating an attribute** of an object a
name already refers to (`counter.count += 1`) never reassigns
`counter` itself — it just changes something *inside* the object
`counter` already points to — so no `global` is ever needed for it.

### Discard

`u2_l2a.py` and `u2b_l2a.py` are both deleted — they existed only to
prove the attribute-mutation vs. name-reassignment distinction, side
by side.

### Project Change

- **Reference Source:** No reference counterpart — from scratch.
- **Files affected:** `app.py` (modify)
- **Change type:** add (`State` class, `state` instance, `/increment`
  route), replace (`Page`'s signature and body, `index()`'s body)
- **Location:** `State` goes after `Paragraph` (from Lesson 1c);
  `Page` is modified in place; `state = State()` goes after `Page`'s
  definition, before the routes; `/increment` goes directly after
  `index()`.
- **Dependencies:** none beyond Lesson 1c's state.

### The New Code — type it yourself

```python
class State:
    def __init__(self):
        self.count = 0
```

Then `Page` changes to accept it:

```python
def Page(state):
    heading = Heading("Hello from Flask")
    paragraph = Paragraph("This paragraph is a child element.", id="intro")
    counter = Element("p", f"Count: {state.count}")
    return Element("div", children=[heading, paragraph, counter], class_="container")
```

Then the module-level state and the new route:

```python
state = State()


@app.route("/increment")
def increment():
    state.count += 1
    return Page(state).render()
```

And `index()` changes to pass `state` through:

```python
@app.route("/")
def index():
    return Page(state).render()
```

### The Updated Project

```python
def Heading(text):
    return Element("h1", text)

def Paragraph(text, **attrs):
    return Element("p", text, **attrs)

class State:                                                                   # ← new
    def __init__(self):                                                        # ← new
        self.count = 0                                                          # ← new

def Page(state):                                                                # ← changed
    heading = Heading("Hello from Flask")
    paragraph = Paragraph("This paragraph is a child element.", id="intro")
    counter = Element("p", f"Count: {state.count}")                              # ← new
    return Element("div", children=[heading, paragraph, counter], class_="container")  # ← changed

state = State()                                                                  # ← new

@app.route("/")
def index():
    return Page(state).render()                                                 # ← changed

@app.route("/increment")                                                        # ← new
def increment():                                                                 # ← new
    state.count += 1                                                             # ← new
    return Page(state).render()                                                  # ← new

if __name__ == "__main__":
    app.run(debug=True)
```

`app.py` now holds one shared `state` object at module scope. Both
routes read it through `Page(state)`, and `/increment` is the only
place that changes it — `index()` never mutates state, only displays
whatever it currently holds.

### Mechanical Walkthrough

- `class State:` / `def __init__(self): self.count = 0` — **(b) hard
  concept reappearing.** The exact same class/`__init__`/instance
  attribute mechanics from Lesson 0b, applied to a new purpose: holding
  changeable data instead of describing a fixed tag.
- `def Page(state):` — **(a) first appearance** of a component
  function taking a parameter that isn't text or attributes, but a
  whole state object it will read from. `Page` doesn't own this data —
  it's handed to it, read from, and used to decide what to render.
- `counter = Element("p", f"Count: {state.count}")` — **(c) already
  basic** as an `Element` construction and f-string; the only new
  thing is reading `state.count` instead of a literal string.
- `state = State()` — **(c) already basic** instantiation, at module
  scope rather than inside a function — meaning it's created exactly
  once, when the file first loads, and both routes below share that
  same one object.
- `state.count += 1` — **(b) hard concept reappearing.** The exact
  attribute-mutation pattern just proven — no `global` needed, because
  `state` (the name) is never being reassigned, only `state.count`
  (something inside the object it refers to) is changing.
- `return Page(state).render()`, in both routes — **(c) already
  basic** as a call-then-method-call, same shape as `Page().render()`
  from Lesson 1c; the difference is only that `state` is now threaded
  through as an argument.

### CS Lens

Separating "the data" from "the thing that describes how to display
it" — so the exact same display logic can run again and produce
different output as the data changes — is the core idea behind
**model-view separation**. Also recognized in: spreadsheet formulas
recalculating when a cell changes, a thermostat's display updating
from a sensor reading it doesn't itself own, and — the actual
destination of this whole project — React's own state/props model,
where components are functions of state, called again whenever that
state changes.

### SE Lens

The alternative not chosen: let `Page` own and increment its own
counter internally, with no separate `State` object at all — for
example, a variable local to `Page` that somehow persisted between
calls. The tradeoff: that would tangle "what the data currently is"
together with "how it's displayed," making it impossible for two
different parts of the app (`index()` and `/increment`) to both read
and change the *same* underlying value — each call to `Page` would
need its own hidden mechanism for remembering state, and there'd be no
single place to reason about what the current value actually is.
Pulling `state` out as its own object costs one extra parameter
threaded through `Page`, but gives a single, inspectable place
holding the truth.

There's a real limitation being carried forward on purpose, not fixed
yet: `state` is one object, shared by the whole running server
process — every visitor to this app right now sees and changes the
*same* counter. That's a genuine problem for a real multi-user app,
and it's exactly what the next lesson (2b) exists to fix.

### Run It

```
$ curl -s http://127.0.0.1:5000/
...<p>Count: 0</p></div>
$ curl -s http://127.0.0.1:5000/increment
...<p>Count: 1</p></div>
$ curl -s http://127.0.0.1:5000/increment
...<p>Count: 2</p></div>
$ curl -s http://127.0.0.1:5000/
...<p>Count: 2</p></div>
```

Confirmed by actually running the server and issuing four separate
`curl` requests — the count persists across every one of them, even
though each is a completely separate HTTP request/response cycle, with
no connection held open between them.

### Connect

`state` is the first piece of data in this project that outlives a
single render — the actual thing the next several lessons exist to
push to a browser automatically instead of requiring a page reload.

---

## Closing

### Connect the Pieces

Trace two consecutive requests: `GET /` returns `Page(state).render()`
with `state.count == 0`, producing `"...Count: 0..."`. Then `GET
/increment` runs `state.count += 1` — mutating the *same* `state`
object `index()` reads from, not a copy — before also calling
`Page(state).render()`, now producing `"...Count: 1..."`. A third
request to `GET /` calls `Page(state).render()` again, with no
increment in between, and still shows `"...Count: 1..."` — proving
`state` really persisted between requests, in the server process
itself, not anywhere on the browser side.

### What Breaks Without This

Using the attribute-mutation-vs-reassignment distinction from Concept
Unit 2, reversed on purpose — reading `state.count` into a local
variable and bumping *that*, instead of mutating `state` itself:

```python
@app.route("/increment")
def increment_broken():
    count = state.count   # copies the current value...
    count += 1              # ...bumps the copy...
    return Page(state).render()   # ...but state.count itself was never touched
```

Real output, hitting `/increment` three times in a row:

```
<p>Count: 0</p>
<p>Count: 0</p>
<p>Count: 0</p>
```

No error anywhere — `count = count + 1` runs successfully every time.
The bug is that `count` was a completely separate local variable from
`state.count`; bumping it never touched the object `index()` actually
reads from. This is the silent-failure sibling of Concept Unit 2's
crash: reassigning a *local copy* doesn't error, it just quietly does
nothing useful.

### Exercises

- Add a `/decrement` route, mirroring `/increment`, and confirm the
  count can go negative.
- Add a second field to `State` — `name`, defaulting to `"Guest"` — a
  `/rename/<new_name>` route (Flask route parameters aren't covered
  yet, so hardcode a couple of test routes instead, like `/rename-ana`
  setting `state.name = "Ana"`), and display it in `Page`.

### Definition of Done

- [ ] `State` holds `count`, initialized to `0`.
- [ ] `Page(state)` reads `state.count` and displays it.
- [ ] `/increment` mutates the shared `state.count` and returns the
      newly rendered page.
- [ ] Four consecutive real requests (`/`, `/increment`, `/increment`,
      `/`) show the count correctly persisting, confirmed by actually
      running them.
- [ ] The local-copy silent-failure bug was reproduced on purpose, with
      real output showing the count staying at zero across three real
      requests, then fixed.
- [ ] Committed with a message explaining *why*: something like
      `"Add a State object holding count, and thread it through Page,
      so the rendered page can reflect data that changes between
      requests"` — not `"add state"`.
