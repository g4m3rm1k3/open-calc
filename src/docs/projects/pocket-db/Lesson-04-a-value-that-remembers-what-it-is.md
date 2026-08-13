# Lesson 4: A Value That Remembers What It Is

**What you will build**
`Value` — a second abstract hierarchy, `IntegerValue`/`TextValue`, built
with the *exact same technique* Lesson 2's `Column` already proved —
and `Row`, which holds a real, ordered list of `Value`s and validates,
at the moment it's built, that it actually has one value per column its
`Schema` expects. Get that count wrong, and `Row`'s own constructor
refuses, throwing a real, catchable error instead of silently building a
malformed record — this lesson's real, first use of C++ exception
handling, proven both uncaught (a real program crash) and caught (a real
recovery).

**What you need to know first:** Lesson 2 — `Column`, `Schema`,
`std::unique_ptr`, the abstract-base-class technique this lesson reuses
for `Value`. Lesson 3 — header files, `schema.h`/`schema.cpp`, the
declaration/definition split `row.h`/`row.cpp` follows the same way.

**Terms introduced in this lesson:** the general mechanism below (also
now its own standalone reference: `cpp-exception-handling.md`) — this
lesson's own real content is `Row`'s specific application of it, the
project-specific half that concept file deliberately leaves out.
- **Exception** — a real object, thrown at the exact point something has
  gone wrong, that interrupts a program's normal, line-by-line control
  flow and searches outward for something willing to handle it, instead
  of the calling code needing to check a return value for failure after
  every single call.
- **`throw`** — the keyword that actually creates and raises an
  exception, at the exact statement where something invalid was
  detected — proven directly, in this lesson's own `Row` constructor.
- **`try` / `catch`** — `try` marks a block of code whose exceptions
  should be caught rather than left to crash the program; `catch`
  names the specific exception type it's willing to handle, and runs
  only if a matching exception was actually thrown inside the `try`
  block.
