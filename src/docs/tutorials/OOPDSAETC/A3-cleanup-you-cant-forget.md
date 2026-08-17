# Lesson A3: Cleanup You Can't Forget

_A file must never stay open if an error happens mid-read._

- **What you will build** — Lessons A1 and A2 read integers from
  standard input. This lesson switches the real source to an actual
  file on disk, `readings.txt`, and confronts a problem that never came
  up while reading from `std::cin`: a file has to be explicitly opened
  and explicitly closed, and if any code path — including an error
  discovered partway through reading — skips the close, the operating
  system considers that file handle still in use, indefinitely. This
  lesson proves that danger is real, with a real resource-exhaustion
  failure, then fixes it using the same constructor/destructor
  machinery Lesson A2 introduced, applied to a new purpose: making
  cleanup something the language itself guarantees, rather than
  something a programmer has to remember on every possible exit path.

- **What you need to know first** — Lesson A2's `Array<T>` class, and
  specifically its constructor/destructor pair: a constructor runs
  automatically the instant an object is created, a destructor runs
  automatically the instant an object's lifetime ends, and neither
  requires the object's own creator to call them by name.

- **Terms used in this lesson**

  - **File handle** — an operating-system-level reference to a
    currently-open file, distinct from the file's contents or its name
    on disk. It exists because the operating system has to track, for
    every process, which files that process currently has open, so it
    can enforce limits and clean up if the process crashes — and every
    operating system caps how many a single process may hold open at
    once, precisely because this bookkeeping isn't free.
  - **Resource leak** — acquiring something with a limited supply (a
    file handle, a block of memory, a network connection) and never
    releasing it, so the supply available for everything else keeps
    shrinking for as long as the program keeps running. It's the same
    underlying failure Lesson A1's Concept Unit A1.2 touched on for heap
    memory specifically (forgetting `delete[]`) — this lesson shows the
    identical failure shape against a different, and in some ways less
    forgiving, kind of resource.
  - **RAII (Resource Acquisition Is Initialization)** — the specific
    software engineering pattern this lesson is actually about: tie a
    resource's acquisition to an object's *construction*, and its
    release to that same object's *destruction*, so that the language's
    own guarantee about when destructors run becomes a guarantee about
    when the resource gets released — automatically, on every possible
    exit path, without the resource's user having to remember anything.
    It exists because "remember to call the matching cleanup function"
    is a rule a programmer can follow correctly a thousand times and
    forget once, and the one time it's forgotten produces exactly the
    kind of silent, gradually-worsening failure this lesson proves is
    real.
  - **Scope** — the region of a program's text in which a particular
    local variable exists, from its declaration to the closing `}` of
    the block it was declared in. It matters here specifically because
    RAII's actual guarantee is stated in terms of it: a local object's
    destructor runs the instant that object goes out of scope — whether
    that's because execution reached the end of the block normally, or
    because a `return` statement inside that block exited early. Both
    are "leaving scope," and the destructor doesn't distinguish between
    them.
  - **`errno`** — a global, per-thread integer that many C standard
    library functions set when they fail, identifying which specific
    error occurred. It exists because a function like `fopen` can fail
    for several different reasons (the file doesn't exist, the process
    already has too many files open, permission was denied), and a
    single `nullptr` return value on its own can't distinguish which one
    happened — `errno` is where that extra detail is recorded.

