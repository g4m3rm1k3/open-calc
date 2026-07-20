# Lesson 2: Naming a Record's Shape
*(`struct`, `std::vector`, and Visiting Every Element Without Counting)*

**What you will build.** `mydb` currently writes one hardcoded string,
`"1,Alice,20"` — nothing stops you from typing `"1,Alice,twenty"` or
swapping the field order by accident, because to the compiler it's just
text. Today you'll give a record an actual *shape* — a `struct` with a
named, typed field for id, name, and age — hold several of them in a
`std::vector`, and write all of them to `school.db` in one run instead
of one hardcoded line.

**What you need to know first.** Lesson 1 — `std::string`, `std::ofstream`/
`std::ifstream`, `std::getline` in a `while` loop. All three are reused
here unchanged; today's new material sits entirely on top of them.

---

## Concept Unit: Giving a Record a Shape (`struct`)

### The Problem

`"1,Alice,20"` has no structure the compiler can see or check — it's
one opaque string. If you meant to write id, then name, then age, but
typed them in the wrong order, nothing would catch that; the compiler
sees a string either way. What's actually needed is a way to say "a
student record *is* an id, a name, and an age" — as a real type, not a
convention you have to remember.

### Introduce the Concept in Isolation

Throwaway file, `struct_lab.cpp`:

```cpp
#include <iostream>
#include <string>

struct Point {
    int x;
    int y;
};

int main() {
    Point p = {3, 7};
    std::cout << p.x << "," << p.y;
    return 0;
}
```

```
$ g++ struct_lab.cpp -o struct_lab
$ ./struct_lab
3,7
```

`p.x` and `p.y` came back exactly as assigned, by name, not by
remembering "the first thing" and "the second thing" — proof that
`Point` gave `3` and `7` actual roles instead of just being two numbers
sitting next to each other.

### Discard the Throwaway Example

`struct_lab.cpp` and `Point` are scratch work. The real project defines
`Student`, next.

### Project Change

- **Files affected:** `mydb.cpp` — modified.
- **Change type:** add (a new type definition) + refactor (`record`
  becomes structured data instead of one literal string).
- **Location:** the `struct` definition goes above `main`, at file
  scope; it replaces the `std::string record = "1,Alice,20";` line from
  Lesson 1 inside `main`.
- **Dependencies:** none beyond what Lesson 1 already included.

### The New Code

```cpp
struct Student {
    int id;
    std::string name;
    int age;
};
```

### The Updated Project

```cpp
#include <iostream>
#include <fstream>
#include <string>

struct Student {              // ← new
    int id;                   // ← new
    std::string name;         // ← new
    int age;                  // ← new
};                             // ← new

int main() {
    std::string record = "1,Alice,20";

    std::ofstream out("school.db", std::ios::app);
    out << record << "\n";
    out.close();

    std::ifstream in("school.db");
    std::string line;
    while (std::getline(in, line)) {
        std::cout << line << "\n";
    }

    return 0;
}
```

`Student` now exists as a type, sitting above `main`, but `main` doesn't
use it yet — it's still writing the old hardcoded string. That's
deliberate: this unit only introduces the *shape*; the next two units
put it to work.

### Mechanical Walkthrough

- `struct` — **first appearance.** A keyword that defines a new type
  made of named fields (called *members*), bundled together under one
  name. There's no direct Python equivalent used at your current level
  — the closest is a class with only `__init__`-assigned attributes and
  no methods, but C++ gives you this simpler, methods-free shape as its
  own distinct tool.
- `Student` — the name being given to this new type. Same idea as naming
  a Python class — a name you'll now use as a type everywhere below.
- `int id;`, `std::string name;`, `int age;` — **first appearance** of
  *member declarations*: each line names a field and its type, with no
  value yet — just a promise that every `Student` will have these three
  slots. `int` — a whole-number type — is new by name here, though you
  already understand the idea of "a variable's type is fixed" from
  `std::string` in Lesson 1.
- `;` after the closing `}` — **first appearance** of this exact
  requirement: a `struct` definition, unlike a function body, must end
  its closing brace with a semicolon. Easy to forget, and the compiler
  error if you do is confusing — worth knowing on sight.

