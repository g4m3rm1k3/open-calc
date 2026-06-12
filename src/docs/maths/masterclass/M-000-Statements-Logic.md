# M-000 — What Is Mathematics, Really?

**Phase 0 · Mathematical Thinking · Lesson 1 of 3**

---

## A Different Kind of Certainty

You have learned that $2 + 2 = 4$. You have memorised the quadratic formula. You know that $\pi \approx 3.14$.

But here is a question you have probably never been asked: **how do we know these things are true?**

Not "because the textbook says so." Not "because I checked it several times." But genuinely, deeply, unavoidably true — true in a way that could not possibly be otherwise.

This is what mathematics is actually about. Not formulas. Not calculation. **Certainty.** The study of what can be known for sure, and how.

The thing that makes mathematics different from every other subject is that it has a method for achieving this certainty. A mathematical proof is an argument so airtight that once you follow it, you cannot disagree. Not because you've been convinced — because you've been shown that the alternative is impossible.

This lesson is about what that method looks like at its foundation.

---

## What Makes Something a Mathematical Statement?

Some sentences have a definite answer: true or false. Others don't.

Try these:

- "7 is a prime number." — true or false?
- "The sum of two odd numbers is always even." — true or false?
- "Mathematics is beautiful." — true or false?
- "This sentence is false." — true or false?

The first two are mathematical statements. They are either true or false, and you can, in principle, determine which. The third is a matter of opinion — there is no procedure for deciding it. The fourth is paradoxical — if it's true then it's false, and vice versa.

Mathematics only works with the first kind. A **mathematical statement** is a sentence that is either true or false — not both, not neither, not "it depends on mood."

The slightly tricky case is this one: "$x > 3$." Is that a statement?

No. Not yet. It depends on what $x$ is. When $x = 5$ it's true; when $x = 1$ it's false. We call this an **open sentence** — it has a blank that needs to be filled before it has a truth value.

We close open sentences with quantifiers:

- **"For every real number $x$:"** $x^2 \geq 0$. Now it is a statement. (And a true one.)
- **"There exists a real number $x$ such that:"** $x^2 = 2$. Also a statement. (Also true — the number is $\sqrt{2}$.)

The words "for every" and "there exists" transform an open sentence into a claim about all of mathematics or about the existence of something. This is not notation — it is the fundamental grammar of mathematical thought.

---

## The Asymmetry That Changes Everything

Here is the single most important fact about how mathematical truth works:

**To prove a "for every" statement, you must handle every case — infinitely many, in general.**

**To disprove a "for every" statement, you need exactly one counterexample.**

One. A single counterexample destroys a universal claim.

This asymmetry has enormous consequences. It means:

- "All swans are white" is destroyed by finding one black swan.
- "This formula is prime for all n" is destroyed by finding one n where it fails.
- Euler checked that $n^2 + n + 41$ is prime for $n = 0, 1, 2, \ldots, 39$. All forty checks passed. At $n = 40$: $40^2 + 40 + 41 = 1681 = 41^2$. One failure destroyed the pattern.

```python
# Let's watch Euler's formula work... and then fail

def is_prime(n):
    if n < 2:
        return False
    for d in range(2, int(n**0.5) + 1):
        if n % d == 0:
            return False
    return True

print("n²+n+41 results:\n")
for n in range(0, 45):
    value = n*n + n + 41
    prime = is_prime(value)
    flag = "  ← FAILS HERE" if not prime else ""
    print(f"  n={n:2d}: {n}²+{n}+41 = {value:5d}  {'prime' if prime else 'NOT PRIME'}{flag}")
```

Run this. Watch it succeed forty times in a row, then fail spectacularly. That is why checking examples is not a proof.

The same asymmetry works the other way for existence:

**To prove "there exists," you need exactly one example** — called a *witness*.

"There exists a prime greater than a trillion" — one example suffices.
"There does not exist a solution to $x^2 = -1$ in real numbers" — now you need to prove there's no example anywhere. That's harder.

---

## If-Then: The Engine of Proof

Almost every proof takes the form: **if** (some conditions hold) **then** (some conclusion follows).

There is one rule about "if-then" that surprises almost everyone:

"If it rains, the ground is wet."

When does this statement fail? Only when it rains AND the ground is dry. If it doesn't rain, the statement makes no claim about the ground at all. Whether the ground is wet or dry, the statement is not violated. So "if-then" is false in exactly one situation: the condition is true and the conclusion is false.

| It rains? | Ground wet? | "If rain then wet" |
|---|---|---|
| Yes | Yes | True |
| Yes | No | **False** |
| No | Yes | True |
| No | No | True |

This seems strange at first. But it is the only definition that makes mathematical reasoning coherent — and you will see why in M-001 when we start writing proofs.

One consequence worth knowing now: **the contrapositive**. "If P then Q" is logically identical to "if not-Q then not-P."

"If it rains, the ground is wet" says the same thing as "if the ground is dry, it's not raining."

Both statements say: rain and dry ground cannot coexist. They are the same claim, stated from opposite ends.

```python
# The truth table in code — seeing the pattern
print("Truth table for 'If P then Q'")
print()
print(f"{'P':>6}  {'Q':>6}  {'P→Q':>8}")
print("-" * 26)

for P in [True, False]:
    for Q in [True, False]:
        implies = (not P) or Q      # P→Q is false only when P is True and Q is False
        print(f"{str(P):>6}  {str(Q):>6}  {str(implies):>8}")

print()
print("The only False row: P=True, Q=False.")
print("Every other combination makes P→Q true.")
```

---

## Why Does Any of This Matter?

You might be wondering: why does a mathematics curriculum start with logic? You came here to learn calculus, linear algebra, and real analysis — not philosophy.

Here is why this matters: every proof you will ever write uses these ideas. When you prove something by induction (next lesson), you are using "for every n." When you prove something by contradiction, you are assuming a condition and deriving that the conclusion is false — then concluding the condition couldn't have been true. When you state a theorem, you are making an "if-then" claim.

If you don't know how these pieces work, proofs will feel like magic tricks — symbols rearranging according to rules you don't understand. Once you see the logical skeleton beneath every proof, they become transparent. And you can write your own.

---

## One More Thing: The Difference Between "Always" and "Sometimes"

The negation of "for all $x$, $P(x)$ is true" is "there exists an $x$ where $P(x)$ is false."

Not "for all $x$, $P(x)$ is false." Just one exception.

And the negation of "there exists an $x$ where $P(x)$ is true" is "for all $x$, $P(x)$ is false."

These negation rules sound obvious but they get confused constantly, even by experienced mathematicians. The next time you see someone claim a rule "always works" and you find one counterexample, you have disproved them. You haven't disproved "usually works" — just "always."

---

## Before You Move On

Check you can answer these without looking back:

1. Why is "$x^2 > 0$" not a mathematical statement on its own? What would you need to add to make it one?

2. Euler's formula $n^2 + n + 41$ was prime for $n = 0$ through $39$. Forty successful checks. Did this prove the formula generates primes forever? Why not?

3. If "whenever it snows, school is cancelled" is true, and school is open today, what can you conclude? *(Hint: use the contrapositive.)*

---

## What Comes Next

M-001 uses these ideas immediately. We start with the Gauss sum problem — and discover the technique that lets you prove something about every whole number without checking any of them individually.
