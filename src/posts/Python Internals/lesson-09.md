# Lesson 9: Looking Up a Value Instead of Carrying It

**What you will build:** a separate `consts` array, holding the actual
values a program uses, and a rebuilt `OP_LOAD_CONST` instruction — a
renamed, reworked version of Lesson 8's `OP_PUSH` — that no longer
carries a value directly in the bytecode stream, but instead carries a
small index, and looks the real value up in `consts` at the moment it
runs. The working feature: the identical `2 + 3 = 5` result Lesson 8
produced, computed the same way, but with `program` itself now
containing nothing but opcodes and small integer indices — never a raw
value like `2` or `3` sitting directly in the instruction stream. The
transferable problem this lesson is actually about: Lesson 8's own
`OP_PUSH` embedded its operand directly, which works fine for a `long`,
but real Python values aren't all a single machine word wide — a
string, a large number, or a whole nested data structure can't be
squeezed into one instruction's own operand slot the way `2` fit into
`OP_PUSH`'s. Real CPython's own actual solution, confirmed by its own
documentation quoted in this lesson, is exactly this lesson's own
approach: every code object carries a separate table of its real
constant values, `co_consts`, and its own real `LOAD_CONST` instruction
carries only a small index into that table, never the value itself.

**What you need to know first:** Lesson 7 (arrays, `for` loops) and
Lesson 8 (`enum`, `while`, `switch`, and this lesson's own starting
point, `mini_eval.c`, exactly as Lesson 8 left it).

**Terms used in this lesson**

- **indirect lookup** — reaching a value not by storing it directly,
  but by storing its *position* in a separate collection, then reading
  that collection at that position when the value is actually needed.
  It exists because a position — a small, fixed-size number — can stand
  in for a value of any size or shape at all, letting the thing holding
  the position stay small and uniform even when the real values it
  refers to vary wildly in size, exactly the situation this lesson's
  own bytecode stream is in relative to the constant values a real
  program might use.

**Objects and methods used**

No new external CPython functions this lesson — this lesson's own
`OP_LOAD_CONST` case is an original piece of code, built entirely out of
array indexing (Lesson 7) and the `switch` mechanism (Lesson 8) this
curriculum has already given full treatment. Real CPython's own actual
`LOAD_CONST` instruction and `co_consts` attribute are named directly in
this lesson's own Reference Source citation below, quoting real,
current Python documentation rather than CPython's own C source, since
`LOAD_CONST`'s real behavior is a documented, stable contract rather
than an internal C function this curriculum has occasion to quote a
body for.

---

## Concept Unit: A Separate Place to Keep the Data

### The Problem

Lesson 8's own `OP_PUSH` reads its value from the very next slot in the
bytecode array itself — `code[pc]`, right after the opcode. That works
because `2` and `3` are small enough to sit directly in a `long`, the
exact same type the bytecode array itself is made of. Nothing about
that approach would work for a value that doesn't fit that description
— there's nowhere in a single bytecode slot to put, say, an entire
piece of text.

Before reading on: if a bytecode instruction can only carry one
`long`-sized operand, but the values a real program actually uses can
be far bigger or a completely different shape, what would you need to
store *instead* of the value itself, right there in the instruction
stream? Where might the real value actually need to live?

### Isolating the Concept

```c
#include <stdio.h>

int main(void) {
    long values[] = {100, 200, 300};
    int indices[] = {2, 0, 1};

    int i;
    for (i = 0; i < 3; i++) {
        printf("indices[%d] = %d -> values[indices[%d]] = %ld\n",
               i, indices[i], i, values[indices[i]]);
    }

    return 0;
}
```

Actually compiled and run:

```
$ gcc -Wall -o lab18_indirect_lookup lab18_indirect_lookup.c
$ ./lab18_indirect_lookup
indices[0] = 2 -> values[indices[0]] = 300
indices[1] = 0 -> values[indices[1]] = 100
indices[2] = 1 -> values[indices[2]] = 200
```

