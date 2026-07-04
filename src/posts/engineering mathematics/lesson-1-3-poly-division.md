# Stage 1, Lesson 1.3 — Polynomial Division and the Remainder Theorem
**Threads:** Math · CS  
**Estimated time:** 60–75 minutes

---

## What This Lesson Is About

Lesson 1.2 introduced synthetic division — a fast method for dividing
by linear factors $(x - c)$. But not every divisor is linear. When you
divide by a quadratic or higher-degree polynomial, you need the full
**polynomial long division** algorithm. This lesson builds that algorithm
step by step, proves that it always terminates, and derives the
**Remainder Theorem** as its most important consequence. The Remainder
Theorem turns polynomial evaluation into a division problem and polynomial
division into an evaluation problem — two sides of the same coin.
You will implement long division in code from scratch — not using
`np.polydiv` as a black box, but building the algorithm yourself —
which is the same operation that computer algebra systems perform
internally when simplifying rational expressions, and that compilers
use when reducing modular arithmetic expressions.

---

## Historical Context

Polynomial long division mirrors integer long division in structure —
and this is no accident. Euclid's algorithm for finding the GCD of two
integers (Lesson 0.9, used in the proof that $\sqrt{2}$ is irrational)
has a direct analogue for polynomials, sometimes called the **Euclidean
algorithm for polynomials**. Both algorithms rest on the same idea:
repeatedly divide, keep the remainder, and repeat until the remainder
is zero. The polynomial version was developed alongside symbolic algebra
in the 16th and 17th centuries. In 1819, William George Horner published
his evaluation method (Lesson 1.1), which was partly motivated by
noticing that synthetic division and polynomial evaluation are the same
operation — the Remainder Theorem, which he exploited algorithmically
decades before it was stated as a clean theorem.

---

## What You Need To Know First

- **Polynomials, degree, leading coefficient** — Lesson 1.1.
- **Synthetic division for linear divisors** — Lesson 1.2.
  This lesson generalises that to any divisor.
- **The Factor Theorem** — Lesson 1.2. The Remainder Theorem is
  the stronger statement underlying it.

---

## The Lesson

### The Division Algorithm for Polynomials

**Theorem (Division Algorithm):** Let $p(x)$ and $d(x)$ be polynomials
with $d(x) \neq 0$. There exist unique polynomials $q(x)$ (the
**quotient**) and $r(x)$ (the **remainder**) such that:

$$p(x) = d(x) \cdot q(x) + r(x)$$

where either $r(x) = 0$ or $\deg(r) < \deg(d)$.

**Formal lens:** this is the polynomial analogue of integer division.
For integers: $17 = 3 \cdot 5 + 2$ — dividend equals divisor times
quotient plus remainder, with remainder smaller than divisor.
For polynomials: "smaller" means lower degree instead of lesser magnitude.
The uniqueness of $q$ and $r$ is what makes the algorithm well-defined —
there is exactly one way to divide, just as $17 \div 3$ has exactly
one quotient (5) and one remainder (2).

**Geometric lens:** $p(x) = d(x) \cdot q(x) + r(x)$ says the graph of
$p$ is the graph of $d \cdot q$ shifted by the graph of $r$. When
$r = 0$, $p$ and $d \cdot q$ are the same curve — meaning $d$ divides
$p$ evenly, exactly as in integer arithmetic.

**CS lens:** the Division Algorithm for polynomials is the foundation
of **polynomial modular arithmetic** — computing in the ring
$\mathbb{Z}[x]/(d(x))$, where two polynomials are equivalent if they
have the same remainder when divided by $d(x)$. This is the exact
structure of the finite field $\mathrm{GF}(2^8)$ used inside AES
encryption (Stage 10) — the irreducible polynomial $d(x)$ plays the
role of the modulus.

---

### The Long Division Algorithm

Long division for polynomials mirrors integer long division exactly.
The steps repeat until the remainder has lower degree than the divisor.

**The algorithm:**

1. Divide the **leading term** of the current dividend by the **leading
   term** of the divisor. The result is the next term of the quotient.
2. Multiply the entire divisor by that term.
3. Subtract from the current dividend.
4. The result is the new dividend. Repeat from step 1.
5. Stop when the degree of the current dividend is less than the degree
   of the divisor. That current dividend is the remainder.

**Hand-worked example:** Divide $x^3 - 2x^2 + 4x - 3$ by $x^2 - x + 2$.

Write the problem as a long division:

$$\require{enclose}
x^3 - 2x^2 + 4x - 3 \quad \div \quad x^2 - x + 2$$

**Step 1:** Leading term of dividend is $x^3$.
Leading term of divisor is $x^2$.
First quotient term: $x^3 \div x^2 = x$.

