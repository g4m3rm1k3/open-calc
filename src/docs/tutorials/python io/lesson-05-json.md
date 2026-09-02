# Lesson 5: JSON — What `json.dumps` Actually Does, Proven By Doing It Ourselves

**What you will build:** a `json_source` module added to `recordkeeper`
with `contacts_to_json` and `contacts_from_json`, using the standard
library's `json` module to serialize `Contact` objects to a real
`data/contacts.json` file and back. The transferable problem: `json`
can't serialize a `Contact` on its own, so this lesson shows exactly
why and fixes it with `dataclasses.asdict` and `json.dumps`'s
`default=` hook — and then, to prove the standard library isn't doing
anything mysterious, hand-writes a small tokenizer and parser that
reproduce `json.loads`'s own behavior on a real, non-trivial input,
checked against `json.loads` directly.

**What you need to know first:** Lesson 3 — the dict-per-row shape CSV
parsing was built around. Lesson 4 — `@dataclass`, `Contact`, and why
`recordkeeper` converts between plain dicts and real objects at one
clean seam instead of passing dicts everywhere.

**Terms used in this lesson**

- **Serialization** — converting an in-memory value (an object, a
  dict, a number) into a flat sequence of characters or bytes suitable
  for storing in a file or sending over a network; **deserialization**
  is the reverse. Both exist because a running program's own in-memory
  objects don't exist once the process ends or the data leaves that
  process — some agreed-upon, storable/transmittable representation is
  required to get the same data back later or somewhere else.
- **Tokenizing** — splitting a raw string into a sequence of small,
  meaningful chunks (a token per punctuation character, per string
  literal, per number) before trying to understand the string's overall
  structure. It exists because trying to interpret a format's grammar
  directly against raw, uncategorized characters means re-deciding, at
  every single character, what kind of thing it might be part of;
  tokenizing does that categorization once, up front, so parsing can
  work with a shorter list of already-identified pieces instead.

**Objects and methods used**

- **`json.dumps`**
  - *What it is:* A function from the standard library's `json` module
    that serializes a Python value into a JSON-formatted `str`.
  - *Implementation:* `json.dumps(obj, *, default=None, indent=None,
    ...) -> str`; natively handles `dict`, `list`, `str`, `int`,
    `float`, `bool`, and `None` directly; for any other type, calls the
    `default` callable (if provided) with that value and expects a
    JSON-serializable value back, or raises `TypeError` if no
    `default` is given.
  - *Its use:* What `contacts_to_json` uses to turn a list of plain
    dicts (already converted from `Contact` objects via `asdict`) into
    real JSON text.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    standard-library function; responsible for walking a Python value's
    structure and producing valid JSON text representing it, delegating
    to `default` for any type it doesn't natively know how to
    represent; depends on its input being built entirely out of
    natively-supported types, or a `default` function able to reduce
    anything else down to one; called directly by `contacts_to_json`;
    shape is one Python value in, one `str` out.

- **`json.loads`**
  - *What it is:* The inverse of `json.dumps` — parses a JSON-formatted
    `str` back into native Python values.
  - *Implementation:* `json.loads(s) -> a Python value`; a JSON object
    becomes a `dict`, a JSON array becomes a `list`, JSON strings/
    numbers/booleans/`null` become `str`/`int`-or-`float`/`bool`/`None`.
  - *Its use:* What `contacts_from_json` uses to turn stored JSON text
    back into plain dicts, which are then converted into real `Contact`
    objects.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    standard-library function; responsible for validating that a
    string is well-formed JSON and building the equivalent nested
    Python structure from it, raising `json.JSONDecodeError` on
    malformed input; depends only on the string it's given; called
    directly by `contacts_from_json`; shape is one `str` in, one Python
    value out (whatever native type the JSON's outermost value maps
    to).

- **`dataclasses.asdict`**
  - *What it is:* A standard-library function that converts a
    dataclass instance into a plain `dict`.
  - *Implementation:* `asdict(instance) -> dict`, recursively — one key
    per field, values taken from the instance's own attributes.
  - *Its use:* Converts each `Contact` into exactly the plain-dict
    shape `json.dumps` already knows how to serialize natively, without
    writing that conversion by hand for each field.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    standard-library function; responsible for producing a dict whose
    keys and values match a dataclass instance's own fields and current
    values, with no logic beyond that reflection; depends on its
    argument actually being a dataclass instance (raises `TypeError`
    otherwise); called on each `Contact` inside `contacts_to_json`
    before `json.dumps` ever sees it; shape is one dataclass instance
    in, one `dict` out, same field names as keys.

