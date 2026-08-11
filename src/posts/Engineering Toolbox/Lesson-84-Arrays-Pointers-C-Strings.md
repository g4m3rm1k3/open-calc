# Lesson 84: A String Is Just Bytes and a Promise — Arrays, Pointers, and C Strings

**What you will build:** real proof that array indexing and pointer
arithmetic are the same operation in C, a hand-built string assembled
byte by byte with an explicit terminator, a from-scratch `strlen`, and
two genuinely reproducible failures: a missing terminator causing
`strlen` to walk into unrelated memory, and a crash from writing to a
string literal. The transferable insight: Python's `str` is a real,
length-aware object; C has no string type at all — a "string" is
purely a convention (a run of bytes, ending wherever a `\0` happens to
be), and this lesson makes that convention, and what happens when it's
violated, completely concrete.

**What you need to know first:** Lesson 82 (pointers, `&`, `*`) — this
lesson treats pointer arithmetic as a direct extension of dereferencing,
already established. Lesson 61 (hex/binary viewer) — this lesson's
entire subject is the fact that a "string" is just raw bytes, viewed
through a specific lens; Lesson 61's own work treating a file as
nothing but inspectable bytes is the same underlying idea, applied here
to memory instead of disk.

---

## Concept Unit: The Problem — Python Strings Know Their Own Length

### The Problem

Python's `str` is a real object: asking for its length is instant,
because the length is stored directly, once, when the string is
created. C provides nothing like this at all — there is no `string`
type in the language itself, and this lesson's entire point is what
fills that gap.

### The New Code

```python
s = "hello"
print("string:", s)
print("length:", len(s))       # O(1) -- Python stores the length directly
print("type:", type(s))
```

### Run It

```
string: hello
length: 5
type: <class 'str'>
```

`len(s)` doesn't count anything — it reads a number Python already
knows. Discarded now; the rest of this lesson builds the same
capability (knowing where a string ends) with no such built-in help at
all.

### CS Lens

Python's `str` bundles data (the characters) with metadata about that
data (its length) in one object. C, by design, provides neither
bundling nor metadata automatically for anything — this is the same
underlying philosophy already seen in Lesson 83's manual memory
management: C gives direct, minimal access to raw memory, and every
convenience built on top of that is something the programmer (or a
library) constructs deliberately, never something the language
provides for free.

---

## Concept Unit: Arrays and Pointers Are the Same Operation

### The Problem

C array indexing (`numbers[i]`) looks like a separate, self-contained
feature. It's worth proving directly that it isn't — it's pointer
arithmetic, spelled differently, and this fact is the foundation
everything else about C strings rests on.

### The New Code

```c
#include <stdio.h>

int main() {
    int numbers[5] = {10, 20, 30, 40, 50};

    for (int i = 0; i < 5; i++) {
        printf("numbers[%d] = %-3d   *(numbers + %d) = %-3d   &numbers[%d] = %p\n",
               i, numbers[i], i, *(numbers + i), i, (void *)&numbers[i]);
    }

    printf("\nnumbers itself:     %p\n", (void *)numbers);
    printf("&numbers[0]:         %p\n", (void *)&numbers[0]);
    printf("size of one int:     %zu bytes\n", sizeof(int));

    return 0;
}
```

### Run It

```
numbers[0] = 10    *(numbers + 0) = 10    &numbers[0] = 0x7ffc03200890
numbers[1] = 20    *(numbers + 1) = 20    &numbers[1] = 0x7ffc03200894
numbers[2] = 30    *(numbers + 2) = 30    &numbers[2] = 0x7ffc03200898
numbers[3] = 40    *(numbers + 3) = 40    &numbers[3] = 0x7ffc0320089c
numbers[4] = 50    *(numbers + 4) = 50    &numbers[4] = 0x7ffc032008a0

numbers itself:     0x7ffc03200890
&numbers[0]:         0x7ffc03200890
size of one int:     4 bytes
```

Three things proven at once, with real numbers: `numbers[i]` and
`*(numbers + i)` produce identical values, every time — genuinely the
same operation, not just similar-looking syntax. `numbers` itself
(used with no index at all) equals `&numbers[0]` exactly. And each
successive address increases by precisely `4` — matching
`sizeof(int)` exactly, confirmed on the same line.

### Mechanical Walkthrough