Multiply divisor by $x$:
$$x \cdot (x^2 - x + 2) = x^3 - x^2 + 2x$$

Subtract from dividend:
$$(x^3 - 2x^2 + 4x - 3) - (x^3 - x^2 + 2x) = -x^2 + 2x - 3$$

**Step 2:** New dividend is $-x^2 + 2x - 3$.
Leading term: $-x^2$. Leading term of divisor: $x^2$.
Next quotient term: $-x^2 \div x^2 = -1$.

Multiply divisor by $-1$:
$$-1 \cdot (x^2 - x + 2) = -x^2 + x - 2$$

Subtract:
$$(-x^2 + 2x - 3) - (-x^2 + x - 2) = x - 1$$

**Step 3:** New dividend is $x - 1$.
$\deg(x-1) = 1 < \deg(x^2-x+2) = 2$. **Stop.**

$$\boxed{q(x) = x - 1, \qquad r(x) = x - 1}$$

**Verify:** $(x^2 - x + 2)(x - 1) + (x - 1) = x^3 - x^2 + 2x - x^2 + x - 2 + x - 1$
$= x^3 - 2x^2 + 4x - 3$ ✓

**Generalise:** each step reduces the degree of the working dividend by
at least 1 (because we cancel the leading term). Since degree is a
non-negative integer, the algorithm must terminate in at most
$\deg(p) - \deg(d) + 1$ steps.

---

### Implementing Long Division

```python
import numpy as np

def poly_long_division(dividend_coeffs, divisor_coeffs):
    """
    Divide dividend by divisor using polynomial long division.

    Both inputs are coefficient lists in DESCENDING order.
    Returns (quotient_coeffs, remainder_coeffs).

    The algorithm mirrors integer long division:
    repeatedly cancel the leading term of the working dividend
    by multiplying the divisor by the right monomial.
    """
    # Work on a copy so we don't modify the original list
    # list() creates a new list with the same elements
    working = list(dividend_coeffs)

    deg_divisor  = len(divisor_coeffs) - 1   # degree = length - 1
    leading_div  = divisor_coeffs[0]          # leading coefficient of divisor

    quotient_coeffs = []   # accumulate quotient terms here

    # Keep going while the working dividend has degree >= divisor
    while len(working) - 1 >= deg_divisor:

        # Step 1: compute the next quotient term
        # leading term of working / leading term of divisor
        next_coeff = working[0] / leading_div
        quotient_coeffs.append(next_coeff)

        # Step 2: subtract (next_coeff * divisor) from working
        # The subtraction cancels the leading term and shifts the rest
        for i in range(len(divisor_coeffs)):
            working[i] -= next_coeff * divisor_coeffs[i]
            # working[i] -= ...: compound assignment, equivalent to
            # working[i] = working[i] - next_coeff * divisor_coeffs[i]

        # Step 3: remove the leading zero (we just cancelled it)
        working.pop(0)
        # list.pop(0): removes and discards the element at index 0
        # (the leading term we just cancelled)

    # Whatever remains in working is the remainder
    remainder_coeffs = working if working else [0]
    # 'if working': True if the list is non-empty, False if empty
    # An empty list means remainder is 0

    return quotient_coeffs, remainder_coeffs


# Verify on the hand-worked example
p_coeffs = [1, -2,  4, -3]   # x^3 - 2x^2 + 4x - 3
d_coeffs = [1, -1,  2]        # x^2 - x + 2

q_coeffs, r_coeffs = poly_long_division(p_coeffs, d_coeffs)

print("Hand-worked example:")
print(f"  p(x) = {np.poly1d(p_coeffs)}")
print(f"  d(x) = {np.poly1d(d_coeffs)}")
print(f"  quotient  q(x) = {np.poly1d(q_coeffs)}")
print(f"  remainder r(x) = {np.poly1d(r_coeffs)}")
print()

# Verify: p = d*q + r
reconstruct = np.poly1d(q_coeffs) * np.poly1d(d_coeffs) + np.poly1d(r_coeffs)
# np.allclose: True if all elements are within floating-point tolerance
print(f"  Verify d*q + r = p: {np.allclose(reconstruct.coeffs, np.poly1d(p_coeffs).coeffs)}")
```

**Walkthrough:** The `while` loop runs as long as the working dividend
has degree $\geq$ the divisor's degree — `len(working) - 1 >= deg_divisor`
is the degree comparison in list-length terms (a polynomial with $k$
coefficients has degree $k-1$). Inside the loop, `working.pop(0)` removes
the first element of the list — `list.pop(index)` removes and returns the
element at `index`, discarding the return value here since we don't need
the cancelled leading term. The line `working[i] -= next_coeff * divisor_coeffs[i]`
uses **compound assignment** `−=`: a shorthand for
`working[i] = working[i] - ...`, exactly like `+=` in a loop counter.
After the loop, `working` contains whatever is left — the remainder.

