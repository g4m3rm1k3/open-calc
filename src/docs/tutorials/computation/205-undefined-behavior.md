# Lesson 205: Undefined Behavior

- **What you will build** — a real, honest reconstruction of the single
  most famous class of undefined-behavior bug in real C and C++: an
  overflow check a compiler is legally allowed to delete entirely,
  demonstrated using this section's own two's complement machinery from
  Lesson 188; a concrete look at reading memory after it's been freed,
  grounded in Lesson 194's own allocator; and a genuinely safe fix, plus
  a demonstration that even the fix can still be wrong if it's built on
  a mistaken understanding of a representation's real limits. The
  transferable problem: this whole section's simulations have always run
  the *real*, honest arithmetic — `ripple-add` genuinely wraps, `free`
  genuinely leaves old bytes in place. Real language specifications often
  refuse to promise either of those things happens at all, and that gap
  between "what the hardware happens to do" and "what the language
  actually guarantees" is exactly where undefined behavior lives.
- **What you need to know first** — `ripple-add`, `truncate-to-width`,
  `twos-complement->decimal`, the real `-8` to `7` range (Lesson 188);
  `allocate`, `free`, `read-byte` (Lesson 194); `+`/`+'` throwing versus
  promoting (Lesson 187) — this curriculum's own language never having
  this exact problem, for a real, deliberate reason.
- **Terms introduced in this lesson**
  - **undefined behavior** — a real, standard term: an operation a
    language specification declares to have *no* defined result at all —
    not "unpredictable," but a genuine license for a compiler to assume
    it never happens, and to optimize accordingly, even if that changes
    other, seemingly unrelated code.
  - **well-defined behavior** — the ordinary case: an operation whose
    result the language specification actually pins down, the same
    guarantee every function in this curriculum has always relied on.
- **Objects and methods used**: None new. This lesson reuses `ripple-add`,
  `truncate-to-width`, `twos-complement->decimal`, `decimal->binary`,
  `pad-to-width` (Lessons 184, 186, 187, 188), `read-byte` (Lesson 191),
  `<`, `>=` (Section I), each already covered.

---

## Concept Unit: The Overflow Check a Compiler Can Delete

### The Problem

A programmer, worried about signed overflow, writes a defensive check: "if
adding one to `x` would make the result *smaller* than `x`, something
overflowed." Lesson 188's own machinery can run that check honestly,
using real two's complement wraparound. Does a real compiler have to
honor what that check actually finds?

### Introduce the Concept in Isolation

Skipped — every function in this unit reuses Lesson 188's own already-
verified two's complement machinery directly; nothing syntactic here is
new. The real content is the compiler's own legal reasoning, demonstrated
directly below.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from Lesson 188's two's complement work.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Running the check honestly, the way real hardware actually would — add
one, using genuine four-bit wraparound, and decode the result back to a
signed value to compare:

```clojure
(defn hardware-add-one
  [x-bits width]
  (truncate-to-width (ripple-add x-bits (pad-to-width (decimal->binary 1) width)) width))
```

```clojure
(defn hardware-overflow-check
  [x width]
  (< (twos-complement->decimal (hardware-add-one (pad-to-width (decimal->binary x) width) width) width) x))
```

### The Updated Project

What a real compiler, told signed overflow is **undefined behavior**, is
legally permitted to produce instead — having reasoned that `x + 1 < x`
can only ever be true *if* overflow occurred, and having been told to
assume overflow never occurs, it concludes the check can never be true:

```clojure
(defn optimized-overflow-check
  [x width]
  false)
```

### Mechanical Walkthrough

Enumerating `hardware-add-one`'s and `hardware-overflow-check`'s bodies —
every piece **(c) already basic**, Lessons 186 through 188 — composed
into **(a) first appearance**: running the *actual* wraparound arithmetic
specifically to check whether it wrapped, rather than assuming an answer
either way.

`optimized-overflow-check`'s body, the bare literal `false` — **(a)
first appearance**: not a bug in the ordinary sense — a real, logically
valid conclusion, *given* the premise that `x + 1` never overflows for
any value the language considers legal. The premise is what's dangerous,
not the logic built on top of it.

