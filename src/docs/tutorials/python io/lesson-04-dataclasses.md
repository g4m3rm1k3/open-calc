# Lesson 4: A Dict Isn't a Record — Parsing Rows Into Real Objects

**What you will build:** a `Contact` dataclass in a new
`recordkeeper/models.py`, plus `contact_from_row` and `contact_to_row`
functions in `csv_source.py` that convert between CSV rows and real
`Contact` objects — replacing the plain dicts `load_contacts_csv` and
`write_contacts_csv` passed around since Lesson 3. The transferable
problem: a plain `dict` has no fixed shape at all, so a typo'd key is
invisible until the exact moment that specific key is looked up, which
can be far away from and long after the dict was actually built; a
dataclass gives a record type real, fixed structure that's checked at
construction time instead.

**What you need to know first:** Lesson 3 — `csv.DictReader` /
`csv.DictWriter` and the dict-per-row shape `load_contacts_csv` and
`write_contacts_csv` were built around.

**Terms used in this lesson**

- **`@dataclass`** — a decorator from the standard library's
  `dataclasses` module that, given a class body naming only its fields
  and their types, automatically generates that class's `__init__`,
  `__repr__`, and `__eq__` methods. It exists because a class whose
  entire job is holding a fixed set of named values used to require
  writing all three of those methods by hand, every time, for what is
  structurally the same boilerplate pattern each time.
- **Type hint** — a name followed by `: SomeType` on a variable,
  parameter, or class attribute, stating what type of value belongs
  there. It exists to document a value's intended shape directly in the
  code, in a form a tool can also read; on its own, in ordinary Python,
  a type hint is not enforced at runtime — nothing stops a `str`-hinted
  attribute from actually holding an `int` unless something else (such
  as `@dataclass`, which reads the hints to know what fields to
  generate `__init__` for) checks it.

**Objects and methods used**

- **`dataclasses.dataclass`**
  - *What it is:* A class decorator from the standard library.
  - *Implementation:* Applied as `@dataclass` above a class definition
    whose body consists of type-hinted class attributes (optionally
    with default values); reads those hints to generate `__init__`,
    `__repr__`, and `__eq__` for the class.
  - *Its use:* Turns `Contact`'s four-line field list into a fully
    working record type with no method bodies written by hand.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    decorator function, applied once, at class-definition time, not
    called again afterward; responsible for inspecting a class's own
    type-hinted attributes and attaching generated `__init__`,
    `__repr__`, and `__eq__` methods to that class; depends entirely on
    the class body it decorates already listing its fields as
    type-hinted attributes; connects to nothing outside the class it
    decorates — it modifies that one class and returns it; shape is a
    class in, the same class (now with new methods attached) out.

---

## Concept Unit: What a plain dict actually risks

### The Problem

Since Lesson 3, a contact has been a `dict` — `row["name"]`,
`row["email"]`, and so on, keyed by plain strings typed out wherever
a field is needed. Nothing about `dict` itself enforces which keys are
supposed to exist, or catches a key typed slightly wrong.

> **Stop and think:** If a function does `contact["emial"]` — one
> letter transposed from `"email"` — on a dict that only has an
> `"email"` key, when would you expect Python to notice something is
> wrong: the moment the dict is created, the moment that function is
> defined, or only once that exact line of code actually runs?

### Introduce the concept in isolation

```python
def format_contact(contact):
    return f"{contact['name']} <{contact['emial']}>"  # typo: 'emial'

contact = {"id": "1", "name": "Alice Smith", "email": "alice@example.com"}

try:
    print(format_contact(contact))
except KeyError as e:
    print(f"{type(e).__name__}:", e)

print(contact)
```

Real output:

```
KeyError: 'emial'
{'id': '1', 'name': 'Alice Smith', 'email': 'alice@example.com'}
```

Nothing flagged the typo when `format_contact` was written, and nothing
flagged it when `contact` was built — the dict prints out perfectly
normally, with a completely valid `"email"` key sitting right there.
The `KeyError` only happens the instant `format_contact` actually runs
against a real dict, which could be far away in the codebase, and long
after, from wherever the typo was actually typed. A plain `dict` has no
fixed shape of its own to check a key against; it accepts any string
key at any time, so the only thing that can ever catch a wrong one is
actually running the exact line that uses it.

### Discard the throwaway example

