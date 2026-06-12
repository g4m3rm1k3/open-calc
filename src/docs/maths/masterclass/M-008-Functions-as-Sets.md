# M-008 — Functions

**Phase 2 · Functions and Their Behaviour · Lesson 1 of 3**

---

You have been using functions since you were about thirteen. $f(x) = x^2$. $g(x) = \sin x$. The square root. The absolute value. You know how to evaluate them, graph them, compose them.

But here is a question you have almost certainly never been asked: what *is* a function? Not "a rule that assigns outputs to inputs" — that is a description, not a definition. What is the mathematical *object* called a function? Where does it live?

The answer connects functions to sets, makes precise why $y = \pm\sqrt{x}$ is not a function, and — most surprisingly — gives us the only consistent way to compare the sizes of infinite sets.

---

## The Problem with the Informal Description

"A function assigns to each input exactly one output." This is the right idea, but it does not tell you what kind of *thing* a function is. Is it a formula? A graph? A table? A machine?

The answer that works for all of mathematics: **a function is a set of ordered pairs.**

Specifically, the function $f(x) = x^2$ (from the reals to the reals) is the set:

$$\{(x, x^2) : x \in \mathbb{R}\} = \{(0, 0), (1, 1), (-1, 1), (2, 4), (-2, 4), \ldots\}$$

Every input $x$ appears paired with exactly one output $x^2$. That "exactly one" is the condition that makes something a function and not just a relation.

---

## The Formal Definition

A **function** $f: A \to B$ is a subset of $A \times B$ (the set of all ordered pairs $(a, b)$ with $a \in A, b \in B$) satisfying two conditions:

1. **Totality:** every element of $A$ appears as a first entry in some pair. (Every input has at least one output.)
2. **Uniqueness:** no element of $A$ appears as the first entry of two different pairs. (Every input has at most one output.)

Together: every input has **exactly one** output. The set $A$ is called the **domain**. The set $B$ is called the **codomain** — the set of all *possible* outputs, whether or not they are all achieved. The **range** (or **image**) is the subset of $B$ actually achieved: $\{f(x) : x \in A\}$.

---

## Stop and Think

> Is $y = \pm\sqrt{x}$ a function from $\mathbb{R}$ to $\mathbb{R}$?

Think about it using the two conditions before reading on.

---

It fails Condition 2. For $x = 4$, both $(4, 2)$ and $(4, -2)$ would be in the set — one input, two outputs. The uniqueness condition is violated. So $y = \pm\sqrt{x}$ is not a function.

What about $f(x) = \sqrt{x}$ (taking only the positive root)? It fails Condition 1 — $(-1, ?)$ has no valid pair because $\sqrt{-1}$ is not real. So $f(x) = \sqrt{x}$ is not a function *from* $\mathbb{R}$. It becomes a function once the domain is restricted to $[0, \infty)$.

This is why the domain is part of the function's definition, not an afterthought.

```python
# The "exactly one output" test — does this relation define a function?

def is_function(pairs, domain):
    outputs = {}
    for (x, y) in pairs:
        if x in outputs and outputs[x] != y:
            print(f"  Not a function: {x} maps to both {outputs[x]} and {y}")
            return False
        outputs[x] = y
    missing = [a for a in domain if a not in outputs]
    if missing:
        print(f"  Not a function: no output for {missing}")
        return False
    print(f"  Valid function. Outputs: {outputs}")
    return True

print("f(x) = x^2 on {-2,-1,0,1,2}:")
is_function([(-2,4),(-1,1),(0,0),(1,1),(2,4)], [-2,-1,0,1,2])

print("y = ±sqrt(x) on {0,1,4}:")
is_function([(0,0),(1,1),(1,-1),(4,2),(4,-2)], [0,1,4])
```

---

## Injective, Surjective, Bijective

These three words describe how a function relates its domain and codomain. Each one captures a property that will matter repeatedly from here forward.

**Injective** (also called one-to-one): different inputs give different outputs.

$$f(a) = f(b) \implies a = b$$

Think of it as "no collisions" — no two inputs land on the same output. $f(x) = x^2$ on $\mathbb{R}$ is *not* injective: both $2$ and $-2$ map to $4$.

**Surjective** (also called onto): every element of the codomain is achieved by some input.

$$\text{for every } b \in B, \text{ there exists } a \in A \text{ with } f(a) = b$$

The range equals the entire codomain. $f(x) = x^2$ with codomain $\mathbb{R}$ is *not* surjective: no real number squares to $-1$.

**Bijective**: both injective and surjective. A perfect pairing — every output comes from exactly one input, and every element of the codomain is reached.

