# Lesson 209: Processes vs Threads

- **What you will build** — a thread control block holding only what
  genuinely needs to be separate per thread — registers, program
  counter, stack pointer — and a process rebuilt to hold a *list* of
  them sharing one page table, a concrete demonstration that two threads
  in one process translate the identical virtual address to the
  identical physical address (unlike Lesson 202's own two separate
  processes, which never did), and an honest look at what that sharing
  actually costs. The transferable problem: Lesson 202's process control
  block bundled registers, program counter, stack pointer, and page
  table together as if they all belonged at the same level. They don't —
  a **thread** is what's left once the parts that have to be genuinely
  private are separated from the parts that don't have to be.
- **What you need to know first** — process control blocks, `find-
  process` (Lesson 202); `translate`, page tables (Lesson 201); aliasing
  (Lesson 192); `write-byte`, `read-byte` (Lesson 191).
- **Terms introduced in this lesson**
  - **thread** — one independent sequence of execution — its own
    registers, its own program counter, its own stack — running inside a
    process and sharing that process's memory with every other thread in
    it.
  - **thread control block (TCB)** — the real record a thread needs:
    just its own registers, program counter, and stack pointer — no page
    table of its own, unlike a full process control block.
- **Objects and methods used**: None new. This lesson reuses `[...]`,
  `get` (Section V), `if`, `=`, `empty?`, `first`, `rest` (already
  covered).

---

## Concept Unit: What's Shared, What Isn't

### The Problem

Lesson 202's process control block gave every process its own registers,
program counter, stack pointer, *and* page table — one bundle, four
fields, all treated the same way. Running more than one independent
sequence of execution *inside* the same process means asking which of
those four genuinely needs its own private copy, and which one doesn't.

### Introduce the Concept in Isolation

Skipped — a thread control block is the same multi-slot-vector-as-state
convention already lab'd repeatedly since Lesson 130; nothing syntactic
here is new, only which fields belong where.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from Lesson 202's process control blocks.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: Refactor — `make-process` (Lesson 202) drops its own
  `registers`, `pc`, and `stack-pointer` fields entirely, replacing them
  with a list of thread control blocks; `page-table` and `status` stay
  exactly as they were.
- **Location**: `make-process` and its accessors, from Lesson 202.
- **Dependencies**: Babashka, already installed.

### The New Code

A thread control block holds only what has to be genuinely private to
one running sequence of execution:

```clojure
(defn make-thread
  [tid registers pc stack-pointer]
  [tid registers pc stack-pointer])
```

```clojure
(defn thread-tid [thread] (get thread 0))
(defn thread-registers [thread] (get thread 1))
(defn thread-pc [thread] (get thread 2))
(defn thread-stack-pointer [thread] (get thread 3))
```

### The Updated Project

A process is rebuilt to hold a *list* of threads instead of one set of
registers, alongside the page table and status every thread in it will
share:

```clojure
(defn make-process
  [pid threads page-table status]
  [pid threads page-table status])
```

```clojure
(defn process-pid [process] (get process 0))
(defn process-threads [process] (get process 1))
(defn process-page-table [process] (get process 2))
(defn process-status [process] (get process 3))
```

### Mechanical Walkthrough

Enumerating `make-thread`'s body and its accessors: identical in shape
to Lesson 202's own process accessors — **(c) already basic** as syntax.
The four fields chosen — `tid`, `registers`, `pc`, `stack-pointer` — are
**(a) first appearance**: notice what's missing compared to Lesson 202's
full process control block — no page table, and no status of its own.

Enumerating the rebuilt `make-process`: `threads` replacing `registers`,
`pc`, and `stack-pointer` directly — **(a) first appearance**: three
fields that used to live at the process level move down to the thread
level; `page-table` and `status` stay exactly where Lesson 202 put them,
because every thread in a process genuinely does share both.

Trace building a process with two threads:

```
thread-a = make-thread 1 [0 0 0] 0 8
thread-b = make-thread 2 [5 5 5] 3 8
process1 = make-process 1 (list thread-a thread-b) [2 0] "running"

process-threads process1 → (thread-a thread-b)
thread-tid (first (process-threads process1)) → 1
thread-registers (first (process-threads process1)) → [0 0 0]
```

Two genuinely independent register files and program counters, `[0 0 0]`
starting at `pc 0` and `[5 5 5]` starting at `pc 3`, both living inside
the *same* process, both about to share the *same* page table.

### CS Lens

Splitting per-thread state (registers, program counter, stack) from
per-process state (memory, page table) is the real, standard shape of
every real operating system's own thread implementation.

```
Also recognized in: real thread implementations — POSIX threads,
Java's own `Thread` class, and effectively every other real threading
system — all splitting state exactly this way: private registers and
stack per thread, shared heap and globals per process; the real,
standard textbook characterization of a thread as a "lightweight
process," lightweight specifically because it reuses its process's
memory instead of needing its own; and Lesson 202's own process control
block, now revealed to have bundled two genuinely different levels of
state together the entire time
```

### SE Lens

Giving every independent sequence of execution its own complete process
control block — its own page table included, exactly what Lesson 202
already built — was the available alternative; it's simply running
several separate processes. That gives real, full isolation (Lesson
201's own guarantee), at a real, documented cost: anything two processes
need to share has to go through comparatively expensive, explicit
inter-process communication, never a direct memory access. Threads,
built in this unit, share memory for free — no communication mechanism
needed at all to see what another thread just wrote — at the cost this
lesson's remaining units take seriously: giving up the isolation
guarantee entirely for anything living in that shared memory.

---

## Concept Unit: Shared Memory, Demonstrated

### The Problem

Lesson 202's own closing demonstration proved two *processes* using the
identical virtual address land in genuinely different physical memory.
Do two *threads*, sharing one page table by construction, actually
behave the opposite way?

### Introduce the Concept in Isolation

Skipped — this unit reuses Lesson 201's own `translate` directly,
already fully covered; the real content is the direct contrast with
Lesson 202's own result, shown below.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script; no new
  functions, only a reuse of `translate` against `process1`'s shared page
  table.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Finding a specific thread by its own ID — the identical shape as Lesson
202's own `find-process`:

```clojure
(defn find-thread
  [threads tid]
  (if (empty? threads)
    nil
    (find-thread-check (first threads) threads tid)))
```

### The Updated Project

```clojure
(defn find-thread-check
  [thread threads tid]
  (if (= (thread-tid thread) tid)
    thread
    (find-thread (rest threads) tid)))
```

### Mechanical Walkthrough

`find-thread`'s and `find-thread-check`'s bodies — **(b) a hard concept
reappearing**: the identical structural-recursion search as Lesson 202's
`find-process`, now searching by thread ID instead of process ID.

The real content of this unit is what happens when *both* threads
translate the same address through `process1`'s one shared page table:

```
translate (process-page-table process1) 0 4 → 8
```

There is only one call here, not two — because it doesn't matter which
thread is asking. Neither `thread-a` nor `thread-b` carries a page table
of its own anymore; both would compute the exact same result, `8`, every
time, because both ultimately look it up through `process1`'s single
shared `page-table`. Compare that directly to Lesson 202's own result:
`process-a` and `process-b` — two separate *processes* — translated the
identical virtual address `0` to `8` and `4` respectively, genuinely
different physical memory. `thread-a` and `thread-b` — two threads in
*one* process — would both get `8`, every single time, because there was
never a second page table to give a different answer from.

### CS Lens

Sharing one address space among several independently running threads,
in direct contrast to Lesson 202's own process isolation, is the real,
defining fact that distinguishes threads from processes.

```
Also recognized in: real threads within one operating-system process,
which genuinely do share one page table, in direct, documented contrast
to separate processes, each with their own; global variables and shared
heap allocations in any real multithreaded program, the actual
real-world instance of exactly what this unit's shared `translate`
result demonstrates; and Lesson 202's own contrasting result, now doing
double duty as the concrete baseline this unit's own result is measured
against
```

### SE Lens

An alternative concurrency model exists even within one process: give
each thread its own private memory and require explicit message-passing
— copying data between threads deliberately — for anything that needs
to be shared, rather than direct shared memory access. That model
avoids this unit's own sharing entirely, at a real cost: every piece of
data crossing between threads has to be copied and coordinated through
real message-passing machinery. Shared-memory threading, what real
operating-system threads (and this unit) actually build, is cheaper for
tightly cooperating work sharing large amounts of data — no copying
needed at all — at the cost the next unit takes seriously: reopening
Lesson 192's own aliasing danger, at a genuinely more dangerous scale.

---

## Concept Unit: The Real Cost of Sharing

### The Problem

Lesson 192 already showed that two pointers sharing one address can
corrupt each other's assumptions — but that was always inside one
sequential program, where at least the *order* of operations was fixed
and traceable by reading the code top to bottom. Two threads sharing
memory have no such guarantee at all. What does that actually mean?

### Introduce the Concept in Isolation

Skipped — this unit reuses only already-lab'd `write-byte` and
`read-byte`; the real content is the timing question neither of them can
answer, demonstrated directly below.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script; no new
  functions.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Both threads reaching the same physical address, one writing, one
reading:

```clojure
(def memory (write-byte (make-memory 16) (translate (process-page-table process1) 0 4) 99))
```

```clojure
(read-byte memory (translate (process-page-table process1) 0 4))
```

### The Updated Project

Skipped — no enclosing file exists yet; both are standalone calls at the
`bb` REPL.

### Mechanical Walkthrough

Both calls — **(c) already basic**, composing already-verified functions.
The honest gap is **(a) first appearance**: nothing in this lesson's own
model says *when*, relative to `thread-a`'s own instructions, this write
happened. If `thread-b` performed it, `thread-a` reading the same
address afterward sees `99` — correctly, from `read-byte`'s own point of
view, and with absolutely nothing in `thread-a`'s own registers, program
counter, or stack pointer showing any sign that another thread ever
touched shared memory at all. `thread-a`'s own state is exactly what it
would be whether `thread-b` had written first, written after, or never
run at all — this lesson's model has no concept of *when*, only of
*what*.

Run it:

```
user=> (read-byte memory (translate (process-page-table process1) 0 4))
99
```

Whatever `thread-a`'s own code assumed was sitting at that address — its
own last-known value, or the value `process1` started with — may or may
not still be true, entirely depending on timing this lesson's model
doesn't represent at all. This is not yet a bug being demonstrated; it's
the honest, structural reason one becomes possible the moment two
threads share writable memory.

### CS Lens

Shared, writable memory with no fixed ordering between independently
running threads is the direct, real cause of an entire, well-known
category of bugs.

```
Also recognized in: a large, real, well-documented category of
multithreading bugs, all stemming from exactly this shared, unordered
visibility; Lesson 192's own aliasing, now recurring at a genuinely more
dangerous scale — two sequential pointers had at least a fixed order of
operations to reason about; two threads generally don't; and — flagged,
not built here — Lesson 212's own race conditions, the direct, real next
step from exactly what this unit's timing gap demonstrates
```

### SE Lens

Never sharing any *mutable* memory between threads at all — only ever
sharing data that's never changed after it's created — is a real,
current, increasingly common alternative. And it is worth naming
directly: this entire curriculum has already been practicing exactly
that discipline, the whole time, for reasons that only become fully
clear here. Every function since Lesson 1 has built a *new* value
instead of mutating an old one in place — no `let`, no mutation, ever.
That wasn't only a teaching convenience; it is the real, standard fix
for the danger this unit just demonstrated. Immutable data can never go
stale out from under a concurrently running thread, because nothing
ever changes it after it's created — there's no "old value" for a race
to expose, only ever a new one. The real cost is exactly what this
curriculum has been paying the entire time: building new values instead
of updating existing ones, which is more allocation, not less — a real
tradeoff, now finally visible for the reason it's actually worth paying.

---

## Connect the Pieces

Follow `process1`'s two threads through every idea this lesson built.
`thread-a` and `thread-b`, built with completely independent registers
and program counters, both belong to the same process, sharing its one
page table by construction. `translate`, called against that shared page
table, gives the identical physical address, `8`, regardless of which
thread asked — the direct opposite of Lesson 202's own two *processes*,
which never shared a physical address for the same virtual one. Writing
through that shared address, as `thread-b` might, becomes visible to
`thread-a` immediately, with nothing in `thread-a`'s own state
announcing that it happened — the real, structural reason threads are
cheaper to share data through than processes, and the same reason
sharing them safely is a genuinely harder problem than anything Lesson
192's single-threaded aliasing ever had to solve.

## What Breaks Without This

Suppose `thread-a`'s own code is written under one, ordinary assumption:
"nothing else touches this process's memory between when I last checked
address `0` and when I use it again." Trace what that assumption is
actually worth, given what this lesson has already shown:

```clojure
(def memory-before (write-byte (make-memory 16) (translate (process-page-table process1) 0 4) 10))
```

```clojure
(def memory-after (write-byte memory-before (translate (process-page-table process1) 0 4) 99))
```

```clojure
(read-byte memory-after (translate (process-page-table process1) 0 4))
```

`thread-a` might have checked this address early — seeing `10`, the
value `memory-before` holds — and then, later in its own code, relied on
that value still being `10`. Nothing in `thread-a`'s own registers,
program counter, or stack pointer changed between those two moments;
from `thread-a`'s own point of view, it did nothing that should have
touched shared memory at all. But `thread-b`, running independently,
wrote `99` there in between — and by the time `thread-a` uses the value
again, `read-byte` genuinely returns `99`, not `10`. `thread-a`'s own
code never becomes aware anything changed; it simply computes something
wrong, silently, built on an assumption that was true a moment ago and
isn't anymore. This is not a bug in `translate`, `write-byte`, or
`read-byte` — every one of them did exactly what it was built to do.
The failure is entirely in `thread-a`'s own assumption that shared,
mutable memory stays put between two points in its own code, with
nothing in this lesson's model — or in most real threading systems,
without deliberate extra work — ever guaranteeing that at all.

## Exercises

1. Trace `find-thread` against `process1`'s own thread list, searching
   for `tid 2`, and confirm it returns `thread-b`.
2. `thread-a` and `thread-b` share `process1`'s page table but each has
   its own `stack-pointer`, both starting at `8`. Sketch, in prose, why
   sharing a page table but *not* a stack pointer is exactly what lets
   two threads call functions independently without corrupting each
   other's stack frames (Lesson 193), even though they share everything
   else. No code required yet.
3. Using this lesson's own closing example, sketch, in prose, what
   information `thread-a`'s own code would need — beyond just the value
   at address `0` — to know for certain nothing else changed it since it
   last checked. No code required yet.

## Definition of Done

- [ ] `make-thread` and its four accessors are written and hand-traced
      for `thread-a` and `thread-b`.
- [ ] `make-process`'s refactored accessors and `find-thread` are written
      and hand-traced against `process1`'s own two-thread list.
- [ ] The shared-`translate`-result demonstration is understood well
      enough to state, without notes, why it required only one call to
      `translate`, not two, unlike Lesson 202's own two-process example.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why none of `translate`, `write-byte`, or
      `read-byte` is at fault for `thread-a`'s wrong assumption.
- [ ] Commit with a message explaining *why* this entire curriculum's
      own avoidance of mutation is a real, direct answer to the danger
      this lesson demonstrates, not just *what* functions were added.
