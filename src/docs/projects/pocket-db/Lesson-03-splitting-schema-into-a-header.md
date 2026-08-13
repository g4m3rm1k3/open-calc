# Lesson 3: One Declaration, Compiled Separately, Twice

**What you will build**
`schema.cpp` (Lesson 2) currently holds `Column`/`IntegerColumn`/
`TextColumn`/`Schema`'s full definitions *and* a `main()` that uses them,
all in one file. The moment a second, real file — this lesson adds
`main.cpp`, separate from `schema.cpp` — also needs `Schema`, copying the
class definitions into it by hand becomes a real, live maintenance
hazard: change one copy, forget the other, and the two files silently
disagree about what a `Column` even is. This lesson splits `schema.cpp`
into a header (`schema.h`, the declarations) and an implementation
(`schema.cpp`, `Schema::add_column`'s real body), compiles both files
*separately*, and links them into one program — and causes two real,
different compiler/linker errors on purpose, so both halves of "why
headers exist" are proven, not asserted.

**What you need to know first:** Lesson 2 — `Column`, `IntegerColumn`,
`TextColumn`, `Schema`, all currently living in one file, `schema.cpp`.

**Terms introduced in this lesson:**
- **Header file (`.h`)** — a file holding *declarations* — what exists,
  and its shape — meant to be `#include`d into more than one `.cpp` file,
  so every file that includes it agrees on that shape without each one
  writing it out separately.
- **Declaration vs. definition** — a declaration states that something
  exists and what its shape is (a class's members, a function's
  signature) without necessarily providing its real body; a definition
  provides the actual implementation. `Schema::add_column`'s
  *declaration* lives in `schema.h`; its real *definition* — the actual
  code that runs — moves to `schema.cpp` in this lesson.
- **Header guard** — a block wrapping a header file's entire contents
  (`#ifndef NAME` / `#define NAME` / ... / `#endif`) that makes the
  second and later `#include` of the same header, inside one file, a
  no-op instead of a redefinition. Proven necessary — and working — with
  real, caused compiler errors in this lesson's first Concept Unit.
- **Translation unit** — one `.cpp` file, plus everything its own
  `#include`s pull in, as the compiler actually sees it — the real unit
  the compiler compiles independently, one at a time, before a separate
  step (the linker) combines the results.
- **Object file (`.o`)** — the real, compiled machine code the compiler
  produces from one translation unit, before linking — not yet a runnable
  program, since it may reference names (like `Schema::add_column`) whose
  actual definition lives in a *different* object file not yet combined
  with it.
- **Linking** — the separate step, after compiling, that combines every
  object file into one real, runnable program, resolving each reference
  to a function or variable defined in a different object file. Proven
  directly, including what happens when it's given an incomplete set of
  object files, in this lesson's second Concept Unit.

**Objects and methods used**
- No new external classes or methods this lesson — the real subject is
  the C++ compilation model itself (headers, translation units, object
  files, linking), covered fully in Terms Introduced above and proven
  directly in both Concept Units below.

---

## Concept Unit: The Real Problem With Copy-Pasting a Class Definition

### The Problem

`Column`'s real definition currently lives, written out in full, inside
`schema.cpp`. The moment a second file also needs `Column` — this
lesson's own `main.cpp`, next — what actually happens if that
definition just gets copy-pasted into the new file too, instead of
shared properly?

### Introduce the Concept in Isolation

In the same `pocketdb/` folder Lesson 0 created, save the following as
`schema_noguard.h` — deliberately with no guard around it yet:

```cpp
#include <string>

class Column
{
public:
    std::string name;
    explicit Column(std::string name) : name(std::move(name)) {}
    virtual ~Column() = default;
    virtual std::string type_name() const = 0;
};
```

Save this as `double_include_fail.cpp`, in the same folder — a small,
throwaway file whose only job is to `#include` that header *twice*:

```cpp
#include "schema_noguard.h"
#include "schema_noguard.h"

int main()
{
    return 0;
}
```

Attempting to compile it — `-c` compiles only, producing an object file,
without trying to link a full program yet (covered fully in the next
unit):

```bash
g++ -std=c++17 -Wall -c double_include_fail.cpp -o double_include_fail.o
```

Real, captured compiler error — compilation fails, no `.o` is produced:

```text
error: redefinition of 'class Column'
note:   previous definition of 'class Column'
```

*What this proves:* `#include "schema_noguard.h"`, written twice, really
does behave exactly like pasting that header's entire text in twice —
the compiler sees `class Column { ... }` a second time, in the same
file, and refuses, since a class can only be *defined* once per
translation unit. Nothing here is specific to `double_include_fail.cpp`
writing the same `#include` line twice by an obvious mistake — the
identical failure happens naturally the moment two different headers
each `#include` a third, shared header, and something else `#include`s
both of *them* (a real, common shape in any project with more than a
couple of files) — this is called a **header guard**'s absence.

The fix — the identical header, now wrapped in a real header guard.
Save this as `schema_guarded.h`:

```cpp
#ifndef SCHEMA_H
#define SCHEMA_H

#include <string>

class Column
{
public:
    std::string name;
    explicit Column(std::string name) : name(std::move(name)) {}
    virtual ~Column() = default;
    virtual std::string type_name() const = 0;
};

#endif
```

Save this as `double_include_fixed.cpp` — identical to the broken
version, still including the same header twice:

```cpp
#include "schema_guarded.h"
#include "schema_guarded.h"

int main()
{
    return 0;
}
```

Compiled the same way:

```bash
g++ -std=c++17 -Wall -c double_include_fixed.cpp -o double_include_fixed.o
```

Real output — compiles cleanly this time, no errors, a real `.o` file
is produced:

```text
(no output — exit code 0)
```

*What this proves:* the exact same double-`#include`, against the exact
same class, now compiles cleanly — the only difference is the guard.
This is called a **header guard**: `#ifndef SCHEMA_H` asks "has
`SCHEMA_H` *not* been defined yet?" — true the first time this header is
seen in a translation unit, so `#define SCHEMA_H` runs and the class
definition is processed normally; false every subsequent time in the
*same* translation unit, so the preprocessor skips straight to `#endif`,
and the class definition is never seen twice by the compiler at all.

### Discard the Throwaway Example

Both files, and both headers, are deleted — they exist only to prove
the guard mechanism by contrast:

```bash
rm schema_noguard.h double_include_fail.cpp double_include_fail.o
rm schema_guarded.h double_include_fixed.cpp double_include_fixed.o
```

The real, permanent `schema.h` — with a real guard, and `Column`'s
actual full shape from Lesson 2, not this unit's trimmed proof version —
is built next.

### Mechanical Walkthrough

- `#ifndef SCHEMA_H` — a preprocessor directive, running *before*
  real compilation, checking whether the name `SCHEMA_H` has already
  been `#define`d earlier in this same translation unit.
- `#define SCHEMA_H` — defines that name, with no value needed; its
  only job is to exist so a later `#ifndef SCHEMA_H` in the same
  translation unit finds it already defined and skips the guarded
  content.
- `#endif` — closes the `#ifndef` block, marking where the "skip
  everything until here" behavior stops applying.
- `#include "schema_guarded.h"` (the second one) — the preprocessor
  still literally pastes the header's text in again, exactly as before
  — the guard doesn't prevent the `#include` itself, only what happens
  once the pasted content is processed: `#ifndef SCHEMA_H` is now false,
  so everything between it and `#endif` — including the entire `class
  Column { ... }` — is skipped this second time.

### CS Lens

This is **idempotence** — an operation that can be applied more than
once with the same effect as applying it exactly once. `#include`ing a
guarded header five times in one file has the identical effect as
including it once; an unguarded header does not have this property, and
that's exactly what broke. Also recognized in: an HTTP `PUT` request
(by design, sending it twice should leave a resource in the same state
as sending it once), a database migration written to be safely re-run,
and a build script's own "create this directory if it doesn't already
exist" check.

### SE Lens

Why does this project's convention name the guard after the file itself
(`SCHEMA_H`) rather than picking any short, convenient identifier?
Because two different headers in the same project, both named carelessly
the same way, really do collide — proven directly: two small headers,
`a.h` and `b.h`, both guarded as `#ifndef HEADER_H`, the second one
(`b.h`, defining a class `Bar`) included after the first:

```text
error: 'Bar' was not declared in this scope
```

Not a redefinition error this time — the opposite failure: `b.h`'s guard
found `HEADER_H` already defined (by `a.h`'s own guard) and skipped
`b.h`'s entire real content, silently, so `Bar` was never declared at
all by the time `main()` tried to use it. The real convention
this project adopts to avoid that: name every guard after the file
itself, uppercased (`schema.h` → `SCHEMA_H`), so a collision would
require two files with the *same name*, already prevented by the
filesystem itself.

### Commands Needed

Both compile commands were already shown above, alongside each file.
`-c` (used here and throughout this lesson) tells `g++` to compile only
— produce a real object file — and stop before attempting to link a
full, runnable program; covered fully, including what a "full link"
actually does, in the next unit.

### Run It

Already shown above, in "Introduce the Concept in Isolation" — both the
real redefinition error and the real, silent, successful compile once
guarded.

### Connection

A guarded header can now be safely `#include`d more than once *within
one file*. It hasn't yet been proven to work *across* two genuinely
separate `.cpp` files, each compiled independently — the actual, real
reason `schema.cpp` needs splitting in the first place. That's next.

---

## Concept Unit: Separate Compilation — Two Files, One Program

### The Problem

`main.cpp`, a genuinely new, separate file, needs to build a `Schema`
and call `add_column` on it — the exact same `Schema` class `schema.cpp`
already defines. Copy-pasting the whole class into `main.cpp` too would
"work," but silently risks the two copies drifting apart the moment
either one changes. What does a *real, single, shared* declaration,
used correctly from two independently-compiled files, actually require?

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch
  restructuring of Lesson 2's own `schema.cpp`.
- **Files affected:** `schema.h` (new), `schema.cpp` (modified —
  `Schema::add_column`'s body moves here, its declaration moves to
  `schema.h`; `main()` moves out entirely), `main.cpp` (new).
- **Change type:** Refactor (Lesson 2's working code is being
  reorganized, not changed in behavior).
- **Dependencies:** Lesson 2's `Column`/`IntegerColumn`/`TextColumn`/
  `Schema`.

### The New Code — `schema.h`

In `pocketdb/`, save the following as `schema.h` — every class's full
shape, `Schema::add_column` declared but not defined (no `{ ... }` body,
just a signature ending in `;`):

```cpp
#ifndef SCHEMA_H
#define SCHEMA_H

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
    void add_column(std::unique_ptr<Column> column);
};

#endif
```

### The New Code — `schema.cpp`, Rewritten

Overwrite `schema.cpp` (Lesson 2's version, `main()` and all, is being
fully replaced) with just `Schema::add_column`'s real definition:

```cpp
#include "schema.h"

void Schema::add_column(std::unique_ptr<Column> column)
{
    columns.push_back(std::move(column));
}
```

### The Updated Project — `main.cpp`

`main()` — Lesson 2's own, unchanged in behavior — moves into its own
new file, `main.cpp`:

```cpp
#include <iostream>
#include "schema.h"

int main()
{
    Schema schema;                                                  // ← unchanged from Lesson 2
    schema.add_column(std::make_unique<IntegerColumn>("id"));       // ← unchanged
    schema.add_column(std::make_unique<TextColumn>("player"));      // ← unchanged

    for (const auto& column : schema.columns)                       // ← unchanged
    {
        std::cout << column->name << " " << column->type_name() << std::endl;  // ← unchanged
    }
}
```

Compiling each file *separately* — this is the real point of this whole
unit, so each step runs on its own, one at a time:

```bash
g++ -std=c++17 -Wall -c schema.cpp -o schema.o
g++ -std=c++17 -Wall -c main.cpp -o main.o
```

Real output — both commands exit with no errors, and two real files
appear:

```text
schema.o
main.o
```

Neither `.o` file is a runnable program yet — proven directly by trying
to run `main.o` (nothing here is a real, executable format), and, more
usefully, by attempting to *link* only `main.o` alone, deliberately
without `schema.o`:

```bash
g++ main.o -o program_missing_link.exe
```

Real, captured linker error — not a compiler error; the file compiled
fine, this fails at a later, separate step:

```text
undefined reference to `Schema::add_column(std::unique_ptr<Column, std::default_delete<Column> >)'
undefined reference to `Schema::add_column(std::unique_ptr<Column, std::default_delete<Column> >)'
collect2.exe: error: ld returned 1 exit status
```

*What this proves:* `main.cpp` compiled cleanly on its own — `schema.h`
told the compiler `Schema::add_column` exists and what its exact
signature is, which is all a *declaration* promises, and enough for
`main.cpp` to compile. But `main.cpp` never contains `add_column`'s real
*body* — that's in `schema.cpp`, compiled into `schema.o` — and linking
`main.o` alone leaves that promise unfulfilled: two real calls to
`Schema::add_column` inside `main.o`, with nothing anywhere telling the
linker what code should actually run for them. This is called **linking**
— a separate step, after compiling, that combines object files and
resolves exactly these cross-file references — and this real error is
what it looks like when linking is given an incomplete set of object
files.

The real, correct link — both object files given together:

```bash
g++ schema.o main.o -o program.exe
```

Real output — links successfully, `program.exe` appears:

```text
(no output — exit code 0)
```

Run it:

```bash
./program.exe
```

Real output:

```text
id INTEGER
player TEXT
```

*What this proves:* `schema.cpp` and `main.cpp`, compiled completely
independently, in separate commands, neither one able to see the other's
source — only `schema.h`'s shared declarations — link into one real,
correct, running program the moment *both* object files are given to the
linker together. This is called **separate compilation**.

### Discard the Throwaway Example

`program_missing_link.exe` was never actually produced — the link that
would have created it failed on purpose, to prove the error. Nothing
here is discarded; `schema.h`, `schema.cpp`, and `main.cpp` are the
project's real, permanent files from this point forward, replacing
Lesson 2's single `schema.cpp`.

### Mechanical Walkthrough

- `void add_column(std::unique_ptr<Column> column);` (in `schema.h`,
  ending in `;`, no body) — **first appearance of a pure declaration**
  for a function that already has a real definition elsewhere — this
  exact shape (signature, no body) is what lets `main.cpp` know
  `add_column` exists and how to call it, without needing to see its
  real implementation at all.
- `void Schema::add_column(std::unique_ptr<Column> column) { ... }`
  (in `schema.cpp`) — the real *definition*; `Schema::` before the name
  is required here, specifically because this definition lives outside
  the class body (inside the header, it was defined directly inside
  `class Schema { ... }` in Lesson 2, where no `Schema::` prefix was
  needed) — this syntax is how C++ says "this function body belongs to
  the `Schema` class declared elsewhere."
- `#include "schema.h"` (in both `schema.cpp` and `main.cpp`) —
  reappearing exactly (the previous unit's own guarded-header proof) —
  each file gets its own, independent copy of every declaration in
  `schema.h`, guarded against being seen twice within that one file,
  same as before.
- `g++ -c schema.cpp -o schema.o` / `g++ -c main.cpp -o main.o` — two
  separate, independent compiler invocations — reappearing shape
  (`-c` from the previous unit), each producing its own real object
  file from its own real translation unit.
- `g++ schema.o main.o -o program.exe` — **first appearance of linking
  multiple object files together.** No `-c` this time — without it,
  `g++` performs its full default behavior: compile anything not
  already compiled (nothing here, both inputs are already `.o` files),
  then link everything given into one real, runnable `.exe`.

### CS Lens

This is the real, concrete shape of **separation of interface from
implementation** — `schema.h` is the interface (what exists, and its
shape), `schema.cpp` is the implementation (how it actually works) —
and any other file, like `main.cpp`, only ever needs the interface to
use it correctly. Also recognized in: any C library's own `.h`/`.c`
split (the exact same mechanism, one level more primitive than C++
classes), a network API's published contract versus its real server-side
implementation, and — a repo-internal comparison worth naming directly
— a C# `interface` versus the concrete class that implements it, a
different language's version of the identical idea.

### SE Lens

Why split `schema.h`/`schema.cpp` at all, instead of keeping everything
in one file the way Lesson 2 did, and just `#include`ing that one file's
*entire* content (declarations and definitions together) from anywhere
that needs it? That would actually still compile correctly today, for
this small a project — the real cost only shows up as the project grows:
every file that `#include`s a `.cpp` full of real function bodies forces
the compiler to re-compile those same bodies again, once per file that
includes them, and — for anything more complex than this lesson's tiny
example — risks real, hard-to-diagnose duplicate-definition errors the
moment a definition isn't safely reusable the way an inline class body
is. Splitting declaration from definition now, while the project is
small enough that the payoff isn't yet visible, is a deliberate,
proactive choice — the same kind of judgment call Lesson 50's own SE
Lens (a different project) named directly: sometimes the right time to
adopt a real structural discipline is before the pain that would force
it, not after.

### Commands Needed

Every command was already shown above, alongside its real output:
`g++ -c schema.cpp -o schema.o` and `g++ -c main.cpp -o main.o` (compile
only, one file at a time), `g++ main.o -o program_missing_link.exe`
(deliberately incomplete link, proving the real error), and
`g++ schema.o main.o -o program.exe` (the real, correct link, two object
files given together).

### Run It

Already shown above — the real linker error from the incomplete link,
and the real, correct `id INTEGER` / `player TEXT` output from the
properly-linked `program.exe`.

### Connection

`Schema` can now be shared, correctly and safely, across as many separate
`.cpp` files as this project eventually needs — proven, not assumed, by
the real linker error this unit caused and fixed on purpose. `Row` — the
next real piece the engine needs, holding actual per-record values — is
exactly the kind of thing that will need `schema.h`'s shape to build
against, next lesson.

---

## Closing

### Connect the Pieces

`schema.h` now holds every class's real shape, guarded against being
seen twice within one file — proven directly by causing, then fixing, a
real "redefinition of `class Column`" error. `schema.cpp` holds
`Schema::add_column`'s one real definition; `main.cpp`, a genuinely
separate file that never sees `schema.cpp`'s source at all, still
compiles correctly against `schema.h`'s declaration alone. Compiling
both files independently (`schema.o`, `main.o`) and linking only one of
them produced a real, different error — "undefined reference to
`Schema::add_column`" — proving a declaration alone isn't enough to
*run*; only linking both real object files together produced
`program.exe`, which ran and printed the identical, correct output
Lesson 2's single-file version already proved: `id INTEGER` /
`player TEXT`.

### What Breaks Without This

Already shown directly above, twice, with two genuinely different real
errors: an unguarded header, included twice in one file, causes a
compiler error ("redefinition of `class Column`"); a correct header, but
an incomplete link (missing `schema.o`), causes a linker error
("undefined reference to `Schema::add_column`") — different failures,
at different stages of the build, both caused and fixed for real in this
lesson.

### Exercises

- Add a third file, `count_columns.cpp`, that `#include`s `schema.h`,
  builds a `Schema` with four columns, and prints how many columns it
  has (`schema.columns.size()`). Compile it separately (`-c`), and link
  it together with `schema.o` into a second, real program — confirm it
  runs correctly, without ever touching `main.cpp`.
- Deliberately remove the header guard from `schema.h`, then compile
  `main.cpp` alone (`main.cpp` only `#include`s `schema.h` once, so this
  specific case should still work) — confirm it still compiles, then
  explain, in your own words, exactly what real project shape (not
  demonstrated in this lesson) *would* have broken it, referencing this
  lesson's own double-`#include` proof.
- Try linking `schema.o` alone, without `main.o`, into an `.exe`.
  Read the real error, and explain why it's a *different* undefined
  reference than the one this lesson caused (hint: what does `main()`
  itself provide that `schema.o` alone doesn't have?).

### Definition of Done

- [ ] `schema.h`, `schema.cpp`, and `main.cpp` all exist as three real,
      separate files in your own `pocketdb/` folder.
- [ ] You caused the real "redefinition of `class Column`" error
      yourself, from an unguarded header included twice, and fixed it
      with a real header guard.
- [ ] You caused the real "undefined reference to `Schema::add_column`"
      linker error yourself, by linking `main.o` without `schema.o`, and
      fixed it by linking both together.
- [ ] `program.exe`, built from `schema.o` and `main.o` linked together,
      runs and prints the correct `id INTEGER` / `player TEXT` output.
- [ ] You can explain, from memory, the real difference between a
      compiler error and a linker error — which stage each one this
      lesson caused actually happened at, and why.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Split Schema into a header, prove separate compilation for real"`.
