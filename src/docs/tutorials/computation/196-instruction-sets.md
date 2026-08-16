# Lesson 196: Instruction Sets

- **What you will build** — `load-mem` and `store-mem`, connecting
  Lesson 195's register machine to Lesson 191's memory for the first
  time; `load-indirect`, addressing memory through whatever address a
  register currently holds rather than a literal baked into the
  instruction; and `compare` paired with a flag-based conditional jump, a
  second, genuinely different real design for control flow than Lesson
  195's own register-tested one. The transferable problem: Lesson 195
  built registers and jumps in isolation from memory; no real instruction
  set keeps them apart. This lesson is where they actually meet, and
  where a single instruction's operand can mean two completely different
  things — "this literal number" or "whatever this register currently
  holds" — depending on which **addressing mode** it uses.
- **What you need to know first** — `read-byte`, `write-byte` (Lesson
  191); `deref`, pointer arithmetic (Lesson 192); `get-register`,
  `set-register`, `exec-load`/`exec-add`/`exec-mult`/`exec-sub`,
  `exec-instruction`, `next-pc`, jumps (Lesson 195).
- **Terms introduced in this lesson**
  - **addressing mode** — the way an instruction's operand is meant to be
    interpreted: as a literal value, as a register to read directly, or
    as a register whose *value* is itself the address of the real data.
  - **register-indirect addressing** — reading or writing memory at the
    address currently held in a register, rather than an address written
    literally into the instruction itself — the machine-level version of
    Lesson 192's `deref`.
  - **condition flag** — a small, separately held result — here, whether
    a `compare` found two registers equal — that a later instruction can
    react to, without re-specifying what was actually compared.
- **Objects and methods used**: None new. This lesson reuses `get`,
  `assoc` (Section V), `read-byte`, `write-byte` (Lesson 191), `cond`,
  `if`, `=`, `+` (already covered).

---

## Concept Unit: Connecting Registers to Memory

### The Problem

Lesson 195's register machine never once touched Lesson 191's memory —
every value lived and died inside a handful of registers. Real programs
need far more storage than a few registers can hold; something has to
move a value from a register into memory, and back, on demand.

### Introduce the Concept in Isolation

Skipped — `read-byte` and `write-byte` are already fully covered (Lesson
191); the new material is wiring them into the instruction dispatcher
built in Lesson 195, shown directly in the real code below.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from Lesson 195's register machine.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: Refactor — `exec-instruction` and `run-program` from
  Lesson 195 gain a `memory` parameter threaded alongside `registers`;
  every individual `exec-*` function (`exec-load`, `exec-add`, and so on)
  is otherwise untouched.
- **Location**: `exec-instruction`'s `cond` and `run-program`, from
  Lesson 195.
- **Dependencies**: Babashka, already installed.

### The New Code

Two new instructions: one reads a memory address directly into a
register, one writes a register's value out to a memory address:

```clojure
(defn exec-load-mem
  [registers memory instruction]
  (set-register registers (get instruction 1) (read-byte memory (get instruction 2))))
```

```clojure
(defn exec-store-mem
  [registers memory instruction]
  (write-byte memory (get instruction 2) (get-register registers (get instruction 1))))
```

### The Updated Project

`exec-instruction` now carries `memory` alongside `registers`, returning
both as a pair — Lesson 195's own arithmetic instructions are called
exactly as before, with `memory` simply riding along unchanged:

```clojure
(defn exec-instruction
  [registers memory instruction]
  (cond
    (= (get instruction 0) "load") [(exec-load registers instruction) memory]
    (= (get instruction 0) "add") [(exec-add registers instruction) memory]
    (= (get instruction 0) "mult") [(exec-mult registers instruction) memory]
    (= (get instruction 0) "sub") [(exec-sub registers instruction) memory]
    (= (get instruction 0) "load-mem") [(exec-load-mem registers memory instruction) memory]
    (= (get instruction 0) "store-mem") [registers (exec-store-mem registers memory instruction)]
    true [registers memory]))
```

