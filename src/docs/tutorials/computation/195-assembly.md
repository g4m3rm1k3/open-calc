# Lesson 195: Assembly

- **What you will build** — a tiny register machine with `load`, `add`,
  `mult`, and `sub` instructions, a nested arithmetic expression compiled
  by hand into a flat sequence of them, and a real jump-based loop —
  compiled from the exact same "count down and tally the iterations"
  shape every recursive function in this curriculum has used since
  Section II — that runs correctly on a program counter instead of
  recursive calls. The transferable problem: Section VIII's own `eval-env`
  ran a program by recursively walking a tree, re-interpreting its
  structure every single time. Real hardware has no tree, no recursion,
  and no structured `if` or loop at all — only a flat list of instructions
  and a counter saying which one runs next. Every structured construct
  this curriculum has ever written has to become *that*, eventually.
- **What you need to know first** — `get`, `assoc`, `[...]` (Section V);
  the `cond`-with-`true`-fallback dispatch pattern (Lesson 151); Section
  VIII's own compile-to-bytecode/VM pair (Lesson 182), a genuinely
  different design this lesson's register model contrasts against
  directly.
- **Terms introduced in this lesson**
  - **register** — one small, individually-numbered storage slot a
    machine instruction can read from or write to directly, distinct from
    a memory address in that there are only a handful of them, and every
    instruction can reach any of them in one step.
  - **instruction** — one primitive operation a machine can perform in a
    single step; everything a real program does is some sequence of
    these, however structured the source code that produced them looked.
  - **program counter (PC)** — a register, of a kind, holding the index
    of whichever instruction runs next; ordinary execution just
    increments it, and a jump is nothing more than setting it to
    something else instead.
  - **jump** — an instruction that changes the program counter directly,
    rather than letting it advance by one — the only control-flow
    primitive real hardware actually has; every `if` and every loop
    becomes some arrangement of jumps once compiled.
- **Objects and methods used**: None new. This lesson reuses `get`,
  `assoc`, `[...]`, `count` (Section V), `cons`, `first`, `rest`,
  `empty?` (Section II), `cond` (Lesson 151), `if`, `=`, `+`, `-`, `*`
  (Section I), each already covered.

---

## Concept Unit: Registers and Instructions

### The Problem

Every value in this section's earlier lessons lived in memory, addressed
by a number, or on a stack, addressed by a pointer. Real computation
needs somewhere faster and simpler to hold a handful of values actively
being worked on — a small, fixed set of named slots an instruction can
read or write in a single step, without any address arithmetic at all.

### Introduce the Concept in Isolation

Skipped — a register file is exactly a plain vector, built the same way
Lesson 191's `make-memory` was, and dispatching on an instruction's tag is
the same `cond`-with-`true`-fallback pattern already lab'd in Lesson 151.
Nothing syntactic here is new; the real code below applies both directly.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from this section's memory and stack work.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

A register file, built exactly like Lesson 191's memory:

```clojure
(defn make-registers-acc
  [remaining registers]
  (if (= remaining 0)
    registers
    (make-registers-acc (- remaining 1) (assoc registers (count registers) 0))))
```

```clojure
(defn make-registers [n] (make-registers-acc n []))
(defn get-register [registers r] (get registers r))
(defn set-register [registers r value] (assoc registers r value))
```

### The Updated Project

An **instruction** is a small vector — a tag naming the operation,
followed by whichever registers or values it needs. `load` sets a
register to a plain value directly; `add` and `mult` combine two
registers:

```clojure
(defn exec-load
  [registers instruction]
  (set-register registers (get instruction 1) (get instruction 2)))
```

```clojure
(defn exec-add
  [registers instruction]
  (set-register registers (get instruction 1)
                 (+ (get-register registers (get instruction 2)) (get-register registers (get instruction 3)))))
```

```clojure
(defn exec-mult
  [registers instruction]
  (set-register registers (get instruction 1)
                 (* (get-register registers (get instruction 2)) (get-register registers (get instruction 3)))))
```

One dispatcher decides which to run, based on the instruction's own first
slot:

```clojure
(defn exec-instruction
  [registers instruction]
  (cond
    (= (get instruction 0) "load") (exec-load registers instruction)
    (= (get instruction 0) "add") (exec-add registers instruction)
    (= (get instruction 0) "mult") (exec-mult registers instruction)
    true registers))
```

