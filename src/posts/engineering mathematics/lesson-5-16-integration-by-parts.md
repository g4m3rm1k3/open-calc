# Stage 5, Lesson 5.16 — Integration by Parts
**Threads:** Math · Physics · Engineering
**Estimated time:** 60–70 minutes

---

## What This Lesson Is About

Lesson 5.15 reversed the chain rule. This lesson reverses the
**product rule** (Lesson 5.4) — the tool needed whenever an integrand
is a genuine product of two *different kinds* of functions (a
polynomial times an exponential, a polynomial times a trig function)
that substitution alone can't untangle, because no clean $g(x)$/$g'(x)$
pairing exists. **Integration by parts** turns one hard integral into
a different, hopefully easier one — trading, not eliminating,
difficulty — which is why choosing the right split of the integrand
matters and gets a systematic heuristic (LIATE) in this lesson. By
the end you can apply integration by parts to single and repeated
cases, use the tabular method for efficient repeated application, and
compute a genuine engineering quantity — total impulse from a
damped-force profile — that requires exactly this technique.

---

## Historical Context

Integration by parts is usually credited to Brook Taylor's 1715
work — the same Taylor whose name attaches to the polynomial
approximation Lesson 5.11 introduced in its first, quadratic-order
form. Both results share a common thread: systematically extracting
more information from a function (successive derivatives, for Taylor;
successive antiderivatives of one factor, for integration by parts)
to convert an otherwise intractable problem into a manageable
algebraic one.

---

## What You Need To Know First

- **The product rule** — Lesson 5.4, reversed directly here.
- **FTC, basic antiderivatives** — Lesson 5.14.
- **Substitution, and recognizing when it doesn't apply** — Lesson
  5.15 (the "not every composed-looking integral yields to
  substitution" Problem 3).

---

## The Lesson

### Deriving the Formula

Start from the product rule (Lesson 5.4): $(uv)'=u'v+uv'$. Integrate
both sides with respect to $x$:

$$uv = \int u'v\,dx + \int uv'\,dx$$

Rearrange:

$$\int uv'\,dx = uv - \int u'v\,dx$$

In the more common notation, letting $dv=v'\,dx$ and $du=u'\,dx$:

$$\boxed{\int u\,dv = uv - \int v\,du}$$

**The strategy**: split the integrand into a $u$ (to differentiate)
and a $dv$ (to integrate), such that $\int v\,du$ — the *new*
integral this produces — is genuinely **easier** than the original.
A poor choice of $u$ and $dv$ can make the new integral *harder*, so
the split matters.

---

### Choosing $u$ and $dv$: The LIATE Heuristic

A practical priority order for choosing $u$ (favor functions higher
on this list as $u$, since they tend to *simplify* when
differentiated):

$$\text{L}\text{ogarithmic} > \text{I}\text{nverse trig} > \text{A}\text{lgebraic (polynomial)} > \text{T}\text{rig} > \text{E}\text{xponential}$$

**Hand-worked example:** $\int xe^x\,dx$.

By LIATE, Algebraic ($x$) outranks Exponential ($e^x$): let $u=x$,
$dv=e^x\,dx$. Then $du=dx$, $v=e^x$.

$$\int xe^x\,dx = xe^x - \int e^x\,dx = xe^x - e^x + C$$

```python
import sympy as sp

x = sp.symbols('x')
result = sp.integrate(x*sp.exp(x), x)
print(f"∫ xeˣ dx = {result}")

# Verify by differentiating
check = sp.diff(result, x)
print(f"Derivative check: {sp.simplify(check - x*sp.exp(x)) == 0}")
```

**A second example**, showing a genuinely clever split:
$\int\ln x\,dx$.

There's only one factor — but split it anyway: $u=\ln x$ (Logarithmic,
top of LIATE), $dv=dx$ (treating the "1" as the second factor). Then
$du=\frac1x dx$, $v=x$.

$$\int\ln x\,dx = x\ln x - \int x\cdot\frac1x\,dx = x\ln x - \int1\,dx = x\ln x - x + C$$

```python
import sympy as sp

x = sp.symbols('x')
result = sp.integrate(sp.log(x), x)
print(f"∫ ln(x) dx = {result}")
```

**Repeated integration by parts:** $\int x^2e^x\,dx$.

$u=x^2$, $dv=e^xdx \Rightarrow du=2x\,dx$, $v=e^x$:

$$\int x^2e^x\,dx = x^2e^x - \int2xe^x\,dx$$

The new integral, $\int2xe^x\,dx$, is exactly the previous example
(scaled by 2) — apply integration by parts **again**:

$$= x^2e^x - 2(xe^x-e^x) + C = x^2e^x-2xe^x+2e^x+C$$

```python
import sympy as sp

x = sp.symbols('x')
result = sp.integrate(x**2 * sp.exp(x), x)
print(f"∫ x²eˣ dx = {result}")
```

---

### The Tabular Method for Repeated Integration by Parts

When one factor is a polynomial (so repeated differentiation
eventually reaches zero) and the other is easy to integrate
repeatedly (exponential, sine, cosine), the **tabular method** avoids
re-deriving the formula at each step — build a table of successive
derivatives of one column and successive integrals of the other, then
combine with alternating signs.

