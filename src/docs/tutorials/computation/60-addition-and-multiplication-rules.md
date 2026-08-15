# Lesson 60: Addition and Multiplication Rules

**What you will build**: By the end of this lesson you'll have the second of the two basic counting rules — for combining *alternative* choices rather than *sequential* ones — and you'll be able to combine both rules correctly on a single problem, while recognizing precisely when the addition rule's own requirement (no overlap between the alternatives) actually matters.

**What you need to know first**: The previous lesson's fundamental counting principle (multiplication), and Lesson 17's proof by cases, whose "exhaustive, non-overlapping" requirement this lesson's addition rule needs in exactly the same form.

**Terms introduced in this lesson**:

- **addition rule** — if a choice can be made in one of two mutually exclusive ways, with `m` options in the first way and `n` in the second, the total number of options is `m + n`. *Why it matters*: the counting principle's own counterpart for *alternatives* rather than *sequential, independent* choices — completing the two basic rules every combinatorial count in this section builds from.

**Objects and methods used**: None new. This lesson combines `power` (Lesson 42) and `+`, both already covered.

---

## Concept Unit: The Addition Rule — Counting Alternatives

### The Problem

A password may be either `4` lowercase letters, or `4` digits — never a mix of both. How many total passwords are possible, combining two genuinely different *kinds* of password into one count?

### Introduce the concept in isolation

The two kinds don't overlap at all — a password made of `4` letters is never also a password made of `4` digits, the exact "exhaustive, non-overlapping" requirement Lesson 17's proof by cases already needed for a case split to be valid. When two possibilities genuinely never coincide this way, the total count of "either one or the other" is simply the sum of each count separately:

> **Addition rule**: if a choice can be made `m` ways *or* `n` ways, and no option counts as both simultaneously, the total is `m + n`.

Small, listable check: choosing a snack that's either one of `2` fruits or one of `3` vegetables (never both at once) gives `2 + 3 = 5` total choices — directly countable by listing all five, confirming the rule.

### Discard the throwaway example

Not applicable — this small case is the direct evidence for the rule stated next.

### Generalizing

Nothing about the snack example depended on its specific numbers or categories — any two genuinely non-overlapping sets of options combine by addition, the exact mirror image of the previous lesson's multiplication rule for *sequential*, independent choices.

### CS Lens

This is precisely Lesson 10's set union, counted: if two sets share no members (Lesson 10's own vocabulary — their intersection is empty), `|A ∪ B| = |A| + |B|` — the addition rule is set union's counting consequence, the same relationship the previous lesson found between the multiplication rule and the Cartesian product.

### SE Lens

Recognizing when a real counting problem needs addition (alternatives) versus multiplication (sequential choices) is the actual skill — the next unit applies both together, and the closing unit shows exactly what goes wrong when the addition rule's non-overlap requirement is ignored.

---

## Concept Unit: Combining Both Rules

### The Problem

Compute the real password count from Concept Unit 1's opening example: `4` lowercase letters (`26` options per character) *or* `4` digits (`10` options per character) — genuinely combining both rules in one problem.

### Introduce the concept in isolation

```clojure
(defn password-count [letter-length digit-length]
  (+ (power 26 letter-length) (power 10 digit-length)))
```

```
user=> (password-count 4 4)
466976
```

The multiplication rule (previous lesson, via `power`) computes each *kind* of password's own count independently — `26⁴ = 456{,}976` all-letter passwords, `10⁴ = 10{,}000` all-digit ones — and the addition rule combines the two, non-overlapping totals into one final count, `466{,}976`.

### Discard the throwaway example

Not applicable — `password-count` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; `power`, from Lesson 42.

### The New Code — type it yourself

```clojure
(defn password-count [letter-length digit-length]
  (+ (power 26 letter-length) (power 10 digit-length)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(power 26 letter-length)`, `(power 10 digit-length)`** — reappearing `power` (Lesson 42), each computing one alternative's own count via the multiplication rule.
- **`(+ ... ...)`** — reappearing addition, combining the two alternatives per this lesson's own rule — valid specifically because an all-letter password and an all-digit password never coincide.

### CS Lens

This two-rule combination — multiply within a sequential choice, add across mutually exclusive alternatives — is the complete toolkit behind most elementary combinatorial counting, including every count this series has already computed: `power-set`'s `2ⁿ` (pure multiplication, previous lesson) and this lesson's password count (multiplication nested inside addition).

### SE Lens

