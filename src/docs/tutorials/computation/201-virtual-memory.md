# Lesson 201: Virtual Memory

- **What you will build** — `translate`, converting a program's own
  address into a real physical one through a page table, a concrete
  demonstration of two different programs using the exact same address
  and landing in two genuinely different, non-overlapping places in real
  memory, and a page-fault check for an address a page table has no entry
  for at all. The transferable problem: every address in this whole
  section, since Lesson 191, has pointed directly at real physical
  memory, with nothing stopping one program's address from reaching
  another's data. Real operating systems never allow that — every address
  a program ever uses is a **virtual address**, translated through a
  table only the operating system controls, and that one extra layer of
  indirection is the entire mechanism behind keeping separate programs
  out of each other's memory.
- **What you need to know first** — `read-byte`, `write-byte`,
  `element-address` (Lesson 191); `deref`, aliasing (Lesson 192); `nil?`
  (Lesson 136); `quot`, `mod` (modular arithmetic).
- **Terms introduced in this lesson**
  - **virtual address** — the address a running program actually uses;
    meaningless on its own until translated into where the data really
    lives.
  - **physical address** — a genuine location in real memory — what
    every address in this section meant, before this lesson.
  - **page / frame** — memory divided into equal-sized chunks: a **page**
    is a chunk of virtual address space, a **frame** is a chunk of real
    physical memory; translation maps a page to a frame.
  - **page table** — the record, controlled entirely by the operating
    system, of which physical frame each of a program's own virtual pages
    currently maps to.
  - **page fault** — what happens when a virtual address's page has no
    entry in the page table at all — there is, at that moment, nowhere
    real for it to resolve to.
- **Objects and methods used**: None new. This lesson reuses `get`,
  `[...]` (Section V), `quot`, `mod` (modular arithmetic), `nil?` (Lesson
  136), `if`, `+`, `*` (already covered).

---

## Concept Unit: Translating an Address

### The Problem

Every address used since Lesson 191 has pointed directly at a real,
physical location — `read-byte memory 3` always meant "the fourth real
byte of this memory, nothing else." Nothing stops two completely
unrelated pieces of code from both using address `3` and landing in the
exact same real place, whether they meant to or not.

### Introduce the Concept in Isolation

Skipped — translation is a plain lookup in a vector plus some arithmetic,
all already covered; the real content is what the lookup represents,
demonstrated directly in the trace below.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from Lesson 191's memory model.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

A virtual address splits into which **page** it falls in, and its
**offset** within that page — the exact same `quot`/`mod` split
`element-address` (Lesson 191) already relied on, run in reverse:

```clojure
(defn page-number
  [virtual-address page-size]
  (quot virtual-address page-size))
```

```clojure
(defn page-offset
  [virtual-address page-size]
  (mod virtual-address page-size))
```

### The Updated Project

A **page table** is a plain vector — page number as index, physical
**frame** number as the value. `translate` looks up the frame, then
reconstructs a real physical address from it:

```clojure
(defn frame-for-page
  [page-table page]
  (get page-table page))
```

```clojure
(defn translate
  [page-table virtual-address page-size]
  (translate-with-frame (frame-for-page page-table (page-number virtual-address page-size))
                         (page-offset virtual-address page-size) page-size))
```

```clojure
(defn translate-with-frame
  [frame offset page-size]
  (if (nil? frame)
    nil
    (+ (* frame page-size) offset)))
```

### Mechanical Walkthrough

Enumerating `page-number`'s and `page-offset`'s bodies: `quot`, `mod` —
**(c) already basic**; the identical split `element-address` used, now
applied to a virtual address instead of an array index.

Enumerating `translate`'s and `translate-with-frame`'s bodies:
`frame-for-page page-table ...` — **(c) already basic**, `get` on a
vector. `(nil? frame)` — **(c) already basic**, Lesson 136; a page with
no table entry has nowhere to translate to. `(+ (* frame page-size)
offset)` — **(a) first appearance**: reconstructs a genuine physical
address from a frame number the *exact* same way `element-address`
reconstructed an array element's address from a base and an index — a
frame is just another kind of base.

Trace `translate` on two virtual addresses, `page-size 4`, against
`page-table = [2 0]` — virtual page `0` maps to physical frame `2`,
virtual page `1` maps to physical frame `0`:

```
translate [2 0] 1 4
  page-number 1 4 → 0, page-offset 1 4 → 1
  frame-for-page [2 0] 0 → 2
  translate-with-frame 2 1 4 → (2 × 4) + 1 = 9

translate [2 0] 5 4
  page-number 5 4 → 1, page-offset 5 4 → 1
  frame-for-page [2 0] 1 → 0
  translate-with-frame 0 1 4 → (0 × 4) + 1 = 1
```

Virtual addresses `1` and `5` — different pages — land at real physical
addresses `9` and `1`, with no fixed, predictable relationship between a
virtual address and where it actually ends up; that relationship exists
*only* in the page table.

### CS Lens

An extra layer of indirection between an address a program uses and
where that address actually resolves is a real, load-bearing idea, not
unique to virtual memory.