```python
import sympy as sp

def tabular_integration_by_parts(poly_expr, other_expr, var, max_terms=10):
    """
    Perform tabular integration by parts: poly_expr is repeatedly
    differentiated (down to 0), other_expr repeatedly integrated,
    combined with alternating signs.
    """
    derivatives = [poly_expr]
    integrals = [other_expr]

    for _ in range(max_terms):
        next_deriv = sp.diff(derivatives[-1], var)
        if next_deriv == 0:
            break
        derivatives.append(next_deriv)

    for _ in range(len(derivatives) - 1):
        integrals.append(sp.integrate(integrals[-1], var))

    result = 0
    sign = 1
    for i in range(len(derivatives) - 1):
        result += sign * derivatives[i] * integrals[i+1]
        sign *= -1

    return sp.simplify(result)

x = sp.symbols('x')
result = tabular_integration_by_parts(x**2, sp.exp(x), x)
print(f"∫ x²eˣ dx (tabular method) = {result}")

# Verify by differentiating
check = sp.simplify(sp.diff(result, x) - x**2*sp.exp(x))
print(f"Verification: {check == 0}")
```

**Walkthrough.** `derivatives` builds the successive-derivative
column, stopping once it reaches exactly `0` (guaranteed for any
polynomial, since each differentiation reduces degree by 1 — a direct
consequence of the power rule, Lesson 5.4). `integrals` builds the
matching successive-antiderivative column for the other factor. The
final loop pairs each derivative-column entry with the **next**
integral-column entry (`integrals[i+1]`, offset by one — matching the
formula's structure, where $u$ pairs with $v$ from one step ahead),
alternating signs — a direct, mechanized version of applying
integration by parts repeatedly without re-deriving the formula each
time, the same "systematize a repeated manual process into an
algorithm" instinct behind every code tool built across this stage.

---

### Definite Integrals

$$\int_a^b u\,dv = \Big[uv\Big]_a^b - \int_a^b v\,du$$

— the boundary term $[uv]_a^b$ is evaluated at the limits directly,
exactly like any other FTC Part 2 evaluation (Lesson 5.14).

```python
import sympy as sp

x = sp.symbols('x')
result = sp.integrate(x*sp.exp(x), (x, 0, 1))
print(f"∫₀¹ xeˣ dx = {result} = {float(result):.6f}")
```

---

### Manufacturing/Physics Application: Total Impulse from a Damped Force

A machine's impact or engagement event (a clutch engaging, a stamping
press striking, a tool first contacting a workpiece) often produces a
force profile that rises quickly then decays — a common model:

$$F(t) = F_0\,t\,e^{-kt}$$

The **total impulse** delivered is $\int_0^\infty F(t)\,dt$ (an
improper integral, formally the subject of Lesson 5.18 — treated here
as a definite integral over a long-enough finite time, which
integration by parts handles regardless).

```python
import sympy as sp

t, F0, k = sp.symbols('t F0 k', positive=True)
F = F0 * t * sp.exp(-k*t)

impulse_indefinite = sp.integrate(F, t)
print(f"F(t) = {F}")
print(f"∫ F(t) dt = {impulse_indefinite} + C")

# Total impulse over a long but finite window [0, T]
T = sp.symbols('T', positive=True)
impulse_finite = sp.integrate(F, (t, 0, T))
print(f"\nImpulse over [0,T]: {sp.simplify(impulse_finite)}")

# Numeric example: F0=500N, k=2/s, over 5 seconds
values = {F0: 500, k: 2, T: 5}
numeric_impulse = impulse_finite.subs(values)
print(f"\nImpulse over 5 seconds (F0=500N, k=2/s): {float(numeric_impulse):.4f} N·s")

# As T -> infinity (the true total impulse, previewing Lesson 5.18)
impulse_infinite = sp.limit(impulse_finite, T, sp.oo)
print(f"Total impulse as T→∞: {impulse_infinite.subs({F0:500, k:2})}")
```

**Walkthrough.** `sp.integrate(F, t)` internally performs exactly the
$u=t$, $dv=e^{-kt}dt$ split this lesson derived by hand for
$\int xe^x\,dx$, adapted for the extra constant $k$ and the negative
exponent. The `sp.limit(impulse_finite, T, sp.oo)` line is a direct,
deliberate forward reference: computing a definite integral's limit
as the upper bound grows without bound is precisely what Lesson 5.18
formalizes as an **improper integral** — shown here as a natural,
almost inevitable extension of ordinary definite integration, not an
unrelated new topic.

---

## Connect the Pieces

Concrete trace: total impulse from a damped force $F(t)=500te^{-2t}$.

1. **LIATE choice**: $u=t$ (Algebraic), $dv=e^{-kt}dt$ (Exponential)
   — Algebraic outranks Exponential, matching this lesson's heuristic
   exactly.
2. **Integration by parts**: produces the boundary term $uv$ plus a
   new, simpler integral $\int v\,du$ — a plain exponential,
   immediately handled by Lesson 5.14's table.
