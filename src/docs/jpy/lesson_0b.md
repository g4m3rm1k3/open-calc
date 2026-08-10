# Lesson 0b: The First Component — an Object That Renders Itself

**What you will build:** A Python `Element` class that holds an HTML tag
and some text, and knows how to turn itself into the same HTML string
`index()` used to return as a hardcoded literal. The transferable
problem: right now, "the UI" is a string baked directly into a route
function. Nothing in this project can be inspected, compared, or
diffed later — a string is just text. Once "the UI" is a real Python
*object* instead, we finally have something a future lesson can hold
onto, compare against an older version of itself, and describe changes
to. This lesson doesn't add any of that yet — it just takes the first
step of making the UI a thing, not a string.

**What you need to know first:** Lesson 0a — specifically, that
whatever `index()` returns becomes the HTTP response body Flask sends
to the browser. This lesson only changes *what* gets returned, not
*how* returning works.

**Pipeline:** This project now has its first named pipeline stage.
Going forward:

```
Python Component → render() → HTML string → Flask response → Browser
```

This lesson touches the first two stages — **Component** and
**render()** — for the first time. The last two stages already exist
from Lesson 0a and don't change. One concrete value carried through
every stage, before and after this lesson:

| Stage | Before (0a) | After (0b) |
|---|---|---|
| Component | *(none — string was hardcoded)* | `Element("h1", "Hello from Flask")` |
| render() | *(none)* | `"<h1>Hello from Flask</h1>"` |
| HTML string | `"<h1>Hello from Flask</h1>"` | `"<h1>Hello from Flask</h1>"` |
| Flask response | 200 OK, that string as body | 200 OK, that string as body |
| Browser | shows "Hello from Flask" as a heading | shows "Hello from Flask" as a heading |

Same final result on screen — this lesson changes *how* that string
gets produced, not what the user sees.

---

## Concept Unit: Classes — a Blueprint for Objects

### The Problem

We want something that can *hold* a tag and some text together, as one
thing, rather than gluing them into a string immediately. Plain
variables (`tag = "h1"`, `text = "..."`) don't stay grouped — nothing
stops them drifting apart or getting mixed up with some other
element's tag and text.

### Introduce the Concept in Isolation

```python
class Dog:
    pass

d = Dog()
print(type(d))
```

Run:

```
<class '__main__.Dog'>
```

`class Dog: pass` defines a brand-new type — even with nothing inside
it. Calling `Dog()` constructs a real object *of* that type, proven by
`type(d)` reporting `Dog`, not `str` or `dict` or anything built-in.
This is called a **class** (the blueprint) and `d` is an **instance**
of it (a real object built from that blueprint).

### Discard

`u1.py` is deleted. `Dog` was never a real concept in this project —
it existed only to prove that `class` produces a genuinely new, real
type.

### Project Change

- **Reference Source:** No reference counterpart — this is a
  from-scratch design, not a port of an existing framework's internals.
- **Files affected:** `app.py` (modify) — staying in the same growing
  file rather than splitting into a new module.
- **Change type:** add
- **Location:** between `app = Flask(__name__)` and the `@app.route("/")`
  block from Lesson 0a.
- **Dependencies:** none beyond Lesson 0a's state.

*(This unit's own concept — bare class definition — doesn't land in the
project by itself yet; the real `Element` class needs `__init__` and
`self` first, taught in the next two units. It arrives fully formed at
the end of Concept Unit 4.)*

---

## Concept Unit: The `__init__` Constructor

### The Problem

A class with nothing inside it (`class Dog: pass`) can't hold a tag or
text — every `Dog()` you construct would be identical and empty. We
need code that runs automatically, once, the moment an object is
constructed, to set it up.

### Introduce the Concept in Isolation

```python
class Dog:
    def __init__(self):
        print("constructing a Dog!")

Dog()
Dog()
```

Run:

```
constructing a Dog!
constructing a Dog!
```

Two separate `Dog()` calls, two separate print statements — even
though nothing explicitly called `__init__` by name. Defining a method
named exactly `__init__` inside a class tells Python "run this
automatically, every time this class is instantiated." This is called
the **constructor**.

### Discard

`u2.py` is deleted.

---

## Concept Unit: `self` and Instance Attributes

### The Problem

