# Lesson 144: Rings and Fields

**What you will build**: By the end of this lesson you'll combine Lesson 143's group with Lesson 142's semiring — requiring the "add" side to be a full group this time, not just a monoid — and name the result a **ring**. Then you'll show, with real code, that integers mod `4` fail to be a stronger structure, a **field**, because `2` has no multiplicative inverse — while integers mod `5` succeed, every nonzero element invertible, because `5` is prime and `4` isn't.

**What you need to know first**: Lesson 143's group (a monoid with inverses); Lesson 142's semiring (two operations, connected by distributivity); Lesson 57's prime numbers, used directly to explain *why* mod `5` succeeds where mod `4` fails.

**Terms introduced in this lesson**:

- **ring** — a set with two operations, `\oplus$ and `\otimes`, where `(set, \oplus)` is a full group (Lesson 143 — every element has an inverse), `(set, \otimes)` is a monoid (Lesson 141), and `\otimes` distributes over `\oplus`. *Why it matters*: Lesson 142's semiring required only a monoid on the addition side; a ring is strictly stronger — it guarantees subtraction always works, not just addition.
- **field** — a ring where every element *except* the additive identity also has a multiplicative inverse. *Why it matters*: guarantees division always works too (except by zero) — the exact structure ordinary rational and real-number arithmetic has, and integers do not.

**Objects and methods used**: None new. This lesson reuses `mod` (Lesson 54) and `*` (Lesson 2), each already covered.

---

## Concept Unit: A Ring — Integers Mod 4, Under Both Operations at Once

### The Problem

Lesson 143 confirmed `\{0,1,2,3\}` under `mod4-add` is a full group — every element has an additive inverse. Is there a second operation that can join it, the way Lesson 142 paired `+` alongside `\min`, to form the stronger structure a ring names?

### Introduce the concept in isolation

```clojure
(defn mod4-mult [a b] (mod (* a b) 4))
```

```
user=> (mod4-mult 1 3)
3
user=> (mod4-mult 3 1)
3
```

`mod4-mult`'s identity is `1`: `(mod4-mult 1 a)` leaves `a` unchanged, confirmed on both sides. Together with `mod4-add` — already a full group — and distributivity (Lesson 142's own property, holding here for the identical reason it held for ordinary `+`/`\times`), `(\{0,1,2,3\}, \text{mod4-add}, \text{mod4-mult})` is a **ring**: a full group on the addition side, a monoid on the multiplication side, connected by distributivity.

### Discard the throwaway example

Not applicable — `mod4-mult` is real, reusable, and its identity verified directly.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch second operation, paired with Lesson 143's already-verified group.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn mod4-mult [a b] (mod (* a b) 4))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(mod (* a b) 4)`**, in `mod4-mult` — reappearing `mod`/`*` (Lesson 54, Lesson 2), the exact same "wrap the result back into range" shape `mod4-add` already used, applied to multiplication instead of addition.

### CS Lens

