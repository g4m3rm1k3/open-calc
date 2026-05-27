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
  },

  intuition: {
    prose: [
      'Where you are in the story: everything in this course has been finite-dimensional. You worked with matrices — linear maps on $\\mathbb{R}^n$ — and the whole theory of eigenvalues, SVD, and spectral decomposition was built on the fact that an $n \\times n$ matrix has at most $n$ eigenvalues. But the world is not finite-dimensional. A signal is a function, not a finite vector. The Schrödinger equation describes a wavefunction in an infinite-dimensional function space. Operator theory is what happens when you ask: what do eigenvalues become for linear maps on infinite-dimensional spaces?',
      'The first thing to get right is **boundedness**. For a linear map $T: V \to W$ between finite-dimensional spaces, boundedness is automatic — all linear maps between finite-dimensional normed spaces are bounded. In infinite dimensions, this fails. Consider the derivative $d/dx$ acting on smooth functions on $[0,1]$: the sequence of functions $f_n(x) = \\sin(n\\pi x)/n$ has $\\|f_n\\|_{L^2} \\to 0$ but $\\|f_n\'\\|_{L^2} = \\pi$ — the derivative blows up the norm ratio. A bounded operator is one where $\\|T\\mathbf{x}\\| \\leq C \\|\\mathbf{x}\\|$ for some constant $C$ and all $\\mathbf{x}$. The **operator norm** is the smallest such $C$: $\\|T\\| = \\sup_{\\|\\mathbf{x}\\|=1} \\|T\\mathbf{x}\\|$. For matrices, this is just the largest singular value.',
      'The **spectrum** generalizes eigenvalues. For a bounded operator $T$, the spectrum $\\sigma(T)$ is the set of $\\lambda \\in \\mathbb{C}$ for which $(T - \\lambda I)$ is not invertible as a bounded operator. In finite dimensions, this is just the eigenvalues. In infinite dimensions, three things can go wrong: (1) **Point spectrum**: $(T-\\lambda I)$ has a nontrivial kernel — $\lambda$ is an eigenvalue. (2) **Continuous spectrum**: $(T-\\lambda I)$ is injective but its range is only dense, not all of $H$ — $\lambda$ is not an eigenvalue but the resolvent is unbounded. (3) **Residual spectrum**: $(T-\\lambda I)$ is injective but its range is not dense.',
      'Concrete contrast: take $A = \\text{diag}(3,-5)$ (normal matrix). The operator norm $\\|A\\| = 5$ (largest singular value = largest $|$eigenvalue$|$ for normal matrices). Spectral radius $r(A) = 5 = \\|A\\|$. Now take the nilpotent $N = \\begin{pmatrix}0&1\\\\0&0\\end{pmatrix}$: both eigenvalues are 0, so spectral radius $r(N) = 0$. But $\\|N\\| = 1$ — it sends $\\mathbf{e}_2$ to $\\mathbf{e}_1$ with no shrinkage. This shows that for non-normal operators, spectral radius can be strictly less than operator norm. The spectral radius formula $r(T) = \\lim_{n\\to\\infty}\\|T^n\\|^{1/n}$ recovers the right answer in general.',
      '**Predict before reading on:** Let $T: \\ell^2 \\to \\ell^2$ be defined by $(Tx)_n = \\frac{1}{n} x_n$ — it multiplies the $n$-th component by $1/n$. Is $T$ bounded? What is $\\|T\\|$? Does $T$ have eigenvectors? What is the spectrum $\\sigma(T)$? Think through each question before continuing.',
      'The multiplication operator is bounded: $\\|Tx\\|^2 = \\sum_{n=1}^\\infty \\frac{1}{n^2}|x_n|^2 \\leq \\sum |x_n|^2 = \\|x\\|^2$, so $\\|T\\| \\leq 1$. Actually $\\|T\\| = 1$ since the unit vector $e_1$ satisfies $\\|Te_1\\| = 1$. Each standard basis vector $e_n$ is an eigenvector: $Te_n = \\frac{1}{n} e_n$. The eigenvalues $\\{1/n : n \\geq 1\\}$ accumulate at 0. Is 0 itself an eigenvalue? No: $Tx = 0$ forces all components to be zero. But 0 is in the spectrum because $(T - 0)$ is injective but not surjective (the sequence $(1, 1/2, 1/3, \\ldots) \\in \\ell^2$ is not in the range of $T$). So $\\sigma(T) = \\{1/n : n \\geq 1\\} \\cup \\{0\\}$ — discrete eigenvalues with 0 in the continuous/residual spectrum.',
      '**Compact operators** are the infinite-dimensional analogue of matrices: they are limits of finite-rank operators and have the most matrix-like behavior. For a compact self-adjoint operator, the spectral theorem says: the spectrum (excluding 0) consists entirely of real eigenvalues with finite-dimensional eigenspaces, and the eigenvalues accumulate only at 0. There is an orthonormal basis of eigenvectors, and $T\\mathbf{x} = \\sum_i \\lambda_i \\langle \\mathbf{x}, \\mathbf{e}_i \\rangle \\mathbf{e}_i$. This is the exact infinite-dimensional generalization of the spectral theorem for symmetric matrices from Chapter 3.',
      'The **adjoint** of a bounded operator $T: H \\to H$ is the unique operator $T^*$ satisfying $\\langle T\\mathbf{x}, \\mathbf{y}\\rangle = \\langle \\mathbf{x}, T^*\\mathbf{y}\\rangle$ for all $\\mathbf{x}, \\mathbf{y} \\in H$. For matrices, $T^* = A^*$ (conjugate transpose). A **self-adjoint** operator satisfies $T = T^*$. All eigenvalues of a self-adjoint operator are real; eigenvectors for different eigenvalues are orthogonal — exactly as for symmetric matrices, and for exactly the same reason.',
      'Where this is heading: the final lesson introduces Banach and Hilbert spaces — the complete normed spaces where all this analysis lives. Completeness is what separates infinite-dimensional analysis from the algebraic setting: Cauchy sequences must converge, projections onto closed subspaces must exist, and the Riesz representation theorem must hold. These structural results are what make Fourier series, quantum mechanics, and kernel methods rigorous.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 4 of 5 — Advanced Theory',
        body: '**Previous (Lesson 3):** Exterior Algebra — antisymmetric tensors, wedge product, determinants as volume, differential forms.\n**This lesson:** Operator Theory — bounded operators, operator norm, spectrum (point/continuous/residual), compact operators, spectral theorem.\n**Next (Lesson 5):** Banach and Hilbert Spaces — completeness, projections, Riesz representation, $L^2$ space, Fourier series.',
      },
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
        id: 'PythonNotebook',
        title: 'Operator Theory in Python',
        mathBridge: 'Compute operator norms and spectral radii, verify the spectral radius formula, and simulate an infinite-dimensional compact operator via truncation.',
        caption: 'For normal matrices: operator norm = spectral radius. For nilpotent: they differ dramatically.',
        initialProps: {
          initialCells: [
            {
              id: 1,

              cellTitle: 'Operator norm vs spectral radius: normal vs non-normal',
              prose: 'Compare operator norms and spectral radii for a normal matrix (diagonal) and a non-normal matrix (nilpotent/Jordan block). Verify the spectral radius formula r(T) = lim ||T^n||^(1/n).',
              code: `import numpy as np

def operator_norm(A):
    """Largest singular value = 2-norm = operator norm"""
    return np.linalg.norm(A, ord=2)

def spectral_radius(A):
    """Max modulus of eigenvalues"""
    return np.max(np.abs(np.linalg.eigvals(A)))

# Normal matrix (symmetric): op_norm = spectral_radius
A_normal = np.diag([3., -5., 2., -1.])
print("Normal (diagonal) matrix:")
print(f"  Operator norm  ||A|| = {operator_norm(A_normal):.3f}")
print(f"  Spectral radius r(A) = {spectral_radius(A_normal):.3f}")
print(f"  Equal? {np.isclose(operator_norm(A_normal), spectral_radius(A_normal))}")

# Non-normal matrix: r(A) < ||A|| is possible
n = 5
A_jordan = np.diag(np.zeros(n)) + np.diag(np.ones(n-1), 1)  # nilpotent Jordan block
print(f"\\nNilpotent Jordan block (n={n}):")
print(f"  Operator norm  ||A|| = {operator_norm(A_jordan):.3f}")
print(f"  Spectral radius r(A) = {spectral_radius(A_jordan):.3f}  (all eigenvalues = 0)")

# Verify spectral radius formula: r(A) = lim ||A^n||^(1/n)
print("\\nSpectral radius via power formula ||A^n||^(1/n):")
A_test = np.array([[0.5, 1.0], [0.0, 0.8]])
r_true = spectral_radius(A_test)
Apow = np.eye(2)
for n in [1, 5, 10, 20, 50]:
    Apow = np.linalg.matrix_power(A_test, n)
    approx = operator_norm(Apow) ** (1/n)
    print(f"  n={n:3d}: ||A^n||^(1/n) = {approx:.5f}")
print(f"  True spectral radius   = {r_true:.5f}")
`,
            },
            {
              id: 2,

              cellTitle: 'Compact operator approximation via truncation',
              prose: 'Approximate the infinite-dimensional multiplication operator T(x)_n = (1/n)*x_n by its N×N truncation, and verify that the eigenvalues converge to the infinite-dimensional spectrum.',
              code: `import numpy as np
import matplotlib.pyplot as plt

# Multiplication operator T: x_n -> (1/n)*x_n on ℓ²
# N-dimensional approximation: diagonal matrix with 1/n on diagonal
def trunc_spectrum(N):
    return np.array([1/n for n in range(1, N+1)])

# Show eigenvalues of truncations converging to full spectrum
Ns = [5, 10, 20, 50]
fig, axes = plt.subplots(1, len(Ns), figsize=(14, 3))
for ax, N in zip(axes, Ns):
    eigs = trunc_spectrum(N)
    ax.scatter(eigs, np.zeros(N), s=30, c='blue', zorder=5)
    ax.axhline(0, color='gray', lw=0.5)
    ax.axvline(0, color='red', lw=1, linestyle='--', label='Spectrum accumulates at 0')
    ax.set_xlim(-0.1, 1.1); ax.set_ylim(-0.5, 0.5)
    ax.set_title(f'N={N} truncation\\neigs = 1/1,...,1/N')
    ax.set_xlabel('Eigenvalue')
plt.suptitle('Eigenvalues of compact operator T(x)_n = (1/n)x_n', y=1.02)
plt.tight_layout(); plt.show()

# As N→∞, spectrum fills {1/n : n≥1} ∪ {0}
print("Operator norm ||T_N||:", 1.0)  # always 1 (largest eigenvalue is 1/1)
print("Spectral radius r(T_N):", 1.0)  # also 1 (T_N is normal = diagonal)
print("As N→∞: 0 enters the spectrum but is NOT an eigenvalue")
print("  (0 is in the continuous/residual spectrum)")
`,
            },
          ],
        },
      },
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
      title: 'Operator norm vs spectral radius for a non-normal matrix',
      problem: 'Let $A = \\begin{pmatrix}0&3\\\\0&0\\end{pmatrix}$. Compute (a) the operator norm $\\|A\\|_2$, (b) the spectral radius $r(A)$, (c) verify $r(A) \\leq \\|A\\|$ and explain why equality fails.',
      steps: [
        { explanation: 'Eigenvalues: $\\det(A-\\lambda I) = \\lambda^2 = 0 \\Rightarrow \\lambda = 0$ (double). So spectral radius $r(A) = \\max|\\lambda_i| = 0$.' },
        { explanation: 'Operator norm: $\\|A\\|_2 = $ largest singular value = $\\sqrt{\\lambda_{\\max}(A^\\top A)}$. Compute $A^\\top A = \\begin{pmatrix}0&0\\\\0&9\\end{pmatrix}$. Eigenvalues of $A^\\top A$: $0$ and $9$. So $\\|A\\|_2 = \\sqrt{9} = 3$.' },
        { explanation: 'Verify: $r(A) = 0 < 3 = \\|A\\|_2$. The inequality $r(A) \\leq \\|A\\|$ holds strictly here.' },
        { explanation: 'Why equality fails: $A$ is NOT normal — $A^\\top A = \\begin{pmatrix}0&0\\\\0&9\\end{pmatrix} \\neq \\begin{pmatrix}9&0\\\\0&0\\end{pmatrix} = AA^\\top$. For normal operators ($A^\\top A = AA^\\top$), $r(A)=\\|A\\|$ always.' },
      ],
    },
    {
      id: 'ex-la10-004-2',
      title: 'Spectrum of the right-shift operator',
      problem: 'The right-shift operator $S: \\ell^2 \\to \\ell^2$ sends $(x_1,x_2,x_3,\\ldots)\\mapsto(0,x_1,x_2,\\ldots)$. Find $\\|S\\|$, the point spectrum, and the full spectrum.',
      steps: [
        { explanation: 'Operator norm: $\\|S\\mathbf{x}\\|^2 = |0|^2+|x_1|^2+|x_2|^2+\\cdots = \\|\\mathbf{x}\\|^2$. So $S$ is an isometry: $\\|S\\| = 1$.' },
        { explanation: 'Point spectrum: suppose $S\\mathbf{x} = \\lambda\\mathbf{x}$. Then $(0, x_1, x_2, \\ldots) = (\\lambda x_1, \\lambda x_2, \\ldots)$. The first coordinate gives $0 = \\lambda x_1$, then $x_1 = \\lambda x_2$, then $x_2 = \\lambda x_3$, etc. If $\\lambda \\neq 0$: $x_1 = 0 \\Rightarrow x_2=0 \\Rightarrow \\cdots$, so only $\\mathbf{x}=0$. Point spectrum is EMPTY.' },
        { explanation: 'Full spectrum: need to find all $\\lambda$ where $(S-\\lambda I)$ is not invertible. For $|\\lambda| < 1$: the sequence $(\\lambda^n)_{n\\geq 0}$ is in $\\ell^2$, and $(S-\\lambda I)^{-1}$ can be shown not to exist as a bounded operator.' },
        { explanation: 'Conclusion: $\\sigma(S) = \\{\\lambda : |\\lambda| \\leq 1\\}$ (closed unit disk). But ALL of this spectrum is continuous spectrum — no eigenvalues! This contrasts starkly with finite-dimensional matrices which always have eigenvalues.' },
      ],
    },
    {
      id: 'ex-la10-004-3',
      title: 'Spectral theorem in action: symmetric matrix',
      problem: 'Let $A = \\begin{pmatrix}3&1\\\\1&3\\end{pmatrix}$. Apply the spectral theorem: find eigenvalues, orthonormal eigenvectors, and write $A = \\sum_i \\lambda_i \\mathbf{q}_i \\mathbf{q}_i^\\top$ (spectral decomposition).',
      steps: [
        { explanation: 'Eigenvalues: $\\det(A-\\lambda I) = (3-\\lambda)^2-1=0 \\Rightarrow \\lambda^2-6\\lambda+8=0 \\Rightarrow \\lambda_1=4, \\lambda_2=2$.' },
        { explanation: 'Eigenvectors: for $\\lambda_1=4$: $(A-4I)v=0 \\Rightarrow \\begin{pmatrix}-1&1\\\\1&-1\\end{pmatrix}v=0 \\Rightarrow v_1=(1,1)^\\top/\\sqrt{2}$. For $\\lambda_2=2$: $v_2=(1,-1)^\\top/\\sqrt{2}$. Verify orthogonality: $v_1^\\top v_2 = (1-1)/2 = 0$ ✓.' },
        { explanation: 'Spectral decomposition: $A = 4 v_1 v_1^\\top + 2 v_2 v_2^\\top = 4\\cdot\\frac{1}{2}\\begin{pmatrix}1&1\\\\1&1\\end{pmatrix} + 2\\cdot\\frac{1}{2}\\begin{pmatrix}1&-1\\\\-1&1\\end{pmatrix} = \\begin{pmatrix}2&2\\\\2&2\\end{pmatrix}+\\begin{pmatrix}1&-1\\\\-1&1\\end{pmatrix} = \\begin{pmatrix}3&1\\\\1&3\\end{pmatrix}$ ✓.' },
        { explanation: 'This is the finite-dimensional version of the spectral theorem: symmetric (self-adjoint) matrices have real eigenvalues and orthogonal eigenvectors, and can be "diagonalized" into rank-1 projectors.' },
      ],
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
    { id: 'cp-la10-004-1', label: 'Read the concrete operator norm examples for diagonal and nilpotent', type: 'read' },
    { id: 'cp-la10-004-2', label: 'Read what the spectrum is and how it generalizes eigenvalues', type: 'read' },
    { id: 'cp-la10-004-3', label: 'Read the spectral theorem for compact self-adjoint operators', type: 'read' },
    { id: 'cp-la10-004-4', label: 'Compute operator norm and spectral radius in the notebook', type: 'lab' },
    { id: 'cp-la10-004-5', label: 'Explore finite-rank approximation of compact operators', type: 'lab' },
    { id: 'cp-la10-004-6', label: 'Trace the non-normal operator norm vs spectral radius example', type: 'example' },
    { id: 'cp-la10-004-7', label: 'Trace the spectral decomposition of a symmetric matrix', type: 'example' },
    { id: 'cp-la10-004-8', label: 'Prove self-adjoint eigenvalues are real using the inner product', type: 'challenge' },
  ],

  assessment: 'For a $3\\times 3$ matrix $A$: (a) compute the operator (2-)norm, spectral radius, and Frobenius norm; (b) verify that spectral radius $\\leq$ operator norm $\\leq$ Frobenius norm.',

  quiz: [
    {
      id: 'q-la10-004-1',
      type: 'choice',
      text: 'The operator norm $\\|T\\|_2$ equals, for matrices:',
      options: ['The largest eigenvalue', 'The largest singular value', 'The trace', 'The Frobenius norm'],
      answer: 'The largest singular value',
      hints: ['The operator (2-)norm is $\\sup_{\\|x\\|=1}\\|Ax\\|$.', 'The SVD shows $\\|Ax\\| \\leq \\sigma_1\\|x\\|$, with equality achieved.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-004-2',
      type: 'choice',
      text: 'For a self-adjoint operator $T = T^*$, all eigenvalues are:',
      options: ['Imaginary', 'Real', 'Positive', 'Zero'],
      answer: 'Real',
      hints: ['Compute $\\langle Tx, x\\rangle$ using the eigenvector equation.', '$\\lambda\\|x\\|^2 = \\langle Tx,x\\rangle = \\langle x,T^*x\\rangle = \\overline{\\lambda}\\|x\\|^2 \\Rightarrow \\lambda = \\overline{\\lambda}$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-004-3',
      type: 'choice',
      text: 'A compact operator\'s spectrum (excluding 0) consists of:',
      options: ['A continuous arc in the complex plane', 'Isolated eigenvalues with finite multiplicity', 'Only imaginary eigenvalues', 'The full closed unit disk'],
      answer: 'Isolated eigenvalues with finite multiplicity',
      hints: ['Compact operators are limits of finite-rank operators.', 'Their nonzero spectrum looks like a finite-rank operator\'s (discrete eigenvalues).'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-004-4',
      type: 'choice',
      text: 'For the nilpotent matrix $N = \\begin{pmatrix}0&3\\\\0&0\\end{pmatrix}$, what is the spectral radius $r(N)$?',
      options: ['$3$', '$1$', '$0$', '$\\sqrt{3}$'],
      answer: '$0$',
      hints: ['Spectral radius = $\\max|\\lambda_i|$ over eigenvalues.', 'Nilpotent: all eigenvalues are 0.'],
      reviewSection: 'examples',
    },
    {
      id: 'q-la10-004-5',
      type: 'choice',
      text: 'For $N = \\begin{pmatrix}0&3\\\\0&0\\end{pmatrix}$, what is the operator norm $\\|N\\|_2$?',
      options: ['$0$', '$1$', '$3$', '$9$'],
      answer: '$3$',
      hints: ['$\\|N\\|_2 = $ largest singular value = $\\sqrt{\\lambda_{\\max}(N^\\top N)}$.', '$N^\\top N = \\begin{pmatrix}0&0\\\\0&9\\end{pmatrix}$, largest eigenvalue = 9, so $\\|N\\|_2 = 3$.'],
      reviewSection: 'examples',
    },
    {
      id: 'q-la10-004-6',
      type: 'choice',
      text: 'For which type of operator does $r(T) = \\|T\\|$ (spectral radius equals operator norm)?',
      options: ['All bounded operators', 'Normal operators ($T^*T = TT^*$)', 'Only invertible operators', 'Only compact operators'],
      answer: 'Normal operators ($T^*T = TT^*$)',
      hints: ['Diagonal matrices are normal and satisfy $r=\\|\\cdot\\|$.', 'Nilpotent matrices are non-normal and give $r < \\|\\cdot\\|$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-004-7',
      type: 'choice',
      text: 'The right-shift operator $S: \\ell^2 \\to \\ell^2$ has point spectrum (eigenvalues):',
      options: ['All $\\lambda$ with $|\\lambda| < 1$', 'Just $\\lambda = 1$', 'Empty — no eigenvalues', 'All integers'],
      answer: 'Empty — no eigenvalues',
      hints: ['Suppose $Sx = \\lambda x$. The first component gives $0 = \\lambda x_1$, then $x_1 = \\lambda x_2$, etc.', 'If $\\lambda \\neq 0$: all components are 0 — only the zero vector.'],
      reviewSection: 'examples',
    },
    {
      id: 'q-la10-004-8',
      type: 'choice',
      text: 'For the spectral decomposition $A = \\sum_i \\lambda_i q_i q_i^\\top$ of a symmetric matrix, the vectors $q_i$ are:',
      options: ['Left singular vectors', 'Orthonormal eigenvectors', 'Columns of the inverse', 'The dual basis vectors'],
      answer: 'Orthonormal eigenvectors',
      hints: ['The spectral theorem guarantees eigenvectors of a symmetric matrix are orthogonal.', 'Normalized eigenvectors give the rank-1 projectors $q_i q_i^\\top$.'],
      reviewSection: 'examples',
    },
    {
      id: 'q-la10-004-9',
      type: 'choice',
      text: 'The three types of spectrum for a bounded operator are:',
      options: [
        'Point, continuous, and residual',
        'Real, imaginary, and complex',
        'Discrete, scattered, and dense',
        'Eigenvalue, singular value, and norm',
      ],
      answer: 'Point, continuous, and residual',
      hints: ['They are classified by what fails when $(T-\\lambda I)$ is not invertible.', 'Point = kernel non-trivial; continuous = range dense but not closed; residual = range not dense.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-004-10',
      type: 'choice',
      text: 'The full spectrum of the right-shift $S$ on $\\ell^2$ is:',
      options: ['Empty', 'The imaginary axis', 'The closed unit disk $\\{|\\lambda|\\leq 1\\}$', 'Just $\\{0,1\\}$'],
      answer: 'The closed unit disk $\\{|\\lambda|\\leq 1\\}$',
      hints: ['The spectrum is always contained in $\\{|\\lambda|\\leq \\|T\\|\\}$, and $\\|S\\|=1$.', 'One can show $(S-\\lambda I)$ is not invertible for all $|\\lambda|\\leq 1$.'],
      reviewSection: 'examples',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'For a given matrix, compute the operator norm (largest singular value) and spectral radius (largest |eigenvalue|); determine whether they are equal (normal matrix) or the operator norm is larger (non-normal).',
    explainVerbally: 'Explain why infinite-dimensional operators can have a continuous spectrum with no eigenvalues (like the shift operator), and why compact self-adjoint operators always have eigenvalues spanning the space.',
    detectIncorrectApplication: 'Catch the error of assuming the operator norm equals the spectral radius for all operators — this only holds for normal operators.',
    transferToUnfamiliar: 'Apply the spectral decomposition of a symmetric matrix to compute the matrix exponential $e^A$ or the matrix square root $A^{1/2}$ using the functional calculus.',
  },

  misconceptions: [
    {
      falseBelief: 'The operator norm equals the spectral radius for all matrices.',
      whyStudentsThinkIt: 'For diagonal matrices (normal), $\\|A\\|_2 = \\max|\\lambda_i|$ = spectral radius. Students see this and over-generalize.',
      correctionExample: '$N = \\begin{pmatrix}0&3\\\\0&0\\end{pmatrix}$: spectral radius = 0 (both eigenvalues are 0), but $\\|N\\|_2 = 3$. The gap can be arbitrarily large for non-normal matrices.',
      contrastCase: 'For NORMAL matrices ($A^*A = AA^*$, e.g., symmetric, orthogonal, unitary), $\\|A\\|_2 = r(A)$. For non-normal, the operator norm can be much larger than the spectral radius.',
    },
    {
      falseBelief: 'All linear operators on infinite-dimensional spaces have eigenvalues.',
      whyStudentsThinkIt: 'Every matrix (linear operator on finite-dimensional space) has at least one eigenvalue (over $\\mathbb{C}$). Students assume this extends to infinite dimensions.',
      correctionExample: 'The right-shift operator $S$ on $\\ell^2$ has empty point spectrum — no eigenvectors at all. Yet $S$ is a perfectly well-defined bounded operator with full spectrum = closed unit disk.',
      contrastCase: 'Compact self-adjoint operators DO have eigenvectors spanning the space. It is specifically non-compact operators (like the shift) that can have no eigenvalues.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You want to apply the matrix function $f(A) = e^{At}$ (matrix exponential, used in solving ODEs). $A$ is symmetric. How do you use the spectral decomposition?',
      competingTechniques: ['Compute via Taylor series: $e^{At} = I + At + A^2t^2/2! + \\cdots$ (slow, hard to implement)', 'Use spectral decomposition: $A = Q\\Lambda Q^\\top$, then $e^{At} = Qe^{\\Lambda t}Q^\\top$ where $e^{\\Lambda t} = \\text{diag}(e^{\\lambda_1 t}, \\ldots)$'],
      whyThisTechniqueWins: 'The spectral decomposition reduces $f(A)$ to applying $f$ pointwise to eigenvalues. This is both conceptually clear (the functional calculus) and numerically efficient — one eigendecomposition, then trivial diagonal arithmetic.',
    },
    {
      situation: 'In quantum mechanics, you measure the energy of a particle whose state is $\\psi = \\frac{1}{\\sqrt{2}}(v_1 + v_2)$ where $v_1, v_2$ are energy eigenstates with $E_1=2$, $E_2=5$. What energies can you observe and with what probability?',
      competingTechniques: ['Compute $\\langle \\psi | H | \\psi \\rangle$ (gives expected value, not individual outcomes)', 'Apply the spectral theorem: energy measurement yields eigenvalue $E_i$ with probability $|\\langle v_i, \\psi \\rangle|^2$'],
      whyThisTechniqueWins: 'The spectral theorem gives the full probability distribution: $P(E=2) = |1/\\sqrt{2}|^2 = 1/2$, $P(E=5) = 1/2$. Expected value: $(2+5)/2=3.5$. The spectral decomposition is the mathematical foundation of quantum measurement theory.',
    },
  ],

  debugging: [
    {
      commonError: 'Confusing the operator norm with the spectral radius or the Frobenius norm.',
      symptom: 'Student computes $\\|A\\|_F = \\sqrt{\\sum_{ij}a_{ij}^2}$ and calls it the operator norm; or uses $\\max|\\lambda_i|$ for a non-normal matrix.',
      whyItHappened: 'Three different matrix norms (Frobenius, operator/spectral, spectral radius) all equal each other for simple cases like diagonal matrices. Students use whichever is easiest to compute.',
      repairStrategy: 'Hierarchy for any matrix: $r(A) \\leq \\|A\\|_2 \\leq \\|A\\|_F$. To compute $\\|A\\|_2$ correctly: always use the largest singular value ($\\sigma_1$), NOT the largest eigenvalue magnitude unless the matrix is normal.',
    },
    {
      commonError: 'Claiming an infinite-dimensional operator "must" have eigenvalues because it acts on a nonzero space.',
      symptom: 'Student says "the shift operator has eigenvalue 0" when in fact the shift has no eigenvalues whatsoever.',
      whyItHappened: 'Over-applying the finite-dimensional theorem that every matrix over $\\mathbb{C}$ has at least one eigenvalue (follows from the characteristic polynomial having roots). There is no characteristic polynomial in infinite dimensions.',
      repairStrategy: 'In infinite dimensions, the spectrum can be purely continuous. Always check: is $(T - \\lambda I)$ injective? If yes, is its range dense? Failing any of these gives different parts of the spectrum — but none requires actual eigenvectors.',
    },
  ],
};
