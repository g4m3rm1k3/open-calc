# Lesson 4: Drawing the Line Between Module and User
*(Header Files, Separate Compilation, and Hiding a Filename Inside the Type That Owns It)*

**What you will build.** `mydb.cpp` currently holds three things tangled
together: what a student record *is* (`struct Student`), how records get
stored and retrieved (raw `ofstream`/`ifstream` calls scattered through
`main`), and this particular run's specific behavior (reading one new
student, printing everything). Today those get pulled apart for real:
`Student` and a new `Table` class move into their own files under
`storage/`, `Table` hides its filename and file-handling behind three
public operations, and `mydb.cpp` shrinks down to just the CLI-specific
part — call `Table`, don't reimplement it.

**What you need to know first.** Lesson 1–3 in full — `struct`,
`std::vector`, `std::ofstream`/`ifstream`, functions, `std::cin`. Every
line of file-handling code in this lesson is code you already wrote;
today's job is relocating and wrapping it, not rewriting its logic.

---

## Concept Unit: Declaring Something Without Yet Defining It (Header Files)

### The Problem

Right now, everything `mydb` knows — the shape of a student record, how
to write one, how to read them back, and the specific CLI logic for
this run — lives in one file, read top to bottom. That's still
manageable at `mydb.cpp`'s current size, but it won't stay that way: a
`storage/` module and a future `sql/` module have no business being
defined inside the same file that reads from the keyboard. C++ has a
mechanism for exactly this: separating *what exists* (a declaration)
from *how it works* (a definition), so one file can say "this function
exists, here's its signature" without containing its actual code — and
another file, compiled separately, can supply that code.

### Introduce the Concept in Isolation

Three throwaway files. `math_utils.h`:

```cpp
#pragma once
int add(int a, int b);
```

`math_utils.cpp`:

```cpp
#include "math_utils.h"

int add(int a, int b) {
    return a + b;
}
```

`main.cpp`:

```cpp
#include <iostream>
#include "math_utils.h"

int main() {
    std::cout << add(2, 3);
    return 0;
}
```

Compiled and run — notice both `.cpp` files are handed to the compiler
in one command:

```
$ g++ main.cpp math_utils.cpp -o mathdemo
$ ./mathdemo
5
```

`main.cpp` never sees `add`'s actual implementation — only its
declaration from the header — yet it produces the right answer. That's
the proof: `main.cpp` was compiled successfully using nothing but a
*promise* that `add` exists and what its signature is; the real
implementation, in a completely separate file, got linked in afterward.

### Discard the Throwaway Example

`math_utils.h`, `math_utils.cpp`, and `main.cpp` are scratch work. The
real project moves `struct Student` into its own header, next.

### Project Change

- **Files affected:** `storage/student.h` — new file. `mydb.cpp` —
  modified.
- **Change type:** create (`student.h`) + remove (the inline `struct
  Student` definition, deleted from `mydb.cpp`) + add (an `#include` in
  its place).
- **Location:** in `mydb.cpp`, the `struct Student { ... };` block that
  has sat above `main` since Lesson 2 is deleted entirely and replaced
  with one `#include` line at the top of the file.
- **Dependencies:** none new.

### The New Code

```cpp
#pragma once
#include <string>

struct Student {
    int id;
    std::string name;
    int age;
};
```

### The Updated Project

`storage/student.h`, in full — this is a brand-new file with nothing
surrounding it yet, so there's no larger enclosing structure to return
to.

`mydb.cpp`, in full, with the change applied:

```cpp
#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include "storage/student.h"          // ← new

Student readStudent() {
    Student s;
    std::cout << "Enter id, name, age: ";
    if (!(std::cin >> s.id >> s.name >> s.age)) {
        std::cout << "Invalid input, using defaults.\n";
        s.id = 0;
        s.name = "unknown";
        s.age = 0;
    }
    return s;
}

int main() {
    std::vector<Student> students = {
        {1, "Alice", 20},
        {2, "Bob", 22}
    };

    Student newStudent = readStudent();
    students.push_back(newStudent);

    std::ofstream out("school.db", std::ios::app);
    for (const Student& s : students) {
        out << s.id << "," << s.name << "," << s.age << "\n";
    }
    out.close();

    std::ifstream in("school.db");
    std::string line;
    while (std::getline(in, line)) {
        std::cout << line << "\n";
    }

    return 0;
}
```

