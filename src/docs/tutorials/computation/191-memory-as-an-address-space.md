# Lesson 191: Memory as an Address Space

- **What you will build** — a simulated memory model as a Clojure vector
  of single-byte cells, functions to read and write a multi-byte value
  across consecutive addresses in two genuinely different, real byte
  orders, and address arithmetic for laying out several values
  contiguously. The transferable problem: every value this section has
  built — a bit list, a two's complement integer, a UTF-8 byte sequence —
  has existed only as a Clojure value floating free in this lesson's own
  script. Real memory is not free-floating; it's one enormous array of
  numbered slots, and *where* a value's bytes land, and in what order,
  turns out to matter as much as the bytes themselves.
- **What you need to know first** — `get`, `assoc`, `[...]` vector
  literal, `count` (Section V); `quot`, `mod` (modular arithmetic); the
  append-by-`assoc`-at-`(count v)` pattern (Lessons 94, 96); `empty?`,
  `first`, `rest` (Section II).
- **Terms introduced in this lesson**
  - **address** — a plain integer naming one specific slot in memory,
    the same way an index names one slot in a vector — memory *is* a
    vector, at this level of description, with "address" just the
    domain-specific name for its index.
  - **byte** — the standard eight-bit unit real memory is organized into;
    the smallest individually addressable unit in most real systems, and
    exactly the width Lesson 187's own word-width work already built
    toward.
  - **endianness** — the order a multi-byte value's individual bytes are
    stored in across consecutive addresses; **big-endian** stores the
    most-significant byte first (at the lowest address), **little-endian**
    stores the least-significant byte first.
  - **contiguous allocation** — storing several values back-to-back in
    memory at consecutive addresses, so any one of them can be located by
    simple arithmetic on its position, without needing to store its
    address separately anywhere.
- **Objects and methods used**: None new. This lesson reuses `get`,
  `assoc`, `[...]` (Section V), `count`, `quot`, `mod`, `empty?`, `first`,
  `rest` (Sections I, II), each already covered.

---

## Concept Unit: Memory as an Addressable Array

### The Problem

Nothing in this curriculum has needed a place to actually *store* a
value at a specific, numbered location before — every function so far has
taken input and returned output, with nothing persisting anywhere between
calls. Real memory does exactly that: it's a fixed-size space where a
value is written once and can be read back later, by number. What does
that actually look like, concretely?

### Introduce the Concept in Isolation

Skipped — a fixed-size vector, grown one appended slot at a time via
`assoc` at `(count v)`, is the exact known-good pattern already lab'd in
Lessons 94 and 96 for a heap's underlying array; nothing syntactic here
is new, only the domain it's being applied to.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from this section's binary-representation work.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

A block of memory, at this level, is nothing more than a vector of a
fixed size, every slot starting at `0`:

```clojure
(defn make-memory-acc
  [remaining memory]
  (if (= remaining 0)
    memory
    (make-memory-acc (- remaining 1) (assoc memory (count memory) 0))))
```

### The Updated Project

A small wrapper supplies the starting empty vector:

```clojure
(defn make-memory
  [size]
  (make-memory-acc size []))
```

Reading and writing one byte are exactly `get` and `assoc`, given their
own names for this domain:

```clojure
(defn read-byte
  [memory address]
  (get memory address))
```

```clojure
(defn write-byte
  [memory address value]
  (assoc memory address value))
```

### Mechanical Walkthrough

Enumerating `make-memory-acc`'s body:

- `(= remaining 0)` — **(c) already basic**.
- `(assoc memory (count memory) 0)` — **(b) a hard concept reappearing**:
  the append-by-assoc-at-count pattern from Lessons 94 and 96, here
  growing a block of zero-initialized memory instead of a heap array.

Enumerating `read-byte`'s and `write-byte`'s bodies:

- `get memory address`, `assoc memory address value` — **(c) already
  basic**; both already fully covered in Section V. Naming the index
  parameter `address` instead of a generic index is the only real change
  here — the same operation, given the vocabulary this domain actually
  uses.

Trace `make-memory` on `size = 4`:

```
make-memory-acc 4 []       → assoc [] 0 0 → [0]
make-memory-acc 3 [0]      → assoc [0] 1 0 → [0 0]
make-memory-acc 2 [0 0]    → assoc [0 0] 2 0 → [0 0 0]
make-memory-acc 1 [0 0 0]  → assoc [0 0 0] 3 0 → [0 0 0 0]
make-memory-acc 0 ...      → return [0 0 0 0]
```

