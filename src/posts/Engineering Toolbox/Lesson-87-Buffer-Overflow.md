# Lesson 87: No One Is Checking — a Real Buffer Overflow

**What you will build:** real, reproducible out-of-bounds reads and
writes in C — silent garbage on read, real corruption of an adjacent
variable on write, a classic `strcpy` overflow caught live by gcc's
stack protector, and the same overflow fixed with a bounds-respecting
alternative. The transferable insight: Python raises `IndexError` the
instant an access goes out of bounds. C checks nothing, ever — this
lesson proves exactly what "nothing" means, safely, and shows the one
real defense a modern compiler provides by default.

**A boundary this lesson keeps deliberately:** this lesson demonstrates
memory *corruption* and *crashes* — real, safe, and reproducible — but
does not construct or explain techniques for turning a buffer overflow
into controlled code execution. That's a real, serious subject
(exploit development), and a fundamentally different, much deeper one
than "here's what happens when C doesn't check a boundary," which is
this lesson's actual, narrower scope.

**What you need to know first:** Lesson 84 (arrays, pointers, C
strings) and Lesson 86 (stack vs. heap) — this lesson's overflows
happen in exactly the memory those two lessons already made visible.

---

## Concept Unit: The Problem — Python Always Checks

### The Problem

Every array/list access in every Python lesson across this entire
curriculum has been silently protected: an out-of-bounds index raises
a clear, specific exception, every time, unconditionally. Worth
proving this is a real, active check, not an assumption.

### The New Code

```python
numbers = [10, 20, 30]
print(numbers[2])
try:
    print(numbers[5])
except IndexError as e:
    print(f"IndexError: {e}")
```

### Run It

```
30
IndexError: list index out of range
```

`numbers[5]` never returns *anything* — Python checks the index
against the list's actual length before touching memory, and refuses
outright. Discarded now — the rest of this lesson does the same access
in C, where no such check exists at all.

### CS Lens

**Bounds checking** — verifying an index falls within a valid range
before using it — is a real, deliberate runtime cost every access in
Python pays, unconditionally, in exchange for exactly the safety just
demonstrated. C's arrays are, by design, nothing more than a starting
address plus an element type (Lesson 84's own array/pointer
equivalence) — there is no length stored anywhere alongside them for
any check to consult, even if the language wanted to check.

---

## Concept Unit: An Unchecked Read

### The Problem

Given no bounds checking exists, it's worth seeing directly what an
out-of-bounds *read* actually does in C — not crash, not error, just
something.

### The New Code

```c
#include <stdio.h>

int main() {
    int numbers[3] = {10, 20, 30};

    printf("numbers[2] = %d\n", numbers[2]);
    printf("numbers[5] = %d   (out of bounds -- no error, no check, just... something)\n", numbers[5]);
    printf("numbers[100] = %d (way out of bounds -- still no error)\n", numbers[100]);

    return 0;
}
```

### Run It

```
$ ./oob_read
numbers[2] = 30
numbers[5] = -1043333840   (out of bounds -- no error, no check, just... something)
numbers[100] = 32767 (way out of bounds -- still no error)
$ ./oob_read
numbers[2] = 30
numbers[5] = 1809189584   (out of bounds -- no error, no check, just... something)
numbers[100] = 32764 (way out of bounds -- still no error)
```

Run twice, `numbers[2]` is reliably `30` — genuinely part of the
array. `numbers[5]` and `numbers[100]` are **different every run** —
not because they're "random" in any meaningful sense, but because
they're reading whatever bytes happen to occupy nearby memory at that
moment (other stack variables, leftover data from a previous function
call, whatever ASLR — Lesson 82 — happened to place there this time).
No exception. No warning. No indication whatsoever that anything went
wrong — the program completed successfully both times, exit code `0`.

### CS Lens

`numbers[5]` compiles and "succeeds" precisely because `numbers[5]` is,
mechanically, exactly `*(numbers + 5)` — Lesson 84's own array/pointer
equivalence, applied here to an *invalid* offset. The compiler has no
separate concept of "this is now out of bounds" to check against —
it's simply pointer arithmetic, followed without question, landing
wherever it lands.

