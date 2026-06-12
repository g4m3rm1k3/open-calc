# M-004 — Inequalities and the Ordered Field

**Phase 1 · Algebra Rebuilt · Lesson 2 of 5**

---

Take the true statement $2 < 5$. Multiply both sides by $3$: you get $6 < 15$. Still true.

Now multiply both sides of $2 < 5$ by $-1$. You get $-2$ and $-5$. Is $-2 < -5$? No — on the number line, $-2$ sits to the *right* of $-5$, so $-2 > -5$. The inequality flipped direction.

Every algebra student is told: *multiplying by a negative number flips the inequality.* Almost nobody is told why — it is handed down as a rule to memorise, alongside a dozen others like it ("flip when you divide by a negative," "flip when you take reciprocals of positives," and so on). Today we are going to derive all of these from two simple assumptions, and in the process find out what "two simple assumptions" can even mean for something as basic as size.

---

## What the Field Axioms Cannot Tell You

In M-003, we built every rule of algebra — $a \cdot 0 = 0$, $(-1)(-1) = 1$, all of it — from nine field axioms. Go back and look at those nine rules. Not one of them mentions "bigger" or "smaller." They describe how $+$ and $\times$ behave, full stop.

Here is the test: could you use only the field axioms to decide whether $3 > 2$ or $2 > 3$? Try it. You can prove $3 = 2 + 1$. You can prove $2 + 1 \neq 2$ (otherwise $1 = 0$, violating M3). But "$3$ is bigger than $2$" is a statement about *order* — about left and right on a line — and the field axioms are silent on that. As far as the nine axioms are concerned, $\mathbb{R}$ is just a set with two operations. It has no left, no right, no up, no down.

But you *do* use order, constantly. Every time you say "for $x$ large enough," every time you sketch a graph and put bigger numbers further right, you are using a fact that the field axioms do not supply. We need to add it.

---

## Stop and Think: What's the Minimum You'd Need to Add?

Before reading on, try this. You are allowed to pick any number of new rules about "positive" and "negative" — as few as possible — such that every inequality fact you know (multiplying flips signs, squares are non-negative, etc.) becomes provable.

What is the *smallest* set of new assumptions that could possibly work? What would they need to guarantee?

Here's a hint at the shape of the answer: any rule about order has to ultimately come down to **which numbers count as positive**, because $a > b$ should just mean "the gap $a - b$ is a positive amount." So the question becomes: what do we need to assume about the set of positive numbers?

---

## Two New Axioms

Two assumptions turn out to be enough. Here they are, in plain English first.