- **Stack unwinding** — what happens between a `throw` and the matching
  `catch`: every function call still in progress, between the two, is
  exited immediately, and every local object with a real destructor
  (like this project's own `unique_ptr`s, Lesson 2) still gets destroyed
  correctly along the way — a thrown exception does not skip cleanup,
  it just skips the *rest of the normal code* in each of those functions.

**Objects and methods used**
- **`std::to_string`**
  - *What it is:* a real standard-library function, from `<string>`,
    converting a number into its real, human-readable text form.
  - *Implementation:* overloaded for every built-in numeric type
    (`int`, `double`, and others); `std::to_string(int)` returns a
    `std::string` holding that `int`'s ordinary base-10 digits — no
    leading zeros, a leading `-` for a negative value.
  - *Its use:* `IntegerValue::to_string()` (this lesson's first Concept
    Unit), converting its real stored `int` into displayable text; and
    `Row`'s constructor (second unit), converting both the actual and
    expected value counts into text for its real, specific error
    message.
- **`Value` / `IntegerValue` / `TextValue`**
  - *What they are:* an abstract base class and two concrete subclasses,
    holding one real value each — an `int` or a `std::string` — and each
    knowing how to render itself as text.
  - *Implementation:* the identical shape `Column`/`IntegerColumn`/
    `TextColumn` (Lesson 2) already proved — reappearing exactly, per
    the Repetition Rule, not re-taught in full here: an abstract base
    with one pure virtual function (`to_string()` here, `type_name()`
    there), two subclasses each providing their own real implementation,
    used polymorphically through a base reference or `unique_ptr`.
  - *Its use:* `Row`'s own real storage — one `Value` per column, in
    schema order.
- **`std::invalid_argument`**
  - *What it is:* a standard, real exception type from `<stdexcept>`,
    meaning specifically "an argument's *value* was invalid" — distinct
    from a wrong *type* (a compile-time problem C++ itself already
    catches) or a wrong *count* of arguments to a function (also a
    compile-time problem) — this is for a value that's the right kind,
    known only at runtime, but still wrong.
  - *Implementation:* `std::invalid_argument` inherits from
    `std::logic_error`, which inherits from `std::exception` — its
    constructor takes one `std::string` (the message), and it inherits
    `.what()` from `std::exception`, returning that message back as a
    `const char*`.
  - *Its use:* `Row`'s constructor throws one, with a real, specific
    message naming both the actual and expected value count, the moment
    it's handed the wrong number of values for its `Schema`.

---

## Concept Unit: `Value` — the Same Technique, a Second Problem

### The Problem

A `Row` needs to hold one real value per column — an `int` for an
`IntegerColumn`, a `std::string` for a `TextColumn` — decided at
runtime, by whatever `Schema` the row belongs to. This is the identical
shape `Column` itself already solved: "hold one of several genuinely
different real types, decided at runtime, and call one shared operation
on whichever one it actually is."

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, reusing Lesson 2's own `Column` technique.
- **Files affected:** `value.h` (new).
- **Change type:** Add.
- **Dependencies:** The abstract-base-class technique from Lesson 2.

### The New Code — `value.h`

In `pocketdb/`, save the following as `value.h`:

```cpp
#ifndef VALUE_H
#define VALUE_H

#include <string>

class Value
{
public:
    virtual ~Value() = default;
    virtual std::string to_string() const = 0;
};

class IntegerValue : public Value
{
public:
    int value;
    explicit IntegerValue(int value) : value(value) {}
    std::string to_string() const override { return std::to_string(value); }
};

class TextValue : public Value
{
public:
    std::string value;
    explicit TextValue(std::string value) : value(std::move(value)) {}
    std::string to_string() const override { return "'" + value + "'"; }
};

#endif
```

### Introduce the Concept in Isolation

This *is* the isolated proof — `Value` is small enough that its own
header, run against a tiny throwaway `main()`, is the clearest way to
confirm it works before `Row` depends on it. Save this as
`value_check.cpp`, in the same folder:

```cpp
#include <iostream>
#include "value.h"

int main()
{
    IntegerValue score(100);
    TextValue name("Alice");

    Value& first = score;
    Value& second = name;

    std::cout << first.to_string() << std::endl;
    std::cout << second.to_string() << std::endl;
}
```

Compiled and run:

```bash
g++ -std=c++17 -Wall -o value_check.exe value_check.cpp
./value_check.exe
```

Real output:

```text
100
'Alice'
```

*What this proves:* the exact same polymorphic dispatch Lesson 2 proved
for `Column`/`type_name()` works identically for `Value`/`to_string()` —
`first.to_string()` and `second.to_string()` each ran their own real
subclass's version, decided by the real object, not the `Value&`
declaration. `TextValue::to_string()` wraps its string in real single
quotes (`'Alice'`, not `Alice`) — a small, deliberate touch matching how
SQL itself displays text literals, distinguishing "the text `Alice`"
from "the number `100`" at a glance.

### Discard the Throwaway Example

`value_check.cpp` (and `value_check.exe`) are deleted — they exist only
to confirm `value.h` works before `Row` depends on it:

```bash
rm value_check.cpp value_check.exe
```

`value.h` itself is kept — the project's real, permanent file.

### Mechanical Walkthrough

- `class Value` / `virtual ~Value() = default;` / `virtual std::string to_string() const = 0;` —
  reappearing exactly (the Repetition Rule) — the identical abstract-base
  shape Lesson 2's `Column` already received full treatment for: an
  abstract class, uninstantiable on its own, existing purely to define
  the shared `to_string()` interface every subclass must implement.
- `class IntegerValue : public Value` / `class TextValue : public Value` —
  reappearing exactly — ordinary single inheritance, each providing its
  own real `to_string()` override, the same shape `IntegerColumn`/
  `TextColumn` already proved.
- `int value;` / `std::string value;` — **first appearance of `Value`'s
  own actual payload** — unlike `Column`, which only ever needed a
  `name`, each `Value` subclass holds the *real data* a row's cell
  actually contains.
- `"'" + value + "'"` — ordinary `std::string` concatenation via
  `operator+`, building a new string with literal single-quote
  characters on each side of the real value.
- `std::to_string(value)` (inside `IntegerValue::to_string()`) —
  **first appearance**, full treatment in Objects and methods used,
  above — converts the real stored `int` into its base-10 text form.

### CS Lens

This is the same **polymorphism** Lesson 2's CS Lens already named in
full — worth noticing here specifically *because* it's the same idea
solving a visibly different problem (schema shape versus stored data),
which is exactly how a real, transferable technique is recognized:
not by memorizing one example, but by seeing it solve a second,
unrelated-looking problem the same way.

### SE Lens

Why copy `Column`'s exact shape for `Value`, instead of inventing a
different technique since the problem (values, not columns) is
different? Because the *actual* problem — "hold one of several
runtime-decided real types, safely, and call one shared operation on
it" — is identical, even though the concrete types involved aren't. Using
a different technique here just because the domain looks different would
mean maintaining two separate solutions to the same real problem, each
with its own bugs to find independently — deliberately recognizing "this
is the same shape again" is what keeps a codebase's actual number of
*distinct ideas* small, even as its number of *files* grows.

### Commands Needed

Already shown above, alongside the file.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

`Value` can now hold one real cell's worth of data, of either real type
this project currently supports. `Row` — holding a real, ordered list of
them, and making sure that list actually matches its `Schema` — is next.

---

## Concept Unit: `Row` — Validated Against Its Own Schema, or Not Built At All

### The Problem

Nothing yet stops `Row` from being built with the wrong number of
values for its `Schema` — two values for a three-column table, say. A
silently-wrong `Row` — one that *looks* built successfully but doesn't
actually match its own table's shape — is a real, live data-integrity
risk this project's actual `INSERT` will face constantly. What should
happen the moment that mismatch occurs?

### Introduce the Concept in Isolation

A deliberately broken attempt, proving what happens with *no* validation
at all is silent, wrong construction — then the real fix. Save this as
`row_uncaught.cpp`, in `pocketdb/` — this references `row.h`, built in
this unit's own Project Change step below; write `row.h` first, then
come back to this file:

```cpp
#include "row.h"

int main()
{
    Schema schema;
    schema.add_column(std::make_unique<IntegerColumn>("id"));
    schema.add_column(std::make_unique<TextColumn>("player"));
    schema.add_column(std::make_unique<IntegerColumn>("score"));

    std::vector<std::unique_ptr<Value>> values;
    values.push_back(std::make_unique<IntegerValue>(1));
    values.push_back(std::make_unique<TextValue>("Alice"));
    // deliberately missing the third value, "score"

    Row row(std::move(values), schema);
}
```

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition.
- **Files affected:** `row.h` (new), `row.cpp` (new).
- **Change type:** Add.
- **Dependencies:** `schema.h` (Lesson 3), `value.h` (this lesson's
  first unit).

### The New Code — `row.h`

Save this as `row.h`:

```cpp
#ifndef ROW_H
#define ROW_H

#include <vector>
#include <memory>
#include "schema.h"
#include "value.h"

class Row
{
public:
    std::vector<std::unique_ptr<Value>> values;

    Row(std::vector<std::unique_ptr<Value>> values, const Schema& schema);
};

#endif
```

### The New Code — `row.cpp`

Save this as `row.cpp` — `Row`'s real constructor, including the
validation this whole unit exists to prove:

```cpp
#include <stdexcept>
#include "row.h"

Row::Row(std::vector<std::unique_ptr<Value>> values, const Schema& schema)
    : values(std::move(values))
{
    if (this->values.size() != schema.columns.size())
    {
        throw std::invalid_argument(
            "Row has " + std::to_string(this->values.size()) +
            " value(s), but schema expects " +
            std::to_string(schema.columns.size()));
    }
}
```

Compiling `row_uncaught.cpp` (from "Introduce the Concept in Isolation,"
above) against this real `Row`:

```bash
g++ -std=c++17 -Wall -c row.cpp -o row.o
g++ -std=c++17 -Wall -c row_uncaught.cpp -o row_uncaught.o
g++ row.o row_uncaught.o -o row_uncaught.exe
./row_uncaught.exe
```

Real, captured crash — the program compiles and links cleanly, then
terminates abnormally the moment it runs:

```text
terminate called after throwing an instance of 'std::invalid_argument'
  what():  Row has 2 value(s), but schema expects 3
```

*What this proves:* `Row`'s constructor really did detect the mismatch
— 2 real values against a 3-column `Schema` — and `throw`ing a real
`std::invalid_argument`, with nothing anywhere in `main()` prepared to
catch it, really does crash the whole program, immediately, printing the
exception's own real message (`.what()`) before exiting. This is called
an **uncaught exception** — the correct, honest behavior for a real
problem nothing was ready to handle, rather than silently continuing
with a broken `Row`.

The real fix — not a different `Row`, but code prepared to *handle* the
same real failure. Save this as `row_caught.cpp`:

```cpp
#include <iostream>
#include "row.h"

int main()
{
    Schema schema;
    schema.add_column(std::make_unique<IntegerColumn>("id"));
    schema.add_column(std::make_unique<TextColumn>("player"));
    schema.add_column(std::make_unique<IntegerColumn>("score"));

    std::vector<std::unique_ptr<Value>> bad_values;
    bad_values.push_back(std::make_unique<IntegerValue>(1));
    bad_values.push_back(std::make_unique<TextValue>("Alice"));

    try
    {
        Row row(std::move(bad_values), schema);
        std::cout << "Row built successfully." << std::endl;
    }
    catch (const std::invalid_argument& e)
    {
        std::cout << "Caught error: " << e.what() << std::endl;
    }

    std::cout << "Program continues normally after the catch." << std::endl;
}
```

Compiled and linked against the same `row.o`:

```bash
g++ -std=c++17 -Wall -c row_caught.cpp -o row_caught.o
g++ row.o row_caught.o -o row_caught.exe
./row_caught.exe
```

Real output — the program does *not* crash this time:

```text
Caught error: Row has 2 value(s), but schema expects 3
Program continues normally after the catch.
```

#### Execution Trace

1. `Row row(std::move(bad_values), schema);`, inside the `try` block —
   `Row`'s constructor runs, detects `bad_values.size()` (`2`) doesn't
   match `schema.columns.size()` (`3`), and `throw`s a real
   `std::invalid_argument`.
2. The `throw` immediately exits the constructor — `row`'s own
   declaration is abandoned mid-construction; no `Row` object actually
   comes into existence, and `"Row built successfully."` never prints,
   because the `throw` happened before that line could run.
3. `catch (const std::invalid_argument& e)` — this `catch` block's
   *type* (`std::invalid_argument`) matches the real thrown object's
   *type* exactly, so this block, not a crash, is where control actually
   resumes; `e` refers to the real exception object that was thrown.
4. `std::cout << "Caught error: " << e.what() << std::endl;` — prints
   the exact same message `row_uncaught.exe`'s own crash already showed,
   proving it's the identical real exception, just handled this time
   instead of left to terminate the program.
5. `std::cout << "Program continues normally after the catch." << std::endl;` —
   runs normally, outside the `try`/`catch` entirely, proving the
   program's control flow genuinely continued past the failure, rather
   than the whole program having crashed.

*What this proves:* the identical real failure — 2 values against a
3-column schema — produces the identical real message either way; the
only difference is whether anything was prepared to `catch` it. Caught,
the program keeps running; uncaught, it terminates. Neither behavior is
a bug — both are `Row`'s constructor doing its one real job correctly:
refusing to let a malformed `Row` silently come into existence.

A correctly-built `Row`, proving the validation doesn't get in the way
of real, correct data — added to the end of `row_caught.cpp`, replacing
its final `std::cout` line:

```cpp
std::cout << "Program continues normally after the catch." << std::endl;

std::vector<std::unique_ptr<Value>> good_values;
good_values.push_back(std::make_unique<IntegerValue>(1));
good_values.push_back(std::make_unique<TextValue>("Alice"));
good_values.push_back(std::make_unique<IntegerValue>(100));

Row good_row(std::move(good_values), schema);
for (size_t i = 0; i < good_row.values.size(); ++i)
{
    std::cout << schema.columns[i]->name << " = " << good_row.values[i]->to_string() << std::endl;
}
```

Recompiled and run the same way. Real output — the earlier two lines,
plus:

```text
id = 1
player = 'Alice'
score = 100
```

*What this proves:* a `Row` built with the correct number of values —
matching `schema`'s real three columns — constructs successfully, no
exception thrown, and each value's `to_string()` (Lesson 4's first unit)
prints the real, correct data next to its real column name.

