# Lesson A1: A Container That Grows Itself

_Reading input of unknown size into a fixed-size buffer overflows it._

- **What you will build** — A small C++ program that reads an unknown
  number of integers from standard input — one per line, until the
  input runs out — and stores every one of them, without knowing in
  advance how many are coming. The feature itself is unremarkable; the
  problem underneath it is not: a fixed-size buffer has to guess a size
  up front, and guessing wrong either wastes memory (guess too high) or
  silently corrupts memory (guess too low — C++ will not stop you from
  writing past the end of an array). This lesson builds a container
  that grows itself instead of guessing: the dynamic array, the same
  data structure that backs Python's own `list`, C++'s `std::vector`,
  Java's `ArrayList`, and JavaScript's `Array` under the hood.

- **What you need to know first** — Nothing. This is Lesson A1, the
  first lesson of Track A and the first lesson of this curriculum.

- **Terms used in this lesson**

  - **Undefined behavior** — behavior the C++ language standard places
    no requirement on whatsoever once code crosses a line it shouldn't
    (like writing past the end of an array); the compiler is free to
    make the program do literally anything in response — crash
    immediately, silently corrupt unrelated memory, appear to work
    today and fail next week under a different compiler or a different
    optimization level. It exists as a concept because C++ deliberately
    does not insert automatic bounds-checking into raw array access
    (unlike Python, where indexing past the end of a list raises a
    catchable `IndexError` every single time) — the language trades
    that safety net for speed, and the trade only pays off if the
    programmer polices the boundary themselves.
  - **Buffer overflow** — writing more data into a fixed block of
    memory than that block was sized to hold, so the extra data lands
    in whatever memory happens to sit right after it. It's a specific,
    concrete instance of undefined behavior, and it earns its own name
    because it's common enough, and dangerous enough, to deserve one —
    it's the same root cause behind a large share of real-world
    security vulnerabilities, not just a classroom curiosity.
  - **The call stack (stack memory)** — the region of memory where a
    function's local variables live for as long as that function is
    running; a fixed-size array declared inside a function is carved
    out of this region, at a size fixed the moment the program is
    compiled. It matters here because "fixed at compile time" is
    exactly the constraint this lesson is trying to escape — the stack
    cannot hand out a size it doesn't know about until the program is
    already running.
  - **The heap (dynamic memory)** — a separate region of memory a
    running program can request more of, in any amount, at any point
    while it's running, unlike the stack, whose sizes are locked in at
    compile time. It exists because some programs — this one included —
    don't know how much storage they'll need until after they've
    already started reading input, and the stack's compile-time sizing
    can't accommodate a decision made that late.
  - **Pointer** — a variable that holds the memory address of another
    value, rather than holding that value directly. It's the mechanism
    C++ uses to work with heap memory at all: a heap allocation has no
    name of its own the way a local variable does — only an address —
    so a pointer is the only handle a program has for referring back to
    it later.
  - **`new[]` expression / `delete[]` expression** — the operators C++
    provides for requesting a block of heap memory sized for a specific
    number of elements decided at runtime (`new T[n]`), and for
    releasing that block back once it's no longer needed (`delete[]
