# Lesson 72: Big-Theta

**What you will build:** a real, computational demonstration that Big-O notation, precise as Lesson 71 made it, has a loose secret — `f(n) = 3n² + 5n + 100` is genuinely, correctly `O(n³)` too, verified with real witness constants (`c = 1`, `n₀ = 7`, checked exhaustively across a million values). But `f` is decisively *not* bounded below by any multiple of `n³` — real evidence this session shows `f(n)` drops below `0.001 × n³` by `n = 3,002`, and below `0.0001 × n³` by `n = 30,002`, with no sign of stopping. This lesson introduces the notation that rules out `O(n³)` as an acceptable *tight* description: Big-Theta, verified with real witnesses `c₁ = 3`, `c₂ = 5`, `n₀ = 9`, confirming `f(n) = Θ(n²)` — checked, both bounds, across a million real values each. The transferable point: Big-O alone can be technically true while still being uninformative, and Big-Theta is the precise fix.

**What you need to know first:** Lesson 71 (`FP-L071-big-o.md`) — specifically Big-O's formal definition and `f(n) = 3n² + 5n + 100`, both extended directly here.

**Terms introduced in this lesson**

- **Tight bound** — a growth-rate claim that captures a function's actual behavior on both sides, not merely an upper limit it happens to stay under. `O(n³)` is a true but loose claim about `f`; `Θ(n²)` is a tight one.
- **Big-Omega notation** — `f(n) = Ω(g(n))` means there exist constants `c > 0` and `n₀` such that `f(n) ≥ c × g(n)` for every `n ≥ n₀` — a *lower* bound, the mirror image of Big-O's upper bound.
- **Big-Theta notation** — `f(n) = Θ(g(n))` means `f(n) = O(g(n))` *and* `f(n) = Ω(g(n))` — both an upper and a lower bound by constant multiples of `g`, together pinning `f`'s growth precisely to `g`'s.

---

## Concept Unit 1: Big-O's Loose Secret

### The Problem

Lesson 71 found real witnesses proving `f(n) = 3n² + 5n + 100` is `O(n²)`. It's worth checking directly whether `f` is *also*, correctly, `O(n³)` — and if so, what that reveals about what a Big-O claim actually promises.

### No isolated lab for this step

This concept has no code of its own to isolate — the real check is demonstrated directly below, using `f` unchanged from Lesson 71.

### Applying It — Checking f(n) = O(n³)

```
$ guile theta2.scm
smallest n0 where f(n)<=n^3 (c=1): 7
checking f(n) <= 1*n^3 for n=10..1000000: #t
```

Verified this session — with `c = 1` and `n₀ = 7`, `f(n) ≤ 1 × n³` holds for every `n ≥ 7`, checked exhaustively from `n = 10` through `n = 1,000,000`. By Lesson 71's own formal definition, this is a completely valid proof that `f(n) = O(n³)`.

**Naming what this reveals:** `f(n) = O(n²)` (Lesson 71) and `f(n) = O(n³)` (just verified) are *both* true, simultaneously, about the identical function. Big-O only promises an upper limit — it says nothing about how *close* that limit actually is to `f`'s real behavior. `O(n³)` is technically correct and almost entirely uninformative: it's true of `f`, and it would be equally true of a function that actually grew like `n³`, or `n².⁵`, or anything smaller than `n³`.

### Walkthrough

- **The real, verified `O(n³)` claim** — direct, checked confirmation that Big-O's looseness isn't hypothetical, it's demonstrable on the identical function this curriculum already classified as `O(n²)`.
- **"technically correct and almost entirely uninformative"** — the precise problem this lesson exists to fix, stated plainly.

### CS Lens

This is the well-known limitation of Big-O notation used carelessly: "the algorithm is `O(n³)`" is a true statement about many algorithms that are actually much faster, exactly the way a true statement that "this trip takes at most three days" says nothing useful about a trip that actually takes one hour. Also recognized in: a weather forecast correctly stating "less than 100% chance of rain" — true, and useless; a warranty correctly stating a product "will fail within 1,000 years" — technically true of nearly any product, and completely uninformative about its actual expected lifespan.

