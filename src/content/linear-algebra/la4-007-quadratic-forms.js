export default {
  id: 'la4-007',
  slug: 'quadratic-forms',
  chapter: 'la4',
  order: 7,
  title: 'Quadratic Forms and the Principal Axes Theorem',
  subtitle: 'Every expression $\\mathbf{x}^\\top A \\mathbf{x}$ with symmetric $A$ is a quadratic form — a generalization of $ax^2 + bxy + cy^2$. The Principal Axes Theorem rotates the coordinate system to eliminate the cross terms.',
  tags: ['quadratic form', 'positive definite', 'positive semidefinite', 'indefinite', 'principal axes', 'conics', 'classification', 'definiteness'],
  aliases: 'quadratic form positive definite negative definite indefinite principal axes theorem conics ellipse hyperbola classification',

  hook: {
    question: "The equation $3x^2 + 4xy + 3y^2 = 1$ is a conic section — but which one? An ellipse, a hyperbola, or something else? How do you tell without graphing it?",
    realWorldContext: "Quadratic forms are everywhere in optimization: the second-order Taylor approximation of any smooth function is a quadratic form, and whether that function has a local minimum, maximum, or saddle point depends entirely on whether the Hessian (a symmetric matrix) is positive definite, negative definite, or indefinite. In physics, quadratic forms represent energy: kinetic energy $\\frac{1}{2}\\mathbf{v}^\\top M \\mathbf{v}$ and potential energy $\\frac{1}{2}\\mathbf{x}^\\top K \\mathbf{x}$ where $M$ and $K$ are the mass and stiffness matrices. The structure of these quadratic forms determines whether a system oscillates, decays, or blows up.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**What is a quadratic form?** A quadratic form is a function $Q(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x}$ where $A$ is a symmetric $n \\times n$ matrix and $\\mathbf{x} \\in \\mathbb{R}^n$. In two variables, every expression $ax^2 + bxy + cy^2$ is a quadratic form with $A = \\begin{bmatrix}a & b/2 \\\\ b/2 & c\\end{bmatrix}$ — the off-diagonal entries are half the cross-term coefficient.',
      '**Definiteness classifies the form.** A quadratic form (and its matrix $A$) is:\n- **Positive definite (PD):** $Q(\\mathbf{x}) > 0$ for all $\\mathbf{x} \\neq 0$ — all eigenvalues positive\n- **Positive semidefinite (PSD):** $Q(\\mathbf{x}) \\geq 0$ for all $\\mathbf{x}$ — all eigenvalues $\\geq 0$\n- **Negative definite (ND):** $Q(\\mathbf{x}) < 0$ for all $\\mathbf{x} \\neq 0$ — all eigenvalues negative\n- **Indefinite:** $Q$ takes both positive and negative values — mixed eigenvalue signs',
      '**The Principal Axes Theorem.** By the Spectral Theorem, $A = Q\\Lambda Q^\\top$. Change variables: $\\mathbf{x} = Q\\mathbf{y}$ (rotate to the eigenvector coordinate system). Then:\n\n$Q(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x} = (Q\\mathbf{y})^\\top A (Q\\mathbf{y}) = \\mathbf{y}^\\top Q^\\top A Q \\mathbf{y} = \\mathbf{y}^\\top \\Lambda \\mathbf{y} = \\lambda_1 y_1^2 + \\cdots + \\lambda_n y_n^2$\n\nIn the rotated coordinates, the cross terms vanish. The form is purely diagonal — just a sum of scaled squares.',
      '**Classifying conics.** The equation $Q(\\mathbf{x}) = 1$ defines a level set of the quadratic form. In the principal axis coordinates ($y_1, y_2$), it becomes $\\lambda_1 y_1^2 + \\lambda_2 y_2^2 = 1$. If both $\\lambda_i > 0$: ellipse (ratio of semi-axes = $1/\\sqrt{\\lambda_i}$). If $\\lambda_1 > 0 > \\lambda_2$: hyperbola. If any $\\lambda_i = 0$: degenerate.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Sylvester\'s Criterion: Testing Positive Definiteness',
        body: 'A symmetric matrix $A$ is positive definite iff all leading principal minors are positive:\n$\\det(A_{1\\times 1}) > 0$, $\\det(A_{2\\times 2}) > 0$, ..., $\\det(A) > 0$\nThis gives a determinant-based test that avoids computing eigenvalues.',
      },
      {
        type: 'insight',
        title: 'Connecting to Optimization',
        body: 'At a critical point where $\\nabla f = 0$:\n• Hessian $H$ positive definite → local minimum\n• Hessian $H$ negative definite → local maximum\n• Hessian $H$ indefinite → saddle point\nQuadratic forms are exactly the second-order behavior of smooth functions near critical points.',
      },
      {
        type: 'theorem',
        title: 'Principal Axes Theorem',
        body: 'Every quadratic form $Q(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x}$ can be diagonalized by an orthogonal change of variables $\\mathbf{x} = Q\\mathbf{y}$:\n$Q(\\mathbf{x}) = \\lambda_1 y_1^2 + \\lambda_2 y_2^2 + \\cdots + \\lambda_n y_n^2$\nThe axes of the resulting ellipsoid/hyperboloid are the eigenvectors (principal axes) of $A$.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Quadratic Forms and Level Sets',
        mathBridge: 'Compute eigenvalues to classify a quadratic form and find the principal axes.',
        caption: 'Eigenvalues determine the shape; eigenvectors determine the orientation.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Classify and diagonalize a quadratic form',
              prose: ['Q(x) = 3x1^2 + 4x1*x2 + 3x2^2 = x^T * A * x. What conic is Q = 1?'],
              code: `% 3x1^2 + 4x1*x2 + 3x2^2: off-diagonal = half of 4 = 2
A = [3 2; 2 3]
[Q, D] = eig(A)
lambdas = diag(D)
disp('Eigenvalues (both positive => ellipse):')
lambdas
disp('Semi-axes lengths 1/sqrt(lambda):')
1 ./ sqrt(lambdas)
disp('Principal axis directions (eigenvectors):')
Q
`,
            },
            {
              id: 2,
              cellTitle: 'Positive definiteness via Sylvester criterion',
              prose: ['Test A and B for positive definiteness using leading principal minors.'],
              code: `A = [4 2; 2 3]
disp('Leading principal minors of A:')
m1 = A(1,1)
m2 = det(A)
disp('A is PD? (all minors > 0):')
m1 > 0 && m2 > 0

B = [1 3; 3 2]
disp('Leading principal minors of B:')
n1 = B(1,1)
n2 = det(B)
disp('B is PD? No (n2 < 0 => indefinite):')
n1 > 0 && n2 > 0
[V,D] = eig(B)
disp('Eigenvalues of B (mixed signs => indefinite):')
diag(D)
`,
            },
            {
              id: 3,
              cellTitle: 'Computing the change of variables',
              prose: ['Find the rotation Q that eliminates cross terms in 3x1^2 + 4x1*x2 + 3x2^2.'],
              code: `A = [3 2; 2 3]
[Q, D] = eig(A)
lambdas = diag(D);

disp('Original form: 3x1^2 + 4x1*x2 + 3x2^2')
disp('After rotation x = Q*y:')
disp('y1^2 * lambda1 + y2^2 * lambda2 =')
lambdas
disp('Rotation matrix Q (columns = principal axes):')
Q
disp('Verify Q is orthogonal (Q^T*Q = I):')
Q'*Q
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Diagonalization of quadratic forms.** Given $Q(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x}$ with $A = Q_0 \\Lambda Q_0^\\top$ (Spectral Theorem), set $\\mathbf{y} = Q_0^\\top \\mathbf{x}$ (so $\\mathbf{x} = Q_0 \\mathbf{y}$). Then:\n\n$Q(\\mathbf{x}) = (Q_0 \\mathbf{y})^\\top (Q_0 \\Lambda Q_0^\\top)(Q_0 \\mathbf{y}) = \\mathbf{y}^\\top \\Lambda \\mathbf{y} = \\sum_{i=1}^n \\lambda_i y_i^2$\n\nThe change of variables $\\mathbf{y} = Q_0^\\top \\mathbf{x}$ is a rotation (since $Q_0$ is orthogonal).',
      '**Sylvester\'s Law of Inertia.** The numbers of positive, negative, and zero eigenvalues of a symmetric matrix (its **signature**) are invariant under any congruence transformation $A \\mapsto P^\\top A P$ (with $P$ invertible). This is the algebraic content of the Principal Axes Theorem: no matter how you diagonalize the form, the same number of squares appear with positive and negative coefficients.',
      '**Gram matrices are positive semidefinite.** For any matrix $B$, $A = B^\\top B$ is symmetric PSD: $\\mathbf{x}^\\top B^\\top B \\mathbf{x} = \\|B\\mathbf{x}\\|^2 \\geq 0$. Conversely, every PSD matrix is a Gram matrix. In statistics, sample covariance matrices are Gram matrices (hence PSD), so their quadratic forms $\\mathbf{v}^\\top \\Sigma \\mathbf{v}$ represent variances of linear combinations.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Positive Definite Test (Eigenvalue Criterion)',
        body: '$A$ positive definite $\\Leftrightarrow$ all eigenvalues of $A$ are positive\n$A$ positive semidefinite $\\Leftrightarrow$ all eigenvalues $\\geq 0$\n$A$ negative definite $\\Leftrightarrow$ all eigenvalues are negative\n$A$ indefinite $\\Leftrightarrow$ has both positive and negative eigenvalues',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Sylvester\'s Law of Inertia (formal).** If $A$ and $B$ are real symmetric matrices, they are congruent ($A = P^\\top B P$ for some invertible $P$) iff they have the same signature $(n_+, n_-, n_0)$ where $n_+, n_-, n_0$ are the numbers of positive, negative, and zero eigenvalues. The classification of real quadratic forms over $\\mathbb{R}$ is completely determined by the signature.',
      '**Connection to topology.** The level set $\\{\\mathbf{x} : \\mathbf{x}^\\top A \\mathbf{x} = 1\\}$ is: a real ellipsoid if $A$ is PD; a hyperboloid of one or two sheets if $A$ is indefinite. The topology (compactness, connectivity) is determined by the signature of $A$.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Completing the Square',
        body: 'The process of eliminating cross terms from a quadratic form is the matrix version of completing the square. For $3x^2 + 4xy + 3y^2$: let $u = x + \\frac{2}{3}y$, then $3(x + \\frac{2}{3}y)^2 + \\frac{5}{3}y^2$ — all cross terms gone. This is Gaussian elimination applied to the Gram matrix.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la4-007-1',
      title: 'Classifying a conic',
      problem: 'Classify the conic $5x^2 - 4xy + 5y^2 = 36$.',
      solution: '$A = \\begin{bmatrix}5&-2\\\\-2&5\\end{bmatrix}$. Eigenvalues: $\\lambda = 3, 7$ (both positive). The conic is an ellipse with semi-axes $\\sqrt{36/3} = \\sqrt{12}$ and $\\sqrt{36/7}$ in the principal axis directions.',
    },
    {
      id: 'ex-la4-007-2',
      title: 'Positive definiteness test',
      problem: 'Is $A = \\begin{bmatrix}2&1\\\\1&3\\end{bmatrix}$ positive definite?',
      solution: 'Leading minors: $2 > 0$ and $\\det(A) = 6 - 1 = 5 > 0$. By Sylvester\'s criterion, $A$ is positive definite.',
    },
  ],

  challenges: [
    {
      id: 'ch-la4-007-1',
      title: 'Quadratic form classification',
      difficulty: 'medium',
      prompt: 'For which values of $k$ is $Q(x,y) = x^2 + 4xy + ky^2$ positive definite?',
      hint: 'Set up the matrix $A$ and apply Sylvester\'s criterion: both leading minors must be positive.',
      solution: '$A = \\begin{bmatrix}1&2\\\\2&k\\end{bmatrix}$. Leading minors: $1 > 0$ always. $\\det(A) = k - 4 > 0 \\Rightarrow k > 4$.',
    },
  ],

  mentalModel: [
    '$Q(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x}$: off-diagonal entries are half the cross-term coefficients.',
    'Definiteness is determined by eigenvalue signs: all positive = PD, mixed = indefinite.',
    'Principal Axes Theorem: rotate to eigenvector axes to eliminate cross terms.',
    'Sylvester criterion: test PD via leading principal minors (no eigenvalue computation needed).',
  ],

  checkpoints: [
    { id: 'cp-la4-007-1', question: 'How do you read off the matrix $A$ from the expression $2x^2 + 6xy + 5y^2$?', answer: '$A = \\begin{bmatrix}2&3\\\\3&5\\end{bmatrix}$ — diagonal entries are coefficients of $x^2, y^2$; off-diagonal entries are half the coefficient of $xy$.' },
    { id: 'cp-la4-007-2', question: 'What does the Principal Axes Theorem do to a quadratic form?', answer: 'Rotates coordinates to eliminate cross terms, leaving $\\sum \\lambda_i y_i^2$.' },
    { id: 'cp-la4-007-3', question: 'What kind of conic is $Q(\\mathbf{x}) = 1$ if $A$ has one positive and one negative eigenvalue?', answer: 'Hyperbola.' },
  ],

  assessment: 'Classify and sketch the conic $Q(x,y) = 4x^2 - 4xy + 4y^2 = 6$. Find the semi-axes lengths and the orientation of the principal axes.',

  quiz: [
    { id: 'q-la4-007-1', question: 'A symmetric matrix with all positive eigenvalues is:', options: ['Indefinite', 'Positive semidefinite only', 'Positive definite', 'Negative definite'], answer: 'Positive definite' },
    { id: 'q-la4-007-2', question: 'The matrix of the quadratic form $x^2 + 6xy + 2y^2$ is:', options: ['$\\begin{bmatrix}1&6\\\\6&2\\end{bmatrix}$', '$\\begin{bmatrix}1&3\\\\3&2\\end{bmatrix}$', '$\\begin{bmatrix}1&0\\\\0&2\\end{bmatrix}$', '$\\begin{bmatrix}2&6\\\\6&1\\end{bmatrix}$'], answer: '$\\begin{bmatrix}1&3\\\\3&2\\end{bmatrix}$' },
    { id: 'q-la4-007-3', question: 'Sylvester\'s criterion tests positive definiteness using:', options: ['Eigenvalues', 'The trace', 'Leading principal minors', 'The rank'], answer: 'Leading principal minors' },
  ],
};
