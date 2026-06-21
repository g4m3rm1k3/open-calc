# Lesson 6.6 — Complex Eigenvalues and Eigenvectors

## What You Will Build

A MATLAB function that detects when a matrix's eigenvalues are
complex, extracts the real rotation-angle and scaling information
hidden inside them, and a JavaScript visualization comparing a
real-eigenvalue matrix (pure stretch) against a complex-eigenvalue
matrix (rotation).

By the end of this lesson, seeing `2.0000 + 1.7321i` in MATLAB output
stops being alarming and becomes: confirmation that this matrix
rotates space, with no real direction left unbent.

---

## What You Need To Know First

- Lesson 6.1: `det(A-lambda*I)=0`, the characteristic polynomial
- Basic familiarity that `i` represents the square root of -1 (if this
  is unfamiliar, the first section below explains exactly as much as
  is needed)

---

## The Lesson

### What Problem Is This Solving?

Every eigenvalue example so far has been a real number. But the
characteristic polynomial is just a polynomial equation, and not every
polynomial equation has real-number solutions.

```matlab
A = [0 -1; 1 0];
A
```

This matrix is a 90-degree rotation matrix — multiplying any vector by
it rotates that vector 90 degrees counterclockwise, with no
stretching.

```matlab
v = [1; 0];
Av = A*v
```

Run this. You get:

```
Av =
     0
     1
```

**Walkthrough:** `(1,0)` (pointing right) became `(0,1)` (pointing
up) — rotated 90 degrees, length unchanged. Try ANY vector with this
matrix, and it always rotates 90 degrees — there is no special
direction that escapes rotation, because EVERY direction gets rotated
identically.

**Algebraic lens:** an eigenvector requires `Av` to point in the SAME
direction as `v`. A 90-degree rotation, by its nature, never produces
output pointing the same direction as the input (except the zero
vector, which doesn't count) — so this matrix should have NO real
eigenvectors.

**Geometric lens:** Lesson 6.1's matrices always had at least one
direction that only stretched. A pure rotation matrix is the opposite
extreme: EVERY direction gets bent by the same fixed angle, none
escape.

---

### Finding the Eigenvalues: They Turn Out Complex

```matlab
syms lam
A = [0 -1; 1 0];
char_poly = det(A - lam*eye(2))
eigenvalues = solve(char_poly == 0, lam)
```

Run this. You get:

```
char_poly =
lam^2 + 1

eigenvalues =
 1i
-1i
```

**Walkthrough:** the characteristic polynomial is `lambda^2 + 1 = 0`,
which means `lambda^2 = -1`. No REAL number squares to -1 — this is
exactly why a separate number system exists for this case.
`i` is defined as the number satisfying `i^2 = -1`. The two solutions
are `lambda = i` and `lambda = -i`.

**Algebraic lens:** this confirms the geometric prediction exactly —
no real eigenvalues exist for a pure rotation matrix, because the
characteristic equation's solutions are forced to be complex.

**Geometric lens:** the absence of real eigenvalues IS the algebraic
signature of "every direction gets rotated" — if even one direction
escaped rotation, a real eigenvalue would exist for it.

---

### What the Complex Eigenvalue Encodes

**The problem:** a complex eigenvalue is not meaningless — it encodes
exactly the rotation angle and scale factor, readable directly from
its real and imaginary parts.

```matlab
A = [0 -1; 1 0];
lambda_complex = eig(A);
lambda_1 = lambda_complex(1)

real_part = real(lambda_1)
imag_part = imag(lambda_1)

magnitude = abs(lambda_1)
angle_radians = angle(lambda_1)
angle_degrees = rad2deg(angle_radians)
```

Run this. You get:

```
lambda_1 =
0 + 1.0000i

real_part =
     0

imag_part =
    1

magnitude =
     1

angle_radians =
    1.5708

angle_degrees =
    90.0000
```

**Walkthrough:** `real()` and `imag()` split a complex number `a+bi`
into its two parts, `a` and `b`. `abs()` on a complex number gives its
MAGNITUDE (distance from zero in the complex plane), computed as
`sqrt(a^2+b^2)`. `angle()` gives the angle that complex number makes,
measured the same way you'd measure a direction in 2D. `rad2deg`
converts that angle from radians to degrees.

**Algebraic lens:** `magnitude = 1` means this matrix does NOT
stretch or shrink anything — pure rotation, no scaling. `angle_degrees
= 90` means the rotation angle is exactly 90 degrees — matching
exactly what was observed directly by computing `A*(1,0)=(0,1)`
earlier.

**Geometric lens:** for a 2x2 matrix with complex eigenvalues, the
MAGNITUDE of the eigenvalue tells you the scaling factor of the
rotation (1 = no scaling, greater than 1 = spiraling outward, less
than 1 = spiraling inward), and the ANGLE tells you the rotation angle
— the complex number is not abstract, it is a compact encoding of
exactly the two numbers (scale, angle) that describe what this matrix
does geometrically.

---

### A Matrix That Both Rotates AND Scales

**The problem:** confirm the magnitude/angle reading works for a less
clean example — rotation combined with stretching.

```matlab
A = [1 -2; 2 1];
lambda_complex = eig(A);
lambda_1 = lambda_complex(1)

magnitude = abs(lambda_1)
angle_degrees = rad2deg(angle(lambda_1))
```

Run this. You get:

```
lambda_1 =
   1.0000 + 2.0000i

magnitude =
    2.2361

angle_degrees =
   63.4349
```

**Walkthrough:** `magnitude ~ 2.236` means every vector grows by about
2.236x with each application of this matrix. `angle ~ 63.4` degrees
means each application also rotates by about 63.4 degrees.

```matlab
v = [1; 0];
Av = A*v;
length_v = norm(v)
length_Av = norm(Av)
growth_ratio = length_Av / length_v
```

Run this. You get:

```
length_v =
     1

length_Av =
    2.2361

growth_ratio =
    2.2361
```

**Algebraic lens:** `norm()` computes a vector's length (its
magnitude). The growth ratio (2.2361) matches the complex eigenvalue's
magnitude exactly — confirming the eigenvalue's magnitude really does
predict the stretch factor, even though no real eigenVECTOR exists for
this rotating matrix.

