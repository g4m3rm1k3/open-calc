# Lesson 2: Holding Many, Then Making Them Outlive the Program
### (Project 1 — Personal Notes, Python)

**What you will build.** The project grows from "one `Note` object that
disappears when the script ends" to a collection of notes that persists
to disk as JSON and survives between runs — ending in a `NoteRepository`
object that hides *how* that persistence happens from everything else in
the project. The transferable problems this lesson is actually about:
holding many of something instead of one, converting an object to and
from a plain, storage-friendly shape, and hiding storage details behind
one seam so the rest of the program never has to know or care whether
that seam is a JSON file, a database, or something else entirely.

**What you need to know first.** Lesson 1 — the `Note` class, its
`__init__`, and its `summary()` instance method.

---

## Concept Unit: Holding Many Notes

### The Problem

Lesson 1 ended with exactly one `Note`, held in one variable, `n`. A
personal notes app that can only ever remember one note isn't useful.
We need somewhere to put an *arbitrary number* of `Note` objects — one
today, forty next month — without declaring a new variable for each one.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — modified `note.py`.
- **Change type** — replace the `__main__` block from Lesson 1.
- **Location** — the `if __name__ == "__main__":` block at the bottom of
  `note.py`.
- **Dependencies** — none beyond Lesson 1's `Note` class.

### The New Code

```python
notes = []
notes.append(Note("Groceries", "Milk, eggs, bread"))
notes.append(Note("Gym", "Leg day tomorrow"))
notes.append(Note("Idea", "Build a notes app"))

for note in notes:
    print(note.summary())
```

### The Updated Project

```python
class Note:
    def __init__(self, title, body):
        self.title = title
        self.body = body

    def summary(self):
        return f"{self.title}: {self.body[:20]}"


if __name__ == "__main__":
    notes = []                                              # ← new
    notes.append(Note("Groceries", "Milk, eggs, bread"))    # ← new
    notes.append(Note("Gym", "Leg day tomorrow"))            # ← new
    notes.append(Note("Idea", "Build a notes app"))          # ← new

    for note in notes:                                      # ← new
        print(note.summary())                                # ← new
```

`Note` itself hasn't changed at all — the class from Lesson 1 didn't need
to know anything about being one-of-many. What changed is *how many* of
them the program keeps track of at once, and that's handled entirely
outside the class, in the code that uses it.

### Introduce the concept in isolation

This is exactly what `notes.append(...)` and `for note in notes:` are
doing above, isolated from `Note` entirely:

```python
basket = []
basket.append("apples")
basket.append("bread")
basket.append("cheese")

for item in basket:
    print(item)
```

Real output:

```
apples
bread
cheese
```

`basket = []` creates an empty **list** — an ordered, growable container.
Each `.append(...)` call adds one more item onto the end of it, and the
`for item in basket:` loop then visits every item currently in it, in the
order they were added. This proves the list actually grew one item at a
time and remembered the order — nothing here required knowing in advance
how many items there would be, which is exactly the problem from this
unit's Problem section.

### Discard the throwaway example

`basket` was only here to show `append` and the `for` loop working on
plain strings, with nothing else going on. It's deleted now — the real
project code above already does the same thing with `Note` objects
instead of strings.

### Mechanical walkthrough

- `notes = []` — **(a) first appearance.** `[]` is list-literal syntax:
  it creates a new, empty list and binds the name `notes` to it. Nothing
  is inside it yet.
- `notes.append(Note("Groceries", "Milk, eggs, bread"))` — **(a) first
  appearance** of `.append(...)`: it adds exactly one item — here, a
  freshly constructed `Note` — onto the end of the list, growing its
  length by one. `Note("Groceries", ...)` itself is **(c) already
  basic**: the same constructor call taught in Lesson 1.
- `for note in notes:` — **(a) first appearance** of a `for` loop: it
  runs the indented block once per item currently in `notes`, binding
  the loop variable `note` to that item each time through, in the order
  the items were appended.
- `print(note.summary())` — **(c) already basic.** `note.summary()` is
  the same method from Lesson 1, just now called once per note inside
  the loop instead of once by hand.

### CS lens

