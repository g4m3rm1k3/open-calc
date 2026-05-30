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
  },

  intuition: {
    prose: [
      '**Where you are in the story.** You now know that condition numbers measure how much a problem amplifies input errors. But there is a second source of error in numerical computation: the algorithm itself. Even a perfectly conditioned problem can produce a wrong answer if implemented carelessly. This lesson is about the other half of the error story — what happens inside the computer when you subtract two nearly equal numbers, and how pivoting keeps Gaussian elimination from catastrophically amplifying floating-point noise.',

      '**Floating-point is not exact arithmetic.** A double-precision float stores about 15-17 significant decimal digits. Machine epsilon $\\varepsilon_\\text{mach} \\approx 2.2 \\times 10^{-16}$ is the gap between 1.0 and the next representable number. Every floating-point operation introduces a relative error of at most $\\varepsilon_\\text{mach}$: computing $x + y$ gives $fl(x+y) = (x+y)(1+\\delta)$ where $|\\delta| \\leq \\varepsilon_\\text{mach}$. This is usually harmless — one operation, one tiny error. The danger is when many operations chain together and errors accumulate, or when one operation wipes out all significant digits at once.',

      '**Catastrophic cancellation: the worst single-operation failure.** Compute $f(x) = (1 - \\cos x)/x^2$ at $x = 10^{-8}$. The true answer is $1/2$. On a computer: $\\cos(10^{-8})$ rounds to exactly $1.0000000000000000$ in double precision — all 16 significant digits are used for the integer part. So $1 - \\cos(10^{-8}) = 0$ exactly in floating-point, not $5 \\times 10^{-17}$. Division gives $0$, not $0.5$. The subtraction of two nearly equal numbers destroyed all 16 significant digits in a single operation. This is catastrophic cancellation.',

      '**The fix: algebraic rewriting.** Often you can rearrange the formula to avoid cancellation. For $\\sqrt{x+1} - \\sqrt{x}$ with large $x$: multiply top and bottom by $\\sqrt{x+1}+\\sqrt{x}$ to get $1/(\\sqrt{x+1}+\\sqrt{x})$. No subtraction of nearly equal quantities. For the cosine example: use the identity $1 - \\cos x = 2\\sin^2(x/2)$, giving $f(x) = 2\\sin^2(x/2)/x^2$. Near $x=0$, $\\sin(x/2) \\approx x/2$, so $f \\approx 2(x/2)^2/x^2 = 1/2$ ✓. The key insight: find a mathematically equivalent form that avoids subtracting nearly equal quantities.',

      '**Predict before reading on.** For $A = \\begin{bmatrix}0.001&1\\\\1&1\\end{bmatrix}$, standard Gaussian elimination uses the $(1,1)$ entry as pivot, giving multiplier $1/0.001 = 1000$. Without pivoting, do you expect the solution to be accurate? Write your prediction, then trace Example 2 to see what happens.',

      '**Gaussian elimination without pivoting amplifies errors.** When the pivot is tiny, the elimination multiplier is huge. If that pivot has floating-point errors of relative size $\\varepsilon_\\text{mach}$, multiplying by $1/\\varepsilon_\\text{mach}$ blows those errors up to order 1 — losing all accuracy. The matrix $\\begin{bmatrix}0.001&1\\\\1&1\\end{bmatrix}$ has a perfectly good solution, but naive LU without pivoting can compute it completely wrong when the first pivot is tiny.',

      '**Partial pivoting: the fix that is always used.** Before eliminating column $k$, scan all entries in that column below row $k$ and swap row $k$ with the row having the largest absolute value. This forces the pivot to be at least as large as any entry it will multiply, keeping all multipliers $|l_{ij}| \\leq 1$. With bounded multipliers, floating-point errors in the elimination do not get magnified. Partial pivoting makes LU backward stable: the computed $L, U$ satisfy $PA = LU + E$ where $\\|E\\| \\approx \\varepsilon_\\text{mach}\\|A\\|$. LAPACK\'s `dgetrf` (which NumPy calls internally) always uses partial pivoting.',

      '**Where this is heading.** The sparse matrix lesson applies all these ideas at massive scale. When you solve finite-element systems with millions of unknowns, every floating-point decision — pivoting strategy, storage format, stopping criteria for iterative solvers — determines whether you get an answer at all. The stability concepts here are the foundation for understanding when any large-scale computation can be trusted.',
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'How to Identify and Fix Catastrophic Cancellation (4 Steps)',
        body: '**Given:** A formula that computes a quantity involving subtraction of two terms.\n**Step 1.** Identify the cancellation: is there a step where two nearly equal quantities are subtracted? If $|a - b| \\ll |a|$, relative error in $a$ and $b$ can dominate the result.\n**Step 2.** Estimate the digits lost: if $a \\approx b$ to $k$ decimal digits, you lose $k$ digits of precision in $a - b$.\n**Step 3.** Find an algebraically equivalent form that avoids the cancellation. Common techniques: multiply by conjugate ($\\sqrt{x+h} - \\sqrt{x}$ → $h/(\\sqrt{x+h}+\\sqrt{x})$); use Taylor series for small arguments ($e^x - 1$ → $x + x^2/2 + \\ldots$ for $|x| \\ll 1$); use trig identities ($1 - \\cos x$ → $2\\sin^2(x/2)$).\n**Step 4.** Verify the stable form gives the same answer for ordinary inputs and does not cancel for small/extreme inputs.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 4 of 7 — Numerical Linear Algebra',
        body: '**Previous (Lesson 3):** Matrix norms and condition numbers — problem sensitivity to input perturbations.\n**This lesson:** Numerical stability — algorithm-introduced errors: catastrophic cancellation, floating-point, pivoting.\n**Next (Lesson 5):** Sparse matrices — exploiting near-zero structure at massive scale.',
      },
      {
        type: 'insight',
        title: 'Machine Epsilon by Precision',
        body: 'Double precision: $\\varepsilon_\\text{mach} \\approx 2.22 \\times 10^{-16}$ (~16 significant digits)\nSingle precision: $\\varepsilon_\\text{mach} \\approx 1.19 \\times 10^{-7}$ (~7 digits)\nHalf precision: $\\varepsilon_\\text{mach} \\approx 9.77 \\times 10^{-4}$ (~3 digits)\n\nEvery arithmetic operation: $fl(x \\circ y) = (x \\circ y)(1+\\delta)$, $|\\delta| \\leq \\varepsilon_\\text{mach}$',
      },
      {
        type: 'insight',
        title: 'Backward Stability',
        body: 'Algorithm $\\tilde{f}$ is **backward stable** if for any input $x$:\n$\\tilde{f}(x) = f(x + \\delta x)$ for some $\\|\\delta x\\|/\\|x\\| = O(\\varepsilon_\\text{mach})$\n\nMeaning: the computed answer is the *exact* answer to a *slightly perturbed* problem.\n**Backward stable + well-conditioned → accurate answer.**',
      },
      {
        type: 'warning',
        title: 'Growth Factor',
        body: 'Partial pivoting bounds multipliers $|l_{ij}| \\leq 1$, but the growth factor $\\rho_n = \\|U\\|_\\infty / \\|A\\|_\\infty$ can still be $2^{n-1}$ in theory. In practice, catastrophic growth essentially never occurs for real-world matrices. Partial pivoting is safe for virtually all applications.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Numerical Stability with NumPy',
        mathBridge: 'Observe catastrophic cancellation, measure machine epsilon, and compare LU with and without pivoting.',
        caption: 'Python floats are IEEE 754 double precision — same arithmetic as MATLAB and C.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Machine epsilon and catastrophic cancellation',
              prose: 'Measure machine epsilon and observe how subtracting nearly equal numbers destroys all significant digits.',
              code: `import numpy as np

eps = np.finfo(float).eps
print(f"Machine epsilon (float64): {eps:.2e}")
print(f"1 + eps = {1 + eps}")
print(f"1 + eps/2 = {1 + eps/2}  (rounds back to 1.0!)")
print()

# Catastrophic cancellation
x = 1e15
bad  = np.sqrt(x+1) - np.sqrt(x)
good = 1 / (np.sqrt(x+1) + np.sqrt(x))
print(f"sqrt(x+1) - sqrt(x) [naive]: {bad}")
print(f"1/(sqrt(x+1)+sqrt(x)) [stable]: {good}")
print(f"Error: {abs(bad-good):.2e}")
print()

# Classic example: (1 - cos x) / x^2 near x = 0
x = 1e-8
bad_f  = (1 - np.cos(x)) / x**2
good_f = 2 * np.sin(x/2)**2 / x**2   # stable form
print(f"(1 - cos x)/x^2 [naive]:  {bad_f}")
print(f"2*sin^2(x/2)/x^2 [stable]: {good_f}")
print(f"True value: 0.5")
`,
            },
            {
              id: 2,
              cellTitle: 'LU with and without pivoting',
              prose: 'Compare naive LU (no pivoting) vs scipy LU with partial pivoting on a nearly singular matrix.',
              code: `import numpy as np
from scipy.linalg import lu, solve

# Matrix where no-pivot LU fails: small top-left entry
eps = 1e-15
A = np.array([[eps, 1.0], [1.0, 1.0]])
b = np.array([1.0 + eps, 2.0])
true_x = np.linalg.solve(A, b)
print("True solution:", np.round(true_x, 6))

# Naive LU without pivoting
m = A[1, 0] / A[0, 0]       # multiplier = 1/eps — huge!
A2 = A.copy()
A2[1, :] -= m * A2[0, :]
b2 = b.copy()
b2[1] -= m * b2[0]
x_naive = np.array([b2[0]/A2[0,0], b2[1]/A2[1,1]])
print("Naive (no pivot):      ", np.round(x_naive, 6))

# scipy LU with partial pivoting
P, L, U = lu(A)
x_pivot = np.linalg.solve(A, b)   # scipy always pivots internally
print("With partial pivoting: ", np.round(x_pivot, 6))
print()
print("The multiplier without pivoting was:", round(m, 2))
`,
            },
          ],
        },
      },
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
      '**Kahan compensated summation.** Straightforward summation of $n$ numbers accumulates error $O(n\\varepsilon_\\text{mach})$: each addition incurs a relative error, and errors pile up. Kahan\'s algorithm maintains a compensation variable $c$ that captures the bits lost in the previous addition: $y = a_i - c$; $t = S + y$; $c = (t - S) - y$; $S = t$. The net effect is that the accumulated error is $O(\\varepsilon_\\text{mach})$ regardless of $n$ — a factor of $n$ improvement. The extra cost is a few floating-point operations per element, negligible compared to the precision gain. Python\'s `math.fsum` uses an even more aggressive variant that achieves exact summation.',
      '**Complete pivoting vs partial pivoting.** Partial pivoting searches only column $k$ for the largest pivot — costing $O(n)$ per step and $O(n^2)$ total. Complete pivoting searches the entire remaining $(n-k) \\times (n-k)$ submatrix for the globally largest entry — costing $O(n^3)$ total (matching the factorization cost itself). Complete pivoting gives a smaller growth factor bound: $\\rho_n \\leq (n \\prod_{k=2}^n k^{1/(k-1)})^{1/2} \\approx n^{1.09}$ vs the partial-pivoting bound $\\rho_n \\leq 2^{n-1}$. In practice, partial pivoting is universally preferred because (a) the $2^{n-1}$ bound is essentially never achieved on real matrices, (b) the $O(n^2)$ search cost fits naturally into cache-efficient BLAS-2 operations, and (c) partial pivoting is backward stable for all practical purposes.',
      '**Error accumulation and condition numbers.** When solving $A\\mathbf{x} = \\mathbf{b}$ with a backward-stable algorithm (error $\\|E\\| \\approx \\varepsilon_\\text{mach}\\|A\\|$), the forward error bound is $\\|\\hat{x} - x\\|/\\|x\\| \\lesssim \\kappa(A) \\cdot \\varepsilon_\\text{mach}$. This combines both error sources into one formula: conditioning captures problem sensitivity, backward error captures algorithm quality. The bound is sharp: for Hilbert matrices and other ill-conditioned examples, the actual forward error closely matches $\\kappa(A)\\varepsilon_\\text{mach}$. Iterative refinement can improve the answer by one or two extra digits: compute residual $r = b - A\\hat{x}$ in higher precision, solve $Ae = r$, update $\\hat{x} \\leftarrow \\hat{x} + e$. Each refinement step multiplies the error by approximately $\\kappa(A) \\varepsilon_\\text{mach}$ — if this is $< 1$, the iteration converges.',
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
    {
      id: 'ex-la7-004-2',
      title: 'LU without pivoting vs with pivoting',
      problem: 'Solve $A\\mathbf{x} = \\mathbf{b}$ where $A = \\begin{bmatrix}0.001&1\\\\1&1\\end{bmatrix}$, $\\mathbf{b} = (1.001, 2)^\\top$ (exact answer $\\mathbf{x} = (1,1)^\\top$). Show what happens in 3-digit arithmetic without and with pivoting.',
      steps: [
        {
          expression: '\\text{Without pivoting: } m = 1/0.001 = 1000, \\quad R_2 \\leftarrow R_2 - 1000 R_1',
          annotation: 'The multiplier is 1000 — already dangerous. In exact arithmetic it works, but in 3-digit floating-point the errors compound.',
          strategyTitle: 'Step 1: No pivoting, multiplier = 1000',
        },
        {
          expression: '\\begin{bmatrix}0.001&1\\\\0&1-1000\\end{bmatrix} = \\begin{bmatrix}0.001&1\\\\0&-999\\end{bmatrix}, \\quad b_2 \\leftarrow 2 - 1000 = -998',
          annotation: 'In 3-digit arithmetic: $1 - 1000 \\cdot 1 = -999$, $2 - 1000 \\cdot 1.001 = 2 - 1001 = -999$. Back sub: $x_2 = -999/-999 = 1$ ✓... actually 3-digit arithmetic kills $b_2$: $1000 \\times 1.001 = 1001$, $2 - 1001 = -999$, $x_2 = -999/-999 = 1$. Then $x_1 = (1.001 - 1 \\cdot 1)/0.001 = 0.001/0.001 = 1$. In this case 3-digit arithmetic still works here — the disaster is worse for more digits.',
          strategyTitle: 'Elimination result',
        },
        {
          expression: '\\text{With pivoting: swap rows} \\Rightarrow \\begin{bmatrix}1&1\\\\0.001&1\\end{bmatrix}, \\quad m = 0.001/1 = 0.001',
          annotation: 'Swap to put the larger pivot (1) first. Now the multiplier is $0.001 \\leq 1$ — safe!',
          strategyTitle: 'Step 2: Pivoting gives multiplier ≤ 1',
        },
        {
          expression: 'R_2 \\leftarrow R_2 - 0.001 \\cdot R_1: \\begin{bmatrix}1&1\\\\0&0.999\\end{bmatrix}, \\quad b_2 = 1.001 - 0.001 \\times 2 = 0.999',
          annotation: 'With pivoting, $x_2 = 0.999/0.999 = 1$, $x_1 = (2 - 1)/1 = 1$. Both exact — pivoting controlled the multiplier and eliminated error amplification.',
          strategyTitle: 'Accurate solution with pivoting',
        },
      ],
    },
    {
      id: 'ex-la7-004-3',
      title: 'Numerically stable quadratic formula',
      problem: 'Solve $x^2 - 10000x + 1 = 0$ (exact roots $\\approx 10000$ and $0.0001$) in 4-digit arithmetic using (a) the standard formula and (b) the stable version.',
      steps: [
        {
          expression: 'x = \\frac{10000 \\pm \\sqrt{10000^2 - 4}}{2} = \\frac{10000 \\pm \\sqrt{99999996}}{2}',
          annotation: '',
          strategyTitle: 'Set up standard formula',
        },
        {
          expression: '\\sqrt{99999996} \\approx 9999.9998 \\approx 10000 \\text{ (4 digits)}',
          annotation: 'In 4-digit arithmetic: $\\sqrt{10^8 - 4} \\approx 10000$. The smaller root becomes $x_2 = (10000 - 10000)/2 = 0/2 = 0$ — catastrophic cancellation!',
          strategyTitle: 'Standard formula: smaller root cancels to 0 (wrong!)',
        },
        {
          expression: 'x_1 = \\frac{10000 + 10000}{2} = 10000 \\checkmark \\quad \\text{(larger root is fine)}',
          annotation: 'The larger root is accurate. Only the small root suffers cancellation.',
          strategyTitle: 'Larger root is correct',
        },
        {
          expression: 'x_1 = \\frac{10000 + 10000}{2} = 10000, \\quad x_2 = \\frac{c}{a \\cdot x_1} = \\frac{1}{1 \\cdot 10000} = 0.0001 \\checkmark',
          annotation: 'Stable strategy: compute the large root accurately by choosing the "+" sign when $b > 0$. Then use Vieta\'s formula $x_1 x_2 = c/a$ to get the small root without cancellation.',
          strategyTitle: 'Stable: use Vieta\'s formula for small root',
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la7-004-1',
      title: 'Stable quadratic formula derivation',
      difficulty: 'medium',
      problem: 'The standard quadratic formula $x = (-b \\pm \\sqrt{b^2-4ac})/(2a)$ is unstable for $x^2 - 1000x + 1 = 0$ (where $b^2 \\gg 4ac$). (a) Identify the cancellation, (b) compute the large root stably, and (c) use Vieta\'s formula to get the small root without cancellation.',
      hint: 'When $b > 0$: the minus sign gives two negative quantities (no cancellation) → large root. Then Vieta: $x_1 x_2 = c/a$.',
      walkthrough: [
        { expression: '\\text{Standard: }x = \\frac{1000 \\pm \\sqrt{10^6 - 4}}{2} = \\frac{1000 \\pm 999.998\\ldots}{2}', annotation: 'The "minus" root: $(1000 - 999.998)/2 \\approx 0.001$. This subtracts two nearly equal 4-digit numbers — cancellation!' },
        { expression: '\\text{4-digit arithmetic: }\\sqrt{999996}\\approx999.998\\approx1000\\Rightarrow x_2=(1000-1000)/2=0', annotation: 'In 4-digit arithmetic, the discriminant rounds to 1000, giving the wrong answer 0 instead of 0.001.' },
        { expression: 'x_1 = \\frac{1000 + \\sqrt{999996}}{2} \\approx \\frac{1000 + 1000}{2} = 1000', annotation: 'The large root (plus sign) has no cancellation: both terms are positive and far from equal.' },
        { expression: 'x_1 x_2 = c/a = 1 \\Rightarrow x_2 = 1/x_1 = 1/1000 = 0.001\\checkmark', annotation: 'Vieta\'s formula avoids all cancellation. Division by the accurately-computed large root gives the small root exactly.' },
        { expression: '\\text{Rule: for }b>0\\text{, compute }x_1=\\frac{-b-\\sqrt{b^2-4ac}}{2a}\\text{ (no cancel), then }x_2=\\frac{c}{ax_1}', annotation: 'General stable quadratic formula: choose sign to avoid cancellation, then use Vieta for the other root.' },
      ],
    },
    {
      id: 'ch-la7-004-2',
      title: 'Catastrophic cancellation in $(1 - \\cos x)/x^2$',
      difficulty: 'easy',
      problem: 'For $x = 10^{-8}$, the formula $(1 - \\cos x)/x^2$ should return approximately $1/2$. (a) Explain why direct computation gives $0$ in double precision. (b) Use the identity $1 - \\cos x = 2\\sin^2(x/2)$ to find a stable alternative and verify it gives $1/2$.',
      hint: 'In double precision, $\\cos(10^{-8}) \\approx 1.0000000000000000$ exactly — all 16 digits go to representing the integer part.',
      walkthrough: [
        { expression: '\\cos(10^{-8}) = 1 - \\tfrac{(10^{-8})^2}{2} + \\ldots = 1 - 5\\times10^{-17}+\\ldots', annotation: 'Mathematically, $\\cos(10^{-8})$ differs from 1 by $5\\times10^{-17}$.' },
        { expression: 'fl(\\cos(10^{-8})) = 1.0000000000000000\\text{ exactly}', annotation: 'In double precision, $\\varepsilon_\\text{mach}\\approx2.2\\times10^{-16}$. The difference $5\\times10^{-17}$ is below one unit in the last place of 1.0, so it rounds to exactly 1.' },
        { expression: 'fl(1 - fl(\\cos(10^{-8}))) = 1 - 1 = 0;\\quad (1-\\cos x)/x^2 = 0/(10^{-8})^2 = 0', annotation: 'All 16 significant digits were destroyed in one subtraction. The formula returns 0 instead of 1/2.' },
        { expression: '1-\\cos x = 2\\sin^2(x/2)\\Rightarrow\\frac{1-\\cos x}{x^2} = \\frac{2\\sin^2(x/2)}{x^2}', annotation: 'Stable form: $\\sin(x/2)\\approx x/2$ for small $x$, no near-equal subtraction.' },
        { expression: '\\frac{2\\sin^2(10^{-8}/2)}{(10^{-8})^2} = \\frac{2(5\\times10^{-9})^2}{10^{-16}} = \\frac{2\\times25\\times10^{-18}}{10^{-16}} = \\frac{1}{2}\\checkmark', annotation: 'The stable form computes $\\sin(5\\times10^{-9})\\approx5\\times10^{-9}$ directly (no cancellation) and returns the correct value $1/2$.' },
      ],
    },
    {
      id: 'ch-la7-004-3',
      title: 'Trace partial pivoting on a 3×3 matrix',
      difficulty: 'hard',
      problem: 'Carry out LU factorization with partial pivoting on $A = \\begin{bmatrix}2&1&1\\\\4&3&3\\\\8&7&9\\end{bmatrix}$. Record all row swaps, show each multiplier, and verify all $|l_{ij}| \\leq 1$.',
      hint: 'At each step, find the largest absolute value in the current column and swap. The multiplier is (row entry)/(pivot), which must be $\\leq 1$ after swapping.',
      walkthrough: [
        { expression: '\\text{Col 1: }\\max(|2|,|4|,|8|)=8\\text{ at row 3}\\Rightarrow\\text{swap rows 1 and 3}', annotation: 'Partial pivoting: move the largest column entry to the pivot position.' },
        { expression: '\\begin{bmatrix}8&7&9\\\\4&3&3\\\\2&1&1\\end{bmatrix};\\quad m_{21}=4/8=1/2,\\;m_{31}=2/8=1/4', annotation: 'Both multipliers $\\leq 1$ ✓ — this is guaranteed by choosing the maximum as pivot.' },
        { expression: 'R_2\\leftarrow R_2-\\tfrac{1}{2}R_1,\\;R_3\\leftarrow R_3-\\tfrac{1}{4}R_1:\\;\\begin{bmatrix}8&7&9\\\\0&-1/2&-3/2\\\\0&-3/4&-5/4\\end{bmatrix}', annotation: 'After eliminating column 1.' },
        { expression: '\\text{Col 2: }\\max(|-1/2|,|-3/4|)=3/4\\text{ at row 3}\\Rightarrow\\text{swap rows 2 and 3}', annotation: 'Partial pivoting again: row with larger magnitude subdiagonal entry moves up.' },
        { expression: '\\begin{bmatrix}8&7&9\\\\0&-3/4&-5/4\\\\0&-1/2&-3/2\\end{bmatrix};\\quad m_{32}=(-1/2)/(-3/4)=2/3\\leq1\\checkmark', annotation: 'Multiplier still $\\leq 1$ after swap.' },
        { expression: 'R_3\\leftarrow R_3-\\tfrac{2}{3}R_2:\\;U=\\begin{bmatrix}8&7&9\\\\0&-3/4&-5/4\\\\0&0&-2/3\\end{bmatrix}', annotation: '$-3/2 + (2/3)(5/4) = -3/2 + 5/6 = -9/6+5/6 = -2/3$. All pivots non-zero, all multipliers $\\leq 1$ ✓' },
      ],
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
    { id: 'cp-la7-004-1', label: 'Read: floating-point and catastrophic cancellation', type: 'read' },
    { id: 'cp-la7-004-2', label: 'Read: partial pivoting and backward stability', type: 'read' },
    { id: 'cp-la7-004-3', label: 'Read: mixed-precision and modern practice', type: 'read' },
    { id: 'cp-la7-004-4', label: 'Try: observe cancellation and fix it numerically', type: 'lab' },
    { id: 'cp-la7-004-5', label: 'Try: compare LU with and without pivoting', type: 'lab' },
    { id: 'cp-la7-004-6', label: 'Work: catastrophic cancellation in (1-cos x)/x^2', type: 'example' },
    { id: 'cp-la7-004-7', label: 'Work: stable quadratic formula', type: 'example' },
    { id: 'cp-la7-004-8', label: 'Challenge: stable quadratic formula derivation', type: 'challenge' },
  ],

  assessment: 'Explain why computing $e^x - 1$ directly is catastrophically inaccurate for small $x$, and describe a numerically stable alternative. (Hint: look up "expm1" in numerical libraries.)',

  quiz: [
    {
      id: 'q-la7-004-1',
      type: 'choice',
      text: 'Double-precision machine epsilon is approximately:',
      options: ['$10^{-7}$', '$10^{-12}$', '$10^{-16}$', '$10^{-32}$'],
      answer: '$10^{-16}$',
      hints: ['Double precision has 53 mantissa bits. $\\varepsilon_{\\text{mach}} = 2^{-52} \\approx 2.22 \\times 10^{-16}$. Single precision: $\\approx 10^{-7}$. Half precision: $\\approx 10^{-3}$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-004-2',
      type: 'choice',
      text: 'Partial pivoting in Gaussian elimination swaps rows to ensure:',
      options: ['The diagonal entries are all 1', 'All multipliers $|l_{ij}| \\leq 1$', 'The matrix is symmetric after elimination', 'All pivots equal $\\pm 1$'],
      answer: 'All multipliers $|l_{ij}| \\leq 1$',
      hints: ['By choosing the largest-magnitude element in the current column as the pivot, the multiplier $m = a_{ik}/a_{kk}$ satisfies $|m| \\leq 1$ by construction. This prevents error amplification in the elimination steps.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-004-3',
      type: 'choice',
      text: 'Catastrophic cancellation occurs when:',
      options: ['Two numbers are multiplied', 'Two nearly equal numbers are subtracted', 'A matrix is inverted', 'The condition number is 1'],
      answer: 'Two nearly equal numbers are subtracted',
      hints: ['When $a \\approx b$, computing $a - b$ in floating-point loses most significant digits. Both operands have rounding errors of order $\\varepsilon_{\\text{mach}}|a|$, but the difference is tiny, so the relative error in the result is huge: $\\varepsilon_{\\text{mach}}|a| / |a-b|$, which blows up as $a \\to b$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-004-4',
      type: 'choice',
      text: 'An algorithm is backward stable if:',
      options: ['It produces the exact answer', 'The computed solution solves a slightly perturbed problem exactly', 'The residual $\\|A\\hat{x}-b\\|$ is zero', 'It avoids all floating-point operations'],
      answer: 'The computed solution solves a slightly perturbed problem exactly',
      hints: ['Backward stability (Wilkinson): $\\hat{x}$ satisfies $(A+E)\\hat{x} = \\mathbf{b}$ where $\\|E\\| = O(\\varepsilon_{\\text{mach}}\\|A\\|)$. The forward error is then bounded by $\\kappa(A) \\cdot O(\\varepsilon_{\\text{mach}})$. It does NOT mean the answer is exact.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la7-004-5',
      type: 'choice',
      text: 'The computation $\\sqrt{x+1} - \\sqrt{x}$ for large $x$ suffers cancellation. Which rewrite is numerically stable?',
      options: ['$\\sqrt{x} - \\sqrt{x+1}$', '$1/(\\sqrt{x+1}+\\sqrt{x})$', '$\\sqrt{x^2+x}$', '$x/(\\sqrt{x+1}+\\sqrt{x})$'],
      answer: '$1/(\\sqrt{x+1}+\\sqrt{x})$',
      hints: ['Multiply top and bottom by $\\sqrt{x+1}+\\sqrt{x}$: $\\frac{(\\sqrt{x+1}-\\sqrt{x})(\\sqrt{x+1}+\\sqrt{x})}{\\sqrt{x+1}+\\sqrt{x}} = \\frac{(x+1)-x}{\\sqrt{x+1}+\\sqrt{x}} = \\frac{1}{\\sqrt{x+1}+\\sqrt{x}}$. The numerator 1 has no cancellation.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-004-6',
      type: 'choice',
      text: 'The growth factor $\\rho_n$ for LU with partial pivoting is bounded in theory by:',
      options: ['$n$', '$n^2$', '$2^{n-1}$', '$n!$'],
      answer: '$2^{n-1}$',
      hints: ['The theoretical worst-case growth factor for partial pivoting is $2^{n-1}$, achieved by specific "adversarial" matrices. However, in practice for random or typical engineering matrices, the growth factor is $O(n)$. This is why partial pivoting is used universally despite the theoretical bound.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la7-004-7',
      type: 'choice',
      text: 'In $fl(x \\circ y) = (x \\circ y)(1+\\delta)$, the value $\\delta$ satisfies:',
      options: ['$|\\delta| \\leq \\varepsilon_{\\text{mach}}$', '$|\\delta| \\leq n \\varepsilon_{\\text{mach}}$', '$\\delta = \\varepsilon_{\\text{mach}}$', '$\\delta = 0$ for addition'],
      answer: '$|\\delta| \\leq \\varepsilon_{\\text{mach}}$',
      hints: ['The IEEE 754 standard guarantees: each basic operation ($+,-,\\times,\\div$, and $\\sqrt{\\cdot}$) is performed with relative error $|\\delta| \\leq \\varepsilon_{\\text{mach}}$. This is the "fundamental axiom" of floating-point. After $n$ operations, errors can accumulate to $O(n\\varepsilon_{\\text{mach}})$.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la7-004-8',
      type: 'choice',
      text: 'Which computation is susceptible to catastrophic cancellation?',
      options: ['$x^2 + y^2$', '$e^x - 1$ for small $x$', '$\\sqrt{x^2 + y^2}$', '$\\sin(x) \\cdot \\cos(y)$'],
      answer: '$e^x - 1$ for small $x$',
      hints: ['For small $x$, $e^x \\approx 1 + x$, so $e^x - 1 \\approx x$. But $e^x$ rounds to $1 + \\varepsilon_{\\text{mach}}$ in floating-point, and the subtraction of 1 leaves only the rounding noise. The stable alternative is the `expm1(x)` function available in most math libraries.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-004-9',
      type: 'choice',
      text: 'Mixed-precision iterative refinement solves a system first in low precision, then:',
      options: ['Restarts from scratch in high precision', 'Computes a high-precision residual and solves a correction equation', 'Averages low- and high-precision solutions', 'Applies partial pivoting in high precision'],
      answer: 'Computes a high-precision residual and solves a correction equation',
      hints: ['Refinement: (1) Solve $A\\hat{x}_0 \\approx b$ in low precision. (2) Compute residual $r = b - A\\hat{x}_0$ in high precision. (3) Solve $Ae = r$ in low precision. (4) Update $\\hat{x}_1 = \\hat{x}_0 + e$. Repeat until convergence. This achieves high-precision accuracy at low-precision cost.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la7-004-10',
      type: 'choice',
      text: 'The standard quadratic formula for $x^2 - 1000x + 1 = 0$ computes the smaller root incorrectly. The fix is to compute the larger root accurately and then use:',
      options: ['Newton\'s method', 'Vieta\'s formula: $x_1 x_2 = c/a$', 'The discriminant formula again with higher precision', 'Gaussian elimination'],
      answer: 'Vieta\'s formula: $x_1 x_2 = c/a$',
      hints: ['If $x_1 \\approx 1000$ (large root, computed accurately), then $x_2 = (c/a)/x_1 = 1/1000 = 0.001$ with full precision. No cancellation occurs in division. Vieta\'s formula $x_1 x_2 = c/a$ and $x_1 + x_2 = -b/a$ are the key tools for stabilizing the quadratic formula.'],
      reviewSection: 'intuition',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Identify a computation susceptible to catastrophic cancellation and rewrite it algebraically to avoid it. Explain why partial pivoting prevents unstable error growth in LU factorization.',
    explainVerbally: 'Explain the difference between forward and backward error, and why a backward-stable algorithm can still give an inaccurate answer for ill-conditioned problems.',
    detectIncorrectApplication: 'Recognize when a student concludes an algorithm is "wrong" because it gives an inaccurate answer for an ill-conditioned problem, when in fact the algorithm is backward stable and the issue is conditioning.',
    transferToUnfamiliar: 'Given a new computation (e.g., evaluating a continued fraction or computing a sum of alternating terms), identify whether it is susceptible to cancellation and propose a stable reformulation.',
  },

  misconceptions: [
    {
      falseBelief: 'Floating-point arithmetic is exact as long as numbers are not too large.',
      whyStudentsThinkIt: 'Students think overflow is the only floating-point problem. They do not realize that most real numbers cannot be represented exactly in binary floating-point.',
      correctionExample: '$0.1$ cannot be represented exactly in binary floating-point: $0.1 = 0.0001100110011\\ldots_2$ (repeating). So `0.1 + 0.2` in Python gives `0.30000000000000004`, not `0.3`. Every non-dyadic fraction (one whose denominator is not a power of 2) introduces rounding error.',
      contrastCase: 'Numbers like $0.5, 0.25, 0.125$ (powers of $1/2$) ARE exactly representable in binary. Integer arithmetic in floating-point is exact up to about $2^{53} \\approx 9 \\times 10^{15}$.',
    },
    {
      falseBelief: 'A backward-stable algorithm always gives an accurate answer.',
      whyStudentsThinkIt: 'Students learn "backward stability is good" and conclude it guarantees accuracy.',
      correctionExample: 'Forward error = (condition number) × (backward error). If $\\kappa(A) = 10^{15}$ and backward error $= \\varepsilon_{\\text{mach}} \\approx 10^{-16}$, then forward error $\\approx 10^{-1}$ — 10% error! The algorithm did nothing wrong; the problem itself is nearly unsolvable numerically.',
      contrastCase: 'Backward stability guarantees the algorithm made no additional errors. But if the problem is ill-conditioned, even a perfectly-implemented algorithm cannot achieve accuracy beyond $\\kappa(A) \\cdot \\varepsilon_{\\text{mach}}$.',
    },
  ],

  transferPrompts: [
    {
      situation: 'Computing the sample variance of a dataset: $s^2 = \\frac{1}{n}\\sum(x_i - \\bar{x})^2$. The naive one-pass formula $s^2 = \\overline{x^2} - \\bar{x}^2$ is commonly used.',
      competingTechniques: 'One-pass formula vs two-pass formula (compute mean first, then deviations).',
      whyThisTechniqueWins: 'The one-pass formula $\\overline{x^2} - \\bar{x}^2$ involves catastrophic cancellation when values are large and variance is small (e.g., all values near $10^6$ with variance $1$). The two-pass formula or Welford\'s online algorithm avoids cancellation. This is catastrophic cancellation applied to statistics.',
    },
    {
      situation: 'A gradient descent optimizer accumulates parameter updates across millions of iterations. After $10^6$ steps, the parameters have drifted from their true values.',
      competingTechniques: 'Standard float32 updates vs Kahan summation vs float64 accumulation.',
      whyThisTechniqueWins: 'Kahan summation maintains a "compensation" variable to capture lost low-order bits, reducing accumulated error from $O(n\\varepsilon)$ to $O(\\varepsilon)$ regardless of $n$. This is the numerical stability principle applied to iterative optimization.',
    },
  ],

  semantics: {
    core: [
      { symbol: '\\varepsilon_\\text{mach} \\approx 2.2\\times10^{-16}', meaning: 'Machine epsilon (double precision): the gap between 1.0 and the next representable number. Every floating-point operation introduces relative error $\\leq \\varepsilon_\\text{mach}$.' },
      { symbol: 'fl(a \\circ b) = (a\\circ b)(1+\\delta),\\;|\\delta|\\leq\\varepsilon_\\text{mach}', meaning: 'IEEE 754 fundamental axiom: each basic operation is performed in infinite precision then rounded. The relative error per operation is bounded by $\\varepsilon_\\text{mach}$.' },
      { symbol: '\\text{catastrophic cancellation}', meaning: 'Subtraction of two nearly equal numbers $a \\approx b$: the result $a - b$ is tiny while both $a$ and $b$ carry absolute errors of order $\\varepsilon_\\text{mach}|a|$. The relative error in $a - b$ can be $\\varepsilon_\\text{mach}|a|/|a-b| \\gg 1$.' },
      { symbol: '\\text{backward stable}', meaning: 'An algorithm is backward stable if the computed output is the exact output for a slightly perturbed input: $\\tilde{f}(x) = f(x + \\delta x)$ with $\\|\\delta x\\|/\\|x\\| = O(\\varepsilon_\\text{mach})$. Combined with $\\kappa$: forward error $\\lesssim \\kappa(A)\\,\\varepsilon_\\text{mach}$.' },
      { symbol: '|l_{ij}| \\leq 1', meaning: 'Partial-pivoting multiplier bound: by swapping to the largest pivot before each elimination step, all multipliers stay $\\leq 1$ in magnitude, preventing unstable error amplification.' },
      { symbol: '\\rho_n = \\|U\\|_\\infty/\\|A\\|_\\infty', meaning: 'Growth factor for LU: measures how much entries grow during elimination. Partial pivoting bounds $\\rho_n \\leq 2^{n-1}$ in theory; in practice $\\rho_n = O(n)$ for real-world matrices.' },
    ],
    rulesOfThumb: [
      'Every floating-point operation introduces relative error $\\leq \\varepsilon_\\text{mach}$. Catastrophic cancellation can consume ALL digits in a single subtraction.',
      'To fix cancellation: rationalize (multiply by conjugate), use Taylor series for small arguments, or use identity transformations to avoid near-equal subtractions.',
      'Partial pivoting makes LU backward stable: all multipliers $\\leq 1$, growth factor stays small for typical matrices.',
      'Backward stable + well-conditioned → accurate. Backward stable + ill-conditioned → inaccurate (but the algorithm is blameless).',
      'Never compare floats with ==. Use $|a - b| < \\varepsilon \\cdot \\max(|a|, |b|, 1)$ with a problem-appropriate tolerance.',
    ],
  },

  spiral: {
    recoveryPoints: ['la7-003'],
    futureLinks: ['la7-005', 'la7-006'],
  },

  debugging: [
    {
      commonError: 'Comparing floating-point numbers with `==` and getting wrong results.',
      symptom: 'Two computations that should give the same mathematical result compare as unequal, causing incorrect branching.',
      whyItHappened: 'Floating-point arithmetic is not exact — different computation paths accumulate errors differently, even for mathematically equal values. `0.1 + 0.2 == 0.3` is false in most languages.',
      repairStrategy: 'Never compare floats for exact equality. Use $|a - b| < \\varepsilon$ for some tolerance $\\varepsilon$ appropriate to the problem. For relative comparison: $|a-b| < \\varepsilon \\max(|a|, |b|, 1)$.',
    },
    {
      commonError: 'Running LU factorization without pivoting on a matrix with a near-zero diagonal entry.',
      symptom: 'Division by a tiny pivot amplifies errors; the computed solution is completely wrong even though no error message is raised.',
      whyItHappened: 'Without pivoting, the algorithm uses diagonal entries as pivots in order. A near-zero early pivot means a huge multiplier, causing massive error growth in subsequent steps.',
      repairStrategy: 'Always use LU with partial pivoting (e.g., `lu(A)` in MATLAB returns $P, L, U$ with $PA = LU$). Check the condition number before solving. If $\\kappa(A) \\gg 1/\\varepsilon_{\\text{mach}}$, the system is numerically singular.',
    },
  ],
};