```python
def classify(f_dict, domain, codomain):
    outputs = list(f_dict.values())
    injective  = len(outputs) == len(set(outputs))
    surjective = set(codomain).issubset(set(outputs))
    print(f"  injective:  {injective}")
    print(f"  surjective: {surjective}")
    print(f"  bijective:  {injective and surjective}")

print("f(x) = x^2 from {-2,-1,0,1,2} to {0,1,2,3,4}:")
classify({-2:4, -1:1, 0:0, 1:1, 2:4}, [-2,-1,0,1,2], [0,1,2,3,4])
```

The output shows $f(x) = x^2$ is neither: $-1$ and $1$ both map to $1$ (not injective), and $2, 3$ are never achieved (not surjective).

---

## Stop and Think: Infinite Sets

> Are there "more" natural numbers than even natural numbers?

The evens — $2, 4, 6, 8, \ldots$ — seem like "half" of the naturals. Surely $|\mathbb{N}| > |\{2, 4, 6, \ldots\}|$?

Think about it: can you build a perfect pairing between them?

---

Yes: pair each $n$ with $2n$.

$$1 \leftrightarrow 2, \quad 2 \leftrightarrow 4, \quad 3 \leftrightarrow 6, \quad 4 \leftrightarrow 8, \quad \ldots$$

This pairing is a bijection from $\mathbb{N}$ to the even numbers. By Cantor's definition, the two sets have the *same* size. The intuition that "half as many" cannot apply to infinite sets — infinite sets break that intuition entirely.

This is not a trick or a paradox. It is what happens when you take the definition of "same size" seriously and apply it to infinite sets. Cantor's insight was to use bijections as the definition of equal size, because it is the only definition that works consistently for all sets.

Using bijections:
- $|\mathbb{N}| = |\mathbb{Z}|$: the integers can be paired with the naturals (list them as $0, 1, -1, 2, -2, \ldots$).
- $|\mathbb{N}| = |\mathbb{Q}|$: the rationals can be listed in a sequence (harder to prove, but true).
- $|\mathbb{N}| < |\mathbb{R}|$: no bijection from $\mathbb{N}$ to $\mathbb{R}$ exists. We prove this in Phase 16 via Cantor's diagonal argument — a proof that uses the precise definition of function in an essential way.

```python
# Bijection from N to even numbers: n -> 2n
print("Bijection  N -> evens: n maps to 2n")
for n in range(1, 8):
    print(f"  {n} -> {2*n}")

print()
print("Bijection  N -> Z: list integers as 0,1,-1,2,-2,...")
def nat_to_int(n):
    if n == 0: return 0
    if n % 2 == 1: return (n + 1) // 2
    return -(n // 2)

for n in range(8):
    print(f"  {n} -> {nat_to_int(n)}")
```

---

## Domain and Codomain Are Part of the Function

The same formula can define different functions depending on domain and codomain. $f(x) = x^2$ is:

- Not surjective as $\mathbb{R} \to \mathbb{R}$ (negative numbers not achieved)
- Surjective as $\mathbb{R} \to [0, \infty)$ (every non-negative number is achieved)
- Not injective in either case on all of $\mathbb{R}$
- Bijective as $[0, \infty) \to [0, \infty)$ (restricted to non-negatives, one-to-one and onto)

The function is not just the formula. It is the formula *plus* the domain *plus* the codomain. Changing any of the three can change its properties fundamentally.

---

## Try It Yourself

**Challenge 1.** For each of the following, state whether it is a valid function (and if so, whether it is injective, surjective, or bijective). Give a reason for each answer.

- $f: \mathbb{R} \to \mathbb{R}$, $f(x) = x^3$
- $g: \mathbb{R} \to \mathbb{R}$, $g(x) = x^2 - 1$
- $h: [0, \pi] \to [-1, 1]$, $h(x) = \cos x$
- $k: \{1, 2, 3\} \to \{a, b\}$, $k(1) = a, k(2) = a, k(3) = b$

**Challenge 2.** Prove that the composition of two injective functions is injective. (If $f: A \to B$ and $g: B \to C$ are injective, is $g \circ f: A \to C$ injective?)

**Challenge 3.** Build an explicit bijection between $(0, 1)$ (the open interval) and $\mathbb{R}$. This shows these two sets have the same size even though one is "bounded" and the other is not. *(Hint: $\tan$ restricted to $(-\pi/2, \pi/2)$ is a bijection to $\mathbb{R}$. Can you use it?)*

---

## What Comes Next

If $f: A \to B$ is a bijection, then every element of $B$ comes from exactly one element of $A$. This means we can "reverse" $f$ — send each $b$ back to the unique $a$ that mapped to it. This reverse map is the **inverse function** $f^{-1}: B \to A$, and it only exists when $f$ is bijective. M-009 builds the inverse function and shows why the domain-codomain pair must be chosen carefully to make it work.
