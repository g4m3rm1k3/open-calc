# Lesson 84: Abstract Data Types

**What you will build:** a single, three-operation `Sequence` interface — `seq-first`, `seq-rest`, `seq-empty?` — implemented *twice*, once directly over Lesson 12's lists and once over a genuinely different representation, a vector paired with a starting offset. Real, verified evidence this session: a generic `seq-sum` procedure, written using only the three interface operations and never touching `car`, `cdr`, or `vector-ref` directly, produces the identical correct result (`31`) against *both* implementations without being changed at all. A real, non-obvious discovery falls out along the way: the vector-backed `seq-rest` stays flat, `0.0`–`0.001` ms regardless of size, all the way to `1,000,000` — sidestepping Lesson 83's own `vector-prepend` cost entirely, because moving an offset forward costs nothing like rebuilding a vector does. The transferable point: Lesson 83 showed representation determines cost. This lesson shows that *code written against behavior alone*, without depending on any one representation, doesn't have to care which representation it's running on — precisely the abstraction boundary that makes Lesson 83's trade-off a deliberate choice instead of something baked into every piece of code that touches the data.

**What you need to know first:** Lesson 83 (`FP-L083-why-representation-matters.md`) — specifically the real, measured list-versus-vector trade-offs this lesson's two implementations deliberately reuse. Lesson 9 (`FP-L009-preconditions-and-postconditions.md`) — specifically *contract*, reused directly to state what each operation below guarantees.

**Terms introduced in this lesson**

- **Abstract Data Type (ADT)** — a set of named operations, each with a stated contract (Lesson 9), described entirely in terms of behavior — what an operation needs, what it guarantees — with no reference to how any operation is actually implemented underneath. It exists so that genuinely different representations, like Lesson 83's lists and vectors, can be swapped for each other freely, as long as each one satisfies the identical set of contracts.

---

## Concept Unit 1: What Makes Two Operations "the Same"?

### The Problem

Lesson 83 measured "get the middle element" and "add to the front" as if they were unambiguous, shared operations between lists and vectors — but a list and a vector share no code at all; `list-ref` and `vector-ref` are two completely separate procedures. It's worth asking precisely what justifies calling them "the same operation," since without a precise answer, "the same operation, two representations" is just a loose figure of speech.

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, using Lesson 83's own comparison as the thing needing justification.

### Applying It — What "the Same" Would Need to Mean

Two procedures genuinely implement "the same operation" only if they can be swapped for each other and every caller gets the identical result — the same output for the same logical input, regardless of which one actually ran. That's a real, checkable claim, not a vague resemblance: it requires stating, precisely, what result any correct implementation must produce, then confirming two different pieces of code both produce it.

### Walkthrough

- **The direct challenge to Lesson 83's own framing** — `list-ref` and `vector-ref` were compared as if interchangeable, without ever stating precisely what would make that fair.
- **"can be swapped for each other and every caller gets the identical result"** — the real, checkable bar Concept Unit 2's formal definition needs to meet.

### CS Lens

This is the precise question every abstraction boundary has to answer: not "do these two things look similar," but "can code written against one be handed the other without noticing the difference." Also recognized in: two different electrical outlets from two different manufacturers both being safely usable by the identical plug, because both were built to satisfy the identical published standard, not because one happened to resemble the other.

### SE Lens

The alternative to answering this precisely is to keep treating "list and vector both hold sequences" as good enough justification for comparing their costs directly, the way Lesson 83 did informally. The real cost of that alternative is a claim resting on intuition rather than a checkable guarantee — exactly the standing concern since Lesson 22. Answering it precisely, as this unit sets up, is what Concept Unit 2 and 3 turn into a real, verified guarantee instead of an assumption.

---

## Concept Unit 2: Defining an Abstract Data Type

### The Problem

Concept Unit 1's bar — swappable, with identical results — needs a precise structure: a way to state a set of operations and their guarantees without smuggling in any assumption about representation.

### No isolated lab for this step

