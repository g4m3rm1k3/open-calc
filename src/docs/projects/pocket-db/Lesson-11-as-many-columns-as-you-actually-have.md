# Lesson 11: As Many Columns as You Actually Have

**What you will build**
The real, ergonomic `pocketdb` API `README.md`'s own architecture
section promised from the start —
`db.create_table("games", id=INTEGER, player=TEXT, score=INTEGER)` and
`db.insert("games", 1, "Alice", 100)` — replacing Lesson 10's own
working, but real, separate-list-arguments version.

**What you need to know first:** Lesson 10 — `Database.create_table`/
`.insert`, taking `column_names`/`column_types` as separate real lists.

**Terms introduced in this lesson:**
- **`**kwargs`** — a real parameter shape collecting every *keyword*
  argument a caller passes — every `name=value` a caller writes that
  doesn't match one of the function's own explicitly named
  parameters — into one real Python `dict`, keyed by each real
  argument's own name.
- **`*args`** — a real parameter shape collecting every *positional*
  argument beyond a function's own explicitly named parameters into one
  real Python `tuple`, in the exact real order they were passed.

**Objects and methods used**
- **`dict.keys()` / `dict.values()` / `dict.items()`**
  - *What they are:* real, built-in `dict` methods — `.keys()` returns
    every real key, `.values()` every real value, `.items()` every
    real key-value pair together, each as a real, iterable view over
    the dictionary's own current contents.
  - *Implementation:* `columns.keys()` — real, live keys, in the exact
    real order they were inserted (a guaranteed real property of
    Python's own `dict`, not an implementation accident); `columns.items()`
    yields real `(key, value)` pairs, one at a time, each unpackable
    directly into two separate names in a `for` loop.
  - *Its use:* `Database.create_table`, this lesson's own real subject
    — turning the real `**kwargs` dictionary into the two real, parallel
    lists `database_create_table` (Lesson 6) actually needs.

---

## Concept Unit: `**kwargs` — Every Keyword Argument, Collected Into One Real `dict`

### The Problem

`Database.create_table(self, name, column_names, column_types)`
(Lesson 10) works, but doesn't read the way `README.md`'s own promised
API does — `db.create_table("games", id=INTEGER, player=TEXT, score=INTEGER)`
has no separate lists at all; each column's name and type are written
together, once, as one real keyword argument. What real Python
parameter shape receives an *unknown, varying number* of keyword
arguments like that?

### Introduce the Concept in Isolation

Nothing about `pocketdb` yet. Save this as `kwargs_check.py`, in
`pocketdb/`:

```python
def describe_pet(name, **traits):
    print(f"name = {name}")
    print(f"traits = {traits}")
    for key, value in traits.items():
        print(f"  {key}: {value}")


describe_pet("Rex", species="dog", age=3)
```

Run with `python kwargs_check.py`. Real output:

```text
name = Rex
traits = {'species': 'dog', 'age': 3}
  species: dog
  age: 3
```

*What this proves:* `describe_pet` was called with `name="Rex"`
(matching its own explicit parameter) and two more real keyword
arguments, `species="dog"` and `age=3`, neither one named in the
function's own signature — both were collected automatically into one
real `dict`, `traits`, exactly as written: `{'species': 'dog', 'age': 3}`.
This is called `**kwargs` — the parameter name `traits` here is
whatever the function chooses to call it; `**` (not the name itself)
is what actually means "collect every remaining keyword argument."

### Discard the Throwaway Example

`kwargs_check.py` is deleted:

```bash
rm kwargs_check.py
```

### Mechanical Walkthrough

- `def describe_pet(name, **traits):` — `name` is an ordinary, required
  parameter; `**traits` collects everything else, *only* if passed by
  keyword (`species="dog"`, not a bare positional value) — the real
  `**` is what enables this collecting behavior; `traits` is only ever
  the chosen name for the resulting real `dict`.
- `traits` (printed directly) — a real, ordinary Python `dict`, usable
  exactly like any other — nothing about it being built from `**kwargs`
  makes it a different kind of `dict`.
- `for key, value in traits.items():` — covered fully in Objects and
  methods used, above — `key, value` unpacks each real `(key, value)`
  pair `.items()` yields into two separate real names, one per
  iteration.
- `describe_pet("Rex", species="dog", age=3)` — `"Rex"` matches `name`
  positionally; `species="dog"` and `age=3`, written as real keyword
  arguments, are what actually populate `traits`.

### CS Lens

This is **variadic keyword arguments** — a real, language-level way to
accept an unknown, varying number of named arguments, rather than
requiring a function's own signature to enumerate every possible one in
advance. Also recognized in: JavaScript's own object destructuring for
options-style parameters, and — a repo-internal comparison worth naming
directly — C#'s named/optional parameters, a related but genuinely
different real mechanism (still requires every possible name declared
in the method's own signature, unlike `**kwargs`'s genuinely open-ended
real set).

### SE Lens

Why does `describe_pet`'s signature keep `name` as an explicit,
required parameter instead of folding it into `**traits` too (calling
it `describe_pet(**traits)`, with `traits["name"]` read out inside)?
Because `name` is genuinely required, every real time — `**kwargs`
alone provides no way to *require* a specific real key exists; a caller
forgetting it would only be caught later, the first time the function's
own body actually tries to read a now-missing key, far from the real
mistake's own true source. Keeping genuinely required arguments
explicit, and reserving `**kwargs` only for the real, open-ended part,
catches that real mistake immediately, at the call site itself.

### Commands Needed

Already shown above, alongside the file.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

`**kwargs` can now collect an unknown number of real, named arguments
into a real `dict`. `*args` — the identical real idea for *positional*
arguments — is next, needed for `insert`'s own real values.

---

## Concept Unit: `*args` — Every Positional Argument, Collected Into One Real `tuple`

### The Problem

`db.insert("games", 1, "Alice", 100)` needs `insert` to accept a real,
varying number of plain positional values — one call might insert three
values, another four, depending on the real table's own column count —
without a fixed, hand-written parameter list.

### Introduce the Concept in Isolation

Save this as `args_check.py`:

```python
def total(*numbers):
    print(f"numbers = {numbers}")
    result = 0
    for n in numbers:
        result = result + n
    return result


print(f"total(1, 2, 3) = {total(1, 2, 3)}")
print(f"total(10) = {total(10)}")
```

Run with `python args_check.py`. Real output:

```text
numbers = (1, 2, 3)
total(1, 2, 3) = 6
numbers = (10,)
total(10) = 10
```

*What this proves:* `total(1, 2, 3)` and `total(10)` — genuinely
different numbers of real arguments — both worked, with `*numbers`
collecting whatever was actually passed into a real `tuple` each time:
`(1, 2, 3)` the first call, `(10,)` (a real, one-element tuple — the
trailing comma is what makes it a tuple rather than a plain
parenthesized number) the second. This is called `*args` — again, the
real `*` is what does the collecting; `numbers` is only the chosen name.

### Discard the Throwaway Example

`args_check.py` is deleted:

```bash
rm args_check.py
```

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `pocketdb.py` (modified — `create_table`/`insert`'s
  own real signatures change).
- **Change type:** Refactor (real, working Lesson 10 behavior,
  unchanged — only the real parameter shape callers use changes).
- **Dependencies:** `**kwargs` (this lesson's first unit), `*args`
  (this unit's own isolated proof).

### The Updated Project — `Database.create_table` and `.insert`, Rewritten

```python
def create_table(self, name, **columns):                                   # ← changed (was column_names, column_types)
    column_names = list(columns.keys())                                    # ← new
    column_types = list(columns.values())                                  # ← new

    names_array = (ctypes.c_char_p * len(column_names))(                   # ← unchanged
        *[n.encode("utf-8") for n in column_names]
    )
    types_array = (ctypes.c_int * len(column_types))(*column_types)        # ← unchanged

    result = _engine.database_create_table(                               # ← unchanged
        self._handle, name.encode("utf-8"), names_array, types_array, len(column_names)
    )
    if result != 0:                                                       # ← unchanged
        raise PocketDBError(f"Failed to create table '{name}'")

def insert(self, table, *values):                                          # ← changed (was values, a plain list)
    str_values = [str(v).encode("utf-8") for v in values]                  # ← unchanged
    values_array = (ctypes.c_char_p * len(str_values))(*str_values)        # ← unchanged

    result = _engine.database_insert(                                     # ← unchanged
        self._handle, table.encode("utf-8"), values_array, len(str_values)
    )
    if result != 0:                                                       # ← unchanged
        raise PocketDBError(f"Failed to insert into table '{table}'")
```

Proven for real — the exact API `README.md` originally promised. Save
this as `verify_kwargs.py`:

```python
from pocketdb import Database, INTEGER, TEXT

db = Database()
db.create_table("games", id=INTEGER, player=TEXT, score=INTEGER)
db.insert("games", 1, "Alice", 100)
db.insert("games", 2, "Bob", 85)
print(f"row 0: {db.get('games', 0)}")
print(f"row 1: {db.get('games', 1)}")
db.close()
print("done")
```

Run with `python verify_kwargs.py`. Real output:

```text
row 0: ['1', "'Alice'", '100']
row 1: ['2', "'Bob'", '85']
done
```

*What this proves:* the identical real data, from the identical real
engine, now created and inserted through a genuinely more natural real
API — no separate lists, no manually matching a name to its type by
position across two parallel lists — and it still produces the exact
same correct, real round trip Lesson 10 already proved.

### Discard the Throwaway Example

`verify_kwargs.py` is deleted:

```bash
rm verify_kwargs.py
```

`pocketdb.py`'s updated `create_table`/`insert` are kept.

### Mechanical Walkthrough

- `def create_table(self, name, **columns):` — reappearing exactly
  (this lesson's own first unit) — `self`/`name` stay explicit and
  required; `**columns` replaces Lesson 10's own two separate list
  parameters.
- `column_names = list(columns.keys())` — covered fully in Objects and
  methods used, above; `list(...)` converts the real `.keys()` view
  into a real, ordinary `list`, needed because the rest of this
  method's own body (unchanged from Lesson 10) expects a real `list`,
  specifically to call `len(...)` on it and index it by position.
- `column_types = list(columns.values())` — reappearing shape, the
  identical real conversion for values instead of keys.
- `def insert(self, table, *values):` — reappearing shape — `*values`
  replaces Lesson 10's own single, explicit `values` list parameter;
  everything inside the method's own body treats `values` exactly the
  same way either way, since a real `tuple` (from `*args`) supports the
  identical real operations (`len()`, iteration) this code already
  used on a `list`.

### CS Lens

This is **variadic positional arguments**, the direct sibling of this
lesson's own first unit — the same real idea (an unknown, varying
number of real arguments, collected automatically) applied to
positional rather than keyword arguments. Also recognized in: C's own
variadic functions (`printf`'s real `...`), and Java's varargs
(`Type... name`) — different real syntax, the identical underlying
need.

### SE Lens

Why does `column_names`/`column_types` still get converted into real,
separate `list`s inside `create_table`, instead of restructuring the
rest of the method to work directly with the real `dict` `**columns`
already produced? Because `database_create_table` (Lesson 6) needs two
real, separate, *parallel* C arrays — a `dict`'s own real internal
shape has no direct equivalent to "two parallel arrays," so converting
to `list`s here is the real, necessary translation step between
Python's own natural shape and the shape the `extern "C"` boundary
actually requires — not extra, avoidable work, the same real kind of
translation this whole project has done at every layer since Lesson 6.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The Updated Project" — the full, real,
now-ergonomic round trip.

### Connection

`pocketdb`'s real, public API now matches `README.md`'s own original
promise exactly. What remains is real packaging — making
`pocketdb_engine.dll` locatable regardless of where a script importing
`pocketdb` actually runs from, and one final, complete, real demo
closing out Slice S01 for good.

---

## Closing

### Connect the Pieces

`**kwargs`, proven in isolation with `describe_pet`, collects an
unknown number of real keyword arguments into a real `dict` —
`Database.create_table`'s own `**columns` uses the identical real
mechanism to accept `id=INTEGER, player=TEXT, score=INTEGER` directly,
converting it into the two real, parallel lists
`database_create_table` (Lesson 6) has always needed underneath.
`*args`, proven the identical way with `total`, collects an unknown
number of real positional arguments into a real `tuple` —
`Database.insert`'s own `*values` uses it to accept
`db.insert("games", 1, "Alice", 100)` directly, with no separate list
argument at all. Neither change touched a single line of this
project's own C++ engine, or the real `extern "C"` boundary itself —
proven directly, by the identical real data reading back correctly
through the new, more natural Python surface.

### What Breaks Without This

Call `db.create_table("games", ["id", "player"], [INTEGER, TEXT])` —
Lesson 10's own real calling shape — against this lesson's updated
`create_table(self, name, **columns)`. Real error:
`TypeError: create_table() takes 2 positional arguments but 4 were given`
(`self` — supplied automatically since this is a real method call on
`db` — counts as one of the four, alongside `"games"` and the two real
lists)
— because `**columns` only ever collects real *keyword* arguments;
plain positional ones (like Lesson 10's own two lists) no longer match
this method's own real signature at all. Calling it the real, intended
way — `db.create_table("games", id=INTEGER, player=TEXT)` — works
correctly.

### Exercises

- Add a real `**options` parameter to `Database.__init__` itself
  (accepting, for instance, a real, optional `verbose=True` flag that
  prints a message every time a query runs) — proving `**kwargs` works
  identically on `__init__`, not just ordinary methods.
- Write a real Python function, `describe_call(*args, **kwargs)`,
  accepting *both* shapes at once, and call it several different real
  ways — some positional arguments, some keyword, some of each. Print
  both `args` and `kwargs` each time, and confirm your own prediction
  of which real values land in which one before running it.
- `create_table`'s own `column_names = list(columns.keys())` relies on
  a real, guaranteed Python behavior: `dict`s preserve real insertion
  order. Look up (or test directly, by inserting keys out of numeric
  order and reading them back) whether this has always been true in
  every real Python version, or whether it's a more recent real
  language guarantee — and explain why this project's own `create_table`
  would give genuinely wrong results if it weren't true.

### Definition of Done

- [ ] `Database.create_table`/`.insert` both use `**kwargs`/`*args`
      respectively, in your own real `pocketdb.py`.
- [ ] `db.create_table("games", id=INTEGER, player=TEXT, score=INTEGER)`
      and `db.insert("games", 1, "Alice", 100)` both work correctly,
      run for real, in your own test script.
- [ ] You caused the real `TypeError` yourself, calling `create_table`
      the old, Lesson 10 way, and can explain why `**kwargs` rejects it.
- [ ] You can explain, from memory, the real difference between
      `**kwargs` and `*args` — which real argument shape (keyword vs.
      positional) each one collects.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Use **kwargs/*args for the real, ergonomic create_table/insert API"`.
