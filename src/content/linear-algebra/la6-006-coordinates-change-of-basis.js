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
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**Coordinate vectors.** If $\\mathcal{B} = (\\mathbf{b}_1, \\ldots, \\mathbf{b}_n)$ is an ordered basis of $V$, every $\\mathbf{v} \\in V$ writes uniquely as $\\mathbf{v} = c_1 \\mathbf{b}_1 + \\cdots + c_n \\mathbf{b}_n$. The vector $[\\mathbf{v}]_{\\mathcal{B}} = (c_1, \\ldots, c_n)^\\top$ is the **coordinate vector** of $\\mathbf{v}$ relative to $\\mathcal{B}$. Same $\\mathbf{v}$, different $\\mathcal{B}$ → different coordinates.',
      '**The change-of-basis matrix.** Given two ordered bases $\\mathcal{B}$ and $\\mathcal{B}\'$ for $V$, the **change-of-basis matrix from $\\mathcal{B}$ to $\\mathcal{B}\'$** is the matrix $P_{\\mathcal{B} \\to \\mathcal{B}\'} = [P]$ whose $j$-th column is $[\\mathbf{b}_j]_{\\mathcal{B}\'} =$ coordinates of the old basis vector $\\mathbf{b}_j$ in the new basis $\\mathcal{B}\'$. Then: $[\\mathbf{v}]_{\\mathcal{B}\'} = P_{\\mathcal{B} \\to \\mathcal{B}\'} \\cdot [\\mathbf{v}]_{\\mathcal{B}}$.',
      '**In $\\mathbb{R}^n$.** When $\\mathcal{C}$ is the standard basis and $\\mathcal{B}$ is a non-standard basis with basis vectors $\\mathbf{b}_1, \\ldots, \\mathbf{b}_n$, the matrix $P = [\\mathbf{b}_1 | \\cdots | \\mathbf{b}_n]$ converts from $\\mathcal{B}$-coordinates to standard coordinates: $\\mathbf{v} = P[\\mathbf{v}]_{\\mathcal{B}}$. To go the other way: $[\\mathbf{v}]_{\\mathcal{B}} = P^{-1}\\mathbf{v}$.',
      '**Effect on matrices.** If $T: V \\to V$ has matrix $A$ in basis $\\mathcal{B}$ and matrix $A\'$ in basis $\\mathcal{B}\'$, then $A\' = P^{-1}AP$ where $P = P_{\\mathcal{B}\' \\to \\mathcal{B}}$ (columns = $\\mathcal{B}\'$ vectors in $\\mathcal{B}$-coordinates). This is the similarity transformation from earlier — now you know where it comes from.',
    ],
    callouts: [
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
    visualizations: [],
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
        '**Verify:** $P^{-1}AP = \\begin{bmatrix}1&-1\\\\0&1\\end{bmatrix}\\begin{bmatrix}2&1\\\\0&3\\end{bmatrix}\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix} = \\begin{bmatrix}2&0\\\\0&3\\end{bmatrix} = D$ ✓.',
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
    { id: 'cp-la6-006-1', question: 'How do you convert a vector from old to new coordinates?', answer: 'Multiply by $P^{-1}$ where $P$ has the new basis vectors as columns (in old coordinates).' },
    { id: 'cp-la6-006-2', question: 'If $A$ and $B = P^{-1}AP$, do $A$ and $B$ have the same eigenvalues?', answer: 'Yes — similar matrices have the same characteristic polynomial and the same eigenvalues.' },
    { id: 'cp-la6-006-3', question: 'What does diagonalization $A = PDP^{-1}$ say in terms of change of basis?', answer: 'In the eigenvector basis (columns of $P$), the linear map is the diagonal matrix $D$.' },
  ],

  assessment: {
    questions: [
      {
        id: 'assess-la6-006-1',
        type: 'computation',
        text: 'Let $A = \\begin{bmatrix}4&2\\\\1&3\\end{bmatrix}$. (a) Find the eigenvalues and eigenvectors. (b) Form the change-of-basis matrix $P$. (c) Verify $P^{-1}AP = D$. (d) What does $A$ look like in the eigenvector basis?',
        answer: '(a) Char poly: $(4-\\lambda)(3-\\lambda)-2 = \\lambda^2-7\\lambda+10 = (\\lambda-2)(\\lambda-5)$. $\\lambda_1=2$: $\\mathbf{v}_1=(-2,1)^\\top$ (or $(2,-1)^\\top$). $\\lambda_2=5$: $\\mathbf{v}_2=(1,1)^\\top$. (b) $P=\\begin{bmatrix}-2&1\\\\1&1\\end{bmatrix}$. (c) $P^{-1}AP = \\begin{bmatrix}2&0\\\\0&5\\end{bmatrix}$ ✓. (d) In the eigenvector basis, $A$ scales the $\\mathbf{v}_1$ direction by 2 and the $\\mathbf{v}_2$ direction by 5 — pure stretching, no mixing.',
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
  ],
};
