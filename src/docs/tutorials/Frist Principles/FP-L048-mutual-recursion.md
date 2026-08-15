# Lesson 48: Mutual Recursion

**What you will build:** Two real, working procedures — `my-even?` and `my-odd?` — neither one calling itself even once, each one instead calling the other, terminating correctly because the two together, not either one alone, satisfy Lesson 30's progress requirement. The transferable problem this lesson is actually about: every recursive procedure this curriculum has built since Lesson 27 has called itself. Some genuinely natural definitions split across two (or more) procedures that call each other instead, and nothing built so far has actually confirmed this is legitimate, or explained what termination even means once no single procedure's argument, on its own, tells the whole story.

**What you need to know first:** Lesson 27 (`FP-L027-recursive-definitions.md`) — specifically *base case* and *recursive case*, extended here to a pair of definitions rather than one. Lesson 30 (`FP-L030-making-progress.md`) — specifically *progress measure*, applied here across two procedures at once. Lesson 47 (`FP-L047-termination.md`) — specifically the general termination theorem, whose scope this lesson deliberately tests against a case it doesn't directly cover.

**Terms introduced in this lesson**

- **Mutual recursion** — two or more procedures defined in terms of each other, where neither one calls itself directly, but each one calls at least one of the others, and following the chain of calls far enough eventually reaches a base case. `my-even?` calling `my-odd?`, which calls `my-even?`, which calls `my-odd?`, and so on down to a base case, is mutual recursion between exactly two procedures.

## Objects and methods used

None new. This lesson reuses `define`, `if`, `=`, `null?`, and `cdr`, applied to two procedures that reference each other rather than one procedure referencing itself.

---

## Concept Unit 1: When One Procedure Isn't Enough

### The Problem

"Is `n` even?" and "is `n` odd?" are two closely related questions about a natural number, and each one's most natural definition refers to the *other*: a number is even if it's `0`, or if the number one less than it is odd; a number is odd if it's not `0`, and the number one less than it is even. Writing `is-even?` using only itself, with no reference to any notion of oddness at all, forces an awkward definition that doesn't match how the two ideas actually relate.

### No isolated lab for this step

This concept has no code of its own to isolate — the motivating gap is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Two Definitions, Stated in Prose

**A definition of even, referring to odd:** `n` is even if `n = 0`, or if `n − 1` is odd.

**A definition of odd, referring to even:** `n` is odd if `n ≠ 0`, and `n − 1` is even.

**Confirming neither definition can be restated using only itself, without real distortion:** collapsing "is odd" into "is even"'s own definition — perhaps by checking `n − 2` against evenness directly, skipping the odd question entirely — abandons the natural, alternating structure of the actual mathematical relationship (each number's parity is the opposite of the one before it) in favor of a less direct, though ultimately equivalent, restatement.

### Walkthrough

- **The two prose definitions, each referring to the other** — establishes the genuine, natural shape of the relationship, rather than presenting mutual reference as an arbitrary complication.
- **The attempted collapse into a single self-referential definition** — demonstrates concretely that avoiding mutual reference costs something: a less direct match to how the underlying idea actually works.

### CS Lens

This is the recognition that some ideas are most naturally described by two or more definitions referring to each other, rather than forced into a single, self-contained one — exactly the way describing "predator" and "prey" often requires referring to each other, or "buyer" and "seller" in a single transaction. Also recognized in: a dance's two partners, each one's next move most naturally described in terms of responding to the other's; a conversation's two speakers, each one's next line most naturally described in terms of responding to the other's; a call-and-response musical structure, where each part's definition directly references the other.

### SE Lens

The alternative to allowing mutual reference is to insist every definition be self-contained, forcing exactly the kind of awkward restatement Concept Unit 1's attempted collapse demonstrated. The real cost of that alternative is a definition that no longer matches the actual structure of the idea it's describing, making it harder to read, harder to verify against the original intuition, and more error-prone to get right. Allowing two definitions to refer to each other directly, the subject of the rest of this lesson, costs nothing beyond confirming the resulting recursion is still well-founded — Concept Unit 3's job — and buys a definition that says exactly what the underlying idea actually means.

---

## Concept Unit 2: Mutual Recursion — Two Definitions Referring to Each Other

