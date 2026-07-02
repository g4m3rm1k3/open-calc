# Stage 0, Lesson 0.6 — Functions: Input, Rule, Output

**Threads:** Math · CS  
**Estimated time:** 60–75 minutes

---

## What This Lesson Is About

A function is the single most important concept in all of mathematics.
Derivatives are functions. Matrices are functions. Probability distributions
are functions. Every program you have ever written is, in the mathematical
sense, a function. Yet most students leave school with a vague idea that
a function is "a formula like $f(x) = x^2$" — which is like saying
a car is "a thing with wheels." This lesson builds the correct definition
from the ground up: a function is a special kind of relation, a rule that
assigns to each input exactly one output. From that definition you will
derive everything else — domain, codomain, image, the graph, and the
precise condition that makes something a function rather than just a
relation. You will also learn to use **matplotlib**, Python's primary
plotting library, building up from a single line of code to a fully
labelled function graph. By the end of this lesson you can define a
function precisely, plot it, extract its image, and write code that
checks whether a set of pairs defines a valid function.

---

## Historical Context

The modern definition of a function — as a rule assigning one output to
each input — was made precise by Peter Lejeune Dirichlet in 1837.
Before Dirichlet, mathematicians assumed functions were given by formulas,
which caused confusion: is $|x|$ a function? What about a function defined
by different formulas on different intervals? Dirichlet's definition, which
requires only that each input has exactly one output and places no
restriction on the rule, settled these questions cleanly. It is the
definition used in every branch of mathematics today.

---

## What You Need To Know First

- **Ordered pairs and Cartesian products** — Lesson 0.4.
  A function is defined as a set of ordered pairs satisfying a specific
  condition.
- **Relations** — Lesson 0.5.
  A function is a relation with a restriction: each input appears in
  at most one pair.
- **Sets and membership** — Lesson 0.1.
  Domain, codomain, and image are all sets.

---

## The Lesson

### The Problem a Function Solves

```scene
FunctionProblemScene
```

A relation can associate one input with many outputs. The pair $(2, 4)$
and the pair $(2, 7)$ can both belong to the same relation — 2 is related
to both 4 and 7. But if you are using a relation to model something like
"the square root of $x$," having $4$ map to both $2$ and $-2$ is
troublesome: ask "what is $\sqrt{4}$?" and the relation gives two answers.

A function rules this out. Every input gets exactly one output — no ambiguity,
no branching, no two answers.

---

### The Formal Definition

```scene
FunctionMachineScene
```


```quiz
{"q": "A function f: A \u2192 B assigns to every element of A:", "options": ["At least one element of B", "Exactly one element of B", "No element of B", "All elements of B"], "correct": 1, "explanation": "A function assigns exactly one output to every input."}
```


**Definition:** A **function** $f$ from a set $A$ to a set $B$, written

$$f : A \to B$$

is a relation $f \subseteq A \times B$ such that for every $a \in A$,
there exists exactly one $b \in B$ with $(a, b) \in f$.

In other words: every input appears in exactly one pair.

When $(a, b) \in f$, we write $b = f(a)$ and call $b$ the **value of $f$
at $a$**, or the **output** corresponding to input $a$.

The set $A$ is the **domain** — the set of all valid inputs.
The set $B$ is the **codomain** — the set that outputs are declared to
live in.

**Two conditions, both required:**

1. _Existence:_ every element of $A$ must appear as a first coordinate —
   every input has some output.
2. _Uniqueness:_ no element of $A$ appears in more than one pair —
   every input has at most one output.

Together: every input has **exactly one** output.

**Formal lens:** A function is a set — specifically a subset of $A \times B$
satisfying a membership condition. There is no formula, no machine, no
magic. Just ordered pairs. The notation $f(a)$ is shorthand for "the
unique $b$ such that $(a,b) \in f$."

**Geometric lens:** Plot the pairs $(a, f(a))$ in $\mathbb{R}^2$. A valid
function satisfies the **vertical line test**: every vertical line $x = a$
crosses the graph at most once. If a vertical line crosses twice, the
input $a$ has two outputs — not a function.

**Computational lens:** Every Python function is a mathematical function:
`def square(x): return x**2` defines $f : \mathbb{R} \to \mathbb{R}$
by $f(x) = x^2$. The Python interpreter enforces uniqueness automatically
— a function call always returns exactly one value.