`values` and `indices` are two separate arrays, using array declaration
syntax (Lesson 7) that's completely ordinary on its own. What's new is
how they're used together: `values[indices[i]]` reaches into `indices`
first, at position `i`, to get a number — and then uses *that* number
as a position into `values`, a completely different array. Real output
confirms it: at `i = 0`, `indices[0]` is `2`, and `values[2]` is `300`
— the code never wrote `300` anywhere near position `0` of anything;
it only ever wrote `2`, and let a second array-index step find the
real value. This is called **indirect lookup**, from this lesson's
Header: reaching a value through a stored position, rather than storing
the value itself.

This throwaway example is now **discarded** — `lab18_indirect_lookup.c`
will not appear in this lesson's real project. What it proved — that
one array can hold small positions, while a separate array holds the
real values those positions point into — is exactly the relationship
the real project needs next, between its bytecode stream and its
actual constant values.

### Project Change

- **Reference Source** — Real CPython documentation, read this session:
  the `dis` module's own documentation describes `LOAD_CONST`'s real,
  documented behavior in exactly six words, unchanged across every
  version of Python this curriculum checked, from Python 3.2 through
  the current documentation: *"Pushes `co_consts[consti]` onto the
  stack."* `co_consts` is a real, genuine attribute every Python code
  object actually has — reachable in real Python as
  `some_function.__code__.co_consts` — holding a real tuple of that
  function's own actual constant values; `consti` is `LOAD_CONST`'s own
  real operand, an index into that tuple, never a value directly. This
  lesson's own `consts` array, built in this unit, is a deliberately
  simplified stand-in for real CPython's own `co_consts`.
