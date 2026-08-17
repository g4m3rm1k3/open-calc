# Lesson A4: Computing One Value at a Time

_A file too large to fit in memory still needs processing._

- **What you will build** — Lesson A3's `main()` reads every integer
  from `readings.txt` into an `Array<int>` before doing anything else
  with them. That's fine for a small file. It stops being fine the
  moment the file itself is larger than the machine's available memory —
  `Array<int>` would need to hold the whole thing, all at once, before a
  single value could be summed, printed, or checked. This lesson builds
  a small class that produces one integer at a time, straight from the
  file, on demand — never holding more than the single value currently
  in use — and proves, with real measured memory numbers rather than a
  claim, that summing five million values this way costs roughly fifty
  times less peak memory than materializing them into an `Array<int>`
  first, while producing the identical answer.

- **What you need to know first** — Lesson A3's `std::ifstream`-based
  file reading (`is_open()`, the `file >> value` extraction idiom,
  `eof()`), and Lesson A2's `Array<T>`, reused here specifically as the
  "reads everything up front" comparison this lesson measures against.

- **Terms used in this lesson**

  - **Eager evaluation** — computing and storing an entire result up
    front, in full, before any part of it is actually used. It's what
    `Array<int>` forces on Lesson A3's version of `main()`: every single
    value from the file has to already be sitting in heap memory before
    the first one can even be summed.
  - **Lazy evaluation (on-demand computation)** — computing each piece
    of a result only at the exact moment it's actually asked for, and
    never holding on to more than whatever piece is currently in use. It
    exists so that a result too large to build all at once — this
    lesson's whole vehicle — can still be processed correctly, piece by
    piece, without ever requiring the complete result to exist in memory
    simultaneously.
  - **Generator** — an object that produces a sequence of values one at
    a time, on demand, computing or reading only the next one when
    asked, rather than a container that already holds every value it
    will ever produce. It's the concrete device that makes lazy
    evaluation usable as ordinary code, rather than just a description
    of an idea — Python's own `yield`-based generator functions are the
    same underlying concept; this lesson builds the equivalent behavior
    in C++ with a small class, since C++ has no `yield` keyword of its
    own in the version used here.

- **Objects and methods used**

  - **`IntGenerator`**
    - *What it is:* this lesson's own subject — a class that produces
      one `int` at a time from a file, on request, rather than reading
      the whole file into a container up front.
    - *Implementation:* `class IntGenerator { private: std::ifstream
      file; public: IntGenerator(const std::string& filename); bool
      next(int& value); };` — one private field, a constructor, and a
      single method.
    - *Its use:* replaces `Array<int>` as this lesson's way of getting
      values out of `readings.txt`, specifically because it never holds
      more than one value at a time.
  - **`IntGenerator::IntGenerator(const std::string& filename)`**
    - *What it is:* the constructor, opening the file without reading
      any of its contents yet.
    - *Implementation:* takes one argument; body is `file.open(filename);`.
    - *Its use:* prepares the file for reading without doing any actual
      reading — reading only happens later, one call to `next` at a
      time.
  - **`IntGenerator::next(int& value)`**
    - *What it is:* the method that produces exactly one value per call.
    - *Implementation:* `bool next(int& value) { return
      static_cast<bool>(file >> value); }` — attempts to read one `int`
      from `file` into `value`, returning whether that read succeeded.
    - *Its use:* the only way this lesson's version of `main()` gets
      values at all — called in a loop, once per value, with nothing
      about the file's total size known or needed in advance.

  **Everything else in this lesson's code, not its own subject but
  still explained:**

  - **`std::ifstream::open(const string& s, ios_base::openmode mode =
    ios_base::in)`** — reappearing from Lesson A3's Header: opens a file
    for an already-constructed (but not-yet-open) `std::ifstream`. Used
    here inside `IntGenerator`'s constructor instead of the constructor-
    argument form Lesson A3 used directly on `main()`'s own `file`
    variable, because `file` here is a class member, default-constructed
    automatically before `IntGenerator`'s own constructor body runs, and
    only opened explicitly once that body executes.
  - **`Array<T>`** — reappearing from Lesson A2: the growable container
    this lesson's Concept Unit measures against as the "read everything
    first" baseline. Its shape is unchanged from Lesson A2's own Header
    entry: private `data`/`size`/`capacity`, public constructor,
    destructor, `push_back`, `get`, `getSize`.