This is the **list** — one of the handful of data structures nearly
everything else in software eventually sits on top of: an ordered,
growable sequence you can add to and iterate over in the order things
were added. Also recognized in: a browser's array of DOM child nodes, a
shopping cart's line items, a music player's queue, the undo history of
almost any editor.

### SE lens

The alternative — a separate variable per note (`note1`, `note2`,
`note3`...) — was already rejected back in Lesson 1 for a single note's
*fields*; the same argument applies again one level up, for the
*collection* of notes. A fixed set of named variables can't grow at
runtime and forces every piece of code that touches notes to be rewritten
by hand every time the count changes. A list costs nothing extra to
declare and handles zero notes, one note, or ten thousand with the exact
same code. The cost we're not paying yet: a plain Python list has no
memory of *where* these notes came from or *where* they should be saved
— that gap is what the rest of this lesson closes.

### Commands needed

`python3 note.py` — same as Lesson 1, no new flags.

### Run it

```
Groceries: Milk, eggs, bread
Gym: Leg day tomorrow
Idea: Build a notes app
```

### Connecting sentence

`Note` still only knows how to describe *itself* — the list is what lets
the surrounding code hold as many of them as it needs, without `Note`
having to change at all.

---

## Concept Unit: Turning a Note Into Plain Data

### The Problem

The list from the last unit lives entirely in memory — the moment the
Python process exits, all three notes vanish. To save a `Note` to a file,
we need to convert it into a shape a file format actually understands:
plain, simple data — strings, numbers, lists, and key-value pairs — not a
`Note` object, which Python's file-writing tools have no idea how to
handle directly.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — modified `note.py`.
- **Change type** — add (new method inside `Note`).
- **Location** — inside `class Note`, directly below `summary()`.
- **Dependencies** — none.

### The New Code

```python
    def to_dict(self):
        return {"title": self.title, "body": self.body}
```

### The Updated Project

```python
class Note:
    def __init__(self, title, body):
        self.title = title
        self.body = body

    def summary(self):
        return f"{self.title}: {self.body[:20]}"

    def to_dict(self):                                  # ← new
        return {"title": self.title, "body": self.body}  # ← new
```

`Note` now has two ways to describe itself: `summary()` for a human, and
`to_dict()` for anything that needs plain, storage-ready data instead —
like the file-saving code the next two units build.

### Introduce the concept in isolation

```python
n = Note("Groceries", "Milk, eggs, bread")
print(n.to_dict())
```

Real output:

```
{'title': 'Groceries', 'body': 'Milk, eggs, bread'}
```

That output proves `to_dict()` handed back something genuinely different
from `n` itself: not a `Note` object anymore, but a plain **dictionary**
(`dict`) — a set of key-value pairs, built here with `{}` dict-literal
syntax, holding the exact same data with no `Note`-specific behavior
attached to it at all.

### Discard the throwaway example

Nothing to discard separately here — the isolated example above *is* the
real project code, run directly; there's no disposable stand-in version
to throw away this time.

### Mechanical walkthrough

- `def to_dict(self):` — **(c) already basic.** Same instance-method
  syntax taught for `summary()` in Lesson 1.
- `return {"title": self.title, "body": self.body}` — **(a) first
  appearance** of dict-literal syntax: `{key: value, key: value}` builds
  a brand-new dictionary on the spot, here with two string keys,
  `"title"` and `"body"`, each mapped to the matching attribute already
  stored on `self`.

### CS lens

This is a **data transfer object** in miniature: a plain, structure-only
representation of an object, stripped of behavior, meant to travel
somewhere the real object can't — across a file boundary, a network
call, or a database write. Also recognized in: any API response body,
any row fetched from a SQL query before it's mapped back into an object,
any message put on a queue.

### SE lens

The alternative would be reaching directly into a `Note`'s attributes
from wherever we save it (`{"title": some_note.title, ...}` written
inline at the save site). That works once, but it duplicates the
knowledge of *what a Note's storable shape looks like* at every place
that needs to save one — and if a field is ever renamed, every one of
those call sites has to be found and fixed. Putting `to_dict()` on `Note`
itself means that knowledge has exactly one home, and it's the class
that actually owns the data.