### Discard the Throwaway Example

`row_uncaught.cpp`/`.o`/`.exe` and `row_caught.cpp`/`.o`/`.exe` are all
deleted — they proved the constructor's real behavior, both ways, but
none of their own `main()`s become part of the project:

```bash
rm row_uncaught.cpp row_uncaught.o row_uncaught.exe
rm row_caught.cpp row_caught.o row_caught.exe
```

`row.h` and `row.cpp` are kept — real, permanent project files.

### Mechanical Walkthrough

- `Row(std::vector<std::unique_ptr<Value>> values, const Schema& schema)`
  (declaration, in `row.h`) — reappearing shape (Lesson 3's own
  declaration-only pattern for `Schema::add_column`) — a real
  constructor *declared* here, *defined* in `row.cpp`.
- `const Schema& schema` — a `const` reference parameter: `Row`'s
  constructor needs to *read* `schema`'s column count, but never needs
  to own or modify the `Schema` itself, so a reference (no copy) marked
  `const` (no accidental modification) is the correct, minimal way to
  receive it.
- `Row::Row(...) : values(std::move(values))` (in `row.cpp`) — `Row::`
  before the constructor name, reappearing exactly (Lesson 3's
  `Schema::add_column` definition) — an initializer list, moving the
  parameter `values` directly into the member `values` before the
  constructor's own body runs.