### Mechanical Walkthrough

Enumerating `make-registers-acc`'s body: identical in shape to Lesson
191's `make-memory-acc` — **(b) a hard concept reappearing**, the same
append-by-`assoc`-at-`count` pattern (Lessons 94, 96), building a
zero-initialized vector.

Enumerating `exec-load`'s, `exec-add`'s, and `exec-mult`'s bodies:

- `(get instruction 1)`, `(get instruction 2)`, `(get instruction 3)` —
  **(c) already basic**; an instruction's own operands, read by fixed
  position — which register to write, and which to read from.
- `set-register`, `get-register` — **(c) already basic**, just defined
  above.
- `+`, `*` — **(c) already basic**; the actual arithmetic each
  instruction performs, once its operands are in hand.

Enumerating `exec-instruction`'s body:

- `cond` with a `true` fallback — **(b) a hard concept reappearing**,
  Lesson 151's own dispatch pattern, here choosing which of three
  operations an instruction's tag names.

Trace three instructions in a row against `(make-registers 4)`:

```
registers = [0 0 0 0]
exec-instruction registers ["load" 0 5]  → set-register 0 5 → [5 0 0 0]
exec-instruction ...       ["load" 1 3]  → set-register 1 3 → [5 3 0 0]
exec-instruction ...       ["add" 2 0 1] → get-register 0=5, get-register 1=3
                                          → set-register 2 8 → [5 3 8 0]
```

Register `2` now holds `8` — the result of adding whatever was loaded
into registers `0` and `1`, using nothing but three primitive
instructions and no tree, no recursion, no notion of "expression" at all.

### CS Lens

A small register file plus a fixed set of one-step instructions is the
real, standard shape of every real instruction set, not a simplification
built only for this lesson.

```
Also recognized in: real instruction set architectures — x86, ARM,
RISC-V — every one of them built from exactly this register-plus-
instruction model; the actual machine code any compiled language on this
curriculum's own machine ultimately produces; and microcode, a layer
beneath even the instruction set doing something structurally similar at
a still finer grain
```

### SE Lens

A stack-based instruction set — no named registers at all, every
operation pushing and popping operands from a shared stack — was the
available alternative, and this curriculum already built one: Lesson
182's own compile-to-bytecode/VM pair. Register machines, built here, can
run faster, since a value already sitting in a register costs nothing
extra to reuse, but require a real, genuinely hard compiler problem —
register allocation — deciding which of a small, fixed number of
registers each value should live in. Stack machines sidestep that
decision entirely (there's nothing to allocate; everything just pushes
and pops), at the cost of a push or pop on very nearly every operation.
Neither is a strictly better design; real compilers targeting register
machines spend real, substantial engineering effort on allocation
specifically because of this tradeoff.

---

## Concept Unit: Compiling an Expression

### The Problem

`(+ a (* b c))` is a nested expression — Section VIII's own `eval-env`
would walk it as a tree, evaluating the inner `*` before the outer `+`,
recursively. A flat instruction sequence has no tree to walk. How does a
nested expression become a flat list of one-step instructions at all?

### Introduce the Concept in Isolation

Skipped — running a whole instruction list is ordinary structural
recursion over a list, and every individual instruction already covered
in the first unit; the real demonstration is the translation itself,
shown directly below.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `exec-instruction`.
- **Dependencies**: Babashka, already installed.

### The New Code

Running a whole program — a plain list of instructions — means executing
each one in order, threading the register file through every step:

```clojure
(defn run-program
  [registers program]
  (if (empty? program)
    registers
    (run-program (exec-instruction registers (first program)) (rest program))))
```

### The Updated Project

Skipped — no enclosing file exists yet; the program below is a standalone
list, run directly at the `bb` REPL.

`(+ a (* b c))`, with `a = 2`, `b = 3`, `c = 4` loaded into registers `0`,
`1`, `2`, the intermediate product held in register `3`, and the final
sum in register `4`:

```clojure
(list ["load" 0 2] ["load" 1 3] ["load" 2 4] ["mult" 3 1 2] ["add" 4 0 3])
```

### Mechanical Walkthrough

