# Lesson 11: When the Stack Holds Real Objects

**What you will build:** `mini_object.c` splits into a shared header,
`mini_object.h`, and its own separate source file, so `mini_eval.c` can
`#include` it and link against it — the same real separation this
curriculum's own Lesson 8 already named between CPython's real
`Objects/` and `Python/` directories. Then `mini_eval`'s own stack,
`consts`, and `locals` all stop holding bare `long` values and start
holding real `struct MiniObject *` pointers instead — the exact objects
Lessons 1 through 7 built, complete with real reference counts. The
working feature: the identical `x = 2; y = 3; print(x + y)` program
from Lesson 10, producing the same `5`, but this time by pushing,
storing, loading, and combining real, reference-counted `MiniObject`s —
correctly `incref`-ing and `decref`-ing them at every single step,
confirmed with real reference-count numbers, not just a final printed
result. The transferable problem this lesson is actually about: Lessons
8 through 10 built a genuine bytecode interpreter, and Lessons 1 through
7 built a genuine reference-counted object system — but they've been
two separate projects the whole time, `long` values on one side, real
`MiniObject`s on the other. Real CPython's own evaluation loop doesn't
work on bare numbers at all: every single value on its own real
operand stack is a `PyObject *`, and every `LOAD_CONST`, `STORE_FAST`,
and `LOAD_FAST` — the exact three instructions this curriculum already
built — is documented, in CPython's own real C-API reference, as
"stealing," "borrowing," or otherwise directly manipulating a real
reference count on every single execution. This lesson makes that true
here, for the first time.

**What you need to know first:** Lessons 2 through 5 (pointers,
`incref_thing`/`decref_thing`, `MiniObjectHeader`, `mini_object_dealloc`)
and Lessons 8 through 10 (`mini_eval`'s own `enum`, `switch`, stack,
`consts`, and `locals`).

**Terms used in this lesson**

- **header file (`.h`)** — a file containing declarations — struct
  definitions, function prototypes, `extern` variable declarations —
  meant to be `#include`d into more than one `.c` file, so every file
  that includes it agrees on the exact same shapes without each one
  re-declaring them by hand. It exists because two separate `.c` files
  that both need to know what a `struct MiniObject` looks like, or that
  a function `incref_thing` exists and takes a certain argument, need
  one single, shared source of truth for that information, not two
  independently-typed copies that could quietly drift apart.
- **header guard (`#ifndef`/`#define`/`#endif`)** — a pattern wrapping
  a header file's entire contents, ensuring the file's own declarations
  are only ever processed once per compilation, even if the same header
  ends up `#include`d more than once (directly, or indirectly through
  another header). It exists because re-declaring the same `struct` a
  second time in the same file is a compile error in C, and a large
  enough project can easily end up including the same header from more
  than one path without meaning to.
- **`extern`** — placed before a global variable's declaration in a
  header, `extern` states that a variable with this name and type
  exists *somewhere* (in exactly one `.c` file), without allocating
  storage for it here. It exists because a global variable, unlike a
  function, needs its actual storage created in exactly one place — the
  `.c` file that defines it for real — while every other file that
  needs to *use* that variable only needs to know it exists and what
  type it is, which is exactly what an `extern` declaration states
  without duplicating the variable itself.
- **function prototype** — a function's own signature — return type,
  name, parameter types — written on its own, ending in a semicolon,
  with no body. It exists so a header can tell every file that includes
  it "this function exists, and this is its exact shape," without also
  handing over that function's real implementation, which stays in
  exactly one `.c` file.
- **separate compilation** — compiling more than one `.c` file into a
  single program, each one turned into its own piece of compiled code
  before being combined ("linked") into one final binary. It exists
  because a program's source doesn't have to live in one giant file —
  splitting related code into separate files, each compiled on its own
  and linked together afterward, is how real, large C projects (CPython
  itself very much included) stay organized as they grow.
- **array of pointers (`type *name[size]`)** — an array whose own
  elements are themselves pointers, rather than plain values; each
  element is reached with one `[]`, and the value it points at is
  reached with a further `*` or `->`. It exists because sometimes what
  a program needs to collect isn't a set of values directly, but a set
  of *references* to values that already exist somewhere else — exactly
  the situation `consts` and `locals` are in, once they need to hold
  real `MiniObject`s rather than copy each one directly into the array.

**Objects and methods used**