```clojure
(defn run-program
  [registers memory program]
  (if (empty? program)
    [registers memory]
    (run-program-continue (exec-instruction registers memory (first program)) (rest program))))
```

```clojure
(defn run-program-continue
  [state program]
  (run-program (get state 0) (get state 1) program))
```

### Mechanical Walkthrough

Enumerating `exec-load-mem`'s and `exec-store-mem`'s bodies:

- `(get instruction 2)` used directly as a memory address — **(a) first
  appearance**: this is a **literal address**, written straight into the
  instruction — the simplest possible addressing mode, and the one every
  instruction in Lesson 195 already used for its non-address operands.
- `read-byte memory ...`, `write-byte memory ...` — **(c) already basic**,
  Lesson 191.

Enumerating `exec-instruction`'s updated body:

- The four unchanged branches — **(c) already basic**, Lesson 195's own
  functions, called identically, with `memory` simply passed through
  untouched in the returned pair.
- `[registers (exec-store-mem ...)]` versus `[(exec-load-mem ...) memory]`
  — **(a) first appearance**: two structurally different results from
  the same dispatcher — a memory *write* changes `memory` and leaves
  `registers` untouched; a memory *read* is the exact opposite.

Trace loading a value into a register, storing it to memory, and reading
it back into a *different* register, starting from `registers = [0 0 0
0]`, `memory = [0 0 0 0]`:

```
load 0 42        → registers [42 0 0 0], memory unchanged
store-mem 0 2    → registers unchanged, memory [0 0 42 0]   (r0's value → address 2)
load-mem 1 2     → registers [42 42 0 0], memory unchanged  (address 2 → r1)
```

Register `1` ends holding `42` — not because it was ever loaded directly,
but because it was read back from the exact memory address register `0`'s
own value was written to. A value crossed from a register, into memory,
and back into a completely different register, with nothing but these two
new instructions moving it.

### CS Lens

Keeping memory access confined to dedicated `load`/`store` instructions,
with arithmetic only ever touching registers directly, is a real,
named, historically significant ISA design philosophy.

```
Also recognized in: real "load-store" architectures — RISC designs like
ARM and RISC-V — which deliberately forbid arithmetic instructions from
touching memory directly, for exactly the reason this unit's design
enforces it structurally; contrasted with "register-memory" architectures
like x86, where an instruction such as `add` really can operate on a
memory operand directly; and Lesson 201's upcoming virtual memory, whose
entire mechanism depends on every memory access genuinely going through
an instruction like `load-mem`/`store-mem` that the operating system can
intercept and reinterpret
```

### SE Lens

The real alternative — letting an arithmetic instruction reference memory
directly, folding what this unit split into two instructions (`load-mem`
then `add`) into one — can make a program shorter, fewer total
instructions for the same computation. Its real cost: that one
instruction now takes a genuinely unpredictable amount of time to run,
since a memory access is far slower than a register access, and the
hardware executing it has to handle a fundamentally more complex
instruction shape. Keeping every instruction uniformly simple and
memory-access explicit, as this unit does, costs more total instructions
but keeps every single one of them fast and predictable — the real,
still-actively-debated core of the historical RISC-versus-CISC design
argument.

---

## Concept Unit: Addressing Modes

### The Problem

`load-mem`'s address is always a literal number, fixed at the moment the
instruction was written. Walking through an array needs a *different*
address on every iteration — and nothing about a fixed literal in an
instruction's own text can change from one run to the next.

### Introduce the Concept in Isolation

Skipped — this unit's new instruction reuses only already-lab'd pieces
(`get-register`, `read-byte`); the new material is which value gets
treated as the address, demonstrated directly in the real trace below.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `exec-store-mem`, with a matching branch
  added to `exec-instruction`'s `cond`.
