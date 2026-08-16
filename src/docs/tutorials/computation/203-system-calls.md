# Lesson 203: System Calls

- **What you will build** — a `syscall` dispatcher as the one controlled
  path between ordinary process code and kernel-level operations, a real
  `sys-map-page` that safely hands a process a genuinely free physical
  frame — the concrete, working fix for Lesson 201's own frame-collision
  problem — and a demonstration of exactly why that safety was never a
  runtime check at all, but a fact about which functions were ever handed
  the tools to cause the collision in the first place. The transferable
  problem: Lesson 202's process control blocks tracked a page table as
  just another field, freely rebuildable by `process-with-page-table` —
  but nothing stopped that field from being rebuilt with a frame already
  in use elsewhere. Something has to own frame assignment exclusively,
  and ordinary process code has to be structurally unable to bypass it.
- **What you need to know first** — page tables, `translate`, frame
  collisions (Lesson 201); process control blocks, `find-process`,
  `process-with-page-table` (Lesson 202); the free-list pattern —
  `find-fit`, `remove-block` — from Lesson 194.
- **Terms introduced in this lesson**
  - **kernel** — the part of an operating system trusted to perform
    operations ordinary process code cannot be allowed to perform
    directly, like assigning a physical frame no other process is already
    using.
  - **user mode / kernel mode** — the two real levels ordinary code and
    kernel code run at; user-mode code cannot perform kernel-level
    operations directly, no matter what it tries to call.
  - **system call (syscall)** — a controlled request from user-mode code
    asking the kernel to perform something on its behalf — the *only*
    sanctioned way to cross from one mode to the other.
  - **trap** — the real mechanism (a special instruction, in real
    hardware) that actually performs the user-to-kernel transition a
    system call needs.
- **Objects and methods used**: None new. This lesson reuses `[...]`,
  `get`, `assoc` (Section V), `cond`, `if`, `=`, `nil?` (already covered).

---

## Concept Unit: The Syscall Dispatcher

### The Problem

Lesson 202's `process-with-page-table` will happily rebuild any process's
page table with any frame at all — nothing about it checks whether that
frame is already in use somewhere else. Something has to be the single,
trusted place that decision is actually made, and ordinary process code
has to go *through* it rather than around it.

### Introduce the Concept in Isolation

Skipped — `syscall` is a `cond` dispatch, the same pattern already lab'd
in Lesson 151 and reused throughout this section; the real content is
what it structurally separates, not new syntax.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from Lesson 202's process control blocks.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

`syscall` is the one function that ever receives **kernel state** — a
pair of the free-frame list and the full process table — alongside a
named request and the calling process's own PID:

```clojure
(defn syscall
  [kernel-state request pid args]
  (dispatch-syscall kernel-state request pid args))
```

```clojure
(defn dispatch-syscall
  [kernel-state request pid args]
  (cond
    (= request "map-page") (sys-map-page kernel-state pid (first args))
    true kernel-state))
```

### The Updated Project

This is a freestanding pair of new functions with nothing enclosing them
yet — Project Change already covers this case.

### Mechanical Walkthrough

Enumerating `syscall`'s and `dispatch-syscall`'s bodies:

- `kernel-state` as a parameter — **(a) first appearance**: this is the
  first function in this entire section given access to a free-frame
  list at all. Every function since Lesson 195 — `exec-instruction`,
  `step`, `execute` — has only ever received a single process's own
  registers, memory, or page table, never the kernel's own bookkeeping.
- `cond` dispatching on `request` — **(c) already basic**, Lesson 151.

Trace `syscall` receiving an unrecognized request, confirming the
dispatcher's fallback does nothing rather than guessing:

```
syscall kernel-state "unknown-request" 1 ()
  dispatch-syscall: cond falls through to `true` → kernel-state, unchanged
```

Nothing happened — exactly correct for a request `dispatch-syscall`
doesn't recognize. The real work, and the real point of this lesson, is
in the one request this unit actually implements next.

### CS Lens

A single, controlled entry point between ordinary code and privileged
operations is the real, standard mechanism behind every operating
system's own boundary.

```
Also recognized in: real system calls themselves — `open`, `read`,
`write`, `mmap` — every one of them a controlled request crossing exactly
this boundary; the real hardware privilege-ring mechanism (ring 0 versus
ring 3 on x86) that actually enforces this boundary at the CPU level, one
layer beneath what this lesson builds in software; and any sandboxed
runtime's own "host function" boundary, the identical idea one level
higher than an operating system
```

