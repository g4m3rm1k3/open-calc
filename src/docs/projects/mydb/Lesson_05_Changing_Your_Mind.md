# Lesson 5: Changing Your Mind After You've Already Written It Down
*(Parsing Records Back, the Temp-File-and-Rename Pattern, and Failing Loudly with Exceptions)*

**What you will build.** Every operation `Table` has offered so far only
ever adds to `school.db` — there's no way to fix a typo'd age or remove
a student who dropped out. Today `Table` gains real `update` and
`remove`, which forces an honest problem: a plain append-only text file
has no way to change or erase one line without rewriting the whole
file. You'll build that rewrite properly (the same pattern every real
database uses under the hood), and, along the way, `Table` needs to
turn its own stored text back into real `Student` values — and needs a
way to complain, loudly and specifically, when asked to change a record
that doesn't exist.

**What you need to know first.** Lesson 4 in full — `Table`'s
constructor, `insert`, `printAll`, and the fact that everything file-
related is now private to `storage/table.cpp`. Every change in this
lesson stays inside `table.h`/`table.cpp`; `mydb.cpp` only gains a few
new calls to `Table`'s widened API.

---

## Concept Unit: Turning Text Back Into a Record (Parsing)

### The Problem

`Table` can write a `Student` to disk (`insert`) and print the raw
lines back (`printAll`), but it has never once turned stored text back
into an actual `Student` value it could inspect or modify. That's about
to become required: `update` and `remove` both need to look at every
stored record, decide whether it's the one being asked for, and rebuild
the file — and "decide whether it's the one being asked for" means
reading `id` back out as a real `int`, not as a substring of raw text.

### Introduce the Concept in Isolation

Throwaway file, `parse_lab.cpp`:

```cpp
#include <iostream>
#include <string>

int main() {
    std::string line = "42,Hello,7";
    size_t firstComma = line.find(',');
    size_t secondComma = line.find(',', firstComma + 1);

    int a = std::stoi(line.substr(0, firstComma));
    std::string b = line.substr(firstComma + 1, secondComma - firstComma - 1);
    int c = std::stoi(line.substr(secondComma + 1));

    std::cout << a << " | " << b << " | " << c;
    return 0;
}
```

```
$ g++ parse_lab.cpp -o parse_lab
$ ./parse_lab
42 | Hello | 7
```

Started with one opaque string, `"42,Hello,7"`, ended with three
correctly-typed values — `42` as a real `int`, `"Hello"` as its own
`std::string`, `7` as another real `int` — proof the text has been
genuinely converted back into typed data, not just re-displayed.

### Discard the Throwaway Example

`parse_lab.cpp` is scratch work. The real project parses stored
`Student` lines, next.

### Project Change

- **Files affected:** `storage/table.h` — modified. `storage/table.cpp`
  — modified.
- **Change type:** add (`parseLine`, `selectAll`) + refactor (`printAll`
  rewritten to use them instead of raw line printing).
- **Location:** `parseLine` is a new `private` method declared in
  `table.h`, below the existing `filename` member; `selectAll` is a new
  `public` method, declared above `private:`. In `table.cpp`,
  `printAll`'s body — currently a raw `ifstream`/`getline` loop — is
  replaced entirely.
- **Dependencies:** `<vector>` in `table.h`, for `selectAll`'s return
  type.

### The New Code

```cpp
Student Table::parseLine(const std::string& line) const {
    size_t firstComma = line.find(',');
    size_t secondComma = line.find(',', firstComma + 1);

    Student s;
    s.id = std::stoi(line.substr(0, firstComma));
    s.name = line.substr(firstComma + 1, secondComma - firstComma - 1);
    s.age = std::stoi(line.substr(secondComma + 1));
    return s;
}
```

### The Updated Project

`storage/table.h`, in full:

