# Lesson 207: Systems-Level Debugging

- **What you will build** — nothing new. This is Section IX's checkpoint,
  matching the format established at Lessons 108, 138, 158, and 183: a
  challenge, an attempt of your own, a companion implementation with one
  real planted bug, and a reveal — not the ordinary Concept Unit
  structure.
- **What you need to know first** — this entire section. The register
  machine and its addressing modes (Lessons 195, 196); `fetch`/`decode`/
  `execute` (Lesson 197); memory, pointers, and `load-indirect`
  specifically (Lessons 191, 192, 196); two's complement and its real
  range (Lesson 188); the stack (Lesson 193). This checkpoint exists to
  find out whether the vocabulary this whole section built is actually
  usable to catch a real, planted mistake — not to teach anything further
  itself.

---

## The Challenge

Below is a small program, written in this section's own register-machine
instruction format, meant to sum the three elements of an array stored in
memory at addresses `0`, `1`, and `2`, holding the values `10`, `20`, and
`30`. It uses a pointer (register `0`) that starts at the array's base
address and advances by one each iteration, an accumulator (register
`1`), a countdown (register `2`), and a constant `1` (register `3`) to
step both of the others.

Before reading any further, trace it by hand, instruction by instruction,
exactly the way every lesson in this section has traced its own code.
Track all five registers' values at every step. Confirm — or refute —
that register `1` ends up holding `60`, the true sum of `10`, `20`, and
`30`.

```
0:  load 0 0
1:  load 1 0
2:  load 2 3
3:  load 3 1
4:  jump-if-zero 2 10
5:  load-mem 4 0
6:  add 1 1 4
7:  add 0 0 3
8:  sub 2 2 3
9:  jump 4
10: halt
```

Memory: `[10 20 30 0]`. Registers start `[0 0 0 0 0]`. `pc` starts `0`.

There is exactly one planted mistake in this program — not a crash, not
a missing instruction, a single wrong choice that still runs from start
to finish and produces a plausible-looking, wrong number. Find it before
reading the reveal below.

---

## Attempt It Yourself

Trace every cycle. At each `jump-if-zero` check, confirm register `2`'s
real current value against what the program's own logic requires. At
every `add`/`sub`, confirm which registers are being read and written.
Pay particular attention to instruction `5` — what does its own
addressing mode actually do, and does that match what register `0`'s
advancing value is supposed to accomplish? This section spent an entire
lesson, 196, specifically on the difference between two addressing modes
that look almost identical in an instruction's own text. That lesson's
own closing section is worth re-deriving from memory before continuing.

---

## The Companion Implementation

Here is the full, honest trace of the program exactly as written above —
not a hint, the real, complete execution:

```
pc 0: load 0 0      → r0 = 0                          [0 0 0 0 0]
pc 1: load 1 0      → r1 = 0                          [0 0 0 0 0]
pc 2: load 2 3      → r2 = 3                          [0 0 3 0 0]
pc 3: load 3 1      → r3 = 1                          [0 0 3 1 0]
pc 4: jump-if-zero 2 10 → r2 = 3 ≠ 0, not taken        pc → 5

pc 5: load-mem 4 0  → r4 = memory[0] = 10              [0 0 3 1 10]
pc 6: add 1 1 4     → r1 = 0 + 10 = 10                 [0 10 3 1 10]
pc 7: add 0 0 3     → r0 = 0 + 1 = 1                   [1 10 3 1 10]
pc 8: sub 2 2 3     → r2 = 3 - 1 = 2                   [1 10 2 1 10]
pc 9: jump 4        → pc → 4

pc 4: jump-if-zero 2 10 → r2 = 2 ≠ 0, not taken        pc → 5
pc 5: load-mem 4 0  → r4 = memory[0] = 10              [1 10 2 1 10]
pc 6: add 1 1 4     → r1 = 10 + 10 = 20                [1 20 2 1 10]
pc 7: add 0 0 3     → r0 = 1 + 1 = 2                   [2 20 2 1 10]
pc 8: sub 2 2 3     → r2 = 2 - 1 = 1                   [2 20 1 1 10]
pc 9: jump 4        → pc → 4

pc 4: jump-if-zero 2 10 → r2 = 1 ≠ 0, not taken        pc → 5
pc 5: load-mem 4 0  → r4 = memory[0] = 10              [2 20 1 1 10]
pc 6: add 1 1 4     → r1 = 20 + 10 = 30                [2 30 1 1 10]
pc 7: add 0 0 3     → r0 = 2 + 1 = 3                   [3 30 1 1 10]
pc 8: sub 2 2 3     → r2 = 1 - 1 = 0                   [3 30 0 1 10]
pc 9: jump 4        → pc → 4

pc 4: jump-if-zero 2 10 → r2 = 0, TAKEN                pc → 10
pc 10: halt         → final registers: [3 30 0 1 10]
```

Register `1` ends at `30`, not `60`.

---

## The Reveal

Register `0` — the pointer — is not actually broken. It advances
correctly, every iteration: `0`, then `1`, then `2`, exactly as intended,
confirmed directly in the trace above. The countdown, the constant, the
loop's own exit condition — all correct, all doing exactly what Lessons
193 through 197 already established they should.

The bug is instruction `5`: `load-mem 4 0`. `load-mem`, built in Lesson
196, reads its second operand as a **literal address**, written directly
into the instruction's own text — not a register to look up. `load-mem 4
0` means "load register `4` from *address* `0`," every single time it
runs, regardless of anything register `0` currently holds. Register `0`
faithfully advances to `1`, then `2` — and instruction `5` never once
looks at it. It reads `memory[0]`, the literal number `0`, three times in
a row, because that literal is baked into the instruction's own text and
never changes.

The intended instruction was `load-indirect 4 0` — **register-indirect**
addressing, Lesson 196's own second unit: "load register `4` from
whatever address *register* `0` currently holds." That single word,
`load-mem` instead of `load-indirect`, is the entire bug. Both
instructions are perfectly valid, perfectly ordinary instructions in this
section's own instruction set; neither one crashes, and the buggy version
runs start to finish, updates every register exactly as it should except
the one that matters, and produces a plausible, entirely wrong final
sum — `30`, three copies of the array's first element, instead of `60`,
the sum of all three.

This is precisely the danger Lesson 196's own closing section named
directly: the same operand position can mean two completely different
things depending on addressing mode, and nothing about reading the
instruction's *shape* — one tag, two register-looking numbers — reveals
which one is in play. The only way to catch it is exactly what this
challenge asked for: tracing real values, real registers, real memory,
step by step, and checking whether what actually happened matches what
the program's own intent required.

**The fix** — replacing instruction `5`:

```
5: load-indirect 4 0
```

Re-run the trace with this one change, and register `1` ends the program
holding `60`, correctly, with every other instruction and every other
register value completely unchanged.

## Definition of Done

- [ ] The original, buggy trace was completed by hand, independently,
      before reading "The Companion Implementation" above, and arrived at
      `30` (or at least suspected something was wrong with the sum).
- [ ] The specific bug — `load-mem` instead of `load-indirect` at
      instruction `5` — was identified before reading "The Reveal," or, if
      not, is now understood well enough to explain aloud, without notes,
      exactly why register `0`'s correct advancement was never enough to
      fix it.
- [ ] The corrected program was traced by hand from instruction `5`
      onward for at least the second iteration, confirming register `1`
      reaches `60` at the end.
- [ ] One sentence, written down, stating in your own words why two
      instructions that differ by a single word, with otherwise identical
      shape, can produce a plausible-looking wrong answer instead of a
      crash — the actual reason this checkpoint exists.
