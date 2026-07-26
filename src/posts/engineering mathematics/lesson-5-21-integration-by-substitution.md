# Stage 5, Lesson 5.21 — Integration by Substitution
**Threads:** Math · Physics · Engineering
**Estimated time:** 55–65 minutes

---

## What This Lesson Is About

Lesson 14's antiderivative table reversed the *basic* differentiation
rules — power, sine, exponential — but said nothing about reversing
the **chain rule** (Lesson 5), which is where most real integrals
actually come from. **Substitution** is exactly that reversal: since
the chain rule gives $\dfrac{d}{dx}F(g(x))=F'(g(x))g'(x)$, any
integral that already looks like $\int F'(g(x))g'(x)\,dx$ can be
integrated immediately once you recognize the pattern — by
temporarily renaming $g(x)$ as a single variable $u$, which is
precisely what Leibniz's differential notation ($du=g'(x)\,dx$) makes
almost mechanical to carry out. By the end of this lesson you can
perform u-substitution on indefinite and definite integrals (handling
the limits-of-integration change correctly, a detail commonly
mishandled), recognize the pattern that signals substitution is the
right tool, and apply it to recover a tool's position from a
variable-feed-rate velocity profile — a case where Lesson 14's
simple antiderivative table genuinely isn't enough.

---

## Historical Context

Substitution's effectiveness is, once again, a direct consequence of
Leibniz's differential notation choices (Lesson 3's history): writing
$du=g'(x)\,dx$ and then substituting it into an integral **looks**
like ordinary algebraic cancellation, even though $du$ and $dx$ aren't
literally being divided or multiplied as ordinary numbers — the
notation was deliberately designed to make this kind of manipulation
feel natural and mostly-reliable, and it succeeds well enough that
substitution remains taught essentially unchanged, notation and all,
more than three centuries later.

---

## What You Need To Know First

- **The chain rule** — Lesson 5, reversed directly by this lesson.
- **FTC, antiderivative table** — Lesson 14.
- **Recognizing composed expressions in the tree differentiator's
  `'pow'` branch** — Lesson 5, the exact pattern this lesson learns
  to spot in reverse.

---

## The Lesson

### The Substitution Procedure

Given $\int f(x)\,dx$ where the integrand contains a composed
expression $g(x)$ **and** its derivative $g'(x)$ (up to a constant
factor) as a separate factor:

1. Let $u=g(x)$.
2. Compute $du=g'(x)\,dx$.
3. Rewrite the entire integral in terms of $u$ only (every $x$ and
   $dx$ replaced).
4. Integrate with respect to $u$ (using Lesson 14's table).
5. Substitute $g(x)$ back in for $u$.

**Hand-worked example:** $\displaystyle\int 2x(x^2+1)^5\,dx$.

Let $u=x^2+1$, so $du=2x\,dx$ — and $2x\,dx$ is **exactly** the other
factor already present in the integral. Substitute directly:

$$\int 2x(x^2+1)^5\,dx = \int u^5\,du = \frac{u^6}{6}+C = \frac{(x^2+1)^6}{6}+C$$

```python
import sympy as sp

x = sp.symbols('x')
integrand = 2*x*(x**2+1)**5
result = sp.integrate(integrand, x)
print(f"∫ 2x(x²+1)⁵ dx = {result}")

# Verify by differentiating the result -- should recover the original integrand
check = sp.diff(result, x)
print(f"Derivative of the result: {sp.expand(check)}")
print(f"Matches original integrand: {sp.simplify(check - integrand) == 0}")
```

**Recognizing the pattern.** This is precisely the *reverse* of
Lesson 5's fix to the tree differentiator's `'pow'` branch: that
fix computed $\frac{d}{dx}[\text{base}^n]=n\cdot\text{base}^{n-1}
\cdot\text{base}'$ — a composed power times its inner derivative.
Substitution spots an integral in exactly that shape and undoes it.
**A quick pattern check**: does the integrand contain some expression
$g(x)$ raised to a power (or inside a trig/exp/log function), *and*
does $g'(x)$ (up to a constant multiple) appear as a separate factor
elsewhere in the integrand? If yes, substitution is very likely the
right tool.

```python
def substitution_pattern_check(g_expr, g_prime_candidate, var):
    """
    Check whether g_prime_candidate is a constant multiple of g's
    actual derivative -- the signal that substitution applies cleanly.
    """
    import sympy as sp
    actual_derivative = sp.diff(g_expr, var)
    ratio = sp.simplify(g_prime_candidate / actual_derivative) if actual_derivative != 0 else None
    is_constant = ratio is not None and ratio.is_constant()
    return is_constant, ratio

x = sp.symbols('x')
g = x**2 + 1
candidate = 2*x   # appears as a separate factor in the integral above
matches, ratio = substitution_pattern_check(g, candidate, x)
print(f"Pattern matches: {matches}, ratio (constant multiple): {ratio}")
```

**More hand-worked examples:**

$$\int\cos(3x)\,dx: \quad u=3x,\ du=3\,dx \Rightarrow \int\cos u\,\frac{du}{3} = \frac{\sin u}{3}+C = \frac{\sin(3x)}{3}+C$$

$$\int xe^{x^2}\,dx: \quad u=x^2,\ du=2x\,dx \Rightarrow \int e^u\,\frac{du}{2} = \frac{e^u}{2}+C = \frac{e^{x^2}}{2}+C$$

```python
import sympy as sp

x = sp.symbols('x')
for integrand in [sp.cos(3*x), x*sp.exp(x**2)]:
    print(f"∫ {integrand} dx = {sp.integrate(integrand, x)} + C")
```

---

### Substitution in Definite Integrals: Changing the Limits

For a **definite** integral, substitution requires converting the
**limits of integration** from $x$-values to $u$-values — a step
that's easy to skip accidentally, and doing so incorrectly (evaluating
the final antiderivative at the original $x$-limits instead of
converting, or forgetting to convert at all) is one of the most common
substitution mistakes.

