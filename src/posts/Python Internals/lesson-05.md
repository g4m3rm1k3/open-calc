# Lesson 5: What Kind of Object Is This

**What you will build:** `MiniTypeInfo` gains a second field — a
pointer to a function that knows how to destroy a `MiniObject` — and
`decref_thing` stops calling `free` directly, calling through that
function pointer instead. The working feature: the exact same program
behavior as Lesson 4, but reached through a genuinely different,
type-driven path. The transferable problem this lesson is actually
about: `decref_thing`, as Lesson 3 and 4 left it, assumes every object
it will ever be handed only needs a plain `free` to be destroyed. That's
already false in real CPython — a Python `list` has to release every
item it holds before freeing itself; a file object has to close its
underlying file handle first. CPython's real answer isn't a bigger `if`
statement inside `Py_DECREF` for every possible kind of object — it's
letting each *type* supply its own destruction logic, and having
`Py_DECREF` call through it generically. This lesson builds that exact
mechanism, in miniature, using CPython's own real `tp_dealloc` field as
its model.

**What you need to know first:** Lesson 1 (`struct`, compiling), Lesson
2 (pointers, `->`), Lesson 3 (`malloc`, `free`, `if`), and Lesson 4
(struct embedding, the `MiniObjectHeader`/`MiniTypeInfo` split, chained
member access).

**Terms used in this lesson**

- **function pointer** — a variable that holds the address of a
  function, rather than the address of ordinary data, and can be called
  through, just like calling the function by its own name directly. It
  exists because sometimes the *specific* function to run isn't known
  until the program is already running — this lesson's `decref_thing`
  needs to call a different destruction routine depending on which
  type of object it's holding, and a function pointer is what lets it
  decide that at runtime instead of at compile time.
- **function pointer declaration syntax (`return_type (*name)(param_types)`)**
  — the specific, admittedly unusual-looking syntax C uses to declare a
  function pointer: parentheses around `*name` are required, because
  without them, `return_type *name(param_types)` would instead declare
  a *function* named `name` that *returns* a pointer — a completely
  different meaning. It exists as the one syntax C provides for
  expressing "a variable that points at a function shaped like this,"
  and the parentheses are the one detail that makes that reading
  unambiguous to the compiler.
- **forward declaration** — writing `struct SomeName;` on its own,
  with no field list and no `{ }` body, before that struct is fully
  defined elsewhere later in the file. It exists because a pointer to a
  struct doesn't need to know that struct's full size or field list to
  exist — only code that actually reads or writes the struct's fields
  does — so C allows a struct's *name* to be introduced early, letting
  a pointer to it be declared, with the full definition following
  later, once it's needed.

**Objects and methods used**

