# Lesson 108: Path Compression

**What you will build:** **path compression** — a real, small modification to Lesson 107's `uf-find` that rewires every node visited during a walk directly to the representative it finds, permanently shortening the chain for every future call. Real, verified evidence this session: on the identical `n`-element adversarial chain Lesson 107 built (an `n − 1`-hop worst case for a single `uf-find`), finding every element once, without compression, costs a real, measured `n(n − 1) / 2` total hops — `4,950`, `499,500`, `49,995,000` at `n = 100`, `1,000`, `10,000`. With path compression, that identical first full pass costs only `2n − 3` — `197`, `1,997`, `19,997` — and a second full pass over the same, now-flattened structure costs just `n − 1`, essentially one hop per element. The transferable point: this is a genuinely rare kind of optimization — one that costs nothing extra to add, changes not one bit of what `uf-find` returns, and turns a real quadratic total into a real linear one, verified exactly rather than estimated.

**What you need to know first:** Lesson 107 (`FP-L107-union-find.md`) — specifically `uf-find`, `uf-union!`, and its own real, measured `n − 1`-hop worst case, the exact structure and finding this lesson builds directly on. Lesson 64 (`FP-L064-arithmetic-series.md`) — specifically the arithmetic series formula, confirmed again here for a new real quantity.

**Terms introduced in this lesson**

- **Path compression** — rewiring every node visited during a `uf-find` walk to point directly at the representative the walk discovers, rather than leaving each node's parent pointer as it was. It exists because a `uf-find` call already pays the real cost of visiting every node on a path — compression spends nothing extra to make every future call through those same nodes cheaper.

**Objects and methods used**

- **`vector-ref`**
  - *What it is:* a real Scheme procedure reading a vector's stored value at a given index.
  - *Implementation:* takes a vector and an index, returns the value stored there; reappearing from Lesson 55/85, used as `(vector-ref parent x)`.
  - *Its use:* reading an element's current parent during the compressed walk, identical to Lesson 107's own use.
- **`vector-set!`**
  - *What it is:* a real Scheme procedure that mutates a vector, writing a new value into a given index.
  - *Implementation:* takes a vector, an index, and a value, mutating the vector in place; reappearing from Lesson 55/85, used as `(vector-set! parent x root)`.
  - *Its use:* the actual compression step — overwriting a visited node's parent with the walk's own final result.

---

## Concept Unit 1: Paying the Same Cost Twice

### The Problem

Lesson 107's Concept Unit 4 measured `uf-find(0)`'s real cost on an adversarial chain: `n − 1` hops. That number describes *one* call. A real system rarely calls `uf-find` on the same element only once — and every one of those `n − 1` intermediate nodes the walk passes through would pay that identical, expensive walk again, in full, the next time anything asks for *their* representative, since Lesson 107's `uf-find` never changes a single parent pointer while it walks.

### No isolated lab for this step

This concept has no code of its own to isolate — the problem is posed directly here, extending Lesson 107's own single-call measurement to repeated calls.

### Reference Source

No reference counterpart — the motivating problem is posed directly, extending Lesson 107's own real finding rather than any external implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What Gets Wasted, Precisely

Walking from node `5` to a distant root, `uf-find` necessarily passes through nodes `6`, `7`, `8`, and so on, up to the root — and, by finishing that walk, it now *knows* every one of those nodes' true representative, exactly as precisely as it knows `5`'s. Lesson 107's `uf-find` discovers this and then discards it, leaving every intermediate node's parent pointer exactly as expensive to walk as before.

### Walkthrough

- **"discovers this and then discards it"** — names precisely what Concept Unit 2's fix targets: not incorrect behavior, but real, already-computed information going unused.
- **The direct extension of Lesson 107's single-call number to repeated calls** — reframes a single measured worst case as a *recurring* cost, the actual shape a real system would experience.

### CS Lens

This is a real instance of a general optimization pattern: when an expensive computation's *intermediate results* are individually reusable, and nothing about correctness requires discarding them, caching them as a side effect of the very computation that produced them costs nothing extra to add. Also recognized in: Lesson 54's own memoization, caching a recursive call's result the first time it's genuinely computed — though path compression differs in *what* gets cached: not the answer to one call, but a permanently shortened path for every node the call happened to pass through.

### SE Lens

The alternative to compressing during the walk is a separate, dedicated pass that rebalances the whole structure afterward, on some schedule. The real cost of that alternative: it requires deciding *when* to run, and pays a real cost walking structure that a compressing `uf-find` would have flattened for free, already, as an unavoidable side effect of work already being done.

