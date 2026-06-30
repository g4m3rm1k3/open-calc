# Stage 0, Lesson 0.8 — Composition and Inverse Functions

**Threads:** Math · CS  
**Estimated time:** 60–75 minutes

---

## What This Lesson Is About

Functions rarely work alone.A CNC toolpath applies a tool offset, then
a fixture offset, then a workpiece offset — three functions chained
together, each one's output feeding the next one's input. A program
parses text, then evaluates it, then formats the result — a pipeline of
functions. This lesson formalises that chaining as **composition**, and
then asks the natural follow-up question: when can a chain of functions
be undone? The answer is the **inverse function**, which exists precisely
when a function is bijective — the property established in Lesson 0.7.
By the end of this lesson you will be able to compose functions
precisely, prove when composition is and is not commutative, construct
inverses by hand, and understand the geometric fact that a function and
its inverse are mirror images of each other across the line $y = x$.

---

## Historical Context

The notation $f \circ g$ for composition was introduced gradually through
the 19th century as mathematicians formalised function theory. The
deeper idea — that complex processes are built from simpler ones chained
together — is much older and is the foundation of the modern theory of
computation. Alan Turing's 1936 paper on computability builds every
computable function from a small set of primitive operations, combined
through composition. Every programming language's ability to call one
function from inside another is a direct implementation of this 19th-century
mathematical idea.

---

## What You Need To Know First

- **Functions** — Lesson 0.6. $f: A \to B$ assigns each input exactly
  one output.
- **Injective, surjective, bijective** — Lesson 0.7. A function has an
  inverse if and only if it is bijective.
- **matplotlib basics** — Lesson 0.6: `plt.subplots`, `ax.plot`,
  `ax.set_title`. Lesson 0.7: `ax.fill_between`, `axes.flat`.

---

## The Lesson

### Chaining Functions: Composition

**The problem:** Given $f: B \to C$ and $g: A \to B$, we want to build
a single function $A \to C$ that applies $g$ first, then $f$.

Notice the requirement: the **codomain of $g$ must match the domain of
$f$** — the output of $g$ has to be a valid input for $f$, or the chain
breaks.

**Definition:** Given $g: A \to B$ and $f: B \to C$, the **composition**
of $f$ and $g$, written $f \circ g$, is the function

$$f \circ g : A \to C, \qquad (f \circ g)(x) = f(g(x))$$

Read $f \circ g$ as "$f$ after $g$," or "$f$ composed with $g$."
The order is read right to left: in $f(g(x))$, $g$ acts first, then $f$
acts on the result.

**Formal lens:** $f \circ g$ is itself a function — it satisfies the
definition from Lesson 0.6 because applying $g$ then $f$ produces exactly
one output for every input in $A$. The domain of $f \circ g$ is the
domain of $g$; the codomain of $f \circ g$ is the codomain of $f$.

**Geometric lens:** picture two machines on a conveyor belt. A part goes
into machine $g$ first, comes out transformed, then goes into machine
$f$. The composed machine $f \circ g$ is the whole belt, treated as a
single process — feed in a part, get out the doubly-transformed result.

**Computational lens:** every chained function call in code is composition.
`f(g(x))` in Python is literally $f \circ g$ applied to $x$. A Unix pipe
`cat file.txt | grep "error" | wc -l` is a composition of three functions
on streams of text.

**Hand-worked example:** Let $g(x) = x + 1$ and $f(x) = 2x$, both
functions $\mathbb{R} \to \mathbb{R}$. Compute $(f \circ g)(3)$.

$$(f \circ g)(3) = f(g(3)) = f(3+1) = f(4) = 2 \times 4 = 8$$

We first apply $g$ to 3, getting 4. Then we apply $f$ to that result, getting 8.

**Find a general formula for $f \circ g$:**

$$(f \circ g)(x) = f(g(x)) = f(x+1) = 2(x+1) = 2x + 2$$

**Verify** by plugging in $x=3$ again using the formula: $2(3)+2 = 8$. ✓ Matches.

---

### Composition Is Not Commutative

A natural question: does it matter which function goes first?
Compute $g \circ f$ using the same two functions and compare.

$$(g \circ f)(x) = g(f(x)) = g(2x) = 2x + 1$$

Compare: $(f \circ g)(x) = 2x+2$ but $(g \circ f)(x) = 2x+1$.
These are different functions — $f \circ g \neq g \circ f$ in general.

