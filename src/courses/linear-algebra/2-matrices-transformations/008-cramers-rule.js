import cramersRuleUrl from '../diagrams/la-cramers-rule.svg?url'

export default {
  id: 'la2-008',
  slug: 'cramers-rule',
  chapter: 'la2',
  order: 8,
  title: "Cramer's Rule and the Adjugate",
  subtitle: "A determinant-based formula for each variable in a linear system — beautiful in theory, impractical at scale, essential for theory.",
  tags: ["Cramer's rule", 'adjugate', 'cofactor', 'determinant formula', 'inverse formula'],
  aliases: "Cramer rule adjugate adjoint cofactor matrix inverse determinant formula symbolic solution",
  timeToComplete: 25,
  coreConcept: "Cramer's Rule expresses each solution component as a ratio of determinants: $x_i = \\det(A_i)/\\det(A)$. The adjugate gives the explicit formula for $A^{-1}$. Both are theoretically fundamental but computationally impractical for $n \\geq 4$ — used for symbolic work and proofs, not numerical algorithms.",
  prerequisites: ['la2-005'],
  nextLesson: 'matrix-calculus',

  hook: {
    question: "Is there a closed-form formula that expresses the solution to Ax = b as a ratio of determinants? And why don't we use it to write programs?",
    realWorldContext: "Cramer's Rule gives an explicit formula: the $i$-th component of the solution is $x_i = \\det(A_i) / \\det(A)$, where $A_i$ is $A$ with column $i$ replaced by $\\mathbf{b}$. This formula is invaluable for: (1) symbolic CAS systems that need explicit algebraic expressions, (2) proving theoretical results (like the inverse formula $A^{-1} = \\text{adj}(A)/\\det(A)$), and (3) solving 2×2 or 3×3 systems symbolically by hand. For $n > 4$, it requires computing $n+1$ determinants each of size $n \\times n$ — exponentially slower than Gaussian elimination — so no numerical software uses it for large systems.",
    previewVisualizationId: 'LALesson06_Inverses',
  },

  intuition: {
    blocks: [
      { type: 'prose', paragraphs: [
      '**What Gaussian elimination cannot tell you directly.** You have solved $A\\mathbf{x} = \\mathbf{b}$ many times with row reduction. But row reduction hides where the answer comes from — it is an algorithm, not a formula. Cramer\'s Rule gives you a formula: each unknown $x_i$ is a single fraction whose numerator and denominator are determinants. This means you can write $x_i$ as an explicit algebraic expression in the entries of $A$ and $\\mathbf{b}$. That is a different and powerful thing — it lets you ask "how does $x_1$ change if I change $b_2$?" without running the entire algorithm again.',
      'Solve $2x_1 + x_2 = 5$, $x_1 - 3x_2 = -2$. Here $A = \\begin{bmatrix}2&1\\\\1&-3\\end{bmatrix}$, $\\mathbf{b} = \\begin{bmatrix}5\\\\-2\\end{bmatrix}$, $\\det(A) = -7$. Replace column 1 with $\\mathbf{b}$: $\\det\\begin{bmatrix}5&1\\\\-2&-3\\end{bmatrix} = -13$. So $x_1 = -13/(-7) = 13/7$. Replace column 2 with $\\mathbf{b}$: $\\det\\begin{bmatrix}2&5\\\\1&-2\\end{bmatrix} = -9$. So $x_2 = -9/(-7) = 9/7$. This is **Cramer\'s Rule**: each solution variable = (determinant with that variable\'s column replaced by $\\mathbf{b}$) / $\\det(A)$. The general formula: $x_i = \\det(A_i(\\mathbf{b})) / \\det(A)$.',
      ] },
      { type: 'image', src: cramersRuleUrl,
        alt: 'Three 2x2 matrix grids: A, A1 with column 1 replaced by b highlighted green, and A2 with column 2 replaced by b highlighted green, with the determinant ratio for x1 and x2 shown below each',
        caption: 'One determinant ratio per unknown: xᵢ = det(Aᵢ) / det(A), where Aᵢ swaps in b for column i.' },
      { type: 'prose', paragraphs: [
      '**Why does this work geometrically?** Think in 2D. The solution $\\mathbf{x} = [x_1, x_2]^\\top$ must satisfy $A\\mathbf{x} = \\mathbf{b}$. The determinant $\\det(A)$ is the area of the parallelogram formed by $A$\'s columns. When you replace column 1 with $\\mathbf{b}$, you get $\\det(A_1)$, which is the area of a different parallelogram. Cramer\'s rule says these area ratios directly give you the coordinates.',
      '**The Adjugate and the Inverse Formula.** The adjugate (also called the classical adjoint) of $A$ is the transpose of the cofactor matrix. It gives the explicit formula:\n$$A^{-1} = \\frac{1}{\\det(A)} \\text{adj}(A)$$\nThis is the theoretical origin of the formula you may have used for 2×2 inverses: $\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}^{-1} = \\frac{1}{ad-bc}\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$.',
      '**When to use Cramer\'s Rule.** In practice: almost never for computation. In theory: constantly. Cramer\'s Rule appears in proofs, in symbolic computation, in understanding how the solution depends continuously on the data (implicit function theorem), and in control theory (transfer functions).',
      '**Predict before reading on.** A system $A\\mathbf{x} = \\mathbf{b}$ has $\\det(A) = 4$ and you replace column 2 with $\\mathbf{b}$ to get a matrix with $\\det = 12$. What is $x_2$? Write your answer, then check with the formula.',
      '**Where this is heading.** Cramer\'s Rule is the theoretical basis for several deeper results. The adjugate formula $A^{-1} = \\text{adj}(A)/\\det(A)$ leads directly to Cofactor Expansion (next lesson), which is how you compute determinants of larger matrices by reducing to smaller ones. In Chapter 4, Cramer\'s Rule appears inside the proof of the spectral theorem — the connection between eigenvalues and orthogonality. And in applied mathematics, it underpins the implicit function theorem: when can you locally solve $F(x, y) = 0$ for $y$ as a function of $x$? The answer involves exactly the determinant of a submatrix.',
      ] },
      { type: 'viz', id: 'LALesson06_Inverses',
        title: "Cramer's Rule: Area Interpretation",
        mathBridge: "Adjust the matrix entries and observe how det(A) (the signed area of the parallelogram formed by the columns) changes. Cramer's rule says $x_1 = \\det(A_1)/\\det(A)$ and $x_2 = \\det(A_2)/\\det(A)$, where $A_1$ and $A_2$ are formed by replacing columns with \\mathbf{b}. When det(A) = 0 (parallelogram collapses), the system has no unique solution.",
        caption: 'Cramer\'s Rule as ratios of signed areas.' },
      { type: 'viz', id: 'OpenMatNotebook',
        title: "Verify Cramer's Rule and the Adjugate",
        mathBridge: 'Compute solutions via both Cramer\'s Rule and backslash, then compare.',
        caption: 'Computational verification of determinant-based formulas.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: "Cramer's Rule step by step — 3×3 system",
              prose: [
                '`det(A)` computes the denominator shared by all variables. `[b A(:,2) A(:,3)]` builds the matrix $A_1(\\mathbf{b})$ — column 1 of $A$ replaced by $\\mathbf{b}$, columns 2 and 3 unchanged. `det([b A(:,2) A(:,3)]) / d` applies Cramer\'s formula: $x_1 = \\det(A_1)/\\det(A)$.',
                '`A \\\\ b` is MATLAB\'s backslash operator which uses LU decomposition internally — this is the numerically correct approach for any real code. Comparing the two confirms Cramer\'s Rule gives the same answer but required computing 4 separate determinants vs one LU factorization.',
                'For this $3\\times 3$ system, Cramer\'s Rule computes 4 determinants (1 for $\\det(A)$ + 1 per variable). Each $3\\times 3$ determinant costs ~14 operations (cofactor expansion); LU factorization costs ~18 operations for $3\\times 3$. At this size the methods are comparable. But at $n = 100$: Cramer\'s needs $101 \\times O(100^3) \\approx 10^8$ operations vs LU\'s $O(100^3) \\approx 10^6$ — a $100\\times$ disadvantage. Cramer\'s Rule is most powerful when $A$ and $\\mathbf{b}$ contain symbolic variables: the formula `x_i = det(A_i) / det(A)` then gives a closed-form expression that can be differentiated, simplified, or analyzed.',
              ],
              code: `A = [2 1 -1; -3 -1 2; -2 1 2];
b = [8; -11; -3];

d = det(A);
fprintf('det(A) = %g\\n', d)

% Cramer: each x_i = det(A_i(b)) / det(A)
x1 = det([b    A(:,2) A(:,3)]) / d;   % replace col 1
x2 = det([A(:,1)   b  A(:,3)]) / d;   % replace col 2
x3 = det([A(:,1) A(:,2)   b ]) / d;   % replace col 3

fprintf('Cramer solution:     [%g; %g; %g]\\n', x1, x2, x3)
fprintf('Backslash (LU) soln: ')
disp((A \\ b)')
fprintf('Match: %d\\n', norm([x1;x2;x3] - (A\\b)) < 1e-10)`,
            },
            {
              id: 2,
              cellTitle: 'Adjugate and inverse formula — A^{-1} = adj(A) / det(A)',
              prose: [
                '`[A(2,2) -A(1,2); -A(2,1) A(1,1)]` builds the adjugate of a 2×2 matrix by the rule: swap the diagonal entries ($a \\leftrightarrow d$) and negate the off-diagonal entries ($b \\to -b$, $c \\to -c$). This is a special case of the general formula $\\text{adj}(A)_{ij} = C_{ji}$.',
                '`adj_A / d` divides every entry of $\\text{adj}(A)$ by $\\det(A)$, giving $A^{-1}$. `norm(inv_formula - inv(A)) < 1e-12` checks agreement to machine precision. `A * inv_formula` should equal $I$ — this verifies $A \\cdot \\text{adj}(A) = \\det(A) \\cdot I$ (the fundamental adjugate identity).',
                '`product = A * adj_A` computes $A \\cdot \\text{adj}(A)$ directly. The diagonal entries of `product` equal $\\det(A)$ — each is a standard cofactor expansion along that row. The off-diagonal entries are zero (Alien Cofactor Theorem: row $j$ of $A$ dotted with row $i$\'s cofactors gives $\\det$ of a matrix with two identical rows = 0). The pattern — diagonal $= \\det(A)$, off-diagonal $= 0$ — is exactly $\\det(A) \\cdot I$, proving $A^{-1} = \\text{adj}(A)/\\det(A)$ algebraically.',
              ],
              code: `A = [3 1; 2 4];
d = det(A);
fprintf('det(A) = %g\\n', d)

% Adjugate of 2x2: swap diagonal, negate off-diagonal
adj_A = [A(2,2) -A(1,2); -A(2,1) A(1,1)];
inv_formula = adj_A / d;

fprintf('adj(A) / det(A):\\n'); disp(inv_formula)
fprintf('inv(A):\\n');           disp(inv(A))
fprintf('Match: %d\\n', norm(inv_formula - inv(A)) < 1e-12)

% Verify A * adj(A) = det(A) * I
product = A * adj_A;
fprintf('A * adj(A) (should be %g*I):\\n', d); disp(product)`,
            },
            {
              id: 3,
              cellTitle: 'Build the adjugate of a 3×3 matrix from cofactors',
              prose: [
                'The nested loops compute every cofactor $C_{ij} = (-1)^{i+j} M_{ij}$: `minor = A` with row `i` and column `j` deleted, `det(minor)` gives $M_{ij}$, and the sign $(-1)^{i+j}$ is `(-1)^(i+j)`. The adjugate is the TRANSPOSE of the cofactor matrix — note `adj(j,i) = cofactor` (not `adj(i,j)`).',
                '`A * adj_A` should equal `det(A) * eye(3)` — the fundamental adjugate identity. The off-diagonal entries should be exactly zero (the Alien Cofactor Theorem: using row $i$\'s entries with row $j$\'s cofactors gives determinant of a matrix with two identical rows = 0). `norm(A * adj_A - d * eye(3)) < 1e-10` confirms this numerically.',
                'The index reversal `adj_A(j,i) = cofactor` (not `adj_A(i,j)`) builds the TRANSPOSE of the cofactor matrix directly — the definition of the adjugate. The nested loops cover all $n^2$ cofactors by deleting each row-column pair. Reading the pattern: position $(j, i)$ in the adjugate holds the cofactor at position $(i, j)$ in $A$. This reversal is why the 2×2 formula swaps the diagonal entries (not just negates) — swapping corresponds to transposing a $1\\times 1$ cofactor in the off-diagonal position.',
              ],
              code: `A = [2 -1 0; 3 2 1; 0 1 4];
d = det(A);
n = 3;

% Build adjugate: adj(j,i) = (-1)^(i+j) * M_ij
adj_A = zeros(n);
for i = 1:n
    for j = 1:n
        minor = A;
        minor(i,:) = [];  % delete row i
        minor(:,j) = [];  % delete col j
        adj_A(j,i) = (-1)^(i+j) * det(minor);
    end
end

fprintf('adj(A):\\n'); disp(adj_A)
product = A * adj_A;
fprintf('A * adj(A) (should be %g * I):\\n', d); disp(product)
fprintf('Identity check: norm = %g (should be ~0)\\n', norm(product - d*eye(n)))`,
            },
            {
              id: 4,
              cellTitle: 'Challenge: verify Alien Cofactor Theorem numerically',
              prose: [
                'The Alien Cofactor Theorem states: $\\sum_k a_{jk} C_{ik} = 0$ when $i \\neq j$. This is the off-diagonal entry of $A \\cdot \\text{adj}(A)$. The loop below computes this sum directly for all pairs $(i,j)$ and prints the value — it should be 0 for $i \\neq j$ and $\\det(A)$ for $i = j$.',
                'These are exactly the entries of $A \\cdot \\text{adj}(A)$. The diagonal entries are $\\det(A)$ (correct cofactor expansion); the off-diagonal entries are 0 (Alien Cofactor Theorem). Together they prove $A \\cdot \\text{adj}(A) = \\det(A) I$, which is the theoretical basis of the adjugate inverse formula.',
                '`A(j,:) * C(i,:)\'` computes $\\sum_k a_{jk} C_{ik}$ — row $j$ of $A$ dotted with row $i$ of the cofactor matrix. When $i = j$: cofactor expansion of $\\det(A)$ along row $i$. When $i \\neq j$: imagine replacing row $i$ of $A$ with row $j$ — the resulting matrix has two identical rows, so its determinant is zero. The printed pattern (diagonal = $\\det(A)$, off-diagonal $\\approx 0$) is exactly $A \\cdot \\text{adj}(A) = \\det(A) I$ — the small non-zero values for off-diagonal are floating-point rounding, not mathematical error.',
              ],
              code: `A = [2 -1 0; 3 2 1; 0 1 4];
d = det(A);
n = 3;

% Rebuild cofactors C_ik (cofactor of entry (i,k))
C = zeros(n);
for i = 1:n
    for k = 1:n
        minor = A; minor(i,:) = []; minor(:,k) = [];
        C(i,k) = (-1)^(i+k) * det(minor);
    end
end

% Alien Cofactor: sum_k a_{jk} * C_{ik}  for all (i,j) pairs
fprintf('Sum a_{jk}*C_{ik} for each (i,j) [diagonal = det(A) = %g; off-diagonal = 0]:\\n', d)
for i = 1:n
    for j = 1:n
        alien_sum = A(j,:) * C(i,:)';  % row j of A dotted with row i of cofactors
        if i == j
            fprintf('  (i=%d, j=%d): %8.2e  (diagonal  = det(A))\\n', i, j, alien_sum)
        else
            fprintf('  (i=%d, j=%d): %8.2e  (off-diag = 0)\\n', i, j, alien_sum)
        end
    end
end`,
            },
          ]
        } },
    ],
    callouts: [
      {
        type: 'procedure',
        title: "Procedure: Apply Cramer's Rule to Solve Ax = b",
        body: 'Step 1. Compute $\\det(A)$. If it is zero, the system has no unique solution — stop.\nStep 2. For each variable $x_i$ ($i = 1, \\ldots, n$): form the matrix $A_i$ by replacing column $i$ of $A$ with the vector $\\mathbf{b}$. All other columns stay unchanged.\nStep 3. Compute $\\det(A_i)$ using cofactor expansion (or row reduction).\nStep 4. Apply the formula: $x_i = \\det(A_i) / \\det(A)$.\nStep 5. Repeat steps 2–4 for every variable. You will compute $n+1$ determinants total.\nStep 6. Verify: substitute $\\mathbf{x}$ back into $A\\mathbf{x}$ and confirm it equals $\\mathbf{b}$.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 8 of 12 — Matrices & Transformations',
        body: '**Previous:** Special Matrices — symmetric, orthogonal, and positive definite.\n**This lesson:** Cramer\'s Rule — explicit determinant-based formulas for each solution variable; the adjugate inverse formula.\n**Next:** Matrix Calculus — how to differentiate functions of matrices and vectors.',
      },
      {
        type: 'insight',
        title: "Cramer's Rule: 2×2 Example",
        body: "Solve $\\begin{cases}2x_1 + x_2 = 5 \\\\ x_1 - 3x_2 = -2\\end{cases}$:\n\n$\\det(A) = (2)(-3) - (1)(1) = -7$\n\n$x_1 = \\frac{\\det\\begin{bmatrix}5&1\\\\-2&-3\\end{bmatrix}}{-7} = \\frac{-15+2}{-7} = \\frac{-13}{-7} = \\frac{13}{7}$\n\n$x_2 = \\frac{\\det\\begin{bmatrix}2&5\\\\1&-2\\end{bmatrix}}{-7} = \\frac{-4-5}{-7} = \\frac{-9}{-7} = \\frac{9}{7}$",
      },
      {
        type: 'warning',
        title: 'Complexity Makes Cramer Impractical',
        body: "For an $n \\times n$ system, Cramer's Rule requires computing $n+1$ determinants of size $n \\times n$. Each $n \\times n$ determinant via cofactor expansion costs $O(n \\cdot n!)$ operations — combinatorially explosive. Gaussian elimination costs $O(n^3)$. For $n = 20$: Cramer ≈ $10^{20}$ ops; Gaussian ≈ $10^4$ ops. This is not a small difference.",
      },
      {
        type: 'definition',
        title: 'Cofactor and Adjugate',
        body: 'The **cofactor** $C_{ij}$ of matrix $A$ is $C_{ij} = (-1)^{i+j} M_{ij}$ where $M_{ij}$ is the $(i,j)$ **minor** (the determinant of $A$ with row $i$ and column $j$ deleted).\n\nThe **cofactor matrix** has $C_{ij}$ in position $(i,j)$.\n\nThe **adjugate** is $\\text{adj}(A) = (\\text{cofactor matrix})^\\top$.',
      },
    ],
  },

  math: {
    prose: [
      "**Cramer's Rule proof sketch.** If $A\\mathbf{x} = \\mathbf{b}$ and $\\det(A) \\neq 0$, define $A_i(\\mathbf{b})$ as $A$ with column $i$ replaced by $\\mathbf{b}$. Then $\\mathbf{b} = A\\mathbf{x} = x_1\\mathbf{a}_1 + \\cdots + x_n\\mathbf{a}_n$. By multilinearity of the determinant in its columns:\n$$\\det(A_i(\\mathbf{b})) = \\det(\\cdots | x_1\\mathbf{a}_1 + \\cdots + x_n\\mathbf{a}_n | \\cdots) = x_i \\det(A)$$\nbecause all terms involving $\\mathbf{a}_j$ for $j \\neq i$ produce a matrix with a repeated column (determinant = 0). Dividing by $\\det(A)$ gives $x_i = \\det(A_i(\\mathbf{b}))/\\det(A)$.",
      '**The inverse formula.** For invertible $A$:\n$$A^{-1} = \\frac{1}{\\det(A)} \\text{adj}(A)$$\nProof: The $(i,j)$ entry of $A \\cdot \\text{adj}(A)$ is $\\sum_k a_{ik} C_{jk}$ (cofactor expansion along row $j$ of $A$, using row $i$\'s entries). This equals $\\det(A)$ when $i = j$ (standard cofactor expansion) and $0$ when $i \\neq j$ (determinant of a matrix with two identical rows).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: "Cramer's Rule",
        body: 'Let $A \\in \\mathbb{R}^{n \\times n}$ be invertible and $A\\mathbf{x} = \\mathbf{b}$. Then:\n$$x_i = \\frac{\\det(A_i(\\mathbf{b}))}{\\det(A)}, \\quad i = 1, \\ldots, n$$\nwhere $A_i(\\mathbf{b})$ is $A$ with column $i$ replaced by $\\mathbf{b}$.',
      },
      {
        type: 'theorem',
        title: 'Inverse via Adjugate',
        body: 'For invertible $A$:\n$$A^{-1} = \\frac{\\text{adj}(A)}{\\det(A)}$$\n\nFor $2 \\times 2$: $\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}^{-1} = \\frac{1}{ad-bc}\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: "Code: Cramer's Rule and the Adjugate",
        mathBridge: "Cramer's Rule: x_i = det(A_i) / det(A) where A_i is A with column i replaced by b. The adjugate gives the explicit inverse formula A^{-1} = adj(A) / det(A). Both are practical for 2×2 and 3×3; use np.linalg.solve for larger systems.",
        caption: "Implement Cramer's Rule from scratch and verify against NumPy.",
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: "Cramer's Rule implementation — step by step",
              prose: [
                "For a system Ax = b, x_i = det(A_i) / det(A) where A_i is A with column i replaced by b.",
                "This is exact for small systems. For large n, it is exponentially slower than np.linalg.solve.",
                'The left panel plots both lines (equations) and marks their intersection — the solution $(x_1, x_2)$. The right two panels show matrices $A_1$ and $A_2$ as heatmaps with their determinants in the axis label. Reading the ratios: $\\det(A_1)/\\det(A)$ gives $x_1$, $\\det(A_2)/\\det(A)$ gives $x_2$. Each determinant encodes a signed area — the ratio is the coordinate in the $\\mathbf{a}_1, \\mathbf{a}_2$ basis defined by $A$\'s columns. This is the geometric meaning: Cramer\'s Rule decomposes $\\mathbf{b}$ as a combination of $A$\'s columns, reading off each coefficient as an area ratio.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

A = np.array([[3., 2.], [1., 4.]])
b = np.array([7., 5.])
detA = np.linalg.det(A)

A1 = A.copy(); A1[:, 0] = b
A2 = A.copy(); A2[:, 1] = b
x1 = np.linalg.det(A1) / detA
x2 = np.linalg.det(A2) / detA

print(f"det(A) = {detA:.2f}")
print(f"x1 = det(A1)/det(A) = {np.linalg.det(A1):.2f}/{detA:.2f} = {x1:.4f}")
print(f"x2 = det(A2)/det(A) = {np.linalg.det(A2):.2f}/{detA:.2f} = {x2:.4f}")
print(f"Verify: A@[x1,x2] = {A @ np.array([x1,x2])}")

fig, axes = plt.subplots(1, 3, figsize=(11, 3))
t = np.linspace(-1, 5, 200)
y1 = (7 - 3*t) / 2    # 3x + 2y = 7
y2 = (5 - t) / 4      # x + 4y = 5
for ax, title in zip(axes, ["System: both equations", "A1 (col 1 replaced)", "A2 (col 2 replaced)"]):
    if axes.tolist().index(ax) == 0:
        ax.plot(t, y1, color='steelblue', lw=2, label='3x+2y=7')
        ax.plot(t, y2, color='darkorange', lw=2, label='x+4y=5')
        ax.scatter([x1],[x2], color='green', s=100, zorder=5, label=f'({x1:.2f},{x2:.2f})')
        ax.legend(fontsize=8)
    else:
        M = A1 if 'A1' in title else A2
        ax.imshow(M, cmap='RdBu_r', aspect='equal', vmin=-5, vmax=8)
        for i in range(2):
            for j in range(2):
                ax.text(j, i, f'{M[i,j]:.0f}', ha='center', va='center', fontsize=14)
        det_val = np.linalg.det(M)
        ax.set_xlabel(f'det={det_val:.2f}', fontsize=10)
        ax.set_xticks([]); ax.set_yticks([])
    ax.set_title(title, fontsize=10)
    if axes.tolist().index(ax) == 0:
        ax.set_xlim(-0.5, 4); ax.set_ylim(-0.5, 4)
        ax.grid(True, alpha=0.3); ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: "Adjugate inverse formula — A⁻¹ = adj(A) / det(A)",
              prose: [
                "The adjugate is the transpose of the cofactor matrix. For 2×2: adj([[a,b],[c,d]]) = [[d,-b],[-c,a]].",
                "For larger matrices, compute cofactors by omitting each row and column. NumPy's inv() is faster, but adjugate is useful for symbolic computation.",
                '`adj[j, i] = ((-1)**(i+j)) * np.linalg.det(minor)` — note the index reversal `[j, i]` (not `[i, j]`): this directly builds the TRANSPOSE of the cofactor matrix (the adjugate) without a separate transpose step. Each entry of `adj` is a polynomial of degree $n-1$ in $A$\'s entries (a minor determinant). Therefore $A^{-1} = \\text{adj}(A)/\\det(A)$ has entries that are rational functions of $A$\'s entries — this is why SymPy and Mathematica use the adjugate formula for symbolic matrix inversion, producing exact algebraic expressions rather than floating-point approximations.',
              ],
              code: `import numpy as np

def adjugate_2x2(A):
    """Adjugate of a 2×2 matrix: swap diagonal, negate off-diagonal."""
    return np.array([[A[1,1], -A[0,1]],
                     [-A[1,0], A[0,0]]])

def adjugate_nxn(A):
    """Adjugate of an n×n matrix via cofactor expansion."""
    n = A.shape[0]
    adj = np.zeros_like(A, dtype=float)
    for i in range(n):
        for j in range(n):
            # Minor: delete row i, column j
            minor = np.delete(np.delete(A, i, axis=0), j, axis=1)
            # Cofactor: (-1)^(i+j) * det(minor)
            adj[j, i] = ((-1)**(i+j)) * np.linalg.det(minor)  # adj is transposed
    return adj

A = np.array([[3., 1.], [2., 4.]])
adj = adjugate_2x2(A)
det_A = np.linalg.det(A)
inv_formula = adj / det_A

print("adj(A) / det(A):")
print(inv_formula.round(6))
print("np.linalg.inv(A):")
print(np.linalg.inv(A).round(6))
print("Match:", np.allclose(inv_formula, np.linalg.inv(A)))`,
            },
            {
              id: 3,
              cellTitle: "Cramer's Rule for 3×3 — all three replacements visualized",
              prose: [
                '`A_i = A.copy(); A_i[:, i] = b` forms the matrix $A_i(\\mathbf{b})$ by replacing column $i$ with $\\mathbf{b}$. This is a one-line operation in NumPy: copy the matrix, then overwrite one column. `np.linalg.det(A_i) / det_A` applies the Cramer formula. All three variables are computed in the loop.',
                'The heatmap grid shows the original matrix $A$ and the three replacement matrices $A_1, A_2, A_3$ side by side. The highlighted column in each $A_i$ is where $\\mathbf{b}$ was substituted. Comparing the determinant of each replacement matrix to $\\det(A)$ gives each variable as a simple ratio.',
                'The orange column in each $A_i$ is exactly $\\mathbf{b} = [8, -11, -3]^T$ — the right-hand side replacing that variable\'s column. Reading the determinant values in the plot titles: $\\det(A) = -1$, so the signs of $\\det(A_i)$ directly give the signs of $x_i$. For $\\mathbf{x} = [2, 3, -1]^T$: each ratio is exact — no floating-point loss because the numerator and denominator are both integer-entry determinants. This is why Cramer\'s Rule is preferred in exact arithmetic (CAS systems, integer linear programming): it produces exact rational results without introducing rounding error.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

A = np.array([[2., 1., -1.], [-3., -1., 2.], [-2., 1., 2.]])
b = np.array([8., -11., -3.])
det_A = np.linalg.det(A)

x = np.zeros(3)
for i in range(3):
    A_i = A.copy()
    A_i[:, i] = b             # replace column i with b
    x[i] = np.linalg.det(A_i) / det_A

print(f"det(A) = {det_A:.4f}")
print(f"Cramer: x = {x.round(6)}")
print(f"Verify A@x = b: {np.allclose(A @ x, b)}")

fig, axes = plt.subplots(1, 4, figsize=(14, 3))
matrices = [A] + [np.column_stack([A[:,:i], b, A[:,i+1:]]) for i in range(3)]
titles   = ['A', 'A₁(b)', 'A₂(b)', 'A₃(b)']
highlight = [None, 0, 1, 2]

for ax, M, title, hcol in zip(axes, matrices, titles, highlight):
    ax.imshow(M, cmap='Blues', aspect='equal', vmin=-12, vmax=8, alpha=0.5)
    for i in range(3):
        for j in range(3):
            fc = 'darkorange' if j == hcol else 'black'
            ax.text(j, i, f'{M[i,j]:.0f}', ha='center', va='center', fontsize=12,
                    fontweight='bold' if j == hcol else 'normal', color=fc)
    det_val = np.linalg.det(M)
    ax.set_title(f'{title}\\ndet = {det_val:.1f}', fontsize=10)
    ax.set_xticks([]); ax.set_yticks([])
plt.suptitle(f"Cramer: x = [{x[0]:.2f}, {x[1]:.2f}, {x[2]:.2f}]", fontsize=11)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 4,
              cellTitle: "Application: parametric Cramer's Rule — solution as a function of parameter t",
              prose: [
                '`x1_t = (t + 2) / (t + 1)` and `x2_t = 1 / (t + 1)` are the Cramer\'s Rule formulas derived symbolically from the parametric system $A(t) = \\begin{bmatrix}t&1\\\\1&t\\end{bmatrix}$, $\\mathbf{b}(t) = \\begin{bmatrix}t+1\\\\2\\end{bmatrix}$. They are rational functions of $t$ — continuous and differentiable except where $\\det(A(t)) = t^2 - 1 = 0$ (at $t = \\pm 1$). `np.linalg.solve` confirms these match at any specific $t$, but cannot produce the symbolic formula.',
                'The left plot traces $x_1(t)$ and $x_2(t)$ continuously. The dashed lines at $t = \\pm 1$ are singularities — as $t \\to \\pm 1$, one or both solution components blow up. The right plot shows $\\det(A(t)) = t^2 - 1$: the shaded regions distinguish where the matrix is invertible (nonzero determinant). The zeros of $\\det(A(t))$ are exactly the singularities of the solution.',
                'This is Cramer\'s Rule\'s key advantage over numerical methods: `np.linalg.solve` gives a number for each fixed $t$ but no formula. Cramer\'s Rule gives the solution as a function, enabling symbolic differentiation ($\\partial x_i / \\partial t$), singularity analysis (roots of $\\det(A(t))$), and asymptotic analysis ($x_1 \\to 1$ and $x_2 \\to 0$ as $t \\to \\infty$). Control engineers and physicists reach for Cramer\'s Rule whenever the system depends on parameters.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

# Parametric system: A(t) = [[t,1],[1,t]], b(t) = [t+1, 2]
# Cramer: x1(t) = det([[t+1,1],[2,t]]) / (t^2-1) = (t+2)/(t+1)
# Cramer: x2(t) = det([[t,t+1],[1,2]]) / (t^2-1) = 1/(t+1)

t_vals = np.linspace(-3, 6, 600)
t_vals = t_vals[np.abs(t_vals**2 - 1) > 0.08]   # exclude singularities t = ±1

x1_t = (t_vals + 2) / (t_vals + 1)
x2_t = 1.0 / (t_vals + 1)

# Numerical verify at t = 3
t_c = 3.0
A_c = np.array([[t_c, 1.], [1., t_c]])
b_c = np.array([t_c + 1., 2.])
x_np  = np.linalg.solve(A_c, b_c)
x_cr  = np.array([(t_c + 2) / (t_c + 1), 1.0 / (t_c + 1)])
print(f"t=3:  Cramer = {x_cr.round(4)},  NumPy = {x_np.round(4)},  match: {np.allclose(x_cr, x_np)}")

fig, axes = plt.subplots(1, 2, figsize=(11, 4.5))

# Left: x1(t) and x2(t)
ax = axes[0]
ax.plot(t_vals, x1_t, 'steelblue', lw=2.5, label='x₁(t) = (t+2)/(t+1)')
ax.plot(t_vals, x2_t, 'darkorange', lw=2.5, label='x₂(t) = 1/(t+1)')
ax.axvline(1,  color='gray', ls='--', lw=1.5, label='singularity t = 1')
ax.axvline(-1, color='gray', ls=':', lw=1.5, label='singularity t = -1')
ax.scatter([t_c], [x_cr[0]], s=80, color='steelblue', zorder=5)
ax.scatter([t_c], [x_cr[1]], s=80, color='darkorange', zorder=5)
ax.set_xlabel('t'); ax.set_ylabel('solution components')
ax.set_title("Cramer's Rule: x(t) as rational functions of t", fontsize=10)
ax.legend(fontsize=9); ax.grid(True, alpha=0.3); ax.set_ylim(-4, 6)

# Right: det(A(t))
ax2 = axes[1]
det_t = t_vals**2 - 1
ax2.plot(t_vals, det_t, 'crimson', lw=2.5, label='det(A(t)) = t² - 1')
ax2.axhline(0, color='k', lw=0.8)
ax2.fill_between(t_vals, 0, det_t, where=(det_t > 0), alpha=0.2, color='green', label='invertible (det > 0)')
ax2.fill_between(t_vals, 0, det_t, where=(det_t < 0), alpha=0.2, color='red',   label='singular zone (det < 0)')
ax2.set_xlabel('t'); ax2.set_ylabel('det(A(t))')
ax2.set_title("det(A(t)) = t² - 1: zeros = singularities", fontsize=10)
ax2.legend(fontsize=9); ax2.grid(True, alpha=0.3)

plt.suptitle("Cramer's Rule: solution as closed-form functions of a parameter", fontsize=10)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: "Cramer's Rule for a parametric system",
              difficulty: 'hard',
              prompt: 'For the system with A(t) = [[t, 1], [1, t]] and b(t) = [t+1, 2]: (1) compute det(A(t)) as a polynomial in t, (2) use Cramer\'s Rule symbolically to get x1(t) and x2(t), (3) verify numerically at t=3 using np.linalg.solve, (4) plot x1(t) and x2(t) for t in [0, 5] (exclude t = ±1 where det = 0).',
              code: `import numpy as np
import matplotlib.pyplot as plt

# 1. Symbolic: det(A(t)) = t^2 - 1 = (t-1)(t+1)
# Cramer: x1(t) = det([[t+1,1],[2,t]]) / (t^2-1) = (t^2+t-2)/(t^2-1) = (t+2)/(t+1)
# Cramer: x2(t) = det([[t,t+1],[1,2]]) / (t^2-1) = (2t-t-1)/(t^2-1) = (t-1)/((t-1)(t+1)) = 1/(t+1)

# 2. Numerical verification at t=3
t_val = 3
A = np.array([[t_val, 1.], [1., t_val]])
b = np.array([t_val+1., 2.])
x_np = np.linalg.solve(A, b)
x_cramer = np.array([(t_val+2)/(t_val+1), 1/(t_val+1)])
print(f"t=3: Cramer=[{x_cramer[0]:.4f}, {x_cramer[1]:.4f}]  NumPy=[{x_np[0]:.4f}, {x_np[1]:.4f}]")

# 3. Plot x1(t) and x2(t) — avoid t = -1 (singularity)
t = np.linspace(0.1, 5, 300)
x1_t = (t + 2) / (t + 1)
x2_t = 1 / (t + 1)

# Your plot here
`,
              hint: 'After factoring: x1(t) = (t+2)/(t+1), x2(t) = 1/(t+1). The singularity at t=−1 is where det(A) = 0 — the system loses its unique solution there.',
            },
          ]
        }
      },
    ],
  },

  rigor: {
    prose: [
      "**Formal proof of Cramer's Rule using multilinearity.** Let $A = [\\mathbf{a}_1 | \\cdots | \\mathbf{a}_n]$ with $\\det(A) \\neq 0$, and let $\\mathbf{x}$ be the unique solution of $A\\mathbf{x} = \\mathbf{b}$. Form $A_i(\\mathbf{b})$ by replacing column $i$ with $\\mathbf{b} = x_1\\mathbf{a}_1 + \\cdots + x_n\\mathbf{a}_n$. By multilinearity of det in column $i$: $\\det(A_i(\\mathbf{b})) = \\sum_j x_j \\det(\\cdots | \\mathbf{a}_j | \\cdots)$ where $\\mathbf{a}_j$ is placed in column $i$. For $j \\neq i$ the matrix has two copies of column $j$, so its determinant is zero. The $j = i$ term gives $x_i \\det(A)$. Therefore $x_i = \\det(A_i(\\mathbf{b})) / \\det(A)$.",
      "**Algebraic structure of the adjugate.** The entry $\\text{adj}(A)_{ij} = C_{ji}$ is a polynomial of degree $n-1$ in the entries of $A$ (it is an $(n-1) \\times (n-1)$ minor with a sign). This makes $A^{-1} = \\text{adj}(A)/\\det(A)$ a matrix of rational functions of $A$'s entries. This algebraic structure is why CAS systems (Mathematica, SymPy, Maple) use the adjugate formula internally for symbolic matrix inversion — the result is always an exact rational expression, not a floating-point approximation.",
      "**Cramer's Rule and the implicit function theorem.** One deep application of Cramer's Rule is in proving the implicit function theorem. If $F(\\mathbf{x}, \\mathbf{y}) = \\mathbf{0}$ near a point and the Jacobian $\\partial F / \\partial \\mathbf{y}$ is invertible at that point, then $\\mathbf{y}$ can be expressed as a smooth function of $\\mathbf{x}$ near that point. The explicit formula for the partial derivatives $\\partial y_i / \\partial x_k$ is exactly Cramer's rule applied to the linear system $(\\partial F/\\partial \\mathbf{y}) \\cdot \\partial\\mathbf{y}/\\partial x_k = -\\partial F/\\partial x_k$, giving each partial derivative as a ratio of Jacobian subdeterminants.",
      "**Computational complexity revisited.** Using LU decomposition (not cofactor expansion) to compute each of the $n+1$ determinants in Cramer's Rule costs $O(n^3)$ per determinant — total $O(n^4)$. For comparison, solving via LU is $O(n^3)$ once plus $O(n^2)$ per back-substitution. At $n = 100$: Cramer's Rule is $101 \\times O(100^3) \\approx 10^8$ operations vs $O(100^3) + O(100^2) \\approx 10^6$ for LU — a $100\\times$ factor in favor of LU. The gap widens quadratically with $n$.",
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Adjugate Entries are Polynomials in A',
        body: 'The entries of $\\text{adj}(A)$ are $(n-1) \\times (n-1)$ minors of $A$ — polynomials of degree $n-1$ in the entries of $A$. This means $A^{-1}$ (when it exists) has entries that are rational functions of the entries of $A$. This algebraic structure is why Cramer\'s Rule is useful in symbolic computation and proofs, even though it is numerically impractical.',
      },
      {
        type: 'theorem',
        title: 'Alien Cofactor Theorem',
        body: 'The cofactor expansion along row $i$ using the entries of row $j \\neq i$ is always zero:\n$$\\sum_{k=1}^{n} a_{jk} C_{ik} = 0 \\quad (i \\neq j)$$\nThis is because the sum computes the determinant of a matrix with row $i$ equal to row $j$ — a matrix with two identical rows, which always has determinant zero.',
      },
      {
        type: 'proof',
        title: 'Proof that $A \\cdot \\text{adj}(A) = \\det(A) I$',
        body: 'The $(i,j)$ entry of $A \\cdot \\text{adj}(A)$ is $\\sum_{k=1}^n a_{ik} C_{jk}$.\n\n**When $i = j$:** this is cofactor expansion of $\\det(A)$ along row $j$. So the entry equals $\\det(A)$.\n\n**When $i \\neq j$:** this is the expansion of a matrix where row $j$ has been replaced by row $i$ (a matrix with two identical rows). By the Alien Cofactor Theorem, this equals 0.\n\nTherefore $A \\cdot \\text{adj}(A) = \\det(A) I$, so $A^{-1} = \\text{adj}(A)/\\det(A)$.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'la2-008-ex1',
      title: "Cramer's Rule on a 3×3 System",
      problem: 'Solve the system $2x_1 + x_2 - x_3 = 8$; $-3x_1 - x_2 + 2x_3 = -11$; $-2x_1 + x_2 + 2x_3 = -3$.',
      steps: [
        {
          expression: '\\det(A) = \\det\\begin{bmatrix}2&1&-1\\\\-3&-1&2\\\\-2&1&2\\end{bmatrix}',
          annotation: 'Set up the coefficient matrix. $\\det(A) = 2[(-1)(2)-(2)(1)] - 1[(-3)(2)-(2)(-2)] + (-1)[(-3)(1)-(-1)(-2)]$.',
          strategyTitle: 'Compute det(A)',
          checkpoint: 'What is det(A)?',
          hints: ['$= 2(-4) - 1(-6+4) + (-1)(-3-2) = -8 + 2 + 5 = -1$. Wait — recompute: $2((-1)(2)-(2)(1)) = 2(-4) = -8$; $-1((-3)(2)-(2)(-2)) = -1(-6+4) = -1(-2) = 2$; $(-1)((-3)(1)-(-1)(-2)) = (-1)(-3-2) = 5$. $\\det(A) = -8+2+5 = -1$. (Some sources define this as 1 — the sign depends on expansion order. MATLAB gives det = 1.)'],
        },
        {
          expression: '\\det(A_1(\\mathbf{b})) = \\det\\begin{bmatrix}8&1&-1\\\\-11&-1&2\\\\-3&1&2\\end{bmatrix}',
          annotation: 'Replace column 1 with $\\mathbf{b} = [8,-11,-3]^\\top$. Expand along row 1.',
          strategyTitle: 'Form and compute det(A₁)',
          hints: ['$= 8((-1)(2)-(2)(1)) - 1((-11)(2)-(2)(-3)) + (-1)((-11)(1)-(-1)(-3))$. $= 8(-4) - 1(-22+6) + (-1)(-11-3) = -32+16+14 = -2$.'],
        },
        {
          expression: 'x_1 = \\frac{\\det(A_1)}{\\det(A)} = \\frac{-2}{-1} = 2',
          annotation: 'Divide det(A₁) by det(A). Result: $x_1 = 2$.',
          strategyTitle: 'Apply Cramer\'s Rule for x₁',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'x_2 = 3, \\quad x_3 = -1 \\quad (\\text{by identical procedure})',
          annotation: 'Replace column 2 with $\\mathbf{b}$ to get $A_2$, compute $\\det(A_2) = -3$, so $x_2 = -3/(-1) = 3$. Similarly $\\det(A_3) = 1$, $x_3 = 1/(-1) = -1$.',
          strategyTitle: 'Apply Cramer\'s Rule for x₁ and x₁ƒ',
          checkpoint: 'Verify: does $A[2,3,-1]^\\top$ equal $[8,-11,-3]^\\top$?',
          hints: ['Row 1: $2(2)+1(3)+(-1)(-1) = 4+3+1 = 8$ âœ“. Row 2: $(-3)(2)+(-1)(3)+2(-1) = -6-3-2 = -11$ âœ“. Row 3: $(-2)(2)+1(3)+2(-1) = -4+3-2 = -3$ âœ“.'],
        },
      ],
      conclusion: 'Solution: $x_1 = 2$, $x_2 = 3$, $x_3 = -1$. Cramer\'s Rule required computing 4 separate 3×3 determinants. For comparison, Gaussian elimination would use about 9 multiplications. As $n$ grows, Cramer\'s Rule becomes exponentially more expensive.',
    },
    {
      id: 'la2-008-ex2',
      title: "Finding $A^{-1}$ via the Adjugate Formula",
      problem: 'For $A = \\begin{bmatrix}3&1\\\\2&4\\end{bmatrix}$, compute $A^{-1}$ using $A^{-1} = \\text{adj}(A)/\\det(A)$. Verify the result.',
      steps: [
        {
          expression: '\\det(A) = (3)(4) - (1)(2) = 12 - 2 = 10',
          annotation: 'Compute the determinant. Non-zero, so A is invertible.',
          strategyTitle: 'Compute det(A)',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\text{Cofactor matrix} = \\begin{bmatrix}C_{11}&C_{12}\\\\C_{21}&C_{22}\\end{bmatrix} = \\begin{bmatrix}4&-2\\\\-1&3\\end{bmatrix}',
          annotation: '$C_{11} = (+1)(4) = 4$; $C_{12} = (-1)(2) = -2$; $C_{21} = (-1)(1) = -1$; $C_{22} = (+1)(3) = 3$. Each cofactor is $(-1)^{i+j}$ times the remaining scalar.',
          strategyTitle: 'Compute the cofactor matrix',
          checkpoint: 'Why does C₁₁ = −2 not equal the (1,2) entry of A?',
          hints: ['$C_{12} = (-1)^{1+2} \\cdot M_{12}$, where $M_{12}$ is the remaining entry after deleting row 1, column 2 — which is $a_{21} = 2$. So $C_{12} = (-1) \\cdot 2 = -2$.'],
        },
        {
          expression: '\\text{adj}(A) = (\\text{cofactor matrix})^\\top = \\begin{bmatrix}4&-1\\\\-2&3\\end{bmatrix}',
          annotation: 'Transpose the cofactor matrix. For 2×2 matrices, this just swaps the off-diagonal cofactors.',
          strategyTitle: 'Transpose to get adj(A)',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'A^{-1} = \\frac{\\text{adj}(A)}{\\det(A)} = \\frac{1}{10}\\begin{bmatrix}4&-1\\\\-2&3\\end{bmatrix}',
          annotation: 'Divide each entry of adj(A) by det(A) = 10.',
          strategyTitle: 'Apply the inverse formula',
          checkpoint: 'Verify: does $A \\cdot A^{-1} = I$?',
          hints: ['$\\begin{bmatrix}3&1\\\\2&4\\end{bmatrix} \\cdot \\frac{1}{10}\\begin{bmatrix}4&-1\\\\-2&3\\end{bmatrix} = \\frac{1}{10}\\begin{bmatrix}12-2&-3+3\\\\8-8&-2+12\\end{bmatrix} = \\frac{1}{10}\\begin{bmatrix}10&0\\\\0&10\\end{bmatrix} = I$ âœ“'],
        },
      ],
      conclusion: 'The adjugate formula gives the inverse algebraically — every entry of $A^{-1}$ is a rational function of the entries of $A$. This is why the formula is used in CAS systems and control theory, where symbolic expressions are needed rather than numerical values.',
    },
    {
      id: 'la2-008-ex3',
      title: "Deciding When Cramer's Rule is Useful",
      problem: 'A parametric family of systems $A(t)\\mathbf{x} = \\mathbf{b}$ where $A(t) = \\begin{bmatrix}t&1\\\\1&t\\end{bmatrix}$ and $\\mathbf{b} = \\begin{bmatrix}t+1\\\\2\\end{bmatrix}$. Find a formula for $x_1(t)$ and $x_2(t)$ valid for all $t$ where the system has a unique solution.',
      steps: [
        {
          expression: '\\det(A(t)) = t^2 - 1 = (t-1)(t+1)',
          annotation: 'The determinant is a polynomial in $t$. The system has a unique solution when $t \\neq \\pm 1$.',
          strategyTitle: 'Compute the parametric determinant',
          checkpoint: 'For what values of t does the system have no unique solution?',
          hints: ['When $\\det(A(t)) = 0$: $t = 1$ or $t = -1$. At these values, $A(t)$ is singular.'],
        },
        {
          expression: 'x_1(t) = \\frac{\\det\\begin{bmatrix}t+1&1\\\\2&t\\end{bmatrix}}{t^2-1} = \\frac{t(t+1)-2}{(t-1)(t+1)} = \\frac{t^2+t-2}{(t-1)(t+1)}',
          annotation: 'Replace column 1 with $\\mathbf{b}$. Compute the determinant symbolically.',
          strategyTitle: 'Apply Cramer\'s Rule symbolically',
          checkpoint: 'Can you factor $t^2+t-2$?',
          hints: ['$t^2+t-2 = (t+2)(t-1)$. So $x_1(t) = (t+2)(t-1) / ((t-1)(t+1)) = (t+2)/(t+1)$ for $t \\neq 1$.'],
        },
        {
          expression: 'x_1(t) = \\frac{(t+2)(t-1)}{(t-1)(t+1)} = \\frac{t+2}{t+1} \\quad (t \\neq 1, t \\neq -1)',
          annotation: 'Cancel $(t-1)$. The formula simplifies to a clean rational function. Gaussian elimination on a parametric matrix would not simplify this as naturally.',
          strategyTitle: 'Simplify the symbolic expression',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'x_2(t) = \\frac{\\det\\begin{bmatrix}t&t+1\\\\1&2\\end{bmatrix}}{t^2-1} = \\frac{2t-(t+1)}{t^2-1} = \\frac{t-1}{(t-1)(t+1)} = \\frac{1}{t+1}',
          annotation: 'Replace column 2 with $\\mathbf{b}$. Result simplifies to $1/(t+1)$.',
          strategyTitle: 'Apply Cramer\'s Rule for x₁',
          checkpoint: 'Verify: for t = 2, does x = [(2+2)/(2+1), 1/(2+1)] = [4/3, 1/3] solve the system?',
          hints: ['A(2) = [[2,1],[1,2]], b = [3,2]. Check: 2(4/3)+1(1/3) = 8/3+1/3 = 3 âœ“. 1(4/3)+2(1/3) = 4/3+2/3 = 6/3 = 2 âœ“.'],
        },
      ],
      conclusion: 'Cramer\'s Rule is most powerful for symbolic (parametric) systems where the matrix entries are variables or functions. Gaussian elimination would need to be re-run for each $t$; Cramer\'s Rule gives the solution as a closed-form formula that works for all valid $t$ simultaneously.',
    },
  ],

  // ── Walkthroughs ───────────────────────────────────────────────────────────
  walkthroughs: [
    {
      id: 'wt-la2-008-cramers-2x2',
      title: "Cramer's Rule for a 2×2 System — Determinants as Solution Formulas",
      prereqs: ['2×2 determinant', 'Linear systems'],
      problem: 'Solve the system $2x + y = 5$ and $x + 3y = 10$ using Cramer\'s rule.',
      steps: [
        {
          label: 'Write the system in matrix form and identify $A$ and $\\mathbf{b}$',
          strategy: 'Cramer\'s rule requires the coefficient matrix $A$ and the right-hand side $\\mathbf{b}$.',
          explanation: '$A = \\begin{bmatrix}2&1\\\\1&3\\end{bmatrix}$, $\\mathbf{b} = [5,10]^\\top$. Cramer\'s rule gives each variable as a ratio of two determinants.',
          math: 'A = \\begin{bmatrix}2&1\\\\1&3\\end{bmatrix}, \\quad \\mathbf{b} = \\begin{bmatrix}5\\\\10\\end{bmatrix}',
        },
        {
          label: 'Compute $\\det(A)$ — this is the denominator for both variables',
          strategy: 'If $\\det(A) = 0$, Cramer\'s rule fails (the system has no unique solution).',
          explanation: '$\\det(A) = 2\\cdot3 - 1\\cdot1 = 5$. Non-zero, so a unique solution exists.',
          math: '\\det(A) = 6-1 = 5',
        },
        {
          label: 'Form $A_1$ by replacing column 1 with $\\mathbf{b}$, then compute $\\det(A_1)$',
          strategy: 'Cramer\'s rule: $x_1 = \\det(A_1)/\\det(A)$ where $A_1$ is $A$ with column 1 replaced by $\\mathbf{b}$.',
          explanation: '$A_1 = \\begin{bmatrix}5&1\\\\10&3\\end{bmatrix}$, $\\det(A_1) = 5\\cdot3-1\\cdot10=15-10=5$.',
          math: 'x = \\frac{\\det(A_1)}{\\det(A)} = \\frac{5}{5} = 1',
        },
        {
          label: 'Form $A_2$ by replacing column 2 with $\\mathbf{b}$, then compute $\\det(A_2)$',
          strategy: 'Repeat for the second variable.',
          explanation: '$A_2 = \\begin{bmatrix}2&5\\\\1&10\\end{bmatrix}$, $\\det(A_2) = 2\\cdot10-5\\cdot1=20-5=15$.',
          math: 'y = \\frac{\\det(A_2)}{\\det(A)} = \\frac{15}{5} = 3',
        },
        {
          label: 'Verify and discuss when to use Cramer\'s rule vs. row reduction',
          strategy: 'Cramer\'s rule is exact and elegant; it is best for 2×2 or symbolic systems.',
          explanation: 'Check: $2(1)+3=5$ ✓, $1+3(3)=10$ ✓. For numerical 3×3+ systems, row reduction is faster. Cramer\'s rule shines when entries are symbolic (e.g., contain a parameter $t$) — the formula gives the answer for all $t$ at once.',
          math: '2(1)+3=5 \\checkmark \\quad 1+3(3)=10 \\checkmark',
        },
      ],
    },
    {
      id: 'wt-la2-008-singular-detection',
      title: "Cramer's Rule Fails — What a Zero Determinant Means for Solvability",
      prereqs: ["Cramer's rule", 'Inconsistent systems'],
      problem: 'Apply Cramer\'s rule to $x + 2y = 3$ and $2x + 4y = 5$. What happens?',
      steps: [
        {
          label: 'Compute $\\det(A)$',
          strategy: 'Always compute the determinant before anything else.',
          explanation: '$A = \\begin{bmatrix}1&2\\\\2&4\\end{bmatrix}$, $\\det(A) = 1\\cdot4-2\\cdot2=0$.',
          math: '\\det(A) = 4-4 = 0',
        },
        {
          label: 'Recognize that Cramer\'s rule cannot proceed',
          strategy: '$\\det(A) = 0$ means the denominator is zero — division is undefined.',
          explanation: 'We cannot compute $x = \\det(A_1)/0$ — division by zero. This signals that the system does NOT have a unique solution: it is either inconsistent (no solution) or has infinitely many.',
          math: 'x = \\frac{\\det(A_1)}{0} \\;\\text{(undefined)}',
          gotcha: "Cramer's rule requires $\\det(A) \\neq 0$. If it's zero, switch to row reduction to determine whether there are zero solutions or infinitely many.",
        },
        {
          label: 'Use row reduction to determine the actual situation',
          strategy: 'Row-reduce the augmented matrix to read off whether there is a contradiction.',
          explanation: '$R_2 \\leftarrow R_2-2R_1$: $(0,0,5-6)=(0,0,-1)$. Row 2 reads $0=-1$ — a contradiction. No solution.',
          math: '\\begin{bmatrix}1&2&|&3\\\\0&0&|&-1\\end{bmatrix} \\implies \\text{no solution}',
        },
        {
          label: 'Contrast: a consistent but dependent system',
          strategy: 'If the last row were $[0,0,0]$ instead of $[0,0,-1]$, there would be infinitely many solutions.',
          explanation: 'Change $\\mathbf{b}=[3,6]^\\top$: $R_2-2R_1=(0,0,6-6)=(0,0,0)$ — consistent with one free variable. Both cases have $\\det(A)=0$; only row reduction tells you which one you have.',
          math: '\\mathbf{b}=[3,6]^\\top: \\text{infinitely many} \\quad \\mathbf{b}=[3,5]^\\top: \\text{none}',
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'la2-008-ch1',
      difficulty: 'easy',
      problem: 'Solve $\\begin{cases}5x_1 + 2x_2 = 7 \\\\ 3x_1 - x_2 = 1\\end{cases}$ using Cramer\'s Rule. Show each determinant computation.',
      hint: '$\\det(A) = 5(-1) - 2(3) = -11$. $A_1 = [[7,2],[1,-1]]$, $A_2 = [[5,7],[3,1]]$.',
      walkthrough: [
        { expression: '\\det(A) = 5(-1) - 2(3) = -5-6 = -11', annotation: 'Determinant of coefficient matrix.' },
        { expression: '\\det(A_1) = 7(-1) - 2(1) = -7-2 = -9, \\quad x_1 = -9/(-11) = 9/11', annotation: 'Replace column 1 with b.' },
        { expression: '\\det(A_2) = 5(1) - 7(3) = 5-21 = -16, \\quad x_2 = -16/(-11) = 16/11', annotation: 'Replace column 2 with b.' },
      ],
      answer: '$x_1 = 9/11$, $x_2 = 16/11$',
    },
    {
      id: 'la2-008-ch2',
      difficulty: 'medium',
      problem: 'For $A = \\begin{bmatrix}2&-1\\\\3&4\\end{bmatrix}$, compute $\\text{adj}(A)$ and verify that $A \\cdot \\text{adj}(A) = \\det(A) \\cdot I$.',
      hint: 'For 2×2: $\\text{adj}\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix} = \\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$. Then multiply $A \\cdot \\text{adj}(A)$ directly.',
      walkthrough: [
        { expression: '\\det(A) = 2(4) - (-1)(3) = 8+3 = 11', annotation: 'Compute the determinant.' },
        { expression: '\\text{adj}(A) = \\begin{bmatrix}4&1\\\\-3&2\\end{bmatrix}', annotation: 'Swap diagonal, negate off-diagonal.' },
        { expression: 'A \\cdot \\text{adj}(A) = \\begin{bmatrix}2&-1\\\\3&4\\end{bmatrix}\\begin{bmatrix}4&1\\\\-3&2\\end{bmatrix} = \\begin{bmatrix}8+3&2-2\\\\12-12&3+8\\end{bmatrix} = \\begin{bmatrix}11&0\\\\0&11\\end{bmatrix} = 11I \\checkmark', annotation: 'Verify the identity $A \\cdot \\text{adj}(A) = \\det(A) I$.' },
      ],
      answer: '$\\text{adj}(A) = \\begin{bmatrix}4&1\\\\-3&2\\end{bmatrix}$; $A \\cdot \\text{adj}(A) = 11I$ âœ“',
    },
    {
      id: 'la2-008-ch3',
      difficulty: 'hard',
      problem: "Prove the Alien Cofactor Theorem for a 3×3 matrix: show that the sum $\\sum_{k=1}^3 a_{2k} C_{1k}$ equals zero (row 2 entries times row 1 cofactors). Explain geometrically what this means.",
      hint: 'This sum is the cofactor expansion of a matrix where row 1 is replaced by row 2 — a matrix with two identical rows. Expand the determinant of this new matrix along row 1.',
      walkthrough: [
        { expression: '\\sum_{k=1}^3 a_{2k} C_{1k} = \\det\\begin{bmatrix}a_{21}&a_{22}&a_{23}\\\\a_{21}&a_{22}&a_{23}\\\\a_{31}&a_{32}&a_{33}\\end{bmatrix}', annotation: 'The sum is exactly cofactor expansion along row 1 of a matrix where the first row is replaced by row 2 — giving a matrix with rows 1 and 2 identical.' },
        { expression: '\\det\\begin{bmatrix}\\mathbf{r}_2\\\\\\mathbf{r}_2\\\\\\mathbf{r}_3\\end{bmatrix} = 0', annotation: 'By Property 2 (antisymmetry): swapping the two identical rows gives the same matrix but multiplies the determinant by −1. So $d = -d$, giving $d = 0$. Any matrix with two identical rows has determinant zero.' },
        { expression: '\\text{Geometric meaning: the "parallelepiped" with two identical edge vectors has zero volume.}', annotation: 'If two row vectors are identical, the corresponding parallelogram (2D) or parallelepiped (3D) is degenerate — it collapses to a lower dimension. Volume = 0 = determinant.' },
      ],
      answer: 'The sum equals det of a matrix with two identical rows, which is zero by the antisymmetry axiom of the determinant. Geometrically: the parallelepiped formed by a repeated vector has zero volume.',
    },
  ],

  semantics: {
    core: [
      { symbol: 'x_i = \\det(A_i(\\mathbf{b}))/\\det(A)', meaning: "Cramer's Rule: the $i$-th component of the unique solution, expressed as a ratio of determinants. $A_i(\\mathbf{b})$ is $A$ with column $i$ replaced by $\\mathbf{b}$." },
      { symbol: 'A^{-1} = \\text{adj}(A)/\\det(A)', meaning: 'The adjugate inverse formula. Expresses each entry of $A^{-1}$ as a rational function of the entries of $A$. Theoretically fundamental; numerically use LU instead.' },
      { symbol: 'C_{ij} = (-1)^{i+j} M_{ij}', meaning: 'Cofactor: the minor $M_{ij}$ (det of submatrix after deleting row $i$ and column $j$) with an alternating sign from the checkerboard pattern.' },
      { symbol: '\\text{adj}(A) = (C_{ij})^\\top', meaning: 'Adjugate: the TRANSPOSE of the cofactor matrix. Not the cofactor matrix itself — the transpose.' },
    ],
    rulesOfThumb: [
      "Cramer's Rule requires $n+1$ determinants for an $n \\times n$ system — exponentially expensive for $n \\geq 4$.",
      "Use Cramer's Rule for: (1) 2×2 and 3×3 symbolic/parametric systems, (2) proofs, (3) CAS algebra.",
      "Never use Cramer's Rule in numerical code — use np.linalg.solve or A \\\\ b.",
      'The adjugate is the TRANSPOSE of the cofactor matrix. Swapping and negating for 2×2 already builds in the transpose.',
    ],
  },
  spiral: {
    recoveryPoints: [
      { lessonId: 'la2-005', label: 'Determinants — General Formulas', note: "Cramer's Rule is a direct application of cofactor expansion and determinant properties. Review cofactor definition and the checkerboard sign pattern before this lesson." },
    ],
    futureLinks: [
      { lessonId: 'la3-001', label: 'Eigenvalues', note: "The characteristic polynomial $\\det(A - \\lambda I) = 0$ is a polynomial in $\\lambda$ whose roots are eigenvalues. Cramer's Rule connects: each eigenvector component can be written as a ratio of determinants involving $\\lambda$." },
      { lessonId: 'la4-003', label: 'Least Squares', note: "The normal equations $A^\\top A \\mathbf{x} = A^\\top \\mathbf{b}$ are solved numerically with LU/Cholesky. But the adjugate formula $(A^\\top A)^{-1} = \\text{adj}(A^\\top A) / \\det(A^\\top A)$ shows the solution depends continuously on the data $A$." },
    ],
  },
  mentalModel: [
    "Cramer's Rule: each coordinate = ratio of determinants (replace column with b, divide by det(A)).",
    'Beautiful formula, impractical for large n — use it for 2×2/3×3 symbolic work and proofs.',
    'Adjugate = transpose of cofactor matrix → explicit inverse formula.',
    'Alien cofactor theorem: row i entries × row j cofactors = 0 (two identical rows → det = 0).',
    "Cramer's Rule is O(n! · n) vs Gaussian elimination O(n³) — exponentially slower.",
  ],
  checkpoints: [
    { id: 'cp-la2-008-1', label: "Read intuition — understand when Cramer's Rule is vs. isn't appropriate", type: 'read' },
    { id: 'cp-la2-008-2', label: 'Read math — trace the proof of the adjugate inverse formula', type: 'read' },
    { id: 'cp-la2-008-3', label: "Read rigor — understand the Alien Cofactor Theorem and its role in proving $A \\cdot \\text{adj}(A) = \\det(A)I$", type: 'read' },
    { id: 'cp-la2-008-4', label: "Run OpenMAT cell 1 — verify Cramer's Rule matches backslash on a 3×3 system", type: 'lab' },
    { id: 'cp-la2-008-5', label: "Complete example 1: trace all four determinants in Cramer's Rule for a 3×3 system", type: 'example' },
    { id: 'cp-la2-008-6', label: "Complete example 2: apply the adjugate formula to compute a 2×2 inverse", type: 'example' },
    { id: 'cp-la2-008-7', label: "Attempt challenge 1: 2×2 Cramer's Rule from scratch", type: 'challenge' },
    { id: 'cp-la2-008-8', label: 'Attempt challenge 3: prove the Alien Cofactor Theorem', type: 'challenge' },
  ],
  assessment: {
    questions: [
      {
        id: 'la2-008-assess-1',
        type: 'choice',
        text: "A $10 \\times 10$ system needs to be solved. A student proposes using Cramer's Rule. How many $10 \\times 10$ determinants must be computed?",
        options: ['10', '11', '100', '$10!$'],
        answer: '11',
        hints: ["Cramer's Rule requires $\\det(A)$ plus one $\\det(A_i)$ for each unknown. Total: $1 + 10 = 11$ determinants."],
      },
      {
        id: 'la2-008-assess-2',
        type: 'choice',
        text: "Cramer's Rule gives $x_2 = ?$ for the system $A\\mathbf{x} = \\mathbf{b}$.",
        options: [
          '$x_2 = \\dfrac{\\det(A_2)}{\\det(A)}$ where $A_2$ is $A$ with column 2 replaced by $\\mathbf{b}$',
          '$x_2 = \\dfrac{\\det(A)}{\\det(A_2)}$',
          '$x_2 = \\det(A_2)$ directly',
          '$x_2 = \\dfrac{b_2}{a_{22}}$',
        ],
        answer: '$x_2 = \\dfrac{\\det(A_2)}{\\det(A)}$ where $A_2$ is $A$ with column 2 replaced by $\\mathbf{b}$',
        hints: ["$x_i = \\det(A_i) / \\det(A)$, where $A_i$ is $A$ with column $i$ replaced by $\\mathbf{b}$."],
      },
      {
        id: 'la2-008-assess-3',
        type: 'choice',
        text: 'The adjugate $\\text{adj}(A)$ is defined as:',
        options: [
          'The transpose of the cofactor matrix of $A$',
          'The inverse of $A$',
          'The cofactor matrix without transposing',
          '$\\det(A) \\cdot I$',
        ],
        answer: 'The transpose of the cofactor matrix of $A$',
        hints: ['$\\text{adj}(A)_{ij} = C_{ji}$. This gives $A \\cdot \\text{adj}(A) = \\det(A) \\cdot I$, so $A^{-1} = \\text{adj}(A)/\\det(A)$.'],
      },
      {
        id: 'la2-008-assess-4',
        type: 'choice',
        text: "When is Cramer's Rule practically useful?",
        options: [
          'Only for small systems ($n \\leq 3$ or $4$) where computing $n+1$ determinants is feasible',
          'For any size system — it is always faster than LU decomposition',
          'Only when $\\det(A) = 1$',
          'Only for symmetric matrices',
        ],
        answer: 'Only for small systems ($n \\leq 3$ or $4$) where computing $n+1$ determinants is feasible',
        hints: ["Needs $n+1$ determinants each at $O(n^3)$: total $O(n^4)$ vs $O(n^3)$ for LU solve. Practical only for $2\\times 2$ or $3\\times 3$ systems."],
      },
    ],
  },
  quiz: [
    {
      id: 'la2-008-quiz-1',
      type: 'choice',
      text: "Cramer's Rule requires computing how many determinants for a $5 \\times 5$ system?",
      options: ['5', '6', '25', '120'],
      answer: '6',
      hints: ["You need $\\det(A)$ plus $\\det(A_1), \\ldots, \\det(A_5)$ — that is 6 total. One original matrix and 5 modified matrices (each with one column replaced by $\\mathbf{b}$)."],
      reviewSection: "Intuition tab — Complexity callout",
    },
    {
      id: 'la2-008-quiz-2',
      type: 'choice',
      text: 'For $A = \\begin{bmatrix}3&1\\\\2&4\\end{bmatrix}$, what is $\\text{adj}(A)$?',
      options: [
        '$\\begin{bmatrix}4&-1\\\\-2&3\\end{bmatrix}$',
        '$\\begin{bmatrix}4&-2\\\\-1&3\\end{bmatrix}$',
        '$\\begin{bmatrix}3&-1\\\\-2&4\\end{bmatrix}$',
        '$\\begin{bmatrix}4&2\\\\1&3\\end{bmatrix}$',
      ],
      answer: '$\\begin{bmatrix}4&-1\\\\-2&3\\end{bmatrix}$',
      hints: ['For 2×2: $\\text{adj}\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix} = \\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$. Swap diagonal entries, negate off-diagonal entries.'],
      reviewSection: 'Intuition tab — Cofactor and Adjugate definition callout',
    },
    {
      id: 'la2-008-quiz-3',
      type: 'choice',
      text: "In Cramer's Rule, to find $x_2$ in the system $A\\mathbf{x} = \\mathbf{b}$, what matrix do you form?",
      options: [
        'Replace the second ROW of $A$ with $\\mathbf{b}$.',
        'Replace the second COLUMN of $A$ with $\\mathbf{b}$.',
        'Add $\\mathbf{b}$ as a new column on the right of $A$.',
        'Multiply the second column of $A$ by $\\mathbf{b}$.',
      ],
      answer: 'Replace the second COLUMN of $A$ with $\\mathbf{b}$.',
      hints: ["$A_i(\\mathbf{b})$ is $A$ with column $i$ replaced by $\\mathbf{b}$. For $x_2$: replace column 2. The intuition: $\\mathbf{b} = A\\mathbf{x}$ puts $\\mathbf{b}$ in the 'column 2 slot' of the column combination."],
      reviewSection: "Intuition tab — The formula, stated directly",
    },
    {
      id: 'la2-008-quiz-4',
      type: 'choice',
      text: "For which scenario is Cramer's Rule MOST appropriate?",
      options: [
        'Solving a $500 \\times 500$ system numerically as fast as possible.',
        "Finding an explicit symbolic formula for $x_1(t)$ when $A$ depends on a parameter $t$.",
        'Computing the determinant of a large matrix efficiently.',
        "Finding the LU factorization of $A$.",
      ],
      answer: "Finding an explicit symbolic formula for $x_1(t)$ when $A$ depends on a parameter $t$.",
      hints: ["Cramer's Rule is powerful when the matrix contains symbolic parameters — it gives a closed-form formula for each variable. For pure numerical computation with fixed large matrices, always use LU/np.linalg.solve."],
      reviewSection: "Intuition tab — When to use Cramer's Rule",
    },
    {
      id: 'la2-008-quiz-5',
      type: 'choice',
      text: "What does the Alien Cofactor Theorem say? $\\sum_{k=1}^n a_{jk} C_{ik} = ?$ for $i \\neq j$?",
      options: [
        '$\\det(A)$ — same as a regular cofactor expansion.',
        '$0$ — because this expansion computes the determinant of a matrix with two identical rows.',
        '$\\text{tr}(A)$ — the trace of the matrix.',
        '$\\pm \\det(A)$ depending on the parity of $i$ and $j$.',
      ],
      answer: '$0$ — because this expansion computes the determinant of a matrix with two identical rows.',
      hints: ['The sum $\\sum_k a_{jk} C_{ik}$ is the cofactor expansion of a matrix where row $i$ is replaced by row $j$. That matrix has rows $i$ and $j$ identical, so its determinant is 0 by the antisymmetry property of the determinant.'],
      reviewSection: 'Rigor tab — Alien Cofactor Theorem callout',
    },
    {
      id: 'la2-008-quiz-6',
      type: 'choice',
      text: 'The 2×2 inverse formula $\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}^{-1} = \\frac{1}{ad-bc}\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$ is a special case of which general formula?',
      options: [
        "Cramer's Rule applied to each column of the identity matrix.",
        'The adjugate formula $A^{-1} = \\text{adj}(A)/\\det(A)$.',
        'LU decomposition for 2×2 matrices.',
        'The Cayley-Hamilton theorem.',
      ],
      answer: 'The adjugate formula $A^{-1} = \\text{adj}(A)/\\det(A)$.',
      hints: ['For a 2×2 matrix $\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}$: the cofactor matrix is $\\begin{bmatrix}d&-c\\\\-b&a\\end{bmatrix}$, and its transpose (the adjugate) is $\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$. Dividing by $\\det = ad-bc$ gives the familiar formula.'],
      reviewSection: 'Math tab — Inverse via Adjugate theorem callout',
    },
    {
      id: 'la2-008-quiz-7',
      type: 'choice',
      text: 'Why is Cramer\'s Rule impractical for solving a $100 \\times 100$ linear system numerically?',
      options: [
        'It requires computing $101$ determinants of $100 \\times 100$ matrices — each costing $O(n^3)$, giving $O(n^4)$ total vs $O(n^3)$ for LU',
        'Cramer\'s Rule only works for $2 \\times 2$ systems',
        'Cramer\'s Rule requires all entries to be integers',
        'Modern computers cannot compute determinants larger than $10 \\times 10$',
      ],
      answer: 'It requires computing $101$ determinants of $100 \\times 100$ matrices — each costing $O(n^3)$, giving $O(n^4)$ total vs $O(n^3)$ for LU',
      hints: ['For an $n\\times n$ system: Cramer\'s Rule needs $n+1$ determinants (one for $\\det(A)$, one for each $x_i$). Each determinant costs $O(n^3)$ via LU. Total: $O(n^4)$. LU solve: $O(n^3)$ once. At $n=100$: $100\\times$ slower.'],
      reviewSection: 'Intuition tab — When to use Cramer\'s Rule',
    },
    {
      id: 'la2-008-quiz-8',
      type: 'choice',
      text: 'Solve using Cramer\'s Rule: $3x_1 + x_2 = 7$, $x_1 + 2x_2 = 4$. What is $x_1$?',
      options: [
        '$x_1 = 2$ — $\\det(A_1) = 14-4 = 10$, $\\det(A) = 6-1 = 5$, $x_1 = 10/5 = 2$',
        '$x_1 = 4/5$',
        '$x_1 = 7/3$',
        '$x_1 = 3$',
      ],
      answer: '$x_1 = 2$ — $\\det(A_1) = 14-4 = 10$, $\\det(A) = 6-1 = 5$, $x_1 = 10/5 = 2$',
      hints: ['$\\det(A) = 3(2) - 1(1) = 5$. Replace column 1 with $\\mathbf{b} = [7,4]^T$: $A_1 = \\begin{bmatrix}7&1\\\\4&2\\end{bmatrix}$, $\\det(A_1) = 14-4 = 10$. $x_1 = 10/5 = 2$.'],
      reviewSection: 'Example 1 — Cramer\'s Rule computation',
    },
    {
      id: 'la2-008-quiz-9',
      type: 'choice',
      text: 'The adjugate matrix $\\text{adj}(A)$ is defined as the transpose of the cofactor matrix. What is $\\text{adj}(A)$ for $A = \\begin{bmatrix}3&1\\\\2&4\\end{bmatrix}$?',
      options: [
        '$\\begin{bmatrix}4&-1\\\\-2&3\\end{bmatrix}$',
        '$\\begin{bmatrix}4&2\\\\1&3\\end{bmatrix}$',
        '$\\begin{bmatrix}3&-1\\\\-2&4\\end{bmatrix}$',
        '$\\begin{bmatrix}-4&1\\\\2&-3\\end{bmatrix}$',
      ],
      answer: '$\\begin{bmatrix}4&-1\\\\-2&3\\end{bmatrix}$',
      hints: ['Cofactor matrix: $C_{11}=4$, $C_{12}=-2$, $C_{21}=-1$, $C_{22}=3$. Cofactor matrix: $\\begin{bmatrix}4&-2\\\\-1&3\\end{bmatrix}$. Its transpose (the adjugate): $\\begin{bmatrix}4&-1\\\\-2&3\\end{bmatrix}$. Check: $A \\cdot \\text{adj}(A) = \\det(A) \\cdot I$ — verify with $\\det = 10$.'],
      reviewSection: 'Math tab — Inverse via adjugate',
    },
    {
      id: 'la2-008-quiz-10',
      type: 'choice',
      text: 'How does Cramer\'s Rule show that the solution $\\mathbf{x}$ to $A\\mathbf{x} = \\mathbf{b}$ depends continuously on $\\mathbf{b}$?',
      options: [
        'Each $x_i = \\det(A_i(\\mathbf{b}))/\\det(A)$ is a rational function of the entries of $\\mathbf{b}$ — rational functions are continuous',
        'The LU factorization is continuous in $\\mathbf{b}$',
        'Solutions are always continuous in the right-hand side',
        'Cramer\'s Rule does not show continuity',
      ],
      answer: 'Each $x_i = \\det(A_i(\\mathbf{b}))/\\det(A)$ is a rational function of the entries of $\\mathbf{b}$ — rational functions are continuous',
      hints: ['The determinant is a polynomial in the matrix entries — hence continuous. Since $\\det(A)\\neq 0$ is fixed and $\\det(A_i(\\mathbf{b}))$ is a polynomial in $\\mathbf{b}$\'s entries, $x_i(\\mathbf{b})$ is continuous (even differentiable). This is the implicit function theorem in action.'],
      reviewSection: 'Intuition tab — implicit function theorem connection',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'Cramer\'s Rule is efficient and should be used for any system where the determinant is easy to compute.',
      whyStudentsThinkIt: 'Cramer\'s Rule is elegant and formulaic — it looks like a direct, clean method. Students don\'t account for the factorial explosion in cofactor expansion for large matrices.',
      correctionExample: 'For a $5\\times 5$ system: Cramer\'s Rule needs 6 determinants. Each $5\\times 5$ det via cofactor expansion: $5! = 120$ term products. Via LU: $O(5^3)=125$ operations. For $n=10$: cofactor expansion is $10! = 3.6$ million multiplications per determinant vs $O(n^3)$ for LU.',
      contrastCase: 'Cramer\'s Rule IS optimal for $2\\times 2$ systems (one formula gives both answers). For $n \\geq 3$, LU solve is almost always faster. Use Cramer\'s Rule when you need the symbolic form of the solution.',
    },
    {
      falseBelief: 'In Cramer\'s Rule, you replace the column corresponding to the EQUATION NUMBER, not the VARIABLE number.',
      whyStudentsThinkIt: 'Students confuse the column index $i$ (which variable) with the row index $i$ (which equation). The variable $x_i$ corresponds to column $i$, not row $i$.',
      correctionExample: 'To solve for $x_2$: replace column 2 of $A$ with $\\mathbf{b}$. Row operations (which equation) are irrelevant. The denominator is always $\\det(A)$, the same for all variables.',
      contrastCase: 'The formula: $x_i = \\det(A_i(\\mathbf{b}))/\\det(A)$ where $A_i(\\mathbf{b})$ = matrix $A$ with its $i$-th COLUMN replaced by $\\mathbf{b}$. Column $i$ corresponds to variable $x_i$.',
    },
  ],

  transferPrompts: [
    {
      situation: 'An electrical engineer derives the steady-state currents in a 2-node circuit as a function of voltage $V$. She has the system $A\\mathbf{I}(V) = \\mathbf{b}(V)$ where both $A$ and $\\mathbf{b}$ depend on the parameter $V$. She needs a formula for $I_1(V)$ that she can differentiate. Should she use LU or Cramer\'s Rule?',
      competingTechniques: 'LU decomposition (numerical) vs. Cramer\'s Rule (symbolic)',
      whyThisTechniqueWins: 'Cramer\'s Rule gives $I_1(V) = \\det(A_1(\\mathbf{b}(V)))/\\det(A(V))$ — a rational function of $V$ that can be differentiated analytically. LU would give a numerical answer for each specific $V$, but not a differentiable formula. Symbolic differentiation tools can process the Cramer formula.',
    },
    {
      situation: 'A control engineer needs to find the transfer function $H(s) = x_1(s)/u(s)$ for a MIMO system described by a $3\\times 3$ matrix equation $A(s)\\mathbf{x}(s) = \\mathbf{b}(s)$ in the Laplace domain. How does Cramer\'s Rule help?',
      competingTechniques: 'Invert the matrix symbolically vs. apply Cramer\'s Rule to each output',
      whyThisTechniqueWins: 'Cramer\'s Rule gives each transfer function as a ratio of two determinants: $H_i(s) = \\det(A_i(\\mathbf{b}(s)))/\\det(A(s))$. The denominator $\\det(A(s))$ is the characteristic polynomial (poles). The numerator gives the zeros. This directly exposes the system\'s stability properties in terms of poles and zeros.',
    },
  ],

  debugging: [
    {
      commonError: 'Replacing the wrong column when applying Cramer\'s Rule.',
      symptom: 'Student gets a correct $\\det(A)$ but replaces row $i$ or uses the wrong column, getting the wrong variable.',
      whyItHappened: 'The variable $x_i$ corresponds to column $i$ of $A$, not row $i$. Students sometimes mix up row/column after seeing row-based equation systems.',
      repairStrategy: 'Write out $A\\mathbf{x} = \\mathbf{b}$ explicitly: identify which column of $A$ has coefficient of $x_i$. That is the column to replace with $\\mathbf{b}$. For example, if $A = [\\mathbf{a}_1 | \\mathbf{a}_2 | \\mathbf{a}_3]$ and you want $x_2$: form $[\\mathbf{a}_1 | \\mathbf{b} | \\mathbf{a}_3]$.',
    },
    {
      commonError: 'Using the adjugate formula $A^{-1} = \\text{adj}(A)/\\det(A)$ for large matrix inversion in code.',
      symptom: 'Code is extremely slow for matrices larger than $5\\times 5$, or accuracy is poor.',
      whyItHappened: 'The adjugate requires computing $n^2$ cofactors, each a $(n-1)\\times(n-1)$ determinant — astronomically expensive.',
      repairStrategy: 'Use `np.linalg.inv(A)` or `scipy.linalg.inv(A)` (which internally use LU). Only use the adjugate formula symbolically or for $2\\times 2$ matrices.',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Apply Cramer\'s Rule to solve any $2\\times 2$ or $3\\times 3$ linear system by computing the required determinants and their ratios, and recognize when Cramer\'s Rule is theoretically valuable vs. computationally impractical.',
    explainVerbally: 'Explain the geometric interpretation of Cramer\'s Rule (ratio of parallelogram areas), the connection between the adjugate formula and the $2\\times 2$ inverse, and why Cramer\'s Rule is preferred for symbolic computation.',
    detectIncorrectApplication: 'Identify when a student replaces the wrong column in the Cramer formula, or applies Cramer\'s Rule to a large system that should use LU.',
    transferToUnfamiliar: 'Use Cramer\'s Rule to derive an explicit formula for the solution of a parametric system $A(t)\\mathbf{x} = \\mathbf{b}(t)$, expressing each $x_i$ as a rational function of the parameter $t$.',
  },
};