---

## Concept Unit 2: Deriving Path Compression

### The Problem

Concept Unit 1 named what's being wasted. It needs a precise rule for reusing it — one that provably cannot change which representative any element resolves to, since correctness (Lesson 107's own, already-verified partition) must survive unchanged.

### No isolated lab for this step

This concept has no code of its own to isolate — the rule is derived directly below, and Concept Unit 3 implements and verifies it as real code.

### Reference Source

No reference counterpart — a from-scratch derivation building on Lesson 107's own `uf-find`.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Rewiring Without Changing What's True

**The rule:** while `uf-find(x)` walks from `x` to its representative, `r`, every node visited along that path gets its parent pointer set directly to `r`, once the walk finishes and `r` is known.

**Why this cannot break correctness:** an element's representative is defined entirely by *which self-parented node a chain of parent pointers eventually reaches* — nothing in that definition depends on the *length* of the chain, only its *endpoint*. Setting a visited node's parent directly to `r` doesn't change `r`'s own status as a self-parented representative, and it doesn't change which representative any *other* element resolves to, since no other element's own path was touched. The partition itself — which elements share a representative — is exactly preserved; only the real, physical distance from each visited node to its representative shrinks, permanently.

**Why the walk already has everything it needs:** `uf-find`'s own recursive structure — find the parent's representative first, then act — means the representative `r` is already known by the time each visited node's own compression step needs to happen, with no second walk required.

### Walkthrough

- **The rule stated as "no correctness cost, only a physical shortening"** — the specific claim Concept Unit 3 verifies directly, not just asserts.
- **"nothing in that definition depends on the length of the chain, only its endpoint"** — the actual reason compression is safe, derived from Lesson 107's own representative definition rather than assumed.

### CS Lens

This is a real instance of exploiting a *definitional* property to justify an optimization: because "representative" is defined by an endpoint, not a path, any transformation preserving every element's endpoint is automatically correctness-preserving, regardless of how much it changes the path itself. Also recognized in: a GPS app recalculating a shorter route to an already-fixed destination — the *destination* stays exactly the same; only the stored path to it changes.

### SE Lens

The alternative to deriving *why* this preserves correctness is to implement the rewiring and trust that it happens to still produce correct answers, checked only empirically. The real cost of that alternative: a rule that merely "seems to work" on a handful of test cases offers no guarantee it can't fail on some input never tried — deriving the *reason* first, as this unit does, is what turns Concept Unit 3's real, checked confirmation into verification of an already-understood claim, rather than the only evidence the rule is correct at all.

---

## Concept Unit 3: Implementing and Verifying Path Compression

### The Problem

Concept Unit 2 derived the rule. It needs real code, and a real, physical check that it does exactly what was claimed: identical correctness, permanently shortened paths.

### The New Code — Type It Yourself

```scheme
(define (uf-find-compressed! parent x)
  (if (= (vector-ref parent x) x)
      x
      (let ((root (uf-find-compressed! parent (vector-ref parent x))))
        (vector-set! parent x root)
        root)))
```

### The Updated Project

This is `uf-path-compress.scm`, in full — reusing Lesson 107's `make-uf`/`uf-union!` unchanged, with `uf-find-compressed!` replacing `uf-find`:

```scheme
(define (make-uf n)
  (let ((parent (make-vector n)))
    (let loop ((i 0)) (if (< i n) (begin (vector-set! parent i i) (loop (+ i 1)))))
    parent))

(define (uf-union! parent a b)
  (define (uf-find parent x)
    (let loop ((x x)) (if (= (vector-ref parent x) x) x (loop (vector-ref parent x)))))
  (let ((ra (uf-find parent a)) (rb (uf-find parent b)))
    (if (not (= ra rb)) (vector-set! parent ra rb))))

(define (uf-find-compressed! parent x)                             ; ← new
  (if (= (vector-ref parent x) x)                                     ; ← new
      x                                                                  ; ← new
      (let ((root (uf-find-compressed! parent (vector-ref parent x))))     ; ← new
        (vector-set! parent x root)                                          ; ← new
        root)))                                                                 ; ← new

(define p1 (make-uf 6))
(uf-union! p1 0 1) (uf-union! p1 2 3) (uf-union! p1 1 2)
(display "find 0..5 (compressed) after union(0,1) union(2,3) union(1,2): ")
(display (list (uf-find-compressed! p1 0) (uf-find-compressed! p1 1) (uf-find-compressed! p1 2)
               (uf-find-compressed! p1 3) (uf-find-compressed! p1 4) (uf-find-compressed! p1 5)))
(newline)

(define small (make-uf 5))
(let loop ((i 0)) (if (< i 4) (begin (uf-union! small i (+ i 1)) (loop (+ i 1)))))
(display "5-element chain, before any compressed find: ") (display small) (newline)
(uf-find-compressed! small 0)
(display "5-element chain, after ONE compressed find(0): ") (display small) (newline)
```

