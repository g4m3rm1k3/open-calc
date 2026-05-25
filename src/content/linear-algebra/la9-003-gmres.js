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
      'Take the non-symmetric system $A = \\begin{bmatrix}3&1\\\\0&2\\end{bmatrix}$, $\\mathbf{b} = (7,4)^\\top$ (exact solution $\\mathbf{x}^* = (2,2)^\\top$). You cannot apply CG — $A \\neq A^\\top$. GMRES step 1: start with $\\mathbf{x}_0 = \\mathbf{0}$, residual $\\mathbf{r}_0 = \\mathbf{b} = (7,4)^\\top$. Search over all $\\mathbf{x} = \\alpha \\mathbf{r}_0$: minimize $\\|\\mathbf{b} - A\\alpha \\mathbf{r}_0\\|_2$. We have $A\\mathbf{r}_0 = (25,8)^\\top$, so we solve $\\min_\\alpha \\|(7-25\\alpha, 4-8\\alpha)\\|$. Differentiating: $\\alpha^* = 414/1378 = 3/10$. Result: $\\mathbf{x}_1 = (2.1, 1.2)^\\top$, residual $\\mathbf{r}_1 = (-0.5, 1.6)^\\top$, $\\|\\mathbf{r}_1\\| \\approx 1.68$ vs $\\|\\mathbf{r}_0\\| \\approx 8.06$. Residual dropped 80% in one step! Step 2 gives the exact solution. **Key**: GMRES minimizes the residual over the Krylov subspace at each step — no symmetry required.',
      '**The idea: minimize residual over Krylov subspace.** GMRES finds $\\mathbf{x}_k \\in \\mathbf{x}_0 + \\mathcal{K}_k(A, \\mathbf{r}_0)$ that minimizes $\\|\\mathbf{b} - A\\mathbf{x}_k\\|_2$ (the residual norm). Unlike CG, this is a least-squares problem — no symmetry required.',
      '**Arnoldi process.** GMRES builds an orthonormal basis $\\{\\mathbf{q}_1, \\ldots, \\mathbf{q}_k\\}$ for $\\mathcal{K}_k$ via modified Gram-Schmidt applied to $\\{\\mathbf{r}_0, A\\mathbf{r}_0, A^2\\mathbf{r}_0, \\ldots\\}$. The Arnoldi relation: $AQ_k = Q_{k+1}\\tilde{H}_k$ where $\\tilde{H}_k$ is a $(k+1) \\times k$ upper Hessenberg matrix. The minimization $\\min\\|\\mathbf{b} - A\\mathbf{x}\\|$ reduces to a small least-squares problem $\\min\\|\\|\\mathbf{r}_0\\|\\mathbf{e}_1 - \\tilde{H}_k\\mathbf{y}\\|$ solved by QR factorization of $\\tilde{H}_k$.',
      '**Storage growth and restarting.** Full GMRES stores all $k$ basis vectors: $O(kn)$ memory. After $k = n$ steps, the exact solution is found. In practice, GMRES(m) restarts every $m$ steps: discard the Krylov basis, restart from current residual. Restarting sacrifices optimality but controls memory. Typical: $m = 20$–$100$. Without restarting, GMRES stagnates less but memory grows.',
      '**Convergence.** GMRES is guaranteed to converge: $\\|\\mathbf{r}_k\\| \\leq \\|\\mathbf{r}_0\\|$ (residual is monotonically non-increasing) and $\\|\\mathbf{r}_n\\| = 0$ (exact after $n$ steps). Practical convergence depends on the spectrum of $A$ — if eigenvalues are clustered away from 0, GMRES converges fast. Theoretical bounds use pseudospectrum or field of values.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Predict Convergence',
        body: 'For a $2 \\times 2$ system, GMRES is guaranteed to find the exact solution in at most how many steps? Write your answer before reading on. (Hint: think about what happens when the Krylov subspace spans all of $\\mathbb{R}^2$.)',
      },
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
    {
      id: 'ex-la9-003-2',
      title: 'Arnoldi step 1: building the Krylov basis',
      problem: 'For $A = \\begin{bmatrix}3&1\\\\0&2\\end{bmatrix}$ and initial residual $\\mathbf{r}_0 = (7,4)^\\top$, carry out the first Arnoldi step: produce $\\mathbf{q}_1$ and $h_{11}$.',
      steps: [
        {
          expression: '\\mathbf{q}_1 = \\frac{\\mathbf{r}_0}{\\|\\mathbf{r}_0\\|} = \\frac{1}{\\sqrt{65}}\\begin{bmatrix}7\\\\4\\end{bmatrix}',
          annotation: 'The first Krylov basis vector is just the normalized initial residual.',
          strategyTitle: 'Normalize: $\\mathbf{q}_1 = \\mathbf{r}_0/\\|\\mathbf{r}_0\\|$',
        },
        {
          expression: 'A\\mathbf{q}_1 = \\frac{1}{\\sqrt{65}}\\begin{bmatrix}3&1\\\\0&2\\end{bmatrix}\\begin{bmatrix}7\\\\4\\end{bmatrix} = \\frac{1}{\\sqrt{65}}\\begin{bmatrix}25\\\\8\\end{bmatrix}',
          annotation: 'Multiply $A$ by $\\mathbf{q}_1$.',
          strategyTitle: 'Compute $A\\mathbf{q}_1$',
        },
        {
          expression: 'h_{11} = \\mathbf{q}_1^\\top (A\\mathbf{q}_1) = \\frac{1}{65}(7 \\cdot 25 + 4 \\cdot 8) = \\frac{175+32}{65} = \\frac{207}{65} \\approx 3.18',
          annotation: 'Project $A\\mathbf{q}_1$ onto $\\mathbf{q}_1$: this is the (1,1) entry of the Hessenberg matrix $\\tilde{H}$.',
          strategyTitle: 'Projection: $h_{11} = \\mathbf{q}_1^\\top A\\mathbf{q}_1$',
        },
        {
          expression: '\\tilde{\\mathbf{q}}_2 = A\\mathbf{q}_1 - h_{11}\\mathbf{q}_1 = \\frac{1}{65}\\begin{bmatrix}25 \\cdot 65/\\sqrt{65} - 207/\\sqrt{65} \\cdot 7\\\\\\ldots\\end{bmatrix}',
          annotation: 'Subtract the projection — this is modified Gram-Schmidt. $h_{21} = \\|\\tilde{\\mathbf{q}}_2\\|$ goes into the (2,1) entry of $\\tilde{H}$, and $\\mathbf{q}_2 = \\tilde{\\mathbf{q}}_2/h_{21}$ completes the orthonormal basis. The Arnoldi relation $A Q_1 = Q_2 \\tilde{H}_1$ ties everything together.',
          strategyTitle: 'Orthogonalize: $\\tilde{\\mathbf{q}}_2 = A\\mathbf{q}_1 - h_{11}\\mathbf{q}_1$',
        },
      ],
    },
    {
      id: 'ex-la9-003-3',
      title: 'Why restarting trades memory for convergence',
      problem: 'Suppose GMRES(10) is applied to a $1000 \\times 1000$ system and does not converge in 10 steps. Compare (a) memory used after 10 steps of GMRES(10) vs full GMRES after 50 steps, and (b) explain what is lost at restart.',
      steps: [
        {
          expression: '\\text{GMRES(10): store } \\leq 10 \\text{ vectors} \\Rightarrow 10n \\text{ doubles} = 80 \\text{ KB}',
          annotation: '$n = 1000$, each vector is $n$ doubles = 8 KB. 10 vectors = 80 KB.',
          strategyTitle: 'Memory: GMRES(10)',
        },
        {
          expression: '\\text{Full GMRES after 50 steps: store } 50 \\text{ vectors} \\Rightarrow 50n \\text{ doubles} = 400 \\text{ KB}',
          annotation: 'Full GMRES accumulates all basis vectors — 5× more memory after 50 steps.',
          strategyTitle: 'Memory: full GMRES at 50 steps',
        },
        {
          expression: '\\text{At restart: discard } Q_{10}, \\text{ keep only } \\mathbf{x}_{10} \\text{ and } \\mathbf{r}_{10}',
          annotation: 'The entire Krylov history is thrown away. The next 10 steps explore directions that may overlap with the already-explored subspace — convergence can stagnate if the eigenvalue spectrum is not well-separated.',
          strategyTitle: 'Cost: restart discards Krylov history',
        },
        {
          expression: '\\text{Fix: use preconditioning to make } A \\text{ well-conditioned, so GMRES(10) suffices}',
          annotation: 'The real solution to GMRES stagnation is a good preconditioner, not increasing the restart parameter. A preconditioned system converges in far fewer iterations, making the restart ceiling irrelevant.',
          strategyTitle: 'Practical fix: preconditioning',
        },
      ],
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
    { id: 'cp-la9-003-1', label: 'Read: Krylov residual minimization idea', type: 'read' },
    { id: 'cp-la9-003-2', label: 'Read: Arnoldi process and Hessenberg matrix', type: 'read' },
    { id: 'cp-la9-003-3', label: 'Read: restarting and convergence theory', type: 'read' },
    { id: 'cp-la9-003-4', label: 'Try: run GMRES and track residual convergence', type: 'lab' },
    { id: 'cp-la9-003-5', label: 'Try: compare GMRES vs CG on non-symmetric system', type: 'lab' },
    { id: 'cp-la9-003-6', label: 'Work: GMRES step 1 on 2×2 non-symmetric system', type: 'example' },
    { id: 'cp-la9-003-7', label: 'Work: Arnoldi step 1 by hand', type: 'example' },
    { id: 'cp-la9-003-8', label: 'Challenge: memory vs convergence tradeoff in GMRES(m)', type: 'challenge' },
  ],

  assessment: 'Describe the Arnoldi process and explain how it produces the upper Hessenberg matrix. How does GMRES use this matrix to find the minimum-residual iterate?',

  quiz: [
    {
      id: 'q-la9-003-1',
      type: 'choice',
      text: 'GMRES applies to:',
      options: ['SPD matrices only', 'Any non-singular matrix', 'Symmetric indefinite matrices only', 'Matrices with positive eigenvalues'],
      answer: 'Any non-singular matrix',
      hints: ['GMRES requires only non-singularity — it minimizes $\\|\\mathbf{r}\\|_2$ without any symmetry assumption. CG requires SPD; MINRES requires symmetry; GMRES needs nothing beyond non-singularity.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la9-003-2',
      type: 'choice',
      text: 'The Arnoldi process produces:',
      options: ['An LU decomposition', 'An orthonormal Krylov basis and an upper Hessenberg matrix', 'A set of eigenvectors', 'A sparse QR factorization'],
      answer: 'An orthonormal Krylov basis and an upper Hessenberg matrix',
      hints: ['Arnoldi = Gram-Schmidt applied to the Krylov sequence $\\{\\mathbf{r}_0, A\\mathbf{r}_0, A^2\\mathbf{r}_0, \\ldots\\}$. The inner products accumulated during orthogonalization form $\\tilde{H}_k$ (the upper Hessenberg matrix). Together: $AQ_k = Q_{k+1}\\tilde{H}_k$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la9-003-3',
      type: 'choice',
      text: 'Why does full GMRES have growing memory cost?',
      options: ['Each iteration uses more FLOPS', 'All Krylov basis vectors must be stored for orthogonalization', 'The Hessenberg matrix is dense', 'Pivoting requires extra storage'],
      answer: 'All Krylov basis vectors must be stored for orthogonalization',
      hints: ['Arnoldi orthogonalization requires computing $\\langle A\\mathbf{q}_k, \\mathbf{q}_j \\rangle$ for all $j \\leq k$. So all previous basis vectors $\\mathbf{q}_1, \\ldots, \\mathbf{q}_k$ must be kept in memory. After $k$ steps: $O(kn)$ storage.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la9-003-4',
      type: 'choice',
      text: 'GMRES guarantees which property about the residual norm at each step?',
      options: ['It decreases by at least 50% per step', 'It is monotonically non-increasing', 'It decreases geometrically', 'It reaches zero after $n/2$ steps'],
      answer: 'It is monotonically non-increasing',
      hints: ['GMRES minimizes $\\|\\mathbf{r}_k\\|_2$ over the current Krylov subspace. Since the subspace grows each step, the minimum can only stay the same or decrease — never increase. This monotone decrease is a key advantage over methods like BiCG that can temporarily increase.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la9-003-5',
      type: 'choice',
      text: 'In restarted GMRES(m), what is discarded at each restart?',
      options: ['The current iterate $\\mathbf{x}_m$', 'The entire Krylov basis, keeping only the current residual', 'The Hessenberg matrix entries', 'The right-hand side $\\mathbf{b}$'],
      answer: 'The entire Krylov basis, keeping only the current residual',
      hints: ['At restart: keep $\\mathbf{x}_m$ (the best solution found so far) and form $\\mathbf{r}_m = \\mathbf{b} - A\\mathbf{x}_m$. Then discard $Q_m$ and start fresh. The new Krylov subspace begins from $\\mathbf{r}_m$ — the Krylov history is gone.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la9-003-6',
      type: 'choice',
      text: 'Compared to CG, GMRES requires orthogonalization against all previous Krylov vectors because:',
      options: ['GMRES is less accurate', 'The non-symmetric Arnoldi process has no short recurrence like CG\'s 3-term recurrence', 'GMRES uses more memory intentionally', 'The Hessenberg matrix is not tridiagonal for general $A$'],
      answer: 'The non-symmetric Arnoldi process has no short recurrence like CG\'s 3-term recurrence',
      hints: ['For SPD $A$, CG exploits a 3-term Lanczos recurrence (each new vector is orthogonalized against only the last two). For general $A$, the Arnoldi process requires full orthogonalization against all previous vectors — there is no analogous short recurrence.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la9-003-7',
      type: 'choice',
      text: 'GMRES convergence is fast when:',
      options: ['The matrix has many zero entries', 'Eigenvalues are clustered far from zero', 'The matrix is diagonally dominant', 'The right-hand side $\\mathbf{b}$ is small'],
      answer: 'Eigenvalues are clustered far from zero',
      hints: ['GMRES minimizes the residual polynomial $p(A)\\mathbf{r}_0$ over polynomials of degree $k$ with $p(0)=1$. If eigenvalues cluster in a small region away from 0, a low-degree polynomial can make $|p(\\lambda)|$ small for all eigenvalues simultaneously — fast convergence.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la9-003-8',
      type: 'choice',
      text: 'The GMRES iterate $\\mathbf{x}_k$ minimizes:',
      options: ['$\\|\\mathbf{x} - \\mathbf{x}^*\\|_2$', '$\\|\\mathbf{b} - A\\mathbf{x}\\|_2$ over $\\mathbf{x} \\in \\mathbf{x}_0 + \\mathcal{K}_k$', '$\\|\\mathbf{x}\\|_A$ over the full space', '$\\|A\\mathbf{x} - \\mathbf{b}\\|_A$'],
      answer: '$\\|\\mathbf{b} - A\\mathbf{x}\\|_2$ over $\\mathbf{x} \\in \\mathbf{x}_0 + \\mathcal{K}_k$',
      hints: ['GMRES is the minimal residual method: at step $k$, it finds the iterate in the affine Krylov subspace that minimizes the Euclidean residual norm. This is a small least-squares problem on the Hessenberg matrix.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la9-003-9',
      type: 'choice',
      text: 'FGMRES differs from GMRES in that it allows:',
      options: ['Larger restart parameters', 'A variable preconditioner at each step', 'Symmetric matrices only', 'Non-square systems'],
      answer: 'A variable preconditioner at each step',
      hints: ['Standard GMRES requires $M^{-1}$ to be the same at every step (fixed preconditioner). FGMRES (Flexible GMRES) stores both $Q_k$ and $Z_k = M_k^{-1}Q_k$, allowing $M_k$ to change each iteration. This enables inner-outer iterative methods.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la9-003-10',
      type: 'choice',
      text: 'For an $n \\times n$ system, full GMRES (without restart) is guaranteed to:',
      options: ['Converge in $n/2$ steps', 'Find the exact solution within $n$ steps in exact arithmetic', 'Reduce the residual by 50% per step', 'Terminate when $\\kappa(A) < n$'],
      answer: 'Find the exact solution within $n$ steps in exact arithmetic',
      hints: ['After $n$ steps, the Krylov subspace $\\mathcal{K}_n(A, \\mathbf{r}_0)$ spans all of $\\mathbb{R}^n$ (for generic $A$ and $\\mathbf{r}_0$), so the minimum-residual iterate over this full space is the exact solution.'],
      reviewSection: 'intuition',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Explain why GMRES works for non-symmetric systems while CG does not. Describe what the Arnoldi process computes and how the residual minimization step uses it.',
    explainVerbally: 'Explain the memory-convergence tradeoff in restarted GMRES(m): why does restarting save memory, and what do you lose?',
    detectIncorrectApplication: 'Catch the error of applying CG to a non-symmetric system (CG diverges or gives wrong answer) and redirect to GMRES or BiCGSTAB.',
    transferToUnfamiliar: 'Given a non-symmetric system from a new domain (e.g., convection-diffusion PDE), identify GMRES as the appropriate solver and recommend a restart parameter and preconditioner strategy.',
  },

  misconceptions: [
    {
      falseBelief: 'GMRES always converges faster than CG for SPD systems because it minimizes the residual more aggressively.',
      whyStudentsThinkIt: 'Students see that GMRES minimizes $\\|r\\|_2$ (2-norm) while CG minimizes $\\|e\\|_A$ (energy norm), and assume residual minimization is always better.',
      correctionExample: 'For SPD systems, CG converges with the same or better convergence rate than GMRES (they produce the same iterates for SPD matrices!). CG also uses $O(n)$ memory vs $O(kn)$ for GMRES. For SPD: always use CG over GMRES.',
      contrastCase: 'GMRES\'s advantage is applicability to non-symmetric systems, not superior convergence on SPD systems. For those, the CG Lanczos recurrence is strictly cheaper.',
    },
    {
      falseBelief: 'Increasing the restart parameter $m$ in GMRES(m) always improves convergence.',
      whyStudentsThinkIt: 'Larger Krylov subspace = more flexibility = faster convergence — seems logical.',
      correctionExample: 'GMRES(m) can stagnate for any finite $m$ with poorly chosen $m$ and a bad spectrum. The issue is that restarting discards Krylov history. Increasing $m$ helps but the real fix is preconditioning — which changes the eigenvalue distribution so even GMRES(10) converges quickly.',
      contrastCase: 'Full GMRES (no restart) is guaranteed to converge in $n$ steps, but $n = 10^6$ steps is useless. The practical question is: does GMRES(20) converge in a manageable number of restarts? That depends on preconditioning, not $m$.',
    },
  ],

  transferPrompts: [
    {
      situation: 'Solving the Navier-Stokes equations at each timestep of a fluid simulation. The system matrix changes every timestep and is non-symmetric due to the convection term.',
      competingTechniques: 'Direct LU factorization, GMRES without preconditioning, GMRES with ILU preconditioner.',
      whyThisTechniqueWins: 'Direct LU: too expensive for large 3D meshes ($O(N^2)$ fill). Unpreconditioned GMRES: converges too slowly due to large condition number. GMRES + ILU: ILU clusters eigenvalues so GMRES(50) converges in a few restarts per timestep. This is the standard approach in OpenFOAM and ANSYS Fluent.',
    },
    {
      situation: 'A machine learning problem requires solving a large linear system involving the Hessian matrix of a non-convex loss function (non-symmetric in practice).',
      competingTechniques: 'CG (treats it as SPD), GMRES, L-BFGS.',
      whyThisTechniqueWins: 'If the Hessian is not SPD (saddle points), CG can diverge. GMRES handles any non-singular system. However, if the system is large and the Hessian changes every gradient step, iterative methods with warm-starting are preferred over cold-start GMRES.',
    },
  ],

  debugging: [
    {
      commonError: 'GMRES(m) stagnates — residual does not decrease across many restarts.',
      symptom: 'The residual norm stays flat or oscillates instead of decreasing, even after 10+ restarts.',
      whyItHappened: 'The restart parameter $m$ is too small: the minimum-residual iterate in $\\mathcal{K}_m$ has residual $> \\varepsilon$ for every restart. The Krylov subspace never gets large enough to capture the dominant eigenvalue structure.',
      repairStrategy: 'Add or improve preconditioning. Try increasing $m$ as a temporary fix. Check the condition number: if $\\kappa(A) \\gg 1$, no restart strategy helps without preconditioning. Use `eig(A)` to check eigenvalue distribution.',
    },
    {
      commonError: 'Applying standard GMRES to a system where $A$ has complex eigenvalues, forgetting that real implementations use real arithmetic.',
      symptom: 'Unexpected slow convergence even though the spectrum looks well-clustered.',
      whyItHappened: 'Complex eigenvalues come in conjugate pairs for real $A$. The polynomial of degree $k$ must approximate zero at both $\\lambda$ and $\\bar\\lambda$, requiring pairs of steps to "capture" each eigenvalue pair.',
      repairStrategy: 'This is expected behavior, not a bug. GMRES with real arithmetic handles complex eigenvalues correctly — it just needs two steps per complex conjugate pair. Account for this in convergence estimates.',
    },
  ],
};