- **Dependencies**: Babashka, already installed.

### The New Code

`load-indirect` reads memory at whatever address a register currently
holds — the machine-level version of Lesson 192's `deref`:

```clojure
(defn exec-load-indirect
  [registers memory instruction]
  (set-register registers (get instruction 1) (read-byte memory (get-register registers (get instruction 2)))))
```

### The Updated Project

Adding this **addressing mode** to the dispatcher — one more `cond`
clause, identical in shape to every other:

```clojure
(defn exec-instruction
  [registers memory instruction]
  (cond
    (= (get instruction 0) "load") [(exec-load registers instruction) memory]
    (= (get instruction 0) "add") [(exec-add registers instruction) memory]
    (= (get instruction 0) "mult") [(exec-mult registers instruction) memory]
    (= (get instruction 0) "sub") [(exec-sub registers instruction) memory]
    (= (get instruction 0) "load-mem") [(exec-load-mem registers memory instruction) memory]
    (= (get instruction 0) "store-mem") [registers (exec-store-mem registers memory instruction)]
    (= (get instruction 0) "load-indirect") [(exec-load-indirect registers memory instruction) memory]
    true [registers memory]))
```

### Mechanical Walkthrough

Comparing `exec-load-mem` and `exec-load-indirect` side by side is the
entire lesson of this unit: `exec-load-mem` reads `(get instruction 2)`
— the instruction's own literal operand — directly as an address.
`exec-load-indirect` reads `(get-register registers (get instruction
2))` instead — **(a) first appearance**: the *same-shaped* operand now
names a *register to look up*, not an address to use directly, and
whatever that register currently holds is the real address. The
instruction's text never changes; its effective address can change every
single time it runs, depending on what's currently in the register it
names.

Trace walking through a four-byte array, `memory = [10 20 30 0]`, using
register `0` as a **register-indirect** pointer — starting it at address
`0`, reading through it, then advancing it before reading again:

```
registers = [0 0 0 0]
load 0 0            → r0 = 0                          [0 0 0 0]
load-indirect 1 0   → memory[get-register r0 = 0] = 10 [0 10 0 0]
load 2 1            → r2 = 1 (a constant "one")        [0 10 1 0]
add 0 0 2           → r0 = 0 + 1 = 1                   [1 10 1 0]
load-indirect 3 0   → memory[get-register r0 = 1] = 20 [1 10 1 20]
```

Register `3` ends holding `20` — the array's *second* element — reached
by moving register `0` forward by one and dereferencing it again, the
exact same "advance a pointer, then follow it" shape Lesson 192's own
`pointer-add` demonstrated directly in Clojure. Here it's built from two
plain instructions instead.

### CS Lens

Register-indirect addressing is what actually makes traversing a data
structure of unknown or varying size possible at the instruction level.

```
Also recognized in: this exact addressing mode's real name and presence
in every real ISA — x86, ARM, RISC-V all provide it; every array or
pointer traversal in a compiled C-like language, which compiles down to
precisely this pattern, an address held in a register and advanced each
iteration; and linked-list traversal at the machine level, register-
indirect addressing applied repeatedly, each dereference producing the
address the *next* one will use
```

### SE Lens

An instruction set offering only literal and direct-register addressing
— no register-indirect at all — was the available, simpler alternative,
and this section already built exactly that in Lesson 195. The real cost
of stopping there: it would be genuinely impossible to write a loop that
walks through an array or list of unknown length, since every distinct
address would need its own separately written instruction. Register-
indirect addressing, built in this unit, is what turns "read this exact
byte" into "read whatever this pointer currently points at" — at the
honest cost this unit's own comparison makes plain: an instruction's real
behavior now depends on a register's *current* value, not just the fixed
text of the instruction itself, which is a genuinely different, and
harder to predict just by reading, kind of instruction than anything
Lesson 195 built.

---

## Concept Unit: Comparison and Condition Flags

