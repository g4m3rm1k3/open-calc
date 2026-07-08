# Stage 2, Lesson 2.2 — The Six Trigonometric Functions
**Threads:** Math · Physics  
**Estimated time:** 55–70 minutes

---

## What This Lesson Is About

Trigonometry — literally "triangle measuring" — began as a tool for computing
distances and angles that could not be measured directly. The six trigonometric
functions reduce every right triangle to two numbers (an angle and a side ratio)
and then reconstruct the whole triangle from those two numbers.

But these six functions are far more than triangle tools. Once defined on the
right triangle, they extend to all real angles via the unit circle, and then to
complex arguments via Euler's formula. The same functions that describe the
ratio of sides in a 30-60-90 triangle also describe the vibration of a guitar
string, the amplitude of an AC voltage, the intensity pattern of light through
a diffraction grating, and the solution to every second-order linear differential
equation with constant coefficients.

This lesson defines all six functions from first principles, derives the three
Pythagorean identities, establishes the co-function relationships, and shows how
to recover all six values from a single one — the skills needed before the unit
circle and trig equations in subsequent lessons.

---

## Historical Context

Trigonometry originates in ancient Greek astronomy. Hipparchus of Nicaea
(c. 190–120 BCE) built the first table of **chords** — a function equivalent
to $2\sin(\theta/2)$ — to compute planetary positions. Ptolemy (c. 90–168 CE)
expanded this in the *Almagest*. Indian mathematicians — Aryabhata (499 CE) and
Brahmagupta (628 CE) — separated the half-chord into what we now call
**sine**, writing it as *jya* in Sanskrit. Arab scholars transliterated
*jya* phonetically as *jiba*, which European translators (reading handwritten
Arabic with missing vowels) misread as *jaib* (Arabic for "bay" or "bosom"),
translating it as Latin *sinus* — giving us **sine**. The word **tangent**
comes from Latin *tangens* ("touching"), because the tangent of an angle
equals the length of the tangent line from the unit circle to the point where
a ray meets the vertical axis.

---

## What You Need To Know First

- **Right triangle:** one angle is exactly 90°; by Pythagoras, $c^2 = a^2 + b^2$.
- **Angle measurement:** degrees and radians from Lesson 2.1.
- **Fraction arithmetic:** these functions are ratios of sides.

---

## The Lesson

### The Three Primary Functions: SOH-CAH-TOA

Label the sides of a right triangle relative to one of the acute angles $\theta$:
- **Hypotenuse (hyp):** the side opposite the right angle — always the longest.
- **Opposite (opp):** the side directly across from $\theta$.
- **Adjacent (adj):** the side next to $\theta$ that is not the hypotenuse.

The three primary trigonometric functions are defined as ratios:

$$\sin\theta = \frac{\text{opp}}{\text{hyp}}, \qquad
\cos\theta = \frac{\text{adj}}{\text{hyp}}, \qquad
\tan\theta = \frac{\text{opp}}{\text{adj}}$$

The mnemonic **SOH-CAH-TOA** packages these:

$$\underbrace{\text{S}}_{\sin}\underbrace{\text{OH}}_{\text{opp/hyp}}\;
\underbrace{\text{C}}_{\cos}\underbrace{\text{AH}}_{\text{adj/hyp}}\;
\underbrace{\text{T}}_{\tan}\underbrace{\text{OA}}_{\text{opp/adj}}$$

Since $\tan\theta = \frac{\text{opp}}{\text{adj}}$ and $\sin\theta/\cos\theta = \frac{\text{opp/hyp}}{\text{adj/hyp}} = \frac{\text{opp}}{\text{adj}}$, we have the fundamental quotient identity:

$$\boxed{\tan\theta = \frac{\sin\theta}{\cos\theta}}$$

**Worked example 1 — a 3-4-5 triangle:**

A right triangle has legs 3 and 4 and hypotenuse 5. Let $\theta$ be the angle
opposite the side of length 4.

$$\sin\theta = \frac{4}{5}, \qquad \cos\theta = \frac{3}{5}, \qquad \tan\theta = \frac{4}{3}$$

**Verification:** $\sin^2\theta + \cos^2\theta = \frac{16}{25} + \frac{9}{25} = \frac{25}{25} = 1$. ✓

And $\tan\theta = \sin\theta/\cos\theta = \frac{4/5}{3/5} = \frac{4}{3}$. ✓

