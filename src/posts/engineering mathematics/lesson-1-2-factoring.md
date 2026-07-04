# Stage 1, Lesson 1.2 — Factoring and the Factor Theorem
**Threads:** Math · CS  
**Estimated time:** 65–80 minutes

---

## What This Lesson Is About

Every polynomial is either irreducible — unable to be broken down further
— or it factors into simpler pieces. Finding those pieces is called
**factoring**, and it is one of the most practically useful operations in
algebra. The deep reason factoring matters is the **Factor Theorem**: a
number $c$ is a root of a polynomial if and only if $(x - c)$ is a factor.
This connects two ideas that sound unrelated — plugging in a value and
getting zero, versus writing the polynomial as a product — and makes them
the same question. By the end of this lesson you will be able to factor
polynomials by extracting common factors, using special identities, and
applying the Factor Theorem; you will implement synthetic division in code;
and you will understand why finding roots and finding factors are the same
problem. This matters in computing because root-finding algorithms —
used in numerical solvers, CAM software, and physics engines — are all
solving the factoring problem numerically.

---

## Historical Context

Factoring quadratics was known to Babylonian mathematicians around
1800 BCE, who solved $x^2 + bx = c$ geometrically by "completing the
square." The general cubic was factored by Tartaglia and Cardano in the
1540s — a genuinely difficult result. The Factor Theorem in its modern
form was stated clearly by René Descartes in *La Géométrie* (1637),
the same work that introduced the coordinate plane. The connection between
roots and factors is now so fundamental that it is easy to forget it
needed to be discovered. The algorithmic version of the Factor Theorem —
polynomial long division, or equivalently synthetic division — was the
standard algorithm for evaluating and decomposing polynomials until
Horner's method (Lesson 1.1) replaced it for evaluation purposes in 1819.

---

## What You Need To Know First

- **Polynomials, degree, leading coefficient** — Lesson 1.1.
  Factoring produces polynomials of lower degree.
- **Polynomial evaluation** — Lesson 1.1. The Factor Theorem is a
  statement about evaluating $p$ at a specific point.
- **Implication and biconditional** — Lesson 0.3. The Factor Theorem
  is an "if and only if" — $p(c) = 0 \Leftrightarrow (x-c)$ is a factor.

---

## The Lesson

### What Factoring Means

**Definition:** To **factor** a polynomial $p(x)$ is to write it as a
product of polynomials of lower degree:

$$p(x) = f_1(x) \cdot f_2(x) \cdots f_k(x)$$

where each $f_i$ has degree less than $\deg(p)$.

A polynomial that cannot be factored further (over $\mathbb{R}$) is called
**irreducible**. The simplest irreducible polynomials are linear:
$(x - c)$ for $c \in \mathbb{R}$ cannot be factored further.

**Why factor?** A factored polynomial reveals:
- Where the polynomial equals zero (the roots)
- The shape of the graph (where it crosses the $x$-axis)
- Simplifications for algebra — dividing, simplifying fractions

**Computational lens:** in numerical computing, finding roots of a
polynomial is equivalent to factoring it. A root-finding algorithm
like Newton's method (Stage 5) finds one root at a time, which
corresponds to extracting one linear factor at a time.

---

### Method 1 — Greatest Common Factor (GCF)

The first thing to check: does every term share a common factor?
If so, factor it out.

**Hand-worked example:** Factor $6x^3 + 9x^2 - 3x$.

Every term contains $x$ (the variable) and is divisible by 3 (the
constant). The greatest common factor is $3x$.

$$6x^3 + 9x^2 - 3x = 3x \cdot \frac{6x^3}{3x} + 3x \cdot \frac{9x^2}{3x} + 3x \cdot \frac{-3x}{3x}$$

$$= 3x(2x^2 + 3x - 1)$$

**Verify** by expanding: $3x(2x^2) + 3x(3x) + 3x(-1) = 6x^3 + 9x^2 - 3x$. ✓

**General rule:** find the GCF of all coefficients (using the Euclidean
algorithm from Lesson 0.9 — it applies to integers, not just polynomials),
and find the lowest power of $x$ present. Factor both out.