### The Problem

Concept Unit 1's two prose definitions need to become real Scheme code — two procedures, each one genuinely calling the other, rather than either one calling itself.

### The New Code — Type It Yourself

```scheme
(define (my-even? n)
  (if (= n 0)
      #t
      (my-odd? (- n 1))))

(define (my-odd? n)
  (if (= n 0)
      #f
      (my-even? (- n 1))))
```

### The Updated Project

This is `parity.scm`, in full:

```scheme
(define (my-even? n)
  (if (= n 0)
      #t
      (my-odd? (- n 1))))

(define (my-odd? n)
  (if (= n 0)
      #f
      (my-even? (- n 1))))

(display (my-even? 10))
(newline)
(display (my-odd? 10))
(newline)
```

### Reference Source

Concept Unit 1's two prose definitions, translated directly, one clause at a time: "`n = 0`" became `(= n 0)`; "or if `n − 1` is odd" became `(my-odd? (- n 1))`.

### Files affected

Created: `parity.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile parity.scm
#t
#f
```

Verified this session — `10` is even, `#t`; `10` is not odd, `#f`.

**Confirming both procedures on several more values:**

```
$ guile -q
scheme@(guile-user)> (define (my-even? n) (if (= n 0) #t (my-odd? (- n 1))))
scheme@(guile-user)> (define (my-odd? n) (if (= n 0) #f (my-even? (- n 1))))
scheme@(guile-user)> (list (my-even? 7) (my-odd? 7) (my-even? 0) (my-odd? 0))
$1 = (#f #t #t #f)
```

Verified this session — `7` is odd, not even; `0` is even, not odd — matching ordinary arithmetic exactly.

### Mechanical Walkthrough

- **`(define (my-even? n) ...)`, referencing `my-odd?` inside its own body, before `my-odd?` has been defined yet in the file** — confirms directly that Scheme's `define` doesn't require what a procedure calls to already exist at the moment it's *defined*, only at the moment it's actually *applied* — by the time `my-even?` is ever called, both procedures are fully defined.
- **`(my-odd? (- n 1))`, in `my-even?`'s recursive case** — first appearance of *mutual recursion*'s actual mechanism: a call to a genuinely different procedure, not to `my-even?` itself.
- **`(my-even? (- n 1))`, in `my-odd?`'s recursive case** — the second half of the mutual reference, completing the cycle.

### CS Lens

This is a direct realization of Concept Unit 1's two prose definitions, with nothing lost in translation — each definition's reference to the other becomes, in code, an actual procedure call to the other, exactly matching the natural structure identified before any code was written. Also recognized in: two state-machine states, each one's transition rule referring directly to the other state; two co-routines that hand control back and forth, each one's next action defined in terms of resuming the other; a table tennis rally, each player's shot defined in terms of returning the other's.

### SE Lens

The alternative to writing two procedures that call each other is to force the logic into one procedure, the way Concept Unit 1's attempted collapse tried, tracking parity with some other mechanism (a counter, a flag) that doesn't correspond as directly to the original question. The real cost of that alternative, chosen consistently, is code whose structure no longer mirrors the problem's own structure, exactly the readability cost Lesson 36, Concept Unit 5, already warned a maximally general but less direct tool can carry. Writing `my-even?` and `my-odd?` as genuinely separate, mutually referring procedures, as this unit does, costs nothing beyond the direct translation already shown; it produces code whose two pieces read exactly as clearly as the two prose definitions they came from.

---

## Concept Unit 3: Termination for Mutual Recursion — the Combined Progress Measure

### The Problem

Lesson 47's general theorem covers structural recursion — a single procedure calling itself on a genuine, smaller component. `my-even?` never calls itself at all; it calls `my-odd?`. Nothing in Lesson 47's theorem, stated for one procedure recursing on itself, directly says whether — or why — this still terminates.

### No isolated lab for this step

This concept has no code of its own to isolate — the termination argument is given directly below, not through a construct with its own syntax.

### Applying It — One Measure, Tracked Across Both Procedures

**Checking `n` across a call from `my-even?` to `my-odd?`:** `my-even?(n)` calls `my-odd?(n − 1)` — `n` decreases by exactly `1`.

