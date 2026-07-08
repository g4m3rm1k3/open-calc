# Stage 1, Lesson 1.9 — Logarithm Laws: Manipulating Log Expressions
**Threads:** Math  
**Estimated time:** 45–60 minutes

---

## What This Lesson Is About

Lesson 1.8 proved the three logarithm laws for the natural logarithm $\ln$. Those same laws hold for logarithms in any base — because a logarithm in any base is just $\ln$ divided by a constant (the change of base formula). This lesson states the laws for a general base $b$, proves them, and practises the full range of manipulations: expanding, condensing, and rearranging logarithmic expressions. The ability to manipulate logarithms fluently is prerequisite to solving exponential equations (Lesson 1.10), working with logarithmic scales (Lesson 1.11), and understanding every formula in information theory (Lesson 8.11) and algorithm analysis (Lesson 9.7) that involves $\log$.

---

## Historical Context

John Napier published the first tables of logarithms in 1614, and Henry Briggs convinced him to standardise on base 10. In 1617, Briggs published base-10 logarithm tables accurate to 14 decimal places — a monumental calculation requiring years of hand arithmetic. The laws that make logarithms useful (product to sum, quotient to difference, power to product) are the same properties Napier and Briggs exploited to turn multiplication tables into addition tables. Before the electronic calculator, every engineer carried a slide rule — a mechanical implementation of the product law that converts multiplication into physical addition along a logarithmic scale. The slide rule was the standard engineering tool until the early 1970s.

---

## What You Need To Know First

- **Natural logarithm $\ln$** — Lesson 1.8. The laws in this lesson are the same laws, extended to any base.
- **Change of base formula** — Lesson 1.8: $\log_b x = \ln x / \ln b$. The general laws follow directly from the $\ln$ laws via this formula.
- **Exponential functions** — Lesson 1.6. The definition of $\log_b$ is the inverse of $b^x$.

---

## The Lesson

### Definition of $\log_b$

**Definition:** For $b > 0$, $b \neq 1$, and $x > 0$:

$$\log_b x = y \iff b^y = x$$

$\log_b x$ is the exponent you must raise $b$ to in order to get $x$.

The **two most common bases** in engineering and science are:
- **Base 10** — written $\log_{10} x$ or just $\log x$ (engineering/science convention). Used in decibel scales, pH, Richter magnitude.
- **Base 2** — written $\log_2 x$. Used in information theory, algorithm complexity, digital systems.
- **Base $e$** — written $\ln x$. The natural base for analysis, physics, and all continuous models.

**Key values:**

$$\log_b 1 = 0 \quad (\text{because } b^0 = 1) \qquad \log_b b = 1 \quad (\text{because } b^1 = b)$$

$$\log_b(b^k) = k \qquad b^{\log_b x} = x$$

---

### The Three Laws

The following laws hold for any base $b > 0$, $b \neq 1$, and any $M, N > 0$, $r \in \mathbb{R}$.

**Law 1 — Product:**

$$\log_b(MN) = \log_b M + \log_b N$$

*Proof using change of base:* $\log_b(MN) = \frac{\ln(MN)}{\ln b} = \frac{\ln M + \ln N}{\ln b} = \frac{\ln M}{\ln b} + \frac{\ln N}{\ln b} = \log_b M + \log_b N$. $\blacksquare$

**Law 2 — Quotient:**

$$\log_b\!\left(\frac{M}{N}\right) = \log_b M - \log_b N$$

*Proof:* $\frac{\ln(M/N)}{\ln b} = \frac{\ln M - \ln N}{\ln b} = \log_b M - \log_b N$. $\blacksquare$

**Law 3 — Power:**

$$\log_b(M^r) = r \log_b M$$

*Proof:* $\frac{\ln(M^r)}{\ln b} = \frac{r\ln M}{\ln b} = r \log_b M$. $\blacksquare$

The proofs are one-liners because the general base laws are simply the $\ln$ laws (already proved) translated through the change of base formula.

---

### Expanding Logarithmic Expressions

"Expanding" means writing a single $\log$ of a compound expression as a sum or difference of simpler logs.

**Hand-worked example:** Expand $\log_3\!\left(\dfrac{9x^2}{\sqrt{x+1}}\right)$.

Step 1 — Apply quotient law:
$$= \log_3(9x^2) - \log_3\!\left(\sqrt{x+1}\right)$$

Step 2 — Apply product law to the first term:
$$= \log_3 9 + \log_3(x^2) - \log_3\!\left((x+1)^{1/2}\right)$$

Step 3 — Apply power law:
$$= \log_3 9 + 2\log_3 x - \tfrac{1}{2}\log_3(x+1)$$

Step 4 — Evaluate the constant: $\log_3 9 = \log_3(3^2) = 2$:

