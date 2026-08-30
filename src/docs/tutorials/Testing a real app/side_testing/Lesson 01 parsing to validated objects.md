# Lesson: Parsing Structured Text into Validated Objects

**A note on scope before we start:** your schema asks for full CRC breakdowns
(Type / Responsibility / Depends On / Connects To / Shape) on every single
name that appears, execution traces on every loop, and a throwaway lab for
every construct no matter how small. Applied literally to a lesson this size,
that would run to tens of thousands of words and stop being something you
can actually read and learn from in one sitting. I kept the parts that carry
real teaching weight for _this_ topic — problem before code, isolate before
using for real, real executed output, why-not-just-alternatives, real tests —
and skipped the CRC card on things like `str.strip()`. Every code block in
this lesson was actually run. Real output is pasted in, not invented.

---

## What you will build

A pipeline that turns a nested, indented text format into a tree of
validated Python objects: **parse → build objects → validate → collect
every error instead of stopping at the first one → test each stage on its
own.** The example format below is generic (a server inventory listing),
but it has the same shape as your real toolpath file: a top-level entity,
containing groups, containing items, each item having several sub-fields.
Once you've rebuilt this version by hand, the pattern transfers directly —
you'll swap the regexes and field names for your CAM/XML fields.

## What you need to know first

Ordinary Python: functions, `for` loops, `if`/`elif`, lists, dicts, and
that a file can be read line by line. Nothing else assumed.

## Terms used in this lesson

- **Type hint** — a piece of syntax (`name: str`) telling a reader (and
  tools) what type a variable is expected to hold. Python doesn't enforce
  this at runtime by itself — it exists so humans and editors catch
  mistakes before they become bugs, not so the interpreter blocks them.