```python
import numpy as np

# Test poly_long_division on several examples,
# comparing against numpy's built-in np.polydiv

def poly_long_division(dividend_coeffs, divisor_coeffs):
    # unchanged from the previous block
    working     = list(dividend_coeffs)
    deg_divisor = len(divisor_coeffs) - 1
    leading_div = divisor_coeffs[0]
    quotient_coeffs = []
    while len(working) - 1 >= deg_divisor:
        next_coeff = working[0] / leading_div
        quotient_coeffs.append(next_coeff)
        for i in range(len(divisor_coeffs)):
            working[i] -= next_coeff * divisor_coeffs[i]
        working.pop(0)
    remainder_coeffs = working if working else [0]
    return quotient_coeffs, remainder_coeffs

test_cases = [
    ([1, -2,  4, -3], [1, -1, 2],    "x^3-2x^2+4x-3 ÷ x^2-x+2"),
    ([1, -6, 11, -6], [1, -3, 2],    "x^3-6x^2+11x-6 ÷ x^2-3x+2"),
    ([2, -3,  0,  1, -5], [1, 0, 2], "2x^4-3x^3+x-5 ÷ x^2+2"),
    ([1,  0,  0,  0,  1], [1, 1],    "x^4+1 ÷ x+1"),
]

print("Comparing our poly_long_division vs np.polydiv:\n")
all_passed = True
for p_coeffs, d_coeffs, label in test_cases:
    our_q, our_r = poly_long_division(p_coeffs, d_coeffs)
    np_q, np_r   = np.polydiv(p_coeffs, d_coeffs)
    # np.polydiv: numpy's built-in polynomial division -- used here only
    # for cross-checking, not as the implementation

    q_match = np.allclose(our_q, np_q)
    r_match = np.allclose(our_r, np_r)
    status  = "✓" if (q_match and r_match) else "✗"
    print(f"  {status}  {label}")
    if not (q_match and r_match):
        print(f"     our   q={our_q}, r={our_r}")
        print(f"     numpy q={list(np_q)}, r={list(np_r)}")
        all_passed = False

print()
print("All cases match numpy:" if all_passed else "MISMATCH detected.")
```

**Walkthrough:** `np.polydiv(dividend, divisor)` is numpy's built-in
polynomial division. It is used here exclusively as a **reference
implementation** — something whose correctness we trust, used only to
verify our own implementation. This pattern (implement from scratch,
cross-check against a trusted library) is standard in numerical
computing: it separates "understanding the algorithm" from "trusting
the library." After verification passes, future code can use
`np.polydiv` directly.

---

### The Remainder Theorem — Formal Statement

The Remainder Theorem was used informally in Lesson 1.2 when dividing
by linear factors. Here it is stated and proved in full.

**Theorem (Remainder Theorem):** When a polynomial $p(x)$ is divided by
$(x - c)$, the remainder is the constant $p(c)$.

*Proof.* By the Division Algorithm:

$$p(x) = (x - c) \cdot q(x) + r(x)$$

where $\deg(r) < \deg(x-c) = 1$. So $r(x)$ is a constant — call it $r$.

Substitute $x = c$:

$$p(c) = (c - c) \cdot q(c) + r = 0 + r = r$$

Therefore the remainder equals $p(c)$. $\blacksquare$

