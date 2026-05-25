export default {
  id: 'la7-001',
  slug: 'qr-decomposition',
  chapter: 'la7',
  order: 1,
  title: 'QR Decomposition',
  subtitle: 'Any matrix $A$ factors as $A = QR$ where $Q$ has orthonormal columns and $R$ is upper triangular. This is the workhorse algorithm for least squares, eigenvalue problems, and numerical stability.',
  tags: ['QR decomposition', 'Gram-Schmidt', 'orthonormal', 'upper triangular', 'least squares', 'Householder', 'numerical methods', 'thin QR'],
  aliases: 'QR decomposition Gram-Schmidt orthonormal upper triangular least squares Householder thin full numerical methods',

  hook: {
    question: "You have a matrix $A$ and need to solve the least-squares problem $\\min_\\mathbf{x} \\|A\\mathbf{x} - \\mathbf{b}\\|$. The normal equations $A^\\top A \\mathbf{x} = A^\\top \\mathbf{b}$ work, but squaring the matrix squares the condition number. Is there a better way?",
    realWorldContext: "QR decomposition is used in virtually every numerical linear algebra computation. MATLAB's backslash operator solves least squares via QR. The QR algorithm (repeatedly applying QR decomposition) is the standard method for computing all eigenvalues of a matrix. In statistics, the QR decomposition of the design matrix is the numerically stable way to fit regression models. In GPS and phone positioning, QR is used to solve overdetermined systems from multiple satellite signals. SVD (QR is an ingredient), eigenvalue solvers (QR iteration), and least squares all depend on it.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      `**Let's compute it first.** Take $A = \\begin{bmatrix}1&1\\\\1&0\\\\0&1\\end{bmatrix}$. Column $\\mathbf{a}_1 = (1,1,0)^\\top$ has norm $\\sqrt{2}$, so $\\mathbf{q}_1 = \\frac{1}{\\sqrt{2}}(1,1,0)^\\top$ and $r_{11} = \\sqrt{2}$. Project $\\mathbf{a}_2 = (1,0,1)^\\top$ onto $\\mathbf{q}_1$: $r_{12} = \\mathbf{q}_1^\\top \\mathbf{a}_2 = \\frac{1}{\\sqrt{2}}$. Subtract: $\\tilde{\\mathbf{q}}_2 = (1,0,1)^\\top - \\frac{1}{\\sqrt{2}} \\cdot \\frac{1}{\\sqrt{2}}(1,1,0)^\\top = (\\frac{1}{2}, -\\frac{1}{2}, 1)^\\top$. Norm: $r_{22} = \\sqrt{\\frac{3}{2}}$. Result: $Q = \\begin{bmatrix}\\frac{1}{\\sqrt{2}}&\\frac{1}{\\sqrt{6}}\\\\\\frac{1}{\\sqrt{2}}&-\\frac{1}{\\sqrt{6}}\\\\0&\\frac{2}{\\sqrt{6}}\\end{bmatrix}$, $R = \\begin{bmatrix}\\sqrt{2}&\\frac{1}{\\sqrt{2}}\\\\0&\\sqrt{\\frac{3}{2}}\\end{bmatrix}$. Check: $Q^\\top Q = I_2$ and $QR = A$. That's it — QR in action before the definition.`,
      '**Gram-Schmidt builds QR.** Apply Gram-Schmidt orthogonalization to the columns of $A$ to get the columns of $Q$. The numbers you compute along the way — norms and inner products — fill in $R$. Specifically, $r_{jj} = \\|\\tilde{\\mathbf{q}}_j\\|$ (norm of the $j$-th Gram-Schmidt vector before normalizing) and $r_{ij} = \\mathbf{q}_i^\\top \\mathbf{a}_j$ (projections onto earlier $\\mathbf{q}_i$).',
      '**Least squares via QR.** The normal equations $A^\\top A \\mathbf{x} = A^\\top \\mathbf{b}$ are equivalent to $R\\mathbf{x} = Q^\\top \\mathbf{b}$ (a triangular system — easy to solve by back substitution). This avoids squaring the condition number. QR-based least squares is about twice as expensive as normal equations but far more numerically stable.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'QR via Gram-Schmidt: The Recipe',
        body: 'Given columns $\\mathbf{a}_1, \\ldots, \\mathbf{a}_n$ of $A$:\n1. $\\tilde{\\mathbf{q}}_1 = \\mathbf{a}_1$, $\\mathbf{q}_1 = \\tilde{\\mathbf{q}}_1 / \\|\\tilde{\\mathbf{q}}_1\\|$\n2. For $j = 2, \\ldots, n$: subtract projections onto $\\mathbf{q}_1, \\ldots, \\mathbf{q}_{j-1}$:\n   $\\tilde{\\mathbf{q}}_j = \\mathbf{a}_j - (\\mathbf{q}_1^\\top \\mathbf{a}_j)\\mathbf{q}_1 - \\cdots - (\\mathbf{q}_{j-1}^\\top \\mathbf{a}_j)\\mathbf{q}_{j-1}$\n   $\\mathbf{q}_j = \\tilde{\\mathbf{q}}_j / \\|\\tilde{\\mathbf{q}}_j\\|$\n\nThe $R$ matrix: $r_{ij} = \\mathbf{q}_i^\\top \\mathbf{a}_j$ for $i < j$, $r_{jj} = \\|\\tilde{\\mathbf{q}}_j\\|$, $r_{ij} = 0$ for $i > j$.',
      },
      {
        type: 'insight',
        title: 'Least Squares via QR',
        body: 'To solve $\\min \\|A\\mathbf{x}-\\mathbf{b}\\|$ with $A = QR$:\n1. Compute $Q^\\top \\mathbf{b}$ ($m$ inner products)\n2. Solve $R\\mathbf{x} = Q^\\top \\mathbf{b}$ by back substitution\n\nCondition number: $\\kappa(R) = \\kappa(A)$ instead of $\\kappa(A)^2$ from normal equations.',
      },
      {
        type: 'insight',
        title: 'Householder QR vs Gram-Schmidt',
        body: 'Classical Gram-Schmidt is unstable: small errors compound as you subtract projections. Modified Gram-Schmidt is better but still not optimal. **Householder reflections** are the numerically stable way to compute QR in practice — they use orthogonal reflections $H = I - 2\\mathbf{u}\\mathbf{u}^\\top$ to zero out subdiagonal entries column by column. LAPACK and MATLAB use Householder QR.',
      },
      {
        type: 'sequencing',
        title: 'Prediction',
        body: 'Before working Example 2: for $A = \\begin{bmatrix}3&1\\\\4&0\\end{bmatrix}$, predict $r_{11}$ (the first diagonal of $R$). Remember $r_{11} = \\|\\mathbf{a}_1\\|$. Write down your number, then check it in the example.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'QR Decomposition',
        mathBridge: 'Compute QR, verify orthogonality, and solve least squares.',
        caption: 'Q has orthonormal columns; R is upper triangular; Q^T Q = I.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Compute QR and verify',
              prose: ['Factor A = QR, verify Q has orthonormal columns, reconstruct A.'],
              code: `A = [1  2  3;
     4  5  6;
     7  8 10;
     1  0  1]

[Q, R] = qr(A, 0)  % thin QR
disp('Q (orthonormal columns):')
Q
disp('R (upper triangular):')
R
disp('Q^T Q should be identity:')
round(Q' * Q, 10)
disp('Reconstruction Q*R should equal A:')
norm(A - Q*R)
`,
            },
            {
              id: 2,
              cellTitle: 'Least squares via QR',
              prose: ['Solve least-squares problem min||Ax-b|| using QR decomposition.'],
              code: `A = [1 1; 1 2; 1 3; 1 4]  % design matrix for linear fit
b = [1; 2; 2; 4]            % data

% QR approach
[Q, R] = qr(A, 0)
x_qr = R \\ (Q' * b)
disp('Least squares solution via QR:')
x_qr

% Compare with normal equations
x_normal = (A' * A) \\ (A' * b)
disp('Via normal equations:')
x_normal
disp('Difference (should be tiny):')
norm(x_qr - x_normal)
disp('Fitted line: y = a + b*x where:')
disp(['a = ', num2str(x_qr(1)), ', b = ', num2str(x_qr(2))])
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Existence and uniqueness.** QR factorization exists for any matrix $A$. If $A$ has full column rank, the thin QR with positive diagonal of $R$ is unique. If $A$ is square and invertible, the full QR is unique (under the convention that diagonal entries of $R$ are positive).',
      '**QR algorithm for eigenvalues.** The QR algorithm iterates: starting with $A_0 = A$, decompose $A_k = Q_k R_k$, then set $A_{k+1} = R_k Q_k = Q_k^{-1} A_k Q_k$ (a similarity transformation!). Under mild conditions, $A_k$ converges to the Schur form (upper triangular with eigenvalues on the diagonal). The practical version adds shifts for faster convergence and is the standard eigensolver for dense matrices.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Existence of QR',
        body: 'Every $m \\times n$ matrix $A$ ($m \\geq n$) has a factorization $A = QR$ where:\n• $Q$ is $m \\times m$ orthogonal (full QR)\n• $R$ is $m \\times n$ upper triangular\n\nEquivalently (thin QR for full column rank $A$):\n• $Q$ is $m \\times n$ with orthonormal columns\n• $R$ is $n \\times n$ upper triangular with positive diagonal',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Connection to Cholesky.** If $A$ has full column rank, $A^\\top A = (QR)^\\top(QR) = R^\\top Q^\\top Q R = R^\\top R$. So the Cholesky factorization of $A^\\top A$ is $R^\\top R$. This connects QR to the Cholesky factorization of the Gram matrix — and explains why the QR approach to least squares is equivalent to Cholesky on the normal equations, but without forming $A^\\top A$ explicitly.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Why QR is More Stable than Normal Equations',
        body: 'Condition number of $A^\\top A$ = $\\kappa(A)^2$.\nCondition number of $R$ = $\\kappa(A)$.\n\nFor ill-conditioned $A$ (e.g., $\\kappa(A) = 10^8$), normal equations have $\\kappa = 10^{16}$ (near machine precision limit), while QR has $\\kappa = 10^8$ (still manageable).',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la7-001-1',
      title: 'Manual QR via Gram-Schmidt',
      problem: 'Find the QR decomposition of $A = \\begin{bmatrix}1&1\\\\1&0\\\\0&1\\end{bmatrix}$ by hand.',
      steps: [
        {
          expression: '\\mathbf{a}_1 = (1,1,0)^\\top, \\quad r_{11} = \\|\\mathbf{a}_1\\| = \\sqrt{2}, \\quad \\mathbf{q}_1 = \\frac{1}{\\sqrt{2}}(1,1,0)^\\top',
          annotation: 'First column: normalize $\\mathbf{a}_1$. The norm becomes $r_{11}$.',
          strategyTitle: 'Step 1: First column of $Q$',
        },
        {
          expression: 'r_{12} = \\mathbf{q}_1^\\top \\mathbf{a}_2 = \\frac{1}{\\sqrt{2}}(1)(1) + \\frac{1}{\\sqrt{2}}(1)(0) + 0 = \\frac{1}{\\sqrt{2}}',
          annotation: 'Project $\\mathbf{a}_2$ onto $\\mathbf{q}_1$ to get the off-diagonal entry $r_{12}$.',
          strategyTitle: 'Step 2: $r_{12}$ (off-diagonal of $R$)',
        },
        {
          expression: '\\tilde{\\mathbf{q}}_2 = \\mathbf{a}_2 - r_{12}\\mathbf{q}_1 = \\begin{bmatrix}1\\\\0\\\\1\\end{bmatrix} - \\frac{1}{\\sqrt{2}} \\cdot \\frac{1}{\\sqrt{2}}\\begin{bmatrix}1\\\\1\\\\0\\end{bmatrix} = \\begin{bmatrix}1/2\\\\-1/2\\\\1\\end{bmatrix}',
          annotation: 'Remove the $\\mathbf{q}_1$ component from $\\mathbf{a}_2$.',
          strategyTitle: 'Step 3: Orthogonalize',
        },
        {
          expression: 'r_{22} = \\|\\tilde{\\mathbf{q}}_2\\| = \\sqrt{1/4+1/4+1} = \\sqrt{3/2}, \\quad \\mathbf{q}_2 = \\frac{\\tilde{\\mathbf{q}}_2}{r_{22}} = \\sqrt{\\frac{2}{3}}\\begin{bmatrix}1/2\\\\-1/2\\\\1\\end{bmatrix}',
          annotation: 'Normalize to get the second column of $Q$.',
          strategyTitle: 'Step 4: Normalize',
        },
        {
          expression: 'Q = \\begin{bmatrix}1/\\sqrt{2}&\\sqrt{2/3}/2\\\\1/\\sqrt{2}&-\\sqrt{2/3}/2\\\\0&\\sqrt{2/3}\\end{bmatrix}, \\quad R = \\begin{bmatrix}\\sqrt{2}&1/\\sqrt{2}\\\\0&\\sqrt{3/2}\\end{bmatrix}',
          annotation: 'Verify: $Q^\\top Q = I_2$ and $QR = A$.',
          strategyTitle: 'Assemble $Q$ and $R$',
          hints: ['Check $\\mathbf{q}_1^\\top\\mathbf{q}_2 = \\frac{1}{\\sqrt{2}}\\frac{1}{\\sqrt{6}} + \\frac{1}{\\sqrt{2}}(-\\frac{1}{\\sqrt{6}}) + 0 = 0$ ✓'],
        },
      ],
    },
    {
      id: 'ex-la7-001-2',
      title: 'QR of a 2×2 matrix — full step-by-step',
      problem: 'Find the QR decomposition of $A = \\begin{bmatrix}3&1\\\\4&0\\end{bmatrix}$ by Gram-Schmidt.',
      steps: [
        {
          expression: '\\mathbf{a}_1 = (3,4)^\\top, \\quad r_{11} = \\|\\mathbf{a}_1\\| = \\sqrt{9+16} = 5, \\quad \\mathbf{q}_1 = \\frac{1}{5}(3,4)^\\top',
          annotation: 'Normalize the first column. The 3-4-5 right triangle gives a clean answer.',
          strategyTitle: 'Step 1: First column of $Q$',
        },
        {
          expression: 'r_{12} = \\mathbf{q}_1^\\top \\mathbf{a}_2 = \\frac{3}{5}(1) + \\frac{4}{5}(0) = \\frac{3}{5}',
          annotation: 'Project $\\mathbf{a}_2 = (1,0)^\\top$ onto $\\mathbf{q}_1$.',
          strategyTitle: 'Step 2: Off-diagonal $r_{12}$',
        },
        {
          expression: '\\tilde{\\mathbf{q}}_2 = \\mathbf{a}_2 - r_{12}\\mathbf{q}_1 = \\begin{bmatrix}1\\\\0\\end{bmatrix} - \\frac{3}{5} \\cdot \\frac{1}{5}\\begin{bmatrix}3\\\\4\\end{bmatrix} = \\begin{bmatrix}1 - 9/25\\\\-12/25\\end{bmatrix} = \\begin{bmatrix}16/25\\\\-12/25\\end{bmatrix}',
          annotation: 'Subtract the projection to get the orthogonal remainder.',
          strategyTitle: 'Step 3: Orthogonalize',
        },
        {
          expression: 'r_{22} = \\|\\tilde{\\mathbf{q}}_2\\| = \\sqrt{(16/25)^2+(12/25)^2} = \\frac{1}{25}\\sqrt{256+144} = \\frac{20}{25} = \\frac{4}{5}',
          annotation: 'Norm of the orthogonalized vector — this is the second diagonal of $R$.',
          strategyTitle: 'Step 4: $r_{22}$',
        },
        {
          expression: '\\mathbf{q}_2 = \\frac{\\tilde{\\mathbf{q}}_2}{r_{22}} = \\frac{25}{20}\\begin{bmatrix}16/25\\\\-12/25\\end{bmatrix} = \\begin{bmatrix}4/5\\\\-3/5\\end{bmatrix}',
          annotation: 'Normalize. Check: $\\mathbf{q}_1^\\top\\mathbf{q}_2 = \\frac{3}{5}\\cdot\\frac{4}{5}+\\frac{4}{5}\\cdot(-\\frac{3}{5}) = 0$ ✓',
          strategyTitle: 'Step 5: Second column of $Q$',
        },
        {
          expression: 'Q = \\begin{bmatrix}3/5&4/5\\\\4/5&-3/5\\end{bmatrix}, \\quad R = \\begin{bmatrix}5&3/5\\\\0&4/5\\end{bmatrix}',
          annotation: 'Verify $QR = A$: row 1 of $Q$ times columns of $R$: $(3/5)(5)+(4/5)(0)=3$ ✓, $(3/5)(3/5)+(4/5)(4/5)=9/25+16/25=1$ ✓.',
          strategyTitle: 'Final answer',
        },
      ],
    },
    {
      id: 'ex-la7-001-3',
      title: 'Solving least squares Ax = b via QR',
      problem: 'Fit a line $y = c_0 + c_1 t$ to the data $(t,y) = (0,1),(1,2),(2,2),(3,4)$ using QR. The design matrix is $A = \\begin{bmatrix}1&0\\\\1&1\\\\1&2\\\\1&3\\end{bmatrix}$, $\\mathbf{b} = (1,2,2,4)^\\top$.',
      steps: [
        {
          expression: 'A = \\begin{bmatrix}1&0\\\\1&1\\\\1&2\\\\1&3\\end{bmatrix} \\xrightarrow{\\text{Gram-Schmidt}} \\mathbf{q}_1 = \\frac{1}{2}(1,1,1,1)^\\top, \\quad r_{11} = 2',
          annotation: 'The first column is $(1,1,1,1)^\\top$, norm $= 2$.',
          strategyTitle: 'Step 1: First column of $Q$',
        },
        {
          expression: 'r_{12} = \\mathbf{q}_1^\\top\\mathbf{a}_2 = \\frac{1}{2}(0+1+2+3) = 3, \\quad \\tilde{\\mathbf{q}}_2 = (0,1,2,3)^\\top - 3 \\cdot \\frac{1}{2}(1,1,1,1)^\\top = (-3/2,-1/2,1/2,3/2)^\\top',
          annotation: 'Subtract the projection of $\\mathbf{a}_2 = (0,1,2,3)^\\top$ onto $\\mathbf{q}_1$.',
          strategyTitle: 'Step 2: Orthogonalize second column',
        },
        {
          expression: 'r_{22} = \\|(-3/2,-1/2,1/2,3/2)^\\top\\| = \\sqrt{9/4+1/4+1/4+9/4} = \\sqrt{5}, \\quad \\mathbf{q}_2 = \\frac{1}{\\sqrt{5}}(-3/2,-1/2,1/2,3/2)^\\top',
          annotation: 'Normalize the second Gram-Schmidt vector.',
          strategyTitle: 'Step 3: Second column of $Q$',
        },
        {
          expression: 'Q^\\top\\mathbf{b} = \\begin{bmatrix}\\mathbf{q}_1^\\top\\mathbf{b}\\\\\\mathbf{q}_2^\\top\\mathbf{b}\\end{bmatrix} = \\begin{bmatrix}\\frac{1}{2}(1+2+2+4)\\\\\\frac{1}{\\sqrt{5}}(-3/2+(-1/2)(2)+(1/2)(2)+(3/2)(4))\\end{bmatrix} = \\begin{bmatrix}9/2\\\\5/\\sqrt{5}\\end{bmatrix} = \\begin{bmatrix}4.5\\\\\\sqrt{5}\\end{bmatrix}',
          annotation: 'Compute $Q^\\top\\mathbf{b}$. This is the right-hand side of the triangular system.',
          strategyTitle: 'Step 4: Compute $Q^\\top\\mathbf{b}$',
        },
        {
          expression: 'R\\mathbf{x} = Q^\\top\\mathbf{b}: \\quad \\begin{bmatrix}2&3\\\\0&\\sqrt{5}\\end{bmatrix}\\begin{bmatrix}c_0\\\\c_1\\end{bmatrix} = \\begin{bmatrix}4.5\\\\\\sqrt{5}\\end{bmatrix}',
          annotation: 'Set up the upper triangular system. Back-solve: $c_1 = \\sqrt{5}/\\sqrt{5} = 1$, then $2c_0 = 4.5 - 3(1) = 1.5$, so $c_0 = 0.75$.',
          strategyTitle: 'Step 5: Back-solve',
        },
        {
          expression: 'c_0 = 0.75, \\quad c_1 = 1 \\quad \\Rightarrow \\quad \\hat{y} = 0.75 + t',
          annotation: 'Best-fit line. Verify: residual $\\|A\\mathbf{x}-\\mathbf{b}\\|^2 = (0.75-1)^2+(1.75-2)^2+(2.75-2)^2+(3.75-4)^2 = 0.25$ (the minimum).',
          strategyTitle: 'Best-fit line',
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la7-001-1',
      title: 'Why QR beats normal equations for stability',
      difficulty: 'medium',
      problem: 'Explain why solving least squares via QR ($R\\mathbf{x} = Q^\\top \\mathbf{b}$) is more stable than the normal equations $A^\\top A\\mathbf{x} = A^\\top\\mathbf{b}$. Give a concrete ill-conditioned example.',
      hint: 'Consider $A = \\begin{bmatrix}1&1\\\\\\varepsilon&0\\\\0&\\varepsilon\\end{bmatrix}$ for very small $\\varepsilon$ and compute the condition number of $A^\\top A$ vs $R$.',
      walkthrough: [
        '**The key issue:** $\\kappa(A^\\top A) = \\kappa(A)^2$. Squaring the condition number is catastrophic for near-rank-deficient matrices.',
        '**Concrete example:** $A = \\begin{bmatrix}1&1\\\\\\varepsilon&0\\\\0&\\varepsilon\\end{bmatrix}$, $\\varepsilon = 10^{-8}$. $A^\\top A = \\begin{bmatrix}1+\\varepsilon^2&1\\\\1&1+\\varepsilon^2\\end{bmatrix}$. The two eigenvalues are $2+\\varepsilon^2$ and $\\varepsilon^2$, giving $\\kappa(A^\\top A) \\approx 2/\\varepsilon^2 = 2\\times 10^{16}$ — right at machine precision!',
        '**Via QR:** The condition number of $R$ is $\\kappa(A) \\approx \\sqrt{2}/\\varepsilon = \\sqrt{2} \\times 10^8$ — still manageable with 64-bit floats.',
        '**Rule of thumb:** Normal equations need $\\kappa(A)^2 \\ll 10^{16}$, so $\\kappa(A) \\ll 10^8$. QR needs $\\kappa(A) \\ll 10^{16}$. QR tolerates much more ill-conditioning.',
        "**In practice:** MATLAB's `\\` operator uses QR for overdetermined systems precisely for this reason.",
      ],
    },
  ],

  mentalModel: [
    'QR = orthonormal columns × upper triangular. Like Gaussian elimination but preserving orthogonality.',
    'Build QR by Gram-Schmidt: orthogonalize columns, norms and projections fill R.',
    'Least squares via QR: compute $Q^\\top \\mathbf{b}$, back-solve $R\\mathbf{x} = Q^\\top \\mathbf{b}$.',
    'More stable than normal equations: avoids squaring the condition number.',
    'QR algorithm (iterating QR) computes all eigenvalues of a matrix.',
  ],

  checkpoints: [
    { id: 'cp-la7-001-1', label: 'Read intuition section', type: 'read' },
    { id: 'cp-la7-001-2', label: 'Read math section', type: 'read' },
    { id: 'cp-la7-001-3', label: 'Read rigor section', type: 'read' },
    { id: 'cp-la7-001-4', label: 'Run QR compute and verify lab', type: 'lab' },
    { id: 'cp-la7-001-5', label: 'Run least squares via QR lab', type: 'lab' },
    { id: 'cp-la7-001-6', label: 'Work example 1: Gram-Schmidt on 3×2 matrix', type: 'example' },
    { id: 'cp-la7-001-7', label: 'Work example 2: QR of 2×2 matrix', type: 'example' },
    { id: 'cp-la7-001-8', label: 'Solve challenge: QR vs normal equations stability', type: 'challenge' },
  ],

  assessment: {
    questions: [
      {
        id: 'assess-la7-001-1',
        type: 'computation',
        text: 'Compute by hand the QR decomposition of $A = \\begin{bmatrix}3&1\\\\0&2\\\\4&0\\end{bmatrix}$ using Gram-Schmidt. Verify $Q^\\top Q = I_2$ and $QR = A$.',
        answer: '$\\mathbf{a}_1 = (3,0,4)^\\top$: $r_{11} = 5$, $\\mathbf{q}_1 = (3/5, 0, 4/5)^\\top$. $r_{12} = \\mathbf{q}_1^\\top(1,2,0)^\\top = 3/5$. $\\tilde{\\mathbf{q}}_2 = (1,2,0)^\\top - (3/5)(3/5,0,4/5)^\\top = (16/25, 2, -12/25)^\\top$. $r_{22} = \\|\\tilde{\\mathbf{q}}_2\\| = \\sqrt{256/625+4+144/625} = \\sqrt{4+400/625} = \\sqrt{2900/625}$... [verify numerically: $r_{22} = \\sqrt{2.64} \\approx 1.625$]. Check $Q^\\top Q = I_2$ by computing the inner products.',
        hint: 'Start with $\\mathbf{a}_1 = (3,0,4)$: note $\\|(3,0,4)\\| = 5$. After finding $\\mathbf{q}_1$, project $\\mathbf{a}_2 = (1,2,0)$ onto it.',
      },
    ],
  },

  quiz: [
    {
      id: 'q-la7-001-1',
      type: 'choice',
      text: 'In the thin (reduced) QR of an $m \\times n$ matrix ($m > n$), what is the shape of $Q$?',
      options: ['$m \\times m$', '$n \\times n$', '$m \\times n$', '$n \\times m$'],
      answer: '$m \\times n$',
      hints: ['Thin QR: $Q$ has orthonormal columns (not necessarily rows), shape $m \\times n$. Full QR: $Q$ is square $m \\times m$ and fully orthogonal. In MATLAB: `[Q,R] = qr(A,0)` gives thin QR.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-001-2',
      type: 'choice',
      text: 'For least squares $\\min\\|A\\mathbf{x}-\\mathbf{b}\\|$ via QR (with $A = QR$), you solve:',
      options: ['$Q\\mathbf{x} = \\mathbf{b}$', '$R\\mathbf{x} = Q^\\top \\mathbf{b}$', '$A^\\top A \\mathbf{x} = \\mathbf{b}$', '$Q^\\top \\mathbf{x} = R\\mathbf{b}$'],
      answer: '$R\\mathbf{x} = Q^\\top \\mathbf{b}$',
      hints: ['Derivation: the normal equations $A^\\top A\\mathbf{x} = A^\\top\\mathbf{b}$ become $(QR)^\\top(QR)\\mathbf{x} = (QR)^\\top\\mathbf{b}$, i.e., $R^\\top R\\mathbf{x} = R^\\top Q^\\top\\mathbf{b}$. Since $R$ is invertible, divide: $R\\mathbf{x} = Q^\\top\\mathbf{b}$. Solve by back-substitution.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-001-3',
      type: 'choice',
      text: 'The QR iteration algorithm (set $A_{k+1} = R_k Q_k$ where $A_k = Q_k R_k$) converges to:',
      options: ['A symmetric matrix', 'A diagonal matrix (always)', 'An upper triangular matrix with eigenvalues on the diagonal', 'The identity matrix'],
      answer: 'An upper triangular matrix with eigenvalues on the diagonal',
      hints: ['Each step is a similarity transformation: $A_{k+1} = R_k Q_k = Q_k^{-1}(Q_k R_k)Q_k = Q_k^{-1}A_k Q_k$. Eigenvalues are preserved. The iteration converges (under mild conditions) to Schur form — upper triangular with eigenvalues on the diagonal.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la7-001-4',
      type: 'choice',
      text: 'Classical Gram-Schmidt QR is numerically unstable. The practically preferred method is:',
      options: ['Modified Gram-Schmidt', 'Cholesky QR', 'Householder reflections', 'Givens rotations for small matrices'],
      answer: 'Householder reflections',
      hints: ['Householder uses orthogonal reflections $H = I - 2\\mathbf{u}\\mathbf{u}^\\top$ to zero out subdiagonal entries. It is fully backward stable (error $\\propto \\epsilon_{\\text{machine}}\\|A\\|$), unlike Gram-Schmidt which accumulates errors. LAPACK and MATLAB use Householder QR.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-001-5',
      type: 'choice',
      text: 'For a $3 \\times 2$ matrix $A$ with Gram-Schmidt QR, what is $r_{11}$?',
      options: ['The (1,1) entry of $A$', 'The norm of the first column of $A$', 'The dot product of the first two columns', 'Always equal to 1'],
      answer: 'The norm of the first column of $A$',
      hints: ['In Gram-Schmidt, you normalize the first column: $\\mathbf{q}_1 = \\mathbf{a}_1 / \\|\\mathbf{a}_1\\|$. The scalar you divide by is $r_{11} = \\|\\mathbf{a}_1\\|$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-001-6',
      type: 'choice',
      text: 'What condition on $A$ guarantees the thin QR decomposition is unique (with positive diagonal of $R$)?',
      options: ['$A$ is square', '$A$ is symmetric', '$A$ has full column rank', '$A$ is orthogonal'],
      answer: '$A$ has full column rank',
      hints: ['Full column rank means the Gram-Schmidt process never encounters a zero vector — each $r_{jj} > 0$, and requiring positivity pins down the sign of each $\\mathbf{q}_j$ uniquely.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la7-001-7',
      type: 'choice',
      text: 'The Cholesky factorization of $A^\\top A$ (when $A$ has full column rank) gives:',
      options: ['$A^\\top A = QR$', '$A^\\top A = R^\\top R$ where $R$ is the upper triangular factor from QR of $A$', '$A^\\top A = LL^\\top$ where $L$ is unrelated to QR', '$A^\\top A = Q^\\top Q$'],
      answer: '$A^\\top A = R^\\top R$ where $R$ is the upper triangular factor from QR of $A$',
      hints: ['From $A = QR$: $A^\\top A = R^\\top Q^\\top Q R = R^\\top R$. So the Cholesky factor of the Gram matrix $A^\\top A$ is exactly the $R$ from the QR factorization of $A$.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la7-001-8',
      type: 'choice',
      text: 'For an $m \\times n$ overdetermined system ($m > n$), how does the condition number compare between QR-based least squares and the normal equations approach?',
      options: ['They are identical', 'QR has condition $\\kappa(A)$; normal equations have $\\kappa(A)^2$', 'QR has condition $\\kappa(A)^2$; normal equations have $\\kappa(A)$', 'QR has condition $\\sqrt{\\kappa(A)}$; normal equations have $\\kappa(A)$'],
      answer: 'QR has condition $\\kappa(A)$; normal equations have $\\kappa(A)^2$',
      hints: ['$\\kappa(A^\\top A) = \\|A^\\top A\\| \\|{(A^\\top A)}^{-1}\\| = \\sigma_1^2 / \\sigma_n^2 = \\kappa(A)^2$. The QR approach solves $R\\mathbf{x} = Q^\\top\\mathbf{b}$ where $\\kappa(R) = \\kappa(A)$.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la7-001-9',
      type: 'choice',
      text: 'In Gram-Schmidt, what is the geometric meaning of the off-diagonal entry $r_{12} = \\mathbf{q}_1^\\top \\mathbf{a}_2$?',
      options: ['The length of $\\mathbf{a}_2$', 'The length of the component of $\\mathbf{a}_2$ perpendicular to $\\mathbf{q}_1$', 'The scalar projection of $\\mathbf{a}_2$ onto $\\mathbf{q}_1$', 'The angle between $\\mathbf{a}_1$ and $\\mathbf{a}_2$'],
      answer: 'The scalar projection of $\\mathbf{a}_2$ onto $\\mathbf{q}_1$',
      hints: ['The projection of $\\mathbf{a}_2$ onto the unit vector $\\mathbf{q}_1$ is $(\\mathbf{q}_1^\\top \\mathbf{a}_2)\\mathbf{q}_1$. The scalar coefficient $r_{12} = \\mathbf{q}_1^\\top \\mathbf{a}_2$ is how far along $\\mathbf{q}_1$ the vector $\\mathbf{a}_2$ reaches.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-001-10',
      type: 'choice',
      text: 'If $A$ is an $m \\times n$ matrix with thin QR $A = QR$, what is $Q^\\top Q$?',
      options: ['$QQ^\\top$ (the projection matrix onto the column space of $A$)', '$I_n$ (the $n \\times n$ identity)', '$I_m$ (the $m \\times m$ identity)', 'The zero matrix'],
      answer: '$I_n$ (the $n \\times n$ identity)',
      hints: ['In thin QR, $Q$ is $m \\times n$ with orthonormal columns: the $n$ columns are mutually orthogonal unit vectors. So $Q^\\top Q = I_n$. Note $QQ^\\top$ is $m \\times m$ and equals the orthogonal projector onto the column space of $A$ — different from $I_m$ when $m > n$.'],
      reviewSection: 'intuition',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Carry out Gram-Schmidt on a 3×2 matrix by hand, producing $Q$ and $R$, and use QR to solve a 4×2 least squares problem.',
    explainVerbally: 'Explain why $R\\mathbf{x} = Q^\\top\\mathbf{b}$ is equivalent to the normal equations and why it has a better condition number.',
    detectIncorrectApplication: 'Recognize when a student applies the normal equations to a near-rank-deficient matrix and identify the squared-condition-number hazard.',
    transferToUnfamiliar: 'Given a new matrix factorization problem (e.g., QL, LQ), describe how the Gram-Schmidt reasoning would generalize.',
  },

  misconceptions: [
    {
      falseBelief: '$Q^\\top Q = QQ^\\top$ for thin QR.',
      whyStudentsThinkIt: 'Students mix up thin and full QR. For the full (square) $Q$, both equal $I_m$. For thin $Q$ ($m \\times n$, $m > n$), $Q^\\top Q = I_n$ but $QQ^\\top$ is the $m \\times m$ projection matrix — not the identity.',
      correctionExample: 'Take $Q = \\begin{bmatrix}1/\\sqrt{2}\\\\1/\\sqrt{2}\\end{bmatrix}$ ($2 \\times 1$). $Q^\\top Q = 1$ (scalar), $QQ^\\top = \\begin{bmatrix}1/2&1/2\\\\1/2&1/2\\end{bmatrix}$ (a rank-1 projector).',
      contrastCase: 'Full orthogonal $Q$ (square): $Q^\\top Q = QQ^\\top = I$. Thin $Q$: only $Q^\\top Q = I_n$.',
    },
    {
      falseBelief: 'QR and normal equations always give the same numerical answer.',
      whyStudentsThinkIt: 'Both methods are mathematically equivalent, so students think the computed answers are identical. But floating-point arithmetic means the normal equations square the condition number, amplifying rounding errors dramatically for ill-conditioned problems.',
      correctionExample: 'For the Hilbert matrix $H_8$ (condition number $\\approx 10^{13}$), normal equations have condition $\\approx 10^{26}$ — beyond double precision. QR gives a good answer; normal equations give garbage.',
      contrastCase: 'For well-conditioned $A$ (say $\\kappa(A) = 10$), normal equations have $\\kappa = 100$ — both methods agree to many digits.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You need to solve 1000 different least squares problems $A\\mathbf{x} = \\mathbf{b}_i$ for the same $A$ but different right-hand sides $\\mathbf{b}_i$.',
      competingTechniques: 'Recompute QR each time; compute QR once and reuse; use SVD.',
      whyThisTechniqueWins: 'Compute $A = QR$ once ($O(mn^2)$ cost), then for each $\\mathbf{b}_i$ solve $R\\mathbf{x}_i = Q^\\top\\mathbf{b}_i$ in $O(mn + n^2)$ — a massive saving over recomputing the factorization.',
    },
    {
      situation: 'A large regression model has near-collinear predictors, giving a design matrix with condition number $\\approx 10^{10}$.',
      competingTechniques: 'Normal equations with Cholesky; QR; ridge regression (Tikhonov regularization); SVD truncation.',
      whyThisTechniqueWins: 'QR is preferred over normal equations because it avoids squaring the condition number ($10^{20}$ would destroy 16-digit double precision). Ridge regression and SVD truncation also help but change the estimator; QR solves the original least squares problem stably.',
    },
  ],

  debugging: [
    {
      commonError: 'The off-diagonal entry $r_{12}$ is computed as $\\mathbf{a}_1^\\top \\mathbf{a}_2$ instead of $\\mathbf{q}_1^\\top \\mathbf{a}_2$.',
      symptom: '$Q$ columns are not orthonormal — $Q^\\top Q \\neq I$.',
      whyItHappened: 'Confusion between original columns $\\mathbf{a}_j$ and orthonormal columns $\\mathbf{q}_j$. The projection is onto the normalized vector $\\mathbf{q}_i$, not $\\mathbf{a}_i$.',
      repairStrategy: 'Always use $r_{ij} = \\mathbf{q}_i^\\top \\mathbf{a}_j$ (dot with the unit vector $\\mathbf{q}_i$). After computing each $\\mathbf{q}_j$, verify $\\|\\mathbf{q}_j\\| = 1$ before proceeding.',
    },
    {
      commonError: 'Forgetting to subtract ALL previous projections when orthogonalizing column $j$.',
      symptom: 'Later columns of $Q$ are not orthogonal to all earlier columns — only to $\\mathbf{q}_{j-1}$.',
      whyItHappened: 'Students subtract only the most recent projection, forgetting the loop runs from $i=1$ to $j-1$. For column 3, you must subtract projections onto both $\\mathbf{q}_1$ and $\\mathbf{q}_2$.',
      repairStrategy: 'Write out the full subtraction: $\\tilde{\\mathbf{q}}_j = \\mathbf{a}_j - \\sum_{i=1}^{j-1}(\\mathbf{q}_i^\\top\\mathbf{a}_j)\\mathbf{q}_i$. Check orthogonality against all previous $\\mathbf{q}_i$ before moving on.',
    },
  ],
};
