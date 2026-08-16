# Lesson 73: Big-Omega

**What you will build:** a real, computational demonstration that Big-Omega is useful *on its own* — not only ever paired with a matching Big-O the way Lesson 72 used it. An **adversary argument** proves that no correct strategy for finding a target in an unsorted, `n`-element collection can guarantee fewer than `n` comparisons in the worst case, *regardless of which order it checks elements in*. Two structurally different real procedures confirm it: `linear-search-counted` (checking forward) and `linear-search-reverse-counted` (checking backward) both need exactly **`1,000,000`** comparisons to correctly report a target absent from `1,000,000` elements — and, for sharp contrast, the same two procedures diverge completely on a *present* target at the last position: forward needs all **`1,000,000`** comparisons, reverse needs exactly **`1`**. The transferable point: Lesson 72 found Big-Omega's witnesses by checking one specific algebraic formula. This lesson establishes a Big-Omega bound by reasoning about the *problem itself* — ruling out every possible strategy at once — then confirms it with real witnesses `c = 1`, `n₀ = 1`, checked exhaustively across a million values.

**What you need to know first:** Lesson 68 (`FP-L068-repeated-halving.md`) — specifically `linear-search` and its real, measured worst-case comparison count of `1,000,000` at `n = 1,000,000`, extended directly here. Lesson 72 (`FP-L072-big-theta.md`) — specifically Big-Omega's formal definition, reused without redefinition. Lesson 31 (`FP-L031-tracing-recursive-evaluation.md`) — specifically the `set!`-based call-counting technique, reused here to count comparisons instead of recursive calls.

**Terms introduced in this lesson**

- **Adversary argument** — a proof technique for establishing a lower bound that holds for *every* possible algorithm solving a problem, not just one specific implementation: imagine an opponent choosing the answer to each of an algorithm's checks as unfavorably as possible, while staying consistent with everything already revealed, to show the algorithm can never safely stop early. It exists because a bound found by reading one procedure's own source code — the way Lesson 71 and 72's witnesses were found — says nothing about whether some other, cleverer procedure could do better; an adversary argument reasons about the problem itself, ruling out every possible strategy in one stroke.
- **`begin`** — a special form that runs two or more expressions in sequence, one after another, keeping only the last one's value. It exists because an `if`'s branches each hold exactly one expression; a branch that needs to *both* perform a side effect (`set!`, incrementing a counter) *and* then decide what to return needs a way to hold more than one expression in that single position, and `begin` is what supplies it.

---

## Concept Unit 1: Big-Omega Without a Partner

### The Problem

Lesson 72 used Big-Omega exactly once, and only ever alongside a matching Big-O, as one half of proving `f(n) = Θ(n²)` for one specific algebraic formula. It's worth asking directly: is Big-Omega useful by itself, before or without any matching upper bound already in hand? A concrete case to investigate: Lesson 68's `linear-search` is known to be `O(n)` — but is there a *reason*, beyond "this particular procedure happens to check up to `n` elements," that no correct unsorted-search strategy could ever do better in the worst case, no matter how it's written?

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, and Concept Unit 2 answers it with an argument, not code.

### Applying It — Why This Question Is Different From Lesson 72's

Lesson 72's Big-Omega witnesses (`c = 3`, `n₀ = 1`, proving `f(n) ≥ 3n²`) were found by looking at one specific formula, `f(n) = 3n² + 5n + 100`, and checking an inequality against it. That approach only ever proves something about *that one formula*. It says nothing about whether some entirely different algorithm, with a completely different cost formula, might solve the same problem faster.

The question this unit poses needs a different kind of lower bound: not "does this one procedure's formula satisfy `≥ c × g(n)`," but "must *every possible* correct procedure for this problem cost at least this much, no matter how it's written?" Answering that requires reasoning about the problem itself, not about any one piece of code.

### Walkthrough