---

### Method 2 — Special Identities

Certain polynomial patterns factor according to fixed formulas. These are
worth knowing because they appear constantly.

**Difference of squares:**
$$a^2 - b^2 = (a - b)(a + b)$$

*Example:* $x^2 - 9 = x^2 - 3^2 = (x-3)(x+3)$.

*Example:* $4x^2 - 25 = (2x)^2 - 5^2 = (2x-5)(2x+5)$.

**Difference of cubes:**
$$a^3 - b^3 = (a-b)(a^2 + ab + b^2)$$

*Example:* $x^3 - 8 = x^3 - 2^3 = (x-2)(x^2+2x+4)$.

**Sum of cubes:**
$$a^3 + b^3 = (a+b)(a^2 - ab + b^2)$$

*Example:* $x^3 + 27 = x^3 + 3^3 = (x+3)(x^2-3x+9)$.

**Perfect square trinomial:**
$$a^2 \pm 2ab + b^2 = (a \pm b)^2$$

*Example:* $x^2 + 6x + 9 = x^2 + 2(3)x + 3^2 = (x+3)^2$.

**Hand-worked example:** Factor $8x^3 - 27$.

Recognise the difference of cubes: $8x^3 = (2x)^3$ and $27 = 3^3$.

$$8x^3 - 27 = (2x)^3 - 3^3 = (2x - 3)\big((2x)^2 + (2x)(3) + 3^2\big) = (2x-3)(4x^2 + 6x + 9)$$

**Verify** at $x = 0$: LHS $= -27$, RHS $= (-3)(9) = -27$. ✓
At $x = 1$: LHS $= 8 - 27 = -19$, RHS $= (-1)(4+6+9) = -19$. ✓

```python
import numpy as np

# Verify the special identity factorings numerically.
# For a given factoring claim, check that both sides equal the same value
# at several test points.

def verify_factoring(original_coeffs, factor_pairs, test_values, description):
    """
    Verify that a factored form equals the original polynomial.
    
    original_coeffs: list of coeffs for the original polynomial (descending)
    factor_pairs:    list of coefficient lists, one per factor
    test_values:     x-values to check at
    description:     label for printing
    """
    original = np.poly1d(original_coeffs)
    
    # Build the product of all factors
    product = np.poly1d([1])     # start with the multiplicative identity: p(x) = 1
    for factor_coeffs in factor_pairs:
        product = product * np.poly1d(factor_coeffs)
        # *= would also work: product *= np.poly1d(factor_coeffs)
    
    all_match = True
    for x in test_values:
        orig_val    = original(x)
        product_val = product(x)
        if not np.isclose(orig_val, product_val):
            # np.isclose: True if two values are within a small tolerance --
            # better than == for floating-point arithmetic
            print(f"  MISMATCH at x={x}: original={orig_val}, product={product_val}")
            all_match = False
    
    status = "✓" if all_match else "✗"
    print(f"{status} {description}")

test_x = [-3, -2, -1, 0, 1, 2, 3]

verify_factoring(
    [1, 0, -9],               # x^2 - 9
    [[1, -3], [1, 3]],        # (x-3)(x+3)
    test_x,
    "x^2 - 9 = (x-3)(x+3)"
)

verify_factoring(
    [1, 0, 0, -8],             # x^3 - 8
    [[1, -2], [1, 2, 4]],     # (x-2)(x^2+2x+4)
    test_x,
    "x^3 - 8 = (x-2)(x^2+2x+4)"
)

verify_factoring(
    [8, 0, 0, -27],            # 8x^3 - 27
    [[2, -3], [4, 6, 9]],     # (2x-3)(4x^2+6x+9)
    test_x,
    "8x^3 - 27 = (2x-3)(4x^2+6x+9)"
)

verify_factoring(
    [1, 6, 9],                 # x^2 + 6x + 9
    [[1, 3], [1, 3]],         # (x+3)^2
    test_x,
    "x^2 + 6x + 9 = (x+3)^2"
)
```

