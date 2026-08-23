# Lesson 9: Holding Many Values at Once

**What you will build:** Standalone Dart snippets working with three real
`dart:core` collection classes — `List`, `Set`, and `Map` — that add to
them, read from them, walk them, search them, sort them, and transform
them into new collections. None of this joins a real project yet. This
lesson also pays off a promise Lessons 7 and 8 both deferred: a list
literal (`[1, 2, 3]`) has already appeared twice, narrowly, as "something
to iterate over," with `List`'s own real declared shape explicitly put off
until now.

**What you need to know first:** Lesson 7's `for-in` loop (reused here to
walk a `Map`'s own keys and entries) and its narrowly-introduced list
literal. Lesson 6's `bool` (`Set.add`'s and `.contains`'s own return
type) and its own CS lens naming **lazy evaluation** in passing, which
this lesson's final unit proves directly, in full, for the first time.
Lesson 8's functions and parameters, reused narrowly (with a genuinely new
piece of syntax flagged and deferred, same as this lesson's own `List`
was) to pass a small piece of logic into two of `Iterable`'s own methods.

**Terms used in this lesson:**

- **List literal (`[element, element, ...]`)** — reappearing from Lesson
  7, restated in full: a fixed sequence of values written directly into
  source code between square brackets. Lesson 7 used this narrowly,
  deferring `List`'s own real shape to here; this lesson's Concept Unit 1
  delivers that full treatment.
- **Declaration** — reappearing from Lesson 5, restated in full: the
  statement introducing a variable for the first time, with a type
  (explicit or inferred) and a name.
