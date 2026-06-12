# M-013 — The Exponential Function

**Phase 4 · Exponentials, Logarithms, and Trigonometry · Lesson 1 of 3**
**Pillar: Approximation** · *The function that is its own derivative — and why that matters everywhere*

---

## What You Will Build

A Python program that approximates $e$ via the compound interest limit $(1 + 1/n)^n$ and shows convergence across $n = 1$ to $10^7$. You will understand why $e$ is the unique "natural" base for exponentials, and why exponential growth and decay are the most important behaviours in the physical world.

---

## What You Need to Know First

- M-007: exponent laws (extension to all real exponents)
- M-009: inverse functions (we will define the logarithm as $\exp^{-1}$ in M-014)

---

> **Quick Check — try to answer before reading:**
>
> 1. If a bank offers 100% annual interest, you have $\$1$ after one year with simple interest. What if they compound monthly? Daily? Every second?
> 2. Is there a function $f$ such that $f'(x) = f(x)$ (its own derivative)? What would that mean physically?
> 3. Between $2^x$ and $3^x$, which grows faster? Is there a "natural" base between them?
>
> *(Answers at the end of this lesson)*

---

## The Lesson

### The Compound Interest Motivation

Start with $\$1$ and 100% annual interest. With $n$ compounding periods per year, after one year you have:

$$A = \left(1 + \frac{1}{n}\right)^n$$

| $n$ | Compounding | Amount after 1 year |
|---|---|---|
| 1 | annually | $(1 + 1)^1 = 2.000$ |
| 2 | semi-annually | $(1 + 1/2)^2 = 2.250$ |
| 12 | monthly | $(1 + 1/12)^{12} \approx 2.613$ |
| 365 | daily | $(1 + 1/365)^{365} \approx 2.715$ |
| $\infty$ | continuously | $\lim_{n \to \infty} (1 + 1/n)^n = e \approx 2.718$ |

The sequence converges. The limit is defined as $e$:

$$e = \lim_{n \to \infty} \left(1 + \frac{1}{n}\right)^n \approx 2.71828182845\ldots$$

This is not a coincidence or a definition chosen for convenience — it is forced by continuous compounding.

**Math lens:** The definition of $e$ as a limit requires the theory of limits (Phase 5) to make rigorous. Here we use it informally (we know it converges) and prove it formally in Phase 5. This is the first major appearance of the "approximate to any precision" idea — the pillar of Approximation.

---

### The Defining Property: Self-Differentiation

The exponential function $e^x$ is the unique function satisfying:
$$\frac{d}{dx}[e^x] = e^x \qquad \text{and} \qquad e^0 = 1$$

In words: the function equals its own rate of change, and equals 1 at $x = 0$.

We cannot prove this rigorously until Phase 6 (derivatives), but we can understand its meaning:

**Physical interpretation:** A quantity $y$ satisfying $\frac{dy}{dt} = y$ (rate of change equals current amount) grows exponentially. If you have more, you grow faster; if you have less, you grow slower. This describes:
- Bacterial populations (each cell divides at the same rate)
- Radioactive decay (rate of decay proportional to current amount — with a negative sign: $\frac{dy}{dt} = -ky$)
- Continuously compounding interest

**Any base:** The function $f(x) = a^x$ for $a > 0$ satisfies $f'(x) = (\ln a) \cdot a^x$ (proved in Phase 6). For $a = e$: $\ln e = 1$, so $f'(x) = f(x)$. The base $e$ is the unique one where the constant of proportionality is exactly 1.

---

### The Exponential Laws (Revisited from M-007)

$e^{x+y} = e^x \cdot e^y$ — this is exponent Law 1, now for all real exponents.

This means the exponential function converts **addition** (in the exponent) to **multiplication** (in the value). This is why logarithms (the inverse) convert multiplication to addition.

---