3. **Definite integral**: evaluated over a finite window, matching
   FTC Part 2's evaluation procedure (Lesson 5.14) exactly.
4. **Forward reference**: taking the finite window's upper bound to
   infinity previews Lesson 5.18's improper integrals directly, using
   nothing beyond an ordinary limit (Lesson 5.1) applied to an already-
   computed finite-window formula.

---

## Summary

**Integration by parts**: $\int u\,dv=uv-\int v\,du$ — reverses the
product rule (Lesson 5.4).

**LIATE**: choose $u$ favoring Logarithmic > Inverse trig > Algebraic
> Trig > Exponential, so $\int v\,du$ is genuinely simpler than the
original.

**Repeated application / tabular method**: systematic for
polynomial-times-(exponential or trig) integrands, alternating signs
across successive derivative/integral columns.

**Application**: total impulse from a damped force profile — a
genuine engineering quantity requiring integration by parts, with a
direct, honest preview of Lesson 5.18's improper integrals via a
simple limit as the time window grows.

**New Python/CS concepts:**
- Tabular integration by parts as an explicit, table-building
  algorithm (two parallel lists combined with alternating signs)

---

## Problems

### Math

**1.** Evaluate $\int x\cos x\,dx$.

<details><summary>Answer</summary>
$u=x$, $dv=\cos x\,dx \Rightarrow du=dx$, $v=\sin x$.
$\int x\cos x\,dx = x\sin x-\int\sin x\,dx = x\sin x+\cos x+C$.
</details>

---

**2.** Evaluate $\int_0^1 xe^{-x}\,dx$.

<details><summary>Answer</summary>
$u=x$, $dv=e^{-x}dx \Rightarrow du=dx$, $v=-e^{-x}$.
$[-xe^{-x}]_0^1+\int_0^1e^{-x}dx = -e^{-1}+[-e^{-x}]_0^1 =
-e^{-1}+(-e^{-1}+1) = 1-2e^{-1}\approx0.2642$.
</details>

---

**3.** Explain why LIATE ranks logarithmic functions **above**
polynomials for the choice of $u$, in terms of what happens to each
under repeated differentiation vs. integration.

<details><summary>Answer</summary>
$\ln x$ has no simple antiderivative to reach for directly (it needs
its own integration-by-parts trick, as shown in this lesson), but its
*derivative*, $1/x$, is simple — so it belongs in the $u$ column
(differentiated), never the $dv$ column (which would require
integrating $\ln x$, circular). Polynomials differentiate down to
zero eventually (useful for the $u$ column too) but are also easy to
*integrate* repeatedly — so when a logarithm and a polynomial appear
together, the logarithm is forced into the $u$ role since it can't
comfortably serve as $dv$.
</details>

---

### Code Challenges

**Challenge 1 — Integration by parts, single application**

```python
import sympy as sp

def integrate_by_parts(u_expr, dv_expr, var):
    """
    Given u and dv (as expressions in var, where dv still needs
    "dx" conceptually attached), return uv - integral(v*du).
    """
    pass

# --- tests: do not modify ---
x = sp.symbols('x')
result = integrate_by_parts(x, sp.exp(x), x)
assert sp.simplify(sp.diff(result, x) - x*sp.exp(x)) == 0
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Tabular method, generalized**

```python
import sympy as sp

def tabular_ibp(poly_expr, other_expr, var):
    """Reimplement tabular_integration_by_parts from the lesson."""
    pass

# --- tests: do not modify ---
x = sp.symbols('x')
result = tabular_ibp(x**3, sp.sin(x), x)
check = sp.simplify(sp.diff(result, x) - x**3*sp.sin(x))
assert check == 0
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Impulse calculator**

```python
import sympy as sp

def total_impulse(F0, k, T):
    """
    Compute the definite integral of F0*t*exp(-k*t) from 0 to T,
    as a numeric value.
    """
    pass

# --- tests: do not modify ---
result = total_impulse(500, 2, 5)
assert result > 0
result_inf_approx = total_impulse(500, 2, 100)   # T large enough to approximate infinity
assert math.isclose(result_inf_approx, 500/4, rel_tol=0.01)  # true limit is F0/k^2
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Prove the general **reduction formula** for
$\int x^ne^x\,dx$ in terms of $\int x^{n-1}e^x\,dx$, using integration
by parts once (with $u=x^n$, $dv=e^xdx$) — the formula that
underlies why the tabular method's derivative column always
eventually reaches zero for polynomial integrands.

<details><summary>Answer</summary>
$u=x^n \Rightarrow du=nx^{n-1}dx$. $dv=e^xdx \Rightarrow v=e^x$.
$$\int x^ne^x\,dx = x^ne^x - n\int x^{n-1}e^x\,dx \qquad\blacksquare$$
Applying this formula repeatedly — each time reducing the polynomial's
degree by exactly 1 — eventually reaches $\int x^0e^x\,dx=\int e^x\,dx
=e^x+C$, a base case reached in exactly $n$ steps. This is precisely
what the tabular method computes all at once: each row of the
derivative column is one application of this reduction formula,
pre-computed and combined at the end rather than applied one
integration-by-parts step at a time.
</details>