Trace both functions on `x = 7`, `width = 4` — the largest value four-bit
two's complement can represent, confirmed directly back in Lesson 188:

```
hardware-add-one (pad-to-width (decimal->binary 7) 4) 4
  → 0111 + 0001 = 1000                        (real binary addition)
twos-complement->decimal (1 0 0 0) 4 → -8      (Lesson 188's own result)
hardware-overflow-check 7 4 → (< -8 7) → true  (overflow correctly detected)

optimized-overflow-check 7 4 → false           (overflow NOT reported)
```

The honest hardware computation finds the overflow — `-8` really is less
than `7`, exactly the wraparound Lesson 188 already proved happens. The
"optimized" version, legally justified by treating overflow as
undefined, reports `false` for the *identical* input — no overflow found
at all. Both functions are internally consistent with their own
premises. Only one of them matches what the real hardware, run honestly,
actually does.

### CS Lens

This is not a hypothetical worst case — it is one of the single most
documented, most cited real bug patterns in production C and C++
compilers.

```
Also recognized in: real, published discussions from real compiler
engineering teams (GCC, LLVM) specifically about signed-overflow-check
elimination exactly like this one; real, documented security
vulnerabilities that trace directly back to a compiler silently removing
a check written specifically to prevent an overflow; and — as a direct,
concrete contrast — this curriculum's own Clojure code throughout this
entire section, which never once had this problem, because Clojure's own
`+` throws a real, catchable exception on overflow instead of leaving
the result undefined (Lesson 187), a deliberate, different language
design choice
```

### SE Lens

A language that fully defines overflow — "it always wraps," exactly
matching what real two's complement hardware does, exactly what this
section's own simulation has done since Lesson 188 — was the available
alternative. It gives a predictable, safe-to-reason-about result, and
this unit's own `hardware-overflow-check` would then be a completely
reliable check, guaranteed by the language itself, not merely by luck.
The real cost: pinning down "always wraps" prevents a compiler from
performing certain aggressive optimizations that specifically rely on
assuming overflow never happens. Undefined behavior, the stance real
C and C++ take, allows those optimizations — at the cost this unit just
demonstrated concretely: the burden of avoiding overflow shifts entirely
onto the programmer, with the compiler no longer acting as a safety net
at all, and in fact actively working against a check meant to catch it.

---

## Concept Unit: Reading Freed Memory

### The Problem

Lesson 194's `free` never actually erases anything — it only removes a
block from the free list, leaving whatever bytes were there completely
untouched. Does that mean reading a freed address is safe, just because
this lesson's own simulated memory happens to still hold something
sensible there?

### Introduce the Concept in Isolation

Skipped — `read-byte` is already fully covered (Lesson 191); the real
content is what reading it *means*, after a free, demonstrated directly
below.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: N/A — this unit reuses `read-byte` on already-covered
  memory rather than adding a new function.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Write to an allocated address, free the block it belongs to, then read
the *same* address again, with nothing reallocated in between:

```clojure
(read-byte (write-byte (make-memory 4) 1 42) 1)
```

### The Updated Project

Skipped — no enclosing file exists yet; a standalone sequence of calls at
the `bb` REPL.

### Mechanical Walkthrough

`write-byte`, `read-byte` — **(c) already basic**, Lesson 191. Reading
the identical address right back — **(a) first appearance** in this
specific framing: nothing about `free` (Lesson 194) ever touches the
bytes a block held; `free` only ever edits the free list. `read-byte`
here still finds `42`, exactly what was written, simply because nothing
has overwritten it since.

Run it:

```
user=> (read-byte (write-byte (make-memory 4) 1 42) 1)
42
```

`42` really is what's sitting at address `1` in this simulated memory,
and reading it after the block is conceptually "freed" doesn't crash or
produce nonsense — it produces exactly what was last written there.
That's a real, honest fact about how this simple allocator happens to
work. It is *not* a promise any real language makes. A real language
declares reading freed memory undefined — not "returns the old value,"
not "returns garbage," genuinely undefined — meaning a compiler is free
to assume a correctly written program never does this at all, and may
reorder, cache, or eliminate code around such an access with no
obligation to preserve what a literal re-run of the raw memory operations
would show.

### CS Lens