---

### Valid and Invalid Functions

```scene
FunctionMachineScene
```

```quiz
{"q": "Which relation from {1,2} to {a,b} is NOT a function?", "options": ["{(1,a),(2,b)}", "{(1,a),(2,a)}", "{(1,a),(1,b)}", "{(1,b),(2,a)}"], "correct": 2, "explanation": "{(1,a),(1,b)} maps input 1 to two outputs. A function must give exactly one output per input."}
```


**Hand-worked example:** Which of the following relations on
$A = \{1, 2, 3\}$, $B = \{a, b, c\}$ are functions $f : A \to B$?

**Relation 1:** $\{(1,a),\ (2,b),\ (3,a)\}$

Check existence: inputs 1, 2, 3 all appear. ✓
Check uniqueness: each input appears exactly once. ✓
**Valid function.** (Note: two different inputs mapping to the same
output is fine — $f(1) = f(3) = a$. Uniqueness is a condition on
inputs, not outputs.)

**Relation 2:** $\{(1,a),\ (2,b),\ (2,c),\ (3,a)\}$

Check uniqueness: input 2 appears twice — $(2,b)$ and $(2,c)$.
**Not a function.** Input 2 has two outputs.

**Relation 3:** $\{(1,a),\ (3,b)\}$

Check existence: input 2 does not appear at all.
**Not a function from $A$ to $B$.** Input 2 has no output.
(This would be a valid function from $\{1,3\}$ to $B$, with a
different domain.)

---

### Your First Matplotlib Plot

```scene
FunctionPlotScene
```

Before building a visualisation of functions, you need to know the tool.
Matplotlib is Python's primary plotting library. We introduce it piece
by piece, starting from the minimum possible code.

**What matplotlib does:** it creates figures — images containing one or
more coordinate systems called **axes**. You add data to the axes using
methods like `plot`, `scatter`, and `annotate`, then display or save the
figure.

**The two objects you always need:**

```python
import matplotlib.pyplot as plt  # the plotting module, aliased as plt

fig, ax = plt.subplots()         # create a figure and one set of axes
```

`import matplotlib.pyplot as plt` loads matplotlib's plotting module.
The alias `plt` is a universal convention — every matplotlib tutorial
and documentation page uses it. Importing it makes available functions
like `plt.subplots()` and `plt.show()`.

`plt.subplots()` creates two objects at once and returns them as a pair:

- `fig` — the **figure**: the entire image, like a blank canvas.
- `ax` — the **axes**: the coordinate system inside the figure where
  data is drawn. (Despite the name, one "axes" object represents
  a single plot with both an $x$-axis and a $y$-axis.)

`fig, ax = plt.subplots()` is **tuple unpacking** — Python assigns the
first returned object to `fig` and the second to `ax` in one line,
exactly like how $A \times B$ gives pairs $(a, b)$ with the first and
second components named.

```python
import matplotlib.pyplot as plt

fig, ax = plt.subplots()        # one figure, one set of axes

ax.plot([1, 2, 3], [1, 4, 9])  # draw a line through these (x, y) points

plt.show()                      # display the figure
```

**Walkthrough:** `ax.plot([1, 2, 3], [1, 4, 9])` draws a line connecting
the points $(1,1)$, $(2,4)$, $(3,9)$ — the values of $f(x) = x^2$ at
$x = 1, 2, 3$. The first list is the $x$-coordinates; the second list is
the $y$-coordinates. Matplotlib connects them in order with a line.
`plt.show()` renders and displays the figure. In a notebook or inline
renderer, this appears immediately below the cell.

Run this. You should see a simple curve through three points. It looks
rough because we only gave it three points to connect. The next block fixes this.

---

### Plotting a Function Properly With numpy

```scene
FunctionPlotScene
```


To get a smooth curve, we need many input values close together. **numpy**
(Numerical Python) is the library for numerical arrays in Python. We
introduce one function from it now:

```python
import numpy as np

x_values = np.linspace(-3, 3, 200)
print(x_values[:5])   # first 5 values
print(x_values[-5:])  # last 5 values
print(len(x_values))  # total count
```