### The Problem

Lesson 195's `jump-if-zero` tested a register's value directly, every
single time it ran. Some real instruction sets take a different approach
entirely: compute a comparison once, store *only* the result, and let a
later jump react to that stored result instead of re-examining the
original values. Does that actually change anything about how control
flow works?

### Introduce the Concept in Isolation

Skipped — `compare` and the flag-reading jump reuse only already-lab'd
arithmetic and `if`; the real content is the design itself, shown
directly in the trace below.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `exec-load-indirect`.
- **Dependencies**: Babashka, already installed.

### The New Code

`compare` produces a **condition flag** — `1` if the two named registers
currently hold equal values, `0` otherwise — computed once and held
separately from every register:

```clojure
(defn exec-compare
  [registers instruction]
  (if (= (get-register registers (get instruction 1)) (get-register registers (get instruction 2))) 1 0))
```

### The Updated Project

A dedicated jump reacts to that flag directly, instead of naming any
register at all:

```clojure
(defn next-pc-flag
  [flag instruction pc]
  (if (= (get instruction 0) "jump-if-equal")
    (next-pc-flag-check flag instruction pc)
    (+ pc 1)))
```

```clojure
(defn next-pc-flag-check
  [flag instruction pc]
  (if (= flag 1)
    (get instruction 1)
    (+ pc 1)))
```

### Mechanical Walkthrough

Enumerating `exec-compare`'s body:

- `(get-register registers (get instruction 1))`, `(get-register
  registers (get instruction 2))` — **(c) already basic**; two registers'
  current values, read directly.
- `(if (= ...) 1 0)` — **(a) first appearance**: the comparison's result
  is thrown away as *registers* entirely — nothing about which two
  registers were compared survives past this one instruction; only the
  bare `1` or `0` does.

Enumerating `next-pc-flag`'s and `next-pc-flag-check`'s bodies:

- `(= flag 1)` — **(a) first appearance**: this jump's entire condition
  is the flag alone — no register is named in `jump-if-equal` at all,
  unlike `jump-if-zero`'s own `(get instruction 1)` naming exactly which
  register to test.

Trace `compare` and `jump-if-equal` on two registers that match, then two
that don't:

```
registers = [5 5 0 0]
compare 0 1 → 5 = 5 → flag 1
jump-if-equal 10, given flag 1 → jump taken, next pc = 10

registers = [5 3 0 0]
compare 0 1 → 5 ≠ 3 → flag 0
jump-if-equal 10, given flag 0 → not taken, next pc = pc + 1
```

The jump's own instruction, `["jump-if-equal" 10]`, is byte-for-byte
identical in both cases — its behavior differs entirely because of a
flag set by a *separate* instruction that ran before it, with no register
named anywhere in the jump itself.

### CS Lens

A dedicated condition flag, set by comparison and read by a later,
unrelated jump, is one of two real, competing, historically established
ISA designs for conditional control flow.

```
Also recognized in: real x86, whose actual FLAGS register includes a
zero flag working almost identically to this unit's own; ARM's condition-
code system, built the same way; and, as the direct contrasting case —
RISC-V and MIPS, which deliberately avoid flags entirely and compare-and-
branch using plain registers directly, exactly matching Lesson 195's own
`jump-if-zero` — meaning this section has now built real, working
examples of both major real ISA philosophies for conditional control
flow, not just one
```

### SE Lens

Lesson 195's register-tested `jump-if-zero` was the available
alternative, and it's genuinely simpler in one specific way: every
dependency a jump instruction has is fully visible right there in its own
operands — which register, checked against what. A flags-based design,
built in this unit, lets a jump react to a comparison without re-naming
any register, which can make instructions more compact, but creates a
real, hidden dependency: a jump's actual behavior depends on whatever
instruction most recently set the flag, which might be several
instructions earlier and isn't written anywhere in the jump itself. This
is a genuine correctness hazard real compilers, and real out-of-order
CPUs (foreshadowing Lesson 199's branch prediction and Lesson 200's
pipelines), have to track carefully — a flag set too early, or
overwritten by something unexpected in between, is a real, documented
class of bug specific to flag-based designs that register-tested designs
never have to worry about.