**Look at any specific number — say $7$, or $-3$, or $0$.** Exactly one of the following is true: it is positive, it is zero, or it is negative. Never two of these at once (a number can't be both positive and negative), and never none of them (every number lands in one of the three bins).

This feels too obvious to bother stating. But notice what it's actually claiming: it says the real numbers split, with no leftovers and no overlaps, into exactly three pieces. Mathematicians have a name for a statement that says "exactly one of three possibilities always holds": they call it **trichotomy** — from Greek roots meaning "cut into three" (*tri-* = three, *-khotomia* = cutting). The word is just a label for the picture you already have in your head: every number falls into exactly one of three bins, with nothing left over and no overlap. From here on, we'll call this property trichotomy.

**Axiom O1 (Trichotomy).** For every real number $a$, exactly one of the following holds: $a > 0$, $a = 0$, or $a < 0$.

Now the second assumption. Take two positive numbers — say $3$ and $5$. Add them: $8$, still positive. Multiply them: $15$, still positive. Try to escape the positives using only addition and multiplication starting from positive numbers, and you can't — you're stuck inside the set of positive numbers forever.

Contrast this with, say, the *even* integers under multiplication by an odd number: $4 \times 3 = 12$ — still even, you can't escape there either. But the even integers *under addition with an odd number* — $4 + 3 = 7$ — that escapes; $7$ isn't even. Some sets trap you under some operations and not others. When a set traps every result of an operation back inside itself, mathematicians say the set is **closed** under that operation — the set has no "exit" via that operation. The positives are closed under addition and closed under multiplication.

**Axiom O2 (Closure of the positives).** If $a > 0$ and $b > 0$, then $a + b > 0$ and $a \cdot b > 0$.

That's it. Two axioms — trichotomy and closure of the positives. Everything else about inequalities, including the flip rule you started with, is now a *theorem*: a logical consequence of O1, O2, and the nine field axioms from M-003.

---

## Turning "Bigger" Into Algebra

We have axioms about *positive numbers*, but the question we started with was about $>$. We need one more piece: a definition that connects them.

$$a > b \quad \stackrel{\text{def}}{=} \quad a - b \text{ is positive}$$

"Greater than" simply means "the difference is positive." Check it against what you already believe: $5 > 2$ because $5 - 2 = 3 > 0$. And $-2 > -5$ because $-2 - (-5) = 3 > 0$ — yes, this matches the number-line picture from the opening, where $-2$ sat to the right of $-5$. The algebraic definition and the geometric picture agree, which is reassuring — it means we've captured the right idea.

($a < b$ is defined the symmetric way: $b - a$ is positive. And $a \geq b$ means "$a > b$ or $a = b$.")

---

## The Geometric Picture, Made Precise

Here is what multiplying by $-1$ *does*, geometrically. Picture the number line as a rigid ruler with zero fixed in place. Multiplying every point by $-1$ takes a point at distance $d$ to the right of zero and moves it to distance $d$ to the *left* — and vice versa. The whole line flips over, pivoting on zero, like a reflection in a mirror placed at $0$.

```python
import matplotlib.pyplot as plt

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 4))
fig.patch.set_facecolor('#0f1117')

def draw_line(ax, points, colors, labels, title):
    ax.set_facecolor('#0f1117')
    ax.set_xlim(-6, 6)
    ax.set_ylim(-0.5, 1.0)
    ax.axis('off')
    ax.axhline(0, color='#3a4060', lw=1.5)
    for x in range(-5, 6):
        ax.plot(x, 0, '|', color='#333', ms=8)
        ax.text(x, -0.3, str(x), color='#555', fontsize=9, ha='center')
    for x, c, lab in zip(points, colors, labels):
        ax.plot(x, 0, 'o', color=c, ms=10, zorder=3)
        ax.text(x, 0.3, lab, color=c, fontsize=11, ha='center', fontweight='bold')
    ax.set_title(title, color='#4a6a80', fontsize=10, style='italic')

draw_line(ax1, [2, 5], ['#4fc3f7', '#ff9800'], ['2', '5'],
          'Before:  2 is LEFT of 5,  so  2 < 5')
draw_line(ax2, [-2, -5], ['#4fc3f7', '#ff9800'], ['-2', '-5'],
          'After multiplying by -1:  -2 is RIGHT of -5,  so  -2 > -5')

plt.tight_layout()
plt.show()
```

Watch the blue point ($2$) and orange point ($5$). Before, blue is left of orange. After flipping through zero, blue ($-2$) is to the *right* of orange ($-5$). Nothing mysterious happened — the whole line was reflected, and a reflection swaps "left of" with "right of" for every pair of points simultaneously. The order *had* to reverse. That's not a rule about numbers; it's a fact about reflections.

The algebra below is the same fact, written symbolically instead of drawn.

---

## Theorem: Multiplying by a Positive Preserves the Order

**Claim:** if $a > b$ and $c > 0$, then $ac > bc$.

By our definition, $a > b$ means $a - b > 0$. We're told $c > 0$. Both $(a-b)$ and $c$ are positive numbers — and Axiom O2 says the *product* of two positives is positive. So:

$$(a - b) \cdot c > 0$$

Expand the left side using distributivity (D1 from M-003):

$$ac - bc > 0$$

But "$ac - bc > 0$" is *exactly* the definition of $ac > bc$. Done. $\square$

Nothing here used the word "negative" — multiplying by a positive just preserves order, as you'd expect. The interesting case is next.

---

## Stop and Think: Where Does the Flip Come From?

Try to adapt the proof above to the case $c < 0$. You'll get partway through and hit a wall — Axiom O2 is about *positive* numbers, but $c$ is negative, so you can't directly say "$(a-b) \cdot c$ is positive" the way we just did.

What do you need to do to $c$ before O2 becomes usable? (Trichotomy might help here — if $c$ is in the "negative" bin, what bin is $-c$ in?)

---

## Theorem: Multiplying by a Negative Flips the Order

**Claim:** if $a > b$ and $c < 0$, then $ac < bc$.

The fix from the "stop and think": $c < 0$, so by trichotomy, $c$ is *not* positive — and trichotomy guarantees that $-c$ *is* positive (one of the three bins must hold for $-c$, and it can't be "$-c < 0$" or "$-c = 0$" without contradicting $c < 0$ — check this yourself using Theorem 2 from M-003, $(-1) \cdot a = -a$).

Now $-c$ is positive, and $(a - b)$ is positive (since $a > b$). By O2, their product is positive:

$$(a-b)(-c) > 0$$

Expand:

$$-ac + bc > 0$$

Rearranged: $bc > ac$, i.e. $ac < bc$. $\square$

**Why the flip happened, structurally:** the proof for "multiply by positive" used $(a-b) \cdot c$ directly. The proof for "multiply by negative" had to insert an extra minus sign — using $(a-b)\cdot(-c)$ instead — to get something O2 could actually apply to. That extra sign is precisely what flipped $ac - bc > 0$ into $bc - ac > 0$. The flip isn't a separate rule bolted onto the order axioms; it's the bookkeeping cost of using $-c$ instead of $c$.

---

## A Numerical Check

The proof above should hold for *every* negative $c$, not just $-1$. Let's check it against a case we haven't used yet: $a = 5 > b = 2$, multiplied by $c = -3$.

```python
a, b, c = 5, 2, -3
print(f"a > b?   {a} > {b}  is  {a > b}")
print(f"ac, bc = {a*c}, {b*c}")
print(f"ac < bc?  {a*c} < {b*c}  is  {a*c < b*c}")
```

The theorem predicts $ac < bc$ — and the third line confirms it: $-15 < -6$ is `True`. The "bigger" number $a=5$, after multiplying by $-3$, produced the "smaller" result $-15$. The flip is real, and it's exactly the size the proof says it should be.

---

## Theorem: Every Square Is Non-Negative

Here's a consequence that looks innocent but has surprisingly sharp teeth.

**Claim:** for every real number $a$, $a^2 \geq 0$.

By trichotomy, $a$ is positive, zero, or negative — exactly one. Check all three:

- **$a > 0$:** then $a \cdot a$ is a product of two positives. By O2, $a^2 > 0$.
- **$a = 0$:** then $a^2 = a \cdot a = 0 \cdot 0 = 0$ (Theorem 1 from M-003).
- **$a < 0$:** then by the same trichotomy argument used above, $-a > 0$. The product $(-a)(-a)$ is a product of two positives, so by O2, $(-a)(-a) > 0$. But $(-a)(-a) = (-1)(-1) \cdot a \cdot a = 1 \cdot a^2 = a^2$ (using Theorem 3 from M-003: $(-1)(-1)=1$). So $a^2 > 0$.

In every one of the three trichotomy cases, $a^2 \geq 0$. Since trichotomy guarantees these three cases are the *only* possibilities, the claim holds for every real $a$. $\square$

**Why this matters more than it looks like it should:** Suppose someone hands you a number $i$ with the property $i^2 = -1$. Is $i$ a real number? By the theorem just proved, every real number satisfies $a^2 \geq 0$. But $-1 < 0$. So $i^2 = -1 < 0$ is *impossible* for a real $a$. This is exactly why $i = \sqrt{-1}$ cannot live on the real number line — not by convention, but by logical necessity given O1 and O2. (M-012 picks this up: $\mathbb{C}$ satisfies the nine field axioms perfectly well, but it is impossible to add O1 and O2 to it consistently. $\mathbb{C}$ is a field, but it cannot be an *ordered* field. "Bigger" and "smaller" simply don't apply to complex numbers — there's no contradiction in $\mathbb{C}$ itself, only in trying to order it.)

---

## The Triangle Inequality

One more building block — you will meet this constantly from Phase 5 onward.

$$|a + b| \leq |a| + |b|$$

In words: the size of a sum is never more than the sum of the sizes. Geometrically, think of $a$ and $b$ as two displacements along a line (left or right). $|a+b|$ is how far you end up from where you started. $|a| + |b|$ is the total distance you *walked*, regardless of direction. Walking 3 steps right then 3 steps left covers $|a|+|b| = 6$ steps of *walking*, but you end up only $|a+b| = 0$ away from the start. You can never end up further away than the total distance walked — but you can end up much closer, if some steps cancel.

**Proof.** First, a small fact: for any real $x$, $-|x| \leq x \leq |x|$. (If $x \geq 0$, then $x = |x|$, and $-|x| \leq 0 \leq x$. If $x < 0$, then $x = -|x|$, and $x \leq 0 \leq |x|$. Either way, both inequalities hold.)

Apply this small fact to $a$ and to $b$ separately, then add the two chains of inequalities together:

$$-|a| \leq a \leq |a|$$
$$-|b| \leq b \leq |b|$$
$$\Rightarrow \quad -(|a|+|b|) \leq a+b \leq |a|+|b|$$

(Adding inequalities like this is itself a consequence of O2 — if you'd like to check it, that's Challenge 3 below.) The chain $-(|a|+|b|) \leq a+b \leq |a|+|b|$ says exactly that $a+b$ is within $|a|+|b|$ of zero in both directions — which is precisely the statement $|a+b| \leq |a|+|b|$. $\square$

**When is it an equality?** Walk through the proof again with $a=3, b=4$ (same sign): $|a+b|=7=|a|+|b|$, equality. Now $a=3,b=-4$ (opposite signs): $|a+b|=1 < 7 = |a|+|b|$, strict inequality. Equality happens exactly when $a$ and $b$ point the same direction — no cancellation, so no slack between "distance walked" and "distance from start."

**Where this goes next:** the proof that $\lim [f(x)+g(x)] = \lim f(x) + \lim g(x)$ in Phase 5 works by bounding $|f(x)+g(x) - (L+M)|$ using exactly this inequality. It is the single most-used tool in all of analysis — remember the "distance walked vs. distance from start" picture, and every limit proof that uses it will make sense immediately.

---

## Try It Yourself

**Challenge 1.** Prove: if $a > 0$ then $\frac{1}{a} > 0$.

*Hint: by trichotomy, $\frac{1}{a}$ is positive, zero, or negative. Rule out the last two. (Zero is easy — recall $a \cdot \frac{1}{a} = 1$ from M4, and $a \cdot 0 = 0$.) For "negative," suppose $\frac{1}{a} < 0$ and see what O2 forces $a \cdot \frac{1}{a}$ to be.*

**Challenge 2.** Find the broken step in this "proof" that $1 > 2$:

- $1 > 0$ (true, by O1/trichotomy)
- Multiply both sides by $-1$: $1 \cdot (-1) > 0 \cdot (-1)$
- Simplify: $-1 > 0$
- Add $2$ to both sides: $1 > 2$

*Which theorem from this lesson does the second line violate?*

**Challenge 3.** Prove: if $a > b$ and $c > d$, then $a + c > b + d$ (this is the "adding inequalities" step used silently in the triangle inequality proof above).

*Hint: $a > b$ means $a - b > 0$, and $c > d$ means $c - d > 0$. What does O2 say about their sum?*

**Challenge 4.** Prove the reverse triangle inequality: $\big||a|-|b|\big| \leq |a-b|$.

*Hint: write $a = (a-b) + b$ and apply the triangle inequality. Then write $b = (b-a)+a$ and do it again. Combine the two results using trichotomy on the sign of $|a|-|b|$.*

---

## What Comes Next

We now have eleven axioms: nine for arithmetic (M-003), two for order (this lesson). Together they describe an **ordered field** — and $\mathbb{Q}$, the rationals, satisfies all eleven of them too. So does $\mathbb{R}$. From the axioms alone, $\mathbb{Q}$ and $\mathbb{R}$ are indistinguishable.

But $\sqrt{2} \notin \mathbb{Q}$ (M-001 proved this). So $\mathbb{Q}$ has *holes* — places on the line where, intuitively, a number "should" exist but doesn't. $\mathbb{R}$ has no holes. What property could possibly capture "no holes" in the language of axioms? That's a question for later in the curriculum — completeness is one of the deepest ideas in analysis.

First, M-005 puts the eleven axioms to work on something concrete: deriving the quadratic formula from scratch, with every step justified by an axiom or a theorem we've already proved.