- **The explicit contrast with Lesson 72's approach** — Lesson 72 bounded one known formula; this lesson needs to bound *every possible* formula an algorithm for this problem could have, known or not yet written.
- **The reframed question** — "must every correct strategy cost at least this much" is a strictly stronger claim than "this one strategy costs at least this much," and needs a strictly different kind of argument to prove.

### CS Lens

This is the real distinction between an algorithm-specific cost analysis and a problem-specific lower bound: the former (Lessons 71–72's approach) says something about one implementation; the latter says something about the *problem*, ruling out every implementation, including ones not yet invented. Also recognized in: a locksmith proving no key of a certain design can open a certain lock (a property of the lock itself, not of any one key someone happened to try); a courier service proving no route between two cities can be shorter than a certain distance (a property of the map's geometry, not of any one driver's chosen route).

### SE Lens

The alternative to asking this sharper question is to stay satisfied with Lesson 71's `linear-search = O(n)` classification and assume, informally, that nothing could realistically do better. The real cost of that alternative is exactly the gap Concept Unit 1 of Lesson 72 warned about with Big-O: an informal sense of "this seems about as good as it gets" is not a checked claim. Posing the sharper question explicitly, as this unit does, motivates Concept Unit 2's real proof technique instead of leaving the matter to intuition.

---

## Concept Unit 2: The Adversary Argument

### The Problem

Concept Unit 1 needs an argument that rules out *every* possible unsorted-search strategy at once, not just the one Lesson 68 happened to write. It's worth working through that argument directly, in prose, before writing any code.

### No isolated lab for this step

This concept has no code of its own to isolate — the argument is stated directly below, and Concept Unit 3 confirms its conclusion computationally.

### Applying It — The Argument, Step by Step

Consider any strategy that claims to correctly decide "is `target` present among these `n` unsorted elements," by checking elements one at a time, in whatever order it chooses, and stopping as soon as it's confident of the answer. Suppose, for contradiction, that this strategy sometimes stops after checking only `k` elements, where `k < n`, and claims the target is absent.

An adversary — someone choosing what's actually in the remaining, unchecked positions — gets to answer honestly for the `k` elements already checked (say, all reported "not equal to target"), and is still completely free to decide what's in the `n − k` positions never checked. Two outcomes are both still possible, consistent with everything the strategy has seen so far:

1. The target really is absent from all `n` positions.
2. The target is sitting in one of the `n − k` unchecked positions.

The strategy has already committed to an answer ("absent") after checking only `k` elements — but outcome 2 is still live. If the adversary places the target in an unchecked position, the strategy's answer is wrong, even though it followed its own rules correctly at every step.

**Naming the conclusion:** no correct strategy can guarantee an answer after checking fewer than `n` elements in the worst case — the adversary can always make an early stop wrong. This holds *regardless of which order the strategy checks elements in*: the argument never depended on checking left-to-right, or in any particular order at all, only on the fact that unchecked positions remain genuinely unknown.

### Walkthrough

- **"Suppose, for contradiction, that this strategy sometimes stops after checking only `k` elements"** — the argument's structure: assume a faster strategy exists, then show it must sometimes be wrong.
- **The adversary's freedom over unchecked positions** — the crux of the whole argument: anything not yet examined is not yet determined, so a strategy that stops early is gambling on an outcome it cannot actually know.
- **"regardless of which order"** — the argument's real strength: it says nothing about *how* elements are checked, only that stopping before all `n` are checked is unsafe — which is exactly what makes it a bound on the *problem*, not on any one procedure.
- **This is called an *adversary argument*** — see Terms introduced, above.

### CS Lens

This is a foundational proof technique for establishing lower bounds on entire classes of algorithms at once, rather than measuring one implementation. Also recognized in: a security auditor proving a lock is pickable in under some number of moves by *playing the adversary* — trying every combination of tumbler positions consistent with what's been felt so far — rather than analyzing one specific lockpick's technique; a game-theory argument proving a game cannot be won in fewer than some number of moves by showing an opponent can always answer in a way that keeps every remaining outcome open.

### SE Lens

The alternative to an adversary argument is to keep testing more and more specific search strategies, one at a time, and observing that none of them beat `n` comparisons in the worst case — an ever-growing pile of individual evidence that never actually proves the general claim, no matter how large it gets. The real cost of that alternative is that it can never rule out a strategy nobody has thought of yet. The adversary argument's real cost is upfront reasoning effort; its real benefit, unlike accumulating more examples, is a conclusion that covers every possible strategy, written or not, in one pass.

---

## Concept Unit 3: Confirming the Bound Holds, Regardless of Order

### The Problem

Concept Unit 2's argument claims the `n`-comparison floor doesn't depend on *which order* elements are checked. That's worth confirming with real code: two structurally different search orders, run against the same adversarial input, should both hit exactly the same floor.

### The New Code — Type It Yourself

```scheme
(define comparisons 0)

(define (linear-search-counted vec target)
  (set! comparisons 0)
  (let ((n (vector-length vec)))
    (let loop ((i 0))
      (if (= i n)
          #f
          (begin
            (set! comparisons (+ comparisons 1))
            (if (= (vector-ref vec i) target)
                i
                (loop (+ i 1))))))))
```

`linear-search-reverse-counted` is not shown as a separate New Code step — it is the identical structure, walking from `(- n 1)` down to `0` instead of from `0` up to `n`, using no construct not already shown above. It appears directly in the Updated Project below.

### The Updated Project

This is `search-lower-bound.scm`, in full:

```scheme
(define comparisons 0)

(define (linear-search-counted vec target)
  (set! comparisons 0)
  (let ((n (vector-length vec)))
    (let loop ((i 0))
      (if (= i n)
          #f
          (begin
            (set! comparisons (+ comparisons 1))
            (if (= (vector-ref vec i) target)
                i
                (loop (+ i 1))))))))

(define (linear-search-reverse-counted vec target)          ; ← new
  (set! comparisons 0)                                       ; ← new
  (let ((n (vector-length vec)))                              ; ← new
    (let loop ((i (- n 1)))                                   ; ← new
      (if (< i 0)                                              ; ← new
          #f                                                    ; ← new
          (begin                                                ; ← new
            (set! comparisons (+ comparisons 1))                ; ← new
            (if (= (vector-ref vec i) target)                   ; ← new
                i                                                ; ← new
                (loop (- i 1))))))))                             ; ← new

(define (build-vector-0-to n)
  (let ((v (make-vector n)))
    (let loop ((i 0))
      (if (= i n)
          v
          (begin (vector-set! v i i) (loop (+ i 1)))))))

(define small (build-vector-0-to 5))
(display "n=5, target absent, forward: found=")
(display (linear-search-counted small 99))
(display " comparisons=") (display comparisons) (newline)
(display "n=5, target absent, reverse: found=")
(display (linear-search-reverse-counted small 99))
(display " comparisons=") (display comparisons) (newline)

(define big (build-vector-0-to 1000000))

(display "n=1000000, target absent, forward: found=")
(display (linear-search-counted big -1))
(display " comparisons=") (display comparisons) (newline)

(display "n=1000000, target absent, reverse: found=")
(display (linear-search-reverse-counted big -1))
(display " comparisons=") (display comparisons) (newline)

(display "n=1000000, target=last-element, forward: found=")
(display (linear-search-counted big 999999))
(display " comparisons=") (display comparisons) (newline)

(display "n=1000000, target=last-element, reverse: found=")
(display (linear-search-reverse-counted big 999999))
(display " comparisons=") (display comparisons) (newline)
```

Together: `linear-search-counted` now counts every comparison it makes, and `linear-search-reverse-counted`, walking the opposite direction, gives the same problem a genuinely different strategy to test the adversary argument against. `build-vector-0-to` is plumbing — an already-established application of `make-vector` and `vector-set!` (Lesson 55) building a vector holding `0` through `n − 1` in order — not this unit's teaching focus.

### Reference Source

No reference counterpart — this combines two already-established techniques (Lesson 68's `linear-search` structure and Lesson 31's `set!`-based counting) for a new purpose neither lesson had: testing whether a cost floor depends on search order.

### Files affected

Created: `search-lower-bound.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile search-lower-bound.scm
n=5, target absent, forward: found=#f comparisons=5
n=5, target absent, reverse: found=#f comparisons=5
n=1000000, target absent, forward: found=#f comparisons=1000000
n=1000000, target absent, reverse: found=#f comparisons=1000000
n=1000000, target=last-element, forward: found=999999 comparisons=1000000
n=1000000, target=last-element, reverse: found=999999 comparisons=1
```

Verified this session. **Confirming Concept Unit 2's claim, at both scales:** with the target genuinely absent, both `forward` and `reverse` need exactly `5` comparisons at `n = 5`, and exactly `1,000,000` comparisons at `n = 1,000,000` — identical counts, from two structurally different search orders, exactly as the adversary argument predicted: an absent target gives the adversary free rein over every position, and both orders are forced to exhaust all of them. The `1,000,000` figure also matches Lesson 68's own real, independently measured `linear-search` comparison count at the identical scale exactly.

**The sharp contrast, present target:** with the target *present*, at the very last position checked by `forward`'s order, `forward` needs all `1,000,000` comparisons (its worst case) while `reverse` needs exactly `1` (its best case) — the identical input producing wildly different real costs depending only on search order. This gap between an algorithm's worst and best case, real and measured here for the first time, is exactly what Lesson 74 addresses directly.

### Mechanical Walkthrough

- **`(define comparisons 0)`** — a reappearance of Lesson 31's global counter pattern (`call-count`), renamed to count comparisons instead of recursive calls.
- **`(set! comparisons 0)`** — a reappearance of `set!` (Lesson 31), resetting the counter at the start of each call so successive searches don't accumulate across calls.
- **`(let ((n (vector-length vec))) ...)`** — a reappearance of `let` (Lesson 51) and `vector-length` (Lesson 55), naming the vector's length once.
- **`(let loop ((i 0)) ...)`** — a reappearance of the named-`let` looping idiom (Lesson 39/51), starting the scan at index `0`.
- **`(if (= i n) #f ...)`** — a reappearance of `if` and `=`; when every index has been examined without a match, the search reports failure.
- **`(begin (set! comparisons (+ comparisons 1)) (if ...))`** — first appearance of `begin` (see Terms introduced): runs the counter increment, then the `if` deciding what to do next, as one sequenced unit — necessary here because `if`'s outer branch has only one expression-sized slot, and this branch needs two actions.
- **`(if (= (vector-ref vec i) target) i (loop (+ i 1)))`** — a reappearance of `if`, `=`, and `vector-ref` (Lesson 55): if the current element matches, return its index; otherwise, continue to the next one.
- **`linear-search-reverse-counted`'s `(let loop ((i (- n 1))) ...)`** — starts at the last index instead of `0`, a reappearance of arithmetic subtraction, not a new concept.
- **`(if (< i 0) #f ...)`** — a reappearance of `if` and `<`; once the index has walked past the first position, every element has been examined.
- **`(loop (- i 1))`** — continues toward index `0` instead of toward `n`, the mirror image of the forward version's `(loop (+ i 1))`.
- **The real, matching comparison counts across both orders and both scales** — direct, measured confirmation of Concept Unit 2's order-independence claim, not merely algebraic reasoning about it.

### CS Lens

This is empirical confirmation of a proof technique's own conclusion: the adversary argument predicted the floor would hold *regardless of order*, and two genuinely different orders, run against genuinely large real input, land on the identical number. Also recognized in: testing a claimed structural limit (a bridge's maximum safe load) by loading it two different, unrelated ways and confirming it fails at the same real weight either time, rather than trusting the calculation alone.

