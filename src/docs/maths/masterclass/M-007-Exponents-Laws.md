# M-007 — Exponents and Their Laws

**Phase 1 · Algebra Rebuilt · Lesson 5 of 5**

---

Here is a question that most algebra courses never ask: why is $2^0 = 1$?

Not "what is $2^0$" — you know the answer. But *why* is it 1? Did someone decide that? Is it a convenient convention? Or is it forced — the only possible value that keeps everything else consistent?

The answer is the latter. And the argument that shows it is forced is one of the most important patterns in all of mathematics. You will see this same pattern — extending a structure by demanding that existing laws keep working — in abstract algebra, complex analysis, and linear algebra. Let's see it here, in the most elementary setting possible.

---

## Start From What the Word Means

For a positive integer $n$, $a^n$ means: multiply $a$ by itself $n$ times.

$$a^3 = a \cdot a \cdot a \qquad a^5 = a \cdot a \cdot a \cdot a \cdot a$$

That is the only definition we start with. Everything else will be derived.

---

## Three Laws, All From Counting

> **Before reading on:** Try to derive $a^m \cdot a^n = a^{m+n}$ yourself. Do not use the rule — just use the definition as "multiply by itself that many times" and count what you get.

**Law 1:** $a^m \cdot a^n = a^{m+n}$

$a^m$ is $m$ copies of $a$. $a^n$ is $n$ copies. Multiplied together: $m + n$ copies.

$$\underbrace{a \cdots a}_{m} \cdot \underbrace{a \cdots a}_{n} = \underbrace{a \cdots a}_{m+n} \quad \square$$

**Law 2:** $(a^m)^n = a^{mn}$

$(a^m)^n$ means $n$ groups, each with $m$ copies of $a$. Total copies: $n \times m$.

$$\underbrace{(a^m) \cdots (a^m)}_{n} = \underbrace{\underbrace{a\cdots a}_{m}\cdots\underbrace{a\cdots a}_{m}}_{n \text{ groups}} = a^{mn} \quad \square$$

**Law 3:** $(ab)^n = a^n b^n$

$n$ copies of the pair $(ab)$. Rearrange by commutativity — put all $a$'s together, all $b$'s together.

$$(ab)^n = \underbrace{(ab)\cdots(ab)}_{n} = \underbrace{a\cdots a}_{n} \cdot \underbrace{b\cdots b}_{n} = a^n b^n \quad \square$$

These are theorems derived from the definition by counting. They are not rules to memorise. And — this is the key insight — if we want to extend exponents to zero, negative, and fractional values, we must do so in a way that keeps these laws true.

---

## Stop and Think: What Is $2^0$?

Right now, $2^0$ is undefined. We only defined $a^n$ for positive integers $n$. The question is: can we *extend* the definition to include $n = 0$ in a way that keeps Law 1 working?

Law 1 says $a^m \cdot a^n = a^{m+n}$. Set $n = 0$:

$$a^m \cdot a^0 = a^{m + 0} = a^m$$

So $a^0$ must be a number that, when multiplied by $a^m$, gives back $a^m$. There is exactly one such number: **1**.

$$a^0 = 1 \quad (a \neq 0)$$

This is not a convention. It is the *only* definition of $a^0$ that keeps Law 1 working. If someone defined $a^0 = 7$, then $a^3 \cdot a^0 = a^3 \cdot 7 = 7a^3$, but Law 1 says it should equal $a^3$. The contradiction forces us to $a^0 = 1$.

```python
# Show that a^0 = 1 is forced: any other choice breaks Law 1
a = 2.0
print("If a^0 = 1:  a^3 * a^0 =", a**3 * 1, " should equal a^3 =", a**3)
print("If a^0 = 7:  a^3 * a^0 =", a**3 * 7, " but Law 1 says", a**3, " — BROKEN")
print()
print("Law 1 forced definition: 2^0 =", 2**0)
```

---

## Stop and Think: What Is $2^{-3}$?

Same question. Law 1 requires:

$$a^n \cdot a^{-n} = a^{n + (-n)} = a^0 = 1$$

So $a^{-n}$ must be the multiplicative inverse of $a^n$:

$$a^{-n} = \frac{1}{a^n}$$

Again, forced — not chosen. If we tried $a^{-1} = 0$, then $a \cdot a^{-1}$ would equal $0$, not $1$. The law breaks. There is no wiggle room.

```python
a = 2.0
print("Law 1 forces: a^3 * a^(-3) = 1")
print(f"  2^3 * 2^(-3) = {a**3} * {a**-3:.6f} = {a**3 * a**-3}")
print()
for n in range(-4, 5):
    print(f"  2^{n:2d} = {2.0**n:.6f}")
print()
print("Each step up multiplies by 2. Each step down divides by 2.")
print("Crossing zero forces 2^0 = 1.")
```

The output shows the pattern directly: the sequence $\ldots, \frac{1}{4}, \frac{1}{2}, 1, 2, 4, \ldots$ is the only sequence where multiplying consecutive terms gives the right exponent sum.

---

## Fractional Exponents: The Same Principle Again

What should $a^{1/2}$ mean? Law 2 requires:

$$(a^{1/2})^2 = a^{2 \cdot (1/2)} = a^1 = a$$

So $a^{1/2}$ must be a number that when squared gives $a$. That is the square root: $a^{1/2} = \sqrt{a}$.