**Geometric lens:** any vector fed into this matrix repeatedly would
spiral outward, growing by 2.236x and turning by 63.4 degrees on each
application — the complex eigenvalue is a compact summary of that
entire spiral behavior.

---

### Visualizing Real vs. Complex Eigenvalue Behavior

```javascript
function visualizeRealVsComplex() {
    const matrices = [
        { A: [[7, -10], [2, -2]], title: "Real eigenvalues (2, 3): two directions only stretch" },
        { A: [[0, -1], [1, 0]], title: "Complex eigenvalues (+-i): every direction rotates, none escape" }
    ];

    matrices.forEach(m => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 420;
        document.body.appendChild(canvas);
        const context = canvas.getContext('2d');

        const originX = canvas.width / 2;
        const originY = canvas.height / 2 + 10;
        const scale = 15;

        context.fillStyle = '#f5f5f5';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#000000';
        context.font = '12px sans-serif';
        context.fillText(m.title, 10, 20);

        context.strokeStyle = '#dddddd';
        context.beginPath();
        context.moveTo(0, originY);
        context.lineTo(canvas.width, originY);
        context.moveTo(originX, 0);
        context.lineTo(originX, canvas.height);
        context.stroke();

        const numTestVectors = 12;
        for (let i = 0; i < numTestVectors; i++) {
            const theta = (i / numTestVectors) * 2 * Math.PI;
            const vx = Math.cos(theta);
            const vy = Math.sin(theta);

            const Avx = m.A[0][0] * vx + m.A[0][1] * vy;
            const Avy = m.A[1][0] * vx + m.A[1][1] * vy;

            context.strokeStyle = '#3498db';
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(originX + vx * scale, originY - vy * scale);
            context.lineTo(originX + Avx * scale, originY - Avy * scale);
            context.stroke();

            context.fillStyle = '#3498db';
            context.beginPath();
            context.arc(originX + vx * scale, originY - vy * scale, 2, 0, 2 * Math.PI);
            context.fill();

            context.fillStyle = '#e74c3c';
            context.beginPath();
            context.arc(originX + Avx * scale, originY - Avy * scale, 2, 0, 2 * Math.PI);
            context.fill();
        }
    });
}

visualizeRealVsComplex();
```