```cpp
#pragma once
#include <string>
#include <vector>
#include "student.h"

class Table {
public:
    Table(const std::string& filename);
    void insert(const Student& s);
    void printAll() const;
    std::vector<Student> selectAll() const;   // ← new

private:
    std::string filename;
    Student parseLine(const std::string& line) const;   // ← new
};
```

`storage/table.cpp`, in full:

```cpp
#include "table.h"
#include <iostream>
#include <fstream>

Table::Table(const std::string& filename) : filename(filename) {}

Student Table::parseLine(const std::string& line) const {   // ← new
    size_t firstComma = line.find(',');                      // ← new
    size_t secondComma = line.find(',', firstComma + 1);      // ← new

    Student s;                                                  // ← new
    s.id = std::stoi(line.substr(0, firstComma));                // ← new
    s.name = line.substr(firstComma + 1, secondComma - firstComma - 1);  // ← new
    s.age = std::stoi(line.substr(secondComma + 1));               // ← new
    return s;                                                        // ← new
}                                                                     // ← new

void Table::insert(const Student& s) {
    std::ofstream out(filename, std::ios::app);
    out << s.id << "," << s.name << "," << s.age << "\n";
    out.close();
}

std::vector<Student> Table::selectAll() const {   // ← new
    std::vector<Student> result;                    // ← new
    std::ifstream in(filename);                       // ← new
    std::string line;                                   // ← new
    while (std::getline(in, line)) {                      // ← new
        result.push_back(parseLine(line));                  // ← new
    }                                                          // ← new
    return result;                                               // ← new
}                                                                  // ← new

void Table::printAll() const {
    for (const Student& s : selectAll()) {              // ← changed
        std::cout << s.id << "," << s.name << "," << s.age << "\n";  // ← changed
    }                                                      // ← changed
}
```

`Table` now has a genuine read path: `selectAll` opens the file, turns
every stored line into a real `Student` via `parseLine`, and hands back
a `std::vector<Student>` — actual structured data, not text. `printAll`
is rewritten on top of it, reconstructing the same comma-joined text on
the way back out, which is also how you'll be able to tell parsing
worked correctly: the printed output should look identical to before.

### Mechanical Walkthrough
- `Student Table::parseLine(const std::string& line) const` — reuses
  the `Table::` definition pattern and `const` member-function syntax
  from Lesson 4 (basic reuse); the only new part is that this one is
- `private` — never called from `mydb.cpp`, only from inside `Table`
  itself.
- `line.find(',')` — **first appearance.** A member function on
  `std::string` (reusing the general idea of calling a member function
  on an object, familiar since `push_back` in Lesson 3) that searches
  for a character and returns the numeric position of its first
  occurrence.
- `line.find(',', firstComma + 1)` — same `find`, with a second
  argument: **first appearance** of `find`'s optional "start searching
  from this position" argument — needed here specifically because a
  student's record has *two* commas, and searching from position 0
  again would just find the first one a second time.
- `line.substr(0, firstComma)` — **first appearance.** Another
  `std::string` member function, extracting a piece of the string:
  starting index, then how many characters to take.
- `std::stoi(...)` — **first appearance.** "String to int" — converts a
  numeric-looking `std::string` into a real `int`. This is the reverse
  direction of every `<<` you've used since Lesson 1, which converts a
  number *into* text; `stoi` converts text *into* a number.
- `line.substr(firstComma + 1, secondComma - firstComma - 1)` — reuses
  `substr` (basic reuse), with an arithmetic expression for its length
  argument instead of a literal — worth noting only because getting
  this exact off-by-one calculation right (skipping past the comma
  itself, stopping just before the next one) is the actual mechanism
  that makes parsing correct.
- `line.substr(secondComma + 1)` — reuses `substr` with only one
  argument: **first appearance** of `substr`'s single-argument form,
  meaning "from this position to the end of the string" — used here
  because the age field has no comma after it to stop at.

### CS Lens

