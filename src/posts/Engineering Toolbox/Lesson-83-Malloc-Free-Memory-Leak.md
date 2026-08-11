# Lesson 83: Nothing Frees Itself — `malloc`, `free`, and a Real Leak

**What you will build:** small C programs using `malloc` to allocate
memory at runtime, `free` to release it, a NULL-check against a real
allocation failure, and — the deliberate centerpiece — a genuine memory
leak, measured growing in real time against your own machine's actual
memory usage, then fixed with one line. The working feature is a
program that manages its own memory correctly. The transferable
insight: Python's garbage collector has been quietly doing this work
in every previous lesson; C hands that job directly to the programmer,
and this lesson proves, with real numbers, exactly what happens when
that job is done wrong.

**What you need to know first:** Lesson 82 (pointers, `&`, `*`) — this
lesson's entire mechanism is pointers to memory the programmer
explicitly requested, rather than memory a variable declaration
already reserved automatically.

---

## Concept Unit: The Problem — Python Never Makes You Do This

### The Problem

Building a large data structure in Python, then discarding it, causes
memory to grow and shrink automatically — nothing about ordinary
Python code ever explicitly requests or releases memory. This is worth
proving with real, measured numbers, not just asserting.

### The New Code

```python
import os

def print_memory(label):
    with open("/proc/self/status") as f:
        for line in f:
            if line.startswith("VmRSS"):
                print(f"{label}: {line.strip()}")

print_memory("before")
data = []
for i in range(2_000_000):
    data.append(i)
print_memory("after building a 2 million item list")
del data
print_memory("after del data")
```

### Run It

```
before: VmRSS:	    9416 kB
after building a 2 million item list: VmRSS:	   87908 kB
after del data: VmRSS:	   11624 kB
```

`/proc/self/status`'s `VmRSS` line (Linux's real, live report of how
much physical memory this exact process is using right now) shows
genuine growth — roughly 78 MB — while the list existed, and a genuine
drop back down after `del data`. Nothing in this script explicitly
asked for or released that memory; Python's own memory manager and
garbage collector did both, invisibly. Discarded now — the rest of
this lesson does this same job by hand, in C, and the "what breaks"
section shows exactly what Python was quietly protecting against the
whole time.

### CS Lens

Automatic memory management — where a language runtime tracks what's
still reachable and reclaims what isn't, without the programmer ever
issuing an explicit "free this" instruction — is called **garbage
collection**. C has none. This isn't a missing feature so much as a
different set of tradeoffs, explored concretely across this lesson and
the two that follow it: manual control over exactly when and how
memory is released, at the direct cost of that control being the
programmer's full responsibility, with no safety net.

---

## Concept Unit: The Stack's Limit — Fixed Size, Known at Compile Time

### The Problem

Every variable declared so far (`int x = 42;`, an array like
`int numbers[5];`) has a size the compiler knows *before the program
even runs*. That works fine when a size is known in advance — but real
programs often don't know how much space they'll need until they're
already running, based on user input, a file's actual size, or a
network response.

### The New Code

```c
#include <stdio.h>

int main() {
    int numbers[5];   // fixed size, known at compile time, lives on the stack
    for (int i = 0; i < 5; i++) {
        numbers[i] = i * 10;
    }
    for (int i = 0; i < 5; i++) {
        printf("%d ", numbers[i]);
    }
    printf("\n");
    return 0;
}
```

### Run It

```
0 10 20 30 40
```

Works correctly — but only because `5` was hardcoded, known before
compilation. If the real number of items needed weren't known until
runtime (read from a file, typed by a user, computed from a network
response), this fixed-size array couldn't adapt — `int numbers[5]`
means exactly 5 slots, permanently, decided the moment the program was
compiled, not when it runs. Discarded now; the next unit builds the
actual mechanism for requesting a runtime-determined amount of memory.

### CS Lens

Memory whose size and lifetime are tied directly to which function is
currently executing — automatically created when a function is called,
automatically destroyed when it returns — is called **stack memory**,
named for the same LIFO discipline as Lesson 68's own stack data
structure (a genuine, non-coincidental naming connection, explored
fully in Lesson 86). `numbers` above lives on the stack: fast, simple,
automatically managed — and rigidly fixed in size.

---

## Concept Unit: `malloc` — Requesting Memory at Runtime

### The Problem

What's needed is a way to ask the operating system for a specific
amount of memory *while the program is running*, sized however the
program currently needs, independent of anything decided at compile
time.

### Project Change

- **Reference Source:** No reference counterpart — first heap-memory
  concept in this curriculum.