`(write-byte (make-memory 4) 2 200)` gives `[0 0 200 0]` — address `2`
now holds `200`, every other address untouched. This is the entire model:
a fixed-size vector, an address is just its index, and reading or writing
a byte is nothing more than `get` or `assoc` already knew how to do.

### CS Lens

An addressable array of fixed-size slots, each independently readable and
writable by number, is real RAM's own model, not an abstraction invented
for this lesson.

```
Also recognized in: RAM itself, the direct real-world instance this
model represents; every array or vector data structure in every
language, which is fundamentally a thin, safe wrapper over exactly this
addressable-memory idea; and a hash table's own underlying bucket array
(Lesson 89) — memory addressed by a computed index instead of a
sequential one
```

### SE Lens

An address-indexed model, where any slot is reached by a plain number, is
not the only way memory could work. Content-addressable memory — real
hardware that exists, used in specialized applications like network
router lookup tables — finds a stored value by searching for a matching
*value*, not a numeric position. The tradeoff: address-indexed memory
(what this unit built, and what ordinary RAM actually is) is simple,
uniform, and cheap to build at enormous scale, with guaranteed constant-time
access by position; content-addressable memory can answer "where is this
value" directly, without a separate index structure, but costs
dramatically more per bit to build — which is exactly why it's reserved
for specialized, small-scale hardware instead of general-purpose RAM.

---

## Concept Unit: Multi-Byte Values and Endianness

### The Problem