`run-program`'s body — **(b) a hard concept reappearing**: ordinary
structural recursion over a list (Section II), threading `registers`
through each call the same way every accumulator function in this
section already has.

The instruction list itself — **(a) first appearance**: this specific
ordering is the actual translation decision. `b * c` has to be computed,
in full, *before* the final `add` can run, because `add` needs the
product already sitting in a register — the exact dependency `eval-env`
would have followed automatically by recursing into the AST's inner node
first, made explicit here as instruction *order* instead.

Trace `run-program` against this five-instruction program:

```
registers = [0 0 0 0 0]
load 0 2  → [2 0 0 0 0]
load 1 3  → [2 3 0 0 0]
load 2 4  → [2 3 4 0 0]
mult 3 1 2 → 3×4=12 → [2 3 4 12 0]
add 4 0 3  → 2+12=14 → [2 3 4 12 14]
```

Register `4` holds `14` — `2 + (3 × 4)`, exactly `(+ a (* b c))`'s real
value, computed with no tree ever built, no recursion into an AST at all
— just five instructions run straight through, in an order chosen
specifically to have every value ready before the instruction that needs
it runs.

### CS Lens

Translating a nested expression into a flat, ordered instruction sequence
is real compiler code generation, not a simplification of it.

```
Also recognized in: real compiler backends, converting an AST — this
curriculum's own `eval-env` machinery from Section VIII — into exactly
this kind of flat instruction list; and "three-address code," a real,
standard compiler intermediate representation shaped almost identically
to this unit's own `add`/`mult` instructions, each one naming a
destination and two sources
```

### SE Lens

Section VIII's `eval-env` — walking the same nested expression as a tree,
recursively, every single time it runs — was the available alternative,
and this curriculum already built it. Tree-walking needs no separate
translation step; the tree *is* the program, interpreted directly.
Compiling to a flat sequence first, as this unit does, does real
translation work up front, but every subsequent run is then a straight,
cheap march through a list with no tree-structure to re-traverse — the
real, foundational reason a compiled program typically runs faster than
an interpreted one, at the honest cost of that translation step, and of
losing direct access to the original expression's shape once it's been
flattened into instructions.

---

## Concept Unit: Jumps and the Program Counter

### The Problem

Every program so far has run straight through, start to finish, exactly
once each. A loop — the "count down and tally the iterations" shape
behind nearly every recursive function this curriculum has ever written
— needs to run the *same* instructions more than once. A flat list has no
recursion to fall back into; something else has to make execution go
backward.

### Introduce the Concept in Isolation

Skipped — a program counter is a plain integer, and jumping is nothing
more than setting it to something other than "add one"; both pieces are
already-lab'd arithmetic and recursion, demonstrated directly below.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `run-program`.
- **Dependencies**: Babashka, already installed.

### The New Code

`sub` joins the instruction set, needed to count a register down:

```clojure
(defn exec-sub
  [registers instruction]
  (set-register registers (get instruction 1)
                 (- (get-register registers (get instruction 2)) (get-register registers (get instruction 3)))))
```

Deciding the **program counter**'s next value is its own function: an
ordinary instruction just advances it by one, `jump-if-zero` jumps only
when a named register is currently `0`, and plain `jump` always jumps:

```clojure
(defn next-pc
  [registers instruction pc]
  (cond
    (= (get instruction 0) "jump-if-zero") (next-pc-check registers instruction pc)
    (= (get instruction 0) "jump") (get instruction 1)
    true (+ pc 1)))
```

```clojure
(defn next-pc-check
  [registers instruction pc]
  (if (= (get-register registers (get instruction 1)) 0)
    (get instruction 2)
    (+ pc 1)))
```

### The Updated Project

`exec-instruction`'s dispatcher needs `sub` added; running a whole
program now has to index by program counter instead of walking a list
with `rest`, since a jump can move execution *anywhere*, not just
forward one step:

```clojure
(defn exec-instruction
  [registers instruction]
  (cond
    (= (get instruction 0) "load") (exec-load registers instruction)
    (= (get instruction 0) "add") (exec-add registers instruction)
    (= (get instruction 0) "mult") (exec-mult registers instruction)
    (= (get instruction 0) "sub") (exec-sub registers instruction)
    true registers))
```