**Worked example 2 — find sides from an angle and one side:**

A right triangle has hypotenuse 13 and acute angle $\theta$ where $\sin\theta = 5/13$.
Find the remaining sides.

From $\sin\theta = \text{opp}/\text{hyp} = 5/13$: opp $= 5$.

From Pythagoras: adj $= \sqrt{13^2 - 5^2} = \sqrt{169 - 25} = \sqrt{144} = 12$.

So $\cos\theta = 12/13$ and $\tan\theta = 5/12$.

**Worked example 3 — scaling invariance:**

Why do the ratios not depend on the size of the triangle?

Two triangles with the same angles but different sizes are **similar** — their
sides are proportional. If all sides scale by factor $k$, the ratios opp/hyp,
adj/hyp, opp/adj are unchanged ($k$ cancels in numerator and denominator). This
is why $\sin 30°$ is the same number regardless of the triangle's size.

---

### The Three Reciprocal Functions

Each primary function has a reciprocal:

$$\csc\theta = \frac{1}{\sin\theta} = \frac{\text{hyp}}{\text{opp}}, \qquad
\sec\theta = \frac{1}{\cos\theta} = \frac{\text{hyp}}{\text{adj}}, \qquad
\cot\theta = \frac{1}{\tan\theta} = \frac{\text{adj}}{\text{opp}}$$

The names: **cosecant** (csc), **secant** (sec), **cotangent** (cot).

From the quotient identity, cotangent also satisfies:

$$\cot\theta = \frac{\cos\theta}{\sin\theta}$$

**Worked example — all six from 3-4-5:**

With $\theta$ opposite the side of length 4, hyp $= 5$:

$$\sin\theta = \frac{4}{5}, \quad \cos\theta = \frac{3}{5}, \quad \tan\theta = \frac{4}{3}$$
$$\csc\theta = \frac{5}{4}, \quad \sec\theta = \frac{5}{3}, \quad \cot\theta = \frac{3}{4}$$

**Check:** $\csc\theta \cdot \sin\theta = \frac{5}{4} \cdot \frac{4}{5} = 1$. ✓

**Undefined values:** a function is undefined when its denominator is zero.

- $\tan 90° = \sin 90°/\cos 90° = 1/0$ — undefined.
- $\csc 0° = 1/\sin 0° = 1/0$ — undefined.
- $\sec 90° = 1/\cos 90°$ — undefined.
- $\cot 0° = \cos 0°/\sin 0°$ — undefined.

These are the boundary angles where the function "blows up" — vertical
asymptotes in the graph. Later lessons (2.9–2.10) explore this in detail.

---

### The Pythagorean Identity

Let $\theta$ be an acute angle in a right triangle with sides opp, adj, hyp.
By Pythagoras: $\text{opp}^2 + \text{adj}^2 = \text{hyp}^2$.

Divide both sides by $\text{hyp}^2$:

$$\frac{\text{opp}^2}{\text{hyp}^2} + \frac{\text{adj}^2}{\text{hyp}^2} = 1$$

$$\left(\frac{\text{opp}}{\text{hyp}}\right)^2 + \left(\frac{\text{adj}}{\text{hyp}}\right)^2 = 1$$

$$\boxed{\sin^2\theta + \cos^2\theta = 1}$$

This holds for any angle (not just acute angles — the proof extends via the
unit circle in Lesson 2.6). It is the **fundamental Pythagorean identity**.

**Two derived identities:** by dividing the fundamental identity by $\cos^2\theta$
and $\sin^2\theta$ respectively:

Divide by $\cos^2\theta$:
$$\frac{\sin^2\theta}{\cos^2\theta} + 1 = \frac{1}{\cos^2\theta}
\quad\implies\quad \boxed{\tan^2\theta + 1 = \sec^2\theta}$$

Divide by $\sin^2\theta$:
$$1 + \frac{\cos^2\theta}{\sin^2\theta} = \frac{1}{\sin^2\theta}
\quad\implies\quad \boxed{1 + \cot^2\theta = \csc^2\theta}$$

These three — the **Pythagorean identities** — are the backbone of trig
simplification throughout Stage 2.

**Worked example — use the identity to find $\cos\theta$ from $\sin\theta$:**

Given $\sin\theta = \frac{7}{25}$ and $\theta$ is acute. Find $\cos\theta$.

