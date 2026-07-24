# Lesson 6: Proving It Without Reading the Output Yourself
*(Automated Tests, and Turning `mydb` Into Something You Actually Run)*

**What you will build.** Every lesson so far has been verified the same
way: run the program, read the printed output, decide by eye whether it
looks right. That doesn't scale, and it doesn't survive Level 2 changing
code that Level 1 already got working. Today `storage/` gets a real
test suite — code whose only job is to check `Table`'s behavior and
say so, without a human reading anything. And since this closes out
Level 1, `mydb.cpp` stops running one hardcoded demo and becomes an
actual interactive tool: type a command, get a result, keep going until
you quit.

**What you need to know first.** Lesson 5 in full — `Table`'s complete,
frozen public API (`insert`, `selectAll`, `printAll`, `update`,
`remove`), and that `update`/`remove` throw `std::runtime_error` on a
missing id.

---

## Concept Unit: Proving Behavior With `assert`, Not With Your Eyes

### The Problem

Every "Run It" section in this curriculum so far has ended the same
way: you, personally, reading printed text and deciding whether it
matches what was expected. That's fine for a lesson, but it's not how
you'd know, six months from now, whether some unrelated change in
Level 3 quietly broke `Table::update`. What's needed is code that makes
that judgment call itself — and stops the program, loudly, the moment
something it expected to be true turns out not to be.

### Introduce the Concept in Isolation

Throwaway file, `assert_lab.cpp`:

```cpp
#include <cassert>
#include <iostream>

int main() {
    int x = 2 + 2;
    assert(x == 4);
    std::cout << "passed the first check" << std::endl;

    assert(x == 5);
    std::cout << "this line never runs" << std::endl;
    return 0;
}
```

```
$ g++ assert_lab.cpp -o assert_lab
$ ./assert_lab
passed the first check
assert_lab: assert_lab.cpp:9: int main(): Assertion `x == 5' failed.
Aborted
$ echo "exit code: $?"
exit code: 134
```

The first `assert` — a true statement — let the program continue
silently, proving `assert` costs nothing when it's satisfied. The
second — false — immediately halted the program *before* printing "this
line never runs," with a message naming the exact file, line, and
condition that failed, and a nonzero exit code. That combination —
silent when true, loud and specific when false — is exactly what a test
needs to do instead of a human reading output.

### Discard the Throwaway Example

`assert_lab.cpp` is scratch work. The real tests check `Table`'s actual
behavior, next.

### Project Change

- **Files affected:** `storage/table_test.cpp` — new file.
- **Change type:** create.
- **Location:** n/a — new file, nothing to locate a position within.
- **Dependencies:** `<cassert>`, for `assert`; this file has its own
  `main`, so it compiles into its *own* executable, separate from
  `mydb` — more on why in this unit's Commands step.

### The New Code

```cpp
void testInsertAndSelectAll() {
    std::remove("test.db");
    Table table("test.db");

    table.insert({1, "Alice", 20});
    table.insert({2, "Bob", 22});

    std::vector<Student> students = table.selectAll();
    assert(students.size() == 2);
    assert(students[0].name == "Alice");
    assert(students[1].age == 22);

    std::cout << "testInsertAndSelectAll passed" << std::endl;
}
```

### The Updated Project

`storage/table_test.cpp`, in full — new file, nothing to return to yet:

```cpp
#include <cassert>
#include <iostream>
#include <cstdio>
#include "table.h"

void testInsertAndSelectAll() {
    std::remove("test.db");
    Table table("test.db");

    table.insert({1, "Alice", 20});
    table.insert({2, "Bob", 22});

    std::vector<Student> students = table.selectAll();
    assert(students.size() == 2);
    assert(students[0].name == "Alice");
    assert(students[1].age == 22);

    std::cout << "testInsertAndSelectAll passed" << std::endl;
}

void testUpdate() {
    std::remove("test.db");
    Table table("test.db");
    table.insert({1, "Alice", 20});

    table.update(1, {1, "Alice", 21});

    std::vector<Student> students = table.selectAll();
    assert(students.size() == 1);
    assert(students[0].age == 21);

    std::cout << "testUpdate passed" << std::endl;
}

