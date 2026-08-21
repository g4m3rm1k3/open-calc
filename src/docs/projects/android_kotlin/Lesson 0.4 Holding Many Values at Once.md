# Lesson 0.4: Holding Many Values at Once

**What you will build.** A small, throwaway contact-search program —
not part of `Calculator.kt`, and never touched again after this
lesson — holding a growing list of contact names and a phone-number
lookup, then searching that lookup for one specific name. Every value
this curriculum has worked with so far has held exactly one thing: one
number, one piece of text, one true/false answer. This lesson's
transferable problem is what happens the moment a program needs to hold
*many* values under one name, and process every one of them the same
way.

**What you need to know first.** `val`, `Int`, `String`, `Boolean`,
`==`, and `for`'s cousin, `if`/`else`, from Lessons 0.1–0.3 — this
lesson's own code uses all of them, and none of this lesson's own new
code touches `Calculator.kt`.

**Terms used in this lesson**

- **program** — a finite sequence of instructions a computer executes
  in order. This lesson's contact-search program is a real, complete
  program in that sense, even though it's a standalone practice file
  rather than part of the calculator.
- **value** — a piece of data a program holds and operates on. This
  lesson's whole subject is what happens once a single named value
  needs to hold *several* pieces of data instead of one.
- **type** — a category determining what a value's data is and what
  operations are valid on it. Every collection this lesson introduces
  is itself typed — a `List<String>` and a `List<Int>` are different
  types, exactly as strictly checked as `Int` and `Boolean` were in
  Lesson 0.1.
- **`val`** — the keyword declaring an immutable binding: a name whose
  value the compiler refuses to let be reassigned. Every collection
  this lesson declares is itself a `val` — the *binding* (the name)
  stays fixed even when, as with `MutableList` and `MutableMap` below,
  the collection's own *contents* can still change.
- **`String`** — Kotlin's type for text. Every contact name and every
  phone number in this lesson's program is a `String`, the same type
  given full treatment for `"Calculator starting up"` in Lesson 0.1.
- **`Int`** — Kotlin's type for whole numbers, given full treatment in
  Lesson 0.1; this lesson's own isolated labs use it for a throwaway
  example before the real program settles on `String` phone numbers.
- **comparison operator (`==`)** — an operator comparing two values for
  equality, producing a `Boolean`, given full treatment in Lesson 0.3.
  This lesson's search logic reuses it directly: finding a contact
  means comparing a stored name against the name being searched for.
- **type argument (`<...>`)** — one or more types written in angle
  brackets immediately after a generic type's name, stating exactly
  what kind of data that specific instance will hold —
  `MutableMap<String, Int>` states, explicitly, that this particular
  map holds `String` keys and `Int` values. It exists because a single
  `List` or `Map` declaration in Kotlin's own source code is written
  once and reused for every possible kind of content (a `List` of
  numbers, of names, of anything at all) — the type argument is what
  narrows that general capability down to one concrete kind of data for
  one specific variable. This lesson only ever *supplies* type
  arguments to collections already written by the Kotlin standard
  library; writing a new generic type or function of your own is
  Stage 8's own subject.
- **iteration** — visiting every element held by a collection, one at a
  time, running the same instructions for each. It exists because a
  collection is only useful if a program can actually *do* something
  with everything it holds, not just store it.
- **`for`** — a keyword introducing a loop that iterates over a
  collection, running its body once per element. It exists as the
  direct language mechanism for the iteration idea above: without it, a
  program would have no way to say "run this block once for every item
  in this list" except by writing out one copy of the block per item —
  impossible for a collection whose size isn't known while the code is
  being written.

**Objects and methods used**

- **`listOf`**
  - *What it is:* a Kotlin standard-library function that builds a
    read-only `List` from the values passed to it.
  - *Implementation:* a top-level generic function,
    `fun <T> listOf(vararg elements: T): List<T>` — `vararg` meaning it
    accepts any number of arguments, each becoming one element of the
    resulting list, in the order given.
  - *Its use:* builds this lesson's very first collection, the initial
    contacts list, from three literal names.
  - *Type:* a top-level generic function.
  - *Responsibility:* given any number of values of one consistent
    type, produce a `List` holding exactly those values, in that order,
    with no way to add, remove, or replace any of them afterward.
  - *Depends on:* zero or more arguments, all of the same type (or a
    type they all share).
  - *Connects to:* called once in this lesson's own code, to build the
    initial `contacts` list; its result is read by every `for` loop
    this lesson writes.
  - *Shape:* a public standard-library API surface — a factory function
    producing an immutable collection.

- **`mutableListOf`**
  - *What it is:* the mutable counterpart to `listOf` — builds a
    `MutableList`, one that supports adding and removing elements after
    it's created.
  - *Implementation:* `fun <T> mutableListOf(vararg elements: T): MutableList<T>`
    — the same `vararg` shape as `listOf`, returning a different,
    mutable type.
  - *Its use:* this lesson's real `contacts` list is declared this way
    specifically so a new contact can be added to it after creation.
  - *Type:* a top-level generic function.
  - *Responsibility:* given any number of values, produce a
    `MutableList` holding them, additionally capable of having elements
    added or removed later.
  - *Depends on:* zero or more arguments of one consistent type.
  - *Connects to:* called once, building `contacts`; its result is
    later modified by `add`, below, and read by `for`.
  - *Shape:* a public standard-library API surface, the mutable sibling
    of `listOf`.