$$\cos^2\theta = 1 - \sin^2\theta = 1 - \frac{49}{625} = \frac{576}{625}$$

$$\cos\theta = \frac{24}{25} \quad (\text{positive, since } \theta \text{ is acute})$$

**Worked example — use the second identity:**

Given $\tan\theta = 2$. Find $\sec\theta$ (assume $\theta$ acute).

$$\sec^2\theta = 1 + \tan^2\theta = 1 + 4 = 5 \implies \sec\theta = \sqrt{5}$$

Therefore $\cos\theta = 1/\sqrt{5} = \sqrt{5}/5$.

**Worked example — simplify an expression:**

Simplify $\frac{\sec^2\theta - 1}{\sin^2\theta}$.

$$\frac{\sec^2\theta - 1}{\sin^2\theta} = \frac{\tan^2\theta}{\sin^2\theta}
= \frac{\sin^2\theta/\cos^2\theta}{\sin^2\theta} = \frac{1}{\cos^2\theta} = \sec^2\theta$$

```python
import math
import numpy as np
import matplotlib.pyplot as plt

# Visualise all six trig functions as geometric lengths on the unit circle
theta = math.radians(40)   # a representative angle
cos_t, sin_t = math.cos(theta), math.sin(theta)
tan_t = math.tan(theta)
sec_t = 1/cos_t

fig, ax = plt.subplots(figsize=(8, 8))
t = np.linspace(0, 2*np.pi, 400)
ax.plot(np.cos(t), np.sin(t), color='#ddd', lw=2)

# sin: vertical from (cos,0) to (cos,sin)
ax.plot([cos_t, cos_t], [0, sin_t], color='#e74c3c', lw=3, label=f'sin θ = {sin_t:.3f}')
# cos: horizontal from (0,0) to (cos,0)
ax.plot([0, cos_t], [0, 0], color='#2980b9', lw=3, label=f'cos θ = {cos_t:.3f}')
# tan: vertical from (1,0) to (1,tan)
ax.plot([1, 1], [0, tan_t], color='#27ae60', lw=3, label=f'tan θ = {tan_t:.3f}')
# radius to (cos,sin)
ax.plot([0, cos_t], [0, sin_t], color='#333', lw=1.5, ls='--')
ax.plot([0, 1], [0, tan_t], color='#333', lw=1.5, ls='--', alpha=0.5)
# sec: from origin to (1,tan) along the ray
ax.plot([0, 1], [0, tan_t], color='#8e44ad', lw=3, label=f'sec θ = {sec_t:.3f}')

# Points
ax.scatter([cos_t], [sin_t], s=60, color='#333', zorder=5)
ax.scatter([1], [tan_t], s=60, color='#27ae60', zorder=5)
ax.axhline(0, color='#555', lw=1); ax.axvline(0, color='#555', lw=1)
ax.plot([1, 1], [-0.05, 0.05], 'k', lw=1.5)  # mark x=1

# Annotations
ax.annotate('sin θ', xy=(cos_t+0.05, sin_t/2), fontsize=10, color='#e74c3c')
ax.annotate('cos θ', xy=(cos_t/2, -0.07), fontsize=10, color='#2980b9', ha='center')
ax.annotate('tan θ', xy=(1.07, tan_t/2), fontsize=10, color='#27ae60')
ax.annotate(f'θ={math.degrees(theta):.0f}°', xy=(0.13, 0.06), fontsize=10)

ax.set_aspect('equal'); ax.set_xlim(-0.2, 1.5); ax.set_ylim(-0.3, 1.3)
ax.legend(fontsize=9, loc='upper left'); ax.axis('off')
ax.set_title('Six trig functions as geometric lengths on the unit circle', fontsize=10)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `math.cos(theta)` and `math.sin(theta)` take radians — the
conversion `math.radians(40)` is essential. The vertical red segment from
$(cos\theta, 0)$ to $(\cos\theta, \sin\theta)$ is literally the **sin** of the
angle: that is its geometric length on the unit circle. The green vertical
segment at $x=1$ is the **tangent**, because the tangent line touches the circle
at $(1, 0)$ and rises to the point where the ray from the origin meets it.

---

### Co-function Identities

In a right triangle, the three angles sum to 180°. With a right angle and acute
angle $\theta$, the remaining acute angle is $90° - \theta$. The sides opposite
and adjacent **swap** when you switch from $\theta$ to $90° - \theta$:

$$\sin(90° - \theta) = \cos\theta, \qquad \cos(90° - \theta) = \sin\theta$$
$$\tan(90° - \theta) = \cot\theta, \qquad \cot(90° - \theta) = \tan\theta$$
$$\sec(90° - \theta) = \csc\theta, \qquad \csc(90° - \theta) = \sec\theta$$

**Geometric proof for sine and cosine:** in the right triangle, let opp and
adj be the sides for angle $\theta$. For the complementary angle $90°-\theta$:
the "opposite" becomes adj and the "adjacent" becomes opp. So
$\sin(90°-\theta) = \text{adj}/\text{hyp} = \cos\theta$.

**This is where the names come from:** **co**sine is the sine of the
**co**mplement. **co**secant is the secant of the complement.
**co**tangent is the tangent of the complement.

**In radians:** $90° = \pi/2$, so the identities become:

$$\sin\!\left(\frac{\pi}{2} - \theta\right) = \cos\theta, \qquad
\cos\!\left(\frac{\pi}{2} - \theta\right) = \sin\theta$$

**Worked example:** verify $\sin 70° = \cos 20°$.

$\sin 70° = \sin(90° - 20°) = \cos 20°$. ✓ (Complementary angles.)

**Worked example:** given $\tan 35° \approx 0.7002$, find $\cot 55°$.

$\cot 55° = \cot(90° - 35°) = \tan 35° \approx 0.7002$.

---

### Finding All Six Values from One

If you know one trig value and the quadrant, you can find all six.
Here we work with acute angles (right triangle); Lessons 2.7–2.8 extend to all quadrants.

**Method:**
1. From the given value and the Pythagorean theorem (or a Pythagorean identity),
   find the sides of a reference triangle.
2. Read off all six ratios.

**Worked example 1 — given $\sin\theta = \frac{3}{5}$, $\theta$ acute:**

From $\sin\theta = 3/5$: opp $= 3$, hyp $= 5$.

adj $= \sqrt{5^2 - 3^2} = \sqrt{16} = 4$.

$$\cos\theta = \frac{4}{5}, \quad \tan\theta = \frac{3}{4}, \quad
\csc\theta = \frac{5}{3}, \quad \sec\theta = \frac{5}{4}, \quad \cot\theta = \frac{4}{3}$$

**Worked example 2 — given $\tan\theta = \frac{12}{5}$, $\theta$ acute:**

From $\tan\theta = 12/5$: treat opp $= 12$, adj $= 5$.

hyp $= \sqrt{12^2 + 5^2} = \sqrt{144 + 25} = \sqrt{169} = 13$.

$$\sin\theta = \frac{12}{13}, \quad \cos\theta = \frac{5}{13}, \quad
\csc\theta = \frac{13}{12}, \quad \sec\theta = \frac{13}{5}, \quad \cot\theta = \frac{5}{12}$$

**Worked example 3 — given $\sec\theta = \frac{\sqrt{5}}{2}$, $\theta$ acute:**

$\sec\theta = \text{hyp}/\text{adj} = \sqrt{5}/2$: hyp $= \sqrt{5}$, adj $= 2$.

opp $= \sqrt{(\sqrt{5})^2 - 2^2} = \sqrt{5 - 4} = 1$.

$$\sin\theta = \frac{1}{\sqrt{5}} = \frac{\sqrt{5}}{5}, \quad
\cos\theta = \frac{2}{\sqrt{5}} = \frac{2\sqrt{5}}{5}, \quad
\tan\theta = \frac{1}{2}$$

$$\csc\theta = \sqrt{5}, \quad \csc\theta = \frac{\sqrt{5}}{2}, \quad \cot\theta = 2$$

**Worked example 4 — from an identity rather than a triangle:**

Given $\cos\theta = \frac{1}{3}$, $\theta$ acute. Find $\sin\theta$ and $\tan\theta$
without drawing a triangle — use identities.

$$\sin^2\theta = 1 - \cos^2\theta = 1 - \frac{1}{9} = \frac{8}{9}
\implies \sin\theta = \frac{\sqrt{8}}{3} = \frac{2\sqrt{2}}{3}$$

$$\tan\theta = \frac{\sin\theta}{\cos\theta} = \frac{2\sqrt{2}/3}{1/3} = 2\sqrt{2}$$

```python
import math
import numpy as np
import matplotlib.pyplot as plt

