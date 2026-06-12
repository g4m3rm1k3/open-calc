# M-001 — The Gauss Trick, and How to Prove Things Are Always True

**Phase 0 · Mathematical Thinking · Lesson 2 of 3**

---

## The Story

In 1787, a teacher in Brunswick, Germany wanted to keep his class quiet. He told them to add up every whole number from 1 to 100.

The students started adding: 1, 3, 6, 10...

One student, ten-year-old Carl Friedrich Gauss, put his slate down almost immediately.

The answer was 5050.

The teacher assumed he had cheated. He hadn't. He had seen something.

---

## What Did Gauss See?

Let's find out. First, just run this and look at the numbers:

```python
for n in range(1, 16):
    total = sum(range(1, n + 1))
    print(f"1 + 2 + ... + {n:2d}  =  {total}")
```

**Before scrolling down** — look at those numbers. Do you see any pattern? Can you guess a formula that would let you skip all the adding?

*(Spend a minute actually looking. The pattern is there.)*

---

## Gauss's Trick

Here is what Gauss saw. Write the sum twice — once forwards, once backwards, lined up underneath:

```
S  =  1   +  2   +  3   + ... + 98  + 99  + 100
S  = 100  + 99   + 98   + ... +  3  +  2  +  1
```

Now look at each column. Every pair adds up to **101**.

And there are **100** pairs.

So $2S = 100 \times 101 = 10100$, which means $S = 5050$.

Now do the same thing for any number $n$ instead of 100:

```
S = 1 + 2 + 3 + ... + n
S = n + (n-1) + (n-2) + ... + 1
```

Every pair sums to $n + 1$, and there are $n$ pairs, so:

$$2S = n(n+1)$$
$$S = \frac{n(n+1)}{2}$$

Let's verify:

```python
for n in range(1, 16):
    gauss_formula = n * (n + 1) // 2
    direct_sum    = sum(range(1, n + 1))
    print(f"n = {n:2d}:  formula = {gauss_formula:3d},  direct = {direct_sum:3d},  match = {gauss_formula == direct_sum}")
```

It works for all of these. 

---

## But Here's the Problem

You just checked 15 cases. That's great. But what about $n = 1000$? What about $n = 10^{100}$?

You cannot check every case. There are infinitely many whole numbers.

And this is the central challenge of mathematics: **how do you know something is true for ALL numbers, when you can't check them all?**

Checking examples is not a proof. History has examples of patterns that hold for thousands of cases and then fail. Euler showed that $n^2 + n + 41$ is prime for every $n$ from 0 to 39. At $n = 40$: $40^2 + 40 + 41 = 1681 = 41^2$. Not prime. Forty consecutive successes meant nothing.

So what do we do?

---

## The Domino Idea

Imagine a row of dominoes, stretching forever.

If you can show two things:
1. The **first** domino falls.
2. Whenever **any** domino falls, the **next** one must fall too.

Then every single domino will eventually fall. Every one. Not because you checked them all. Because the logic is airtight.

This is **mathematical induction**. And it is exactly what we need.

---

## Applying the Domino Idea to the Gauss Formula

We want to prove: the sum $1 + 2 + \cdots + n = \frac{n(n+1)}{2}$ for every whole number $n$.

**Step 1 — The first domino falls** (called the *base case*):

Does the formula work for $n = 1$? The left side is just $1$. The right side is $\frac{1 \times 2}{2} = 1$. Yes. ✓

**Step 2 — Each domino knocks over the next** (called the *inductive step*):

This is the clever part. We don't check each case. We ask: **if the formula happens to be true for some number $n$, does it automatically become true for $n+1$?**

