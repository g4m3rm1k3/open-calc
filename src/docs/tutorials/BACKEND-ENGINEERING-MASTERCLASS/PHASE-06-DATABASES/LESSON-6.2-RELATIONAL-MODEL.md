# Lesson 6.2: Relational Model

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Three small, real, throwaway scripts naming the formal vocabulary a relational database is actually built on - relation, tuple, and attribute - directly against Python's own `set`, `tuple`, and `collections.namedtuple`, then a fourth contrast showing exactly where that formal model and the informal "table/row/column" language this project's own code actually uses part ways: a pure relation forbids a duplicate tuple and has no defined order, while a real SQL-shaped table allows a genuinely duplicate row, in a fixed position. Every lab is shaped directly after this project's own real, already-declared `Machine` columns in `backend/app/models/machine.py`.

**What you need to know first:** Plain dict and list literals; that a Python `set` cannot hold two equal elements and a Python `list` can; calling a function and reading its return value; f-strings; that this project's own real backend already stores machines as rows with named columns (`id`, `name`, `category`, and others).

## Terms used in this lesson

- **relation** — The formal, mathematical name - from the branch of set theory a relational database is literally built on - for what everyday SQL language calls a table: a named collection of tuples that all share the same declared attributes. It exists as a distinct word from "table" because the relational model itself, as originally defined, is a mathematical structure - a genuine set of tuples - and "table" is the informal, practical word SQL itself uses for the same idea, with (as this lesson's own rows-and-columns unit shows) a few real differences between the two.
- **tuple (relational sense)** — One single, complete member of a relation - one real fact, made up of exactly one value for each of the relation's declared attributes, taken together as a single unit. It exists as the relational model's own name for "one row's worth of data" because, formally, a relation is defined as a SET of these - which is exactly why two relational tuples with identical values are considered the same tuple, not two different ones (this lesson's own Relations unit demonstrates this directly). This is not a coincidence of naming: Python's own built-in `tuple` type - an ordered, fixed set of values - is a real, practical stand-in for exactly this idea, which is why this lesson's own labs use real Python tuples to model it.
- **attribute** — One named, single-valued property every tuple in a relation has - the formal name for what a declared column actually is: a name (like `category`) paired with a domain, the set of values it is allowed to hold (like a maximum-length string). It exists as a distinct idea from a tuple's raw position (its first value, its second value, ...) because a real relation's own columns are identified by NAME, not by position - `backend/app/models/machine.py`'s own real `category` column is always reached by that name, never by "the third value in the row."
- **row** — The everyday, practical word - used throughout real SQL, this project's own code, and ordinary conversation about databases - for exactly what the relational model formally calls a tuple: one single record's worth of data. It exists alongside the formal term because SQL itself, and the people who write it, overwhelmingly say "row," not "tuple," in practice - this lesson's own rows-and-columns unit is specifically about where that everyday word and the formal model it stands in for actually agree, and where they do not.
- **column** — The everyday, practical word for exactly what the relational model formally calls an attribute: one named, single-valued property every row shares. It exists for the identical reason "row" does - it is the word real SQL, and this project's own real code (its `db.Column` declarations), actually uses, even though "attribute" is the formally precise term for the same idea.

## Objects and methods used

- **`set (builtin)`**
  - *What it is:* Python's built-in collection type representing an unordered collection of distinct elements - no two elements it holds are ever equal to each other.
  - *Implementation:* A `{...}` literal (or `set(...)`) builds a `set`; adding a value already equal to one already present changes nothing - the set's own length never grows from that add. Iterating over a `set` visits its elements in an order Python itself does not guarantee stays the same from one run to the next.
  - *Its use:* This lesson's Relations unit uses a `set` of real Python tuples as the direct, literal, runnable stand-in for a mathematical relation - specifically because a `set`'s own real behavior (rejecting a duplicate) is the identical real behavior the relational model's own definition of a relation requires.
  - *Type:* A builtin collection type, constructed here with `{...}` literal syntax.
  - *Responsibility:* Holding a collection of values with the real, enforced guarantee that no two of them are ever equal - never a count of how many times something was added, only whether it is present at all.
  - *Depends on:* Every element placed in it must be hashable - true of the string tuples this lesson's own labs use, since strings and tuples of strings are both hashable.
  - *Connects to:* Built directly from a literal of real Python tuples in this lesson's Relations unit, and contrasted directly against a `list` of the identical tuples in the rows-and-columns unit.
  - *Shape:* Built from any number of hashable values; produces a collection whose own length can be read with `len()`, always less than or equal to how many values were actually written into the literal.

- **`tuple (Python builtin type)`**
  - *What it is:* Python's built-in, immutable, ordered sequence type, written as `(value1, value2, ...)`.
  - *Implementation:* Once constructed, a `tuple`'s own contents cannot be changed - no item can be reassigned, added, or removed. Two tuples compare equal with `==` exactly when they are the same length and every corresponding position holds equal values - this is what makes a tuple usable as a `set`'s own element at all, and is the real, concrete reason this lesson's own Relations unit's attempted duplicate is recognized as a duplicate.
  - *Its use:* This lesson's own labs use real Python tuples as the direct, literal representation of one relational tuple - one machine's `id`, `name`, and `category`, taken together as a single, immutable unit, exactly the way one real row's values belong together.
  - *Type:* A builtin, immutable sequence type.
  - *Responsibility:* Holding a fixed, ordered group of values together as one single value, comparable as a whole for equality with another tuple of the same shape.
  - *Depends on:* Nothing beyond the values placed inside it at construction.
  - *Connects to:* Constructed directly inside this lesson's own `set` and `list` literals; also produced, with named positions, by `collections.namedtuple`, described next.
  - *Shape:* Built from any number of values in a fixed order; supports positional access (`t[0]`) and whole-tuple equality comparison (`==`); never supports assigning to a position after construction.

- **`collections.namedtuple`**
  - *What it is:* A function in Python's standard `collections` module that builds a brand-new tuple subclass whose positions can also be accessed by a real, given name, in addition to plain position.
  - *Implementation:* `namedtuple("TypeName", ["field1", "field2", ...])` returns a new class; calling that class, e.g. `MachineRow(id=..., name=..., category=...)`, constructs an actual instance - still a real `tuple` underneath (`t[0]` still works, exactly as it would for any tuple), but now also readable as `t.id`, `t.name`, `t.category`.
  - *Its use:* This lesson's own Attributes unit uses it as the real, direct demonstration of what an attribute actually adds on top of a bare tuple's position: a genuine name for each slot, checked and usable at runtime, not just a comment a reader has to remember.
  - *Type:* A builtin standard-library function, called once to build a new class, then called again to construct real instances of it.
  - *Responsibility:* Producing a tuple type whose positions are also reachable by name, so a caller reading `m1.category` never has to remember or count which bare position `category` happens to occupy.
  - *Depends on:* A type name string, and a list of field name strings, one per position.
  - *Connects to:* Called once in this lesson's own Attributes unit to build `MachineRow`, then constructed once more to build the real instance, `m1`, that unit's own verification reads both by position and by name.
  - *Shape:* `namedtuple(...)` takes a name and a list of field names, returns a new class; calling that class with matching keyword arguments returns one instance supporting both positional (`t[0]`) and named (`t.field1`) access to the identical underlying values.

- **`len`**
  - *What it is:* A built-in Python function returning how many items a collection currently holds.
  - *Implementation:* `len(collection)` - for a `set`, the number of distinct elements it holds; for a `list`, the number of elements it holds, counting a genuine duplicate as its own separate element.
  - *Its use:* Every lab in this lesson calls this to put a real, checkable number on exactly how many tuples a relation (or its looser, real-world `list`-shaped counterpart) actually ended up holding, rather than asking a reader to count a printed list by eye.
  - *Type:* A builtin function.
  - *Responsibility:* Answering "how many" for any collection that defines it, without the caller manually counting.
  - *Depends on:* Any collection supporting Python's own length protocol - here, `set`, `tuple`, and `list`.
  - *Connects to:* Called on the `set` literal in the Relations unit, and on both the `set` and the `list` in the rows-and-columns unit, to make their real difference in count directly visible.
  - *Shape:* Takes one collection in, returns a single non-negative integer out.

## Concept Unit: Relations and Tuples - A Named Set of Same-Shaped Facts

### The Problem

`backend/app/models/machine.py`'s real `Machine` class declares `id`, `name`, and `category` (among others) as real columns every machine row has. Formally, in the relational model this whole curriculum is now building toward, that collection of same-shaped rows has a real, precise mathematical name: a relation, defined as a SET of tuples. If that definition is taken literally - a real set, not just a casual collection - what should happen if the exact same tuple is written into it twice?

Before reading on:

- A mathematical set, by definition, cannot contain the same member twice. If a relation really is a set of tuples, what should happen if the identical tuple - the same `id`, `name`, and `category` - is added to it a second time?
- Python's own built-in `set` already enforces exactly that rule for anything placed inside it. Before running the lab below: given three tuples written into a `{...}` literal, two of which are completely identical, how many does `len(...)` report?

### Project Change

- **Reference Source:** Real, verbatim, read this session, `backend/app/models/machine.py:49-51`: ``` id = db.Column(db.String(50), primary_key=True) name = db.Column(db.String(100), nullable=False) category = db.Column(db.String(50), nullable=False)  # mill, lathe, swiss, wire_edm, mill_turn, grinder, other ``` This is the real, already-declared shape - `id`, `name`, `category` - this unit's own lab tuples are built to match. The lab itself uses a plain Python `set` of `tuple`s, not this project's own real SQLAlchemy models, since the relational model's own formal definition (a set of tuples) is this unit's subject, not this project's real ORM.
- **Files affected:** `verification/phase-06/lab_relations_tuples.py` (new)
- **Change type:** add
- **Location:** N/A - a new, standalone throwaway script; no existing project structure to place it within.
- **Dependencies:** None beyond plain Python.

### The New Code

A relation, modeled directly as a real Python `set` of real Python `tuple`s, shaped after `Machine`'s own real `id`/`name`/`category` columns, with one tuple written in twice on purpose:

**File:** `verification/phase-06/lab_relations_tuples.py` (new)

```python
machines = {
    ("m1", "Haas VF-2", "mill"),
    ("m2", "Okuma Genos", "lathe"),
    ("m1", "Haas VF-2", "mill"),  # an attempted duplicate of the very first tuple
}

print(f"machines relation contains {len(machines)} tuple(s), not 3")
for row in machines:
    print(row)
```

### Mechanical Walkthrough

- `("m1", "Haas VF-2", "mill")` — A real Python `tuple` literal - three values, `id`, `name`, `category` in that fixed order, matching `Machine`'s own real column order - built and thrown away as soon as the literal `set` around it finishes constructing.
- `{ ... } (the set literal)` — Builds a real `set`, fully treated in this lesson's own Header. Because the third tuple written here is equal, value for value, to the first, the set's own real equality-based membership rule means it is never actually added a second time - not filtered out afterward, but never distinct from the first tuple to begin with.
- `len(machines)` — `len`, fully treated in this lesson's own Header, called on the finished `set`. It reports `2`, not `3` - the real, observable proof that the relational model's own "a relation is a SET of tuples" is not just a phrase, but a concrete rule this lab's own Python `set` actually enforces.
- `for row in machines: print(row)` — A basic-Python `for` loop over the finished set, printing each surviving tuple. Which physical order they print in is not guaranteed by Python's own `set` and is not the point of this unit - only that there are two of them, not three.

### CS Lens

This is the **relational model's** own founding idea: a relation is formally a set - not a list, not a bag - of tuples, which is exactly why a relation, by definition, cannot contain two identical rows. Also recognized in: a mathematical set's own basic definition, unrelated to databases at all, where `{1, 2, 2}` is simply `{1, 2}`; a `UNIQUE` constraint in a real SQL schema, enforcing at the database level the same "no two identical" rule this lab's own Python `set` enforces for free; and, in this project's own domain, a real machine's own unique `id` column existing specifically so two machine records are never accidentally treated as "the same machine" only because every other field happens to match.

### SE Lens

The design principle is defining "the same data twice" out of existence at the model level, rather than relying on every caller to separately check for duplicates by hand. The real alternative NOT chosen in this lab - a plain Python `list` instead of a `set` - is shown directly in this lesson's own later rows-and-columns unit, where a list happily keeps a genuine duplicate; a `list` is simpler to reason about (values stay in the order they were written) but never enforces uniqueness on its own. The honest cost on the set's own side: because a `set` never guarantees the order its elements print or iterate in, choosing it trades away a real, useful property (a fixed, predictable order) to gain the uniqueness guarantee this unit is actually about.

### Commands needed

- `python verification/phase-06/lab_relations_tuples.py` — Runs the lab from the manufacturing-platform repository root; no flags needed.

### Verification

```text
machines relation contains 2 tuple(s), not 3
('m1', 'Haas VF-2', 'mill')
('m2', 'Okuma Genos', 'lathe')
```

Full saved run: `verification/phase-06/lab_relations_tuples_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it establishes the running distinction, a formal relation (a set of tuples) versus a plain list of values, that the rest of this lesson's own vocabulary builds on.

## Concept Unit: Attributes - Giving Each Position in a Tuple a Real Name

### The Problem

The previous unit's own tuples - `("m1", "Haas VF-2", "mill")` - only mean `id`, `name`, `category` because a reader was TOLD that order, in prose, alongside the code. `backend/app/models/machine.py`'s own real `Machine` class never makes a caller remember that a machine's category is "the third value" - it is reached by the real name `category`, always. What is actually missing from a bare tuple that a real relation's declared attributes provide?

Before reading on:

- Given only `("m1", "Haas VF-2", "mill")` with no other context, is there anything in the tuple itself that says its second position is a name and its third is a category - or is that knowledge only ever held by whoever wrote the surrounding code?
- `backend/app/models/machine.py`'s own real `category` column is never reached as "the third field" anywhere in this project's code. What would have to be added to a bare tuple to make that same thing true of it?

### Project Change

- **Reference Source:** Real, verbatim, read this session, `backend/app/models/machine.py:51-52`: ``` category = db.Column(db.String(50), nullable=False)  # mill, lathe, swiss, wire_edm, mill_turn, grinder, other sub_type = db.Column(db.String(50), nullable=False)  # 3_axis, 4_axis, 5_axis, single_turret, etc. ``` Real, already-existing evidence that this project's own columns are always named, never referenced by bare position anywhere in its real code. The lab below builds the identical real capability - reaching a value by name, not position - directly with Python's own `collections.namedtuple`.
- **Files affected:** `verification/phase-06/lab_attributes.py` (new)
- **Change type:** add
- **Location:** N/A - a new, standalone throwaway script; no existing project structure to place it within.
- **Dependencies:** None beyond Python's own standard library (`collections`).

### The New Code

The same three-position shape as the previous unit's own tuples, now given real, declared attribute names:

**File:** `verification/phase-06/lab_attributes.py` (new)

```python
from collections import namedtuple

MachineRow = namedtuple("MachineRow", ["id", "name", "category"])

m1 = MachineRow(id="m1", name="Haas VF-2", category="mill")

print(f"by position alone: {m1[0]}, {m1[1]}, {m1[2]}")
print(f"by real attribute name: {m1.id}, {m1.name}, {m1.category}")
```

### Mechanical Walkthrough

- `namedtuple("MachineRow", ["id", "name", "category"])` — Fully treated in this lesson's own Header. This single call builds a brand-new class, `MachineRow`, whose three positions are now permanently associated with the real names `id`, `name`, and `category` - the direct, concrete analog of declaring a relation's own attributes.
- `MachineRow(id="m1", name="Haas VF-2", category="mill")` — Constructs one real instance using keyword arguments matched against the field names just declared - the same real values as the previous unit's own bare tuple, now attached to real names instead of bare position.
- `m1[0], m1[1], m1[2]` — Plain positional indexing (basic Python), still valid - `MachineRow` is still a real `tuple` underneath, fully treated in this lesson's own Header, and nothing about naming its fields removes that.
- `m1.id, m1.name, m1.category` — Attribute access by the real names declared in the `namedtuple(...)` call - this is the concrete capability this whole unit exists to demonstrate: the identical underlying values, now reachable without either the reader or the code needing to remember or count bare positions.

### CS Lens

This is the relational model's own idea of an **attribute**: a named, single-valued property, distinct from a bare positional slot. Also recognized in: a C `struct`'s own named fields, versus addressing raw memory offsets by hand; a JSON object's own named keys, versus a bare JSON array where meaning depends entirely on position; a function call's own keyword arguments, versus remembering a long parameter list's exact order; and, in this project's own domain, `Machine.to_dict()`'s own real, named output keys (`'category'`, `'subType'`, ...), never a bare, unlabeled list of values a frontend would have to interpret by position alone.

### SE Lens

The design principle is naming meaning explicitly, so it lives in the data's own declared structure rather than only in a reader's memory of an unstated convention. The real alternative NOT chosen here - the previous unit's own bare tuples - costs nothing extra to write, but every single place that tuple is later used has to independently already know, and correctly remember, what each bare position means; get that order wrong even once, and nothing in a bare tuple itself would ever catch it. The honest cost on the named side: declaring `namedtuple`'s own field list (or a real relation's own column list) is real, upfront work that a bare tuple never demands at all.

### Commands needed

- `python verification/phase-06/lab_attributes.py` — Runs the lab from the repository root; no flags needed.

### Verification

```text
by position alone: m1, Haas VF-2, mill
by real attribute name: m1, Haas VF-2, mill
```

Full saved run: `verification/phase-06/lab_attributes_output.txt`.

### Connection to the previous unit

The previous unit showed a relation as a set of tuples; this unit shows what makes each of those tuples actually usable in practice - a real name for every position, not just an agreed-upon order.

## Concept Unit: Rows and Columns - The Same Idea, a Looser Real-World Version

### The Problem

Nothing in `backend/app/models/machine.py`'s own real code, or in ordinary SQL, ever says "tuple" or "attribute" - it says "row" and "column," everywhere, always. Given everything the previous two units just proved about what a relation and a tuple formally ARE - a set, forbidding duplicates - does a real SQL-shaped table actually behave the identical way, or does the everyday vocabulary hide a real difference?

Before reading on:

- The Relations unit's own `set` refused to hold the same tuple twice. If two real, separate rows were inserted into an actual SQL table with the exact same values in every column, would a real SQL table refuse the second one the identical way a `set` did - or does "row" turn out to mean something a little looser than "tuple" actually is?
- A `set`'s own iteration order is not guaranteed. Does a real SQL table's own rows have a similarly undefined order, or a real, fixed one?

### Project Change

- **Reference Source:** Real, verbatim, read this session, `backend/config.py:23-26`, already cited in this curriculum's own Lesson 6.1: this project's real database is a real SQLite file, `manufacturing.db` - an actual SQL table, not a mathematical set. No reference counterpart is cited from this project's own real schema for the specific contrast this unit teaches (duplicate rows, positional order), since demonstrating it for real would require SQL itself, a later lesson's own subject - the lab below demonstrates the underlying distinction directly instead, in plain Python, with a `set` standing in for a pure relation and a `list` standing in for a real SQL-shaped table.
- **Files affected:** `verification/phase-06/lab_rows_columns.py` (new)
- **Change type:** add
- **Location:** N/A - a new, standalone throwaway script; no existing project structure to place it within.
- **Dependencies:** None beyond plain Python.

### The New Code

The identical two real tuples as before, held two different ways - once as a `set` (a pure relation), once as a `list` (the looser, real-world shape SQL's own tables actually have) - with the very same row repeated in the list on purpose:

**File:** `verification/phase-06/lab_rows_columns.py` (new)

```python
relation = {("m1", "mill"), ("m2", "lathe")}

table = [("m1", "mill"), ("m2", "lathe"), ("m1", "mill")]  # the same row, twice, on purpose

print(f"pure relation (a set): {len(relation)} tuple(s) - the duplicate never actually got in")
print(f"real SQL-shaped table (a list): {len(table)} row(s) - the duplicate is really there, twice, in a fixed order")
print(f"table[0] == table[2]: {table[0] == table[2]!r} - two genuinely separate rows, identical values, both real")
```

### Mechanical Walkthrough

- `relation = {("m1", "mill"), ("m2", "lathe")}` — The identical `set`-of-tuples construct from this lesson's own Relations unit, this time deliberately built with no attempted duplicate at all, since this unit's own point is the CONTRAST with what comes next, not another duplicate- rejection demonstration.
- `table = [("m1", "mill"), ("m2", "lathe"), ("m1", "mill")]` — A plain Python `list` (basic Python) holding the same `("m1", "mill")` tuple twice. Unlike the `set` above, a `list` has no rule against equal elements at all - both copies are genuinely, separately present, and, unlike a `set`, a `list`'s own order is exactly the order its values were written in, guaranteed, every time.
- `len(relation) vs len(table)` — `len`, fully treated in this lesson's own Header, called on each collection. `len(relation)` reports `2`; `len(table)` reports `3` - the same real difference the Relations unit's own set already demonstrated, now placed directly beside the real, everyday "table" shape SQL actually uses, which permits exactly what a pure relation forbids.
- `table[0] == table[2]` — Real tuple equality comparison, fully treated in this lesson's own Header, confirming the two "duplicate" entries genuinely hold equal values - not merely two DIFFERENT rows that happen to look similar in the printed output, but two positions in the list that compare exactly equal.

### CS Lens

This is the real, documented distinction between a mathematical **set** and a **bag** (or multiset): a set forbids duplicate membership and defines no order; a bag allows a value to appear more than once and, as a real list, can also fix a genuine order. Also recognized in: a real SQL `SELECT` returning duplicate rows whenever no `DISTINCT` or `UNIQUE` constraint says otherwise - exactly the everyday, practical fact this unit's own `list`-versus-`set` contrast stands in for; a shopping cart, which is a bag (two identical items are two real, separate items, not one), unlike a set of unique product IDs; and a music playlist, whose own fixed track order matters in a way an unordered mathematical set's membership never does.

### SE Lens

The design principle at stake is that a real SQL table prioritizes practical, everyday recordkeeping over strict fidelity to the relational model's own purest mathematical form. This lesson does not verify SQL's own historical design intent - only the real, observable behavior itself, demonstrated directly by this unit's own `list`-versus-`set` contrast: a real table permits exactly what a pure relation forbids. One plausible reason for that choice, not itself verified here: an ordinary ledger genuinely needs to represent two separately real, identical-looking entries (two separate orders for the same part, on the same day), which enforcing strict set semantics - no duplicates, no defined order - on every table by default would make impossible to record at all. The honest cost of the looser, real version this project's own database actually uses: nothing stops an accidental, unwanted genuine duplicate row from existing, unless something - a real `UNIQUE` constraint - is deliberately added to forbid it, the same way this lesson's own `set` forbids it for free.

### Commands needed

- `python verification/phase-06/lab_rows_columns.py` — Runs the lab from the repository root; no flags needed.

### Verification

```text
pure relation (a set): 2 tuple(s) - the duplicate never actually got in
real SQL-shaped table (a list): 3 row(s) - the duplicate is really there, twice, in a fixed order
table[0] == table[2]: True - two genuinely separate rows, identical values, both real
```

Full saved run: `verification/phase-06/lab_rows_columns_output.txt`.

### Connection to the previous unit

The previous two units built the formal vocabulary - relation, tuple, attribute - from the ground up; this unit connects it, honestly, to the looser "row" and "column" language this project's own real code actually uses every day, and names exactly where the two stop meaning quite the same thing.

## Connect the pieces

Follow one real machine's row - `("m1", "Haas VF-2", "mill")` - through every unit. As a member of the Relations unit's own real Python `set`, writing it in a second time changes nothing at all - `len()` still reports `2`, the concrete proof that a relation, formally, is a set of tuples, and a set cannot hold the same member twice. Given real, declared attribute names instead of bare position - `id`, `name`, `category`, exactly matching `backend/app/models/machine.py`'s own real columns - that same data becomes reachable as `m1.category`, not "the third value," which is the entire point of an attribute existing at all. And placed instead into a plain `list`, standing in for the real, everyday SQL table this project's own database actually is, the identical tuple written in twice is NOT rejected - `len()` now reports `3`, both copies genuinely present, in a real, fixed order a `set` never promised - proving that "row" and "tuple" are the same idea in theory, but not quite the same guarantee in the real, practical databases this curriculum is about to start building with.

**Next lesson:** Next, one specific attribute every relation needs - the one that makes each of its rows individually, reliably identifiable - gets named and studied on its own: what makes a real primary key actually work, and the different real strategies this project's own schema already mixes for choosing one.