---

## Concept Unit A4.1: The Generator — Producing Values On Demand

### The Problem

Summing every integer in `readings.txt` only ever needs two numbers in
memory at once: a running total, and whichever value is currently being
added to it. Lesson A3's version doesn't work that way — it reads every
value into an `Array<int>` first, and only starts summing once the
entire file is already sitting in heap memory. For a small file that
costs nothing worth noticing. For a file too large to fit in memory —
this lesson's actual vehicle — it's fatal: the `Array<int>` alone would
need more memory than the machine has, before a single addition ever
happens, even though the summing itself never needed more than two
numbers at a time.

### Measuring the Real Cost

That claim shouldn't be taken on faith. Lesson A3's exact approach — no
new code, the identical `Array<int>` and `std::ifstream` already built —
run against a real file of five million integers, measuring peak memory
with a real tool rather than estimating it:

```cpp
Array<int> arr;
std::ifstream file("big_readings.txt");
int value;
while (file >> value) {
    arr.push_back(value);
}

long sum = 0;
for (int i = 0; i < arr.getSize(); i++) {
    sum += arr.get(i);
}
std::cout << "Sum: " << sum << " over " << arr.getSize() << " values" << std::endl;
```

```
$ g++ -std=c++17 -O2 -Wall -Wextra -o eager_sum eager_sum.cpp
$ /usr/bin/time -l ./eager_sum
Sum: 2501877542 over 5000000 values
...
            54722968  peak memory footprint
```

- **`/usr/bin/time -l`** — a real system tool, separate from the program
  itself, that runs a command and reports resource usage after it exits;
  `-l` (on macOS) requests the detailed listing, including `peak memory
  footprint` — the largest amount of real memory the process held at any
  single point during its run, not just at the moment it happened to
  exit.

`54722968` bytes — a little over 52 megabytes — to sum five million
integers that, added up one at a time, would total 20 bytes of running
state (a `long` for the sum, an `int` for the current value). Almost all
of that 52 megabytes is `Array<int>` holding every value simultaneously,
including the doubling growth's own temporary overshoot from Lesson A2's
Concept Unit A2.2. This is the real, measured cost of eager evaluation
applied to this problem.

### Introducing the Concept in Isolation

The idea this lesson needs — produce one value per call, remembering
just enough state to know what comes next, without a container ever
holding more than one value — is easiest to see with no file involved
at all:

```cpp
class Counter {
private:
    int current;

public:
    Counter() { current = 0; }

    int next() {
        int value = current;
        current++;
        return value;
    }
};
```

```cpp
Counter c;
std::cout << c.next() << " " << c.next() << " " << c.next() << " "
          << c.next() << " " << c.next() << std::endl;
```

```
$ ./counter_demo
0 1 2 3 4
```

No array, no list, nothing anywhere in `Counter` holding all five
numbers at once — just one `int` field, `current`, updated in place
each time `next()` is called. Each call produces exactly one value and
remembers exactly enough to produce the next one correctly, and nothing
more. An object built this way — producing a sequence one value at a
time, on demand, rather than handing back a container already holding
every value — is called a **generator**, and the general strategy it
enables, computing each piece only when it's actually needed, is called
**lazy evaluation**.

This isolated example is discarded now; `counter_demo.cpp` does not
appear anywhere in this lesson's actual project. `IntGenerator`, built
next, is the exact same idea — one field, one method that updates it and
returns a value — reading from a file instead of counting integers.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch, same as
  every prior lesson in this track.
- **Files affected** — `sum_readings.cpp` (new file). This is a new
  file, not a further modification of `dynamic_array.cpp`, because its
  job is different in kind: `dynamic_array.cpp` exists specifically to
  hold every value at once (Lesson A6 will need exactly that, to sort
  them) — this lesson's whole point is a version that deliberately never
  does.
- **Change type** — add.
- **Location** — n/a; this file's first content.
- **Dependencies** — `<fstream>`; `readings.txt` (or, for the memory
  measurement below, `big_readings.txt`).

