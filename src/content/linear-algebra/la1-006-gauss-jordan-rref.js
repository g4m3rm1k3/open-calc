export default {
  id: 'la1-006',
  slug: 'gauss-jordan-rref',
  chapter: 'la1',
  order: 6,
  title: 'Gauss-Jordan RREF Drill',
  subtitle: 'Master the full row-reduction algorithm — every possible outcome: unique solution, no solution, infinitely many.',
  tags: ['RREF', 'row reduction', 'Gauss-Jordan', 'pivot', 'free variable', 'augmented matrix', 'solution types'],
  aliases: 'reduced row echelon form RREF Gauss-Jordan elimination pivot column free variable unique solution inconsistent infinite solutions parametric',

  timeToComplete: 30,
  coreConcept: 'Gauss-Jordan elimination reduces any augmented matrix to RREF — a canonical form from which the solution (unique, none, or infinite) can be read directly without back-substitution.',
  prerequisites: ['la1-004'],
  nextLesson: 'la2-001',

  hook: {
    question: "You have a system of 4 equations in 5 unknowns. Before you start, can you predict how many solutions it will have — and why?",
    realWorldContext: "RREF is the universal algorithm for solving any linear system, finding the rank of any matrix, testing linear independence, and computing null spaces. Every major linear algebra software package (NumPy, MATLAB, Mathematica) uses a variant of this algorithm internally. A data scientist uses it when fitting models with too few observations. A robotics engineer uses it to find the joint angles that achieve a given end-effector position. The algorithm's three outputs — unique solution, no solution, infinite solutions — correspond directly to three geometric configurations you will encounter throughout your career.",
    previewVisualizationId: 'GaussianEliminationStepper',
  },

  intuition: {
    prose: [
      'Take the $2 \\times 2$ system: $2x + 4y = 10$ and $x + 3y = 8$. Gaussian elimination gets you to REF in two steps: you end up with $\\left[\\begin{array}{cc|c}1&3&8\\\\0&1&3\\end{array}\\right]$. That is Row Echelon Form \u2014 you still need to back-substitute ($y=3$ \u2192 $x=8-9=-1$). Gauss-Jordan goes one step further: apply $R_1 \\to R_1 - 3R_2$ to get $\\left[\\begin{array}{cc|c}1&0&-1\\\\0&1&3\\end{array}\\right]$. Now the solution reads directly from the last column: $x=-1$, $y=3$. No substitution. That one extra pass is the difference between REF and RREF.',
      '**The three-step Gauss-Jordan process:** (1) Forward elimination — create zeros below each pivot (same as Gaussian elimination). (2) Scale — divide each pivot row by its pivot so the pivot becomes 1. (3) Back-elimination — create zeros ABOVE each pivot as well. The resulting matrix is in RREF.',
      '**Pivot positions matter enormously.** A pivot column is a column that contains a leading 1 (after reduction) with zeros everywhere else in that column. A non-pivot column is a free variable column. The number of pivot columns equals the rank. The number of free variable columns equals the dimension of the null space (the nullity).',
      '**Three outcome cases:**',
      '**Predict before reading:** You are given the augmented matrix $\\left[\\begin{array}{ccc|c}1&2&3&4\\\\2&4&6&9\\\\3&6&9&12\\end{array}\\right]$. Look at the coefficient block (first three columns). All three rows are multiples of $[1,2,3]$. Without computing, predict: does this system have 0, 1, or infinitely many solutions? Write your answer before working through Challenge 1.',
      '• **Unique solution:** Every variable is a pivot variable (no free variables). The RREF augmented matrix looks like $[I | \\mathbf{c}]$.',
      '• **No solution:** A row of the form $[0\\ 0\\ \\cdots\\ 0\\ |\\ k]$ with $k \\neq 0$ appears — this is a contradiction.',
      '• **Infinitely many solutions:** There are free variables (non-pivot columns in the coefficient part) and no contradictions. The solution is a parametric family.',
      '**The "row of zeros" test is your diagnostic:** If you see $[0\\ 0\\ \\cdots\\ 0\\ |\\ k \\neq 0]$, the system is inconsistent. If you see only $[0\\ 0\\ \\cdots\\ 0\\ |\\ 0]$, the system is consistent with free variables.',
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Procedure: Gauss-Jordan Elimination (Full RREF)',
        body: 'Step 1. Form the augmented matrix $[A \\mid \\mathbf{b}]$.\nStep 2. Forward pass \u2014 for each column left to right:\n  a. If no nonzero entry in that column at or below current row: skip (free variable column).\n  b. Swap to bring the best nonzero entry to the current pivot row.\n  c. Scale: divide the pivot row by the pivot entry so pivot = 1.\n  d. Eliminate BELOW: subtract multiples of the pivot row from all rows BELOW.\nStep 3. Back pass \u2014 for each pivot row (bottom to top): eliminate ABOVE by subtracting multiples of the pivot row from all rows ABOVE.\nStep 4. Check the augmented column: any row $[0\\cdots 0 \\mid k \\ne 0]$ \u2192 INCONSISTENT.\nStep 5. Assign parameter $t$ to each free variable. Express pivot variables in terms of parameters.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 6 of 6 — Vectors & Spaces',
        body: '**Previous:** Lines and Planes — geometric picture of linear constraints.\n**This lesson:** Gauss-Jordan RREF — the complete algorithm for any linear system, from augmented matrix to solution.\n**Next (Chapter 2):** Matrices as Linear Transformations — the matrix not as a spreadsheet but as a function that warps space.',
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
        id: 'GaussianEliminationStepper',
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
              prose: [
                '`rref(A)` applies Gauss-Jordan elimination to the augmented matrix and returns the RREF directly. For a $3 \\times 3$ system with a unique solution, the result is $[I | \\mathbf{c}]$ — the $3 \\times 3$ identity on the left and the solution column on the right. You read the answer from the last column: row 1 gives $x_1$, row 2 gives $x_2$, row 3 gives $x_3$. No substitution step is needed.',
                'A unique solution requires every variable to be a pivot variable, which means `rank(A(:,1:3)) == 3` — all three coefficient columns have a leading 1 with zeros elsewhere. Change one right-hand side entry (e.g., set the last entry of $\\mathbf{b}$ to a value that contradicts the others) and watch the RREF change from $[I|\\mathbf{c}]$ to a contradiction row.',
              ],
              code: `% Unique solution: 3 equations, 3 unknowns
A = [2 1 -1 8; -3 -1 2 -11; -2 1 2 -3];
R = rref(A)
% Read off: x1=2, x2=3, x3=-1`,
            },
            {
              id: 2,
              cellTitle: 'Inconsistent system',
              prose: [
                '`rref([1 2 3 4; 2 4 6 9; 0 0 0 1])` produces a row of the form `[0 0 0 1]` — which reads $0x_1 + 0x_2 + 0x_3 = 1$, i.e., $0 = 1$. This is the inconsistency signature: a **pivot in the augmented column** (the last column). No combination of $x_1, x_2, x_3$ can satisfy $0 = 1$, so the system has no solution.',
                'Why does this happen algebraically? The first two equations have coefficient rows $[1\\ 2\\ 3]$ and $[2\\ 4\\ 6] = 2 \\times [1\\ 2\\ 3]$ — they are parallel planes. Equation 1 says $x_1 + 2x_2 + 3x_3 = 4$; equation 2 says the same combination equals $9/2 \\neq 4$. These planes never intersect. The third row `[0 0 0 1]` is the algebraic record of that impossibility — the elimination revealed the contradiction that was hidden in the original system.',
              ],
              code: `% Inconsistent system
A = [1 2 3 4; 2 4 6 9; 0 0 0 1];
R = rref(A)
% Row 3 becomes [0 0 0 | 1] — INCONSISTENT`,
            },
            {
              id: 3,
              cellTitle: 'Infinitely many solutions',
              prose: [
                '`rref([1 2 -1 3 9; 0 0 1 -2 5])` reduces to `[1 2 0 1 14; 0 0 1 -2 5]`. Columns 1 and 3 contain leading 1s with zeros elsewhere — they are **pivot columns** ($x_1$ and $x_3$ are determined). Columns 2 and 4 have no leading 1 anywhere — they are **free variable columns** ($x_2$ and $x_4$ are unconstrained). Free variables = unknowns - rank = 4 - 2 = 2.',
                'To write the general solution: assign parameters $x_2 = s$ and $x_4 = t$. Row 2 (pivot in column 3) gives $x_3 - 2t = 5$, so $x_3 = 5 + 2t$. Row 1 (pivot in column 1) gives $x_1 + 2s + t = 14$, so $x_1 = 14 - 2s - t$. Every pair $(s, t) \\in \\mathbb{R}^2$ produces a valid solution — this is a 2-parameter family. Verify by substituting back: all four unknowns satisfy both original equations for any $s$ and $t$.',
              ],
              code: `% Underdetermined: 2 equations, 4 unknowns
A = [1 2 -1 3 9; 0 0 1 -2 5];
R = rref(A)
% x2 and x4 are free variables`,
            },
            {
              id: 4,
              cellTitle: 'Challenge: rank, nullity, and solution type',
              prose: [
                '`rank(coeff)` counts pivot columns in the $3 \\times 3$ coefficient block — how many independent equations constrain the three unknowns. `rank(A)` does the same for the full augmented matrix including $\\mathbf{b}$. The three-way decision: if `r_aug > r_coeff`, appending $\\mathbf{b}$ added an independent row, meaning $\\mathbf{b}$ is outside the column space — **inconsistent**. If both equal `n_unknowns`, every variable is a pivot variable — **unique solution**. Otherwise — **infinitely many**, with `n_unknowns - r_coeff` free variables.',
                'The `if/elseif/else` block is the same decision tree you draw on paper, now automated. For this specific system, try changing the last column to `[3; 7; 11]` (so $b_3 = b_1 + b_2$): the system becomes consistent with a free variable. Try `[3; 7; 12]` (so $b_3 \\neq b_1 + b_2$): it becomes inconsistent. The single number `r_aug - r_coeff` tells you which case you are in.',
              ],
              code: `% Challenge: classify the system
A = [1 2 0 3; 2 4 1 7; 3 6 1 10];
coeff = A(:, 1:3);
n_unknowns = 3;

r_coeff = rank(coeff);
r_aug   = rank(A);

fprintf('rank(A) = %d\\n', r_coeff)
fprintf('rank([A|b]) = %d\\n', r_aug)
fprintf('unknowns = %d\\n', n_unknowns)

if r_aug > r_coeff
    disp('INCONSISTENT — no solution')
elseif r_coeff == n_unknowns
    disp('UNIQUE SOLUTION')
    R = rref(A);
    fprintf('x1=%g  x2=%g  x3=%g\\n', R(1,4), R(2,4), R(3,4))
else
    fprintf('INFINITE SOLUTIONS — %d free variable(s)\\n', n_unknowns - r_coeff)
    disp(rref(A))
end`,
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
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'SymPy RREF — exact computation, like working on paper',
              prose: [
                '`Matrix(A_aug.tolist())` converts the NumPy array to a SymPy Matrix, which uses exact rational arithmetic — no floating-point rounding. `A_aug.rref()` returns a tuple: the RREF matrix (with exact fractions) and a tuple of pivot column indices.',
                'Reading the output: `rref_matrix[0, 3]` is row 0, column 3 (the last column of the 3×4 augmented RREF). If the RREF looks like $[I | \\mathbf{c}]$ with the identity on the left, the solution is the right-hand column directly: `x1 = rref_matrix[0,3]`, `x2 = rref_matrix[1,3]`, `x3 = rref_matrix[2,3]`.',
                'The heatmap comparison shows the transformation from the original "messy" augmented matrix to the clean RREF. The identity structure on the left (blue 1s, white 0s) versus the mixed values on the right makes the "canonical form" property visual.',
              ],
              code: `from sympy import Matrix, Rational
import numpy as np
import matplotlib.pyplot as plt

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
print("\\nSolution: x1 =", rref_matrix[0,3],
      "  x2 =", rref_matrix[1,3],
      "  x3 =", rref_matrix[2,3])

# Visualize original vs RREF as heatmaps
A_np = np.array(A_aug.tolist(), dtype=float)
R_np = np.array(rref_matrix.tolist(), dtype=float)

fig, axes = plt.subplots(1, 2, figsize=(10, 3))
for ax, mat, title in [(axes[0], A_np, 'Original [A | b]'),
                        (axes[1], R_np, 'RREF [I | solution]')]:
    vmax = max(abs(mat).max(), 1)
    im = ax.imshow(mat, cmap='RdBu_r', aspect='auto', vmin=-vmax, vmax=vmax)
    ax.set_title(title, fontsize=11)
    ax.set_xticks(range(mat.shape[1]))
    ax.set_xticklabels(['x1','x2','x3','b'])
    ax.set_yticks(range(3))
    ax.set_yticklabels(['R1','R2','R3'])
    for r in range(mat.shape[0]):
        for c in range(mat.shape[1]):
            ax.text(c, r, f'{mat[r,c]:.1f}', ha='center', va='center',
                    fontsize=10, color='black', fontweight='bold')
    plt.colorbar(im, ax=ax, shrink=0.8)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: 'Three outcome cases — classify and solve',
              prose: [
                '`A.rank()` counts pivot columns in the RREF of $A$ alone — the number of independent equations. `Ab.rank()` does the same for the augmented matrix $[A|\\mathbf{b}]$. The three-way comparison `r_Ab > r_A` / `r_A == n` / `else` directly implements the consistency theorem: if appending $\\mathbf{b}$ raised the rank, $\\mathbf{b}$ is outside the column space of $A$ — the system is inconsistent. If ranks match and equal $n$, every column is a pivot column with no free variables — unique solution. If ranks match but are less than $n$, there are `n - r_A` free variables — infinitely many solutions.',
                'The bar chart makes the theorem visual: for a unique solution, all three bars (rank($A$), rank($[A|b]$), unknowns $n$) reach the same height. For inconsistency, the orange rank($[A|b]$) bar stands taller than the blue rank($A$) bar — the extra rank came from appending $\\mathbf{b}$, meaning $\\mathbf{b}$ is not in the column space. For infinite solutions, both rank bars match but fall short of the green $n$ bar — that vertical gap between blue/orange and green is the number of free variables.',
              ],
              code: `from sympy import Matrix
import numpy as np
import matplotlib.pyplot as plt

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
        print("-> INCONSISTENT: no solution (pivot in augmented column)")
    elif r_A == n:
        rref, _ = Ab.rref()
        sol = list(rref.col(-1))
        print(f"-> UNIQUE SOLUTION: {sol}")
    else:
        print(f"-> INFINITELY MANY: {n - r_A} free variable(s)")
        rref, pivots = Ab.rref()
        print("RREF:", rref)
    return None

print("=== Case 1: Unique solution ===")
classify_system(np.array([[2,1,-1],[-3,-1,2],[-2,1,2]]),
                np.array([[8],[-11],[-3]]))

print("\\n=== Case 2: Inconsistent ===")
classify_system(np.array([[1,2],[2,4]]), np.array([[3],[7]]))

print("\\n=== Case 3: Infinite solutions ===")
classify_system(np.array([[1,2,-1],[0,0,1]]), np.array([[4],[2]]))

# Summary bar chart: rank values for each case
fig, ax = plt.subplots(figsize=(7, 4))
cases = ['Case 1\\nUnique', 'Case 2\\nInconsistent', 'Case 3\\nInfinite']
rank_A   = [3, 1, 1]
rank_Ab  = [3, 2, 1]
unknowns = [3, 2, 3]
x = np.arange(len(cases))
w = 0.25
ax.bar(x - w, rank_A,   width=w, label='rank(A)',   color='steelblue',   alpha=0.8)
ax.bar(x,     rank_Ab,  width=w, label='rank([A|b])',color='darkorange',  alpha=0.8)
ax.bar(x + w, unknowns, width=w, label='n (unknowns)',color='green',      alpha=0.8)
ax.set_xticks(x); ax.set_xticklabels(cases, fontsize=10)
ax.set_ylabel('Count'); ax.set_title('Rank Analysis: Three Solution Cases', fontsize=12)
ax.legend(fontsize=9); ax.grid(True, axis='y', alpha=0.3)
ax.set_ylim(0, 5)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 3,
              cellTitle: 'Manual RREF — seeing each row operation',
              prose: [
                '`manual_rref` implements the three Gauss-Jordan phases directly. For each column (left to right, skipping the augmented column), it searches for a nonzero entry at or below `pivot_row` using `abs(A[r, col]) > 1e-10` (a small tolerance instead of exact zero to handle floating-point). It then swaps that row up, scales the pivot row by dividing `A[pivot_row] /= A[pivot_row, col]` so the leading entry becomes exactly 1, and finally loops `for r in range(rows)` — ALL rows, not just those below — to zero out every other entry in that column. That all-rows loop is the Gauss-Jordan addition: ordinary Gaussian elimination only loops over rows below the pivot.',
                'The printed output traces each of the three operations: "Swap R$i$ <-> R$j$" shows a row interchange, "Scale R$i$" shows the division step (pivot → 1), and "R$i$ <- R$i$ - factor * R$j$" shows the elimination step. Count the "Scale" lines — there is exactly one per pivot, so the count equals rank($A$). The before/after heatmap compresses the full operation sequence visually: after RREF, the left block (coefficient columns) shows the identity structure — one distinct "hot" cell per row on the diagonal, surrounded by white (zero) entries.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

def manual_rref(M):
    """Step-by-step RREF with printed intermediate states."""
    A = M.astype(float).copy()
    rows, cols = A.shape
    pivot_row = 0
    states = [A.copy()]

    for col in range(cols - 1):  # skip augmented column
        nonzero = None
        for r in range(pivot_row, rows):
            if abs(A[r, col]) > 1e-10:
                nonzero = r
                break
        if nonzero is None:
            continue

        if nonzero != pivot_row:
            A[[pivot_row, nonzero]] = A[[nonzero, pivot_row]]
            print(f"Swap R{pivot_row+1} <-> R{nonzero+1}:")
            print(A.round(4), "\\n")
            states.append(A.copy())

        A[pivot_row] /= A[pivot_row, col]
        print(f"Scale R{pivot_row+1} (pivot = 1):")
        print(A.round(4), "\\n")
        states.append(A.copy())

        for r in range(rows):
            if r != pivot_row and abs(A[r, col]) > 1e-10:
                A[r] -= A[r, col] * A[pivot_row]
                print(f"R{r+1} <- R{r+1} - factor * R{pivot_row+1}:")
                print(A.round(4), "\\n")
                states.append(A.copy())

        pivot_row += 1
    return A, states

M = np.array([[2, 1, -1, 8],
              [-3, -1, 2, -11],
              [-2, 1, 2, -3]])
print("Starting matrix:")
print(M, "\\n")
result, states = manual_rref(M)
print("Final RREF:", result.round(4))

# Visualize: show initial and final RREF as heatmaps
fig, axes = plt.subplots(1, 2, figsize=(10, 3))
for ax, mat, title in [(axes[0], M.astype(float), 'Original Augmented Matrix'),
                        (axes[1], result, 'After RREF')]:
    im = ax.imshow(mat, cmap='RdBu_r', aspect='auto',
                   vmin=-max(abs(mat.max()), abs(mat.min())),
                   vmax=max(abs(mat.max()), abs(mat.min())))
    ax.set_title(title, fontsize=11)
    ax.set_xticks(range(mat.shape[1]))
    ax.set_xticklabels([f'col {i+1}' if i < mat.shape[1]-1 else 'b' for i in range(mat.shape[1])])
    ax.set_yticks(range(mat.shape[0]))
    ax.set_yticklabels([f'R{i+1}' for i in range(mat.shape[0])])
    for r in range(mat.shape[0]):
        for c in range(mat.shape[1]):
            ax.text(c, r, f'{mat[r,c]:.1f}', ha='center', va='center',
                    fontsize=10, color='black', fontweight='bold')
    plt.colorbar(im, ax=ax)
plt.tight_layout()
plt.show()`,
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
      '**Geometric picture of the solution set.** The solution set of $A\\mathbf{x} = \\mathbf{b}$ is either empty, a single point, or an affine subspace. If $\\mathbf{x}_p$ is any particular solution and $N(A)$ is the null space (all $\\mathbf{x}$ with $A\\mathbf{x} = \\mathbf{0}$), the full solution set is $\\mathbf{x}_p + N(A)$. The RREF free variable columns give the null space basis directly: for each free variable $x_j$, set $x_j = 1$ and all other free variables to $0$, then read the pivot variables from RREF — that gives one null space basis vector. A unique solution means $N(A) = \\{\\mathbf{0}\\}$ (a single point); infinitely many means $N(A)$ is a positive-dimensional subspace (a line, plane, or higher).',
      '**Connection to LU decomposition and future methods.** RREF is conceptually central but rarely used in large-scale numerical computation. For numerical work, Gaussian elimination reaching only REF is used to compute the $LU$ decomposition $PA = LU$, where $P$ is a permutation, $L$ is lower triangular, and $U$ is upper triangular (REF). Two triangular solves then give $\\mathbf{x}$ in $O(n^2)$ additional operations, after the $O(n^3)$ factorization is stored and reused for multiple right-hand sides. RREF\'s power is conceptual: it reveals rank, null space, column dependencies, and solution structure in a canonical form. The Rank-Nullity Theorem (la6-004) formalizes the observation that (number of pivot columns) + (number of free columns) = $n$ — a counting identity that runs through all of linear algebra.',
    ],
    callouts: [
      {
        type: 'proof',
        title: 'Why RREF is Unique',
        body: 'Suppose $R$ and $S$ are both RREF matrices row-equivalent to $A$. Then $S = M R$ for some invertible $M$. Consider the pivot columns of $R$: they are the standard basis vectors $\\mathbf{e}_{i_1}, \\ldots, \\mathbf{e}_{i_r}$. The corresponding columns of $S = MR$ would be $M\\mathbf{e}_{i_1}, \\ldots, M\\mathbf{e}_{i_r}$. For $S$ to also be in RREF, these must be standard basis vectors. Proceeding column by column (left to right), one shows by induction that every leading 1 in $R$ corresponds to the same column position in $S$, and that all entries of $R$ and $S$ agree.',
      },
    ],
    visualizations: [
      {
        id: 'LinearSystemsStepperViz',
        title: 'Linear Systems & Row Reduction — Interactive Module',
        mathBridge: 'A four-tab module: Concept explains augmented matrices, EROs, REF vs RREF, and all three solution types; Stepper walks through Gaussian elimination step by step with preset systems (unique, ∞, no solution, CNC positioning) — pivot row highlighted in blue, elimination row in red; Real World shows a CNC controller solving encoder equations; Practice has four hand-worked problems with full answers.',
        caption: 'Step through every elementary row operation to reach RREF — see exactly which rows are active at each stage.',
      },
    ],
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
      id: 'la1-006-ch3',
      difficulty: 'easy',
      problem: 'Row-reduce the augmented matrix $\\left[\\begin{array}{cc|c}2&4&10\\\\1&3&8\\end{array}\\right]$ to RREF. Identify pivot columns and write the solution.',
      hint: 'Swap rows first to get a leading 1 without fractions. After the forward pass (zeros below pivots) you have REF — continue with back-elimination to zero out entries ABOVE the second pivot.',
      walkthrough: [
        { expression: 'R_1 \\leftrightarrow R_2:\\;\\left[\\begin{array}{cc|c}1&3&8\\\\2&4&10\\end{array}\\right]', annotation: 'Swap to bring a leading 1 to position (1,1). This avoids fractions from scaling row 1 by 1/2.' },
        { expression: 'R_2-2R_1:\\;\\left[\\begin{array}{cc|c}1&3&8\\\\0&-2&-6\\end{array}\\right]', annotation: 'Forward elimination: subtract 2 × row 1 from row 2. The entry below pivot 1 is now zero.' },
        { expression: '-\\tfrac{1}{2}R_2:\\;\\left[\\begin{array}{cc|c}1&3&8\\\\0&1&3\\end{array}\\right]', annotation: 'Scale row 2 so second pivot = 1. This is REF — note the 3 above the second pivot is still nonzero.' },
        { expression: 'R_1-3R_2:\\;\\left[\\begin{array}{cc|c}1&0&-1\\\\0&1&3\\end{array}\\right]', annotation: 'Back-eliminate: subtract 3 × row 2 from row 1. Both pivot columns are now identity columns — this is RREF. Read: x = −1, y = 3.' },
      ],
      answer: 'Unique solution: $x = -1$, $y = 3$. Both columns 1 and 2 are pivot columns — no free variables.',
    },
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
      { symbol: '[0\\;0\\;\\cdots\\;0\\mid k\\neq 0]', meaning: 'Contradiction row \u2014 reads 0=k, impossible; system is inconsistent' },
      { symbol: 'x_j = t_j', meaning: 'Assigning parameter t to free variable x_j \u2014 each free column generates one dimension of the solution family' },
    ],
    rulesOfThumb: [
      'Pivot in augmented column \u2192 inconsistent (no solution).',
      'Free variable columns = n \u2212 rank(A) \u2014 each adds one dimension to the solution family.',
      'RREF is unique: every matrix has exactly one RREF, regardless of the row operations used.',
      'REF only eliminates below pivots; RREF eliminates above too \u2014 always go to RREF to read answers directly.',
      'For code: sympy.Matrix.rref() for exact results; np.linalg.matrix_rank() to count pivots.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { lessonId: 'la1-004', label: 'Systems of Linear Equations', note: 'RREF extends the Gaussian elimination introduced in la1-004. The key addition: back-elimination to zero out entries ABOVE pivots, not just below.' },
    ],
    futureLinks: [
      { lessonId: 'la2-004', label: 'Null Space and Column Space', note: 'The null space of A is the solution set of Ax = 0. RREF reveals it directly: free variable columns give the null space basis vectors.' },
      { lessonId: 'la6-004', label: 'Rank-Nullity Theorem', note: 'rank(A) + nullity(A) = n is the formal statement of the counting identity you observed here. It is one of the deepest results in linear algebra.' },
      { lessonId: 'la2-001', label: 'Matrices as Transformations', note: 'Each elementary row operation corresponds to multiplying by an invertible matrix. The RREF process is secretly a product of elementary matrices \u2014 the algebraic machinery of Chapter 2 makes this precise.' },
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
    { id: 'cp-la1-006-1', label: 'Read: State the four conditions that define RREF', type: 'read' },
    { id: 'cp-la1-006-2', label: 'Read: Identify the three solution outcomes from a RREF augmented matrix', type: 'read' },
    { id: 'cp-la1-006-3', label: 'Read: Explain the difference between REF and RREF', type: 'read' },
    { id: 'cp-la1-006-4', label: 'Run: OpenMAT — reduce a system to RREF and classify', type: 'lab' },
    { id: 'cp-la1-006-5', label: 'Run: Python — SymPy rref() to classify all three solution cases', type: 'lab' },
    { id: 'cp-la1-006-6', label: 'Complete: Example 1 — full Gauss-Jordan on a 3×3 unique solution', type: 'example' },
    { id: 'cp-la1-006-7', label: 'Complete: Example 3 — identify free variables and write general solution', type: 'example' },
    { id: 'cp-la1-006-8', label: 'Attempt: Challenge 1 — classify system using rank without full reduction', type: 'challenge' },
  ],

  assessment: {
    questions: [
      {
        id: 'la1-006-assess-1',
        type: 'choice',
        text: 'A consistent system has 5 unknowns and rank(A) = 3. How many free variables are there?',
        options: ['2', '3', '5', '1'],
        answer: '2',
        hints: ['Free variables = n \u2212 rank(A) = 5 \u2212 3 = 2.'],
      },
      {
        id: 'la1-006-assess-2',
        type: 'choice',
        text: 'After row-reducing an augmented matrix you find the row $[0\\ 0\\ 0\\ |\\ 7]$. What does this tell you?',
        options: [
          'The system is inconsistent \u2014 no solution exists',
          'The variable $x_3 = 7$',
          'There is a free variable in the system',
          'The system has infinitely many solutions',
        ],
        answer: 'The system is inconsistent \u2014 no solution exists',
        hints: ['This row reads $0x_1 + 0x_2 + 0x_3 = 7$, i.e., $0 = 7$ \u2014 a contradiction. No values of $x$ can satisfy it. Compare with $[0\\ 0\\ 0\\ |\\ 0]$, which reads $0 = 0$ (harmless redundancy, not a contradiction).'],
      },
      {
        id: 'la1-006-assess-3',
        type: 'choice',
        text: 'What is the key difference between Row Echelon Form (REF) and Reduced Row Echelon Form (RREF)?',
        options: [
          'RREF has zeros above AND below each pivot; REF only has zeros below',
          'RREF uses only integer entries; REF allows fractions',
          'REF is unique for every matrix; RREF is not',
          'RREF only applies to square matrices',
        ],
        answer: 'RREF has zeros above AND below each pivot; REF only has zeros below',
        hints: ['Forward elimination creates zeros below each pivot \u2014 stopping there gives REF, which still requires back-substitution to read answers. Gauss-Jordan continues with a back-elimination pass to zero entries above each pivot too, giving RREF where the solution can be read directly from the last column.'],
      },
      {
        id: 'la1-006-assess-4',
        type: 'choice',
        text: 'A system has rank(A) = rank([A|b]) = 2 and 4 unknowns. How many solutions does it have?',
        options: [
          'Infinitely many \u2014 2 free variables',
          'Exactly one',
          'None',
          'Exactly two',
        ],
        answer: 'Infinitely many \u2014 2 free variables',
        hints: ['rank(A) = rank([A|b]) means the system is consistent (no contradiction row). rank(A) = 2 < n = 4, so free variables = 4 \u2212 2 = 2. A consistent system with any free variables always has infinitely many solutions \u2014 one solution per combination of parameter values.'],
      },
    ],
  },

  quiz: [
    {
      id: 'la1-006-quiz-1',
      type: 'choice',
      text: 'A system has 4 equations and 6 unknowns. The coefficient matrix has rank 3. How many free variables are there?',
      options: ['1', '2', '3', '4'],
      answer: '3',
      hints: ['Free variables = (number of unknowns) − rank = 6 − 3 = 3.'],
      reviewSection: 'Math tab — RREF and rank',
    },
    {
      id: 'la1-006-quiz-2',
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
      id: 'la1-006-quiz-3',
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
      id: 'la1-006-quiz-4',
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
      id: 'la1-006-quiz-5',
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
      id: 'la1-006-quiz-6',
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
      id: 'la1-006-quiz-7',
      type: 'choice',
      text: 'You have a $3 \\times 5$ augmented matrix (3 equations, 4 unknowns). Its RREF has exactly 2 pivot columns among the coefficient columns. The system is consistent. How many free variables are there?',
      options: ['2', '1', '3', '4'],
      answer: '2',
      hints: ['Free variables = (number of unknowns) − (number of pivot columns) = 4 − 2 = 2. The solution is a 2-parameter family.'],
      reviewSection: 'Math tab — RREF and rank',
    },
    {
      id: 'la1-006-quiz-8',
      type: 'choice',
      text: 'The RREF of the augmented matrix is $\\left[\\begin{array}{ccc|c}1&0&2&5\\\\0&1&-1&3\\\\0&0&0&0\\end{array}\\right]$. Which expression gives the general solution?',
      options: [
        '$x_1 = 5 - 2t,\\; x_2 = 3 + t,\\; x_3 = t$ for any $t \\in \\mathbb{R}$',
        '$x_1 = 5,\\; x_2 = 3,\\; x_3 = 0$',
        'No solution — a zero row is a contradiction',
        '$x_1 = 5 + 2t,\\; x_2 = 3 - t,\\; x_3 = 0$',
      ],
      answer: '$x_1 = 5 - 2t,\\; x_2 = 3 + t,\\; x_3 = t$ for any $t \\in \\mathbb{R}$',
      hints: ['Column 3 has no leading 1 — $x_3$ is free; assign $x_3 = t$. Row 1: $x_1 + 2t = 5 \\Rightarrow x_1 = 5 - 2t$. Row 2: $x_2 - t = 3 \\Rightarrow x_2 = 3 + t$. The zero row says $0 = 0$ — redundant, not a contradiction.'],
      reviewSection: 'Example 3 — Free Variables',
    },
    {
      id: 'la1-006-quiz-9',
      type: 'choice',
      text: 'A system has $\\text{rank}(A) = 2$ and $\\text{rank}([A|\\mathbf{b}]) = 3$. What can you conclude?',
      options: [
        'The system is inconsistent — no solution exists',
        'The system has exactly one solution',
        'The system has infinitely many solutions',
        'Need more information to decide',
      ],
      answer: 'The system is inconsistent — no solution exists',
      hints: ['The consistency theorem: a system is consistent iff $\\text{rank}(A) = \\text{rank}([A|\\mathbf{b}])$. Here rank jumped from 2 to 3 when $\\mathbf{b}$ was appended — $\\mathbf{b}$ is outside the column space of $A$.'],
      reviewSection: 'Math tab — Solution Existence and Uniqueness',
    },
    {
      id: 'la1-006-quiz-10',
      type: 'choice',
      text: 'You row-reduce two different augmented matrices for the same system and get different intermediate steps, but the same final RREF. Is this possible?',
      options: [
        'Yes — every matrix has a unique RREF regardless of which row operations are used',
        'No — different operations produce different RREFs',
        'Only if you use the same number of row swaps',
        'Only if the system has a unique solution',
      ],
      answer: 'Yes — every matrix has a unique RREF regardless of which row operations are used',
      hints: ['RREF uniqueness theorem: the RREF of a matrix is unique, no matter what sequence of elementary row operations is used to reach it. Different paths → same destination.'],
      reviewSection: 'Rigor tab — Why RREF is Unique',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'Stopping at Row Echelon Form (REF) is the same as reaching RREF.',
      whyStudentsThinkIt: 'Students see the staircase shape in REF and think the work is done — leading entries exist and zeros appear below pivots.',
      correctionExample: '$\\left[\\begin{array}{cc|c}1&2&5\\\\0&1&3\\end{array}\\right]$ is REF but NOT RREF — the 2 above the second pivot is still there. RREF requires $R_1 \\to R_1 - 2R_2$, giving $\\left[\\begin{array}{cc|c}1&0&-1\\\\0&1&3\\end{array}\\right]$ where $x=-1$ reads directly.',
      contrastCase: 'From REF you still need back-substitution ($y=3$, then $x=5-2(3)=-1$). From RREF you just read the last column directly. Both give $x=-1$, $y=3$.',
    },
    {
      falseBelief: 'A zero row $[0\\ 0\\ 0\\ |\\ 0]$ in the augmented matrix means no solution.',
      whyStudentsThinkIt: 'Students see zeros and think "something went wrong," confusing the harmless all-zero row with the contradiction row $[0\\ 0\\ 0\\ |\\ k \\neq 0]$.',
      correctionExample: 'The row $[0\\ 0\\ |\\ 0]$ reads $0x + 0y = 0$, i.e., $0 = 0$ — true for ALL values. It is redundant (one equation was a multiple of another). The row $[0\\ 0\\ |\\ 5]$ reads $0 = 5$ — THAT is the contradiction.',
      contrastCase: 'Zero row → redundant equation → free variable may exist. Contradiction row $[0 \\cdots 0 \\mid k \\neq 0]$ → inconsistent, no solution.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You need to find the null space of a 3×4 matrix A (all x such that Ax=0). Which tool applies?',
      competingTechniques: 'np.linalg.solve (for Ax=b with specific b) vs. RREF of [A|0] vs. np.linalg.det(A)',
      whyThisTechniqueWins: 'Set up [A|0] and compute RREF. Free variable columns directly yield null space basis vectors. np.linalg.solve only handles unique solutions; det only applies to square matrices and gives no vector information.',
    },
    {
      situation: 'Given 5 vectors in ℝ³, determine if they are linearly independent and identify any redundant ones.',
      competingTechniques: 'RREF of matrix with vectors as columns vs. compute a 5×5 determinant vs. visual inspection',
      whyThisTechniqueWins: 'Form a 3×5 matrix with the vectors as columns and compute RREF. Pivot columns are independent; non-pivot columns are linear combinations of earlier pivots. Determinants only work on square matrices and give a single number, not which vectors are redundant.',
    },
  ],

  debugging: [
    {
      commonError: 'Eliminating only below each pivot — stopping at REF instead of completing RREF.',
      symptom: 'Nonzero entries remain above pivot positions; reading the solution requires back-substitution that was skipped.',
      whyItHappened: 'Students learn forward elimination first and treat it as the complete algorithm, forgetting the back-elimination pass that zeroes entries ABOVE each pivot.',
      repairStrategy: 'After all pivots are set to 1 with zeros below, do a second pass from bottom to top: for each pivot row, subtract the appropriate multiple from every row above it. Verify: each pivot column should look exactly like an identity column (1 in one spot, 0 everywhere else).',
    },
    {
      commonError: 'Confusing pivot variables and free variables when writing the general solution.',
      symptom: 'The general solution fails verification — plugging the parameterized answer back into the original equations gives a nonzero result.',
      whyItHappened: 'Students sometimes express a pivot variable as the parameter or solve a free-variable column instead of the pivot column.',
      repairStrategy: 'Mark pivot columns first (columns with a leading 1 and all other entries 0). Free variables come from non-pivot columns — assign those the parameters ($t$, $s$). Then read each pivot variable from its row. Verify with $t=0$ (particular solution) and $t=1$.',
    },
  ],

  mastery: {
    targetLevel: 3,
    solveIndependently: 'Row-reduce any augmented matrix to RREF by hand, identify pivot and free columns, and write the complete general solution with parameters.',
    explainVerbally: 'Explain why a pivot in the augmented column signals no solution, why a zero row signals a free variable, and how RREF differs from REF.',
    detectIncorrectApplication: 'Identify when a student stops at REF instead of RREF, confuses free and pivot variables, or misreads a zero row as a contradiction.',
    transferToUnfamiliar: 'Use RREF to find a basis for the null space of a non-square matrix: compute RREF of [A|0] and extract the free-variable direction vectors.',
  },
};
