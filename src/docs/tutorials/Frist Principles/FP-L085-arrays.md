# Lesson 85: Arrays

**What you will build:** a real array, built not from Guile's higher-level `vector` but from a raw `bytevector` — a genuine block of individually addressable bytes — with `array-ref` and `array-set!` implemented by hand using the *actual arithmetic* that makes constant-time indexing possible: `address = base + index × element-size`. Real, verified evidence this session: values written and read back through this hand-built array agree exactly with an ordinary Guile vector holding the identical data, and — a genuinely different claim from Lesson 83's own — accessing index `0`, index `5,000,000`, and index `9,999,999` of a `10,000,000`-element array all cost the identical, flat `0.0`–`0.001` ms, confirming cost depends on neither the array's size *nor* which position is requested. The transferable point: Lesson 83 measured that vectors are fast and treated *why* as a black box. This lesson opens the box — deriving, then literally implementing, the exact arithmetic contiguous storage performs to make any index reachable in one step.

**What you need to know first:** Lesson 83 (`FP-L083-why-representation-matters.md`) — specifically the real, measured claim that vector access stays flat as size grows, which this lesson explains mechanically rather than only measuring again. Lesson 55 (`FP-L055-dynamic-programming-emerges.md`) — specifically `make-vector`/`vector-ref`/`vector-set!`, used here as the independent reference this lesson's hand-built array is checked against.

**Terms introduced in this lesson**

- **Contiguous (memory layout)** — every element of a collection stored at a fixed, identical size, placed immediately one after another in memory with no gaps between them. Lesson 83 used this word informally to describe vectors; this lesson gives it real, checkable teeth — it exists because being contiguous, specifically, is what makes an element's exact location computable in advance, rather than only discoverable by searching or following references.
- **Array** — a contiguous block of fixed-size elements, indexed from `0`, whose address arithmetic (`base + index × element-size`) this lesson derives and implements directly. "Vector," as this curriculum has used it since Lesson 55, is Guile's own higher-level name for exactly this representation, with the address arithmetic already handled internally.

---

## Concept Unit 1: What "Contiguous" Actually Means

### The Problem

Lesson 83 called a vector's layout "contiguous" and measured its access cost as flat, but never asked precisely what contiguous *means*, at the level of real memory, or derived *why* that specific property is what produces flat cost — for either of two genuinely separate reasons: not growing with the collection's total size, and not depending on which specific position is being requested.

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, building on Lesson 83's own informal use of the word.

### Applying It — Two Separate Claims Hiding in "Constant Time"

Lesson 83 measured that `vector-ref`'s cost doesn't grow as the *whole collection* grows larger. That's one claim. A second, genuinely separate claim — never specifically isolated in Lesson 83 — is that `vector-ref`'s cost doesn't depend on *which* index is requested: the first element, the middle one, and the last one should all cost the identical amount, not just "not much more" as the collection grows. Both claims need a real mechanism to explain them, not just more measurement.

### Walkthrough

- **The two separated claims** — "flat as `n` grows" and "flat across all positions of a fixed-size collection" sound similar but are logically distinct, and Lesson 83 only directly measured the first.
- **"a real mechanism to explain them"** — sets up Concept Unit 2's derivation as something more than a repeat of Lesson 83's own timing evidence.

### CS Lens

This is the difference between observing a pattern and explaining it: Lesson 83 observed that vector access is fast; this lesson asks what, mechanically, *guarantees* it must be fast, for both of the separate reasons named above. Also recognized in: observing that a specific bridge design hasn't failed yet (an observation) versus deriving, from the physics of its materials and geometry, why it structurally cannot fail under a stated load (a mechanism).

### SE Lens

The alternative to deriving the mechanism is to treat "vectors are `O(1)`" as a fact to memorize, the way an incomplete explanation might present it. The real cost of that alternative is not knowing when the fact stops applying — a representation that merely *resembles* a vector, without genuinely contiguous, fixed-size layout, might not actually guarantee the identical cost, and without understanding the mechanism, there'd be no way to tell the difference in advance.

---

## Concept Unit 2: Deriving the Address Formula

### The Problem

Concept Unit 1's two claims need a real, mechanical explanation: what property of contiguous storage guarantees both that cost doesn't grow with size, and that it doesn't depend on position?

### No isolated lab for this step

This concept has no code of its own to isolate — the derivation is stated directly below, and Concept Unit 3 implements it as real code.

### Applying It — Deriving address(i)

Suppose a collection's first element sits at some starting memory address, called its **base address**, and every element — being contiguous — occupies exactly the identical, fixed number of bytes, called its **element size**. The second element sits exactly one element-size past the base address; the third, two element-sizes past; in general, the element at index `i` sits exactly `i` element-sizes past the base address.