The gap between "this happens to be the observed value" and "the
language guarantees this value" is a real, well-documented, and
genuinely unintuitive source of real bugs.

```
Also recognized in: real, documented use-after-free security
vulnerabilities, a major, well-known category distinct from but closely
related to Lesson 194's own double-free; and the real, well-known fact
that two runs of the exact same undefined-behavior-containing program —
different compiler version, different optimization level, even an
unrelated change elsewhere in the source — can produce genuinely
different results, because nothing about "undefined" ever promised
consistency in the first place
```

### SE Lens

A runtime that deliberately zeros or "poisons" memory the instant it's
freed — turning a silent, inconsistent bug into a loud, reliably
detectable one — was the available alternative to leaving the value
undefined. Poisoning costs real, extra work on every single `free` call,
genuinely touching and overwriting memory that would otherwise just sit
there untouched, in exchange for making a use-after-free failure
consistent and catchable instead of silently working by accident, some
of the time, on some inputs, under some compilers. Real, widely used
tools (like AddressSanitizer) do exactly this deliberately, specifically
during testing, precisely because relying on undefined behavior's
"happens to look fine" outcome is not a real correctness guarantee.

---

## Concept Unit: Why the Gap Exists, and the Real Fix

### The Problem

Why would a language deliberately refuse to pin down what happens,
instead of just promising "whatever the hardware does"? And given that it
doesn't, how should a check like the first unit's actually be written?

### Introduce the Concept in Isolation

Skipped — `safe-overflow-check` is a single already-covered comparison;
the real content is why it avoids this lesson's own trap, and where its
own honest limit is, shown directly below.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `optimized-overflow-check`.
- **Dependencies**: Babashka, already installed.

### The New Code

A genuinely safe check never performs the risky operation at all — it
compares `x` directly against the real, known maximum a representation
can hold, using nothing but ordinary, fully-defined comparison:

```clojure
(defn safe-overflow-check
  [x max-value]
  (>= x max-value))
```

### The Updated Project

Skipped — no enclosing file exists yet; a standalone call at the `bb`
REPL.

### Mechanical Walkthrough

`(>= x max-value)` — **(a) first appearance**: unlike `x + 1 < x`, this
expression never computes `x + 1` at all — there is no undefined
operation anywhere in it for a compiler to reason its way around.
`>=` on ordinary values is completely, unambiguously defined; a compiler
has no license to assume anything about this check other than exactly
what it says.

Run it against `x = 7`, using Lesson 188's own real, hard-won maximum for
four-bit two's complement, `7`:

```
user=> (safe-overflow-check 7 7)
true
```

Correctly flags that `7` is already at the representable maximum — one
more would overflow — without ever running the operation that would
actually cause it.

This fix has an honest limit worth taking seriously: it is only as
correct as the `max-value` it's given. Run it again with a *wrong*
maximum — `8`, perhaps mistaken for four-bit two's complement's limit by
someone who forgot the leading bit is reserved for sign:

```
user=> (safe-overflow-check 7 8)
false
```

`false` — no overflow reported — for the *exact same* `x = 7` that the
first unit already proved genuinely does overflow. Avoiding undefined
behavior's own trap was necessary here, but not sufficient: `>=` is
completely well-defined, and the check still gives the wrong answer,
because it was built on a mistaken belief about where the real boundary
actually is. Lesson 188's own derivation — the real range is `-8` to `7`,
not `-8` to `8` — is exactly the fact this check depends on getting right.

### CS Lens

Choosing not to fully specify hardware-dependent edge-case behavior, in
exchange for portability and optimization freedom, is a real, deliberate,
documented language design decision.

```
Also recognized in: the real, honest reason C and C++ chose undefined
behavior over pinning down exact hardware quirks — not every real
architecture wraps signed overflow the same way, and some genuinely trap
on it instead, so promising "always wraps" would have made the language
non-portable to hardware that behaves differently; and the general
software-engineering principle of checking *before* a dangerous
operation rather than after it's already happened, recurring far outside
overflow specifically — bounds-checking an array index before indexing,
not catching the failure afterward
```

### SE Lens

