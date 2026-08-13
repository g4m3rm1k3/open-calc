# Lesson 2: A Column That Doesn't Know What It Holds Yet

**What you will build**
The real `Column` class hierarchy — an abstract base class, plus
`IntegerColumn` and `TextColumn` subclasses — and a `Schema` class that
holds a heterogeneous, runtime-built list of them. This is the concrete
foundation the whole project's "runtime-defined schema" design depends
on: `CREATE TABLE games (id INTEGER, player TEXT, score INTEGER)` will
eventually build a `Schema` out of exactly this hierarchy, at runtime,
without the engine ever needing a C++ class named `Game`.

**What you need to know first:** Lesson 0 — `extern "C"`, compiling C++
to a shared library. This lesson doesn't touch the FFI boundary yet;
it's the first real project file, pure C++ class design, in-memory only.

**Terms introduced in this lesson:**
- **Abstract class** — a class with at least one function it declares
  but doesn't implement, which means the class itself can never be
  directly instantiated — it exists purely to define a shared interface
  every subclass is required to implement. `Column` is this project's
  first one.
- **Pure virtual function** — a member function declared with `= 0`
  instead of a body, marking it as the thing that makes its class
  abstract. A subclass must provide a real implementation, or it becomes
  abstract too.
- **Polymorphism** — calling a function through a base-class reference or
  pointer and having the *actual* object's own version run — decided at
  runtime, based on what the object really is, not what type the
  reference is declared as. Proven directly, with real output, in this
  lesson's first Concept Unit.
- **`explicit`** — a keyword on a constructor that takes exactly one
  argument, blocking C++'s own default behavior of quietly using that
  constructor to convert a value of the argument's type into the class
  type wherever one is expected, with no cast written anywhere. Proven
  directly, by contrast, in this lesson's first Concept Unit.
- **`override`** — a keyword on a function that's meant to implement a
  base class's virtual function, checked by the compiler against the
  base class's real signature — a real, if optional, safety net: if the
  base class's signature ever changes and this one no longer matches,
  `override` turns that silent mismatch into a real compile error
  instead of quietly declaring a new, unrelated function that happens
  to share a name.

**Objects and methods used**
- **`std::string`**
  - *What it is:* the C++ standard library's own real string type — a
    real, growable, owned sequence of characters, not a raw
    fixed-size character array.
  - *Implementation:* `std::string s = "text";` copies the literal's
    characters into `s`'s own, independently-owned storage; `std::string`
    manages its own memory automatically (grows, copies, and frees
    itself as needed) the same way `std::vector` does.
  - *Its use:* every real piece of text this project's own classes hold
    — `Column::name`, and every `type_name()`'s own return value.
- **`std::cout` / `std::endl`**
  - *What they are:* `std::cout` is the real, standard output stream —
    writing to it prints to the real terminal; `std::endl` writes a
    real newline character and additionally forces any buffered output
    to actually appear immediately, rather than waiting.
  - *Implementation:* `std::cout << value` is a real, chainable
    function call — `operator<<` — overloaded for every built-in type
    and for `std::string`; `std::cout << a << b;` is two real calls
    chained together, not special syntax.
  - *Its use:* every real, verified "Real output" shown in this lesson
    (and every lesson since) is produced by a real `std::cout << ...`
    call in the actual code being run — never predicted or written from
    memory.
- **`std::vector<T>`**
  - *What it is:* a growable, contiguous array — the C++ standard
    library's default general-purpose sequence container.
  - *Implementation:* `std::vector<T> v;` starts empty; `v.push_back(x)`
    appends an element, growing the vector's own internal storage as
    needed; a real, if simplified, sketch of its own signature relevant
    here: `template<class T> class vector { void push_back(T&& value); /* ... */ };`
  - *Its use:* `Schema::columns`, this lesson's own second Concept Unit
    — a runtime-built, growable list of every `Column` a table has.