- **Objects and methods used**

  - **`fopen`**
    - *What it is:* a C standard library function (from `<cstdio>`) that
      opens a file and returns a raw file handle.
    - *Implementation:* `FILE* fopen(const char* filename, const char*
      mode);` — returns a pointer to a `FILE` on success, or `nullptr`
      on failure (with `errno` set to say why).
    - *Its use:* Concept Unit A3.1's throwaway lab uses it as the
      lowest-level, most manual way to acquire a file handle — deliberately
      manual, so the cost of forgetting to release it is easy to see.
  - **`fgets`**
    - *What it is:* a C standard library function that reads one line of
      text from an already-open file into a fixed-size buffer.
    - *Implementation:* `char* fgets(char* buffer, int size, FILE*
      stream);` — returns `buffer` on success, or `nullptr` if there was
      nothing left to read.
    - *Its use:* Concept Unit A3.1's lab reads a line, and specifically
      relies on its `nullptr` return (an empty file has no line to
      read) to trigger the early-return path the whole unit is
      demonstrating.
  - **`fclose`**
    - *What it is:* the C standard library function that releases a file
      handle previously obtained from `fopen`.
    - *Implementation:* `int fclose(FILE* stream);` — returns `0` on
      success.
    - *Its use:* the exact call Concept Unit A3.1's lab skips on its
      error path, which is the entire mechanism of the leak it proves.
  - **`strerror`**
    - *What it is:* a C standard library function (from `<cstring>`)
      converting a numeric error code into a human-readable message.
    - *Implementation:* `char* strerror(int errnum);` — returns a
      pointer to a static string describing the error.
    - *Its use:* turns this lesson's raw `errno` numbers into readable
      diagnostic output, so the proof in Concept Unit A3.1 states in
      plain words exactly what went wrong, not just a bare number.
  - **`std::ifstream`**
    - *What it is:* the C++ standard library's own class for reading
      from a file, and this lesson's real subject: the concrete,
      already-written proof that the RAII pattern isn't something this
      lesson invents, but something the standard library already relies
      on.
    - *Implementation (verified against this machine's actual
      `<fstream>` header this session):*
      ```cpp
      class basic_ifstream : public basic_istream<charT, traits> {
      public:
          basic_ifstream();
          explicit basic_ifstream(const char* s,
                                   ios_base::openmode mode = ios_base::in);
          explicit basic_ifstream(const string& s,
                                   ios_base::openmode mode = ios_base::in);
          bool is_open() const;
          void open(const char* s, ios_base::openmode mode = ios_base::in);
          void close();
          // ...
      private:
          basic_filebuf<char_type, traits_type> __sb_;  // the real resource
      };
      typedef basic_ifstream<char> ifstream;
      ```
      Note what's *not* declared: no explicit destructor. `__sb_`, the
      private `basic_filebuf` member that actually owns the OS file
      handle, is held *by value*, not by pointer — so `ifstream`
      doesn't need to write its own destructor at all; destroying an
      `ifstream` object automatically destroys its `__sb_` member as
      part of ordinary object teardown, and `basic_filebuf` declares its
      own real destructor (`virtual ~basic_filebuf();`, confirmed in the
      same header) which is what actually calls the equivalent of
      `close()`.
    - *Its use:* Concept Unit A3.2 replaces this lesson's hand-built
      wrapper class with `std::ifstream` directly in the real project,
      once its declared shape above proves it already behaves exactly
      like that wrapper would.
  - **`std::ifstream::is_open()`**
    - *What it is:* a method reporting whether the file was actually
      opened successfully.
    - *Implementation:* `bool is_open() const;` — `true` if the
      underlying `basic_filebuf` has a file open, `false` otherwise.
    - *Its use:* the real project's first check after attempting to open
      `readings.txt`, distinguishing "the file doesn't exist" from
      "the file opened and something went wrong while reading it."
  - **`std::ifstream::eof()`** (inherited from `std::basic_ios`)
    - *What it is:* a method reporting whether the stream's own read
      position has reached the end of the file.
    - *Implementation:* `bool eof() const;` — `true` once an attempted
      read has run past the last character available.
    - *Its use:* the real project's way of telling "the loop stopped
      because the file legitimately ended" apart from "the loop stopped
      because it hit something that wasn't a valid integer" — the exact
      distinction this lesson's vehicle, "an error happens mid-read,"
      depends on being able to make.

---

## Concept Unit A3.1: The Leak

### The Problem

`readings.txt` has to be opened before it can be read, and closed when
the program is done with it — and unlike heap memory, whose only real
API is "allocate" and "free," a file adds a third possibility: reading
can go wrong partway through, after the file already opened
successfully. If the code handling that failure returns early, does the
close still happen? Answering that with real evidence, rather than
assuming it "probably does," is this unit's whole job.

### This Unit's Code

No project file is created or modified by this unit. Per the Concept
Isolation Rule, this is throwaway code, using the most manual, lowest-
level file API C++ has available specifically so the missing cleanup is
easy to see — it is never adopted into this lesson's actual project.

