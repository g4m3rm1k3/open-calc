export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la3-002',
  slug: 'diagonalization',
  chapter: 'la3',
  order: 2,
  title: 'Change of Basis and Diagonalization',
  subtitle: 'Rebuild your coordinate system around eigenvectors, and the most complicated matrix becomes trivial diagonal scaling.',
  tags: ['diagonalization', 'change of basis', 'PDP inverse', 'eigenbasis', 'matrix powers', 'diagonal matrix', 'similar matrices'],
  aliases: 'diagonalize change basis eigenbasis PDP matrix powers similar matrices spectral decomposition',

  // ── Hook ──────────────────────────────────────────────────────
  hook: {
    question: "How do you compute $A^{100}$ — a matrix raised to the 100th power — without doing a hundred separate matrix multiplications?",
    realWorldContext: "Matrix powers appear everywhere: predicting the long-term state of a Markov chain (like Google PageRank after many iterations), computing the spread of disease through a network after many time steps, simulating a vibrating structure over many cycles, and running a neural network forward pass. In each case, you need the same matrix applied repeatedly. Diagonalization converts this nightmare into a one-line formula — and it works because of eigenvectors.",
    previewVisualizationId: 'LALesson09_Diagonalization',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      '**Where you are in the story:** You just found eigenvectors — the directions a matrix never rotates. You know the defining equation $A\\mathbf{v} = \\lambda\\mathbf{v}$. Now comes the payoff: what happens if you rebuild your entire coordinate system so its axes ARE the eigenvectors?',
      'In your regular coordinate system, a matrix looks messy — a grid of numbers with no obvious meaning. But in the eigenvector coordinate system, something beautiful happens: the matrix becomes **diagonal** — zeros everywhere except the main diagonal, where the eigenvalues sit. A diagonal matrix does the simplest possible thing: it just scales each axis independently.',
      'Here is the key idea: a change of basis is just a matrix multiplication. If $P$ is the matrix whose columns are the eigenvectors, then $P^{-1}$ transforms coordinates from the eigenvector basis back to the standard basis, and $P$ transforms the other way. The whole pipeline looks like:\n\n$$A = P D P^{-1}$$\n\nwhere $D$ is the diagonal matrix of eigenvalues.',
      '**Why this unlocks matrix powers.** Watch what happens when you square $A$:\n\n$$A^2 = (PDP^{-1})(PDP^{-1}) = PD(P^{-1}P)DP^{-1} = PD^2P^{-1}$$\n\nThe $P^{-1}P$ in the middle collapses to $I$. So $A^2 = PD^2P^{-1}$. By the same logic, $A^k = PD^kP^{-1}$ for any power $k$. And $D^k$ is trivial — you just raise each diagonal entry to the $k$th power. A matrix that would take hundreds of multiplications now takes three.',
      'Think of it this way: $P^{-1}$ rotates from standard coordinates into the eigenvector coordinate system. $D$ does the scaling — trivially — in that clean system. $P$ rotates back to standard coordinates. Three operations replace a hundred.',
      '**Where this is heading:** Not every matrix has enough eigenvectors to diagonalize — some are defective. And some matrices have complex eigenvalues, which produce rotation instead of scaling. The next lesson explores what happens when the characteristic equation has no real solutions.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 3 — Eigenvalues & Eigenvectors',
        body: '**Previous:** Eigenvectors and Eigenvalues — the invariant directions and their scaling factors.\n**This lesson:** Diagonalization — rebuilding coordinates around eigenvectors so the matrix becomes diagonal scaling.\n**Next:** Complex Eigenvalues — what happens when the matrix rotates and there are no real eigenvectors.',
      },
      {
        type: 'insight',
        title: 'The PDP⁻¹ Sandwich',
        body: 'A = PDP^{-1}\n\n$P$ = matrix of eigenvectors (columns)\n$D$ = diagonal matrix of eigenvalues\n\nPowers: $A^k = PD^kP^{-1}$, where $D^k$ just raises each diagonal entry to the $k$th power.',
      },
      {
        type: 'insight',
        title: 'What "Diagonal" Means Geometrically',
        body: 'A diagonal matrix does the purest, simplest possible transformation: it independently scales each coordinate axis. No mixing, no rotating, no shearing. Diagonalization asks: can we find a coordinate system where $A$ acts that simply?',
      },
      {
        type: 'warning',
        title: 'Not Every Matrix is Diagonalizable',
        body: 'Diagonalization requires $n$ linearly independent eigenvectors for an $n \\times n$ matrix. A **defective** matrix (one where geometric multiplicity < algebraic multiplicity for some eigenvalue) does not have enough eigenvectors and cannot be diagonalized over the reals.',
      },
    ],
    visualizations: [
      {
        id: 'LALesson09_Diagonalization',
        title: 'Change of Basis: Standard vs. Eigenvector Coordinates',
        mathBridge: 'The visualization shows two grids side by side: the standard coordinate grid (left) and the eigenvector coordinate grid (right). Apply matrix $A$ in the left grid — watch the complex shear/stretch. Switch to the right grid — the same transformation is now pure axis-aligned scaling. Drag a vector in either grid and watch it transform. Notice: in eigenvector coordinates, only the lengths change, never the grid lines\' angles.',
        caption: 'Same transformation, two views. Eigenvector coordinates reveal the simple truth.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      '**Building $P$ and $D$.** Let $A$ be an $n \\times n$ matrix with $n$ linearly independent eigenvectors $\\mathbf{v}_1, \\ldots, \\mathbf{v}_n$ and corresponding eigenvalues $\\lambda_1, \\ldots, \\lambda_n$. Define:\n\n$$P = \\begin{bmatrix}| & | & & | \\\\ \\mathbf{v}_1 & \\mathbf{v}_2 & \\cdots & \\mathbf{v}_n \\\\ | & | & & |\\end{bmatrix} \\qquad D = \\begin{bmatrix}\\lambda_1 & & \\\\ & \\ddots & \\\\ & & \\lambda_n\\end{bmatrix}$$\n\nThen $A = PDP^{-1}$.',
      '**Why does this work?** Multiply both sides of $A\\mathbf{v}_i = \\lambda_i\\mathbf{v}_i$ for all $i$ at once by writing them as a matrix equation: $AP = PD$. Multiplying on the right by $P^{-1}$ gives $A = PDP^{-1}$.',
      '**Using diagonalization to compute $A^k$.** Since $A = PDP^{-1}$:\n\n$$A^k = PD^kP^{-1} \\qquad \\text{where} \\qquad D^k = \\begin{bmatrix}\\lambda_1^k & & \\\\ & \\ddots & \\\\ & & \\lambda_n^k\\end{bmatrix}$$\n\nThree matrix multiplications ($P$, $D^k$, $P^{-1}$) regardless of $k$.',
      '**The condition for diagonalizability.** A matrix is diagonalizable if and only if the sum of the geometric multiplicities of all eigenvalues equals $n$. Equivalently: the eigenvectors span all of $\\mathbb{R}^n$. Matrices with $n$ distinct eigenvalues are always diagonalizable (since distinct-eigenvalue eigenvectors are linearly independent).',
      '**Spectral decomposition.** Diagonalization can also be written as a sum of rank-1 "outer products": $A = \\sum_{i=1}^n \\lambda_i \\mathbf{v}_i\\mathbf{u}_i^T$, where $\\mathbf{u}_i$ are the rows of $P^{-1}$. Each term is a single eigenvector-eigenvalue pair contributing its piece to the full transformation. This is the spectral decomposition.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Diagonalization Theorem',
        body: 'A = PDP^{-1}\n\nwhere $P$ has eigenvectors as columns and $D$ has eigenvalues on the diagonal.\n\nRequires: $n$ linearly independent eigenvectors.',
      },
      {
        type: 'theorem',
        title: 'Matrix Powers via Diagonalization',
        body: 'A^k = PD^kP^{-1} \\qquad \\left(D^k\\right)_{ii} = \\lambda_i^k',
      },
      {
        type: 'insight',
        title: 'Column Order Must Match',
        body: 'The order of eigenvectors in $P$ and eigenvalues in $D$ must match. If $\\mathbf{v}_1$ is column 1 of $P$, then $\\lambda_1$ must be the $(1,1)$ entry of $D$. Mixing them up gives $AP = PD$ with the wrong pairing — and $A \\neq PDP^{-1}$.',
      },
    ],
    visualizations: [
      {
        id: 'DiagonalizationStepperViz',
        title: 'Step-By-Step: Building P and D',
        mathBridge: 'Enter a 2×2 matrix. The stepper walks through: (1) finding eigenvalues from the characteristic equation, (2) finding eigenvectors for each eigenvalue, (3) assembling $P$ and $D$, (4) verifying $AP = PD$. At each step, the computation is shown in full. Change the matrix and repeat.',
        caption: 'Diagonalization made step-by-step explicit.',
      },
      {
        id: 'PythonNotebook',
        title: 'Code: Diagonalization and Matrix Powers',
        mathBridge: 'A = P D P⁻¹. eig() gives P and D. A^k = P D^k P⁻¹ — raise diagonal entries to the k-th power, no repeated multiplication. Verify: P @ D @ P_inv ≈ A.',
        caption: 'Diagonalize a matrix, then use it to compute high matrix powers instantly.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cellTitle: 'Building P and D from eigenvalues',
              prose: [
                '`np.linalg.eig(A)` gives the eigenvector matrix P and eigenvalue array. Put eigenvalues on the diagonal of D.',
                'Verify: `P @ D @ P_inv ≈ A`. If it does not match, something went wrong.',
              ],
              code: `import numpy as np

A = np.array([[4., 1.],
              [2., 3.]])

evals, P = np.linalg.eig(A)

# D = diagonal matrix of eigenvalues
D = np.diag(evals)
P_inv = np.linalg.inv(P)

print("Eigenvalues:", evals)
print()
print("P (eigenvectors as columns):")
print(P.round(4))
print()
print("Reconstructed A = P @ D @ P_inv:")
print((P @ D @ P_inv).real.round(6))
print()
print("Matches original A?", np.allclose((P @ D @ P_inv).real, A))`,
            },
            {
              id: 2,
              cellTitle: 'Matrix powers via diagonalization',
              prose: [
                'A^k = P D^k P⁻¹. Raising D to the k-th power just raises each diagonal entry (eigenvalue) to the k-th power.',
                'This makes computing A^100 as easy as A^2 — no repeated matrix multiplication.',
              ],
              code: `import numpy as np

A = np.array([[3., 1.],
              [0., 2.]])

evals, P = np.linalg.eig(A)
P_inv = np.linalg.inv(P)

def matrix_power_diag(A, P, evals, P_inv, k):
    Dk = np.diag(evals ** k)
    return (P @ Dk @ P_inv).real.round(6)

# Verify with numpy's built-in matrix power
k = 5
A_power_diag = matrix_power_diag(A, P, evals, P_inv, k)
A_power_numpy = np.linalg.matrix_power(A, k).astype(float)

print(f"A^{k} via diagonalization:")
print(A_power_diag)
print()
print(f"A^{k} via numpy:")
print(A_power_numpy)
print()
print("Match:", np.allclose(A_power_diag, A_power_numpy))`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Diagonalize and compute A^10',
              difficulty: 'hard',
              prompt: 'Diagonalize A = [[2, 1],[1, 2]]. Then compute A^10 using P D^10 P⁻¹. Verify against np.linalg.matrix_power(A, 10). Finally, print the eigenvalues — what symmetry do you notice about a symmetric matrix\'s eigenvalues?',
              code: `import numpy as np

A = np.array([[2., 1.],
              [1., 2.]])

# 1. compute evals and P via np.linalg.eig(A)
# 2. compute A^10 using P @ diag(evals**10) @ P_inv
# 3. verify against np.linalg.matrix_power(A, 10)
# 4. comment on the eigenvalues (are they real? symmetric?)
`,
              hint: 'evals, P = np.linalg.eig(A). Dk = np.diag(evals**10). A10 = (P @ Dk @ np.linalg.inv(P)).real. Symmetric matrices always have real eigenvalues.',
            },
          ]
        }
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      '**Proof of $A = PDP^{-1}$:** Let $\\mathbf{v}_1, \\ldots, \\mathbf{v}_n$ be linearly independent eigenvectors with eigenvalues $\\lambda_1, \\ldots, \\lambda_n$. Then:\n\n$$AP = A[\\mathbf{v}_1 \\cdots \\mathbf{v}_n] = [A\\mathbf{v}_1 \\cdots A\\mathbf{v}_n] = [\\lambda_1\\mathbf{v}_1 \\cdots \\lambda_n\\mathbf{v}_n] = [\\mathbf{v}_1 \\cdots \\mathbf{v}_n]D = PD$$\n\nSince the columns of $P$ are linearly independent, $P$ is invertible. Multiplying on the right by $P^{-1}$: $A = PDP^{-1}$.',
      '**Similar matrices.** Two matrices $A$ and $B$ are called **similar** if there exists an invertible matrix $P$ such that $B = P^{-1}AP$. Diagonalization says: a diagonalizable matrix is similar to a diagonal matrix. Similar matrices represent the same linear transformation in different coordinate bases.',
      '**Similar matrices share:** eigenvalues (same characteristic polynomial), trace, determinant, rank, and nullity. They differ in their specific matrix entries — only the coordinate representation changes.',
      '**The defective (non-diagonalizable) case.** When a matrix cannot be diagonalized, we can still find a "nearly diagonal" form called the **Jordan Normal Form**, which has eigenvalues on the diagonal and possibly 1s on the superdiagonal. Jordan form is the generalization of diagonalization and is the subject of more advanced linear algebra courses.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Similar Matrices',
        body: '$A$ and $B$ are similar if $B = P^{-1}AP$ for some invertible $P$.\n\nSimilar matrices represent the same transformation in different coordinate systems.',
      },
      {
        type: 'insight',
        title: 'Symmetric Matrices Are Always Diagonalizable',
        body: 'The Spectral Theorem guarantees that every real symmetric matrix $A = A^T$ is diagonalizable with real eigenvalues and mutually orthogonal eigenvectors. This makes symmetric matrices especially well-behaved — and they appear constantly in applications (covariance matrices, Laplacians, Hessians).',
      },
    ],
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: 'la3-002-ex1',
      title: 'Constructing P and D, then Verifying A = PDP⁻¹',
      problem: 'Diagonalize $A = \\begin{bmatrix}4 & 2 \\\\ 1 & 3\\end{bmatrix}$ using the eigenvectors from the previous lesson ($\\lambda_1 = 5, \\mathbf{v}_1=[2,1]^T$; $\\lambda_2=2, \\mathbf{v}_2=[1,-1]^T$).',
      steps: [
        {
          expression: 'P = \\begin{bmatrix}2 & 1 \\\\ 1 & -1\\end{bmatrix}, \\quad D = \\begin{bmatrix}5 & 0 \\\\ 0 & 2\\end{bmatrix}',
          annotation: 'Assemble $P$ (eigenvectors as columns) and $D$ (eigenvalues on the diagonal). Column order must match: $\\mathbf{v}_1$ in column 1, so $\\lambda_1$ in position $(1,1)$.',
          strategyTitle: 'Assemble P and D',
          checkpoint: 'Does the order of columns in P matter?',
          hints: ['Yes — column $i$ of $P$ must match entry $(i,i)$ of $D$. Otherwise $AP \\neq PD$.'],
        },
        {
          expression: 'P^{-1} = \\frac{1}{\\det(P)}\\begin{bmatrix}-1&-1\\\\-1&2\\end{bmatrix} = \\frac{1}{-3}\\begin{bmatrix}-1&-1\\\\-1&2\\end{bmatrix} = \\begin{bmatrix}1/3&1/3\\\\1/3&-2/3\\end{bmatrix}',
          annotation: '$\\det(P) = (2)(-1)-(1)(1) = -3$. Use the 2×2 inverse formula.',
          strategyTitle: 'Compute P⁻¹',
          checkpoint: 'Verify: $PP^{-1} = I$.',
          hints: ['Check: $\\begin{bmatrix}2&1\\\\1&-1\\end{bmatrix}\\begin{bmatrix}1/3&1/3\\\\1/3&-2/3\\end{bmatrix} = \\begin{bmatrix}1&0\\\\0&1\\end{bmatrix}$ ✓'],
        },
        {
          expression: 'PDP^{-1} = \\begin{bmatrix}2&1\\\\1&-1\\end{bmatrix}\\begin{bmatrix}5&0\\\\0&2\\end{bmatrix}\\begin{bmatrix}1/3&1/3\\\\1/3&-2/3\\end{bmatrix}',
          annotation: 'Compute $PD$ first (multiply $P$ by $D$), then multiply by $P^{-1}$.',
          strategyTitle: 'Compute PDP⁻¹',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'PD = \\begin{bmatrix}10&2\\\\5&-2\\end{bmatrix} \\qquad (PD)P^{-1} = \\begin{bmatrix}10&2\\\\5&-2\\end{bmatrix}\\begin{bmatrix}1/3&1/3\\\\1/3&-2/3\\end{bmatrix} = \\begin{bmatrix}4&2\\\\1&3\\end{bmatrix} = A \\; ✓',
          annotation: '$PDP^{-1} = A$. The decomposition is verified.',
          strategyTitle: 'Verify equality',
          checkpoint: '',
          hints: [],
        },
      ],
      conclusion: 'The diagonalization $A = PDP^{-1}$ is verified. The matrix $A$ in eigenvector coordinates is just the diagonal scaling $D = \\text{diag}(5, 2)$.',
    },
    {
      id: 'la3-002-ex2',
      title: 'Computing A³ using Diagonalization',
      problem: 'Using the diagonalization from Example 1, compute $A^3$ efficiently.',
      steps: [
        {
          expression: 'A^3 = PD^3P^{-1}',
          annotation: 'Apply the matrix powers formula. Only $D$ changes — it becomes $D^3$.',
          strategyTitle: 'Apply powers formula',
          checkpoint: 'How many matrix multiplications is this vs. computing $A \\cdot A \\cdot A$ directly?',
          hints: ['Direct: 2 full 2×2 multiplications. Via diagonalization: also 2 multiplications — but $D^3$ is trivial (just raise diagonal entries to the 3rd power).'],
        },
        {
          expression: 'D^3 = \\begin{bmatrix}5^3 & 0 \\\\ 0 & 2^3\\end{bmatrix} = \\begin{bmatrix}125 & 0 \\\\ 0 & 8\\end{bmatrix}',
          annotation: 'For diagonal matrices, just raise each entry to the power. Instant.',
          strategyTitle: 'Compute D³',
          checkpoint: 'What would D¹⁰⁰ be?',
          hints: ['$D^{100} = \\text{diag}(5^{100}, 2^{100})$. One lookup per eigenvalue.'],
        },
        {
          expression: 'A^3 = \\begin{bmatrix}2&1\\\\1&-1\\end{bmatrix}\\begin{bmatrix}125&0\\\\0&8\\end{bmatrix}\\begin{bmatrix}1/3&1/3\\\\1/3&-2/3\\end{bmatrix}',
          annotation: 'Substitute back.',
          strategyTitle: 'Assemble A³',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'PD^3 = \\begin{bmatrix}250&8\\\\125&-8\\end{bmatrix} \\qquad A^3 = \\begin{bmatrix}250&8\\\\125&-8\\end{bmatrix}\\begin{bmatrix}1/3&1/3\\\\1/3&-2/3\\end{bmatrix} = \\begin{bmatrix}86&78\\\\39&47\\end{bmatrix}',
          annotation: 'Final answer. You can verify by computing $A \\cdot A \\cdot A$ directly.',
          strategyTitle: 'Final result',
          checkpoint: '',
          hints: [],
        },
      ],
      conclusion: '$A^3 = \\begin{bmatrix}86&78\\\\39&47\\end{bmatrix}$. For $A^{100}$, the approach is identical — only the diagonal entries $5^{100}$ and $2^{100}$ change. Diagonalization makes arbitrary powers trivial.',
    },
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: 'la3-002-ch1',
      difficulty: 'easy',
      problem: 'If $D = \\begin{bmatrix}3 & 0 \\\\ 0 & -2\\end{bmatrix}$, what is $D^4$?',
      hint: 'Raise each diagonal entry to the 4th power independently.',
      walkthrough: [
        {
          expression: 'D^4 = \\begin{bmatrix}3^4 & 0 \\\\ 0 & (-2)^4\\end{bmatrix} = \\begin{bmatrix}81 & 0 \\\\ 0 & 16\\end{bmatrix}',
          annotation: '$3^4 = 81$, $(-2)^4 = 16$. Note: even power of a negative is positive.',
        },
      ],
      answer: '[[81, 0], [0, 16]]',
    },
    {
      id: 'la3-002-ch2',
      difficulty: 'medium',
      problem: 'The matrix $A = \\begin{bmatrix}2 & 1 \\\\ 1 & 2\\end{bmatrix}$ has eigenvalues $\\lambda_1=3$ (eigenvector $[1,1]^T$) and $\\lambda_2=1$ (eigenvector $[1,-1]^T$). Write the diagonalization $A = PDP^{-1}$ explicitly.',
      hint: 'Put the eigenvectors as columns of $P$. The inverse of a 2×2 is $\\frac{1}{ad-bc}\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$.',
      walkthrough: [
        {
          expression: 'P = \\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix}, \\quad D = \\begin{bmatrix}3&0\\\\0&1\\end{bmatrix}',
          annotation: 'Eigenvectors as columns, eigenvalues on diagonal (matching order).',
        },
        {
          expression: '\\det(P) = (1)(-1)-(1)(1) = -2 \\qquad P^{-1} = \\frac{1}{-2}\\begin{bmatrix}-1&-1\\\\-1&1\\end{bmatrix} = \\begin{bmatrix}1/2&1/2\\\\1/2&-1/2\\end{bmatrix}',
          annotation: 'Invert $P$.',
        },
        {
          expression: 'A = \\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix}\\begin{bmatrix}3&0\\\\0&1\\end{bmatrix}\\begin{bmatrix}1/2&1/2\\\\1/2&-1/2\\end{bmatrix}',
          annotation: 'The complete factorization.',
        },
      ],
      answer: 'P = [[1,1],[1,-1]], D = [[3,0],[0,1]], P⁻¹ = [[1/2,1/2],[1/2,-1/2]]',
    },
    {
      id: 'la3-002-ch3',
      difficulty: 'hard',
      problem: 'Using the diagonalization from Challenge 2 ($A = \\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}$, $\\lambda_1=3$, $\\lambda_2=1$), find $A^n$ as a general formula in terms of $n$. What happens to $A^n$ as $n \\to \\infty$ when we consider the normalized version?',
      hint: '$A^n = PD^nP^{-1}$. Compute and simplify. Think about which eigenvalue dominates as $n$ grows.',
      walkthrough: [
        {
          expression: 'A^n = PD^nP^{-1} = \\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix}\\begin{bmatrix}3^n&0\\\\0&1\\end{bmatrix}\\begin{bmatrix}1/2&1/2\\\\1/2&-1/2\\end{bmatrix}',
          annotation: 'Apply the formula.',
        },
        {
          expression: 'A^n = \\frac{1}{2}\\begin{bmatrix}3^n+1 & 3^n-1 \\\\ 3^n-1 & 3^n+1\\end{bmatrix}',
          annotation: 'Multiply through and simplify.',
        },
        {
          expression: '\\text{As } n \\to \\infty: A^n \\approx \\frac{3^n}{2}\\begin{bmatrix}1&1\\\\1&1\\end{bmatrix}',
          annotation: 'The $1^n = 1$ terms become negligible. The dominant eigenvector $[1,1]^T$ captures the long-run behavior.',
        },
      ],
      answer: 'A^n = (1/2)[[3^n+1, 3^n-1],[3^n-1, 3^n+1]]. Long-run: dominated by the largest eigenvalue (3).',
    },
  ],

  // ── Semantics ────────────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: 'A = PDP^{-1}', meaning: 'Diagonalization: P has eigenvectors as columns, D has eigenvalues on diagonal' },
      { symbol: 'A^k = PD^kP^{-1}', meaning: 'Matrix powers via diagonalization — D^k just raises each diagonal entry to the k-th power' },
      { symbol: 'D', meaning: 'Diagonal matrix — only diagonal entries non-zero; scales each axis independently' },
      { symbol: 'B = P^{-1}AP', meaning: 'Similar matrix — same transformation, different coordinate system' },
    ],
    rulesOfThumb: [
      'n distinct eigenvalues → always diagonalizable (guaranteed).',
      'Column order in P must match eigenvalue order in D.',
      'Matrix powers: A^k = PD^kP^{-1}, with D^k trivial.',
      'Symmetric matrices are always diagonalizable with orthogonal eigenvectors.',
    ],
  },

  // ── Spiral ────────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la3-001',
        label: 'Eigenvectors and Eigenvalues',
        note: 'You need eigenvectors and eigenvalues already computed before diagonalizing. If you are not sure how to find them, that lesson walks through the full algorithm.',
      },
      {
        lessonId: 'la2-001',
        label: 'Matrices as Linear Transformations',
        note: 'Diagonalization is about choosing a coordinate system where the transformation looks its simplest. This is the same idea as change-of-basis from Phase 2.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'la3-003',
        label: 'Complex Eigenvalues',
        note: 'When the characteristic polynomial has no real roots, diagonalization over the reals fails. Instead, we get complex eigenvalues that encode rotation — which the next lesson addresses.',
      },
      {
        lessonId: 'la4-004',
        label: 'Singular Value Decomposition',
        note: 'SVD generalizes diagonalization to non-square matrices: $A = U\\Sigma V^T$, where $U$ and $V$ are orthogonal and $\\Sigma$ is diagonal. It always works — even when $A$ is not diagonalizable.',
      },
    ],
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    'Diagonalization = finding the coordinates where A does nothing but scale.',
    'A = PDP⁻¹: change coords (P⁻¹), scale (D), change back (P).',
    'A^k = PD^kP⁻¹ — powers become trivial.',
    'Diagonal matrix: eigenvalues on diagonal, zeros everywhere else.',
    'Fails when there are not enough independent eigenvectors (defective matrix).',
  ],

  // ── Checkpoints ──────────────────────────────────────────────────
  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'la3-002-assess-1',
        type: 'input',
        text: 'If the diagonal matrix $D = \\text{diag}(2, 5)$, what is the $(2,2)$ entry of $D^{10}$?',
        answer: '9765625',
        hint: '$5^{10} = 9{,}765{,}625$.',
      },
    ],
  },

  // ── Quiz ─────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'diagonalization-q1',
      type: 'choice',
      text: 'What goes in the columns of $P$ in the decomposition $A = PDP^{-1}$?',
      options: [
        'The eigenvalues of $A$',
        'The eigenvectors of $A$',
        'The rows of $A$',
        'The diagonal entries of $A$',
      ],
      answer: 'The eigenvectors of $A$',
      hints: ['$P$ is the change-of-basis matrix to the eigenvector coordinate system. Its columns are the basis vectors — the eigenvectors.'],
      reviewSection: 'Math tab — Building P and D',
    },
    {
      id: 'diagonalization-q2',
      type: 'choice',
      text: 'Why does $A^k = PD^kP^{-1}$ simplify computation?',
      options: [
        'Because $P^k = P$ for any power $k$',
        'Because $D$ is diagonal, so $D^k$ just raises each diagonal entry to the $k$th power',
        'Because matrix multiplication is commutative',
        'Because $P^{-1} = P$ for eigenvector matrices',
      ],
      answer: 'Because $D$ is diagonal, so $D^k$ just raises each diagonal entry to the $k$th power',
      hints: ['A diagonal matrix is trivial to raise to a power — no matrix multiplications needed, just scalar exponentiation.'],
      reviewSection: 'Math tab — Matrix Powers',
    },
    {
      id: 'diagonalization-q3',
      type: 'choice',
      text: 'A $3 \\times 3$ matrix has eigenvalues $\\lambda = 2$ (with algebraic multiplicity 2 but geometric multiplicity 1) and $\\lambda = 5$ (with multiplicity 1). Is it diagonalizable?',
      options: [
        'Yes — it has three eigenvalues (counting multiplicity)',
        'No — it only has 2 linearly independent eigenvectors, not 3',
        'Yes — any matrix with distinct eigenvalues is diagonalizable',
        'Cannot be determined without the matrix',
      ],
      answer: 'No — it only has 2 linearly independent eigenvectors, not 3',
      hints: ['Diagonalization requires 3 independent eigenvectors for a 3×3 matrix. Geometric multiplicity 1 for the repeated eigenvalue means only 1 eigenvector there — total: 2, not 3.'],
      reviewSection: 'Intuition tab — Not Every Matrix is Diagonalizable',
    },
    {
      id: 'diagonalization-q4',
      type: 'input',
      text: 'A matrix $A$ has eigenvalues 3 and 7. What is the $(1,1)$ entry of $D^2$ if $3$ is the first diagonal entry?',
      answer: '9',
      hints: ['$D^2$ raises each diagonal entry to the 2nd power: $3^2 = 9$.'],
      reviewSection: 'Math tab — Matrix Powers',
    },
  ],
};