- **`std::unique_ptr<T>`**
  - *What it is:* a smart pointer that *owns* a single heap-allocated
    object — when the `unique_ptr` itself is destroyed (goes out of
    scope, or the container holding it is destroyed), it automatically
    deletes the object it owns. No two `unique_ptr`s can own the same
    object at once — ownership can be *moved* from one to another, never
    copied.
  - *Implementation:* `std::unique_ptr<Column> p = std::make_unique<IntegerColumn>("id");`
    — `p` holds a real pointer internally, plus the guarantee that its
    destructor calls `delete` on it exactly once.
  - *Its use:* `Schema::columns` holds `std::unique_ptr<Column>`, not
    `Column` itself and not a raw `Column*` — this lesson's second
    Concept Unit proves directly why a bare `Column` won't work, and
    `unique_ptr` is what makes owning a *heap-allocated*, polymorphic
    `Column` safe without writing a manual `delete` anywhere.
- **`std::make_unique<T>(args...)`**
  - *What it is:* a function that allocates a new `T` on the heap,
    constructs it with the given arguments, and returns it already
    wrapped in a `std::unique_ptr<T>` — the standard, recommended way to
    create a `unique_ptr`, rather than writing `std::unique_ptr<T>(new T(...))`
    by hand.
  - *Implementation:* `template<class T, class... Args> unique_ptr<T> make_unique(Args&&... args);`
    — forwards its arguments directly to `T`'s constructor.
  - *Its use:* `std::make_unique<IntegerColumn>("id")`, this lesson's own
    real construction of every `Column` added to a `Schema`.

---

## Concept Unit: Abstract Base Class — a Column That Only Promises What Every Column Can Do

### The Problem

A `Schema` needs to hold columns of genuinely different kinds — an
`INTEGER` column, a `TEXT` column, and (later lessons) more — without the
engine's own code caring, case by case, which kind it's looking at right
now. What C++ construct lets code hold "a column" and call one shared
operation on it, while each real kind of column answers that call
differently?

### Introduce the Concept in Isolation

A throwaway, minimal version — no `Schema` yet, just proving the
mechanism. In the same `pocketdb/` folder Lesson 0 created, save the
following as `column1.cpp`:

```cpp
#include <iostream>
#include <string>

class Column
{
public:
    virtual ~Column() = default;
    virtual std::string type_name() const = 0;
};

class IntegerColumn : public Column
{
public:
    std::string type_name() const override { return "INTEGER"; }
};

class TextColumn : public Column
{
public:
    std::string type_name() const override { return "TEXT"; }
};

int main()
{
    IntegerColumn id_column;
    TextColumn name_column;

    Column& first = id_column;
    Column& second = name_column;

    std::cout << first.type_name() << std::endl;
    std::cout << second.type_name() << std::endl;
}
```

Compiled and run from inside `pocketdb/`:

```bash
g++ -std=c++17 -Wall -o column1.exe column1.cpp
./column1.exe
```

Real output:

```text
INTEGER
TEXT
```

*What this proves:* `first` and `second` are both declared as plain
`Column&` — nothing at that declaration says which real kind of column
either one is. Calling `.type_name()` through that `Column&` still ran
each object's *own* real override — `IntegerColumn`'s version for
`first`, `TextColumn`'s for `second` — decided at runtime by what the
object actually is, not by the declared reference type. This is called
**polymorphism**.

A second, real proof — that `Column` genuinely cannot be instantiated on
its own, not just conceptually but as an enforced compiler rule. Save
this as a second file, `column_abstract_fail.cpp`, also in `pocketdb/`
(the `Column` class it refers to is the same one from `column1.cpp`,
copied into this new file too, since each `.cpp` file compiles
independently and needs its own copy of any class it uses):

```cpp
#include <iostream>
#include <string>

class Column
{
public:
    virtual ~Column() = default;
    virtual std::string type_name() const = 0;
};

int main()
{
    Column c;
    std::cout << c.type_name() << std::endl;
}
```

Attempting to compile it:

```bash
g++ -std=c++17 -Wall -o column_abstract_fail.exe column_abstract_fail.cpp
```

Real, captured compiler error — compilation fails, no `.exe` is
produced:

```text
error: cannot declare variable 'c' to be of abstract type 'Column'
note:   because the following virtual functions are pure within 'Column':
note:     'virtual std::string Column::type_name() const'
```

*What this proves:* `= 0` on `type_name()` doesn't just mean "no default
implementation" — it means the compiler actively refuses to let anyone
construct a plain `Column`, at compile time, before the program ever
runs. This is called an **abstract class** — `Column` exists purely to
define a shared interface (`type_name()`), never to be used directly.

A third, real proof — every constructor in this lesson's own code
(`IntegerColumn`, `TextColumn`) is marked `explicit`; what that keyword
actually does, checked directly by removing it. Save this as
`no_explicit.cpp`:

```cpp
#include <iostream>
#include <string>

class TextColumn
{
public:
    std::string name;
    TextColumn(std::string name) : name(std::move(name)) {}
};

void print_column_name(TextColumn column)
{
    std::cout << column.name << std::endl;
}

int main()
{
    print_column_name(std::string("player"));
}
```

Compiled and run:

```bash
g++ -std=c++17 -Wall -o no_explicit.exe no_explicit.cpp
./no_explicit.exe
```

Real output — this compiles and runs, with no cast or `TextColumn(...)`
call written anywhere in `main()`:

```text
player
```

`print_column_name` takes a `TextColumn`, but `main()` passed a plain
`std::string` — and it worked anyway. The identical code, with `explicit`
added to the one-argument constructor. Save this as `with_explicit.cpp`:

```cpp
#include <iostream>
#include <string>

class TextColumn
{
public:
    std::string name;
    explicit TextColumn(std::string name) : name(std::move(name)) {}
};

void print_column_name(TextColumn column)
{
    std::cout << column.name << std::endl;
}

int main()
{
    print_column_name(std::string("player"));
}
```

Attempting to compile:

```bash
g++ -std=c++17 -Wall -o with_explicit.exe with_explicit.cpp
```

Real, captured compiler error — the identical call that worked a moment
ago now fails:

```text
error: could not convert 'std::string("player")' from 'std::string' to 'TextColumn'
```

*What this proves:* a constructor taking exactly one argument is, by
default, also a real, silent *conversion* — C++ will use it automatically
to turn a `std::string` into a `TextColumn` anywhere a `TextColumn` is
expected, with no cast, no `TextColumn(...)` call, nothing in the
calling code hinting a conversion even happened. This is called an
**implicit conversion**, and `explicit` is the keyword that turns it
off — every constructor in this project taking one argument (`Column`'s,
`IntegerColumn`'s, `TextColumn`'s) is marked `explicit` specifically so
a `std::string` can never accidentally become a `Column` this way.

### Discard the Throwaway Example

All four files are deleted — the classes' real *shapes* are kept (in the
next unit's real, permanent file), but none of these throwaway files, nor
any of their `main()`s, survive:

```bash
rm column1.cpp column1.exe column_abstract_fail.cpp column_abstract_fail.exe
rm no_explicit.cpp no_explicit.exe with_explicit.cpp
```

(`with_explicit.cpp` never actually produced a `.exe` — its whole point
was the compiler error, not a running program.)

### Mechanical Walkthrough

- `virtual ~Column() = default;` — a virtual destructor. Skipped over
  without full explanation would be a mistake here: without it, deleting
  a `Column*` that's actually pointing at an `IntegerColumn` would only
  run `Column`'s own destructor, not `IntegerColumn`'s — `virtual` is
  what makes the *real* object's destructor run, the identical mechanism
  `type_name()` uses for its own dispatch. `= default` asks the compiler
  to generate the ordinary, empty destructor body — there's nothing
  extra to clean up in `Column` itself, but the destructor still needs
  to exist and be `virtual`.
- `virtual std::string type_name() const = 0;` — the pure virtual
  function itself, covered fully in Terms Introduced above.