### Commands needed

`python3 note.py`, unchanged.

### Run it

Shown above — `{'title': 'Groceries', 'body': 'Milk, eggs, bread'}`.

### Connecting sentence

The list from the previous unit can hold many `Note` objects; this unit
gives each of them a way to become plain data — the next unit gives us a
way to go back the other direction.

---

## Concept Unit: Rebuilding a Note From Plain Data

### The Problem

`to_dict()` turns a `Note` into a plain dictionary — but a dictionary
loaded back from a file isn't a `Note`, and `Note.__init__` expects
`title` and `body` as two separate arguments, not one dict. We need a way
to go from `{"title": ..., "body": ...}` back to a real `Note` object,
without forcing every caller to manually unpack the dict by hand.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — modified `note.py`.
- **Change type** — add (new method inside `Note`).
- **Location** — inside `class Note`, directly below `to_dict()`.
- **Dependencies** — none.

### The New Code

```python
    @classmethod
    def from_dict(cls, data):
        return cls(data["title"], data["body"])
```

### The Updated Project

```python
class Note:
    def __init__(self, title, body):
        self.title = title
        self.body = body

    def summary(self):
        return f"{self.title}: {self.body[:20]}"

    def to_dict(self):
        return {"title": self.title, "body": self.body}

    @classmethod                                          # ← new
    def from_dict(cls, data):                              # ← new
        return cls(data["title"], data["body"])            # ← new
```

`Note` can now travel in both directions: `to_dict()` turns a real note
into plain data, and `from_dict()` turns plain data back into a real,
fully working `Note` — with its `summary()` method and everything else,
intact.

### Introduce the concept in isolation

```python
class Box:
    def __init__(self, contents):
        self.contents = contents

    @classmethod
    def from_string(cls, text):
        return cls(text.split(","))

b = Box.from_string("apples,bread,cheese")
print(b.contents)
```

Real output:

```
['apples', 'bread', 'cheese']
```

`Box.from_string(...)` was called *without ever building a `Box`
first* — proving `from_string` is a second, alternate way to construct a
`Box`, run directly on the class itself rather than on an existing
instance. This is called a **classmethod**: `cls` inside it refers to
the class (`Box`, or in the real project, `Note`) rather than to an
existing instance, and `cls(...)` inside it calls the normal
`__init__` to build a fresh one, exactly the same way writing `Box(...)`
directly would. `Note.from_dict(...)` in the real code does the same
thing: it's an alternate front door onto the same `__init__`.

### Discard the throwaway example

`Box` is deleted now — its only job was showing a classmethod building
an instance without one already existing, isolated from JSON, files, or
anything else. `Note.from_dict()` is the real, permanent version.

### Mechanical walkthrough

- `@classmethod` — **(a) first appearance.** A decorator: it changes how
  the method below it is called. Instead of automatically receiving a
  specific instance as its first argument (the way `self` works), it
  receives the class itself.
- `def from_dict(cls, data):` — **(a) first appearance** of `cls`: by
  convention, the first parameter of a classmethod, standing in for
  "whatever class this method was called on" — `Note` here, but the same
  method would still work correctly if `Note` were ever subclassed.
- `return cls(data["title"], data["body"])` — **(a) first appearance**
  of dictionary indexing with `[]`: `data["title"]` looks up the value
  stored under the key `"title"`. `cls(...)` — **(b) hard concept
  reappearing**, the same constructor call from `__init__` in Lesson 1,
  just invoked through `cls` instead of the class's literal name, so it
  still runs `Note.__init__` underneath.

### CS lens

This is a **factory method**: a function whose whole job is constructing
an object, used when plain `__init__` alone isn't a natural fit for
every way callers need to build one — here, because the caller has a
dict, not two loose arguments. Also recognized in: `datetime.fromtimestamp(...)`
and `dict.fromkeys(...)` in Python's own standard library, `Optional.of(...)`
in Java, any `.parse(...)` method that builds an object from a string.

### SE lens