```
Also recognized in: real virtual memory in every modern operating
system, built on exactly this page-table translation; Lesson 196's own
register-indirect addressing, now revealed as one more layer of
indirection sitting *beneath* this one — a "virtual" address is itself
translated before it ever reaches real hardware; and logical-versus-
physical record addressing in databases and object stores, the identical
translation-layer idea one level removed from memory entirely
```

### SE Lens

The alternative — no translation at all, every address pointing directly
at real physical memory — is exactly what every memory model in this
section has used through Lesson 200. It's simpler: no extra lookup, no
table to maintain, nothing to translate. Its real cost, made concrete in
the next unit, is that it offers no isolation whatsoever between separate
programs sharing the same physical memory. Virtual memory, built here,
pays a real translation cost on every single memory access in exchange
for a guarantee direct addressing structurally cannot offer at all.

---

## Concept Unit: Isolation

### The Problem

Two completely separate programs, each with no knowledge of the other,
might both write code that uses virtual address `0` for something
important. Direct physical addressing would make that a disaster. Does
translation actually prevent it?

### Introduce the Concept in Isolation

Skipped — this unit runs `translate` again, already fully covered, against
a second, independent page table; nothing syntactic is new.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script; no new
  functions, only a second page table.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

A second, completely independent page table for a second program —
`page 0 → frame 1`, `page 1 → frame 3`:

```clojure
(translate [2 0] 0 4)
```

```clojure
(translate [1 3] 0 4)
```

### The Updated Project

Skipped — no enclosing file exists yet; both are standalone calls at the
`bb` REPL.

### Mechanical Walkthrough

Both calls are identical in shape to the first unit's own — **(c)
already basic** — the same `translate`, called twice, against two
different page tables and the identical virtual address, `0`.

```
translate [2 0] 0 4   →  frame 2 → (2 × 4) + 0 = 8
translate [1 3] 0 4   →  frame 1 → (1 × 4) + 0 = 4
```

Both programs use the exact same virtual address, `0`. They land at
physical addresses `8` and `4` — genuinely different, non-overlapping
real memory — entirely because each program's own page table says
something different about what page `0` means. Nothing about the second
program's own page table, `[1 3]`, contains a `2` anywhere in it — there
is no virtual address that program could ever construct that would
translate to frame `2`, and therefore none that could ever reach physical
address `8`, where the first program's data actually lives. This isn't a
permission check that could be skipped or forgotten; it's a structural
fact about what that program's own table even contains.

### CS Lens

Structurally preventing one program from ever being able to *construct*
an address that reaches another's memory, rather than checking and
denying it after the fact, is the real mechanism behind operating-system
process isolation.

```
Also recognized in: real operating-system process isolation itself —
the actual, literal reason one crashing or misbehaving program normally
cannot corrupt another program's memory, or the operating system's own;
containers and virtual machines, which extend this identical idea
further, isolating entire environments rather than single programs; and
sandboxing generally, wherever untrusted code needs to be structurally
prevented from reaching something it shouldn't
```

### SE Lens

A single shared address space for every program, with a permission check
guarding each access instead of separate page tables, was the available
alternative. That design needs the check enforced correctly on *every*
single access, by every piece of code that ever touches memory — a real,
and historically frequently buggy, correctness burden, since a single
missed or bypassed check reopens the whole gap. Per-program page tables,
built in this unit, make an out-of-bounds access structurally impossible
rather than merely forbidden — there is no address the second program
could construct that reaches the first program's frame at all, a
fundamentally stronger guarantee than "checked, and currently denied."

---

## Concept Unit: Page Faults

### The Problem

Every translation so far has found a real frame. A virtual page the
table has no entry for at all — never mapped, or no longer mapped — needs
its own honest answer, not a silent, wrong one.

### Introduce the Concept in Isolation

Skipped — `nil?` is already fully covered (Lesson 136); the real content
is what a missing entry means, demonstrated directly in the trace below.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `translate-with-frame`.
- **Dependencies**: Babashka, already installed.

### The New Code

A **page fault** is exactly the case `translate-with-frame` already
handled by returning `nil` — now given its own name and its own check:

```clojure
(defn page-fault?
  [page-table page]
  (nil? (frame-for-page page-table page)))
```

### The Updated Project

Skipped — no enclosing file exists yet; a standalone call against a page
table with an explicit gap.

### Mechanical Walkthrough

`(nil? (frame-for-page page-table page))` — **(c) already basic**
individually; naming this check on its own, separate from `translate`
itself, is **(a) first appearance**: a real program needs to know a
translation failed *before* trying to use whatever `translate` returned,
not discover it by getting `nil` back from something expecting a real
address.

Trace both `translate` and `page-fault?` against `page-table = [2 nil
0]` — page `1` deliberately left unmapped:

```
translate [2 nil 0] 4 4     (virtual address 4 → page 1, offset 0)
  frame-for-page [2 nil 0] 1 → nil
  translate-with-frame nil 0 4 → nil

page-fault? [2 nil 0] 1
  frame-for-page [2 nil 0] 1 → nil
  nil? nil → true
```