Everything below `readStudent` is unchanged — `Student` behaves exactly
as before, it just now lives in its own file, and `mydb.cpp` reaches it
through one `#include` instead of defining it inline.

### Mechanical Walkthrough

- `#pragma once` — **first appearance.** An *include guard*: it tells
  the compiler "if this exact file gets `#include`d more than once
  while building a single source file, only paste it in the first
  time." Without this, if two different headers both happened to
  `#include "student.h"` and a third file included both of them,
  `struct Student` would get pasted in twice and the compiler would
  reject it as a duplicate definition. `#pragma once` is a compiler
  extension rather than official standard C++, but it's supported
  everywhere in practice and is the simplest version of this idea — the
  fully portable alternative (`#ifndef`/`#define`/`#endif` guards) does
  the same job with more to type.
- `#include "storage/student.h"` — reuses `#include` from Lesson 1
  (basic reuse), with one new detail worth flagging: quotes instead of
  angle brackets. `<iostream>` uses angle brackets because it's a
  system/standard-library header; `"storage/student.h"` uses quotes
  because it's a file you wrote, found relative to `mydb.cpp`'s own
  location.

### CS Lens

This is the **interface/implementation split**, the same idea behind
every `.h`/`.cpp` pair, every Python module's public names versus its
internals, and — at a larger scale — an HTTP API's documented endpoints
versus the server code behind them. The core idea: a *consumer* only
needs to know an interface's shape, never its internals, to use it
correctly.

### SE Lens

The alternative — keeping everything in one growing file — doesn't
break today, but it breaks the specific goal of this project: `sql/`,
`engine/`, and every later module are supposed to be independently
understandable pieces with their own clear job. One giant file makes
that impossible to enforce; nothing stops unrelated logic from getting
tangled together. The cost of splitting now is small (one more file,
one more `#include`) — the payoff compounds every lesson from here.

### Commands

No new commands — `g++ mydb.cpp -o mydb` still works as before, since
`#include` still pastes `student.h`'s contents directly into
`mydb.cpp` at compile time; no second `.cpp` file is needed yet because
`student.h` contains no function bodies, only a type definition. That
changes in the next unit.

### Run It

```
$ g++ mydb.cpp -o mydb -Wall
$ rm -f school.db
$ echo "3 Carol 19" | ./mydb
Enter id, name, age: 1,Alice,20
2,Bob,22
3,Carol,19
```

Identical output to the end of Lesson 3 — this unit changed *where*
`Student` is defined, not what the program does.

### One Sentence Connecting This to What Came Before

Every earlier lesson made `mydb.cpp` do more; this unit is the first
time a lesson made it *smaller*, by giving something it already had its
own home.

---

## Concept Unit: Hiding a Filename Inside the Type That Owns It (`class`, `public`/`private`)

### The Problem

