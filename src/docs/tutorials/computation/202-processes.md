# Lesson 202: Processes

- **What you will build** — a **process control block** bundling
  registers, program counter, stack pointer, and page table into one
  value for the first time, a real demonstration of two such bundles
  coexisting with genuinely independent state and genuinely isolated
  memory, and a simple, honest process lifecycle — ready, running,
  terminated — with a `find-runnable` scan that's the first, minimal
  piece of what a real scheduler would need. The transferable problem:
  every lesson from 193 through 201 quietly assumed only *one* program
  ever existed at a time — one stack, one set of registers, one page
  table, tracked as separate top-level values. A **process** is what
  happens once more than one of those has to exist, and be kept straight,
  at the same time.
- **What you need to know first** — registers (Lesson 195); the program
  counter (Lesson 197); the stack pointer (Lesson 193); page tables and
  isolation (Lesson 201); the multi-slot-vector-as-state convention
  (Lessons 130, 131, 133).
- **Terms introduced in this lesson**
  - **process** — one running program, from the operating system's point
    of view: not just its code, but everything about its current state
    that has to be tracked and kept separate from every other process.
  - **process control block (PCB)** — the real, standard name for the
    actual record an operating system keeps for each process — its
    registers, program counter, stack pointer, page table, and status,
    bundled together as one thing.
  - **PID (process ID)** — a unique number identifying one process, used
    to find or refer to it among however many others currently exist.
  - **process state** — where a process currently is in its own
    lifecycle — this lesson's own simplified three: **ready** (able to
    run, not currently running), **running** (actively executing right
    now), and **terminated** (finished, for good).
- **Objects and methods used**: None new. This lesson reuses `[...]`,
  `get` (Section V), `if`, `=`, `empty?`, `first`, `rest` (already
  covered).

---

## Concept Unit: The Process Control Block

### The Problem

Lessons 195 through 201 each tracked their own piece of a running
program's state — registers, a program counter, a stack pointer, a page
table — as separate, independent values, always assuming exactly one
program was ever in play. Tracking *more than one* program means all four
pieces need to travel together, as one thing, per program.

### Introduce the Concept in Isolation

Skipped — a **process control block** is exactly the multi-slot-vector-
as-state convention already lab'd in Lessons 130, 131, and 133; nothing
syntactic here is new, only which pieces of this section's own prior
lessons are being bundled together for the first time.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from this section's registers, stack, and virtual
  memory work.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

A process control block, and named accessors for each of its slots — the
exact same accessor-per-field convention Lesson 92 established for tree
nodes:

```clojure
(defn make-process
  [pid registers pc stack-pointer page-table]
  [pid registers pc stack-pointer page-table])
```

```clojure
(defn process-pid [process] (get process 0))
(defn process-registers [process] (get process 1))
(defn process-pc [process] (get process 2))
(defn process-stack-pointer [process] (get process 3))
(defn process-page-table [process] (get process 4))
```

### The Updated Project

A running process's registers and program counter change every cycle
(Lesson 197's own `step`) — updating a process means building a *new*
process value with one slot changed, everything else carried forward
unchanged:

```clojure
(defn process-with-registers
  [process new-registers]
  (make-process (process-pid process) new-registers (process-pc process)
                (process-stack-pointer process) (process-page-table process)))
```

```clojure
(defn process-with-pc
  [process new-pc]
  (make-process (process-pid process) (process-registers process) new-pc
                (process-stack-pointer process) (process-page-table process)))
```

### Mechanical Walkthrough

Enumerating `make-process`'s body: `[pid registers pc stack-pointer
page-table]` — **(a) first appearance**: this specific five-slot bundle
is the actual new content of this unit — registers (Lesson 195), a
program counter (Lesson 197), a stack pointer (Lesson 193), and a page
table (Lesson 201), named here as fields of one thing for the first time
in this curriculum.

Enumerating the accessors: each `(get process N)` — **(c) already
basic**, the identical pattern already established for every multi-slot
state vector since Lesson 92.

Enumerating `process-with-registers`'s and `process-with-pc`'s bodies:
rebuilding the whole process with one slot changed — **(b) a hard
concept reappearing**: the exact "rebuild the whole node, reuse every
untouched piece" discipline Lesson 92's own `bst-insert` established for
trees, applied here to a process instead.

Trace building a process and updating it one cycle later:

```
process-a = make-process 1 [0 0 0] 0 8 [2 0]
process-pid process-a          → 1
process-registers process-a    → [0 0 0]
process-pc process-a           → 0