Rewriting overflow-prone code in a language that never has this problem
in the first place is a real, available option — but for enormous
amounts of real, existing, performance-critical C and C++ code, it isn't
practical to simply switch away from. The real, current, still-standard
answer instead is exactly what this lesson's closing section takes
seriously: accept undefined behavior's performance benefits, write checks
the way `safe-overflow-check` does — before the operation, using only
well-defined comparisons — and lean on tooling (the poisoning-based
sanitizers named in the second unit) to catch violations during testing.
This is a real, accepted, deliberate tradeoff, not a stopgap: the
performance gained by letting a compiler assume the common case is
genuine, not merely theoretical, and it's why this remains how most
real, performance-sensitive systems code is actually written today.

---

## Connect the Pieces

Follow `x = 7` through every idea this lesson built. `hardware-overflow-
check`, running Lesson 188's own genuine wraparound arithmetic honestly,
correctly finds that `7 + 1` overflows — the wrapped result decodes to
`-8`, less than `7`. `optimized-overflow-check`, a real, logically valid
consequence of treating that overflow as impossible, reports `false` for
the identical input — a compiler entitled to reach that exact conclusion
by trusting the language's own promise that the case it's checking for
cannot occur. `safe-overflow-check`, built to never perform the
dangerous addition at all, correctly reports the same overflow Lesson
188's honest arithmetic found — but only once it's given the real
maximum, `7`, that Lesson 188 itself derived; handed the wrong maximum,
`8`, it fails too, for a completely different, much more ordinary reason.
Every one of these results traces back to the same fact: `x = 7` is
genuinely at the edge of what four bits of two's complement can hold, and
every one of this lesson's three functions is a different way of either
respecting that edge or getting fooled by it.

## What Breaks Without This

The second unit's own trace already showed the mechanism directly: reuse
it, this time with the wrong maximum baked in as if it were correct.
`safe-overflow-check 7 8` reports `false` — no overflow — for a value
that genuinely does overflow. Trace *why*, one more time, all the way
back to its source: `8` was likely chosen by someone reasoning "four
bits, so the maximum must be `2^4`" — the same doubling relationship
Lesson 184's own `bits-needed` used, but applied to the wrong question.
Four bits give `16` total distinguishable patterns, yes — but half of
them, in two's complement, represent negative numbers, and the largest
*positive* one is `7`, not `15` and not `8` — exactly Lesson 188's own
asymmetric-range result, `-8` to `7`, derived carefully and for real
reasons back in that lesson. `safe-overflow-check`'s own logic is
completely sound; `>=` never lies. The failure lives entirely in a wrong
number handed to a correct function — proof that avoiding undefined
behavior's own trap, the entire subject of this lesson, still leaves a
second, completely ordinary way to be wrong: not understanding the real
limits of the representation being checked against in the first place.

## Exercises

1. Trace `hardware-overflow-check` on `x = 3`, `width = 4` — a value well
   within four-bit two's complement's range — and confirm it correctly
   reports no overflow.
2. Trace `safe-overflow-check` on `x = 6`, using both the correct maximum
   (`7`) and the wrong one (`8`), and state whether the wrong maximum
   produces an incorrect answer for this particular `x` — explain, in one
   sentence, why the wrong maximum doesn't cause a visible problem for
   *every* input, only some.
3. Sketch, in prose, what a `safe-overflow-check` would need to look like
   for *unsigned* addition instead of signed — using Lesson 187's own
   `max-unsigned`, what comparison would correctly detect that `x + 1`
   is about to exceed an unsigned representation's real limit?

## Definition of Done

- [ ] `hardware-add-one` and `hardware-overflow-check` are written and
      hand-traced for `x = 7`, `width = 4`, matching this lesson's `-8`
      and `true` results.
- [ ] `optimized-overflow-check` is understood well enough to explain,
      without notes, why it is a *logically valid* conclusion given its
      premise, not simply a mistake.
- [ ] `safe-overflow-check` is written and hand-traced for both the
      correct maximum (`7`) and the wrong one (`8`) against `x = 7`.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why four bits' real positive maximum is
      `7`, not `8` or `15`.
- [ ] Commit with a message explaining *why* checking before a dangerous
      operation is safe from undefined behavior in a way checking after
      it is not, not just *what* functions were added.