**Walkthrough:** `verify_factoring` starts with `product = np.poly1d([1])`,
the polynomial $p(x) = 1$ — the multiplicative identity for polynomials,
the same way 1 is the multiplicative identity for numbers. Each factor is
then multiplied in using `product = product * np.poly1d(factor_coeffs)`.
`np.isclose(a, b)` is used instead of `a == b` because polynomial
multiplication involves floating-point arithmetic, and tiny rounding
errors can make two equal values appear unequal when compared with `==`.
For example, $(2x-3)(4x^2+6x+9)$ expanded in floating-point might give
$-26.999999999$ instead of exactly $-27$ at certain test points.

---

### Method 3 — Factoring Quadratics

For $ax^2 + bx + c$, find two numbers that multiply to $ac$ and add to $b$.

**Hand-worked example:** Factor $x^2 - 5x + 6$.

We need two numbers that multiply to $1 \times 6 = 6$ and add to $-5$.
Candidates: $-2$ and $-3$. Check: $(-2)(-3) = 6$ ✓, $(-2)+(-3) = -5$ ✓.

$$x^2 - 5x + 6 = (x-2)(x-3)$$

**Verify:** $(x-2)(x-3) = x^2 - 3x - 2x + 6 = x^2 - 5x + 6$. ✓

**When the quadratic does not factor over $\mathbb{R}$:** the quadratic
formula $x = \dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a}$ gives roots when they
exist. If $b^2 - 4ac < 0$, the quadratic has no real roots and cannot
be factored over $\mathbb{R}$ — though it factors over $\mathbb{C}$ (Stage 1,
Lesson 1.12). The value $b^2 - 4ac$ is called the **discriminant** — it
*discriminates* between the cases of real and complex roots.

| $b^2 - 4ac$ | Roots | Factors over $\mathbb{R}$ |
|------------|-------|--------------------------|
| $> 0$ | Two distinct real roots | Yes: $(x - r_1)(x - r_2)$ |
| $= 0$ | One repeated real root | Yes: $(x - r)^2$ |
| $< 0$ | No real roots (two complex) | No (over $\mathbb{R}$) |

---

### The Factor Theorem

This is the central result of the lesson.

**Theorem (The Factor Theorem):** Let $p(x)$ be a polynomial.
Then $c$ is a root of $p$ — that is, $p(c) = 0$ — if and only if
$(x - c)$ is a factor of $p(x)$.

$$p(c) = 0 \quad \Longleftrightarrow \quad p(x) = (x-c) \cdot q(x)$$

for some polynomial $q(x)$ with $\deg(q) = \deg(p) - 1$.

*Proof.* This follows from the **Division Algorithm for Polynomials**:
for any polynomial $p(x)$ and any nonzero polynomial $d(x)$, there exist
unique polynomials $q(x)$ (quotient) and $r(x)$ (remainder) with:

$$p(x) = d(x) \cdot q(x) + r(x), \qquad \deg(r) < \deg(d)$$

Apply this with $d(x) = x - c$. Since $\deg(d) = 1$, the remainder
$r(x)$ must have degree less than 1 — so $r(x) = r$ is a constant.

$$p(x) = (x - c) \cdot q(x) + r$$

Substitute $x = c$:

$$p(c) = (c - c) \cdot q(c) + r = 0 \cdot q(c) + r = r$$

So the remainder equals $p(c)$.

**$(\Rightarrow)$** If $p(c) = 0$, then $r = 0$, so $p(x) = (x-c) \cdot q(x)$ —
meaning $(x-c)$ is a factor.

**$(\Leftarrow)$** If $(x-c)$ is a factor, then $r = 0$, so $p(c) = r = 0$. $\blacksquare$

**Key insight:** the proof shows something stronger than the theorem states.
Not only is the root-factor connection true, but the **remainder when
dividing $p(x)$ by $(x-c)$ is exactly $p(c)$**. This is called the
**Remainder Theorem** and gives a fast way to evaluate $p(c)$: just
divide by $(x-c)$ and read off the remainder.

