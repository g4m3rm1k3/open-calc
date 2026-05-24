export default {
  id: 'la7-004',
  slug: 'numerical-stability',
  chapter: 'la7',
  order: 4,
  title: 'Numerical Stability and Pivoting',
  subtitle: 'Floating-point arithmetic introduces rounding errors at every step. Backward stability tells us when those errors remain small — and partial pivoting in Gaussian elimination keeps LU factorization backward stable.',
  tags: ['numerical stability', 'floating-point', 'machine epsilon', 'backward stability', 'pivoting', 'Gaussian elimination', 'rounding error', 'LAPACK'],
  aliases: 'numerical stability floating point machine epsilon backward stability pivoting Gaussian elimination rounding error LAPACK roundoff',

  hook: {
    question: "You run Gaussian elimination on paper and get the exact answer. You run the same algorithm on a computer and get a wrong answer. How can a perfectly correct algorithm give a wrong answer — and how do you fix it?",
    realWorldContext: "Numerical stability is the difference between working scientific software and software that crashes or gives nonsense. The Apollo Guidance Computer used carefully designed algorithms to avoid catastrophic cancellation during lunar orbit insertion. Climate models accumulate rounding errors over millions of time steps — numerical stability determines whether forecasts are reliable. The Intel Pentium FDIV bug (1994) — a flaw in floating-point division — cost Intel \\$475M in recalls. Understanding floating-point arithmetic is not optional for serious numerical computing.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**Floating-point numbers.** A double-precision float has 53 bits of mantissa, giving about 15-17 significant decimal digits. The **machine epsilon** $\\varepsilon_\\text{mach} \\approx 2.2 \\times 10^{-16}$ is the smallest number such that $1 + \\varepsilon_\\text{mach} > 1$ in floating-point. Every arithmetic operation introduces a relative error of at most $\\varepsilon_\\text{mach}$.',
      '**Catastrophic cancellation.** When you subtract two nearly equal numbers, you can lose all significant digits. Example: $\\sqrt{x+1} - \\sqrt{x}$ for large $x$. Both terms are nearly equal, and the subtraction leaves only noise. The fix: algebraic rewriting to avoid cancellation — $\\sqrt{x+1} - \\sqrt{x} = 1/(\\sqrt{x+1} + \\sqrt{x})$.',
      '**Gaussian elimination without pivoting can be unstable.** Consider $\\begin{bmatrix}\\varepsilon & 1 \\\\ 1 & 1\\end{bmatrix}$ with tiny $\\varepsilon$. Eliminating using the (1,1) pivot introduces a multiplier $1/\\varepsilon \\gg 1$, which amplifies rounding errors in subsequent steps. The computed solution can be completely wrong.',
      '**Partial pivoting fixes it.** Before eliminating column $k$, swap row $k$ with the row below it that has the largest absolute value in column $k$. This keeps all multipliers $|l_{ij}| \\leq 1$, controlling error growth. **Partial pivoting makes LU backward stable**: the computed $L, U$ satisfy $PA = LU + E$ where $\\|E\\| = O(\\varepsilon_\\text{mach} \\|A\\|)$.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Machine Epsilon and Floating-Point',
        body: 'Double precision: $\\varepsilon_\\text{mach} \\approx 2.22 \\times 10^{-16}$\nSingle precision: $\\varepsilon_\\text{mach} \\approx 1.19 \\times 10^{-7}$\nHalf precision:  $\\varepsilon_\\text{mach} \\approx 9.77 \\times 10^{-4}$\n\nFor $x, y$ floating-point: $fl(x \\circ y) = (x \\circ y)(1 + \\delta)$ where $|\\delta| \\leq \\varepsilon_\\text{mach}$.',
      },
      {
        type: 'insight',
        title: 'Backward Stability',
        body: 'Algorithm $\\tilde{f}$ is **backward stable** for problem $f$ if for any input $x$, the computed output $\\tilde{f}(x)$ satisfies $\\tilde{f}(x) = f(x + \\delta x)$ for some small $\\|\\delta x\\| / \\|x\\| = O(\\varepsilon_\\text{mach})$.\n\nInterpretation: the computed answer is the exact answer to a slightly perturbed problem. Backward stable + well-conditioned problem → accurate answer.',
      },
      {
        type: 'warning',
        title: 'Growth Factor',
        body: 'Partial pivoting limits multipliers $|l_{ij}| \\leq 1$, but the **growth factor** $\\rho_n = \\max_{ijk} |u_{ij}| / \\max_{ij} |a_{ij}|$ can still be large (up to $2^{n-1}$ in theory). In practice, catastrophic growth is extremely rare and complete pivoting (which bounds $\\rho_n$ tightly) is almost never needed. Partial pivoting is safe for virtually all practical matrices.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Floating-Point Pitfalls and Pivoting',
        mathBridge: 'Observe catastrophic cancellation and the effect of pivoting.',
        caption: 'Machine epsilon: every fl-op introduces relative error of about 10^-16.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Machine epsilon and catastrophic cancellation',
              prose: ['Observe floating-point precision limits and catastrophic cancellation.'],
              code: `% Machine epsilon
eps_machine = eps('double')
disp('Machine epsilon (double):')
eps_machine

% Catastrophic cancellation
x = 1e15
bad  = sqrt(x+1) - sqrt(x)       % nearly equal numbers subtracted
good = 1 / (sqrt(x+1) + sqrt(x)) % algebraically equivalent, stable
disp('Naive computation (bad):')
bad
disp('Stable computation (good):')
good
disp('Error (bad - good):')
bad - good

% Small example: (1 + eps) - 1
a = 1 + 1e-15
disp('(1 + 1e-15) - 1 =')
a - 1   % should be 1e-15 but may differ
`,
            },
            {
              id: 2,
              cellTitle: 'Effect of pivoting on numerical accuracy',
              prose: ['Solve an ill-conditioned system with and without pivoting strategy. Observe accuracy.'],
              code: `% Matrix that requires pivoting for stability
% Small (1,1) entry creates large multiplier without pivoting
eps_val = 1e-10
A = [eps_val  1;
     1        1]
b = [1 + eps_val; 2]
x_true = [1; 1]  % exact solution

% MATLAB's backslash uses partial pivoting automatically
x_computed = A \ b
disp('Computed solution (with pivoting via backslash):')
x_computed
disp('True solution:')
x_true
disp('Relative error:')
norm(x_computed - x_true) / norm(x_true)

% Check condition number
disp('Condition number of A:')
cond(A)

% Compare residual (backward error indicator)
residual = norm(A * x_computed - b)
disp('Residual ||Ax - b||:')
residual
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Wilkinson\'s backward error analysis.** For Gaussian elimination with partial pivoting on an $n \\times n$ matrix $A$, the computed $\\hat{L}, \\hat{U}$ satisfy $PA = \\hat{L}\\hat{U} + E$ where $\\|E\\|_\\infty \\leq n^3 \\rho_n \\varepsilon_\\text{mach} \\|A\\|_\\infty / n$ (up to constants depending on $n$). Combined with the condition number bound, the forward error is $\\|\\hat{x} - x\\| / \\|x\\| \\lesssim \\kappa_\\infty(A) \\cdot n^3 \\rho_n \\varepsilon_\\text{mach}$.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Stably Computable Quantities',
        body: 'Some computations are inherently stable:\n• Inner products: $\\mathbf{a}^\\top \\mathbf{b}$ — use compensated summation (Kahan) for large sums\n• Orthogonal transformations: perfectly stable ($\\kappa = 1$)\n• Matrix-vector products: generally stable\n\nSome are unstable without care:\n• Subtraction of nearly equal numbers\n• Division by nearly zero\n• Solving ill-conditioned systems\n• Computing eigenvalues of defective matrices',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Floating-point standard (IEEE 754).** Modern hardware follows IEEE 754 (1985, updated 2008). Each floating-point operation ($+, -, \\times, \\div, \\sqrt{}$) is performed as if in infinite precision, then rounded to the nearest representable value. This gives the fundamental axiom: $fl(a \\circ b) = (a \\circ b)(1 + \\varepsilon)$ with $|\\varepsilon| \\leq \\varepsilon_\\text{mach}$. Higher-level operations (like matrix multiply) are implemented by composing elementary operations.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Mixed-Precision Computing',
        body: 'Modern AI hardware (GPUs, TPUs) uses half-precision (16-bit) floats for throughput. Training deep networks in half-precision is possible with loss scaling tricks. Numerical linear algebra uses **mixed-precision iterative refinement**: solve in low precision, then refine the solution using high-precision residual computations. This achieves high-precision accuracy at low-precision speed.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la7-004-1',
      title: 'Classic catastrophic cancellation',
      problem: 'Evaluate $f(x) = (1 - \\cos x)/x^2$ for $x = 10^{-8}$ in double precision.',
      solution: 'Direct computation: $\\cos(10^{-8}) \\approx 1 - 5 \\times 10^{-17}$ in double precision, but $1 - \\cos(10^{-8})$ suffers cancellation (both terms round to 1 at this precision) → result is 0. Stable form: use $f(x) = 2\\sin^2(x/2)/x^2$ → approximately $1/2$ as $x \\to 0$.',
    },
  ],

  challenges: [
    {
      id: 'ch-la7-004-1',
      title: 'Stable quadratic formula',
      difficulty: 'medium',
      prompt: 'The standard quadratic formula $x = (-b \\pm \\sqrt{b^2 - 4ac})/(2a)$ is unstable when $b^2 \\gg 4ac$ (one root involves subtracting nearly equal numbers). Derive a numerically stable version.',
      hint: 'Multiply numerator and denominator by the conjugate to avoid cancellation.',
      solution: 'If $b > 0$: compute $x_1 = (-b - \\sqrt{b^2-4ac})/(2a)$ stably (both negative), then use Vieta\'s formula $x_1 x_2 = c/a$ to get $x_2 = c/(ax_1)$. If $b < 0$: compute $x_1 = (-b + \\sqrt{b^2-4ac})/(2a)$ stably. This avoids cancellation in both cases.',
    },
  ],

  mentalModel: [
    'Every floating-point operation has relative error $\\leq \\varepsilon_\\text{mach} \\approx 10^{-16}$.',
    'Catastrophic cancellation: subtracting nearly equal numbers amplifies relative error.',
    'Backward stable = exact answer to a slightly perturbed problem.',
    'Partial pivoting in LU: swap rows to use largest pivot, keeps $|l_{ij}| \\leq 1$, prevents unstable growth.',
    'Final accuracy = (condition number) × (backward error). Well-conditioned + backward stable → accurate.',
  ],

  checkpoints: [
    { id: 'cp-la7-004-1', question: 'What is machine epsilon and what does it represent?', answer: 'The smallest number $\\varepsilon$ such that $1 + \\varepsilon > 1$ in floating-point. It is the relative rounding error per operation ($\\approx 2.2 \\times 10^{-16}$ for double).' },
    { id: 'cp-la7-004-2', question: 'What is partial pivoting in Gaussian elimination?', answer: 'Before eliminating column $k$, swap the current row with the row having the largest absolute value in column $k$. This keeps multipliers $|l_{ij}| \\leq 1$.' },
    { id: 'cp-la7-004-3', question: 'An algorithm is backward stable if...', answer: 'The computed output is the exact output of the algorithm applied to a slightly perturbed input, where the perturbation is $O(\\varepsilon_\\text{mach})$ relative to the input.' },
  ],

  assessment: 'Explain why computing $e^x - 1$ directly is catastrophically inaccurate for small $x$, and describe a numerically stable alternative. (Hint: look up "expm1" in numerical libraries.)',

  quiz: [
    { id: 'q-la7-004-1', question: 'Double-precision machine epsilon is approximately:', options: ['$10^{-7}$', '$10^{-12}$', '$10^{-16}$', '$10^{-32}$'], answer: '$10^{-16}$' },
    { id: 'q-la7-004-2', question: 'Partial pivoting in Gaussian elimination swaps rows to ensure:', options: ['The diagonal entries are all 1', 'All multipliers $|l_{ij}| \\leq 1$', 'The matrix is symmetric', 'All pivots equal $\\pm 1$'], answer: 'All multipliers $|l_{ij}| \\leq 1$' },
    { id: 'q-la7-004-3', question: 'Catastrophic cancellation occurs when:', options: ['Two numbers are multiplied', 'Two nearly equal numbers are subtracted', 'A matrix is inverted', 'The condition number is 1'], answer: 'Two nearly equal numbers are subtracted' },
  ],
};
