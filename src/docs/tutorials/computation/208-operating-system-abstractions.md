# Lesson 208: Operating-System Abstractions

- **What you will build** — a minimal real file system, where a file is
  nothing but a name attached to a list of disk block numbers, directly
  paralleling Lesson 201's page table; a uniform `device-read`/
  `device-write` interface hiding two wildly different simulated devices
  behind the same two functions; and a real, quantified demonstration
  that this section's own abstractions can be *correct* while still
  hiding a genuine, measurable performance cost. The transferable
  problem: Lessons 201 through 203 already built two real operating-
  system abstractions — virtual memory and processes — without ever
  naming what they actually had in common. Every one of them takes
  something physically messy (scattered frames, arbitrary disk blocks,
  wildly different hardware) and presents something simple and uniform
  instead. That's not a coincidence three separate times; it's the one
  idea an entire operating system is built on.
- **What you need to know first** — page tables and `translate` (Lesson
  201); process control blocks (Lesson 202); `syscall` and the
  user/kernel boundary (Lesson 203); `read-block`, cache blocks (Lesson
  198); `element-address` (Lesson 191); Lesson 206's own same-abstraction-
  different-real-cost result.
- **Terms introduced in this lesson**
  - **abstraction** — a simple, uniform interface standing in for
    something more complex or more varied underneath — every function
    this curriculum has ever written is one, but this lesson is the
    first to name the idea directly and generally.
  - **file** — a name attached to a sequence of disk blocks; the blocks
    themselves can live anywhere on disk, in any order, with the file's
    own directory entry the only record of which ones belong to it and
    in what order to read them.
  - **directory** — the record mapping file names to their own block
    sequences — a file system's own version of Lesson 201's page table.
  - **device** — any piece of real hardware an operating system exposes
    through a uniform interface, regardless of how differently it
    actually behaves underneath.
  - **leaky abstraction** — a real, standard term: an abstraction that is
    correct, but doesn't fully hide the real performance (or other)
    consequences of what's happening underneath it.
- **Objects and methods used**: None new. This lesson reuses `get`,
  `[...]` (Section V), `cond`, `if`, `=`, `cons`, `empty?`, `first`,
  `rest` (already covered).

---

## Concept Unit: A File Is a Name Attached to Blocks

### The Problem

Lesson 191's memory was one flat, addressable space, with nothing
grouping related bytes together under a name. Real storage needs exactly
that: a way to say "these bytes, wherever they physically live, together
make up one named thing," without requiring them to sit next to each
other at all.

### Introduce the Concept in Isolation

Skipped — this unit reuses Lesson 198's own `read-block` and Lesson
191's own `element-address` directly; nothing syntactic here is new.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from this section's memory and virtual-memory work.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Reading one fixed-size block from disk — a disk is just another memory,
in this lesson's own model, reusing `element-address` to find where a
given block number actually starts:

```clojure
(defn read-block-from-disk
  [disk block-num block-size]
  (read-block disk (element-address 0 block-num block-size) block-size))
```

### The Updated Project

Reading a whole file means following its own list of block numbers, in
whatever order the file's own directory entry lists them, and joining
the results together:

```clojure
(defn append-lists
  [list1 list2]
  (if (empty? list1)
    list2
    (cons (first list1) (append-lists (rest list1) list2))))
```

```clojure
(defn read-file
  [disk block-numbers block-size]
  (if (empty? block-numbers)
    (list)
    (append-lists (read-block-from-disk disk (first block-numbers) block-size) (read-file disk (rest block-numbers) block-size))))
```

### Mechanical Walkthrough

`read-block-from-disk`'s body — **(c) already basic**, composing Lesson
191's and Lesson 198's own already-verified functions.

Enumerating `append-lists`'s body — **(b) a hard concept reappearing**:
ordinary structural recursion over a list (Section II), joining two
sequences end to end.

Enumerating `read-file`'s body: `(first block-numbers)` naming which
block to read *next* — **(a) first appearance**: a file's own logical
content order comes entirely from this list, not from where any block
physically sits on disk.