ptr`). They exist because heap memory, unlike a local variable, is
    never cleaned up automatically just because the function that
    requested it returns — something has to explicitly ask for it and
    explicitly hand it back, and these two operators are that
    ask/give-back pair.
  - **Capacity vs. size** — two different numbers a growable container
    has to track separately: *size* is how many elements are actually
    stored right now; *capacity* is how many elements the current block
    of memory could hold before it has to grow again. Conflating the
    two is exactly the bug this lesson's data structure has to avoid —
    capacity can be larger than size, but size can never exceed
    capacity.
  - **Dynamic array** — a container that starts with some fixed block
    of heap memory and, the moment an insert would exceed its current
    capacity, allocates a new, larger block, copies everything over,
    and frees the old block — automatically, so the code doing the
    inserting never has to know or guess the final count in advance.
    It's the concept this whole lesson builds toward: the reusable
    answer to "I don't know how much storage I'll need," which a
    fixed-size buffer, by definition, cannot give.
  - **Amortized doubling** — the specific growth rule this lesson's
    dynamic array uses: when full, the new capacity is always exactly
    double the old one, rather than growing by some fixed amount (like
    +10) every time. It exists because doubling is what keeps the
    *average* cost of an insert cheap over a long run of insertions,
    even though any single insert that triggers a grow is comparatively
    expensive — a mathematical property ("amortized") this lesson will
    show concretely, not just assert.

- **Objects and methods used** — None. This lesson introduces no
  external class, interface, or library method: `new[]` and `delete[]`
  are language operators, not methods, and are covered under Terms
  above. Basic input/output (`std::cin`, `std::cout`) is treated as
  assumed-known baseline for this curriculum, the same as loops and
  variables, and is not covered here. The one language construct that
  would normally live here — a class of the program's own — is
  deliberately deferred to Lesson A2, where the motivating problem
  (this exact growth logic would otherwise have to be copy-pasted once
  per value type) is what actually earns it; introducing a class here,
  before that problem exists, would teach it unmotivated.

---

## Concept Unit A1.1: Undefined Behavior at a Fixed Boundary

### The Problem

This lesson's program is going to read values from standard input, one
at a time, until the input runs out — with no idea in advance how many
values are coming. Could be three, could be three thousand. Coming from
Python, the instinctive move is to reach for the closest-looking C++
equivalent of a Python `list`: a plain array. But a plain C++ array
makes a fundamentally different promise than a Python list does. A
Python list's storage grows on its own, silently, every time
`.append()` runs. A plain C++ array's size is a fact baked into the
compiled program the moment it's built — it can't be a "figure it out
as we go" number. Before building the real container this lesson is
actually about, it's worth answering one question concretely, with real
code and a real run, instead of taking it on faith: what specifically
happens when that baked-in size guess turns out to be wrong?

### This Unit's Code

No project file is created or modified by this unit. Per the Concept
Isolation Rule, what follows is throwaway code, written only to make
"the guess was wrong" concrete and provable — it is never the file this
lesson's actual project is built from, and it's discarded the moment
its point is made.

```cpp
#include <iostream>

int main() {
    int buffer[5];
    int count = 0;
    int value;

    while (std::cin >> value) {
        buffer[count] = value;
        count++;
    }

    std::cout << "Stored " << count << " values." << std::endl;
    for (int i = 0; i < count; i++) {
        std::cout << "buffer[" << i << "] = " << buffer[i] << std::endl;
    }

    return 0;
}
```

Compiled and run against seven values, fed one per line, into a buffer
sized for five:

```
$ g++ -std=c++17 -Wall -Wextra -o overflow_demo overflow_demo.cpp
$ printf "1\n2\n3\n4\n5\n6\n7\n" | ./overflow_demo
Stored 7 values.
buffer[0] = 1
buffer[1] = 2
buffer[2] = 3
buffer[3] = 4
buffer[4] = 5
buffer[5] = 6
buffer[6] = 7
$ echo $?
134
```

- **`g++`** — the GNU C++ compiler front end (on this machine, actually
  a symlink to Apple's `clang++`); it exists because C++ source text
  isn't runnable on its own — it has to be translated into a real
  machine-code binary before the CPU can execute any of it. `-std=c++17`
  pins compilation to the C++17 language standard specifically, rather
  than whatever the compiler's default happens to be, so the exact rules
  being taught don't silently shift under a compiler update. `-Wall
  -Wextra` turns on the compiler's full set of warning checks — every
  warning it knows how to give, not just the handful it enables by
  default — which matters here specifically because the next paragraph
  depends on being able to say "the compiler had every chance to flag
  this, and didn't." `-o overflow_demo` names the resulting binary file;
  without it, the compiler still produces an executable, just under a
  generic default name instead of a chosen one.

Two things about this output matter, and neither is what a newcomer
usually expects. First: the compile step produced zero warnings, even
with every warning check turned on. That's not the compiler failing to
notice anything — `count` is a value only known once the program is
actually running, since it depends on how many lines of input actually
arrive, so there's nothing for the compiler to check at compile time.
Second, and more surprising: the program does not crash on `buffer[5]`
or `buffer[6]` — the two writes that go past the array's five valid
slots (indices 0 through 4). It reads them back correctly, printing `6`
and `7` exactly as stored. Nothing in the C++ language stopped either
write, and nothing corrupted the output on the way out. This is called
**undefined behavior**: once code crosses a line the language doesn't
police for you, the standard makes no promise whatsoever about what
happens next — not "it will crash," not "it will corrupt something
specific," nothing at all. This exact case, a write past the end of a
fixed-size block of memory, has its own, more specific name: a **buffer
overflow**.

The exit code is the second half of the proof, and it deserves the same
standard of evidence as everything else here: a claim about *why* a
program behaved a certain way isn't allowed to just sound plausible — it
has to be checked against something a real tool can show. `134` isn't a
number this program's own logic produced; nothing in the source above
mentions it. It's `128 + 6`, the shell's convention for "the process was
killed by signal number 6" — `SIGABRT`. Attaching a debugger to the
exact same run shows why, rather than asking that to be taken on faith:

```
$ lldb -s lldb_cmds.txt -b -- overflow_demo
(lldb) bt
* thread #1, stop reason = signal SIGABRT
  * frame #0: libsystem_kernel.dylib`__pthread_kill + 8
    frame #1: libsystem_pthread.dylib`pthread_kill + 296
    frame #2: libsystem_c.dylib`__abort + 152
    frame #3: libsystem_c.dylib`__stack_chk_fail + 96
    frame #4: overflow_demo`main + 312