**Hand-worked example:** $\displaystyle\int_0^1 2x(x^2+1)^5\,dx$.

$u=x^2+1$. When $x=0$: $u=1$. When $x=1$: $u=2$. So:

$$\int_0^1 2x(x^2+1)^5\,dx = \int_1^2 u^5\,du = \left[\frac{u^6}{6}\right]_1^2 = \frac{64}{6}-\frac16 = \frac{63}{6}=\frac{21}{2}$$

Note the final evaluation uses the **$u$-limits** ($1$ and $2$)
directly — no need to ever substitute back to $x$ at all, since the
limits were already converted.

```python
import sympy as sp

x, u = sp.symbols('x u')

# Method 1: direct definite integral in x
direct = sp.integrate(2*x*(x**2+1)**5, (x, 0, 1))
print(f"Direct: {direct}")

# Method 2: substitute, convert limits, integrate in u
substituted = sp.integrate(u**5, (u, 1, 2))
print(f"Via substitution (u from 1 to 2): {substituted}")
print(f"Match: {direct == substituted}")
```

---

### Manufacturing Application: Variable Feed Rate Position Recovery

Some CNC machining strategies deliberately **modulate feed rate**
sinusoidally during a cut — a technique used to disrupt regular tool
vibration patterns and avoid chatter (resonant vibration that damages
surface finish and tool life). Suppose a tool's feed rate (velocity)
is:

$$v(t) = t\cos(t^2)$$

Recovering position requires integration — and this integrand is
**exactly** the substitution pattern from this lesson's opening
example, not a plain power-rule reversal Lesson 14's table alone
could handle.

```python
import sympy as sp

t = sp.symbols('t')
v = t * sp.cos(t**2)

position_indefinite = sp.integrate(v, t)
print(f"v(t) = {v}")
print(f"Position (up to constant): s(t) = {position_indefinite} + C")

# Verify by differentiating back (should recover v(t) exactly, via chain rule)
check = sp.diff(position_indefinite, t)
print(f"ds/dt = {check}")
print(f"Matches v(t): {sp.simplify(check - v) == 0}")

# With initial condition s(0) = 0
C = 0 - position_indefinite.subs(t, 0)
s = position_indefinite + C
print(f"\nWith s(0)=0: s(t) = {s}")

# Total distance covered in the first 2 seconds
distance_2s = s.subs(t, 2) - s.subs(t, 0)
print(f"Position at t=2: {float(distance_2s):.4f} units")
```

**Walkthrough.** This section introduces no new syntax — `sp.integrate`
handles the substitution internally, the same way it handled every
prior example. The point is entirely about **recognizing when**
substitution is needed at all: Lesson 14's table alone has no entry
for "$t\cos(t^2)$," but spotting that $t$ (up to the constant factor
$2$) is the derivative of $t^2$ — the exact same $g(x)$/$g'(x)$
pairing pattern checked programmatically earlier in this lesson —
immediately reveals the substitution $u=t^2$ that solves it.

---

## Connect the Pieces

Concrete trace: recovering tool position from a sinusoidally-modulated
feed rate.

1. **Pattern recognition**: $v(t)=t\cos(t^2)$ contains $t^2$ (the
   "inside" function) and $t$ (its derivative, up to a constant
   factor) — the substitution signal.
2. **Substitution**: $u=t^2$, $du=2t\,dt$, reducing the integral to
   $\frac12\int\cos u\,du$ — Lesson 14's basic table now applies
   directly.
3. **Back-substitution and initial condition**: $u\to t^2$, then the
   constant resolved via $s(0)=0$ — exactly Lesson 14's motion-chain
   procedure, now handling a genuinely composed velocity function.
4. **Verification**: differentiating the recovered position exactly
   reproduces the original velocity — the same "check by reversing"
   habit used throughout this stage.

---

## Summary