- `class IntegerColumn : public Column` — ordinary single inheritance:
  `IntegerColumn` *is a* `Column`, inheriting its interface and required
  to supply every pure virtual function `Column` declared.
  `: public Column` specifically (not `private`/`protected` inheritance)
  means `IntegerColumn` is usable anywhere a `Column` is expected — the
  exact thing `Column& first = id_column;` below relies on.
- `std::string type_name() const override { return "INTEGER"; }` —
  `override` is not required by the compiler here, but states, checked
  by the compiler, "this is meant to implement a virtual function from a
  base class" — if `Column`'s own signature ever changed and this one
  no longer matched, `override` turns that mismatch into a compile
  error instead of a silent new, unrelated function.
- `Column& first = id_column;` — a reference, not a copy — `first`
  refers to the *same* `id_column` object, just through a `Column`-typed
  name. This is what makes the polymorphism proof possible at all: the
  reference's declared type (`Column`) is deliberately less specific
  than the real object's type (`IntegerColumn`).
- `first.type_name()` — the call that actually demonstrates dispatch:
  which function body runs is decided by `first`'s *real* underlying
  object at the moment of the call, not by the `Column&` declaration.

### CS Lens

This is **runtime polymorphism**, implemented via a **virtual function
table (vtable)** — every object of a class with virtual functions
secretly carries a pointer to a table of real function addresses,
specific to its own actual class; a virtual call looks up the right
address in that table at runtime instead of the compiler picking one
address permanently at compile time. Also recognized in: any plugin
system (a shared interface, many real implementations chosen at
runtime), GUI frameworks calling an overridden `onClick`/`onDraw`
through a base widget type, and — directly relevant to this project's
own `README.md` — the exact shape `Schema`/`Column` needs so
`CREATE TABLE`'s engine code can treat every column identically while
each one still behaves according to its own real type.

### SE Lens

Why build a `Column` class hierarchy at all, instead of one `Column`
struct with a `type` field (an `enum`) and an `if`/`switch` on that field
everywhere a column's type matters? The `enum`-and-`switch` version
technically works, but every new place in the codebase that needs to
handle columns differently by type has to remember to write (and keep
correct) its own `switch`. The class-hierarchy version puts each type's
own behavior *inside* that type's own class — adding a `RealColumn`
later means writing one new class, not finding and updating every
scattered `switch` across the codebase. The real cost this project
accepts: a class per column type is more files/declarations than one
struct with a tag — a tradeoff worth naming honestly, not just asserting
the class version is strictly better.

### Commands Needed

Both compile commands were already shown above, alongside each file.
`-std=c++17` requests the C++17 standard explicitly, rather than
whatever `g++`'s own default happens to be; `-Wall` enables the
compiler's standard set of extra warnings — worth having on from this
project's first real file, not added later once a habit of ignoring
warnings has already formed.

### Run It

Already shown above, in "Introduce the Concept in Isolation" — both the
working polymorphism output and the real, captured compiler error.

### Connection

`Column`'s bare interface — nothing but a `type_name()` — is enough to
prove polymorphism works, but not enough to be useful: a real `Schema`
needs to know each column's *name*, not just its type, and needs to hold
more than two of them, of unpredictable kinds, decided at runtime. Both
land in the next unit.

---

## Concept Unit: `Schema` — Owning a Runtime-Built List of Different Real Types

### The Problem

A `Schema` needs to hold an arbitrary number of columns, of genuinely
different concrete types (`IntegerColumn`, `TextColumn`, and more in
later lessons), decided only once `CREATE TABLE` actually runs — not
known, or nameable, at compile time. What container can hold that?

### Introduce the Concept in Isolation

A first, natural-seeming attempt — a `std::vector<Column>`, storing
columns *by value* — proven broken on purpose, before the real, working
version. In the same `pocketdb/` folder, save this as
`schema_by_value_fail.cpp`:

```cpp
#include <string>
#include <vector>

class Column
{
public:
    std::string name;
    explicit Column(std::string name) : name(std::move(name)) {}
    virtual ~Column() = default;
    virtual std::string type_name() const = 0;
};

class IntegerColumn : public Column
{
public:
    explicit IntegerColumn(std::string name) : Column(std::move(name)) {}
    std::string type_name() const override { return "INTEGER"; }
};

int main()
{
    std::vector<Column> columns;
    columns.push_back(IntegerColumn("id"));
}
```

Attempting to compile it:

```bash
g++ -std=c++17 -Wall -o schema_by_value_fail.exe schema_by_value_fail.cpp
```

Real, captured compiler error — compilation fails, no `.exe` is
produced; trimmed to its essential lines, since the real error is a long
template-instantiation trace, standard for C++ container errors, not
reproduced in full here:

```text
error: invalid new-expression of abstract class type 'Column'
note:   because the following virtual functions are pure within 'Column':
note:     'virtual std::string Column::type_name() const'
```

*What this proves:* `std::vector<Column>` needs to be able to construct
and copy real `Column` objects internally to manage its own storage —
and `Column`, proven abstract in the previous unit, can never be
directly constructed, by anyone, including `std::vector` itself. Storing
by value is not just inconvenient here; it's a compile error, for the
same underlying reason the previous unit's bare `Column c;` was.

The real, working version — a `Schema` holding `std::unique_ptr<Column>`
instead of bare `Column`. This is the project's real, permanent file, not
a throwaway — save it as `schema.cpp`, in `pocketdb/`:

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <memory>

class Column
{
public:
    std::string name;

    explicit Column(std::string name) : name(std::move(name)) {}
    virtual ~Column() = default;
    virtual std::string type_name() const = 0;
};

class IntegerColumn : public Column
{
public:
    explicit IntegerColumn(std::string name) : Column(std::move(name)) {}
    std::string type_name() const override { return "INTEGER"; }
};

class TextColumn : public Column
{
public:
    explicit TextColumn(std::string name) : Column(std::move(name)) {}
    std::string type_name() const override { return "TEXT"; }
};

class Schema
{
public:
    std::vector<std::unique_ptr<Column>> columns;

    void add_column(std::unique_ptr<Column> column)
    {
        columns.push_back(std::move(column));
    }
};

int main()
{
    Schema schema;
    schema.add_column(std::make_unique<IntegerColumn>("id"));
    schema.add_column(std::make_unique<TextColumn>("player"));
    schema.add_column(std::make_unique<IntegerColumn>("score"));

    for (const auto& column : schema.columns)
    {
        std::cout << column->name << " " << column->type_name() << std::endl;
    }
}
```

Compiled and run from inside `pocketdb/`:

```bash
g++ -std=c++17 -Wall -o schema.exe schema.cpp
./schema.exe
```

Real output:

```text
id INTEGER
player TEXT
score INTEGER
```

The `for` loop's own real behavior, traced iteration by iteration
against `schema.columns`' actual, runtime-built contents:

#### Execution Trace

```text
Iteration 1: column = columns[0] → type_name() = "INTEGER", because
             columns[0] is the IntegerColumn add_column("id") built,
             so its real vtable is IntegerColumn's, not Column's
Iteration 2: column = columns[1] → type_name() = "TEXT", because
             columns[1] is the TextColumn add_column("player") built —
             a genuinely different real object than iteration 1's
Iteration 3: column = columns[2] → type_name() = "INTEGER", because
             columns[2] is a second, separate IntegerColumn built by
             add_column("score") — the same real type as iteration 1's
             object, but a genuinely different instance of it
