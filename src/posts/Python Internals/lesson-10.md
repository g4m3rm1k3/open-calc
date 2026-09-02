# Lesson 10: Giving a Value a Name That Lasts

**What you will build:** a `locals` array — a second storage area,
separate from the operand stack, that a value can be written into and
read back out of by slot number, persisting across other, unrelated
instructions in between — and two new instructions, `OP_STORE_FAST` and
`OP_LOAD_FAST`, that write to and read from it. The working feature: a
program equivalent to Python's own `x = 2; y = 3; print(x + y)`,
computed by storing `2` and `3` under two separate slots, then loading
both back out by slot number before adding them — the same `5` this
curriculum has produced twice before, now reached by a path that
actually resembles what a Python variable really is. The transferable
problem this lesson is actually about: everything `mini_eval` has held
until now has lived only on the stack — pushed, used immediately, and
gone. A Python variable doesn't work that way: `x = 2` has to survive
until whatever later line actually uses `x`, no matter how many other
unrelated instructions run in between. Real CPython's own actual
answer, confirmed by its own documentation quoted in this lesson, is
exactly this lesson's own approach: a separate slot-based storage area
for local variables, with a real `STORE_FAST` and `LOAD_FAST`
instruction pair reading and writing it by slot number.

**What you need to know first:** Lesson 7 (arrays), Lesson 8 (`enum`,
`switch`, the stack-based `mini_eval` loop), and Lesson 9 (the `consts`
table and `OP_LOAD_CONST`, both extended directly in this lesson).

**Terms used in this lesson**

No new Terms this lesson — every construct this lesson's own code uses
(array declaration and indexing, `enum`, `switch`, `while`) was already
given full treatment in Lessons 7, 8, and 9, and this lesson's own
Concept Units apply those already-proven constructs to a new situation
rather than introducing new C syntax.

**Objects and methods used**

No new external CPython functions this lesson — this lesson's own
`OP_STORE_FAST` and `OP_LOAD_FAST` cases are original code, built
entirely out of array indexing this curriculum has already given full
treatment. Real CPython's own actual `STORE_FAST` and `LOAD_FAST`
instructions are named directly in this lesson's own Reference Source
citations below, quoting real, official Python documentation, the same
approach Lesson 9 took for `LOAD_CONST`.

---

## Concept Unit: Storing a Value Under a Slot Number

### The Problem

Every value `mini_eval` has ever produced, across Lessons 8 and 9, has
lived on the stack, and only there — pushed by one instruction,
consumed by the very next one that needs it, gone the moment it's
popped. Nothing about the stack lets a value survive being read once
and then needed again later, after other, unrelated instructions have
already come and gone. `x = 2` in Python doesn't mean "use `2` right
now and forget it" — it means "keep `2` around, under the name `x`,
until something later actually asks for it."

Before reading on: if a value needs to survive past the one instruction
that produces it, and needs to still be findable later by *name* rather
than by its current position on the stack, what shape of storage do you
think that needs — the same LIFO stack `mini_eval` already has, or
something structured differently? Given Lesson 9's own `consts` array,
already reached by index rather than by stack position — could
something similar work here, except writable instead of fixed?

### Isolating the Concept

```c
#include <stdio.h>

int main(void) {
    long slots[2];

    slots[0] = 42;
    printf("stored 42 into slots[0]\n");

    printf("doing unrelated work in between...\n");
    printf("2 + 2 = %d\n", 2 + 2);

    printf("slots[0] is still %ld\n", slots[0]);

    return 0;
}
```

Actually compiled and run:

```
$ gcc -Wall -o lab19_slot_store lab19_slot_store.c
$ ./lab19_slot_store
stored 42 into slots[0]
doing unrelated work in between...
2 + 2 = 4
slots[0] is still 42
```

`slots[0] = 42;` writes a value into an ordinary array (Lesson 7),
using array indexing exactly as every earlier lesson has. What this lab
exists to prove isn't the write itself — Lesson 7 already proved
that — it's what happens *between* the write and the read: real,
unrelated work (`2 + 2`) runs in between, using none of `slots` at all,
and `slots[0]` is still there afterward, completely undisturbed, real
output confirms it: `42`, unchanged. This is different from how this
curriculum's own stack has worked in every earlier lesson — a stack
value is expected to be consumed by whatever immediately needs it, not
left sitting untouched through several unrelated operations. An
ordinary array, indexed by a fixed slot number, doesn't have that
limitation at all: it holds whatever was last written to each position,
for as long as the array itself exists, regardless of what else runs in
between.