The alternative is unpacking the dict at every call site —
`Note(data["title"], data["body"])` written out by hand, wherever a
`Note` needs to be rebuilt. That's the same duplication problem
`to_dict()` solved, mirrored on the way back in: the knowledge of "how a
dict maps onto Note's constructor" would live in however many places
call it, instead of in one place on the class that actually owns that
mapping. The cost is one extra method — small, and paid once.

### Commands needed

`python3 note.py`, unchanged.

### Run it

```python
if __name__ == "__main__":
    original = Note("Groceries", "Milk, eggs, bread")
    as_dict = original.to_dict()
    rebuilt = Note.from_dict(as_dict)
    print(rebuilt.summary())
```

```
Groceries: Milk, eggs, bread
```

### Connecting sentence

A `Note` can now cross the object ↔ plain-data boundary in both
directions — which is exactly what's needed to actually write one to a
file and read it back, next.

---

## Concept Unit: Saving and Loading a List of Notes

### The Problem

We can turn one `Note` into a dict and back. What we actually need is to
turn the *whole list* of notes from the first unit into a file on disk,
and later read that file back into an equivalent list — so notes survive
between separate runs of the program, instead of disappearing the moment
Python exits.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `storage.py`.
- **Change type** — add.
- **Location** — new file, same directory as `note.py`.
- **Dependencies** — `note.py` from this lesson (imports `Note`); Python's
  built-in `json` module, no installation required.

### The New Code

```python
import json
from note import Note


def save_notes(notes, path):
    with open(path, "w") as f:
        json.dump([n.to_dict() for n in notes], f)


def load_notes(path):
    with open(path, "r") as f:
        raw = json.load(f)
    return [Note.from_dict(item) for item in raw]
```

### The Updated Project

`storage.py` is a brand-new file, so this *is* the file in full — there's
no larger enclosing structure it needs to be shown inside of yet.

### Introduce the concept in isolation

```python
import json

data = {"name": "Ada", "age": 36}

with open("person.json", "w") as f:
    json.dump(data, f)

with open("person.json", "r") as f:
    loaded = json.load(f)

print(loaded)
print(type(loaded))
```

Real output:

```
{'name': 'Ada', 'age': 36}
<class 'dict'>
```

Three new things proved themselves at once here, and each is worth
naming on its own. `import json` pulls in Python's built-in **module**
for reading and writing the JSON text format — code someone else already
wrote, made available under the name `json`. `with open(path, "w") as f:`
opens a file and hands back a file object bound to `f`; this is called a
**context manager**, and its whole point is that the file is
automatically, guaranteedly closed the instant the indented block ends
— even if something inside that block raises an error — so there's no
way to forget to close it. `json.dump(data, f)` then writes `data` into
that open file as JSON text, and `json.load(f)` does the reverse,
reading JSON text back out as a real Python `dict` — proven by
`print(type(loaded))` reporting `<class 'dict'>`, not a string.

**When real project input gets more complex than one flat dict**, the
project's actual data isn't a single `{"name": ..., "age": ...}` — it's
a *list* of note-dicts, one per note. Before trusting `json.dump`/`json.load`
against that shape, it's worth checking, in the interpreter, that a list
of dicts round-trips the same way a single dict just did:

```python
>>> import json
>>> json.dumps([{"title": "A"}, {"title": "B"}])
'[{"title": "A"}, {"title": "B"}]'
>>> json.loads('[{"title": "A"}, {"title": "B"}]')
[{'title': 'A'}, {'title': 'B'}]
```

It does — `json` handles a list of dicts exactly the way it handles one
dict, just with `[]` wrapped around it, which is exactly the shape
`save_notes`/`load_notes` below rely on.

### Discard the throwaway example

`person.json` and the `data`/`loaded` variables above are deleted — they
existed only to prove `json.dump`/`json.load` and the `with` statement
work, isolated from `Note` entirely. `storage.py`'s real functions are
the permanent version.

### Mechanical walkthrough

- `import json` — **(a) first appearance** of `import`: it makes an
  entire external module's functions available under the name `json`,
  here Python's standard-library module for the JSON format.
- `from note import Note` — **(b) hard concept reappearing** in a new
  form: the same idea as `import json` — pulling in code defined
  elsewhere — but importing one specific name (`Note`) out of a local
  file (`note.py`) instead of a whole built-in module.