def all_six(opp, adj, hyp):
    """Given right-triangle sides, return all six trig values."""
    return {
        'sin': opp/hyp, 'cos': adj/hyp, 'tan': opp/adj,
        'csc': hyp/opp, 'sec': hyp/adj, 'cot': adj/opp,
    }

# Verify the 3-4-5 and 5-12-13 examples
for opp, adj, hyp in [(4,3,5), (12,5,13), (3,4,5)]:
    t = all_six(opp, adj, hyp)
    # Pythagorean identity check
    assert abs(t['sin']**2 + t['cos']**2 - 1) < 1e-14
    # Tan check
    assert abs(t['tan'] - t['sin']/t['cos']) < 1e-14
    # Reciprocal checks
    assert abs(t['sin'] * t['csc'] - 1) < 1e-14
    assert abs(t['cos'] * t['sec'] - 1) < 1e-14

print("All six trig values for 3-4-5 (θ opposite the 4-side):")
t = all_six(4, 3, 5)
for name, val in t.items():
    print(f"  {name}θ = {val:.10f}")

# Co-function check
for deg in [10, 20, 30, 40, 50, 60, 70, 80]:
    rad = math.radians(deg)
    comp = math.radians(90 - deg)
    assert abs(math.sin(rad) - math.cos(comp)) < 1e-14
    assert abs(math.tan(rad) - (1/math.tan(comp))) < 1e-14