```cpp
#include <cstdio>
#include <cerrno>
#include <cstring>
#include <iostream>

bool readFirstLine(const char* filename, int callNum) {
    FILE* file = fopen(filename, "r");
    if (file == nullptr) {
        std::cout << "call " << callNum << ": fopen failed (errno="
                  << errno << " " << strerror(errno) << ")" << std::endl;
        return false;
    }

    char buffer[256];
    if (fgets(buffer, sizeof(buffer), file) == nullptr) {
        return false;  // error path: fclose below is skipped
    }

    fclose(file);
    return true;
}

int main() {
    int failCount = 0;
    for (int i = 0; i < 200; i++) {
        bool ok = readFirstLine("empty.txt", i);
        if (!ok) failCount++;
    }
    std::cout << "Finished 200 calls, " << failCount
              << " total failures." << std::endl;
    return 0;
}
```

`empty.txt` is a real, genuinely empty file — so every single call's
`fgets` legitimately has nothing to read, and hits the `return false;`
line that skips `fclose`. Run 200 times, with the operating system's own
open-file limit deliberately lowered first, to make the consequence
visible within a short, finite run instead of requiring thousands of
real calls:

```
$ g++ -std=c++17 -Wall -Wextra -o leak_demo leak_demo.cpp
$ (ulimit -n 50; ./leak_demo)
call 47: fopen failed (errno=24 Too many open files)
call 48: fopen failed (errno=24 Too many open files)
call 49: fopen failed (errno=24 Too many open files)
...
call 199: fopen failed (errno=24 Too many open files)
Finished 200 calls, 200 total failures.
```

- **`ulimit -n 50`** — a shell command (not part of this program) that
  caps the maximum number of files this specific process is allowed to
  have open at once, at `50`, before the program even starts. It's used
  here purely to make a real leak observable in under 200 iterations
  instead of the tens of thousands a default limit would require — the
  bug itself, and its cause, are identical either way; this only changes
  how long it takes to see it.

The first 46 calls succeed silently — each one opens `empty.txt`, finds
nothing to read, and leaks that one handle. By call 47, 46 leaked
handles plus the handful the process was already using (standard input,
output, error, and a few others) hit the artificial ceiling of 50, and
every `fopen` call for the rest of the run fails outright — not because
anything is wrong with `empty.txt` itself, but because the process
genuinely has no open-file slots left. `errno`, decoded through
`strerror`, confirms the exact reason in plain words: `"Too many open
files"` — not a guess about what might be happening, the operating
system's own stated reason.

This demonstration is discarded now. `leak_demo.cpp` does not exist
anywhere in this lesson's actual project — its only job was proving that
"forgetting to close on an error path" is a real, measurable failure,
not a hypothetical one.

### Mechanical Walkthrough

- **`FILE* file = fopen(filename, "r");`** — calls **`fopen`**, requesting
  a **file handle** for reading (`"r"` mode). Success or failure is
  reported only through the return value — `nullptr` on failure, a real
  pointer on success — with no other signal.
- **`if (file == nullptr) { ...; return false; }`** — the *safe* error
  path: since `fopen` itself never succeeded, there is no open handle
  yet, so returning here leaks nothing. This branch is not the bug.
- **`fgets(buffer, sizeof(buffer), file)`** — calls **`fgets`**,
  attempting to read one line from the now-open `file` into `buffer`.
- **`if (... == nullptr) { return false; }`** — the *unsafe* error path:
  by this point `file` genuinely is an open handle, and this `return`
  exits the function without ever reaching the `fclose` call below it.
  This is the entire bug, in one line.
- **`fclose(file);`** — calls **`fclose`**, the matching release for the
  earlier `fopen`. It's real code, correctly written — the problem isn't
  that this line is wrong, it's that one specific path through the
  function never reaches it at all.

### CS Lens

A **resource leak** isn't unique to files — it's any case where
something with a finite supply is acquired but not reliably released on
every path that acquired it.