`translate` itself returns `nil` — an honest signal that this address
cannot be resolved right now — and `page-fault?`, checked directly against
the page number, confirms exactly why. A real operating system, on a real
page fault, does one of two things this lesson doesn't build: loads the
missing page from disk into a free frame and updates the table (if the
page is legitimately part of the program, just not currently resident —
the real mechanism that lets virtual memory exceed physical memory's
actual size), or terminates the program outright, if the address was
never legitimately part of its address space at all — a real segmentation
fault.

### CS Lens

A page fault is a real, named event any reader has likely already
encountered, not a hypothetical this lesson invents.

```
Also recognized in: the literal "page fault" (and its more severe
cousin, the "segmentation fault") a reader has almost certainly seen by
name in some real crash; virtual memory legitimately exceeding physical
RAM's actual size, via swapping pages to and from disk on demand, the
other real reason page faults exist beyond catching illegal access; and
lazy or on-demand loading elsewhere in software generally — a resource
fetched only the first moment it's genuinely needed, the identical
"fault, then resolve" shape
```

### SE Lens

Requiring every virtual page a program might ever touch to be mapped
before it starts running, with no possibility of a fault ever occurring,
was the available alternative — genuinely simpler, no fault-handling
machinery needed at all. Its real cost: every page a program *might*
touch, whether or not it ever actually does, has to be loaded and mapped
up front, wasting real time and memory on pages that may never be used.
Allowing faults, as this unit does, lets an operating system map pages
lazily, only when genuinely needed — real, standard practice — at the
cost of needing real fault-handling machinery (an honest limit of this
lesson, not built here) and a small, real delay the first time each page
is actually touched.

---

## Connect the Pieces

Follow the same virtual address, `0`, through two separate programs and
one honest failure case. The first program's page table, `[2 0]`,
translates virtual address `0` to physical address `8`. The second
program's page table, `[1 3]`, translates the *identical* virtual address
`0` to physical address `4` — genuinely different real memory, guaranteed
by nothing more than what each program's own table contains.
`page-fault?`, checked against a table with a deliberate gap, `[2 nil
0]`, confirms honestly when no such translation exists at all, rather
than `translate` silently returning something that looks like a valid
address but isn't. Every one of these results traces back to the same
two functions, `frame-for-page` and `translate-with-frame`, applied to
whatever page table happens to be in force at the time — isolation,
translation, and honest failure are not three separate mechanisms, only
three consequences of the same one lookup.

## What Breaks Without This

Isolation, demonstrated in the second unit, depends entirely on no two
programs' page tables ever mapping a page to the *same* physical frame.
Nothing in `translate` itself checks for that — it trusts whatever page
table it's given. Give a third program a page table that, by mistake,
reuses the first program's own frame:

```clojure
(translate [2 5] 0 4)
```

Trace it: `page-table = [2 5]` maps this third program's page `0` to
frame `2` — the *exact* frame the first program's own table, `[2 0]`,
already used for its own page `0`. `translate [2 5] 0 4` computes `(2 ×
4) + 0 = 8` — the identical physical address the first program's
`translate [2 0] 0 4` already produced. If the third program writes to
its own virtual address `0`, believing it owns that memory exclusively,
it is genuinely writing to physical address `8` — the first program's
real data — and the first program reading its own virtual address `0`
back would see whatever the third program just wrote. Nothing here
throws an error; both `translate` calls succeed, and both look, on their
own, like perfectly ordinary, correct translations. The isolation this
lesson's second unit demonstrated was never a property of `translate`
itself — it was a property of the page tables happening to point at
different frames. The real safeguard has to live in whoever *assigns*
frames to page tables in the first place, making sure no two programs'
tables are ever handed the same one — the identical discipline Lesson
194's free-list allocator needed to avoid a double free, now protecting
physical frames instead of heap blocks.

## Exercises

1. Trace `translate` on virtual address `6` against `page-table = [2 0]`,
   `page-size 4`, and state which page and offset it resolves to, and the
   final physical address.
2. Using `page-fault?`, check every page number from `0` to `2` against
   `page-table = [2 nil 0]` in turn, and state which ones fault and
   which don't.
3. Sketch, in prose, what a `map-page` function would need to do to fix
   this lesson's own "What Breaks Without This" scenario — given a set of
   frames already in use by *other* programs, how should it choose a
   frame for a new page table entry to guarantee no collision? No code
   required yet.

## Definition of Done

- [ ] `page-number`, `page-offset`, `frame-for-page`, `translate`, and
      `translate-with-frame` are written and hand-traced for both worked
      examples, matching physical addresses `9` and `1`.
- [ ] The isolation demonstration is hand-traced for both page tables,
      matching physical addresses `8` and `4` for the identical virtual
      address `0`.
- [ ] `page-fault?` is written and hand-traced against `page-table = [2
      nil 0]`, matching a fault on page `1` and none on pages `0` or `2`.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why neither `translate` call involved
      throws an error even though isolation has genuinely been violated.
- [ ] Commit with a message explaining *why* isolation is a property of
      which frames get assigned to which page tables, not a property of
      `translate` itself, not just *what* functions were added.