`main` currently opens `school.db` directly, twice, with raw
`std::ofstream`/`std::ifstream` calls — meaning *any* code anywhere in
this program could open that file in some other, inconsistent way (wrong
mode, wrong error handling, a typo'd filename) with nothing stopping it.
What the storage logic actually needs is to be a single, trusted
gatekeeper: something that owns the filename, exposes only the specific
operations that are safe and meaningful (`insert`, `printAll`), and
makes the raw file handle impossible for outside code to reach around.

### Introduce the Concept in Isolation

Throwaway file, `counter.cpp`:

```cpp
#include <iostream>

class Counter {
public:
    Counter(int start) : count(start) {}
    void increment() { count++; }
    int get() const { return count; }

private:
    int count;
};

int main() {
    Counter c(10);
    c.increment();
    c.increment();
    std::cout << c.get();
    return 0;
}
```

```
$ g++ counter.cpp -o counter
$ ./counter
12
```

Now the proof that `private` is a real, enforced boundary, not just a
comment — add one line to `main` that reaches directly for `count`
instead of going through `increment()`/`get()`:

```cpp
Counter c(10);
c.count = 999;
```

```
$ g++ counter_broken.cpp -o counter_broken
counter_broken.cpp:15:7: error: 'int Counter::count' is private within this context
   15 |     c.count = 999;
      |       ^~~~~
```

The compiler refused to build this — proof `private` isn't a
convention `main` is trusting itself to follow, it's a rule the
compiler enforces on `main`'s behalf.

### Discard the Throwaway Example

`counter.cpp` and `Counter` are scratch work. The real project defines
`Table`, next.

### Project Change

- **Files affected:** `storage/table.h` — new file. `storage/table.cpp`
  — new file. `mydb.cpp` — modified.
- **Change type:** create (`table.h`, `table.cpp`) + refactor (`main`'s
  raw file-handling replaced with calls through a `Table` object).
- **Location:** in `mydb.cpp`, everything between building `students`
  and the final `ifstream` read-back loop — i.e. the direct
  `std::ofstream out(...)` write loop and the `std::ifstream in(...)`
  read loop — is deleted and replaced with a `Table` object and calls
  to it.
- **Dependencies:** the new `storage/table.h` and `storage/table.cpp`,
  and building now requires passing *both* `.cpp` files to `g++`,
  exactly as the header-file lab demonstrated.

### The New Code

```cpp
#pragma once
#include <string>
#include "student.h"

class Table {
public:
    Table(const std::string& filename);
    void insert(const Student& s);
    void printAll() const;

private:
    std::string filename;
};
```

### The Updated Project

`storage/table.h`, in full — new file, nothing to return to yet.

`storage/table.cpp`, in full — also new, but shown here as its own
whole structure since it's the definitions matching the declarations
above:

```cpp
#include "table.h"
#include <iostream>
#include <fstream>

Table::Table(const std::string& filename) : filename(filename) {}

void Table::insert(const Student& s) {
    std::ofstream out(filename, std::ios::app);
    out << s.id << "," << s.name << "," << s.age << "\n";
    out.close();
}

void Table::printAll() const {
    std::ifstream in(filename);
    std::string line;
    while (std::getline(in, line)) {
        std::cout << line << "\n";
    }
}
```

`mydb.cpp`, in full, with the change applied:

```cpp
#include <iostream>
#include <vector>
#include "storage/student.h"
#include "storage/table.h"           // ← new

Student readStudent() {
    Student s;
    std::cout << "Enter id, name, age: ";
    if (!(std::cin >> s.id >> s.name >> s.age)) {
        std::cout << "Invalid input, using defaults.\n";
        s.id = 0;
        s.name = "unknown";
        s.age = 0;
    }
    return s;
}

int main() {
    Table table("school.db");                    // ← new

    std::vector<Student> students = {
        {1, "Alice", 20},
        {2, "Bob", 22}
    };
    for (const Student& s : students) {           // ← new
        table.insert(s);                          // ← new
    }                                               // ← new

    Student newStudent = readStudent();
    table.insert(newStudent);                      // ← new

    table.printAll();                               // ← new

    return 0;
}
```

`main` no longer touches a raw file handle anywhere. It builds one
`Table`, hands it every student — the two hardcoded ones and the one
just read from the keyboard — through `insert`, and asks it to
`printAll`. Every detail of *how* that happens (open mode, `<<`
formatting, closing the handle) now lives entirely inside
`table.cpp`, invisible to `main`.

### Mechanical Walkthrough
- `class Table` — **first appearance.** Declares a new type, same
  general idea as `struct Student`, but a `class` defaults its members
- to `private` instead of `public` — the mechanism this unit's whole
  Problem section was about.
- `public:` / `private:` — **first appearance.** Access specifiers:
  everything listed after `public:` is reachable from outside the
  class (`table.insert(...)` in `main`); everything after `private:` is
  only reachable from `Table`'s own member functions.
- `Table(const std::string& filename);` — **first appearance** of a
  *constructor declaration*: a special member function, named exactly
  after the class, with no return type, that runs when a `Table` is
  created. This line in the header is only the declaration — no body —
  matching this unit's whole Problem/lab about declarations living
  separately from definitions.
- `void insert(const Student& s);`, `void printAll() const;` — **first
  appearance** of *member function declarations*: the header lists
  their signatures, the `.cpp` supplies their bodies. `const` after
  `printAll()`'s parameter list is new here specifically as a promise
  about the function itself — "calling this will not modify the
- `Table` object it's called on" — distinct from the `const` you've
  already seen on parameters (Lesson 2), though the same underlying
  idea of "this won't be changed."
- `std::string filename;` under `private:` — reuses `std::string`
  member declarations from `struct Student` (basic reuse), just now
  inaccessible from outside `Table`.
- `Table::Table(const std::string& filename) : filename(filename) {}`
- — **first appearance** of the *scope resolution operator* `::` used
  to define a class's member outside the class body ("this is `Table`'s
  constructor, being defined here in the `.cpp`") and of a *member
- initializer list* — the `: filename(filename)` part, which sets the
  private member `filename` to the value of the constructor's
  parameter (also confusingly named `filename`) before the constructor
  body even runs. The empty `{}` after it is the (empty) constructor
  body — there's nothing left to do once the initializer list has set
  the one member.
- `void Table::insert(const Student& s) { ... }`,
- `void Table::printAll() const { ... }` — reuse the same `::`
  definition pattern just introduced, and their bodies are the exact
  `ofstream`/`ifstream` code from Lessons 1–3, relocated verbatim, not
  rewritten — worth noticing explicitly, since it's proof this lesson
  is reorganizing working code, not reinventing it.
- `Table table("school.db");` — **first appearance** of constructing an
  object of a user-defined class by calling its constructor with an
- argument — same general shape as `Student s;` from Lesson 3's
  `readStudent`, but this time passing a value in, which is what the
  constructor's parameter is for.
- `table.insert(s);`, `table.printAll();` — **first appearance** of
  calling member functions on an object *you* declared (`push_back` in
  Lesson 3 was a member function too, but on a standard-library object,
  not one of your own types) — same dot-syntax, reused.

### CS Lens

This is **encapsulation**: bundling data (`filename`) together with the
operations that are allowed to touch it (`insert`, `printAll`), and
making the data itself unreachable except through those operations.
Also recognized in: a Python class's leading-underscore convention
(weaker — it's a social contract, not enforced, unlike C++'s `private`);
a bank account object that only allows balance changes through
`deposit`/`withdraw`, never direct assignment; and, at the scale this
project is headed toward, `storage/`'s entire public API — `insert`,
`selectAll`, `update`, `remove` — which Level 2's SQL executor will call
without ever knowing or caring that a plain text file sits behind it.

### SE Lens

The alternative — leaving `main` to call `ofstream`/`ifstream` directly,
as it did through Lesson 3 — works fine at this scale, but it means
every future piece of code that wants to touch `school.db` (Level 2's
executor, Level 3's page-based rewrite) has to reimplement or copy this
exact file-handling logic, and any bug fix has to be found and applied
everywhere it was copied. `Table` pays a small cost now — one more
layer to look through — in exchange for a real guarantee later: Level 3
can completely replace *how* `Table` stores data (pages, indexes,
binary format instead of plain text lines) without changing one line of
`main`, because `main` was never allowed to know how storage worked in
the first place. That guarantee is only real because `filename` is
`private` — if `main` could reach around `Table` today, nothing would
stop it from depending on the plain-text format directly, and Level 3's
promised drop-in replacement would be a lie.

### Commands

- `g++ mydb.cpp storage/table.cpp -o mydb -Wall` — **first appearance**
  of actually compiling two `.cpp` files together for this project,
  exactly as the header-file lab demonstrated. `storage/student.h` and
  `storage/table.h` don't get listed here — headers are never compiled
  directly, only pasted in via `#include` wherever they're needed.

### Run It

```
$ g++ mydb.cpp storage/table.cpp -o mydb -Wall
$ rm -f school.db
$ echo "3 Carol 19" | ./mydb
Enter id, name, age: 1,Alice,20
2,Bob,22
3,Carol,19
$ echo "4 Dan 21" | ./mydb
Enter id, name, age: 1,Alice,20
2,Bob,22
3,Carol,19
1,Alice,20
2,Bob,22
4,Dan,21
```

Identical behavior to Lesson 3, including the append-on-second-run
proof — confirming this refactor changed the program's *organization*,
not what it does.

### One Sentence Connecting This to What Came Before

The previous unit gave `Student` its own file; this unit does the same
for *behavior*, giving storage logic a single, protected owner instead
of leaving it scattered through `main`.

---

## Closing

**Connect the pieces.** Follow the compiler, not the data, through this
lesson: `mydb.cpp` reaches `struct Student` only through
`#include "storage/student.h"` (Unit 1) → it reaches every storage
operation only through the five public lines of `storage/table.h`
(Unit 2) → it never sees `table.cpp`'s actual `ofstream`/`ifstream`
code at all, because that code compiles as a separate translation unit
and only gets linked in at the very last step, `g++ mydb.cpp
storage/table.cpp -o mydb`. Three files, one program, and `main` more
ignorant of *how* storage works than it's ever been — on purpose.

**What breaks without this.** Temporarily move `std::string filename;`
in `table.h` from `private:` to `public:`, then add one line in `main`:
`table.filename = "hacked.db";` right after constructing `table`. It
compiles and runs fine — silently — printing from a completely
different, empty file:

```
$ g++ mydb.cpp storage/table.cpp -o mydb -Wall
$ ./mydb
Enter id, name, age: 3 Carol 19
```

No output at all after the prompt — `printAll()` is reading from
`hacked.db`, which doesn't have `Alice`/`Bob`/`Carol` in it, and nothing
warned you `table`'s filename had been reached around and changed.
Revert `filename` back to `private:` and remove that line before
continuing.

**Exercises.**
1. Add a fourth public method to `Table`, `int count() const`, that
   returns how many lines are currently in the file (hint: you already
   know how to loop over every line — just count instead of printing).
   Call it from `main` and print the result.
2. Explain, in your own words, why `table.cpp`'s functions are prefixed
   with `Table::` but `mydb.cpp`'s `readStudent()` isn't — what's
   different about where each one is defined relative to where it's
   declared.
3. Predict, then check: if you delete `#pragma once` from
   `storage/student.h` entirely, does `mydb.cpp` still compile? (It
   currently only gets `#include`d once per build, so nothing forces
   the duplicate-definition problem to actually occur yet — worth
   understanding why the guard matters *in general* even when today's
   project doesn't happen to trigger the failure.)

**Definition of done.**
- [ ] `g++ mydb.cpp storage/table.cpp -o mydb -Wall` compiles cleanly —
      no warnings.
- [ ] Running `./mydb` twice still shows correct accumulated output,
      identical in content to Lesson 3.
- [ ] You can explain, without rereading the SE Lens, why `filename`
      being `private` matters for a change Level 3 hasn't happened yet
      but is already planned.
- [ ] You've completed exercise 1 above.
- [ ] **Update `API_Reference.md`** — this is the first lesson with a
      real public API to document. Fill in the `storage/` section with
      `Table`'s constructor and its three public methods, their
      signatures, and one line each on what they do. Mark the section
      🟡 (in progress — `update`/`remove` are still to come in
      Lesson 5).
- [ ] `git add mydb.cpp storage/ API_Reference.md && git commit -m
      "Split storage into its own module behind a Table class

      Student and all file-handling logic now live under storage/,
      reachable only through Table's public insert/printAll — main no
      longer touches a raw file handle. This is what will let Level 3
      replace the storage internals later without changing main at
      all."`
