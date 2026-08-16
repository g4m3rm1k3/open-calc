# Lesson 192: Pointers and References

- **What you will build** — a `deref` function that follows an address to
  the value stored there, a concrete demonstration of two independently
  stored pointers sharing — and mutating — the same underlying data, and
  a null-pointer-safe dereference contrasted against pointer arithmetic
  that walks through Lesson 191's own array. The transferable problem:
  Lesson 191 built addresses as places to store bytes; this lesson stores
  an *address itself* as a value, which is a genuinely different thing
  from an ordinary number even though it's made of the exact same bits —
  and once two different variables can hold the same address, they stop
  being independent, whether anything about their own code says so or not.
- **What you need to know first** — `read-byte`, `write-byte`,
  `element-address` (Lesson 191); `nil?` (Lesson 136); **alias**, already
  given full treatment in Lesson 168 for a toy interpreter's abstract
  store — this lesson grounds the identical idea in real numeric
  addresses instead.
- **Terms introduced in this lesson**
  - **pointer** — an address, stored as an ordinary value, meant to be
    followed rather than used directly; the same bits as any other
    number, distinguished only by the intent to treat them as "go look
    over there" instead of "this is the value itself."
  - **dereference** — following a pointer to the value stored at the
    address it holds, rather than using the pointer's own numeric value.
  - **null pointer** — a pointer holding no valid address at all, a
    sentinel meaning "points nowhere," which crashes or misbehaves the
    moment something dereferences it without checking first.
  - **pointer arithmetic** — computing a new pointer by adding an offset
    to an existing one, the same arithmetic Lesson 191's own
    `element-address` already used, just performed directly on a pointer
    value instead of a separately tracked index.
- **Objects and methods used**: None new. This lesson reuses `read-byte`,
  `write-byte` (Lesson 191), `nil?` (Lesson 136), `if`, `+` (Section I),
  each already covered.

---

## Concept Unit: Pointers and Dereferencing

### The Problem

An address, from Lesson 191, was always used directly — `read-byte
memory 3` reads *address* `3`. What if the number `3` itself is stored
somewhere else in memory, meant to be read first and then followed,
rather than used on the spot? That's the entire idea of a pointer, but it
raises an immediate question: how would anything ever tell `3`-the-plain-
number apart from `3`-the-pointer, since they're the same bits either way?

### Introduce the Concept in Isolation

Skipped — `deref` is one already-lab'd `read-byte` call; nothing
syntactic here is new. The real demonstration is the concrete example
below: nothing about it needs a disconnected throwaway lab to make its
point.

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

Dereferencing is reading memory at *whatever address a pointer holds* —
which means reading memory twice: once to get the pointer's own value,
and once more to follow it:

```clojure
(defn deref
  [memory pointer]
  (read-byte memory pointer))
```

### The Updated Project

This is a freestanding new function with nothing enclosing it yet —
Project Change already covers this case. What makes it a pointer, rather
than a plain address used directly, only shows up once it's stored
*inside* memory alongside the data it refers to:

```clojure
(write-byte (write-byte (make-memory 6) 3 42) 0 3)
```

### Mechanical Walkthrough

Enumerating `deref`'s body:

- `read-byte memory pointer` — **(c) already basic**; identical to any
  other `read-byte` call. Nothing in `deref`'s own code distinguishes a
  pointer from an ordinary address — the distinction lives entirely in
  how the *caller* uses the result, not in anything this function does
  differently.

Enumerating the memory-construction expression:

- `write-byte ... 3 42` — **(c) already basic**; stores the real data,
  `42`, at address `3`.
- `write-byte ... 0 3` — **(a) first appearance**: stores the *address*
  `3` at address `0` — not the data itself, a pointer to where the data
  actually lives. Nesting it around the first `write-byte` call, rather
  than binding an intermediate name, is the same argument-threading shape
  used everywhere `let` is off-limits in this curriculum — each call's
  result becomes the next call's first argument directly.

Trace what's stored, and what following it actually recovers:

```
memory = (make-memory 6) → [0 0 0 0 0 0]
write-byte memory 3 42   → [0 0 0 42 0 0]     address 3 holds the real data
write-byte ...    0 3    → [3 0 0 42 0 0]     address 0 holds a pointer to it

(read-byte memory 0)          → 3       the pointer's own value
(deref memory (read-byte memory 0)) → (deref memory 3) → (read-byte memory 3) → 42
```

`(read-byte memory 0)` alone gives `3` — and if that `3` were mistaken
for the real data instead of a pointer needing one more step, every use
of it downstream would be silently, completely wrong. `deref` is the one
extra step that makes the difference: it says "don't use this number,
*go where it points*."

### CS Lens

Storing an address as a value, meant to be followed rather than used
directly, is the foundational idea behind an entire category of language
feature, not just this lesson's own toy example.

```
Also recognized in: every pointer in C, where `*p` is exactly this
lesson's `deref`; object references in Java, Python, and JavaScript,
which are pointers under a friendlier name, dereferenced automatically
by the language so the indirection never has to be written out by hand;
and the general design principle sometimes summarized as "every problem
in computer science can be solved by another layer of indirection"
```

### SE Lens

The alternative to storing a pointer is storing the actual value directly,
everywhere it's needed — "pass by value" instead of "pass by reference."
Passing a value directly is simple and can never be confused about
whether it's shared with anything else, but it costs a real copy every
single time, expensive for anything larger than a few bytes. Passing a
pointer, built here, avoids that copy entirely — regardless of how large
the real data is, the pointer itself is always the same small size — at
the cost demonstrated in the next unit: once two different places can
hold the same pointer, they are no longer independent, whether or not
either one's own code has any idea the other exists.

---

## Concept Unit: Aliasing Through Shared Addresses

### The Problem

Lesson 168 already named **alias** — two references to the same
underlying location, where a change through one is visible through the
other — for a toy interpreter's abstract store. Grounded in this
section's own real numeric addresses instead of that abstract model,
does the exact same thing actually happen, concretely, byte for byte?

### Introduce the Concept in Isolation

Skipped — this unit reuses only already-lab'd `write-byte` and `deref`
calls; the point is the concrete demonstration itself, not a new
construct.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script; no new
  functions, only a new demonstration using `deref` and `write-byte`.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Store the *same* pointer, address `3`, in two different places — address
`0` and address `1` — both meant to represent two separate "variables"
that happen to point at the same real data:

```clojure
(write-byte (write-byte (write-byte (make-memory 6) 3 42) 0 3) 1 3)
```

### The Updated Project

Skipped — no enclosing file exists yet; this and the mutation below are
standalone expressions at the `bb` REPL.

### Mechanical Walkthrough

The expression above is the same shape already walked through in the
first unit, with one more `write-byte` — **(c) already basic** — storing
the identical pointer value, `3`, at a second address. Nothing about
storing the same number twice is syntactically new; what's new is what
happens next.

Trace both "variables" before and after a mutation *through the shared
address they both point to*:

```
memory = [3 3 0 42 0 0]        addr 0 and addr 1 both hold pointer 3

(deref memory (read-byte memory 0)) → (deref memory 3) → 42
(deref memory (read-byte memory 1)) → (deref memory 3) → 42

memory' = (write-byte memory 3 99)   → [3 3 0 99 0 0]

(deref memory' (read-byte memory' 0)) → (deref memory' 3) → 99
(deref memory' (read-byte memory' 1)) → (deref memory' 3) → 99
```

Both "variables" changed, even though only address `3` was ever
written to directly — neither address `0` nor address `1` was touched by
the mutation at all. This is exactly the **alias** Lesson 168 already
named: two independently stored references sharing one underlying
location, where a change through either one is visible through both,
because neither of them was ever really holding the data — only a
pointer to where it lives.

### CS Lens

Aliasing through a shared pointer is a real, extremely well-documented
source of both power and bugs, not a rare edge case.

```
Also recognized in: real, documented aliasing bugs in C, where two
pointers unexpectedly referring to the same buffer corrupt data neither
one's own code appears to touch; Python's famous mutable-default-argument
footgun, caused by exactly this kind of accidental sharing; and shared
mutable state accessed by more than one concurrently running task, a
real, ongoing source of an entire class of bugs in concurrent programs
```

