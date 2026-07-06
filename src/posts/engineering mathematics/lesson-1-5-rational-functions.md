# Stage 1, Lesson 1.5 — Rational Functions and Asymptotes
**Threads:** Math · CS · Physics  
**Estimated time:** 65–80 minutes

---

## What This Lesson Is About

A **rational function** is a ratio of two polynomials. They are the
simplest functions that can blow up — approach infinity — at specific
points, and that can level off toward a fixed value as $x$ grows large.
Both of those behaviours have names: **vertical asymptotes** (where the
function is undefined and grows without bound) and **horizontal asymptotes**
(what the function approaches far from the origin). Rational functions
model real physical relationships constantly: pressure times volume is
constant ($PV = k$, so $P = k/V$), resistance in a circuit ($R = V/I$),
gear ratios, and resonance frequencies. In CS, they appear in algorithm
complexity analysis (the ratio of two polynomial counts), control system
transfer functions, and signal processing filters. By the end of this
lesson you can find the domain, holes, vertical asymptotes, horizontal
asymptotes, and slant asymptotes of any rational function, and plot
them correctly in Python.

---

## Historical Context

Rational functions are as old as algebra itself — any time ancient
mathematicians divided one expression by another, they encountered them.
The systematic study of their asymptotes grew from the work of Descartes
and Newton on curve analysis in the 17th century. The word "asymptote"
comes from the Greek *asymptotos*, meaning "not falling together" — a
line the curve approaches but never meets. The precise definition using
limits was not available until Cauchy formalised limits in the 1820s
(Stage 5). Before that, asymptotes were understood geometrically:
a line the curve gets arbitrarily close to without touching. Both
the intuition and the formal definition are taught here; the formal limit
notation is stated but its full treatment waits for Stage 5.

---

## What You Need To Know First

- **Polynomials, degree, leading coefficient** — Lesson 1.1.
- **Factoring and the Factor Theorem** — Lesson 1.2.
  Factoring both numerator and denominator is the first step in
  every rational function analysis.
- **Polynomial long division** — Lesson 1.3. Used to find slant asymptotes.
- **Functions, domain** — Lesson 0.6. The domain excludes all $x$
  where the denominator is zero.

---

## The Lesson

### What Is a Rational Function?

**Definition:** A **rational function** is a function of the form

$$f(x) = \frac{p(x)}{q(x)}$$

where $p(x)$ and $q(x)$ are polynomials and $q(x) \not\equiv 0$.

The **domain** of $f$ is all real numbers except where $q(x) = 0$:

$$\text{domain}(f) = \{x \in \mathbb{R} : q(x) \neq 0\}$$

**Formal lens:** A rational function is a function $f : D \to \mathbb{R}$
where $D \subsetneq \mathbb{R}$ — its domain is a proper subset of
$\mathbb{R}$, unlike polynomials, which are defined everywhere.

