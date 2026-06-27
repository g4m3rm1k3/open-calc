# Orthogonal Sets, Orthonormal Sets, and the Pythagorean Theorem

## Every piece defined before it is used. Nothing assumed.

---

## What this chapter assumes you already know

```
✓ vectors
✓ vector addition
✓ scalar multiplication
✓ matrices
✓ RREF
```

Nothing else. If you know those five things, you have everything
needed to understand this entire chapter.

---

## Definitions vs Theorems — the distinction that prevents confusion

**Definition** — a name we choose. Not something to prove. Just an
agreed-upon label for a concept.

**Theorem** — a fact we prove using definitions. Something that must
be shown to be true, not just declared.

Throughout this document, every section is labeled as one or the
other, so you always know whether you're reading a declaration or
a proof.

---

## Variable names used in this chapter

Throughout this chapter, letters like u, v, w stand for vectors.
They are no different from using x in algebra.

```
u = (3, 4)    means "the vector named u, with entries 3 and 4"
v = (1, 2)    means "the vector named v, with entries 1 and 2"
```

The letters u, v, w are just convenient names. Any letter could
be used — these are the standard ones for vectors.

---

## Why are we learning this at all?

Before this chapter, you could add vectors, subtract vectors, and
multiply by scalars. But there were questions you still couldn't
answer:

- How long is this vector?
- Are these two vectors perpendicular?
- How similar are two vectors to each other?

The inner product is one single operation that answers all three.
Once you know how to compute it, everything else in this chapter
follows directly from it.

---

## Piece 1 [Definition]: The inner product

You already know the dot product:

```
u = (3, 4)
v = (1, 2)

u · v = 3·1 + 4·2 = 3 + 8 = 11
```

The inner product for vectors IS the dot product. Exactly the same
calculation, just written with angle brackets:

```
⟨u, v⟩ = 3·1 + 4·2 = 3 + 8 = 11
```

These all mean the same thing:

```
dot(u, v)     ← MATLAB
u · v         ← physics notation
⟨u, v⟩       ← math notation (what your textbook uses)
```

One operation, three different ways of writing it.

**Why angle brackets?** Because later, for functions and matrices,
the formula changes — but mathematicians wanted one consistent
notation. So ⟨u, v⟩ means "apply whatever inner product rule this
space uses." For vectors, that rule is the dot product.

**Order does not matter:**

```
⟨u, v⟩ = ⟨v, u⟩
```

Because 3·1+4·2 = 1·3+2·4. Multiplication is commutative, so
swapping the two vectors gives the same result. We will use this
fact later when combining cross terms.

**Try it yourself:** compute ⟨u, v⟩ for u=(2,1) and v=(1,−2).

```
⟨u, v⟩ = 2·1 + 1·(−2) = 2 − 2 = 0
```

That zero will matter shortly.

---

## Piece 2 [Definition]: ⟨v, v⟩ — same vector in both slots

When the same vector goes in BOTH slots, every entry gets multiplied
by itself:

```
v = (3, 4)

⟨v, v⟩ = 3·3 + 4·4 = 9 + 16 = 25
```

Multiplying a number by itself = squaring it. So ⟨v,v⟩ always
produces a sum of squares. A sum of squares is always positive or
zero — never negative.

**Try it yourself:** compute ⟨v,v⟩ for v=(1, 2, 3).

```
⟨v,v⟩ = 1·1 + 2·2 + 3·3 = 1 + 4 + 9 = 14
```

---

## Piece 3 [Definition]: The norm (length of a vector)

**Definition:** The norm ||v|| is the size or length of a vector:

```
||v|| = √⟨v,v⟩
```

**Why the square root?** ⟨v,v⟩ measures length SQUARED. Taking the
square root converts "length squared" back into ordinary length —
exactly like finding the side of a square from its area. If area=25,
side=√25=5.

Using v = (3, 4):

```
||v|| = √⟨v,v⟩ = √25 = 5
```

This is identical to the length formula √(3²+4²) = √(9+16) = √25 = 5.

**The swap you will use constantly:**

Squaring both sides of the definition gives:

```
||v||² = ⟨v,v⟩
```

"Norm squared" and "inner product with itself" are the same thing,
written two different ways. Whenever you see one, you can replace
it with the other.

**Try it yourself:** find ||v|| for v=(1, 2, 3).

```
||v|| = √14 ≈ 3.74
```

```matlab
v = [3; 4];
norm_v = norm(v)
% Output: 5
```

---

## Piece 4 [Definition]: Unit vectors

**Definition:** A unit vector is any vector whose norm equals
exactly 1:

```
||u|| = 1  →  u is a unit vector
```

This is the definition — not something to verify from geometry first.
If the norm equals 1, the vector IS a unit vector, by definition.

Example: u = (3/5, 4/5)

```
||u|| = √((3/5)² + (4/5)²) = √(9/25 + 16/25) = √(25/25) = √1 = 1 ✓
```

**Why unit vectors matter:** they represent pure direction with no
size information mixed in. Scaling any vector by 1/||v|| always
produces a unit vector pointing the same direction.

