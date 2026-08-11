# Lesson 85: Bundling Data Without a Class — `struct`

**What you will build:** a `struct Person` bundling related fields
together, a real, measured demonstration of struct memory padding, a
hand-built linked-list node using a self-referencing struct pointer,
and proof that structs — like everything else in C — are passed by
value unless a pointer is used deliberately. The transferable insight:
every Python class built across this curriculum (`TreeNode`, `Node`,
`HashTable`) bundled data *and* behavior (methods) together. A C
`struct` bundles only data — no methods, no encapsulation, nothing
enforcing how it's used — and this lesson is about exactly what that
gap means in practice, concretely, not abstractly.

**What you need to know first:** Lesson 82 (pointers) — struct pointers
and the `->` operator this lesson introduces are a direct, small
extension of `*` and `&`, already established. Lesson 68 (linked list)
— this lesson rebuilds that exact structure, `Node` and all, in C,
making explicit what Python's class-based version was quietly doing
with references all along.

---

## Concept Unit: The Problem — Related Data, No Bundle

### The Problem

Without some way to group related fields together, related data ends
up scattered across separate, independently-managed containers — and
nothing stops those containers from silently falling out of sync with
each other.

### The New Code

```python
names = ["Alice", "Bob", "Carol"]
ages = [30, 25, 35]

# swap Bob and Carol's ages by mistake -- only updating ONE array
ages[1], ages[2] = ages[2], ages[1]
# ...forgot to also swap names[1] and names[2] to match

for i in range(len(names)):
    print(f"{names[i]}: {ages[i]}")
```

### Run It

```
Alice: 30
Bob: 35
Carol: 25
Bob's age is now wrong -- nothing enforced these two arrays staying in sync.
```

A real, easy mistake: swapping one array's entries while forgetting
the other, silently producing a wrong pairing with no error anywhere.
Discarded now — the rest of this lesson builds the actual fix: a
single structure holding both pieces of data together, so there's
nothing separate left to desynchronize.

### CS Lens

Grouping related fields into a single unit, so operations on "one
thing" (a person, a point, a record) naturally move all its data
together, is worth naming as a real design principle even before any
C syntax appears: cohesion. Also recognized in: a database row
(columns bundled per record, not stored as separate parallel columns
managed by hand), Lesson 68's own `Node` class (bundling `.value` and
`.next` so they always travel together), and every Python class this
curriculum has built, all of which solved exactly this problem using
a mechanism (a class) that also happens to bundle in behavior — the
distinction this lesson's `struct` deliberately does not make.

---

## Concept Unit: `struct` — Declaring and Using a Bundle

### The Problem

C needs a way to define a new, named type that groups several fields
together under one variable, accessible by name rather than by
position in a separate array.

### Project Change

- **Reference Source:** No reference counterpart — first C-only
  aggregate-data concept in this curriculum.
- **Files affected:** `struct_demo.c` (new file).
- **Change type:** add.
- **Location:** n/a — brand-new file.
- **Dependencies:** `string.h` (for `strcpy`).

### The New Code

```c
#include <stdio.h>
#include <string.h>

struct Person {
    char name[32];
    int age;
};

int main() {
    struct Person alice;
    strcpy(alice.name, "Alice");
    alice.age = 30;

    printf("name: %s\n", alice.name);
    printf("age: %d\n", alice.age);

    struct Person bob = {"Bob", 25};   // initialize all fields at once
    printf("name: %s, age: %d\n", bob.name, bob.age);

    return 0;
}
```

### Run It

```
name: Alice
age: 30
name: Bob, age: 25
```

### Mechanical Walkthrough

- `struct Person { char name[32]; int age; };` — **first appearance
  of a struct declaration.** Defines a new type, `struct Person`,
  bundling a fixed-size character array (a C string, per Lesson 84 —
  32 bytes, enough room for a name plus its terminator) and an
  integer, under one name. This declaration alone reserves no memory
  at all — it's a blueprint, exactly like a Python class definition
  reserves no memory until an instance is created.
- `struct Person alice;` — **first appearance of instantiating a
  struct.** Declares a real variable, `alice`, of type `struct
  Person` — this line *does* reserve real memory, enough to hold both
  fields, contiguous, on the stack (already-established from Lesson
  83).
- `strcpy(alice.name, "Alice");` — **first appearance of the dot
  operator (`.`) for field access.** `alice.name` refers to the
  `name` field specifically inside this specific `alice` variable.
  `strcpy`, not plain assignment, is required here — reappearing
  directly from Lesson 84: `alice.name` is a fixed-size array, and
  arrays can't be assigned with `=` after declaration in C, only
  initialized at the moment of declaration (shown next) or copied into
  byte-by-byte, which is exactly what `strcpy` does.