### SE Lens

The alternative to checking whether `f` is also `O(n³)` is to assume Lesson 71's `O(n²)` classification was the *only* correct Big-O statement about `f`, and stop there. The real cost of that alternative is missing exactly the gap this unit demonstrates — without checking, there'd be no way to know Big-O alone permits arbitrarily loose, unhelpful classifications for the identical function. Checking directly, as this unit does, is what motivates Concept Unit 2's tighter notation as a genuine necessity, not an arbitrary addition.

---

## Concept Unit 2: Defining Big-Omega and Big-Theta Precisely

### The Problem

Big-O alone, as Concept Unit 1 showed, can't distinguish a tight description from a loose one. A notion of *lower* bound is needed too, and a way to combine both into one precise, tight claim.

### No isolated lab for this step

This concept has no code of its own to isolate — the definitions are stated directly below.

### Applying It — The Formal Definitions

**Big-Omega, the mirror image of Big-O:** `f(n) = Ω(g(n))` means there exist constants `c > 0` and `n₀` such that `f(n) ≥ c × g(n)` for every `n ≥ n₀` — `f` grows *at least as fast* as some constant multiple of `g`, once `n` is large enough.

**Big-Theta, combining both:** `f(n) = Θ(g(n))` means `f(n) = O(g(n))` **and** `f(n) = Ω(g(n))` — `f` is sandwiched between two constant multiples of `g`, from both above and below, once `n` is large enough. Equivalently: there exist `c₁ > 0`, `c₂ > 0`, and `n₀` such that `c₁ × g(n) ≤ f(n) ≤ c₂ × g(n)` for every `n ≥ n₀`.

**Confirming why this rules out Concept Unit 1's `O(n³)` problem:** claiming `f(n) = Θ(n³)` would require *also* proving `f(n) = Ω(n³)` — that `f` grows *at least* as fast as some multiple of `n³`. Since `f` is actually a degree-`2` polynomial, this should be impossible to prove, and Concept Unit 3 checks that directly.

### Walkthrough

- **Big-Omega's definition, stated as Big-O's precise mirror image** — `≥` instead of `≤`, otherwise structurally identical, making the relationship between the two easy to see directly.
- **Big-Theta's definition, stated two equivalent ways** — as "both `O` and `Ω`," and as a single sandwiching inequality with two separate constants (`c₁`, `c₂`) — giving two ways to verify it computationally.

### CS Lens

This is the standard resolution to Big-O's looseness: pairing an upper bound with a matching lower bound produces a claim precise enough to actually pin down a function's growth, rather than merely bound it from one side. Also recognized in: a manufacturing tolerance specified as both a minimum and a maximum acceptable measurement, rather than only a maximum, precisely because "no more than X" alone doesn't guarantee the part isn't absurdly undersized; a medical reference range given as both a lower and upper healthy bound, rather than only an upper limit.

### SE Lens

The alternative to defining Big-Theta is to keep using Big-O alone, understanding informally that "the tightest true Big-O bound is the meaningful one," without a formal way to state or check that tightness. The real cost of that alternative is exactly the ambiguity Concept Unit 1 exposed — without Big-Theta, there's no precise, checkable way to say "`n²` specifically, not just some upper bound." Defining it formally, as this unit does, gives that precision a name and a checkable structure.

---

## Concept Unit 3: Confirming f Is Θ(n²), Not Θ(n³)

### The Problem

Concept Unit 2's definitions need checking against real evidence, both confirming `f(n) = Θ(n²)` holds and confirming `f(n) = Θ(n³)` does *not* — following this curriculum's standing discipline of checking a claim's negation as carefully as the claim itself.

### The New Code — Type It Yourself