This is **deserialization** — the exact reverse of the serialization
you've been doing by hand since Lesson 2 (`Student` fields joined with
commas into text). Also recognized in: `json.loads()` in Python
undoing `json.dumps()`, a CSV reader library doing precisely what
`parseLine` does by hand, and — the connection worth sitting with —
this *is* the first half of what a SQL parser's lexer will do in
Level 2, just applied to `Table`'s own storage format instead of SQL
syntax: turning a flat sequence of characters back into meaningful,
typed pieces.

### SE Lens

The alternative to this hand-rolled comma-splitting would be a real
CSV parsing library, which correctly handles cases this code doesn't —
a name that itself contains a comma, for instance, would silently
break `parseLine` right now, shifting every field after it. That's real
debt, not hidden: this project is deliberately building its own
storage format from first principles rather than depending on an
external library, and hand-rolled parsing is the honest cost of that
choice at this stage. It's also exactly the same debt Lesson 2 already
flagged when the write side of this format was built — worth noticing
that neither side of a format gets a free pass just because the other
side works.

### Commands

No new commands.

### Run It

```
$ g++ mydb.cpp storage/table.cpp -o mydb -Wall
$ rm -f school.db
$ echo "3 Carol 19" | ./mydb
Enter id, name, age: 1,Alice,20
2,Bob,22
3,Carol,19
```

Identical output to Lesson 4 — the proof that `printAll` genuinely
round-trips every record through real parsing and back, not just
copying text through unexamined.

### One Sentence Connecting This to What Came Before

Every prior lesson wrote data down; this unit is the first time `Table`
has actually understood what it wrote, well enough to hand it back as
real values instead of raw text.

---

## Concept Unit: Changing Your Mind After It's on Disk (Temp-File-and-Rename)

### The Problem

`school.db` is a plain sequence of lines, written only by appending.
There is no operation that lets you reach into the middle of a text
file and delete or overwrite one specific line without touching the
rest — files don't work that way. The only honest way to remove or
change one record is: read every record, decide what the file *should*
contain now, write that entirely fresh, and swap it in for the old
file.

### Introduce the Concept in Isolation

Throwaway file, `rename_lab.cpp`, deleting one line from a small file:

```cpp
#include <iostream>
#include <fstream>
#include <string>
#include <cstdio>

int main() {
    std::ofstream original("original.txt");
    original << "line1\nline2\nline3\n";
    original.close();

    std::ifstream in("original.txt");
    std::ofstream out("original.txt.tmp");
    std::string line;
    while (std::getline(in, line)) {
        if (line != "line2") {
            out << line << "\n";
        }
    }
    in.close();
    out.close();

    std::remove("original.txt");
    std::rename("original.txt.tmp", "original.txt");

    std::ifstream check("original.txt");
    while (std::getline(check, line)) {
        std::cout << line << "\n";
    }
    return 0;
}
```

```
$ g++ rename_lab.cpp -o rename_lab
$ ./rename_lab
line1
line3
```

Started with three lines, ended with two, and `original.txt` itself now
holds exactly that result — proof the file was genuinely replaced with
a filtered version of itself, not edited in place (which never
happened, and never could).

### Discard the Throwaway Example

`rename_lab.cpp` is scratch work. The real project applies this exact
pattern inside `Table::remove`, next.

### Project Change

- **Files affected:** `storage/table.h` — modified. `storage/table.cpp`
  — modified.
- **Change type:** add.
- **Location:** `remove(int id)` is a new `public` method, declared in
  `table.h` below `selectAll`; its definition is a new function added
  to the bottom of `table.cpp`.
- **Dependencies:** `<cstdio>`, for `std::remove` (deleting a file) and
  `std::rename`.

### The New Code

```cpp
void Table::remove(int id) {
    std::vector<Student> students = selectAll();

    std::string tempFilename = filename + ".tmp";
    std::ofstream out(tempFilename);
    for (const Student& s : students) {
        if (s.id != id) {
            out << s.id << "," << s.name << "," << s.age << "\n";
        }
    }
    out.close();

    std::remove(filename.c_str());
    std::rename(tempFilename.c_str(), filename.c_str());
}
```