Run this. Two canvases appear. In the first (real eigenvalues), blue
dots (starting points around a circle) connect to red dots (after
multiplying by `A`) mostly along lines pointing outward from center —
two of those connecting lines point EXACTLY radially (no sideways
shift at all) at the two eigenvector directions. In the second
(complex eigenvalues), every single connecting line is tilted
sideways by the same amount — a uniform rotation, with no line
pointing purely radially anywhere on the circle.

**Walkthrough:** the blue dots are 12 test vectors evenly spaced around
a circle. The red dots show where each one lands after multiplying by
`A`. A line from blue to red that points straight outward (no sideways
component) marks a real eigenvector direction. The second canvas has
NO such line — every single test vector gets shifted sideways by the
same angle, visually confirming "no real eigenvector exists" without
needing to compute anything.

---

## Connect the Pieces

A matrix's characteristic polynomial can have complex roots exactly
when no real direction escapes rotation — these are not failures of
the eigenvalue method, but a correct and meaningful result: the
eigenvalue's magnitude gives the scaling factor, its angle gives the
rotation, exactly as confirmed by direct vector-length and rotation
measurements. This closes the core Module 6 sequence: eigenvalues
(6.1), verified in MATLAB (6.2), generalized to eigenspaces (6.3),
used for diagonalization (6.4-6.5), and now extended to the case where
no real diagonalization is possible at all.

---

## What Breaks Without This

Assume `eig()` always returns real numbers, and try to use the result
directly as if it were guaranteed real:

```matlab
A = [0 -1; 1 0];
lambda = eig(A);
lambda_1 = lambda(1);

is_eigenvalue_positive = lambda_1 > 0
```

Run this. You get:

```
Warning: Imaginary parts of complex X and/or Y arguments ignored
is_eigenvalue_positive =
  logical
   0
```

**Walkthrough:** comparing a complex number with `>` silently discards
its imaginary part and compares only the real part (which is 0 here),
producing a result (`0`, meaning false) that looks like an ordinary
answer but is actually meaningless for a complex number — "positive"
is not even a well-defined concept for complex numbers the way it is
for real ones. Code that does not first check `isreal(lambda)` before
performing real-number-only operations like `>`, `<`, or sorting will
silently produce numbers that LOOK valid but answer a question that
does not actually apply.

---

## Definition of Done

- [ ] You can explain, using `A*v` directly, why a pure rotation
      matrix has no real eigenvector
- [ ] You can extract magnitude and angle from a complex eigenvalue
      using `abs()` and `angle()`
- [ ] You confirmed a complex eigenvalue's magnitude matches a direct
      `norm(Av)/norm(v)` measurement
- [ ] You can read the visualization and identify, by eye, whether a
      matrix has real eigenvalues (some radial lines) or only complex
      ones (all lines tilted uniformly)
- [ ] You can explain why comparing a complex number with `>` is
      dangerous without checking `isreal()` first

**Commit your work:**

```bash
git add lesson-6.6.m lesson-6.6.js
git commit -m "Lesson 6.6: Complex eigenvalues and eigenvectors

Show that pure rotation matrices have no real eigenvectors, derive
their complex eigenvalues from the characteristic polynomial, and
decode magnitude/angle from those complex numbers using abs() and
angle(). Confirm against direct norm() measurements. Visualize real vs
complex eigenvalue behavior side by side. Demonstrates the isreal()
check failure mode. Closes the core Module 6 sequence."