```

Each iteration's `column->type_name()` call resolves to a different
real override not because the loop body changes at all between
iterations — it's the identical line, `column->type_name()`, every
time — but because `column` itself refers to a genuinely different real
object each time, and dispatch (proven in the previous unit) reads the
*real* object's own vtable, not the loop variable's declared type.

*What this proves:* `schema.columns` genuinely holds three different
real objects — two `IntegerColumn`s and one `TextColumn` — added one
call at a time, in an order chosen at runtime by whoever called
`add_column`. The loop's own `column->type_name()` call dispatches
polymorphically, exactly as the previous unit proved, giving each
column's own real answer (`INTEGER`, `TEXT`, `INTEGER`) without the loop
itself containing a single `if` about column types.

### Discard the Throwaway Example

The broken by-value attempt is deleted outright — it never becomes part
of the project, only proof of why `unique_ptr` is the real answer:

```bash
rm schema_by_value_fail.cpp schema_by_value_fail.exe
```

`schema.cpp` (and `schema.exe`) is *not* deleted — it's this lesson's
real deliverable, kept as the project's actual first permanent file,
sitting in `pocketdb/` alongside `engine.cpp`, `call_engine.py`, and
`call_double_no_types.py` from Lessons 0 and 1.

### Mechanical Walkthrough

- `explicit Column(std::string name)` / `explicit IntegerColumn(std::string name)` /
  `explicit TextColumn(std::string name)` — reappearing exactly (this
  unit's own first Concept Unit already proved, by contrast, what
  `explicit` prevents: a real, silent implicit conversion from
  `std::string` to the class type).
- `std::vector<std::unique_ptr<Column>> columns;` — `Schema`'s own real
  storage: a growable list, each slot holding ownership of one
  heap-allocated `Column` subclass object, not the object itself.
- `void add_column(std::unique_ptr<Column> column)` — takes ownership of
  a `unique_ptr` *by value*, meaning the caller's own `unique_ptr` is
  required to transfer ownership in (via `std::move`, next), not merely
  lend a reference.
- `columns.push_back(std::move(column));` — `std::move` doesn't move
  anything by itself; it casts `column` into a form the compiler treats
  as "safe to steal from," which is what lets `push_back` take real
  ownership of the pointer inside `column` instead of trying (and, for a
  `unique_ptr`, failing to compile) to *copy* it — `unique_ptr` has no
  copy constructor at all, on purpose, since two owners of one heap
  object would mean it eventually gets `delete`d twice.
- `std::make_unique<IntegerColumn>("id")` — covered fully in Objects and
  methods used, above; constructs a real `IntegerColumn` on the heap and
  returns it already owned by a fresh `unique_ptr`.
- `schema.add_column(std::make_unique<IntegerColumn>("id"));` —
  `make_unique`'s returned, temporary `unique_ptr` is passed directly
  into `add_column`, which takes ownership of it — no separate named
  variable needed for a value only ever used once.
- `for (const auto& column : schema.columns)` — a range-based `for`
  loop over `schema.columns`; `column`'s own type is
  `const std::unique_ptr<Column>&` — a reference to each `unique_ptr` in
  turn, not a copy (which, again, wouldn't compile for a `unique_ptr`
  anyway).
- `column->type_name()` — `->` dereferences the `unique_ptr` to reach
  the real `Column` it owns, then calls the virtual function on it —
  the identical polymorphic dispatch the first unit proved, now reached
  through a smart pointer instead of a plain reference.

### CS Lens

This is **RAII (Resource Acquisition Is Initialization)** — tying a
resource's lifetime (here, heap memory) directly to an object's own
lifetime (the `unique_ptr`), so the resource is released automatically
and deterministically when that object's scope ends, with no manual
`delete` written anywhere in this lesson's code. Also recognized in:
file handles closed automatically when a wrapper object goes out of
scope, database connections released the same way, and — a repo-internal
comparison worth naming directly — this is the same underlying idea
`pocket-inventory-wpf`'s own `using` statement around `SqliteConnection`
teaches, in a garbage-collected language that still needed an explicit
mechanism for *deterministic*, not just *eventual*, cleanup.

### SE Lens

Why `unique_ptr` specifically, instead of a raw `Column*` with a manual
`delete` written in `Schema`'s own destructor? A raw pointer version
would work, today — but it requires *remembering* to write that
destructor correctly, and remembering it again at every other place
`Schema` might be copied, moved, or destroyed early due to an exception.
`unique_ptr` makes forgetting structurally impossible: the compiler
generates the correct cleanup automatically, at every one of those
exit paths, because it's baked into `unique_ptr`'s own destructor, not
hand-written once and hoped to be correct everywhere. The real cost: an
extra, small heap allocation per `unique_ptr`, and one extra
indirection (`column->` instead of `column.`) at every use — a
deliberate, standard trade of a small runtime cost for eliminating an
entire class of memory-management bugs by construction.

### Commands Needed

Both compile commands were already shown above, alongside each file.

### Run It

Already shown above, in "Introduce the Concept in Isolation" — both the
real, trimmed compiler error from the by-value attempt, and the real,
correct three-line output from the working `unique_ptr`-based `Schema`.

### Connection

`Schema` can now hold a real, runtime-built, heterogeneous list of
columns — proven, not asserted, with real output. It still exists only
inside one `main()` function, in memory, gone the instant the program
ends. Turning this into something Python can actually reach — a real
`create_table` call across the `extern "C"` boundary Lesson 0 proved
works — is Slice S01's next lesson.

---

## Closing

### Connect the Pieces

`Column` was built as an abstract base class — a pure virtual
`type_name()`, proven directly to make `Column` itself uninstantiable,
both alone (`Column c;`) and inside a `std::vector<Column>`.
`IntegerColumn` and `TextColumn` each implement that one required
function differently, and calling it through a `Column&` — or, in the
working `Schema`, through a `std::unique_ptr<Column>&` reached via a
range-based loop — dispatches to each object's own real version, proven
with real, correct output both times: `INTEGER`/`TEXT` in the first
unit's isolated proof, and `id INTEGER` / `player TEXT` / `score
INTEGER` in `Schema`'s own real, runtime-built list. Two different
`IntegerColumn`s and one `TextColumn`, added one `add_column` call at a
time, at runtime, with no code anywhere in `Schema` itself that
mentions "integer" or "text" by name.

### What Breaks Without This

Already shown directly above, twice: try to declare a bare `Column`, or
try to store one by value in a `std::vector<Column>`, and the real
compiler refuses both, citing the exact same pure virtual function as
the reason. Switching to `std::unique_ptr<Column>` — shown working,
with real output — is what actually fixes it, not a smaller or
differently-shaped workaround.

### Exercises

- Add a `RealColumn` (for a `REAL`/floating-point column type) to the
  hierarchy — a new subclass, `type_name()` returning `"REAL"` — and add
  one to `Schema` alongside the existing three; confirm real, correct
  output for all four.
- Add a second pure virtual function to `Column`,
  `virtual std::string sql_default() const = 0;`, returning `"0"` for
  `IntegerColumn` and `"''"` for `TextColumn`. Confirm `RealColumn`
  (from the previous exercise) now fails to compile until you give it
  its own implementation too — and read the real compiler error that
  proves it.
- Try storing `schema.columns` as `std::vector<Column*>` (raw pointers,
  no `unique_ptr`) instead, using `new` directly in `add_column`. Confirm
  it compiles and runs correctly — then explain, in your own words,
  what this lesson's own SE Lens says is now missing, and what would
  eventually go wrong that `unique_ptr` prevented.

### Definition of Done

- [ ] `Column`, `IntegerColumn`, `TextColumn`, and `Schema` all exist in
      your own real `.cpp` file, compiled and run for real.
- [ ] You caused the real "abstract type" compiler error yourself, both
      for a bare `Column` and for a `std::vector<Column>`, and can
      explain why in terms of the pure virtual function, not just "it
      doesn't work."
- [ ] You can explain, from memory, why `Schema::columns` is
      `std::vector<std::unique_ptr<Column>>` and not
      `std::vector<Column>` — referring to the real compile error this
      lesson caused, not just "because that's what the lesson said."
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add the runtime-built Column/Schema hierarchy"`.
