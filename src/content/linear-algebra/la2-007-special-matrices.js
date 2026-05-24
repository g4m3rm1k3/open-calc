export default {
  id: 'la2-007',
  slug: 'special-matrices',
  chapter: 'la2',
  order: 7,
  title: 'Special Matrices: Symmetric, Orthogonal, and Positive Definite',
  subtitle: 'The structured matrices that dominate applications — and why their structure guarantees beautiful properties.',
  tags: ['symmetric matrix', 'orthogonal matrix', 'positive definite', 'transpose', 'diagonal', 'triangular', 'identity'],
  aliases: 'symmetric orthogonal positive definite transpose diagonal triangular Hermitian unitary SPD special structured matrices',

  hook: {
    question: "Why do physics simulations, Google's PageRank, and machine learning all use symmetric matrices? Is it just coincidence?",
    realWorldContext: "Real-world problems almost always produce matrices with special structure. The stiffness matrix in structural engineering is symmetric (and positive definite). The rotation matrix in robotics is orthogonal. The covariance matrix in statistics is symmetric positive definite. Each type of structure is not an accident — it reflects a physical or mathematical property of the underlying problem. Exploiting this structure gives faster algorithms (Cholesky instead of LU), guaranteed numerical behavior (eigenvalues are real), and simpler theoretical analysis.",
    previewVisualizationId: 'LALesson02_Transform',
  },

  intuition: {
    prose: [
      '**Symmetric matrices ($A = A^\\top$):** A matrix is symmetric if it equals its own transpose. Geometrically, this means the entry $a_{ij}$ (row $i$, column $j$) always equals $a_{ji}$. These matrices arise whenever a relationship is mutual: if node $i$ connects to node $j$ with weight $w$, then $j$ connects to $i$ with the same weight. The **spectral theorem** guarantees symmetric matrices have real eigenvalues and orthogonal eigenvectors.',
      '**Orthogonal matrices ($A^{-1} = A^\\top$):** An orthogonal matrix has columns that are orthonormal — pairwise perpendicular unit vectors. The key property is $A^\\top A = I$, which means the inverse equals the transpose. Multiplying by $A$ is a **rigid motion** (rotation or reflection) — it preserves lengths and angles. Rotation matrices, reflection matrices, and the $Q$ in QR decomposition are all orthogonal.',
      '**Positive definite matrices:** A symmetric matrix $A$ is **positive definite** (SPD) if $\\mathbf{x}^\\top A \\mathbf{x} > 0$ for all nonzero $\\mathbf{x}$. This means the associated quadratic form $f(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x}$ is like a bowl — it has a single minimum at the origin. SPD matrices have all positive eigenvalues, admit a Cholesky factorization $A = LL^\\top$, and are what optimization algorithms (gradient descent, conjugate gradient) require to guarantee convergence.',
      '**Diagonal matrices** are the simplest: operations reduce to scalar operations on each diagonal entry. **Triangular matrices** (upper and lower) make linear systems trivially solvable by substitution. These are not just special cases — they are the targets of most matrix factorization algorithms (LU produces triangular matrices, Schur decomposition produces triangular, eigendecomposition of symmetric matrices produces diagonal).',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The Matrix Zoo — Quick Reference',
        body: '| Type | Condition | Key Property |\n|---|---|---|\n| Symmetric | $A = A^\\top$ | Real eigenvalues, orthogonal eigenvectors |\n| Orthogonal | $A^\\top A = I$ | Preserves lengths and angles |\n| Pos. Definite | $\\mathbf{x}^\\top A\\mathbf{x} > 0$ | All $\\lambda_i > 0$, Cholesky exists |\n| Diagonal | $a_{ij} = 0$ for $i \\neq j$ | Trivial eigenvalues/inverses |\n| Triangular | Zeros above/below diagonal | Solvable by substitution |\n| Idempotent | $A^2 = A$ | Projection matrices |',
      },
      {
        type: 'insight',
        title: 'When to Use Which Matrix Type — Decision Guide',
        body: '**Given a matrix $A$, ask these questions in order:**\n\n1. Is $A = A^\\top$? → **Symmetric.** Use `eigh()` not `eig()` (faster, guaranteed real eigenvalues).\n2. Does $A^\\top A = I$? → **Orthogonal.** Inverse is free: $A^{-1} = A^\\top$. Condition number = 1.\n3. Symmetric AND all eigenvalues positive? → **SPD.** Use Cholesky ($A = LL^\\top$) — twice as fast as LU, stable.\n4. Symmetric AND all eigenvalues ≥ 0? → **PSD.** Arises from covariance matrices; Cholesky may fail near zero eigenvalues.\n5. Zeros above diagonal? → **Lower triangular.** Solve by forward substitution in $O(n^2)$.\n6. Zeros below diagonal? → **Upper triangular.** Solve by back substitution in $O(n^2)$.\n\n**Rule of thumb:** Structure → algorithm. Never use general LU on a symmetric matrix; never invert an orthogonal matrix.',
      },
      {
        type: 'insight',
        title: 'Why Orthogonal Matrices Are Numerically Perfect',
        body: 'The condition number of an orthogonal matrix is always exactly 1 — the best possible. This means solving $Qx = b$ (i.e., $x = Q^\\top b$) introduces zero amplification of errors. Algorithms like Gram-Schmidt and QR decomposition intentionally produce orthogonal matrices to keep computations stable.',
      },
      {
        type: 'warning',
        title: '"Orthogonal" is Overloaded',
        body: 'An **orthogonal matrix** is a square matrix with orthonormal columns ($Q^\\top Q = I$). Two **vectors** are orthogonal if their dot product is 0. These are different uses of the same word. To add confusion: a non-square matrix $Q$ with $Q^\\top Q = I$ is called **unitary** (in the complex case) or just described as "having orthonormal columns" — it is NOT called an orthogonal matrix unless it is square.',
      },
    ],
    visualizations: [
      {
        id: 'LALesson02_Transform',
        title: 'Special Matrices as Transformations',
        mathBridge: 'Click through each matrix type and observe how it transforms the unit square. Orthogonal matrices rotate/reflect — note the output square has the same area. Positive definite matrices stretch but never flip the square.',
        caption: 'Visualize how structure constrains the transformation.',
      },
      {
        id: 'OpenMatNotebook',
        title: 'Verify Special Matrix Properties in OpenMAT',
        mathBridge: 'Test the properties of each matrix type computationally.',
        caption: 'Interactive verification of special matrix identities.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Symmetric: eigenvalues are real',
              prose: ['For any real symmetric matrix, all eigenvalues are real. Verify this.'],
              code: `A = [4 2 1; 2 3 1; 1 1 5];
disp('Is symmetric:')
norm(A - A')        % should be 0
[V, D] = eig(A);
disp('Eigenvalues (all real):')
diag(D)`,
            },
            {
              id: 2,
              cellTitle: 'Orthogonal: Q^T Q = I',
              prose: ['The 2D rotation matrix is orthogonal. Verify that Q^T Q = I exactly.'],
              code: `theta = pi/4;
Q = [cos(theta) -sin(theta); sin(theta) cos(theta)];
disp('Q^T Q:')
Q' * Q
disp('det(Q):')
det(Q)      % must be ±1`,
            },
            {
              id: 3,
              cellTitle: 'Positive Definite: x^T A x > 0',
              prose: ['Test the quadratic form for several random vectors.'],
              code: `A = [5 2; 2 3];   % symmetric
for k = 1:5
  x = randn(2,1);
  quad = x' * A * x;
  disp(quad)        % should always be positive
end
disp('Eigenvalues:')
eig(A)              % both positive iff SPD`,
            },
          ]
        }
      },
    ],
  },

  math: {
    prose: [
      '**Symmetric matrices and the Spectral Theorem (preview).** If $A \\in \\mathbb{R}^{n \\times n}$ is symmetric, then: (1) all eigenvalues of $A$ are real; (2) eigenvectors belonging to distinct eigenvalues are orthogonal; (3) there exists an orthogonal matrix $Q$ and diagonal matrix $\\Lambda$ such that $A = Q\\Lambda Q^\\top$. This is the spectral theorem for real symmetric matrices, proved in full in Chapter 4.',
      '**Orthogonal matrices and isometries.** $Q$ is orthogonal iff $\\|Q\\mathbf{x}\\| = \\|\\mathbf{x}\\|$ for all $\\mathbf{x}$ iff $Q^\\top Q = I$. The orthogonal matrices form a group under multiplication (the orthogonal group $O(n)$). Those with $\\det(Q) = +1$ are proper rotations (special orthogonal group $SO(n)$); those with $\\det(Q) = -1$ include reflections.',
      '**Positive definite: three equivalent definitions.** For symmetric $A$, the following are equivalent: (1) $\\mathbf{x}^\\top A \\mathbf{x} > 0$ for all $\\mathbf{x} \\neq \\mathbf{0}$; (2) all eigenvalues of $A$ are positive; (3) all leading principal minors of $A$ are positive (Sylvester\'s criterion); (4) $A = B^\\top B$ for some matrix $B$ with linearly independent columns.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Properties of Orthogonal Matrices',
        body: 'If $Q$ is $n \\times n$ orthogonal ($Q^\\top Q = I$):\n1. $Q^{-1} = Q^\\top$ (inverse is free)\n2. $\\det(Q) = \\pm 1$\n3. $\\|Q\\mathbf{x}\\| = \\|\\mathbf{x}\\|$ for all $\\mathbf{x}$ (isometry)\n4. The product of two orthogonal matrices is orthogonal\n5. $\\kappa(Q) = 1$ (perfect condition number)',
      },
      {
        type: 'definition',
        title: 'Positive Semidefinite',
        body: '$A$ is **positive semidefinite** (PSD) if $\\mathbf{x}^\\top A \\mathbf{x} \\geq 0$ for all $\\mathbf{x}$ (allowing zero). PSD allows zero eigenvalues; SPD requires strictly positive eigenvalues. Covariance matrices are always PSD (SPD when invertible). The notation is $A \\succeq 0$ for PSD and $A \\succ 0$ for SPD.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Code: Special Matrices — Verification and Cholesky',
        mathBridge: 'np.linalg.eigh(A) computes eigenvalues of symmetric matrices efficiently. np.linalg.cholesky(A) factors SPD matrices into A = L @ L.T. np.linalg.cond(Q) should equal 1.0 for orthogonal matrices.',
        caption: 'Verify structural properties and exploit them for efficient computation.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cellTitle: 'Symmetric matrix — verify real eigenvalues and orthogonal eigenvectors',
              prose: [
                'For real symmetric matrices, NumPy\'s `np.linalg.eigh()` is faster and more accurate than `np.linalg.eig()` because it exploits the symmetry.',
                'The eigenvectors form an orthonormal set — their matrix Q satisfies Q.T @ Q = I.',
              ],
              code: `import numpy as np

A = np.array([[4., 2., 1.],
              [2., 3., 1.],
              [1., 1., 5.]])

# eigh is specialized for symmetric matrices (faster, more accurate)
eigenvalues, Q = np.linalg.eigh(A)

print("Eigenvalues (all real):", eigenvalues.round(6))
print("All positive?", np.all(eigenvalues > 0), "→ SPD!")
print()
print("Eigenvectors (columns of Q):")
print(Q.round(6))
print()
# Orthonormality: Q^T Q should = I
print("Q^T @ Q (should = I):")
print((Q.T @ Q).round(10))`,
            },
            {
              id: 2,
              cellTitle: 'Orthogonal matrix — condition number = 1, inverse = transpose',
              prose: [
                'A 3D rotation matrix is orthogonal. Verify Q^T @ Q = I, det = 1, and condition number = 1.',
                'Condition number = 1 means the transformation introduces zero amplification of errors — numerically ideal.',
              ],
              code: `import numpy as np

# Rotation by 45° around z-axis
theta = np.radians(45)
Q = np.array([
    [np.cos(theta), -np.sin(theta), 0.],
    [np.sin(theta),  np.cos(theta), 0.],
    [0.,             0.,            1.]
])

print("Q^T @ Q (should = I):")
print((Q.T @ Q).round(10))
print()
print(f"det(Q) = {np.linalg.det(Q):.6f}  (should be +1 for rotation)")
print(f"Condition number = {np.linalg.cond(Q):.6f}  (should be 1.0)")
print()
# Inverse = transpose (free!)
print("Q^{-1} - Q^T (should be zero):")
print((np.linalg.inv(Q) - Q.T).round(10))`,
            },
            {
              id: 3,
              cellTitle: 'Cholesky decomposition — A = L @ L.T for SPD',
              prose: [
                'For symmetric positive definite matrices, Cholesky factorization A = L @ L.T is twice as fast as LU decomposition.',
                'It only works when A is truly SPD — the algorithm will throw a LinAlgError if A is not positive definite.',
              ],
              code: `import numpy as np

# SPD matrix (Gram matrix = B^T @ B)
B = np.array([[1., 2.], [3., 4.], [5., 0.]])
A = B.T @ B   # always SPD when B has full column rank

print("A = B^T @ B:")
print(A)
print(f"Eigenvalues: {np.linalg.eigh(A)[0].round(4)}  (all positive ✓)")
print()

# Cholesky factorization: A = L @ L.T
L = np.linalg.cholesky(A)
print("L (Cholesky factor):")
print(L.round(6))
print()
print("L @ L^T (should = A):")
print((L @ L.T).round(10))
print()
# Solving Ax = b via Cholesky (same idea as LU but exploits symmetry)
b = np.array([1., 2.])
y = np.linalg.solve(L, b)         # forward sub
x = np.linalg.solve(L.T, y)       # back sub
print(f"Solution x: {x.round(6)}")
print(f"Verify A@x = b: {np.allclose(A @ x, b)}")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Is this matrix SPD?',
              difficulty: 'medium',
              prompt: 'For each matrix below: (1) check if it is symmetric, (2) compute eigenvalues, (3) determine if it is SPD/PSD/indefinite, (4) try Cholesky — it should succeed for SPD only.',
              code: `import numpy as np

M1 = np.array([[2., 1.], [1., 3.]])           # candidate 1
M2 = np.array([[1., 2.], [2., 1.]])           # candidate 2
M3 = np.array([[4., 2.], [2., 1.]])           # candidate 3

for i, M in enumerate([M1, M2, M3], 1):
    sym = np.allclose(M, M.T)
    eigs = np.linalg.eigvalsh(M) if sym else np.linalg.eigvals(M).real
    print(f"M{i}: symmetric={sym}, eigenvalues={eigs.round(4)}")
    # Try Cholesky
    # np.linalg.cholesky(M) raises LinAlgError if not SPD
`,
              hint: 'np.linalg.eigvalsh(M) for symmetric matrices. Use try/except around np.linalg.cholesky(M) to catch LinAlgError for non-SPD matrices.',
            },
          ]
        }
      },
    ],
  },

  rigor: {
    prose: [
      '**The Spectral Theorem proof sketch.** For real symmetric $A$: by the fundamental theorem of algebra, $\\det(A - \\lambda I) = 0$ has a complex root $\\lambda_0$. One shows (using $\\bar{\\mathbf{v}}^\\top A \\mathbf{v}$ is real and equals $\\bar{\\mathbf{v}}^\\top A \\mathbf{v} = \\overline{\\bar{\\mathbf{v}}^\\top A \\mathbf{v}}$) that $\\lambda_0$ must be real. Then by induction on the orthogonal complement of each eigenvector, one constructs the full orthogonal diagonalization.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Gram Matrix',
        body: 'Given any matrix $B \\in \\mathbb{R}^{m \\times n}$, the **Gram matrix** $A = B^\\top B$ is always symmetric positive semidefinite. It is positive definite iff $B$ has full column rank. This construction appears everywhere: in least squares ($A^\\top A$), in kernel methods (machine learning), and in the SVD ($A^\\top A$ and $AA^\\top$).',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'la2-007-ex1',
      title: 'Checking SPD via Sylvester\'s Criterion',
      problem: 'Determine whether $A = \\begin{bmatrix}4&2\\\\2&1\\end{bmatrix}$ is positive definite, positive semidefinite, or indefinite.',
      steps: [
        {
          expression: 'A = A^\\top \\;?\\quad \\begin{bmatrix}4&2\\\\2&1\\end{bmatrix} = \\begin{bmatrix}4&2\\\\2&1\\end{bmatrix} \\;\\checkmark',
          annotation: 'First check: is the matrix symmetric? Symmetry is required before asking about definiteness.',
          strategyTitle: 'Step 1: Verify symmetry',
        },
        {
          expression: 'M_1 = [4] \\Rightarrow \\det(M_1) = 4 > 0',
          annotation: 'Sylvester\'s criterion: check leading principal minors. The 1×1 minor is just the top-left entry.',
          strategyTitle: 'Step 2: First leading principal minor',
        },
        {
          expression: 'M_2 = \\begin{bmatrix}4&2\\\\2&1\\end{bmatrix} \\Rightarrow \\det(M_2) = 4 \\cdot 1 - 2 \\cdot 2 = 4 - 4 = 0',
          annotation: 'The 2×2 leading minor has determinant zero. Sylvester\'s criterion requires all leading minors to be strictly positive for SPD.',
          strategyTitle: 'Step 3: Second leading principal minor',
        },
        {
          expression: '\\lambda_1 + \\lambda_2 = \\text{tr}(A) = 5, \\quad \\lambda_1 \\lambda_2 = \\det(A) = 0 \\Rightarrow \\lambda_1 = 5,\\; \\lambda_2 = 0',
          annotation: 'Confirm via eigenvalues: one eigenvalue is zero (not positive), so $A$ is not SPD.',
          strategyTitle: 'Step 4: Find eigenvalues to confirm',
        },
        {
          expression: '\\mathbf{x} = \\begin{bmatrix}1\\\\-2\\end{bmatrix}: \\quad \\mathbf{x}^\\top A \\mathbf{x} = \\begin{bmatrix}1&-2\\end{bmatrix}\\begin{bmatrix}4&2\\\\2&1\\end{bmatrix}\\begin{bmatrix}1\\\\-2\\end{bmatrix} = \\begin{bmatrix}0&0\\end{bmatrix}\\begin{bmatrix}1\\\\-2\\end{bmatrix} = 0',
          annotation: 'There exists a nonzero vector giving $\\mathbf{x}^\\top A\\mathbf{x} = 0$. Since all outputs are ≥ 0 (not negative), this is PSD.',
          strategyTitle: 'Step 5: Conclusion — PSD not SPD',
          hints: ['The vector $[1, -2]^\\top$ is the eigenvector for $\\lambda = 0$.  Any scalar multiple also gives zero.'],
        },
      ],
    },
    {
      id: 'la2-007-ex2',
      title: 'Verifying an Orthogonal Matrix',
      problem: 'Show that $Q = \\frac{1}{\\sqrt{2}}\\begin{bmatrix}1&-1\\\\1&1\\end{bmatrix}$ is orthogonal, find its inverse, and state what geometric transformation it represents.',
      steps: [
        {
          expression: 'Q^\\top Q = \\frac{1}{2}\\begin{bmatrix}1&1\\\\-1&1\\end{bmatrix}\\begin{bmatrix}1&-1\\\\1&1\\end{bmatrix} = \\frac{1}{2}\\begin{bmatrix}1+1 & -1+1 \\\\ -1+1 & 1+1\\end{bmatrix}',
          annotation: 'Compute $Q^\\top Q$ by multiplying. Each row of $Q^\\top$ is a column of $Q$.',
          strategyTitle: 'Step 1: Check $Q^\\top Q$',
        },
        {
          expression: '= \\frac{1}{2}\\begin{bmatrix}2&0\\\\0&2\\end{bmatrix} = \\begin{bmatrix}1&0\\\\0&1\\end{bmatrix} = I \\;\\checkmark',
          annotation: '$Q^\\top Q = I$ confirms $Q$ is orthogonal. The columns are orthonormal.',
          strategyTitle: 'Step 2: Confirm orthogonality',
        },
        {
          expression: 'Q^{-1} = Q^\\top = \\frac{1}{\\sqrt{2}}\\begin{bmatrix}1&1\\\\-1&1\\end{bmatrix}',
          annotation: 'For orthogonal matrices, the inverse is free: just transpose. No row reduction needed.',
          strategyTitle: 'Step 3: Inverse = Transpose',
        },
        {
          expression: '\\det(Q) = \\frac{1}{2}(1 \\cdot 1 - (-1) \\cdot 1) = \\frac{1}{2}(2) = 1',
          annotation: '$\\det = +1$ means this is a pure rotation, not a reflection.',
          strategyTitle: 'Step 4: Identify the geometric transformation',
          hints: ['This is rotation by 45°. Verify: $\\cos(45°) = \\sin(45°) = 1/\\sqrt{2}$, matching the standard rotation matrix $\\begin{bmatrix}\\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta\\end{bmatrix}$.'],
        },
      ],
    },
    {
      id: 'la2-007-ex3',
      title: 'Constructing a Guaranteed SPD Matrix from Data',
      problem: 'You have a data matrix $B = \\begin{bmatrix}1&0\\\\2&1\\\\0&3\\end{bmatrix}$. Construct a symmetric positive definite matrix from $B$, perform Cholesky factorization, and use it to solve $A\\mathbf{x} = \\mathbf{b}$ for $\\mathbf{b} = \\begin{bmatrix}5\\\\11\\end{bmatrix}$.',
      steps: [
        {
          expression: 'A = B^\\top B = \\begin{bmatrix}1&2&0\\\\0&1&3\\end{bmatrix}\\begin{bmatrix}1&0\\\\2&1\\\\0&3\\end{bmatrix} = \\begin{bmatrix}5&2\\\\2&10\\end{bmatrix}',
          annotation: 'Any Gram matrix $B^\\top B$ is symmetric PSD. It is SPD when $B$ has full column rank (here rank 2 ✓).',
          strategyTitle: 'Step 1: Form the Gram matrix $A = B^\\top B$',
        },
        {
          expression: 'l_{11} = \\sqrt{a_{11}} = \\sqrt{5}, \\quad l_{21} = \\frac{a_{21}}{l_{11}} = \\frac{2}{\\sqrt{5}}',
          annotation: 'Cholesky builds $L$ column by column. First column: square root of diagonal, then divide off-diagonals.',
          strategyTitle: 'Step 2: Cholesky — first column of $L$',
        },
        {
          expression: 'l_{22} = \\sqrt{a_{22} - l_{21}^2} = \\sqrt{10 - \\frac{4}{5}} = \\sqrt{\\frac{46}{5}} \\approx 3.033',
          annotation: 'Each diagonal entry uses the "remaining" variance after subtracting what prior columns explain.',
          strategyTitle: 'Step 3: Cholesky — second diagonal entry',
        },
        {
          expression: 'L = \\begin{bmatrix}\\sqrt{5}&0\\\\2/\\sqrt{5}&\\sqrt{46/5}\\end{bmatrix} \\approx \\begin{bmatrix}2.236&0\\\\0.894&3.033\\end{bmatrix}',
          annotation: 'Cholesky factor $L$ is lower triangular. Check: $L L^\\top = A$.',
          strategyTitle: 'Step 4: Assemble $L$',
        },
        {
          expression: '\\text{Solve } L\\mathbf{y} = \\mathbf{b}: \\quad y_1 = \\frac{5}{\\sqrt{5}} = \\sqrt{5}, \\quad y_2 = \\frac{11 - \\frac{2}{\\sqrt{5}}\\sqrt{5}}{\\sqrt{46/5}} = \\frac{9}{\\sqrt{46/5}}',
          annotation: 'Forward substitution on $L\\mathbf{y} = \\mathbf{b}$. Then back-substitute on $L^\\top\\mathbf{x} = \\mathbf{y}$.',
          strategyTitle: 'Step 5: Forward then back substitution',
          hints: ['Final answer: $\\mathbf{x} \\approx [0.652, 0.978]^\\top$. Verify: $A\\mathbf{x} = [5(0.652)+2(0.978),\\; 2(0.652)+10(0.978)] \\approx [5, 11]$ ✓'],
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'la2-007-ch1',
      title: 'Prove Q^T Q = I iff columns are orthonormal',
      difficulty: 'medium',
      challengeType: 'prove',
      problem: 'Show that the $ij$-th entry of $Q^\\top Q$ is $\\mathbf{q}_i \\cdot \\mathbf{q}_j$ (the dot product of columns $i$ and $j$). Conclude that $Q^\\top Q = I$ if and only if the columns of $Q$ are orthonormal.',
      hint: 'Write $Q = [\\mathbf{q}_1 | \\cdots | \\mathbf{q}_n]$. Then $(Q^\\top Q)_{ij} = (i\\text{-th row of }Q^\\top) \\cdot (j\\text{-th column of }Q)$.',
      walkthrough: [
        '**Express $Q$ column-by-column:** Write $Q = [\\mathbf{q}_1 \\mid \\mathbf{q}_2 \\mid \\cdots \\mid \\mathbf{q}_n]$ where each $\\mathbf{q}_i \\in \\mathbb{R}^n$.',
        '**The $i$-th row of $Q^\\top$ is $\\mathbf{q}_i^\\top$:** By definition of transpose, row $i$ of $Q^\\top$ equals column $i$ of $Q$, transposed.',
        '**The $(i,j)$ entry of $Q^\\top Q$:** $(Q^\\top Q)_{ij} = (\\text{row } i \\text{ of } Q^\\top) \\cdot (\\text{col } j \\text{ of } Q) = \\mathbf{q}_i^\\top \\mathbf{q}_j = \\mathbf{q}_i \\cdot \\mathbf{q}_j$.',
        '**Forward direction:** If columns are orthonormal, $\\mathbf{q}_i \\cdot \\mathbf{q}_j = \\delta_{ij}$ (1 if $i=j$, 0 otherwise). So every entry of $Q^\\top Q$ is $\\delta_{ij}$, which is exactly $I$.',
        '**Reverse direction:** If $Q^\\top Q = I$, then $(Q^\\top Q)_{ij} = \\delta_{ij}$. By the formula above, $\\mathbf{q}_i \\cdot \\mathbf{q}_j = \\delta_{ij}$ for all $i, j$. This is precisely the definition of orthonormality.',
      ],
    },
    {
      id: 'la2-007-ch2',
      title: 'Show every covariance matrix is PSD',
      difficulty: 'hard',
      challengeType: 'prove',
      problem: 'Let $X \\in \\mathbb{R}^{n \\times p}$ be a data matrix (rows = observations, columns = features). Define $\\Sigma = \\frac{1}{n} X^\\top X$. Prove that $\\Sigma$ is symmetric positive semidefinite.',
      hint: 'Show $\\mathbf{v}^\\top \\Sigma \\mathbf{v} = \\frac{1}{n} \\|X\\mathbf{v}\\|^2 \\geq 0$.',
      walkthrough: [
        '**Symmetry:** $\\Sigma^\\top = (\\frac{1}{n} X^\\top X)^\\top = \\frac{1}{n} X^\\top (X^\\top)^\\top = \\frac{1}{n} X^\\top X = \\Sigma$. So $\\Sigma$ is symmetric.',
        '**Set up the quadratic form:** Take any $\\mathbf{v} \\in \\mathbb{R}^p$. Compute $\\mathbf{v}^\\top \\Sigma \\mathbf{v} = \\mathbf{v}^\\top \\frac{1}{n} X^\\top X \\mathbf{v} = \\frac{1}{n} \\mathbf{v}^\\top X^\\top X \\mathbf{v}$.',
        '**Regroup:** $\\frac{1}{n} \\mathbf{v}^\\top X^\\top X \\mathbf{v} = \\frac{1}{n} (X\\mathbf{v})^\\top (X\\mathbf{v}) = \\frac{1}{n} \\|X\\mathbf{v}\\|^2$.',
        '**Conclude PSD:** Since $\\|X\\mathbf{v}\\|^2 \\geq 0$ for any real vector (norms are non-negative), we have $\\mathbf{v}^\\top \\Sigma \\mathbf{v} \\geq 0$ for all $\\mathbf{v}$. By definition, $\\Sigma$ is PSD.',
        '**When is it SPD?** $\\mathbf{v}^\\top \\Sigma \\mathbf{v} = 0 \\iff X\\mathbf{v} = \\mathbf{0}$. If $X$ has full column rank (no multicollinear features), the only solution is $\\mathbf{v} = \\mathbf{0}$, so $\\Sigma$ is SPD.',
      ],
    },
  ],

  semantics: {
    core: ['symmetric', 'orthogonal', 'positive-definite', 'transpose', 'spectral-theorem-preview'],
  },
  spiral: {
    recoveryPoints: ['la2-001-matrices-as-transformations'],
    futureLinks: ['la4-001-orthogonal-projections', 'la4-003-least-squares', 'la4-006-spectral-theorem'],
  },
  mentalModel: [
    'Symmetric = mutual relationship = real eigenvalues = orthogonal eigenvectors.',
    'Orthogonal = rigid motion (rotation/reflection) = perfect condition number = inverse is free.',
    'Positive definite = bowl shape = all positive eigenvalues = Cholesky exists.',
    'Every Gram matrix B^T B is PSD; SPD when B has full column rank.',
    'Structure tells you the algorithm: symmetric→eigh, orthogonal→transpose for inverse, SPD→Cholesky.',
  ],
  checkpoints: [
    { id: 'cp-la2-007-1', question: 'What does $A^\\top A = I$ tell you about a matrix $A$?', answer: 'It is orthogonal: its columns are orthonormal, its inverse is $A^\\top$, and it preserves lengths and angles.' },
    { id: 'cp-la2-007-2', question: 'You have a symmetric matrix with all positive eigenvalues. What factorization should you use to solve $A\\mathbf{x} = \\mathbf{b}$ efficiently?', answer: 'Cholesky factorization $A = LL^\\top$ — it is twice as fast as LU and exploits the symmetry and positive definiteness.' },
  ],
  assessment: { questions: [] },
  quiz: [
    {
      id: 'la2-007-q1',
      question: 'If Q is a 3×3 orthogonal matrix, what is Q⁻¹?',
      options: ['Q itself', 'Q^T (the transpose)', '-Q', 'The cofactor matrix divided by det(Q)'],
      answer: 1,
      explanation: 'For orthogonal matrices, Q^T Q = I, so Q^{-1} = Q^T. This makes the inverse trivially cheap to compute.',
    },
    {
      id: 'la2-007-q2',
      question: 'A symmetric positive definite matrix has eigenvalues 5, 3, 1. What is det(A)?',
      options: ['9', '15', '8', '1'],
      answer: 1,
      explanation: 'det(A) = product of eigenvalues = 5 × 3 × 1 = 15.',
    },
    {
      id: 'la2-007-q3',
      question: 'Which of these matrices is NOT symmetric?',
      options: [
        '[[3, 1], [1, 5]]',
        '[[2, 0], [0, 7]]',
        '[[1, 3], [2, 1]]',
        '[[4, -2], [-2, 4]]',
      ],
      answer: 2,
      explanation: 'A symmetric matrix requires a_{ij} = a_{ji}. The third option has a_{12} = 3 but a_{21} = 2, so it is not symmetric.',
    },
    {
      id: 'la2-007-q4',
      question: 'Why is Cholesky factorization preferred over LU for symmetric positive definite matrices?',
      options: [
        'Cholesky is more general — it works on any matrix',
        'Cholesky exploits symmetry to require roughly half the operations of LU',
        'Cholesky avoids pivoting, which LU always requires',
        'Cholesky produces an orthogonal factor, which LU does not',
      ],
      answer: 1,
      explanation: 'Cholesky computes A = L L^T using about n^3/6 operations vs n^3/3 for LU — roughly twice as fast. It only applies to SPD matrices, but that is the common case in applications.',
    },
    {
      id: 'la2-007-q5',
      question: 'The condition number of an orthogonal matrix Q is:',
      options: ['0', '1', 'det(Q)', 'Depends on the specific Q'],
      answer: 1,
      explanation: 'Every orthogonal matrix has condition number exactly 1 — the best possible value. This is because Q preserves all vector lengths, so its largest and smallest singular values are both 1.',
    },
    {
      id: 'la2-007-q6',
      question: 'You form A = B^T B where B is 50×3 with full column rank. Which statement about A is TRUE?',
      options: [
        'A is 50×50 and symmetric',
        'A is 3×3, symmetric, and positive definite',
        'A is 3×3, symmetric, and positive semidefinite (but not necessarily definite)',
        'A is 50×3 and lower triangular',
      ],
      answer: 1,
      explanation: 'B^T B has shape (3×50)(50×3) = 3×3 and is always PSD. Since B has full column rank (rank 3), B^T B is SPD (positive definite, not just semidefinite). Full column rank means no nonzero vector maps to zero.',
    },
    {
      id: 'la2-007-q7',
      question: 'A matrix A is symmetric with eigenvalues −1, 3, 5. What is its classification?',
      options: [
        'Positive definite',
        'Positive semidefinite',
        'Indefinite',
        'Negative definite',
      ],
      answer: 2,
      explanation: 'The matrix has at least one positive (3, 5) and one negative (−1) eigenvalue. This means x^T A x can be positive or negative depending on x — the matrix is indefinite.',
    },
  ],
};
