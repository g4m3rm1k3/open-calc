# Lesson 200: Pipelines

- **What you will build** — a real throughput comparison between running
  instructions one full fetch-decode-execute cycle at a time and running
  them with their phases overlapped, a formula deriving Lesson 199's flat
  misprediction penalty directly from how deep a pipeline actually is,
  and a real, verified check for a second, entirely different kind of
  pipeline problem: one instruction needing a value another one hasn't
  finished computing yet. The transferable problem: Lesson 197 split
  fetch, decode, and execute into three separate phases but still ran
  them one at a time, for one instruction, before starting the next.
  Nothing forces that — the three phases belong to three genuinely
  different pieces of hardware, and the entire reason Lesson 199's
  predictions had a real cost is that real CPUs run them **overlapped**.
- **What you need to know first** — `fetch`, `decode`, `execute` (Lesson
  197); `predict-*`, misprediction cost (Lesson 199); this section's
  register-machine instruction format (`["add" dest src1 src2]`, Lessons
  195, 196).
- **Terms introduced in this lesson**
  - **pipeline** — running each of several instructions' phases
    overlapped in time, so a new instruction's fetch can begin while an
    earlier one's decode or execute is still in progress.
  - **pipeline stage** — one phase of the pipeline (fetch, decode,
    execute), each working on a *different* instruction at the same time.
  - **throughput** — how many instructions finish per unit of time, once
    the pipeline is running steadily — the real number a pipeline exists
    to improve.
  - **pipeline flush** — discarding every instruction currently mid-flight
    on a mispredicted path, the real, physical cost behind Lesson 199's
    misprediction penalty.
  - **control hazard** — Lesson 199's own branch misprediction, given its
    real, standard name: a hazard caused by not yet knowing which
    instruction should even be fetched next.
  - **data hazard** — a different real hazard: an instruction needing a
    value another, still-in-flight instruction hasn't finished producing
    yet.
- **Objects and methods used**: None new. This lesson reuses `get`,
  `cond`, `if`, `=`, `+`, `-`, `*`, `empty?`, `first`, `rest`, `nil?`
  (already covered).

---

## Concept Unit: Overlapping Instructions

### The Problem

Every trace this section has run so far — Lesson 197's `run-cycles`
included — finished one instruction's entire fetch-decode-execute cycle
before starting the next. Nothing about fetch, decode, and execute
actually requires that; they're separate operations. What does running
several instructions' phases *overlapped* instead of one full cycle at a
time actually buy?

### Introduce the Concept in Isolation

Skipped — comparing two arithmetic formulas is already-covered arithmetic;
the real content is what each formula represents, shown directly below.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from Lesson 197's fetch-decode-execute cycle.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Running instructions with no overlap at all: every one of `stages` phases
runs fully before the next instruction's *first* phase can even begin —
`stages` time units per instruction, every time:

```clojure
(defn non-pipelined-time
  [stages n]
  (* stages n))
```

### The Updated Project

A real **pipeline**: filling it takes `stages` time units for the very
first instruction to finish, and after that, one *more* instruction
finishes every single time unit:

```clojure
(defn pipelined-time
  [stages n]
  (+ stages (- n 1)))
```

### Mechanical Walkthrough

`non-pipelined-time`'s body, `(* stages n)` — **(c) already basic**
arithmetic; `stages` phases, paid in full, `n` separate times.

`pipelined-time`'s body — **(a) first appearance**: `stages` alone
accounts for filling the pipeline once — instruction `1`'s fetch, decode,
*and* execute, none of it overlapping anything, since nothing came before
it — and `(- n 1)` accounts for every instruction after that, each one
needing only *one* more time unit once the pipeline is already full and
running steadily.

Trace both formulas for `n = 4` instructions through a `3`-stage
pipeline, and the real per-time-unit picture `pipelined-time` is
summarizing:

```
non-pipelined-time 3 4 → 12
pipelined-time     3 4 → 3 + 3 → 6

time:     1   2   3   4   5   6
instr 1:  F   D   E
instr 2:      F   D   E
instr 3:          F   D   E
instr 4:              F   D   E
```

Instruction `1` finishes at time `3`; every instruction after it finishes
exactly one time unit later than the one before it — instruction `4`
finishes at time `6`, matching `pipelined-time 3 4` exactly. The
non-pipelined alternative would need `12` full time units for the same
four instructions — twice as long, for identical work, simply because
nothing was allowed to overlap.

### CS Lens

Overlapping several items' different stages of processing, rather than
finishing one completely before starting the next, is a real idea far
older than CPU design.

