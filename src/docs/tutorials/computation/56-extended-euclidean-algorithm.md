# Lesson 56: Extended Euclidean Algorithm

**What you will build**: By the end of this lesson you'll have extended the previous lesson's algorithm to compute not just a greatest common divisor, but the exact pair of integer coefficients that combine the two original numbers to produce it — and used that pair to compute a genuine modular inverse, the mathematical operation that lets you "divide" in modular arithmetic, where ordinary division doesn't directly exist.

**What you need to know first**: Lesson 55's `my-gcd` and its identity, and Lesson 54's modular arithmetic.

**Terms introduced in this lesson**:

- **Bézout's identity** — for any two integers `a` and `b`, there exist integers `x` and `y` such that `ax + by = gcd(a, b)`. *Why it matters*: the real theorem this lesson's algorithm computes constructively — not merely proving such `x` and `y` exist, but actually deriving them.
- **modular inverse** — for a number `a` and a modulus `n` with `gcd(a, n) = 1`, the modular inverse of `a` is a number `x` such that `a × x ≡ 1 (mod n)`. *Why it matters*: the modular-arithmetic replacement for division — since `a × x` being congruent to `1` is the modular equivalent of `a × (1/a) = 1` in ordinary arithmetic — genuinely important for cryptography, a subject this series returns to in a dedicated branch later.

**Objects and methods used**: `quot` — reappearing from Lesson 43, used here to compute the exact whole-number quotient at each step of the algorithm.

---

## Concept Unit: Tracking Coefficients Alongside GCD

### The Problem

Lesson 55's `my-gcd(48, 18)` returns `6` — but `6` can also be written as a combination of `48` and `18`: `48 × (-1) + 18 × 3 = -48 + 54 = 6`. Is this a coincidence for this one pair, or does *every* pair of numbers have such a combination for their GCD?

### Introduce the concept in isolation

**Bézout's identity** states this is never a coincidence: for any integers `a` and `b`, there exist integers `x` and `y` such that `ax + by = gcd(a, b)` — always, for every pair. This lesson doesn't just claim the theorem; it derives an algorithm that actually *finds* `x` and `y`, extending Lesson 55's own recursive structure.

### Discard the throwaway example

Not applicable — this claim is what the next unit derives and proves constructively.

### CS Lells

Bézout's identity is what guarantees a **modular inverse** exists whenever `gcd(a, n) = 1` — Concept Unit 3 makes this connection concrete, but the existence guarantee itself comes directly from this theorem.

### SE Lells