### The Updated Project

`storage/table.h`, in full:

```cpp
#pragma once
#include <string>
#include <vector>
#include "student.h"

class Table {
public:
    Table(const std::string& filename);
    void insert(const Student& s);
    void printAll() const;
    std::vector<Student> selectAll() const;
    void remove(int id);                       // ← new

private:
    std::string filename;
    Student parseLine(const std::string& line) const;
};
```

`storage/table.cpp`, with `remove` added at the bottom (everything
above it unchanged from the previous unit):

```cpp
#include "table.h"
#include <iostream>
#include <fstream>
#include <cstdio>                               // ← new

Table::Table(const std::string& filename) : filename(filename) {}

Student Table::parseLine(const std::string& line) const {
    size_t firstComma = line.find(',');
    size_t secondComma = line.find(',', firstComma + 1);

    Student s;
    s.id = std::stoi(line.substr(0, firstComma));
    s.name = line.substr(firstComma + 1, secondComma - firstComma - 1);
    s.age = std::stoi(line.substr(secondComma + 1));
    return s;
}

void Table::insert(const Student& s) {
    std::ofstream out(filename, std::ios::app);
    out << s.id << "," << s.name << "," << s.age << "\n";
    out.close();
}

std::vector<Student> Table::selectAll() const {
    std::vector<Student> result;
    std::ifstream in(filename);
    std::string line;
    while (std::getline(in, line)) {
        result.push_back(parseLine(line));
    }
    return result;
}

void Table::printAll() const {
    for (const Student& s : selectAll()) {
        std::cout << s.id << "," << s.name << "," << s.age << "\n";
    }
}

void Table::remove(int id) {                    // ← new
    std::vector<Student> students = selectAll();   // ← new

    std::string tempFilename = filename + ".tmp";    // ← new
    std::ofstream out(tempFilename);                    // ← new
    for (const Student& s : students) {                    // ← new
        if (s.id != id) {                                     // ← new
            out << s.id << "," << s.name << "," << s.age << "\n"; // ← new
        }                                                        // ← new
    }                                                             // ← new
    out.close();                                                    // ← new

    std::remove(filename.c_str());                                    // ← new
    std::rename(tempFilename.c_str(), filename.c_str());                // ← new
}                                                                          // ← new
```

`Table` can now genuinely forget a record: `remove` reads every student
back via the parsing built last unit, writes every student *except* the
one matching `id` into a brand-new temp file, then deletes the original
and renames the temp file into its place — the file named `filename`
now *is* the filtered version, and the intermediate `.tmp` file no
longer exists under that name.

### Mechanical Walkthrough
- `std::string tempFilename = filename + ".tmp";` — **first appearance**
- of `+` on two `std::string`s — string concatenation, building a new
  filename by appending `.tmp` to the table's real filename.
- `std::ofstream out(tempFilename);` — reuses `ofstream` from Lesson 1
  (basic reuse), just opening a different, temporary filename instead
- of `filename` directly — the whole point being that `filename` itself
  is never opened for writing during this rebuild.
- `if (s.id != id)` — reuses `if` and introduces `!=` (not-equal
  comparison) as a small, easily-inferred sibling of the `==` idea
  implied by "matching" — genuinely basic, not owed a full explanation
  on its own.
- `std::remove(filename.c_str())` — **first appearance.** Deletes the
- file at the given path.
- `.c_str()` — **first appearance** — converts
  a `std::string` into the raw C-style string type this older function
  expects; you'll see `.c_str()` again anywhere a function predates
  `std::string` in C++'s history, which several parts of the standard
  library still do.
- `std::rename(tempFilename.c_str(), filename.c_str())` — **first
  appearance.** Renames a file from the first path to the second —
  here, making the temp file become the real file in one atomic step.

### CS Lens