```
Also recognized in: every real modern CPU's own instruction pipeline,
built on exactly this overlap; assembly-line manufacturing, the literal,
historical origin of the word "pipeline" — different cars at different
stations on the same line at the same time; and this curriculum's own
Section VIII interpreter, whose lexer, parser, and evaluator are staged
the same structural way, though — worth being honest about — never
actually overlapped in time the way a real pipeline requires
```

### SE Lens

Staying non-pipelined — one full fetch-decode-execute cycle per
instruction, nothing overlapped — is genuinely simpler: only one
instruction is ever "in flight," so there's no possibility of one
instruction's fetch interfering with another's execute, and none of this
lesson's own remaining problems (flushes, hazards) can happen at all.
This unit's own formula already prices that simplicity: twice the time,
for the four-instruction example, and the gap only grows for a longer
program. Pipelining buys real throughput at the cost of real new
correctness questions — which is exactly why the rest of this lesson
exists.

---

## Concept Unit: Flushing — Where Lesson 199's Penalty Comes From

### The Problem

Lesson 199 assumed a flat, five-cycle cost for every misprediction,
without ever explaining where that number should come from. A pipeline
gives a real answer: when a branch resolves, however many instructions
were already mid-flight behind it, fetched or decoded on the wrong
assumption, have to be thrown away.

### Introduce the Concept in Isolation

Skipped — this unit's functions are plain arithmetic, already covered;
the real content is what that arithmetic represents, shown in the trace
below.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `pipelined-time`.
- **Dependencies**: Babashka, already installed.

### The New Code

Once a branch reaches execute — the *last* of `stages` phases — every
stage *ahead* of execute already holds an instruction fetched or decoded
on the not-yet-confirmed guess. That's exactly `stages - 1` instructions:

```clojure
(defn flush-cost
  [stages]
  (- stages 1))
```

### The Updated Project

Comparing when the real next instruction after a branch finishes,
predicted correctly versus mispredicted:

```clojure
(defn correct-finish-time
  [branch-start stages]
  (+ branch-start stages))
```

```clojure
(defn mispredicted-finish-time
  [branch-start stages]
  (+ (correct-finish-time branch-start stages) (flush-cost stages)))
```

### Mechanical Walkthrough

`flush-cost`'s body, `(- stages 1)` — **(a) first appearance**: every
stage before execute is one instruction's worth of speculative,
now-wasted work — exactly the **pipeline flush** this unit's own Terms
entry names.

`correct-finish-time`'s and `mispredicted-finish-time`'s bodies — **(c)
already basic** arithmetic, composing already-defined pieces: the second
adds `flush-cost`'s own penalty directly onto the first's correct-case
answer.

Trace both for a branch starting fetch at time `1`, in a `3`-stage
pipeline — the same shape the first unit already diagrammed:

```
flush-cost 3 → 2

correct-finish-time 1 3      → 1 + 3 = 4
mispredicted-finish-time 1 3 → 4 + 2 = 6

time (misprediction case):  1   2   3   4      5   6
branch (instr 1):           F   D   E(resolves: WRONG!)
speculative instr 2:            F   D  ← flushed
speculative instr 3:                E  ← flushed
real instr 2':                          F   D   E
```

The branch itself finishes normally, at time `3`. If it had been
predicted correctly, the real next instruction would have finished at
time `4` — `correct-finish-time`'s own answer. Because it was
mispredicted, two speculative instructions have to be discarded, and the
real next instruction doesn't start fetching until time `4`, finishing at
time `6` — exactly `mispredicted-finish-time`'s answer, and exactly
`flush-cost`'s `2` cycles later than it should have. Lesson 199's own
flat, assumed five-cycle penalty was never arbitrary: it corresponds
almost exactly to a `6`-stage pipeline — `flush-cost 6` is `5` — much
closer to a real CPU's actual depth than this lesson's small, three-stage
teaching example.

### CS Lens

A pipeline's depth and its misprediction cost are directly, provably
linked — not two separate design decisions that happen to correlate.

```
Also recognized in: the real, documented historical relationship
between pipeline depth and misprediction penalty across real CPU
generations — deeper pipelines have consistently paid larger real
misprediction costs, for exactly the structural reason this unit derives;
and Lesson 199's own flat penalty assumption, now explained rather than
simply asserted
```

### SE Lens

