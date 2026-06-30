# Stage 0, Lesson 0.10 — Proof by Induction
**Threads:** Math · CS  
**Estimated time:** 65–80 minutes

---

## What This Lesson Is About

Some statements are true for every natural number: $1 + 2 + \cdots + n
= \frac{n(n+1)}{2}$, or $3$ divides $n^3 - n$, or every power of 2 is
even. You can verify any specific case — check $n = 5$, check $n = 100$
— but checking a million cases does not prove the statement for all
infinitely many natural numbers. **Mathematical induction** is the proof
technique that bridges the gap: prove the first case, then prove that
each case implies the next, and you have implicitly proved all of them.
It is the closest thing mathematics has to a program loop — a finite
argument that covers infinitely many cases. By the end of this lesson
you will have proved three results by induction from scratch, understood
why the technique works logically, implemented an inductive verification
in Python, and seen how induction underpins the analysis of recursive
algorithms — the same technique used to prove that merge sort is
$O(n \log n)$.

---

## Historical Context

The principle of induction was first stated explicitly by Francesco
Maurolico in 1575, who used it to prove properties of figurate numbers
(sums arranged as triangles and squares). Blaise Pascal applied it
systematically in *Traité du triangle arithmétique* in 1654 when
studying the arithmetic triangle now named after him. The name
"mathematical induction" was coined by Augustus De Morgan in 1838 —
the same De Morgan of De Morgan's Laws from Lesson 0.2 and Lesson 0.3,
who contributed to both logic and proof theory. The technique became
foundational when Giuseppe Peano formalised the natural numbers in 1889:
induction is literally one of the Peano axioms — a defining property
of the natural numbers, not just a proof technique imposed on top.

---

## What You Need To Know First

- **Natural numbers $\mathbb{N}$** — Lesson 0.1. Induction works over
  $\mathbb{N} = \{1, 2, 3, \ldots\}$ (or sometimes from 0).
- **Implication** — Lesson 0.3. The inductive step is an implication:
  $P(k) \Rightarrow P(k+1)$.
- **Proof by contradiction** — Lesson 0.9. Understanding why induction
  works uses the well-ordering principle, proved by contradiction.

---

## The Lesson

### Why Checking Cases Is Not Enough

Consider the claim: "$n^2 - n + 41$ is prime for every natural number $n$."

Check a few cases:

| $n$ | $n^2 - n + 41$ | Prime? |
|-----|----------------|--------|
| 1   | 41             | ✓      |
| 2   | 43             | ✓      |
| 3   | 47             | ✓      |
| 10  | 131            | ✓      |
| 20  | 421            | ✓      |
| 40  | 1601           | ✓      |

Every case checked is prime. The pattern looks solid. But at $n = 41$:

$$41^2 - 41 + 41 = 41^2 = 1681 = 41 \times 41$$

Not prime. The pattern breaks at the 41st case, despite holding for the
first 40. No finite number of verified cases is a proof.

Induction gives a genuine proof — one that covers all cases at once.

---

### The Structure of Induction

**The Principle of Mathematical Induction:** Let $P(n)$ be a statement
about the natural number $n$. If:

1. **Base case:** $P(1)$ is true, and
2. **Inductive step:** for every $k \geq 1$, $P(k) \Rightarrow P(k+1)$,

then $P(n)$ is true for all $n \geq 1$.

**Formal lens:** The two conditions together form a chain. $P(1)$ is true
(base). $P(1) \Rightarrow P(2)$ (step), so $P(2)$ is true. $P(2)
\Rightarrow P(3)$ (step), so $P(3)$ is true. The chain extends infinitely,
covering every natural number. The Principle of Induction is the assertion
that this infinite chain is captured by two finite checks.

**Geometric lens:** Picture dominoes in a line. The base case knocks
over the first one. The inductive step guarantees that whenever any
domino falls, the next one falls too. Together, every domino falls.
Induction is the "domino principle" made mathematically precise.