- **`mini_object_new`**
  - *What it is:* a new function, built in this lesson, that creates
    one fully-initialized `MiniObject` on the heap and hands back a
    pointer to it — this project's own counterpart to a real CPython
    constructor function like `PyLong_FromLong`.
  - *Implementation:*
    ```c
    struct MiniObject *mini_object_new(long value) {
        struct MiniObject *obj = malloc(sizeof(struct MiniObject));
        obj->header.refcount = 1;
        obj->header.type = &MiniObject_Type;
        obj->value = value;
        obj->ref = NULL;
        return obj;
    }
    ```
    Every line here is a direct reuse of mechanisms this curriculum
    already gave full treatment: `malloc` (Lesson 3), setting a fresh
    object's own `refcount` to `1` and its `type` (Lesson 4 and 5), and
    `ref` to `NULL` (Lesson 6) — the only thing new is packaging all
    four steps behind one named function, so `main` never has to repeat
    them by hand again.
  - *Its use:* every real value this lesson's own bytecode needs — both
    of `consts`' own entries, and the real sum `OP_ADD` produces — is
    created by calling this one function, instead of a fresh, separate
    `malloc`-and-setup sequence written out by hand at each call site.
  - *Type:* an ordinary function, declared in `mini_object.h` and
    defined in `mini_object.c`.
  - *Responsibility:* to guarantee that every `MiniObject` this project
    creates, anywhere, starts in a fully valid state — a real refcount,
    a real type, no dangling `ref` — the complete job, not just
    "allocates memory."
  - *Depends on:* a `long` value to store; nothing else — `malloc`
    (Lesson 3) and `MiniObject_Type` (Lesson 5) are both already
    available wherever this function is called from, via
    `mini_object.h`.
  - *Connects to:* called from `main`, in this lesson's own project, to
    build `consts`' own two entries, and called from inside `mini_eval`
    itself, by the new `OP_ADD` case, to build each addition's own real
    result — the first time in this curriculum that `mini_eval` creates
    a `MiniObject` on its own, rather than only ever receiving
    already-built ones.
  - *Shape:* takes one `long` in; returns one pointer to a fully valid,
    freshly allocated `MiniObject`, with a `refcount` of exactly `1`,
    every single time.

---

## Concept Unit: Splitting Code Across Files

### The Problem

`mini_object.c`'s own struct definitions and functions — `MiniObject`,
`MiniObjectHeader`, `incref_thing`, `decref_thing` — currently live
nowhere `mini_eval.c` can reach them at all; they're two entirely
separate files this curriculum has never linked together. For
`mini_eval` to push and pop real `MiniObject`s, it needs to know
exactly what a `MiniObject` looks like, and needs to be able to call
`incref_thing` and `decref_thing` for real — without simply pasting
Lesson 5's entire file into `mini_eval.c` by hand.

Before reading on: if two separate `.c` files both need to agree on the
exact same `struct` definition, and both need to call the same real
function, is there a way to state that shared information exactly once,
in a way both files can use, rather than typing the same struct
definition out twice and risking the two copies quietly drifting apart
from each other over time?

### Isolating the Concept

```c
/* lab20_mathutil.h */
#ifndef LAB20_MATHUTIL_H
#define LAB20_MATHUTIL_H

int double_it(int n);

#endif
```

```c
/* lab20_mathutil.c */
#include "lab20_mathutil.h"

int double_it(int n) {
    return n * 2;
}
```

```c
/* lab20_multifile_main.c */
#include <stdio.h>
#include "lab20_mathutil.h"

int main(void) {
    int result = double_it(21);
    printf("result = %d\n", result);
    return 0;
}
```

Actually compiled and run:

```
$ gcc -Wall -o lab20_multifile lab20_multifile_main.c lab20_mathutil.c
$ ./lab20_multifile
result = 42
```

`#ifndef LAB20_MATHUTIL_H` / `#define LAB20_MATHUTIL_H` / `#endif`, from
this lesson's Header, is the header guard: the first time this file is
included, `LAB20_MATHUTIL_H` isn't yet defined, so everything between
`#ifndef` and `#endif` is processed and `LAB20_MATHUTIL_H` becomes
defined; if the same header were ever included a second time in the
same file, `#ifndef` would find it already defined and skip the whole
body, preventing a duplicate declaration. `int double_it(int n);`, with
a semicolon and no body, is a function prototype, from this lesson's
Header — a promise that a function of exactly this shape exists
somewhere. `#include "lab20_mathutil.h"` — quotation marks rather than
angle brackets, unlike every standard-library include this curriculum
has used since Lesson 1, since this is this project's own header, not
one belonging to the C standard library — appears in *both* other
files: the header's own promise is what lets `lab20_multifile_main.c`
call `double_it` before ever seeing its real body, and lets
`lab20_mathutil.c` itself confirm its own definition matches what it
promised. The real compile command itself is the other half of the
proof: `gcc ... lab20_multifile_main.c lab20_mathutil.c` names *two*
`.c` files, both compiled and linked together into one program — this
is called **separate compilation**, from this lesson's Header, and real
output confirms it worked: `double_it`'s real body, sitting in a
completely different file from the one that called it, ran correctly
and produced `42`.

This throwaway example is now **discarded** — `lab20_mathutil.h`,
`lab20_mathutil.c`, and `lab20_multifile_main.c` will not appear in this
lesson's real project. What it proved — that a header's own
declarations let separate `.c` files agree on and use each other's real
code, compiled and linked together in one command — is exactly the
mechanism the real project needs next, to let `mini_eval.c` use
`mini_object.c`'s own real `MiniObject` machinery.

