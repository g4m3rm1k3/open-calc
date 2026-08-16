# Lesson 204: Compilers and Optimization

- **What you will build** — constant folding, replacing a sequence of
  instructions that only ever compute a fixed value with the value
  itself; dead code elimination, removing an instruction whose result
  nothing ever reads; and common subexpression elimination, reusing an
  already-computed result instead of recomputing it — three real,
  standard compiler optimizations, and, in this lesson's own closing
  section, a genuine, honest bug in the simplest version of the third
  one. The transferable problem: every instruction sequence built since
  Lesson 195 has been taken as a given, exactly as written, with no
  question asked about whether it was the *best* sequence for the job.
  A real compiler asks that question constantly, and every answer it
  gives has to be provably safe, not just plausible.
- **What you need to know first** — this section's own instruction format
  (Lessons 195, 196); `instruction-writes`, `instruction-reads`,
  `reads-register?` (Lesson 200); `and` (Lesson 7); memoization (Lesson
  38) — the runtime version of this lesson's own third idea.
- **Terms introduced in this lesson**
  - **compiler optimization** — a transformation a compiler applies to
    already-correct code to make it faster or smaller, without changing
    what it actually computes.
  - **constant folding** — computing a result at compile time instead of
    at runtime, whenever every value it depends on is already known.
  - **dead code elimination** — removing an instruction whose computed
    result is never read by anything, ever, before the program ends.
  - **common subexpression elimination (CSE)** — reusing an
    already-computed result instead of recomputing the identical
    operation on the identical operands a second time.
- **Objects and methods used**: None new. This lesson reuses `get`,
  `[...]` (Section V), `cond`, `and`, `if`, `=`, `+`, `nil?`, `empty?`,
  `first`, `rest` (already covered).

---

## Concept Unit: Constant Folding

### The Problem

`["load" 0 5] ["load" 1 3] ["add" 2 0 1]` always computes the same thing,
every single time it runs — `8` — because neither `5` nor `3` ever
changes. Running three instructions to produce a value that's already
fully determined before the program even starts is real, avoidable
wasted work.

### Introduce the Concept in Isolation

Skipped — this unit's checks are plain comparisons, already covered; the
real content is which sequences qualify, shown directly in the trace
below.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from this section's own instruction format.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Three instructions are **foldable** when the first two load plain
constants and the third adds exactly those two registers together —
nothing else could have changed them in between:

```clojure
(defn constant-instruction?
  [instruction]
  (= (get instruction 0) "load"))
```

```clojure
(defn foldable-add?
  [instr1 instr2 instr3]
  (and (constant-instruction? instr1)
       (constant-instruction? instr2)
       (= (get instr3 0) "add")
       (= (get instr3 2) (get instr1 1))
       (= (get instr3 3) (get instr2 1))))
```

### The Updated Project

Folding replaces all three with a single `load` of the precomputed sum:

```clojure
(defn fold-add
  [instr1 instr2 instr3]
  (list ["load" (get instr3 1) (+ (get instr1 1) (get instr2 1))]))
```

### Mechanical Walkthrough

Enumerating `foldable-add?`'s body: `and`, chaining five conditions —
**(c) already basic**, Lesson 7. `(= (get instr3 2) (get instr1 1))` —
**(a) first appearance**: confirms the `add`'s *first source register* is
exactly the register the first `load` just wrote — not merely that both
instructions exist, but that they're genuinely wired together.

Enumerating `fold-add`'s body: `(+ (get instr1 1) (get instr2 1))` —
**(a) first appearance**: the actual constant values, added *now*, at the
moment this function runs — which, applied to a real program before it
ever executes, is exactly what "compile time" means.

Trace both against `instr1 = ["load" 0 5]`, `instr2 = ["load" 1 3]`,
`instr3 = ["add" 2 0 1]`:

```
foldable-add? instr1 instr2 instr3
  constant-instruction? instr1 → true
  constant-instruction? instr2 → true
  (get instr3 0) = "add"       → true
  (get instr3 2) = 0 = (get instr1 1) = 0  → true
  (get instr3 3) = 1 = (get instr2 1) = 1  → true
  → true

fold-add instr1 instr2 instr3
  → (["load" 2 (5 + 3)]) → (["load" 2 8])
```

Three instructions become one, and register `2` ends up holding exactly
`8` either way — running the original three, or running the single
folded one, produce identical results, at a fraction of the cost.

### CS Lens