One byte holds values only up to `255` (Lesson 187's own `max-unsigned
8`). A real value like `4660` needs more than one byte — which means it
has to span more than one address, and that raises a question a
single-byte value never had to answer: in which order do its bytes
actually go?

### Introduce the Concept in Isolation

Skipped — splitting a value into a high byte and low byte is `quot` and
`mod` by `256`, both already lab'd; nothing syntactic here is new, only
the two genuinely different orderings the real code below demonstrates.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `write-byte`.
- **Dependencies**: Babashka, already installed.

### The New Code

Splitting a value up to `65535` into its two constituent bytes:

```clojure
(defn high-byte
  [value]
  (quot value 256))
```

```clojure
(defn low-byte
  [value]
  (mod value 256))
```

### The Updated Project

Two different ways to store those two bytes across a pair of addresses —
most-significant byte first, or least-significant byte first:

```clojure
(defn write-big-endian
  [memory address value]
  (write-byte (write-byte memory address (high-byte value)) (+ address 1) (low-byte value)))
```

```clojure
(defn write-little-endian
  [memory address value]
  (write-byte (write-byte memory address (low-byte value)) (+ address 1) (high-byte value)))
```

Reading each ordering back reverses its own write exactly:

```clojure
(defn read-big-endian
  [memory address]
  (+ (* (read-byte memory address) 256) (read-byte memory (+ address 1))))
```

```clojure
(defn read-little-endian
  [memory address]
  (+ (* (read-byte memory (+ address 1)) 256) (read-byte memory address)))
```

### Mechanical Walkthrough

Enumerating `high-byte`'s and `low-byte`'s bodies:

- `(quot value 256)` — **(c) already basic**; how many whole `256`s fit —
  the value's more-significant half.
- `(mod value 256)` — **(c) already basic**; what's left over — the
  value's less-significant half, always under `256`, always fitting one
  byte.

Enumerating `write-big-endian`'s body:

- `write-byte memory address (high-byte value)` — **(c) already basic**
  call, storing the *high* byte at the *lower* address first.
- `write-byte ... (+ address 1) (low-byte value)` — **(c) already basic**;
  the low byte goes one address higher — **big-endian**, named and
  defined in this lesson's Terms, means exactly this ordering: most
  significant first.

`write-little-endian` is the same shape with the two bytes' addresses
swapped — **(a) first appearance** for the composition itself, even
though every piece inside it is already covered.

Trace `write-big-endian` on `(make-memory 4)`, address `0`, value `4660`:

```
high-byte 4660 → (quot 4660 256) → 18
low-byte  4660 → (mod  4660 256) → 52

write-byte memory 0 18   → [18 0 0 0]
write-byte ...    1 52   → [18 52 0 0]
```

`read-big-endian` on that same memory: `(read-byte memory 0)` is `18`,
`(read-byte memory 1)` is `52`, and `(+ (* 18 256) 52)` is `4608 + 52 =
4660` — the original value, recovered exactly. `write-little-endian` on a
fresh `(make-memory 4)` at the same address instead gives `[52 18 0 0]` —
the identical two byte *values*, `18` and `52`, just stored at swapped
addresses — and `read-little-endian` on that memory recovers `4660`
again, by reading them back in the matching order.

### CS Lens

Byte order is a real, actively relevant hardware and protocol fact, not
just a naming convention invented for this lesson.

```
Also recognized in: real CPU architectures, which genuinely differ —
x86 and ARM are predominantly little-endian; many older architectures and
most Internet protocols use big-endian, which is even literally called
"network byte order" in real networking standards, chosen specifically
so machines with different native byte orders could exchange data
unambiguously; and file-format "byte order marks," a real, standard
signal at the start of some file formats declaring which ordering the
rest of the file uses
```

### SE Lens

A single, universal byte order that every architecture agreed to use
always was never actually achieved, and that's a real, documented
engineering history, not an oversight. Different real hardware designs
made different tradeoffs: little-endian simplifies certain arithmetic
carry-propagation circuitry, since the least-significant byte — the one
arithmetic naturally starts from — sits at the lowest, most immediately
accessible address; big-endian reads more naturally in a raw hex dump,
matching how humans already write multi-digit numbers, most-significant
digit first. Neither won outright, which is exactly why real protocols
still have to explicitly declare or negotiate byte order today — the
practical cost of that unresolved tradeoff, demonstrated concretely in
this lesson's own closing section.

---

## Concept Unit: Contiguous Allocation and Address Arithmetic

### The Problem

One value at one address is the simplest case. Real programs store many
values together — an array, a record — and need to find any one of them
without keeping a separate, independently stored address for every single
one. How is one value's address found from just its position, given
where the whole group starts?

### Introduce the Concept in Isolation

Skipped — this unit composes already-lab'd arithmetic (`+`, `*`) and
already-lab'd recursion over a list; the new material is the addressing
scheme itself, demonstrated directly in the real code below.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `read-little-endian`.
- **Dependencies**: Babashka, already installed.

### The New Code

If every value in a group takes the same fixed width, the `n`-th one's
address is just the group's starting address, plus `n` widths:

```clojure
(defn element-address
  [base index width]
  (+ base (* index width)))
```

### The Updated Project

Writing a whole list of values **contiguously** — back-to-back, each at
its own computed address — recurses through the list, writing one
two-byte value per step and advancing the index each time:

```clojure
(defn write-array
  [memory base index values width]
  (if (empty? values)
    memory
    (write-array (write-big-endian memory (element-address base index width) (first values)) base (+ index 1) (rest values) width)))
```

### Mechanical Walkthrough

Enumerating `element-address`'s body:

- `(* index width)` — **(c) already basic**; how far past the base
  address this element's own slot starts.
- `(+ base ...)` — **(c) already basic**; the base address itself, plus
  that offset — this element's real, absolute address.

Enumerating `write-array`'s body:

- `(empty? values)` — **(c) already basic**; once every value is written,
  stop.
- `element-address base index width` — **(c) already basic**, just
  defined above, computing exactly where this step's value belongs.
- `write-big-endian memory (element-address ...) (first values)` — **(c)
  already basic** call, from the second unit, storing this step's value
  at its own computed address.
- `write-array ... (+ index 1) (rest values) ...` — **(b) a hard concept
  reappearing**: the same accumulator-style recursion used throughout
  this section, advancing an index instead of shrinking a number.

Trace `write-array` on `(make-memory 4)`, `base = 0`, `values = (4660
256)`, `width = 2`:

```
index 0: element-address 0 0 2 → 0
         write-big-endian memory 0 4660 → [18 52 0 0]
index 1: element-address 0 1 2 → 2
         write-big-endian memory 2 256  → high-byte 256=1, low-byte 256=0
                                        → [18 52 1 0]
index 2: values empty → return [18 52 1 0]
```

Two values, `4660` and `256`, land at addresses `0` and `2` respectively
— exactly `width` apart, with no address ever stored anywhere except as
the arithmetic that produces it on demand. `(read-big-endian [18 52 1 0]
(element-address 0 1 2))` — `(read-big-endian [18 52 1 0] 2)` — recovers
`256` exactly, confirming the second element's address was computed
correctly, not just written correctly.

### CS Lens

Locating an element by arithmetic on its position, rather than storing
its address separately, is how real arrays work at the hardware level in
every systems-level language.

```
Also recognized in: array indexing in C and similar languages, which
compiles directly to `base_address + index * element_size` — this unit's
own `element-address`, verbatim; struct field access, where a named
field is really just a fixed, compile-time-known offset from a struct's
base address; and this section's own upcoming pointer arithmetic
(Lesson 192), which is this exact idea given a name and put directly in
a programmer's hands
```

### SE Lens

Storing each value at an unrelated, independently chosen address — the
way Lesson 85's linked structures work, each node holding an explicit
reference to the next rather than living at a predictable offset — was
the available alternative. Contiguous allocation, built here, makes
address arithmetic trivial and keeps related values physically close
together in memory, which real hardware rewards directly (foreshadowing
Lesson 198's caches). Its real cost is rigidity: the whole block's size
has to be known in advance, and inserting a new value in the middle means
shifting every value after it to keep the arithmetic valid — exactly the
array-versus-linked-structure tradeoff this curriculum already named
in Section V, now grounded in what "contiguous" actually costs and buys
at the address level.

---

## Connect the Pieces

Follow `4660` and `256` through every function this lesson built.
`(make-memory 4)` starts as `[0 0 0 0]`. `write-array`, given `base 0`,
`values (4660 256)`, and `width 2`, computes each value's own address
with `element-address` — `0` for the first, `2` for the second — and
writes each one with `write-big-endian`, itself built from `high-byte`
and `low-byte` splitting a value at `256`. The result, `[18 52 1 0]`,
holds both values back-to-back with no address ever stored except as
whatever `element-address` computes on demand. Reading either one back —
`(read-big-endian memory (element-address 0 0 2))` for `4660`,
`(read-big-endian memory (element-address 0 1 2))` for `256` — recovers
both exactly, because every piece of this chain, from the raw
`read-byte`/`write-byte` pair in the first unit through this unit's own
address arithmetic, agreed on the same byte order the entire way through.

## What Breaks Without This

That last clause is the entire danger this lesson exists to name: nothing
about `read-big-endian` or `read-little-endian` checks which ordering a
given block of memory was actually written in. Write `4660` in little-
endian, then read it back in big-endian instead:

```clojure
(read-big-endian (write-little-endian (make-memory 4) 0 4660) 0)
```

Trace it: `write-little-endian` stores `low-byte 4660 = 52` at address
`0` and `high-byte 4660 = 18` at address `1`, giving `[52 18 0 0]`.
`read-big-endian` on that memory computes `(+ (* (read-byte memory 0)
256) (read-byte memory 1))` — `(read-byte memory 0)` is `52`, not `18`,
because `read-big-endian` assumes whatever's at the *lower* address is
the *more* significant byte, and this memory was written the opposite
way. The result: `(+ (* 52 256) 18)` — `13312 + 18 = 13330`. Not `4660`.
Not close to `4660`. A plain, valid-looking, completely wrong number,
produced by two functions that each individually work correctly — the
bug exists entirely in the mismatch between them, not in either one
alone. This is a real, historically common class of bug at exactly the
boundary between two systems (or two functions) that disagree about byte
order without either one announcing it. Nothing here throws an exception;
restoring correctness means writing and reading with the *same* function
pair every time, or, in a real system, explicitly recording which order
a given block of memory was written in.

## Exercises

1. Trace `write-little-endian` and `read-little-endian` together on a
   fresh `(make-memory 4)` at address `0` for the value `300`, and
   confirm the round trip recovers `300` exactly.
2. `write-array` only ever calls `write-big-endian`. Sketch, in prose,
   what would have to change to make `write-array` take the endianness as
   its own argument, choosing between `write-big-endian` and
   `write-little-endian` per call instead of always using one. No code
   required yet.
3. Using `element-address`, compute by hand the address of the *fourth*
   element (index `3`) of an array with `base 10` and `width 4`, and
   explain in one sentence why this computation never needs to look at
   any of the array's actual contents.

## Definition of Done

- [ ] `make-memory`, `read-byte`, and `write-byte` are written and
      hand-traced for a memory of size `4`, matching this lesson's worked
      trace.
- [ ] `high-byte`, `low-byte`, `write-big-endian`, `write-little-endian`,
      `read-big-endian`, and `read-little-endian` are written and
      confirmed to round-trip `4660` correctly in both orderings.
- [ ] `element-address` and `write-array` are written and hand-traced for
      `values (4660 256)` at `width 2`, matching `[18 52 1 0]`.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why `13330` appears instead of `4660`, and
      why neither `read-big-endian` nor `write-little-endian` is
      individually "wrong."
- [ ] Commit with a message explaining *why* an address is only ever
      computed, never stored, for elements written by `write-array`, not
      just *what* functions were added.