```python
import numpy as np
import matplotlib.pyplot as plt

# Demonstrate the Factor Theorem
# p(x) = x^3 - 6x^2 + 11x - 6 = (x-1)(x-2)(x-3)
p = np.poly1d([1, -6, 11, -6])

x = np.linspace(-0.5, 4.0, 400)

fig, ax = plt.subplots(figsize=(9, 6))
ax.plot(x, p(x), color='#2980b9', lw=2.5,
        label='$p(x) = x^3-6x^2+11x-6$')
ax.axhline(0, color='#333', lw=0.8)
ax.axvline(0, color='#333', lw=0.8)

# Mark each root and its corresponding factor
root_info = [
    (1, '#e74c3c', '$(x-1)$'),
    (2, '#27ae60', '$(x-2)$'),
    (3, '#8e44ad', '$(x-3)$'),
]
for c, color, factor_label in root_info:
    ax.plot(c, 0, 'o', color=color, markersize=11, zorder=6)
    ax.annotate(
        f'$p({c})=0$\n{factor_label} is a factor',
        xy=(c, 0),
        xytext=(c + 0.12, 0.9 if c != 2 else -1.2),
        # xytext: label position, shifted to avoid overlap
        fontsize=9, color=color,
        arrowprops=dict(arrowstyle='->', color=color, lw=1.2)
    )

ax.set_title('Factor Theorem: each root $c$ gives a factor $(x-c)$\n'
             '$p(x) = (x-1)(x-2)(x-3)$', fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('$p(x)$')
ax.set_ylim(-3, 4)
ax.legend(fontsize=10)
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `ax.annotate(text, xy=..., xytext=..., arrowprops=...)`
draws a label connected to a point — first seen in Lesson 0.8 and
reused here without re-explanation. `xytext=(c + 0.12, 0.9 if c != 2 else -1.2)`
uses a conditional expression (Lesson 0.4) to place the label above most
roots but below the root at $x=2$, where placing it above would overlap
with the curve.

---

### Synthetic Division

Dividing $p(x)$ by $(x - c)$ using long division is correct but tedious.
**Synthetic division** is a streamlined algorithm that works only when
the divisor is linear: $(x - c)$.

**The algorithm for dividing $p(x) = a_n x^n + \cdots + a_0$ by $(x-c)$:**

1. Write the coefficients of $p$ in a row: $[a_n,\ a_{n-1},\ \ldots,\ a_0]$
2. Bring down the leading coefficient $a_n$
3. Multiply it by $c$; write the result under $a_{n-1}$
4. Add the column; that sum is the next coefficient of the quotient
5. Repeat until finished
6. The last number in the bottom row is the remainder (which equals $p(c)$)

**Hand-worked example:** Divide $x^3 - 6x^2 + 11x - 6$ by $(x-2)$.

$$c = 2, \quad \text{coefficients: } [1,\ -6,\ 11,\ -6]$$

| | 1 | −6 | 11 | −6 |
|-|---|----|----|-----|
| $\times 2$ | ↓ | 2 | −8 | 6 |
| | **1** | **−4** | **3** | **0** |

Read the bottom row: quotient coefficients $[1, -4, 3]$, remainder $0$.

$$x^3 - 6x^2 + 11x - 6 = (x-2)(x^2 - 4x + 3)$$

**Verify the remainder:** $p(2) = 8 - 24 + 22 - 6 = 0$. ✓ (Remainder Theorem.)

**Complete the factoring:** $x^2 - 4x + 3 = (x-1)(x-3)$, so:

$$x^3 - 6x^2 + 11x - 6 = (x-1)(x-2)(x-3)$$

```python
def synthetic_division(coefficients, c):
    """
    Divide the polynomial (given by descending coefficients)
    by the linear factor (x - c) using synthetic division.
    
    Returns (quotient_coefficients, remainder).
    
    coefficients: list of polynomial coefficients in DESCENDING order
    c:            the root value (the c in (x - c))
    """
    # Start the bottom row with the leading coefficient
    result = [coefficients[0]]
    
    # Each step: multiply last result by c, add next coefficient
    for coefficient in coefficients[1:]:
        # coefficients[1:]: all coefficients except the first (slice notation)
        next_value = result[-1] * c + coefficient
        # result[-1]: the most recently computed value (last element of result)
        result.append(next_value)
    
    # All values except the last are quotient coefficients;
    # the last value is the remainder
    quotient_coeffs = result[:-1]   # all but last
    remainder       = result[-1]    # just the last
    
    return quotient_coeffs, remainder