Precomputing a value the moment every input it depends on is already
known is a real, near-universal compiler optimization, performed by every
serious production compiler.

```
Also recognized in: real optimizing compilers (GCC, LLVM, and
essentially every other one in production use) performing exactly this
transformation, routinely; "peephole optimization," the real, standard
name for exactly this style — examining a small, local window of
adjacent instructions, exactly this unit's own three-instruction check;
and spreadsheet formula evaluation, which similarly computes any
all-constant sub-formula once, rather than recalculating it on every view
```

### SE Lens

Never folding constants — always emitting the literal computation and
letting it run fresh every single time the program executes — is simpler
compiler logic: no analysis needed at all. Its real cost is repeated,
identical, entirely avoidable runtime work, paid again on every single
run of code whose actual answer was already fixed before the program
even started. Folding costs real compile-time analysis effort — this
unit's own `foldable-add?` check — in exchange for runtime savings
multiplied by however many times that code actually executes, which,
inside a loop, can be a very large number indeed.

---

## Concept Unit: Dead Code Elimination

### The Problem

Not every instruction's result gets used. An instruction that writes a
register nothing ever reads again, before the program ends, does real
work — a real `load` or `add` — for a value that will never once matter.

### Introduce the Concept in Isolation

Skipped — this unit reuses Lesson 200's own `instruction-reads` and
`reads-register?` directly; nothing syntactic here is new.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `fold-add`.
- **Dependencies**: Babashka, already installed.

### The New Code

Which register an instruction writes — reusing Lesson 200's own
`instruction-writes`, renamed here to match this lesson's own
vocabulary — and whether anything *after* it ever reads that register
again:

```clojure
(defn used-later?
  [reg instructions]
  (if (empty? instructions)
    false
    (used-later-check reg (first instructions) (rest instructions))))
```

```clojure
(defn used-later-check
  [reg instruction rest-instructions]
  (if (reads-register? (instruction-reads instruction) reg)
    true
    (used-later? reg rest-instructions)))
```

### The Updated Project

An instruction is **dead** exactly when it writes a register, and nothing
after it ever reads that register again:

```clojure
(defn dead-instruction?
  [instruction rest-instructions]
  (dead-instruction-check (instruction-writes instruction) rest-instructions))
```

```clojure
(defn dead-instruction-check
  [written rest-instructions]
  (if (nil? written)
    false
    (if (used-later? written rest-instructions)
      false
      true)))
```

### Mechanical Walkthrough

Enumerating `used-later?`'s and `used-later-check`'s bodies —
**(b) a hard concept reappearing**: ordinary structural recursion over a
list (Section II), searching forward through everything that comes after
an instruction — the actual mechanism behind the real, standard compiler
analysis called liveness.

Enumerating `dead-instruction?`'s and `dead-instruction-check`'s bodies:
`(nil? written)` — **(c) already basic**, Lesson 136; an instruction that
writes nothing (a bare `jump`) can never be dead by this definition. The
`if`/`if` structure as a whole — **(a) first appearance**: "dead" is the
narrow case where a register *is* written, and genuinely *never* read
again — not merely unused so far, but unused for the rest of the program.

Trace `dead-instruction?` on the first instruction of two different
sequences:

```
dead-instruction? ["load" 3 99] (list ["add" 4 0 1] ["sub" 5 4 2])
  written = 3
  used-later? 3 (...) → neither instruction reads register 3 → false
  → true (DEAD)

dead-instruction? ["load" 0 5] (list ["add" 2 0 1])
  written = 0
  used-later? 0 (...) → ["add" 2 0 1] reads register 0 → true
  → false (not dead)
```

The first `["load" 3 99]` writes a register nothing downstream ever
touches again — pure waste, safe to delete outright. The second writes
register `0`, which the very next instruction genuinely needs — removing
it would change the program's real answer, not just its length.

### CS Lens

Removing an instruction whose result is provably never used again is a
real, universal compiler optimization, backed by a real, standard
analysis technique.

```
Also recognized in: real optimizing compilers performing this exact
elimination, near-universally; liveness analysis, the real, standard,
heavily studied compiler technique this unit's own simplified backward
scan is an honest instance of; and real linters and IDE "unused
variable" warnings, which perform essentially the same check, surfaced
to a human to decide rather than silently acted on by a compiler
```

### SE Lens