print("\nCo-function identity verified for all complementary pairs ✓")
```

**Walkthrough:** `all_six` takes the three sides and computes the six ratios
directly from the definitions. The Pythagorean and reciprocal assertions check
that the values are consistent — they should pass exactly (to machine precision)
because they are simple fractions of the input integers. The co-function loop
checks `sin(θ) == cos(90-θ)` for every angle from 10° to 80°.

---

## Connect the Pieces

**What this lesson built on:** right triangle geometry (Pythagoras),
radian/degree conversion (Lesson 2.1), basic fraction arithmetic.

**What this enables:** Lesson 2.3 (special angles — exact values for 30°, 45°,
60°). Lesson 2.5 (Pythagorean identity proved from scratch via the unit circle).
Lesson 2.7 (extending to all angles beyond 90° using the unit circle). Lesson 2.9
(graphs of sin and cos — their shape is determined by the values derived here).
Stage 5: derivatives of trig functions all follow from $\frac{d}{dx}\sin x = \cos x$
which requires radians and the co-function identity.

---

## Summary

**Three primary functions (SOH-CAH-TOA):**
$$\sin\theta = \frac{\text{opp}}{\text{hyp}}, \qquad \cos\theta = \frac{\text{adj}}{\text{hyp}}, \qquad \tan\theta = \frac{\text{opp}}{\text{adj}} = \frac{\sin\theta}{\cos\theta}$$

**Three reciprocal functions:**
$$\csc\theta = \frac{1}{\sin\theta}, \qquad \sec\theta = \frac{1}{\cos\theta}, \qquad \cot\theta = \frac{1}{\tan\theta} = \frac{\cos\theta}{\sin\theta}$$

**Pythagorean identities:**
$$\sin^2\theta + \cos^2\theta = 1, \qquad \tan^2\theta + 1 = \sec^2\theta, \qquad 1 + \cot^2\theta = \csc^2\theta$$

**Co-function identities:** $\sin(90°-\theta) = \cos\theta$, $\tan(90°-\theta) = \cot\theta$, $\sec(90°-\theta) = \csc\theta$.

**Workflow for "find all six":** build the reference triangle; read off all ratios.

---

## Problems

### Math

**1.** A right triangle has legs 8 and 15. Let $\theta$ be the angle opposite
the side of length 15. Find all six trig functions of $\theta$ exactly.

<details>
<summary>Answer</summary>

hyp $= \sqrt{64 + 225} = \sqrt{289} = 17$.
$\sin\theta = 15/17$, $\cos\theta = 8/17$, $\tan\theta = 15/8$,
$\csc\theta = 17/15$, $\sec\theta = 17/8$, $\cot\theta = 8/15$.

</details>

---

**2.** Given $\cos\theta = 5/13$, $\theta$ acute. Find the remaining five trig
functions without using a calculator.

<details>
<summary>Answer</summary>

opp $= \sqrt{169-25} = 12$: $\sin\theta = 12/13$, $\tan\theta = 12/5$,
$\csc\theta = 13/12$, $\sec\theta = 13/5$, $\cot\theta = 5/12$.

</details>

---

**3.** Simplify, using only Pythagorean identities:
(a) $\frac{1 - \sin^2\theta}{\cos\theta}$
(b) $\frac{\tan\theta}{\sin\theta}$
(c) $(\sin\theta + \cos\theta)^2 - 1$

<details>
<summary>Answers</summary>

(a) $\cos^2\theta/\cos\theta = \cos\theta$.
(b) $(\sin\theta/\cos\theta)/\sin\theta = 1/\cos\theta = \sec\theta$.
(c) $\sin^2\theta + 2\sin\theta\cos\theta + \cos^2\theta - 1 = 1 + 2\sin\theta\cos\theta - 1 = 2\sin\theta\cos\theta$.

</details>

---

**4.** (Proof) Starting from $\sin^2\theta + \cos^2\theta = 1$, derive
$1 + \cot^2\theta = \csc^2\theta$ by dividing through by $\sin^2\theta$.
State carefully what you require of $\theta$ to make this valid.

<details>
<summary>Proof</summary>

Divide both sides by $\sin^2\theta$ (valid when $\sin\theta \neq 0$, i.e. $\theta \neq 0°, 180°, \ldots$):
$1 + \cos^2\theta/\sin^2\theta = 1/\sin^2\theta$,
i.e. $1 + \cot^2\theta = \csc^2\theta$. $\square$

</details>

---

### Code Challenges

**Challenge 1 — All six trig values**

```python
import math