```

- **`lldb`** — the LLVM project's command-line debugger, a real,
  separate tool from the compiler; it exists because once a program is
  compiled to machine code, a plain terminal has no way to pause it
  mid-execution and inspect what it was actually doing at the moment it
  died. `-s lldb_cmds.txt` tells it to run a saved script of debugger
  commands automatically instead of waiting for them to be typed by
  hand; `-b` (batch mode) means run those commands and exit rather than
  drop into an interactive prompt; `bt` is the debugger command itself —
  short for "backtrace" — and it prints the exact chain of function
  calls that was active on the call stack at the instant the program
  received its signal, from the innermost call outward.

`__stack_chk_fail` in that trace is real, inspectable proof, not a
guess: modern compilers quietly place an extra, unused check value on
the stack right next to a function's local variables, and check that
it's still intact just before that function returns — a mechanism
called a **stack protector**, or **stack canary**. `buffer[5]` and
`buffer[6]` landed close enough in memory to overwrite it. `main()`
printed everything correctly first — the corruption itself is silent —
and only got caught on the way out, once that check value no longer
matched what the compiler expected. Removing the check confirms the
connection directly, rather than leaving it as a coincidence: compiling
the identical source with the protector explicitly turned off, and
running it against the same seven values, exits `0` — no crash at all,
the exact same corrupted memory, just nothing left watching for it:

```
$ g++ -std=c++17 -fno-stack-protector -o overflow_nostack overflow_demo.cpp
$ printf "1\n2\n3\n4\n5\n6\n7\n" | ./overflow_nostack
Stored 7 values.
buffer[0] = 1
buffer[1] = 2
buffer[2] = 3
buffer[3] = 4
buffer[4] = 5
buffer[5] = 6
buffer[6] = 7
$ echo $?
0
```

That's the actual danger undefined behavior represents, made concrete:
not "the program crashes," but "whether it crashes depends on compiler
flags nobody in this room is thinking about" — and the specific
consequence, a crash here, silently wrong data somewhere else, nothing
at all a third time, is not something the language ever promised to
control.

This demonstration is discarded now. `overflow_demo.cpp` does not exist
anywhere in this lesson's actual project, and nothing from it is carried
forward — its only job was proving that a fixed-size guess is a real
liability, not a theoretical one.

### Mechanical Walkthrough

Two lines here carry the lesson's actual point; the surrounding loop and
`std::cin`/`std::cout` calls are ordinary input/output and control flow,
assumed known from outside this curriculum, and aren't re-itemized here.

- **`int buffer[5];`** — declares a fixed-size array: five `int`-sized
  slots, carved out of **the call stack** the instant `main()` starts
  running, at a size fixed the moment this file was compiled. There is
  no step, anywhere, where this `5` could later become a `6` — it is not
  a variable, it's a fact baked into the compiled program.
- **`buffer[count] = value;`** (and, later, `buffer[i]`) — indexes into
  that fixed block by raw position, with no check anywhere in the
  language that `count` (or `i`) is actually less than `5`. This is the
  exact operation the rest of this unit just proved has no safety net:
  index `5` and index `6` are accepted, compiled, and executed exactly
  the same as index `0` through `4` — the language draws no distinction
  between a valid and an invalid index at this point; only the
  programmer knows which is which.

### CS Lens

Undefined behavior isn't unique to C++ arrays — it's a specific instance
of a much broader idea: a system that defines a contract but doesn't
enforce every part of it at every layer, leaving violations to be caught
late, inconsistently, or not at all.

```
Also recognized in: SQL injection (a database trusting a string is
"just data" until it isn't), race conditions in concurrent code
(correctness depending on timing nobody guaranteed), format-string
vulnerabilities in C's printf (user input passed as the format string
itself), and type coercion surprises in loosely-typed languages
(JavaScript evaluating [] + {} without ever refusing the operation)
```

### SE Lens

The alternative C++ could have chosen is the one Python, Java, and
JavaScript actually did: check every array access at runtime, and raise
a catchable error the instant an index falls outside the valid range.
C++ deliberately didn't, because that check costs real time on every
single access, and C++'s whole design premise is that the programmer,
not the runtime, carries that safety-versus-speed decision. The debt
this specific program is carrying as a direct result: the version above
has no defense against this at all, and the rest of this lesson doesn't
add a bounds check on top of it — it removes the fixed guess that made
one necessary in the first place.

### Connecting

The fixed-size array isn't the bug by itself — guessing a size before
knowing how much data is coming is. The next unit starts fixing that: a
way to ask for exactly the right amount of memory, decided while the
program is actually running.

---

## Concept Unit A1.2: Requesting Memory at Runtime

### The Problem

The fixed buffer's real flaw was never the specific number 5 — any fixed
number, chosen before the program runs, is a guess. What's actually
needed is a way to say "give me storage sized for however many values
are about to show up," with that size decided while the program is
running, not baked in before it starts. Is that even something C++
allows a plain array to do?

### Project Change

- **Reference Source** — No reference counterpart. This is a
  from-scratch addition: the first lesson of this curriculum, building
  its own first project file rather than porting an existing one.
- **Files affected** — `dynamic_array.cpp` (new file).
- **Change type** — add.
- **Location** — n/a; this is the file's first content.
- **Dependencies** — none beyond a C++17-capable compiler.

### The New Code

```cpp
int n;
std::cin >> n;

