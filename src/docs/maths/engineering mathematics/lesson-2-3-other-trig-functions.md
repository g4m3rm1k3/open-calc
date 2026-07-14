# Stage 2, Lesson 2.3 — The Other Four Trigonometric Functions
**Threads:** Math · Physics · CS  
**Estimated time:** 55–65 minutes

---

## What This Lesson Is About

Sine and cosine are the foundation, but they are not the full story.
Four other trigonometric functions arise naturally — as ratios, as
reciprocals, as slopes — and each has its own graph, domain, period,
and set of applications. The **tangent** function describes slopes and
rates; it is the ratio of sine to cosine. The **secant** and **cosecant**
are reciprocals of cosine and sine. The **cotangent** is the reciprocal
of tangent. These four functions have vertical asymptotes — they blow up
wherever their denominator is zero — giving them a fundamentally different
shape from the smooth bounded waves of $\sin$ and $\cos$. By the end of
this lesson you can evaluate, graph, and use all six trigonometric
functions, understand their domains and asymptotes, and apply the
Pythagorean identities that connect them.

---

## What You Need To Know First

- **Unit circle and $\sin$, $\cos$** — Lessons 2.1–2.2.
- **Rational functions and asymptotes** — Lesson 1.5. The four new
  functions all have vertical asymptotes where their denominators vanish.
- **The Pythagorean identity** $\cos^2\theta + \sin^2\theta = 1$ —
  Lesson 2.1.

---

## The Lesson

### Definitions

All six trigonometric functions are defined in terms of $\sin$ and $\cos$:

$$\tan\theta = \frac{\sin\theta}{\cos\theta} \qquad \cot\theta = \frac{\cos\theta}{\sin\theta} = \frac{1}{\tan\theta}$$

$$\sec\theta = \frac{1}{\cos\theta} \qquad \csc\theta = \frac{1}{\sin\theta}$$

**Domains** — each function is undefined wherever its denominator is zero:

| Function | Undefined when | Domain |
|----------|---------------|--------|
| $\tan\theta$, $\sec\theta$ | $\cos\theta = 0$ | $\theta \neq \pi/2 + n\pi$ |
| $\cot\theta$, $\csc\theta$ | $\sin\theta = 0$ | $\theta \neq n\pi$ |

**Right-triangle interpretation** (for $0 < \theta < \pi/2$):

$$\tan\theta = \frac{\text{opposite}}{\text{adjacent}} \qquad \cot\theta = \frac{\text{adjacent}}{\text{opposite}}$$

$$\sec\theta = \frac{\text{hypotenuse}}{\text{adjacent}} \qquad \csc\theta = \frac{\text{hypotenuse}}{\text{opposite}}$$

The mnemonic **SOH-CAH-TOA** covers $\sin$, $\cos$, $\tan$. The others
are their reciprocals: CoSECant = 1/Sine, SECant = 1/Cosine,
COTangent = 1/Tangent.

---

### Exact Values

Since $\tan\theta = \sin\theta/\cos\theta$, exact values follow from
the table in Lesson 2.1:

| $\theta$ | $\tan\theta$ | $\cot\theta$ | $\sec\theta$ | $\csc\theta$ |
|----------|-------------|-------------|-------------|-------------|
| $0$ | $0$ | undefined | $1$ | undefined |
| $\pi/6$ | $\dfrac{1}{\sqrt{3}}$ | $\sqrt{3}$ | $\dfrac{2}{\sqrt{3}}$ | $2$ |
| $\pi/4$ | $1$ | $1$ | $\sqrt{2}$ | $\sqrt{2}$ |
| $\pi/3$ | $\sqrt{3}$ | $\dfrac{1}{\sqrt{3}}$ | $2$ | $\dfrac{2}{\sqrt{3}}$ |
| $\pi/2$ | undefined | $0$ | undefined | $1$ |

**Sign by quadrant:** ASTC applies. Additionally:
$\tan$ and $\cot$ are positive in Quadrants I and III
(both $\sin$ and $\cos$ have the same sign there, so the ratio is positive).