process-a' = process-with-registers process-a [5 0 0]
process-registers process-a'   → [5 0 0]
process-pid process-a'         → 1              (unchanged)
process-page-table process-a'  → [2 0]          (unchanged)
```

`process-a'` is a genuinely new value — every earlier lesson's own
immutability discipline still applies here — with only the register slot
actually different from `process-a`.

### CS Lens

Bundling a running program's registers, program counter, stack, and page
table into one tracked record is not a simplification for this lesson —
it's the real, standard shape of what every operating system tracks.

```
Also recognized in: the literal, standard "process control block" every
real operating-system course and kernel actually uses, by that exact
name; this curriculum's own prior lessons, each contributing one real
field — registers from Lesson 195, the program counter from Lesson 197,
the stack pointer from Lesson 193, the page table from Lesson 201; and
real `fork`/`exec` system calls, which literally allocate and populate a
structure shaped almost exactly like this one
```

### SE Lens

Keeping registers, program counter, stack pointer, and page table as
separate, independently tracked top-level values — exactly what every
lesson from 193 through 201 actually did — was fine as long as only one
program was ever being simulated. The moment more than one needs to exist
at once, which this lesson's own next unit requires, keeping them
separate would mean manually keeping several parallel sets of loose
values in sync by hand, with nothing tying a given register file to the
correct page table. Bundling them into one process value, built here, is
what makes tracking more than one program at all tractable — not a
stylistic preference, a real precondition for the rest of this lesson.

---

## Concept Unit: Multiple Processes, Isolated

### The Problem

One process control block is only half the story. A real system runs
several programs *at once* — does bundling state into a process actually
buy the isolation Lesson 201 already promised, once more than one process
genuinely exists side by side?

### Introduce the Concept in Isolation

Skipped — this unit builds a second process and reuses Lesson 201's own
`translate`, both already covered; the real content is the concrete
independence demonstrated below.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `process-with-pc`.
- **Dependencies**: Babashka, already installed.

### The New Code

A second, independent process — a different PID, and, reusing Lesson
201's own second example directly, a different page table:

```clojure
(def process-b (make-process 2 [0 0 0] 0 8 [1 3]))
```

Finding a process among several by its PID:

```clojure
(defn find-process
  [processes pid]
  (if (empty? processes)
    nil
    (find-process-check (first processes) processes pid)))
```

### The Updated Project

```clojure
(defn find-process-check
  [process processes pid]
  (if (= (process-pid process) pid)
    process
    (find-process (rest processes) pid)))
```

### Mechanical Walkthrough

`process-b`'s own construction — **(c) already basic**, identical in
shape to `process-a`.

Enumerating `find-process`'s and `find-process-check`'s bodies — **(b) a
hard concept reappearing**: ordinary structural recursion over a list
(Section II), searching for one matching element — the same shape as
Lesson 194's own `remove-block`.

Trace `find-process` against `(list process-a process-b)`, and confirm
their memory is genuinely isolated by reusing Lesson 201's own
`translate` on each process's own page table:

```
find-process (list process-a process-b) 2
  process-a: pid 1 ≠ 2 → check next
  process-b: pid 2 = 2 → found

translate (process-page-table process-a) 0 4 → 8   (frame 2, Lesson 201)
translate (process-page-table process-b) 0 4 → 4   (frame 1, Lesson 201)
```

Both processes have the identical starting registers, `[0 0 0]`, and both
use the identical virtual address `0` — and yet nothing about one is
reachable from the other: their register files are separate Clojure
values with no relationship to each other at all, and their virtual
address `0` resolves to genuinely different physical memory, exactly
because each carries its own page table. Isolation isn't a separate
feature bolted onto a process — it falls straight out of every process
carrying its own complete page table as one of its own fields.

### CS Lens

Several processes coexisting, each with genuinely separate state and
genuinely isolated memory, is the real, foundational fact behind
multiprogramming.

```
Also recognized in: real multiprogramming and multitasking operating-
system design — the entire reason process isolation (Lesson 201) had to
exist in the first place; real process tables in actual kernels (Linux's
own task list is, conceptually, exactly this lesson's list of process
control blocks, searchable by PID); and virtualization, where "isolated
processes" scales up to "isolated entire virtual machines," the identical
core idea one level higher
```