int* data = new int[n];
```

### The Updated Project

```cpp
#include <iostream>

int main() {
    int n;
    std::cin >> n;

    int* data = new int[n];       // ← new
    for (int i = 0; i < n; i++) {
        data[i] = i * i;
    }
    for (int i = 0; i < n; i++) {
        std::cout << data[i] << " ";
    }
    std::cout << std::endl;

    delete[] data;                // ← new
    return 0;
}
```

As a whole, this program now asks the person running it how many values
to expect, requests exactly that much storage while it's already
running, fills it, prints it back, and hands the memory back before
exiting — something the previous unit's fixed array could never do,
because `5` was never a question this program got to ask; it was an
answer baked in before the program existed.

Compiled and run twice, with two different runtime sizes, to prove the
same binary adapts rather than being rebuilt per size:

```
$ g++ -std=c++17 -Wall -Wextra -o dynamic_array dynamic_array.cpp
$ echo 6 | ./dynamic_array
0 1 4 9 16 25
$ echo 3 | ./dynamic_array
0 1 4
```

### Introducing the Concept in Isolation

This is exactly what `int* data = new int[n];` above is doing, isolated
from everything else in the program: asking for a block of memory whose
size is a runtime value, not a compile-time constant. To see that this
genuinely isn't possible with a plain array — not a style preference,
an actual rule of the language — here's the closest thing that looks
like it should work, and what the compiler actually says about it:

```cpp
#include <iostream>

int main() {
    int n;
    std::cin >> n;

    int buffer[n];  // is a runtime-decided size legal for a plain array?

    std::cout << "buffer created with size " << n << std::endl;
    return 0;
}
```

```
$ g++ -std=c++17 -Werror=vla-cxx-extension -Wall -Wextra -o vla_test vla_test.cpp
vla_test.cpp:7:16: error: variable length arrays in C++ are a Clang
extension [-Werror,-Wvla-cxx-extension]
    int buffer[n];
               ^