### SE Lens

The alternative to testing a second, differently-ordered search is to trust Concept Unit 2's prose argument and move directly to the formal notation. The real cost of that alternative is exactly this curriculum's standing concern since Lesson 22: an argument that sounds airtight can still contain an unnoticed assumption. Testing a structurally different order, and watching it hit the identical real floor, is what confirms the argument didn't secretly depend on `linear-search`'s own particular left-to-right habit.

---

## Concept Unit 4: Stating and Verifying comparisons(n) = Ω(n)

### The Problem

Concept Unit 2's argument and Concept Unit 3's evidence both point to the same conclusion. It's worth stating that conclusion in Lesson 72's own formal Big-Omega notation, and verifying it exhaustively the same way Lesson 72 did.

### The New Code — Type It Yourself

```scheme
(define (comparisons-worst-case n) n)
```

### The Updated Project

This is `omega-check.scm`, in full:

```scheme
(define (comparisons-worst-case n) n)

(define (check-lower-bound c n0 nmax)
  (let loop ((n n0))
    (cond ((> n nmax) #t)
          ((< (comparisons-worst-case n) (* c n)) (list 'FAILED n))
          (else (loop (+ n 1))))))

(display "checking comparisons-worst-case(n) >= 1*n for n=1..1000000: ")
(display (check-lower-bound 1 1 1000000))
(newline)
```

