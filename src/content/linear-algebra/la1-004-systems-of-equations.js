export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la1-004',
  slug: 'systems-of-linear-equations',
  chapter: 'la1',
  order: 4,
  title: 'Systems of Linear Equations',
  subtitle: 'The central question of linear algebra: given a target, can we reach it — and if so, how?',
  tags: ['systems', 'gaussian elimination', 'row reduction', 'augmented matrix', 'RREF', 'linear equations', 'Ax=b'],
  aliases: 'simultaneous equations row echelon reduced row echelon form back substitution pivot free variable consistent inconsistent',

  // ── Hook ──────────────────────────────────────────────────────
  hook: {
    question: "You mix two chemical solutions to hit an exact target concentration. You have two unknowns, two constraints — how do you find the answer systematically, every time, without guessing?",
    realWorldContext: "Every time a computer solves a circuit (Kirchhoff's laws), balances a budget, or fits a curve to data, it is solving a system of linear equations. GPS works by solving a 4-equation system to find your position. Machine learning models update millions of parameters by solving enormous systems at every training step. This is not a niche skill — it is the engine that runs modern computing.",
    previewVisualizationId: 'SystemsOfEquationsGeometric',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      '**Where you are in the story:** You know what vectors are, you know about span and basis, and you can measure angles and areas with dot and cross products. Now we ask the fundamental question that ALL of linear algebra is built around: given a target vector $\\mathbf{b}$, can we find a combination of our column vectors that equals it? That question is a system of linear equations.',
      'Let\'s start with two unknowns. Suppose you want to find numbers $x$ and $y$ that satisfy both of these at once: $2x + y = 5$ and $x - y = 1$. Geometrically, each equation is a LINE in the $xy$-plane. The solution is the point where those lines cross.',
      '**The Row Picture.** Each equation draws a line (in 2D) or a plane (in 3D). You are looking for the intersection point. If the lines cross, there is exactly one solution. If the lines are parallel, there is no solution — the system is inconsistent. If the lines are identical, every point on the line works — infinitely many solutions.',
      '**The Column Picture.** Rewrite the same system as a single vector equation: $x \\begin{bmatrix}2\\\\1\\end{bmatrix} + y \\begin{bmatrix}1\\\\-1\\end{bmatrix} = \\begin{bmatrix}5\\\\1\\end{bmatrix}$. Now you are asking: what scalar combination of the two column vectors reaches the target vector $[5, 1]$? This is a span question — and you already know exactly what that means.',
      'These two pictures (row and column) are the same system viewed from different angles. Learning to flip between them is one of the most powerful habits in linear algebra.',
      '**Gaussian Elimination: the algorithm.** The key insight is that you can do three things to a system of equations without changing the solution: (1) swap two equations, (2) multiply an equation by a non-zero number, (3) add a multiple of one equation to another. These are the three elementary row operations. Gaussian elimination uses them systematically to create zeros below each leading entry, turning the system into a staircase shape — called row echelon form — where back-substitution becomes trivial.',
      '**Where this is heading:** Once you master systems, the natural next move is to ask: can we represent this whole process as a single object that encodes the system AND the transformation we are performing? Yes — that object is a matrix. Phase 2 begins exactly there.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 4 of 4 — Vectors & Spaces',
        body: '**Previous:** Dot and Cross Products — measuring angles, projections, and area.\n**This lesson:** Systems of linear equations — asking whether a target vector is in the span of our columns, and finding the answer systematically via Gaussian elimination.\n**Next:** Phase 2 begins — Matrices as Linear Transformations, where a system becomes a geometric machine.',
      },
      {
        type: 'insight',
        title: 'The Row Picture vs. The Column Picture',
        body: 'Row picture: each equation is a line or plane. Solution = intersection.\n\nColumn picture: can a linear combination of the column vectors reach $\\mathbf{b}$?\n\nSame system. Two completely different — and equally valid — ways to see it.',
      },
      {
        type: 'definition',
        title: 'Three Elementary Row Operations',
        body: '1. Swap two rows: $R_i \\leftrightarrow R_j$\n2. Scale a row: $R_i \\to c \\cdot R_i \\quad (c \\neq 0)$\n3. Row replacement: $R_i \\to R_i + c \\cdot R_j$\n\nNone of these change the solution set.',
      },
      {
        type: 'warning',
        title: 'Three Possible Outcomes — No In-Between',
        body: 'A system of linear equations always has exactly:\n• **One solution** (lines/planes intersect at a single point)\n• **No solution** (lines/planes are parallel — inconsistent)\n• **Infinitely many solutions** (lines/planes overlap — free variables exist)\n\nThere is no such thing as "exactly two solutions" in a linear system.',
      },
    ],
    visualizations: [
      {
        id: 'SystemsOfEquationsGeometric',
        title: 'The Row Picture: Two Lines in the Plane',
        mathBridge: 'Drag the sliders to change the coefficients of each equation. Observe the three cases: (1) two lines crossing at one point → unique solution, (2) two parallel lines → no solution, (3) two identical lines → infinitely many solutions. Notice how the algebraic case (determinant = 0) matches the geometric case (no crossing point).',
        caption: 'Every 2×2 system has a geometric story.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      'A system of $m$ linear equations in $n$ unknowns can always be written in matrix form as $A\\mathbf{x} = \\mathbf{b}$, where $A$ is an $m \\times n$ matrix of coefficients, $\\mathbf{x}$ is the unknown column vector, and $\\mathbf{b}$ is the target column vector.',
      'To apply Gaussian elimination, we form the **augmented matrix** $[A \\mid \\mathbf{b}]$ by appending $\\mathbf{b}$ as an extra column. We then apply row operations to put the left side in row echelon form (REF): each leading entry (called a **pivot**) must be strictly to the right of the pivot in the row above.',
      'For a unique solution, we can go further to **Reduced Row Echelon Form (RREF)**: each pivot is 1, and every other entry in the pivot\'s column is 0. Reading off the solution from RREF requires no back-substitution — it is immediate.',
      'If a row of the form $[0\\ 0\\ \\cdots\\ 0\\ |\\ c]$ (with $c \\neq 0$) appears, the system is **inconsistent** — no solution exists. If a column has no pivot, its corresponding variable is a **free variable** — it can take any value, giving infinitely many solutions.',
      '**The connection to rank:** The number of pivot columns is the rank of $A$, written $\\text{rank}(A)$. The number of free variables is $n - \\text{rank}(A)$. This is the rank-nullity theorem in disguise, which you will formally meet in Lesson LA2-004.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Augmented Matrix',
        body: '\\text{System: } \\begin{cases} 2x + y = 5 \\\\ x - y = 1 \\end{cases} \\quad \\longrightarrow \\quad \\left[\\begin{array}{cc|c} 2 & 1 & 5 \\\\ 1 & -1 & 1 \\end{array}\\right]',
      },
      {
        type: 'definition',
        title: 'Row Echelon Form (REF)',
        body: 'Each pivot is strictly right of the pivot above it. All entries below each pivot are zero.\n\n$\\begin{bmatrix} \\blacksquare & * & * \\\\ 0 & \\blacksquare & * \\\\ 0 & 0 & \\blacksquare \\end{bmatrix}$\n\nA staircase of leading entries descending left-to-right.',
      },
      {
        type: 'theorem',
        title: 'Consistency Condition',
        body: 'The system $A\\mathbf{x} = \\mathbf{b}$ is consistent (has at least one solution) if and only if $\\mathbf{b}$ is in the column space of $A$ — i.e., $\\text{rank}([A \\mid \\mathbf{b}]) = \\text{rank}(A)$.',
      },
      {
        type: 'insight',
        title: 'Free Variables = Dimension of the Solution Space',
        body: 'If a system has $k$ free variables, the solution set is a $k$-dimensional flat (a line for $k=1$, a plane for $k=2$, etc.). Each free variable is a direction you can move while staying on the solution set.',
      },
    ],
    visualizations: [
      {
        id: 'GaussianEliminationStepper',
        title: 'Step Through Gaussian Elimination',
        mathBridge: 'Enter a 3×3 system and press "Next Step". The visualization highlights the current pivot row in blue and the row being eliminated in red. Watch the augmented matrix transform row by row into echelon form, then RREF. At each step, confirm that the solution set has not changed — only our view of it.',
        caption: 'Gaussian elimination in slow motion.',
      },
      {
        id: 'PythonNotebook',
        title: 'Code: Solving Linear Systems',
        mathBridge: 'np.linalg.solve(A, b) computes A⁻¹b efficiently via LU factorization. np.linalg.matrix_rank() counts pivots. Always verify with np.allclose(A @ x, b).',
        caption: 'Solve systems of equations in one line — and visualize the geometry of the solution.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cellTitle: 'Solve Ax = b — unique solution',
              prose: [
                '`np.linalg.solve(A, b)` solves the system in one call. It uses LU factorization — faster and more stable than computing A⁻¹ directly.',
                'Geometrically: each row of Ax = b defines a line. The solution is their intersection.',
              ],
              code: `import numpy as np

# System: 2x + y = 8,  x + 3y = 9
A = np.array([[2.0, 1.0],
              [1.0, 3.0]])
b = np.array([8.0, 9.0])

x = np.linalg.solve(A, b)
print(f"Solution: x = {x[0]:.4f},  y = {x[1]:.4f}")
print(f"Verify A @ x = {A @ x}  (should equal b = {b})")`,
            },
            {
              id: 2,
              cellTitle: 'Visualize the intersection of two lines',
              prose: [
                'Each equation in the 2×2 system is a line. The solution is where they cross.',
                'Line 1: 2x + y = 8 → y = 8 − 2x. Line 2: x + 3y = 9 → y = (9 − x)/3.',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, AMBER, GREEN

A = np.array([[2.0, 1.0], [1.0, 3.0]])
b = np.array([8.0, 9.0])
x = np.linalg.solve(A, b)

fig = Figure(xmin=-1, xmax=7, ymin=-1, ymax=7,
             title="Intersection of Two Lines")
fig.grid().axes()
fig.plot(lambda t: 8 - 2*t,     color=BLUE,  label="2x+y=8")
fig.plot(lambda t: (9-t)/3,     color=AMBER, label="x+3y=9")
fig.point([float(x[0]), float(x[1])], color=GREEN,
          label=f"({x[0]:.1f}, {x[1]:.1f})", radius=7)
fig.show()`,
            },
            {
              id: 3,
              cellTitle: 'No solution vs. infinitely many',
              prose: [
                'The rank of A tells you the structure of the solution:',
                '- rank(A) = n and system consistent → **unique solution**\n- rank([A|b]) > rank(A) → **no solution** (inconsistent)\n- rank(A) < n and consistent → **infinitely many solutions** (free variables)',
              ],
              code: `import numpy as np

# Inconsistent: parallel lines (no solution)
A1 = np.array([[1.0, 2.0], [2.0, 4.0]])   # row 2 = 2 × row 1
b1 = np.array([3.0, 7.0])                  # but 7 ≠ 2×3

# Infinitely many: same line
b2 = np.array([3.0, 6.0])                  # 6 = 2×3 → consistent

print("=== Inconsistent system ===")
print(f"rank(A1) = {np.linalg.matrix_rank(A1)}")
Ab1 = np.column_stack([A1, b1])
print(f"rank([A1|b1]) = {np.linalg.matrix_rank(Ab1)}")
print("rank increased → NO solution")
print()
print("=== Infinitely many ===")
Ab2 = np.column_stack([A1, b2])
print(f"rank([A1|b2]) = {np.linalg.matrix_rank(Ab2)}")
print("rank unchanged, but rank < n → INFINITE solutions")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Solve a 3×3 system',
              difficulty: 'medium',
              prompt: 'Solve the 3×3 system: x + 2y + z = 9,  2x - y + z = 3,  x + y - z = 1. Use np.linalg.solve(). Then verify with np.allclose(A @ x, b) and print each unknown.',
              code: `import numpy as np

A = np.array([[1.0,  2.0,  1.0],
              [2.0, -1.0,  1.0],
              [1.0,  1.0, -1.0]])
b = np.array([9.0, 3.0, 1.0])

# Solve and verify
`,
              hint: 'x = np.linalg.solve(A, b). Print x[0], x[1], x[2] for the three unknowns. Verify: np.allclose(A @ x, b) should be True.',
            },
          ]
        }
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      'Every elementary row operation is invertible, which means it does not change the solution set. More precisely, row operations produce **row equivalent** matrices — matrices that represent different-looking systems with the exact same solution set.',
      'The RREF of a matrix is unique (this is a theorem, and the proof is non-trivial). This means the RREF is a canonical fingerprint of the row space of a matrix — two matrices have the same row space if and only if they have the same RREF.',
      'A system $A\\mathbf{x} = \\mathbf{b}$ has:\n- A **unique solution** iff $\\text{rank}(A) = n$ (all columns are pivots, no free variables) and the system is consistent.\n- **No solution** iff the augmented matrix $[A \\mid \\mathbf{b}]$ has a pivot in the last column.\n- **Infinitely many solutions** iff the system is consistent and $\\text{rank}(A) < n$ (at least one free variable).',
      'The complete solution to a consistent system can always be written as $\\mathbf{x} = \\mathbf{x}_p + \\mathbf{x}_h$, where $\\mathbf{x}_p$ is any particular solution and $\\mathbf{x}_h$ is any element of the null space of $A$ (i.e., any solution to $A\\mathbf{x} = \\mathbf{0}$). This decomposition will become central when you study the null space in Lesson LA2-004.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Uniqueness of RREF',
        body: 'Every matrix has exactly one reduced row echelon form. The RREF is a canonical representative of the row equivalence class of the matrix.',
      },
      {
        type: 'insight',
        title: 'General Solution = Particular + Homogeneous',
        body: '\\mathbf{x} = \\mathbf{x}_{\\text{particular}} + \\mathbf{x}_{\\text{null space}}\\\\\\\\\\text{This is identical in spirit to ODEs: general solution = particular + complementary.}',
      },
    ],
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: 'la1-004-ex1',
      title: 'Unique Solution: 2×2 System',
      problem: 'Solve the system: $2x + y = 5$ and $x - y = 1$.',
      steps: [
        {
          expression: '\\left[\\begin{array}{cc|c} 2 & 1 & 5 \\\\ 1 & -1 & 1 \\end{array}\\right]',
          annotation: 'Write as an augmented matrix $[A \\mid \\mathbf{b}]$. The vertical bar separates the coefficient matrix from the target vector.',
          strategyTitle: 'Form augmented matrix',
          checkpoint: 'Why do we combine the coefficients and the right-hand side into one matrix?',
          hints: ['The augmented matrix lets us apply row operations to both sides simultaneously, keeping the system balanced.'],
        },
        {
          expression: 'R_1 \\leftrightarrow R_2 \\quad \\longrightarrow \\quad \\left[\\begin{array}{cc|c} 1 & -1 & 1 \\\\ 2 & 1 & 5 \\end{array}\\right]',
          annotation: 'Swap rows to get a leading 1 in the top-left (the pivot position). This makes the arithmetic cleaner.',
          strategyTitle: 'Create pivot = 1',
          checkpoint: 'Does swapping rows change the solution?',
          hints: ['No — swapping rows just reorders the equations. The solution set is unchanged.'],
        },
        {
          expression: 'R_2 \\to R_2 - 2R_1 \\quad \\longrightarrow \\quad \\left[\\begin{array}{cc|c} 1 & -1 & 1 \\\\ 0 & 3 & 3 \\end{array}\\right]',
          annotation: 'Eliminate the entry below the pivot: subtract 2 times row 1 from row 2. This creates a zero in the $(2,1)$ position.',
          strategyTitle: 'Eliminate below pivot',
          checkpoint: 'What does the zero in position (2,1) mean?',
          hints: ['It means the variable $x$ has been eliminated from the second equation. We now have one equation in one unknown.'],
        },
        {
          expression: 'R_2 \\to \\frac{1}{3}R_2 \\quad \\longrightarrow \\quad \\left[\\begin{array}{cc|c} 1 & -1 & 1 \\\\ 0 & 1 & 1 \\end{array}\\right]',
          annotation: 'Scale row 2 so the second pivot is 1. This gives us $y = 1$ directly.',
          strategyTitle: 'Scale pivot to 1',
          checkpoint: 'What is $y$?',
          hints: ['The second row reads $0x + 1y = 1$, so $y = 1$.'],
        },
        {
          expression: 'R_1 \\to R_1 + R_2 \\quad \\longrightarrow \\quad \\left[\\begin{array}{cc|c} 1 & 0 & 2 \\\\ 0 & 1 & 1 \\end{array}\\right]',
          annotation: 'Eliminate the entry above the second pivot (back-substitution via row operations). We now have RREF.',
          strategyTitle: 'Reach RREF',
          checkpoint: 'Read the solution directly from RREF.',
          hints: ['Row 1 reads $x = 2$. Row 2 reads $y = 1$.'],
        },
        {
          expression: 'x = 2, \\quad y = 1',
          annotation: 'The RREF gives the solution immediately: $x = 2$, $y = 1$.',
          strategyTitle: 'Read the solution',
          checkpoint: '',
          hints: [],
        },
      ],
      conclusion: 'The system has a unique solution at the point $(2, 1)$. Geometrically, the two lines $2x + y = 5$ and $x - y = 1$ intersect at exactly this point.',
    },
    {
      id: 'la1-004-ex2',
      title: 'No Solution: Inconsistent System',
      problem: 'Solve the system: $x + 2y = 3$ and $2x + 4y = 9$.',
      steps: [
        {
          expression: '\\left[\\begin{array}{cc|c} 1 & 2 & 3 \\\\ 2 & 4 & 9 \\end{array}\\right]',
          annotation: 'Form the augmented matrix.',
          strategyTitle: 'Augmented matrix',
          checkpoint: 'Before eliminating, notice anything about the coefficient columns?',
          hints: ['The second row of coefficients is exactly 2 times the first. This is a warning sign.'],
        },
        {
          expression: 'R_2 \\to R_2 - 2R_1 \\quad \\longrightarrow \\quad \\left[\\begin{array}{cc|c} 1 & 2 & 3 \\\\ 0 & 0 & 3 \\end{array}\\right]',
          annotation: 'Eliminate below the first pivot. The result has a row of all zeros on the left — but a non-zero entry on the right.',
          strategyTitle: 'Eliminate and reveal contradiction',
          checkpoint: 'What does the second row say as an equation?',
          hints: ['It reads $0x + 0y = 3$, or $0 = 3$. This is a contradiction — no values of $x$ and $y$ can make this true.'],
        },
        {
          expression: '0 = 3 \\quad \\text{(contradiction)} \\quad \\Rightarrow \\quad \\text{No solution}',
          annotation: 'The pivot appears in the augmented column. This is the signature of an inconsistent system.',
          strategyTitle: 'Identify inconsistency',
          checkpoint: '',
          hints: [],
        },
      ],
      conclusion: 'The system is inconsistent — no solution exists. Geometrically, the two equations represent parallel lines (same direction $[1, 2]$, different intercepts). Parallel lines never cross.',
    },
    {
      id: 'la1-004-ex3',
      title: 'Infinite Solutions: Free Variable',
      problem: 'Solve: $x + 2y + z = 4$, $2x + 4y + 2z = 8$, $3x + 6y + 4z = 14$.',
      steps: [
        {
          expression: '\\left[\\begin{array}{ccc|c} 1 & 2 & 1 & 4 \\\\ 2 & 4 & 2 & 8 \\\\ 3 & 6 & 4 & 14 \\end{array}\\right]',
          annotation: 'Form the augmented matrix for the 3×3 system.',
          strategyTitle: 'Setup',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\xrightarrow{R_2 - 2R_1,\\; R_3 - 3R_1} \\left[\\begin{array}{ccc|c} 1 & 2 & 1 & 4 \\\\ 0 & 0 & 0 & 0 \\\\ 0 & 0 & 1 & 2 \\end{array}\\right]',
          annotation: 'Eliminate below the first pivot. Row 2 becomes all zeros — this signals a dependent equation (row 2 was just 2 times row 1).',
          strategyTitle: 'Eliminate column 1',
          checkpoint: 'What does an all-zero row mean?',
          hints: ['It means one of the original equations carried no new information — it was a multiple of another.'],
        },
        {
          expression: '\\xrightarrow{R_2 \\leftrightarrow R_3} \\left[\\begin{array}{ccc|c} 1 & 2 & 1 & 4 \\\\ 0 & 0 & 1 & 2 \\\\ 0 & 0 & 0 & 0 \\end{array}\\right]',
          annotation: 'Swap rows 2 and 3 to move the non-zero row up. Now we have echelon form.',
          strategyTitle: 'Swap to reach echelon form',
          checkpoint: 'How many pivots are there? How many free variables?',
          hints: ['Two pivots (columns 1 and 3). Column 2 has no pivot, so $y$ is a free variable.'],
        },
        {
          expression: '\\xrightarrow{R_1 - R_2} \\left[\\begin{array}{ccc|c} 1 & 2 & 0 & 2 \\\\ 0 & 0 & 1 & 2 \\\\ 0 & 0 & 0 & 0 \\end{array}\\right]',
          annotation: 'Reach RREF by eliminating the entry above the second pivot.',
          strategyTitle: 'Reach RREF',
          checkpoint: 'Read off $x$ and $z$ in terms of the free variable $y$.',
          hints: ['Row 1: $x + 2y = 2 \\Rightarrow x = 2 - 2y$. Row 2: $z = 2$.'],
        },
        {
          expression: 'x = 2 - 2t, \\quad y = t, \\quad z = 2 \\quad (t \\in \\mathbb{R})',
          annotation: 'Let the free variable $y = t$. The solution is a line in 3D — one degree of freedom.',
          strategyTitle: 'Parametric solution',
          checkpoint: '',
          hints: [],
        },
      ],
      conclusion: 'The system has infinitely many solutions, parameterized by a free variable $t$. The solution set is the line $\\{(2-2t,\\, t,\\, 2) : t \\in \\mathbb{R}\\}$. One of the three original equations was redundant — it contained no new information about the unknowns.',
    },
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: 'la1-004-ch1',
      difficulty: 'easy',
      problem: 'Use Gaussian elimination to solve: $x + y = 6$ and $x - y = 2$.',
      hint: 'Add the two equations together to eliminate $y$ first.',
      walkthrough: [
        {
          expression: '\\left[\\begin{array}{cc|c} 1 & 1 & 6 \\\\ 1 & -1 & 2 \\end{array}\\right] \\xrightarrow{R_2 - R_1} \\left[\\begin{array}{cc|c} 1 & 1 & 6 \\\\ 0 & -2 & -4 \\end{array}\\right]',
          annotation: 'Eliminate below the first pivot.',
        },
        {
          expression: '\\xrightarrow{-\\frac{1}{2}R_2} \\left[\\begin{array}{cc|c} 1 & 1 & 6 \\\\ 0 & 1 & 2 \\end{array}\\right] \\xrightarrow{R_1 - R_2} \\left[\\begin{array}{cc|c} 1 & 0 & 4 \\\\ 0 & 1 & 2 \\end{array}\\right]',
          annotation: 'Scale and back-substitute to reach RREF.',
        },
      ],
      answer: 'x = 4, y = 2',
    },
    {
      id: 'la1-004-ch2',
      difficulty: 'medium',
      problem: 'Determine whether the system is consistent, and if so find all solutions: $x + y - z = 2$, $2x + 3y + z = 7$, $3x + 4y = 9$.',
      hint: 'After two elimination steps, check whether a contradiction row appears.',
      walkthrough: [
        {
          expression: '\\left[\\begin{array}{ccc|c} 1 & 1 & -1 & 2 \\\\ 2 & 3 & 1 & 7 \\\\ 3 & 4 & 0 & 9 \\end{array}\\right] \\xrightarrow{R_2-2R_1,\\;R_3-3R_1} \\left[\\begin{array}{ccc|c} 1 & 1 & -1 & 2 \\\\ 0 & 1 & 3 & 3 \\\\ 0 & 1 & 3 & 3 \\end{array}\\right]',
          annotation: 'Eliminate column 1.',
        },
        {
          expression: '\\xrightarrow{R_3 - R_2} \\left[\\begin{array}{ccc|c} 1 & 1 & -1 & 2 \\\\ 0 & 1 & 3 & 3 \\\\ 0 & 0 & 0 & 0 \\end{array}\\right]',
          annotation: 'Rows 2 and 3 were identical — one equation was redundant.',
        },
        {
          expression: '\\xrightarrow{R_1 - R_2} \\left[\\begin{array}{ccc|c} 1 & 0 & -4 & -1 \\\\ 0 & 1 & 3 & 3 \\\\ 0 & 0 & 0 & 0 \\end{array}\\right]',
          annotation: 'Reach RREF. $z$ is a free variable.',
        },
        {
          expression: 'x = -1 + 4t, \\quad y = 3 - 3t, \\quad z = t \\quad (t \\in \\mathbb{R})',
          annotation: 'Let $z = t$. The system is consistent with infinitely many solutions — a line in 3D.',
        },
      ],
      answer: 'x = -1+4t, y = 3-3t, z = t',
    },
    {
      id: 'la1-004-ch3',
      difficulty: 'hard',
      problem: 'For what value of $k$ does the system have infinitely many solutions: $x + 2y = 3$ and $3x + 6y = k$?',
      hint: 'Eliminate and look at what the second row becomes. When is it not a contradiction?',
      walkthrough: [
        {
          expression: '\\left[\\begin{array}{cc|c} 1 & 2 & 3 \\\\ 3 & 6 & k \\end{array}\\right] \\xrightarrow{R_2 - 3R_1} \\left[\\begin{array}{cc|c} 1 & 2 & 3 \\\\ 0 & 0 & k-9 \\end{array}\\right]',
          annotation: 'Eliminate below pivot. The second row reads $0 = k - 9$.',
        },
        {
          expression: 'k - 9 = 0 \\quad \\Rightarrow \\quad k = 9',
          annotation: 'If $k \\neq 9$, the system is inconsistent (no solution). If $k = 9$, the row is $[0\\;0\\;|\\;0]$ — infinitely many solutions.',
        },
      ],
      answer: 'k = 9',
    },
  ],

  // ── Semantics ────────────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: 'A\\mathbf{x} = \\mathbf{b}', meaning: 'Matrix form of a linear system: A is coefficients, x is unknowns, b is targets' },
      { symbol: '[A \\mid \\mathbf{b}]', meaning: 'Augmented matrix — coefficient matrix with the target vector appended as an extra column' },
      { symbol: '\\text{RREF}', meaning: 'Reduced Row Echelon Form — pivots are 1, all other entries in pivot columns are 0' },
      { symbol: '\\text{rank}(A)', meaning: 'Number of pivot columns — measures how many independent constraints A provides' },
    ],
    rulesOfThumb: [
      'Pivot in the augmented column → no solution (inconsistent).',
      'No free variables → at most one solution.',
      'Every free variable adds one dimension to the solution set.',
      'The column picture reframes any system as a span question.',
    ],
  },

  // ── Spiral ────────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la1-002',
        label: 'Span and Linear Independence',
        note: 'A system $A\\mathbf{x}=\\mathbf{b}$ is asking whether $\\mathbf{b}$ is in the span of the columns of $A$. If the columns are linearly dependent, there will be free variables.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'la2-001',
        label: 'Matrices as Linear Transformations',
        note: 'The matrix $A$ you have been using to represent systems is the same object that, in Phase 2, you will see as a geometric transformation of space. The two views are inseparable.',
      },
      {
        lessonId: 'la2-004',
        label: 'Null Space and Column Space',
        note: 'The solution set of $A\\mathbf{x}=\\mathbf{0}$ is the null space of $A$. The set of all reachable $\\mathbf{b}$ is the column space. Both are precisely characterized by the RREF you learned here.',
      },
    ],
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    'Row picture: each equation is a line/plane. Solution = intersection.',
    'Column picture: what linear combination of columns reaches b?',
    'Three operations (swap, scale, replace) never change the solution.',
    'Pivot in augmented column = no solution. Free column = infinite solutions.',
    'RREF is the canonical, fully-simplified form of any linear system.',
  ],

  // ── Checkpoints ──────────────────────────────────────────────────
  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'la1-004-assess-1',
        type: 'input',
        text: 'How many solutions does the system $x + y = 3$, $2x + 2y = 6$ have?',
        answer: 'infinitely many',
        hint: 'The second equation is 2 times the first.',
      },
    ],
  },

  // ── Quiz ─────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'systems-of-linear-equations-q1',
      type: 'choice',
      text: 'During Gaussian elimination, you reach a row that reads $[0\\ 0\\ |\\ 5]$. What does this tell you?',
      options: [
        'The system has infinitely many solutions',
        'The system has a unique solution',
        'The system is inconsistent — no solution exists',
        'There is a free variable',
      ],
      answer: 'The system is inconsistent — no solution exists',
      hints: ['This row translates to the equation $0x + 0y = 5$, or $0 = 5$ — a contradiction.'],
      reviewSection: 'Math tab — Consistency Condition',
    },
    {
      id: 'systems-of-linear-equations-q2',
      type: 'choice',
      text: 'A 3×4 system (3 equations, 4 unknowns) has 2 pivot columns. How many free variables are there?',
      options: ['1', '2', '3', '4'],
      answer: '2',
      hints: ['Free variables = total unknowns − number of pivots = 4 − 2 = 2.'],
      reviewSection: 'Math tab — Free Variables',
    },
    {
      id: 'systems-of-linear-equations-q3',
      type: 'choice',
      text: 'Which elementary row operation can change the solution set of a system?',
      options: [
        'Swapping two rows',
        'Multiplying a row by 3',
        'Multiplying a row by 0',
        'Adding 5 times one row to another',
      ],
      answer: 'Multiplying a row by 0',
      hints: ['Multiplying by 0 destroys an equation entirely — it loses information and changes the solution set. The three valid operations all require non-zero scalars.'],
      reviewSection: 'Intuition tab — Three Elementary Row Operations',
    },
  ],
};