- `int numbers[5] = {10, 20, 30, 40, 50};` — already-established array
  declaration; worth restating precisely: this reserves five
  *contiguous* `int`-sized blocks of memory, back to back, with no
  gaps — a fact this lesson is about to make load-bearing.
- `numbers[i]` — ordinary indexing, already familiar.
- `*(numbers + i)` — **first appearance of pointer arithmetic.**
  `numbers` (used without brackets) decays to a pointer to its first
  element; adding an integer `i` to a pointer doesn't add `i` to the
  raw address — it adds `i * sizeof(the pointed-to type)` — so
  `numbers + 1` doesn't mean "one byte later," it means "one whole
  `int` later," exactly matching the `4`-byte steps confirmed in the
  output. `*(numbers + i)` dereferences that computed address —
  identical, by definition, to `numbers[i]`. This is not an analogy;
  `arr[i]` is defined in the C standard as shorthand for exactly this
  expression.
- `&numbers[i]` — confirms the address each computed pointer actually
  points at, matching the pattern directly.

### CS Lens

Defining one syntax (`arr[i]`) as pure shorthand for another
(`*(arr + i)`), with no separate underlying mechanism, is a real,
specific design decision — not every language does this. Also
recognized in: any language description that calls array indexing
"syntactic sugar" for pointer dereferencing, and — a genuinely useful,
slightly surprising consequence worth testing directly — the fact that
`i[numbers]` is *also* valid C, equal to `numbers[i]`, because addition
is commutative and both expand to the identical `*(pointer + offset)`
form underneath.

---

## Concept Unit: A String Is a `char` Array Plus a Terminator

### The Problem

Given that arrays and pointers are unified, and C provides no
dedicated string type, a "string" in C is just an array of `char` —
but nothing about an array alone marks *where the text ends*, since
(unlike Python) the array's own length isn't stored anywhere separate
from the array itself.

### The New Code

```c
#include <stdio.h>

int main() {
    char word[6];
    word[0] = 'h';
    word[1] = 'e';
    word[2] = 'l';
    word[3] = 'l';
    word[4] = 'o';
    word[5] = '\0';   // the null terminator

    printf("word as a string: %s\n", word);
    printf("raw bytes: ");
    for (int i = 0; i < 6; i++) {
        printf("[%d]=%d ", i, word[i]);
    }
    printf("\n");

    return 0;
}
```

### Run It

```
word as a string: hello
raw bytes: [0]=104 [1]=101 [2]=108 [3]=108 [4]=111 [5]=0
```

Six bytes allocated, five meaningful characters, and byte `[5]` prints
as `0` — the numeric value of `'\0'`, the **null terminator**. `%s`
printed exactly `"hello"`, five characters, correctly stopping *before*
that sixth byte — because `%s` (and every standard C string function)
is defined to read bytes one at a time until it finds a `\0`, and stop
there, never relying on any separately-stored length.

### Mechanical Walkthrough

- `char word[6];` — six bytes reserved, one more than the five visible
  characters — deliberately, to make room for the terminator.
- `word[0] = 'h';` through `word[4] = 'o';` — each character assigned
  individually, by its own single-quoted `char` literal — already-
  established indexing, applied one byte at a time to build up text
  manually.
- `word[5] = '\0';` — **first appearance of the null terminator,
  written explicitly.** `'\0'` is a `char` literal whose value is
  exactly `0` — not the *character* `'0'` (which has a different,
  nonzero value) — a specific, reserved byte value that every standard
  C string function treats as "the string ends here."
- `printf("...%s\n", word)` — `%s` reappearing from Lesson 82's earlier
  formatting work, now used for its defining purpose: it walks `word`
  one byte at a time, printing each as a character, until it encounters
  a `\0`, then stops — never told how many bytes to print, only where
  to stop looking.

### CS Lens

Marking the end of a sequence with a special **sentinel value** rather
than storing its length separately is a real, named design choice —
called a **null-terminated string**, C's specific convention. This is
directly comparable to, and worth contrasting with, Lesson 72's
sentinel *nodes* in a linked list (marking the boundary of a structure
without needing a separately tracked length either) — the same
underlying idea, applied here to a sequence of bytes instead of a
sequence of linked objects. The tradeoff is real in both directions:
no separate length field to keep in sync, at the cost of needing to
scan the whole sequence just to find its length — exactly what the
next unit measures directly.

---

## Concept Unit: `strlen`, Built from Scratch

