# M-008 — Functions as Sets

**Phase 2 · Functions and Their Behaviour · Lesson 1 of 3**
**Pillar: Transformation** · *The most fundamental object in all mathematics beyond sets*

---

## What You Will Build

A Python program that tests whether a given relation is a function, then classifies functions as injective, surjective, or bijective. You will also see a concrete demonstration of Cantor's diagonal argument sketch — why $|\mathbb{R}| > |\mathbb{N}|$ depends entirely on the precise set-theoretic definition of function.

---

## What You Need to Know First

- M-002: sets, Cartesian products, set-builder notation
- M-007: basic algebraic operations on real numbers

---

> **Quick Check — try to answer before reading:**
>
> 1. Is "the square root function" $f(x) = \sqrt{x}$ a function from $\mathbb{R}$ to $\mathbb{R}$? Why or why not?
> 2. Is $f(x) = x^2$ from $\mathbb{R}$ to $\mathbb{R}$ injective? Surjective?
> 3. What does it mean for two infinite sets to have "the same size"?
>
> *(Answers at the end of this lesson)*

---

## The Lesson

### The Formal Definition

A **function** $f: A \to B$ is a **rule** that assigns to each element $x \in A$ (the *domain*) exactly one element $f(x) \in B$ (the *codomain*). Formally: $f$ is a subset of $A \times B$ such that:

1. For every $a \in A$, there exists $b \in B$ with $(a, b) \in f$.
2. If $(a, b_1) \in f$ and $(a, b_2) \in f$, then $b_1 = b_2$.

Condition 1: every input has at least one output (totality).
Condition 2: every input has at most one output (uniqueness).

Together: exactly one output per input.

**The range** (or *image*) of $f$ is $\text{Im}(f) = \{f(x) : x \in A\} \subseteq B$. The range may be a proper subset of the codomain — not every element of $B$ need be achieved.

**Why the formal definition matters:**

- Is $f(x) = \sqrt{x}$ a function from $\mathbb{R}$ to $\mathbb{R}$? No — $\sqrt{-1}$ is undefined in $\mathbb{R}$, so condition 1 fails. The domain must be $[0, \infty)$.
- Is $g(x) = \pm\sqrt{x}$ a function? No — it assigns two values to every $x > 0$, violating condition 2.
- The formal definition makes these questions answerable with precision.

**Math lens:** Functions as subsets of Cartesian products is not just formalism — it is the foundation of category theory, the language in which much of modern mathematics is written (Phase 17). Every function is a morphism, and the entire subject is the study of structure-preserving maps.

**CS lens:** A function in the mathematical sense is exactly what a **pure function** is in programming — no side effects, deterministic, same input always gives same output. A random number generator is not a function in this sense. A hash function is (it is deterministic).

---

### Injective, Surjective, Bijective

These three words precisely describe how a function relates its domain and codomain.

**Injective (one-to-one):** $f: A \to B$ is injective if different inputs give different outputs:
$$f(x_1) = f(x_2) \implies x_1 = x_2$$

Equivalently: no two elements of $A$ map to the same element of $B$.

**Surjective (onto):** $f: A \to B$ is surjective if every element of $B$ is achieved:
$$\forall b \in B,\, \exists a \in A \text{ such that } f(a) = b$$

Equivalently: $\text{Im}(f) = B$ (the range equals the codomain).

**Bijective:** Both injective and surjective. A perfect pairing: every input maps to a unique output, and every output is hit by exactly one input.

**Why bijections matter:** A bijection $f: A \to B$ witnesses that $A$ and $B$ have "the same number of elements" — even when $A$ and $B$ are infinite. This is Cantor's definition of set size (*cardinality*): $|A| = |B|$ if and only if there exists a bijection from $A$ to $B$.