**Try it yourself:** is (1/√2, 1/√2) a unit vector?

```
||(1/√2, 1/√2)|| = √((1/√2)² + (1/√2)²) = √(1/2 + 1/2) = √1 = 1 ✓
```

---

## So far:

```
✓ inner product   — multiply matching entries, add them up
✓ norm            — √⟨v,v⟩, the length of a vector
✓ unit vector     — a vector with norm = 1
```

These three ideas are enough to understand everything that follows.

---

## Piece 5 [Definition]: Orthogonal (two vectors)

**Definition:** Two vectors are orthogonal when their inner product
equals zero:

```
⟨u, v⟩ = 0  →  orthogonal
```

This is the definition — not a property to check after determining
perpendicularity by other means. If ⟨u,v⟩=0, the vectors ARE
orthogonal, full stop.

**But WHY does zero mean perpendicular?**

Picture two arrows. If they point in similar directions, their inner
product is positive — each one "contributes" movement in the other's
direction. If they point in opposite directions, the inner product
is negative. If neither arrow contributes ANY movement in the other's
direction, the inner product becomes exactly zero. That happens
precisely when they meet at a right angle.

```
Positive inner product     Zero              Negative
(similar directions)       (perpendicular)   (opposite directions)

  ↗                         ↑                  ←
 ↗                          |                       →
                            |
                            +-----→
```

So ⟨u,v⟩=0 became the mathematical test for perpendicular.

Example — orthogonal:

```
u = (1, 0)    ← points right
v = (0, 1)    ← points up

⟨u, v⟩ = 1·0 + 0·1 = 0  →  orthogonal ✓
```

Example — NOT orthogonal:

```
u = (1, 1)    ← points up-right
v = (0, 1)    ← points up

⟨u, v⟩ = 1·0 + 1·1 = 1  ≠  0  →  NOT orthogonal
```

These share an "upward" component — they are not perpendicular.

**Try it yourself:** are u=(2,1) and v=(1,−2) orthogonal?

```
⟨u, v⟩ = 2·1 + 1·(−2) = 2 − 2 = 0  →  orthogonal ✓
```

---

## Common mistakes

```
❌ Orthogonal means parallel
   No. It means perpendicular (inner product = 0).

❌ Orthogonal means norm = 1
   No. That's a unit vector. Orthogonal is about the relationship
   between TWO vectors, not the size of one.

❌ Orthonormal means only unit length
   No. Orthonormal means BOTH orthogonal AND unit length.
   Both conditions must hold.
```

---

## Piece 6 [Definition]: What a SET is

A set is just a collection of objects, written in curly braces:

```
{u₁, u₂, u₃}
```

This means "a collection of three vectors named u₁, u₂, and u₃."
Nothing more. Sets don't have to be ordered. The curly braces just
mean "these things belong together as a group."

---

## Piece 7 [Definition]: Orthogonal SET

**Definition:** A set {u₁, u₂, u₃, ...} is orthogonal when EVERY
possible pair from the set has inner product = 0.

For three vectors, the possible pairs are:

```
(u₁ and u₂)
(u₁ and u₃)
(u₂ and u₃)
```

That's every way to choose two different vectors from the set of
three. Every pair must satisfy:

```
⟨u₁, u₂⟩ = 0
⟨u₁, u₃⟩ = 0
⟨u₂, u₃⟩ = 0
```

Why check every pair? Because the set being orthogonal means no
two members "overlap" with each other. If even one pair has a
nonzero inner product, those two vectors are not perpendicular,
and the set fails.

---

## Piece 8 [Definition]: Orthonormal SET

**Definition:** An orthonormal set requires TWO things to BOTH
be true:

```
1. Every pair:       ⟨uᵢ, uⱼ⟩ = 0   (orthogonal — no overlap)
2. Every individual: ||uᵢ|| = 1      (unit vector — norm = 1)
```

**Why is this useful?** Orthogonal vectors don't interfere with
each other. Unit vectors have no size mixed in — just direction.
An orthonormal set combines both advantages. Later you'll see that
orthonormal sets make coordinates, projections, and matrix
computations dramatically simpler. They are the "cleanest" possible
basis a space can have.

---

## Piece 9 [Theorem preparation]: How inner products expand

Before the proof, you need to understand how expanding
⟨u1+u2, u1+u2⟩ works. This is algebra, not new math.

**Regular algebra first:**

```
(2 + 3)² = 25
```

Getting there by expanding:

```
(2 + 3)(2 + 3)
= 2·2 + 2·3 + 3·2 + 3·3
= 4  +  6  +  6  +  9
= 25
```

The two middle terms (2·3 and 3·2) are equal, so they combine:

```
= 4 + 2·(6) + 9 = 25
```

The "2" in front comes from these two equal middle terms combining.

In general: (a+b)² = a² + 2ab + b²

**Now with inner products:**

