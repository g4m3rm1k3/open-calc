import columnNullSpaceUrl from '../diagrams/la-column-null-space.svg?url'
import rankNullityBarUrl from '../diagrams/la-rank-nullity-bar.svg?url'

export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la2-004',
  slug: 'null-space-and-column-space',
  chapter: 'la2',
  order: 4,
  title: 'Null Space and Column Space',
  subtitle: 'When a matrix destroys space, where does the debris go?',
  tags: ['null space', 'column space', 'kernel', 'image', 'rank', 'rank-nullity theorem'],
  aliases: 'kernel and image span of matrix dimension of matrix crushed vectors singular matrices',

  // ── Pedagogical Meta ───────────────────────────────────────────
  timeToComplete: 20,
  coreConcept: 'The "Column Space" represents all vectors a transformation can successfully reach. The "Null Space" represents all vectors that were crushed into the absolute origin during that transformation. Together, they conserve the total dimensionality of the space.',
  prerequisites: ['la2-003'],
  nextLesson: 'eigenvectors-and-eigenvalues',

  // ── Hook ───────────────────────────────────────────────────────
  hook: {
    question: "If you shine a flashlight entirely on a 3D object, it casts a 2D shadow. What happened mathematically to the vectors pointing straight toward the flashlight?",
    realWorldContext: "When an MRI machine takes scans of your brain, it captures a series of 2D cross-sections. In mathematical terms, the machine is applying a transformation that flattens 3D space into a 2D plane (the image you look at on the screen). That 2D screen is the exactly the 'Column Space' of the scanner's transformation. But what about the depth? Any vector pointing perfectly straight into the screen gets squashed flat into a single point: the origin. That collection of perfectly squashed vectors forms the 'Null Space'. By understanding exactly what the Null Space is, software engineers can write algorithms that computationally rebuild 3D 360-degree models from those flat MRI slices.",
    previewVisualizationId: 'LALesson07_NullSpace',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    blocks: [
      { type: 'prose', paragraphs: [
      'Take $A = \\begin{bmatrix}1&2\\\\2&4\\end{bmatrix}$. Apply $A$ to $[2,-1]^T$: result is $[1\\cdot2+2\\cdot(-1),\\ 2\\cdot2+4\\cdot(-1)]^T = [0,0]^T$. The vector $[2,-1]^T$ gets crushed to zero. So does every scalar multiple: $[-4,2]^T \\to \\mathbf{0}$, $[6,-3]^T \\to \\mathbf{0}$. This entire line is the **null space**. Now ask: what outputs CAN $A$ produce? $A\\mathbf{x} = x_1[1,2]^T + x_2[2,4]^T = (x_1 + 2x_2)[1,2]^T$ — always a multiple of $[1,2]^T$. Every output lives on that single line: the **column space**. One direction is crushed (null space); one direction survives (column space). Rank-Nullity: $1 + 1 = 2$ columns.',
      ] },
      { type: 'image', src: columnNullSpaceUrl,
        alt: 'Left domain panel showing the null space line where vectors get crushed to zero, an arrow A pointing to the right panel showing the column space as a 1D line in R-squared, with the crushed vector landing at the origin and a surviving input vector landing at a marked point on the line',
        caption: 'One direction survives the transformation (the column space); the other is annihilated (the null space).' },
      { type: 'prose', paragraphs: [
      '**The column space — the range of the transformation.** When you apply matrix $A$ to every possible input vector $\\mathbf{x} \\in \\mathbb{R}^n$, the set of all resulting output vectors $A\\mathbf{x}$ is called the **column space** of $A$ (written $\\text{col}(A)$ or $C(A)$, or in abstract algebra, the **image** $\\text{im}(A)$). Geometrically, it is the subspace spanned by the columns of $A$. If $A$ maps $\\mathbb{R}^3$ to a 2D plane, that plane is the column space. Any point *not* on that plane is unreachable — no input exists that lands there.',
      '**The null space — the graveyard.** The **null space** of $A$ (written $N(A)$, $\\ker(A)$, or the **kernel**) is the set of all vectors that $A$ sends to the zero vector: $N(A) = \\{\\mathbf{x} : A\\mathbf{x} = \\mathbf{0}\\}$. If $A$ squishes a 3D space to a 2D plane, one entire direction (a line through the origin) collapses to the origin. Every vector along that line maps to $\\mathbf{0}$. That line is the null space.',
      '**The Rank-Nullity theorem.** Dimensions balance perfectly:\n\n$$\\underbrace{\\text{rank}(A)}_{\\text{dim of column space}} + \\underbrace{\\text{nullity}(A)}_{\\text{dim of null space}} = \\underbrace{n}_{\\text{number of columns}}$$\n\nA $3 \\times 3$ matrix with rank 2 must have a 1D null space. $2 + 1 = 3$. Dimensions are conserved — they just get rerouted from "useful output" into "crushed directions."',
      ] },
      { type: 'image', src: rankNullityBarUrl,
        alt: 'A segmented bar split into pivot columns and free columns, with brackets labeling rank(A) over the pivot segments and nullity(A) over the free segments, totaling n columns',
        caption: 'rank(A) (surviving, pivot directions) and nullity(A) (crushed, free directions) always add up to the total number of columns.' },
      { type: 'prose', paragraphs: [
      '**The MRI connection.** An MRI scanner captures 2D cross-sectional slices (the column space of the scan operator). Depth — the coordinate pointing into the scanner — is not recorded per-slice: it is in the null space. Reconstruction algorithms like filtered back-projection implicitly compute the pre-image of each slice, combining many slices to recover the 3D structure. They are inverting the operator over its column space while knowing that the null space is informationless.',
      '**CNC probe calibration.** A CNC machine probes the workpiece at reference points to establish its coordinate frame. If you probe only collinear points (all on one line), the probe data matrix has rank 1 — its column space is 1D. You cannot recover the 2D plane of the part surface. The null space of the measurement matrix has dimension 1, meaning one direction of the surface is completely undetermined. Quality standards require probe points spread in 2D (non-collinear) so that rank = 2 and the full surface plane is uniquely determined.',
      '**Predict before reading on.** Matrix $A = \\begin{bmatrix}1&0&2\\\\0&1&-1\\\\0&0&0\\end{bmatrix}$. Without computing: what is the rank? What is the nullity? What is the dimension of the column space? Write your answers, then check in Example 2.',
      '**Where this is heading:** We understand the four fundamental subspaces of any matrix. The next chapter asks: which special vectors completely resist rotation — they only get scaled by a factor? Those are the eigenvectors, and they are built from the null space idea applied to shifted matrices.',
      ] },
      { type: 'viz', id: 'NullSpaceColumnSpaceViz',
        title: 'Column Space & Null Space — Input Fan Visualization',
        mathBridge: 'The cyan arrows show outputs of M for a fan of unit input vectors — they land in the column space (the image). The yellow dashed line (when visible) is the null space — all inputs that map to zero. Switch examples: Full rank 2×2 (null = {0}, col space = all of ℝ²), Rank 1 (null = a LINE, col space = a LINE), Zero map (null = all of ℝ², col space = {0}), and Projection (null = y-axis, col space = x-axis). Watch how rank + nullity always equals 2.',
        caption: 'Every input direction either lands somewhere nonzero (in the column space) or gets crushed to zero (in the null space). Together they cover all of ℝ².' },
      { type: 'viz', id: 'LALesson07_NullSpace',
        title: 'Visualizing the Crushed Space',
        mathBridge: 'Observe the 3D space being flattened into a 2D plane. Step 1: Drag the camera to see how the Column Space (the purple plane) contains all final destinations. Step 2: Notice the glowing red line piercing straight through the plane. That is the Null Space. Every vector that started on that red line was physically crushed directly into the origin $(0,0,0)$.',
        caption: 'The Column Space is what survives. The Null Space is what gets crushed to zero.' },
      { type: 'viz', id: 'LALesson06_Inverses',
        title: 'Null Space Grows as Determinant Shrinks',
        mathBridge: 'Slide the transformation matrix toward singularity and watch two things happen simultaneously: the determinant approaches 0, and the column space collapses from a 2D plane to a 1D line. The null space grows from just the origin to a full line through the origin. At det = 0, the null space has dimension 1 and the Rank-Nullity theorem snaps into view: rank drops by 1, nullity rises by 1. Total dimensions are conserved.',
        caption: 'As det → 0, column space collapses and null space grows — Rank-Nullity in motion.' },
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Procedure: Find a Basis for the Null Space',
        body: 'Step 1. Set up the equation $A\\mathbf{x} = \\mathbf{0}$ and form the augmented matrix $[A \\mid \\mathbf{0}]$.\nStep 2. Row-reduce to RREF. Identify the pivot columns and the free variable columns (non-pivot columns).\nStep 3. nullity = (number of free columns) = $n - \\text{rank}$.\nStep 4. For each free variable, set that free variable to 1 and all other free variables to 0.\nStep 5. Back-substitute to find the pivot variables — this gives one null space basis vector.\nStep 6. Repeat Step 4–5 for every free variable. The resulting vectors form a basis for $N(A)$.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 4 of 12 — Matrices & Transformations',
        body: '**Previous:** Determinants and inverses — when is a transformation reversible?\n**This lesson:** Column space (what the transformation can reach) and null space (what it annihilates).\n**Next (LA3):** Eigenvectors — vectors immune to rotation, only scaled.',
      },
      {
        type: 'insight',
        title: 'Rank-Nullity Theorem',
        body: 'For an $m \\times n$ matrix $A$:\n\n$$\\text{rank}(A) + \\text{nullity}(A) = n$$\n\n**rank** = dim of column space = number of pivot columns.\n**nullity** = dim of null space = number of free variables = number of non-pivot columns.\n\nDimensions are conserved: they move between column space and null space, never disappear.',
      },
      {
        type: 'definition',
        title: 'Four Fundamental Subspaces',
        body: 'Every $m \\times n$ matrix $A$ has four fundamental subspaces:\n\n1. **Column space** $C(A) \\subseteq \\mathbb{R}^m$ — span of columns, dim = rank\n2. **Null space** $N(A) \\subseteq \\mathbb{R}^n$ — kernel of $A$, dim = nullity\n3. **Row space** $C(A^T) \\subseteq \\mathbb{R}^n$ — span of rows, dim = rank\n4. **Left null space** $N(A^T) \\subseteq \\mathbb{R}^m$ — kernel of $A^T$, dim = $m$ − rank\n\nFundamental theorem: $N(A) \\perp C(A^T)$ and $N(A^T) \\perp C(A)$.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      'Let $A$ be an $m \\times n$ matrix (meaning a transformation taking an $n$-dimensional input to an $m$-dimensional output).',
      'The **Column Space** $C(A)$ is the set of all possible linear combinations of the columns of $A$. Mathematically: $C(A) = \\{ A\\vec{x} \\mid \\vec{x} \\in \\mathbb{R}^n \\}$. It forms a valid subspace.',
      'To find the Column Space, you simply perform Row Reduction (Gaussian Elimination) to find the pivot columns. The *original* columns of $A$ that correspond to those pivots form the true basis for the Column Space.',
      'The **Null Space** $N(A)$ is the set of all vectors that result in the zero vector when multiplied by $A$. Mathematically: $N(A) = \\{ \\vec{x} \\in \\mathbb{R}^n \\mid A\\vec{x} = \\vec{0} \\}$.',
      'To find the Null Space, you solve the homogeneous equation $A\\vec{x} = \\vec{0}$ by row-reducing the augmented matrix $[A \\mid \\vec{0}]$. The free variables in your row-reduced form will perfectly define the vectors spanning the Null Space.'
    ],
    callouts: [
      {
        type: 'strategy',
        title: 'Column Space Trick',
        body: 'Do not use the columns of the row-reduced matrix as the basis for the Column Space! Row operations change the Column Space. You must trace the pivots back to the completely original matrix $A$.',
      },
      {
        type: 'definition',
        title: 'How to Find the Null Space — Step by Step',
        body: 'Set up $A\\mathbf{x} = \\mathbf{0}$ and row-reduce. Identify free variables (non-pivot columns). For each free variable: set it to 1, all other free variables to 0, back-substitute for the pivot variables. The result is one null space basis vector. Repeat for every free variable. The full set spans $N(A)$.\n\n**Example:** if columns 1 and 3 are pivots and column 2 is free ($x_2$), set $x_2 = 1$, solve for $x_1$ and $x_3$ from the equations, assemble into a vector.',
      },
      {
        type: 'theorem',
        title: 'General Solution Structure for Ax = b',
        body: 'If $A\\mathbf{x} = \\mathbf{b}$ is consistent (i.e., $\\mathbf{b} \\in C(A)$), then its **general solution** is:\n\n$$\\mathbf{x} = \\mathbf{x}_p + \\mathbf{x}_h$$\n\n$\\mathbf{x}_p$ = any **particular solution**; $\\mathbf{x}_h \\in N(A)$ = any null space vector.\n\nThe solution set is an affine subspace — a shifted copy of the null space. The null space dimension equals the number of free parameters in the solution.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'OpenMAT: Null Space and Column Space',
        mathBridge: 'MATLAB: `rank(A)` counts pivot columns; `null(A)` returns an orthonormal basis for the null space; `orth(A)` returns an orthonormal basis for the column space. Verify: A * null(A) ≈ 0.',
        caption: 'Three cells: computing rank and null space, the four subspaces, and CNC probe geometry check.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'rank(), null(), orth() — the three essential commands',
              prose: [
                '`rank(A_full)` counts how many columns are linearly independent — computed internally via LU factorization. For `A_full = [1 2; 3 4]`: neither column is a multiple of the other, so rank = 2 = n. Full rank means invertible and the null space is trivial.',
                '`size(null(A_full), 2)` counts how many basis vectors span $N(A) = \\{\\mathbf{x}: A\\mathbf{x}=\\mathbf{0}\\}$. For `A_full` (full rank), `null(A_full)` returns an empty matrix — no non-trivial vector maps to zero. For `B = [1 2; 3 6]` (row 2 = 3×row 1, rank = 1): `null(B)` returns one column — the single direction that $B$ collapses to zero.',
                '`B * null_B` should print near-zero (around $10^{-16}$, machine epsilon) — this verifies $B\\mathbf{v} = \\mathbf{0}$ computationally. `orth(B)` returns a unit-length column spanning the column space. For rank-1 $B$, both `null(B)` and `orth(B)` return a single column — one direction survives (column space), one is annihilated (null space).',
              ],
              code: `% Full rank matrix (invertible)
A_full = [1 2; 3 4];
fprintf('rank(A_full) = %d  (full rank, 2×2)\\n', rank(A_full))
fprintf('null(A_full) has %d column(s)  (trivial null space)\\n', size(null(A_full),2))

% Rank-deficient matrix (row 2 = 3 × row 1)
B = [1 2; 3 6];
fprintf('\\nrank(B) = %d  (rank deficient)\\n', rank(B))
null_B = null(B);
fprintf('null(B) has %d column(s):\\n', size(null_B,2))
disp(null_B)

% Verify: B * null_vec = 0
fprintf('B * null(B) = ')
disp(B * null_B)

% Column space basis via orth()
disp('Column space basis of B:'); disp(orth(B))`,
            },
            {
              id: 2,
              cellTitle: 'Rank-Nullity theorem — dimensions must balance',
              prose: [
                '`[m, n] = size(A)` reads shape: $m = 3$ rows, $n = 4$ columns. Rank-Nullity divides $n = 4$ into pivot columns (rank) + free columns (nullity).',
                '`r = rank(A)` counts pivot columns via LU. `nullity = n - r` is the theorem directly: $\\text{rank} + \\text{nullity} = n$. For this matrix: 2 pivot columns + 2 free columns = 4 = n.',
                '`null_basis = null(A)` returns a $4 \\times 2$ matrix — two orthonormal columns, each a basis vector for $N(A) \\subseteq \\mathbb{R}^4$. The matrix maps $\\mathbb{R}^4 \\to \\mathbb{R}^3$; the null space lives in the input space $\\mathbb{R}^4$, dimension = nullity = 2.',
                '`norm(A * null_basis)` computes $\\|A[\\mathbf{v}_1, \\mathbf{v}_2]\\|_F$ (Frobenius norm). If both columns of `null_basis` truly satisfy $A\\mathbf{v} = \\mathbf{0}$, the product is a zero matrix and this norm prints $\\approx 10^{-15}$ — confirming the basis is correct.',
              ],
              code: `% 3×4 matrix: maps R^4 → R^3
A = [1 2 0 3;
     2 4 1 5;
     0 0 1 -1];

[m, n] = size(A);
r = rank(A);
nullity = n - r;
null_basis = null(A);

fprintf('Matrix size: %d × %d\\n', m, n)
fprintf('rank(A)    = %d\\n', r)
fprintf('nullity(A) = %d\\n', nullity)
fprintf('rank + nullity = %d = n  (rank-nullity theorem confirmed)\\n', r + nullity)

fprintf('\\nNull space has %d basis vector(s):\\n', size(null_basis,2))
disp(null_basis)

% Verify all null space vectors satisfy A*v = 0
residual = norm(A * null_basis);
fprintf('||A * null_basis|| = %.2e  (should be ≈ 0)\\n', residual)`,
            },
            {
              id: 3,
              cellTitle: 'Application: CNC probe calibration — catching collinear probe points',
              prose: [
                '`P2 - P1` and `P3 - P1` compute edge vectors from the first probe point. `M_good = [P2-P1, P3-P1]` assembles a 2×2 matrix whose columns are those two direction vectors. `rank(M_good) = 2` means the vectors point in independent directions — together they span the full 2D plane of the workpiece surface.',
                'For the bad layout: `P3_bad = [50; 0]` is collinear with P1 and P2 (all on the x-axis). `M_bad` has columns `[100; 0]` and `[50; 0]` — proportional, so rank = 1. `null(M_bad)` returns the y-direction: the y-component of the surface is entirely undetermined. The CNC controller cannot reconstruct the part plane from this data alone.',
                '`null_dir` printed as `[0; 1]` (the y-direction) is not a coincidence — it is the **Fundamental Theorem** in action: $N(A) \\perp C(A^T)$. The row space of `M_bad` spans only the x-axis, so its null space must be perpendicular to that: the y-axis. Every direction the probe CAN measure (x-axis) is perpendicular to every direction it CANNOT determine (y-axis). `null(M_bad)` reveals exactly which surface direction is missing from the probe setup.',
              ],
              code: `% Good probe layout: 3 non-collinear points define a plane
P1 = [0;   0  ];
P2 = [100; 0  ];
P3 = [50;  75 ];  % off-axis

% Edge vectors from P1
M_good = [P2-P1,  P3-P1];  % 2×2 matrix of direction vectors
fprintf('Good probe layout:\\n')
fprintf('  rank = %d  (full rank → plane well-defined)\\n', rank(M_good))
fprintf('  nullity = %d  (no undetermined directions)\\n', 2 - rank(M_good))

% Bad probe layout: all 3 points are collinear
P3_bad = [50; 0];
M_bad = [P2-P1, P3_bad-P1];
fprintf('\\nBad probe layout (collinear):\\n')
fprintf('  rank = %d  (rank-deficient!)\\n', rank(M_bad))
fprintf('  nullity = %d  (one surface direction is UNKNOWN)\\n', 2 - rank(M_bad))
null_dir = null(M_bad);
fprintf('  Unknown direction: [%.3f; %.3f]\\n', null_dir(1), null_dir(2))`,
            },
            {
              id: 4,
              cellTitle: 'Challenge: consistency check using rank',
              prose: [
                '`rank(A)` and `rank([A b])` compare the rank of $A$ alone vs the augmented matrix $[A|\\mathbf{b}]$. If $\\text{rank}([A|\\mathbf{b}]) > \\text{rank}(A)$, appending $\\mathbf{b}$ added an independent row — $\\mathbf{b}$ is outside $C(A)$, so the system is inconsistent. If the ranks are equal, $\\mathbf{b} \\in C(A)$ and the system is consistent.',
                'For `b_good`: $A\\mathbf{x} = \\mathbf{b}$ has a solution because $\\mathbf{b}$ lies in the column space. For `b_bad`: the rank jumps, revealing the contradiction. `A \\ b_good` solves the consistent system via backslash — attempting `A \\ b_bad` would return a least-squares approximation (not an exact solution), another clue that $\\mathbf{b}_{\\text{bad}} \\notin C(A)$.',
                '`rank([A b_good]) == rank(A)` is true because `b_good = 2 * col1` — appending a vector already in the column space adds no new independent direction. `rank([A b_bad]) > rank(A)` because `b_bad = [1;4]` is NOT a multiple of `[1;3]` — it lies off the column space line and needs one more dimension to be explained. This rank jump is the algebraic signature of inconsistency: the system must simultaneously satisfy two contradictory equations, and no $\\mathbf{x}$ can do both.',
              ],
              code: `% Column space consistency check
A = [1 2; 3 6];  % rank 1

b_good = [2; 6];   % b = 2 * col1 => in C(A)
b_bad  = [1; 4];   % not a multiple of [1;3] => not in C(A)

r_A     = rank(A);
r_good  = rank([A b_good]);
r_bad   = rank([A b_bad]);

fprintf('rank(A) = %d\\n', r_A)
fprintf('rank([A | b_good]) = %d  ', r_good)
if r_good == r_A, disp('-> CONSISTENT  (b in C(A))');
else,             disp('-> INCONSISTENT'); end

fprintf('rank([A | b_bad]) = %d  ', r_bad)
if r_bad == r_A, disp('-> CONSISTENT');
else,            disp('-> INCONSISTENT  (b NOT in C(A))'); end`,
            },
          ]
        }
      },
      {
        id: 'PythonNotebook',
        title: 'Code: Null Space and Column Space',
        mathBridge: 'np.linalg.matrix_rank(A) = number of pivot columns = dim(C(A)). Null space dimension = n − rank (rank-nullity theorem). scipy.linalg.null_space(A) computes a basis for N(A).',
        caption: 'Find what a matrix destroys (null space) and what it can reach (column space).',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Rank — counting the independent directions',
              prose: [
                '`np.linalg.matrix_rank(A)` counts linearly independent columns by computing the SVD and counting singular values above a numerical threshold. For `A = [[1,2],[3,4]]`: columns `[1,3]` and `[2,4]` point in different directions — rank = 2 = n. For `B = [[1,2],[3,6]]`: column 2 = 2×column 1 — only one independent direction, rank = 1.',
                'The rank-nullity theorem $\\text{rank} + \\text{nullity} = n$ printed for `B`: $1 + 1 = 2$. The parallelogram plot shows this geometrically — `A` produces a non-degenerate parallelogram (columns span the plane), `B` produces a degenerate one: both arrows collapse to the same line (zero-area parallelogram = rank 1 = zero determinant).',
                '`plt.Polygon([origin, c1, c1+c2, c2])` draws the parallelogram whose **signed area equals the determinant**. For `A` (rank 2), the area is nonzero — the columns span the plane. For `B` (rank 1), col2 = 2×col1 so the parallelogram degenerates to a line with area 0. `np.linalg.matrix_rank` computes this via SVD: it counts singular values above a threshold. Zero area ↔ a zero singular value ↔ rank drops by 1. This ties the determinant (from la2-003) to rank: det = 0 ↔ rank < n ↔ nullity > 0.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

A = np.array([[1., 2.], [3., 4.]])   # full rank
B = np.array([[1., 2.], [3., 6.]])   # rank 1

rank_A = np.linalg.matrix_rank(A)
rank_B = np.linalg.matrix_rank(B)
print(f"rank(A) = {rank_A}  (full rank)")
print(f"rank(B) = {rank_B}  (rank 1, nullity = {B.shape[1] - rank_B})")
print(f"rank-nullity: {rank_B} + {B.shape[1]-rank_B} = {B.shape[1]}")

fig, axes = plt.subplots(1, 2, figsize=(9, 4))
origin = np.zeros(2)
for ax, M, title in [
    (axes[0], A, f"A: rank={rank_A} (spans plane)"),
    (axes[1], B, f"B: rank={rank_B} (spans 1D line)")]:
    c1, c2 = M[:, 0], M[:, 1]
    para = plt.Polygon([origin, c1, c1+c2, c2], alpha=0.2, color='steelblue')
    ax.add_patch(para)
    ax.annotate('', xy=c1, xytext=origin, arrowprops=dict(arrowstyle='->', color='steelblue', lw=2.5))
    ax.annotate('', xy=c2, xytext=origin, arrowprops=dict(arrowstyle='->', color='darkorange', lw=2.5))
    ax.text(c1[0]*0.5+0.1, c1[1]*0.5+0.1, 'c1', color='steelblue', fontsize=11)
    ax.text(c2[0]*0.5+0.1, c2[1]*0.5+0.1, 'c2', color='darkorange', fontsize=11)
    ax.set_title(title, fontsize=11)
    ax.set_xlim(-1, 5); ax.set_ylim(-1, 7)
    ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
    ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: 'Computing the null space',
              prose: [
                '`scipy.linalg.null_space(B)` computes $N(B) = \\{\\mathbf{x}: B\\mathbf{x}=\\mathbf{0}\\}$ via SVD: the right singular vectors corresponding to near-zero singular values span the null space. For `B = [[1,2],[3,6]]` (rank 1): one singular value $\\approx 0$, so `null_B` is a single normalized column.',
                '`B @ null_B` prints near-zero (around $10^{-16}$) — the verification that `null_B` satisfies $B\\mathbf{x}=\\mathbf{0}$. The plot shows the null vector (red) and its negative — the null space is this entire 1D line through the origin. By the Fundamental Theorem, the null space is perpendicular to the row space. Notice the blue column-space line and the red null-space line are orthogonal: they are the two complementary subspaces of $\\mathbb{R}^2$ for this rank-1 matrix.',
                '`np.dot(null_B[:,0], B[:,0])` should print near zero — the null vector is perpendicular to the column direction. This is $N(A) \\perp C(A^T)$ (Fundamental Theorem): the null space and row space are orthogonal complements in the input space $\\mathbb{R}^n$. For $B$: col1 = $[1,3]^T$ (column space direction), null vector $\\approx [-0.894, 0.447]^T$ (which is $[-2,1]/\\sqrt{5}$, the null space direction). Their dot product: $-0.894 + 3(0.447) = -0.894 + 1.341 \\approx 0$. Perpendicularity is not a numerical accident — it is guaranteed by the theorem.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy import linalg

B = np.array([[1., 2.], [3., 6.]])
null_B = linalg.null_space(B)
print("Null space basis vector:")
print(null_B)
print("B @ null_vec =", (B @ null_B).round(10))

fig, ax = plt.subplots(figsize=(6, 5))
ax.set_title("Null space of B: all vectors mapped to 0", fontsize=12)
origin = np.zeros(2)
# Draw the column span (1D line through col 1)
t = np.linspace(-2, 4, 100)
col1 = B[:, 0] / np.linalg.norm(B[:, 0])
ax.plot(t*B[0,0]/np.linalg.norm(B[:,0]), t*B[1,0]/np.linalg.norm(B[:,0]),
        color='steelblue', lw=2, alpha=0.5, label='column space (1D line)')
# Draw the null vector
nv = null_B[:, 0]
ax.annotate('', xy=nv, xytext=origin, arrowprops=dict(arrowstyle='->', color='crimson', lw=2.5))
ax.text(nv[0]+0.05, nv[1]+0.05, f'null vec\\n{nv.round(3)}', color='crimson', fontsize=10)
ax.annotate('', xy=-nv, xytext=origin, arrowprops=dict(arrowstyle='->', color='crimson', lw=2.5, linestyle='dashed'))
ax.set_xlim(-1.5, 1.5); ax.set_ylim(-1.5, 1.5)
ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
ax.legend(fontsize=9)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 3,
              cellTitle: 'Application: consistency test and Rank-Nullity on a 3×4 matrix',
              prose: [
                '`np.linalg.matrix_rank(A)` counts the pivot columns — the rank. `n = A.shape[1]` is the number of columns. `nullity = n - rank` is the Rank-Nullity theorem applied directly: the gap between input dimension ($n=4$) and output dimension (rank) is exactly the number of crushed directions (null space dimension). For this matrix with 2 pivot columns, 2 directions survive and 2 are annihilated.',
                '`rank_Ab = np.linalg.matrix_rank(np.column_stack([A, b]))` augments $A$ with $\\mathbf{b}$ and recomputes the rank. If it increases, $\\mathbf{b}$ added a new independent direction that $A$\'s columns can\'t span — inconsistent. The bar chart shows both rank tests side by side: equal bars (blue = orange) mean consistent, a taller orange bar means $\\mathbf{b} \\notin C(A)$. The gap between the orange rank($[A|b]$) and blue rank($A$) bars visually encodes the consistency test.',
                '`b_good = A @ np.array([1., 0., 2., 0.])` constructs a vector guaranteed to be in $C(A)$ — any $A\\mathbf{x}$ is in $C(A)$ by definition, so this is a cheat code for constructing consistent right-hand sides. `b_bad = np.array([1., 0., 0.])` was chosen to likely lie outside $C(A)$. The Rank-Nullity theorem applies here: with 2 pivot columns (rank 2) and 2 free columns (nullity 2), the null space has dimension 2 — meaning there are infinitely many $\\mathbf{x}$ solving $A\\mathbf{x} = \\mathbf{b}_{\\text{good}}$, each differing by a null space vector.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

# 3x4 matrix: maps R^4 -> R^3
A = np.array([[1., 2., 0., 3.],
              [2., 4., 1., 5.],
              [0., 0., 1., -1.]])

r = np.linalg.matrix_rank(A)
n = A.shape[1]
print(f"rank(A) = {r},  nullity = {n - r},  rank + nullity = {n} = n (confirmed)")

# Consistency test for two right-hand sides
b_good = A @ np.array([1., 0., 2., 0.])   # in C(A) by construction
b_bad  = np.array([1., 0., 0.])            # likely not in C(A)

for b, label in [(b_good, 'b_good'), (b_bad, 'b_bad')]:
    r_Ab = np.linalg.matrix_rank(np.column_stack([A, b.reshape(-1,1)]))
    status = 'CONSISTENT' if r_Ab == r else f'INCONSISTENT (rank jumped to {r_Ab})'
    print(f"rank([A|{label}]) = {r_Ab}  -> {status}")

# Bar chart comparing rank tests
fig, ax = plt.subplots(figsize=(7, 4))
x = np.arange(2)
bars_A  = [r, r]
bars_Ab = [np.linalg.matrix_rank(np.column_stack([A, b_good.reshape(-1,1)])),
           np.linalg.matrix_rank(np.column_stack([A, b_bad.reshape(-1,1)]))]
w = 0.35
ax.bar(x - w/2, bars_A,  width=w, label='rank(A)',    color='steelblue', alpha=0.8)
ax.bar(x + w/2, bars_Ab, width=w, label='rank([A|b])',color='darkorange', alpha=0.8)
ax.set_xticks(x); ax.set_xticklabels(['b_good\\n(consistent)', 'b_bad\\n(inconsistent)'])
ax.set_ylabel('rank value'); ax.set_ylim(0, 4)
ax.set_title('Consistency test: equal bars = b in C(A)', fontsize=12)
ax.legend(); ax.grid(True, axis='y', alpha=0.3)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 4,
              cellTitle: 'Application: visualizing the four subspaces — Fundamental Theorem',
              prose: [
                '`linalg.null_space(A)` and `linalg.orth(A.T)` both return bases for subspaces in the **input space** $\\mathbb{R}^2$ (2 columns). `np.dot(null_basis[:,0], row_space[:,0])` prints near zero — confirming $N(A) \\perp C(A^T)$: the null space (directions destroyed by $A$) and row space (directions that survive) are always orthogonal. This is the first half of the Fundamental Theorem of Linear Algebra.',
                '`linalg.orth(A)` and `linalg.null_space(A.T)` both return bases for subspaces in the **output space** $\\mathbb{R}^2$ (2 rows). `np.dot(col_space[:,0], left_null[:,0])` prints near zero — confirming $C(A) \\perp N(A^T)$: the reachable outputs (column space) and unreachable directions (left null space) are orthogonal. For this rank-1 matrix, one direction in the output is reachable and one is "orphaned" — never produced by any input.',
                'The two-panel plot displays both halves of the Fundamental Theorem: the **left panel** shows input $\\mathbb{R}^2$ split into null space (red, destroyed) and row space (blue, surviving), at 90° to each other. The **right panel** shows output $\\mathbb{R}^2$ split into column space (blue, reachable) and left null space (red, unreachable), also at 90°. Together, the four arrows — two per panel, always perpendicular — are a geometric proof that every vector in $\\mathbb{R}^n$ can be uniquely decomposed into a "surviving part" and a "crushed part."',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy import linalg

# Rank-1 matrix from Example 1
A = np.array([[1., 2.], [3., 6.]])

# Input space R^2: null space N(A) and row space C(A^T)
null_basis = linalg.null_space(A)      # 2x1 (nullity=1)
row_space  = linalg.orth(A.T)          # 2x1 (rank=1)

# Output space R^2: column space C(A) and left null space N(A^T)
col_space  = linalg.orth(A)            # 2x1 (rank=1)
left_null  = linalg.null_space(A.T)    # 2x1 (m - rank = 1)

print(f"rank(A) = {np.linalg.matrix_rank(A)}")
print(f"N(A) ⊥ C(Aᵀ)? dot = {np.dot(null_basis[:,0], row_space[:,0]):.2e}  (≈ 0)")
print(f"C(A) ⊥ N(Aᵀ)? dot = {np.dot(col_space[:,0], left_null[:,0]):.2e}  (≈ 0)")

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
panels = [
  (axes[0], null_basis[:,0], 'N(A) — null (destroyed)', row_space[:,0],  'C(Aᵀ) — row (survives)', 'Input space ℝ²'),
  (axes[1], left_null[:,0],  'N(Aᵀ) — left null',       col_space[:,0],  'C(A) — col (reachable)', 'Output space ℝ²'),
]
for ax, red_vec, red_lbl, blue_vec, blue_lbl, title in panels:
    origin = np.zeros(2)
    for vec, lbl, color in [(red_vec, red_lbl, 'crimson'), (blue_vec, blue_lbl, 'steelblue')]:
        ax.annotate('', xy=vec, xytext=origin,
                    arrowprops=dict(arrowstyle='->', color=color, lw=2.5))
        ax.text(vec[0]+0.05, vec[1]+0.05, lbl, color=color, fontsize=9, fontweight='bold')
    ax.set_xlim(-1.5, 1.5); ax.set_ylim(-1.5, 1.5)
    ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
    ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
    ax.set_title(title, fontsize=11)
plt.suptitle('Fundamental Theorem: null ⊥ row, col ⊥ left-null', fontsize=11)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Rank-nullity in action',
              difficulty: 'medium',
              prompt: 'For the matrix A below: (1) compute its rank, (2) compute the nullity (= n − rank), (3) find the null space basis using scipy.linalg.null_space, (4) verify each basis vector satisfies Av = 0.',
              code: `import numpy as np
from scipy import linalg

A = np.array([[1., 2., 3.],
              [2., 4., 6.],
              [1., 1., 2.]])

# 1. rank
# 2. nullity = n - rank (n = 3 columns)
# 3. null_space basis
# 4. verify each column of null_basis satisfies A @ col ≈ 0
`,
              hint: 'np.linalg.matrix_rank(A). null_basis = linalg.null_space(A). Each column of null_basis is a basis vector. Check np.allclose(A @ null_basis, 0).',
            },
          ]
        }
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      '**Subspace verification.** Both the null space and column space are genuine vector subspaces — they are closed under addition and scalar multiplication.\n\n*Null space:* If $A\\mathbf{u} = \\mathbf{0}$ and $A\\mathbf{v} = \\mathbf{0}$, then $A(\\mathbf{u}+\\mathbf{v}) = A\\mathbf{u} + A\\mathbf{v} = \\mathbf{0}+\\mathbf{0} = \\mathbf{0}$. Also $A(c\\mathbf{u}) = cA\\mathbf{u} = \\mathbf{0}$. Both conditions hold.\n\n*Column space:* If $\\mathbf{y}_1, \\mathbf{y}_2 \\in C(A)$ then $\\mathbf{y}_1 = A\\mathbf{x}_1$, $\\mathbf{y}_2 = A\\mathbf{x}_2$, so $\\mathbf{y}_1 + \\mathbf{y}_2 = A(\\mathbf{x}_1 + \\mathbf{x}_2) \\in C(A)$. Similarly $c\\mathbf{y}_1 = A(c\\mathbf{x}_1) \\in C(A)$.',
      '**The Fundamental Theorem of Linear Algebra (Gilbert Strang).** For any $m \\times n$ matrix $A$:\n\n- $C(A) \\perp N(A^T)$ — column space and left null space are orthogonal complements in $\\mathbb{R}^m$\n- $C(A^T) \\perp N(A)$ — row space and null space are orthogonal complements in $\\mathbb{R}^n$\n\nConsequence: every vector $\\mathbf{x} \\in \\mathbb{R}^n$ decomposes uniquely as $\\mathbf{x} = \\mathbf{x}_{\\text{row}} + \\mathbf{x}_{\\text{null}}$ with $\\mathbf{x}_{\\text{row}} \\in C(A^T)$ and $\\mathbf{x}_{\\text{null}} \\in N(A)$. The matrix $A$ maps $\\mathbf{x}_{\\text{row}}$ injectively onto $C(A)$ and annihilates $\\mathbf{x}_{\\text{null}}$.',
      '**Proof of the Rank-Nullity theorem.** Let $r = \\text{rank}(A)$. RREF of $A$ has $r$ pivot columns and $n - r$ free variable columns. The null space has dimension $n - r$ (one free parameter per free column). The column space has dimension $r$ (pivot columns of the original $A$ form a basis). Therefore $r + (n-r) = n$.',
      '**Connection to Singular Value Decomposition (SVD).** The four fundamental subspaces are the exact framework for understanding the SVD: $A = U \\Sigma V^T$. The right singular vectors $V$ split into two groups: the first $r$ columns span the row space $C(A^T)$, and the last $n-r$ columns span the null space $N(A)$. The left singular vectors $U$ split similarly: first $r$ span $C(A)$, last $m-r$ span $N(A^T)$. The SVD is the "coordinate system" aligned with the four subspaces — it diagonalizes the mapping restricted to $C(A^T) \\to C(A)$ while making the null space behavior explicit. Everything you observed here about rank and nullity becomes quantitatively precise in the SVD, making it the central tool in dimensionality reduction (PCA), pseudoinverse computation, and least-squares.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Rank-Nullity Theorem',
        body: 'For any matrix $A \\in \\mathbb{R}^{m \\times n}$:\n\n$$\\text{rank}(A) + \\text{nullity}(A) = n$$\n\n**rank** = dim$\\,C(A)$ = number of pivots in RREF of $A$.\n**nullity** = dim$\\,N(A)$ = $n$ − rank.\n\nFor $A$ square ($m = n$): $A$ is invertible iff nullity = 0 iff rank = $n$.',
      },
      {
        type: 'theorem',
        title: 'Consistency of Ax = b',
        body: 'The system $A\\mathbf{x} = \\mathbf{b}$ is **consistent** (has at least one solution) if and only if $\\mathbf{b} \\in C(A)$.\n\nIf consistent, the **general solution** is $\\mathbf{x} = \\mathbf{x}_p + \\mathbf{x}_h$ where:\n- $\\mathbf{x}_p$ is any particular solution\n- $\\mathbf{x}_h \\in N(A)$ is an arbitrary element of the null space\n\nThis is why the null space dimension equals the number of "free parameters" in the solution.',
      },
      {
        type: 'insight',
        title: 'Finding the Column Space Basis — Use Original Columns',
        body: 'Trap: do NOT use the pivot columns from the RREF matrix as the column space basis. Row operations change columns but preserve pivot locations. The correct basis is formed by the **pivot columns of the ORIGINAL matrix** $A$ (before any row operations).\n\nThe row space basis CAN be read from the RREF — it uses the nonzero rows of RREF directly.',
      },
    ],
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: "la2-004-ex1",
      title: "Analyzing a Squished Matrix",
      problem: "Find the basis for the Column Space and the Null Space of $A = \\begin{bmatrix} 1 & 2 \\\\ 3 & 6 \\end{bmatrix}$.",
      steps: [
        {
          expression: "\\begin{bmatrix} 1 & 2 \\\\ 3 & 6 \\end{bmatrix} \\xrightarrow{R_2 - 3R_1} \\begin{bmatrix} 1 & 2 \\\\ 0 & 0 \\end{bmatrix}",
          annotation: "Row reduce the matrix to easily see the pivots.",
          strategyTitle: "Row Reduction",
          checkpoint: "Which column has a pivot (a leading 1)?",
          hints: ["Only the first column has a pivot. The second column is a free variable."],
        },
        {
          expression: "C(A) = \\text{Span} \\left\\{ \\begin{bmatrix} 1 \\\\ 3 \\end{bmatrix} \\right\\}",
          annotation: "The first column is the pivot column. Thus, the FIRST ORIGINAL column forms the basis for the Column Space.",
          strategyTitle: "Extract Column Space",
          checkpoint: "What is the rank of this matrix?",
          hints: ["Since there is 1 basis vector, the Rank is 1. Space was squished to a 1D line."],
        },
        {
          expression: "1x_1 + 2x_2 = 0 \\implies x_1 = -2x_2",
          annotation: "To find the Null Space, convert the reduced matrix into an equation $A\\vec{x} = 0$.",
          strategyTitle: "Solve for Null Space",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "\\vec{x} = x_2 \\begin{bmatrix} -2 \\\\ 1 \\end{bmatrix} \\implies N(A) = \\text{Span} \\left\\{ \\begin{bmatrix} -2 \\\\ 1 \\end{bmatrix} \\right\\}",
          annotation: "Write the solution as a vector. Any multiple of this vector gets crushed to 0.",
          strategyTitle: "Extract Null Space",
          checkpoint: "",
          hints: [],
        }
      ],
      conclusion: "The Rank is 1, and the Nullity is 1. (1 + 1 = 2 original dimensions). The Column space is the line spanned by [1, 3], and the Null space is the perpendicular line spanned by [-2, 1] that gets crushed."
    },
    {
      id: "la2-004-ex2",
      title: "Null Space of a 3×4 Matrix — Two Free Variables",
      problem: "Find a basis for the null space of $A = \\begin{bmatrix} 1 & 2 & 0 & 3 \\\\ 2 & 4 & 1 & 5 \\\\ 0 & 0 & 1 & -1 \\end{bmatrix}$. State the rank and nullity.",
      steps: [
        {
          expression: "\\begin{bmatrix}1&2&0&3\\\\2&4&1&5\\\\0&0&1&{-1}\\end{bmatrix} \\xrightarrow{R_2-2R_1} \\begin{bmatrix}1&2&0&3\\\\0&0&1&{-1}\\\\0&0&1&{-1}\\end{bmatrix} \\xrightarrow{R_3-R_2} \\begin{bmatrix}1&2&0&3\\\\0&0&1&{-1}\\\\0&0&0&0\\end{bmatrix}",
          annotation: "Row-reduce to RREF. Pivots appear in columns 1 and 3. Columns 2 and 4 have no pivots — they are the free variable columns. Therefore rank = 2, nullity = 4 − 2 = 2.",
          strategyTitle: "Row-reduce to find pivot and free columns",
          checkpoint: "How many pivot columns? How many free variables?",
          hints: ["Pivots in columns 1 and 3. Free variables: $x_2$ and $x_4$. Rank-Nullity: 2 + 2 = 4 ✓"],
        },
        {
          expression: "x_1 + 2x_2 + 3x_4 = 0 \\implies x_1 = -2x_2 - 3x_4 \\qquad x_3 - x_4 = 0 \\implies x_3 = x_4",
          annotation: "Read equations from the RREF rows: row 1 gives $x_1 = -2x_2 - 3x_4$, row 2 gives $x_3 = x_4$. Express each pivot variable in terms of the free variables.",
          strategyTitle: "Express pivot variables in terms of free variables",
          hints: ["Each RREF row with a pivot variable gives you one equation. Isolate the pivot variable on the left."],
        },
        {
          expression: "\\mathbf{v}_1 = \\begin{bmatrix}-2\\\\1\\\\0\\\\0\\end{bmatrix} \\;(x_2=1, x_4=0), \\qquad \\mathbf{v}_2 = \\begin{bmatrix}-3\\\\0\\\\1\\\\1\\end{bmatrix} \\;(x_2=0, x_4=1)",
          annotation: "Set each free variable to 1 in turn while holding others at 0. For $x_2=1, x_4=0$: $x_1=-2, x_3=0$ → $\\mathbf{v}_1$. For $x_2=0, x_4=1$: $x_1=-3, x_3=1$ → $\\mathbf{v}_2$. One basis vector per free variable.",
          strategyTitle: "Build one basis vector per free variable",
          hints: ["Each free variable 'turns on' one dimension of the null space. Set it to 1, set all other free variables to 0, back-substitute for the pivot variables."],
        },
        {
          expression: "N(A) = \\text{Span}\\left\\{\\begin{bmatrix}-2\\\\1\\\\0\\\\0\\end{bmatrix},\\begin{bmatrix}-3\\\\0\\\\1\\\\1\\end{bmatrix}\\right\\}",
          annotation: "The null space is a 2D subspace of $\\mathbb{R}^4$. Verify: rank 2 + nullity 2 = 4 = number of columns ✓. Check: $A\\mathbf{v}_1 = \\mathbf{0}$ and $A\\mathbf{v}_2 = \\mathbf{0}$.",
          strategyTitle: "Assemble and verify",
        }
      ],
      conclusion: "rank = 2, nullity = 2, confirming rank + nullity = 4 = number of columns. Each free variable column contributes exactly one basis vector to the null space, built by the back-substitution method."
    },
    {
      id: "la2-004-ex3",
      title: "Is Ax = b Consistent? Testing b ∈ C(A)",
      problem: "For $A = \\begin{bmatrix} 1 & 2 \\\\ 3 & 6 \\end{bmatrix}$ (from Example 1), determine whether (a) $\\mathbf{b}_1 = \\begin{bmatrix}2\\\\6\\end{bmatrix}$ and (b) $\\mathbf{b}_2 = \\begin{bmatrix}1\\\\2\\end{bmatrix}$ are in the column space.",
      steps: [
        {
          expression: "C(A) = \\text{Span}\\left\\{\\begin{bmatrix}1\\\\3\\end{bmatrix}\\right\\} \\quad (\\text{only vectors of the form } c\\begin{bmatrix}1\\\\3\\end{bmatrix} \\text{ are reachable})",
          annotation: "From Example 1: $A$ has rank 1. The entire column space is the line through the origin in direction $[1,3]^T$. Any vector not on this line is unreachable.",
          strategyTitle: "Recall the column space from Example 1",
        },
        {
          expression: "(a)\\; \\mathbf{b}_1 = \\begin{bmatrix}2\\\\6\\end{bmatrix} = 2\\begin{bmatrix}1\\\\3\\end{bmatrix} \\in C(A) \\implies \\textbf{CONSISTENT}",
          annotation: "$\\mathbf{b}_1 = 2 \\cdot [1,3]^T$ — it lies exactly on the column space line. A particular solution: $\\mathbf{x}_p = [2,0]^T$ (check: $A[2,0]^T = 2[1,3]^T = [2,6]^T$ ✓). The general solution is $\\mathbf{x} = [2,0]^T + t[-2,1]^T$ (adding any null space vector).",
          strategyTitle: "Check b₁: is it a scalar multiple of [1,3]ᵀ?",
        },
        {
          expression: "(b)\\; \\mathbf{b}_2 = \\begin{bmatrix}1\\\\2\\end{bmatrix}: \\text{ need } c=1 \\text{ (from row 1) but } 3c = 3 \\neq 2 \\text{ (row 2)} \\implies \\mathbf{b}_2 \\notin C(A) \\implies \\textbf{INCONSISTENT}",
          annotation: "For $[1,2]^T$ to equal $c[1,3]^T$: component 1 forces $c=1$, but then component 2 requires $3(1)=3 \\neq 2$. Contradiction. Equivalently: row-reduce $[A|\\mathbf{b}_2]$ to get the row $[0,0|{-1}]$ — a contradiction meaning no solution exists.",
          strategyTitle: "Check b₁: contradiction in the components",
          hints: ["The augmented matrix test: row-reduce $[A|\\mathbf{b}]$. If any row looks like $[0,0,\\ldots,0|c]$ with $c \\neq 0$, the system is inconsistent."],
        }
      ],
      conclusion: "b₁ = [2,6]ᵀ is reachable (2× the column space basis). b₁ = [1,2]ᵀ lies off the column space line — inconsistent. The key rule: Ax = b is solvable if and only if b ∈ C(A)."
    }
  ],

  // ── Walkthroughs ───────────────────────────────────────────────────────────
  walkthroughs: [
    {
      id: 'wt-la2-004-null-space',
      title: 'The Null Space — What Gets Crushed to Zero?',
      prereqs: ['RREF', 'Free variables', 'Homogeneous systems'],
      problem: 'Find a basis for the null space of $A = \\begin{bmatrix}1 & 2 & 3\\\\2 & 4 & 7\\end{bmatrix}$.',
      steps: [
        {
          label: 'Set up the homogeneous system $A\\mathbf{x} = \\mathbf{0}$',
          strategy: 'The null space is the set of all $\\mathbf{x}$ that $A$ maps to the zero vector — find them by row-reducing the augmented matrix $[A | \\mathbf{0}]$.',
          explanation: 'Any vector in the null space gets "killed" — sent to the zero vector. Finding the null space tells us what information $A$ destroys. Write the augmented matrix with a column of zeros.',
          math: '\\left[\\begin{array}{ccc|c}1&2&3&0\\\\2&4&7&0\\end{array}\\right]',
        },
        {
          label: 'Row reduce: eliminate the first entry of row 2',
          strategy: '$R_2 \\leftarrow R_2 - 2R_1$ creates a zero below the first pivot.',
          explanation: '$R_2$: $(2-2, 4-4, 7-6, 0-0) = (0, 0, 1, 0)$.',
          math: '\\left[\\begin{array}{ccc|c}1&2&3&0\\\\0&0&1&0\\end{array}\\right]',
        },
        {
          label: 'Back-substitute: clear column 3 in row 1',
          strategy: '$R_1 \\leftarrow R_1 - 3R_2$ zeros out the entry above the second pivot.',
          explanation: '$R_1$: $(1-0, 2-0, 3-3, 0) = (1,2,0,0)$. Now RREF: pivots in columns 1 and 3.',
          math: '\\left[\\begin{array}{ccc|c}1&2&0&0\\\\0&0&1&0\\end{array}\\right]',
        },
        {
          label: 'Identify the free variable',
          strategy: 'Columns with no pivot are free — they can be anything.',
          explanation: 'Column 2 has no pivot: $x_2 = t$ is free. From row 1: $x_1 + 2t = 0 \\Rightarrow x_1 = -2t$. From row 2: $x_3 = 0$.',
          math: 'x_1 = -2t,\\quad x_2 = t,\\quad x_3 = 0',
        },
        {
          label: 'Write the null space as a span',
          strategy: 'Factor out the free parameter to find the null space basis vector.',
          explanation: 'Every null space vector has the form $t[-2, 1, 0]^\\top$. The null space is a line through the origin in $\\mathbb{R}^3$. The matrix has rank 2, so the null space has dimension 1 (rank-nullity: $2 + 1 = 3$).',
          math: 'N(A) = \\mathrm{span}\\left\\{\\begin{bmatrix}-2\\\\1\\\\0\\end{bmatrix}\\right\\}',
        },
      ],
    },
    {
      id: 'wt-la2-004-column-space-membership',
      title: 'Is b in the Column Space? — Testing Consistency',
      prereqs: ['Column space definition', 'Augmented matrix', 'Row reduction'],
      problem: 'Is $\\mathbf{b} = \\begin{bmatrix}3\\\\7\\end{bmatrix}$ in the column space of $A = \\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}$?',
      steps: [
        {
          label: 'Rephrase as: is $A\\mathbf{x} = \\mathbf{b}$ consistent?',
          strategy: '$\\mathbf{b}$ is in $\\text{Col}(A)$ if and only if the system $A\\mathbf{x} = \\mathbf{b}$ has at least one solution.',
          explanation: 'The column space is the set of all possible outputs of $A$. Asking "is $\\mathbf{b}$ in $\\text{Col}(A)$?" is the same as asking "can $A$ produce $\\mathbf{b}$?" — i.e., does $A\\mathbf{x}=\\mathbf{b}$ have a solution?',
          math: '\\mathbf{b} \\in \\text{Col}(A) \\iff A\\mathbf{x}=\\mathbf{b} \\text{ is consistent}',
        },
        {
          label: 'Row reduce the augmented matrix $[A | \\mathbf{b}]$',
          strategy: 'If no contradiction row appears, the system is consistent.',
          explanation: '$R_2 \\leftarrow R_2 - 3R_1$: $(3-3, 4-6, 7-9) = (0,-2,-2)$.',
          math: '\\left[\\begin{array}{cc|c}1&2&3\\\\0&-2&-2\\end{array}\\right]',
        },
        {
          label: 'Back-substitute to find the solution',
          strategy: 'No contradiction row means $\\mathbf{b}$ IS in the column space — find the coefficients.',
          explanation: 'From row 2: $-2x_2 = -2 \\Rightarrow x_2 = 1$. From row 1: $x_1 + 2 = 3 \\Rightarrow x_1 = 1$. The solution is $\\mathbf{x} = [1,1]^\\top$.',
          math: 'x_1=1,\\; x_2=1 \\implies \\mathbf{b} = 1\\cdot\\text{col}_1(A) + 1\\cdot\\text{col}_2(A)',
        },
        {
          label: 'Verify: the linear combination should reconstruct $\\mathbf{b}$',
          strategy: 'Substitute back: $1\\cdot [1,3]^\\top + 1\\cdot [2,4]^\\top$ should equal $[3,7]^\\top$.',
          explanation: '$[1,3]^\\top + [2,4]^\\top = [3,7]^\\top = \\mathbf{b}$ ✓. The vector $\\mathbf{b}$ is a "sum of equal parts" of the two columns.',
          math: '\\begin{bmatrix}1\\\\3\\end{bmatrix}+\\begin{bmatrix}2\\\\4\\end{bmatrix}=\\begin{bmatrix}3\\\\7\\end{bmatrix} \\checkmark',
        },
      ],
    },
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: "la2-004-ch1",
      difficulty: "easy",
      problem: "What is the Rank and Nullity of the $3\\times3$ Identity Matrix $I = \\begin{bmatrix} 1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1 \\end{bmatrix}$?",
      hint: "The identity matrix does not squish space at all. It leaves all 3 dimensions perfectly intact.",
      walkthrough: [
        {
          expression: "\\text{Rank}(I) = 3",
          annotation: "Since 3D space remains 3D space, the column space is all of R^3."
        },
        {
          expression: "\\text{Nullity}(I) = 0",
          annotation: "No vectors are crushed to the origin, except the origin itself."
        }
      ],
      answer: "Rank = 3, Nullity = 0"
    },
    {
      id: "la2-004-ch2",
      difficulty: "medium",
      problem: "A $5 \\times 7$ matrix has a Rank of 4. What is the dimension of its Null Space?",
      hint: "Use the Rank-Nullity theorem: Rank + Nullity = Number of Columns.",
      walkthrough: [
        {
          expression: "\\text{Rank} + \\text{Nullity} = n",
          annotation: "Set up the theorem. n is the number of completely original dimension inputs (the columns)."
        },
        {
          expression: "4 + \\text{Nullity} = 7",
          annotation: "Substitute the knowns."
        },
        {
          expression: "\\text{Nullity} = 3",
          annotation: "Solve. A 3-dimensional subspace is crushed into the origin."
        }
      ],
      answer: "3"
    },
    {
      id: "la2-004-ch3",
      difficulty: "hard",
      problem: "For $A = \\begin{bmatrix}2&4&2\\\\1&2&3\\\\3&6&5\\end{bmatrix}$: (a) find a basis for $N(A)$ by hand, (b) state rank and nullity, (c) verify rank + nullity = n, (d) determine whether $\\mathbf{b} = [4,3,7]^T$ is in the column space (and if so, write the general solution).",
      hint: "Row-reduce $A$ to RREF. Column 2 will be free (watch: column 2 = 2 × column 1 throughout). For part (d), row-reduce $[A|\\mathbf{b}]$ — if no contradiction row appears, $\\mathbf{b} \\in C(A)$.",
      walkthrough: [
        {
          expression: "\\text{RREF}(A) = \\begin{bmatrix}1&2&0\\\\0&0&1\\\\0&0&0\\end{bmatrix}",
          annotation: "Divide $R_1$ by 2, then $R_2 \\leftarrow R_2 - R_1/2$, $R_3 \\leftarrow R_3 - 3R_1/2$, then eliminate $x_3$ from $R_1$. Pivots in columns 1 and 3. Column 2 is free. rank = 2, nullity = 3 - 2 = 1."
        },
        {
          expression: "x_1 = -2x_2, \\; x_3 = 0 \\implies N(A) = \\text{Span}\\left\\{\\begin{bmatrix}-2\\\\1\\\\0\\end{bmatrix}\\right\\}",
          annotation: "Set free variable $x_2 = 1$: from RREF row 1, $x_1 + 2(1) = 0 \\implies x_1 = -2$; from row 2, $x_3 = 0$. One basis vector: $[-2,1,0]^T$."
        },
        {
          expression: "\\text{rank}(2) + \\text{nullity}(1) = 3 = n \\checkmark",
          annotation: "Rank-Nullity theorem confirmed."
        },
        {
          expression: "[A|\\mathbf{b}] \\to \\begin{bmatrix}1&2&0&\\tfrac{3}{2}\\\\0&0&1&\\tfrac{1}{2}\\\\0&0&0&0\\end{bmatrix} \\implies \\mathbf{b} \\in C(A)",
          annotation: "No contradiction row $[0,0,0|\\neq 0]$. $\\mathbf{b}$ is reachable. Particular solution: $x_p = [3/2, 0, 1/2]^T$. General solution: $\\mathbf{x} = [3/2, 0, 1/2]^T + t[-2,1,0]^T$."
        }
      ],
      answer: "$N(A) = \\text{Span}\\{[-2,1,0]^T\\}$; rank 2, nullity 1; $2+1=3=n$ ✓; $\\mathbf{b} \\in C(A)$, general solution $\\mathbf{x} = [3/2,\\,0,\\,1/2]^T + t[-2,1,0]^T$"
    }
  ],

  // ── Semantic Layer ───────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: 'C(A)', meaning: 'Column space — the set of all vectors Ax can produce; span of the columns of A; lives in the output space ℝᵐ' },
      { symbol: 'N(A)', meaning: 'Null space (kernel) — all x with Ax = 0; these inputs are annihilated; lives in the input space ℝⁿ' },
      { symbol: '\\text{rank}(A)', meaning: 'Rank — number of pivot columns in RREF; equals dim(C(A)); measures how much information the transformation preserves' },
      { symbol: '\\text{nullity}(A)', meaning: 'Nullity — dim(N(A)); equals n minus rank; counts how many independent directions get crushed to zero' },
      { symbol: '\\text{rank}(A) + \\text{nullity}(A) = n', meaning: 'Rank-Nullity theorem — dimensions always balance; pivot columns + free columns = total columns' },
    ],
    rulesOfThumb: [
      'If a matrix is invertible, rank = n and nullity = 0 — nothing gets crushed, every output is reachable.',
      'If det = 0, nullity ≥ 1 — at least one direction is permanently destroyed by the transformation.',
      'rank + nullity = n (number of COLUMNS, not rows) — always.',
      'Use original (pre-RREF) pivot columns for the column space basis — row ops change columns but preserve pivot positions.',
      'Ax = b is consistent iff b is in C(A); each null space vector gives a free degree of freedom in the solution.',
    ],
  },

  // ── Spiral Learning ──────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la2-003',
        label: 'Zero Determinant',
        note: 'If the concepts here feel murky, review Lesson 3. Matrices with a zero determinant are the ONLY square matrices that contain a non-empty Null Space.'
      }
    ],
    futureLinks: [
      {
        lessonId: 'la4-002',
        label: 'Singular Value Decomposition (SVD)',
        note: 'The four fundamental subspaces (including Null and Column spaces) are the core foundation required to understand SVD, the single most important algorithm in Machine Learning.'
      }
    ]
  },

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'la2-004-assess-1',
        type: 'choice',
        text: 'A $4 \\times 4$ matrix has rank 2. What is the dimension of its null space?',
        options: ['2', '1', '4', '0'],
        answer: '2',
        hints: ['Rank-Nullity: rank + nullity = n (columns). $2 + \\text{nullity} = 4 \\Rightarrow \\text{nullity} = 2$.'],
      },
      {
        id: 'la2-004-assess-2',
        type: 'choice',
        text: 'For $A = \\begin{bmatrix}1&2\\\\2&4\\end{bmatrix}$, which vector is in the null space?',
        options: [
          '$[2, -1]^T$ — because $A[2,-1]^T = [1\\cdot2+2\\cdot(-1),\\;2\\cdot2+4\\cdot(-1)]^T = [0,0]^T$',
          '$[1, 2]^T$ — the first column of $A$',
          '$[1, 0]^T$ — the standard basis vector',
          '$[2, 4]^T$ — the second column of $A$',
        ],
        answer: '$[2, -1]^T$ — because $A[2,-1]^T = [1\\cdot2+2\\cdot(-1),\\;2\\cdot2+4\\cdot(-1)]^T = [0,0]^T$',
        hints: ['Multiply $A$ by each candidate and check which gives $[0,0]^T$.', 'Row 2 = 2×row 1, so only rank 1. The null space vector satisfies $x_1 + 2x_2 = 0$, giving $x_1 = -2x_2$.'],
      },
      {
        id: 'la2-004-assess-3',
        type: 'choice',
        text: 'The system $A\\mathbf{x} = \\mathbf{b}$ has no solution. What does this tell you about $\\mathbf{b}$?',
        options: [
          '$\\mathbf{b}$ is not in the column space of $A$ — no input maps to that output',
          '$\\mathbf{b}$ is in the null space of $A$',
          'The rank of $A$ must be zero',
          '$A$ must be non-square',
        ],
        answer: '$\\mathbf{b}$ is not in the column space of $A$ — no input maps to that output',
        hints: ['$A\\mathbf{x} = \\mathbf{b}$ is consistent if and only if $\\mathbf{b} \\in C(A)$. No solution means $\\mathbf{b}$ lies outside the column space.'],
      },
      {
        id: 'la2-004-assess-4',
        type: 'choice',
        text: 'A $3 \\times 5$ matrix has nullity 3. What is its rank?',
        options: ['2', '3', '5', '1'],
        answer: '2',
        hints: ['Rank-Nullity: rank + nullity = n (columns). $n = 5$, nullity = 3, so rank = $5 - 3 = 2$.'],
      },
    ]
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    "Column Space: The survivor. What is left of the grid after the squish.",
    "Rank: How many dimensions the survivor has.",
    "Null Space: The graveyard. The vectors that were mercilessly crushed into the origin.",
    "Rank + Nullity = The original number of columns."
  ],

  // ── Checkpoints ──────────────────────────────────────────────────
  checkpoints: [
    { id: 'cp-la2-004-1', label: 'Read intuition — understand column space vs null space', type: 'read' },
    { id: 'cp-la2-004-2', label: 'Read math — trace the null space algorithm for a 2×2 matrix', type: 'read' },
    { id: 'cp-la2-004-3', label: 'Read rigor — study Rank-Nullity proof and Fundamental Theorem', type: 'read' },
    { id: 'cp-la2-004-4', label: 'Run OpenMAT cell 1 — verify A * null(A) ≈ 0', type: 'lab' },
    { id: 'cp-la2-004-5', label: 'Run OpenMAT cell 2 — verify rank + nullity = n for a 3×4 matrix', type: 'lab' },
    { id: 'cp-la2-004-6', label: 'Complete example 1: find column space and null space of a 2×2 singular matrix', type: 'example' },
    { id: 'cp-la2-004-7', label: 'Complete example 2: find the 2D null space of a 3×4 matrix', type: 'example' },
    { id: 'cp-la2-004-8', label: 'Attempt challenge 2: apply rank-nullity to a 5×7 matrix', type: 'challenge' },
    { id: 'cp-la2-004-9', label: 'Attempt challenge 3: find N(A) by hand for a 3×3 matrix', type: 'challenge' },
  ],

  // ── Final Quiz ─────────────────────────────────────────────────
  quiz: [
    {
      id: 'la2-004-quiz-1',
      type: 'choice',
      text: "If a 3x3 matrix has a Column Space of dimension 2 (it flattens space to a plane), what is the dimension of its Null Space?",
      options: [
        "0",
        "1",
        "2",
        "3"
      ],
      answer: "1",
      hints: ["The Rank-Nullity theorem tells us Rank + Nullity = Columns. 2 + x = 3."],
      reviewSection: 'Intuition tab — Rank-Nullity Theorem'
    },
    {
      id: 'la2-004-quiz-2',
      type: 'choice',
      text: "Geometrically, what does it mean to be a vector in the Null Space of a transformation matrix A?",
      options: [
        "The vector is stretched to infinity.",
        "The vector is flipped perfectly backwards.",
        "The vector gets entirely crushed to the origin (0,0) during the transformation.",
        "The vector is pushed into an imaginary dimension."
      ],
      answer: "The vector gets entirely crushed to the origin (0,0) during the transformation.",
      hints: ["The definition of the Null Space is that A(v) = 0."],
      reviewSection: 'Intuition tab — The Graveyard'
    },
    {
      id: 'la2-004-quiz-3',
      type: 'choice',
      text: "You row-reduce $A$ and find that columns 1 and 3 are pivot columns (out of 4 total columns). To form a basis for the column space, which columns do you use?",
      options: [
        "Columns 1 and 3 of the ORIGINAL (pre-reduction) matrix $A$.",
        "Columns 1 and 3 of the RREF of $A$.",
        "All 4 columns of $A$.",
        "The nonzero rows of the RREF of $A$."
      ],
      answer: "Columns 1 and 3 of the ORIGINAL (pre-reduction) matrix $A$.",
      hints: ["Row operations change column vectors but preserve which columns are pivots. Always use the pivot columns from the ORIGINAL matrix for the column space basis."],
      reviewSection: 'Math tab — Column Space Trick callout'
    },
    {
      id: 'la2-004-quiz-4',
      type: 'choice',
      text: "The system $A\\mathbf{x} = \\mathbf{b}$ has no solution. What does this tell you about $\\mathbf{b}$?",
      options: [
        "$\\mathbf{b}$ is not in the column space of $A$ — the transformation cannot reach that output.",
        "$\\mathbf{b}$ is in the null space of $A$.",
        "$A$ must be square.",
        "The rank of $A$ is zero."
      ],
      answer: "$\\mathbf{b}$ is not in the column space of $A$ — the transformation cannot reach that output.",
      hints: ["$A\\mathbf{x}=\\mathbf{b}$ is consistent if and only if $\\mathbf{b} \\in C(A)$. No solution means $\\mathbf{b}$ lies outside the column space."],
      reviewSection: 'Rigor tab — Consistency theorem'
    },
    {
      id: 'la2-004-quiz-5',
      type: 'choice',
      text: "A $6 \\times 3$ matrix $A$ has rank 2. What is the dimension of its null space?",
      options: [
        "1 — because nullity = n − rank = 3 − 2 = 1.",
        "4 — because nullity = m − rank = 6 − 2 = 4.",
        "2 — same as the rank.",
        "0 — the null space is always trivial for rectangular matrices."
      ],
      answer: "1 — because nullity = n − rank = 3 − 2 = 1.",
      hints: ["Rank-Nullity theorem: rank + nullity = n (number of COLUMNS, not rows). $n = 3$, rank $= 2$, so nullity $= 1$."],
      reviewSection: 'Intuition tab — Rank-Nullity theorem callout'
    },
    {
      id: 'la2-004-quiz-6',
      type: 'choice',
      text: "If $A\\mathbf{x} = \\mathbf{b}$ has infinitely many solutions, what must be true about $A$?",
      options: [
        "The null space of $A$ is non-trivial (nullity ≥ 1): adding any null space vector to one particular solution gives another valid solution.",
        "The column space of $A$ is all of $\\mathbb{R}^m$.",
        "The rank of $A$ equals $m$ (the number of rows).",
        "The matrix $A$ must be square."
      ],
      answer: "The null space of $A$ is non-trivial (nullity ≥ 1): adding any null space vector to one particular solution gives another valid solution.",
      hints: ["If $\\mathbf{x}_p$ solves $A\\mathbf{x}=\\mathbf{b}$ and $\\mathbf{v} \\in N(A)$, then $\\mathbf{x}_p + \\mathbf{v}$ is also a solution. Infinitely many solutions ↔ nullity ≥ 1."],
      reviewSection: 'Rigor tab — General solution theorem',
    },
    {
      id: 'la2-004-quiz-7',
      type: 'choice',
      text: 'For a $5 \\times 4$ matrix with rank 3, what are the dimensions of the column space and null space?',
      options: [
        'Column space: 3 (in $\\mathbb{R}^5$), Null space: 1 (in $\\mathbb{R}^4$)',
        'Column space: 3 (in $\\mathbb{R}^4$), Null space: 2 (in $\\mathbb{R}^5$)',
        'Column space: 4, Null space: 1',
        'Column space: 5, Null space: 0',
      ],
      answer: 'Column space: 3 (in $\\mathbb{R}^5$), Null space: 1 (in $\\mathbb{R}^4$)',
      hints: ['Column space lives in the output space: $\\mathbb{R}^5$ (5 rows), dimension = rank = 3. Null space lives in the input space: $\\mathbb{R}^4$ (4 columns), nullity = 4 − 3 = 1.'],
      reviewSection: 'Intuition tab — Rank-Nullity theorem',
    },
    {
      id: 'la2-004-quiz-8',
      type: 'choice',
      text: 'Which of the following is always true about the null space $N(A)$?',
      options: [
        'It is a subspace — it always contains the zero vector and is closed under addition and scaling',
        'It is always the zero subspace $\\{\\mathbf{0}\\}$',
        'It always has the same dimension as the column space',
        'It is non-empty only when $A$ is square',
      ],
      answer: 'It is a subspace — it always contains the zero vector and is closed under addition and scaling',
      hints: ['$A\\mathbf{0} = \\mathbf{0}$ so $\\mathbf{0} \\in N(A)$ always. If $A\\mathbf{u} = \\mathbf{0}$ and $A\\mathbf{v} = \\mathbf{0}$, then $A(\\mathbf{u}+\\mathbf{v}) = A\\mathbf{u}+A\\mathbf{v} = \\mathbf{0}$ and $A(c\\mathbf{u}) = cA\\mathbf{u} = \\mathbf{0}$. Closed under both operations.'],
      reviewSection: 'Rigor tab — Subspace verification',
    },
    {
      id: 'la2-004-quiz-9',
      type: 'choice',
      text: 'Matrix $A$ has columns $[1,0]^T$ and $[2,0]^T$. What is the column space of $A$?',
      options: [
        'The $x$-axis — both columns lie on the $x$-axis, so the column space is the 1D line $y = 0$',
        'All of $\\mathbb{R}^2$',
        'The $y$-axis',
        'Just the origin',
      ],
      answer: 'The $x$-axis — both columns lie on the $x$-axis, so the column space is the 1D line $y = 0$',
      hints: ['Column space = span of the columns. $[1,0]^T$ and $[2,0]^T$ are both horizontal — their span is just the $x$-axis. You can reach any $[t, 0]^T$ but no point with a nonzero $y$-coordinate.'],
      reviewSection: 'Intuition tab — column space definition',
    },
    {
      id: 'la2-004-quiz-10',
      type: 'choice',
      text: 'If $\\mathbf{x}_p$ is one particular solution to $A\\mathbf{x} = \\mathbf{b}$ and $\\mathbf{v}$ is in the null space of $A$, what can you say about $\\mathbf{x}_p + 2\\mathbf{v}$?',
      options: [
        'It is also a solution to $A\\mathbf{x} = \\mathbf{b}$',
        'It solves $A\\mathbf{x} = 2\\mathbf{b}$',
        'It is in the null space of $A$',
        'It is the unique solution only if $\\mathbf{v} = \\mathbf{0}$',
      ],
      answer: 'It is also a solution to $A\\mathbf{x} = \\mathbf{b}$',
      hints: ['$A(\\mathbf{x}_p + 2\\mathbf{v}) = A\\mathbf{x}_p + 2A\\mathbf{v} = \\mathbf{b} + 2\\mathbf{0} = \\mathbf{b}$. Adding any null space vector to a particular solution gives another solution.'],
      reviewSection: 'Rigor tab — General solution theorem',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'The null space and the column space are both subsets of the same space.',
      whyStudentsThinkIt: 'Both are "subspaces of the matrix" — students don\'t distinguish the input space from the output space.',
      correctionExample: 'For a $3 \\times 2$ matrix $A$: the null space lives in $\\mathbb{R}^2$ (input space — 2 columns), and the column space lives in $\\mathbb{R}^3$ (output space — 3 rows). They can have different dimensions and live in completely different spaces.',
      contrastCase: 'The null space asks: "Which inputs map to zero?" (input space). The column space asks: "Which outputs are reachable?" (output space). These are different questions about different spaces.',
    },
    {
      falseBelief: 'Choosing pivot columns from the RREF (not the original matrix) gives the column space basis.',
      whyStudentsThinkIt: 'After row reduction, the pivot columns of RREF look clean (all zeros except a single 1). Students use those instead of the original.',
      correctionExample: 'Let $A = \\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}$. After RREF: $\\begin{bmatrix}1&0\\\\0&1\\end{bmatrix}$. The RREF pivot columns are $[1,0]^T$ and $[0,1]^T$ — these span $\\mathbb{R}^2$ trivially, but they are NOT columns of $A$. The correct column space basis is $[1,3]^T$ and $[2,4]^T$ — the original pivot columns.',
      contrastCase: 'Null space vectors CAN be read from RREF (they are the free variable solutions to $R\\mathbf{x} = \\mathbf{0}$). Column space must use the ORIGINAL matrix\'s pivot columns.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A data scientist fits a linear model $A\\mathbf{x} = \\mathbf{b}$ to predict housing prices. She has 1000 data points (rows) but only 3 features (columns: square footage, bedrooms, bathrooms). She finds the RREF has rank 2. What does this tell her about her features?',
      competingTechniques: 'Inspect feature correlations visually vs. compute rank of the design matrix',
      whyThisTechniqueWins: 'Rank 2 means only 2 features are truly independent — one is a linear combination of the others (e.g., "bedrooms" may be proportional to "square footage" in this dataset). The null space has dimension 1, revealing the redundant direction. Removing the redundant feature avoids multicollinearity in regression.',
    },
    {
      situation: 'A graphics engineer applies a "depth collapse" matrix that squishes 3D coordinates to 2D screen pixels. A depth-recovery algorithm tries to invert this to reconstruct 3D positions. Why will this always fail, and what does null space theory say?',
      competingTechniques: 'Try to compute the inverse of the projection matrix vs. analyze null space dimension',
      whyThisTechniqueWins: 'The projection matrix has nullity ≥ 1 (the z-direction maps to zero). You cannot reconstruct which z-depth produced a given pixel — infinitely many 3D points project to the same 2D point. Null space theory says: no inverse exists; the entire z-axis is in the null space and is permanently unrecoverable from screen coordinates alone.',
    },
  ],

  debugging: [
    {
      commonError: 'Confusing "null space of $A$" with "null space of $A^T$" — picking the wrong space entirely.',
      symptom: 'Student finds vectors orthogonal to the rows of $A$ and calls them the null space.',
      whyItHappened: 'There are actually FOUR fundamental subspaces: $C(A)$, $N(A)$, $C(A^T)$, $N(A^T)$. Students conflate them.',
      repairStrategy: 'Keep the definitions sharp: $N(A)$ solves $A\\mathbf{x} = \\mathbf{0}$ — always in the INPUT space. $C(A)$ is spanned by the columns of $A$ — always in the OUTPUT space. When in doubt, check dimensions: $N(A)$ lives in $\\mathbb{R}^n$, $C(A)$ in $\\mathbb{R}^m$.',
    },
    {
      commonError: 'Forgetting that Rank-Nullity uses the number of COLUMNS, not rows.',
      symptom: 'For a $6 \\times 4$ matrix with rank 3, student says nullity = $6 - 3 = 3$ (using rows) instead of $4 - 3 = 1$ (correct, using columns).',
      whyItHappened: 'The rank can look like "how many rows survived," leading students to subtract rank from the number of rows.',
      repairStrategy: 'The theorem is rank$(A)$ + nullity$(A)$ = $n$ (number of COLUMNS). The null space lives in the INPUT space $\\mathbb{R}^n$ where $n$ is the number of columns. Repeat: COLUMNS, not rows.',
    },
  ],

  mastery: {
    targetLevel: 3,
    solveIndependently: 'Find a basis for the null space and column space of any matrix by computing RREF, identifying pivot and free columns, and reading off the free-variable solution vectors.',
    explainVerbally: 'Explain the Rank-Nullity theorem geometrically (each crushed input dimension corresponds to a null space dimension), and explain why $A\\mathbf{x} = \\mathbf{b}$ is consistent iff $\\mathbf{b}$ is in the column space.',
    detectIncorrectApplication: 'Identify when a student uses RREF pivot columns instead of original matrix pivot columns for the column space basis, or applies Rank-Nullity with the number of rows instead of columns.',
    transferToUnfamiliar: 'Given a linear regression design matrix, interpret its rank and null space in terms of feature independence and model identifiability.',
  },
};