This is **copy-on-write via a full rewrite** — the simplest possible
version of a pattern every real database uses in a more sophisticated
form. Also recognized in: how most text editors actually save a file
(write a new temp file, then rename it over the original, so a crash
mid-save can never leave you with a half-written file); how git commits
objects (never edited in place, always written fresh and referenced
anew); and, directly ahead in this project, exactly the problem
Level 3's write-ahead logging exists to make efficient — rewriting the
*entire* file on every single change, as this lesson does, is
correct but does not scale past a small file, and that ceiling is
being hit on purpose here, to be felt before it's solved properly.

### SE Lens

The alternative — trying to edit `school.db` in place, seeking to the
exact bytes of the matching line and overwriting them — sounds more
efficient but is far more dangerous: records aren't fixed-width text,
so removing or shortening one line would leave a gap or corrupt every
line after it. Rewriting the whole file avoids that entire class of bug
at the cost of doing `O(n)` work for even a one-record change — an
honest, deliberate tradeoff for a project explicitly building up to a
real page-based engine later, not a mistake to fix here.

### Commands

No new commands — `std::remove` and `std::rename` are library
functions, not terminal commands, despite the names.

### Run It

Not fully connected to `mydb.cpp` yet — `remove`'s only caller so far is
the throwaway lab. It gets wired into `main` in the next unit, alongside
the ability to report when it's asked to remove something that isn't
there.

### One Sentence Connecting This to What Came Before

The previous unit gave `Table` the ability to *read* its own data as
real values; this unit is the first time it's used that ability to
*rebuild* the file into something new.

---

## Concept Unit: Failing Loudly Instead of Silently (`throw`/`catch`)

### The Problem

`remove(999)`, called on a table with no student `999`, currently does
something quietly wrong: it rewrites the entire file, keeping every
record (since none matched), and returns as if it succeeded — no error,
no signal, nothing telling the caller their request didn't actually do
anything. The same problem will exist for `update`, which this unit
also adds. C++ has a mechanism built specifically for "something went
wrong, and the caller needs to know, even several function calls away
from where it happened": exceptions.

### Introduce the Concept in Isolation

Throwaway file, `exception_lab.cpp`:

```cpp
#include <iostream>
#include <stdexcept>

void checkPositive(int x) {
    if (x < 0) {
        throw std::runtime_error("value was negative");
    }
    std::cout << "ok: " << x;
}

int main() {
    try {
        checkPositive(-5);
    } catch (const std::runtime_error& e) {
        std::cout << "caught: " << e.what();
    }
    return 0;
}
```

```
$ g++ exception_lab.cpp -o exception_lab
$ ./exception_lab
caught: value was negative
```

`checkPositive` never got the chance to print `"ok: "` at all — the
`throw` inside it immediately abandoned the rest of the function and
jumped straight to `main`'s `catch` block, carrying the error message
with it — proof `throw` genuinely interrupts normal control flow rather
than being a value the function just happens to return.

### Discard the Throwaway Example

`exception_lab.cpp` is scratch work. The real project adds this check
to `remove`, and adds `update` using the same pattern, next.

### Project Change

- **Files affected:** `storage/table.h` — modified. `storage/table.cpp`
  — modified. `mydb.cpp` — modified.
- **Change type:** add (`update`, and a `found` check inside `remove`)
  + add (calls to both, wrapped in `try`/`catch`, in `main`).
- **Location:** in `table.cpp`, `remove` gains a `found` flag and a
  `throw` at its end; `update` is a new function below it, following the
  identical temp-file-rewrite shape as `remove`. In `mydb.cpp`, the new
  calls go after `table.insert(newStudent);` and before the final
  `return 0;`.
- **Dependencies:** `<stdexcept>`, for `std::runtime_error`, in both
  `table.cpp` and `mydb.cpp`.

### The New Code