- **`MutableList.add`**
  - *What it is:* a real method on `MutableList` that appends one new
    element to the end of the list.
  - *Implementation:* declared on the `MutableList<E>` interface as
    `fun add(element: E): Boolean` — returns `true` if the list changed
    as a result (which, for a plain append, is always).
  - *Its use:* this lesson's own way of growing the contacts list after
    it's created, proving `MutableList` really does support that where
    a plain `List` does not.
  - *Type:* an instance method on `MutableList<E>`.
  - *Responsibility:* insert the given element at the end of the list
    it's called on, growing the list's size by one.
  - *Depends on:* the list it's called on being a `MutableList`, not a
    plain `List`; one argument, the element to add.
  - *Connects to:* called once in this lesson's real program, on
    `contacts`; its returned `Boolean` is not used here (the call is
    made for its effect, not its return value — the same
    **statement**-not-**expression** distinction Lesson 0.1 established
    for `println`).
  - *Shape:* a public standard-library API surface, part of the
    `MutableList` contract that a plain `List` deliberately omits.

- **`mutableMapOf`**
  - *What it is:* a Kotlin standard-library function that builds an
    empty, mutable key-value collection.
  - *Implementation:* `fun <K, V> mutableMapOf(): MutableMap<K, V>` when
    called with no arguments (an overload also accepts initial `Pair`
    entries, not used in this lesson).
  - *Its use:* builds this lesson's phone book, starting empty and
    filled in afterward using `[key] = value`, below.
  - *Type:* a top-level generic function.
  - *Responsibility:* produce a new, empty `MutableMap`, ready to have
    key-value pairs added to it.
  - *Depends on:* explicit type arguments (`<String, String>` in this
    lesson) when called with no arguments, since there's nothing else
    for the compiler to infer the key/value types from.
  - *Connects to:* called once, building `phoneBook`; its result is
    filled in by the `set` operator, below, and read by `for`.
  - *Shape:* a public standard-library API surface, the map equivalent
    of `mutableListOf`.

