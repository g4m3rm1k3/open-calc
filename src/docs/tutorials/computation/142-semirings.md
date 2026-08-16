# Lesson 142: Semirings

**What you will build**: By the end of this lesson you'll define a structure with *two* monoid-like operations at once — a "combine" and a "score," each with its own identity — and prove that Lesson 130's Dijkstra `relax` step is exactly one instance of it, using `min` and `+` in place of ordinary addition and multiplication. That structure is a **semiring**, and recognizing it is what lets a single algorithmic shape answer shortest-path questions, reachability questions, and dynamic-programming questions alike, depending only on which two operations fill the two slots.

**What you need to know first**: Lesson 141's monoid (closure, associativity, identity); Lesson 130's `relax` and its `999999` "infinity" sentinel; Lesson 119's dynamic-programming recipe (state, transition, base case).

**Terms introduced in this lesson**:

- **semiring** — a set with two binary operations, conventionally written `\oplus` ("add") and `\otimes` ("multiply"), where `(set, \oplus)` is a monoid with identity `0_{\oplus}`, `(set, \otimes)` is a monoid with identity `1_{\otimes}`, and `\otimes` **distributes** over `\oplus`. *Why it matters*: two monoids working together, not one — exactly the shape underneath both a shortest-path relaxation step and a dynamic-programming transition, made visible by naming it once instead of re-deriving it for each algorithm separately.
- **distributivity** — the requirement that `a \otimes (b \oplus c)` always equals `(a \otimes b) \oplus (a \otimes c)` — multiplying across a sum gives the same answer as multiplying each term first and summing after. *Why it matters*: the one property connecting the two operations to each other, rather than each being independently well-behaved on its own; without it, `\oplus` and `\otimes` would just be two unrelated monoids sharing a set, not a single coherent structure.

**Objects and methods used**: None new. This lesson reuses `min` (Lesson 111's own minimum-finding), `+` (Lesson 2), and `get` (Lesson 84), each already covered.

---

## Concept Unit: Two Operations, Two Identities — the Min-Plus Semiring

### The Problem

Lesson 130's `relax` combines two numbers with `+` (a path's total weight so far, plus one more edge) and separately picks the smaller of two candidates with an implicit `<` comparison. Are `+` and "pick the smaller" secretly the same *kind* of pairing Lesson 141's monoid already named — two operations, each with their own identity, working side by side?

### Introduce the concept in isolation

```clojure
(def infinity 999999)
(defn sr-add [a b] (min a b))
(defn sr-mult [a b] (+ a b))
```

```
user=> (sr-add infinity 7)
7
user=> (sr-add 7 infinity)
7
user=> (sr-mult 0 7)
7
user=> (sr-mult 7 0)
7
```

`sr-add` is `min` — Lesson 111's own minimum-finding, renamed to make its role explicit here. Its identity is `infinity` (Lesson 130's own `999999` sentinel): `\min(\infty, x)` is always `x`, since nothing is smaller than infinity by definition. `sr-mult` is ordinary `+`; its identity is `0`, exactly as it was for plain addition back in Lesson 140. Two different monoids — `(numbers, \min, \infty)` and `(numbers, +, 0)` — sharing the identical underlying set of numbers.

### Discard the throwaway example