---

## Concept Unit: `json.dumps`/`loads`, and why a `Contact` can't go straight in

### The Problem

`Contact` (Lesson 4) is a real Python class. `json.dumps` only knows
how to serialize a fixed, small set of native Python types — it has no
built-in notion of what a `Contact` is, or which of its attributes
should end up in the output.

> **Stop and think:** `json.dumps({"name": "Alice"})` clearly works —
> a plain dict maps directly onto a JSON object. Given that `Contact`
> is not a dict, a list, a string, a number, a bool, or `None`, what do
> you expect `json.dumps(some_contact)` to do: silently produce some
> best-guess output, or refuse outright? If it refuses, what would it
> actually need to be told in order to succeed?

### Introduce the concept in isolation

```python
import json
from dataclasses import dataclass

@dataclass
class Contact:
    id: str
    name: str
    email: str
    notes: str = ""

data = {"name": "Alice", "age": 30, "active": True, "tags": None}
print("dumps:", json.dumps(data))
print("dumps indented:")
print(json.dumps(data, indent=2))

parsed = json.loads(json.dumps(data))
print("round trip ==", parsed == data, "type:", type(parsed))

contact = Contact(id="1", name="Alice Smith", email="alice@example.com", notes="")
try:
    json.dumps(contact)
except TypeError as e:
    print(f"{type(e).__name__}:", e)
```

Real output:

```
dumps: {"name": "Alice", "age": 30, "active": true, "tags": null}
dumps indented:
{
  "name": "Alice",
  "age": 30,
  "active": true,
  "tags": null
}
round trip == True type: <class 'dict'>
TypeError: Object of type Contact is not JSON serializable
```

`json.dumps` on a plain dict works exactly as expected, including
`True` becoming JSON's own lowercase `true` and `None` becoming
`null` — JSON has its own literal spelling for booleans and the
absence of a value, distinct from Python's. `json.loads(json.dumps(data))
== data` confirms the round trip is lossless for these native types.
The `Contact` attempt fails with a real, specific `TypeError` — not a
crash somewhere unrelated, and not silently-wrong output — naming
exactly which type `json.dumps` didn't know what to do with.

### Discard the throwaway example

This lab's `data` dict and its `Contact` instance are discarded; they
exist only to show native-type serialization working and dataclass
serialization failing, side by side.

### Project Change

- **Reference Source** — none; from-scratch, as in every prior lesson.
- **Files affected** — new file `recordkeeper/ingest/json_source.py`.
- **Change type** — add.
- **Location** — n/a (new file).
- **Dependencies** — `json` (standard library), `recordkeeper.models.Contact`
  (Lesson 4).

### The New Code

```python
import json
from dataclasses import asdict

from recordkeeper.models import Contact
```

### The Updated Project

Brand-new file, nothing surrounding this fragment yet — covered by
Project Change above.

### Mechanical walkthrough

- **`import json`** — brings the standard library's `json` module into
  scope.
- **`from dataclasses import asdict`** — brings `asdict` (full
  treatment above, in Objects and methods used) into scope from the
  same standard-library module `@dataclass` itself came from, in
  Lesson 4.
- **`from recordkeeper.models import Contact`** — imports the `Contact`
  dataclass built in Lesson 4, so this module can convert to and from
  it.

### CS lens

JSON's own fixed set of native types (object, array, string, number,
boolean, null) not including anything like "a Python dataclass" is an
instance of **interface segregation at the format level** — a
data-interchange format that deliberately supports only a small,
universal set of shapes, so that *any* language reading it only ever
has to understand that same small set, rather than every producing
language's own type system.

```
Also recognized in: XML's own limited built-in types before schemas
add more, Protocol Buffers' fixed scalar types, HTTP's own small set of
methods (GET, POST, ...) rather than one per possible server action,
SQL's portable core types vs. any one database's proprietary extensions
```

### SE lens

The alternative not chosen is teaching `json.dumps` about `Contact`
specifically — subclassing `json.JSONEncoder` and overriding its
`default` method to special-case `Contact`. That's a real, supported
approach (used in the next unit, in function form via `default=`), and
for a project with many custom types it can be the cleaner one. The
tradeoff here is scope: `recordkeeper` currently has exactly one
custom type worth serializing, so a small, local `default` function
(next unit) covers the real need without introducing a whole subclass
whose only job, right now, would be handling one `isinstance` check.

### Commands needed

None new.

### Run it

Shown above under "Introduce the concept in isolation" — real output.

### Connect

This unit shows exactly what `json.dumps` can't do on its own, and
imports what the next unit needs to fix it — `asdict` and `Contact`.

---

## Concept Unit: Serializing and reconstructing a real `Contact`

### The Problem

`asdict(contact)` alone would produce a serializable plain dict, so
calling `asdict` on every contact before `json.dumps` sees it is one
valid fix — but it means every future caller of `contacts_to_json` has
to remember to do that conversion themselves, rather than the function
doing it internally. `json.dumps`'s `default=` parameter offers a
second path: teach `json.dumps` itself what to do the moment it meets
something it doesn't natively understand.

> **Stop and think:** If `json.dumps` is given a `default` function and
> then encounters a `Contact` it doesn't know how to serialize, what do
> you expect that `default` function to receive as its argument, and
> what would it need to return for `json.dumps` to be able to continue?
> Does the returned value itself need to already be a JSON-native type,
> or could it be another custom object?

### Introduce the concept in isolation

```python
contact = Contact(id="1", name="Alice Smith", email="alice@example.com", notes="")

