# Stage 4, Lesson 4.1 — Vectors in Rⁿ: Magnitude, Direction, Operations
**Threads:** Math · Physics · Engineering
**Estimated time:** 55–65 minutes

---

## What This Lesson Is About

Lesson 2.8 introduced vectors as arrows in a 2D plane — magnitude,
direction, forces, bearings. Every conic and transformation since
then has quietly used vectors in exactly two or three dimensions
without ever asking whether the idea generalizes further. It does,
completely: nothing about "an ordered list of numbers you can add,
scale, and measure the length of" requires stopping at 2 or 3
components. A vector in $\mathbb{R}^n$ is just $n$ numbers, and every
operation from Lesson 2.8 — addition, scalar multiplication,
magnitude — carries over unchanged, just with more coordinates to
track.

This isn't abstraction for its own sake. A 5-axis CNC machine's tool
state is a 5-dimensional vector (X, Y, Z position plus two rotation
angles). An RGB color is a 3D vector. A machine learning model's
description of a single data point — later in this curriculum, an
image, a sentence, a sensor reading — is routinely a vector with
hundreds or thousands of components. The jump from "$\mathbb{R}^2$"
to "$\mathbb{R}^n$" in this lesson is the single move that makes
linear algebra applicable to nearly everything past this point in the
curriculum, rather than just plane geometry.

---

## Historical Context

The modern vector concept has two independent 19th-century roots:
William Rowan Hamilton's quaternions (1843), developed partly to
extend complex numbers into 3D rotations, and Hermann Grassmann's
*Ausdehnungslehre* ("theory of extension," 1844), which worked
directly in $n$ dimensions from the start — genuinely ahead of its
time, and largely ignored for decades because almost no one else was
thinking in more than 3 dimensions yet. The vector notation and
operations used today — dot product, cross product, the
$\mathbf{i},\mathbf{j},\mathbf{k}$ notation — were standardized in
the 1880s by Josiah Willard Gibbs and Oliver Heaviside, who stripped
Hamilton's more complicated quaternion machinery down to just the
3D vector parts practicing physicists and engineers actually needed.
The jump to genuinely high-dimensional vectors as a practical
everyday tool — hundreds or thousands of components — is far more
recent, driven almost entirely by computing: statistics, signal
processing, and now machine learning all routinely work in
dimensions no human can visualize directly, using exactly the
algebra this lesson introduces.

---

## What You Need To Know First

- **2D vectors, magnitude, bearings, forces** — Lesson 2.8. This
  lesson generalizes that content directly; nothing here contradicts
  it.
- **Distance formula** — Lesson 3.1. A vector's magnitude in
  $\mathbb{R}^n$ is a direct generalization of this formula.
- **`np.array` and `np.linalg.norm`** — first used in Lessons 3.6 and
  3.4 respectively. This lesson is where those tools get their proper
  introduction, having been used ahead of schedule as forward
  references.

---

## The Lesson

### Vectors in $\mathbb{R}^n$

A **vector** in $\mathbb{R}^n$ is an ordered list of $n$ real numbers:

$$\mathbf{v} = (v_1, v_2, \dots, v_n)$$

$\mathbb{R}^2$ (the plane, Lesson 2.8) and $\mathbb{R}^3$ (ordinary
3D space) are the special, visualizable cases of this — but $n$ can
be anything. A part's full 3-axis CNC position is a vector in
$\mathbb{R}^3$; a 5-axis machine's tool state (position plus tilt and
rotation angles) is a vector in $\mathbb{R}^5$; a colour is a vector
in $\mathbb{R}^3$ (red, green, blue channels). Once $n>3$, you cannot
draw the vector as an arrow anymore — but every algebraic operation
below still makes complete sense, and that algebra, not the picture,
is what actually does the work in this curriculum from here on.

