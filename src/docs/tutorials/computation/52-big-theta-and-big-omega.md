# Lesson 52: Big-Theta and Big-Omega

**What you will build**: By the end of this lesson you'll be able to state and prove lower-bound and tight-bound claims about a function's growth, completing the picture Big-O alone only gave one side of — and you'll see a real, concrete case (`bst-contains?`) where the honest answer genuinely differs depending on which of the three notations is used.

**What you need to know first**: Lesson 51's formal Big-O definition and proof technique — this lesson states the two notations that complete it.

**Terms introduced in this lesson**:

- **Big-Omega (Ω)** — a lower bound: `f(n)` is `Ω(g(n))` if there exist positive constants `c` and `n₀` such that `f(n) ≥ c · g(n)` for every `n ≥ n₀`. *Why it matters*: the mirror image of Big-O — where `O` says "grows no faster than," `Ω` says "grows at least as fast as," and a function can need both to be pinned down precisely.
- **Big-Theta (Θ)** — a tight bound: `f(n)` is `Θ(g(n))` if it is both `O(g(n))` and `Ω(g(n))`. *Why it matters*: the strongest of the three claims — "grows *exactly* like `g(n)`, up to constant factors," not merely "no faster than" or "no slower than."

**Objects and methods used**: None new. This lesson extends Lesson 51's formal definitions with two related ones.

---

## Concept Unit: Big-O Alone Doesn't Say Enough

### The Problem

Lesson 51 proved `reverse-naive` is `O(n²)`. Technically, by the formal definition, `reverse-naive` is *also* `O(n³)`, `O(2ⁿ)`, and `O(n!)` — any function that grows at least as fast as `n²` trivially satisfies "grows no faster than" that same, larger bound too. Is `O(n²)` actually the *right*, most informative thing to say about `reverse-naive`, or just *a* true thing?

### Introduce the concept in isolation

Check directly: is `n(n-1)/2` also `O(n³)`? The defining inequality, `n(n-1)/2 ≤ c \cdot n^3`, holds trivially for `c=1`, `n₀=1` — `n³` grows faster than `n²`, so bounding `n(n-1)/2` above by it is easy, and technically correct. But this misses something real: `reverse-naive` doesn't merely grow "no faster than cubically" — it grows genuinely, unavoidably *proportionally to `n²`*, not slower. Big-O alone, being purely an upper bound, can't distinguish "this is exactly quadratic" from "this happens to be bounded above by something cubic" — both are true `O(n³)` statements, but only one is the tight, informative one.

### Discard the throwaway example

Not applicable — this gap is the direct motivation for the next two units.

### Generalizing