- **Files affected:** `malloc_demo.c` (new file).
- **Change type:** add.
- **Location:** n/a — brand-new file.
- **Dependencies:** `stdlib.h` (where `malloc` and `free` are
  declared).

### The New Code

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int count = 5;   // pretend this came from user input at runtime

    int *numbers = malloc(count * sizeof(int));
    if (numbers == NULL) {
        printf("allocation failed!\n");
        return 1;
    }

    for (int i = 0; i < count; i++) {
        numbers[i] = i * 10;
    }
    for (int i = 0; i < count; i++) {
        printf("%d ", numbers[i]);
    }
    printf("\n");

    free(numbers);
    return 0;
}
```

### Run It

```
0 10 20 30 40
```

Identical output to the fixed-array version — but `count` here could
have come from anywhere at runtime (a variable computed from user
input, a file, anything), not a compile-time constant.

### Mechanical Walkthrough

- `malloc(count * sizeof(int))` — **first appearance of `malloc`.**
  Requests a block of memory from the **heap** (a completely different
  region than the stack, covered fully in Lesson 86) of exactly the
  requested size, in bytes, and returns a pointer to the start of it.
  `sizeof(int)` — **first appearance of the `sizeof` operator** —
  returns how many bytes a single `int` actually occupies on this
  system (commonly 4, but never assumed rather than asked for
  directly); multiplying by `count` computes the exact byte size needed
  to hold `count` integers back to back.
- `int *numbers = malloc(...)` — `malloc` returns a generic pointer
  (`void *` — a pointer with no specific type attached); assigning it
  directly to `int *numbers` is valid C and implicitly treats those
  bytes as a sequence of `int`s from this point forward — the same
  bracket-indexing syntax already familiar from ordinary fixed arrays
  (`numbers[i]`) works identically here, because C doesn't actually
  distinguish "array" and "pointer to the start of allocated memory"
  as differently as their declarations might suggest — a connection
  made fully explicit in Lesson 84.
- `if (numbers == NULL) { ... return 1; }` — **first appearance of
  checking an allocation for failure.** `malloc` can genuinely fail —
  proven directly in this lesson's next section — and signals failure
  by returning `NULL` rather than a valid pointer; checking for this
  *before* using the pointer at all is the only way to catch that
  failure safely, rather than finding out by crashing.
- `free(numbers);` — **first appearance of `free`.** Releases the
  allocated block back to the system, marking it available for reuse.
  This is the *entire* mechanism this lesson is about: `malloc` without
  a matching `free`, eventually, for every allocation, is precisely
  what a leak is — demonstrated concretely, with real numbers, in the
  next two units.

### CS Lens

Requesting a block of memory whose size is determined at runtime,
rather than fixed at compile time, is called **dynamic memory
allocation**, and the region it draws from is called the **heap** —
worth naming the contrast directly: stack memory (previous unit) is
automatic and scoped to a function call; heap memory is manual and
scoped to nothing at all except an explicit `free` call, which is
exactly the source of both its power and its danger.

---

## Concept Unit: A Real, Deliberate Leak

### The Problem

If a program calls `malloc` repeatedly but never calls `free` for
memory it's done with, that memory is never returned — the process's
memory usage grows, without bound, for as long as the program keeps
running. This is worth proving with real, measured numbers on a real
running process, not just described.

### The New Code

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void print_memory(const char *label) {
    FILE *status = fopen("/proc/self/status", "r");
    char line[256];
    while (fgets(line, sizeof(line), status)) {
        if (strncmp(line, "VmRSS", 5) == 0) {
            line[strcspn(line, "\n")] = 0;
            printf("%-40s %s\n", label, line);
        }
    }
    fclose(status);
}

int main() {
    print_memory("before any allocation:");

    for (int round = 1; round <= 5; round++) {
        for (int i = 0; i < 200000; i++) {
            int *leaked = malloc(sizeof(int) * 10);   // allocated...
            leaked[0] = i;                              // used...
            // ...and NEVER freed.
        }
        char label[64];
        snprintf(label, sizeof(label), "after round %d (1,000,000 total allocations):", round);
        print_memory(label);
    }

    return 0;
}
```

### Run It

```
before any allocation:                   VmRSS:	    1408 kB
after round 1 (1,000,000 total allocations): VmRSS:	   10980 kB
after round 2 (1,000,000 total allocations): VmRSS:	   20356 kB
after round 3 (1,000,000 total allocations): VmRSS:	   29728 kB
after round 4 (1,000,000 total allocations): VmRSS:	   39104 kB
after round 5 (1,000,000 total allocations): VmRSS:	   48480 kB
```