- `def save_notes(notes, path):` — **(c) already basic**, a plain
  function definition — the same shape as any method minus `self`,
  since this isn't attached to a class.
- `with open(path, "w") as f:` — **(a) first appearance,** covered above:
  opens the file at `path` for writing (`"w"`), and guarantees it gets
  closed when the block ends.
- `json.dump([n.to_dict() for n in notes], f)` — **(a) first appearance**
  of a **list comprehension**: `[n.to_dict() for n in notes]` builds a
  brand-new list by running `.to_dict()` on every `n` in `notes`, in one
  expression — equivalent to a `for` loop that appends each result, but
  written as a single line. `json.dump(..., f)` — **(b) hard concept
  reappearing**, the same call proven in the isolated lab above, just
  now writing a list of dicts instead of one.
- `def load_notes(path):` — **(c) already basic.**
- `with open(path, "r") as f:` — **(b) hard concept reappearing**, same
  context manager, opening for reading (`"r"`) instead of writing.
- `raw = json.load(f)` — **(b) hard concept reappearing**, same call as
  the lab, reading back a Python value — here, a list of dicts instead
  of one.
- `return [Note.from_dict(item) for item in raw]` — **(b) hard concept
  reappearing**: another list comprehension, this time calling the
  `from_dict` classmethod from the previous unit on every dict in `raw`
  to rebuild real `Note` objects.

### CS lens

This is **serialization** (the object → file direction) and
**deserialization** (the file → object direction): converting in-memory
data to a storable/transmittable form and back. Also recognized in:
saving a game's state to a save file, an HTTP API turning a database
row into a JSON response body, a browser turning a JavaScript object into
`localStorage` text.

### SE lens

We chose plain functions here, not yet a class — deliberately, because
this unit's only job is proving the round trip actually works. The
alternative already visible on the horizon is hiding this behind an
object instead of two free functions, so callers never call `json.dump`
or manage file paths themselves — that's the very next unit. The
maintenance cost we're accepting for now: `save_notes`/`load_notes` know
the file format is JSON, and so does anything that calls them directly;
that knowledge is about to get contained in one place.

### Commands needed

`python3 storage.py` — runs the demo in `storage.py`'s own
`if __name__ == "__main__":` block.

### Run it

```python
if __name__ == "__main__":
    notes = [
        Note("Groceries", "Milk, eggs, bread"),
        Note("Gym", "Leg day tomorrow"),
    ]
    save_notes(notes, "notes.json")

    reloaded = load_notes("notes.json")
    for n in reloaded:
        print(n.summary())
```

```
Groceries: Milk, eggs, bread
Gym: Leg day tomorrow
```

And the actual file written to disk, `notes.json`:

```json
[{"title": "Groceries", "body": "Milk, eggs, bread"}, {"title": "Gym", "body": "Leg day tomorrow"}]
```

### Connecting sentence

Notes built with the `to_dict()`/`from_dict()` methods from the last two
units now genuinely survive a full write-to-disk-and-read-back cycle —
what's still missing is a single object that owns this behavior, instead
of two free functions and a file path the rest of the program has to
manage by hand.

---

## Concept Unit: The Repository Pattern

### The Problem

Right now, any code that wants to work with notes has to juggle three
separate things itself: the in-memory list, the file path string, and
remembering to call `save_notes`/`load_notes` at the right moments with
the right arguments in the right order. Nothing stops a caller from
saving to the wrong path, or forgetting to save at all after adding a
note. We want one object that owns *all* of that, so the rest of the
program can just say "add this note" and "save," without knowing or
caring that the storage mechanism underneath is a JSON file at all.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `repository.py`.
- **Change type** — add.
- **Location** — new file, same directory as `note.py` and `storage.py`.
- **Dependencies** — `note.py` from this lesson (imports `Note`);
  built-in `json`. `storage.py`'s two functions are being folded into
  this file's methods rather than imported, since their whole reason to
  exist was rehearsing this exact logic before it got a permanent home.

### The New Code