```python
# --- new code: every line explained ---

def double(x):
    return 2 * x

def add_one(x):
    return x + 1

def compose(f, g):
    # compose(f, g) returns a NEW function: the one you get by
    # applying g first, then f, to whatever input it's given.
    # 'lambda x: f(g(x))' builds that function without giving it a name —
    # lambda syntax means "a function of x that returns f(g(x))".
    return lambda x: f(g(x))

f_after_g = compose(double, add_one)   # represents f∘g: double(add_one(x))
g_after_f = compose(add_one, double)   # represents g∘f: add_one(double(x))

print("g(x) = x+1,  f(x) = 2x")
print(f"(f∘g)(3) = f(g(3)) = {f_after_g(3)}")   # expect 8
print(f"(g∘f)(3) = g(f(3)) = {g_after_f(3)}")   # expect 7
print(f"Equal? {f_after_g(3) == g_after_f(3)}")  # expect False
```

**Walkthrough:** `compose(f, g)` is a **higher-order function** — a
function that takes other functions as input and returns a new function
as output. This is the first higher-order function in the curriculum.
The returned `lambda x: f(g(x))` is itself a function; calling
`f_after_g(3)` runs that lambda with `x=3`, which computes `f(g(3))`.
The printed results, 8 and 7, confirm $f \circ g \neq g \circ f$
numerically, matching the hand-worked algebra above.

```python
# --- new code ---
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(-2, 2, 300)   # 300 points from -2 to 2, for smooth curves

fig, axes = plt.subplots(1, 3, figsize=(14, 5))
# 1 row, 3 columns: step 1, step 2, and the combined comparison

# --- Panel 1: g(x) = x+1 alone ---
axes[0].plot(x, x + 1, color='#2980b9', linewidth=2.5)
axes[0].axhline(0, color='#333', lw=0.8)  # x-axis
axes[0].axvline(0, color='#333', lw=0.8)  # y-axis
axes[0].set_title('Step 1: $g(x) = x+1$', fontsize=11)
axes[0].set_xlabel('$x$'); axes[0].set_ylabel('$g(x)$')
axes[0].grid(True, alpha=0.3)

# --- Panel 2: f(x) = 2x alone ---
axes[1].plot(x, 2 * x, color='#27ae60', linewidth=2.5)
axes[1].axhline(0, color='#333', lw=0.8)
axes[1].axvline(0, color='#333', lw=0.8)
axes[1].set_title('Step 2: $f(x) = 2x$', fontsize=11)
axes[1].set_xlabel('$x$'); axes[1].set_ylabel('$f(x)$')
axes[1].grid(True, alpha=0.3)

# --- Panel 3: both compositions, to compare directly ---
axes[2].plot(x, 2*(x + 1), color='#8e44ad', linewidth=2.5,
             label=r'$(f \circ g)(x) = 2(x+1)$')
axes[2].plot(x, 2*x + 1, color='#e74c3c', linewidth=2, linestyle='--',
             label=r'$(g \circ f)(x) = 2x+1$')
axes[2].axhline(0, color='#333', lw=0.8)
axes[2].axvline(0, color='#333', lw=0.8)
axes[2].set_title(r'$f \circ g \neq g \circ f$', fontsize=11)
axes[2].set_xlabel('$x$'); axes[2].set_ylabel('$y$')
axes[2].legend(fontsize=10)
axes[2].grid(True, alpha=0.3)

plt.suptitle('Composition is not commutative', fontsize=13, y=1.02)
plt.tight_layout()
plt.show()
```

**Walkthrough:** The two curves in the third panel are parallel lines
with the same slope (2) but different $y$-intercepts (2 versus 1) —
visually confirming the two compositions are different functions, not
just different formulas for the same thing. This matters in practice:
in CNC machining, applying a rotation then a translation gives a
different result than applying the translation then the rotation —
the same non-commutativity, with real physical consequences.

---

### Composition Is Associative

While composition is not commutative, it is **associative**: grouping
does not matter, only order.

**Claim:** $(f \circ g) \circ h = f \circ (g \circ h)$, for any functions
$h: A \to B$, $g: B \to C$, $f: C \to D$.

_Proof._ We show both sides give the same output for an arbitrary $x \in A$.