Real, monotonically climbing memory usage — roughly **9.3 MB per
round**, adding up steadily, with no plateau, for as long as this loop
kept running. This is the same `/proc/self/status` mechanism the very
first Python lab in this lesson used — the exact same measurement
technique, applied to a program that's actually leaking, showing the
exact failure Python's garbage collector was silently preventing all
along.

### Mechanical Walkthrough

- `void print_memory(const char *label)` — **first appearance of
  reading `/proc/self/status` from inside a C program.** On Linux,
  every running process has a virtual file at this path describing its
  own current state; `fopen`, `fgets` in a loop, and `strncmp`
  (checking whether each line starts with `"VmRSS"`) are all
  already-familiar file-reading patterns from earlier lessons, applied
  here to a live, OS-provided data source instead of a file the
  program itself created.
- `int *leaked = malloc(sizeof(int) * 10);` — a real, valid allocation
  — 40 bytes, enough for ten integers — happens exactly
  200,000 × 5 = 1,000,000 times across this program's run.
- `leaked[0] = i;` — the memory is genuinely used, not just requested
  and immediately abandoned — this is not a contrived, unused
  allocation; it's exactly the shape of a real allocation a real
  program would make.
- The comment `// ...and NEVER freed.` — **the entire bug, in one
  missing line.** `leaked` is a local variable inside the inner loop;
  the moment this iteration ends, `leaked` itself (the pointer
  *variable*) goes out of scope and is gone — but the *memory it
  pointed to* is not affected by that at all. That memory is now
  **unreachable** (no variable anywhere in the program still holds its
  address) **and unreleased** (`free` was never called on it) — the
  precise definition of a memory leak: memory that's lost track of
  without ever being given back.

### CS Lens

Losing every reference to a resource before releasing it — leaving it
allocated but permanently unreachable — is called a **memory leak**,
and the same underlying failure shows up for any manually managed
resource, not just memory. Also recognized in: a file opened but never
closed (eventually exhausting a process's limit on open file handles),
a database connection checked out from a pool but never returned, an
event listener registered but never removed, quietly keeping an entire
object graph alive in a garbage-collected language, sidestepping even
automatic memory management.

---

## Concept Unit: The Fix — One `free` Call

### The Problem

The fix, given everything proven above, is now precisely predictable:
every `malloc` needs a matching `free`, once the allocated memory is
genuinely no longer needed.

### Project Change

- **Reference Source:** `leak.c` from the previous unit — this is a
  direct, one-line fix to that exact program.
- **Files affected:** `no_leak.c` (new file, based on `leak.c`'s
  structure).
- **Change type:** modify.
- **Location:** inside the inner loop, immediately after the
  allocation is used.
- **Dependencies:** `free`, already established.

### The New Code

```c
    for (int round = 1; round <= 5; round++) {
        for (int i = 0; i < 200000; i++) {
            int *numbers = malloc(sizeof(int) * 10);
            numbers[0] = i;
            free(numbers);   // <-- the one line that fixes everything
        }
        // ... same print_memory call as before ...
    }
```

### Run It

```
before any allocation:                   VmRSS:	    1412 kB
after round 1 (1,000,000 total allocations): VmRSS:	    1608 kB
after round 2 (1,000,000 total allocations): VmRSS:	    1608 kB
after round 3 (1,000,000 total allocations): VmRSS:	    1608 kB
after round 4 (1,000,000 total allocations): VmRSS:	    1608 kB
after round 5 (1,000,000 total allocations): VmRSS:	    1608 kB
```

The exact same workload — 1,000,000 total allocations, same size, same
loop structure — and memory usage is **completely flat** after the
first round: `1608 kB`, unchanged through four more rounds of 200,000
allocations each. Compare directly against the leaking version's
climb to `48480 kB` under identical load: this one line —
`free(numbers);` — is the entire difference between a program whose
memory usage is stable indefinitely and one that will eventually
exhaust all available memory and crash, given enough time.

### Mechanical Walkthrough

- `free(numbers);`, placed immediately after `numbers[0] = i;` — as
  soon as this specific allocation is done being used, within this
  same loop iteration, it's released — the allocator can immediately
  reuse that exact memory for the *next* iteration's `malloc` call,
  which is precisely why memory usage plateaus instead of growing:
  the same handful of physical memory blocks are being requested and
  released, over and over, rather than a million distinct blocks
  accumulating.

### CS Lens

Pairing every acquisition of a manually managed resource with a
corresponding release, as close to the point where it's no longer
needed as possible, is a discipline sometimes summarized as **RAII**
(Resource Acquisition Is Initialization) in languages that can enforce
it automatically (C++, Rust — Lesson 89/90 return to this directly).
C has no automatic enforcement at all — `malloc`/`free` pairing is
purely a discipline the programmer must maintain by hand, which is
exactly why leaks are such a common, real category of C bugs, and
exactly the gap tools like Valgrind (mentioned in this lesson's
exercises) exist to catch automatically.

---

## What Breaks Without This — a Real Allocation Failure

### The Problem

Beyond leaks, `malloc` can fail outright — the system genuinely cannot
provide the requested memory — and the `if (numbers == NULL)` check
from two units ago exists specifically to catch this. Both the correct
and incorrect handling of this are worth proving directly.

### The New Code — Checked Correctly

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    size_t huge = (size_t)-1;   // the largest possible size_t value
    int *p = malloc(huge);

    if (p == NULL) {
        printf("malloc returned NULL -- allocation correctly failed and was caught\n");
        return 1;
    }
    printf("allocation unexpectedly succeeded\n");
    free(p);
    return 0;
}
```

### Run It

```
malloc returned NULL -- allocation correctly failed and was caught
exit code: 1
```

`(size_t)-1` is a real trick worth understanding: `size_t` is an
unsigned type, so `-1`, which has no valid representation as a
positive unsigned value, wraps around to the *largest possible* value
that type can hold — an allocation request for more memory than any
real system has. `malloc` correctly recognizes this can't be satisfied
and returns `NULL`, exactly as documented — caught cleanly here by the
`if` check, with a clear message and a non-zero exit code.

### The Same Failure, Unchecked

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    size_t huge = (size_t)-1;
    int *p = malloc(huge);
    // NO NULL check here
    p[0] = 42;   // dereferencing a NULL pointer
    printf("this line should never print\n");
    return 0;
}
```