---

## Connect the Pieces

Follow one array, one pointer, and one comparison through every
instruction this lesson added. `store-mem` (first unit) writes a
computed value out to memory; `load-mem` reads it back into a different
register, confirming the round trip. `load-indirect` (second unit) reads
through a *register-held* address instead of a literal one, walking
`memory = [10 20 30 0]` one element at a time as register `0` is
advanced with ordinary `add` — the identical "advance, then dereference"
shape Lesson 192 already proved in plain Clojure, now expressed as two
machine instructions. `compare` and `jump-if-equal` (third unit) show a
second, genuinely different way the exact same kind of decision — "is
this true, then branch" — can be built: testing a register directly, as
Lesson 195 did, or reading a flag some earlier instruction already set.
Every one of these instructions still runs on the identical
`exec-instruction` dispatcher from the first unit — memory access,
addressing modes, and control flow are not three separate machines, only
three categories of instruction sharing one.

## What Breaks Without This

`load-mem` and `load-indirect` take an operand in the exact same
position, and read completely differently: one uses it as a literal
address, the other as a register to look up. Confuse them — write
`load-mem`, intending register-indirect behavior:

```
registers = [1 0 0 0]     ; r0 = 1, meant as a pointer to address 1
memory = [10 20 30 0]
```

```
load-mem 1 0
```

Trace it: `exec-load-mem` reads `(get instruction 2)` — the literal `0`
written directly in the instruction — as the address, completely
ignoring whatever register `0` actually holds. It reads `memory[0]`,
which is `10`, and stores it in register `1`. But the intent, based on
register `0` currently holding `1`, was to read `memory[1]`, which is
`20`. The instruction runs successfully, produces a valid-looking number,
`10`, in register `1` — and it is simply the wrong element, silently.
Nothing here crashes; `0` is a perfectly valid address, and `10` is a
perfectly valid byte. The bug is entirely in which **addressing mode**
was actually used versus which one the program's own logic assumed —
exactly the real, well-documented category of mistake that exists the
moment an ISA offers more than one way to interpret the same-shaped
operand. Writing `load-indirect 1 0` instead — reading register `0`'s
*value* as the address, rather than the literal `0` — is what would have
correctly read `memory[1] = 20`.

## Exercises

1. Trace `store-mem` and `load-mem` by hand for storing register `2`'s
   value (set it to `77` first with `load 2 77`) at address `3`, then
   loading address `3` back into register `0`.
2. Using `load-indirect`, trace reading the *third* element of `memory =
   [10 20 30 0]` by hand, starting register `0` at `0` and advancing it
   twice with `add` before the final `load-indirect`.
3. `exec-compare` only ever tests for equality. Sketch, in prose, what a
   `less-than` flag version would need to check instead, and what its
   own paired jump instruction (`jump-if-less`) would need to look like.
   No code required yet.

## Definition of Done

- [ ] `exec-load-mem`, `exec-store-mem`, and the updated `exec-instruction`
      and `run-program` are written and hand-traced for the
      register-to-memory-to-register round trip, matching this lesson's
      final register `1 = 42`.
- [ ] `exec-load-indirect` is written and hand-traced for the two-element
      array walk, matching register `3 = 20`.
- [ ] `exec-compare`, `next-pc-flag`, and `next-pc-flag-check` are written
      and hand-traced for both the matching-registers and
      non-matching-registers cases.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why `load-mem 1 0` silently reads the wrong
      element instead of crashing.
- [ ] Commit with a message explaining *why* the same operand position can
      mean two different things depending on addressing mode, not just
      *what* instructions were added.