### CS Lens

This is a **record type** (also called a product type): a single value
that's actually several typed values glued together, addressable by
name. Also recognized in: a Python `dataclass` or `NamedTuple`, a SQL
table's row definition (a preview of exactly where this project is
headed), a JSON object's fixed schema, and a network protocol's fixed
message header.

### SE Lens

The alternative — sticking with one comma-joined string — is what
`mydb` was already doing, and it doesn't scale: nothing stops a name
from containing a comma and silently corrupting every field after it,
and every place in the code that reads a record has to independently
know the field order. A `struct` moves that knowledge into one place,
checked by the compiler. The cost: converting a `Student` to and from
text (for writing to a file, which only stores bytes, not C++ objects)
now has to be done explicitly — you'll write that conversion yourself in
the next unit, and it's a job real databases spend enormous effort on
under the name *serialization*.

### Commands

No new commands.

### Run It

Not runnable as a meaningful standalone step yet — `Student` is defined
but unused. It connects into the next two units.

### One Sentence Connecting This to What Came Before

Lesson 1 proved one string could survive to disk; this unit is the first
step toward that string actually meaning something structured.

---

## Concept Unit: Holding Many Records (`std::vector`)

### The Problem

`Student` describes *one* record's shape, but a database obviously needs
to hold more than one at a time. Python's answer here would be a list;
C++ needs its own equivalent — one that, like `std::string`, is a real
typed container rather than something that can hold anything.

### Introduce the Concept in Isolation

Throwaway file, `vector_lab.cpp`:

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> nums = {10, 20, 30};
    std::cout << "size: " << nums.size() << "\n";
    std::cout << "first: " << nums[0];
    return 0;
}
```

```
$ g++ vector_lab.cpp -o vector_lab
$ ./vector_lab
size: 3
first: 10
```

`.size()` correctly reports 3 for a 3-element list, and `[0]` correctly
retrieves the first element — proof `std::vector` is holding a real,
countable, indexable sequence, the same shape of thing as a Python list,
just fixed to one element type (`int`, here) for its whole lifetime.

### Discard the Throwaway Example

`vector_lab.cpp` is scratch work. The real project holds `Student`s in a
vector, next.

### Project Change

- **Files affected:** `mydb.cpp` — modified.
- **Change type:** replace.
- **Location:** inside `main`, replacing the `std::string record =
  "1,Alice,20";` line.
- **Dependencies:** a new header, `<vector>`.

### The New Code

```cpp
std::vector<Student> students = {
    {1, "Alice", 20},
    {2, "Bob", 22}
};
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
    std::vector<Student> students = {   // ← new
        {1, "Alice", 20},               // ← new
        {2, "Bob", 22}                  // ← new
    };                                   // ← new

    std::ofstream out("school.db", std::ios::app);
    out << record << "\n";              // ← now broken, fixed next unit
    out.close();

    std::ifstream in("school.db");
    std::string line;
    while (std::getline(in, line)) {
        std::cout << line << "\n";
    }

    return 0;
}
```

`main` now builds a vector holding two `Student`s in memory — but the
line right below it, `out << record`, refers to a variable that no
longer exists, since `record` was just replaced. This won't compile as
shown; that's intentional and gets fixed in the next unit, which is
exactly where the vector actually gets used.

### Mechanical Walkthrough

- `std::vector<Student>` — **first appearance.** A dynamically-sized
  container, declared with the element type in angle brackets — here,
  `Student`. Unlike a C-style array, it can grow; unlike `std::string`
  (which is really a specialized container of characters you already
  used in Lesson 1 without this framing), it can hold any one type you
  name.
- `= { {1, "Alice", 20}, {2, "Bob", 22} };` — **first appearance** of a
  *nested* initializer list: the outer braces build the vector itself,
  and each inner `{...}` builds one `Student` using the same
  brace-initialization you saw with `Point` in the previous unit —
  reused, not re-explained.

### CS Lens

`std::vector` is a **dynamic array**: contiguous memory that resizes
itself as needed, giving constant-time indexed access (`nums[0]`) at
the cost of occasional reallocation when it outgrows its current
capacity. Also recognized in: Python's `list` (dynamic array under the
hood, despite looking untyped from the outside), Java's `ArrayList`,
and — the connection worth holding onto — a database table's rows
before any indexing exists: exactly what `students` is standing in for
right now.

### SE Lens

The alternative, a fixed-size C-style array (`Student students[2];`),
would need its size known and hardcoded up front — impossible for a
real database, which has no way to predict how many rows a table will
ever hold. `std::vector` trades a small amount of overhead (it may need
to reallocate and copy its contents as it grows) for that flexibility.
This project is already accepting a version of that same tradeoff at
the file level too: `school.db` grows without any pre-declared limit,
for exactly the same reason.

### Commands

No new commands.

### Run It

Still not standalone-runnable — see the previous unit's note; this
compiles into the same broken intermediate state, resolved next.

### One Sentence Connecting This to What Came Before

The previous unit gave one record a shape; this unit gives `mydb` a
place to hold more than one of them at once.

---

## Concept Unit: Visiting Every Element Without Counting (range-based `for`)

### The Problem

`students` now holds two records in memory, but nothing has looped over
them yet to actually write each one to `school.db`. Lesson 1's `while`
loop wasn't counting anything — it just kept reading until `getline`
reported "nothing left." Looping over a vector needs a different shape:
visit every element it currently holds, in order, once each.

### Introduce the Concept in Isolation

Throwaway file, `rangefor_lab.cpp`:

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> nums = {10, 20, 30};
    for (int n : nums) {
        std::cout << "visited: " << n << "\n";
    }
    return 0;
}
```

