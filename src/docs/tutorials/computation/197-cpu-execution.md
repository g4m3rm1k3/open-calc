# Lesson 197: CPU Execution

- **What you will build** — `fetch`, `decode`, and `execute` split apart
  into their own real functions instead of fused together the way Lessons
  195 and 196 left them, a `resolve-pc` that starts from fetch's own
  *tentative* guess at the next instruction and only overrides it when
  execute reveals a jump actually happened, and a cycle counter measuring
  exactly how many times that whole cycle ran. The transferable problem:
  `run-program-pc` has quietly been doing fetch, decode, and execute
  together, as one step, since Lesson 195 — this lesson names each phase
  properly and, more importantly, makes explicit a real fact those earlier
  lessons glossed over: fetching the *next* instruction has to happen
  before anything downstream knows whether the *current* one is even
  going to jump somewhere else.
- **What you need to know first** — `get-register`, `exec-instruction`,
  `next-pc` (Lessons 195, 196); `get`, `[...]` (Section V); `cond`
  (Lesson 151).
- **Terms introduced in this lesson**
  - **fetch** — reading the instruction the program counter currently
    points to, and nothing more; it doesn't yet know what that
    instruction means or what it will do.
  - **decode** — figuring out *what operation* a fetched instruction
    actually names, before anything acts on it.
  - **execute** — actually performing the decoded operation — updating
    registers or memory, or, for a jump, deciding where control actually
    goes next.
  - **fetch-decode-execute cycle** — the repeating three-phase process
    every instruction goes through, one after another, for as long as a
    program runs.
- **Objects and methods used**: None new. This lesson reuses `get`,
  `[...]` (Section V), `cond`, `if`, `=`, `+` (already covered).

---

## Concept Unit: Fetch

### The Problem

`run-program-pc` (Lessons 195, 196) reads an instruction, decides what it
means, and runs it, all inside one tangled function. Before any of that
can be pulled apart and examined on its own terms, the very first step —
just reading what's at the program counter — needs its own name and its
own function.

### Introduce the Concept in Isolation

Skipped — `fetch` is a single `get` call, already fully covered; the real
content of this unit is naming and isolating it, not new syntax.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from Lesson 196's instruction set.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

`fetch` returns two things: the raw instruction sitting at the current
program counter, and a *tentative* next program counter — what it would
be if nothing about this instruction turns out to redirect it:

```clojure
(defn fetch
  [program pc]
  [(get program pc) (+ pc 1)])
```

### The Updated Project

This is a freestanding new function with nothing enclosing it yet —
Project Change already covers this case.

### Mechanical Walkthrough

Enumerating `fetch`'s body:

- `(get program pc)` — **(c) already basic**; the same indexed read
  `run-program-pc` already relied on.
- `(+ pc 1)` — **(c) already basic** arithmetic, but returning it
  *alongside* the instruction, rather than computing it later only if
  needed, is **(a) first appearance**: `fetch` commits to a guess about
  what comes next before anything has looked at what the instruction
  actually is.

Trace `fetch` against this lesson's own program, a countdown loop
identical in shape to Lesson 195's:

```
fetch program 0 → [["load" 0 3] 1]
fetch program 3 → [["jump-if-zero" 0 7] 4]
```

Both calls return a real instruction and a plain `pc + 1` — `fetch`
itself has no idea, and makes no attempt to find out, whether the second
one is about to send execution somewhere other than `4`.

### CS Lens

Treating "read the next instruction" as its own separable step, distinct
from deciding what it does, is a real, standard part of every CPU's own
design.

```
Also recognized in: a real CPU's own dedicated fetch stage in hardware;
instruction prefetching, a real optimization that only makes sense
because fetch can run ahead of decode and execute finishing the current
instruction; and Lesson 200's upcoming pipelining, which depends entirely
on fetch being genuinely separable from everything after it
```

### SE Lens

Keeping fetch fused inside one large step function, the way Lessons 195
and 196 effectively did, is simpler — fewer functions, less to name and
coordinate. Separating it out, as this unit does, changes nothing about
what this lesson's own program actually computes; the entire payoff is
two lessons away, once Lesson 200 needs to reason about fetch running
concurrently with the decode and execute of an *earlier* instruction — a
real architectural decision made now specifically because of what it
enables later, not because it improves anything today.

---

## Concept Unit: Decode and Execute

### The Problem