print("asdict(contact) ->", asdict(contact))
print("dumps(asdict(contact)) ->", json.dumps(asdict(contact)))

def contact_default(obj):
    if isinstance(obj, Contact):
        return asdict(obj)
    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")

raw = json.dumps(contact, default=contact_default)
print("dumps(contact, default=contact_default) ->", raw)

loaded_dict = json.loads(raw)
loaded_contact = Contact(**loaded_dict)
print("loaded_contact ->", loaded_contact)
print("loaded_contact == contact ->", loaded_contact == contact)
```

Real output:

```
asdict(contact) -> {'id': '1', 'name': 'Alice Smith', 'email': 'alice@example.com', 'notes': ''}
dumps(asdict(contact)) -> {"id": "1", "name": "Alice Smith", "email": "alice@example.com", "notes": ""}
dumps(contact, default=contact_default) -> {"id": "1", "name": "Alice Smith", "email": "alice@example.com", "notes": ""}
loaded_contact -> Contact(id='1', name='Alice Smith', email='alice@example.com', notes='')
loaded_contact == contact -> True
```

`json.dumps(contact, default=contact_default)` produces byte-for-byte
the same output as manually calling `asdict` first — proving
`default=` isn't a different serialization path, it's `json.dumps`
calling that same conversion automatically, exactly once, at the exact
moment it meets a type it doesn't natively know. `Contact(**loaded_dict)`
on the way back — the same keyword-unpacking construction pattern from
Lesson 4's `contact_from_row` — proves the round trip is lossless:
`loaded_contact == contact` is `True` because `@dataclass`'s generated
`__eq__` (Lesson 4) compares every field, and every field survived the
trip through JSON text and back unchanged.

### Discard the throwaway example

This lab's `contact_default`, `raw`, and `loaded_contact` are
discarded; the pattern they prove — `asdict` before writing, keyword
unpacking after reading — carries forward into the project below.

### Project Change

- **Reference Source** — none; from-scratch, as in the previous unit.
- **Files affected** — `recordkeeper/ingest/json_source.py` (modified,
  completing the module); new sample data file `data/contacts.json`.
- **Change type** — add (completing both functions).
- **Location** — after the imports already added in the previous unit.
- **Dependencies** — none new.

### The New Code

```python
def contacts_to_json(contacts):
    return json.dumps([asdict(c) for c in contacts], indent=2)


def contacts_from_json(raw):
    rows = json.loads(raw)
    return [Contact(**row) for row in rows]