We can now run setup code automatically, but every `Dog()` built so
far is still identical — there's still no way for one instance to hold
*different* data than another.

### Introduce the Concept in Isolation

```python
class Dog:
    def __init__(self, name):
        self.name = name

fido = Dog("Fido")
rex = Dog("Rex")
print(fido.name, rex.name)
```

Run:

```
Fido Rex
```

`fido` and `rex` were built from the exact same class, using the exact
same `__init__` code — yet they report different `name` values. The
`self` parameter inside `__init__` refers to *whichever specific
instance is currently being constructed*, so `self.name = name`
stores `name` onto that one instance only, not shared with any other.
This is called an **instance attribute** — data that belongs to one
specific object, not to the class as a whole.

### Discard

`u3.py` is deleted.

---

## Concept Unit: Methods — Functions That Belong to an Instance

### The Problem

`Element` needs more than storage — it needs to *do* something: turn
its stored tag and text into an HTML string on request. We need a way
to attach behavior, not just data, to each instance.

### Introduce the Concept in Isolation

```python
class Dog:
    def __init__(self, name):
        self.name = name

    def bark(self):
        return f"{self.name} says woof!"

fido = Dog("Fido")
rex = Dog("Rex")
print(fido.bark())
print(rex.bark())
```

Run:

```
Fido says woof!
Rex says woof!
```

`bark` is defined exactly once, in the class body — yet calling
`fido.bark()` and `rex.bark()` produces two different results, because
each call automatically receives its own instance as `self`, and reads
*that* instance's `name`. This is called a **method** — a function
defined inside a class, called on a specific instance with `.`, that
has automatic access to that instance's own data via `self`.

### Discard

`u4.py` is deleted. This is the last of the throwaway `Dog` labs — the
real `Element` class below combines everything the last four units
proved, plus this unit's new piece, `render()`, as a method.

### Project Change