```
Segmentation fault
exit code: 139
```

`malloc` still correctly returns `NULL` — the failure itself is
identical to the checked version. The difference is entirely in what
happens *next*: `p[0] = 42` attempts to write to memory at address
`0` (what `NULL` actually is, numerically) — memory the operating
system has specifically reserved as always-invalid, precisely so that
exactly this mistake gets caught immediately, as a hard crash
(**SIGSEGV**, a segmentation fault — exit code `139`, which is
`128 + 11`, `11` being `SIGSEGV`'s signal number on Linux), rather than
silently corrupting something. This crash is, in a real sense, a
*good* failure — loud, immediate, and directly traceable to the exact
line that caused it — compared to the much more dangerous alternative
covered in Lesson 87: a memory error that *doesn't* crash immediately,
and corrupts something else instead.

## Exercises

- Modify `leak.c` to also print the *number* of allocations made so
  far alongside each memory reading, and compute an estimated
  bytes-per-allocation figure from the real numbers — compare it
  against the requested `sizeof(int) * 10 = 40` bytes, and research why
  the real overhead is higher (allocator bookkeeping per block).
- Write a program that `malloc`s a growable buffer, `realloc`s it
  larger when it fills up (research `realloc`'s signature and
  behavior), and correctly `free`s it exactly once at the end — the
  first real step toward Lesson 68's dynamic array, built this time in
  C instead of relying on Python's list.
- If available on your system, run `leak` and `no_leak` under
  `valgrind --leak-check=full` and compare its reported "definitely
  lost" byte counts against this lesson's own `/proc/self/status`
  measurements.
- Deliberately call `free(numbers)` *twice* on the same pointer in a
  small test program, and observe what happens — do not attempt to
  explain or fix it yet; this exact failure is the dedicated subject
  of Lesson 88.

## Definition of Done

- [ ] `malloc_demo.c` compiled and run, correctly allocating,
      using, and freeing a runtime-sized block of memory.
- [ ] `leak.c` run for real on your own machine, confirming genuinely
      climbing `VmRSS` numbers across multiple rounds — your own
      numbers, not just the ones shown here.
- [ ] `no_leak.c` run immediately afterward, confirming flat memory
      usage under the identical workload — the contrast is the whole
      point, so both need to be seen side by side.
- [ ] Both allocation-failure programs run: the checked version
      printing a clean message and exiting `1`; the unchecked version
      crashing with a real segmentation fault, exit code `139`.
- [ ] Can explain out loud, without looking at the code, the precise
      difference between "the pointer variable goes out of scope" and
      "the memory it pointed to is leaked" — these are two separate
      facts, easy to conflate, that this lesson deliberately keeps
      distinct.
- [ ] Committed, with a message explaining *why* — e.g. `"malloc/free
      from scratch: a real, measured leak from a missing free(), fixed
      with one line, plus a checked vs. unchecked NULL allocation
      failure"` — not `"add malloc examples"`.