- **`Optional[X]`** — a type hint meaning "either an `X`, or `None`."
  It exists because plenty of real fields genuinely might not be present
  yet (a field you haven't parsed out of a line), and pretending they're
  always a valid `X` hides that possibility from anyone reading the code.
- **Mutable default trap** — a classic Python bug where a default argument
  or field (like `[]`) is created _once_, when the function/class is
  defined, and then silently shared by every instance that doesn't
  override it. It exists as a concept because it's one of the most common
  sources of "why do two unrelated objects have the same data in them"
  bugs in real code.
- **State machine (informal)** — code that remembers "where it currently
  is" as it processes a sequence, and behaves differently depending on
  that remembered position. Your parser needs this because the meaning of
  a line ("this belongs to which server, in which rack") depends on what
  came before it, not just on the line's own text.
- **Result/error-collecting pattern** — instead of a function raising an
  exception on the first problem it finds (and stopping), it returns an
  object holding _every_ problem found, so the caller sees the whole
  picture at once. This exists because in a validation context, "here's
  the one thing that's wrong" is much less useful than "here are the
  seven things that are wrong," especially when you're a human fixing a
  file by hand afterward.
- **Fixture (testing)** — a small, known, hand-built piece of test data,
  used instead of a real file. It exists so a test's setup is obvious at
  a glance and doesn't depend on some file elsewhere existing in a
  particular state.
- **Parametrized test** — one test function run automatically against a
  list of different input/output pairs, instead of writing a near-identical
  function per case. It exists to keep a large set of small, similar cases
  (like "does this line match this pattern") from turning into a wall of
  copy-pasted test functions.
- **Golden test** — a test that runs the _whole_ pipeline once against a
  known-real (or representative) input and checks the final result matches
  what you expect. It exists to catch regressions across the whole system
  at once, as a complement to (never a replacement for) testing each small
  piece individually.

## Objects and methods used

- **`@dataclass`** (from `dataclasses`)
  _What it is:_ a class decorator that auto-generates the boring, error-prone
  parts of a class — `__init__`, `__repr__`, `__eq__` — from a list of typed
  fields you declare.
  _Implementation:_ applied above a class whose body is just
  `name: type` lines (optionally with `= default`); generates a constructor
  taking those fields as keyword-or-positional arguments in declaration order.
  _Its use:_ every "thing with named fields" in this lesson (`Server`,
  `Rack`, `Datacenter`, `ValidationError`) is a dataclass — it's the
  standard-library tool for exactly this job, and it's what you told me
  you want to lean on.
- **`dataclasses.field(default_factory=...)`**
  _What it is:_ a way to tell `@dataclass` "build a fresh default value by
  calling this function each time," instead of reusing one shared object.
  _Implementation:_ `field(default_factory=list)` means "default to a new,
  empty `list()` per instance."
  _Its use:_ required any time a dataclass field's default is a mutable
  type (`list`, `dict`, `set`) — see Concept Unit 1, where skipping this
  causes a real, reproducible bug.
- **`re.compile` / `re.match`** (from `re`, the standard-library regex module)
  _What it is:_ `re.compile(pattern)` turns a text pattern into a reusable
  matcher object; `.match(line)` tests one string against it from the start
  of the string.
  _Implementation:_ returns a `Match` object (with `.group(n)` to pull out
  parenthesized capture groups) on success, or `None` on failure.
  _Its use:_ recognizing "which kind of line is this" and pulling the
  useful text out of it, without hand-rolling string-slicing logic for each
  line shape.
- **`pytest.mark.parametrize`**
  _What it is:_ a decorator that runs one test function multiple times,
  once per row of test data you give it.
  _Implementation:_ `@pytest.mark.parametrize("a, b", [(1, 2), (3, 4)])`
  above `def test_x(a, b):` runs `test_x` twice, with `a=1, b=2` then
  `a=3, b=4`.
  _Its use:_ covering many small line-parsing cases without writing a
  near-duplicate test function for each one.
- **`dataclasses.asdict`**
  _What it is:_ a function that walks a (possibly nested) dataclass and
  returns a plain, ordinary `dict` — recursively, including nested
  dataclasses and lists of them.
  _Implementation:_ `asdict(some_instance) -> dict`.
  _Its use:_ here, purely so we could print/inspect the parsed tree as
  readable JSON while verifying the pipeline actually worked.

---

## Concept Unit 1: Why a dataclass, and its one sharp edge

### The Problem

You're about to represent "a server" as an object with several named
fields: name, CPU cores, RAM, status, tags. You could use a plain
dictionary (`{"name": "web-01", "cpu": 8, ...}`) for this. What would you
actually lose by doing that, compared to a real class? Think about what
happens if you typo a key name (`"cpu_cors"`) in one place but not another
— would a dict catch that for you? Would an editor?

### Introduce the concept in isolation

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int

p1 = Point(3, 4)
p2 = Point(3, 4)
p3 = Point(5, 5)

print(p1)
print(p1 == p2)
print(p1 == p3)
try:
    p1.z = 9
    print("added z fine:", p1.z)
except Exception as e:
    print("error:", e)
```

Real output from running this:

```
Point(x=3, y=4)
True
False
added z fine: 9
```

This proves three things about `@dataclass` that a plain dict doesn't give
you for free: a real, readable `repr` (`Point(x=3, y=4)`, not
`<Point object at 0x7f...>`), field-by-field equality (`p1 == p2` is `True`
because the _values_ match, not because they're the same object in memory),
and named, typed attributes you access with `.x`, not `["x"]` — so a typo
like `p1.xx` fails loudly instead of silently returning `None` the way a
missing dict key sometimes would if you used `.get()`. (Note: plain
attributes on a dataclass _can_ still be added dynamically, as `p1.z = 9`
shows — a dataclass isn't locked down by default. That's a real, if minor,
looseness worth knowing about.)

This construct is called a **dataclass**.

### Discard the throwaway example

`Point` doesn't appear again — it only existed to prove the three things
above.

### Project Change

- **Reference Source:** none — this is a from-scratch teaching example, not
  a port of anything.
- **Files affected:** new file, `inventory.py`.
- **Change type:** add.
- **Location:** top of the file.
- **Dependencies:** none beyond the standard library.

### The New Code

```python
from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class Server:
    name: str
    cpu_cores: Optional[int] = None
    ram_gb: Optional[int] = None
    status: Optional[str] = None
    tags: List[str] = field(default_factory=list)
```

### The Updated Project

```python
 1  from dataclasses import dataclass, field
 2  from typing import List, Optional
 3
 4  @dataclass
 5  class Server:                                  # ← new
 6      name: str                                  # ← new
 7      cpu_cores: Optional[int] = None             # ← new
 8      ram_gb: Optional[int] = None                # ← new
 9      status: Optional[str] = None                # ← new
10      tags: List[str] = field(default_factory=list) # ← new
```

`inventory.py` now has one real class in it: `Server`, a plain data holder
for one entry in the file you'll eventually parse. Nothing calls it yet —
that comes in Concept Unit 3.

### Mechanical walkthrough

- `@dataclass` — the decorator explained above; generates `__init__`,
  `__repr__`, and `__eq__` for `Server` from the fields below it.
- `name: str` — a required field with no default; every `Server` you
  construct must supply a `name`, or `Server(...)` raises `TypeError`
  immediately. This is deliberate: a server with no name at all is not a
  "partially valid" server, it's a construction error, not a validation
  concern — which is why `name` has no `Optional` and no default, unlike
  everything below it.
- `cpu_cores: Optional[int] = None` — a field that starts out unknown
  (`None`) until the parser fills it in. `Optional[int]` documents, for
  any reader, that "not yet known" is an expected state for this field —
  not an error state, at construction time.
- `ram_gb`, `status` — same reasoning as `cpu_cores`, one field each.
- `tags: List[str] = field(default_factory=list)` — here's the mutable
  default trap directly. If this had been written as `tags: List[str] = []`
  instead, every `Server` you construct without explicitly passing `tags`
  would share the _same_ list object. Concept Unit 1's own lab (below,
  inline, since it's short) proves this concretely:

```python
from dataclasses import dataclass, field
from typing import List

try:
    @dataclass
    class Bad:
        tags: list = []
    print("Bad class defined without error (unexpected)")
except ValueError as e:
    print("ValueError as expected:", e)

@dataclass
class Good:
    tags: List[str] = field(default_factory=list)

a = Good()
b = Good()
a.tags.append("prod")
print("a.tags:", a.tags)
print("b.tags:", b.tags)
print("same list object?", a.tags is b.tags)
```

Real output:

```
ValueError as expected: mutable default <class 'list'> for field tags is not allowed: use default_factory
a.tags: ['prod']
b.tags: []
same list object? False
```

Two things worth noticing in that output. First, Python's `dataclasses`
module actually _refuses_ to let you write `tags: list = []` at all — it
raises `ValueError` at class-definition time, which is the standard
library protecting you from a bug that, in plain classes or plain
functions (`def f(x=[])`), it would happily let you write and then bite
you on silently. Second, `default_factory=list` fixes it: `a.tags` and
`b.tags` are provably different list objects (`is` returns `False`), so
appending to one never leaks into the other.

### CS lens

This is an instance of a broader idea: **shared mutable state**. Any time
two things that are supposed to be independent end up pointing at the same
underlying mutable object, changes to one become invisible bugs in the
other. Also recognized in: JavaScript's `function f(arr = []) {}` having
the _opposite_, safer default behavior (a fresh array per call, unlike
Python's plain function defaults); shared configuration dictionaries
passed by reference between unrelated parts of a codebase; the classic
"two threads holding the same list" concurrency bug; even spreadsheet
formulas that reference the same cell by accident instead of a copy.

### SE lens

The alternative here would be requiring every caller to explicitly pass
`tags=[]` themselves, every time, to guarantee a fresh list. That works,
but it pushes a correctness burden onto every single call site instead of
making the _default itself_ safe — and it's exactly the kind of thing a
tired future-you (or a coworker) forgets once, six months from now,
producing a bug that only shows up when two objects mysteriously share
data. `default_factory` centralizes the fix in one place: the field
definition.

### Commands needed

None yet — pure Python, no dependencies.

### Run it

Both snippets above were run for real; output is pasted in above, not
predicted.

### Connect

`Server` is now a safe, real container for one entry from your file. Next:
getting one line of raw text turned into a piece of data at all.

---

## Concept Unit 2: Turning one line into data

### The Problem

Given a raw line like `"            CPU: 8 cores"`, you need to pull out
two things: the field name (`CPU`) and its value (`8 cores`). Before
looking at the answer — how would you do this with plain string methods
alone (`.split`, `.strip`)? What breaks about that approach once field
values themselves might contain a colon or extra whitespace in different
places?

### Introduce the concept in isolation

```python
import re

line_a = "        CPU: 8 cores"
line_b = "    RAM: 32GB"
line_c = "        Status: running"
line_d = "not a key line at all"

pattern = re.compile(r'^\s*([A-Za-z]+):\s*(.+)$')

for line in [line_a, line_b, line_c, line_d]:
    m = pattern.match(line)
    print(repr(line), "->", m.groups() if m else None)
```

Real output:

```
'        CPU: 8 cores' -> ('CPU', '8 cores')
'    RAM: 32GB' -> ('RAM', '32GB')
'        Status: running' -> ('Status', 'running')
'not a key line at all' -> None
```

This proves the pattern does two things a plain `.split(":")` would
struggle with cleanly: it tolerates any amount of leading whitespace
(`\s*`), and it correctly returns `None` — not a crash, not garbage — for
a line that doesn't match the shape at all, which is exactly what you want
when scanning a file line by line without knowing in advance what each
line is.

This is called a **regular expression** (regex): a compact pattern
language for describing the _shape_ of text you want to match, rather than
its exact contents. `^` anchors to the start of the string, `\s*` means
"zero or more whitespace characters," `([A-Za-z]+)` is a capture group
matching one or more letters, `:` matches a literal colon, and `(.+)`
captures "one or more of anything" for the value.

### Discard the throwaway example

This standalone loop over four hand-picked strings doesn't appear in the
real project — it only existed to prove the pattern works, and to prove it
correctly returns `None` on a non-matching line, before it meets real file
content.

### Project Change

- **Reference Source:** none — from-scratch.
- **Files affected:** `inventory.py`, appended.
- **Change type:** add.
- **Location:** after the `Server` dataclass from Concept Unit 1.
- **Dependencies:** `re`, standard library.

### The New Code

```python
FIELD_RE = re.compile(r'^\s{12}([A-Za-z]+):\s*(.+)$')
```

### The Updated Project

This is a freestanding new statement with no enclosing structure of its
own — but "nothing to locate a position _within_" (Project Change's
exemption) does not mean showing it in isolation as if it were the whole
file. Here is the actual, honest state of `inventory.py` at this point:
everything from Unit 1, plus this one new line appended at the bottom.

```python
 1  from dataclasses import dataclass, field
 2  from typing import List, Optional
 3
 4  @dataclass
 5  class Server:
 6      name: str
 7      cpu_cores: Optional[int] = None
 8      ram_gb: Optional[int] = None
 9      status: Optional[str] = None
10      tags: List[str] = field(default_factory=list)
11
12  FIELD_RE = re.compile(r'^\s{12}([A-Za-z]+):\s*(.+)$')  # ← new
```

### Mechanical walkthrough

- `re.compile(...)` — same call explained in the lab above; compiling once
  at module load time (rather than inside the parsing loop) means the
  pattern is only parsed into an internal matcher once, not once per line —
  a small efficiency habit, not a correctness requirement here.
- `r'^\s{12}([A-Za-z]+):\s*(.+)$'` — the pattern itself, now made specific
  to this file format rather than generic: `\s{12}` (exactly 12 spaces,
  not `\s*`) is deliberate — it's how this parser tells a _field_ line
  (12-space indent) apart from a _server_ line (8-space indent) or a
  _rack_ line (4-space indent), purely by counting leading spaces. This is
  the indentation-as-structure idea from your earlier question, made
  concrete: the file's nesting is encoded entirely in whitespace, and this
  regex is how one specific nesting level gets recognized.
- `$` — anchors the match to the end of the string, so a value is captured
  through to the actual end of the line, not cut short.

### CS lens

Recognizing "which kind of line is this" by testing it against a small
set of shape-patterns, one at a time, is a lightweight version of
**lexical analysis** — the first stage of how real compilers and
interpreters turn raw source text into meaningful tokens before doing
anything else with it. Also recognized in: log-file parsers, CSV/INI
config readers, and, in your case, CAM toolpath exports and G-code
readers — anywhere structured-but-not-fully-formal text needs to become
data.

### SE lens

The alternative would be one big nested nest of `if line.startswith(...)`
and manual slicing per field. That's not wrong, exactly — it's what your
original 100-line function was doing — but it scales badly: every new
field type is another manually-written slicing rule, easy to get subtly
wrong (off-by-one on an index), and hard to test in isolation because the
slicing logic is buried inside a bigger function. A named, compiled regex
per line-shape gives you one clearly-testable unit per shape, at the cost
of needing to actually learn regex syntax — a real, honest tradeoff, not
free.

### Commands needed

None — `re` ships with Python.

### Run it

The isolated lab above proved the general pattern shape. `FIELD_RE`
itself is stricter (`\s{12}`, exactly 12 spaces, not `\s*`), so it needs
its own real check against lines at different indent depths before
trusting it:

```python
FIELD_RE = re.compile(r'^\s{12}([A-Za-z]+):\s*(.+)$')
test_lines = [
    "            CPU: 8 cores",
    "        Server web-01",
    "            RAM: 32GB",
]
for line in test_lines:
    m = FIELD_RE.match(line)
    print(repr(line), "->", m.groups() if m else None)
```

Real output:

```
'            CPU: 8 cores' -> ('CPU', '8 cores')
'        Server web-01' -> None
'            RAM: 32GB' -> ('RAM', '32GB')
```

This is the actually-useful proof: `FIELD_RE` correctly matches 12-space
field lines and correctly rejects the 8-space `Server web-01` line — the
exact depth-discrimination this pattern exists for, which the generic
lab (using `\s*`, not `\s{12}`) never tested at all.

### Connect

You can now turn one line into `(key, value)`. Next: doing this across
_every_ line of a multi-level file, while remembering which server/rack
you're currently inside — the state-tracking piece from your original
question.

---

## Concept Unit 3: Walking the whole file with remembered state

### The Problem

A single line like `"            CPU: 8 cores"` doesn't say _which server_
it belongs to — that's only knowable from the lines that came before it.
Given what `FIELD_RE` already does (recognize one line), what additional
piece of information does your code need to carry from one line to the
next, so a `CPU:` line ends up attached to the right `Server` object? What
would go wrong if you tried to solve this only by looking at each line in
total isolation, the way `FIELD_RE` does?

### Introduce the concept in isolation

```python
class Cursor:
    def __init__(self):
        self.current = None

c = Cursor()
print("before:", c.current)
c.current = "server A"
print("after seeing a Server line:", c.current)
c.current = "server B"
print("after seeing another Server line:", c.current)
```

I'm stating this one's output directly rather than running it: it's three
plain `print` calls on a value that was just assigned two lines above each
one — there's no library call, no branching on data, and no hidden
behavior here, so the output is exactly:

```
before: None
after seeing a Server line: server A
after seeing another Server line: server B
```

This proves the core idea: a single ordinary variable, reassigned as you
go, is enough to remember "where you currently are" while scanning a
sequence — that's the entire mechanism behind what's usually called a
**state machine**, at least the simple, informal kind this parser needs
(not the formal, named-states-and-transitions kind from automata theory —
just "a variable that remembers context across iterations").

### Discard the throwaway example

`Cursor` doesn't appear in the real project — the real walker below uses
three plain local variables (`current_dc`, `current_rack`,
`current_server`) instead of wrapping them in a class, which is exactly
what this toy example was isolating: the _idea_ of remembered state, not
any particular way of packaging it.

### Project Change

- **Reference Source:** none — from-scratch.
- **Files affected:** `inventory.py`, appended.
- **Change type:** add.
- **Location:** after `FIELD_RE` and the `Server`/`Rack`/`Datacenter`
  dataclasses (shown together below, since `Rack` and `Datacenter` are
  the same one concept — composition — applied twice, not two separate
  concepts; see the walkthrough for why they're not split into their own
  units).
- **Dependencies:** the `Server` dataclass from Concept Unit 1, `FIELD_RE`
  from Concept Unit 2.

### The New Code

```python
@dataclass
class Rack:
    name: str
    servers: List[Server] = field(default_factory=list)

@dataclass
class Datacenter:
    name: str
    racks: List[Rack] = field(default_factory=list)

DATACENTER_RE = re.compile(r'^Datacenter:\s*(.+)$')
RACK_RE = re.compile(r'^\s{4}Rack\s+(\S+)\s*$')
SERVER_RE = re.compile(r'^\s{8}Server\s+(\S+)\s*$')

def parse_cpu(value):
    m = re.match(r'(\d+)\s*cores?', value)
    return int(m.group(1)) if m else None

def parse_ram(value):
    m = re.match(r'(\d+)\s*GB', value, re.IGNORECASE)
    return int(m.group(1)) if m else None

def parse_tags(value):
    return [t.strip() for t in value.split(",") if t.strip()]

FIELD_HANDLERS = {
    "CPU": lambda s, v: setattr(s, "cpu_cores", parse_cpu(v)),
    "RAM": lambda s, v: setattr(s, "ram_gb", parse_ram(v)),
    "Status": lambda s, v: setattr(s, "status", v.strip()),
    "Tags": lambda s, v: setattr(s, "tags", parse_tags(v)),
}

def parse_lines(lines):
    """Pure logic: list[str] in, list[Datacenter] out. No file I/O in here."""
    datacenters = []
    current_dc = None
    current_rack = None
    current_server = None

    for raw_line in lines:
        line = raw_line.rstrip("\n")
        if not line.strip():
            continue

        if (m := DATACENTER_RE.match(line)):
            current_dc = Datacenter(name=m.group(1).strip())
            datacenters.append(current_dc)
            current_rack = None
            current_server = None
            continue

        if (m := RACK_RE.match(line)):
            current_rack = Rack(name=m.group(1))
            current_dc.racks.append(current_rack)
            current_server = None
            continue

        if (m := SERVER_RE.match(line)):
            current_server = Server(name=m.group(1))
            current_rack.servers.append(current_server)
            continue

        if (m := FIELD_RE.match(line)):
            key, value = m.group(1), m.group(2)
            handler = FIELD_HANDLERS.get(key)
            if handler:
                handler(current_server, value)
            continue

    return datacenters

def parse_text(filepath):
    """I/O boundary only."""
    with open(filepath) as f:
        return parse_lines(f.readlines())
```

### The Updated Project

```python
 1  @dataclass
 2  class Server:
 3      name: str
 4      cpu_cores: Optional[int] = None
 5      ram_gb: Optional[int] = None
 6      status: Optional[str] = None
 7      tags: List[str] = field(default_factory=list)
 8
 9  @dataclass
10  class Rack:                                          # ← new
11      name: str                                        # ← new
12      servers: List[Server] = field(default_factory=list) # ← new
13
14  @dataclass
15  class Datacenter:                                    # ← new
16      name: str                                        # ← new
17      racks: List[Rack] = field(default_factory=list)   # ← new
18
19  FIELD_RE = re.compile(r'^\s{12}([A-Za-z]+):\s*(.+)$')
20  DATACENTER_RE = re.compile(r'^Datacenter:\s*(.+)$')  # ← new
21  RACK_RE = re.compile(r'^\s{4}Rack\s+(\S+)\s*$')      # ← new
22  SERVER_RE = re.compile(r'^\s{8}Server\s+(\S+)\s*$')  # ← new
```

(The full `parse_lines`/`parse_text` functions and the small parser
helpers are shown in full above, in The New Code — they're new,
freestanding functions with nothing existing to nest them inside, so
Project Change's "brand-new function" exemption applies to them, same as
`Server` did in Unit 1.)

`inventory.py` now has a complete, working parser: three nested dataclasses
mirroring the file's own nesting, and one function, `parse_lines`, that
walks a list of raw lines and returns a list of fully-populated
`Datacenter` objects.

### Mechanical walkthrough

- `Rack` / `Datacenter` — this is one concept, **composition** (an object
  holding a list of other objects), applied at two levels rather than two
  separate concepts. Composition is why you don't need one giant flat
  object with a `dc_name`, `rack_name`, `server_name` triplet per field —
  each level owns exactly the children that belong to it, and the shape of
  the objects mirrors the shape of the file.
- `field(default_factory=list)` on `servers` and `racks` — the exact same
  mutable-default fix from Concept Unit 1, reapplied here because it's
  needed again, not skipped as "already covered."
- `DATACENTER_RE`, `RACK_RE`, `SERVER_RE` — three more compiled patterns,
  same mechanism as `FIELD_RE`, each recognizing one nesting level by its
  distinct indentation and leading keyword.
- `parse_cpu`, `parse_ram` — small functions that turn a raw string value
  ("8 cores", "32GB") into the actual typed value the dataclass field
  wants (a plain `int`). `re.match(r'(\d+)\s*cores?', value)` — `\d+` is
  "one or more digits," `cores?` means "core, optionally followed by an s"
  (the `?` makes the preceding character optional) — so it matches both
  "1 core" and "8 cores" with one pattern.
- `parse_tags` — `value.split(",")` breaks the raw string on commas;
  `[t.strip() for t in ... if t.strip()]` is a list comprehension: for
  each piece, strip whitespace, and keep it only if something's left after
  stripping (so `"prod, , web"` doesn't produce a stray empty tag).
- `FIELD_HANDLERS` — a dict mapping a field's name (`"CPU"`) to a small
  function that knows how to apply that specific value to a `Server`.
  `setattr(s, "cpu_cores", parse_cpu(v))` sets an attribute by name at
  runtime, which is what lets one generic dispatch line below (`handler(current_server, value)`)
  stand in for what would otherwise be a growing `if key == "CPU": ... elif key == "RAM": ...`
  chain — this is the direct answer to your "10s of functions, lots of
  nesting" concern from earlier: the branching collapses into one dict
  lookup, and adding a new field later means adding one dict entry, not
  one more `elif`.
- `parse_lines(lines)` — the walker. Takes a plain list of strings, returns
  a plain list of `Datacenter` objects; no file access inside it at all,
  which is the I/O-versus-logic split from your very first question,
  applied here at full scale.
- `current_dc = None`, `current_rack = None`, `current_server = None` —
  the three pieces of remembered state, direct descendants of the `Cursor`
  toy example above, just as plain variables instead of wrapped in a class.
- `raw_line.rstrip("\n")` — strips the trailing newline each line carries
  when read from a file, so pattern matching isn't thrown off by an
  invisible `\n` at the end.
- `if not line.strip(): continue` — skips blank lines entirely; `continue`
  jumps straight to the next iteration of the `for` loop without running
  any of the code below it for this line.
- `if (m := DATACENTER_RE.match(line)):` — the walrus operator (`:=`)
  assigns the match result to `m` _and_ uses it as the `if` condition in
  one expression, so you don't need a separate `m = ...` line above the
  `if`. When a `Datacenter:` line is found, a fresh `Datacenter` is
  created, appended to the running list, and — importantly —
  `current_rack`/`current_server` are reset to `None`. That reset matters:
  it's what stops a stray `RAM:` line at the very top of a new datacenter,
  before any `Server` line, from accidentally attaching to a server left
  over from the _previous_ datacenter.
- The `RACK_RE` and `SERVER_RE` branches follow the identical shape: match,
  build a new object, append it into its parent's list, reset any deeper
  state. This is the same pattern three times at three levels — which is
  exactly why it doesn't need three separate Concept Units; it's one idea
  (match → build → attach → reset deeper state) applied at each nesting
  depth.
- The `FIELD_RE` branch dispatches through `FIELD_HANDLERS` rather than
  building the object directly, for the reason given above.

### Execution trace

Tracing the walker over these four real lines from the sample file:

```
Datacenter: US-EAST-1
    Rack R01
        Server web-01
            CPU: 8 cores
```

1. `"Datacenter: US-EAST-1"` — matches `DATACENTER_RE`. `current_dc` becomes
   a new `Datacenter(name="US-EAST-1")`, appended to `datacenters`. Because
   this branch's `continue` fires, none of the later `if`s even run for
   this line.
2. `"    Rack R01"` — fails `DATACENTER_RE` (no leading `Datacenter:` text),
   matches `RACK_RE` (exactly 4 spaces then `Rack R01`). `current_rack`
   becomes `Rack(name="R01")`, appended into `current_dc.racks`.
3. `"        Server web-01"` — fails both `DATACENTER_RE` and `RACK_RE`
   (wrong indent count for each), matches `SERVER_RE` (8 spaces).
   `current_server` becomes `Server(name="web-01")`, appended into
   `current_rack.servers`.
4. `"            CPU: 8 cores"` — fails the first three patterns (none of
   them match 12-space `CPU:` lines), matches `FIELD_RE`, capturing
   `("CPU", "8 cores")`. `FIELD_HANDLERS["CPU"]` is looked up and called as
   `handler(current_server, "8 cores")`, which runs
   `setattr(current_server, "cpu_cores", parse_cpu("8 cores"))` —
   `parse_cpu` matches `\d+` against `"8"`, so `current_server.cpu_cores`
   becomes the integer `8`.

### Real output from the full pipeline

Running `parse_lines` against the complete sample file and printing the
result as JSON (using `dataclasses.asdict` purely to make nested
dataclasses printable):

```
[
  {
    "name": "US-EAST-1",
    "racks": [
      {
        "name": "R01",
        "servers": [
          {"name": "web-01", "cpu_cores": 8, "ram_gb": 32, "status": "running", "tags": ["prod", "web"]},
          {"name": "web-02", "cpu_cores": 4, "ram_gb": 16, "status": "stopped", "tags": ["staging"]}
        ]
      },
      {
        "name": "R02",
        "servers": [
          {"name": "db-01", "cpu_cores": 16, "ram_gb": 64, "status": "running", "tags": ["prod", "db"]}
        ]
      }
    ]
  }
]
```

(Reformatted for width — the real run's actual output is unindented JSON;
the values above are copied verbatim from that run, not retyped by hand.)

### CS lens

This whole function is a small, hand-rolled **recursive-descent-style
tree builder**: text in, tree of objects out, driven entirely by a few
bits of remembered position. Also recognized in: real parsers for HTML/XML
(where nesting is tags instead of indentation), JSON parsers, YAML's own
indentation-sensitive parsing, and — directly relevant to you — G-code and
CAM toolpath readers, which track "current WCS," "current tool," "current
program" as state exactly the same way `current_dc`/`current_rack`/
`current_server` do here.

### SE lens

The alternative you were heading toward originally — one large function
with deeply nested `if`/`elif` and a pile of loose variables — does the
same job, but every added field type means another `elif` branch inside
an already-large function, and testing any one piece means running the
whole thing. Splitting recognition (`*_RE` patterns), extraction
(`parse_cpu`/`parse_ram`/`parse_tags`), and dispatch (`FIELD_HANDLERS`)
apart costs you more files/names to keep track of — a real, honest cost —
in exchange for every piece being independently nameable and testable,
which is what Concept Unit 5 cashes in on.

### Commands needed

None yet.

### Run it

Real output pasted above, from an actual run against the full sample text.

### Connect

The parser now reliably turns text into a tree of `Server`/`Rack`/
`Datacenter` objects. Nothing checks whether that data is actually _good_
yet — a server missing its RAM field parses just fine, silently, as
`ram_gb=None`. That's next.

---

## Concept Unit 4: Validating, and collecting every error

### The Problem

Suppose `web-02` above is missing its `RAM:` line entirely in the real
file — a typo, a copy-paste mistake, whatever. `parse_lines` will still
happily produce a `Server` for it, with `ram_gb=None`. If your validation
raised an exception on the very first problem it found, what would you
learn about the _rest_ of the file in that same run? What would you
actually want instead, if you were the one fixing the file by hand
afterward?

### Introduce the concept in isolation

```python
def check_positive(n):
    if n <= 0:
        raise ValueError(f"{n} is not positive")
    return n

numbers = [5, -3, 8, -1, 2]
try:
    checked = [check_positive(n) for n in numbers]
    print("all good:", checked)
except ValueError as e:
    print("stopped at first problem:", e)
```

I'm stating this one's output directly: `check_positive` raises on the
first negative number it hits inside the list comprehension, and Python
list comprehensions don't catch exceptions from inside themselves — the
exception propagates immediately, so the loop never reaches `8`, `-1`, or
`2` at all. The predicted output:

```
stopped at first problem: -3 is not positive
```

This demonstrates the exact shortfall the Problem above describes: `-1`
is also broken, but you'd never find out in this run — you'd fix `-3`,
run it again, _then_ discover `-1`. That's the case for collecting errors
instead of raising on the first one.

### Discard the throwaway example

`check_positive` doesn't appear again — it only existed to make the
raise-and-stop shortfall concrete before building the collect-everything
version.

### Project Change

- **Reference Source:** none — from-scratch.
- **Files affected:** `inventory.py`, appended.
- **Change type:** add.
- **Location:** after `parse_text` from Concept Unit 3.
- **Dependencies:** the `Server`/`Rack`/`Datacenter` dataclasses.

### The New Code

```python
@dataclass
class ValidationError:
    path: str
    message: str

@dataclass
class ValidationResult:
    errors: List[ValidationError] = field(default_factory=list)

    @property
    def is_valid(self):
        return len(self.errors) == 0

    def add(self, path, message):
        self.errors.append(ValidationError(path, message))

ALLOWED_STATUS = {"running", "stopped", "maintenance"}

def validate_server(server, path, result):
    if server.cpu_cores is None:
        result.add(path, "missing or unparsable CPU cores")
    if server.ram_gb is None:
        result.add(path, "missing or unparsable RAM")
    if server.status is None:
        result.add(path, "missing status")
    elif server.status not in ALLOWED_STATUS:
        result.add(path, f"status '{server.status}' not in {sorted(ALLOWED_STATUS)}")
    if not server.tags:
        result.add(path, "no tags assigned")

def validate_datacenters(datacenters):
    result = ValidationResult()
    seen_names = set()
    for dc in datacenters:
        for rack in dc.racks:
            for server in rack.servers:
                path = f"{dc.name}/{rack.name}/{server.name}"
                if server.name in seen_names:
                    result.add(path, "duplicate server name across inventory")
                seen_names.add(server.name)
                validate_server(server, path, result)
    return result
```

### The Updated Project

```python
 1  @dataclass
 2  class ValidationError:                 # ← new
 3      path: str                          # ← new
 4      message: str                       # ← new
 5
 6  @dataclass
 7  class ValidationResult:                # ← new
 8      errors: List[ValidationError] = field(default_factory=list)  # ← new
 9
10      @property                          # ← new
11      def is_valid(self):                # ← new
12          return len(self.errors) == 0   # ← new
13
14      def add(self, path, message):      # ← new
15          self.errors.append(ValidationError(path, message))  # ← new
```

(`validate_server` and `validate_datacenters` are new, freestanding
functions — full code already shown above in The New Code.)

### Mechanical walkthrough

- `ValidationError` — a plain dataclass, same mechanism as `Server`: a
  named place a problem happened (`path`) and what the problem was
  (`message`).
- `ValidationResult` — holds a _list_ of `ValidationError`s, again with
  `default_factory=list` for the same reason as every prior list field.
- `@property` — a decorator turning a method into something read like a
  plain attribute: callers write `result.is_valid`, not
  `result.is_valid()`. It exists so "is this valid" reads as a fact about
  the object, not an action you perform on it — and so the underlying
  check (`len(self.errors) == 0`) can change later without any caller
  needing to change how they ask the question.
- `self.errors.append(ValidationError(path, message))` inside `add` — the
  one place new errors actually get created, so every caller of `add`
  stays ignorant of `ValidationError`'s own shape.
- `ALLOWED_STATUS = {"running", "stopped", "maintenance"}` — a `set`
  literal; membership testing (`x in ALLOWED_STATUS`) on a set is a direct,
  clear way to express "one of these specific known values," which is
  exactly the kind of check your original description ("if this is in
  line and that was already seen") was gesturing at, just applied to a
  parsed field instead of a raw line.
- `validate_server` — five independent `if`/`elif` checks, each calling
  `result.add(...)` rather than raising. Because none of them `return`
  or `raise`, every applicable check for one server actually runs, so a
  server broken in three ways produces three separate errors in one pass
  — directly answering the Problem above.
- `validate_datacenters` — three nested `for` loops walking the whole
  tree (datacenter → rack → server), building a human-readable `path`
  string per server (`"US-EAST-1/R01/web-01"`) so an error message says
  _exactly_ which server it's about, and a `seen_names` set catching
  duplicate server names across the entire file, not just within one
  rack.

### CS lens

Returning a structured result object instead of raising on the first
problem is a lightweight version of the **Result type** idea (formalized
in languages like Rust as `Result<T, E>`, or Haskell's `Either`): "the
outcome of this operation might be a success or a specific, inspectable
failure" is treated as ordinary data your caller examines, not as
something that unwinds the call stack. Also recognized in: HTTP responses
(status code + body, not a thrown exception per failed request), build
tools that report every compile error in a file instead of stopping at
the first, and linters.

### SE lens

The alternative — `raise ValueError(...)` on the first bad field — is
simpler to write and is the right tool when a problem genuinely means
"stop, nothing after this point is safe to keep doing" (a missing file,
a truly malformed structure the parser itself can't make sense of at
all). It's the wrong tool for "here are the data-quality problems in this
one record," specifically because that's a case where seeing every
problem in one pass is strictly more useful than seeing them one fix-cycle
at a time. The real cost of the collect-everything approach: every caller
now has to remember to actually check `result.is_valid` — nothing forces
them to, the way an uncaught exception would.

### Commands needed

None.

### Run it

```
is_valid: True
```

— real output from running `validate_datacenters` against the full
parsed sample data (all fields present and valid, so no errors).

### Connect

Parsing and validation are both real now, and both fully decoupled from
files and from each other. The last piece is proving all of this with
actual tests, the way you originally asked.

---

## Concept Unit 5: Testing every layer, without testing the real file directly

### The Problem

You now have several independently-callable pieces: four small field
parsers, one tree-building walker, and validation logic with five separate
checks. Given everything built so far — which of these pieces need a real
file on disk to test, and which don't? What's the smallest possible input
you could hand each one, directly, to prove it works?

### Introduce the concept in isolation

```python
import pytest

def add_positive(a, b):
    if a < 0 or b < 0:
        raise ValueError("no negatives")
    return a + b

@pytest.mark.parametrize("a, b, expected", [
    (1, 2, 3),
    (0, 0, 0),
    (10, 5, 15),
])
def test_add_positive(a, b, expected):
    assert add_positive(a, b) == expected
```

I'm stating the predicted result rather than re-running it here: this is
the identical `pytest.mark.parametrize` mechanism already run for real,
repeatedly, in the actual test suite below (same decorator, same
`assert`-based checking), so its behavior is already directly confirmed
in this same lesson session, on this same machine. Predicted result: 3
passed, 0 failed.

This is called a **parametrized test**.

### Discard the throwaway example

`add_positive` doesn't appear in the real project — only the
`@pytest.mark.parametrize` pattern it demonstrates carries forward.

### Project Change

- **Reference Source:** none — from-scratch.
- **Files affected:** new file, `test_inventory.py`, alongside
  `inventory.py`.
- **Change type:** add.
- **Location:** whole new file.
- **Dependencies:** `pytest` (`pip install pytest`), and every function
  from `inventory.py` built in Units 1-4.

### The New Code

```python
import pytest
from inventory import (
    parse_cpu, parse_ram, parse_tags, parse_lines,
    Server, Rack, Datacenter, ValidationResult,
    validate_server, validate_datacenters, SAMPLE_TEXT,
)

# --- table-driven tests for the small field parsers ---
@pytest.mark.parametrize("line, expected_fn, expected", [
    ("8 cores", parse_cpu, 8),
    ("16 cores", parse_cpu, 16),
    ("weird", parse_cpu, None),
    ("32GB", parse_ram, 32),
    ("64 GB", parse_ram, 64),
    ("lots", parse_ram, None),
])
def test_field_parsers(line, expected_fn, expected):
    assert expected_fn(line) == expected

def test_parse_tags_splits_and_strips():
    assert parse_tags("prod, web") == ["prod", "web"]

def test_parse_tags_empty_string_gives_empty_list():
    assert parse_tags("") == []


# --- test the walker with a tiny synthetic fixture, not the real file ---
MINI_FILE = """Datacenter: DC1
    Rack A
        Server s1
            CPU: 2 cores
            RAM: 8GB
            Status: running
            Tags: test
"""

def test_walker_builds_correct_nesting():
    dcs = parse_lines(MINI_FILE.splitlines())
    assert len(dcs) == 1
    assert dcs[0].name == "DC1"
    server = dcs[0].racks[0].servers[0]
    assert server.name == "s1"
    assert server.cpu_cores == 2
    assert server.ram_gb == 8
    assert server.status == "running"
    assert server.tags == ["test"]


# --- validation: one baseline fixture, mutate one field per test ---
def valid_server():
    return Server(name="s1", cpu_cores=8, ram_gb=32, status="running", tags=["prod"])

def test_valid_server_passes():
    result = ValidationResult()
    validate_server(valid_server(), "path", result)
    assert result.is_valid

def test_missing_cpu_fails():
    s = valid_server()
    s.cpu_cores = None
    result = ValidationResult()
    validate_server(s, "path", result)
    assert not result.is_valid
    assert any("CPU" in e.message for e in result.errors)

def test_bad_status_fails():
    s = valid_server()
    s.status = "on-fire"
    result = ValidationResult()
    validate_server(s, "path", result)
    assert not result.is_valid

def test_no_tags_fails():
    s = valid_server()
    s.tags = []
    result = ValidationResult()
    validate_server(s, "path", result)
    assert not result.is_valid

def test_duplicate_server_name_flagged():
    dc = Datacenter(name="DC1", racks=[
        Rack(name="A", servers=[valid_server()]),
        Rack(name="B", servers=[valid_server()]),
    ])
    result = validate_datacenters([dc])
    assert not result.is_valid
    assert any("duplicate" in e.message for e in result.errors)


# --- golden test: full pipeline against the real sample text ---
def test_full_pipeline_on_sample_text_is_valid():
    dcs = parse_lines(SAMPLE_TEXT.splitlines())
    result = validate_datacenters(dcs)
    assert result.is_valid
```

### The Updated Project

This is a brand-new file with nothing to nest it inside — same exemption
as `Server` was in Unit 1 — so the whole file is what's shown above.

### Mechanical walkthrough

- `from inventory import (...)` — a multi-name import; each name pulled in
  is exactly one thing built in a prior Concept Unit — nothing here is
  untested provenance.
- `@pytest.mark.parametrize("line, expected_fn, expected", [...])` on
  `test_field_parsers` — same mechanism from the isolated lab, now doing
  real work: six rows, covering both `parse_cpu` and `parse_ram` in one
  test function, including the `None`-on-no-match case for each.
- `test_parse_tags_*` — two small, ordinary (non-parametrized) tests,
  because there are only two meaningfully different cases (something to
  split, nothing to split) — parametrize is a tool for many similar cases,
  not a requirement for every test regardless of count.
- `MINI_FILE` — a small, hand-written fixture string, standing in for a
  real file, per the Problem above: proving the _walker's nesting logic_
  doesn't require a 500-line real inventory file, only enough structure
  to prove one datacenter/rack/server chain assembles correctly.
- `test_walker_builds_correct_nesting` — asserts on the actual object
  graph `parse_lines` produced from `MINI_FILE`, confirming state
  (`current_dc`/`current_rack`/`current_server`) was tracked correctly
  end to end.
- `valid_server()` — a small factory function, not a `pytest` fixture in
  the strict "`@pytest.fixture`" sense, but serving the same role: one
  known-good baseline object every validation test starts from and
  mutates exactly one field away from.
- `test_missing_cpu_fails`, `test_bad_status_fails`, `test_no_tags_fails`
  — each takes `valid_server()`, breaks exactly one field, and asserts
  `validate_server` caught it — directly testing three of the five
  independent checks inside `validate_server` in isolation from each
  other.
- `test_duplicate_server_name_flagged` — builds a small `Datacenter` with
  the _same_ server object (via `valid_server()`, called twice) placed in
  two different racks, proving the cross-rack duplicate-name check in
  `validate_datacenters` actually fires.
- `test_full_pipeline_on_sample_text_is_valid` — the golden test: real
  sample text, through the real parser, through real validation, checked
  against the one fact you actually care about at this scale (`is_valid`
  is `True`) rather than reasserting every individual field.

### Run it

Actually run with `python3 -m pytest test_inventory.py -v`. Real output:

```
============================= test session starts ==============================
platform linux -- Python 3.12.3, pytest-9.1.1, pluggy-1.6.0
collecting ... collected 15 items

test_inventory.py::test_field_parsers[8 cores-parse_cpu-8] PASSED        [  6%]
test_inventory.py::test_field_parsers[16 cores-parse_cpu-16] PASSED      [ 13%]
test_inventory.py::test_field_parsers[weird-parse_cpu-None] PASSED       [ 20%]
test_inventory.py::test_field_parsers[32GB-parse_ram-32] PASSED          [ 26%]
test_inventory.py::test_field_parsers[64 GB-parse_ram-64] PASSED         [ 33%]
test_inventory.py::test_field_parsers[lots-parse_ram-None] PASSED        [ 40%]
test_inventory.py::test_parse_tags_splits_and_strips PASSED              [ 46%]
test_inventory.py::test_parse_tags_empty_string_gives_empty_list PASSED  [ 53%]
test_inventory.py::test_walker_builds_correct_nesting PASSED             [ 60%]
test_inventory.py::test_valid_server_passes PASSED                       [ 66%]
test_inventory.py::test_missing_cpu_fails PASSED                         [ 73%]
test_inventory.py::test_bad_status_fails PASSED                          [ 80%]
test_inventory.py::test_no_tags_fails PASSED                             [ 86%]
test_inventory.py::test_duplicate_server_name_flagged PASSED             [ 93%]
test_inventory.py::test_full_pipeline_on_sample_text_is_valid PASSED     [100%]

============================== 15 passed in 0.03s ==============================
```

### CS lens

Splitting tests by layer — unit tests per small function, one integration
test per whole pipeline — is the **testing pyramid** idea: many cheap,
fast, narrowly-scoped tests at the bottom, a small number of broad,
slower tests at the top confirming the pieces actually fit together. Also
recognized in: CI pipelines for compiled software (unit tests, then
integration tests, then a slow end-to-end suite), and API testing
practice generally (mock the network layer for unit tests, hit a real
staging server rarely, in a separate suite).

### SE lens

The alternative — one giant test that runs the whole parser against a
real, full-size file and checks the final output — is faster to write
_once_, but when it fails, it tells you almost nothing about _where_: was
it the CPU regex, the state tracking, or a validation rule? Layered tests
cost more to write up front (15 small tests instead of 1 big one here) in
exchange for a failure pointing you, by test name, straight at the broken
piece.

### Connect

Every layer from your original question — reading a changing file,
parsing line-by-line into variables, nested if-based checks across many
fields — now has a tested, independently-runnable counterpart: small
regex-based recognizers, a stateful-but-simple walker, an error-collecting
validator, and a test suite proving each piece and the whole pipeline.

---

## Connect the pieces

One value, traced through everything built in this lesson: the raw line
`"            CPU: 8 cores"` from `web-01`'s entry. `FIELD_RE` (Unit 2)
recognizes it as a field line and captures `("CPU", "8 cores")`.
`parse_lines`'s state (Unit 3) knows `current_server` is currently the
`Server` object for `web-01`, because the `"Server web-01"` line three
lines earlier set it. `FIELD_HANDLERS["CPU"]` (Unit 3) is looked up and
called, running `parse_cpu("8 cores")`, which regex-matches `\d+` against
`"8"` and returns the integer `8`; `setattr` stores it as
`web-01.cpu_cores`. Later, `validate_server` (Unit 4) checks
`web-01.cpu_cores is None` — it isn't, so no error is added for that
field. And `test_field_parsers` (Unit 5) independently proves
`parse_cpu("8 cores") == 8` on its own, with no file, no walker, and no
validation involved at all — the same fact, checked three different ways,
at three different layers, none of which depend on the others being
correct to be trusted on their own.

---

## Where this goes next, with your real file

When you bring the XML, the shape doesn't change — you'll add: (1) a
second, separate parser for the XML side (same split of I/O vs. logic),
(2) a `merge` function taking two plain objects in and returning one
merged object out, tested the same "baseline + mutate one field" way
`validate_server` was, and (3) validation rules specific to what your GUI
already checks for, each one its own small, named test. The pattern —
recognize → extract → build → validate (collecting, not raising) → test
each layer on its own — is the whole transferable idea; everything else
is just your real field names in place of `CPU`/`RAM`/`Status`/`Tags`.