### The Problem

Given the previous unit's mechanism, computing a C string's length
means doing exactly what `%s` does internally: walking byte by byte
until a `\0` turns up, counting as you go — there's no shortcut,
because there's no stored length to simply read.

### The New Code

```c
#include <stdio.h>
#include <string.h>

int my_strlen(const char *s) {
    int count = 0;
    while (s[count] != '\0') {
        count++;
    }
    return count;
}

int main() {
    char word[6] = {'h', 'e', 'l', 'l', 'o', '\0'};
    printf("my_strlen: %d\n", my_strlen(word));
    printf("real strlen: %zu\n", strlen(word));
    return 0;
}
```

### Run It

```
my_strlen: 5
real strlen: 5
```

A from-scratch `strlen`, matching the real, standard-library `strlen`
exactly, on the same input.

### Mechanical Walkthrough

- `int my_strlen(const char *s)` — **first appearance of `const` on a
  pointer parameter.** `const char *s` means "this function will not
  modify what `s` points to" — a real, compiler-enforced promise
  (attempting `s[0] = 'x';` inside this function would fail to
  compile), documenting the function's intent directly in its
  signature: `strlen` only ever *reads*.
- `while (s[count] != '\0') { count++; }` — the entire mechanism, in
  one loop: check the byte at the current position; if it's not the
  terminator, advance and check the next one; stop the instant it is.
  No length was ever passed in, ever consulted — `count` only knows
  the answer once it's walked every byte up to (not including) the
  terminator.

### CS Lens

Computing a property by scanning a sequence one element at a time,
because no shortcut or precomputed value exists, is `O(n)` — worth
contrasting directly against Python's `len(s)`, which is `O(1)`
precisely because Python *does* store the length. This isn't a
C-is-worse observation; it's the direct, load-bearing cost of the
previous unit's design choice: no stored length means every length
query costs a full scan, every single time it's asked, no matter how
many times the same string's length gets checked.

---

## What Breaks Without This — a Missing Terminator

### The Problem

`strlen` (and every standard C string function) trusts that a `\0`
exists *somewhere* in the memory it's given. If it doesn't — because
the array wasn't given room for one, or the terminator was never
written — nothing stops the walk; it continues into whatever memory
happens to follow, reading it as though it were part of the string.

### The New Code

```c
#include <stdio.h>
#include <string.h>

int main() {
    char broken[5] = {'h', 'e', 'l', 'l', 'o'};
    char after[5] = {'W', 'O', 'R', 'L', 'D'};   // deliberately placed right after, on the stack

    printf("broken as a string: %s\n", broken);
    printf("strlen(broken): %zu\n", strlen(broken));

    return 0;
}
```

### Run It

```
broken as a string: helloWORLD
strlen(broken): 10
```