Trace `read-file` on `disk = [10 20 30 40 50 60]` (three two-byte
blocks: `0`, `1`, `2`), a file whose directory entry lists its blocks
*out of physical order* — block `2` first, then block `0`:

```
read-file disk (2 0) 2
  read-block-from-disk disk 2 2 → element-address 0 2 2 = 4 → [50 60]
  read-file disk (0) 2
    read-block-from-disk disk 0 2 → element-address 0 0 2 = 0 → [10 20]
    read-file disk () 2 → ()
    append-lists [10 20] () → (10 20)
  append-lists [50 60] (10 20) → (50 60 10 20)
```

The file's real content, `(50 60 10 20)`, comes out in exactly the order
its own block list says — block `2`'s bytes first, block `0`'s bytes
second — completely independent of the fact that block `0` physically
sits *earlier* on disk. This is precisely Lesson 201's page table, one
level down: a logical sequence (pages there, blocks here) mapped to
physical locations that don't have to follow the same order at all.

### CS Lens

A name mapped to a sequence of physically scattered blocks, in an order
the mapping itself controls, is the real, standard shape of a file
system, not a simplified stand-in for it.

```
Also recognized in: real file systems (FAT, ext, NTFS, and effectively
every other one in real use), each recording a file as a name attached
to a chain or list of disk blocks in essentially this shape; Lesson
201's own page table, now revealed as the *identical* structural idea —
logical position mapped to physical location — applied to disk instead
of RAM; and Lesson 192's own indirection theme, recurring yet again, one
layer further from the CPU than it's ever appeared in this curriculum
```

### SE Lens

Storing every file as one single, contiguous run of disk blocks — no
directory-style indirection needed at all — was the available
alternative, and it makes sequential reading about as fast as physically
possible. Its real, historical cost is exactly Lesson 194's own external
fragmentation problem, now at the level of a disk instead of a heap: a
file that needs to grow might have no single contiguous free run large
enough, even with plenty of free space scattered elsewhere. Scattered-
block storage, built in this unit, trades some of that raw sequential
speed for freedom from fragmentation — the identical tradeoff Lesson 194
already named for heap allocation, recurring here for an entirely
different resource.

---

## Concept Unit: Devices, Behind One Interface

### The Problem

A keyboard and a printer do almost nothing alike — one only ever
produces input, the other only ever consumes output. A program
shouldn't need entirely different code for every different piece of
hardware it might ever talk to.

### Introduce the Concept in Isolation

Skipped — this unit's dispatch is the same `cond` pattern already lab'd
repeatedly; the real content is what the uniformity actually buys, shown
directly in the trace below.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `read-file`.
- **Dependencies**: Babashka, already installed.

### The New Code

Two functions, and *only* two, for every **device** this lesson knows
about — reading and writing mean something completely different per
device, but a caller never has to know that:

```clojure
(defn device-read
  [device-state device-name]
  (cond
    (= device-name "keyboard") (get device-state 0)
    true nil))
```

```clojure
(defn device-write
  [device-state device-name value]
  (cond
    (= device-name "printer") [(get device-state 0) (cons value (get device-state 1))]
    true device-state))
```

### The Updated Project

Skipped — no enclosing file exists yet; both are freestanding functions
used directly at the `bb` REPL.

### Mechanical Walkthrough

Enumerating both bodies: `cond` dispatch — **(c) already basic**. The
real content is **(a) first appearance**: `device-read` and
`device-write` are the *entire* interface — nothing about calling either
one requires knowing whether the target device is a keyboard, a
printer, or something else entirely; that decision happens once, inside
these two functions, and nowhere else.

Trace both against `device-state = ["H" (list)]` — a keyboard with `"H"`
waiting to be read, a printer with nothing yet printed:

```
device-read device-state "keyboard" → "H"
device-write device-state "printer" "X"
  → [(get device-state 0) (cons "X" (get device-state 1))]
  → ["H" ("X")]
```

Reading the keyboard returns its waiting value; writing to the printer
appends to its own output, and the *keyboard's* half of `device-state`
is carried through completely untouched. Attempting the mismatched
operation — writing to the keyboard, or reading the printer — falls into
each function's own `true` fallback, doing nothing, rather than
attempting an operation that device doesn't actually support.