`check-lower-bound` is Lesson 72's own checker, reused unchanged — a reappearing hard concept (an exhaustive Big-Omega verifier), not re-derived here.

### Reference Source

Lesson 72's `check-lower-bound` (`FP-L072-big-theta.md`, Concept Unit 3), reused verbatim; `comparisons-worst-case` is new, standing for Concept Unit 3's real, measured worst-case comparison count as a plain formula.

### Files affected

Created: `omega-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile omega-check.scm
checking comparisons-worst-case(n) >= 1*n for n=1..1000000: #t
```

Verified this session — with `c = 1` and `n₀ = 1`, `comparisons-worst-case(n) ≥ 1 × n` holds for *every* integer `n` from `1` through `1,000,000`, with zero exceptions (unsurprising, since `comparisons-worst-case(n)` is defined as exactly `n` — Concept Unit 3's real measurements confirmed this formula is genuinely what the worst case costs, not merely a convenient assumption).

**Stating the full claim, precisely, using Lesson 72's definition:** `comparisons-worst-case(n) = Ω(n)` means there exist constants `c > 0` and `n₀` such that `comparisons-worst-case(n) ≥ c × n` for every `n ≥ n₀` — confirmed above with `c = 1`, `n₀ = 1`. What makes this claim different from Lesson 72's `f(n) = Ω(n²)` is not the notation, which is identical, but what it's a claim *about*: Lesson 72's Ω bounded one specific formula; this lesson's Ω, backed by Concept Unit 2's adversary argument, bounds *every possible correct strategy* for unsorted search, of which `linear-search-counted` and `linear-search-reverse-counted` are only two examples.

### Mechanical Walkthrough

- **`(define (comparisons-worst-case n) n)`** — a direct translation of Concept Unit 3's real, measured worst case into a formula: the cost is exactly `n`.
- **`check-lower-bound`** — a hard concept reappearing (Lesson 72's exhaustive Big-Omega checker): walks every integer from `n0` to `nmax`, confirming `comparisons-worst-case(n) ≥ c × n` at each one.
- **The real, exhaustive `#t` result** — direct, checked confirmation that the trivial-looking formula `n` genuinely satisfies the Ω(n) inequality across the full tested range, not merely by inspection.

### CS Lens

This is the same formal machinery from Lesson 72 (Big-Omega's definition, its exhaustive verification style) applied to a new kind of claim: a bound on a whole *problem*, established by an adversary argument, rather than a bound on one algebraic formula. Also recognized in: a building code's minimum wall-thickness requirement, which applies to every building meeting a certain description, not to one specific building someone happened to measure; a cryptographic lower bound on the number of guesses needed to break a cipher, which holds for every possible guessing strategy, not just the ones anyone has actually tried.

### SE Lens

The alternative to formalizing Concept Unit 2's prose argument in Big-Omega notation is to leave it as an informal, if convincing, paragraph. The real cost of that alternative is losing the precise, checkable form Lesson 72 already built machinery for — without restating the claim as `Ω(n)`, there would be no way to exhaustively verify it the same rigorous way every other asymptotic claim in this curriculum has been verified since Lesson 71. Stating it formally, as this unit does, connects a genuinely new *kind* of argument (adversarial, problem-level) back to the curriculum's existing, trusted notation.

---

## Closing

### Connect the pieces

One problem, one lower bound established two different ways, then confirmed both computationally and formally:

1. **The sharper question, posed (Unit 1):** not "is this one procedure's formula bounded below," but "must every correct strategy cost at least this much."
2. **The adversary argument (Unit 2):** any strategy stopping before checking all `n` elements can be caught wrong by an adversary controlling the unchecked positions — a bound on the problem, not on one implementation.
3. **Real, order-independent confirmation (Unit 3):** `linear-search-counted` and `linear-search-reverse-counted`, two genuinely different orders, both forced to exactly `1,000,000` comparisons on an absent target at `n = 1,000,000` — and a sharp `1,000,000`-versus-`1` divergence on a present target, foreshadowing Lesson 74.
4. **The formal claim, verified (Unit 4):** `comparisons-worst-case(n) = Ω(n)`, witnesses `c = 1`, `n₀ = 1`, checked exhaustively across a million values, using Lesson 72's own checker unchanged.

Every claim in this lesson traces to either a real, checked run (Concept Unit 3, 4) or a stated, named proof technique (Concept Unit 2) — exactly this curriculum's standing discipline, now extended from bounding one formula to bounding an entire problem.

### What breaks without this

Suppose an engineer, told that unsorted search "is `O(n)`," set out to find a cleverer algorithm that beats it — perhaps checking elements in a different order, or in pairs, or some other rearrangement — without ever confirming whether beating `n` comparisons in the worst case is even *possible*. Without Concept Unit 2's adversary argument, there's no way to know in advance whether that effort could ever succeed; the engineer might spend real time chasing a speedup that provably cannot exist for this problem, as stated (no sorted-order assumption, no additional structure). With the Ω(n) bound established, the same engineer instead knows, before writing a single line, that any genuine speedup on *this exact problem* is impossible — and that a real speedup instead requires changing the problem itself, exactly what Lesson 68's `binary-search` did by adding a sortedness assumption the adversary argument here never had.

### Exercises

1. **Observe.** Before checking, predict whether a strategy that checks every *other* element first, then goes back for the skipped ones, could ever beat `n` comparisons in the worst case on an absent target. State your reasoning using Concept Unit 2's argument, not intuition alone.
2. **Formalize.** Implement a third counted search order of your own (for example, checking indices in a shuffled or random order) and confirm, by running it against an absent target at a large `n`, that it still needs exactly `n` comparisons.
3. **Explain.** Lesson 68's `binary-search` beats `O(n)`, achieving `O(log n)`, on *sorted* data. Explain, referencing Concept Unit 2's argument specifically, exactly which step of the adversary argument breaks once the data is known to be sorted.
4. **Formalize.** Using your Exercise 2 procedure's real measured worst case, state and verify its own `Ω` claim, following Concept Unit 4's methodology, with your own witness constants.
5. **Explain.** In your own words, state why Concept Unit 3's real code, by itself, would not have been sufficient evidence for Concept Unit 2's claim without the adversary argument also being true — that is, why matching comparison counts across two orders is *supporting* evidence, not *proof*, of a bound on every possible order.

### Definition of done

- [ ] You can state an adversary argument in your own words and explain what kind of claim it proves that reading one procedure's code cannot.
- [ ] You can explain why `begin` is needed in `linear-search-counted`'s loop specifically.
- [ ] You can demonstrate, with real code, that two structurally different search orders hit an identical worst-case comparison count.
- [ ] You can state and verify a Big-Omega claim about a real, measured worst-case cost, using Lesson 72's own checker.
- [ ] You completed Exercises 1–5 using a search order not used as this lesson's own example.
- [ ] Commit your Exercise 2 through 5 findings, with a commit message stating the search order you implemented and the comparison count you measured.