```
$ g++ rangefor_lab.cpp -o rangefor_lab
$ ./rangefor_lab
visited: 10
visited: 20
visited: 30
```

Three elements in, three lines out, each holding the real value at that
position — proof this loop form visits every element exactly once,
without you writing an index or a stopping condition anywhere.

### Discard the Throwaway Example

`rangefor_lab.cpp` is scratch work. The real project loops over
`students` to write each one to disk, next — and this is also where the
broken `out << record` line from the previous unit finally gets fixed.

### Project Change

- **Files affected:** `mydb.cpp` — modified.
- **Change type:** replace.
- **Location:** inside `main`, replacing the single broken
  `out << record << "\n";` line.
- **Dependencies:** none new.

### The New Code

```cpp
for (const Student& s : students) {
    out << s.id << "," << s.name << "," << s.age << "\n";
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

int main() {
    std::vector<Student> students = {
        {1, "Alice", 20},
        {2, "Bob", 22}
    };

    std::ofstream out("school.db", std::ios::app);
    for (const Student& s : students) {              // ← new
        out << s.id << "," << s.name << "," << s.age << "\n";  // ← new
    }                                                  // ← new
    out.close();

    std::ifstream in("school.db");
    std::string line;
    while (std::getline(in, line)) {
        std::cout << line << "\n";
    }

    return 0;
}
```

`main` now: builds two `Student`s in memory, opens `school.db` for
appending, loops over every student writing each one out as a
comma-joined line (this is `Student`'s serialization — turning the
struct into the same text format Lesson 1 used, by hand, field by
field), closes the file, then reopens it for reading and prints
everything accumulated so far — unchanged from Lesson 1.

### Mechanical Walkthrough

- `for (const Student& s : students)` — **first appearance** of
  range-based `for`. Read as "for each element in `students`, call it
  `s`, run the block below." No index variable, no `.size()` call, no
  stopping condition to get wrong — the loop handles visiting every
  element itself.
- `const Student&` — **first appearance** of a *reference* (`&`) and
  `const` together, though as a fixed idiom rather than something to
  fully unpack yet: `&` means `s` refers to the actual element inside
  `students` rather than a separate copy of it (cheaper, especially once
  records get bigger than three fields), and `const` promises this loop
  won't modify what `s` refers to. You'll see `&` again, taught on its
  own, once a lesson needs to *modify* elements in place through a
  reference — for now, treat `const Student&` as "the standard way to
  read (not change) each element of a loop like this."