$$\big((f \circ g) \circ h\big)(x) = (f \circ g)(h(x)) = f\big(g(h(x))\big)$$

$$\big(f \circ (g \circ h)\big)(x) = f\big((g \circ h)(x)\big) = f\big(g(h(x))\big)$$

Both sides equal $f(g(h(x)))$ for every $x$, so the two functions are
equal. $\blacksquare$

This means a chain of three or more functions can be written without
parentheses: $f \circ g \circ h$ is unambiguous.

---

### The Identity Function

There is one special function that does nothing — it returns its input
unchanged.

**Definition:** The **identity function** on a set $A$, written
$\text{id}_A$, is defined by $\text{id}_A(x) = x$ for every $x \in A$.

The identity function is to composition what $0$ is to addition, or $1$
is to multiplication: composing with it changes nothing.

**Claim:** For any $f: A \to B$, $f \circ \text{id}_A = f$ and
$\text{id}_B \circ f = f$.

_Proof._ $(f \circ \text{id}_A)(x) = f(\text{id}_A(x)) = f(x)$ for every
$x \in A$, so $f \circ \text{id}_A = f$. Similarly,
$(\text{id}_B \circ f)(x) = \text{id}_B(f(x)) = f(x)$, so
$\text{id}_B \circ f = f$. $\blacksquare$

---

### Inverse Functions, Properly Defined

Lesson 0.7 introduced the inverse informally. With composition and the
identity function now defined, we can state the definition precisely.

**Definition:** Let $f: A \to B$ be bijective. The **inverse function**
$f^{-1}: B \to A$ is the unique function satisfying:

$$f^{-1} \circ f = \text{id}_A \qquad \text{and} \qquad f \circ f^{-1} = \text{id}_B$$

In words: applying $f$ then $f^{-1}$ returns you to where you started in
$A$; applying $f^{-1}$ then $f$ returns you to where you started in $B$.

**Why bijectivity is required:** $f^{-1}$ needs to be a function from $B$
to $A$. For $f^{-1}(b)$ to be well-defined, every $b \in B$ needs exactly
one $a \in A$ with $f(a) = b$ — which is precisely the statement that $f$
is bijective (Lesson 0.7: surjective gives existence, injective gives
uniqueness).

**Hand-worked example:** Let $f(x) = 2x + 1$. We showed in Lesson 0.7
that $f$ is bijective and that $f^{-1}(y) = \frac{y-1}{2}$.
Verify the two composition identities.

$$\big(f^{-1} \circ f\big)(x) = f^{-1}(f(x)) = f^{-1}(2x+1) = \frac{(2x+1)-1}{2} = \frac{2x}{2} = x = \text{id}_\mathbb{R}(x) \checkmark$$

$$\big(f \circ f^{-1}\big)(y) = f(f^{-1}(y)) = f\!\left(\frac{y-1}{2}\right) = 2 \cdot \frac{y-1}{2} + 1 = (y-1)+1 = y = \text{id}_\mathbb{R}(y) \checkmark$$

Both identities hold for every input, confirming $f^{-1}$ is correct.

```python
# --- new code ---

def f(x):
    return 2 * x + 1

def f_inverse(x):
    return (x - 1) / 2

test_inputs = [-3, -1, 0, 1, 3, 5]

print("Checking f⁻¹(f(x)) = x  and  f(f⁻¹(x)) = x  for several values:\n")
for x in test_inputs:
    forward_then_back = f_inverse(f(x))   # should always return x
    back_then_forward = f(f_inverse(x))   # should also always return x
    print(f"  x={x:3d}:  f⁻¹(f(x)) = {forward_then_back},  "
          f"f(f⁻¹(x)) = {back_then_forward}")
```

**Walkthrough:** The loop checks both composition identities across six
different test values — this is not a proof (a proof needs to hold for
_every_ input, shown algebraically above), but it is strong numerical
evidence that the algebra was done correctly, and it is exactly the kind
of check you should run after deriving an inverse by hand.

---

### The Geometric Picture: Reflection Across $y = x$

There is a beautiful geometric fact: the graph of $f^{-1}$ is the
**mirror image** of the graph of $f$, reflected across the line $y = x$.

**Why this is true:** If $(a, b)$ is a point on the graph of $f$ — meaning
$f(a) = b$ — then by definition $f^{-1}(b) = a$, so $(b, a)$ is a point on
the graph of $f^{-1}$. Swapping the coordinates of a point is exactly
the geometric operation of reflecting across $y = x$.

