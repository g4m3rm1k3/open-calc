# Stage 5, Lesson 5.17 — Partial Fractions and Trigonometric Integrals
**Threads:** Math · Physics · Engineering
**Estimated time:** 60–70 minutes

---

## What This Lesson Is About

Two more integration techniques close out this stage's integration
toolkit. **Partial fraction decomposition** reverses the ordinary
algebra of combining fractions over a common denominator (Lesson
1.5): a complicated rational function gets split into a *sum* of
simple pieces, each individually easy to integrate using Lesson
5.14's basic table — and finding the coefficients of that split is,
genuinely, a linear system, solvable by exactly Lesson 4.6's Gaussian
elimination. **Trigonometric integrals** use the identities from
Lesson 2.5 to rewrite powers of $\sin$ and $\cos$ into forms
Lesson 5.14's table or Lesson 5.15's substitution can already handle.
By the end of this lesson you can decompose a rational function into
partial fractions (finding coefficients via a linear system, the same
machinery from Lesson 4.6), integrate powers and products of
trigonometric functions, and recognize partial fractions as the exact
technique underlying inverse Laplace transforms — a direct, honest
forward reference to control-systems analysis in Stage 7.

---

## What You Need To Know First

- **Rational functions, asymptotes** — Lesson 1.5.
- **Linear systems, Gaussian elimination** — Lesson 4.6, reused
  directly to find decomposition coefficients.
- **Trig identities** — Lesson 2.5.
- **Basic antiderivative table, substitution** — Lessons 5.14, 5.15.

---

## The Lesson

### Partial Fraction Decomposition

Lesson 1.5 combined fractions like $\dfrac{A}{x-2}+\dfrac{B}{x+1}$
into a single rational expression over a common denominator. Partial
fractions **reverses** that process: given
$\dfrac{3x+5}{x^2-x-2}$, factor the denominator
($x^2-x-2=(x-2)(x+1)$) and write:

$$\frac{3x+5}{(x-2)(x+1)} = \frac{A}{x-2} + \frac{B}{x+1}$$

**Finding $A$ and $B$**: multiply both sides by $(x-2)(x+1)$:

$$3x+5 = A(x+1) + B(x-2)$$

This must hold for **every** $x$ — plug in convenient values that
zero out one term at a time. At $x=2$: $11=A(3) \Rightarrow A=11/3$.
At $x=-1$: $2=B(-3) \Rightarrow B=-2/3$.

**Alternatively — the general method, via a linear system**: expand
the right side and match coefficients of each power of $x$:

$$3x+5 = (A+B)x + (A-2B)$$

Matching coefficients: $A+B=3$, $A-2B=5$ — a genuine $2\times2$ linear
system, solvable by exactly Lesson 4.6's Gaussian elimination (or
`np.linalg.solve`, the tool that lesson eventually verified against).
This general method is essential when convenient substitution values
aren't available (e.g., with repeated or irreducible quadratic
factors).

```python
import numpy as np
import sympy as sp

# Method 1: sympy's built-in decomposition
x = sp.symbols('x')
expr = (3*x+5) / (x**2 - x - 2)
decomposed = sp.apart(expr, x)
print(f"Partial fractions: {decomposed}")

# Method 2: solve the coefficient-matching system explicitly, reusing Lesson 4.6
# A + B = 3, A - 2B = 5
M = np.array([[1, 1], [1, -2]], dtype=float)
b = np.array([3, 5], dtype=float)
A_coef, B_coef = np.linalg.solve(M, b)
print(f"\nA = {A_coef}, B = {B_coef}")
print(f"Matches: A/{{x-2}} + B/{{x+1}} with A={A_coef:.4f}, B={B_coef:.4f}")
```

**Integrating the decomposed form** is now direct — each term is
Lesson 5.14's $\int\frac1x\,dx=\ln|x|+C$ table entry, via a trivial
substitution (Lesson 5.15):

$$\int\frac{3x+5}{x^2-x-2}\,dx = \frac{11}{3}\ln|x-2| - \frac23\ln|x+1| + C$$

```python
import sympy as sp

x = sp.symbols('x')
result = sp.integrate((3*x+5)/(x**2-x-2), x)
print(f"∫ (3x+5)/(x²-x-2) dx = {result}")
```

**Repeated linear factors** need an extra term per repetition:

$$\frac{1}{(x-1)^2(x+2)} = \frac{A}{x-1}+\frac{B}{(x-1)^2}+\frac{C}{x+2}$$

**Irreducible quadratic factors** (that don't factor into real linear
pieces) need a linear numerator over the quadratic:

$$\frac{1}{(x^2+1)(x-1)} = \frac{Ax+B}{x^2+1} + \frac{C}{x-1}$$

