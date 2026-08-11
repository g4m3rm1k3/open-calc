# Lesson 86: Two Kinds of Memory — the Stack and the Heap, Made Concrete

**What you will build:** real C programs that print stack and heap
addresses side by side, prove the stack grows downward through
recursion, watch a compiler defensively neutralize a dangling stack
pointer, trigger a genuine stack overflow, and confirm heap memory
correctly outlives the function that created it. The transferable
insight: Lessons 82–85 already used both kinds of memory — an ordinary
`int x` on the stack, `malloc`'d memory on the heap — without ever
directly comparing them. This lesson makes the distinction, and its
real, sometimes surprising consequences, completely concrete.

**What you need to know first:** Lesson 83 (`malloc`/`free`) and
Lesson 85 (structs, self-referencing pointers) — this lesson assumes
both kinds of allocation are already familiar in isolation; the whole
point here is putting them side by side.

---

## Concept Unit: Two Address Ranges, Directly Compared

### The Problem

Every variable used across Lessons 82–85 lived *somewhere* — but
nothing so far has directly compared where a plain local variable
lives versus where `malloc`'d memory lives. Doing exactly that, in one
program, is the natural starting point.

### The New Code

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int stack_var = 1;
    int *heap_var = malloc(sizeof(int));
    *heap_var = 1;

    printf("stack_var address: %p\n", (void *)&stack_var);
    printf("heap_var  address: %p\n", (void *)heap_var);

    free(heap_var);
    return 0;
}
```

### Run It

```
stack_var address: 0x7ffce3c1e98c
heap_var  address: 0x55cbc374f2a0
```

Not just different addresses — a **massive** numeric gap:
`0x7ffc...` versus `0x55cb...`, differing in the high bits entirely.
This isn't coincidental or random — it's a direct, visible consequence
of the operating system deliberately placing these two kinds of memory
in entirely separate regions of the process's address space, covered
concretely across the rest of this lesson.

### CS Lens

A process's memory isn't one undifferentiated block — it's divided
into distinct regions, each with different rules: where the compiled
program's own instructions live (glimpsed already via Lesson 81's `nm`
output), where global/static data lives, where the stack lives, where
the heap lives. This lesson focuses on the two regions every program
in this curriculum has already been using without naming: the **stack**
and the **heap**.

---

## Concept Unit: The Stack Grows Downward

### The Problem

Stack memory (Lesson 83's own term for where ordinary local variables
live) isn't just "some region" — it has a specific, observable growth
direction, worth proving directly rather than taking on faith.

### The New Code

```c
#include <stdio.h>

void recurse(int depth) {
    int local_var;   // a fresh local variable, at THIS call's own stack frame
    printf("depth %d: &local_var = %p\n", depth, (void *)&local_var);
    if (depth < 5) {
        recurse(depth + 1);
    }
}

int main() {
    recurse(0);
    return 0;
}
```

### Run It

```
depth 0: &local_var = 0x7ffe78f24134
depth 1: &local_var = 0x7ffe78f24104
depth 2: &local_var = 0x7ffe78f240d4
depth 3: &local_var = 0x7ffe78f240a4
depth 4: &local_var = 0x7ffe78f24074
depth 5: &local_var = 0x7ffe78f24044
```

Every recursive call's own `local_var` sits at a **lower** address
than the call before it — a consistent, exact 48-byte (`0x30`) step
downward every time, on this compiler and system. This is real,
reproducible proof: the stack does not grow *upward* toward larger
addresses the way an array fills left to right; it grows *downward*,
toward smaller ones, with each new function call.

### Mechanical Walkthrough

- `void recurse(int depth)` — each call to `recurse` gets its own,
  entirely separate `local_var` — not the same variable reused, a
  genuinely new one, living at a new position, every single call —
  reappearing directly from Lesson 82's proof that function parameters
  and locals are fresh copies, now extended to *where* those fresh
  copies actually live.
- Each call's own local variables, saved register values, and return
  address together form that call's **stack frame** — a contiguous
  chunk of stack memory, created when the function is entered and
  destroyed when it returns. `recurse`'s own frame sits *above*
  (numerically higher than) the frame of whichever call it makes
  next — which is exactly why each successive `&local_var` is smaller.
- This growth direction is a real, specific architectural convention
  (x86-64 on Linux, used throughout this lesson) — not a universal law
  of computing, but consistent and reliable enough on any one system
  to depend on, which is exactly what makes it worth confirming
  directly rather than assuming.

### CS Lens

Function calls nesting inside each other, with each one's own local
data cleanly scoped to its own call and automatically reclaimed the
instant it returns, is precisely the same LIFO (last-in, first-out)
discipline as Lesson 68's own `Stack` data structure — not a loose
metaphor; "the call stack" is a real stack, in the exact algorithmic
sense already built from scratch in that lesson, just managed
automatically by the CPU and OS instead of by hand.

---

## Concept Unit: A Stack Frame, Destroyed — the Compiler Notices

### The Problem

Because a stack frame is destroyed the instant its function returns,
returning the *address* of a local variable hands the caller a pointer
to memory that's about to become invalid — worth proving directly what
actually happens, not assuming it.

### The New Code

```c
#include <stdio.h>