```python
import math
import numpy as np

print("Exact values at standard angles:\n")
print(f"{'θ':>8}  {'tan θ':>10}  {'cot θ':>10}  {'sec θ':>10}  {'csc θ':>10}")
print("-" * 56)

angles = [
    (0,          '0'),
    (math.pi/6,  'π/6'),
    (math.pi/4,  'π/4'),
    (math.pi/3,  'π/3'),
    (math.pi/2,  'π/2'),
    (2*math.pi/3,'2π/3'),
    (3*math.pi/4,'3π/4'),
    (math.pi,    'π'),
    (3*math.pi/2,'3π/2'),
]

for theta, label in angles:
    s, c = math.sin(theta), math.cos(theta)

    def fmt(val, denom_zero):
        if denom_zero:
            return '  undef'
        return f'{val:>10.4f}'

    tan_val = fmt(s/c, abs(c) < 1e-10)
    cot_val = fmt(c/s, abs(s) < 1e-10)
    sec_val = fmt(1/c, abs(c) < 1e-10)
    csc_val = fmt(1/s, abs(s) < 1e-10)

    print(f"{label:>8}  {tan_val}  {cot_val}  {sec_val}  {csc_val}")
```

**Walkthrough:** `abs(c) < 1e-10` tests whether $\cos\theta$ is
essentially zero — floating-point arithmetic means $\cos(\pi/2)$ is
not exactly 0 but $\approx 6 \times 10^{-17}$. Using an absolute
tolerance `1e-10` catches this without mistakenly flagging small but
genuine nonzero cosine values.

---

### The Tangent Function

$\tan\theta = \sin\theta/\cos\theta$ has distinctive properties:

- **Period: $\pi$** (not $2\pi$) — $\tan(\theta+\pi) = \tan\theta$
- **Vertical asymptotes** at $\theta = \pi/2 + n\pi$ (where $\cos=0$)
- **Zeros** at $\theta = n\pi$ (where $\sin=0$)
- **Range: $\mathbb{R}$** — it takes every real value
- **Odd function:** $\tan(-\theta) = -\tan\theta$
- **Increasing** on each interval between asymptotes

**Why period $\pi$?** Both $\sin$ and $\cos$ change sign after half a
period ($\pi$), so their ratio $\tan = \sin/\cos$ is unchanged:
$\tan(\theta + \pi) = \frac{\sin(\theta+\pi)}{\cos(\theta+\pi)} = \frac{-\sin\theta}{-\cos\theta} = \tan\theta$.

**Physical meaning:** $\tan\theta$ is the slope of the line at angle
$\theta$ to the horizontal. A line tilted at $45°$ has slope $\tan(45°) = 1$.
A line tilted at $89.9°$ has slope $\tan(89.9°) \approx 573$ — nearly vertical.
At exactly $90°$, the line is vertical and has no finite slope: $\tan(90°)$ undefined.

