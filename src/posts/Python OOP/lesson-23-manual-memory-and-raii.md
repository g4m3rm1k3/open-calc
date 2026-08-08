# Lesson 23: Nobody Is Coming to Clean Up After You
### (Project 9 — Mini Database Engine, C++)

**What you will build.** A real, measured memory leak — millions of
allocations, never freed, watched growing live against actual process
memory — and a real use-after-free bug, caught precisely by a
diagnostic tool built for exactly this problem. Then the fix neither
Python, JavaScript, Java, nor C# ever needed: RAII, where a resource's
cleanup is tied to an object's own lifetime, running automatically —
even through an early return — with no garbage collector anywhere
underneath making any of it happen. The transferable problem this
lesson is actually about: every single language in this curriculum
until now managed memory *for* you, invisibly; C++ doesn't, and this
lesson exists to make that concrete, not theoretical.

**What you need to know first.** Nothing from any specific project —
this is a genuinely new foundation. What carries over is the instinct
built across four phases: run it, measure it, trust the real output
over a description of what "should" happen.

---

## Concept Unit: Manual Allocation, and a Real Leak

### The Problem

Every object created in Python, JavaScript, Java, and C# eventually
became unreachable and was automatically reclaimed by a garbage
collector, invisibly, without a single line of code asking for it.
C++ has no such thing running by default. Memory requested with `new`
stays allocated — genuinely, physically reserved — until something
explicitly gives it back with `delete`, forever, or until the program
ends.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `manual_lab.cpp` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — a C++ compiler (`g++`) — no separate runtime; C++
  compiles directly to a native executable, with nothing like the JVM
  or .NET runtime underneath.

### The New Code

```cpp
#include <iostream>

int main() {
    int* number = new int;
    *number = 42;
    std::cout << *number << std::endl;
    delete number;
    return 0;
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```
$ g++ -o manual_lab manual_lab.cpp
$ ./manual_lab
42
```

`new int` requests a genuine block of memory, on the **heap**, large
enough for one `int`, and hands back its address — a **pointer** —
stored in `number`. `*number` (the **dereference operator**) reaches
through that address to read or write the actual value stored there.
`delete number;` gives that memory back — after this line, `number`
still holds the same address, but the memory it points to is no longer
this program's to use.

Now, the real point of this unit — what happens if `delete` is simply
never called, at scale:

```cpp
for (int i = 0; i < 1000000; i++) {
    int* leaked = new int[100];  // allocated, never deleted
}
```

Real, measured output, reading this process's own actual memory usage
directly from the operating system before and after:

```
Memory before: 3564 KB
Memory after 1,000,000 un-freed allocations: 409940 KB
```

**3.5 MB to 400 MB** — genuinely, measurably real memory, permanently
reserved by this one process, that will never be given back until the
program exits, because nothing ever called `delete[]` on any of the one
million arrays allocated in that loop. This is a **memory leak**, and
unlike every leak-shaped bug named honestly in earlier phases (Lesson
13's unbounded cache, for instance), this isn't a design tradeoff being
accepted — it's simply memory a program forgot to give back, growing
without limit for as long as the program keeps running.

### Discard the throwaway example

`manual_lab.cpp` is deleted — its own single `new`/`delete` pair was
correct and unremarkable; the leaking loop that followed it is this
unit's real point and is itself discarded once measured.

### Mechanical walkthrough

- `int* number = new int;` — **(a) first appearance** of `new`:
  requests heap memory sized for one `int` and returns its address.
  `int*` — **(a) first appearance** of a **pointer type**: `number`
  doesn't hold an `int` directly, it holds the *address* of one.
- `*number = 42;` — **(a) first appearance** of dereferencing to
  *write* through a pointer: follows the address stored in `number` and
  writes `42` into the memory found there.
- `std::cout << *number << std::endl;` — **(a) first appearance** of
  C++'s standard output: `std::cout` is the output stream, `<<` sends
  values to it, `std::endl` ends the line — the direct counterpart to
  `print`/`console.log`/`System.out.println`/`Console.WriteLine`, one
  more spelling of the same idea across five languages now.
- `delete number;` — **(a) first appearance.** Releases the memory
  `number` points to, back to the operating system's available pool —
  proven, by contrast, in the leak measurement, to be the step that
  makes all the difference.
- `new int[100]` — **(a) first appearance** of array allocation:
  requests heap memory for 100 `int`s at once, requiring `delete[]`
  (not plain `delete`) to release correctly.

### CS lens

This is **manual memory management**: the programmer, not a runtime, is
responsible for both requesting and releasing every dynamically
allocated resource. Also recognized in: C (C++'s direct ancestor,
sharing this exact model), any embedded systems programming where a
garbage collector's own overhead and unpredictability are unacceptable,
older Objective-C before ARC was introduced.

### SE lens

The real tradeoff, worth stating precisely rather than declaring one
approach simply better: every language in Phases 1–4 traded direct
control over memory for real safety and simplicity — no leak from
forgetting to free something, because nothing ever needs to be freed by
hand. That safety has a real, invisible cost this curriculum never had
to measure until now: a garbage collector itself consumes CPU time and
introduces unpredictable pauses, deciding on its own schedule when to
run. C++ gives that control back, in exchange for exactly the
responsibility this unit just proved has real, measurable teeth when
neglected.

### Commands needed

`g++ -o <output> <file>.cpp` compiles a C++ source file into a native
executable; `-Wall` (used throughout this lesson) enables the
compiler's own warnings, catching some — though not all, proven in the
next unit — real mistakes. `./<output>` runs the compiled program
directly, no separate runtime invocation needed.

### Run it

Both shown above — the correct pair, and the measured leak.

### Connecting sentence

Forgetting to free memory is a real, measured cost — the next unit
shows a different, arguably worse mistake: freeing memory and then
still trying to use it.

---

## Concept Unit: Use-After-Free

### The Problem

`delete` gives memory back — but the pointer that used to point to it
doesn't know that happened. Nothing in C++ automatically prevents code
from continuing to use a pointer after the memory it referenced has
already been released.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `use_after_free.cpp` (throwaway, this
  unit only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none new; the diagnostic tool used below,
  AddressSanitizer, ships with `g++` itself, enabled with a compiler
  flag.

### The New Code

```cpp
#include <iostream>