A raw instruction, `["add" 1 1 2]`, doesn't do anything by itself — its
first slot has to be recognized as naming an operation before anything
can act on the rest of it. Lesson 196's `exec-instruction` already made
that decision, but buried inside the same function that also carries it
out.

### Introduce the Concept in Isolation

Skipped — `decode` is a single `get`, and `execute` is a direct call to
Lesson 196's own `exec-instruction`; nothing syntactic here is new.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `fetch`.
- **Dependencies**: Babashka, already installed.

### The New Code

`decode` names exactly one thing: which operation a fetched instruction
is asking for.

```clojure
(defn decode
  [instruction]
  (get instruction 0))
```

### The Updated Project

`execute` is Lesson 196's `exec-instruction`, given its own name for this
three-phase framing:

```clojure
(defn execute
  [registers memory instruction]
  (exec-instruction registers memory instruction))
```

### Mechanical Walkthrough

`decode`'s body, `(get instruction 0)` — **(c) already basic**
mechanically, but naming this single read as its own phase, separate from
anything that follows, is **(a) first appearance**: `decode`'s entire job
ends the instant it knows *which* operation this is; it never touches a
register, memory, or the program counter.

`execute`'s body is a direct call to already-covered code — **(c) already
basic**. Worth naming honestly: this lesson's own `execute` still
receives the *raw* instruction, and `exec-instruction`'s own `cond`
re-examines its tag internally rather than accepting `decode`'s result
directly — a real, incomplete separation, not the full circuit-level
split a genuine CPU's decode stage performs. The value here is in giving
each conceptual phase its own name and boundary, not in fully rebuilding
`exec-instruction` around it.

Trace `decode` on two different instructions:

```
decode ["load" 0 3]         → "load"
decode ["jump-if-zero" 0 7] → "jump-if-zero"
```

Neither call needed `registers` or `memory` at all — decoding is
information extraction, nothing more, and that's exactly why it can be
its own phase: it depends on nothing except the instruction's own text.

### CS Lens

A dedicated decode step, separate from carrying an instruction out, is a
real part of every CPU's own pipeline, not a simplification.

```
Also recognized in: a real CPU's own decode stage, translating raw
instruction bits into internal control signals before any arithmetic
runs; the real, documented reason RISC instruction sets can decode
faster and simpler than CISC ones — RISC instructions were deliberately
designed to make this exact phase cheap; and this curriculum's own
lexer/parser split from Section VIII, "recognize what this is" kept
genuinely separate from "act on it," the identical structural idea one
level up
```

### SE Lens

Letting `execute` re-inspect an instruction's own tag directly — what
`exec-instruction`'s `cond` still does internally — is simpler than
building a genuinely separate decode stage that hands execute a fully
resolved operation with nothing left to re-check. The cost of the fuller
separation real hardware actually performs is real complexity: dedicated
decode circuitry, control signals wired to exactly the right execution
unit, and instruction-set design choices made specifically to keep that
circuitry small (the RISC argument, again). This lesson's own `decode`
is honest about being a partial version of that idea — enough to give
each phase real vocabulary and a real boundary, not a full hardware-
accurate reimplementation.

---

## Concept Unit: The Cycle, and When the Guess Is Wrong

### The Problem

`fetch`'s tentative next program counter is only ever *correct* for an
ordinary, non-jumping instruction. What actually happens once `execute`
runs a jump, and fetch's guess turns out to be wrong?

### Introduce the Concept in Isolation

Skipped — `resolve-pc` reuses only already-lab'd `cond` and comparisons;
the new material is the specific relationship between fetch's guess and
execute's authority to override it, shown directly in the trace below.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `execute`.
- **Dependencies**: Babashka, already installed.

### The New Code

`resolve-pc` starts from fetch's own tentative guess, and only overrides
it for the two instruction types that actually redirect control flow:

```clojure
(defn resolve-pc
  [registers instruction opcode tentative-pc]
  (cond
    (= opcode "jump-if-zero") (resolve-pc-check registers instruction tentative-pc)
    (= opcode "jump") (get instruction 1)
    true tentative-pc))
```

```clojure
(defn resolve-pc-check
  [registers instruction tentative-pc]
  (if (= (get-register registers (get instruction 1)) 0)
    (get instruction 2)
    tentative-pc))
```

### The Updated Project

One full cycle — fetch, decode, execute, then resolve the real next
program counter:

```clojure
(defn step
  [registers memory program pc]
  (step-with-fetch registers memory program (fetch program pc)))
```