Not applicable — `sr-add` and `sr-mult` are real, reusable, and verified against both identities directly.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch renaming of already-taught operations (`min`, `+`) to make their shared structural role explicit.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn sr-add [a b] (min a b))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(min a b)`**, wrapped as `sr-add` — reappearing `min` (Lesson 111), given a new name here specifically to line it up against `sr-mult`, not because its behavior changed at all.
- **`(+ a b)`**, wrapped as `sr-mult` — reappearing `+` (Lesson 2), renamed for the identical reason.
- **`infinity`**, bound to `999999` — reappearing sentinel value (Lesson 130), now understood precisely as `sr-add`'s own identity element, not just "a very large placeholder number."

### CS Lens

`(numbers \cup \{\infty\}, \min, +)` is a real, named structure: the **tropical semiring** (also called min-plus). Also recognized in: `(booleans, \lor, \land)`, the **Boolean semiring**, used for reachability questions ("can you get from `A` to `B` at all," rather than "how cheaply"); `(numbers, +, \times)`, ordinary arithmetic, the semiring this lesson's own vocabulary was borrowed from in the first place.

### SE Lens

Naming `min` and `+` as `sr-add`/`sr-mult` here is purely for exposition — the real payoff isn't the rename itself, it's that any algorithm written generically against "a semiring's two operations" would work unmodified on the Boolean semiring, or ordinary arithmetic, or this lesson's min-plus version, just by swapping which two functions fill the two slots — the identical reuse argument Lesson 141 made for monoids, now for a structure built from two of them at once.

---

## Concept Unit: Distributivity — the Property That Connects Them

### The Problem

Lesson 141 required each operation to be individually well-behaved (closed, associative, with an identity). Is that enough to call `sr-add` and `sr-mult` a single coherent structure, or is there a real connection required *between* them, not just within each one separately?

### Introduce the concept in isolation

```
user=> (sr-mult 3 (sr-add 5 8))
8
user=> (sr-add (sr-mult 3 5) (sr-mult 3 8))
8
```

`3 \otimes (5 \oplus 8)` — that is, `3 + \min(5, 8)` — equals `8`. Computed the other way, `(3 \otimes 5) \oplus (3 \otimes 8)` — `\min(3+5, 3+8)` — also equals `8`. Multiplying across the smaller-of-two gives the identical answer as multiplying each candidate first and taking the smaller result afterward. This is called **distributivity**: `a \otimes (b \oplus c)` always equals `(a \otimes b) \oplus (a \otimes c)`, checked here on one real triple, true in general for `\min` and `+` over real numbers.

### Discard the throwaway example

Not applicable — real, verified output confirming both sides of distributivity agree.

### Project Change

- **Reference Source**: No reference counterpart — direct verification of an algebraic property already known to hold for `min`/`+` over the reals.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit verifies a property of existing operations rather than building a new function.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(sr-mult 3 (sr-add 5 8))`** — first appearance of distributivity's left-hand shape: `\otimes` applied *outside* an `\oplus`.
- **`(sr-add (sr-mult 3 5) (sr-mult 3 8))`** — the right-hand shape: `\otimes` applied *inside*, to each term separately, then combined with `\oplus` afterward — compared directly against the left-hand result.

### CS Lens

Distributivity is precisely what makes "multiply across a choice" and "choose after multiplying each option" interchangeable — the exact freedom Lesson 130's Dijkstra relies on when it computes a candidate distance (`\otimes`, adding one edge) and then compares it against the current best (`\oplus`, taking the smaller): nothing would guarantee that order doesn't matter without this property holding.

### SE Lens

A structure with two operations but no distributivity between them would still let each operation be used separately, safely — but it would forbid combining them the way Dijkstra's `relax` actually does, in one expression, with any confidence the result means what it's supposed to. Distributivity is the specific, checkable reason mixing `\oplus` and `\otimes` together in one formula is safe, not merely convenient-looking.

### Connection to the previous unit

The previous unit set up two separate, individually well-behaved operations; this unit is the one additional property that turns "two monoids sharing a set" into a single coherent semiring.

---

## Concept Unit: `relax` Was a Semiring Operation All Along

### The Problem

Lesson 130's `relax` was written as a plain `if`-comparison, with no mention of algebra anywhere in it. Is it really doing exactly what `sr-add`/`sr-mult`, combined, already do — provably, not just by resemblance?

### Introduce the concept in isolation

```clojure
(defn relax-sr [dist u v weight]
  (sr-add (get dist v) (sr-mult (get dist u) weight)))

(defn relax-plain [dist u v w]
  (if (< (+ (get dist u) w) (get dist v))
    (+ (get dist u) w)
    (get dist v)))
```

```
user=> (def dist [0 infinity infinity])
user=> (relax-sr dist 0 1 4)
4
user=> (relax-plain dist 0 1 4)
4
```

Both return `4`, on this call and — since `sr-add` is `min` and `sr-mult` is `+`, exactly matching `relax-plain`'s own `<`-then-`+` logic — on every possible call. `relax-sr dist u v weight` reads as pure semiring vocabulary: the new best distance to `v` is `dist[v]` **added** (`sr-add`, i.e. `\min`) to `dist[u]` **multiplied** (`sr-mult`, i.e. `+`) by the edge weight. `relax-plain` is Lesson 130's own function, unchanged, still written as a plain comparison — the same computation, in two different vocabularies, agreeing exactly.

### Discard the throwaway example

Not applicable — both functions are real, and their agreement was checked directly, not assumed from resemblance.

### Project Change

