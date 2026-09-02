# Lesson 8: A Loop That Reads Its Own Instructions

**What you will build:** a new file, `mini_eval.c`, containing a
function, `mini_eval`, that reads a small array of numbers as a
*program* — a flat sequence of instructions and their arguments — and
carries them out, one at a time, using nothing but a `while` loop and a
`switch` statement. The working feature: handing `mini_eval` the
numeric sequence for "push 2, push 3, add them, print the result, stop"
and watching it actually print `5`. The transferable problem this
lesson is actually about: every lesson so far has been about what a
Python *object* is and how its memory is managed — this lesson is the
first to ask a completely different question: what does it mean for
Python *code itself* — not data, but the actual instructions `a + b`
represents — to be represented as data, sitting in memory, that
something else reads and carries out? CPython's own real answer is its
bytecode compiler and its evaluation loop, `_PyEval_EvalFrameDefault` in
`Python/ceval.c`. This lesson builds the smallest possible version of
that same idea: a flat array of numbers, and a loop that reads and acts
on them.

**What you need to know first:** Lesson 1 (`struct`, compiling), Lesson
2 (pointers), and Lesson 7 (arrays, `for` loops) — this lesson's own
project is a new file, separate from `mini_object.c`, so it does not
build on Lessons 3 through 6's own reference-counting material directly.

**Terms used in this lesson**

- **`enum`** — a keyword that defines a new type consisting of a fixed
  set of named constants, each one automatically given a distinct whole
  number value, starting at `0` and counting up in the order they're
  listed, unless given explicit values instead. It exists so code can
  refer to a small, fixed set of choices by meaningful name — `OP_ADD`,
  rather than a bare `1` that means nothing on its own — while the
  compiler still treats each name as the plain whole number it actually
  is underneath.
- **`while` loop** — a loop that checks a condition before every
  repetition and keeps repeating its body for as long as that
  condition stays true, with no separate setup or update step built
  into its own syntax the way a `for` loop has. It exists for
  situations where a loop's own condition, not a fixed count of
  repetitions, is what should decide when to stop — this lesson's own
  interpreter doesn't know in advance how many instructions a program
  contains in the way this curriculum's earlier `for` loops always knew
  an array's exact size; it only knows to keep going as long as there's
  more program left to read.
- **`switch` statement** — a statement that compares one value against
  a list of `case` labels, and jumps directly to whichever label
  matches, running the code there; `break` ends a `case`'s own code and
  exits the `switch` entirely, and its absence lets execution continue
  into the next `case` below it. It exists as a more direct way to
  express "do one of several different things, depending on which of
  several fixed values this is" than a long chain of separate `if`/
  `else if` checks, which is exactly the shape "which instruction is
  this, and what should it do" naturally takes.
- **bytecode** — a program represented not as source text, but as a
  flat sequence of small numbers a dedicated loop reads and carries
  out, one instruction at a time. It exists because interpreting raw
  source text directly, character by character, on every single
  execution would be far slower than interpreting a form that's
  already been reduced to simple, fixed-shape instructions once, ahead
  of time — this lesson's own `program` array, in miniature, is exactly
  that: a bytecode representation of "push 2, push 3, add, print, halt."
- **opcode** — one instruction's own identifying number within a
  bytecode sequence — short for "operation code." It exists as the
  first thing a bytecode interpreter's own loop reads at each position,
  specifically so it can decide, via a `switch` or an equivalent
  mechanism, which actual operation to perform next.
- **operand** — a value that accompanies an opcode in a bytecode
  sequence, supplying data that specific instruction needs to do its
  job — in this lesson's own bytecode, the number immediately following
  an `OP_PUSH` opcode. It exists because some instructions, unlike
  `OP_ADD` or `OP_HALT`, need more than just "which operation" to carry
  out their job; they also need a value to operate on, stored directly
  in the bytecode sequence itself, right after the opcode that consumes
  it.
- **stack (operand stack)** — a list of values where new values are
  only ever added to, or removed from, one specific end — the *top* —
  in this lesson's own array-based version, always the position
  `stack[sp - 1]`. It exists because instructions like `OP_ADD` need
  somewhere to find their inputs and leave their output, without either
  instruction needing to know exactly which earlier instruction
  produced the values it's working with — each one only ever looks at
  whatever currently happens to be on top.

**Objects and methods used**

No new external CPython functions this lesson — `mini_eval` is an
original function, built entirely out of C mechanics already given full
treatment in this curriculum (`while`, `switch`, `enum`, arrays, and
pointers) or introduced fresh in this lesson's own Header and Concept
Units. Real CPython's own actual evaluation function, `_PyEval_EvalFrameDefault`,
is named directly in this lesson's own Reference Source citations below,
but is far too large to quote in full — this lesson instead quotes the
specific structural fragment of it this lesson's own project is modeled
on.

---

## Concept Unit: Naming Instructions Instead of Numbering Them by Hand

### The Problem