This lab's `format_contact` and `contact` dict are discarded; they
exist only to make a dict's lack of structure produce a real,
observable failure.

### Project Change

- **Reference Source** — none; from-scratch, as in Lessons 1-3.
- **Files affected** — new file `recordkeeper/models.py`.
- **Change type** — add.
- **Location** — n/a (new file).
- **Dependencies** — `dataclasses`, standard library.

### The New Code

```python
from dataclasses import dataclass
```

### The Updated Project

Brand-new file, nothing surrounding this fragment yet — covered by
Project Change above.

### Mechanical walkthrough

- **`from dataclasses import dataclass`** — an import statement,
  bringing the name `dataclass` (full treatment above, in Objects and
  methods used) into this module's namespace from the standard
  library's `dataclasses` module, so it can be used as a decorator
  below.

### CS lens

A plain dict standing in for a record with an assumed-but-unenforced
shape is what's sometimes called a **stringly-typed** structure — data
whose real structure only exists as an informal convention among the
humans writing the code, not as anything the language itself tracks or
checks.

```
Also recognized in: passing loosely-structured JSON straight through a
codebase with no schema, environment-variable-configured systems where
a misspelled variable name silently does nothing, spreadsheet "APIs"
where a column's meaning is only ever documented in a comment
```

### SE lens