- **`tp_dealloc`**
  - *What it is:* the real field inside CPython's own type-descriptor
    struct, `PyTypeObject`, that holds a function pointer to the
    specific destruction routine for objects of that type.
  - *Implementation:* quoted verbatim, from `Include/cpython/object.h`
    in CPython's `v3.12.7` tag — the opening fields of the real struct,
    trimmed after the fields relevant to this lesson (`PyTypeObject`
    has dozens more fields beyond this point, covering behavior this
    curriculum hasn't reached yet):
    ```c
    struct _typeobject {
        PyObject_VAR_HEAD
        const char *tp_name; /* For printing, in format "<module>.<name>" */
        Py_ssize_t tp_basicsize, tp_itemsize; /* For allocation */

        /* Methods to implement standard operations */

        destructor tp_dealloc;
        Py_ssize_t tp_vectorcall_offset;
        getattrfunc tp_getattr;
        setattrfunc tp_setattr;
        /* ...many more fields, not shown here... */
    };
    ```
    `PyObject_VAR_HEAD` is `PyTypeObject`'s own embedded header — the
    same struct-embedding pattern Lesson 4 built by hand, since a type
    is itself a Python object (this lesson's own Header note on
    `PyObject`, from Lesson 4, still applies: every Python object,
    types included, starts with a reference count and a type pointer).
    `tp_name`, from CPython's own real source, is this curriculum's
    real counterpart to `MiniTypeInfo`'s `name` field, built in Lesson
    4. `destructor` is CPython's own real function pointer type, defined
    elsewhere in the same header (already quoted in Lesson 2's own
    Header) as `typedef void (*destructor)(PyObject *);` — a function
    pointer type, using the exact declaration syntax this lesson's own
    isolated lab teaches, describing any function that takes one
    `PyObject *` and returns nothing.
  - *Its use:* this lesson's own `MiniTypeInfo.dealloc` field, built in
    this lesson's second Concept Unit, is a deliberately smaller version
    of exactly this field — same idea (a type carries its own
    destruction function), without the dozens of other fields real
    `PyTypeObject` also carries.
  - *Type:* a struct field, of function pointer type — not a function
    itself, a variable that can hold the address of one.
  - *Responsibility:* to let each individual type supply its own,
    correct way of tearing an instance of itself down — the complete
    job, not just "point at some cleanup code." Per the real Python
    C-API documentation itself: *"If the reference count reaches zero,
    the object's type's deallocation function (which must not be NULL)
    is invoked."*
  - *Depends on:* being set, once, when a type is defined — every real
    CPython type sets its own `tp_dealloc` as part of its own type
    definition, the same way this lesson's own `MiniObject_Type` sets
    its `dealloc` field once, in this lesson's second Concept Unit.
  - *Connects to:* read and called through by CPython's real
    `_Py_Dealloc` function — the same function `Py_DECREF`, quoted in
    Lesson 3's Header, calls the moment a reference count reaches zero
    — which reads `tp_dealloc` off the object's own type (found via
    `Py_TYPE`, quoted in Lesson 4's Header) and calls through it,
    exactly the pattern this lesson's own `decref_thing` is rebuilt to
    follow in this lesson's second Concept Unit.
  - *Shape:* the field itself holds one function pointer; the function
    it points at takes one object pointer in, and returns nothing —
    its whole effect is destroying the object it's given, however that
    specific type needs that done.

---

## Concept Unit: Storing a Function to Call Later

### The Problem

Every function this curriculum has called so far — `printf`, `malloc`,
`free`, `incref_thing`, `decref_thing` — has been called by typing its
name directly, fixed in the source code, decided once and for all at
compile time. `decref_thing`'s own call to `free`, from Lesson 3, is
exactly that: no matter what `thing` actually is, `decref_thing` always
calls the one, same, hardcoded `free`. But different types of objects
need genuinely different destruction logic — nothing about `decref_thing`
as currently written could ever call a *different* function depending on
what it's handed.

Before reading on: if the *specific* function to call needs to change
depending on some value only known while the program is running — not
something fixed at compile time — what would a variable that could hold
"which function to call" even need to look like? Given that Lesson 2
already showed a variable can hold the address of a piece of data, do
you think a variable could hold the address of a *function* instead?

### Isolating the Concept

```c
#include <stdio.h>

void greet(void) {
    printf("hello from greet\n");
}

int main(void) {
    void (*fn)(void) = greet;
    fn();
    return 0;
}
```

Actually compiled and run:

```
$ gcc -Wall -o lab10_funcptr lab10_funcptr.c
$ ./lab10_funcptr
hello from greet
```

`void (*fn)(void) = greet;` declares `fn` using the function pointer
declaration syntax from this lesson's Header: `void` (Lesson 1's own
"no value" type, here naming this function pointer's return type),
`(*fn)` (the parentheses are required, exactly as this lesson's Header
warns — without them, this would declare a function, not a pointer to
one), and `(void)` (this function pointer's parameter list — takes
nothing, matching `greet`'s own declaration). `greet`, written with no
parentheses after it, refers to the function itself, not a call to
it — the same distinction between "a function's address" and "calling
that function" that this unit's own proof depends on. `fn();` then
calls *through* the pointer: real output confirms `greet`'s own body
ran, printing `hello from greet`, even though the code never wrote
`greet();` directly — it only ever wrote `fn();`, and `fn` happened to
be holding `greet`'s address. This is called a **function pointer**: a
variable that holds a function's address, which can be called through
exactly as if it were the function's own name — and, critically, which
different code paths could point at *different* functions, decided
while the program runs rather than fixed when it's compiled.

This throwaway example is now **discarded** — `lab10_funcptr.c` and
`greet` will not appear in this lesson's real project. What it proved —
that a function pointer, once holding a real function's address, can be
called through with the same `()` syntax as calling that function
directly — is exactly the mechanism `decref_thing` needs next, to stop
hardcoding `free` and instead call whatever destruction function a
given object's own type says to use.

### Project Change

- **Reference Source** — No reference counterpart for function pointers
  themselves (general C syntax). The real counterpart for what this
  mechanism is about to be used for — a type carrying its own
  destruction function — is `tp_dealloc`, quoted in full in this
  lesson's Header, from `Include/cpython/object.h` in CPython's
  `v3.12.7` tag.
- **Files affected** — none yet; this unit's real project work is in
  the next Concept Unit, once there's a real destruction function to
  point at.
- **Change type** — n/a for this unit.
- **Location** — n/a for this unit.
- **Dependencies** — n/a for this unit.

### Connecting to What Came Before

Every pointer this curriculum has built until now has pointed at data —
a plain `int` (Lesson 2), a `struct MiniObject` (Lesson 3), a nested
`struct MiniObjectHeader` (Lesson 4). This unit is the first time a
pointer has pointed at *code* instead. The next unit puts that
difference to real use, giving `MiniTypeInfo` a function pointer field
of its own.

---

## Concept Unit: Giving a Type Its Own Cleanup Function

### The Problem

`decref_thing`, as Lesson 4 left it, still calls `free(op)` directly,
hardcoded, the moment `op->refcount` reaches zero. That's only correct
because `MiniObject`, so far, has never needed anything more elaborate
than a plain `free` to destroy it. A real object type might need to do
more first — but nothing in `decref_thing`'s current code has any way
to know that, or to do it differently for a different kind of object.

Before reading on: given this lesson's first unit proved a function
pointer can be called through generically, without `decref_thing` ever
needing to know the specific function's name — where do you think that
function pointer should actually be *stored*, so that `decref_thing`
can find the right one for whatever object it's currently holding?
(Lesson 4 already gave every object a way to reach its own type — does
that suggest an answer?)

### Isolating the Concept

This unit does not need a fresh isolated lab of its own: the mechanism
it depends on — declaring a function pointer and calling through it —
was already proven for real in this lesson's first unit's own isolated
lab, `lab10_funcptr.c`, above. What's new here is *where* that pointer
lives (inside a struct, as a field, rather than as a standalone local
variable) and *how* it gets called (through a chain of struct accesses,
rather than by its own bare name) — both of which this unit's own
Mechanical Walkthrough, below, explains directly against the real
project code, per this schema's own allowance for reusing an already-
proven mechanism's isolated proof rather than re-deriving it from
nothing.

### Project Change

- **Reference Source** — `Include/cpython/object.h`, CPython `v3.12.7`
  tag, the `tp_dealloc` field inside `struct _typeobject`, quoted in
  full in this lesson's Header. `mini_object_dealloc`, built in this
  unit, is this project's real counterpart to a specific type's own
  `tp_dealloc` function — the kind of function CPython's own
  `list_dealloc`, `dict_dealloc`, and every other built-in type's own
  destruction routine actually are, in real CPython source this
  curriculum hasn't opened.
- **Files affected** — `project/lesson-05/mini_object.c`, modified
  (copied forward from Lesson 4's finished `mini_object.c`).
- **Change type** — add (`struct MiniObjectHeader;` forward
  declaration; a `dealloc` field on `MiniTypeInfo`; a new
  `mini_object_dealloc` function) and refactor (`MiniObject_Type`'s
  initializer gains a second value; `decref_thing`'s `free(op);` call
  becomes `op->type->dealloc(op);`).
- **Location** — the forward declaration goes above `struct
  MiniTypeInfo`'s existing definition; the new `dealloc` field goes
  inside `MiniTypeInfo`, after `name`; `mini_object_dealloc` is defined
  between `MiniTypeInfo`'s definition and `MiniObject_Type`'s own
  declaration, since the initializer needs to refer to it;
  `decref_thing`'s existing `if` block, inside its existing body, has
  its one line changed.
- **Dependencies** — none beyond what Lesson 4 already established.

### The New Code

```c
struct MiniObjectHeader;

struct MiniTypeInfo {
    const char *name;
    void (*dealloc)(struct MiniObjectHeader *);
};
```

```c
void mini_object_dealloc(struct MiniObjectHeader *op) {
    free(op);
}

struct MiniTypeInfo MiniObject_Type = { "MiniObject", mini_object_dealloc };
```

```c
op->type->dealloc(op);
```

### The Updated Project

```c
 1  #include <stdio.h>
 2  #include <stdlib.h>
 3
 4  struct MiniObjectHeader;                                    // ← new
 5
 6  struct MiniTypeInfo {
 7      const char *name;
 8      void (*dealloc)(struct MiniObjectHeader *);             // ← new
 9  };
10
11  void mini_object_dealloc(struct MiniObjectHeader *op) {     // ← new
12      free(op);                                                // ← new
13  }                                                             // ← new
14
15  struct MiniTypeInfo MiniObject_Type =
16      { "MiniObject", mini_object_dealloc };                   // ← changed initializer
17
18  struct MiniObjectHeader {
19      long refcount;
20      struct MiniTypeInfo *type;
21  };
22
23  struct MiniObject {
24      struct MiniObjectHeader header;
25      long value;
26  };
27
28  void incref_thing(struct MiniObjectHeader *op) {
29      op->refcount++;
30  }
31
32  void decref_thing(struct MiniObjectHeader *op) {
33      op->refcount--;
34      if (op->refcount == 0) {
35          op->type->dealloc(op);                               // ← changed (was free(op);)
36      }
37  }
38
39  int main(void) {
40      struct MiniObject *thing = malloc(sizeof(struct MiniObject));
41      thing->header.refcount = 1;
42      thing->header.type = &MiniObject_Type;
43      thing->value = 99;
44
45      printf("thing->value = %ld\n", thing->value);
46      printf("thing's type is called: %s\n", thing->header.type->name);
47      printf("refcount starts at %ld\n", thing->header.refcount);
48
49      incref_thing(&thing->header);
50      incref_thing(&thing->header);
51      incref_thing(&thing->header);
52      printf("refcount after three incref_thing calls: %ld\n", thing->header.refcount);
53
54      decref_thing(&thing->header);
55      decref_thing(&thing->header);
56      decref_thing(&thing->header);
57      printf("refcount after three releases: %ld\n", thing->header.refcount);
58
59      decref_thing(&thing->header);
60      printf("thing has now been freed, through its own type's dealloc function\n");
61      thing = NULL;
62      printf("thing is now %p\n", (void *)thing);
63
64      return 0;
65  }
```

`decref_thing` (lines 32–37) no longer knows what "destroying" an
object actually means — it only knows to ask that object's own type
(line 35). `MiniObject_Type` (lines 15–16) is now the one place that
actually says what destroying a `MiniObject` involves: calling
`mini_object_dealloc` (lines 11–13), which, for now, is still just a
plain `free` — but reached through a completely different, generic
path than Lesson 4's direct call.

### Mechanical Walkthrough

- **`struct MiniObjectHeader;`** — the forward declaration from this
  lesson's Header: introduces the name `MiniObjectHeader` without its
  full field list, which is all `MiniTypeInfo`'s new `dealloc` field
  needs, since a function pointer's parameter type only needs to be
  known well enough to form a pointer to it, not to read or write its
  actual fields. Without this line, the compiler would reject
  `MiniTypeInfo`'s `dealloc` field outright, since `struct
  MiniObjectHeader` wouldn't have been introduced yet at that point in
  the file — `MiniObjectHeader`'s own full definition still comes
  later, unchanged from Lesson 4, once code that actually needs its
  fields (like `incref_thing`) requires it.
- **`void (*dealloc)(struct MiniObjectHeader *);`** — a new field on
  `MiniTypeInfo`, using the function pointer declaration syntax from
  this lesson's first unit: a pointer to a function taking one `struct
  MiniObjectHeader *` and returning nothing, exactly mirroring the real
  `destructor` type quoted in this lesson's Header (`typedef void
  (*destructor)(PyObject *);`), with `MiniObjectHeader` standing in for
  `PyObject`.
- **`void mini_object_dealloc(struct MiniObjectHeader *op) { free(op); }`**
  — an ordinary, freestanding function, declared exactly the shape
  `MiniTypeInfo`'s new `dealloc` field expects. Its body is the exact
  line `decref_thing` used to run directly (Lesson 3's `free(op);`) —
  moved here, into its own named function, so it can be pointed at
  rather than called by name from inside `decref_thing` itself.
- **`{ "MiniObject", mini_object_dealloc }`** — the struct initializer
  from Lesson 4, now with a second value: `mini_object_dealloc`,
  written with no parentheses after it — exactly like `greet` in this
  lesson's own isolated lab — referring to the function itself, not
  calling it, so its address is what actually gets stored into
  `MiniObject_Type`'s `dealloc` field.
- **`op->type->dealloc(op);`** — chained member access, from Lesson 4,
  reaching two levels deep and then calling through the result: `op->type`
  (arrow, Lesson 2, reaching the type pointer stored in the header)
  gives a `struct MiniTypeInfo *`; `->dealloc` (arrow again, since
  `type` is itself a pointer) reaches the function pointer field inside
  that type; the trailing `(op)` calls through that function pointer,
  exactly as `fn();` called through `fn` in this lesson's first unit's
  isolated lab — except this call also passes an argument, `op` itself,
  matching `dealloc`'s own declared parameter.

### Execution Trace

No loop or recursion in this unit's changes; the same straight-through
sequence of statements from every previous lesson, reached through one
more level of indirection than before. No `Iteration N:` trace is
needed for the same reason already stated in Lessons 1 through 4.

### CS Lens

Letting each different "kind" of thing supply its own version of a
shared operation, called generically through a pointer without the
caller needing to know which specific version it's actually running, is
one of the most consequential ideas in how software is built to handle
variety without an ever-growing pile of `if` statements checking every
possible case by hand.

```
Also recognized in: every virtual method call in C++ or Java, which is
this exact mechanism under a different name (a vtable of function
pointers instead of a single named field); a GUI button's onClick
handler, which the button-drawing code calls without ever knowing what
specific action it triggers; an operating system's device driver
interface, where "write to this device" calls through a function
pointer supplied by whichever specific driver is actually installed;
and Python's own method dispatch — when you call obj.some_method(), the
interpreter is, at its core, looking up and calling through a function
pointer found via that object's own type, the exact same shape this
lesson's decref_thing now uses.
```

### SE Lens

The design principle is **depending on a general capability instead of
a specific implementation** — `decref_thing` now depends only on "the
object's type has *some* dealloc function," never on which one. The
alternative not chosen: keeping `free(op)` hardcoded inside
`decref_thing`, and, if a second kind of object ever needed different
cleanup, adding an `if` there checking which type it is and branching
to different cleanup code per type. That alternative is simpler to
write for exactly one type, the way this project had it through Lesson
4 — but it means every single new kind of object this project ever adds
would require going back and editing `decref_thing` itself, forever,
to add one more branch. The real tradeoff of this unit's approach
instead: one extra pointer dereference and one extra indirect call per
destruction (a real, if small, runtime cost), in exchange for
`decref_thing` never needing to change again no matter how many
different kinds of objects this curriculum eventually builds — each new
type just needs to supply its own `dealloc` function and point its own
`MiniTypeInfo` at it. This project isn't carrying any debt from this
choice currently; the real cost worth naming honestly is the one this
lesson's CS Lens already implies: an indirect call through a function
pointer is measurably slower, at the machine-instruction level, than a
direct call to a fixed function, precisely because the CPU can't always
predict in advance which function it's about to jump to — a real,
well-documented cost real CPython accepts throughout its own source in
exchange for exactly this same flexibility.

### Commands Needed

No new commands — `gcc -Wall -o mini_object mini_object.c` and
`./mini_object`, unchanged since Lesson 1.

### Run It

Actually compiled and run this session, not predicted:

```
$ gcc -Wall -o mini_object mini_object.c
$ ./mini_object
thing->value = 99
thing's type is called: MiniObject
refcount starts at 1
refcount after three incref_thing calls: 4
refcount after three releases: 1
thing has now been freed, through its own type's dealloc function
thing is now (nil)
```

Every value matches Lesson 4's own run exactly — the reference count
still climbs to `4` and settles back through `1` to `0`, and `thing`
still ends as `(nil)` — confirming this entire lesson changed *how*
`thing` gets destroyed, through a genuinely different, generic path,
without changing anything about *when* it gets destroyed or what the
program's final state is.

### Connecting to What Came Before

The previous unit proved, in isolation, that a function pointer can be
called through generically. This unit put that proof to work exactly
where Lesson 4 left a real gap: `decref_thing` no longer needs to
assume every object it will ever destroy only needs a plain `free` —
it asks that object's own type instead, the same real design CPython's
own `tp_dealloc` field uses for every single one of its own built-in
types.

---

## Connect the Pieces

Follow the act of destroying `thing`, start to finish, comparing this
lesson's path to Lesson 4's:

1. Lesson 4 left `decref_thing` calling `free(op)` directly, the moment
   `op->refcount` reached zero — one function, hardcoded, with no way to
   ever be anything else for any future kind of object.
2. This lesson's first unit proved, on a throwaway `greet` function,
   that a function pointer can be called through with the same syntax
   as calling the function directly — real output confirmed `hello from
   greet` printed through `fn()`, never through `greet()` directly.
3. This lesson's second unit gave `MiniTypeInfo` a `dealloc` field of
   exactly that shape, and moved the actual `free(op);` call into its
   own function, `mini_object_dealloc`, pointed at by
   `MiniObject_Type`'s own initializer.
4. `decref_thing`'s one line changed from `free(op);` to
   `op->type->dealloc(op);` — reaching, at the moment `thing`'s count
   hit zero, through `op`'s header, to its type, to that type's own
   destruction function, and calling through it.
5. Real output confirmed the entire program's behavior stayed
   identical to Lesson 4's — same refcount values, same final `(nil)` —
   proving this lesson changed the *mechanism* of destruction without
   changing its *outcome*.

`MiniObject_Type` now carries the same two real fields CPython's own
`PyTypeObject` opens with — a name, and a destruction function — quoted
directly from `Include/cpython/object.h` in this lesson's Header. But
this lesson's own CS Lens already flagged the harder problem still
waiting: reference counting, even with a fully generic destruction
mechanism now in place, still cannot free two objects that hold
references to *each other*, since neither one's count can ever reach
zero while the other still holds it. Lesson 6 builds exactly that
situation on purpose — two real `MiniObject`s, each pointing at the
other — and watches this entire, correctly-built lifecycle machinery
fail to free either one.