- **`MutableMap.set` (the `[key] = value` operator)**
  - *What it is:* the real function Kotlin calls when code writes
    `someMap[key] = value` — stores `value` under `key` in the map,
    overwriting any existing value already stored under that same key.
  - *Implementation:* real source, fetched this session from
    `kotlin-stdlib-sources.jar` (`commonMain/kotlin/collections/Maps.kt`):
    ```kotlin
    /** Allows to use the index operator for storing values in a mutable map. */
    @kotlin.internal.InlineOnly
    public inline operator fun <K, V> MutableMap<K, V>.set(key: K, value: V): Unit {
        put(key, value)
    }
    ```
    An `operator` function — the same category as `Int.plus` from
    Lesson 0.1, letting `[...] = ...` syntax stand in for an ordinary
    named call — whose real body simply forwards to `put`, a plain
    method `MutableMap` itself declares.
  - *Its use:* this lesson's own way of filling in the phone book, one
    name/number pair at a time.
  - *Type:* an `operator fun`, declared as an extension function on
    `MutableMap<K, V>` (a function attached to an existing type from
    outside its own declaration — Kotlin allows this; the function
    itself is not part of `MutableMap`'s own original interface, but
    calls work identically either way).
  - *Responsibility:* store one value under one key, replacing whatever
    was there before, if anything.
  - *Depends on:* the map it's called on, plus a key and a value.
  - *Connects to:* called twice in this lesson's real program, filling
    `phoneBook`; internally calls `put`, a plain method on `MutableMap`
    not otherwise used by name in this lesson.
  - *Shape:* a public standard-library API surface, the write-side
    counterpart to reading a map (reading is deliberately not used in
    this lesson — see this unit's own SE Lens, Concept Unit 3, below).

- **`Map.Entry`**
  - *What it is:* the real type `for` produces one instance of, each
    time it loops over a `Map`, holding one key and its matching value
    together.
  - *Implementation:* real source, fetched this session from
    `kotlin-stdlib-sources.jar` (`commonMain/kotlin/Collections.kt`,
    nested inside `Map`'s own declaration):
    ```kotlin
    public interface Entry<out K, out V> {
        public val key: K
        public val value: V
    }
    ```
    Two real, read-only (`val`, not `var`) properties — `key` and
    `value` — nothing else; the same doc comment in the real source
    states an `Entry`'s `toString()` must return `"key=value"`, which
    matches this lesson's own real, verified `{Alice=555-0101,
    Bob=555-0102}` output for printing a whole map directly.
  - *Its use:* this lesson's `for` loops over a map read each entry's
    `key` and `value` directly, rather than looking values up by key.
  - *Type:* an interface, with two read-only properties.
  - *Responsibility:* represent one key-value pair from a map, as a
    single object a `for` loop can hand over one at a time.
  - *Depends on:* nothing to be constructed by this lesson's own code —
    every `Map.Entry` this lesson sees is produced by iterating a `Map`,
    never built directly.
  - *Connects to:* produced by `for` (below) each time it loops over
    `phoneBook`; its `key` and `value` properties are read directly by
    this lesson's own comparison and `println` calls.
  - *Shape:* a public standard-library API surface — the shape a `Map`
    presents itself in in one piece, once per entry, during iteration.

- **`for`**
  - *What it is:* the keyword introducing a loop that iterates over a
    collection.
  - *Implementation:* `for (element in collection) { ... }` — no return
    value; runs its body once per element the collection produces.
  - *Its use:* every search and every printed listing in this lesson
    goes through a `for` loop — it's how this lesson's code actually
    reaches every element a `List` or `Map` holds, one at a time.
  - *Type:* a control-flow keyword, not a function or method.
  - *Responsibility:* run its body block exactly once for each element
    the collection it's iterating produces, in the order the collection
    produces them, then stop.
  - *Depends on:* a collection (or anything else Kotlin knows how to
    iterate) to loop over.
  - *Connects to:* reads from `contacts` (each element a `String`) and
    from `phoneBook` (each element a `Map.Entry`, above); its body calls
    `println` and, in Concept Unit 4, the `==` comparison already given
    full treatment in Lesson 0.3.
  - *Shape:* core control-flow syntax, the same category of language
    feature as `if`/`else` and `when` from Lesson 0.3.

- **`println`**
  - *What it is:* the standard-library function writing text and a line
    break to standard output.
  - *Implementation:* real source, unchanged from Lesson 0.1
    (`jvmMain/kotlin/io/Console.kt`) — the `Any?` overload is the one
    this lesson's calls to it resolve to, since a `List` or a
    `Map.Entry`'s `key`/`value` aren't `Int`, `Double`, or `Boolean`:
    ```kotlin
    /** Prints the given [message] and the line separator to the standard output stream. */
    @kotlin.internal.InlineOnly
    public actual inline fun println(message: Any?) {
        System.out.println(message)
    }
    ```
  - *Its use:* still this lesson's only way to make anything visible;
    printing a whole `List` or `Map` directly (not just one element at
    a time) is new to this lesson.
  - *Type:* a top-level `inline` function.
  - *Responsibility:* convert its one argument to text and write it,
    followed by a line separator, to standard output. For a `List` or a
    `Map`, "convert to text" means calling that collection's own real
    `toString()` — a `List`'s produces `[element, element, ...]`; a
    `Map`'s produces `{key=value, key=value, ...}`, matching `Entry`'s
    own documented `toString()` contract, above.
  - *Depends on:* exactly one argument.
  - *Connects to:* called on `contacts`, on `phoneBook`, and on
    individual `String`s and `Map.Entry` properties throughout this
    lesson; internally calls `System.out.println`.
  - *Shape:* a public standard-library API surface, unchanged in role
    from Lesson 0.1.

---

## Concept Unit: Lists and Iteration

### The Problem

`Calculator.kt`'s own `operatorSymbol` from Lesson 0.3 holds exactly
one piece of text. A contact-search program needs to hold *several*
contact names at once — not one `val` per contact (which would mean a
fixed, hard-coded number of contacts, decided while writing the code,
with no way to search "all of them" without naming every single one by
hand in the source). Given that a `val` can already hold a `String` or
an `Int`, what do you think it would take for a single `val` to hold
*several* strings at once? Once a single name held several values,
how would code go about doing something — like printing — to
*every one* of them, without knowing in advance how many there are?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch,
  covering the BRD's "Throwaway: Tiny contact/search program" practice
  item for this lesson.
- **Files affected** — created: `ContactSearch.kt`, a standalone
  practice file, explicitly **not** part of the calculator project —
  it will never be referenced by `Calculator.kt`, and this lesson's own
  Closing states plainly that it is discarded once this lesson ends.
- **Change type** — add (a brand-new file).
- **Location** — n/a; this is the file's first content.
- **Dependencies** — none beyond Lessons 0.1–0.3's language features.

### The New Code

```kotlin
val contacts = listOf("Alice", "Bob", "Carol")
println(contacts)
for (contact in contacts) {
    println(contact)
}
```

### The Updated Project

This is a brand-new file — step 5's code above is the entire file
(inside a `fun main() { }`, the same entry point given full treatment
in Lesson 0.1), with nothing surrounding it yet.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.4/lab1_list.kt`), holding
colors instead of contacts, to confirm this is a general fact about
`List`, not something specific to names:

```kotlin
fun main() {
    val colors = listOf("Red", "Green", "Blue")
    println(colors)
    for (color in colors) {
        println(color)
    }
}
```

Compiled and run this session:

```
$ kotlinc lab1_list.kt -include-runtime -d lab1_list.jar
$ java -jar lab1_list.jar
```

Real output:

```
[Red, Green, Blue]
Red
Green
Blue
```

The first line, `[Red, Green, Blue]`, is what `println` produces for an
entire `List` in one call — proving a `List` really does hold all three
values under the one name `colors`, not three separate values that
happen to sit near each other. The next three lines, one per color,
prove the `for` loop actually visited each element in the list, in the
order the list holds them, running `println(color)` once per visit.
This is called **iteration**: `for` doesn't know in advance how many
colors there are, and doesn't need to — it runs its body exactly once
per element, however many the list turns out to hold.

### Discard the Throwaway Example

`lab1_list.kt` is scratch, recorded in the verification folder, not
part of the contact-search program. What it proved — that a `List`
holds multiple values under one name, and that `for` visits every one
of them — is what `contacts`, above, relies on.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code, in order:

- **`val contacts = listOf("Alice", "Bob", "Carol")`** — the same `val`
  keyword and `=` initializer given full treatment in Lesson 0.1,
  naming a new value. `listOf`, given full treatment in this lesson's
  Header, is called with three string literals (full treatment already
  given for string literals in Lesson 0.1); its type,
  `List<String>` — a `List` whose type argument is `String`, per this
  lesson's own Header entry for type arguments — is inferred from the
  three `String` arguments given, the same type inference Lesson 0.1
  proved for a single value.
- **`println(contacts)`** — the same overloaded, `inline`,
  `System.out.println`-delegating function given full treatment in this
  lesson's Header. `contacts`, a `List<String>`, is not one of
  `println`'s specifically-typed overloads (`Int`, `Boolean`, `Double`,
  and the others quoted in Lesson 0.1), so this call resolves to the
  general `println(message: Any?)` overload, which calls `contacts`'s
  own real `toString()` — a method every `List` in Kotlin's standard
  library implements, producing the `[element, element, ...]` format
  the real output above shows.
- **`for (contact in contacts) { ... }`** — the `for` keyword, given
  full treatment in this lesson's Header, introducing a loop;
  `contact`, a new identifier (a programmer-chosen name, the same
  concept given full treatment in Lesson 0.2) naming whatever single
  element the loop is currently visiting; `in`, syntax connecting the
  loop variable to the collection being iterated; `contacts`, the same
  `List` declared one line above.
- **`println(contact)`** — the same `println` again, this time called
  once per iteration rather than once total. Each time it runs,
  `contact` holds a different `String` — first `"Alice"`, then
  `"Bob"`, then `"Carol"` — resolving each call to `println`'s general
  `Any?` overload the same way `println(contacts)` did above, since
  `contact` is a `String`, not one of the specifically-typed overloads.

### CS Lens

Holding many values of the same kind under one name, with a mechanism
to visit every one without knowing the count in advance, is one of the
most fundamental ideas in computing — up there with the function
concept Lesson 0.2 introduced. Also recognized in: an array in
essentially every programming language ever designed; a spreadsheet
column, holding many rows of the same kind of data, processed row by
row; a factory conveyor belt, processing one item at a time regardless
of how many total items are on the belt; a mail carrier's route, a
list of addresses visited one after another without needing to know
the total count before starting.

### SE Lens

`listOf` was chosen here, over `mutableListOf`, specifically because
this first version of `contacts` is never meant to change — the same
reasoning Lesson 0.1's own SE Lens gave for choosing `val` over `var`
by default. The alternative — always reaching for the mutable version
"just in case it's needed later" — costs something real: a `List` that
can never be modified is a guarantee a reader can trust without
checking the rest of the file, the same way `val` is a guarantee about
one value; defaulting to mutability everywhere would mean that
guarantee is never available anywhere, for any collection, even the
ones that genuinely never change. The next unit revisits this exact
choice once a genuine need for mutability actually appears.

### Commands Needed

The same `kotlinc ... -include-runtime -d ...` / `java -jar ...` pair
from Lesson 0.1 — no new commands, applied to a new file,
`ContactSearch.kt`, instead of `Calculator.kt`.

### Run It

Real output, `ContactSearch.kt` at its current state (verified this
session as `step1_contacts.kt`):

```
$ kotlinc ContactSearch.kt -include-runtime -d ContactSearch.jar
$ java -jar ContactSearch.jar
```

Real output:

```
[Alice, Bob, Carol]
Alice
Bob
Carol
```

### Connect

`contacts` now holds three names, and `for` can visit every one of
them. The next unit asks what happens when the contact list itself
needs to grow.

---

## Concept Unit: `MutableList`

### The Problem

`contacts`, declared with `listOf`, holds exactly three names —
permanently. A real contact-search program needs to be able to add a
new contact after the program starts, the same way Lesson 0.1's
`displayValue` needed to be reassignable after it was first set. Given
that Lesson 0.1 solved that exact problem for a single value by using
`var` instead of `val`, would you expect `List` to have a similarly
named mutable counterpart? If `contacts.add("Dave")` were attempted on
the `List` from Concept Unit 1 (declared with `listOf`, not something
else), what would you expect to happen — would it just work, the way
reassigning a `var` works, or would something stop it?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's `MutableList` concept for this lesson.
- **Files affected** — modified: `ContactSearch.kt`.
- **Change type** — replace (`listOf` becomes `mutableListOf`) and add
  (one new line calling `add`).
- **Location** — the `val contacts = listOf(...)` line from Concept
  Unit 1.
- **Dependencies** — none beyond Concept Unit 1.

### The New Code

```kotlin
val contacts = mutableListOf("Alice", "Bob", "Carol")
contacts.add("Dave")
```

### The Updated Project

```kotlin
1: fun main() {
2:     val contacts = mutableListOf("Alice", "Bob", "Carol")  // ← changed: listOf → mutableListOf
3:     contacts.add("Dave")                                    // ← new
4:     println(contacts)
5:     for (contact in contacts) {
6:         println(contact)
7:     }
8: }
```

`contacts` is now a `MutableList`, and a fourth name is added to it
immediately after creation, before anything reads or prints it.

### Introduce the Concept in Isolation

Two disposable scratch files this time — one proving `MutableList`
genuinely allows the change a plain `List` doesn't, and one proving
that a plain `List` genuinely refuses it, rather than assuming the
refusal without checking.