The alternative already in use — plain dicts — isn't wrong in every
case; for genuinely dynamic data (an API response whose exact fields
aren't known ahead of time) a dict is often the right, flexible choice.
The tradeoff `recordkeeper` is actually facing is different: contacts
have a known, fixed shape from the moment they're defined, and every
function touching one already assumes that shape informally. Keeping
that shape as an informal convention instead of a real type means the
convention has to be re-learned, correctly, by every new function that
touches a contact, with the typo lab above being exactly what happens
the first time it's re-learned incorrectly. The cost of fixing this is
one small new file; the debt of not fixing it grows by one more place
the informal convention could be gotten wrong, every time a new
function touches a contact.

### Commands needed

None new.

### Run it

Shown above under "Introduce the concept in isolation" — real output.

### Connect

This unit shows what a plain dict's lack of structure actually costs;
the next unit introduces `@dataclass` as the fix, and finishes
`Contact`.

---

## Concept Unit: `@dataclass`

### The Problem

Writing a real class with `id`, `name`, `email`, and `notes` fields by
hand means writing `__init__` to accept and store all four, `__repr__`
to print them usefully, and `__eq__` to compare two instances
field-by-field — three methods whose bodies are entirely predictable
from the field list alone, and which would have to be kept in sync by
hand every time a field is added or removed.

> **Stop and think:** If a class's `__init__`, `__repr__`, and `__eq__`
> can all, in principle, be mechanically derived from nothing more than
> a list of field names and their types, what would it take for
> something to generate all three automatically, just from that list —
> without a human writing any of the three method bodies at all?

### Introduce the concept in isolation

```python
from dataclasses import dataclass

@dataclass
class Contact:
    id: str
    name: str
    email: str
    notes: str = ""

c1 = Contact(id="1", name="Alice Smith", email="alice@example.com", notes="")
print("repr:", c1)
print("attribute access:", c1.name, c1.email)

c2 = Contact(id="1", name="Alice Smith", email="alice@example.com", notes="")
print("c1 == c2 ->", c1 == c2)

try:
    Contact(id="2", name="Bob", emial="bob@example.com")
except TypeError as e:
    print(f"{type(e).__name__}:", e)

try:
    Contact(id="3", name="Cara")
except TypeError as e:
    print(f"{type(e).__name__}:", e)
```

Real output:

```
repr: Contact(id='1', name='Alice Smith', email='alice@example.com', notes='')
attribute access: Alice Smith alice@example.com
c1 == c2 -> True
TypeError: Contact.__init__() got an unexpected keyword argument 'emial'
TypeError: Contact.__init__() missing 1 required positional argument: 'email'
```

No `__init__`, `__repr__`, or `__eq__` was written anywhere in this
class body — only four type-hinted attribute names, one with a default
value. `@dataclass` (named here in full) reads that field list and
generates working versions of all three: `repr:` shows a real,
readable `__repr__` naming every field and its value; `c1 == c2` is
`True` because the generated `__eq__` compares both instances
field-by-field rather than by object identity, the way plain classes
compare by default. The two `TypeError`s are the actual payoff this
unit exists for: the same `"emial"` typo from the previous unit, but
now caught immediately, at the exact moment a `Contact` is constructed
with a bad keyword — not silently accepted and deferred to whatever
later line happens to look the field up.

### Discard the throwaway example

`c1`, `c2`, and this lab's failed construction attempts are discarded;
the `Contact` class shape itself — the actual point — carries forward
into the project below.

### Project Change

- **Reference Source** — none; from-scratch, as in the previous unit.
- **Files affected** — `recordkeeper/models.py` (modified, completing
  `Contact`); `recordkeeper/ingest/csv_source.py` (modified, routing
  through `Contact` instead of raw dicts).
- **Change type** — add (finishing `models.py`); refactor
  (`csv_source.py`'s two functions now convert to/from `Contact`
  instead of passing dicts straight through).
- **Location** — `models.py`: after the `import` already added;
  `csv_source.py`: `load_contacts_csv` and `write_contacts_csv`, both
  already existing from Lesson 3.
- **Dependencies** — `recordkeeper.models.Contact`, just added.

### The New Code

```python
@dataclass
class Contact:
    id: str
    name: str
    email: str
    notes: str = ""
```

```python
from recordkeeper.models import Contact


def contact_from_row(row):
    return Contact(id=row["id"], name=row["name"], email=row["email"], notes=row["notes"])


def contact_to_row(contact):
    return {"id": contact.id, "name": contact.name, "email": contact.email, "notes": contact.notes}
```

### The Updated Project

`recordkeeper/models.py`, complete:

```python
1  from dataclasses import dataclass
2
3
4  @dataclass                  # ← new
5  class Contact:              # ← new
6      id: str                 # ← new
7      name: str               # ← new
8      email: str              # ← new
9      notes: str = ""         # ← new
```

`recordkeeper/ingest/csv_source.py`, complete:

```python
 1  import csv
 2
 3  from recordkeeper.models import Contact          # ← new
 4
 5
 6  def contact_from_row(row):                        # ← new
 7      return Contact(                                # ← new
 8          id=row["id"],                              # ← new
 9          name=row["name"],                          # ← new
10          email=row["email"],                        # ← new
11          notes=row["notes"],                        # ← new
12      )                                               # ← new
13
14
15  def contact_to_row(contact):                       # ← new
16      return {                                        # ← new
17          "id": contact.id,                          # ← new
18          "name": contact.name,                      # ← new
19          "email": contact.email,                    # ← new
20          "notes": contact.notes,                    # ← new
21      }                                               # ← new
22
23
24  def load_contacts_csv(path):
25      with open(path, newline="", encoding="utf-8") as f:
26          reader = csv.DictReader(f)
27          return [contact_from_row(row) for row in reader]  # ← changed
28
29
30  def write_contacts_csv(path, contacts, fieldnames):
31      with open(path, "w", newline="", encoding="utf-8") as f:
32          writer = csv.DictWriter(f, fieldnames=fieldnames)
33          writer.writeheader()
34          writer.writerows(contact_to_row(c) for c in contacts)  # ← changed
```

`csv.DictReader` and `csv.DictWriter` (Lesson 3) still do the actual
CSV parsing and writing — nothing about that changed. What changed is
what sits on either side of them: `load_contacts_csv` now converts
every dict `DictReader` hands back into a real `Contact` via
`contact_from_row` before returning it, and `write_contacts_csv` now
expects a list of `Contact` objects, converting each one back to a
plain dict via `contact_to_row` right before `DictWriter` needs one —
`csv`'s own dict-per-row interface is still exactly what it was, it's
just no longer the shape the rest of `recordkeeper` has to think in.

### Mechanical walkthrough

- **`@dataclass` above `class Contact:`** — full treatment above
  (Objects and methods used and the isolated lab just run); generates
  `Contact.__init__`, `__repr__`, and `__eq__` from the four field
  lines below it.
- **`id: str`, `name: str`, `email: str`** — type-hinted class
  attributes with no default; full treatment of a type hint above, in
  Terms. Because none of these three has a default value, `@dataclass`
  generates an `__init__` that requires all three as arguments — this
  is exactly what produced the second `TypeError` in the isolated lab,
  for the call missing `email`.
- **`notes: str = ""`** — a type-hinted class attribute *with* a
  default value; `@dataclass` generates an `__init__` where `notes`
  is optional, defaulting to `""` if the caller doesn't supply it.
- **`contact_from_row(row)`** — a plain function (not a method on
  `Contact` itself); reads four specific keys off `row` — a dict, the
  same shape `csv.DictReader` yields, per Lesson 3 — and passes them as
  keyword arguments into `Contact`'s generated `__init__`.
- **`contact_to_row(contact)`** — the inverse: reads `Contact`'s four
  attributes off a real `Contact` instance via plain attribute access
  (`contact.id`, and so on) and builds a fresh plain `dict` from them,
  in the exact shape `csv.DictWriter` (Lesson 3) expects to receive.
- **`[contact_from_row(row) for row in reader]`** — the same list
  comprehension shape from Lesson 3, now calling `contact_from_row` on
  each row instead of collecting the raw dict directly.
- **`(contact_to_row(c) for c in contacts)`** — a generator
  expression, not a list comprehension: syntactically identical except
  for using `(...)` instead of `[...]`, and producing each converted
  dict one at a time, on demand, as `writer.writerows` consumes it,
  rather than building the whole converted list in memory first — the
  same streaming idea from Lesson 1, applied here to converting rows
  instead of reading a file.

### CS lens

Converting between two different representations of the same
data — a plain dict on one side of a boundary, a real `Contact` object
on the other — at a single, well-defined seam (`contact_from_row` /
`contact_to_row`) rather than letting either representation leak
across the whole codebase, is an instance of the **adapter pattern** —
isolating an external format's shape behind a conversion layer so the
rest of a system only ever has to know about its own internal shape.

```
Also recognized in: an ORM converting database rows into model
objects and back, a web framework deserializing an incoming JSON
request body into a typed object before a handler ever sees it, a
device driver translating between a hardware's raw register format and
an operating system's generic API
```

### SE lens

The alternative not chosen is letting `Contact`'s own `__init__`
accept a raw CSV row dict directly — `Contact(**row)` — skipping
`contact_from_row` as a separate step. That's less code, and for a CSV
file whose column names exactly match `Contact`'s field names, it
would even work. The tradeoff is coupling `Contact`'s own shape
directly to one specific data source's column names — the moment a
different source (an API response with a `full_name` key instead of
`name`, covered in a later lesson) needs to produce a `Contact`, either
`Contact` itself has to grow source-specific logic, or that source
needs its own renaming step anyway. Keeping `contact_from_row` as
`csv_source.py`'s own, separate function means `Contact` stays a plain,
source-agnostic record, and every new data source this curriculum adds
gets its own small `X_from_row`-shaped conversion function instead of
`Contact` accumulating special cases for each one.

### Commands needed

None new.

### Run it

Real output, from an actual run against the same `data/contacts.csv`
file Lesson 3 built:

```python
from recordkeeper.ingest.csv_source import load_contacts_csv

contacts = load_contacts_csv("data/contacts.csv")
for c in contacts:
    print(c)
```

```
Contact(id='1', name='Alice Smith', email='alice@example.com', notes='Prefers email, not calls')
Contact(id='2', name='Bob Lee', email='bob@example.com', notes='Referred by Alice\nFollow up in June')
```

### Connect

The previous unit showed a real, observable failure a plain dict
cannot catch on its own; this unit's `Contact` dataclass, and the two
small conversion functions built around it, mean that same class of
typo now fails loudly, at construction time, inside
`contact_from_row` — the one place it can be fixed once — instead of
silently, wherever a mis-keyed field eventually gets used.

---

## Connect the pieces

Tracing Alice's row, start to finish, through this lesson's own
changes on top of Lesson 3's: `csv.DictReader` (Lesson 3) yields
`{'id': '1', 'name': 'Alice Smith', 'email': 'alice@example.com',
'notes': 'Prefers email, not calls'}` for her row. `contact_from_row`,
new in this lesson, reads exactly those four keys off that dict and
passes them as keyword arguments into `Contact`'s `@dataclass`-generated
`__init__`, producing a real `Contact(id='1', name='Alice Smith',
email='alice@example.com', notes='Prefers email, not calls')` object —
proven, above, by an actual run against the real `data/contacts.csv`
file. From this point forward, any function `recordkeeper` writes
against a contact can reach for `.name` or `.email` as real attribute
access, on a real, fixed-shape type — not a string key into a dict that
nothing checks until the moment it's used.