def all_six_from_sin(sin_val, acute=True):
    """
    Given sin(theta) and whether theta is acute, return a dict with all six
    trig values: 'sin','cos','tan','csc','sec','cot'.
    Raise ValueError if |sin_val| > 1.
    """
    pass

def all_six_from_tan(tan_val):
    """
    Given tan(theta) > 0 (acute angle), return all six trig values.
    Use tan²θ + 1 = sec²θ to find cos, then sin = tan*cos.
    """
    pass

def all_six_from_sides(opp, adj):
    """
    Given the opposite and adjacent sides (positive), compute all six values.
    Compute hyp from Pythagoras.
    """
    pass


# --- tests: do not modify ---
# from sin=3/5
t = all_six_from_sin(3/5, acute=True)
assert abs(t['sin'] - 3/5)  < 1e-12
assert abs(t['cos'] - 4/5)  < 1e-12
assert abs(t['tan'] - 3/4)  < 1e-12
assert abs(t['csc'] - 5/3)  < 1e-12
assert abs(t['sec'] - 5/4)  < 1e-12
assert abs(t['cot'] - 4/3)  < 1e-12

# Pythagorean identity must hold
for val in [0.3, 0.5, 0.7, 0.9]:
    t = all_six_from_sin(val)
    assert abs(t['sin']**2 + t['cos']**2 - 1) < 1e-12

# from tan=2
t = all_six_from_tan(2)
assert abs(t['tan'] - 2) < 1e-12
assert abs(t['sin']**2 + t['cos']**2 - 1) < 1e-12
assert abs(t['sec']**2 - 1 - t['tan']**2) < 1e-12

# from sides 5,12
t = all_six_from_sides(5, 12)
assert abs(t['sin'] - 5/13) < 1e-12
assert abs(t['cos'] - 12/13) < 1e-12

# ValueError for invalid sin
try:
    all_six_from_sin(1.5)
    assert False
except ValueError:
    pass

print("✓ Challenge 1 passed!")
```

<details>
<summary>Hint</summary>

`all_six_from_sin`: check `abs(sin_val) > 1` → ValueError.
`cos = sqrt(1 - sin²)` (positive if acute). Then read off tan, csc, sec, cot.
`all_six_from_tan`: `sec² = 1 + tan²`; `cos = 1/sec`; `sin = tan*cos`.
`all_six_from_sides`: `hyp = math.sqrt(opp**2 + adj**2)`; then all six ratios directly.

</details>

---

**Challenge 2 — Identity verifier**

```python
import math

def verify_pythagorean_identities(theta_deg):
    """
    Check all three Pythagorean identities at the given angle.
    Return a dict: {'identity1': bool, 'identity2': bool, 'identity3': bool}
    identity1: sin²+cos²=1
    identity2: tan²+1=sec²  (skip if cos==0)
    identity3: 1+cot²=csc²  (skip if sin==0)
    """
    pass

