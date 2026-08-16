# Lesson 211: Context Switching

- **What you will build** — `save-context` and `restore-context`,
  writing a thread's live registers, program counter, and stack pointer
  into its own saved record and reading them back out again; a real,
  quantified overhead ratio showing that a short time slice can spend
  more cycles switching than actually running; and a demonstration that
  switching costs more than the raw register save/restore alone,
  because the newly resumed process's data is very likely gone from the
  cache. The transferable problem: Lesson 210's round-robin scheduler
  picks a *new* process to run every time slice, as if that switch were
  free. It never is — something has to physically move a thread's live
  state out of the CPU and another thread's state into it, and that
  movement has a real, measurable cost every single time it happens.
- **What you need to know first** — thread control blocks, `make-
  thread`, its accessors (Lesson 209); round-robin and time slices
  (Lesson 210); `access2`, `run-accesses` (Lesson 198); Lesson 92's
  rebuild-with-one-field-changed pattern.
- **Terms introduced in this lesson**
  - **context switch** — the act of saving one thread's live CPU state
    and loading another's in its place — the real, physical cost behind
    every scheduling decision Lesson 210 made for free.
  - **context-switch overhead** — the real time a context switch itself
    costs, separate from and in addition to any actual work either
    thread does.
  - **cache pollution** — a real, named effect: switching to a different
    thread whose data isn't in the cache, forcing it to pay cold-cache
    miss costs a continuously running thread wouldn't have to.
- **Objects and methods used**: None new. This lesson reuses `[...]`,
  `get` (Section V), `*`, `+`, `/` (Section I), each already covered.

---

## Concept Unit: Saving and Restoring

### The Problem

Lesson 210's schedulers pick *which* process runs next, but say nothing
about what actually happens to the process that was running a moment
ago. Its registers, program counter, and stack pointer don't disappear —
something has to remember exactly where it stopped, so it can pick back
up later as if nothing happened.

### Introduce the Concept in Isolation

Skipped — `save-context` is Lesson 92's own rebuild-with-fields-changed
pattern, already fully covered; the real content is what it's applied
to, shown directly below.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from Lesson 209's thread control blocks.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Saving a **context** means writing the thread's *current, live* state
back into its own saved record:

```clojure
(defn save-context
  [thread registers pc stack-pointer]
  (make-thread (thread-tid thread) registers pc stack-pointer))
```

Restoring one means reading that saved state back out, ready to become
the CPU's live state again:

```clojure
(defn restore-context
  [thread]
  [(thread-registers thread) (thread-pc thread) (thread-stack-pointer thread)])
```

### The Updated Project

This is a freestanding pair of new functions with nothing enclosing them
yet — Project Change already covers this case.

### Mechanical Walkthrough

`save-context`'s body — **(c) already basic** as syntax, Lesson 92's own
pattern; applying it here, to a thread's *entire live state* rather than
one tree node's field, is **(a) first appearance**.

`restore-context`'s body, returning a triple — **(a) first appearance**:
the reverse operation, handing back exactly what a scheduler needs to
make this thread's own state the CPU's live state again.

Trace a thread that ran for a while, then got saved, then restored.
`thread-a` starts `make-thread 1 [0 0 0] 0 8`. Suppose it actually runs
and its live registers, program counter, and stack pointer become `[5 5
5]`, `10`, and `6`:

```
save-context thread-a [5 5 5] 10 6
  → make-thread 1 [5 5 5] 10 6
  → thread-a' = [1 [5 5 5] 10 6]

restore-context thread-a'
  → [(thread-registers thread-a') (thread-pc thread-a') (thread-stack-pointer thread-a')]
  → [[5 5 5] 10 6]
```

`restore-context` returns exactly `[5 5 5]`, `10`, `6` — the identical
state the thread was in the moment it was saved. Whatever runs next can
load those three values as the CPU's own live registers, program
counter, and stack pointer, and `thread-a` continues exactly where it
left off, with no memory of ever having been paused.

### CS Lens

Saving one thread's live CPU state and loading another's is the real,
literal mechanism behind every scheduling decision any real operating
system ever makes.

```
Also recognized in: the real, standard "context switch" every real
operating system performs on every single scheduling decision — saving
registers, program counter, and stack pointer to the outgoing thread's
own saved state, loading them from the incoming one; Lesson 193's own
stack-frame save-and-resume, the identical idea at the scale of one
function call instead of a whole thread; and this curriculum's own
rebuild-with-one-field-changed discipline (Lesson 92), now applied to
literally saving and restoring live CPU state
```

### SE Lens

Never saving or restoring anything at all — always letting exactly one
thread run to completion before ever considering another — is the
available alternative, and it needs no context-switching machinery
whatsoever. That's exactly what running with no scheduler at all would
mean, and it's exactly what Lesson 210's entire scheduling apparatus
exists to avoid: without it, everything except the one running thread
starves, permanently. Context switching, built here, is not optional
overhead layered on top of scheduling — it's the real mechanism that
makes running more than one thing on one CPU possible at all.

