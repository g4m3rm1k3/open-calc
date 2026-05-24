export default {
  id: 'la7-003',
  slug: 'matrix-norms-conditioning',
  chapter: 'la7',
  order: 3,
  title: 'Matrix Norms and Conditioning',
  subtitle: 'The condition number $\\kappa(A)$ measures how much the solution to $Ax = b$ can amplify errors in $b$ or $A$. High condition number means near-singularity; small means robust.',
  tags: ['matrix norm', 'condition number', 'ill-conditioned', 'spectral norm', 'Frobenius norm', 'operator norm', 'perturbation analysis', 'numerical stability'],
  aliases: 'matrix norm condition number ill-conditioned spectral norm Frobenius norm operator norm perturbation analysis numerical stability kappa',

  hook: {
    question: "You solve $Ax = b$ on a computer and get some answer. But if there are tiny rounding errors in $b$, how wrong might your solution be? The condition number tells you exactly.",
    realWorldContext: "Condition numbers are critical in scientific computing. A condition number of $10^{12}$ means that 12 digits of precision are lost in the solution — a disaster on 16-digit double-precision hardware. In ill-conditioned structural mechanics problems (nearly singular stiffness matrices), computed stresses can be completely wrong. In machine learning, ill-conditioned Gram matrices (when features are nearly collinear) cause numerical instability in solving normal equations. In statistics, near-multicollinearity in regression leads to high condition numbers — the signal that your fit is unreliable.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**Vector norms first.** The most common vector norms: $\\|\\mathbf{x}\\|_1 = \\sum |x_i|$ (taxicab), $\\|\\mathbf{x}\\|_2 = \\sqrt{\\sum x_i^2}$ (Euclidean), $\\|\\mathbf{x}\\|_\\infty = \\max |x_i|$ (Chebyshev). All equivalent (bounded by constant multiples), but different numerics.',
      '**Induced (operator) norms.** For a matrix $A$, the induced $p$-norm is $\\|A\\|_p = \\max_{\\mathbf{x} \\neq 0} \\frac{\\|A\\mathbf{x}\\|_p}{\\|\\mathbf{x}\\|_p}$ — the maximum amplification factor. Key results: $\\|A\\|_1 = \\max_j \\sum_i |a_{ij}|$ (max column sum), $\\|A\\|_\\infty = \\max_i \\sum_j |a_{ij}|$ (max row sum), $\\|A\\|_2 = \\sigma_1$ (largest singular value). The Frobenius norm $\\|A\\|_F = \\sqrt{\\sum_{ij} a_{ij}^2} = \\sqrt{\\sum_i \\sigma_i^2}$ is not an induced norm.',
      '**The condition number.** $\\kappa(A) = \\|A\\| \\cdot \\|A^{-1}\\|$. For the 2-norm: $\\kappa_2(A) = \\sigma_1/\\sigma_n$ (ratio of largest to smallest singular value). Interpretation: a relative perturbation of size $\\varepsilon$ in $\\mathbf{b}$ (or $A$) can cause a relative error as large as $\\kappa(A) \\cdot \\varepsilon$ in the solution $\\mathbf{x}$. The condition number is the amplification factor for errors.',
      '**Singular $A$ has $\\kappa = \\infty$.** If $A$ is singular, $\\sigma_n = 0$, so $\\kappa_2(A) = \\infty$. Near-singular matrices have large $\\kappa$ and the solution is numerically unreliable. Rule of thumb: if $\\kappa(A) \\approx 10^k$, you lose about $k$ digits of accuracy in double precision (which has ~16 digits).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Perturbation Bound',
        body: 'If $A\\mathbf{x} = \\mathbf{b}$ and $A(\\mathbf{x}+\\delta\\mathbf{x}) = \\mathbf{b}+\\delta\\mathbf{b}$, then:\n$\\frac{\\|\\delta\\mathbf{x}\\|}{\\|\\mathbf{x}\\|} \\leq \\kappa(A) \\cdot \\frac{\\|\\delta\\mathbf{b}\\|}{\\|\\mathbf{b}\\|}$\n\nThe condition number $\\kappa(A)$ is the worst-case relative error amplification.',
      },
      {
        type: 'insight',
        title: 'Matrix Norm Summary',
        body: '$\\|A\\|_1 = \\max_j \\sum_i |a_{ij}|$ (max column abs-sum)\n$\\|A\\|_\\infty = \\max_i \\sum_j |a_{ij}|$ (max row abs-sum)\n$\\|A\\|_2 = \\sigma_1$ (largest singular value)\n$\\|A\\|_F = \\sqrt{\\sum_{ij} a_{ij}^2} = \\sqrt{\\sum_i \\sigma_i^2}$\n\nAll satisfy: $\\|AB\\| \\leq \\|A\\| \\cdot \\|B\\|$ (submultiplicativity)',
      },
      {
        type: 'warning',
        title: 'Condition Number Is Norm-Dependent',
        body: '$\\kappa_1(A) = \\|A\\|_1 \\|A^{-1}\\|_1$ and $\\kappa_2(A) = \\sigma_1/\\sigma_n$ can differ by a factor of $\\sqrt{n}$ in the worst case. In practice, all condition numbers agree within constant factors, so the qualitative conclusion (well-conditioned vs ill-conditioned) is norm-independent.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Computing Norms and Condition Numbers',
        mathBridge: 'Measure matrix norms and condition numbers; observe error amplification.',
        caption: 'High condition number = solutions amplify errors dramatically.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Compare norms and condition numbers',
              prose: ['Compute various norms and condition numbers for well- and ill-conditioned matrices.'],
              code: `% Well-conditioned matrix
A_good = [2 1; 1 3]
disp('A_good norms:')
norm1_good  = norm(A_good, 1)
norm2_good  = norm(A_good, 2)
normi_good  = norm(A_good, inf)
normF_good  = norm(A_good, 'fro')
kappa_good  = cond(A_good)
disp('Condition number (well-conditioned):')
kappa_good

% Ill-conditioned matrix (nearly singular)
eps = 0.001
A_bad = [1 1; 1 1+eps]
disp('A_bad norms:')
kappa_bad = cond(A_bad)
disp('Condition number (ill-conditioned):')
kappa_bad
`,
            },
            {
              id: 2,
              cellTitle: 'Error amplification demonstration',
              prose: ['Perturb b slightly and see how much the solution changes for ill-conditioned A.'],
              code: `% Ill-conditioned matrix
A = [1 1; 1 1.0001]
b = [2; 2.0001]

x_exact = A \ b
disp('Exact solution:')
x_exact

% Perturb b by a tiny relative amount
delta_b = [0.0001; 0]  % tiny perturbation
b_perturbed = b + delta_b

x_perturbed = A \ b_perturbed
disp('Perturbed solution:')
x_perturbed

disp('Relative error in b:')
rel_err_b = norm(delta_b) / norm(b)

disp('Relative error in x:')
rel_err_x = norm(x_perturbed - x_exact) / norm(x_exact)

disp('Amplification factor:')
amplification = rel_err_x / rel_err_b

disp('Condition number of A:')
cond(A)
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Proof of perturbation bound.** Let $A(\\mathbf{x}+\\delta\\mathbf{x}) = \\mathbf{b}+\\delta\\mathbf{b}$, so $A\\,\\delta\\mathbf{x} = \\delta\\mathbf{b}$ (since $A\\mathbf{x}=\\mathbf{b}$). Then $\\|\\delta\\mathbf{x}\\| = \\|A^{-1}\\delta\\mathbf{b}\\| \\leq \\|A^{-1}\\| \\|\\delta\\mathbf{b}\\|$. Also $\\|\\mathbf{b}\\| = \\|A\\mathbf{x}\\| \\leq \\|A\\| \\|\\mathbf{x}\\|$, so $1/\\|\\mathbf{x}\\| \\leq \\|A\\|/\\|\\mathbf{b}\\|$. Combining: $\\|\\delta\\mathbf{x}\\|/\\|\\mathbf{x}\\| \\leq \\|A^{-1}\\| \\|A\\| \\|\\delta\\mathbf{b}\\|/\\|\\mathbf{b}\\| = \\kappa(A) \\|\\delta\\mathbf{b}\\|/\\|\\mathbf{b}\\|$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Condition Number via SVD',
        body: 'For the 2-norm: $\\kappa_2(A) = \\frac{\\sigma_{\\max}}{\\sigma_{\\min}}$\n\nFor symmetric positive definite: $\\kappa_2(A) = \\frac{\\lambda_{\\max}}{\\lambda_{\\min}}$\n\nFor orthogonal $Q$: $\\kappa_2(Q) = 1$ (perfectly conditioned — orthogonal transformations preserve norms exactly).',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Backward vs forward error.** The perturbation bound above is a **forward error** bound (error in the solution). In backward error analysis (Wilkinson\'s approach), you ask: what is the smallest perturbation $\\delta A$ such that $x_\\text{computed}$ solves $(A + \\delta A)x = b$ exactly? An algorithm is **backward stable** if $\\|\\delta A\\| / \\|A\\| = O(\\varepsilon_\\text{mach})$. Forward error is then bounded by $\\kappa(A) \\cdot \\varepsilon_\\text{mach}$. LAPACK algorithms are generally backward stable.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Rule of Thumb for Numerical Accuracy',
        body: 'If $\\kappa(A) \\approx 10^k$ and you solve in double precision (machine epsilon $\\approx 10^{-16}$), you lose about $k$ significant digits.\n\n$k = 0$: perfect conditioning, full 16-digit accuracy\n$k = 8$: 8 digits lost, ~8 digits remain\n$k = 16$: all digits lost, solution is meaningless\n\nCondition $> 1/\\varepsilon_\\text{mach}$ → matrix is numerically singular.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la7-003-1',
      title: 'Hilbert matrix — notoriously ill-conditioned',
      problem: 'The $n \\times n$ Hilbert matrix has entries $H_{ij} = 1/(i+j-1)$. Compute $\\kappa_2(H_5)$.',
      solution: 'For $n=5$: $\\kappa_2(H_5) \\approx 4.77 \\times 10^5$. For $n=10$: $\\kappa_2(H_{10}) \\approx 1.6 \\times 10^{13}$. Hilbert matrices are the classic example of ill-conditioned matrices — computing them exactly is already a challenge.',
    },
  ],

  challenges: [
    {
      id: 'ch-la7-003-1',
      title: 'Conditioning of scaled matrices',
      difficulty: 'medium',
      prompt: 'If $\\kappa(A) = 100$, what is $\\kappa(2A)$? What is $\\kappa(DA)$ where $D$ is a diagonal scaling matrix?',
      hint: 'Use $\\kappa(cA) = \\kappa(A)$ and analyze $\\|DA\\| \\cdot \\|(DA)^{-1}\\|$.',
      solution: '$\\kappa(2A) = \\|2A\\| \\cdot \\|(2A)^{-1}\\| = 2\\|A\\| \\cdot \\frac{1}{2}\\|A^{-1}\\| = \\kappa(A) = 100$. Scaling by a constant does not change the condition number. Diagonal scaling $D$ generally changes $\\kappa(DA)$ — the goal of equilibration/preconditioning is to choose $D$ to minimize it.',
    },
  ],

  mentalModel: [
    '$\\|A\\|$ = maximum stretching factor of $A$ on unit sphere.',
    '$\\kappa(A) = \\|A\\| \\|A^{-1}\\| = \\sigma_{\\max}/\\sigma_{\\min}$ = ratio of most to least stretching.',
    'High $\\kappa$ → nearly singular → small errors in $\\mathbf{b}$ cause large errors in $\\mathbf{x}$.',
    'Rule: $\\kappa \\approx 10^k$ → lose $k$ digits of accuracy in double precision.',
    'Orthogonal matrices have $\\kappa = 1$ — perfectly conditioned.',
  ],

  checkpoints: [
    { id: 'cp-la7-003-1', question: 'What is $\\|A\\|_2$ in terms of singular values?', answer: '$\\|A\\|_2 = \\sigma_1$ (the largest singular value).' },
    { id: 'cp-la7-003-2', question: 'What is $\\kappa_2(A)$ in terms of singular values?', answer: '$\\kappa_2(A) = \\sigma_1/\\sigma_n$ (ratio of largest to smallest singular value).' },
    { id: 'cp-la7-003-3', question: 'If $\\kappa(A) = 10^{10}$ and you are working in double precision (~16 digits), how many reliable digits does the solution have?', answer: 'About 6 digits ($16 - 10 = 6$).' },
  ],

  assessment: 'Write down the $3 \\times 3$ Hilbert matrix $H_3$. Compute $\\kappa_2(H_3)$ by finding its singular values (or eigenvalues, since $H_3$ is symmetric positive definite). Interpret the result in terms of numerical accuracy.',

  quiz: [
    { id: 'q-la7-003-1', question: 'The spectral (2-norm) condition number $\\kappa_2(A)$ equals:', options: ['$\\|A\\|_F / \\|A^{-1}\\|_F$', '$\\sigma_1 / \\sigma_n$', '$\\lambda_1 / \\lambda_n$', '$\\text{tr}(A) / \\det(A)$'], answer: '$\\sigma_1 / \\sigma_n$' },
    { id: 'q-la7-003-2', question: 'An orthogonal matrix $Q$ has condition number:', options: ['Equal to its determinant', '0', 'Equal to $n$', '1'], answer: '1' },
    { id: 'q-la7-003-3', question: 'If $\\kappa(A) = 10^{14}$, solving $Ax = b$ in double precision gives approximately:', options: ['Full 16-digit accuracy', '2 digits of accuracy', 'No reliable digits', '8 digits of accuracy'], answer: '2 digits of accuracy' },
  ],
};