# Verify against the hand-worked example
coeffs = [1, -6, 11, -6]   # x^3 - 6x^2 + 11x - 6

print("Synthetic division examples:\n")

for c in [1, 2, 3]:
    quotient_coeffs, remainder = synthetic_division(coeffs, c)
    
    import numpy as np
    # Verify: remainder should equal p(c)
    p = np.poly1d(coeffs)   # np.poly1d: unchanged from Lesson 1.1
    p_at_c = p(c)
    
    print(f"  Divide by (x - {c}):  c = {c}")
    print(f"    Quotient coefficients: {quotient_coeffs}")
    print(f"    Remainder: {remainder}")
    print(f"    p({c}) = {p_at_c}  (should equal remainder: {remainder == p_at_c})")
    print()
```

**Walkthrough:** `coefficients[1:]` is a **slice** — it returns every
element of the list except the first. `result[-1]` accesses the last
element (Python's negative indexing, reused from Lesson 0.9). The loop
implements the synthetic division algorithm exactly as described above:
each iteration multiplies the previous result by $c$ and adds the next
coefficient, growing the `result` list one element at a time. At the end,
`result[:-1]` takes all but the last element (the quotient coefficients),
and `result[-1]` is the remainder.

---

### Finding All Roots by Repeated Factoring

Once one root is found, synthetic division reduces the polynomial's degree
by 1. Repeat until fully factored.

**Hand-worked example:** Factor $p(x) = x^3 - 6x^2 + 11x - 6$ completely.

**Step 1:** Test $c = 1$: $p(1) = 1 - 6 + 11 - 6 = 0$. Root found.

Synthetic division by $(x-1)$:

| | 1 | −6 | 11 | −6 |
|-|---|----|----|-----|
|$\times 1$| ↓ | 1 | −5 | 6 |
| | **1** | **−5** | **6** | **0** |

Quotient: $x^2 - 5x + 6$.

**Step 2:** Factor $x^2 - 5x + 6$. Need two numbers multiplying to 6,
adding to $-5$: those are $-2$ and $-3$.

$$x^2 - 5x + 6 = (x-2)(x-3)$$

**Complete factoring:** $p(x) = (x-1)(x-2)(x-3)$.

**Which values to try first?** The **Rational Root Theorem** (not proved
here, but useful to know): if $p(x) = a_n x^n + \cdots + a_0$ has integer
coefficients, any rational root has the form $\pm \dfrac{\text{factor of } a_0}{\text{factor of } a_n}$.

For $x^3 - 6x^2 + 11x - 6$: $a_0 = -6$, $a_n = 1$. Possible rational
roots: $\pm 1, \pm 2, \pm 3, \pm 6$. We found 1, 2, 3 — all were right.

```python
import numpy as np

def find_rational_roots(coefficients):
    """
    Use the Rational Root Theorem to find all rational roots of an
    integer-coefficient polynomial.
    
    Returns a list of rational roots found.
    Tests ±(factor of a_0) / (factor of a_n).
    """
    from math import gcd as int_gcd   # math.gcd: integer GCD, from Python's math module
    
    a_n = int(abs(coefficients[0]))    # leading coefficient (absolute value)
    a_0 = int(abs(coefficients[-1]))   # constant term (absolute value)
    
    if a_0 == 0:
        # If a_0 = 0, then x=0 is always a root
        return [0]
    
    # Find all factors of a_n and a_0
    def factors(n):
        """Return all positive divisors of n."""
        return [i for i in range(1, n + 1) if n % i == 0]
    
    candidates = set()
    for p in factors(a_0):
        for q in factors(a_n):
            candidates.add( p / q)   # positive candidate
            candidates.add(-p / q)   # negative candidate
    
    p_poly = np.poly1d(coefficients)  # np.poly1d: unchanged from Lesson 1.1
    
    rational_roots = []
    for candidate in sorted(candidates):
        if np.isclose(p_poly(candidate), 0):
            # np.isclose: within tolerance of zero -- handles floating-point
            rational_roots.append(candidate)
    
    return sorted(rational_roots)