First, `verification/0.4/lab2_mutablelist.kt`, using colors again:

```kotlin
fun main() {
    val colors = mutableListOf("Red", "Green", "Blue")
    colors.add("Yellow")
    println(colors)
}
```

Compiled and run this session:

```
$ kotlinc lab2_mutablelist.kt -include-runtime -d lab2_mutablelist.jar
$ java -jar lab2_mutablelist.jar
```

Real output:

```
[Red, Green, Blue, Yellow]
```

`"Yellow"` really was appended — `MutableList` genuinely supports
growing after creation, the same way `var` supports reassignment.

Second, `verification/0.4/break2_list_no_add.kt`, attempting the
identical `add` call on a plain `List`:

```kotlin
fun main() {
    val colors = listOf("Red", "Green", "Blue")
    colors.add("Yellow")
    println(colors)
}
```

Compiled this session (deliberately, to observe the failure):

```
$ kotlinc break2_list_no_add.kt -include-runtime -d break2_list_no_add.jar
```

Real compiler output — this file was never run:

```
break2_list_no_add.kt:3:12: error: unresolved reference 'add'.
    colors.add("Yellow")
           ^^^
```

This is a genuinely different kind of error from Lesson 0.1's `val`
reassignment error: Kotlin isn't refusing to let something happen — it's
saying `add` doesn't exist at all on this value's type. A plain `List`
simply has no `add` method declared anywhere in its own real
interface; `MutableList` is a separate, real type that adds `add` (and
similar methods) on top of everything a plain `List` already offers.
This is called `List`/`MutableList`: two related but genuinely distinct
types, not one type with a hidden "locked" mode.

### Discard the Throwaway Examples

Both `lab2_mutablelist.kt` and `break2_list_no_add.kt` are scratch,
recorded in the verification folder, not part of the contact-search
program. What they proved — that `MutableList` supports `add` and a
plain `List` genuinely does not, as two distinct real types rather than
one type with a runtime flag — is what `contacts`'s own new
declaration, above, relies on and demonstrates.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`mutableListOf("Alice", "Bob", "Carol")`** — given full treatment in
  this lesson's Header: the mutable counterpart to `listOf`, called
  with the same three string literals as Concept Unit 1, now producing
  a `MutableList<String>` instead of a `List<String>`.
- **`contacts.add("Dave")`** — `MutableList.add`, given full treatment
  in this lesson's Header: an instance method, called on `contacts`,
  appending the string literal `"Dave"` to the end of the list. This
  call is a **statement**, not an **expression** consumed by anything —
  the same distinction Lesson 0.1 drew for `println`: `add` does return
  a `Boolean` (per its real signature, quoted in the Header), but
  nothing in this lesson's code reads that returned value; the call
  runs purely for its effect on `contacts`.

### CS Lens

A read-only view of data and a separate, explicitly-different mutable
view of essentially the same shape is a distinction that recurs beyond
this one pair of types. Also recognized in: a database view marked
read-only versus a table that accepts `UPDATE` statements; a physical
library book (read, but not rewritable by a borrower) versus the
library's own catalog record for it (which staff can update); a PDF
versus the original word-processor document it was exported from — same
content, deliberately different capabilities; a photograph versus its
original digital negative.

### SE Lens

Kotlin could have given `List` an `add` method that simply throws an
error at runtime if called on a "read-only" instance — some languages
and libraries do exactly this. Kotlin instead made `List` and
`MutableList` genuinely separate types, so the real compiler error
proven above happens the moment the code is *written*, not the moment
it happens to *run* down that particular path. The cost: Kotlin needs
two related type names instead of one, and choosing which one to
declare a given collection as is a decision made once, upfront —
exactly the decision this unit's own SE Lens (in Concept Unit 1) already
argued for defaulting toward the read-only `List`/`val` unless
mutability is a genuine, known requirement, which `contacts` — needing
`add` for a real, working contact-search program — actually is.

### Commands Needed

No new commands.

### Run It

Real output, `ContactSearch.kt` at its current state (verified this
session as `step2_contacts_mutable.kt`):

```
$ kotlinc ContactSearch.kt -include-runtime -d ContactSearch.jar
$ java -jar ContactSearch.jar
```

Real output:

```
[Alice, Bob, Carol, Dave]
Alice
Bob
Carol
Dave
```

Four names now, not three — `"Dave"` really was added before anything
printed the list.

### Connect

`contacts` can now grow after creation. The next unit introduces a
second, differently-shaped collection: one that holds a piece of data
*paired with* another piece of data, rather than a flat sequence.

---

## Concept Unit: `MutableMap`

### The Problem

Knowing a contact's *name* only gets a contact-search program halfway
there — the real goal is looking up that contact's *phone number*. A
`List` of names alone has no way to associate a second piece of data
(a number) with each name; adding a second, parallel `List` of phone
numbers would work, but would leave the program trusting that both
lists always stay in the exact same order, with no way for the
compiler to check that this stays true as the program grows. Given
that a `List` associates a position (first, second, third...) with each
value it holds, what kind of collection do you think could associate a
*name* with each value instead of a position? What would you call the
"position" side of that association, if it's not a number anymore?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's `Map` concept for this lesson.
- **Files affected** — modified: `ContactSearch.kt`.
- **Change type** — add (four new lines).
- **Location** — inside `main`, immediately after the `for` loop from
  Concept Unit 2.