```python
class NoteRepository:
    def __init__(self, path):
        self.path = path
        self.notes = []

    def add(self, note):
        self.notes.append(note)

    def save(self):
        with open(self.path, "w") as f:
            json.dump([n.to_dict() for n in self.notes], f)

    def load(self):
        with open(self.path, "r") as f:
            raw = json.load(f)
        self.notes = [Note.from_dict(item) for item in raw]
```

### The Updated Project

```python
import json
from note import Note


class NoteRepository:
    def __init__(self, path):              # ← new
        self.path = path                   # ← new
        self.notes = []                    # ← new

    def add(self, note):                   # ← new
        self.notes.append(note)            # ← new

    def save(self):                        # ← new
        with open(self.path, "w") as f:    # ← new
            json.dump(                      # ← new
                [n.to_dict() for n in self.notes], f  # ← new
            )

    def load(self):                        # ← new
        with open(self.path, "r") as f:    # ← new
            raw = json.load(f)             # ← new
        self.notes = [                     # ← new
            Note.from_dict(item) for item in raw  # ← new
        ]
```

`NoteRepository` now owns three things at once that used to be scattered
across a loose list and two free functions: *where* the notes live on
disk (`self.path`), *which* notes are currently loaded (`self.notes`),
and *how* to move between the two (`save`/`load`). Everything outside
this class from now on talks to a `NoteRepository`, never to `json` or
`open` directly.

### Introduce the concept in isolation

No new throwaway lab needed here — every syntactic piece inside
`NoteRepository` (`__init__`, instance methods, `self`, `with`,
`json.dump`/`json.load`, list comprehensions) was already isolated and
proven in earlier units, in this lesson and the last. What's genuinely
new is only the *shape*: bundling storage location, in-memory state, and
save/load behavior behind one object, which the code above already shows
directly.

### Discard the throwaway example

Nothing separate to discard — same reason as `to_dict()` earlier in this
lesson: the real code above is the demonstration.

### Mechanical walkthrough

- `def __init__(self, path):` — **(c) already basic**, the same
  constructor shape from Lesson 1, now taking a file path instead of
  note fields.
- `self.path = path` / `self.notes = []` — **(c) already basic**: two
  attributes, one storing the given path, one starting as an empty list
  — the same list concept from this lesson's first unit, just now living
  on an object instead of a bare local variable.
- `def add(self, note):` / `self.notes.append(note)` — **(c) already
  basic**, the exact `append` call from the first unit, just wrapped in
  a method so callers never touch `self.notes` directly.
- `def save(self):` through `json.dump(...)` — **(b) hard concept
  reappearing**: the exact save logic from `storage.py`'s `save_notes`,
  operating on `self.notes` and `self.path` instead of function
  parameters.
- `def load(self):` through `self.notes = [...]` — **(b) hard concept
  reappearing**: the exact load logic from `storage.py`'s `load_notes`,
  with one meaningful difference — instead of `return`-ing a new list,
  it assigns the result to `self.notes`, replacing this repository's own
  state in place.

### CS lens

This is the **Repository pattern**: an object that mediates between the
rest of the application and wherever data actually lives, so calling
code works with plain objects (`Note`s) and never touches storage
details (files, JSON, database rows, network calls) directly. Also
recognized in: an ORM's `Model.objects` in Django, a `UserRepository`
in almost any enterprise Java or C# codebase, a browser's
`localStorage`-backed wrapper class in a front-end app, a `git` porcelain
command hiding the actual object-database format underneath.

### SE lens

The alternative — what the previous unit already did — is calling
`save_notes`/`load_notes` directly, everywhere notes need saving or
loading, each call site tracking its own file path. That works for a
five-line demo script; it breaks down the moment two different parts of
a larger program need to agree on the same path, or the storage format
changes from JSON to something else — every call site would need
updating. `NoteRepository` costs one class, and in exchange, the storage
format could change entirely (JSON file → SQLite → a web API) by
rewriting only `save`/`load`, with every caller's code — `repo.add(...)`,
`repo.save()` — untouched. The tradeoff being accepted: `NoteRepository`
currently keeps its *entire* note list in memory at once, reading and
writing the whole file every time — fine at personal-notes scale, not at
database scale. That's a real limit this project will hit later, not a
problem yet.