### SE Lens

The alternative to sharing a pointer is deep-copying the data every time
it's handed to a second owner, so nothing is ever aliased at all. Copying
eliminates this entire category of surprise — no change through one
"variable" can ever be visible through another — but costs real time and
memory proportional to the data's size, paid again every single time it's
shared. Sharing a pointer, demonstrated in this unit, is cheap regardless
of size, but requires every piece of code that touches it to understand
it might be watched, or changed, by something else entirely — the real,
foundational reason some languages default to copying values and others
default to sharing references, and why some require a programmer to
choose explicitly every time.

---

## Concept Unit: Null Pointers and Pointer Arithmetic

### The Problem

Every pointer used so far has pointed somewhere valid. A pointer that
points *nowhere* — because nothing has been assigned to it yet, or
because whatever it pointed to is gone — needs its own sentinel value,
and dereferencing it without checking first needs to be something a
program can guard against, not just something that happens to work by
luck.

### Introduce the Concept in Isolation

Skipped — `nil` and `nil?` are already fully covered (Lesson 136); this
unit applies them to a new domain (pointers) rather than introducing new
syntax.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `deref`.
- **Dependencies**: Babashka, already installed.

### The New Code

A **null pointer** is represented here with `nil` — Clojure's own
"nothing here" value, already fully covered. Checking for it before
dereferencing is what tells a null pointer apart from a real crash
waiting to happen:

```clojure
(defn deref-safe
  [memory pointer]
  (if (nil? pointer)
    nil
    (deref memory pointer)))
```

### The Updated Project

**Pointer arithmetic** — computing a new pointer from an old one plus an
offset — is nothing more than plain addition on the address itself:

```clojure
(defn pointer-add
  [pointer offset]
  (+ pointer offset))
```

### Mechanical Walkthrough

Enumerating `deref-safe`'s body:

- `(nil? pointer)` — **(c) already basic**, Lesson 136.
- `nil` as the guarded branch's result — **(a) first appearance**: this
  is the first time in this curriculum "nothing happened, on purpose, and
  that's a valid result" has been the *correct* answer to return, rather
  than something to avoid.
- `deref memory pointer` — **(c) already basic**, the first unit's own
  function, only reached once `pointer` is confirmed not to be null.

Enumerating `pointer-add`'s body:

- `(+ pointer offset)` — **(c) already basic** arithmetic — but the
  *meaning* is new: this is `element-address`'s own idea (Lesson 191),
  applied directly to a pointer value instead of computed fresh from a
  separately tracked base and index.

Trace `pointer-add` walking through Lesson 191's own `write-array`
result, `[18 52 1 0]` — two big-endian values, `4660` and `256`, stored
at width `2`:

```
p0 = 0
(read-big-endian memory p0) → 4660

p1 = (pointer-add p0 2) → 2
(read-big-endian memory p1) → 256
```

`p1`, computed by stepping `p0` forward with `pointer-add`, lands on the
exact same address `(element-address 0 1 2)` already computed directly in
Lesson 191 — two different ways of reaching the identical address: one
by computing an index-and-width formula fresh each time, one by carrying
a pointer forward and stepping it. Both are real, both are used in real
code; walking forward with `pointer-add` is exactly what a raw pointer
loop in C does, one step at a time, with no index variable at all.

Now trace `deref-safe` against a genuinely null pointer:

```
(deref-safe memory nil) → (nil? nil) is true → return nil, no crash
```

Compare that against the closing section below, which traces what
happens when the *unsafe* `deref` meets the same `nil`.

### CS Lens

A pointer that can point nowhere, and the bug class that follows from
forgetting to check, is one of the most consequential design decisions in
computing history — not a minor detail.

```
Also recognized in: Tony Hoare's own well-known, documented description
of inventing the null reference as his "billion-dollar mistake," citing
the sheer number of real bugs and vulnerabilities it has caused since;
the real, extremely common `NullPointerException` and segmentation-fault
bug classes across decades of real production software; and `Option` or
`Maybe`-style types in more modern languages, designed specifically to
force a null case to be handled explicitly instead of allowing an
un-gated dereference at all
```