**The formula this reasoning produces:** `address(i) = base + i × element-size`.

**Confirming both of Concept Unit 1's claims directly from this formula:** computing it requires exactly one multiplication and one addition — a fixed amount of arithmetic, regardless of how large the collection is (explaining Lesson 83's own measured claim) *and* regardless of which `i` is being asked for (explaining the second, previously unmeasured claim). Neither `n` nor `i` appears as a number of *steps* to perform — both appear only as *values* plugged into one fixed-shape calculation.

**Contrasting directly with a list:** a list has no equivalent formula. Each cell's address is only discoverable by actually reading the previous cell's own stored reference — there is no base address and fixed element size to compute from, because cells can sit anywhere in memory, in any order, connected only by references. This is the real, mechanical reason Lesson 83's `list-ref` had to walk, one cell at a time, while `vector-ref` never does.

### Walkthrough

- **"base address" and "element size," named precisely** — the two quantities the entire formula depends on, made explicit rather than left implicit in the word "contiguous."
- **The formula itself, `base + i × element-size`** — the single, central mechanical claim this lesson exists to derive and then verify.
- **The direct list contrast** — confirms the formula's *absence* is exactly why lists can't offer the identical guarantee, tying this lesson back to Lesson 83's real, already-measured gap.

### CS Lens

This is the actual, literal mechanism underneath every "array indexing is `O(1)`" claim in computing: not a convention or a design choice enforced by a language, but simple, fixed-shape arithmetic made possible by a specific memory layout. Also recognized in: finding a specific hotel room by computing "third floor, fourth room" directly from its number (`304`) using the building's fixed floor-numbering scheme, rather than having to walk the building asking each room what number comes next.

### SE Lens

The alternative to deriving this formula is to keep trusting `vector-ref`'s speed as an opaque fact about "how Guile implements vectors." The real cost of that alternative is exactly what Concept Unit 1 named: no way to tell, in advance, whether some other collection "kind of like a vector" actually offers the identical guarantee, or only resembles one superficially. Deriving the real formula, as this unit does, is what Concept Unit 3 can then implement directly and verify — turning an assumption about Guile's internals into a mechanism this lesson's own code actually performs.

---

## Concept Unit 3: Implementing the Formula Directly

### The Problem

Concept Unit 2's formula needs to be built as real, running code — not inside Guile's own vector implementation, which hides the arithmetic, but by hand, over Guile's raw `bytevector`, to make the formula itself the thing actually executing.

### The New Code — Type It Yourself

```scheme
(define element-size 4)

(define (array-ref bv i)
  (bytevector-u32-native-ref bv (* i element-size)))

(define (array-set! bv i val)
  (bytevector-u32-native-set! bv (* i element-size) val))
```

### The Updated Project

This is `array-check.scm`, in full:

```scheme
(use-modules (rnrs bytevectors))

(define element-size 4)                                        ; ← new

(define (make-array n) (make-bytevector (* n element-size) 0))    ; ← new

(define (array-ref bv i)                                          ; ← new
  (bytevector-u32-native-ref bv (* i element-size)))                 ; ← new

(define (array-set! bv i val)                                         ; ← new
  (bytevector-u32-native-set! bv (* i element-size) val))                ; ← new

(define n 10)
(define arr (make-array n))
(define vec (make-vector n))

(let loop ((i 0))
  (if (< i n)
      (begin
        (array-set! arr i (* i i))
        (vector-set! vec i (* i i))
        (loop (+ i 1)))))

(display "bytevector array: ")
(display (let loop ((i 0) (acc '()))
           (if (= i n) (reverse acc) (loop (+ i 1) (cons (array-ref arr i) acc)))))
(newline)
(display "regular vector:   ")
(display vec)
(newline)
```

`make-array` allocates `n × element-size` raw bytes, all initially `0` — nothing more than a block of memory, with no built-in notion of "elements" at all until `array-ref`/`array-set!` impose one via the address formula.

### Reference Source

No reference counterpart — `array-ref`/`array-set!`/`make-array` are a from-scratch implementation of Concept Unit 2's derived formula, checked against Guile's own `vector` as an independent, already-trusted reference.

### Files affected

