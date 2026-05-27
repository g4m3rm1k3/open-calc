export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la2-012',
  slug: 'cofactor-expansion',
  chapter: 'la2',
  order: 12,
  title: 'Cofactor Expansion and the Adjugate Matrix',
  subtitle: 'How minors and cofactors build a systematic algorithm for any determinant — and why the same objects give you the inverse formula.',
  tags: ['cofactor expansion', 'minor', 'cofactor', 'adjugate', 'adjoint', 'inverse formula', 'Laplace expansion', 'determinant'],
  aliases: 'cofactor expansion Laplace expansion minor submatrix cofactor matrix adjugate adjoint inverse formula A inverse det A adj A',

  // ── Pedagogical Meta ───────────────────────────────────────────
  timeToComplete: 30,
  coreConcept: 'The determinant of any n×n matrix equals the sum of entries in any row (or column) each multiplied by its signed minor — its cofactor. Arranging all n² cofactors into a matrix and transposing gives the adjugate, which provides an explicit inverse formula valid for any invertible matrix.',
  prerequisites: ['la2-003', 'la2-005'],
  nextLesson: 'cramers-rule',

  // ── Hook ───────────────────────────────────────────────────────
  hook: {
    question: 'You know the 2×2 inverse formula. Is there an equivalent explicit formula for 3×3 — one that does not require row reduction?',
    realWorldContext: 'Symbolic algebra systems (Mathematica, SymPy) compute inverses of general n×n matrices by computing the adjugate divided by the determinant. This is slow for large numeric matrices but produces exact symbolic formulas — essential in control theory, where engineers need a closed-form expression for a system inverse to design a controller, not just a number. The cofactor-based inverse also appears in every proof that connects determinants to matrix invertibility.',
    previewVisualizationId: 'LALesson06_Inverses',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      'Start with a 3×3 matrix and the goal of computing its determinant. You already know $ad - bc$ for 2×2. The 3×3 case generalizes that formula by repeatedly using it.',
      'Pick any row. Say row 1: $\\begin{bmatrix} a & b & c \\\\ d & e & f \\\\ g & h & k \\end{bmatrix}$. For each entry in that row, delete its entire row and column. What is left is a 2×2 matrix — compute its determinant. Attach a sign based on which position you are at (column 1 gets $+$, column 2 gets $-$, column 3 gets $+$). Multiply each entry by its signed 2×2 determinant and sum. That is cofactor expansion.',
      'The signed 2×2 determinant for entry $(1,j)$ is the **cofactor** $C_{1j}$. The 2×2 determinant without the sign is the **minor** $M_{1j}$. They are related by the simple rule $C_{ij} = (-1)^{i+j} M_{ij}$.',
      '**You can expand along any row or column** and always get the same answer. This is the key strategic fact: if a row or column has mostly zeros, expand along it — every zero entry contributes nothing to the sum.',
      'Now the deeper idea: what if you organize all nine cofactors into a 3×3 matrix? The entry in position $(i,j)$ of that matrix is $C_{ij}$. Transposing this matrix (swapping rows and columns) gives the **adjugate matrix** $\\text{adj}(A)$. It turns out that $A \\cdot \\text{adj}(A) = \\det(A) \\cdot I$. Dividing by $\\det(A)$ immediately gives $A^{-1} = \\frac{1}{\\det(A)} \\text{adj}(A)$. This is the only explicit, formula-based inverse that works for any size matrix.',
      '**Predict before reading on.** For the matrix $A = \\begin{bmatrix} 2 & 1 \\\\ 5 & 3 \\end{bmatrix}$, compute $\\det(A)$, then compute the four cofactors $C_{11}, C_{12}, C_{21}, C_{22}$, and write $A^{-1}$ using the adjugate formula. Check your answer against $A^{-1} = \\frac{1}{1}\\begin{bmatrix}3&-1\\\\-5&2\\end{bmatrix}$.',
      '**Where this connects.** The adjugate formula is the algebraic foundation for Cramer\'s rule (Lesson LA2-008): solving $Ax = b$ by replacing one column at a time and using determinants. Both depend on the same machinery you are building now.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 12 of 12 — Matrices & Transformations',
        body: '**Previous:** Four Fundamental Subspaces — the complete picture of what a matrix does to space.\n**This lesson:** Cofactors, adjugate, and the explicit inverse formula.\n**Connects to:** Cramer\'s Rule (LA2-008, already covered) and Eigenvalues (LA3-001, coming next chapter).',
      },
      {
        type: 'definition',
        title: 'Minor $M_{ij}$',
        body: 'For an $n \\times n$ matrix $A$, the **minor** $M_{ij}$ is the determinant of the $(n-1)\\times(n-1)$ submatrix obtained by deleting row $i$ and column $j$.\n\nFor $A = \\begin{bmatrix}a&b&c\\\\d&e&f\\\\g&h&k\\end{bmatrix}$, the minor $M_{12}$ (delete row 1, column 2) is $\\det\\begin{bmatrix}d&f\\\\g&k\\end{bmatrix} = dk - fg$.',
      },
      {
        type: 'definition',
        title: 'Cofactor $C_{ij}$',
        body: 'The **cofactor** $C_{ij}$ is the signed minor:\n\n$$C_{ij} = (-1)^{i+j}\\, M_{ij}$$\n\nThe sign pattern $(-1)^{i+j}$ produces a checkerboard:\n$$\\begin{bmatrix}+&-&+\\\\-&+&-\\\\+&-&+\\end{bmatrix}$$\n\nTop-left is always $+$. Signs alternate along every row and column.',
      },
      {
        type: 'theorem',
        title: 'Cofactor Expansion (Laplace Expansion)',
        body: 'For any $n\\times n$ matrix $A$ and any choice of row $i$ or column $j$:\n\n$$\\det(A) = \\sum_{j=1}^{n} a_{ij}\\,C_{ij} \\quad\\text{(expansion along row }i\\text{)}$$\n\n$$\\det(A) = \\sum_{i=1}^{n} a_{ij}\\,C_{ij} \\quad\\text{(expansion along column }j\\text{)}$$\n\nEvery valid choice gives the same determinant. Always expand along the row or column with the most zeros.',
      },
      {
        type: 'definition',
        title: 'Adjugate (Classical Adjoint)',
        body: 'The **adjugate** of $A$, written $\\text{adj}(A)$, is the **transpose of the cofactor matrix**.\n\nThe cofactor matrix has $C_{ij}$ in position $(i,j)$. The adjugate has $C_{ji}$ in position $(i,j)$ — rows and columns swapped.\n\n$$A^{-1} = \\frac{1}{\\det(A)}\\,\\text{adj}(A) \\qquad(\\det(A) \\neq 0)$$\n\nFor a 2×2 matrix $\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}$, $\\text{adj}(A) = \\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$ — exactly the formula you already know.',
      },
    ],
    visualizations: [],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      'Let $A$ be an $n \\times n$ matrix. Denote by $A_{ij}$ the $(n-1)\\times(n-1)$ submatrix formed by deleting row $i$ and column $j$. The **minor** is $M_{ij} = \\det(A_{ij})$ and the **cofactor** is $C_{ij} = (-1)^{i+j}\\det(A_{ij})$.',
      '**Laplace\'s theorem** guarantees that for any fixed row $i$:\n\n$\\det(A) = a_{i1}C_{i1} + a_{i2}C_{i2} + \\cdots + a_{in}C_{in} = \\sum_{j=1}^{n} a_{ij}C_{ij}$\n\nand equivalently for any fixed column $j$. The proof constructs the expansion from the multilinear, alternating characterization of determinants — the algebra of permutations underlies every sign $(-1)^{i+j}$.',
      'A crucial companion identity: expanding along the **wrong** row gives zero. If you take entries from row $i$ but cofactors from row $k \\neq i$, the sum $\\sum_j a_{ij}C_{kj} = 0$. Geometrically, you are computing the determinant of a matrix with two identical rows, which is always zero.',
      '**The Adjugate.** Define the cofactor matrix $C$ by $C_{ij} = (-1)^{i+j}\\det(A_{ij})$. The adjugate is $\\text{adj}(A) = C^T$, so $(\\text{adj}(A))_{ij} = C_{ji}$.',
      'The identity $A \\cdot \\text{adj}(A) = \\det(A) \\cdot I_n$ follows directly from the expansion formulas: the $(i,i)$ diagonal entry of the product is $\\sum_j a_{ij}C_{ij} = \\det(A)$, and each off-diagonal entry $(i,k)$ with $i \\neq k$ is $\\sum_j a_{ij}C_{kj} = 0$ (the "wrong row" identity). Dividing by $\\det(A)$ when it is nonzero gives the **adjugate inverse formula**: $A^{-1} = \\frac{\\text{adj}(A)}{\\det(A)}$.',
      'For a general $n \\times n$ matrix, cofactor expansion requires computing $n$ minors each of size $(n-1)\\times(n-1)$, leading to $O(n!)$ arithmetic operations. For large matrices this is catastrophically slow: a $20\\times 20$ matrix would require on the order of $10^{18}$ operations. Row reduction (LU decomposition) uses $O(n^3)$ operations and is universally preferred for numerical computation. Cofactor expansion remains essential for small matrices ($n \\leq 4$), symbolic computation, and theoretical proofs.',
    ],
    callouts: [
      {
        type: 'strategy',
        title: 'Always Expand Along the Sparsest Row or Column',
        body: 'Each zero entry in the expansion row/column eliminates one minor computation. For $\\begin{bmatrix}0&0&3\\\\1&2&4\\\\5&6&7\\end{bmatrix}$, expanding along row 1 requires only one 2×2 determinant (the entry 3 at position (1,3)). The zeros wipe out the other two terms instantly.',
      },
      {
        type: 'theorem',
        title: 'Adjugate Identity',
        body: '$$A \\cdot \\text{adj}(A) = \\text{adj}(A) \\cdot A = \\det(A) \\cdot I$$\n\nProof sketch: the $(i,j)$ entry of $A \\cdot \\text{adj}(A)$ is $\\sum_k a_{ik} (\\text{adj}(A))_{kj} = \\sum_k a_{ik} C_{jk}$. When $i = j$ this is cofactor expansion along row $j$ of $A$ — equals $\\det(A)$. When $i \\neq j$ it equals $\\det$ of the matrix with row $j$ replaced by row $i$ — a matrix with a repeated row, so $\\det = 0$.',
      },
      {
        type: 'insight',
        title: '2×2 Adjugate Is the Formula You Already Know',
        body: 'For $A = \\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}$:\n\n$C_{11} = d,\\; C_{12} = -c,\\; C_{21} = -b,\\; C_{22} = a$\n\n$\\text{adj}(A) = C^T = \\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$\n\n$A^{-1} = \\frac{1}{ad-bc}\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$\n\nThe "swap diagonal, negate off-diagonal" trick for 2×2 inverses is just the adjugate formula in disguise.',
      },
      {
        type: 'warning',
        title: 'Adjoint vs Adjugate — a Naming Collision',
        body: 'In some older texts, "adjoint" means $A^* = \\bar{A}^T$ (the conjugate transpose, used in inner product spaces). In linear algebra over $\\mathbb{R}$, "classical adjoint" and "adjugate" both mean $C^T$. This course uses **adjugate** for $C^T$ to avoid ambiguity. When you see "adj" in a formula, it always means the cofactor matrix transposed.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Cofactor Expansion and Adjugate in OpenMAT',
        mathBridge: 'OpenMAT provides det() for the full determinant, but computing cofactors requires manually deleting rows and columns. The notebook below demonstrates: (1) computing all cofactors of a 3×3 matrix by hand using det() on submatrices; (2) assembling the adjugate; (3) verifying A * adj(A) = det(A) * I; (4) recovering A^{-1} two ways — via adjugate and via inv() — and confirming they match.',
        caption: 'Two paths to the inverse: row reduction (inv) and adjugate formula. Same answer, very different cost.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Computing all cofactors of a 3×3 matrix',
              prose: [
                'For each entry (i,j), delete row i and column j, compute det of the 2×2 remainder, multiply by the sign (-1)^(i+j).',
                'We extract submatrices manually: A([rows], [cols]) selects those rows and columns.',
              ],
              code: `A = [2 1 3; 0 4 1; 5 2 6];
disp('Matrix A:'); disp(A)

% Cofactor C_11: delete row1, col1 → rows 2:3, cols 2:3
C11 = (+1) * det(A(2:3, 2:3));

% Cofactor C_12: delete row1, col2 → rows 2:3, cols [1,3]
C12 = (-1) * det(A(2:3, [1 3]));

% Cofactor C_13: delete row1, col3 → rows 2:3, cols 1:2
C13 = (+1) * det(A(2:3, 1:2));

% Cofactor C_21: delete row2, col1 → rows [1,3], cols 2:3
C21 = (-1) * det(A([1 3], 2:3));

% Cofactor C_22: delete row2, col2 → rows [1,3], cols [1,3]
C22 = (+1) * det(A([1 3], [1 3]));

% Cofactor C_23: delete row2, col3 → rows [1,3], cols 1:2
C23 = (-1) * det(A([1 3], 1:2));

% Cofactor C_31: delete row3, col1 → rows 1:2, cols 2:3
C31 = (+1) * det(A(1:2, 2:3));

% Cofactor C_32: delete row3, col2 → rows 1:2, cols [1,3]
C32 = (-1) * det(A(1:2, [1 3]));

% Cofactor C_33: delete row3, col3 → rows 1:2, cols 1:2
C33 = (+1) * det(A(1:2, 1:2));

disp('Cofactor matrix C (before transpose):')
C_mat = [C11 C12 C13; C21 C22 C23; C31 C32 C33];
disp(C_mat)`,
            },
            {
              id: 2,
              cellTitle: 'Adjugate, inverse formula, and verification',
              prose: [
                'The adjugate is the TRANSPOSE of the cofactor matrix. Then A^{-1} = adj(A) / det(A).',
                'We verify two identities: A * adj(A) = det(A)*I, and the adjugate inverse matches inv(A).',
              ],
              code: `% Build adjugate = transpose of cofactor matrix
adj_A = C_mat';
disp('adj(A):'); disp(adj_A)

d = det(A);
disp(['det(A) = ', num2str(d)])

% Inverse via adjugate formula
A_inv_adj = adj_A / d;
disp('A^{-1} via adjugate:'); disp(A_inv_adj)

% Verify: A * adj(A) should equal det(A)*I
disp('A * adj(A) (should be det(A)*I):')
disp(A * adj_A)

% Compare with built-in inv()
disp('inv(A) via row reduction:'); disp(inv(A))

% Confirm they match
disp(['Max difference between methods: ', num2str(max(max(abs(A_inv_adj - inv(A)))))])`,
            },
            {
              id: 3,
              cellTitle: 'Expansion along a row with zeros — strategic choice',
              prose: [
                'Expanding along a row with zeros skips entire minor computations. Here det is computed two ways: naive row 1 expansion, and strategic expansion along the sparsest row.',
              ],
              code: `B = [0 0 3; 1 2 4; 5 6 7];
disp('Matrix B:'); disp(B)

% Expand along row 1 — only entry B(1,3)=3 is nonzero
% C_13 = (+1)*det([1 2; 5 6]) = 6-10 = -4
C13_B = (+1) * det(B(2:3, 1:2));
det_via_row1 = B(1,1)*0 + B(1,2)*0 + B(1,3)*C13_B;
disp(['det(B) via row-1 expansion: ', num2str(det_via_row1)])
disp(['det(B) via det(): ', num2str(det(B))])

% For a 4x4 — show exponential cost
D = magic(4);
disp('4x4 magic square D:'); disp(D)
disp(['det(D) = ', num2str(det(D))])
disp('Expanding a 4x4 by hand requires 4 cofactors each needing 3x3 expansion.')
disp('That is 4 x 3 = 12 two-by-two determinants. Use row reduction for n>=4.')`,
            },
          ],
        },
      },
      {
        id: 'PythonNotebook',
        title: 'Cofactor Expansion and Adjugate in NumPy',
        mathBridge: 'Build a cofactor expansion function from scratch using numpy slicing, then verify it matches np.linalg.det. Compute the adjugate and recover A⁻¹ via the formula — confirm it equals np.linalg.inv(A).',
        caption: 'The adjugate formula: A⁻¹ = adj(A) / det(A). Identical to the 2×2 swap-and-negate rule, just generalized.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Cofactor function and expansion from scratch',
              prose: 'Build cofactor(A, i, j) by deleting row i and column j using numpy index tricks, then compute the full determinant by expanding along row 0. Verify it matches np.linalg.det.',
              code: `import numpy as np

def minor(A, i, j):
    """Return det of A with row i and column j deleted."""
    rows = np.delete(np.arange(A.shape[0]), i)
    cols = np.delete(np.arange(A.shape[1]), j)
    return np.linalg.det(A[np.ix_(rows, cols)])

def cofactor(A, i, j):
    """Cofactor C_ij = (-1)^(i+j) * minor(A,i,j)."""
    return ((-1) ** (i + j)) * minor(A, i, j)

def cofactor_expansion(A, row=0):
    """Compute det(A) by expanding along the given row."""
    return sum(A[row, j] * cofactor(A, row, j) for j in range(A.shape[1]))

A = np.array([[2., 1., 3.],
              [0., 4., 1.],
              [5., 2., 6.]])

det_manual = cofactor_expansion(A, row=0)
det_numpy  = np.linalg.det(A)

print(f"det via cofactor expansion: {det_manual:.6f}")
print(f"det via np.linalg.det:      {det_numpy:.6f}")
print(f"Match: {np.isclose(det_manual, det_numpy)}")`,
            },
            {
              id: 2,
              cellTitle: 'Adjugate and the inverse formula',
              prose: 'Build the full cofactor matrix, transpose to get the adjugate, then recover A⁻¹ = adj(A) / det(A). Confirm it matches np.linalg.inv(A) and that A @ adj(A) = det(A) * I.',
              code: `import numpy as np

def cofactor_matrix(A):
    n = A.shape[0]
    C = np.zeros((n, n))
    for i in range(n):
        for j in range(n):
            rows = np.delete(np.arange(n), i)
            cols = np.delete(np.arange(n), j)
            C[i, j] = ((-1)**(i+j)) * np.linalg.det(A[np.ix_(rows, cols)])
    return C

A = np.array([[2., 1., 3.],
              [0., 4., 1.],
              [5., 2., 6.]])

C = cofactor_matrix(A)
adj_A = C.T          # adjugate = transpose of cofactor matrix
d     = np.linalg.det(A)
A_inv = adj_A / d

print("Inverse via adjugate formula:")
print(np.round(A_inv, 6))
print("\\nnp.linalg.inv(A):")
print(np.round(np.linalg.inv(A), 6))
print("\\nA @ adj(A) should equal det(A)*I:")
print(np.round(A @ adj_A, 6))
print(f"det(A) = {d:.4f}, det(A)*I diagonal = {d:.4f}")`,
            },
          ],
        },
      },
    ],
  },

  // ── Calc ───────────────────────────────────────────────────────
  calc: {
    prose: [
      'The adjugate formula $A^{-1} = \\frac{\\text{adj}(A)}{\\det(A)}$ is itself differentiable with respect to the entries of $A$. This matters in sensitivity analysis: how does the inverse change when you perturb a matrix entry? The result, $\\frac{\\partial A^{-1}}{\\partial a_{ij}} = -A^{-1} \\frac{\\partial A}{\\partial a_{ij}} A^{-1}$, is the matrix analogue of the scalar quotient rule $\\frac{d}{dx}(1/f) = -f^\\prime/f^2$.',
      'Jacobi\'s formula relates the derivative of the determinant to the adjugate: $\\frac{d}{dt}\\det(A(t)) = \\text{tr}(\\text{adj}(A)\\, \\dot{A})$. For invertible $A$ this simplifies to $\\frac{d}{dt}\\det(A) = \\det(A)\\,\\text{tr}(A^{-1}\\dot{A})$. This formula appears in the derivation of the matrix exponential and in optimization over matrix manifolds.',
    ],
    callouts: [],
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: 'ex-la2-012-1',
      title: 'Cofactor expansion — 3×3 determinant',
      statement: 'Compute $\\det\\begin{bmatrix}3&1&0\\\\2&-1&4\\\\0&5&2\\end{bmatrix}$ by expanding along column 3 (it has a zero entry).',
      steps: [
        {
          explanation: 'Column 3 has entries $0, 4, 2$. Expanding along column 3: $\\det = a_{13}C_{13} + a_{23}C_{23} + a_{33}C_{33}$. Entry $a_{13} = 0$ contributes nothing.',
          math: '\\det(A) = 0 \\cdot C_{13} + 4 \\cdot C_{23} + 2 \\cdot C_{33}',
        },
        {
          explanation: 'Compute $C_{23}$: sign is $(-1)^{2+3} = -1$, minor is $\\det\\begin{bmatrix}3&1\\\\0&5\\end{bmatrix} = 15 - 0 = 15$.',
          math: 'C_{23} = (-1)^{5} \\cdot 15 = -15',
        },
        {
          explanation: 'Compute $C_{33}$: sign is $(-1)^{3+3} = +1$, minor is $\\det\\begin{bmatrix}3&1\\\\2&-1\\end{bmatrix} = -3 - 2 = -5$.',
          math: 'C_{33} = (+1)(-5) = -5',
        },
        {
          explanation: 'Assemble the expansion.',
          math: '\\det(A) = 4(-15) + 2(-5) = -60 - 10 = -70',
        },
      ],
      answer: '$\\det(A) = -70$',
    },
    {
      id: 'ex-la2-012-2',
      title: 'Inverse via adjugate — 2×2 and 3×3',
      statement: 'Use the adjugate formula to find $A^{-1}$ for $A = \\begin{bmatrix}2&1\\\\5&3\\end{bmatrix}$, then state how many cofactors a 3×3 adjugate requires.',
      steps: [
        {
          explanation: 'Compute the four cofactors: $C_{11} = +3,\\; C_{12} = -5,\\; C_{21} = -1,\\; C_{22} = +2$. The cofactor matrix is $\\begin{bmatrix}3&-5\\\\-1&2\\end{bmatrix}$.',
          math: 'C = \\begin{bmatrix}C_{11}&C_{12}\\\\C_{21}&C_{22}\\end{bmatrix} = \\begin{bmatrix}3&-5\\\\-1&2\\end{bmatrix}',
        },
        {
          explanation: 'Adjugate = transpose of cofactor matrix.',
          math: '\\text{adj}(A) = C^T = \\begin{bmatrix}3&-1\\\\-5&2\\end{bmatrix}',
        },
        {
          explanation: '$\\det(A) = 6 - 5 = 1$.',
          math: 'A^{-1} = \\frac{1}{1}\\begin{bmatrix}3&-1\\\\-5&2\\end{bmatrix}',
        },
        {
          explanation: 'Verify: $A \\cdot A^{-1} = \\begin{bmatrix}2&1\\\\5&3\\end{bmatrix}\\begin{bmatrix}3&-1\\\\-5&2\\end{bmatrix} = \\begin{bmatrix}1&0\\\\0&1\\end{bmatrix}$ ✓. For 3×3: the adjugate requires 9 cofactors, each a 2×2 determinant — 9 extra computations on top of the original determinant.',
          math: '\\text{3×3 adjugate} = C^T \\in \\mathbb{R}^{3\\times 3}, \\text{ 9 cofactors total}',
        },
      ],
      answer: '$A^{-1} = \\begin{bmatrix}3&-1\\\\-5&2\\end{bmatrix}$',
    },
  ],

  // ── Checkpoints ───────────────────────────────────────────────
  checkpoints: [
    { id: 'cp-la2-012-1', label: 'Read: Define minor $M_{ij}$ and cofactor $C_{ij}$ in your own words', type: 'read' },
    { id: 'cp-la2-012-2', label: 'Read: State the cofactor expansion formula along row $i$ and explain when to choose column expansion instead', type: 'read' },
    { id: 'cp-la2-012-3', label: 'Read: Prove why expanding along the "wrong" row gives zero', type: 'read' },
    { id: 'cp-la2-012-4', label: 'Read: State the identity $A \\cdot \\text{adj}(A) = \\det(A)\\cdot I$ and explain how it gives the inverse', type: 'read' },
    { id: 'cp-la2-012-5', label: 'Complete: Example 1 — compute a 3×3 determinant by cofactor expansion along the sparsest row/column', type: 'example' },
    { id: 'cp-la2-012-6', label: 'Complete: Example 2 — find $A^{-1}$ via adjugate for a 2×2 matrix', type: 'example' },
    { id: 'cp-la2-012-7', label: 'Run: OpenMAT cell 1 — compute all 9 cofactors of a 3×3 matrix and verify the adjugate identity', type: 'lab' },
    { id: 'cp-la2-012-8', label: 'Attempt: Compute the adjugate and inverse of $\\begin{bmatrix}1&2&0\\\\3&1&1\\\\0&1&2\\end{bmatrix}$ by hand', type: 'challenge' },
  ],

  // ── Quiz ───────────────────────────────────────────────────────
  quiz: [
    {
      id: 'q-la2-012-1',
      question: 'The minor $M_{23}$ of a 3×3 matrix is:',
      options: [
        'The determinant of the 2×2 submatrix obtained by deleting row 2 and column 3',
        'The (2,3) entry of the matrix multiplied by $(-1)^{2+3}$',
        'The cofactor at position (2,3) with the sign included',
        'The determinant of the full matrix with row 2 set to zero',
      ],
      correctIndex: 0,
      explanation: 'The minor $M_{ij}$ is always the determinant of the submatrix left after deleting row $i$ and column $j$ — no sign attached. The sign is added separately to get the cofactor.',
    },
    {
      id: 'q-la2-012-2',
      question: 'The cofactor sign at position $(3,2)$ is:',
      options: ['$-1$', '$+1$', 'Depends on the matrix entries', '$(-1)^{6}$'],
      correctIndex: 0,
      explanation: '$(-1)^{3+2} = (-1)^5 = -1$. The sign depends only on the position, not on the matrix entries.',
    },
    {
      id: 'q-la2-012-3',
      question: 'If you expand a 3×3 determinant along a row that is all zeros, the result is:',
      options: ['0', 'Undefined', 'The sum of the three cofactors', 'Equal to $\\det$ of the other two rows'],
      correctIndex: 0,
      explanation: 'Each term in the expansion is $a_{ij} \\cdot C_{ij}$. If every $a_{ij} = 0$, every term is zero, so the expansion gives 0. This is consistent with the fact that a zero row makes the matrix singular ($\\det = 0$).',
    },
    {
      id: 'q-la2-012-4',
      question: 'The adjugate of $A$ is:',
      options: [
        'The transpose of the cofactor matrix',
        'The cofactor matrix (without transposing)',
        'The inverse of $A$ divided by $\\det(A)$',
        'The matrix of minors without signs',
      ],
      correctIndex: 0,
      explanation: '$\\text{adj}(A) = C^T$ where $C$ is the matrix of cofactors. The transpose is essential — the (i,j) entry of adj(A) is $C_{ji}$, not $C_{ij}$.',
    },
    {
      id: 'q-la2-012-5',
      question: 'For a 2×2 matrix $\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}$, the adjugate is:',
      options: [
        '$\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$',
        '$\\begin{bmatrix}a&-b\\\\-c&d\\end{bmatrix}$',
        '$\\begin{bmatrix}d&-c\\\\-b&a\\end{bmatrix}$',
        '$\\begin{bmatrix}d&b\\\\c&a\\end{bmatrix}$',
      ],
      correctIndex: 0,
      explanation: 'Cofactors: $C_{11}=d,\\;C_{12}=-c,\\;C_{21}=-b,\\;C_{22}=a$. Adjugate = transpose: swap $C_{12}$ and $C_{21}$ gives $\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$.',
    },
    {
      id: 'q-la2-012-6',
      question: 'Which identity does the adjugate satisfy?',
      options: [
        '$A \\cdot \\text{adj}(A) = \\det(A) \\cdot I$',
        '$A \\cdot \\text{adj}(A) = I$',
        '$\\text{adj}(A) \\cdot A = A^{-1}$',
        '$\\text{adj}(A) = \\det(A) \\cdot A^{-1}$',
      ],
      correctIndex: 0,
      explanation: '$A \\cdot \\text{adj}(A) = \\det(A)\\cdot I$. Dividing both sides by $\\det(A)$ gives $A^{-1} = \\text{adj}(A)/\\det(A)$. Note: the last option is also true but is derived from the correct identity, not the identity itself.',
    },
    {
      id: 'q-la2-012-7',
      question: 'Expanding a 4×4 determinant by cofactor expansion along one row requires computing:',
      options: [
        'Four 3×3 determinants',
        'Six 2×2 determinants',
        'Nine 2×2 determinants',
        'Sixteen 1×1 determinants',
      ],
      correctIndex: 0,
      explanation: 'Expanding along a row of a 4×4 gives four terms, each involving a 3×3 minor. Each of those 3×3 minors can itself be expanded into three 2×2 terms, giving 12 total 2×2 computations. The complexity is $O(n!)$.',
    },
    {
      id: 'q-la2-012-8',
      question: 'When is expanding along a column more efficient than along a row?',
      options: [
        'When the column has more zeros than any row',
        'When the column index is odd',
        'Columns are always faster due to memory layout',
        'When $\\det(A) > 0$',
      ],
      correctIndex: 0,
      explanation: 'Every zero entry in the expansion row/column eliminates one minor computation. The strategic choice is always: find the row or column with the most zeros and expand there. Column vs. row is irrelevant — zeros are what matter.',
    },
    {
      id: 'q-la2-012-9',
      question: 'The term "classical adjoint" in older texts refers to:',
      options: [
        'The adjugate $\\text{adj}(A) = C^T$',
        'The conjugate transpose $A^* = \\bar{A}^T$',
        'The inverse $A^{-1}$',
        'The cofactor matrix before transposing',
      ],
      correctIndex: 0,
      explanation: 'In older linear algebra texts, "classical adjoint" means the adjugate $C^T$. Modern texts reserve "adjoint" for the conjugate transpose $A^*$ used in inner product spaces. This course uses "adjugate" to avoid the ambiguity.',
    },
    {
      id: 'q-la2-012-10',
      question: 'For a 3×3 matrix $A$, the sum $\\sum_j a_{1j} C_{2j}$ (entries from row 1, cofactors from row 2) equals:',
      options: ['0', '$\\det(A)$', '$\\text{tr}(A)$', 'The (1,2) entry of $\\text{adj}(A)$'],
      correctIndex: 0,
      explanation: 'Mixing entries from one row with cofactors from a different row always gives zero. This sum computes the determinant of the matrix with row 2 replaced by row 1 — a matrix with a repeated row, which has zero determinant.',
    },
  ],

  // ── Mastery ────────────────────────────────────────────────────
  mastery: {
    description: 'You have mastered cofactor expansion and the adjugate when you can:',
    skills: [
      'Compute any minor $M_{ij}$ for a 3×3 matrix by deleting the correct row and column and evaluating the 2×2 determinant.',
      'Apply the sign pattern $(-1)^{i+j}$ correctly to any position without drawing the checkerboard — just check whether $i+j$ is even or odd.',
      'Choose the best row or column (most zeros) for expansion and complete a 3×3 determinant computation efficiently.',
      'Build the full adjugate of a 3×3 matrix: compute all 9 cofactors, form the cofactor matrix, transpose it.',
      'Apply the inverse formula $A^{-1} = \\text{adj}(A)/\\det(A)$ and verify the result satisfies $AA^{-1} = I$.',
      'Explain why the "wrong row" expansion identity $\\sum_j a_{ij}C_{kj} = 0$ for $i \\neq k$ holds geometrically (repeated row → zero determinant).',
    ],
  },

  // ── Misconceptions ────────────────────────────────────────────
  misconceptions: [
    {
      wrong: 'The adjugate is just the cofactor matrix.',
      correction: 'The adjugate is the **transpose** of the cofactor matrix. $(\\text{adj}(A))_{ij} = C_{ji}$, not $C_{ij}$. This transposition is what makes $A \\cdot \\text{adj}(A) = \\det(A) \\cdot I$ work — without it, the diagonal entries of the product would be cofactor expansions along the wrong row.',
    },
    {
      wrong: 'You can use cofactor expansion to compute inverses efficiently for large matrices.',
      correction: 'Cofactor expansion is $O(n!)$ — spectacularly slow for large $n$. Row reduction (LU) is $O(n^3)$ and is universally used in practice. The adjugate formula is valuable for symbolic computation and 2×2 or 3×3 cases, but never for numerical work with $n \\geq 5$.',
    },
    {
      wrong: 'The sign of a cofactor depends on whether the minor is positive or negative.',
      correction: 'The sign $(-1)^{i+j}$ depends only on the row and column index, never on the value of the minor. The minor can be positive, negative, or zero — the sign rule is independent of the matrix entries.',
    },
    {
      wrong: 'Expanding along different rows gives different determinants, so you should pick the "right" one.',
      correction: 'Expanding along any row or column gives the identical determinant — this is guaranteed by Laplace\'s theorem. You should still choose strategically (pick the row/column with the most zeros) but the answer is the same regardless of the choice.',
    },
  ],

  // ── Transfer Prompts ───────────────────────────────────────────
  transferPrompts: [
    'A student computes $\\det(A) = 7$ by expanding along row 2 and gets $\\det(A) = 9$ by expanding along row 3. Without looking at the matrix, what do you know for certain has gone wrong?',
    'A structural engineer has a 4×4 stiffness matrix for a simple truss and needs to check invertibility. They propose computing the determinant by cofactor expansion. What would you recommend instead, and why?',
    'The adjugate formula $A^{-1} = \\text{adj}(A)/\\det(A)$ breaks down when $\\det(A) = 0$. What does $\\text{adj}(A)$ look like for a singular matrix — is it also zero, or can it be nonzero?',
    'For a diagonal matrix $D = \\text{diag}(d_1, d_2, d_3)$, compute the cofactor expansion along row 1 directly and verify it gives $d_1 d_2 d_3$. Now compute $\\text{adj}(D)$ and confirm $D^{-1} = \\text{adj}(D)/\\det(D)$ gives $\\text{diag}(1/d_1, 1/d_2, 1/d_3)$.',
  ],

  // ── Debugging ─────────────────────────────────────────────────
  debugging: [
    {
      code: `A = [1 2 3; 4 5 6; 7 8 9];
C11 = det([5 6; 8 9]);
C12 = det([4 6; 7 9]);
C13 = det([4 5; 7 8]);
detA = A(1,1)*C11 + A(1,2)*C12 + A(1,3)*C13`,
      issue: 'The cofactor signs are missing. $C_{12}$ should be negative ($(-1)^{1+2} = -1$) but the code multiplies $a_{12}$ by the positive minor.',
      fix: 'Apply signs: `C12 = -det([4 6; 7 9])`. The expansion should be `A(1,1)*C11 - A(1,2)*det([4 6; 7 9]) + A(1,3)*C13`. Alternatively, define `C12 = (-1)*det([4 6; 7 9])` to be explicit.',
    },
    {
      code: `% Building the adjugate
cofactor_matrix = [C11 C12 C13; C21 C22 C23; C31 C32 C33];
adj_A = cofactor_matrix;   % <-- bug here
A_inv = adj_A / det(A);`,
      issue: '`adj_A` is set to the cofactor matrix without transposing. The adjugate is $C^T$, not $C$.',
      fix: 'Change to `adj_A = cofactor_matrix\'` (transpose). Entry $(i,j)$ of the adjugate is $C_{ji}$, not $C_{ij}$. Omitting the transpose gives a wrong inverse that fails the check $A \\cdot A^{-1} = I$.',
    },
  ],
};