This concept has no code of its own to isolate — the definition is stated directly below, and Concept Unit 3 builds two real implementations against it.

### Applying It — A Minimal Sequence ADT

**Three operations, each stated as a contract (Lesson 9), with no mention of `cons` cells, vectors, or any other representation:**

- **`seq-first(s)`** — *requires:* `s` is non-empty. *guarantees:* returns the first value in `s`.
- **`seq-rest(s)`** — *requires:* `s` is non-empty. *guarantees:* returns a sequence containing every value in `s` except the first, in the identical order.
- **`seq-empty?(s)`** — *requires:* nothing. *guarantees:* returns true exactly when `s` contains no values at all.

**Naming what makes this an ADT, precisely:** nothing above says whether `s` is a list, a vector, or anything else — the three contracts are the *entire* specification. Any representation, and any set of three procedures satisfying these exact three contracts, counts as a valid implementation of this `Sequence` ADT, by definition.

### Walkthrough

- **Each operation stated as a requires/guarantees contract** — a direct, deliberate reuse of Lesson 9's exact vocabulary, applied here to a whole interface rather than one function.
- **"nothing above says whether `s` is a list, a vector, or anything else"** — the entire point of the definition: representation silence is not an omission, it's the design.

### CS Lens

This is the standard shape of an abstract data type in every real programming context: a named contract for each operation, deliberately silent about implementation, so that "does code X work with representation Y" becomes a checkable question — does Y satisfy every stated contract — rather than a matter of inspecting X's internals. Also recognized in: a standardized shipping container's exact external dimensions and attachment points, specified without any requirement about what's packed inside or how, so that any ship, train, or crane built to the standard can handle any container built to the identical standard.

### SE Lens

The alternative to writing contracts this precisely is to describe an interface loosely ("something you can get the first element of, and the rest of") and rely on shared understanding to fill the gaps. The real cost of that alternative is exactly what a loosely-specified interface risks: two different "implementations" that both seem reasonable but disagree on an edge case (what `seq-first` should do on an empty sequence, for instance) neither one ever stated explicitly. Writing the contract precisely, as this unit does, is what Concept Unit 3's two implementations can be checked against unambiguously.

---

## Concept Unit 3: Two Implementations, One Interface

### The Problem

Concept Unit 2's contracts need two real, genuinely different implementations — reusing Lesson 83's own list and vector representations — checked directly against each other for identical behavior.

### The New Code — Type It Yourself

```scheme
(define (make-seq-vec vec) (cons vec 0))
(define (seq-first-vec s) (vector-ref (car s) (cdr s)))
(define (seq-rest-vec s) (cons (car s) (+ (cdr s) 1)))
(define (seq-empty-vec? s) (= (cdr s) (vector-length (car s))))
```

### The Updated Project

This is `adt-check.scm`, in full:

```scheme
(define (seq-first-list s) (car s))
(define (seq-rest-list s) (cdr s))
(define (seq-empty-list? s) (null? s))
(define (make-seq-list lst) lst)

(define (make-seq-vec vec) (cons vec 0))                        ; ← new
(define (seq-first-vec s) (vector-ref (car s) (cdr s)))            ; ← new
(define (seq-rest-vec s) (cons (car s) (+ (cdr s) 1)))               ; ← new
(define (seq-empty-vec? s) (= (cdr s) (vector-length (car s))))        ; ← new

(define (drain first-proc rest-proc empty-proc s)
  (if (empty-proc s)
      '()
      (cons (first-proc s) (drain first-proc rest-proc empty-proc (rest-proc s)))))

(define data (list 3 1 4 1 5 9 2 6))

(display (drain seq-first-list seq-rest-list seq-empty-list? (make-seq-list data)))
(newline)
(display (drain seq-first-vec seq-rest-vec seq-empty-vec? (make-seq-vec (list->vector data))))
(newline)
```

