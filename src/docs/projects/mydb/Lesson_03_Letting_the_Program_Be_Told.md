# Lesson 3: Letting the Program Be Told, Not Told-to
*(`std::cin`, Naming a Sequence of Steps, and Checking Whether a Read Worked)*

**What you will build.** Every student `mydb` has ever stored was typed
into the source code by you, the programmer — adding a real record
means editing `mydb.cpp` and recompiling. Today `mydb` will ask whoever
is running it for a new student's id, name, and age at runtime, wrap
that prompt-and-read logic in its own named function instead of
cluttering `main`, and refuse to silently corrupt the record if the
person types something that isn't a number.

**What you need to know first.** Lesson 2 — `struct Student`,
`std::vector<Student>`, range-based `for`. All reused unchanged here.

---

## Concept Unit: Reading Typed Input from the User (`std::cin`, `>>`)

### The Problem

`mydb` can currently only ever write the two students hardcoded into
its source. A database that only knows what its own programmer typed in
advance isn't a database — the whole point is that *someone else*,
later, with data you don't know yet, gets to put things into it. The
program needs a way to pause and accept a value from whoever's actually
running it.

### Introduce the Concept in Isolation

Throwaway file, `cin_lab.cpp`:

```cpp
#include <iostream>

int main() {
    int age;
    std::cout << "Enter age: ";
    std::cin >> age;
    std::cout << "You entered: " << age;
    return 0;
}
```

Run, typing `20` when prompted:

```
$ g++ cin_lab.cpp -o cin_lab
$ ./cin_lab
Enter age: 20
You entered: 20
```

The value `20`, typed at the keyboard after the prompt, correctly ended
up inside the `age` variable and got printed back — proof `std::cin >>`
can pull a real, typed value out of whatever the user types, not just
read raw uninterpreted text.

### Discard the Throwaway Example

`cin_lab.cpp` is scratch work. The real project reads a new student's
fields next.

### Project Change

- **Files affected:** `mydb.cpp` — modified.
- **Change type:** add.
- **Location:** inside `main`, immediately after the `students` vector
  from Lesson 2 is built, before the `std::ofstream` write loop.
- **Dependencies:** none beyond what's already included.

### The New Code

```cpp
int id;
std::string name;
int age;
std::cout << "Enter id, name, age: ";
std::cin >> id >> name >> age;
std::cout << "You entered: " << id << ", " << name << ", " << age << "\n";
```

### The Updated Project

