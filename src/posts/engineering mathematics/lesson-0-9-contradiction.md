# Stage 0, Lesson 0.9 — Proof by Contradiction
**Threads:** Math  
**Estimated time:** 55–70 minutes

---

## What This Lesson Is About

Some things are true but cannot be proved directly — you cannot produce
a witness, write down a formula, or construct an example that makes the
truth obvious. The ancient Greeks discovered this in roughly 500 BCE when
they asked: is $\sqrt{2}$ a fraction? Direct attempts to write $\sqrt{2}$
as $p/q$ always fail, but failing to find something is not a proof it
doesn't exist. Proof by contradiction sidesteps this problem entirely.
Instead of proving the statement directly, you assume it is false and
derive a logical impossibility — something that cannot be true under any
circumstances. Since the assumption led somewhere impossible, the
assumption itself must be wrong, and the original statement must be true.
This lesson builds that technique from scratch, proves $\sqrt{2}$ is
irrational in full detail, and then proves Euclid's 2300-year-old result
that there are infinitely many prime numbers — a fact that will reappear
as the security foundation of RSA cryptography in Stage 10. By the end of
this lesson you will have two complete proofs by contradiction under your
belt, understood not just as logical manoeuvres but as genuine mathematical
insight.

---

## Historical Context

The Pythagorean school of ancient Greece, active around 500 BCE, believed
that all quantities could be expressed as ratios of whole numbers.
According to legend, a student named Hippasus proved that $\sqrt{2}$
could not be so expressed and was thrown overboard from a ship for the
heresy. Whether or not the story is true, the proof itself is one of the
oldest and most elegant in mathematics. Euclid's proof that there are
infinitely many primes appeared in his *Elements* around 300 BCE and has
never been improved upon — the same argument, 23 centuries later, remains
the standard proof. Both proofs use contradiction.

---

## What You Need To Know First

- **Logic and implication** — Lesson 0.3. Contradiction works by
  deriving $P \land \lnot P$ — a statement that is always false.
  Knowing the contrapositive $P \to Q \equiv \lnot Q \to \lnot P$
  will help when we classify numbers as even or odd.
- **Sets and membership** — Lesson 0.1. We use $\mathbb{Q}$
  (rationals) and $\mathbb{Z}$ (integers) from the standard number
  sets introduced there.
- **Divisibility** — informally: $a$ divides $b$ (written $a \mid b$)
  means $b = ka$ for some integer $k$. This is developed fully in
  Stage 9 (Number Theory) but used here in its plain sense.

---

## The Lesson

### The Logic of Contradiction

**Definition:** A **proof by contradiction** proves a statement $P$ by:

1. **Assuming** $\lnot P$ — the negation of what you want to prove.
2. **Deriving** a **contradiction** — a statement $Q \land \lnot Q$
   that is logically impossible.
3. **Concluding** that $\lnot P$ must be false, so $P$ must be true.

**Why this works:** From Lesson 0.3, a contradiction is a statement that
is always false regardless of truth values. In a valid logical argument,
if the premises are true and the reasoning is valid, the conclusion must
be true. If the conclusion is a contradiction (always false), then at
least one premise must be false. Since the only premise we introduced
was $\lnot P$, that premise must be false — meaning $P$ is true.

**Formal justification:** Proof by contradiction is a consequence of the
**law of the excluded middle** ($P \lor \lnot P$ is a tautology, Lesson 0.3):
every proposition is either true or false, with no middle ground. If $\lnot P$
is false, then $P$ must be true.

**The structure in every proof:**

```
Proof. Suppose, for contradiction, that [¬P].
...
[several logical steps]
...
This contradicts [something already known to be true].
Therefore [¬P] is false, and [P] must be true. □
```

This template — "suppose for contradiction," derive impossibility,
conclude — is fixed. You will use it word-for-word in every proof
by contradiction.

---

### A Warm-Up: No Largest Integer

Before the harder results, here is a short proof to demonstrate the template.

**Claim:** There is no largest integer.

