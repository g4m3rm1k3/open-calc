# Lesson 4: Every Object's Real Header

**What you will build:** `MiniObject` gets restructured so its
reference count lives inside a small, separate header struct —
`MiniObjectHeader` — embedded as its very first field, and that header
gains a second field: a pointer to a small type-descriptor struct
naming what kind of object this is. The working feature: `incref_thing`
and `decref_thing` now operate on the header alone, and `thing` can
report its own type's name at runtime. The transferable problem this
lesson is actually about: every `MiniObject` this curriculum builds from
here on will have its own different extra data (Lesson 1's `value` was
just the first example) — but *all* of them still need a reference count
and a type, and CPython's real answer to "how do wildly different kinds
of objects all get counted and typed the same way" is exactly this
lesson's own construction: a small, shared header struct, embedded as
literally the first bytes of every real Python object, no matter what
that object is.

**What you need to know first:** Lesson 1 (`struct`, `&`, compiling),
Lesson 2 (pointers, `->`), and Lesson 3 (`malloc`, `free`, `NULL`,
`if`).

**Terms used in this lesson**

- **struct embedding** — declaring one `struct` type as the first field
  of another `struct`, rather than referencing it through a pointer. It
  exists because C guarantees that a struct's address and its first
  member's address are the same value — which means a pointer to the
  outer struct can be safely treated as a pointer to the inner one,
  letting generic code (like this lesson's `incref_thing`) operate on
  just the embedded piece, without needing to know anything about
  whatever specific struct it's embedded inside of.
- **chained member access (`->` then `.`)** — reaching a field that is
  itself inside a nested struct, by combining the arrow operator
  (Lesson 2, for going through a pointer) with the plain `.` operator
  (Lesson 1, for a struct value already in hand) in a single expression,
  left to right. It exists because neither operator alone reaches
  through two levels of structure — `->` gets you to the embedded
  struct, and a further `.` is needed to get from there into one of
  *its* own fields.
- **global variable** — a variable declared outside of any function,
  at the top level of a file, whose value persists for the entire
  lifetime of the program and is reachable from any function in the
  file (or, with the right declarations, other files too). It exists
  because some data — like this lesson's one shared type-descriptor —
  genuinely needs to be created once and referred to from anywhere,
  rather than being recreated inside every function that needs it.
- **`const`** — a qualifier placed before a type, promising the compiler
  (and any reader) that the value it qualifies will not be modified
  through this particular variable. It exists so code can state, and
  have the compiler enforce, that certain data — like this lesson's type
  name — is meant to be read-only, catching an accidental modification
  as a compile error instead of a silent runtime bug.
- **C string / `char *`** — C has no dedicated string type; a run of
  text is represented as a pointer to `char` (`char *`), pointing at a
  sequence of individual character values in memory that ends with a
  special zero byte marking where the text stops. A string literal like
  `"MiniObject"`, written directly in source code, is C's shorthand for
  creating exactly this kind of data and handing back a pointer to its
  first character — which is why a variable meant to hold one is
  declared as a pointer, not some more "string-shaped" type.
- **`%s` (format specifier)** — the `printf` format specifier, from
  Lesson 1's Header family of format specifiers, for a C string: it
  tells `printf` to read characters starting at the given `char *`
  address and keep printing them until it reaches that terminating zero
  byte.
- **struct initializer (`{ ... }`)** — writing a struct's starting field
  values directly inside curly braces, at the point a variable of that
  type is declared, instead of assigning each field separately on its
  own line afterward. It exists as a shorter, single-step way to give a
  struct its starting values — useful here specifically because this
  lesson's one global type descriptor only ever needs to be set up once,
  with values that never change afterward.

**Objects and methods used**

- **`PyObject` (CPython's real object header struct)**
  - *What it is:* the actual base struct every real Python object in
    CPython begins with — the genuine counterpart this whole
    curriculum's `MiniObjectHeader` has been built to imitate.
  - *Implementation:* quoted verbatim, from `Include/object.h` in
    CPython's `v3.12.7` tag (trimmed of an MSVC-only warning-suppression
    pragma and a 64-bit-only extra union member, both irrelevant to this
    lesson's own point):
    ```c
    struct _object {
        _PyObject_HEAD_EXTRA
        union {
            Py_ssize_t ob_refcnt;
        };
        PyTypeObject *ob_type;
    };
    ```
    `struct _object` is the struct's real internal name; `PyObject` (the
    name this curriculum has been using all along) is a `typedef` alias
    for it, defined elsewhere in CPython's own headers.
    `_PyObject_HEAD_EXTRA` is a macro that expands to nothing at all in
    an ordinary build — it only adds fields in a special debug build
    this lesson isn't using. `ob_refcnt` is wrapped in a `union` for
    reasons tied to 64-bit-specific optimizations this curriculum hasn't
    covered; functionally, for this lesson's purposes, it behaves as
    plainly as `MiniObjectHeader`'s own `refcount` field. `ob_type` is a
    pointer to `PyTypeObject` — CPython's real, much larger type
    descriptor, which this lesson's own `MiniTypeInfo` is a deliberately
    tiny stand-in for.
  - *Its use:* this lesson's own `MiniObjectHeader`, built in this
    lesson's second Concept Unit, is a simplified version of exactly
    this struct — same two-field idea (a reference count, then a type
    pointer), without the debug-build extras or 64-bit-specific
    optimizations.
  - *Type:* a plain C `struct` definition, given a shorter alias
    (`PyObject`) via `typedef` elsewhere in CPython's headers.
  - *Responsibility:* to be the one fixed, common starting layout every
    single Python object shares, regardless of whether it's an `int`, a
    `list`, or a class instance the reader defines themselves in Python
    — the exact fact that makes it possible to write functions (like
    `Py_INCREF`, quoted in Lesson 2's Header) that work correctly on any
    Python object at all, without needing a separate version for every
    different kind of object.
  - *Depends on:* nothing external — it's the base case; every other,
    more specific object struct in CPython depends on *this* struct's
    layout, not the other way around.
  - *Connects to:* embedded, via the `PyObject_HEAD` macro (quoted
    below), as the first field of every larger, more specific object
    struct throughout the rest of CPython's own source — `Py_INCREF`,
    `Py_DECREF`, and `Py_TYPE` (quoted below) all take a `PyObject *`
    and read or write directly into this struct's own two fields.
  - *Shape:* exactly two meaningful fields in an ordinary build — one
    whole number (the reference count) and one pointer (to this
    object's type) — never anything else, no matter which specific kind
    of Python object it's embedded inside of.

- **`PyObject_HEAD` (the embedding macro)**
  - *What it is:* the real macro CPython's own comment (quoted in this
    lesson's second Concept Unit) says must be used at the start of any
    struct meant to represent a Python object.
  - *Implementation:* quoted verbatim, from `Include/object.h` in
    CPython's `v3.12.7` tag:
    ```c
    #define PyObject_HEAD PyObject ob_base;
    ```
  - *Its use:* it's this exact mechanism — writing `PyObject_HEAD` (or,
    written out, `PyObject ob_base;`) as a struct's first field — that
    every real CPython object struct uses to get a reference count and
    type pointer "for free," and it's precisely the pattern this
    lesson's second Concept Unit builds a smaller version of, by hand,
    with `MiniObjectHeader`.
  - *Type:* a preprocessor macro — text substitution performed before
    compilation, the same category of construct as `#include` (Lesson
    1), just expanding to a declaration instead of pulling in a file.
  - *Responsibility:* to guarantee that every real Python object struct
    starts with the identical two fields, in the identical order, so
    that any of them can be safely treated as a plain `PyObject *` —
    the exact struct-embedding guarantee this lesson's first Concept
    Unit proves in isolation.
  - *Depends on:* nothing beyond the `PyObject` struct it embeds.
  - *Connects to:* used, throughout the rest of CPython's own source
    (in files this curriculum hasn't opened yet), as literally the first
    line inside the definition of every specific object struct — the
    struct for a Python `list`, a Python `dict`, and every other
    built-in type all begin with this exact macro.
  - *Shape:* expands to one embedded struct field, named `ob_base`, of
    type `PyObject` — nothing else; whatever fields a specific object
    type needs beyond that come after it.

- **`Py_TYPE`**
  - *What it is:* the real CPython function used to read an object's
    type back out of its header.
  - *Implementation:* quoted verbatim, from `Include/object.h` in
    CPython's `v3.12.7` tag:
    ```c
    static inline PyTypeObject* Py_TYPE(PyObject *ob) {
        return ob->ob_type;
    }
    ```
  - *Its use:* this lesson's third Concept Unit reads `thing`'s type
    name directly, through `thing->header.type->name` — `Py_TYPE` is
    the real equivalent operation, reading `ob_type` through exactly
    the same kind of arrow-operator access this lesson's own code uses.
  - *Type:* a `static inline` C function — ordinary, real, callable code
    (not a macro, unlike `Py_INCREF`/`Py_DECREF` in Lesson 2, though it
    behaves just as directly).
  - *Responsibility:* to hand back the one, single, authoritative answer
    to "what type is this object" — reading it directly from the
    object's own header rather than computing or guessing it any other
    way, since, per this lesson's Header entry on `PyObject` above,
    every object's type pointer already lives right there in its first
    few bytes.
  - *Depends on:* a valid, non-NULL `PyObject *` pointer, exactly like
    `Py_INCREF` and `Py_DECREF` from Lesson 2 and 3.
  - *Connects to:* called throughout CPython's own source anywhere code
    needs to know what kind of object it's holding; it reads directly
    out of the `ob_type` field that `PyObject_HEAD` (quoted above)
    guarantees every object struct has, in the same position, no matter
    which specific kind of object it is.
  - *Shape:* takes one pointer in; returns one pointer out — specifically
    a pointer to a `PyTypeObject`, CPython's real type-descriptor struct,
    which a later lesson in this curriculum opens up in full; this
    lesson treats it, like its own `MiniTypeInfo`, as a struct worth
    pointing at but not yet worth fully exploring.

---

## Concept Unit: One Struct Inside Another

### The Problem

Every `MiniObject` this curriculum has built so far keeps its
`refcount` field directly alongside its own data (`value`) in one flat
struct. That already works for `MiniObject` specifically — but if this
curriculum ever built a second, different kind of object (say, one that
stores two numbers instead of one), that second struct would need its
own separate `refcount` field too, and `incref_thing`/`decref_thing`
would need a second version each, just to reach a differently-shaped
struct's copy of the same idea.

Before reading on: if two completely different structs both needed to
carry "the same two starting fields," is there a way to define those
two fields exactly once, and have both structs include them, without
copy-pasting the same field declarations into each one separately? What
would it mean, structurally, for one struct to "start with" another
one?

### Isolating the Concept

```c
#include <stdio.h>

struct Header {
    int tag;
};

struct Wrapped {
    struct Header header;
    int payload;
};

int main(void) {
    struct Wrapped w;
    w.header.tag = 7;
    w.payload = 42;

    struct Header *h = (struct Header *)&w;

    printf("w.header.tag = %d\n", w.header.tag);
    printf("h->tag = %d\n", h->tag);
    printf("&w = %p\n", (void *)&w);
    printf("h  = %p\n", (void *)h);

    return 0;
}
```

Actually compiled and run:

```
$ gcc -Wall -o lab8_embedding lab8_embedding.c
$ ./lab8_embedding
w.header.tag = 7
h->tag = 7
&w = 0x7ffe9cf2aa30
h  = 0x7ffe9cf2aa30
```

`struct Wrapped { struct Header header; int payload; };` declares
`header` — an entire `struct Header` — as `Wrapped`'s first field, using
ordinary struct-field syntax (Lesson 1); the only thing new is that the
field's type is itself a struct, not a plain `int` or `long`.
`w.header.tag = 7;` reaches `tag` through two steps: `.header` (Lesson
1's `.` operator, reaching the embedded struct) followed by `.tag`
(the same operator again, reaching a field inside *that* struct) — the
chained member access from this lesson's Header. The proof this unit
exists to deliver is the cast: `(struct Header *)&w` takes the address
of the *entire* `Wrapped` variable and treats it as a pointer to just a
`Header` — and both `h->tag` and, critically, the two printed
addresses, `&w` and `h`, come out identical. This is called **struct
embedding**: because `header` is `Wrapped`'s first field, `w`'s own
address and `w.header`'s address are the exact same location in memory
— there's no gap, no extra bytes before `header` begins — which is
precisely what makes it valid to treat a pointer to the whole `Wrapped`
struct as a pointer to just its embedded `Header` piece.

This throwaway example is now **discarded** — `lab8_embedding.c`,
`struct Header`, and `struct Wrapped` will not appear in this lesson's
real project. What it proved — that an embedded struct's address is
identical to its containing struct's address, so a pointer to the whole
can safely be treated as a pointer to just the embedded part — is
exactly the trick the real project needs next, to give `incref_thing`
and `decref_thing` one shared header to operate on, instead of the
whole `MiniObject`.

### Project Change

- **Reference Source** — `Include/object.h`, CPython `v3.12.7` tag, the
  block comment immediately above `struct _object`'s own definition,
  quoted verbatim: *"The actual memory allocated for an object contains
  other data that can only be accessed after casting the pointer to a
  pointer to a longer structure type. This longer type must start with
  the reference count and type fields; the macro `PyObject_HEAD` should
  be used for this."* This is the real design principle this Concept
  Unit's `MiniObjectHeader` is a hand-built, simplified version of; the
  full `PyObject` struct itself and the `PyObject_HEAD` macro are quoted
  in full in this lesson's own Header, above.
- **Files affected** — `project/lesson-04/mini_object.c`, modified
  (copied forward from Lesson 3's finished `mini_object.c`).
- **Change type** — refactor: `refcount` moves out of `MiniObject`
  directly and into a new, separate `MiniObjectHeader` struct, embedded
  as `MiniObject`'s first field; `incref_thing` and `decref_thing`'s
  parameter types change from `struct MiniObject *` to `struct
  MiniObjectHeader *`.
- **Location** — the new struct is added above `struct MiniObject`'s
  existing definition; `MiniObject`'s own `refcount` field is removed
  and replaced with the embedded `header` field; every `thing->refcount`
  access throughout `main` becomes `thing->header.refcount`; every
  `incref_thing(&thing)` / `decref_thing(&thing)`-style call becomes
  `incref_thing(&thing->header)` / `decref_thing(&thing->header)`.
- **Dependencies** — none beyond what Lessons 1–3 already established.

### The New Code

```c
struct MiniObjectHeader {
    long refcount;
};
```

```c
void incref_thing(struct MiniObjectHeader *op) {
    op->refcount++;
}
```

### The Updated Project

```c
 1  #include <stdio.h>
 2  #include <stdlib.h>
 3
 4  struct MiniObjectHeader {              // ← new
 5      long refcount;                      // ← new
 6  };                                       // ← new
 7
 8  struct MiniObject {
 9      struct MiniObjectHeader header;     // ← new (replaces "long refcount;")
10      long value;
11  };
12
13  void incref_thing(struct MiniObjectHeader *op) {  // ← new parameter type
14      op->refcount++;
15  }
16
17  void decref_thing(struct MiniObjectHeader *op) {  // ← new parameter type
18      op->refcount--;
19      if (op->refcount == 0) {
20          free(op);
21      }
22  }
23
24  int main(void) {
25      struct MiniObject *thing = malloc(sizeof(struct MiniObject));
26      thing->header.refcount = 1;                    // ← new (was thing->refcount)
27      thing->value = 99;
28
29      printf("thing->value = %ld\n", thing->value);
30      printf("thing lives at address %p\n", (void *)thing);
31      printf("&thing->header lives at address %p\n", // ← new
32             (void *)&thing->header);                 // ← new
33      printf("refcount starts at %ld\n", thing->header.refcount);
34
35      incref_thing(&thing->header);                   // ← new (was incref_thing(thing))
36      printf("refcount after one incref_thing call: %ld\n", thing->header.refcount);
37
38      incref_thing(&thing->header);
39      incref_thing(&thing->header);
40      printf("refcount after two more calls: %ld\n", thing->header.refcount);
41
42      printf("refcount before releases: %ld\n", thing->header.refcount);
43
44      decref_thing(&thing->header);                   // ← new (was decref_thing(thing))
45      decref_thing(&thing->header);
46      decref_thing(&thing->header);
47      printf("refcount after three releases: %ld\n", thing->header.refcount);
48
49      decref_thing(&thing->header);
50      printf("thing has now been freed\n");
51      thing = NULL;
52      printf("thing is now %p\n", (void *)thing);
53
54      return 0;
55  }
```

`incref_thing` and `decref_thing` (lines 13–22) no longer know or care
that a `MiniObject` exists at all — they only ever touch a
`MiniObjectHeader`, reached through `&thing->header` at every call site
(lines 35, 38–39, 44–46, 49). `main` creates `thing` exactly as before
(line 25), but now every reference-count access goes through the
embedded `header` field (lines 26, 33, 36, 40, 42, 47), while `value`
(line 27) is still reached directly, since it isn't part of the header
at all.

### Mechanical Walkthrough

- **`struct MiniObjectHeader { long refcount; };`** — a new,
  freestanding struct definition, using the same `struct` construct
  Lesson 1 introduced, containing exactly the one field `MiniObject`
  used to hold directly. This is the small, hand-built counterpart to
  CPython's own real `PyObject` struct, quoted in this lesson's Header.
- **`struct MiniObjectHeader header;`** (inside `MiniObject`) — this is
  struct embedding, from this unit's own isolated lab: `header` is
  declared as `MiniObject`'s first field, and its type is the whole
  `MiniObjectHeader` struct just defined above, not a pointer to one.
  Its position matters specifically: it must be first, exactly as this
  unit's lab and this lesson's quoted CPython comment both require, for
  the address-equality trick to hold.
- **`void incref_thing(struct MiniObjectHeader *op)`** — the same
  function from Lesson 2, with one change: its parameter's declared
  type is now `struct MiniObjectHeader *`, using the pointer declaration
  syntax from Lesson 2, instead of `struct MiniObject *`. The function's
  own body, `op->refcount++;`, is completely unchanged — it never needed
  to know about `MiniObject` specifically, only about whatever struct
  its pointer points at having a `refcount` field, which
  `MiniObjectHeader` still does.
- **`thing->header.refcount = 1;`** — chained member access from this
  lesson's Header: `thing->header` (the arrow operator from Lesson 2,
  reaching the embedded struct through `thing`'s pointer) followed by
  `.refcount` (the plain `.` operator from Lesson 1, reaching a field
  inside that embedded struct). This sets the exact same field, with the
  exact same meaning, as `thing->refcount = 1;` did in Lesson 3 — only
  the path to reach it has changed, from one arrow to an arrow-then-dot.
- **`printf("&thing->header lives at address %p\n", (void *)&thing->header);`**
  — a new `printf` call, using the same `%p` and `(void *)` cast from
  Lesson 1, this time printing the address of the *embedded header*
  specifically, deliberately placed right next to the line printing
  `thing`'s own address, so the real output can be compared side by
  side and prove this unit's own isolated lab's claim for real, on the
  actual project's own memory, not just the throwaway `Wrapped` example.
- **`incref_thing(&thing->header);`** — `&thing->header` first performs
  the chained member access just explained, reaching the embedded
  `header` struct, and *then* the address-of operator (Lesson 1)
  applies to that struct specifically — producing a `struct
  MiniObjectHeader *`, exactly the type `incref_thing`'s parameter now
  expects. Per this unit's own isolated lab, this address is identical
  to `thing`'s own address — but writing `&thing->header` explicitly,
  rather than just casting `thing` directly, keeps the function's real
  parameter type honest and lets the compiler itself check that the
  right kind of pointer is being passed, rather than relying on an
  unchecked cast the way the isolated lab's own proof-of-concept did.

### Execution Trace

No loop or recursion in this unit's changes; the same straight-through
sequence of statements from Lessons 2 and 3, just reached through a
different field path. No `Iteration N:` trace is needed for the same
reason already stated in those lessons.

### CS Lens

Embedding one struct as the first field of another so that a pointer to
the whole is also validly a pointer to the part is a real, named
technique, not a one-off C trick.

```
Also recognized in: C's own standard idiom for "inheritance built by
hand" (CPython's own source comment, quoted in this lesson's Header,
literally calls PyObject-based structs exactly this); the first field
of a network protocol header shared across many different packet
types, so generic code can read it without knowing the specific packet
type yet; and, at a conceptual level, Python's own class inheritance —
a subclass instance genuinely does start with everything its parent
class defines, which is a big part of why an instance of a Python
subclass can always be used anywhere an instance of its parent class is
expected.
```

### SE Lens

The design principle is **sharing structure through composition
instead of duplication**. The alternative not chosen: giving every
different kind of `MiniObject`-like struct its own separate `refcount`
field, declared fresh each time, with `incref_thing`/`decref_thing`
either duplicated per struct type or written to blindly assume a
specific field layout with no shared guarantee behind that assumption.
The real tradeoff of the embedding approach this unit builds instead:
it requires strict discipline about field *order* — the embedded header
must be first, always, in every struct that wants to share this
machinery, and nothing in the C language itself enforces that beyond
convention and, in CPython's real case, the documented rule this
lesson's Header already quoted. Get the order wrong even once, and the
address-equality this whole mechanism depends on silently stops
holding, with no compiler warning at all. This project isn't carrying
that debt currently — `MiniObjectHeader` is `MiniObject`'s only field
before `value`, correctly — but it's worth naming as the real cost of
this pattern, and it's exactly why CPython itself doesn't trust
programmers to get this right by hand every time and instead ships the
`PyObject_HEAD` macro, quoted in this lesson's Header, specifically so
every real object struct's author writes the same guaranteed-correct
line instead of re-deriving the layout themselves.

### Commands Needed

No new commands — `gcc -Wall -o mini_object mini_object.c` and
`./mini_object`, unchanged since Lesson 1.

### Run It

Actually compiled and run this session, not predicted:

```
$ gcc -Wall -o mini_object mini_object.c
$ ./mini_object
thing->value = 99
thing lives at address 0x555df08712a0
&thing->header lives at address 0x555df08712a0
refcount starts at 1
refcount after one incref_thing call: 2
refcount after two more calls: 4
refcount before releases: 4
refcount after three releases: 1
thing has now been freed
thing is now (nil)
```

The two address lines are identical — `0x555df08712a0` both times — the
same proof this unit's isolated lab already gave with `Wrapped` and
`Header`, now confirmed on the real project's own `thing` and `header`.
Every refcount value matches Lesson 3's own run exactly, since nothing
about the counting or freeing logic actually changed — only the path
used to reach the field did.

### Connecting to What Came Before

Lesson 3 gave `thing` a complete, correct lifecycle, but its
`refcount` field lived directly inside `MiniObject`, tangled together
with `value` in one flat struct — fine for exactly one kind of object,
but not reusable. This unit pulled that field out into its own small,
shared struct and proved, both in isolation and on the real project's
own memory, that doing so doesn't change anything about how the
counting works — it only makes that counting machinery reusable by any
future struct that embeds the same header first. The next unit gives
that header one more real CPython-inspired field: a type.

---

## Concept Unit: Giving an Object a Type of Its Own

### The Problem

`MiniObjectHeader` currently only tracks *how many* references exist —
nothing about `thing` records *what kind* of thing it is. This
curriculum's own quoted CPython source, in this lesson's Header, already
named the real `PyObject` struct's second field: not just a reference
count, but a type pointer too. Right now, nothing in this project could
answer the question "what type is `thing`?" — even though, conceptually,
every object this curriculum builds is obviously *some* type of object.

Before reading on: if `MiniObjectHeader` needs a second field
specifically to answer "what kind of object is this," what shape do you
think that field should have — a plain number, a piece of text, or
something else? And given how this lesson's first unit just proved
structs can be shared by embedding, do you think the *type itself*
might be worth representing as its own small struct too, rather than
just a bare string sitting directly in the header?

### Isolating the Concept

```c
#include <stdio.h>

int main(void) {
    const char *name = "MiniObject";
    printf("name = %s\n", name);
    return 0;
}
```

Actually compiled and run:

```
$ gcc -Wall -o lab9_string lab9_string.c
$ ./lab9_string
name = MiniObject
```

`const char *name = "MiniObject";`, from this lesson's Header, declares
`name` as a pointer to `char`, qualified with `const` — a promise that
the text this pointer refers to won't be modified through `name`. The
string literal `"MiniObject"` is C's shorthand for laying out each of
those ten characters in memory, followed by a hidden terminating zero
byte, and handing back a pointer to the first one — that pointer is
exactly what gets stored into `name`. `printf`'s `%s` specifier, from
this lesson's Header, reads starting at that address and keeps printing
characters until it reaches the terminator, which is why the real
output shows the whole word `MiniObject` from a single pointer, with no
length ever stated anywhere in the code. This is called a **C string**:
not a distinct type of its own, but a plain convention — a `char *`
pointing at characters that happen to end in a zero byte — that C code,
including `printf` itself, agrees to treat as text.

This throwaway example is now **discarded** — `lab9_string.c` will not
appear in this lesson's real project. What it proved (that a `const
char *` naming a string literal can be stored, passed around, and
printed with `%s`) is exactly what the real project needs next, to give
its own type descriptor a name worth printing.

### Project Change

- **Reference Source** — `Include/object.h`, CPython `v3.12.7` tag: the
  `ob_type` field inside `struct _object`, and the `Py_TYPE` function
  reading it, both quoted in full in this lesson's Header. CPython's
  real type descriptor, `PyTypeObject`, is a large struct this
  curriculum has not opened yet — `MiniTypeInfo`, built in this unit, is
  a deliberately tiny stand-in carrying only a name, not a full
  counterpart.
- **Files affected** — `project/lesson-04/mini_object.c`, modified
  further (building on this lesson's first unit's already-updated
  version).
- **Change type** — add (`struct MiniTypeInfo`, a new struct; a new
  global variable of that type; a new `type` field on
  `MiniObjectHeader`).
- **Location** — `struct MiniTypeInfo` and the new global variable go
  above `struct MiniObjectHeader`'s existing definition; the new `type`
  field goes inside `MiniObjectHeader`, after `refcount`; the new
  assignment and `printf` call go inside `main`, right after `thing`'s
  existing field setup.
- **Dependencies** — none beyond what this lesson's first unit already
  established.

### The New Code

```c
struct MiniTypeInfo {
    const char *name;
};

struct MiniTypeInfo MiniObject_Type = { "MiniObject" };
```

```c
struct MiniTypeInfo *type;
```

```c
thing->header.type = &MiniObject_Type;
printf("thing's type is called: %s\n", thing->header.type->name);
```

### The Updated Project

```c
 1  #include <stdio.h>
 2  #include <stdlib.h>
 3
 4  struct MiniTypeInfo {                              // ← new
 5      const char *name;                               // ← new
 6  };                                                   // ← new
 7
 8  struct MiniTypeInfo MiniObject_Type = { "MiniObject" };  // ← new
 9
10  struct MiniObjectHeader {
11      long refcount;
12      struct MiniTypeInfo *type;                      // ← new
13  };
14
15  struct MiniObject {
16      struct MiniObjectHeader header;
17      long value;
18  };
19
20  void incref_thing(struct MiniObjectHeader *op) {
21      op->refcount++;
22  }
23
24  void decref_thing(struct MiniObjectHeader *op) {
25      op->refcount--;
26      if (op->refcount == 0) {
27          free(op);
28      }
29  }
30
31  int main(void) {
32      struct MiniObject *thing = malloc(sizeof(struct MiniObject));
33      thing->header.refcount = 1;
34      thing->header.type = &MiniObject_Type;           // ← new
35      thing->value = 99;
36
37      printf("thing->value = %ld\n", thing->value);
38      printf("thing lives at address %p\n", (void *)thing);
39      printf("&thing->header lives at address %p\n",
40             (void *)&thing->header);
41      printf("refcount starts at %ld\n", thing->header.refcount);
42      printf("thing's type is called: %s\n",           // ← new
43             thing->header.type->name);                 // ← new
44
45      incref_thing(&thing->header);
46      printf("refcount after one incref_thing call: %ld\n", thing->header.refcount);
47
48      incref_thing(&thing->header);
49      incref_thing(&thing->header);
50      printf("refcount after two more calls: %ld\n", thing->header.refcount);
51
52      printf("refcount before releases: %ld\n", thing->header.refcount);
53
54      decref_thing(&thing->header);
55      decref_thing(&thing->header);
56      decref_thing(&thing->header);
57      printf("refcount after three releases: %ld\n", thing->header.refcount);
58
59      decref_thing(&thing->header);
60      printf("thing has now been freed\n");
61      thing = NULL;
62      printf("thing is now %p\n", (void *)thing);
63
64      return 0;
65  }
```

`MiniObjectHeader` now carries two fields (lines 10–13) instead of one:
`refcount`, unchanged from the previous unit, and a new `type` pointer.
`main` sets that new field once, right after `thing` is allocated (line
34), pointing it at the one shared `MiniObject_Type` global (line 8),
then immediately prints the type's name through it (lines 42–43) —
everything else in `main` continues exactly as the previous unit left
it.

### Mechanical Walkthrough

- **`struct MiniTypeInfo { const char *name; };`** — a new, freestanding
  struct with one field, `name`, of type `const char *` — the C-string
  type from this unit's own isolated lab, qualified `const` (also from
  this lesson's Header) since a type's own name is never meant to be
  changed after the type is defined.
- **`struct MiniTypeInfo MiniObject_Type = { "MiniObject" };`** — a
  global variable declaration, from this lesson's Header: written
  outside of any function, at the top level of the file, so it exists
  for the entire program's run and is reachable from `main` later. `=
  { "MiniObject" }` is the struct initializer from this lesson's
  Header: it sets `MiniObject_Type`'s one field, `name`, to the string
  literal `"MiniObject"` in the same line the variable is declared,
  rather than needing a separate `MiniObject_Type.name = "MiniObject";`
  statement afterward.
- **`struct MiniTypeInfo *type;`** (inside `MiniObjectHeader`) — a new
  field using the pointer declaration syntax from Lesson 2: `type`
  doesn't hold a `MiniTypeInfo` directly, it points at one — specifically,
  in this project, always the one shared `MiniObject_Type` global,
  though nothing about the field's own declaration forces that; a
  future, different kind of `MiniObject`-like struct could point its own
  `type` field at a different `MiniTypeInfo` instead.
- **`thing->header.type = &MiniObject_Type;`** — chained member access,
  from this lesson's Header, reaching `type` through `thing->header`,
  exactly the same pattern this lesson's first unit used for
  `refcount`. The address-of operator (Lesson 1), applied here to the
  global `MiniObject_Type`, produces the pointer this field's
  declaration requires.
- **`printf("thing's type is called: %s\n", thing->header.type->name);`**
  — this expression reaches three levels deep in one line:
  `thing->header` (arrow, Lesson 2) reaches the embedded header; `.type`
  (plain dot, Lesson 1) reaches the type pointer inside it; `->name`
  (arrow again, since `type` is itself a pointer) reaches the actual
  name field inside the `MiniTypeInfo` that pointer points at. `%s`,
  from this unit's own isolated lab, tells `printf` to read and print
  that field as a C string.

### Execution Trace

No loop or recursion in this unit's own changes either; same
straight-through sequence, one new field set and immediately read back,
same as every other addition in this lesson.

### CS Lens

Giving every instance of a kind of thing a pointer back to a shared
description of that kind — rather than duplicating what "being that
kind" means inside every single instance — is a foundational idea in
how types themselves are represented at runtime, in any language that
lets you ask what type something is while a program is running.

```
Also recognized in: every Python object's own real __class__ attribute,
which is this exact mechanism, made visible directly in the language;
Java and C#'s runtime type information (RTTI), used by instanceof and
similar checks; a database row's foreign key pointing back at one
shared row in a lookup table, rather than repeating that lookup row's
data in every referencing row; and C++ and Java's virtual method
tables, which are, at their core, exactly this same "instance points at
shared type-level data" idea, extended to also include which functions
to call.
```

### SE Lens

The design principle is **separating per-instance data from
per-type data, and sharing the latter** rather than duplicating it.
The alternative not chosen: giving every single `MiniObject` its own
private copy of its type's name, stored directly inside each object
struct — which would work for exactly one field like a name, but
completely fails to scale once a "type" needs to carry more than a
name (methods, size information, behavior — everything CPython's real
`PyTypeObject` actually holds). The real tradeoff of the shared-pointer
approach this unit builds instead: every object now needs one extra
pointer's worth of memory to reach its type, and every access to type
information costs one extra pointer dereference compared to having the
data sitting directly in the object — a real, if small, cost, paid on
every single object, in exchange for type-level data that only ever
needs to exist once no matter how many instances of that type get
created. This project's `MiniTypeInfo` is currently carrying real debt
in the other direction: it only stores a name, while CPython's actual
`PyTypeObject` — referenced in this lesson's Header but not yet opened
— carries far more, including the very machinery this curriculum's
`incref_thing`/`decref_thing` currently hardcode by hand instead of
looking up through the type the way real CPython does.

### Commands Needed

No new commands — `gcc -Wall -o mini_object mini_object.c` and
`./mini_object`, unchanged since Lesson 1.

### Run It

Actually compiled and run this session, not predicted:

```
$ gcc -Wall -o mini_object mini_object.c
$ ./mini_object
thing->value = 99
thing lives at address 0x55ff4f8662a0
&thing->header lives at address 0x55ff4f8662a0
refcount starts at 1
thing's type is called: MiniObject
refcount after one incref_thing call: 2
refcount after two more calls: 4
refcount before releases: 4
refcount after three releases: 1
thing has now been freed
thing is now (nil)
```

`thing's type is called: MiniObject` confirms the entire three-level
chained access — `thing->header.type->name` — resolved correctly,
reading all the way from `thing`'s own address, through its embedded
header, through that header's type pointer, into the shared
`MiniObject_Type` global's own `name` field, and back out through
`%s`. Every other line matches this lesson's first unit and Lesson 3
exactly, confirming the new `type` field didn't disturb the
already-working refcounting machinery at all.

### Connecting to What Came Before

The previous unit proved that `MiniObjectHeader`, embedded first, lets
`incref_thing` and `decref_thing` operate generically on just the
counting logic. This unit gave that same header a second, equally
generic piece of shared machinery — a type pointer — completing, for
the first time in this curriculum, a header struct with the same two
fields, in the same order, that this lesson's own quoted `PyObject`
struct actually has: a reference count, then a type pointer, and
nothing else.

---

## Connect the Pieces

Follow one value — `thing`'s own address — through everything this
lesson built, start to finish, to see how it's now reachable through
several different, equally valid paths:

1. The first unit proved, on a throwaway `Wrapped`/`Header` pair, that
   an embedded struct's address is identical to its containing struct's
   own address — real output confirmed `&w` and `h` printing the exact
   same value.
2. That proof was applied to the real project: `thing`'s own address
   and `&thing->header`'s address were printed side by side, and real
   output confirmed them identical — `0x555df08712a0`, both times —
   meaning `incref_thing` and `decref_thing`, now written to accept
   only `struct MiniObjectHeader *`, work correctly on `thing` without
   ever needing to know `MiniObject` exists at all.
3. The second unit proved, on a throwaway C string, that `const char *`
   plus a string literal plus `%s` correctly stores and prints text —
   real output confirmed `name = MiniObject`.
4. That proof was applied to the real project: a new, shared
   `MiniObject_Type` global was created once, and `thing->header.type`
   was pointed at it — real output confirmed `thing's type is called:
   MiniObject`, reached through a three-level chain starting from
   `thing` itself.
5. Every refcounting behavior this lesson built on top of Lesson 3's
   already-working lifecycle — increment, decrement, free-at-zero,
   null-after-free — ran identically to Lesson 3's own output, proving
   this entire lesson's restructuring changed *how* `thing`'s fields are
   reached, without changing *what* the program actually does.

`MiniObjectHeader` now has exactly the same two fields, in the same
order, as this lesson's own quoted real `PyObject` struct: a reference
count, then a type pointer. But this lesson's own SE Lens already
named the gap that remains: reference counting alone still can't handle
two objects that reference each other, since neither one's count can
ever reach zero while the other still holds it. Lesson 5 pauses the
refcounting thread to open up what a real `type` actually is and does
in CPython — `PyTypeObject`, the struct `thing->header.type` currently
only points at a tiny stand-in for — before Lesson 6 finally builds two
real `MiniObject`s that reference each other on purpose, and watches
reference counting fail to free either one.