### Project Change

- **Reference Source** — This lesson's own Lesson 8 Header already
  named the real counterpart directly: CPython's own actual source is
  organized exactly this way, with object-related code living under
  `Objects/` and evaluation-related code living under `Python/`, sharing
  declarations through headers under `Include/` — the same three-way
  split (`mini_object.h`, `mini_object.c`, `mini_eval.c`) this unit
  builds, at far smaller scale.
- **Files affected** — `project/lesson-11/mini_object.h`, created;
  `project/lesson-11/mini_object.c`, created (moved from Lesson 5's own
  finished `mini_object.c`, minus its own `main` function, which
  belonged to that lesson's own standalone demonstration and has no
  place in a file meant to be linked with `mini_eval.c`'s own `main`
  instead); `project/lesson-11/mini_eval.c`, modified, to `#include
  "mini_object.h"`.
- **Change type** — add (two new files) and configure (`mini_eval.c`'s
  own new `#include` line, and the `gcc` command needed to link both
  files together).
- **Location** — `mini_object.h`'s own content is this file's entirety;
  `mini_object.c`'s own content is Lesson 5's struct definitions and
  functions, unchanged, with `main` removed; the new `#include` line
  goes at the top of `mini_eval.c`, alongside its own existing
  `#include <stdio.h>`.
- **Dependencies** — none beyond what Lessons 1 through 5 already
  established.

### The New Code

```c
#ifndef MINI_OBJECT_H
#define MINI_OBJECT_H

struct MiniObjectHeader;

struct MiniTypeInfo {
    const char *name;
    void (*dealloc)(struct MiniObjectHeader *);
};

struct MiniObjectHeader {
    long refcount;
    struct MiniTypeInfo *type;
    long gc_refs;
};

struct MiniObject {
    struct MiniObjectHeader header;
    long value;
    struct MiniObject *ref;
};

extern struct MiniTypeInfo MiniObject_Type;
extern long dealloc_call_count;

void incref_thing(struct MiniObjectHeader *op);
void decref_thing(struct MiniObjectHeader *op);
struct MiniObject *mini_object_new(long value);

#endif
```

```c
#include <stdio.h>
#include "mini_object.h"
```

### The Updated Project

```c
 1  #ifndef MINI_OBJECT_H                                  /* mini_object.h */
 2  #define MINI_OBJECT_H
 3
 4  struct MiniObjectHeader;
 5
 6  struct MiniTypeInfo {
 7      const char *name;
 8      void (*dealloc)(struct MiniObjectHeader *);
 9  };
10
11  struct MiniObjectHeader {
12      long refcount;
13      struct MiniTypeInfo *type;
14      long gc_refs;
15  };
16
17  struct MiniObject {
18      struct MiniObjectHeader header;
19      long value;
20      struct MiniObject *ref;
21  };
22
23  extern struct MiniTypeInfo MiniObject_Type;              // ← new
24  extern long dealloc_call_count;                          // ← new
25
26  void incref_thing(struct MiniObjectHeader *op);          // ← new
27  void decref_thing(struct MiniObjectHeader *op);          // ← new
28  struct MiniObject *mini_object_new(long value);          // ← new
29
30  #endif
```

```c
 1  #include <stdio.h>                                      /* mini_eval.c */
 2  #include "mini_object.h"                                  // ← new
 3
 4  enum MiniOpcode {
 5      OP_LOAD_CONST,
 6      OP_STORE_FAST,
 7      OP_LOAD_FAST,
 8      OP_ADD,
 9      OP_PRINT,
10      OP_HALT
11  };
12
13  /* ...mini_eval, unchanged in this unit, still using long... */
```

`mini_object.h` (lines 1–30) is entirely new: every struct definition
Lessons 4 and 5 already built, unchanged, plus, new in this unit,
`extern` declarations for the two real global variables `mini_object.c`
itself defines, and function prototypes for the three real functions it
provides. `mini_eval.c`'s only change in this unit (line 2) is one new
`#include` — nothing about `mini_eval`'s own logic changes yet; this
unit exists purely to prove the split itself compiles and links
correctly before the next, final unit puts it to real use.

### Mechanical Walkthrough

- **`#ifndef MINI_OBJECT_H` / `#define MINI_OBJECT_H` / `#endif`** —
  the header guard from this unit's own isolated lab, wrapping this
  entire file, using a name (`MINI_OBJECT_H`) chosen to be unique to
  this specific header.
- **`extern struct MiniTypeInfo MiniObject_Type;`** and
  **`extern long dealloc_call_count;`** — the `extern` keyword from
  this lesson's Header, applied to the two real global variables Lesson
  5 and Lesson 6 originally defined directly inside a single file:
  these lines state that a variable of this exact name and type exists
  somewhere (specifically, in `mini_object.c`, defined for real without
  the word `extern` in front), without creating a second, separate copy
  of either variable here.