vla_test.cpp:7:16: note: read of non-const variable 'n' is not allowed
in a constant expression
```

- **`-Werror=vla-cxx-extension`** — a compiler flag that upgrades one
  specific warning category into a hard compile failure instead of a
  message that's easy to scroll past; it's used here because, left as a
  plain warning, some compilers (Apple's Clang included) will silently
  *allow* this as a non-standard convenience extension, which would hide
  the actual rule being demonstrated. Forcing it into an error surfaces
  the real ISO C++ rule underneath the extension.

The error message names the rule directly: `n` is "not allowed in a
constant expression." A plain array's size has to be knowable by the
compiler while it's compiling — a literal number, or something the
compiler can compute without ever running the program. A value read
from `std::cin` is neither; it doesn't exist yet at compile time. `new
int[n]`, by contrast, compiled and ran fine with that exact same runtime
`n` moments ago — proof that requesting memory is a fundamentally
different operation from declaring a fixed array, not just a longer way
of spelling the same thing. This capability — memory whose size is
decided while the program runs, requested from a pool separate from the
stack — is called **the heap**, and this program's `new`/`delete[]` pair
is how C++ borrows from it and gives it back.

This isolated example is discarded now; `vla_test.cpp` was written only
to prove the rule, and does not appear anywhere in this lesson's actual
project.

### Mechanical Walkthrough

- **`int* data`** — declares `data` as a **pointer**: a variable that
  holds a memory address rather than an `int` value directly. It has to
  be a pointer, specifically, because the memory it will refer to
  doesn't live inside this function's own stack frame the way a local
  `int` would — it lives out on the heap, and a pointer is the only kind
  of variable C++ has for holding "the address of something that lives
  somewhere else."
- **`new int[n]`** — the **`new[]` expression**: a request to the heap
  for a contiguous block of memory sized for exactly `n` `int`s, with
  `n` supplied as a real runtime value rather than a compile-time
  constant. It returns the address of the first `int` in that block —
  the value `data` stores.
- **`delete[] data;`** — the **`delete[]` expression**: gives that exact
  block back to the heap once the program is done with it. It exists
  because, unlike a local variable, memory obtained from the heap is
  never released automatically just because the function that requested
  it returns — nothing frees it until something explicitly asks to.

### CS Lens

Also recognized in: C's `malloc`/`free` pair (the same heap-borrowing
idea, one layer lower-level than C++'s `new`/`delete`), Python's and
Java's garbage-collected heaps (the same underlying resource, with an
automatic collector doing the giving-back instead of the programmer),
Rust's ownership-checked heap allocation (the same request/release pair,
with the compiler itself verifying every `new` has exactly one matching
release), and an operating system paging virtual memory in from disk on
demand (a different layer of the same "don't commit real resources until
something actually asks for them" idea).

### SE Lens

The alternative not chosen here is automatic memory management —
garbage collection, the approach Python, Java, and JavaScript all take —
which would remove the `delete[]` responsibility from this code entirely
by having a separate collector notice when memory is no longer reachable
and reclaim it on its own. C++ trades that convenience away deliberately
for predictability: a garbage collector's cleanup can run at a moment
the programmer doesn't control, which is unacceptable in code where
timing matters (real-time audio, embedded control loops), but the price
is that this program's correctness now depends on a human writing
`delete[]` at all. The real gap this exact code doesn't close: if
anything caused this function to exit between the `new` and the
`delete[]` — an exception, an early `return` added later — the memory
would leak with zero compiler warning. This straight-line version simply
never hits that case; it doesn't solve it.

### Connecting

`new`/`delete[]` solves "pick a size at runtime" — but this program still
has to know `n` in advance, supplied up front, before a single value is
read. The lesson's actual vehicle — reading values one at a time with no
upfront count at all — still isn't solved. That's the next unit.

---

## Concept Unit A1.3: The Dynamic Array — Growing Instead of Guessing

### The Problem

Heap allocation solves "pick a size at runtime," but not the problem
this lesson actually opened with: reading values one line at a time,
with no total count known in advance, at all — not even a runtime one
supplied up front. What's needed is a container that starts with *some*
capacity, and grows itself, on its own, the moment it's about to run
out — without whatever code is inserting values ever having to supply a
final count.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch, same as
  the previous unit.
- **Files affected** — `dynamic_array.cpp` (modified).
- **Change type** — replace.
- **Location** — replacing the entire body of `main()` from Concept Unit
  A1.2.
- **Dependencies** — the previous unit's `new[]`/`delete[]` pair.

### The New Code

```cpp
if (size == capacity) {
    int newCapacity = capacity * 2;
    int* newData = new int[newCapacity];
    for (int i = 0; i < size; i++) {
        newData[i] = data[i];
    }
    delete[] data;
    data = newData;
    capacity = newCapacity;
}
```

### The Updated Project

```cpp
#include <iostream>

