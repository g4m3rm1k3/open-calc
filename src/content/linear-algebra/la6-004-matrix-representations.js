export default {
  id: 'la6-004',
  slug: 'matrix-representations',
  chapter: 'la6',
  order: 4,
  title: 'Matrix Representations',
  subtitle: 'Every linear map between finite-dimensional vector spaces can be encoded as a matrix — but the matrix depends on the choice of bases. Change the bases, change the matrix.',
  tags: ['matrix representation', 'coordinate vector', 'change of basis', 'basis matrix', 'similar matrices', 'diagonalization', 'canonical form'],
  aliases: 'matrix representation coordinate vector change of basis basis matrix similar matrices diagonalization canonical form',

  hook: {
    question: "If differentiation is a linear map and every linear map has a matrix, what does the 'differentiation matrix' look like — and why does it depend on which basis you use for polynomials?",
    realWorldContext: "The same linear transformation can look very different depending on your basis. A rotation in $\\mathbb{R}^2$ is represented by a rotation matrix in the standard basis, but by a diagonal matrix (just scaling by $e^{i\\theta}$ and $e^{-i\\theta}$) in the basis of complex eigenvectors. This is exactly diagonalization! In signal processing, the DFT changes basis to the Fourier modes, turning convolution (complicated) into pointwise multiplication (simple). In numerical methods, preconditioners change the basis to make the system better conditioned.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**Building the matrix column by column.** Given $T: V \\to W$, an ordered basis $\\mathcal{B} = (\\mathbf{b}_1, \\ldots, \\mathbf{b}_n)$ for $V$, and an ordered basis $\\mathcal{C} = (\\mathbf{c}_1, \\ldots, \\mathbf{c}_m)$ for $W$: compute $T(\\mathbf{b}_j)$ for each $j$, express the result as a linear combination $T(\\mathbf{b}_j) = a_{1j}\\mathbf{c}_1 + \\cdots + a_{mj}\\mathbf{c}_m$, and put $(a_{1j}, \\ldots, a_{mj})$ as the $j$-th column. The result is the $m \\times n$ matrix $[T]_{\\mathcal{B}}^{\\mathcal{C}}$.',
      '**Coordinates.** For a vector $\\mathbf{v} \\in V$, write $\\mathbf{v} = x_1 \\mathbf{b}_1 + \\cdots + x_n \\mathbf{b}_n$. The coordinate vector is $[\\mathbf{v}]_{\\mathcal{B}} = (x_1, \\ldots, x_n)^\\top \\in \\mathbb{R}^n$. Then matrix multiplication gives: $[T(\\mathbf{v})]_{\\mathcal{C}} = [T]_{\\mathcal{B}}^{\\mathcal{C}} \\cdot [\\mathbf{v}]_{\\mathcal{B}}$. This is the fundamental formula: matrices multiply coordinate vectors.',
      '**Change of basis.** If $T: V \\to V$ (same space) and you switch from basis $\\mathcal{B}$ to basis $\\mathcal{B}\'$, the matrix changes by conjugation: $[T]_{\\mathcal{B}\'} = P^{-1}[T]_{\\mathcal{B}}P$, where $P$ is the **change-of-basis matrix** — its $j$-th column is $[\\mathbf{b}_j]_{\\mathcal{B}\'} =$ coordinates of the old basis vectors in the new basis. Two matrices $A$ and $B$ represent the same linear map in different bases iff $B = P^{-1}AP$ for some invertible $P$.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The Fundamental Formula',
        body: 'If $T: V \\to W$, $\\mathbf{v} \\in V$:\n$[T(\\mathbf{v})]_{\\mathcal{C}} = [T]_{\\mathcal{B}}^{\\mathcal{C}} \\cdot [\\mathbf{v}]_{\\mathcal{B}}$\n\nThis converts abstract linear algebra into concrete matrix multiplication.',
      },
      {
        type: 'insight',
        title: 'Why Diagonalization Is Basis Change',
        body: 'If $A$ is diagonalizable with $A = PDP^{-1}$, then $D = P^{-1}AP$. This says: the matrix $A$ represents some linear map $T$ in the standard basis. The same map $T$ in the eigenvector basis is the diagonal matrix $D$. Diagonalization = finding the right basis to make the map look simple.',
      },
      {
        type: 'warning',
        title: 'Order of Bases Matters',
        body: 'The matrix $[T]_{\\mathcal{B}}^{\\mathcal{C}}$ is not just "the matrix of $T$" — it depends on the ordered pair of bases $(\\mathcal{B}, \\mathcal{C})$. Reordering either basis permutes rows or columns. Swapping to a different basis entirely changes the matrix significantly. Always track which bases you\'re using.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Matrix Representations and Basis Change',
        mathBridge: 'Build matrix representations and verify change-of-basis formulas.',
        caption: 'Same map, different bases: the matrix changes by P^{-1}AP.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Matrix of differentiation in standard basis',
              prose: ['Build D: P3 -> P3 by T(p) = p prime using basis {1, x, x^2, x^3}.'],
              code: `% T(1) = 0  -> [0,0,0,0]
% T(x) = 1  -> [1,0,0,0]
% T(x^2) = 2x -> [0,2,0,0]
% T(x^3) = 3x^2 -> [0,0,3,0]
D_std = [0 1 0 0;
         0 0 2 0;
         0 0 0 3;
         0 0 0 0]
disp('Differentiation matrix D in standard basis {1,x,x^2,x^3}:')
D_std

% Apply to p(x) = 1 + 3x^2 = [1;0;3;0]
p = [1; 0; 3; 0]
dp = D_std * p
disp('D(1 + 3x^2) should be 6x = [0;6;0;0]:')
dp
`,
            },
            {
              id: 2,
              cellTitle: 'Change of basis: standard to eigenbasis',
              prose: ['A linear map T on R^2 with matrix A = [3 1; 0 2]. Find its matrix in the eigenbasis.'],
              code: `A = [3 1; 0 2]
[P, D] = eig(A)
disp('Eigenvalues (diagonal of D):')
diag(D)
disp('Eigenvectors (columns of P):')
P
disp('D = P^{-1} A P: same map, eigenbasis coordinates:')
D_check = inv(P) * A * P
disp('Verify A = P D P^{-1}:')
A_check = P * D * inv(P)
norm(A - A_check)
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Uniqueness.** Given bases $\\mathcal{B}$ and $\\mathcal{C}$, the matrix $[T]_{\\mathcal{B}}^{\\mathcal{C}}$ is uniquely determined: it is forced by the values of $T$ on the basis vectors and the coordinate system. Conversely, any $m \\times n$ matrix determines a unique linear map $\\mathbb{R}^n \\to \\mathbb{R}^m$ (by matrix multiplication), and hence a unique linear map $V \\to W$ once bases are fixed.',
      '**Composition of maps.** If $T: V \\to W$ and $S: W \\to X$ with bases $\\mathcal{B}, \\mathcal{C}, \\mathcal{D}$, then $[S \\circ T]_{\\mathcal{B}}^{\\mathcal{D}} = [S]_{\\mathcal{C}}^{\\mathcal{D}} \\cdot [T]_{\\mathcal{B}}^{\\mathcal{C}}$. This is why composition of linear maps corresponds to matrix multiplication. Order matters because function composition is not commutative.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Matrix of Composition = Product of Matrices',
        body: '$[S \\circ T]_{\\mathcal{B}}^{\\mathcal{D}} = [S]_{\\mathcal{C}}^{\\mathcal{D}} \\cdot [T]_{\\mathcal{B}}^{\\mathcal{C}}$\n\nThis is the abstract explanation for why matrix multiplication is defined the way it is. Matrix multiplication was invented to represent composition of linear maps.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Canonical forms.** Under change of basis, matrices can be brought to simpler "canonical forms." Jordan Normal Form is the canonical form for any square matrix over $\\mathbb{C}$ under similarity. Rational Normal Form (Frobenius form) is the canonical form over $\\mathbb{Q}$. Smith Normal Form applies to integer matrices. The theory of canonical forms classifies all linear endomorphisms of a finite-dimensional space.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'When Are Two Matrices "The Same Map"?',
        body: '$A$ and $B$ represent the same linear map in different bases iff $B = P^{-1}AP$ (similar matrices).\n\nInvariants preserved under similarity: determinant, trace, rank, characteristic polynomial, eigenvalues, minimal polynomial, Jordan structure.\n\nUse these invariants to tell similar matrices apart — or to verify they might be similar.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la6-004-1',
      title: 'Matrix of the evaluation map $T(p) = (p(-1), p(0), p(1))$',
      problem: 'Let $T: P_2 \\to \\mathbb{R}^3$ be $T(p) = (p(-1), p(0), p(1))^\\top$. Find the matrix of $T$ using bases $\\{1, x, x^2\\}$ for $P_2$ and standard basis for $\\mathbb{R}^3$.',
      steps: [
        {
          expression: 'T(1) = (1(-1)^0, 1(0)^0, 1(1)^0)^\\top = (1, 1, 1)^\\top',
          annotation: 'Apply $T$ to the first basis vector $1$ (constant polynomial).',
          strategyTitle: 'Column 1: $T(1)$',
        },
        {
          expression: 'T(x) = ((-1), 0, 1)^\\top',
          annotation: 'Evaluate $x$ at $x = -1, 0, 1$.',
          strategyTitle: 'Column 2: $T(x)$',
        },
        {
          expression: 'T(x^2) = ((-1)^2, 0^2, 1^2)^\\top = (1, 0, 1)^\\top',
          annotation: 'Evaluate $x^2$ at $x = -1, 0, 1$.',
          strategyTitle: 'Column 3: $T(x^2)$',
        },
        {
          expression: '[T] = \\begin{bmatrix}1&-1&1\\\\1&0&0\\\\1&1&1\\end{bmatrix}',
          annotation: 'Columns are the output vectors (already in the standard basis of $\\mathbb{R}^3$). This is the Vandermonde matrix for nodes $-1, 0, 1$.',
          strategyTitle: 'Assemble matrix',
          hints: ['The Vandermonde matrix arises in polynomial interpolation: if $[T]\\mathbf{c} = \\mathbf{y}$, we are finding coefficients of the polynomial through points $(-1, y_1), (0, y_2), (1, y_3)$.'],
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la6-004-1',
      title: 'Change of basis for a rotation',
      difficulty: 'medium',
      problem: 'Let $T: \\mathbb{R}^2 \\to \\mathbb{R}^2$ have standard matrix $A = \\begin{bmatrix}0&1\\\\-1&0\\end{bmatrix}$ ($90°$ counterclockwise rotation). Find the matrix of $T$ in $\\mathcal{B} = \\left\\{\\begin{bmatrix}1\\\\1\\end{bmatrix}, \\begin{bmatrix}1\\\\-1\\end{bmatrix}\\right\\}$.',
      hint: 'Form $P = [\\mathbf{b}_1 | \\mathbf{b}_2]$ (columns = new basis vectors) and compute $P^{-1}AP$.',
      walkthrough: [
        '**Change-of-basis matrix:** $P = \\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix}$ (columns are the new basis vectors).',
        '**Inverse of $P$:** $\\det(P) = -1 - 1 = -2$. $P^{-1} = \\frac{1}{-2}\\begin{bmatrix}-1&-1\\\\-1&1\\end{bmatrix} = \\begin{bmatrix}1/2&1/2\\\\1/2&-1/2\\end{bmatrix}$.',
        '**Compute $AP$:** $A\\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix} = \\begin{bmatrix}1&-1\\\\-1&-1\\end{bmatrix}$.',
        '**Compute $P^{-1}(AP)$:** $\\begin{bmatrix}1/2&1/2\\\\1/2&-1/2\\end{bmatrix}\\begin{bmatrix}1&-1\\\\-1&-1\\end{bmatrix} = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$.',
        '**Result:** $P^{-1}AP = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$ — the same $90°$ rotation matrix! This makes sense: a rotation looks the same in any orthonormal-like basis. The representation changed, but the geometric content did not.',
      ],
    },
  ],

  mentalModel: [
    'To build the matrix: apply $T$ to each basis vector, express in output basis, make them columns.',
    'Fundamental formula: $[T(\\mathbf{v})]_{\\mathcal{C}} = [T]_{\\mathcal{B}}^{\\mathcal{C}} \\cdot [\\mathbf{v}]_{\\mathcal{B}}$.',
    'Change of basis: $[T]_{\\mathcal{B}\'} = P^{-1}[T]_{\\mathcal{B}}P$ where $P$ columns are old basis in new coordinates.',
    'Composition of maps = product of matrices (in compatible bases).',
    'Diagonalization IS finding the basis where the matrix is simplest (diagonal).',
  ],

  checkpoints: [
    { id: 'cp-la6-004-1', question: 'How do you build the $j$-th column of $[T]_{\\mathcal{B}}^{\\mathcal{C}}$?', answer: 'Apply $T$ to the $j$-th basis vector of $\\mathcal{B}$, then express the result in the basis $\\mathcal{C}$.' },
    { id: 'cp-la6-004-2', question: 'What does it mean for two matrices to be similar?', answer: '$B = P^{-1}AP$ for some invertible $P$ — they represent the same linear map in different bases.' },
    { id: 'cp-la6-004-3', question: 'Why is matrix multiplication not commutative?', answer: 'It represents function composition, which is not commutative: $S \\circ T \\neq T \\circ S$ in general.' },
  ],

  assessment: {
    questions: [
      {
        id: 'assess-la6-004-1',
        type: 'computation',
        text: 'Let $T: P_2 \\to P_2$ be defined by $T(a + bx + cx^2) = b + 2cx$. Find the matrix of $T$ in the standard basis $\\{1, x, x^2\\}$, identify the kernel and image, and verify rank-nullity.',
        answer: '$T(1)=0, T(x)=1, T(x^2)=2x$. Matrix: $\\begin{bmatrix}0&1&0\\\\0&0&2\\\\0&0&0\\end{bmatrix}$. Kernel: $T(a+bx+cx^2)=0$ iff $b=0,c=0$, so $\\ker T = \\{$constants$\\}$, $\\dim(\\ker T)=1$. Image: span of $T(x)=1$ and $T(x^2)=2x$, so $\\text{im}(T) = P_1$, $\\dim=2$. Rank-nullity: $1+2=3=\\dim P_2$ ✓.',
        hint: 'Apply $T$ to each of $1, x, x^2$ and express each result in the basis $\\{1,x,x^2\\}$.',
      },
    ],
  },

  quiz: [
    {
      id: 'q-la6-004-1',
      type: 'choice',
      text: 'The $j$-th column of the matrix $[T]_{\\mathcal{B}}^{\\mathcal{C}}$ contains:',
      options: ['The $j$-th input basis vector', 'Coordinates of $T(\\mathbf{b}_j)$ in the output basis $\\mathcal{C}$', 'Coordinates of $\\mathbf{b}_j$ in the input basis $\\mathcal{B}$', 'The $j$-th eigenvalue of $T$'],
      answer: 'Coordinates of $T(\\mathbf{b}_j)$ in the output basis $\\mathcal{C}$',
      hints: ['The fundamental construction: apply $T$ to each input basis vector, express the result in the output basis. The resulting coordinate vector becomes the $j$-th column.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la6-004-2',
      type: 'choice',
      text: 'Matrices $A$ and $B$ represent the same linear transformation $T: V \\to V$ in different bases iff:',
      options: ['$AB = BA$', '$\\det A = \\det B$', '$B = P^{-1}AP$ for some invertible $P$', '$A + B = 0$'],
      answer: '$B = P^{-1}AP$ for some invertible $P$',
      hints: ['This is matrix similarity. The change-of-basis matrix $P$ converts coordinates between the old and new bases. Diagonalization is a special case: $P^{-1}AP = D$ where $P$ is the eigenvector matrix.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la6-004-3',
      type: 'choice',
      text: 'If $T: U \\to V$ has matrix $[T]$ and $S: V \\to W$ has matrix $[S]$, the matrix of $S \\circ T: U \\to W$ is:',
      options: ['$[T][S]$', '$[S][T]$', '$[S]+[T]$', '$[T]^{-1}[S]$'],
      answer: '$[S][T]$',
      hints: ['Composition goes right-to-left: $(S \\circ T)(\\mathbf{v}) = S(T(\\mathbf{v}))$. In coordinates: $[S \\circ T] = [S][T]$. Note the order: $T$ acts first, so it is on the right. Matrix multiplication does NOT commute, and neither does composition.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la6-004-4',
      type: 'choice',
      text: 'For $T: \\mathbb{R}^n \\to \\mathbb{R}^n$, which quantity is preserved under change of basis (i.e., same for all matrix representations of $T$)?',
      options: ['The individual matrix entries', 'The determinant', 'The characteristic polynomial and eigenvalues', 'Both B and C'],
      answer: 'Both B and C',
      hints: ['Similarity invariants: $\\det(P^{-1}AP) = \\det(P^{-1})\\det(A)\\det(P) = \\det(A)$. Also $\\det(P^{-1}AP - \\lambda I) = \\det(P^{-1}(A-\\lambda I)P) = \\det(A-\\lambda I)$. So both determinant and characteristic polynomial are invariants.'],
      reviewSection: 'rigor',
    },
  ],
};