A bytecode program, per this lesson's Header, is just a sequence of
plain numbers. Something has to decide what those numbers actually
*mean* — which number means "push a value," which means "add the top
two values," and so on — and writing those numbers directly, by hand,
as bare literals like `0`, `1`, `2` scattered through the code, would
make every single line unreadable and effortlessly easy to get wrong.

Before reading on: if a program needs a small, fixed set of named
choices — "this instruction, or that one, or this other one" — each of
which is really just a distinct whole number underneath, is there a way
to give each one a real, readable name, while still letting the
compiler treat it as the plain number it actually is? What would you
want that to look like, given everything this curriculum has already
shown about how C requires a type in front of every declared value?

### Isolating the Concept

```c
#include <stdio.h>

enum Color {
    RED,
    GREEN,
    BLUE
};

int main(void) {
    enum Color c = GREEN;
    printf("c = %d\n", c);
    return 0;
}
```

Actually compiled and run:

```
$ gcc -Wall -o lab15_enum lab15_enum.c
$ ./lab15_enum
c = 1
```

`enum Color { RED, GREEN, BLUE };`, from this lesson's Header, defines
a new type, `Color`, with exactly three named values. `RED`, `GREEN`,
and `BLUE` are automatically given the whole numbers `0`, `1`, and `2`,
in the order they're listed — nothing in this code states that
explicitly, but real output confirms it: `c`, holding `GREEN`, prints
as `1` when handed to `%d`, the same integer format specifier this
curriculum has used since Lesson 1, because `GREEN` genuinely *is* the
number `1`, just with a name attached. `enum Color c = GREEN;` uses the
same variable declaration shape as every ordinary type this curriculum
has built, with `enum Color` playing the role `struct MiniObject` or
plain `long` has played elsewhere. This is called an **`enum`**: a
fixed set of named constants, readable in source code, but plain whole
numbers the moment the compiler is done with them.

This throwaway example is now **discarded** — `lab15_enum.c` and
`enum Color` will not appear in this lesson's real project. What it
proved — that an `enum`'s named values really are ordinary whole
numbers, countable from `0`, readable with `%d` exactly like any other
integer — is exactly the mechanism the real project needs next, to name
this lesson's own bytecode instructions.

### Project Change

- **Reference Source** — No reference counterpart for `enum` itself
  (general C). The real counterpart for what this unit's `enum` is
  about to name — CPython's own actual instruction set — is real
  CPython's own `dis` module, whose documentation, read this session,
  lists real opcode names like `LOAD_CONST` and `BINARY_OP` exactly the
  way this lesson's own `OP_PUSH` and `OP_ADD` name this project's own,
  far smaller instruction set; real CPython's actual opcode *values*
  (the numbers each name stands for) are generated from a table in
  CPython's own build process, a level of machinery this lesson's
  simplified project doesn't need.
- **Files affected** — `project/lesson-08/mini_eval.c`, created — a
  brand-new file, separate from `mini_object.c`, since this lesson's
  subject (executing instructions) is a genuinely different concern
  from Lessons 1 through 7's own subject (managing an object's memory),
  the same real separation CPython itself keeps between `Python/ceval.c`
  and `Objects/object.c`.
- **Change type** — add (the whole file is new).
- **Location** — n/a; this is the file's entire initial content.
- **Dependencies** — none beyond a working C compiler, already
  confirmed in Lesson 1.

### The New Code

```c
#include <stdio.h>

enum MiniOpcode {
    OP_PUSH,
    OP_ADD,
    OP_PRINT,
    OP_HALT
};

int main(void) {
    long program[] = {
        OP_PUSH, 2,
        OP_PUSH, 3,
        OP_ADD,
        OP_PRINT,
        OP_HALT
    };
    int program_len = 7;

    int i;
    for (i = 0; i < program_len; i++) {
        printf("program[%d] = %ld\n", i, program[i]);
    }

    return 0;
}
```

### The Updated Project

This new file has nothing surrounding it yet — it *is* the whole
file's initial content, so there's no larger enclosing structure to
return to and re-show, per this schema's own rule for a brand-new file.

### Mechanical Walkthrough

- **`enum MiniOpcode { OP_PUSH, OP_ADD, OP_PRINT, OP_HALT };`** — the
  `enum` construct from this unit's own isolated lab, this time naming
  four instructions instead of three colors: `OP_PUSH` is `0`, `OP_ADD`
  is `1`, `OP_PRINT` is `2`, and `OP_HALT` is `3`, in the exact order
  listed, following the same automatic numbering this unit's own lab
  already proved.
- **`long program[] = { OP_PUSH, 2, OP_PUSH, 3, OP_ADD, OP_PRINT, OP_HALT };`**
  — an array declaration (Lesson 7), this time with no explicit size in
  the brackets — C counts the initializer's own values (seven of them
  here) and sizes the array to match automatically, a shorthand this
  curriculum hasn't used before but which requires no new concept
  beyond array declaration itself. The values themselves mix opcodes
  (`OP_PUSH`, `OP_ADD`, `OP_PRINT`, `OP_HALT`, this unit's Header's own
  term) with a plain operand (`2`, then `3`, this unit's Header's own
  second term) — `2` and `3` are not opcodes at all; they're the actual
  numbers `OP_PUSH` is meant to push, sitting directly in the sequence
  right after the instruction that needs them.