```clojure
(defn run-program-pc
  [registers program pc]
  (run-program-pc-check registers program pc (get program pc)))
```

```clojure
(defn run-program-pc-check
  [registers program pc instruction]
  (if (= (get instruction 0) "halt")
    registers
    (run-program-pc (exec-instruction registers instruction) program (next-pc registers instruction pc))))
```

### Mechanical Walkthrough

Enumerating `next-pc`'s and `next-pc-check`'s bodies:

- `(get instruction 0)` compared against `"jump-if-zero"` and `"jump"` —
  **(c) already basic**, the same `cond` dispatch pattern, now deciding
  how the *program counter itself* changes instead of how a register
  changes.
- `(get instruction 2)` as `next-pc-check`'s jump target — **(a) first
  appearance**: a jump's destination is just another operand, sitting in
  the instruction, exactly like `add`'s source registers are.
- `(+ pc 1)` — **(c) already basic** arithmetic; ordinary, non-jumping
  execution — ninety percent of what a program counter does, in any
  program.

Enumerating `run-program-pc`'s and `run-program-pc-check`'s bodies:

- `(get program pc)` — **(a) first appearance**: fetching by *index*,
  not by walking with `rest` — the only way a jump backward or forward is
  even possible, since `rest` can only ever move one direction.
- `(= (get instruction 0) "halt")` — **(a) first appearance**: a program
  needs an explicit stopping instruction now that nothing about reaching
  the end of a list is guaranteed to happen in order anymore.
- `run-program-pc (exec-instruction ...) program (next-pc ...)` — **(b) a
  hard concept reappearing**: compute-once-pass-to-helper, threading both
  the updated registers and the newly decided program counter forward
  together.

Trace a program that counts a register down from `3` to `0`, tallying how
many iterations it took, indexed `0` through `7`:

```
0: ["load" 0 3]            r0 = 3   (the countdown)
1: ["load" 1 0]            r1 = 0   (the tally)
2: ["load" 2 1]            r2 = 1   (a constant "one" to add or subtract)
3: ["jump-if-zero" 0 7]    if r0 = 0, jump to halt
4: ["add" 1 1 2]           r1 = r1 + 1
5: ["sub" 0 0 2]           r0 = r0 - 1
6: ["jump" 3]              go back and check r0 again
7: ["halt"]
```

```
pc 0: load r0=3          → [3 0 0]   pc → 1
pc 1: load r1=0          → [3 0 0]   pc → 2
pc 2: load r2=1          → [3 0 1]   pc → 3
pc 3: r0=3, not 0        → [3 0 1]   pc → 4
pc 4: r1 = 0+1 = 1       → [3 1 1]   pc → 5
pc 5: r0 = 3-1 = 2       → [2 1 1]   pc → 6
pc 6: jump               → [2 1 1]   pc → 3
pc 3: r0=2, not 0        →           pc → 4
pc 4: r1 = 1+1 = 2       → [2 2 1]   pc → 5
pc 5: r0 = 2-1 = 1       → [1 2 1]   pc → 6
pc 6: jump                →           pc → 3
pc 3: r0=1, not 0        →           pc → 4
pc 4: r1 = 2+1 = 3       → [1 3 1]   pc → 5
pc 5: r0 = 1-1 = 0       → [0 3 1]   pc → 6
pc 6: jump                →           pc → 3
pc 3: r0=0!              → jump to 7
pc 7: halt                → return [0 3 1]
```

Register `1` ends at `3` — the countdown genuinely ran three times before
`jump-if-zero` finally fired, exactly matching the original countdown
value. This is the same "count down, tally the count" shape used by
countless recursive functions since Section II, here running on a
program counter jumping backward through eight flat instructions instead
of a function calling itself.

### CS Lens

A program counter, advanced by default and redirected by a jump, is
literally what every real CPU has, and the reason unrestricted `goto`
became a real, historically significant controversy.

```
Also recognized in: every real CPU's own program counter register,
functioning exactly this way; Edsger Dijkstra's famous, real 1968 letter
"Go To Statement Considered Harmful," arguing structured constructs
should replace raw jumps in source code specifically because jumps this
unbounded make a program's behavior hard to reason about; and this
curriculum's own `if` and recursive-loop constructs throughout Sections
II and VIII, which this unit's own program proves compile down to
exactly this jumping mechanism regardless of how structured they looked
in source form
```