Writing `password-count` as a direct formula, rather than actually generating every password and counting them, scales the same way every closed-form shortcut in this series has — instant for any length, where generation would become impractical almost immediately (Lesson 50's own growth-rate table applies directly: `26⁴` and `10⁴` are both easily computed, but generating and listing that many actual strings is a different, much more expensive task).

### Connection to the previous unit

The previous unit stated the addition rule on its own; this unit combines it with the multiplication rule from Lesson 59 on a single, real problem — proof the two rules compose directly, not just describe separate, unrelated situations.

---

## Concept Unit: The Danger of Overlapping Cases

### The Problem

Suppose the password rule were relaxed: "4 characters, either all from the lowercase alphabet, or all from the digits `0`-`9`, or *containing at least one letter*." Does simply adding a third count for "contains at least one letter" to the previous two work the same way?

### Introduce the concept in isolation

It doesn't — "all lowercase letters" and "contains at least one letter" **overlap** enormously: every all-letter password *also* satisfies "contains at least one letter." Adding their counts directly would count every all-letter password *twice** — once in the "all letters" total, once again in the "contains at least one letter" total — violating the addition rule's own non-overlap requirement, the identical requirement Lesson 17's proof by cases needed and Concept Unit 1 stated explicitly.

### Discard the throwaway example

Not applicable — this is a genuine warning about a real, common mistake.

### CS Lens

This exact overlap problem is why Lesson 65 (*Inclusion-Exclusion*), later in this section, exists at all — it derives the precise correction needed (subtracting the overlap back out) for exactly the situation this unit just flagged as unsafe for the plain addition rule alone.

### SE Lens

The addition rule isn't wrong when cases overlap — it simply doesn't apply at all, the same way Lesson 51's Big-O proof technique doesn't apply to a claim it was never designed to answer. Recognizing *which* rule a given counting problem's structure actually calls for — checking the non-overlap condition explicitly, not assuming it — is the real discipline this lesson and the previous one both build toward.

### Connection to the previous unit

The previous unit combined both rules correctly, on a problem where the addition rule's requirement genuinely held; this unit constructs a case where it doesn't, making visible exactly what could go wrong if the requirement were assumed rather than checked.

---

## Connect the Pieces

Both rules, and the overlap warning, together on one final check:

```clojure
(println "All-letter passwords:" (power 26 4))
(println "All-digit passwords:" (power 10 4))
(println "Total (addition rule, no overlap):" (password-count 4 4))
(println "These two sets truly don't overlap:" (not (some (fn [x] (and (>= x 0) (<= x 25))) (list))))
```

```
All-letter passwords: 456976
All-digit passwords: 10000
Total (addition rule, no overlap): 466976
These two sets truly don't overlap: true
```

The final line is a small, deliberately trivial confirmation standing in for a real check: an all-letter password (built from `a`-`z`) and an all-digit password (built from `0`-`9`) draw from entirely disjoint character sets, so no single password could ever belong to both categories — the addition rule's requirement, verified conceptually rather than merely assumed.

## What Breaks Without This

Suppose `password-count` were extended carelessly to a third, overlapping category — "passwords containing at least one letter," added as a third term without checking overlap:

```clojure
(defn password-count-broken [letter-length digit-length]
  (+ (power 26 letter-length) (power 10 digit-length) (power 26 letter-length)))
```

(A stand-in for the mistake — reusing the all-letter count again as if "contains a letter" were a separate, non-overlapping category, rather than actually deriving the real count for that broader condition.) This roughly doubles the all-letter contribution, overcounting significantly — every genuine all-letter password gets counted twice, exactly the double-counting Concept Unit 3 warned about, silently inflating the total with no error or warning, because addition never checks whether its own requirement actually holds.

## Exercises

1. **Trace.** List all five choices from Concept Unit 1's fruit-or-vegetable example directly, confirming the count matches `2 + 3`.
2. **Predict.** Before computing it, predict the total count of "a phone extension that's either `3` digits or `4` digits" (never both lengths at once). Verify with the addition rule.
3. **Diagnose.** Explain, in your own words, exactly why `password-count-broken` overcounts, and estimate by how much.
4. **Break it, on purpose.** Construct your own overlapping-cases example (different from this lesson's), and show that naively adding the two counts overcounts the true total.
5. **Generalize.** A door code is either `4` digits with no repeated digit, or `4` letters (repeats allowed). Using both rules from this lesson and the previous one, compute the total number of possible codes.
6. **Reconstruct.** Close this lesson. From memory, state both counting rules, and explain precisely what condition the addition rule requires that the multiplication rule does not.

## Definition of Done

- [ ] You can state both the addition and multiplication rules from memory, and identify which one a given problem needs.
- [ ] You completed Exercise 3 and can state, concretely, why `password-count-broken` overcounts.
- [ ] You completed Exercise 5, correctly combining both rules on a problem needing each once.
- [ ] You can explain why the addition rule requires non-overlapping cases while the multiplication rule requires independence — two different conditions, easy to conflate.
- [ ] Commit your Exercise 2 and Exercise 5 counts to your notes repository, with a commit message stating each result — for example, `"Phone extensions: 1000+10000=11000; door codes: 10*9*8*7 + 26^4 = 461,896"` — not just `"lesson 60 exercise"`.

---

**Next lesson:** Lesson 61, *Permutations*, returns to `permutation-count` (Lesson 45) and derives its closed form, `n!/(n-k)!`, directly from the multiplication rule this section just formalized.