```cpp
void Table::remove(int id) {
    std::vector<Student> students = selectAll();
    bool found = false;

    std::string tempFilename = filename + ".tmp";
    std::ofstream out(tempFilename);
    for (const Student& s : students) {
        if (s.id == id) {
            found = true;
            continue;
        }
        out << s.id << "," << s.name << "," << s.age << "\n";
    }
    out.close();

    std::remove(filename.c_str());
    std::rename(tempFilename.c_str(), filename.c_str());

    if (!found) {
        throw std::runtime_error("remove: no student with that id");
    }
}
```

### The Updated Project

`storage/table.h`, in full:

```cpp
#pragma once
#include <string>
#include <vector>
#include "student.h"

class Table {
public:
    Table(const std::string& filename);
    void insert(const Student& s);
    void printAll() const;
    std::vector<Student> selectAll() const;
    void update(int id, const Student& newData);   // ← new
    void remove(int id);

private:
    std::string filename;
    Student parseLine(const std::string& line) const;
};
```

`storage/table.cpp`, `remove` and the new `update`, with everything
above (`Table::Table`, `parseLine`, `insert`, `selectAll`, `printAll`)
unchanged from the previous unit:

```cpp
#include "table.h"
#include <iostream>
#include <fstream>
#include <cstdio>
#include <stdexcept>                                     // ← new

/* ...Table::Table, parseLine, insert, selectAll, printAll unchanged... */

void Table::remove(int id) {
    std::vector<Student> students = selectAll();
    bool found = false;                                     // ← new

    std::string tempFilename = filename + ".tmp";
    std::ofstream out(tempFilename);
    for (const Student& s : students) {
        if (s.id == id) {                                       // ← changed
            found = true;                                           // ← new
            continue;                                                 // ← new
        }                                                               // ← changed
        out << s.id << "," << s.name << "," << s.age << "\n";
    }
    out.close();

    std::remove(filename.c_str());
    std::rename(tempFilename.c_str(), filename.c_str());

    if (!found) {                                                          // ← new
        throw std::runtime_error("remove: no student with that id");         // ← new
    }                                                                          // ← new
}

void Table::update(int id, const Student& newData) {   // ← new
    std::vector<Student> students = selectAll();          // ← new
    bool found = false;                                     // ← new

    std::string tempFilename = filename + ".tmp";              // ← new
    std::ofstream out(tempFilename);                              // ← new
    for (const Student& s : students) {                             // ← new
        if (s.id == id) {                                              // ← new
            out << newData.id << "," << newData.name << ","              // ← new
                << newData.age << "\n";                                    // ← new
            found = true;                                                    // ← new
        } else {                                                                // ← new
            out << s.id << "," << s.name << "," << s.age << "\n";                 // ← new
        }                                                                          // ← new
    }                                                                                // ← new
    out.close();                                                                       // ← new

    std::remove(filename.c_str());                                                        // ← new
    std::rename(tempFilename.c_str(), filename.c_str());                                     // ← new

    if (!found) {                                                                                // ← new
        throw std::runtime_error("update: no student with that id");                                // ← new
    }                                                                                                   // ← new
}
```

`mydb.cpp`, in full:

```cpp
#include <iostream>
#include <vector>
#include <stdexcept>                              // ← new
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
    Table table("school.db");

    std::vector<Student> students = {
        {1, "Alice", 20},
        {2, "Bob", 22}
    };
    for (const Student& s : students) {
        table.insert(s);
    }

    Student newStudent = readStudent();
    table.insert(newStudent);

    std::cout << "--- before ---\n";
    table.printAll();

    try {                                             // ← new
        table.remove(2);                                 // ← new
    } catch (const std::runtime_error& e) {                 // ← new
        std::cout << "Error: " << e.what() << "\n";            // ← new
    }                                                            // ← new

    try {                                                          // ← new
        table.update(1, {1, "Alice", 21});                            // ← new
    } catch (const std::runtime_error& e) {                              // ← new
        std::cout << "Error: " << e.what() << "\n";                         // ← new
    }                                                                          // ← new

    std::cout << "--- after ---\n";                                              // ← new
    table.printAll();

    try {                                                                            // ← new
        table.remove(999);                                                              // ← new
    } catch (const std::runtime_error& e) {                                                // ← new
        std::cout << "Error: " << e.what() << "\n";                                           // ← new
    }                                                                                             // ← new

    return 0;
}
```

