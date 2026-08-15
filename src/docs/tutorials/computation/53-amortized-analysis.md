# Lesson 53: Amortized Analysis

**What you will build**: By the end of this lesson you'll be able to analyze an operation whose worst-case cost looks bad in isolation, but is actually cheap *on average* across a real sequence of uses — proving this precisely, using nothing but Lesson 47's geometric series, on a binary counter whose increment operation occasionally cascades expensively but almost never does.

**What you need to know first**: Lesson 51 and 52's worst-case Big-O vocabulary, and Lesson 47's geometric series formula — this lesson's core proof is a direct application of it.

**Terms introduced in this lesson**:

- **amortized cost** — the average cost per operation across a sequence of operations, computed as total cost divided by the number of operations, even when individual operations vary widely in cost. *Why it matters*: distinguishes "this specific operation might occasionally be expensive" from "this operation, averaged honestly over a real sequence of uses, is actually cheap" — a genuinely different and often more useful question than a single worst-case bound alone answers.

**Objects and methods used**: None new. This lesson analyzes a new function built entirely from `if`, `=`, `empty?`, `first`, `rest`, and `cons`, all already covered.

---

## Concept Unit: An Operation That's Occasionally Expensive

### The Problem

Represent a non-negative integer as a list of binary digits, least-significant bit first — `(1 1 1)` means `1 + 2 + 4 = 7`. Incrementing such a counter sometimes changes only one bit, and sometimes cascades through several. Is there a real, worst-case cost to this operation, and how bad can it get?

### Introduce the concept in isolation

```clojure
(defn increment-binary [bits]
  (if (empty? bits)
    (list 1)
    (if (= (first bits) 0)
      (cons 1 (rest bits))
      (cons 0 (increment-binary (rest bits))))))
```

```
user=> (increment-binary (list 1 1 1))
(0 0 0 1)
```

`(1 1 1)` is `7`; the result, `(0 0 0 1)`, is `8` — correct. But look at what happened: every single bit flipped. `increment-binary`'s recursive case only stops immediately when it finds a `0` to flip to `1`; a run of `1`s all the way through forces a "carry" at every position, each one a recursive call, each one flipping a bit. For a counter with `k` bits, incrementing a value like `111...1` (all ones) costs `k` operations — proportional to the number of bits, which is itself `O(log n)` for a counter representing values up to `n` (Lesson 43's own logarithm-from-halving relationship, in reverse: `k` bits represent values up to `2^k`, so `k = log2(n)`).

### Discard the throwaway example

Not applicable — `increment-binary` is a real function, and its worst case is genuinely as bad as just described.

### Project Change