---

## Concept Unit: An Unchecked Write — Real Corruption

### The Problem

A read past the end silently returns garbage. A *write* past the end
is more dangerous: it silently overwrites whatever memory happens to
be there — worth proving concretely that it can, and does, corrupt an
adjacent, completely unrelated variable.

### The New Code

```c
#include <stdio.h>

int main() {
    int numbers[3] = {10, 20, 30};
    int guard = 999;   // a variable placed right after 'numbers' by the compiler, maybe

    printf("before: numbers = [%d, %d, %d], guard = %d\n",
           numbers[0], numbers[1], numbers[2], guard);

    numbers[3] = 40;   // one past the end -- writing into memory we don't own
    numbers[4] = 50;   // two past the end

    printf("after:  numbers = [%d, %d, %d], guard = %d\n",
           numbers[0], numbers[1], numbers[2], guard);

    return 0;
}
```

### Run It

```
before: numbers = [10, 20, 30], guard = 999
after:  numbers = [10, 20, 30], guard = 40
```

`numbers[0]`–`[2]` are unchanged — the actual array is fine. But
`guard`, a completely separate variable that this code never
mentioned by name, changed from `999` to `40` — the exact value
written to `numbers[3]`. The compiler happened to place `guard`
immediately after `numbers` in this stack frame's layout (Lesson 86's
own territory), and `numbers[3] = 40` — one element past the array's
real bounds — landed exactly on top of it.

### Mechanical Walkthrough

- `numbers[3] = 40;` — mechanically identical to `numbers[2] = 30;`,
  just with an index the array was never declared to hold. C performs
  the exact same computation — `*(numbers + 3) = 40` — with no
  awareness that `3` was never a valid index for a 3-element array.