A shallower pipeline pays a smaller flush cost on every misprediction —
`flush-cost`'s own formula makes that direct and unavoidable — but the
first unit's own formula shows a shallower pipeline also captures less
total throughput benefit to begin with, since there's less to overlap in
the first place. A deeper pipeline gains more raw throughput when
predictions hold up, and loses more when they don't. Real CPU designers
have made this exact tradeoff differently across real, shipped
generations — some deliberately shallow and simpler, some deep and
reliant on the kind of prediction quality Lesson 199 already showed has
its own real limits.

---

## Concept Unit: Data Hazards

### The Problem

Lesson 199's branches are one real pipeline problem — not knowing *which*
instruction to fetch next. A completely different one exists even with
no branch involved at all: one instruction needing a *value* that an
earlier, still-in-flight instruction hasn't finished computing yet.

### Introduce the Concept in Isolation

Skipped — this unit's functions compose only already-lab'd `cond`,
recursion, and comparisons; the real content is the dependency itself,
demonstrated directly in the trace below.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `mispredicted-finish-time`.
- **Dependencies**: Babashka, already installed.

### The New Code

Which register an instruction *writes*, and which ones it *reads*,
reusing this section's own instruction format:

```clojure
(defn instruction-writes
  [instruction]
  (cond
    (= (get instruction 0) "add") (get instruction 1)
    (= (get instruction 0) "sub") (get instruction 1)
    (= (get instruction 0) "mult") (get instruction 1)
    (= (get instruction 0) "load") (get instruction 1)
    true nil))
```

```clojure
(defn instruction-reads
  [instruction]
  (cond
    (= (get instruction 0) "add") (list (get instruction 2) (get instruction 3))
    (= (get instruction 0) "sub") (list (get instruction 2) (get instruction 3))
    (= (get instruction 0) "mult") (list (get instruction 2) (get instruction 3))
    true (list)))
```

### The Updated Project

A **data hazard** exists between two instructions exactly when the
second one reads a register the first one writes:

```clojure
(defn reads-register?
  [reads-list r]
  (if (empty? reads-list)
    false
    (if (= (first reads-list) r) true (reads-register? (rest reads-list) r))))
```

```clojure
(defn data-hazard?
  [instr1 instr2]
  (data-hazard-check (instruction-writes instr1) (instruction-reads instr2)))
```

```clojure
(defn data-hazard-check
  [written reads-list]
  (if (nil? written)
    false
    (reads-register? reads-list written)))
```

### Mechanical Walkthrough

Enumerating `instruction-writes`'s and `instruction-reads`'s bodies:
`cond` dispatching on the instruction's own tag — **(c) already basic**,
Lesson 151. `(get instruction 1)` as the write target, `(get instruction
2)`/`(get instruction 3)` as the two read sources — **(c) already
basic**, the exact operand positions Lesson 195's own `exec-add` and
friends already relied on.

Enumerating `reads-register?`'s body — **(b) a hard concept
reappearing**: ordinary structural recursion over a list (Section II),
searching for one matching value.

Enumerating `data-hazard?`'s and `data-hazard-check`'s bodies:
`instruction-writes instr1`, `instruction-reads instr2` — **(c) already
basic**, just defined above. `(nil? written)` — **(c) already basic**,
Lesson 136; an instruction with nothing written (a bare `jump`, say) can
never cause this kind of hazard for anything after it.

Trace `data-hazard?` on two pairs of instructions — one genuinely
dependent, one not:

```
data-hazard? ["add" 1 0 2] ["sub" 3 1 2]
  writes: register 1
  reads:  registers (1 2)
  reads-register? (1 2) 1 → true            → HAZARD

data-hazard? ["add" 1 0 2] ["sub" 3 4 2]
  writes: register 1
  reads:  registers (4 2)
  reads-register? (4 2) 1 → false           → no hazard
```

The first pair genuinely conflicts: the second instruction reads register
`1`, and the first instruction is the one computing what register `1`
will hold. If both were mid-flight in a pipeline at once — the first
still in execute while the second is already in decode, trying to read
register `1`'s current value — the second instruction would read a stale
or wrong value, not the one the first is about to produce. The second
pair shares no register at all; nothing prevents them running fully
overlapped.

### CS Lens

A later instruction needing a value an earlier, still-in-flight one
hasn't produced yet is a real, named, standard category of pipeline
hazard, distinct from Lesson 199's own branch problem.

```
Also recognized in: "read-after-write" hazards, the real, standard name
for exactly this dependency in computer architecture; real compilers'
own instruction-scheduling passes, which deliberately reorder
independent instructions specifically to hide dependencies like this one
behind other useful work; and, contrasted directly — Lesson 199's branch
misprediction, this lesson's own **control hazard**, the other of the
two major real hazard categories (a third, structural hazards — two
instructions needing the same physical hardware at once — is real but
outside this lesson's scope)
```