### SE Lens

This curriculum has never once used a raw jump or `goto` — every loop has
been structural recursion, every branch a plain `if`. That restriction is
a real, deliberate discipline, imposed by the *source* language and
whatever compiles it, not by the hardware underneath: this unit's own
program is direct proof that the machine only ever had jumps to offer,
the entire time. Dijkstra's real argument was never that jumps don't
work — they demonstrably do, this unit just ran one — but that
unrestricted jumps let a program's control flow become arbitrarily
tangled, hard for a human to trace by eye. Structured constructs are a
real, valuable constraint on top of an unconstrained machine, not a
description of what the machine actually is.

---

## Connect the Pieces

Follow two different compiled programs through the identical register
machine this lesson built. `(+ a (* b c))`, compiled to five straight-line
instructions in the second unit, runs correctly with nothing but
`run-program`'s plain forward walk through a list — no jump, no program
counter, ever needed, because nothing about that computation repeats or
branches. The countdown loop, compiled to eight instructions with a
`jump-if-zero` and a `jump`, needs the third unit's `run-program-pc`
instead — indexed by a program counter that can move anywhere, not just
forward — and correctly tallies three iterations before halting. Both
programs run on the exact same `exec-instruction` dispatcher and the exact
same register file; the only real difference between "straight-line
arithmetic" and "a loop," at this level, is whether the program counter
ever gets redirected.

## What Breaks Without This

The countdown loop's `jump-if-zero` at index `3` targets index `7` — the
`halt` instruction — specifically because that's where the loop is
supposed to *stop*. Change that one target by one, aiming at index `6`
instead:

```
3: ["jump-if-zero" 0 6]
```

Trace what happens once `r0` finally reaches `0`, reusing this lesson's
own worked trace up through that point: at `pc 3` with `r0 = 0`, the
broken version jumps to `6` instead of `7`. Index `6` is `["jump" 3]` —
so execution immediately jumps right back to `3`. At `pc 3` again, `r0`
is *still* `0` — nothing between here and there ever touched it, since
the broken jump skipped straight past the `add`/`sub` instructions at `4`
and `5` — so `jump-if-zero` fires again, jumps to `6` again, which jumps
to `3` again. Every subsequent visit to `pc 3` is now identical in every
respect to the one before it: same register values, same instruction,
same jump target. Nothing in this loop can ever change again — it repeats
this exact two-step cycle forever, never reaching `halt` at index `7` at
all. (This was reasoned through by hand rather than actually run — the
argument itself is exact regardless: once `pc 3` and `r0 = 0` recur
identically with no instruction in between capable of changing either
one, the cycle is provably permanent.) A single wrong number in one jump
target — one off-by-one, indistinguishable from a correct program by
looking at any single instruction alone — is the entire difference
between a loop that finishes and one that never does. Restoring the
target to `7` is what gives the loop a real way out.

## Exercises

1. Trace `run-program` on `(list ["load" 0 6] ["load" 1 7] ["mult" 2 0
   1])` by hand, and state what register `2` holds when it finishes.
2. Trace this lesson's countdown loop by hand starting from `r0 = 0`
   instead of `3`, and state whether it runs the `add`/`sub` body at all
   before halting, or halts immediately — based on where `jump-if-zero`
   sits relative to the body in this lesson's own program.
3. Sketch, in prose, what a `jump-if-not-zero` instruction's `next-pc`
   logic would need to check instead of `jump-if-zero`'s — no code
   required yet.

## Definition of Done

- [ ] `make-registers`, `get-register`, `set-register`,
      `exec-instruction`, and `run-program` are written and hand-traced
      for the `(+ a (* b c))` example, matching this lesson's final
      register `4` value of `14`.
- [ ] `exec-sub`, `next-pc`, `next-pc-check`, and `run-program-pc` are
      written and hand-traced for the full eight-instruction countdown
      loop, matching the final tally, register `1 = 3`.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why the broken version's cycle is provably
      permanent rather than just "probably" stuck.
- [ ] Commit with a message explaining *why* a loop needs indexed access
      to the program (`run-program-pc`) while straight-line code doesn't
      (`run-program`), not just *what* functions were added.