**Checking `n` across a call from `my-odd?` back to `my-even?`:** `my-odd?(n)` calls `my-even?(n − 1)` — `n` decreases by exactly `1` again.

**Naming what this confirms:** `n` itself, tracked across *either* procedure's call to the other, strictly decreases by exactly `1` every single time, regardless of which of the two procedures is currently running — exactly Lesson 30's original progress-measure requirement, applied not to one procedure's self-calls, but to the combined system of both procedures together.

**Stating the general principle this demonstrates:** proving mutual recursion terminates doesn't need a separate argument for each procedure — it needs one progress measure shown to strictly decrease across *every* call in the mutual cycle, treating the whole group of mutually recursive procedures as a single system, bounded below by whichever procedure's base case is reached first.

### Walkthrough

- **`n` checked across `my-even? → my-odd?`, decreasing by `1`** — the first half of the combined argument.
- **`n` checked across `my-odd? → my-even?`, decreasing by `1`** — the second half, confirming the same measure works regardless of direction.
- **"treating the whole group... as a single system"** — the precise, general principle this unit exists to state, extending Lesson 30's original requirement to cover mutual recursion directly.

### CS Lens

This is the recognition that a progress measure's job — strictly decrease, bounded below — doesn't require it to be tracked within a single procedure's own repeated self-calls; it only requires tracking across whatever sequence of calls actually occurs, even when that sequence alternates between different procedures. Also recognized in: a relay race's total distance covered, strictly decreasing toward the finish line regardless of which specific runner is currently carrying the baton; a two-player game's remaining moves, strictly decreasing toward the game's end regardless of whose turn it currently is; a shared countdown clock in a two-team competition, strictly decreasing regardless of which team is currently acting.

### SE Lens

The alternative to tracking a single combined measure is to assume, incorrectly, that Lesson 47's theorem simply doesn't apply to mutual recursion at all, and either avoid mutual recursion entirely or trust it terminates without any actual argument. The real cost of either alternative is significant: avoiding a natural, direct technique out of unfounded caution, or trusting a genuinely important guarantee without ever actually checking it. Tracking one combined progress measure across the whole mutually recursive group, as this unit does, costs nothing beyond checking `n`'s behavior across both directions of the cycle; it extends this curriculum's termination reasoning to cover mutual recursion with the identical rigor already demanded of ordinary self-recursion.

---

## Concept Unit 4: A Second Example — Mutually Recursive List Processing

### The Problem

`my-even?` and `my-odd?` might suggest mutual recursion is specific to parity, or to numbers generally. A second example, over a genuinely different data type, confirms the technique generalizes the same way structural recursion (Lesson 40) and induction (Lesson 43) already did.

### The New Code — Type It Yourself

```scheme
(define (count-even-positions lst)
  (if (null? lst)
      0
      (+ 1 (count-odd-positions (cdr lst)))))

(define (count-odd-positions lst)
  (if (null? lst)
      0
      (count-even-positions (cdr lst))))
```

### The Updated Project

This is `positions.scm`, in full:

```scheme
(define (count-even-positions lst)
  (if (null? lst)
      0
      (+ 1 (count-odd-positions (cdr lst)))))

(define (count-odd-positions lst)
  (if (null? lst)
      0
      (count-even-positions (cdr lst))))

(display (count-even-positions (list 'a 'b 'c 'd 'e)))
(newline)
(display (count-odd-positions (list 'a 'b 'c 'd 'e)))
(newline)
```

### Reference Source

No reference counterpart — a from-scratch second example, built specifically to confirm mutual recursion applies to list data, not only to numbers.

### Files affected

Created: `positions.scm`.

### Change type

