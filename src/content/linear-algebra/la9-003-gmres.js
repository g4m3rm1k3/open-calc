export default {
  id: 'la9-003',
  slug: 'gmres',
  chapter: 'la9',
  order: 3,
  title: 'GMRES',
  subtitle: 'GMRES (Generalized Minimal Residual) solves any non-singular linear system $A\\mathbf{x} = \\mathbf{b}$ by minimizing the residual norm over a growing Krylov subspace. The Arnoldi process builds an orthonormal basis incrementally.',
  tags: ['GMRES', 'Krylov method', 'Arnoldi', 'non-symmetric', 'residual minimization', 'Hessenberg', 'restart', 'iterative solver'],
  aliases: 'GMRES generalized minimal residual Krylov method Arnoldi process non-symmetric Hessenberg least squares restart iterative solver',

  hook: {
    question: "CG is ideal for symmetric positive definite systems, but what about non-symmetric systems arising in fluid dynamics, Helmholtz equations, or graph algorithms? Can you still exploit the Krylov structure?",
    realWorldContext: "Non-symmetric linear systems arise everywhere: Navier-Stokes equations (fluid dynamics), convection-dominated transport, time-dependent PDEs, optimization. GMRES is the algorithm of choice for these systems — used in computational fluid dynamics (ANSYS Fluent, OpenFOAM), electromagnetics (COMSOL), semiconductor device simulation, and scientific machine learning. PETSc (the Portable, Extensible Toolkit for Scientific computation) ships GMRES as a first-class solver.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**The idea: minimize residual over Krylov subspace.** GMRES finds $\\mathbf{x}_k \\in \\mathbf{x}_0 + \\mathcal{K}_k(A, \\mathbf{r}_0)$ that minimizes $\\|\\mathbf{b} - A\\mathbf{x}_k\\|_2$ (the residual norm). Unlike CG, this is a least-squares problem — no symmetry required.',
      '**Arnoldi process.** GMRES builds an orthonormal basis $\\{\\mathbf{q}_1, \\ldots, \\mathbf{q}_k\\}$ for $\\mathcal{K}_k$ via modified Gram-Schmidt applied to $\\{\\mathbf{r}_0, A\\mathbf{r}_0, A^2\\mathbf{r}_0, \\ldots\\}$. The Arnoldi relation: $AQ_k = Q_{k+1}\\tilde{H}_k$ where $\\tilde{H}_k$ is a $(k+1) \\times k$ upper Hessenberg matrix. The minimization $\\min\\|\\mathbf{b} - A\\mathbf{x}\\|$ reduces to a small least-squares problem $\\min\\|\\|\\mathbf{r}_0\\|\\mathbf{e}_1 - \\tilde{H}_k\\mathbf{y}\\|$ solved by QR factorization of $\\tilde{H}_k$.',
      '**Storage growth and restarting.** Full GMRES stores all $k$ basis vectors: $O(kn)$ memory. After $k = n$ steps, the exact solution is found. In practice, GMRES(m) restarts every $m$ steps: discard the Krylov basis, restart from current residual. Restarting sacrifices optimality but controls memory. Typical: $m = 20$–$100$. Without restarting, GMRES stagnates less but memory grows.',
      '**Convergence.** GMRES is guaranteed to converge: $\\|\\mathbf{r}_k\\| \\leq \\|\\mathbf{r}_0\\|$ (residual is monotonically non-increasing) and $\\|\\mathbf{r}_n\\| = 0$ (exact after $n$ steps). Practical convergence depends on the spectrum of $A$ — if eigenvalues are clustered away from 0, GMRES converges fast. Theoretical bounds use pseudospectrum or field of values.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'GMRES vs CG',
        body: 'Both are Krylov methods, but:\n\n| | CG | GMRES |\n|---|---|---|\n| Applicability | SPD only | Any non-singular |\n| Optimality | Min $\\|e\\|_A$ | Min $\\|r\\|_2$ |\n| Memory | $O(n)$ | $O(kn)$ |\n| Orthogonalization | Implicit (3-term) | Explicit (Arnoldi) |\n| Monotone residual | No | Yes |\n\nCG is preferred for SPD; GMRES for non-symmetric.',
      },
      {
        type: 'warning',
        title: 'GMRES Stagnation',
        body: 'GMRES(m) (restarted) can stagnate — the residual fails to decrease across restarts if the Krylov subspace does not contain useful directions. This happens for matrices with complex spectrum or highly non-normal $A$.\n\nFix: use a better preconditioner, increase restart parameter $m$, or switch to flexible GMRES (FGMRES) which allows varying preconditioners.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'GMRES Arnoldi Process',
        mathBridge: 'Build the Arnoldi basis and solve a non-symmetric system.',
        caption: 'GMRES: each iteration extends the Krylov basis and solves a growing least-squares problem.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Arnoldi factorization',
              prose: ['Build the Arnoldi basis Q and upper Hessenberg matrix H for a small non-symmetric system.'],
              code: `% Non-symmetric test matrix
A = [3 1 0;
     1 2 1;
     0 2 4]
b = [1; 2; 1]
n = 3

% Arnoldi process: build Q_k and H_k
% AQ_k = Q_{k+1} H_k (Hessenberg relation)
q1 = b / norm(b)
Q = q1  % n x k matrix (will grow)
H = []  % Hessenberg entries

for j = 1:n-1
    v = A * Q(:,j)
    h = zeros(j+1, 1)
    for i = 1:j
        h(i) = Q(:,i)' * v
        v = v - h(i) * Q(:,i)
    end
    h(j+1) = norm(v)
    Q = [Q, v/h(j+1)]   % add new basis vector
    H = [H; zeros(1,size(H,2))]   % grow H
    H = [H, h]           % add new column
end
disp('Hessenberg matrix H:')
H
disp('Q orthonormal check (Q^T Q should be I):')
Q' * Q
`,
            },
            {
              id: 2,
              cellTitle: 'Full GMRES solve',
              prose: ['Use built-in gmres to solve a non-symmetric system and compare to direct solve.'],
              code: `% Non-symmetric convection-diffusion-like matrix
n = 30
h = 1/(n+1)
% Tridiagonal with asymmetric upwind term
diag_main = 2*ones(n,1)/h^2
diag_up   = (-1/h^2 + 1/(2*h))*ones(n-1,1)  % upwind
diag_dn   = (-1/h^2 - 1/(2*h))*ones(n-1,1)
A = diag(diag_main) + diag(diag_up,1) + diag(diag_dn,-1)
b = ones(n,1)

disp('Is A symmetric?')
norm(A - A', 'fro') < 1e-10

% Solve with direct method
x_exact = A \ b

% GMRES (tolerance 1e-8, max 100 iters, restart 20)
x_gmres = gmres(A, b, 20, 1e-8, 100)
disp('GMRES relative error:')
norm(x_gmres - x_exact) / norm(x_exact)
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**The Arnoldi-Hessenberg relation.** After $k$ Arnoldi steps: $AQ_k = Q_{k+1}\\tilde{H}_k$ where $Q_k \\in \\mathbb{R}^{n \\times k}$ has orthonormal columns and $\\tilde{H}_k \\in \\mathbb{R}^{(k+1) \\times k}$ is upper Hessenberg. Writing $\\mathbf{x}_k = \\mathbf{x}_0 + Q_k\\mathbf{y}$: $\\|\\mathbf{b} - A\\mathbf{x}_k\\|_2 = \\|\\|\\mathbf{r}_0\\|\\mathbf{e}_1 - \\tilde{H}_k\\mathbf{y}\\|_2$. This is a $(k+1) \\times k$ least-squares problem solved cheaply by QR factorization of $\\tilde{H}_k$.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Convergence for Normal Matrices',
        body: 'For normal matrices ($A^\\top A = AA^\\top$, e.g., symmetric or unitary), GMRES converges exactly like the polynomial min-max problem over the spectrum of $A$. The best degree-$k$ polynomial $p_k$ (with $p_k(0)=1$) minimizing $\\max_{\\lambda \\in \\sigma(A)}|p_k(\\lambda)|$ determines the convergence bound:\n\n$\\|\\mathbf{r}_k\\| \\leq \\min_{p_k, p_k(0)=1} \\max_{\\lambda \\in \\sigma(A)} |p_k(\\lambda)| \\cdot \\|\\mathbf{r}_0\\|$\n\nFor non-normal matrices, the pseudospectrum (not just the spectrum) governs convergence.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Non-normality and pseudospectrum.** For highly non-normal matrices (e.g., upper triangular with eigenvalues near 0), GMRES can stagnate even when eigenvalues are small. The $\\varepsilon$-pseudospectrum $\\sigma_\\varepsilon(A) = \\{z : \\|(zI - A)^{-1}\\| > 1/\\varepsilon\\}$ is a better indicator of convergence. Trefethen\'s book "Spectra and Pseudospectra" gives the full theory. Field-of-values inclusion bounds provide computable convergence estimates.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'FGMRES: Flexible Restarted GMRES',
        body: 'Standard GMRES(m) requires a fixed preconditioner $M$ (same at every step). FGMRES (Saad, 1993) allows a variable preconditioner — useful for inner-outer iterations where the preconditioner itself is solved iteratively. FGMRES stores both $Q_k$ (Krylov vectors) and $Z_k = M_k^{-1}Q_k$ (preconditioned vectors), costing 2× memory.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la9-003-1',
      title: 'GMRES on 2×2',
      problem: 'For $A = \\begin{bmatrix}2&1\\\\0&3\\end{bmatrix}$, $\\mathbf{b} = (1,1)^\\top$: (a) Is $A$ symmetric? (b) How many GMRES steps for exact solution?',
      solution: '(a) $A \\neq A^\\top$ — not symmetric. (b) GMRES finds exact solution in at most $n = 2$ steps. First step minimizes residual over 1D Krylov subspace $\\text{span}(\\mathbf{b})$; second step over the full 2D space.',
    },
  ],

  challenges: [
    {
      id: 'ch-la9-003-1',
      title: 'Restarting cost vs benefit',
      difficulty: 'medium',
      prompt: 'Why does restarting GMRES every $m$ steps reduce memory from $O(kn)$ to $O(mn)$? What is the cost of this memory savings?',
      hint: 'Consider what information is discarded at each restart.',
      solution: 'Full GMRES stores $k$ basis vectors (each of length $n$) after $k$ steps, so $O(kn)$ memory. Restarted GMRES(m) discards all $m$ basis vectors at the restart point and begins fresh with only the current residual as initial vector. Memory is bounded by $O(mn)$. Cost: the new Krylov subspace starts from scratch — information about the entire previous history is lost. The method may need many restarts to converge where full GMRES would converge in one pass.',
    },
  ],

  mentalModel: [
    'GMRES = Krylov method for non-symmetric systems; minimizes residual norm at each step.',
    'Arnoldi process: builds orthonormal basis for Krylov subspace iteratively.',
    'Each GMRES step solves a small $(k+1) \\times k$ least-squares problem.',
    'Restarted GMRES(m): cap memory at $O(mn)$, restart every $m$ steps.',
    'Convergence depends on eigenvalue clustering; preconditioner clusters eigenvalues near 1.',
  ],

  checkpoints: [
    { id: 'cp-la9-003-1', question: 'How does GMRES differ from CG in its applicability?', answer: 'GMRES works for any non-singular matrix; CG requires symmetric positive definite.' },
    { id: 'cp-la9-003-2', question: 'What does GMRES minimize at each step?', answer: 'The residual norm $\\|\\mathbf{b} - A\\mathbf{x}_k\\|_2$ over the Krylov subspace $\\mathbf{x}_0 + \\mathcal{K}_k$.' },
    { id: 'cp-la9-003-3', question: 'Why is restarted GMRES preferred over full GMRES in practice?', answer: 'Full GMRES requires $O(kn)$ memory (grows with iteration count); restarted GMRES(m) bounds memory at $O(mn)$.' },
  ],

  assessment: 'Describe the Arnoldi process and explain how it produces the upper Hessenberg matrix. How does GMRES use this matrix to find the minimum-residual iterate?',

  quiz: [
    { id: 'q-la9-003-1', question: 'GMRES applies to:', options: ['SPD matrices only', 'Any non-singular matrix', 'Symmetric indefinite matrices only', 'Matrices with positive eigenvalues'], answer: 'Any non-singular matrix' },
    { id: 'q-la9-003-2', question: 'The Arnoldi process produces:', options: ['An LU decomposition', 'An orthonormal Krylov basis and an upper Hessenberg matrix', 'A set of eigenvectors', 'A sparse QR factorization'], answer: 'An orthonormal Krylov basis and an upper Hessenberg matrix' },
    { id: 'q-la9-003-3', question: 'Why does full GMRES have growing memory cost?', options: ['Each iteration uses more FLOPS', 'All Krylov basis vectors must be stored', 'The Hessenberg matrix is dense', 'Pivoting requires extra storage'], answer: 'All Krylov basis vectors must be stored' },
  ],
};