- **`void incref_thing(struct MiniObjectHeader *op);`**, **`void decref_thing(struct MiniObjectHeader *op);`**,
  **`struct MiniObject *mini_object_new(long value);`** — three
  function prototypes, from this unit's own isolated lab: each states a
  real function's exact shape, with a trailing semicolon and no body,
  letting `mini_eval.c` call all three correctly once it includes this
  header, even though their real bodies live entirely in a different
  file.
- **`#include "mini_object.h"`** (in `mini_eval.c`) — the quoted-include
  form from this unit's own isolated lab, distinct from the angle-
  bracket form Lesson 1 used for the C standard library, since this is
  a header belonging to this project itself.

### Execution Trace

No loop, recursion, or carried state in this unit's own change — purely
structural: new files, new declarations, one new include line. No trace
is needed for the same reason established in every earlier lesson for
non-executing structural changes.

### CS Lens

Separating a *declaration* (what something is, and what it can do) from
its *implementation* (how it actually does it) is one of the most
consequential ideas in how real software is organized at any scale
beyond a single small file.

```
Also recognized in: a function's own documented signature in any
language, which callers rely on without needing to read its actual
body; an electrical outlet's own standard shape, which any compatible
appliance can plug into without knowing anything about the wiring
behind the wall; a restaurant menu, which describes what a dish is
without describing exactly how the kitchen prepares it; and every real
C library's own public header — this curriculum has already relied on
this exact idea since Lesson 1, every time it used printf or malloc
without ever reading the C standard library's own real source for
either one.
```

### SE Lens

The design principle is **letting separate pieces of a program depend
on a shared contract, instead of on each other's actual internals**.
The alternative not chosen: pasting `mini_object.c`'s entire content
directly into the top of `mini_eval.c`, which would work, technically,
but would mean any future lesson wanting to reuse `mini_object.c`'s own
machinery elsewhere — as, for instance, a hypothetical future version
of Lesson 6's own leaking-cycle demonstration, run independently of
`mini_eval` entirely — would need its own separate copy, with no
guarantee the two stayed in sync as either one changed. The real cost
of the header-based approach instead: every change to `mini_object.h`
now has the power to affect every file that includes it, all at once,
which is exactly the intended benefit, but also means a mistake in a
shared header can quietly break several files simultaneously rather
than staying contained to just one — the real reason large C projects,
CPython included, tend to treat their own public headers with
particular care once other code starts depending on them.

### Commands Needed

```
gcc -Wall -o mini_eval mini_eval.c mini_object.c
./mini_eval
```

Two source files named on one `gcc` command line, compiled and linked
into a single `mini_eval` binary — the separate-compilation pattern
this unit's own isolated lab already proved, applied here for the first
time to this project's own real files.

### Run It

Actually compiled and run this session, not predicted:

```
$ gcc -Wall -o mini_eval mini_eval_cu1.c mini_object.c
$ ./mini_eval_cu1
5
probe->value = 7, probe->header.refcount = 1
```

The first line, `5`, confirms `mini_eval`'s own existing behavior is
completely unchanged — this unit touched none of its logic. The second
line is this unit's own real proof that the split actually works:
`mini_object_new`, a function defined entirely inside `mini_object.c`,
was called successfully from `main`, in `mini_eval.c`, through nothing
but the shared header — producing a real, correctly-initialized object,
confirmed by its own real `value` and `refcount`.

### Connecting to What Came Before

Every earlier lesson in this curriculum built exactly one file at a
time. This unit is the first to connect two of this curriculum's own
earlier, separately-built pieces — Lesson 5's own object machinery and
Lesson 8's own evaluation loop — through a real, working header, without
copying either one's own code into the other. The next, final unit in
this lesson uses that connection for real.

---

## Concept Unit: Pushing Real Objects Instead of Numbers

### The Problem

`mini_eval`'s own `stack`, `consts`, and `locals` are all still arrays
of plain `long` — the split from the previous unit only *connects*
`mini_eval.c` to real `MiniObject`s; nothing inside `mini_eval` itself
has been changed to actually use one. For `OP_LOAD_CONST` to push a
real object, `consts` itself needs to hold real objects; and since a
single `MiniObject` can be large and needs a stable address other code
can reference — Lesson 4's own struct-embedding material already
established that a `MiniObject`'s address is meaningful — `consts` and
`locals` need to hold *pointers* to `MiniObject`s, not `MiniObject`s
copied directly into the array.

Before reading on: given that `MiniObject` is a real, sizable struct,
and given this curriculum's own established practice, since Lesson 3,
of passing objects around by pointer rather than by copying their full
contents — what type do you think `consts` and `locals` actually need
to become? And once every value flowing through `mini_eval` is a real,
reference-counted object instead of a bare number, what do you predict
needs to happen, at every single point a value moves — pushed, popped,
stored, loaded — that never mattered when it was just a `long`?