```clojure
(defn step-with-fetch
  [registers memory program fetched]
  (step-with-decode registers memory program (get fetched 0) (get fetched 1) (decode (get fetched 0))))
```

```clojure
(defn step-with-decode
  [registers memory program instruction tentative-pc opcode]
  (step-finish (execute registers memory instruction) instruction opcode tentative-pc))
```

```clojure
(defn step-finish
  [state instruction opcode tentative-pc]
  [(get state 0) (get state 1) (resolve-pc (get state 0) instruction opcode tentative-pc)])
```

Running until `halt`, counting every cycle along the way:

```clojure
(defn run-cycles
  [registers memory program pc cycles]
  (run-cycles-check registers memory program pc cycles (get program pc)))
```

```clojure
(defn run-cycles-check
  [registers memory program pc cycles instruction]
  (if (= (get instruction 0) "halt")
    [registers memory cycles]
    (run-cycles-continue (step registers memory program pc) program cycles)))
```

```clojure
(defn run-cycles-continue
  [stepped program cycles]
  (run-cycles (get stepped 0) (get stepped 1) program (get stepped 2) (+ cycles 1)))
```

### Mechanical Walkthrough

Enumerating `resolve-pc`'s and `resolve-pc-check`'s bodies:

- `true tentative-pc` — **(a) first appearance**: for every opcode that
  isn't a jump, fetch's original guess simply *is* the answer — nothing
  further ever needs to run to confirm it.
- `(get instruction 1)` as `jump`'s own override — **(c) already basic**;
  identical to Lesson 195's own unconditional jump target.
- `resolve-pc-check`'s body — **(c) already basic**, the same comparison
  Lesson 195's `next-pc-check` already performed, now explicitly framed as
  *overriding* `tentative-pc` rather than computing a next value from
  nothing.

Enumerating `run-cycles`'s chain: **(b) a hard concept reappearing**
throughout — compute-once-pass-to-helper and accumulator recursion,
both used constantly since Section III, now counting cycles as a second
accumulated value alongside `registers`, `memory`, and `pc`.

Run this lesson's own countdown-loop program — identical in shape to
Lesson 195's, indices `0` through `7` — through `run-cycles`, starting
`registers = [0 0 0]`, `pc = 0`, `cycles = 0`:

```
pc 0: fetch → tentative 1, decode "load"    → not a jump, real next pc = 1
pc 1: fetch → tentative 2, decode "load"    → real next pc = 2
pc 2: fetch → tentative 3, decode "load"    → real next pc = 3
pc 3: fetch → tentative 4, decode "jump-if-zero", r0 = 3 ≠ 0 → real next pc = 4
pc 4: fetch → tentative 5, decode "add"     → real next pc = 5
pc 5: fetch → tentative 6, decode "sub"     → real next pc = 6
pc 6: fetch → tentative 7, decode "jump"    → OVERRIDDEN, real next pc = 3
   ... (this same 3→4→5→6 pattern repeats two more times) ...
pc 3: fetch → tentative 4, decode "jump-if-zero", r0 = 0 → OVERRIDDEN, real next pc = 7
pc 7: instruction is "halt" → run-cycles-check stops, no further step
```

