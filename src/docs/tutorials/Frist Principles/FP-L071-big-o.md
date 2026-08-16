# Lesson 71: Big-O

**What you will build:** a real, computational check confirming the formal definition of Big-O notation on a concrete function, `f(n) = 3n² + 5n + 100` — finding real witness constants, `c = 5` and `n₀ = 9`, such that `f(n) ≤ 5n²` for *every* `n` from `9` onward, verified by checking all one million values from `n = 9` through `n = 1,000,000`, every single one passing. The transferable point: Lesson 69 named six growth-rate categories informally, and Lesson 70 clarified their scope was asymptotic. This lesson gives that informal understanding a precise, checkable mathematical definition — Big-O notation — and confirms, computationally rather than just algebraically, that the definition actually does what it claims.

**What you need to know first:** Lesson 69 (`FP-L069-growth-rates.md`) — specifically the six growth-rate categories, now given precise notation. Lesson 70 (`FP-L070-asymptotic-thinking.md`) — specifically *asymptotic* and *constant overhead*, both directly formalized by Big-O's own definition.

**Terms introduced in this lesson**

- **Big-O notation** — `f(n) = O(g(n))` means: there exist real constants `c > 0` and `n₀` such that `f(n) ≤ c × g(n)` for every `n ≥ n₀`. In words: `f` grows no faster than some constant multiple of `g`, once `n` is large enough.
- **Witness constants** — the specific `c` and `n₀` that make a Big-O claim concretely checkable. Claiming `f(n) = O(g(n))` without being able to produce *some* working `c` and `n₀` is an unverified claim, not a proven one — exactly this curriculum's standing evidence discipline, applied directly to Big-O's own formal definition.

---

## Concept Unit 1: The Problem With Precise Formulas

### The Problem

A real algorithm's exact cost is rarely a clean, single-term formula. `has-duplicate?` (Lesson 69) doesn't cost *exactly* `n²` comparisons — its real cost has multiple contributing terms, constants from list overhead, and so on. Lesson 69's category names ("quadratic") were useful, but imprecise about exactly what's being claimed. It's worth examining a concrete multi-term formula directly, to see what a precise category claim should actually mean.

### No isolated lab for this step

This concept has no code of its own to isolate — the example function is introduced directly below.

### Applying It — A Concrete Multi-Term Function

**A function with three terms, deliberately chosen to resemble a real algorithm's actual cost formula:**

$$f(n) = 3n^2 + 5n + 100$$

**The question this lesson exists to answer precisely:** Lesson 69 would call this "quadratic," because of the `3n²` term. But `f` isn't *only* `n²` — it has a linear term and a constant term too. What does it precisely mean to say `f`'s growth rate is "quadratic," given it isn't literally equal to `n²`?

### Walkthrough

- **`f(n) = 3n² + 5n + 100`** — deliberately not a pure `n²`, chosen specifically to force a precise answer to what "quadratic growth" actually claims about a real, messier formula.
- **The explicit question posed** — sets up exactly what Concept Unit 2's formal definition needs to resolve.

### CS Lens

This is the exact situation every real algorithm's cost analysis actually faces: a real cost formula has multiple terms — some from the main work, some from bookkeeping overhead, some fixed setup cost — and a useful notion of "growth rate" needs to say something precise despite that messiness, not require the formula to be perfectly clean. Also recognized in: a shipping cost formula with a per-item charge, a per-order handling fee, and a fixed base rate, still meaningfully describable as "roughly proportional to order size" despite the extra terms; a construction cost estimate with material costs, labor costs, and fixed permit fees, still meaningfully describable as "roughly proportional to square footage."

### SE Lens

The alternative to precisely defining what "growth rate category" means for a messy, multi-term formula is to keep using Lesson 69's category names loosely, trusting intuition to fill the gap. The real cost of that alternative is exactly the ambiguity this unit surfaces: is `f(n) = 3n² + 5n + 100` "quadratic," or is the `100` "still there," mattering forever, no matter how large `n` gets? Without a precise definition, this question has no checkable answer. Posing it explicitly, as this unit does, motivates Concept Unit 2's formal resolution.

---

## Concept Unit 2: Defining Big-O Precisely

### The Problem

The precise, standard answer to Concept Unit 1's question is Big-O notation. It's worth stating its formal definition directly, in full, rather than only an informal paraphrase.

### No isolated lab for this step

This concept has no code of its own to isolate — the definition is stated directly below.

### Applying It — The Formal Definition

**`f(n) = O(g(n))` means:** there exist constants `c > 0` and `n₀` such that, for every `n ≥ n₀`, `f(n) ≤ c × g(n)`.

