import determinantAreaUrl from '../diagrams/la-determinant-area.svg?url'
import singularCollapseUrl from '../diagrams/la-singular-collapse.svg?url'

export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la2-003',
  slug: 'inverse-matrices',
  chapter: 'la2',
  order: 3,
  title: 'Inverse Matrices and Determinants',
  subtitle: 'How to play a transformation backwards, and why sometimes space is irreversibly flattened.',
  tags: ['inverse', 'determinant', 'singular matrix', 'identity matrix', 'area scaling'],
  aliases: 'reversing transformations ad-bc invertible singular non-invertible playing backwards',

  // ── Pedagogical Meta ───────────────────────────────────────────
  timeToComplete: 25,
  coreConcept: 'The determinant measures exactly how much a transformation scales area. If it is zero, space is squished into a lower dimension, and the transformation cannot be undone. If it is non-zero, an inverse matrix exists that perfectly rewinds the transformation.',
  prerequisites: ['la2-002'],
  nextLesson: 'null-space-and-column-space',

  // ── Hook ───────────────────────────────────────────────────────
  hook: {
    question: "If you squish space heavily with a matrix, can you always mathematically twist it back to exactly the way it was?",
    realWorldContext: "Imagine projecting a 3D video game onto your flat 2D computer screen. You lose the 'depth' (Z-axis). If I gave you just the flat image on the screen and asked, 'Exactly how far away was that character standing?', you couldn't tell me. A tall character far away looks identical to a short character up close. By squishing 3D down to 2D, information was permanently destroyed. In linear algebra, we use the 'Determinant' to measure exactly how much a matrix shrinks or expands space. If the determinant is exactly 0, it means the space was irreversibly flattened, and no 'Inverse' matrix can ever retrieve the lost information.",
    previewVisualizationId: 'LALesson06_Inverses',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    blocks: [
      { type: 'prose', paragraphs: [
      'Take $A = \\begin{bmatrix}2&1\\\\5&3\\end{bmatrix}$. Compute $\\det(A) = 2 \\cdot 3 - 1 \\cdot 5 = 1$. Because $\\det \\neq 0$, the inverse exists: $A^{-1} = \\begin{bmatrix}3&-1\\\\-5&2\\end{bmatrix}$. Verify: $A^{-1}A = \\begin{bmatrix}6-5&3-3\\\\-10+10&-5+6\\end{bmatrix} = \\begin{bmatrix}1&0\\\\0&1\\end{bmatrix} = I$. Now try $B = \\begin{bmatrix}2&4\\\\1&2\\end{bmatrix}$: $\\det(B) = 4-4 = 0$. Column 2 is twice column 1 — $B$ squishes the whole plane onto a single line. Once that happens, information is lost forever and no inverse can recover it. The **determinant** is the test: non-zero means reversible, zero means irreversible.',
      '**The inverse machine.** If you apply $A$ then immediately apply $A^{-1}$, the vector must return to where it started. So $A^{-1}A\\mathbf{v} = \\mathbf{v}$ for every vector — which means $A^{-1}A = I$, the identity matrix (the "do nothing" transformation). The inverse undoes the warp completely.',
      '**Not every matrix has an inverse.** Here is where the **determinant** enters. The determinant, written $\\det(A)$ or $|A|$, is a single number measuring how much $A$ scales area. A $2 \\times 2$ matrix with $\\det = 3$ triples all areas. With $\\det = -2$ it doubles areas AND flips space like a mirror (the negative sign is the flip).',
      ] },
      { type: 'image', src: determinantAreaUrl,
        alt: 'A parallelogram spanned by column vectors a1 and a2 of matrix A, shaded green, labeled area equals det(A) equals 5',
        caption: "det(A) is the signed area of the parallelogram spanned by A's columns." },
      { type: 'prose', paragraphs: [
      '**The fatal case: $\\det(A) = 0$.** This means $A$ squishes the entire 2D plane flat onto a line (or a point). Once space collapses, information is destroyed permanently — infinitely many different input vectors land on the same output. You cannot reconstruct the input from the output. No inverse exists.',
      '**The 3D projection example.** When a 3D video game is projected onto your 2D screen, depth information (the Z-coordinate) is permanently discarded. Short character far away = tall character close up — you cannot distinguish them from the flat image. This is a linear transformation with $\\det = 0$: the 3D space was collapsed to 2D. The projection matrix has no inverse.',
      ] },
      { type: 'image', src: singularCollapseUrl,
        alt: 'Left panel: two column vectors spanning a shaded parallelogram, labeled det not zero, reversible, area exists. Right panel: two parallel column vectors collapsed onto the same dashed line, labeled det equals zero, irreversible, flattened to a line, no inverse',
        caption: 'Non-zero determinant means the columns span real area and the map can be undone; zero determinant means everything collapses onto a line.' },
      { type: 'prose', paragraphs: [
      '**CNC application: workpiece coordinate frame.** When a CNC machine calibrates its work coordinate system, it measures 3 reference points on the workpiece. These 3 points define three vectors, and the machine computes their determinant. If the determinant is 0 (or near 0), the three points are collinear — they all lie on a single line, which is not enough to define a unique flat plane. The calibration fails. A well-set-up fixture keeps the three points spread wide apart, maximizing the determinant and ensuring a stable, invertible coordinate frame.',
      '**Predict before reading on.** You are given $A = \\begin{bmatrix}3&6\\\\2&4\\end{bmatrix}$. Without computing the full inverse formula: does $A$ have an inverse? Compute $\\det(A) = 3 \\cdot 4 - 6 \\cdot 2 = ?$. Write your answer, then check in Example 2.',
      '**Where this is heading:** When $\\det(A) = 0$, the transformation crushes space onto a line. The next lesson (Null Space and Column Space) names exactly what that line is and what input vectors got annihilated in the crush.',
      ] },
      { type: 'viz', id: 'LALesson06_Inverses',
        title: 'The Collapsing Determinant',
        mathBridge: 'Observe the yellow 1x1 unit square. Its area is exactly 1. As you slide the transformation matrix slider, watch the matrix morph. Note how the area of the yellow square perfectly matches the calculated Determinant at all times. Finally, push the slider until the columns become parallel (Dependent). Watch the determinant hit exactly 0 as the square flattens into a 1D line. The key lesson: A determinant of 0 destroys area irreparably.',
        caption: 'The determinant visually tracks the scaling factor of the grid\'s area.' },
      { type: 'viz', id: 'LALesson05_MatrixMult',
        title: 'A then A⁻¹ = Identity',
        mathBridge: 'Set the first transformation to any invertible matrix A (try a shear or rotation). Then set the second transformation to its inverse A⁻¹ (use the formula: swap main diagonal, negate off-diagonal, scale by 1/det). Press "compose" and watch the combined transformation snap back to the identity — the grid returns to its original, undistorted state. This is the meaning of $A^{-1}A = I$: the inverse perfectly cancels the original warp.',
        caption: 'Composing A with its inverse returns the grid exactly to where it started — the identity transformation.' },
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Procedure: Find the Inverse of a 2×2 Matrix',
        body: 'Step 1. Compute $\\det(A) = ad - bc$.\nStep 2. If $\\det(A) = 0$: STOP — the matrix is singular and no inverse exists.\nStep 3. Swap the main diagonal entries: $a$ moves to bottom-right, $d$ moves to top-left.\nStep 4. Negate the off-diagonal entries: $b$ becomes $-b$, $c$ becomes $-c$.\nStep 5. Scale the entire rearranged matrix by $\\frac{1}{\\det(A)}$.\nStep 6. Verify: compute $A^{-1}A$ — it must equal $I$.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 3 of 12 — Matrices & Transformations',
        body: '**Previous:** Matrix multiplication = composing transformations.\n**This lesson:** Determinant = area scaling factor. If det ≠ 0, the inverse exists and undoes the transformation.\n**Next:** Null space and column space — what happens to vectors when det = 0.',
      },
      {
        type: 'insight',
        title: 'Inverses Solve Systems of Equations',
        body: 'In high school algebra: solve $3x = 12$ by multiplying by $1/3$ (the inverse of 3). In linear algebra: solve $A\\mathbf{x} = \\mathbf{b}$ by multiplying both sides on the left by $A^{-1}$:\n\n$$A^{-1}(A\\mathbf{x}) = A^{-1}\\mathbf{b} \\implies \\mathbf{x} = A^{-1}\\mathbf{b}$$\n\nSame concept, $n$ dimensions.',
      },
      {
        type: 'warning',
        title: 'Never invert a matrix just to solve Ax = b',
        body: 'In software, NEVER write `x = inv(A) * b` or `x = np.linalg.inv(A) @ b`. It is slower and numerically less stable than `x = A \\ b` (MATLAB) or `x = np.linalg.solve(A, b)` (Python). The backslash operator uses LU factorization internally — it is the correct tool for solving systems. Reserve `inv()` only for situations where you genuinely need the entries of $A^{-1}$ for their own sake.',
      },
      {
        type: 'definition',
        title: 'Determinant — 2×2 Formula and Meaning',
        body: 'For $A = \\begin{bmatrix}a & b \\\\ c & d\\end{bmatrix}$:\n\n$$\\det(A) = ad - bc$$\n\nGeometrically: the signed area of the parallelogram formed by the two column vectors. Positive = not flipped. Negative = orientation reversed. Zero = degenerate (collapsed to a line).',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      'For a $2 \\times 2$ matrix $A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$, the formula for the determinant is incredibly simple:',
      '$ \\det(A) = ad - bc $',
      'If $ad - bc$ equals $0$, the matrix is called **Singular**. It has no inverse.',
      'If $ad - bc \\neq 0$, the matrix is invertible, and the formula for $A^{-1}$ is:',
      '$ A^{-1} = \\frac{1}{ad - bc} \\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix} $',
      'Notice how the formula requires dividing by the determinant. This algebraic formula perfectly matches our geometric intuition: if the determinant is $0$, you would divide by $0$, which breaks math. You cannot invert a squished space.'
    ],
    callouts: [
      {
        type: 'strategy',
        title: 'Memorizing the 2x2 Inverse',
        body: 'To construct the inverse: Swap the main diagonal terms (a and d), make the other two terms negative (-b and -c), and scale the whole thing by 1 over the determinant.',
      },
      {
        type: 'warning',
        title: '3x3 Inverses',
        body: 'Do not try to memorize the formula for a $3 \\times 3$ inverse. It is a massive mess of algebra utilizing "Cofactor Expansion." In practice, computers use an algorithmic process called Gaussian Elimination to find larger inverses.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'OpenMAT: Determinant and Inverse',
        mathBridge: 'MATLAB: `det(A)` computes the determinant; `inv(A)` computes the inverse (use sparingly!); `A \\ b` solves Ax=b efficiently. Verify: A * inv(A) = eye(2).',
        caption: 'Four cells: det formula, singularity threshold, solving Ax=b, and CNC coordinate frame calibration.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Determinant — area scaling, manual formula, and MATLAB',
              prose: [
                '`det(A)` computes the determinant. For $A = \\begin{bmatrix}a & b \\\\ c & d\\end{bmatrix}$, the formula is $ad - bc$. For `A = [3 1; 2 4]`: $3 \\cdot 4 - 1 \\cdot 2 = 10 \\neq 0$ — invertible. The `fprintf` line prints each part of the formula explicitly so you can trace the arithmetic.',
                'For `S = [2 4; 1 2]`: $\\det = 2 \\cdot 2 - 4 \\cdot 1 = 0$ — column 2 is $2 \\times$ column 1 (proportional). A zero determinant means the transformation squishes the entire plane onto a single line, destroying information. No inverse can recover what was annihilated.',
                '`det(F)` with `F = [0 1; 1 0]` (reflection across $y = x$) returns $-1$: the magnitude $|-1| = 1$ means area is preserved, and the negative sign means **orientation is reversed** (counterclockwise loops become clockwise). `A * inv(A)` in the last block prints the $2 \\times 2$ identity — off-diagonal entries are $\\sim 10^{-15}$ (machine epsilon), not exactly 0, because floating-point arithmetic is finite. `disp(A * A_inv)` lets you confirm this numerically.',
              ],
              code: `% Invertible matrix
A = [3 1; 2 4];
d = det(A);
fprintf('det(A) = %g  (ad - bc = %g - %g = %g)\\n', d, 3*4, 1*2, 3*4 - 1*2)

% Singular matrix (columns are proportional)
S = [2 4; 1 2];
fprintf('det(S) = %g  (columns are proportional -- singular)\\n', det(S))

% Negative det = orientation flip
F = [0 1; 1 0];  % reflection across y=x line
fprintf('det(F) = %g  (negative = orientation flipped)\\n', det(F))

% A * inv(A) should = identity
A_inv = inv(A);
disp('A * inv(A):'); disp(A * A_inv)`,
            },
            {
              id: 2,
              cellTitle: 'Watching det → 0 as a matrix becomes singular',
              prose: [
                'For `A_base = [2 3; 1 2]` with `A(2,2)` varying: the determinant is $2 \\cdot (2,2) - 3 \\cdot 1 = 2(A_{22}) - 3$. When $A_{22} = 1.5$, the determinant hits zero exactly. The loop approaches that critical value and prints `det(A)` at each step — you can watch the number approach 0.',
                'Mathematically, the $2 \\times 2$ inverse formula is $A^{-1} = \\frac{1}{\\det(A)}\\begin{bmatrix}d & -b \\\\ -c & a\\end{bmatrix}$. As $\\det(A) \\to 0$, the $1/\\det$ factor blows up, sending all entries of $A^{-1}$ to $\\pm\\infty$. MATLAB\'s `inv(A)` will return a matrix with enormous entries (or `Inf`) — not a signal that the problem is interesting, but that the problem is ill-conditioned.',
                'The formula $\\det\\begin{bmatrix}2&3\\\\1&d\\end{bmatrix} = 2d - 3$ is **linear** in $d$ — the determinant crosses zero at exactly $d = 1.5$, like a straight line crossing the $x$-axis. There is a sharp boundary: at $d = 1.4999$ the matrix is invertible (barely), at $d = 1.5$ it is singular. Near this boundary the inverse exists mathematically but has enormous entries — the system $A\\mathbf{x} = \\mathbf{b}$ becomes extremely sensitive to small changes in $\\mathbf{b}$ (a phenomenon called **ill-conditioning**). Numerical solvers measure this sensitivity via the **condition number**.',
              ],
              code: `% Start with an invertible matrix and make it singular
A_base = [2 3; 1 2];
fprintf('Original: det = %g\\n', det(A_base))

% Vary the (2,2) entry from 2 toward 1.5 (the critical value)
fprintf('\\n(2,2) entry  det(A)\\n')
for val = [2.0, 1.8, 1.6, 1.52, 1.501, 1.5001]
    A = A_base;
    A(2,2) = val;
    fprintf('  %.4f       %.6f\\n', val, det(A))
end

% Critical value: det = 0 when a(2,2) = 1.5
% 2*1.5 - 3*1 = 3 - 3 = 0
A_sing = [2 3; 1 1.5];
fprintf('\\nAt (2,2)=1.5: det = %g  (singular!)\\n', det(A_sing))`,
            },
            {
              id: 3,
              cellTitle: 'Solving Ax=b — backslash beats inv()',
              prose: [
                '`A \\ b` solves $A\\mathbf{x} = \\mathbf{b}$ via LU factorization — two triangular solves, $O(n^2)$ work given the factorization. `inv(A) * b` first computes all $n^2$ entries of $A^{-1}$ ($O(n^3)$ extra work) then multiplies, accumulating more floating-point error. Backslash is not just faster — it is numerically more stable because it avoids amplifying rounding errors through the full inverse.',
                '`norm(A*x_solve - b)` computes the residual $\\|A\\mathbf{x} - \\mathbf{b}\\|_2$ to verify accuracy — should be near `1e-15`. Use `inv(A)` only when you genuinely need the matrix entries (for analysis or symbolic work), never just to multiply by a single right-hand side vector.',
                '`norm(x_solve - x_inv) < 1e-10` confirms both approaches agree for this small $2 \\times 2$ case. The difference only matters at scale: for a $5000 \\times 5000$ system, `A\\b` requires $O(n^3)$ for LU factorization once; each subsequent solve for a new $\\mathbf{b}$ only costs $O(n^2)$. Computing `inv(A)` also costs $O(n^3)$ but materializes all $n^2 = 25{,}000{,}000$ entries, each accumulating more rounding error. The backslash operator is the professional default for exactly this reason.',
              ],
              code: `A = [3 1; 2 4];
b = [10; 8];

% Correct approach: A \ b (backslash = solve)
x_solve = A \ b;
fprintf('Solution via A\\b: x = [%.4f; %.4f]\\n', x_solve(1), x_solve(2))

% Verify: A * x should equal b
residual = norm(A * x_solve - b);
fprintf('Residual |Ax - b| = %.2e  (should be near 0)\\n', residual)

% The less-good approach (works but slower):
x_inv = inv(A) * b;
fprintf('Via inv(A)*b: x = [%.4f; %.4f]\\n', x_inv(1), x_inv(2))

% Both give same answer — but for large systems the difference matters
fprintf('Same result: %d\\n', norm(x_solve - x_inv) < 1e-10)`,
            },
            {
              id: 4,
              cellTitle: 'Application: CNC workpiece coordinate frame — is calibration stable?',
              prose: [
                'A CNC machine probes 3 reference points on the workpiece to establish the work coordinate system. These 3 points must NOT be collinear — if they are, the determinant of their position matrix is 0 and no unique plane (or coordinate frame) can be defined.',
                'This is why fixturing specifications require probe points to be spread far apart in a triangular pattern.',
                '`cond(M_good)` prints the **condition number** — the ratio of the largest to smallest singular value. For a well-spread fixture this is moderate (close to 1 is ideal). `cond(M_bad)` prints a huge number (or `Inf`) because `M_bad` is exactly singular. In practice, CNC controllers reject a calibration if `cond(M) > 100` — a condition number above 100 means a 1% measurement noise in the probe position could cause a 100% error in the computed coordinate frame, making the machined part dangerous.',
              ],
              code: `% Three probe points on the workpiece
% Format: each column is [X; Y; Z]
P1 = [0;   0;   0  ];
P2 = [100; 0;   0  ];
P3 = [50;  80;  0  ];   % good: off-axis

% Two edge vectors from P1
v1 = P2 - P1;  % [100; 0; 0]
v2 = P3 - P1;  % [50; 80; 0]

% Put them in a 2×2 matrix (XY plane)
M_good = [v1(1:2) v2(1:2)];
fprintf('Good fixture: det = %.1f  (stable frame)\\n', det(M_good))

% Bad fixture: P3 is on the same line as P1-P2
P3_bad = [50; 0; 0];
v2_bad = P3_bad - P1;
M_bad = [v1(1:2) v2_bad(1:2)];
fprintf('Bad fixture:  det = %.1f  (degenerate -- collinear!)\\n', det(M_bad))

% Condition number tells you how close to singular
fprintf('\\nCondition number (good): %.2f\\n', cond(M_good))
fprintf('Condition number (bad):  %.2e  (huge = near-singular)\\n', cond(M_bad))`,
            },
          ]
        }
      },
      {
        id: 'PythonNotebook',
        title: 'Code: Determinant and Inverse',
        mathBridge: 'np.linalg.det(A) computes det(A) = ad − bc. np.linalg.inv(A) computes A⁻¹. Verify: A @ A_inv ≈ I. det = 0 means singular — no inverse exists.',
        caption: 'Verify the invertibility conditions and confirm A·A⁻¹ = I numerically.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Determinant — the scaling factor',
              prose: [
                '`np.linalg.det(A)` computes the determinant using LU decomposition (more numerically stable than the $ad-bc$ formula for large matrices). For $2 \\times 2$: $\\det(A) = a \\cdot d - b \\cdot c = 3 \\cdot 4 - 1 \\cdot 2 = 10$. Geometrically, this means $A$ scales all areas by a factor of 10 — a unit square maps to a parallelogram of area 10.',
                '`np.linalg.det(S)` with `S = [[2,4],[1,2]]` returns exactly 0: $2 \\cdot 2 - 4 \\cdot 1 = 0$. Row 2 of S is half of row 1 — they are linearly dependent. The rank of S is 1, not 2, so S maps the entire plane onto a single line (a 1D subspace). Any area becomes zero. No inverse exists.',
                '`plt.Polygon([origin, c1, c1+c2, c2])` draws the parallelogram spanned by the two column vectors — its **signed area equals the determinant**. For matrix `A` (det=10), the blue shaded region is a large parallelogram with area 10. For `S` (det=0), the two column vectors `col1 = [2,1]` and `col2 = [4,2]` are collinear ($\\text{col2} = 2 \\times \\text{col1}$), so the "parallelogram" degenerates to a line segment with zero area. This picture is the geometric definition of the determinant.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

# Invertible: det ≠ 0
A = np.array([[3., 1.],
              [2., 4.]])

# Singular: det = 0 (rows are proportional)
S = np.array([[2., 4.],
              [1., 2.]])

print(f"det(A) = {np.linalg.det(A):.1f}  (non-zero -> invertible)")
print(f"det(S) = {np.linalg.det(S):.1f}  (zero -> singular, no inverse)")

fig, axes = plt.subplots(1, 2, figsize=(9, 4))
origin = np.zeros(2)
for ax, M, title in [(axes[0], A, f"A: det={np.linalg.det(A):.1f} (invertible)"),
                     (axes[1], S, f"S: det={np.linalg.det(S):.1f} (singular)")]:
    c1, c2 = M[:, 0], M[:, 1]
    para = plt.Polygon([origin, c1, c1+c2, c2], alpha=0.2, color='steelblue')
    ax.add_patch(para)
    ax.annotate('', xy=c1, xytext=origin, arrowprops=dict(arrowstyle='->', color='steelblue', lw=2.5))
    ax.annotate('', xy=c2, xytext=origin, arrowprops=dict(arrowstyle='->', color='darkorange', lw=2.5))
    ax.text(c1[0]*0.5+0.1, c1[1]*0.5+0.1, 'col1', color='steelblue', fontsize=11)
    ax.text(c2[0]*0.5+0.1, c2[1]*0.5+0.1, 'col2', color='darkorange', fontsize=11)
    ax.set_title(title, fontsize=11)
    ax.set_xlim(-1, 5); ax.set_ylim(-1, 5)
    ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
    ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
plt.suptitle("|det| = area of parallelogram spanned by columns", fontsize=11)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: 'Computing the inverse and verifying A·A⁻¹ = I',
              prose: [
                '`np.linalg.inv(A)` computes $A^{-1}$ — the unique matrix satisfying $AA^{-1} = I_n$. For $2 \\times 2$: $A^{-1} = \\frac{1}{\\det(A)}\\begin{bmatrix}d & -b \\\\ -c & a\\end{bmatrix}$. For `A = [[3,1],[2,4]]` with $\\det = 10$: $A^{-1} = \\frac{1}{10}\\begin{bmatrix}4 & -1 \\\\ -2 & 3\\end{bmatrix}$.',
                '`np.allclose(A @ A_inv, np.eye(2))` verifies $AA^{-1} \\approx I$ to floating-point precision — `allclose` is needed because matrix multiplication accumulates rounding errors that prevent exact equality. The bar chart compares entries of $AA^{-1}$ against the identity: the diagonals should be 1 and the off-diagonals 0.',
                'The three heatmaps show `A`, `A_inv`, and `A @ A_inv`. Notice `A_inv` has completely different values than `A` — the inverse is NOT entry-wise reciprocal. For example, `A[0,0] = 3.0` but `A_inv[0,0] = 0.4` (= $4/10$ from the formula: the $d$ entry divided by $\\det$). The `A @ A_inv` heatmap should show exactly 1 on the diagonal and 0 off-diagonal. The `round(10)` call reveals that off-diagonal entries are $\\sim 10^{-16}$ (machine epsilon, not exactly 0) — inherent floating-point behavior.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

A = np.array([[3., 1.], [2., 4.]])
A_inv = np.linalg.inv(A)
I_check = A @ A_inv

print("A_inv ="); print(A_inv.round(4))
print("A @ A_inv ="); print(I_check.round(10))
print("Is it the identity?", np.allclose(I_check, np.eye(2)))

fig, axes = plt.subplots(1, 3, figsize=(10, 3))
for ax, M, title in zip(axes, [A, A_inv, I_check], ["A", "A_inv", "A @ A_inv (= I)"]):
    ax.imshow(M, cmap="RdBu_r", aspect="equal", vmin=-1.5, vmax=3.5)
    ax.set_title(title, fontsize=12)
    for i in range(M.shape[0]):
        for j in range(M.shape[1]):
            ax.text(j, i, f"{M[i,j]:.3f}", ha="center", va="center", fontsize=12,
                    color="white" if abs(M[i,j]) > 1.5 else "black")
    ax.set_xticks([]); ax.set_yticks([])
plt.tight_layout()
plt.show()`,
            },
            {
              id: 3,
              cellTitle: 'Solving Ax=b — solve vs inv, and visualizing the singular boundary',
              prose: [
                '`np.linalg.solve(A, b)` uses LU factorization internally: it factors $A = LU$ once ($O(n^3)$), then performs two triangular solves for $\\mathbf{b}$ ($O(n^2)$). `np.linalg.inv(A) @ b` computes the full inverse (all $n^2$ entries, more floating-point operations), then multiplies. Both give the same answer numerically but `solve` is the correct professional approach — lower error accumulation.',
                'The line plot shows $\\det\\begin{bmatrix}2&3\\\\1&d\\end{bmatrix} = 2d - 3$ as a function of the entry $d$. The red dashed line marks $\\det = 0$ — the singular boundary. Left of $d=1.5$ the matrix has a negative determinant (orientation-flipping but still invertible). Right of $d=1.5$ it is positive-det invertible. Exactly at $d=1.5$ it is singular. The shaded regions make it visual: blue is invertible-positive, red is invertible-negative, and the boundary itself is the non-invertible point.',
                '`fill_between(d_vals, dets, 0, where=(dets > 0))` shades the region between the det curve and 0 wherever the determinant is positive. The orange vertical line at $d = 1.5$ is the singular boundary: exactly at this $d$, $\\text{col2} = [3, 1.5]^T = 1.5 \\times \\text{col1} = [2, 1]^T$ — proportional columns, zero area, no inverse. The residual `norm(A @ x_solve - b)` printed above the plot is the gold-standard verification: if `np.linalg.solve` computed $\\mathbf{x}$ correctly, substituting back should give exactly $\\mathbf{b}$ with residual near machine epsilon $\\sim 10^{-15}$.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

A = np.array([[3., 1.], [2., 4.]])
b = np.array([10., 8.])

x_solve = np.linalg.solve(A, b)
x_inv   = np.linalg.inv(A) @ b
print(f"linalg.solve:  x = {x_solve}")
print(f"inv(A) @ b:    x = {x_inv}")
print(f"Residual |Ax - b| = {np.linalg.norm(A @ x_solve - b):.2e}")

# Visualize det as function of one entry
d_vals = np.linspace(1.0, 2.5, 200)
dets = 2*d_vals - 3          # det of [[2,3],[1,d]] = 2d - 3

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(d_vals, dets, 'steelblue', lw=2.5, label='det = 2d - 3')
ax.axhline(0, color='crimson', lw=1.5, linestyle='--', label='singular boundary (det=0)')
ax.axvline(1.5, color='darkorange', lw=1.5, linestyle=':', label='d=1.5 (singular point)')
ax.fill_between(d_vals, dets, 0, where=(dets > 0), alpha=0.15, color='steelblue', label='det > 0 (invertible)')
ax.fill_between(d_vals, dets, 0, where=(dets < 0), alpha=0.15, color='crimson', label='det < 0 (invertible, flipped)')
ax.set_xlabel('Entry d in [[2,3],[1,d]]', fontsize=11)
ax.set_ylabel('det(A)', fontsize=11)
ax.set_title('Singular boundary: det = 0 at d = 1.5', fontsize=12)
ax.legend(fontsize=9); ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 4,
              cellTitle: 'Application: matrix cipher — encrypt and decrypt with A and A⁻¹',
              prose: [
                '`K @ m` applies the key matrix to the message vector in one step — this IS the matrix-vector product from la2-001. `np.linalg.det(K) = 1.0` tells us two things: (1) the transformation preserves area exactly, and (2) the inverse formula $K^{-1} = \\frac{1}{\\det}\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$ has a clean scalar of 1 — for a key matrix, this means the inverse has integer entries, which matters for classical integer arithmetic ciphers.',
                '`np.linalg.inv(K)` computes the decryption key. For `K = [[3,5],[1,2]]` with $\\det = 1$: swap diagonal entries to get $\\begin{bmatrix}2&*\\\\*&3\\end{bmatrix}$, negate off-diagonal to get $\\begin{bmatrix}2&-5\\\\-1&3\\end{bmatrix}$, divide by det=1 — the inverse is $\\begin{bmatrix}2&-5\\\\-1&3\\end{bmatrix}$. `K_inv @ c` applies this decryption key to recover $\\mathbf{m}$.',
                '`np.allclose(m_recovered, m)` confirms perfect recovery: $K^{-1}(K\\mathbf{m}) = (K^{-1}K)\\mathbf{m} = I\\mathbf{m} = \\mathbf{m}$. This is the matrix algebra of "play the transformation backwards" — the inverse undoes the encryption exactly. `np.allclose(K @ K_inv, np.eye(2))` shows the same principle: $KK^{-1} = I$ means the two operations cancel completely.',
              ],
              code: `import numpy as np

# Hill cipher key matrix
K = np.array([[3., 5.], [1., 2.]])
det_K = np.linalg.det(K)
print(f"Key matrix K:\\n{K}")
print(f"det(K) = {det_K:.1f}  (non-zero -> invertible -> decryptable)")

# Encrypt message vector m
m = np.array([3., 5.])
c = K @ m
print(f"\\nMessage m = {m}")
print(f"Ciphertext c = K @ m = {c}")

# Decrypt: apply K_inv to recover m
K_inv = np.linalg.inv(K)
print(f"\\nDecryption key K_inv:\\n{K_inv}")
m_recovered = K_inv @ c
print(f"Recovered: K_inv @ c = {m_recovered}")
print(f"Exact recovery: {np.allclose(m_recovered, m)}")

# Verify K @ K_inv = I
print(f"\\nK @ K_inv = I? {np.allclose(K @ K_inv, np.eye(2))}")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Invertibility check',
              difficulty: 'medium',
              prompt: 'For each matrix below: (1) compute the determinant, (2) state whether it is invertible, (3) for any invertible matrix, compute A⁻¹ and verify A @ A⁻¹ = I. Explain why matrix C is singular.',
              code: `import numpy as np

A = np.array([[4., 2.], [1., 3.]])
B = np.array([[1., 2.], [3., 6.]])   # note: row2 = 3 × row1
C = np.array([[2., -1.], [4., 3.]])

# For each: det, invertible?, and if yes: compute inv and verify
`,
              hint: 'np.linalg.det() for determinant. np.linalg.inv() for inverse. B is singular because its rows are proportional (det = 1×6 - 2×3 = 0).',
            },
          ]
        }
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      '**Formal definition.** An $n \\times n$ matrix $A$ is called **invertible** (or **non-singular**, or **regular**) if there exists an $n \\times n$ matrix $B$ such that $AB = BA = I_n$. When such $B$ exists, it is unique and written $A^{-1}$.',
      '**Uniqueness of the inverse.** Suppose $AB = I$ and $AC = I$. Then $B = BI = B(AC) = (BA)C = IC = C$. So there is only one left-inverse and it equals the right-inverse.',
      '**The determinant for $n \\times n$ matrices.** For $n > 2$, the determinant is defined recursively via cofactor expansion along row 1:\n\n$$\\det(A) = \\sum_{j=1}^{n} a_{1j} (-1)^{1+j} M_{1j}$$\n\nwhere $M_{1j}$ is the $(n-1) \\times (n-1)$ minor obtained by deleting row 1 and column $j$. For $n = 3$:\n\n$$\\det(A) = a_{11}(a_{22}a_{33} - a_{23}a_{32}) - a_{12}(a_{21}a_{33} - a_{23}a_{31}) + a_{13}(a_{21}a_{32} - a_{22}a_{31})$$\n\nThis is the "Sarrus rule" for $3 \\times 3$ determinants.',
      '**Key properties of the determinant.** For square matrices $A$, $B$:\n- $\\det(AB) = \\det(A)\\det(B)$ — the determinant is multiplicative\n- $\\det(A^{-1}) = 1/\\det(A)$ — inverse scales area by the reciprocal\n- $\\det(A^T) = \\det(A)$ — transpose preserves the determinant\n- Row swap multiplies $\\det$ by $-1$; scaling a row by $c$ multiplies $\\det$ by $c$\n- Adding a multiple of one row to another leaves $\\det$ unchanged',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Invertible Matrix Theorem (IMT)',
        body: 'For an $n \\times n$ matrix $A$, ALL of the following are equivalent (true simultaneously or false simultaneously):\n\n1. $A$ is invertible\n2. $A$ has $n$ pivot positions\n3. RREF of $A$ is $I_n$\n4. $\\ker(A) = \\{\\mathbf{0}\\}$ (trivial null space)\n5. Columns of $A$ are linearly independent\n6. Columns of $A$ span $\\mathbb{R}^n$\n7. $\\det(A) \\neq 0$\n8. 0 is not an eigenvalue of $A$\n9. $A^T$ is invertible\n\nThis theorem is the grand unification of linear algebra — one concept, nine faces.',
      },
      {
        type: 'proof',
        title: 'det(AB) = det(A)·det(B)',
        body: 'This follows from the Leibniz formula: $\\det(A) = \\sum_{\\sigma \\in S_n} \\text{sgn}(\\sigma) \\prod_{i=1}^n a_{i,\\sigma(i)}$, where the sum is over all permutations of $\\{1,\\ldots,n\\}$.\n\nThe key consequence: if $A$ is invertible, $\\det(A^{-1}) = 1/\\det(A)$ since $\\det(A)\\det(A^{-1}) = \\det(AA^{-1}) = \\det(I) = 1$.',
      },
      {
        type: 'insight',
        title: 'The 2×2 Inverse Formula Is Cofactors',
        body: 'The $2 \\times 2$ inverse formula $A^{-1} = \\frac{1}{ad-bc}\\begin{bmatrix}d & -b \\\\ -c & a\\end{bmatrix}$ is a special case of the **adjugate** formula:\n\n$$A^{-1} = \\frac{1}{\\det(A)} \\text{adj}(A)$$\n\nwhere $\\text{adj}(A)$ is the transpose of the cofactor matrix. For $n > 2$, this formula is theoretically correct but computationally impractical. Use Gaussian elimination instead.',
      },
    ],
    visualizations: [
      {
        id: 'LALesson06_Inverses',
        title: 'Determinant as Area Scaling — Interactive',
        mathBridge: 'The yellow unit square starts with area 1. As you adjust the matrix, watch the parallelogram the columns define. Its signed area equals the determinant at every moment. Push the slider until the two column vectors become parallel — watch the square flatten to area 0 and the determinant hit exactly 0. At that point, the matrix is singular and the Inverse button should fail.',
        caption: 'Determinant = signed area of the parallelogram spanned by the column vectors.',
      },
    ],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: "la2-003-ex1",
      title: "Finding an Inverse",
      problem: "Let $A = \\begin{bmatrix} 4 & 2 \\\\ 3 & 2 \\end{bmatrix}$. Find $A^{-1}$.",
      steps: [
        {
          expression: "\\det(A) = (4)(2) - (2)(3) = 8 - 6 = 2",
          annotation: "First, reliably compute the determinant ad - bc.",
          strategyTitle: "Calculate Determinant",
          checkpoint: "Because the determinant is 2, what does this tell us?",
          hints: ["Since 2 is not 0, the matrix is invertible, and space scales up by 2x."],
        },
        {
          expression: "\\begin{bmatrix} 2 & -2 \\\\ -3 & 4 \\end{bmatrix}",
          annotation: "Swap the main diagonal (4 and 2). Negate the off-diagonal (2 and 3).",
          strategyTitle: "Rearrange the matrix",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "A^{-1} = \\frac{1}{2} \\begin{bmatrix} 2 & -2 \\\\ -3 & 4 \\end{bmatrix} = \\begin{bmatrix} 1 & -1 \\\\ -1.5 & 2 \\end{bmatrix}",
          annotation: "Multiply the rearranged matrix by 1 over the determinant.",
          strategyTitle: "Scale by determinant",
          checkpoint: "",
          hints: [],
        }
      ],
      conclusion: "The inverse matrix is [1, -1; -1.5, 2]. If you multiply this matrix by A, you will get the Identity matrix."
    },
    {
      id: "la2-003-ex2",
      title: "Solving a System",
      problem: "Given $A = \\begin{bmatrix} 4 & 2 \\\\ 3 & 2 \\end{bmatrix}$ (from above), solve the equation $A\\vec{x} = \\begin{bmatrix} 10 \\\\ 8 \\end{bmatrix}$ for the unknown vector $\\vec{x}$.",
      steps: [
        {
          expression: "A^{-1} A \\vec{x} = A^{-1} \\begin{bmatrix} 10 \\\\ 8 \\end{bmatrix}",
          annotation: "Multiply both sides of the equation by A-inverse ON THE LEFT.",
          strategyTitle: "Apply Inverse",
          checkpoint: "What does A-inverse * A simplify to?",
          hints: ["It becomes the Identity matrix, effectively canceling out."],
        },
        {
          expression: "\\vec{x} = \\begin{bmatrix} 1 & -1 \\\\ -1.5 & 2 \\end{bmatrix} \\begin{bmatrix} 10 \\\\ 8 \\end{bmatrix}",
          annotation: "Substitute the inverse we found in Example 1.",
          strategyTitle: "Substitute",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "\\vec{x} = \\begin{bmatrix} (1)(10) + (-1)(8) \\\\ (-1.5)(10) + (2)(8) \\end{bmatrix} = \\begin{bmatrix} 10 - 8 \\\\ -15 + 16 \\end{bmatrix} = \\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix}",
          annotation: "Perform the matrix multiplication.",
          strategyTitle: "Calculate vector",
          checkpoint: "",
          hints: [],
        }
      ],
      conclusion: "The original input vector must have been [2, 1]. We played the transformation in reverse on the output vector [10, 8] to find where it started."
    },
    {
      id: "la2-003-ex3",
      title: "Identifying a Singular Matrix",
      problem: "Without a calculator, determine whether $B = \\begin{bmatrix} 6 & 9 \\\\ 2 & 3 \\end{bmatrix}$ is invertible. If not, explain why geometrically.",
      steps: [
        {
          expression: "\\det(B) = (6)(3) - (9)(2) = 18 - 18 = 0",
          annotation: "Compute $ad - bc$. Both cross-products evaluate to 18, so they cancel perfectly. The determinant is exactly 0.",
          strategyTitle: "Compute the determinant",
          checkpoint: "What does a determinant of 0 mean geometrically?",
          hints: ["$\\det = 0$ means the two column vectors land on the same line. Space collapses from 2D to 1D — area is permanently destroyed."],
        },
        {
          expression: "\\text{Column 2} = \\tfrac{3}{2} \\times \\text{Column 1}: \\quad \\begin{bmatrix}9 \\\\ 3\\end{bmatrix} = 1.5 \\cdot \\begin{bmatrix}6 \\\\ 2\\end{bmatrix}",
          annotation: "Column 2 is a scalar multiple of column 1 — they are linearly dependent. Both $\\hat{i}$ and $\\hat{j}$ land on the exact same line, so the entire 2D plane collapses onto that line. No information about the perpendicular direction survives.",
          strategyTitle: "Geometric reason: columns are proportional",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "B^{-1} \\text{ does not exist.}",
          annotation: "The formula $B^{-1} = \\frac{1}{\\det(B)} \\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix}$ requires dividing by $\\det(B) = 0$, which is undefined. The transformation is irreversible: infinitely many input vectors all map to the same output line, so you cannot reconstruct which input produced a given output.",
          strategyTitle: "Conclude: B is singular, no inverse exists",
          checkpoint: "",
          hints: [],
        }
      ],
      conclusion: "Matrix B is singular (det = 0) because its columns are proportional. The transformation crushes the 2D plane onto a single line, permanently destroying the perpendicular component of every input vector. No inverse can recover that lost dimension."
    }
  ],

  // ── Walkthroughs ───────────────────────────────────────────────────────────
  walkthroughs: [
    {
      id: 'wt-la2-003-2x2-inverse',
      title: 'The 2×2 Inverse Formula — When Does It Break?',
      prereqs: ['Determinant (2×2)', 'Matrix multiplication'],
      problem: 'Find $A^{-1}$ for $A = \\begin{bmatrix}2 & 5\\\\1 & 3\\end{bmatrix}$, then verify $A A^{-1} = I$.',
      steps: [
        {
          label: 'Compute the determinant — it controls everything',
          strategy: 'The formula for $A^{-1}$ requires dividing by $\\det(A) = ad - bc$. Check this first.',
          explanation: 'For $A = \\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}$: $\\det(A) = ad - bc = (2)(3) - (5)(1) = 6 - 5 = 1$. The determinant is 1 — the inverse formula will produce integers, no fractions.',
          math: '\\det(A) = (2)(3)-(5)(1) = 1',
        },
        {
          label: 'Apply the 2×2 inverse formula',
          strategy: 'Swap the diagonal, negate the off-diagonal, divide by the determinant.',
          explanation: 'The formula: $A^{-1} = \\frac{1}{\\det(A)}\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$. Swap $a=2$ and $d=3$, negate $b=5$ to $-5$ and $c=1$ to $-1$, divide by 1.',
          math: 'A^{-1} = \\frac{1}{1}\\begin{bmatrix}3&-5\\\\-1&2\\end{bmatrix} = \\begin{bmatrix}3&-5\\\\-1&2\\end{bmatrix}',
          gotcha: 'Two common errors: (1) forgetting to divide by $\\det(A)$; (2) negating the diagonal instead of swapping it. The diagonal entries SWAP; the off-diagonal entries get negated.',
        },
        {
          label: 'Verify: $A A^{-1}$ must equal $I$',
          strategy: 'Multiply out — if even one entry fails to give 0 or 1, there is a calculation error.',
          explanation: '$(AA^{-1})_{11} = 2\\cdot3+5\\cdot(-1)=6-5=1$. $(AA^{-1})_{12}=2\\cdot(-5)+5\\cdot2=-10+10=0$. $(AA^{-1})_{21}=1\\cdot3+3\\cdot(-1)=3-3=0$. $(AA^{-1})_{22}=1\\cdot(-5)+3\\cdot2=-5+6=1$.',
          math: '\\begin{bmatrix}2&5\\\\1&3\\end{bmatrix}\\begin{bmatrix}3&-5\\\\-1&2\\end{bmatrix} = \\begin{bmatrix}1&0\\\\0&1\\end{bmatrix} \\checkmark',
        },
        {
          label: 'What if $\\det(A) = 0$? The singular case.',
          strategy: 'Zero determinant means no inverse exists — the transformation crushed space and cannot be undone.',
          explanation: 'If $A = \\begin{bmatrix}2&4\\\\1&2\\end{bmatrix}$: $\\det = 2\\cdot2-4\\cdot1=0$. No inverse. This matrix maps the whole plane onto a single line through the origin — information is destroyed, and you cannot recover the original input.',
          math: '\\det(A)=0 \\implies A^{-1} \\text{ does not exist}',
        },
      ],
    },
    {
      id: 'wt-la2-003-inverse-to-solve',
      title: 'Solve a System Using the Inverse — When and Why',
      prereqs: ['2×2 inverse formula', 'Matrix-vector multiplication'],
      problem: 'Solve the system $2x+5y=4$ and $x+3y=1$ by finding and using $A^{-1}$.',
      steps: [
        {
          label: 'Write the system as the matrix equation $A\\mathbf{x} = \\mathbf{b}$',
          strategy: 'Recognizing the matrix form is the bridge between algebra and linear algebra.',
          explanation: 'The coefficient matrix is $A = \\begin{bmatrix}2&5\\\\1&3\\end{bmatrix}$, the unknown vector is $\\mathbf{x} = [x,y]^\\top$, and the right-hand side is $\\mathbf{b} = [4,1]^\\top$.',
          math: '\\begin{bmatrix}2&5\\\\1&3\\end{bmatrix}\\begin{bmatrix}x\\\\y\\end{bmatrix} = \\begin{bmatrix}4\\\\1\\end{bmatrix}',
        },
        {
          label: 'Multiply both sides on the left by $A^{-1}$',
          strategy: 'If $A\\mathbf{x} = \\mathbf{b}$ and $A$ is invertible, then $\\mathbf{x} = A^{-1}\\mathbf{b}$.',
          explanation: 'We already know $A^{-1} = \\begin{bmatrix}3&-5\\\\-1&2\\end{bmatrix}$ from the previous walkthrough. Multiply: $\\mathbf{x} = A^{-1}\\mathbf{b} = \\begin{bmatrix}3&-5\\\\-1&2\\end{bmatrix}\\begin{bmatrix}4\\\\1\\end{bmatrix}$.',
          math: '\\mathbf{x} = A^{-1}\\mathbf{b} = \\begin{bmatrix}3&-5\\\\-1&2\\end{bmatrix}\\begin{bmatrix}4\\\\1\\end{bmatrix}',
        },
        {
          label: 'Compute the product',
          strategy: 'Row-dot-column as usual.',
          explanation: '$x = 3\\cdot4+(-5)\\cdot1=12-5=7$. $y = (-1)\\cdot4+2\\cdot1=-4+2=-2$.',
          math: '\\mathbf{x} = \\begin{bmatrix}7\\\\-2\\end{bmatrix}',
        },
        {
          label: 'When should you use the inverse vs. row reduction?',
          strategy: 'Inverse is efficient when solving many systems with the same $A$; row reduction is more robust for a single system.',
          explanation: 'Solving $A\\mathbf{x}=\\mathbf{b}$ once: row reduction is often faster and numerically more stable. Solving $A\\mathbf{x}=\\mathbf{b}_1$, $A\\mathbf{x}=\\mathbf{b}_2$, ..., $A\\mathbf{x}=\\mathbf{b}_{100}$ with the same $A$: compute $A^{-1}$ once and then it is just matrix-vector multiplication each time. LU decomposition is the practical alternative that gives similar reuse benefits.',
          math: '\\text{Reuse: } A^{-1}\\mathbf{b}_1,\\; A^{-1}\\mathbf{b}_2,\\; \\ldots',
        },
      ],
    },
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: "la2-003-ch1",
      difficulty: "easy",
      problem: "Calculate the determinant of $\\begin{bmatrix} 5 & 3 \\\\ 4 & 2 \\end{bmatrix}$.",
      hint: "Use the formula ad - bc.",
      walkthrough: [
        {
          expression: "(5)(2) - (3)(4)",
          annotation: "Setup ad - bc."
        },
        {
          expression: "10 - 12",
          annotation: "Multiply."
        },
        {
          expression: "-2",
          annotation: "Subtract."
        }
      ],
      answer: "-2"
    },
    {
      id: "la2-003-ch2",
      difficulty: "medium",
      problem: "Given a $2 \\times 2$ matrix with columns $[1, 2]^T$ and $[3, c]^T$. For what value of $c$ does the matrix have NO inverse (is singular)?",
      hint: "A matrix is singular when its determinant is exactly 0. Set up the determinant equation with c, and set it equal to 0.",
      walkthrough: [
        {
          expression: "\\det \\begin{bmatrix} 1 & 3 \\\\ 2 & c \\end{bmatrix} = 0",
          annotation: "Set up the requirement for singularity."
        },
        {
          expression: "(1)(c) - (3)(2) = 0",
          annotation: "Apply the ad - bc formula."
        },
        {
          expression: "c - 6 = 0",
          annotation: "Simplify."
        },
        {
          expression: "c = 6",
          annotation: "Solve for c."
        }
      ],
      answer: "6"
    },
    {
      id: "la2-003-ch3",
      difficulty: "hard",
      problem: "A 2D encryption scheme transforms the message vector $\\mathbf{m} = \\begin{bmatrix} 3 \\\\ 5 \\end{bmatrix}$ using the key matrix $K = \\begin{bmatrix} 3 & 5 \\\\ 1 & 2 \\end{bmatrix}$, producing the ciphertext $\\mathbf{c} = K\\mathbf{m}$. (a) Compute $\\mathbf{c}$. (b) Find $K^{-1}$. (c) Verify that $K^{-1}\\mathbf{c}$ recovers $\\mathbf{m}$.",
      hint: "Use the 2×2 inverse formula: $K^{-1} = \\frac{1}{ad-bc}\\begin{bmatrix}d & -b \\\\ -c & a\\end{bmatrix}$. For part (c), apply $K^{-1}$ to $\\mathbf{c}$ and check that you get back $\\mathbf{m} = [3, 5]^T$.",
      walkthrough: [
        {
          expression: "\\mathbf{c} = \\begin{bmatrix} 3 & 5 \\\\ 1 & 2 \\end{bmatrix}\\begin{bmatrix} 3 \\\\ 5 \\end{bmatrix} = \\begin{bmatrix} 9+25 \\\\ 3+10 \\end{bmatrix} = \\begin{bmatrix} 34 \\\\ 13 \\end{bmatrix}",
          annotation: "Apply $K$ to $\\mathbf{m}$ via row-dot-column. This is the 'encrypted' output."
        },
        {
          expression: "\\det(K) = (3)(2) - (5)(1) = 6 - 5 = 1",
          annotation: "$\\det = 1$: the transformation preserves area exactly. This also means the inverse formula has a clean $1/1$ scalar — ideal for a key matrix."
        },
        {
          expression: "K^{-1} = \\frac{1}{1}\\begin{bmatrix} 2 & -5 \\\\ -1 & 3 \\end{bmatrix} = \\begin{bmatrix} 2 & -5 \\\\ -1 & 3 \\end{bmatrix}",
          annotation: "Swap the main diagonal entries ($3$ and $2$), negate the off-diagonal entries ($5$ becomes $-5$, $1$ becomes $-1$), then scale by $1/\\det = 1$."
        },
        {
          expression: "K^{-1}\\mathbf{c} = \\begin{bmatrix} 2 & -5 \\\\ -1 & 3 \\end{bmatrix}\\begin{bmatrix} 34 \\\\ 13 \\end{bmatrix} = \\begin{bmatrix} 68-65 \\\\ -34+39 \\end{bmatrix} = \\begin{bmatrix} 3 \\\\ 5 \\end{bmatrix} = \\mathbf{m}",
          annotation: "Applying $K^{-1}$ to the ciphertext perfectly recovers the original message. The inverse matrix 'plays the encryption backwards.'"
        }
      ],
      answer: "$\\mathbf{c} = \\begin{bmatrix} 34 \\\\ 13 \\end{bmatrix}$, $\\; K^{-1} = \\begin{bmatrix} 2 & -5 \\\\ -1 & 3 \\end{bmatrix}$, $\\; K^{-1}\\mathbf{c} = \\begin{bmatrix} 3 \\\\ 5 \\end{bmatrix} = \\mathbf{m}$"
    }
  ],

  // ── Semantic Layer ───────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: 'A^{-1}', meaning: 'Inverse matrix — undoes A exactly; applying A then A⁻¹ returns every vector to its original position' },
      { symbol: '\\det(A)', meaning: 'Determinant — the signed area-scaling factor; positive means orientation preserved, negative means flipped, zero means singular (irreversible)' },
      { symbol: 'A^{-1}A = I', meaning: 'Inverse cancels original — the two matrices compose to the identity (do nothing)' },
      { symbol: 'ad - bc', meaning: '2×2 determinant formula — the difference of the two diagonal products; zero when columns are proportional' },
      { symbol: '\\det(AB) = \\det(A)\\det(B)', meaning: 'Multiplicative property — the area scaling of a composed transformation equals the product of the individual scalings' },
    ],
    rulesOfThumb: [
      'If columns are proportional (dependent), the determinant is always 0 and no inverse exists.',
      'det = 0 means information was permanently destroyed — the transformation is irreversible.',
      'To solve Ax = b, use solve(A, b) or backslash — never compute inv(A) just to multiply it.',
      'The sign of det encodes orientation: negative det means the transformation flips space like a mirror.',
      'The 2×2 inverse is: swap the main diagonal, negate the off-diagonal, divide by det.',
    ],
  },

  // ── Spiral Learning ──────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la1-002',
        label: 'Linear Independence',
        note: 'The concept of linear independence from Lesson 2 is identical to having a non-zero determinant. If vectors are dependent, they collapse the span, making the determinant 0.'
      }
    ],
    futureLinks: [
      {
        lessonId: 'la3-001',
        label: 'Eigenvalues',
        note: 'When you try to find Eigenvectors, you will intentionally build a matrix with a determinant of exactly 0. You will leverage the very mathematical "destruction" we warned about today to solve equations seamlessly.'
      }
    ]
  },

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'la2-003-assess-1',
        type: 'choice',
        text: 'What is $\\det\\begin{bmatrix}1&2\\\\2&4\\end{bmatrix}$, and is this matrix invertible?',
        options: [
          '$\\det = 0$; not invertible — columns are proportional',
          '$\\det = 4$; invertible',
          '$\\det = -4$; invertible with negative determinant',
          '$\\det = 6$; invertible',
        ],
        answer: '$\\det = 0$; not invertible — columns are proportional',
        hints: ['$ad - bc = (1)(4) - (2)(2) = 4 - 4 = 0$. Column 2 = $2 \\times$ column 1 — proportional columns always give $\\det = 0$ because the transformation squishes area to zero.'],
      },
      {
        id: 'la2-003-assess-2',
        type: 'choice',
        text: 'A transformation matrix $A$ has $\\det(A) = 5$. What does this tell you about how $A$ affects areas?',
        options: [
          'Every region is scaled to 5 times its original area',
          'Every region shrinks to 1/5 of its original area',
          'The matrix is not invertible',
          'Every length is multiplied by 5',
        ],
        answer: 'Every region is scaled to 5 times its original area',
        hints: ['The determinant IS the area scaling factor. $\\det = 5$ means a unit square maps to a parallelogram of area 5. Note: lengths scale by $\\sqrt{5}$ on average (not by 5 — that would be $\\det = 25$).'],
      },
      {
        id: 'la2-003-assess-3',
        type: 'choice',
        text: 'What is the $2 \\times 2$ inverse of $A = \\begin{bmatrix}4&1\\\\2&3\\end{bmatrix}$?',
        options: [
          '$\\frac{1}{10}\\begin{bmatrix}3&-1\\\\-2&4\\end{bmatrix}$',
          '$\\frac{1}{10}\\begin{bmatrix}3&1\\\\2&4\\end{bmatrix}$',
          '$\\begin{bmatrix}3&-1\\\\-2&4\\end{bmatrix}$',
          'The matrix is not invertible',
        ],
        answer: '$\\frac{1}{10}\\begin{bmatrix}3&-1\\\\-2&4\\end{bmatrix}$',
        hints: ['$\\det(A) = 4 \\cdot 3 - 1 \\cdot 2 = 10$. The $2 \\times 2$ inverse formula: swap $a$ and $d$, negate $b$ and $c$, divide by $\\det$: $A^{-1} = \\frac{1}{10}\\begin{bmatrix}3 & -1 \\\\ -2 & 4\\end{bmatrix}$.'],
      },
      {
        id: 'la2-003-assess-4',
        type: 'choice',
        text: 'You need to solve $A\\mathbf{x} = \\mathbf{b}$ for 500 different right-hand sides $\\mathbf{b}$. Which approach is most efficient?',
        options: [
          'Compute the LU factorization of $A$ once, then solve each $\\mathbf{b}$ with two triangular solves',
          'Compute $A^{-1}$ once and multiply each $\\mathbf{b}$ by $A^{-1}$',
          'Use RREF on $[A|\\mathbf{b}]$ for each right-hand side separately',
          'Both LU and $A^{-1}$ have identical cost for 500 right-hand sides',
        ],
        answer: 'Compute the LU factorization of $A$ once, then solve each $\\mathbf{b}$ with two triangular solves',
        hints: ['LU factorization costs $O(n^3)$ once. Each solve costs $O(n^2)$. Computing $A^{-1}$ also costs $O(n^3)$, but then each multiply $A^{-1}\\mathbf{b}$ costs $O(n^2)$ with more accumulated floating-point error. LU wins on accuracy.'],
      },
    ]
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    "Determinant > 1: Expands space.",
    "Determinant 0 to 1: Shrinks space.",
    "Determinant < 0: Flips space backwards.",
    "Determinant = 0: Flattens space. Irreversible.",
    "Inverse: Rewinds the VHS tape back to the start."
  ],

  // ── Checkpoints ──────────────────────────────────────────────────
  checkpoints: [
    { id: 'cp-la2-003-1', label: 'Read intuition — understand why det = 0 means no inverse', type: 'read' },
    { id: 'cp-la2-003-2', label: 'Read math — trace the 2×2 inverse formula by hand', type: 'read' },
    { id: 'cp-la2-003-3', label: 'Read rigor — study the Invertible Matrix Theorem (9 equivalences)', type: 'read' },
    { id: 'cp-la2-003-4', label: 'Run OpenMAT cell 1 — compute det manually and verify via MATLAB', type: 'lab' },
    { id: 'cp-la2-003-5', label: 'Run OpenMAT cell 3 — use backslash to solve Ax=b (not inv)', type: 'lab' },
    { id: 'cp-la2-003-6', label: 'Complete example 1: trace the 2×2 inverse formula step by step', type: 'example' },
    { id: 'cp-la2-003-7', label: 'Complete example 2: recover the input vector by applying A⁻¹', type: 'example' },
    { id: 'cp-la2-003-8', label: 'Attempt challenge 1: compute det by hand using ad − bc', type: 'challenge' },
    { id: 'cp-la2-003-9', label: 'Attempt challenge 2: find the value of c that makes the matrix singular', type: 'challenge' },
  ],

  // ── Final Quiz ─────────────────────────────────────────────────
  quiz: [
    {
      id: 'la2-003-quiz-1',
      type: 'choice',
      text: "If a 3x3 transformation matrix has a determinant of 0, what does it physically mean geometrically?",
      options: [
        "The volume of objects increases infinitely.",
        "The 3D space is flattened into a 2D plane, a 1D line, or a 0D point.",
        "The entire space flips inside out like a mirror.",
        "The matrix only moves objects sideways."
      ],
      answer: "The 3D space is flattened into a 2D plane, a 1D line, or a 0D point.",
      hints: ["If area or volume goes to exactly 0, the space must have lost dimensions."],
      reviewSection: 'Intuition tab — Determinant of 0'
    },
    {
      id: 'la2-003-quiz-2',
      type: 'choice',
      text: "If a matrix has linearly dependent columns (where the second column is just a scaled copy of the first), what will its determinant be?",
      options: [
        "Exactly 1.",
        "Exactly 0.",
        "You cannot know without doing the arithmetic.",
        "The same as its trace."
      ],
      answer: "Exactly 0.",
      hints: ["If the columns are dependent, they land on the same line. If the basis vectors land on the same line, the grid collapses and area is 0."],
      reviewSection: 'Semantics tab — Rules of Thumb'
    },
    {
      id: 'la2-003-quiz-3',
      type: 'choice',
      text: "Matrix $A = \\begin{bmatrix} 2 & 4 \\\\ 1 & 2 \\end{bmatrix}$. What is $\\det(A)$ and what does it tell you about the inverse?",
      options: [
        "$\\det = 0$; the matrix is singular and has no inverse.",
        "$\\det = 8$; the matrix is invertible with a positive determinant.",
        "$\\det = 0$; the inverse exists but equals the zero matrix.",
        "$\\det = -4$; the matrix flips orientation but is still invertible."
      ],
      answer: "$\\det = 0$; the matrix is singular and has no inverse.",
      hints: ["$\\det = (2)(2) - (4)(1) = 4 - 4 = 0$. Column 2 = $[4, 2]^T$ is exactly $2 \\times$ column 1 = $[2, 1]^T$. Proportional columns always give $\\det = 0$."],
      reviewSection: 'Math tab — Determinant formula'
    },
    {
      id: 'la2-003-quiz-4',
      type: 'choice',
      text: "Why does the 2×2 inverse formula $A^{-1} = \\frac{1}{ad-bc}\\begin{bmatrix}d & -b \\\\ -c & a\\end{bmatrix}$ break down when $\\det(A) = 0$?",
      options: [
        "Division by zero — the formula requires scaling by $1/\\det(A)$, and dividing by 0 is undefined.",
        "The rearranged matrix $\\begin{bmatrix}d & -b \\\\ -c & a\\end{bmatrix}$ becomes the zero matrix when det = 0.",
        "The formula only applies to positive determinants.",
        "The matrix dimensions change when det = 0."
      ],
      answer: "Division by zero — the formula requires scaling by $1/\\det(A)$, and dividing by 0 is undefined.",
      hints: ["The formula multiplies the rearranged matrix by $1/(ad-bc)$. If $ad-bc=0$, you divide by zero. This algebraic impossibility mirrors the geometric reality: you cannot invert a squished space."],
      reviewSection: 'Math tab — Inverse formula'
    },
    {
      id: 'la2-003-quiz-5',
      type: 'choice',
      text: "To solve $A\\mathbf{x} = \\mathbf{b}$, a programmer writes `x = inv(A) * b`. What is the better professional approach?",
      options: [
        "Use `A \\\\ b` (MATLAB) or `np.linalg.solve(A, b)` (Python) — LU factorization is faster and numerically stabler than computing the full inverse.",
        "Use `A' * b` — the transpose avoids numerical issues.",
        "Use `b / A` — this is the matrix division operator and avoids forming the inverse.",
        "There is no meaningful difference; `inv(A) * b` is the correct approach."
      ],
      answer: "Use `A \\\\ b` (MATLAB) or `np.linalg.solve(A, b)` (Python) — LU factorization is faster and numerically stabler than computing the full inverse.",
      hints: ["Computing the full $A^{-1}$ wastes computation if all you need is one solution. LU factorization solves $A\\mathbf{x} = \\mathbf{b}$ directly in $O(n^3)$ without materializing $A^{-1}$."],
      reviewSection: 'Intuition tab — Professional warning callout'
    },
    {
      id: 'la2-003-quiz-6',
      type: 'choice',
      text: "If $\\det(A) = -3$, what is $\\det(A^{-1})$?",
      options: [
        "$-1/3$ — because $\\det(A) \\cdot \\det(A^{-1}) = \\det(AA^{-1}) = \\det(I) = 1$.",
        "$3$ — the inverse negates the sign and flips the magnitude.",
        "$1/3$ — the inverse always has a positive determinant.",
        "$9$ — the determinant squares when you invert."
      ],
      answer: "$-1/3$ — because $\\det(A) \\cdot \\det(A^{-1}) = \\det(AA^{-1}) = \\det(I) = 1$.",
      hints: ["Use $\\det(AB) = \\det(A)\\det(B)$. Set $B = A^{-1}$: $\\det(A) \\cdot \\det(A^{-1}) = \\det(I) = 1$, so $\\det(A^{-1}) = 1/\\det(A) = 1/(-3) = -1/3$."],
      reviewSection: 'Rigor tab — Key properties of the determinant',
    },
    {
      id: 'la2-003-quiz-7',
      type: 'choice',
      text: 'Compute $\\det\\begin{bmatrix}4&2\\\\6&3\\end{bmatrix}$ and state whether the matrix is invertible.',
      options: [
        '$\\det = 0$; not invertible — column 2 is $\\frac{1}{2}$ column 1',
        '$\\det = 12$; invertible',
        '$\\det = -6$; invertible with a negative determinant',
        '$\\det = 24$; invertible because all entries are positive',
      ],
      answer: '$\\det = 0$; not invertible — column 2 is $\\frac{1}{2}$ column 1',
      hints: ['$\\det = (4)(3) - (2)(6) = 12 - 12 = 0$. Column 2 = $\\frac{1}{2} \\times$ column 1. Dependent columns always give $\\det = 0$.'],
      reviewSection: 'Math tab — Determinant formula',
    },
    {
      id: 'la2-003-quiz-8',
      type: 'choice',
      text: 'Use the $2 \\times 2$ inverse formula to find $A^{-1}$ for $A = \\begin{bmatrix}3&1\\\\2&1\\end{bmatrix}$.',
      options: [
        '$A^{-1} = \\begin{bmatrix}1&-1\\\\-2&3\\end{bmatrix}$',
        '$A^{-1} = \\begin{bmatrix}1&2\\\\-1&3\\end{bmatrix}$',
        '$A^{-1} = \\begin{bmatrix}3&-1\\\\-2&1\\end{bmatrix}$',
        '$A^{-1} = \\begin{bmatrix}-3&-1\\\\-2&-1\\end{bmatrix}$',
      ],
      answer: '$A^{-1} = \\begin{bmatrix}1&-1\\\\-2&3\\end{bmatrix}$',
      hints: ['$\\det = 3-2=1$. Formula: swap $a$ and $d$, negate $b$ and $c$, divide by det. $A^{-1} = \\frac{1}{1}\\begin{bmatrix}1&-1\\\\-2&3\\end{bmatrix}$. Verify: $AA^{-1} = I$.'],
      reviewSection: 'Example 1 — 2×2 inverse formula',
    },
    {
      id: 'la2-003-quiz-9',
      type: 'choice',
      text: 'A transformation $A$ has $|\\det(A)| = 5$. What does this tell you about areas under $A$?',
      options: [
        'Areas are scaled by a factor of 5',
        'Areas are divided by 5',
        'Areas are unchanged — only lengths change',
        'Areas shrink to zero',
      ],
      answer: 'Areas are scaled by a factor of 5',
      hints: ['$|\\det(A)|$ is the area scaling factor. A unit square has area 1; after applying $A$ its area becomes $|\\det(A)| = 5$. If $\\det < 0$, orientation flips but area magnitude still scales by $|\\det|$.'],
      reviewSection: 'Intuition tab — determinant and area',
    },
    {
      id: 'la2-003-quiz-10',
      type: 'choice',
      text: 'If $A$ and $B$ are both $2 \\times 2$ invertible matrices, which of the following correctly gives $(AB)^{-1}$?',
      options: [
        '$B^{-1}A^{-1}$ — reverse the order when inverting a product',
        '$A^{-1}B^{-1}$ — invert each factor in the same order',
        '$A^{-1} + B^{-1}$ — the inverse of a sum is the sum of inverses',
        '$(A+B)^{-1}$ — combine first then invert',
      ],
      answer: '$B^{-1}A^{-1}$ — reverse the order when inverting a product',
      hints: ['Verify: $(AB)(B^{-1}A^{-1}) = A(BB^{-1})A^{-1} = AIA^{-1} = AA^{-1} = I$. Just like undoing "put on socks then shoes" requires removing shoes first, then socks.'],
      reviewSection: 'Rigor tab — Key properties of the determinant',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'The inverse of $A$ is computed by just taking the reciprocal of each entry: $(A^{-1})_{ij} = 1/a_{ij}$.',
      whyStudentsThinkIt: 'In scalar arithmetic, the inverse of $x$ is $1/x$. Students apply this entry-wise thinking to matrices.',
      correctionExample: 'For $A = \\begin{bmatrix}2&1\\\\5&3\\end{bmatrix}$: the entry-wise "inverse" would be $\\begin{bmatrix}0.5&1\\\\0.2&0.33\\end{bmatrix}$. But $A \\cdot \\begin{bmatrix}0.5&1\\\\0.2&0.33\\end{bmatrix} \\neq I$. The true inverse via $ad-bc=1$ is $\\begin{bmatrix}3&-1\\\\-5&2\\end{bmatrix}$.',
      contrastCase: 'The scalar analogy is: the inverse of $2$ is $0.5$ because $2 \\times 0.5 = 1$. The matrix analogy is: $A^{-1}$ is the matrix such that $A \\cdot A^{-1} = I$. That constraint forces a very specific formula, not entry-wise reciprocals.',
    },
    {
      falseBelief: 'A matrix with all nonzero entries always has an inverse.',
      whyStudentsThinkIt: 'Students equate "has entries" with "can be inverted." If the matrix has numbers, surely it does something?',
      correctionExample: '$A = \\begin{bmatrix}1&2\\\\2&4\\end{bmatrix}$ has all nonzero entries but $\\det(A) = 4-4=0$ — no inverse. The matrix collapses $\\mathbb{R}^2$ onto the line $y=2x$. Every input on the same line through the origin maps to the same output.',
      contrastCase: 'Even the zero matrix (all zeros) has a determinant of 0 and no inverse. But a matrix need not be zero to be non-invertible — it just needs at least one pair of proportional columns.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A CNC probe measures the positions of three reference holes on a fixture. The machine needs to compute the coordinate transformation from "fixture frame" to "machine frame." What happens if two of the three holes happen to be at the same X-coordinate?',
      competingTechniques: 'Proceed with the transformation calculation vs. check the determinant of the setup matrix first',
      whyThisTechniqueWins: 'If two reference points share an X-coordinate, the setup matrix has proportional columns — $\\det = 0$. The coordinate transformation is undefined. The machine controller should check $\\det$ and refuse to proceed rather than computing a singular or near-singular transformation that would crash the tool.',
    },
    {
      situation: 'In 3D computer graphics, a "view matrix" transforms 3D world coordinates to camera coordinates. A projective "perspective matrix" then collapses 3D to 2D screen coordinates. Why can you invert the view matrix but not the perspective matrix?',
      competingTechniques: 'Try to invert both matrices vs. check the determinant of each',
      whyThisTechniqueWins: 'The view matrix is a rigid rotation/translation ($\\det \\neq 0$, invertible — you can reverse the camera placement). The perspective matrix deliberately collapses the $z$-dimension to create depth cues, making $\\det = 0$. You cannot recover 3D depth from a 2D projection — the $z$-information is permanently destroyed.',
    },
  ],

  debugging: [
    {
      commonError: 'Computing the inverse formula correctly but in the wrong order: writing $\\frac{1}{ad-bc}\\begin{bmatrix}a&-b\\\\-c&d\\end{bmatrix}$ instead of $\\frac{1}{ad-bc}\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$.',
      symptom: 'Student gets $A^{-1}A \\neq I$ when checking the answer.',
      whyItHappened: 'The formula requires swapping $a$ and $d$ (top-left and bottom-right), not leaving them in place.',
      repairStrategy: 'Mnemonic: "swap the diagonal, negate the off-diagonal." The top-left becomes $d$, the bottom-right becomes $a$. Then negate $b$ (top-right) and $c$ (bottom-left). Always verify: $A^{-1}A$ should give $I$.',
    },
    {
      commonError: 'Using `inv(A)` or `numpy.linalg.inv(A)` to solve $A\\mathbf{x} = \\mathbf{b}$ in code.',
      symptom: 'The solution is numerically inaccurate, especially for large or ill-conditioned matrices.',
      whyItHappened: 'Computing the full inverse is more arithmetic operations than necessary and amplifies numerical errors. The inverse is only needed when you need $A^{-1}$ itself (e.g., for repeated solves with different $\\mathbf{b}$).',
      repairStrategy: 'Use `A \\\\ b` (MATLAB) or `numpy.linalg.solve(A, b)`. These use LU factorization internally — they solve the system without materializing $A^{-1}$, which is both faster and numerically stabler.',
    },
  ],

  mastery: {
    targetLevel: 3,
    solveIndependently: 'Compute $\\det(A)$ and $A^{-1}$ for any $2 \\times 2$ matrix using the formula, determine invertibility by checking the determinant, and solve $A\\mathbf{x} = \\mathbf{b}$ by multiplying both sides by $A^{-1}$.',
    explainVerbally: 'Explain why a zero determinant means no inverse exists (the transformation squishes space irreversibly), and why the determinant equals the area-scaling factor of the transformation.',
    detectIncorrectApplication: 'Identify when a student swaps the wrong entries in the $2 \\times 2$ inverse formula, or when they try to invert a matrix with $\\det = 0$.',
    transferToUnfamiliar: 'Given a $3 \\times 3$ matrix, decide invertibility by computing the determinant using cofactor expansion, and explain geometrically what $\\det = 0$ means for 3D volume.',
  },
};