$$= 2 + 2\log_3 x - \tfrac{1}{2}\log_3(x+1)$$

**Verify numerically** (take $x = 3$):

LHS: $\log_3\!\left(\frac{9 \cdot 9}{\sqrt{4}}\right) = \log_3\!\left(\frac{81}{2}\right) = \log_3(40.5) = \ln(40.5)/\ln(3) \approx 3.344$

RHS: $2 + 2\log_3(3) - \frac{1}{2}\log_3(4) = 2 + 2(1) - \frac{1}{2}(1.261) \approx 2 + 2 - 0.631 = 3.369$

Wait — let me recheck. $\sqrt{x+1} = \sqrt{4} = 2$ when $x = 3$.

LHS: $\log_3(9 \cdot 9 / 2) = \log_3(81/2) = \ln(40.5)/\ln 3$.
$\ln(40.5) \approx 3.702$; $\ln 3 \approx 1.099$; LHS $\approx 3.368$.

RHS: $2 + 2\ln(3)/\ln(3) - \frac{1}{2}\ln(4)/\ln(3) = 2 + 2 - \frac{1}{2}(1.386/1.099) = 4 - 0.631 = 3.369$. ✓

---

### Condensing Logarithmic Expressions

"Condensing" is the reverse: writing a sum or difference of logs as a single log. This is the operation used when solving logarithmic equations.

**Hand-worked example:** Condense $2\log_5 x + \log_5(x+3) - \log_5(x^2 - 1)$.

Step 1 — Apply power law to move coefficients into exponents:
$$= \log_5(x^2) + \log_5(x+3) - \log_5(x^2-1)$$

Step 2 — Apply product law to the sum:
$$= \log_5\!\left(x^2(x+3)\right) - \log_5(x^2-1)$$

Step 3 — Apply quotient law:
$$= \log_5\!\left(\frac{x^2(x+3)}{x^2-1}\right)$$

Step 4 — Factor the denominator: $x^2 - 1 = (x-1)(x+1)$:
$$= \log_5\!\left(\frac{x^2(x+3)}{(x-1)(x+1)}\right)$$

This is the fully condensed form.

**Domain reminder:** The original expression requires $x > 0$, $x + 3 > 0$ (always true if $x > 0$), and $x^2 - 1 > 0$, meaning $x > 1$. The condensed form has the same domain restriction: valid for $x > 1$.

```python
import numpy as np
import math

def expand_check(x, b=5):
    """
    Verify: 2*log_b(x) + log_b(x+3) - log_b(x^2-1)
    equals log_b( x^2*(x+3) / (x^2-1) )
    for x > 1.
    """
    if x <= 1:
        raise ValueError("x must be > 1 for this expression to be defined")
    
    def log_b(v):
        return math.log(v) / math.log(b)
    
    expanded = 2*log_b(x) + log_b(x+3) - log_b(x**2 - 1)
    condensed = log_b(x**2 * (x+3) / (x**2 - 1))
    return expanded, condensed

print(f"{'x':>5} | {'Expanded':>14} | {'Condensed':>14} | {'Match':>7}")
print("-" * 48)
for x in [2, 3, 5, 10, 100]:
    e, c = expand_check(x)
    match = abs(e - c) < 1e-12
    print(f"{x:>5} | {e:>14.8f} | {c:>14.8f} | {str(match):>7}")
```

**Walkthrough:** `math.log(v) / math.log(b)` implements $\log_b(v)$ via the change of base formula. The function computes both the expanded form (three separate log terms) and the condensed form (one log of the combined fraction) and checks that they agree.

---

### Common Mistakes

**Mistake 1:** $\log_b(M + N) \neq \log_b M + \log_b N$.

The product law applies to products, not sums. $\log_b(M + N)$ cannot be simplified further in general.

**Mistake 2:** $\log_b(M \cdot N) \neq (\log_b M)(\log_b N)$.

The product law converts $\log_b(M \cdot N)$ to a sum, not a product of logs.

**Mistake 3:** $\frac{\log_b M}{\log_b N} \neq \log_b\!\left(\frac{M}{N}\right)$.

The quotient law converts $\log_b(M/N)$ to a difference, not a ratio of logs. (A ratio of logs is what the change of base formula gives.)

**Mistake 4:** $(\log_b M)^r \neq r \log_b M$.

The power law applies to $\log_b(M^r)$ — the argument raised to a power — not to the log itself raised to a power.