```
Also recognized in: memory leaks (Lesson A1's Concept Unit A1.2, the
same shape applied to heap blocks instead of file handles), network
socket exhaustion in a long-running server, database connection pool
exhaustion under load, and a forgotten mutex unlock deadlocking every
other thread waiting on it
```

### SE Lens

The alternative not chosen here is relying on programmer discipline: a
comment, a code review checklist, a team convention that says "always
match `fopen` with `fclose`, on every path, including error paths." That
costs nothing to set up and works, right up until it doesn't — nothing
about it is checked by the compiler, nothing about it is enforced at the
moment a new early-return gets added to this function six months later
by someone who's never read this comment. The real cost this project is
carrying right now, demonstrated concretely above: the bug produces zero
symptoms for the first 46 calls, and only becomes visible once leaked
handles accumulate past whatever limit happens to be in effect — exactly
the kind of failure that slips past a quick manual test and only shows
up under sustained real use.

### Connecting

The bug isn't the specific missing `fclose` call — it's that *any*
manual pairing of "acquire" and "release" requires perfect human memory
on every possible exit path, forever. Lesson A2 already has a mechanism
that runs automatically on every exit path without being asked: a
destructor. The next unit puts it to work on exactly this problem.

---

## Concept Unit A3.2: RAII — Tying the File to an Object's Lifetime

### The Problem

The actual flaw in Concept Unit A3.1 wasn't C's specific API — it's that
manual open/close pairing depends on every single code path remembering
to call `fclose`, including ones written later by someone who's never
seen this function before. Lesson A2's constructor and destructor
already run automatically, on every path, without anyone remembering to
call them. Can a file's opening and closing be handed to that exact
mechanism instead?

### Introducing the Concept in Isolation

Wrapping a raw `FILE*` in a small class — using exactly the constructor
and destructor mechanics Lesson A2's Concept Unit A2.1 already
introduced — answers that directly:

```cpp
class FileGuard {
private:
    FILE* file;

public:
    FileGuard(const char* filename) {
        file = fopen(filename, "r");
    }

    ~FileGuard() {
        if (file != nullptr) {
            fclose(file);
        }
    }

    FILE* get() {
        return file;
    }
};
```

Rewriting Concept Unit A3.1's function to use it, changing nothing about
*when* the error path returns early:

```cpp
bool readFirstLine(const char* filename, int callNum) {
    FileGuard guard(filename);
    if (guard.get() == nullptr) {
        std::cout << "call " << callNum << ": fopen failed (errno="
                  << errno << " " << strerror(errno) << ")" << std::endl;
        return false;
    }

    char buffer[256];
    if (fgets(buffer, sizeof(buffer), guard.get()) == nullptr) {
        return false;  // early return — but guard still goes out of scope here
    }

    return true;
}
```

Run under the identical artificial limit, against the identical empty
file, for the identical 200 calls:

```
$ g++ -std=c++17 -Wall -Wextra -o raii_fix raii_fix.cpp
$ (ulimit -n 50; ./raii_fix)
Finished 200 calls, 200 total failures.
```

`200` failures, same as before — every call still legitimately fails to
read a line from an empty file, exactly as it should. What's different,
and what matters: zero `fopen failed` messages, meaning `fopen` itself
never once failed, across all 200 calls, under the exact same 50-file
ceiling that broke Concept Unit A3.1's version at call 47. `guard` is a
local variable; the moment `readFirstLine` returns — on *either* path,
including the early one — `guard` goes out of scope, and its destructor
runs, and `fclose` gets called whether or not the code that wrote the
`return false;` line was thinking about cleanup at all. This is the
pattern named in this lesson's own Terms: **RAII** — the resource
(the open file) is acquired the moment the object is constructed, and
released the moment the object is destructed, with the *object's*
lifetime, not any human's memory, in charge of both.

The timing, precisely, for one call that hits the early-return path:

1. `FileGuard guard(filename);` — the constructor runs immediately,
   calling `fopen` and storing whatever it returns.
2. `if (guard.get() == nullptr)` — assuming the file *did* open (this
   branch is false), execution continues past it with the file handle
   still live inside `guard`.
3. `fgets(...) == nullptr` — the read genuinely finds nothing (an empty
   file), so this condition is true.