The same expansion works for inner products, because ⟨u,v⟩=⟨v,u⟩
(order doesn't matter, from Piece 1). So the two middle terms are
again equal and combine.

With u1=(1,0) and u2=(0,1):

```
u1 + u2 = (1,1)
```

Direct calculation:

```
⟨(1,1), (1,1)⟩ = 1·1 + 1·1 = 2
```

Expanded calculation:

```
⟨u1+u2, u1+u2⟩
= ⟨u1,u1⟩ + ⟨u1,u2⟩ + ⟨u2,u1⟩ + ⟨u2,u2⟩
```

Each piece:

```
⟨u1,u1⟩ = 1·1 + 0·0 = 1   ← diagonal term (same vector, both slots)
⟨u1,u2⟩ = 1·0 + 0·1 = 0   ← cross term (different vectors)
⟨u2,u1⟩ = 0·1 + 1·0 = 0   ← cross term (same as above, equal)
⟨u2,u2⟩ = 0·0 + 1·1 = 1   ← diagonal term (same vector, both slots)
```

The two cross terms are equal (both 0), so they combine into
2⟨u1,u2⟩:

```
= ⟨u1,u1⟩ + 2⟨u1,u2⟩ + ⟨u2,u2⟩
= 1 + 2(0) + 1
= 2  ✓
```

**Diagonal terms** — inner product of a vector with ITSELF.
**Cross terms** — inner product of TWO DIFFERENT vectors.

In an orthogonal set, cross terms are always zero because
⟨u1,u2⟩=0 by definition of orthogonal.

---

## Piece 10 [Theorem]: The Pythagorean Theorem

**What it says:**

If {u₁, u₂} is an orthogonal set, then:

```
||u₁ + u₂||² = ||u₁||² + ||u₂||²
```

This is ONLY true when the vectors are orthogonal.

**Why this is the same as geometry:**

```
      ● ← tip of u₁+u₂ (the hypotenuse)
     /|
    / |
   /  | ← u₂ (one leg, pointing up)
  /   |
 /    |
●-----● ← u₁ (other leg, pointing right)
```

u₁ and u₂ are perpendicular (orthogonal). Their sum u₁+u₂ is the
hypotenuse. The theorem says: hypotenuse² = leg₁² + leg₂².
That is exactly Pythagoras, written in vector language.

**The proof — every step explained:**

```
||u₁ + u₂||²
```

Start with the left side.

```
= ⟨u₁+u₂, u₁+u₂⟩
```

Swap norm-squared for inner-product-with-itself.
(From Piece 3: ||v||²=⟨v,v⟩, here v = u₁+u₂.)

```
= ⟨u₁,u₁⟩ + 2⟨u₁,u₂⟩ + ⟨u₂,u₂⟩
```

Expand using the distribution law from Piece 9.
One diagonal term + one cross term + one diagonal term.

```
= ⟨u₁,u₁⟩ + 2(0) + ⟨u₂,u₂⟩
```

Replace ⟨u₁,u₂⟩ with 0.
Why 0? Because u₁ and u₂ are orthogonal (Piece 5/7), and
orthogonal means inner product = 0.

The cross term 2⟨u₁,u₂⟩ is the ONLY thing preventing
||u₁+u₂||² from equaling ||u₁||²+||u₂||². Orthogonality kills
it. Once the cross term disappears, only the two squares remain.
This is the central idea of the entire proof.

```
= ⟨u₁,u₁⟩ + ⟨u₂,u₂⟩
```

2×0 = 0. Middle term gone.

```
= ||u₁||² + ||u₂||²
```

Swap each ⟨uᵢ,uᵢ⟩ back to ||uᵢ||².
(From Piece 3: ⟨v,v⟩=||v||², used backwards.)

Done.

---

## MATLAB confirmation

```matlab
% Two orthogonal vectors
u1 = [1; 0];
u2 = [0; 1];

% Confirm orthogonal
inner = dot(u1, u2)
% Output: 0

% Confirm Pythagorean theorem holds
left_side  = norm(u1 + u2)^2
right_side = norm(u1)^2 + norm(u2)^2
match = abs(left_side - right_side) < 1e-10
% Output: left_side=2, right_side=2, match=1 (true)
```

```matlab
% Non-orthogonal vectors — theorem fails
% v1 and v2 don't meet at a right angle, so Pythagoras shouldn't hold
v1 = [1; 1];
v2 = [0; 1];

inner_v = dot(v1, v2)
% Output: 1  (NOT zero — NOT orthogonal)

left_v  = norm(v1 + v2)^2
right_v = norm(v1)^2 + norm(v2)^2
match_v = abs(left_v - right_v) < 1e-10
% Output: left_v=5, right_v=3, match_v=0 (false)
% Theorem fails — orthogonality is required, not optional.
```

---

## What comes next

The next few chapters build directly on these four ideas:

```
inner product → norm → orthogonal → orthonormal
```

**Gram-Schmidt** starts with ordinary vectors, makes them
orthogonal, then makes them unit vectors, producing an
orthonormal basis.

**QR factorization** — a matrix decomposition using
orthonormal vectors.

**Least squares** — finding the best approximate solution
to a system, using orthogonal projection.

**Principal Component Analysis** — used in machine learning
and data science, built entirely on orthonormal bases.

You don't need to understand those yet. Just know that the
four ideas above are the foundation everything else sits on.
