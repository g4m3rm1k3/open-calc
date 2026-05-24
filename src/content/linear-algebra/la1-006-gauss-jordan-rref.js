export default {
  id: 'la1-006',
  slug: 'gauss-jordan-rref',
  chapter: 'la1',
  order: 6,
  title: 'Gauss-Jordan RREF Drill',
  subtitle: 'Master the full row-reduction algorithm — every possible outcome: unique solution, no solution, infinitely many.',
  tags: ['RREF', 'row reduction', 'Gauss-Jordan', 'pivot', 'free variable', 'augmented matrix', 'solution types'],
  aliases: 'reduced row echelon form RREF Gauss-Jordan elimination pivot column free variable unique solution inconsistent infinite solutions parametric',

  hook: {
    question: "You have a system of 4 equations in 5 unknowns. Before you start, can you predict how many solutions it will have — and why?",
    realWorldContext: "RREF is the universal algorithm for solving any linear system, finding the rank of any matrix, testing linear independence, and computing null spaces. Every major linear algebra software package (NumPy, MATLAB, Mathematica) uses a variant of this algorithm internally. A data scientist uses it when fitting models with too few observations. A robotics engineer uses it to find the joint angles that achieve a given end-effector position. The algorithm's three outputs — unique solution, no solution, infinite solutions — correspond directly to three geometric configurations you will encounter throughout your career.",
    previewVisualizationId: 'LALesson04_Systems',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** You have seen Gaussian elimination for 2×2 and 3×3 systems. RREF (Reduced Row Echelon Form) is the completion of that idea: go all the way up as well as down, and scale every pivot row so the pivot equals 1. The result is a canonical form from which reading off the solution requires no further work.',
      '**The three-step Gauss-Jordan process:** (1) Forward elimination — create zeros below each pivot (same as Gaussian elimination). (2) Scale — divide each pivot row by its pivot so the pivot becomes 1. (3) Back-elimination — create zeros ABOVE each pivot as well. The resulting matrix is in RREF.',
      '**Pivot positions matter enormously.** A pivot column is a column that contains a leading 1 (after reduction) with zeros everywhere else in that column. A non-pivot column is a free variable column. The number of pivot columns equals the rank. The number of free variable columns equals the dimension of the null space (the nullity).',
      '**Three outcome cases:**',
      '• **Unique solution:** Every variable is a pivot variable (no free variables). The RREF augmented matrix looks like $[I | \\mathbf{c}]$.',
      '• **No solution:** A row of the form $[0\\ 0\\ \\cdots\\ 0\\ |\\ k]$ with $k \\neq 0$ appears — this is a contradiction.',
      '• **Infinitely many solutions:** There are free variables (non-pivot columns in the coefficient part) and no contradictions. The solution is a parametric family.',
      '**The "row of zeros" test is your diagnostic:** If you see $[0\\ 0\\ \\cdots\\ 0\\ |\\ k \\neq 0]$, the system is inconsistent. If you see only $[0\\ 0\\ \\cdots\\ 0\\ |\\ 0]$, the system is consistent with free variables.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 6 of LA1 — Vectors & Spaces',
        body: '**Previous:** Lines and Planes — geometry of linear constraints.\n**This lesson:** Gauss-Jordan RREF — the definitive algorithm for any linear system.\n**Next (Chapter 2):** Matrices as Transformations — seeing row operations as matrix multiplication.',
      },
      {
        type: 'definition',
        title: 'Reduced Row Echelon Form (RREF)',
        body: 'A matrix is in RREF if:\n1. The first nonzero entry in each row is 1 (called a **leading 1** or **pivot**).\n2. All other entries in each pivot column are 0.\n3. The pivot in row $i+1$ is to the right of the pivot in row $i$.\n4. Zero rows (all zeros) are at the bottom.\n\nEvery matrix has a unique RREF.',
      },
      {
        type: 'insight',
        title: 'Rank-Nullity Preview',
        body: 'For an $m \\times n$ matrix $A$:\n$$\\text{rank}(A) + \\text{nullity}(A) = n$$\n\n**rank** = number of pivot columns = number of nonzero rows in RREF.\n**nullity** = number of free variable columns.\n\nThis identity (proven in Chapter 6) is one of the deepest theorems in linear algebra.',
      },
      {
        type: 'warning',
        title: 'Free Variables Need a Parameter Name',
        body: 'When a variable $x_3$ is free, assign it a parameter: $x_3 = t \\in \\mathbb{R}$. Then express all pivot variables in terms of $t$. If there are two free variables, use $s$ and $t$. The solution set is $\\{\\mathbf{x}_p + s\\,\\mathbf{v}_1 + t\\,\\mathbf{v}_2 : s, t \\in \\mathbb{R}\\}$ — a translate of the null space.',
      },
    ],
    visualizations: [
      {
        id: 'LALesson04_Systems',
        title: 'RREF Step-by-Step Visualizer',
        mathBridge: 'Enter a 3×4 or 4×5 augmented matrix and step through the full Gauss-Jordan reduction. Each pivot is highlighted in red. The pivot columns turn green once complete. Watch how the three outcome types appear.',
        caption: 'Interactive Gauss-Jordan elimination showing all three solution types.',
      },
      {
        id: 'OpenMatNotebook',
        title: 'RREF in OpenMAT',
        mathBridge: 'Use rref() to reduce any augmented matrix. Experiment with the three outcome cases.',
        caption: 'Interactive OpenMAT cells for RREF practice.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Unique solution — 3×3',
              prose: ['A square system with a unique solution. The RREF should look like [I|c].'],
              code: `% Unique solution: 3 equations, 3 unknowns
A = [2 1 -1 8; -3 -1 2 -11; -2 1 2 -3];
R = rref(A)
% Read off: x1=2, x2=3, x3=-1`,
            },
            {
              id: 2,
              cellTitle: 'Inconsistent system',
              prose: ['Watch for a row [0 0 0 | k≠0] — this signals no solution.'],
              code: `% Inconsistent system
A = [1 2 3 4; 2 4 6 9; 0 0 0 1];
R = rref(A)
% Row 3 becomes [0 0 0 | 1] — INCONSISTENT`,
            },
            {
              id: 3,
              cellTitle: 'Infinitely many solutions',
              prose: ['Free variables appear when a column has no pivot. Express pivot variables in terms of the free parameter.'],
              code: `% Underdetermined: 2 equations, 4 unknowns
A = [1 2 -1 3 9; 0 0 1 -2 5];
R = rref(A)
% x2 and x4 are free variables`,
            },
          ]
        }
      },
    ],
  },

  math: {
    prose: [
      '**The Gauss-Jordan algorithm.** Given an $m \\times (n+1)$ augmented matrix $[A | \\mathbf{b}]$:\n1. Find the leftmost nonzero column. Let the topmost nonzero entry in that column (or use partial pivoting: the entry with largest absolute value) be the pivot.\n2. If needed, swap that row to the current pivot row position.\n3. Scale the pivot row so the pivot entry becomes 1.\n4. Use row replacement operations to zero out ALL other entries in the pivot column (not just below — above too).\n5. Move to the next row and repeat from step 1, ignoring previously processed rows.\n6. Continue until no more pivots can be found.',
      '**Solution reading.** After obtaining RREF of $[A | \\mathbf{b}]$:\n- If a row $[0\\ 0\\ \\cdots\\ 0\\ |\\ k]$ with $k \\neq 0$ exists: **inconsistent** (no solution).\n- Otherwise: **consistent**. Assign parameters to free variables ($x_j = t_j$ for each non-pivot column $j$). Express each pivot variable directly from its row.',
      '**RREF and rank.** The rank of $A$, written $\\text{rank}(A)$, equals the number of pivot positions in the RREF of $A$. For a consistent system $A\\mathbf{x} = \\mathbf{b}$:\n- Unique solution iff $\\text{rank}(A) = n$ (number of unknowns).\n- Infinitely many solutions iff $\\text{rank}(A) < n$.\n- Inconsistent iff $\\text{rank}([A|\\mathbf{b}]) > \\text{rank}(A)$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Solution Existence and Uniqueness',
        body: 'A system $A\\mathbf{x} = \\mathbf{b}$ with $A \\in \\mathbb{R}^{m \\times n}$:\n\n**Consistent** iff $\\text{rank}(A) = \\text{rank}([A|\\mathbf{b}])$\n\n**Unique solution** iff consistent AND $\\text{rank}(A) = n$\n\n**Infinitely many** iff consistent AND $\\text{rank}(A) < n$',
      },
      {
        type: 'definition',
        title: 'Elementary Row Operations',
        body: '**E1 (Swap):** Interchange rows $i$ and $j$: $R_i \\leftrightarrow R_j$\n\n**E2 (Scale):** Multiply row $i$ by nonzero scalar $c$: $R_i \\leftarrow c R_i$\n\n**E3 (Replace):** Add $c$ times row $j$ to row $i$: $R_i \\leftarrow R_i + c R_j$\n\nEach operation is **reversible** and preserves the solution set of the system.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Code: RREF Three Ways — NumPy, SymPy, and Manual',
        mathBridge: 'Two tools for RREF in Python: SymPy gives EXACT RREF with fractions (like working on paper). NumPy with np.linalg.matrix_rank() counts pivots. The manual step-by-step version shows you what the algorithm is ACTUALLY doing — each elementary row operation exposed.',
        caption: 'Use SymPy when you need to see the math; use NumPy when you need to solve numerically.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cellTitle: 'SymPy RREF — exact computation, like working on paper',
              prose: [
                '`sympy.Matrix.rref()` returns the RREF and the pivot column indices. SymPy uses exact arithmetic — you get fractions, not floating-point approximations.',
                'Use SymPy when you want to see exactly what the RREF looks like on paper. Use NumPy when you need fast numerical computation.',
              ],
              code: `from sympy import Matrix, Rational

# System: 2x + y - z = 8, -3x - y + 2z = -11, -2x + y + 2z = -3
A_aug = Matrix([
    [2,  1, -1,  8],
    [-3, -1,  2, -11],
    [-2,  1,  2, -3]
])

rref_matrix, pivot_cols = A_aug.rref()

print("Augmented matrix:")
print(A_aug)
print("\\nRREF:")
print(rref_matrix)
print("\\nPivot columns:", pivot_cols)
print("\\nSolution: x₁ =", rref_matrix[0,3],
      "  x₂ =", rref_matrix[1,3],
      "  x₃ =", rref_matrix[2,3])`,
            },
            {
              id: 2,
              cellTitle: 'Three outcome cases — classify and solve',
              prose: [
                'One function to rule them all: feed it the augmented matrix, get back the case name and solution.',
                'Understanding: compare rank(A) vs rank([A|b]) vs n. Those three numbers tell you everything.',
              ],
              code: `from sympy import Matrix
import numpy as np

def classify_system(A_arr, b_arr):
    """Classify a linear system and return the result."""
    A = Matrix(A_arr.tolist())
    b = Matrix(b_arr.tolist())
    Ab = A.row_join(b)

    r_A  = A.rank()
    r_Ab = Ab.rank()
    n    = A.shape[1]

    print(f"rank(A) = {r_A}, rank([A|b]) = {r_Ab}, unknowns = {n}")

    if r_Ab > r_A:
        print("→ INCONSISTENT: no solution (pivot in augmented column)")
    elif r_A == n:
        rref, _ = Ab.rref()
        sol = list(rref.col(-1))
        print(f"→ UNIQUE SOLUTION: {sol}")
    else:
        print(f"→ INFINITELY MANY: {n - r_A} free variable(s)")
        rref, pivots = Ab.rref()
        print("RREF:", rref)
    return None

print("=== Case 1: Unique solution ===")
classify_system(np.array([[2,1,-1],[-3,-1,2],[-2,1,2]]),
                np.array([[8],[-11],[-3]]))

print("\\n=== Case 2: Inconsistent ===")
classify_system(np.array([[1,2],[2,4]]), np.array([[3],[7]]))

print("\\n=== Case 3: Infinite solutions ===")
classify_system(np.array([[1,2,-1],[0,0,1]]), np.array([[4],[2]]))`,
            },
            {
              id: 3,
              cellTitle: 'Manual RREF — seeing each row operation',
              prose: [
                'This cell performs Gauss-Jordan elimination step-by-step, printing the matrix after each operation. You can see exactly what the algorithm does.',
                'This is the best way to build intuition about WHY RREF works.',
              ],
              code: `import numpy as np

def manual_rref(M):
    """Step-by-step RREF with printed intermediate states."""
    A = M.astype(float).copy()
    rows, cols = A.shape
    pivot_row = 0

    for col in range(cols - 1):  # skip augmented column
        # Find a nonzero entry in this column
        nonzero = None
        for r in range(pivot_row, rows):
            if abs(A[r, col]) > 1e-10:
                nonzero = r
                break
        if nonzero is None:
            continue  # free variable column, skip

        # Swap to bring pivot to current row
        if nonzero != pivot_row:
            A[[pivot_row, nonzero]] = A[[nonzero, pivot_row]]
            print(f"Swap R{pivot_row+1} ↔ R{nonzero+1}:")
            print(A.round(4), "\\n")

        # Scale pivot row
        A[pivot_row] /= A[pivot_row, col]
        print(f"Scale R{pivot_row+1} (pivot = 1):")
        print(A.round(4), "\\n")

        # Eliminate all other rows
        for r in range(rows):
            if r != pivot_row and abs(A[r, col]) > 1e-10:
                A[r] -= A[r, col] * A[pivot_row]
                print(f"R{r+1} ← R{r+1} − {A[r,col]:.4g}·R{pivot_row+1}:")
                print(A.round(4), "\\n")

        pivot_row += 1
    return A

M = np.array([[2, 1, -1, 8],
              [-3, -1, 2, -11],
              [-2, 1, 2, -3]])
print("Starting matrix:")
print(M, "\\n")
result = manual_rref(M)
print("Final RREF:", result.round(4))`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Classify and solve a 4×4 system',
              difficulty: 'hard',
              prompt: 'Given the system: x + 2y + z - w = 3,  2x + 5y + 2z + w = 11,  x + 3y + 3z + 2w = 8,  3x + 7y + 3z + 0w = 14. Set it up as np.array matrices, use SymPy to find RREF, identify pivot columns, and print the solution.',
              code: `from sympy import Matrix
import numpy as np

# Set up the augmented matrix [A | b]
A = np.array([
    [1, 2,  1, -1,  3],
    [2, 5,  2,  1, 11],
    [1, 3,  3,  2,  8],
    [3, 7,  3,  0, 14]
])

# Use sympy for exact RREF
# Identify solution type (unique, none, infinite)
`,
              hint: 'M = Matrix(A.tolist()). M.rref() returns (rref_matrix, pivot_cols). Check rank(A[:,:-1]) vs rank(A) vs number of unknowns (4).',
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Uniqueness of RREF.** Every matrix $A$ has a unique RREF, regardless of the sequence of row operations used to reach it. This is a non-trivial theorem proved by induction on the number of rows. The proof shows that if $R$ and $S$ are both in RREF and row-equivalent to $A$, then $R = S$. This uniqueness makes RREF a canonical form for the row equivalence class of $A$.',
      '**Row operations as matrix multiplication.** Each elementary row operation corresponds to multiplying on the left by an elementary matrix $E$. The RREF process computes $E_k \\cdots E_2 E_1 A = R$. This means $R = MA$ where $M = E_k \\cdots E_1$ is invertible. Therefore $A$ and $R$ are row-equivalent, and $A\\mathbf{x} = \\mathbf{b}$ is equivalent to $R\\mathbf{x} = M\\mathbf{b}$.',
    ],
    callouts: [
      {
        type: 'proof',
        title: 'Why RREF is Unique',
        body: 'Suppose $R$ and $S$ are both RREF matrices row-equivalent to $A$. Then $S = M R$ for some invertible $M$. Consider the pivot columns of $R$: they are the standard basis vectors $\\mathbf{e}_{i_1}, \\ldots, \\mathbf{e}_{i_r}$. The corresponding columns of $S = MR$ would be $M\\mathbf{e}_{i_1}, \\ldots, M\\mathbf{e}_{i_r}$. For $S$ to also be in RREF, these must be standard basis vectors. Proceeding column by column (left to right), one shows by induction that every leading 1 in $R$ corresponds to the same column position in $S$, and that all entries of $R$ and $S$ agree.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'la1-006-ex1',
      title: '4×4 System — Unique Solution',
      problem: 'Reduce the augmented matrix $\\begin{bmatrix}2&1&-1&3&|&1\\\\ 4&-2&1&-2&|&-6\\\\ -2&3&2&1&|&10\\\\ 0&1&-1&4&|&3\\end{bmatrix}$ to RREF and solve.',
      solution: 'Full Gauss-Jordan reduction yields pivot in every variable column: $x_1=1, x_2=2, x_3=0, x_4=1$.',
      steps: [
        'R2 ← R2 − 2R1, R3 ← R3 + R1 to create zeros in column 1.',
        'Scale R1 by 1/2 to get pivot = 1.',
        'Continue eliminating columns 2, 3, 4.',
        'Back-eliminate to zero out entries above each pivot.',
        'Read off solution from last column of RREF.',
      ],
    },
    {
      id: 'la1-006-ex2',
      title: '3×5 System — Free Variables',
      problem: 'Reduce $\\begin{bmatrix}1&2&0&3&1&|&5\\\\ 2&4&1&5&0&|&8\\\\ -1&-2&2&0&3&|&6\\end{bmatrix}$ to RREF. Identify pivot and free variables.',
      solution: 'Pivot columns: 1, 3, 4. Free variables: $x_2 = s$, $x_5 = t$. Particular solution plus null space vectors.',
      steps: [
        'R2 ← R2 − 2R1, R3 ← R3 + R1.',
        'Identify pivot in column 3 from R2.',
        'R3 ← R3 − 2R2 to create zero in column 3.',
        'Scale R3 to get next pivot.',
        'Back-eliminate and assign $x_2 = s$, $x_5 = t$.',
      ],
    },
  ],

  challenges: [
    {
      id: 'la1-006-ch1',
      title: 'Classify without solving',
      difficulty: 'medium',
      challengeType: 'analyze',
      prompt: 'Without fully reducing, determine whether the system with augmented matrix $\\begin{bmatrix}1&2&3&4\\\\ 2&4&6&9\\\\ 3&6&9&12\\end{bmatrix}$ has 0, 1, or infinitely many solutions. Justify your answer using rank arguments.',
      hint: 'Rows 1 and 3 are proportional. After elimination, look at what row 2 becomes relative to row 1.',
    },
    {
      id: 'la1-006-ch2',
      title: 'RREF to original system',
      difficulty: 'hard',
      challengeType: 'construct',
      prompt: 'Construct a $3 \\times 4$ augmented matrix (coefficient entries only, no augment yet) with rank 2, then choose a right-hand side $\\mathbf{b}$ that makes the system (a) consistent with infinitely many solutions, and (b) inconsistent. Verify using RREF.',
      hint: 'A rank-2 matrix in $\\mathbb{R}^{3 \\times 4}$ has 2 pivot columns and 2 free variable columns. For inconsistency, the augmented matrix must have rank 3.',
    },
  ],

  semantics: {
    core: ['RREF', 'pivot', 'free-variable', 'rank', 'nullity', 'elementary-row-operation'],
    bridges: ['systems-of-equations', 'null-space', 'column-space'],
  },
  spiral: {
    recoveryPoints: ['la1-004-systems-of-equations'],
    futureLinks: ['la2-004-null-space-and-column-space', 'la6-004-rank-nullity-theorem'],
  },
  mentalModel: [
    'RREF is the canonical form — every matrix has exactly one RREF.',
    'Pivot column = determined variable. Non-pivot column = free variable.',
    'A row of [0…0|k≠0] is the inconsistency detector.',
    'rank + nullity = n is the fundamental counting identity for column spaces.',
  ],
  checkpoints: ['read-intuition', 'run-cells', 'classify-3-types'],
  assessment: { questions: [] },
  quiz: [
    {
      id: 'la1-006-q1',
      question: 'A system has 4 equations and 6 unknowns. The coefficient matrix has rank 3. How many free variables are there?',
      options: ['1', '2', '3', '4'],
      answer: 2,
      explanation: 'Free variables = n − rank = 6 − 3 = 3.',
    },
    {
      id: 'la1-006-q2',
      question: 'After row reducing an augmented matrix, you get the row [0 0 0 | 5]. What does this mean?',
      options: ['The system has a unique solution', 'The system is inconsistent', 'x₃ = 5/1', 'There is a free variable'],
      answer: 1,
      explanation: 'The row 0x₁ + 0x₂ + 0x₃ = 5 is the equation 0 = 5, which is a contradiction. The system has no solution.',
    },
    {
      id: 'la1-006-q3',
      question: 'What is the unique RREF of the 2×2 identity matrix?',
      options: ['[[1,0],[0,1]]', '[[1,1],[0,0]]', '[[0,1],[1,0]]', '[[2,0],[0,2]]'],
      answer: 0,
      explanation: 'The identity matrix is already in RREF: leading 1s on the diagonal, zeros everywhere else.',
    },
  ],
};