An upper bound alone is genuinely useful (Lesson 51's proofs were real, valid claims) but incomplete — a full, precise growth-rate statement needs a lower bound too, ruling out the possibility that the true behavior is actually much *smaller* than the stated bound suggests.

### CS Lells

This is exactly the gap Lesson 12's `total function` and `partial function` vocabulary would call a specification that's technically satisfiable in multiple, meaningfully different ways — `O(n²)` alone under-specifies `reverse-naive`'s actual behavior the same way an unstated domain under-specified a function's actual guarantees there.

### SE Lens

Casual use of Big-O in real engineering discussions sometimes drifts toward implying a tight bound even when only an upper bound has actually been shown — this unit's distinction is exactly what separates "I've proven this is no worse than quadratic" from the stronger, more useful "I've proven this is genuinely quadratic, not better."

---

## Concept Unit: Big-Omega — A Lower Bound

### The Problem

State, precisely, "`reverse-naive` grows *at least* as fast as `n²`" — the missing other half of a complete claim.

### Introduce the concept in isolation

> `f(n)` is **Ω(g(n))** if there exist positive constants `c` and `n₀` such that `f(n) ≥ c · g(n)` for every `n ≥ n₀`.

The mirror image of Big-O's definition, with the inequality reversed. Prove `n(n-1)/2` is `Ω(n²)`:

**Claim:** `n(n-1)/2 ≥ c · n²` for some `c` and all `n ≥ n₀`.

**Proof:** For `n ≥ 2`, `n - 1 ≥ n/2` (check: at `n=2`, `n-1=1` and `n/2=1`, equal; for larger `n`, `n-1` grows faster than `n/2`, so the inequality only strengthens). So `n(n-1)/2 ≥ n \cdot (n/2) / 2 = n^2/4`. Choosing `c = 1/4` and `n₀ = 2` satisfies the definition for every `n ≥ 2`.

`n(n-1)/2` is both `O(n²)` (Lesson 51) and `Ω(n²)` — bounded above *and* below by a constant multiple of `n²`, which is exactly what the next unit names directly.

### Discard the throwaway example

Not applicable — this is a complete, formal proof, paired directly with Lesson 51's own.

### Formal Definition, Walked Through

- *"f(n) ≥ c · g(n)"* — the inequality flipped from Big-O's — this is a floor, not a ceiling: `f` grows *at least* this fast, ruling out the possibility that `f`'s true behavior is actually much smaller.
- Big-Omega alone has the identical, opposite incompleteness Concept Unit 1 found in Big-O alone: `reverse-naive` is trivially `Ω(1)` and `Ω(log n)` too (it certainly grows *at least* as fast as those slower categories) — a lower bound alone doesn't rule out the function actually growing much *faster* than stated, either.

### CS Lells

Big-Omega is the exact tool Lesson 261's *halting problem*, much later, uses in spirit: proving a lower bound on a problem's inherent difficulty (not just describing one particular algorithm's cost) is a genuinely different, often harder kind of claim than proving an upper bound — showing *some* algorithm is fast is easier than showing *no* algorithm could possibly be faster.

### SE Lens

A real capacity-planning claim like "this will take at least a second" needs Big-Omega's shape of reasoning, not Big-O's — an upper bound alone ("no more than a second") says nothing about whether it might actually run in a millisecond, information that matters just as much for planning purposes.

### Connection to the previous unit

The previous unit identified that Big-O alone leaves room for a function to secretly grow much slower than its stated bound; this unit supplies the missing lower-bound half, ruling that possibility out directly.

---

## Concept Unit: Big-Theta — A Tight Bound

### The Problem

`reverse-naive` is now known to be both `O(n²)` and `Ω(n²)`. Is there a single notation that states both facts together — "grows *exactly* like `n²`," not merely bounded above and separately bounded below?

### Introduce the concept in isolation

> `f(n)` is **Θ(g(n))** if `f(n)` is both `O(g(n))` and `Ω(g(n))`.

`n(n-1)/2` is `Θ(n²)`, directly from the two proofs already completed in this lesson — no new proof needed, just the combination of both already-established facts. This is the strongest, most informative of the three claims: not "no faster than," not "no slower than," but "genuinely, provably, this exact growth rate."

Contrast this with a case where the honest answer genuinely differs: `bst-contains?` (Lesson 32). In the *worst* case (searching for a value not present, following one path all the way to an empty subtree), it examines about `log2(n)` nodes — `O(log n)`. But in the *best* case (the very first node checked happens to be the target), it examines exactly `1` node, regardless of how large the tree is — `Ω(1)`, not `Ω(log n)`. `bst-contains?`, considered honestly across all possible inputs, is *not* `Θ(log n)` — its best and worst cases have genuinely different growth rates, and no single tight bound describes both.

### Discard the throwaway example

Not applicable — this is a real, honest distinction this lesson's own vocabulary makes precise.

### CS Lells

This exact gap — worst case versus best case versus "typical" case — is why algorithm descriptions frequently specify *which* case a Big-O or Big-Theta claim refers to: "`bst-contains?` is `O(log n)` in the worst case" is a complete, honest statement; "`bst-contains?` is `Θ(log n)`," stated without qualification, would be overclaiming a tightness the function doesn't actually have across every possible input.

### SE Lens

Recognizing when a function genuinely has a single tight bound (`reverse-naive`, `Θ(n²)`, true for every input of a given size, not just some) versus when it doesn't (`bst-contains?`, wildly different behavior depending on the specific input, not just its size) is real, honest engineering communication — claiming a tight bound a function doesn't actually have is a specific, checkable overclaim, exactly the kind of imprecision this series has tried to eliminate since Lesson 1's very first insistence on stating things precisely.

### Connection to the previous unit

The previous unit proved a lower bound to pair with Lesson 51's upper bound; this unit names the combination directly, and immediately finds a real, honest case — `bst-contains?` — where the combination *doesn't* apply cleanly, precisely because best-case and worst-case behavior genuinely differ.

---

## Connect the Pieces

`reverse-naive`'s complete, three-notation classification, next to `bst-contains?`'s honest, case-dependent one:

| | Upper bound (O) | Lower bound (Ω) | Tight bound (Θ) |
|---|---|---|---|
| `reverse-naive` | `O(n²)` — proven, Lesson 51 | `Ω(n²)` — proven, this lesson | `Θ(n²)` — both hold, for every input |
| `bst-contains?` | `O(log n)` — worst case | `Ω(1)` — best case | **No single Θ** — best and worst genuinely differ |

`reverse-naive` earns a clean `Θ(n²)` because its cost is essentially the same, up to small variation, for *every* input of a given length — there's no lucky or unlucky case that changes its growth rate category. `bst-contains?` doesn't get that clean a classification, honestly, because a lucky search (the target is near the root) and an unlucky one (the target is deep, or absent) genuinely differ in growth rate — and stating this precisely, rather than picking whichever bound sounds better, is exactly the discipline this lesson's three notations exist to enforce.

## What Breaks Without This

Suppose `bst-contains?` were described, casually, as "`Θ(log n)`" without qualification, and a system were designed around the assumption that *every* lookup takes roughly `log n` time. The best-case lookups (a target near the root) would perform better than expected — a pleasant surprise, and no real problem. But if the system's *design* silently depended on lookups never being faster or slower than `log n` — say, a load-balancing scheme that assumed uniform lookup cost across all requests — the worst-case inputs (an unlucky search reaching all the way to an empty subtree, or a search for an absent value) would violate that assumption, potentially causing real problems the "Θ(log n)" label had quietly promised wouldn't happen. Stating "O(log n) worst case, Ω(1) best case" instead — the honest, complete picture this lesson insists on — would have made that variability visible from the start, rather than hidden behind an overclaimed tight bound.

## Exercises

1. **Trace.** Prove `2n + 5` is `Ω(n)`, exhibiting specific constants `c` and `n₀`, completing Lesson 51 Exercise 1's `O(n)` proof into a full `Θ(n)` classification.
2. **Predict.** Before checking, predict whether `sum-to` has a single, clean `Θ(n)` classification (like `reverse-naive`'s `Θ(n²)`) or a case-dependent one (like `bst-contains?`'s). Justify your answer by considering whether `sum-to`'s cost varies at all across different inputs of the same size.
3. **Classify.** State the best-case and worst-case Big-O for `find-subset-sum` (Lesson 33), considering how pruning can make some inputs finish much faster than others of the same list length.
4. **Break it, on purpose.** Attempt to prove `n` is `Ω(n²)` — try to find valid constants, and explain concretely why none can exist (connect this to Lesson 51 Exercise 4's mirror-image failure).
5. **Generalize.** Is naive `fib`'s cost the same for every input of a given `n`, or does it vary the way `bst-contains?`'s does? Justify your answer using Lesson 23's evaluation tree — does the *shape* of `fib(n)`'s tree ever change for a fixed `n`?
6. **Reconstruct.** Close this lesson. From memory, state all three formal definitions (O, Ω, Θ), and explain, using `bst-contains?`, why a function can have a clean Big-O without having a clean Big-Theta.

## Definition of Done

- [ ] You can state and prove a Big-Omega claim with explicit constants.
- [ ] You can state when a function has a single tight Θ bound versus when best-case and worst-case genuinely differ.
- [ ] You completed Exercise 3 and can state `find-subset-sum`'s best-case and worst-case behavior separately.
- [ ] You can explain, using a concrete example, why overclaiming a tight bound a function doesn't actually have is a real, checkable mistake.
- [ ] Commit your Exercise 1 and Exercise 3 work to your notes repository, with a commit message stating each classification precisely — for example, `"Prove 2n+5 is Theta(n); classify find-subset-sum as O(2^n) worst case, Omega(n) best case when the first branch prunes immediately"` — not just `"lesson 52 exercise"`.

---

**Next lesson:** Lesson 53, *Amortized Analysis*, addresses a case none of this lesson's three notations directly handles well on their own — an operation that's occasionally expensive but cheap on average across a whole sequence of uses — using `reverse-acc`'s own accumulator pattern as a stepping stone into the technique.