int *make_dangling_pointer() {
    int local_value = 42;
    printf("inside function: local_value = %d at %p\n", local_value, (void *)&local_value);
    fflush(stdout);
    return &local_value;
}

int main() {
    printf("about to call\n");
    fflush(stdout);
    int *dangling = make_dangling_pointer();
    printf("back in main, pointer value: %p\n", (void*)dangling);
    fflush(stdout);
    printf("back in main: *dangling = %d\n", *dangling);
    fflush(stdout);
    return 0;
}
```

### Run It

```
$ gcc frame_reuse.c -o frame_reuse -O0
frame_reuse.c: In function 'make_dangling_pointer':
frame_reuse.c:7:12: warning: function returns address of local variable [-Wreturn-local-addr]
    7 |     return &local_value;
      |            ^~~~~~~~~~~~
$ ./frame_reuse
about to call
inside function: local_value = 42 at 0x7ffe4df8ecbc
back in main, pointer value: (nil)
Segmentation fault
exit code: 139
```

Two real things worth stopping on. First: `gcc` **caught this at
compile time**, unprompted — a genuine, specific warning naming
exactly the mistake. Second, and more surprising: the returned pointer
isn't garbage — it's `(nil)`, literal `NULL`. Disassembling the
compiled function confirms exactly why:

```
    11af:	b8 00 00 00 00       	mov    $0x0,%eax
    11cd:	c9                   	leave
    11ce:	c3                   	ret
```

That `mov $0x0,%eax` is the compiler **replacing `return
&local_value;` with `return 0;`**, at the machine-code level — a real,
deliberate defensive measure by this specific compiler version: since
returning the address of a local variable has no well-defined meaning
at all, gcc neutralizes it to a predictable, safely-crashing `NULL`
rather than handing back a real but dangling address that might
"happen to work" for a while before failing unpredictably later.
Dereferencing that `NULL` then crashes cleanly and immediately —
`*dangling` never printed at all, matching Lesson 83's own
`NULL`-dereference segfault exactly.

### Mechanical Walkthrough

- `return &local_value;` — the address being returned is completely
  real and valid *at the moment this line runs* — the `printf` inside
  the function proves it, printing a genuine, usable address. The
  problem isn't that this address is wrong *now*; it's that the memory
  it refers to is about to be reclaimed the instant this function
  returns.
- `[-Wreturn-local-addr]` — a real, specific compiler warning, worth
  reading precisely: `gcc` performs enough static analysis to recognize
  "this address refers to a variable whose scope is ending right here"
  — a genuinely useful, automatic safety net for exactly this class of
  bug, without needing to run the program at all.
- One honest caveat worth stating plainly: the specific NULL-ing
  behavior shown here is this compiler's own defensive choice, not a
  guarantee the C standard makes. A different compiler, a different
  optimization level, or a different version could instead return the
  real (now-dangling) address, leaving it pointing at memory that
  might still *look* valid for a while — silently reused by something
  else entirely, exactly the danger the next unit's contrast makes
  concrete. This is still, fundamentally, **undefined behavior** — this
  lesson's specific, reproducible result is one real compiler's
  specific, real response to it, not a promise about all compilers.

### CS Lens

A compiler performing static analysis specifically to catch a category
of memory-safety bug before the program ever runs is a real, valuable
defense — worth naming as a genuine mitigation, not a complete fix:
`gcc`'s warning here caught a simple, direct case; it cannot catch
every dangling-pointer bug (one returned through several layers of
indirection, for instance, is much harder to detect statically) —
exactly why Lesson 88 exists as its own dedicated lesson on this
broader failure category.

---

## What Breaks Without This — a Real Stack Overflow

### The Problem

The stack isn't infinite — it's a fixed-size region, reserved once per
thread when a program starts. Recursion with no base case consumes
stack frames indefinitely, and eventually runs out of room entirely.

### The New Code

```c
#include <stdio.h>

long call_count = 0;

void recurse_forever() {
    call_count++;
    if (call_count % 100000 == 0) {
        printf("still going: %ld calls deep\n", call_count);
        fflush(stdout);
    }
    recurse_forever();   // no base case -- deliberately unbounded
}