- `alice.age = 30;` — ordinary assignment works fine here, because
  `age` is a plain `int`, not an array.
- `struct Person bob = {"Bob", 25};` — **first appearance of struct
  literal initialization.** Fields are set in declaration order,
  positionally, all at once — no separate assignment statements
  needed, and — unlike the `alice` example — the string literal
  `"Bob"` can be used directly here because this is *initialization*
  (happening once, at declaration), not a later assignment to an
  already-existing array.

### CS Lens

A named, fixed collection of differently-typed fields, accessed by
name, is called a **record** in general computer-science terminology
— `struct` is C's specific implementation of that idea. Also
recognized in: a database schema's row definition, a JSON object's
keys (a much more flexible, dynamically-typed cousin of the same
concept), and — precisely — every Python class's `__init__`-assigned
attributes, minus the methods.

---

## Concept Unit: `sizeof` and Struct Padding

### The Problem

It's tempting to assume a struct's total size is simply the sum of its
fields' individual sizes. This is often wrong, in a specific,
measurable way — worth proving directly rather than trusting the
assumption.

### The New Code

```c
#include <stdio.h>

struct Bad {
    char a;    // 1 byte
    int b;     // 4 bytes
    char c;    // 1 byte
};

struct Good {
    int b;     // 4 bytes
    char a;    // 1 byte
    char c;    // 1 byte
};

int main() {
    printf("sizeof(char): %zu\n", sizeof(char));
    printf("sizeof(int): %zu\n", sizeof(int));
    printf("naive expectation for struct Bad: 1 + 4 + 1 = 6 bytes\n");
    printf("sizeof(struct Bad):  %zu bytes\n", sizeof(struct Bad));
    printf("sizeof(struct Good): %zu bytes\n", sizeof(struct Good));
    return 0;
}
```

### Run It

```
sizeof(char): 1
sizeof(int): 4
naive expectation for struct Bad: 1 + 4 + 1 = 6 bytes
sizeof(struct Bad):  12 bytes
sizeof(struct Good): 8 bytes
```

`struct Bad` — 1 byte, 4 bytes, 1 byte — "should" be 6 bytes by simple
addition. It's actually **12**. `struct Good` — the exact same three
fields, just declared in a different *order* — is **8** bytes. Same
data, same total useful information, genuinely different sizes,
purely from field ordering.

### Confirming Exactly Where the Extra Bytes Go

```c
#include <stdio.h>
#include <stddef.h>

struct Bad {
    char a;
    int b;
    char c;
};

int main() {
    printf("offsetof(a): %zu\n", offsetof(struct Bad, a));
    printf("offsetof(b): %zu\n", offsetof(struct Bad, b));
    printf("offsetof(c): %zu\n", offsetof(struct Bad, c));
    printf("total size:  %zu\n", sizeof(struct Bad));
    return 0;
}
```

```
offsetof(a): 0
offsetof(b): 4
offsetof(c): 8
total size:  12
```