- **Dependencies** — none beyond Concept Units 1–2.

### The New Code

```kotlin
val phoneBook = mutableMapOf<String, String>()
phoneBook["Alice"] = "555-0101"
phoneBook["Bob"] = "555-0102"
println(phoneBook)
for (entry in phoneBook) {
    println(entry.key)
    println(entry.value)
}
```

### The Updated Project

```kotlin
1:  fun main() {
2:      val contacts = mutableListOf("Alice", "Bob", "Carol")
3:      contacts.add("Dave")
4:      println(contacts)
5:      for (contact in contacts) {
6:          println(contact)
7:      }
8:      val phoneBook = mutableMapOf<String, String>()  // ← new
9:      phoneBook["Alice"] = "555-0101"                  // ← new
10:     phoneBook["Bob"] = "555-0102"                     // ← new
11:     println(phoneBook)                                // ← new
12:     for (entry in phoneBook) {                          // ← new
13:         println(entry.key)                               // ← new
14:         println(entry.value)                             // ← new
15:     }                                                      // ← new
16: }
```

The program now holds two collections: `contacts`, a flat list of
names, and `phoneBook`, a name-to-number lookup, plus a `for` loop
printing every one of `phoneBook`'s entries individually.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.4/lab3_map.kt`), storing
ages instead of phone numbers, to confirm this is a general fact about
`MutableMap`, not something specific to phone numbers:

```kotlin
fun main() {
    val ages = mutableMapOf<String, Int>()
    ages["Alice"] = 30
    ages["Bob"] = 25
    println(ages)
    for (entry in ages) {
        println(entry.key)
        println(entry.value)
    }
}
```

Compiled and run this session:

```
$ kotlinc lab3_map.kt -include-runtime -d lab3_map.jar
$ java -jar lab3_map.jar
```

Real output:

```
{Alice=30, Bob=25}
Alice
30
Bob
25
```