### Isolating the Concept

```c
#include <stdio.h>

int main(void) {
    int a = 10;
    int b = 20;
    int c = 30;

    int *values[3];
    values[0] = &a;
    values[1] = &b;
    values[2] = &c;

    int i;
    for (i = 0; i < 3; i++) {
        printf("*values[%d] = %d\n", i, *values[i]);
    }

    *values[1] = 99;
    printf("b is now %d\n", b);

    return 0;
}
```

Actually compiled and run:

```
$ gcc -Wall -o lab21_pointer_array lab21_pointer_array.c
$ ./lab21_pointer_array
*values[0] = 10
*values[1] = 20
*values[2] = 30
b is now 99
```

`int *values[3];`, from this lesson's Header, declares `values` as an
array of three `int *` — an array of pointers, not an array of `int`s
directly. `values[0] = &a;` stores `a`'s own address (Lesson 1's
address-of operator) into the array's first slot — `values[0]` is a
pointer, not a copy of `a`'s value. `*values[i]`, inside the loop,
combines array indexing (Lesson 7) with the dereference operator
(Lesson 2): first reach the pointer stored at position `i`, then follow
it to the real value. Real output confirms all three original values,
`10`, `20`, `30`. The real proof this unit's own lab exists for:
`*values[1] = 99;` writes *through* the stored pointer, and `b` itself
— the original variable, declared completely separately from
`values` — changes to `99`, confirmed by the final `printf`. This is
called an **array of pointers**, from this lesson's Header: the array
holds *references* to values that live elsewhere, not the values
themselves — which means writing through one of those references
genuinely changes the one real value every reference to it shares,
exactly the property `consts` and `locals` need once they hold real,
shared `MiniObject`s instead of independent copies of a number.

This throwaway example is now **discarded** — `lab21_pointer_array.c`
will not appear in this lesson's real project. What it proved — that an
array of pointers lets several array slots all refer to, and share, the
exact same underlying value — is exactly the relationship the real
project needs between `mini_eval`'s own `stack`, `consts`, and `locals`,
and the real `MiniObject`s Lessons 1 through 5 already built.

### Project Change

- **Reference Source** — Real CPython's own C-API documentation, read
  this session, describes its actual `LOAD_CONST`-equivalent behavior
  in terms of real reference-count effects, not just stack effects: a
  reference obtained from a container like CPython's own constants
  tuple is documented as a *borrowed* reference unless explicitly
  turned into a new, owned one — precisely why this project's own
  `OP_LOAD_CONST`, built in this unit, calls `incref_thing` explicitly,
  turning what would otherwise be a borrowed glance at `consts`' own
  entry into a real, independently-counted reference the stack owns.
  `incref_thing`, `decref_thing`, and `mini_object_new` are all quoted
  or described in full already, in this lesson's own Header and
  Lessons 2 through 5.
- **Files affected** — `project/lesson-11/mini_eval.c`, modified
  further (building on this lesson's first unit's already-updated
  version).
- **Change type** — refactor: `mini_eval`'s own `stack`, `consts`, and
  `locals` all change from `long` (or `long *`) to `struct MiniObject
  *` (or `struct MiniObject **`); every `switch` case gains real
  `incref_thing`/`decref_thing` calls; `OP_ADD` now calls
  `mini_object_new` instead of computing a bare sum; `main` now builds
  `consts` and `locals` as real `MiniObject`s.
- **Location** — throughout `mini_eval.c`: `mini_eval`'s own signature
  and local `stack` declaration, every `case` inside its `switch`, and
  `main`'s own setup of `consts` and `locals`.
- **Dependencies** — none beyond this lesson's first unit.

### The New Code

```c
void mini_eval(long *code, int code_len,
               struct MiniObject **consts, int consts_len,
               struct MiniObject **locals, int locals_len) {
    struct MiniObject *stack[100];
```

```c
case OP_LOAD_CONST: {
    struct MiniObject *obj = consts[code[pc]];
    incref_thing(&obj->header);
    stack[sp] = obj;
    sp++;
    pc++;
    break;
}
```

```c
case OP_STORE_FAST: {
    sp--;
    struct MiniObject *old = locals[code[pc]];
    if (old != NULL) {
        decref_thing(&old->header);
    }
    locals[code[pc]] = stack[sp];
    pc++;
    break;
}
```

```c
case OP_ADD: {
    struct MiniObject *b = stack[sp - 1];
    sp--;
    struct MiniObject *a = stack[sp - 1];
    sp--;
    struct MiniObject *result = mini_object_new(a->value + b->value);
    decref_thing(&a->header);
    decref_thing(&b->header);
    stack[sp] = result;
    sp++;
    break;
}
```

### The Updated Project