---

## Concept Unit: The Real Cost, Quantified

### The Problem

`save-context` and `restore-context` are real operations, not free
ones — writing and reading several register values costs real cycles.
Round-robin's own time slice determines how *often* that cost gets paid.
How badly can a badly chosen time slice make that cost dominate?

### Introduce the Concept in Isolation

Skipped — this unit's formulas are plain arithmetic, already covered;
the real content is what the ratio reveals, shown directly below.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `restore-context`.
- **Dependencies**: Babashka, already installed.

### The New Code

Switching costs saving *and* restoring — twice however many registers a
thread carries:

```clojure
(defn context-switch-cost
  [register-count]
  (* 2 register-count))
```

### The Updated Project

What fraction of the *total* time — switch cost plus actual work — is
pure overhead:

```clojure
(defn switch-overhead-ratio
  [switch-cost time-slice]
  (/ switch-cost (+ switch-cost time-slice)))
```

### Mechanical Walkthrough

`context-switch-cost`'s body, `(* 2 register-count)` — **(a) first
appearance**: one full save, one full restore, each touching every
register once.

`switch-overhead-ratio`'s body — **(a) first appearance**: not a
cost in cycles, a *fraction* — what portion of the CPU's time, across one
full slice-plus-switch cycle, was spent on the switch itself rather than
the thread's real work.

Trace both for an `8`-register thread, first with a short time slice,
then a longer one:

```
context-switch-cost 8 → 16

switch-overhead-ratio 16 10 → 16 / 26 ≈ 0.615    (10-cycle time slice)
switch-overhead-ratio 16 100 → 16 / 116 ≈ 0.138   (100-cycle time slice)
```

With a `10`-cycle time slice, over sixty percent of the CPU's total time
is pure switching overhead — more time spent moving state around than
doing any actual work. Stretch the time slice to `100` cycles, and the
identical `16`-cycle switch cost drops to under fourteen percent of the
total. The switch itself never got cheaper; only how often it gets paid
did.

### CS Lens

A fixed per-event cost, priced against how often that event actually
happens, is the same accounting shape Lessons 198 and 199 already used
for cache misses and mispredictions, applied here to scheduling itself.

```
Also recognized in: real, documented, measured context-switch costs in
real operating systems, a genuine, well-known systems-performance
concern; and the real, live tradeoff actual scheduler designers tune
directly — a shorter time slice improves responsiveness and fairness
(Lesson 210's own concern) but raises overhead exactly the way this
unit's own ratio shows; a longer one reduces overhead but weakens
Lesson 210's own fairness guarantee, since a waiting process might sit
through an entire long slice belonging to someone else
```

### SE Lens

A very long time slice minimizes switching overhead, this unit's own
formula makes that direct — but Lesson 210 already established the real
cost of that choice: round-robin's own fairness guarantee gets weaker
the longer each slice runs, since anyone waiting has to wait through the
*entire* slice of whoever's currently running. This lesson's overhead
concern and Lesson 210's fairness concern pull in genuinely opposite
directions from the same knob — there is no time-slice length that
optimizes both at once, only a real, honest tradeoff a real scheduler
has to choose a point along.

---

## Concept Unit: Cache Pollution

### The Problem

`context-switch-cost` only prices moving registers. A newly resumed
thread's *data* — whatever it had in cache before being paused — is
almost certainly gone by the time it runs again, replaced by whatever
ran in between. Does that cost anything real, on top of the register
cost already measured?

### Introduce the Concept in Isolation

Skipped — this unit reuses Lesson 198's own `run-accesses` directly,
already fully covered; the real content is the reinterpretation, shown
below.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script; no new
  functions, only a reinterpretation of Lesson 198's own two results.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Lesson 198's own two already-measured totals, reread through this
lesson's lens:

```clojure
(run-accesses [nil nil] memory (list 0 1 2 3) 2 2 0)
```

### The Updated Project

Skipped — no enclosing file exists yet; this is a reinterpretation of an
already-run call, not a new one.

### Mechanical Walkthrough

Lesson 198's own four-address sequential trace, `22` cycles, is exactly
what a thread's memory access costs *if it keeps running uninterrupted*
— every access after the first in each block gets a cheap hit, because
nothing else had a chance to evict what it just cached. If that same
thread is instead context-switched away after every single access, and
resumed later — with some other thread's data having filled the cache
in between — every one of its accesses meets a cold cache, none of them
ever getting the chance to hit. That's exactly Lesson 198's *other* own
number: `4 × 10 = 40`, the cost of the identical four addresses with no
cache benefit at all.

```
uninterrupted:            22 cycles
switched every access:    40 cycles
extra cost from switching, beyond context-switch-cost itself: 18 cycles
```

**This is called cache pollution**: the resumed thread's own cache
benefit — the exact locality Lesson 198 spent an entire lesson deriving
— gets wiped out by whatever ran in between, on top of the register
save/restore cost already priced in the second unit.