`uf-find-compressed!` recurses to the representative first — the recursive call happens *before* anything is written — then, as each recursive call returns, writes the now-known representative, `root`, directly into the *current* node's parent slot before returning it onward. Every node on the original path gets this treatment exactly once, on the way back out of the recursion.

### Reference Source

Lesson 107's `uf-union!` (`FP-L107-union-find.md`, Concept Unit 3), quoted here unchanged; `uf-find-compressed!` is a from-scratch modification of that same lesson's `uf-find`, per Concept Unit 2's derived rule.

### Files affected

Created: `uf-path-compress.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Mechanical Walkthrough

- **`(if (= (vector-ref parent x) x) x ...)`** — a reappearance of `vector-ref`, `=`; the identical base case as Lesson 107's `uf-find` — a self-parented node is immediately its own answer, unchanged by this lesson's modification.
- **`(let ((root (uf-find-compressed! parent (vector-ref parent x)))) ...)`** — first appearance of this specific recursive shape in this curriculum: the recursive call's *result* is captured and used *after* returning, rather than the walk being purely iterative like Lesson 107's own named-let version.
- **`(vector-set! parent x root)`** — first appearance of writing during a find operation at all; Lesson 107's `uf-find` only ever read `parent`. This single line is the entirety of Concept Unit 2's derived rule, executed.
- **`root`** as the final expression — a reappearance of returning a bound value; ensures the representative propagates back up through every recursive call, not just the outermost one.
- **The real, exact match between the pre-Lesson-107 partition results and this lesson's compressed ones, `(3 3 3 3 4 5)` either way** — direct, checked confirmation of Concept Unit 2's own correctness claim: compression changed *how* the answer was found, not *what* the answer is.
- **The real, physical change in the printed parent vector, `#(1 2 3 4 4)` becoming `#(4 4 4 4 4)` after a single call** — direct, inspectable proof that compression is a real, physical rewiring, not merely a faster-sounding description of the same structure.

### CS Lens

This is Lesson 2's own "turning ambiguity into precision" applied to a performance claim rather than a problem statement: "path compression makes things faster" is exactly the kind of vague claim this curriculum has never accepted at face value — the real, printed parent vector, before and after, is what turns it into a checked, physical fact.

### SE Lens

The alternative to verifying the parent vector directly is trusting that the correct partition results (identical either way) are proof enough that compression worked as intended. The real risk of that alternative: identical *results* say nothing about whether any actual rewiring happened at all — a `uf-find-compressed!` with a silently broken `vector-set!` call would produce the identical correct answers while providing none of Concept Unit 2's promised real speedup, an error the partition check alone could never catch.

### Run It — Show the Real Output

```
$ guile uf-path-compress.scm
find 0..5 (compressed) after union(0,1) union(2,3) union(1,2): (3 3 3 3 4 5)
5-element chain, before any compressed find: #(1 2 3 4 4)
5-element chain, after ONE compressed find(0): #(4 4 4 4 4)
```

Verified this session — the compressed partition results, `(3 3 3 3 4 5)`, exactly match Lesson 107's own uncompressed results on the identical unions, confirming correctness is unchanged. The real, physical proof: a fresh `5`-element chain, `#(1 2 3 4 4)` (element `0` pointing to `1`, `1` to `2`, and so on up to the self-parented root `4`), becomes `#(4 4 4 4 4)` after a *single* `uf-find-compressed!` call on element `0` alone — every element on that one path, not just `0` itself, now points directly at the root.

---

## Concept Unit 4: The Real, Measured Payoff

### The Problem

Concept Unit 3 confirmed compression works correctly and physically. It's worth measuring, honestly, exactly how much real advantage it buys — on the identical adversarial chain Lesson 107 already built, so the comparison is apples to apples.

### The New Code — Type It Yourself