- **Files affected** — `project/lesson-09/mini_eval.c`, modified
  (copied forward from Lesson 8's finished `mini_eval.c`).
- **Change type** — add (`consts`, a new local array in `main`, and one
  new `printf` call proving its contents, with nothing in `mini_eval`
  itself changed yet).
- **Location** — the new array and `printf` go inside `main`, above the
  existing `program` array.
- **Dependencies** — none beyond what Lesson 8 already established.

### The New Code

```c
long consts[] = { 2, 3 };

printf("consts[0] = %ld, consts[1] = %ld\n", consts[0], consts[1]);
```

### The Updated Project

```c
 1  int main(void) {
 2      long consts[] = { 2, 3 };                                  // ← new
 3
 4      printf("consts[0] = %ld, consts[1] = %ld\n",                 // ← new
 5             consts[0], consts[1]);                                 // ← new
 6
 7      long program[] = {
 8          OP_PUSH, 2,
 9          OP_PUSH, 3,
10          OP_ADD,
11          OP_PRINT,
12          OP_HALT
13      };
14      int program_len = 7;
15
16      mini_eval(program, program_len);
17
18      return 0;
19  }
```

`consts` (line 2) now holds the real values `2` and `3` — the same two
numbers `program` (lines 7–13) still carries directly, unchanged from
Lesson 8, in this unit's own checkpoint. Nothing about `mini_eval`
itself, or how `program` is built, changes in this unit at all — `consts`
simply exists, alongside everything Lesson 8 already built, proven real
by printing it directly.

### Mechanical Walkthrough

- **`long consts[] = { 2, 3 };`** — an array declaration (Lesson 7)
  using C's own initializer-based sizing, from Lesson 8's own `program`
  declaration: two `long` values, sized automatically to match.
- **`printf("consts[0] = %ld, consts[1] = %ld\n", consts[0], consts[1]);`**
  — ordinary array indexing (Lesson 7) and `%ld` (Lesson 3), reading
  both values back out directly, with no indirection yet — this line
  exists purely to prove `consts` genuinely holds what this unit claims
  it does, before the next unit puts it to real use.

### Execution Trace

No loop, recursion, or carried state in this unit's own change — two
plain statements, run once, printing two fixed values. No trace is
needed for the same reason already established in every earlier lesson
for non-repeating code.

### CS Lens

Keeping a program's actual data separate from the stream of operations
that act on it — rather than folding both together — is a foundational
split in how real compiled and interpreted programs are actually laid
out.

```
Also recognized in: real compiled executables, which conventionally
separate their own code section from their own data section, each
loaded into memory with different permissions (code read-only and
executable, data readable and writable); a musical score, which
separates the notes to be played (the data) from the tempo and
structure guiding when to play them (closer to the "code"); and, as
this lesson's own Reference Source already named directly, every real
Python code object's own co_consts, sitting separate from its own
co_code (the real bytecode instruction stream itself).
```

### SE Lens

The design principle is **keeping instructions small and uniform by
moving anything that varies in size out of the instruction stream
itself**. The alternative — Lesson 8's own approach, still fully intact
in this unit's own checkpoint — embeds a value directly in the
bytecode, which only works because Lesson 8 never needed to hold
anything bigger than one `long`. The real cost of the separate-table
approach this lesson is building instead: every constant access now
costs one extra array lookup (indirect, through `consts`, rather than
reading the bytecode stream directly) — a real, if small, overhead,
paid in exchange for instructions that stay a fixed, predictable size
no matter how large or complex the actual values a program uses turn
out to be. This project isn't carrying any debt from this choice
currently — `consts` exists but isn't wired into `mini_eval` at all
yet, which the next, final unit in this lesson corrects.

### Commands Needed

No new commands — `gcc -Wall -o mini_eval mini_eval.c` and
`./mini_eval`, unchanged since Lesson 8.

### Run It

Actually compiled and run this session, not predicted (this checkpoint
still uses Lesson 8's own unchanged `OP_PUSH`-based bytecode; `consts`
exists only to prove it holds the right values, not yet to supply them):

```
$ gcc -Wall -o mini_eval mini_eval_cu1.c
$ ./mini_eval_cu1
consts[0] = 2, consts[1] = 3
5
```

The first line is new — real, direct proof `consts` holds exactly `2`
and `3`. The second line, `5`, is unchanged from Lesson 8's own final
run, since `mini_eval` itself hasn't been touched yet in this unit.

### Connecting to What Came Before

Lesson 8 ended with a working interpreter whose one instruction,
`OP_PUSH`, carried its own value directly. This unit added a second
place values could live, without touching that working interpreter at
all — proving the new table is correct on its own terms before asking
`mini_eval` to actually depend on it.

---

## Concept Unit: Loading a Value Through Its Index

### The Problem

`consts` now holds real values, and `program` still carries its own
values directly, completely independently — nothing connects the two.
For `program` to actually shrink down to opcodes and small indices,
per this lesson's own opening problem, `OP_PUSH` itself has to change:
instead of treating its own operand as the value to push, it needs to
treat that operand as a *position* in `consts`, and look the real value
up from there.

Before reading on: given this unit's own isolated lab already proved
`values[indices[i]]` correctly performs exactly this kind of two-step
lookup, what do you think the corresponding line inside `mini_eval`'s
own `switch` needs to look like, once `OP_PUSH`'s operand — currently
read as `code[pc]` and used directly — is reinterpreted as an index
into `consts` instead?

### Isolating the Concept

This unit needs no fresh isolated lab: the mechanism it depends on —
reading one array's value and using it as a position into a second,
separate array — was already proven for real in this lesson's first
unit's own isolated lab, `lab18_indirect_lookup.c`, above. What's new
here is applying that exact proof to `mini_eval`'s own real `switch`
statement, which this unit's own Mechanical Walkthrough explains
directly against the real project code.

### Project Change

- **Reference Source** — the same real `dis` module documentation
  quoted in full in this unit's first unit and this lesson's own
  Header: *"Pushes `co_consts[consti]` onto the stack."* This unit's
  own renamed `OP_LOAD_CONST` case is this project's direct, if far
  smaller, counterpart to that real instruction's real, documented
  behavior.
- **Files affected** — `project/lesson-09/mini_eval.c`, modified
  further (building on this lesson's first unit's already-updated
  version).
- **Change type** — refactor: `OP_PUSH` is renamed `OP_LOAD_CONST`
  throughout, `mini_eval`'s own parameter list gains `consts` and
  `consts_len`, its `OP_LOAD_CONST` case (formerly `OP_PUSH`) now
  looks its value up through `consts` instead of using its own operand
  directly, `program`'s own two values (`2` and `3`) become the indices
  `0` and `1`, and `main`'s own call to `mini_eval` passes `consts` and
  its length alongside `program`.
- **Location** — throughout `mini_eval.c`: the `enum` definition,
  `mini_eval`'s own signature and its `OP_LOAD_CONST` case, `program`'s
  own contents, and the call to `mini_eval` in `main`.
- **Dependencies** — none beyond this lesson's first unit.

### The New Code

```c
enum MiniOpcode {
    OP_LOAD_CONST,
    OP_ADD,
    OP_PRINT,
    OP_HALT
};
```

```c
void mini_eval(long *code, int code_len, long *consts, int consts_len) {
```

```c
case OP_LOAD_CONST:
    stack[sp] = consts[code[pc]];
    sp++;
    pc++;
    break;
```

### The Updated Project

```c
 1  enum MiniOpcode {
 2      OP_LOAD_CONST,                                    // ← renamed (was OP_PUSH)
 3      OP_ADD,
 4      OP_PRINT,
 5      OP_HALT
 6  };
 7
 8  void mini_eval(long *code, int code_len,                // ← new parameters
 9                 long *consts, int consts_len) {           // ← new parameters
10      long stack[100];
11      int sp = 0;
12      int pc = 0;
13
14      while (pc < code_len) {
15          long opcode = code[pc];
16          pc++;
17
18          switch (opcode) {
19              case OP_LOAD_CONST:                          // ← renamed (was case OP_PUSH)
20                  stack[sp] = consts[code[pc]];              // ← changed (was = code[pc])
21                  sp++;
22                  pc++;
23                  break;
24
25              case OP_ADD: {
26                  long b = stack[sp - 1];
27                  sp--;
28                  long a = stack[sp - 1];
29                  sp--;
30                  stack[sp] = a + b;
31                  sp++;
32                  break;
33              }
34
35              case OP_PRINT:
36                  printf("%ld\n", stack[sp - 1]);
37                  break;
38
39              case OP_HALT:
40                  return;
41          }
42      }
43  }
44
45  int main(void) {
46      long consts[] = { 2, 3 };
47      int consts_len = 2;                                  // ← new
48
49      long program[] = {
50          OP_LOAD_CONST, 0,                                  // ← changed (was OP_PUSH, 2)
51          OP_LOAD_CONST, 1,                                  // ← changed (was OP_PUSH, 3)
52          OP_ADD,
53          OP_PRINT,
54          OP_HALT
55      };
56      int program_len = 7;
57
58      mini_eval(program, program_len, consts, consts_len);   // ← changed (new arguments)
59
60      return 0;
61  }
```

`program` (lines 49–55) no longer contains `2` or `3` anywhere — only
`0` and `1`, small indices, at exactly the positions where those real
values used to sit directly. The real values themselves now live only
in `consts` (line 46), reached by `mini_eval`'s own new
`OP_LOAD_CONST` case (lines 19–23) through the exact indirect-lookup
pattern this lesson's first unit already proved.

### Mechanical Walkthrough

- **`OP_LOAD_CONST,`** (inside the `enum`) — the same construct from
  Lesson 8, simply renamed: still the first name listed, so still
  automatically valued `0`, exactly as `OP_PUSH` was.
- **`void mini_eval(long *code, int code_len, long *consts, int consts_len)`**
  — the same function signature shape from Lesson 8, extended with two
  more parameters, using the identical pointer declaration syntax
  (Lesson 2) already used for `code`: `consts`, a second array of
  `long`, and `consts_len`, its length — passed alongside `code` and
  `code_len` rather than replacing them, since the bytecode stream and
  the constants table are now two genuinely separate pieces of data.
- **`stack[sp] = consts[code[pc]];`** — this unit's whole point,
  written out: `code[pc]` reads the operand sitting right after
  `OP_LOAD_CONST` in the bytecode stream — no longer treated as the
  value itself, but as a position; `consts[...]` then performs the
  second lookup step, the exact `values[indices[i]]` pattern this
  lesson's first unit already proved, reaching the real value and
  writing it onto the stack.
- **`OP_LOAD_CONST, 0,`** and **`OP_LOAD_CONST, 1,`** (inside
  `program`) — `0` and `1` are no longer the values `2` and `3`
  themselves; they're `consts`'s own indices — `consts[0]` is `2`,
  `consts[1]` is `3`, so these two instructions still, in the end,
  push exactly the same two real values Lesson 8's own bytecode did,
  just by naming their *position* in `consts` instead of the values
  directly.
- **`mini_eval(program, program_len, consts, consts_len);`** — an
  ordinary function call (Lesson 2), now passing four arguments instead
  of two, matching `mini_eval`'s own extended parameter list exactly.

### Execution Trace

Continuing the same trace shape Lesson 8 built, now with the added
indirect step:

1. `pc = 0`: fetch `OP_LOAD_CONST`; `pc` becomes `1`. `code[1]` is `0`
   — an index, not a value; `consts[0]` is `2`; `stack[0] = 2`; `sp`
   becomes `1`; `pc` becomes `2`.
2. `pc = 2`: fetch `OP_LOAD_CONST` again; `pc` becomes `3`. `code[3]`
   is `1`; `consts[1]` is `3`; `stack[1] = 3`; `sp` becomes `2`; `pc`
   becomes `4`.
3. `pc = 4` onward: `OP_ADD`, `OP_PRINT`, and `OP_HALT` run exactly as
   they did in Lesson 8's own trace, since none of those three
   instructions were touched by this lesson at all — `OP_ADD` combines
   `2` and `3` into `5`, `OP_PRINT` prints it.

Every real value this trace predicts — `2`, `3`, then `5` — is the
exact same sequence Lesson 8's own trace produced, confirming this
lesson changed *how* those values were found, not what the program
actually computes.

### CS Lens

This unit is the same CS idea named in this lesson's first unit —
indirect lookup — now applied for real, inside an actual instruction
dispatch step rather than a standalone throwaway example; the concept
doesn't change between isolation and real use, only its setting does.

### SE Lens

The design principle this final unit completes is the same one this
lesson's first unit already named: **keeping instructions uniformly
small by moving variable-sized data out of the instruction stream**.
What this unit adds to that principle, concretely: the real cost is now
directly measurable and honestly named. Every real run of this lesson's
own project performs one extra array lookup per `OP_LOAD_CONST` — real
CPython accepts this identical cost, on every single `LOAD_CONST`
instruction that runs, anywhere in any Python program, in exchange for
never needing a special-cased "big constant" instruction alongside an
ordinary "small constant" one; one instruction, one lookup mechanism,
handles a constant of any size or shape at all, from a small integer to
an arbitrarily large string or nested structure — a uniformity Lesson
8's own direct-embedding approach could never have offered past the
size of a single `long`.

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

The identical result Lesson 8 produced — `5` — now computed with
`program` itself containing no value larger than `1` anywhere in it.

### Connecting to What Came Before

The previous unit built a real, correct constants table, proven
correct on its own, entirely separate from the working interpreter
Lesson 8 already built. This unit connected the two: `OP_LOAD_CONST`
now performs the exact indirect lookup the previous unit's own isolated
lab proved, for real, on the real project's own bytecode and constants.

---

## Connect the Pieces

Follow the value `2`, start to finish, comparing this lesson's own path
to Lesson 8's:

1. In Lesson 8, `program` itself held `2` directly, right after
   `OP_PUSH` — `code[pc]` read it straight off the instruction stream.
2. This lesson's first unit built `consts`, a separate array also
   holding `2` — proven correct on its own, with real output, before
   `mini_eval` ever depended on it.
3. This lesson's second unit changed `program` to hold `0` — an index
   — in that exact same position, and changed `mini_eval`'s own
   `OP_LOAD_CONST` case to read that index and perform a second lookup,
   `consts[code[pc]]`, to actually find `2`.
4. Real output confirmed the final result stayed identical — `5` —
   proving this lesson changed only the *path* `mini_eval` takes to
   reach `2` and `3`, never the values themselves or what the program
   computes with them.

`program` now looks structurally like a real, if tiny, piece of
CPython bytecode: opcodes and small indices, nothing else — the exact
shape this lesson's own Reference Source described for real CPython's
own `LOAD_CONST`, reaching into a code object's own real `co_consts`.
`mini_eval` itself still only knows how to add two numbers and print
one result — a real, honest limitation worth naming directly, and the
natural next thread for this curriculum to pull on: what it would take
for `mini_eval` to hold more than one value in flight at once, by
*name* rather than only by stack position — the beginning of what real
CPython calls a variable, and a real frame's own local namespace.