```python
import numpy as np
import matplotlib.pyplot as plt
import math

fig, ax = plt.subplots(figsize=(12, 6))

x = np.linspace(-2*np.pi, 2*np.pi, 2000)

# Build tan(x) safely: replace values near asymptotes with nan
cos_x = np.cos(x)
tan_x = np.where(np.abs(cos_x) > 0.05,   # gap of 0.05 around each asymptote
                 np.sin(x) / cos_x,
                 np.nan)
# np.where(condition, value_if_true, value_if_false): unchanged from Lesson 1.5
# here used element-wise: if |cos(x)| > 0.05, compute tan; else nan (leaves a gap)

ax.plot(x, tan_x, color='#2980b9', lw=2.5, label='$y = \\tan x$')

# Vertical asymptotes
for n in range(-2, 3):
    va = (n + 0.5) * math.pi
    ax.axvline(va, color='#e74c3c', lw=1, linestyle='--', alpha=0.6)

ax.axhline(0, color='#333', lw=0.8)
ax.axvline(0, color='#333', lw=0.8)

# Mark zeros
zeros = [n*math.pi for n in range(-2, 3)]
ax.scatter(zeros, [0]*len(zeros), color='#27ae60', s=70, zorder=5)

# X-axis labels in terms of π
xticks = [(n/2)*math.pi for n in range(-4, 5)]
xlabels = [f'$\\frac{{{n}\\pi}}{{2}}$' if n % 2 != 0
           else (f'${n//2}\\pi$' if n//2 != 0 else '$0$')
           for n in range(-4, 5)]
ax.set_xticks(xticks)
ax.set_xticklabels(xlabels, fontsize=9)

ax.set_ylim(-5, 5)
ax.set_title('$y = \\tan x$: period $\\pi$, VA at $\\pi/2+n\\pi$, range $\\mathbb{R}$',
             fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('$\\tan x$')
ax.legend(fontsize=11)
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `np.where(np.abs(cos_x) > 0.05, np.sin(x)/cos_x, np.nan)`
is the same asymptote-handling technique from Lesson 1.5, applied to
$\tan x = \sin x / \cos x$. Wherever $|\cos x|$ is small (within 0.05
of zero), we insert `nan` rather than computing a very large value —
this prevents matplotlib from drawing a spurious near-vertical line
across each asymptote.

---

### Secant and Cosecant

$\sec\theta = 1/\cos\theta$ and $\csc\theta = 1/\sin\theta$ have a
distinctive relationship to their parent functions:

- When $\cos\theta$ is at its maximum $(+1)$, $\sec\theta$ is at its
  minimum $(+1)$
- When $\cos\theta$ is close to zero, $\sec\theta$ blows up
- The graph of $\sec$ consists of U-shaped branches between the
  asymptotes, with each branch touching the cosine curve at its
  extrema ($\pm 1$)

```python
import numpy as np
import matplotlib.pyplot as plt
import math

x = np.linspace(-2*np.pi, 2*np.pi, 2000)
cos_x = np.cos(x)
sin_x = np.sin(x)

sec_x = np.where(np.abs(cos_x) > 0.04, 1/cos_x, np.nan)
csc_x = np.where(np.abs(sin_x) > 0.04, 1/sin_x, np.nan)

fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# --- Left: sec x with cos x ---
axes[0].plot(x, cos_x, color='#aaaaaa', lw=1.5, linestyle='--',
             label='$y=\\cos x$ (dashed)')
axes[0].plot(x, sec_x, color='#2980b9', lw=2.5,
             label='$y=\\sec x$')

for n in range(-2, 3):    # vertical asymptotes of sec at π/2 + nπ
    va = (n+0.5)*math.pi
    axes[0].axvline(va, color='#e74c3c', lw=0.8, linestyle='--', alpha=0.5)

axes[0].axhline(0, color='#333', lw=0.8)
axes[0].set_ylim(-4, 4)
axes[0].set_title('$y=\\sec x = 1/\\cos x$\nU-branches touch $\\cos x$ at $\\pm1$',
                  fontsize=10)
axes[0].set_xlabel('$x$'); axes[0].set_ylabel('$y$')
axes[0].legend(fontsize=9); axes[0].grid(True, alpha=0.3)

# --- Right: csc x with sin x ---
axes[1].plot(x, sin_x, color='#aaaaaa', lw=1.5, linestyle='--',
             label='$y=\\sin x$ (dashed)')
axes[1].plot(x, csc_x, color='#e74c3c', lw=2.5,
             label='$y=\\csc x$')

for n in range(-2, 3):    # vertical asymptotes of csc at nπ
    va = n*math.pi
    axes[1].axvline(va, color='#8e44ad', lw=0.8, linestyle='--', alpha=0.5)

axes[1].axhline(0, color='#333', lw=0.8)
axes[1].set_ylim(-4, 4)
axes[1].set_title('$y=\\csc x = 1/\\sin x$\nU-branches touch $\\sin x$ at $\\pm1$',
                  fontsize=10)
axes[1].set_xlabel('$x$'); axes[1].set_ylabel('$y$')
axes[1].legend(fontsize=9); axes[1].grid(True, alpha=0.3)