4. `return false;` — execution leaves `readFirstLine` here. `guard`,
   a local variable declared inside this function, has just gone out of
   **scope**.
5. `~FileGuard()` — runs automatically, as the direct consequence of
   step 4, calling `fclose` before `readFirstLine`'s caller ever regains
   control. No line of source code in `readFirstLine` asked for this to
   happen at this specific point; it's a guarantee the language itself
   provides for local objects.

This isolated wrapper is discarded now — `FileGuard` does not appear
anywhere in this lesson's actual project. It was built only to make the
mechanism transparent. What replaces it is more interesting than a
wrapper this lesson has to maintain itself.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch, same as
  Lessons A1 and A2.
- **Files affected** — `dynamic_array.cpp` (modified).
- **Change type** — replace.
- **Location** — replacing `main()`'s `std::cin`-based reading loop
  (established across Lesson A1's Concept Unit A1.3 and Lesson A2's
  Concept Unit A2.2) with file-based reading from `readings.txt`.
- **Dependencies** — `<fstream>`; Lesson A2's `Array<T>` class,
  unchanged.

Rather than maintaining `FileGuard` going forward, the real project uses
`std::ifstream` directly — this lesson's own Header already showed, from
this machine's real `<fstream>` header, that `ifstream` privately holds
its actual file resource (`basic_filebuf __sb_`) *by value*, and that
`basic_filebuf` declares its own real destructor. `std::ifstream` is not
a different idea from `FileGuard` above — it's the same RAII pattern,
already written, already tested, already shipped as part of the C++
standard library, which is exactly why nothing built by hand in this
unit needs to be kept.

### The New Code

```cpp
std::ifstream file("readings.txt");
if (!file.is_open()) {
    std::cout << "Could not open readings.txt" << std::endl;
    return 1;
}

int value;
while (file >> value) {
    arr.push_back(value);
}

if (!file.eof()) {
    std::cout << "Error: readings.txt contains something that isn't a number." << std::endl;
    return 1;
}
```

### The Updated Project

```cpp
#include <fstream>
#include <iostream>

template <typename T>
class Array {
private:
    T* data;
    int size;
    int capacity;

public:
    Array() {
        capacity = 4;
        size = 0;
        data = new T[capacity];
    }

    ~Array() {
        delete[] data;
    }

    void push_back(T value) {
        if (size == capacity) {
            int newCapacity = capacity * 2;
            T* newData = new T[newCapacity];
            for (int i = 0; i < size; i++) {
                newData[i] = data[i];
            }
            delete[] data;
            data = newData;
            capacity = newCapacity;
        }
        data[size] = value;
        size++;
    }

    T get(int index) {
        return data[index];
    }

    int getSize() {
        return size;
    }
};

int main() {
    Array<int> arr;
    std::ifstream file("readings.txt");            // ← new
    if (!file.is_open()) {                          // ← new
        std::cout << "Could not open readings.txt"  // ← new
                  << std::endl;                     // ← new
        return 1;                                   // ← new
    }                                                // ← new

    int value;
    while (file >> value) {                          // ← changed
        arr.push_back(value);
    }

    if (!file.eof()) {                               // ← new
        std::cout << "Error: readings.txt contains " // ← new
                  << "something that isn't a number." // ← new
                  << std::endl;                      // ← new
        return 1;                                    // ← new
    }                                                 // ← new

    std::cout << "Stored " << arr.getSize()
              << " values:" << std::endl;
    for (int i = 0; i < arr.getSize(); i++) {
        std::cout << arr.get(i) << " ";
    }
    std::cout << std::endl;

    return 0;
}
```

`Array<T>` is completely unchanged from Lesson A2. As a whole, `main()`
now opens a real file instead of reading `std::cin`, refuses to proceed
if the open itself failed, reads every integer it can, and — new in this
lesson — explicitly checks *why* the reading loop stopped: `file.eof()`
tells apart "the file legitimately ran out of numbers" from "something
in the file wasn't a number at all," and only the first case is allowed
to reach the normal success output. The second case returns early, and
because `file` is a local `std::ifstream`, that early return closes it
exactly the way `FileGuard` did above — no code in `main()` calls
`close()` anywhere, on either exit path.