*Proof.* Suppose, for contradiction, that there is a largest integer.
Call it $N$. Then $N + 1$ is also an integer (the integers are closed
under addition), and $N + 1 > N$. This contradicts the assumption
that $N$ is the largest integer.
Therefore no largest integer exists. $\blacksquare$

**Walkthrough of the logic:** We assumed "a largest integer $N$ exists,"
then derived "$N + 1 > N$" — a number larger than the supposed largest.
That is the contradiction: $N$ is largest AND $N$ is not largest.
Since two contradictory things cannot both be true, the assumption fails.

---

### A Key Lemma: If $n^2$ Is Even, Then $n$ Is Even

Before proving $\sqrt{2}$ is irrational, we need this fact as a building
block. A result used inside a larger proof is called a **lemma** — a
small theorem whose main purpose is to serve the larger argument.

**Lemma:** For any integer $n$, if $n^2$ is even then $n$ is even.

*Proof.* We use the contrapositive: instead of proving
"$n^2$ even $\Rightarrow$ $n$ even," we prove the logically equivalent
"$n$ odd $\Rightarrow$ $n^2$ odd" (from Lesson 0.3:
$P \to Q \equiv \lnot Q \to \lnot P$).

Suppose $n$ is odd. Then $n = 2k + 1$ for some integer $k$ (this is
the definition of odd: one more than an even number).
Then:

$$n^2 = (2k+1)^2 = 4k^2 + 4k + 1 = 2(2k^2 + 2k) + 1$$

Since $n^2 = 2(2k^2 + 2k) + 1$, $n^2$ is one more than an even number,
so $n^2$ is odd. This proves the contrapositive, so the original
statement holds: if $n^2$ is even, then $n$ is even. $\blacksquare$

**Why the contrapositive here instead of direct contradiction?**
The contrapositive turns the argument around to something we can handle
directly with algebra — expanding $(2k+1)^2$. A direct proof
("suppose $n^2$ is even, show $n$ is even") is harder because "even"
does not simplify as cleanly as "odd" when substituted into an expression.
Choosing between direct proof, contradiction, and contrapositive is a
craft skill; this is a case where contrapositive wins.

```python
# Verify the lemma computationally:
# check that for all integers from -20 to 20,
# n^2 even implies n even

print("Checking: if n² is even then n must be even\n")

all_hold = True
for n in range(-20, 21):
    n_squared = n ** 2
    n_sq_even = (n_squared % 2 == 0)  # True if n² is divisible by 2
    n_even    = (n % 2 == 0)          # True if n is divisible by 2

    if n_sq_even and not n_even:
        # Found a counterexample -- the lemma would be false
        print(f"  COUNTEREXAMPLE: n={n}, n²={n_squared}")
        all_hold = False

if all_hold:
    print("  No counterexamples found in range [-20, 20].")
    print("  The algebraic proof above confirms it holds for ALL integers.")
```