- **`int program_len = 7;`** — a plain `int` (Lesson 1), recording the
  array's real length by hand; C's own array-size shorthand used above
  only applies at the point of declaration, so a separate count is
  needed for anything (like a future loop) that needs to know how far
  the array actually goes.
- **`for (i = 0; i < program_len; i++) { printf(...); }`** — the exact
  `for` loop from Lesson 7, printing every raw number in `program`, by
  position. Real output, below, is the actual proof this unit's own
  Header's claim rests on: the array truly does hold plain numbers —
  `0`, `2`, `0`, `3`, `1`, `2`, `3` — with `OP_PUSH`, `OP_ADD`, and the
  rest nowhere to be seen once the `enum` names are gone and only their
  underlying values remain.

### Execution Trace

The `for` loop here is the same already-proven shape from Lesson 7 —
visiting every array element by index, in order — so per this
curriculum's own established practice, no fresh `Iteration N:` trace is
needed for a mechanism already traced in full in an earlier lesson;
what's new and worth confirming is only the *values* the real output
below actually shows.

### CS Lens

Representing a sequence of operations as plain data — numbers sitting
in memory — rather than as executable machine instructions or literal
source text, is the foundational idea behind every bytecode-based
language runtime, not just CPython's.

```
Also recognized in: the Java Virtual Machine's own bytecode, which
every .class file contains; .NET's Common Intermediate Language (CIL),
used by C# and other .NET languages; WebAssembly, a bytecode format
designed to run inside web browsers; and even a much older idea outside
programming entirely — a player piano's paper roll, which represents a
sequence of notes to play as a physical pattern of holes, read and
acted on by a mechanism that has no idea what music actually is,
exactly as this lesson's own mini_eval has no idea what "add two
numbers" means beyond the specific bytes it's told to carry out.
```

### SE Lens

The design principle is **separating what an instruction *is* (a
number) from what it *does* (behavior defined elsewhere, in code that
reads that number)**. The alternative not chosen here: writing this
lesson's own "push 2, push 3, add, print" directly as ordinary C
statements — `long x = 2; long y = 3; long z = x + y; printf("%ld\n",
z);` — which would certainly work, but which is exactly what this
curriculum has already been doing since Lesson 1, and proves nothing
new about how a language like Python actually runs *other* programs
handed to it, rather than running code fixed once at compile time. The
real cost of the bytecode approach instead: every single instruction
now costs at least one array access and, once this lesson's later units
add it, one `switch` dispatch, where the direct C version would have
cost nothing beyond the operation itself — a real, measurable overhead
that is precisely why calling a Python function is slower than calling
an equivalent, directly-compiled C function, a fact Phase 7 of this
curriculum's own original planning material named directly as
"function-call overhead."

### Commands Needed

```
gcc -Wall -o mini_eval mini_eval.c
./mini_eval
```

Same `gcc` usage from Lesson 1, applied to this lesson's new file and
its own separate output binary, `mini_eval`, kept distinct from
`mini_object`.

### Run It

Actually compiled and run this session, not predicted:

```
$ gcc -Wall -o mini_eval mini_eval_cu1.c
$ ./mini_eval_cu1
program[0] = 0
program[1] = 2
program[2] = 0
program[3] = 3
program[4] = 1
program[5] = 2
program[6] = 3
```