More generally, $a^{1/n}$ must satisfy $(a^{1/n})^n = a$ — it is the $n$th root $\sqrt[n]{a}$.

And $a^{p/q} = (a^{1/q})^p = (\sqrt[q]{a})^p$: take the $q$th root first, then raise to the $p$th power. Or equivalently, $a^{p/q} = \sqrt[q]{a^p}$ — both give the same answer.

```python
import math

# Verify: a^(p/q) = (q-th root of a)^p
cases = [(8, 1, 3), (8, 2, 3), (16, 3, 4), (32, 2, 5)]
for (a, p, q) in cases:
    via_law2    = (a ** (1/q)) ** p
    direct      = a ** (p/q)
    print(f"  {a}^({p}/{q}) = {direct:.6f},  (^(1/{q}))^{p} = {via_law2:.6f},  agree: {abs(direct-via_law2)<1e-10}")
```

---

## The Consistency Principle

Every extension of exponents followed the same template:

1. Ask: what value of $a^x$ (for the new $x$) keeps Law 1 or Law 2 working?
2. The answer is forced — there is at most one consistent choice.
3. Define $a^x$ to be that value.

This is called the **consistency principle** — extend a structure by requiring existing laws to continue holding. It appears everywhere in mathematics:

- Complex numbers extend the reals by requiring every polynomial to have roots.
- The matrix exponential $e^A$ is defined to satisfy $e^{A+B} = e^A e^B$ (Law 1 with matrices).
- In Phase 4, Euler's formula $e^{i\theta} = \cos\theta + i\sin\theta$ is forced by demanding that $e^x$ satisfies its own derivative equation for complex inputs.

Every time you see a strange-looking definition in mathematics — $0! = 1$, $(−1)^{1/2} = i$, the empty product equals 1 — the consistency principle is usually what forced it.

---

## What About $0^0$?

The consistency argument breaks down here. Try Law 1 with $a = 0$, $n = 0$:

$$0^m \cdot 0^0 = 0^m$$

This is satisfied by *any* value of $0^0$, since $0^m = 0$. Law 1 gives us no information.

Try approaching from two different directions:

- Fix the base: $\lim_{x \to 0^+} 0^x = 0$ (zero to any positive power is zero).
- Fix the exponent: $\lim_{x \to 0^+} x^0 = 1$ (any nonzero base to the zero power is one).

The two limits disagree. No single value is forced. In analysis, $0^0$ is left undefined. In combinatorics, $0^0 = 1$ is used as a convention because it makes formulas work out cleanly (the empty product is 1). Both usages coexist — context determines which applies.

---

## The Full Extension Chain

```python
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

fig, ax = plt.subplots(figsize=(9, 5))
ax.set_facecolor('#0f1117')
fig.patch.set_facecolor('#0f1117')
ax.set_xlim(0, 10)
ax.set_ylim(0, 6)
ax.axis('off')

steps = [
    (5, 5.2, 'Positive integers', 'a^n = a·a····a  (counting)', '#4fc3f7'),
    (5, 4.0, 'Zero exponent',     'a^0 = 1  (forced by Law 1)',           '#ff9800'),
    (5, 2.8, 'Negative integers', 'a^-n = 1/a^n  (forced by Law 1)',      '#66bb6a'),
    (5, 1.6, 'Rational exponents','a^(p/q) = (q-th root of a)^p  (Law 2)','#9c77db'),
    (5, 0.5, 'Real exponents',    'a^x = limit of rationals  (Phase 5)',   '#5a7a90'),
]

for (x, y, title, detail, color) in steps:
    ax.text(x, y + 0.15, title, color=color, fontsize=10, fontweight='bold', ha='center')
    ax.text(x, y - 0.15, detail, color='#5a7a90', fontsize=8.5, ha='center', style='italic')
    if y > 0.5:
        ax.annotate('', xy=(5, y - 0.7), xytext=(5, y - 0.35),
                    arrowprops=dict(arrowstyle='->', color='#3a5060', lw=1.5))

ax.set_title('Each extension forced by requiring the existing laws to keep holding',
             color='#4a6a80', fontsize=10, style='italic', pad=8)
plt.tight_layout()
plt.show()
```

---

## Try It Yourself

**Challenge 1.** Use only the definition of $a^n$ as repeated multiplication and Law 1 to prove that $\frac{a^m}{a^n} = a^{m-n}$ for $m > n$, $a \neq 0$.

**Challenge 2.** Someone claims: "Since $(-1)^2 = 1$, then $(-1)^{2 \cdot (1/2)} = 1^{1/2} = 1$. But $(−1)^1 = -1$. So $1 = -1$." Find the flaw.

*(Hint: the issue is with $(-1)^{1/2}$. What does the consistency principle say about taking square roots of negative numbers?)*

**Challenge 3.** Derive: if $a^x = a^y$ and $a \neq 0, 1$, then $x = y$. What property of exponents does this use?

---

## What Comes Next

Phase 1 is complete. We have rebuilt arithmetic from nine axioms (M-003), added ordering (M-004), derived the quadratic formula (M-005), established distance and intervals (M-006), and derived all exponent laws from counting (M-007).

Phase 2 begins with functions. You have used functions since secondary school — $f(x) = x^2$, $g(x) = \sin x$ — but have probably never seen a precise definition. M-008 builds the definition from scratch, using sets, and shows that the precise definition captures exactly the property that makes functions useful: one output for every input.