**Physical lens:** $P = k/V$ (ideal gas law, pressure as a function of
volume) is a rational function with domain $V > 0$.
$R = V/I$ (Ohm's law) is rational with domain $I \neq 0$.
Both blow up as the denominator approaches zero — a physically meaningful
singularity (infinite pressure at zero volume; undefined resistance at
zero current).

**Hand-worked example:** Find the domain of each rational function.

(a) $f(x) = \dfrac{x^2 - 1}{x - 1}$ — denominator zero when $x = 1$.
Domain: $\mathbb{R} \setminus \{1\}$, or equivalently $\{x \in \mathbb{R} : x \neq 1\}$.

(b) $g(x) = \dfrac{2x}{x^2 - 4}$ — denominator $x^2-4 = (x-2)(x+2)$,
zero when $x = \pm 2$. Domain: $\mathbb{R} \setminus \{-2, 2\}$.

(c) $h(x) = \dfrac{x^2 + 1}{x^2 + 4}$ — denominator $x^2+4 > 0$ for all
real $x$ (always positive). Domain: all of $\mathbb{R}$.

```python
import numpy as np
import matplotlib.pyplot as plt

def safe_evaluate(f, x_array, excluded, tol=0.05):
    """
    Evaluate f at every point in x_array, inserting np.nan near excluded points.
    
    np.nan ("not a number") tells matplotlib to leave a gap in the plot --
    essential for rational functions, which are undefined at asymptotes.
    Without this, matplotlib connects the two sides of a vertical asymptote
    with a spurious vertical line, making the plot misleading.
    
    f:        function to evaluate
    x_array:  numpy array of x values
    excluded: list of x values where f is undefined
    tol:      gap width around each excluded point
    """
    y = np.zeros_like(x_array, dtype=float)
    for i, xi in enumerate(x_array):
        if any(abs(xi - ex) < tol for ex in excluded):
            y[i] = np.nan   # nan: skip this point entirely in the plot
        else:
            y[i] = f(xi)
    return y

x = np.linspace(-5, 5, 1000)   # 1000 points for smooth curves

fig, axes = plt.subplots(1, 3, figsize=(14, 5))

examples = [
    (lambda x: 1/x,              [0],    r'$f(x)=\frac{1}{x}$',     (-6,6)),
    (lambda x: 2*x/(x**2-4),    [-2,2], r'$g(x)=\frac{2x}{x^2-4}$',(-8,8)),
    (lambda x: (x**2+1)/(x**2+4),[],   r'$h(x)=\frac{x^2+1}{x^2+4}$',(-0.1,1.5)),
]

for ax, (f, excl, title, ylim) in zip(axes, examples):
    y = safe_evaluate(f, x, excl)
    ax.plot(x, y, color='#2980b9', lw=2.5)
    ax.axhline(0, color='#333', lw=0.8)
    ax.axvline(0, color='#333', lw=0.8)
    for ex in excl:
        # dashed red line marks each vertical asymptote
        ax.axvline(ex, color='#e74c3c', lw=1.2, linestyle='--', alpha=0.7,
                   label=f'$x={ex}$ (undefined)')
    ax.set_title(title, fontsize=11)
    ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
    ax.set_ylim(*ylim)
    ax.grid(True, alpha=0.3)
    if excl:
        ax.legend(fontsize=9)

plt.suptitle('Rational functions: domain and first look at asymptotes',
             fontsize=12)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `safe_evaluate` loops through `x_array` and inserts
`np.nan` near excluded points. `np.nan` is a special floating-point
value meaning "not a number" — matplotlib automatically skips `nan`
values, leaving a gap in the curve. Without this, matplotlib would draw
a nearly-vertical line connecting the two branches across the asymptote,
which is mathematically wrong. The `tol=0.05` gap width is chosen to
be visually clean without hiding too much of the curve. `dtype=float` in
`np.zeros_like` ensures the output array can hold `nan` values, which
integer arrays cannot.

---

### Holes vs Vertical Asymptotes

When a factor cancels between numerator and denominator, something subtle
happens — a **hole** rather than an asymptote.

**Definition:** A **hole** (or **removable discontinuity**) occurs at
$x = c$ when $(x-c)$ is a factor of both $p(x)$ and $q(x)$, so it
cancels. The function is still undefined at $x = c$, but the graph
has a single missing point rather than an unbounded singularity.

**Definition:** A **vertical asymptote** at $x = c$ occurs when
$(x-c)$ remains in the denominator after all common factors cancel.
The function grows without bound as $x \to c$.

**The procedure:** always factor and cancel first.

$$f(x) = \frac{p(x)}{q(x)} = \frac{(x-c)^a \cdot r(x)}{(x-c)^b \cdot s(x)}$$

- If $a > b$: the $(x-c)$ factor cancels completely — **hole** at $x=c$.
  The cancelled form is $(x-c)^{a-b} r(x)/s(x)$, defined at $c$.
- If $a = b$: cancels completely — **hole** at $x=c$.
- If $a < b$: $(x-c)^{b-a}$ remains in denominator — **vertical asymptote** at $x=c$.

**Hand-worked example:** Classify $x=1$ for each function.

(a) $f(x) = \dfrac{x^2-1}{x-1} = \dfrac{(x-1)(x+1)}{x-1} = x+1$ for $x \neq 1$.

The factor $(x-1)$ cancels completely. **Hole at $x=1$.**
The hole is at the point $(1, f_{\text{cancelled}}(1)) = (1, 2)$.

(b) $g(x) = \dfrac{x-1}{(x-1)^2} = \dfrac{1}{x-1}$ for $x \neq 1$.

One factor cancels; one remains in denominator. **Vertical asymptote at $x=1$.**

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(-1, 4, 600)

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# --- Left: hole at x=1 ---
y_hole = np.where(np.abs(x - 1) > 0.03,
                  (x**2 - 1)/(x - 1),   # = x+1 for x≠1
                  np.nan)
# np.where(condition, value_if_true, value_if_false):
# element-wise conditional -- here replaces values near x=1 with nan

axes[0].plot(x, y_hole, color='#2980b9', lw=2.5)
# Open circle marks the hole -- white fill, coloured border
axes[0].plot(1, 2, 'o',
             color='white', markersize=11,
             markeredgecolor='#2980b9', markeredgewidth=2.5,
             zorder=5)
axes[0].axhline(0, color='#333', lw=0.8)
axes[0].axvline(0, color='#333', lw=0.8)
axes[0].annotate('Hole at $(1, 2)$\n$(x-1)$ cancels',
                 xy=(1, 2), xytext=(2.2, 2.5),
                 arrowprops=dict(arrowstyle='->', color='#2980b9', lw=1.2),
                 fontsize=10, color='#2980b9')
axes[0].set_title(r'$f(x)=\frac{x^2-1}{x-1}$: hole at $x=1$', fontsize=11)
axes[0].set_xlabel('$x$'); axes[0].set_ylabel('$y$')
axes[0].grid(True, alpha=0.3); axes[0].set_ylim(-1, 6)

# --- Right: vertical asymptote at x=1 ---
y_va = np.where(np.abs(x - 1) > 0.05, 1/(x - 1), np.nan)
axes[1].plot(x, y_va, color='#e74c3c', lw=2.5)
axes[1].axvline(1, color='#e74c3c', lw=1.5, linestyle='--', alpha=0.7,
                label='VA: $x=1$')
axes[1].axhline(0, color='#333', lw=0.8)
axes[1].axvline(0, color='#333', lw=0.8)
axes[1].set_title(r'$g(x)=\frac{1}{x-1}$: VA at $x=1$', fontsize=11)
axes[1].set_xlabel('$x$'); axes[1].set_ylabel('$y$')
axes[1].legend(fontsize=10)
axes[1].grid(True, alpha=0.3); axes[1].set_ylim(-8, 8)

plt.suptitle('Hole (cancelled factor) vs Vertical Asymptote (remaining factor)',
             fontsize=12)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `np.where(condition, a, b)` is a vectorised conditional
— for each element, returns `a` if the condition is true, `b` if false.
Here it inserts `np.nan` wherever `|x - 1| ≤ 0.03`, leaving a gap for
the hole. The open circle is drawn with `color='white'` for the fill and
`markeredgecolor='#2980b9'` for the border — a standard convention for
indicating a missing (excluded) point on a graph.

---

### Horizontal Asymptotes

As $x \to \pm\infty$, a rational function either levels off at a fixed
value, grows without bound, or approaches $\pm\infty$ in different
directions. The behaviour is determined entirely by comparing the
degrees of numerator and denominator.

**Rule:** Let $f(x) = \dfrac{p(x)}{q(x)}$ with $\deg(p) = m$ and
$\deg(q) = n$, leading coefficients $a_m$ and $b_n$.

| Condition | Horizontal asymptote |
|-----------|---------------------|
| $m < n$ | $y = 0$ |
| $m = n$ | $y = \dfrac{a_m}{b_n}$ (ratio of leading coefficients) |
| $m > n$ | None (function grows without bound) |

**Why this is true:** for large $|x|$, the highest-degree terms dominate.
If $m = n$:

$$f(x) = \frac{a_m x^m + \cdots}{b_n x^n + \cdots} = \frac{a_m x^m}{b_n x^m} \cdot \frac{1 + \text{small}}{1 + \text{small}} \approx \frac{a_m}{b_n}$$

The lower-degree terms become negligible compared to the leading terms.

**Hand-worked examples:**

(a) $f(x) = \dfrac{3x^2 - 1}{x^2 + 1}$: degrees equal ($m=n=2$),
leading coefficients 3 and 1. **HA: $y = 3$.**

(b) $g(x) = \dfrac{2x + 1}{x^2 - 3}$: $m=1 < n=2$. **HA: $y = 0$.**

(c) $h(x) = \dfrac{x^3}{x^2 + 1}$: $m=3 > n=2$. **No HA.**
(But there is a slant asymptote — see next section.)

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(-10, 10, 1000)
fig, axes = plt.subplots(1, 3, figsize=(14, 5))

ha_cases = [
    (lambda x: (3*x**2 - 1)/(x**2 + 1),
     r'$\frac{3x^2-1}{x^2+1}$', 3,   'HA: $y=3$ (equal degrees)',   (-1, 5)),
    (lambda x: (2*x + 1)/(x**2 - 3),
     r'$\frac{2x+1}{x^2-3}$',   0,   'HA: $y=0$ (num < den)',       (-2, 2)),
    (lambda x: x**3/(x**2 + 1),
     r'$\frac{x^3}{x^2+1}$',    None,'No HA (num > den)',           (-15,15)),
]

for ax, (f, title, ha_val, subtitle, ylim) in zip(axes, ha_cases):
    excl = [-np.sqrt(3), np.sqrt(3)] if 'x^2-3' in title else []
    y = np.where(
        np.array([any(abs(xi - e) < 0.1 for e in excl) for xi in x]),
        np.nan, [f(xi) for xi in x]
    )
    ax.plot(x, y, color='#2980b9', lw=2.5)
    ax.axhline(0, color='#333', lw=0.8)
    ax.axvline(0, color='#333', lw=0.8)
    if ha_val is not None:
        ax.axhline(ha_val, color='#27ae60', lw=1.5, linestyle='--',
                   label=f'HA: $y={ha_val}$')
        ax.legend(fontsize=10)
    ax.set_title(f'${title}$\n{subtitle}', fontsize=10)
    ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
    ax.set_ylim(*ylim)
    ax.grid(True, alpha=0.3)

plt.suptitle('Horizontal Asymptotes: determined by degree comparison', fontsize=12)
plt.tight_layout()
plt.show()
```

**Walkthrough:** The exclusion logic here uses a list comprehension
inside `np.where` — `np.array([any(abs(xi-e) < 0.1 for e in excl) for xi in x])`
builds a boolean array: `True` where $x$ is near an excluded value,
`False` elsewhere. `np.where(bool_array, nan, values)` then replaces
those positions with `nan`. This is more concise than the `safe_evaluate`
function from earlier — both approaches work; this one is all in one line.

---

### Slant Asymptotes

When $\deg(p) = \deg(q) + 1$ — numerator is exactly one degree higher
than denominator — the function approaches a non-horizontal line as
$x \to \pm\infty$. This is a **slant asymptote** (also called an
**oblique asymptote**).

**Finding it:** divide $p(x)$ by $q(x)$ using polynomial long division.

$$f(x) = \frac{p(x)}{q(x)} = \underbrace{(mx + b)}_{\text{slant asymptote}} + \underbrace{\frac{r(x)}{q(x)}}_{\to 0 \text{ as } x \to \pm\infty}$$

The remainder term $r(x)/q(x) \to 0$ as $x \to \pm\infty$ (because
$\deg(r) < \deg(q)$), so the function approaches the line $y = mx + b$.

**Hand-worked example:** Find the slant asymptote of $f(x) = \dfrac{x^2+1}{x-1}$.

Divide $x^2 + 1$ by $x - 1$:

$$x^2 + 1 = (x-1)(x+1) + 2$$

So $f(x) = x + 1 + \dfrac{2}{x-1}$.

As $x \to \pm\infty$, $\dfrac{2}{x-1} \to 0$, and $f(x) \to x+1$.

**Slant asymptote: $y = x + 1$.**

**Verify at $x = 100$:** $f(100) = \dfrac{10001}{99} \approx 101.02$,
and $y = 100 + 1 = 101$. Close, and getting closer as $x$ grows. ✓

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(-4, 6, 600)

fig, ax = plt.subplots(figsize=(8, 7))

# f(x) = (x^2+1)/(x-1)
y = np.where(np.abs(x - 1) > 0.08, (x**2 + 1)/(x - 1), np.nan)

ax.plot(x, y, color='#2980b9', lw=2.5, label=r'$f(x)=\frac{x^2+1}{x-1}$')
# Slant asymptote y = x+1
ax.plot(x, x + 1, color='#27ae60', lw=1.8, linestyle='--',
        label='Slant asymptote $y=x+1$')
# Vertical asymptote x=1
ax.axvline(1, color='#e74c3c', lw=1.5, linestyle='--', alpha=0.7,
           label='VA: $x=1$')
ax.axhline(0, color='#333', lw=0.8)
ax.axvline(0, color='#333', lw=0.8)

# Annotate the gap between f and the slant asymptote
x_demo = 3.5
f_demo  = (x_demo**2 + 1)/(x_demo - 1)
sa_demo = x_demo + 1
ax.annotate('',
            xy=(x_demo, sa_demo),   # arrowhead at slant asymptote
            xytext=(x_demo, f_demo),# tail at f(x)
            arrowprops=dict(arrowstyle='<->', color='#8e44ad', lw=1.5))
ax.text(x_demo + 0.1, (f_demo + sa_demo)/2,
        f'$\\frac{{2}}{{x-1}}\\approx{2/(x_demo-1):.2f}$',
        fontsize=9, color='#8e44ad')

ax.set_title(r'$f(x)=\frac{x^2+1}{x-1} = (x+1) + \frac{2}{x-1}$'
             '\nSlant asymptote: $y=x+1$', fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
ax.set_ylim(-10, 14)
ax.legend(fontsize=10, loc='upper left')
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `arrowstyle='<->'` draws a double-headed arrow — it
points in both directions, marking the gap between $f(x)$ and the
asymptote at $x = 3.5$. The label shows the remainder term
$\frac{2}{x-1}$ evaluated at that point, making the "this term shrinks
to zero" story numerical and immediate. `{2/(x_demo-1):.2f}` formats
the float to 2 decimal places inside a nested f-string — the double
braces `{{` and `}}` are literal brace characters inside an f-string
(single braces mark substitution; doubled braces are escaped literals).

---

### A Complete Analysis

Putting all the pieces together in order:

**Procedure for analysing $f(x) = p(x)/q(x)$:**

1. **Factor** both $p$ and $q$
2. **Cancel** common factors — each cancellation gives a **hole**
3. **Domain** = $\mathbb{R}$ minus all zeros of $q$ (after cancellation, these are VAs; before cancellation, holes too)
4. **Vertical asymptotes** at remaining zeros of $q$
5. **Horizontal or slant asymptote** from degree comparison / long division
6. **Intercepts:** $y$-intercept at $f(0)$ (if in domain); $x$-intercepts at zeros of $p$ that survived cancellation

**Hand-worked example:** Completely analyse

$$f(x) = \frac{x^2 - x - 2}{x^2 - 4}$$

**Step 1 — Factor:**
$$f(x) = \frac{(x-2)(x+1)}{(x-2)(x+2)}$$

**Step 2 — Cancel:** $(x-2)$ is common. **Hole at $x=2$.**
$$f(x) = \frac{x+1}{x+2}, \quad x \neq 2$$

The hole is at $\left(2,\ \dfrac{2+1}{2+2}\right) = \left(2,\ \dfrac{3}{4}\right)$.

**Step 3 — Domain:** $\mathbb{R} \setminus \{-2, 2\}$.

**Step 4 — Vertical asymptote:** $x = -2$ (zero of the simplified denominator).

**Step 5 — Horizontal asymptote:** $\deg(\text{num}) = \deg(\text{den}) = 1$,
leading coefficients both 1. **HA: $y = 1$.**

**Step 6 — Intercepts:**
- $y$-intercept: $f(0) = \frac{0+1}{0+2} = \frac{1}{2}$. Point: $\left(0, \frac{1}{2}\right)$.
- $x$-intercept: $x+1 = 0 \Rightarrow x = -1$. Point: $(-1, 0)$.

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(-6, 6, 1000)

fig, ax = plt.subplots(figsize=(9, 7))

# Original function (before cancellation)
y = np.where(
    (np.abs(x + 2) < 0.07) | (np.abs(x - 2) < 0.07),
    # | is bitwise OR on boolean arrays -- True where near either excluded point
    np.nan,
    (x**2 - x - 2)/(x**2 - 4)
)

ax.plot(x, y, color='#2980b9', lw=2.5,
        label=r'$f(x)=\frac{x^2-x-2}{x^2-4}$')

# Vertical asymptote
ax.axvline(-2, color='#e74c3c', lw=1.5, linestyle='--', alpha=0.7,
           label='VA: $x=-2$')

# Horizontal asymptote
ax.axhline(1, color='#27ae60', lw=1.5, linestyle='--', alpha=0.7,
           label='HA: $y=1$')

# Hole at (2, 3/4)
ax.plot(2, 3/4, 'o', color='white', markersize=11,
        markeredgecolor='#2980b9', markeredgewidth=2.5, zorder=6,
        label='Hole at $(2,\\ 3/4)$')

# x-intercept and y-intercept
ax.plot(-1, 0, 's', color='#8e44ad', markersize=9, zorder=5,
        label='$x$-intercept $(-1,0)$')
ax.plot(0, 0.5, '^', color='#e67e22', markersize=9, zorder=5,
        label='$y$-intercept $(0, 1/2)$')

ax.axhline(0, color='#333', lw=0.8)
ax.axvline(0, color='#333', lw=0.8)
ax.set_title(r'Complete analysis of $f(x)=\frac{x^2-x-2}{x^2-4}$',
             fontsize=12)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
ax.set_ylim(-6, 6)
ax.legend(fontsize=9, loc='upper right')
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `(np.abs(x + 2) < 0.07) | (np.abs(x - 2) < 0.07)`
combines two boolean arrays with `|` (bitwise OR) — this is the
numpy equivalent of `or` but applied element-by-element across the
whole array. `np.where` then uses the combined boolean array to place
`nan` wherever either excluded point is nearby. The `'s'` marker draws
a square; `'^'` draws an upward triangle — different shapes make the
intercepts visually distinct from the hole marker (`'o'`).

---

## Connect the Pieces

**What this lesson built on:** Polynomials (Lesson 1.1) — the building
blocks. Factoring (Lesson 1.2) — the first step in every analysis.
Polynomial division (Lesson 1.3) — used to find slant asymptotes.
Domain and functions (Lesson 0.6) — the domain of a rational function
excludes the zeros of the denominator.

**What this lesson makes possible:** Stage 4 (Calculus, integration)
uses **partial fractions** — decomposing a rational function into
simpler pieces — which requires the analysis from this lesson.
Stage 5 (Calculus) gives the formal definition of limits that makes
"approaching an asymptote" precise. Control systems (Stage 7) express
transfer functions as rational functions — their poles (vertical
asymptotes) determine system stability.

**In CS and manufacturing:** a digital filter's frequency response is a
rational function of $e^{i\omega}$ — the ratio of output polynomial to
input polynomial in the $z$-transform. The poles of this rational
function determine whether the filter is stable. In manufacturing,
tool life models and cutting force models often involve rational
functions of speed and feed rate.

---

## Summary

**Rational function:** $f(x) = p(x)/q(x)$, domain excludes zeros of $q$.

**Step 1 — Factor and cancel.** Common factors give **holes**.

**Hole at $x=c$:** $(x-c)$ cancels completely. Missing point at
$(c,\ f_{\text{reduced}}(c))$.

**Vertical asymptote at $x=c$:** $(x-c)$ remains in denominator after
cancellation. $f(x) \to \pm\infty$ as $x \to c$.

**Horizontal asymptote** ($m = \deg p$, $n = \deg q$):
- $m < n$: $y = 0$
- $m = n$: $y = a_m / b_n$
- $m > n$: none

**Slant asymptote:** when $m = n+1$, divide $p \div q$; the
quotient (ignoring remainder) is the slant asymptote line.

**Full analysis order:** factor → cancel (holes) → domain →
VAs → HA or slant → intercepts.

**New Python:**
- `np.nan` — "not a number"; matplotlib skips these points
- `np.where(condition, a, b)` — element-wise conditional
- `|` — bitwise OR on boolean numpy arrays (not the same as Python's `or`)
- `markeredgecolor`, `markeredgewidth` — marker border colour and width
- `arrowstyle='<->'` — double-headed arrow in `ax.annotate`
- `{{` and `}}` — literal braces inside an f-string

---

## Problems

### Math

**1.** For each rational function: (i) find all holes, (ii) find all
vertical asymptotes, (iii) find the horizontal or slant asymptote,
(iv) find the $y$-intercept.

(a) $f(x) = \dfrac{x^2 - 4}{x - 2}$

(b) $g(x) = \dfrac{3x^2}{x^2 - 9}$

(c) $h(x) = \dfrac{x^3 - 1}{x^2 - 1}$

(d) $k(x) = \dfrac{x^2 + 2x - 3}{x^2 - x - 2}$

<details>
<summary>Hints</summary>

Factor everything first. For (c): $x^3-1=(x-1)(x^2+x+1)$
and $x^2-1=(x-1)(x+1)$. For (d): both numerator and denominator
factor into two linear terms.

</details>

<details>
<summary>Answers</summary>

(a) Hole at $x=2$ (point $(2, 4)$); no VA; no HA (slant: $y=x+2$);
$y$-int: $f(0) = 4/(-2) = -2$. Wait: $f(x)=(x-2)(x+2)/(x-2)=x+2$ for $x\neq2$.
$y$-int: $f(0)=2$.

(b) No holes; VA at $x=\pm3$; HA: $y=3$ (equal degrees); $y$-int: $g(0)=0$.

(c) Cancel $(x-1)$: hole at $x=1$, point $(1,\ \frac{1+1+1}{1+1})=(1,\frac{3}{2})$.
Simplified: $\frac{x^2+x+1}{x+1}$. VA: $x=-1$. Slant ($\deg$num$=\deg$den$+1$):
divide $x^2+x+1$ by $x+1$: $x + 0 + \frac{1}{x+1}$. Slant: $y=x$.
$y$-int: $h(0)=1/1=1$.

(d) Num: $(x+3)(x-1)$. Den: $(x-2)(x+1)$. No common factors.
VAs: $x=2$, $x=-1$. HA: $y=1$. $y$-int: $k(0)=(-3)/(-2)=3/2$.
$x$-ints: $x=-3$ and $x=1$.

</details>

---

**2.** Explain why $f(x) = \dfrac{x^2+1}{x^2+4}$ has no vertical
asymptotes, no holes, and a horizontal asymptote at $y=1$.
What is its range?

<details>
<summary>Answer</summary>

The denominator $x^2+4 \geq 4 > 0$ for all real $x$ — it never reaches
zero, so there are no VAs or holes. Equal degrees with equal leading
coefficients (both 1) give HA $y=1$.

Range: note $f(x) = 1 - \frac{3}{x^2+4}$. Since $x^2+4 \geq 4$,
we have $\frac{3}{x^2+4} \leq \frac{3}{4}$, so $f(x) \geq 1 - \frac{3}{4} = \frac{1}{4}$.
As $x\to\infty$, $f\to 1$ but never reaches 1 (denominator never equals
numerator for finite $x$ since $x^2+1 < x^2+4$). Range: $[\frac{1}{4}, 1)$.

</details>

---

**3.** (Proof) Prove that if $f(x) = p(x)/q(x)$ with $\deg p < \deg q$,
then $f(x) \to 0$ as $x \to \infty$ in the following sense: for any
$\varepsilon > 0$, there exists $M$ such that $|f(x)| < \varepsilon$
for all $x > M$. *(Hint: use the fact that for large $|x|$, $|p(x)| \leq C|x|^m$
and $|q(x)| \geq c|x|^n$ for some constants $C, c > 0$ and $m < n$.)*

<details>
<summary>Answer</summary>

Let $m = \deg p < n = \deg q$. For large $|x|$, the leading terms
dominate: $|p(x)| \leq 2|a_m||x|^m$ and $|q(x)| \geq \frac{1}{2}|b_n||x|^n$
(formally from limit definitions, omitted here). So:
$$|f(x)| = \frac{|p(x)|}{|q(x)|} \leq \frac{2|a_m||x|^m}{\frac{1}{2}|b_n||x|^n} = \frac{4|a_m|}{|b_n||x|^{n-m}}$$
Since $n-m \geq 1$, taking $M = \left(\frac{4|a_m|}{|b_n|\varepsilon}\right)^{1/(n-m)}$
gives $|f(x)| < \varepsilon$ for all $x > M$. $\blacksquare$

</details>

---

### Code Challenges

**Challenge 1 — Rational function analyser**

```python
import numpy as np

def analyse_rational(p_coeffs, q_coeffs, tol=1e-8):
    """
    Analyse f(x) = p(x)/q(x) and return a dictionary with:
      'holes':    list of x-values where common factors cancel
      'v_asymp':  list of x-values of vertical asymptotes
      'h_asymp':  horizontal asymptote value, or None if none exists
      'x_ints':   list of x-intercepts (zeros of simplified numerator)
      'y_int':    y-intercept value f(0), or None if 0 is excluded
    
    p_coeffs, q_coeffs: polynomial coefficients in descending order
    """
    pass  # your code here


# --- tests: do not modify ---
# f(x) = (x^2-x-2)/(x^2-4) = (x-2)(x+1) / (x-2)(x+2)
r = analyse_rational([1,-1,-2], [1,0,-4])
assert 2.0 in r['holes'],    "hole at x=2"
assert -2.0 in r['v_asymp'],"VA at x=-2"
assert np.isclose(r['h_asymp'], 1.0), "HA at y=1"
assert np.isclose(r['y_int'], 0.5),   "y-int at 1/2"

# g(x) = 1/(x^2+4): no holes, no VA, HA at y=0
r2 = analyse_rational([1], [1, 0, 4])
assert r2['holes']   == [],   "no holes"
assert r2['v_asymp'] == [],   "no VAs"
assert np.isclose(r2['h_asymp'], 0.0), "HA at y=0"

print("✓ Challenge 1 passed!")
```

<details>
<summary>Hint</summary>

Use `np.roots` on both polynomials to find their zeros. Compare the zeros
of $p$ and $q$ with `np.isclose` — any zero that appears in both is a
hole; any remaining zero of $q$ is a VA. For HA: compare degrees.

</details>

---

**Challenge 2 — Plot any rational function**

```python
import matplotlib.pyplot as plt
import numpy as np

def plot_rational(p_coeffs, q_coeffs, x_range=(-8, 8), title=None):
    """
    Plot f(x) = p/q, automatically marking all asymptotes and holes.
    Uses analyse_rational to find features, safe_evaluate to avoid
    connecting across asymptotes and holes.
    """
    pass  # your code here


# No automated test -- verify visually.
# Example 1: (x^2-x-2)/(x^2-4)
plot_rational([1,-1,-2], [1,0,-4],
              title=r'$\frac{x^2-x-2}{x^2-4}$')

# Example 2: (x^2+1)/(x-1)  -- slant asymptote
plot_rational([1,0,1], [1,-1],
              title=r'$\frac{x^2+1}{x-1}$')
```

---

### Extension

**4. ★** A rational function can have at most one horizontal asymptote
but infinitely many vertical asymptotes. Show that:

(a) $f(x) = \dfrac{1}{\sin x}$ (not a rational function — just for
comparison) has infinitely many vertical asymptotes.

(b) Construct a rational function with exactly three vertical asymptotes
and horizontal asymptote $y = 2$.

(c) Prove that a rational function $f(x) = p(x)/q(x)$ (in lowest terms,
i.e., after all common factors are cancelled) has exactly as many vertical
asymptotes as the degree of $q$.

<details>
<summary>Answer to (c)</summary>

After cancellation, $q$ has no common factors with $p$. By the FTA,
$q(x)$ of degree $n$ has exactly $n$ roots in $\mathbb{C}$. Real roots
give VAs (the function is undefined and unbounded there since $p$ is
non-zero there). Over $\mathbb{R}$, $q$ has between 0 and $n$ real roots
(counting multiplicity), each giving exactly one VA. So the number of VAs
equals the number of real roots of $q$ in lowest terms. Not necessarily
exactly $n$ (complex roots of $q$ do not give real VAs), but at most $n$.

</details>

**5. ★ (CS connection)** The **$z$-transform** of a digital signal
processing filter is a rational function in the complex variable $z$.
The poles (vertical asymptotes, where the denominator is zero) determine
stability: a filter is stable if and only if all poles lie strictly inside
the unit circle $|z| < 1$ in the complex plane.

For the rational function $H(z) = \dfrac{z}{z^2 - 0.5z + 0.06}$:

(a) Find the poles (zeros of the denominator).
(b) Compute $|z|$ for each pole.
(c) Is this filter stable?

```python
import numpy as np
denominator = [1, -0.5, 0.06]
poles = np.roots(denominator)
print("Poles:", poles)
print("Magnitudes:", np.abs(poles))
print("Stable:", all(np.abs(poles) < 1))
```