**Two readings of the same list of numbers.** A vector can represent
a **position** (a point's coordinates, measured from a fixed origin)
or a **displacement** (a change, a direction and distance to move,
with no fixed starting point implied). Lesson 2.8 already used both
readings informally; this lesson makes the distinction explicit
because some operations only make clean sense for one reading (adding
two positions together is geometrically odd; adding two displacements
is exactly how you combine sequential moves).

---

### Vector Operations

**Addition and subtraction** (component-wise):

$$\mathbf{u} + \mathbf{v} = (u_1+v_1,\ u_2+v_2,\ \dots,\ u_n+v_n)$$

Geometrically in 2D/3D this is the parallelogram rule from Lesson
2.8; algebraically in $\mathbb{R}^n$ it's simply "add the
corresponding entries," which is the definition that actually scales.

**Scalar multiplication:**

$$c\mathbf{v} = (cv_1,\ cv_2,\ \dots,\ cv_n)$$

Scales every component by the same number $c$. $c>1$ stretches,
$0<c<1$ shrinks, $c<0$ reverses direction entirely.

**Magnitude (norm)** — the direct $n$-dimensional generalization of
the distance formula (Lesson 3.1):

$$\|\mathbf{v}\| = \sqrt{v_1^2+v_2^2+\cdots+v_n^2}$$

**Hand-worked example:** for $\mathbf{u}=(3,-1,4,0)$ and
$\mathbf{v}=(1,2,-2,5)$ in $\mathbb{R}^4$:

$$\mathbf{u}+\mathbf{v}=(4,1,2,5) \qquad 2\mathbf{u}=(6,-2,8,0)$$
$$\|\mathbf{u}\| = \sqrt{9+1+16+0}=\sqrt{26}\approx5.099$$

```python
import numpy as np

u = np.array([3, -1, 4, 0])
v = np.array([1, 2, -2, 5])

print(f"u + v  = {u + v}")
print(f"2u     = {2 * u}")
print(f"||u||  = {np.linalg.norm(u):.4f}")
```

**Walkthrough.** This is the first *deliberate, from-scratch*
introduction of `np.array` and `np.linalg.norm`, both of which you
already used ahead of schedule in Lessons 3.6 and 3.4 as forward
references. `u + v` on two NumPy arrays performs component-wise
addition automatically — the `+` operator is overloaded (redefined)
for arrays to mean vector addition rather than, say, concatenation
(which is what `+` does for two plain Python lists) — a first
explicit naming of **operator overloading**, a concept this lesson
will build directly in a moment. `2 * u` similarly overloads `*` to
mean scalar multiplication, distributing the `2` across every
component. `np.linalg.norm(u)` computes exactly the boxed magnitude
formula above.

---

### Unit Vectors

A **unit vector** has magnitude exactly 1. Any nonzero vector can be
converted to a unit vector pointing the same direction by dividing by
its own magnitude — **normalization**, first used informally in
Lesson 3.3's ray-reflection code and Lesson 3.5's TDOA axis
calculation, formalized properly here:

$$\hat{\mathbf{v}} = \frac{\mathbf{v}}{\|\mathbf{v}\|}$$

```python
def normalize(v):
    """Return the unit vector in the same direction as v."""
    mag = np.linalg.norm(v)
    if mag == 0:
        raise ValueError("Cannot normalize the zero vector")
    return v / mag

w = np.array([3, 4])
w_hat = normalize(w)
print(f"w     = {w}, ||w|| = {np.linalg.norm(w)}")
print(f"ŵ     = {w_hat}, ||ŵ|| = {np.linalg.norm(w_hat)}")
```

**Walkthrough.** `v / mag` divides an entire array by a single
number — another overloaded operator, `/`, distributing the division
across every component the same way `*` distributed multiplication
above. The zero-vector guard (`if mag == 0: raise ValueError`) is the
same fail-fast precondition-checking habit established repeatedly in
Stage 3 — dividing by a zero magnitude is undefined (there's no
"direction" for the zero vector to point in), so the code refuses
rather than silently producing `NaN` or a division error deep inside
some later calculation.

---

### Building a Vector Class: Operator Overloading

NumPy arrays already do everything above, but building a small
`Vector` class from scratch is worth doing once, because it reveals
exactly *how* `u + v` manages to mean "add corresponding components"
in the first place — not magic, but a specific mechanism you can
define yourself.

```python
import math

class Vector:
    def __init__(self, components):
        self.components = tuple(components)

    def __add__(self, other):
        """Defines what + means between two Vectors."""
        return Vector(a + b for a, b in zip(self.components, other.components))

    def __sub__(self, other):
        """Defines what - means between two Vectors."""
        return Vector(a - b for a, b in zip(self.components, other.components))

    def __mul__(self, scalar):
        """Defines what * means for Vector * number."""
        return Vector(a * scalar for a in self.components)

    def __rmul__(self, scalar):
        """Defines what * means for number * Vector (reversed order)."""
        return self.__mul__(scalar)

    def magnitude(self):
        return math.sqrt(sum(a**2 for a in self.components))

    def normalize(self):
        mag = self.magnitude()
        if mag == 0:
            raise ValueError("Cannot normalize the zero vector")
        return self * (1/mag)

    def __repr__(self):
        return f"Vector{self.components}"


a = Vector([3, -1, 4, 0])
b = Vector([1, 2, -2, 5])

print(f"a + b = {a + b}")
print(f"a - b = {a - b}")
print(f"3 * a = {3 * a}")
print(f"a * 3 = {a * 3}")
print(f"||a|| = {a.magnitude():.4f}")
```

Output:

```
a + b = Vector(4, 1, 2, 5)
a - b = Vector(2, -3, 6, -5)
3 * a = Vector(9, -3, 12, 0)
a * 3 = Vector(9, -3, 12, 0)
||a|| = 5.0990
```

**Walkthrough.** `__add__`, `__sub__`, `__mul__` are first
appearances of Python's **dunder (double-underscore) methods**: when
Python evaluates `a + b` for two `Vector` objects, it doesn't know
anything about vectors natively — it looks for a method literally
named `__add__` on `a` and calls `a.__add__(b)` in its place. This is
the actual mechanism behind what "operator overloading" meant a
moment ago with NumPy arrays: `np.array.__add__` is defined
internally to do component-wise addition, exactly the same way this
class's `__add__` is defined here, just written by you instead of by
NumPy's developers. `__rmul__` is a new, specific wrinkle: `3 * a`
asks Python to evaluate `(3).__mul__(a)` first, but the built-in
`int` type has no idea what a `Vector` is, so it returns
`NotImplemented`; Python then falls back to `a.__rmul__(3)` — which
is why *both* `__mul__` (for `a * 3`) and `__rmul__` (for `3 * a`)
need to exist for scalar multiplication to work naturally in either
order. `__repr__` is a reappearance of the pattern first used for
`Circle` in Lesson 3.2 — defining how an object prints when displayed.

---

### Applications: Positions, Colours, and Feature Vectors

**3-axis and 5-axis CNC state.** A 3-axis mill's tool position is a
vector in $\mathbb{R}^3$: $(X,Y,Z)$. A 5-axis machine adds two
rotational degrees of freedom (commonly called A and B, or A and C,
depending on the machine's configuration), making the full tool state
a vector in $\mathbb{R}^5$: $(X,Y,Z,A,B)$. The *distance* between two
tool states — how far the machine has to move to get from one to the
other — is exactly the $\mathbb{R}^5$ magnitude formula, useful for
estimating cycle time or checking whether a tool-change move is
unnecessarily long.

```python
import numpy as np

# Two 5-axis tool states: (X, Y, Z in mm, A, B in degrees)
state1 = np.array([120.0, 45.0, 10.0, 0.0, 0.0])
state2 = np.array([135.0, 45.0, 12.0, 15.0, -5.0])

displacement = state2 - state1
print(f"Displacement vector: {displacement}")
print(f"Linear distance (mm) if all axes moved in a straight blend: "
      f"{np.linalg.norm(displacement):.4f}")
```

**RGB colour blending.** A colour is naturally a vector in
$\mathbb{R}^3$; averaging two colours (a simple blend) is literally
vector addition and scalar multiplication:

```python
red = np.array([255, 0, 0])
blue = np.array([0, 0, 255])
purple_blend = 0.5*red + 0.5*blue
print(f"\nBlended colour: {purple_blend}")
```

**Feature vectors (forward reference).** In machine learning (Stage
10), a single data point is almost always represented as a vector —
a house's price-prediction features (square footage, bedrooms, age,
distance to city centre...) form a vector in $\mathbb{R}^n$ where $n$
is however many features you track, and "how similar are two houses"
or "how far apart are two data points" is answered with exactly the
magnitude-of-a-difference calculation used for the CNC tool states
above. This is a genuine forward reference — the technique doesn't
change at all between a 5-dimensional tool state and a
50-dimensional feature vector; only $n$ changes.

**Walkthrough.** Every line of code in this section reuses operations
already introduced earlier in the lesson — `-` for displacement, `+`
and scalar `*` for blending, `np.linalg.norm` for magnitude — applied
to three domains that look unrelated on the surface (machining,
colour, statistics) but are, algebraically, the identical operation.
That repetition is deliberate: the entire point of generalizing to
$\mathbb{R}^n$ is that the same four operations (add, subtract,
scale, measure length) keep working verbatim no matter what the
vector's components actually represent.

---

## Connect the Pieces

Concrete trace: a 5-axis tool move from $(120,45,10,0,0)$ to
$(135,45,12,15,-5)$.

1. **Displacement**: `state2 - state1` gives
   $(15,0,2,15,-5)$ — component-wise subtraction, the direct
   $\mathbb{R}^5$ generalization of Lesson 2.8's 2D displacement
   vectors.
2. **Magnitude**: `np.linalg.norm(displacement)` combines all five
   components (three linear, two rotational) into a single number —
   useful as a rough move-cost estimate, even though physically mixing
   millimetres and degrees this way is a simplification worth
   flagging, not a rigorous distance.
3. **Same tools, different domain**: swapping the five machine axes
   for three colour channels, or for fifty ML feature values, changes
   nothing about which functions get called — only $n$ and what the
   numbers mean.

---

## Summary

**Vector in $\mathbb{R}^n$:** an ordered list of $n$ real numbers;
generalizes Lesson 2.8's 2D vectors with no change to the underlying
operations.

**Operations:** component-wise addition/subtraction, scalar
multiplication, magnitude $\|\mathbf{v}\|=\sqrt{\sum v_i^2}$
(generalizing the distance formula), normalization
$\hat{\mathbf v}=\mathbf v/\|\mathbf v\|$.

**Operator overloading:** `__add__`, `__sub__`, `__mul__`,
`__rmul__` are the actual mechanism behind `+`, `-`, `*` working on
custom objects — the same mechanism NumPy uses internally for
`np.array`.

**Applications:** CNC tool state, colour blending, and ML feature
vectors are all, algebraically, the identical object — an ordered
list of numbers with the same four operations.

**New Python/CS concepts:**
- `np.array`, `np.linalg.norm` — formally introduced (used ahead of
  schedule in Lessons 3.4, 3.6, 3.9)
- Dunder methods (`__add__`, `__sub__`, `__mul__`, `__rmul__`,
  `__repr__`) — the mechanism behind operator overloading
- Why both `__mul__` and `__rmul__` are needed for `a*3` and `3*a`
  to both work

---

## Problems

### Math

**1.** For $\mathbf{a}=(2,-3,1,5)$ and $\mathbf{b}=(-1,4,0,2)$, find
$\mathbf{a}+\mathbf{b}$, $\mathbf{a}-2\mathbf{b}$, and
$\|\mathbf{a}\|$.

<details><summary>Answer</summary>
$\mathbf{a}+\mathbf{b}=(1,1,1,7)$.
$\mathbf{a}-2\mathbf{b}=(2-(-2),-3-8,1-0,5-4)=(4,-11,1,1)$.
$\|\mathbf{a}\|=\sqrt{4+9+1+25}=\sqrt{39}\approx6.245$.
</details>

---

**2.** Find the unit vector in the direction of $(0,3,-4,0,0)$.

<details><summary>Answer</summary>
$\|\mathbf v\|=\sqrt{0+9+16+0+0}=5$.
$\hat{\mathbf v}=(0,0.6,-0.8,0,0)$.
</details>

---

**3.** A machine moves through a sequence of three displacement
vectors: $(2,0,1)$, $(-1,3,0)$, $(0,-2,4)$. What is the net
displacement, and its magnitude?

<details><summary>Answer</summary>
Sum: $(2-1+0,\ 0+3-2,\ 1+0+4)=(1,1,5)$.
Magnitude: $\sqrt{1+1+25}=\sqrt{27}=3\sqrt3\approx5.196$.
</details>

---

### Code Challenges

**Challenge 1 — Complete the Vector class**

```python
import math

class Vector:
    def __init__(self, components):
        self.components = tuple(components)

    def __add__(self, other):
        pass

    def __sub__(self, other):
        pass

    def __mul__(self, scalar):
        pass

    def __rmul__(self, scalar):
        pass

    def __truediv__(self, scalar):
        """Defines what / means for Vector / number."""
        pass

    def __eq__(self, other):
        """Two vectors are equal if all components match."""
        pass

    def magnitude(self):
        pass

    def normalize(self):
        pass

    def __repr__(self):
        return f"Vector{self.components}"

# --- tests: do not modify ---
a = Vector([3, 4])
b = Vector([1, 1])
assert a + b == Vector([4, 5])
assert a - b == Vector([2, 3])
assert 2 * a == Vector([6, 8])
assert a * 2 == Vector([6, 8])
assert a / 2 == Vector([1.5, 2.0])
assert math.isclose(a.magnitude(), 5.0)
n = a.normalize()
assert math.isclose(n.magnitude(), 1.0, abs_tol=1e-9)
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — N-dimensional distance**

```python
import numpy as np

def euclidean_distance(p1, p2):
    """Distance between two points of any equal dimension, as NumPy arrays."""
    pass

def nearest_neighbor(query_point, candidates):
    """
    Given a query point and a list of candidate points (all same
    dimension), return the index of the closest candidate.
    """
    pass

# --- tests: do not modify ---
p1 = np.array([0, 0, 0])
p2 = np.array([3, 4, 0])
assert math.isclose(euclidean_distance(p1, p2), 5.0)

candidates = [np.array([10,10,10]), np.array([1,1,1]), np.array([5,5,5])]
query = np.array([0,0,0])
assert nearest_neighbor(query, candidates) == 1
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — CNC move cost estimator**

```python
import numpy as np

def move_cost(state1, state2, linear_weight=1.0, rotary_weight=1.0):
    """
    Estimate a 5-axis move's 'cost' by computing separate magnitudes
    for the linear (first 3) and rotary (last 2) components, then
    combining them with the given weights:
    cost = linear_weight * ||linear_displacement|| + rotary_weight * ||rotary_displacement||
    """
    pass

# --- tests: do not modify ---
s1 = np.array([0, 0, 0, 0, 0])
s2 = np.array([3, 4, 0, 30, 40])
cost = move_cost(s1, s2, linear_weight=1.0, rotary_weight=0.1)
# linear part: ||(3,4,0)|| = 5, rotary part: ||(30,40)|| = 50
assert math.isclose(cost, 1.0*5 + 0.1*50, rel_tol=1e-9)
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Prove the **triangle inequality** for vectors:
$\|\mathbf{u}+\mathbf{v}\| \le \|\mathbf{u}\| + \|\mathbf{v}\|$, for
2D vectors, using the Law of Cosines (Lesson 2.7) applied to the
triangle formed by $\mathbf{u}$, $\mathbf{v}$, and $\mathbf{u}+
\mathbf{v}$.

<details><summary>Answer</summary>
Place $\mathbf u$ and $\mathbf v$ tip-to-tail; the third side of the
resulting triangle is $\mathbf u+\mathbf v$. By the Law of Cosines,
$$\|\mathbf u+\mathbf v\|^2 = \|\mathbf u\|^2+\|\mathbf v\|^2 - 2\|\mathbf u\|\|\mathbf v\|\cos(\pi-\theta)$$
where $\theta$ is the angle between $\mathbf u$ and $\mathbf v$ at
their shared tail (the triangle's interior angle at that vertex is
$\pi-\theta$). Since $\cos(\pi-\theta)=-\cos\theta$:
$$\|\mathbf u+\mathbf v\|^2 = \|\mathbf u\|^2+\|\mathbf v\|^2+2\|\mathbf u\|\|\mathbf v\|\cos\theta$$
Since $\cos\theta\le1$ always:
$$\|\mathbf u+\mathbf v\|^2 \le \|\mathbf u\|^2+\|\mathbf v\|^2+2\|\mathbf u\|\|\mathbf v\| = (\|\mathbf u\|+\|\mathbf v\|)^2$$
Taking square roots (both sides non-negative) gives
$\|\mathbf u+\mathbf v\|\le\|\mathbf u\|+\|\mathbf v\|$. $\blacksquare$
Geometrically: the direct path (one side of a triangle) is never
longer than going via the other two sides — true in any dimension,
though this proof used the 2D Law of Cosines specifically; the
general $\mathbb{R}^n$ proof uses the dot product (Lesson 4.2) instead.
</details>