### SE Lens

Letting user code call kernel-level functions directly whenever it wants
— exactly what every function in this section has implicitly allowed,
since nothing before this lesson ever restricted who could call what —
is simpler and has zero transition overhead. Its real cost is exactly
what this lesson exists to close: nothing stops any code, buggy or
malicious, from doing anything the kernel could do. A real syscall
boundary, built here as a single dispatcher, costs a real transition —
in actual hardware, a genuine mode switch, not free — in exchange for the
kernel being able to validate a request, and control exactly what it's
allowed to do, before ever acting on it.

---

## Concept Unit: Mapping a Page, Safely

### The Problem

Lesson 201's own closing section showed the danger directly: nothing
stopped two different page tables from being handed the same physical
frame. A real fix needs one single, trusted place tracking which frames
are already spoken for, and handing out only ones that aren't.

### Introduce the Concept in Isolation

Skipped — this unit's free-frame bookkeeping is the exact free-list
pattern already lab'd in Lesson 194 (`find-fit`, `remove-block`), applied
to physical frames instead of heap blocks; nothing syntactic here is new.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `dispatch-syscall`.
- **Dependencies**: Babashka, already installed.

### The New Code

Taking the first available frame, and removing it from the free list once
it's handed out — the identical shape as Lesson 194's `remove-block`:

```clojure
(defn take-free-frame
  [free-frames]
  (if (empty? free-frames)
    nil
    (first free-frames)))
```

```clojure
(defn remove-frame
  [free-frames frame]
  (if (empty? free-frames)
    (list)
    (remove-frame-check (first free-frames) free-frames frame)))
```

```clojure
(defn remove-frame-check
  [candidate free-frames frame]
  (if (= candidate frame)
    (rest free-frames)
    (cons candidate (remove-frame (rest free-frames) frame))))
```

### The Updated Project

`sys-map-page` ties it together: take a free frame, update the requesting
process's own page table with it, and remove that frame from the shared
free list so it can never be handed out again:

```clojure
(defn sys-map-page
  [kernel-state pid page]
  (sys-map-page-with-frame kernel-state pid page (take-free-frame (get kernel-state 0))))
```

```clojure
(defn sys-map-page-with-frame
  [kernel-state pid page frame]
  (if (nil? frame)
    kernel-state
    (sys-map-page-apply kernel-state pid page frame)))
```

```clojure
(defn sys-map-page-apply
  [kernel-state pid page frame]
  [(remove-frame (get kernel-state 0) frame)
   (update-process-page-table (get kernel-state 1) pid page frame)])
```

```clojure
(defn update-process-page-table
  [processes pid page frame]
  (if (empty? processes)
    (list)
    (update-process-page-table-check (first processes) processes pid page frame)))
```

```clojure
(defn update-process-page-table-check
  [process processes pid page frame]
  (if (= (process-pid process) pid)
    (cons (process-with-page-table process (assoc (process-page-table process) page frame)) (rest processes))
    (cons process (update-process-page-table (rest processes) pid page frame))))
```

### Mechanical Walkthrough

Enumerating `take-free-frame`'s and `remove-frame`'s bodies — **(b) a
hard concept reappearing**: the identical free-list search-and-remove
shape as Lesson 194's own `find-fit` and `remove-block`, now over a plain
list of frame numbers instead of `[start size]` blocks.

Enumerating `sys-map-page`'s chain: `(nil? frame)` — **(c) already
basic**, Lesson 136; no free frame left means the request simply can't be
granted, the same honest failure shape as Lesson 194's own `allocate`
returning `nil`. `process-with-page-table process (assoc ...)` — **(c)
already basic**, Lesson 202's own field-update function, given a real
frame this time instead of one picked by hand.

Trace `syscall` requesting a page for process `1`, `kernel-state =
[(list 5 6 7) (list process-a process-b)]` — free frames `5`, `6`, `7`,
process `1`'s own page table starting as `[2 0]`:

```
syscall kernel-state "map-page" 1 (2)
  dispatch-syscall → sys-map-page kernel-state 1 2

sys-map-page:
  take-free-frame (5 6 7) → 5

sys-map-page-apply kernel-state 1 2 5:
  remove-frame (5 6 7) 5 → (6 7)
  update-process-page-table (process-a process-b) 1 2 5
    process-a: pid 1 = 1 → match
      new page table: assoc [2 0] 2 5 → [2 0 5]
    → (process-a' process-b)

result: [(6 7) (process-a' process-b)]
```