Knowing a solution is *guaranteed* to exist (Bézout's theorem) is different from knowing *how to compute it* — exactly Lesson 12's distinction between a function existing abstractly and being genuinely, practically invertible. The next unit closes that gap.

---

## Concept Unit: Deriving the Recursive Relationship

### The Problem

Lesson 55's identity says `gcd(a, b) = gcd(b, a \bmod b)`. Suppose the *smaller* problem, `gcd(b, a \bmod b)`, is already solved — some `x₁` and `y₁` are known such that `b \cdot x_1 + (a \bmod b) \cdot y_1 = \gcd(b, a \bmod b)`. Can `x` and `y` for the *original* problem, `a` and `b`, be recovered from `x₁` and `y₁`?

### Introduce the concept in isolation

Let `q` be the whole-number quotient of `a ÷ b`, so `a \bmod b = a - bq` (Lesson 54's own relationship, restated). Substitute this directly into the smaller problem's equation:

```
g = b·x₁ + (a - bq)·y₁
  = b·x₁ + a·y₁ - bq·y₁            (distribute)
  = a·y₁ + b·(x₁ - q·y₁)            (regroup — Lesson 13's factoring)
```

This is now in exactly the form `a·x + b·y = g` — with:

> **x = y₁**, and **y = x₁ - q·y₁**

Given a solution to the *smaller* problem, this is a direct, computable way to recover a solution to the *original* one — no guessing, no search, a formula derived purely by substitution and regrouping.

### Discard the throwaway example

Not applicable — this derivation is the direct basis for the next unit's code.

### CS Lells

This is the identical relationship Lesson 34's accumulator transformation used — a smaller problem's answer, carried forward and *transformed* (not just passed through unchanged) to produce the larger problem's answer — here applied to a pair of coefficients instead of a single running total.

### SE Lells

Deriving `x = y₁, y = x₁ - qy₁` algebraically, rather than looking it up, is what makes it trustworthy enough to implement directly in the next unit — the same standard this series has held every algorithm to since Lesson 20.

### Connection to the previous unit

The previous unit stated Bézout's identity as a claim; this unit derives the exact recursive relationship that computes the coefficients it promises, one smaller problem at a time.

---

## Concept Unit: Implementing and Verifying

### The Problem

Translate the derived relationship into code — representing a result as a three-element list `(g x y)`, the same list-as-tuple convention Lesson 30 used for trees.

### Introduce the concept in isolation

```clojure
(defn combine-egcd [q result]
  (list (first result)
        (first (rest (rest result)))
        (- (second result) (* q (first (rest (rest result)))))))

(defn extended-gcd [a b]
  (if (= b 0)
    (list a 1 0)
    (combine-egcd (quot a b) (extended-gcd b (mod a b)))))
```

```
user=> (extended-gcd 48 18)
(6 -1 3)
```

`(6 -1 3)` means `g = 6`, `x = -1`, `y = 3` — check: `48 × (-1) + 18 × 3 = -48 + 54 = 6`, matching exactly. `combine-egcd` implements this lesson's derived formula directly: given `q` and the smaller problem's result `(g, x₁, y₁)`, it produces `(g, y₁, x₁ - q·y₁)` — reading `g`, `x₁`, and `y₁` out of the list with `first`, `second`, and `(first (rest (rest ...)))`, the identical accessor pattern Lesson 30's trees used. `extended-gcd`'s base case, `(list a 1 0)`, matches `a × 1 + 0 × 0 = a` — Lesson 55's own base case (`gcd(a,0)=a`), now carrying its trivial coefficients along too.

### Discard the throwaway example

Not applicable — `extended-gcd` is a real, historically important function.

### Project Change

- **Reference Source**: No reference counterpart — a direct implementation of this lesson's own derived recursive relationship.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn extended-gcd [a b]
  (if (= b 0)
    (list a 1 0)
    (combine-egcd (quot a b) (extended-gcd b (mod a b)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(quot a b)`** — reappearing `quot` (Lesson 43): the exact whole-number quotient this unit's own derivation calls `q`.
- **`(extended-gcd b (mod a b))`** — the single recursive call, on the smaller problem Lesson 55's identity specifies — called exactly once, its full three-element result handed directly to `combine-egcd` rather than recomputed multiple times for each piece needed.
- **`combine-egcd`** — reappearing accessor pattern (Lesson 30), applying this lesson's derived formula to the smaller problem's result.

### CS Lells

Calling the recursive function exactly once, and extracting every piece of its result from that single call via a separate combining function, is a real, general technique for avoiding redundant recomputation (the same concern Lesson 23 and Lesson 38 raised about `fib`) whenever a recursive call's result has more than one part that a caller needs.

### SE Lells

`extended-gcd`'s termination inherits directly from `my-gcd`'s already-proven termination (Lesson 55) — nothing about carrying the extra coefficients along changes which pair `(a, b)` shrinks toward the base case, only what additional information rides alongside that shrinking.

### Connection to the previous unit

The previous unit derived the coefficient-recovery formula abstractly; this unit is its direct, verified implementation, confirmed against a concrete case already checked by hand.

---

## Concept Unit: Connecting to Modular Inverses

### The Problem

Find a number `x` such that `3 × x ≡ 1 (mod 7)` — the **modular inverse** of `3`, modulo `7`.

### Introduce the concept in isolation

```
user=> (extended-gcd 3 7)
(1 -2 1)
```

`gcd(3, 7) = 1` — confirming an inverse exists at all (Bézout's identity guarantees this exactly when the GCD is `1`) — and `3 × (-2) + 7 × 1 = -6 + 7 = 1`. Reducing `x = -2` to a standard, non-negative representative mod `7` (Lesson 54): `(mod -2 7)` gives `5`. Check directly: `3 × 5 = 15`, and `(mod 15 7) = 1` — confirmed, `5` is `3`'s modular inverse mod `7`.

### Discard the throwaway example

Not applicable — this is a genuine, verified modular inverse computation.

### CS Lells

Modular inverses are exactly how "division" is defined in modular arithmetic, where ordinary division has no direct meaning: "dividing by `3` mod `7`" means "multiplying by `3`'s modular inverse, `5`" — this exact operation is the mathematical foundation of RSA and several other public-key cryptography schemes this series' security branch covers in far greater depth, much later.

### SE Lells

The existence condition — `gcd(a, n) = 1` — is not a technicality: it's the exact, precise boundary of when a modular inverse exists at all, the same domain-awareness discipline Lesson 12's partial functions demanded. `extended-gcd`'s own returned `g` value is what a real implementation checks first, before trusting `x` as a genuine inverse.

### Connection to the previous unit

The previous unit verified `extended-gcd`'s coefficients against a hand-checkable case; this unit puts those coefficients to a genuine, named use — computing a modular inverse, connecting this entire lesson's algebra directly to a real, important application.

---

## Connect the Pieces

The complete chain, from GCD through coefficients to a verified modular inverse:

```clojure
(println "extended-gcd 3 7:" (extended-gcd 3 7))
(println "Reduced x mod 7:" (mod (second (extended-gcd 3 7)) 7))
(println "Check: 3 * 5 mod 7 =" (mod (* 3 5) 7))
```

```
extended-gcd 3 7: (1 -2 1)
Reduced x mod 7: 5
Check: 3 * 5 mod 7 = 1
```

`extended-gcd` (Concept Unit 3) computed the raw coefficients; `mod` (Lesson 54) reduced the possibly-negative `x` to a standard representative; the final check confirms `5` genuinely satisfies the modular-inverse definition (Concept Unit 4) — every piece of this lesson working together on one concrete, verified example.

## What Breaks Without This

Suppose a modular inverse were requested for a pair with `gcd(a, n) ≠ 1` — say, `a = 4`, `n = 6` (`gcd(4,6) = 2`, not `1`):

```
user=> (extended-gcd 4 6)
(2 -1 1)
```

`g = 2`, not `1` — Bézout's identity still holds (`4 × (-1) + 6 × 1 = 2`), but no modular inverse of `4` mod `6` actually exists, because the existence condition (`gcd = 1`) genuinely fails here. A caller that skipped checking `g` and blindly used `x = -1` (reduced to `5` mod `6`) as if it were a valid inverse would be trusting a nonexistent guarantee: `4 × 5 = 20`, and `(mod 20 6) = 2`, not `1` — confirming `5` is *not* actually `4`'s modular inverse mod `6`, exactly because one was never guaranteed to exist in the first place.

## Exercises

1. **Trace.** By hand, trace `(extended-gcd 12 5)`, showing every `combine-egcd` step, the way Concept Unit 3 traced `(extended-gcd 48 18)`.
2. **Predict.** Before running it, predict whether `4` has a modular inverse mod `9`. Check by computing `gcd(4, 9)` first.
3. **Verify.** Compute `4`'s modular inverse mod `9` (if Exercise 2 confirms one exists), and verify it directly the way Concept Unit 4 did for `3` mod `7`.
4. **Break it, on purpose.** Reproduce "What Breaks Without This" yourself — compute `(extended-gcd 4 6)`, and confirm the "inverse" it would naively suggest fails the actual modular-inverse check.
5. **Generalize.** Write a function `mod-inverse` that takes `a` and `n`, returns the correctly-reduced modular inverse if `gcd(a,n) = 1`, and returns some clear indicator (your choice) when no inverse exists.
6. **Reconstruct.** Close this lesson. From memory, re-derive the formula `x = y₁, y = x₁ - qy₁`, and explain precisely why a modular inverse requires `gcd(a,n) = 1`.

## Definition of Done

- [ ] You can trace `extended-gcd` by hand and verify its coefficients satisfy Bézout's identity.
- [ ] You can compute a modular inverse and verify it directly, the way Concept Unit 4 did.
- [ ] You completed Exercise 5 (`mod-inverse`) and it correctly handles both the existing-inverse and no-inverse cases.
- [ ] You can explain why `gcd(a,n) = 1` is the precise, necessary condition for a modular inverse to exist.
- [ ] Commit `mod-inverse` to your notes repository, with a commit message stating a verified existing-inverse case and a verified no-inverse case — for example, `"Add mod-inverse — verified inverse of 4 mod 9 is 7 (4*7=28, 28 mod 9=1); correctly reports no inverse for 4 mod 6"` — not just `"lesson 56 exercise"`.

---

**Next lesson:** Lesson 57, *Prime Numbers*, explores divisibility and factorization directly — building on this lesson's GCD machinery to determine when two numbers share no factors at all, and what that means computationally.