# Test on our example
coeffs_example = [1, -6, 11, -6]
roots = find_rational_roots(coeffs_example)
print(f"p(x) = x^3 - 6x^2 + 11x - 6")
print(f"Rational roots found: {roots}")
print()

# Try another: x^3 - 7x + 6 = (x-1)(x-2)(x+3) -- note negative root
coeffs2 = [1, 0, -7, 6]
roots2 = find_rational_roots(coeffs2)
print(f"q(x) = x^3 - 7x + 6")
print(f"Rational roots found: {roots2}")

import numpy as np
p2 = np.poly1d(coeffs2)
for r in roots2:
    print(f"  q({r:.0f}) = {p2(r):.6f}")
```

**Walkthrough:** `from math import gcd as int_gcd` imports `gcd`
from Python's built-in `math` module and renames it `int_gcd` —
the `as` keyword creates an alias. This avoids naming conflicts if
a `gcd` function were defined elsewhere. `factors(n)` is a local
function defined inside `find_rational_roots` — Python allows
**nested functions**, which are only visible inside the enclosing
function. The `set()` for candidates automatically removes duplicates:
$\frac{2}{1}$ and $\frac{4}{2}$ both produce candidate 2.0, but a
set stores it only once.

---

## Connect the Pieces

**What this lesson built on:** Polynomials (Lesson 1.1) — factoring
produces lower-degree polynomials. The biconditional $\Leftrightarrow$
(Lesson 0.3) — the Factor Theorem is stated and proved as an iff.
The Division Algorithm mirrors the integer division of Lesson 0.9
(dividing integers leaves a remainder) — polynomials have the same
structure.

**What this lesson makes possible:** Lesson 1.3 (Polynomial Division
and the Remainder Theorem) develops long division for higher-degree
divisors. Lesson 1.4 (The Fundamental Theorem of Algebra) uses the
Factor Theorem to count roots — a degree-$n$ polynomial has exactly
$n$ roots in $\mathbb{C}$, because it can be factored into exactly $n$
linear factors over $\mathbb{C}$.

**In CS and manufacturing:** root-finding is one of the most common
numerical problems in engineering software. Finding where a toolpath
intersects a surface is a root-finding problem — where does
$p(t) = 0$ along the parameterised curve? CAM software solves
versions of this millions of times per operation. Newton's method
(Stage 5) is the standard numerical root-finder, and understanding
it requires knowing that roots and factors are the same thing.

---

## Summary

**Factoring** writes $p(x) = f_1(x) \cdot f_2(x) \cdots$ with each
$\deg(f_i) < \deg(p)$.

**Special identities:**
$$a^2 - b^2 = (a-b)(a+b)$$
$$a^3 - b^3 = (a-b)(a^2+ab+b^2)$$
$$a^3 + b^3 = (a+b)(a^2-ab+b^2)$$

**Factor Theorem:** $p(c) = 0 \Leftrightarrow (x-c)$ is a factor of $p$.

**Remainder Theorem:** when $p(x)$ is divided by $(x-c)$, the remainder
equals $p(c)$.

**Synthetic division:** divides $p$ by $(x-c)$ in $O(n)$ steps.
The algorithm: bring down leading coefficient; repeatedly multiply by $c$
and add the next coefficient; last value is the remainder.

**Rational Root Theorem:** rational roots of an integer-coefficient
polynomial $a_n x^n + \cdots + a_0$ have the form
$\pm \dfrac{\text{factor of } a_0}{\text{factor of } a_n}$.

**Discriminant** $b^2 - 4ac$: positive → two real roots; zero →
one repeated root; negative → no real roots.

**New Python:**
- `from module import name as alias` — import with renaming
- Nested functions — functions defined inside other functions
- `set()` — automatically removes duplicate values

---

## Problems

### Math

**1.** Factor each polynomial completely over $\mathbb{R}$.

(a) $x^2 - 16$

(b) $2x^3 - 8x$

(c) $x^3 + 27$

(d) $x^2 - 7x + 12$

(e) $6x^2 + 7x - 3$

<details>
<summary>Hints</summary>

(a) Difference of squares.
(b) Factor out $2x$ first, then difference of squares.
(c) Sum of cubes.
(d) Find two numbers multiplying to 12 and adding to $-7$.
(e) Need two numbers multiplying to $6 \times (-3) = -18$ and adding to 7.
    Try $9$ and $-2$: $9 \times (-2) = -18$, $9 + (-2) = 7$.
    Rewrite: $6x^2 + 9x - 2x - 3 = 3x(2x+3) - 1(2x+3) = (3x-1)(2x+3)$.

</details>

<details>
<summary>Answers</summary>

(a) $(x-4)(x+4)$

(b) $2x(x^2-4) = 2x(x-2)(x+2)$

(c) $(x+3)(x^2-3x+9)$

(d) $(x-3)(x-4)$

(e) $(3x-1)(2x+3)$

</details>

---

**2.** Use the Factor Theorem to determine whether each binomial is a
factor of $p(x) = 2x^3 + 3x^2 - 11x - 6$.

(a) $(x-2)$ &emsp; (b) $(x+3)$ &emsp; (c) $(x-1)$ &emsp; (d) $(2x+1)$

Then use synthetic division to find the full factoring.

<details>
<summary>Hint</summary>

For (d): $(2x+1) = 0$ when $x = -\frac{1}{2}$. The Factor Theorem
still works — check $p(-\frac{1}{2})$.

</details>

<details>
<summary>Answers</summary>

(a) $p(2) = 16+12-22-6 = 0$ ✓ — factor.
(b) $p(-3) = -54+27+33-6 = 0$ ✓ — factor.
(c) $p(1) = 2+3-11-6 = -12 \neq 0$ — not a factor.
(d) $p(-\frac{1}{2}) = 2(-\frac{1}{8})+3(\frac{1}{4})-11(-\frac{1}{2})-6 = -\frac{1}{4}+\frac{3}{4}+\frac{11}{2}-6 = 0$ ✓ — factor.

Full factoring: $2x^3+3x^2-11x-6 = (x-2)(x+3)(2x+1)$.

</details>

---

**3.** (Proof) Prove the **Remainder Theorem** directly (without using
the Factor Theorem): when $p(x)$ is divided by $(x-c)$, the remainder
equals $p(c)$.

<details>
<summary>Answer</summary>

By the Division Algorithm, $p(x) = (x-c)q(x) + r$ where $r$ is a constant.
Substituting $x = c$: $p(c) = (c-c)q(c) + r = 0 + r = r$. $\blacksquare$

</details>

---

### Code Challenges

**Challenge 1 — Synthetic division**

```python
def synthetic_division(coefficients, c):
    """
    Divide the polynomial given by (descending) coefficients by (x - c).
    Returns (quotient_coefficients, remainder).
    """
    pass  # your code here