int main() {
    int capacity = 4;
    int size = 0;
    int* data = new int[capacity];

    int value;
    while (std::cin >> value) {
        if (size == capacity) {                       // ← new
            int newCapacity = capacity * 2;            // ← new
            int* newData = new int[newCapacity];       // ← new
            for (int i = 0; i < size; i++) {            // ← new
                newData[i] = data[i];                  // ← new
            }                                          // ← new
            delete[] data;                             // ← new
            data = newData;                            // ← new
            capacity = newCapacity;                    // ← new
        }                                              // ← new
        data[size] = value;
        size++;
    }

    std::cout << "Stored " << size << " values (final capacity "
              << capacity << "):" << std::endl;
    for (int i = 0; i < size; i++) {
        std::cout << data[i] << " ";
    }
    std::cout << std::endl;

    delete[] data;
    return 0;
}
```

As a whole, `main()` now reads values with no upfront count of any
kind — not hardcoded, not typed in first — starting with room for four,
and silently doubling its own storage exactly when it's about to run
out, for as long as input keeps arriving. This is the lesson's actual
deliverable: the fixed buffer from Concept Unit A1.1 is gone entirely,
replaced by a container that never has to guess.

```
$ g++ -std=c++17 -Wall -Wextra -o dynamic_array dynamic_array.cpp
$ printf "1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n" | ./dynamic_array
Stored 10 values (final capacity 16):
1 2 3 4 5 6 7 8 9 10
$ printf "7\n8\n" | ./dynamic_array
Stored 2 values (final capacity 4):
7 8
```

### Introducing the Concept in Isolation

This is exactly what the block above does, isolated from the rest of the
program and slowed down enough to watch each step happen. Starting from
a deliberately tiny capacity of 2, and inserting five values one at a
time:

```cpp
int capacity = 2;
int size = 0;
int* data = new int[capacity];

int values[] = {10, 20, 30, 40, 50};
for (int i = 0; i < 5; i++) {
    if (size == capacity) {
        int newCapacity = capacity * 2;
        int* newData = new int[newCapacity];
        for (int j = 0; j < size; j++) {
            newData[j] = data[j];
        }
        delete[] data;
        data = newData;
        capacity = newCapacity;
        std::cout << "  grew: capacity " << (newCapacity / 2)
                  << " -> " << newCapacity << std::endl;
    }
    data[size] = values[i];
    size++;
    std::cout << "insert " << values[i] << " -> size=" << size
              << " capacity=" << capacity << std::endl;
}
```

```
$ ./grow_test
insert 10 -> size=1 capacity=2
insert 20 -> size=2 capacity=2
  grew: capacity 2 -> 4
insert 30 -> size=3 capacity=4
insert 40 -> size=4 capacity=4
  grew: capacity 4 -> 8