**Reading this precisely, clause by clause:** "there exist constants `c` and `n₀`" — some specific numbers must actually be findable, not merely imagined; "for every `n ≥ n₀`" — the bound must hold *forever after* some starting point, not just occasionally; "`f(n) ≤ c × g(n)`" — `f`'s value never exceeds some fixed multiple of `g`'s value, once `n` is large enough.

**Connecting directly to Lesson 70's *asymptotic*:** "for every `n ≥ n₀`" is precisely Lesson 70's asymptotic scope, made formal — a claim about behavior from some point onward, explicitly not a claim about every `n` starting from the beginning.

**Applying this to Concept Unit 1's `f(n) = 3n² + 5n + 100`:** claiming `f(n) = O(n²)` means finding *some* `c` and `n₀` making `f(n) ≤ c × n²` true for every `n ≥ n₀` — not proving it holds for every `n` starting at `1`, and not requiring `c` to be `3` (the leading coefficient) specifically, just *some* constant that works.

### Walkthrough

- **The formal definition, stated in full** — the precise, standard mathematical statement, not an approximation of it.
- **The clause-by-clause reading** — ensures each part of the definition is understood individually before being applied.
- **"Connecting directly to Lesson 70's asymptotic"** — ties this lesson's new formal notation to already-understood vocabulary, rather than presenting it as disconnected new content.

### CS Lens

This is the formal mathematical machinery that makes "quadratic growth" a checkable claim rather than a vague impression — Big-O notation deliberately allows *some* constant multiplier and *some* starting point, which is exactly what makes it robust to the extra terms and constants any real formula accumulates. Also recognized in: a legal contract's precise definition of "material breach," specifying exactly what conditions must hold, rather than leaving the term to informal interpretation; an engineering tolerance specification, stating precisely what range of measurements counts as "acceptable," rather than relying on a vague sense of "close enough."

### SE Lens

The alternative to stating Big-O's formal definition precisely is to keep using it as an informal synonym for "roughly grows like," without ever being able to check a specific claim against specific numbers. The real cost of that alternative is exactly what this curriculum has warned against since Lesson 22 — an unchecked, plausible-sounding claim standing in for a verified one. Stating the definition precisely, as this unit does, is what makes Concept Unit 3's real, computational verification possible at all.

---

## Concept Unit 3: Finding Real Witnesses, Checked Exhaustively

### The Problem

Concept Unit 2's definition requires witness constants to *exist*. It's worth actually finding them for `f(n) = 3n² + 5n + 100`, and checking the resulting bound holds — not just algebraically, but by real, exhaustive computation, following this curriculum's standing evidence discipline.

### The New Code — Type It Yourself

```scheme
(define (f n) (+ (* 3 n n) (* 5 n) 100))

(define (check-bound c n0 nmax)
  (let loop ((n n0))
    (cond ((> n nmax) #t)
          ((> (f n) (* c n n)) (list 'FAILED n))
          (else (loop (+ n 1))))))
```

### The Updated Project

This is `big-o-check.scm`, in full:

```scheme
(define (f n) (+ (* 3 n n) (* 5 n) 100))

(define (check-bound c n0 nmax)
  (let loop ((n n0))
    (cond ((> n nmax) #t)
          ((> (f n) (* c n n)) (list 'FAILED n))
          (else (loop (+ n 1))))))

(display (check-bound 5 9 1000000))
(newline)
```

### Reference Source

Concept Unit 2's definition, translated directly into an exhaustive checker: `check-bound` walks every integer from `n0` to `nmax`, confirming `f(n) ≤ c × n²` at each one, returning `#t` only if every single value passes, or reporting the first failure otherwise — a direct, computational stand-in for "for every `n ≥ n₀`," checked over a large, finite range rather than proven algebraically over an infinite one.

### Files affected

Created: `big-o-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

**First, finding where the bound starts holding, using `f(n)/n²`, which should approach `f`'s leading coefficient, `3`, as `n` grows:**

```
$ guile bigo.scm
n=10 f(n)=450 f(n)/n^2=4.5
n=100 f(n)=30600 f(n)/n^2=3.06
n=1000 f(n)=3005100 f(n)/n^2=3.0051
n=10000 f(n)=300050100 f(n)/n^2=3.000501
n=100000 f(n)=30000500100 f(n)/n^2=3.00005001
n=1000000 f(n)=3000005000100 f(n)/n^2=3.0000050001
```

Verified this session — `f(n)/n²` converges toward `3` exactly (`f`'s leading coefficient) as `n` grows, confirming `f`'s lower-order terms (`5n + 100`) matter less and less, relatively, the larger `n` becomes.

**Confirming `c = 5`, `n₀ = 9` genuinely works, exhaustively, across a million values:**

```
$ guile big-o-check.scm
#t
```

Verified this session — `check-bound 5 9 1000000` returns `#t`: `f(n) ≤ 5n²` holds for *every* integer `n` from `9` through `1,000,000`, with zero exceptions.