- **Method** — a function (Lesson 8's term, reappearing) called *on* a
  specific object, using `object.methodName(...)` syntax, rather than
  called by its bare name alone the way every function through Lesson 8
  was. This lesson's `.add`, `.sort`, `.contains`, `.map`, and `.where` are
  this curriculum's first real methods — narrowly, this lesson only needs
  "a method is a function reached through an object it belongs to,
  rather than called by name alone"; what specifically makes a function a
  method — a class defining it, an object it acts on — gets full, formal
  treatment starting in Lesson 11 (Classes and objects).
- **Set literal (`{element, element, ...}` or `<Type>{}`)** — a sequence of
  *unique* values written directly into source code between curly braces.
  Dart requires an explicit type annotation (`<int>{}`) or at least one
  element for an *empty* Set literal, because a bare `{}` with no other
  clue defaults to a `Map` literal instead (below) — the same curly-brace
  syntax is genuinely ambiguous between the two without one.
- **Map literal (`{key: value, key: value, ...}` or `<KeyType,
  ValueType>{}`)** — a sequence of key/value pairs written directly into
  source code between curly braces, each pair separated by `:`. It exists
  for writing a fixed lookup table directly into code, the same role a
  list literal plays for a fixed sequence.
- **Generic type parameter (`<E>`, `<K, V>`)** — a type written inside
  angle brackets directly after a class name, fixing *what specific type*
  a general-purpose class like `List` or `Map` actually holds this time —
  `List<int>` and `List<String>` are the same class, `List`, specialized
  two different ways. This lesson uses this narrowly, only enough to read
  `List<E>`'s and `Map<K, V>`'s own real declarations and to write
  `<int>[]`/`<String, int>{}`; what a generic class actually *is*, and how
  to declare your own, gets full, formal treatment in Lesson 10 (Dart's
  Type System).
- **Index operator (`[index]`)** — reading a value out of a `List` by its
  numeric position, starting at `0` for the first element. It exists as
  the most direct way to reach one specific element of an ordered
  collection, given only its position.
- **Index assignment (`[key] = value`)** — storing a value into a `Map`
  under a specific key, creating that key if it doesn't already exist or
  overwriting its value if it does. It exists as the most direct way to
  add to or update a lookup table, mirroring the index operator's own
  bracket syntax but for a key rather than a position.
- **Lazy evaluation** — reappearing from Lesson 6, restated in full: doing
  computational work only once it's actually needed, rather than eagerly,
  ahead of time. Lesson 6 named this in passing as the general idea behind
  short-circuit evaluation; this lesson's final Concept Unit proves it
  directly, for the first time, for `Iterable`'s own `.map()` and
  `.where()`.
- **Anonymous function (lambda expression)** — a function (Lesson 8's
  term, reappearing) with no name of its own, written directly at the
  place it's needed, most often to hand as a value into another function.
  This lesson uses this narrowly, only enough to pass a small piece of
  logic into `.map()`/`.where()`; treating a function itself as a value
  that can be passed around, stored, or returned — the general idea this
  syntax is one instance of — gets full, formal treatment in Lesson 15
  (Functional Thinking).
- **Arrow syntax (`=>`)** — a compact way to write a function (here, an
  anonymous one) whose entire body is one expression: `(x) => x * x` means
  "given `x`, immediately produce `x * x`," equivalent to a full block body
  of `{ return x * x; }`, without needing the braces or the `return`
  keyword at all for this specific, common shape.

**Objects and methods used:**

- **`List`**
  - *What it is:* a real, generic `dart:core` class — an ordered,
    indexable sequence of values, all of the same declared type.
  - *Implementation:* `abstract interface class List<E> implements
    Iterable<E>, _ListIterable<E>` (verified this session from the real
    Dart SDK source), whose own doc comment describes it as "an indexable
    collection of objects with a length." Relevant real member
    signatures, also verified this session: `void add(E value)`; `int get
    length`; `E operator [](int index)`; `void sort([int compare(E a, E
    b)?])`.
  - *Its use:* Concept Unit 1 stores a small, growing sequence of Sudoku-
    style digit values in one.
  - *Type:* an abstract, generic interface class.
  - *Responsibility:* hold an ordered sequence of values of one declared
    type, letting them be added, read by position, counted, and reordered.
  - *Depends on:* a type argument (`E`) fixing what it holds this time,
    and, for `add`, a value of that exact type.
  - *Connects to:* built from a list literal; grown by `add`; read by the
    index operator and `.length`; reordered in place by `.sort()`; walked
    by Lesson 7's `for-in`.
  - *Shape:* `dart:core`'s public standard-library surface — this
    lesson's first fully-treated example of a *generic* class.
- **`Set`**
  - *What it is:* a real, generic `dart:core` class — an unordered
    collection guaranteeing every value it holds is unique.
  - *Implementation:* `abstract interface class Set<E> implements
    Iterable<E>, _SetIterable<E>` (verified this session), doc comment: "a
    collection of objects in which each object can occur only once."
    Relevant real signatures: `bool add(E value)` — note, returning
    `bool`, genuinely different from `List.add`'s `void` — and `bool
    contains(Object? value)`.
  - *Its use:* Concept Unit 2 proves, for real, that adding the same value
    twice only actually adds it once.
  - *Type:* an abstract, generic interface class.
  - *Responsibility:* hold a collection of values of one declared type,
    while actively rejecting any value already present, reporting back
    (via `add`'s own `bool` result) whether a given value was genuinely
    new.
  - *Depends on:* a type argument, and, for `add`, a value of that type.
  - *Connects to:* built from a set literal; grown (or not, if already
    present) by `add`; checked by `contains`.
  - *Shape:* `dart:core` standard-library surface, sibling to `List` under
    the shared `Iterable` interface below.
- **`Map`**
  - *What it is:* a real, generic `dart:core` class — a collection of
    key/value pairs, retrieving a value by its associated key rather than
    by numeric position.
  - *Implementation:* `abstract interface class Map<K, V>` (verified this
    session), doc comment: "a collection of key/value pairs, from which
    you retrieve a value using its associated key." Relevant real
    signatures: `Iterable<K> get keys`; `Iterable<V> get values`;
    `Iterable<MapEntry<K, V>> get entries`; `V? operator [](Object? key)` —
    note the `?`, meaning this can genuinely return `null` (Lesson 5's
    term) rather than throwing, when a key is missing.
  - *Its use:* Concept Unit 3 stores a Sudoku cell's own row and column
    under named keys, and proves for real that a missing key returns
    `null` rather than crashing.
  - *Type:* an abstract, generic interface class with *two* type
    parameters (`K` for its keys' type, `V` for its values' type),
    unlike `List`'s and `Set`'s single one.
  - *Responsibility:* associate each of a set of unique keys with exactly
    one value, and retrieve, update, or enumerate those pairs.
  - *Depends on:* two type arguments, and, to store anything, a key and a
    value of those respective types.
  - *Connects to:* built from a map literal; grown or updated by index
    assignment; read by the index operator; walked by Concept Unit 4's
    `.keys`/`.entries`.
  - *Shape:* `dart:core` standard-library surface — notably *not* itself
    an `Iterable` (unlike `List` and `Set`), though its own `.keys`,
    `.values`, and `.entries` each produce one.
- **`Iterable`**
  - *What it is:* a real, generic `dart:core` class — the shared interface
    both `List` and `Set` implement, and what `Map`'s `.keys`/`.values`/
    `.entries` each produce, describing anything that can be walked one
    value at a time.
  - *Implementation:* `abstract mixin class Iterable<E>` (verified this
    session). Relevant real signatures: `Iterable<T> map<T>(T
    toElement(E e))`; `Iterable<E> where(bool test(E element))`; `bool
    contains(Object? element)`; `List<E> toList({bool growable = true})`.
  - *Its use:* Concept Unit 5's `.contains`, and Concept Unit 7's `.map`/
    `.where`/`.toList`, are all real members of this shared interface, not
    something `List` or `Set` each separately reinvent.
  - *Type:* an abstract, generic mixin class — meant to be built *into*
    other classes' own behavior (`List`, `Set`) rather than instantiated
    directly on its own.
  - *Responsibility:* provide one shared set of walking, searching, and
    transforming operations that every concrete collection (`List`, `Set`,
    and a `Map`'s own `.keys`/`.values`/`.entries`) automatically gets,
    without each one reimplementing them separately.
  - *Depends on:* nothing on its own beyond a way to produce its values
    one at a time, which each concrete implementer (`List`, `Set`)
    supplies.
  - *Connects to:* implemented by `List` and `Set` directly; produced by
    `Map`'s own `.keys`/`.values`/`.entries`; `.map`/`.where` each return a
    *new* `Iterable`, evaluated lazily (this lesson's own term, above),
    proven for real in Concept Unit 7.
  - *Shape:* the shared abstraction underneath every collection this
    lesson uses — the reason `.contains`, `.map`, and `.where` all work
    identically on a `List`, a `Set`, or a `Map`'s own `.keys`, rather than
    each collection needing its own separate versions.
- **`MapEntry`**
  - *What it is:* a real `dart:core` class representing one key/value
    pair, exactly as produced by a `Map`'s own `.entries`.
  - *Implementation:* a generic class, `MapEntry<K, V>`, with two real
    getters, `key` (type `K`) and `value` (type `V`).
  - *Its use:* Concept Unit 4 reads both directly off each entry while
    walking a `Map`.
  - *Type:* a generic class.
  - *Responsibility:* bundle exactly one key and its associated value
    together as a single object, so a `for-in` loop over `.entries` can
    hand back both at once instead of the key alone.
  - *Depends on:* being constructed by `Map.entries` itself; this lesson
    never constructs one directly.
  - *Connects to:* produced by `Map.entries`; its own `.key`/`.value` read
    directly inside Concept Unit 4's loop body.
  - *Shape:* a small, real, supporting data class — proof that "iterating
    a Map's entries" is not special magic, just an ordinary `Iterable` of
    ordinary objects, each with two ordinary getters.
- **`print`**
  - *What it is:* the same function every earlier lesson has used.
  - *Implementation:* `void print(Object? object)`, `dart:core`.
  - *Its use:* every collection operation in this lesson is made visible
    by passing its result to `print`.
  - *Type:* a top-level function in `dart:core`.
  - *Responsibility:* convert one value to text and write it, plus a
    newline, to standard output — for a `List`, this means calling its own
    real `toString()`, which is what actually produces the readable
    `[7, 3]`-style text this lesson's own run output shows.
  - *Depends on:* one argument.
  - *Connects to:* called throughout this lesson's snippets, each time
    handed a collection, or a value read out of one.
  - *Shape:* `dart:core`'s public standard-library surface, unchanged
    since Lesson 1.

---

## Concept Unit: An Ordered Sequence You Can Grow

### The Problem

Lessons 7 and 8 both already used a list literal (`[1, 2, 3]`), each time
narrowly, as "something to iterate over," with a full explanation of what
`List` actually *is* explicitly put off until this lesson. A Sudoku
engine's own candidate digits for one cell — a small, growing sequence —
is exactly the shape of problem this needs: not one fixed value (Lesson 5)
but many, in order, that can grow over time.

> **Stop and think before reading on:** Lesson 7's list literal, `[1, 2,
> 3]`, was already fixed at three elements the moment it was written.
> What do you think a real `dart:core` collection needs to offer, beyond
> just literal syntax, to let a list actually *grow* after it's already
> been created?

### Project Change

- **Reference Source:** No reference counterpart — no persisting project
  exists yet.
- **Files affected:** `src/docs/flutter/verification/lesson-09/collections_demo.dart`
  — created, containing this unit's `List` code; Concept Units 2–7 will
  each add their own code to this same file before it's run once, as one
  real batch.
- **Change type:** Add (new file).
- **Location:** A brand-new file.
- **Dependencies:** A working `dart` installation.

### The New Code

```dart
var digits = <int>[];
digits.add(7);
digits.add(3);
print(digits);
print(digits.length);
print(digits[0]);
```

### The Updated Project

Not applicable — this is the file's brand-new starting content.

### Introduce the concept in isolation

Not run standalone — batched with the rest of this lesson (full output in
Concept Unit 7's own "Run it" step). Real, verified output for this exact
slice:

```
[7, 3]
2
7
```

### Discarding this example

`digits`'s own two values are disposable. What carries forward: `<int>[]`
starts an empty, growable `List<int>`; `.add` appends to its end; `.length`
counts its current elements; `[index]` reads one back by position, `0`
meaning the first.

### Mechanical walkthrough

- **`var digits = <int>[];`** — `var` (Lesson 5's term, reappearing)
  infers `digits`'s type from its initializer; `<int>` is a generic type
  parameter (this lesson's term, above), fixing this `List` to hold only
  `int` values; `[]` is an empty list literal — together, `<int>[]`
  constructs a real, empty `List<int>`.
- **`digits.add(7);`** — a method call on `digits`: `List`'s own real
  `void add(E value)` (this lesson's header), here `E` standing for
  `int`; appends `7` to the end, growing the list from empty to one
  element. Returns nothing (`void`), since its whole point is the side
  effect of growing the list, not a value to hand back.
- **`digits.add(3);`** — the same method, appending `3`; the list now
  holds `[7, 3]`, in the exact order each was added.
- **`print(digits);`** — the same `print` function from this lesson's
  header; handed the `List` itself, not one of its elements — `print`
  calls its `toString()`, `List`'s own real default text form, producing
  `[7, 3]`.
- **`digits.length`** — reading `List`'s own real `int get length`; `2`,
  since two elements were added.
- **`digits[0]`** — the index operator (this lesson's term), `List`'s own
  real `E operator [](int index)`; `0` means the *first* element, `7`, not
  a special "zero-th" fact about this specific list.

### CS lens

A collection that holds values in a fixed order, retrievable by numeric
position, is the most basic instance of a **sequence** — one of the most
foundational data structures in computer science, underneath nearly every
more specialized structure a later lesson introduces.

```
Also recognized in: an array in virtually every programming
language, a numbered list, a queue at a deli counter (position
determines order of service), a train's own numbered cars
```

### SE lens

A fixed-size list literal alone (Lesson 7's own narrow use) cannot grow —
every element has to be known the moment it's written. A real `List`
trades that fixed-size simplicity for the ability to grow (and, elsewhere
in its real API, shrink) after creation, at a real cost this lesson
doesn't need to dwell on yet but Lesson 23 (Performance) will: growing a
list can occasionally require the underlying storage to be reallocated
and everything copied into a bigger block, a cost a fixed-size structure
never pays at all.

### Commands needed

- **`dart run <file>`** — the same real command every earlier lesson has
  used.

### Run it

Not run standalone — per the Verification Rule's Batching clause, this
unit's code is combined with the rest of this lesson into one file, run
once. Complete real output shown in Concept Unit 7's own "Run it" step,
saved in `src/docs/flutter/verification/lesson-09/run-log.md`.

### Connecting this unit

This unit gave a growable, ordered sequence. The next unit introduces a
collection with a different guarantee: no duplicates, ever.

---

## Concept Unit: A Collection That Rejects Duplicates

### The Problem

Nothing about `List` stops the exact same value from being added twice —
`digits.add(7)` twice would happily produce `[7, 7]`. A Sudoku engine will
need to track, say, which digits have *already* been tried for one cell —
where a duplicate attempt is meaningless, not just unwanted. Is there a
collection that enforces uniqueness itself, rather than relying on
whatever code adds to it to check first?

> **Stop and think before reading on:** If a collection refused to store
> the same value twice, what do you think should happen when code tries
> to add a duplicate anyway — should it throw an error, silently do
> nothing, or something else? What would be useful about the *add*
> operation itself reporting back which of those happened?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-09/collections_demo.dart`
  — modified, appending this unit's `Set` code.
- **Change type:** Add (new lines in the file created in Concept Unit 1).
- **Location:** Appended directly after Concept Unit 1's `print(digits[0]);`.
- **Dependencies:** The file created in Concept Unit 1.

### The New Code

```dart
var seen = <int>{};
print(seen.add(7));
print(seen.add(7));
print(seen.length);
```

### The Updated Project

```dart
1: var digits = <int>[];
2: digits.add(7);
3: digits.add(3);
4: print(digits);
5: print(digits.length);
6: print(digits[0]);
7:
8: var seen = <int>{};     // ← new
9: print(seen.add(7));     // ← new
10: print(seen.add(7));    // ← new
11: print(seen.length);    // ← new
```

### Introduce the concept in isolation

Whether adding the same value twice is genuinely rejected — and whether
`add` itself reports that back — is worth real proof, not confident
restatement; run for real, batched with this lesson:

```
true
false
1
```

The first `seen.add(7)` returns `true` (genuinely new); the second,
identical call returns `false` (already present, not added again); `seen`
still holds exactly one element, proving the rejection is real, not just
documented.

### Discarding this example

`seen`'s own single value is disposable. What carries forward: a `Set`
enforces uniqueness itself, `add` returns whether a value was genuinely
new, and adding an already-present value changes nothing.

### Mechanical walkthrough

- **`var seen = <int>{};`** — `var` (Lesson 5's term) infers the type;
  `<int>` fixes the element type; `{}`, preceded by an explicit `<int>`
  type argument, is a set literal (this lesson's term) — without that
  explicit type argument, a bare `{}` would instead be read as an empty
  *`Map`* literal, since curly-brace syntax alone can't tell the two apart.
- **`seen.add(7)`** (first call) — `Set`'s own real `bool add(E value)`
  (this lesson's header) — genuinely different from `List.add`'s `void`
  return type; `7` was not already present, so it's added, and `true` is
  returned.
- **`seen.add(7)`** (second call) — the identical call again; `7` is
  already present, so nothing is added, and `false` is returned instead.
- **`seen.length`** — the same `.length` getter `List` also has (both
  real members of the shared `Iterable` this lesson's header describes);
  `1`, confirming only one real element exists.

### CS lens

Guaranteeing every element is unique, checked on every single insertion,
is the core idea of a **set** in the mathematical sense — a collection
with no notion of order or repetition, only membership.

```
Also recognized in: a mathematical set in the strict sense, a
database column with a UNIQUE constraint, a guest list where the
same name is only ever counted once no matter how many times it's
submitted, a spell-checker's own dictionary of known words
```

### SE lens

Using a `List` and manually checking `.contains` before every `.add` would
achieve the same uniqueness, at the cost of that check being *optional* —
easy to forget at just one call site, silently reintroducing duplicates. A
`Set` makes uniqueness structural: there is no way to add a duplicate at
all, by accident or otherwise, because the check is inside `add` itself,
not left to every caller to remember.

### Commands needed

- **`dart run <file>`** — same command as the previous unit.

### Run it

Not run standalone, same Batching-clause reason as before; full output in
Concept Unit 7's own "Run it" step.

### Connecting this unit

This unit enforced uniqueness with no notion of position at all. The next
unit introduces a collection organized around a completely different
idea: retrieving a value not by position, and not by mere presence, but by
a chosen key.

---

## Concept Unit: Looking Up a Value by Key

### The Problem

Neither `List` (by position) nor `Set` (by presence alone) can answer "what
is this Sudoku cell's own row number?" directly — that requires associating
a specific *name* (`'row'`) with a specific *value* (`2`), and looking it
back up by that same name later. What collection is built for that?

> **Stop and think before reading on:** If you looked up a key that was
> never actually stored, what do you think should happen — should it
> throw an error immediately, or is there a value that could honestly mean
> "nothing is stored under this key," the same way Lesson 5's own `null`
> did for an unset variable?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-09/collections_demo.dart`
  — modified, appending this unit's `Map` code.
- **Change type:** Add (new lines in the file created in Concept Unit 1).
- **Location:** Appended directly after the previous unit's `print(seen.length);`.
- **Dependencies:** The file created in Concept Unit 1, extended in
  Concept Unit 2.

### The New Code

```dart
var cell = <String, int>{};
cell['row'] = 2;
cell['col'] = 5;
print(cell['row']);
print(cell['missing']);
```

### The Updated Project

```dart
 1: var digits = <int>[];
 2: digits.add(7);
 3: digits.add(3);
 4: print(digits);
 5: print(digits.length);
 6: print(digits[0]);
 7:
 8: var seen = <int>{};
 9: print(seen.add(7));
10: print(seen.add(7));
11: print(seen.length);
12:
13: var cell = <String, int>{};    // ← new
14: cell['row'] = 2;               // ← new
15: cell['col'] = 5;               // ← new
16: print(cell['row']);            // ← new
17: print(cell['missing']);        // ← new
```

### Introduce the concept in isolation

Whether a missing key throws or returns `null` is worth real proof, not
assumption — run for real, batched:

```
2
null
```

`cell['row']` returns `2`, the value actually stored under that key.
`cell['missing']` — a key never stored at all — returns `null`, not an
exception, matching `Map`'s own real signature, `V? operator [](Object?
key)`, whose `?` promises exactly this.

### Discarding this example

`cell`'s own two entries are disposable. What carries forward: a `Map`
associates keys with values; index assignment (`[key] = value`) stores or
overwrites an entry; the index operator returns `null`, honestly, for a
key that was never stored — proven, not merely read off a signature.

### Mechanical walkthrough

- **`var cell = <String, int>{};`** — `var` infers the type; `<String,
  int>` is a generic type parameter with *two* type arguments (this
  lesson's term) — the key type, then the value type; `{}`, with that
  explicit type argument, is a map literal (this lesson's term), here
  starting empty.
- **`cell['row'] = 2;`** — index assignment (this lesson's term): stores
  `2` under the key `'row'` (a string literal, Lesson 5's term); since
  `'row'` didn't already exist as a key, this creates a new entry.
- **`cell['col'] = 5;`** — the same operation, creating a second, separate
  entry.
- **`cell['row']`** — the index operator, `Map`'s own real `V? operator
  [](Object? key)` (this lesson's header); looks up `'row'` and returns
  its stored value, `2`.
- **`cell['missing']`** — the same operator, given a key that was never
  stored at all; returns `null` (Lesson 5's term, reappearing) — proven
  real above, not merely asserted from the signature's own `?`.

### CS lens

Retrieving a value by an arbitrary key, rather than by position, is a
**key-value map** (also called an **associative array** or **dictionary**
in other languages) — one of the most heavily-used data structures in all
of practical software, because so many real problems are naturally
"look this up by name" rather than "look this up by position."

```
Also recognized in: Python's `dict`, JavaScript's plain object or
`Map`, a physical phone book (name → number), a dictionary (word →
definition), a database index (a column's value → the row containing
it)
```

### SE lens

A `Map`'s real cost, compared to a `List`, is that it has no inherent
order at all to rely on for anything beyond lookup — asking "which entry
came first" is not a question a plain `Map` answers reliably the way a
`List`'s own index does (Dart's own `Map` documents that insertion order
is preserved for iteration, which Concept Unit 4 relies on, but that's a
specific guarantee, not a general property of key-value maps in every
language). Its real benefit is direct: looking a value up by a meaningful
name costs the same, structurally, whether the map holds two entries or
two thousand — no scanning required, unlike searching an unsorted `List`
by value (Concept Unit 5, this lesson).

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Not run standalone, same Batching-clause reason; full output in Concept
Unit 7's own "Run it" step.

### Connecting this unit

This unit stored and looked up single values by key. The next unit walks
every key (and every value) a `Map` holds, all at once.

---

## Concept Unit: Walking Every Key and Value

### The Problem

Lesson 7's `for-in` already walked a `List`'s own values directly. A `Map`
holds *pairs* — walking one without the other would throw away half of
what it actually stores. What does `for-in` look like over a collection
that holds two related pieces of data per entry instead of one?

> **Stop and think before reading on:** If you needed both a `Map`'s keys
> and its values at the same time — not just one or the other — would you
> rather walk the keys and look each value up separately, or have
> something hand you both together, already paired, in one pass?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-09/collections_demo.dart`
  — modified, appending this unit's iteration code.
- **Change type:** Add (new lines).
- **Location:** Appended directly after the previous unit's
  `print(cell['missing']);`.
- **Dependencies:** The file created in Concept Unit 1, extended through
  Concept Unit 3.

### The New Code

```dart
for (var key in cell.keys) {
  print(key);
}
for (var entry in cell.entries) {
  print('${entry.key}=${entry.value}');
}
```

### The Updated Project

```dart
13: var cell = <String, int>{};
14: cell['row'] = 2;
15: cell['col'] = 5;
16: print(cell['row']);
17: print(cell['missing']);
18:
19: for (var key in cell.keys) {              // ← new
20:   print(key);                             // ← new
21: }                                         // ← new
22: for (var entry in cell.entries) {         // ← new
23:   print('${entry.key}=${entry.value}');   // ← new
24: }                                         // ← new
```

### Introduce the concept in isolation

Whether iteration order matches insertion order for this specific `Map`
implementation is worth real proof, not assumption — run for real:

```
row
col
row=2
col=5
```

Both loops visit `'row'` before `'col'`, matching the exact order each was
inserted in Concept Unit 3 — real, not incidental: Dart's default `Map`
implementation genuinely preserves insertion order for iteration.

### Discarding this example

Nothing here beyond `cell`'s own two entries, already disposable from the
previous unit. What carries forward: `.keys` gives just the keys; `.entries`
gives paired key/value objects in one pass, in insertion order.

### Mechanical walkthrough

- **`for (var key in cell.keys)`** — Lesson 7's `for-in` loop, reused
  unchanged; `cell.keys` is `Map`'s own real `Iterable<K> get keys` (this
  lesson's header) — an `Iterable` (this lesson's header), the same
  shared interface `List` and `Set` both implement, which is exactly why
  `for-in` already knows how to walk it with no new syntax at all.
- **`print(key)`** — the same `print` function from this lesson's header,
  handed each string key in turn.
- **`for (var entry in cell.entries)`** — the same `for-in` loop, this
  time over `Map`'s own real `Iterable<MapEntry<K, V>> get entries`; each
  `entry` is a real `MapEntry` (this lesson's header), not a plain key or
  value alone.
- **`'${entry.key}=${entry.value}'`** — string interpolation (Lesson 4's
  term, reappearing), here interpolating two full expressions rather than
  bare variables, using the `${ }` form specifically because `.key` and
  `.value` are property reads, not a single bare identifier; `entry.key`
  and `entry.value` read `MapEntry`'s own two real getters (this lesson's
  header).

### CS lens

Producing paired data (a key alongside its value) from a single walk,
rather than requiring two separate passes or a second lookup per key, is
the same **iteration** idea Lesson 7 introduced, specialized for a
structure whose natural unit is a *pair*, not a single value.

```
Also recognized in: Python's own `dict.items()`, JavaScript's
`Object.entries()`, a spreadsheet's own two-column view of a lookup
table (name in one column, value in the next, read row by row)
```

### SE lens

Walking `.keys` and separately looking each value up (`cell[key]` inside
the loop) would work identically to `.entries` here, at the cost of one
extra lookup per key — for a `Map` with many entries, that's real,
repeated work `.entries` avoids entirely by handing back both pieces
together in the same pass they were already being produced in.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Not run standalone; full output in Concept Unit 7's own "Run it" step.

### Connecting this unit

This unit walked every entry a `Map` holds. The next unit asks a related
but different question of any collection: does it contain one *specific*
value at all?

---

## Concept Unit: Asking Whether a Value Is Present

### The Problem

A Sudoku move needs to check "has this digit already been tried for this
cell?" — not walk every value (previous unit's job), just answer yes or
no about one specific value. Writing that check by hand means a loop
comparing every element against the target, stopping early if found —
exactly the kind of logic Lesson 7 already showed how to write. Is there a
shorter way to ask the same question?

> **Stop and think before reading on:** If you already know how to write a
> loop that checks every element and stops the moment it finds a match
> (Lesson 7's own loops, combined with Lesson 6's `if`), what would a
> single, built-in method that does the exact same thing need to return,
> and what would it save you from writing yourself?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-09/collections_demo.dart`
  — modified, appending this unit's search code.
- **Change type:** Add (new lines).
- **Location:** Appended directly after the previous unit's final `print`.
- **Dependencies:** The file created in Concept Unit 1.

### The New Code

```dart
print(digits.contains(3));
print(digits.contains(99));
```

### The Updated Project

```dart
1: var digits = <int>[];
2: digits.add(7);
3: digits.add(3);
4: print(digits);
5: print(digits.length);
6: print(digits[0]);
7:
8: print(digits.contains(3));    // ← new
9: print(digits.contains(99));   // ← new
```

(Shown against Concept Unit 1's own lines, since this unit reads `digits`
directly; the full file also contains Concept Units 2–4's own code
between these, omitted here only because this unit doesn't touch it —
the complete file appears in full in Concept Unit 7.)

### Introduce the concept in isolation

Confidently predictable, given `digits` already holds `[7, 3]` (Concept
Unit 1's own real, run-verified state), but included in this lesson's one
real batched run rather than predicted separately:

```
true
false
```

### Discarding this example

Nothing new to discard beyond `digits`'s own already-disposable values.
What carries forward: `.contains` answers "is this exact value present,"
without a hand-written loop.

### Mechanical walkthrough

- **`digits.contains(3)`** — `Iterable`'s own real `bool contains(Object?
  element)` (this lesson's header) — available on `digits` because
  `List` implements `Iterable`; checks every element in turn (internally,
  a loop much like Lesson 7's own) for one equal to `3`, and stops the
  instant it finds one; `true`, since `3` really is present.
- **`digits.contains(99)`** — the same method; no element equals `99`, so
  every element is checked and none match; `false`.

### CS lens

Searching a collection for one specific value is **linear search** when
the collection has no particular order to exploit — checking each element
in turn until a match is found or the collection is exhausted — the same
approach Lesson 7's own loops could express by hand, here provided
ready-made.

```
Also recognized in: looking through an unsorted stack of papers for
one specific document, a security guard checking faces against an
unsorted photo one at a time, any unindexed database table scan
```

### SE lens

Writing this exact search by hand, with a loop and an `if`, works
identically — `.contains`'s real value is that it's already written,
tested, and named clearly enough that a reader immediately knows what it
does without reading a loop body to reconstruct the intent. Its real
limitation: for a `List` specifically, it has no way to be faster than
checking every element in the worst case, since nothing about a `List`
guarantees any particular order to exploit — Lesson 23 (Performance)
returns to exactly this cost.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Not run standalone; full output in Concept Unit 7's own "Run it" step.

### Connecting this unit

This unit asked whether a value is present. The next unit reorders an
entire collection's own values.

---

## Concept Unit: Putting a Collection in Order

### The Problem

`digits` currently holds `[7, 3]` — in the order values happened to be
added, not smallest-to-largest. A Sudoku engine displaying a cell's
candidate digits will want them in a predictable, sorted order. Is there a
way to reorder an entire `List` at once, rather than manually comparing
and swapping elements by hand?

> **Stop and think before reading on:** If a method reordered a `List`'s
> own elements directly, rather than handing back a new, separately
> sorted list, what would that mean for any other variable already
> pointing at that same list?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-09/collections_demo.dart`
  — modified, appending this unit's sort code.
- **Change type:** Add (new lines).
- **Location:** Appended directly after the previous unit's final `print`.
- **Dependencies:** The file created in Concept Unit 1.

### The New Code

```dart
var unsorted = [5, 1, 4, 2];
unsorted.sort();
print(unsorted);
```

### The Updated Project

Not applicable — a brand-new, freestanding declaration and two statements,
using its own list literal rather than modifying an already-shown
structure.

### Introduce the concept in isolation

Confidently predictable (ascending numeric order is `List.sort`'s own
documented default behavior), included in this lesson's real batched run:

```
[1, 2, 4, 5]
```

### Discarding this example

`unsorted`'s own four values are disposable. What carries forward:
`.sort()` reorders a `List`'s elements in place, in ascending order by
default.

### Mechanical walkthrough

- **`var unsorted = [5, 1, 4, 2];`** — a declaration using a list literal
  (this lesson's term, reappearing from Lesson 7), its type inferred by
  `var` as `List<int>`.
- **`unsorted.sort();`** — `List`'s own real `void sort([int compare(E a,
  E b)?])` (this lesson's header); called here with no argument at all,
  using its own default ordering (ascending, for a numeric type); reorders
  `unsorted`'s own elements directly — the same list object, not a new
  one — which is exactly why the very next line, reading `unsorted`
  again, sees the reordered result.
- **`print(unsorted)`** — the same `print` function from this lesson's
  header, reading `unsorted` *after* sorting, showing the new order.

### CS lens

Reordering a collection according to some rule is **sorting** — one of
the most studied problems in all of computer science, with dozens of
named algorithms (this lesson doesn't need to name which one `.sort()`
uses internally to make its own point: that a *result* can be trusted
without knowing the *mechanism*, the same demystification principle this
curriculum applies to every real library call).

```
Also recognized in: alphabetizing a bookshelf, a leaderboard ranked
by score, a search engine ranking results by relevance, a deck of
cards being sorted by suit and rank
```

### SE lens

`.sort()` mutating its own list in place, rather than returning a new,
separately-sorted one, is a real, deliberate design choice: it avoids
allocating an entirely new list just to reorder an existing one, at the
real cost that any other variable already referring to the exact same
list (not shown in this small example, but a real risk in larger
programs) sees the reordering too, immediately, whether that was intended
or not.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Not run standalone; full output in Concept Unit 7's own "Run it" step.

### Connecting this unit

This unit reordered a collection's own existing values. The final unit
builds an entirely new collection out of an existing one, instead.

---

## Concept Unit: Building a New Collection From an Old One

### The Problem

Every unit so far has changed a collection in place, or read something
out of it, without producing a genuinely *new* collection derived from an
existing one. A Sudoku engine will often need exactly that: given a list
of digits, produce a new list of each one squared, or a new list
containing only the ones matching some rule — without hand-writing a loop
that builds a fresh `List` and adds to it one element at a time (though
Lesson 7's loops could do exactly that).

> **Stop and think before reading on:** If a method built a *new*
> collection by applying some rule to each element of an existing one,
> and the *original* collection changed afterward, before that new
> collection was actually used, what would you expect the new collection
> to reflect — the original collection's state from the moment the method
> was called, or its state at the moment the new collection is actually
> read?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-09/collections_demo.dart`
  — modified, appending this unit's code, completing the file.
- **Change type:** Add (final lines in the file created in Concept Unit
  1).
- **Location:** Appended directly after the previous unit's `print(unsorted);`.
- **Dependencies:** The file created in Concept Unit 1, extended through
  Concept Unit 6.

### The New Code

```dart
var source = [1, 2, 3];
var lazySquares = source.map((x) => x * x);
source.add(4);
print(lazySquares.toList());
print(source.where((x) => x > 1).toList());
```

### The Updated Project

The complete, final file for this lesson (new lines marked; everything
above is exactly what Concept Units 1–6 left it as, in the order each was
added):

```dart
30: var source = [1, 2, 3];                          // ← new
31: var lazySquares = source.map((x) => x * x);       // ← new
32: source.add(4);                                    // ← new
33: print(lazySquares.toList());                       // ← new
34: print(source.where((x) => x > 1).toList());        // ← new
```

(Line numbers approximate this unit's position after Concept Units 1–6's
combined code; the exact, complete file is saved in full in
`src/docs/flutter/verification/lesson-09/collections_demo.dart`.)

### Introduce the concept in isolation

This is the one claim in this entire lesson genuinely worth stopping for:
whether `lazySquares` reflects `source`'s state *when `.map` was called*
(`[1, 2, 3]`) or its state *when `lazySquares` is actually read*
(`[1, 2, 3, 4]`, after `.add(4)`) is not something to state from
confidence — run for real:

```
[1, 4, 9, 16]
```

`16` — `4` squared — is in the result, even though `4` was only added to
`source` *after* `.map` was already called. This proves `.map` does not
compute its result immediately; it builds a new `Iterable` that computes
each element only when actually asked for one (here, by `.toList()`),
against whatever `source` contains *at that later moment*. This is
**lazy evaluation** (this lesson's term, reappearing from Lesson 6),
proven directly for the first time, not just named in passing.
`.where(...)` shows the identical behavior:

```
[2, 3, 4]
```

— including the just-added `4`, for the same reason.

### Discarding this example

`source`'s and `lazySquares`'s own values are disposable. What carries
forward: `.map`/`.where` build a lazy `Iterable`, evaluated against the
source collection's state at the moment it's actually read, not at the
moment `.map`/`.where` was called.

### Mechanical walkthrough

- **`var source = [1, 2, 3];`** — a declaration using a list literal,
  same shape as every earlier unit.
- **`source.map((x) => x * x)`** — `Iterable`'s own real `Iterable<T>
  map<T>(T toElement(E e))` (this lesson's header); `(x) => x * x` is an
  anonymous function (this lesson's term, above): `(x)` is its one
  parameter, with no declared type (inferred from `source`'s own element
  type, `int`); `=>` is arrow syntax (this lesson's term), meaning the
  function's entire body is the one expression `x * x`, equivalent to a
  full block body `{ return x * x; }`. `.map` hands this small function to
  each element *whenever the result is actually walked*, not immediately.
- **`source.add(4);`** — `List.add` (Concept Unit 1's own term), mutating
  `source` directly, *after* `lazySquares` was already created from it.
- **`lazySquares.toList()`** — `Iterable`'s own real `List<E>
  toList({bool growable = true})` (this lesson's header); this is the
  moment `.map`'s own function is actually applied to every element
  `source` holds *right now* — four elements, including the just-added
  `4` — producing a brand-new, real `List`.
- **`source.where((x) => x > 1)`** — `Iterable`'s own real `Iterable<E>
  where(bool test(E element))`; `(x) => x > 1` is another anonymous
  function, its body a relational-operator expression (Lesson 6's term,
  reappearing) instead of arithmetic; produces a new, lazy `Iterable`
  containing only elements for which that function returns `true`.
- **`.toList()`** (second call) — the same real method as above, again
  the moment this lazy result is actually materialized, against `source`'s
  current four elements.

### CS lens

Building a new collection by applying a rule to every element of an
existing one, without a hand-written loop, is **higher-order functions**
applied to collections specifically — passing a function itself as a
value into another function (`.map`, `.where`), rather than only passing
ordinary data. Combined with **lazy evaluation** (reappearing from Lesson
6, proven directly here), this is also recognized well beyond Dart:

```
Also recognized in: functional programming generally (Lesson 15
returns to this directly); SQL's own SELECT ... WHERE, conceptually
transforming and filtering a table without a hand-written loop;
spreadsheet formulas recalculating lazily, only when a cell is
actually viewed or printed, not the instant an input changes
```

### SE lens

Writing this same transformation as a hand-written loop (Lesson 7) —
building a new empty `List`, looping over `source`, computing and adding
each squared value — works identically in *result*, at the cost of more
code stating the same intent less directly, and, as this unit's own real
proof shows, a genuinely different *timing* guarantee: a hand-written loop
would compute against `source`'s state at the moment the loop actually
ran, not lazily deferred the way `.map`'s own real result is. That
laziness is a real, double-edged tradeoff: it can save real work (if a
lazy result is built but never actually read, nothing is ever computed at
all), and it can also genuinely surprise a reader who assumes, reasonably
but wrongly, that `.map`'s result was already "locked in" the moment it
was called — exactly the wrong assumption this unit's own real proof was
built to correct.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Real, verified, complete output for this lesson's entire batched file:

```
[7, 3]
2
7
true
false
1
2
null
row
col
row=2
col=5
true
false
[1, 2, 4, 5]
[1, 4, 9, 16]
[2, 3, 4]
```

Real, saved in full in
`src/docs/flutter/verification/lesson-09/run-log.md`.

### Connecting this unit

This unit proved, rather than assumed, that transforming a collection can
be lazy — deferred until the exact moment its result is actually needed,
closing this lesson on the same demystification standard every earlier
lesson has held to: a surprising-sounding behavior, shown as real,
inspectable evidence, not a confident sentence.

---

## Connect the Pieces

Trace one Sudoku-flavored idea through everything this lesson built: a
cell's own set of candidate digits. Concept Unit 1's `List` could hold
them in the order they were tried, growable one `.add` at a time — proven
for real, `[7, 3]`, not `[7]` and not `[3, 7]`. Concept Unit 2's `Set`
could instead track which digits have *already* been ruled out, with
uniqueness genuinely enforced — a second attempt to rule out the same
digit really did return `false` and really did leave the collection's own
size unchanged. Concept Unit 3's `Map` could hold that same cell's own
row and column under named keys, real-proven to return `null`, honestly,
for a key that was never actually stored, rather than crashing. Concept
Unit 4 walked every key and every paired entry a `Map` holds, in the exact
order they were inserted, proven for real rather than assumed. Concept
Unit 5 asked whether one specific digit had already been tried, using the
same `Iterable` interface every collection in this lesson shares. Concept
Unit 6 put a list of candidates in a predictable, sorted order, mutating
the original list directly rather than building a new one. And Concept
Unit 7 closed on this lesson's single most important proof: that building
a new collection from an old one, via `.map`/`.where`, doesn't lock in its
source's state the moment it's called — it stays lazy, evaluated only
once its result is actually read, a real, non-obvious fact this lesson
chose to demonstrate rather than assert.

Lesson 5 gave one value a name; this lesson gave *many* values, held
together three different ways, real names and real, verified behavior.
Lesson 10 turns to Dart's own type system in full — nullable types, type
promotion, and the generics this lesson's `List<E>` and `Map<K, V>` used
narrowly, without yet explaining what a generic class actually *is* or how
to write your own.