plt.suptitle('Secant and Cosecant: reciprocals of cosine and sine', fontsize=12)
plt.tight_layout()
plt.show()
```

**Walkthrough:** Plotting the parent function ($\cos$ or $\sin$) as a
dashed background line makes the relationship between a function and its
reciprocal immediately visible: the U-shaped branches of $\sec$ and $\csc$
"hug" their parent functions at the points $y = \pm 1$, where $1/y = y$.
This is the geometric fact that a function and its reciprocal are equal
when the function equals $\pm 1$.

---

### The Pythagorean Identities

The identity $\cos^2\theta + \sin^2\theta = 1$ (Lesson 2.1) generates
two more by dividing through by $\cos^2\theta$ or $\sin^2\theta$:

**Divide by $\cos^2\theta$:**

$$\frac{\cos^2\theta}{\cos^2\theta} + \frac{\sin^2\theta}{\cos^2\theta} = \frac{1}{\cos^2\theta}$$

$$\boxed{1 + \tan^2\theta = \sec^2\theta}$$

**Divide by $\sin^2\theta$:**

$$\frac{\cos^2\theta}{\sin^2\theta} + \frac{\sin^2\theta}{\sin^2\theta} = \frac{1}{\sin^2\theta}$$

$$\boxed{\cot^2\theta + 1 = \csc^2\theta}$$

All three Pythagorean identities:

$$\sin^2\theta + \cos^2\theta = 1$$
$$1 + \tan^2\theta = \sec^2\theta$$
$$\cot^2\theta + 1 = \csc^2\theta$$

These are the most frequently used trigonometric identities. They are
not separate facts to memorise — they are all the same identity
$x^2+y^2=1$ on the unit circle, divided by different things.

```python
import math
import numpy as np

print("Verifying all three Pythagorean identities:\n")

test_angles = np.linspace(0.1, 2*math.pi - 0.1, 50)
# Avoid exact 0, pi/2, pi, 3pi/2 where some functions are undefined

identity1 = all(math.isclose(math.sin(t)**2 + math.cos(t)**2, 1, abs_tol=1e-10)
                for t in test_angles)

identity2 = all(math.isclose(1 + math.tan(t)**2, (1/math.cos(t))**2, abs_tol=1e-6)
                for t in test_angles
                if abs(math.cos(t)) > 0.01)   # skip near-asymptotes

identity3 = all(math.isclose((math.cos(t)/math.sin(t))**2 + 1, (1/math.sin(t))**2, abs_tol=1e-6)
                for t in test_angles
                if abs(math.sin(t)) > 0.01)   # skip near-asymptotes

print(f"  sin²θ + cos²θ = 1:      {identity1}")
print(f"  1 + tan²θ = sec²θ:      {identity2}")
print(f"  cot²θ + 1 = csc²θ:      {identity3}")

print()
# Using identities: given tan θ = 3/4 in Quadrant I, find all others
print("Example: given tan θ = 3/4 (Q1), find all six trig values\n")
tan_val = 3/4
# 1 + tan^2 = sec^2  =>  sec^2 = 1 + 9/16 = 25/16  =>  sec = 5/4 (Q1, positive)
sec_val = math.sqrt(1 + tan_val**2)
cos_val = 1/sec_val
sin_val = tan_val * cos_val
csc_val = 1/sin_val
cot_val = 1/tan_val

print(f"  sin θ = {sin_val:.4f} = 3/5")
print(f"  cos θ = {cos_val:.4f} = 4/5")
print(f"  tan θ = {tan_val:.4f} = 3/4")
print(f"  csc θ = {csc_val:.4f} = 5/3")
print(f"  sec θ = {sec_val:.4f} = 5/4")
print(f"  cot θ = {cot_val:.4f} = 4/3")
print(f"\n  Verify: sin²+cos²={(sin_val**2+cos_val**2):.8f}")
```

**Walkthrough:** `all(condition for t in angles if filter)` is a
**generator expression** with a filter — `all` returns `True` only if
every value the generator produces is truthy. The `if abs(math.cos(t)) > 0.01`
clause skips angles near asymptotes where floating-point division by
a near-zero value would give a wildly inaccurate result.

The "given tan θ, find all six" technique: use a Pythagorean identity
to find $\sec\theta$, then invert to get $\cos\theta$, multiply to get
$\sin\theta$, invert to get $\csc\theta$, invert to get $\cot\theta$.
The sign of each function is determined by the quadrant.

---

### All Six Together

```python
import numpy as np
import matplotlib.pyplot as plt
import math