```c
 1  void mini_eval(long *code, int code_len,
 2                 struct MiniObject **consts, int consts_len,      // ← changed (was long *)
 3                 struct MiniObject **locals, int locals_len) {    // ← changed (was long *)
 4      struct MiniObject *stack[100];                              // ← changed (was long[100])
 5      int sp = 0;
 6      int pc = 0;
 7
 8      while (pc < code_len) {
 9          long opcode = code[pc];
10          pc++;
11
12          switch (opcode) {
13              case OP_LOAD_CONST: {                               // ← changed
14                  struct MiniObject *obj = consts[code[pc]];         // ← new
15                  incref_thing(&obj->header);                        // ← new
16                  stack[sp] = obj;                                    // ← changed
17                  sp++;
18                  pc++;
19                  break;
20              }                                                       // ← new
21
22              case OP_STORE_FAST: {                               // ← changed
23                  sp--;
24                  struct MiniObject *old = locals[code[pc]];          // ← new
25                  if (old != NULL) {                                   // ← new
26                      decref_thing(&old->header);                       // ← new
27                  }                                                     // ← new
28                  locals[code[pc]] = stack[sp];
29                  pc++;
30                  break;
31              }                                                       // ← new
32
33              case OP_LOAD_FAST: {                                // ← changed
34                  struct MiniObject *obj = locals[code[pc]];          // ← new
35                  incref_thing(&obj->header);                        // ← new
36                  stack[sp] = obj;                                    // ← changed
37                  sp++;
38                  pc++;
39                  break;
40              }                                                       // ← new
41
42              case OP_ADD: {
43                  struct MiniObject *b = stack[sp - 1];               // ← changed (was long)
44                  sp--;
45                  struct MiniObject *a = stack[sp - 1];               // ← changed (was long)
46                  sp--;
47                  struct MiniObject *result =                          // ← new
48                      mini_object_new(a->value + b->value);             // ← new
49                  decref_thing(&a->header);                            // ← new
50                  decref_thing(&b->header);                            // ← new
51                  stack[sp] = result;                                  // ← changed
52                  sp++;
53                  break;
54              }
55
56              case OP_PRINT:
57                  printf("%ld\n", stack[sp - 1]->value);              // ← changed (was stack[sp-1])
58                  break;
59
60              case OP_HALT:
61                  return;
62          }
63      }
64  }
65
66  int main(void) {
67      struct MiniObject *consts[2];                                // ← changed (was long[])
68      consts[0] = mini_object_new(2);                                // ← changed
69      consts[1] = mini_object_new(3);                                // ← changed
70      int consts_len = 2;
71
72      struct MiniObject *locals[2];                                // ← changed (was long[2])
73      locals[0] = NULL;                                              // ← new
74      locals[1] = NULL;                                              // ← new
75      int locals_len = 2;
76
77      /* ...program[] and program_len: unchanged from Lesson 10... */
78
79      printf("consts[0] refcount before run: %ld\n",               // ← new
80             consts[0]->header.refcount);                            // ← new
81
82      mini_eval(program, program_len, consts, consts_len, locals, locals_len);
83
84      printf("consts[0] refcount after run: %ld\n",                // ← new
85             consts[0]->header.refcount);                            // ← new
86      printf("locals[0] refcount after run: %ld\n",                // ← new
87             locals[0]->header.refcount);                            // ← new
88      printf("mini_object_dealloc has been called %ld times\n",    // ← new
89             dealloc_call_count);                                    // ← new
90
91      return 0;
92  }
```

Every value that ever touches `mini_eval`'s own stack, `consts`, or
`locals` is now a real `struct MiniObject *` — `stack` (line 4),
`consts` and `locals` (lines 2–3) — and every `case` that moves a value
between them (lines 13–20, 22–31, 33–40, 42–54) now calls
`incref_thing` or `decref_thing` at exactly the point a real reference
is gained or given up, mirroring Lessons 2 and 3's own established
discipline, applied here for the first time inside a running
interpreter rather than by hand in `main`.

### Mechanical Walkthrough