**Substitution**: reverses the chain rule; $u=g(x)$, $du=g'(x)dx$,
rewrite entirely in terms of $u$, integrate, substitute back.

**Pattern signal**: an integrand containing $g(x)$ (inside a power,
trig, or exponential function) *and* $g'(x)$ (up to a constant) as a
separate factor.

**Definite integrals**: convert the limits of integration to
$u$-values — never substitute back to $x$ if the limits were already
converted.

**Application**: variable feed-rate motion profiles (used to avoid
chatter) often require substitution to integrate — Lesson 14's
basic table alone isn't always enough.

**New Python/CS concepts:**
- Programmatic pattern-matching for the substitution signal
  ($g'(x)$ present as a constant multiple), directly mirroring the
  chain-rule recognition built into Lesson 5's tree differentiator,
  now run in reverse

---

## Problems

### Math

**1.** Evaluate $\int 3x^2(x^3+4)^4\,dx$.

<details><summary>Answer</summary>
$u=x^3+4$, $du=3x^2dx$. $\int u^4\,du=\dfrac{u^5}{5}+C=
\dfrac{(x^3+4)^5}{5}+C$.
</details>

---

**2.** Evaluate $\displaystyle\int_0^{\pi/2}\sin(x)\cos(x)\,dx$ using
substitution with limit conversion.

<details><summary>Answer</summary>
$u=\sin x$, $du=\cos x\,dx$. Limits: $x=0\Rightarrow u=0$;
$x=\pi/2\Rightarrow u=1$. $\int_0^1u\,du=\left[\frac{u^2}{2}
\right]_0^1=\frac12$.
</details>

---

**3.** Explain why $\int x^2(x^2+1)^5\,dx$ (note: $x^2$, not $2x$, as
the outer factor) does **not** yield cleanly to simple substitution
with $u=x^2+1$.

<details><summary>Answer</summary>
$du=2x\,dx$ — but the integral has $x^2\,dx$, not $x\,dx$, and there's
no way to isolate a clean $x\,dx$ (or constant multiple of it) from
$x^2\,dx$ alone; the leftover $x$ can't be expressed purely in terms
of $u$ without introducing a square root, which complicates rather
than simplifies. This integral needs a different technique entirely
(expanding the binomial, or a more advanced substitution) — a genuine
signal that not every integral with a composed expression yields to
plain substitution.
</details>

---

### Code Challenges

**Challenge 1 — Substitution pattern detector**

```python
import sympy as sp

def find_substitution(integrand, var):
    """
    Given an integrand, search its sub-expressions for a candidate
    g(x) such that g'(x) (up to a constant) also appears as a factor.
    Return (g_candidate, constant_ratio) or None if no clean match found.
    """
    pass

# --- tests: do not modify ---
x = sp.symbols('x')
result = find_substitution(2*x*(x**2+1)**5, x)
assert result is not None
g, ratio = result
assert sp.simplify(g - (x**2+1)) == 0 or sp.simplify(g - x**2) == 0
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Definite integral with limit conversion**

```python
import sympy as sp

def substitute_and_evaluate(integrand, var, a, b, u_expr, u_symbol):
    """
    Perform substitution u_symbol = u_expr, convert limits a,b to
    u-values, and evaluate the resulting definite integral in u.
    """
    pass

# --- tests: do not modify ---
x, u = sp.symbols('x u')
result = substitute_and_evaluate(2*x*(x**2+1)**5, x, 0, 1, x**2+1, u)
assert result == sp.Rational(21, 2)
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Variable feed-rate position solver**

```python
import sympy as sp

def solve_position(velocity_expr, var, t0, s0):
    """Reimplement the lesson's motion-recovery procedure."""
    pass

# --- tests: do not modify ---
t = sp.symbols('t')
s = solve_position(t*sp.cos(t**2), t, 0, 0)
assert s.subs(t, 0) == 0
assert sp.simplify(sp.diff(s, t) - t*sp.cos(t**2)) == 0
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Prove the substitution rule itself, in general, directly from
the chain rule — i.e., show that if $F'(u)=f(u)$, then
$\int f(g(x))g'(x)\,dx = F(g(x))+C$, by differentiating the right-hand
side and confirming it reproduces the integrand.

<details><summary>Answer</summary>
Differentiate $F(g(x))+C$ with respect to $x$, using the chain rule
(Lesson 5):
$$\frac{d}{dx}[F(g(x))+C] = F'(g(x))\cdot g'(x) = f(g(x))\cdot g'(x)$$
using $F'=f$ (given). This exactly reproduces the integrand
$f(g(x))g'(x)$ — so $F(g(x))+C$ genuinely is an antiderivative of
$f(g(x))g'(x)$, confirming the substitution rule is valid, not merely
a notational trick that happens to give correct answers. $\blacksquare$
This is exactly the same "differentiate the claimed answer and check
it reproduces the original" verification pattern used throughout this
lesson's code examples — here carried out symbolically, in full
generality, rather than for one specific integrand.
</details>
