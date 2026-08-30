# Lesson 1.4: Data Structures

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** No new backend feature - this lesson reads the real data structures this backend already builds, in `backend/app/routes/operation_manager.py` and `backend/app/routes/tool_assemblies.py`, and isolates each construct those real functions actually use (dictionaries, lists, sets, tuples, nested combinations of all four) in small, real, throwaway labs first, so the real code's own choices - a dict for one job, a list for another, a set for a third - can be read as deliberate, not incidental.

**What you need to know first:** Reading a real, existing file as evidence for what a function actually does; calling a real function and reading its actual return value.

## Terms used in this lesson

- **Hashable** — A real property a value either has or doesn't: whether Python can compute a stable hash for it, usable as a dict key or a set member. Every immutable built-in value (a string, an int, a tuple whose own elements are all themselves hashable) is hashable; every mutable built-in value (a list, a dict, a set itself) is not. A tuple is the one case where immutability alone doesn't automatically guarantee it: `(1, 2, [3, 4])` is itself immutable (nothing can reassign its own elements) but still isn't hashable, since hashing it would require hashing its own contained list too, and a list can't be hashed at all - confirmed this session: `hash((1, 2, [3, 4]))` raises the identical real `TypeError: unhashable type: 'list'` this lesson's own Sets unit already produces. It exists as its own concept because a dict/set's own real lookup speed depends on that hash staying valid for as long as the value is stored - a value that could change after being stored would silently break that lookup, so Python refuses mutable values as keys/members outright rather than risk it.
- **Mutable / immutable** — Whether a real value can be changed in place after creation (mutable - lists, dicts, sets) or not (immutable - strings, ints, tuples). It exists as its own concept because it is a structural fact about the value itself, independent of what variable happens to reference it: two names bound to the same real mutable object can each see the other's in-place changes, while an immutable value can only ever be replaced wholesale, never altered underneath a name already holding it.

## Objects and methods used

- **`dict.get`**
  - *What it is:* A real built-in `dict` method that reads a key's value without raising if the key is absent.
  - *Implementation:* `dict.get(key, default=None)` - part of Python's own built-in `dict` type.
  - *Its use:* This lesson's first unit uses it wherever a real key might legitimately be absent, so a normal, expected case (no custom order yet, no `toolNumber` recorded) doesn't have to be handled as an exception.
  - *Type:* A built-in method on every `dict` instance.
  - *Responsibility:* Return the real value stored under `key` if present, or `default` (itself defaulting to `None`) if not - never raising.
  - *Depends on:* Nothing beyond the dict instance it's called on.
  - *Connects to:* Used directly against `master_object`, a real dict returned by `operation_order.get_master_object()`, in this lesson's first unit.
  - *Shape:* Takes a key and an optional default in; returns whatever real value is stored, or the default, unchanged - never a new value derived from either.