def verify_cofunction(theta_deg):
    """
    Verify all six co-function identities at theta_deg.
    Return True if all pass within tolerance 1e-12.
    """
    pass


# --- tests: do not modify ---
for deg in [10, 25, 37, 45, 63, 75]:
    result = verify_pythagorean_identities(deg)
    assert result['identity1'], f"identity1 failed at {deg}°"
    assert result['identity2'], f"identity2 failed at {deg}°"
    assert result['identity3'], f"identity3 failed at {deg}°"

for deg in [5, 20, 35, 50, 65, 80]:
    assert verify_cofunction(deg), f"cofunction failed at {deg}°"

print("✓ Challenge 2 passed!")
print("  All Pythagorean identities hold.")
print("  All co-function identities hold.")
```

<details>
<summary>Hint</summary>

`verify_pythagorean_identities`: compute `s,c,t = sin,cos,tan` via `math.sin/cos/tan`.
Identity 1: `abs(s**2 + c**2 - 1) < 1e-12`. Identity 2: if `abs(c) > 1e-14`, check `abs(t**2 + 1 - 1/c**2) < 1e-12`. Identity 3 similar.
`verify_cofunction`: compute `comp = 90 - theta_deg`; verify `sin(θ)==cos(comp)`, `tan(θ)==cot(comp)`, `sec(θ)==csc(comp)`.

</details>

---

**Challenge 3 — Right triangle solver**

```python
import math

def solve_right_triangle_hyp_angle(hyp, theta_deg):
    """
    Given hypotenuse and one acute angle theta_deg,
    return dict with keys: 'opp', 'adj', 'other_angle_deg',
    and all six trig values.
    """
    pass

def solve_right_triangle_two_sides(side_a, side_b, are_both_legs=True):
    """
    If are_both_legs=True: side_a and side_b are the two legs.
      Compute hypotenuse and both acute angles.
    If are_both_legs=False: side_a is a leg, side_b is the hypotenuse.
      Compute the other leg and both acute angles.
    Return dict: 'hyp', 'leg1', 'leg2', 'angle1_deg', 'angle2_deg'.
    """
    pass


# --- tests: do not modify ---
# hyp=10, theta=30°
t = solve_right_triangle_hyp_angle(10, 30)
assert abs(t['opp'] - 5)          < 1e-10   # sin30=1/2
assert abs(t['adj'] - 5*math.sqrt(3)) < 1e-10  # cos30=√3/2
assert abs(t['other_angle_deg'] - 60) < 1e-10
assert abs(t['sin'] - 0.5)        < 1e-12

# Two legs: 3 and 4
t = solve_right_triangle_two_sides(3, 4, are_both_legs=True)
assert abs(t['hyp'] - 5)          < 1e-10
assert abs(t['angle1_deg'] + t['angle2_deg'] - 90) < 1e-10  # complementary

# Leg and hypotenuse: leg=1, hyp=sqrt(2)
t = solve_right_triangle_two_sides(1, math.sqrt(2), are_both_legs=False)
assert abs(t['leg2'] - 1)         < 1e-10   # isoceles right triangle
assert abs(t['angle1_deg'] - 45)  < 1e-10

print("✓ Challenge 3 passed!")
```

<details>
<summary>Hint</summary>

`solve_right_triangle_hyp_angle`: `opp = hyp*sin(theta_rad)`, `adj = hyp*cos(theta_rad)`, `other = 90 - theta_deg`. For trig values call `all_six_from_sides(opp, adj)` or compute directly.
`solve_right_triangle_two_sides` (both legs): `hyp = sqrt(a²+b²)`, `angle1 = degrees(atan2(a,b))`, `angle2 = 90 - angle1`.
(leg+hyp): `other_leg = sqrt(hyp²-leg²)`, `angle1 = degrees(asin(leg/hyp))`, `angle2 = 90 - angle1`.

</details>

---

### Extension

**4. ★** Prove the identity $(\sec\theta - \tan\theta)(\sec\theta + \tan\theta) = 1$
directly from the Pythagorean identity $\tan^2\theta + 1 = \sec^2\theta$.

**5. ★** Show that in a right triangle with acute angle $\theta$,

$$\frac{\sin\theta}{1 + \cos\theta} = \frac{1 - \cos\theta}{\sin\theta}$$

Prove this algebraically and also give a geometric interpretation in terms of
the triangle's sides.