```python
import sympy as sp

x = sp.symbols('x')
print(sp.apart(1/((x-1)**2*(x+2)), x))
print(sp.apart(1/((x**2+1)*(x-1)), x))
```

---

### Trigonometric Integrals

**Even powers of $\sin$ or $\cos$**: use the half-angle identities
(Lesson 2.5) to reduce the power before integrating.

$$\int\sin^2x\,dx = \int\frac{1-\cos2x}{2}\,dx = \frac{x}{2}-\frac{\sin2x}{4}+C$$

```python
import sympy as sp

x = sp.symbols('x')
result = sp.integrate(sp.sin(x)**2, x)
print(f"∫ sin²x dx = {result}")
```

**Odd powers**: peel off one factor and use the Pythagorean identity
plus substitution (Lesson 5.15).

$$\int\sin^3x\,dx = \int\sin^2x\cdot\sin x\,dx = \int(1-\cos^2x)\sin x\,dx$$

Let $u=\cos x$, $du=-\sin x\,dx$:

$$= -\int(1-u^2)\,du = -u+\frac{u^3}{3}+C = -\cos x+\frac{\cos^3x}{3}+C$$

```python
import sympy as sp

x = sp.symbols('x')
result = sp.integrate(sp.sin(x)**3, x)
print(f"∫ sin³x dx = {result}")

# A product of powers: odd power of one factor peels off for substitution
result2 = sp.integrate(sp.sin(x)**3 * sp.cos(x)**2, x)
print(f"∫ sin³x cos²x dx = {result2}")
```

**Walkthrough.** Both trigonometric integral strategies reuse tools
already fully derived: half-angle identities (Lesson 2.5), the
Pythagorean identity (also Lesson 2.5), and substitution (Lesson
5.15) — no genuinely new integration machinery, only a new,
systematic way of preparing a trig integrand so existing tools apply.
This mirrors partial fractions' own structure: neither technique
introduces a new *kind* of antiderivative, both are preparation
steps that reduce a hard-looking integral to Lesson 5.14's basic
table.

---

### Forward Reference: Partial Fractions and Inverse Laplace Transforms

Partial fraction decomposition is not just an integration exercise —
it is the **standard, essential technique** for a completely different
but closely related problem this curriculum reaches in Stage 7:
finding the **inverse Laplace transform** of a transfer function.
Control systems (including CNC feedback loops, spindle speed
regulators, and servo positioning systems) are routinely analyzed as
rational functions in a variable $s$ (the Laplace domain) — and
converting such a function back into a time-domain response (Lesson
7.6) is done by **decomposing it into partial fractions first**,
then looking up each simple piece's known inverse transform — exactly
the same decomposition procedure demonstrated in this lesson,
applied to a different but structurally identical class of function.

```python
import sympy as sp

s = sp.symbols('s')
# A typical second-order control-system transfer function shape
transfer_function = (s + 3) / ((s+1)*(s+2))
decomposed_tf = sp.apart(transfer_function, s)
print(f"Transfer function: {transfer_function}")
print(f"Partial fractions: {decomposed_tf}")
print(f"\n(Each term, once decomposed, corresponds to a known, simple")
print(f"time-domain response -- exactly Lesson 7.6's inverse Laplace method.)")
```

---

## Connect the Pieces

Concrete trace: integrating $\dfrac{3x+5}{x^2-x-2}$.

1. **Factor the denominator**: $(x-2)(x+1)$ — ordinary algebra,
   Lesson 1.2's factoring.
2. **Set up the linear system**: matching coefficients gives
   $A+B=3$, $A-2B=5$ — literally Lesson 4.6's $A\mathbf x=\mathbf b$
   form, solved by `np.linalg.solve`.
3. **Integrate term by term**: each piece is Lesson 5.14's
   $\int\frac1x\,dx$ table entry, via Lesson 5.15's substitution.
4. **Forward reference**: the identical decomposition procedure,
   applied to an $s$-domain transfer function instead of an
   $x$-domain rational function, is exactly how Stage 7 will convert
   a control system's frequency-domain description back into a
   time-domain response.

---

## Summary

**Partial fractions**: reverses combining fractions; coefficients
found by matching coefficients (a genuine linear system, Lesson 4.6)
or convenient substitution; distinct linear, repeated linear, and
irreducible quadratic factors each need a specific form.

**Trigonometric integrals**: even powers reduced via half-angle
identities; odd powers peeled and substituted via the Pythagorean
identity — both reusing Lesson 2.5 and Lesson 5.15, not introducing
new machinery.

**Forward reference**: partial fractions is the core technique behind
inverse Laplace transforms (Lesson 7.6), used throughout control
systems analysis for exactly the systems (CNC feedback, servo control)
this curriculum's manufacturing focus cares about.

