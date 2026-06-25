export default {
  id: 'la5-002',
  slug: 'solving-systems-python',
  chapter: 'la5',
  order: 2,
  title: 'Solving Linear Systems in Python',
  subtitle: 'From `np.linalg.solve` to least squares: choosing the right tool and reading what the answer actually means.',
  tags: ['numpy', 'scipy', 'python', 'linear systems', 'least squares', 'conditioning'],
  aliases: 'solve lstsq linear system overdetermined inconsistent residual condition number numpy scipy',

  hook: {
    question: 'You wrote `np.linalg.solve(A, b)` and got an answer. How do you know it\'s correct?',
    realWorldContext: 'Every scientific computing problem bottoms out in solving a linear system. GPS receivers solve a 4×4 system to find your position. Finite element simulators solve systems with millions of unknowns. The code is always one line — `solve(A, b)`. The skill is in the three lines around it: checking whether `A` is safe to solve, verifying the answer, and knowing what to do when the system has no exact solution.',
  },

  intuition: {
    prose: [
      '**Three questions before you solve:** (1) Is $A$ square? If not, use `lstsq`. (2) Is $A$ well-conditioned? If `np.linalg.cond(A) > 1e12`, the answer may be meaningless. (3) Does the solution actually satisfy $A\\mathbf{x}=\\mathbf{b}$? Always check `np.linalg.norm(A @ x - b)` after solving.',
      '**`solve` vs `lstsq`:** `solve` requires a square invertible $A$ and returns the exact solution. `lstsq` works for any $A$ (including overdetermined $m > n$ and underdetermined $m < n$ systems) and returns the minimum-norm least-squares solution. For square, well-conditioned $A$, both give the same answer — but `solve` is faster.',
      '**Reading the residual:** After `x = np.linalg.solve(A, b)`, compute `r = A @ x - b`. If `np.linalg.norm(r)` is near `np.finfo(float).eps * np.linalg.norm(b)` (machine epsilon times the scale of `b`), the solution is as accurate as floating-point allows. If it\'s much larger, the system is ill-conditioned.',
      '**The condition number is a warning label:** `kappa = np.linalg.cond(A)`. If $\\kappa = 10^k$, you lose approximately $k$ significant digits from the answer. Double precision has 16 digits. $\\kappa = 10^{12}$ leaves only 4 reliable digits.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Never invert a matrix to solve a system',
        body: '`x = np.linalg.inv(A) @ b` is slower and less accurate than `x = np.linalg.solve(A, b)`. `inv` computes an entire $n\\times n$ matrix you never need. `solve` finds $\\mathbf{x}$ directly via LU factorization + two triangular solves.',
      },
      {
        type: 'insight',
        title: 'The Three System Types',
        body: '| System | Shape of A | Tool | Result |\n|---|---|---|---|\n| Square, invertible | n×n | `solve` | Unique exact solution |\n| Overdetermined ($m>n$) | m×n | `lstsq` | Minimum residual |\n| Underdetermined ($m<n$) | m×n | `lstsq` | Minimum norm solution |\n| Rank-deficient | any | `lstsq` | Minimum-norm least-squares |',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Solving Linear Systems: A Complete Workflow',
        mathBridge: 'Each cell adds one step to the workflow: set up → check conditioning → solve → verify. Skip any step and you risk a wrong answer you trust.',
        caption: 'Run cells in order. The residual check in cell 4 is not optional.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Step 1: Set up and check conditioning',
              prose: ['Before solving, compute the condition number. If κ > 1e12, the answer may have no correct digits.'],
              code: `import numpy as np

A = np.array([[4., 3.],
              [6., 3.]])
b = np.array([10., 12.])

kappa = np.linalg.cond(A)
print(f"Condition number κ = {kappa:.2f}")
print(f"Digits lost ≈ {np.log10(kappa):.1f} out of 16")
print(f"Safe to solve: {kappa < 1e12}")`,
              status: 'idle',
            },
            {
              id: 2,
              cellTitle: 'Step 2: Solve and verify',
              prose: ['Call solve, then immediately verify the residual. A correct solve has residual near machine epsilon × ‖b‖.'],
              code: `x = np.linalg.solve(A, b)
print(f"Solution: x = {x}")

# Verify: compute residual
residual = A @ x - b
print(f"Residual ‖Ax - b‖ = {np.linalg.norm(residual):.2e}")
print(f"Machine epsilon × ‖b‖ = {np.finfo(float).eps * np.linalg.norm(b):.2e}")
print(f"Solution verified: {np.linalg.norm(residual) < 1e-10}")`,
              status: 'idle',
            },
            {
              id: 3,
              cellTitle: 'Step 3: Overdetermined system — least squares',
              prose: ['Three equations, two unknowns — no exact solution. lstsq finds x that minimises ‖Ax - b‖².'],
              code: `# Three data points: fit y = c0 + c1*t
t = np.array([0., 1., 2.])
y = np.array([1., 2.5, 3.8])

# Build A: column of 1s + column of t values
A_over = np.column_stack([np.ones_like(t), t])
print(f"A shape: {A_over.shape}  (overdetermined: more rows than unknowns)")

# Solve: lstsq returns (solution, residuals, rank, singular values)
result = np.linalg.lstsq(A_over, y, rcond=None)
coeffs, residuals, rank, singular_values = result

print(f"Best-fit line: y = {coeffs[0]:.4f} + {coeffs[1]:.4f} * t")
print(f"Rank of A: {rank}")
print(f"Residual squared: {residuals[0]:.4f}")`,
              status: 'idle',
            },
            {
              id: 4,
              cellTitle: 'Step 4: Diagnosing an ill-conditioned system',
              prose: ['An ill-conditioned system gives an answer that looks plausible but is wrong. The condition number and residual together reveal this.'],
              code: `# A nearly singular matrix (rows are nearly proportional)
A_bad = np.array([[1., 1.],
                  [1., 1. + 1e-10]])
b_bad = np.array([2., 2. + 1e-10])

kappa_bad = np.linalg.cond(A_bad)
print(f"Condition number: {kappa_bad:.2e}")
print(f"Digits lost: ~{np.log10(kappa_bad):.0f} out of 16")

x_bad = np.linalg.solve(A_bad, b_bad)
print(f"'Solution': {x_bad}")

# The residual looks fine — but the solution itself is unreliable
residual_bad = A_bad @ x_bad - b_bad
print(f"Residual ‖Ax - b‖: {np.linalg.norm(residual_bad):.2e}  (looks OK!)")
print("⚠ Small residual does NOT mean correct solution for ill-conditioned A")`,
              status: 'idle',
            },
            {
              id: 5,
              cellTitle: 'Step 5: LU factorization reuse for multiple right-hand sides',
              prose: ['Factor A once ($O(n^3)$), then solve for each b in $O(n^2)$. Essential when solving the same system repeatedly.'],
              code: `import scipy.linalg

A = np.array([[4., 3.], [6., 3.]])
b_list = [np.array([10., 12.]),
          np.array([7., 9.]),
          np.array([1., 3.])]

# Factor once
lu, piv = scipy.linalg.lu_factor(A)
print("LU factorization computed once.")

# Solve three times using the same factorization
for i, b_i in enumerate(b_list):
    x_i = scipy.linalg.lu_solve((lu, piv), b_i)
    print(f"b{i+1} → x = {x_i},  residual = {np.linalg.norm(A @ x_i - b_i):.1e}")`,
              status: 'idle',
            },
          ],
        },
      },
    ],
  },

  math: {
    keyEquations: [
      { label: 'Least squares normal equations', equation: 'A^\\top A \\hat{\\mathbf{x}} = A^\\top \\mathbf{b}' },
      { label: 'Residual (error in fit)', equation: '\\mathbf{r} = \\mathbf{b} - A\\hat{\\mathbf{x}}' },
      { label: 'Solution error bound', equation: '\\frac{\\|\\delta \\mathbf{x}\\|}{\\|\\mathbf{x}\\|} \\leq \\kappa(A) \\frac{\\|\\delta \\mathbf{b}\\|}{\\|\\mathbf{b}\\|}' },
    ],
  },

  walkthroughs: [
    {
      id: 'wt-la5-002-solve-workflow',
      title: 'The Complete Solve Workflow: Check → Solve → Verify',
      prereqs: ['LU factorization', 'Condition number', 'Residual'],
      problem: 'Solve $\\begin{bmatrix}4&3\\\\6&3\\end{bmatrix}\\mathbf{x}=[10,12]^\\top$ in Python, applying the full three-step workflow.',
      steps: [
        {
          label: 'Step 1: Check the condition number before solving',
          strategy: 'Never solve a system without checking κ(A) first. If κ > 1/εmach ≈ 10¹², the answer is numerically meaningless regardless of the algorithm.',
          explanation: '`np.linalg.cond(A)` computes $\\kappa_2(A) = \\sigma_{\\max}/\\sigma_{\\min}$ via SVD. Here κ ≈ 6 — excellent. A κ of 6 means we lose at most $\\log_{10}(6) \\approx 0.8$ digits of precision, leaving 15 reliable digits.',
          math: '\\kappa_2(A) = \\frac{\\sigma_{\\max}}{\\sigma_{\\min}} \\approx 6 \\Rightarrow \\text{well-conditioned}',
        },
        {
          label: 'Step 2: Call `np.linalg.solve(A, b)`',
          strategy: '`solve` dispatches to LAPACK `dgesv`: computes $PA=LU$, solves $L\\mathbf{y}=P\\mathbf{b}$, then $U\\mathbf{x}=\\mathbf{y}$. Two triangular solves.',
          explanation: 'LAPACK applies partial pivoting (always swaps to the largest entry in each column) before factoring. This keeps the multipliers $|\\ell_{ij}|\\leq 1$ and bounds error growth. The permutation $P$ records the row swaps.',
          math: 'PA = LU \\Rightarrow L\\mathbf{y}=P\\mathbf{b} \\Rightarrow U\\mathbf{x}=\\mathbf{y} \\Rightarrow \\mathbf{x}=[1,2]^\\top',
        },
        {
          label: 'Step 3: Always verify the residual `A @ x - b`',
          strategy: 'A correct solve produces a residual near machine epsilon × ‖b‖. Larger residuals signal either a bug (wrong A or b) or an ill-conditioned matrix.',
          explanation: '`r = A @ x - b`. If `norm(r)` ≈ 1e-15 and `norm(b)` ≈ 10, the relative residual is 1e-16 — machine precision. If `norm(r)` ≈ 1e-3, something is wrong: either the system is ill-conditioned, or there\'s a code error.',
          math: '\\|A\\mathbf{x}-\\mathbf{b}\\| \\approx \\varepsilon_{\\text{mach}}\\|\\mathbf{b}\\| \\approx 10^{-15} \\checkmark',
          gotcha: 'A small residual does NOT guarantee a correct solution for ill-conditioned systems. If $\\kappa = 10^{12}$, the residual can be tiny while the solution vector is completely wrong. The residual check and the condition number check are BOTH required.',
        },
      ],
    },
    {
      id: 'wt-la5-002-lstsq-workflow',
      title: 'Fitting a Line with `lstsq`: Reading Every Output',
      prereqs: ['Least squares', 'Overdetermined systems', 'Residual'],
      problem: 'Fit $y = c_0 + c_1 t$ to the points $(0,1)$, $(1,2.5)$, $(2,3.8)$ using `np.linalg.lstsq` and interpret all four returned values.',
      steps: [
        {
          label: 'Build the design matrix $A$ (column of 1s + column of $t$)',
          strategy: 'Each row of $A$ corresponds to one data point. Column 1 is 1 (for the intercept $c_0$); column 2 is $t$ (for the slope $c_1$). `np.column_stack` assembles them.',
          explanation: '`A = np.column_stack([np.ones_like(t), t])` produces $A = \\begin{bmatrix}1&0\\\\1&1\\\\1&2\\end{bmatrix}$. The system $A\\mathbf{c}=\\mathbf{y}$ has 3 equations and 2 unknowns — overdetermined. No exact solution exists.',
          math: 'A = \\begin{bmatrix}1&0\\\\1&1\\\\1&2\\end{bmatrix},\\quad \\mathbf{y}=\\begin{bmatrix}1\\\\2.5\\\\3.8\\end{bmatrix}',
        },
        {
          label: 'Call `lstsq` and unpack the four return values',
          strategy: '`lstsq` returns a 4-tuple: `(solution, residuals, rank, singular_values)`. Read all four — most bugs come from ignoring `rank` or `residuals`.',
          explanation: '`coeffs` = $\\hat{\\mathbf{c}}$ (the best-fit coefficients). `residuals` = $\\|A\\hat{\\mathbf{c}}-\\mathbf{y}\\|^2$ (sum of squared errors; empty if `A` is rank-deficient or non-overdetermined). `rank` = number of linearly independent columns of $A$. `singular_values` = the singular values of $A$.',
          math: '\\hat{\\mathbf{c}} = \\text{argmin}_{\\mathbf{c}}\\|A\\mathbf{c}-\\mathbf{y}\\|^2',
          gotcha: 'Always pass `rcond=None` to suppress the deprecation warning about the default tolerance. The `rcond` parameter controls which singular values are treated as zero (rank determination). Setting it to `None` uses the machine-epsilon-based default, which is correct for most problems.',
        },
        {
          label: 'Interpret `rank`: is the problem well-posed?',
          strategy: 'If `rank < n` (number of unknowns), the columns of $A$ are linearly dependent — the fit is underdetermined and there are infinitely many solutions.',
          explanation: 'Here `rank=2` (both columns of $A$ are independent) so there is a unique best-fit line. If both columns of $A$ were identical (e.g., someone accidentally duplicated the $t$ column), `rank=1` and the line would not be uniquely defined.',
          math: '\\text{rank}(A) = 2 = n \\Rightarrow \\text{unique solution}',
        },
        {
          label: 'Compute and plot the fit',
          strategy: 'Evaluate $\\hat{y}(t) = \\hat{c}_0 + \\hat{c}_1 t$ at the data points and compute the per-point errors to understand the fit quality.',
          explanation: '`y_fit = A @ coeffs`. Per-point errors: `y - y_fit`. These should not all have the same sign (systematic bias would suggest a quadratic fit is better).',
          math: '\\hat{y}(t) = \\hat{c}_0 + \\hat{c}_1 t,\\quad \\hat{c}_0\\approx1.017,\\;\\hat{c}_1\\approx1.4',
        },
      ],
    },
  ],

  examples: [
    {
      id: 'la5-002-ex1',
      title: 'Diagnosing a Near-Singular System',
      problem: 'The system $A = \\begin{bmatrix}1&1\\\\1&1+\\varepsilon\\end{bmatrix}$, $\\mathbf{b}=[2,2+\\varepsilon]^\\top$ for $\\varepsilon=10^{-10}$. Solve it, check the condition number, and explain what the solution means.',
      solution: 'κ(A) ≈ 4/ε = 4×10¹⁰. The solution x=[1,1]ᵀ is mathematically correct but has only 16-10=6 reliable digits. The residual ‖Ax-b‖ is tiny (misleading). Small residual ≠ accurate solution for ill-conditioned systems.',
      steps: [
        'Compute `kappa = np.linalg.cond(A)` → ~4e10. Log₁₀(kappa)≈10.6 → 10 digits lost from 16.',
        'Solve: `x = np.linalg.solve(A, b)` → looks like [1,1] but last 10 digits are noise.',
        'Verify: `np.linalg.norm(A @ x - b)` → near 1e-16 (small, but misleading here).',
        'Correct interpretation: the answer has only 5-6 significant figures, not 15.',
      ],
    },
    {
      id: 'la5-002-ex2',
      title: 'Solving a System with Multiple Right-Hand Sides Efficiently',
      problem: 'You need to solve $A\\mathbf{x}=\\mathbf{b}_1$, $A\\mathbf{x}=\\mathbf{b}_2$, $A\\mathbf{x}=\\mathbf{b}_3$ for the same 100×100 matrix $A$. What is the computational cost of the naive approach vs the factorization-reuse approach?',
      solution: 'Naive: 3 × O(n³) = 3 × 10⁶ ops. Factorization reuse: O(n³) + 3 × O(n²) = 10⁶ + 3×10⁴ ≈ 10⁶ ops. At n=10,000: naive costs 3×10¹² ops; reuse costs 10¹² + 3×10⁸ — a 3× speedup that grows with n.',
      steps: [
        'Call `lu, piv = scipy.linalg.lu_factor(A)` once — $O(n^3)$ work.',
        'For each $\\mathbf{b}_i$: call `x_i = scipy.linalg.lu_solve((lu, piv), b_i)` — $O(n^2)$ each.',
        'Total: $O(n^3) + k \\times O(n^2)$ for $k$ right-hand sides vs $k \\times O(n^3)$ naive.',
      ],
    },
  ],

  challenges: [
    {
      id: 'la5-002-ch1',
      title: 'Full diagnosis workflow',
      difficulty: 'medium',
      challengeType: 'write',
      prompt: 'Write a Python function `safe_solve(A, b, kappa_limit=1e10)` that: (1) checks the condition number and raises a `ValueError` if it exceeds `kappa_limit`, (2) solves the system, (3) verifies the residual, and (4) returns the solution with a printed residual. Test it on a well-conditioned and an ill-conditioned matrix.',
      hint: 'Use `np.linalg.cond`, `np.linalg.solve`, and `np.linalg.norm`. The residual check: `norm(A @ x - b) / norm(b)` should be near `eps`.',
    },
    {
      id: 'la5-002-ch2',
      title: 'Polynomial regression',
      difficulty: 'hard',
      challengeType: 'write',
      prompt: 'Fit a degree-3 polynomial $y = c_0+c_1t+c_2t^2+c_3t^3$ to the data points $t=[0,1,2,3,4]$, $y=[1,3,7,13,21]$. Build the Vandermonde matrix using `np.vander(t, 4, increasing=True)`, solve with `lstsq`, and verify the fit quality with the residual.',
      hint: '`np.vander(t, 4, increasing=True)` gives columns $[1, t, t^2, t^3]$. Compare `rank` of the Vandermonde matrix to the number of unknowns.',
    },
  ],

  semantics: {
    core: [
      { symbol: '\\mathtt{np.linalg.solve}(A, b)', meaning: 'Solves square Ax=b via LU factorization with partial pivoting (LAPACK dgesv). Faster and more stable than inv(A) @ b.' },
      { symbol: '\\mathtt{np.linalg.lstsq}(A, b)', meaning: 'Minimum-norm least-squares solution for any shaped A. Works for overdetermined (m>n), underdetermined (m<n), and rank-deficient systems.' },
      { symbol: '\\mathtt{np.linalg.cond}(A)', meaning: 'Condition number κ(A) = σ_max/σ_min. log₁₀(κ) ≈ number of digits lost from the solution.' },
      { symbol: '\\mathtt{scipy.linalg.lu\\_factor}(A)', meaning: 'Computes the LU factorization once and returns (lu, piv) for reuse. Pair with lu_solve for multiple right-hand sides.' },
    ],
    rulesOfThumb: [
      'Always check cond(A) before trusting a solution.',
      'Always verify the residual ‖Ax-b‖ after solving.',
      'Use solve for square systems, lstsq for overdetermined/underdetermined.',
      'Use lu_factor + lu_solve when solving the same A with many right-hand sides.',
      'Small residual does NOT mean accurate solution when κ is large.',
    ],
  },

  quiz: [
    {
      id: 'la5-002-q1',
      question: '`np.linalg.lstsq(A, b)` returns a 4-tuple. What does the second element (index 1) represent?',
      options: ['The rank of A', 'The sum of squared residuals ‖Ax̂ - b‖²', 'The singular values of A', 'The condition number of A'],
      answer: 1,
      explanation: 'The second return value is the sum of squared residuals ‖Ax̂ - b‖². Note: this is empty (zero-length array) if A is not overdetermined (m ≤ n) or if A is rank-deficient.',
    },
    {
      id: 'la5-002-q2',
      question: 'A system has condition number κ = 10⁸. The residual ‖Ax-b‖ = 10⁻¹⁵. Should you trust the solution?',
      options: [
        'Yes — the residual is near machine precision, so the solution is accurate.',
        'No — with κ = 10⁸, you lose 8 digits of precision, leaving only ~8 correct digits despite the tiny residual.',
        'No — the residual should be exactly 0 for a correct solution.',
        'Yes — the condition number only matters for iterative solvers.',
      ],
      answer: 1,
      explanation: 'Small residual is necessary but NOT sufficient for accuracy. With κ = 10⁸, the error bound is κ × εmach × ‖b‖ — you lose 8 of 16 significant digits. The residual can be tiny while the solution has only ~8 correct digits.',
    },
  ],
}