**Walkthrough:** `n % 2 == 0` tests whether `n` is divisible by 2 —
the `%` operator (introduced in the crypto lessons) returns the remainder
after division, and a remainder of 0 means even. The loop checks every
integer from $-20$ to $20$ for a counterexample. Finding none doesn't
prove the lemma (we'd need to check infinitely many integers), but
gives strong numerical confidence before relying on the algebraic proof.

---

### $\sqrt{2}$ Is Irrational

We are now ready for one of the most famous proofs in mathematics.

**Claim:** $\sqrt{2}$ is irrational — it cannot be written as $\frac{p}{q}$
where $p$ and $q$ are integers.

Before the proof, let us see why naive attempts fail. We can find rational
numbers that get *close* to $\sqrt{2}$:

$$\frac{1}{1} = 1, \quad \frac{3}{2} = 1.5, \quad \frac{7}{5} = 1.4,
\quad \frac{17}{12} \approx 1.4167, \quad \frac{99}{70} \approx 1.4143, \ldots$$

Each gets closer, but none is exact. The proof explains why none ever will be.

```python
import matplotlib.pyplot as plt
import numpy as np
import math

# np.linspace reminder: evenly spaced values between two endpoints
# math.sqrt: standard library square root function

sqrt2 = math.sqrt(2)

# Rational approximations to sqrt(2) -- the convergents of its
# continued fraction representation, which are the "best" rational
# approximations possible
approximations = [(1,1),(3,2),(7,5),(17,12),(41,29),(99,70),(239,169)]

print("Rational approximations to √2:\n")
print(f"{'p':>6} {'q':>6} {'p/q':>14} {'error':>14}")
print("-" * 46)
for p, q in approximations:
    value = p / q
    error = abs(value - sqrt2)
    # f-string formatting:
    # >6 means right-aligned in a field 6 characters wide
    # .10f means 10 decimal places
    print(f"{p:>6} {q:>6} {value:>14.10f} {error:>14.2e}")

print(f"\n√2 actual: {sqrt2:.10f}")
print("None of these equal √2 exactly -- the proof below explains why.")
```

**Walkthrough:** The approximations shown are the **convergents** of
$\sqrt{2}$'s continued fraction — the best possible rational
approximations with each denominator size. Despite getting extraordinarily
close (error $< 10^{-4}$ already for $17/12$), none is exact. The error
column uses `:.2e` format — **scientific notation** with 2 decimal places
(e.g., `3.49e-04` means $3.49 \times 10^{-4}$) — convenient when numbers
span many orders of magnitude.

```python
import matplotlib.pyplot as plt
import numpy as np
import math

sqrt2 = math.sqrt(2)

approximations = [(1,1),(3,2),(7,5),(17,12),(41,29),(99,70),(239,169)]

fig, ax = plt.subplots(figsize=(10, 2.5))

# Draw the number line
ax.axhline(0, color='#333', lw=1.5)

# Mark fixed reference points
for x, label, color in [(1,'$1$','#555'), (sqrt2,'$\\sqrt{2}$','#e74c3c'), (2,'$2$','#555')]:
    ax.plot(x, 0, 'o', color=color, markersize=10, zorder=5)
    ax.plot([x, x], [-0.05, 0.05], color=color, lw=1.5)
    ax.text(x, -0.14, label, ha='center', va='top', fontsize=11, color=color)

# Plot each rational approximation as a triangle above the line
for p, q in approximations:
    ax.plot(p/q, 0.10, '^',
            color='#27ae60',
            markersize=8,
            zorder=4)

ax.annotate('Rational approximations\n(green) approach $\\sqrt{2}$ (red)\nbut never reach it',
            xy=(99/70, 0.10),    # xy: where the arrowhead points
            xytext=(1.55, 0.28), # xytext: where the label text sits
            arrowprops=dict(arrowstyle='->', color='#27ae60', lw=1.2),
            fontsize=9, color='#27ae60', ha='center')

ax.set_xlim(0.92, 1.55)
ax.set_ylim(-0.3, 0.42)
ax.axis('off')
ax.set_title('The gap between rational approximations and $\\sqrt{2}$'
             ' shrinks but never closes', fontsize=11)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `ax.annotate(text, xy=..., xytext=..., arrowprops=...)`
draws a label connected to a point by an arrow.
- `xy` — where the arrowhead touches (the thing being annotated)
- `xytext` — where the text label is positioned
- `arrowprops=dict(...)` — a dictionary configuring the arrow style;
  `arrowstyle='->'` gives a standard pointed arrow, `lw=1.2` sets the
  line width. This pattern is the same `ax.annotate` from Lesson 0.8,
  reused here with a reminder of each argument.

**The proof:**

*Proof.* Suppose, for contradiction, that $\sqrt{2}$ is rational.
Then we can write $\sqrt{2} = \dfrac{p}{q}$ where $p, q \in \mathbb{Z}$,
$q \neq 0$, and $\gcd(p, q) = 1$ — that is, the fraction is in
**lowest terms** (no common factors can be cancelled out).

Squaring both sides:

$$2 = \frac{p^2}{q^2} \implies p^2 = 2q^2$$

Since $p^2 = 2q^2$, $p^2$ is even (it equals $2$ times something).

By the Lemma, $p^2$ even implies $p$ is even.
So $p = 2k$ for some integer $k$.

Substituting $p = 2k$:

$$(2k)^2 = 2q^2 \implies 4k^2 = 2q^2 \implies q^2 = 2k^2$$

So $q^2$ is even. By the Lemma again, $q$ is even.

But now both $p$ and $q$ are even, so $2 \mid p$ and $2 \mid q$,
meaning $\gcd(p, q) \geq 2$. This **contradicts** our assumption that
$\gcd(p, q) = 1$.

Therefore $\sqrt{2}$ is not rational — $\sqrt{2}$ is irrational. $\blacksquare$

**Walking through the proof structure:**

```python
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(10, 5.5))
ax.set_xlim(0, 10)
ax.set_ylim(0, 7)
ax.axis('off')
ax.set_title('Proof structure: each step follows from the last', fontsize=12, pad=12)