Add (new file).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile positions.scm
3
2
```

Verified this session — `(a b c d e)` has three items at even, `0`-indexed positions (`a` at `0`, `c` at `2`, `e` at `4`) and two at odd positions (`b` at `1`, `d` at `3`).

### Mechanical Walkthrough

- **`(define (count-even-positions lst) (if (null? lst) 0 (+ 1 (count-odd-positions (cdr lst)))))`** — when called on a non-empty list, this procedure is standing at a position it considers "even," so it counts the current item (`+ 1`) and hands the rest of the list to `count-odd-positions`, which will consider the *next* position "odd."
- **`(define (count-odd-positions lst) (if (null? lst) 0 (count-even-positions (cdr lst))))`** — when called on a non-empty list, this procedure is standing at a position it considers "odd," so it does *not* count the current item, and hands the rest of the list back to `count-even-positions`, which will consider the next position "even" again.
- **The progress measure, checked the way Concept Unit 3 checked `my-even?`/`my-odd?`:** `(cdr lst)` strictly shrinks the list by exactly one item, across a call from either procedure to the other — a reappearance of Lesson 32's list-shrinking progress measure, tracked across both procedures exactly as Concept Unit 3's general principle requires.

### CS Lens

This is confirmation that mutual recursion, like every other technique this curriculum has generalized (structural recursion in Lesson 40, structural induction in Lesson 43), applies to recursively defined data in general, not only to the natural numbers it happened to be first demonstrated on. Also recognized in: an alternating table-setting process, one procedure placing forks and handing off, another placing knives and handing back; a zebra crossing's alternating light cycle, one state handing control to the other and back; a knitting pattern's alternating stitch rows, each row's instructions referring to what the previous, different row already established.

### SE Lens

The alternative to building this second example is to let `my-even?` and `my-odd?` stand as the only demonstration, risking the same narrow-understanding gap Lesson 34 and Lesson 40 already warned against for techniques shown only once. The real cost of that alternative is a learner who recognizes mutual recursion only when it involves parity checking specifically, rather than as a general technique available whenever two closely related, alternating questions about recursively defined data naturally refer to each other. Building a second, list-based example, as this unit does, costs one additional pair of procedures; it confirms the technique itself, not merely this lesson's first lucky example, is what's actually been learned.

---

## Concept Unit 5: When to Prefer Mutual Recursion Over a Single Combined Procedure

### The Problem

`my-even?`/`my-odd?` could have been written as a single procedure tracking parity with an extra parameter instead — `(define (check-parity n want-even) ...)`. It's worth stating honestly when mutual recursion is actually the better choice, rather than treating it as automatically preferable just because it was demonstrated first.

### No isolated lab for this step

This concept has no code of its own to isolate — the comparison is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Comparing Two Designs

**The single-procedure alternative, sketched:**

```scheme
(define (check-parity n want-even)
  (if (= n 0)
      want-even
      (check-parity (- n 1) (not want-even))))