**New Python/CS concepts:**
- `sp.apart` — symbolic partial fraction decomposition
- Reusing `np.linalg.solve` (Lesson 4.6) to find decomposition
  coefficients directly, rather than by convenient-value substitution

---

## Problems

### Math

**1.** Decompose $\dfrac{5x-1}{(x-1)(x+3)}$ into partial fractions.

<details><summary>Answer</summary>
$5x-1=A(x+3)+B(x-1)$. At $x=1$: $4=4A\Rightarrow A=1$. At $x=-3$:
$-16=-4B\Rightarrow B=4$. So $\dfrac{1}{x-1}+\dfrac{4}{x+3}$.
</details>

---

**2.** Evaluate $\int\cos^2x\,dx$ using the half-angle identity.

<details><summary>Answer</summary>
$\cos^2x=\frac{1+\cos2x}{2}$.
$\int\cos^2x\,dx=\frac{x}{2}+\frac{\sin2x}{4}+C$.
</details>

---

**3.** Evaluate $\int\cos^3x\,dx$ (peel off one factor, use
$\cos^2x=1-\sin^2x$, substitute $u=\sin x$).

<details><summary>Answer</summary>
$\int\cos^2x\cos x\,dx = \int(1-\sin^2x)\cos x\,dx$. $u=\sin x$,
$du=\cos x\,dx$: $\int(1-u^2)\,du = u-\frac{u^3}{3}+C =
\sin x - \frac{\sin^3x}{3}+C$.
</details>

---

### Code Challenges

**Challenge 1 — Partial fraction coefficient solver**

```python
import numpy as np
import sympy as sp

def find_partial_fraction_coeffs(numerator_coeffs, roots):
    """
    Given the numerator's polynomial coefficients (highest degree
    first, matching a denominator that factors into distinct linear
    roots) and the denominator's roots, set up and solve the
    coefficient-matching linear system, returning the A, B, C, ...
    coefficients.
    """
    pass

# --- tests: do not modify ---
# (3x+5)/((x-2)(x+1)): numerator 3x+5, roots at 2, -1
coeffs = find_partial_fraction_coeffs([3, 5], [2, -1])
assert math.isclose(coeffs[0], 11/3, abs_tol=1e-6)
assert math.isclose(coeffs[1], -2/3, abs_tol=1e-6)
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Trig integral reducer**

```python
import sympy as sp

def integrate_trig_power(func_name, power, var):
    """
    Integrate sin(var)**power or cos(var)**power using the
    appropriate technique (half-angle for even, substitution for odd).
    func_name is 'sin' or 'cos'.
    """
    pass

# --- tests: do not modify ---
x = sp.symbols('x')
result_even = integrate_trig_power('sin', 2, x)
assert sp.simplify(sp.diff(result_even, x) - sp.sin(x)**2) == 0

result_odd = integrate_trig_power('cos', 3, x)
assert sp.simplify(sp.diff(result_odd, x) - sp.cos(x)**3) == 0
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Transfer function decomposer**

```python
import sympy as sp

def decompose_transfer_function(numerator_expr, denom_roots, var):
    """
    Build a rational function with the given numerator and denominator
    (product of (var - root) for each root), and return its partial
    fraction decomposition.
    """
    pass

# --- tests: do not modify ---
s = sp.symbols('s')
result = decompose_transfer_function(s+3, [-1,-2], s)
recombined = sp.simplify(result - (s+3)/((s+1)*(s+2)))
assert recombined == 0
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Explain, using the linear-system view of partial fraction
decomposition, why a rational function $\dfrac{P(x)}{Q(x)}$ with
$\deg Q=n$ (and $n$ distinct linear factors) always produces
**exactly** $n$ unknown coefficients and **exactly** $n$ equations
when coefficients are matched — i.e., why the resulting system is
always square (Lesson 4.6/4.7's terminology) and therefore generically
has a unique solution.

<details><summary>Answer</summary>
With $n$ distinct linear factors, the decomposition has exactly $n$
unknown coefficients ($A,B,C,\dots$, one per factor). Clearing
denominators produces a polynomial equation
$P(x)=A(\cdots)+B(\cdots)+\cdots$ where the right side, fully
expanded, is a polynomial of degree at most $n-1$ (since $Q$ has
degree $n$ and $P/Q$ is a proper rational function). A degree-$(n-1)$
polynomial has exactly $n$ coefficients (for $x^0$ through $x^{n-1}$),
and matching each one gives exactly $n$ equations — an $n\times n$
system, genuinely square. By Lesson 4.7's determinant/invertibility
theory, a square system generically (for "generic," i.e.
almost every, choice of the distinct roots) has a unique solution —
which is exactly why partial fraction decomposition, for distinct
linear factors, always succeeds with a well-defined, unique answer,
never an ambiguous or contradictory one. $\blacksquare$
</details>