```python
# --- new code ---
import matplotlib.pyplot as plt
import numpy as np

x_range = np.linspace(-2, 3, 300)

fig, ax = plt.subplots(figsize=(7, 7))

# f(x) = 2x+1 and its inverse f⁻¹(x) = (x-1)/2
ax.plot(x_range, 2*x_range + 1, color='#2980b9', linewidth=2.5,
        label='$f(x) = 2x+1$')
ax.plot(x_range, (x_range - 1)/2, color='#e74c3c', linewidth=2.5,
        label='$f^{-1}(x) = \\frac{x-1}{2}$')

# The mirror line itself
ax.plot(x_range, x_range, color='#888888', linewidth=1.2, linestyle='--',
        label='$y = x$ (mirror line)')

# Demonstrate one reflected pair explicitly: f(1) = 3, so f⁻¹(3) = 1
point_on_f      = (1, 3)   # (a, f(a))
point_on_f_inv  = (3, 1)   # (f(a), a) -- coordinates swapped

ax.scatter(*point_on_f,     color='#27ae60', s=90, zorder=5)
ax.scatter(*point_on_f_inv, color='#27ae60', s=90, zorder=5)
# dotted line connecting the pair, to show they are reflections of each other
ax.plot([point_on_f[0], point_on_f_inv[0]],
        [point_on_f[1], point_on_f_inv[1]],
        color='#27ae60', linewidth=1, linestyle=':')

ax.annotate('$(1, 3)$ on $f$', point_on_f, xytext=(-1.7, 2.6), fontsize=10,
            color='#27ae60')
ax.annotate('$(3, 1)$ on $f^{-1}$', point_on_f_inv, xytext=(1.4, -1.0),
            fontsize=10, color='#27ae60')

ax.set_xlim(-2, 3); ax.set_ylim(-2, 3)
ax.set_aspect('equal')   # equal scaling on both axes -- essential for
                          # a true reflection to LOOK like a reflection
ax.axhline(0, color='#333', lw=0.8)
ax.axvline(0, color='#333', lw=0.8)
ax.set_title('$f$ and $f^{-1}$ are mirror images across $y=x$', fontsize=12)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
ax.legend(fontsize=10)
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `ax.scatter(*point_on_f, ...)` uses the `*` **unpacking
operator** — `point_on_f` is the tuple `(1, 3)`, and `*point_on_f` expands
it into two separate positional arguments, equivalent to writing
`ax.scatter(1, 3, ...)`. This is a new piece of syntax: `*` before a
tuple or list "splats" it into individual arguments wherever a function
expects them separately. `ax.set_aspect('equal')` forces one unit on the
$x$-axis to occupy the same screen distance as one unit on the $y$-axis
— without this, the reflection across $y=x$ would look skewed even
though it is mathematically correct, because matplotlib would otherwise
stretch the axes independently to fill the figure.

---

### Composing and Inverting: $(f \circ g)^{-1} = g^{-1} \circ f^{-1}$

A useful and non-obvious fact: the inverse of a composition reverses
the order.

**Claim:** If $f$ and $g$ are both bijective and composable, then

$$(f \circ g)^{-1} = g^{-1} \circ f^{-1}$$

**Why the order flips — intuition first:** Think of getting dressed.
$g$ = "put on socks," $f$ = "put on shoes." The composition $f \circ g$
is "put on socks, then shoes." To undo this, you cannot take off socks
first — you must take off shoes first, then socks. The inverse of
"socks then shoes" is "remove shoes, then remove socks" —
$g^{-1} \circ f^{-1}$, not $f^{-1} \circ g^{-1}$.

_Proof._ We verify $(g^{-1} \circ f^{-1})$ satisfies the defining property
of the inverse of $f \circ g$ — namely that composing it with $f \circ g$
on the right gives the identity.

$$
(f \circ g) \circ (g^{-1} \circ f^{-1}) = f \circ \big(g \circ g^{-1}\big) \circ f^{-1}
= f \circ \text{id} \circ f^{-1} = f \circ f^{-1} = \text{id}
$$

(We used associativity to regroup, then $g \circ g^{-1} = \text{id}$,
then the identity property, then $f \circ f^{-1} = \text{id}$.)
A similar computation shows $(g^{-1} \circ f^{-1}) \circ (f \circ g) = \text{id}$
as well. Since both composition identities hold, $g^{-1} \circ f^{-1}$
is exactly $(f \circ g)^{-1}$. $\blacksquare$

```python
# --- new code ---