int main() {
    int* number = new int;
    *number = 42;
    delete number;

    std::cout << "Value after delete: " << *number << std::endl;
    *number = 99;
    std::cout << "Value after writing to freed memory: " << *number << std::endl;

    return 0;
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```
$ g++ -o use_after_free use_after_free.cpp
$ ./use_after_free
Value after delete: 1627580069
Value after writing to freed memory: 99
```

This is worth being exact about, because the real result is more
unsettling than a clean crash would be: the program didn't fail loudly.
It ran to completion, printed a plausible-looking (wrong) number
instead of `42`, then appeared to successfully write and read `99`
through memory that had already been given back. This is called
**undefined behavior**: once memory has been `delete`d, the language
makes *no promise at all* about what happens if it's used again — not
"it will crash," not "it will keep the old value," nothing. It might
crash. It might silently return garbage. It might, as it did here,
appear to work — right up until some other, unrelated part of the
program reuses that same memory for something else entirely, and the
two collide in a way that's far harder to trace back to this exact
line.

Because a program silently "working" while doing something genuinely
wrong is the actual danger here, real diagnostic tooling exists
specifically to catch this. Recompiling with AddressSanitizer:

```
$ g++ -fsanitize=address -g -o use_after_free_san use_after_free.cpp
$ ./use_after_free_san
==810==ERROR: AddressSanitizer: heap-use-after-free on address 0x502000000010
READ of size 4 at 0x502000000010 thread T0
    #0 0x555e3a6b434d in main use_after_free.cpp:8

freed by thread T0 here:
    #0 ... operator delete(...)
    #1 0x555e3a6b42f9 in main use_after_free.cpp:6

previously allocated by thread T0 here:
    #0 ... operator new(...)
    #1 0x555e3a6b429e in main use_after_free.cpp:4
```

Precise, exact, and complete: line 8 is where the freed memory was
read; line 6 is exactly where it was freed; line 4 is exactly where it
was originally allocated. The plain build gave no hint anything was
wrong at all; this build names the bug outright, with the full history
of the memory involved.

### Discard the throwaway example

`use_after_free.cpp` is deleted — it only existed to prove that
use-after-free is real, silent, and unpredictable without tooling, and
precisely diagnosable with it, isolated from any real project structure.

### Mechanical walkthrough

- `delete number;` followed by `*number` — **(a) first appearance,
  conceptually**: the language performs no check here at compile time
  or run time by default — `number` is still a valid-looking pointer
  variable holding a real address; nothing marks that address as "no
  longer safe."
- `g++ -fsanitize=address -g` — **(a) first appearance.**
  `-fsanitize=address` instruments the compiled program to track every
  allocation and deallocation and check every memory access against
  that history; `-g` includes debug symbols, which is what let the
  sanitizer's output name exact file names and line numbers rather than
  raw addresses alone.

### CS lens

This is a **use-after-free**, one of a small family of **memory safety**
bugs (also including buffer overflows and double-frees) unique to
languages without automatic, tracked memory management. Also recognized
in: a huge share of real-world security vulnerabilities in C and C++
software historically (memory safety bugs are, by a wide margin, the
single largest category of serious security flaws found in major C/C++
codebases over the language's history) — not a curriculum
exaggeration, a genuinely well-documented, ongoing industry problem,
part of why Rust (outside this curriculum's own language track) was
designed specifically to prevent this exact category of bug at compile
time.

### SE lens

The compiler's own `-Wall` warnings, used in the previous unit, caught
nothing here — this specific mistake is invisible to ordinary
compilation. AddressSanitizer costs real overhead (an instrumented
build runs slower, and uses more memory, than a normal one) and is
mainly a *development and testing* tool, not something shipped in a
release build — the real practice this implies: catching memory bugs
requires deliberately running code through tools built for exactly this
job, regularly, during development, precisely because the language
itself won't catch them silently at compile time the way Java's or C#'s
own type systems caught entire categories of mistakes in Phases 3 and
4.

### Commands needed

`g++ -fsanitize=address -g -o <output> <file>.cpp` — the AddressSanitizer
build used above.

### Run it

Both shown above — the silent, wrong-but-not-crashing plain build, and
AddressSanitizer's exact diagnosis.

### Connecting sentence

Manual memory management can leak, and it can silently corrupt — both
proven, both measured, both landing squarely on the programmer to avoid
by hand. The rest of this lesson is C++'s own real answer to both.

---

## Concept Unit: RAII

### The Problem

Manual `new`/`delete` pairing requires `delete` to run on *every*
possible path out of a function — the normal path, an early return, an
exception. Missing even one path is a real, easy mistake, proven
directly below, not hypothetically.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `manual_early_return_leak.cpp`
  (throwaway, this unit only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none new.

### The New Code

```cpp
class Connection {
public:
    Connection() { std::cout << "Opening connection" << std::endl; }
};

void runQuery(bool valid) {
    Connection* conn = new Connection();

    if (!valid) {
        std::cout << "Invalid query, returning early!" << std::endl;
        return;  // skips the delete below -- conn is leaked
    }

    std::cout << "Query succeeded" << std::endl;
    std::cout << "Closing connection" << std::endl;
    delete conn;
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```cpp
runQuery(true);
runQuery(false);
```

Real output:

```
--- valid query ---
Opening connection
Query succeeded
Closing connection
--- invalid query (early return) ---
Opening connection
Invalid query, returning early!
```

Look precisely at what's missing: on the invalid-query path, "Closing
connection" never prints — the `return` inside the `if` block exits
`runQuery` before ever reaching `delete conn;`. This is a real,
guaranteed leak on that specific path, every single time it's taken —
not a rare timing accident, a straightforward consequence of `delete`
sitting on only one of two possible exits from this function.

### Discard the throwaway example

`manual_early_return_leak.cpp` is deleted — it proved the real,
guaranteed cost of manual cleanup needing to be duplicated on every exit
path, isolated from a real database-engine-shaped class.

### Project Change (the fix)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `raii_fix.cpp`.
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none new.

### The New Code

```cpp
class Connection {
public:
    Connection() { std::cout << "Opening connection" << std::endl; }
    ~Connection() { std::cout << "Closing connection" << std::endl; }
};

void runQuery(bool valid) {
    Connection conn;   // no 'new' at all

    if (!valid) {
        std::cout << "Invalid query, returning early!" << std::endl;
        return;
    }

    std::cout << "Query succeeded" << std::endl;
}
```

### The Updated Project

Brand-new file, shown whole above — two changes from the leaking
version, both essential: `Connection` gains a **destructor**,
`~Connection()`, and `runQuery` no longer uses `new` at all —
`Connection conn;` creates a plain, **stack-allocated** object, not a
heap-allocated one reached through a pointer.

### Mechanical walkthrough

- `~Connection() { std::cout << "Closing connection" << std::endl; }`
  — **(a) first appearance** of a **destructor**: a method, named with
  a leading `~`, that C++ calls *automatically*, guaranteed, the
  instant an object's lifetime ends — no explicit call anywhere in
  `runQuery`.
- `Connection conn;` — **(a) first appearance, conceptually**: no `new`,
  no pointer — `conn` is a real, complete `Connection` object living
  directly in this function's own stack frame, the same kind of
  automatic, scope-bound storage every local variable in every earlier
  phase of this curriculum already used, just now holding a
  user-defined class instead of a plain number or string.
- The `return` inside `if (!valid)` — **(b) hard concept reappearing**,
  ordinary early return — but this time, C++ guarantees that *every*
  object with automatic storage duration currently in scope — here,
  `conn` — has its destructor called as part of leaving that scope, on
  *any* exit path, including this one.

### CS lens

This is **RAII** — **Resource Acquisition Is Initialization** — C++'s
own defining idiom: tie a resource's cleanup to an object's own
lifetime, so the language's existing, guaranteed scope rules do the
cleanup automatically, instead of a garbage collector doing it on its
own schedule, or a programmer doing it by hand on every possible exit
path. Also recognized in: Python's `with` statement (Project 1, Lesson
2) and C#'s `using` block (flagged as an exercise in Project 7, Lesson
17) — both directly inspired by this exact idea, deliberately built
into languages that otherwise have garbage collection, specifically
because *deterministic* cleanup (exactly when a scope ends, not
"eventually, whenever the collector gets to it") is valuable even when
memory itself isn't the resource being managed — a file handle, a
network connection, a lock.

### SE lens

Proven directly, side by side: the manual version leaked on exactly
one of two exit paths, silently, with a compiler that raised no warning
at all. The RAII version's destructor fires on *both* paths — proven
by "Closing connection" appearing in both real runs — without a single
`delete` written anywhere in `runQuery`, and without depending on every
future person editing this function to remember to add cleanup before
whatever new early-return they introduce. The real cost: RAII requires
designing a class specifically to own its resource this way up front —
it's a discipline applied at the point a class is written, not
something that retroactively fixes a raw pointer used carelessly
elsewhere. C++'s real, modern practice — smart pointers, covered in a
future lesson — builds on exactly this idiom for heap-allocated memory
itself, not just resources like this lesson's `Connection`.

### Commands needed

Same `g++`/execute pattern as this lesson's first two units.

### Run it

```
--- valid query ---
Opening connection
Query succeeded
Closing connection
--- invalid query (early return) ---
Opening connection
Invalid query, returning early!
Closing connection
```

"Closing connection" now appears on **both** paths — the exact gap this
unit's Problem section named, closed without a single explicit cleanup
call anywhere in `runQuery` itself.

### Connecting sentence

A resource's cleanup is now guaranteed by the language's own scope
rules, not by a programmer remembering to write it correctly on every
possible path out of a function — the foundation this entire project
will build its real database engine on top of.

---

## Closing

**Connect the pieces.** One connection, through the whole lesson: a
`Connection` object exists for as long as `runQuery`'s own scope does —
created the instant `Connection conn;` runs, destroyed the instant that
scope ends, whatever the reason. The manual version needed a
programmer to notice every possible exit and place a matching `delete`
at each one — proven to fail the moment a second exit path was added
without matching discipline. The RAII version needed the resource
management written *once*, inside the class itself, and the compiler
guarantees it from then on, the same way `delete[]`'s absence caused a
measured 400MB leak and its presence kept memory flat — the actual
underlying rule, "everything that's acquired must be released," never
changed; what changed is *where* that responsibility lives.

**What breaks without this.** Already shown three times, precisely
where each one landed: the measured leak, the silent-then-diagnosed
use-after-free, and the guaranteed leak on an unhandled exit path —
deliberately not restaged here, since each was already a real,
run-and-measured failure inside the unit that needed it.

**Exercises.**
1. Modify `manual_early_return_leak.cpp` to add a *second* early-return
   path, and confirm — with real output — that it also leaks unless a
   matching `delete` is added at that exact spot too.
2. Add a `query()` method to the RAII `Connection` class that can
   itself contain an early return, and confirm the destructor still
   fires correctly when `runQuery` exits early from *inside* a method
   call, not just a top-level `if`.
3. Run `use_after_free.cpp` under AddressSanitizer multiple times, and
   also run the plain, non-sanitized build multiple times. Record
   whether the plain build's printed "garbage" value changes between
   runs, and write one sentence on why that variability is itself part
   of what makes use-after-free bugs dangerous in real, unmonitored
   production code.

**Definition of done.**
- [ ] You've measured a real memory leak — actual process memory, not a
      simulated number — growing from an un-freed allocation loop, and
      confirmed the properly-freed version stays flat.
- [ ] You've triggered a real use-after-free, observed its silent,
      "successful-looking" wrong output in a plain build, and seen
      AddressSanitizer diagnose it precisely, with exact line numbers
      for the allocation, the free, and the bad access.
- [ ] You've reproduced the guaranteed leak from an unhandled early
      return in the manual version, and confirmed the RAII version's
      destructor fires correctly on every exit path instead.
- [ ] You can state, in one sentence, what RAII actually ties cleanup
      to, and why that's a stronger guarantee than "remember to call
      delete everywhere this function can exit."
- [ ] Commit with a message explaining why — e.g. `"Replace manual new/
      delete pairing, proven to leak on an unhandled early return, with
      an RAII Connection class whose destructor is guaranteed by the
      language on every exit path"` — not `"add RAII"`.

**Next lesson** stays in Project 9: smart pointers — `unique_ptr` and
`shared_ptr` — RAII applied directly to heap memory itself, removing
`new`/`delete` from ordinary code almost entirely, and the real
question of what happens when two smart pointers both think they own
the same resource.