```cpp
#include <iostream>
#include <fstream>
#include <string>
#include <vector>

struct Student {
    int id;
    std::string name;
    int age;
};

int main() {
    std::vector<Student> students = {
        {1, "Alice", 20},
        {2, "Bob", 22}
    };

    int id;                                             // ← new
    std::string name;                                    // ← new
    int age;                                              // ← new
    std::cout << "Enter id, name, age: ";                 // ← new
    std::cin >> id >> name >> age;                        // ← new
    std::cout << "You entered: " << id << ", " << name    // ← new
               << ", " << age << "\n";                    // ← new

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

`main` now prompts for and reads three loose values from the keyboard
and echoes them back — but notice they're not yet a `Student`, and they
never get added to `students`. This is a deliberately temporary,
disconnected step: the next unit's whole job is turning these three
loose variables into a real record.

### Mechanical Walkthrough
- `int id;`, `std::string name;`, `int age;` — three plain variable
  declarations. `int` and `std::string` are both reused from earlier
  lessons; declaring a variable with no initializer (no `=` anything) is
  new in the sense that it now matters — these three variables start
  with whatever the compiler leaves there (for `int`) or empty (for
  `std::string`) until `std::cin` fills them in below.
- `std::cin` — **first appearance.** The counterpart to `std::cout`
  from Lesson 1: an object representing standard *input* — your
- keyboard — the same way `std::cout` represents standard output.
- `>>` — **first appearance.** The *stream extraction operator* —
  `<<`'s mirror image. Where `<<` sends data into a stream, `>>` pulls
  data out of one, converting the typed text into whatever type the
  target variable is (here, first an `int`, then a `std::string`, then
  another `int`).
- `std::cin >> id >> name >> age;` — chaining `>>` the same way `<<` was
  chained back in Lesson 1 (basic reuse of the chaining pattern) —
  each `>>` reads one whitespace-separated token in order: first token
  becomes `id`, second becomes `name`, third becomes `age`.

### CS Lens

This is your first real use of a **stream** in the *input* direction:
data flowing from an external source, one token at a time, converted
into typed values as it arrives — the input half of the same
abstraction `std::cout` has been the output half of since Lesson 1.
Also recognized in: Python's `input()` (far simpler, but the same idea
of "pause and pull a value from outside the program"), reading a line
from a network socket, and — the direction this project is actually
headed — reading a SQL query typed at a `mydb` prompt, one token at a
time, in Level 2.

### SE Lens

The alternative to runtime input is what `mydb` has been doing since
Lesson 1: everything baked into the source, requiring a recompile to
change. That's fine for a teaching example, useless for anything real —
no actual database ships with its data hardcoded into its own binary.
The cost of accepting input at runtime is one this unit hasn't paid yet
but the next two units will: the program no longer controls what it
receives, so it has to be built to handle input that doesn't look like
what it expected.

### Commands

No new commands.

### Run It

```
$ g++ mydb.cpp -o mydb -Wall
$ echo "3 Carol 19" | ./mydb
Enter id, name, age: You entered: 3, Carol, 19
1,Alice,20
2,Bob,22
```

(Piping input with `echo "... " | ./mydb` here so this documented run
is reproducible without you retyping it — running `./mydb` directly and
typing at the prompt works identically.) Note `school.db` only shows
Alice and Bob — Carol was read and echoed back, but, as flagged above,
nothing wired her into `students` yet.

### One Sentence Connecting This to What Came Before

Lesson 2 gave `mydb` a shape to hold records in; this unit is the first
time a record's values came from outside the program instead of from
you, the programmer, typing them into the source.

---

## Concept Unit: Naming a Sequence of Steps (User-Defined Functions)

### The Problem

The prompt-and-read code from the last unit works, but it's sitting
directly inside `main`, mixed in with everything else `main` does —
build the student list, write the file, read the file back. `main`'s
job should be *orchestrating* the run, not containing the full detail
of exactly how one student gets read from the keyboard. That detail
deserves its own name.

### Introduce the Concept in Isolation

Throwaway file, `func_lab.cpp`:

```cpp
#include <iostream>

int square(int x) {
    return x * x;
}

int main() {
    std::cout << square(5);
    return 0;
}
```

```
$ g++ func_lab.cpp -o func_lab
$ ./func_lab
25
```

`square(5)` correctly produced `25` — proof that a function can be
defined once, called by name with a specific input, and hand back a
result to wherever it was called from, without `main` needing to know
*how* the squaring happened.

### Discard the Throwaway Example

`func_lab.cpp` and `square` are scratch work. The real project wraps
the reading logic in a function called `readStudent`, next.

### Project Change

- **Files affected:** `mydb.cpp` — modified.
- **Change type:** refactor (extract into a function) + replace (the
  loose variables and manual echo from the previous unit).
- **Location:** the new function is defined above `main`, below the
  `struct Student` definition; inside `main`, it replaces the entire
  block of loose `int id; std::string name; int age; ...` code from the
  previous unit.
- **Dependencies:** none new.

### The New Code

```cpp
Student readStudent() {
    Student s;
    std::cout << "Enter id, name, age: ";
    std::cin >> s.id >> s.name >> s.age;
    return s;
}
```

### The Updated Project

```cpp
#include <iostream>
#include <fstream>
#include <string>
#include <vector>

struct Student {
    int id;
    std::string name;
    int age;
};

Student readStudent() {                              // ← new
    Student s;                                        // ← new
    std::cout << "Enter id, name, age: ";              // ← new
    std::cin >> s.id >> s.name >> s.age;                // ← new
    return s;                                           // ← new
}                                                         // ← new

