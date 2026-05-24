export default {
  id: 'la2-008',
  slug: 'cramers-rule',
  chapter: 'la2',
  order: 8,
  title: "Cramer's Rule and the Adjugate",
  subtitle: "A determinant-based formula for each variable in a linear system — beautiful in theory, impractical at scale, essential for theory.",
  tags: ["Cramer's rule", 'adjugate', 'cofactor', 'determinant formula', 'inverse formula'],
  aliases: "Cramer rule adjugate adjoint cofactor matrix inverse determinant formula symbolic solution",

  hook: {
    question: "Is there a closed-form formula that expresses the solution to Ax = b as a ratio of determinants? And why don't we use it to write programs?",
    realWorldContext: "Cramer's Rule gives an explicit formula: the $i$-th component of the solution is $x_i = \\det(A_i) / \\det(A)$, where $A_i$ is $A$ with column $i$ replaced by $\\mathbf{b}$. This formula is invaluable for: (1) symbolic CAS systems that need explicit algebraic expressions, (2) proving theoretical results (like the inverse formula $A^{-1} = \\text{adj}(A)/\\det(A)$), and (3) solving 2×2 or 3×3 systems symbolically by hand. For $n > 4$, it requires computing $n+1$ determinants each of size $n \\times n$ — exponentially slower than Gaussian elimination — so no numerical software uses it for large systems.",
    previewVisualizationId: 'LALesson05_Det',
  },

  intuition: {
    prose: [
      '**The formula, stated directly.** If $A\\mathbf{x} = \\mathbf{b}$ and $\\det(A) \\neq 0$, then:\n$$x_i = \\frac{\\det(A_i(\\mathbf{b}))}{\\det(A)}$$\nwhere $A_i(\\mathbf{b})$ is the matrix $A$ with its $i$-th column replaced by $\\mathbf{b}$.',
      '**Why does this work geometrically?** Think in 2D. The solution $\\mathbf{x} = [x_1, x_2]^\\top$ must satisfy $A\\mathbf{x} = \\mathbf{b}$. The determinant $\\det(A)$ is the area of the parallelogram formed by $A$\'s columns. When you replace column 1 with $\\mathbf{b}$, you get $\\det(A_1)$, which is the area of a different parallelogram. Cramer\'s rule says these area ratios directly give you the coordinates.',
      '**The Adjugate and the Inverse Formula.** The adjugate (also called the classical adjoint) of $A$ is the transpose of the cofactor matrix. It gives the explicit formula:\n$$A^{-1} = \\frac{1}{\\det(A)} \\text{adj}(A)$$\nThis is the theoretical origin of the formula you may have used for 2×2 inverses: $\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}^{-1} = \\frac{1}{ad-bc}\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$.',
      '**When to use Cramer\'s Rule.** In practice: almost never for computation. In theory: constantly. Cramer\'s Rule appears in proofs, in symbolic computation, in understanding how the solution depends continuously on the data (implicit function theorem), and in control theory (transfer functions).',
    ],
    callouts: [
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
    visualizations: [
      {
        id: 'LALesson05_Det',
        title: "Cramer's Rule: Area Interpretation",
        mathBridge: "Drag the vector b and watch how x₁ = det(A₁)/det(A) and x₂ = det(A₂)/det(A) change. The shaded parallelograms show the two determinants geometrically.",
        caption: 'Cramer\'s Rule as ratios of signed areas.',
      },
      {
        id: 'OpenMatNotebook',
        title: "Verify Cramer's Rule and the Adjugate",
        mathBridge: 'Compute solutions via both Cramer\'s Rule and backslash, then compare.',
        caption: 'Computational verification of determinant-based formulas.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: "Cramer's Rule step by step",
              prose: ["Solve a 3×3 system using Cramer's Rule. Compare with A\\b."],
              code: `A = [2 1 -1; -3 -1 2; -2 1 2];
b = [8; -11; -3];

d = det(A);
x1 = det([b A(:,2) A(:,3)]) / d;
x2 = det([A(:,1) b A(:,3)]) / d;
x3 = det([A(:,1) A(:,2) b]) / d;

disp('Cramer solution:')
disp([x1; x2; x3])
disp('Backslash solution:')
disp(A \\ b)`,
            },
            {
              id: 2,
              cellTitle: 'Adjugate and inverse formula',
              prose: ['The adjugate matrix gives an explicit formula for the inverse.'],
              code: `A = [1 2; 3 4];
d = det(A);
% Adjugate of 2x2: swap diagonal, negate off-diagonal
adj_A = [A(2,2) -A(1,2); -A(2,1) A(1,1)];
inv_formula = adj_A / d;
disp('1/det * adj(A):')
inv_formula
disp('inv(A):')
inv(A)`,
            },
          ]
        }
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
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cellTitle: "Cramer's Rule implementation — step by step",
              prose: [
                "For a system Ax = b, x_i = det(A_i) / det(A) where A_i is A with column i replaced by b.",
                "This is exact for small systems. For large n, it is exponentially slower than np.linalg.solve.",
              ],
              code: `import numpy as np

def cramers_rule(A, b):
    """Solve Ax = b using Cramer's Rule. Only practical for small n."""
    n = len(b)
    det_A = np.linalg.det(A)
    if abs(det_A) < 1e-12:
        raise ValueError("Matrix is singular — no unique solution")

    x = np.zeros(n)
    for i in range(n):
        Ai = A.copy()
        Ai[:, i] = b        # replace column i with b
        x[i] = np.linalg.det(Ai) / det_A
    return x

# 3×3 system: 2x₁ + x₂ - x₃ = 8,  -3x₁ - x₂ + 2x₃ = -11,  -2x₁ + x₂ + 2x₃ = -3
A = np.array([[2., 1., -1.],
              [-3., -1., 2.],
              [-2., 1., 2.]])
b = np.array([8., -11., -3.])

x_cramer = cramers_rule(A, b)
x_solve  = np.linalg.solve(A, b)

print("Cramer's Rule:", x_cramer.round(6))
print("np.linalg.solve:", x_solve.round(6))
print("Match:", np.allclose(x_cramer, x_solve))`,
            },
            {
              id: 2,
              cellTitle: "Adjugate inverse formula — A⁻¹ = adj(A) / det(A)",
              prose: [
                "The adjugate is the transpose of the cofactor matrix. For 2×2: adj([[a,b],[c,d]]) = [[d,-b],[-c,a]].",
                "For larger matrices, compute cofactors by omitting each row and column. NumPy's inv() is faster, but adjugate is useful for symbolic computation.",
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
          ]
        }
      },
    ],
  },

  rigor: {
    prose: [
      "**Cramer's Rule and the implicit function theorem.** One deep application of Cramer's Rule is in proving the implicit function theorem. If $F(\\mathbf{x}, \\mathbf{y}) = \\mathbf{0}$ near a point and the Jacobian $\\partial F / \\partial \\mathbf{y}$ is invertible, then $\\mathbf{y}$ can be expressed as a smooth function of $\\mathbf{x}$. The explicit formula for the partial derivatives of this implicit function is exactly Cramer's rule applied to the linear system $J \\partial \\mathbf{y}/\\partial x_i = -\\partial F/\\partial x_i$.",
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Adjugate Entries are Polynomials in A',
        body: 'The entries of $\\text{adj}(A)$ are $(n-1) \\times (n-1)$ minors of $A$ — polynomials of degree $n-1$ in the entries of $A$. This means $A^{-1}$ (when it exists) has entries that are rational functions of the entries of $A$. This algebraic structure is why Cramer\'s Rule is useful in symbolic computation and proofs, even though it is numerically impractical.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'la2-008-ex1',
      title: "Apply Cramer's Rule to a 3×3 System",
      problem: 'Solve $2x_1 + x_2 - x_3 = 8$; $-3x_1 - x_2 + 2x_3 = -11$; $-2x_1 + x_2 + 2x_3 = -3$.',
      solution: '$\\det(A) = 1$. By Cramer: $x_1 = 2$, $x_2 = 3$, $x_3 = -1$.',
      steps: [
        'Compute $\\det(A) = 2[(-1)(2) - (2)(1)] - 1[(-3)(2) - (2)(-2)] + (-1)[(-3)(1) - (-1)(-2)]$.',
        'Compute $\\det(A_1)$ by replacing column 1 with $[8, -11, -3]^\\top$.',
        'Similarly compute $\\det(A_2)$ and $\\det(A_3)$.',
        'Divide each by $\\det(A) = 1$.',
      ],
    },
  ],

  challenges: [
    {
      id: 'la2-008-ch1',
      title: "Prove the adjugate inverse formula for 3×3",
      difficulty: 'hard',
      challengeType: 'prove',
      prompt: "Show directly (by matrix multiplication) that $A \\cdot \\text{adj}(A) = \\det(A) \\cdot I$ for a 3×3 matrix. Focus on proving that the off-diagonal entries of $A \\cdot \\text{adj}(A)$ are zero using the 'alien cofactor' theorem: the expansion of a determinant with a repeated row is zero.",
      hint: 'The $(i,j)$ entry of $A \\cdot \\text{adj}(A)$ is $\\sum_{k=1}^3 a_{ik} C_{jk}$. When $i \\neq j$, this is the determinant of $A$ with row $j$ replaced by row $i$ — a matrix with two identical rows.',
    },
  ],

  semantics: {
    core: ["Cramer's-rule", 'adjugate', 'cofactor', 'minor', 'inverse-formula'],
  },
  spiral: {
    recoveryPoints: ['la2-005-determinants-general'],
    futureLinks: ['la6-005-kernel-and-image'],
  },
  mentalModel: [
    "Cramer's Rule: each coordinate is a ratio of determinants.",
    'Beautiful formula, impractical for large n — use it for theory and 2×2/3×3.',
    'Adjugate = transpose of cofactor matrix → gives the explicit inverse formula.',
  ],
  checkpoints: ['read-intuition', 'run-cells'],
  assessment: { questions: [] },
  quiz: [
    {
      id: 'la2-008-q1',
      question: "Cramer's Rule requires computing __ determinants for a 5×5 system.",
      options: ['5', '6', '25', '120'],
      answer: 1,
      explanation: 'You need det(A) plus det(A₁) through det(A₅) — that is 6 total determinants (1 original + 5 modified matrices).',
    },
    {
      id: 'la2-008-q2',
      question: 'For A = [[3, 1], [2, 4]], what is adj(A)?',
      options: ['[[4, -1], [-2, 3]]', '[[4, -2], [-1, 3]]', '[[3, -1], [-2, 4]]', '[[4, 2], [1, 3]]'],
      answer: 0,
      explanation: 'For a 2×2 matrix [[a,b],[c,d]], adj = [[d,-b],[-c,a]]. So adj([[3,1],[2,4]]) = [[4,-1],[-2,3]].',
    },
  ],
};