- **Reference Source**: Lesson 130's own `relax`, restated here as `relax-plain` to compare directly against this unit's `relax-sr` — same logic, unchanged, no modification made to Lesson 130 itself.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn relax-sr [dist u v weight]
  (sr-add (get dist v) (sr-mult (get dist u) weight)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(sr-mult (get dist u) weight)`** — reappearing `sr-mult` (this lesson's first unit): the candidate distance through `u`, computed by "multiplying" `u`'s own current distance by the edge weight — ordinary addition, under this lesson's semiring vocabulary.
- **`(sr-add (get dist v) ...)`** — reappearing `sr-add`: "adds" `v`'s current distance to that candidate — ordinary `min`, choosing whichever is smaller.
- **`relax-plain`** — reappearing (Lesson 130, restated verbatim): the identical computation, still written the original way, to confirm the semiring version isn't a different algorithm wearing new notation.

### CS Lens

Dijkstra's algorithm, in full generality, is "repeatedly apply a semiring's `\otimes` then `\oplus`" over any semiring at all, not only min-plus — swap in the Boolean semiring's `\lor`/`\land` and the identical algorithmic shape answers "is there *any* path from source to `v`" instead of "what's the *cheapest* path," with no change to the surrounding search structure, only which two operations fill `relax`'s two slots.

### SE Lens

Rewriting `relax` in semiring vocabulary isn't proposed as a replacement for Lesson 130's own clear, direct `if`-based version — `relax-plain` stays exactly as readable as it always was. The real value is recognizing the *pattern*, so that the next problem needing "combine along a path, then pick the best among competing paths" doesn't require re-deriving relaxation from scratch, the way Lesson 130 itself had to — it requires only naming the right two operations for a semiring already understood in general.

### Connection to the previous unit

The previous unit proved `sr-add` and `sr-mult` connect through distributivity, in the abstract; this unit shows that connection is exactly what Lesson 130's `relax` was already using, concretely, lesson before this one ever named it.

---

## Connect the Pieces

The full semiring, its defining property, and the algorithm it was hiding inside, together:

```clojure
(println "sr-add identity holds:" (= (sr-add infinity 7) 7))
(println "sr-mult identity holds:" (= (sr-mult 0 7) 7))
(println "distributivity holds:" (= (sr-mult 3 (sr-add 5 8)) (sr-add (sr-mult 3 5) (sr-mult 3 8))))
(println "relax-sr matches relax-plain:" (= (relax-sr dist 0 1 4) (relax-plain dist 0 1 4)))
```

```
sr-add identity holds: true
sr-mult identity holds: true
distributivity holds: true
relax-sr matches relax-plain: true
```

Every one of Lesson 130's `relax` calls, across the entire run of Dijkstra's algorithm, was always exactly this: two semiring operations, an identity each, connected by distributivity — a fact true the whole time, only made visible now.

## What Breaks Without This

Suppose someone tried to build a "cheapest-path" algorithm using an operation pair that isn't actually a semiring — say, `\oplus = \min` paired with `\otimes = -` (subtraction) instead of `+`. Subtraction was already proven non-associative and non-distributive-in-general back in Lessons 140 and this lesson's own second unit's spirit — a relaxation step built on it would not reliably compute "cheapest path," because the order edges get relaxed in could change the final answer, the exact guarantee distributivity and associativity together are what provide. Recognizing whether a candidate operation pair genuinely forms a semiring *before* building an algorithm on top of it is what separates "this happens to work on my test graph" from "this is guaranteed correct on any graph," the same distinction Lesson 140's own closing warned about for monoids.

## Exercises

1. **Trace.** By hand, confirm `(relax-sr [0 999999 999999] 0 1 4)` and `(relax-plain [0 999999 999999] 0 1 4)` both compute `4`, using each function's own definition directly.
2. **Predict.** Before checking, predict whether `(numbers, \max, +)` — maximum instead of minimum — is also a valid semiring, and what its `\oplus` identity would need to be. Then verify the identity holds.
3. **Verify.** Confirm distributivity holds for a *second* real triple of your own choosing, different from this lesson's `3, 5, 8`.
4. **Break it, on purpose.** Try `sr-mult` as `-` instead of `+`, and find a real triple where `(sr-mult a (sr-add b c))` does *not* equal `(sr-add (sr-mult a b) (sr-mult a c))`, showing distributivity genuinely fails.
5. **Generalize.** Describe, without coding it, what the Boolean semiring's own `relax`-equivalent would compute, using `\lor` in place of `sr-add` and `\land` in place of `sr-mult`.
6. **Reconstruct.** Close this lesson. From memory, explain why `relax-sr` and `relax-plain` are guaranteed to agree on every input, not just the one this lesson happened to check.

## Definition of Done

- [ ] You can define a semiring as two monoids connected by distributivity, and name each operation's own identity.
- [ ] You can explain why Lesson 130's `relax` is a semiring operation using `min` and `+`.
- [ ] You completed Exercise 2 and verified whether `(numbers, max, +)` is a genuine semiring.
- [ ] You completed Exercise 4 and found a real counterexample showing `-` fails distributivity.
- [ ] Commit your Exercise 2 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm max/+ forms a semiring with identity -infinity; find a-(b+c) counterexample breaking distributivity for subtraction"` — not just `"lesson 142 exercise"`.

---

**Next lesson:** Lesson 143, *Groups*, returns to Lesson 140's full four properties — adding inverses back in — and shows what real structure that fourth property alone unlocks: symmetry, and operations that can always be undone.