int main() {
    std::vector<Student> students = {
        {1, "Alice", 20},
        {2, "Bob", 22}
    };

    Student newStudent = readStudent();               // ← new
    students.push_back(newStudent);                    // ← new

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

`main` is now much shorter to read at a glance: build the starting
list, call `readStudent()` to get one new record, add it to the list
with `push_back`, write everything out, read everything back. The
detail of *how* a student gets read from the keyboard lives entirely
inside `readStudent`, where `main` never has to look at it again.

### Mechanical Walkthrough
- `Student readStudent()` — **first appearance** of a user-defined
- function beyond `main` itself.
- `Student` here is the *return type* —
  a promise that calling this function eventually hands back one
  `Student`. Empty parentheses mean it takes no parameters. This is the
  same shape as `int square(int x)` from the lab, just with a
  user-defined type as the return type instead of a built-in one.
- `Student s;` — declares a local `Student`, uninitialized, exactly the
  same construct as `Point p` back in Lesson 2's lab, reused here inside
  a function body instead of `main`.
- `std::cin >> s.id >> s.name >> s.age;` — reuses `std::cin` and `>>`
  from the previous unit (basic reuse) — the only difference is the
  targets are now struct members (`s.id`, reusing member-access syntax
  from Lesson 2) instead of three separate loose variables.
- `return s;` — reuses `return` from `main`'s own `return 0;` since
- Lesson 1 (a hard concept reappearing — Lesson 1 taught `return` as
  "hand back main's result code"; here it's the same keyword doing the
  same job — hand back a value to the caller — just handing back a
  `Student` instead of an `int`).
- `Student newStudent = readStudent();` — **first appearance** of
  *calling* a user-defined function and storing its result: the
  parentheses invoke `readStudent`, and everything inside its body runs
  before this line finishes, with whatever it `return`s becoming
  `newStudent`'s value.
- `students.push_back(newStudent);` — **first appearance** of
  `push_back`, a member function on `std::vector` (reusing the general
  idea of calling a member function, already seen with `.size()` in
  Lesson 2) that appends one element to the end, growing the vector by
  one.

### CS Lens

This is **procedural decomposition**: splitting a program into named,
independently-understandable steps, each with a single job, rather than
one long sequence of statements. Also recognized in: every Python
function you've already written without a formal name for what you were
doing, a recipe's numbered steps versus one giant paragraph, and — the
principle this project will lean on constantly from here forward — the
entire reason `storage/` gets split into its own module with its own
API starting in Lesson 4: the same idea, one level bigger.

### SE Lens

The alternative — leaving the reading logic inline in `main`, as the
previous unit did — doesn't break anything today, at three lines. It
breaks as a program grows: `main` becomes a long, undifferentiated block
where finding "the part that reads a student" means reading past
everything else first. Extracting `readStudent()` costs a small amount
of indirection now (you have to look in two places instead of one) in
exchange for `main` staying readable as a *summary* of the program's
steps, no matter how much detail piles up inside each function later.

### Commands

No new commands.

### Run It

```
$ g++ mydb.cpp -o mydb -Wall
$ rm -f school.db
$ echo "3 Carol 19" | ./mydb
Enter id, name, age: 1,Alice,20
2,Bob,22
3,Carol,19
```

Carol is now genuinely part of the persisted data — visibly different
from the previous unit, where she was only echoed back, never stored.

### One Sentence Connecting This to What Came Before

The previous unit proved `mydb` could receive a value from outside
itself; this unit is what actually lets that value join the real data
instead of just being printed and forgotten.

---

## Concept Unit: Checking Whether the Read Actually Worked (`!`)

### The Problem

`readStudent()` currently trusts the user completely: `std::cin >>
s.id` expects a number, but nothing stops someone from typing `three`
instead. When that happens, `s.id` doesn't get a sensible fallback —
it's left in an undefined state, silently, with no error and no signal
anything went wrong. A database that silently accepts garbage isn't
safe to build anything on top of.

You already have the tool to detect this: Lesson 1's `while
(std::getline(in, line))` worked as a loop condition because `getline`
reports whether it succeeded, not just what it read. `std::cin >>` does
the exact same thing — it can be tested directly for success or
failure. What's new here isn't that idea, which you already know; it's
one small piece of syntax needed to *ask the opposite question* — "did
this fail?" — cleanly.

### Introduce the Concept in Isolation

Throwaway file, `fail_lab.cpp`:

```cpp
#include <iostream>

int main() {
    int age;
    std::cout << "Enter age: ";
    if (!(std::cin >> age)) {
        std::cout << "that wasn't a number";
    } else {
        std::cout << "got: " << age;
    }
    return 0;
}
```

Run twice, once with valid input, once with invalid:

```
$ g++ fail_lab.cpp -o fail_lab
$ echo "20" | ./fail_lab
Enter age: got: 20
$ echo "twenty" | ./fail_lab
Enter age: that wasn't a number
```

Same program, same code path, two different outcomes depending purely
on whether `std::cin >> age` succeeded — proof the failing branch is
real and reachable, not just written and never tested.

### Discard the Throwaway Example

`fail_lab.cpp` is scratch work. The real project adds this check inside
`readStudent`, next.

### Project Change

- **Files affected:** `mydb.cpp` — modified.
- **Change type:** replace.
- **Location:** inside `readStudent`, replacing the single line
  `std::cin >> s.id >> s.name >> s.age;`.
- **Dependencies:** none new.

### The New Code

```cpp
if (!(std::cin >> s.id >> s.name >> s.age)) {
    std::cout << "Invalid input, using defaults.\n";
    s.id = 0;
    s.name = "unknown";
    s.age = 0;
}
```

### The Updated Project

```cpp
#include <iostream>
#include <fstream>
#include <string>
#include <vector>

struct Student {
    int id;
    std::string name;
    int age;
};

Student readStudent() {
    Student s;
    std::cout << "Enter id, name, age: ";
    if (!(std::cin >> s.id >> s.name >> s.age)) {   // ← new
        std::cout << "Invalid input, using defaults.\n";  // ← new
        s.id = 0;                                    // ← new
        s.name = "unknown";                           // ← new
        s.age = 0;                                     // ← new
    }                                                    // ← new
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

`readStudent` now protects its own return value: if the three reads
succeed, `s` holds exactly what the user typed, same as before; if any
of them fail, `s` is overwritten with a known, harmless placeholder
record instead of whatever partially-read garbage would otherwise have
ended up there — and `main` never has to know the difference, since
either way it gets back one complete `Student`.

### Mechanical Walkthrough
- `!` — **first appearance.** The logical NOT operator: flips `true` to
  `false` and vice versa. `!(std::cin >> ...)` reads as "NOT (this read
  succeeded)" — i.e., "if this read failed."
- `(std::cin >> s.id >> s.name >> s.age)` — **a hard concept
  reappearing** (per the Repetition Rule): this is the exact same
  "a stream, used as a condition, reports success or failure" idea
  Lesson 1 taught with `while (std::getline(in, line))`. The only
  difference is which stream operation is being tested, and that it's
- wrapped in `!` and used inside an `if` here instead of a `while` —
  the underlying idea, not re-taught in full.
- `if (...) { ... }` — reuses `if` conditionally-executed blocks, the
- same shape as the `if`/`else` in the throwaway lab above — basic
  reuse.
- `s.id = 0;`, `s.name = "unknown";`, `s.age = 0;` — plain assignment to
  already-declared struct members; reuses member access from Lesson 2,
  reuses assignment (already familiar from every `=` used since
  Lesson 1's `std::string record = "..."`).

### CS Lens

This is **input validation via a guard clause**: checking whether an
operation succeeded *before* trusting anything it produced, rather than
proceeding optimistically and discovering the problem later, somewhere
harder to trace back. Also recognized in: checking a file actually
opened before reading from it (a check this project has been skipping,
worth noticing), an HTTP client checking a response's status code
before parsing its body, and SQL itself: a real database checks that a
value being inserted matches its column's declared type before it ever
touches storage — exactly this idea, one level up, arriving properly in
Level 2.

### SE Lens

The alternative — trusting `std::cin >>` unconditionally, as the
previous unit did — isn't just impolite to the user; it's a real
correctness bug: an `int` that failed to read is left holding an
indeterminate value, which could silently become student id `12` or
`-4212` or anything else, indistinguishable from a real, intentional id.
The defaults chosen here (`0`, `"unknown"`, `0`) are a minimal fix,
and an honest one to flag: they don't actually solve invalid input,
they just make its failure mode visible and harmless instead of silent
and undefined. A more complete answer — reject the record entirely,
or loop and re-prompt — is a real design choice this project is
deferring, not one that's been solved.

### Commands

No new commands.

### Run It

```
$ g++ mydb.cpp -o mydb -Wall
$ rm -f school.db
$ echo "3 Carol 19" | ./mydb
Enter id, name, age: 1,Alice,20
2,Bob,22
3,Carol,19
$ rm -f school.db
$ echo "three Carol nineteen" | ./mydb
Enter id, name, age: Invalid input, using defaults.
1,Alice,20
2,Bob,22
0,unknown,0
```

Valid input round-trips exactly as before; invalid input is caught and
replaced with the visible placeholder record instead of corrupting
`school.db` with garbage — both branches confirmed, not just the happy
path.

### One Sentence Connecting This to What Came Before

The previous unit made `readStudent` a real, callable step in the
program; this unit is what stops that step from quietly lying to the
rest of the program when its input doesn't cooperate.

---

## Closing

**Connect the pieces.** Follow a single run typing `three Carol
nineteen`: `std::cin >> s.id` fails immediately on the non-numeric first
token → the whole chained `std::cin >> s.id >> s.name >> s.age`
expression evaluates as failed → `!(...)` flips that failure into
`true` → the `if` block runs, overwriting `s` with the placeholder
record → `readStudent()` returns that placeholder, not garbage → `main`
receives it via `Student newStudent = readStudent();`, no different from
a successful read as far as `main` can tell → `push_back` adds it to
`students` → the write loop serializes it to `school.db` as
`0,unknown,0` → the read-back loop prints it, visibly showing the
placeholder rather than a silent failure.

**What breaks without this.** Temporarily remove the `if (!(...))`
guard, going back to a plain `std::cin >> s.id >> s.name >> s.age;`
with no check, and run with invalid input again:

```
$ echo "three Carol nineteen" | ./mydb
Enter id, name, age: 1,Alice,20
2,Bob,22
0,,0
```

Notice `s.name` came back empty and `s.id`/`s.age` came back `0` — not
an error, not a crash, just quietly wrong data written straight into
`school.db` with nothing telling you it happened. Restore the guard
clause before continuing.

**Exercises.**
1. Change the placeholder defaults to something more obviously
   suspicious (e.g. `id = -1`) and explain why that might be a better
   design than `id = 0`, which could accidentally collide with a real
   future record.
2. Add a second call to `readStudent()` in `main` so the program reads
   two new students per run instead of one, and confirm both get
   appended correctly.
3. Predict, then check: what happens if you type a valid id and age but
   leave out the name entirely (e.g. just `3 19`)? Which field ends up
   holding the age's value, and why, given `>>` reads tokens strictly
   left to right?

**Definition of done.**
- [ ] `mydb.cpp` compiles cleanly with `g++ mydb.cpp -o mydb -Wall` — no
      warnings.
- [ ] Running `./mydb` with valid input appends a correct new record;
      running it with invalid input appends the visible placeholder
      instead of silently-wrong data.
- [ ] You can explain, without rereading the CS Lens above, why
      `!(std::cin >> ...)` works as a failure check — specifically, what
      idea it's reusing from Lesson 1.
- [ ] You've completed exercise 3 above.
- [ ] `git add mydb.cpp && git commit -m "Accept a new student from the
      user at runtime instead of only hardcoded data

      Wrapped input-reading in readStudent() so main stays a summary of
      the program's steps, and guarded it against non-numeric input —
      the first real validation in this project, though the defaults
      it falls back to are a placeholder, not a real answer to bad
      input."`