- **Reference Source**: No reference counterpart — a direct implementation of binary increment-with-carry.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn increment-binary [bits]
  (if (empty? bits)
    (list 1)
    (if (= (first bits) 0)
      (cons 1 (rest bits))
      (cons 0 (increment-binary (rest bits))))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(if (= (first bits) 0) (cons 1 (rest bits)) ...)`** — the "no carry needed" case: a `0` at the current position simply becomes `1`, and nothing beyond it needs to change.
- **`(cons 0 (increment-binary (rest bits)))`** — the "carry" case: a `1` at the current position becomes `0`, and the increment continues recursively into the remaining, more-significant bits — this is the recursive call that can chain through many positions in a row.

### CS Lens

A worst-case-`O(log n)` claim about `increment-binary`, considered in isolation, is entirely accurate — Lesson 52's own vocabulary would call this its worst-case Big-O. But this claim, by itself, doesn't say anything about what happens if `increment-binary` is called *repeatedly*, in sequence, counting up from `0` — the actual, realistic way a counter gets used.

### SE Lells

If a system incremented this counter a million times and each increment genuinely cost `O(log n))` in the worst case, a naive estimate might multiply — a million increments times `log(million) ≈ 20` bit-flips each, roughly twenty million total operations. The next unit shows this estimate is wildly, provably too pessimistic.

---

## Concept Unit: The Amortized Argument — Summing the Total Cost Over a Sequence

### The Problem

Trace incrementing a counter from `0` up through `7` (three bits), counting the actual number of bit flips at every single step, and compare the *total* to the naive "worst case times number of operations" estimate.

### Introduce the concept in isolation

```
0 = 000                              (start)
0 → 1:  001    — 1 flip (bit 0)
1 → 2:  010    — 2 flips (bit 0, bit 1)
2 → 3:  011    — 1 flip (bit 0)
3 → 4:  100    — 3 flips (bit 0, bit 1, bit 2)
4 → 5:  101    — 1 flip (bit 0)
5 → 6:  110    — 2 flips (bit 0, bit 1)
6 → 7:  111    — 1 flip (bit 0)
```

Total flips across all seven increments: `1+2+1+3+1+2+1 = 11` — not `7 × 3 = 21` (seven increments times the three-bit worst case), a real, substantial difference.

The pattern behind this: bit `0` (the ones place) flips on *every* increment — `7` times, once per increment. Bit `1` flips only every *other* increment (whenever the ones place carries) — `3` or `4` times. Bit `2` flips only every *fourth* increment — once or twice. In general, bit `i` flips once every `2^i` increments. Summed across `n` total increments, the total flip count is:

> **n/1 + n/2 + n/4 + n/8 + ... = n × (1 + 1/2 + 1/4 + ...)**

The bracketed sum is exactly Lesson 47's geometric series, with ratio `1/2` — and a geometric series with ratio less than `1` converges: `1 + 1/2 + 1/4 + ... < 2` (it approaches, but never reaches, exactly `2`). So the total number of bit flips across `n` increments is **less than `2n`** — proportional to `n` itself, not to `n × log(n)` the naive worst-case-times-count estimate suggested.

### Discard the throwaway example

Not applicable — this is the actual, complete proof, verified against the concrete seven-increment trace above.

### CS Lells

This is Lesson 47's geometric series doing genuinely new work: not counting a tree's nodes this time, but proving a real, useful bound on a sequence of operations — the identical formula, a different, equally valid application.

### SE Lells

The naive "worst case times count" estimate over-counts specifically because it assumes *every* increment triggers the full worst-case cascade, when in reality, most increments (bit `0` flipping alone) are extremely cheap, and only a rapidly-shrinking fraction of increments ever trigger a deep cascade — exactly the geometric shrinkage this unit's sum captures.

### Connection to the previous unit

The previous unit established a real, worst-case cost for one increment in isolation; this unit sums that cost honestly across a whole sequence of increments, and finds the total is far smaller than a naive multiplication would predict.

---

## Concept Unit: Amortized Cost — Dividing Total by Count

### The Problem

State the actual, per-operation cost this sequence's behavior implies — not the worst case of any single operation, but the honest average across the whole sequence.

### Introduce the concept in isolation

> **Amortized cost = total cost across a sequence ÷ number of operations in that sequence.**

From the previous unit: total cost across `n` increments is less than `2n`. Dividing by `n`:

> **Amortized cost per increment < 2n / n = 2** — a constant, **O(1)**, regardless of how large `n` gets.

This is a genuinely different, and stronger, claim than "worst case is `O(log n)`": any *single* increment can still occasionally cost up to `log(n)` bit flips (the worst-case claim from Concept Unit 1 remains completely true) — but *averaged* over any real sequence of increments starting from `0`, the cost per increment never exceeds a small constant, because the expensive cascades become proportionally rarer exactly as fast as they become more expensive, and the geometric series proof shows those two trends exactly balance out.

### Discard the throwaway example

Not applicable — this conclusion is the direct, proven consequence of the previous unit's sum.

### Formal Definition, Walked Through

- *"total cost across a sequence ÷ number of operations"* — this is explicitly a claim about a *sequence* of operations starting from a known state (here, `0`), not a claim about any single operation examined in isolation — the same distinction Lesson 52 drew between a function's behavior on one specific input versus across all inputs of a given size.
- Amortized analysis doesn't contradict worst-case analysis — both are true, simultaneously, about the identical function: `increment-binary` really can cost `O(log n)` on one unlucky call, and really does cost `O(1)` on average across a realistic sequence — two honest, precise, non-conflicting claims about two different questions.

### CS Lells

This exact technique — occasional expensive operations, provably rare enough that the average stays cheap — is the standard justification behind a dynamic array's "doubling" resize strategy (each resize is expensive, but resizes become exponentially rarer as the array grows, giving `O(1)` amortized insertion) and several of Section V's more advanced data structures, all using the identical geometric-series-based argument this lesson just applied to a binary counter.

### SE Lells

Amortized analysis is what justifies choosing a data structure or algorithm based on its *typical, sustained* behavior rather than its worst single operation — a real, common engineering tradeoff: accepting an occasional slower operation in exchange for excellent average throughput across the realistic pattern of use a system will actually see.

### Connection to the previous unit

The previous unit computed a real total cost across a concrete sequence; this unit divides that total by the sequence length, producing the formal amortized-cost claim — the actual payoff this lesson has been building toward from its first paragraph.

---

## Connect the Pieces

The full argument, connecting worst-case, amortized, and the geometric series that bridges them, traced directly from code already run in this lesson:

```clojure
(println "7 -> 8, via (1 1 1):" (increment-binary (list 1 1 1)))
(println "6 -> 7, via (0 1 1):" (increment-binary (list 0 1 1)))
```

```
7 -> 8, via (1 1 1): (0 0 0 1)
6 -> 7, via (0 1 1): (1 1 1)
```

The first call flips all three bits — the worst case for a three-bit counter, `O(log n)`, confirmed directly (Concept Unit 1). The second flips exactly one — `(0 1 1)` is `6`; its lowest bit is already `0`, so it flips straight to `1` and stops immediately, no carry at all. Concept Unit 2's hand-traced sequence from `0` through `7` showed calls like the second kind (cheap) vastly outnumber calls like the first kind (expensive), specifically in the ratio a geometric series predicts — bit `i` costing a flip only once every `2^i` calls — which is exactly what kept the seven-increment total at `11`, not `21`. Total cost across `n` increments starting from `0` stays under `2n` (Concept Unit 2); amortized cost per increment is therefore `O(1)` (Concept Unit 3, `2n/n < 2`). All three claims are true simultaneously, about the identical function — the difference is entirely in *which question* each one answers: one operation's worst case, or a whole sequence's honest average.

## What Breaks Without This

Suppose a system were designed assuming `increment-binary`'s *worst-case* cost applied to *every single* increment in a long-running counter — reserving, say, `log(n)` units of processing time per increment, for every increment, to be safe. This isn't wrong, exactly — it would never be caught off guard by a slow increment — but it would be wildly over-provisioned, reserving far more capacity than the sequence actually needs on average, based on a worst-case bound that Concept Unit 2's own proof shows essentially never actually occurs at that rate. The opposite mistake — assuming every increment costs the *amortized* `O(1)` — would be genuinely wrong in a different way: a single unlucky increment really can cost `O(log n))`, and a system that can't tolerate even one occasionally-slower operation (a hard real-time deadline, say) needs the worst-case bound, not the amortized one, for that specific guarantee. Knowing which of the two questions a given engineering requirement actually needs answered is the real, practical payoff of keeping both notions precise and distinct.

## Exercises

1. **Trace.** Continue this lesson's flip-counting trace from `7` (`111`) through `15` (`1111`), and confirm the running total stays under `2n` for `n` up to `15`.
2. **Predict.** Before computing it, predict roughly how many total bit flips `1000` increments (starting from `0`) would cost, using the `< 2n` bound. Compare this to the naive "worst case times count" estimate using `log2(1000) ≈ 10`.
3. **Verify.** Confirm `(increment-binary (list 0 1 1))` (representing `6`) flips only `1` bit, matching this lesson's pattern that most increments are cheap.
4. **Break it, on purpose.** Construct a sequence of increments that does *not* start from `0` — say, starting already at `(1 1 1 1 1 1 1 1)` (eight ones) — and explain whether the `< 2n` amortized bound still applies to a sequence that starts partway through, or whether the proof's assumptions have been violated.
5. **Generalize.** `reverse-acc`'s constant-time `cons` versus `reverse-naive`'s `my-append`-per-call (Lesson 28) already showed a related idea. Is `reverse-naive`'s `O(n²)` cost improved by amortized analysis across a *sequence* of separate `reverse-naive` calls on unrelated lists, or does amortization only help when a single, evolving structure (like this lesson's counter) is repeatedly operated on? Justify your answer.
6. **Reconstruct.** Close this lesson. From memory, explain why `increment-binary`'s worst case is `O(log n)` but its amortized cost is `O(1)`, using the geometric series argument directly.

## Definition of Done

- [ ] You can state `increment-binary`'s worst-case cost and its amortized cost, and explain why both are simultaneously true.
- [ ] You can reproduce the geometric-series-based amortized proof from memory.
- [ ] You completed Exercise 4 and can explain whether amortized analysis requires starting from a specific known state.
- [ ] You completed Exercise 5 and can explain why amortization applies to a sequence of related operations on an evolving structure, not to unrelated calls.
- [ ] Commit your Exercise 1 and Exercise 5 findings to your notes repository, with a commit message stating the concrete totals you verified — for example, `"Extend flip-count trace to n=15, total stays under 2n=30; confirm amortization doesn't apply across unrelated reverse-naive calls, only within one evolving sequence"` — not just `"lesson 53 exercise"`.

---

**Next lesson:** Lesson 54, *Modular Arithmetic*, shifts from analyzing cost back to number theory — building arithmetic modulo `n` from equivalence classes, the mathematical foundation Section III's closing lessons (GCD, primes) both depend on directly.