### SE Lens

Always pausing the pipeline the instant any data hazard is detected —
stalling until the earlier instruction fully finishes — is correct and
simple, guaranteed to never read a stale value, at the cost of losing
real pipelining benefit every single time a dependency like this occurs.
Real hardware often does better: **forwarding** (or bypassing), routing a
just-computed value directly from one instruction's execute output into
the very next instruction's execute input, without waiting for it to be
written back and read again through the normal register path — avoiding
the stall for many, though not all, real hazard cases. This lesson's own
`data-hazard?` only *detects* the conflict; a full resolution, stalling
or forwarding, is real additional machinery this lesson doesn't build —
an honest limit, not an oversight.

---

## Connect the Pieces

Follow one small program through every idea this lesson built. Four
ordinary instructions, run through a `3`-stage pipeline, finish in `6`
time units instead of `12` — the first unit's real throughput gain.
Replace the first of them with a branch: if it's mispredicted, the two
instructions already speculatively in flight behind it get flushed, and
the real next instruction finishes two cycles later than it otherwise
would have — `flush-cost 3`, derived directly from how deep the pipeline
is, not assumed the way Lesson 199 had to. And `data-hazard?`, checked
between any two adjacent instructions regardless of whether either one is
a branch at all, catches a completely separate problem: `["add" 1 0 2]`
followed immediately by `["sub" 3 1 2]` can never safely overlap in a
pipeline, no matter how well the branch predictor performs, because the
second instruction's own correctness depends on a value the first hasn't
finished computing yet.

## What Breaks Without This

`instruction-reads` is supposed to report *every* register an instruction
reads — for `add`, `sub`, and `mult`, that's both operand positions,
`2` and `3`. Report only one of them:

```clojure
(defn instruction-reads-broken
  [instruction]
  (cond
    (= (get instruction 0) "add") (list (get instruction 2))
    (= (get instruction 0) "sub") (list (get instruction 2))
    (= (get instruction 0) "mult") (list (get instruction 2))
    true (list)))
```

Trace `data-hazard?` (using this broken version internally) on
`["add" 1 0 2]` followed by `["sub" 3 4 1]` — a genuine hazard, since the
second instruction's *third* slot, not its second, is the one reading
register `1`:

```
writes: register 1
reads (broken): only position 2 → register 4
reads-register? (4) 1 → false → "no hazard"
```

The broken version reports no hazard at all — but the real instruction,
`["sub" 3 4 1]`, genuinely computes `register 4 minus register 1`, and
register `1` is exactly what the first instruction is still producing.
This is a real, silent false negative: the check runs successfully,
returns a clean `false`, and the actual dependency it existed to catch
slips through completely undetected. If a real pipeline trusted this
check to decide whether it's safe to overlap two instructions, it would
overlap these two, and the second instruction would read register `1`'s
stale or incomplete value instead of waiting for the real result — a
genuine correctness bug, caused entirely by a hazard detector that only
checked half of what it needed to. Restoring both operand positions,
`2` and `3`, in `instruction-reads` is what closes the gap.

## Exercises

1. Trace `non-pipelined-time` and `pipelined-time` by hand for `n = 6`
   instructions through a `4`-stage pipeline, and state the real speedup
   (as a ratio) between them.
2. Using `flush-cost`, `correct-finish-time`, and `mispredicted-finish-
   time`, compute the real cost of a misprediction in a `5`-stage
   pipeline for a branch starting fetch at time `10`.
3. Trace `data-hazard?` on `["load" 2 7]` followed by `["mult" 5 2 2]`,
   and state, in one sentence, why a `load` instruction's own hazard
   check only ever needs `instruction-writes`, never `instruction-reads`,
   to find what it writes.

## Definition of Done

- [ ] `non-pipelined-time` and `pipelined-time` are written and
      hand-traced for `n = 4`, `stages = 3`, matching this lesson's `12`
      and `6`.
- [ ] `flush-cost`, `correct-finish-time`, and `mispredicted-finish-time`
      are written and hand-traced for `stages = 3`, matching `2`, `4`,
      and `6`.
- [ ] `instruction-writes`, `instruction-reads`, `reads-register?`,
      `data-hazard?`, and `data-hazard-check` are written and hand-traced
      for both the hazard and no-hazard example pairs.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why the broken `instruction-reads` produces
      a false negative rather than a crash.
- [ ] Commit with a message explaining *why* Lesson 199's flat
      misprediction penalty can now be derived from pipeline depth instead
      of assumed, not just *what* functions were added.