### The New Code

```cpp
class IntGenerator {
private:
    std::ifstream file;

public:
    IntGenerator(const std::string& filename) {
        file.open(filename);
    }

    bool next(int& value) {
        return static_cast<bool>(file >> value);
    }
};
```

### The Updated Project

```cpp
#include <fstream>
#include <string>
#include <iostream>

class IntGenerator {                                  // ← new
private:                                              // ← new
    std::ifstream file;                               // ← new

public:                                               // ← new
    IntGenerator(const std::string& filename) {       // ← new
        file.open(filename);                          // ← new
    }                                                  // ← new

    bool next(int& value) {                           // ← new
        return static_cast<bool>(file >> value);      // ← new
    }                                                  // ← new
};                                                     // ← new

int main() {
    IntGenerator gen("readings.txt");                  // ← new
    long sum = 0;                                      // ← new
    long count = 0;                                    // ← new
    int value;                                         // ← new
    while (gen.next(value)) {                          // ← new
        sum += value;                                  // ← new
        count++;                                       // ← new
    }                                                  // ← new
    std::cout << "Sum: " << sum << " over " << count   // ← new
              << " values" << std::endl;               // ← new
    return 0;
}
```

As a whole, `main()` never constructs a container of any kind — no
`Array<int>`, nothing holding more than the single `value` currently
being processed and the running `sum`. It asks `gen` for one integer at
a time, in a loop, and stops the instant `next` reports there isn't
another one.

```
$ g++ -std=c++17 -O2 -Wall -Wextra -o sum_readings sum_readings.cpp
$ cat readings.txt
5
10
15
20
25
30
$ ./sum_readings
Sum: 105 over 6 values
```

### Mechanical Walkthrough

- **`std::ifstream file;`** (as a class field, no arguments) — declares
  `file` as a member of `IntGenerator`, default-constructed
  automatically before `IntGenerator`'s own constructor body runs, using
  the no-argument `basic_ifstream()` constructor shown in Lesson A3's
  Header — not yet open, since no filename has been given yet.
- **`file.open(filename);`** — calls the `open` method reappearing from
  Lesson A3's Header, opening `file` for reading now that a filename is
  actually available, inside the constructor body rather than at the
  moment `file` was declared.
- **`bool next(int& value)`** — the method that does this class's entire
  job: produces exactly one value per call. Its parameter is a
  **reference** — `value` inside this function refers to the exact same
  `int` the caller passed in, not a separate copy, so writing to `value`
  here is visible to the caller once the call returns.
- **`file >> value`** — the same stream-extraction idiom reused from
  Lessons A1 through A3, here reading directly into the caller's own
  `value` through the reference above.
- **`static_cast<bool>(file >> value)`** — `file >> value` itself
  evaluates to the stream, not a `bool`; this cast explicitly converts
  it to the `true`/`false` "did that read succeed" value `next`'s own
  return type promises, the same conversion the `while (file >> value)`
  condition in Lesson A3 relied on implicitly.
- **`while (gen.next(value))`** (in `main()`) — calls `next` repeatedly,
  once per loop iteration, stopping the instant it returns `false`. At
  no point does this loop know, or need to know, how many total values
  are coming.

### CS Lens

```
Also recognized in: Python's own `yield`-based generator functions
(the direct inspiration for this class's shape), Unix pipes (each
stage of `cat file | grep x | sort` processes data as it arrives,
never holding the whole stream), video streaming (a player never
downloads an entire movie before starting playback), and a database
cursor fetching one result row at a time instead of loading an
entire query result into memory first
```

### SE Lens

The alternative not chosen here is Lesson A3's own approach: read
everything into `Array<int>` first, then process it. That approach has
a real advantage this lesson's version gives up — once everything is in
an `Array<int>`, it can be read multiple times, in any order, as many
times as needed, for free. `IntGenerator` can't do either: `next` moves
forward through the file one call at a time and can never go back, and
once a value has been consumed, it's gone. This lesson's version trades
that flexibility away specifically to make the 52-megabyte number above
disappear — the right trade whenever a value only needs to be looked at
once, in order, exactly the shape a running sum actually has.