**Confirming `n₀ = 9` is genuinely necessary — `n₀ = 8` fails:**

```
$ guile bigo-check3.scm
checking f(n) <= 5n^2 for n=9..1000000 (c=5, n0=9): #t
checking f(n) <= 5n^2 for n=8..1000000 (n0 too small): (FAILED 8)
```

Verified this session — at `n = 8`, `f(8) = 332` and `5 × 8² = 320`: `332 > 320`, so the bound genuinely fails at `n = 8` with `c = 5`, confirming `n₀ = 9` isn't an arbitrary choice, but the real, smallest point (found by checking `f(n)/n²`'s values directly) where this specific bound starts holding.

### Mechanical Walkthrough

- **`(define (f n) (+ (* 3 n n) (* 5 n) 100))`** — a direct translation of `3n² + 5n + 100`.
- **`(check-bound c n0 nmax)`** — walks every integer from `n0` to `nmax`, checking `f(n) ≤ c × n²` (`(* c n n)`) at each one.
- **`((> (f n) (* c n n)) (list 'FAILED n))`** — if the bound is ever violated, report exactly which `n` failed, rather than simply returning `#f` with no explanation.
- **`(else (loop (+ n 1)))`** — otherwise, continue checking the next integer.
- **The real `#t` result across a million values** — direct, exhaustive, computational evidence, not an algebraic proof taken on faith.

### CS Lens

This is a genuine, if partial, verification of a formal mathematical claim by direct computation — checking a million real cases doesn't *prove* the bound holds for every `n` forever (a proper proof would derive it algebraically, confirming `3n² + 5n + 100 ≤ 5n²` reduces to `5n + 100 ≤ 2n²`, true for `n ≥ 9` by direct algebra), but it provides exactly the kind of strong, checkable evidence this curriculum has favored since Lesson 22, complementing rather than replacing the algebraic argument. Also recognized in: a bridge design verified both by structural calculation and by physical load testing at real, though finite, weights; a software function verified both by a correctness proof and by an exhaustive test suite covering every case up to some large, practical bound.

### SE Lens

The alternative to finding real, working witness constants is to assert `f(n) = O(n²)` because the leading term is `n²`, without ever confirming a specific `c` and `n₀` actually work. The real cost of that alternative is exactly the gap between a plausible claim and a verified one — this curriculum's central concern since Lesson 22. Finding actual witnesses, and checking them exhaustively across a million real values, as this unit does, is what turns "this looks quadratic" into a claim backed by genuine, checkable evidence.

---

## Concept Unit 4: Classifying Real Curriculum Algorithms

### The Problem

Big-O notation is now precisely defined and demonstrated on one function. It's worth applying it directly to real procedures this curriculum has already built and measured, connecting the formal notation back to Lesson 69's real evidence.

### No isolated lab for this step

This concept has no code of its own to isolate — the classification is stated directly below, using real evidence already gathered across this curriculum.

### Applying It — A Real Classification Table

| Procedure | Lesson | Big-O | Real evidence |
|---|---|---|---|
| `arithmetic-sum-formula` | 64 | `O(1)` | `0.025` ms whether `n = 10` or `n = 5,000,000` |
| `halving-count` | 67 | `O(log n)` | `+10` steps for every `1,000×` increase in `n` |
| `linear-search` | 68 | `O(n)` | worst-case comparisons equal `n` exactly |
| `has-duplicate?` | 69 | `O(n²)` | doubling `n` roughly quadruples real time |
| `all-subsets` | 51 | `O(2ⁿ)` | `1,024` calls at `n = 10`, `1,048,576` at `n = 20` |
| `permutations` | 58 | `O(n!)` | `2.858` ms at `n = 6`, `15,984.115` ms at `n = 10` |

**Naming what each classification actually claims, precisely, using Concept Unit 2's definition:** `has-duplicate? = O(n²)` means there exist real constants `c` and `n₀` such that `has-duplicate?`'s comparison count never exceeds `c × n²`, for every `n ≥ n₀` — exactly the kind of claim Concept Unit 3 demonstrated how to verify, now understood to underlie every entry in this table, not just the one worked example.

### Walkthrough