Keeping every computed value around regardless of whether anything ever
reads it again — "just in case" — needs no analysis at all, which is
genuinely simpler. Its real cost is wasted registers, wasted memory, and
wasted computation time spent producing values nothing will ever consume.
Eliminating dead code, built here, requires a real backward scan — "will
this ever be read again" — but recovers real resources for exactly the
values nobody needs, which is the entire, standard justification for
performing this analysis at all.

---

## Concept Unit: Common Subexpression Elimination

### The Problem

Two instructions computing the *exact* same operation on the *exact*
same operands, at two different points in a program, do the same real
work twice for no reason — the second one's answer was already sitting
in a register the moment the first one finished.

### Introduce the Concept in Isolation

Skipped — this unit's comparisons and substitutions reuse only
already-lab'd `and`, `cond`, and comparisons; the real content, and its
real limits, are demonstrated directly below and in this lesson's own
closing section.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `dead-instruction-check`.
- **Dependencies**: Babashka, already installed.

### The New Code

Two arithmetic instructions are a **redundant computation** when they
share the same operation and the same two source registers:

```clojure
(defn arithmetic-instruction?
  [instruction]
  (cond
    (= (get instruction 0) "add") true
    (= (get instruction 0) "sub") true
    (= (get instruction 0) "mult") true
    true false))
```

```clojure
(defn same-computation?
  [instr1 instr2]
  (and (= (get instr1 0) (get instr2 0))
       (= (get instr1 2) (get instr2 2))
       (= (get instr1 3) (get instr2 3))))
```

```clojure
(defn redundant-computation?
  [instr1 instr2]
  (and (arithmetic-instruction? instr1) (same-computation? instr1 instr2)))
```

### The Updated Project

Eliminating a redundant instruction means deleting it and rewriting every
*later* use of its own destination register to use the first
instruction's destination instead:

```clojure
(defn substitute-one
  [reg old-reg new-reg]
  (if (= reg old-reg) new-reg reg))
```

```clojure
(defn substitute-register
  [instruction old-reg new-reg]
  (cond
    (= (get instruction 0) "add") ["add" (get instruction 1) (substitute-one (get instruction 2) old-reg new-reg) (substitute-one (get instruction 3) old-reg new-reg)]
    (= (get instruction 0) "sub") ["sub" (get instruction 1) (substitute-one (get instruction 2) old-reg new-reg) (substitute-one (get instruction 3) old-reg new-reg)]
    (= (get instruction 0) "mult") ["mult" (get instruction 1) (substitute-one (get instruction 2) old-reg new-reg) (substitute-one (get instruction 3) old-reg new-reg)]
    true instruction))
```

### Mechanical Walkthrough

Enumerating `same-computation?`'s and `redundant-computation?`'s bodies:
`and` — **(c) already basic**. `arithmetic-instruction?` guarding first —
**(a) first appearance**: without it, two `load` instructions with the
same literal value would compare positions `2` and `3` that don't even
mean "source register" for `load` at all — a real category error this
check exists specifically to prevent.

Enumerating `substitute-register`'s and `substitute-one`'s bodies:
`cond` dispatch — **(c) already basic**. `substitute-one` applied to
*both* operand positions — **(a) first appearance**: a register rename
has to check every position it could appear in, not just the first one
that happens to match.

Trace redundancy detection and elimination on `instr1 = ["add" 2 0 1]`
and `instr2 = ["add" 5 0 1]` — both computing register `0` plus register
`1`:

```
redundant-computation? instr1 instr2
  arithmetic-instruction? instr1 → true
  same-computation? instr1 instr2
    "add" = "add" → true, 0 = 0 → true, 1 = 1 → true
  → true

substitute-register ["mult" 6 5 2] 5 2
  → ["mult" 6 (substitute-one 5 5 2) (substitute-one 2 5 2)]
  → ["mult" 6 2 2]
```

`instr2` is deleted outright, and any later instruction reading register
`5` — like `["mult" 6 5 2]` — is rewritten to read register `2` instead,
the register `instr1` already computed the identical value into. The
program's real answer is unchanged; one fewer instruction runs to reach
it.

### CS Lens

Reusing an already-computed result instead of recomputing it is not a
compiler-only idea — it's the exact same insight this curriculum has
already named, applied at a different time.

```
Also recognized in: real optimizing compilers performing this exact
elimination; memoization (Lesson 38) — the *runtime* version of this
identical idea, "don't recompute something already computed," applied
while a program is running instead of before it starts; and database
query planners, which detect and share identical subexpressions across
complex query plans for the same reason
```