**What this means computationally:** to evaluate $p(c)$, you can
either substitute $c$ directly (Horner's method from Lesson 1.1) or
divide $p$ by $(x-c)$ and read off the remainder. Both give $p(c)$.
Synthetic division *is* Horner's method — the same computation,
described two different ways.

**Hand-worked example:** Find the remainder when $p(x) = x^4 - 3x^2 + 2x - 5$
is divided by $(x - 2)$.

By the Remainder Theorem: remainder $= p(2)$.

$$p(2) = 2^4 - 3(2^2) + 2(2) - 5 = 16 - 12 + 4 - 5 = 3$$

**Verify using synthetic division** (divisor is linear, so synthetic
division applies):

| | 1 | 0 | −3 | 2 | −5 |
|-|---|---|----|---|-----|
|$\times 2$| ↓ | 2 | 4 | 2 | 8 |
| | **1** | **2** | **1** | **4** | **3** |

Remainder: **3** ✓

```python
import numpy as np

def synthetic_division(coefficients, c):
    # unchanged from Lesson 1.2
    result = [coefficients[0]]
    for coefficient in coefficients[1:]:
        result.append(result[-1] * c + coefficient)
    return result[:-1], result[-1]

# Demonstrate that synthetic_division remainder equals direct evaluation
p_coeffs = [1, 0, -3, 2, -5]   # x^4 + 0x^3 - 3x^2 + 2x - 5
# Note the explicit 0 for the missing x^3 term

p = np.poly1d(p_coeffs)   # np.poly1d: unchanged from Lesson 1.1

print("Remainder Theorem: remainder of p ÷ (x-c) equals p(c)\n")
print(f"{'c':>5} | {'p(c) direct':>14} | {'Synthetic remainder':>20} | {'Match':>6}")
print("-" * 55)

for c in [-3, -1, 0, 1, 2, 3]:
    p_at_c   = p(c)                              # direct evaluation
    _, rem   = synthetic_division(p_coeffs, c)   # synthetic remainder
    match    = np.isclose(p_at_c, rem)
    print(f"{c:>5} | {p_at_c:>14.2f} | {rem:>20.2f} | {'✓' if match else '✗':>6}")
```

**Walkthrough:** The table prints two computations side by side for
each value of $c$: `p(c)` (direct evaluation via numpy's callable
`p(c)`) and the remainder from `synthetic_division`. The Remainder
Theorem guarantees they are always equal, and the `✓` column confirms
this numerically for each case. `{c:>5}` formats the integer right-aligned
in a field 5 characters wide; `{value:>14.2f}` right-aligns a float with
2 decimal places in a 14-character field. These format specifiers were
introduced in Lesson 0.10 and used freely here.

---

### Visualising the Division Algorithm

```python
import matplotlib.pyplot as plt
import numpy as np

# p(x) = d(x)*q(x) + r(x) means the gap between p and d*q is exactly r
# Visualise this to make the relationship concrete

x = np.linspace(-3, 4, 400)   # np.linspace: unchanged from Lesson 1.1

# Using the hand-worked example from this lesson
# p(x) = x^3 - 2x^2 + 4x - 3
# d(x) = x^2 - x + 2
# q(x) = x - 1
# r(x) = x - 1
p_vals   = x**3 - 2*x**2 + 4*x - 3
dq_vals  = (x**2 - x + 2) * (x - 1)    # d(x) * q(x)
r_vals   = x - 1                         # r(x)

fig, axes = plt.subplots(1, 2, figsize=(13, 5))

# --- Left plot: show p and d*q ---
axes[0].plot(x, p_vals,  color='#2980b9', lw=2.5,
             label='$p(x) = x^3-2x^2+4x-3$')
axes[0].plot(x, dq_vals, color='#e74c3c', lw=2.0, linestyle='--',
             label='$d(x)\\cdot q(x)$')
axes[0].axhline(0, color='#333', lw=0.8)
axes[0].axvline(0, color='#333', lw=0.8)
axes[0].set_title('$p(x)$ and $d(x) \\cdot q(x)$\n'
                  'They differ by the remainder', fontsize=11)
axes[0].set_xlabel('$x$')
axes[0].set_ylabel('$y$')
axes[0].legend(fontsize=9)
axes[0].grid(True, alpha=0.3)
axes[0].set_ylim(-10, 15)

# --- Right plot: show p - d*q = r ---
gap = p_vals - dq_vals   # this should equal r(x) = x - 1 exactly

axes[1].plot(x, gap,    color='#27ae60', lw=2.5,
             label='$p(x) - d(x)q(x)$ (computed)')
axes[1].plot(x, r_vals, color='#e67e22', lw=2.0, linestyle='--',
             label='$r(x) = x-1$ (remainder)')
axes[1].axhline(0, color='#333', lw=0.8)
axes[1].axvline(0, color='#333', lw=0.8)
axes[1].set_title('$p(x) - d(x)\\cdot q(x) = r(x)$\n'
                  '$\\deg(r)=1 < \\deg(d)=2$ \\quad (algorithm stops)', fontsize=11)
axes[1].set_xlabel('$x$')
axes[1].set_ylabel('$y$')
axes[1].legend(fontsize=9)
axes[1].grid(True, alpha=0.3)
axes[1].set_ylim(-5, 5)

plt.suptitle('Division Algorithm: $p = d \\cdot q + r$', fontsize=13, y=1.01)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `gap = p_vals - dq_vals` subtracts two numpy arrays
element-by-element — array arithmetic, used freely since Lesson 1.1.
The right plot overlays the computed gap `p - d*q` (in green) against the
claimed remainder `r(x) = x - 1` (in orange, dashed). They lie exactly on
top of each other, confirming the division is correct. If the two lines
did not match, it would indicate a bug in the long division implementation
— this is a useful visual debugging technique.

---

### A Manufacturing Application: Evaluating Spline Polynomials Efficiently

In CAM software, a toolpath is described by a spline — a piecewise
polynomial. At every point along the path, the software needs to evaluate
the polynomial to find the tool position. With tens of thousands of
evaluation points per second, evaluation speed matters.

The Remainder Theorem gives an unexpected speedup. Instead of evaluating
$p(c)$ by direct substitution (Horner's method, $n$ multiplications),
you can compute it as the remainder of $p \div (x - c)$ — same computation,
same $n$ multiplications. But the key insight is that if you need to
evaluate $p$ at many closely spaced points $c_0, c_1, c_2, \ldots$, you
can chain the divisions: the quotient from dividing by $(x - c_0)$ is a
degree-$(n-1)$ polynomial, which can itself be divided by $(x - c_1)$
more cheaply. This is the basis of efficient polynomial evaluation
algorithms used in production CAM.

```python
import numpy as np
import time

def synthetic_division(coefficients, c):
    # unchanged from Lesson 1.2
    result = [coefficients[0]]
    for coefficient in coefficients[1:]:
        result.append(result[-1] * c + coefficient)
    return result[:-1], result[-1]

# Generate a high-degree polynomial representing a spline segment
# Degree 8 polynomial with random coefficients
np.random.seed(42)   # np.random.seed: fix the random seed so results are reproducible
                      # random.seed(n): makes np.random functions produce
                      # the same sequence every time -- useful for testing
degree = 8
coeffs = np.random.uniform(-2, 2, degree + 1).tolist()
# np.random.uniform(low, high, size): 'size' random floats uniformly in [low, high]
# .tolist(): convert numpy array to a plain Python list

# 1000 evaluation points along a parameter interval
eval_points = np.linspace(0, 1, 1000).tolist()
# np.linspace: unchanged; .tolist() converts to list for our function

# Method 1: numpy direct evaluation (vectorised -- very fast)
p = np.poly1d(coeffs)
t0 = time.perf_counter()
# time.perf_counter(): returns a high-resolution timer value in seconds
# used for timing code -- take the difference of two readings
numpy_results = [p(c) for c in eval_points]
t1 = time.perf_counter()
numpy_time = t1 - t0

# Method 2: our synthetic division (equivalent mathematically)
t2 = time.perf_counter()
synth_results = [synthetic_division(coeffs, c)[1] for c in eval_points]
t3 = time.perf_counter()
synth_time = t3 - t2

print(f"Evaluating degree-{degree} polynomial at {len(eval_points)} points:\n")
print(f"  numpy direct:       {numpy_time * 1000:.2f} ms")
print(f"  synthetic division: {synth_time * 1000:.2f} ms")
print()

# Verify both methods agree at every point
max_error = max(abs(n - s) for n, s in zip(numpy_results, synth_results))
print(f"  Maximum difference between methods: {max_error:.2e}")
print(f"  (Should be near zero -- floating-point rounding only)")
```

**Walkthrough:** `time.perf_counter()` is Python's high-resolution
timer, used by taking two readings and computing the difference.
`np.random.seed(42)` fixes the random number generator's starting state
so the random coefficients are the same every time the code runs —
essential for reproducible tests. `np.random.uniform(low, high, size)`
generates `size` random floats uniformly distributed between `low` and
`high`; `.tolist()` converts the resulting numpy array to a plain Python
list, since `synthetic_division` expects a list.

---

## Connect the Pieces

**What this lesson built on:** Synthetic division (Lesson 1.2) was a
special case of polynomial long division, restricted to linear divisors.
The Remainder Theorem (stated informally in Lesson 1.2 as "the remainder
equals $p(c)$") is now proved from the Division Algorithm. Horner's
method (Lesson 1.1) and synthetic division are the same computation —
the Remainder Theorem is why.

**What this lesson makes possible:** Lesson 1.4 (The Fundamental Theorem
of Algebra) — which says every degree-$n$ polynomial has exactly $n$
roots in $\mathbb{C}$ — uses the Factor Theorem (Lesson 1.2) and the
Division Algorithm to extract roots one at a time. Lesson 1.5 (Rational
Functions) uses polynomial division to analyse what happens when a
polynomial has asymptotes. Stage 10 (Abstract Algebra, Lesson 9.11)
uses polynomial division modulo an irreducible polynomial to build the
finite field $\mathrm{GF}(2^8)$ that AES encryption lives in.

**In CS:** compilers use polynomial division when reducing expressions
modulo a polynomial basis — the same operation, on polynomials with
coefficients in $\{0, 1\}$ (bits). Every `%` operation on a polynomial
over $\mathrm{GF}(2)$ in a cryptographic library is polynomial long
division. The algorithm you implemented in this lesson is literally what
runs inside AES key expansion.

---

## Summary

**Division Algorithm:** for any $p(x)$, $d(x) \neq 0$, unique $q$ and $r$ exist with
$$p(x) = d(x) \cdot q(x) + r(x), \qquad \deg(r) < \deg(d)$$

**Algorithm steps:** divide leading term; multiply divisor; subtract;
repeat until $\deg(\text{current}) < \deg(d)$.

**Remainder Theorem:** remainder when $p(x) \div (x-c)$ is $p(c)$.
*Proof:* substitute $x=c$ into $p = (x-c)q + r$.

**Synthetic division is Horner's method:** both compute $p(c)$ in
exactly $n$ multiplications — the Remainder Theorem connects them.

**New Python:**
- `list.pop(index)` — remove and return element at index
- `list()` — copy a list (shallow)
- `compound assignment -=` — shorthand for `x = x - something`
- `time.perf_counter()` — high-resolution timer
- `np.random.seed(n)` — fix random number generator for reproducibility
- `np.random.uniform(low, high, size)` — random floats in an interval

---

## Problems

### Math

**1.** Perform each polynomial long division and verify by reconstruction.

(a) $(x^3 + x^2 - 4x - 4) \div (x^2 - 2)$

(b) $(x^4 - 1) \div (x^2 + x + 1)$

(c) $(6x^3 - 5x^2 + 2x - 1) \div (3x - 1)$

<details>
<summary>Hints</summary>

(a) Set up: leading term $x^3 \div x^2 = x$. After one step you'll
have a linear remainder — check if it's a multiple of $x^2-2$.

(b) $x^4-1$ is missing $x^3$, $x^2$, and $x$ terms.
Write it as $x^4 + 0x^3 + 0x^2 + 0x - 1$ and proceed.

(c) The divisor is linear, so you could use synthetic division with
$c = 1/3$. But long division also works — the leading coefficient
of the divisor is 3, not 1.

</details>

<details>
<summary>Answers</summary>

(a) $q(x) = x+1$, $r(x) = -2x-2$.
Verify: $(x^2-2)(x+1) + (-2x-2) = x^3+x^2-2x-2-2x-2 = x^3+x^2-4x-4$ ✓

(b) $q(x) = x^2-x$, $r(x) = x-1$.
Verify: $(x^2+x+1)(x^2-x) + (x-1) = x^4-x^3+x^3-x^2+x^2-x+x-1 = x^4-1$ ✓

(c) $q(x) = 2x^2 - x + \frac{1}{3}$, $r = 0$.
So $(3x-1)$ is a factor — you could have spotted this from the Rational
Root Theorem: $c = 1/3$ gives $6(1/27) - 5(1/9) + 2(1/3) - 1 = 2/9 - 5/9 + 6/9 - 9/9 = 0$.

</details>

---

**2.** Use the Remainder Theorem (no long division) to find the remainder
when $p(x) = x^5 - 2x^4 + 3x^3 - x + 7$ is divided by each divisor.

(a) $x - 1$ &emsp; (b) $x + 2$ &emsp; (c) $x - 0$ &emsp;
(d) $x - \frac{1}{2}$

<details>
<summary>Answers</summary>

(a) $p(1) = 1-2+3-1+7 = 8$

(b) $p(-2) = -32-32-24+2+7 = -79$

(c) $p(0) = 7$ (the constant term — dividing by $x$ always leaves
the constant term as the remainder)

(d) $p(\frac{1}{2}) = \frac{1}{32} - \frac{2}{16} + \frac{3}{8} - \frac{1}{2} + 7
= \frac{1}{32} - \frac{4}{32} + \frac{12}{32} - \frac{16}{32} + \frac{224}{32} = \frac{217}{32}$

</details>

---

**3.** (Proof) Prove that if $p(c) = p'(c) = 0$ (where $p'$ denotes the
derivative — to be formally defined in Stage 5), then $(x-c)^2$
divides $p(x)$.

*(For now, use the algebraic form of the derivative: $p'(x)$ is the
polynomial obtained by the rule $\frac{d}{dx}[a_n x^n] = na_n x^{n-1}$
applied to each term.)*

<details>
<summary>Hint</summary>

By the Factor Theorem, $p(c) = 0$ means $p(x) = (x-c)q(x)$.
Differentiate both sides: $p'(x) = q(x) + (x-c)q'(x)$.
Substitute $x = c$: $p'(c) = q(c)$.
If $p'(c) = 0$, then $q(c) = 0$, so $(x-c)$ divides $q(x)$...

</details>

<details>
<summary>Answer</summary>

Since $p(c)=0$, by the Factor Theorem $p(x) = (x-c)q(x)$ for some polynomial $q$.
Differentiating: $p'(x) = q(x) + (x-c)q'(x)$.
At $x=c$: $p'(c) = q(c) + 0 = q(c)$.
Since $p'(c) = 0$, we get $q(c) = 0$.
By the Factor Theorem applied to $q$: $(x-c)$ divides $q(x)$, so $q(x) = (x-c)s(x)$.
Therefore $p(x) = (x-c) \cdot (x-c)s(x) = (x-c)^2 s(x)$.
So $(x-c)^2$ divides $p(x)$. $\blacksquare$

*This proves the algebraic characterisation of roots of multiplicity $\geq 2$ from Lesson 1.2 Extension 4 — the places where the curve touches but doesn't cross the $x$-axis.*

</details>

---

### Code Challenges

**Challenge 1 — Polynomial long division**

```python
def poly_long_division(dividend_coeffs, divisor_coeffs):
    """
    Divide dividend by divisor using polynomial long division.
    Both inputs: coefficient lists in DESCENDING order.
    Returns (quotient_coeffs, remainder_coeffs).
    """
    pass  # your code here


# --- tests: do not modify ---
import numpy as np

def check_division(p, d, label):
    q, r = poly_long_division(p, d)
    # Verify p = d*q + r
    reconstruct = np.poly1d(q) * np.poly1d(d) + np.poly1d(r)
    original    = np.poly1d(p)
    ok = np.allclose(reconstruct.coeffs, original.coeffs)
    # Also check deg(r) < deg(d)
    deg_r = len(r) - 1 if r != [0] else -1
    deg_d = len(d) - 1
    deg_ok = deg_r < deg_d
    print(f"  {'✓' if ok and deg_ok else '✗'}  {label}")
    return ok and deg_ok

all_ok = True
all_ok &= check_division([1,-2,4,-3], [1,-1,2],  "x^3-2x^2+4x-3 ÷ x^2-x+2")
all_ok &= check_division([1,-6,11,-6],[1,-3,2],   "x^3-6x^2+11x-6 ÷ x^2-3x+2")
all_ok &= check_division([2,-3,0,1,-5],[1,0,2],   "2x^4-3x^3+x-5 ÷ x^2+2")
all_ok &= check_division([1,0,0,0,1], [1,1],      "x^4+1 ÷ x+1")
all_ok &= check_division([6,-5,2,-1], [3,-1],     "6x^3-5x^2+2x-1 ÷ 3x-1")

assert all_ok
print("\n✓ Challenge 1 passed!")
```

<details>
<summary>Hint</summary>

Copy `working = list(dividend_coeffs)`. While `len(working) - 1 >= len(divisor_coeffs) - 1`:
compute `next_coeff = working[0] / divisor_coeffs[0]`, append to quotient,
subtract `next_coeff * divisor_coeffs[i]` from `working[i]` for each `i`,
then `working.pop(0)`. Return `quotient_coeffs, working`.

</details>

---

**Challenge 2 — Polynomial GCD**

The Euclidean algorithm (Lesson 0.9) works on polynomials too:
$\gcd(p, d) = \gcd(d, r)$ where $r$ is the remainder of $p \div d$.

```python
def poly_gcd(p_coeffs, d_coeffs):
    """
    Find the monic GCD of two polynomials using the Euclidean algorithm.
    Returns the GCD as a coefficient list (monic: leading coefficient = 1).
    
    A monic polynomial has leading coefficient 1.
    """
    pass  # your code here


# --- tests: do not modify ---
import numpy as np

# gcd(x^2-1, x-1) = x-1
g1 = poly_gcd([1, 0, -1], [1, -1])
assert np.allclose(g1, [1, -1]), f"Expected [1,-1], got {g1}"

# gcd(x^3-6x^2+11x-6, x^2-3x+2) = x^2-3x+2
# because x^3-6x^2+11x-6 = (x-1)(x-2)(x-3) and x^2-3x+2 = (x-1)(x-2)
g2 = poly_gcd([1,-6,11,-6], [1,-3,2])
assert np.allclose(g2, [1,-3,2]), f"Expected [1,-3,2], got {g2}"

# gcd of coprime polynomials is 1
g3 = poly_gcd([1, 0, 1], [1, 1])  # gcd(x^2+1, x+1) = 1
assert np.allclose(g3, [1]), f"Expected [1], got {g3}"

print("✓ Challenge 2 passed!")
```

<details>
<summary>Hint</summary>

Mirror the integer Euclidean algorithm: while `d_coeffs` is not just
`[0]`, compute `_, r = poly_long_division(p_coeffs, d_coeffs)`,
then `p_coeffs = d_coeffs`, `d_coeffs = r`. At the end, `p_coeffs` is
the GCD — divide all coefficients by the leading coefficient to make it monic.
Use `if not d_coeffs or all(c == 0 for c in d_coeffs)` to check for the zero polynomial.

</details>

---

**Challenge 3 — Batch evaluation via Remainder Theorem**

Evaluate a polynomial at many points using repeated synthetic division,
and compare performance and accuracy against numpy's vectorised evaluation.

```python
import numpy as np
import time

def batch_evaluate(coeffs, points):
    """
    Evaluate the polynomial at every point in the list,
    using the Remainder Theorem (synthetic division) for each point.
    Returns a list of values.
    """
    pass  # your code here


# --- tests: do not modify ---
import numpy as np

coeffs = [3, -2, 0, 5, -7]   # 3x^4 - 2x^3 + 5x - 7
points = [-2.0, -1.0, 0.0, 1.0, 2.0]

results = batch_evaluate(coeffs, points)
expected = [np.poly1d(coeffs)(x) for x in points]

assert np.allclose(results, expected), f"Mismatch: {results} vs {expected}"
print("✓ Challenge 3 passed!")
print()
print("Timing on 10,000 points (degree-8 polynomial):")
import numpy.random as rng
rng.seed(0)
big_coeffs = rng.uniform(-2, 2, 9).tolist()
big_points = np.linspace(-5, 5, 10000).tolist()

t0 = time.perf_counter()
our_results = batch_evaluate(big_coeffs, big_points)
t1 = time.perf_counter()
print(f"  Our batch_evaluate: {(t1-t0)*1000:.1f} ms")
```

---

### Extension

**4. ★** Show that the polynomial division algorithm terminates in at most
$\deg(p) - \deg(d) + 1$ steps, using proof by induction on $\deg(p)$.

<details>
<summary>Hint</summary>

Each step reduces the degree of the working dividend by at least 1
(you cancel the leading term, which reduces degree). The loop
continues while $\deg(\text{working}) \geq \deg(d)$, so it runs
at most $\deg(p) - \deg(d) + 1$ times. Formalise with induction on
$\deg(p)$: base case $\deg(p) < \deg(d)$ (zero steps), inductive
step shows one step reduces to a subproblem of smaller degree.

</details>

**5. ★ (CS connection)** In $\mathrm{GF}(2)$, all arithmetic is done
modulo 2 — coefficients are 0 or 1, addition is XOR, multiplication
is AND. Polynomial long division works the same way but with these
modified rules.

Implement `gf2_poly_division(dividend, divisor)` where coefficients
are 0 or 1 and addition/subtraction is XOR (the same operation in $\mathrm{GF}(2)$).

```python
def gf2_poly_division(dividend_coeffs, divisor_coeffs):
    """
    Polynomial long division over GF(2): coefficients in {0,1},
    addition is XOR (same as subtraction in GF(2)).
    Returns (quotient_coeffs, remainder_coeffs).
    """
    pass  # your code here


# --- tests: do not modify ---
# In GF(2): (x^3 + x + 1) ÷ (x + 1)
# x^3+x+1 = [1,0,1,1], x+1 = [1,1]
q, r = gf2_poly_division([1,0,1,1], [1,1])
# Verify: q*(x+1) XOR r = x^3+x+1 over GF(2)
def gf2_poly_multiply(a, b):
    result = [0] * (len(a) + len(b) - 1)
    for i, ai in enumerate(a):
        for j, bj in enumerate(b):
            result[i+j] ^= (ai * bj) % 2   # ^ is XOR, % 2 keeps in GF(2)
    return result

product = gf2_poly_multiply(q, [1,1])
# XOR with remainder to reconstruct dividend
recon = list(product)
for i, ri in enumerate(r):
    idx = len(recon) - len(r) + i
    if idx >= 0:
        recon[idx] ^= ri

assert recon == [1,0,1,1], f"Reconstruction failed: {recon}"
print("✓ Extension 5 passed!")
print()
print("This GF(2) division is the core of AES encryption's MixColumns step.")
print("You just implemented a piece of the algorithm that secures HTTPS.")
```

<details>
<summary>Hint</summary>

The algorithm is identical to regular polynomial long division, except:
- Subtraction is replaced by XOR (`^` in Python)
- All coefficients are taken `% 2` after each operation
- The "division" of leading terms simplifies: both coefficients are 1,
  so `leading_div = 1` and `next_coeff = working[0] / 1 = working[0]`

</details>