- `if (this->values.size() != schema.columns.size())` — **first
  appearance of `this->`** — inside the constructor, both the parameter
  and the member are named `values`; `this->values` explicitly means
  "the member," disambiguating it from the plain `values` that would
  otherwise refer to the constructor's own parameter (already moved-from
  by this point, per the initializer list above — `this->values` is the
  real, already-populated member).
- `std::to_string(this->values.size())` / `std::to_string(schema.columns.size())` —
  reappearing exactly (this lesson's first unit already gave
  `std::to_string` full treatment) — converting both real counts into
  text, concatenated into the exception's own message string.
- `throw std::invalid_argument("...")` — **first appearance of `throw`.**
  Constructs a real `std::invalid_argument` object, with a real message
  string, and immediately raises it — the exact mechanism covered fully
  in Terms Introduced.
- `try { ... } catch (const std::invalid_argument& e) { ... }` —
  **first appearance of `try`/`catch`.** `catch`'s parameter type must
  match (or be a real base class of) the thrown type — `std::invalid_argument`
  matches here exactly; a `catch` block for an unrelated exception type
  would not have caught this one, and the program would have crashed
  exactly as `row_uncaught.exe` did.
- `e.what()` — a real method call on the caught exception object,
  covered fully in Objects and methods used, above.