x = np.linspace(0.01, 2*math.pi - 0.01, 2000)
cos_x = np.cos(x); sin_x = np.sin(x)

functions = {
    '$\\sin x$':  (np.sin(x), '#2980b9', '-'),
    '$\\cos x$':  (np.cos(x), '#e74c3c', '-'),
    '$\\tan x$':  (np.where(np.abs(cos_x) > 0.05, sin_x/cos_x, np.nan), '#27ae60', '-'),
    '$\\cot x$':  (np.where(np.abs(sin_x) > 0.05, cos_x/sin_x, np.nan), '#8e44ad', '--'),
    '$\\sec x$':  (np.where(np.abs(cos_x) > 0.05, 1/cos_x, np.nan), '#e67e22', '--'),
    '$\\csc x$':  (np.where(np.abs(sin_x) > 0.05, 1/sin_x, np.nan), '#c0392b', '--'),
}

fig, ax = plt.subplots(figsize=(13, 7))

for label, (y, color, style) in functions.items():
    ax.plot(x, y, color=color, lw=2, linestyle=style, label=label)

ax.axhline(0, color='#333', lw=0.8)
ax.axvline(0, color='#333', lw=0.8)
ax.set_ylim(-3.5, 3.5)

# π labels on x-axis
xticks = [k*math.pi/2 for k in range(5)]
xlabels = ['$0$', '$\\pi/2$', '$\\pi$', '$3\\pi/2$', '$2\\pi$']
ax.set_xticks(xticks)
ax.set_xticklabels(xlabels, fontsize=10)

ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
ax.set_title('All six trigonometric functions on $[0, 2\\pi]$',
             fontsize=12)
ax.legend(fontsize=10, ncol=3, loc='upper right')
# ncol=3: arrange legend items in 3 columns -- reduces legend height
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `ncol=3` in `ax.legend()` arranges the six legend
entries in a $3 \times 2$ grid instead of a single column — first
appearance of this argument. Solid lines for the "base" functions
($\sin$, $\cos$, $\tan$) and dashed for the reciprocal functions
($\cot$, $\sec$, $\csc$) creates a visual grouping that reflects
the mathematical grouping.

---

## Connect the Pieces

**What this lesson built on:** $\sin$ and $\cos$ (Lessons 2.1–2.2);
rational functions and asymptotes (Lesson 1.5) — $\tan = \sin/\cos$
has exactly the same asymptote structure as a rational function;
the Pythagorean identity (Lesson 2.1).

**What this lesson makes possible:** Lesson 2.4 (inverse trig functions)
— $\arctan$ is the most practically important inverse. Lesson 2.5
(trig identities) — the Pythagorean identities are used in virtually
every proof. Stage 4 (Linear Algebra) — rotation matrices are built
entirely from $\sin$ and $\cos$. Stage 5 (Calculus) — the derivatives
$\frac{d}{dx}\tan x = \sec^2 x$ and $\frac{d}{dx}\sec x = \sec x\tan x$
follow from the Pythagorean identity and the chain rule.

**In CS:** `math.atan2(y, x)` computes the angle whose tangent is
$y/x$ — essential for converting Cartesian coordinates to polar, used
in every 2D graphics system, game engine, and robotics controller.

---

## Summary

**Definitions:**
$$\tan\theta = \frac{\sin\theta}{\cos\theta} \quad \cot\theta = \frac{\cos\theta}{\sin\theta} \quad \sec\theta = \frac{1}{\cos\theta} \quad \csc\theta = \frac{1}{\sin\theta}$$

**Tangent:** period $\pi$, VA at $\pi/2+n\pi$, range $\mathbb{R}$, odd.