### Connecting

The measurement makes the trade concrete rather than theoretical: run
`IntGenerator` against the same five-million-value file `eager_sum`
was measured against earlier in this unit.

```
$ g++ -std=c++17 -O2 -Wall -Wextra -o lazy_sum lazy_sum.cpp
$ /usr/bin/time -l ./lazy_sum
Sum: 2501877542 over 5000000 values
...
             1016144  peak memory footprint
```

Identical sum, identical count — `2501877542` over `5000000` values,
both times — for `1016144` bytes of peak memory instead of `54722968`:
roughly one megabyte instead of fifty-two, a little under a fifty-four-
fold reduction, for the exact same answer.

---

## Closing

**Connect the pieces.** Follow the value `15` through `sum_readings.cpp`
run against the six-value `readings.txt` used throughout this lesson
(`5, 10, 15, 20, 25, 30`). `IntGenerator gen("readings.txt");` runs the
constructor, which calls `file.open("readings.txt")` — the file is open,
but nothing has been read yet; `sum` and `count` are both still `0`.
`gen.next(value)` is called the first time: `file >> value` reads `5`
into the caller's own `value` (through the **reference** parameter),
returns `true`, and `sum` becomes `5`. The second call reads `10`, `sum`
becomes `15`. The third call reads `15` itself into `value`; `sum`,
still holding the running total from the first two values, becomes
`15 + 15 = 30`. At no point during any of this does anything hold `5`,
`10`, and `15` simultaneously — each one is read, added, and gone,
overwritten by `value` on the very next call. By the time all six values
have been consumed and a seventh `next` call returns `false` on genuine
end-of-file, the loop stops, and `main()` prints `Sum: 105 over 6
values` — the correct total, reached without a single container ever
holding more than one value at once.

**What breaks without this.** "Breaks" here isn't a crash — it's the
real, measured cost this lesson opened with, restated as the concrete
consequence of removing this lesson's fix and going back to Lesson A3's
`Array<int>`-based approach for the same large input:

```
$ /usr/bin/time -l ./eager_sum      # Array<int>, big_readings.txt
Sum: 2501877542 over 5000000 values
            54722968  peak memory footprint

$ /usr/bin/time -l ./lazy_sum       # IntGenerator, big_readings.txt
Sum: 2501877542 over 5000000 values
             1016144  peak memory footprint
```

Both produce the identical, correct answer. The `Array<int>` version
needs `54722968` bytes to do it; `IntGenerator` needs `1016144`. Scale
the input file up far enough — this lesson's own vehicle, "too large to
fit in memory" — and that gap stops being a performance curiosity and
becomes the difference between a program that runs and one that can't
allocate the memory it asked for at all. `IntGenerator`'s peak memory
doesn't grow with the file's size in the first place, so that failure
mode doesn't exist for it.

**Exercises.**

1. Add a method to `IntGenerator` that reports how many values it has
   produced so far, without changing `next`'s own signature, and
   confirm it matches `main()`'s own separately-tracked `count` after a
   full run.
2. Modify `main()` to find the *maximum* value in `readings.txt` instead
   of the sum, using `IntGenerator` the same way — confirming the
   generator pattern isn't specific to summing, only to "process each
   value once, in order."
3. Try calling `gen.next(value)` one additional time after it has
   already returned `false` once, and observe what happens — confirming,
   by testing rather than assuming, whether this `IntGenerator` is safe
   to over-call or not.

**Definition of done.**

- [ ] `sum_readings.cpp` compiles cleanly with `g++ -std=c++17 -Wall
      -Wextra`, zero warnings, and correctly sums `readings.txt`.
- [ ] The eager (`Array<int>`) and lazy (`IntGenerator`) versions were
      both actually built and measured against the same large file with
      `/usr/bin/time -l`, this session, confirming the real memory gap
      rather than assuming it.
- [ ] Both versions produce the identical sum and count against the
      same input, confirming the memory savings didn't come at the cost
      of correctness.
- [ ] `git commit` with a message explaining *why* this version's peak
      memory doesn't scale with the input file's size — not merely that
      it uses less memory on one specific test file.
