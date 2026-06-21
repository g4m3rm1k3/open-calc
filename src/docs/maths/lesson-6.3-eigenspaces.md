# Lesson 6.3 — Eigenspaces

## What You Will Build

A MATLAB function that finds the FULL eigenspace for a given
eigenvalue (not just one eigenvector, but every eigenvector for that
eigenvalue, packaged as a basis), applied to a case where one
eigenvalue has more than one independent eigenvector. A JavaScript
visualization shows a 2D eigenspace as a plane, with individual
eigenvectors as arrows lying inside it.

By the end of this lesson, "eigenspace" stops sounding like new
vocabulary and becomes: the null space of `(A - lambda*I)`, a concept
you already fully understand, just relabeled for this specific
context.

---

## What You Need To Know First

- Lesson 6.1: `(A - lambda*I)v = 0`, row reduction, free variables
- Null space: the set of all vectors a matrix sends to zero, and how
  to find a basis for it via row reduction

---

## The Lesson

### What Problem Is This Solving?

Lesson 6.1 found ONE eigenvector per eigenvalue. But for some matrices,
a single eigenvalue can have MORE than one independent eigenvector —
not just scalar multiples of each other, but genuinely different
directions, all sharing the same stretch factor `lambda`.

```matlab
A = [2 0 0; 0 2 0; 0 0 5];
[V, D] = eig(A)
```

Run this. You get:

```
V =
     1     0     0
     0     1     0
     0     0     1

D =
     2     0     0
     0     2     0
     0     0     5
```

**Walkthrough:** eigenvalue 2 appears TWICE on `D`'s diagonal, each
time paired with a different eigenvector — `(1,0,0)` and `(0,1,0)`.
Both are genuine eigenvectors for `lambda=2`: check `A*(1,0,0) =
(2,0,0) = 2*(1,0,0)`, and separately `A*(0,1,0) = (0,2,0) =
2*(0,1,0)`. Two independent directions, same eigenvalue.

**Algebraic lens:** in Lesson 6.1, every eigenvalue had exactly ONE
independent eigenvector direction (up to scaling). Here, `lambda=2`
has TWO. The full set of every vector satisfying `(A-2I)v=0` is no
longer just a single line — it is an entire PLANE (every combination
of `(1,0,0)` and `(0,1,0)`).

**Geometric lens:** this matrix stretches the entire xy-plane by
factor 2 uniformly — there is no single special direction within that
plane, EVERY direction in it is equally an eigenvector, because the
matrix treats the whole plane identically.

---

### Defining Eigenspace

The **eigenspace** for a given eigenvalue `lambda` is the set of ALL
vectors `v` (including zero) satisfying `(A - lambda*I)v = 0`.

This is exactly the **null space** of `(A - lambda*I)` — a concept you
already know how to compute, just with a new name attached because of
the specific context (it always pairs with an eigenvalue).

```matlab
A = [2 0 0; 0 2 0; 0 0 5];
lambda = 2;
eigenspace_basis = null(A - lambda*eye(3))
```

Run this. You get:

```
eigenspace_basis =
     1     0
     0     1
     0     0
```

**Walkthrough:** `null()` returns TWO columns this time, not one —
because the eigenspace for `lambda=2` is 2-dimensional here (a plane,
not a line). Each column is one basis vector for that eigenspace:
`(1,0,0)` and `(0,1,0)`.

**Algebraic lens:** "eigenspace" is not a new computational technique
— it is the null-space technique from row reduction, applied to
`(A-lambda*I)`, with the result reported as a SET (a basis with
possibly more than one vector) rather than a single eigenvector. Every
single-eigenvector case from Lesson 6.1 was secretly always finding a
1-dimensional eigenspace; this lesson is the first time that dimension
is bigger than 1.

**Geometric lens:** a 1-dimensional eigenspace is a line through the
origin. A 2-dimensional eigenspace, like this one, is a flat plane
through the origin. Every single point on that plane is a valid
eigenvector for `lambda=2` — not just two special directions, the
entire infinite plane.

---

### Geometric Multiplicity: Counting the Dimension

**The problem:** give a name to "how many independent eigenvectors
does this eigenvalue have," and compute it directly.

```matlab
A = [2 0 0; 0 2 0; 0 0 5];
lambda = 2;
geometric_multiplicity = size(null(A - lambda*eye(3)), 2)
```

Run this. You get:

```
geometric_multiplicity =
     2
```

**Walkthrough:** `size(..., 2)` reports the number of COLUMNS of the
null-space basis — which is exactly the number of independent
eigenvectors `lambda=2` has, i.e. the dimension of its eigenspace.
This number is called the **geometric multiplicity** of that
eigenvalue.

```matlab
lambda_5 = 5;
geometric_multiplicity_5 = size(null(A - lambda_5*eye(3)), 2)
```

Run this. You get:

```
geometric_multiplicity_5 =
     1
```

**Algebraic lens:** `lambda=5` has geometric multiplicity 1 — just one
independent direction, `(0,0,1)`, matching the single-eigenvector
pattern from every example in Lesson 6.1. Geometric multiplicity of 1
is the ORDINARY case; multiplicity greater than 1 (like `lambda=2`
here) is the special case this lesson introduces.

**Geometric lens:** geometric multiplicity directly answers "is this
eigenvalue's special direction a line (multiplicity 1), a plane
(multiplicity 2), or higher?"

---

### A Case Where Eigenspace Is Still Just a Line

**The problem:** confirm the eigenspace concept reduces exactly to
Lesson 6.1's work when geometric multiplicity is 1, so nothing from
that lesson needs to be relearned.

```matlab
A = [7 -10; 2 -2];
lambda = 2;
eigenspace_basis = null(A - lambda*eye(2))
geometric_multiplicity = size(eigenspace_basis, 2)
```

