export default {
  id: 'la9-002',
  slug: 'conjugate-gradient',
  chapter: 'la9',
  order: 2,
  title: 'Conjugate Gradient Method',
  subtitle: 'The conjugate gradient (CG) method solves $A\\mathbf{x} = \\mathbf{b}$ for symmetric positive definite $A$ in at most $n$ steps, but typically converges in $\\sqrt{\\kappa(A)}$ iterations. It builds an $A$-orthogonal search direction basis from Krylov subspaces.',
  tags: ['conjugate gradient', 'CG', 'Krylov subspace', 'SPD', 'A-orthogonal', 'energy norm', 'convergence', 'preconditioning'],
  aliases: 'conjugate gradient CG method Krylov subspace symmetric positive definite SPD A-orthogonal energy norm convergence rate preconditioning iterative solver',

  hook: {
    question: "The Gauss-Seidel method converges slowly when the condition number is large. Is there an iterative method that always converges in at most $n$ steps (exact arithmetic) and is provably optimal at each step?",
    realWorldContext: "Conjugate gradient is the workhorse of large-scale scientific computing. Every finite element simulation, physics engine, climate model, and 3D game uses CG or its variants. Solving the Poisson equation on a $1000 \\times 1000$ grid gives $n = 10^6$ unknowns — CG with a good preconditioner converges in $O(\\sqrt{n})$ iterations, each costing $O(n)$ work. Total: $O(n^{3/2})$ vs $O(n^3)$ for LU. Google uses CG-like methods for ranking and ad placement. Quantum chemistry codes (Gaussian, VASP) rely on CG for self-consistent field iterations.",
  },

  intuition: {
    prose: [
      'Where you are in the story: Jacobi and Gauss-Seidel showed that iteration can replace direct elimination, but both have a fundamental weakness — their convergence rate is controlled by a fixed spectral radius that you cannot easily change. For the 2D Poisson equation on an $n$-point grid, $\\rho_{GS} \\approx 1 - O(1/n)$, meaning you need $O(n)$ iterations to converge. Combined with $O(n)$ work per iteration, the total cost is $O(n^2)$ — barely better than LU for 2D problems and still hopeless for 3D. Conjugate Gradient breaks this barrier. It is not a stationary iteration at all; it is something conceptually different that achieves $O(\\sqrt{\\kappa(A)})$ iterations for any SPD system.',
      'The key insight starts with a geometric reinterpretation. For a symmetric positive definite matrix $A$, the linear system $A\\mathbf{x} = \\mathbf{b}$ is equivalent to minimizing a quadratic function: $f(\\mathbf{x}) = \\frac{1}{2}\\mathbf{x}^\\top A\\mathbf{x} - \\mathbf{b}^\\top\\mathbf{x}$. Since $A$ is positive definite, this function is strictly convex — it looks like a bowl in $n$ dimensions, with a unique minimum at exactly $\\mathbf{x}^* = A^{-1}\\mathbf{b}$. Solving the linear system is the same as finding the bottom of the bowl. Gradient-based optimization is suddenly on the table.',
      'The simplest strategy is steepest descent: at each step, compute the gradient $\\nabla f(\\mathbf{x}_k) = A\\mathbf{x}_k - \\mathbf{b} = -\\mathbf{r}_k$ (the negative residual), then take a step in the residual direction with the optimal step length. Steepest descent works, but it is famously inefficient — on an elongated bowl (large condition number), it zig-zags back and forth, making tiny progress per step. The problem is that consecutive steepest descent steps are always perpendicular to each other in the standard inner product, which forces you to keep revisiting the same directions.',
      'CG fixes this by choosing directions that are **$A$-conjugate**: $\\mathbf{d}_i^\\top A \\mathbf{d}_j = 0$ for $i \\neq j$. The $A$-inner product $\\langle \\mathbf{u}, \\mathbf{v} \\rangle_A = \\mathbf{u}^\\top A \\mathbf{v}$ is the natural geometry for this problem — it measures angles in the energy norm $\\|\\mathbf{x}\\|_A = \\sqrt{\\mathbf{x}^\\top A \\mathbf{x}}$. If you have $n$ mutually $A$-conjugate directions, you can decompose the entire space into $n$ independent components and minimize each one independently, reaching the exact solution in exactly $n$ steps. The magic of CG is that you can build these conjugate directions on-the-fly, one per iteration, using only the previous residual and direction — no storage of all past vectors needed.',
      'A concrete first step makes this tangible. Take $A = \\begin{bmatrix}4&1\\\\1&3\\end{bmatrix}$, $\\mathbf{b} = (9,7)^\\top$, start at $\\mathbf{x}_0 = (0,0)^\\top$. Residual $\\mathbf{r}_0 = (9,7)^\\top$. First direction $\\mathbf{d}_0 = \\mathbf{r}_0 = (9,7)^\\top$. Compute $A\\mathbf{d}_0 = (43,30)^\\top$. Optimal step: $\\alpha_0 = \\mathbf{r}_0^\\top\\mathbf{r}_0 / (\\mathbf{d}_0^\\top A\\mathbf{d}_0) = 130/597 \\approx 0.2178$. New iterate: $\\mathbf{x}_1 \\approx (1.960, 1.525)^\\top$. New residual: $\\mathbf{r}_1 = \\mathbf{r}_0 - \\alpha_0 A\\mathbf{d}_0 \\approx (-0.36, 0.47)^\\top$. Then CG constructs a new direction $\\mathbf{d}_1$ that is $A$-conjugate to $\\mathbf{d}_0$, and one more step reaches $\\mathbf{x}^* = (2, 5/3)^\\top$ exactly.',
      '**Predict before reading on:** In the 2×2 example, CG needed 2 steps for a $2 \\times 2$ system. Now suppose $A$ is $4 \\times 4$ with eigenvalues $\\{1, 1, 1, 100\\}$. Will CG need 4 steps (one per dimension), or something different? And what if the eigenvalues were $\\{1, 2, 3, 4\\}$ — four distinct values? What feature of the eigenvalue distribution controls the iteration count?',
      'The answer reveals CG\'s deepest property. CG converges in at most $m$ steps where $m$ is the number of **distinct eigenvalues** of $A$ — not the matrix size $n$. For the first case ($\\{1,1,1,100\\}$), there are only 2 distinct eigenvalues, so CG converges in 2 steps despite being a $4 \\times 4$ system. For $\\{1,2,3,4\\}$ with 4 distinct values, CG needs 4 steps. This explains why CG is so effective in practice: for matrices arising from discretizing smooth PDEs, eigenvalues naturally cluster, and CG exploits that clustering automatically. The search directions live in the **Krylov subspace** $\\mathcal{K}_k(A, \\mathbf{r}_0) = \\text{span}\\{\\mathbf{r}_0, A\\mathbf{r}_0, A^2\\mathbf{r}_0, \\ldots, A^{k-1}\\mathbf{r}_0\\}$ — the same subspace built by the Arnoldi process you will see in GMRES.',
      'The convergence rate is quantified by the condition number: $\\|\\mathbf{e}^{(k)}\\|_A \\leq 2\\left(\\frac{\\sqrt{\\kappa}-1}{\\sqrt{\\kappa}+1}\\right)^k \\|\\mathbf{e}^{(0)}\\|_A$ where $\\kappa = \\lambda_{\\max}/\\lambda_{\\min}$. To reduce error by $10^{-6}$, you need $k \\approx \\frac{1}{2}\\sqrt{\\kappa} \\cdot \\ln(2 \\times 10^6)$ iterations. For the 2D Poisson equation with $n = 10^6$ unknowns, $\\kappa = O(n^{2/3})$, so CG needs $O(n^{1/3})$ iterations — a massive improvement over the $O(n)$ needed by Gauss-Seidel. But the real unlock is preconditioning: if you can find a matrix $P \\approx A^{-1}$ that is cheap to apply, you can transform the system to have $\\kappa(PA) \\approx 1$, and CG on the preconditioned system converges in very few iterations.',
      'Where this is heading: the next lesson covers preconditioning in depth — how to build preconditioners that slash the condition number and make CG practical for the hardest problems. After that, GMRES generalizes the Krylov approach to non-symmetric matrices, where the energy norm no longer makes sense but the Krylov subspace idea still works. Together, preconditioned CG and GMRES are the algorithms that actually power the largest simulations in science and engineering today.',
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'How to Apply the Conjugate Gradient Method (5 Steps)',
        body: '1. **Verify $A$ is SPD.** Check $A = A^\\top$ and that all eigenvalues are positive (or that $A$ arises from a positive definite assembly). CG will diverge or produce nonsense if $A$ is not SPD.\n2. **Initialize.** Compute residual $\\mathbf{r}_0 = \\mathbf{b} - A\\mathbf{x}_0$ (use $\\mathbf{x}_0 = \\mathbf{0}$ if no better guess). Set direction $\\mathbf{d}_0 = \\mathbf{r}_0$. Store $\\rho_0 = \\mathbf{r}_0^\\top \\mathbf{r}_0$.\n3. **Compute step length.** One matrix-vector product: $\\mathbf{q} = A\\mathbf{d}_k$. Then $\\alpha_k = \\rho_k / (\\mathbf{d}_k^\\top \\mathbf{q})$. This is the EXACT minimizer of $f(\\mathbf{x}_k + \\alpha \\mathbf{d}_k)$ along direction $\\mathbf{d}_k$.\n4. **Update iterate and residual.** $\\mathbf{x}_{k+1} = \\mathbf{x}_k + \\alpha_k \\mathbf{d}_k$. $\\mathbf{r}_{k+1} = \\mathbf{r}_k - \\alpha_k \\mathbf{q}$. Reuse $\\mathbf{q}$ from step 3 — no extra matrix-vector product needed.\n5. **Update direction and loop.** $\\rho_{k+1} = \\mathbf{r}_{k+1}^\\top \\mathbf{r}_{k+1}$. $\\beta_k = \\rho_{k+1}/\\rho_k$. $\\mathbf{d}_{k+1} = \\mathbf{r}_{k+1} + \\beta_k \\mathbf{d}_k$. Stop when $\\sqrt{\\rho_{k+1}} < \\text{tol} \\cdot \\|\\mathbf{b}\\|$.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 2 of 5 — Iterative Solvers & Preconditioning',
        body: '**Previous (Lesson 1):** Jacobi and Gauss-Seidel — stationary iterations, matrix splitting, spectral radius convergence criterion.\n**This lesson:** Conjugate Gradient — Krylov subspace optimization, $A$-conjugate directions, $\\sqrt{\\kappa}$ convergence rate, eigenvalue clustering.\n**Next (Lesson 3):** GMRES — Krylov methods for non-symmetric systems via Arnoldi orthogonalization.',
      },
      {
        type: 'theorem',
        title: 'Conjugate Gradient Optimality',
        body: 'The $k$-th CG iterate $\\mathbf{x}_k$ satisfies:\n$\\mathbf{x}_k = \\arg\\min_{\\mathbf{x} \\in \\mathbf{x}_0 + \\mathcal{K}_k} \\|\\mathbf{x} - \\mathbf{x}^*\\|_A$\n\n(Minimizes energy norm error over the $k$-th Krylov subspace.)\n\nFinite termination: in exact arithmetic, CG finds the exact solution in at most $n$ steps (and fewer if eigenvalues cluster).',
      },
      {
        type: 'insight',
        title: 'Eigenvalue Clustering Speeds CG',
        body: 'CG converges in $m$ steps if the matrix has at most $m$ distinct eigenvalues.\n\nIf eigenvalues cluster into $m$ groups (even approximately), CG converges in roughly $m$ steps.\n\nThis is why **preconditioning** helps: a preconditioner $M \\approx A^{-1}$ transforms the system so eigenvalues cluster near 1, drastically reducing $\\kappa$ and the number of iterations.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Conjugate Gradient in Python',
        mathBridge: 'Implement CG from scratch and verify that convergence depends on eigenvalue distribution, not matrix size.',
        caption: 'A matrix with $m$ distinct eigenvalues converges in $m$ CG steps — independent of $n$.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'CG from scratch with convergence tracking',
              prose: [
                'Implement conjugate gradient on a tridiagonal SPD system, track the energy-norm error each step, and compare against the theoretical bound.',
                'CG algorithm: `r=b-A@x; p=r.copy(); rsold=r@r`. Each step: `Ap=A@p; alpha=rsold/(p@Ap); x+=alpha*p; r-=alpha*Ap; rsnew=r@r; beta=rsnew/rsold; p=r+beta*p; rsold=rsnew`. Track `residuals.append(np.sqrt(rsold))` and A-norm error `np.sqrt((x_true-x)@A@(x_true-x))`.',
                'Semilogy plot of residuals vs iteration. The theoretical bound: `‖e_k‖_A ≤ 2 * ((√κ-1)/(√κ+1))^k * ‖e_0‖_A` where κ=cond(A). Plot the theoretical bound as a dashed line. The actual convergence often beats the bound significantly — the bound is worst-case (for uniformly distributed eigenvalues), but clustered eigenvalues give super-linear convergence.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

# Tridiagonal SPD system (1D Poisson discretization)
n = 30
diag_vals = 4 * np.ones(n)
off_vals  = -1 * np.ones(n - 1)
A = np.diag(diag_vals) + np.diag(off_vals, 1) + np.diag(off_vals, -1)
b = np.ones(n)
x_star = np.linalg.solve(A, b)

kappa = np.linalg.cond(A)
rho = (np.sqrt(kappa) - 1) / (np.sqrt(kappa) + 1)
print(f"Condition number kappa = {kappa:.1f}")
print(f"CG convergence factor  = {rho:.4f}")

def energy_norm(e, A):
    return np.sqrt(e @ A @ e)

# Conjugate Gradient
x = np.zeros(n)
r = b - A @ x
d = r.copy()
rr = r @ r
errors = [energy_norm(x - x_star, A)]

for k in range(n):
    Ad = A @ d
    alpha = rr / (d @ Ad)
    x = x + alpha * d
    r = r - alpha * Ad
    rr_new = r @ r
    errors.append(energy_norm(x - x_star, A))
    if np.sqrt(rr_new) < 1e-12:
        print(f"Converged at step {k+1}")
        break
    beta = rr_new / rr
    d = r + beta * d
    rr = rr_new

# Plot with theoretical bound
k_vals = np.arange(len(errors))
theory = errors[0] * 2 * rho**k_vals
plt.figure(figsize=(7, 4))
plt.semilogy(k_vals, errors, 'b-o', markersize=4, label='CG energy-norm error')
plt.semilogy(k_vals, theory, 'r--', label=f'Bound: 2*(rho^k)*e0 (rho={rho:.3f})')
plt.xlabel('CG iteration'); plt.ylabel('Energy norm error')
plt.title(f'CG on {n}x{n} tridiagonal SPD (kappa={kappa:.1f})')
plt.legend(); plt.grid(True); plt.tight_layout(); plt.show()
`,
            },
            {
              id: 2,
              cellTitle: 'Distinct eigenvalues → exact convergence steps',
              prose: [
                'Verify empirically that CG converges in exactly m steps when the matrix has m distinct eigenvalues, regardless of the matrix size n.',
                'Build a 50×50 diagonal matrix with only 3 distinct eigenvalues: `A = np.diag(np.tile([1,2,5], 17)[:50])`. Run CG — it converges in exactly 3 steps! The reason: CG minimises the error over the Krylov space Kₖ(A,r₀); with m distinct eigenvalues, the minimal polynomial of A has degree m, and the exact solution lies in Kₘ.',
                'Test with different eigenvalue sets: `[1,2,5]` (3 distinct) → 3 steps. `[1,2,3,4,5]` (5 distinct) → 5 steps. `np.random.uniform(1,10,50)` (50 distinct) → up to 50 steps. This is the exact-arithmetic theorem: CG converges in at most m steps (number of distinct eigenvalues). In floating point, near-identical eigenvalues behave like one eigenvalue.',
              ],
              code: `import numpy as np

def run_cg(A, b, tol=1e-10):
    x = np.zeros(len(b)); r = b.copy(); d = r.copy(); rr = r @ r
    for k in range(len(b) + 1):
        if np.sqrt(rr) < tol:
            return k
        Ad = A @ d; alpha = rr / (d @ Ad)
        x += alpha * d; r -= alpha * Ad
        rr_new = r @ r
        beta = rr_new / rr; d = r + beta * d; rr = rr_new
    return len(b)

# Case 1: n=6 matrix with only 2 distinct eigenvalues {1, 10}
# Build as Q * diag(1,1,1,10,10,10) * Q^T for random orthogonal Q
rng = np.random.default_rng(42)
n = 6
Q, _ = np.linalg.qr(rng.standard_normal((n, n)))
lambdas_2 = np.array([1, 1, 1, 10, 10, 10], dtype=float)
A2 = Q @ np.diag(lambdas_2) @ Q.T
b2 = rng.standard_normal(n)
iters_2 = run_cg(A2, b2)
print(f"2 distinct eigenvalues, n={n}: CG converged in {iters_2} steps (expected ~2)")

# Case 2: same n, 6 distinct eigenvalues
lambdas_6 = np.array([1., 2., 4., 7., 12., 20.])
A6 = Q @ np.diag(lambdas_6) @ Q.T
iters_6 = run_cg(A6, b2)
print(f"6 distinct eigenvalues, n={n}: CG converged in {iters_6} steps (expected ~6)")

# Case 3: n=20 but only 3 distinct eigenvalues
n3 = 20
Q3, _ = np.linalg.qr(rng.standard_normal((n3, n3)))
lambdas_3 = np.array([1]*7 + [5]*7 + [25]*6, dtype=float)
A3 = Q3 @ np.diag(lambdas_3) @ Q3.T
b3 = rng.standard_normal(n3)
iters_3 = run_cg(A3, b3)
print(f"3 distinct eigenvalues, n={n3}: CG converged in {iters_3} steps (expected ~3)")
print("\\nConclusion: CG iteration count = number of DISTINCT eigenvalues, not matrix size!")
`,
            },
          ],
        },
      },
      {
        id: 'OpenMatNotebook',
        title: 'Conjugate Gradient Implementation',
        mathBridge: 'Implement CG from scratch and verify convergence rate.',
        caption: 'CG minimizes the energy norm error optimally over Krylov subspaces.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'CG implementation',
              prose: [
                'Implement conjugate gradient for an SPD system and track residual norm.',
                'CG in MATLAB: `r=b-A*x; p=r; rsold=r\'*r; for k=1:n, Ap=A*p; alpha=rsold/(p\'*Ap); x=x+alpha*p; r=r-alpha*Ap; rsnew=r\'*r; p=r+(rsnew/rsold)*p; rsold=rsnew; res(k)=sqrt(rsold); end`. Track `res` for the semilogy convergence plot.',
                'The residual plot shows linear convergence on a semilogy plot — each step reduces the residual by a roughly constant factor. The slope is `log((sqrt(kappa)-1)/(sqrt(kappa)+1))` where `kappa=cond(A)`. Larger condition number → shallower slope → more iterations needed. This directly motivates preconditioning: reduce kappa, get fewer iterations.',
              ],
              code: `% Build SPD test system (2D Poisson-like, small)
n = 20
% Tridiagonal SPD matrix
e = ones(n,1)
A = diag(4*e) + diag(-e(1:n-1), 1) + diag(-e(1:n-1), -1)
b = ones(n,1)
x_exact = A \\ b

% Conjugate Gradient
x = zeros(n,1)
r = b - A*x
d = r
rr = r' * r
residuals = []

for k = 1:n
    Ad = A * d
    alpha = rr / (d' * Ad)
    x = x + alpha * d
    r = r - alpha * Ad
    rr_new = r' * r
    residuals(end+1) = sqrt(rr_new)
    if sqrt(rr_new) < 1e-12
        disp(['CG converged at iteration ', num2str(k)])
        break
    end
    beta = rr_new / rr
    d = r + beta * d
    rr = rr_new
end

disp('First 10 residual norms:')
residuals(1:min(10,end))
disp('Final error:')
norm(x - x_exact) / norm(x_exact)
`,
            },
            {
              id: 2,
              cellTitle: 'Convergence vs condition number',
              prose: [
                'Compare CG iteration counts for systems with different condition numbers.',
                'Build SPD matrices with different condition numbers: `A_k = diag(linspace(1,kappa,n))` for kappa=5,20,100,500. Run CG to tolerance `1e-8` and record iteration counts. Plot iteration count vs kappa — it should grow as `~sqrt(kappa)` (the theoretical bound is `(1/2)*log(2/tol)*sqrt(kappa)`).',
                'A loglog plot of iterations vs kappa should show slope ~0.5 (square root relationship). The bar chart of iteration counts makes the message immediate: kappa=500 needs ~10× more iterations than kappa=5. This is why preconditioning (transforming to a system with smaller kappa) is so valuable — halving sqrt(kappa) halves iteration count.',
              ],
              code: `% Compare convergence for different kappa
function iters = run_cg(A, b, tol)
    n = length(b)
    x = zeros(n,1); r = b; d = r; rr = r'*r
    for k = 1:200
        Ad = A*d; alpha = rr/(d'*Ad)
        x = x + alpha*d; r = r - alpha*Ad
        rr_new = r'*r
        if sqrt(rr_new) < tol; iters = k; return; end
        d = r + (rr_new/rr)*d; rr = rr_new
    end
    iters = 200
end

% Well-conditioned: kappa ~ 3
n = 50
A1 = diag(linspace(1, 3, n))
b1 = ones(n,1)
i1 = run_cg(A1, b1, 1e-10)
disp(['kappa~3: iterations = ', num2str(i1)])

% Ill-conditioned: kappa ~ 100
A2 = diag(linspace(1, 100, n))
b2 = ones(n,1)
i2 = run_cg(A2, b2, 1e-10)
disp(['kappa~100: iterations = ', num2str(i2)])

disp('sqrt(kappa) heuristic:')
[sqrt(3), sqrt(100)]
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**$A$-orthogonality of directions.** The CG algorithm maintains $\\mathbf{d}_i^\\top A \\mathbf{d}_j = 0$ for $i \\neq j$ (in exact arithmetic). This means the search directions are mutually $A$-orthogonal, and each minimizes the error along a direction orthogonal to all previous. After $n$ such directions, the entire space has been searched — yielding the exact solution.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'CG as Polynomial Approximation',
        body: 'CG is equivalent to finding the polynomial $p_k$ of degree $\\leq k$ with $p_k(0) = 1$ that minimizes the error bound. The error satisfies:\n\n$\\|\\mathbf{e}^{(k)}\\|_A \\leq \\min_{p \\in \\mathcal{P}_k, p(0)=1} \\max_{\\lambda \\in \\sigma(A)} |p(\\lambda)| \\cdot \\|\\mathbf{e}^{(0)}\\|_A$\n\nChebyshev polynomials achieve the minimax bound, giving the $\\sqrt{\\kappa}$ convergence estimate.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Lanczos connection.** Running CG on $A$ implicitly builds an orthogonal tridiagonalization $T_k = Q_k^\\top A Q_k$ (Lanczos process). The CG iterates are the solutions of $T_k \\mathbf{y}_k = \\|\\mathbf{r}_0\\|\\mathbf{e}_1$. In finite arithmetic, orthogonality is lost (Lanczos breakdown) — practical implementations use reorthogonalization. The Lanczos eigenvalues (Ritz values) also give excellent estimates of the eigenvalues of $A$.',
      '**Preconditioned CG.** To accelerate convergence, replace the standard inner product with the $M$-inner product where $M \\approx A$ is a symmetric positive definite preconditioner: $\\langle \\mathbf{u}, \\mathbf{v} \\rangle_M = \\mathbf{u}^\\top M^{-1}\\mathbf{v}$. The preconditioned CG (PCG) iterates solve $M^{-1}A\\mathbf{x} = M^{-1}\\mathbf{b}$ but in the $M$-norm, and converge at rate $(\\sqrt{\\kappa(M^{-1}A)}-1)/(\\sqrt{\\kappa(M^{-1}A)}+1)$. Good preconditioners: incomplete Cholesky (IC or ICC), SSOR, algebraic multigrid (AMG). PCG requires one extra solve $M\\mathbf{z} = \\mathbf{r}$ per iteration — cheap if $M$ has sparse triangular factors.',
      '**Finite precision loss of orthogonality.** In exact arithmetic, the Krylov vectors $\\{\\mathbf{r}_0, A\\mathbf{r}_0, \\ldots\\}$ are theoretically orthogonal after each CG step. In floating point, round-off causes gradual loss of $A$-conjugacy: the effective rank of the Krylov basis grows more slowly than $k$, and CG may need more than $m$ steps even for a matrix with $m$ distinct eigenvalues. Practical strategies: (1) accept some extra iterations; (2) use the true residual $\\mathbf{r} = \\mathbf{b} - A\\mathbf{x}$ (recomputed from scratch every 50 steps) to detect stagnation; (3) use the Lanczos-based MINRES with selective reorthogonalization.',
      '**Nonlinear CG and optimization.** The Fletcher-Reeves (FR) formula $\\beta_k = \\|\\mathbf{g}_{k+1}\\|^2/\\|\\mathbf{g}_k\\|^2$ (where $\\mathbf{g}_k = \\nabla f(\\mathbf{x}_k)$) generalizes linear CG to nonlinear objective functions. The Polak-Ribière (PR) variant $\\beta_k = \\mathbf{g}_{k+1}^\\top(\\mathbf{g}_{k+1} - \\mathbf{g}_k)/\\|\\mathbf{g}_k\\|^2$ is preferred in practice — it resets the direction when $\\beta_k < 0$, avoiding convergence to saddle points. Nonlinear CG underpins training algorithms for neural networks (CG-based optimizers) and is a core tool in large-scale nonlinear optimization.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Variants: MINRES, SYMMLQ, BiCG, BiCGSTAB',
        body: 'CG requires $A$ to be SPD. For symmetric indefinite matrices: MINRES (minimizes residual norm), SYMMLQ.\n\nFor non-symmetric $A$: BiCG, BiCGSTAB (stabilized BiCG), TFQMR. These are all Krylov methods but without the clean optimality of CG.\n\nThe gold standard for non-symmetric: GMRES (next lesson).',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la9-002-1',
      title: 'Exact convergence for 2-eigenvalue matrix',
      problem: 'If $A$ has only 2 distinct eigenvalues, how many CG steps to find the exact solution?',
      solution: 'CG converges in at most $m$ steps where $m$ is the number of distinct eigenvalues. With 2 distinct eigenvalues, CG converges in exactly 2 steps regardless of matrix size $n$.',
    },
    {
      id: 'ex-la9-002-2',
      title: 'Full 2-step CG on a 2×2 system',
      problem: 'For $A = \\begin{bmatrix}4&1\\\\1&3\\end{bmatrix}$, $\\mathbf{b} = (9,7)^\\top$, $\\mathbf{x}_0 = (0,0)^\\top$: complete both CG steps and verify the exact solution is reached.',
      solution: 'Step 1: $\\mathbf{r}_0 = (9,7)^\\top$, $\\mathbf{p}_0 = (9,7)^\\top$. $A\\mathbf{p}_0 = (43,30)^\\top$. $\\alpha_0 = 130/597$. $\\mathbf{x}_1 \\approx (1.960, 1.525)^\\top$, $\\mathbf{r}_1 = \\mathbf{r}_0 - \\alpha_0 A\\mathbf{p}_0 \\approx (-0.437, 0.583)^\\top$. Step 2: $\\beta_0 = \\|\\mathbf{r}_1\\|^2/\\|\\mathbf{r}_0\\|^2$, $\\mathbf{p}_1 = \\mathbf{r}_1 + \\beta_0 \\mathbf{p}_0$ ($A$-conjugate to $\\mathbf{p}_0$). After step 2: $\\mathbf{x}_2 = (2, 5/3)^\\top$ exactly. Two steps = two distinct eigenvalues of $A$.',
    },
    {
      id: 'ex-la9-002-3',
      title: 'Effect of condition number on CG iteration count',
      problem: 'Estimate the number of CG iterations to reduce the error by $10^{-6}$ for (a) $\\kappa = 4$, (b) $\\kappa = 100$.',
      solution: 'Using $k \\approx \\frac{1}{2}\\sqrt{\\kappa}\\ln(2/\\varepsilon)$ with $\\varepsilon = 10^{-6}$: $\\ln(2 \\times 10^6) \\approx 14.5$. (a) $\\kappa = 4$: $k \\approx \\frac{1}{2}\\cdot 2 \\cdot 14.5 \\approx 15$ iterations. (b) $\\kappa = 100$: $k \\approx \\frac{1}{2}\\cdot 10 \\cdot 14.5 \\approx 73$ iterations. A 25× larger condition number gives about 5× more iterations — CG is much less sensitive to $\\kappa$ than Gauss-Seidel (which scales linearly in $\\kappa$).',
    },
  ],

  challenges: [
    {
      id: 'ch-la9-002-1',
      title: 'Steepest descent vs CG convergence rate',
      difficulty: 'medium',
      problem: 'Compare the convergence factor of steepest descent to CG for $\\kappa = 100$. By how many iterations does CG beat steepest descent to reach error $10^{-6}$?',
      walkthrough: [
        { expression: '\\text{Steepest descent factor: } \\rho_{SD} = \\left(\\frac{\\kappa-1}{\\kappa+1}\\right)^2 = \\left(\\frac{99}{101}\\right)^2 \\approx 0.9610', annotation: 'Steepest descent error reduces by factor $\\rho_{SD}$ per step; for $\\kappa=100$ this is close to 1 — very slow.' },
        { expression: '\\text{CG factor: } \\rho_{CG} = \\left(\\frac{\\sqrt{\\kappa}-1}{\\sqrt{\\kappa}+1}\\right)^2 = \\left(\\frac{9}{11}\\right)^2 \\approx 0.6694', annotation: 'CG uses $\\sqrt{\\kappa}$ in the formula — for $\\kappa=100$, $\\sqrt{\\kappa}=10$.' },
        { expression: 'k_{SD} = \\log(10^{-6}/2)/\\log(0.9610) \\approx 370', annotation: 'Steepest descent needs about 370 iterations.' },
        { expression: 'k_{CG} = \\log(10^{-6}/2)/\\log(0.6694) \\approx 34', annotation: 'CG needs only about 34 iterations. The $\\sqrt{\\kappa}$ vs $\\kappa$ difference is enormous.' },
        { expression: '370 / 34 \\approx 11\\times \\text{ speedup}', annotation: 'CG is about 11 times faster for $\\kappa = 100$. As $\\kappa$ grows, CG advantage grows as $\\sqrt{\\kappa}$.' },
      ],
    },
    {
      id: 'ch-la9-002-2',
      title: 'Verify $A$-conjugacy after step 1',
      difficulty: 'easy',
      problem: 'For $A = \\begin{bmatrix}4&1\\\\1&3\\end{bmatrix}$, $\\mathbf{x}_0 = \\mathbf{0}$, $\\mathbf{b} = (9,7)^\\top$: compute the first CG step and verify that $\\mathbf{d}_1^\\top A \\mathbf{d}_0 = 0$ ($A$-conjugacy).',
      walkthrough: [
        { expression: '\\mathbf{r}_0 = (9,7)^\\top,\\quad \\mathbf{d}_0 = (9,7)^\\top', annotation: 'Initial residual = initial direction.' },
        { expression: 'A\\mathbf{d}_0 = (4\\cdot9+1\\cdot7,\\ 1\\cdot9+3\\cdot7)^\\top = (43,30)^\\top', annotation: 'Matrix-vector product.' },
        { expression: '\\alpha_0 = \\frac{\\mathbf{r}_0^\\top\\mathbf{r}_0}{\\mathbf{d}_0^\\top A\\mathbf{d}_0} = \\frac{81+49}{9\\cdot43+7\\cdot30} = \\frac{130}{597}', annotation: 'Optimal step length.' },
        { expression: '\\mathbf{r}_1 = \\mathbf{r}_0 - \\alpha_0 A\\mathbf{d}_0 = (9,7)^\\top - \\frac{130}{597}(43,30)^\\top \\approx (-0.366, 0.488)^\\top', annotation: 'New residual.' },
        { expression: '\\beta_0 = \\frac{\\mathbf{r}_1^\\top\\mathbf{r}_1}{\\mathbf{r}_0^\\top\\mathbf{r}_0} \\approx \\frac{0.372}{130} \\approx 0.00286', annotation: 'Direction update coefficient.' },
        { expression: '\\mathbf{d}_1 = \\mathbf{r}_1 + \\beta_0 \\mathbf{d}_0 \\approx (-0.340, 0.508)^\\top', annotation: 'New conjugate direction.' },
        { expression: '\\mathbf{d}_1^\\top A\\mathbf{d}_0 = (-0.340)(43) + (0.508)(30) \\approx -14.62 + 15.24 \\approx 0 \\checkmark', annotation: '$A$-conjugacy verified — the correction via $\\beta_0$ exactly removes the $A$-component along $\\mathbf{d}_0$.' },
      ],
    },
    {
      id: 'ch-la9-002-3',
      title: 'CG terminates in 2 steps on a 3×3 matrix with 2 eigenvalues',
      difficulty: 'hard',
      problem: 'Let $A = \\text{diag}(1,1,4)$ and $\\mathbf{b} = (1,1,1)^\\top$. Show that CG starting from $\\mathbf{x}_0 = \\mathbf{0}$ converges in exactly 2 steps even though $n = 3$.',
      walkthrough: [
        { expression: '\\mathbf{r}_0 = (1,1,1)^\\top,\\quad \\mathbf{d}_0 = (1,1,1)^\\top', annotation: 'Initial residual and direction.' },
        { expression: 'A\\mathbf{d}_0 = (1,1,4)^\\top', annotation: '$A$ is diagonal so $A\\mathbf{d}_0$ just scales each component.' },
        { expression: '\\alpha_0 = \\frac{3}{1+1+4} = \\frac{3}{6} = \\frac{1}{2}', annotation: '$\\rho_0 = 1+1+1=3$; $\\mathbf{d}_0^\\top A\\mathbf{d}_0 = 1+1+4=6$.' },
        { expression: '\\mathbf{x}_1 = (1/2, 1/2, 1/2)^\\top,\\quad \\mathbf{r}_1 = (1/2, 1/2, -1)^\\top', annotation: '$\\mathbf{r}_1 = (1,1,1) - (1/2)(1,1,4) = (1/2, 1/2, -1)$.' },
        { expression: '\\beta_0 = \\frac{1/4+1/4+1}{3} = \\frac{3/2}{3} = 1/2', annotation: '$\\rho_1 = 1/4+1/4+1 = 3/2$; $\\beta_0 = (3/2)/3 = 1/2$.' },
        { expression: '\\mathbf{d}_1 = (1/2+1/2,\\ 1/2+1/2,\\ -1+1/2)^\\top = (1,1,-1/2)^\\top', annotation: '$\\mathbf{d}_1 = \\mathbf{r}_1 + \\beta_0 \\mathbf{d}_0$.' },
        { expression: 'A\\mathbf{d}_1 = (1,1,-2)^\\top,\\quad \\alpha_1 = \\frac{3/2}{1+1+1} = \\frac{1}{2}', annotation: '$\\mathbf{d}_1^\\top A\\mathbf{d}_1 = 1+1+1=3$; $\\alpha_1 = (3/2)/3 = 1/2$.' },
        { expression: '\\mathbf{x}_2 = (1/2+1/2,\\ 1/2+1/2,\\ 1/2-1/4)^\\top = (1,1,1/4)^\\top = A^{-1}\\mathbf{b} \\checkmark', annotation: 'Exact solution: $A^{-1}\\mathbf{b} = \\text{diag}(1,1,1/4)(1,1,1)^\\top = (1,1,1/4)^\\top$. 2 steps for 2 distinct eigenvalues ✓' },
      ],
    },
  ],

  mentalModel: [
    'CG solves $A\\mathbf{x} = \\mathbf{b}$ for SPD $A$ by minimizing energy norm error over Krylov subspaces.',
    'Each step: one matrix-vector product, $O(n)$ ops. Converges in $\\leq n$ steps (exact) or $O(\\sqrt{\\kappa})$ steps (practical).',
    'Eigenvalue clustering (few distinct eigenvalues) $\\Rightarrow$ fast convergence.',
    'Preconditioning reduces $\\kappa$, dramatically cutting iteration count.',
  ],

  checkpoints: [
    { id: 'cp-la9-002-1', label: 'What property must $A$ have for CG to be applicable?', type: 'read' },
    { id: 'cp-la9-002-2', label: 'How many CG steps are needed in exact arithmetic?', type: 'read' },
    { id: 'cp-la9-002-3', label: 'What is the $k$-th Krylov subspace $\\mathcal{K}_k(A, \\mathbf{r}_0)$?', type: 'read' },
    { id: 'cp-la9-002-4', label: 'Run the CG implementation notebook cell and verify that residuals decrease monotonically in the energy norm.', type: 'lab' },
    { id: 'cp-la9-002-5', label: 'Modify the convergence notebook cell to also time Gauss-Seidel and compare iteration counts.', type: 'lab' },
    { id: 'cp-la9-002-6', label: 'Verify example 2 by computing step 1 of CG by hand for the 2×2 system and checking $\\mathbf{x}_1$.', type: 'example' },
    { id: 'cp-la9-002-7', label: 'Verify example 3: estimate CG iterations for $\\kappa=4$ and $\\kappa=100$ using the formula, then check with the notebook.', type: 'example' },
    { id: 'cp-la9-002-8', label: 'Design a matrix with 3 clustered eigenvalue groups and predict CG will converge in ~3 steps. Verify experimentally.', type: 'challenge' },
  ],

  assessment: 'For $A = \\begin{bmatrix}4&1\\\\1&3\\end{bmatrix}$, $\\mathbf{b} = (1,2)^\\top$, $\\mathbf{x}_0 = \\mathbf{0}$: perform 2 CG steps by hand and verify you recover the exact solution.',

  quiz: [
    { id: 'q-la9-002-1', type: 'choice', text: 'CG is applicable to:', options: ['Any invertible matrix', 'Symmetric positive definite matrices only', 'Symmetric indefinite matrices', 'Upper triangular matrices'], answer: 'Symmetric positive definite matrices only', hints: ['CG requires the $A$-inner product to be well-defined, which needs SPD.'], reviewSection: 'intuition' },
    { id: 'q-la9-002-2', type: 'choice', text: 'The convergence rate of CG depends on:', options: ['$\\det A$', '$\\text{tr}(A)$', '$\\kappa(A) = \\lambda_{max}/\\lambda_{min}$', '$\\|A\\|_F$'], answer: '$\\kappa(A) = \\lambda_{max}/\\lambda_{min}$', hints: ['The error bound uses $\\sqrt{\\kappa}$ in the convergence factor.'], reviewSection: 'intuition' },
    { id: 'q-la9-002-3', type: 'choice', text: 'The $k$-th CG iterate minimizes the energy norm error over:', options: ['All vectors', 'The span of $A^k\\mathbf{b}$', 'The $k$-th Krylov subspace', 'The eigenspace'], answer: 'The $k$-th Krylov subspace', hints: ['CG is optimal over $\\mathbf{x}_0 + \\mathcal{K}_k(A,\\mathbf{r}_0)$.'], reviewSection: 'intuition' },
    { id: 'q-la9-002-4', type: 'choice', text: 'In the 2×2 CG example with $A=\\begin{bmatrix}4&1\\\\1&3\\end{bmatrix}$, the first step length $\\alpha_0$ equals:', options: ['$130/597$', '$9/43$', '$1/4$', '$130/43$'], answer: '$130/597$', hints: ['$\\alpha_0 = \\mathbf{r}_0^\\top\\mathbf{r}_0 / (\\mathbf{p}_0^\\top A\\mathbf{p}_0) = (81+49)/(9\\cdot43+7\\cdot30)$.'], reviewSection: 'intuition' },
    { id: 'q-la9-002-5', type: 'choice', text: 'CG converges in exactly $m$ steps when:', options: ['$n = m$', '$A$ has at most $m$ distinct eigenvalues', '$\\kappa(A) = m$', '$A$ is $m\\times m$'], answer: '$A$ has at most $m$ distinct eigenvalues', hints: ['The polynomial interpretation: CG needs degree $m$ to annihilate $m$ eigenvalues.'], reviewSection: 'intuition' },
    { id: 'q-la9-002-6', type: 'choice', text: 'The direction update $\\mathbf{d}_{k+1} = \\mathbf{r}_{k+1} + \\beta_k \\mathbf{d}_k$ ensures:', options: ['$\\|\\mathbf{r}_{k+1}\\| = 0$', '$\\mathbf{d}_{k+1}$ is $A$-orthogonal to all previous directions', '$\\mathbf{x}_{k+1}$ minimizes $f$ globally', 'The step length $\\alpha_{k+1} = 1$'], answer: '$\\mathbf{d}_{k+1}$ is $A$-orthogonal to all previous directions', hints: ['$\\beta_k$ is chosen so $\\mathbf{d}_{k+1}^\\top A \\mathbf{d}_k = 0$.'], reviewSection: 'intuition' },
    { id: 'q-la9-002-7', type: 'choice', text: 'For $\\kappa = 100$, CG requires roughly how many iterations to reduce error by $10^{-6}$?', options: ['About 5', 'About 35', 'About 73', 'About 1000'], answer: 'About 73', hints: ['Use $k \\approx \\frac{1}{2}\\sqrt{\\kappa}\\ln(2/\\varepsilon) = \\frac{1}{2}\\cdot 10 \\cdot 14.5 \\approx 73$.'], reviewSection: 'intuition' },
    { id: 'q-la9-002-8', type: 'choice', text: 'The CG algorithm requires exactly one __________ per iteration:', options: ['LU factorization', 'matrix-vector product $A\\mathbf{d}_k$', 'eigenvalue computation', 'QR factorization'], answer: 'matrix-vector product $A\\mathbf{d}_k$', hints: ['All other operations are $O(n)$ vector operations.'], reviewSection: 'intuition' },
    { id: 'q-la9-002-9', type: 'choice', text: 'Steepest descent differs from CG in that:', options: ['It does not require $A$ to be SPD', 'It resets the search direction to the residual at each step', 'It converges in $n$ steps exactly', 'It minimizes the 2-norm of the error'], answer: 'It resets the search direction to the residual at each step', hints: ['Steepest descent uses $\\mathbf{d}_k = \\mathbf{r}_k$; CG uses $\\mathbf{d}_k = \\mathbf{r}_k + \\beta_{k-1}\\mathbf{d}_{k-1}$.'], reviewSection: 'challenges' },
    { id: 'q-la9-002-10', type: 'choice', text: 'The Lanczos connection tells us that CG implicitly builds:', options: ['The LU factorization of $A$', 'An orthogonal tridiagonalization $T_k = Q_k^\\top A Q_k$', 'The eigenvalue decomposition of $A$', 'A sparse Cholesky factor'], answer: 'An orthogonal tridiagonalization $T_k = Q_k^\\top A Q_k$', hints: ['The Krylov vectors form the columns of $Q_k$; the recurrence produces a tridiagonal Hessenberg matrix.'], reviewSection: 'rigor' },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Given a 3×3 SPD matrix, run the first 2 CG iterations by hand, computing $\\alpha_k$, $\\mathbf{x}_{k+1}$, $\\mathbf{r}_{k+1}$, $\\beta_k$, and $\\mathbf{d}_{k+1}$.',
    explainVerbally: 'Explain to a classmate why CG converges faster when eigenvalues cluster: use the polynomial minimax interpretation.',
    detectIncorrectApplication: 'Recognize when CG is being applied to a non-SPD matrix and explain why the energy norm minimization breaks down (the quadratic $f(x)$ is not bowl-shaped).',
    transferToUnfamiliar: 'Given a preconditioned system $M^{-1}A\\mathbf{x} = M^{-1}\\mathbf{b}$, identify the modified inner product used by preconditioned CG and explain how it preserves the SPD structure.',
  },

  misconceptions: [
    {
      falseBelief: 'CG finds the exact solution only if $n$ steps are taken.',
      whyStudentsThinkIt: 'The "$n$-step finite termination" result is memorable but students forget the eigenvalue-clustering improvement.',
      correctionExample: 'If $A$ has only $m < n$ distinct eigenvalues, CG terminates in $m$ steps. A $1000 \\times 1000$ matrix with only 3 distinct eigenvalues is solved by CG in 3 steps.',
      contrastCase: 'A diagonal matrix $\\text{diag}(1,1,1,2,2,100)$ has 3 distinct eigenvalues — CG solves the 6×6 system in 3 steps.',
    },
    {
      falseBelief: 'CG requires storing all previous search directions.',
      whyStudentsThinkIt: 'The $A$-orthogonality of all $\\mathbf{d}_i$ sounds like it needs all of them.',
      correctionExample: 'The three-term recurrence is the key insight: $\\mathbf{d}_{k+1} = \\mathbf{r}_{k+1} + \\beta_k \\mathbf{d}_k$ only needs the current residual and the previous direction. Memory cost is $O(n)$, not $O(kn)$.',
      contrastCase: 'Compare to GMRES (next lesson) which actually does store all $k$ Krylov vectors — that is why GMRES has $O(kn)$ memory while CG has $O(n)$.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You need to solve a sequence of linear systems $A\\mathbf{x}_j = \\mathbf{b}_j$ for 100 different right-hand sides with the same SPD matrix $A$.',
      competingTechniques: 'CG (run independently for each $\\mathbf{b}_j$), sparse Cholesky (factor once, solve many), block CG.',
      whyThisTechniqueWins: 'Sparse Cholesky wins: factor $A = LL^\\top$ once in $O(\\text{nnz fill})$ time, then solve each system in $O(n)$ via triangular solves. CG would need $O(\\sqrt{\\kappa})$ iterations for each of the 100 systems.',
    },
    {
      situation: 'The system $A\\mathbf{x} = \\mathbf{b}$ comes from a 2D finite element mesh with $n = 10^6$ unknowns. You need one solve.',
      competingTechniques: 'CG with no preconditioner, CG with ILU, CG with AMG, direct sparse Cholesky.',
      whyThisTechniqueWins: 'CG with AMG preconditioner: direct Cholesky has $O(n^{3/2})$ fill for 2D problems (too expensive at $n = 10^6$). Unpreconditioned CG needs $O(\\sqrt{n}) = O(1000)$ iterations. AMG reduces $\\kappa$ to $O(1)$, giving convergence in dozens of iterations.',
    },
  ],

  semantics: {
    core: [
      { symbol: '\\mathcal{K}_k(A,\\mathbf{r}_0) = \\operatorname{span}\\{\\mathbf{r}_0, A\\mathbf{r}_0, \\ldots, A^{k-1}\\mathbf{r}_0\\}', meaning: '$k$-th Krylov subspace — the search space for the $k$-th CG iterate. Grows by one dimension per step.' },
      { symbol: '\\langle \\mathbf{u},\\mathbf{v}\\rangle_A = \\mathbf{u}^\\top A\\mathbf{v}', meaning: '$A$-inner product (energy inner product) — the geometry in which CG performs its orthogonalization. Requires $A \\succ 0$.' },
      { symbol: '\\alpha_k = \\frac{\\mathbf{r}_k^\\top\\mathbf{r}_k}{\\mathbf{d}_k^\\top A\\mathbf{d}_k}', meaning: 'Optimal CG step length — exact minimizer of $f(\\mathbf{x}_k + \\alpha \\mathbf{d}_k)$ along direction $\\mathbf{d}_k$. One matrix-vector product $A\\mathbf{d}_k$ per step.' },
      { symbol: '\\beta_k = \\frac{\\mathbf{r}_{k+1}^\\top\\mathbf{r}_{k+1}}{\\mathbf{r}_k^\\top\\mathbf{r}_k}', meaning: 'Direction update coefficient — chosen to make $\\mathbf{d}_{k+1}$ $A$-conjugate to $\\mathbf{d}_k$. Requires only inner products, no extra matrix products.' },
      { symbol: '\\|\\mathbf{e}^{(k)}\\|_A = \\sqrt{(\\mathbf{x}^*-\\mathbf{x}_k)^\\top A (\\mathbf{x}^*-\\mathbf{x}_k)}', meaning: 'Energy norm of the error — the quantity CG minimizes at each step. Equals the 2-norm for the preconditioned system.' },
      { symbol: '\\|\\mathbf{e}^{(k)}\\|_A \\leq 2\\left(\\frac{\\sqrt{\\kappa}-1}{\\sqrt{\\kappa}+1}\\right)^k \\|\\mathbf{e}^{(0)}\\|_A', meaning: 'CG convergence bound — the factor $(\\sqrt{\\kappa}-1)/(\\sqrt{\\kappa}+1)$ replaces the $(\\kappa-1)/(\\kappa+1)$ factor of steepest descent, giving $\\sqrt{\\kappa}$ vs $\\kappa$ in the exponent.' },
    ],
    rulesOfThumb: [
      'CG converges in exactly $m$ steps in exact arithmetic when $A$ has $m$ distinct eigenvalues — matrix size $n$ does not matter.',
      'Practical iteration count is $O(\\sqrt{\\kappa})$ — a factor of $\\sqrt{\\kappa}$ better than stationary methods ($O(\\kappa)$ iterations).',
      'Each CG iteration costs exactly one matrix-vector product plus $O(n)$ vector operations — the dominant cost is the sparsity of $A$.',
      'Preconditioning is almost always essential: for finite element problems, AMG preconditioned CG reduces $O(\\sqrt{n})$ to $O(1)$ iterations.',
      'CG only stores 3 vectors ($\\mathbf{x}, \\mathbf{r}, \\mathbf{d}$) regardless of iteration count — $O(n)$ memory, unlike GMRES which stores the full Krylov basis.',
    ],
  },

  spiral: {
    recoveryPoints: ['la5-003', 'la9-001'],
    futureLinks: ['la9-003', 'la9-004'],
  },

  debugging: [
    {
      commonError: 'Applying CG to a non-symmetric or indefinite matrix.',
      symptom: 'Residuals fail to decrease, or the step lengths $\\alpha_k$ become negative or zero.',
      whyItHappened: 'CG requires $\\mathbf{d}^\\top A \\mathbf{d} > 0$ (positive definite) to guarantee $\\alpha_k > 0$. If $A$ is not SPD, this can fail.',
      repairStrategy: 'Check symmetry ($\\|A - A^\\top\\| < \\varepsilon$) and positive definiteness ($\\min_i \\lambda_i > 0$) before applying CG. Use GMRES or MINRES for non-symmetric or indefinite systems.',
    },
    {
      commonError: 'Using the incorrect update $\\mathbf{r}_{k+1} = \\mathbf{b} - A\\mathbf{x}_{k+1}$ (recomputing residual) instead of $\\mathbf{r}_{k+1} = \\mathbf{r}_k - \\alpha_k A\\mathbf{d}_k$.',
      symptom: 'The code works but is twice as expensive per iteration; in finite precision, accumulated errors are larger.',
      whyItHappened: 'The recurrence update is equivalent in exact arithmetic but more efficient. Students naturally recompute the residual from scratch.',
      repairStrategy: 'Use the recurrence update $\\mathbf{r}_{k+1} = \\mathbf{r}_k - \\alpha_k A\\mathbf{d}_k$ (reuses the already-computed product $A\\mathbf{d}_k$). Periodically recompute the true residual as a check.',
    },
  ],
};