Process `1`'s page table now maps its new virtual page `2` to frame `5`
— and frame `5` is gone from the free list, permanently, unless it's
later explicitly freed. No other call to `sys-map-page`, for any other
process, can ever be handed frame `5` again, because the only function
that ever looks at the free list is the one that just removed it.

### CS Lens

A single, trusted allocator handing out a scarce, shared resource — here,
physical frames — is the real mechanism behind real virtual memory
management, not a simplification of it.

```
Also recognized in: real `mmap` and `brk` system calls, which are
exactly this — a process asking the kernel for more memory, backed by a
real kernel physical-frame allocator built on precisely this kind of
free-list bookkeeping; and this lesson's own direct, concrete fix for
Lesson 201's own closing demonstration — the frame collision that lesson
showed was possible is exactly what `sys-map-page`'s exclusive control
over the free-frame list now prevents by construction
```

### SE Lens

Letting each process manage its own frame allocation, coordinating
directly with other processes to avoid collisions — say, via some shared
memory both could read and write — was a conceivable alternative. Its
real, well-documented cost: coordinating fairly and safely among several
mutually-untrusting, possibly-buggy processes, with no single trusted
arbiter, is a much harder and more fragile problem than having one
trusted kernel hand out frames centrally. This is the same argument
Lesson 194 already made for one shared allocator over several
uncoordinated ones, now one level up — a shared kernel resource, not a
shared heap.

---

## Concept Unit: Why the Boundary Actually Holds

### The Problem

`sys-map-page` is careful. But `process-with-page-table`, the function it
calls internally, isn't — it will rebuild any process's page table with
*any* frame at all, checked or not. What actually stops ordinary process
code from calling `process-with-page-table` directly, with a frame it
picked itself?

### Introduce the Concept in Isolation

Skipped — this unit makes an argument about which functions receive which
arguments, not about any new construct; the real content is the
structural fact demonstrated directly below.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script; no new
  functions, only an inspection of what this section has already built.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Look at every function this section has built that runs a process's own
code — `step`, `execute`, `exec-instruction`, `run-cycles` — and what
they're each given:

```clojure
(step registers memory program pc)
```

### The Updated Project

Skipped — no enclosing file exists yet; this is an observation about
already-written signatures, not a call to run.

### Mechanical Walkthrough

`step`'s own parameter list, `[registers memory program pc]` — **(a)
first appearance** as an argument: not one slot here is `kernel-state`,
or the free-frame list, or the full process table. Every function this
section has built to run ordinary process instructions was written,
lesson by lesson, to only ever receive a *single* process's own pieces —
never anything belonging to the kernel. There is no missing permission
check to bypass, because there is no path through which user-level code
could even obtain a reference to the free-frame list in the first place
— nothing in `step`'s call chain ever hands it one.

This is not a runtime guarantee, and it's worth naming honestly: nothing
stops a programmer from writing a brand-new function that calls
`process-with-page-table` directly, with a hand-picked frame, entirely
bypassing `sys-map-page`. Trace exactly what goes wrong if that happens —
reusing frame `2`, which Lesson 201's own `process-a` already has mapped:

```
(process-with-page-table process-a (assoc (process-page-table process-a) 3 2))
```

This directly assigns virtual page `3` to frame `2` — the exact frame
`process-a` itself already uses for page `0`. Nothing in
`process-with-page-table` checks whether frame `2` is already spoken for
anywhere; it isn't built to. Real hardware closes this gap completely
differently than a Clojure function signature ever could: user-mode code
physically cannot execute the privileged instructions that write page-
table hardware at all, no matter what it calls or how it's written — an
attempt simply faults immediately. This lesson's own version — never
handing kernel state to ordinary process code — is an honest, software-
level analogy of that same real, structural guarantee, not a full
reproduction of it.

### CS Lens

Preventing misuse by never handing out the tools needed to cause it,
rather than trusting code not to misuse tools it technically has, is a
real, named security principle.

```
Also recognized in: real hardware privilege rings, the actual mechanism
this lesson's software boundary approximates — user-mode code cannot
execute privileged instructions at all, not merely "isn't supposed to";
capability-based security systems, where possessing a reference *is* the
permission, and simply never being handed one is what keeps an operation
out of reach; and the principle of least privilege generally, a real,
standard software-engineering security principle this entire unit is one
concrete instance of
```