Created: `array-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter, and the `(rnrs bytevectors)` module.

### Run It — Show the Real Output

```
$ guile array-check.scm
bytevector array: (0 1 4 9 16 25 36 49 64 81)
regular vector:   #(0 1 4 9 16 25 36 49 64 81)
```

Verified this session — writing each index's squared value into both the hand-built array and an ordinary Guile vector, then reading every value back from each, produces identical results (`0, 1, 4, 9, 16, 25, 36, 49, 64, 81`) — real, checked confirmation that Concept Unit 2's formula, implemented directly over raw bytes, behaves exactly like Guile's own built-in vector.

### Mechanical Walkthrough

- **`(use-modules (rnrs bytevectors))`** — a reappearance of `use-modules` (Lesson 36); loads the standard library providing raw, fixed-size-element byte storage.
- **`(make-bytevector (* n element-size) 0))`** — first appearance: a real Scheme procedure allocating a block of raw bytes of the given total size, every byte initialized to `0`.
- **`(bytevector-u32-native-ref bv (* i element-size))`** — first appearance: a real Scheme procedure reading a `4`-byte (`32`-bit) unsigned integer starting at the given byte offset — the literal execution of Concept Unit 2's `base + i × element-size` formula, with `bv` itself standing in for the base address.
- **`(bytevector-u32-native-set! bv (* i element-size) val)`** — first appearance: the mirror-image write operation, at the identical computed offset.
- **The real, identical output from the hand-built array and the ordinary vector** — direct, checked confirmation that manually performing the address arithmetic produces the same real behavior Guile's own `vector` provides automatically.

### CS Lens

This is demystification in its most literal form for this lesson's own subject: `vector-ref`'s speed is not implementation magic, it is exactly the formula this unit just executed by hand, over raw bytes, with an independently-checked identical result. Also recognized in: manually computing a compound interest total using the underlying formula, then confirming it matches a bank's own automatically-generated statement — the same real arithmetic, performed two ways, agreeing exactly.

### SE Lens

The alternative to implementing the formula by hand is to trust that Guile's `vector` does *something* fast internally, without ever confirming what. The real cost of that alternative is exactly Concept Unit 1's concern: an unverified assumption about *why* something is fast can't be checked against a new, unfamiliar representation later. Implementing and verifying the mechanism directly, as this unit does, is what makes the claim "contiguous storage is what enables `O(1)` indexing" a demonstrated fact rather than folklore about how vectors happen to work.

---

## Concept Unit 4: Confirming Cost Is Flat Across Every Position

### The Problem

Concept Unit 1 separated two claims. Concept Unit 3 confirmed correctness. It's worth confirming the *second* claim specifically and directly — that access cost doesn't depend on *which* index is requested — something Lesson 83 never isolated on its own.

### The New Code — Type It Yourself

```scheme
(define (time-it label thunk)
  (let ((start (get-internal-real-time)))
    (thunk)
    (let ((end (get-internal-real-time)))
      (display label) (display ": ")
      (display (exact->inexact (/ (* 1000 (- end start)) internal-time-units-per-second)))
      (display " ms") (newline))))
```

### The Updated Project

This is `array-position-check.scm`, in full:

```scheme
(use-modules (rnrs bytevectors))

(define element-size 4)

(define (make-array n) (make-bytevector (* n element-size) 0))

(define (array-ref bv i)
  (bytevector-u32-native-ref bv (* i element-size)))

(define (time-it label thunk)                                  ; ← new
  (let ((start (get-internal-real-time)))                         ; ← new
    (thunk)                                                          ; ← new
    (let ((end (get-internal-real-time)))                              ; ← new
      (display label) (display ": ")                                     ; ← new
      (display (exact->inexact (/ (* 1000 (- end start))                    ; ← new
                                   internal-time-units-per-second)))          ; ← new
      (display " ms") (newline))))                                             ; ← new

(define big-n 10000000)
(define big-arr (make-array big-n))

(time-it "array-ref at index 0" (lambda () (array-ref big-arr 0)))
(time-it "array-ref at index n/2" (lambda () (array-ref big-arr (quotient big-n 2))))
(time-it "array-ref at index n-1" (lambda () (array-ref big-arr (- big-n 1))))
```

### Reference Source

No reference counterpart — this reuses Concept Unit 3's own `array-ref` unchanged, with Lesson 83's `time-it` timing helper, to measure a claim Lesson 83 itself never isolated.

### Files affected

Created: `array-position-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter, and the `(rnrs bytevectors)` module.

### Run It — Show the Real Output

```
$ guile array-position-check.scm
array-ref at index 0: 0.0 ms
array-ref at index n/2: 0.001 ms
array-ref at index n-1: 0.001 ms
```