- **`set`**
  - *What it is:* Python's real built-in unordered collection type, holding only hashable values, each stored at most once.
  - *Implementation:* `set(iterable)` - a built-in type, constructible from any real iterable.
  - *Its use:* This lesson's fourth unit uses it to collapse a real list of tool numbers, one per sequence, down to only the distinct ones actually used - the real question being asked is 'which tool numbers appear at all,' not 'in what order, or how many times.'
  - *Type:* A built-in mutable collection type.
  - *Responsibility:* Store a real collection of values with no duplicates and no guaranteed order, and answer real membership/uniqueness questions efficiently, using each stored value's own hash.
  - *Depends on:* Every value passed to it being hashable - a real, structural requirement, not a style preference.
  - *Connects to:* Its result is immediately passed to `list()`, since JSON (this lesson's real destination for this data) has no set type of its own.
  - *Shape:* Built from any real iterable (a list, a generator expression); iterating it yields each distinct value exactly once, in an order this lesson's own labs show is not guaranteed to match insertion order.

- **`tuple`**
  - *What it is:* Python's real built-in fixed-size, immutable sequence type.
  - *Implementation:* A literal, comma-separated sequence, optionally parenthesized - `(3, 7)`, or bare, `3, 7`.
  - *Its use:* This lesson's fifth unit reads it as the real, already-present return shape of two constructs already used earlier in this same lesson and the one before it - `enumerate()` and `dict.items()` - rather than as a construct this lesson introduces from nothing.
  - *Type:* A built-in immutable sequence type.
  - *Responsibility:* Hold a fixed, real number of values together as one unit, in a fixed real order, without allowing any of them to be reassigned after creation.
  - *Depends on:* Nothing beyond the values placed inside it at creation.
  - *Connects to:* Its own immutability is what makes a tuple of hashable values itself hashable - usable as a dict key or set member, unlike a list of the same values.
  - *Shape:* A fixed-length sequence, index-accessible like a list, but with no method that changes its own contents in place - any transformation produces a new tuple, never modifies the existing one.

## Concept Unit: Dictionaries - Key-Value Data, and Reading a Key That Might Not Be There

### The Problem

A real `dict` is how this backend represents "a named piece of export metadata" - `'programType'`, `'pairingId'`, and so on. Some of those keys are always present; others, like a saved customization's `numParts`, only exist if a customization was ever saved at all. Reading a key that might legitimately be absent the same way as one that's always there - plain `[]` indexing - fails the moment the absent case actually happens.

Before reading on:

- If `config["operatorName"]` raises when `"operatorName"` isn't a key, what real, different outcome would you want instead, for a key you already expect might sometimes be missing?
- Given a dict `config`, what's the real difference between asking `"mill" in config` and `"programType" in config` - which one checks a key, and which one (if either) checks a value?

### Project Change

- **Reference Source:** `backend/app/routes/operation_manager.py:874-881` and `:836-842`, real, already-existing code, read and quoted verbatim this session.
- **Files affected:** `verification/phase-01/lab_dict_get.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** None - Python's own built-in `dict` type only.

`_build_export_data` builds `export`, a real dict, one key at a time - some keys (`'exportedAt'`, `'pairingId'`) are always set directly; others are only set if a real condition holds first (`if part:`, checked in the next unit). Inside the customizations branch, `master_object.get('numParts', 1)` reads a key from a dict that might not have it at all - a saved customization dict is only guaranteed to have the keys whatever earlier save actually wrote, and a missing `numParts` should mean "default to 1 part," not a crash.

### The New Code

A small, real, throwaway dict, read three different ways - typed and run before returning to the real project code above:

**File:** `verification/phase-01/lab_dict_get.py` (new)

```python
config = {"machineId": 12, "programType": "mill"}

print(config.get("machineId"))
print(config.get("operatorName"))
print(config.get("operatorName", "unassigned"))
print("programType" in config)
print("mill" in config)

try:
    config["operatorName"]
except KeyError as e:
    print(f"KeyError: {e}")
```

### Mechanical Walkthrough

- `config = {"machineId": 12, "programType": "mill"}` — A real dict literal - two real key-value pairs, each key a string, each value a different real type (`int`, `str`) - a `dict` places no requirement that every value share one type.
- `config.get("machineId")` — `dict.get`, called with only the key - returns the real stored value, `12`, exactly as `config[\"machineId\"]` would, since this key genuinely exists.
- `config.get("operatorName")` — The key doesn't exist; `get`'s own default parameter wasn't given either, so it falls back to its own built-in default, `None` - no exception, just a real, plain `None` value returned in its place.
- `config.get("operatorName", "unassigned")` — The same missing key, this time with an explicit second argument - `get` returns that real default, `\"unassigned\"`, instead of `None`, since one was actually supplied.
- `"programType" in config` — `in`, applied to a dict, checks its real keys only - never its values - so this asks "is `\"programType\"` one of this dict's keys," which it is.
- `"mill" in config` — `\"mill\"` is a real value in this dict, stored under `\"programType\"` - but `in` only ever checks keys, so this is `False`, not `True`; a value can only be found this way by checking `\"mill\" in config.values()` instead, a different real method this lesson doesn't need.
- `config["operatorName"]` — Plain `[]` indexing, unlike `.get()`, has no default to fall back to - a missing key here raises a real `KeyError`, caught here to show its own real, plain message: the missing key itself, quoted.

### CS Lens

CPython (the real interpreter this lesson runs and verifies against every time) implements a dict as a real hash table: it stores each key-value pair at a position computed from the key's own hash, so a real lookup doesn't have to scan every entry - it computes where the key would be and checks only there. Python the language guarantees the *effect* (average-case near-constant-time lookup), not this exact internal structure - a different real implementation could achieve the same guarantee another way. Also recognized in: a database index built on a column so a lookup by that column doesn't scan every row, a filesystem directory entry mapping a real filename to the actual disk location holding its data, and a browser's own DNS cache mapping a real hostname to the IP address it already looked up.

### SE Lens

`.get()` versus `[]` is a real choice about what "missing" should mean at this exact call site - `[]` says "this key must be here, and its absence is a bug"; `.get()` (with or without an explicit default) says "this key is allowed to be absent, and here's what that absence means." Using `[]` for a key that's genuinely optional forces every caller to wrap it in a `try`/`except KeyError` just to handle a case that isn't actually exceptional - the real cost this backend avoids by choosing `.get()` for `numParts`, which is allowed to be missing, while still using plain `[]` elsewhere in the same function for keys the code has already guaranteed exist by that point (`pairing.id`, not a dict key at all, but the same real principle - required data accessed directly, optional data accessed defensively).

### Commands needed

- `python verification/phase-01/lab_dict_get.py` — Run from the manufacturing-platform repository root.

### Verification

```text
12
None
unassigned
True
False
KeyError: 'operatorName'
```

Full saved run: `verification/phase-01/lab_dict_get_output.txt`.

### Connection to the previous unit

There is no previous unit - this is the first one in this lesson.

## Concept Unit: Nested Data - Dicts of Dicts, Built One Level at a Time

### The Problem

A single flat dict can't represent "this tool assembly is used by several parts, each through several CAM files, each with several sequences" - that's several real levels of grouping, not one. This backend builds exactly that shape with plain, real dicts nested inside each other, checking at each level whether a key already exists before creating it.

Before reading on:

- If you're grouping a list of records by `"customer"`, and then by `"product"` within each customer, what real, concrete check do you need to make before you can safely do `by_customer[customer][product] += qty`, the very first time a given customer or product shows up?
- What would happen to that same line if the check for `by_customer[customer]` existing were skipped entirely, and this was the first record for a brand-new customer?

### Project Change

- **Reference Source:** `backend/app/routes/tool_assemblies.py:86-121`, real, already-existing code (the `get_tool_assembly_usage` route handler, `backend/app/routes/tool_assemblies.py:70`), read and quoted verbatim this session.
- **Files affected:** `verification/phase-01/lab_nested_group_by.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** None - Python's own built-in `dict` type only.

Rather than a small isolated tool, this unit's own lab reproduces the exact real shape of the project code below at minimal scale - a handful of fake records instead of real `Sequence` rows - before returning to the real, full version.

### The New Code

A small, real, two-level grouping lab, run before returning to the real project code that uses the identical shape at real scale:

**File:** `verification/phase-01/lab_nested_group_by.py` (new)

```python
records = [
    {"customer": "A", "product": "widget", "qty": 3},
    {"customer": "A", "product": "widget", "qty": 2},
    {"customer": "A", "product": "gadget", "qty": 1},
    {"customer": "B", "product": "widget", "qty": 5},
]

by_customer = {}
for r in records:
    if r["customer"] not in by_customer:
        by_customer[r["customer"]] = {}
    products = by_customer[r["customer"]]
    if r["product"] not in products:
        products[r["product"]] = 0
    products[r["product"]] += r["qty"]

print(by_customer)

group_a = by_customer["A"]
group_a["kit"] = 1
print(by_customer["A"] is group_a, by_customer["A"])

group_a = {"rebound": True}
print(by_customer["A"] is group_a, by_customer["A"])
```

### The Updated Project

The real project code this lab's shape reproduces - grouping real `Sequence` rows by real `part.id`, then by real `cam_file.id`, each level a dict, each leaf a growing real list:

**File:** `backend/app/routes/tool_assemblies.py (lines 86-113)` (already exists — read-only, nothing to type)

```python
parts_usage = {}
for seq in sequences:
    cam_file = seq.cam_file
    part = cam_file.part

    if part.id not in parts_usage:
        parts_usage[part.id] = {
            'part': part.to_dict(),
            'camFiles': {}
        }

    if cam_file.id not in parts_usage[part.id]['camFiles']:
        parts_usage[part.id]['camFiles'][cam_file.id] = {
            'camFile': cam_file.to_dict(include_sequences=False),
            'sequences': [],
            'operationsCount': 0
        }

    operations = Operation.query.filter_by(sequence_id=seq.id).all()

    parts_usage[part.id]['camFiles'][cam_file.id]['sequences'].append({
        'sequence': seq.to_dict(include_operations=False),
        'toolNumber': seq.tool_number,
        'operations': [op.to_dict() for op in operations]
    })
    parts_usage[part.id]['camFiles'][cam_file.id]['operationsCount'] += len(operations)
```

### Mechanical Walkthrough

- `if r["customer"] not in by_customer: by_customer[r["customer"]] = {}` — The outer level's own guard - `not in` (the same real membership check as the previous unit's `in`, negated) asks whether this customer has ever been seen before; only the first record for a given customer actually creates its entry, an empty dict ready to hold that customer's own products.
- `products = by_customer[r["customer"]]` — A real name bound to the same real dict object already stored inside `by_customer` - not a copy; changes made through `products` below are changes to that exact same object, visible through `by_customer[r[\"customer\"]]` too.
- `if r["product"] not in products: products[r["product"]] = 0` — The identical guard pattern, one level deeper - this customer's own product dict gets a fresh `0` entry the first time this exact product shows up for this exact customer, not the first time it shows up anywhere.
- `products[r["product"]] += r["qty"]` — Runs on every record, guard or not - by the time this line runs, the key is guaranteed to exist (either just created above, or already there from an earlier record), so plain `[]` indexing here is safe, not a `.get()` case.
- `if part.id not in parts_usage: parts_usage[part.id] = {'part': ..., 'camFiles': {}}` — The identical two-guard shape as the lab above, at the real project's own first level - keyed by a real `part.id` instead of a plain string, valued by a dict holding both a real key (`'part'`, a snapshot dict) and a nested dict (`'camFiles'`) for the next level down.
- `if cam_file.id not in parts_usage[part.id]['camFiles']: parts_usage[part.id]['camFiles'][cam_file.id] = {...}` — The same guard, one level deeper still, exactly mirroring the lab's `products` level - reached by indexing into the outer dict's own `'camFiles'` key, itself a dict, keyed this time by a real `cam_file.id`.
- `parts_usage[part.id]['camFiles'][cam_file.id]['sequences'].append({...})` — A third real level - `'sequences'` is a plain list, not a dict (nothing here needs deduplicating or looking up by key, only accumulating), so it's grown with `.append()`, a real list method, not another guarded dict assignment.
- `group_a = by_customer["A"]; group_a["kit"] = 1; print(by_customer["A"] is group_a, by_customer["A"])` — Makes the `products = by_customer[r[\"customer\"]]` aliasing above an explicit, isolated proof rather than something only asserted in prose: `group_a` isn't a copy of `by_customer[\"A\"]`, it IS `by_customer[\"A\"]` - `is` (real identity comparison, not equality) confirms they're the same real object - so mutating through `group_a` with `[\"kit\"] = 1` is visible through `by_customer[\"A\"]` too, with no separate step needed to "save it back."
- `group_a = {"rebound": True}; print(by_customer["A"] is group_a, by_customer["A"])` — The real contrast: this `=` doesn't mutate the dict `group_a` was pointing at - it rebinds the name `group_a` to point at a brand-new dict instead. `by_customer[\"A\"]` is untouched by this line (still holding `\"kit\": 1` from the mutation above), and `by_customer[\"A\"] is group_a` is now `False` - mutating an object and rebinding a name are two real, different operations, and only the first one is visible through every other name still pointing at the same object.

### Mental Model

```text
parts_usage = {
  part.id: {
    "part": {...},
    "camFiles": {
      cam_file.id: {
        "camFile": {...},
        "sequences": [ {...}, {...} ],   <- list, grown with .append()
        "operationsCount": 2
      }
    }
  }
}

Three real levels of nesting, two different real container
choices: dict where something needs to be found again by a real
id (part.id, cam_file.id), list where something only needs to be
collected in order (sequences).
```

### CS Lens

This is a tree, built incrementally, one leaf at a time, guarded at every level against overwriting a branch that already exists. Also recognized in: a filesystem's own directory tree, where a nested path is created one segment at a time, each segment checked for existence before being created; a compiler's own symbol table, nested per scope; and a JSON document itself, which is exactly this same real shape - dicts and lists nested inside each other - once it's parsed into Python values.

### SE Lens

This grouping is built with plain dicts and explicit `not in` guards, not a specialized structure - the real alternative, `collections.defaultdict`, would remove the guard lines entirely (`parts_usage[part.id]['camFiles'].setdefault(...)`-style construction) at the real cost of a reader needing to already know what `defaultdict` silently does on a missing key, since it's not spelled out at the call site the way an explicit `if ... not in` guard is. The real, current code accepts a few extra guard lines in exchange for every reader being able to see, in plain `dict` operations already fully explained in this lesson, exactly when each level actually gets created.
`part.to_dict()`, `cam_file.to_dict(include_sequences=False)`, `seq.to_dict(include_operations=False)`, and `op.to_dict()` are the real, exact boundary this unit's whole nested structure is built from: each one takes a real SQLAlchemy model object - itself already a real, typed mapping onto one real database row - and returns a plain dict, containing only the values this lesson's own constructs (dict, list) can hold. Nothing about a real database row forces it to become a nested Python dict shaped exactly this way; that shape is this code's own choice, made once, at this exact `.to_dict()` boundary, before `jsonify` (already used throughout this backend) turns the same nested dict into real JSON text for the response. A real database row, this in-memory Python structure, and the real JSON text a client eventually receives are three genuinely different representations of the same underlying data - not one thing wearing three names.

### Commands needed

- `python verification/phase-01/lab_nested_group_by.py` — Run from the manufacturing-platform repository root.

### Verification

```text
{'A': {'widget': 5, 'gadget': 1}, 'B': {'widget': 5}}
True {'widget': 5, 'gadget': 1, 'kit': 1}
False {'widget': 5, 'gadget': 1, 'kit': 1}
```

Full saved run: `verification/phase-01/lab_nested_group_by_output.txt`.

### Connection to the previous unit

The unit above read a single key that might be absent from one flat dict; this unit builds a dict whose own values are themselves dicts, several real levels deep, using that same absence check at every level to decide whether to create a new branch or grow an existing one.

## Concept Unit: Lists - Ordered, Growable Data, Built by Comprehension

### The Problem

Where the unit above needed to look values back up by a real id, generating this backend's own default sequence order just needs one plain, ordered, indexed collection - a real list, built in one expression from another real collection already in hand (`sequences`, a real SQLAlchemy query result), pairing each item with its own position.

Before reading on:

- Given a real list `sequences`, and needing both each sequence AND its own position within that list, what would you need `enumerate(sequences)` to actually hand you, on each pass through a loop, for a list comprehension to build `{'sequenceId': ..., 'order': idx}` for every one of them?
- What real, concrete list does `[n * n for n in range(10) if n % 2 == 0]` build - walk through which values of `n` actually reach the `n * n` part, and which get filtered out first?

### Project Change

- **Reference Source:** `backend/app/routes/operation_manager.py:121-128`, real, already-existing code inside `get_operation_order` (`backend/app/routes/operation_manager.py:68`), read and quoted verbatim this session.
- **Files affected:** `verification/phase-01/lab_list_comprehension.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** None - Python's own built-in `list` type and `enumerate`/`range` only.

When no custom order has ever been saved for a pairing, this route builds one on the fly from the real `sequences` already queried, ordered by their own real `sequence_number` - a real list of small dicts, each one just an id and a position, built in a single list comprehension rather than an empty list grown with repeated `.append()` calls in a loop.

### The New Code

Two small, real, throwaway list comprehensions, run before returning to the real project code that uses the same shape:

**File:** `verification/phase-01/lab_list_comprehension.py` (new)

```python
names = ["a", "b", "c"]
numbered = [{"index": idx, "name": name} for idx, name in enumerate(names)]
print(numbered)

evens_squared = [n * n for n in range(10) if n % 2 == 0]
print(evens_squared)
```

### The Updated Project

The real project code this lab's first line reproduces at minimal scale - building a real default order, one small dict per real `Sequence`, from `enumerate(sequences)`:

**File:** `backend/app/routes/operation_manager.py (lines 121-128)` (already exists — read-only, nothing to type)

```python
default_order = [
    {
        'id': str(uuid.uuid4()),
        'sequenceId': seq.id,
        'order': idx
    }
    for idx, seq in enumerate(sequences)
]
```

### Mechanical Walkthrough

- `numbered = [{"index": idx, "name": name} for idx, name in enumerate(names)]` — A list comprehension - the expression before `for` (`{\"index\": idx, \"name\": name}`, a real dict literal) is evaluated once per real item `enumerate(names)` yields, and each result is collected, in order, into one new real list; `enumerate` is walked in full in this lesson's fifth unit, below, since what it actually yields is itself a tuple.
- `evens_squared = [n * n for n in range(10) if n % 2 == 0]` — The same comprehension shape, with a real filter clause added - `if n % 2 == 0` runs before `n * n` for each candidate `n`; only a value that passes the filter ever reaches the expression that builds the result, so odd values of `n` never contribute anything to `evens_squared` at all.
- `default_order = [{'id': ..., 'sequenceId': seq.id, 'order': idx} for idx, seq in enumerate(sequences)]` — The identical real shape as this unit's own first lab line, at real project scale - `sequences`, a real list of `Sequence` model objects already queried and ordered, each paired with its own real position via `enumerate`, producing one small real dict per sequence, collected into one real list, `default_order`.

### CS Lens

A list comprehension builds a new collection as a single expression - iterate the real source, optionally filter, produce a result for each remaining item, collect those results - rather than a loop that manages its own accumulator by hand, one `.append()` call at a time. Also recognized in: a database `SELECT` statement with a `WHERE` clause (filter first, then project each remaining row into the selected columns), a spreadsheet's own column formula applied to every row at once, and a shell pipeline like `grep pattern | awk '{print $1}'` (filter, then transform).

### SE Lens

The real alternative not chosen here is an explicit loop with a pre-created empty list and repeated `.append()` calls - functionally identical, but it separates "what gets built" from "how it's accumulated" across several lines instead of keeping both in one expression. The real cost of the comprehension form: once the expression inside it needs more than a simple transformation and filter (real branching logic, a real side effect per item), it stops being more readable than the explicit loop it replaced, and this codebase's own choice elsewhere - the group-by loop in the unit above, which needs real conditional guards a comprehension can't cleanly express - shows exactly where that line actually falls in practice.

### Commands needed

- `python verification/phase-01/lab_list_comprehension.py` — Run from the manufacturing-platform repository root.

### Verification

```text
[{'index': 0, 'name': 'a'}, {'index': 1, 'name': 'b'}, {'index': 2, 'name': 'c'}]
[0, 4, 16, 36, 64]
```

Full saved run: `verification/phase-01/lab_list_comprehension_output.txt`.

### Connection to the previous unit

The unit above built nested dicts, guarded at every level because order and lookup-by-id both mattered; this unit builds a single flat list, in one expression, because only order matters here - no lookup, no deduplication, just each sequence paired with its own position.

## Concept Unit: Sets - Uniqueness, and Why Not Everything Can Go In One

### The Problem

This backend's own export summary needs to answer "which distinct tool numbers does this export actually use" - not how many times each one appears, not in what order, just which ones. A real list of tool numbers, one per sequence, can repeat the same tool number many times; a real set collapses that down to the distinct values alone.

Before reading on:

- Given a real list `["T01", "T02", "T01", "T05", "T02"]`, what real, concrete values would `set(...)` on that list contain - and would you be able to predict, just from the list's own order, what order those values print back in?
- A `set` can hold a string or an int, but what real, structural difference between a `list` and a string do you think stops a `set` from holding a `list` as one of its own members?

### Project Change

- **Reference Source:** `backend/app/routes/operation_manager.py:896-902`, real, already-existing code inside `_build_export_data` (`backend/app/routes/operation_manager.py:815`), read and quoted verbatim this session.
- **Files affected:** `verification/phase-01/lab_set_dedup.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** None - Python's own built-in `set` type only.

`export['summary']['uniqueTools']` is built from every sequence's own `toolNumber`, run through `set(...)` to drop repeats, then immediately wrapped back in `list(...)` - JSON, this data's real destination once `jsonify` sends it out, has no set type of its own, only arrays, so the real set only ever exists transiently, inside this one line.

### The New Code

A small, real, throwaway dedup - plus a real attempt to put an unhashable value into a set, to see what actually stops it:

**File:** `verification/phase-01/lab_set_dedup.py` (new)

```python
tool_numbers = ["T01", "T02", "T01", "T05", "T02"]
unique = set(tool_numbers)
print(unique)
print(list(unique))

try:
    bad = {["T01"]}
except TypeError as e:
    print(f"TypeError: {e}")
```

### The Updated Project

The real project line this lab's own `set(...)`/`list(...)` pair reproduces, inside the summary this route builds and returns:

**File:** `backend/app/routes/operation_manager.py (lines 896-902)` (already exists — read-only, nothing to type)

```python
total_operations = sum(len(seq.get('operations', [])) for seq in export['sequences'])
export['summary'] = {
    'totalSequences': len(export['sequences']),
    'totalOperations': total_operations,
    'uniqueTools': list(set(seq['toolNumber'] for seq in export['sequences'] if seq.get('toolNumber')))
}
```

### Mechanical Walkthrough

- `unique = set(tool_numbers)` — `set(...)`, called on a real list - reads every element, keeps exactly one copy of each distinct value, based on each value's own hash; `\"T01\"` appears twice in `tool_numbers` but only once in `unique`.
- `print(unique)` — Prints the real set directly. This lesson's own verification below actually runs this exact lab three separate times and shows all three real outputs side by side - the order never matches `tool_numbers`'s own original order, and it isn't even the same from one real run to the next. A set's iteration order is simply not part of its contract; code that depends on it is depending on something Python never promised.
- `print(list(unique))` — `list(...)`, called on the real set - produces a real list holding the same distinct values, in whatever order the set itself currently iterates in; needed here because this data's real destination (JSON, next) has no set type to serialize a set into directly.
- `bad = {["T01"]}` — A real set literal, attempting to hold one element: a list, `[\"T01\"]`. A list is mutable, so it isn't hashable - this raises a real `TypeError` before the set is ever built, not a silent failure or a set holding a broken entry.
- `total_operations = sum(len(seq.get('operations', [])) for seq in export['sequences'])` — A generator expression (the same comprehension shape as the previous unit's list comprehensions, but without the enclosing `[]`, so values are produced one at a time rather than collected into a list first), summed directly - each sequence's own `.get('operations', [])` defends against a sequence dict that happens not to have that key at all, the same real `.get()` default pattern from this lesson's first unit.
- `'uniqueTools': list(set(seq['toolNumber'] for seq in export['sequences'] if seq.get('toolNumber')))` — A generator expression, filtered (`if seq.get('toolNumber')` - only a sequence with a real, truthy tool number contributes one at all), fed straight into `set(...)` to drop repeats, then `list(...)` to make the result JSON-safe - the identical two-call pattern as this unit's own lab, at real project scale.

### CS Lens

A set is conceptually a hash-based collection, the same way a dict's own keys are - it uses each stored value's own hash to support fast real membership testing, minus any value stored alongside each key the way a dict has one; a dict answers "what value is stored under this key," a set only answers "is this value present at all." CPython (the real interpreter this lesson runs) implements both `dict` and `set` with real hash-table machinery internally - the same implementation fact this lesson's Dictionaries unit already named for `dict`, above. Also recognized in: a database `SELECT DISTINCT` query, a spam filter's own "seen this message hash before" check, and a compiler's own set of already-imported module names, checked before importing the same one twice.

### SE Lens

Converting straight back to `list(...)` the moment the set has done its one real job (deduplication) is a deliberate boundary: sets are the right tool for "does this collection contain duplicates," but the wrong shape for anything crossing into JSON, which only has arrays. The real cost of skipping that conversion - passing a raw set to `jsonify` - would be a real serialization failure at response time, not a subtle bug; this codebase pays for the conversion up front, in the same line, rather than risk it.

### Commands needed

- `python verification/phase-01/lab_set_dedup.py` — Run three separate times, from the manufacturing-platform repository root, specifically to check whether the printed set's own order stays the same across runs - each real run is its own fresh process, so nothing carries over between them.

### Verification

```text
=== run 1 ===
{'T02', 'T01', 'T05'}
['T02', 'T01', 'T05']
TypeError: unhashable type: 'list'

=== run 2 ===
{'T01', 'T02', 'T05'}
['T01', 'T02', 'T05']
TypeError: unhashable type: 'list'

=== run 3 ===
{'T05', 'T02', 'T01'}
['T05', 'T02', 'T01']
TypeError: unhashable type: 'list'
```

Full saved run: `verification/phase-01/lab_set_dedup_output.txt`.

### Connection to the previous unit

The unit above built a list by preserving every item's own position; this unit builds a set specifically because position (and even repetition) stopped mattering - only which distinct values are present at all.

## Concept Unit: Tuples and Immutability - the Fixed Pairs Already Hiding in This Lesson

### The Problem

Two constructs already used earlier in this exact lesson - `enumerate(sequences)` in the Lists unit, `parts_usage.items()` in the Nested Data unit - were both unpacked as `for idx, seq in ...` and `for part_id, data in ...` without ever naming what each one actually hands back on every pass. Both hand back a real tuple - the one construct in this lesson genuinely new, not yet isolated.

Before reading on:

- If `point = (3, 7)`, and tuples are immutable, what real, specific thing would you expect `point[0] = 99` to do - run silently, run and change `point`, or fail outright?
- Given that `dict.items()` and `enumerate()` were both already unpacked as `for a, b in ...` earlier in this lesson, without this lesson yet saying what type `a, b` actually come from - what would you guess that type is, and why would a *fixed*-size, two-element container be exactly the right shape for both?

### Project Change

- **Reference Source:** `backend/app/routes/tool_assemblies.py:116` (`for part_id, data in parts_usage.items():`) and `backend/app/routes/operation_manager.py:127` (`for idx, seq in enumerate(sequences)`), both real, already-existing lines already quoted in this lesson's earlier units, re-read here specifically for what each one's own loop variable pair actually is.
- **Files affected:** `verification/phase-01/lab_tuple_immutability.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** None - Python's own built-in `tuple` type, plus `dict.items()` and `enumerate()`, both already used earlier in this lesson.

Neither earlier unit needed to name the real type flowing through `for part_id, data in ...` or `for idx, seq in ...` to explain what those lines accomplished - only now, once tuples themselves are the real subject, does it matter that both are the exact same real construct: a two-element tuple, unpacked directly into two names in the `for` clause itself.

### The New Code

A small, real, throwaway tuple - unpacked, then mutated to see what actually stops it - followed by inspecting the real type `dict.items()` and `enumerate()` actually hand back:

**File:** `verification/phase-01/lab_tuple_immutability.py` (new)

```python
point = (3, 7)
x, y = point
print(x, y)

try:
    point[0] = 99
except TypeError as e:
    print(f"TypeError: {e}")

for k, v in {"a": 1, "b": 2}.items():
    print(type((k, v)), k, v)

for idx, val in enumerate(["x", "y"]):
    print(type((idx, val)), idx, val)
```

### The Updated Project

The two real lines from earlier in this lesson whose own loop variables are exactly this construct - re-shown here, unchanged, now that the tuple both are built from has a name:

**File:** `backend/app/routes/tool_assemblies.py (line 116)` (already exists — read-only, nothing to type)

```python
for part_id, data in parts_usage.items():
```

**File:** `backend/app/routes/operation_manager.py (line 127)` (already exists — read-only, nothing to type)

```python
for idx, seq in enumerate(sequences)
```

### Mechanical Walkthrough

- `point = (3, 7)` — A real tuple literal - two values, fixed at creation, no method exists on `tuple` to add, remove, or reassign an element afterward.
- `x, y = point` — Tuple unpacking - `point`'s own two real elements are bound to `x` and `y` in order, by real position, not by any key or name; this only works because `point` has exactly two elements to match exactly two names on the left.
- `point[0] = 99` — Real item assignment, the same syntax that works on a list - but `tuple` defines no way to change an existing element in place, so this raises a real `TypeError` rather than silently doing nothing or creating a new tuple.
- `for k, v in {"a": 1, "b": 2}.items(): print(type((k, v)), k, v)` — `dict.items()` yields one real tuple per key-value pair - `(\"a\", 1)`, then `(\"b\", 2)` - each immediately unpacked into `k, v` by the `for` clause itself, the identical unpacking shape as `x, y = point`, above; `type((k, v))` confirms each pair really is a `tuple`.
- `for idx, val in enumerate(["x", "y"]): print(type((idx, val)), idx, val)` — `enumerate(...)` yields one real tuple per element too - `(0, \"x\")`, then `(1, \"y\")` - the exact same real shape `dict.items()` yields, confirming `for idx, seq in enumerate(sequences)`, already used in this lesson's Lists unit, was unpacking a tuple the whole time.
- `for part_id, data in parts_usage.items():` — Now readable as exactly this unit's own second lab line, at real project scale - each real `(part_id, data)` tuple, yielded one per entry in `parts_usage` (a real dict already built by this lesson's Nested Data unit), unpacked directly into two real names.
- `for idx, seq in enumerate(sequences)` — Now readable as exactly this unit's own third lab line - each real `(idx, seq)` tuple, yielded one per element of `sequences`, unpacked the same way, already used to build `default_order` in this lesson's Lists unit.

### CS Lens

A tuple is a real, fixed-arity record - a value's own identity is partly its exact position, not just its presence, the same real idea as a database row's own fixed column order, a function's own fixed positional argument order, or a struct in a lower-level language, where a field's type and position are both part of its definition, not just its name.

### SE Lens

Immutability is what makes a tuple of hashable values itself hashable, usable as a dict key or set member. What this unit's own lab actually verified is narrower than that, though: `dict.items()` and `enumerate()` hand back tuples, not two-element lists - confirmed directly by `type((k, v))` and `type((idx, val))` above, not assumed. Why CPython's own designers chose a tuple for that shape is a separate, unverified question this lesson didn't run anything to prove - one real, plausible reason: a list, being mutable, could be changed by whoever receives it, while a tuple genuinely can't change underneath the caller. That's a design rationale worth naming, not a fact this lesson observed the way it observed the actual returned type. Immutability does have one real, honest cost this lesson's own Lists unit already demonstrates the other side of - a tuple can't be grown or shrunk in place the way `sequences` was grown there with `.append()`; choosing a tuple is a real commitment to "this is always exactly this many values, in this order," not a shape that accumulates.

### Commands needed

- `python verification/phase-01/lab_tuple_immutability.py` — Run from the manufacturing-platform repository root.

### Verification

```text
3 7
TypeError: 'tuple' object does not support item assignment
<class 'tuple'> a 1
<class 'tuple'> b 2
<class 'tuple'> 0 x
<class 'tuple'> 1 y
```

Full saved run: `verification/phase-01/lab_tuple_immutability_output.txt`.

### Connection to the previous unit

Every earlier unit in this lesson already unpacked a real tuple without naming it - this unit names the construct itself, and shows it was the one real thing dictionaries, lists, and sets all quietly depended on already: a dict's own `.items()`, and the position-tracking `enumerate()` this lesson's Lists unit already used, both hand results back this exact same fixed, immutable way.

## Connect the pieces

One real tool number, `"T01"`, moving through every construct this lesson built: it starts as a plain string value inside a `Sequence` row's own dict form; `.get('toolNumber')` (Dictionaries) reads it defensively, in case a sequence has none; it's collected, alongside every other sequence's own tool number, into a real list built by a generator expression (Lists' own comprehension shape, unfenced); that list is fed into `set(...)` (Sets) to drop any repeat of `"T01"` coming from a second sequence using the same tool; the result is cast back to `list(...)` because `export['summary']`, the real dict it's stored in, is headed for JSON next. Meanwhile, the exact same sequences, grouped instead of deduplicated, pass through `parts_usage`, a dict of dicts (Nested Data), each entry reached only after an `not in` guard confirms it's safe to create; and every one of those real entries, once built, is handed to calling code as a `(part_id, data)` tuple (Tuples) by `.items()` - verified, this lesson's own lab confirms, to be a tuple and not a two-element list, whatever CPython's own reason for that choice.

**Next lesson:** How to state, in the language itself, exactly what type a real function's parameters and return value are meant to be - and what a tool can check about that claim before the function is ever called.