```

**Checking this computes the same thing:** `(check-parity n #t)` should match `(my-even? n)`; `(check-parity n #f)` should match `(my-odd? n)` — a single procedure, an extra Boolean parameter tracking which question is currently being asked, and `(not want-even)` flipping it on each call, in place of switching to a genuinely different procedure.

**Stating the honest tradeoff, in the same spirit as Lesson 36's own comparison of `map` against an equivalent `fold`:** `check-parity` is arguably more compact — one procedure instead of two — but it requires a reader to track what `want-even` means and how it flips, an extra layer of bookkeeping `my-even?` and `my-odd?` never needed, since each one's own name already says precisely which question it's answering.

**Naming when mutual recursion is genuinely the better choice:** when two (or more) closely related questions or processes are naturally distinct — each with its own clear name and its own clear job — and the relationship between them is best expressed as "handing off" to the other, mutual recursion keeps that structure visible directly in the code. When the "two things" are really one underlying process with a single piece of state that happens to alternate, a single procedure with an extra parameter, like `check-parity`, can be the clearer choice instead.

### Walkthrough

- **`check-parity`, sketched as a genuine alternative** — not a strawman, but a real, working alternative design, checked for correctness against `my-even?` and `my-odd?`.
- **The honest tradeoff, stated directly** — a reappearance of the exact readability-versus-generality comparison Lesson 36, Concept Unit 5, already modeled for `map` versus `fold`.
- **The stated guidance for choosing between them** — not a new concept, but a direct, practical closing judgment, consistent with this curriculum's repeated insistence that generality and readability are separate virtues, neither automatically trumping the other.

### CS Lens

This is the same design-choice tension Lesson 36 already named for `map` and `fold` — two implementations computing the identical result, differing in which structural choice best communicates the underlying intent to a future reader. Also recognized in: choosing two separate, named methods on an object versus one method with a mode flag, in ordinary software design; choosing two separate legal clauses versus one clause with an exception, in contract drafting; choosing two separate assembly-line stations versus one station with a switchable setting, in manufacturing design.

### SE Lens

The alternative to stating this tradeoff honestly is to present mutual recursion as an unconditionally superior technique simply because this lesson demonstrated it working. The real cost of that alternative would be encouraging mutual recursion even in cases where a single procedure with an extra parameter genuinely communicates the underlying idea more directly — exactly the overgeneralization risk Lesson 36 already warned against for `fold`. Stating the tradeoff directly, and naming when each choice is actually preferable, as this unit does, costs one honest closing comparison; it leaves this lesson's technique as a genuine tool to reach for deliberately, not a default to apply automatically.

---

## Closing

### Connect the pieces

Two mutually recursive pairs, one about numbers and one about lists, traced through every unit built in this lesson, start to finish:

1. **The natural, alternating relationship named (Unit 1):** even and odd, each definition most naturally referring to the other.
2. **Real code, translated directly (Unit 2):** `my-even?` and `my-odd?`, each calling the other, verified against real arithmetic.
3. **Termination confirmed across both procedures at once (Unit 3):** `n` shown to strictly decrease across every call, in either direction, extending Lesson 30's requirement to a combined system.
4. **A second, list-based example (Unit 4):** `count-even-positions` and `count-odd-positions`, confirming the technique generalizes beyond numbers.
5. **An honest comparison against the alternative (Unit 5):** `check-parity`, a single procedure with an extra parameter, checked for correctness and compared honestly for readability.

Unit 3's combined progress-measure argument applies directly to Unit 4's second example as well — the identical reasoning, checked once more against `(cdr lst)` instead of `(- n 1)`, confirming the termination technique itself, not just its first application, generalizes.

### What breaks without this

Suppose a learner, having only ever seen self-recursive procedures, encountered a genuinely mutually recursive pair — perhaps while reading a state-machine implementation, where one state's handling procedure calls another state's handling procedure directly — and mistook it for two unrelated, individually broken procedures, since neither one, read in isolation, appears to have a complete base case and recursive case of its own. Real time might be spent trying to "fix" code that was never actually broken, simply because the reader lacked the vocabulary and the specific termination argument (Concept Unit 3) needed to recognize a mutually recursive pair as a single, well-founded system rather than two separate, incomplete ones. Restoring this lesson's vocabulary and technique — recognizing mutual recursion for what it is, and checking termination across the whole group rather than expecting to find it within either procedure alone — is what allows code structured this way to be read, trusted, and written with the same confidence as any self-recursive procedure already fully understood.

### Exercises

1. **Observe.** Find or invent two closely related questions about the same kind of data, where each one's most natural definition refers to the other, the way "even" and "odd" refer to each other.
2. **Formalize.** Write both of your Exercise 1 questions as real, mutually recursive Scheme procedures, following `my-even?`/`my-odd?`'s exact translation process.
3. **Explain.** Identify a single progress measure that strictly decreases across a call from either of your Exercise 2 procedures to the other, the way Concept Unit 3 tracked `n` across both directions.
4. **Explain.** Sketch a single-procedure alternative to your Exercise 2 pair, using an extra parameter the way `check-parity` used `want-even`, and check that it computes the same results.
5. **Explain.** State, honestly, which of your Exercise 2 and Exercise 4 designs you find more readable for your specific example, and why, using Concept Unit 5's tradeoff as a model.

### Definition of done

- [ ] You can write two genuinely mutually recursive procedures, neither one calling itself, from a pair of naturally related, alternating definitions.
- [ ] You can identify a single progress measure that strictly decreases across calls in either direction of a mutually recursive pair.
- [ ] You can rewrite a mutually recursive pair as a single procedure with an extra parameter, and explain honestly which version is more readable for a specific case.
- [ ] You can recognize mutual recursion when reading someone else's code, rather than mistaking it for two incomplete, self-recursive procedures.
- [ ] You completed Exercises 1–5 using your own pair of related questions, not even/odd or position counting.
- [ ] Commit `parity.scm`, `positions.scm`, and your Exercise 2 and Exercise 4 procedures, with a commit message stating which of the two designs you ultimately preferred for your own example, and why.
