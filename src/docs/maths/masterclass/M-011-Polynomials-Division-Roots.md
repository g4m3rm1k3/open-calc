# M-011 — Polynomials: Division, Roots, and the Fundamental Theorem

**Phase 3 · Polynomials and Rational Functions · Lesson 1 of 2**
**Pillar: Structure** · *The algebraic functions — and the theorem that guarantees their roots exist*

---

## What You Will Build

A Python polynomial division implementation that prints the quotient and remainder, verifies the Remainder Theorem by substitution, and factors polynomials using the Factor Theorem. By the end you see why the Fundamental Theorem of Algebra is remarkable — and what it means for every polynomial ever written.

---

## What You Need to Know First

- M-003: field axioms (polynomial coefficients live in a field)
- M-005: the quadratic formula (the simplest case of finding polynomial roots)
- M-008: functions (polynomials are functions from $\mathbb{R}$ to $\mathbb{R}$)

---

> **Quick Check — try to answer before reading:**
>
> 1. If $f(3) = 0$, what can you say about the factorisation of $f$?
> 2. Can a degree-3 polynomial have no real roots? Why or why not?
> 3. What does "root with multiplicity 2" mean geometrically?
>
> *(Answers at the end of this lesson)*

---

## The Lesson

### Polynomials

A **polynomial** of degree $n$ is:
$$p(x) = a_n x^n + a_{n-1} x^{n-1} + \cdots + a_1 x + a_0$$

where $a_n \neq 0$. The $a_i$ are the **coefficients** (real numbers in this phase; complex numbers are also allowed). The **roots** of $p$ are the values of $x$ where $p(x) = 0$.

Polynomials are the simplest class of functions: they require only addition, subtraction, and multiplication to define. Yet they can approximate any continuous function on a closed interval to any desired precision (Weierstrass Approximation Theorem, proved in Phase 16).

---

### The Division Algorithm for Polynomials

**Theorem:** For polynomials $f(x)$ and $d(x)$ with $\deg(d) \geq 1$, there exist unique polynomials $q(x)$ (quotient) and $r(x)$ (remainder) with $\deg(r) < \deg(d)$, such that:
$$f(x) = d(x) \cdot q(x) + r(x)$$

This is the exact analogue of integer division with remainder: $17 = 3 \cdot 5 + 2$ (quotient 5, remainder 2).

**Math lens:** Integers and polynomials have the same division property because they share an abstract algebraic structure: they are both **Euclidean domains**. In both cases you can perform "Euclidean division" — divide and get a remainder strictly smaller than the divisor. This common structure is studied in Phase 17 (Abstract Algebra). The Euclidean algorithm for computing GCDs works identically in both settings.

---

### The Remainder Theorem

**Theorem:** When $f(x)$ is divided by $(x - a)$, the remainder is $f(a)$.

**Proof:** By the division algorithm with $d(x) = x - a$, the remainder $r$ has $\deg(r) < \deg(x-a) = 1$, so $r$ is a constant. We have $f(x) = (x - a) \cdot q(x) + r$ for all $x$. Setting $x = a$: $f(a) = (a - a) \cdot q(a) + r = 0 + r = r$. $\square$

**Corollary (Factor Theorem):** $(x - a)$ is a factor of $f(x)$ if and only if $f(a) = 0$.

**Proof:** By the Remainder Theorem, the remainder when dividing by $(x-a)$ is $f(a)$. The remainder is zero (i.e., $(x-a)$ divides $f$ exactly) if and only if $f(a) = 0$. $\square$

**Why this matters:** To factor $f(x)$, find a root. To find a root, try evaluating $f$ at small integers or rational numbers $p/q$ where $p \mid a_0$ and $q \mid a_n$ (Rational Root Theorem). Each root gives one factor $(x - a)$, reducing the degree by 1.

---

### Multiplicity

If $(x - a)^k$ divides $f(x)$ but $(x - a)^{k+1}$ does not, then $a$ is a root of **multiplicity** $k$.

- Multiplicity 1 (*simple root*): the graph crosses the $x$-axis.
- Multiplicity 2 (*double root*): the graph touches the $x$-axis and bounces back (tangent to the axis).
- Multiplicity 3: the graph crosses but flattens at the root.

