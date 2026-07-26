# Stage 5, Lesson 5.20 — The Fundamental Theorem of Calculus
**Threads:** Math · Physics · Engineering
**Estimated time:** 70–80 minutes

---

## What This Lesson Is About

Lesson 13 defined the definite integral as a limit of Riemann
sums — conceptually clear, but computationally painful: `sp.integrate`
gave the exact answer $20/3$ instantly, with no visible summing of
infinitely many rectangles. This lesson explains why that's possible
at all. The **Fundamental Theorem of Calculus** proves that
integration and differentiation — the two halves of calculus this
stage has kept almost entirely separate — are literally **inverse
operations** of each other. This is not a minor technical connection;
it means every differentiation rule from Lessons 5.4–5.7 can be run
**backward** to compute integrals, replacing Lesson 13's infinite
summation process with ordinary algebra. It also finally cashes in
Lesson 9's Consequence 2 (any two functions with the same derivative
differ only by a constant) — the exact fact that makes "the"
antiderivative well-defined enough for this theorem to work at all.
By the end of this lesson you can state and use both parts of the
Fundamental Theorem, build a table of basic antiderivatives by
reversing known differentiation rules, and use integration to recover
Lesson 7's position function from a velocity function — undoing
that lesson's differentiation chain in the opposite direction.

---

## Historical Context