def f(x):
    return 2 * x + 1

def f_inv(x):
    return (x - 1) / 2

def g(x):
    return x ** 3

def g_inv(x):
    # cube root that works correctly for negative numbers too --
    # Python's ** (1/3) gives wrong answers for negative bases,
    # so we handle the sign separately
    if x >= 0:
        return x ** (1/3)
    else:
        return -((-x) ** (1/3))

def f_after_g(x):
    return f(g(x))            # (f∘g)(x) = 2x³ + 1

def correct_inverse(x):
    return g_inv(f_inv(x))    # g⁻¹∘f⁻¹  -- the CORRECT inverse order

def wrong_inverse(x):
    return f_inv(g_inv(x))    # f⁻¹∘g⁻¹  -- the WRONG order, for comparison

print("f(x)=2x+1, g(x)=x³,  (f∘g)(x) = 2x³+1\n")
for x in [1, -1, 2, -2]:
    composed = f_after_g(x)
    correct  = correct_inverse(composed)
    wrong    = wrong_inverse(composed)
    print(f"  x={x:3d}:  (f∘g)(x)={composed:8.3f}   "
          f"g⁻¹∘f⁻¹ gives back {correct:6.3f}   "
          f"f⁻¹∘g⁻¹ gives back {wrong:6.3f}")