The first line, `{Alice=30, Bob=25}`, proves `ages` really does hold
both name-to-number associations under one name — printed with curly
braces and `key=value` pairs, a different real format than a `List`'s
square brackets. The `for` loop then visited each association in turn,
printing its key and its value on separate lines — proving iteration
works over a `Map` the same general way Concept Unit 1 proved it for a
`List`, just producing a different kind of element (a **key**/**value**
pair) each time instead of a single value. This is called a **`Map`**
(here, specifically a **`MutableMap`**): a collection associating each
unique key with exactly one value, instead of associating each value
with a numbered position the way a `List` does.

### Discard the Throwaway Example

`lab3_map.kt` is scratch, recorded in the verification folder, not part
of the contact-search program. What it proved — that a `MutableMap`
associates keys with values and that `for` visits every association —
is what `phoneBook`, above, relies on.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`val phoneBook = mutableMapOf<String, String>()`** — the same `val`
  and `=` already given full treatment. `mutableMapOf`, given full
  treatment in this lesson's Header, is called with no arguments here,
  producing an empty map; `<String, String>` supplies its type
  arguments explicitly — given full treatment in this lesson's Header —
  because with no initial entries to infer from, the compiler has
  nothing else to work out the key and value types from.
- **`phoneBook["Alice"] = "555-0101"`** — the real
  `MutableMap.set` operator, given full treatment in this lesson's
  Header: `phoneBook["Alice"]` on the left names the key; `=`, the same
  operator Lesson 0.1 gave full treatment for `val`/`var`
  initialization and Lesson 0.2 reused for reassignment, here
  triggering this specific `set` operator instead, because its
  left-hand side is a bracketed map access rather than a plain
  identifier; `"555-0101"`, a string literal, is the value stored.
- **`phoneBook["Bob"] = "555-0102"`** — the identical operator, storing
  a second key-value pair; `phoneBook` now holds two entries.
- **`println(phoneBook)`** — the same overloaded, `inline`,
  `System.out.println`-delegating function given full treatment in this
  lesson's Header, reappearing here; `phoneBook`, a `Map`, resolves to
  the general `Any?` overload the same way `contacts` did in Concept
  Unit 1, calling `phoneBook`'s own real `toString()`, producing the
  `{key=value, ...}` format the real output above shows.
- **`for (entry in phoneBook)`** — the same `for` keyword given full
  treatment in this lesson's Header, iterating `phoneBook` instead of
  `contacts`; `entry`, a new identifier, names whatever single element
  the loop is currently visiting. Because `phoneBook` is a `Map`, not a
  `List`, each element `for` produces is a real `Map.Entry`, given full
  treatment in this lesson's Header: an object holding one key and its
  matching value together, via its own two real, read-only properties.
- **`entry.key`** and **`entry.value`** — property access on that real
  `Map.Entry`: `.key` reads the real `public val key: K` property this
  lesson's Header quotes from `Map.Entry`'s actual declared source;
  `.value` reads the matching `public val value: V` property the same
  way. Neither can be reassigned — both are declared `val`, on an
  interface, exactly the immutability Lesson 0.1 proved the compiler
  enforces for any `val`.
- **`println(entry.key)`** and **`println(entry.value)`** — the same
  overloaded `println` function, called twice per loop iteration
  instead of once; both `entry.key` and `entry.value` are `String`s
  here, resolving each call to `println`'s general `Any?` overload.

### CS Lens

Associating a value with a chosen key, rather than a fixed numeric
position, is one of the most-used data organization ideas in computing.
Also recognized in: a dictionary, associating a definition with a word
rather than a page number; a phone book itself — this lesson's own
subject — associating a number with a name; a filesystem, associating a
file's actual data with a human-readable filename rather than a raw
disk address; every database table with a primary key, associating an
entire row of data with one chosen identifying value.

### SE Lens

This lesson deliberately never reads a value back out of `phoneBook` by
key (`phoneBook["Alice"]`, used to *look up* rather than *set*, never
appears in this lesson's own code) — only `for` iteration is used to
read it, in Concept Unit 4, next. This is a genuine, deliberate scope
limit, not an oversight: `Map`'s real key-lookup operator returns a
*nullable* type (`String?`, not plain `String`), because looking up a
key that was never stored has to produce *something*, and Kotlin's
answer is `null` rather than a crash — but nullability, what `?` means
and how to safely work with a value that might be absent, is Lesson
0.5's own entire dedicated subject, immediately following this one.
Introducing key-lookup here, before nullability has been taught at all,
would mean either leaving a real `?` in this lesson's own code
unexplained (which the Repetition Rule this curriculum follows does not
allow) or teaching nullability piecemeal, out of order, right when it
deserves a lesson of its own. Iterating with `for` sidesteps the issue
entirely for this lesson's own real needs, and Lesson 0.5 picks up
key-lookup, and the `?` it returns, directly.

### Commands Needed

No new commands.

### Run It

Real output, `ContactSearch.kt` at its current state (verified this
session as `step3_phonebook.kt`):

```
$ kotlinc ContactSearch.kt -include-runtime -d ContactSearch.jar
$ java -jar ContactSearch.jar
```

Real output:

```
[Alice, Bob, Carol, Dave]
Alice
Bob
Carol
Dave
{Alice=555-0101, Bob=555-0102}
Alice
555-0101
Bob
555-0102
```

### Connect

The program now holds two real, working collections: a list of names
and a name-to-number lookup. The last unit in this lesson puts them
together into an actual search.

---

## Concept Unit: Searching with `for` and `==`

### The Problem

A phone book that only ever prints *everything* it holds isn't
actually useful for looking someone up — the real goal is: given one
specific name, find *that one* entry and report only its number.
Concept Unit 1 already proved `for` visits every element in turn; Lesson
0.3 already proved `==` compares two values and produces a `Boolean`.
Given both of those, and given that `if` (also from Lesson 0.3) runs a
branch only when its condition is `true`, what do you think combining
all three — a loop, a comparison, and a condition — inside one `for`
body would actually accomplish? What would happen to the entries that
*don't* match the name being searched for?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch,
  completing the BRD's "Throwaway: Tiny contact/search program"
  practice item.
- **Files affected** — modified: `ContactSearch.kt`.
- **Change type** — add (one new value declaration and one new `for`
  loop with a nested `if`).
- **Location** — inside `main`, immediately after the `for` loop from
  Concept Unit 3.
- **Dependencies** — none beyond Concept Units 1–3.

### The New Code

```kotlin
val searchName = "Bob"
for (entry in phoneBook) {
    if (entry.key == searchName) {
        println(entry.value)
    }
}
```

### The Updated Project

```kotlin
1:  fun main() {
2:      val contacts = mutableListOf("Alice", "Bob", "Carol")
3:      contacts.add("Dave")
4:      println(contacts)
5:      for (contact in contacts) {
6:          println(contact)
7:      }
8:      val phoneBook = mutableMapOf<String, String>()
9:      phoneBook["Alice"] = "555-0101"
10:     phoneBook["Bob"] = "555-0102"
11:     println(phoneBook)
12:     for (entry in phoneBook) {
13:         println(entry.key)
14:         println(entry.value)
15:     }
16:     val searchName = "Bob"                // ← new
17:     for (entry in phoneBook) {            // ← new
18:         if (entry.key == searchName) {     // ← new
19:             println(entry.value)           // ← new
20:         }                                   // ← new
21:     }                                        // ← new
22: }
```

Lines 1–15 are exactly as Concept Unit 3 left them; only the search
logic, lines 16–21, is new. `main` now performs a real, working search: it visits every entry in
`phoneBook`, and prints a number only for the one entry whose key
actually matches `searchName`.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.4/lab4_search.kt`), searching
the ages map from Concept Unit 3's own lab instead of phone numbers, to
confirm this search pattern is general:

```kotlin
fun main() {
    val ages = mutableMapOf<String, Int>()
    ages["Alice"] = 30
    ages["Bob"] = 25
    val searchName = "Bob"
    for (entry in ages) {
        if (entry.key == searchName) {
            println(entry.value)
        }
    }
}
```

Compiled and run this session:

```
$ kotlinc lab4_search.kt -include-runtime -d lab4_search.jar
$ java -jar lab4_search.jar
```

Real output:

```
25
```

Only `25`, Bob's age — not `30` (Alice's), and nothing at all for any
entry that isn't Bob — proving the `if` inside the `for` really did
filter which entries produced output, letting every non-matching entry
run through the loop body silently, with no visible effect, while the
one matching entry's branch actually ran. This is called **searching by
iteration**: visiting every element in a collection, checking each one
against a condition, and acting only on the ones that match — the most
basic form of search a program can perform, needing nothing beyond a
loop, a comparison, and a condition, all three already fully
established in earlier lessons.

### Discard the Throwaway Example

`lab4_search.kt` is scratch, recorded in the verification folder, not
part of the contact-search program. What it proved — that combining
`for`, `==`, and `if` finds and reports only the one matching entry — is
what this lesson's own real search, above, relies on.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`val searchName = "Bob"`** — the same `val` and string-literal
  syntax already given full treatment, naming the one value this unit's
  search looks for.
- **`for (entry in phoneBook)`** — the same `for` keyword given full
  treatment in this lesson's Header, iterating `phoneBook`; `entry`,
  each time through the loop, is one real `Map.Entry`, given full
  treatment in this lesson's Header, holding one key and its matching
  value together.
- **`if (entry.key == searchName)`** — `if`, given full treatment in
  Lesson 0.3, introducing a condition; `entry.key`, reading the current
  entry's real `key` property (declared on `Map.Entry` in this lesson's
  Header); `==`, the comparison operator given full treatment in Lesson
  0.3, checking whether this entry's key equals `searchName`'s current
  value (`"Bob"`).
- **`println(entry.value)`** — the same overloaded, `inline`,
  `System.out.println`-delegating function given full treatment in this
  lesson's Header, called only when the `if` condition above is `true`
  — reading `entry`'s real `value` property, the matching phone number,
  and printing it.

### CS Lens

Checking every element of a collection against a condition, one at a
time, until (or unless) a match is found, is the simplest possible
search algorithm — called a **linear search**, because it examines
elements in a straight line, one after another, with no shortcuts.
Also recognized in: scanning a bookshelf title by title looking for one
specific book; a bouncer checking a physical guest list name by name;
a `Ctrl+F` "find" feature scanning a document from the top; a customs
officer checking each passenger's passport against a watchlist, one at
a time. This curriculum will meet faster search strategies — ones that
don't need to check every element — starting in Stage 14's "Searching"
lesson, once sorted data makes a shortcut possible.

### SE Lens

This search keeps looping through *every* entry in `phoneBook` even
after it already finds the match — nothing stops the loop early. For a
phone book with two entries, this costs nothing anyone would notice;
for a phone book with a million entries, it means up to 999,999
unnecessary comparisons after the real answer was already found. This
lesson deliberately leaves that inefficiency in place: stopping a loop
early (`break`, and the broader question of algorithmic efficiency this
curriculum will name formally as Big-O) is Stage 5's own subject, not
this one's, and a `for` loop that always checks every element is the
honest, complete picture of what this lesson's own tools — `for`, `==`,
and `if`, nothing more — can express on their own.

### Commands Needed

No new commands.

### Run It

Real output, `ContactSearch.kt`'s complete, final state for this lesson
(verified this session as `step4_search.kt`):

```
$ kotlinc ContactSearch.kt -include-runtime -d ContactSearch.jar
$ java -jar ContactSearch.jar
```

Real output:

```
[Alice, Bob, Carol, Dave]
Alice
Bob
Carol
Dave
{Alice=555-0101, Bob=555-0102}
Alice
555-0101
Bob
555-0102
555-0102
```

The final line, `555-0102`, is the real result of searching
`phoneBook` for `"Bob"` — Bob's number, and only Bob's number, printed
exactly once.

### Connect

This lesson's contact-search program now performs one real, complete
search: given a name, it finds and reports the matching phone number,
built entirely from `for`, `==`, and `if`, each already established in
earlier lessons and combined here for the first time. This is the last
new concept this lesson introduces.

---

## Connect the Pieces

Follow `phoneBook` and `searchName` through every unit this lesson
built, using `ContactSearch.kt`'s real final state:

1. `contacts`, a `MutableList<String>` (Concept Units 1–2), is built
   with three names and grown to four with `add("Dave")` — printed as a
   whole (`[Alice, Bob, Carol, Dave]`) and then one name at a time via
   `for`.
2. `phoneBook`, a `MutableMap<String, String>` (Concept Unit 3), starts
   empty and is filled with two entries via the real `set` operator,
   `phoneBook["Alice"] = "555-0101"` and `phoneBook["Bob"] =
   "555-0102"` — printed as a whole (`{Alice=555-0101, Bob=555-0102}`)
   and then key by key and value by value via `for`, reading each real
   `Map.Entry`'s `key` and `value` properties.
3. `searchName` is set to `"Bob"` (Concept Unit 4).
4. `for (entry in phoneBook)` runs a second time, checking
   `entry.key == searchName` for each of the two entries in turn: for
   `"Alice"`, the comparison is `false`, and the `if` branch does not
   run; for `"Bob"`, the comparison is `true`, and `println(entry.value)`
   runs, printing `"555-0102"`.

Ten lines of real, verified terminal output are the complete result of
a program that holds many values in two different shapes — a flat list
and a key-value lookup — and searches one of them for real. `Map`'s own
key-lookup operator, `phoneBook["Alice"]`, and the `String?` it returns,
is picked up directly in Lesson 0.5, on nullability; `list.map { ... }`
and `list.filter { ... }`, the higher-order collection operations this
lesson's own concept list gestures toward but does not use, wait for
Lesson 0.9, once lambdas — the syntax those two functions actually
require — have been taught in full. `ContactSearch.kt` itself is
discarded here; Lesson 0.5 returns to `Calculator.kt`.
