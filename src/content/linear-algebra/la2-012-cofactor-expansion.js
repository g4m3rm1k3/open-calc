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
        type: 'procedure',
        title: 'Procedure: Compute a Determinant by Cofactor Expansion',
        body: 'Step 1. Scan every row and column. Count the zeros in each — the row or column with the most zeros is the best choice for expansion.\nStep 2. For each nonzero entry $a_{ij}$ in the chosen row/column: delete row $i$ and column $j$, then compute the determinant of the remaining $(n-1)\\times(n-1)$ submatrix — this is the minor $M_{ij}$.\nStep 3. Attach the sign $(-1)^{i+j}$: positive if $i+j$ is even, negative if odd. Multiply: $C_{ij} = (-1)^{i+j} M_{ij}$.\nStep 4. Sum all nonzero-entry contributions: $\\det(A) = \\sum_{j} a_{ij} C_{ij}$ (or over $i$ for column expansion).\nStep 5. Verify: expand along a second row or column — you must get the same answer. Any discrepancy means a sign or submatrix error.',
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
                'Expanding along a row with zeros skips entire minor computations — each zero entry contributes nothing to the sum. Here `det` is computed two ways: naive row 1 expansion (all three minors), and strategic expansion along the sparsest row (only non-zero entries need minors). Both give the same determinant but the second uses fewer multiplications.',
                '`A([2 3], [1 3])` is MATLAB submatrix indexing: select rows 2 and 3, columns 1 and 3, to get the $2\\times 2$ minor for position $(1,2)$. The sign $(-1)^{1+2} = -1$ flips that minor\'s contribution.',
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
            {
              id: 4,
              cellTitle: 'Challenge: adjugate of a singular matrix and the null space connection',
              prose: [
                'When det(A) = 0, the formula A^{-1} = adj(A)/det(A) fails — but adj(A) itself is still well-defined. This cell computes adj(A) for a singular matrix, verifies A*adj(A) = 0 (since det(A)=0, the adjugate identity gives the zero matrix), then checks that every column of adj(A) lies in the null space of A. This connects cofactors directly to the Fredholm alternative: the adjugate "discovers" the null space without row reduction.',
                'The loop `for j = 1:3; disp(norm(A * adj_A(:,j))); end` computes `||A * col_j||` for each column of adj(A). Each value should be near machine epsilon (~1e-14), confirming A * col_j = 0. The last block uses null(A) to find the null space by SVD and verifies that the nonzero column of adj(A) is a scalar multiple of that null vector.',
              ],
              code: `% Build a rank-1 matrix (two identical rows)
A = [1 2 3; 2 4 6; 0 1 2];
disp('Singular matrix A (row 2 = 2*row 1):'); disp(A)
disp(['det(A) = ', num2str(det(A))])

% Compute adj(A) using the cofactor loop
n = 3;
C_mat = zeros(n);
for i = 1:n
    for j = 1:n
        rows = setdiff(1:n, i);
        cols = setdiff(1:n, j);
        C_mat(i,j) = (-1)^(i+j) * det(A(rows, cols));
    end
end
adj_A = C_mat';
disp('adj(A):'); disp(adj_A)

% Verify A*adj(A) = det(A)*I = 0
disp('A * adj(A) should be zero matrix:')
disp(round(A * adj_A, 10))

% Check each column of adj(A) is in N(A)
disp('Norm of A * each column of adj(A) (should be ~0):')
for j = 1:n
    fprintf('  col %d: %.2e\\n', j, norm(A * adj_A(:,j)))
end

% Compare with null space from SVD
null_vec = null(A);
disp('Null space vector from null(A):'); disp(null_vec)
nonzero_col = adj_A(:, find(any(abs(adj_A) > 1e-10), 1));
disp('First nonzero column of adj(A):'); disp(nonzero_col)
disp('Ratio (should be scalar multiple):')
disp(nonzero_col ./ null_vec(:,1))`,
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
              prose: [
                'The `minor(M, row, col)` function uses `np.delete` twice: first delete the specified row, then delete the specified column from the result. This extracts the $(n-1)\\times(n-1)$ submatrix that defines minor $M_{ij}$. The `cofactor(M, i, j)` function multiplies the minor\'s determinant by $(-1)^{i+j}$ — the checkerboard sign.',
                'The list comprehension `[[cofactor(A, i, j) for j in range(3)] for i in range(3)]` builds the full $3 \\times 3$ cofactor matrix in one pass. The expansion `sum(A[0,j] * C[0,j] for j in range(3))` uses row 0 — matching $\\det(A) = \\sum_j a_{0j}C_{0j}$. The heatmap visualization makes the sign pattern visible: blue entries are negative cofactors, red are positive.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

A = np.array([[1., 2., 3.], [0., 4., 5.], [1., 0., 6.]])

# Cofactor expansion along row 1
def minor(M, row, col):
    return np.delete(np.delete(M, row, 0), col, 1)

def cofactor(M, i, j):
    return ((-1)**(i+j)) * np.linalg.det(minor(M, i, j))

C = np.array([[cofactor(A, i, j) for j in range(3)] for i in range(3)])
det_expansion = sum(A[0,j] * C[0,j] for j in range(3))

print(f"det(A) by cofactor expansion = {det_expansion:.4f}")
print(f"np.linalg.det(A) = {np.linalg.det(A):.4f}")
print(f"Match: {np.isclose(det_expansion, np.linalg.det(A))}")
print("
Cofactor matrix C:")
print(C.round(4))

fig, axes = plt.subplots(1, 3, figsize=(11, 3.5))
for ax, (M, title) in zip(axes, [(A, f'A (det={np.linalg.det(A):.1f})'), 
                                   (C, 'Cofactor matrix C'),
                                   (C.T, 'adj(A) = C^T
A_inv = adj(A)/det')]):
    lim = max(abs(M).max(), 1)
    ax.imshow(M, cmap='RdBu_r', aspect='equal', vmin=-lim, vmax=lim)
    ax.set_title(title, fontsize=11)
    for i in range(3):
        for j in range(3):
            ax.text(j, i, f'{M[i,j]:.1f}', ha='center', va='center', fontsize=12,
                    color='white' if abs(M[i,j]) > lim*0.6 else 'black')
    ax.set_xticks([]); ax.set_yticks([])
plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: 'Adjugate and the inverse formula',
              prose: [
                'The `cofactor_matrix(A)` function uses `np.ix_(rows, cols)` for fancy indexing — `np.ix_` broadcasts two index arrays so `A[np.ix_(rows, cols)]` selects the correct submatrix without a loop over entries. The transpose `adj_A = C.T` moves entry $C_{ij}$ to position $(j,i)$, which is the definition: $(\\text{adj}(A))_{ij} = C_{ji}$.',
                'Dividing `adj_A / d` gives $A^{-1} = \\text{adj}(A)/\\det(A)$. The verification `A @ adj_A` should print `det(A)*I` — diagonal entries equal $\\det(A)$ (cofactor expansion along each row), off-diagonal entries equal 0 (alien cofactor sums). The maximum absolute difference between methods should be near $10^{-14}$ (floating-point precision).',
              ],
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
            {
              id: 3,
              cellTitle: 'Visualize the sign checkerboard and cofactor magnitudes',
              prose: [
                'Every cofactor carries the sign $(-1)^{i+j}$ from the checkerboard pattern plus a magnitude from the corresponding minor. This cell overlays both on a heatmap: the sign pattern is shown as the checkerboard template, and the actual cofactor magnitudes reveal which minors are largest. Strategic expansion picks the row or column where the magnitudes of the nonzero entries are smallest — that row/column has both zeros (skipped terms) and often simpler remaining minors.',
                'The second plot shows what happens to the cofactor matrix as a row of $A$ is scaled toward zero: the cofactor magnitudes in that row hold steady (cofactors do not depend on the entries of the row being deleted), while the corresponding column of the adjugate — which receives those cofactors transposed — grows in relative weight. Watching this helps build intuition for why singular matrices can have nonzero adjugates.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

def cofactor_matrix(A):
    n = A.shape[0]
    C = np.zeros((n, n))
    for i in range(n):
        for j in range(n):
            rows = np.delete(np.arange(n), i)
            cols = np.delete(np.arange(n), j)
            C[i, j] = ((-1)**(i+j)) * np.linalg.det(A[np.ix_(rows, cols)])
    return C

A = np.array([[2., 1., 3.], [0., 4., 1.], [5., 2., 6.]])
C = cofactor_matrix(A)
adj_A = C.T

sign_pattern = np.array([[(-1)**(i+j) for j in range(3)] for i in range(3)], dtype=float)

fig, axes = plt.subplots(1, 3, figsize=(12, 3.5))
titles = ['Sign checkerboard $(-1)^{i+j}$', 'Cofactor matrix C', 'Adjugate adj(A) = C^T']
matrices = [sign_pattern, C, adj_A]
for ax, M, title in zip(axes, matrices, titles):
    lim = max(abs(M).max(), 1)
    im = ax.imshow(M, cmap='RdBu_r', vmin=-lim, vmax=lim, aspect='equal')
    ax.set_title(title, fontsize=10)
    for i in range(3):
        for j in range(3):
            ax.text(j, i, f'{M[i,j]:.1f}', ha='center', va='center',
                    fontsize=12, color='white' if abs(M[i,j]) > lim*0.6 else 'black')
    ax.set_xticks(range(3)); ax.set_yticks(range(3))
    ax.set_xticklabels(['j=0','j=1','j=2']); ax.set_yticklabels(['i=0','i=1','i=2'])
    plt.colorbar(im, ax=ax, shrink=0.8)
plt.suptitle(f'A: det={np.linalg.det(A):.1f}  — cofactors, then transpose for adjugate', fontsize=11)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 4,
              cellTitle: 'Challenge: adjugate of a near-singular matrix',
              prose: [
                'When $\\det(A) \\to 0$, the inverse $A^{-1} = \\text{adj}(A)/\\det(A)$ blows up — but $\\text{adj}(A)$ itself remains finite. This challenge explores that limit: vary a parameter $t$ that drives $A$ toward singularity ($t \\to 0$ makes two rows nearly equal), plot the condition number $\\kappa(A)$ and the norm of $\\text{adj}(A)$, and observe that the adjugate norm stays bounded while the inverse norm diverges.',
                'At $t = 0$ exactly, $A$ is singular: $\\text{adj}(A)$ is nonzero and its columns lie in $N(A)$ (every column satisfies $Ax = 0$). This is the algebraic statement of the Fredholm alternative: the adjugate "detects" the null space even when the inverse fails to exist.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

def cofactor_matrix(A):
    n = A.shape[0]
    C = np.zeros((n, n))
    for i in range(n):
        for j in range(n):
            rows = np.delete(np.arange(n), i)
            cols = np.delete(np.arange(n), j)
            C[i, j] = ((-1)**(i+j)) * np.linalg.det(A[np.ix_(rows, cols)])
    return C

t_vals = np.linspace(0.01, 1.0, 200)
cond_vals, adj_norms, det_vals = [], [], []

for t in t_vals:
    A = np.array([[1., 2., 3.],
                  [1. + t, 2., 3.],   # row 1 approaches row 0 as t→0
                  [0., 1., 2.]])
    d = np.linalg.det(A)
    C = cofactor_matrix(A)
    adj_norms.append(np.linalg.norm(C.T))
    det_vals.append(abs(d))
    cond_vals.append(np.linalg.cond(A))

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
ax1.semilogy(t_vals, cond_vals, 'b-', lw=2, label='cond(A)')
ax1.semilogy(t_vals, 1/np.array(det_vals), 'r--', lw=2, label='1/|det(A)|')
ax1.set_xlabel('t  (0 = singular)'); ax1.set_ylabel('value (log scale)')
ax1.set_title('Condition number and 1/det blow up as t→0')
ax1.legend(); ax1.grid(True, alpha=0.3)

ax2.plot(t_vals, adj_norms, 'g-', lw=2, label='||adj(A)||')
ax2.set_xlabel('t  (0 = singular)'); ax2.set_ylabel('Frobenius norm')
ax2.set_title('Adjugate norm stays bounded — adj(A) is finite even at singularity')
ax2.legend(); ax2.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()

# At t=0 (singular), verify adj(A) columns lie in N(A)
A_sing = np.array([[1., 2., 3.], [1., 2., 3.], [0., 1., 2.]])
adj_sing = cofactor_matrix(A_sing).T
print("A * adj(A_singular) (should be zero matrix):")
print(np.round(A_sing @ adj_sing, 10))`,
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

  // ── Rigor ─────────────────────────────────────────────────────
  rigor: {
    prose: [
      `The formal foundation of cofactor expansion is the permutation definition of the determinant: $\\det(A) = \\sum_{\\sigma \\in S_n} \\text{sgn}(\\sigma) \\prod_{i=1}^n a_{i,\\sigma(i)}$, where the sum runs over all $n!$ permutations of $\\{1,\\ldots,n\\}$ and $\\text{sgn}(\\sigma) \\in \\{\\pm 1\\}$ is the signature (parity) of $\\sigma$. Laplace's theorem partitions these $n!$ permutations into $n$ families, one for each possible value $\\sigma(i) = j$ in a fixed row $i$. Each family contributes $a_{ij}$ times the signed sum over all permutations of the remaining $n-1$ indices — which is exactly the cofactor $C_{ij} = (-1)^{i+j}\\det(A_{ij})$. The sign $(-1)^{i+j}$ encodes the parity of the transpositions required to move entry $(i,j)$ to the top-left corner while keeping the remaining block in natural order.`,
      `The "alien cofactor" identity — $\\sum_j a_{ij}C_{kj} = 0$ for $i \\neq k$ — is both surprising and foundational. To prove it, form a new matrix $\\tilde{A}$ by replacing row $k$ of $A$ with a copy of row $i$ (leaving all other rows unchanged). Applying Laplace's theorem to $\\tilde{A}$ along its row $k$ gives exactly $\\sum_j a_{ij}C_{kj}$, because the cofactors of $\\tilde{A}$ along row $k$ are identical to those of $A$ (the submatrices obtained by deleting row $k$ are the same). But $\\tilde{A}$ has two identical rows ($i$ and $k$), so $\\det(\\tilde{A}) = 0$. Therefore $\\sum_j a_{ij}C_{kj} = 0$. This single argument simultaneously proves that the off-diagonal entries of $A \\cdot \\text{adj}(A)$ are zero, establishes the adjugate identity $A \\cdot \\text{adj}(A) = \\det(A)\\, I$, and validates Cramer's rule.`,
      `Geometrically, the cofactor $C_{ij}$ measures the signed $(n-1)$-dimensional volume of the parallelepiped formed by all rows of $A$ except row $i$, projected onto the hyperplane perpendicular to the $j$-th standard basis vector. For a $3 \\times 3$ matrix, $C_{13}$ is the signed area of the parallelogram formed by rows 2 and 3 in the $xy$-plane. The adjugate identity $A \\cdot \\text{adj}(A) = \\det(A)\\, I$ then asserts that these projected-area vectors combine to scale space by the full 3D volume $\\det(A)$ in each coordinate direction. When $\\det(A) = 0$, the matrix collapses space to a lower dimension; in that case $\\text{adj}(A)$ need not be zero — it captures the geometry of the remaining image. In fact, if $\\text{rank}(A) = n-1$, then $\\text{rank}(\\text{adj}(A)) = 1$; if $\\text{rank}(A) < n-1$, then $\\text{adj}(A) = 0$.`,
      `The computational cost of cofactor expansion is $O(n!)$: computing an $n \\times n$ determinant requires $n$ minors of size $(n-1)\\times(n-1)$, each recursively requiring $n-1$ smaller minors, yielding $n!$ scalar multiplications total. Gaussian elimination uses $O(n^3)$ operations — for $n=15$ this is $10^{12}$ versus $3375$. Despite this, cofactor expansion is indispensable for three reasons. First, the characteristic polynomial $p(\\lambda) = \\det(A - \\lambda I)$ is obtained by symbolic cofactor expansion; its roots are the eigenvalues of $A$ (Lesson LA3-001), and closed-form eigenvalue formulas for $2 \\times 2$ and $3 \\times 3$ matrices all derive from it. Second, Cramer's rule (Lesson LA2-008) expresses each solution component of $Ax = b$ as a ratio of two determinants, built directly from the adjugate identity. Third, in optimal control and sensitivity analysis, Jacobi's formula $\\frac{d}{dt}\\det(A(t)) = \\det(A)\\,\\text{tr}(A^{-1}\\dot{A})$ — a consequence of the adjugate — connects determinant derivatives to matrix traces and underlies the matrix exponential.`,
    ],
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
    {
      id: 'ex-la2-012-3',
      title: 'Full adjugate and inverse — 3×3',
      statement: 'Compute all nine cofactors of $A = \\begin{bmatrix}1&1&1\\\\1&2&3\\\\1&4&9\\end{bmatrix}$, form the adjugate, and find $A^{-1}$. Then solve $Ax = \\begin{bmatrix}1\\\\0\\\\0\\end{bmatrix}$.',
      steps: [
        {
          explanation: 'First compute $\\det(A)$ by expanding along row 1. Entry $a_{13} = 1$ requires the minor $\\det\\begin{bmatrix}2&3\\\\4&9\\end{bmatrix} = 6$, $a_{12} = 1$ gives minor $\\det\\begin{bmatrix}1&3\\\\1&9\\end{bmatrix} = 6$, $a_{11} = 1$ gives minor $\\det\\begin{bmatrix}2&3\\\\4&9\\end{bmatrix}\\!$… let me be systematic.',
          math: '\\det(A) = 1\\cdot(18-12) - 1\\cdot(9-3) + 1\\cdot(4-2) = 6 - 6 + 2 = 2',
        },
        {
          explanation: 'Compute the nine cofactors. Row 1: signs are $+, -, +$. $C_{11} = \\det\\begin{bmatrix}2&3\\\\4&9\\end{bmatrix} = 18-12 = 6$. $C_{12} = -\\det\\begin{bmatrix}1&3\\\\1&9\\end{bmatrix} = -(9-3) = -6$. $C_{13} = \\det\\begin{bmatrix}1&2\\\\1&4\\end{bmatrix} = 4-2 = 2$.',
          math: 'C_{11}=6,\\quad C_{12}=-6,\\quad C_{13}=2',
        },
        {
          explanation: 'Row 2: signs are $-, +, -$. $C_{21} = -\\det\\begin{bmatrix}1&1\\\\4&9\\end{bmatrix} = -(9-4) = -5$. $C_{22} = \\det\\begin{bmatrix}1&1\\\\1&9\\end{bmatrix} = 9-1 = 8$. $C_{23} = -\\det\\begin{bmatrix}1&1\\\\1&4\\end{bmatrix} = -(4-1) = -3$.',
          math: 'C_{21}=-5,\\quad C_{22}=8,\\quad C_{23}=-3',
        },
        {
          explanation: 'Row 3: signs are $+, -, +$. $C_{31} = \\det\\begin{bmatrix}1&1\\\\2&3\\end{bmatrix} = 3-2 = 1$. $C_{32} = -\\det\\begin{bmatrix}1&1\\\\1&3\\end{bmatrix} = -(3-1) = -2$. $C_{33} = \\det\\begin{bmatrix}1&1\\\\1&2\\end{bmatrix} = 2-1 = 1$.',
          math: 'C_{31}=1,\\quad C_{32}=-2,\\quad C_{33}=1',
        },
        {
          explanation: 'Form the cofactor matrix and transpose to get the adjugate. The $(i,j)$ entry of $\\text{adj}(A)$ is $C_{ji}$ — column $j$ of $C$ becomes row $j$ of $\\text{adj}(A)$.',
          math: 'C = \\begin{bmatrix}6&-6&2\\\\-5&8&-3\\\\1&-2&1\\end{bmatrix},\\quad \\text{adj}(A) = C^T = \\begin{bmatrix}6&-5&1\\\\-6&8&-2\\\\2&-3&1\\end{bmatrix}',
        },
        {
          explanation: 'Apply the inverse formula $A^{-1} = \\text{adj}(A)/\\det(A) = \\text{adj}(A)/2$. Solve $Ax = [1,0,0]^T$ by multiplying: $x = A^{-1}[1,0,0]^T$ = first column of $A^{-1}$.',
          math: 'A^{-1} = \\frac{1}{2}\\begin{bmatrix}6&-5&1\\\\-6&8&-2\\\\2&-3&1\\end{bmatrix},\\quad x = \\begin{bmatrix}3\\\\-3\\\\1\\end{bmatrix}',
        },
        {
          explanation: 'Verify: $Ax = [1\\cdot3+1\\cdot(-3)+1\\cdot1,\\; 1\\cdot3+2\\cdot(-3)+3\\cdot1,\\; 1\\cdot3+4\\cdot(-3)+9\\cdot1]^T = [1,0,0]^T$ ✓.',
          math: 'A\\begin{bmatrix}3\\\\-3\\\\1\\end{bmatrix} = \\begin{bmatrix}3-3+1\\\\3-6+3\\\\3-12+9\\end{bmatrix} = \\begin{bmatrix}1\\\\0\\\\0\\end{bmatrix}\\checkmark',
        },
      ],
      answer: '$A^{-1} = \\frac{1}{2}\\begin{bmatrix}6&-5&1\\\\-6&8&-2\\\\2&-3&1\\end{bmatrix}$, and $x = [3,-3,1]^T$',
    },
  ],

  // ── Challenges ────────────────────────────────────────────────
  challenges: [
    {
      id: 'ch-la2-012-1',
      difficulty: 'easy',
      title: 'Strategic expansion — choose the best row',
      statement: 'Compute $\\det\\begin{bmatrix}0&0&2\\\\1&3&0\\\\0&4&1\\end{bmatrix}$ using cofactor expansion. First identify the most efficient row or column, then carry out the expansion.',
      hints: [
        'Count the zeros: row 1 has two zeros ($a_{11}=0$, $a_{12}=0$). Expanding along row 1 requires only one minor.',
        'With $a_{11}=0$ and $a_{12}=0$, only $a_{13}=2$ contributes. Sign at $(1,3)$: $(-1)^{1+3}=+1$.',
        'The required minor is $\\det\\begin{bmatrix}1&3\\\\0&4\\end{bmatrix}$.',
      ],
      walkthrough: [
        'Expand along row 1. Only $a_{13} = 2$ is nonzero.',
        '$\\det = 2 \\cdot C_{13} = 2 \\cdot (+1) \\cdot \\det\\begin{bmatrix}1&3\\\\0&4\\end{bmatrix} = 2(4-0) = 8$.',
        'Verify by expanding along column 1 instead: $a_{11}=0$, $a_{21}=1$, $a_{31}=0$. Only row 2 contributes: $1 \\cdot C_{21} = 1 \\cdot (-1)^{2+1} \\cdot \\det\\begin{bmatrix}0&2\\\\4&1\\end{bmatrix} = (-1)(0-8) = 8$ ✓.',
      ],
      answer: '$\\det = 8$',
    },
    {
      id: 'ch-la2-012-2',
      difficulty: 'medium',
      title: 'Adjugate identity — verify $A \\cdot \\text{adj}(A) = \\det(A)\\, I$',
      statement: 'For $A = \\begin{bmatrix}2&0&1\\\\0&3&0\\\\1&0&2\\end{bmatrix}$, compute $\\det(A)$, find all nine cofactors, form $\\text{adj}(A)$, and verify the identity $A \\cdot \\text{adj}(A) = \\det(A)\\, I$ directly by matrix multiplication.',
      hints: [
        'Row 1 has a zero — expand along row 1 with entries $2, 0, 1$.',
        'Row 2 is sparse: $a_{21}=0$, $a_{22}=3$, $a_{23}=0$. The entire row 2 of the cofactor matrix requires only one minor.',
        'After finding the cofactor matrix $C$, compute $\\text{adj}(A) = C^T$ and multiply $A \\cdot \\text{adj}(A)$.',
      ],
      walkthrough: [
        '$\\det(A)$: expand along row 1. $C_{11}=\\det\\begin{bmatrix}3&0\\\\0&2\\end{bmatrix}=6$; $C_{12}=0$ (zero entry); $C_{13}=\\det\\begin{bmatrix}0&3\\\\1&0\\end{bmatrix}=0-3=-3$, sign $(+1)(-3)=-3$. So $\\det=2(6)+1(-3)=12-3=9$.',
        'All nine cofactors: $C_{11}=6,C_{12}=0,C_{13}=-3$; $C_{21}=0,C_{22}=4-1=3,C_{23}=0$; $C_{31}=-3,C_{32}=0,C_{33}=6$.',
        '$\\text{adj}(A)=C^T=\\begin{bmatrix}6&0&-3\\\\0&3&0\\\\-3&0&6\\end{bmatrix}$.',
        '$A\\cdot\\text{adj}(A)=\\begin{bmatrix}2&0&1\\\\0&3&0\\\\1&0&2\\end{bmatrix}\\begin{bmatrix}6&0&-3\\\\0&3&0\\\\-3&0&6\\end{bmatrix}=\\begin{bmatrix}12-3&0&-6+6\\\\0&9&0\\\\6-6&0&-3+12\\end{bmatrix}=\\begin{bmatrix}9&0&0\\\\0&9&0\\\\0&0&9\\end{bmatrix}=9I$ ✓.',
      ],
      answer: '$\\det(A)=9$ and $A\\cdot\\text{adj}(A)=9I$ confirmed.',
    },
    {
      id: 'ch-la2-012-3',
      difficulty: 'hard',
      title: 'Adjugate of a singular matrix',
      statement: 'Let $A = \\begin{bmatrix}1&2&3\\\\2&4&6\\\\0&1&1\\end{bmatrix}$. (a) Show $A$ is singular. (b) Compute $\\text{adj}(A)$. (c) Verify that every column of $\\text{adj}(A)$ lies in the null space of $A$. (d) Use this to explain why $A \\cdot \\text{adj}(A) = 0$ when $A$ is singular.',
      hints: [
        'Row 2 is exactly $2 \\times$ row 1 — a matrix with a linearly dependent row has determinant zero.',
        'Even though $\\det(A)=0$, you can still compute all nine cofactors by deleting rows and columns.',
        'A · adj(A) = det(A)·I = 0·I = 0 by the adjugate identity — every column of adj(A) satisfies Ax=0.',
      ],
      walkthrough: [
        '(a) Row 2 = 2×Row 1, so the matrix has rank < 3. Verify: $\\det(A) = 1(4-6) - 2(2-0) + 3(2-0) = -2-4+6=0$.',
        '(b) Cofactors: $C_{11}=\\det\\begin{bmatrix}4&6\\\\1&1\\end{bmatrix}=4-6=-2$; $C_{12}=-\\det\\begin{bmatrix}2&6\\\\0&1\\end{bmatrix}=-(2-0)=-2$; $C_{13}=\\det\\begin{bmatrix}2&4\\\\0&1\\end{bmatrix}=2-0=2$; $C_{21}=-\\det\\begin{bmatrix}2&3\\\\1&1\\end{bmatrix}=-(2-3)=1$; $C_{22}=\\det\\begin{bmatrix}1&3\\\\0&1\\end{bmatrix}=1$; $C_{23}=-\\det\\begin{bmatrix}1&2\\\\0&1\\end{bmatrix}=-1$; $C_{31}=\\det\\begin{bmatrix}2&3\\\\4&6\\end{bmatrix}=12-12=0$; $C_{32}=-\\det\\begin{bmatrix}1&3\\\\2&6\\end{bmatrix}=-(6-6)=0$; $C_{33}=\\det\\begin{bmatrix}1&2\\\\2&4\\end{bmatrix}=4-4=0$.',
        '$C=\\begin{bmatrix}-2&-2&2\\\\1&1&-1\\\\0&0&0\\end{bmatrix}$, $\\text{adj}(A)=C^T=\\begin{bmatrix}-2&1&0\\\\-2&1&0\\\\2&-1&0\\end{bmatrix}$.',
        '(c) Check column 1 of adj(A): $A\\begin{bmatrix}-2\\\\-2\\\\2\\end{bmatrix}=\\begin{bmatrix}-2-4+6\\\\-4-8+12\\\\-2+2\\end{bmatrix}=\\begin{bmatrix}0\\\\0\\\\0\\end{bmatrix}$ ✓.',
        '(d) By the adjugate identity: $A\\cdot\\text{adj}(A)=\\det(A)\\cdot I = 0\\cdot I = 0$. Every column of adj(A) is in $N(A)$ — the adjugate "knows" the null space even when the inverse does not exist.',
      ],
      answer: '$\\text{adj}(A)=\\begin{bmatrix}-2&1&0\\\\-2&1&0\\\\2&-1&0\\end{bmatrix}$; all columns lie in $N(A)$ since $\\det(A)=0$.',
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
    { id: 'cp-la2-012-7', label: 'Complete: Example 3 — compute all 9 cofactors, form the adjugate, and solve $Ax=b$ for a 3×3 matrix', type: 'example' },
    { id: 'cp-la2-012-8', label: 'Run: OpenMAT cell 1 — compute all 9 cofactors of a 3×3 matrix and verify the adjugate identity', type: 'lab' },
    { id: 'cp-la2-012-9', label: 'Run: Python cell 3 — visualize how cofactor expansion changes when rows scale or become dependent', type: 'lab' },
    { id: 'cp-la2-012-10', label: 'Attempt: Challenge 1 — identify the sparsest row and compute det efficiently', type: 'challenge' },
    { id: 'cp-la2-012-11', label: 'Attempt: Challenge 3 — compute adj(A) for a singular matrix and verify its columns lie in N(A)', type: 'challenge' },
  ],

  // ── Assessment ──────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'la2-012-assess-1',
        type: 'choice',
        text: 'What is the sign of the cofactor $C_{23}$?',
        options: [
          '$(-1)^{2+3} = -1$ — the cofactor is $-M_{23}$',
          '$(-1)^{2+3} = +1$',
          'The sign is always positive for row 2',
          'Sign depends on the matrix entries',
        ],
        answer: '$(-1)^{2+3} = -1$ — the cofactor is $-M_{23}$',
        hints: ['$C_{ij} = (-1)^{i+j} M_{ij}$. At $(2,3)$: exponent $= 2+3 = 5$ (odd), so $(-1)^5 = -1$.'],
      },
      {
        id: 'la2-012-assess-2',
        type: 'choice',
        text: 'For a $2\\times 2$ matrix $A = \\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}$, what is $\\text{adj}(A)$?',
        options: [
          '$\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$ — swap diagonal, negate off-diagonal',
          '$\\begin{bmatrix}a&-b\\\\-c&d\\end{bmatrix}$',
          '$\\begin{bmatrix}d&c\\\\b&a\\end{bmatrix}$',
          '$\\begin{bmatrix}-d&b\\\\c&-a\\end{bmatrix}$',
        ],
        answer: '$\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$ — swap diagonal, negate off-diagonal',
        hints: ['Cofactors: $C_{11} = d$, $C_{12} = -c$, $C_{21} = -b$, $C_{22} = a$. Adjugate = transpose of cofactor matrix: $\\text{adj}(A)_{ij} = C_{ji}$.'],
      },
      {
        id: 'la2-012-assess-3',
        type: 'choice',
        text: 'If $A \\cdot \\text{adj}(A) = kI$, what is $k$?',
        options: [
          '$k = \\det(A)$',
          '$k = \\text{tr}(A)$',
          '$k = 1$ always',
          '$k = \\text{rank}(A)$',
        ],
        answer: '$k = \\det(A)$',
        hints: ['The adjugate identity: $A \\cdot \\text{adj}(A) = \\det(A) \\cdot I$. This follows from cofactor expansion along each row simultaneously.'],
      },
      {
        id: 'la2-012-assess-4',
        type: 'choice',
        text: 'You are computing $\\det(A)$ for a $3\\times 3$ matrix with Row 2 = $[0, 5, 0]$. Which is the most efficient expansion?',
        options: [
          'Expand along row 2 — only one non-zero entry, so only one minor needs computing',
          'Expand along row 1 — always the default',
          'Expand along column 1 — easier indexing',
          'Use Sarrus\'s rule — always fastest for $3\\times 3$',
        ],
        answer: 'Expand along row 2 — only one non-zero entry, so only one minor needs computing',
        hints: ['Row 2 has two zeros: $a_{21} = 0$, $a_{23} = 0$. Only the $a_{22} = 5$ term contributes: $\\det = 5 \\cdot C_{22}$. One $2\\times 2$ minor instead of three.'],
      },
    ],
  },

  // ── Quiz ───────────────────────────────────────────────────────
  quiz: [
    {
      id: 'q-la2-012-1',
      type: 'choice',
      text: 'The minor $M_{23}$ of a 3×3 matrix is:',
      options: [
        'The determinant of the 2×2 submatrix obtained by deleting row 2 and column 3',
        'The (2,3) entry of the matrix multiplied by $(-1)^{2+3}$',
        'The cofactor at position (2,3) with the sign included',
        'The determinant of the full matrix with row 2 set to zero',
      ],
      answer: 'The determinant of the 2×2 submatrix obtained by deleting row 2 and column 3',
      hints: ['The minor $M_{ij}$ is always the determinant of the submatrix after deleting row $i$ and column $j$ — no sign. The sign is added separately to form the cofactor $C_{ij}=(-1)^{i+j}M_{ij}$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la2-012-2',
      type: 'choice',
      text: 'The cofactor sign at position $(3,2)$ is:',
      options: ['$-1$', '$+1$', 'Depends on the matrix entries', '$(-1)^{6}$'],
      answer: '$-1$',
      hints: ['$C_{ij} = (-1)^{i+j}M_{ij}$. At $(3,2)$: $(-1)^{3+2} = (-1)^5 = -1$. The sign depends only on position, never on entry values.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la2-012-3',
      type: 'choice',
      text: 'If you expand a 3×3 determinant along a row that is all zeros, the result is:',
      options: ['$0$', 'Undefined', 'The sum of the three cofactors', 'Equal to $\\det$ of the other two rows'],
      answer: '$0$',
      hints: ['Each term is $a_{ij}C_{ij}$. With every $a_{ij}=0$, every term is zero. A zero row forces the matrix to be singular, so $\\det=0$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la2-012-4',
      type: 'choice',
      text: 'The adjugate of $A$ is:',
      options: [
        'The transpose of the cofactor matrix',
        'The cofactor matrix (without transposing)',
        'The inverse of $A$ divided by $\\det(A)$',
        'The matrix of minors without signs',
      ],
      answer: 'The transpose of the cofactor matrix',
      hints: ['$\\text{adj}(A) = C^T$. The transpose is essential: entry $(i,j)$ of adj(A) is $C_{ji}$, not $C_{ij}$. Without transposing, $A \\cdot C \\neq \\det(A)I$.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la2-012-5',
      type: 'choice',
      text: 'For a 2×2 matrix $\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}$, the adjugate is:',
      options: [
        '$\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$',
        '$\\begin{bmatrix}a&-b\\\\-c&d\\end{bmatrix}$',
        '$\\begin{bmatrix}d&-c\\\\-b&a\\end{bmatrix}$',
        '$\\begin{bmatrix}d&b\\\\c&a\\end{bmatrix}$',
      ],
      answer: '$\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$',
      hints: ['Compute the four cofactors: $C_{11}=d$, $C_{12}=-c$, $C_{21}=-b$, $C_{22}=a$. Adjugate = transpose: $(C^T)_{ij}=C_{ji}$, swapping $C_{12}$ and $C_{21}$ gives $\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la2-012-6',
      type: 'choice',
      text: 'Which identity does the adjugate satisfy?',
      options: [
        '$A \\cdot \\text{adj}(A) = \\det(A) \\cdot I$',
        '$A \\cdot \\text{adj}(A) = I$',
        '$\\text{adj}(A) \\cdot A = A^{-1}$',
        '$\\text{adj}(A) = \\det(A) \\cdot A^{-1}$',
      ],
      answer: '$A \\cdot \\text{adj}(A) = \\det(A) \\cdot I$',
      hints: ['The adjugate identity: diagonal entries of the product are cofactor expansions along each row (= det(A)); off-diagonal entries mix rows with wrong-row cofactors (= 0).'],
      reviewSection: 'math',
    },
    {
      id: 'q-la2-012-7',
      type: 'choice',
      text: 'Expanding a 4×4 determinant by cofactor expansion along one row requires computing:',
      options: [
        'Four 3×3 determinants',
        'Six 2×2 determinants',
        'Nine 2×2 determinants',
        'Sixteen 1×1 determinants',
      ],
      answer: 'Four 3×3 determinants',
      hints: ['One row of a 4×4 has four entries. Each nonzero entry requires one 3×3 minor. Those 3×3 minors each need three 2×2 determinants — 12 total at the bottom level. Complexity is $O(n!)$.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la2-012-8',
      type: 'choice',
      text: 'When is expanding along a column more efficient than along a row?',
      options: [
        'When the column has more zeros than any row',
        'When the column index is odd',
        'Columns are always faster due to memory layout',
        'When $\\det(A) > 0$',
      ],
      answer: 'When the column has more zeros than any row',
      hints: ['Every zero entry eliminates one minor computation. Scan all rows and columns and pick whichever has the most zeros — that is the efficient choice, regardless of row vs column.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la2-012-9',
      type: 'choice',
      text: 'The term "classical adjoint" in older texts refers to:',
      options: [
        'The adjugate $\\text{adj}(A) = C^T$',
        'The conjugate transpose $A^* = \\bar{A}^T$',
        'The inverse $A^{-1}$',
        'The cofactor matrix before transposing',
      ],
      answer: 'The adjugate $\\text{adj}(A) = C^T$',
      hints: ['Modern notation uses "adjoint" for the conjugate transpose $A^*$ and "adjugate" for $C^T$. In older texts "classical adjoint" always means $C^T$, the cofactor matrix transposed.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la2-012-10',
      type: 'choice',
      text: 'For a 3×3 matrix $A$, the sum $\\sum_j a_{1j} C_{2j}$ (entries from row 1, cofactors from row 2) equals:',
      options: ['$0$', '$\\det(A)$', '$\\text{tr}(A)$', 'The $(1,2)$ entry of $\\text{adj}(A)$'],
      answer: '$0$',
      hints: ['This is the "alien cofactor" identity. Substituting row 1 into position 2 produces a matrix with a repeated row — its determinant is zero. So $\\sum_j a_{1j}C_{2j}=0$.'],
      reviewSection: 'rigor',
    },
  ],

  // ── Mastery ────────────────────────────────────────────────────
  mastery: {
    targetLevel: 'Compute the determinant of any 3×3 matrix by cofactor expansion, form the adjugate, and recover $A^{-1}$ via the adjugate formula — with a strategy for choosing the most efficient expansion row/column.',
    solveIndependently: 'Given an arbitrary 3×3 matrix, compute $\\det(A)$ by selecting the sparsest row or column, applying the sign checkerboard pattern correctly, and assembling the expansion. Then compute all 9 cofactors, transpose to form $\\text{adj}(A)$, and compute $A^{-1} = \\text{adj}(A)/\\det(A)$ — verifying $AA^{-1} = I$ as a check.',
    explainVerbally: 'Articulate why expanding along any row or column gives the same determinant (Laplace\'s theorem), why the "wrong-row" alien cofactor sum is zero (repeated-row argument), and why the adjugate must be transposed — not just the cofactor matrix — for $A \\cdot \\text{adj}(A) = \\det(A)\\, I$ to hold.',
    detectIncorrectApplication: 'Catch three classic errors: (1) applying the sign $(-1)^{i+j}$ to the wrong position; (2) forgetting to transpose the cofactor matrix when building $\\text{adj}(A)$; (3) attempting cofactor expansion numerically on large matrices instead of using LU factorization.',
    transferToUnfamiliar: 'Apply the adjugate framework to problems not seen in the lesson: compute $\\text{adj}(A)$ for a singular matrix and identify that its columns lie in $N(A)$; use Jacobi\'s formula $\\frac{d}{dt}\\det(A(t)) = \\text{tr}(\\text{adj}(A)\\dot{A})$ to differentiate a parametrized determinant; recognize cofactor expansion underlying the characteristic polynomial $\\det(A-\\lambda I)$ used in eigenvalue computation.',
  },

  // ── Misconceptions ────────────────────────────────────────────
  misconceptions: [
    {
      falseBelief: 'The adjugate is just the cofactor matrix.',
      whyStudentsThinkIt: 'Students build the cofactor matrix and assume that is the adjugate, skipping the transpose step because the definition says "form the cofactor matrix" — the transposition is easily overlooked.',
      correctionExample: 'For $A = \\begin{bmatrix}2&1\\\\5&3\\end{bmatrix}$: cofactor matrix is $C = \\begin{bmatrix}3&-5\\\\-1&2\\end{bmatrix}$, but $\\text{adj}(A) = C^T = \\begin{bmatrix}3&-1\\\\-5&2\\end{bmatrix}$. Without transposing, $A \\cdot C = \\begin{bmatrix}6-5&-10+2\\\\15-5&-25+6\\end{bmatrix} \\neq \\det(A)\\cdot I$. With the transpose, $A \\cdot \\text{adj}(A) = \\begin{bmatrix}1&0\\\\0&1\\end{bmatrix} = \\det(A)\\cdot I$ ✓.',
      contrastCase: 'The diagonal entries of $A \\cdot C$ (no transpose) are cofactor expansions along rows of $A$ using cofactors from the wrong positions — the "alien cofactor" identity proves these are zero, not $\\det(A)$.',
    },
    {
      falseBelief: 'You can use cofactor expansion to compute inverses efficiently for large matrices.',
      whyStudentsThinkIt: 'The formula $A^{-1} = \\text{adj}(A)/\\det(A)$ looks clean and explicit, so students assume it is practical for any matrix size.',
      correctionExample: 'For a $10 \\times 10$ matrix: cofactor expansion requires $10!\\approx 3.6 \\times 10^6$ multiplications; LU factorization uses $\\frac{2}{3}(10^3) \\approx 667$ multiplications — about 5400 times faster. For $n=20$: cofactor expansion needs $\\approx 2.4 \\times 10^{18}$ operations versus LU\'s $\\approx 5300$.',
      contrastCase: 'For $n = 2$ or $n = 3$, the adjugate formula is perfectly practical and gives exact symbolic results. For $n \\geq 4$ in numerical work, always use LU or `inv(A)`; for $n \\geq 4$ in symbolic work, use computer algebra systems that optimize the expansion order.',
    },
    {
      falseBelief: 'The sign of a cofactor depends on the sign of the minor.',
      whyStudentsThinkIt: 'Students compute a negative minor and then wonder whether the overall cofactor should be doubly negative or cancel out, confusing the structural sign $(-1)^{i+j}$ with the sign of the numerical value of the minor.',
      correctionExample: 'For $C_{12}$: sign is $(-1)^{1+2}=-1$ regardless of what $M_{12}$ computes to. If $M_{12}=5$, then $C_{12}=-5$. If $M_{12}=-3$, then $C_{12}=+3$. The sign $(-1)^{i+j}$ multiplies the minor — it does not "cancel" a negative minor.',
      contrastCase: 'Draw the checkerboard $\\begin{bmatrix}+&-&+\\\\-&+&-\\\\+&-&+\\end{bmatrix}$. The sign at each position is fixed by its location. The minor at that position can be anything.',
    },
    {
      falseBelief: 'Expanding along different rows gives different determinants.',
      whyStudentsThinkIt: 'When students compute two expansions and get different answers, they assume only one is correct and doubt the theorem rather than checking their arithmetic.',
      correctionExample: 'For $A = \\begin{bmatrix}1&0&2\\\\3&1&0\\\\0&2&1\\end{bmatrix}$: expanding along row 1 (using the zero) gives $1(1-0)-0+2(6-0)=1+12=13$. Expanding along row 3 gives $0-2(0-6)+1(1-0)=12+1=13$. They agree — if they do not, an arithmetic error is present.',
      contrastCase: 'Laplace\'s theorem guarantees all expansions give the same answer. Disagreement always means a sign error, a wrong submatrix, or an arithmetic mistake — never a contradiction in the theorem.',
    },
  ],

  // ── Transfer Prompts ───────────────────────────────────────────
  transferPrompts: [
    {
      situation: 'A student computes $\\det(A) = 7$ by expanding along row 2, then gets $\\det(A) = 9$ by expanding along row 3. They conclude that determinants are row-dependent.',
      competingTechniques: 'Trust the first answer and discard the second vs. average the two results vs. identify an arithmetic error — Laplace\'s theorem guarantees both must agree',
      whyThisTechniqueWins: 'Laplace\'s theorem is exact: all expansions give the same determinant. Any discrepancy proves an error — wrong sign, wrong submatrix, or arithmetic mistake. Averaging or choosing one hides the bug. The only correct response is to recompute until both agree.',
    },
    {
      situation: 'A control engineer needs to invert a $6 \\times 6$ state-space matrix for a symbolic controller design. They must produce a closed-form formula for $A^{-1}$ in terms of the system parameters.',
      competingTechniques: 'Numerical LU factorization vs. symbolic cofactor expansion via computer algebra system vs. row reduction on the symbolic matrix by hand',
      whyThisTechniqueWins: 'For a symbolic $6 \\times 6$, CAS-based cofactor expansion produces an exact rational function of the parameters — exactly what controller design requires. Numerical LU gives a number for specific parameter values only. Hand row-reduction of a $6 \\times 6$ symbolic matrix is error-prone. For small $n$ with symbolic entries, the adjugate formula is the correct tool.',
    },
  ],

  // ── Semantics ─────────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: 'M_{ij}', meaning: 'Minor: determinant of the $(n-1)\\times(n-1)$ submatrix formed by deleting row $i$ and column $j$' },
      { symbol: 'C_{ij}', meaning: 'Cofactor: signed minor $C_{ij} = (-1)^{i+j}M_{ij}$; sign from checkerboard pattern $(-1)^{i+j}$' },
      { symbol: '\\text{adj}(A)', meaning: 'Adjugate: transpose of the cofactor matrix; $(\\text{adj}(A))_{ij} = C_{ji}$' },
      { symbol: 'A \\cdot \\text{adj}(A) = \\det(A)\\,I', meaning: 'Adjugate identity: diagonal entries equal $\\det(A)$ (correct-row expansion); off-diagonal entries equal $0$ (alien cofactor sums)' },
      { symbol: '\\sum_j a_{ij}C_{kj} = 0\\;(i\\neq k)', meaning: 'Alien cofactor identity: mixing row $i$ entries with row $k$ cofactors gives zero — equivalent to computing det of a matrix with a repeated row' },
    ],
    rulesOfThumb: [
      'Always expand along the row or column with the most zeros — each zero eliminates one minor computation.',
      'The sign $(-1)^{i+j}$ depends only on position: $+$ if $i+j$ is even, $-$ if odd. Top-left is always $+$.',
      'The adjugate is $C^T$, not $C$ — the transpose is mandatory for the identity $A\\cdot\\text{adj}(A)=\\det(A)I$ to hold.',
      'Cofactor expansion costs $O(n!)$; LU factorization costs $O(n^3)$. Never use expansion numerically for $n\\geq 5$.',
      'Verify any expansion by expanding along a second row or column — identical results confirm no sign or submatrix errors.',
    ],
  },

  // ── Spiral ────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      { id: 'la2-003', reason: 'Subspaces — null space and column space; the alien cofactor identity shows adj(A) columns lie in N(A) when A is singular' },
      { id: 'la2-005', reason: 'Determinants via row operations — cofactor expansion is the recursive definition underlying those row-operation rules' },
    ],
    futureLinks: [
      { id: 'la2-008', reason: 'Cramer\'s rule — each solution component of Ax=b is a ratio of two determinants built from the adjugate identity' },
      { id: 'la3-001', reason: 'Eigenvalues — the characteristic polynomial det(A-λI) is computed by symbolic cofactor expansion; every eigenvalue formula uses this structure' },
    ],
  },

  // ── Mental Model ──────────────────────────────────────────────
  mentalModel: `Think of cofactor expansion as dismantling a building floor by floor. Each floor (row or column) has some structural pillars (nonzero entries). For each pillar, you remove that entire floor and column, compute the determinant of the smaller building that remains (the minor), then attach a sign based on the pillar\'s grid position. Summing all pillar contributions gives the full volume. Strategically, start dismantling from the floor with the fewest pillars (most zeros). The adjugate collects all the sub-building determinants into a matrix, and the identity A·adj(A) = det(A)·I says: the original building\'s volume appears on the diagonal, while mixing floors from different buildings always gives zero (two identical floors collapse everything).`,

  // ── Debugging ─────────────────────────────────────────────────
  debugging: [
    {
      commonError: 'Missing cofactor signs in cofactor expansion',
      symptom: `A = [1 2 3; 4 5 6; 7 8 9];
C11 = det([5 6; 8 9]);
C12 = det([4 6; 7 9]);   % sign missing — should be negative
C13 = det([4 5; 7 8]);
detA = A(1,1)*C11 + A(1,2)*C12 + A(1,3)*C13
% Result: detA = 0 (wrong — should be 0 for this matrix, but wrong for others)`,
      whyItHappened: 'The minor $M_{12}$ is computed correctly, but the sign $(-1)^{1+2}=-1$ is not applied. The cofactor is $C_{12}=(-1)^{1+2}M_{12}=-M_{12}$, not $M_{12}$. Students often forget the checkerboard sign when transcribing the procedure.',
      repairStrategy: 'Apply the sign explicitly to each cofactor before using it: `C12 = -det([4 6; 7 9])`. A reliable pattern: write `C{i,j} = (-1)^(i+j) * det(submatrix)` for every entry. Alternatively, use a loop: `for i=1:3; for j=1:3; C(i,j) = (-1)^(i+j) * det(A([1:3]~=i, [1:3]~=j)); end; end`.',
    },
    {
      commonError: 'Building the adjugate without transposing the cofactor matrix',
      symptom: `cofactor_matrix = [C11 C12 C13; C21 C22 C23; C31 C32 C33];
adj_A = cofactor_matrix;   % bug: should be cofactor_matrix'
A_inv = adj_A / det(A);
% A * A_inv is not identity — off-diagonal entries are wrong`,
      whyItHappened: `The adjugate is $C^T$, not $C$. Entry $(i,j)$ of adj(A) is $C_{ji}$. Without transposing, the product $A \\cdot C$ gives the wrong-row alien cofactor sums on the off-diagonal (which are zero, not det(A)), and the diagonal entries are det(A) computed with columns rather than rows — which can coincidentally match for symmetric matrices, masking the bug.`,
      repairStrategy: `Add the transpose: \`adj_A = cofactor_matrix'\`. After computing A_inv, always verify with \`norm(A * A_inv - eye(3))\` — it should be near machine precision ($\\approx 10^{-14}$). Any value above $10^{-10}$ signals an error in the adjugate construction.`,
    },
  ],
};