`make-seq-list`, `seq-first-list`, `seq-rest-list`, and `seq-empty-list?` are trivial wrappers over `car`, `cdr`, and `null?` (Lesson 12) — a list already *is* a valid `Sequence` implementation, with no adaptation needed. `make-seq-vec` pairs a vector with a starting offset (`0`), rather than copying anything; `seq-rest-vec` returns a *new pair* holding the identical, unchanged vector and an offset one larger — not a new vector at all, deliberately avoiding Lesson 83's `vector-prepend` cost.

### Reference Source

Lesson 83's `list` and `vector` representations (`FP-L083-why-representation-matters.md`), reused directly; `seq-first-vec`/`seq-rest-vec`/`seq-empty-vec?`'s offset-pairing technique is new, built specifically to implement Concept Unit 2's contracts without paying Lesson 83's rebuild cost.

### Files affected

Created: `adt-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile adt-check.scm
(3 1 4 1 5 9 2 6)
(3 1 4 1 5 9 2 6)
```

Verified this session — `drain`, walking each representation using only its own three operations until empty, produces the *identical* sequence of values from both the list-backed and the vector-backed implementation, confirming both satisfy Concept Unit 2's contracts identically, on real data.

### Mechanical Walkthrough

- **`(cons vec 0)`** — a reappearance of `cons`; pairs the underlying vector with a starting offset of `0`, the vector-backed sequence's entire real representation.
- **`(vector-ref (car s) (cdr s))`** — a reappearance of `vector-ref`, `car`, `cdr`; reads the element at the current offset directly, satisfying `seq-first`'s contract.
- **`(cons (car s) (+ (cdr s) 1))`** — a reappearance of `cons`, `+`; builds a *new* pair holding the *same* vector and one larger offset — satisfying `seq-rest`'s contract without touching the underlying vector at all.
- **`(= (cdr s) (vector-length (car s)))`** — a reappearance of `=`, `vector-length`; true exactly when the offset has walked past the vector's last real position, satisfying `seq-empty?`'s contract.
- **The real, identical output from both representations** — direct, checked confirmation that both implementations satisfy the identical contracts, not merely that both "seem to work."

### CS Lens

This is an abstract data type proven, not just defined: two representations sharing no code and no internal structure, both verified to produce identical behavior against the identical contracts — exactly Concept Unit 1's bar, now actually met and checked. Also recognized in: two different manufacturers' batteries, built with completely different internal chemistry, both verified to deliver the identical voltage and current a device's contract requires, making either one usable interchangeably.

### SE Lens

The alternative to building a genuinely different second representation is to implement the ADT twice using only minor variations on the same underlying structure, which would prove far less: two nearly-identical implementations agreeing is unsurprising, while a list and an offset-into-a-vector agreeing, despite sharing no code and no memory layout, is real, meaningful evidence the abstraction boundary — the three contracts alone — is sufficient to pin down correct behavior.

---

## Concept Unit 4: Code That Doesn't Know Which Representation It's Using

### The Problem

Concept Unit 3 showed both implementations behave identically when *this lesson's own* `drain` procedure walks them. It's worth checking something stronger: can a single, genuinely generic procedure be written once, using only the three ADT operations, and handed *either* representation without being changed at all?

### The New Code — Type It Yourself

```scheme
(define (seq-sum first rest empty? s)
  (if (empty? s)
      0
      (+ (first s) (seq-sum first rest empty? (rest s)))))
```

### The Updated Project

This is `adt-generic.scm`, in full:

