export default {
  id: 'la4-006',
  slug: 'spectral-theorem',
  chapter: 'la4',
  order: 6,
  title: 'The Spectral Theorem',
  subtitle: 'Every real symmetric matrix can be orthogonally diagonalized. Its eigenvectors are not just independent — they are perpendicular. Its eigenvalues are not just complex numbers — they are real.',
  tags: ['spectral theorem', 'symmetric matrix', 'orthogonal diagonalization', 'real eigenvalues', 'orthonormal eigenvectors', 'principal axes', 'self-adjoint'],
  aliases: 'spectral theorem symmetric matrix orthogonal diagonalization real eigenvalues principal axes self-adjoint Hermitian',

  hook: {
    question: "Regular diagonalization $A = PDP^{-1}$ works when you have enough independent eigenvectors. But if $A$ is symmetric, something magical happens: the eigenvectors are automatically perpendicular to each other, and the eigenvalues are guaranteed to be real. Why?",
    realWorldContext: "The spectral theorem is the workhorse of modern data analysis. PCA (Principal Component Analysis) works because the covariance matrix is symmetric — its eigenvectors are the principal components, automatically orthogonal, and its eigenvalues are the variances (automatically real and non-negative). Quantum mechanics is built on self-adjoint (Hermitian) operators, whose spectral theorem guarantees that measured values (eigenvalues) are always real numbers. Finite element methods for structural analysis assemble symmetric stiffness matrices, and their eigenvalues are the resonant frequencies of the structure.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**The two surprising facts.** For a real symmetric matrix $A = A^\\top$: (1) All eigenvalues are real — even though the characteristic polynomial could in principle have complex roots. (2) Eigenvectors for distinct eigenvalues are orthogonal — this is not true for general matrices. Together, these mean every real symmetric matrix has an orthonormal basis of eigenvectors.',
      '**Why eigenvalues are real.** Suppose $\\lambda$ is an eigenvalue with eigenvector $\\mathbf{v}$ (potentially complex): $A\\mathbf{v} = \\lambda \\mathbf{v}$. Take the conjugate transpose: $\\bar{\\mathbf{v}}^\\top A^\\top = \\bar{\\lambda} \\bar{\\mathbf{v}}^\\top$. Since $A = A^\\top$ (real, symmetric): $\\bar{\\mathbf{v}}^\\top A = \\bar{\\lambda} \\bar{\\mathbf{v}}^\\top$. Multiply the original equation on the left by $\\bar{\\mathbf{v}}^\\top$: $\\bar{\\mathbf{v}}^\\top A \\mathbf{v} = \\lambda \\bar{\\mathbf{v}}^\\top \\mathbf{v}$. Also $\\bar{\\mathbf{v}}^\\top A \\mathbf{v} = \\bar{\\lambda} \\bar{\\mathbf{v}}^\\top \\mathbf{v}$. So $\\lambda = \\bar{\\lambda}$, meaning $\\lambda$ is real.',
      '**Why eigenvectors for distinct eigenvalues are orthogonal.** Let $A\\mathbf{u} = \\lambda\\mathbf{u}$ and $A\\mathbf{v} = \\mu\\mathbf{v}$ with $\\lambda \\neq \\mu$. Then $\\lambda \\mathbf{u}^\\top \\mathbf{v} = (A\\mathbf{u})^\\top \\mathbf{v} = \\mathbf{u}^\\top A^\\top \\mathbf{v} = \\mathbf{u}^\\top A \\mathbf{v} = \\mu \\mathbf{u}^\\top \\mathbf{v}$. So $(\\lambda - \\mu) \\mathbf{u}^\\top \\mathbf{v} = 0$. Since $\\lambda \\neq \\mu$: $\\mathbf{u}^\\top \\mathbf{v} = 0$.',
      '**The spectral theorem.** Every real symmetric $n \\times n$ matrix $A$ can be written as $A = Q\\Lambda Q^\\top$ where $Q$ is orthogonal ($Q^\\top = Q^{-1}$, columns are orthonormal eigenvectors) and $\\Lambda = \\text{diag}(\\lambda_1, \\ldots, \\lambda_n)$ has real eigenvalues. This is **orthogonal diagonalization** — special because $P^{-1} = P^\\top$.',
      '**CNC structural analysis and PCA.** The spectral theorem is everywhere in CNC engineering. (1) **Modal analysis:** the equation of motion for a vibrating CNC frame is $M\\ddot{\\mathbf{x}} + K\\mathbf{x} = \\mathbf{0}$ where $M$ and $K$ are symmetric (mass and stiffness matrices). The natural frequencies are $\\omega_i = \\sqrt{\\lambda_i(M^{-1/2}KM^{-1/2})}$ — eigenvalues of a symmetric matrix, all real and non-negative. (2) **Tool wear monitoring by PCA:** attach $n$ vibration sensors to the spindle; form the covariance matrix $C = \\frac{1}{N}X^\\top X$ (symmetric, PSD). The spectral decomposition $C = Q\\Lambda Q^\\top$ gives principal axes $\\mathbf{q}_i$ and explained variances $\\lambda_i$. As the tool wears, the dominant principal direction rotates and the leading eigenvalue grows — a real-time wear indicator. (3) **Elliptical tolerance zones:** the error ellipsoid for a machined feature is $\\mathbf{e}^\\top C^{-1} \\mathbf{e} \\leq 1$ where $C = Q\\Lambda Q^\\top$; the principal axes of the ellipsoid are the eigenvectors, and the semi-axes are $\\sqrt{\\lambda_i}$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Spectral Theorem (Real Case)',
        body: 'Every real symmetric matrix $A = A^\\top$ satisfies:\n1. All eigenvalues of $A$ are real\n2. Eigenvectors for distinct eigenvalues are orthogonal\n3. $A$ is orthogonally diagonalizable: $A = Q\\Lambda Q^\\top$\n4. $Q$ is an orthogonal matrix ($Q^{-1} = Q^\\top$)',
      },
      {
        type: 'insight',
        title: 'Spectral Decomposition',
        body: '$A = Q\\Lambda Q^\\top = \\lambda_1 \\mathbf{q}_1 \\mathbf{q}_1^\\top + \\lambda_2 \\mathbf{q}_2 \\mathbf{q}_2^\\top + \\cdots + \\lambda_n \\mathbf{q}_n \\mathbf{q}_n^\\top$\n\nThis writes $A$ as a sum of rank-1 projection matrices $\\mathbf{q}_i \\mathbf{q}_i^\\top$, each scaled by the corresponding eigenvalue. This is the spectral decomposition — the deepest way to understand what a symmetric matrix does.',
      },
      {
        type: 'insight',
        title: 'Symmetric vs Non-symmetric Diagonalization',
        body: 'General: $A = PDP^{-1}$ (P not necessarily orthogonal, eigenvalues may be complex)\nSymmetric: $A = Q\\Lambda Q^\\top$ (Q orthogonal, all eigenvalues real)\nThe orthogonal version is much better: no matrix inverse needed ($Q^{-1} = Q^\\top$), numerically stable, and geometrically natural.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Orthogonal Diagonalization',
        mathBridge: 'Find the spectral decomposition of a symmetric matrix and verify its properties.',
        caption: 'Symmetric matrices have orthogonal eigenvectors and real eigenvalues.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Eigenvectors of a symmetric matrix are orthogonal',
              prose: ['For A = A^T, verify that eigenvectors are orthogonal and eigenvalues are real.'],
              code: `A = [4 2 0; 2 3 1; 0 1 2]
disp('Is A symmetric? A - A^T:')
A - A'
[Q, D] = eig(A)
eigenvalues = diag(D)
disp('All eigenvalues real? Max imaginary part:')
max(abs(imag(eigenvalues)))
disp('Q^T * Q (should be identity = orthonormal eigenvectors):')
Q' * Q
`,
            },
            {
              id: 2,
              cellTitle: 'Spectral decomposition: A = Q*Lambda*Q^T',
              prose: ['Reconstruct A as a sum of rank-1 outer products scaled by eigenvalues.'],
              code: `A = [4 2 0; 2 3 1; 0 1 2]
[Q, D] = eig(A)
lambdas = diag(D);

% Spectral decomposition
A_reconstructed = zeros(3,3);
for i = 1:3
  A_reconstructed = A_reconstructed + lambdas(i) * (Q(:,i) * Q(:,i)');
end
disp('Spectral reconstruction vs original A:')
A_reconstructed
A
disp('Reconstruction error:')
norm(A - A_reconstructed)
`,
            },
            {
              id: 3,
              cellTitle: 'Non-symmetric matrix: complex eigenvalues',
              prose: ['Compare with a non-symmetric matrix to see what symmetry prevents.'],
              code: `B = [1 2; -3 4]
disp('B - B^T (not symmetric):')
B - B'
[V, D] = eig(B)
eigenvalues_B = diag(D)
disp('Complex eigenvalues for non-symmetric B:')
eigenvalues_B
disp('Imaginary parts:')
imag(eigenvalues_B)
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Proof of orthogonal diagonalizability (induction sketch).** By the fundamental theorem of algebra over $\\mathbb{C}$, the characteristic polynomial has a root. By the real eigenvalue proof above, this root is real. Let $\\mathbf{q}_1$ be a unit eigenvector for $\\lambda_1$. Extend to an orthonormal basis $\\{\\mathbf{q}_1, \\ldots, \\mathbf{q}_n\\}$ for $\\mathbb{R}^n$. Let $Q_1 = [\\mathbf{q}_1 | Q_2]$ (first column plus the rest). Then $Q_1^\\top A Q_1 = \\begin{bmatrix}\\lambda_1 & \\mathbf{b}^\\top \\\\ \\mathbf{0} & A_2\\end{bmatrix}$. Since $Q_1^\\top A Q_1$ is symmetric (check: $(Q_1^\\top A Q_1)^\\top = Q_1^\\top A^\\top Q_1 = Q_1^\\top A Q_1$), we get $\\mathbf{b} = \\mathbf{0}$ and $A_2$ is symmetric. Apply the argument inductively to $A_2$.',
      '**Positive (semi)definite symmetric matrices.** A symmetric matrix with all positive eigenvalues is **positive definite**. With non-negative eigenvalues: **positive semidefinite**. These arise as Gram matrices: if $M = B^\\top B$, then $M$ is symmetric and positive semidefinite ($\\mathbf{x}^\\top M \\mathbf{x} = \\|B\\mathbf{x}\\|^2 \\geq 0$). Covariance matrices in statistics are always positive semidefinite.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Spectral Decomposition',
        body: '$A = \\sum_{i=1}^n \\lambda_i \\mathbf{q}_i \\mathbf{q}_i^\\top$\n\nThis writes $A$ as a sum of rank-1 projections onto each eigenvector direction, scaled by the eigenvalue. Truncating this sum gives the best low-rank approximation (Eckart-Young theorem for symmetric matrices).',
      },
      {
        type: 'insight',
        title: 'Functions of Symmetric Matrices',
        body: 'Given $A = Q\\Lambda Q^\\top$, for any function $f$:\n$f(A) = Qf(\\Lambda)Q^\\top$ where $f(\\Lambda) = \\text{diag}(f(\\lambda_1), \\ldots, f(\\lambda_n))$.\nExamples: $\\sqrt{A}$ (matrix square root, if all $\\lambda_i > 0$), $A^{-1}$ (eigenvalues become $1/\\lambda_i$), $e^A$ (eigenvalues become $e^{\\lambda_i}$).',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Spectral Decomposition and PCA',
        mathBridge: 'Orthogonally diagonalize symmetric matrices, compute spectral decompositions, and apply to tool wear monitoring via PCA.',
        caption: 'The spectral theorem turns every symmetric matrix into a sum of rank-1 projections onto orthogonal axes.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cell_type: 'code',
              source: `import numpy as np

# Orthogonal diagonalization of a symmetric matrix
A = np.array([[4., 2., 0.],
              [2., 3., 1.],
              [0., 1., 2.]])

print("A symmetric?", np.allclose(A, A.T))

# eigh is specifically for symmetric/Hermitian matrices
# Returns real eigenvalues and orthonormal eigenvectors
eigenvalues, Q = np.linalg.eigh(A)

print(f"Eigenvalues: {eigenvalues.round(4)}")
print(f"All real: {np.all(np.isreal(eigenvalues))}")
print()
print("Q^T Q (should be identity):")
print((Q.T @ Q).round(10))

# Spectral decomposition: A = sum(lambda_i * q_i q_i^T)
A_reconstructed = sum(eigenvalues[i] * np.outer(Q[:, i], Q[:, i]) for i in range(3))
print()
print("Reconstruction error:", np.linalg.norm(A - A_reconstructed))

# Verify A = Q @ diag(lambdas) @ Q^T
print("Via Q Lambda Q^T error:", np.linalg.norm(A - Q @ np.diag(eigenvalues) @ Q.T))
`,
            },
            {
              id: 2,
              cell_type: 'code',
              source: `import numpy as np

# Functions of symmetric matrices using spectral decomposition
# A = Q Lambda Q^T  =>  f(A) = Q f(Lambda) Q^T

A = np.array([[5., 4.],
              [4., 5.]])

eigenvalues, Q = np.linalg.eigh(A)
print(f"Eigenvalues of A: {eigenvalues}")

# Matrix square root: apply sqrt to eigenvalues
sqrt_lambdas = np.sqrt(eigenvalues)
A_sqrt = Q @ np.diag(sqrt_lambdas) @ Q.T
print()
print("sqrt(A) =")
print(A_sqrt.round(6))
print()
print("Verification: sqrt(A) @ sqrt(A) should equal A:")
print((A_sqrt @ A_sqrt).round(10))

# Matrix inverse: apply 1/lambda to eigenvalues
A_inv = Q @ np.diag(1.0 / eigenvalues) @ Q.T
print()
print("Verification: A @ A_inv should equal I:")
print((A @ A_inv).round(10))

# Matrix exponential: apply exp to eigenvalues
from scipy.linalg import expm
A_exp_spec = Q @ np.diag(np.exp(eigenvalues)) @ Q.T
A_exp_scipy = expm(A)
print()
print("exp(A) via spectral vs scipy — max diff:", np.max(np.abs(A_exp_spec - A_exp_scipy)))
`,
            },
            {
              id: 3,
              cell_type: 'code',
              source: `import numpy as np

# PCA for CNC tool wear monitoring
# Simulate vibration sensor data: clean tool vs worn tool
np.random.seed(42)
N = 500   # time samples
n_sensors = 4   # accelerometers on spindle

# Clean tool: vibration dominated by spindle rotation (correlated along one axis)
clean_base = np.random.randn(N, 1) * 3.0
clean_data = clean_base @ np.array([[1.0, 0.8, 0.6, 0.4]]) + np.random.randn(N, n_sensors) * 0.5

# Worn tool: chatter adds a second dominant direction
worn_base1 = np.random.randn(N, 1) * 3.0
worn_base2 = np.random.randn(N, 1) * 2.0   # new chatter direction
worn_data = (worn_base1 @ np.array([[1.0, 0.8, 0.6, 0.4]])
           + worn_base2 @ np.array([[0.2, -0.5, 0.9, -0.3]])
           + np.random.randn(N, n_sensors) * 0.5)

def pca_analysis(data, label):
    # Covariance matrix (symmetric, PSD)
    C = (data.T @ data) / len(data)
    eigenvalues, Q = np.linalg.eigh(C)
    # eigh returns ascending order; reverse for descending
    idx = np.argsort(eigenvalues)[::-1]
    eigenvalues = eigenvalues[idx]
    explained_var = eigenvalues / eigenvalues.sum()
    print(f"\\n{label}:")
    print(f"  Eigenvalues (variances):     {eigenvalues.round(3)}")
    print(f"  Explained variance ratio:    {explained_var.round(3)}")
    print(f"  Leading eigenvalue fraction: {explained_var[0]:.1%}")
    return eigenvalues

ev_clean = pca_analysis(clean_data, "Clean tool")
ev_worn  = pca_analysis(worn_data,  "Worn tool")

print()
print("Wear indicator — ratio of 2nd to 1st eigenvalue:")
print(f"  Clean: {ev_clean[1]/ev_clean[0]:.3f}")
print(f"  Worn:  {ev_worn[1]/ev_worn[0]:.3f}  (higher = more chatter energy in secondary axis)")
`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Hermitian matrices.** Over $\\mathbb{C}$, the analogue of a real symmetric matrix is a **Hermitian matrix**: $A = A^* = \\bar{A}^\\top$. The spectral theorem extends: every Hermitian matrix is unitarily diagonalizable ($A = U\\Lambda U^*$ with $UU^* = I$) and has real eigenvalues. This is the form used in quantum mechanics, where observables are Hermitian operators and measured values are eigenvalues.',
      '**Courant-Fischer min-max theorem.** The eigenvalues of a symmetric matrix $A$ have a variational characterization: $\\lambda_k(A) = \\min_{\\dim(V)=k} \\max_{\\mathbf{x} \\in V, \\|\\mathbf{x}\\|=1} \\mathbf{x}^\\top A \\mathbf{x}$. In particular, the largest eigenvalue is $\\lambda_n = \\max_{\\|\\mathbf{x}\\|=1} \\mathbf{x}^\\top A \\mathbf{x}$ — the direction that maximizes the quadratic form. This is why the first principal component of PCA is the direction of maximum variance.',
      '**Spectral theorem for compact operators.** In infinite-dimensional Hilbert spaces, compact self-adjoint operators have a countable orthonormal basis of eigenvectors with eigenvalues $\\lambda_1 \\geq \\lambda_2 \\geq \\cdots \\to 0$. This is the foundation for integral equations (Fredholm theory) and Fourier analysis. The finite-dimensional spectral theorem is the matrix analogue of this infinite-dimensional result.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Cholesky Decomposition',
        body: 'A symmetric positive definite matrix $A$ has a unique Cholesky decomposition $A = LL^\\top$ where $L$ is lower triangular with positive diagonal. This is twice as fast as LU decomposition and numerically more stable. Used in: linear systems, Monte Carlo simulation, Kalman filters.',
      },
      {
        type: 'theorem',
        title: 'Eckart-Young Theorem (Best Low-Rank Approx)',
        body: 'For a symmetric matrix $A = \\sum_{i=1}^n \\lambda_i \\mathbf{q}_i\\mathbf{q}_i^\\top$ with $|\\lambda_1| \\geq \\cdots \\geq |\\lambda_n|$, the best rank-$k$ approximation in the spectral (and Frobenius) norm is:\n$A_k = \\sum_{i=1}^k \\lambda_i \\mathbf{q}_i\\mathbf{q}_i^\\top$\nwith error $\\|A - A_k\\|_2 = |\\lambda_{k+1}|$. This is why truncated PCA captures the most variance.',
      },
      {
        type: 'insight',
        title: 'Simultaneous Diagonalization',
        body: 'Two symmetric matrices $A$ and $B$ (with $B$ positive definite) can be simultaneously diagonalized: there exists $Q$ with $Q^\\top A Q = \\Lambda$ and $Q^\\top B Q = I$. This is the **generalized eigenvalue problem** $A\\mathbf{v} = \\lambda B\\mathbf{v}$. In CNC vibration: $K\\mathbf{\\phi} = \\omega^2 M\\mathbf{\\phi}$ where $M$ is the mass matrix and $K$ is the stiffness matrix.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la4-006-1',
      title: 'Orthogonal diagonalization of a $2 \\times 2$ symmetric matrix',
      problem: 'Orthogonally diagonalize $A = \\begin{bmatrix}3&1\\\\1&3\\end{bmatrix}$. Find $Q$, $\\Lambda$, and write the spectral decomposition.',
      steps: [
        {
          expression: '\\det(A - \\lambda I) = (3-\\lambda)^2 - 1 = \\lambda^2 - 6\\lambda + 8 = (\\lambda-2)(\\lambda-4) = 0',
          annotation: 'Characteristic polynomial. Two distinct real eigenvalues — guaranteed since $A$ is symmetric.',
          strategyTitle: 'Find eigenvalues',
        },
        {
          expression: '\\lambda_1 = 2: \\quad (A - 2I)\\mathbf{v} = \\begin{bmatrix}1&1\\\\1&1\\end{bmatrix}\\mathbf{v} = \\mathbf{0} \\implies \\mathbf{v} = \\begin{bmatrix}1\\\\-1\\end{bmatrix}',
          annotation: 'Null space of $A - 2I$ is spanned by $(1, -1)^\\top$.',
          strategyTitle: 'Eigenvector for $\\lambda_1 = 2$',
        },
        {
          expression: '\\lambda_2 = 4: \\quad (A - 4I)\\mathbf{v} = \\begin{bmatrix}-1&1\\\\1&-1\\end{bmatrix}\\mathbf{v} = \\mathbf{0} \\implies \\mathbf{v} = \\begin{bmatrix}1\\\\1\\end{bmatrix}',
          annotation: 'Note: $(1,-1) \\cdot (1,1) = 1-1 = 0$ — automatically orthogonal, as the theorem guarantees.',
          strategyTitle: 'Eigenvector for $\\lambda_2 = 4$',
        },
        {
          expression: '\\mathbf{q}_1 = \\frac{1}{\\sqrt{2}}\\begin{bmatrix}1\\\\-1\\end{bmatrix}, \\quad \\mathbf{q}_2 = \\frac{1}{\\sqrt{2}}\\begin{bmatrix}1\\\\1\\end{bmatrix}',
          annotation: 'Normalize each eigenvector to unit length: divide by $\\sqrt{1^2 + (-1)^2} = \\sqrt{2}$.',
          strategyTitle: 'Normalize eigenvectors',
        },
        {
          expression: 'Q = \\frac{1}{\\sqrt{2}}\\begin{bmatrix}1&1\\\\-1&1\\end{bmatrix}, \\quad \\Lambda = \\begin{bmatrix}2&0\\\\0&4\\end{bmatrix}, \\quad A = Q\\Lambda Q^\\top',
          annotation: 'Verify: $Q^\\top Q = I$ (columns are orthonormal). This is a $45°$ rotation matrix — $A$ stretches by 2 along the $(-45°)$ diagonal and by 4 along the $(+45°)$ diagonal.',
          strategyTitle: 'Assemble $Q$ and $\\Lambda$',
          checkpoint: 'Always verify $Q^\\top Q = I$ and $Q\\Lambda Q^\\top = A$ before concluding.',
        },
        {
          expression: 'A = 2 \\cdot \\mathbf{q}_1\\mathbf{q}_1^\\top + 4 \\cdot \\mathbf{q}_2\\mathbf{q}_2^\\top = 2 \\cdot \\frac{1}{2}\\begin{bmatrix}1&-1\\\\-1&1\\end{bmatrix} + 4 \\cdot \\frac{1}{2}\\begin{bmatrix}1&1\\\\1&1\\end{bmatrix} = \\begin{bmatrix}3&1\\\\1&3\\end{bmatrix} \\checkmark',
          annotation: 'Spectral decomposition: $A$ as a sum of rank-1 projections. The two outer products partition the identity: $\\mathbf{q}_1\\mathbf{q}_1^\\top + \\mathbf{q}_2\\mathbf{q}_2^\\top = I$.',
          strategyTitle: 'Spectral decomposition',
        },
      ],
    },
    {
      id: 'ex-la4-006-2',
      title: 'Covariance matrix: PCA on 2D data',
      problem: 'A dataset has covariance matrix $C = \\begin{bmatrix}5&3\\\\3&5\\end{bmatrix}$. Find the principal components (axes of maximum variance) and the fraction of variance explained by each.',
      steps: [
        {
          expression: 'C = \\begin{bmatrix}5&3\\\\3&5\\end{bmatrix} = C^\\top, \\quad \\text{tr}(C) = 10 = \\text{total variance}',
          annotation: 'Covariance matrices are always symmetric and positive semidefinite. Total variance = trace = sum of eigenvalues.',
          strategyTitle: 'Identify the covariance matrix properties',
        },
        {
          expression: '\\det(C - \\lambda I) = (5-\\lambda)^2 - 9 = 0 \\implies \\lambda = 2, 8',
          annotation: 'Eigenvalues represent the variance in each principal direction.',
          strategyTitle: 'Find eigenvalues (variances)',
        },
        {
          expression: '\\lambda_1 = 8: \\mathbf{q}_1 = \\frac{1}{\\sqrt{2}}(1,1)^\\top \\quad (45° \\text{ direction})',
          annotation: 'Largest eigenvalue → first principal component = direction of maximum variance.',
          strategyTitle: 'First principal component',
        },
        {
          expression: '\\text{Fraction explained: } \\frac{\\lambda_1}{\\text{tr}(C)} = \\frac{8}{10} = 80\\%, \\quad \\frac{\\lambda_2}{\\text{tr}(C)} = \\frac{2}{10} = 20\\%',
          annotation: 'The $45°$ direction $(1,1)/\\sqrt{2}$ captures $80\\%$ of total variance. The data is elongated along this axis — both variables increase together.',
          strategyTitle: 'Explained variance fractions',
          hints: ['The $45°$ principal axis makes sense: if $C_{12} = 3 > 0$, the two variables are positively correlated, meaning the data cloud is elongated in the $(1,1)$ direction.'],
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la4-006-1',
      title: 'Matrix square root via spectral decomposition',
      difficulty: 'medium',
      problem: 'Find $\\sqrt{A}$ for $A = \\begin{bmatrix}5&4\\\\4&5\\end{bmatrix}$ (symmetric positive definite). Verify by squaring your answer.',
      hint: 'Orthogonally diagonalize $A = Q\\Lambda Q^\\top$, then $\\sqrt{A} = Q\\sqrt{\\Lambda}Q^\\top$ where $\\sqrt{\\Lambda} = \\text{diag}(\\sqrt{\\lambda_1}, \\sqrt{\\lambda_2})$.',
      walkthrough: [
        '**Find eigenvalues:** $\\det(A - \\lambda I) = (5-\\lambda)^2 - 16 = 0 \\implies \\lambda^2 - 10\\lambda + 9 = 0 \\implies \\lambda = 1, 9$.',
        '**Find eigenvectors:** For $\\lambda = 1$: $(A - I)\\mathbf{v} = 0 \\implies \\mathbf{q}_1 = (1,-1)^\\top/\\sqrt{2}$. For $\\lambda = 9$: $\\mathbf{q}_2 = (1,1)^\\top/\\sqrt{2}$.',
        '**Form $Q$ and $\\Lambda$:** $Q = \\frac{1}{\\sqrt{2}}\\begin{bmatrix}1&1\\\\-1&1\\end{bmatrix}$, $\\Lambda = \\begin{bmatrix}1&0\\\\0&9\\end{bmatrix}$.',
        '**Apply $f = \\sqrt{\\cdot}$ to eigenvalues:** $\\sqrt{\\Lambda} = \\text{diag}(1, 3)$.',
        '**Compute $\\sqrt{A} = Q\\sqrt{\\Lambda}Q^\\top$:** $\\sqrt{A} = \\frac{1}{2}\\begin{bmatrix}1&1\\\\-1&1\\end{bmatrix}\\begin{bmatrix}1&0\\\\0&3\\end{bmatrix}\\begin{bmatrix}1&-1\\\\1&1\\end{bmatrix} = \\frac{1}{2}\\begin{bmatrix}4&2\\\\2&4\\end{bmatrix} = \\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}$.',
        '**Verify:** $\\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}^2 = \\begin{bmatrix}5&4\\\\4&5\\end{bmatrix} = A$ ✓. The matrix square root is symmetric (because $A$ is symmetric) and positive definite (eigenvalues $1, 3 > 0$).',
      ],
    },
    {
      id: 'ch-la4-006-2',
      title: 'Prove eigenvectors for distinct eigenvalues are orthogonal',
      difficulty: 'hard',
      problem: 'Let $A$ be a real symmetric matrix with $A\\mathbf{u} = \\lambda\\mathbf{u}$ and $A\\mathbf{v} = \\mu\\mathbf{v}$ where $\\lambda \\neq \\mu$. Prove that $\\mathbf{u}^\\top \\mathbf{v} = 0$.',
      hint: 'Compute $\\mathbf{u}^\\top A \\mathbf{v}$ in two ways: using $A\\mathbf{v} = \\mu\\mathbf{v}$ and using $A = A^\\top$ with $A^\\top \\mathbf{u} = \\lambda\\mathbf{u}$.',
      walkthrough: [
        '**Set up:** Compute the scalar $\\mathbf{u}^\\top A \\mathbf{v}$ two ways.',
        '**Way 1 — use the right eigenvector equation:** $\\mathbf{u}^\\top (A\\mathbf{v}) = \\mathbf{u}^\\top (\\mu\\mathbf{v}) = \\mu(\\mathbf{u}^\\top \\mathbf{v})$.',
        '**Way 2 — transpose trick:** $\\mathbf{u}^\\top A \\mathbf{v} = (\\mathbf{u}^\\top A) \\mathbf{v} = (A^\\top \\mathbf{u})^\\top \\mathbf{v}$. Since $A = A^\\top$: $(A^\\top \\mathbf{u})^\\top = (A\\mathbf{u})^\\top = (\\lambda\\mathbf{u})^\\top = \\lambda\\mathbf{u}^\\top$. So: $\\mathbf{u}^\\top A \\mathbf{v} = \\lambda(\\mathbf{u}^\\top \\mathbf{v})$.',
        '**Equate:** Both expressions equal $\\mathbf{u}^\\top A\\mathbf{v}$, so $\\mu(\\mathbf{u}^\\top \\mathbf{v}) = \\lambda(\\mathbf{u}^\\top \\mathbf{v})$.',
        '**Conclude:** $(\\lambda - \\mu)(\\mathbf{u}^\\top \\mathbf{v}) = 0$. Since $\\lambda \\neq \\mu$, we must have $\\mathbf{u}^\\top \\mathbf{v} = 0$. QED.',
        '**Why this proof breaks for repeated eigenvalues:** If $\\lambda = \\mu$, the factor $(\\lambda - \\mu) = 0$ and we cannot conclude anything about $\\mathbf{u}^\\top\\mathbf{v}$. For repeated eigenvalues, eigenvectors in the same eigenspace are not automatically orthogonal — we must use Gram-Schmidt to orthogonalize within each eigenspace.',
      ],
    },
  ],

  mentalModel: [
    'Symmetric = $A = A^\\top$ → all eigenvalues real, eigenvectors perpendicular.',
    'Orthogonal diagonalization: $A = Q\\Lambda Q^\\top$ with $Q^{-1} = Q^\\top$.',
    'Spectral decomposition: $A = \\sum \\lambda_i \\mathbf{q}_i\\mathbf{q}_i^\\top$ (sum of rank-1 projections).',
    'Function of A: $f(A) = Qf(\\Lambda)Q^\\top$ — just apply $f$ to each eigenvalue.',
  ],

  checkpoints: [
    { id: 'cp-la4-006-1', question: 'What property guarantees that eigenvalues of a real symmetric matrix are real?', answer: 'Symmetry $A = A^\\top$; the proof uses $A\\mathbf{v} = \\lambda\\mathbf{v}$ and $\\bar{\\mathbf{v}}^\\top A\\mathbf{v} = \\lambda\\|\\mathbf{v}\\|^2$ must equal its conjugate.' },
    { id: 'cp-la4-006-2', question: 'What is the spectral decomposition of $A$?', answer: '$A = \\sum_{i=1}^n \\lambda_i \\mathbf{q}_i\\mathbf{q}_i^\\top$ — a sum of scaled rank-1 outer products.' },
    { id: 'cp-la4-006-3', question: 'Why is $Q^{-1} = Q^\\top$ in orthogonal diagonalization?', answer: 'Because the eigenvector columns of $Q$ are orthonormal: $Q^\\top Q = I$.' },
  ],

  assessment: {
    questions: [
      {
        id: 'assess-la4-006-1',
        type: 'proof',
        text: 'Prove that if $A = A^\\top$ is real symmetric, all eigenvalues of $A$ are real. (Hint: assume $A\\mathbf{v} = \\lambda\\mathbf{v}$ and use the conjugate $\\bar{\\mathbf{v}}^\\top A\\mathbf{v} = \\lambda\\|\\mathbf{v}\\|^2$, then compute the conjugate of both sides and use $A = A^\\top$.)',
        answer: 'Compute $\\bar{\\mathbf{v}}^\\top A \\mathbf{v} = \\bar{\\mathbf{v}}^\\top(\\lambda\\mathbf{v}) = \\lambda\\|\\mathbf{v}\\|^2$. Taking conjugates: $\\overline{\\bar{\\mathbf{v}}^\\top A \\mathbf{v}} = \\bar{\\lambda}\\|\\mathbf{v}\\|^2$. But $\\overline{\\bar{\\mathbf{v}}^\\top A \\mathbf{v}} = \\mathbf{v}^\\top A^\\top \\bar{\\mathbf{v}} = \\mathbf{v}^\\top A \\bar{\\mathbf{v}} = (\\bar{\\mathbf{v}}^\\top A^\\top \\mathbf{v})^\\top = \\bar{\\mathbf{v}}^\\top A \\mathbf{v}$ (scalar = its own transpose). Hence $\\lambda\\|\\mathbf{v}\\|^2 = \\bar{\\lambda}\\|\\mathbf{v}\\|^2$, so $\\lambda = \\bar{\\lambda}$ (real).',
        hint: 'A scalar equals its own transpose. Use this to show $\\bar{\\mathbf{v}}^\\top A\\mathbf{v}$ equals its own complex conjugate.',
      },
      {
        id: 'assess-la4-006-2',
        type: 'computation',
        text: 'Orthogonally diagonalize $A = \\begin{bmatrix}2&-1\\\\-1&2\\end{bmatrix}$ and write the spectral decomposition $A = \\lambda_1 \\mathbf{q}_1\\mathbf{q}_1^\\top + \\lambda_2 \\mathbf{q}_2\\mathbf{q}_2^\\top$. Verify that $\\mathbf{q}_1\\mathbf{q}_1^\\top + \\mathbf{q}_2\\mathbf{q}_2^\\top = I$.',
        answer: 'Eigenvalues: $\\lambda_1 = 1, \\lambda_2 = 3$. Eigenvectors: $\\mathbf{q}_1 = (1,1)^\\top/\\sqrt{2}$, $\\mathbf{q}_2 = (1,-1)^\\top/\\sqrt{2}$. Spectral: $A = 1\\cdot\\frac{1}{2}\\begin{bmatrix}1&1\\\\1&1\\end{bmatrix} + 3\\cdot\\frac{1}{2}\\begin{bmatrix}1&-1\\\\-1&1\\end{bmatrix} = \\begin{bmatrix}2&-1\\\\-1&2\\end{bmatrix}$ ✓. Sum of projections: $\\frac{1}{2}(\\begin{bmatrix}1&1\\\\1&1\\end{bmatrix}+\\begin{bmatrix}1&-1\\\\-1&1\\end{bmatrix}) = I$ ✓.',
        hint: 'Characteristic polynomial: $(2-\\lambda)^2 - 1 = 0$.',
      },
    ],
  },

  quiz: [
    {
      id: 'q-la4-006-1',
      type: 'choice',
      text: 'A real symmetric matrix $A = A^\\top$ is guaranteed to have:',
      options: [
        'Complex conjugate eigenvalue pairs',
        'All eigenvalues equal to 0 or 1',
        'Real eigenvalues and mutually orthogonal eigenvectors',
        'At least one zero eigenvalue',
      ],
      answer: 'Real eigenvalues and mutually orthogonal eigenvectors',
      hints: ['The two key guarantees of the spectral theorem for real symmetric matrices are: (1) all eigenvalues are real, and (2) eigenvectors for distinct eigenvalues are automatically orthogonal.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la4-006-2',
      type: 'choice',
      text: 'In the orthogonal diagonalization $A = Q\\Lambda Q^\\top$, what is true of $Q$?',
      options: [
        '$Q^2 = I$ (involutory)',
        '$Q^{-1} = Q$ (symmetric)',
        '$Q^{-1} = Q^\\top$ (orthogonal)',
        '$Q = \\Lambda$ (diagonal)',
      ],
      answer: '$Q^{-1} = Q^\\top$ (orthogonal)',
      hints: ['The columns of $Q$ are orthonormal eigenvectors, so $Q^\\top Q = I$, which means $Q^{-1} = Q^\\top$. This is the definition of an orthogonal matrix.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la4-006-3',
      type: 'choice',
      text: 'The spectral decomposition $A = \\sum_{i=1}^n \\lambda_i \\mathbf{q}_i\\mathbf{q}_i^\\top$ writes $A$ as:',
      options: [
        'A sum of $n$ diagonal matrices',
        'A sum of $n$ rank-1 orthogonal projection matrices scaled by eigenvalues',
        'A product of $n$ rotation matrices',
        'A sum of $n$ identity matrices',
      ],
      answer: 'A sum of $n$ rank-1 orthogonal projection matrices scaled by eigenvalues',
      hints: ['Each outer product $\\mathbf{q}_i\\mathbf{q}_i^\\top$ is a rank-1 matrix that projects onto the $\\mathbf{q}_i$ direction. It satisfies $(\\mathbf{q}_i\\mathbf{q}_i^\\top)^2 = \\mathbf{q}_i\\mathbf{q}_i^\\top$ (projection property) and is symmetric.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la4-006-4',
      type: 'choice',
      text: 'In PCA, the covariance matrix is symmetric and PSD. Its eigenvectors are called principal components. The eigenvalue $\\lambda_i$ represents:',
      options: [
        'The mean of the data in direction $\\mathbf{q}_i$',
        'The variance of the data projected onto $\\mathbf{q}_i$',
        'The correlation between the $i$-th and $(i+1)$-th features',
        'The number of data points along $\\mathbf{q}_i$',
      ],
      answer: 'The variance of the data projected onto $\\mathbf{q}_i$',
      hints: ['If the covariance is $C = \\frac{1}{N}X^\\top X$ and $C\\mathbf{q}_i = \\lambda_i \\mathbf{q}_i$, then the projected data $X\\mathbf{q}_i$ has variance $\\mathbf{q}_i^\\top C \\mathbf{q}_i = \\lambda_i$. The Courant-Fischer theorem says $\\lambda_1 = \\max_{\\|\\mathbf{q}\\|=1} \\mathbf{q}^\\top C \\mathbf{q}$ — the first PC maximizes explained variance.'],
      reviewSection: 'rigor',
    },
  ],
};
