# Lesson 88: Stacks

**What you will build:** a `Stack` abstract data type — following Lesson 84's own vocabulary precisely — with two genuinely different implementations, one over a plain list and one over Lesson 86's array-backed dynamic array, checked against each other using a single, generic bracket-balance checker. Real, verified evidence this session: across six real test strings, including nested brackets of three different kinds, an unmatched open bracket, an interleaved mismatch (`([)]`), and the empty string, both implementations agree exactly on every case. The transferable point: a stack is the precise, named discipline behind a pattern this curriculum has used informally since recursion was introduced — every recursive call this curriculum has ever traced (Lesson 31's `fib`, for instance) unwinds in the exact reverse order it was built up in, because Scheme's own call mechanism is itself managing something stack-shaped, whether or not it was ever named.

**What you need to know first:** Lesson 84 (`FP-L084-abstract-data-types.md`) — specifically the ADT format (named operations, each a contract) and the generic-code-over-an-interface technique, both reused directly here. Lesson 86 (`FP-L086-dynamic-arrays.md`) — specifically the doubling dynamic array, reused unchanged as this lesson's second representation. Lesson 31 (`FP-L031-tracing-recursive-evaluation.md`) — specifically `fib`'s real call trace, revisited as an already-familiar example of stack-shaped behavior nobody named at the time.

**Terms introduced in this lesson**

- **Stack** — a Last-In-First-Out (LIFO) abstract data type: elements are added and removed from the identical end, so the most recently added element is always the first one removed. It exists to name, precisely, a discipline this curriculum has relied on informally since recursion was first introduced, and to make that discipline directly usable as its own, deliberate tool.

---

## Concept Unit 1: A Real Need for Last-In-First-Out

### The Problem

Checking whether a string's brackets are correctly balanced — `(a(b)c)` valid, `(a)b)c(` not — needs remembering every open bracket seen so far, in a way that lets each closing bracket be checked against the *most recently* opened, still-unmatched one. Getting this wrong (checking against the *oldest* unmatched bracket instead) would incorrectly accept or reject real cases; the order matters precisely, and needs a structure built around exactly that order.

### No isolated lab for this step

This concept has no code of its own to isolate — the motivating problem is posed directly here, before Concept Unit 2 names the structure it needs.

### Applying It — Why It Has to Be the *Most Recent* One

Consider `[a{b}]` partway through: after reading `[` and `{`, both are open and unmatched. Reading `}` must match against `{`, the more recently opened one — not `[`, even though `[` was opened first. Reading `]` afterward then correctly matches the remaining `[`. Checking against the wrong one — oldest instead of most recent — would wrongly reject this valid string.

### Walkthrough

- **The concrete `[a{b}]` trace** — makes "most recently opened, still unmatched" a specific, checkable requirement rather than an abstract description.
- **The explicit "wrongly reject this valid string" consequence** — shows getting the order wrong isn't a minor inefficiency, it's a correctness bug.

### CS Lens

This is the general shape of Last-In-First-Out ordering: the most recently deferred piece of unfinished business must be the next one resolved, before anything deferred earlier can be. Also recognized in: a stack of plates, where the last plate placed on top is necessarily the first one removed; a to-do list where interrupting an in-progress task with an urgent one means finishing the urgent one first, then returning to exactly where the original task was paused.

### SE Lens

The alternative to naming this discipline precisely is to write bracket-checking logic that happens to get the order right without any named structure behind it, the way an ad hoc solution might. The real cost of that alternative is losing the chance to notice — as this lesson's closing does — that the identical discipline already governs something this curriculum has used constantly and never named: real recursive call behavior.

---

## Concept Unit 2: Defining the Stack ADT

### The Problem

Concept Unit 1's need — remembering things so the most recent one comes back first — needs a precise ADT definition, in Lesson 84's own format, before any code gets written.

### No isolated lab for this step

This concept has no code of its own to isolate — the definition is stated directly below, following Lesson 84's contract format exactly.

### Applying It — The Stack ADT, Precisely

- **`push(s, x)`** — *requires:* nothing. *guarantees:* returns a new stack containing `x` as its most recently added element, with every element of `s` still present, in the identical relative order.
- **`peek(s)`** — *requires:* `s` is non-empty. *guarantees:* returns the most recently pushed element still present, without removing it.
- **`pop(s)`** — *requires:* `s` is non-empty. *guarantees:* returns a stack containing every element of `s` except the most recently pushed one.
- **`empty?(s)`** — *requires:* nothing. *guarantees:* returns true exactly when `s` contains no elements.

**Naming what makes this specifically a *stack*, not just any sequence ADT:** Lesson 84's `Sequence` ADT (`seq-first`/`seq-rest`) said nothing about *which* end mattered — a list-backed implementation naturally exposed its front. A stack's contracts are written entirely in terms of "most recently added" — an ADT organized around insertion order specifically, regardless of which physical end any particular representation happens to use for it.

### Walkthrough

- **Each operation as a requires/guarantees contract** — a direct reapplication of Lesson 84's own format, this time to a LIFO-specific interface.
- **The explicit contrast with Lesson 84's `Sequence`** — clarifies that a stack isn't a new *kind* of contract format, it's a specific, named *set* of contracts organized around recency.

### CS Lens

This is an ADT defined entirely around one ordering guarantee, deliberately silent — exactly as Lesson 84 required — about how "most recently added" is actually tracked underneath. Also recognized in: a company's "next in line for promotion" policy defined purely by seniority order, without specifying whether that order is tracked on paper, in a spreadsheet, or by memory — any of which would satisfy the identical policy.

### SE Lens

The alternative to writing these contracts precisely is to build stack-shaped code without ever naming the guarantee explicitly, the way Concept Unit 1's motivating problem could be solved without ever using the word "stack." The real cost of that alternative is exactly what Lesson 84 already argued: code that isn't written against a named contract can't be checked against it, or swapped to a different implementation with any confidence it still behaves the same way.

---

## Concept Unit 3: Two Real Implementations

### The Problem

Concept Unit 2's contracts need two genuinely different implementations, the same way Lesson 84 built two for `Sequence` — one obvious, one reusing Lesson 86's more involved machinery — checked against each other for identical behavior.

### The New Code — Type It Yourself

```scheme
(define (make-stack-arr) (list (make-vector 1) 0))

(define (push-arr s x)
  (let* ((vec (car s)) (count (cadr s)) (cap (vector-length vec)))
    (if (< count cap)
        (begin (vector-set! vec count x) (list vec (+ count 1)))
        (let ((new-vec (make-vector (* cap 2))))
          (let loop ((i 0))
            (if (< i cap)
                (begin (vector-set! new-vec i (vector-ref vec i)) (loop (+ i 1)))))
          (vector-set! new-vec count x)
          (list new-vec (+ count 1))))))

(define (peek-arr s) (vector-ref (car s) (- (cadr s) 1)))
(define (pop-arr s) (list (car s) (- (cadr s) 1)))
(define (empty-arr? s) (= (cadr s) 0))
```

### The Updated Project

This is `stack-check.scm`, in full:

```scheme
(define (make-stack-list) '())
(define (push-list s x) (cons x s))
(define (peek-list s) (car s))
(define (pop-list s) (cdr s))
(define (empty-list? s) (null? s))

(define (make-stack-arr) (list (make-vector 1) 0))                ; ← new

(define (push-arr s x)                                              ; ← new
  (let* ((vec (car s)) (count (cadr s)) (cap (vector-length vec)))     ; ← new
    (if (< count cap)                                                    ; ← new
        (begin (vector-set! vec count x) (list vec (+ count 1)))           ; ← new
        (let ((new-vec (make-vector (* cap 2))))                             ; ← new
          (let loop ((i 0))                                                    ; ← new
            (if (< i cap)                                                        ; ← new
                (begin (vector-set! new-vec i (vector-ref vec i)) (loop (+ i 1)))); ← new
          (vector-set! new-vec count x)                                            ; ← new
          (list new-vec (+ count 1))))))                                             ; ← new

(define (peek-arr s) (vector-ref (car s) (- (cadr s) 1)))               ; ← new
(define (pop-arr s) (list (car s) (- (cadr s) 1)))                        ; ← new
(define (empty-arr? s) (= (cadr s) 0))                                      ; ← new

(define sl (push-list (push-list (push-list (make-stack-list) 1) 2) 3))
(display "list: peek=") (display (peek-list sl))
(display " pop-then-peek=") (display (peek-list (pop-list sl)))
(newline)

(define sa (push-arr (push-arr (push-arr (make-stack-arr) 1) 2) 3))
(display "array: peek=") (display (peek-arr sa))
(display " pop-then-peek=") (display (peek-arr (pop-arr sa)))
(newline)
```

`push-list`, `peek-list`, `pop-list`, `empty-list?` are direct wrappers over `cons`, `car`, `cdr`, `null?` (Lesson 12) — the list's own front already satisfies every stack contract with no adaptation. `push-arr` is Lesson 86's own `doubling-append`, renamed; `peek-arr` and `pop-arr` read and logically remove the array's *last* occupied position — since Lesson 86's dynamic array only ever grows and shrinks from one end, that end is exactly a stack's "most recently added" position.

### Reference Source

Lesson 12's list operations, and Lesson 86's `doubling-append` (`FP-L086-dynamic-arrays.md`, Concept Unit 3), both reused directly as the two representations' underlying mechanics.

### Files affected

Created: `stack-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile stack-check.scm
list: peek=3 pop-then-peek=2
array: peek=3 pop-then-peek=2
```

Verified this session — pushing `1`, `2`, then `3` onto an empty stack and peeking returns `3` (the most recently pushed) for both implementations; popping once and peeking again returns `2` — real, checked LIFO behavior, before Concept Unit 4 checks both against a real, shared application.

### Mechanical Walkthrough

- **`(cons x s)`** — a reappearance of `cons`; a list-backed `push` simply prepends, since Lesson 83 already established `cons` is the cheap end of a list.
- **`(vector-ref (car s) (- (cadr s) 1))`** — a reappearance of `vector-ref`; reads the element one position before `count`, the array's last real occupant, not its full capacity.
- **`(list (car s) (- (cadr s) 1))`** — a reappearance of `list`; `pop-arr` doesn't erase anything, it simply reports one fewer element as "real" — the identical value is still physically present until overwritten by a future `push-arr`, invisible to anything using only the stack's own operations.
- **Both implementations sharing Concept Unit 2's identical four contracts** — confirmed structurally here, and behaviorally in Concept Unit 4.

### CS Lens

This is Lesson 84's abstraction lesson reapplied immediately: a list, chosen because its cheap end (the front) already matches a stack's needs exactly, and a dynamic array, chosen because *its* cheap end (Lesson 86's amortized append) also happens to match — two representations, selected specifically because each one's already-established cheap operation lines up with what a stack actually needs. Also recognized in: choosing a specific style of filing tray for "most recent memo on top" specifically because trays naturally support adding and removing from the top cheaply, rather than adapting a filing cabinet built for alphabetical access to the identical purpose.

### SE Lens

The alternative to choosing representations deliberately is to pick one arbitrarily and adapt it, the way a vector's *front* could technically serve as a stack's "top" if `push` and `pop` were written to always operate at index `0` — legal, but exactly the expensive choice Lesson 83 already measured (`vector-prepend`'s real, growing cost). Choosing the end that's already cheap for each representation, as this unit does, is Lesson 83's trade-off lesson applied as a deliberate design decision, not an afterthought.

---

## Concept Unit 4: A Real Application, and the Familiar Pattern Underneath

### The Problem

Concept Unit 3's two implementations need checking against a real, shared use — Concept Unit 1's bracket-balance problem — written once, generically, against the Stack ADT alone.

### The New Code — Type It Yourself

```scheme
(define (balanced? str make push peek pop empty?)
  (define (matches? open close)
    (or (and (char=? open #\() (char=? close #\)))
        (and (char=? open #\[) (char=? close #\]))
        (and (char=? open #\{) (char=? close #\}))))
  (let loop ((chars (string->list str)) (s (make)))
    (cond ((null? chars) (empty? s))
          ((memv (car chars) (list #\( #\[ #\{))
           (loop (cdr chars) (push s (car chars))))
          ((memv (car chars) (list #\) #\] #\}))
           (if (or (empty? s) (not (matches? (peek s) (car chars))))
               #f
               (loop (cdr chars) (pop s))))
          (else (loop (cdr chars) s)))))
```

### The Updated Project

This is `balanced-check.scm`, in full:

```scheme
(define (make-stack-list) '())
(define (push-list s x) (cons x s))
(define (peek-list s) (car s))
(define (pop-list s) (cdr s))
(define (empty-list? s) (null? s))

(define (make-stack-arr) (list (make-vector 1) 0))
(define (push-arr s x)
  (let* ((vec (car s)) (count (cadr s)) (cap (vector-length vec)))
    (if (< count cap)
        (begin (vector-set! vec count x) (list vec (+ count 1)))
        (let ((new-vec (make-vector (* cap 2))))
          (let loop ((i 0))
            (if (< i cap)
                (begin (vector-set! new-vec i (vector-ref vec i)) (loop (+ i 1)))))
          (vector-set! new-vec count x)
          (list new-vec (+ count 1))))))
(define (peek-arr s) (vector-ref (car s) (- (cadr s) 1)))
(define (pop-arr s) (list (car s) (- (cadr s) 1)))
(define (empty-arr? s) (= (cadr s) 0))

(define (balanced? str make push peek pop empty?)                ; ← new
  (define (matches? open close)                                     ; ← new
    (or (and (char=? open #\() (char=? close #\)))                     ; ← new
        (and (char=? open #\[) (char=? close #\]))                       ; ← new
        (and (char=? open #\{) (char=? close #\}))))                       ; ← new
  (let loop ((chars (string->list str)) (s (make)))                          ; ← new
    (cond ((null? chars) (empty? s))                                           ; ← new
          ((memv (car chars) (list #\( #\[ #\{))                                 ; ← new
           (loop (cdr chars) (push s (car chars))))                                ; ← new
          ((memv (car chars) (list #\) #\] #\}))                                     ; ← new
           (if (or (empty? s) (not (matches? (peek s) (car chars))))                   ; ← new
               #f                                                                        ; ← new
               (loop (cdr chars) (pop s))))                                                ; ← new
          (else (loop (cdr chars) s)))))                                                     ; ← new

(define test-cases (list "(a(b)c)" "(a(b)c" "(a)b)c(" "[a{b(c)d}e]" "([)]" ""))

(for-each
 (lambda (s)
   (display s) (display " -> list-backed: ")
   (display (balanced? s make-stack-list push-list peek-list pop-list empty-list?))
   (display " array-backed: ")
   (display (balanced? s make-stack-arr push-arr peek-arr pop-arr empty-arr?))
   (newline))
 test-cases)
```

`balanced?` never touches `cons`, `car`, `vector-ref`, or any other representation-specific detail directly — it takes all five stack operations as parameters, the identical generic-over-an-ADT technique Lesson 84's `seq-sum` used.

### Reference Source

No reference counterpart — `balanced?` is a from-scratch application, built specifically to exercise both stack implementations identically.

### Files affected

Created: `balanced-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile balanced-check.scm
(a(b)c) -> list-backed: #t array-backed: #t
(a(b)c -> list-backed: #f array-backed: #f
(a)b)c( -> list-backed: #f array-backed: #f
[a{b(c)d}e] -> list-backed: #t array-backed: #t
([)] -> list-backed: #f array-backed: #f
 -> list-backed: #t array-backed: #t
```

Verified this session — all six test cases, including a valid three-bracket-type nesting, an unmatched open bracket, an unmatched close, an interleaved mismatch (`([)]`, where the brackets are individually balanced in count but closed in the wrong order), and the empty string (vacuously balanced), agree exactly between the list-backed and array-backed implementations.

### Mechanical Walkthrough

- **`(string->list str)`** — first appearance: a real Scheme procedure converting a string into a list of its individual characters, letting the rest of the procedure process one character at a time using already-established list operations.
- **`(memv (car chars) (list #\( #\[ #\{))`** — first appearance of `memv`: a real Scheme procedure checking whether a value appears anywhere in a list, returning the matching remainder if so, `#f` otherwise — used here only for its truthiness, to test "is this character an opening bracket."
- **`(char=? open #\()`** — first appearance of `char=?`: a real Scheme procedure comparing two characters for equality; `#\(` is a character literal, Scheme's syntax for the single character `(`.
- **`(push s (car chars))` / `(pop s)` / `(peek s)` / `(empty? s)`** — a reappearance of applying a parameter as though it were an ordinary procedure name (Lesson 34), exactly Lesson 84's own generic-ADT technique, now with four operations instead of three.
- **The real, identical results across both representations, on all six cases** — direct, checked confirmation that `balanced?` genuinely doesn't depend on which stack implementation it's handed.

### CS Lens

This is Lesson 84's payoff realized a second time, on a real, useful application rather than a toy sum: `balanced?` was written once, correctly, and works against either representation without modification — exactly the property that makes an ADT boundary valuable in practice, not just in principle. **The pattern this curriculum has used without naming it:** every recursive call this curriculum has traced — Lesson 31's `fib(4)`, calling `fib(3)` then `fib(2)`, each waiting for its own recursive calls to finish before it can finish itself — unwinds in exactly LIFO order: the most recently started, still-pending call is always the next one to complete, because Scheme's own evaluator is managing something stack-shaped to track "what still needs to happen once this call returns," precisely the discipline this lesson just built and named directly. Also recognized in: a browser's back button, returning to the most recently visited page first, undoing navigation in exactly the reverse order it happened.

### SE Lens

The alternative to naming the stack discipline explicitly is to keep relying on it implicitly — inside every recursive call this curriculum has ever written — without a reusable, general-purpose tool built around it directly. The real cost of that alternative is exactly Concept Unit 1's own motivating case: a problem (bracket balancing) that *isn't* naturally recursive in the same shape as `fib`, but needs the identical LIFO discipline, has no ready-made tool to reach for without a stack built and named as its own thing.

---

## Closing

### Connect the pieces

One precisely named discipline, two implementations, one real application, and a familiar pattern finally named:

1. **The real need (Unit 1):** bracket balancing requires checking each closer against the *most recently* opened, still-unmatched bracket.
2. **The ADT, defined (Unit 2):** `push`/`peek`/`pop`/`empty?`, each a contract organized entirely around recency.
3. **Two implementations, built (Unit 3):** a list (cheap at the front) and Lesson 86's dynamic array (cheap at the end), each chosen because its already-established cheap operation matches what a stack needs.
4. **A real, shared application, and a name for something familiar (Unit 4):** `balanced?`, verified identically against both, plus the direct naming of the LIFO pattern already present, unnamed, in every recursive call this curriculum has traced since Lesson 31.

Every claim in this lesson traces to real, checked code across two independent representations and six real test cases — the same evidence discipline this curriculum has used since Lesson 22, now applied to naming a pattern that turns out to have been present all along.

### What breaks without this

Suppose an engineer needed to solve a problem shaped like Concept Unit 1's bracket balancing — tracking nested, must-close-in-reverse-order structure, common in parsing any nested format (code, markup, expressions) — without ever having a name for the discipline required. Without a `Stack` ADT to reach for directly, that engineer might reinvent the identical logic from scratch each time, or worse, get the ordering subtly wrong in a case an unnamed, ad hoc approach didn't anticipate — exactly the risk `([)]`'s real, correctly-rejected test case in this lesson guards against by name.

### Exercises

1. **Observe.** Before checking, predict whether `balanced?` would correctly reject `"(()"` (one unmatched open) and `"())"` (one unmatched close), and explain which specific branch of `balanced?`'s `cond` catches each case.
2. **Formalize.** Confirm your Exercise 1 predictions by running both against `balanced?`, using either stack implementation.
3. **Formalize.** Implement a third stack representation — Lesson 87's doubly linked structure, using only its `next`/`push`-equivalent operations at one end — and verify it against `balanced?` alongside the two already built.
4. **Explain.** In your own words, explain why a *queue* (elements removed in the order they were added, not reversed) would give the *wrong* answer for bracket balancing if substituted for a stack in `balanced?`'s logic, using the `[a{b}]` example from Concept Unit 1.
5. **Explain.** Revisit Lesson 31's real `fib(4)` call trace and explain, in your own words, which specific calls are "on the stack" (started but not yet finished) at the exact moment `fib(0)` is first called, using this lesson's LIFO vocabulary precisely.

### Definition of done

- [ ] You can state the Stack ADT's four operations as contracts, in Lesson 84's requires/guarantees format.
- [ ] You can explain why a list's front and Lesson 86's dynamic array's end were each chosen deliberately, referencing Lesson 83's representation trade-offs.
- [ ] You can trace `balanced?` by hand on a string of your own choosing and predict its result before running it.
- [ ] You can explain, using a specific real example from Lesson 31, why ordinary recursive calls already exhibit LIFO behavior.
- [ ] You completed Exercises 1–5, including building a third stack representation not used as this lesson's own example.
- [ ] Commit your Exercise 3 and 5 findings, with a commit message stating the representation you added and which real recursive trace you analyzed.