### SE Lens

The alternative to allowing null pointers at all is a type system that
simply forbids them — every pointer, by construction, always points
somewhere valid. That eliminates the entire bug class this unit names,
but demands a real answer for "what goes here when there's genuinely
nothing yet" — some other explicit wrapper or sentinel type has to fill
that role instead, pushing the same question somewhere else rather than
making it disappear. Allowing `nil`, as this unit does, is simple and
flexible, but pushes the responsibility for checking onto every single
piece of code that ever dereferences a pointer, forever — `deref-safe`
against plain `deref` is exactly that choice, made explicit, at the level
of two different functions doing two different things with the same
input.

---

## Connect the Pieces

Follow one pointer, address `3`, through every idea this lesson built.
`deref memory 3` (first unit) follows it to the real data, `42`. Two
separate "variables," addresses `0` and `1`, both storing that same
pointer (second unit), both see the identical `42` — and both see `99`
the instant address `3` is mutated, even though neither address `0` nor
`1` was itself ever touched, because neither was ever holding the data,
only a pointer to it. `pointer-add` (third unit) walks a pointer forward
by a fixed width, landing on the same address Lesson 191's own
`element-address` already computed directly — two routes to the same
place. And `deref-safe`, checked against a genuine `nil`, returns `nil`
cleanly, exactly the discipline that would have kept the first two
units' pointers safe if either one had ever gone missing.

## What Breaks Without This

`deref-safe` checks for `nil` before ever calling `read-byte`. Skip that
check — call the *unsafe* `deref` from the first unit directly on a null
pointer, inside a larger computation that needs a real number back:

```clojure
(read-big-endian memory nil)
```

Trace it: `read-big-endian` calls `(read-byte memory nil)` first — which
is `(get memory nil)`. `get`, on a vector, never throws for an invalid
key; it simply returns `nil`. No crash yet — the failure is silent,
completely unremarkable, and the wrong value keeps flowing forward. Only
one line later does `read-big-endian` try `(* nil 256)` — and *that*
throws a real, genuine `NullPointerException`, because `*` requires an
actual number and got `nil` instead. The crash is real, but it happens
one full function call away from where the actual problem — a pointer
that should never have been `nil` in the first place — actually
originated. This is exactly why null-pointer bugs have a real, documented
reputation for being hard to track down: the failure surfaces wherever
the null value first gets used in a way that can't tolerate it, which is
very often nowhere near wherever it was first allowed to become `nil`.
`deref-safe`'s check, by contrast, fails — or, more precisely, cleanly
returns `nil` — at the exact moment of dereferencing, not several calls
downstream in unrelated arithmetic.

## Exercises

1. Trace `deref-safe` on a real, non-null pointer and confirm it produces
   the identical result plain `deref` would, for the memory `[3 3 0 42 0
   0]` and pointer `3`.
2. This lesson's aliasing demonstration stored the same pointer at two
   *different* addresses. Sketch, in prose, what would happen instead if
   address `1` held a *different* pointer — say, `4`, pointing at a
   second, separate piece of data — and address `3` were then mutated. No
   code required yet.
3. Using `pointer-add`, walk all the way through a three-element version
   of Lesson 191's `write-array` result by hand — starting at `p0 = 0`
   with `width 2`, compute `p1` and `p2`, and state which real address
   each one lands on.

## Definition of Done

- [ ] `deref` is written and hand-traced for the pointer-and-data example,
      matching this lesson's `[3 0 0 42 0 0]` and recovered value `42`.
- [ ] The aliasing demonstration (`[3 3 0 42 0 0]`, mutated to `[3 3 0 99
      0 0]`) is hand-traced and understood well enough to explain, without
      notes, why neither address `0` nor address `1` was ever written to
      directly.
- [ ] `deref-safe` and `pointer-add` are written and hand-traced against
      this lesson's `nil` and `pointer-add` examples.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why the real crash happens inside
      `read-big-endian`'s arithmetic rather than at the `(get memory
      nil)` call itself.
- [ ] Commit with a message explaining *why* aliasing is a direct
      consequence of what a pointer actually is, not a separate bug to
      guard against independently, not just *what* functions were added.