`main` now demonstrates the whole widened API in one run: insert the
usual students, print, remove Bob, update Alice's age, print again to
show both took effect, then deliberately try to remove a nonexistent
id — and instead of the program silently doing nothing or crashing, the
`catch` block reports exactly what went wrong.

### Mechanical Walkthrough
- `bool found = false;`, `found = true;` — plain boolean bookkeeping;
  `bool` is new by name but the idea (a variable that's one of two
  states) is already familiar from every `if` condition since
  Lesson 1 — genuinely basic, not owed its own full treatment.
- `continue;` — **first appearance.** Immediately skips to the next
  iteration of the enclosing loop, without running any code below it in
  the current pass. Used here to skip writing the matching student to
  the temp file, without needing an `else` wrapped around the rest of
  the loop body.
- `throw std::runtime_error("...")` — **first appearance** of `throw`
  in the real project, reusing the exact pattern from the lab: build a
  `std::runtime_error` with a message, and abandon normal execution.
- `#include <stdexcept>` — **first appearance** of this header, which
  declares `std::runtime_error`.
- `Table::update(int id, const Student& newData)` — its whole body is
  **a hard concept reappearing**, per the Repetition Rule: the same
  read-everything, rewrite-to-temp, delete-and-rename shape `remove`
  just taught in full, applied to *replacing* one record's contents
  instead of omitting it. The one genuinely new line inside it is the
  `newData.id << "," << newData.name ...` branch, which reuses member
- access and `<<` chaining you've had since Lesson 2 — no new syntax,
  just a new use of the pattern.
- `try { ... } catch (const std::runtime_error& e) { ... }` — reuses the
  exact shape from the lab (basic reuse at this point), now wrapped
  around real calls to `table.remove(...)` and `table.update(...)`.
- `e.what()` — **first appearance** in the real project (seen once
  already in the lab): a member function every standard exception type
  provides, returning the message it was constructed with.

### CS Lens

This is **exception-based error handling**: separating "the normal
result of a successful call" from "a specific, named failure," and
letting that failure propagate up to whoever's actually equipped to
decide what to do about it — here, `main`, not `remove` or `update`
themselves, which have no idea whether the caller wants to log the
error, retry, or ask the user again. Also recognized in: Python's
`try`/`except`/`raise` (nearly identical syntax and philosophy), a
network request library raising on a failed connection rather than
returning a value indistinguishable from success, and — directly ahead
— Level 2's SQL parser, which will use this exact mechanism to report a
malformed query instead of silently executing nothing.

### SE Lens

The alternative — returning a `bool` for success/failure instead of
throwing, which Lesson 3's `readStudent` effectively approximated with
its placeholder-defaults approach — would work, but it's easy to
ignore: nothing forces a caller to check a returned `bool`, and a
forgotten check just silently continues as if nothing went wrong.
`throw` can't be silently ignored the same way — an uncaught exception
crashes the program loudly rather than limping on incorrectly, which is
exactly the tradeoff wanted here: a `remove` that did nothing should
never be mistaken for a `remove` that worked. The real cost is that
exceptions add a second, less visible control-flow path through the
code — reading `update`, you now have to remember it might not run to
completion in the normal way, which is a genuine source of subtlety in
larger C++ programs than this one.

### Commands

No new commands.

### Run It

```
$ g++ mydb.cpp storage/table.cpp -o mydb -Wall
$ rm -f school.db
$ echo "3 Carol 19" | ./mydb
Enter id, name, age: --- before ---
1,Alice,20
2,Bob,22
3,Carol,19
--- after ---
1,Alice,21
3,Carol,19
Error: remove: no student with that id
```