# --- tests: do not modify ---
# x^3 - 6x^2 + 11x - 6 divided by (x - 1)
q, r = synthetic_division([1, -6, 11, -6], 1)
assert q == [1, -5, 6],  f"quotient wrong: {q}"
assert r == 0,            f"remainder wrong: {r}"

# x^3 - 6x^2 + 11x - 6 divided by (x - 2)
q, r = synthetic_division([1, -6, 11, -6], 2)
assert q == [1, -4, 3],  f"quotient wrong: {q}"
assert r == 0,            f"remainder wrong: {r}"

# x^2 + 1 divided by (x - 1): remainder should be p(1) = 2
q, r = synthetic_division([1, 0, 1], 1)
assert r == 2, f"remainder should be p(1)=2, got {r}"

# Constant polynomial: 5 divided by (x - 3): quotient=[], remainder=5
q, r = synthetic_division([5], 3)
assert r == 5, f"remainder should be 5, got {r}"

print("✓ Challenge 1 passed!")
```

<details>
<summary>Hint</summary>

Follow the algorithm exactly: start with `result = [coefficients[0]]`.
Loop through `coefficients[1:]`. Each step: append `result[-1] * c + coefficient`.
Return `result[:-1]` as the quotient and `result[-1]` as the remainder.

</details>

---

**Challenge 2 — Full factoring over the rationals**

Use synthetic division and the Rational Root Theorem to factor a
polynomial completely, returning a list of found linear factors
and any remaining irreducible factor.

```python
import numpy as np
from math import gcd