### SE Lens

A single, shared page table for every process — skipping Lesson 201's
whole translation mechanism, letting every process see the same flat
physical memory — was the available alternative, restated here at the
process level: simpler, no per-process table to build or maintain, but
offering zero protection between processes, exactly the gap Lesson 201's
own closing section demonstrated concretely. Giving each process control
block its own page table, as this unit does, costs the per-access
translation overhead already named in Lesson 201, in exchange for making
running more than one program at a time actually safe, not merely
possible.

---

## Concept Unit: Process Lifecycle

### The Problem

A process isn't always actively running — something has to exist before
it starts, and something has to happen once it finishes. What does a
process's own state, over its whole lifetime, actually look like?

### Introduce the Concept in Isolation

Skipped — a status slot is one more field on an already-covered vector,
and the transitions between values are plain `if`/`=` comparisons; the
real content is the lifecycle itself, shown directly in the trace below.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Refactor — `make-process` gains a sixth slot,
  `status`; every earlier accessor and `process-with-*` function is
  otherwise unchanged.
- **Location**: `make-process` and its accessors, from the first unit.
- **Dependencies**: Babashka, already installed.

### The New Code

`make-process` now carries a **process state** alongside everything else:

```clojure
(defn make-process
  [pid registers pc stack-pointer page-table status]
  [pid registers pc stack-pointer page-table status])
```

```clojure
(defn process-status [process] (get process 5))
```

### The Updated Project

Updating status the same way every other field already updates —
rebuild the whole process, one slot changed:

```clojure
(defn process-with-status
  [process new-status]
  (make-process (process-pid process) (process-registers process) (process-pc process)
                (process-stack-pointer process) (process-page-table process) new-status))
```

Finding the first process actually able to run:

```clojure
(defn process-runnable?
  [process]
  (= (process-status process) "ready"))
```

```clojure
(defn find-runnable
  [processes]
  (if (empty? processes)
    nil
    (find-runnable-check (first processes) processes)))
```

```clojure
(defn find-runnable-check
  [process processes]
  (if (process-runnable? process)
    process
    (find-runnable (rest processes))))
```

### Mechanical Walkthrough

`status` as `make-process`'s sixth slot — **(a) first appearance**: the
first field on a process control block that isn't borrowed directly from
an earlier lesson — process state is genuinely new to this lesson.

`process-with-status`'s body — **(b) a hard concept reappearing**, the
same rebuild-with-one-slot-changed discipline as `process-with-registers`.

`process-runnable?`'s and `find-runnable`'s bodies — **(c) already
basic** individually, composing into **(a) first appearance**: scanning a
whole process list for the first one currently able to run is this
lesson's own first, minimal step toward what a real scheduler needs —
*finding* a candidate, not yet *choosing* among several.

Trace a process moving through its own lifecycle, then `find-runnable`
skipping a finished one:

```
process-a  = make-process 1 [0 0 0] 0 8 [2 0] "ready"
process-a' = process-with-status process-a "running"
process-a'' = process-with-status process-a' "terminated"

find-runnable (list process-a'' (process-with-status process-b "ready"))
  process-a'': status "terminated" → not runnable, check next
  process-b (ready): status "ready" → runnable, found
```

`find-runnable` correctly skips the terminated process and returns the
still-ready one — the same "search past what doesn't match" shape this
whole curriculum has used since `find-fit` (Lesson 194), now searching
for a process's own readiness instead of a free memory block's size.

### CS Lens

A small set of named states a long-lived entity moves through, one at a
time, is a real, standard modeling tool far beyond process management.

```
Also recognized in: real operating-system process-state diagrams — this
lesson's simplified three-state version (ready, running, terminated) is
an honest subset of the real, standard diagram, which typically adds a
"blocked" state for a process waiting on something like disk or network
input; `fork()`'s own real return-value and exit-code semantics in
real operating-system APIs; and finite-state-machine modeling generally,
recurring anywhere a long-lived entity has a small number of named,
mutually exclusive states
```

### SE Lens