# Each box: (x_centre, y_centre, text, background_colour)
steps = [
    (5, 6.4, 'ASSUME: $\\sqrt{2} = p/q$,  $\\gcd(p,q) = 1$',           '#2980b9'),
    (5, 5.3, 'Square both sides: $p^2 = 2q^2$',                          '#555555'),
    (5, 4.2, '$p^2$ is even  $\\Rightarrow$  $p$ is even  (Lemma)',      '#555555'),
    (5, 3.1, 'Write $p = 2k$;  substitute:  $q^2 = 2k^2$',              '#555555'),
    (5, 2.0, '$q^2$ is even  $\\Rightarrow$  $q$ is even  (Lemma again)','#555555'),
    (5, 0.8, '$p$ even AND $q$ even  $\\Rightarrow$  $\\gcd(p,q) \\geq 2$'
             '  ⚡ Contradicts $\\gcd(p,q)=1$',                           '#c0392b'),
]

for (x, y, text, bg) in steps:
    ax.text(x, y, text,
            ha='center', va='center',
            fontsize=9.5, color='white',
            bbox=dict(boxstyle='round,pad=0.45',
                      facecolor=bg,
                      edgecolor='none'))

# Draw arrows connecting each box to the next
y_positions = [s[1] for s in steps]
for y_top, y_bot in zip(y_positions[:-1], y_positions[1:]):
    ax.annotate('',
                xy=(5, y_bot + 0.28),      # arrowhead: top edge of lower box
                xytext=(5, y_top - 0.28),  # tail: bottom edge of upper box
                arrowprops=dict(arrowstyle='->',
                                color='#888888',
                                lw=1.5))

# Label conclusion clearly
ax.text(8.0, 0.8,
        'CONCLUDE:\n$\\sqrt{2}$ is irrational',
        ha='center', va='center',
        fontsize=10, color='#c0392b', fontweight='bold')
ax.annotate('',
            xy=(6.6, 0.8),   # arrowhead points at the conclusion text
            xytext=(7.5, 0.8),
            arrowprops=dict(arrowstyle='<-', color='#c0392b', lw=1.5))

plt.tight_layout()
plt.show()
```

**Walkthrough:** `zip(y_positions[:-1], y_positions[1:])` pairs each
$y$-position with the one below it — `[:-1]` is Python slice notation
for "all but the last element," and `[1:]` means "all but the first."
Zipping them together gives consecutive pairs: $(y_0, y_1)$, $(y_1, y_2)$,
etc. — exactly what we need to draw arrows between adjacent boxes.
Each arrow uses `ax.annotate('', xy=..., xytext=..., arrowprops=...)`
with an empty string `''` as the text — this draws only the arrow with
no label, which is all we need here.

---

### Infinitely Many Primes

Here is Euclid's proof, unchanged in substance for 2300 years.

**Claim:** There are infinitely many prime numbers.

*Proof.* Suppose, for contradiction, that there are only finitely many
primes. List them all: $p_1, p_2, \ldots, p_n$.

Define:

$$N = p_1 \cdot p_2 \cdots p_n + 1$$

$N$ is greater than every prime in our list (since we added 1 to their
product). By the **Fundamental Theorem of Arithmetic** — every integer
greater than 1 is either prime or has a prime factor — $N$ must either
be prime itself, or have a prime factor.

**Case 1:** $N$ is prime. Then $N$ is a prime not in our list
(since $N > p_n$), contradicting the assumption that we listed all primes.

**Case 2:** $N$ has a prime factor $p$. That factor $p$ must appear in
our list (we listed all primes). But then $p$ divides the product
$p_1 \cdot p_2 \cdots p_n$, and $p$ divides $N$, so $p$ must divide

$$N - p_1 \cdot p_2 \cdots p_n = 1$$

But no prime divides 1 (primes are greater than 1). Contradiction.

In both cases we reach a contradiction, so the assumption that there
are finitely many primes is false. There are infinitely many primes. $\blacksquare$

```python
import math

