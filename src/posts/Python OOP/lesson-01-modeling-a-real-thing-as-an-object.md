# Lesson 1: Modeling a Real Thing as an Object
### (Project 1 — Personal Notes, Python)

**What you will build.** A `Note` class that holds a title and a body, plus
a method that produces a short human-readable summary of itself. The
transferable problem this lesson is actually about: how to bundle related
data *and* the behavior that acts on it into a single named thing, instead
of passing loose variables around and hoping they stay in sync.

**What you need to know first.** Nothing — this is Lesson 1.

---

## Concept Unit: Classes and Instances

### The Problem

Right now, if we wanted to represent a note, we'd probably reach for two
separate variables:

```python
title = "Groceries"
body = "Milk, eggs, bread"
```

That works for one note. It falls apart the moment we have more than one:
`title2`, `body2`, `title3`, `body3`... there's nothing tying a given title
to its matching body except the number we tack on by convention, and
nothing stopping us from accidentally pairing `title2` with `body3`. We
need a way to say "these two pieces of data belong together, as one
thing."

### Introduce the concept in isolation

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(3, 4)
print(p.x, p.y)
```

Run it:

```
3 4
```

That output proves something specific: writing `Point(3, 4)` caused
`__init__` to run automatically, and whatever we assigned to `self.x`
and `self.y` inside it became readable afterward as `p.x` and `p.y` — two
separate values, but reachable through one single name, `p`. This is
called a **class** (`Point`, the blueprint), and `p` is called an
**instance** of it (one concrete object built from that blueprint).

### Discard the throwaway example

`Point` was only here to show `__init__` and `self` doing their job in the
smallest possible example. It's deleted now — it won't show up in the
notes project. What we actually need is the same idea, applied to a note.

### Project Change

- **Reference Source** — No reference counterpart. This is a from-scratch
  addition: Project 1 doesn't port an existing codebase, it's built from
  the ground up.
- **Files affected** — created `note.py` (new file, project root).
- **Change type** — add.
- **Location** — n/a, brand-new file.
- **Dependencies** — Python 3 installed, nothing else.

### The New Code

```python
class Note:
    def __init__(self, title, body):
        self.title = title
        self.body = body
```

### Mechanical walkthrough

- `class Note:` — **(a) first appearance.** The `class` keyword starts a
  new type definition; `Note` is the name of that type, from here on a
  thing you can build instances of, the same way `int` or `str` are types
  you build instances of.
- `def __init__(self, title, body):` — **(a) first appearance.** This is a
  special method Python calls automatically, and only, at the moment a new
  `Note` is being built — it's the constructor. `title` and `body` are
  just the values the caller hands in, e.g. `Note("Groceries", "Milk...")`.
- `self` — **(a) first appearance.** Inside `__init__`, `self` refers to
  *this particular instance being built right now* — not `Note` in
  general, but the one specific object this call is creating. Without it,
  there'd be no way to say "attach this data to *this* object" rather than
  to the class itself.
- `self.title = title` — **(a) first appearance.** This creates a new
  attribute named `title` on this instance and stores the incoming value
  in it. Before this line runs, `self` has no `title` at all; after it,
  `self.title` exists and will keep returning that value for as long as
  this object lives.
- `self.body = body` — **(c) already basic**, same pattern as the line
  above, just a second attribute.

### CS lens

This is **encapsulation**: bundling related data under one name so the
data can't drift apart or get mismatched. Also recognized in: a row in a
database table, a `struct` in C, a DOM `Element` object in the browser, an
HTTP request object in any web framework — all of them are "here's a bag
of related fields, addressed as one thing."

### SE lens

The alternative we rejected was two loose variables per note (or a
`dict` like `{"title": ..., "body": ...}`). A `dict` is tempting because
it needs no class at all — but it has no fixed shape: nothing stops one
note from having a `"body"` key and another from having a `"text"` key by
typo, and Python won't warn you until something tries to read the wrong
key at runtime. A class costs a few extra lines up front, but it gives
every `Note` the same guaranteed shape, and gives us a place to attach
behavior later (which the next unit does). The debt we're *not* paying
yet: there's no validation here — `Note("", "")` is currently perfectly
legal. That's a real gap, and it's one this project will come back to.

### Commands needed

`python3 note.py` — runs the file with the Python 3 interpreter. No flags
needed yet.

### Run it

```python
if __name__ == "__main__":
    n = Note("Groceries", "Milk, eggs, bread")
    print(n.title)
    print(n.body)
```

Real output:

```
Groceries
Milk, eggs, bread
```

### Connecting sentence

We now have one object, `n`, that carries both pieces of data for a note
together — the mismatch problem from the top of this unit is gone, because
there's no way to have a title without its matching body anymore.

---

## Concept Unit: Instance Methods

### The Problem

Right now, anywhere in the project that wants to *display* a note has to
know, itself, how to combine `title` and `body` into something readable —
probably by writing `f"{n.title}: {n.body[:20]}"` again, by hand, at every
call site. If we ever change how a note should be summarized (say, we
decide summaries should be 30 characters instead of 20), we'd have to hunt
down every place that formatting logic was copy-pasted and fix it in each
one.

### Introduce the concept in isolation

We don't need a new throwaway lab for this — the `Point` class already
proved that a class can hold data. What's new here is that a class can
also hold *behavior* that acts on that data, and it's small enough to show
directly against `Note` itself rather than against a disposable example.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — modified `note.py`.
- **Change type** — add (new method inside the existing class).
- **Location** — inside `class Note`, directly below `__init__`.
- **Dependencies** — none beyond what's already there.

### The New Code

```python
    def summary(self):
        return f"{self.title}: {self.body[:20]}"