Letting every "ready" process simply run all at once, with no selection
process needed at all, sounds like it would sidestep this whole problem
— but it's not actually available here: this whole section has modeled
one register file, one program counter, one execute mechanism. Only one
process's state can occupy that single, real, physical resource at any
given instant. `find-runnable`'s own "return the first ready one found"
is an honest, deliberately minimal placeholder for a much harder real
question this lesson does not resolve: when *several* processes are
ready at once, which one should actually get to run next, and for how
long? That real, substantial topic — scheduling policy — is left
completely open here on purpose; this unit only builds the first piece
any scheduler would need, a way to find a candidate at all.

---

## Connect the Pieces

Follow two processes through their entire lifecycle in this lesson.
`process-a`, created `"ready"` with registers `[0 0 0]` and page table
`[2 0]`, is found by `find-process` among a list containing `process-b`
too — a completely separate process, its own PID, its own page table.
`process-with-status` moves `process-a` from `"ready"` to `"running"` and,
once its work is done, to `"terminated"` — three genuinely different
process values, built the same rebuild-with-one-slot-changed way every
other field update in this lesson worked. `find-runnable`, scanning a
list containing the now-terminated `process-a` and a still-ready
`process-b`, correctly skips the first and returns the second.
Throughout, `translate`, reused directly from Lesson 201, confirms that
`process-a` and `process-b` were never able to reach each other's memory
at any point in this story — isolation held constantly, not just at the
one moment Lesson 201 first demonstrated it.

## What Breaks Without This

Nothing in `make-process` or `find-process` guarantees every process gets
a genuinely unique PID. Create a second process that, by mistake, reuses
`process-a`'s own PID:

```clojure
(def process-c (make-process 1 [9 9 9] 0 12 [3 3] "ready"))
```

`process-c` is a real, distinct process — different registers, different
stack pointer, different page table — but its PID, `1`, collides with
`process-a`'s. Trace `find-process` looking for it:

```
find-process (list process-a process-c) 1
  process-a: pid 1 = 1 → found — return process-a
```

`find-process` returns `process-a`, not `process-c` — the search stops at
the *first* match, the same way `find-process-check`'s own recursion was
always written to. Anything that asked for "process `1`" meaning to reach
`process-c` silently gets `process-a` instead: its registers, its stack
pointer, its page table — a completely different process's entire state,
handed back under the wrong assumption that a PID uniquely identifies one
process. `process-c` isn't corrupted or deleted; it's simply unreachable
by the identifier that was supposed to name it, sitting in the list the
entire time. This is the exact same failure shape as Lesson 194's
double-free (a lookup silently returning the first of two things that
should never have been allowed to collide) and Lesson 201's frame
collision (isolation depending entirely on an assignment — there, a
frame; here, a PID — that nothing structural actually guarantees is
unique). Nothing in this lesson's own code assigns PIDs; that
responsibility, and the guarantee that it never repeats one, belongs to
whatever creates processes in the first place — a real, ordinary
operating-system responsibility this lesson deliberately doesn't build,
the same way `map-page`'s frame-assignment logic was left as Lesson 201's
own open question.

## Exercises

1. Trace `process-with-registers` and `process-with-pc` applied to
   `process-b` in sequence — first setting its registers to `[1 1 1]`,
   then its program counter to `5` — and confirm every other field stays
   exactly as it started.
2. Using `find-runnable`, trace a process list where the *first* process
   is `"running"` (not `"ready"`) and the second is `"ready"`, and confirm
   which one is returned — state, in one sentence, why a `"running"`
   process shouldn't count as `process-runnable?`.
3. Sketch, in prose, what a `terminate` function would need to do to a
   process control block, given this lesson's own `process-with-status` —
   is changing its status to `"terminated"` alone enough, or should its
   memory (its page table's frames) also need to be reclaimed somehow?
   No code required yet.

## Definition of Done

- [ ] `make-process` and its five original accessors are written and
      hand-traced for `process-a`, matching this lesson's worked values.
- [ ] `process-with-registers` and `process-with-pc` are written and
      confirmed to leave every other field unchanged.
- [ ] `find-process` is written and hand-traced against a two-process
      list, matching the correct process found by PID.
- [ ] `process-status`, `process-with-status`, `process-runnable?`,
      `find-runnable`, and `find-runnable-check` are written and
      hand-traced for the ready/running/terminated lifecycle example.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why `process-c` is not deleted or corrupted
      by the PID collision, only unreachable by its own identifier.
- [ ] Commit with a message explaining *why* isolation between processes
      falls directly out of each one carrying its own page table, rather
      than being a separate feature, not just *what* functions were
      added.