**Why it works (via well-ordering):** Suppose $P(1)$ is true and
$P(k) \Rightarrow P(k+1)$ for all $k$. Suppose for contradiction that
$P(n)$ is false for some $n$. Let $S$ be the set of natural numbers for
which $P$ fails. By assumption $S$ is nonempty. The **well-ordering
principle** (every nonempty set of natural numbers has a smallest element)
gives a smallest failure $m \in S$. Since $P(1)$ is true, $m \geq 2$.
Then $m-1 \geq 1$ and $P(m-1)$ is true (since $m$ was the smallest
failure). But the inductive step gives $P(m-1) \Rightarrow P(m)$, so
$P(m)$ is true — contradiction with $m \in S$. Therefore $S$ is empty
and $P(n)$ holds for all $n$.

**The template for every induction proof:**

```
Proof. By induction on n.

Base case (n = 1): [verify P(1) directly].

Inductive step: Assume P(k) holds for some k ≥ 1
(this assumption is called the inductive hypothesis).
We must show P(k+1) holds.
[algebra/reasoning that uses P(k) to derive P(k+1)]

By the principle of induction, P(n) holds for all n ≥ 1. □
```

---

### First Example: The Gauss Sum Formula

The young Carl Friedrich Gauss, aged around 10, allegedly summed
$1 + 2 + \cdots + 100$ in seconds by pairing numbers: $1+100, 2+99,
3+98, \ldots$ — 50 pairs each summing to 101, giving $50 \times 101 = 5050$.

The general formula is:

$$1 + 2 + 3 + \cdots + n = \frac{n(n+1)}{2}$$

**Claim:** For all $n \geq 1$, $\displaystyle\sum_{k=1}^{n} k = \dfrac{n(n+1)}{2}$.