`a` sits at byte `0` (1 byte used). `b` doesn't start until byte `4` —
**three bytes of padding** were inserted between `a` and `b`. `c`
starts at byte `8` (right after `b`'s 4 bytes) — but the struct's total
size is `12`, not `9` — **three more trailing padding bytes** after
`c`, to round the whole struct up to a multiple of its largest field's
size.

### Mechanical Walkthrough

- `offsetof(struct Bad, a)` — **first appearance of the `offsetof`
  macro**, from `stddef.h`. Computes exactly how many bytes into the
  struct a given field actually begins — a real, precise measurement
  tool for exactly the question this unit is asking, rather than
  guessing from `sizeof` alone.
- The padding itself exists because of **alignment**: most CPUs read
  multi-byte values (like a 4-byte `int`) fastest, or in some cases
  only correctly at all, when they start at a memory address that's a
  multiple of their own size. `char a` alone, sitting at byte `0`,
  would leave `b` starting at byte `1` if the compiler packed fields
  with no gaps — not a multiple of `4` — so the compiler inserts
  padding automatically, silently, to push `b` to byte `4` instead.
- `struct Good`'s field order — largest field (`int b`) first, then
  the two `char`s — avoids the *internal* padding entirely: `b` at
  byte `0` is already aligned; `a` and `c` (1 byte each, no alignment
  requirement beyond "any address") can sit immediately after with no
  gap needed between them. This is why simply reordering fields,
  changing nothing about what data is stored, measurably shrank the
  struct from 12 bytes to 8.

### CS Lens

A compiler inserting invisible extra space to satisfy hardware
alignment requirements, with no separate notification unless
specifically measured, is a real, common source of surprising memory
usage in systems programming — worth knowing exists, not just as
trivia. Also recognized in: database systems padding fixed-width
columns for the same alignment reasons, network protocol designers
deliberately ordering fields to minimize wasted bytes in a packet
header, and — a genuinely practical consequence — large arrays of
poorly-ordered structs (Lesson 85's own `struct Bad`, at scale)
measurably wasting real memory purely from field order, fixable with
zero change to the data actually being stored.

---

## Concept Unit: Self-Referencing Structs — Rebuilding `Node` in C

### The Problem

Lesson 68's linked list used a Python `Node` class holding `.value`
and `.next`, where `.next` could itself be another `Node`. Building the
same structure in C means a struct that contains a pointer to its own
type — worth confirming this actually works, and seeing exactly how.

### Project Change

- **Reference Source:** Lesson 68's Python `Node` class — this project
  is a direct C rebuild of that exact structure.
- **Files affected:** `linked_node.c` (new file).
- **Change type:** add (new language, same underlying structure).
- **Location:** n/a — brand-new file.
- **Dependencies:** `stdlib.h` (`malloc`/`free`, from Lesson 83).

### The New Code

```c
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node *next;
} Node;

int main() {
    Node *head = malloc(sizeof(Node));
    head->value = 10;
    head->next = malloc(sizeof(Node));
    head->next->value = 20;
    head->next->next = NULL;

    Node *current = head;
    while (current != NULL) {
        printf("%d -> ", current->value);
        current = current->next;
    }
    printf("NULL\n");

    free(head->next);
    free(head);
    return 0;
}
```

### Run It

```
10 -> 20 -> NULL
```

A real, working two-node linked list, traversed and printed correctly
— the exact same structural idea as Lesson 68's Python version, built
this time from raw memory the program explicitly manages.

### Mechanical Walkthrough

- `typedef struct Node { int value; struct Node *next; } Node;` —
  **first appearance of `typedef` combined with a struct declaration.**
  Two things happening at once, worth separating: `struct Node { ... }`
  declares the struct, exactly as before — note `struct Node *next;`
  *inside* the declaration, referring to `struct Node` by its full
  name, because at the point this line is parsed, the shorter alias
  doesn't exist yet. The trailing `Node` (after the closing `}`) is a
  `typedef`, creating `Node` as a shorter alias for `struct Node` —
  after this line, `Node` and `struct Node` can be used
  interchangeably, and the rest of this program uses the shorter form.
- `Node *head = malloc(sizeof(Node));` — **first appearance of
  allocating a struct on the heap.** `sizeof(Node)` correctly accounts
  for whatever the actual struct size is (including any padding from
  the previous unit) — the same `malloc` pattern from Lesson 83,
  applied to a struct instead of a plain array of `int`.
- `head->value = 10;` — **first appearance of the arrow operator
  (`->`).** `head` is a *pointer* to a `Node`, not a `Node` itself —
  `head.value` would be invalid (`.` only works on the struct itself,
  not a pointer to one); `->` is specifically defined as shorthand for
  "dereference, then access a field" — `head->value` means exactly
  `(*head).value`, just without needing the extra parentheses every
  time.
- `head->next = malloc(sizeof(Node)); head->next->value = 20;` —
  **first appearance of chained arrow access.** `head->next` is itself
  a `Node *` (a pointer to the second node); `head->next->value`
  dereferences *that* pointer's `value` field — the same chaining
  already familiar in spirit from Python's `node.next.value`, just
  spelled with `->` instead of `.` at every hop past the first.
- `head->next->next = NULL;` — the second node's own `next` pointer is
  explicitly set to `NULL`, marking the end of the list — the same
  sentinel-value idea already established (Lesson 68's own `None`,
  Lesson 72's sentinel nodes), here using C's `NULL` (a pointer whose
  value is literally address `0`, already encountered as the cause of
  Lesson 83's segfault).
- `while (current != NULL) { ...; current = current->next; }` —
  traversal, structurally identical to Lesson 68's own Python
  traversal loop, just walking real pointers instead of object
  references.
- `free(head->next); free(head);` — **first appearance of freeing a
  linked structure, one node at a time, in the correct order.** `head`
  must be freed *last* here — freeing it first would lose the only
  remaining reference to `head->next`, making the second node's memory
  permanently unreachable (exactly Lesson 83's leak failure mode,
  concretely relevant to any real linked structure in C).

### CS Lens

A struct containing a pointer to its own type is not a special case —
it's the exact same "recursive data structure" idea already named in
Lesson 71 for `TreeNode`, now proven to work identically in C, once
pointers (rather than a garbage-collected language's implicit
references) are the mechanism carrying the connection.

---

## What Breaks Without This — Structs Are Passed by Value, Too

### The Problem

Everything Lesson 82 proved about `swap` and pass-by-value applies to
structs exactly as much as to plain `int`s — worth confirming directly,
since a struct can feel like a bigger, more "object-like" thing that
might behave differently. It doesn't.

### The New Code — Broken

```c
#include <stdio.h>

struct Point {
    int x;
    int y;
};

void try_to_move(struct Point p) {
    p.x += 10;
    p.y += 10;
    printf("inside function: (%d, %d)\n", p.x, p.y);
}

int main() {
    struct Point origin = {0, 0};
    printf("before: (%d, %d)\n", origin.x, origin.y);
    try_to_move(origin);
    printf("after:  (%d, %d)\n", origin.x, origin.y);
    return 0;
}
```

### Run It

```
before: (0, 0)
inside function: (10, 10)
after:  (0, 0)
```

The exact same failure shape as Lesson 82's `broken_swap`: the
modification genuinely happens, inside the function, to a local copy —
and `main`'s `origin` is completely untouched, because `struct Point p`
as a parameter means the *entire struct* was copied, field by field,
into `p`, exactly as `int a` copied a single value in Lesson 82.

### The Fix — Pass a Pointer

```c
#include <stdio.h>

struct Point {
    int x;
    int y;
};

void move(struct Point *p) {
    p->x += 10;
    p->y += 10;
    printf("inside function: (%d, %d)\n", p->x, p->y);
}

int main() {
    struct Point origin = {0, 0};
    printf("before: (%d, %d)\n", origin.x, origin.y);
    move(&origin);
    printf("after:  (%d, %d)\n", origin.x, origin.y);
    return 0;
}
```

```
before: (0, 0)
inside function: (10, 10)
after:  (10, 10)
```

Identical fix to Lesson 82's `real_swap`: pass `&origin` (the struct's
address) instead of `origin` (a copy of its contents); the parameter
type becomes `struct Point *`; every field access inside the function
switches from `.` to `->`. `main`'s `origin` is genuinely modified this
time.

### CS Lens

This is worth stating as a direct, quotable rule, now proven twice
(once with `int`s in Lesson 82, once with a whole `struct` here): in C,
*everything* is pass by value, with no exceptions — a struct, however
large, is copied field-by-field on every by-value function call. The
*only* way to avoid that copy, or to let a function modify a caller's
struct, is to pass a pointer explicitly — never automatic, never
implicit, always a deliberate choice visible right in the function
signature.

## Exercises

- Add a third field to `struct Bad` from the padding unit (another
  `char`, or a `short`) and predict, then measure, the new `sizeof`
  before running it — confirm or correct your prediction against the
  real compiler output.
- Extend `linked_node.c` into a small, real `push_front` /
  `print_list` pair of functions operating on `Node *`, mirroring
  Lesson 68's own linked-list interface, this time in C.
- Write a struct `Rectangle` with `width` and `height` fields, and an
  `area` function that takes a `const struct Rectangle *` (read-only
  pointer, reappearing Lesson 84's `const` from `my_strlen`) — confirm
  the compiler rejects any attempt to modify the rectangle inside that
  function.
- Research **bit-fields** (`struct { unsigned int flag : 1; };`) as an
  alternative way to pack multiple small values tightly into a struct,
  trading some access speed for guaranteed minimal size — directly
  relevant to this lesson's padding discussion.

## Definition of Done

- [ ] `struct Person` declared, instantiated both by field-by-field
      assignment and by struct-literal initialization, and printed
      correctly.
- [ ] The padding demonstration run for real, confirming `struct Bad`
      is larger than the naive sum of its fields, and that reordering
      fields into `struct Good` measurably shrinks it — your own
      numbers, matching or reasonably close to the ones shown here.
- [ ] `offsetof` used to confirm exactly where the padding bytes are
      inserted.
- [ ] A real, working linked list built with a self-referencing
      `typedef struct Node`, correctly traversed and freed in the
      right order (children before parent).
- [ ] The struct pass-by-value failure reproduced directly — a
      function's modifications to a struct parameter confirmed *not*
      to affect the caller — then fixed with a pointer and `->`,
      confirmed to work.
- [ ] Can explain out loud, without looking at the code, why `head->value`
      is required instead of `head.value` when `head` is declared as
      `Node *head`.
- [ ] Committed, with a message explaining *why* — e.g. `"Structs from
      scratch: bundling data without a class, real measured padding,
      a self-referencing linked-list node, and why structs are still
      pass-by-value"` — not `"add struct examples"`.
