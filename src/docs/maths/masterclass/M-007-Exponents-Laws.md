# M-007 — Exponents and Their Laws

**Phase 1 · Algebra Rebuilt · Lesson 5 of 5**
**Pillar: Structure** · *Every exponent rule derived from counting — and why the pattern forces every extension*

---

## What You Will Build

A Python program that derives all exponent laws from counting, then extends them to zero, negative, and rational exponents — forcing each definition by demanding consistency. You will see why $a^0 = 1$ is not a convention but the only coherent choice.

---

## What You Need to Know First

- M-003: field axioms (the extension to negative exponents uses multiplicative inverses)
- M-001: direct proof and proof by induction

---

> **Quick Check — try to answer before reading:**
>
> 1. Why does $a^0 = 1$ for $a \neq 0$? Is this a definition or can it be derived?
> 2. Why is $0^0$ undefined (or controversial)?
> 3. What does $2^{1/3}$ mean? How do you know your answer is the right definition?
>
> *(Answers at the end of this lesson)*

---

## The Lesson

### Exponents as Repeated Multiplication

For positive integer $n$, define:

$$a^n = \underbrace{a \cdot a \cdot a \cdots a}_{n \text{ factors}}$$

This is the primitive definition. All the laws follow from it by **counting factors**.

---

### The Three Core Laws — Derived by Counting

**Law 1: $a^m \cdot a^n = a^{m+n}$**

$a^m \cdot a^n$ is $m$ factors of $a$ multiplied by $n$ factors of $a$. Total: $m + n$ factors.

$$a^m \cdot a^n = \underbrace{a \cdots a}_{m} \cdot \underbrace{a \cdots a}_{n} = \underbrace{a \cdots a}_{m+n} = a^{m+n} \quad \square$$

**Law 2: $(a^m)^n = a^{mn}$**

$(a^m)^n$ is $n$ groups of $m$ factors each. Total: $mn$ factors.

$$\underbrace{(a^m) \cdots (a^m)}_{n} = \underbrace{\underbrace{a \cdots a}_{m} \cdots \underbrace{a \cdots a}_{m}}_{n \text{ groups}} = a^{mn} \quad \square$$

**Law 3: $(ab)^n = a^n b^n$**

$(ab)^n$ is $n$ copies of the pair $(ab)$. Use commutativity and associativity of multiplication to rearrange: put all $a$'s together, all $b$'s together.

$$(ab)^n = \underbrace{(ab)(ab)\cdots(ab)}_{n} = \underbrace{a \cdots a}_{n} \cdot \underbrace{b \cdots b}_{n} = a^n b^n \quad \square$$

These three laws follow from counting. They are **theorems**, not rules.

---

### Extending the Definition: The Consistency Principle

We want Law 1 ($a^m \cdot a^n = a^{m+n}$) to hold for **all** integers, not just positive ones. This requirement is not optional — if we want algebra to work consistently, we are forced into specific definitions.

**Extending to $n = 0$:**

We need: $a^m \cdot a^0 = a^{m+0} = a^m$.

Dividing both sides by $a^m$ (valid for $a \neq 0$ by field axiom M4):

$$a^0 = 1$$

This is not a convention. It is the only definition of $a^0$ that makes Law 1 hold. If we defined $a^0 = 0$ or $a^0 = 42$, Law 1 would fail.

**Why $0^0$ is problematic:** Two limiting processes give different answers: $\lim_{x \to 0^+} x^0 = 1$ (any nonzero base to the 0 power is 1), but $\lim_{x \to 0^+} 0^x = 0$ (zero to any positive power is 0). The two limits disagree, so $0^0$ cannot be assigned a consistent value from either direction. In combinatorics, $0^0 = 1$ is conventional (and useful). In analysis, the expression is left undefined.

**Extending to negative integers:**

We need: $a^n \cdot a^{-n} = a^{n+(-n)} = a^0 = 1$.

So $a^{-n}$ must be the multiplicative inverse of $a^n$:

$$a^{-n} = \frac{1}{a^n}$$

Again, this is forced by Law 1 — not a choice.