- **Reference Source:** No reference counterpart — from scratch.
- **Files affected:** `app.py` (modify)
- **Change type:** add (the class), replace (`index()`'s body)
- **Location:** the `Element` class goes where the placeholder from
  Concept Unit 1 was left; `index()` is the same function from Lesson
  0a, modified to use it.
- **Dependencies:** none beyond this lesson's own prior units.

### The New Code — type it yourself

```python
class Element:
    def __init__(self, tag, text):
        self.tag = tag
        self.text = text

    def render(self):
        return f"<{self.tag}>{self.text}</{self.tag}>"
```

Then update `index()`:

```python
def index():
    element = Element("h1", "Hello from Flask")
    return element.render()
```

### The Updated Project

```python
from flask import Flask

app = Flask(__name__)

class Element:                                        # ← new
    def __init__(self, tag, text):                    # ← new
        self.tag = tag                                 # ← new
        self.text = text                                # ← new

    def render(self):                                   # ← new
        return f"<{self.tag}>{self.text}</{self.tag}>"    # ← new

@app.route("/")
def index():
    element = Element("h1", "Hello from Flask")     # ← new
    return element.render()                           # ← new

if __name__ == "__main__":
    app.run(debug=True)
```

`app.py` now defines a reusable `Element` class alongside the Flask
setup, and `index()` builds one specific `Element` and asks it to
render itself, instead of writing the HTML by hand.

### Mechanical Walkthrough

- `class Element:` — **(b) hard concept reappearing.** The same
  blueprint/instance idea proven with `Dog` above, now naming the real
  thing this project actually needs.
- `def __init__(self, tag, text):` — **(b) hard concept reappearing.**
  Runs automatically on construction, same as the `Dog` lab — now
  accepting two pieces of data instead of one.
- `self.tag = tag`, `self.text = text` — **(b) hard concept
  reappearing.** Two instance attributes this time instead of one,
  same mechanism proven with `fido`/`rex`'s independent `name`s.
- `def render(self):` — **(a) first appearance** *of this specific
  method name*, but **(b) hard concept reappearing** for what a method
  fundamentally is — proven with `bark()` above.
- `f"<{self.tag}>{self.text}</{self.tag}>"` — **(c) genuinely basic,
  already-established syntax.** f-strings aren't new to this project;
  what's new is only that the values being interpolated now come from
  `self` instead of local variables.
- `element = Element("h1", "Hello from Flask")` — **(c) already
  basic.** A plain variable assignment holding a constructed instance
  — no new mechanism, just the class from above being used for real.
- `element.render()` — **(c) already basic** as a method *call*
  (proven with `.bark()`), applied to the real class for the first
  time.

### CS Lens

A class bundling data with the operations that act on that data —
here, `tag`/`text` bundled with `render()` — is the core idea of
**encapsulation** in object-oriented design. Also recognized in:
database ORM row objects that know how to save themselves, GUI
frameworks where every widget object knows how to draw itself (which
is exactly where this project is headed), and file-handle objects that
bundle a raw file descriptor together with `.read()`/`.write()`
methods that know how to operate on it correctly.

### SE Lens

The alternative not chosen: a plain dictionary, `{"tag": "h1", "text":
"Hello from Flask"}`, with a separate free function,
`render_dict(d)`, that reads `d["tag"]` and `d["text"]`. The tradeoff:
a dict is less code upfront and doesn't require defining a class at
all — but nothing stops a typo like `d["tga"]` from failing silently
at the wrong moment, and there's no natural home for behavior; every
new operation on the data needs its own free function, disconnected
from the data itself. The `Element` class costs the `class`/`__init__`
ceremony up front, but gives the data a guaranteed shape and a real
place — `render()` — for behavior to live, which matters a lot once
this project needs many different behaviors attached to the same
piece of UI data (which it will, starting in later stages).

### Run It

```
$ curl -s http://127.0.0.1:5000/
<h1>Hello from Flask</h1>
```

Identical output to Lesson 0a's version — confirmed by actually running
both and diffing the response bodies. Nothing visible changed for the
browser; what changed is that this string is now *produced by an
object*, not hand-written.

### Connect

`Element` is now the first real building block for everything else in
this project — every future component (buttons, containers, whatever
comes next) will be some variation of "a class with a `render()`
method," the same shape just proven here.

---

## Closing

### Connect the Pieces

Trace `"h1"` and `"Hello from Flask"` end to end, after this lesson:

1. `index()` constructs `Element("h1", "Hello from Flask")` — the two
   values become instance attributes, via `__init__` and `self`
   (Concept Units 2 and 3).
2. `element.render()` is called — a method (Concept Unit 4) that reads
   `self.tag` and `self.text` back out and interpolates them into an
   f-string, producing `"<h1>Hello from Flask</h1>"`.
3. That string is `index()`'s return value — exactly the same
   mechanism from Lesson 0a: whatever a view function returns becomes
   the response body.
4. Flask wraps it into a real HTTP response, `app.run()`'s server
   sends it, and `curl`/the browser receives the same HTML as before.

### What Breaks Without This

Returning the `Element` object directly from `index()`, instead of
calling `.render()` on it, produces a real server error:

```
$ curl -s -i http://127.0.0.1:5002/
HTTP/1.1 500 INTERNAL SERVER ERROR
...
TypeError: The view function did not return a valid response. The
return type must be a string, dict, list, tuple with headers or
status, Response instance, or WSGI callable, but it was a Element.
```

Flask has no idea how to turn an arbitrary Python object into bytes on
the wire — only `render()`'s *return value* (a plain string) means
anything to it. This is exactly why `render()` exists as a method: the
object needs to know how to turn itself into something Flask can
actually send. Restoring `.render()` fixes it.

### Exercises

- Add a second `Element` (a `<p>` tag with different text) inside
  `index()`, call `.render()` on both, and concatenate the two strings
  into the response.
- Add a `__repr__` method to `Element` that returns something like
  `Element(h1, 'Hello from Flask')`, and `print()` an instance in a
  scratch script to see it — a preview of making objects
  human-readable, useful once there are many of them to debug.

### Definition of Done

- [ ] `Element` class defined with `__init__(self, tag, text)` and
      `render(self)`.
- [ ] `index()` builds an `Element` and returns `.render()`'s result.
- [ ] `curl http://127.0.0.1:5000/` returns byte-for-byte the same
      HTML as Lesson 0a.
- [ ] Returning the raw `Element` object (no `.render()`) produces a
      real 500 `TypeError`, confirmed by actually running it, then
      restored.
- [ ] Committed with a message explaining *why*: something like
      `"Turn the hardcoded response string into an Element object with
      a render() method, so the UI is a real Python object a future
      lesson can hold onto and compare, not just text"` — not `"add
      Element class"`.