```scheme
(define (seq-first-list s) (car s))
(define (seq-rest-list s) (cdr s))
(define (seq-empty-list? s) (null? s))
(define (make-seq-list lst) lst)

(define (make-seq-vec vec) (cons vec 0))
(define (seq-first-vec s) (vector-ref (car s) (cdr s)))
(define (seq-rest-vec s) (cons (car s) (+ (cdr s) 1)))
(define (seq-empty-vec? s) (= (cdr s) (vector-length (car s))))

(define (seq-sum first rest empty? s)                          ; ← new
  (if (empty? s)                                                  ; ← new
      0                                                             ; ← new
      (+ (first s) (seq-sum first rest empty? (rest s)))))            ; ← new

(define data (list 3 1 4 1 5 9 2 6))

(display (seq-sum seq-first-list seq-rest-list seq-empty-list? (make-seq-list data)))
(newline)
(display (seq-sum seq-first-vec seq-rest-vec seq-empty-vec? (make-seq-vec (list->vector data))))
(newline)

;; the bonus timing check, reusing Lesson 83's own time-it helper unchanged
(define (time-it label thunk)
  (let ((start (get-internal-real-time)))
    (thunk)
    (let ((end (get-internal-real-time)))
      (display label)
      (display ": ")
      (display (exact->inexact (/ (* 1000 (- end start)) internal-time-units-per-second)))
      (display " ms")
      (newline))))

(for-each
 (lambda (n)
   (let* ((big (iota n))
          (s (make-seq-vec (list->vector big))))
     (time-it (string-append "seq-rest-vec (windowed), n=" (number->string n))
              (lambda () (seq-rest-vec s)))))
 (list 1000 100000 1000000))
```