**Secant:** period $2\pi$, VA at $\pi/2+n\pi$, range $(-\infty,-1]\cup[1,\infty)$.

**Cosecant:** period $2\pi$, VA at $n\pi$, range $(-\infty,-1]\cup[1,\infty)$.

**Cotangent:** period $\pi$, VA at $n\pi$, range $\mathbb{R}$, odd.

**Pythagorean identities:**
$$\sin^2\theta+\cos^2\theta=1 \qquad 1+\tan^2\theta=\sec^2\theta \qquad \cot^2\theta+1=\csc^2\theta$$

**New Python:**
- `ncol=n` in `ax.legend()` — multi-column legend
- All six functions computed from `np.sin` and `np.cos` via division

---

## Problems

### Math

**1.** Find all six trig values given the information. Use Pythagorean identities.

(a) $\sin\theta = 5/13$, Quadrant I

(b) $\tan\theta = -2$, Quadrant II

(c) $\sec\theta = -5/3$, Quadrant III

<details>
<summary>Answers</summary>

(a) $\sin=5/13$, $\cos=12/13$, $\tan=5/12$, $\csc=13/5$, $\sec=13/12$, $\cot=12/5$.

(b) $\sec^2=1+4=5$, so $\cos=-1/\sqrt{5}$ (QII, cos negative), $\sin=2/\sqrt{5}$ (QII, sin positive).
$\csc=\sqrt{5}/2$, $\sec=-\sqrt{5}$, $\cot=-1/2$.

(c) $\cos=-3/5$ (from $\sec=-5/3$). $\sin^2=1-9/25=16/25$, $\sin=-4/5$ (QIII, negative).
$\tan=4/3$, $\cot=3/4$, $\csc=-5/4$.

</details>

---

**2.** Prove each identity.

(a) $\dfrac{\sin\theta}{1+\cos\theta} + \dfrac{1+\cos\theta}{\sin\theta} = 2\csc\theta$

(b) $\sec^2\theta - \tan^2\theta = 1$

(c) $\tan\theta + \cot\theta = \sec\theta\csc\theta$

<details>
<summary>Answers</summary>

(a) Common denominator: $\frac{\sin^2\theta + (1+\cos\theta)^2}{\sin\theta(1+\cos\theta)}
= \frac{\sin^2\theta+1+2\cos\theta+\cos^2\theta}{\sin\theta(1+\cos\theta)}
= \frac{2+2\cos\theta}{\sin\theta(1+\cos\theta)} = \frac{2}{\sin\theta} = 2\csc\theta$. ✓

(b) $\sec^2\theta - \tan^2\theta = \frac{1}{\cos^2\theta} - \frac{\sin^2\theta}{\cos^2\theta}
= \frac{1-\sin^2\theta}{\cos^2\theta} = \frac{\cos^2\theta}{\cos^2\theta} = 1$. ✓

(c) $\tan\theta+\cot\theta = \frac{\sin\theta}{\cos\theta}+\frac{\cos\theta}{\sin\theta}
= \frac{\sin^2\theta+\cos^2\theta}{\sin\theta\cos\theta} = \frac{1}{\sin\theta\cos\theta} = \csc\theta\sec\theta$. ✓

</details>

---

### Code Challenges

**Challenge 1 — All six trig functions**

```python
import math

def all_six(theta_rad):
    """
    Compute all six trig functions at theta_rad.
    Returns dict with keys: sin, cos, tan, cot, sec, csc.
    For undefined values (division by zero), use float('inf').
    """
    pass  # your code here


# --- tests: do not modify ---
vals = all_six(math.pi/4)
assert math.isclose(vals['sin'], math.sqrt(2)/2, rel_tol=1e-9)
assert math.isclose(vals['tan'], 1.0,            rel_tol=1e-9)
assert math.isclose(vals['sec'], math.sqrt(2),   rel_tol=1e-9)

vals2 = all_six(0)
assert math.isclose(vals2['cos'], 1.0,       rel_tol=1e-9)
assert math.isclose(vals2['tan'], 0.0,       abs_tol=1e-9)
assert vals2['cot'] == float('inf')   # cot(0) is undefined -> inf
assert vals2['csc'] == float('inf')   # csc(0) is undefined -> inf

vals3 = all_six(math.pi/6)
assert math.isclose(vals3['csc'], 2.0, rel_tol=1e-9)

print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — From one value, find all six**

```python
import math