Sixteen real steps run before `halt` is reached — every ordinary
instruction's tentative guess turned out correct, and exactly twice,
fetch's guess (`7` after the last `jump`, `4` after the last
`jump-if-zero`) was silently discarded in favor of `resolve-pc`'s real
answer. The final registers match Lesson 195's own result exactly, `r1 =
3`, and `run-cycles` additionally reports something Lesson 195 never
could: this program took precisely `16` fetch-decode-execute cycles to
run.

### CS Lens

The fetch-decode-execute cycle, and the gap between fetch's guess and
execute's authority to override it, is the single most standard way any
CPU's own operation is described.

```
Also recognized in: literally the named "fetch-decode-execute cycle"
taught in every computer architecture course, describing every real CPU
ever built; the exact tension between a fetched guess and a later
override that is the entire reason Lesson 199's branch prediction exists
at all — real hardware bets on fetch's tentative guess to avoid sitting
idle, and pays a real cost when that bet is wrong; and real performance
counters and profilers, which measure exactly what this unit's own
`run-cycles` does — how many cycles a program actually took
```

### SE Lens

Always computing the one, final, correct next program counter in a
single step — what Lessons 195 and 196's `next-pc` already did — is
simpler, and for a sequential simulator like this one, produces
identical results with less code. Real hardware can't afford that
simplicity: waiting for execute to fully finish before fetching anything
else means fetching, at best, one instruction per full cycle, with the
fetch unit sitting idle the entire time execute runs. Real CPUs fetch the
*next* instruction speculatively, on the tentative guess alone, while the
current one is still being decoded or executed — which only works because
fetch's guess is genuinely separable from execute's authority to
override it, exactly the structure built in this unit. The real cost,
when that guess turns out wrong, is Lesson 199's own subject: work
already done on the wrong assumption has to be thrown away.

---

## Connect the Pieces

Follow one program, the same countdown loop this whole section has built
toward, through fetch, decode, execute, and resolution as four
genuinely separate steps. `fetch` reads each instruction and guesses
`pc + 1` before anything downstream has looked at what that instruction
even is. `decode` extracts just its operation name. `execute` — Lesson
196's own `exec-instruction`, unchanged — carries it out. `resolve-pc`
starts from fetch's own guess and only overrides it twice in this
program's entire run: once for the unconditional `jump` looping back to
the top, and once for the final `jump-if-zero` that finally lets the loop
end. `run-cycles` ties all four together into one repeating cycle,
producing the exact same final answer Lesson 195's simpler
`run-program-pc` did, `r1 = 3`, plus a real number neither Lesson 195 nor
196 could report: sixteen cycles, the concrete cost of running this loop
to completion.

## What Breaks Without This

`resolve-pc`'s entire point is falling back to `tentative-pc` for
anything that isn't a jump. Break that fallback — return the *original*
`pc`, unchanged, instead:

```clojure
(defn resolve-pc-broken
  [registers instruction opcode tentative-pc pc]
  (cond
    (= opcode "jump-if-zero") (resolve-pc-check registers instruction tentative-pc)
    (= opcode "jump") (get instruction 1)
    true pc))
```

Trace what happens on the very first instruction, `["load" 0 3]` at `pc
0`: `fetch` correctly returns `tentative-pc = 1`. `decode` correctly
returns `"load"`. `execute` correctly sets `r0 = 3`. But
`resolve-pc-broken`'s `true` branch returns `pc`, which is still `0` —
not `1`. The next cycle fetches at `pc = 0` again — the *exact same*
`["load" 0 3]` instruction — decodes it the same way, executes it the
same way (setting `r0` to `3` again, no different from before), and
resolves to `pc = 0` again. Every subsequent cycle is now identical to
the one before it in every respect: same instruction, same result, same
next `pc`. This program can never reach `pc 1`, let alone the loop or
`halt` — it repeats its very first instruction forever, and `run-cycles`'
own cycle counter would climb without bound, never stopping to report a
result at all. (This was reasoned through by hand, not actually run, for
the same reason Lesson 195's own broken-jump demonstration was: once a
state and its successor are provably identical, the cycle is permanent by
construction, no execution required to confirm it.) Restoring
`tentative-pc` as the fallback is what lets fetch's own guess, made
before anything else ran, actually do its job for every instruction that
never needed overriding in the first place.

## Exercises

1. Trace `fetch`, `decode`, and `execute` by hand, as three separate
   calls, for the single instruction `["mult" 2 0 1]` against
   `registers = [4 5 0]`, and state what each of the three phases
   individually returns.
2. `run-cycles` counts every `step`, including the ones where
   `resolve-pc` overrides `tentative-pc`. Sketch, in prose, how
   `run-cycles` could be extended to *also* count separately how many of
   those steps were overridden — no code required yet.
3. This lesson's `execute` still lets `exec-instruction`'s own `cond`
   re-check the instruction's tag, even after `decode` already extracted
   it. Sketch, in prose, what `execute`'s signature would need to look
   like to accept `decode`'s result directly instead of re-deriving it.

## Definition of Done

- [ ] `fetch`, `decode`, and `execute` are written and hand-traced
      individually for at least one instruction each.
- [ ] `resolve-pc`, `resolve-pc-check`, `step`, and the full `step-with-*`
      chain are written and hand-traced for at least one non-jump and one
      overridden instruction.
- [ ] `run-cycles` is written and hand-traced for the full eight-
      instruction countdown loop, matching this lesson's `16`-cycle count
      and final `r1 = 3`.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why the broken version gets permanently
      stuck on the very first instruction rather than failing somewhere
      later in the program.
- [ ] Commit with a message explaining *why* fetch has to guess the next
      program counter before execute has run, not just *what* functions
      were added.