### Commands needed

`python3 repository.py`, same as before — no new tools.

### Run it

```python
if __name__ == "__main__":
    repo = NoteRepository("notes.json")
    repo.add(Note("Groceries", "Milk, eggs, bread"))
    repo.add(Note("Gym", "Leg day tomorrow"))
    repo.save()

    fresh_repo = NoteRepository("notes.json")
    fresh_repo.load()
    for n in fresh_repo.notes:
        print(n.summary())
```

```
Groceries: Milk, eggs, bread
Gym: Leg day tomorrow
```

Note the second half of that run: `fresh_repo` is a completely separate
`NoteRepository` instance from `repo` — it never touched `repo.notes`
directly. The only thing connecting them is the file at `"notes.json"`
on disk, proving the save really did persist, and the load really did
rebuild working `Note` objects (not just raw dicts) from scratch.

### Connecting sentence

Every concept built earlier in this lesson — the list, `to_dict`,
`from_dict`, the JSON round trip — is now reachable through one object's
four methods, and that object is what the rest of the project will talk
to from here on.

---

## Closing

**Connect the pieces.** Follow one note all the way through: the string
`"Groceries"` is passed into `Note("Groceries", "Milk, eggs, bread")`,
added to a `NoteRepository` via `repo.add(...)` (which appends it to
`self.notes` — the list from Unit 1), converted to
`{"title": "Groceries", "body": "Milk, eggs, bread"}` by `to_dict()`
inside `repo.save()`, written into `notes.json` on disk by `json.dump`,
then — in an entirely separate `NoteRepository` instance — read back out
by `json.load`, and rebuilt into a real `Note` object by `from_dict()`
inside `repo.load()`. One value, five transformations, one object
directing all of them.

**What breaks without this.** Calling `.load()` on a repository whose
file doesn't exist yet fails loudly and specifically:

```
Traceback (most recent call last):
  File "repo_broken.py", line 4, in <module>
    repo.load()
  File "repository.py", line 18, in load
    with open(self.path, "r") as f:
         ^^^^^^^^^^^^^^^^^^^^
FileNotFoundError: [Errno 2] No such file or directory: 'missing.json'
```

That error is `open(..., "r")` refusing to read a file that was never
written — proof that `load()` genuinely depends on a prior `save()`
having happened, not on some default state quietly standing in for it.
(This is also a real gap worth naming honestly: a brand-new
`NoteRepository` for a brand-new user has no file yet, and right now
that's a crash, not a graceful "start empty." That's worth fixing, but
it's not this lesson's job — noted, not solved.)

**Exercises.**
1. Add a `delete(self, title)` method to `NoteRepository` that removes
   the first note whose `title` matches, using a plain loop or a list
   comprehension with a condition.
2. Make `load()` tolerate a missing file by starting `self.notes` as
   `[]` instead of raising `FileNotFoundError` — you'll need to check
   whether the file exists first (look up `os.path.exists`).
3. Add a `created_at` field to `Note.__init__`, and update both
   `to_dict()` and `from_dict()` to carry it through the round trip.
   Confirm it survives a save/load cycle by printing it after reload.

**Definition of done.**
- [ ] `note.py` has `to_dict()` and `from_dict()`, both run and both
      shown producing the output above.
- [ ] `repository.py` exists with a working `NoteRepository`: `add`,
      `save`, and `load` all run successfully against a real file on
      disk.
- [ ] You've confirmed persistence for real — created a repo, added
      notes, saved, then loaded into a *separate* repository instance
      and printed the same notes back out.
- [ ] You've triggered the real `FileNotFoundError` on purpose (load
      before ever saving) and read the traceback.
- [ ] Commit with a message explaining why — e.g. `"Hide note storage
      behind a Repository so callers never touch JSON or file paths
      directly"` — not `"add repository.py"`.

**Next lesson** turns this into something you actually run from a
terminal with arguments — `argparse`, a real CLI — and, once there's more
than a handful of notes, a first look at `Strategy` for choosing how they
get sorted or displayed.