All three outcomes confirmed in one real run: Bob genuinely removed,
Alice's age genuinely updated to 21, and the deliberately-invalid
`remove(999)` caught and reported instead of failing silently or
crashing.

### One Sentence Connecting This to What Came Before

The previous unit gave `Table` the power to rewrite itself; this unit
is what stops that power from being used incorrectly without anyone
finding out.

---

## Closing

**Connect the pieces.** Follow id `2` (Bob) through this lesson:
`table.remove(2)` calls `selectAll()`, which opens `school.db` and
turns every line back into a real `Student` via `parseLine` (Unit 1) →
the loop in `remove` checks each one's `.id` against `2`, and Bob's
record is the one that matches, so `found` becomes `true` and
`continue` skips writing him to the temp file (Unit 2) → every *other*
student gets written to `school.db.tmp` → the original `school.db` is
deleted and the temp file renamed into its place, so the file now
genuinely lacks Bob's line → because `found` was `true`, no exception
is thrown, and `main`'s `try` block completes normally (Unit 3). Change
that id to `999` instead, and every step is identical except `found`
stays `false`, so the same function that just silently succeeded for
Bob throws, is caught, and reports itself — one code path, two
completely different, both correct, outcomes depending only on the
data it found.

**What breaks without this.** Comment out the `if (!found) { throw
...; }` block in `remove` entirely, then rerun with the deliberately
bad id:

```
$ echo "3 Carol 19" | ./mydb
Enter id, name, age: --- before ---
1,Alice,20
2,Bob,22
3,Carol,19
--- after ---
1,Alice,21
3,Carol,19
```

Notice the final `Error: remove: no student with that id` line is just
gone — `table.remove(999)` ran, rewrote the entire file for no reason,
and returned as if everything were fine, with nothing anywhere telling
you it didn't do what was asked. Restore the `throw` before continuing.

**Exercises.**
1. Add a `Student findById(int id) const` method to `Table` that
   returns the matching student, throwing `std::runtime_error` if none
   is found — reusing `selectAll` and the same throw pattern from this
   lesson.
2. `parseLine` will currently crash (not throw a clean exception — an
   uncaught `std::invalid_argument` from `std::stoi`) if a line in
   `school.db` is malformed. Manually corrupt a line in `school.db`
   with a text editor and confirm this happens, then explain why this
   is a worse failure mode than the `throw`s built in this lesson.
3. Predict, then check: does calling `table.update(1, {1, "Alice",
   21})` twice in a row, back to back, cause any problem? Why or why
   not, given what you know about how `update` rewrites the file each
   time.

**Definition of done.**
- [ ] `g++ mydb.cpp storage/table.cpp -o mydb -Wall` compiles cleanly —
      no warnings.
- [ ] Running `./mydb` shows Bob removed, Alice's age updated to 21,
      and a caught error for the nonexistent id — all three in one run.
- [ ] You can explain, without rereading the SE Lens, why exceptions
      were chosen over a returned `bool` for reporting failure here.
- [ ] You've completed exercise 1 above.
- [ ] **Update `API_Reference.md`** — add `selectAll`, `update`, and
      `remove` to the `storage/` section, including that both `update`
      and `remove` throw `std::runtime_error` if the id doesn't exist.
      Mark the section 🟢 — this is `storage/`'s frozen public API for
      the rest of Level 1 (Lesson 6 adds tests against it, not new
      methods).
- [ ] `git add mydb.cpp storage/ API_Reference.md && git commit -m
      "Add Table::update and Table::remove via temp-file rewrite,
      throwing on a missing id

      storage/ can now genuinely change its mind about stored data, not
      just accumulate it. Every change rewrites the whole file — a
      real, deliberate cost this project accepts until Level 3 replaces
      plain-text storage with something page-based."`