```

**Walkthrough:** For every test value, `correct_inverse` (computing
$g^{-1} \circ f^{-1}$) successfully recovers the original $x$, while
`wrong_inverse` (computing $f^{-1} \circ g^{-1}$, the order you might
guess naively) does not. This is the "socks and shoes" rule made
numerical: undoing a composed process means undoing the steps in
reverse order.

---

## Connect the Pieces

**What this lesson built on:** Functions (Lesson 0.6) define what is
being composed. Bijectivity (Lesson 0.7) is the exact condition required
for an inverse to exist as a genuine function.

**What this lesson makes possible:** Stage 1's logarithms are defined as
the inverse of exponential functions — Lesson 1.8 will use exactly the
definition built here. Stage 2's inverse trigonometric functions
($\arcsin$, $\arccos$, $\arctan$) require restricting a function's
domain to make it injective before inverting — the same technique used
in Lesson 0.7, Problem 2(c). Stage 5's **chain rule** for derivatives is
the calculus version of composition: if $h = f \circ g$, the chain rule
tells you how to differentiate $h$ in terms of the derivatives of $f$
and $g$ — composition is the entire reason the chain rule exists.

**In computer science:** Function composition is the foundation of
**functional programming** — Unix pipes, JavaScript's `.then().then()`
promise chains, and React's higher-order components are all composition.
The $(f \circ g)^{-1} = g^{-1} \circ f^{-1}$ rule appears directly in
cryptography: decrypting a message that was encrypted by applying cipher
$A$ then cipher $B$ requires undoing $B$ first, then $A$ — the same
"socks and shoes" rule.

**In engineering:** A CNC machine applies a sequence of coordinate
transformations — tool offset, then fixture offset, then workpiece
offset. To convert a measured point back to raw machine coordinates,
the transformations must be undone in reverse order, using
$(f \circ g)^{-1} = g^{-1} \circ f^{-1}$ exactly.

---

## Summary

**Composition:** given $g: A \to B$ and $f: B \to C$,
$$(f \circ g)(x) = f(g(x)), \qquad f \circ g : A \to C$$
Read right to left: $g$ acts first.

**Not commutative in general:** $f \circ g \neq g \circ f$.

**Associative:** $(f \circ g) \circ h = f \circ (g \circ h)$ —
parentheses can be omitted.

**Identity function:** $\text{id}_A(x) = x$.
$f \circ \text{id}_A = f$ and $\text{id}_B \circ f = f$.

**Inverse function:** for bijective $f: A \to B$,
$$f^{-1} \circ f = \text{id}_A \qquad f \circ f^{-1} = \text{id}_B$$

**Geometric picture:** the graph of $f^{-1}$ is the graph of $f$
reflected across $y = x$.

**Inverse of a composition:** $(f \circ g)^{-1} = g^{-1} \circ f^{-1}$
— order reverses ("socks and shoes" rule).

---

## Problems

### Math

**1.** Let $f(x) = x^2$ (domain restricted to $x \geq 0$) and $g(x) = x + 3$.

(a) Compute $(f \circ g)(x)$ and $(g \circ f)(x)$ as formulas.

(b) Evaluate both at $x = 1$ and confirm they give different results.

<details>
<summary>Answers</summary>

(a) $(f \circ g)(x) = f(x+3) = (x+3)^2$. $(g \circ f)(x) = g(x^2) = x^2+3$.

(b) $(f \circ g)(1) = 16$. $(g \circ f)(1) = 4$. Different, confirming non-commutativity.

</details>

---

**2.** Let $f(x) = 3x - 2$.

(a) Find $f^{-1}(x)$ by solving $y = 3x-2$ for $x$.

(b) Verify $f^{-1}(f(x)) = x$ algebraically.

(c) Verify $f(f^{-1}(x)) = x$ algebraically.

<details>
<summary>Hint</summary>

For (a): write $y = 3x - 2$, then isolate $x$ in terms of $y$. The result,
with $x$ and $y$ relabelled, is $f^{-1}$.

</details>

<details>
<summary>Answers</summary>

(a) $y = 3x-2 \Rightarrow x = \frac{y+2}{3}$, so $f^{-1}(x) = \frac{x+2}{3}$.

(b) $f^{-1}(f(x)) = f^{-1}(3x-2) = \frac{(3x-2)+2}{3} = \frac{3x}{3} = x$ ✓

(c) $f(f^{-1}(x)) = f\left(\frac{x+2}{3}\right) = 3 \cdot \frac{x+2}{3} - 2 = (x+2)-2 = x$ ✓

</details>

---

**3.** (Proof) Prove that if $f: A \to B$ is bijective, then $f^{-1}$ is
also bijective and $(f^{-1})^{-1} = f$.

<details>
<summary>Hint</summary>

This was essentially proved in Lesson 0.7, Problem 3 — that $f^{-1}$ is
bijective. For $(f^{-1})^{-1} = f$: use the defining property of inverses.
You need to show $f$ satisfies the two composition identities that define
the inverse of $f^{-1}$.

</details>

<details>
<summary>Answer</summary>

_Proof._ $f^{-1}$ is bijective by Lesson 0.7, Problem 3.

To show $(f^{-1})^{-1} = f$: by definition, $(f^{-1})^{-1}$ is the unique
function satisfying $(f^{-1})^{-1} \circ f^{-1} = \text{id}_B$ and
$f^{-1} \circ (f^{-1})^{-1} = \text{id}_A$. But we already know
$f \circ f^{-1} = \text{id}_B$ and $f^{-1} \circ f = \text{id}_A$ from the
definition of $f^{-1}$ as the inverse of $f$. Since the inverse is unique,
and $f$ satisfies exactly these identities, $(f^{-1})^{-1} = f$. $\blacksquare$

</details>

---

### Code Challenges

**Challenge 1 — Compose discrete functions**

Functions given as pairs (as in Lessons 0.6–0.7) can be composed directly.

```python
def compose_pairs(pairs_g, pairs_f):
    """
    Given g (as pairs) and f (as pairs), return f∘g as a list of pairs.
    The domain of the result is the domain of g.
    For each input x in g's domain: result maps x to f(g(x)).

    pairs_g: list of (input, output) tuples for g
    pairs_f: list of (input, output) tuples for f
    """
    pass  # your code here


# --- tests: do not modify ---
g = [(1, 'a'), (2, 'b'), (3, 'c')]
f = [('a', 10), ('b', 20), ('c', 30)]

result = compose_pairs(g, f)
assert set(result) == {(1, 10), (2, 20), (3, 30)}, "f∘g should chain through g then f"
assert len(result) == 3, "Result should have same domain size as g"