def factor_completely(coefficients):
    """
    Factor the polynomial completely by:
    1. Finding rational roots using the Rational Root Theorem
    2. Dividing out each root using synthetic division
    3. Returning (list_of_roots, remaining_coefficients)
    
    list_of_roots:         all rational roots found (with multiplicity)
    remaining_coefficients: coefficients of the remaining polynomial
                            after all rational roots are divided out
    """
    pass  # your code here


# --- tests: do not modify ---
# x^3 - 6x^2 + 11x - 6 = (x-1)(x-2)(x-3)
roots, remaining = factor_completely([1, -6, 11, -6])
assert sorted(roots) == [1, 2, 3], f"roots wrong: {roots}"
assert np.poly1d(remaining).order == 0, "should be fully factored"

# x^2 - 5x + 6 = (x-2)(x-3)
roots2, remaining2 = factor_completely([1, -5, 6])
assert sorted(roots2) == [2, 3], f"roots wrong: {roots2}"

# x^2 + 1: no real roots, should return empty list and original polynomial
roots3, remaining3 = factor_completely([1, 0, 1])
assert roots3 == [], f"should have no real roots: {roots3}"
assert list(remaining3) == [1, 0, 1], f"remaining should be original: {remaining3}"

print("✓ Challenge 2 passed!")
```

<details>
<summary>Hint</summary>

Loop: while the polynomial has degree ≥ 1, try each rational root
candidate. If `p(candidate) ≈ 0`, add it to the roots list and
divide it out using `synthetic_division`. Update the working coefficients
to the quotient. Repeat. Stop when no rational root is found (the
remaining polynomial is irreducible over ℚ).

</details>

---

**Challenge 3 — Visualise factoring**

Given a polynomial's roots, plot the polynomial and mark each root
with a label showing its corresponding factor. Use different colours for
each root.

```python
import matplotlib.pyplot as plt
import numpy as np

def plot_factored_polynomial(coefficients, title):
    """
    Plot the polynomial and mark all real roots.
    Each root is labelled with its factor (x - c).
    """
    pass  # your code here


# No automated test -- the visual is the result.
# Test with p(x) = 2x^3 + 3x^2 - 11x - 6 = (x-2)(x+3)(2x+1)
plot_factored_polynomial([2, 3, -11, -6], '$p(x) = 2x^3+3x^2-11x-6$')
```

<details>
<summary>Hint</summary>

Use `np.roots(coefficients)` to find all roots, then filter to real ones
using `abs(root.imag) < 1e-8`. Choose an x-range that shows all roots
with some margin. Use a different colour for each root. Use `ax.annotate`
to label each root with `f'$x={root:.2f}$\n$(x-{root:.2f})$'`.

</details>

---

### Extension

**4. ★** The **multiplicity** of a root $c$ is the largest $k$ such
that $(x-c)^k$ divides $p(x)$.

(a) Show that $x = 2$ has multiplicity 2 in $p(x) = x^3 - 4x^2 + 4x$.

(b) At a root of multiplicity 1, the curve crosses the $x$-axis.
At a root of multiplicity 2, it *touches* but does not cross.
Plot $p(x) = x^3 - 4x^2 + 4x$ and $q(x) = (x-1)(x-2)(x-3)$
side by side. Observe the difference in behaviour at $x=2$.

(c) What happens at a root of odd multiplicity $\geq 3$? Plot
$r(x) = x^3$ (root of multiplicity 3 at $x=0$) and compare.

<details>
<summary>Answer to (a)</summary>

$p(x) = x^3-4x^2+4x = x(x^2-4x+4) = x(x-2)^2$.
So $(x-2)^2$ divides $p$ but $(x-2)^3$ does not. Multiplicity of
$x=2$ is 2.

</details>
