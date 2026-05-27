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
  },

  intuition: {
    prose: [
      '**Where you are in the story.** QR and Cholesky give you numerically stable ways to factorize matrices. But "stable" is not a binary property — it comes in degrees. A matrix with condition number 2 is practically indestructible. A matrix with condition number $10^{15}$ will give you garbage even with the best algorithm. This lesson gives you the tools to measure where any given matrix falls on that spectrum, and to understand exactly how much error your computed answer might contain.',

      '**A concrete disaster.** Take $A = \\begin{bmatrix}3&0\\\\0&0.001\\end{bmatrix}$ and solve $A\\mathbf{x} = \\mathbf{b}$ for $\\mathbf{b} = (3, 0.001)^\\top$. Exact solution: $\\mathbf{x} = (1,1)^\\top$. Now add a tiny perturbation $\\delta\\mathbf{b} = (0, 0.001)^\\top$. The relative input error is $\\|\\delta\\mathbf{b}\\|/\\|\\mathbf{b}\\| \\approx 0.03\\%$. The new solution is $(1, 2)^\\top$. Relative error in the answer: $71\\%$. A three-hundredths-of-a-percent perturbation caused a seventy-percent error. The matrix amplified the error by a factor of about 2300. That amplification factor has a name: the condition number.',

      '**What the condition number measures geometrically.** The matrix $A = \\begin{bmatrix}3&0\\\\0&0.001\\end{bmatrix}$ stretches the $x$-axis by 3 and the $y$-axis by 0.001. The ratio of largest to smallest stretch is $3/0.001 = 3000$. That is $\\kappa_2(A)$. A unit sphere under $A$ becomes an ellipse with axes 3 and 0.001. The tiny-axis direction is the source of the problem — points spread out along the fat direction collapse together when $A$ acts on them, so the inverse map fans them back out enormously.',

      '**Norms measure "size" for vectors and matrices.** The Euclidean norm $\\|\\mathbf{x}\\|_2$ is what you already know. The 1-norm $\\|\\mathbf{x}\\|_1 = \\sum |x_i|$ and $\\infty$-norm $\\|\\mathbf{x}\\|_\\infty = \\max |x_i|$ measure size differently. For matrices, the induced 2-norm $\\|A\\|_2 = \\max_{\\mathbf{x}\\neq 0} \\|A\\mathbf{x}\\|_2/\\|\\mathbf{x}\\|_2$ measures the maximum stretching factor — which equals $\\sigma_1$, the largest singular value. The Frobenius norm $\\|A\\|_F = \\sqrt{\\sum a_{ij}^2}$ counts all entries equally and is not an induced norm.',

      '**Predict before reading on.** A $5 \\times 5$ Hilbert matrix has condition number around $5 \\times 10^5$. If you solve $H\\mathbf{x} = \\mathbf{b}$ in double precision (about 16 significant digits), how many reliable digits will the answer have? Write your estimate before looking at Example 1.',

      '**The rule of thumb: digits lost = $\\log_{10}(\\kappa)$.** Double precision has ~16 significant decimal digits. If $\\kappa(A) \\approx 10^k$, solving $A\\mathbf{x} = \\mathbf{b}$ loses about $k$ digits. With $\\kappa = 10^5$, you retain ~11 digits. With $\\kappa = 10^{12}$, only ~4 digits survive. With $\\kappa > 10^{16}$, the answer is meaningless. The Hilbert matrix of size 12 already hits that wall. This is not exotic — it appears in polynomial fitting, integral equations, and machine learning with bad feature scaling.',

      '**The condition number is norm-dependent but qualitatively universal.** $\\kappa_1$, $\\kappa_2$, $\\kappa_\\infty$ can differ by up to $\\sqrt{n}$, but they all agree on whether a matrix is well- or ill-conditioned. In practice, use $\\kappa_2(A) = \\sigma_1/\\sigma_n$: ratio of largest to smallest singular value. An orthogonal matrix (like $Q$ from QR) has $\\kappa_2 = 1$ — perfectly conditioned. A singular matrix has $\\kappa_2 = \\infty$. Everything else is in between.',

      '**Where this is heading.** The next lesson on numerical stability goes deeper: it asks whether the algorithm itself introduces extra errors on top of what conditioning predicts. An algorithm is backward stable if it solves a slightly perturbed problem exactly. Combining perturbation bounds (this lesson) with backward stability (next) gives you a complete picture of how much to trust any numerical result.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of 7 — Numerical Linear Algebra',
        body: '**Previous (Lesson 2):** Cholesky decomposition — fast SPD factorization, $\\frac{1}{3}n^3$ flops.\n**This lesson:** Matrix norms and condition numbers — how much can input errors corrupt the output?\n**Next (Lesson 4):** Numerical stability — does the algorithm introduce extra error beyond what conditioning predicts?',
      },
      {
        type: 'theorem',
        title: 'Perturbation Bound',
        body: 'If $A\\mathbf{x} = \\mathbf{b}$ and $A(\\mathbf{x}+\\delta\\mathbf{x}) = \\mathbf{b}+\\delta\\mathbf{b}$, then:\n$\\frac{\\|\\delta\\mathbf{x}\\|}{\\|\\mathbf{x}\\|} \\leq \\kappa(A) \\cdot \\frac{\\|\\delta\\mathbf{b}\\|}{\\|\\mathbf{b}\\|}$\n\nThe condition number $\\kappa(A) = \\|A\\| \\cdot \\|A^{-1}\\|$ is the worst-case relative error amplification.',
      },
      {
        type: 'insight',
        title: 'Matrix Norm Summary',
        body: '$\\|A\\|_1 = \\max_j \\sum_i |a_{ij}|$ (max column abs-sum)\n$\\|A\\|_\\infty = \\max_i \\sum_j |a_{ij}|$ (max row abs-sum)\n$\\|A\\|_2 = \\sigma_1$ (largest singular value)\n$\\|A\\|_F = \\sqrt{\\sum_{ij} a_{ij}^2} = \\sqrt{\\sum_i \\sigma_i^2}$ (not induced)\n\nAll induced norms satisfy submultiplicativity: $\\|AB\\| \\leq \\|A\\| \\cdot \\|B\\|$',
      },
      {
        type: 'warning',
        title: 'Condition Number Is Norm-Dependent',
        body: '$\\kappa_1$ and $\\kappa_2$ can differ by a factor of $\\sqrt{n}$, but they agree qualitatively. Use $\\kappa_2 = \\sigma_{\\max}/\\sigma_{\\min}$ for the cleanest interpretation.\n\n**Rule of thumb:** $\\kappa \\approx 10^k$ → lose $k$ digits of accuracy in double precision.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Matrix Norms and Condition Numbers with NumPy',
        mathBridge: 'Compute norms and condition numbers, observe error amplification, and see the Hilbert matrix as the classic ill-conditioned example.',
        caption: 'np.linalg.cond uses the ratio of largest to smallest singular value — the most interpretable condition number.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Compare norms and condition numbers',
              prose: 'Compute 1-norm, 2-norm, inf-norm, Frobenius norm, and condition number for well- and ill-conditioned matrices.',
              code: `import numpy as np

A_good = np.array([[2.0, 1.0], [1.0, 3.0]])
print("A_good — well-conditioned:")
print("  1-norm:     ", np.linalg.norm(A_good, 1))
print("  2-norm:     ", np.linalg.norm(A_good, 2))
print("  inf-norm:   ", np.linalg.norm(A_good, np.inf))
print("  Frobenius:  ", np.linalg.norm(A_good, 'fro'))
print("  Condition:  ", np.linalg.cond(A_good))
print()

A_bad = np.array([[1.0, 1.0], [1.0, 1.001]])
print("A_bad — nearly singular:")
print("  Condition:  ", np.linalg.cond(A_bad))
print("  Singular values:", np.linalg.svd(A_bad, compute_uv=False))
`,
            },
            {
              id: 2,
              cellTitle: 'Observe error amplification directly',
              prose: 'Perturb b by a tiny relative amount and measure how much the solution changes. Compare to what the condition number predicted.',
              code: `import numpy as np

A = np.array([[1.0, 1.0], [1.0, 1.0001]])
b = np.array([2.0, 2.0001])

x_exact = np.linalg.solve(A, b)
delta_b  = np.array([0.0001, 0.0])
x_perturbed = np.linalg.solve(A, b + delta_b)

rel_err_b = np.linalg.norm(delta_b) / np.linalg.norm(b)
rel_err_x = np.linalg.norm(x_perturbed - x_exact) / np.linalg.norm(x_exact)

print(f"Relative error in b: {rel_err_b:.2e}")
print(f"Relative error in x: {rel_err_x:.2e}")
print(f"Amplification:       {rel_err_x / rel_err_b:.1f}")
print(f"Condition number:    {np.linalg.cond(A):.1f}")
print()
print("Amplification <= cond(A)?", rel_err_x / rel_err_b <= np.linalg.cond(A) * 1.01)
`,
            },
            {
              id: 3,
              cellTitle: 'Hilbert matrix — condition number grows exponentially',
              prose: 'The Hilbert matrix H[i,j] = 1/(i+j+1) looks harmless but becomes numerically singular around n = 12.',
              code: `import numpy as np

print(f"{'n':>4}  {'kappa':>12}  {'digits lost':>12}")
print("-" * 36)
for n in range(2, 13):
    H = np.array([[1.0/(i+j+1) for j in range(n)] for i in range(n)])
    kappa = np.linalg.cond(H)
    digits_lost = np.log10(kappa) if kappa > 1 else 0
    print(f"{n:>4}  {kappa:>12.2e}  {digits_lost:>11.1f}")

print()
print("Double precision: ~16 significant digits")
print("H_12 is numerically singular in float64")
`,
            },
          ],
        },
      },
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
    {
      id: 'ex-la7-003-2',
      title: 'Compute all four norms of a 2×2 matrix',
      problem: 'For $A = \\begin{bmatrix}2&-1\\\\3&4\\end{bmatrix}$, compute $\\|A\\|_1$, $\\|A\\|_\\infty$, $\\|A\\|_F$, and estimate $\\|A\\|_2$.',
      steps: [
        {
          expression: '\\|A\\|_1 = \\max_j \\sum_i |a_{ij}| = \\max(|2|+|3|,\\, |-1|+|4|) = \\max(5,5) = 5',
          annotation: 'Max absolute column sum. Column 1 sums to 5; column 2 sums to 5.',
          strategyTitle: '$\\|A\\|_1$: max column abs-sum',
        },
        {
          expression: '\\|A\\|_\\infty = \\max_i \\sum_j |a_{ij}| = \\max(|2|+|-1|,\\, |3|+|4|) = \\max(3,7) = 7',
          annotation: 'Max absolute row sum. Row 1 sums to 3; row 2 sums to 7.',
          strategyTitle: '$\\|A\\|_\\infty$: max row abs-sum',
        },
        {
          expression: '\\|A\\|_F = \\sqrt{2^2+(-1)^2+3^2+4^2} = \\sqrt{4+1+9+16} = \\sqrt{30} \\approx 5.48',
          annotation: 'Square root of sum of all squared entries.',
          strategyTitle: '$\\|A\\|_F$: Frobenius norm',
        },
        {
          expression: 'A^\\top A = \\begin{bmatrix}13&10\\\\10&17\\end{bmatrix}, \\quad \\lambda_\\pm = 15 \\pm \\sqrt{104} \\approx 25.2,\\, 4.8',
          annotation: '$\\|A\\|_2 = \\sqrt{\\lambda_{\\max}(A^\\top A)} = \\sqrt{25.2} \\approx 5.02$ and $\\kappa_2(A) = \\sqrt{25.2/4.8} \\approx 2.29$. Well-conditioned!',
          strategyTitle: '$\\|A\\|_2$: largest singular value via $A^\\top A$',
        },
      ],
    },
    {
      id: 'ex-la7-003-3',
      title: 'Catastrophic cancellation in nearly singular systems',
      problem: 'Solve $A\\mathbf{x} = \\mathbf{b}$ where $A = \\begin{bmatrix}1&1\\\\1&1.0001\\end{bmatrix}$, $\\mathbf{b} = (2, 2.0001)^\\top$. Then perturb $\\mathbf{b}$ to $\\mathbf{b}\' = (2, 2.0002)^\\top$ and observe how the solution changes.',
      steps: [
        {
          expression: '\\det(A) = 1 \\cdot 1.0001 - 1 \\cdot 1 = 0.0001',
          annotation: 'Tiny determinant — matrix is nearly singular.',
          strategyTitle: 'Check near-singularity',
        },
        {
          expression: '\\mathbf{x} = A^{-1}\\mathbf{b} = \\frac{1}{0.0001}\\begin{bmatrix}1.0001&-1\\\\-1&1\\end{bmatrix}\\begin{bmatrix}2\\\\2.0001\\end{bmatrix} = 10000\\begin{bmatrix}0.0001\\\\0\\end{bmatrix} = \\begin{bmatrix}1\\\\0\\end{bmatrix}',
          annotation: 'The exact solution to the original system is $(1,0)^\\top$.',
          strategyTitle: 'Original solution',
        },
        {
          expression: '\\mathbf{x}\' = \\frac{1}{0.0001}\\begin{bmatrix}1.0001&-1\\\\-1&1\\end{bmatrix}\\begin{bmatrix}2\\\\2.0002\\end{bmatrix} = 10000\\begin{bmatrix}0.0001\\\\-0.0001\\end{bmatrix}\\cdot\\ldots',
          annotation: '',
          strategyTitle: 'Perturbed solution',
        },
        {
          expression: '\\mathbf{x}\' = A^{-1}\\mathbf{b}\' = \\begin{bmatrix}0\\\\2\\end{bmatrix}',
          annotation: '$\\mathbf{b}\'$ changed by $\\delta\\mathbf{b} = (0, 0.0001)^\\top$: relative error $\\approx 0.005\\%$. But the solution changed from $(1,0)$ to $(0,2)$: $\\|\\delta\\mathbf{x}\\|/\\|\\mathbf{x}\\| = \\sqrt{1+4}/1 = \\sqrt{5} \\approx 224\\%$. This is extreme error amplification from a near-singular matrix.',
          strategyTitle: 'Huge solution shift from tiny perturbation',
        },
      ],
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
    { id: 'cp-la7-003-1', label: 'Read: norms and condition number intro', type: 'read' },
    { id: 'cp-la7-003-2', label: 'Read: perturbation bound and SVD formula', type: 'read' },
    { id: 'cp-la7-003-3', label: 'Read: backward vs forward error analysis', type: 'read' },
    { id: 'cp-la7-003-4', label: 'Try: compute all four norms of a matrix', type: 'lab' },
    { id: 'cp-la7-003-5', label: 'Try: measure error amplification numerically', type: 'lab' },
    { id: 'cp-la7-003-6', label: 'Work: Hilbert matrix condition number', type: 'example' },
    { id: 'cp-la7-003-7', label: 'Work: all four norms on 2×2 matrix', type: 'example' },
    { id: 'cp-la7-003-8', label: 'Challenge: conditioning of scaled matrices', type: 'challenge' },
  ],

  assessment: 'Write down the $3 \\times 3$ Hilbert matrix $H_3$. Compute $\\kappa_2(H_3)$ by finding its singular values (or eigenvalues, since $H_3$ is symmetric positive definite). Interpret the result in terms of numerical accuracy.',

  quiz: [
    {
      id: 'q-la7-003-1',
      type: 'choice',
      text: 'The spectral (2-norm) condition number $\\kappa_2(A)$ equals:',
      options: ['$\\|A\\|_F / \\|A^{-1}\\|_F$', '$\\sigma_1 / \\sigma_n$', '$\\lambda_1 / \\lambda_n$', '$\\text{tr}(A) / \\det(A)$'],
      answer: '$\\sigma_1 / \\sigma_n$',
      hints: ['$\\|A\\|_2 = \\sigma_1$ and $\\|A^{-1}\\|_2 = 1/\\sigma_n$ (the inverse maps the smallest singular direction to the largest). So $\\kappa_2(A) = \\|A\\|_2 \\|A^{-1}\\|_2 = \\sigma_1/\\sigma_n$.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la7-003-2',
      type: 'choice',
      text: 'An orthogonal matrix $Q$ has 2-norm condition number:',
      options: ['Equal to its determinant', '0', 'Equal to $n$', '1'],
      answer: '1',
      hints: ['For orthogonal $Q$: all singular values equal 1 (since $Q^\\top Q = I$ means $\\sigma_i = 1$ for all $i$). So $\\kappa_2(Q) = \\sigma_1/\\sigma_n = 1/1 = 1$. Orthogonal transformations are perfectly conditioned — they preserve vector norms.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-003-3',
      type: 'choice',
      text: 'If $\\kappa(A) = 10^{14}$, solving $A\\mathbf{x} = \\mathbf{b}$ in double precision (~16 digits) gives approximately:',
      options: ['Full 16-digit accuracy', '2 digits of accuracy', 'No reliable digits', '8 digits of accuracy'],
      answer: '2 digits of accuracy',
      hints: ['Rule of thumb: $\\kappa \\approx 10^k$ causes loss of $k$ significant digits. Here $k = 14$ and double precision has 16 digits, so $16 - 14 = 2$ reliable digits remain. If $k \\geq 16$, the solution would be meaningless.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la7-003-4',
      type: 'choice',
      text: 'For $A = \\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}$, the 1-norm $\\|A\\|_1$ equals:',
      options: ['4', '5', '6', '7'],
      answer: '6',
      hints: ['$\\|A\\|_1 = \\max_j \\sum_i |a_{ij}|$. Column 1: $|1|+|3|=4$. Column 2: $|2|+|4|=6$. Max is 6.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-003-5',
      type: 'choice',
      text: 'What is the Frobenius norm of $A = \\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}$?',
      options: ['$\\sqrt{10}$', '$\\sqrt{20}$', '$\\sqrt{30}$', '$\\sqrt{16}$'],
      answer: '$\\sqrt{30}$',
      hints: ['$\\|A\\|_F = \\sqrt{\\sum_{ij}a_{ij}^2} = \\sqrt{1+4+9+16} = \\sqrt{30}$. Note: $\\|A\\|_F$ equals the square root of the sum of squared singular values.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-003-6',
      type: 'choice',
      text: 'The perturbation bound says: if $A\\mathbf{x}=\\mathbf{b}$ and $\\mathbf{b}$ is perturbed by relative amount $\\varepsilon$, then the relative error in $\\mathbf{x}$ is at most:',
      options: ['$\\varepsilon$', '$\\kappa(A) \\cdot \\varepsilon$', '$\\kappa(A)^2 \\cdot \\varepsilon$', '$\\|A\\| \\cdot \\varepsilon$'],
      answer: '$\\kappa(A) \\cdot \\varepsilon$',
      hints: ['From the proof: $\\|\\delta\\mathbf{x}\\|/\\|\\mathbf{x}\\| \\leq \\kappa(A) \\cdot \\|\\delta\\mathbf{b}\\|/\\|\\mathbf{b}\\|$. The condition number is the worst-case amplification factor from relative error in $\\mathbf{b}$ to relative error in $\\mathbf{x}$.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la7-003-7',
      type: 'choice',
      text: 'The Frobenius norm satisfies $\\|A\\|_F = \\sqrt{\\sum_i \\sigma_i^2}$. Which is true about $\\|A\\|_F$ vs $\\|A\\|_2$?',
      options: ['$\\|A\\|_F = \\|A\\|_2$ always', '$\\|A\\|_F \\geq \\|A\\|_2$ always', '$\\|A\\|_F \\leq \\|A\\|_2$ always', 'They are unrelated'],
      answer: '$\\|A\\|_F \\geq \\|A\\|_2$ always',
      hints: ['$\\|A\\|_2 = \\sigma_1$ (largest singular value), $\\|A\\|_F = \\sqrt{\\sigma_1^2+\\cdots+\\sigma_n^2} \\geq \\sqrt{\\sigma_1^2} = \\sigma_1 = \\|A\\|_2$. Frobenius norm is never smaller than spectral norm. They are equal only when $A$ has rank 1.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la7-003-8',
      type: 'choice',
      text: 'An algorithm is "backward stable" if:',
      options: ['It produces the exact answer', 'The computed solution exactly solves a nearby problem', 'The residual $\\|A\\hat{x}-b\\|$ is zero', 'It runs without overflow'],
      answer: 'The computed solution exactly solves a nearby problem',
      hints: ['Backward stability (Wilkinson): the computed $\\hat{x}$ satisfies $(A+\\delta A)\\hat{x} = \\mathbf{b}$ exactly for some small $\\|\\delta A\\| \\approx \\varepsilon_{\\text{mach}}\\|A\\|$. Forward error is then $\\leq \\kappa(A) \\cdot \\varepsilon_{\\text{mach}}$. LAPACK algorithms are backward stable.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la7-003-9',
      type: 'choice',
      text: 'If you scale $A$ by a constant $c \\neq 0$, what happens to $\\kappa(cA)$?',
      options: ['$\\kappa(cA) = |c| \\kappa(A)$', '$\\kappa(cA) = \\kappa(A)$', '$\\kappa(cA) = \\kappa(A)/|c|$', '$\\kappa(cA) = c^2 \\kappa(A)$'],
      answer: '$\\kappa(cA) = \\kappa(A)$',
      hints: ['$\\kappa(cA) = \\|cA\\| \\cdot \\|(cA)^{-1}\\| = |c|\\|A\\| \\cdot \\frac{1}{|c|}\\|A^{-1}\\| = \\|A\\|\\|A^{-1}\\| = \\kappa(A)$. Uniform scaling does not change the condition number — it does not change the relative spread of singular values.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-003-10',
      type: 'choice',
      text: 'The $\\infty$-norm of $A = \\begin{bmatrix}1&-2\\\\3&4\\end{bmatrix}$ is:',
      options: ['4', '5', '7', '6'],
      answer: '7',
      hints: ['$\\|A\\|_\\infty = \\max_i \\sum_j |a_{ij}|$. Row 1: $|1|+|-2|=3$. Row 2: $|3|+|4|=7$. Maximum is 7.'],
      reviewSection: 'intuition',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Compute $\\|A\\|_1$, $\\|A\\|_\\infty$, $\\|A\\|_F$ by hand for a given $2 \\times 2$ matrix. Given singular values, compute $\\kappa_2(A)$ and predict the number of digits lost when solving $A\\mathbf{x}=\\mathbf{b}$.',
    explainVerbally: 'Explain why $\\kappa(A) = \\sigma_{\\max}/\\sigma_{\\min}$ measures how close $A$ is to singular and why high condition number means the linear system is hard to solve numerically.',
    detectIncorrectApplication: 'Catch the error of using the ratio of eigenvalues for condition number when the matrix is not symmetric — you must use singular values, not eigenvalues, in general.',
    transferToUnfamiliar: 'Given a new linear system problem from a different domain (e.g., circuit analysis, regression), compute its condition number and predict numerical difficulties before attempting to solve it.',
  },

  misconceptions: [
    {
      falseBelief: 'Condition number equals the ratio of largest to smallest eigenvalue.',
      whyStudentsThinkIt: 'Students see $\\kappa_2(A) = \\sigma_{\\max}/\\sigma_{\\min}$ and confuse singular values with eigenvalues.',
      correctionExample: 'For $A = \\begin{bmatrix}0&2\\\\0.5&0\\end{bmatrix}$: eigenvalues are $\\pm 1$ (ratio = 1), but singular values are $\\sqrt{4+0.25}/\\sqrt{2} \\approx 2$ and $0.5$, so $\\kappa \\approx 4$. For non-symmetric matrices, eigenvalues and singular values differ completely.',
      contrastCase: 'For symmetric positive definite $A$: eigenvalues equal singular values, so $\\kappa = \\lambda_{\\max}/\\lambda_{\\min}$. This special case explains the confusion — it only works for SPD matrices.',
    },
    {
      falseBelief: 'A matrix with a large condition number has a small determinant.',
      whyStudentsThinkIt: 'Students associate near-singularity with small determinant, and high condition number with near-singularity.',
      correctionExample: '$A = 1000 \\cdot I$ has $\\det(A) = 10^9$ (large!) but $\\kappa(A) = 1$ (perfectly conditioned). $B = \\text{diag}(1000, 0.001)$ has $\\det(B) = 1$ but $\\kappa(B) = 10^6$ (ill-conditioned). Condition number measures shape (ratio of stretching), not size.',
      contrastCase: 'Determinant measures volume scaling; condition number measures the ratio of max to min stretching. These are independent properties of a matrix.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You are fitting a polynomial to data points. As you increase the polynomial degree, you find your least-squares solution becomes unreliable — small data changes cause huge coefficient changes.',
      competingTechniques: 'Add more data, use a different polynomial basis, or regularize.',
      whyThisTechniqueWins: 'The Vandermonde matrix for high-degree polynomials has extremely high condition number. The fix is a change of basis — use orthogonal polynomials (Chebyshev or Legendre) instead of the monomial basis $\\{1, x, x^2, \\ldots\\}$. This is pure condition-number thinking applied to function approximation.',
    },
    {
      situation: 'A structural engineer computes displacements in a finite element model but gets values that change dramatically when mesh is slightly refined.',
      competingTechniques: 'Refine the mesh more, use a different element type, or check material properties.',
      whyThisTechniqueWins: 'Nearly degenerate elements produce ill-conditioned stiffness matrices. The fix is to check $\\kappa(K)$ before solving: if it exceeds $1/\\varepsilon_{\\text{mach}}$, the system is numerically singular. Mesh quality (well-shaped elements) controls conditioning.',
    },
  ],

  debugging: [
    {
      commonError: 'Confusing $\\kappa(A) \\approx 10^{14}$ with "14% error" instead of "14 digits lost."',
      symptom: 'Student computes $\\kappa = 10^{14}$ and concludes the answer is only 14% inaccurate.',
      whyItHappened: 'The condition number looks like a percentage but it is a multiplicative amplification factor on relative error, and the key context is double-precision having 16 digits.',
      repairStrategy: 'Always apply the rule: "I have $p$ digits of precision; $\\kappa \\approx 10^k$ means I lose $k$ digits; I have $p - k$ reliable digits." For $p=16$, $k=14$: only 2 digits survive.',
    },
    {
      commonError: 'Using $\\|A\\|_F$ as the condition number instead of $\\|A\\| \\cdot \\|A^{-1}\\|$.',
      symptom: 'A computed "condition number" that only grows linearly with matrix size instead of potentially exponentially.',
      whyItHappened: 'The Frobenius norm is easy to compute (just square and sum entries) so students use it directly. But the condition number requires both $A$ and $A^{-1}$ norms.',
      repairStrategy: 'Compute $\\kappa(A) = \\|A\\|_2 \\cdot \\|A^{-1}\\|_2$ using the SVD. In MATLAB: `cond(A)`. The Frobenius norm alone tells you nothing about conditioning.',
    },
  ],
};