The discriminant $\Delta$ from M-005 detects this: $\Delta = 0$ means a repeated (multiplicity 2) root.

---

### The Fundamental Theorem of Algebra

**Theorem (Fundamental Theorem of Algebra, FTA):** Every polynomial of degree $n \geq 1$ with complex coefficients has exactly $n$ roots in $\mathbb{C}$, counting multiplicity.

**Proof:** The full proof requires complex analysis (contour integrals or Liouville's theorem) and is beyond our current tools. We state it here and use it freely. Phase 16 will have the tools to sketch the proof; a complete proof is in advanced complex analysis.

**Corollaries:**

1. Every real polynomial of degree $n$ factors over $\mathbb{C}$ as $a_n(x - r_1)(x - r_2)\cdots(x - r_n)$.
2. Every real polynomial of **odd degree** has at least one **real** root. (Proved using the Intermediate Value Theorem in Phase 5 — a degree-3 polynomial goes to $+\infty$ as $x \to +\infty$ and $-\infty$ as $x \to -\infty$, so it must cross zero somewhere.)
3. Complex roots of real polynomials come in conjugate pairs: if $a + bi$ is a root, so is $a - bi$.

```python
import math

def poly_eval(coeffs, x):
    """
    Evaluate polynomial with coefficients [a_n, a_{n-1}, ..., a_0] at x.
    Uses Horner's method: a_n*x^n + ... = (...((a_n*x + a_{n-1})*x + a_{n-2})...)*x + a_0
    Horner's method reduces n^2 multiplications to n — a classic algorithmic optimisation.
    """
    result = 0
    for coeff in coeffs:
        result = result * x + coeff
    return result

def poly_divmod(dividend_coeffs, divisor_coeffs):
    """
    Polynomial long division: returns (quotient_coeffs, remainder_coeffs).
    Both are lists [leading coeff, ..., constant term].
    """
    dividend = list(dividend_coeffs)
    divisor  = list(divisor_coeffs)
    n = len(dividend) - 1      # degree of dividend
    m = len(divisor) - 1       # degree of divisor

    if n < m:
        return [0], dividend   # quotient = 0, remainder = dividend

    quotient = []
    for i in range(n - m + 1):
        # Leading coefficient of current dividend divided by leading coeff of divisor
        coeff = dividend[i] / divisor[0]
        quotient.append(coeff)
        # Subtract coeff * divisor from dividend
        for j in range(m + 1):
            dividend[i + j] -= coeff * divisor[j]

    remainder = dividend[n - m + 1:]
    # Remove leading zeros from remainder
    while len(remainder) > 1 and abs(remainder[0]) < 1e-12:
        remainder.pop(0)

    return quotient, remainder


def poly_to_str(coeffs):
    """Format polynomial coefficients as a readable string."""
    degree = len(coeffs) - 1
    terms = []
    for i, c in enumerate(coeffs):
        power = degree - i
        if abs(c) < 1e-10:
            continue
        if power == 0:
            terms.append(f"{c:.4g}")
        elif power == 1:
            terms.append(f"{c:.4g}x")
        else:
            terms.append(f"{c:.4g}x^{power}")
    return " + ".join(terms) if terms else "0"


# Example 1: Divide f(x) = x^3 - 7x + 6 by (x - 2)
# Coefficients: [1, 0, -7, 6] for x^3 + 0*x^2 - 7*x + 6
f_coeffs = [1, 0, -7, 6]
d_coeffs = [1, -2]            # (x - 2)

q, r = poly_divmod(f_coeffs, d_coeffs)
print(f"f(x) = {poly_to_str(f_coeffs)}")
print(f"d(x) = {poly_to_str(d_coeffs)}")
print(f"Quotient:  q(x) = {poly_to_str(q)}")
print(f"Remainder: r    = {poly_to_str(r)}")
print()

# Remainder Theorem: r should equal f(2)
f_at_2 = poly_eval(f_coeffs, 2)
print(f"Remainder Theorem check: r = {float(r[0]):.4f}, f(2) = {f_at_2:.4f}  {'✓' if abs(float(r[0]) - f_at_2) < 1e-10 else '✗'}")
print()

# Factor Theorem: find all integer roots of x^3 - 7x + 6 = 0
print("Factor Theorem: find integer roots of x^3 - 7x + 6 = 0")
for candidate in range(-10, 11):
    val = poly_eval(f_coeffs, candidate)
    if abs(val) < 1e-10:
        print(f"  Root found: x = {candidate},  f({candidate}) = {val}")

print()

# Verify FTA: x^3 - 7x + 6 should factor as (x-1)(x-2)(x+3)
print("Factorisation: (x-1)(x-2)(x+3) = x^3 - 7x + 6?")
for x in range(-5, 6):
    from_factors = (x - 1) * (x - 2) * (x + 3)
    from_poly    = poly_eval(f_coeffs, x)
    match = abs(from_factors - from_poly) < 1e-10
    if not match:
        print(f"  MISMATCH at x={x}: factors give {from_factors}, poly gives {from_poly}")
print("  All values match ✓")

print()
# Horner's method efficiency note
print("Horner's method evaluates degree-n polynomial in n multiplications (not n^2).")
print("For degree 1000: Horner uses 1000 multiplications vs naive O(n^2) ≈ 500,000.")
```

**Walkthrough of `poly_divmod`:** This implements polynomial long division — the same algorithm you do by hand, automated. The outer loop subtracts multiples of the divisor from the dividend to eliminate the leading term, one step at a time. After $n - m + 1$ steps, the remaining polynomial has degree less than $m$ — that is the remainder. `poly_eval` uses **Horner's method**, which rewrites $a_n x^n + \cdots + a_0$ as $(\cdots((a_n \cdot x + a_{n-1}) \cdot x + a_{n-2}) \cdots) \cdot x + a_0$. This reduces evaluation from $O(n^2)$ to $O(n)$ operations — the first algorithm optimisation in the curriculum.

---

## Connect the Pieces

The division algorithm for polynomials in $\mathbb{R}[x]$ mirrors the division algorithm for $\mathbb{Z}$ (integers). Both are **Euclidean domains**. In Phase 17, this parallel is formalised: the same abstract structure gives both the same GCD algorithm, the same factorisation properties, and the same module theory.

The Factor Theorem connects to:
- M-025 (Taylor series): a Taylor series is a polynomial (infinite degree) expansion. The roots of the truncated polynomial approximate the roots of the function.
- M-032 (Eigenvalues): the characteristic polynomial $\det(A - \lambda I) = 0$ is a degree-$n$ polynomial. Its roots are the eigenvalues. FTA guarantees exactly $n$ eigenvalues in $\mathbb{C}$.

---

## What Breaks Without This

Without the Remainder Theorem:
- Finding roots requires guessing and checking every candidate. With the theorem: find one root, divide out the factor, repeat with a polynomial of degree $n-1$.

Without FTA:
- You do not know how many eigenvalues to expect for a matrix. A $3 \times 3$ matrix might seem to have no eigenvalues if you only look in $\mathbb{R}$.

---

## Definition of Done

- [ ] You can state the division algorithm for polynomials and explain the analogy with integer division
- [ ] You can prove the Remainder Theorem from the division algorithm
- [ ] You can use the Factor Theorem to factorise a polynomial given one root
- [ ] You can state the FTA and its three corollaries (counting roots, odd degree, conjugate pairs)
- [ ] You can explain Horner's method and why it is more efficient than naive evaluation
- [ ] You ran the Python code and can trace through `poly_divmod` for a 2-step division

**Proof reconstruction (Sunday):** Prove the Remainder Theorem. Then factor $p(x) = x^3 + x^2 - 4x - 4$ completely by finding roots and applying the Factor Theorem.

---

## Answers to Quick Check

1. By the Factor Theorem, $(x - 3)$ is a factor of $f$: $f(x) = (x-3) \cdot q(x)$ for some polynomial $q$.
2. A degree-3 polynomial with real coefficients always has at least one real root. A degree-3 polynomial with $a_3 > 0$ satisfies $p(x) \to +\infty$ as $x \to +\infty$ and $p(x) \to -\infty$ as $x \to -\infty$. By the IVT (Phase 5), it must cross zero. The other two roots may be complex.
3. Geometrically, a double root means the graph is tangent to the $x$-axis at that point — it touches zero and bounces back, not crossing through.