Assume (for whatever $n$ we're at) that:
$$1 + 2 + \cdots + n = \frac{n(n+1)}{2}$$

Now add the next term, $n+1$, to both sides:
$$1 + 2 + \cdots + n + (n+1) = \frac{n(n+1)}{2} + (n+1)$$

Factor the right side — both terms have a factor of $(n+1)$:
$$= (n+1)\left(\frac{n}{2} + 1\right) = (n+1) \cdot \frac{n+2}{2} = \frac{(n+1)(n+2)}{2}$$

That last expression is exactly the formula with $n$ replaced by $n+1$. So if it's true for $n$, it's true for $n+1$.

**The domino chain:** It's true for $n=1$. Since it's true for $n=1$, it's true for $n=2$. Since it's true for $n=2$, it's true for $n=3$. And so on, forever.

**The formula is proved for every whole number.** $\square$

---

## What Just Happened?

We did not check infinitely many cases. We proved two things:

1. The chain starts.
2. The chain never stops once started.

That is enough to guarantee the chain is infinite. This is induction.

The power of this technique is hard to overstate. With 10 lines of algebra, you can prove something that holds for a billion, a trillion, or any other number — without ever checking any of them individually.

---

## Another Example: the Chessboard Problem

Here is a different kind of proof — one that works by showing "if I assume the opposite, I get a contradiction."

**Claim:** $\sqrt{2}$ is not a fraction. No matter how hard you try, you cannot write $\sqrt{2} = \frac{p}{q}$ where $p$ and $q$ are whole numbers.

This was first proved by the ancient Greeks, and it shocked them. They believed every number was a ratio of whole numbers. The proof that $\sqrt{2}$ is not broke their entire view of mathematics.

**The proof:** Suppose we could write $\sqrt{2} = \frac{p}{q}$ in lowest terms (meaning we've divided out any common factors — so the fraction can't be simplified further).

Squaring both sides: $2 = \frac{p^2}{q^2}$, so $p^2 = 2q^2$.

This tells us $p^2$ is even (it equals $2$ times something). 

**Key fact:** if $p^2$ is even, then $p$ must be even. Here's why — if $p$ were odd, then $p^2$ would be odd. So $p$ must be even. Write $p = 2m$ for some whole number $m$.

Substituting: $(2m)^2 = 2q^2$, so $4m^2 = 2q^2$, so $q^2 = 2m^2$.

Now $q^2$ is also even, so $q$ is also even.

But wait. Both $p$ and $q$ are even — they both have a factor of 2. That contradicts our assumption that we had the fraction in lowest terms.

The assumption that $\sqrt{2}$ can be written as a fraction leads to a contradiction. So the assumption must be wrong.

$\sqrt{2}$ cannot be written as a fraction. $\square$

```python
# Let's see how close fractions can get to sqrt(2)
# If sqrt(2) were rational, there would be exact fractions

import math
sqrt2 = math.sqrt(2)
best_error = 1.0

print("Searching for fractions close to sqrt(2)...\n")
for q in range(1, 50):
    for p in range(1, 100):
        error = abs(p/q - sqrt2)
        if error < best_error:
            best_error = error
            print(f"  {p}/{q} = {p/q:.10f}  (error: {error:.2e})")

print(f"\nsqrt(2) = {sqrt2:.15f}")
print("\nNotice: the error never reaches zero.")
print("Every fraction misses sqrt(2). The proof tells us why: any exact fraction")
print("would contradict itself.")
```

The code finds better and better approximations. But the error never hits zero. The proof above is why: any fraction that claims to equal $\sqrt{2}$ exactly must contain a logical contradiction.

---

## Two Tools, One Idea

You now have two proof techniques:

**Induction** — for statements about all whole numbers.
The structure: show the first case, then show each case implies the next. Like dominoes.

**Contradiction** — for statements about impossibility.
The structure: assume the thing CAN be done, then show that leads to a logical impossibility. So it can't be done.

Both of these are tools for escaping the impossible task of checking infinitely many cases. They let a finite argument cover infinite territory.

---

## Try It Yourself

The formula for the sum of the first $n$ **squares** is:

$$1^2 + 2^2 + 3^2 + \cdots + n^2 = \frac{n(n+1)(2n+1)}{6}$$

**First:** Run this to check whether you believe it:

```python
for n in range(1, 11):
    squares_sum = sum(k**2 for k in range(1, n+1))
    formula     = n * (n+1) * (2*n+1) // 6
    print(f"n={n:2d}: sum = {squares_sum:3d}, formula = {formula:3d}, match = {squares_sum == formula}")
```

**Then:** Can you prove it by induction? The structure is identical to the Gauss proof:
1. Check $n=1$.
2. Assume it's true for $n$. Add the term $(n+1)^2$ to both sides. Simplify the right side and show it matches the formula with $n+1$.

The algebra is a bit messier, but the logic is exactly the same.

---

## What Comes Next

In M-002 we look at sets — the basic language that lets us talk precisely about collections of numbers, functions, and everything else in mathematics. You'll see the first example of a definition precise enough to build proofs on.