print("✓ Challenge 1 passed!")
```

<details>
<summary>Hint</summary>

Convert both pair lists to dictionaries for fast lookup
(`dict(pairs_g)` turns a list of pairs into a dictionary). For each
input `x` in `g`'s domain, look up `g_dict[x]` to get the intermediate
value, then look that up in `f_dict` to get the final output.

</details>

---

**Challenge 2 — Verify an inverse numerically**

Implement a function that checks whether two functions are inverses of
each other, by testing the composition identities across a range of values.

```python
def verify_inverse(f, f_inv, test_values, tolerance=1e-9):
    """
    Check whether f_inv is the inverse of f by testing
    f_inv(f(x)) == x for every x in test_values.

    f, f_inv:    Python functions (callables)
    test_values: list of numbers to test
    tolerance:   how close is "close enough" for floating point comparison

    Returns True if f_inv(f(x)) is within tolerance of x for ALL test values,
    False otherwise.
    """
    pass  # your code here


# --- tests: do not modify ---
f     = lambda x: 2*x + 1
f_inv = lambda x: (x - 1) / 2

wrong_inv = lambda x: (x - 1) / 3   # deliberately incorrect inverse

assert verify_inverse(f, f_inv, [-5, -1, 0, 1, 5, 100]) == True
assert verify_inverse(f, wrong_inv, [-5, -1, 0, 1, 5]) == False

print("✓ Challenge 2 passed!")
```

<details>
<summary>Hint</summary>

For each `x` in `test_values`, compute `f_inv(f(x))` and check whether
it's within `tolerance` of `x`. Use `abs(a - b) < tolerance` rather than
`a == b`, since floating-point arithmetic is rarely exactly equal even
when mathematically it should be.

</details>

---

**Challenge 3 — Plot a function and its inverse**

Pick any bijective function $f : \mathbb{R} \to \mathbb{R}$ of your choice
(other than the ones used in this lesson — try $f(x) = \frac{1}{3}x - 2$,
or invent your own linear function). Using the matplotlib pattern from
this lesson:

- Plot $f$ and your hand-derived $f^{-1}$ on the same axes
- Plot the line $y=x$ as a dashed reference
- Use `ax.set_aspect('equal')`
- Mark at least one point on $f$ and its reflected partner on $f^{-1}$

```python
import matplotlib.pyplot as plt
import numpy as np

# Your code here.
# Derive f⁻¹ by hand first (show your algebra in a comment),
# then build the plot.
```

There is no automated test — check your own work by verifying algebraically
that $f^{-1}(f(x)) = x$ for one specific value, the same way the lesson did.

---

### Extension

**4. ★** A function $f: A \to A$ (same domain and codomain) is called an
**involution** if $f \circ f = \text{id}_A$ — applying it twice returns
the original input. Every involution is its own inverse: $f^{-1} = f$.

(a) Show that $f(x) = -x$ on $\mathbb{R}$ is an involution.

(b) Show that $f(x) = \frac{1}{x}$ on $\mathbb{R} \setminus \{0\}$
(all reals except 0) is an involution.

(c) The Caesar cipher with shift 13 (called ROT13) applied to the
26-letter alphabet is an involution. Why does this mean encrypting
a message twice with ROT13 returns the original message? (You do not
need the cipher code from Lesson 00 — just reason about the shift amount.)

<details>
<summary>Hint for (c)</summary>

The alphabet has 26 letters. What is $13 + 13$? What does adding that
total shift do, modulo 26 (recall Lesson 01's wraparound)?

</details>

<details>
<summary>Answer for (c)</summary>

Shifting by 13 twice shifts by a total of 26. Since the alphabet wraps
at 26 (Lesson 01: `% 26`), a shift of 26 is the same as a shift of 0 —
no change at all. So ROT13 applied twice returns the original letter,
making it an involution: its own inverse.

</details>

**5. ★** Implement a generic `is_involution` checker for functions given
as pairs, and verify it on a concrete example.

```python
def is_involution(pairs):
    """
    Return True if applying the function twice returns the original input,
    for every input in its domain. Assumes domain == codomain (pairs map
    within the same set).
    """
    pass  # your code here


# --- tests: do not modify ---
negation = [(1, -1), (-1, 1), (2, -2), (-2, 2), (0, 0)]
not_involution = [(1, 2), (2, 3), (3, 1)]   # a 3-cycle, not an involution

assert is_involution(negation) == True
assert is_involution(not_involution) == False

print("✓ Extension 5 passed!")
```

<details>
<summary>Hint</summary>

Convert the pairs to a dictionary. For each input `x`, look up `f(x)`,
then look up `f(f(x))`, and check whether that equals `x`.

</details>