Using this definition:
- $|\mathbb{N}| = |\mathbb{Z}|$: the map $n \mapsto (-1)^n \lceil n/2 \rceil$ is a bijection $\mathbb{N} \to \mathbb{Z}$.
- $|\mathbb{N}| = |\mathbb{Q}|$: the rationals can be listed in a sequence (proved by Cantor's diagonal enumeration of $\mathbb{Z} \times \mathbb{Z}$).
- $|\mathbb{N}| < |\mathbb{R}|$: Cantor's diagonal argument shows no bijection $\mathbb{N} \to \mathbb{R}$ exists — $\mathbb{R}$ is **uncountable**. Proved in Phase 16.

```python
# Function classification for finite functions (given as dictionaries a -> b)

def is_function(domain, codomain, mapping):
    """
    Check if mapping defines a valid function from domain to codomain.
    mapping: dict {a: b} or list of pairs [(a, b), ...]
    """
    if isinstance(mapping, dict):
        pairs = list(mapping.items())
    else:
        pairs = mapping

    # Check totality: every element of domain has a value
    keys = [a for (a, b) in pairs]
    for a in domain:
        if a not in keys:
            return False, f"No image for element {a} (totality fails)"

    # Check uniqueness: no element has two different images
    seen = {}
    for (a, b) in pairs:
        if a in seen and seen[a] != b:
            return False, f"{a} maps to both {seen[a]} and {b} (uniqueness fails)"
        seen[a] = b

    return True, "Valid function"

def is_injective(mapping_dict, codomain):
    """Injective: no two inputs map to the same output."""
    images = list(mapping_dict.values())
    return len(images) == len(set(images)), "injective" if len(images) == len(set(images)) else "not injective (two inputs share an output)"

def is_surjective(mapping_dict, codomain):
    """Surjective: every element of codomain is hit."""
    image_set = set(mapping_dict.values())
    missing = [b for b in codomain if b not in image_set]
    if not missing:
        return True, "surjective"
    return False, f"not surjective (elements {missing} not in image)"


# --- Tests ---
domain   = [1, 2, 3, 4]
codomain = ['a', 'b', 'c', 'd']

# Valid bijection
f_bij = {1: 'a', 2: 'b', 3: 'c', 4: 'd'}
# Injective but not surjective (codomain has 5 elements)
codomain5 = ['a', 'b', 'c', 'd', 'e']
f_inj = {1: 'a', 2: 'b', 3: 'c', 4: 'd'}
# Surjective but not injective (two inputs → same output)
f_sur = {1: 'a', 2: 'a', 3: 'b', 4: 'c'}
codomain3 = ['a', 'b', 'c']
# Not a function (two images for one input)
f_bad = [(1, 'a'), (1, 'b'), (2, 'c'), (3, 'd'), (4, 'e')]

tests = [
    ("Bijection", domain, codomain, f_bij),
    ("Injective only", domain, codomain5, f_inj),
    ("Surjective only", domain, codomain3, f_sur),
]

for (name, dom, cod, mapping) in tests:
    valid, msg = is_function(dom, cod, mapping)
    if valid:
        inj, inj_msg = is_injective(mapping, cod)
        sur, sur_msg = is_surjective(mapping, cod)
        bij = inj and sur
        print(f"{name}: injective={inj_msg}, surjective={sur_msg}, bijective={bij}")
    else:
        print(f"{name}: NOT a function — {msg}")

print()
valid, msg = is_function([1,2,3,4,5], ['a','b','c','d','e'], f_bad)
print(f"Non-function test: {msg}")
```

---

### Cantor's Diagonal Argument (Preview)

**Theorem:** There is no surjection $\mathbb{N} \to \mathbb{R}$ — the real numbers are uncountable.

**Proof sketch:** Suppose $f: \mathbb{N} \to [0,1]$ is any function. We construct a real number $x \in [0,1]$ not in the image of $f$.

Write each $f(n)$ as an infinite decimal: $f(n) = 0.d_{n,1} d_{n,2} d_{n,3} \ldots$

Define $x = 0.x_1 x_2 x_3 \ldots$ where $x_n = 5$ if $d_{n,n} \neq 5$, and $x_n = 6$ if $d_{n,n} = 5$.

Then $x \neq f(n)$ for every $n$ (they differ in the $n$th decimal place). So $x \notin \text{Im}(f)$. Since $f$ was arbitrary, no function $\mathbb{N} \to [0,1]$ is surjective. $\square$

This proof uses the precise set-theoretic definition of function — the diagonalisation specifically exploits the indexing of function values. Without the formal definition, the argument cannot be made rigorous.

---

## Connect the Pieces

Functions connect forward to every major concept:
- **Phase 2 (this phase):** Inverse functions, composition — built on today's definitions.
- **Phase 4:** Exponential, logarithm, trigonometric functions — each is a precisely defined map with a specific domain and codomain.
- **Phase 5–7:** Limits and continuity are properties of functions.
- **Phase 10:** Linear transformations are functions between vector spaces with extra structure.
- **Phase 17:** Homomorphisms are functions between algebraic structures that preserve structure.
- **Phase 18:** Continuous maps between topological spaces are functions with the preimage condition.

---

## What Breaks Without This

Without the precise definition:
- You cannot answer "Is $f(x) = \sqrt{x}$ a function from $\mathbb{R}$ to $\mathbb{R}$?" — only that it "works for non-negative inputs."
- You cannot understand why $f(x) = \pm\sqrt{x}$ is not a function — "but it gives a value for every $x$."
- Cantor's diagonal argument is a hand-wave, not a proof.
- The inverse function (next lesson) cannot be defined precisely — you need bijectivity.

---

## Definition of Done

- [ ] You can state the two conditions (totality and uniqueness) that make a relation a function
- [ ] You can determine whether a given rule is a function, and if so, whether it is injective, surjective, or bijective
- [ ] You can explain why $f(x) = \sqrt{x}$ is not a function $\mathbb{R} \to \mathbb{R}$
- [ ] You can state what a bijection witnesses about set sizes, including for infinite sets
- [ ] You can sketch the diagonal argument and explain what it proves

**Proof reconstruction (Sunday):** Prove that $f: \mathbb{Z} \to \mathbb{N}$ defined by $f(n) = 2|n|$ if $n \leq 0$ and $f(n) = 2n-1$ if $n > 0$ is a bijection (showing $|\mathbb{Z}| = |\mathbb{N}|$). Hint: check totality, uniqueness, injectivity, surjectivity.

---

## Answers to Quick Check

1. No — $f(x) = \sqrt{x}$ is not a function from $\mathbb{R}$ to $\mathbb{R}$ because $\sqrt{-1}$ is undefined in $\mathbb{R}$ (totality fails). It is a function from $[0, \infty)$ to $[0, \infty)$.
2. $f(x) = x^2$ is not injective (both $2$ and $-2$ map to $4$). It is not surjective either (no real $x$ has $x^2 = -1$). As a function $\mathbb{R} \to [0, \infty)$ it becomes surjective but still not injective.
3. Two sets have the same size if and only if there exists a bijection between them. For finite sets this matches counting. For infinite sets it is the definition — there is no other consistent way to compare infinities.
