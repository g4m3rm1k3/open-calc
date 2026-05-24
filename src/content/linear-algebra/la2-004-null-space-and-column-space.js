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
    prose: [
      '**Where you are in the story:** A singular matrix ($\\det = 0$) permanently destroys some information. This lesson gives that destruction a name and a structure. Meet the two fundamental subspaces of every matrix: the **column space** (what survives) and the **null space** (what gets annihilated).',
      '**The column space — the range of the transformation.** When you apply matrix $A$ to every possible input vector $\\mathbf{x} \\in \\mathbb{R}^n$, the set of all resulting output vectors $A\\mathbf{x}$ is called the **column space** of $A$ (written $\\text{col}(A)$ or $C(A)$, or in abstract algebra, the **image** $\\text{im}(A)$). Geometrically, it is the subspace spanned by the columns of $A$. If $A$ maps $\\mathbb{R}^3$ to a 2D plane, that plane is the column space. Any point *not* on that plane is unreachable — no input exists that lands there.',
      '**The null space — the graveyard.** The **null space** of $A$ (written $N(A)$, $\\ker(A)$, or the **kernel**) is the set of all vectors that $A$ sends to the zero vector: $N(A) = \\{\\mathbf{x} : A\\mathbf{x} = \\mathbf{0}\\}$. If $A$ squishes a 3D space to a 2D plane, one entire direction (a line through the origin) collapses to the origin. Every vector along that line maps to $\\mathbf{0}$. That line is the null space.',
      '**The Rank-Nullity theorem.** Dimensions balance perfectly:\n\n$$\\underbrace{\\text{rank}(A)}_{\\text{dim of column space}} + \\underbrace{\\text{nullity}(A)}_{\\text{dim of null space}} = \\underbrace{n}_{\\text{number of columns}}$$\n\nA $3 \\times 3$ matrix with rank 2 must have a 1D null space. $2 + 1 = 3$. Dimensions are conserved — they just get rerouted from "useful output" into "crushed directions."',
      '**The MRI connection.** An MRI scanner captures 2D cross-sectional slices (the column space of the scan operator). Depth — the coordinate pointing into the scanner — is not recorded per-slice: it is in the null space. Reconstruction algorithms like filtered back-projection implicitly compute the pre-image of each slice, combining many slices to recover the 3D structure. They are inverting the operator over its column space while knowing that the null space is informationless.',
      '**CNC probe calibration.** A CNC machine probes the workpiece at reference points to establish its coordinate frame. If you probe only collinear points (all on one line), the probe data matrix has rank 1 — its column space is 1D. You cannot recover the 2D plane of the part surface. The null space of the measurement matrix has dimension 1, meaning one direction of the surface is completely undetermined. Quality standards require probe points spread in 2D (non-collinear) so that rank = 2 and the full surface plane is uniquely determined.',
      '**Where this is heading:** We understand the four fundamental subspaces of any matrix. The next chapter asks: which special vectors completely resist rotation — they only get scaled by a factor? Those are the eigenvectors, and they are built from the null space idea applied to shifted matrices.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 4 of LA2 — Matrices & Transformations',
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
    visualizations: [
      {
        id: 'LALesson07_NullSpace',
        title: 'Visualizing the Crushed Space',
        mathBridge: 'Observe the 3D space being flattened into a 2D plane. Step 1: Drag the camera to see how the Column Space (the purple plane) contains all final destinations. Step 2: Notice the glowing red line piercing straight through the plane. That is the Null Space. Every vector that started on that red line was physically crushed directly into the origin $(0,0,0)$.',
        caption: 'The Column Space is what survives. The Null Space is what gets crushed to zero.',
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
                '`rank(A)` = number of pivot columns = dim(column space).',
                '`null(A)` = orthonormal basis for the null space (columns of the result are basis vectors).',
                '`orth(A)` = orthonormal basis for the column space.',
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
                'For an m×n matrix: rank + nullity = n. You can verify this for any matrix — the dimensions always sum to the number of columns.',
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
                'A CNC machine probes reference points to establish its work coordinate frame. If the probed points are collinear (all on a line), the measurement matrix has rank 1 — not enough to define a plane. The null space is 1D, meaning one surface direction is completely unknown.',
                'This checks whether a set of probe points is geometrically adequate for surface calibration.',
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
          ]
        }
      },
      {
        id: 'PythonNotebook',
        title: 'Code: Null Space and Column Space',
        mathBridge: 'np.linalg.matrix_rank(A) = number of pivot columns = dim(C(A)). Null space dimension = n − rank (rank-nullity theorem). scipy.linalg.null_space(A) computes a basis for N(A).',
        caption: 'Find what a matrix destroys (null space) and what it can reach (column space).',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cellTitle: 'Rank — counting the independent directions',
              prose: [
                'The **rank** of A is the number of pivot columns — the dimension of the column space.',
                'The **rank-nullity theorem**: rank(A) + nullity(A) = n (number of columns).',
                'nullity = number of free variables = dimension of the null space.',
              ],
              code: `import numpy as np

# Full rank: det ≠ 0
A = np.array([[1., 2.], [3., 4.]])

# Rank-deficient: row 2 = 3 × row 1
B = np.array([[1., 2.], [3., 6.]])

print(f"rank(A) = {np.linalg.matrix_rank(A)}  (full rank, 2×2 → only the zero vector in null space)")
print(f"rank(B) = {np.linalg.matrix_rank(B)}  (rank 1, nullity = 2-1 = 1 → 1D null space)")
print()

# Rank-nullity theorem for B (2 columns)
rank_B = np.linalg.matrix_rank(B)
nullity_B = B.shape[1] - rank_B
print(f"rank(B) + nullity(B) = {rank_B} + {nullity_B} = {rank_B + nullity_B} = n ✓")`,
            },
            {
              id: 2,
              cellTitle: 'Computing the null space',
              prose: [
                'The null space is all vectors x such that Ax = 0.',
                '`scipy.linalg.null_space(A)` returns an orthonormal basis for N(A). Verify by checking A @ null_vec ≈ 0.',
              ],
              code: `import numpy as np
from scipy import linalg

# B has a 1D null space (row 2 = 3 × row 1)
B = np.array([[1., 2.],
              [3., 6.]])

null_B = linalg.null_space(B)
print("Null space basis vector:")
print(null_B)
print()

# Verify: B @ null_vec = 0
print("B @ null_vec =", (B @ null_B).round(10))
print("(all zeros → null space confirmed)")`,
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
      id: "ex-1",
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
    }
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: "ch-1",
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
      id: "ch-2",
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
    }
  ],

  // ── Semantic Layer ───────────────────────────────────────────────
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
        id: "assess-1",
        type: "input",
        text: "If a 4x4 matrix flattens 4D space into a completely flat 2D plane, what is the dimension of its Null Space? (Enter a number).",
        answer: "2",
        hint: "Rank-Nullity theorem: 2 (Rank) + X (Nullity) = 4 (Total Columns)."
      }
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
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
  ],

  // ── Final Quiz ─────────────────────────────────────────────────
  quiz: [
    {
      id: 'quiz-1',
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
      id: 'quiz-2',
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
    }
  ]
};