insert 50 -> size=5 capacity=8
```

Capacity never grows by a little; every time it grows, it exactly
doubles — 2 to 4, then 4 to 8 — and it only grows at the exact instant
`size` is about to exceed it, never early and never late. This container
is called a **dynamic array**, and this specific growth rule — always
doubling, never adding a fixed amount — is called **amortized
doubling**.

This isolated lab is discarded now; `grow_test.cpp` does not appear
anywhere in this lesson's actual project. The block it isolated is
already live in `dynamic_array.cpp`, shown above.

### Mechanical Walkthrough

- **`size == capacity`** — checks whether every slot currently allocated
  is already full. Equality, specifically, is enough here (rather than
  needing `>=`) because of an invariant this code maintains on every
  single pass through the loop: `size` is set from `capacity` only by
  ever growing capacity to stay ahead of it, so `size` can never get
  ahead of `capacity` between one check and the next.
- **`capacity * 2`** — computes the new capacity as exactly double the
  old one. This specific multiplier is the **amortized doubling** rule
  itself, not an arbitrary choice — the SE Lens below explains why
  doubling specifically, rather than some other growth rate, is what
  makes this cheap on average.
- **`new int[newCapacity]`** — the same **`new[]` expression** from the
  previous unit, requesting a fresh, larger block on **the heap**, sized
  for the new capacity.
- **`newData[i] = data[i]`** (inside its own `for` loop) — copies every
  element that was already stored, one at a time, from the old block
  into the new one. This copy is the actual cost of growing: nothing
  about heap memory lets a block be resized in place, so the only way to
  get a bigger contiguous block is to allocate a new one and move
  everything over by hand.
- **`delete[] data;`** — releases the *old* block, the one that was just
  copied out of, back to the heap. Skipping this line would not corrupt
  anything visible — the program would still run and print correctly —
  it would just quietly keep every old block alive forever, a leak that
  produces no error and no warning.
- **`data = newData;`** — repoints `data`, the **pointer** the rest of
  the program reads and writes through, at the new block. Every line
  outside this `if` still says `data[size]`; only what `data` itself
  points to has changed.
- **`capacity = newCapacity;`** — records the new capacity, so the next
  `size == capacity` check compares against the block's real, current
  size instead of the one it replaced.

**Execution trace**, tracking the real project's `dynamic_array.cpp`
(initial capacity 4) against the ten-value run shown above:

1. `value = 1` through `value = 4` — each pass finds `size == capacity`
   false (`0`, `1`, `2`, `3` against a capacity of `4`), so the grow
   block never runs; each value is stored directly, `size` climbing to
   `4`.
2. `value = 5` — now `size == capacity` is `4 == 4`, true, for the first
   time: the grow block runs, `newCapacity` becomes `8`, all four
   existing elements are copied over, the old block of `4` is freed, and
   `capacity` becomes `8` — all *before* `5` itself is stored at
   `data[4]`, bringing `size` to `5`.
3. `value = 6` through `value = 8` — `size == capacity` is false again
   (`5`, `6`, `7` against `8`), so these three insert directly with no
   grow, the same pattern as step 1 repeating at the new, larger scale.
4. `value = 9` — `size == capacity` is `8 == 8`, true again: the grow
   block runs a second time, doubling capacity to `16`, copying all
   eight existing elements, before `9` itself is stored at `data[8]`,
   bringing `size` to `9`.
5. `value = 10` — `size == capacity` is `9 == 16`, false, so it inserts
   directly. The loop ends with `size = 10`, `capacity = 16` — exactly
   what the real run above printed.

### CS Lens

```
Also recognized in: Python's own list, Java's ArrayList, C++'s standard
library std::vector, JavaScript's Array, Go's slice growth — every one
of them is a dynamic array under its own hood, doubling (or growing by
some similar multiplicative factor) instead of guessing a fixed size
up front.
```

The doubling rule specifically is what a computer science analysis calls
**amortized O(1) insertion**: any *individual* insert that happens to
trigger a grow costs real, proportional-to-size work (copying every
existing element), but because each grow doubles the space before the
next one can possibly be needed, the total copying work across any long
run of `n` inserts adds up to less than `2n` copies overall — cheap
enough, spread out ("amortized") over every insert, that each one counts
as constant time on average, even though no single insert actually is.

### SE Lens

The alternative not chosen here is growing by a fixed increment instead
of doubling — adding, say, exactly `10` more slots every time the buffer
fills, rather than doubling it. A fixed increment wastes less memory
immediately after a grow (at most `10` unused slots, instead of up to
`capacity` unused slots right after a doubling), but it loses badly on
total work: growing by a constant amount means a grow (and a full copy
of everything so far) happens roughly every `10` inserts forever, which
adds up to work proportional to `n²` across `n` total inserts, instead
of the roughly `2n` a doubling strategy costs. This code trades a
temporarily higher peak memory usage for asymptotically cheaper total
copying — the right trade for almost any real workload, which is exactly
why every dynamic array named in the CS Lens above makes the same
choice.

### Connecting

The fixed buffer from Concept Unit A1.1 is gone. In its place is a
container that starts small, doubles exactly when it has to, and never
once required the code reading input to know, guess, or ask for a final
count — which was the actual problem this whole lesson opened with.

---

## Closing

**Connect the pieces.** Follow the value `5` through the real project's
ten-value run shown in Concept Unit A1.3. It arrives via `std::cin >>
value` as the fifth line of input. At that moment `size` is `4` and
`capacity` is `4` — the check `size == capacity` is true for the first
time in this run, so before `5` is stored anywhere, the grow block from
Concept Unit A1.3 fires: a fresh block of `8` `int`s is requested from
**the heap** with `new int[8]` (Concept Unit A1.2's mechanism), the four
values already stored are copied into it, the old four-slot block is
released with `delete[]`, and `data`, `size`, and `capacity` are all
updated to point at the new, larger reality. Only after all of that does
`5` finally land at `data[4]`. None of this — not the heap request, not
the copy, not the freeing of the old block — is visible from outside
`main()`; whatever read this program's output only ever sees "value `5`
got stored," the same as every other value. The entire reason this
works at all, instead of corrupting memory the way Concept Unit A1.1's
fixed buffer did, is that every single write to `data[...]` in this
program is now guaranteed, by the `if` check running first, to land
inside a block sized to hold it.

**What breaks without this.** Delete the grow block from
`dynamic_array.cpp` — the entire `if (size == capacity) { ... }` — while
leaving everything else, including the starting `capacity = 4`, exactly
as it is:

```cpp
#include <iostream>