### CS Lens

Exposing wildly different real hardware through one small, uniform
interface is the real, standard job of an operating system's device
drivers.

```
Also recognized in: real device drivers, the actual operating-system
mechanism providing exactly this "same interface, different
implementation per device" abstraction; the real, well-known Unix and
Linux philosophy that devices are exposed through essentially the same
read/write interface as ordinary files — a genuine, historical
unification this unit's own uniform functions directly echo; and Lesson
203's own syscall boundary, the real mechanism that makes a uniform
device interface possible at all — user code never touches hardware
directly, only ever through this one controlled layer
```

### SE Lens

Exposing each device's own real, distinct interface directly to any
program that wants to use it was the available alternative, and it could
be more efficient for code that genuinely needs a device's own special
features unavailable through a generic interface. Its real, historical
cost: every program would need to know about every different device it
might ever run against, a genuine portability burden real early systems
struggled with. A uniform interface, built in this unit, costs some of
that device-specific flexibility, but lets the same program logic run
against wildly different real hardware without modification — the real,
practical reason operating systems settled on this design.

---

## Concept Unit: The Cost Hidden Underneath

### The Problem

Every abstraction this section has built — page tables, process control
blocks, this lesson's own files and devices — presents something simple.
None of them promise the simple version is *free*. Does the file
abstraction actually hide a real performance difference the way earlier
lessons already proved caches and access patterns can?

### Introduce the Concept in Isolation

Skipped — this unit reinterprets Lesson 206's own already-verified
result rather than computing anything new; nothing syntactic here is
new.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script; no new
  functions, only a reinterpretation of Lesson 206's own result.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Lesson 206 already measured this exact gap, for a different framing —
two access patterns visiting the same eight addresses, one sequential,
one scattered:

```clojure
(run-accesses [nil nil] memory (list 0 1 2 3 4 5 6 7) 2 2 0)
```

### The Updated Project

Skipped — no enclosing file exists yet; this is a reinterpretation of an
already-run call, not a new one.

### Mechanical Walkthrough

Read as a file system question instead of a raw cache question: `(list 0
1 2 3 4 5 6 7)` is exactly what a file's own block list would look like
if every one of its blocks happened to sit in physically sequential
order on disk. `(list 0 2 4 6 1 3 5 7)` — Lesson 206's own second
pattern — is what a file's block list would look like if its blocks were
scattered, interleaved with some other file's own blocks, exactly the
shape the first unit's own `(2 0)` example already showed is completely
legal for a directory entry to contain.

Both patterns access the same eight blocks, once each — identical from
the file abstraction's own point of view: `read-file` runs correctly
either way, and produces the file's correct content either way. Lesson
206 already priced the difference:

```
sequential block order: 44 cycles
scattered block order:  80 cycles
```

A program calling `read-file` never sees this difference in the
function's own return value — both calls succeed, both return the
file's correct bytes. **This is a leaky abstraction**: `read-file` is
completely correct regardless of block order, and completely silent
about the fact that block order still has a real, measurable performance
consequence underneath it.

### CS Lens

Every abstraction this entire curriculum has ever built is a specific
instance of the same general idea, only now named directly.

```
Also recognized in: literally every function this curriculum has ever
written, hiding its own implementation behind a name and a signature
(Lesson 4); algebraic data types (Lesson 150), hiding a concrete
representation behind a set of constructors; Lesson 201's virtual memory
and Lesson 202's processes, both already-built real operating-system
abstractions this lesson is the first to name generally; and "leaky
abstraction" itself, a real, standard, widely cited software-engineering
term for exactly what this unit's own file-order example demonstrates
```

### SE Lens

Making an abstraction so complete that its real performance cost is
totally invisible, even to someone who genuinely needs to reason about
it, was one available design goal. Lesson 206 already showed why that
goal is actually undesirable: hiding the difference between `44` and
`80` cycles completely would leave no way to even notice, let alone fix,
a performance problem caused by bad block layout. The real, standard
answer real operating systems give instead: keep the abstraction simple
and uniform for *correctness* — `read-file` never requires knowing block
order to use correctly — while still exposing enough real information,
through profiling and real, measurable costs, for anyone who needs to
reason about performance to actually do so.