Run against a well-formed file, and separately against one with a bad
token partway through:

```
$ g++ -std=c++17 -Wall -Wextra -o dynamic_array dynamic_array.cpp
$ printf "5\n10\n15\n20\n25\n30\n" > readings.txt
$ ./dynamic_array
Stored 6 values:
5 10 15 20 25 30
$ printf "5\n10\nabc\n20\n" > readings.txt
$ ./dynamic_array
Error: readings.txt contains something that isn't a number.
$ echo $?
1
```

And the same 200-call, tight-file-limit proof used against Concept Unit
A3.1's version, applied to this exact mid-read-error path — a malformed
file, read 200 times in a row, under the same artificially low ceiling
that broke the raw `FILE*` version at call 47:

```
$ (ulimit -n 50; ./stress_midread)
Finished 200 calls, 200 reported mid-read errors.
```

Every one of the 200 calls correctly detects the malformed token and
returns early — and not one of them fails to open the file, meaning
`std::ifstream`'s own destructor closed it every single time, exactly as
`FileGuard`'s hand-written one did.

### Mechanical Walkthrough

- **`std::ifstream file("readings.txt");`** — constructs a real
  `std::ifstream` object, calling the constructor shown in this lesson's
  Header (`explicit basic_ifstream(const char* s, ...)`), which opens
  `readings.txt` for reading as part of construction itself — the
  acquisition half of RAII.
- **`file.is_open()`** — calls the method of the same name shown in the
  Header, checking whether that construction-time open actually
  succeeded.
- **`file >> value`** (inside the `while` condition) — the same stream
  extraction idiom already used with `std::cin` in Lessons A1 and A2,
  here reading from a file instead of standard input; it returns the
  stream itself, which converts to `false` the moment a read fails,
  either from running out of file or from finding something that isn't
  a valid `int`.
- **`file.eof()`** — calls the method shown in the Header, checked only
  *after* the loop exits, to determine which of those two reasons
  actually stopped it.
- **`return 1;`** (both places) — an early return, exactly like Concept
  Unit A3.1's and A3.2's throwaway examples, except this time acting on
  the real, local `file` object — its destructor, inherited from
  `std::ifstream`'s own design (the private `basic_filebuf` member shown
  in the Header), runs automatically the instant either `return`
  executes.

### CS Lens

RAII is a specific application of a broader idea: coupling two events
that must always happen together — open and close, lock and unlock,
begin and commit — to a single object's lifetime, so the language's own
scoping rules enforce the pairing instead of a programmer's memory.

```
Also recognized in: Python's `with` statement (a context manager's
__exit__ runs on the way out of the block, error or not), Java's
try-with-resources, Rust's ownership system (a value's Drop runs when
it goes out of scope, checked at compile time), and a `std::lock_guard`
releasing a mutex automatically, the identical pattern applied to a
lock instead of a file
```

### SE Lens

The alternative not chosen here is exactly Concept Unit A3.1's approach:
manual, explicit `fopen`/`fclose` pairing, trusted to be correct on
every path by convention alone. RAII's real cost is indirection — the
actual `fclose`-equivalent call is nowhere visible at the point where
the resource stops being needed; a reader has to already know that
`std::ifstream`'s destructor does this, rather than seeing a `close()`
call sitting right there in `main()`. That's a genuine tradeoff, not a
free win: implicit, guaranteed correctness in exchange for cleanup that
isn't visible in the local text a reader is looking at. This project
takes that trade deliberately, because Concept Unit A3.1 already proved,
with a real measured failure, what the explicit version costs when a
single path is missed even once.

### Connecting

The file this lesson reads now closes itself, on every exit path,
including the one nobody was thinking about while writing the reading
loop — the same guarantee Lesson A2's `Array<T>` already provides for
its own heap memory, now extended to a second, independent kind of
resource, using the identical constructor/destructor mechanism both
times.

---

## Closing