`broken` was declared as exactly 5 bytes — `'h'`, `'e'`, `'l'`, `'l'`,
`'o'` — **no room for a terminator at all.** `strlen` had no way to
know that; it walked straight past `broken`'s own memory into
`after`'s, which — on this specific compiler, this specific run,
laid out `after` immediately following `broken` in memory (confirmed
directly: `&broken` and `&after` differ by exactly 5, `after`'s
address minus `broken`'s) — happened to contain more non-zero bytes,
which got read as though they were part of `broken`'s own string.

### Why This Is Dangerous, Precisely

This is **undefined behavior** — the C standard makes no promise
whatsoever about what happens when a string function is given memory
with no terminator. The specific result shown here (`"helloWORLD"`,
length `10`) is not guaranteed, not portable, and not something to
rely on or expect — a different compiler, a different optimization
level, a different day, could produce a completely different result:
different garbage, a crash, or — genuinely possible, and the more
insidious case — output that happens to look completely correct,
giving no indication anything was ever wrong. The danger isn't that
this code visibly breaks; it's that it might not, every single time,
right up until it does.

## Exercises

- Deliberately reorder `broken` and `after`'s declarations in the
  program above, or add a third variable between them, and observe
  whether the "walks into adjacent memory" behavior still reproduces
  the same way — confirm directly that memory layout is the compiler's
  choice, not something the C source controls or guarantees.
- Write a `my_strcpy(char *dest, const char *src)` from scratch,
  copying byte by byte including the terminator, and confirm it
  matches the real `strcpy` on a few test strings.
- Modify this lesson's `no_terminator` example to allocate `broken` on
  the *heap* with `malloc(5)` instead of the stack, and observe whether
  the same "walks into adjacent data" behavior reproduces — research
  why heap layout and stack layout can behave differently for this
  kind of bug.
- Research `strncpy` and `snprintf` as safer alternatives to `strcpy`
  that take an explicit maximum length — a real, standard defense
  against exactly this lesson's failure mode, previewing Lesson 87's
  fuller treatment of buffer safety.

---

## Concept Unit: String Literals Live in Read-Only Memory

### The Problem

`char *s = "hello";` and `char s[] = "hello";` look almost identical,
and are not: one is a pointer to memory the program is not allowed to
modify; the other is a real, independent, writable array. Confusing
the two is a common, real mistake worth proving the consequences of
directly.

### The New Code — Writable

```c
#include <stdio.h>

int main() {
    char writable[] = "hello";   // a real ARRAY, initialized by copying the literal -- mutable
    writable[0] = 'H';
    printf("writable: %s\n", writable);
    return 0;
}
```

```
writable: Hello
```

### The New Code — Read-Only

```c
#include <stdio.h>

int main() {
    char *readonly = "hello";   // a POINTER to a string literal, living in read-only memory
    printf("before: %s\n", readonly);
    readonly[0] = 'H';           // attempting to write to read-only memory
    printf("after: %s\n", readonly);
    return 0;
}
```

```
Segmentation fault
exit code: 139
```

### Mechanical Walkthrough

- `char writable[] = "hello";` — declares a real array, sized
  automatically to fit `"hello"` plus its terminator (6 bytes), and
  **copies** the literal's characters into that array's own, freshly
  allocated, writable memory. `writable[0] = 'H';` genuinely succeeds —
  confirmed directly by the correct `"Hello"` output.
- `char *readonly = "hello";` — declares a *pointer*, initialized to
  point directly at the string literal's storage — which the compiler
  places in a read-only section of the program's memory (the same
  general region holding a compiled program's own instructions,
  conceptually related to the "text" section seen in Lesson 81's `nm`
  output). No copy happens here at all; `readonly` points *at the
  literal itself*.
- `readonly[0] = 'H';` — attempting to write through that pointer
  means writing directly into the read-only section — the operating
  system's memory protection catches this exactly the way it caught
  the `NULL`-dereference in Lesson 83: a hard, immediate **segmentation
  fault**, not silent corruption, not a warning — the program is
  stopped before the write can do any damage.

### CS Lens

Distinguishing "a pointer to shared, immutable data" from "a private,
owned, mutable copy" is a real and recurring distinction, not unique
to C strings. Also recognized in: Python's own strings actually being
immutable for a related reason (any apparent "modification" always
creates a new string object rather than changing the original), the
general distinction between a reference to shared state and a
defensive copy of it, and — directly relevant to this lesson's very
first unit — one more concrete reason Python's `str` behaves the way
it does: immutability sidesteps this entire category of bug by
construction, at the cost of the copying Python does invisibly every
time a "modified" string is produced.

## Definition of Done

- [ ] The array/pointer equivalence proven directly on your own
      machine: `numbers[i]` and `*(numbers + i)` produce identical
      output, and successive addresses differ by exactly `sizeof(int)`.
- [ ] A string built by hand, byte by byte, with an explicit `'\0'`,
      correctly printed with `%s` and confirmed via raw byte inspection.
- [ ] `my_strlen` implemented and confirmed to match the real `strlen`
      on at least one test string.
- [ ] The missing-terminator failure reproduced on your own machine —
      confirming `strlen` (or `%s`) walks past the intended array's
      bounds into adjacent memory, with your own observed output (which
      may differ from this lesson's, and that's expected, not a
      problem).
- [ ] Both string-literal programs run: the array-copy version
      confirmed mutable; the direct-literal-pointer version confirmed
      to crash with a real segmentation fault on write.
- [ ] Can explain out loud, without looking at the code, why
      `char s[] = "hello";` and `char *s = "hello";` behave completely
      differently under `s[0] = 'H';`, despite looking almost
      identical.
- [ ] Committed, with a message explaining *why* — e.g. `"C strings
      from scratch: null-terminated byte arrays, array/pointer
      equivalence proven directly, and two real failures — a missing
      terminator and a write to a read-only literal"` — not `"add
      string examples"`.