A ring is exactly the structure behind ordinary integer arithmetic: `(\text{integers}, +, \times)` is a ring — subtraction always works (`+`'s own inverses), but division doesn't (Lesson 140 already showed integers aren't closed under division at all).

### SE Lens

Requiring a *full group* on the addition side, rather than Lesson 142's weaker monoid, is what guarantees subtraction is always meaningful within a ring — any code relying on "undo an addition" needs at least a ring, not merely a semiring, or that guarantee simply isn't there.

---

## Concept Unit: Not Quite a Field — `2` Has No Inverse Mod 4

### The Problem

A ring's multiplication side is only required to be a monoid — no inverses promised. Does `\{0,1,2,3\}` under `mod4-mult` happen to have them anyway, the way `mod4-add` did, or does multiplication genuinely fail here?

### Introduce the concept in isolation

```
user=> (mod4-mult 2 0)
0
user=> (mod4-mult 2 1)
2
user=> (mod4-mult 2 2)
0
user=> (mod4-mult 2 3)
2
```

Every candidate partner for `2`, checked directly: `0`, `2`, `0`, `2` — `1` (the identity) never appears. `2` has no multiplicative inverse anywhere in `\{0,1,2,3\}$. Compare `1` and `3`, which do: `(mod4-mult 1 1)` is `1`; `(mod4-mult 3 3)` is `9 \bmod 4 = 1`. A ring where even one non-zero element lacks a multiplicative inverse is not a **field** — `\{0,1,2,3\}` under mod-`4` arithmetic is a ring, checked in the previous unit, but not a field, checked here directly.

### Discard the throwaway example

Not applicable — every candidate for `2`'s inverse was checked exhaustively and none worked, a real negative result, not an assumption.

### Project Change

- **Reference Source**: No reference counterpart — exhaustive verification of a real property's absence.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit checks an existing operation against every candidate rather than building a new function.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(mod4-mult 2 0)`, `(mod4-mult 2 1)`, `(mod4-mult 2 2)`, `(mod4-mult 2 3)`** — reappearing `mod4-mult` (this lesson's first unit), applied to every element of `\{0,1,2,3\}` in turn — an exhaustive check, the same discipline Lesson 140 used for closure, applied here to prove an inverse's *absence* rather than its presence.

### CS Lens

`2`'s failure here isn't arbitrary — `2` and `4` share a common factor (`2` itself), and Lesson 55's greatest common divisor names exactly the condition under which a modular multiplicative inverse fails to exist: `a` has an inverse mod `n` only when `\gcd(a, n) = 1$. `\gcd(2, 4) = 2 \neq 1`, predicting this failure before ever checking it by hand.

### SE Lens

Discovering this by exhaustive checking, as this unit did, works for a set this small — but Lesson 55's `\gcd` gives a real, checkable *reason*, not just a confirmed fact, and scales to sets far too large to check exhaustively at all.

### Connection to the previous unit

The previous unit confirmed `\{0,1,2,3\}` is a genuine ring; this unit shows precisely where it stops short of being a field.

---

## Concept Unit: A Field — Integers Mod 5

### The Problem

Is *every* small modulus doomed to fail as a field the way mod `4` did, or was `4` specifically the problem?

### Introduce the concept in isolation

```clojure
(defn mod5-mult [a b] (mod (* a b) 5))
```

```
user=> (mod5-mult 1 1)
1
user=> (mod5-mult 2 3)
1
user=> (mod5-mult 3 2)
1
user=> (mod5-mult 4 4)
1
```

Every nonzero element of `\{1,2,3,4\}` reaches the identity `1` with some partner: `1$ is its own inverse, `2` and `3` are each other's, `4` is its own. Mod-`5` arithmetic *is* a field — `5` is prime (Lesson 57), so `\gcd(a, 5) = 1$ for every `a` from `1` to `4`, guaranteeing (per the previous unit's own `\gcd` reasoning) that every one of them has a real multiplicative inverse.

### Discard the throwaway example

Not applicable — `mod5-mult` is real, and every one of the four nonzero elements was checked to have a genuine inverse, not assumed from the pattern.

### Project Change

- **Reference Source**: No reference counterpart — a second modulus, chosen specifically to be prime, contrasting directly against the previous two units.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn mod5-mult [a b] (mod (* a b) 5))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(mod (* a b) 5)`**, in `mod5-mult` — reappearing shape (this lesson's own `mod4-mult`), modulus changed from `4` to `5` — the only difference between a ring that fails to be a field and one that succeeds.

### CS Lens

`\mathbb{Z}_n` — integers mod `n` — is a field precisely when `n` is prime, a real theorem this lesson's own two contrasting examples both confirm concretely rather than merely state: `4 = 2 \times 2$ (not prime, fails), `5` (prime, succeeds).

### SE Lens

Real cryptographic systems — RSA, elliptic-curve cryptography — deliberately choose a *prime* modulus specifically so every nonzero element has a multiplicative inverse, because their algorithms genuinely need division to work throughout, not merely addition and multiplication — an engineering choice directly justified by this lesson's own field definition, not an arbitrary convention.

### Connection to the previous unit

The previous unit showed exactly where mod-`4` arithmetic falls short of a field; this unit shows changing one number — the modulus — is enough to cross that line, provided the new modulus is prime.

---

## Connect the Pieces

Ring versus field, the same two operations, two different moduli:

```clojure
(println "Mod 4: 2 has an inverse?" (or (= (mod4-mult 2 0) 1) (= (mod4-mult 2 1) 1) (= (mod4-mult 2 2) 1) (= (mod4-mult 2 3) 1)))
(println "Mod 5: 2 has an inverse?" (= (mod5-mult 2 3) 1))
```

```
Mod 4: 2 has an inverse? false
Mod 5: 2 has an inverse? true
```

Identical shape of arithmetic, one prime modulus and one composite modulus — the entire difference between a ring and a field, for this whole family of structures, comes down to that single fact about the modulus.

## What Breaks Without This

Suppose an algorithm needed to "divide" mod `4` — for instance, solving `2x \equiv 2 \pmod 4$ for `x` by multiplying both sides by `2`'s inverse. That inverse doesn't exist, checked exhaustively in this lesson's second unit, so that approach silently has no valid method to fall back on — and worse, the equation still *does* have solutions (`x = 1$ and `x = 3$ both work, checked directly: `2 \times 1 = 2`, `2 \times 3 = 6 \equiv 2$), just not reachable by the "multiply by the inverse" technique a field would guarantee. Assuming mod-`4` arithmetic supports division, because it superficially resembles mod-`5` arithmetic, would mean either missing real solutions or reaching for machinery that provably isn't there.

## Exercises

1. **Trace.** By hand, using `\gcd` (Lesson 55), predict which elements of `\{1, 2, 3, 4, 5\}` have a multiplicative inverse mod `6`, before checking with `mod6-mult`.
2. **Predict.** Before checking, predict whether mod-`7` arithmetic is a field. Justify using Lesson 57's primality, then verify at least two inverse pairs directly.
3. **Verify.** Confirm `mod5-mult` is associative on at least one real triple, the same check Lesson 140 first introduced.
4. **Break it, on purpose.** Find a *different* element of `\{0,1,2,3\}$, besides `2`, that also lacks a mod4-mult inverse, and explain why using `\gcd`.
5. **Generalize.** Describe, without coding it, why `0` is excluded from a field's own inverse requirement — what would `0`'s multiplicative inverse even need to satisfy, and why can no value work?
6. **Reconstruct.** Close this lesson. From memory, explain why `\gcd(a, n) = 1$ predicts whether `a` has an inverse mod `n`, using this lesson's own `2` mod `4` and `2` mod `5` as the two contrasting cases.

## Definition of Done

- [ ] You can define a ring as a full group under one operation, a monoid under the other, connected by distributivity.
- [ ] You can define a field as a ring where every nonzero element has a multiplicative inverse.
- [ ] You can explain why mod-`4` arithmetic is a ring but not a field, and why mod-`5` arithmetic is both.
- [ ] You completed Exercise 2 and verified mod-`7` arithmetic is a genuine field.
- [ ] You completed Exercise 4 and found a second mod-`4` element with no multiplicative inverse, explained via `\gcd`.
- [ ] Commit your Exercise 2 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed — for example, `"Confirm mod-7 is a field (all six nonzero elements invertible); confirm 0 and 2 both lack mod4-mult inverses via gcd"` — not just `"lesson 144 exercise"`.

---

**Next lesson:** Lesson 145, *Equivalence Relations*, steps back from operations entirely to ask a different question: when should two genuinely different-looking things be treated as "the same," precisely — the exact question `mod4-add` has been quietly answering for every number that lands in the same remainder class, made explicit for the first time.
