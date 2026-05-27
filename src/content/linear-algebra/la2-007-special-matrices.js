export default {
  id: 'la2-007',
  slug: 'special-matrices',
  chapter: 'la2',
  order: 7,
  title: 'Special Matrices: Symmetric, Orthogonal, and Positive Definite',
  subtitle: 'The structured matrices that dominate applications â€” and why their structure guarantees beautiful properties.',
  tags: ['symmetric matrix', 'orthogonal matrix', 'positive definite', 'transpose', 'diagonal', 'triangular', 'identity'],
  aliases: 'symmetric orthogonal positive definite transpose diagonal triangular Hermitian unitary SPD special structured matrices',
  timeToComplete: 30,
  coreConcept: 'Most matrices appearing in science and engineering have special structure â€” symmetric, orthogonal, or positive definite. Each type carries guaranteed properties (real eigenvalues, invertibility, bowl-shaped quadratic forms) that enable faster and more stable algorithms than general Gaussian elimination.',
  prerequisites: ['la2-006'],
  nextLesson: 'cramers-rule',

  hook: {
    question: "Why do physics simulations, Google's PageRank, and machine learning all use symmetric matrices? Is it just coincidence?",
    realWorldContext: "Real-world problems almost always produce matrices with special structure. The stiffness matrix in structural engineering is symmetric (and positive definite). The rotation matrix in robotics is orthogonal. The covariance matrix in statistics is symmetric positive definite. Each type of structure is not an accident â€” it reflects a physical or mathematical property of the underlying problem. Exploiting this structure gives faster algorithms (Cholesky instead of LU), guaranteed numerical behavior (eigenvalues are real), and simpler theoretical analysis.",
    previewVisualizationId: 'LALesson04_Matrices',
  },

  intuition: {
    prose: [
      'Matrix $A = \\begin{bmatrix}1&2\\\\2&5\\end{bmatrix}$: note $a_{12} = a_{21} = 2$ â€” it equals its own transpose, so it is **symmetric**. Its eigenvalues are real: $(3 \\pm \\sqrt{5})/2 \\approx 0.38$ and $2.62$ â€” both positive, so it is also **positive definite**. Compare $Q = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$: $Q^\\top Q = \\begin{bmatrix}1&0\\\\0&1\\end{bmatrix} = I$ â€” it is **orthogonal** (rotation 90Â°). Structure is not just notation: symmetric â†’ real eigenvalues â†’ special algorithms. Orthogonal â†’ inverse = transpose â†’ near-zero round-off error. The structures in this lesson unlock specific, faster algorithms.',
      '**Symmetric matrices ($A = A^\\top$):** A matrix is symmetric if it equals its own transpose. Geometrically, this means the entry $a_{ij}$ (row $i$, column $j$) always equals $a_{ji}$. These matrices arise whenever a relationship is mutual: if node $i$ connects to node $j$ with weight $w$, then $j$ connects to $i$ with the same weight. The **spectral theorem** guarantees symmetric matrices have real eigenvalues and orthogonal eigenvectors.',
      '**Orthogonal matrices ($A^{-1} = A^\\top$):** An orthogonal matrix has columns that are orthonormal â€” pairwise perpendicular unit vectors. The key property is $A^\\top A = I$, which means the inverse equals the transpose. Multiplying by $A$ is a **rigid motion** (rotation or reflection) â€” it preserves lengths and angles. Rotation matrices, reflection matrices, and the $Q$ in QR decomposition are all orthogonal.',
      '**Positive definite matrices:** A symmetric matrix $A$ is **positive definite** (SPD) if $\\mathbf{x}^\\top A \\mathbf{x} > 0$ for all nonzero $\\mathbf{x}$. This means the associated quadratic form $f(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x}$ is like a bowl â€” it has a single minimum at the origin. SPD matrices have all positive eigenvalues, admit a Cholesky factorization $A = LL^\\top$, and are what optimization algorithms (gradient descent, conjugate gradient) require to guarantee convergence.',
      '**Diagonal matrices** are the simplest: operations reduce to scalar operations on each diagonal entry. **Triangular matrices** (upper and lower) make linear systems trivially solvable by substitution. These are not just special cases â€” they are the targets of most matrix factorization algorithms (LU produces triangular matrices, Schur decomposition produces triangular, eigendecomposition of symmetric matrices produces diagonal).',
      '**Predict before reading on.** Matrix $B = \\begin{bmatrix}4&1\\\\1&2\\end{bmatrix}$. Is $B$ symmetric? Is $B$ positive definite? (Compute $\\det(B) = 8-1 = 7 > 0$ and check the top-left entry $4 > 0$.) Write your answer before checking with the Sylvester criterion callout.',
      '**Where this is heading.** Special structure is not a curiosity â€” it is the key that unlocks the rest of the course. The spectral theorem (Chapter 4) applies exclusively to symmetric matrices. Positive definiteness is the condition that makes Cholesky decomposition (Chapter 7) and conjugate gradient (Chapter 9) work. The QR decomposition (Chapter 7) produces orthogonal matrices by design. Every time you see "assume $A$ is symmetric" in a theorem, you are seeing the authors exploit the guaranteed real eigenvalues and orthogonal eigenvectors that make the proof possible.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 7 of 12 â€” Matrices & Transformations',
        body: '**Previous:** LU Decomposition â€” Gaussian elimination as a factorization $A = LU$.\n**This lesson:** Special matrix types â€” symmetric, orthogonal, positive definite, diagonal, triangular â€” and why each type unlocks faster algorithms.\n**Next:** Cramer\'s Rule â€” using determinants to solve small systems explicitly.',
      },
      {
        type: 'insight',
        title: 'The Matrix Zoo â€” Quick Reference',
        body: '| Type | Condition | Key Property |\n|---|---|---|\n| Symmetric | $A = A^\\top$ | Real eigenvalues, orthogonal eigenvectors |\n| Orthogonal | $A^\\top A = I$ | Preserves lengths and angles |\n| Pos. Definite | $\\mathbf{x}^\\top A\\mathbf{x} > 0$ | All $\\lambda_i > 0$, Cholesky exists |\n| Diagonal | $a_{ij} = 0$ for $i \\neq j$ | Trivial eigenvalues/inverses |\n| Triangular | Zeros above/below diagonal | Solvable by substitution |\n| Idempotent | $A^2 = A$ | Projection matrices |',
      },
      {
        type: 'insight',
        title: 'When to Use Which Matrix Type â€” Decision Guide',
        body: '**Given a matrix $A$, ask these questions in order:**\n\n1. Is $A = A^\\top$? â†’ **Symmetric.** Use `eigh()` not `eig()` (faster, guaranteed real eigenvalues).\n2. Does $A^\\top A = I$? â†’ **Orthogonal.** Inverse is free: $A^{-1} = A^\\top$. Condition number = 1.\n3. Symmetric AND all eigenvalues positive? â†’ **SPD.** Use Cholesky ($A = LL^\\top$) â€” twice as fast as LU, stable.\n4. Symmetric AND all eigenvalues â‰¥ 0? â†’ **PSD.** Arises from covariance matrices; Cholesky may fail near zero eigenvalues.\n5. Zeros above diagonal? â†’ **Lower triangular.** Solve by forward substitution in $O(n^2)$.\n6. Zeros below diagonal? â†’ **Upper triangular.** Solve by back substitution in $O(n^2)$.\n\n**Rule of thumb:** Structure â†’ algorithm. Never use general LU on a symmetric matrix; never invert an orthogonal matrix.',
      },
      {
        type: 'insight',
        title: 'Why Orthogonal Matrices Are Numerically Perfect',
        body: 'The condition number of an orthogonal matrix is always exactly 1 â€” the best possible. This means solving $Qx = b$ (i.e., $x = Q^\\top b$) introduces zero amplification of errors. Algorithms like Gram-Schmidt and QR decomposition intentionally produce orthogonal matrices to keep computations stable.',
      },
      {
        type: 'warning',
        title: '"Orthogonal" is Overloaded',
        body: 'An **orthogonal matrix** is a square matrix with orthonormal columns ($Q^\\top Q = I$). Two **vectors** are orthogonal if their dot product is 0. These are different uses of the same word. To add confusion: a non-square matrix $Q$ with $Q^\\top Q = I$ is called **unitary** (in the complex case) or just described as "having orthonormal columns" â€” it is NOT called an orthogonal matrix unless it is square.',
      },
    ],
    visualizations: [
      {
        id: 'LALesson04_Matrices',
        title: 'Special Matrices as Transformations',
        mathBridge: 'Adjust the matrix entries to explore how structure constrains transformations. An orthogonal matrix (Qáµ€Q=I) rotates or reflects the unit square without changing its area. A symmetric positive definite matrix stretches but never flips. A singular (zero-determinant) matrix flattens space irreversibly. Observe how each structural condition restricts which transformations are possible.',
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
det(Q)      % must be Â±1`,
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
        title: 'Code: Special Matrices â€” Verification and Cholesky',
        mathBridge: 'np.linalg.eigh(A) computes eigenvalues of symmetric matrices efficiently. np.linalg.cholesky(A) factors SPD matrices into A = L @ L.T. np.linalg.cond(Q) should equal 1.0 for orthogonal matrices.',
        caption: 'Verify structural properties and exploit them for efficient computation.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Symmetric matrix â€” verify real eigenvalues and orthogonal eigenvectors',
              prose: [
                'For real symmetric matrices, NumPy\'s `np.linalg.eigh()` is faster and more accurate than `np.linalg.eig()` because it exploits the symmetry.',
                'The eigenvectors form an orthonormal set â€” their matrix Q satisfies Q.T @ Q = I.',
              ],
              code: `import numpy as np

A = np.array([[4., 2., 1.],
              [2., 3., 1.],
              [1., 1., 5.]])

# eigh is specialized for symmetric matrices (faster, more accurate)
eigenvalues, Q = np.linalg.eigh(A)

print("Eigenvalues (all real):", eigenvalues.round(6))
print("All positive?", np.all(eigenvalues > 0), "â†’ SPD!")
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
              cellTitle: 'Orthogonal matrix â€” condition number = 1, inverse = transpose',
              prose: [
                'A 3D rotation matrix is orthogonal. Verify Q^T @ Q = I, det = 1, and condition number = 1.',
                'Condition number = 1 means the transformation introduces zero amplification of errors â€” numerically ideal.',
              ],
              code: `import numpy as np

# Rotation by 45Â° around z-axis
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
              cellTitle: 'Cholesky decomposition â€” A = L @ L.T for SPD',
              prose: [
                'For symmetric positive definite matrices, Cholesky factorization A = L @ L.T is twice as fast as LU decomposition.',
                'It only works when A is truly SPD â€” the algorithm will throw a LinAlgError if A is not positive definite.',
              ],
              code: `import numpy as np

# SPD matrix (Gram matrix = B^T @ B)
B = np.array([[1., 2.], [3., 4.], [5., 0.]])
A = B.T @ B   # always SPD when B has full column rank

print("A = B^T @ B:")
print(A)
print(f"Eigenvalues: {np.linalg.eigh(A)[0].round(4)}  (all positive âœ“)")
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
              prompt: 'For each matrix below: (1) check if it is symmetric, (2) compute eigenvalues, (3) determine if it is SPD/PSD/indefinite, (4) try Cholesky â€” it should succeed for SPD only.',
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
      '**The Spectral Theorem proof sketch.** For real symmetric $A$: by the fundamental theorem of algebra, $\\det(A - \\lambda I) = 0$ has a complex root $\\lambda_0$. One shows (using $\\bar{\\mathbf{v}}^\\top A \\mathbf{v}$ is real and equals $\\overline{\\bar{\\mathbf{v}}^\\top A \\mathbf{v}}$) that $\\lambda_0$ must be real. Then by induction on the orthogonal complement of each eigenvector, one constructs the full orthogonal diagonalization $A = Q\\Lambda Q^\\top$.',
      '**Cholesky existence theorem.** A real symmetric matrix $A$ has a Cholesky factorization $A = LL^\\top$ with $L$ lower triangular and $L_{ii} > 0$ if and only if $A$ is positive definite. The factorization is unique under the positive-diagonal constraint. Computationally, Cholesky costs $\\approx n^3/6$ flops versus $n^3/3$ for LU â€” exactly twice as fast, exploiting that $A$ is symmetric so only the lower triangle must be stored and processed.',
      '**Idempotent (projection) matrices.** A matrix $P$ satisfying $P^2 = P$ is called idempotent or a projection matrix. Geometrically, applying $P$ twice gives the same result as applying it once â€” the second application does nothing because the output is already in the projected subspace. Orthogonal projections satisfy both $P^2 = P$ and $P^\\top = P$. These appear in the least-squares chapter.',
      '**Positive semidefinite and the rank constraint.** For a Gram matrix $B^\\top B$: rank equals the column rank of $B$. When $B$ has linearly dependent columns, the Gram matrix is singular (PSD but not SPD). This is why multicollinearity in regression (correlated features) makes the normal equations $A^\\top A \\mathbf{x} = A^\\top \\mathbf{b}$ ill-conditioned.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Gram Matrix',
        body: 'Given any matrix $B \\in \\mathbb{R}^{m \\times n}$, the **Gram matrix** $A = B^\\top B$ is always symmetric positive semidefinite. It is positive definite iff $B$ has full column rank. This construction appears everywhere: in least squares ($A^\\top A$), in kernel methods (machine learning), and in the SVD ($A^\\top A$ and $AA^\\top$).',
      },
      {
        type: 'theorem',
        title: 'Spectral Theorem',
        body: 'If $A \\in \\mathbb{R}^{n \\times n}$ is symmetric, then:\n\n1. All eigenvalues of $A$ are real.\n2. Eigenvectors for distinct eigenvalues are orthogonal.\n3. There exists an orthogonal $Q$ and diagonal $\\Lambda$ with $A = Q\\Lambda Q^\\top$.\n\nThe columns of $Q$ are the eigenvectors of $A$; the diagonal of $\\Lambda$ contains the eigenvalues.',
      },
      {
        type: 'insight',
        title: 'Orthogonal Groups and Determinant Sign',
        body: 'The set of all $n \\times n$ orthogonal matrices forms a group under multiplication, denoted $O(n)$. This group has two connected components:\n\n- $SO(n) = \\{Q : \\det(Q) = +1\\}$ â€” the **special orthogonal group**, consisting of proper rotations.\n- Matrices with $\\det(Q) = -1$ are improper rotations (include a reflection).\n\nIn 2D: $SO(2)$ is rotation by angle $\\theta$. $O(2) \\setminus SO(2)$ includes reflections across lines through the origin.',
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
          annotation: 'Sylvester\'s criterion: check leading principal minors. The 1Ã—1 minor is just the top-left entry.',
          strategyTitle: 'Step 2: First leading principal minor',
        },
        {
          expression: 'M_2 = \\begin{bmatrix}4&2\\\\2&1\\end{bmatrix} \\Rightarrow \\det(M_2) = 4 \\cdot 1 - 2 \\cdot 2 = 4 - 4 = 0',
          annotation: 'The 2Ã—2 leading minor has determinant zero. Sylvester\'s criterion requires all leading minors to be strictly positive for SPD.',
          strategyTitle: 'Step 3: Second leading principal minor',
        },
        {
          expression: '\\lambda_1 + \\lambda_2 = \\text{tr}(A) = 5, \\quad \\lambda_1 \\lambda_2 = \\det(A) = 0 \\Rightarrow \\lambda_1 = 5,\\; \\lambda_2 = 0',
          annotation: 'Confirm via eigenvalues: one eigenvalue is zero (not positive), so $A$ is not SPD.',
          strategyTitle: 'Step 4: Find eigenvalues to confirm',
        },
        {
          expression: '\\mathbf{x} = \\begin{bmatrix}1\\\\-2\\end{bmatrix}: \\quad \\mathbf{x}^\\top A \\mathbf{x} = \\begin{bmatrix}1&-2\\end{bmatrix}\\begin{bmatrix}4&2\\\\2&1\\end{bmatrix}\\begin{bmatrix}1\\\\-2\\end{bmatrix} = \\begin{bmatrix}0&0\\end{bmatrix}\\begin{bmatrix}1\\\\-2\\end{bmatrix} = 0',
          annotation: 'There exists a nonzero vector giving $\\mathbf{x}^\\top A\\mathbf{x} = 0$. Since all outputs are â‰¥ 0 (not negative), this is PSD.',
          strategyTitle: 'Step 5: Conclusion â€” PSD not SPD',
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
          hints: ['This is rotation by 45Â°. Verify: $\\cos(45Â°) = \\sin(45Â°) = 1/\\sqrt{2}$, matching the standard rotation matrix $\\begin{bmatrix}\\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta\\end{bmatrix}$.'],
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
          annotation: 'Any Gram matrix $B^\\top B$ is symmetric PSD. It is SPD when $B$ has full column rank (here rank 2 âœ“).',
          strategyTitle: 'Step 1: Form the Gram matrix $A = B^\\top B$',
        },
        {
          expression: 'l_{11} = \\sqrt{a_{11}} = \\sqrt{5}, \\quad l_{21} = \\frac{a_{21}}{l_{11}} = \\frac{2}{\\sqrt{5}}',
          annotation: 'Cholesky builds $L$ column by column. First column: square root of diagonal, then divide off-diagonals.',
          strategyTitle: 'Step 2: Cholesky â€” first column of $L$',
        },
        {
          expression: 'l_{22} = \\sqrt{a_{22} - l_{21}^2} = \\sqrt{10 - \\frac{4}{5}} = \\sqrt{\\frac{46}{5}} \\approx 3.033',
          annotation: 'Each diagonal entry uses the "remaining" variance after subtracting what prior columns explain.',
          strategyTitle: 'Step 3: Cholesky â€” second diagonal entry',
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
          hints: ['Final answer: $\\mathbf{x} \\approx [0.652, 0.978]^\\top$. Verify: $A\\mathbf{x} = [5(0.652)+2(0.978),\\; 2(0.652)+10(0.978)] \\approx [5, 11]$ âœ“'],
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
    {
      id: 'la2-007-ch3',
      title: 'Identify and exploit structure to solve a system efficiently',
      difficulty: 'hard',
      problem: 'You are given $A = \\begin{bmatrix}9&3\\\\3&5\\end{bmatrix}$. (1) Verify $A$ is symmetric. (2) Use Sylvester\'s criterion to determine if $A$ is SPD. (3) Compute the Cholesky factorization $A = LL^\\top$ by hand. (4) Solve $A\\mathbf{x} = \\begin{bmatrix}12\\\\8\\end{bmatrix}$ using forward then back substitution on the Cholesky factors.',
      hint: 'Cholesky for 2Ã—2: $l_{11} = \\sqrt{a_{11}}$, $l_{21} = a_{21}/l_{11}$, $l_{22} = \\sqrt{a_{22} - l_{21}^2}$. Leading minors: $M_1 = 9 > 0$ and $M_2 = 9 \\times 5 - 3 \\times 3 = 45 - 9 = 36 > 0$, so SPD.',
      walkthrough: [
        { expression: 'A = A^\\top \\;\\checkmark \\quad M_1 = 9 > 0, \\; M_2 = 36 > 0 \\implies \\text{SPD}', annotation: 'Symmetry check and Sylvester\'s criterion both pass.' },
        { expression: 'l_{11} = \\sqrt{9} = 3, \\quad l_{21} = 3/3 = 1, \\quad l_{22} = \\sqrt{5 - 1} = 2', annotation: 'Cholesky: compute column by column.' },
        { expression: 'L = \\begin{bmatrix}3&0\\\\1&2\\end{bmatrix}, \\quad LL^\\top = \\begin{bmatrix}3&0\\\\1&2\\end{bmatrix}\\begin{bmatrix}3&1\\\\0&2\\end{bmatrix} = \\begin{bmatrix}9&3\\\\3&5\\end{bmatrix} \\checkmark', annotation: 'Verify $LL^\\top = A$.' },
        { expression: 'L\\mathbf{y} = \\mathbf{b}: \\quad y_1 = 12/3 = 4, \\quad y_2 = (8 - 1 \\cdot 4)/2 = 2', annotation: 'Forward substitution.' },
        { expression: 'L^\\top\\mathbf{x} = \\mathbf{y}: \\quad x_2 = 2/2 = 1, \\quad x_1 = (4 - 1 \\cdot 1)/3 = 1', annotation: 'Back substitution. $\\mathbf{x} = [1, 1]^\\top$. Verify: $A[1,1]^\\top = [9+3, 3+5]^\\top = [12,8]^\\top$ âœ“' },
      ],
      answer: '$L = [[3,0],[1,2]]$; $\\mathbf{x} = [1,1]^\\top$',
    },
  ],

  semantics: {
    core: [
      { symbol: 'A = A^\\top', meaning: 'Symmetric matrix: entry (i,j) equals entry (j,i). Guarantees real eigenvalues and orthogonal eigenvectors (Spectral Theorem).' },
      { symbol: 'Q^\\top Q = I', meaning: 'Orthogonal matrix: columns are orthonormal. Inverse is free: $Q^{-1} = Q^\\top$. Preserves lengths and angles. $\\det(Q) = \\pm 1$.' },
      { symbol: '\\mathbf{x}^\\top A \\mathbf{x} > 0', meaning: 'Positive definite: the quadratic form is bowl-shaped. Equivalent to: all eigenvalues positive, Cholesky factorization exists, all leading principal minors positive.' },
      { symbol: 'A = LL^\\top', meaning: 'Cholesky factorization: exists for all SPD matrices. Costs $n^3/6$ flops â€” twice as fast as LU. Used in structural FEM, Bayesian statistics, and neural network optimizers.' },
    ],
    rulesOfThumb: [
      'Symmetric matrix â†’ use eigh() not eig(); guaranteed real eigenvalues.',
      'Orthogonal matrix â†’ inverse = transpose; condition number = 1.',
      'SPD matrix â†’ use Cholesky instead of LU; twice as fast and stable.',
      'Any B^T B is PSD; SPD when B has full column rank.',
    ],
  },
  spiral: {
    recoveryPoints: [
      { lessonId: 'la2-001', label: 'Matrices as Transformations', note: 'Orthogonal matrices are rigid-motion transformations â€” they rotate or reflect but never scale or skew.' },
      { lessonId: 'la2-006', label: 'LU Decomposition', note: 'Cholesky is LU specialized to symmetric positive definite matrices. It exploits symmetry ($L = U^\\top$) to halve the computation.' },
    ],
    futureLinks: [
      { lessonId: 'la4-001', label: 'Orthogonal Projections', note: 'Projection matrices $P$ are symmetric ($P^\\top = P$) and idempotent ($P^2 = P$). The Spectral Theorem guarantees their eigenvalues are 0 or 1.' },
      { lessonId: 'la4-003', label: 'Least Squares', note: 'The normal equations $A^\\top A \\mathbf{x} = A^\\top \\mathbf{b}$ produce a Gram matrix $A^\\top A$ â€” symmetric and PSD. Solve with Cholesky when it is SPD.' },
    ],
  },
  mentalModel: [
    'Symmetric = mutual relationship = real eigenvalues = orthogonal eigenvectors.',
    'Orthogonal = rigid motion (rotation/reflection) = perfect condition number = inverse is free.',
    'Positive definite = bowl shape = all positive eigenvalues = Cholesky exists.',
    'Every Gram matrix B^T B is PSD; SPD when B has full column rank.',
    'Structure tells you the algorithm: symmetricâ†’eigh, orthogonalâ†’transpose for inverse, SPDâ†’Cholesky.',
  ],
  checkpoints: [
    { id: 'cp-la2-007-1', label: 'Read intuition â€” understand the matrix zoo and when to use each type', type: 'read' },
    { id: 'cp-la2-007-2', label: 'Read math â€” trace the three equivalent definitions of positive definiteness', type: 'read' },
    { id: 'cp-la2-007-3', label: 'Read rigor â€” study the Spectral Theorem and Cholesky existence proofs', type: 'read' },
    { id: 'cp-la2-007-4', label: 'Run OpenMAT cell 1 â€” verify symmetric matrix has real eigenvalues', type: 'lab' },
    { id: 'cp-la2-007-5', label: 'Run OpenMAT cell 2 â€” verify Q^T Q = I and condition number = 1', type: 'lab' },
    { id: 'cp-la2-007-6', label: 'Complete example 1: apply Sylvester criterion to classify a matrix', type: 'example' },
    { id: 'cp-la2-007-7', label: 'Complete example 2: verify an orthogonal matrix and identify its transformation', type: 'example' },
    { id: 'cp-la2-007-8', label: 'Attempt challenge 3: full Cholesky factorization and two-phase solve', type: 'challenge' },
  ],
  assessment: {
    questions: [
      {
        id: 'la2-007-assess-1',
        type: 'choice',
        text: 'A matrix has $Q^\\top Q = I$ and $\\det(Q) = -1$. What kind of transformation does $Q$ represent?',
        options: [
          'A pure rotation â€” det(Q) = +1 for rotations',
          'An improper rotation (includes a reflection) â€” orthogonal with det = âˆ’1',
          'A singular (non-invertible) transformation',
          'A scaling transformation',
        ],
        answer: 'An improper rotation (includes a reflection) â€” orthogonal with det = âˆ’1',
        hint: 'Orthogonal matrices with det = +1 are rotations; those with det = âˆ’1 are improper rotations (rotations combined with a reflection).',
      },
    ],
  },
  quiz: [
    {
      id: 'la2-007-quiz-1',
      type: 'choice',
      text: 'If $Q$ is a 3Ã—3 orthogonal matrix, what is $Q^{-1}$?',
      options: ['$Q$ itself', '$Q^\\top$ (the transpose)', '$-Q$', 'The cofactor matrix divided by $\\det(Q)$'],
      answer: '$Q^\\top$ (the transpose)',
      hints: ['For orthogonal matrices, $Q^\\top Q = I$, so $Q^{-1} = Q^\\top$. This makes the inverse trivially cheap to compute.'],
      reviewSection: 'Math tab â€” Properties of Orthogonal Matrices callout',
    },
    {
      id: 'la2-007-quiz-2',
      type: 'choice',
      text: 'A symmetric positive definite matrix has eigenvalues 5, 3, and 1. What is $\\det(A)$?',
      options: ['9', '15', '8', '1'],
      answer: '15',
      hints: ['For any square matrix, $\\det(A)$ = product of eigenvalues = $5 \\times 3 \\times 1 = 15$.'],
      reviewSection: 'Rigor tab â€” Spectral Theorem',
    },
    {
      id: 'la2-007-quiz-3',
      type: 'choice',
      text: 'Which of these matrices is NOT symmetric?',
      options: [
        '$\\begin{bmatrix}3&1\\\\1&5\\end{bmatrix}$',
        '$\\begin{bmatrix}2&0\\\\0&7\\end{bmatrix}$',
        '$\\begin{bmatrix}1&3\\\\2&1\\end{bmatrix}$',
        '$\\begin{bmatrix}4&-2\\\\-2&4\\end{bmatrix}$',
      ],
      answer: '$\\begin{bmatrix}1&3\\\\2&1\\end{bmatrix}$',
      hints: ['A symmetric matrix requires $a_{ij} = a_{ji}$. The third option has $a_{12} = 3$ but $a_{21} = 2$, so it is not symmetric.'],
      reviewSection: 'Intuition tab â€” Symmetric matrices',
    },
    {
      id: 'la2-007-quiz-4',
      type: 'choice',
      text: 'Why is Cholesky factorization preferred over LU for symmetric positive definite matrices?',
      options: [
        'Cholesky is more general â€” it works on any matrix.',
        'Cholesky exploits symmetry to require roughly half the operations of LU.',
        'Cholesky avoids pivoting, which LU always requires.',
        'Cholesky produces an orthogonal factor, which LU does not.',
      ],
      answer: 'Cholesky exploits symmetry to require roughly half the operations of LU.',
      hints: ['Cholesky computes $A = LL^\\top$ using about $n^3/6$ operations vs $n^3/3$ for LU. It only applies to SPD matrices, but that is the common case in science and engineering applications.'],
      reviewSection: 'Rigor tab â€” Cholesky existence theorem',
    },
    {
      id: 'la2-007-quiz-5',
      type: 'choice',
      text: 'The condition number of an orthogonal matrix $Q$ is:',
      options: ['0', '1', '$\\det(Q)$', 'Depends on the specific $Q$'],
      answer: '1',
      hints: ['Every orthogonal matrix has condition number exactly 1 â€” the best possible value. $Q$ preserves all vector lengths, so its largest and smallest singular values are both 1.'],
      reviewSection: 'Intuition tab â€” Why Orthogonal Matrices Are Numerically Perfect callout',
    },
    {
      id: 'la2-007-quiz-6',
      type: 'choice',
      text: 'You form $A = B^\\top B$ where $B$ is $50 \\times 3$ with full column rank. Which statement about $A$ is TRUE?',
      options: [
        '$A$ is $50 \\times 50$ and symmetric.',
        '$A$ is $3 \\times 3$, symmetric, and positive definite.',
        '$A$ is $3 \\times 3$, symmetric, and positive semidefinite (but not necessarily definite).',
        '$A$ is $50 \\times 3$ and lower triangular.',
      ],
      answer: '$A$ is $3 \\times 3$, symmetric, and positive definite.',
      hints: ['$B^\\top B$ has shape $(3 \\times 50)(50 \\times 3) = 3 \\times 3$ and is always PSD. Since $B$ has full column rank (rank 3), $B^\\top B$ is SPD. Full column rank means no nonzero vector maps to zero.'],
      reviewSection: 'Rigor tab â€” Gram Matrix definition',
    },
    {
      id: 'la2-007-quiz-7',
      type: 'choice',
      text: 'A symmetric matrix $A$ has eigenvalues $-1$, $3$, $5$. What is its classification?',
      options: [
        'Positive definite',
        'Positive semidefinite',
        'Indefinite',
        'Negative definite',
      ],
      answer: 'Indefinite',
      hints: ['At least one positive eigenvalue (3, 5) and one negative ($-1$). This means $\\mathbf{x}^\\top A\\mathbf{x}$ can be positive or negative depending on $\\mathbf{x}$ â€” indefinite.'],
      reviewSection: 'Math tab â€” Positive definite: three equivalent definitions',
    },
    {
      id: 'la2-007-quiz-8',
      type: 'choice',
      text: 'A rotation matrix $R_{45Â°}$ (45Â° CCW) is orthogonal. What is $R_{45Â°}^{-1}$?',
      options: [
        '$R_{45Â°}^\\top = R_{-45Â°}$ â€” the transpose equals the inverse, which is a 45Â° clockwise rotation',
        '$-R_{45Â°}$ â€” negate all entries',
        'There is no inverse since rotations are not invertible',
        '$2R_{45Â°}$ â€” scale to undo the rotation',
      ],
      answer: '$R_{45Â°}^\\top = R_{-45Â°}$ â€” the transpose equals the inverse, which is a 45Â° clockwise rotation',
      hints: ['For orthogonal $Q$: $Q^{-1} = Q^\\top$. For a rotation matrix: $R_\\theta^\\top = R_{-\\theta}$ (rotation in the opposite direction). No costly Gaussian elimination needed â€” just transpose.'],
      reviewSection: 'Intuition tab â€” Orthogonal matrices',
    },
    {
      id: 'la2-007-quiz-9',
      type: 'choice',
      text: 'Matrix $A = \\begin{bmatrix}3&1\\\\1&2\\end{bmatrix}$. Use Sylvester\'s criterion to check positive definiteness.',
      options: [
        'Positive definite: top-left $= 3 > 0$, $\\det(A) = 6-1 = 5 > 0$',
        'Not positive definite: $\\det(A) < 0$',
        'Indefinite: one eigenvalue is negative',
        'Positive semidefinite: $\\det(A) = 0$',
      ],
      answer: 'Positive definite: top-left $= 3 > 0$, $\\det(A) = 6-1 = 5 > 0$',
      hints: ['Sylvester criterion: all leading principal minors positive. Minor 1: $a_{11} = 3 > 0$ âœ“. Minor 2: $\\det(A) = 3(2)-1(1) = 5 > 0$ âœ“. Both positive â†’ $A$ is SPD.'],
      reviewSection: 'Math tab â€” Positive definite: three equivalent definitions',
    },
    {
      id: 'la2-007-quiz-10',
      type: 'choice',
      text: 'A covariance matrix $\\Sigma$ from a dataset of $n$ samples always satisfies which property?',
      options: [
        'Symmetric and positive semidefinite ($\\mathbf{x}^\\top\\Sigma\\mathbf{x} \\geq 0$)',
        'Orthogonal',
        'Symmetric and positive definite (all eigenvalues strictly positive)',
        'Diagonal',
      ],
      answer: 'Symmetric and positive semidefinite ($\\mathbf{x}^\\top\\Sigma\\mathbf{x} \\geq 0$)',
      hints: ['$\\Sigma = \\frac{1}{n}X^\\top X$ for centered data matrix $X$. This is a Gram matrix â€” always PSD. It is strictly PD only if the features are linearly independent (full column rank of $X$). With redundant features, $\\Sigma$ is singular (PSD but not PD).'],
      reviewSection: 'Rigor tab â€” Gram Matrix definition',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'A symmetric matrix is always positive definite.',
      whyStudentsThinkIt: 'Students first encounter SPD matrices (symmetric AND positive definite) together. They merge the properties into one concept.',
      correctionExample: '$A = \\begin{bmatrix}1&0\\\\0&-2\\end{bmatrix}$ is symmetric ($A = A^\\top$) but NOT positive definite ($\\mathbf{x}^\\top A\\mathbf{x} = x_1^2 - 2x_2^2 < 0$ for $x_1=0, x_2=1$). It is **indefinite**.',
      contrastCase: 'PD requires symmetry PLUS all positive eigenvalues (or all positive leading principal minors). Symmetry alone only guarantees real eigenvalues â€” they could be negative or zero.',
    },
    {
      falseBelief: 'The transpose of a matrix is always its inverse.',
      whyStudentsThinkIt: 'Students learn $Q^{-1} = Q^\\top$ for orthogonal matrices and over-generalize.',
      correctionExample: 'For $A = \\begin{bmatrix}2&1\\\\0&3\\end{bmatrix}$: $A^\\top = \\begin{bmatrix}2&0\\\\1&3\\end{bmatrix}$. Compute $AA^\\top = \\begin{bmatrix}5&3\\\\3&9\\end{bmatrix} \\neq I$. The transpose-equals-inverse property is EXCLUSIVE to orthogonal matrices ($Q^\\top Q = I$).',
      contrastCase: 'Test orthogonality with $A^\\top A$: if the result is $I$, then yes, $A^{-1} = A^\\top$. Otherwise, compute the inverse via LU.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A machine learning engineer trains a linear regression model. The normal equations require solving $(X^\\top X)\\mathbf{w} = X^\\top\\mathbf{y}$. She recognizes that $X^\\top X$ has a special structure. What is it and how does it affect the choice of solver?',
      competingTechniques: ['Use general LU decomposition', 'Use Cholesky decomposition (since $X^\\top X$ is SPD when X has full column rank)'],
      whyThisTechniqueWins: '$X^\\top X$ is symmetric positive definite (it is a Gram matrix). Cholesky decomposition uses about half the operations of LU ($n^3/6$ vs $n^3/3$) and is numerically stabler. Never use general LU when the matrix is SPD.',
    },
    {
      situation: 'A simulation uses a $1000 \\times 1000$ rotation matrix $R$ at every time step. The code computes $R^{-1}$ via LU decomposition each time. A colleague says "just use the transpose." Who is right and why?',
      competingTechniques: ['Compute LU and solve for $R^{-1}$ ($O(n^3)$ per step)', 'Transpose $R$ to get $R^{-1}$ ($O(n^2)$ per step)'],
      whyThisTechniqueWins: 'Rotation matrices are orthogonal ($R^\\top R = I$), so $R^{-1} = R^\\top$. Transposing is $O(n^2)$ â€” just rearranging memory. LU inversion is $O(n^3)$. For $n = 1000$ at every time step, this is a $1000\\times$ speedup per inversion.',
    },
  ],

  debugging: [
    {
      commonError: 'Using `numpy.linalg.eig()` on a symmetric matrix instead of `numpy.linalg.eigh()`.',
      symptom: 'Eigenvalues come back with small imaginary parts (e.g., $2.99 + 1e-16j$) due to floating-point errors, or eigenvectors are not exactly orthogonal.',
      whyItHappened: '`eig()` uses a general complex algorithm. For symmetric matrices, `eigh()` uses a specialized real symmetric algorithm (divide-and-conquer) that is faster, more accurate, and guarantees real eigenvalues and orthonormal eigenvectors.',
      repairStrategy: 'Always use `numpy.linalg.eigh(A)` (or MATLAB `eig(A)` â€” it auto-detects symmetric). Check: `np.allclose(eigvecs.T @ eigvecs, np.eye(n))` to verify orthonormality.',
    },
    {
      commonError: 'Attempting Cholesky decomposition on a matrix that is not positive definite.',
      symptom: 'Python throws `numpy.linalg.LinAlgError: Matrix is not positive definite`, or MATLAB returns complex entries in $L$.',
      whyItHappened: 'Cholesky requires ALL eigenvalues to be strictly positive. Near-zero or negative eigenvalues (common in ill-conditioned covariance matrices) cause the algorithm to try to take the square root of a negative number.',
      repairStrategy: 'Check: run `np.linalg.eigvalsh(A)` and verify all eigenvalues are positive. If near-zero eigenvalues appear, add a small regularization: `A_reg = A + 1e-8 * np.eye(n)`. If eigenvalues are significantly negative, the matrix is not SPD and Cholesky cannot be used â€” switch to LU.',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Classify a matrix as symmetric, orthogonal, positive definite, triangular, or diagonal by checking the appropriate criteria, and choose the corresponding optimal algorithm (Cholesky for SPD, transpose for orthogonal, substitution for triangular).',
    explainVerbally: 'Explain why $Q^{-1} = Q^\\top$ for orthogonal matrices, why Cholesky is twice as fast as LU for SPD matrices, and what Sylvester\'s criterion tests.',
    detectIncorrectApplication: 'Identify when a student uses general LU on an SPD matrix (should use Cholesky), or claims a matrix is PD based only on symmetry.',
    transferToUnfamiliar: 'Given a Gram matrix $G = A^\\top A$ from a machine learning pipeline, predict its properties (symmetric, PSD) and recommend the appropriate solver.',
  },
};