### CS Lens

This is **structured exception handling** — separating "code that
detects a problem" from "code that decides how to respond to it," which
don't have to be the same function, or even nearby in the source. Also
recognized in: any web framework's global error handler (one place
catching failures from many different request handlers), a database
driver's connection-retry logic (catching a real connection failure and
deciding to retry, rather than crashing the whole application), and C#'s
own `try`/`catch`/`throw` — the identical mechanism, a different
language's syntax for it, already familiar from work on `pocket-inventory-wpf`'s
own `SqliteConnection` handling in a different project.

### SE Lens

Why `throw` a real exception from `Row`'s constructor, instead of, say,
giving `Row` a `bool is_valid` field the caller has to remember to check
afterward? A `bool` flag can be silently ignored — nothing stops calling
code from using a `Row` without ever checking whether it's actually
valid, and the mistake wouldn't surface until much later, somewhere far
from where the real problem was. A thrown exception makes ignoring the
problem structurally harder: an uncaught one crashes the program loudly,
immediately, at the real point of failure — exactly what `row_uncaught.exe`
proved. The real cost this project accepts: exception handling has real
performance overhead compared to a checked return value, in languages
and situations where that overhead actually matters — a tradeoff worth
naming honestly, not a reason to avoid it here, where correctness
mattering more than raw speed is the actual priority for a database
engine's own data-integrity guarantees.

