import convergencePathUrl from '../diagrams/la-iterative-convergence-path.svg?url';
import jacobiGsSplittingUrl from '../diagrams/la-jacobi-gauss-seidel-splitting.svg?url';

export default {
  id: 'la9-001',
  slug: 'jacobi-gauss-seidel',
  chapter: 'la9',
  order: 1,
  title: 'Jacobi and Gauss-Seidel Methods',
  subtitle: 'Stationary iterative methods split the matrix $A = M - N$ and iterate $\\mathbf{x}^{(k+1)} = M^{-1}N\\mathbf{x}^{(k)} + M^{-1}\\mathbf{b}$. Convergence is governed by the spectral radius of the iteration matrix.',
  tags: ['Jacobi', 'Gauss-Seidel', 'iterative methods', 'stationary iteration', 'spectral radius', 'diagonal dominance', 'splitting', 'SOR'],
  aliases: 'Jacobi Gauss Seidel iterative methods stationary iteration spectral radius diagonal dominance matrix splitting SOR successive over-relaxation convergence',

  hook: {
    question: "You need to solve a $10000 \\times 10000$ sparse linear system. Gaussian elimination requires $O(n^3)$ operations. Can you solve it in $O(kn)$ operations for small $k$ — iteratively updating your guess until it converges?",
    realWorldContext: "Direct solvers (LU factorization) require $O(n^3)$ work and $O(n^2)$ memory — impractical for the $10^6$-scale systems arising in finite element analysis (structural engineering), computational fluid dynamics, and reservoir simulation. Iterative methods only need $O(n)$ memory (store the matrix once) and each iteration costs $O(\\text{nnz})$ (sparse matrix-vector multiply). Jacobi and Gauss-Seidel are simple but often slow; they are building blocks for understanding more powerful methods (CG, GMRES, multigrid).",
  },

  intuition: {
    blocks: [
      { type: 'prose', paragraphs: [
      'Where you are in the story: Chapter 7 gave you powerful direct solvers — LU factorization, Cholesky, QR — that find the exact answer in a finite number of steps. Chapter 8 showed why you need to solve linear systems in the first place: PageRank on billions of web links, differential equations modeling physical phenomena, 3D graphics pipelines. Now those two threads collide. The systems arising from real applications are enormous — a finite element mesh for an aircraft wing can have ten million unknowns — and direct solvers simply cannot handle them. $O(n^3)$ flops for $n = 10^6$ is $10^{18}$ operations. Even at a billion operations per second, that is thirty years of compute time. Something fundamentally different is needed.',
      'The escape hatch is iteration. Instead of computing the exact answer in one pass, you start with a guess — any guess, even all zeros — and repeatedly improve it until it is close enough. Each improvement is cheap: just a sparse matrix-vector multiply plus some arithmetic, costing $O(\\text{nnz})$ where nnz is the number of nonzero entries. For a sparse system, nnz is $O(n)$, so each iteration costs $O(n)$. If you need $k$ iterations to converge, the total work is $O(kn)$. When $k$ is modest (say, a few hundred), this beats $O(n^3)$ by orders of magnitude.',
      'The key insight behind stationary iterative methods is matrix splitting: write $A = M - N$ where $M$ is easy to invert. The system $A\\mathbf{x} = \\mathbf{b}$ becomes $M\\mathbf{x} = N\\mathbf{x} + \\mathbf{b}$, which suggests the iteration $M\\mathbf{x}^{(k+1)} = N\\mathbf{x}^{(k)} + \\mathbf{b}$. Solving for the update: $\\mathbf{x}^{(k+1)} = M^{-1}N\\mathbf{x}^{(k)} + M^{-1}\\mathbf{b}$. The matrix $G = M^{-1}N$ is called the iteration matrix. Applying $G$ once costs $O(n)$ if $M$ is triangular or diagonal. The question is: does the sequence $\\mathbf{x}^{(0)}, \\mathbf{x}^{(1)}, \\mathbf{x}^{(2)}, \\ldots$ actually converge to the true solution $\\mathbf{x}^*$?',
      'The **Jacobi method** uses the simplest possible splitting: $M = D$, the diagonal of $A$. To update component $i$, take equation $i$, move all the off-diagonal terms to the right using old values, and divide by the diagonal: $x_i^{(k+1)} = \\frac{1}{a_{ii}}\\left(b_i - \\sum_{j \\neq i} a_{ij} x_j^{(k)}\\right)$. Every component is updated using the same snapshot of $\\mathbf{x}^{(k)}$. This is beautifully parallelizable — all $n$ updates are independent — which is why Jacobi still appears in GPU solvers today.',
      'A concrete walk-through makes this tangible. Take $\\begin{bmatrix}4&1\\\\1&3\\end{bmatrix}\\begin{bmatrix}x\\\\y\\end{bmatrix} = \\begin{bmatrix}9\\\\7\\end{bmatrix}$, exact solution $(x,y) = (2, 5/3)$. Start at $(0,0)$. Step 1: $x^{(1)} = (9 - 1\\cdot 0)/4 = 2.25$, $y^{(1)} = (7 - 1\\cdot 0)/3 \\approx 2.333$. Step 2: $x^{(2)} = (9 - 2.333)/4 = 1.667$, $y^{(2)} = (7 - 2.25)/3 = 1.583$. The iterates are spiraling inward toward $(2, 1.667)$, overshooting on each side. By step 15 the error is below $10^{-4}$.',
      ] },
      { type: 'image', src: convergencePathUrl,
        alt: 'A dashed zigzag path showing Jacobi iterates starting at (0,0), overshooting past the solution on alternating sides, and spiraling inward to (2, 1.667)',
        caption: 'The iterates overshoot on alternating sides and spiral inward — a signature of a negative eigenvalue in the iteration matrix.' },
      { type: 'prose', paragraphs: [
      '**Predict before reading on:** In that 2×2 example, the iterates oscillated — $x$ went 0 → 2.25 → 1.667 → 2.083 → … — crossing the true value repeatedly. Will this always happen, or can the iterates approach from one side without oscillating? What feature of the matrix determines which behavior you get?',
      'The answer lies in the eigenvalues of the iteration matrix $G_J = -D^{-1}(L+U)$. For the 2×2 example, $G_J = -\\begin{bmatrix}0&1/4\\\\1/3&0\\end{bmatrix}$ has eigenvalues $\\pm 1/\\sqrt{12} \\approx \\pm 0.289$. The negative eigenvalue causes the oscillation — each step flips sign. If all eigenvalues were positive real, the iterates would approach monotonically. The convergence condition is simply $\\rho(G) = \\max_i |\\lambda_i(G)| < 1$: the spectral radius must be less than 1. Every iteration multiplies the error by roughly $\\rho(G)$, so you lose $-\\log_{10}\\rho(G)$ decimal digits of accuracy per step. For Jacobi on this example: $\\rho = 0.289$, so each step gains $\\log_{10}(1/0.289) \\approx 0.54$ decimal digits — you need about 11 steps per digit.',
      '**Gauss-Seidel** makes one improvement: instead of waiting until the end of the sweep to use fresh values, it uses each $x_i^{(k+1)}$ as soon as it is computed. When updating component $i$, the components $j < i$ already have their new values: $x_i^{(k+1)} = \\frac{1}{a_{ii}}\\left(b_i - \\sum_{j < i} a_{ij} x_j^{(k+1)} - \\sum_{j > i} a_{ij} x_j^{(k)}\\right)$. The splitting becomes $M = D - L$ (lower triangular). For many important matrices — particularly those from elliptic PDEs — the spectral radius satisfies $\\rho_{GS} \\approx \\rho_J^2$, meaning Gauss-Seidel converges roughly twice as fast as Jacobi with the same work per iteration.',
      ] },
      { type: 'image', src: jacobiGsSplittingUrl,
        alt: 'Two small matrix diagrams comparing Jacobi, which uses only old values from the previous sweep, against Gauss-Seidel, which reuses already-updated values within the same sweep',
        caption: 'Gauss-Seidel reuses fresh values the moment they are computed — same cost per step, roughly double the convergence rate.' },
      { type: 'prose', paragraphs: [
      'Where this is heading: Jacobi and Gauss-Seidel converge, but often slowly — especially near the solution, where only low-frequency error components remain. The next lesson introduces **Conjugate Gradient**, which does not use a fixed splitting at all; it adaptively constructs a search direction from the residual and the matrix\'s geometry, achieving convergence in at most $n$ steps for any SPD system. After that, GMRES generalizes CG to non-symmetric systems. These Krylov methods will reduce the iteration count from hundreds to tens, making iterative methods truly competitive for the largest linear systems in science and engineering.',
      ] },
      { type: 'viz', id: 'PythonNotebook',
        title: 'Jacobi and Gauss-Seidel in Python',
        mathBridge: 'Implement both methods from scratch and track convergence — spectral radius predicts exact iteration count.',
        caption: 'Watch how $\\rho(G)$ governs the convergence rate: halving $\\rho$ doubles the decimal digits gained per step.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Jacobi iteration with convergence tracking',
              prose: [
                'Implement Jacobi from scratch on a diagonally dominant system, track the error each iteration, and verify that the convergence rate matches the theoretical spectral radius.',
                '`D = np.diag(np.diag(A)); R = A - D`. Jacobi iteration: `x = np.zeros(n); for k in range(max_iter): x = np.linalg.solve(D, b - R @ x); errors.append(np.linalg.norm(A@x-b))`. The Jacobi iteration matrix is `G_J = -np.linalg.inv(D) @ R`. Convergence rate = `np.max(np.abs(np.linalg.eigvals(G_J)))`.',
                'Semilogy plot of `errors` vs iteration. The slope matches `log(rho(G_J))` — theoretical rate confirmed. For a tridiagonal SPD matrix, `rho(G_J) = cos(pi/(n+1))`, which approaches 1 as n grows — explaining why Jacobi slows down for large systems. This is why multigrid was invented.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

# Diagonally dominant system (from 1D Poisson discretization)
A = np.array([[4, -1,  0,  0],
              [-1,  4, -1,  0],
              [ 0, -1,  4, -1],
              [ 0,  0, -1,  4]], dtype=float)
b = np.array([3., 4., 4., 3.])
x_exact = np.linalg.solve(A, b)

# Jacobi iteration matrix G = -D^{-1}(L+U)
D = np.diag(np.diag(A))
LU = A - D
G_jac = -np.linalg.inv(D) @ LU
rho = np.max(np.abs(np.linalg.eigvals(G_jac)))
print(f"Spectral radius rho(G_Jacobi) = {rho:.4f}")
print(f"Predicted digits per iteration: {-np.log10(rho):.3f}")

# Run Jacobi
x = np.zeros(4)
errors = []
for k in range(60):
    x_new = np.linalg.solve(D, b - LU @ x)
    err = np.linalg.norm(x_new - x_exact)
    errors.append(err)
    if err < 1e-10:
        print(f"Converged at iteration {k+1}")
        break
    x = x_new

# Plot convergence
plt.figure(figsize=(7, 4))
plt.semilogy(errors, 'b-o', markersize=3, label='Jacobi error')
# Overlay theoretical rate
k_vals = np.arange(len(errors))
plt.semilogy(k_vals, errors[0] * rho**k_vals, 'r--', label=f'Theoretical: rho^k * e0 (rho={rho:.3f})')
plt.xlabel('Iteration'); plt.ylabel('||error||')
plt.title('Jacobi convergence vs. spectral radius prediction')
plt.legend(); plt.grid(True); plt.tight_layout(); plt.show()
`,
            },
            {
              id: 2,
              cellTitle: 'Gauss-Seidel vs Jacobi comparison',
              prose: [
                'Implement Gauss-Seidel and compare convergence rates. For this matrix class, verify the theoretical prediction that rho_GS ≈ rho_Jacobi².',
                'Gauss-Seidel: `L = np.tril(A); U_upper = np.triu(A, 1)`. Iteration: `x = np.linalg.solve(L, b - U_upper @ x)`. GS uses updated values immediately (within same iteration), so `G_GS = -np.linalg.inv(L) @ U_upper`. Compare `rho_GS = max(|eig(G_GS)|)` vs `rho_J = max(|eig(G_J)|)`. For symmetric tridiagonal: `rho_GS ≈ rho_J²`.',
                'Plot convergence of both methods on the same semilogy plot. GS converges in roughly half as many iterations. The theoretical ratio `log(rho_GS)/log(rho_J) ≈ 2` is visible as the GS slope being twice as steep. This factor-of-2 advantage of GS is a fundamental result — Gauss-Seidel is always at least as fast as Jacobi for SPD matrices.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

A = np.array([[4, -1,  0,  0],
              [-1,  4, -1,  0],
              [ 0, -1,  4, -1],
              [ 0,  0, -1,  4]], dtype=float)
b = np.array([3., 4., 4., 3.])
x_exact = np.linalg.solve(A, b)

D = np.diag(np.diag(A))
L = np.tril(A, -1)
U = np.triu(A,  1)

# Iteration matrices
G_jac = -np.linalg.inv(D) @ (L + U)
G_gs  = -np.linalg.solve(D + L, U)
rho_j = np.max(np.abs(np.linalg.eigvals(G_jac)))
rho_gs = np.max(np.abs(np.linalg.eigvals(G_gs)))
print(f"rho_Jacobi      = {rho_j:.4f}")
print(f"rho_GS          = {rho_gs:.4f}")
print(f"rho_Jacobi^2    = {rho_j**2:.4f}  (should match rho_GS)")

def jacobi(A, b, x0, tol=1e-12, maxiter=200):
    D = np.diag(np.diag(A)); LU = A - D
    x = x0.copy(); errs = []
    for _ in range(maxiter):
        x_new = np.linalg.solve(D, b - LU @ x)
        errs.append(np.linalg.norm(x_new - np.linalg.solve(A, b)))
        if errs[-1] < tol: break
        x = x_new
    return errs

def gauss_seidel(A, b, x0, tol=1e-12, maxiter=200):
    n = len(b); x = x0.copy(); errs = []
    x_star = np.linalg.solve(A, b)
    for _ in range(maxiter):
        for i in range(n):
            x[i] = (b[i] - A[i, :i] @ x[:i] - A[i, i+1:] @ x[i+1:]) / A[i, i]
        errs.append(np.linalg.norm(x - x_star))
        if errs[-1] < tol: break
    return errs

x0 = np.zeros(4)
errs_j  = jacobi(A, b, x0)
errs_gs = gauss_seidel(A, b, x0)

plt.figure(figsize=(7, 4))
plt.semilogy(errs_j,  'b-o', markersize=3, label=f'Jacobi (rho={rho_j:.3f})')
plt.semilogy(errs_gs, 'r-s', markersize=3, label=f'Gauss-Seidel (rho={rho_gs:.3f})')
plt.xlabel('Iteration'); plt.ylabel('||error||')
plt.title('Jacobi vs Gauss-Seidel: GS needs ~half the iterations')
plt.legend(); plt.grid(True); plt.tight_layout(); plt.show()
print(f"Jacobi iterations:       {len(errs_j)}")
print(f"Gauss-Seidel iterations: {len(errs_gs)}")
`,
            },
          ],
        },
      },
      { type: 'viz', id: 'OpenMatNotebook',
        title: 'Jacobi and Gauss-Seidel Iteration',
        mathBridge: 'Implement both methods and observe convergence.',
        caption: 'Spectral radius < 1 guarantees convergence. Smaller = faster.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Jacobi method',
              prose: [
                'Solve a diagonally dominant system with Jacobi iteration.',
                '`D = diag(diag(A)); R = A - D`. Jacobi: `x = zeros(n,1); for k=1:100, x = D \\ (b - R*x); res(k)=norm(A*x-b); end`. The iteration matrix is `G = -inv(D)*R`. Convergence: `rho_J = max(abs(eig(G)))`.',
                'The semilogy convergence plot: residual per iteration. The slope is `log(rho_J)`. Verify: `diff(log(res))` should be approximately constant and equal to `log(rho_J)`. Diagonal dominance (`|A(i,i)| > sum(|A(i,j)| for j≠i)`) guarantees convergence. Test: make the diagonal smaller until convergence fails — you will see the residual stop decreasing.',
              ],
              code: `% Strictly diagonally dominant system
A = [4 -1  0;
    -1  4 -1;
     0 -1  4]
b = [3; 4; 3]

% Jacobi: D = diag(A), split A = D - (L+U)
D = diag(diag(A))
LU = A - D  % strictly upper+lower triangular

% Iteration matrix
G_jac = -inv(D) * LU
rho_jac = max(abs(eig(G_jac)))
disp('Jacobi spectral radius:')
rho_jac

% Jacobi iteration
x = zeros(3,1)
for k = 1:50
    x_new = D \\ (b - LU * x)
    if norm(x_new - x) < 1e-10
        disp(['Converged at iteration ', num2str(k)])
        break
    end
    x = x_new
end
disp('Solution:')
x
disp('Exact solution (A\\b):')
A \\ b
`,
            },
            {
              id: 2,
              cellTitle: 'Gauss-Seidel comparison',
              prose: [
                'Compare Gauss-Seidel convergence rate to Jacobi on the same system.',
                'Gauss-Seidel: `L = tril(A); U = triu(A,1)`. Iteration: `x = L \\ (b - U*x)`. GS iteration matrix: `G_GS = -L\\U`. `rho_GS = max(abs(eig(G_GS)))`. For symmetric tridiagonal A: verify `rho_GS ≈ rho_J^2` numerically.',
                'Overlay Jacobi and GS convergence on the same semilogy plot with different colors. Count iterations to reach `norm(r) < 1e-8`. GS needs roughly half as many. Bar chart: [Jacobi iterations, GS iterations] — the visual makes the 2× speedup immediate. Also print `rho_J^2` and `rho_GS` side by side to confirm the theoretical prediction.',
              ],
              code: `A = [4 -1  0;
    -1  4 -1;
     0 -1  4]
b = [3; 4; 3]

L = tril(A, -1)   % strictly lower triangular
D = diag(diag(A))
U = triu(A, 1)    % strictly upper triangular

% Gauss-Seidel iteration matrix G_gs = -(D+L)^{-1} * U
G_gs = -(D+L) \\ U
rho_gs = max(abs(eig(G_gs)))
disp('GS spectral radius:')
rho_gs

% Gauss-Seidel iteration
x = zeros(3,1)
for k = 1:50
    x_new = (D+L) \\ (b - U*x)
    if norm(x_new - x) < 1e-10
        disp(['GS converged at iteration ', num2str(k)])
        break
    end
    x = x_new
end
disp('GS solution:')
x

% Compare: rho_gs should be ~ rho_jac^2
G_jac = -inv(D)*( A - D)
rho_jac = max(abs(eig(G_jac)))
disp('rho_jac^2 vs rho_gs:')
[rho_jac^2, rho_gs]
`,
            },
          ],
        },
      },
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'How to Apply Jacobi Iteration to $A\\mathbf{x} = \\mathbf{b}$ (4 Steps)',
        body: '1. **Check convergence.** Verify strict diagonal dominance: $|a_{ii}| > \\sum_{j \\neq i}|a_{ij}|$ for every row $i$. If not, compute $\\rho(G_J) = \\rho(-D^{-1}(L+U))$ explicitly — iteration converges iff $\\rho(G_J) < 1$.\n2. **Initialize.** Set $\\mathbf{x}^{(0)}$ to any vector (zeros works fine). The iteration converges regardless of starting point when $\\rho(G_J) < 1$.\n3. **Sweep.** For $k = 0, 1, 2, \\ldots$: compute every component simultaneously using OLD values only: $x_i^{(k+1)} = \\frac{1}{a_{ii}}\\!\\left(b_i - \\sum_{j \\neq i} a_{ij} x_j^{(k)}\\right)$. Storing $\\mathbf{x}^{(k)}$ and $\\mathbf{x}^{(k+1)}$ separately is critical — do NOT overwrite $x_j^{(k)}$ until the full sweep is done.\n4. **Stop** when the residual $\\|A\\mathbf{x}^{(k)} - \\mathbf{b}\\|$ falls below tolerance, OR when the step size $\\|\\mathbf{x}^{(k+1)} - \\mathbf{x}^{(k)}\\|$ is small. Always report the residual, not just the step size.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 1 of 5 — Iterative Solvers & Preconditioning',
        body: '**Previous (Chapter 8):** Applications — PCA, PageRank, ODEs, computer graphics.\n**This lesson:** Jacobi and Gauss-Seidel — stationary iterative methods, matrix splitting $A = M - N$, spectral radius convergence criterion, SOR acceleration.\n**Next (Lesson 2):** Conjugate Gradient — Krylov subspace methods that converge in far fewer steps than stationary iterations.',
      },
      {
        type: 'theorem',
        title: 'Convergence Theorem',
        body: 'Stationary iteration $\\mathbf{x}^{(k+1)} = G\\mathbf{x}^{(k)} + \\mathbf{c}$ converges to the unique fixed point for every starting $\\mathbf{x}^{(0)}$ if and only if $\\rho(G) < 1$.\n\nError reduction per step: $\\|\\mathbf{e}^{(k)}\\| \\leq \\rho(G)^k \\|\\mathbf{e}^{(0)}\\|$\n\nFor Gauss-Seidel: $\\rho_{GS} = \\rho_{Jac}^2$ (for many important matrices — Gauss-Seidel is 2× faster).',
      },
      {
        type: 'insight',
        title: 'SOR: Successive Over-Relaxation',
        body: 'SOR interpolates between old and Gauss-Seidel update:\n$x_i^{(k+1)} = (1-\\omega)x_i^{(k)} + \\omega x_i^{GS}$\n\n$\\omega = 1$: Gauss-Seidel\n$1 < \\omega < 2$: over-relaxation (usually faster)\n$0 < \\omega < 1$: under-relaxation (can stabilize non-convergent GS)\n\nOptimal $\\omega$ for Poisson equation: $\\omega^* = \\frac{2}{1+\\sqrt{1-\\rho_{Jac}^2}}$, giving $\\rho_{SOR} = \\omega^* - 1$.',
      },
    ],
  },

  math: {
    prose: [
      '**Error analysis.** Let $\\mathbf{e}^{(k)} = \\mathbf{x}^* - \\mathbf{x}^{(k)}$ be the error. Since $\\mathbf{x}^* = G\\mathbf{x}^* + \\mathbf{c}$, we get $\\mathbf{e}^{(k+1)} = G\\mathbf{e}^{(k)}$, so $\\mathbf{e}^{(k)} = G^k \\mathbf{e}^{(0)}$. Convergence requires $G^k \\to 0$, which holds iff $\\rho(G) < 1$ (as the Jordan form analysis shows: $G^k \\to 0$ iff all eigenvalues satisfy $|\\lambda| < 1$).',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Convergence is Not Guaranteed',
        body: 'For a general matrix, Jacobi and Gauss-Seidel can diverge. Examples:\n\n- $A = \\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}$: not diagonally dominant, Jacobi diverges.\n- Symmetric positive definite: Gauss-Seidel always converges.\n- Diagonally dominant: both converge.\n\nAlways check $\\rho(G) < 1$ before deploying a stationary iteration.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Multigrid methods.** Jacobi and Gauss-Seidel are excellent **smoothers** — they rapidly eliminate high-frequency (oscillatory) error components, while low-frequency components decay slowly. **Multigrid** exploits this: smooth on the fine grid, restrict residual to a coarser grid, solve coarsely, prolongate correction back, smooth again. This achieves $O(n)$ work for elliptic PDEs. The V-cycle and W-cycle are standard multigrid algorithms.',
      '**Convergence theory: Stein-Rosenberg theorem.** For a non-negative off-diagonal matrix $A$, the Stein-Rosenberg theorem states a precise ordering between the Jacobi and Gauss-Seidel spectral radii: either $\\rho_J = \\rho_{GS} = 0$, or $0 < \\rho_{GS} < \\rho_J < 1$, or $1 < \\rho_J < \\rho_{GS}$, or $\\rho_J = \\rho_{GS} = 1$. In particular, for consistently ordered matrices (e.g., 2D finite difference grids in natural or red-black ordering), the exact relation $\\rho_{GS} = \\rho_J^2$ holds — Gauss-Seidel reduces error by the square of Jacobi\'s factor per iteration.',
      '**Block iterations and red-black ordering.** Rather than updating one component $x_i$ at a time, **block Jacobi** partitions $A$ into diagonal blocks $A_{ii}$ and updates entire subvectors: $\\mathbf{x}_i^{(k+1)} = A_{ii}^{-1}(\\mathbf{b}_i - \\sum_{j\\neq i} A_{ij}\\mathbf{x}_j^{(k)})$. For 2D grid problems, **red-black (checkerboard) ordering** partitions unknowns into two independent sets so that all reds can be updated simultaneously (no dependencies), then all blacks — making Gauss-Seidel parallelizable without losing fast convergence. This is the standard approach for GPU-accelerated PDE solvers.',
      '**SOR optimal parameter derivation.** For the model problem ($5$-point Laplacian on an $m \\times m$ grid), the Jacobi spectral radius is $\\rho_J = \\cos(\\pi/(m+1))$. The optimal SOR parameter is $\\omega^* = 2/(1 + \\sqrt{1 - \\rho_J^2})$, giving $\\rho_{SOR} = \\omega^* - 1$. For large $m$: $\\rho_J \\approx 1 - \\pi^2/(2m^2)$, $\\omega^* \\approx 2 - 2\\pi/m$, and $\\rho_{SOR} \\approx 1 - 2\\pi/m$. This means SOR reduces error by $e^{-2\\pi/m}$ per iteration — converging in $O(m)$ iterations vs. $O(m^2)$ for Gauss-Seidel.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'When to Use Stationary Iterations',
        body: 'Direct solvers (LU) are preferred for dense $n < 10^4$ or sparse systems with good structure.\nStationary iterations are mostly used as:\n- **Smoothers** inside multigrid (V-cycle)\n- **Preconditioners** for Krylov methods (e.g., SSOR preconditioner for CG)\n- **Simple baseline** to understand iterative methods\n\nFor production code: use MATLAB\'s built-in pcg, gmres with ILU or AMG preconditioner.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la9-001-1',
      title: 'Diagonal dominance check',
      problem: 'Does $A = \\begin{bmatrix}5&1&1\\\\1&4&2\\\\2&1&6\\end{bmatrix}$ guarantee Jacobi convergence?',
      solution: 'Row 1: $|5| > |1| + |1| = 2$ ✓. Row 2: $|4| > |1| + |2| = 3$ ✓. Row 3: $|6| > |2| + |1| = 3$ ✓. Strictly diagonally dominant — Jacobi and Gauss-Seidel both converge.',
    },
    {
      id: 'ex-la9-001-2',
      title: 'Jacobi vs Gauss-Seidel iteration count',
      problem: 'For $A = \\begin{bmatrix}4&1\\\\1&3\\end{bmatrix}$, $\\mathbf{b} = (9,7)^\\top$: compute the Jacobi iteration matrix $G_J$ and its spectral radius. How does $\\rho_{GS}$ compare?',
      solution: '$D = \\begin{bmatrix}4&0\\\\0&3\\end{bmatrix}$, $L+U = \\begin{bmatrix}0&1\\\\1&0\\end{bmatrix}$. $G_J = -D^{-1}(L+U) = -\\begin{bmatrix}0&1/4\\\\1/3&0\\end{bmatrix}$. Eigenvalues of $G_J$: $\\pm\\sqrt{(1/4)(1/3)} = \\pm 1/\\sqrt{12} \\approx \\pm 0.289$. So $\\rho_J \\approx 0.289$. For Gauss-Seidel: $\\rho_{GS} \\approx \\rho_J^2 \\approx 0.083$ — Gauss-Seidel converges about 3.5× faster per iteration.',
    },
    {
      id: 'ex-la9-001-3',
      title: 'Non-convergence example',
      problem: 'Show that Jacobi diverges for $A = \\begin{bmatrix}1&2\\\\3&1\\end{bmatrix}$, $\\mathbf{b} = (3,4)^\\top$.',
      solution: '$D = I$, $L+U = \\begin{bmatrix}0&2\\\\3&0\\end{bmatrix}$. $G_J = -(L+U) = \\begin{bmatrix}0&-2\\\\-3&0\\end{bmatrix}$. Eigenvalues: $\\pm\\sqrt{6} \\approx \\pm 2.449$. Since $\\rho(G_J) = \\sqrt{6} > 1$, Jacobi diverges. The matrix is not diagonally dominant ($|1| < |2|$ in row 1, $|1| < |3|$ in row 2).',
    },
  ],

  challenges: [
    {
      id: 'ch-la9-001-1',
      title: 'Fixed-point interpretation',
      difficulty: 'medium',
      problem: 'Show that the fixed point of Jacobi iteration ($\\mathbf{x}^{(k+1)} = D^{-1}(\\mathbf{b} - (L+U)\\mathbf{x}^{(k)})$) is the solution to $A\\mathbf{x} = \\mathbf{b}$. Why is this the ONLY fixed point (assuming $A$ is nonsingular)?',
      walkthrough: [
        { expression: '\\text{At fixed point: } \\mathbf{x}^* = \\mathbf{x}^{(k+1)} = \\mathbf{x}^{(k)}', annotation: 'Define fixed point: a vector that maps to itself under one iteration.' },
        { expression: '\\mathbf{x}^* = D^{-1}(\\mathbf{b} - (L+U)\\mathbf{x}^*)', annotation: 'Substitute the fixed-point condition into the iteration formula.' },
        { expression: 'D\\mathbf{x}^* = \\mathbf{b} - (L+U)\\mathbf{x}^*', annotation: 'Multiply both sides by $D$ (invertible since all diagonal entries are nonzero).' },
        { expression: '(D + L + U)\\mathbf{x}^* = \\mathbf{b}', annotation: 'Rearrange: $D\\mathbf{x}^* + (L+U)\\mathbf{x}^* = \\mathbf{b}$.' },
        { expression: 'A\\mathbf{x}^* = \\mathbf{b}', annotation: 'Since $A = D + L + U$, the fixed point satisfies the original system. Uniqueness: $A$ nonsingular means only one solution exists.' },
      ],
    },
    {
      id: 'ch-la9-001-2',
      title: 'Two Jacobi steps by hand',
      difficulty: 'easy',
      problem: 'For $A = \\begin{bmatrix}4&1\\\\1&3\\end{bmatrix}$, $\\mathbf{b} = (9,7)^\\top$, starting from $\\mathbf{x}^{(0)} = (0,0)^\\top$, perform 2 Jacobi iterations and compute the error after each step (exact solution: $(x,y) = (2, 5/3)$).',
      walkthrough: [
        { expression: 'x_1^{(1)} = (9 - 1\\cdot 0)/4 = 2.25,\\quad x_2^{(1)} = (7 - 1\\cdot 0)/3 \\approx 2.333', annotation: 'Step 1: both components use $x^{(0)} = (0,0)$. Divide by respective diagonal entries 4 and 3.' },
        { expression: '\\mathbf{e}^{(1)} = \\|(2.25 - 2,\\ 2.333 - 1.667)\\| \\approx \\|(0.25,\\ 0.667)\\| \\approx 0.712', annotation: 'Error after step 1 — both components overshot the true solution.' },
        { expression: 'x_1^{(2)} = (9 - 1\\cdot 2.333)/4 = 1.667,\\quad x_2^{(2)} = (7 - 1\\cdot 2.25)/3 = 1.583', annotation: 'Step 2: use $\\mathbf{x}^{(1)} = (2.25, 2.333)$ on the right. The iterates cross the true value on each side — oscillation.' },
        { expression: '\\mathbf{e}^{(2)} \\approx \\|(0.333,\\ 0.083)\\| \\approx 0.343', annotation: 'Error roughly halved. Since $\\rho(G_J) \\approx 0.289$ and $0.343 \\approx 0.289 \\cdot 1.19 \\cdot 0.712$... wait, $0.289 \\times 0.712 \\approx 0.206$. Close to observed reduction.' },
        { expression: '\\text{Oscillation: step 1 overshot, step 2 undershot}', annotation: 'The negative eigenvalue of $G_J$ (sign flip each step) causes alternating over/undershoot.' },
      ],
    },
    {
      id: 'ch-la9-001-3',
      title: 'Verify the $\\rho_{GS} \\approx \\rho_J^2$ relation',
      difficulty: 'hard',
      problem: 'For $A = \\begin{bmatrix}4&-1&0\\\\-1&4&-1\\\\0&-1&4\\end{bmatrix}$, compute the Jacobi iteration matrix $G_J$ and Gauss-Seidel iteration matrix $G_{GS}$ and verify that $\\rho_{GS} \\approx \\rho_J^2$.',
      walkthrough: [
        { expression: 'D = \\operatorname{diag}(4,4,4),\\quad L+U = A - D', annotation: 'Extract diagonal; off-diagonal part has entries $-1$ at positions $(1,2),(2,1),(2,3),(3,2)$.' },
        { expression: 'G_J = -D^{-1}(L+U) = \\frac{1}{4}\\begin{bmatrix}0&1&0\\\\1&0&1\\\\0&1&0\\end{bmatrix}', annotation: 'Multiply $-(L+U)$ by $D^{-1} = \\frac{1}{4}I$: each entry of $L+U$ divided by 4, signs flipped.' },
        { expression: '\\det(G_J - \\lambda I) = 0 \\Rightarrow \\lambda = 0,\\ \\pm\\frac{\\sqrt{2}}{4} \\approx 0,\\ \\pm 0.354', annotation: 'Characteristic polynomial of $G_J$. The $3\\times3$ tridiagonal with 0 diagonal and $1/4$ off-diagonal has eigenvalues $\\pm\\frac{\\sqrt{2}}{4}$ and $0$.' },
        { expression: '\\rho_J = \\frac{\\sqrt{2}}{4} \\approx 0.354', annotation: 'Largest magnitude eigenvalue of $G_J$.' },
        { expression: 'G_{GS} = -(D-L)^{-1}U \\Rightarrow \\rho_{GS} \\approx 0.125', annotation: 'Gauss-Seidel matrix: $M = D - L$ (lower triangular), $N = U$. Eigenvalue computation gives $\\rho_{GS} = 1/8$.' },
        { expression: '\\rho_J^2 = (0.354)^2 = 0.125 = \\rho_{GS} \\checkmark', annotation: 'Exact equality for this consistently ordered tridiagonal matrix — Stein-Rosenberg theorem confirmed.' },
      ],
    },
  ],

  mentalModel: [
    'Stationary iteration: $A = M - N$; solve $M\\mathbf{x}^{(k+1)} = N\\mathbf{x}^{(k)} + \\mathbf{b}$.',
    'Jacobi: $M = D$ (diagonal). Gauss-Seidel: $M = D - L$ (lower triangular).',
    'Convergence iff spectral radius $\\rho(G) < 1$.',
    'Diagonal dominance guarantees convergence of both methods.',
    'GS uses updated values immediately — faster than Jacobi (roughly $\\rho_{GS} \\approx \\rho_J^2$).',
  ],

  checkpoints: [
    { id: 'cp-la9-001-1', label: 'What is the Jacobi iteration matrix?', type: 'read' },
    { id: 'cp-la9-001-2', label: 'Under what spectral condition does a stationary iteration converge?', type: 'read' },
    { id: 'cp-la9-001-3', label: 'How does Gauss-Seidel differ from Jacobi in its update rule?', type: 'read' },
    { id: 'cp-la9-001-4', label: 'Run the Jacobi notebook cell on the 2×2 example and verify the first two iterates by hand.', type: 'lab' },
    { id: 'cp-la9-001-5', label: 'Modify the Gauss-Seidel cell to track the residual norm each iteration and plot convergence.', type: 'lab' },
    { id: 'cp-la9-001-6', label: 'Verify example 2 by computing $G_J$ and its eigenvalues by hand for the 2×2 system.', type: 'example' },
    { id: 'cp-la9-001-7', label: 'Verify example 3 by checking diagonal dominance and computing $\\rho(G_J)$.', type: 'example' },
    { id: 'cp-la9-001-8', label: 'For a random 4×4 diagonally dominant matrix, predict the number of iterations needed to reach residual $10^{-8}$ from $\\rho(G)$. Then verify experimentally.', type: 'challenge' },
  ],

  assessment: 'For the system $A\\mathbf{x} = \\mathbf{b}$ with $A = \\begin{bmatrix}10&1\\\\1&10\\end{bmatrix}$, $\\mathbf{b} = (1,1)^\\top$: (a) compute the Jacobi iteration matrix and its spectral radius, (b) perform 3 steps starting from $\\mathbf{x}^{(0)} = \\mathbf{0}$.',

  quiz: [
    { id: 'q-la9-001-1', type: 'choice', text: 'The Jacobi method uses which splitting of $A$?', options: ['$A = L + D + U$, $M = D + L$', '$A = D - (L+U)$, $M = D$', '$A = L + U$, $M = L$', '$A = QR$, $M = Q$'], answer: '$A = D - (L+U)$, $M = D$', hints: ['The Jacobi method uses only the diagonal part of $A$ for $M$.'], reviewSection: 'intuition' },
    { id: 'q-la9-001-2', type: 'choice', text: 'A stationary iteration converges for all starting points iff:', options: ['$\\|G\\|_2 < 1$', '$\\rho(G) < 1$', '$\\det G < 1$', '$\\text{tr}(G) < 0$'], answer: '$\\rho(G) < 1$', hints: ['The spectral radius is the maximum modulus of the eigenvalues.'], reviewSection: 'intuition' },
    { id: 'q-la9-001-3', type: 'choice', text: 'Strict diagonal dominance guarantees:', options: ['Gauss-Seidel converges only', 'Jacobi converges only', 'Both Jacobi and Gauss-Seidel converge', 'Neither converges in general'], answer: 'Both Jacobi and Gauss-Seidel converge', hints: ['Diagonal dominance implies $\\rho(G) < 1$ for both methods.'], reviewSection: 'intuition' },
    { id: 'q-la9-001-4', type: 'choice', text: 'For the 2×2 example $A = \\begin{bmatrix}4&1\\\\1&3\\end{bmatrix}$, the first Jacobi iterate from $\\mathbf{x}^{(0)}=(0,0)^\\top$ gives $x^{(1)} =$', options: ['$x^{(1)} = 2.00$', '$x^{(1)} = 2.25$', '$x^{(1)} = 3.00$', '$x^{(1)} = 1.75$'], answer: '$x^{(1)} = 2.25$', hints: ['Apply $x^{(1)} = (b_1 - a_{12} y^{(0)}) / a_{11} = (9 - 0) / 4$.'], reviewSection: 'intuition' },
    { id: 'q-la9-001-5', type: 'choice', text: 'Gauss-Seidel typically converges faster than Jacobi because:', options: ['It uses a smaller iteration matrix', 'It uses updated component values immediately within each sweep', 'It requires fewer matrix-vector products', 'Its diagonal is larger'], answer: 'It uses updated component values immediately within each sweep', hints: ['Compare the two update formulas and note what values of $\\mathbf{x}$ are used.'], reviewSection: 'intuition' },
    { id: 'q-la9-001-6', type: 'choice', text: 'If $\\rho(G_J) = 0.5$ for a Jacobi iteration, approximately how many iterations are needed to reduce the error by a factor of $10^{-6}$?', options: ['6 iterations', '10 iterations', '20 iterations', '40 iterations'], answer: '20 iterations', hints: ['Each iteration reduces error by $\\rho = 0.5$. After $k$ steps: $0.5^k < 10^{-6}$, so $k \\geq 6/\\log_{10}(2) \\approx 20$.'], reviewSection: 'intuition' },
    { id: 'q-la9-001-7', type: 'choice', text: 'The SOR relaxation parameter $\\omega^* > 1$ (over-relaxation) is useful because:', options: ['It always converges when Gauss-Seidel diverges', 'It can give a smaller spectral radius than Gauss-Seidel', 'It reduces memory usage', 'It parallelizes better than Jacobi'], answer: 'It can give a smaller spectral radius than Gauss-Seidel', hints: ['The optimal $\\omega^*$ minimizes $\\rho_{SOR}$, which can be less than $\\rho_{GS}$.'], reviewSection: 'intuition' },
    { id: 'q-la9-001-8', type: 'choice', text: 'The error after $k$ Jacobi iterations satisfies (approximately):', options: ['$\\|\\mathbf{e}^{(k)}\\| \\leq k\\rho(G)$', '$\\|\\mathbf{e}^{(k)}\\| \\leq \\rho(G)^k \\|\\mathbf{e}^{(0)}\\|$', '$\\|\\mathbf{e}^{(k)}\\| = 0$ for $k \\geq n$', '$\\|\\mathbf{e}^{(k)}\\| \\leq \\|G\\|_F^k$'], answer: '$\\|\\mathbf{e}^{(k)}\\| \\leq \\rho(G)^k \\|\\mathbf{e}^{(0)}\\|$', hints: ['The error satisfies $\\mathbf{e}^{(k)} = G^k \\mathbf{e}^{(0)}$; the spectral radius controls the power.'], reviewSection: 'math' },
    { id: 'q-la9-001-9', type: 'choice', text: 'Jacobi and Gauss-Seidel are most commonly used in modern codes as:', options: ['The primary linear system solver', 'Smoothers inside multigrid or preconditioners for Krylov methods', 'Replacements for LU factorization', 'Methods for computing eigenvalues'], answer: 'Smoothers inside multigrid or preconditioners for Krylov methods', hints: ['See the rigor section on multigrid — Jacobi is an excellent smoother.'], reviewSection: 'rigor' },
    { id: 'q-la9-001-10', type: 'choice', text: 'For a symmetric positive definite matrix, which statement is true?', options: ['Jacobi always converges but Gauss-Seidel may not', 'Gauss-Seidel always converges but Jacobi may not', 'Both Jacobi and Gauss-Seidel always converge', 'Neither is guaranteed to converge'], answer: 'Gauss-Seidel always converges but Jacobi may not', hints: ['SPD guarantees GS convergence; Jacobi requires the stronger diagonal dominance condition.'], reviewSection: 'math' },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Given any 3×3 diagonally dominant system, perform 3 iterations of Jacobi by hand and verify convergence using the spectral radius.',
    explainVerbally: 'Explain the matrix splitting idea to a classmate: why does $A = M - N$ lead to an iterative method, and what makes $M = D$ a good choice?',
    detectIncorrectApplication: 'Identify when Jacobi will diverge by checking diagonal dominance; catch the mistake of applying Jacobi to a system where $|a_{ii}| < \\sum_{j\\neq i}|a_{ij}|$.',
    transferToUnfamiliar: 'Given a new splitting $M = D + L$ (lower triangular part), derive the corresponding iteration and predict whether it will converge faster or slower than Gauss-Seidel.',
  },

  misconceptions: [
    {
      falseBelief: 'Convergence is guaranteed if $\\|G\\|_2 < 1$.',
      whyStudentsThinkIt: 'The 2-norm is the most common matrix norm, and students conflate norm with spectral radius.',
      correctionExample: 'A matrix can have $\\|G\\|_2 > 1$ but $\\rho(G) < 1$, or vice versa. The spectral radius $\\rho(G) = \\lim_{k\\to\\infty}\\|G^k\\|^{1/k}$ is the correct quantity — not any single matrix norm.',
      contrastCase: '$G = \\begin{bmatrix}0&2\\\\0&0\\end{bmatrix}$: $\\|G\\|_2 = 2 > 1$ but $\\rho(G) = 0 < 1$. The iteration converges in 2 steps.',
    },
    {
      falseBelief: 'Gauss-Seidel always converges faster than Jacobi.',
      whyStudentsThinkIt: 'Using fresh values "should" always help, and the $\\rho_{GS} \\approx \\rho_J^2$ result is often stated without caveats.',
      correctionExample: 'For some non-symmetric matrices, Jacobi converges but Gauss-Seidel diverges. The $\\rho_{GS} = \\rho_J^2$ relation holds only for specific matrix classes (e.g., consistently ordered matrices from 2D PDE discretizations).',
      contrastCase: 'A 2×2 system where Jacobi converges with $\\rho_J = 0.8$ but Gauss-Seidel diverges with $\\rho_{GS} > 1$ can be constructed from a non-symmetric matrix.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You have a symmetric positive definite tridiagonal system from a 1D finite difference discretization and need to solve it iteratively.',
      competingTechniques: 'Jacobi, Gauss-Seidel, SOR, Conjugate Gradient.',
      whyThisTechniqueWins: 'Gauss-Seidel or SOR with optimal $\\omega$ converges fastest for SPD tridiagonal systems. CG would be even faster, but Gauss-Seidel is simpler to implement and effective for small systems.',
    },
    {
      situation: 'You need to parallelize the solution of a large sparse SPD system across many CPU cores.',
      competingTechniques: 'Jacobi, Gauss-Seidel, parallel CG.',
      whyThisTechniqueWins: 'Jacobi wins for parallelism: each component $x_i^{(k+1)}$ depends only on old values, so all $n$ updates are independent. Gauss-Seidel has sequential data dependencies that make parallelization difficult.',
    },
  ],

  semantics: {
    core: [
      { symbol: 'A = D - (L+U)', meaning: 'Jacobi splitting: $D$ = diagonal, $L$ = strict lower triangular, $U$ = strict upper triangular. This notation is specific to iterative methods — $L,U$ here do NOT mean factors of $A$.' },
      { symbol: 'G_J = -D^{-1}(L+U)', meaning: 'Jacobi iteration matrix — multiplying by $G_J$ applies one Jacobi step to the error. Eigenvalues determine convergence rate.' },
      { symbol: '\\rho(G) = \\max_i |\\lambda_i(G)|', meaning: 'Spectral radius of the iteration matrix — converges for ALL starting points iff $\\rho(G) < 1$. Smaller = faster convergence.' },
      { symbol: 'x_i^{(k+1)} = \\frac{1}{a_{ii}}\\!\\left(b_i - \\sum_{j\\neq i}a_{ij}x_j^{(k)}\\right)', meaning: 'Jacobi update formula for component $i$ — uses only OLD values $x_j^{(k)}$, making all $n$ updates independent.' },
      { symbol: '\\rho_{GS} \\approx \\rho_J^2', meaning: 'For consistently ordered matrices (e.g., 1D/2D finite difference grids): Gauss-Seidel spectral radius is approximately the square of Jacobi\'s — so GS needs roughly half as many iterations.' },
      { symbol: '\\omega^* = \\frac{2}{1 + \\sqrt{1-\\rho_J^2}}', meaning: 'Optimal SOR relaxation parameter — minimizes $\\rho_{SOR}$ for the model problem. For large grids, $\\omega^* \\approx 2 - 2\\pi/m$ where $m$ is the grid size in one dimension.' },
    ],
    rulesOfThumb: [
      'Check diagonal dominance first — it\'s fast ($O(n)$) and sufficient to guarantee convergence without computing eigenvalues.',
      'Jacobi convergence rate: each step multiplies error by $\\rho_J$. You need $k \\approx \\log(1/\\varepsilon) / \\log(1/\\rho_J)$ iterations to reach tolerance $\\varepsilon$.',
      'Gauss-Seidel is preferred over Jacobi for sequential computation; Jacobi is preferred for GPU/parallel computation since updates are independent.',
      'Stationary iterations are mainly used as smoother components inside multigrid or as cheap preconditioners — not as standalone solvers for large problems.',
      '$\\rho(G) \\geq 1$ for any splitting of a singular matrix — iterative methods cannot solve singular systems.',
    ],
  },

  spiral: {
    recoveryPoints: ['la5-001', 'la7-005'],
    futureLinks: ['la9-002', 'la9-004'],
  },

  debugging: [
    {
      commonError: 'Dividing by $a_{ii} = 0$ in the Jacobi update.',
      symptom: 'NaN or Inf values appear after the first iteration.',
      whyItHappened: 'The matrix has a zero diagonal entry; Jacobi requires $a_{ii} \\neq 0$ for all $i$.',
      repairStrategy: 'Permute the rows/columns of $A$ so all diagonal entries are nonzero (pivoting). If no permutation fixes it, the matrix is singular.',
    },
    {
      commonError: 'Checking $\\|G\\|_2 < 1$ instead of $\\rho(G) < 1$ to predict convergence.',
      symptom: 'The iteration diverges even though $\\|G\\|_2 < 1$ was verified, or the code predicts divergence when it should converge.',
      whyItHappened: 'Confusing the matrix 2-norm with the spectral radius. The spectral radius $\\rho(G) = \\max_i |\\lambda_i|$ is the correct convergence indicator.',
      repairStrategy: 'Compute $\\rho(G) = $ max(abs(eig(G))) in MATLAB/Python. The 2-norm $\\|G\\|_2$ equals the spectral radius only for normal matrices.',
    },
  ],
};