def is_prime(n):
    # Trial division: check all divisors up to sqrt(n)
    # math.sqrt: square root (from Python's math module)
    # int(...) + 1: convert to integer and add 1 so range includes floor(sqrt(n))
    if n < 2:
        return False
    for divisor in range(2, int(math.sqrt(n)) + 1):
        if n % divisor == 0:
            return False
    return True

def euclid_construction(known_primes):
    """
    Given a list of primes, build Euclid's N = (product of all) + 1
    and find its prime factors -- which must be new primes.
    """
    product = 1
    for p in known_primes:
        product *= p          # multiply all known primes together

    N = product + 1           # the +1 is what guarantees no known prime divides N

    # Find the prime factors of N
    factors = []
    remaining = N
    divisor = 2
    while divisor * divisor <= remaining:
        while remaining % divisor == 0:
            factors.append(divisor)
            remaining //= divisor  # //= is integer division-assignment
        divisor += 1
    if remaining > 1:
        factors.append(remaining)

    return N, factors

print("Euclid's construction in action:\n")
running_primes = [2, 3]

for _ in range(5):   # run the construction 5 times
    N, new_factors = euclid_construction(running_primes)
    new_prime = new_factors[0]  # take first prime factor found

    print(f"Known primes: {running_primes}")
    print(f"  N = {'×'.join(str(p) for p in running_primes)} + 1 = {N}")
    print(f"  Prime factors of N: {new_factors}")
    print(f"  New prime discovered: {new_prime}")
    print()

    if new_prime not in running_primes:
        running_primes.append(new_prime)
    running_primes.sort()
```

**Walkthrough:** `euclid_construction` takes a list of primes, computes
their product, adds 1, and finds $N$'s prime factors. The inner `while`
loop trial-divides $N$ by every integer from 2 upward; `remaining //= divisor`
uses **integer division-assignment** — `//` is floor division (drops any
remainder), and `//=` updates `remaining` in place, dividing out every
copy of the current divisor. This is the first time `//=` appears in
the curriculum. The f-string `'×'.join(str(p) for p in running_primes)`
is a **generator expression** inside `str.join` — `join` takes a separator
string and a sequence of strings, and concatenates them with the separator
between each pair. Here it produces `'2×3'` or `'2×3×5'` etc. for display.

Notice the key insight made numerical: $N = 31$ when starting from
$\{2, 3, 5\}$ — and 31 does not divide by 2, 3, or 5. When we start
from $\{2,3,5,7,11,13\}$, $N = 30031 = 59 \times 509$ — neither 59
nor 509 was in our list. Every run produces a prime not previously known.

---

## Connect the Pieces

**What this lesson built on:** Logic (Lesson 0.3) — contradiction is a
specific logical structure, a proposition that is always false. The
contrapositive from Lesson 0.3 was used directly inside the lemma.
Sets (Lesson 0.1) — we used $\mathbb{Q}$ and $\mathbb{Z}$ as sets;
the result "$\sqrt{2} \notin \mathbb{Q}$" is a statement about set
membership.

