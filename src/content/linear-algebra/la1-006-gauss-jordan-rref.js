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
        title: 'Common Mistake: Skipping Back-Elimination',
        body: `Gaussian elimination creates zeros only **below** each pivot — stopping at Row Echelon Form (REF). Gauss-Jordan elimination creates zeros **above AND below** each pivot — reaching RREF.\n\n**Wrong (stops at REF):**\n$\\left[\\begin{array}{cc|c}1&2&5\\\\0&1&3\\end{array}\\right]$ — this is REF, NOT RREF (the $2$ above the second pivot is still there).\n\n**Correct (RREF):** Apply $R_1 \\to R_1 - 2R_2$ to get $\\left[\\begin{array}{cc|c}1&0&-1\\\\0&1&3\\end{array}\\right]$.\n\nREF requires back-substitution to read the solution; RREF lets you read it directly.`,
      },
      {
        type: 'warning',
        title: 'Free Variables Need a Parameter Name',
        body: 'When a variable $x_3$ is free, assign it a parameter: $x_3 = t \\in \\mathbb{R}$. Then express all pivot variables in terms of $t$. If there are two free variables, use $s$ and $t$. The solution set is $\\{\\mathbf{x}_p + s\\,\\mathbf{v}_1 + t\\,\\mathbf{v}_2 : s, t \\in \\mathbb{R}\\}$ — a translate of the null space.',
      },
      {
        type: 'insight',
        title: 'When to Use This',
        body: `Use RREF (Gauss-Jordan) when you need to:\n\n- **Read the solution directly** with no back-substitution — ideal for paper-and-pencil work\n- **Find all free variables** in a system — each non-pivot column is one\n- **Determine the rank** of a matrix — count the nonzero rows in RREF\n- **Test linear independence** of vectors — form a matrix with them as rows and check if RREF has all nonzero rows\n\nUse plain Gaussian elimination (REF only) when you just need a numerical solution quickly — it is slightly fewer operations. For code, use \`np.linalg.solve\` (faster, numerically stable) or \`sympy.Matrix.rref()\` (exact, shows work).`,
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
      title: '3×3 System — Full Gauss-Jordan to RREF',
      problem: 'Solve via RREF: $2x_1 + x_2 - x_3 = 8$, $-3x_1 - x_2 + 2x_3 = -11$, $-2x_1 + x_2 + 2x_3 = -3$.',
      steps: [
        {
          expression: '\\left[\\begin{array}{ccc|c}2&1&-1&8\\\\-3&-1&2&-11\\\\-2&1&2&-3\\end{array}\\right]',
          annotation: 'Write as augmented matrix $[A|\\mathbf{b}]$. The three coefficient columns correspond to $x_1$, $x_2$, $x_3$; the last column is the right-hand side $\\mathbf{b} = [8, -11, -3]^\\top$.',
          strategyTitle: 'Step 1: Form augmented matrix',
        },
        {
          expression: '\\xrightarrow{\\frac{1}{2}R_1} \\left[\\begin{array}{ccc|c}1&\\frac{1}{2}&-\\frac{1}{2}&4\\\\-3&-1&2&-11\\\\-2&1&2&-3\\end{array}\\right]',
          annotation: 'Scale row 1 by $\\frac{1}{2}$ so the first pivot (top-left entry) equals 1. Now the pivot variable $x_1$ has coefficient 1 in row 1, which makes the elimination multipliers below it exact integers.',
          strategyTitle: 'Step 2: Scale row 1 — first pivot = 1',
          hints: ['Having a leading 1 makes the elimination arithmetic simpler: the multiplier for row $i$ is exactly the $(i,1)$ entry.'],
        },
        {
          expression: '\\xrightarrow{R_2+3R_1,\\;R_3+2R_1} \\left[\\begin{array}{ccc|c}1&\\frac{1}{2}&-\\frac{1}{2}&4\\\\0&\\frac{1}{2}&\\frac{1}{2}&1\\\\0&2&1&5\\end{array}\\right]',
          annotation: 'Forward elimination on column 1: add 3 times row 1 to row 2 (the multiplier is $-(-3) = 3$), and 2 times row 1 to row 3 (the multiplier is $-(-2) = 2$). All entries below the first pivot are now zero.',
          strategyTitle: 'Step 3: Eliminate column 1 (forward pass)',
        },
        {
          expression: '\\xrightarrow{2R_2} \\left[\\begin{array}{ccc|c}1&\\frac{1}{2}&-\\frac{1}{2}&4\\\\0&1&1&2\\\\0&2&1&5\\end{array}\\right] \\xrightarrow{R_3-2R_2} \\left[\\begin{array}{ccc|c}1&\\frac{1}{2}&-\\frac{1}{2}&4\\\\0&1&1&2\\\\0&0&-1&1\\end{array}\\right]',
          annotation: 'Scale row 2 by 2 so the second pivot = 1, giving $x_2$ coefficient 1. Then subtract $2 \\times$ (scaled) row 2 from row 3 to zero out the column-2 entry in row 3. Row 3 becomes $[0,0,-1,1]$.',
          strategyTitle: 'Step 4: Second pivot — column 2',
        },
        {
          expression: '\\xrightarrow{-R_3} \\left[\\begin{array}{ccc|c}1&\\frac{1}{2}&-\\frac{1}{2}&4\\\\0&1&1&2\\\\0&0&1&-1\\end{array}\\right]',
          annotation: 'Scale row 3 by $-1$ to get the third pivot = 1. The matrix is now in Row Echelon Form (REF) — all pivots are 1 and zeros below each. The next step (back-elimination) is what makes it RREF.',
          strategyTitle: 'Step 5: Third pivot — column 3 (REF reached)',
        },
        {
          expression: '\\xrightarrow{R_2-R_3,\\;R_1+\\frac{1}{2}R_3} \\left[\\begin{array}{ccc|c}1&\\frac{1}{2}&0&\\frac{7}{2}\\\\0&1&0&3\\\\0&0&1&-1\\end{array}\\right] \\xrightarrow{R_1-\\frac{1}{2}R_2} \\left[\\begin{array}{ccc|c}1&0&0&2\\\\0&1&0&3\\\\0&0&1&-1\\end{array}\\right]',
          annotation: 'Back-eliminate: subtract row 3 from row 2 to zero out the $x_3$ entry above pivot 3. Add $\\frac{1}{2}$ row 3 to row 1. Then subtract $\\frac{1}{2}$ row 2 from row 1. RREF is $[I | \\mathbf{c}]$ — solution reads from the last column: $x_1 = 2$, $x_2 = 3$, $x_3 = -1$.',
          strategyTitle: 'Step 6: Back-eliminate to RREF → read solution',
          hints: ['Verify equation 1: $2(2) + 3 - (-1) = 4+3+1 = 8$ ✓. Equation 2: $-3(2) - 3 + 2(-1) = -6-3-2 = -11$ ✓. Equation 3: $-2(2) + 3 + 2(-1) = -4+3-2 = -3$ ✓'],
        },
      ],
      conclusion: 'Unique solution: $x_1 = 2$, $x_2 = 3$, $x_3 = -1$. The RREF is the identity matrix on the left — all three variables are pivot variables, confirming no free variables and exactly one solution.',
    },
    {
      id: 'la1-006-ex2',
      title: 'Detecting Inconsistency — the Contradiction Row',
      problem: 'Determine whether the system is consistent: $x + 2y = 3$, $2x + 4y = 7$, $3x + 6y = 9$.',
      steps: [
        {
          expression: '\\left[\\begin{array}{cc|c}1&2&3\\\\2&4&7\\\\3&6&9\\end{array}\\right]',
          annotation: 'Form the $3 \\times 3$ augmented matrix. Notice: the coefficient column vectors are $[1,2,3]^\\top$ and $[2,4,6]^\\top = 2[1,2,3]^\\top$ — they are proportional. All three coefficient rows are multiples of $[1,2]$, meaning every equation describes the same family of lines $x + 2y = k$.',
          strategyTitle: 'Step 1: Form augmented matrix — notice proportional rows',
          hints: ['Proportional coefficient rows with DIFFERENT right-hand sides always signal inconsistency.'],
        },
        {
          expression: '\\xrightarrow{R_2-2R_1,\\;R_3-3R_1} \\left[\\begin{array}{cc|c}1&2&3\\\\0&0&1\\\\0&0&0\\end{array}\\right]',
          annotation: 'Forward elimination: subtract $2 \\times$ row 1 from row 2, and $3 \\times$ row 1 from row 3. The left sides go to zero (as expected from proportional rows), but the right sides give $7 - 2(3) = 1$ and $9 - 3(3) = 0$. Row 2 becomes the contradiction row $[0\\ 0\\ |\\ 1]$.',
          strategyTitle: 'Step 2: Eliminate — contradiction appears in row 2',
        },
        {
          expression: '[0\\ 0\\ |\\ 1] \\quad \\text{reads as} \\quad 0x + 0y = 1 \\quad \\Rightarrow \\quad 0 = 1',
          annotation: 'The row translates to $0 = 1$ — false for any $(x,y)$. This is the definitive inconsistency test: a **pivot in the augmented column** (last column). Compare with row 3: $[0\\ 0\\ |\\ 0]$ reads $0 = 0$ — that row is harmless (redundant). The single contradiction row in row 2 kills the entire system.',
          strategyTitle: 'Step 3: Read the contradiction — no solution',
          hints: ['rank($A$) = 1 but rank($[A|\\mathbf{b}]$) = 2. Since $\\text{rank}([A|\\mathbf{b}]) > \\text{rank}(A)$, the system is inconsistent by the consistency theorem.'],
        },
      ],
      conclusion: 'The system is inconsistent — no solution exists. Geometrically, all three equations describe lines with the same slope, but equations 1 and 2 have different intercepts ($x+2y=3$ and $x+2y=7/2$). Parallel lines never intersect.',
    },
    {
      id: 'la1-006-ex3',
      title: 'Free Variables — Writing the General Solution',
      problem: 'Find all solutions to: $x_1 + 2x_2 - x_3 = 4$ and $x_3 = 2$.',
      steps: [
        {
          expression: '\\left[\\begin{array}{ccc|c}1&2&-1&4\\\\0&0&1&2\\end{array}\\right]',
          annotation: 'Write the $2 \\times 4$ augmented matrix. Column 1 has a pivot (the 1 in row 1). Column 2 has NO pivot entry — no row has a leading 1 in column 2. Column 3 has a pivot (the 1 in row 2). So: pivot variables are $x_1$ and $x_3$; free variable is $x_2$.',
          strategyTitle: 'Step 1: Identify pivots and free variables',
          hints: ['Pivot columns: 1 and 3. Free variable column: 2 (no leading 1 anywhere in column 2).'],
        },
        {
          expression: '\\xrightarrow{R_1+R_2} \\left[\\begin{array}{ccc|c}1&2&0&6\\\\0&0&1&2\\end{array}\\right]',
          annotation: 'Back-eliminate: add row 2 to row 1 to zero out the $-1$ entry above the second pivot in column 3. Now both pivot columns (1 and 3) have a leading 1 and zeros everywhere else — this is RREF.',
          strategyTitle: 'Step 2: Back-eliminate to reach RREF',
        },
        {
          expression: 'x_2 = t \\in \\mathbb{R} \\quad \\text{(free — assign parameter } t \\text{)}',
          annotation: 'Assign the free variable $x_2$ a parameter $t$. The parameter $t$ can be ANY real number. Every distinct value of $t$ gives a different solution — this is why the system has infinitely many.',
          strategyTitle: 'Step 3: Assign parameter to the free variable',
        },
        {
          expression: 'x_3 = 2, \\quad x_1 = 6 - 2x_2 = 6 - 2t',
          annotation: 'Read the pivot variables from RREF: row 2 gives $x_3 = 2$ directly. Row 1 gives $x_1 + 2t = 6$, so $x_1 = 6 - 2t$.',
          strategyTitle: 'Step 4: Express pivot variables in terms of t',
          hints: ['General solution in vector form: $\\begin{bmatrix}x_1\\\\x_2\\\\x_3\\end{bmatrix} = \\begin{bmatrix}6\\\\0\\\\2\\end{bmatrix} + t\\begin{bmatrix}-2\\\\1\\\\0\\end{bmatrix}$. The first vector is a particular solution ($t=0$); the second spans the null space of $A$.'],
        },
      ],
      conclusion: 'Infinitely many solutions. General solution: $(x_1, x_2, x_3) = (6-2t,\\ t,\\ 2)$ for $t \\in \\mathbb{R}$. The solution set is a line in $\\mathbb{R}^3$ — one degree of freedom (one free variable).',
    },
    {
      id: 'la1-006-ex4',
      title: 'REF vs RREF — Why the Extra Step Matters',
      problem: 'Given the augmented matrix $\\left[\\begin{array}{cc|c}2&4&10\\\\1&3&8\\end{array}\\right]$, first reach REF, then go all the way to RREF. Compare the reading effort.',
      steps: [
        {
          expression: '\\left[\\begin{array}{cc|c}2&4&10\\\\1&3&8\\end{array}\\right] \\xrightarrow{R_1 \\leftrightarrow R_2} \\left[\\begin{array}{cc|c}1&3&8\\\\2&4&10\\end{array}\\right]',
          annotation: 'Swap rows to get a leading 1 in position $(1,1)$ without fractions. The coefficient matrix $A$ has entries from the original system $2x + 4y = 10$ and $x + 3y = 8$.',
          strategyTitle: 'Step 1: Row swap to bring leading 1 to top',
        },
        {
          expression: '\\xrightarrow{R_2 - 2R_1} \\left[\\begin{array}{cc|c}1&3&8\\\\0&-2&-6\\end{array}\\right] \\xrightarrow{-\\frac{1}{2}R_2} \\left[\\begin{array}{cc|c}1&3&8\\\\0&1&3\\end{array}\\right]',
          annotation: 'Forward elimination: subtract $2 \\times$ row 1 from row 2 to zero out the $(2,1)$ entry. Then scale row 2 by $-\\frac{1}{2}$ so the second pivot = 1. **This is Row Echelon Form (REF)** — note the $3$ still above the second pivot.',
          strategyTitle: 'Step 2: Eliminate forward and scale — reach REF',
          hints: ['To read the solution from REF, you need back-substitution: row 2 gives $y = 3$, then substitute into row 1: $x + 3(3) = 8 \\Rightarrow x = -1$.'],
        },
        {
          expression: '\\xrightarrow{R_1 - 3R_2} \\left[\\begin{array}{cc|c}1&0&-1\\\\0&1&3\\end{array}\\right]',
          annotation: 'Back-eliminate: subtract $3 \\times$ row 2 from row 1 to zero out the $3$ above the second pivot. **This is RREF** — both pivot columns are identity columns $[1,0]^\\top$ and $[0,1]^\\top$. Read solution directly: $x_1 = -1$, $x_2 = 3$. No substitution needed.',
          strategyTitle: 'Step 3: Back-eliminate — reach RREF, read solution directly',
          hints: ['RREF advantage: one step to read the answer — just look at the last column. REF requires back-substitution. For large systems, this difference is significant.'],
        },
      ],
      conclusion: 'Solution: $x = -1$, $y = 3$. From RREF, the solution is immediate. From REF, you need back-substitution. Both give the same answer — RREF just removes the extra work.',
    },
  ],

  challenges: [
    {
      id: 'la1-006-ch1',
      title: 'Classify without solving',
      difficulty: 'medium',
      problem: 'Without fully reducing, determine whether the system with augmented matrix $\\left[\\begin{array}{ccc|c}1&2&3&4\\\\ 2&4&6&9\\\\ 3&6&9&12\\end{array}\\right]$ has 0, 1, or infinitely many solutions. Justify using rank arguments.',
      walkthrough: [
        '**Check the coefficient columns.** Look at the first three columns only. Row 2 = $2 \\times$ Row 1 and Row 3 = $3 \\times$ Row 1 (in the coefficient block). All three rows point in the same direction $[1, 2, 3]$ — the rank of the coefficient matrix $A$ is 1.',
        '**Apply elimination to the augmented column.** Compute $R_2 - 2R_1$: augmented entry = $9 - 2(4) = 1$. So row 2 becomes $[0, 0, 0 \\ | \\ 1]$. Compute $R_3 - 3R_1$: augmented entry = $12 - 3(4) = 0$. Row 3 becomes $[0, 0, 0 \\ | \\ 0]$.',
        '**Identify the contradiction row.** Row 2 is $[0, 0, 0 \\ | \\ 1]$, which reads $0 = 1$ — a contradiction. rank($[A|\\mathbf{b}]$) = 2 because the augmented column added an independent row. Since rank($[A|\\mathbf{b}]$) = 2 > rank($A$) = 1, the system is **inconsistent** by the consistency theorem.',
        '**Conclusion.** The system has **no solution**. Even though rows 1 and 3 are compatible with each other, row 2 contradicts row 1. A single contradiction row makes the entire system unsolvable.',
      ],
    },
    {
      id: 'la1-006-ch2',
      title: 'Build a rank-2 system with two outcomes',
      difficulty: 'hard',
      problem: 'Construct a $3 \\times 3$ coefficient matrix $A$ with rank 2. Then find two different right-hand sides $\\mathbf{b}_1$ and $\\mathbf{b}_2$ such that: (a) $A\\mathbf{x} = \\mathbf{b}_1$ is consistent with infinitely many solutions, and (b) $A\\mathbf{x} = \\mathbf{b}_2$ is inconsistent. Verify both by row-reducing the augmented matrices.',
      walkthrough: [
        '**Construct a rank-2 matrix.** Use $A = \\begin{bmatrix}1&0&1\\\\0&1&1\\\\1&1&2\\end{bmatrix}$. Row 3 = Row 1 + Row 2, so the rows are linearly dependent and rank($A$) = 2. There is 1 free variable (null space is 1-dimensional).',
        '**Find $\\mathbf{b}_1$ for infinitely many solutions.** Since $R_3 = R_1 + R_2$ in the coefficient matrix, we need $b_3 = b_1 + b_2$ to avoid a contradiction. Use $\\mathbf{b}_1 = [1, 2, 3]^\\top$ (since $3 = 1 + 2$). After reduction, no contradiction row appears — the system is consistent with 1 free variable.',
        '**Find $\\mathbf{b}_2$ for inconsistency.** Violate the dependency: set $b_3 \\neq b_1 + b_2$. Use $\\mathbf{b}_2 = [1, 2, 5]^\\top$ (since $5 \\neq 3$). After $R_3 - R_1 - R_2$, row 3 becomes $[0, 0, 0 \\ | \\ 5 - 1 - 2] = [0, 0, 0 \\ | \\ 2]$ — a contradiction row.',
        '**Verify with rank counts.** For $\\mathbf{b}_1$: rank($A$) = rank($[A|\\mathbf{b}_1]$) = 2 — consistent. For $\\mathbf{b}_2$: rank($[A|\\mathbf{b}_2]$) = 3 > rank($A$) = 2 — inconsistent.',
        '**Key insight.** A right-hand side $\\mathbf{b}$ is consistent iff $\\mathbf{b}$ is in the column space of $A$ (i.e., a linear combination of $A$\'s columns). Here, the column space is a plane in $\\mathbb{R}^3$; $\\mathbf{b}_1$ is in that plane, $\\mathbf{b}_2$ is not.',
      ],
    },
  ],

  semantics: {
    core: [
      { symbol: '\\text{RREF}', meaning: 'Reduced Row Echelon Form — every pivot is 1, zeros above and below each pivot, staircase advancing left to right' },
      { symbol: '\\text{rank}(A)', meaning: 'Number of pivot columns — equals the number of nonzero rows in RREF' },
      { symbol: '\\text{nullity}(A)', meaning: 'Number of free variable columns — equals n minus rank(A)' },
    ],
    bridges: ['systems-of-equations', 'null-space', 'column-space'],
  },

  spiral: {
    recoveryPoints: [
      { lessonId: 'la1-004', label: 'Systems of Linear Equations', note: 'RREF extends the Gaussian elimination introduced in la1-004. The key addition: back-elimination to zero out entries ABOVE pivots, not just below.' },
    ],
    futureLinks: [
      { lessonId: 'la2-004', label: 'Null Space and Column Space', note: 'The null space of A is the solution set of Ax = 0. RREF reveals it directly: free variable columns give the null space basis vectors.' },
      { lessonId: 'la6-004', label: 'Rank-Nullity Theorem', note: 'rank(A) + nullity(A) = n is the formal statement of the counting identity you observed here. It is one of the deepest results in linear algebra.' },
    ],
  },

  mentalModel: [
    'RREF is the canonical form — every matrix has exactly one RREF.',
    'Pivot column = determined variable. Non-pivot column = free variable.',
    'A row of [0…0|k≠0] is the inconsistency detector.',
    'REF requires back-substitution; RREF lets you read the solution directly.',
    'rank + nullity = n is the fundamental counting identity for column spaces.',
  ],

  checkpoints: [
    { id: 'cp-la1-006-1', question: 'What are the four conditions that define RREF?', answer: '(1) Leading entry in each row is 1. (2) All other entries in each pivot column are 0. (3) Each pivot is strictly right of the pivot above. (4) All-zero rows are at the bottom.' },
    { id: 'cp-la1-006-2', question: 'What does a row $[0\\ 0\\ 0\\ |\\ 5]$ in the augmented matrix tell you?', answer: 'The system is inconsistent — no solution exists. The row reads $0 = 5$, a contradiction that no values of the variables can satisfy.' },
    { id: 'cp-la1-006-3', question: 'How do you read the general solution when there is one free variable?', answer: 'Assign the free variable a parameter $t \\in \\mathbb{R}$. Express each pivot variable in terms of $t$ by reading its row in the RREF. The solution is a line: a particular solution plus $t$ times a null-space vector.' },
    { id: 'cp-la1-006-4', question: 'What is the difference between Gaussian elimination and Gauss-Jordan elimination?', answer: 'Gaussian elimination creates zeros only BELOW pivots (reaching REF). Gauss-Jordan creates zeros both ABOVE and BELOW every pivot (reaching RREF), so the solution can be read without back-substitution.' },
  ],

  assessment: { questions: [] },

  quiz: [
    {
      id: 'la1-006-q1',
      type: 'choice',
      text: 'A system has 4 equations and 6 unknowns. The coefficient matrix has rank 3. How many free variables are there?',
      options: ['1', '2', '3', '4'],
      answer: '3',
      hints: ['Free variables = (number of unknowns) − rank = 6 − 3 = 3.'],
      reviewSection: 'Math tab — RREF and rank',
    },
    {
      id: 'la1-006-q2',
      type: 'choice',
      text: 'After row reducing an augmented matrix, you get the row $[0\\ 0\\ 0\\ |\\ 5]$. What does this mean?',
      options: [
        'The system has a unique solution',
        'The system is inconsistent — no solution exists',
        '$x_3 = 5$',
        'There is a free variable in the system',
      ],
      answer: 'The system is inconsistent — no solution exists',
      hints: ['The row reads $0x_1 + 0x_2 + 0x_3 = 5$, i.e., $0 = 5$ — a contradiction. No values of $x$ can satisfy this.'],
      reviewSection: 'Intuition tab — three outcome cases',
    },
    {
      id: 'la1-006-q3',
      type: 'choice',
      text: 'What is the RREF of the 2×2 identity matrix?',
      options: [
        'The identity matrix itself — it is already in RREF',
        '[[1,1],[0,0]]',
        '[[0,1],[1,0]]',
        '[[2,0],[0,2]]',
      ],
      answer: 'The identity matrix itself — it is already in RREF',
      hints: ['The identity matrix already satisfies all four RREF conditions: leading 1s on the diagonal, zeros everywhere else, pivots advance left-to-right, no zero rows.'],
      reviewSection: 'Intuition tab — RREF definition',
    },
    {
      id: 'la1-006-q4',
      type: 'choice',
      text: 'What does Gauss-Jordan elimination do that ordinary Gaussian elimination does NOT?',
      options: [
        'It also eliminates entries ABOVE each pivot (back-elimination), producing RREF instead of REF',
        'It uses larger matrices',
        'It only works on square systems',
        'It avoids row swaps entirely',
      ],
      answer: 'It also eliminates entries ABOVE each pivot (back-elimination), producing RREF instead of REF',
      hints: ['Gaussian elimination zeros out entries only BELOW each pivot (forward pass), stopping at Row Echelon Form (REF). Gauss-Jordan continues with a back-elimination pass to also zero out entries ABOVE each pivot, reaching the fully reduced RREF.'],
      reviewSection: 'Intuition tab — three-step Gauss-Jordan process',
    },
    {
      id: 'la1-006-q5',
      type: 'choice',
      text: 'A consistent system $A\\mathbf{x} = \\mathbf{b}$ has rank($A$) = $n$, where $n$ is the number of unknowns. How many solutions does it have?',
      options: [
        'Exactly one solution',
        'Infinitely many solutions',
        'No solutions',
        'Two solutions',
      ],
      answer: 'Exactly one solution',
      hints: ['rank($A$) = $n$ means every column is a pivot column — there are no free variables. A consistent system with no free variables has a unique solution.'],
      reviewSection: 'Math tab — Solution Existence and Uniqueness',
    },
    {
      id: 'la1-006-q6',
      type: 'choice',
      text: 'In the RREF of a system, variable $x_3$ corresponds to a non-pivot column. This means:',
      options: [
        '$x_3$ is a free variable — it can take any real value, and other variables are expressed in terms of it',
        '$x_3$ must equal zero',
        '$x_3$ is undefined',
        'The system has no solution',
      ],
      answer: '$x_3$ is a free variable — it can take any real value, and other variables are expressed in terms of it',
      hints: ['A non-pivot column means no row "owns" that variable — it is unconstrained. Assign $x_3 = t$ for any real $t$, then express pivot variables in terms of $t$. The solution is a family parameterized by $t$.'],
      reviewSection: 'Intuition tab — Free Variables Need a Parameter Name',
    },
    {
      id: 'la1-006-q7',
      type: 'choice',
      text: 'You have a $3 \\times 5$ augmented matrix (3 equations, 4 unknowns). Its RREF has exactly 2 pivot columns among the coefficient columns. The system is consistent. How many free variables are there?',
      options: ['2', '1', '3', '4'],
      answer: '2',
      hints: ['Free variables = (number of unknowns) − (number of pivot columns) = 4 − 2 = 2. The solution is a 2-parameter family.'],
      reviewSection: 'Math tab — RREF and rank',
    },
  ],
};