void testRemove() {
    std::remove("test.db");
    Table table("test.db");
    table.insert({1, "Alice", 20});
    table.insert({2, "Bob", 22});

    table.remove(1);

    std::vector<Student> students = table.selectAll();
    assert(students.size() == 1);
    assert(students[0].id == 2);

    std::cout << "testRemove passed" << std::endl;
}

int main() {
    testInsertAndSelectAll();
    testUpdate();
    testRemove();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
```

Each test function is self-contained: it deletes any leftover
`test.db` from a previous run first (so tests never depend on
leftover state), builds a fresh `Table`, exercises one piece of
behavior, and asserts specific, concrete expectations about the
result — not "did it print something," but "does `selectAll()`
actually return two students, and is the second one's age actually
22." `main` here isn't `mydb`'s `main` — it's this file's own entry
point, whose only job is to run every test function in order.

### Mechanical Walkthrough
- `#include <cassert>` — **first appearance.** Declares the `assert`
  macro used throughout this file.
- `std::remove("test.db");` — reuses `std::remove` from Lesson 5 (basic
- reuse), here as test setup rather than part of `Table`'s own logic —
  deleting any file left over from a previous test run, so every test
  starts from a guaranteed-empty state.
- `Table table("test.db");` — reuses the `Table` constructor (basic
- reuse), pointed at a dedicated test filename, never `school.db` — a
  test that touched real data would risk corrupting it, or worse, would
  pass or fail depending on whatever happened to already be in
  `school.db` from a previous run.
- `table.insert({1, "Alice", 20});` — reuses `insert` and brace-
  initialization (basic reuse), passing a `Student` built inline rather
  than through a separate named variable.
- `assert(students.size() == 2);` — **first appearance** of `assert` in
  the real project, reusing the exact mechanism from the lab: if this
  condition is false, the program halts here, naming this exact line.
- `assert(students[0].name == "Alice");` — reuses `assert` and
  reintroduces indexing (`[0]`, familiar from `std::vector` since
- Lesson 2) and `==` comparison on `std::string` — comparing two
  strings for equality with `==` is genuinely basic here (it behaves
  the way you'd expect from Python), not owed a full explanation.
- `std::endl` — **first appearance.** Inserts a newline, like `"\n"`
  since Lesson 1, but *also* flushes the stream immediately. This
  matters specifically in test code: if a test's later `assert` fails
  and the program aborts, any output still sitting in an unflushed
- buffer never makes it to the screen — `std::endl` guarantees "passed"
  messages appear before that can happen, which is exactly what the
  lab's first line depended on to be visible at all.

### CS Lens

This is **automated regression testing**, and the specific shape here —
one small function per behavior, each asserting concrete expected
values — is a **unit test**: checking one unit of behavior in isolation
from the rest of the system. Also recognized in: Python's `unittest` or
`pytest` (same idea, friendlier failure reporting), every CI pipeline
that blocks a merge on a red test run, and the discipline this project
will lean on hardest starting in Level 3, when pages, indexes, and
transactions get complex enough that "read the output and see if it
looks right" stops being a realistic strategy at all.

### SE Lens

The alternative — what every previous lesson actually did — is manual
verification: run the program, read the output, trust your own
judgment that it's correct. That doesn't literally break anything
today, and it's genuinely appropriate for a single lesson's worth of
new code. It breaks as a *project* grows: manual verification doesn't
re-run itself, costs real time every time you want to check something
still works, and depends on a human noticing a subtle discrepancy in a
wall of printed text. A real cost here, worth naming honestly: these
three tests check `Table`'s happy paths well but don't yet test the
`throw` behavior from Lesson 5 (calling `update`/`remove` on a missing
id) — that's a gap, not an oversight to hide, and exercise 1 below asks
you to close it.

### Commands

- `g++ storage/table_test.cpp storage/table.cpp -o table_test -Wall` —
  compiles the test file together with `table.cpp` into its own
  executable, `table_test`, entirely separate from `mydb`. This has to
  be a separate build: `table_test.cpp` defines its own `main`, and
  `mydb.cpp` defines another — the two can never be linked into one
  program together. (Proven concretely below.)

### Run It

```
$ g++ storage/table_test.cpp storage/table.cpp -o table_test -Wall
$ ./table_test
testInsertAndSelectAll passed
testUpdate passed
testRemove passed
All tests passed!
```

And the proof these tests actually catch something, not just decorate
the project: temporarily break `Table::insert` so it silently refuses
to insert a student with id `1` —

```cpp
void Table::insert(const Student& s) {
    if (s.id == 1) return;   // deliberately broken
    std::ofstream out(filename, std::ios::app);
    ...
```

```
$ g++ storage/table_test.cpp storage/table.cpp -o table_test -Wall
$ ./table_test
table_test: storage/table_test.cpp:14: void testInsertAndSelectAll(): Assertion `students.size() == 2' failed.
Aborted
```

Caught immediately, on the very first test, with the exact line
number — proof this suite would actually catch a real regression, not
just pass no matter what. Revert the deliberate break before continuing.

And the linker proof that tests need their own executable — try
building everything together on purpose:

```
$ g++ mydb.cpp storage/table_test.cpp storage/table.cpp -o everything
/usr/bin/ld: multiple definition of `main';
collect2: error: ld returned 1 exit status
```

Confirmed: two `main` functions genuinely cannot coexist in one linked
program, exactly as this unit's Commands step claimed.

### One Sentence Connecting This to What Came Before

Every earlier lesson trusted you to notice if `Table` was wrong; this
unit is the first code in the project whose entire job is noticing
that instead.

---

## Concept Unit: Turning `mydb` Into Something You Actually Run

### The Problem

`mydb.cpp`'s `main` currently does one fixed thing: insert two
hardcoded students, read one more from the keyboard, remove a hardcoded
id, update a hardcoded id, print, and exit. That was useful for
demonstrating each piece of `Table`'s API as it was built, but it isn't
a tool — you can't ask it to remove a *different* student without
editing and recompiling `mydb.cpp` itself. Level 1 is ending; `mydb`
should end it as something you can actually sit down and use.

### Introduce the Concept in Isolation

No new language construct is being introduced here — `while`,
`std::cin >>`, `if`/`else`, and `std::string` comparison with `==` are
all already-taught tools (Lessons 1, 3, 6's own testing unit above).
This unit is skipped for the Concept Isolation Rule's throwaway-lab
step because there's no new syntax to isolate — what's new is
*composing* familiar tools into a loop that reads a command and
dispatches on it, which is best shown directly in the real project.

### Discard the Throwaway Example

N/A — no lab was introduced for this unit, per above.

### Project Change

- **Files affected:** `mydb.cpp` — modified.
- **Change type:** replace.
- **Location:** `main`'s entire body is replaced; `readStudent()` above
  it is unchanged.
- **Dependencies:** none new.

### The New Code

```cpp
std::string command;
std::cout << "mydb> ";
while (std::cin >> command) {
    if (command == "insert") {
        Student s = readStudent();
        table.insert(s);
    } else if (command == "select") {
        table.printAll();
    } else if (command == "quit") {
        break;
    } else {
        std::cout << "Unknown command: " << command << "\n";
    }
    std::cout << "mydb> ";
}
```

### The Updated Project

`mydb.cpp`, in full:

```cpp
#include <iostream>
#include <string>
#include <stdexcept>
#include "storage/student.h"
#include "storage/table.h"

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
    Table table("school.db");                       // ← new

    std::string command;                              // ← new
    std::cout << "mydb> ";                              // ← new
    while (std::cin >> command) {                         // ← new
        if (command == "insert") {                           // ← new
            Student s = readStudent();                          // ← new
            table.insert(s);                                     // ← new
        } else if (command == "select") {                          // ← new
            table.printAll();                                        // ← new
        } else if (command == "update") {                              // ← new
            int id;                                                       // ← new
            std::cin >> id;                                                // ← new
            Student s = readStudent();                                      // ← new
            try {                                                              // ← new
                table.update(id, s);                                              // ← new
            } catch (const std::runtime_error& e) {                                 // ← new
                std::cout << "Error: " << e.what() << "\n";                            // ← new
            }                                                                           // ← new
        } else if (command == "remove") {                                                // ← new
            int id;                                                                         // ← new
            std::cin >> id;                                                                    // ← new
            try {                                                                                // ← new
                table.remove(id);                                                                    // ← new
            } catch (const std::runtime_error& e) {                                                    // ← new
                std::cout << "Error: " << e.what() << "\n";                                                // ← new
            }                                                                                              // ← new
        } else if (command == "quit") {                                                                      // ← new
            break;                                                                                              // ← new
        } else {                                                                                                  // ← new
            std::cout << "Unknown command: " << command << "\n";                                                   // ← new
        }                                                                                                            // ← new
        std::cout << "mydb> ";                                                                                         // ← new
    }                                                                                                                     // ← new

    return 0;
}
```

`main` is now a genuine loop: print a `mydb> ` prompt, read one word as
a command, dispatch to whichever `Table` operation it names — prompting
for whatever further input that operation needs — and loop back for
another prompt, until `quit`. Every one of Lesson 5's `try`/`catch`
blocks is preserved exactly, just triggered by what you type instead of
by hardcoded calls.

### Mechanical Walkthrough
- `std::string command;` then `while (std::cin >> command)` — reuses
- `std::cin >> variable` as a loop condition — **a hard concept
  reappearing** (per the Repetition Rule): Lesson 3 already established
  that a stream read reports success or failure and can drive a `while`
  loop; this is the exact same idea Lesson 1's `getline` loop used,
  just with `>>` instead of `getline`. Reading a whole command loop's
  worth of typed words this way will naturally stop if input ever runs
  out (e.g., piped input ending), the same sentinel-iteration idea from
  Lesson 1.
- `if (command == "insert")` — reuses `if` and `==` string comparison
  (just introduced this lesson's previous unit, in the test file) — no
  new syntax.
- `else if` — **first appearance** as its own named form, though it's a
  direct, minor extension of `if`/`else`, already fully understood
  since Lesson 3: each `else if` is just another condition checked only
  if every earlier one in the chain was false.
- `break;` — **first appearance.** Immediately exits the *entire*
  enclosing loop (unlike `continue` from Lesson 5, which only skips to
- the next iteration) — used here so typing `quit` ends the program
  instead of looping back to another prompt.
- Everything inside the `"update"` and `"remove"` branches — reads an
- `id`, calls the matching `Table` method inside `try`/`catch` — is
  **a hard concept reappearing**: the exact `try`/`catch`/`e.what()`
  pattern Lesson 5 built and demonstrated with hardcoded ids, now
  triggered by typed commands instead.

### CS Lens

This loop is a small **read-eval-print loop (REPL)**: read one command,
act on it, print a result, repeat — the same shape as a Python
interactive shell, a `psql` or `sqlite3` prompt, or a game's main input
loop. Also recognized in: this exact structure is what Level 2's `mydb`
will still be doing at the very top level — the difference is that
"insert"/"select" as fixed keywords get replaced by real, parsed SQL
text, but the outer loop reading a line and dispatching on it survives
essentially unchanged.

### SE Lens

The alternative — what `mydb.cpp` did through Lesson 5 — hardcodes
every operation directly in `main`, which is really a single fixed
*script*, not a *tool*. The command loop trades a small amount of
parsing complexity (matching typed words to behavior) for something
genuinely more useful: an operator can now insert, look up, change, or
remove any student, in any order, without recompiling anything. The
honest limitation to flag: this dispatcher only recognizes four exact
words with no error tolerance for typos, no `help` command, and no way
to insert a student without answering three separate prompts in a
fixed order — real gaps a production tool would close, left open here
because Level 2 is about to replace this entire dispatch mechanism with
real SQL parsing anyway.

### Commands

No new commands.

### Run It

```
$ g++ mydb.cpp storage/table.cpp -o mydb -Wall
$ rm -f school.db
$ ./mydb
mydb> insert
Enter id, name, age: 1 Alice 20
mydb> insert
Enter id, name, age: 2 Bob 22
mydb> select
1,Alice,20
2,Bob,22
mydb> update 1
Enter id, name, age: 1 Alice 21
mydb> remove 2
mydb> select
1,Alice,21
mydb> remove 999
Error: remove: no student with that id
mydb> quit
```

A full interactive session, typed one command at a time — insert two
students, list them, update one, remove the other, confirm the result,
try an invalid remove and see it reported, then quit. This is `mydb`
as an actual tool for the first time in this curriculum.

### One Sentence Connecting This to What Came Before

Every earlier lesson proved one piece of `Table` worked with a fixed,
hardcoded demonstration; this unit is what turns all of those proofs
into something you can point at any data you choose, on demand.

---

## Closing

**Connect the pieces.** Follow one full session end to end: `mydb`
starts, constructs a `Table` over `school.db` (Lesson 4's
encapsulation) → the command loop reads `"insert"`, calls
`readStudent()` (Lesson 3), and passes the result to `table.insert`,
which appends a comma-joined line to disk (Lesson 2's serialization) →
`"select"` calls `printAll`, which calls `selectAll`, which parses
every stored line back into real `Student`s (Lesson 5's
deserialization) → `"update"` and `"remove"` rewrite the whole file via
temp-file-and-rename, throwing and being caught if the id doesn't exist
(Lesson 5) → `"quit"` hits `break` and the loop ends. Every lesson in
Level 1 is a real, load-bearing piece of this one interactive session —
and every piece of that session's correctness is now also checked
independently, without you watching, by `table_test`.

**What breaks without this.** This lesson's own two "Run It" sections
already demonstrated both failure cases directly: a broken `insert`
silently accepting duplicate-id garbage until the test suite caught it
in one run, and two `main` functions refusing to link together in the
other. Both were restored/avoided already — nothing further to break
here on purpose.

**Exercises.**
1. Add `testRemoveMissingId` and `testUpdateMissingId` to
   `table_test.cpp`, each asserting that calling `remove`/`update` on a
   nonexistent id actually throws — closing the gap named honestly in
   this lesson's SE Lens. (Hint: wrap the call in `try`/`catch`, assert
   inside the `catch` block, and add a line after the `try`/`catch`
   that only runs — and should `assert(false)` — if no exception was
   thrown at all.)
2. Add a `help` command to `mydb`'s loop that lists the four real
   commands.
3. Right now, typing `update` or `remove` with no id typed after it
   (just pressing enter) leaves `std::cin >> id` to fail. Predict what
   happens, then run it and check — is this a graceful failure or a
   silent one, and does Lesson 3's validation lesson suggest a fix?

**Definition of done.**
- [ ] `g++ storage/table_test.cpp storage/table.cpp -o table_test -Wall`
      compiles and runs cleanly, printing `All tests passed!`.
- [ ] `g++ mydb.cpp storage/table.cpp -o mydb -Wall` compiles cleanly,
      and a full interactive session (insert, select, update, remove,
      quit) behaves as shown above.
- [ ] You've completed exercise 1 — the two missing-id tests — and
      confirmed they pass.
- [ ] You can explain, without rereading the Commands step above, why
      `table_test.cpp` and `mydb.cpp` can never be compiled into the
      same executable.
- [ ] **Update `API_Reference.md`** — no signature changes this lesson
      (the API stayed frozen, as planned), but add a short note under
      `storage/`'s entry pointing to `storage/table_test.cpp` as the
      suite proving this API's documented behavior, so a future session
      knows tests exist without having to search for them.
- [ ] `git add mydb.cpp storage/table_test.cpp API_Reference.md &&
      git commit -m "Add a real test suite for Table, and turn mydb
      into an interactive command loop

      This closes out Level 1 (TinyDB): storage/ has a frozen, tested
      public API, and mydb is a usable tool rather than a fixed demo.
      Level 2 replaces this loop's four hardcoded command words with
      real parsed SQL, but the loop shape underneath survives."`

---

## Level 1 is complete

You now have a small, real, tested command-line database: `mydb`, an
interactive tool over a `Table` class with a frozen, documented API
(`insert`/`selectAll`/`printAll`/`update`/`remove`), backed by a
hand-built text storage format you can read, write, and reason about
completely, plus a test suite that catches regressions without you
watching. That's genuinely usable today, right now, for exactly what
it does — track simple records from the command line, on your machine.

What it *isn't* yet: it doesn't understand SQL (`"insert"` is a fixed
keyword, not parsed syntax), it can't handle more than one table
without deliberately reworking `Table`'s constructor by hand, and every
`update`/`remove` still rewrites the entire file, which won't hold up
past a small number of records. Level 2 starts turning `"insert"` into
real `INSERT INTO students (...) VALUES (...)` — the SQL parser, and
the point where this project stops being "a tool that happens to store
data" and starts being recognizably a database.