int main() {
    recurse_forever();
    return 0;
}
```

### Run It

```
still going: 100000 calls deep
still going: 200000 calls deep
still going: 300000 calls deep
still going: 400000 calls deep
still going: 500000 calls deep
Segmentation fault
exit code: 139
```

A real, reproducible crash — several hundred thousand frames deep on
this system, each one consuming real stack space, until the stack's
fixed reserved region is entirely exhausted. This is called a **stack
overflow** — a real, specific, named failure, not a metaphor
(genuinely the origin of the programming Q&A site's name) — and it
manifests as the same `SIGSEGV` segmentation fault already familiar
from Lessons 83 and 84, because the CPU attempted to use stack memory
past the boundary the OS reserved for it.

### CS Lens

A fixed-size, per-thread reservation that recursion (or, less commonly,
very large local variables) can exhaust is a concrete, specific
resource limit — worth contrasting directly against Lesson 73's own
`MinHeap`, whose array-backed storage grows by reallocation as needed;
the call stack has no such automatic growth mechanism available to it
at the language level, which is exactly why unbounded or excessively
deep recursion is a real, practical danger in C in a way it usually
isn't in Python (whose own interpreter enforces a much lower,
deliberately-hit recursion limit specifically to convert this same
danger into a clean, catchable exception rather than a hard crash).

---

## Concept Unit: The Heap Has No Such Automatic Boundary

### The Problem

Given the previous two units' dangers, it's worth directly confirming
the contrast this lesson has been building toward: heap memory,
correctly managed, does *not* share the stack's "destroyed the instant
the function returns" behavior at all.

### The New Code

```c
#include <stdio.h>
#include <stdlib.h>

int *create_on_heap() {
    int *value = malloc(sizeof(int));
    *value = 42;
    return value;   // perfectly fine -- the MEMORY isn't tied to this function's stack frame
}

int main() {
    int *p = create_on_heap();
    printf("*p = %d (still valid -- heap memory outlives the function that created it)\n", *p);
    free(p);
    return 0;
}
```

### Run It

```
*p = 42 (still valid -- heap memory outlives the function that created it)
```

Structurally, this is nearly identical to the dangling-pointer example
— a function returns a pointer to memory, and the caller dereferences
it. The difference is entirely in *where* that memory lives: `value`
inside `create_on_heap` is a stack variable, but it *points to* heap
memory, obtained via `malloc` — and heap memory's lifetime is governed
entirely by explicit `free` calls (Lesson 83), never by which function
happens to be executing. Returning a pointer to it is not just safe,
it's the normal, correct way to hand heap-allocated data back to a
caller.

### CS Lens

This is the concrete payoff of everything this lesson has built: the
stack's automatic, function-scoped lifetime is convenient and fast,
but strictly bounded to "as long as this function call is active." The
heap's manual, `free`-scoped lifetime is more work (Lesson 83's own
leak-vs-no-leak contrast), but lets data outlive the function that
created it — precisely why every linked structure built across this
curriculum's C lessons (Lesson 85's own linked-list node, for
instance) is heap-allocated, not stack-allocated: a node that needs to
keep existing after the function that created it returns has no other
option.

## Exercises

- Modify the stack-growth recursion demo to print `&depth` (the
  *parameter*, not the local variable) at each level too, and confirm
  it follows the same downward pattern.
- Deliberately declare a large local array (`int big[1000000];`) inside
  `main` with no recursion at all, and observe whether it alone is
  enough to trigger a stack overflow on your system — research your
  platform's default stack size limit (`ulimit -s` on Linux/macOS) and
  compare it against the array's actual byte size.
- Rewrite `recurse_forever` to accept a `long limit` parameter and stop
  cleanly once `call_count >= limit`, confirming the exact call depth
  your system's stack can safely support before crashing, found by
  binary-searching that limit.
- Research **tail-call optimization** — some compilers can transform
  certain recursive calls (specifically, ones where the recursive call
  is the very last thing a function does) into a loop internally,
  avoiding stack growth entirely; test whether `recurse_forever`
  qualifies, and whether `-O2` changes this lesson's stack-overflow
  result.

## Definition of Done

- [ ] Stack and heap addresses printed side by side on your own
      machine, confirming a clear, large numeric separation between
      them.
- [ ] The downward-growing stack demo run for real, confirming a
      consistent decrease in address across recursive calls.
- [ ] The dangling-pointer demo run for real, including reading the
      actual compiler warning it produces — and, if curious,
      disassembled with `objdump -d` to confirm (or contrast against)
      this lesson's own NULL-ing observation on your specific compiler.
- [ ] A real stack overflow triggered on your own machine, confirming
      a genuine crash (not a hang) after enough unbounded recursion.
- [ ] The heap-persistence example run for real, confirming a pointer
      returned from a function remains valid and correctly
      dereferenceable afterward — the direct, working contrast to the
      dangling stack-pointer failure.
- [ ] Can explain out loud, without looking at the code, why
      `create_on_heap`'s returned pointer is safe while
      `make_dangling_pointer`'s is not, even though both functions
      return a pointer obtained from inside themselves.
- [ ] Committed, with a message explaining *why* — e.g. `"Stack vs.
      heap made concrete: real addresses proving the stack grows
      downward, a compiler-neutralized dangling pointer, a genuine
      stack overflow, and why heap memory can safely outlive its
      creating function"` — not `"add stack and heap examples"`.