```python
import math

print("=== Approximating e via compound interest ===")
print()
print(f"{'n':>12}  {'(1+1/n)^n':>15}  {'Error vs e':>12}")
print("-" * 44)

true_e = math.e
for n in [1, 2, 10, 100, 1000, 10000, 100000, 1000000, 10000000]:
    approx = (1 + 1/n)**n
    error  = abs(approx - true_e)
    print(f"{n:>12,}  {approx:>15.10f}  {error:>12.2e}")

print()
print(f"True e = {true_e:.15f}")
print()
print("The sequence converges to e ≈ 2.71828...")
print("Convergence is slow: after n=10^7 we still have ~1e-7 error.")
print()

# The self-differentiation property, verified numerically
print("=== Self-differentiation: d/dx[e^x] ≈ e^x ===")
print()
print("Using numerical derivative (h=1e-7):")
h = 1e-7
for x in [0.0, 1.0, 2.0, -1.0, 3.5]:
    value    = math.exp(x)
    deriv    = (math.exp(x + h) - math.exp(x)) / h    # numerical derivative
    error    = abs(deriv - value)
    print(f"  x = {x:5.1f}: e^x = {value:.8f},  d/dx[e^x] ≈ {deriv:.8f},  diff = {error:.2e}")

print()
print("The derivative of e^x equals e^x itself — a unique property of this base.")
print()

# Exponential growth vs linear growth
print("=== Exponential growth dominates all polynomial growth ===")
print("Comparing n^100 vs e^n (for large n):")
print()
print(f"{'n':>6}  {'n^100':>20}  {'e^n':>20}  {'e^n/n^100':>12}")
for n in [100, 200, 500, 1000]:
    poly_val = n**100
    exp_val  = math.exp(n)
    ratio    = exp_val / poly_val
    print(f"{n:>6}  {poly_val:.2e}  {exp_val:.2e}  {ratio:.2e}")

print()
print("e^n eventually outgrows any polynomial n^k, no matter how large k is.")
print("This is why exponential time algorithms are infeasible even for n=100.")
```

**Walkthrough:** The first block demonstrates the compound interest convergence. The rate is slow — after $n = 10^7$ compoundings, we still have error $\approx 10^{-7}$. This is because the convergence rate is $O(1/n)$ (shown in Phase 5 when we compute limits rigorously). The second block uses a **numerical derivative** — $f'(x) \approx (f(x+h) - f(x))/h$ for small $h$ — to verify that $e^x$'s derivative equals itself. This technique (finite differences) is the foundation of Phase 6. The third block demonstrates exponential dominance: even $n^{100}$ is eventually crushed by $e^n$.

---

### Other Bases and the General Exponential

For any $a > 0$, $a \neq 1$:

$$a^x = e^{x \ln a}$$

This follows from $a = e^{\ln a}$ (definition of logarithm, Phase 4) and the exponent laws. Every exponential function is a reparametrised version of $e^x$.

The choice of base $e$ is "natural" in the sense that $\frac{d}{dx}[e^x] = e^x$ with no extra constant. For any other base: $\frac{d}{dx}[a^x] = (\ln a) a^x$ — there is a scale factor $\ln a$. When $a = e$, $\ln a = 1$ and the scale factor disappears.

---

## Connect the Pieces

**Backwards:** M-007 introduced exponents for all reals. M-009 set up the notion of inverse functions (logarithm will be defined as the inverse in M-014).

**Forwards:**
- M-014: The logarithm is the inverse of the exponential.
- M-018 (Derivatives): The proof that $(e^x)' = e^x$ using the limit definition of derivative.
- M-025 (Taylor series): $e^x = \sum_{n=0}^\infty x^n/n!$ — the exponential is its own Taylor series.
- M-012 (Complex): Euler's formula $e^{ix} = \cos x + i\sin x$ uses the complex exponential.
- M-036 (Probability): The Poisson distribution PMF is $e^{-\lambda}\lambda^k/k!$.

---

## What Breaks Without This

Without the exponential:
- Population models, radioactive decay, and interest calculations have no clean mathematical description.
- There is no natural logarithm, which means no clean antiderivative of $1/x$ (Phase 7).
- Euler's formula cannot be stated, so complex numbers lack their geometric interpretation.
- Machine learning uses $e^x$ constantly: the softmax function, the sigmoid $1/(1+e^{-x})$, normal distribution — all require it.

---

## Definition of Done

- [ ] You can define $e$ as a limit and explain the compound interest derivation
- [ ] You can state the self-differentiation property and explain its physical meaning
- [ ] You can explain why $e$ is the "natural" base (no constant factor in derivative)
- [ ] You can rewrite any exponential $a^x$ as $e^{x \ln a}$
- [ ] You ran the Python code and can describe what the exponential dominance table shows

**Proof reconstruction (Sunday):** Starting from the compound interest limit, explain what happens as $n \to \infty$. Then: why is any function satisfying $f'(x) = f(x)$ and $f(0) = 1$ forced to be $e^x$? (Hint: uniqueness of solutions to the ODE $y' = y$, $y(0) = 1$.)

---

## Answers to Quick Check

1. Monthly: $(1 + 1/12)^{12} \approx \$2.61$. Daily: $\approx \$2.715$. Every second: $\approx \$2.718$. Continuous limit: $\$e \approx \$2.718$. The sequence converges.
2. Yes — $e^x$. Physically: a quantity that grows at a rate equal to its current size. Bacterial growth, compound interest, heat dissipation.
3. $3^x$ grows faster than $2^x$ for $x > 0$. $e \approx 2.718$ lies between them, and it is the unique base where $\frac{d}{dx}[a^x] = a^x$ (no scaling factor).