**Walkthrough:** `import numpy as np` loads numpy under the alias `np` —
again a universal convention. `np.linspace(start, stop, num)` returns an
array of `num` evenly spaced values from `start` to `stop` inclusive.
`np.linspace(-3, 3, 200)` gives 200 values from $-3$ to $3$: $-3.000,\
-2.970,\ -2.940,\ \ldots,\ 2.970,\ 3.000$. The spacing between adjacent
values is $\frac{3-(-3)}{199} \approx 0.030$.

`x_values[:5]` uses Python's **slice notation**: starting from index 0,
take elements up to (not including) index 5. `x_values[-5:]` takes
the last 5 elements — negative indices count from the end.

**Why numpy arrays instead of lists?** `x_values ** 2` computes the square
of every element simultaneously — you cannot write `[1,2,3] ** 2` in
plain Python (it raises an error), but numpy arrays support mathematical
operations element-by-element. This makes plotting functions concise and fast.

```python
import matplotlib.pyplot as plt
import numpy as np

# 200 evenly-spaced x values from -3 to 3
x_values = np.linspace(-3, 3, 200)

# Apply f(x) = x² to every x value at once
y_values = x_values ** 2

fig, ax = plt.subplots(figsize=(7, 5))
# figsize=(width, height) sets the figure size in inches

ax.plot(x_values, y_values, color='#2980b9', linewidth=2)
# color sets the line color (hex code or name)
# linewidth sets the thickness in points

# Draw the coordinate axes through the origin
ax.axhline(0, color='#333333', linewidth=0.8)  # horizontal line at y=0
ax.axvline(0, color='#333333', linewidth=0.8)  # vertical line at x=0

# Labels and title — LaTeX notation works inside $...$
ax.set_xlabel('$x$', fontsize=12)
ax.set_ylabel('$y$', fontsize=12)
ax.set_title('Graph of $f(x) = x^2$', fontsize=13)

ax.grid(True, alpha=0.3)
# grid(True) adds a background grid; alpha=0.3 makes it 30% opaque (faint)

plt.tight_layout()  # adjusts spacing so labels don't get cut off
plt.show()
```

**Walkthrough:** `figsize=(7, 5)` makes the figure 7 inches wide by 5 inches
tall. `ax.plot(x_values, y_values)` now draws 200 connected points instead
of 3 — the curve looks smooth. `ax.axhline(0)` draws a horizontal line
across the full width at $y = 0$; `ax.axvline(0)` draws a vertical line
at $x = 0$ — together these are the coordinate axes. `ax.set_xlabel('$x$')`
labels the horizontal axis; the `$...$` syntax renders the label as LaTeX.
`ax.grid(True, alpha=0.3)` adds faint grid lines. `plt.tight_layout()`
is a housekeeping call that prevents axis labels from being clipped by
the figure boundary — always include it.

---

### Domain, Codomain, and Image

```scene
DomainCodomainScene
```

```quiz
{"q": "The image (range) of f: A \u2192 B is:", "options": ["All of B", "All of A", "The subset of B that f actually maps to", "The domain of f"], "correct": 2, "explanation": "The image is {f(a) : a \u2208 A} \u2014 only those elements of B actually hit by some input."}
```


We now have the vocabulary to be precise about what a function's inputs
and outputs can be.

**Definition:** For a function $f : A \to B$:

- The **domain** of $f$ is $A$ — the set of all valid inputs.
- The **codomain** of $f$ is $B$ — the set that outputs are declared to live in.
- The **image** (or **range**) of $f$ is the set of outputs actually produced:

$$\text{image}(f) = \{f(a) : a \in A\} = \{b \in B : b = f(a) \text{ for some } a \in A\}$$

**The codomain and image are different things.** The codomain is declared
in advance — it is part of the specification of the function. The image
is what actually gets used. For $f : \mathbb{R} \to \mathbb{R}$ defined
by $f(x) = x^2$, the codomain is all of $\mathbb{R}$ (including negative
numbers), but the image is $[0, \infty)$ — squares are never negative.
The image is always a subset of the codomain: $\text{image}(f) \subseteq B$.

**Hand-worked example:** Let $A = \{-2, -1, 0, 1, 2\}$ and
$f : A \to \mathbb{Z}$ be defined by $f(x) = x^2$.

Find the image of $f$.

Compute $f$ at each input:

$$f(-2) = 4,\quad f(-1) = 1,\quad f(0) = 0,\quad f(1) = 1,\quad f(2) = 4$$

