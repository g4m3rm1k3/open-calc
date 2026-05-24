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
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Hermitian matrices.** Over $\\mathbb{C}$, the analogue of a real symmetric matrix is a **Hermitian matrix**: $A = A^* = \\bar{A}^\\top$. The spectral theorem extends: every Hermitian matrix is unitarily diagonalizable ($A = U\\Lambda U^*$ with $UU^* = I$) and has real eigenvalues. This is the form used in quantum mechanics.',
      '**Spectral theorem for compact operators.** In infinite-dimensional Hilbert spaces, compact self-adjoint operators have a countable orthonormal basis of eigenvectors (with eigenvalues converging to 0). This is the foundation for Fourier series and integral equations.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Cholesky Decomposition',
        body: 'A symmetric positive definite matrix $A$ has a unique Cholesky decomposition $A = LL^\\top$ where $L$ is lower triangular with positive diagonal. This is twice as fast as LU decomposition and numerically more stable. Used in: linear systems, Monte Carlo simulation, Kalman filters.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la4-006-1',
      title: 'Orthogonal diagonalization of a $2 \\times 2$ symmetric matrix',
      problem: 'Orthogonally diagonalize $A = \\begin{bmatrix}3&1\\\\1&3\\end{bmatrix}$.',
      solution: 'Char poly: $(3-\\lambda)^2 - 1 = 0 \\Rightarrow \\lambda = 2, 4$. For $\\lambda = 2$: eigenvector $[1,-1]^\\top/\\sqrt{2}$. For $\\lambda = 4$: eigenvector $[1,1]^\\top/\\sqrt{2}$. $Q = \\frac{1}{\\sqrt{2}}\\begin{bmatrix}1&1\\\\-1&1\\end{bmatrix}$, $\\Lambda = \\begin{bmatrix}2&0\\\\0&4\\end{bmatrix}$, $A = Q\\Lambda Q^\\top$.',
    },
  ],

  challenges: [
    {
      id: 'ch-la4-006-1',
      title: 'Matrix square root',
      difficulty: 'medium',
      prompt: 'Find $\\sqrt{A}$ for $A = \\begin{bmatrix}5&4\\\\4&5\\end{bmatrix}$ (a symmetric positive definite matrix).',
      hint: 'Use $A = Q\\Lambda Q^\\top$, then $\\sqrt{A} = Q\\sqrt{\\Lambda}Q^\\top$.',
      solution: 'Eigenvalues $\\lambda = 1, 9$. $\\sqrt{A} = Q\\text{diag}(1, 3)Q^\\top = \\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}$. Verify: $\\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}^2 = \\begin{bmatrix}5&4\\\\4&5\\end{bmatrix}$. ✓',
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

  assessment: 'Prove that eigenvectors of a symmetric matrix for distinct eigenvalues are orthogonal. Then orthogonally diagonalize $A = \\begin{bmatrix}2&-1&0\\\\-1&2&-1\\\\0&-1&2\\end{bmatrix}$.',

  quiz: [
    { id: 'q-la4-006-1', question: 'A real symmetric matrix is guaranteed to have:', options: ['Complex conjugate eigenvalue pairs', 'All eigenvalues equal', 'Real eigenvalues and orthogonal eigenvectors', 'Eigenvalue 0'], answer: 'Real eigenvalues and orthogonal eigenvectors' },
    { id: 'q-la4-006-2', question: 'In $A = Q\\Lambda Q^\\top$, the matrix $Q$ satisfies:', options: ['$Q^2 = I$', '$Q^{-1} = Q$', '$Q^{-1} = Q^\\top$', '$Q = \\Lambda$'], answer: '$Q^{-1} = Q^\\top$' },
    { id: 'q-la4-006-3', question: 'The spectral theorem applies to which class of matrices?', options: ['All square matrices', 'Invertible matrices only', 'Real symmetric matrices', 'Diagonal matrices only'], answer: 'Real symmetric matrices' },
  ],
};