Run this. You get:

```
eigenspace_basis =
   -0.8944
   -0.4472

geometric_multiplicity =
     1
```

**Walkthrough:** this is the exact matrix and eigenvalue from Lesson
6.1. `eigenspace_basis` has just ONE column — the single eigenvector
already found there. "Eigenspace" here is just a 1-dimensional line,
the same line described in Lesson 6.1, now given its formal name.

**Algebraic lens:** nothing computational changes between "find the
eigenvector" (Lesson 6.1) and "find the eigenspace" (this lesson) when
geometric multiplicity is 1 — they are the same calculation, same
`null()` call, same row reduction. The new vocabulary only matters when
multiplicity is greater than 1, which is when a single eigenvector is
no longer enough to describe everything.

---

### Visualizing a 2D Eigenspace as a Plane

```javascript
function visualizeEigenspace() {
    const canvas = document.createElement('canvas');
    canvas.width = 450;
    canvas.height = 450;
    document.body.appendChild(canvas);
    const context = canvas.getContext('2d');

    context.fillStyle = '#f5f5f5';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#000000';
    context.font = '13px sans-serif';
    context.fillText('Eigenspace for lambda=2: every vector in this shaded region', 10, 20);
    context.fillText('is an eigenvector. Two example basis vectors shown in red.', 10, 38);

    const originX = canvas.width / 2;
    const originY = canvas.height / 2 + 20;
    const scale = 60;

    // shade the entire reachable plane (here, all of 2D, since the
    // eigenspace for this example matrix's lambda=2 IS the whole xy-plane
    // when viewed inside its own 2D slice)
    context.fillStyle = 'rgba(52, 152, 219, 0.15)';
    context.fillRect(0, 60, canvas.width, canvas.height - 60);

    context.strokeStyle = '#dddddd';
    context.beginPath();
    context.moveTo(0, originY);
    context.lineTo(canvas.width, originY);
    context.moveTo(originX, 60);
    context.lineTo(originX, canvas.height);
    context.stroke();

    const basisVectors = [[1, 0], [0, 1]];
    context.strokeStyle = '#e74c3c';
    context.lineWidth = 2;
    basisVectors.forEach(v => {
        context.beginPath();
        context.moveTo(originX, originY);
        context.lineTo(originX + v[0] * scale, originY - v[1] * scale);
        context.stroke();
    });
}

visualizeEigenspace();
```

Run this. The entire visible plane is lightly shaded, with two red
arrows showing the two basis vectors `(1,0)` and `(0,1)`. Unlike
Lesson 6.1's visualization (where most of the plane was reachable only
through ROTATION-plus-stretching), here EVERY shaded point is a true
eigenvector — the shading represents the eigenspace itself, not a
general span.

**Walkthrough:** this is deliberately drawn similarly to a basis-span
picture, because that is exactly what an eigenspace is: a span of
basis vectors, specifically the null-space basis of `(A-lambda*I)`.

**Geometric lens:** compare this to Lesson 6.1's single red arrow
picture — there, only ONE direction (and its scalar multiples) was
special. Here, an entire 2D region is uniformly special, because this
particular matrix happens to stretch that whole plane by the same
factor.

---

## Connect the Pieces

An eigenspace is the null space of `(A-lambda*I)`, nothing more — you
already had every tool needed to compute one as soon as you finished
row reduction and null-space basics. Geometric multiplicity is just
"how many basis vectors does that null space have." This sets up
Lesson 6.4 directly: whether a matrix CAN be diagonalized depends
entirely on whether its eigenspaces, added together, have enough
dimension to cover the whole space — which is exactly a geometric
multiplicity question.

---

## What Breaks Without This

Assume every eigenvalue always has exactly one eigenvector (true in
every Lesson 6.1 example, false in general), and try to build a basis
of eigenvectors using only `eig()`'s default single-column-per-call
behavior incorrectly:

```matlab
A = [2 0 0; 0 2 0; 0 0 5];
[V, D] = eig(A);

% WRONGLY assuming only ONE eigenvector exists per DISTINCT eigenvalue
unique_lambdas = unique(diag(D));
fprintf('Distinct eigenvalues found: %d\n', length(unique_lambdas));
fprintf('But V actually has %d columns (eigenvectors)\n', size(V,2));
```

Run this. You get:

```
Distinct eigenvalues found: 2
But V actually has 3 columns (eigenvectors)
```

**Walkthrough:** there are only 2 DISTINCT eigenvalues (2 and 5), but
3 total eigenvectors, because `lambda=2` contributes 2 independent
ones. Code that assumes "one eigenvector per eigenvalue" and tries to
deduplicate by unique eigenvalue would silently DROP one of the two
genuinely independent directions for `lambda=2` — corrupting any later
calculation (like diagonalization in Lesson 6.4) that needs the full
set of independent eigenvectors, not one per distinct number.

---

## Definition of Done

- [ ] You can explain why "eigenspace" is just the null space of
      `(A-lambda*I)`, not a separate technique
- [ ] You can compute geometric multiplicity using
      `size(null(A-lambda*eye(n)), 2)`
- [ ] You found a matrix where one eigenvalue has geometric
      multiplicity greater than 1
- [ ] You can explain why counting DISTINCT eigenvalues is not the
      same as counting total independent eigenvectors

**Commit your work:**

```bash
git add lesson-6.3.m lesson-6.3.js
git commit -m "Lesson 6.3: Eigenspaces

Define eigenspace as null(A-lambda*I), connect directly to existing
null-space skills. Introduce geometric multiplicity as the dimension
of an eigenspace. Demonstrate a case with multiplicity greater than 1
and the failure mode of assuming one eigenvector per eigenvalue. Sets
up Lesson 6.4: similarity and diagonalization."
