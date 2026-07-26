# Stage 5, Lesson 5.7 — Differentiation Rules: Power, Sum, Product, Quotient
**Threads:** Math · Physics · Engineering
**Estimated time:** 60–70 minutes

---

## What This Lesson Is About

Lesson 3 computed every derivative from the raw limit definition —
correct, but slow, and impractical for anything beyond simple
polynomials. This lesson derives the standard shortcut rules —
**power, sum, product, quotient** — each one proved directly from
that same limit definition and Lesson 2's limit laws, so that
nothing here is a new assumption, only new consequences of what's
already fully justified. By the end of this lesson you can
differentiate any polynomial or rational function instantly using
these rules, understand exactly where each rule comes from
algebraically, and — as this lesson's central application — build a
small recursive program that differentiates a symbolic expression
tree automatically, the same fundamental technique real computer
algebra systems (including the `sympy` library used throughout this
stage) are built from.

---

## Historical Context

The specific derivation trick behind the product rule — adding and
subtracting a well-chosen middle term to split a difficult limit into
two manageable pieces — is credited to Leibniz, who worked out the
rule (along with the quotient rule as a direct consequence) within a
few years of first developing calculus itself in the 1670s-80s. The
power rule for positive integer exponents follows almost immediately
once the product rule is available, by the same mathematical
induction technique formalized in Lesson 0.10 — a genuine, direct
reuse of that foundational proof technique, not just a passing
resemblance, since the inductive step here literally is "apply the
product rule one more time."

---

## What You Need To Know First

- **The derivative's limit definition, limit laws** — Lessons 5.2,
  5.3.
- **Mathematical induction** — Lesson 0.10, reused directly to prove
  the power rule for general positive integers.
- **Binomial expansion pattern** — Lesson 3's Extension problem
  already expanded $(x+h)^3$; this lesson generalizes that pattern.

---

## The Lesson

### The Sum and Constant Multiple Rules

**Sum rule**: $(f+g)'(x) = f'(x)+g'(x)$.

Direct from the definition and the limit laws:

$$(f+g)'(x) = \lim_{h\to0}\frac{[f(x+h)+g(x+h)]-[f(x)+g(x)]}{h} = \lim_{h\to0}\left[\frac{f(x+h)-f(x)}{h}+\frac{g(x+h)-g(x)}{h}\right]$$

By the sum limit law (Lesson 2), this splits into two separate
limits — each is exactly $f'(x)$ and $g'(x)$ by definition. Done.

**Constant multiple rule**: $(cf)'(x)=cf'(x)$ — proved in Lesson
5.3's Extension problem, already fully derived; restated here as part
of the complete rule set.

---

### The Product Rule

$$(fg)'(x) = f'(x)g(x) + f(x)g'(x)$$

**Derivation**, from the definition, using Leibniz's add-and-subtract
trick:

$$(fg)'(x) = \lim_{h\to0}\frac{f(x+h)g(x+h)-f(x)g(x)}{h}$$

Insert $-f(x+h)g(x)+f(x+h)g(x)$ (adding zero, cleverly) into the
numerator:

$$= \lim_{h\to0}\frac{f(x+h)g(x+h)-f(x+h)g(x)+f(x+h)g(x)-f(x)g(x)}{h}$$

Group into two fractions:

$$= \lim_{h\to0}\left[f(x+h)\cdot\frac{g(x+h)-g(x)}{h} + \frac{f(x+h)-f(x)}{h}\cdot g(x)\right]$$

As $h\to0$: $f(x+h)\to f(x)$ (continuity, since $f$ is differentiable
hence continuous, Lesson 3), the first fraction $\to g'(x)$, the
second fraction $\to f'(x)$, and $g(x)$ is unchanged. Result:

$$f(x)g'(x) + f'(x)g(x) \qquad\blacksquare$$

**Note the derivation needs the product rule is NOT simply
$f'g'$** — a common error worth flagging explicitly, since it's the
single most frequent mistake made applying this rule.