### CS Lens

A context switch costing more than its own register save/restore,
because of what it does to a thread's cached data, is a real, documented
systems effect with its own real name.

```
Also recognized in: the real, standard term "cache pollution" (or
"cold cache" effects) in real operating-systems performance analysis,
describing exactly this phenomenon; and "CPU affinity" scheduling, a
real, standard technique where a scheduler deliberately tries to keep a
given thread running on the same CPU core repeatedly, specifically to
preserve its warm cache state across switches instead of losing it every
time
```

### SE Lens

Pricing a context switch using only `context-switch-cost` — register
save and restore alone — is simpler, and it's what the second unit's own
formula does. This unit's own comparison shows that simplification can
be badly incomplete: the cache-pollution cost, `18` extra cycles in this
lesson's own small example, is comparable to or larger than the raw
register cost itself. A scheduler tuned only against the second unit's
formula would systematically underestimate the true cost of switching
too often — real, modern schedulers account for this explicitly, which
is exactly why techniques like CPU affinity exist at all.

---

## Connect the Pieces

Follow one thread through a full, honestly priced switch. `save-context`
writes its live state — registers, program counter, stack pointer — into
its own saved record; `restore-context` reads that same state back out
later, letting it resume exactly where it stopped. `context-switch-cost`
prices the raw mechanics of that save and restore — `16` cycles for an
eight-register thread. `switch-overhead-ratio` shows that cost can
dominate a short time slice, over sixty percent overhead at ten cycles
per slice. And the third unit's own reinterpretation of Lesson 198's
numbers adds one more real cost neither `save-context` nor
`context-switch-cost` ever touches: the thread's own cached data,
possibly wiped out entirely by whatever ran while it was paused, an
extra `18` cycles this lesson's own small example already showed. None
of these three costs is optional or hypothetical — every one of them is
paid, for real, every time Lesson 210's own scheduler decides it's time
for someone else to run.

## What Breaks Without This

`save-context` returns a *new* thread record — Lesson 92's own
discipline, followed exactly. Everything in this lesson depends on
whoever calls it actually using that returned value, not an older one
still sitting in scope. Suppose a scheduler saves `thread-a`'s progress
correctly, but later restores from the *original*, pre-save `thread-a`
instead of the fresh one `save-context` actually returned:

```clojure
(restore-context thread-a)
```

Trace it: `thread-a`, never reassigned, still holds its *very first*
state — `[0 0 0]`, `pc 0`, `sp 8` — exactly what it was before it ever
ran. `save-context thread-a [5 5 5] 10 6` earlier produced a genuinely
new value, `thread-a'`, holding the real, current progress — but nothing
requires whoever calls `restore-context` later to actually use
`thread-a'` instead of the stale `thread-a` still sitting in scope.
Restoring from `thread-a` instead returns `[[0 0 0] 0 8]` — the thread's
state resets to exactly where it started, silently discarding every bit
of real progress it made. Nothing throws an error; `restore-context`
runs correctly, on a value that is itself completely valid — it simply
isn't the *right* value. This is the same danger this curriculum's own
immutability discipline has protected against since Lesson 1, made
concrete at real stakes for the first time: `save-context` never mutates
`thread-a` in place — it can't, nothing in this language does — which
means the responsibility for actually using its returned value, and not
an old binding still lying around, falls entirely on whoever calls it.
A real scheduler has to track the *current* saved record for every
thread with exactly the same care this whole curriculum has always
required for passing along a function's real return value.

## Exercises

1. Trace `save-context` and `restore-context` for a thread with a
   *different* register count than this lesson's own example — five
   registers instead of three — and confirm `restore-context` still
   returns exactly what was saved.
2. Using `context-switch-cost` and `switch-overhead-ratio`, compute the
   overhead ratio for a `4`-register thread (switch cost `8`) at time
   slices of `20` and `200` cycles, and state which one a fairness-
   sensitive, latency-critical system would likely prefer despite the
   higher overhead.
3. Sketch, in prose, how "CPU affinity" — keeping a thread on the same
   core across switches — would need to interact with Lesson 210's own
   round-robin scheduler, given that round-robin, as built, has no
   notion of *which* CPU a process last ran on at all. No code required
   yet.

## Definition of Done

- [ ] `save-context` and `restore-context` are written and hand-traced,
      matching this lesson's `[[5 5 5] 10 6]` round trip.
- [ ] `context-switch-cost` and `switch-overhead-ratio` are written and
      hand-traced for both the `10`-cycle and `100`-cycle time slices,
      matching roughly `0.615` and `0.138`.
- [ ] The cache-pollution reinterpretation of Lesson 198's own `22`- and
      `40`-cycle results is understood well enough to state, without
      notes, which number corresponds to a thread that keeps running
      uninterrupted.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why `restore-context thread-a` is not a
      bug in `restore-context` itself.
- [ ] Commit with a message explaining *why* a context switch's real
      cost includes cache effects, not just the register save and
      restore, not just *what* functions were added.