- **The table itself** — direct application of this lesson's new precise notation to procedures already real, already built, already measured, rather than to abstract or hypothetical examples.
- **The explicit restatement of what `O(n²)` claims for `has-duplicate?` specifically** — confirms the formal definition from Concept Unit 2 applies identically to every entry in the table, not only to Concept Unit 3's worked `f(n)` example.

### CS Lens

This is Big-O notation doing its actual job: providing one shared, precise vocabulary for comparing algorithms whose exact cost formulas are completely different in their details, letting `arithmetic-sum-formula` and `permutations` be directly, meaningfully compared despite having nothing in common structurally. Also recognized in: a shared grading scale (A through F) letting wildly different assignments — an essay, a lab report, a exam — be compared on one common, understood scale despite being evaluated by completely different criteria underneath.

### SE Lens

The alternative to classifying real, already-built procedures is to leave Big-O notation as something demonstrated only on Concept Unit 3's artificial `f(n)` example, disconnected from anything this curriculum has actually built. The real cost of that alternative is exactly the ungrounded-vocabulary risk this curriculum has avoided since Lesson 1 — Big-O would remain an abstract exercise rather than a tool with obvious, immediate application to code already written and already measured. Building this table directly from real, prior evidence, as this unit does, is what makes Big-O immediately usable, not merely understood in the abstract.

---

## Closing

### Connect the pieces

One formal definition, verified computationally, then applied to real, prior work:

1. **The problem with precise formulas, posed (Unit 1):** `f(n) = 3n² + 5n + 100`, not a pure `n²`, forcing a precise question about what "quadratic" actually claims.
2. **Big-O, defined formally (Unit 2):** `f(n) = O(g(n))` — real constants `c`, `n₀` exist such that `f(n) ≤ c × g(n)` for every `n ≥ n₀` — directly formalizing Lesson 70's *asymptotic*.
3. **Real witnesses, found and exhaustively checked (Unit 3):** `c = 5`, `n₀ = 9`, verified across a full million real values, with `n₀ = 9`'s necessity confirmed by `n₀ = 8`'s real failure.
4. **Real curriculum procedures, classified (Unit 4):** six procedures, six categories, each Big-O claim tied directly to real, already-measured evidence from earlier lessons.

Every claim in this lesson traces to something either algebraically derived and then computationally checked (Concept Unit 3) or directly measured in an earlier lesson (Concept Unit 4) — Big-O notation, formal as it is, is used throughout as a precise *name* for evidence this curriculum already has, not a substitute for gathering that evidence.

### What breaks without this

Suppose two engineers disagreed about whether a piece of code was "efficient enough," one pointing to its informally-described "roughly quadratic" behavior, the other insisting it was "basically linear," with neither able to produce a specific, checkable claim to settle the disagreement. Without Big-O's formal definition, this disagreement has no resolution beyond competing intuitions. With it, the disagreement becomes a concrete, answerable question — find real witness constants `c` and `n₀`, or show none exist — exactly the kind of shift from vague impression to checkable claim this entire lesson has demonstrated on `f(n) = 3n² + 5n + 100`.

### Exercises

1. **Observe.** Choose a function of your own, with at least two terms — for example, `g(n) = 2n³ + 10n`, and state, before checking, what you expect its Big-O classification to be.
2. **Formalize.** Compute `g(n)/n³` (matching your predicted leading term) at several increasing values of `n`, and confirm it converges toward `g`'s leading coefficient, following Concept Unit 3's methodology.
3. **Explain.** Find real witness constants `c` and `n₀` for your Exercise 1 function, and confirm them using `check-bound`, adapted to your function.
4. **Formalize.** Choose one procedure from this curriculum not listed in Concept Unit 4's table, and classify it using Big-O notation, citing real evidence (measured timing or call counts) to support your classification.
5. **Explain.** State, in your own words, why `f(n) = O(n²)` does not mean `f(n) = O(n)` is false to claim as well for very restricted ranges of `n`, but why `O(n²)` is still the more informative, standard classification — referencing Concept Unit 2's definition precisely.

### Definition of done

- [ ] You can state Big-O's formal definition precisely, including all three of its required parts (`c`, `n₀`, and the inequality itself).
- [ ] You can find real witness constants for a given function and verify them computationally.
- [ ] You can explain why Big-O notation formalizes Lesson 70's *asymptotic* scope specifically.
- [ ] You can classify a real, already-built procedure using Big-O notation, citing measured evidence.
- [ ] You completed Exercises 1–5 using a function and procedure not used as this lesson's own examples.
- [ ] Commit your Exercise 2 through 5 findings, with a commit message stating the function you analyzed and the witness constants you found.