```scheme
(for-each
 (lambda (n)
   (define parent (make-uf n))
   (let loop ((i 0)) (if (< i (- n 1)) (begin (uf-union! parent i (+ i 1)) (loop (+ i 1)))))
   (let loop ((i 0)) (if (< i n) (begin (uf-find-compressed! parent i) (loop (+ i 1))))))
 (list 100 1000 10000))
```

### The Updated Project

This is `uf-compress-cost.scm`, in full — extending this lesson's own `uf-path-compress.scm` with counted variants of both the naive and compressed walks, comparing three real totals on the identical chain:

```scheme
(define (make-uf n)
  (let ((parent (make-vector n)))
    (let loop ((i 0)) (if (< i n) (begin (vector-set! parent i i) (loop (+ i 1)))))
    parent))

(define (uf-union! parent a b)
  (define (uf-find parent x)
    (let loop ((x x)) (if (= (vector-ref parent x) x) x (loop (vector-ref parent x)))))
  (let ((ra (uf-find parent a)) (rb (uf-find parent b)))
    (if (not (= ra rb)) (vector-set! parent ra rb))))

(define hops 0)
(define (uf-find-compressed-counted! parent x)                      ; ← new
  (if (= (vector-ref parent x) x)                                      ; ← new
      x                                                                   ; ← new
      (let ((root (begin (set! hops (+ hops 1))                             ; ← new
                          (uf-find-compressed-counted! parent (vector-ref parent x))))) ; ← new
        (vector-set! parent x root)                                            ; ← new
        root)))                                                                   ; ← new

(define (uf-find-naive-counted parent x)                              ; ← new
  (let loop ((x x))                                                       ; ← new
    (if (= (vector-ref parent x) x)                                          ; ← new
        x                                                                       ; ← new
        (begin (set! hops (+ hops 1)) (loop (vector-ref parent x))))))            ; ← new

(for-each
 (lambda (n)
   (define naive-parent (make-uf n))
   (let loop ((i 0)) (if (< i (- n 1)) (begin (uf-union! naive-parent i (+ i 1)) (loop (+ i 1)))))
   (set! hops 0)
   (let loop ((i 0)) (if (< i n) (begin (uf-find-naive-counted naive-parent i) (loop (+ i 1)))))
   (define naive-total hops)

   (define comp-parent (make-uf n))
   (let loop ((i 0)) (if (< i (- n 1)) (begin (uf-union! comp-parent i (+ i 1)) (loop (+ i 1)))))
   (set! hops 0)
   (let loop ((i 0)) (if (< i n) (begin (uf-find-compressed-counted! comp-parent i) (loop (+ i 1)))))
   (define compressed-first-pass hops)
   (set! hops 0)
   (let loop ((i 0)) (if (< i n) (begin (uf-find-compressed-counted! comp-parent i) (loop (+ i 1)))))
   (define compressed-second-pass hops)

   (display "n=") (display n)
   (display " naive-full-pass=") (display naive-total)
   (display " compressed-first-pass=") (display compressed-first-pass)
   (display " compressed-second-pass=") (display compressed-second-pass)
   (newline))
 (list 100 1000 10000))
```

Both counted procedures reuse the identical `hops` counter, incrementing once per real edge walked — the same discipline Lesson 107's own `uf-find-counted` used. Two separate parent vectors, `naive-parent` and `comp-parent`, are built from the identical union sequence, so the naive and compressed totals are measured on genuinely identical starting structures.

### Reference Source

Lesson 107's own `uf-find-counted` (`FP-L107-union-find.md`, Concept Unit 4), reused as `uf-find-naive-counted` for a new measurement that lesson never itself computed — the total cost of finding *every* element once, not only element `0`.

### Files affected