### SE Lens

Never checking for redundant computation — always recomputing everything
fresh, trusting that individual instructions are cheap enough not to
matter — needs no analysis at all. The real cost this unit's own closing
section takes seriously: detecting redundancy correctly is genuinely
harder than it first looks, and a naive version of this check, exactly
the one built in this unit, has a real, honest gap — demonstrated next.

---

## Connect the Pieces

Follow one small program through all three optimizations this lesson
built, and notice how they can feed each other. `foldable-add?` and
`fold-add`, applied to `["load" 0 5] ["load" 1 3] ["add" 2 0 1]`, replace
all three with `["load" 2 8]` — and in doing so, already accomplish what
`dead-instruction?` would otherwise have had to find separately: the
original two `load` instructions are gone entirely, not merely proven
unused. `redundant-computation?`, checked against a *different* pair of
instructions computing the identical `add` twice, finds a case folding
never touches — both instructions already reference registers, not
constants — and `substitute-register` removes the duplicate the same way
`dead-instruction?` would remove any other instruction nothing depends on
anymore. All three optimizations are answering the same underlying
question in different shapes: is this instruction's own work already
done, somewhere, by something else?

## What Breaks Without This

`same-computation?` only compares two instructions' own tags and operand
*register numbers* — never whether anything wrote a *new value* into
either of those registers in between. Insert a genuine redefinition
between the two "identical" instructions:

```
instr1 = ["add" 2 0 1]     ; r2 = r0 + r1, computed while r0 = 5, r1 = 3 → r2 = 8
instrX = ["load" 0 99]     ; r0 is now 99 — a real, intervening change
instr2 = ["add" 5 0 1]     ; r5 = r0 + r1, but r0 is now 99, so r5 should be 102
```

Trace `redundant-computation? instr1 instr2` exactly as this unit's own
functions are written: it never looks at `instrX` at all — its only
inputs are `instr1` and `instr2` themselves. `same-computation?` compares
tags (`"add"` = `"add"`) and register numbers (`0 = 0`, `1 = 1`), all of
which still match, and reports `true`. Applying the elimination this unit
built — deleting `instr2` and substituting register `5` for register `2`
in everything after it — would make any later instruction that expected
`instr2`'s real answer, `102`, silently receive `instr1`'s stale answer,
`8`, instead. `instr1`'s `8` and the correct answer for `instr2`, `102`,
are genuinely different numbers, because register `0` held a genuinely
different value at each point — and nothing in this lesson's own
`same-computation?` ever checked for that. This is a real, well-known
danger in naive common subexpression elimination: comparing register
*names* is not the same as confirming the *values* those names held were
actually still the same at both points. Real compilers close this gap
with more careful analysis — tracking every point a register is
redefined, and treating any "redundant" candidate as invalidated the
moment its own source registers are written to again in between. This
lesson's own simplified check has no such tracking, which is an honest,
named limitation, not a hidden one.

## Exercises

1. Trace `foldable-add?` and `fold-add` on `["load" 0 10] ["load" 1 20]
   ["add" 2 0 1]`, and state the single resulting instruction.
2. Trace `dead-instruction?` on `["mult" 7 2 3]` given the rest of the
   program is `(list ["add" 8 7 1])`, and again given the rest of the
   program is `(list ["add" 8 1 1])` instead — state which case is dead
   and why the difference matters.
3. Using this lesson's own closing section, sketch in prose what
   `redundant-computation?` would need to additionally check to correctly
   handle the broken example — given the full instruction list between
   `instr1` and `instr2`, what would it need to confirm about every
   instruction in between? No code required yet.

## Definition of Done

- [ ] `constant-instruction?`, `foldable-add?`, and `fold-add` are
      written and hand-traced, matching this lesson's `["load" 2 8]`
      result.
- [ ] `used-later?`, `used-later-check`, `dead-instruction?`, and
      `dead-instruction-check` are written and hand-traced for both the
      dead and not-dead examples.
- [ ] `arithmetic-instruction?`, `same-computation?`,
      `redundant-computation?`, `substitute-one`, and
      `substitute-register` are written and hand-traced, matching this
      lesson's `["mult" 6 2 2]` result.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why `instr1`'s answer, `8`, and the correct
      answer for `instr2`, `102`, are genuinely different numbers, not
      just a labeling mismatch.
- [ ] Commit with a message explaining *why* correct common subexpression
      elimination needs to track intervening writes, not just *what*
      functions were added.