---

## Connect the Pieces

Follow one file through every abstraction this lesson named. Its
directory entry, `(2 0)`, is nothing but a list of block numbers — the
same shape as a page table's list of frame numbers (Lesson 201).
`read-file` follows that list exactly as written, joining scattered
physical blocks into one correct, ordered logical result, the same
structural trick that makes both virtual memory and file systems work at
all. `device-read` and `device-write`, built completely independently in
the second unit, hide an equally real difference — a keyboard and a
printer share nothing about their actual hardware, yet both are reached
through the same two function names. And Lesson 206's own already-
measured `44`-versus-`80`-cycle gap, reread through this lesson's own
lens, shows that none of this correctness comes free: the *same* file,
the *same* correct `read-file` call, costs a genuinely different amount
depending on a physical layout the abstraction was specifically built to
hide.

## What Breaks Without This

Nothing in this lesson's own `read-file` checks whether a block number
genuinely belongs to only *one* file. Give two different files
overlapping directory entries — file A uses block `0` alone; file B, by
mistake, is *also* given block `0`, in addition to its own block `2`:

```clojure
(def disk (make-memory 6))
```

```clojure
(read-file disk (list 0) 2)
```

```clojure
(def disk-corrupted (write-byte disk 0 99))
```

```clojure
(read-file disk-corrupted (list 0) 2)
```

Trace it: the first `read-file` call, before anything is written, reads
file A's block `0` normally. If file B's own logic then writes new data
into block `0` — believing, incorrectly, that block is exclusively its
own — the second `read-file` call, still reading file A's *unchanged*
directory entry, `(0)`, now returns file A's *corrupted* content: `99`
where a `0` used to be, silently, with no error from either file's own
read or write operations. This is the identical failure shape as every
other shared-resource collision this section has built, deliberately,
at every layer: Lesson 194's double free, handing the same heap block to
two allocations; Lesson 201's frame collision, handing the same physical
frame to two page tables; Lesson 202's PID collision, handing the same
identifier to two processes; and now a block collision, handing the same
disk block to two files. Every one of them is the same lesson, learned
again at a different layer of the same system: a shared, physical
resource needs exactly one legitimate owner at a time, and nothing about
the abstraction sitting on top of it — `read-file`, `translate`,
`find-process` — can enforce that on its own. The guarantee has to come
from whatever hands the resource out in the first place, structurally,
the same real answer Lesson 203's `sys-map-page` already gave for
physical frames specifically.

## Exercises

1. Trace `read-file` on `disk = [10 20 30 40 50 60]` for a file whose
   directory entry is `(1)` alone, and confirm it returns `(30 40)`.
2. Using `device-read` and `device-write`, trace what happens attempting
   to `device-write` to `"keyboard"` and `device-read` from `"printer"`
   — confirm both fall through to their respective `true` branches, and
   state in one sentence why that's the *correct* behavior for a
   mismatched device operation, not a bug.
3. Sketch, in prose, what a real filesystem's own block-allocation logic
   would need to look like to avoid this lesson's own closing block-
   collision scenario — how closely does it need to resemble Lesson 203's
   own `sys-map-page`, built for physical frames instead of disk blocks?
   No code required yet.

## Definition of Done

- [ ] `read-block-from-disk`, `append-lists`, and `read-file` are written
      and hand-traced for the `(2 0)` scattered-block example, matching
      `(50 60 10 20)`.
- [ ] `device-read` and `device-write` are written and hand-traced for
      both the keyboard and printer, matching this lesson's worked
      results.
- [ ] Lesson 206's own `44`-versus-`80`-cycle result is understood, in
      this lesson's own file-system framing, well enough to explain,
      without notes, why `read-file` itself never reveals which case
      applies.
- [ ] The "What Breaks Without This" trace is understood well enough to
      name, without notes, the three earlier lessons in this section that
      already demonstrated the identical shared-resource-collision
      failure at a different layer.
- [ ] Commit with a message explaining *why* files, virtual memory, and
      processes are the same underlying idea applied three times, not
      just *what* functions were added.