Created: `uf-compress-cost.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Mechanical Walkthrough

- **`(let ((root (begin (set! hops (+ hops 1)) (uf-find-compressed-counted! parent (vector-ref parent x))))) ...)`** — a reappearance of `set!`, `begin`; counts one hop per recursive descent, mirroring Lesson 107's naive counter exactly so the two totals are directly comparable.
- **Two separate `make-uf` calls, `naive-parent` and `comp-parent`, each rebuilt from the identical union sequence** — first appearance of this specific control, ensuring compression's real advantage isn't measured against a structure the naive pass had already altered.
- **The real, exact totals — `n(n − 1)/2` for the naive pass, `2n − 3` for the compressed first pass, `n − 1` for the compressed second pass** — direct, measured confirmation of a real quadratic-to-linear improvement, checked at three separate scales rather than assumed from the mechanism alone.

### CS Lens

This is the real, measured shape of an **amortized** improvement, the same vocabulary Lesson 86 used for doubling's own resizing cost: no single `uf-find` call is ever cheaper than Lesson 107's worst case guarantees it could be — the very first compressed call still costs the full `n − 1` hops — but the *total* cost across many calls drops sharply, because early, expensive calls pay down the cost of every later one.

### SE Lens

The alternative to measuring three separate totals (naive, compressed first pass, compressed second pass) is reporting only the dramatic second-pass number, `n − 1`, as "the" real cost of path compression. The real, more honest picture, worth the extra measurement: the *first* pass, `2n − 3`, is the number a real system actually experiences the first time it walks a genuinely bad structure — still a real, measured improvement over the naive `n(n − 1)/2`, but a smaller one than the second-pass number alone would suggest, exactly the kind of honest, non-overclaiming distinction this curriculum has applied since Lesson 60.

### Run It — Show the Real Output

```
$ guile uf-compress-cost.scm
n=100 naive-full-pass=4950 compressed-first-pass=197 compressed-second-pass=99
n=1000 naive-full-pass=499500 compressed-first-pass=1997 compressed-second-pass=999
n=10000 naive-full-pass=49995000 compressed-first-pass=19997 compressed-second-pass=9999
```

Verified this session — finding every element once on the identical adversarial chain costs a real `4,950`, `499,500`, `49,995,000` total hops without compression, against `197`, `1,997`, `19,997` with compression on that very first pass — already dramatically smaller, since compressing nodes along the very first, expensive walk (element `0`'s) pays forward for every other element's own subsequent find within that same pass. A second full pass over the now-flattened structure costs just `99`, `999`, `9,999` — matching `n − 1` exactly, one hop per element, since every element now points directly at the root.

---

## Closing

### Connect the pieces

One chain, one small rewiring rule, a real quadratic-to-linear change:

1. **The waste, named (Unit 1):** every `uf-find` call already discovers every visited node's true representative, and Lesson 107's version discards that information immediately.
2. **The rule, derived (Unit 2):** rewire every visited node directly to the discovered representative — provably safe, since "representative" is defined by endpoint, not path length.
3. **Implemented and physically verified (Unit 3):** a real `5`-element chain's parent vector, printed before and after a single compressed find, shows the rewiring directly — not just matching correct answers, but a genuinely changed structure.
4. **The real payoff, measured honestly (Unit 4):** a real `n(n − 1)/2` naive total collapses to `2n − 3` on the very first compressed pass, and `n − 1` on the second — three real numbers, not one flattering headline figure.

Every claim in this lesson traces to real, executed code: a physical before/after proof of the rewiring itself, and a real three-way cost comparison at three separate scales.

### What breaks without this

Suppose a real system used Lesson 107's uncompressed Union-Find to process a long stream of "these are the same group" facts, and — exactly as Concept Unit 4's own naive numbers show — later needed to look up group membership for every element at least once. Without path compression, that lookup phase alone costs a real, quadratic `n(n − 1)/2` total, even though the underlying partition was correct the entire time. This lesson's real numbers show precisely what compression buys back: the identical lookup phase costs a real, linear total instead — the actual, measured reason production Union-Find implementations essentially never ship without it.

### Exercises

1. **Observe.** Before checking, predict whether calling `uf-find-compressed!` on element `n − 1` (the root) *first*, before any other element, would change this lesson's own first-pass total, `2n − 3`, using Concept Unit 3's own base case to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code at `n = 1,000`.
3. **Formalize.** Measure the real total cost of finding every element once, in *reverse* order (`n − 1` down to `0`), on a fresh copy of the identical adversarial chain, and explain any real difference from this lesson's own forward-order first-pass number.
4. **Explain.** In your own words, explain why `uf-find-compressed!`'s `vector-set!` call happens *after* the recursive call returns, not before — referencing what value it needs that isn't known yet at the point the recursive call is made.
5. **Explain.** Using this lesson's real numbers and Lesson 86's own vocabulary, explain why "the very first call still costs `n − 1`" and "the total cost across many calls is dramatically lower" are both true at once, without contradiction.

### Definition of done

- [ ] You can state path compression's rule precisely and explain why it cannot change which representative any element resolves to.
- [ ] You can point to the real, printed parent vector, before and after, as physical proof of compression — not just matching correct answers.
- [ ] You can explain why the first compressed pass, `2n − 3`, is still real, honest evidence of improvement, even though it's larger than the second pass's `n − 1`.
- [ ] You completed Exercises 1–5, including a real, measured reverse-order comparison.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, measured results.