*(The symbol $\sum_{k=1}^{n} k$ means "add up $k$ for every $k$ from
1 to $n$" — shorthand for $1 + 2 + 3 + \cdots + n$.)*

*Proof.* By induction on $n$.

**Base case** $(n=1)$: The left side is just $1$. The right side is
$\frac{1 \cdot 2}{2} = 1$. They are equal. ✓

**Inductive step:** Assume the formula holds for some $k \geq 1$:

$$1 + 2 + \cdots + k = \frac{k(k+1)}{2} \qquad \text{(inductive hypothesis)}$$

We must show the formula holds for $k+1$, i.e.,

$$1 + 2 + \cdots + k + (k+1) = \frac{(k+1)(k+2)}{2}$$

Starting from the left side:

$$1 + 2 + \cdots + k + (k+1)
= \underbrace{\left(\frac{k(k+1)}{2}\right)}_{\text{by inductive hypothesis}} + (k+1)$$

$$= \frac{k(k+1)}{2} + \frac{2(k+1)}{2}
= \frac{k(k+1) + 2(k+1)}{2}
= \frac{(k+1)(k+2)}{2}$$

This is exactly the formula evaluated at $k+1$. ✓

By the principle of induction, the formula holds for all $n \geq 1$. $\blacksquare$

```python
import matplotlib.pyplot as plt
import numpy as np

# np.linspace reminder: np.linspace(start, stop, num) gives
# 'num' evenly spaced values from start to stop inclusive.

def gauss_sum_formula(n):
    """The closed-form formula: n(n+1)/2."""
    return n * (n + 1) // 2   # // is integer division -- exact for whole numbers

def direct_sum(n):
    """Direct computation: add 1 + 2 + ... + n."""
    return sum(range(1, n + 1))  # range(1, n+1) gives integers 1, 2, ..., n

# Verify both agree for n = 1 to 20
print("Verifying Gauss formula against direct sum:\n")
print(f"{'n':>4}  {'Direct sum':>12}  {'Formula':>12}  {'Match':>6}")
print("-" * 40)
for n in range(1, 21):
    direct  = direct_sum(n)
    formula = gauss_sum_formula(n)
    match   = "✓" if direct == formula else "✗"
    print(f"{n:>4}  {direct:>12}  {formula:>12}  {match:>6}")
```

**Walkthrough:** `sum(range(1, n+1))` computes the direct sum —
`range(1, n+1)` generates integers $1, 2, \ldots, n$, and Python's
built-in `sum` adds them. `n * (n + 1) // 2` computes the formula;
`//` (integer division) is used here because $n(n+1)$ is always even
(one of $n$ or $n+1$ must be even), so the result is always a whole
number and we avoid floating-point issues.

```python
import matplotlib.pyplot as plt
import numpy as np

# Visualise the formula geometrically:
# 1+2+...+n is the number of dots in a staircase triangle of height n.
# Two such triangles interlock to form an n×(n+1) rectangle.

def draw_gauss_visual(n, ax):
    """
    Draw two interlocking staircase triangles showing why 2(1+2+...+n) = n(n+1).
    Blue dots: the original triangle. Red dots: the flipped copy.
    Together they fill an n × (n+1) grid.
    """
    ax.set_xlim(-0.5, n + 0.5)
    ax.set_ylim(-0.5, n + 0.5)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_title(f'$n={n}$: two triangles fill a ${n}\\times{n+1}$ grid\n'
                 f'$2(1+2+\\cdots+{n}) = {n}\\times{n+1} = {n*(n+1)}$',
                 fontsize=10)

    for row in range(1, n + 1):
        for col in range(1, n + 2):
            if col <= row:
                # Blue dot: original staircase (lower-left triangle)
                ax.plot(col - 1, row - 1, 'o',
                        color='#2980b9', markersize=10, zorder=3)
            else:
                # Red dot: flipped triangle fills the rest of the rectangle
                ax.plot(col - 1, row - 1, 'o',
                        color='#e74c3c', markersize=10, zorder=3,
                        alpha=0.5)  # alpha: transparency (0=invisible, 1=solid)

fig, axes = plt.subplots(1, 3, figsize=(13, 5))
# plt.subplots(1, 3): 1 row, 3 columns -- one panel per chosen n value

for ax, n in zip(axes, [3, 4, 5]):
    # zip(axes, [3,4,5]) pairs each axes object with a value of n
    draw_gauss_visual(n, ax)

plt.suptitle("Gauss's formula: two interlocking staircase triangles"
             " form a rectangle", fontsize=12, y=1.02)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `draw_gauss_visual` draws two triangles of dots that
interlock to form a rectangle. For each row and column, `col <= row`
identifies the lower-left triangle (the staircase sum), coloured blue.
The remaining dots (upper-right triangle) are coloured red with
`alpha=0.5` to make them semi-transparent. The rectangle formed
has $n$ rows and $n+1$ columns — $n(n+1)$ dots total — confirming
that twice the staircase sum equals $n(n+1)$, which is exactly
the Gauss formula. `zip(axes, [3,4,5])` pairs each subplot with
its $n$ value; `zip` was introduced in Lesson 0.6.

---

### Second Example: Sum of Powers of 2

**Claim:** For all $n \geq 0$,

$$2^0 + 2^1 + 2^2 + \cdots + 2^n = 2^{n+1} - 1$$

*Proof.* By induction on $n$.

**Base case** $(n=0)$: Left side $= 2^0 = 1$. Right side $= 2^1 - 1 = 1$. ✓

**Inductive step:** Assume $\displaystyle\sum_{k=0}^{n} 2^k = 2^{n+1} - 1$
for some $n \geq 0$ (inductive hypothesis).

We must show $\displaystyle\sum_{k=0}^{n+1} 2^k = 2^{n+2} - 1$.

$$\sum_{k=0}^{n+1} 2^k
= \underbrace{\sum_{k=0}^{n} 2^k}_{\text{inductive hypothesis}} + 2^{n+1}
= \left(2^{n+1} - 1\right) + 2^{n+1}
= 2 \cdot 2^{n+1} - 1
= 2^{n+2} - 1 \checkmark$$

By induction, the formula holds for all $n \geq 0$. $\blacksquare$

**Why this matters in CS:** In binary, $n+1$ bits can represent
the integers $0$ through $2^{n+1} - 1$. The formula says: the number of
values representable is $2^{n+1}$, which is one more than the maximum
value — because 0 is included. Every binary arithmetic system you
have used relies on this.

```python
# Verify powers-of-2 sum formula

def powers_of_2_formula(n):
    """Closed-form: 2^(n+1) - 1."""
    return 2**(n + 1) - 1    # ** is Python's exponentiation operator

def powers_of_2_direct(n):
    """Direct computation: sum of 2^k for k from 0 to n."""
    return sum(2**k for k in range(n + 1))
    # range(n+1) gives 0, 1, 2, ..., n
    # (2**k for k in range(n+1)) is a generator expression:
    # it produces values one at a time without building a list first

print("Powers-of-2 sum formula:\n")
for n in range(11):
    direct  = powers_of_2_direct(n)
    formula = powers_of_2_formula(n)
    binary_bits = n + 1
    print(f"n={n:2d}: sum={direct:5d}, formula={formula:5d}, "
          f"= {binary_bits}-bit max value ({binary_bits} bits hold 0..{formula})")
```

**Walkthrough:** `(2**k for k in range(n+1))` is a **generator
expression** — it produces values lazily one at a time rather than
building a complete list in memory. Here it is passed directly to
`sum()`, which adds each generated value. This is efficient for large
$n$ since it never stores the full sequence. The output column
"$b$-bit max value" connects the formula directly to binary
representation: $n+1$ bits hold exactly $0$ through $2^{n+1}-1$.

---

### Third Example: Divisibility

**Claim:** For all $n \geq 0$, $3 \mid n^3 - n$.

*(Recall $3 \mid m$ means 3 divides $m$ — i.e., $m = 3j$ for some
integer $j$.)*

*Proof.* By induction on $n$.

**Base case** $(n=0)$: $0^3 - 0 = 0 = 3 \times 0$. $3 \mid 0$. ✓

**Inductive step:** Assume $3 \mid k^3 - k$ for some $k \geq 0$.
We must show $3 \mid (k+1)^3 - (k+1)$.

Expand:

$$(k+1)^3 - (k+1) = k^3 + 3k^2 + 3k + 1 - k - 1 = k^3 - k + 3k^2 + 3k$$

$$= \underbrace{(k^3 - k)}_{\text{div. by 3 (ind. hyp.)}} + \underbrace{3k^2 + 3k}_{= 3(k^2 + k),\text{ div. by 3}}$$

Since both terms are divisible by 3, their sum is divisible by 3. ✓

By induction, $3 \mid n^3 - n$ for all $n \geq 0$. $\blacksquare$

**Alternative proof without induction:** $n^3 - n = n(n^2-1) = n(n-1)(n+1) = (n-1)n(n+1)$ — three consecutive integers. Among any three consecutive integers, exactly one is divisible by 3. This gives a shorter proof, but misses the practice of the inductive technique. Both proofs are valid.

```python
# Verify divisibility claim and see the pattern

print("Checking 3 | n³ - n:\n")
for n in range(15):
    value = n**3 - n

    # Factor into consecutive integers to see why it's always divisible by 3
    factored = (n-1) * n * (n+1)   # n³-n = (n-1)n(n+1)

    divisible = (value % 3 == 0)
    print(f"  n={n:2d}: {n}³-{n} = {value:4d} = "
          f"({n-1})×{n}×{n+1} = {factored:4d}, ÷3: {divisible}")
```

**Walkthrough:** `value % 3 == 0` checks divisibility by 3 — remainder
zero means divisible. `(n-1) * n * (n+1)` computes the factored form,
confirming it equals $n^3 - n$ for every $n$ and making the "three
consecutive integers" argument visible in the numbers.

---

### Induction and Recursive Algorithms

Induction is the natural proof technique for recursive algorithms because
a recursive function is literally structured as a base case plus a step
that reduces to a smaller case — the same structure as induction.

**Example:** Prove that the following function correctly computes $n!$
(the factorial of $n$, defined as $1 \times 2 \times \cdots \times n$
with $0! = 1$) for all $n \geq 0$.

```python
def factorial(n):
    # Base case: 0! = 1 by definition
    if n == 0:
        return 1
    # Recursive step: n! = n × (n-1)!
    # The function calls itself with a smaller argument (n-1),
    # which is guaranteed to eventually reach the base case n=0
    return n * factorial(n - 1)

# Verify against Python's built-in math.factorial for n = 0 to 10
import math

print("Verifying recursive factorial:\n")
for n in range(11):
    our_result    = factorial(n)
    builtin_result = math.factorial(n)  # math.factorial: Python's built-in
    match = "✓" if our_result == builtin_result else "✗"
    print(f"  {n}! = {our_result:8d}  {match}")
```

**Walkthrough:** `factorial` calls itself with `n - 1` — each call
reduces the problem by one step toward the base case `n = 0`. This
recursive structure maps directly onto an inductive proof:

- **Base case:** `factorial(0)` returns 1. Is $0! = 1$? Yes, by definition. ✓
- **Inductive step:** Assume `factorial(k)` correctly returns $k!$.
  Then `factorial(k+1)` returns `(k+1) * factorial(k) = (k+1) * k! = (k+1)!`. ✓

Every correct recursive function has a corresponding induction proof
hidden in its structure. Conversely, any inductive proof can be
turned into a recursive algorithm.

---

## Connect the Pieces

**What this lesson built on:** Natural numbers $\mathbb{N}$ (Lesson 0.1).
Implication (Lesson 0.3) — the inductive step is an implication
$P(k) \Rightarrow P(k+1)$. Proof by contradiction (Lesson 0.9) — the
justification of induction via well-ordering uses contradiction.

**What this lesson makes possible:** Stage 9 (Algorithms) uses induction
constantly to prove that recursive algorithms are correct and to derive
their running times. The proof that merge sort runs in $O(n \log n)$
is a direct induction on the size of the input. Stage 1 uses induction
to prove properties of polynomial arithmetic. Stage 9 (Discrete
Mathematics) uses strong induction to prove the Fundamental Theorem
of Arithmetic (unique prime factorisation).

**In computer science:** Every loop invariant proof — the standard way
to prove that an iterative algorithm is correct — is an application of
induction where the inductive variable is the loop counter. If you have
ever written `assert` statements inside a loop to check that certain
conditions hold, you were informally doing induction.

---

## Summary

**Principle of Mathematical Induction:** to prove $P(n)$ for all $n \geq 1$:
1. **Base case:** prove $P(1)$.
2. **Inductive step:** assume $P(k)$ (the **inductive hypothesis**),
   prove $P(k+1)$.

**Template:**
> *Proof. By induction on $n$.
> Base case $(n=1)$: [direct verification].
> Inductive step: assume $P(k)$. [Derive $P(k+1)$].
> By induction, $P(n)$ holds for all $n \geq 1$. $\square$*

**Key results proved:**

$$\sum_{k=1}^{n} k = \frac{n(n+1)}{2}
\qquad
\sum_{k=0}^{n} 2^k = 2^{n+1} - 1
\qquad
3 \mid n^3 - n \text{ for all } n \geq 0$$

**Connection to recursion:** a recursive function's base case is the
induction base case; its recursive call is the inductive step.

**New Python:**
- `(expr for x in iterable)` — generator expression, like a list
  comprehension but produces values lazily (one at a time)
- `math.factorial(n)` — built-in factorial
- `alpha=` argument in matplotlib: transparency from 0.0 (invisible) to 1.0 (solid)

---

## Problems

### Math

**1.** Prove by induction: for all $n \geq 1$,

$$1^2 + 2^2 + 3^2 + \cdots + n^2 = \frac{n(n+1)(2n+1)}{6}$$

<details>
<summary>Hint</summary>

Follow the Gauss formula template exactly. The base case is $n=1$:
check that $1^2 = \frac{1 \cdot 2 \cdot 3}{6} = 1$. For the inductive
step, write out the sum to $k+1$, apply the inductive hypothesis to
the sum to $k$, and simplify $\frac{k(k+1)(2k+1)}{6} + (k+1)^2$.
Factor out $(k+1)$ to get the formula at $k+1$.

</details>

<details>
<summary>Answer</summary>

**Base case** $(n=1)$: $1^2 = 1$ and $\frac{1 \cdot 2 \cdot 3}{6} = 1$. ✓

**Inductive step:** Assume $\sum_{k=1}^{n} k^2 = \frac{n(n+1)(2n+1)}{6}$.

$$\sum_{k=1}^{n+1} k^2 = \frac{n(n+1)(2n+1)}{6} + (n+1)^2
= \frac{n(n+1)(2n+1) + 6(n+1)^2}{6}$$

$$= \frac{(n+1)[n(2n+1) + 6(n+1)]}{6}
= \frac{(n+1)(2n^2+7n+6)}{6}
= \frac{(n+1)(n+2)(2n+3)}{6}$$

This is the formula at $n+1$. $\square$

</details>

---

**2.** Prove by induction: for all $n \geq 1$, $4 \mid n^4 - n^2$.

<details>
<summary>Hint</summary>

Write $n^4 - n^2 = n^2(n^2-1) = n^2(n-1)(n+1)$. The inductive approach:
check the base $n=1$, then for the step write $(k+1)^4 - (k+1)^2$ and
expand, using the inductive hypothesis that $4 \mid k^4 - k^2$.

Alternatively, note $n^2(n-1)(n+1)$ is the product of $n^2$ and two
consecutive integers centred at $n$. Among consecutive integers $(n-1)$,
$n$, $(n+1)$, at least one is even — can you show the product is
always divisible by 4?

</details>

<details>
<summary>Answer</summary>

Direct approach (no induction needed): $n^4 - n^2 = n^2(n-1)(n+1)$.
Among $(n-1)$, $n$, $(n+1)$, at least one is even. If $n$ is even,
$n^2$ is divisible by 4. If $n$ is odd, both $n-1$ and $n+1$ are even,
so $(n-1)(n+1)$ is divisible by 4. In either case $4 \mid n^2(n-1)(n+1)$.

Inductive proof: base $n=1$: $1-1=0$, $4 \mid 0$. ✓
Inductive step: expand $(k+1)^4 - (k+1)^2 = k^4+4k^3+6k^2+4k+1 - k^2-2k-1$
$= (k^4-k^2) + 4k^3+5k^2+2k$. The first term is divisible by 4 (hypothesis).
The rest: $4k^3+5k^2+2k = k(4k^2+5k+2) = k(k+1)(4k+2)$. Since $k(k+1)$
contains two consecutive integers, one is even, so $4 \mid 2k(k+1)(2k+1)$...
the algebra becomes messy. The direct approach is cleaner here, showing
that sometimes the "right" proof is not induction. $\square$

</details>

---

**3.** (Proof) Prove by induction that for all $n \geq 1$,

$$\frac{1}{1 \cdot 2} + \frac{1}{2 \cdot 3} + \frac{1}{3 \cdot 4}
+ \cdots + \frac{1}{n(n+1)} = \frac{n}{n+1}$$

<details>
<summary>Answer</summary>

**Base case** $(n=1)$: $\frac{1}{1 \cdot 2} = \frac{1}{2}$ and $\frac{1}{1+1} = \frac{1}{2}$. ✓

**Inductive step:** Assume $\sum_{k=1}^{n} \frac{1}{k(k+1)} = \frac{n}{n+1}$.

$$\sum_{k=1}^{n+1} \frac{1}{k(k+1)} = \frac{n}{n+1} + \frac{1}{(n+1)(n+2)}
= \frac{n(n+2) + 1}{(n+1)(n+2)} = \frac{n^2+2n+1}{(n+1)(n+2)}
= \frac{(n+1)^2}{(n+1)(n+2)} = \frac{n+1}{n+2}$$

This is the formula at $n+1$. $\square$

</details>

---

### Code Challenges

**Challenge 1 — Verify any inductive formula**

```python
def verify_inductive_formula(formula, direct_computation, test_range):
    """
    Check whether formula(n) == direct_computation(n)
    for every n in test_range.
    
    formula:            a function n → claimed closed-form value
    direct_computation: a function n → computed directly (no formula)
    test_range:         an iterable of n values to test
    
    Returns True if all match, False if any differ.
    Prints which n failed if there is a mismatch.
    """
    pass  # your code here


# --- tests: do not modify ---
# Gauss formula
gauss_formula = lambda n: n * (n + 1) // 2
gauss_direct  = lambda n: sum(range(1, n + 1))

assert verify_inductive_formula(gauss_formula, gauss_direct, range(1, 101)) == True

# Deliberately broken formula (off by one)
broken_formula = lambda n: n * (n + 1) // 2 + 1
assert verify_inductive_formula(broken_formula, gauss_direct, range(1, 10)) == False

# Powers-of-2 formula
pow2_formula = lambda n: 2**(n + 1) - 1
pow2_direct  = lambda n: sum(2**k for k in range(n + 1))
assert verify_inductive_formula(pow2_formula, pow2_direct, range(0, 30)) == True

print("✓ Challenge 1 passed!")
```

<details>
<summary>Hint</summary>

Loop over every value in `test_range`. For each, compare
`formula(n)` and `direct_computation(n)`. If they differ,
print a message showing which `n` failed and return `False`.
If the loop finishes without finding a mismatch, return `True`.

</details>

---

**Challenge 2 — Find the formula**

The sum $1 + 3 + 5 + \cdots + (2n-1)$ — the first $n$ odd numbers
— follows a pattern. Compute this sum for $n = 1$ through $10$, spot
the pattern, state the formula, then prove it by induction.

```python
def sum_of_odds(n):
    """Return 1 + 3 + 5 + ... + (2n-1), the sum of the first n odd numbers."""
    pass  # your code here


# --- tests: do not modify ---
assert sum_of_odds(1)  == 1
assert sum_of_odds(2)  == 4
assert sum_of_odds(3)  == 9
assert sum_of_odds(4)  == 16
assert sum_of_odds(10) == 100

print("✓ Challenge 2 passed!")
print()
print("The pattern: sum of first n odd numbers =", [sum_of_odds(n) for n in range(1, 11)])
print("Your job: spot the formula and write the induction proof in your notebook.")
```

<details>
<summary>Hint for the formula</summary>

Look at the outputs: 1, 4, 9, 16, 25, ... Does that sequence look familiar?

</details>

<details>
<summary>Answer (formula only — write the proof yourself)</summary>

$$1 + 3 + 5 + \cdots + (2n-1) = n^2$$

The sum of the first $n$ odd numbers is always a perfect square.
Geometrically, each successive odd number adds an L-shaped border
to a square, building it up one layer at a time.

</details>

---

**Challenge 3 — Recursive to iterative**

The recursive factorial from the lesson works but uses extra memory
for each function call. Implement an equivalent **iterative** version
using a `for` loop, and verify they agree.

```python
def factorial_iterative(n):
    """
    Compute n! using a for loop instead of recursion.
    Same result as the recursive version, but uses constant memory.
    """
    pass  # your code here


# --- tests: do not modify ---
import math

for n in range(13):
    assert factorial_iterative(n) == math.factorial(n), \
        f"Mismatch at n={n}: got {factorial_iterative(n)}, expected {math.factorial(n)}"

print("✓ Challenge 3 passed!")
```

<details>
<summary>Hint</summary>

Start with `result = 1`. Then multiply `result` by each integer
from 1 to `n` in order using a `for` loop. Return `result` after
the loop. This is the iterative version of the same computation the
recursive version does.

</details>

---

### Extension

**4. ★** Strong induction: the Fibonacci sequence is defined by
$F_0 = 0$, $F_1 = 1$, and $F_n = F_{n-1} + F_{n-2}$ for $n \geq 2$.

In **strong induction**, the inductive step assumes $P(j)$ holds for
*all* $j < k$ (not just $j = k-1$), then proves $P(k)$.

Prove: $F_n < 2^n$ for all $n \geq 0$.

<details>
<summary>Hint</summary>

Base cases: $n=0$: $F_0 = 0 < 1 = 2^0$. $n=1$: $F_1 = 1 < 2 = 2^1$.
Inductive step (strong): assume $F_j < 2^j$ for all $j < n$, prove $F_n < 2^n$.
Use $F_n = F_{n-1} + F_{n-2}$ and apply the hypothesis to both $F_{n-1}$
and $F_{n-2}$ — this requires strong induction because you need two
previous cases, not just one.

</details>

<details>
<summary>Answer</summary>

Base cases: $F_0 = 0 < 1 = 2^0$ ✓, $F_1 = 1 < 2 = 2^1$ ✓.

Strong inductive step: Assume $F_j < 2^j$ for all $j < n$ (with $n \geq 2$).
Then:
$$F_n = F_{n-1} + F_{n-2} < 2^{n-1} + 2^{n-2} = 2^{n-2}(2 + 1) = 3 \cdot 2^{n-2} < 4 \cdot 2^{n-2} = 2^n$$

Therefore $F_n < 2^n$. $\square$

</details>

**5. ★** Implement `fibonacci` using the recursive definition and prove,
using the induction argument from Extension 4 as a guide, that your
function's call stack depth is bounded by $O(n)$.

```python
def fibonacci(n):
    """Return the nth Fibonacci number. F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)."""
    pass  # your code here


# --- tests: do not modify ---
expected = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
for i, exp in enumerate(expected):
    assert fibonacci(i) == exp, f"fibonacci({i}) should be {exp}"

print("✓ Extension 5 passed!")
print()
print("Call depth: the recursion tree has depth n (following the F(n-1) branch).")
print("Total calls: O(2^n) without memoization -- exponential, not linear!")
print("This is why real implementations use iteration or memoization.")
```