Collect the outputs, removing duplicates (it's a set):

$$\text{image}(f) = \{0, 1, 4\}$$

The codomain is $\mathbb{Z}$ (all integers), but the image is only
$\{0, 1, 4\}$ — just three values, not all integers.

```python
import matplotlib.pyplot as plt
import numpy as np

def f(x):
    return x ** 2

domain = [-2, -1, 0, 1, 2]

# Compute all output values
output_values = [f(x) for x in domain]
print("Input  → Output")
for x, y in zip(domain, output_values):
    print(f"  f({x:2d}) = {y}")

# The image is the SET of outputs — duplicates removed
image = set(output_values)
print(f"\nimage(f) = {sorted(image)}")
print(f"Codomain is ℤ (all integers); image is only {sorted(image)}")

# Visualise
fig, ax = plt.subplots(figsize=(7, 5))

# Smooth curve for context
x_smooth = np.linspace(-2.5, 2.5, 200)
ax.plot(x_smooth, x_smooth**2, color='#cccccc', linewidth=1.5,
        linestyle='--', label='$f(x)=x^2$ (full curve)')

# The actual domain points
ax.scatter(domain, output_values, color='#2980b9', s=100, zorder=5,
           label='$(x,\\ f(x))$ for $x \\in A$')

# Label each point
for x, y in zip(domain, output_values):
    ax.annotate(f'$({x},\\ {y})$', (x, y),
                textcoords='offset points', xytext=(6, 6), fontsize=10)

# Mark the image values on the y-axis
for y_val in sorted(image):
    ax.plot(0, y_val, '<', color='#e74c3c', markersize=8, zorder=6)
    ax.text(-0.15, y_val, f'${y_val}$', ha='right', va='center',
            fontsize=10, color='#e74c3c')

ax.axhline(0, color='#333', linewidth=0.8)
ax.axvline(0, color='#333', linewidth=0.8)
ax.set_xlabel('$x$ (domain $A$)', fontsize=11)
ax.set_ylabel('$y$ (codomain $\\mathbb{Z}$)', fontsize=11)
ax.set_title('$f(x) = x^2$ on $A = \\{-2,-1,0,1,2\\}$\n'
             'Red markers show the image $= \\{0, 1, 4\\}$', fontsize=12)
ax.legend(fontsize=10)
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `[f(x) for x in domain]` is a list comprehension — it
applies `f` to every element of `domain` and collects the results in order.
`zip(domain, output_values)` pairs each input with its output so we can
print them together; `zip` takes two sequences and produces pairs
`(domain[0], output_values[0])`, `(domain[1], output_values[1])`, and so on.
`set(output_values)` removes duplicates, giving the image.

`ax.scatter(x_list, y_list, s=100)` plots individual points rather than
connecting them with a line — `s=100` sets the marker size. `zorder=5`
draws these points on top of the dashed curve (which has default `zorder`).
`ax.plot(0, y_val, '<')` draws a left-pointing triangle marker at the
position $(0, y_\text{val})$ on the $y$-axis, highlighting the image values.
`ax.text(x, y, 'text', ha='right')` places text at coordinates $(x,y)$;
`ha='right'` means the text is right-aligned at that position.

---

### The Vertical Line Test

```scene
FunctionPlotScene
```


```quiz
{"q": "A graph represents a function of x if:", "options": ["It passes the horizontal line test", "No vertical line crosses it more than once", "It is a straight line", "It passes through the origin"], "correct": 1, "explanation": "Vertical line test: if any vertical line crosses the graph at more than one point, there would be two outputs for one input."}
```


The geometric version of the function definition:

**A set of points in $\mathbb{R}^2$ is the graph of a function $f : \mathbb{R} \to \mathbb{R}$
if and only if every vertical line $x = c$ intersects the graph at most once.**

If a vertical line hits the graph twice, that $x$-value has two $y$-values
— violating uniqueness.

```python
import matplotlib.pyplot as plt
import numpy as np

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# --- Left: a valid function f(x) = x² ---
ax = axes[0]
x = np.linspace(-2.5, 2.5, 200)
ax.plot(x, x**2, color='#2980b9', linewidth=2, label='$y = x^2$')

# Vertical test line at x = 1.5
ax.axvline(1.5, color='#27ae60', linewidth=1.5, linestyle='--',
           label='$x = 1.5$')
ax.scatter([1.5], [1.5**2], color='#27ae60', s=100, zorder=5)
ax.annotate(f'One intersection\n$(1.5,\\ {1.5**2:.2f})$',
            (1.5, 1.5**2), xytext=(0.3, 3.5),
            arrowprops=dict(arrowstyle='->', color='#27ae60'),
            fontsize=10, color='#27ae60')

ax.axhline(0, color='#333', linewidth=0.8)
ax.axvline(0, color='#333', linewidth=0.8)
ax.set_title('$f(x) = x^2$ — passes vertical line test\n✓ Is a function',
             fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
ax.legend(fontsize=10); ax.grid(True, alpha=0.3)
ax.set_xlim(-3, 3); ax.set_ylim(-1, 7)

# --- Right: a circle x² + y² = 4 — NOT a function ---
ax = axes[1]
theta = np.linspace(0, 2*np.pi, 300)
circle_x = 2 * np.cos(theta)
circle_y = 2 * np.sin(theta)
ax.plot(circle_x, circle_y, color='#e74c3c', linewidth=2,
        label='$x^2 + y^2 = 4$')

# Vertical test line at x = 1
ax.axvline(1, color='#e67e22', linewidth=1.5, linestyle='--',
           label='$x = 1$')
y_intersects = [np.sqrt(3), -np.sqrt(3)]
ax.scatter([1, 1], y_intersects, color='#e67e22', s=100, zorder=5)
ax.annotate(f'Two intersections!\n$(1,\\ +\\sqrt{{3}})$ and $(1,\\ -\\sqrt{{3}})$',
            (1, 0), xytext=(1.2, 0.3),
            fontsize=10, color='#e67e22')

ax.axhline(0, color='#333', linewidth=0.8)
ax.axvline(0, color='#333', linewidth=0.8)
ax.set_title('Circle $x^2+y^2=4$ — fails vertical line test\n✗ Not a function',
             fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
ax.set_aspect('equal')
ax.legend(fontsize=10); ax.grid(True, alpha=0.3)
ax.set_xlim(-3, 3); ax.set_ylim(-3, 3)

plt.tight_layout()
plt.show()
```

**Walkthrough:** `np.linspace(0, 2*np.pi, 300)` generates 300 angles
from $0$ to $2\pi$ — the full circle. `np.cos(theta)` and `np.sin(theta)`
apply cosine and sine element-by-element to the array, giving the
$x$ and $y$ coordinates of the circle: $x = 2\cos\theta$,
$y = 2\sin\theta$ traces $x^2 + y^2 = 4$. `np.sqrt(3)` computes
$\sqrt{3}$ — the $y$-coordinate where $x = 1$ meets the circle
($1^2 + y^2 = 4 \Rightarrow y = \pm\sqrt{3}$). `plt.subplots(1, 2)`
creates one row and two columns of axes, returned as the array `axes`;
`axes[0]` and `axes[1]` access the left and right plots.

---

## Connect the Pieces

**What this lesson built on:** Relations (Lesson 0.5) — a function
is a relation with the uniqueness condition. Ordered pairs (Lesson 0.4)
— a function is a set of ordered pairs. Sets (Lesson 0.1) — domain,
codomain, and image are all sets.

**What this lesson makes possible:** Lesson 0.7 (Types of Functions —
Injective, Surjective, Bijective) classifies functions by how their
inputs and outputs relate. After that, Lesson 0.8 defines composition
and inverse — which require bijective functions to work properly.
Every concept in calculus (Stage 5) is a function: a derivative takes
a function and returns a function. Every linear transformation in Stage 4
is a function from $\mathbb{R}^n$ to $\mathbb{R}^m$.

**In computer science:** A pure function in the programming sense is
exactly a mathematical function — same input always produces same output,
no side effects. Referential transparency (a property of functional
programming languages) is the requirement that functions be mathematical
functions. Hash maps implement functions from keys to values.

---

## Summary

**Function:** $f : A \to B$ is a relation $f \subseteq A \times B$
where every element of $A$ appears as a first coordinate exactly once.
Notation: $b = f(a)$ means $(a,b) \in f$.

**Domain:** $A$ — the set of valid inputs.

**Codomain:** $B$ — the declared set of outputs.

**Image:** $\text{image}(f) = \{f(a) : a \in A\} \subseteq B$
— outputs actually produced. Always a subset of the codomain.

**Vertical line test:** A curve in $\mathbb{R}^2$ is the graph of a
function iff every vertical line crosses it at most once.

**New Python tools introduced:**

- `import matplotlib.pyplot as plt` — load matplotlib
- `import numpy as np` — load numpy
- `fig, ax = plt.subplots(figsize=(w,h))` — create figure and axes
- `ax.plot(x_list, y_list)` — draw a line through points
- `ax.scatter(x_list, y_list, s=size)` — draw individual points
- `ax.axhline(y)`, `ax.axvline(x)` — horizontal/vertical lines
- `ax.set_xlabel()`, `ax.set_ylabel()`, `ax.set_title()` — labels
- `ax.grid(True, alpha=a)` — background grid
- `plt.tight_layout()`, `plt.show()` — finalise and display
- `np.linspace(start, stop, n)` — $n$ evenly spaced values
- `np.cos()`, `np.sin()`, `np.sqrt()` — element-wise math on arrays

---

## Problems

### Math

**1.** For each relation on $A = \{1,2,3,4\}$, $B = \{p,q,r\}$, state
whether it defines a function $f : A \to B$. If not, state which condition
(existence or uniqueness) fails and for which input.

(a) $\{(1,p),\ (2,q),\ (3,r),\ (4,p)\}$

(b) $\{(1,p),\ (2,p),\ (3,q)\}$

(c) $\{(1,p),\ (2,q),\ (2,r),\ (3,p),\ (4,q)\}$

(d) $\{(1,p),\ (2,q),\ (3,r),\ (4,q),\ (3,p)\}$

**2.** Let $f : \mathbb{R} \to \mathbb{R}$ be defined by $f(x) = x^2 - 3x$.

(a) Compute $f(0)$, $f(1)$, $f(3)$, $f(-1)$.

(b) Find all $x$ such that $f(x) = 0$. _(Hint: factorise.)_

(c) Find the image of $f$ restricted to the domain $\{0, 1, 2, 3\}$.

**3.** (Proof) Prove that the image of $f : A \to B$ is always a subset
of the codomain: $\text{image}(f) \subseteq B$.

---

### Code Challenges

**Challenge 1 — Is it a valid function?**

A function is represented as a list of `(input, output)` tuples.
Implement `is_valid_function` which returns `True` if the list represents
a valid function (each input appears exactly once), `False` otherwise.

```python
def is_valid_function(pairs):
    """
    Return True if pairs represents a valid function.
    A function requires each input (first element) to appear exactly once.

    pairs: list of (input, output) tuples
    """
    pass  # your code here


# --- tests: do not modify ---
assert is_valid_function([(1,'a'),(2,'b'),(3,'c')])       == True,  "Basic valid function"
assert is_valid_function([(1,'a'),(1,'b'),(2,'c')])       == False, "Input 1 appears twice"
assert is_valid_function([])                               == True,  "Empty function is valid"
assert is_valid_function([(1,'a'),(2,'a'),(3,'a')])       == True,  "Same output is fine"
assert is_valid_function([(1,'a'),(2,'b'),(2,'b')])       == False, "Duplicate pair still invalid"
print("✓ Challenge 1 passed!")
```

**Challenge 2 — Compute the image**

Given a Python function `f` and a list of domain values, compute the
image — the set of all output values.

```python
def compute_image(f, domain):
    """
    Return the image of function f over the given domain.

    f:      a Python function (callable)
    domain: a list of input values
    Returns: a set of output values
    """
    pass  # your code here


# --- tests: do not modify ---
assert compute_image(lambda x: x**2,  [-2,-1,0,1,2])  == {0, 1, 4},     "Squares"
assert compute_image(lambda x: x + 1, [0, 1, 2])       == {1, 2, 3},     "Shift"
assert compute_image(lambda x: 0,     [1, 2, 3])        == {0},           "Constant function"
assert compute_image(lambda x: x,     [1, 2, 3])        == {1, 2, 3},     "Identity"
assert compute_image(lambda x: x**2,  [])               == set(),         "Empty domain"
print("✓ Challenge 2 passed!")
```

**Challenge 3 — Build a function from pairs**

Given a list of `(input, output)` pairs representing a valid function,
implement `apply_function` that looks up the output for a given input.
If the input is not in the domain, raise a `ValueError`.

```python
def apply_function(pairs, input_value):
    """
    Given a function represented as (input, output) pairs,
    return the output for input_value.
    Raise ValueError if input_value is not in the domain.

    pairs:       list of (input, output) tuples
    input_value: the input to look up
    """
    pass  # your code here


# --- tests: do not modify ---
pairs = [(1, 'a'), (2, 'b'), (3, 'a'), (4, 'c')]
assert apply_function(pairs, 1) == 'a', "Input 1 → 'a'"
assert apply_function(pairs, 2) == 'b', "Input 2 → 'b'"
assert apply_function(pairs, 3) == 'a', "Input 3 → 'a'"
assert apply_function(pairs, 4) == 'c', "Input 4 → 'c'"

try:
    apply_function(pairs, 5)
    assert False, "Should have raised ValueError for input 5"
except ValueError:
    pass  # correct — 5 is not in the domain

print("✓ Challenge 3 passed!")
```

**Challenge 4 — Plot your own function**

Using the matplotlib tools introduced in this lesson, plot the function
$f(x) = x^3 - 3x$ on the domain $[-2.5, 2.5]$. Your plot must include:

- A smooth curve with at least 200 points
- The coordinate axes through the origin
- A title with the function's formula in LaTeX
- $x$ and $y$ axis labels
- A grid

```python
import matplotlib.pyplot as plt
import numpy as np

# Your code here — build the plot from scratch
# using only the tools introduced in this lesson.
# Target: f(x) = x³ - 3x on [-2.5, 2.5]
```

There is no automated test for this one — the visual output is the result.
Compare your plot to what you expect: $f$ should cross the $x$-axis at
$x = 0$, $x = \sqrt{3} \approx 1.73$, and $x = -\sqrt{3} \approx -1.73$.
Can you see those crossings?

---

### Extension

**5. ★** A function $f : A \to B$ and a set $S \subseteq A$ determine a
smaller function $f|_S : S \to B$ called the **restriction** of $f$ to $S$,
defined by the same rule but with a smaller domain.

Implement `restrict` which takes a list of `(input, output)` pairs and a
set `S`, and returns only the pairs whose input is in `S`.

```python
def restrict(pairs, S):
    """
    Return the restriction of the function (given as pairs) to domain S.
    Only keep pairs whose input is in S.
    """
    pass  # your code here


# --- tests: do not modify ---
all_pairs = [(1,'a'),(2,'b'),(3,'c'),(4,'d')]
assert restrict(all_pairs, {1, 3})    == [(1,'a'),(3,'c')], "Restrict to {1,3}"
assert restrict(all_pairs, {2})       == [(2,'b')],         "Restrict to {2}"
assert restrict(all_pairs, set())     == [],                 "Restrict to empty set"
assert restrict(all_pairs, {1,2,3,4}) == all_pairs,         "Restrict to full domain"
print("✓ Extension 5 passed!")
```

**6. ★** The **preimage** (or **inverse image**) of a set $T \subseteq B$
under $f : A \to B$ is:

$$f^{-1}(T) = \{a \in A : f(a) \in T\}$$

This is the set of all inputs that map into $T$. Note: this does not
require $f$ to be invertible — $f^{-1}(T)$ is defined for any function.

(a) Let $f : \mathbb{R} \to \mathbb{R}$, $f(x) = x^2$.
Find $f^{-1}(\{0, 1, 4\})$ and $f^{-1}(\{-1\})$.

(b) Implement `preimage` for functions given as pairs:

```python
def preimage(pairs, T):
    """
    Return the preimage of set T under the function given as pairs.
    That is, all inputs a such that f(a) is in T.

    pairs: list of (input, output) tuples
    T:     a set of output values
    """
    pass  # your code here


# --- tests: do not modify ---
pairs = [(1,1),(2,4),(3,9),(4,16),(5,25),(-1,1),(-2,4)]
assert preimage(pairs, {1})         == {1, -1},        "Preimage of {1}"
assert preimage(pairs, {4})         == {2, -2},        "Preimage of {4}"
assert preimage(pairs, {1, 4})      == {1, -1, 2, -2}, "Preimage of {1,4}"
assert preimage(pairs, {7})         == set(),          "Preimage of value not in image"
print("✓ Extension 6 passed!")
```