```python
import math

# Demonstrate each mistake numerically
M, N, r, b = 4, 2, 3, 10

print("Common log law mistakes:\n")

print("Mistake 1: log(M+N) vs log(M)+log(N)")
print(f"  log({M}+{N})       = {math.log10(M+N):.6f}")
print(f"  log({M})+log({N})  = {math.log10(M)+math.log10(N):.6f}  ← NOT equal\n")

print("Mistake 2: log(M*N) vs log(M)*log(N)")
print(f"  log({M}*{N})       = {math.log10(M*N):.6f}")
print(f"  log({M})*log({N})  = {math.log10(M)*math.log10(N):.6f}  ← NOT equal\n")

print("Mistake 3: log(M)/log(N) vs log(M/N)")
print(f"  log({M})/log({N})  = {math.log10(M)/math.log10(N):.6f}  (this is log_N(M) = log_2(4) = 2)")
print(f"  log({M}/{N})       = {math.log10(M/N):.6f}  ← NOT equal\n")

print("Mistake 4: (log M)^r vs log(M^r)")
print(f"  (log {M})^{r}      = {math.log10(M)**r:.6f}")
print(f"  log({M}^{r})       = {math.log10(M**r):.6f} = {r}*log({M}) = {r*math.log10(M):.6f}  ← NOT equal")
```

**Walkthrough:** `math.log10(x)` computes $\log_{10} x$. Each block computes both sides of a commonly confused "formula" and shows they are not equal.

---

### Useful Special Results

These follow directly from the laws but appear often enough to recognise:

$$\log_b\!\left(\frac{1}{M}\right) = -\log_b M \qquad (\text{quotient law with } N = M)$$

$$\log_b\!\left(\sqrt{M}\right) = \frac{1}{2}\log_b M \qquad (\text{power law with } r = 1/2)$$

$$\log_b b^r = r \qquad (\text{power law then } \log_b b = 1)$$

$$\log_b x = \frac{1}{\log_x b} \qquad (\text{change of base applied twice})$$

The last one: $\log_b x = \ln x / \ln b$ and $\log_x b = \ln b / \ln x$, so $\log_b x \cdot \log_x b = 1$.

---

## Connect the Pieces

**What this lesson built on:** Natural logarithm laws (Lesson 1.8) — the general laws are the same laws, reached via the change of base formula. Every proof in this lesson is one line because it reduces to the $\ln$ case already done.

**What this lesson makes possible:** Lesson 1.10 (exponential and logarithmic equations) — condensing and expanding are the algebraic tools needed to isolate unknowns. Lesson 1.11 (logarithmic scales) — decibels, pH, and Richter all use $\log_{10}$ with these laws to handle ratios. Lesson 9.7 (Big O notation) — $\log_b n$ appears in complexity analysis, and the change of base formula shows that the base only changes the constant factor, not the growth rate.

**In CS:** The fact that $\log_b n = \log_2 n / \log_2 b$ means that changing the base multiplies the logarithm by a constant. In Big O notation, constants are dropped, so $O(\log_2 n) = O(\log_{10} n) = O(\ln n)$ — all bases give the same complexity class. This is why algorithm analysis writes $O(\log n)$ without specifying the base.

---

## Summary

**Definition:** $\log_b x = y \iff b^y = x$. Domain $(0,\infty)$, range $\mathbb{R}$.

**Key values:** $\log_b 1 = 0$; $\log_b b = 1$; $\log_b(b^k) = k$.

**Three laws** (for $b > 0$, $b \neq 1$; $M, N > 0$; $r \in \mathbb{R}$):

$$\log_b(MN) = \log_b M + \log_b N$$
$$\log_b(M/N) = \log_b M - \log_b N$$
$$\log_b(M^r) = r\log_b M$$

**Change of base:** $\log_b x = \dfrac{\ln x}{\ln b} = \dfrac{\log_{10} x}{\log_{10} b}$

**Reciprocal bases:** $\log_b x = \dfrac{1}{\log_x b}$

**New Python:**
- `math.log10(x)` — $\log_{10} x$
- `np.log10(x)`, `np.log2(x)` — element-wise base-10 and base-2 logs on arrays

---

## Problems

### Computation

**1.** Evaluate exactly.

(a) $\log_2 64$ &emsp;
(b) $\log_{10} 0.001$ &emsp;
(c) $\log_3\!\left(\tfrac{1}{27}\right)$ &emsp;
(d) $\log_5 5^{2.7}$ &emsp;
(e) $\log_4 8$

<details>
<summary>Answers</summary>

(a) $6$ ($2^6 = 64$) &emsp;
(b) $-3$ ($10^{-3} = 0.001$) &emsp;
(c) $-3$ ($3^{-3} = 1/27$) &emsp;
(d) $2.7$ (power law) &emsp;
(e) $\log_4 8 = \ln 8 / \ln 4 = 3\ln 2 / 2\ln 2 = 3/2$

</details>

---

**2.** Expand completely.

(a) $\log_2\!\left(8x^3\right)$

(b) $\log_{10}\!\left(\dfrac{x^2 y}{\sqrt{z}}\right)$