- The specific variable corrupted (`guard`), and by how much, is
  **entirely dependent on stack layout** — a compiler detail, not
  something the C source controls directly (already established in
  Lesson 84's own missing-terminator demonstration). A different
  compiler, optimization level, or even just declaring `guard` in a
  different order could corrupt something else entirely, or nothing
  visible at all — which is precisely what makes this class of bug so
  dangerous in real, larger programs: the *symptom* (a variable with a
  wrong value) can appear far away from, and much later than, the
  *cause* (an out-of-bounds write).

### CS Lens

Silently overwriting adjacent memory through an out-of-bounds write is
called **memory corruption**, and this specific case — corrupting the
current function's own stack frame — is called a **stack buffer
overflow**. This is not a rare or contrived failure mode; it's one of
the most historically significant classes of software bug, responsible
for a substantial fraction of real-world security vulnerabilities
across decades of C and C++ software — which is exactly why modern
compilers ship real, automatic defenses against it, demonstrated
directly next.

---

## Concept Unit: The Stack Protector Catches It

### The Problem

The previous unit's overflow was small and survived. A more aggressive
overflow — the classic case, an unbounded `strcpy` into a fixed buffer
— threatens to corrupt much more, including a function's own saved
return address. Modern compilers defend against exactly this, by
default, and it's worth seeing that defense actually fire.

### The New Code

```c
#include <stdio.h>
#include <string.h>

void greet(char *name) {
    char buffer[8];         // room for a short name only
    strcpy(buffer, name);   // no bounds checking AT ALL -- copies until it hits '\0', regardless of buffer size
    printf("Hello, %s!\n", buffer);
}

int main() {
    greet("Al");                              // fits fine
    greet("ThisNameIsWayTooLongForTheBuffer"); // does not fit -- overflow
    printf("if you see this, the overflow didn't corrupt anything critical\n");
    return 0;
}
```

### Run It

```
$ gcc strcpy_overflow.c -o strcpy_overflow -O0
$ ./strcpy_overflow
*** stack smashing detected ***: terminated
exit code: 134
```

No "Hello, Al!" even printed in this captured run — real, immediate
termination. **`gcc` compiles with a stack protector enabled by
default** (`-fstack-protector-strong`, standard on this system, no
special flag needed to get it): a hidden "canary" value is placed on
the stack between `buffer` and the function's own saved return
address. `strcpy`'s unbounded copy — reappearing directly from Lesson
84's own missing-terminator danger, just now overflowing a fixed-size
*destination* rather than lacking a terminator on the *source* — wrote
straight through `buffer`'s 8 bytes and clobbered that canary. Before
`greet` returns, the compiler-inserted check notices the canary no
longer matches its expected value and **deliberately aborts the
program immediately** — `SIGABRT`, exit code `134` (`128 + 6`) —
rather than allowing execution to continue with a corrupted stack.

### Confirming the Contrast, Safely

Compiling the identical source *without* that protection
(`-fno-stack-protector`, purely to observe the difference in failure
mode — not to work around a real program's real defenses):

```
$ gcc strcpy_overflow.c -o strcpy_overflow_noprotect -O0 -fno-stack-protector
$ ./strcpy_overflow_noprotect
Segmentation fault
exit code: 139
```

Different failure this time — a plain segmentation fault, Lesson 83's
own familiar crash, rather than the protector's deliberate, informative
abort message. Both are real crashes; both are "safe" in the sense
that this lesson stops at "the program terminates" and goes no
further — this lesson is not going to explore, and will not explain,
what happens to a *more carefully constructed* overflow input under
`-fno-stack-protector`, because that is precisely the boundary into
exploit construction this lesson deliberately does not cross.

### Mechanical Walkthrough

- `char buffer[8];` — a small, fixed-size stack array, exactly the
  kind of memory Lesson 86 already showed sits immediately alongside
  other stack-frame data (other locals, saved registers, the return
  address) with no gaps enforcing separation beyond ordinary layout.
- `strcpy(buffer, name);` — **the entire bug.** `strcpy` (already
  encountered in Lesson 84) copies bytes from `name` into `buffer`
  until it finds `name`'s own terminator — it has no idea `buffer` is
  only 8 bytes, and no way to find out; it simply keeps writing.
- `"ThisNameIsWayTooLongForTheBuffer"` — 33 characters plus a
  terminator, into an 8-byte destination — a massive, deliberate
  overflow, chosen specifically to reliably smash through the canary
  in one call rather than relying on a marginal one-or-two-byte
  overflow like the previous unit's `numbers[3]`/`numbers[4]` example.

### CS Lens

A compiler-inserted, runtime-checked sentinel value specifically
placed to detect stack corruption before a function returns is called
a **stack canary** (the name is a direct, deliberate reference to a
coal miner's canary — a live, sensitive early-warning system for a
danger that would otherwise go undetected until too late). This is a
real, standard, load-bearing mitigation in modern compiled software —
worth knowing it exists and roughly how it works, not because this
curriculum expects anyone to implement one, but because understanding
*why* `"stack smashing detected"` is a genuinely different, more
informative failure than a bare segmentation fault requires knowing
what's actually checking for it.

---

## Concept Unit: The Real Fix — Bounded Copies

### The Problem

The stack protector *detects* this specific class of overflow after
the fact and terminates safely — it does not prevent the underlying
bug. The actual fix is using a string-copying function that respects
the destination buffer's real size in the first place.

### Project Change

- **Reference Source:** `strcpy_overflow.c` — this is a direct,
  deliberate fix to that exact function.
- **Files affected:** `strcpy_fixed.c` (new file).
- **Change type:** modify.
- **Location:** the single `strcpy` call inside `greet`.
- **Dependencies:** `snprintf`, already familiar from earlier lessons'
  formatted output.

### The New Code

```c
#include <stdio.h>
#include <string.h>

void greet(char *name) {
    char buffer[8];
    snprintf(buffer, sizeof(buffer), "%s", name);   // NEVER writes past sizeof(buffer)
    printf("Hello, %s!\n", buffer);
}

int main() {
    greet("Al");
    greet("ThisNameIsWayTooLongForTheBuffer");   // safely truncated instead of overflowing
    printf("no crash -- the long name was truncated, not overflowed\n");
    return 0;
}
```

### Run It

```
Hello, Al!
Hello, ThisNam!
no crash -- the long name was truncated, not overflowed
```

No crash, no corruption, no "stack smashing detected." The long name
is safely **truncated** — `"ThisNam"`, 7 characters, plus the
terminator `snprintf` always guarantees, exactly filling the 8-byte
buffer without ever writing a single byte past it.

### Mechanical Walkthrough

- `snprintf(buffer, sizeof(buffer), "%s", name);` — **first appearance
  of `snprintf` used as a bounded string copy**, reappearing directly
  from Lesson 80's own logging work (where it was used to build a
  label string safely). The second argument, `sizeof(buffer)`, is the
  entire fix: `snprintf` writes at most that many bytes total —
  including the terminator — and simply stops early, truncating the
  source, if it would otherwise write more. Unlike `strcpy`, it is
  fundamentally incapable of writing past the buffer it was told about,
  regardless of how long `name` actually is.
- `sizeof(buffer)` specifically, not a hardcoded `8` — a small,
  genuinely important detail: if `buffer`'s declared size ever changes,
  this bound automatically stays correct, with nothing to remember to
  update separately — the same "derive the limit from the real thing,
  don't restate it" discipline already valued throughout this
  curriculum's Python lessons, applying identically here.

### CS Lens

Choosing a function whose contract explicitly includes a maximum
output size, and honoring the real size of the destination rather than
trusting the source's length, is the direct, permanent fix for this
entire class of bug — not a mitigation like the stack canary
(detecting the problem after it's already happened), but a genuine
prevention (never letting the overflow occur in the first place).
Real, production C code almost universally prefers exactly this family
of function (`snprintf`, `strncpy` with care, or higher-level safe
string libraries) over `strcpy`, `gets`, and their unbounded relatives
— specifically because of the failure mode this lesson just
demonstrated, live, twice.

## Exercises

- Modify the out-of-bounds read example to try `numbers[-1]` (a
  negative index) — confirm C allows this exactly as readily as a
  too-large positive index, and explain why, in terms of the pointer
  arithmetic already established.
- Deliberately reorder `numbers` and `guard`'s declarations in the
  corruption example, and observe whether the same
  `numbers[3] = 40;` still corrupts `guard`, or corrupts nothing
  visible at all — confirm this is a real, compiler-layout-dependent
  outcome, not something the source code controls.
- Research `AddressSanitizer` (`-fsanitize=address`), a much more
  thorough runtime bounds-checking tool than the default stack
  protector — recompile this lesson's `oob_read.c` with it enabled and
  observe whether it catches the out-of-bounds *read* (which the
  default stack protector does not, since it only guards against
  corrupting its own canary on the way out).
- Rewrite `greet` to take an explicit `size_t buffer_size` parameter
  and use it in the `snprintf` call instead of `sizeof(buffer)` —
  research why this version is *more* correct for a `buffer` that
  might be allocated dynamically (Lesson 83) rather than declared
  locally, where `sizeof` would give the wrong answer (the pointer's
  own size, not the allocation's).

## Definition of Done

- [ ] The out-of-bounds read demo run at least twice on your own
      machine, confirming genuinely different garbage values for the
      invalid indices across runs, with no error either time.
- [ ] The adjacent-variable corruption demo run for real, confirming
      `guard`'s value changed to match what was written to
      `numbers[3]`.
- [ ] `strcpy_overflow.c` compiled with default settings and run,
      confirming a real `*** stack smashing detected ***` message and
      exit code `134`.
- [ ] The same source recompiled with `-fno-stack-protector` and run,
      confirming a different failure mode (a plain segmentation fault)
      — the contrast between detected and undetected corruption, seen
      directly.
- [ ] `strcpy_fixed.c` run, confirming the long name is safely
      truncated rather than causing any crash.
- [ ] Can explain out loud, without looking at the code, the difference
      between what the stack protector does (detects corruption after
      it happens, on the way out of a function) and what `snprintf`
      does (prevents the corruption from ever occurring).
- [ ] Committed, with a message explaining *why* — e.g. `"Buffer
      overflow, shown safely: unchecked reads return garbage, unchecked
      writes corrupt adjacent memory, the stack protector catches the
      severe case, and snprintf prevents it outright"` — not `"add
      overflow examples"`.