### Commands Needed

Every command was already shown above, alongside its real output —
`g++ -c` for each `.cpp` file independently, then a real link combining
`row.o` with each throwaway `main()`'s own object file, reappearing
shape from Lesson 3.

### Run It

Already shown above, in "Introduce the Concept in Isolation" — the real
crash, the real caught message, and the real, correct three-line output
from a properly-built `Row`.

### Connection

`Row` now refuses, loudly and provably, to be built with the wrong
number of values for its `Schema` — real, working validation, the first
piece of this project's own data-integrity story. It does not yet check
that each value's real *type* actually matches its column's declared
type (an `IntegerValue` could currently be placed where a `TextColumn`
was declared, and `Row`'s constructor would accept it) — a real gap,
left honestly open for a later lesson, once the engine has enough real
surface area (an actual `INSERT` command, parsed from real input) for
that validation to matter for more than this lesson's own throwaway
proof.

---

## Closing

### Connect the Pieces

`Value`, `IntegerValue`, and `TextValue` reused `Column`'s exact
technique from Lesson 2 to hold one real cell's worth of data — proven
with real, correct `to_string()` output (`100`, `'Alice'`). `Row` then
combined a real, ordered list of `Value`s with a live check against its
own `Schema`'s column count: too few values, and `Row`'s constructor
`throw`s a real `std::invalid_argument`, proven to crash a program with
nothing catching it and to be caught cleanly by one that is, both
showing the identical real message. The correct count — three values
for a three-column schema — builds successfully and prints real,
correct data next to each column's real name, closing the loop from
Lesson 2's `Schema` all the way to a genuine, validated record.

### What Breaks Without This

Already shown directly above: build a `Row` with the wrong number of
values and nothing catching the result, and the real program crashes,
with a real, specific message naming both counts — not a vague failure,
not silent data corruption, a loud, immediate, informative stop.

### Exercises

- Add a `RealColumn`/`RealValue` pair (for a `REAL`/floating-point
  column, matching Lesson 2's own suggested exercise) and build a real
  four-column `Schema`/`Row` pair using all three value types.
- Deliberately build a `Row` with *too many* values instead of too few
  (four values against a three-column schema). Confirm the exact same
  `std::invalid_argument` fires, with a real, correctly different
  message — read it, and confirm it correctly reports both the actual
  and expected counts either way.
- Add a second `catch` block, after the existing one, for
  `const std::exception& e` (`std::invalid_argument`'s own base class).
  Deliberately trigger a *different* kind of real error you construct
  yourself (any real `std::exception` subclass), and confirm this
  second, more general `catch` is the one that actually handles it,
  proving `catch` selection genuinely depends on the real thrown type,
  not just the first `catch` block written.

### Definition of Done

- [ ] `value.h`, `row.h`, and `row.cpp` all exist as real files in your
      own `pocketdb/` folder.
- [ ] You caused the real, uncaught `std::invalid_argument` crash
      yourself, read its real message, then caught the identical
      failure with a real `try`/`catch` and confirmed the program kept
      running afterward.
- [ ] A correctly-built `Row`, matching its `Schema`'s real column
      count, prints correct data for every value, with no exception
      thrown.
- [ ] You can explain, from memory, why `Row`'s constructor throws
      instead of using a `bool` validity flag, referencing this lesson's
      own SE Lens, not just "because exceptions are more correct."
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add Row, validated against its Schema's real column count"`.