`seq-sum` is written *once*, taking the three ADT operations themselves as arguments — a reappearance of passing a procedure as a value (Lesson 34's `map`), applied here to a whole trio of operations rather than one. Its own body never mentions `car`, `cdr`, `vector-ref`, or any other representation-specific detail. `time-it` is Lesson 83's own timing helper, reused unchanged, for the bonus measurement below.

### Reference Source

No reference counterpart — `seq-sum` is a from-scratch, genuinely generic procedure, written specifically to demonstrate representation-independence directly.

### Files affected

Created: `adt-generic.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile adt-generic.scm
31
31
```

Verified this session — the identical `seq-sum` procedure, unmodified, produces `31` (`3 + 1 + 4 + 1 + 5 + 9 + 2 + 6`) against both the list-backed and the vector-backed sequence — real, checked confirmation that code written against only the three contracts genuinely doesn't need to know which representation it's running on.

**A real, non-obvious bonus discovery, connecting back to Lesson 83:** measuring `seq-rest-vec` directly at increasing scale —

```
seq-rest-vec (windowed), n=1000: 0.001 ms
seq-rest-vec (windowed), n=100000: 0.0 ms
seq-rest-vec (windowed), n=1000000: 0.001 ms
```

— stays flat regardless of size, all the way to `1,000,000` (Lesson 83's own honest note on timing variance applies identically here: rerunning shows values in the same sub-millisecond range, not bit-for-bit identical, but never climbing with `n` the way `vector-prepend` did). This is *not* Lesson 83's `vector-prepend`, which rebuilt an entire new vector; `seq-rest-vec` only ever builds one new two-element pair holding the *same* vector and a larger offset. Choosing the representation carefully — a vector paired with a window into it, rather than "the whole vector, rebuilt" — avoided the exact cost Lesson 83 measured, while still satisfying the identical `Sequence` contract.

### Mechanical Walkthrough

- **`(define (seq-sum first rest empty? s) ...)`** — a reappearance of `define`; the parameters `first`, `rest`, `empty?` are themselves procedures, passed in by the caller, not fixed at definition time.
- **`(first s)` / `(rest s)` / `(empty? s)`** — a reappearance of applying a parameter as though it were an ordinary procedure name (Lesson 34); calls whichever concrete operation was actually passed in, without `seq-sum` itself ever knowing which one.
- **The real, identical `31` from both calls** — direct, checked confirmation of genuine representation-independence, not merely similar-looking code.
- **The real, flat `seq-rest-vec` timing at every scale** — direct, measured evidence that a cleverer representation choice (windowing, not rebuilding) can avoid a cost Lesson 83 showed was otherwise unavoidable for vectors.

### CS Lens

This is the entire practical payoff of an abstract data type: `seq-sum` was written once, reasoned about once, and trusted once — and it works correctly against any representation satisfying the three contracts, present or future, without ever being touched again. Also recognized in: a payment-processing function written once against a "Payment Method" interface, working correctly with credit cards, bank transfers, or a payment method invented after the function was written, as long as each new one satisfies the identical interface.

### SE Lens

The alternative to writing `seq-sum` generically is to write one version for lists and a separate, nearly-identical version for vectors, the way code without a shared abstraction often ends up duplicated. The real cost of that alternative is exactly the maintenance burden Lesson 51 warned about for `all-subsets`'s duplicated recursive call, generalized: two copies of the identical logic, differing only in which low-level operations they call, that must be kept in sync by hand forever. Writing one generic version against the ADT, as this unit does, means a bug fix or improvement to `seq-sum` automatically applies to every current and future representation at once.

---

## Closing

### Connect the pieces

One interface, two representations, one generic algorithm, and a real bonus discovery:

1. **The precise bar, named (Unit 1):** two implementations count as "the same operation" only if they're swappable with identical results — a checkable claim, not a resemblance.
2. **The contract, defined (Unit 2):** three operations, each a requires/guarantees pair, silent about representation entirely.
3. **Two real implementations, checked identical (Unit 3):** a list and a vector-plus-offset, sharing no code, producing identical output when walked by the identical procedure.
4. **Genuine representation-independence, demonstrated (Unit 4):** `seq-sum`, written once, correct against both — plus a real, measured discovery that a windowed vector avoids Lesson 83's own rebuild cost entirely.

Every claim in this lesson traces to real, checked code: contracts stated precisely enough to build two genuinely different implementations against, and a generic procedure proven, not assumed, to work identically with either one.

### What breaks without this

Suppose a real system's core logic were written directly against `car`, `cdr`, and `null?` throughout, the way this curriculum often has been, rather than against a named `Sequence` interface. If a later requirement demanded switching to a vector-backed representation — for the exact reason Lesson 83 demonstrated, needing fast indexed access somewhere the list-based code never anticipated — every single place touching `car`/`cdr`/`null?` directly would need to be found and rewritten, with real risk of missing one. Writing against a named ADT interface from the start, as this lesson demonstrates, confines that change to the *implementation* of the three operations alone — `seq-sum`, and any other code built the identical way, would need no changes at all.

### Exercises

1. **Observe.** Before checking, predict whether a third implementation of this lesson's `Sequence` ADT — string characters, using Guile's `string-ref` and `string-length` — could satisfy the identical three contracts.
2. **Formalize.** Build your Exercise 1 string-backed implementation, and confirm `seq-sum`-style generic code (adapted to sum character codes, or count characters) works against it unmodified.
3. **Formalize.** Add a fourth operation, `seq-cons(x, s)` — prepend `x` to `s`, returning a new sequence — to all three implementations (list, vector-offset, and your Exercise 2 string version if applicable), and measure its real cost for each, connecting your results directly to Lesson 83's `cons`-versus-`vector-prepend` findings.
4. **Explain.** In your own words, explain why `seq-rest-vec`'s windowing technique could not be adapted to make `seq-cons` (prepending) equally cheap for the vector-offset representation, referencing what the offset can and cannot represent about the sequence's boundaries.
5. **Explain.** State, in your own words, why Concept Unit 3's two implementations producing identical `drain` output is meaningful evidence for correctness, while Concept Unit 4's `seq-sum` working against both without modification is a genuinely *stronger* claim — referencing what each one actually demonstrates.

### Definition of done

- [ ] You can state an abstract data type's definition precisely: named operations, each with a stated contract, silent about representation.
- [ ] You can explain why two implementations sharing no code but satisfying the identical contracts count as "the same ADT," referencing Concept Unit 1's precise bar.
- [ ] You built or traced through a generic procedure (`seq-sum`) and can explain why it works unmodified against multiple representations.
- [ ] You can explain the real, measured reason `seq-rest-vec` avoids Lesson 83's `vector-prepend` cost, using the windowing technique specifically.
- [ ] You completed Exercises 1–5, including building at least one representation not used as this lesson's own example.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating the representation you built and its real, measured `seq-cons` cost.