int main() {
    int capacity = 4;
    int size = 0;
    int* data = new int[capacity];

    int value;
    while (std::cin >> value) {
        // grow-on-full check removed on purpose
        data[size] = value;
        size++;
    }

    std::cout << "Stored " << size << " values (capacity " << capacity
              << "):" << std::endl;
    for (int i = 0; i < size; i++) {
        std::cout << data[i] << " ";
    }
    std::cout << std::endl;

    delete[] data;
    return 0;
}
```

Run against the same ten values used throughout this lesson, five times
in a row to confirm it isn't a fluke:

```
$ g++ -std=c++17 -Wall -Wextra -o broken_nogrow broken_nogrow.cpp
$ for i in 1 2 3 4 5; do
    printf "1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n" | ./broken_nogrow > /dev/null
    echo "run $i exit: $?"
  done
run 1 exit: 138
run 2 exit: 138
run 3 exit: 138
run 4 exit: 138
run 5 exit: 138
```

`138` is `128 + 10` — `SIGBUS`, a bus error — and it's a *different*
signal than Concept Unit A1.1's stack-based overflow produced (`134`,
`SIGABRT`), even though the root cause is the same category of mistake:
writing past the end of an allocated block. This block lives on the
heap, not the stack, so the corruption lands in the heap allocator's own
bookkeeping instead of a stack canary, and a different safety mechanism
is what eventually notices. It reproduces consistently across five
separate runs outside a debugger — but running this exact binary under
`lldb` was tried during this lesson's own verification and did *not*
crash at all, exiting `0` instead. That's undefined behavior again, in
a second real form: even the mere presence of a debugger changes the
program's memory layout enough to sometimes hide the bug entirely,
which is precisely why "it worked when I tested it" is not evidence of
correctness for code like this. Restoring the grow block fixes it —
this is the exact contents of Concept Unit A1.3's own "Updated Project"
block above.

**Exercises.**

1. Change the starting `capacity` in `dynamic_array.cpp` from `4` to
   `1`, and feed it six values. Predict the sequence of capacities it
   will pass through before running it to check.
2. Add a counter that increments once per element copied inside the
   grow block's inner `for` loop, print its final value after the whole
   ten-value run, and compare it against the SE Lens's claim that total
   copying stays under `2n` for `n` inserts.
3. Replace `capacity * 2` with `capacity + 10` — the fixed-increment
   alternative named in the SE Lens — and rerun the copy-counting
   exercise above against a much longer input (a few hundred values) to
   see the `n²` cost predicted there show up as a real, measured number.

**Definition of done.**

- [ ] `dynamic_array.cpp` compiles cleanly with `g++ -std=c++17 -Wall
      -Wextra`, zero warnings.
- [ ] Running it against an input longer than the starting capacity
      produces every value back, in order, with no crash.
- [ ] Running it against an input shorter than the starting capacity
      also produces every value back, with the capacity left unchanged.
- [ ] The "what breaks without this" version was actually built and run,
      confirming the crash, before the grow block was restored.
- [ ] `git commit` with a message explaining *why* this container grows
      by doubling instead of by a fixed amount — not merely that it
      grows.