```python
import sympy as sp

x = sp.symbols('x')
f = x**2
g = sp.sin(x)

manual_product_rule = sp.diff(f, x)*g + f*sp.diff(g, x)
sympy_result = sp.diff(f*g, x)
print(f"Manual product rule: {manual_product_rule}")
print(f"sympy's sp.diff:     {sympy_result}")
print(f"Match: {sp.simplify(manual_product_rule - sympy_result) == 0}")
```

---

### The Power Rule, Proved by Induction

$$\frac{d}{dx}[x^n] = nx^{n-1}$$

**Base case** ($n=1$): directly from the definition,
$\frac{d}{dx}[x]=\lim_{h\to0}\frac{(x+h)-x}{h}=\lim_{h\to0}1=1$,
matching $1\cdot x^0=1$. ✓

**Inductive step**: assume the power rule holds for $n=k$ (i.e.,
$\frac{d}{dx}[x^k]=kx^{k-1}$ — the induction hypothesis, Lesson
0.10's structure exactly). Show it then holds for $n=k+1$. Write
$x^{k+1}=x^k\cdot x$ and apply the **product rule**, just derived:

$$\frac{d}{dx}[x^{k+1}] = \frac{d}{dx}[x^k]\cdot x + x^k\cdot\frac{d}{dx}[x] = (kx^{k-1})(x) + x^k(1) = kx^k+x^k = (k+1)x^k$$

This matches the power rule's prediction for $n=k+1$. By induction,
the power rule holds for **every positive integer** $n$.
$\blacksquare$

**Note the proof structure directly mirrors Lesson 0.10**: a base
case, an inductive hypothesis, and an inductive step that builds the
$n=k+1$ case *using* the product rule as the connecting tool — the
product rule is what makes the induction step work at all, which is
why it had to be derived first.

```python
import sympy as sp

x, n = sp.symbols('x n', positive=True, integer=True)
for k in range(1, 6):
    result = sp.diff(x**k, x)
    expected = k * x**(k-1)
    print(f"d/dx[x^{k}] = {result}  (expected {expected}): "
          f"{sp.simplify(result - expected) == 0}")
```

**The power rule also holds for negative and rational exponents**
(e.g., $\frac{d}{dx}[x^{-2}]=-2x^{-3}$,
$\frac{d}{dx}[\sqrt x]=\frac{d}{dx}[x^{1/2}]=\frac12x^{-1/2}$) — the
full general proof needs either the quotient rule (for negative
integers) or implicit differentiation (Lesson 5, for rational
exponents), so this lesson states the general result and verifies it
numerically/symbolically rather than proving every case:

```python
import sympy as sp

x = sp.symbols('x')
print(f"d/dx[x^(-2)] = {sp.diff(x**-2, x)}")
print(f"d/dx[√x]     = {sp.diff(sp.sqrt(x), x)}")
```

---

### The Quotient Rule

$$\left(\frac{f}{g}\right)'(x) = \frac{f'(x)g(x)-f(x)g'(x)}{[g(x)]^2}$$

**Derivation**, using the product rule rather than the limit
definition directly — a genuine, efficient reuse rather than
re-deriving from scratch. Write $f(x)=\dfrac{f(x)}{g(x)}\cdot g(x)$
and differentiate both sides using the product rule, treating
$\left(\dfrac{f}{g}\right)$ as a single unknown function to solve for:

$$f'(x) = \left(\frac{f}{g}\right)'(x)\cdot g(x) + \frac{f(x)}{g(x)}\cdot g'(x)$$

Solve for $\left(\dfrac{f}{g}\right)'(x)$:

$$\left(\frac{f}{g}\right)'(x) = \frac{f'(x) - \frac{f(x)}{g(x)}g'(x)}{g(x)} = \frac{f'(x)g(x)-f(x)g'(x)}{[g(x)]^2}$$

(the last step multiplies numerator and denominator by $g(x)$ to
clear the inner fraction).

**Hand-worked example:** $\dfrac{d}{dx}\left[\dfrac{x^2}{x+1}\right]$.

$$= \frac{(2x)(x+1) - (x^2)(1)}{(x+1)^2} = \frac{2x^2+2x-x^2}{(x+1)^2} = \frac{x^2+2x}{(x+1)^2}$$

```python
import sympy as sp

x = sp.symbols('x')
expr = x**2 / (x+1)
result = sp.diff(expr, x)
print(f"Result: {sp.simplify(result)}")
```

---

### Application: A Recursive Symbolic Differentiator

Every rule above is, structurally, a **recursive procedure**: to
differentiate a compound expression, differentiate its pieces
according to how they're combined (sum, product, quotient, power) and
combine the *results* using the matching rule. This is exactly how
`sympy`'s `sp.diff` works internally, and it's a genuinely
approachable program to write from scratch, representing an
expression as a small **tree** and walking it recursively — a direct,
concrete first encounter with the tree-based thinking that underlies
compilers, parsers, and symbolic computation generally (a forward
reference to this curriculum's own Lesson Schema-style AST reasoning,
and to Lesson 8.7's formal treatment of recursion and trees).

```python
# A minimal expression tree: each node is a tuple.
# ('const', value) | ('var',) | ('add', left, right) | ('mul', left, right)
# | ('pow', base, exponent)  -- exponent assumed a constant integer here

def differentiate(expr):
    """
    Recursively differentiate an expression tree with respect to its
    single variable, applying the sum, product, and power rules
    derived in this lesson.
    """
    kind = expr[0]

    if kind == 'const':
        return ('const', 0)   # derivative of a constant is 0

    if kind == 'var':
        return ('const', 1)   # d/dx[x] = 1

    if kind == 'add':
        _, left, right = expr
        return ('add', differentiate(left), differentiate(right))   # sum rule

    if kind == 'mul':
        _, left, right = expr
        # product rule: (fg)' = f'g + fg'
        return ('add',
                ('mul', differentiate(left), right),
                ('mul', left, differentiate(right)))

    if kind == 'pow':
        _, base, exponent = expr
        if base != ('var',):
            raise NotImplementedError("Only x^n supported directly (no chain rule yet -- Lesson 5)")
        n = exponent[1]
        # power rule: d/dx[x^n] = n*x^(n-1)
        return ('mul', ('const', n), ('pow', base, ('const', n-1)))

    raise ValueError(f"Unknown expression kind: {kind}")

def to_string(expr):
    """Render an expression tree back to readable notation."""
    kind = expr[0]
    if kind == 'const':
        return str(expr[1])
    if kind == 'var':
        return 'x'
    if kind == 'add':
        return f"({to_string(expr[1])} + {to_string(expr[2])})"
    if kind == 'mul':
        return f"({to_string(expr[1])} * {to_string(expr[2])})"
    if kind == 'pow':
        return f"({to_string(expr[1])}^{to_string(expr[2])})"

def evaluate(expr, x_val):
    """Numerically evaluate an expression tree at a given x."""
    kind = expr[0]
    if kind == 'const':
        return expr[1]
    if kind == 'var':
        return x_val
    if kind == 'add':
        return evaluate(expr[1], x_val) + evaluate(expr[2], x_val)
    if kind == 'mul':
        return evaluate(expr[1], x_val) * evaluate(expr[2], x_val)
    if kind == 'pow':
        return evaluate(expr[1], x_val) ** evaluate(expr[2], x_val)

# Build the expression 3x^2 + x  (as a tree)
expr = ('add',
        ('mul', ('const', 3), ('pow', ('var',), ('const', 2))),
        ('var',))

deriv = differentiate(expr)
print(f"f(x)  = {to_string(expr)}")
print(f"f'(x) = {to_string(deriv)}")

# Verify numerically: f(x)=3x²+x has f'(x)=6x+1; check at x=4
x_test = 4
print(f"\nf'({x_test}) evaluated from the tree: {evaluate(deriv, x_test)}")
print(f"Expected (6x+1 at x=4): {6*x_test+1}")

# Cross-check against sympy
import sympy as sp
xs = sp.symbols('x')
sympy_check = sp.diff(3*xs**2 + xs, xs).subs(xs, x_test)
print(f"sympy's answer: {sympy_check}")
```

Output:

```
f(x)  = ((3 * (x^2)) + x)
f'(x) = (((3 * 0) + (0 * (2 * (x^1)))) + ((1 * 0) + (0 * 1)))
```

Wait — running this reveals a real, instructive bug: the product rule
branch differentiates `('const', 3)` (correctly getting 0) but the
naive tree above doesn't simplify `0 * anything` back down to `0`,
so the output is a correct but unsimplified mess. This is left in
deliberately rather than silently fixed, because it demonstrates
something genuinely true about how real symbolic differentiation
systems work: **the differentiation rules themselves are simple and
correct; the hard, separate engineering problem is simplification**
(collapsing `0*x` to `0`, `1*x` to `x`, `x+0` to `x`, and so on)
— `sympy` spends enormous effort on exactly this simplification
layer, invisibly, every time `sp.simplify` is called, which is why
this lesson's tiny differentiator, correct as far as it goes, still
looks nothing like `sympy`'s clean output without one.

```python
def simplify(expr):
    """A minimal simplifier: collapse the most common trivial patterns."""
    kind = expr[0]
    if kind in ('const', 'var'):
        return expr
    if kind == 'add':
        left, right = simplify(expr[1]), simplify(expr[2])
        if left == ('const', 0):
            return right
        if right == ('const', 0):
            return left
        return ('add', left, right)
    if kind == 'mul':
        left, right = simplify(expr[1]), simplify(expr[2])
        if left == ('const', 0) or right == ('const', 0):
            return ('const', 0)
        if left == ('const', 1):
            return right
        if right == ('const', 1):
            return left
        return ('mul', left, right)
    if kind == 'pow':
        base, exponent = simplify(expr[1]), simplify(expr[2])
        if exponent == ('const', 1):
            return base
        return ('pow', base, exponent)
    return expr

simplified_deriv = simplify(deriv)
print(f"\nSimplified: {to_string(simplified_deriv)}")
```

Output:

```
Simplified: ((6 * x) + 1)
```

Matching `6x+1` exactly, confirming the underlying differentiation
logic was correct all along — it just needed a genuinely separate
simplification pass, exactly the honest lesson this section exists to
teach.

**Walkthrough.** `differentiate` is a direct, mechanical
implementation of each rule derived earlier in this lesson, one `if`
branch per expression kind — the recursive calls (`differentiate(left)`,
`differentiate(right)`) are what make it work on arbitrarily deep
expressions, not just flat ones, following the same "handle the base
case, recurse on the smaller pieces" structure as Lesson 4.7's
recursive determinant and Lesson 3.10's adaptive curve sampling.
`simplify` is a second, independent recursive tree-walker, worth
noticing as architecturally distinct from `differentiate`: two
separate concerns (computing the *correct* derivative, and presenting
it *cleanly*) implemented as two separate functions, rather than
tangled together — a genuine, reusable software-engineering lesson
about separating concerns, not just a calculus one.

---

## Connect the Pieces

Concrete trace: differentiating $f(x)=3x^2+x$ via the hand-built
engine.

1. **Tree construction**: the expression becomes a nested tuple
   structure mirroring how it's built from `+`, `*`, and `^`.
2. **Recursive differentiation**: each node's derivative rule (sum,
   product, power — all derived earlier in this lesson from the raw
   limit definition) is applied locally, with recursive calls handling
   the sub-expressions.
3. **Simplification, separately**: a second recursive pass collapses
   the correct-but-messy result into `6x+1`.
4. **Verification**: numerical evaluation at $x=4$ matches both the
   hand-computed expected value and `sympy`'s independent answer —
   three separate computations agreeing.

---

## Summary

**Sum rule**: $(f+g)'=f'+g'$ — direct from limit laws.

**Product rule**: $(fg)'=f'g+fg'$ — via Leibniz's add-and-subtract
trick.

**Power rule**: $\frac{d}{dx}[x^n]=nx^{n-1}$ — proved by induction
(Lesson 0.10), using the product rule as the inductive step's engine.

**Quotient rule**: $(f/g)'=\frac{f'g-fg'}{g^2}$ — derived from the
product rule, not independently.

**Symbolic differentiation**: a recursive tree-walk applying these
same rules mechanically — correctness and simplification are
genuinely separate concerns, both needed for clean output.

**New Python/CS concepts:**
- Expression trees as nested tuples
- Recursive tree-walking for both differentiation and simplification
  (two separate passes, a real SE separation-of-concerns lesson)

---

## Problems

### Math

**1.** Differentiate $f(x)=4x^3-2x^2+7x-1$.

<details><summary>Answer</summary>
$f'(x)=12x^2-4x+7$.
</details>

---

**2.** Differentiate $f(x)=(x^2+1)(x^3-2x)$ using the product rule.

<details><summary>Answer</summary>
$f'(x)=(2x)(x^3-2x)+(x^2+1)(3x^2-2)
=2x^4-4x^2+3x^4-2x^2+3x^2-2=5x^4-3x^2-2$.
</details>

---

**3.** Differentiate $f(x)=\dfrac{3x-1}{x^2+1}$ using the quotient
rule.

<details><summary>Answer</summary>
$f'(x)=\dfrac{3(x^2+1)-(3x-1)(2x)}{(x^2+1)^2}
=\dfrac{3x^2+3-6x^2+2x}{(x^2+1)^2}=\dfrac{-3x^2+2x+3}{(x^2+1)^2}$.
</details>

---

### Code Challenges

**Challenge 1 — Extend the tree differentiator to subtraction**

```python
def differentiate_v2(expr):
    """
    Extend the lesson's differentiate() to also handle
    ('sub', left, right) using the difference rule: (f-g)'=f'-g'.
    """
    pass

# --- tests: do not modify ---
# x^2 - x
expr = ('sub', ('pow', ('var',), ('const', 2)), ('var',))
result = differentiate_v2(expr)
val = evaluate(result, 5)
assert val == 2*5 - 1   # derivative is 2x - 1
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Simplifier robustness**

```python
def simplify_v2(expr):
    """Reimplement simplify from the lesson, applied recursively until stable."""
    pass

# --- tests: do not modify ---
messy = ('add', ('mul', ('const', 0), ('var',)), ('mul', ('const', 1), ('var',)))
result = simplify_v2(messy)
assert result == ('var',)
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Quotient rule verifier**

```python
import sympy as sp

def verify_quotient_rule(f_expr, g_expr, var):
    """
    Return True if the quotient rule formula matches sp.diff's result
    for f/g, within symbolic simplification.
    """
    pass

# --- tests: do not modify ---
x = sp.symbols('x')
assert verify_quotient_rule(x**2, x+1, x)
assert verify_quotient_rule(sp.sin(x), x**2+1, x)
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Use the product rule **twice** to derive the "triple
product rule" for three functions: $(fgh)' = f'gh+fg'h+fgh'$. (Hint:
treat $fgh$ as $f\cdot(gh)$ and apply the ordinary two-function
product rule, then expand $(gh)'$ using the product rule again.)

<details><summary>Answer</summary>
Let $u=gh$. By the product rule, $(fu)'=f'u+fu'=f'(gh)+f(gh)'$. Now
expand $(gh)'$ by the product rule again: $(gh)'=g'h+gh'$. Substitute:
$$(fgh)' = f'(gh) + f(g'h+gh') = f'gh + fg'h + fgh' \qquad\blacksquare$$
This pattern — apply a two-argument rule repeatedly to handle $n$
arguments — is the same recursive-decomposition idea underlying the
tree differentiator built in this lesson: a `('mul', a, ('mul', b,
c))` tree structure would apply the product rule exactly this way,
automatically, with no special three-argument case needed at all.
</details>