### SE Lens

Trusting that no one will ever call `process-with-page-table` directly
with a bad frame — a real, alternative posture — is genuinely how a lot
of ordinary application code operates, and it's fine when every caller is
cooperating in good faith. It fails, historically and repeatedly, exactly
where this lesson's subject matter lives: an operating system has to
assume some code running under it is buggy, or actively hostile, and
"please don't call this" is not a real defense against either. The real
fix already named above — user-mode code structurally unable to execute
privileged instructions at all — is what actual operating systems rely
on; this lesson's "kernel state is simply never passed to user-level
functions" is the same idea, honestly scaled down to what a software
boundary in this section's own simulation can actually enforce.

---

## Connect the Pieces

Follow one request for more memory through the entire boundary this
lesson built. Process `1`'s own code has no function available to it that
could touch the free-frame list directly — every function built for
running its instructions, since Lesson 195, only ever receives its own
registers, memory, and page table. `syscall`, the one function that does
receive `kernel-state`, dispatches `"map-page"` to `sys-map-page`, which
draws frame `5` from the shared free list, removes it so it can never be
handed out twice, and updates process `1`'s own page table with it. The
result is exactly what Lesson 201 needed but never built: a guarantee, by
construction, that no two processes ever end up sharing a frame — not
because anything checks for it, but because only one function in this
entire section is ever given the information needed to assign one at
all.

## What Breaks Without This

The closing section of this lesson's third unit already showed the
mechanism directly: call `process-with-page-table` on `process-a` with a
frame `process-a` — or any other process — already uses:

```clojure
(def process-a-corrupted
  (process-with-page-table process-a (assoc (process-page-table process-a) 3 2)))
```

Trace what this actually does: `process-a`'s original page table, `[2
0]`, already maps page `0` to frame `2`. This call adds page `3`, mapping
it to frame `2` as well — the *same* frame, now reachable through *two*
different virtual pages of the *same* process. `translate (process-page-
table process-a-corrupted) 0 4` and `translate (process-page-table
process-a-corrupted) 12 4` (page `3`, offset `0`, with `page-size 4`)
both resolve to the identical physical address, `8`. Nothing here throws;
both translations succeed, and both look like perfectly ordinary,
correct results. If this had instead been a different process's page
table, this is the exact frame-collision failure Lesson 201's own closing
section demonstrated — reached this time not through a coincidental
bug in frame assignment, but by simply calling a legitimate,
already-existing function directly instead of going through
`sys-map-page`. Nothing about `process-with-page-table` itself is broken;
it does exactly what it was built to do in Lesson 202 — rebuild a process
with one field changed. The safety was never in that function. It was
entirely in the fact that ordinary process code was never given a path to
call it with a frame nobody had actually verified was free.

## Exercises

1. Trace `syscall` requesting `"map-page"` for `process-b` (page `2`)
   against the kernel state left over from this lesson's own worked
   trace, `[(6 7) (process-a' process-b)]`, and state which frame gets
   assigned and what the free list looks like afterward.
2. Trace `sys-map-page` when the free-frame list is already empty, `()`,
   and confirm it returns `kernel-state` completely unchanged, the same
   honest "cannot grant this request" shape Lesson 194's `allocate`
   used for a failed fit.
3. Sketch, in prose, what a `sys-unmap-page` system call would need to do
   — given a process and a page number, how should it update both that
   process's page table *and* the free-frame list? No code required yet.

## Definition of Done

- [ ] `syscall` and `dispatch-syscall` are written and hand-traced for
      both a recognized and an unrecognized request.
- [ ] `take-free-frame`, `remove-frame`, `remove-frame-check`,
      `sys-map-page`, and its full chain down to
      `update-process-page-table-check` are written and hand-traced,
      matching this lesson's worked result, `[(6 7) (process-a'
      process-b)]`.
- [ ] The structural argument in the third unit — that no function built
      for running process instructions ever receives `kernel-state` — is
      understood well enough to state, without notes, which specific
      parameter is missing from `step`'s own signature.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why `process-with-page-table` itself isn't
      the bug, even though it's the function that produces the corrupted
      result.
- [ ] Commit with a message explaining *why* the fix for Lesson 201's
      frame collision lives in which functions get which arguments, not
      in a runtime permission check, not just *what* functions were
      added.