```

### The Updated Project

```python
1  import json
2  from dataclasses import asdict
3
4  from recordkeeper.models import Contact
5
6
7  def contacts_to_json(contacts):                              # ← new
8      return json.dumps([asdict(c) for c in contacts], indent=2)  # ← new
9
10
11 def contacts_from_json(raw):                                  # ← new
12     rows = json.loads(raw)                                    # ← new
13     return [Contact(**row) for row in rows]                   # ← new
```

The module is complete: `contacts_to_json` takes a list of `Contact`
objects, converts each one to a plain dict via `asdict` (same idea as
`contact_to_row` in `csv_source.py`, Lesson 4, just targeting JSON
instead of a CSV row), and hands the resulting list of dicts to
`json.dumps`, which natively knows how to serialize a list of dicts
with no `default=` needed at all, since every value inside is already
a native type by the time `json.dumps` sees it. `contacts_from_json`
reverses this: `json.loads` parses the JSON text back into a list of
plain dicts, and each one is unpacked directly into a fresh `Contact`.

### Mechanical walkthrough

- **`[asdict(c) for c in contacts]`** — a list comprehension (same
  shape as Lesson 3's `[row for row in reader]` and Lesson 4's
  `[contact_from_row(row) for row in reader]`), calling `asdict` on
  each `Contact` in `contacts` and collecting the resulting dicts into
  a new list.
- **`json.dumps(..., indent=2)`** — full treatment of `json.dumps`
  above; `indent=2` requests pretty-printed output with two-space
  indentation per nesting level, rather than the single-line compact
  form the previous unit's lab showed by default.
- **`json.loads(raw)`** — full treatment above; parses `raw`, a JSON
  array of objects, into a native Python `list` of `dict`s.
- **`[Contact(**row) for row in rows]`** — a list comprehension using
  `**row` to unpack each dict's key-value pairs as keyword arguments
  into `Contact`'s constructor, the same unpacking pattern the
  previous unit's lab used for `loaded_contact`, applied here to every
  row instead of one.

### CS lens

Reducing a custom type down to a plain, structurally simple
representation before handing it to a general-purpose serializer — the
`asdict`/`Contact(**row)` pair — is the same **marshalling** idea used
anywhere a rich, in-memory structure has to cross a boundary that only
understands simpler, more universal shapes.

```
Also recognized in: RPC frameworks marshalling method arguments into a
wire format before a network call, a game engine serializing scene
objects into a save-file format, an ORM converting a model instance
into SQL column values before an INSERT
```

### SE lens

The alternative not chosen — teaching `json.dumps` about `Contact`
globally via a `JSONEncoder` subclass, as flagged in the previous
unit's SE lens — remains available if `recordkeeper` later gains
several more custom types worth serializing; a single `default=`
callable handling one `isinstance` check is the appropriately-sized
tool for the one type it has now. The real cost being accepted here is
symmetry: `contacts_to_json` and `contacts_from_json` both assume every
field survives a JSON round trip as a plain string (JSON has no native
concept of, say, a Python `date` object) — true for every one of
`Contact`'s current fields, but a future field storing something
JSON-native types can't represent directly would need its own explicit
conversion on both sides, not something either function currently
handles for free.

### Commands needed

None new.

### Run it

Real output, from an actual run against `recordkeeper`'s own
`data/contacts.csv` (Lesson 3), loaded through `Contact` (Lesson 4),
then round-tripped through this unit's own two functions:

```python
from recordkeeper.ingest.csv_source import load_contacts_csv
from recordkeeper.ingest.json_source import contacts_to_json, contacts_from_json