```scheme
(define (check-lower-bound c n0 nmax)
  (let loop ((n n0))
    (cond ((> n nmax) #t)
          ((< (f n) (* c n n)) (list 'FAILED n))
          (else (loop (+ n 1))))))
```

### The Updated Project

This is `theta-check.scm`, in full:

```scheme
(define (f n) (+ (* 3 n n) (* 5 n) 100))

(define (check-lower-bound c n0 nmax)
  (let loop ((n n0))
    (cond ((> n nmax) #t)
          ((< (f n) (* c n n)) (list 'FAILED n))
          (else (loop (+ n 1))))))

(define (check-upper-bound c n0 nmax)
  (let loop ((n n0))
    (cond ((> n nmax) #t)
          ((> (f n) (* c n n)) (list 'FAILED n))
          (else (loop (+ n 1))))))

(display (check-lower-bound 3 1 1000000))
(newline)
(display (check-upper-bound 5 9 1000000))
(newline)
```

### Reference Source

Concept Unit 2's two-part definition, translated directly: `check-lower-bound` verifies `f(n) ≥ c × n²` (Big-Omega's inequality, reversed from Lesson 71's `check-bound`); `check-upper-bound` is Lesson 71's `check-bound`, renamed for symmetry; together they check both halves of `f(n) = Θ(n²)`.

### Files affected

Created: `theta-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

**Confirming f(n) = Θ(n²), both bounds, checked exhaustively:**

```
$ guile theta3.scm
checking f(n) >= 3*n^2 for n=1..1000000: #t
checking f(n) <= 5*n^2 for n=9..1000000: #t
```

Verified this session — `f(n) ≥ 3n²` holds for *every* `n` from `1` through `1,000,000` (the lower bound holds immediately, since `5n + 100` is always positive); `f(n) ≤ 5n²` holds for every `n` from `9` onward, exactly Lesson 71's own witnesses. Together: `c₁ = 3`, `c₂ = 5`, `n₀ = 9` witness `f(n) = Θ(n²)`.

**Confirming f(n) is NOT Θ(n³) — no lower bound by any multiple of n³ exists:**

```
$ guile theta2.scm
for c=0.001, f(n) < c*n^3 first at n=3002
for c=0.0001, f(n) < c*n^3 first at n=30002
```

Verified this session — for `c = 0.001`, `f(n)` drops *below* `0.001 × n³` by `n = 3,002` (and stays below, since `f(n)/n³ → 0`); for the even smaller `c = 0.0001`, `f(n)` still eventually drops below, just later, at `n = 30,002`. No matter how small a `c` is chosen, `f(n)/n³ → 0` guarantees `f(n)` eventually falls below `c × n³` permanently — meaning **no** valid `c` and `n₀` can ever satisfy Big-Omega's requirement for `g(n) = n³`. `f(n) = O(n³)` is true (Concept Unit 1); `f(n) = Ω(n³)` is false; therefore `f(n) = Θ(n³)` is false.

### Mechanical Walkthrough

- **`(< (f n) (* c n n))`** — `check-lower-bound`'s failure condition: `f(n)` has fallen *below* `c × n²`, violating the `Ω` requirement.
- **The real, exhaustive `#t` results for both bounds at `n² `** — direct, checked confirmation of `f(n) = Θ(n²)`.
- **The real "eventually falls below, for any `c` tried" evidence at `n³`** — direct, checked confirmation of `f(n) ≠ Θ(n³)`, demonstrated rather than merely asserted from the algebra.

### CS Lens