- **`struct MiniObject **consts`** and **`struct MiniObject **locals`**
  (in `mini_eval`'s own parameters) — the array-of-pointers concept
  from this unit's own isolated lab, written as a function parameter:
  a pointer to `MiniObject *`, which is exactly what an array of
  `MiniObject *` decays into when passed to a function — the same
  array-to-pointer decay Lesson 8 already named for `long *code`,
  applied here to an array whose own elements are pointers rather than
  plain numbers.
- **`struct MiniObject *stack[100];`** — `mini_eval`'s own local stack,
  now an array of pointers instead of an array of `long` — the exact
  syntax this unit's own isolated lab already proved, `type *name[size]`.
- **`case OP_LOAD_CONST: { struct MiniObject *obj = consts[code[pc]]; incref_thing(&obj->header); stack[sp] = obj; ... }`**
  — `consts[code[pc]]` performs the same indirect lookup Lesson 9
  already proved, now returning a real pointer instead of a `long`.
  `incref_thing(&obj->header)`, from Lesson 2's own chained-address
  pattern, is this unit's real payoff: the stack is about to hold a
  second reference to an object `consts` already owns one reference to,
  and per this lesson's own Reference Source, that new reference has to
  be made real and counted, not merely borrowed silently.
- **`case OP_STORE_FAST: { sp--; struct MiniObject *old = locals[code[pc]]; if (old != NULL) { decref_thing(&old->header); } locals[code[pc]] = stack[sp]; ... }`**
  — reads whatever `locals` slot is about to be overwritten (`old`)
  before overwriting it; if that slot already held a real object (not
  `NULL`, the safe default Lesson 3 established, set for both `locals`
  slots in `main`), that old reference is given up with `decref_thing`
  — otherwise, storing a second value into an already-occupied slot
  would silently leak whatever was there before, the exact class of
  bug Lesson 6 first demonstrated on purpose. The new value itself is
  then stored directly, with no further `incref`/`decref`: its
  reference simply transfers from "owned by the stack" to "owned by
  `locals`," the same net-zero transfer this lesson's own Header names
  under `mini_object_new`'s own *Its use* discussion.
- **`case OP_LOAD_FAST: { struct MiniObject *obj = locals[code[pc]]; incref_thing(&obj->header); stack[sp] = obj; ... }`**
  — the mirror of `OP_LOAD_CONST`: reading a value out of `locals`
  without removing it (exactly as Lesson 10 already established
  `OP_LOAD_FAST` should) means `locals` and the stack now both hold a
  real reference to the same object, so `incref_thing` runs here too.
- **`case OP_ADD: { ... struct MiniObject *result = mini_object_new(a->value + b->value); decref_thing(&a->header); decref_thing(&b->header); stack[sp] = result; ... }`**
  — `a->value + b->value` reads both operands' own real values through
  chained member access (Lesson 4), exactly as before, but the result
  is no longer written directly onto the stack as a bare number: it's
  handed to `mini_object_new`, from this lesson's own Header, producing
  a brand-new, independently owned `MiniObject`. `a` and `b` themselves
  are then released with `decref_thing`, since `OP_ADD` fully consumes
  both of its stack inputs — the same "stack gives up its reference"
  logic `OP_STORE_FAST` already established, applied here to two values
  at once.
- **`printf("%ld\n", stack[sp - 1]->value);`** (inside `OP_PRINT`) —
  chained access (Lesson 4) reading the real object's own `value`
  field, rather than treating the stack slot as a number directly, the
  one necessary change to a case that otherwise still only *looks* at
  the stack's top without consuming it.

### Execution Trace

Continuing the same trace shape from Lesson 10, now tracking real
reference counts alongside stack and program-counter movement:

1. `consts[0]` and `consts[1]` are created via `mini_object_new`, each
   starting at `refcount = 1` — owned, at this point, only by `consts`
   itself.
2. `OP_LOAD_CONST 0`: `incref_thing` raises `consts[0]`'s count to `2`;
   pushed onto the stack.
3. `OP_STORE_FAST 0`: `locals[0]` was `NULL`, so no `decref_thing` runs;
   the popped stack reference is stored directly into `locals[0]` — the
   count stays at `2`, now understood as "owned by `consts` and by
   `locals[0]`," not "owned by `consts` and the stack" any longer.
4. The identical two steps repeat for `consts[1]`/`locals[1]`, bringing
   its count to `2` as well.
5. `OP_LOAD_FAST 0`: `incref_thing` raises the shared object's count
   from `2` to `3` — owned by `consts`, `locals[0]`, and now the stack,
   all three at once.
6. `OP_LOAD_FAST 1`: the identical step for the other object, also
   reaching `3`.
7. `OP_ADD`: both `3`-count objects are read (`a->value`, `b->value`),
   then each is released with `decref_thing`, dropping both back to
   `2` — the stack's own temporary reference given up, `consts` and
   `locals` each still holding their own. `mini_object_new` creates a
   brand-new object holding `5`, at `refcount = 1`, owned only by the
   stack at this point.
8. `OP_PRINT` reads and prints `5`, touching no reference count.
9. `OP_HALT` returns. `mini_eval`'s own local `stack` array — along
   with the one remaining reference it held to the `5`-object — simply
   ceases to exist the moment the function returns; nothing in this
   lesson's own code ever calls `decref_thing` on that final result,
   or on either object still sitting in `locals` at the end of `main`.

### CS Lens

Managing an object's own reference count correctly at every single
point of hand-off — not just when a program's author happens to
remember to, but as a structural discipline built into every operation
that moves a value — is the same idea this curriculum's own Lessons 2
and 3 already named, now demonstrated for the first time inside an
actual running interpreter rather than hand-written application code.

```
Also recognized in: real CPython's own actual bytecode handlers, every
one of which follows exactly this same discipline — an object moving
from the constants tuple onto the stack gains a real reference, an
object consumed by an operation loses one, precisely mirroring this
lesson's own OP_LOAD_CONST and OP_ADD; and, more generally, any
resource hand-off protocol where responsibility for eventually
releasing something must be tracked explicitly at every single transfer
point, not just assumed to work out.
```

### SE Lens

The design principle this unit completes is **making every value's
ownership explicit at the exact moment it changes hands**, rather than
leaving it implicit or assumed. The real, honest cost this lesson's own
Execution Trace already exposed: this project's own `mini_eval` still
has no mechanism at all for cleaning up what's left when it returns —
the final `5`-object, and both objects still sitting in `locals`, are
never released, confirmed directly by real output showing
`dealloc_call_count` still at `0` even after the whole program
finishes. This is not a bug introduced by this lesson; it's a gap this
lesson inherits and makes newly visible, now that real, countable
objects are involved instead of bare numbers that needed no cleanup at
all. Real CPython's own actual frame-return machinery handles exactly
this: when a real Python function returns, its own frame releases
every reference its own local variables and stack still hold, before
the frame itself is discarded — a real mechanism this curriculum's own
`mini_eval` does not yet have, and the natural next gap for this
curriculum to close.

### Commands Needed

No new commands — the same `gcc -Wall -o mini_eval mini_eval.c
mini_object.c` and `./mini_eval` from this lesson's first unit.

### Run It

Actually compiled and run this session, not predicted:

```
$ gcc -Wall -o mini_eval mini_eval.c mini_object.c
$ ./mini_eval
consts[0] refcount before run: 1
5
consts[0] refcount after run: 2
locals[0] refcount after run: 2
mini_object_dealloc has been called 0 times
```

Every number matches this unit's own Execution Trace exactly:
`consts[0]` starts at `1` (owned only by `consts` itself) and ends at
`2` (owned by both `consts` and `locals[0]`, its net state after being
loaded, stored, loaded again, and decremented once by `OP_ADD` — one
real reference genuinely retained, not zero and not two separate
leftover references). `locals[0]`'s own count, read independently, is
the same `2`, confirming both variables really are looking at the exact
same underlying object. `mini_object_dealloc has been called 0 times`
is real, honest proof of this unit's own SE Lens: nothing was ever
freed, because nothing this simple interpreter did ever brought any
object's count all the way down to zero — not a bug, but a real,
visible gap this lesson deliberately leaves open.

### Connecting to What Came Before

The previous unit connected two files without changing what either one
actually did. This unit is where that connection became real: every
single value `mini_eval` touches, for the first time in this
curriculum, is a genuine `MiniObject`, with a genuine, correctly
maintained reference count — proven not by trusting the final printed
result alone, but by real refcount numbers, read directly, confirming
every `incref` and `decref` this unit added landed exactly where this
lesson's own Execution Trace predicted it would.

---

## Connect the Pieces

Follow one real object — the `MiniObject` originally created as
`consts[0]`, holding the value `2` — through its entire journey across
this lesson:

1. Created by `mini_object_new(2)`, in `main`, at `refcount = 1` — real
   output confirmed it directly, before `mini_eval` ever ran.
2. `OP_LOAD_CONST 0` read it out of `consts`, and `incref_thing` raised
   its count to `2` — a second, real, counted reference now existing on
   the stack, alongside `consts`' own original one.
3. `OP_STORE_FAST 0` moved that stack reference into `locals[0]` —
   `locals[0]` was `NULL`, so nothing was released, and the count
   stayed at `2`, now shared between `consts` and `locals[0]` instead
   of between `consts` and the stack.
4. `OP_LOAD_FAST 0` read it back out of `locals[0]` without removing
   it, and `incref_thing` raised the count to `3` — three real,
   independent holders, all at once: `consts`, `locals[0]`, and the
   stack.
5. `OP_ADD` consumed it as an input, reading its `value` and then
   calling `decref_thing`, dropping the count back to `2` — real
   output confirmed exactly that number, both directly after the run
   and independently, by reading `locals[0]`'s own count separately.

Every one of those five steps happened exactly once in this lesson's
own real, single run — no step skipped, no reference silently dropped
or duplicated, confirmed the whole way by real, printed numbers rather
than assumed correctness. `mini_eval` and `mini_object.c` — two
projects this curriculum built seven lessons apart — are, for the first
time, genuinely one system: a real evaluation loop, correctly and
verifiably managing real, reference-counted objects, exactly the way
this curriculum's very first lesson promised this whole thread would
eventually connect. What remains, named honestly in this lesson's own
SE Lens: nothing yet cleans up when `mini_eval` returns, and nothing
here would notice or recover if `locals[0]` and `locals[1]` were ever
made to reference each other — the same reference-cycle danger Lesson 6
built on purpose, now possible again, for the first time since Lesson
7's own collector was built to catch it, in a system this curriculum
has not yet reconnected the two halves of.
