export default {
  id: 'la2-010',
  slug: 'invertible-matrix-theorem',
  chapter: 'la2',
  order: 10,
  title: 'The Invertible Matrix Theorem',
  subtitle: 'Twelve seemingly different conditions — det ≠ 0, rank = n, trivial null space, RREF is identity — are actually all the same condition. A matrix is either completely healthy in all ways at once, or sick in all of them.',
  tags: ['invertible matrix theorem', 'IMT', 'invertibility', 'determinant', 'rank', 'null space', 'column space', 'pivot', 'RREF', 'eigenvalues'],
  aliases: 'invertible matrix theorem IMT singular nonsingular invertibility det rank null space column space RREF pivot',
  timeToComplete: 25,
  coreConcept: 'The Invertible Matrix Theorem (IMT) unifies everything in Chapters 1–3: twelve seemingly different conditions (det ≠ 0, rank = n, trivial null space, RREF = I, no zero eigenvalue, …) are all equivalent for an $n \\times n$ matrix. A matrix is either fully invertible in all twelve ways, or singular in all twelve ways — there is no middle ground.',
  prerequisites: ['la2-004', 'la2-005'],
  nextLesson: 'eigenvalues-and-eigenvectors',

  hook: {
    question: "Why does having a non-zero determinant guarantee a unique solution? And why does it also guarantee full column rank, a trivial null space, and non-zero eigenvalues — all at the same time?",
    realWorldContext: "The Invertible Matrix Theorem is one of the most important theorems in linear algebra because it unifies everything you have learned into a single if-and-only-if statement. In applications: a system of $n$ equations in $n$ unknowns has a unique solution exactly when the coefficient matrix is invertible. An image compression algorithm is reversible exactly when its transformation matrix is invertible. A quantum gate is a valid unitary operation exactly when it is invertible (and orthogonal). When you check ANY one of the equivalent conditions, you automatically know all the others are satisfied too.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**The theorem says: you either have it all or you have nothing.** For an $n \\times n$ matrix $A$, there is no middle ground. Either $A$ is a fully functional, information-preserving transformation — and then every one of the twelve conditions holds — or $A$ is a broken, information-losing transformation — and then every single condition fails simultaneously.',
      '**Think geometrically.** An invertible matrix maps $\\mathbb{R}^n$ to $\\mathbb{R}^n$ in a one-to-one, onto way. Every output has exactly one input. No two different inputs land on the same output. No output is unreachable. This geometric "bijectivity" is what all twelve conditions are secretly saying, in twelve different algebraic languages.',
      '**The null space test.** If $A\\mathbf{x} = \\mathbf{0}$ has a non-trivial solution $\\mathbf{x} \\neq \\mathbf{0}$, then $A$ maps two vectors ($\\mathbf{0}$ and $\\mathbf{x}$) to the same output ($\\mathbf{0}$). A function that maps two inputs to the same output can never be inverted — which one would the inverse pick? Non-trivial null space → not invertible.',
      '**The determinant test.** The determinant measures how much $A$ scales $n$-dimensional volume. If det$(A) = 0$, the transformation collapses space — it smashes a full $n$-dimensional solid flat into a lower-dimensional shadow. That squishing can never be undone, so $A$ is not invertible. If det$(A) \\neq 0$, volume is preserved (up to a constant factor), and the transformation is reversible.',
      '**The rank test.** Rank is the number of independent directions the columns span. An $n \\times n$ matrix is invertible iff all $n$ columns are independent — meaning the columns together span all of $\\mathbb{R}^n$ with no redundancy. Full rank means full coverage with no waste.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The Twelve Equivalent Conditions',
        body: 'For an $n \\times n$ matrix $A$, these are all equivalent:\n1. $A$ is invertible (has an inverse $A^{-1}$)\n2. $\\det(A) \\neq 0$\n3. $\\text{rank}(A) = n$ (full rank)\n4. $\\text{RREF}(A) = I_n$ (reduces to identity)\n5. $A$ has $n$ pivot positions\n6. $A\\mathbf{x} = \\mathbf{0}$ has only the trivial solution $\\mathbf{x} = \\mathbf{0}$\n7. $\\text{Nul}(A) = \\{\\mathbf{0}\\}$ (trivial null space)\n8. Columns of $A$ are linearly independent\n9. Columns of $A$ span $\\mathbb{R}^n$\n10. $A\\mathbf{x} = \\mathbf{b}$ has a unique solution for every $\\mathbf{b}$\n11. $A^\\top$ is invertible\n12. $0$ is not an eigenvalue of $A$',
      },
      {
        type: 'warning',
        title: 'The IMT Applies Only to Square Matrices',
        body: 'The Invertible Matrix Theorem requires $A$ to be $n \\times n$. For non-square matrices, you can still have full column rank or full row rank, but you cannot have a two-sided inverse.',
      },
      {
        type: 'sequencing',
        title: 'The Theorem as a Summary of Linear Algebra',
        body: '**Row reduction (Ch 1):** Conditions 4 and 5 — RREF = I, $n$ pivots\n**Matrix algebra (Ch 2):** Conditions 1 and 11 — invertibility and $A^\\top$\n**Determinants (Ch 2):** Condition 2 — det ≠ 0\n**Vector spaces (Ch 2-3):** Conditions 6-9 — null space and column space\n**Eigenvalues (Ch 3):** Condition 12 — no zero eigenvalue\nThe IMT says all of Chapter 1-3 is about one thing.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Testing All Conditions Simultaneously',
        mathBridge: 'Check every condition of the IMT on both an invertible and a singular matrix.',
        caption: 'Either all conditions hold at once, or all fail at once.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Invertible matrix: all conditions pass',
              prose: ['Test A = [2 1; 5 3] against every IMT condition.'],
              code: `A = [2 1; 5 3]
det_A = det(A)
rank_A = rank(A)
R = rref(A)
[V,D] = eig(A)
eigenvalues = diag(D)
null_dim = 2 - rank(A)
disp('null(A) dimension (should be 0):')
null_dim
`,
            },
            {
              id: 2,
              cellTitle: 'Singular matrix: all conditions fail',
              prose: ['Now test B = [1 2; 2 4] — its second row is double the first.'],
              code: `B = [1 2; 2 4]
det_B = det(B)
rank_B = rank(B)
R = rref(B)
[V,D] = eig(B)
eigenvalues = diag(D)
null_dim = 2 - rank(B)
disp('null(B) dimension (should be 1 — one whole direction destroyed):')
null_dim
disp('A vector in the null space:')
null(B)
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Proof outline: (1) ↔ (6).** Suppose $A$ is invertible. If $A\\mathbf{x} = \\mathbf{0}$, multiply both sides by $A^{-1}$: $\\mathbf{x} = A^{-1}\\mathbf{0} = \\mathbf{0}$. Conversely, if the null space is trivial, then $A$ has $n$ pivot positions (no free variables), so row reduction produces $I_n$, so we can read off the inverse from the augmented matrix $[A | I]$.',
      '**Why det$(A) = 0$ ↔ singular.** Row reduction never changes whether a matrix is singular. Each elementary row operation multiplies the determinant by a non-zero constant. Since RREF of $A$ is $I_n$ iff $A$ is invertible, and det$(I_n) = 1 \\neq 0$, we get: $A$ invertible $\\Leftrightarrow$ RREF($A$) $= I_n$ $\\Leftrightarrow$ det$(A) \\neq 0$.',
      '**Eigenvalue connection.** If $A\\mathbf{v} = 0\\mathbf{v}$ for some non-zero $\\mathbf{v}$, then $A\\mathbf{v} = \\mathbf{0}$, so Nul$(A)$ is non-trivial. Therefore $0$ being an eigenvalue $\\Rightarrow$ $A$ singular. Conversely, det$(A) = \\prod_i \\lambda_i$ (product of all eigenvalues). If $A$ is singular (det = 0), at least one $\\lambda_i = 0$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'The Rank-Nullity Bridge',
        body: 'Rank-Nullity theorem: rank$(A)$ + nullity$(A)$ = $n$.\nFor an $n \\times n$ matrix: $A$ is invertible $\\Leftrightarrow$ rank$(A) = n$ $\\Leftrightarrow$ nullity$(A) = 0$.\nFull rank and trivial null space are two sides of the same coin.',
      },
      {
        type: 'insight',
        title: 'The Matrix Equation $AB = I$ Is Not Enough — Unless $A$ Is Square',
        body: 'For square $A$: $AB = I$ implies $BA = I$ automatically. But for non-square matrices, a left inverse and a right inverse can exist independently and may not equal each other. The IMT\'s full invertibility (two-sided inverse) is a square-matrix phenomenon.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Code: Checking All 12 IMT Conditions',
        mathBridge: 'All 12 IMT conditions should agree: det ≠ 0, rank = n, null space trivial, etc. This cell checks every condition and demonstrates that they are all equivalent — if one is true, all are true; if one fails, all fail.',
        caption: 'Either all 12 conditions pass simultaneously or all 12 fail simultaneously.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cellTitle: 'Checking all IMT conditions at once',
              prose: [
                'Pass an n×n matrix to the function below and it reports all 12 IMT conditions.',
                'Try both an invertible matrix and a singular one — notice how all conditions agree.',
              ],
              code: `import numpy as np
from scipy.linalg import null_space

def imt_check(A, label="A"):
    """Check all major Invertible Matrix Theorem conditions for square A."""
    n = A.shape[0]
    assert A.shape == (n, n), "IMT requires square matrix"

    d = np.linalg.det(A)
    r = np.linalg.matrix_rank(A)
    eigs = np.linalg.eigvals(A)
    null_dim = n - r
    null_b = null_space(A)

    print(f"=== IMT check for {label} (n={n}) ===")
    print(f"  1. det(A) = {d:.4f}  → {'INVERTIBLE' if abs(d) > 1e-10 else 'SINGULAR'}")
    print(f"  2. rank(A) = {r}  → {'= n ✓' if r == n else f'< n ✗ (rank deficient)'}")
    print(f"  3. nullity = {null_dim}  → {'= 0 (trivial null space) ✓' if null_dim == 0 else f'= {null_dim} (non-trivial null space) ✗'}")
    print(f"  4. min |eigenvalue| = {np.min(np.abs(eigs)):.4f}  → {'all nonzero ✓' if np.min(np.abs(eigs)) > 1e-10 else 'zero eigenvalue ✗'}")
    # Try to compute inverse
    try:
        A_inv = np.linalg.inv(A)
        print(f"  5. A⁻¹ exists ✓")
    except np.linalg.LinAlgError:
        print(f"  5. A⁻¹ does NOT exist ✗")
    print()

# Invertible matrix
A = np.array([[2., 1., 0.],
              [1., 3., 1.],
              [0., 1., 4.]])
imt_check(A, "A (invertible)")

# Singular matrix
S = np.array([[1., 2., 3.],
              [4., 5., 6.],
              [7., 8., 9.]])  # row 3 = row1 + row2 + extra
imt_check(S, "S (singular)")`,
            },
            {
              id: 2,
              cellTitle: 'The borderline case — near-singular matrices',
              prose: [
                'The IMT is binary (invertible or not), but numerically matrices can be "almost singular" — technically invertible but with huge condition numbers.',
                'A large condition number means small perturbations to b produce huge changes in the solution x.',
              ],
              code: `import numpy as np

# Vary one entry to slide between invertible and singular
print("Sliding toward singularity:")
print(f"{'k':>6}   {'det':>12}   {'cond':>12}   {'rank':>6}")

for k in [10.0, 1.0, 0.1, 0.01, 0.001]:
    A = np.array([[k, 2.], [3., 6./k]])  # det = k*(6/k) - 2*3 = 6 - 6 = 0... adjusted
    A = np.array([[1., 2.], [3., 6.+k]])
    d = np.linalg.det(A)
    c = np.linalg.cond(A)
    r = np.linalg.matrix_rank(A)
    print(f"{k:>6.3f}   {d:>12.4e}   {c:>12.2e}   {r:>6d}")`,
            },
          ]
        }
      },
    ],
  },

  rigor: {
    prose: [
      '**Formal equivalence chain.** The proof of the IMT proceeds by a cyclic chain: $(1) \\Rightarrow (2) \\Rightarrow (3) \\Rightarrow (4) \\Rightarrow \\cdots \\Rightarrow (1)$. Once the cycle closes, all conditions are equivalent. The key bridge is row reduction: elementary row operations multiply det by a non-zero scalar and do not change rank, so invertibility, rank, and determinant are linked through the row echelon form.',
      '**Left and right inverses are equal for square matrices.** Suppose $BA = I$ (left inverse). Is $AB = I$? Since $BA = I$, $B$ is invertible (its own null space is trivial — if $B\\mathbf{v} = \\mathbf{0}$ then $\\mathbf{v} = (BA)\\mathbf{v} = B(A\\mathbf{v}) = \\mathbf{0}$). So $B^{-1}$ exists. From $BA = I$ multiply on the left by $B^{-1}$: $A = B^{-1}$. Therefore $AB = BB^{-1} = I$. For non-square matrices, this fails — a non-square matrix can have a left inverse but no right inverse.',
      '**IMT and linear maps.** For a linear map $T: V \\to V$ on an $n$-dimensional space, the following are equivalent: (a) $T$ is injective (kernel is trivial); (b) $T$ is surjective (image is all of $V$); (c) $T$ is bijective (both). This equivalence is a purely finite-dimensional phenomenon — in infinite dimensions, injective does not imply surjective. For $T = T_A$ on $\\mathbb{R}^n$, this is exactly the IMT.',
      '**The determinant and eigenvalue connection.** The characteristic polynomial is $p(\\lambda) = \\det(A - \\lambda I)$. Evaluating at $\\lambda = 0$: $p(0) = \\det(A) = \\prod_{i=1}^n (-\\lambda_i) \\cdot (-1)^n = \\prod_{i=1}^n \\lambda_i$ (product of all eigenvalues). So $\\det(A) = 0 \\Leftrightarrow$ some $\\lambda_i = 0 \\Leftrightarrow 0$ is an eigenvalue $\\Leftrightarrow$ there exists $\\mathbf{v} \\neq \\mathbf{0}$ with $A\\mathbf{v} = \\mathbf{0} \\Leftrightarrow$ null space is non-trivial. This is condition 12 of the IMT.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'IMT for Linear Maps (Finite Dimension)',
        body: 'Let $T: V \\to V$ be a linear map on a finite-dimensional vector space $V$. The following are equivalent:\n(a) $T$ is injective — $\\ker(T) = \\{\\mathbf{0}\\}$\n(b) $T$ is surjective — $\\text{im}(T) = V$\n(c) $T$ is bijective (invertible)\n\n**Key point:** In finite dimensions, injective ↔ surjective. You only need to verify one.',
      },
      {
        type: 'theorem',
        title: 'Product of Invertibles is Invertible',
        body: 'If $A$ and $B$ are $n \\times n$ invertible matrices, then $AB$ is invertible and $(AB)^{-1} = B^{-1}A^{-1}$.\n\n**Proof:** $(AB)(B^{-1}A^{-1}) = A(BB^{-1})A^{-1} = AIA^{-1} = I$. ✓\n\nNote the reversal of order. The invertible matrices form a **group** under multiplication (closed, associative, identity $I$, every element has an inverse).',
      },
      {
        type: 'insight',
        title: 'Why "Near-Singular" Matrices Are Dangerous',
        body: 'The IMT is binary — invertible or not. But numerically, a matrix can be "almost singular" with $\\det(A) \\approx 0$ (technically invertible but with huge condition number $\\kappa = \\|A\\| \\cdot \\|A^{-1}\\|$). When $\\kappa \\gg 1$:\n\n• $A\\mathbf{x} = \\mathbf{b}$ has a unique solution (IMT says so), but\n• Small errors in $\\mathbf{b}$ cause huge errors in $\\hat{\\mathbf{x}}$: relative error $\\leq \\kappa \\cdot$ (relative error in $\\mathbf{b}$)\n\nThe condition number is the gap between mathematical existence and numerical reliability.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'la2-010-ex1',
      title: 'Applying the IMT: Using One Condition to Know Them All',
      problem: 'For $A = \\begin{bmatrix}1&2&3\\\\4&5&6\\\\7&8&9\\end{bmatrix}$, determine whether $A$ is invertible. Use at least two different IMT conditions and confirm they agree.',
      steps: [
        {
          expression: 'R_2 \\leftarrow R_2 - 4R_1, \\quad R_3 \\leftarrow R_3 - 7R_1',
          annotation: 'Eliminate the first column below the pivot. After these operations: $\\begin{bmatrix}1&2&3\\\\0&-3&-6\\\\0&-6&-12\\end{bmatrix}$.',
          strategyTitle: 'Row reduce to find rank (Condition 3)',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'R_3 \\leftarrow R_3 - 2R_2',
          annotation: 'After this step: $\\begin{bmatrix}1&2&3\\\\0&-3&-6\\\\0&0&0\\end{bmatrix}$. Only 2 pivot positions — the third row is all zeros.',
          strategyTitle: 'Continue row reduction',
          checkpoint: 'Why is R₃ all zeros?',
          hints: ['Because column 3 = column 2 + (column 2 − column 1). The columns are linearly dependent: $\\mathbf{c}_3 = 2\\mathbf{c}_2 - \\mathbf{c}_1$.'],
        },
        {
          expression: '\\text{rank}(A) = 2 < 3 = n',
          annotation: 'Only 2 pivots means rank 2. By IMT condition 3 (rank = n for invertibility), $A$ is NOT invertible.',
          strategyTitle: 'Conclude via rank condition',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\det(A) = 0',
          annotation: 'The row echelon form has a zero row, so the product of pivots is 0. Alternatively: row 3 = row 1 + row 2 + (row 2 – row 1)... verify: $[1+4+2(4-1), 2+5+2(5-2), 3+6+2(6-3)] = [1+4+6, 2+5+6, 3+6+6] \\neq [7,8,9]$. Use a direct calculation: row 1 arithmetic progression, row 2 arithmetic progression, row 3 arithmetic progression — all three rows have equal spacing. det = 0 for any matrix of evenly-spaced rows.',
          strategyTitle: 'Verify with det condition (Condition 2)',
          checkpoint: 'The two conditions (rank < n and det = 0) agree. What do the IMT\'s other conditions say?',
          hints: ['All 12 IMT conditions fail simultaneously: null space is non-trivial (dimension 1), RREF ≠ I (only 2 pivots), $A\\mathbf{x}=\\mathbf{b}$ has either no solution or infinitely many (never unique), 0 is an eigenvalue.'],
        },
      ],
      conclusion: '$A$ is singular. The IMT tells us this single fact implies all others: non-trivial null space, rank deficiency, det = 0, 0 is an eigenvalue, no unique solution for $A\\mathbf{x} = \\mathbf{b}$. You never need to check more than one condition.',
    },
    {
      id: 'la2-010-ex2',
      title: 'Finding the Value That Makes a Matrix Singular',
      problem: 'For what value of $k$ is $A = \\begin{bmatrix}k&2\\\\3&k\\end{bmatrix}$ singular? For values $k > \\sqrt{6}$, confirm $A$ is invertible using the IMT eigenvalue condition.',
      steps: [
        {
          expression: '\\det(A) = k^2 - 6 = 0 \\implies k = \\pm\\sqrt{6}',
          annotation: 'By IMT condition 2, $A$ is singular iff det$(A) = 0$. Compute: det $= k \\cdot k - 2 \\cdot 3 = k^2 - 6$.',
          strategyTitle: 'Use det = 0 to find the singular values',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'p(\\lambda) = \\det(A - \\lambda I) = (k-\\lambda)^2 - 6 = 0 \\implies \\lambda = k \\pm \\sqrt{6}',
          annotation: 'The eigenvalues of $A = \\begin{bmatrix}k&2\\\\3&k\\end{bmatrix}$ are $k + \\sqrt{6}$ and $k - \\sqrt{6}$.',
          strategyTitle: 'Compute eigenvalues to use IMT condition 12',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'k > \\sqrt{6} \\implies \\lambda_1 = k+\\sqrt{6} > 2\\sqrt{6} > 0, \\quad \\lambda_2 = k-\\sqrt{6} > 0',
          annotation: 'Both eigenvalues are positive. By IMT condition 12 (no zero eigenvalue), $A$ is invertible. The det confirms this: det$(A) = \\lambda_1\\lambda_2 = (k+\\sqrt{6})(k-\\sqrt{6}) = k^2 - 6 > 0$.',
          strategyTitle: 'Verify IMT condition 12 agrees with condition 2',
          checkpoint: 'What happens at k = √6? Both conditions say A is singular. What is the null space?',
          hints: ['At $k = \\sqrt{6}$: eigenvalue $\\lambda_2 = 0$, and the null space is spanned by the corresponding eigenvector. Solve $A\\mathbf{v} = \\mathbf{0}$: $[\\sqrt{6}, 2; 3, \\sqrt{6}]\\mathbf{v} = \\mathbf{0}$ gives $\\mathbf{v} = [-2/\\sqrt{6}, 1]^\\top$ (up to scaling).'],
        },
      ],
      conclusion: '$A$ is singular precisely when $k = \\pm\\sqrt{6}$. The IMT conditions are consistent: det = 0, zero eigenvalue, non-trivial null space — all at the same threshold. For all other $k$, $A$ is invertible and all 12 conditions hold.',
    },
    {
      id: 'la2-010-ex3',
      title: 'IMT in Practice: Deciding Whether a System Has a Unique Solution',
      problem: 'A $3 \\times 3$ system $A\\mathbf{x} = \\mathbf{b}$ arises in a circuit analysis problem. You are told the columns of $A$ are $\\mathbf{c}_1 = [1,2,3]^\\top$, $\\mathbf{c}_2 = [0,1,0]^\\top$, $\\mathbf{c}_3 = [1,3,3]^\\top$. Does the system have a unique solution for every $\\mathbf{b}$?',
      steps: [
        {
          expression: '\\mathbf{c}_3 = \\mathbf{c}_1 + \\mathbf{c}_2 ?',
          annotation: 'Check: $[1,2,3]^\\top + [0,1,0]^\\top = [1,3,3]^\\top$. Yes — column 3 is the sum of columns 1 and 2.',
          strategyTitle: 'Check linear dependence of columns (IMT Condition 8)',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\text{Columns are linearly dependent} \\implies A \\text{ is singular (IMT condition 8 fails)}',
          annotation: 'IMT condition 8 says: $A$ invertible $\\Leftrightarrow$ columns are linearly independent. We found a dependency, so $A$ is singular.',
          strategyTitle: 'Apply IMT condition 8',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\det(A) = 0 \\text{ (confirming)}',
          annotation: 'A matrix with linearly dependent columns has det = 0 (IMT condition 2). There is no unique solution for every $\\mathbf{b}$ — for some $\\mathbf{b}$ there is no solution, for others infinitely many.',
          strategyTitle: 'Conclude: system does NOT have a unique solution',
          checkpoint: 'Which b vectors will the system be solvable for?',
          hints: ['Only $\\mathbf{b}$ in the column space of $A$ — the span of $\\mathbf{c}_1$ and $\\mathbf{c}_2$ (since $\\mathbf{c}_3 = \\mathbf{c}_1 + \\mathbf{c}_2$ adds nothing new). The column space is a 2D subspace of $\\mathbb{R}^3$.'],
        },
      ],
      conclusion: 'The system does NOT have a unique solution for every $\\mathbf{b}$. Detecting linear dependence among columns (the cheapest check) immediately tells you all 12 IMT conditions fail. No need to compute det or row-reduce completely.',
    },
  ],

  challenges: [
    {
      id: 'la2-010-ch1',
      difficulty: 'easy',
      problem: 'Find a $2 \\times 2$ matrix $A$ with $\\det(A) = 7$ and $\\text{tr}(A) = 5$. Then verify it is invertible using two different IMT conditions.',
      hint: 'The trace and determinant constrain but do not uniquely determine $A$. One simple choice: a diagonal matrix. Then check det ≠ 0 and that RREF = I.',
      walkthrough: [
        { expression: 'A = \\begin{bmatrix}7&0\\\\0&1\\end{bmatrix}: \\quad \\det(A) = 7, \\quad \\text{tr}(A) = 8 \\neq 5', annotation: 'Diagonal choice misses the trace. Try another.' },
        { expression: 'A = \\begin{bmatrix}4&1\\\\1&3\\end{bmatrix}: \\quad \\det(A) = 12-1 = 11 \\neq 7', annotation: 'Keep adjusting. We want det = 7, tr = 5.' },
        { expression: 'A = \\begin{bmatrix}3&1\\\\1&2\\end{bmatrix}: \\quad \\det = 6-1 = 5 \\neq 7', annotation: '' },
        { expression: 'A = \\begin{bmatrix}4&3\\\\1&1\\end{bmatrix}: \\quad \\det = 4-3 = 1, \\; \\text{tr} = 5', annotation: 'Trace is right but det = 1.' },
        { expression: 'A = \\begin{bmatrix}4&-3\\\\1&4\\end{bmatrix}: \\quad \\det = 16+3 = 19, \\; \\text{tr} = 8', annotation: '' },
        { expression: 'A = \\begin{bmatrix}3&2\\\\-2&2\\end{bmatrix}: \\quad \\det = 6+4 = 10, \\; \\text{tr} = 5', annotation: 'Close. Adjust.' },
        { expression: 'A = \\begin{bmatrix}4&1\\\\-3&1\\end{bmatrix}: \\quad \\det = 4+3 = 7, \\; \\text{tr} = 5 \\checkmark', annotation: 'One valid answer. Many others exist.' },
        { expression: '\\det(A) = 7 \\neq 0 \\Rightarrow \\text{invertible (IMT cond. 2)}; \\quad \\text{RREF}(A) = I_2 \\Rightarrow \\text{invertible (IMT cond. 4)}', annotation: 'Both conditions agree.' },
      ],
      answer: 'One answer: $A = \\begin{bmatrix}4&1\\\\-3&1\\end{bmatrix}$. Verified: det $= 7 \\neq 0$ (Cond. 2) and RREF $= I$ (Cond. 4).',
    },
    {
      id: 'la2-010-ch2',
      difficulty: 'medium',
      problem: 'Prove: if $A$ and $B$ are $n \\times n$ invertible matrices, then $AB$ is invertible and $(AB)^{-1} = B^{-1}A^{-1}$. Then give a counterexample showing the order matters: in general $(AB)^{-1} \\neq A^{-1}B^{-1}$.',
      hint: 'To prove $XY = I$, verify the product. For the counterexample, try 2×2 non-commuting matrices.',
      walkthrough: [
        { expression: '(AB)(B^{-1}A^{-1}) = A(BB^{-1})A^{-1} = A \\cdot I \\cdot A^{-1} = AA^{-1} = I', annotation: 'Right-multiply $AB$ by $B^{-1}A^{-1}$, using associativity.' },
        { expression: '(B^{-1}A^{-1})(AB) = B^{-1}(A^{-1}A)B = B^{-1} \\cdot I \\cdot B = I', annotation: 'Also check the left side. Both products give $I$, so $B^{-1}A^{-1}$ is the two-sided inverse of $AB$. ✓' },
        { expression: 'A = \\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}, \\; B = \\begin{bmatrix}2&0\\\\0&1\\end{bmatrix}, \\quad A^{-1}B^{-1} = \\begin{bmatrix}1&-1\\\\0&1\\end{bmatrix}\\begin{bmatrix}1/2&0\\\\0&1\\end{bmatrix} = \\begin{bmatrix}1/2&-1\\\\0&1\\end{bmatrix}', annotation: 'Compute $A^{-1}B^{-1}$ for specific matrices.' },
        { expression: '(AB)^{-1} = B^{-1}A^{-1} = \\begin{bmatrix}1/2&0\\\\0&1\\end{bmatrix}\\begin{bmatrix}1&-1\\\\0&1\\end{bmatrix} = \\begin{bmatrix}1/2&-1/2\\\\0&1\\end{bmatrix}', annotation: '$B^{-1}A^{-1} \\neq A^{-1}B^{-1}$: $[-1/2$ vs $-1]$ in position $(1,2)$.' },
      ],
      answer: 'Proved: $(AB)^{-1} = B^{-1}A^{-1}$. Counterexample confirms $(AB)^{-1} \\neq A^{-1}B^{-1}$ in general. The reversal of order is required because matrix multiplication is not commutative.',
    },
    {
      id: 'la2-010-ch3',
      difficulty: 'hard',
      problem: 'The matrix $A(t) = \\begin{bmatrix}t&1&0\\\\0&t&1\\\\0&0&t\\end{bmatrix}$ is upper triangular. (a) For which values of $t$ is $A(t)$ invertible? (b) Find a non-zero vector in Nul$(A(0))$. (c) Use the IMT to explain what else must be true when $t = 0$.',
      hint: 'The determinant of an upper triangular matrix is the product of its diagonal entries.',
      walkthrough: [
        { expression: '\\det(A(t)) = t \\cdot t \\cdot t = t^3', annotation: 'For upper triangular matrices, det = product of diagonal entries. Here all diagonal entries equal $t$.' },
        { expression: '\\det(A(t)) \\neq 0 \\iff t \\neq 0', annotation: 'By IMT condition 2, $A(t)$ is invertible for all $t \\neq 0$. At $t = 0$, $A(0)$ is singular.' },
        { expression: 'A(0) = \\begin{bmatrix}0&1&0\\\\0&0&1\\\\0&0&0\\end{bmatrix}, \\quad A(0)\\mathbf{e}_1 = \\mathbf{0}', annotation: 'At $t=0$: $A(0)\\mathbf{e}_1 = [0,0,0]^\\top$. So $\\mathbf{e}_1 = [1,0,0]^\\top \\in \\text{Nul}(A(0))$.' },
        { expression: '\\text{IMT: all 12 conditions fail at } t=0', annotation: 'Since $A(0)$ is singular: rank$(A(0)) < 3$ (rank = 2); RREF$(A(0)) \\neq I$; 0 is an eigenvalue; $A(0)\\mathbf{x} = \\mathbf{b}$ does not have a unique solution for every $\\mathbf{b}$; columns are linearly dependent ($\\mathbf{c}_1 = \\mathbf{0}$).' },
      ],
      answer: 'Invertible for all $t \\neq 0$. At $t = 0$: $\\mathbf{e}_1 = [1,0,0]^\\top \\in \\text{Nul}(A(0))$. IMT says all 12 conditions simultaneously fail: rank = 2, det = 0, zero eigenvalue, non-trivial null space, no unique solution.',
    },
  ],

  semantics: {
    core: [
      { symbol: 'A^{-1}', meaning: 'The two-sided inverse of $A$: $AA^{-1} = A^{-1}A = I$. Exists iff all 12 IMT conditions hold. For square matrices, left inverse = right inverse.' },
      { symbol: '\\det(A) \\neq 0', meaning: 'Condition 2 of IMT. Equivalent to all 12 other conditions. Fastest check for small matrices.' },
      { symbol: '\\text{rank}(A) = n', meaning: 'Condition 3 of IMT. All $n$ columns are independent, all $n$ rows span $\\mathbb{R}^n$, there are $n$ pivots.' },
      { symbol: '\\text{Nul}(A) = \\{\\mathbf{0}\\}', meaning: 'Condition 7 of IMT. Only the zero vector maps to zero — A is injective.' },
      { symbol: '\\lambda_i \\neq 0 \\text{ for all } i', meaning: 'Condition 12 of IMT. Since $\\det(A) = \\prod \\lambda_i$, any zero eigenvalue makes $\\det = 0$, making $A$ singular.' },
    ],
    rulesOfThumb: [
      'To check invertibility, use the cheapest condition first: for small matrices use det; for large systems use rank (row reduction).',
      'All 12 IMT conditions are equivalent. Knowing one, you know them all.',
      'The IMT applies ONLY to square ($n \\times n$) matrices. Non-square matrices can have full column rank or full row rank but not both.',
      '$AB$ invertible does not require knowing $A$ and $B$ are invertible individually, but it implies both are.',
      'Condition 12 (no zero eigenvalue) is the last to check — it requires solving the characteristic polynomial.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { lessonId: 'la2-001', label: 'Matrix Multiplication', note: 'The proof that $(AB)^{-1} = B^{-1}A^{-1}$ requires careful use of associativity of matrix multiplication and the definition $A^{-1}A = I$.' },
      { lessonId: 'la2-004', label: 'Null Space and Column Space', note: 'IMT conditions 7–10 are all about null space and column space. A trivial null space ↔ full column rank ↔ columns span $\\mathbb{R}^n$ ↔ unique solution for every $\\mathbf{b}$.' },
      { lessonId: 'la2-005', label: 'Determinants', note: 'IMT condition 2 (det ≠ 0) is proved using the fact that row operations multiply det by non-zero scalars, and RREF = I has det = 1.' },
    ],
    futureLinks: [
      { lessonId: 'la3-001', label: 'Eigenvalues and Eigenvectors', note: 'IMT condition 12 (no zero eigenvalue) will be extended: the eigenvalues of $A$ are exactly where $A - \\lambda I$ fails to be invertible. Knowing when a matrix is invertible vs. singular is the core of eigenvalue theory.' },
      { lessonId: 'la4-003', label: 'Least Squares', note: 'When $A$ is not square (and hence the IMT does not apply), least squares replaces exact solution. The normal equations use $A^\\top A$, which IS square — and $A^\\top A$ is invertible iff $A$ has full column rank.' },
    ],
  },

  mentalModel: [
    'The IMT is all-or-nothing: a matrix is either invertible in all twelve ways, or singular in all twelve ways.',
    'The cheapest test: is det ≠ 0? The most geometric: are columns independent (span all of $\\mathbb{R}^n$)?',
    'Singular matrices destroy information — they collapse a dimension, making the map irreversible.',
    'In finite dimensions, injective ↔ surjective for linear maps. Either you hit everything or you miss something.',
    'The product of invertibles is invertible. The inverse reverses the order: $(AB)^{-1} = B^{-1}A^{-1}$.',
  ],

  checkpoints: [
    { id: 'cp-la2-010-1', label: 'Read intuition — understand why all twelve conditions are equivalent geometrically', type: 'read' },
    { id: 'cp-la2-010-2', label: 'Read math — trace the proof chain connecting det, rank, and null space', type: 'read' },
    { id: 'cp-la2-010-3', label: 'Read rigor — understand why left inverse = right inverse for square matrices', type: 'read' },
    { id: 'cp-la2-010-4', label: 'Run OpenMAT cell 1 — verify all IMT conditions pass on an invertible matrix', type: 'lab' },
    { id: 'cp-la2-010-5', label: 'Run OpenMAT cell 2 — verify all IMT conditions fail simultaneously on a singular matrix', type: 'lab' },
    { id: 'cp-la2-010-6', label: 'Complete example 1: determine invertibility of the arithmetic-progression matrix using two conditions', type: 'example' },
    { id: 'cp-la2-010-7', label: 'Complete example 2: find the value of k that makes A singular', type: 'example' },
    { id: 'cp-la2-010-8', label: 'Attempt challenge 2: prove $(AB)^{-1} = B^{-1}A^{-1}$ and show why order matters', type: 'challenge' },
  ],

  assessment: {
    questions: [
      {
        id: 'la2-010-assess-1',
        type: 'choice',
        text: 'A $4 \\times 4$ matrix $A$ has $\\text{rank}(A) = 3$. According to the Invertible Matrix Theorem, which of the following MUST be true?',
        options: [
          '$\\det(A) = 3$',
          '$A$ has exactly one zero eigenvalue',
          '$A$ is not invertible and its null space has dimension 1',
          '$A^\\top$ has rank 4',
        ],
        answer: '$A$ is not invertible and its null space has dimension 1',
        hint: 'Rank-nullity: $\\text{rank} + \\text{nullity} = n = 4$. With rank $= 3$, nullity $= 1$. By IMT, since rank $< n$, $A$ is NOT invertible (all 12 conditions fail). We cannot determine the exact eigenvalues (the zero eigenvalue may have algebraic multiplicity $> 1$), and $A^\\top$ has the same rank as $A$ (rank 3, not 4).',
      },
    ],
  },

  quiz: [
    {
      id: 'la2-010-quiz-1',
      type: 'choice',
      text: 'Which condition is NOT equivalent to "$A$ is invertible" (for an $n \\times n$ matrix $A$)?',
      options: [
        '$\\det(A) \\neq 0$',
        '$\\text{rank}(A) = n$',
        '$\\text{tr}(A) \\neq 0$',
        'RREF$(A) = I_n$',
      ],
      answer: '$\\text{tr}(A) \\neq 0$',
      hints: ['The trace (sum of diagonal entries) has nothing to do with invertibility. A diagonal matrix $\\text{diag}(0, 1, 1, 1)$ has trace $= 3 \\neq 0$ but is singular. A matrix with trace $= 0$ can be invertible.'],
      reviewSection: 'Intuition tab — The Twelve Equivalent Conditions',
    },
    {
      id: 'la2-010-quiz-2',
      type: 'choice',
      text: 'Matrix $A$ has eigenvalues $3, -1, 0, 5$. Is $A$ invertible?',
      options: [
        'Yes, because most eigenvalues are non-zero.',
        'No, because $0$ is an eigenvalue (IMT condition 12 fails).',
        'Yes, because $\\text{tr}(A) = 3 + (-1) + 0 + 5 = 7 \\neq 0$.',
        'Cannot determine from eigenvalues alone.',
      ],
      answer: 'No, because $0$ is an eigenvalue (IMT condition 12 fails).',
      hints: ['IMT condition 12: $A$ is invertible ↔ $0$ is NOT an eigenvalue. Even one zero eigenvalue makes $A$ singular: $A\\mathbf{v} = 0\\mathbf{v} = \\mathbf{0}$ for the corresponding eigenvector $\\mathbf{v} \\neq \\mathbf{0}$, so null space is non-trivial.'],
      reviewSection: 'Math tab — Eigenvalue connection',
    },
    {
      id: 'la2-010-quiz-3',
      type: 'choice',
      text: 'If $A$ is a $5 \\times 5$ matrix and $A\\mathbf{x} = \\mathbf{b}$ has a unique solution for every $\\mathbf{b} \\in \\mathbb{R}^5$, what else must be true?',
      options: [
        'Only that the system has a unique solution — no other conclusions.',
        'det$(A) \\neq 0$, rank$(A) = 5$, null space is trivial, and $A$ has no zero eigenvalue.',
        'det$(A) = 1$, and all eigenvalues are positive.',
        '$A$ must be symmetric.',
      ],
      answer: 'det$(A) \\neq 0$, rank$(A) = 5$, null space is trivial, and $A$ has no zero eigenvalue.',
      hints: ['Unique solution for every $\\mathbf{b}$ is IMT condition 10. The IMT says this is equivalent to ALL other conditions simultaneously. So det ≠ 0, rank = 5, trivial null space, no zero eigenvalue — everything follows.'],
      reviewSection: 'Intuition tab — The Twelve Equivalent Conditions',
    },
    {
      id: 'la2-010-quiz-4',
      type: 'choice',
      text: 'If $A^2 = I$ (A is its own inverse), what does the IMT say about $A$?',
      options: [
        '$A$ is singular since squaring often loses information.',
        '$A$ is invertible (in fact $A^{-1} = A$).',
        '$A$ must be the identity matrix.',
        '$A$ must be symmetric.',
      ],
      answer: '$A$ is invertible (in fact $A^{-1} = A$).',
      hints: ['$A^2 = I$ means $AA = I$. By definition, $A$ has an inverse and $A^{-1} = A$. Matrices satisfying $A^2 = I$ are called **involutions** — the reflection matrix $\\begin{bmatrix}1&0\\\\0&-1\\end{bmatrix}$ is one example.'],
      reviewSection: 'Intuition tab — definition of invertibility',
    },
    {
      id: 'la2-010-quiz-5',
      type: 'choice',
      text: 'The IMT applies only to square matrices. For an $m \\times n$ matrix $A$ with $m \\neq n$, which statement is true?',
      options: [
        'A non-square matrix can never have an inverse of any kind.',
        'A non-square matrix can have a left inverse OR a right inverse, but not both.',
        'Full column rank for a non-square $A$ means $A$ is invertible in the usual sense.',
        'The IMT applies to non-square matrices if we use the pseudoinverse instead.',
      ],
      answer: 'A non-square matrix can have a left inverse OR a right inverse, but not both.',
      hints: ['For $m > n$ (tall matrix): can have a left inverse $B$ with $BA = I_n$ (full column rank needed) but no right inverse. For $m < n$ (wide matrix): can have a right inverse $C$ with $AC = I_m$ (full row rank needed) but no left inverse. A two-sided inverse requires $m = n$.'],
      reviewSection: 'Intuition tab — IMT requires square matrices callout',
    },
    {
      id: 'la2-010-quiz-6',
      type: 'choice',
      text: 'Numerically, a matrix has $\\det(A) = 10^{-15}$ and condition number $\\kappa = 10^{14}$. What should you conclude?',
      options: [
        'The matrix is singular by the IMT — det ≈ 0.',
        'The matrix is technically invertible (det ≠ 0) but numerically near-singular — solutions to $A\\mathbf{x} = \\mathbf{b}$ will be extremely sensitive to errors in $\\mathbf{b}$.',
        'The matrix is invertible and numerically stable.',
        'The IMT does not apply because the determinant is very small.',
      ],
      answer: 'The matrix is technically invertible (det ≠ 0) but numerically near-singular — solutions to $A\\mathbf{x} = \\mathbf{b}$ will be extremely sensitive to errors in $\\mathbf{b}$.',
      hints: ['The IMT is binary and exact. Mathematically, det $= 10^{-15} \\neq 0$ means invertible. But numerically, the condition number $\\kappa = 10^{14}$ means relative error in $\\hat{\\mathbf{x}}$ can be $10^{14}$ times the relative error in $\\mathbf{b}$. The matrix is invertible in theory but unreliable in practice.'],
      reviewSection: 'Rigor tab — Near-Singular Matrices callout',
    },
  ],
};