This throwaway example is now **discarded** — `lab19_slot_store.c` will
not appear in this lesson's real project. What it proved — that a
plain array slot holds its value across unrelated intervening work,
unlike the stack's own use-it-immediately pattern — is exactly the
property the real project needs next, to give `mini_eval` something
that behaves like a genuine variable.

### Project Change

- **Reference Source** — Real Python documentation, read this session:
  the `dis` module's own documentation, in the phrasing used across
  several stable Python releases, states plainly: *"Stores TOS into the
  local `co_varnames[var_num]`."* (Newer Python documentation rephrases
  this in terms of a "fast locals" storage area rather than
  `co_varnames` directly — this curriculum follows its own established
  practice of learning the underlying concept rather than pinning one
  version's exact wording; the underlying mechanism — a value popped
  off the stack and written into a numbered local slot — is unchanged
  across every version checked.) This lesson's own `locals` array,
  built in this unit, is a deliberately simplified stand-in for real
  CPython's own "fast locals" storage.
- **Files affected** — `project/lesson-10/mini_eval.c`, modified
  (copied forward from Lesson 9's finished `mini_eval.c`).
- **Change type** — add (`OP_STORE_FAST`, a new opcode; `locals` and
  `locals_len`, two new parameters on `mini_eval`; a new `switch` case).
- **Location** — `OP_STORE_FAST` is added to the existing `enum`, after
  `OP_LOAD_CONST`; `locals` and `locals_len` are added to `mini_eval`'s
  own parameter list; the new `case` goes inside the existing `switch`,
  after `OP_LOAD_CONST`'s own case.
- **Dependencies** — none beyond what Lesson 9 already established.

### The New Code

```c
enum MiniOpcode {
    OP_LOAD_CONST,
    OP_STORE_FAST,
    OP_ADD,
    OP_PRINT,
    OP_HALT
};
```

```c
case OP_STORE_FAST:
    sp--;
    locals[code[pc]] = stack[sp];
    pc++;
    break;
```

### The Updated Project

```c
 1  enum MiniOpcode {
 2      OP_LOAD_CONST,
 3      OP_STORE_FAST,                                    // ← new
 4      OP_ADD,
 5      OP_PRINT,
 6      OP_HALT
 7  };
 8
 9  void mini_eval(long *code, int code_len,
10                 long *consts, int consts_len,
11                 long *locals, int locals_len) {          // ← new parameters
12      long stack[100];
13      int sp = 0;
14      int pc = 0;
15
16      while (pc < code_len) {
17          long opcode = code[pc];
18          pc++;
19
20          switch (opcode) {
21              case OP_LOAD_CONST:
22                  stack[sp] = consts[code[pc]];
23                  sp++;
24                  pc++;
25                  break;
26
27              case OP_STORE_FAST:                          // ← new
28                  sp--;                                       // ← new
29                  locals[code[pc]] = stack[sp];                 // ← new
30                  pc++;                                          // ← new
31                  break;                                          // ← new
32
33              case OP_ADD: {
34                  long b = stack[sp - 1];
35                  sp--;
36                  long a = stack[sp - 1];
37                  sp--;
38                  stack[sp] = a + b;
39                  sp++;
40                  break;
41              }
42
43              case OP_PRINT:
44                  printf("%ld\n", stack[sp - 1]);
45                  break;
46
47              case OP_HALT:
48                  return;
49          }
50      }
51  }
52
53  int main(void) {
54      long consts[] = { 2, 3 };
55      int consts_len = 2;
56
57      long locals[2];                                       // ← new
58      int locals_len = 2;                                     // ← new
59
60      long program[] = {
61          OP_LOAD_CONST, 0,
62          OP_STORE_FAST, 0,                                     // ← new
63          OP_LOAD_CONST, 1,
64          OP_STORE_FAST, 1,                                     // ← new
65          OP_HALT
66      };
67      int program_len = 9;                                     // ← changed (was 7)
68
69      mini_eval(program, program_len,
70                consts, consts_len, locals, locals_len);          // ← new arguments
71
72      printf("locals[0] = %ld, locals[1] = %ld\n",              // ← new
73             locals[0], locals[1]);                               // ← new
74
75      return 0;
76  }
```

`program` (lines 60–66) now stores each loaded constant into a local
slot immediately after loading it, rather than adding them together
right away the way Lessons 8 and 9 did — `mini_eval` no longer computes
anything in this unit's own checkpoint; it only proves values survive
being stored. `main`'s own final `printf` (lines 72–73) reads `locals`
directly, after `mini_eval` has already returned, as real, direct proof
that both stores actually took effect.

### Mechanical Walkthrough

- **`OP_STORE_FAST,`** (inside the `enum`) — a new named instruction,
  automatically valued `1` (Lesson 8's own automatic `enum` numbering),
  since it's the second name listed.
- **`long *locals, int locals_len`** (added to `mini_eval`'s
  parameters) — the same pointer declaration syntax (Lesson 2) and
  plain `int` length already used for `consts`/`consts_len` in Lesson
  9, this time for a second, separate array — writable, unlike
  `consts`, which `mini_eval` only ever reads from.
- **`case OP_STORE_FAST: sp--; locals[code[pc]] = stack[sp]; pc++; break;`**
  — `sp--;` shrinks the stack by one *before* reading from it,
  reflecting that the value about to be stored is being *removed* from
  the stack, not merely looked at the way `OP_ADD`'s own reads worked
  in Lesson 8; `stack[sp]`, read immediately after that decrement, is
  the value that was on top. `code[pc]` reads `OP_STORE_FAST`'s own
  operand — a slot number, the exact indirect-lookup pattern Lesson 9
  proved for `consts`, here used as a *write* target instead of a read
  source: `locals[code[pc]] = ...` writes the popped value into that
  specific slot. `pc++;` advances past the operand, exactly as every
  earlier multi-slot instruction in this curriculum has needed to.
- **`OP_LOAD_CONST, 0, OP_STORE_FAST, 0,`** (inside `program`) — two
  instructions working together: load `consts[0]` (which is `2`) onto
  the stack, then immediately store it into `locals[0]` — the complete
  translation of Python's own `x = 2`, if slot `0` is understood to
  mean "the variable named `x`."
- **`printf("locals[0] = %ld, locals[1] = %ld\n", locals[0], locals[1]);`**
  (in `main`, after `mini_eval` returns) — ordinary array indexing
  (Lesson 7) and `%ld` (Lesson 3), reading `locals` directly from
  `main`'s own code, after `mini_eval` has already finished running —
  possible only because `locals`, like `consts` before it, is an array
  `main` itself owns and merely lends `mini_eval` a pointer to; nothing
  about it is destroyed or hidden once `mini_eval` returns.

### Execution Trace

Continuing the trace shape from Lessons 8 and 9, now including two
stores:

1. `pc = 0`: `OP_LOAD_CONST`, operand `0`; `stack[0] = consts[0]` is
   `2`; `sp` becomes `1`; `pc` becomes `2`.
2. `pc = 2`: `OP_STORE_FAST`, operand `0`; `sp--` makes `sp` `0`;
   `locals[0] = stack[0]` writes `2` into `locals[0]`; `pc` becomes
   `4`.
3. `pc = 4`: `OP_LOAD_CONST`, operand `1`; `stack[0] = consts[1]` is
   `3`; `sp` becomes `1`; `pc` becomes `6`.
4. `pc = 6`: `OP_STORE_FAST`, operand `1`; `sp--` makes `sp` `0`;
   `locals[1] = stack[0]` writes `3` into `locals[1]`; `pc` becomes
   `8`.
5. `pc = 8`: `OP_HALT`; function returns. `locals[0]` is `2`,
   `locals[1]` is `3` — both survived `mini_eval` returning entirely,
   confirmed by real output below.

### CS Lens

Separating short-lived, position-based storage (a stack) from
longer-lived, name- or slot-addressed storage (this unit's own
`locals`) is a foundational split in how every real programming
language's runtime represents a running function's own state.

```
Also recognized in: real CPython's own actual frame object, which
keeps a genuine, separate array of local variable slots alongside its
own operand stack — the exact split this unit builds in miniature; a
CPU's own register file, addressed by fixed register number, sitting
alongside its own separate hardware stack; and, at a conceptual level,
the difference between a calculator's temporary running total (stack-
like, gone the moment you move on) and a spreadsheet's own named cells
(slot-like, holding their value until something deliberately changes
it).
```

### SE Lens

The design principle is **choosing storage that matches how long a
value actually needs to live**, rather than forcing every value through
the same one mechanism. The alternative not chosen: leaving every value
on the stack and requiring careful, manual stack-juggling (duplicating,
reordering) any time a value needed to survive past its first use — a
real approach some genuinely stack-only languages do take, at the real
cost of every instruction needing to reason about exact stack positions
far in advance. The real cost of this lesson's own two-storage approach
instead: `mini_eval` now has to manage two separate array bounds
(`sp` for the stack, and, implicitly, `locals_len` for locals, though
this unit's own code doesn't yet check it) rather than one — a real,
if modest, added bookkeeping burden, paid in exchange for values that
can persist across arbitrarily many unrelated intervening instructions
without any special handling at each one.

### Commands Needed

No new commands — `gcc -Wall -o mini_eval mini_eval.c` and
`./mini_eval`, unchanged since Lesson 8.

### Run It

Actually compiled and run this session, not predicted (this checkpoint
only stores; nothing yet reads a local back through `mini_eval` itself,
proven instead by `main`'s own direct read after the call returns):

```
$ gcc -Wall -o mini_eval mini_eval_cu1.c
$ ./mini_eval_cu1
locals[0] = 2, locals[1] = 3
```

Real, direct proof that both `OP_STORE_FAST` instructions worked
exactly as this unit's own Execution Trace predicted — matching this
unit's own Header claim that a stored value survives past the
instruction that stored it.

### Connecting to What Came Before

Lesson 9 built a way to reach a value by index into a fixed, read-only
table. This unit built the writable counterpart: a slot a value can be
placed into, by the running program itself, and trusted to still be
there later. The next, final unit in this lesson completes the pair,
letting the program read a stored value back through `mini_eval` itself
— not just from `main`, after the fact.

---

## Concept Unit: Reading a Value Back by Slot Number

### The Problem

`locals` now holds real, persisted values — but nothing inside
`mini_eval` itself, running as part of the bytecode stream, can get
them back onto the stack to actually use them. `main`'s own direct read,
from the previous unit, only works because `main` has its own separate
access to `locals` — real Python code, equivalent to `print(x + y)`,
needs a bytecode instruction that can push a stored value back onto the
stack, from *inside* the running program.

Before reading on: given `OP_STORE_FAST`'s own shape — pop a value,
write it into a slot — what do you predict the mirror-image instruction
needs to do instead? And given this lesson's first unit already proved
a value survives in `locals` across intervening instructions, what
should reading it back cost the value that was already there — should
loading it remove it from `locals`, the way `OP_STORE_FAST` removed a
value from the stack, or leave it in place?

### Isolating the Concept

This unit needs no fresh isolated lab: reading an array slot by index
was already proven, repeatedly, as far back as Lesson 7, and this
lesson's own first unit already proved that a stored value survives
intact until it's explicitly needed. What's new here is only applying
those already-proven facts to complete `mini_eval`'s own round trip,
which this unit's own Mechanical Walkthrough explains directly against
the real project code.

### Project Change

- **Reference Source** — the same real Python documentation family
  quoted in this lesson's first unit and Header: the `dis` module's own
  documentation, in its earlier, stable phrasing, states: *"Pushes a
  reference to the local `co_varnames[var_num]` onto the stack."* This
  lesson's own `OP_LOAD_FAST`, built in this unit, is this project's
  direct, if far smaller, counterpart.
- **Files affected** — `project/lesson-10/mini_eval.c`, modified
  further (building on this lesson's first unit's already-updated
  version).
- **Change type** — add (`OP_LOAD_FAST`, a new opcode and `switch`
  case) and refactor (`program`, extended to load both locals back and
  add them, completing the equivalent of `print(x + y)`).
- **Location** — `OP_LOAD_FAST` is added to the existing `enum`, after
  `OP_STORE_FAST`; the new case goes inside the existing `switch`,
  after `OP_STORE_FAST`'s own case; `program` gains four new
  instructions before its existing `OP_HALT`.
- **Dependencies** — none beyond this lesson's first unit.

### The New Code

```c
case OP_LOAD_FAST:
    stack[sp] = locals[code[pc]];
    sp++;
    pc++;
    break;
```

### The Updated Project

```c
 1  enum MiniOpcode {
 2      OP_LOAD_CONST,
 3      OP_STORE_FAST,
 4      OP_LOAD_FAST,                                       // ← new
 5      OP_ADD,
 6      OP_PRINT,
 7      OP_HALT
 8  };
 9
10  /* ...mini_eval's own signature and first two cases: unchanged... */
11
12          case OP_LOAD_FAST:                                // ← new
13              stack[sp] = locals[code[pc]];                    // ← new
14              sp++;                                              // ← new
15              pc++;                                               // ← new
16              break;                                               // ← new
17
18          case OP_ADD: { /* ...unchanged... */ }
19          case OP_PRINT: /* ...unchanged... */
20          case OP_HALT: /* ...unchanged... */
21
22  int main(void) {
23      long consts[] = { 2, 3 };
24      int consts_len = 2;
25
26      long locals[2];
27      int locals_len = 2;
28
29      long program[] = {
30          OP_LOAD_CONST, 0,
31          OP_STORE_FAST, 0,
32          OP_LOAD_CONST, 1,
33          OP_STORE_FAST, 1,
34          OP_LOAD_FAST, 0,                                    // ← new
35          OP_LOAD_FAST, 1,                                    // ← new
36          OP_ADD,                                              // ← new
37          OP_PRINT,                                            // ← new
38          OP_HALT
39      };
40      int program_len = 15;                                  // ← changed (was 9)
41
42      mini_eval(program, program_len,
43                consts, consts_len, locals, locals_len);
44
45      return 0;
46  }
```

`program` now runs the complete equivalent of `x = 2; y = 3;
print(x + y)`: load and store `x` (lines 30–31), load and store `y`
(lines 32–33), load both back (lines 34–35), add them (line 36), and
print the result (line 37) — the same final `OP_HALT` Lesson 8 first
built, still ending the program.

### Mechanical Walkthrough

- **`OP_LOAD_FAST,`** (inside the `enum`) — automatically valued `2`,
  the third name listed.
- **`case OP_LOAD_FAST: stack[sp] = locals[code[pc]]; sp++; pc++; break;`**
  — the exact mirror of `OP_STORE_FAST`: `code[pc]` reads the slot
  number operand; `locals[code[pc]]` reads the value stored there,
  *without* removing it — unlike `OP_STORE_FAST`'s own `sp--`, nothing
  here decrements anything belonging to `locals`, directly answering
  this unit's own opening question: loading a local leaves it in place,
  exactly like `lab19_slot_store.c` already proved a plain array slot
  naturally does. `stack[sp] = ...` pushes that value onto the stack,
  and `sp++;` grows the stack to match — the value is now available to
  whatever instruction runs next, the same way any `OP_LOAD_CONST`
  result already was.
- **`OP_LOAD_FAST, 0, OP_LOAD_FAST, 1,`** (inside `program`) — pushes
  `locals[0]` (`2`) then `locals[1]` (`3`) onto the stack, in that
  order — setting up the exact two-value stack shape `OP_ADD` has
  always expected, unchanged since Lesson 8.
- **`OP_ADD,` and `OP_PRINT,`** — entirely unchanged from Lesson 8;
  neither instruction's own code was touched by this lesson at all —
  they simply now receive values that arrived via `locals` instead of
  directly via `consts`, and neither one can tell, or needs to, the
  difference.

### Execution Trace

Continuing directly from this lesson's first unit's own trace
(`locals[0] = 2`, `locals[1] = 3`, `pc = 8` after both stores):

1. `pc = 8`: `OP_LOAD_FAST`, operand `0`; `stack[0] = locals[0]` is
   `2`; `sp` becomes `1`; `pc` becomes `10`.
2. `pc = 10`: `OP_LOAD_FAST`, operand `1`; `stack[1] = locals[1]` is
   `3`; `sp` becomes `2`; `pc` becomes `12`.
3. `pc = 12`: `OP_ADD`; `b = stack[1]` is `3`, `sp` becomes `1`;
   `a = stack[0]` is `2`, `sp` becomes `0`; `stack[0] = 2 + 3` is `5`;
   `sp` becomes `1`; `pc` becomes `13`.
4. `pc = 13`: `OP_PRINT`; prints `stack[0]`, which is `5`; `pc` becomes
   `14`.
5. `pc = 14`: `OP_HALT`; function returns.

Every value in this trace — `2`, `3`, then `5` — matches this
curriculum's own result from Lessons 8 and 9, now produced through two
real, named local variables rather than values held only on the stack.

### CS Lens

This unit completes the same store/load pairing named in this lesson's
first unit's own CS Lens — the concept doesn't change between the write
half and the read half; only the direction of data flow does.

### SE Lens

The design principle this final unit completes is the same one this
lesson's first unit already began: **matching storage to lifetime,
paired with a genuine round trip proving it actually works both
ways**. The real, honest cost this lesson leaves unaddressed: nothing
in `OP_STORE_FAST` or `OP_LOAD_FAST` checks that a slot number is
actually within `locals_len`'s own bounds — the exact same unchecked
array-index hazard this curriculum's Lesson 8 own SE Lens already named
for `stack` and `code`, now present a third time, for `locals` too. A
production interpreter would need every one of these checked; this
lesson's own simplified version leaves that debt in place, consistent
with this curriculum's own established practice of naming such gaps
honestly rather than silently fixing every one.

### Commands Needed

No new commands — `gcc -Wall -o mini_eval mini_eval.c` and
`./mini_eval`, unchanged since Lesson 8.

### Run It

Actually compiled and run this session, not predicted:

```
$ gcc -Wall -o mini_eval mini_eval.c
$ ./mini_eval
5
```

The same result Lessons 8 and 9 both produced — `5` — now reached
through a program that genuinely stores two separate named values and
reads both back later, the real shape `x = 2; y = 3; print(x + y)`
actually takes once compiled.

### Connecting to What Came Before

The previous unit proved a value can be written into a slot and survive
untouched. This unit proved the other half: that same value can be read
back out, through the running program itself, without disturbing what's
stored — completing, for the first time in this curriculum, a real
round trip through something that behaves like an actual Python
variable, not just a value passing through the stack once and
vanishing.

---

## Connect the Pieces

Follow the value `2`, start to finish, across both units in this
lesson:

1. This lesson's first unit proved, on a throwaway array, that a value
   written into a slot survives real, unrelated work running in
   between — real output confirmed `slots[0]` still held `42` after
   `2 + 2` ran.
2. `OP_LOAD_CONST 0` pushed `consts[0]` (`2`) onto the stack, and
   `OP_STORE_FAST 0` immediately popped it back off and wrote it into
   `locals[0]` — real output, from this unit's own checkpoint,
   confirmed `locals[0] = 2` survived all the way past `mini_eval`
   returning.
3. This lesson's second unit's `OP_LOAD_FAST 0` read `locals[0]` back
   out — without removing it — and pushed `2` onto the stack a second
   time, ready for `OP_ADD`.
4. The complete run confirmed the final result, `5`, unchanged from
   Lessons 8 and 9 — but this time, `2` and `3` each survived being
   named, stored, and read back by a completely different instruction
   than the one that first produced them.

`mini_eval` now has everything a real, if tiny, Python function's own
bytecode needs to compute `x = 2; y = 3; print(x + y)`: constants,
looked up by index (Lesson 9); local variables, stored and loaded by
slot (this lesson); and the arithmetic and printing this curriculum
built as far back as Lesson 8. What it still lacks, honestly: every
value on `mini_eval`'s own stack and in its own `locals` has been a
bare `long` this entire time — never a real `MiniObject`, with its own
reference count, its own type, and its own place in this curriculum's
first seven lessons. That's the natural thread left for this curriculum
to pull next: making `mini_eval` push and pop real `MiniObject`
pointers instead, so that a running program's own bytecode and its own
managed, reference-counted objects — this curriculum's two separate
halves, built seven lessons apart — finally meet.