def from_sin(sin_val, quadrant):
    """
    Given sin θ and the quadrant (1, 2, 3, or 4),
    return all six trig values as a dict.
    Uses: cos = ±sqrt(1 - sin²), sign from quadrant.
    """
    pass  # your code here

def from_tan(tan_val, quadrant):
    """
    Given tan θ and the quadrant, return all six trig values.
    Uses: sec² = 1 + tan², then cos = ±1/sec, sin = tan * cos.
    """
    pass  # your code here


# --- tests: do not modify ---
v = from_sin(0.6, 1)          # sin=3/5, QI
assert math.isclose(v['cos'], 0.8,        rel_tol=1e-9)
assert math.isclose(v['tan'], 0.75,       rel_tol=1e-9)
assert math.isclose(v['csc'], 5/3,        rel_tol=1e-9)

v2 = from_sin(0.6, 2)         # sin=3/5, QII: cos negative
assert math.isclose(v2['cos'], -0.8,      rel_tol=1e-9)
assert math.isclose(v2['tan'], -0.75,     rel_tol=1e-9)

v3 = from_tan(3/4, 1)
assert math.isclose(v3['sin'], 3/5,       rel_tol=1e-9)
assert math.isclose(v3['cos'], 4/5,       rel_tol=1e-9)
assert math.isclose(v3['sec'], 5/4,       rel_tol=1e-9)

print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Verify identities numerically**

```python
import math, numpy as np

def verify_identity(lhs, rhs, test_points, tol=1e-8):
    """
    Check that lhs(theta) == rhs(theta) for all theta in test_points,
    skipping points where either side is undefined (abs value > 1e6).
    Returns True if all checked points match within tol.
    """
    pass  # your code here


# --- tests: do not modify ---
import math, numpy as np

pts = np.linspace(0.2, 2*math.pi - 0.2, 200)

# sin²+cos²=1
assert verify_identity(
    lambda t: math.sin(t)**2 + math.cos(t)**2,
    lambda t: 1.0, pts)

# 1 + tan² = sec²
assert verify_identity(
    lambda t: 1 + math.tan(t)**2,
    lambda t: (1/math.cos(t))**2, pts)

# tan + cot = sec*csc
assert verify_identity(
    lambda t: math.sin(t)/math.cos(t) + math.cos(t)/math.sin(t),
    lambda t: (1/math.cos(t)) * (1/math.sin(t)), pts)

print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Prove that $\tan(\theta + \pi) = \tan\theta$ directly from the
definitions of $\sin$ and $\cos$ (do not use the addition formula).

<details>
<summary>Answer</summary>

$\tan(\theta+\pi) = \frac{\sin(\theta+\pi)}{\cos(\theta+\pi)}$.

The point at angle $\theta+\pi$ is diametrically opposite the point at
$\theta$ on the unit circle: $(\cos(\theta+\pi), \sin(\theta+\pi)) = (-\cos\theta, -\sin\theta)$.

Therefore $\tan(\theta+\pi) = \frac{-\sin\theta}{-\cos\theta} = \frac{\sin\theta}{\cos\theta} = \tan\theta$. $\blacksquare$

</details>

**5. ★** Use the identity $1 + \tan^2\theta = \sec^2\theta$ to prove that
$|\sec\theta| \geq 1$ for all $\theta$ in the domain of $\sec$.

<details>
<summary>Answer</summary>

$\sec^2\theta = 1 + \tan^2\theta \geq 1 + 0 = 1$ (since $\tan^2\theta \geq 0$).
Taking square roots (both sides non-negative): $|\sec\theta| \geq 1$. $\blacksquare$

This has a geometric interpretation: the hypotenuse is always at least
as long as any side of a right triangle, so $\sec\theta = \text{hyp}/\text{adj} \geq 1$
in magnitude.

</details>