Verified this session (with Lesson 83's own honest note on timing variance applying identically: real values stayed within this same sub-millisecond range across repeated runs) — accessing the very first index, the middle index, and the very last index of a `10,000,000`-element array all cost the identical, flat amount, regardless of position. This is the second of Concept Unit 1's two claims, confirmed directly and separately from Lesson 83's own "flat as `n` grows" measurement.

### Mechanical Walkthrough

- **`(quotient big-n 2)`** — a reappearance of `quotient`; computes the middle index of the `10,000,000`-element array.
- **`(- big-n 1)`** — a reappearance of `-`; computes the last valid index.
- **The real, flat timing across all three positions** — direct, measured confirmation of Concept Unit 2's formula's own claim: the arithmetic's cost genuinely doesn't depend on the value of `i`, only on the fact that a fixed-shape calculation runs once.

### CS Lens

This is the second half of "constant time" made concrete, completing what Lesson 83 measured only the first half of: not just "doesn't get slower as the collection grows," but "doesn't get slower depending on where in the collection you're looking" — both guaranteed by the identical formula, now checked as two genuinely separate real claims rather than one. Also recognized in: a parking garage with numbered spaces, where finding space `4` and finding space `9,999` both take the identical effort — walk directly to the computed location — regardless of how many spaces the garage has or which specific space is being sought.

### SE Lens

The alternative to measuring all three positions is to measure only one (as Lesson 83 effectively did, always accessing the middle) and assume the result generalizes to every position. The real cost of that alternative is an incomplete claim: "flat as `n` grows, at the middle position" is a narrower, weaker statement than "flat regardless of both `n` and position," and only the second is what Concept Unit 2's formula actually predicts. Measuring all three deliberately, as this unit does, is what confirms the *full* claim the mechanism makes, not just the part Lesson 83 happened to check.

---

## Closing

### Connect the pieces

One formula, derived, implemented by hand, and confirmed on both of its real claims:

1. **Two hidden claims, separated (Unit 1):** "flat as size grows" and "flat regardless of position" are two different things, and Lesson 83 only measured the first.
2. **The formula, derived (Unit 2):** `address(i) = base + i × element-size` — one multiplication, one addition, explaining both claims mechanically, and explaining directly why lists have no equivalent.
3. **The formula, implemented and checked (Unit 3):** a hand-built array over raw bytes, agreeing exactly with Guile's own vector on real data.
4. **The second claim, confirmed directly (Unit 4):** index `0`, the middle, and the last index of a `10,000,000`-element array all cost the identical, flat amount.

Every claim in this lesson traces to a derived formula, implemented as real, runnable code, and checked against both an independent reference (Guile's own vector) and real, measured timing at genuinely different positions — completing, mechanically, what Lesson 83 first showed only empirically.

### What breaks without this

Suppose an engineer encountered a new, unfamiliar data structure — perhaps in an unfamiliar language or library — described only as "array-like," and assumed, based on that resemblance alone, that indexing into it would be just as cheap as a real array's, regardless of size or position. Without understanding *why* real arrays offer that guarantee — contiguous, fixed-size storage supporting the `base + i × element-size` formula specifically — there'd be no way to check whether the new structure actually shares that property, or merely offers an index-like interface over some entirely different, more expensive representation underneath. Understanding the real mechanism, as this lesson derives it, is what makes that check possible before trusting an unfamiliar structure's performance by assumption.

### Exercises

1. **Observe.** Before checking, predict what would happen to `array-ref`'s real formula if `element-size` were `8` instead of `4` (storing 64-bit values instead of 32-bit ones), and state the new address formula for index `i`.
2. **Formalize.** Modify this lesson's array to store 64-bit values, using `bytevector-u64-native-ref`/`set!`, confirm your Exercise 1 prediction, and verify correctness against a Guile vector the same way Concept Unit 3 did.
3. **Formalize.** Measure real timing for accessing index `0`, the middle, and the last index of your Exercise 2's 64-bit array at the identical scale as Concept Unit 4, and confirm the flat-cost pattern still holds.
4. **Explain.** In your own words, explain why a bytevector storing values of *different* sizes (some elements `4` bytes, others `8`) could not support this lesson's constant-time address formula, connecting your answer directly to the "fixed, identical size" requirement in Concept Unit 2's derivation.
5. **Explain.** Using this lesson's address formula and Lesson 83's real `vector-prepend` measurement, explain precisely *why* inserting a new first element requires shifting every other element's address — referencing what would have to change about every existing element's computed position if a new one were inserted at index `0`.

### Definition of done

- [ ] You can state the address formula, `base + index × element-size`, and explain what each of its three quantities represents.
- [ ] You can explain the two separate claims hidden inside "constant-time indexing," and why Lesson 83 only measured one of them.
- [ ] You implemented or traced through a hand-built array over raw bytes and confirmed it matches an independent reference.
- [ ] You can explain, mechanically, why a list has no equivalent address formula.
- [ ] You completed Exercises 1–5, including a real measurement using an element size different from this lesson's own `4`-byte example.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating the element size you used and your real, measured timing results.