(c) $\ln\!\left(\dfrac{e^3 x^{-1/2}}{x^2 + 1}\right)$

<details>
<summary>Answers</summary>

(a) $\log_2 8 + 3\log_2 x = 3 + 3\log_2 x$

(b) $2\log x + \log y - \frac{1}{2}\log z$ (where $\log = \log_{10}$)

(c) $3 - \frac{1}{2}\ln x - \ln(x^2+1)$

</details>

---

**3.** Condense into a single logarithm.

(a) $\log_3 x + \log_3 5 - \log_3 2$

(b) $2\ln x - 3\ln y + \ln z$

(c) $\frac{1}{3}\left[\log_2(x^2-4) - \log_2(x+2)\right]$

<details>
<summary>Answers</summary>

(a) $\log_3(5x/2)$

(b) $\ln(x^2 z / y^3)$

(c) $\frac{1}{3}\log_2\!\left(\frac{x^2-4}{x+2}\right) = \frac{1}{3}\log_2(x-2)$ (since $x^2-4 = (x+2)(x-2)$); simplifies to $\log_2\!\left((x-2)^{1/3}\right) = \log_2(\sqrt[3]{x-2})$

</details>

---

### Understanding

**4.** Explain why $\log_b n$ and $\log_2 n$ differ only by a constant factor. Why does this mean that in Big O notation, the base of a logarithm doesn't matter?

<details>
<summary>Answer</summary>

By the change of base formula: $\log_b n = \log_2 n / \log_2 b$. Since $b$ is fixed, $1/\log_2 b$ is a constant. So $\log_b n = C \cdot \log_2 n$ where $C = 1/\log_2 b$. In Big O notation, constant factors are dropped: $O(C \cdot \log_2 n) = O(\log_2 n)$. So $O(\log_b n) = O(\log_2 n)$ for any base $b$, and we can write just $O(\log n)$ without specifying the base.

</details>

---

**5.** Two students expand $\log\!\left(\dfrac{x^2}{y}\right)^3$ differently:

- Student A: $3\log\!\left(\dfrac{x^2}{y}\right) = 3(2\log x - \log y) = 6\log x - 3\log y$
- Student B: $\log\!\left(\dfrac{x^6}{y^3}\right) = 6\log x - 3\log y$

Are both correct? Which approach is simpler?

<details>
<summary>Answer</summary>

Both are correct. Student A applies the power law first (moving the 3 outside), then expands. Student B distributes the exponent inside first (since $(x^2/y)^3 = x^6/y^3$), then applies the quotient and power laws. Both routes give $6\log x - 3\log y$. Student A's route is generally simpler — apply the power law first to bring the outermost exponent out, then expand.

</details>

---

### Proof

**6.** Prove that $\log_b x = \dfrac{1}{\log_x b}$ for $b, x > 0$, $b \neq 1$, $x \neq 1$.

<details>
<summary>Answer</summary>

**Proof:** By the change of base formula applied to both:

$\log_b x = \dfrac{\ln x}{\ln b}$ and $\log_x b = \dfrac{\ln b}{\ln x}$.

Therefore $\log_b x = \dfrac{\ln x}{\ln b} = \dfrac{1}{\ln b / \ln x} = \dfrac{1}{\log_x b}$. $\blacksquare$

</details>

---

### Extension

**7. ★** The **number of digits** of a positive integer $n$ in base $b$ is $\lfloor \log_b n \rfloor + 1$, where $\lfloor x \rfloor$ (the floor function) means the greatest integer $\leq x$.

(a) Verify that this formula gives the correct digit count for: 1, 9, 10, 99, 100, in base 10.

(b) How many bits (binary digits) does a 32-bit integer system need to represent? Verify your answer using the formula.

(c) Write a Python function `digit_count(n, b)` that computes the number of digits of `n` in base `b`, and verify it against Python's built-in `len(bin(n)) - 2` for `n = 1, 2, ..., 1023` (binary).

<details>
<summary>Answer to (a) and (b)</summary>

(a): $\lfloor\log_{10}(1)\rfloor+1 = 0+1 = 1$ ✓; $\lfloor\log_{10}(9)\rfloor+1 = 0+1 = 1$ ✓; $\lfloor\log_{10}(10)\rfloor+1 = 1+1 = 2$ ✓; $\lfloor\log_{10}(99)\rfloor+1 = 1+1 = 2$ ✓; $\lfloor\log_{10}(100)\rfloor+1 = 2+1 = 3$ ✓.

(b): A 32-bit system represents integers from 0 to $2^{32}-1$. The largest value is $2^{32}-1 \approx 4.29 \times 10^9$; $\lfloor\log_2(2^{32}-1)\rfloor+1 = 31+1 = 32$ bits. ✓

</details>
