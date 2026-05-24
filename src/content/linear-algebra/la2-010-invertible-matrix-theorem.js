export default {
  id: 'la2-010',
  slug: 'invertible-matrix-theorem',
  chapter: 'la2',
  order: 10,
  title: 'The Invertible Matrix Theorem',
  subtitle: 'Twelve seemingly different conditions — det ≠ 0, rank = n, trivial null space, RREF is identity — are actually all the same condition. A matrix is either completely healthy in all ways at once, or sick in all of them.',
  tags: ['invertible matrix theorem', 'IMT', 'invertibility', 'determinant', 'rank', 'null space', 'column space', 'pivot', 'RREF', 'eigenvalues'],
  aliases: 'invertible matrix theorem IMT singular nonsingular invertibility det rank null space column space RREF pivot',

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
      '**Formal statement.** Let $A$ be an $n \\times n$ matrix over a field $F$. The following are equivalent: (1) $A$ is invertible in $M_n(F)$; (2) $\\det(A) \\neq 0$; (3) $\\text{rank}(A) = n$; (4) The columns of $A$ form a basis for $F^n$; (5) The rows of $A$ form a basis for $F^n$; (6) The linear map $T_A: F^n \\to F^n$ defined by $T_A(\\mathbf{x}) = A\\mathbf{x}$ is a bijection; (7) $A$ has a left inverse; (8) $A$ has a right inverse.',
      '**Conditions (7) and (8) are equivalent for square matrices.** If $BA = I$, then $B$ is a left inverse. We claim $AB = I$ as well. Since $BA = I$, $B$ is invertible, so $A = B^{-1}$, and $AB = B^{-1}B = I$. This equivalence of left and right inverses fails for non-square matrices.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'IMT for Linear Maps',
        body: 'A linear map $T: V \\to V$ on a finite-dimensional space is invertible if and only if it is injective (one-to-one) if and only if it is surjective (onto). For finite dimensions, half is enough: you only need to check one of them.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la2-010-1',
      title: 'Using the IMT to avoid computation',
      problem: 'Without computing the inverse, determine whether $A = \\begin{bmatrix}1&2&3\\\\4&5&6\\\\7&8&9\\end{bmatrix}$ is invertible.',
      solution: 'The third row equals the sum of the first two ($[7,8,9] = [1,2,3] + [4,5,6]$... actually $[1+4,2+5,3+6]=[5,7,9]\\neq [7,8,9]$, but check the columns: $\\mathbf{c}_3 = \\mathbf{c}_2 + (\\mathbf{c}_2 - \\mathbf{c}_1) = 2\\mathbf{c}_2 - \\mathbf{c}_1$). RREF has only 2 pivots, so rank = 2 < 3. By IMT, $A$ is singular.',
    },
    {
      id: 'ex-la2-010-2',
      title: 'Checking invertibility via eigenvalues',
      problem: 'Is $A = \\begin{bmatrix}5&1\\\\3&3\\end{bmatrix}$ invertible?',
      solution: '$\\det(A) = 15 - 3 = 12 \\neq 0$. By IMT, $A$ is invertible. (Eigenvalues are 2 and 6 — neither is zero, consistent with all IMT conditions.)',
    },
  ],

  challenges: [
    {
      id: 'ch-la2-010-1',
      title: 'IMT and the rank',
      difficulty: 'medium',
      prompt: 'If $A$ and $B$ are $n \\times n$ and both invertible, prove that $AB$ is also invertible.',
      hint: 'Find the inverse of $AB$ explicitly using $A^{-1}$ and $B^{-1}$.',
      solution: '$(AB)^{-1} = B^{-1}A^{-1}$. Check: $(AB)(B^{-1}A^{-1}) = A(BB^{-1})A^{-1} = AIA^{-1} = I$.',
    },
    {
      id: 'ch-la2-010-2',
      title: 'Column space span check',
      difficulty: 'easy',
      prompt: 'Find a value of $k$ that makes $A = \\begin{bmatrix}1&k\\\\2&8\\end{bmatrix}$ singular.',
      hint: 'Use condition 2 (det = 0).',
      solution: '$\\det(A) = 8 - 2k = 0 \\Rightarrow k = 4$.',
    },
  ],

  mentalModel: [
    'Invertible = bijective = information-preserving = full rank = trivial null space = non-zero det = all eigenvalues ≠ 0.',
    'The matrix is either completely healthy in all twelve ways, or sick in all twelve ways simultaneously.',
    'det = 0 means the matrix smashes volume to zero — it can never be undone.',
    'The IMT is the grand unifying theorem of Chapters 1-3.',
  ],

  checkpoints: [
    { id: 'cp-la2-010-1', question: 'If $\\text{rank}(A) = n-1$ for an $n\\times n$ matrix, is $A$ invertible?', answer: 'No — rank must equal $n$ for invertibility.' },
    { id: 'cp-la2-010-2', question: 'If all eigenvalues of a square matrix are non-zero, what does IMT say?', answer: 'The matrix is invertible (condition 12).' },
    { id: 'cp-la2-010-3', question: 'What does a non-trivial null space tell you about invertibility?', answer: 'Not invertible — multiple inputs map to the same output.' },
  ],

  assessment: 'State five conditions equivalent to invertibility and prove that two of them are equivalent to each other. Use a $3 \\times 3$ example to illustrate.',

  quiz: [
    { id: 'q-la2-010-1', question: 'Which condition is NOT equivalent to "A is invertible"?', options: ['$\\det(A) \\neq 0$', 'rank$(A) = n$', 'RREF$(A) = I$', 'trace$(A) \\neq 0$'], answer: 'trace$(A) \\neq 0$' },
    { id: 'q-la2-010-2', question: 'If $A$ has 0 as an eigenvalue:', options: ['$A$ is invertible', '$A$ is singular', '$A$ has full rank', '$\\det(A) = 1$'], answer: '$A$ is singular' },
    { id: 'q-la2-010-3', question: 'The IMT states that for a square matrix, left invertibility implies:', options: ['only left invertibility', 'right invertibility as well', 'full column rank only', 'nothing about right inverse'], answer: 'right invertibility as well' },
  ],
};
