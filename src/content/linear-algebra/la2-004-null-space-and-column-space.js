export default {
  // â”€â”€ Identity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  id: 'la2-004',
  slug: 'null-space-and-column-space',
  chapter: 'la2',
  order: 4,
  title: 'Null Space and Column Space',
  subtitle: 'When a matrix destroys space, where does the debris go?',
  tags: ['null space', 'column space', 'kernel', 'image', 'rank', 'rank-nullity theorem'],
  aliases: 'kernel and image span of matrix dimension of matrix crushed vectors singular matrices',

  // â”€â”€ Pedagogical Meta â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  timeToComplete: 20,
  coreConcept: 'The "Column Space" represents all vectors a transformation can successfully reach. The "Null Space" represents all vectors that were crushed into the absolute origin during that transformation. Together, they conserve the total dimensionality of the space.',
  prerequisites: ['la2-003'],
  nextLesson: 'eigenvectors-and-eigenvalues',

  // â”€â”€ Hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  hook: {
    question: "If you shine a flashlight entirely on a 3D object, it casts a 2D shadow. What happened mathematically to the vectors pointing straight toward the flashlight?",
    realWorldContext: "When an MRI machine takes scans of your brain, it captures a series of 2D cross-sections. In mathematical terms, the machine is applying a transformation that flattens 3D space into a 2D plane (the image you look at on the screen). That 2D screen is the exactly the 'Column Space' of the scanner's transformation. But what about the depth? Any vector pointing perfectly straight into the screen gets squashed flat into a single point: the origin. That collection of perfectly squashed vectors forms the 'Null Space'. By understanding exactly what the Null Space is, software engineers can write algorithms that computationally rebuild 3D 360-degree models from those flat MRI slices.",
    previewVisualizationId: 'LALesson07_NullSpace',
  },

  // â”€â”€ Intuition â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  intuition: {
    prose: [
      'Take $A = \\begin{bmatrix}1&2\\\\2&4\\end{bmatrix}$. Apply $A$ to $[2,-1]^T$: result is $[1\\cdot2+2\\cdot(-1),\\ 2\\cdot2+4\\cdot(-1)]^T = [0,0]^T$. The vector $[2,-1]^T$ gets crushed to zero. So does every scalar multiple: $[-4,2]^T \\to \\mathbf{0}$, $[6,-3]^T \\to \\mathbf{0}$. This entire line is the **null space**. Now ask: what outputs CAN $A$ produce? $A\\mathbf{x} = x_1[1,2]^T + x_2[2,4]^T = (x_1 + 2x_2)[1,2]^T$ â€” always a multiple of $[1,2]^T$. Every output lives on that single line: the **column space**. One direction is crushed (null space); one direction survives (column space). Rank-Nullity: $1 + 1 = 2$ columns.',
      '**The column space â€” the range of the transformation.** When you apply matrix $A$ to every possible input vector $\\mathbf{x} \\in \\mathbb{R}^n$, the set of all resulting output vectors $A\\mathbf{x}$ is called the **column space** of $A$ (written $\\text{col}(A)$ or $C(A)$, or in abstract algebra, the **image** $\\text{im}(A)$). Geometrically, it is the subspace spanned by the columns of $A$. If $A$ maps $\\mathbb{R}^3$ to a 2D plane, that plane is the column space. Any point *not* on that plane is unreachable â€” no input exists that lands there.',
      '**The null space â€” the graveyard.** The **null space** of $A$ (written $N(A)$, $\\ker(A)$, or the **kernel**) is the set of all vectors that $A$ sends to the zero vector: $N(A) = \\{\\mathbf{x} : A\\mathbf{x} = \\mathbf{0}\\}$. If $A$ squishes a 3D space to a 2D plane, one entire direction (a line through the origin) collapses to the origin. Every vector along that line maps to $\\mathbf{0}$. That line is the null space.',
      '**The Rank-Nullity theorem.** Dimensions balance perfectly:\n\n$$\\underbrace{\\text{rank}(A)}_{\\text{dim of column space}} + \\underbrace{\\text{nullity}(A)}_{\\text{dim of null space}} = \\underbrace{n}_{\\text{number of columns}}$$\n\nA $3 \\times 3$ matrix with rank 2 must have a 1D null space. $2 + 1 = 3$. Dimensions are conserved â€” they just get rerouted from "useful output" into "crushed directions."',
      '**The MRI connection.** An MRI scanner captures 2D cross-sectional slices (the column space of the scan operator). Depth â€” the coordinate pointing into the scanner â€” is not recorded per-slice: it is in the null space. Reconstruction algorithms like filtered back-projection implicitly compute the pre-image of each slice, combining many slices to recover the 3D structure. They are inverting the operator over its column space while knowing that the null space is informationless.',
      '**CNC probe calibration.** A CNC machine probes the workpiece at reference points to establish its coordinate frame. If you probe only collinear points (all on one line), the probe data matrix has rank 1 â€” its column space is 1D. You cannot recover the 2D plane of the part surface. The null space of the measurement matrix has dimension 1, meaning one direction of the surface is completely undetermined. Quality standards require probe points spread in 2D (non-collinear) so that rank = 2 and the full surface plane is uniquely determined.',
      '**Predict before reading on.** Matrix $A = \\begin{bmatrix}1&0&2\\\\0&1&-1\\\\0&0&0\\end{bmatrix}$. Without computing: what is the rank? What is the nullity? What is the dimension of the column space? Write your answers, then check in Example 2.',
      '**Where this is heading:** We understand the four fundamental subspaces of any matrix. The next chapter asks: which special vectors completely resist rotation â€” they only get scaled by a factor? Those are the eigenvectors, and they are built from the null space idea applied to shifted matrices.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 4 of 12 â€” Matrices & Transformations',
        body: '**Previous:** Determinants and inverses â€” when is a transformation reversible?\n**This lesson:** Column space (what the transformation can reach) and null space (what it annihilates).\n**Next (LA3):** Eigenvectors â€” vectors immune to rotation, only scaled.',
      },
      {
        type: 'insight',
        title: 'Rank-Nullity Theorem',
        body: 'For an $m \\times n$ matrix $A$:\n\n$$\\text{rank}(A) + \\text{nullity}(A) = n$$\n\n**rank** = dim of column space = number of pivot columns.\n**nullity** = dim of null space = number of free variables = number of non-pivot columns.\n\nDimensions are conserved: they move between column space and null space, never disappear.',
      },
      {
        type: 'definition',
        title: 'Four Fundamental Subspaces',
        body: 'Every $m \\times n$ matrix $A$ has four fundamental subspaces:\n\n1. **Column space** $C(A) \\subseteq \\mathbb{R}^m$ â€” span of columns, dim = rank\n2. **Null space** $N(A) \\subseteq \\mathbb{R}^n$ â€” kernel of $A$, dim = nullity\n3. **Row space** $C(A^T) \\subseteq \\mathbb{R}^n$ â€” span of rows, dim = rank\n4. **Left null space** $N(A^T) \\subseteq \\mathbb{R}^m$ â€” kernel of $A^T$, dim = $m$ âˆ’ rank\n\nFundamental theorem: $N(A) \\perp C(A^T)$ and $N(A^T) \\perp C(A)$.',
      },
    ],
    visualizations: [
      {
        id: 'LALesson07_NullSpace',
        title: 'Visualizing the Crushed Space',
        mathBridge: 'Observe the 3D space being flattened into a 2D plane. Step 1: Drag the camera to see how the Column Space (the purple plane) contains all final destinations. Step 2: Notice the glowing red line piercing straight through the plane. That is the Null Space. Every vector that started on that red line was physically crushed directly into the origin $(0,0,0)$.',
        caption: 'The Column Space is what survives. The Null Space is what gets crushed to zero.',
      },
      {
        id: 'LALesson06_Inverses',
        title: 'Null Space Grows as Determinant Shrinks',
        mathBridge: 'Slide the transformation matrix toward singularity and watch two things happen simultaneously: the determinant approaches 0, and the column space collapses from a 2D plane to a 1D line. The null space grows from just the origin to a full line through the origin. At det = 0, the null space has dimension 1 and the Rank-Nullity theorem snaps into view: rank drops by 1, nullity rises by 1. Total dimensions are conserved.',
        caption: 'As det â†’ 0, column space collapses and null space grows â€” Rank-Nullity in motion.',
      },
    ],
  },

  // â”€â”€ Math â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        title: 'How to Find the Null Space â€” Step by Step',
        body: 'Set up $A\\mathbf{x} = \\mathbf{0}$ and row-reduce. Identify free variables (non-pivot columns). For each free variable: set it to 1, all other free variables to 0, back-substitute for the pivot variables. The result is one null space basis vector. Repeat for every free variable. The full set spans $N(A)$.\n\n**Example:** if columns 1 and 3 are pivots and column 2 is free ($x_2$), set $x_2 = 1$, solve for $x_1$ and $x_3$ from the equations, assemble into a vector.',
      },
      {
        type: 'theorem',
        title: 'General Solution Structure for Ax = b',
        body: 'If $A\\mathbf{x} = \\mathbf{b}$ is consistent (i.e., $\\mathbf{b} \\in C(A)$), then its **general solution** is:\n\n$$\\mathbf{x} = \\mathbf{x}_p + \\mathbf{x}_h$$\n\n$\\mathbf{x}_p$ = any **particular solution**; $\\mathbf{x}_h \\in N(A)$ = any null space vector.\n\nThe solution set is an affine subspace â€” a shifted copy of the null space. The null space dimension equals the number of free parameters in the solution.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'OpenMAT: Null Space and Column Space',
        mathBridge: 'MATLAB: `rank(A)` counts pivot columns; `null(A)` returns an orthonormal basis for the null space; `orth(A)` returns an orthonormal basis for the column space. Verify: A * null(A) â‰ˆ 0.',
        caption: 'Three cells: computing rank and null space, the four subspaces, and CNC probe geometry check.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'rank(), null(), orth() â€” the three essential commands',
              prose: [
                '`rank(A)` = number of pivot columns = dim(column space).',
                '`null(A)` = orthonormal basis for the null space (columns of the result are basis vectors).',
                '`orth(A)` = orthonormal basis for the column space.',
              ],
              code: `% Full rank matrix (invertible)
A_full = [1 2; 3 4];
fprintf('rank(A_full) = %d  (full rank, 2Ã—2)\\n', rank(A_full))
fprintf('null(A_full) has %d column(s)  (trivial null space)\\n', size(null(A_full),2))

% Rank-deficient matrix (row 2 = 3 Ã— row 1)
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
              cellTitle: 'Rank-Nullity theorem â€” dimensions must balance',
              prose: [
                'For an mÃ—n matrix: rank + nullity = n. You can verify this for any matrix â€” the dimensions always sum to the number of columns.',
              ],
              code: `% 3Ã—4 matrix: maps R^4 â†’ R^3
A = [1 2 0 3;
     2 4 1 5;
     0 0 1 -1];

[m, n] = size(A);
r = rank(A);
nullity = n - r;
null_basis = null(A);

fprintf('Matrix size: %d Ã— %d\\n', m, n)
fprintf('rank(A)    = %d\\n', r)
fprintf('nullity(A) = %d\\n', nullity)
fprintf('rank + nullity = %d = n  (rank-nullity theorem confirmed)\\n', r + nullity)

fprintf('\\nNull space has %d basis vector(s):\\n', size(null_basis,2))
disp(null_basis)

% Verify all null space vectors satisfy A*v = 0
residual = norm(A * null_basis);
fprintf('||A * null_basis|| = %.2e  (should be â‰ˆ 0)\\n', residual)`,
            },
            {
              id: 3,
              cellTitle: 'Application: CNC probe calibration â€” catching collinear probe points',
              prose: [
                'A CNC machine probes reference points to establish its work coordinate frame. If the probed points are collinear (all on a line), the measurement matrix has rank 1 â€” not enough to define a plane. The null space is 1D, meaning one surface direction is completely unknown.',
                'This checks whether a set of probe points is geometrically adequate for surface calibration.',
              ],
              code: `% Good probe layout: 3 non-collinear points define a plane
P1 = [0;   0  ];
P2 = [100; 0  ];
P3 = [50;  75 ];  % off-axis

% Edge vectors from P1
M_good = [P2-P1,  P3-P1];  % 2Ã—2 matrix of direction vectors
fprintf('Good probe layout:\\n')
fprintf('  rank = %d  (full rank â†’ plane well-defined)\\n', rank(M_good))
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
          ]
        }
      },
      {
        id: 'PythonNotebook',
        title: 'Code: Null Space and Column Space',
        mathBridge: 'np.linalg.matrix_rank(A) = number of pivot columns = dim(C(A)). Null space dimension = n âˆ’ rank (rank-nullity theorem). scipy.linalg.null_space(A) computes a basis for N(A).',
        caption: 'Find what a matrix destroys (null space) and what it can reach (column space).',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Rank â€” counting the independent directions',
              prose: [
                'The **rank** of A is the number of pivot columns â€” the dimension of the column space.',
                'The **rank-nullity theorem**: rank(A) + nullity(A) = n (number of columns).',
                'nullity = number of free variables = dimension of the null space.',
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
                'The null space is all vectors x such that Ax = 0.',
                '`scipy.linalg.null_space(A)` returns an orthonormal basis for N(A). Verify by checking A @ null_vec â‰ˆ 0.',
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
ax.text(nv[0]+0.05, nv[1]+0.05, f'null vec
{nv.round(3)}', color='crimson', fontsize=10)
ax.annotate('', xy=-nv, xytext=origin, arrowprops=dict(arrowstyle='->', color='crimson', lw=2.5, linestyle='dashed'))
ax.set_xlim(-1.5, 1.5); ax.set_ylim(-1.5, 1.5)
ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
ax.legend(fontsize=9)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Rank-nullity in action',
              difficulty: 'medium',
              prompt: 'For the matrix A below: (1) compute its rank, (2) compute the nullity (= n âˆ’ rank), (3) find the null space basis using scipy.linalg.null_space, (4) verify each basis vector satisfies Av = 0.',
              code: `import numpy as np
from scipy import linalg

A = np.array([[1., 2., 3.],
              [2., 4., 6.],
              [1., 1., 2.]])

# 1. rank
# 2. nullity = n - rank (n = 3 columns)
# 3. null_space basis
# 4. verify each column of null_basis satisfies A @ col â‰ˆ 0
`,
              hint: 'np.linalg.matrix_rank(A). null_basis = linalg.null_space(A). Each column of null_basis is a basis vector. Check np.allclose(A @ null_basis, 0).',
            },
          ]
        }
      },
    ],
  },

  // â”€â”€ Rigor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  rigor: {
    prose: [
      '**Subspace verification.** Both the null space and column space are genuine vector subspaces â€” they are closed under addition and scalar multiplication.\n\n*Null space:* If $A\\mathbf{u} = \\mathbf{0}$ and $A\\mathbf{v} = \\mathbf{0}$, then $A(\\mathbf{u}+\\mathbf{v}) = A\\mathbf{u} + A\\mathbf{v} = \\mathbf{0}+\\mathbf{0} = \\mathbf{0}$. Also $A(c\\mathbf{u}) = cA\\mathbf{u} = \\mathbf{0}$. Both conditions hold.\n\n*Column space:* If $\\mathbf{y}_1, \\mathbf{y}_2 \\in C(A)$ then $\\mathbf{y}_1 = A\\mathbf{x}_1$, $\\mathbf{y}_2 = A\\mathbf{x}_2$, so $\\mathbf{y}_1 + \\mathbf{y}_2 = A(\\mathbf{x}_1 + \\mathbf{x}_2) \\in C(A)$. Similarly $c\\mathbf{y}_1 = A(c\\mathbf{x}_1) \\in C(A)$.',
      '**The Fundamental Theorem of Linear Algebra (Gilbert Strang).** For any $m \\times n$ matrix $A$:\n\n- $C(A) \\perp N(A^T)$ â€” column space and left null space are orthogonal complements in $\\mathbb{R}^m$\n- $C(A^T) \\perp N(A)$ â€” row space and null space are orthogonal complements in $\\mathbb{R}^n$\n\nConsequence: every vector $\\mathbf{x} \\in \\mathbb{R}^n$ decomposes uniquely as $\\mathbf{x} = \\mathbf{x}_{\\text{row}} + \\mathbf{x}_{\\text{null}}$ with $\\mathbf{x}_{\\text{row}} \\in C(A^T)$ and $\\mathbf{x}_{\\text{null}} \\in N(A)$. The matrix $A$ maps $\\mathbf{x}_{\\text{row}}$ injectively onto $C(A)$ and annihilates $\\mathbf{x}_{\\text{null}}$.',
      '**Proof of the Rank-Nullity theorem.** Let $r = \\text{rank}(A)$. RREF of $A$ has $r$ pivot columns and $n - r$ free variable columns. The null space has dimension $n - r$ (one free parameter per free column). The column space has dimension $r$ (pivot columns of the original $A$ form a basis). Therefore $r + (n-r) = n$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Rank-Nullity Theorem',
        body: 'For any matrix $A \\in \\mathbb{R}^{m \\times n}$:\n\n$$\\text{rank}(A) + \\text{nullity}(A) = n$$\n\n**rank** = dim$\\,C(A)$ = number of pivots in RREF of $A$.\n**nullity** = dim$\\,N(A)$ = $n$ âˆ’ rank.\n\nFor $A$ square ($m = n$): $A$ is invertible iff nullity = 0 iff rank = $n$.',
      },
      {
        type: 'theorem',
        title: 'Consistency of Ax = b',
        body: 'The system $A\\mathbf{x} = \\mathbf{b}$ is **consistent** (has at least one solution) if and only if $\\mathbf{b} \\in C(A)$.\n\nIf consistent, the **general solution** is $\\mathbf{x} = \\mathbf{x}_p + \\mathbf{x}_h$ where:\n- $\\mathbf{x}_p$ is any particular solution\n- $\\mathbf{x}_h \\in N(A)$ is an arbitrary element of the null space\n\nThis is why the null space dimension equals the number of "free parameters" in the solution.',
      },
      {
        type: 'insight',
        title: 'Finding the Column Space Basis â€” Use Original Columns',
        body: 'Trap: do NOT use the pivot columns from the RREF matrix as the column space basis. Row operations change columns but preserve pivot locations. The correct basis is formed by the **pivot columns of the ORIGINAL matrix** $A$ (before any row operations).\n\nThe row space basis CAN be read from the RREF â€” it uses the nonzero rows of RREF directly.',
      },
    ],
    visualizations: [],
  },

  // â”€â”€ Examples â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      title: "Null Space of a 3Ã—4 Matrix â€” Two Free Variables",
      problem: "Find a basis for the null space of $A = \\begin{bmatrix} 1 & 2 & 0 & 3 \\\\ 2 & 4 & 1 & 5 \\\\ 0 & 0 & 1 & -1 \\end{bmatrix}$. State the rank and nullity.",
      steps: [
        {
          expression: "\\begin{bmatrix}1&2&0&3\\\\2&4&1&5\\\\0&0&1&{-1}\\end{bmatrix} \\xrightarrow{R_2-2R_1} \\begin{bmatrix}1&2&0&3\\\\0&0&1&{-1}\\\\0&0&1&{-1}\\end{bmatrix} \\xrightarrow{R_3-R_2} \\begin{bmatrix}1&2&0&3\\\\0&0&1&{-1}\\\\0&0&0&0\\end{bmatrix}",
          annotation: "Row-reduce to RREF. Pivots appear in columns 1 and 3. Columns 2 and 4 have no pivots â€” they are the free variable columns. Therefore rank = 2, nullity = 4 âˆ’ 2 = 2.",
          strategyTitle: "Row-reduce to find pivot and free columns",
          checkpoint: "How many pivot columns? How many free variables?",
          hints: ["Pivots in columns 1 and 3. Free variables: $x_2$ and $x_4$. Rank-Nullity: 2 + 2 = 4 âœ“"],
        },
        {
          expression: "x_1 + 2x_2 + 3x_4 = 0 \\implies x_1 = -2x_2 - 3x_4 \\qquad x_3 - x_4 = 0 \\implies x_3 = x_4",
          annotation: "Read equations from the RREF rows: row 1 gives $x_1 = -2x_2 - 3x_4$, row 2 gives $x_3 = x_4$. Express each pivot variable in terms of the free variables.",
          strategyTitle: "Express pivot variables in terms of free variables",
          hints: ["Each RREF row with a pivot variable gives you one equation. Isolate the pivot variable on the left."],
        },
        {
          expression: "\\mathbf{v}_1 = \\begin{bmatrix}-2\\\\1\\\\0\\\\0\\end{bmatrix} \\;(x_2=1, x_4=0), \\qquad \\mathbf{v}_2 = \\begin{bmatrix}-3\\\\0\\\\1\\\\1\\end{bmatrix} \\;(x_2=0, x_4=1)",
          annotation: "Set each free variable to 1 in turn while holding others at 0. For $x_2=1, x_4=0$: $x_1=-2, x_3=0$ â†’ $\\mathbf{v}_1$. For $x_2=0, x_4=1$: $x_1=-3, x_3=1$ â†’ $\\mathbf{v}_2$. One basis vector per free variable.",
          strategyTitle: "Build one basis vector per free variable",
          hints: ["Each free variable 'turns on' one dimension of the null space. Set it to 1, set all other free variables to 0, back-substitute for the pivot variables."],
        },
        {
          expression: "N(A) = \\text{Span}\\left\\{\\begin{bmatrix}-2\\\\1\\\\0\\\\0\\end{bmatrix},\\begin{bmatrix}-3\\\\0\\\\1\\\\1\\end{bmatrix}\\right\\}",
          annotation: "The null space is a 2D subspace of $\\mathbb{R}^4$. Verify: rank 2 + nullity 2 = 4 = number of columns âœ“. Check: $A\\mathbf{v}_1 = \\mathbf{0}$ and $A\\mathbf{v}_2 = \\mathbf{0}$.",
          strategyTitle: "Assemble and verify",
        }
      ],
      conclusion: "rank = 2, nullity = 2, confirming rank + nullity = 4 = number of columns. Each free variable column contributes exactly one basis vector to the null space, built by the back-substitution method."
    },
    {
      id: "la2-004-ex3",
      title: "Is Ax = b Consistent? Testing b âˆˆ C(A)",
      problem: "For $A = \\begin{bmatrix} 1 & 2 \\\\ 3 & 6 \\end{bmatrix}$ (from Example 1), determine whether (a) $\\mathbf{b}_1 = \\begin{bmatrix}2\\\\6\\end{bmatrix}$ and (b) $\\mathbf{b}_2 = \\begin{bmatrix}1\\\\2\\end{bmatrix}$ are in the column space.",
      steps: [
        {
          expression: "C(A) = \\text{Span}\\left\\{\\begin{bmatrix}1\\\\3\\end{bmatrix}\\right\\} \\quad (\\text{only vectors of the form } c\\begin{bmatrix}1\\\\3\\end{bmatrix} \\text{ are reachable})",
          annotation: "From Example 1: $A$ has rank 1. The entire column space is the line through the origin in direction $[1,3]^T$. Any vector not on this line is unreachable.",
          strategyTitle: "Recall the column space from Example 1",
        },
        {
          expression: "(a)\\; \\mathbf{b}_1 = \\begin{bmatrix}2\\\\6\\end{bmatrix} = 2\\begin{bmatrix}1\\\\3\\end{bmatrix} \\in C(A) \\implies \\textbf{CONSISTENT}",
          annotation: "$\\mathbf{b}_1 = 2 \\cdot [1,3]^T$ â€” it lies exactly on the column space line. A particular solution: $\\mathbf{x}_p = [2,0]^T$ (check: $A[2,0]^T = 2[1,3]^T = [2,6]^T$ âœ“). The general solution is $\\mathbf{x} = [2,0]^T + t[-2,1]^T$ (adding any null space vector).",
          strategyTitle: "Check bâ‚: is it a scalar multiple of [1,3]áµ€?",
        },
        {
          expression: "(b)\\; \\mathbf{b}_2 = \\begin{bmatrix}1\\\\2\\end{bmatrix}: \\text{ need } c=1 \\text{ (from row 1) but } 3c = 3 \\neq 2 \\text{ (row 2)} \\implies \\mathbf{b}_2 \\notin C(A) \\implies \\textbf{INCONSISTENT}",
          annotation: "For $[1,2]^T$ to equal $c[1,3]^T$: component 1 forces $c=1$, but then component 2 requires $3(1)=3 \\neq 2$. Contradiction. Equivalently: row-reduce $[A|\\mathbf{b}_2]$ to get the row $[0,0|{-1}]$ â€” a contradiction meaning no solution exists.",
          strategyTitle: "Check bâ‚‚: contradiction in the components",
          hints: ["The augmented matrix test: row-reduce $[A|\\mathbf{b}]$. If any row looks like $[0,0,\\ldots,0|c]$ with $c \\neq 0$, the system is inconsistent."],
        }
      ],
      conclusion: "bâ‚ = [2,6]áµ€ is reachable (2Ã— the column space basis). bâ‚‚ = [1,2]áµ€ lies off the column space line â€” inconsistent. The key rule: Ax = b is solvable if and only if b âˆˆ C(A)."
    }
  ],

  // â”€â”€ Challenges â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      hint: "Row-reduce $A$ to RREF. Column 2 will be free (watch: column 2 = 2 Ã— column 1 throughout). For part (d), row-reduce $[A|\\mathbf{b}]$ â€” if no contradiction row appears, $\\mathbf{b} \\in C(A)$.",
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
      answer: "$N(A) = \\text{Span}\\{[-2,1,0]^T\\}$; rank 2, nullity 1; $2+1=3=n$ âœ“; $\\mathbf{b} \\in C(A)$, general solution $\\mathbf{x} = [3/2,\\,0,\\,1/2]^T + t[-2,1,0]^T$"
    }
  ],

  // â”€â”€ Semantic Layer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  semantics: {
    core: [
      {
        symbol: "C(A)",
        meaning: "Column Space. The span of the matrix's columns. Geometrically, the space of all possible outputs."
      },
      {
        symbol: "N(A)",
        meaning: "Null Space. The set of all vectors v where Av = 0."
      },
      {
        symbol: "\\text{Rank}(A)",
        meaning: "The number of dimensions mathematically surviving in the Column Space."
      }
    ],
    rulesOfThumb: [
      "If a matrix is invertible, its Rank is full (equal to n), and its Null Space contains ONLY the zero vector.",
      "If a matrix has a determinant of exactly 0, its Null Space has a dimension of at least 1.",
      "Rank + Nullity ALWAYS equals the total number of starting columns."
    ]
  },

  // â”€â”€ Spiral Learning â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Assessment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  assessment: {
    questions: [
      {
        id: "la2-004-assess-1",
        type: "input",
        text: "If a 4x4 matrix flattens 4D space into a completely flat 2D plane, what is the dimension of its Null Space? (Enter a number).",
        answer: "2",
        hint: "Rank-Nullity theorem: 2 (Rank) + X (Nullity) = 4 (Total Columns)."
      }
    ]
  },

  // â”€â”€ Mental Model â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  mentalModel: [
    "Column Space: The survivor. What is left of the grid after the squish.",
    "Rank: How many dimensions the survivor has.",
    "Null Space: The graveyard. The vectors that were mercilessly crushed into the origin.",
    "Rank + Nullity = The original number of columns."
  ],

  // â”€â”€ Checkpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  checkpoints: [
    { id: 'cp-la2-004-1', label: 'Read intuition â€” understand column space vs null space', type: 'read' },
    { id: 'cp-la2-004-2', label: 'Read math â€” trace the null space algorithm for a 2Ã—2 matrix', type: 'read' },
    { id: 'cp-la2-004-3', label: 'Read rigor â€” study Rank-Nullity proof and Fundamental Theorem', type: 'read' },
    { id: 'cp-la2-004-4', label: 'Run OpenMAT cell 1 â€” verify A * null(A) â‰ˆ 0', type: 'lab' },
    { id: 'cp-la2-004-5', label: 'Run OpenMAT cell 2 â€” verify rank + nullity = n for a 3Ã—4 matrix', type: 'lab' },
    { id: 'cp-la2-004-6', label: 'Complete example 1: find column space and null space of a 2Ã—2 singular matrix', type: 'example' },
    { id: 'cp-la2-004-7', label: 'Complete example 2: find the 2D null space of a 3Ã—4 matrix', type: 'example' },
    { id: 'cp-la2-004-8', label: 'Attempt challenge 2: apply rank-nullity to a 5Ã—7 matrix', type: 'challenge' },
    { id: 'cp-la2-004-9', label: 'Attempt challenge 3: find N(A) by hand for a 3Ã—3 matrix', type: 'challenge' },
  ],

  // â”€â”€ Final Quiz â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      reviewSection: 'Intuition tab â€” Rank-Nullity Theorem'
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
      reviewSection: 'Intuition tab â€” The Graveyard'
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
      reviewSection: 'Math tab â€” Column Space Trick callout'
    },
    {
      id: 'la2-004-quiz-4',
      type: 'choice',
      text: "The system $A\\mathbf{x} = \\mathbf{b}$ has no solution. What does this tell you about $\\mathbf{b}$?",
      options: [
        "$\\mathbf{b}$ is not in the column space of $A$ â€” the transformation cannot reach that output.",
        "$\\mathbf{b}$ is in the null space of $A$.",
        "$A$ must be square.",
        "The rank of $A$ is zero."
      ],
      answer: "$\\mathbf{b}$ is not in the column space of $A$ â€” the transformation cannot reach that output.",
      hints: ["$A\\mathbf{x}=\\mathbf{b}$ is consistent if and only if $\\mathbf{b} \\in C(A)$. No solution means $\\mathbf{b}$ lies outside the column space."],
      reviewSection: 'Rigor tab â€” Consistency theorem'
    },
    {
      id: 'la2-004-quiz-5',
      type: 'choice',
      text: "A $6 \\times 3$ matrix $A$ has rank 2. What is the dimension of its null space?",
      options: [
        "1 â€” because nullity = n âˆ’ rank = 3 âˆ’ 2 = 1.",
        "4 â€” because nullity = m âˆ’ rank = 6 âˆ’ 2 = 4.",
        "2 â€” same as the rank.",
        "0 â€” the null space is always trivial for rectangular matrices."
      ],
      answer: "1 â€” because nullity = n âˆ’ rank = 3 âˆ’ 2 = 1.",
      hints: ["Rank-Nullity theorem: rank + nullity = n (number of COLUMNS, not rows). $n = 3$, rank $= 2$, so nullity $= 1$."],
      reviewSection: 'Intuition tab â€” Rank-Nullity theorem callout'
    },
    {
      id: 'la2-004-quiz-6',
      type: 'choice',
      text: "If $A\\mathbf{x} = \\mathbf{b}$ has infinitely many solutions, what must be true about $A$?",
      options: [
        "The null space of $A$ is non-trivial (nullity â‰¥ 1): adding any null space vector to one particular solution gives another valid solution.",
        "The column space of $A$ is all of $\\mathbb{R}^m$.",
        "The rank of $A$ equals $m$ (the number of rows).",
        "The matrix $A$ must be square."
      ],
      answer: "The null space of $A$ is non-trivial (nullity â‰¥ 1): adding any null space vector to one particular solution gives another valid solution.",
      hints: ["If $\\mathbf{x}_p$ solves $A\\mathbf{x}=\\mathbf{b}$ and $\\mathbf{v} \\in N(A)$, then $\\mathbf{x}_p + \\mathbf{v}$ is also a solution. Infinitely many solutions â†” nullity â‰¥ 1."],
      reviewSection: 'Rigor tab â€” General solution theorem',
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
      hints: ['Column space lives in the output space: $\\mathbb{R}^5$ (5 rows), dimension = rank = 3. Null space lives in the input space: $\\mathbb{R}^4$ (4 columns), nullity = 4 âˆ’ 3 = 1.'],
      reviewSection: 'Intuition tab â€” Rank-Nullity theorem',
    },
    {
      id: 'la2-004-quiz-8',
      type: 'choice',
      text: 'Which of the following is always true about the null space $N(A)$?',
      options: [
        'It is a subspace â€” it always contains the zero vector and is closed under addition and scaling',
        'It is always the zero subspace $\\{\\mathbf{0}\\}$',
        'It always has the same dimension as the column space',
        'It is non-empty only when $A$ is square',
      ],
      answer: 'It is a subspace â€” it always contains the zero vector and is closed under addition and scaling',
      hints: ['$A\\mathbf{0} = \\mathbf{0}$ so $\\mathbf{0} \\in N(A)$ always. If $A\\mathbf{u} = \\mathbf{0}$ and $A\\mathbf{v} = \\mathbf{0}$, then $A(\\mathbf{u}+\\mathbf{v}) = A\\mathbf{u}+A\\mathbf{v} = \\mathbf{0}$ and $A(c\\mathbf{u}) = cA\\mathbf{u} = \\mathbf{0}$. Closed under both operations.'],
      reviewSection: 'Rigor tab â€” Subspace verification',
    },
    {
      id: 'la2-004-quiz-9',
      type: 'choice',
      text: 'Matrix $A$ has columns $[1,0]^T$ and $[2,0]^T$. What is the column space of $A$?',
      options: [
        'The $x$-axis â€” both columns lie on the $x$-axis, so the column space is the 1D line $y = 0$',
        'All of $\\mathbb{R}^2$',
        'The $y$-axis',
        'Just the origin',
      ],
      answer: 'The $x$-axis â€” both columns lie on the $x$-axis, so the column space is the 1D line $y = 0$',
      hints: ['Column space = span of the columns. $[1,0]^T$ and $[2,0]^T$ are both horizontal â€” their span is just the $x$-axis. You can reach any $[t, 0]^T$ but no point with a nonzero $y$-coordinate.'],
      reviewSection: 'Intuition tab â€” column space definition',
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
      reviewSection: 'Rigor tab â€” General solution theorem',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'The null space and the column space are both subsets of the same space.',
      whyStudentsThinkIt: 'Both are "subspaces of the matrix" â€” students don\'t distinguish the input space from the output space.',
      correctionExample: 'For a $3 \\times 2$ matrix $A$: the null space lives in $\\mathbb{R}^2$ (input space â€” 2 columns), and the column space lives in $\\mathbb{R}^3$ (output space â€” 3 rows). They can have different dimensions and live in completely different spaces.',
      contrastCase: 'The null space asks: "Which inputs map to zero?" (input space). The column space asks: "Which outputs are reachable?" (output space). These are different questions about different spaces.',
    },
    {
      falseBelief: 'Choosing pivot columns from the RREF (not the original matrix) gives the column space basis.',
      whyStudentsThinkIt: 'After row reduction, the pivot columns of RREF look clean (all zeros except a single 1). Students use those instead of the original.',
      correctionExample: 'Let $A = \\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}$. After RREF: $\\begin{bmatrix}1&0\\\\0&1\\end{bmatrix}$. The RREF pivot columns are $[1,0]^T$ and $[0,1]^T$ â€” these span $\\mathbb{R}^2$ trivially, but they are NOT columns of $A$. The correct column space basis is $[1,3]^T$ and $[2,4]^T$ â€” the original pivot columns.',
      contrastCase: 'Null space vectors CAN be read from RREF (they are the free variable solutions to $R\\mathbf{x} = \\mathbf{0}$). Column space must use the ORIGINAL matrix\'s pivot columns.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A data scientist fits a linear model $A\\mathbf{x} = \\mathbf{b}$ to predict housing prices. She has 1000 data points (rows) but only 3 features (columns: square footage, bedrooms, bathrooms). She finds the RREF has rank 2. What does this tell her about her features?',
      competingTechniques: ['Inspect feature correlations visually', 'Compute rank of the design matrix'],
      whyThisTechniqueWins: 'Rank 2 means only 2 features are truly independent â€” one is a linear combination of the others (e.g., "bedrooms" may be proportional to "square footage" in this dataset). The null space has dimension 1, revealing the redundant direction. Removing the redundant feature avoids multicollinearity in regression.',
    },
    {
      situation: 'A graphics engineer applies a "depth collapse" matrix that squishes 3D coordinates to 2D screen pixels. A depth-recovery algorithm tries to invert this to reconstruct 3D positions. Why will this always fail, and what does null space theory say?',
      competingTechniques: ['Try to compute the inverse of the projection matrix', 'Analyze null space dimension'],
      whyThisTechniqueWins: 'The projection matrix has nullity â‰¥ 1 (the z-direction maps to zero). You cannot reconstruct which z-depth produced a given pixel â€” infinitely many 3D points project to the same 2D point. Null space theory says: no inverse exists; the entire z-axis is in the null space and is permanently unrecoverable from screen coordinates alone.',
    },
  ],

  debugging: [
    {
      commonError: 'Confusing "null space of $A$" with "null space of $A^T$" â€” picking the wrong space entirely.',
      symptom: 'Student finds vectors orthogonal to the rows of $A$ and calls them the null space.',
      whyItHappened: 'There are actually FOUR fundamental subspaces: $C(A)$, $N(A)$, $C(A^T)$, $N(A^T)$. Students conflate them.',
      repairStrategy: 'Keep the definitions sharp: $N(A)$ solves $A\\mathbf{x} = \\mathbf{0}$ â€” always in the INPUT space. $C(A)$ is spanned by the columns of $A$ â€” always in the OUTPUT space. When in doubt, check dimensions: $N(A)$ lives in $\\mathbb{R}^n$, $C(A)$ in $\\mathbb{R}^m$.',
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