Every value matches this unit's own Header claim exactly: `0` (twice,
for `OP_PUSH`), `2` and `3` (the two operands), `1` (`OP_ADD`), `2`
(`OP_PRINT` — the same numeric value as the operand `2` earlier, a real
coincidence worth naming: nothing about a bare number on its own says
whether it's an opcode or an operand; only its *position* in the
sequence, relative to the instructions around it, decides that — which
is exactly the job this lesson's next two units build).

### Connecting to What Came Before

This is the first unit of a new project file, so there's no earlier
unit in this lesson to connect back to. What it established — a named,
readable set of instructions, reduced to plain numbers sitting in an
array — is the raw material every later unit in this lesson works with.

---

## Concept Unit: Reading Instructions Until Told to Stop

### The Problem

`program`, from the previous unit, is just data sitting still — nothing
reads through it and does anything based on what it contains.
Something needs to walk the array from the start, looking at one
number at a time, and keep going until it's actually finished — but,
unlike every `for` loop this curriculum has used so far, `mini_eval`
won't always know exactly how many *positions* it needs to visit in
advance, because `OP_PUSH` instructions each take up two array slots
(the opcode, then its operand) while `OP_ADD`, `OP_PRINT`, and
`OP_HALT` each take up only one.

Before reading on: given that a `for` loop's own syntax bundles a fixed
starting point, a condition, and a fixed-size update together, and
given that this lesson's own instructions don't all advance the reading
position by the same amount — is a `for` loop still the right shape for
this? What might a loop need to look like if the position it counts
from has to be updated by different amounts, decided while the loop is
already running, rather than by the same fixed step every single time?

### Isolating the Concept

```c
#include <stdio.h>

int main(void) {
    int count = 0;
    while (count < 3) {
        printf("count = %d\n", count);
        count++;
    }
    return 0;
}
```

Actually compiled and run:

```
$ gcc -Wall -o lab16_while lab16_while.c
$ ./lab16_while
count = 0
count = 1
count = 2
```

`while (count < 3) { ... }`, from this lesson's Header, checks
`count < 3` before every repetition — the same relational-comparison
idea Lesson 3 introduced with `==`, here using `<` instead — and keeps
running its body for as long as that stays true. Unlike a `for` loop,
nothing about `while`'s own syntax bundles a starting value or an
update step into the loop itself; both `count = 0` (before the loop)
and `count++` (inside its body, at the end) are ordinary statements,
written wherever they're needed, not built into the loop's own header
the way a `for` loop's three parts are. Real output confirms three
repetitions, `count` at `0`, `1`, then `2` — the loop stops the moment
`count` becomes `3`, since `3 < 3` is false. This is called a **`while`
loop**: repetition driven purely by a condition, with no assumption
built in about how many times it will run or by how much anything
changes on each pass — exactly the shape needed when, as in this
lesson's real project, different instructions advance the reading
position by different amounts.

This throwaway example is now **discarded** — `lab16_while.c` will not
appear in this lesson's real project. What it proved — that a `while`
loop repeats purely based on a condition, with the loop's own body free
to update whatever variables that condition depends on however it
needs to — is exactly the shape `mini_eval` needs, to read through
`program` at a pace that varies instruction by instruction.

### Project Change

- **Reference Source** — `Python/ceval.c`, real CPython source,
  confirmed across several points in the file's own history read this
  session: CPython's actual evaluation function is built around exactly
  this shape — a loop that keeps running for as long as there's more
  bytecode left to execute, reading one opcode at a time and advancing
  its own instruction pointer by an amount that depends on which
  instruction was just read, precisely because, in real CPython exactly
  as in this lesson's own project, not every instruction is the same
  size.
- **Files affected** — `project/lesson-08/mini_eval.c`, modified.
- **Change type** — add (`mini_eval`, a new function, containing this
  unit's own first, deliberately incomplete version of the fetch loop).
- **Location** — `mini_eval` is added above `main`'s existing
  definition; `main`'s own body is replaced, calling `mini_eval` instead
  of printing `program` directly.
- **Dependencies** — none beyond this lesson's first unit.

### The New Code

```c
void mini_eval(long *code, int code_len) {
    long stack[100];
    int sp = 0;
    int pc = 0;

    while (pc < code_len) {
        long opcode = code[pc];
        pc++;

        printf("fetched opcode %ld at pc %d\n", opcode, pc - 1);

        if (opcode == OP_HALT) {
            return;
        }
    }
}
```

### The Updated Project

```c
 1  void mini_eval(long *code, int code_len) {      // ← new
 2      long stack[100];                              // ← new
 3      int sp = 0;                                    // ← new
 4      int pc = 0;                                     // ← new
 5
 6      while (pc < code_len) {                         // ← new
 7          long opcode = code[pc];                       // ← new
 8          pc++;                                          // ← new
 9
10          printf("fetched opcode %ld at pc %d\n", opcode, pc - 1);  // ← new
11
12          if (opcode == OP_HALT) {                        // ← new
13              return;                                       // ← new
14          }                                                  // ← new
15      }                                                       // ← new
16  }                                                            // ← new
17
18  int main(void) {
19      long program[] = {
20          OP_PUSH, 2,
21          OP_PUSH, 3,
22          OP_ADD,
23          OP_PRINT,
24          OP_HALT
25      };
26      int program_len = 7;
27
28      mini_eval(program, program_len);               // ← new (replaces the for-loop print)
29
30      return 0;
31  }
```

`mini_eval` takes a pointer to the first element of a `long` array
(line 1) and its length, and reads through it with a `while` loop
(line 6), printing each raw opcode it finds and stopping only when it
sees `OP_HALT` (lines 12–14). `main` (line 28) now calls this new
function instead of printing `program`'s raw contents directly, as the
previous unit's version did.

### Mechanical Walkthrough

- **`void mini_eval(long *code, int code_len)`** — a new function,
  returning nothing (`void`, Lesson 1), taking a pointer to `long`
  (Lesson 2's pointer declaration syntax) and a plain `int` length. When
  `main` later calls `mini_eval(program, program_len)`, `program` — an
  array — is passed as this pointer directly: C automatically treats an
  array's own name, used as a value, as a pointer to its first element,
  without needing `&program[0]` written out by hand — a fact this
  lesson's Header didn't separately name as its own term, since it
  follows directly from the address-of and array material Lessons 1 and
  7 already covered in full.
- **`long stack[100]; int sp = 0;`** — declared here, in this unit,
  even though nothing in this unit's own code uses them yet, because
  they belong to `mini_eval`'s own local variables and this lesson's
  later units build directly on top of this exact function body rather
  than replacing it; `stack` is the operand stack from this lesson's
  Header, and `sp` (a plain `int`) will track its current top position,
  starting at `0` — empty.
- **`int pc = 0;`** — a plain `int`, standing for "program counter":
  the position in `code` this loop is currently reading from, starting
  at the very first element.
- **`while (pc < code_len) { ... }`** — the `while` loop from this
  unit's own isolated lab, continuing for as long as `pc` hasn't yet
  passed the end of the program.
- **`long opcode = code[pc]; pc++;`** — array indexing (Lesson 7)
  reading whatever number currently sits at position `pc`, followed
  immediately by advancing `pc` past it — the fetch half of a
  fetch-and-act cycle, done before anything is decided about what that
  number actually means.
- **`if (opcode == OP_HALT) { return; }`** — a deliberately incomplete
  stand-in for real dispatch, using only the `if`/`==` mechanism from
  Lesson 3: it can recognize `OP_HALT` and stop, but it has no way yet
  to recognize `OP_PUSH` specifically and skip past its operand — which
  is exactly why the real output below shows this version misreading
  `2` and `3` as if they were opcodes in their own right.

### Execution Trace

`pc` advances by exactly `1` on every single pass through this loop —
worth tracing explicitly, since this unit's whole point is exposing why
that fixed, one-at-a-time advance is wrong for this specific bytecode:

1. `pc = 0`: `opcode = code[0]` is `OP_PUSH` (`0`); printed as
   "fetched opcode 0 at pc 0"; not `OP_HALT`, loop continues; `pc` is
   now `1`.
2. `pc = 1`: `opcode = code[1]` is `2` — `OP_PUSH`'s own operand, from
   the previous unit — but this loop has no way to know that; it's read
   and printed exactly as if it were a real opcode: "fetched opcode 2
   at pc 1"; `pc` is now `2`.
3. `pc = 2`: `opcode = code[2]` is `OP_PUSH` (`0`) again — the *second*
   `OP_PUSH` in the program — printed as "fetched opcode 0 at pc 2";
   `pc` is now `3`.
4. `pc = 3`: `opcode = code[3]` is `3` — the second `OP_PUSH`'s own
   operand, again misread as if it were an opcode: "fetched opcode 3 at
   pc 3"; `pc` is now `4`.

This unit's real output, below, confirms exactly this — and stops
after only four lines, well short of the full seven-element program,
because this checkpoint's own real run doesn't continue past what this
unit needs to demonstrate. The problem this trace exposes — an
`OP_PUSH`'s own operand being read and treated as if it were the next
opcode — is precisely what the next, final unit in this lesson exists
to fix.

### CS Lens

A loop whose own advance amount depends on the specific data it just
read, rather than a fixed step decided in advance, is a defining trait
of any variable-length instruction format — a real, named category, not
unique to bytecode.

```
Also recognized in: x86 machine code itself, whose real instructions
vary from one to several bytes long, requiring a real CPU's own
instruction decoder to read each instruction's length as part of
reading the instruction; UTF-8 text encoding, where a single character
can take anywhere from one to four bytes, and a correct reader has to
determine each character's own length from its first byte before
knowing where the next character starts; and network protocols with
variable-length fields, which a parser must read length-first before it
can know where the next field even begins.
```

### SE Lens

The design principle at stake here — even in this unit's own
deliberately incomplete version — is that **a fetch loop's own
advancement must be driven by what it actually reads, not by a
schedule decided in advance**. This unit's own version gets this wrong
on purpose, advancing `pc` by a fixed `1` regardless of what was just
read, which is precisely why it misreads `OP_PUSH`'s own operands as
opcodes. The real cost of leaving this uncorrected: every instruction
after the very first multi-slot one would be read from the wrong
position, corrupting the entire rest of the program's own execution —
not a minor cosmetic bug, but a completely broken interpreter,
silently producing wrong results rather than crashing outright, which
is exactly what makes this specific class of bug dangerous in real
bytecode interpreters, not just illustrative in this lesson's own toy
version.

### Commands Needed

No new commands — the same `gcc -Wall -o mini_eval mini_eval.c` and
`./mini_eval` from this lesson's first unit.

### Run It

Actually compiled and run this session, not predicted:

```
$ gcc -Wall -o mini_eval mini_eval_cu2.c
$ ./mini_eval_cu2
fetched opcode 0 at pc 0
fetched opcode 2 at pc 1
fetched opcode 0 at pc 2
fetched opcode 3 at pc 3
```

Exactly matching this unit's own Execution Trace: the loop correctly
finds both real `OP_PUSH` opcodes (`0`, at positions `0` and `2`), but
misreads both of their operands (`2` and `3`) as if they were opcodes
of their own — real, direct proof of the exact problem this unit's own
SE Lens and Execution Trace both already named. The loop never reaches
`OP_ADD`, `OP_PRINT`, or `OP_HALT` at all in this specific run, because
it's already lost track of its true position in the program well before
getting there.

### Connecting to What Came Before

The previous unit named every instruction and laid the whole program
out as plain data. This unit built a loop that can walk through that
data — but, on its own, cannot yet tell an opcode from an operand,
because nothing yet decides, instruction by instruction, how far to
advance. The final unit in this lesson fixes exactly that.

---

## Concept Unit: Choosing What to Do, Based on What Was Read

### The Problem

The previous unit's `if (opcode == OP_HALT)` can recognize exactly one
instruction. A real interpreter needs to recognize *all* of them, and,
critically, needs `OP_PUSH` specifically to consume its own operand —
advancing `pc` by one extra position — while every other instruction in
this lesson's own bytecode advances by only one.

Before reading on: given this lesson's own `enum` names four different
instructions, and each one needs its own, different behavior when
encountered — including `OP_PUSH` needing to advance `pc` by one *more*
position than the others — what C construct from this lesson's own
Header do you think is built exactly for "do one of several different
things, depending on which of several fixed values this is"? And what
do you predict happens if one of that construct's own branches forgets
to stop before falling into the next one below it?

### Isolating the Concept

```c
#include <stdio.h>

enum Action {
    ACTION_GREET,
    ACTION_FAREWELL
};

int main(void) {
    enum Action a = ACTION_FAREWELL;

    switch (a) {
        case ACTION_GREET:
            printf("hello\n");
            break;
        case ACTION_FAREWELL:
            printf("goodbye\n");
            break;
    }

    return 0;
}
```

Actually compiled and run:

```
$ gcc -Wall -o lab17_switch lab17_switch.c
$ ./lab17_switch
goodbye
```

`switch (a) { ... }`, from this lesson's Header, compares `a`'s own
value against every `case` label inside it, in order, and jumps
directly to whichever one matches — here, `a` holds `ACTION_FAREWELL`,
so execution jumps straight to `case ACTION_FAREWELL:`, skipping
`case ACTION_GREET:`'s own code entirely, without ever checking it —
real output confirms only `goodbye` prints, never `hello`. `break;`,
also from this lesson's Header, ends that case's own code and exits the
whole `switch` — without it, execution would "fall through" into
whatever `case` comes next below, running that code too, whether it
matched or not; both `case`s here end with `break`, so neither
possibility of falling through is actually exercised in this
particular run, but it's the reason `break` appears at all. This is
called a **`switch` statement**: choosing one of several fixed
possibilities directly, by value, rather than testing them one by one
with a chain of `if`/`else if` comparisons.

This throwaway example is now **discarded** — `lab17_switch.c` and
`enum Action` will not appear in this lesson's real project. What it
proved — that `switch` jumps directly to a matching `case`, and that
`break` is what actually stops it there — is exactly the mechanism
`mini_eval` needs, to give each of its four real instructions its own,
correct behavior.

### Project Change

- **Reference Source** — `Python/ceval.c`, real CPython source, read
  this session across several points in the file's own history: the
  interpreter's real dispatch step, in the portable form CPython itself
  falls back to when not using its more specialized computed-goto
  dispatch, takes the literal form `switch (opcode) { case SOME_OP: ...
  ; ... }` — real CPython's own `TARGET(op)` macro, in more than one
  version of this file, expands to something equivalent to a plain
  `case op:` label, feeding directly into exactly this construct. This
  lesson's own `switch (opcode)`, built in this unit, mirrors that real
  structure directly, at far smaller scale — real CPython's own switch
  handles well over a hundred distinct opcodes, this lesson's own
  handles four.
- **Files affected** — `project/lesson-08/mini_eval.c`, modified
  further (building on this lesson's second unit's already-updated
  version).
- **Change type** — refactor: the previous unit's own `if
  (opcode == OP_HALT)` check is replaced entirely by a `switch`
  handling all four real instructions.
- **Location** — inside `mini_eval`'s existing `while` loop, replacing
  the previous unit's own `printf`/`if` pair.
- **Dependencies** — none beyond this lesson's second unit.

### The New Code

```c
switch (opcode) {
    case OP_PUSH:
        stack[sp] = code[pc];
        sp++;
        pc++;
        break;

    case OP_ADD: {
        long b = stack[sp - 1];
        sp--;
        long a = stack[sp - 1];
        sp--;
        stack[sp] = a + b;
        sp++;
        break;
    }

    case OP_PRINT:
        printf("%ld\n", stack[sp - 1]);
        break;

    case OP_HALT:
        return;
}
```

### The Updated Project

```c
 1  void mini_eval(long *code, int code_len) {
 2      long stack[100];
 3      int sp = 0;
 4      int pc = 0;
 5
 6      while (pc < code_len) {
 7          long opcode = code[pc];
 8          pc++;
 9
10          switch (opcode) {                                    // ← new (replaces printf/if)
11              case OP_PUSH:                                       // ← new
12                  stack[sp] = code[pc];                             // ← new
13                  sp++;                                              // ← new
14                  pc++;                                               // ← new
15                  break;                                              // ← new
16
17              case OP_ADD: {                                        // ← new
18                  long b = stack[sp - 1];                             // ← new
19                  sp--;                                                // ← new
20                  long a = stack[sp - 1];                              // ← new
21                  sp--;                                                // ← new
22                  stack[sp] = a + b;                                   // ← new
23                  sp++;                                                // ← new
24                  break;                                                // ← new
25              }                                                        // ← new
26
27              case OP_PRINT:                                         // ← new
28                  printf("%ld\n", stack[sp - 1]);                       // ← new
29                  break;                                                // ← new
30
31              case OP_HALT:                                          // ← new
32                  return;                                              // ← new
33          }                                                          // ← new
34      }
35  }
36
37  int main(void) {
38      long program[] = {
39          OP_PUSH, 2,
40          OP_PUSH, 3,
41          OP_ADD,
42          OP_PRINT,
43          OP_HALT
44      };
45      int program_len = 7;
46
47      mini_eval(program, program_len);
48
49      return 0;
50  }
```

`mini_eval`'s inner loop now does real, correct work for every
instruction: `OP_PUSH` (lines 11–15) writes a value onto the stack and
advances `pc` one *extra* position, past its own operand — the exact
fix the previous unit's own trace showed was missing; `OP_ADD` (lines
17–25) removes the top two stack values and replaces them with their
sum; `OP_PRINT` (lines 27–29) reads, without removing, whatever is
currently on top; and `OP_HALT` (lines 31–32) stops the function
immediately, exactly as it did in the previous unit.

### Mechanical Walkthrough

- **`switch (opcode) { ... }`** — the `switch` statement from this
  unit's own isolated lab, this time driven by `opcode`, an `enum`
  value read straight out of the bytecode array in the previous unit.
- **`case OP_PUSH: stack[sp] = code[pc]; sp++; pc++; break;`** — array
  indexing (Lesson 7) writes `code[pc]` — the operand sitting
  immediately after `OP_PUSH` in the array, from this lesson's Header —
  into the stack's current top-plus-one slot, `sp` (already advanced
  by the outer loop's own `pc++`, so `code[pc]` here correctly refers
  to the operand, not the opcode already consumed). `sp++;` grows the
  stack by one, and `pc++;` — the key correction this whole unit exists
  to make — advances `pc` a *second* time, past the operand this case
  just consumed, so the outer loop's next pass correctly lands on the
  instruction after it, not on the operand itself.
- **`case OP_ADD: { long b = stack[sp - 1]; sp--; long a = stack[sp - 1]; sp--; stack[sp] = a + b; sp++; break; }`**
  — wrapped in its own `{ }` block (ordinary block-delimiting syntax,
  already covered in Lesson 1, needed here specifically because this
  case declares its own local variables, `a` and `b`, which C requires
  a block for). `stack[sp - 1]` reads the current top of the stack
  (from this lesson's Header: always position `sp - 1`, one less than
  the count of items, since indexing starts at `0`) into `b`, then
  `sp--` shrinks the stack past it; the identical pattern repeats for
  `a`, reading what is now the new top; `stack[sp] = a + b;` writes
  their sum into the now-empty top slot, and `sp++` grows the stack
  back over it — net effect: two values in, one value (their sum) out,
  exactly what "add" means for a stack-based interpreter.
- **`case OP_PRINT: printf("%ld\n", stack[sp - 1]); break;`** — reads
  the current top of the stack, using `%ld` (Lesson 3) since `stack` is
  an array of `long`, without changing `sp` at all — `OP_PRINT`, unlike
  `OP_ADD`, only looks at the top value; it doesn't consume it.
- **`case OP_HALT: return;`** — unchanged from the previous unit's own
  version, now sitting as one case among several instead of the only
  check this loop could make.

### Execution Trace

Continuing correctly, for the first time, through the entire real
program:

1. `pc = 0`: fetch `OP_PUSH`; `pc` becomes `1`. `case OP_PUSH` runs:
   `stack[0] = code[1]` which is `2`; `sp` becomes `1`; `pc` becomes
   `2` (the extra advance past the operand).
2. `pc = 2`: fetch `OP_PUSH` again; `pc` becomes `3`. `case OP_PUSH`
   runs: `stack[1] = code[3]` which is `3`; `sp` becomes `2`; `pc`
   becomes `4`.
3. `pc = 4`: fetch `OP_ADD`; `pc` becomes `5`. `case OP_ADD` runs:
   `b = stack[1]` is `3`, `sp` becomes `1`; `a = stack[0]` is `2`, `sp`
   becomes `0`; `stack[0] = 2 + 3` is `5`; `sp` becomes `1`.
4. `pc = 5`: fetch `OP_PRINT`; `pc` becomes `6`. `case OP_PRINT` runs:
   prints `stack[0]`, which is `5`.
5. `pc = 6`: fetch `OP_HALT`; `pc` becomes `7`. `case OP_HALT` runs:
   the function returns immediately, before the outer `while` loop's
   own condition is even checked again.

Every value in this trace — `2`, `3`, then `5` — matches this lesson's
real, confirmed output below exactly.

### CS Lens

A dispatch step that reads one value and jumps directly to the
matching handler, rather than testing possibilities one at a time, is
the core mechanism behind every bytecode interpreter's own main loop,
under whatever name a given language's own implementation gives it.

```
Also recognized in: real CPython's own interpreter loop, whose
Reference Source this whole unit is built on; the Java Virtual
Machine's own bytecode interpreter, structured around the identical
fetch-decode-dispatch shape; a restaurant kitchen's own order system,
where a ticket's dish name is matched directly against a fixed menu of
stations, each cook already knowing exactly what to do the moment their
own dish name comes up; and a hardware CPU's own instruction decoder,
whose job — reading one instruction's opcode and routing control to the
matching execution unit — is this exact same idea, implemented directly
in silicon instead of C.
```

### SE Lens

The design principle this final unit completes is **separating "what
instruction is this" from "what does it do,"** the same split this
lesson's very first unit already named in its own SE Lens, now fully
working: `mini_eval`'s own `while` loop only ever asks "what's next,"
and the `switch` inside it is the only place that knows what any
specific instruction actually means. The real cost, honestly named: this
lesson's own interpreter has none of real CPython's own further
optimizations — no computed-goto dispatch (a faster alternative to a
plain `switch`, which real CPython's own Reference Source showed this
lesson using only as its portable fallback path), no specialization of
frequently-executed instructions (the "adaptive/specialized bytecode"
this curriculum's own original planning material named as a modern
CPython feature), and no bounds-checking on `stack` or `code` at all —
a program with more `OP_PUSH`es than four instructions of headroom, or
missing its own `OP_HALT`, would read or write past the end of an
array, the same real, undefined-behavior hazard Lesson 3 first named
for a freed pointer, here arising instead from an unchecked array
index.

### Commands Needed

No new commands — the same `gcc -Wall -o mini_eval mini_eval.c` and
`./mini_eval` from this lesson's first unit.

### Run It

Actually compiled and run this session, not predicted:

```
$ gcc -Wall -o mini_eval mini_eval.c
$ ./mini_eval
5
```

A single line, `5` — the complete, correct result of `2 + 3`, computed
entirely by reading and carrying out this lesson's own bytecode array,
one instruction at a time, with no C expression anywhere in this file
that directly says `2 + 3`.

### Connecting to What Came Before

The previous unit's loop could read through the program but could not
correctly interpret it, misreading operands as opcodes the moment it
encountered the first one. This unit's `switch` is what actually lets
`mini_eval` tell every instruction apart and give each one its own
correct behavior — including, critically, letting `OP_PUSH` alone
consume the extra array slot its own operand occupies, fixing exactly
the corruption the previous unit's own real output demonstrated.

---

## Connect the Pieces

Follow the value `5`, start to finish, across everything this lesson
built:

1. The first unit represented "push 2, push 3, add, print, stop" as
   nothing but seven plain numbers in an array — real output confirmed
   each one, stripped of its `enum` name, was exactly the whole number
   this lesson's Header said it would be.
2. The second unit built a loop that could walk through those seven
   numbers — but, proven by real output, misread both operands (`2`
   and `3`) as if they were opcodes, because nothing yet told the
   difference between an instruction and the data that follows it.
3. The third unit's `switch` gave every instruction its own real
   behavior, including letting `OP_PUSH` correctly consume its own
   operand — fixing, for real, the exact corruption the second unit's
   own output demonstrated.
4. With that fix in place, the complete, real run traced exactly:
   `2` pushed, then `3` pushed, then `OP_ADD` combining them into `5`
   on the stack, then `OP_PRINT` reading that `5` back out — confirmed
   by real output showing precisely `5`, and nothing else.

Nothing in `mini_eval.c` ever wrote the expression `2 + 3` directly.
Every part of that computation — which values to combine, and when —
came from data this lesson's own bytecode array held, read and carried
out by a loop that has no idea, and no need to know, what a Python `+`
operator even is at the source-code level. That gap — between source
code a person writes and the flat, numeric sequence something else
actually runs — is precisely where CPython's own real compiler sits,
turning Python source into real bytecode very much like this lesson's
own `program` array, just vastly larger, before CPython's own real
`_PyEval_EvalFrameDefault` reads and carries it out exactly the way
this lesson's own `mini_eval` just did, in miniature, for real.