```

### The Updated Project

```python
class Note:
    def __init__(self, title, body):
        self.title = title
        self.body = body

    def summary(self):                              # ← new
        return f"{self.title}: {self.body[:20]}"    # ← new
```

`Note` now knows how to describe itself — any code that wants a short,
readable line for a note calls `n.summary()` instead of re-deriving the
formatting logic itself. The formatting rule now lives in exactly one
place.

### Mechanical walkthrough

- `def summary(self):` — **(a) first appearance.** This defines an
  **instance method**: a function that lives inside the class and always
  receives `self` — the specific `Note` it's being called on — as its
  first argument automatically. `n.summary()` is Python's shorthand for
  "call `summary`, passing `n` in as `self`."
- `return f"{self.title}: {self.body[:20]}"` — **(a) first appearance,**
  two things at once: `return` sends a value back to whoever called the
  method (`__init__` never did this — a constructor builds an object, it
  doesn't hand one back), and `f"...{expr}..."` is an **f-string**: the
  `{}` sections are evaluated and substituted into the string live, rather
  than being pasted together with `+` by hand.
- `self.title` — **(c) already basic**, the same attribute access taught
  in the previous unit.
- `self.body[:20]` — **(a) first appearance** of slicing: `[:20]` takes
  the first 20 characters of the string and stops there, so a long note
  body doesn't blow out the summary line.

### CS lens

This is the core idea of an **object**: data and the operations on that
data traveling together, so callers ask the object to describe itself
rather than reaching into its internals and doing it themselves. Also
recognized in: a `toString()`/`__str__` method on almost any object in any
OO language, a `.render()` method on a UI component, a `.serialize()`
method on a network message.

### SE lens

The alternative is what we described in the Problem section: formatting
logic duplicated at every call site. That's not just more typing — it's a
maintenance trap, because "change the summary length" silently becomes "go
find every place that touched `.title` and `.body[:N]` by hand and hope
you found them all." Putting the logic on the object costs one extra
method, and in exchange the formatting rule has exactly one home.

### Commands needed

Same as before: `python3 note.py`.

### Run it

```python
if __name__ == "__main__":
    n = Note("Groceries", "Milk, eggs, bread, and a birthday card")
    print(n.summary())
```

Real output:

```
Groceries: Milk, eggs, bread, a
```

### Connecting sentence

The object built in the first unit now describes itself in one call —
`n.summary()` — instead of every caller re-deriving that formatting on its
own.

---

## Closing

**Connect the pieces.** One value, start to finish: the string
`"Groceries"` is passed as `title` into `Note.__init__`, becomes
`self.title` on the new instance `n`, and later that same stored value is
read back out inside `summary()`'s f-string to produce
`"Groceries: Milk, eggs, bread, a"` — the same data, entering once,
flowing through both units built in this lesson.

**What breaks without this.** If `summary` is misspelled at the call site
— `n.summry()` instead of `n.summary()` — Python has no idea what you
mean, because there's no attribute by that name on the instance:

```
Traceback (most recent call last):
  File "note_broken.py", line 12, in <module>
    print(n.summry())
          ^^^^^^^^
AttributeError: 'Note' object has no attribute 'summry'. Did you mean: 'summary'?
```

That error is the interpreter telling you, at the exact call site, that
the method you asked for doesn't exist on this object — which is only
possible *because* the behavior lives on the object in the first place.
Fix the typo and it runs cleanly again.

**Exercises.**
1. Add a `created_at` attribute to `__init__` (you can hardcode a string
   for now, e.g. `"2026-07-28"` — real timestamps come in a later lesson)
   and include it in `summary()`.
2. Make the slice length in `summary()` a parameter instead of a hardcoded
   `20`, so `n.summary(length=10)` works.
3. Create three different `Note` instances and print all three summaries
   in a loop — notice you don't have to write the formatting logic three
   times.

**Definition of done.**
- [ ] `note.py` exists with a working `Note` class.
- [ ] `Note` has `title` and `body` set in `__init__`.
- [ ] `Note` has a `summary()` method, and you've run it and seen real
      output matching what's shown above.
- [ ] You've deliberately broken it (typo the method name), seen the real
      `AttributeError`, and fixed it back.
- [ ] `git init`, then `git add note.py`, then commit with a message that
      explains *why*, not what — e.g. `"Model a note as an object instead
      of loose title/body variables, so title and body can't drift apart"`,
      not `"add Note class"`.

**Next lesson** will give `Note` a way to persist to disk (JSON) and give
the project a way to hold more than one note at a time — which is where a
`list` and, shortly after, a first look at the Repository pattern come in.
