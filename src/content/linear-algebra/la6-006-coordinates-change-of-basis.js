export default {
  id: 'la6-006',
  slug: 'coordinates-change-of-basis',
  chapter: 'la6',
  order: 6,
  title: 'Coordinates and Change of Basis',
  subtitle: 'The same vector has different coordinates in different bases. The change-of-basis matrix translates between them — and the same transformation produces matrix similarity for linear maps.',
  tags: ['coordinates', 'change of basis', 'transition matrix', 'basis transformation', 'similarity', 'diagonalization', 'coordinate vector'],
  aliases: 'coordinates change of basis transition matrix basis transformation similarity diagonalization coordinate vector',

  hook: {
    question: "You have two bases for $\\mathbb{R}^2$: the standard basis and one rotated 45°. The same vector $(1, 0)$ has coordinates $(1, 0)$ in the first basis but different numbers in the second. How do you convert?",
    realWorldContext: "Coordinate changes are everywhere in applied mathematics. In computer graphics, transforming between local and world coordinate frames is a change of basis. In robotics, converting between joint angles and Cartesian coordinates uses Jacobian matrices (which are related to basis changes). In general relativity, the metric tensor describes how coordinate systems relate in curved spacetime. In numerical methods, preconditioning a linear system is a change of basis to make the problem better-conditioned. The change-of-basis matrix is the key tool.",
  },

  intuition: {
    prose: [
      'Take $\\mathbf{v} = (5, 3)$ and two bases for $\\mathbb{R}^2$: standard $\\mathcal{E} = \\{(1,0),(0,1)\\}$ and $\\mathcal{B} = \\{(1,1),(1,-1)\\}$. In $\\mathcal{E}$, the coordinates are just $(5,3)$ — no work needed. In $\\mathcal{B}$, you need $c_1(1,1) + c_2(1,-1) = (5,3)$. That gives $c_1+c_2=5$ and $c_1-c_2=3$, so $c_1=4, c_2=1$. Check: $4(1,1)+1(1,-1)=(5,3)$ âœ“. The **same vector**, two completely different lists of numbers — $(5,3)$ vs $(4,1)$. Coordinates depend on the basis.',
      '**The change-of-basis matrix.** Given two ordered bases $\\mathcal{B}$ and $\\mathcal{B}\'$ for $V$, the **change-of-basis matrix from $\\mathcal{B}$ to $\\mathcal{B}\'$** is the matrix $P_{\\mathcal{B} \\to \\mathcal{B}\'} = [P]$ whose $j$-th column is $[\\mathbf{b}_j]_{\\mathcal{B}\'} =$ coordinates of the old basis vector $\\mathbf{b}_j$ in the new basis $\\mathcal{B}\'$. Then: $[\\mathbf{v}]_{\\mathcal{B}\'} = P_{\\mathcal{B} \\to \\mathcal{B}\'} \\cdot [\\mathbf{v}]_{\\mathcal{B}}$.',
      '**The inverse goes the other way.** If $P$ converts from $\\mathcal{B}$-coordinates to $\\mathcal{B}\'$-coordinates, then $P^{-1}$ converts from $\\mathcal{B}\'$-coordinates back to $\\mathcal{B}$-coordinates. Since $P$ is always invertible (it converts between two bases — its columns are linearly independent), $P^{-1}$ always exists. When converting in $\\mathbb{R}^n$ with the standard basis as one of the bases: if $P = [\\mathbf{b}_1 | \\cdots | \\mathbf{b}_n]$ converts from $\\mathcal{B}$-coordinates to standard coordinates, then $P^{-1}$ converts from standard coordinates to $\\mathcal{B}$-coordinates. Concretely: $[\\mathbf{v}]_{\\mathcal{B}} = P^{-1}\\mathbf{v}$ where $\\mathbf{v}$ is the standard-coordinate vector.',
      '**In $\\mathbb{R}^n$.** When $\\mathcal{C}$ is the standard basis and $\\mathcal{B}$ is a non-standard basis with basis vectors $\\mathbf{b}_1, \\ldots, \\mathbf{b}_n$, the matrix $P = [\\mathbf{b}_1 | \\cdots | \\mathbf{b}_n]$ converts from $\\mathcal{B}$-coordinates to standard coordinates: $\\mathbf{v} = P[\\mathbf{v}]_{\\mathcal{B}}$. To go the other way: $[\\mathbf{v}]_{\\mathcal{B}} = P^{-1}\\mathbf{v}$.',
      '**Effect on matrices.** If $T: V \\to V$ has matrix $A$ in basis $\\mathcal{B}$ and matrix $A\'$ in basis $\\mathcal{B}\'$, then $A\' = P^{-1}AP$ where $P = P_{\\mathcal{B}\' \\to \\mathcal{B}}$ (columns = $\\mathcal{B}\'$ vectors in $\\mathcal{B}$-coordinates). This is the similarity transformation from earlier — now you know where it comes from.',
      '**Diagonalization is change of basis to eigenvectors.** When $A$ is diagonalizable with eigenvector matrix $P$ and diagonal matrix $D$: $D = P^{-1}AP$. This says: in the eigenvector basis, the map $T$ simply scales each coordinate independently by the corresponding eigenvalue — the simplest possible matrix. The eigenvalues $\\lambda_1, \\ldots, \\lambda_n$ do not change when you change basis (they are similarity invariants). Only the matrix entries change. The eigenvector basis is the "optimal" basis for understanding a diagonalizable linear map.',
      '**CNC coordinate frames.** In multi-axis CNC machining, every component of the machine has its own coordinate frame: the machine frame (absolute), the workpiece frame (offset by fixture), the tool frame (tip of cutting tool). Moving between these is a change of basis. The transformation matrices are rigid body motions: rotation $R$ (change of orientation basis) combined with translation $\\mathbf{t}$ (origin shift), represented as $4 \\times 4$ homogeneous matrices $\\begin{bmatrix}R & \\mathbf{t} \\\\ \\mathbf{0} & 1\\end{bmatrix}$. Composing two frame changes multiplies the matrices — the matrix algebra of change of basis, applied to machining geometry.',
      '**Where this is heading.** This completes the chapter on Abstract Vector Spaces. Looking forward, all the key algorithms of linear algebra — eigendecomposition, SVD, QR factorization, LU factorization, Gram-Schmidt — can now be understood as: finding the right basis for the problem, computing in that basis, and converting back. The question "what is the best basis?" drives the entire field of applied linear algebra.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 6 of 6 — Abstract Vector Spaces',
        body: '**Previous:** Isomorphisms — bijective linear maps and the classification of finite-dimensional spaces.\n**This lesson:** Coordinates and Change of Basis — the mechanics of converting vectors and matrices between different bases, and why $P^{-1}AP$ is the right formula.\n**Next:** End of Chapter 6.',
      },
      {
        type: 'insight',
        title: 'Predict Before You Compute',
        body: 'Let $\\mathcal{B} = \\{(2,1),(1,1)\\}$ and $\\mathbf{v} = (3,2)$.\n\nBefore computing: will the $\\mathcal{B}$-coordinates of $\\mathbf{v}$ be integers? Will they be positive? Will either coordinate be zero? Make your guess, then solve $c_1(2,1)+c_2(1,1)=(3,2)$ and see.',
      },
      {
        type: 'insight',
        title: 'Change of Basis Summary',
        body: 'Let $P$ = matrix with columns = new basis vectors (in old coordinates).\n\n**Convert vectors:** $[\\mathbf{v}]_{\\text{new}} = P^{-1} [\\mathbf{v}]_{\\text{old}}$\n\n**Convert matrices:** $[T]_{\\text{new}} = P^{-1} [T]_{\\text{old}} P$\n\n**Compose:** $(P_{B \\to C}) \\cdot (P_{A \\to B}) = P_{A \\to C}$',
      },
      {
        type: 'insight',
        title: 'Why Diagonalization Works',
        body: 'If $A$ is diagonalizable with eigenvector matrix $P$:\n$P^{-1}AP = D$ (diagonal)\n\nThis says: in the eigenvector basis, $A$ just scales each direction independently. Choosing the eigenvector basis is the "ideal" basis change for understanding $A$.',
      },
      {
        type: 'warning',
        title: 'Direction Convention',
        body: 'There are two conventions for change-of-basis matrices. Always track: does column $j$ of $P$ contain the new basis vectors written in old coordinates, or vice versa? And do you multiply vectors by $P$ or $P^{-1}$ to convert them? Be consistent — the formulas work out oppositely depending on the convention.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Change-of-Basis Computations',
        mathBridge: 'Compute change-of-basis matrices and verify coordinate conversions.',
        caption: 'The same vector, two different coordinate systems.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Non-standard basis in R^2',
              prose: ['New basis B = {[1;1]/sqrt(2), [-1;1]/sqrt(2)} (45 degree rotation). Find coordinates of v=[1;0] in B.'],
              code: `% New basis vectors
b1 = [1;  1] / sqrt(2)
b2 = [-1; 1] / sqrt(2)

% P = matrix of new basis vectors
P = [b1, b2]

% v in standard coordinates
v = [1; 0]

% Coordinates of v in basis B
v_B = inv(P) * v
disp('Coordinates of [1;0] in basis B:')
v_B

% Verify: P * v_B should recover v
v_recovered = P * v_B
disp('Recovered vector (should be [1;0]):')
v_recovered
norm(v - v_recovered) < 1e-9
`,
            },
            {
              id: 2,
              cellTitle: 'Matrix in new basis',
              prose: ['Rotation matrix R = [0 -1; 1 0] in standard basis. Represent it in basis B from above.'],
              code: `% Rotation matrix (90 degrees CCW) in standard basis
R = [0 -1; 1 0]

% Basis change matrix from cell 1
b1 = [1; 1] / sqrt(2);
b2 = [-1; 1] / sqrt(2);
P = [b1, b2]

% R in new basis: P^{-1} * R * P
R_new = inv(P) * R * P
disp('R in basis B (should be rotation matrix still, but different entries):')
R_new

% Verify: same eigenvalues
[~, D_std]  = eig(R)
[~, D_new]  = eig(R_new)
disp('Eigenvalues of R in standard basis:')
diag(D_std)
disp('Eigenvalues of R in new basis (same!):')
diag(D_new)
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Derivation.** Let $\\mathcal{B} = (\\mathbf{b}_1, \\ldots, \\mathbf{b}_n)$ and $\\mathcal{B}\' = (\\mathbf{b}\'_1, \\ldots, \\mathbf{b}\'_n)$ be two bases. For any $\\mathbf{v}$: $\\mathbf{v} = \\sum_j c_j \\mathbf{b}_j = \\sum_k d_k \\mathbf{b}\'_k$. To find $d_k$ from $c_j$, write each $\\mathbf{b}_j$ in the $\\mathcal{B}\'$ basis: $\\mathbf{b}_j = \\sum_k p_{kj} \\mathbf{b}\'_k$. Substituting: $\\mathbf{v} = \\sum_j c_j \\sum_k p_{kj} \\mathbf{b}\'_k = \\sum_k (\\sum_j p_{kj} c_j) \\mathbf{b}\'_k$. Therefore $d_k = \\sum_j p_{kj} c_j$, or in matrix form: $[\\mathbf{v}]_{\\mathcal{B}\'} = P [\\mathbf{v}]_{\\mathcal{B}}$.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Invariants Under Similarity',
        body: 'Quantities unchanged under $A \\mapsto P^{-1}AP$:\n• Eigenvalues (and characteristic polynomial)\n• Determinant: $\\det(P^{-1}AP) = \\det(A)$\n• Trace: $\\text{tr}(P^{-1}AP) = \\text{tr}(A)$\n• Rank\n• Minimal polynomial\n• Jordan structure\n\nThese are intrinsic properties of the linear map $T$, independent of basis.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Code: Change of Basis and Similarity',
        mathBridge: 'Compute P^{-1}AP for basis changes, verify similarity invariants, and connect to diagonalization.',
        caption: 'The matrix P with new basis vectors as columns converts coordinates. P^{-1}AP gives the matrix in the new basis.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Change-of-basis matrix — coordinate conversion in R^2',
              prose: 'Given basis $\\mathcal{B} = \\{\\mathbf{b}_1, \\mathbf{b}_2\\}$, build $P = [\\mathbf{b}_1 | \\mathbf{b}_2]$. Then $[\\mathbf{v}]_{\\mathcal{B}} = P^{-1}\\mathbf{v}$ (from standard to $\\mathcal{B}$) and $\\mathbf{v} = P[\\mathbf{v}]_{\\mathcal{B}}$ (from $\\mathcal{B}$ to standard). Verify by round-tripping: convert to $\\mathcal{B}$ and back.',
              code: `import numpy as np

b1 = np.array([1., 1.]) / np.sqrt(2)   # 45° rotation basis
b2 = np.array([-1., 1.]) / np.sqrt(2)

P = np.column_stack([b1, b2])          # change-of-basis matrix
P_inv = np.linalg.inv(P)              # = P.T for orthonormal basis

v = np.array([3., 1.])                 # standard coordinates

# Convert from standard to B-coordinates
v_B = P_inv @ v
print(f"v in standard: {v}")
print(f"v in basis B:  {v_B.round(6)}")

# Convert back
v_recovered = P @ v_B
print(f"Recovered: {v_recovered.round(10)}")
print("Round-trip exact:", np.allclose(v, v_recovered))
print()

# Geometric check: B is rotated 45°, so B-coordinates should be rotated
import numpy as np
angle = np.degrees(np.arctan2(v[1], v[0]))
print(f"Standard angle: {angle:.2f}°")
angle_B = np.degrees(np.arctan2(v_B[1], v_B[0]))
print(f"B-basis angle:  {angle_B:.2f}°  (should be ~{angle - 45:.2f}°)")`,
            },
            {
              id: 2,
              cellTitle: 'P^{-1}AP — matrix in a new basis, similarity invariants',
              prose: 'Changing to a new basis transforms the matrix $A$ to $A\' = P^{-1}AP$ (similar matrices). Similarity invariants — determinant, trace, eigenvalues — are preserved because they describe the map itself, not its coordinate representation.',
              code: `import numpy as np

A = np.array([[2., 1.],
              [1., 3.]])

# New basis: eigenvectors of A
eigenvalues, P = np.linalg.eig(A)
A_new = np.linalg.inv(P) @ A @ P   # = P^{-1}AP

print("A in standard basis:")
print(A.round(6))
print(f"det={np.linalg.det(A):.4f}, tr={np.trace(A):.4f}")
print()
print("A in eigenvector basis (P^{-1}AP):")
print(A_new.round(6))
print(f"det={np.linalg.det(A_new):.4f}, tr={np.trace(A_new):.4f}")
print()
print("Same eigenvalues:", np.allclose(sorted(eigenvalues.real),
                                       sorted(np.diag(A_new).real)))
print("Same det:", np.isclose(np.linalg.det(A), np.linalg.det(A_new)))
print("Same tr:", np.isclose(np.trace(A), np.trace(A_new)))`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Congruence vs similarity.** Under change of orthonormal basis (unitary transformation $U$), the transformation $A \\mapsto U^{-1}AU = U^\\top AU$ is called **orthogonal similarity** (or unitary similarity over $\\mathbb{C}$). Eigenvalues are preserved. For symmetric matrices, the Spectral Theorem says you can always find an orthonormal basis of eigenvectors — achieving real diagonal $D = Q^\\top AQ$. Congruence ($A \\mapsto P^\\top AP$) is different — it classifies quadratic forms and is relevant for Sylvester\'s law of inertia.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Connections to Prior Lessons',
        body: 'Change of basis $\\Rightarrow$ unifies:\n• Diagonalization: $P^{-1}AP = D$ (eigenvector basis)\n• Spectral Theorem: $Q^\\top A Q = \\Lambda$ (orthonormal eigenbasis)\n• Jordan Normal Form: $P^{-1}AP = J$ (generalized eigenvector basis)\n• QR decomposition: basis orthogonalization\n• Coordinate geometry: conics, quadric surfaces\nAll are instances of choosing a "better" basis to simplify a matrix.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la6-006-1',
      title: 'Find coordinates in a non-standard basis',
      problem: 'Let $\\mathcal{B} = \\{(1,1), (1,-1)\\}$ be a basis for $\\mathbb{R}^2$. Find $[\\mathbf{v}]_{\\mathcal{B}}$ for $\\mathbf{v} = (3, 1)$.',
      steps: [
        {
          expression: 'P = \\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix}',
          annotation: 'The change-of-basis matrix has the new basis vectors as columns. $P$ converts $\\mathcal{B}$-coordinates to standard coordinates: $\\mathbf{v} = P[\\mathbf{v}]_{\\mathcal{B}}$.',
          strategyTitle: 'Form $P$: columns are new basis vectors',
        },
        {
          expression: 'P^{-1} = \\frac{1}{\\det(P)}\\begin{bmatrix}-1&-1\\\\-1&1\\end{bmatrix} = \\frac{1}{-2}\\begin{bmatrix}-1&-1\\\\-1&1\\end{bmatrix} = \\begin{bmatrix}1/2&1/2\\\\1/2&-1/2\\end{bmatrix}',
          annotation: '$\\det(P) = -1-1 = -2$. For $2\\times 2$: swap diagonal, negate off-diagonal, divide by determinant.',
          strategyTitle: 'Compute $P^{-1}$',
        },
        {
          expression: '[\\mathbf{v}]_{\\mathcal{B}} = P^{-1}\\mathbf{v} = \\begin{bmatrix}1/2&1/2\\\\1/2&-1/2\\end{bmatrix}\\begin{bmatrix}3\\\\1\\end{bmatrix} = \\begin{bmatrix}2\\\\1\\end{bmatrix}',
          annotation: 'The $\\mathcal{B}$-coordinates of $\\mathbf{v}$ are $(2, 1)$.',
          strategyTitle: 'Multiply: $[\\mathbf{v}]_{\\mathcal{B}} = P^{-1}\\mathbf{v}$',
        },
        {
          expression: '\\text{Check: } 2\\begin{bmatrix}1\\\\1\\end{bmatrix} + 1\\begin{bmatrix}1\\\\-1\\end{bmatrix} = \\begin{bmatrix}3\\\\1\\end{bmatrix} = \\mathbf{v} \\checkmark',
          annotation: 'Reconstruct $\\mathbf{v}$ from its $\\mathcal{B}$-coordinates to verify.',
          strategyTitle: 'Verify: $P \\cdot [\\mathbf{v}]_{\\mathcal{B}} = \\mathbf{v}$',
        },
      ],
    },
    {
      id: 'ex-la6-006-2',
      title: 'Three-basis chain: compose change-of-basis matrices',
      problem: 'Let $\\mathcal{E}$ be the standard basis, $\\mathcal{B} = \\{(1,1),(1,-1)\\}$, and $\\mathcal{C} = \\{(2,1),(1,2)\\}$. A vector has $\\mathcal{E}$-coordinates $(3,1)$. Find its $\\mathcal{C}$-coordinates two ways: (a) go $\\mathcal{E}\\to\\mathcal{B}\\to\\mathcal{C}$, (b) go directly $\\mathcal{E}\\to\\mathcal{C}$. Verify they match.',
      steps: [
        {
          expression: 'P_{\\mathcal{E}\\to\\mathcal{B}} = P_B^{-1} = \\begin{bmatrix}1/2&1/2\\\\1/2&-1/2\\end{bmatrix}, \\quad [\\mathbf{v}]_{\\mathcal{B}} = \\begin{bmatrix}1/2&1/2\\\\1/2&-1/2\\end{bmatrix}\\begin{bmatrix}3\\\\1\\end{bmatrix} = \\begin{bmatrix}2\\\\1\\end{bmatrix}',
          annotation: '$P_B = [[1,1],[1,-1]]$ converts $\\mathcal{B}$-coords to standard. Its inverse converts standard to $\\mathcal{B}$-coords.',
          strategyTitle: 'Step 1: $\\mathcal{E}\\to\\mathcal{B}$',
        },
        {
          expression: 'P_{\\mathcal{B}\\to\\mathcal{C}} = P_C^{-1} P_B = \\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}^{-1}\\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix} = \\frac{1}{3}\\begin{bmatrix}2&-1\\\\-1&2\\end{bmatrix}\\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix} = \\frac{1}{3}\\begin{bmatrix}1&3\\\\1&-3\\end{bmatrix}',
          annotation: 'To go from $\\mathcal{B}$-coords to $\\mathcal{C}$-coords: first convert $\\mathcal{B}$-coords to standard ($P_B$), then convert standard to $\\mathcal{C}$-coords ($P_C^{-1}$). So $P_{\\mathcal{B}\\to\\mathcal{C}} = P_C^{-1}P_B$.',
          strategyTitle: 'Step 2: $\\mathcal{B}\\to\\mathcal{C}$',
        },
        {
          expression: '[\\mathbf{v}]_{\\mathcal{C}} = P_{\\mathcal{B}\\to\\mathcal{C}}[\\mathbf{v}]_{\\mathcal{B}} = \\frac{1}{3}\\begin{bmatrix}1&3\\\\1&-3\\end{bmatrix}\\begin{bmatrix}2\\\\1\\end{bmatrix} = \\frac{1}{3}\\begin{bmatrix}5\\\\-1\\end{bmatrix} = \\begin{bmatrix}5/3\\\\-1/3\\end{bmatrix}',
          annotation: 'Via the chain $\\mathcal{E}\\to\\mathcal{B}\\to\\mathcal{C}$.',
          strategyTitle: 'Apply: chain gives $\\mathcal{C}$-coordinates',
        },
        {
          expression: 'P_{\\mathcal{E}\\to\\mathcal{C}} = P_C^{-1} = \\frac{1}{3}\\begin{bmatrix}2&-1\\\\-1&2\\end{bmatrix}, \\quad [\\mathbf{v}]_{\\mathcal{C}} = \\frac{1}{3}\\begin{bmatrix}2&-1\\\\-1&2\\end{bmatrix}\\begin{bmatrix}3\\\\1\\end{bmatrix} = \\frac{1}{3}\\begin{bmatrix}5\\\\-1\\end{bmatrix} = \\begin{bmatrix}5/3\\\\-1/3\\end{bmatrix} \\checkmark',
          annotation: 'Direct path gives the same answer. Composition law: $P_{\\mathcal{E}\\to\\mathcal{C}} = P_{\\mathcal{B}\\to\\mathcal{C}}\\cdot P_{\\mathcal{E}\\to\\mathcal{B}}$ is consistent because $P_C^{-1} = P_C^{-1}P_B \\cdot P_B^{-1}$.',
          strategyTitle: 'Verify: direct $\\mathcal{E}\\to\\mathcal{C}$ matches',
        },
      ],
    },
    {
      id: 'ex-la6-006-3',
      title: 'How a matrix changes when you change basis',
      problem: 'Let $A = \\begin{bmatrix}3&1\\\\0&2\\end{bmatrix}$ be the matrix of a linear map $T$ in the standard basis. Switch to basis $\\mathcal{B} = \\{(1,1),(1,0)\\}$. Find the matrix $[T]_{\\mathcal{B}} = P^{-1}AP$ and verify it has the same eigenvalues as $A$.',
      steps: [
        {
          expression: 'P = \\begin{bmatrix}1&1\\\\1&0\\end{bmatrix}, \\quad P^{-1} = \\frac{1}{-1}\\begin{bmatrix}0&-1\\\\-1&1\\end{bmatrix} = \\begin{bmatrix}0&1\\\\1&-1\\end{bmatrix}',
          annotation: '$P$ has the new basis vectors as columns. $\\det(P) = 0\\cdot1 - 1\\cdot1 = -1$. For $2\\times2$: swap diagonal, negate off-diagonal, divide by determinant.',
          strategyTitle: 'Form $P$ and compute $P^{-1}$',
        },
        {
          expression: 'P^{-1}A = \\begin{bmatrix}0&1\\\\1&-1\\end{bmatrix}\\begin{bmatrix}3&1\\\\0&2\\end{bmatrix} = \\begin{bmatrix}0&2\\\\3&-1\\end{bmatrix}',
          annotation: 'Multiply $P^{-1}$ on the left by $A$.',
          strategyTitle: 'Compute $P^{-1}A$',
        },
        {
          expression: '[T]_{\\mathcal{B}} = P^{-1}AP = \\begin{bmatrix}0&2\\\\3&-1\\end{bmatrix}\\begin{bmatrix}1&1\\\\1&0\\end{bmatrix} = \\begin{bmatrix}2&0\\\\2&3\\end{bmatrix}',
          annotation: 'Now multiply by $P$ on the right. In basis $\\mathcal{B}$, the same transformation has a different matrix representation.',
          strategyTitle: 'Multiply by $P$: get $[T]_{\\mathcal{B}}$',
        },
        {
          expression: '\\text{Eigenvalues of } A: \\det(A-\\lambda I) = (3-\\lambda)(2-\\lambda) = 0 \\Rightarrow \\lambda = 2, 3',
          annotation: '',
          strategyTitle: 'Eigenvalues of $A$',
        },
        {
          expression: '\\text{Eigenvalues of } [T]_{\\mathcal{B}}: \\det\\begin{bmatrix}2-\\lambda&0\\\\2&3-\\lambda\\end{bmatrix} = (2-\\lambda)(3-\\lambda) = 0 \\Rightarrow \\lambda = 2, 3 \\checkmark',
          annotation: 'Same eigenvalues! Similar matrices ($A$ and $P^{-1}AP$) always share eigenvalues — they represent the same linear map in different coordinates.',
          strategyTitle: 'Eigenvalues of $[T]_{\\mathcal{B}}$ — same as $A$',
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la6-006-1',
      title: 'Three-basis chain and diagonalization connection',
      difficulty: 'medium',
      problem: 'For $A = \\begin{bmatrix}2&1\\\\0&3\\end{bmatrix}$, find the eigenvector basis $\\mathcal{B}$, form the change-of-basis matrix $P$, and verify $P^{-1}AP = D$ (diagonal).',
      hint: 'Eigenvalues: $\\lambda_1 = 2, \\lambda_2 = 3$. Find eigenvectors, form $P = [\\mathbf{v}_1 | \\mathbf{v}_2]$, compute $P^{-1}AP$.',
      walkthrough: [
        '**Eigenvalues:** $A$ is upper triangular so eigenvalues are diagonal entries: $\\lambda_1 = 2, \\lambda_2 = 3$.',
        '**Eigenvectors:** For $\\lambda_1 = 2$: $(A-2I)\\mathbf{v} = \\begin{bmatrix}0&1\\\\0&1\\end{bmatrix}\\mathbf{v} = 0 \\Rightarrow \\mathbf{v}_1 = (1,0)^\\top$. For $\\lambda_2 = 3$: $(A-3I)\\mathbf{v} = \\begin{bmatrix}-1&1\\\\0&0\\end{bmatrix}\\mathbf{v} = 0 \\Rightarrow \\mathbf{v}_2 = (1,1)^\\top$.',
        '**Change-of-basis matrix:** $P = \\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}$. $P^{-1} = \\begin{bmatrix}1&-1\\\\0&1\\end{bmatrix}$ ($\\det = 1$).',
        '**Verify:** $P^{-1}AP = \\begin{bmatrix}1&-1\\\\0&1\\end{bmatrix}\\begin{bmatrix}2&1\\\\0&3\\end{bmatrix}\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix} = \\begin{bmatrix}2&0\\\\0&3\\end{bmatrix} = D$ âœ“.',
        '**Interpretation:** In the eigenvector basis, $A$ acts as "multiply by 2 in the $\\mathbf{v}_1$ direction and by 3 in the $\\mathbf{v}_2$ direction." No mixing between the two directions.',
      ],
    },
  ],

  mentalModel: [
    'Coordinate vector = list of coefficients with respect to a given basis.',
    'Change-of-basis matrix $P$: columns are new basis vectors in old coordinates.',
    'Vector conversion: $[\\mathbf{v}]_{\\text{new}} = P^{-1}[\\mathbf{v}]_{\\text{old}}$.',
    'Matrix conversion (similarity): $[T]_{\\text{new}} = P^{-1}[T]_{\\text{old}}P$.',
    'Eigenvalues, determinant, trace, rank are invariant under similarity — they describe the map, not the basis.',
  ],

  checkpoints: [
    { id: 'cp-la6-006-1', label: 'Read: coordinate vectors intro', type: 'read' },
    { id: 'cp-la6-006-2', label: 'Read: change-of-basis matrix definition', type: 'read' },
    { id: 'cp-la6-006-3', label: 'Read: similarity and matrix conversion', type: 'read' },
    { id: 'cp-la6-006-4', label: 'Try: find B-coordinates of v=(3,1)', type: 'lab' },
    { id: 'cp-la6-006-5', label: 'Try: compose two change-of-basis matrices', type: 'lab' },
    { id: 'cp-la6-006-6', label: 'Work: compute P^{-1}AP for given A and B', type: 'example' },
    { id: 'cp-la6-006-7', label: 'Work: verify eigenvalues preserved under similarity', type: 'example' },
    { id: 'cp-la6-006-8', label: 'Challenge: diagonalize A via eigenvector basis', type: 'challenge' },
  ],

  assessment: {
    questions: [
      {
        id: 'assess-la6-006-1',
        type: 'computation',
        text: 'Let $A = \\begin{bmatrix}4&2\\\\1&3\\end{bmatrix}$. (a) Find the eigenvalues and eigenvectors. (b) Form the change-of-basis matrix $P$. (c) Verify $P^{-1}AP = D$. (d) What does $A$ look like in the eigenvector basis?',
        answer: '(a) Char poly: $(4-\\lambda)(3-\\lambda)-2 = \\lambda^2-7\\lambda+10 = (\\lambda-2)(\\lambda-5)$. $\\lambda_1=2$: $\\mathbf{v}_1=(-2,1)^\\top$ (or $(2,-1)^\\top$). $\\lambda_2=5$: $\\mathbf{v}_2=(1,1)^\\top$. (b) $P=\\begin{bmatrix}-2&1\\\\1&1\\end{bmatrix}$. (c) $P^{-1}AP = \\begin{bmatrix}2&0\\\\0&5\\end{bmatrix}$ âœ“. (d) In the eigenvector basis, $A$ scales the $\\mathbf{v}_1$ direction by 2 and the $\\mathbf{v}_2$ direction by 5 — pure stretching, no mixing.',
        hint: 'Form $P = [\\mathbf{v}_1 | \\mathbf{v}_2]$ and compute $P^{-1} = \\frac{1}{\\det P}\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$.',
      },
    ],
  },

  quiz: [
    {
      id: 'q-la6-006-1',
      type: 'choice',
      text: 'If $P$ has new basis vectors as columns, then coordinates in the new basis are obtained by:',
      options: ['Multiplying $\\mathbf{v}$ by $P$', 'Multiplying $\\mathbf{v}$ by $P^{-1}$', 'Multiplying $\\mathbf{v}$ by $P^\\top$', 'Multiplying $\\mathbf{v}$ by $P^2$'],
      answer: 'Multiplying $\\mathbf{v}$ by $P^{-1}$',
      hints: ['$P$ converts new coordinates to old: $\\mathbf{v} = P[\\mathbf{v}]_{\\text{new}}$. To get new coordinates: $[\\mathbf{v}]_{\\text{new}} = P^{-1}\\mathbf{v}$.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la6-006-2',
      type: 'choice',
      text: 'Under matrix similarity $B = P^{-1}AP$, which quantity is NOT preserved?',
      options: ['Eigenvalues', 'Determinant', 'Individual matrix entries', 'Rank'],
      answer: 'Individual matrix entries',
      hints: ['Similarity invariants include: eigenvalues, characteristic polynomial, trace, determinant, rank. The individual entries $A_{ij}$ are NOT invariants — they depend on the choice of basis. This is precisely the point: same map, different matrix representations.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la6-006-3',
      type: 'choice',
      text: 'In the eigenvector basis, a diagonalizable matrix $A$ looks like:',
      options: ['A triangular matrix', 'A permutation matrix', 'A diagonal matrix $D$ with eigenvalues on the diagonal', 'An identity matrix'],
      answer: 'A diagonal matrix $D$ with eigenvalues on the diagonal',
      hints: ['$P^{-1}AP = D$ where $D = \\text{diag}(\\lambda_1, \\ldots, \\lambda_n)$. In the eigenvector basis, the map $T$ has the simplest possible matrix — a diagonal scaling.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la6-006-4',
      type: 'choice',
      text: 'The change-of-basis matrices satisfy which composition rule when going from basis $A$ to $B$ to $C$?',
      options: ['$P_{A \\to C} = P_{A \\to B} + P_{B \\to C}$', '$P_{A \\to C} = P_{B \\to C} \\cdot P_{A \\to B}$', '$P_{A \\to C} = P_{A \\to B} \\cdot P_{B \\to C}$', '$P_{A \\to C} = P_{A \\to B}^{-1} + P_{B \\to C}^{-1}$'],
      answer: '$P_{A \\to C} = P_{B \\to C} \\cdot P_{A \\to B}$',
      hints: ['Apply in sequence: $[\\mathbf{v}]_B = P_{A\\to B}[\\mathbf{v}]_A$, then $[\\mathbf{v}]_C = P_{B\\to C}[\\mathbf{v}]_B = P_{B\\to C} P_{A\\to B} [\\mathbf{v}]_A$. Matrix multiplication is not commutative — order matters.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la6-006-5',
      type: 'choice',
      text: 'Let $\\mathcal{B} = \\{(1,2),(0,1)\\}$ and $\\mathbf{v} = (3,5)$. What are the $\\mathcal{B}$-coordinates of $\\mathbf{v}$?',
      options: ['$(3, -1)$', '$(3, 5)$', '$(2, 1)$', '$(1, 3)$'],
      answer: '$(3, -1)$',
      hints: ['Form $P = [[1,0],[2,1]]$, compute $P^{-1} = [[1,0],[-2,1]]$, then $[\\mathbf{v}]_{\\mathcal{B}} = P^{-1}\\mathbf{v} = [[1,0],[-2,1]][3,5]^T = [3,-1]^T$. Check: $3(1,2)+(-1)(0,1)=(3,5)$ âœ“.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-006-6',
      type: 'choice',
      text: 'Two matrices $A$ and $B = P^{-1}AP$ are called:',
      options: ['Congruent', 'Similar', 'Orthogonally equivalent', 'Row equivalent'],
      answer: 'Similar',
      hints: ['$B = P^{-1}AP$ defines **similarity**. Similar matrices represent the same linear transformation in different bases. Congruence ($P^T A P$) applies to quadratic forms. Row equivalence applies to systems of equations.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la6-006-7',
      type: 'choice',
      text: 'If $P$ converts from basis $\\mathcal{B}$ to standard coordinates, then $P^{-1}AP$ represents $T$ in which basis?',
      options: ['The standard basis', 'The basis $\\mathcal{B}$', 'The dual basis', 'An arbitrary basis'],
      answer: 'The basis $\\mathcal{B}$',
      hints: ['$P^{-1}AP$ is the matrix of $T$ in the basis $\\mathcal{B}$. The columns of $P$ are the $\\mathcal{B}$ basis vectors, so $P$ "translates" $\\mathcal{B}$-coordinates to standard. Conjugating $A$ by $P$ switches the representation to $\\mathcal{B}$.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la6-006-8',
      type: 'choice',
      text: 'Which is true about the trace under similarity $B = P^{-1}AP$?',
      options: ['$\\text{tr}(B) = \\text{tr}(A) \\cdot \\det(P)$', '$\\text{tr}(B) = \\text{tr}(A)$', '$\\text{tr}(B) = \\text{tr}(A) / \\det(P)$', '$\\text{tr}(B)$ and $\\text{tr}(A)$ are unrelated'],
      answer: '$\\text{tr}(B) = \\text{tr}(A)$',
      hints: ['The trace is invariant under similarity: $\\text{tr}(P^{-1}AP) = \\text{tr}(APP^{-1}) = \\text{tr}(A)$ by the cyclic property of trace. This means the sum of eigenvalues (= trace) is an intrinsic property of the linear map, not the choice of basis.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la6-006-9',
      type: 'choice',
      text: 'The vector $\\mathbf{v} = (1,0)$ in the standard basis. In the basis $\\mathcal{B} = \\{(1/\\sqrt{2},1/\\sqrt{2}),(-1/\\sqrt{2},1/\\sqrt{2})\\}$ (45° rotation), what are its coordinates?',
      options: ['$(1/\\sqrt{2}, -1/\\sqrt{2})$', '$(\\sqrt{2}, 0)$', '$(1, 0)$', '$(0, 1/\\sqrt{2})$'],
      answer: '$(1/\\sqrt{2}, -1/\\sqrt{2})$',
      hints: ['$P = [\\mathbf{b}_1 | \\mathbf{b}_2]$ is an orthogonal matrix, so $P^{-1} = P^T$. Thus $[\\mathbf{v}]_{\\mathcal{B}} = P^T(1,0)^T = (1/\\sqrt{2}, -1/\\sqrt{2})^T$. Check: $(1/\\sqrt{2})(1/\\sqrt{2}, 1/\\sqrt{2}) + (-1/\\sqrt{2})(-1/\\sqrt{2}, 1/\\sqrt{2}) = (1/2+1/2, 1/2-1/2) = (1,0)$ âœ“.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-006-10',
      type: 'choice',
      text: 'If $A$ is already diagonal, $A = \\text{diag}(2, 5)$, what is $P^{-1}AP$ for an invertible $P$?',
      options: ['Always $A$ itself', 'Always diagonal, but possibly with different diagonal entries', 'Similar to $A$ — same eigenvalues 2 and 5, but generally not diagonal', 'Always the identity'],
      answer: 'Similar to $A$ — same eigenvalues 2 and 5, but generally not diagonal',
      hints: ['$P^{-1}AP$ is similar to $A$ regardless of what $P$ is, so it always has eigenvalues 2 and 5. But unless $P$ is itself diagonal (or built from eigenvectors of $A$), $P^{-1}AP$ will not be diagonal. Diagonality is a basis-dependent property; eigenvalues are not.'],
      reviewSection: 'rigor',
    },
  ],

  mastery: {
    targetLevel: 3,
    solveIndependently: 'Given a basis $\\mathcal{B}$ and a vector $\\mathbf{v}$, find $[\\mathbf{v}]_{\\mathcal{B}}$ by forming $P$ and computing $P^{-1}\\mathbf{v}$. Given a matrix $A$ and a new basis $P$, compute $P^{-1}AP$ and identify which properties are preserved.',
    explainVerbally: 'Explain why two matrices can represent the same linear transformation and why eigenvalues, trace, and determinant stay the same under similarity.',
    detectIncorrectApplication: 'Catch errors where someone applies $PA$ instead of $P^{-1}AP$ for a matrix change of basis, or confuses which direction $P$ converts (old-to-new vs new-to-old).',
    transferToUnfamiliar: 'Recognize that diagonalization, the Spectral Theorem, and Jordan Normal Form are all special cases of change of basis, and use this to reason about each.',
  },

  misconceptions: [
    {
      falseBelief: 'The matrix $P$ converts vectors to new-basis coordinates.',
      whyStudentsThinkIt: 'Students see "$P$ is the change-of-basis matrix" and assume multiplying by $P$ gives new coordinates.',
      correctionExample: '$P$ converts FROM new-basis coordinates TO standard: $\\mathbf{v} = P[\\mathbf{v}]_{\\mathcal{B}}$. To get new coordinates, you need $P^{-1}$: $[\\mathbf{v}]_{\\mathcal{B}} = P^{-1}\\mathbf{v}$. Think of $P$ as "decoding" (new → standard) and $P^{-1}$ as "encoding" (standard → new).',
      contrastCase: 'If $\\mathcal{B} = \\{(2,0),(0,3)\\}$ and $\\mathbf{v} = (4,6)$, then $[\\mathbf{v}]_{\\mathcal{B}} = P^{-1}(4,6)^T = (1/2, 0; 0, 1/3)(4,6)^T = (2,2)^T$. Multiplying by $P$ gives $(2\\cdot4, 3\\cdot6) = (8,18)$ which is wrong.',
    },
    {
      falseBelief: 'Similar matrices are the same matrix written differently — so all their entries are equal.',
      whyStudentsThinkIt: 'Students hear "same linear transformation, different basis" and confuse "same transformation" with "same matrix entries."',
      correctionExample: 'The matrices $A = [[3,1],[0,2]]$ and $P^{-1}AP = [[2,2],[0,3]]$ (from Example 3) represent the same transformation in different bases. Their entries differ completely, but eigenvalues (2 and 3), trace (5), and determinant (6) are identical.',
      contrastCase: 'Two matrices with the same entries are equal, not just similar. Two matrices are similar if there exists an invertible $P$ with $B = P^{-1}AP$ — the standard and new-basis representations of one map.',
    },
  ],

  transferPrompts: [
    {
      situation: 'In signal processing, the Discrete Fourier Transform converts a signal from the time domain to the frequency domain.',
      competingTechniques: 'You could analyze the signal in the time domain directly, or transform to frequency domain first.',
      whyThisTechniqueWins: 'The DFT is a change of basis — from the standard time-domain basis to the Fourier (frequency) basis. In the Fourier basis, convolution (hard) becomes pointwise multiplication (easy), just as a linear map becomes diagonal in its eigenvector basis.',
    },
    {
      situation: 'A physics problem involves a symmetric mass-spring system with coupled oscillators. The equations of motion are coupled (each mass affects the others).',
      competingTechniques: 'Solve the coupled system directly, or transform to normal mode coordinates.',
      whyThisTechniqueWins: 'Normal modes are the eigenvectors of the system matrix. Changing to the normal-mode basis diagonalizes the system, decoupling the equations. This is $P^{-1}AP = D$ applied to physics: the right basis makes the problem trivial.',
    },
  ],

  debugging: [
    {
      commonError: 'Using $P$ instead of $P^{-1}$ to convert a vector to new-basis coordinates.',
      symptom: 'The resulting "coordinate vector" $c = P\\mathbf{v}$ does not satisfy $\\mathbf{v} = \\mathbf{b}_1 c_1 + \\mathbf{b}_2 c_2$.',
      whyItHappened: 'Confusing the direction of conversion: $P$ maps new-basis coordinates to standard, so applying $P$ to a standard vector gives something meaningless for our purpose.',
      repairStrategy: 'Always start from $\\mathbf{v} = P[\\mathbf{v}]_{\\mathcal{B}}$ (definition), then solve: $[\\mathbf{v}]_{\\mathcal{B}} = P^{-1}\\mathbf{v}$. Verify by checking $P \\cdot (\\text{your answer}) = \\mathbf{v}$.',
    },
    {
      commonError: 'Computing $PAP^{-1}$ instead of $P^{-1}AP$ for the matrix in the new basis.',
      symptom: 'The computed matrix has different eigenvalues than the original, which should not happen under similarity.',
      whyItHappened: 'The formula for the matrix of $T$ in basis $\\mathcal{B}$ is $[T]_{\\mathcal{B}} = P^{-1}[T]_{\\text{std}}P$, where $P^{-1}$ is on the left. Reversing the order gives the matrix of a different transformation.',
      repairStrategy: 'Remember the formula as: "first decode input ($P^{-1}$), apply $T$ (multiply by $A$), then encode output back ($P$)" which gives $P^{-1}AP$, not $PAP^{-1}$.',
    },
  ],
};