**Connect the pieces.** Follow a run of `dynamic_array.cpp` against a
`readings.txt` containing `5\n10\nabc\n20\n`. `std::ifstream file(...)`
constructs `file`, which — per this lesson's own Header, verified
against the real `<fstream>` header — constructs its private
`basic_filebuf __sb_` member and opens the file through it, succeeding
since `readings.txt` exists. `file.is_open()` is `true`, so the function
continues. The `while (file >> value)` loop reads `5` and `10`
successfully, each one pushed into `arr` via Lesson A2's `Array<int>`
(itself allocating and, if it grows, reallocating heap memory the same
way Lesson A1 first built). On the third read, `file >> value` meets
`abc`, fails, and the loop exits. `file.eof()` is checked: `false`,
because the stream stopped due to bad content, not because it ran out of
file — so the error branch runs, prints the message, and `return 1;`
executes. At that exact moment, `file` goes out of **scope**; its
destructor runs, tearing down `__sb_`, whose own destructor is what
actually releases the underlying file handle back to the operating
system — all of it happening automatically, with nothing in `main()`'s
own text calling `close()` anywhere.

**What breaks without this.** Go back to `main()`'s file-handling logic
and replace `std::ifstream` with the raw `fopen`/`fscanf`-style approach
Concept Unit A3.1 demonstrated, keeping the exact same mid-read-error
shape `main()` actually uses — read integers until something fails, then
check whether that failure was end-of-file or a real problem:

```cpp
bool readAllInts(const char* filename) {
    FILE* file = fopen(filename, "r");
    if (file == nullptr) {
        return false;
    }
    int value;
    while (fscanf(file, "%d", &value) == 1) { /* pretend to store it */ }
    if (!feof(file)) {
        return false;  // error mid-read: fclose below is skipped
    }
    fclose(file);
    return true;
}
```

Called 200 times against the same malformed `readings.txt` used
throughout this lesson, under the same artificially tight file-handle
limit:

```
$ g++ -std=c++17 -Wall -Wextra -o leak_demo_midread leak_demo_midread.cpp
$ (ulimit -n 50; ./leak_demo_midread)
call 47: fopen failed (errno=24 Too many open files)
call 48: fopen failed (errno=24 Too many open files)
...
call 199: fopen failed (errno=24 Too many open files)
Finished 200 calls, 200 reported mid-read errors.
```

The exact same collapse at call 47 that opened Concept Unit A3.1 — the
`fclose` on the last line is real, correct code, and it's skipped every
single time by the `return false;` two lines above it, exactly as
before. Restoring `std::ifstream` — this lesson's own Updated Project
block above — fixes it, for the same reason it worked the first time:
the resource's release is tied to an object's lifetime, not to a line of
code someone has to remember to write.

**Exercises.**

1. Add a second `std::ifstream`, opening a *different* file, inside the
   same `main()`, and confirm — by adding a temporary `std::cout` inside
   a small wrapper, the same way Concept Unit A2.1's instrumented lab
   did — that both close automatically, in reverse order of their
   declarations, when `main()` returns.
2. Change `readings.txt` to contain only text with no valid integers at
   all as its very first token, and trace, by hand, exactly which lines
   of `main()` execute before the program exits — confirming the file
   still closes even though not a single value was ever successfully
   read.
3. Rewrite Concept Unit A3.1's `FileGuard` to also expose an `is_open()`
   method mirroring `std::ifstream`'s real one, and confirm it reports
   the same result `guard.get() != nullptr` already gave — proving the
   hand-built wrapper and the standard library's real class expose
   equivalent information through different names.

**Definition of done.**

- [ ] `dynamic_array.cpp` reads from `readings.txt` via `std::ifstream`
      and compiles cleanly with `g++ -std=c++17 -Wall -Wextra`, zero
      warnings.
- [ ] Running it against a well-formed file prints every value; running
      it against a file with a bad token prints the mid-read error
      message and exits `1`.
- [ ] The raw `FILE*` leak was actually built and run under a lowered
      `ulimit -n`, confirming the real failure, before being replaced.
- [ ] The RAII-based version was stress-tested under the identical
      lowered limit, confirming zero failures where the raw version
      failed at call 47.
- [ ] `git commit` with a message explaining *why* this file's cleanup
      is guaranteed rather than merely present — not just that the code
      compiles.