Isaac Barrow, Newton's own teacher at Cambridge, came remarkably
close to this theorem in the 1660s, proving a geometric result
equivalent to it without fully recognizing its significance as a
*general, reusable* connection between two previously separate
problems (tangent-finding and area-finding). It was Newton and
Leibniz, independently, in the 1670s-80s, who recognized this
connection as *the* central fact of calculus — worth the name
"fundamental" precisely because it reduces the hard, infinite process
of integration (Lesson 13's limit of ever-finer sums) to the finite,
algebraic process of finding an antiderivative, exactly as this
lesson demonstrates by finally explaining what `sp.integrate` was
doing all along.

---

## What You Need To Know First

- **Riemann sums, the definite integral** — Lesson 13.
- **MVT's Consequence 2: same derivative implies differ by a
  constant** — Lesson 9, the load-bearing fact this theorem relies
  on directly.
- **Differentiation rules for power, trig, exponential functions** —
  Lessons 5.4–5.7, run backward here.
- **Position/velocity/acceleration/jerk chain** — Lesson 7, undone
  in this lesson's closing application.

---

## The Lesson

### FTC Part 1: The Derivative of an Accumulation Function

Define the **accumulation function**:

$$A(x) = \int_a^x f(t)\,dt$$

— "the running total of area under $f$, from a fixed starting point
$a$ up to a variable endpoint $x$." **FTC Part 1** states:

$$A'(x) = f(x)$$

In words: **differentiating an accumulated area recovers the original
function exactly**. This is the theorem's central surprise —
accumulating (an integral, built from infinitely many infinitesimal
pieces) and instantaneous rate of change (a derivative, also built
from an infinitesimal limit) turn out to be precisely inverse
processes.

**Proof sketch**: by the definition of the derivative (Lesson 3),

$$A'(x) = \lim_{h\to0}\frac{A(x+h)-A(x)}{h} = \lim_{h\to0}\frac{1}{h}\int_x^{x+h}f(t)\,dt$$

(using additivity, Lesson 13, to isolate the extra sliver of area
between $x$ and $x+h$). For small $h$, that thin sliver's area is
approximately $f(x)\cdot h$ (a rectangle of height $f(x)$ and width
$h$ — a direct rectangle approximation, the same idea underlying
every Riemann sum), so:

$$A'(x) \approx \lim_{h\to0}\frac{f(x)\cdot h}{h} = f(x)$$

(A fully rigorous version of this argument uses the Mean Value
Theorem for Integrals, a close cousin of Lesson 9's MVT, to make
"approximately $f(x)\cdot h$" exact rather than approximate — beyond
this lesson's scope to develop in full, but the intuition above is
genuinely representative of the real proof's structure.)

```python
import sympy as sp

x, t = sp.symbols('x t')
f = t**2 + 1

# Build the accumulation function A(x) = integral from 0 to x
A = sp.integrate(f, (t, 0, x))
print(f"A(x) = ∫₀ˣ (t²+1) dt = {A}")

A_prime = sp.diff(A, x)
print(f"A'(x) = {A_prime}")
print(f"Matches f(x) = t²+1 (with t replaced by x): {sp.simplify(A_prime - (x**2+1)) == 0}")
```

Output:

```
A(x) = ∫₀ˣ (t²+1) dt = x**3/3 + x
A'(x) = x**2 + 1
Matches f(x) = t²+1 (with t replaced by x): True
```

Differentiating the accumulated area function recovers the original
integrand **exactly** — direct, computational confirmation of FTC
Part 1.

---

### FTC Part 2: The Evaluation Theorem

If $F$ is **any** antiderivative of $f$ (i.e., $F'(x)=f(x)$), then:

$$\int_a^b f(x)\,dx = F(b) - F(a)$$

**Proof**: FTC Part 1 shows $A(x)=\int_a^xf(t)\,dt$ is *one*
antiderivative of $f$. If $F$ is *any other* antiderivative, then
$F'(x)=f(x)=A'(x)$ — same derivative — so by **Lesson 9's
Consequence 2**, $F(x)=A(x)+C$ for some constant $C$. Then:

$$F(b)-F(a) = [A(b)+C]-[A(a)+C] = A(b)-A(a)$$

The constant $C$ **cancels exactly** — which is precisely why it's
safe to use *any* antiderivative, not specifically the accumulation
function $A$, and why the "+C" that will attach to every indefinite
integral from here on never actually matters for a *definite*
integral's value. Since $A(a)=\int_a^af\,dt=0$ (zero width, zero
area) and $A(b)=\int_a^bf\,dt$ (exactly the integral being sought):

$$F(b)-F(a) = A(b)-A(a) = \int_a^bf(x)\,dx - 0 = \int_a^bf(x)\,dx \qquad\blacksquare$$

**This is the entire reason `sp.integrate` never sums rectangles**:
it finds *any* antiderivative $F$ (using algebraic rules, Lessons
5.4–5.7 run in reverse — the subject of the next section) and simply
computes $F(b)-F(a)$ — arithmetic, not an infinite limiting process.

```python
import sympy as sp

x = sp.symbols('x')
F = x**3/3 + x   # an antiderivative of x²+1 (check: F' = x²+1 ✓)

exact_via_FTC = F.subs(x, 2) - F.subs(x, 0)
print(f"F(2) - F(0) = {exact_via_FTC}")

# Compare directly to Lesson 13's Riemann sum, which needed 1024
# rectangles to get close to this same number
print(f"Lesson 13's midpoint Riemann sum at n=1024 was: 6.66666604")
print(f"FTC gives the EXACT value in one subtraction: {exact_via_FTC} = {float(exact_via_FTC):.8f}")
```

---

### Antiderivatives: Reversing the Differentiation Rules

The **indefinite integral** $\int f(x)\,dx$ denotes "any
antiderivative of $f$, plus an arbitrary constant $C$" — the "+C"
existing precisely because of Lesson 9's Consequence 2 (infinitely
many valid antiderivatives, all differing by a constant). Building a
table by reversing every rule from Lessons 5.4–5.7:

| Derivative rule (Lesson) | Reversed: antiderivative |
|---|---|
| $\frac{d}{dx}x^{n+1}=(n+1)x^n$ (5.4) | $\int x^n\,dx=\dfrac{x^{n+1}}{n+1}+C$ $(n\ne-1)$ |
| $\frac{d}{dx}\sin x=\cos x$ (5.6) | $\int\cos x\,dx=\sin x+C$ |
| $\frac{d}{dx}(-\cos x)=\sin x$ (5.6) | $\int\sin x\,dx=-\cos x+C$ |
| $\frac{d}{dx}e^x=e^x$ (5.6) | $\int e^x\,dx=e^x+C$ |
| $\frac{d}{dx}\ln x=1/x$ (5.6) | $\int\frac1x\,dx=\ln|x|+C$ |
| $\frac{d}{dx}\arctan x=\frac{1}{1+x^2}$ (5.7) | $\int\frac{1}{1+x^2}\,dx=\arctan x+C$ |

```python
import sympy as sp

x = sp.symbols('x')
for f in [x**3, sp.cos(x), sp.sin(x), sp.exp(x), 1/x, 1/(1+x**2)]:
    result = sp.integrate(f, x)
    print(f"∫ {f} dx = {result} + C")
```

**Why integration is genuinely harder than differentiation.**
Differentiation is **mechanical** — every function built from the
rules in Lessons 5.4–5.7 can always be differentiated by systematically
applying those rules (exactly what the tree differentiator from
Lessons 5.4–5.6 does, with no exceptions ever encountered).
Integration has **no such guarantee**: many perfectly ordinary-looking
functions — $e^{-x^2}$, $\frac{\sin x}{x}$, $\sqrt{1-x^3}$ — provably
have **no antiderivative expressible in elementary functions at all**,
a genuinely different situation from anything differentiation faces.
This is the same fundamental obstruction already met concretely in
Lesson 12: Kepler's equation $M=E-e\sin E$ has no closed-form
solution for $E$ for exactly the same *kind* of reason (some
equations, and some integrals, simply don't reduce to elementary
algebra, no matter how skilled the search) — which is precisely why
numerical methods (Riemann sums, Lesson 13; Newton's method, Lesson
5.12) remain essential tools even once exact symbolic methods are
available, not just a fallback for beginners.

```python
import sympy as sp

x = sp.symbols('x')
result = sp.integrate(sp.exp(-x**2), x)
print(f"∫ e^(-x²) dx = {result}")
```

Output:

```
∫ e^(-x²) dx = sqrt(pi)*erf(x)/2
```

`sp.integrate` doesn't fail outright — it reports the answer in terms
of the **error function** `erf`, a function *defined* as this
integral (essentially "giving up on elementary functions and naming
the answer instead") — genuine, honest confirmation that no
elementary closed form exists, exactly as claimed.

---

### Application: Reversing Lesson 7's Motion Chain

Lesson 7 differentiated position → velocity → acceleration → jerk.
FTC makes the **reverse** direction possible: given a velocity
function, **integrate** to recover position (up to an unknown
starting position, the "+C" — resolved using a known initial
condition, exactly the physically necessary piece of information no
amount of pure calculus can supply on its own).

```python
import sympy as sp

t = sp.symbols('t')
v = 3*t**2 - 12*t + 9   # a velocity function (matches Lesson 7's example, differentiated)

# Indefinite integral: position up to an unknown constant
position_indefinite = sp.integrate(v, t)
print(f"Position (up to a constant): s(t) = {position_indefinite} + C")

# With an initial condition s(0) = 5 (known starting position)
C = 5 - position_indefinite.subs(t, 0)
position = position_indefinite + C
print(f"With s(0)=5: s(t) = {position}")

# Definite integral application: total DISPLACEMENT over [0,3]
# (note: displacement, not total distance traveled -- direction matters,
# a genuine distinction worth flagging)
displacement = sp.integrate(v, (t, 0, 3))
print(f"\nDisplacement over [0,3]: {displacement}")

# Verify via FTC Part 2 directly
F = position_indefinite   # any antiderivative works, per this lesson's proof
displacement_via_FTC = F.subs(t,3) - F.subs(t,0)
print(f"Via F(3)-F(0): {displacement_via_FTC}  (matches)")
```

**Walkthrough.** The distinction between **displacement**
($\int v\,dt$, which can have cancelling positive and negative
contributions if the object reverses direction) and **total distance
traveled** ($\int|v|\,dt$, which never cancels) is a genuine,
practically important subtlety flagged explicitly rather than glossed
over — the same "signed area" caution from Lesson 13 applied to a
physical, not just geometric, quantity. Recovering `C` from a known
initial condition (`s(0)=5`) is the standard, necessary final step
whenever an indefinite integral is used to model a real physical
process — calculus supplies the *shape* of the answer; a real
measurement supplies the missing constant.

---

## Connect the Pieces

Concrete trace: recovering a motion's total displacement from its
velocity function.

1. **FTC Part 1**: guarantees an accumulation function (running
   integral of velocity) has derivative exactly equal to velocity —
   the theoretical justification for treating "integrate velocity" as
   meaningful at all.
2. **Lesson 9's Consequence 2, reused**: every antiderivative of
   $v(t)$ differs only by a constant — which is exactly why the "+C"
   in `position_indefinite` is unavoidable and why *any* particular
   antiderivative works equally well in FTC Part 2's subtraction.
3. **FTC Part 2**: turns the definite integral (displacement) into
   simple arithmetic, $F(3)-F(0)$, verified to match `sp.integrate`'s
   direct definite-integral computation.
4. **Physical resolution**: the initial condition $s(0)=5$ supplies
   calculus's missing piece — the specific constant, unknowable from
   the differential relationship alone.

---

## Summary

**FTC Part 1**: $\dfrac{d}{dx}\int_a^xf(t)\,dt=f(x)$ — accumulation
and differentiation are inverse operations.

**FTC Part 2**: $\int_a^bf(x)\,dx=F(b)-F(a)$ for *any* antiderivative
$F$ — the constant cancels, thanks to Lesson 9's Consequence 2.
This is *why* `sp.integrate` never sums rectangles: it finds an
antiderivative algebraically and subtracts.

**Antiderivative table**: every Lesson 4–5.7 differentiation rule,
reversed.

**Integration is genuinely harder than differentiation**: many
functions (like $e^{-x^2}$) have no elementary antiderivative at all
— the same kind of obstruction Kepler's equation faced in Lesson
5.12, making numerical methods permanently necessary, not just a
beginner's fallback.

**Application**: integrating a velocity function recovers position,
up to a constant resolved by a real initial condition — displacement
vs. total distance is a genuine, practically important distinction.

**New Python/CS concepts:**
- `sp.integrate` used definitively (both indefinite and definite), now
  fully explained rather than treated as a black box
- Recognizing "no elementary antiderivative" via a named special
  function (`erf`) in the output, rather than an error

---

## Problems

### Math

**1.** Find $\int(3x^2-4x+5)\,dx$.

<details><summary>Answer</summary>
$x^3-2x^2+5x+C$.
</details>

---

**2.** Evaluate $\int_0^{\pi}\sin x\,dx$ using FTC Part 2.

<details><summary>Answer</summary>
$F(x)=-\cos x$. $F(\pi)-F(0) = -(-1)-(-1) = 1+1=2$.
</details>

---

**3.** A particle has velocity $v(t)=6t-6$. If $s(0)=0$, find its
position function, and determine whether it changes direction on
$[0,2]$.

<details><summary>Answer</summary>
$s(t)=3t^2-6t+C$; $s(0)=0\Rightarrow C=0$: $s(t)=3t^2-6t$.
$v(t)=6t-6=0$ at $t=1$: velocity changes sign there (negative before,
positive after), so yes, the particle reverses direction at $t=1$ —
meaning displacement over $[0,2]$ would **not** equal total distance
traveled.
</details>

---

### Code Challenges

**Challenge 1 — Antiderivative table builder**

```python
import sympy as sp

def antiderivative_table(functions, var):
    """Return a dict {function: antiderivative} for a list of sympy expressions."""
    pass

# --- tests: do not modify ---
x = sp.symbols('x')
table = antiderivative_table([x**2, sp.sin(x), sp.exp(x)], x)
assert sp.simplify(sp.diff(table[x**2], x) - x**2) == 0
assert sp.simplify(sp.diff(table[sp.sin(x)], x) - sp.sin(x)) == 0
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — FTC evaluator vs. Riemann sum**

```python
import sympy as sp

def evaluate_via_FTC(f_expr, var, a, b):
    """Return F(b)-F(a) for any antiderivative F."""
    pass

def riemann_sum_v3(f, a, b, n):
    """Midpoint Riemann sum, reimplemented."""
    pass

# --- tests: do not modify ---
x = sp.symbols('x')
exact = evaluate_via_FTC(x**2+1, x, 0, 2)
approx = riemann_sum_v3(lambda val: val**2+1, 0, 2, 10000)
assert math.isclose(float(exact), approx, abs_tol=0.001)
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Motion recovery with initial condition**

```python
import sympy as sp

def recover_position(velocity_expr, var, initial_time, initial_position):
    """Return the position function s(t), using the given initial condition."""
    pass

# --- tests: do not modify ---
t = sp.symbols('t')
s = recover_position(3*t**2 - 12*t + 9, t, 0, 5)
assert s.subs(t, 0) == 5
assert sp.diff(s, t) == 3*t**2 - 12*t + 9
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Using FTC Part 1 and the chain rule (Lesson 5), find
$\dfrac{d}{dx}\displaystyle\int_a^{x^2}f(t)\,dt$ (note the **upper
limit is $x^2$, not plain $x$** — a genuine wrinkle beyond FTC Part
1's basic statement).

<details><summary>Answer</summary>
Let $u=x^2$, so the expression is $A(u)$ where
$A(u)=\int_a^uf(t)\,dt$. By FTC Part 1, $A'(u)=f(u)$. By the chain
rule (Lesson 5):
$$\frac{d}{dx}A(x^2) = A'(x^2)\cdot\frac{d}{dx}[x^2] = f(x^2)\cdot2x$$
$\blacksquare$ This is a genuinely common pattern — FTC Part 1
combined with the chain rule whenever the integral's limit is itself
a function of $x$ rather than plain $x$ — and demonstrates that FTC
Part 1 isn't an isolated fact but composes naturally with every other
tool from Chapter 5A, exactly the way this entire chapter has been
building one integrated toolkit rather than a list of disconnected
tricks.
</details>
