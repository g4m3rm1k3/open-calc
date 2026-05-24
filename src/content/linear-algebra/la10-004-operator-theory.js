export default {
  id: 'la10-004',
  slug: 'operator-theory',
  chapter: 'la10',
  order: 4,
  title: 'Bounded Operators and Spectral Theory',
  subtitle: 'Bounded operators on Hilbert spaces generalize matrices to infinite dimensions. The spectrum replaces eigenvalues; for compact operators, the spectral theorem still yields a discrete decomposition.',
  tags: ['bounded operator', 'operator norm', 'spectrum', 'spectral radius', 'compact operator', 'Hilbert space', 'adjoint', 'spectral theorem'],
  aliases: 'bounded operator operator norm spectrum spectral radius compact operator Hilbert space self-adjoint spectral theorem functional calculus',

  hook: {
    question: "Matrices have eigenvalues. What do infinite-dimensional linear operators have? A matrix might have 3 eigenvalues; a differential operator on $L^2[0,1]$ has a continuous spectrum. What replaces the eigenvalue decomposition?",
    realWorldContext: "Quantum mechanics is governed by self-adjoint operators on Hilbert spaces: the Hamiltonian $H$ (energy), momentum $p = -i\\hbar d/dx$, position $x$. Observable quantities are eigenvalues of these operators. The hydrogen atom\'s energy levels are the eigenvalues of the Schrödinger operator. Signal processing uses the Fourier transform as a unitary operator on $L^2(\\mathbb{R})$ — its spectrum is continuous. PDE theory uses the spectral theory of differential operators to solve heat, wave, and Schrödinger equations.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**Bounded operators.** A linear map $T: H \\to H$ on a Hilbert space is **bounded** if $\\|T\\| := \\sup_{\\|\\mathbf{x}\\| = 1} \\|T\\mathbf{x}\\| < \\infty$. Equivalently: $T$ is continuous. The space of bounded operators $\\mathcal{B}(H)$ is a Banach algebra (complete, with multiplication = composition). For finite-dimensional $H$, every linear map is bounded.',
      '**The spectrum.** For $T \\in \\mathcal{B}(H)$, the **resolvent set** is $\\rho(T) = \\{\\lambda \\in \\mathbb{C} : (T - \\lambda I)^{-1} \\text{ exists and is bounded}\\}$. The **spectrum** is $\\sigma(T) = \\mathbb{C} \\setminus \\rho(T)$. In finite dimensions, $\\sigma(T) = $ eigenvalues. In infinite dimensions, three types of spectrum: (1) **Point spectrum** $\\sigma_p$: $\\lambda$ is an eigenvalue (kernel non-trivial). (2) **Continuous spectrum** $\\sigma_c$: $(T-\\lambda I)$ is injective with dense but non-closed range. (3) **Residual spectrum** $\\sigma_r$: $(T-\\lambda I)$ injective but range not dense.',
      '**The operator norm.** $\\|T\\| = \\sup_{\\|\\mathbf{x}\\| \\leq 1}\\|T\\mathbf{x}\\|$. For matrices: this is the largest singular value (2-norm). Key: $\\|TS\\| \\leq \\|T\\|\\|S\\|$ (submultiplicativity). The **spectral radius** $r(T) = \\lim_{n\\to\\infty}\\|T^n\\|^{1/n} = \\sup_{\\lambda \\in \\sigma(T)}|\\lambda|$. For normal operators ($T^*T = TT^*$): $r(T) = \\|T\\|$ (spectral radius equals operator norm).',
      '**Compact operators.** $T$ is **compact** if it maps bounded sets to precompact sets (closure is compact). Compact operators are the "limit" of finite-rank operators. Key: $\\sigma(T) \\setminus \\{0\\}$ consists entirely of eigenvalues, each with finite multiplicity, accumulating only at 0. This gives a discrete (but possibly infinite) spectrum.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Spectral Theorem for Compact Self-Adjoint Operators',
        body: 'If $T: H \\to H$ is compact and self-adjoint ($T = T^*$), then:\n1. All eigenvalues are real\n2. Eigenvectors for different eigenvalues are orthogonal\n3. $H$ has an orthonormal basis consisting of eigenvectors of $T$\n4. $T\\mathbf{x} = \\sum_i \\lambda_i \\langle \\mathbf{x}, \\mathbf{e}_i \\rangle \\mathbf{e}_i$\n\nThis is the infinite-dimensional generalization of the finite-dimensional spectral theorem for symmetric matrices.',
      },
      {
        type: 'insight',
        title: 'Self-Adjoint vs Symmetric',
        body: 'For bounded operators on a Hilbert space:\n\n$T^*$ (adjoint): defined by $\\langle T\\mathbf{x}, \\mathbf{y}\\rangle = \\langle \\mathbf{x}, T^*\\mathbf{y}\\rangle$ for all $\\mathbf{x},\\mathbf{y}$.\n\n**Self-adjoint**: $T = T^*$ (symmetric in the Hilbert space inner product).\nFor matrices: self-adjoint = Hermitian ($A = A^*$).\n\nFor unbounded operators (like $d/dx$): symmetric ($\\langle Tu, v\\rangle = \\langle u, Tv\\rangle$ on a domain) vs self-adjoint (domain conditions match) is more subtle.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Operator Norm and Spectral Radius',
        mathBridge: 'Compute operator norms and spectral radii; verify key inequalities.',
        caption: 'For normal matrices, operator norm = spectral radius.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Operator norm = largest singular value',
              prose: ['Verify that the operator (2-)norm of a matrix equals its largest singular value.'],
              code: `% Random matrix
A = [3 1 2; 0 2 1; 1 0 4]

% Operator norm (2-norm) = largest singular value
[U, S, V] = svd(A)
op_norm = S(1,1)
disp('Operator norm (largest singular value):')
op_norm

% Compare with norm(A,2) built-in
builtin_norm = norm(A, 2)
disp('Built-in norm(A,2):')
builtin_norm

% Spectral radius = max |eigenvalue|
lambdas = eig(A)
spec_radius = max(abs(lambdas))
disp('Spectral radius (max |eigenvalue|):')
spec_radius

% For non-normal A, spectral radius ≤ operator norm
disp('Is A normal? (AT*A vs A*AT):')
norm(A'*A - A*A', 'fro')  % nonzero = not normal
disp('Spectral radius ≤ operator norm?')
spec_radius <= op_norm + 1e-10
`,
            },
            {
              id: 2,
              cellTitle: 'Compact operator: finite-rank approximation',
              prose: ['A compact operator is the limit of finite-rank operators. SVD truncation demonstrates this.'],
              code: `% Simulate a "compact operator" by truncating SVD
% Larger matrix, add structure
rng(7)
n = 50
% Make a compact-operator-like matrix (eigenvalues decay to 0)
d = 1./(1:n)';  % rapidly decaying singular values
A = diag(d)     % compact: eigenvalues accumulate only at 0

disp('First 5 and last 5 eigenvalues (compact-like decay):')
[sort(abs(eig(A)), 'descend')]([1:5, end-4:end])

% Rank-k approximation (finite-rank approximation to "compact A")
k = 5
[U, S, V] = svd(A)
A_k = U(:,1:k) * S(1:k,1:k) * V(:,1:k)'

approx_error = norm(A - A_k, 2)
disp(['Best rank-', num2str(k), ' approx error (= sigma_{k+1}):'])
approx_error
S(k+1,k+1)  % should match
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Functional calculus.** For a normal operator $T$ with spectral measure $E$, any bounded measurable function $f$ defines $f(T) = \\int f(\\lambda)\\,dE(\\lambda)$. For matrices: $f(A) = Pf(D)P^{-1}$ (apply $f$ to eigenvalues). The matrix exponential $e^{At}$, the matrix square root $A^{1/2}$, and $\\log A$ are all instances of the functional calculus.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Spectral Radius Formula',
        body: 'For any $T \\in \\mathcal{B}(H)$:\n$r(T) = \\lim_{n \\to \\infty} \\|T^n\\|^{1/n} = \\inf_{n \\geq 1} \\|T^n\\|^{1/n}$\n\nThe spectrum is always a non-empty compact subset of $\\{|\\lambda| \\leq \\|T\\|\\}$.\n\nFor self-adjoint $T = T^*$: $r(T) = \\|T\\|$ (spectral norm = spectral radius).\n\nFor matrices: $r(A) = \\rho(A) = \\max_i|\\lambda_i|$ (the standard spectral radius).',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Fredholm operators and index.** $T \\in \\mathcal{B}(H)$ is **Fredholm** if $\\ker T$ and $H/\\overline{\\text{im} T}$ are both finite-dimensional. The **Fredholm index** $\\text{ind}(T) = \\dim\\ker T - \\dim\\text{coker}T$ is stable under compact perturbations. Fredholm operators are generalizations of linear maps between finite-dimensional spaces (where index = dimension formula from rank-nullity). The Atiyah-Singer index theorem computes indices of elliptic differential operators geometrically.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Von Neumann Algebras and Quantum Mechanics',
        body: 'In quantum mechanics, observables are self-adjoint operators on a Hilbert space $H$. The C*-algebra of observables, von Neumann algebras, and the GNS construction formalize the mathematical framework.\n\nThe spectral theorem for self-adjoint operators is the mathematical content of the measurement postulate: any measurement yields an eigenvalue of the observable, and the state collapses to the corresponding eigenspace.\n\nThe non-commutativity $[x, p] = i\\hbar I$ (Heisenberg uncertainty principle) is the statement that position and momentum operators don\'t commute.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la10-004-1',
      title: 'Spectrum of shift operator',
      problem: 'The right-shift operator $S: \\ell^2 \\to \\ell^2$ sends $(x_1, x_2, x_3, \\ldots) \\mapsto (0, x_1, x_2, \\ldots)$. Find its operator norm, eigenvalues, and spectrum.',
      solution: 'Norm: $\\|S\\mathbf{x}\\|^2 = \\sum_{n \\geq 1}|x_n|^2 = \\|\\mathbf{x}\\|^2$, so $\\|S\\| = 1$. Eigenvalues: if $S\\mathbf{x} = \\lambda\\mathbf{x}$, then $(0, x_1, x_2, \\ldots) = (\\lambda x_1, \\lambda x_2, \\ldots)$, giving $x_1 = 0$, $x_2 = 0$, etc. No nonzero eigenvectors — point spectrum is empty! The spectrum is $\\sigma(S) = \\{|\\lambda| \\leq 1\\}$ (closed unit disk).',
    },
  ],

  challenges: [
    {
      id: 'ch-la10-004-1',
      title: 'Self-adjoint implies real spectrum',
      difficulty: 'medium',
      prompt: 'For a bounded self-adjoint operator $T = T^*$ on a Hilbert space, prove that all eigenvalues are real.',
      hint: 'Compute $\\langle T\\mathbf{x}, \\mathbf{x}\\rangle$ two ways for an eigenvector $\\mathbf{x}$.',
      solution: 'Let $T\\mathbf{x} = \\lambda\\mathbf{x}$ with $\\mathbf{x} \\neq 0$. Then $\\lambda\\|\\mathbf{x}\\|^2 = \\langle\\lambda\\mathbf{x},\\mathbf{x}\\rangle = \\langle T\\mathbf{x},\\mathbf{x}\\rangle = \\langle\\mathbf{x},T^*\\mathbf{x}\\rangle = \\langle\\mathbf{x},T\\mathbf{x}\\rangle = \\langle\\mathbf{x},\\lambda\\mathbf{x}\\rangle = \\bar{\\lambda}\\|\\mathbf{x}\\|^2$. Since $\\|\\mathbf{x}\\|^2 > 0$: $\\lambda = \\bar{\\lambda}$, so $\\lambda \\in \\mathbb{R}$.',
    },
  ],

  mentalModel: [
    'Bounded operator: $\\|T\\| = \\sup_{\\|x\\|=1}\\|Tx\\| < \\infty$ = continuous linear map.',
    'Spectrum = set of $\\lambda$ where $(T - \\lambda I)$ isn\'t invertible. Generalizes eigenvalues.',
    'Operator norm = largest singular value for matrices.',
    'For normal operators: $r(T) = \\|T\\|$ (spectral radius = operator norm).',
    'Compact operator: discrete spectrum (except possibly 0), eigenvectors span the space (if self-adjoint).',
  ],

  checkpoints: [
    { id: 'cp-la10-004-1', question: 'How is the operator norm $\\|T\\|$ defined?', answer: '$\\|T\\| = \\sup_{\\|\\mathbf{x}\\| = 1}\\|T\\mathbf{x}\\|$ — the maximum stretching factor.' },
    { id: 'cp-la10-004-2', question: 'What is the spectrum of an operator?', answer: 'The set of $\\lambda \\in \\mathbb{C}$ for which $(T - \\lambda I)$ is not invertible (not bounded or not surjective). Generalizes eigenvalues.' },
    { id: 'cp-la10-004-3', question: 'What is a compact operator?', answer: 'An operator that maps bounded sets to precompact sets; a limit of finite-rank operators. Its nonzero spectrum consists of isolated eigenvalues with finite multiplicity.' },
  ],

  assessment: 'For a $3\\times 3$ matrix $A$: (a) compute the operator (2-)norm, spectral radius, and Frobenius norm; (b) verify that spectral radius $\\leq$ operator norm $\\leq$ Frobenius norm.',

  quiz: [
    { id: 'q-la10-004-1', question: 'The operator norm $\\|T\\|$ equals, for matrices:', options: ['The largest eigenvalue', 'The largest singular value', 'The trace', 'The Frobenius norm'], answer: 'The largest singular value' },
    { id: 'q-la10-004-2', question: 'For a self-adjoint operator $T = T^*$, the spectrum satisfies:', options: ['All eigenvalues are imaginary', 'All eigenvalues are real', 'All eigenvalues are positive', 'The spectrum is empty'], answer: 'All eigenvalues are real' },
    { id: 'q-la10-004-3', question: 'A compact operator\'s spectrum (excluding 0) consists of:', options: ['A continuous arc in the complex plane', 'Isolated eigenvalues with finite multiplicity', 'Only purely imaginary eigenvalues', 'A disk in the complex plane'], answer: 'Isolated eigenvalues with finite multiplicity' },
  ],
};