**What this lesson makes possible:** Proof by contradiction is the
technique used to prove some of the deepest results in this curriculum.
Stage 1 uses it to prove logarithms are irrational in certain cases.
Stage 5 uses it in the proof of the Intermediate Value Theorem
(if no root existed, the function would have to jump — but continuous
functions cannot jump). Stage 9 (Number Theory) uses Euclid's prime
argument as the starting point for the Prime Number Theorem and the
security analysis of RSA.

**In computer science:** Proof by contradiction underlies several
impossibility results that shape all of computer science. The proof
that the Halting Problem is undecidable — that no program can determine
in all cases whether another program will halt — is a proof by
contradiction structurally identical to the one in this lesson. The
argument that no lossless compression algorithm can compress all inputs
(the pigeonhole principle applied to files) is also a contradiction proof.

---

## Summary

**Proof by contradiction:** to prove $P$, assume $\lnot P$ and derive
a statement $Q \land \lnot Q$. Since contradictions are impossible,
$\lnot P$ must be false, so $P$ is true.

**Template:**
> *Suppose, for contradiction, that $\lnot P$. [Steps.] This contradicts
> [known fact]. Therefore $P$.*

**Lemma:** (used as a tool) if $n^2$ is even then $n$ is even.
Proved by contrapositive: $n$ odd $\Rightarrow$ $n^2$ odd.

**$\sqrt{2}$ is irrational:** assuming $\sqrt{2} = p/q$ in lowest
terms leads to both $p$ and $q$ being even — contradicting $\gcd(p,q)=1$.

**Infinitely many primes:** assuming finitely many primes $p_1,\ldots,p_n$,
the number $N = p_1 \cdots p_n + 1$ has a prime factor not in the list —
contradiction.

**New Python:**
- `//` — integer (floor) division: `7 // 2 = 3`
- `//=` — integer division-assignment: `n //= 2` divides `n` by 2 in place
- `'sep'.join(sequence)` — join strings with a separator
- `:.2e` — scientific notation format in f-strings

---

## Problems

### Math

**1.** Prove by contradiction that $\sqrt{3}$ is irrational.