This is the complete, both-directions verification Big-Theta demands: not just showing an upper bound holds (Lesson 71's `O(n²)` and `O(n³)` both did that), but showing a *matching* lower bound holds for `n²` and provably does not for `n³` — the second half being exactly what separates a tight classification from a loose one. Also recognized in: certifying a scale's accuracy by checking it against known weights both above and below the claimed tolerance, not just confirming it never reads too high; confirming a claimed running average is accurate by checking it doesn't drift too low as well as too high over time.

### SE Lens

The alternative to checking the `Ω(n³)` claim's *failure* directly is to simply assert, from the algebra, that `f`'s degree is `2`, so of course it can't be `Θ(n³)`. The real cost of that alternative, however algebraically obvious, is exactly the gap between an assumed-obvious claim and a checked one this curriculum has cared about since Lesson 22 — and the real, concrete evidence (`c = 0.001` failing by `n = 3,002`, `c = 0.0001` failing later but still failing) makes the *reason* `Θ(n³)` fails tangible in a way the algebra alone doesn't: however small a `c` is chosen, `f`'s relative smallness compared to `n³` always eventually wins.

---

## Closing

### Connect the pieces

One function, one loose claim exposed, one tight claim verified both ways:

1. **Big-O's looseness, demonstrated (Unit 1):** `f(n) = O(n³)`, real, checked, and true — and almost entirely uninformative about `f`'s actual behavior.
2. **Big-Omega and Big-Theta, defined (Unit 2):** a lower bound, and both bounds combined into one tight, sandwiching claim.
3. **Both directions, checked (Unit 3):** `f(n) = Θ(n²)`, both bounds verified exhaustively across a million values each; `f(n) ≠ Θ(n³)`, its lower bound shown to genuinely fail, for every `c` tried, not merely asserted from degree-counting.

Every claim in this lesson — the loose `O(n³)`, the tight `Θ(n²)`, and the failed `Θ(n³)` — was checked computationally, with real witness constants either found and verified, or shown not to exist across a real, tested range, exactly this curriculum's standing evidence discipline applied to the precise distinction between an upper bound and a tight characterization.

### What breaks without this

Suppose two algorithms were both correctly described as `O(n³)` — one actually running in time proportional to `n³`, the other actually running in time proportional to `n²` but merely *also* satisfying the looser `O(n³)` bound, exactly the way `f` did in Concept Unit 1. An engineer choosing between them based only on their shared `O(n³)` label would have no way to tell them apart, potentially picking the genuinely slower one, or dismissing the genuinely faster one as "no better," entirely due to using a loose bound where a tight one was needed. Classifying with Big-Theta, as this lesson demonstrated, is what would have revealed the real difference — one algorithm `Θ(n²)`, the other genuinely `Θ(n³)` — making an informed choice possible.

### Exercises

1. **Observe.** Choose a function of your own with a clear leading term — for example, `h(n) = 4n + 20` — and predict, before checking, whether it should be `Θ(n)`, and whether it should also be a valid (loose) `O(n²)` claim.
2. **Formalize.** Find real witness constants `c₁`, `c₂`, and `n₀` for `h(n) = Θ(n)`, following Concept Unit 3's methodology, and verify them computationally across a large range.
3. **Explain.** Confirm your Exercise 1 function is also correctly `O(n²)`, finding real witnesses, and explain in your own words why this doesn't contradict `h(n) = Θ(n)`.
4. **Formalize.** Attempt to find witnesses proving your Exercise 1 function is `Ω(n²)`, and show, the way Concept Unit 3 did for `f(n)` and `n³`, that no such witnesses exist — report the evidence you gathered.
5. **Explain.** Using this lesson's distinction, restate one of Lesson 71, Concept Unit 4's classifications (for example, `has-duplicate? = O(n²)`) as a Big-Theta claim instead, and explain what additional evidence would be needed to justify the stronger claim.

### Definition of done

- [ ] You can state Big-Omega's and Big-Theta's formal definitions precisely.
- [ ] You can demonstrate that a function can satisfy a true but loose Big-O bound, using real witness constants.
- [ ] You can find real witnesses for a tight Big-Theta bound, verifying both the upper and lower halves.
- [ ] You can show, with real evidence, that a specific Big-Theta claim is false by demonstrating its lower-bound half fails.
- [ ] You completed Exercises 1–5 using a function not used as this lesson's own example.
- [ ] Commit your Exercise 2 through 5 findings, with a commit message stating the function you analyzed and the witnesses you found.