**Extending to rational exponents $a^{1/n}$:**

We need: $(a^{1/n})^n = a^{n \cdot (1/n)} = a^1 = a$.

So $a^{1/n}$ is a number whose $n$th power equals $a$ — the **$n$th root** $\sqrt[n]{a}$.

For $a \geq 0$ and positive integer $n$: $a^{1/n} = \sqrt[n]{a}$ is the unique non-negative real number whose $n$th power is $a$.

**The pattern:** Every extension of exponents is forced by demanding Law 1 continues to hold. This is a deep pattern in mathematics: you extend a structure by requiring the laws that worked in the simple case to continue working in the extended case. You will see this again when:
- Complex exponents are defined in Phase 4 (via Euler's formula $e^{i\theta} = \cos\theta + i\sin\theta$)
- Matrix exponents are defined in Phase 11 ($e^A$ for a matrix $A$)
- In Phase 17 (Abstract Algebra), this pattern has a name: **universal property** — the extended object is the unique one that makes the desired laws hold.

```python
import math

print("=== Exponent Laws Verification ===")
print()

# Test values
bases = [2, 3, 0.5, -2]
exponents = [(2, 3), (3, 4), (0, 5), (-2, 3)]

# Law 1: a^m * a^n = a^(m+n)
print("Law 1: a^m · a^n = a^(m+n)")
for (m, n) in [(2, 3), (3, 0), (2, -1)]:
    for a in [2.0, 3.0, 0.5]:
        lhs = a**m * a**n
        rhs = a**(m + n)
        ok = abs(lhs - rhs) < 1e-12
        print(f"  {a}^{m} · {a}^{n} = {lhs:.6f}  vs  {a}^{m+n} = {rhs:.6f}  {'✓' if ok else '✗'}")
print()

# Forced definitions
print("=== Forced Definitions from Law 1 ===")
print()
print("a^0 = 1 because a^m · a^0 = a^m  ⟹  a^0 = 1")
for a in [2, 3, 0.5, -7]:
    print(f"  {a}^0 = {a**0}")
print()

print("a^(-n) = 1/a^n because a^n · a^(-n) = a^0 = 1")
for a in [2.0, 3.0, 5.0]:
    n = 3
    print(f"  {a}^(-{n}) = {a**(-n):.6f}  vs  1/{a}^{n} = {1/a**n:.6f}  equal: {abs(a**(-n) - 1/a**n) < 1e-12}")
print()

print("a^(1/n) = nth root of a because (a^(1/n))^n = a")
for (a, n) in [(8, 3), (16, 4), (2, 2), (27, 3)]:
    val = a**(1/n)
    check = val**n
    print(f"  {a}^(1/{n}) = {val:.6f},  ({val:.6f})^{n} = {check:.6f}  ≈ {a} {'✓' if abs(check - a) < 1e-8 else '✗'}")
print()

# Show the full exponent law table
print("=== Full Summary: Integer Exponents ===")
a = 2.0
print(f"Base a = {a}")
for n in range(-4, 5):
    value = a**n
    print(f"  2^{n:2d} = {value:.6f}")

print()
print("Note the pattern: each step up multiplies by 2, each step down divides by 2.")
print("This is Law 1: 2^n · 2^1 = 2^(n+1).")
```

**Walkthrough:** The code first verifies Law 1 numerically for several base-exponent combinations. Then it demonstrates the forced definitions: $a^0 = 1$, $a^{-n} = 1/a^n$, and $a^{1/n} = \sqrt[n]{a}$. The final table shows $2^{-4}$ through $2^{4}$, making the multiplicative pattern $(2^n \cdot 2 = 2^{n+1})$ visually clear.

---

### Real Exponents

For rational $r = p/q$ (with $q > 0$ and in lowest terms), $a^r = (a^{1/q})^p$ for $a > 0$.

For irrational real exponents (like $2^\pi$), we define $a^x = \lim_{r \to x} a^r$ where $r$ ranges over rationals. This limit exists and is unique because the exponential function is continuous — but the proof of this requires limits (Phase 5) and the exponential function (Phase 4). We use real exponents freely now and justify them later.

**Summary of the extension chain:**

$$n \in \mathbb{N}: a^n \text{ (counting)}$$
$$\downarrow \text{ require Law 1 with } n=0$$
$$a^0 = 1 \text{ for } a \neq 0$$
$$\downarrow \text{ require Law 1 with negative exponents}$$
$$a^{-n} = 1/a^n$$
$$\downarrow \text{ require Law 2 with } n=1/q$$
$$a^{1/q} = \sqrt[q]{a}$$
$$\downarrow \text{ limits (Phase 5)}$$
$$a^x \text{ for all real } x > 0$$
$$\downarrow \text{ Euler's formula (Phase 4)}$$
$$a^{ix} = \cos(x\ln a) + i\sin(x\ln a)$$

Each step is forced by requiring the laws to continue holding.

---

## Connect the Pieces

Exponents build directly on the field axioms (they use multiplicative inverses) and ordering (we need $a > 0$ for real exponents to be defined unambiguously).

**Where exponent laws reappear:**

- **Phase 4 (Exponentials):** The function $e^x$ satisfies $e^{x+y} = e^x \cdot e^y$ — Law 1 for continuous exponents.
- **Phase 8 (Series):** The geometric series $\sum r^n$ uses the fact that $r^n \to 0$ when $|r| < 1$.
- **Phase 10 (Linear Algebra):** The matrix exponential $e^A = \sum_{n=0}^\infty A^n/n!$ requires Law 1 to hold for matrices.
- **Phase 14 (Number Theory):** Modular exponentiation $a^n \mod p$ uses Law 1 in modular arithmetic.

The **consistency principle** — extending by requiring existing laws to continue holding — is the single most important structural idea in Phase 17 (Abstract Algebra). Universal properties in category theory are the most general formulation of this principle.

---

## What Breaks Without This

Without deriving the exponent laws:
- Students confuse $a^m \cdot a^n = a^{m+n}$ with $(a^m)^n = a^{mn}$ and $a^{m+n}$ with $a^m + a^n$ (which is NOT an exponent law).
- Students accept $a^0 = 1$ as a fact to memorise, then panic when asked why. More importantly, they cannot use the rule confidently in unfamiliar contexts.
- When matrix exponents or complex exponents appear later, there is no mental framework for why the same laws should hold — each new context requires re-learning from scratch.

**Specific error:** $2^{1/2} \cdot 2^{1/2} = 2^{1/2 + 1/2} = 2^1 = 2$. So $\sqrt{2} \cdot \sqrt{2} = 2$. This is not magic — it is Law 1 applied to rational exponents. Students who understand the law can derive this; those who memorised formulas may not see why.

---

## Definition of Done

- [ ] You can derive all three exponent laws from the definition as repeated multiplication
- [ ] You can derive $a^0 = 1$, $a^{-n} = 1/a^n$, and $a^{1/n} = \sqrt[n]{a}$ as forced consequences of Law 1
- [ ] You can explain why $0^0$ is problematic and give the two conflicting limits
- [ ] You understand the extension chain: positive integers → all integers → rationals → reals → complex
- [ ] You ran the Python code and can describe what each section verifies

**Proof reconstruction (Sunday):** Without notes, derive: (1) $a^m \cdot a^n = a^{m+n}$ from the definition, (2) why $a^0 = 1$ must be the definition (not $a^0 = 0$), (3) why $a^{-1} = 1/a$.

---

## Answers to Quick Check

1. It is the forced consequence of the law $a^m \cdot a^n = a^{m+n}$: we need $a^m \cdot a^0 = a^m$, which forces $a^0 = 1$ (dividing by $a^m$). It is a definition chosen for consistency, but it is the only consistent choice.
2. $0^0$ is problematic because $\lim_{x \to 0^+} x^0 = 1$ but $\lim_{x \to 0^+} 0^x = 0$. The two limits disagree, so no single value is forced.
3. $2^{1/3}$ is the unique positive real whose cube is $2$. It is forced by requiring $(a^{1/3})^3 = a^{3 \cdot (1/3)} = a^1 = a$ — Law 2 with rational exponent.