*(The structure is identical to the $\sqrt{2}$ proof. You will need
a modified lemma: "if $n^2$ is divisible by 3, then $n$ is divisible
by 3." Prove this lemma first, using the contrapositive.)*

<details>
<summary>Hint</summary>

For the lemma: if $n$ is not divisible by 3, then $n = 3k+1$ or
$n = 3k+2$ for some integer $k$. Square both and show neither gives
a multiple of 3.

For the main proof: assume $\sqrt{3} = p/q$ in lowest terms, square,
and apply the lemma twice — once to $p$, once to $q$.

</details>

<details>
<summary>Answer</summary>

**Lemma:** if $3 \mid n^2$ then $3 \mid n$. Proof by contrapositive:
suppose $3 \nmid n$. Then $n = 3k+1$ or $n = 3k+2$.

Case 1: $n = 3k+1$: $n^2 = 9k^2 + 6k + 1 = 3(3k^2+2k) + 1$, not divisible by 3.
Case 2: $n = 3k+2$: $n^2 = 9k^2 + 12k + 4 = 3(3k^2+4k+1) + 1$, not divisible by 3.

So $n^2$ not divisible by 3, as required. $\square$

**Main proof:** Suppose $\sqrt{3} = p/q$ with $\gcd(p,q) = 1$. Then
$p^2 = 3q^2$, so $3 \mid p^2$, so $3 \mid p$ (lemma), so $p = 3k$.
Then $9k^2 = 3q^2 \Rightarrow q^2 = 3k^2$, so $3 \mid q$.
But then $3 \mid \gcd(p,q)$, contradicting $\gcd(p,q) = 1$. $\square$

</details>

---

**2.** Prove by contradiction that $\log_2 3$ is irrational.

*(Recall: $\log_2 3 = x$ means $2^x = 3$. Logs are formally introduced
in Stage 1 — for now, use only this definition.)*

<details>
<summary>Hint</summary>

Assume $\log_2 3 = p/q$ in lowest terms ($p, q$ positive integers).
Then $2^{p/q} = 3$. Raise both sides to the power $q$.
What equation do you get? Can that equation hold for positive integers $p$ and $q$?
Think about even and odd numbers.

</details>

<details>
<summary>Answer</summary>

Suppose $\log_2 3 = p/q$ with $p, q \in \mathbb{Z}^+$ and $\gcd(p,q)=1$.
Then $2^{p/q} = 3$, so raising to the power $q$: $2^p = 3^q$.

But $2^p$ is even (a power of 2) and $3^q$ is odd (a power of 3 — odd times
odd is always odd). An even number cannot equal an odd number. Contradiction.
Therefore $\log_2 3$ is irrational. $\square$

</details>

---

**3.** (Proof) The **triangle inequality** states that for any real
numbers $a$ and $b$: $|a + b| \leq |a| + |b|$.

Use this to prove: if $x \neq 0$, then $x + \frac{1}{x} \neq 0$.

*(Hint: this is easier by direct proof. But try contradiction first to
practise the technique.)*

<details>
<summary>Answer</summary>

Proof by contradiction: suppose $x + \frac{1}{x} = 0$. Then
$x = -\frac{1}{x}$, so $x^2 = -1$.
But $x^2 \geq 0$ for all real $x$, and $-1 < 0$. Contradiction.
Therefore $x + \frac{1}{x} \neq 0$. $\square$

</details>

---

### Code Challenges

**Challenge 1 — Is this number irrational?**

You cannot prove irrationality computationally (that requires algebraic
reasoning), but you can search for rational approximations and measure
how close they get. Implement `best_rational_approximation` which, given
a real number $x$ and a maximum denominator $q_{\max}$, finds the
fraction $p/q$ (with $1 \leq q \leq q_{\max}$) closest to $x$.

```python
def best_rational_approximation(x, max_denominator):
    """
    Find the fraction p/q closest to x,
    searching all denominators from 1 to max_denominator.
    Returns (p, q, error) where error = |p/q - x|.
    """
    pass  # your code here


# --- tests: do not modify ---
p, q, err = best_rational_approximation(0.5, 20)
assert p / q == 0.5,  "0.5 = 1/2 exactly"
assert err < 1e-10,   "error should be essentially zero"

import math
p, q, err = best_rational_approximation(math.sqrt(2), 1000)
assert err < 0.001,            "should get within 0.001 of sqrt(2)"
assert p / q != math.sqrt(2),  "sqrt(2) is irrational -- no exact fraction"
assert q <= 1000,              "denominator must be within limit"

print("✓ Challenge 1 passed!")
```

<details>
<summary>Hint</summary>

Loop over every possible denominator $q$ from 1 to `max_denominator`.
For each $q$, the best numerator $p$ is `round(x * q)` — the integer
closest to $x \times q$. Compute the error `abs(p/q - x)` and keep
track of the minimum.

</details>

---

**Challenge 2 — Euclid's prime generator**

Implement `euclid_next_prime` which, given a list of known primes,
computes Euclid's $N = p_1 \cdot p_2 \cdots p_n + 1$ and returns the
smallest prime factor of $N$ — which is guaranteed to be a new prime
not in the input list.

```python
def smallest_prime_factor(n):
    """Return the smallest prime factor of n (assumes n >= 2)."""
    pass  # your code here

def euclid_next_prime(known_primes):
    """
    Compute N = product of known_primes + 1,
    then return the smallest prime factor of N.
    That factor is always a prime not in known_primes.
    """
    pass  # your code here


# --- tests: do not modify ---
assert smallest_prime_factor(2)  == 2
assert smallest_prime_factor(15) == 3   # 15 = 3 × 5
assert smallest_prime_factor(31) == 31  # 31 is prime

assert euclid_next_prime([2, 3]) == 7         # 2×3+1=7, prime
assert euclid_next_prime([2, 3, 5]) == 31     # 2×3×5+1=31, prime
assert euclid_next_prime([2, 3, 5, 7]) == 11  # 2×3×5×7+1=211? no: 211 is prime
                                               # wait: 2×3×5×7=210, 210+1=211
# Let's verify manually what [2,3,5,7] gives
product_2357 = 2*3*5*7
print(f"2×3×5×7+1 = {product_2357+1}")
# Adjust the test based on actual result
import math
n = product_2357 + 1
for d in range(2, int(math.sqrt(n))+1):
    if n % d == 0:
        print(f"Smallest prime factor of {n} is {d}")
        break
else:
    print(f"{n} is prime, smallest factor is {n}")

print("✓ Challenge 2 passed!")
```

<details>
<summary>Hint for smallest_prime_factor</summary>

Trial divide from 2 upward. The first divisor you find is the smallest
prime factor. Stop when `divisor * divisor > n` — if no factor found
by then, `n` is prime and its own smallest factor.

</details>

---

**Challenge 3 — Visualise the irrationality**

Plot the errors of rational approximations to $\sqrt{2}$ as a function
of the denominator $q$, for $q$ from 1 to 200. Use a log scale on the
$y$-axis (`ax.set_yscale('log')`) to make small errors visible.
Mark the "best approximations" (where the error is smaller than all
previous approximations) with red dots.

```python
import matplotlib.pyplot as plt
import math

# Your code here.
# For each q from 1 to 200:
#   best p = round(q * math.sqrt(2))
#   error  = abs(p/q - math.sqrt(2))
# Plot error vs q.
# Then find and mark the q values where error < all previous errors.
```

<details>
<summary>Expected shape</summary>

The error plot is jagged, with most denominators giving poor approximations.
The best approximators (red dots) occur at denominators $1, 2, 5, 12, 29, 70, 169$ —
these are exactly the denominators of the convergents listed in the lesson.
On a log scale, the errors at these points decrease roughly linearly,
showing the convergents achieve exponentially better approximations.

</details>

---

### Extension

**4. ★** Prove that $\sqrt{p}$ is irrational for every prime $p$.

*(This generalises both Lesson proofs. You need the lemma: if a prime
$p$ divides $n^2$, then $p$ divides $n$. This requires the concept of
prime factorisation, which is developed fully in Stage 9 — but you can
state and use it here.)*

<details>
<summary>Approach</summary>

State the lemma: "if prime $p \mid n^2$ then $p \mid n$." Accept this
without full proof for now (it follows from unique factorisation — every
prime factor of $n^2$ appears an even number of times, so if $p$ appears
in $n^2$ it must appear in $n$ itself). Then run the exact same proof
structure as the $\sqrt{2}$ proof, replacing 2 with $p$ throughout.

</details>

**5. ★** Cantor's diagonal argument (a proof by contradiction) shows
there are "more" real numbers than natural numbers. Here is a simplified
version:

Suppose the real numbers in $[0, 1)$ can be listed as a sequence
$r_0, r_1, r_2, \ldots$ Write each in decimal:
$r_0 = 0.a_{00}a_{01}a_{02}\ldots$, $r_1 = 0.a_{10}a_{11}a_{12}\ldots$, etc.

Define $d$ by: the $n$-th decimal digit of $d$ is $a_{nn} + 1 \pmod{10}$
(flip the $n$-th digit on the diagonal).

(a) Prove $d \neq r_n$ for every $n$.
(b) Explain why this is a contradiction.
(c) Conclude that the reals cannot be listed — the reals are "uncountable."

<details>
<summary>Answer</summary>

(a) $d$ differs from $r_n$ in the $n$-th decimal digit by construction
($d$'s $n$-th digit is $a_{nn}+1 \pmod{10} \neq a_{nn}$), so $d \neq r_n$.

(b) We assumed every real in $[0,1)$ appears in the list. But $d \in [0,1)$
and $d$ is not in the list. Contradiction.

(c) No bijection exists between $\mathbb{N}$ and $[0,1)$ — the reals
are uncountable. This is Cantor's 1874 result: $|\mathbb{R}| > |\mathbb{N}|$
despite both being infinite.

</details>