- `s.id`, `s.name`, `s.age` — reuses member access (the `.` you already
  used on `Point` and now `Student`) — basic reuse, not re-explained.
- `out << s.id << "," << s.name << "," << s.age << "\n";` — reuses
  `<<` chaining from Lesson 1 (basic reuse), just against three member
  values with literal commas between them instead of one whole string.

### CS Lens

This is **iteration over a collection**, expressed as "visit every
element" rather than "count up to a number and index in" — a higher-
level statement of intent than an index-based loop would be. Also
recognized in: Python's `for x in list:`, a `foreach` loop in nearly
every modern language, SQL's own conceptual model of operating on
*every row* of a result set rather than row `0`, row `1`, row `2` by
number — a preview of how `SELECT` will read once Level 2 exists.

### SE Lens

The alternative, an index-based loop (`for (size_t i = 0; i <
students.size(); i++)`), is strictly more powerful — it lets you skip
elements, go backwards, or access two indices at once — but every one of
those capabilities is a chance to get the bound wrong and read past the
end of the vector, a real and common C++ bug. Range-based `for` gives up
that flexibility in exchange for making "visit every element, no more,
no less" impossible to get wrong. We'll reach for the index-based form
later only in the specific lessons that actually need an index (Level 3,
comparing adjacent records for a B+ tree).

### Commands

No new commands.

### Run It

```
$ g++ mydb.cpp -o mydb -Wall
$ rm -f school.db
$ ./mydb
1,Alice,20
2,Bob,22
$ ./mydb
1,Alice,20
2,Bob,22
1,Alice,20
2,Bob,22
```

Both students, written and read back correctly on the first run; a
second run correctly shows all four accumulated lines, exactly like
Lesson 1's append proof, now for two records at once.

### One Sentence Connecting This to What Came Before

The previous unit gave `mydb` somewhere to hold several records at
once; this unit is what actually gets each one out of memory and onto
disk.

---

## Closing

**Connect the pieces.** Follow `{2, "Bob", 22}` through this lesson: it's
written as one element of the nested initializer list (Unit 2) → held as
one `Student` inside the `students` vector in memory → visited by the
range-based `for` loop as `s` on its pass through (Unit 3) → its three
typed fields, `s.id`, `s.name`, `s.age`, pulled back apart and
reassembled into the exact same comma-joined text format Lesson 1 used
for one hardcoded record → written to `school.db` → read back by the
unchanged `ifstream`/`getline` loop from Lesson 1 and printed. Same file
format in and out as Lesson 1 — only how it gets built changed.

**What breaks without this.** Change the range-based loop's `const
Student&` to a plain `Student` (drop the `&`, keep `const`) and add a
line inside the loop that tries to modify it: `s.age = s.age + 1;`
before writing. That line won't even compile — `const` forbids the
change — which is the proof `const` is doing real work here, not just
decoration:

```
$ g++ mydb.cpp -o mydb
mydb.cpp: error: assignment of member 'Student::age' in read-only object
```

Remove that experimental line before continuing.

**Exercises.**
1. Add a third student to the initializer list and confirm all three
   appear in `school.db` after one run.
2. Change `const Student& s` to just `Student s` (drop `const`, keep
   `&`) and confirm the program still compiles and runs identically —
   then explain in a sentence what `const` was actually protecting
   against, since removing it alone changed nothing observable.
3. Predict, then check: what happens if two students in the list have
   the same `id`? (Nothing enforces uniqueness yet — that's real, and
   worth noticing now, before Level 3 addresses it properly.)

**Definition of done.**
- [ ] `mydb.cpp` compiles cleanly with `g++ mydb.cpp -o mydb -Wall` — no
      warnings.
- [ ] Running `./mydb` twice shows four accumulated lines in
      `school.db`.
- [ ] You can explain why `const Student&` is used in the loop instead
      of plain `Student`, without rereading the SE Lens above.
- [ ] You've completed exercises 1 and 2.
- [ ] `git add mydb.cpp && git commit -m "Give records a real shape:
      struct Student + vector, replacing one hardcoded string

      Multiple typed records now round-trip through school.db instead
      of one. Serialization to text is still done by hand, field by
      field — that's the next thing worth questioning."`