contacts = load_contacts_csv("data/contacts.csv")
raw = contacts_to_json(contacts)
print(raw)
loaded = contacts_from_json(raw)
print("round trip matches ->", loaded == contacts)
```

```
[
  {
    "id": "1",
    "name": "Alice Smith",
    "email": "alice@example.com",
    "notes": "Prefers email, not calls"
  },
  {
    "id": "2",
    "name": "Bob Lee",
    "email": "bob@example.com",
    "notes": "Referred by Alice\nFollow up in June"
  }
]
round trip matches -> True
```

### Connect

The previous unit showed `json.dumps` refuses a `Contact` outright;
this unit fixes that at exactly one seam — `asdict` going out,
keyword-unpacking coming back — mirroring the same conversion-at-one-
seam design `csv_source.py` already used in Lesson 4, just for a
different destination format.

---

## Concept Unit: What `json.loads` is actually doing — a tiny parser, built by hand

### The Problem

`json.loads` has been treated, so far, as a correct black box — text
goes in, the right Python structure comes out. Nothing so far has
shown *how* it gets there. JSON's grammar is more than "split on
commas" (this curriculum already proved that naive splitting fails for
CSV, in Lesson 3) — the actual mechanism is worth seeing directly,
even for a deliberately small slice of what real JSON supports.

> **Stop and think:** Before any structure can be understood, the raw
> characters `{"id": "1", "age": 30}` have to be told apart from each
> other somehow — a `{`, a string, a `:`, another string, a `,`, and so
> on. If you had to write a function that walked this string one
> character at a time and produced a list of "here's what each piece
> is," what categories of piece would you need? How would you know
> where a string literal ends, versus where a number ends?

### Introduce the concept in isolation

```python
def tokenize(s):
    tokens = []
    i = 0
    while i < len(s):
        c = s[i]
        if c in " \t\n\r":
            i += 1
            continue
        if c in "{}:,":
            tokens.append((c, c))
            i += 1
            continue
        if c == '"':
            j = i + 1
            while s[j] != '"':
                j += 1
            tokens.append(("STRING", s[i + 1:j]))
            i = j + 1
            continue
        if c.isdigit() or c == "-":
            j = i
            while j < len(s) and (s[j].isdigit() or s[j] in ".-"):
                j += 1
            tokens.append(("NUMBER", s[i:j]))
            i = j
            continue
        if s[i:i + 4] == "true":
            tokens.append(("BOOL", True)); i += 4; continue
        if s[i:i + 5] == "false":
            tokens.append(("BOOL", False)); i += 5; continue
        if s[i:i + 4] == "null":
            tokens.append(("NULL", None)); i += 4; continue
        raise ValueError(f"Unexpected character {c!r} at position {i}")
    return tokens

sample = '{"id": "1", "name": "Alice Smith", "age": 30, "active": true, "notes": null}'
tokens = tokenize(sample)
for t in tokens:
    print(t)
```

Real output (abridged to the first few and last few tokens):

```
('{', '{')
('STRING', 'id')
(':', ':')
('STRING', '1')
(',', ',')
...
('STRING', 'notes')
(':', ':')
('NULL', None)
('}', '}')
```

This is **tokenizing**, named here in full: every character in `sample`
has been sorted into one of six categories — `{`/`}`/`:`/`,` punctuation,
a `STRING`, a `NUMBER`, a `BOOL`, or `NULL` — with no structural
understanding yet of which key goes with which value; that comes next.

```python
def parse_object(tokens):
    assert tokens[0][0] == "{"
    result = {}
    i = 1
    if tokens[i][0] == "}":
        return result
    while True:
        key_type, key = tokens[i]
        assert key_type == "STRING"
        i += 1
        assert tokens[i][0] == ":"
        i += 1
        value_type, value = tokens[i]
        if value_type == "NUMBER":
            value = float(value) if "." in value else int(value)
        result[key] = value
        i += 1
        if tokens[i][0] == ",":
            i += 1
            continue
        elif tokens[i][0] == "}":
            i += 1
            break
    return result

ours = parse_object(tokens)
print("our parser ->", ours)

import json
reference = json.loads(sample)
print("json.loads ->", reference)
print("match ->", ours == reference)
```

Real output:

```
our parser -> {'id': '1', 'name': 'Alice Smith', 'age': 30, 'active': True, 'notes': None}
json.loads -> {'id': '1', 'name': 'Alice Smith', 'age': 30, 'active': True, 'notes': None}
match -> True
```

`ours == reference` being `True` is real, checked proof — not an
assertion that the hand-written parser is "basically" doing what
`json.loads` does, but that on this real input, it produces the
identical Python value, key for key, value for value, including
`"30"` correctly becoming the `int` `30` and not the string `"30"`.
This subset deliberately doesn't handle nested objects/arrays or
escaped characters inside strings — real JSON allows both, and
`json`'s own parser handles them; this lab exists to make the
mechanism visible for a real, working slice of the grammar, not to
replace the standard library's own, complete implementation.

### Discard the throwaway example

`tokenize`, `parse_object`, and this lab's `tokens`/`ours` are
discarded; `recordkeeper` continues using the standard library's own
`json.loads`, exactly as it already does in `contacts_from_json` — this
lab exists only to demystify what that call is actually doing.

### Project Change

None — this unit adds no code to `recordkeeper`. `contacts_from_json`,
finished in the previous unit, already calls the real, complete
`json.loads`; this lab exists to prove what that call is doing, not to
replace it.

### Mechanical walkthrough

- **`while i < len(s):`** — the tokenizer's main loop, advancing a
  position `i` through the input string one meaningful chunk at a time,
  rather than one character at a time — each branch inside the loop
  advances `i` by however many characters that one token actually
  spanned.
- **whitespace branch (`c in " \t\n\r"`)** — skips a whitespace
  character with no token produced at all; JSON allows whitespace
  between tokens purely for readability, carrying no meaning of its
  own.
- **punctuation branch (`c in "{}:,"`)** — each of `{`, `}`, `:`, `,` is
  exactly one character and needs no lookahead; appended as its own
  single-character token.
- **string branch (`c == '"'`)** — scans forward from just after the
  opening `"` until it finds the matching closing `"`, and takes
  everything in between as the string's own content; this lab's
  scanner deliberately doesn't handle a `"` escaped inside a string
  (real JSON's `\"`), which is exactly why it's described as a subset,
  not a complete implementation.
- **number branch (`c.isdigit() or c == "-"`)** — scans forward while
  each character could still be part of a number (a digit, a `.`, or a
  `-`), collecting the whole run of characters as one `NUMBER` token
  still stored as text at this stage — converting it to a real `int`
  or `float` is deferred to the parser, not done here.
- **`true`/`false`/`null` branches** — each checks a fixed-length slice
  of the remaining string against a literal keyword; unlike strings and
  numbers, these have one exact spelling each, so no scanning-forward
  loop is needed, just a direct comparison.
- **`parse_object`'s `while True:` loop** — walks the token list
  produced by `tokenize`, alternating between expecting a `STRING` key,
  a `:`, and a value, then checking whether a `,` (more pairs follow)
  or a `}` (the object is done) comes next — directly mirroring JSON's
  own grammar rule that an object is a `{`, zero or more
  comma-separated `key: value` pairs, and a `}`.
- **`float(value) if "." in value else int(value)`** — the one place
  this parser converts a token's raw text into a real Python number,
  choosing `float` or `int` based on whether a decimal point appeared
  in the original text — the same distinction `json.loads` itself has
  to make, and the reason the tokenizer deliberately left `NUMBER`
  tokens as unconverted text rather than guessing a type too early.

### CS lens

Splitting "recognize the pieces" (tokenizing) from "understand their
structure" (parsing) into two separate passes is the same two-stage
design every real compiler and interpreter uses for source code — a
**lexer** (tokenizer) followed by a **parser**, kept as separate
concerns so each one only has to solve one problem at a time.

```
Also recognized in: every real programming language's own compiler
front-end, regular expression engines, SQL query parsers, HTML parsers
splitting tags from text before building a DOM tree
```

### SE lens

The alternative not chosen for `recordkeeper` itself is: nothing,
because `json.loads` already does this, completely and correctly, for
the full JSON grammar — nested structures, escaped characters, and
edge cases this lesson's tokenizer doesn't attempt. The real point this
unit makes isn't "replace the standard library's parser" — it's
that trusting `json.loads` doesn't mean trusting something
unknowable: its actual mechanism (tokenize, then parse token-by-token
against the grammar's own rules) is ordinary, inspectable code, just
handling more cases and far more edge-case correctness than this
lesson's deliberately narrow version needed to.

### Commands needed

None new.

### Run it

Shown above — real output, from actual runs, matched directly against
`json.loads` on the same input.

### Connect

The previous two units treated `json.dumps`/`json.loads` as trusted
tools for turning `Contact` objects into stored JSON and back; this
unit doesn't change what `recordkeeper` does, but replaces "trust
`json.loads`" with "here is, concretely, one real way `json.loads`
could work, verified to produce identical output on a real, non-trivial
input" — the same demystification goal Lesson 2's `TinyBufferedReader`
served for `io.BufferedReader`.

---

## Connect the pieces

`recordkeeper.ingest.json_source.contacts_to_json` takes the same two
`Contact` objects Lesson 4 built from `data/contacts.csv` — one with a
comma in its notes, one with a real embedded newline, the same two
edge cases Lesson 3 proved naive CSV splitting couldn't survive — and,
via `asdict`, turns each into a plain dict `json.dumps` already knows
how to serialize natively, producing a real `data/contacts.json` file.
Reading it back with `contacts_from_json` parses that JSON text with
the genuine `json.loads` — proven, in this lesson's last unit, to work
the same way a real, hand-built tokenizer/parser pair does on a
matching input — and reconstructs each `Contact` via keyword
unpacking, the same pattern `contact_from_row` used for CSV in Lesson
4. The round trip, checked directly against the original list of
`Contact` objects with `==` (backed by `@dataclass`'s generated
`__eq__`, Lesson 4), came back `True` — both contacts, including Bob's
embedded newline, survived unchanged through JSON exactly as they
already survived unchanged through CSV.
