export default {
  id: 'la7-007',
  slug: 'householder-givens',
  chapter: 'la7',
  order: 7,
  title: 'Householder Reflections and Givens Rotations',
  subtitle: 'Two elementary orthogonal transformations — Householder reflections and Givens rotations — are the building blocks of stable numerical linear algebra. QR factorization, the QR algorithm, and least-squares solvers are all implemented using these primitives.',
  tags: ['Householder reflection', 'Givens rotation', 'orthogonal transformation', 'QR factorization', 'numerical linear algebra', 'plane rotation', 'reflector', 'stability'],
  aliases: 'Householder reflection Givens rotation orthogonal transformation QR factorization plane rotation numerical stability reflector',

  hook: {
    question: "The Gram-Schmidt process for QR factorization is elegant but numerically unstable — rounding errors accumulate and the computed columns lose orthogonality. Is there a numerically stable way to compute QR using orthogonal matrices?",
    realWorldContext: "Householder reflections and Givens rotations are the workhorses of modern numerical linear algebra. LAPACK's `dgeqrf` (QR factorization), `dgehrd` (Hessenberg reduction), and `dgees` (Schur decomposition) all use Householder reflections internally. Givens rotations are preferred for sparse matrices (they zero out one entry at a time without disturbing zeros), for parallel computing (independent rotations can be applied simultaneously), and in streaming algorithms (update a factorization when one row changes). The stability of these methods — because they use orthogonal matrices — is why modern scientific computing relies on them.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**Householder reflection: zero out a vector.** Goal: find an orthogonal matrix $H$ such that $H\\mathbf{x} = \\|\\mathbf{x}\\|\\mathbf{e}_1$. Take $\\mathbf{x} = (3,4)^\\top$, $\\|\\mathbf{x}\\| = 5$. We want $H(3,4)^\\top = (5,0)^\\top$ (or $(-5,0)^\\top$ for numerical stability). The Householder reflector is $H = I - 2\\mathbf{v}\\mathbf{v}^\\top/\\|\\mathbf{v}\\|^2$ where $\\mathbf{v} = \\mathbf{x} - \\|\\mathbf{x}\\|\\mathbf{e}_1$. Here $\\mathbf{v} = (3,4)^\\top - (-5,0)^\\top = (8,4)^\\top$ (using the negative sign for stability). $\\|\\mathbf{v}\\|^2 = 80$. $H = I - 2(8,4)^\\top(8,4)/80 = I - \\frac{1}{40}\\begin{pmatrix}64&32\\\\32&16\\end{pmatrix} = \\begin{pmatrix}-3/5&-4/5\\\\-4/5&3/5\\end{pmatrix}$. Check: $H(3,4)^\\top = (-9/5-16/5, -12/5+12/5)^\\top = (-5,0)^\\top$ ✓ (negative of target — adjust sign).',
      '**Givens rotation: zero out one entry.** A Givens rotation $G(i,j,\\theta)$ rotates the $(i,j)$ plane by angle $\\theta$ to zero the $j$-th entry of a vector. For $(a,b)^\\top$: choose $c=a/r$, $s=b/r$ where $r=\\sqrt{a^2+b^2}$. Then $\\begin{pmatrix}c&s\\\\-s&c\\end{pmatrix}\\begin{pmatrix}a\\\\b\\end{pmatrix} = \\begin{pmatrix}r\\\\0\\end{pmatrix}$. Example: $a=3$, $b=4$, $r=5$, $c=3/5$, $s=4/5$. $G^\\top(3,4)^\\top = (5,0)^\\top$ ✓. Cost: 4 multiplications and 2 additions per rotation vs $O(n)$ for a Householder step.',
      '**Householder for QR.** Apply Householder reflections column by column: $H_1$ zeros out entries below the diagonal in column 1, $H_2$ zeros entries below diagonal in column 2, etc. After $n-1$ steps (for $m\\times n$ with $m\\geq n$): $H_{n-1}\\cdots H_1 A = R$ (upper triangular), so $A = QR$ with $Q = H_1 \\cdots H_{n-1}$ (orthogonal, product of reflectors). Each reflector is stored as just the vector $\\mathbf{v}$ — the full $Q$ is never explicitly formed unless needed.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Prediction: Householder or Givens?',
        body: 'You need to compute the QR factorization of (a) a dense $500\\times 400$ matrix, and (b) a sparse tridiagonal $1000\\times 1000$ matrix. **Before deciding:** which method (Householder vs Givens) is better for each? After predicting: (a) Dense: Householder — each reflector zeros an entire column below the diagonal in one operation, $O(n^2)$ per column. Givens would need $m-1$ rotations per column. (b) Sparse tridiagonal: Givens — each rotation zeros one entry without disturbing the existing zeros, preserving sparsity. Householder would introduce fill-in.',
      },
      {
        type: 'theorem',
        title: 'Householder Reflector',
        body: 'For any nonzero $\\mathbf{x} \\in \\mathbb{R}^n$, the matrix $H = I - 2\\mathbf{v}\\mathbf{v}^\\top/\\|\\mathbf{v}\\|^2$\nwhere $\\mathbf{v} = \\mathbf{x} + \\text{sign}(x_1)\\|\\mathbf{x}\\|\\mathbf{e}_1$\n\nsatisfies: $H\\mathbf{x} = -\\text{sign}(x_1)\\|\\mathbf{x}\\|\\mathbf{e}_1$\n\nProperties: $H = H^\\top$ (symmetric), $H^2 = I$ (involutory), $H^{-1} = H$ (its own inverse), $\\det H = -1$.\n\nThe sign choice ensures $\\mathbf{v} \\neq 0$ and avoids cancellation: if $x_1 > 0$, use $+\\|\\mathbf{x}\\|$.',
      },
      {
        type: 'insight',
        title: 'Givens vs Householder: when to use each',
        body: '**Householder**: zeros an entire sub-column in one step. Best for dense matrices. Cost: $O(2mn)$ per reflector (vs $O(4mn)$ flops for Gram-Schmidt). Produces QR for $m\\times n$ matrix in $O(mn^2 - n^3/3)$ flops.\n\n**Givens**: zeros one entry per rotation. Best for sparse matrices, streaming updates, and parallel computation. Introduced in parallel as pairs of rows can rotate simultaneously.\n\n**Never use**: classical Gram-Schmidt (unstable). Use modified Gram-Schmidt only when building ONLY $Q$ incrementally.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Householder and Givens in Action',
        mathBridge: 'Implement Householder reflections and compare to Gram-Schmidt QR.',
        caption: 'Orthogonal triangularization: stable QR via reflections and rotations.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Householder QR factorization',
              prose: ['Implement Householder QR and compare orthogonality to Gram-Schmidt.'],
              code: `% Householder QR factorization
function [Q, R] = householder_qr(A)
    [m, n] = size(A)
    Q = eye(m)
    R = A
    for k = 1:min(m-1, n)
        x = R(k:m, k)
        v = x
        v(1) = x(1) + sign(x(1))*norm(x)
        if norm(v) > 1e-12
            H_k = eye(m-k+1) - 2*(v*v')/(v'*v)
            R(k:m, :) = H_k * R(k:m, :)
            Q_full = eye(m)
            Q_full(k:m, k:m) = H_k
            Q = Q * Q_full
        end
    end
end

% Test on a random matrix
A = randn(6, 4)
[Q, R] = householder_qr(A)

disp('Q^T * Q (should be identity):')
round(Q'' * Q, 6)

disp('Q * R vs A (should be 0):')
norm(Q * R - A)

disp('R (should be upper triangular):')
round(R, 4)

% Check orthogonality vs classical Gram-Schmidt
disp('Max off-diagonal of Q^T*Q:')
QTQ = Q'' * Q - eye(size(Q,1))
max(max(abs(QTQ)))
`,
            },
            {
              id: 2,
              cellTitle: 'Givens rotation for sparse update',
              prose: ['Apply a Givens rotation to zero one entry, preserving other zeros.'],
              code: `% Givens rotation: zero out one element
% G * [a; b] = [r; 0]
function G = givens(a, b)
    r = sqrt(a^2 + b^2)
    if r < 1e-14
        G = eye(2)
    else
        c = a/r
        s = b/r
        G = [c s; -s c]
    end
end

% Example: zero the (3,1) entry while preserving sparsity
A = [2 1 3;
     4 5 6;
     7 8 9;
     0 2 1]

disp('Original A:')
A

% Apply Givens to rows 1 and 3 to zero A(3,1)
G_13 = givens(A(1,1), A(3,1))
A_after = A
A_after([1,3], :) = G_13 * A([1,3], :)
disp('After zeroing (3,1):')
round(A_after, 4)

% Verify: entry (3,1) should be ~0
fprintf('A(3,1) after rotation: %.2e\\n', A_after(3,1))

% Orthogonality: G is orthogonal
fprintf('G^T*G - I: %.2e\\n', norm(G_13''*G_13 - eye(2)))
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**WY representation for efficient computation.** Storing the product $Q = H_1\\cdots H_k$ explicitly is expensive. The **WY representation** stores the product of $k$ Householder reflectors as $Q = I - WY^\\top$ where $W, Y \\in \\mathbb{R}^{m\\times k}$. This allows applying $Q$ to a matrix $B$ as $QB = B - W(Y^\\top B)$, using $2mnk$ flops (matrix-matrix multiply) instead of $2mk$ flops per reflector $k$ times. LAPACK uses blocked Householder (WY form) for cache efficiency on modern CPUs.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Cost of QR Factorization',
        body: 'For an $m \\times n$ matrix ($m \\geq n$):\n\n**Gram-Schmidt**: $2mn^2$ flops, but numerically unstable for ill-conditioned $A$.\n\n**Householder QR**: $2mn^2 - 2n^3/3$ flops (nearly the same), but orthogonality maintained to machine precision.\n\n**Givens for banded matrix** (bandwidth $b$): $O(mnb)$ flops — much cheaper when $b \\ll n$.\n\nFor large matrices, Householder is preferred due to cache-friendly blocked implementations.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Loss of orthogonality in Gram-Schmidt.** Classical Gram-Schmidt suffers from catastrophic cancellation: if two columns nearly point in the same direction, subtracting the projection gives a vector near zero, with huge relative error. Modified Gram-Schmidt (MGS) avoids this by updating projections sequentially. But even MGS loses orthogonality when $A$ is nearly rank-deficient. The loss of orthogonality in MGS is bounded by $\\|Q^\\top Q - I\\|_F \\leq c\\epsilon_{\\text{mach}}\\kappa(A)^2$, where $\\kappa(A)$ is the condition number. Householder maintains $\\|Q^\\top Q-I\\|_F \\leq c\\epsilon_{\\text{mach}}$ regardless of $\\kappa(A)$.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Updating QR When One Row Changes',
        body: 'Given $A = QR$ and a new row appended: $A\' = \\begin{pmatrix}A\\\\\\mathbf{c}^\\top\\end{pmatrix}$. Rather than recompute QR from scratch:\n1. New $R\' = \\begin{pmatrix}R\\\\\\mathbf{c}^\\top\\end{pmatrix}$ (an $n\\times n$ upper triangular matrix with one extra row)\n2. Apply $n$ Givens rotations to restore upper triangular form\n\nCost: $O(n^2)$ instead of $O(mn^2)$ from scratch. This is the key operation in online least-squares regression.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la7-007-1',
      title: 'Householder reflector that zeros a vector',
      problem: 'Find the Householder reflector $H$ such that $H(3,4,0)^\\top = (-5,0,0)^\\top$. Verify $H$ is symmetric, orthogonal, and involutory.',
      steps: [
        { explanation: '$\\mathbf{x} = (3,4,0)^\\top$, $\\|\\mathbf{x}\\| = 5$. Choose $\\mathbf{v} = \\mathbf{x} + \\text{sign}(3)\\cdot5\\cdot\\mathbf{e}_1 = (3+5,4,0)^\\top = (8,4,0)^\\top$ (using positive sign since $x_1=3>0$).' },
        { explanation: '$\\|\\mathbf{v}\\|^2 = 64+16+0=80$. $H = I_3 - \\frac{2}{80}\\mathbf{v}\\mathbf{v}^\\top = I - \\frac{1}{40}\\begin{pmatrix}64&32&0\\\\32&16&0\\\\0&0&0\\end{pmatrix} = \\begin{pmatrix}-3/5&-4/5&0\\\\-4/5&3/5&0\\\\0&0&1\\end{pmatrix}$.' },
        { explanation: 'Check $H\\mathbf{x}$: $H(3,4,0)^\\top = (-9/5-16/5, -12/5+12/5, 0) = (-5,0,0)^\\top$ ✓.' },
        { explanation: 'Symmetric: $H^\\top = H$ ✓ (inspection). Orthogonal: $H^\\top H = H^2 = I - 4\\mathbf{v}\\mathbf{v}^\\top/\\|\\mathbf{v}\\|^2 + 4\\mathbf{v}(\\mathbf{v}^\\top\\mathbf{v})\\mathbf{v}^\\top/\\|\\mathbf{v}\\|^4 = I - 4\\mathbf{v}\\mathbf{v}^\\top/80 + 4\\mathbf{v}\\mathbf{v}^\\top/80 = I$ ✓. Involutory: $H^2=I$ ✓ (just shown).' },
        { explanation: 'Determinant: $\\det H = -1$ (reflector, not rotation). The third row/column is untouched since $v_3=0$.' },
      ],
    },
    {
      id: 'ex-la7-007-2',
      title: 'Givens rotation for QR: zeroing one entry',
      problem: 'Apply Givens rotations to triangularize $A = \\begin{pmatrix}3&1\\\\4&2\\end{pmatrix}$. Step: zero the $(2,1)$ entry.',
      steps: [
        { explanation: 'Givens rotation to zero $a_{21}=4$ using $a_{11}=3$: $r = \\sqrt{9+16}=5$, $c=3/5$, $s=4/5$.' },
        { explanation: 'Rotation matrix: $G = \\begin{pmatrix}c&s\\\\-s&c\\end{pmatrix} = \\begin{pmatrix}3/5&4/5\\\\-4/5&3/5\\end{pmatrix}$.' },
        { explanation: 'Apply to $A$: $GA = \\begin{pmatrix}3/5&4/5\\\\-4/5&3/5\\end{pmatrix}\\begin{pmatrix}3&1\\\\4&2\\end{pmatrix} = \\begin{pmatrix}9/5+16/5&3/5+8/5\\\\-12/5+12/5&-4/5+6/5\\end{pmatrix} = \\begin{pmatrix}5&11/5\\\\0&2/5\\end{pmatrix}$.' },
        { explanation: '$GA = R = \\begin{pmatrix}5&2.2\\\\0&0.4\\end{pmatrix}$ (upper triangular). So $A = G^\\top R = QR$ where $Q = G^\\top = \\begin{pmatrix}3/5&-4/5\\\\4/5&3/5\\end{pmatrix}$ (orthogonal matrix of cosines and sines).' },
        { explanation: 'Verify: $QR = \\begin{pmatrix}3/5&-4/5\\\\4/5&3/5\\end{pmatrix}\\begin{pmatrix}5&11/5\\\\0&2/5\\end{pmatrix} = \\begin{pmatrix}3&11/25-8/25\\\\4&44/25+6/25\\end{pmatrix}$... let me recheck: $(1,2)$: $3/5\\cdot11/5+(-4/5)\\cdot2/5=(33-8)/25=25/25=1$ ✓. $(2,1)$: $4/5\\cdot5+3/5\\cdot0=4$ ✓. $(2,2)$: $4/5\\cdot11/5+3/5\\cdot2/5=(44+6)/25=2$ ✓. So $A=QR$ ✓.' },
      ],
    },
    {
      id: 'ex-la7-007-3',
      title: 'Householder QR for a 3×2 matrix',
      problem: 'Compute the QR factorization of $A = \\begin{pmatrix}1&2\\\\2&3\\\\2&5\\end{pmatrix}$ using one Householder reflection.',
      steps: [
        { explanation: 'Step 1: zero entries below diagonal in column 1. $\\mathbf{x} = (1,2,2)^\\top$, $\\|\\mathbf{x}\\| = 3$. $\\mathbf{v} = \\mathbf{x} + \\text{sign}(1)\\cdot3\\cdot\\mathbf{e}_1 = (1+3,2,2)^\\top = (4,2,2)^\\top$.' },
        { explanation: '$\\|\\mathbf{v}\\|^2 = 16+4+4=24$. $H_1 = I_3 - \\frac{2}{24}\\mathbf{v}\\mathbf{v}^\\top = I - \\frac{1}{12}\\begin{pmatrix}16&8&8\\\\8&4&4\\\\8&4&4\\end{pmatrix} = \\begin{pmatrix}-1/3&-2/3&-2/3\\\\-2/3&2/3&-1/3\\\\-2/3&-1/3&2/3\\end{pmatrix}$.' },
        { explanation: 'Apply to $A$: $H_1 A$. Column 1: $H_1(1,2,2)^\\top = (-3,0,0)^\\top$ ✓. Column 2: $H_1(2,3,5)^\\top$. Compute: $(-2/3\\cdot2-2/3\\cdot3-2/3\\cdot5, -2/3\\cdot2+2/3\\cdot3-1/3\\cdot5, -2/3\\cdot2-1/3\\cdot3+2/3\\cdot5)^\\top$. Wait, use $H_1 = I-\\mathbf{v}\\mathbf{v}^\\top/12$: $(H_1 c_2) = c_2 - (\\mathbf{v}^\\top c_2/12)\\mathbf{v}$. $\\mathbf{v}^\\top(2,3,5)^\\top = 8+6+10=24$. $(H_1 c_2) = (2,3,5)^\\top - (24/12)(4,2,2)^\\top = (2,3,5)^\\top - 2(4,2,2)^\\top = (-6,-1,1)^\\top$.' },
        { explanation: 'So $R = H_1 A = \\begin{pmatrix}-3&-6\\\\0&-1\\\\0&1\\end{pmatrix}$. Now step 2: apply a $2\\times2$ Householder to rows 2-3 of column 2. $\\mathbf{x}_2 = (-1,1)^\\top$, $\\|\\mathbf{x}_2\\|=\\sqrt{2}$. $\\mathbf{v}_2 = (-1-\\sqrt{2},1)^\\top$. After this second reflector, $R$ becomes fully upper triangular.' },
        { explanation: '$Q = H_1 H_2$ (product of reflectors). In practice, $Q$ is never explicitly formed — the Householder vectors are stored and applied implicitly. $A = QR$ with $Q$ orthogonal and $R$ upper triangular.' },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la7-007-1',
      title: 'Proof that Householder is orthogonal',
      difficulty: 'easy',
      prompt: 'Prove that $H = I - 2\\mathbf{v}\\mathbf{v}^\\top/\\|\\mathbf{v}\\|^2$ is both symmetric and orthogonal (hence $H^{-1} = H$).',
      hint: 'Compute $H^\\top H$ directly, using the fact that $\\mathbf{v}\\mathbf{v}^\\top$ is symmetric and $(\\mathbf{v}\\mathbf{v}^\\top)^2 = \\|\\mathbf{v}\\|^2\\mathbf{v}\\mathbf{v}^\\top$.',
      solution: 'Symmetry: $H^\\top = (I - 2\\mathbf{v}\\mathbf{v}^\\top/\\|\\mathbf{v}\\|^2)^\\top = I - 2(\\mathbf{v}\\mathbf{v}^\\top)^\\top/\\|\\mathbf{v}\\|^2 = I - 2\\mathbf{v}\\mathbf{v}^\\top/\\|\\mathbf{v}\\|^2 = H$. Orthogonality: $H^\\top H = H^2 = (I - 2P)^2$ where $P = \\mathbf{v}\\mathbf{v}^\\top/\\|\\mathbf{v}\\|^2$ is the projection. $P^2 = (\\mathbf{v}\\mathbf{v}^\\top/\\|\\mathbf{v}\\|^2)^2 = \\mathbf{v}(\\mathbf{v}^\\top\\mathbf{v})\\mathbf{v}^\\top/\\|\\mathbf{v}\\|^4 = \\mathbf{v}\\mathbf{v}^\\top/\\|\\mathbf{v}\\|^2 = P$. So $H^2 = I - 4P + 4P^2 = I - 4P + 4P = I$ ✓.',
    },
  ],

  mentalModel: [
    'Householder: $H = I - 2\\mathbf{v}\\mathbf{v}^\\top/\\|\\mathbf{v}\\|^2$. Zeros entire sub-column. Symmetric, orthogonal, involutory.',
    'Givens: $G(c,s)$ zeros ONE entry. Cost: 4 multiplications. Best for sparse matrices.',
    'QR via Householder: stable, $O(mn^2)$ flops. Never compute $Q$ explicitly unless needed.',
    'Sign choice in $\\mathbf{v}$: always choose $\\text{sign}(x_1)$ to avoid cancellation.',
    'Gram-Schmidt (modified) is $O(mn^2)$ but loses orthogonality for ill-conditioned matrices.',
  ],

  checkpoints: [
    { id: 'cp-la7-007-1', label: 'Read the Householder reflector formula and the numerical example', type: 'read' },
    { id: 'cp-la7-007-2', label: 'Read the Givens rotation construction and when to use each', type: 'read' },
    { id: 'cp-la7-007-3', label: 'Read the cost comparison: Householder vs Givens vs Gram-Schmidt', type: 'read' },
    { id: 'cp-la7-007-4', label: 'Implement Householder QR and verify orthogonality in the notebook', type: 'lab' },
    { id: 'cp-la7-007-5', label: 'Apply a Givens rotation to zero one entry in the notebook', type: 'lab' },
    { id: 'cp-la7-007-6', label: 'Trace the Householder reflector that zeros a 3D vector', type: 'example' },
    { id: 'cp-la7-007-7', label: 'Trace the Givens QR factorization of a 2×2 matrix', type: 'example' },
    { id: 'cp-la7-007-8', label: 'Prove Householder is symmetric and orthogonal', type: 'challenge' },
  ],

  assessment: 'For $\\mathbf{x} = (0, 3, 4)^\\top$: (a) find the Householder reflector $H$ that maps $\\mathbf{x}$ to $\\|\\mathbf{x}\\|\\mathbf{e}_1$; (b) verify $H$ is orthogonal; (c) apply $H$ to the matrix $A = [\\mathbf{x} | \\mathbf{y}]$ where $\\mathbf{y}=(1,2,3)^\\top$ and describe what happened to column 1.',

  quiz: [
    {
      id: 'q-la7-007-1',
      type: 'choice',
      text: 'The Householder reflector $H = I - 2\\mathbf{v}\\mathbf{v}^\\top/\\|\\mathbf{v}\\|^2$ is:',
      options: ['Symmetric but not orthogonal', 'Orthogonal but not symmetric', 'Both symmetric and orthogonal', 'Neither symmetric nor orthogonal'],
      answer: 'Both symmetric and orthogonal',
      hints: ['$H^\\top = H$ (symmetric) because $\\mathbf{v}\\mathbf{v}^\\top$ is symmetric.', '$H^2 = I$ (orthogonal) follows from $P^2=P$ for the projection $P$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-007-2',
      type: 'choice',
      text: 'The Householder vector $\\mathbf{v} = \\mathbf{x} + \\text{sign}(x_1)\\|\\mathbf{x}\\|\\mathbf{e}_1$ uses $\\text{sign}(x_1)$ to:',
      options: ['Ensure $H$ is symmetric', 'Avoid numerical cancellation when $x_1$ is large', 'Make $\\mathbf{v}$ a unit vector', 'Ensure $H\\mathbf{x}$ has positive entries'],
      answer: 'Avoid numerical cancellation when $x_1$ is large',
      hints: ['If we used $-\\text{sign}(x_1)$, then $v_1 = x_1 - \\|x\\| \\approx 0$ when $x_1 \\approx \\|x\\|$.', 'Near-cancellation loses significant digits. The sign choice keeps $|v_1| = |x_1|+\\|x\\| \\geq \\|x\\|/\\sqrt{n}$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-007-3',
      type: 'choice',
      text: 'For $\\mathbf{x}=(3,4)^\\top$ with $\\|\\mathbf{x}\\|=5$, the Householder reflector gives $H\\mathbf{x} =$',
      options: ['$(5,0)^\\top$', '$(-5,0)^\\top$', '$(0,5)^\\top$', '$(3,0)^\\top$'],
      answer: '$(-5,0)^\\top$',
      hints: ['With $\\text{sign}(x_1) = +1$: $\\mathbf{v} = (3+5,4)^\\top = (8,4)^\\top$.', '$H\\mathbf{x} = -\\text{sign}(x_1)\\|\\mathbf{x}\\|e_1 = -5e_1 = (-5,0)^\\top$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-007-4',
      type: 'choice',
      text: 'For a Givens rotation $G$ applied to zero $b$ using $a$: $c=a/r$, $s=b/r$, $r=\\sqrt{a^2+b^2}$. The result $G(a,b)^\\top$ is:',
      options: ['$(0,r)^\\top$', '$(r,0)^\\top$', '$(a,0)^\\top$', '$(0,a)^\\top$'],
      answer: '$(r,0)^\\top$',
      hints: ['$G = \\begin{pmatrix}c&s\\\\-s&c\\end{pmatrix}$.', '$(ca+sb, -sa+cb) = (a^2/r+b^2/r, -ab/r+ab/r) = (r, 0)$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-007-5',
      type: 'choice',
      text: 'The determinant of a Householder reflector $H$ is:',
      options: ['$+1$', '$-1$', '$0$', '$\\|\\mathbf{v}\\|$'],
      answer: '$-1$',
      hints: ['$H$ is an orthogonal matrix, so $\\det H = \\pm 1$.', 'A reflection reverses orientation, so $\\det H = -1$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-007-6',
      type: 'choice',
      text: 'Householder QR is numerically preferred over classical Gram-Schmidt because:',
      options: [
        'It is $O(n^2)$ faster',
        'Orthogonality is maintained to machine precision regardless of condition number',
        'It works for non-square matrices only',
        'It requires fewer floating-point operations',
      ],
      answer: 'Orthogonality is maintained to machine precision regardless of condition number',
      hints: ['Gram-Schmidt orthogonality error grows with $\\kappa(A)^2$.', 'Householder error is $O(\\epsilon_{\\text{mach}})$ regardless of conditioning.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la7-007-7',
      type: 'choice',
      text: 'Givens rotations are preferred over Householder for:',
      options: ['Dense matrices (more columns than rows)', 'Sparse matrices (to preserve sparsity)', 'Symmetric matrices', 'Matrices with rank deficiency'],
      answer: 'Sparse matrices (to preserve sparsity)',
      hints: ['Each Givens rotation zeros ONE entry, touching only two rows.', 'Householder zeros an entire column, potentially filling in sparse entries.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-007-8',
      type: 'choice',
      text: 'After applying a Householder reflector $H_1$ to zero below-diagonal entries of column 1 of $A$, the result $H_1 A$ has:',
      options: [
        'All entries in column 1 equal to zero',
        'Zero entries only below the diagonal in column 1',
        'The entire first row equal to zero',
        'All off-diagonal entries equal to zero',
      ],
      answer: 'Zero entries only below the diagonal in column 1',
      hints: ['$H_1$ is designed to map the column 1 subvector $(a_{11},\\ldots,a_{m1})^\\top$ to $(\\|\\cdot\\|,0,\\ldots,0)^\\top$.', 'The diagonal entry $r_{11} = \\|\\cdot\\|$ stays nonzero; everything below it becomes zero.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-007-9',
      type: 'choice',
      text: 'The Householder reflector $H$ satisfies $H^2 =$',
      options: ['$H$', '$2H - I$', '$I$', '$0$'],
      answer: '$I$',
      hints: ['$H$ is its own inverse (involutory).', '$H^2 = (I-2P)^2 = I - 4P + 4P^2 = I$ since $P^2=P$ for the projection.'],
      reviewSection: 'challenges',
    },
    {
      id: 'q-la7-007-10',
      type: 'choice',
      text: 'The cost of QR via Householder for an $m\\times n$ matrix ($m \\geq n$) is approximately:',
      options: ['$O(n^2)$ flops', '$O(mn)$ flops', '$O(mn^2)$ flops', '$O(m^2n)$ flops'],
      answer: '$O(mn^2)$ flops',
      hints: ['Each of $n$ Householder steps costs $O(mn)$ flops (to apply the reflector to remaining submatrix).', 'Total: $n \\times O(mn) = O(mn^2)$ flops.'],
      reviewSection: 'math',
    },
  ],

  mastery: {
    targetLevel: 3,
    solveIndependently: 'Given a vector $\\mathbf{x}$, construct the Householder reflector $H$ that maps $\\mathbf{x}$ to $\\pm\\|\\mathbf{x}\\|\\mathbf{e}_1$; for a 2×2 matrix, apply a Givens rotation to zero one entry and compute the resulting QR factorization.',
    explainVerbally: 'Explain why Householder QR is numerically more stable than Gram-Schmidt, what $\\mathbf{v}$ represents geometrically, and when Givens rotations are preferred.',
    detectIncorrectApplication: 'Catch the sign error in the Householder vector $\\mathbf{v}$ (using the wrong sign for $x_1$) which causes catastrophic cancellation for large $x_1$.',
    transferToUnfamiliar: 'Given a sparse matrix and a requirement to zero one specific entry without disturbing existing zeros, construct the appropriate Givens rotation and verify it achieves the goal.',
  },

  misconceptions: [
    {
      falseBelief: 'The Householder reflector $H\\mathbf{x}$ gives $(\\|\\mathbf{x}\\|, 0, \\ldots, 0)^\\top$ (positive).',
      whyStudentsThinkIt: 'We "want" the result to look like $\\|\\mathbf{x}\\|\\mathbf{e}_1$ with a positive leading entry. The sign convention is easy to mix up.',
      correctionExample: 'With $\\mathbf{v} = \\mathbf{x} + \\text{sign}(x_1)\\|\\mathbf{x}\\|\\mathbf{e}_1$: $H\\mathbf{x} = -\\text{sign}(x_1)\\|\\mathbf{x}\\|\\mathbf{e}_1$. For $x_1>0$: $H\\mathbf{x} = (-\\|\\mathbf{x}\\|,0,\\ldots)^\\top$ (NEGATIVE). This is intentional — we chose the sign to avoid cancellation in $v_1$.',
      contrastCase: 'If $x_1 < 0$: $\\mathbf{v} = \\mathbf{x} - \\|\\mathbf{x}\\|\\mathbf{e}_1$ and $H\\mathbf{x} = +\\|\\mathbf{x}\\|\\mathbf{e}_1$ (positive). The sign of the result alternates with the sign of $x_1$. For QR, we only care that $R$ has the correct shape — the sign of $r_{11}$ can be negative.',
    },
    {
      falseBelief: 'Givens rotations are more expensive than Householder for all matrices.',
      whyStudentsThinkIt: 'Householder zeros an entire column in one step vs Givens doing one entry at a time. Students think fewer steps = fewer flops = better.',
      correctionExample: 'For a tridiagonal matrix ($n\\times n$ with 3 diagonals): Householder QR does $n$ steps, each touching $O(n)$ entries — $O(n^2)$ total. But each step creates fill-in! Givens can process the tridiagonal structure with $O(n)$ rotations, each touching only 2 entries — $O(n)$ total.',
      contrastCase: 'For DENSE matrices, Householder wins (fewer total operations per column). For SPARSE matrices with structure (banded, triangular, tridiagonal), Givens wins by preserving zeros.',
    },
  ],

  transferPrompts: [
    {
      situation: 'An online learning system updates a linear regression model every time a new data point $(\\mathbf{x}_{\\text{new}}, y_{\\text{new}})$ arrives. The current model is stored as the QR factorization of the data matrix $X$. How do you update the factorization without recomputing from scratch?',
      competingTechniques: ['Recompute QR from scratch for the new $X$ matrix with the extra row', 'Append $\\mathbf{x}_{\\text{new}}^\\top$ to $R$ and use $n$ Givens rotations to restore upper triangular form'],
      whyThisTechniqueWins: 'The update via Givens costs $O(n^2)$ instead of $O(mn^2)$ for a full recomputation. For large datasets with many updates, this is the difference between real-time and batch processing.',
    },
    {
      situation: 'A scientific computing pipeline needs to compute the QR decomposition of a $10000 \\times 100$ matrix on a GPU, where parallelism is key. Should it use Householder or Givens?',
      competingTechniques: ['Householder QR: each step zeros a column and is inherently sequential (each step depends on the previous)', 'Givens: pairs of rows can be processed in parallel (tournament reduction pattern)'],
      whyThisTechniqueWins: 'Givens rotations can be parallelized using a "communication-avoiding" tournament reduction: in the first round, rows 1-2, 3-4, 5-6, ... are processed simultaneously. In the second round, results are combined. Total: $O(\\log m)$ parallel steps of $O(n^2)$ work each, vs Householder\'s $O(n)$ sequential steps.',
    },
  ],

  debugging: [
    {
      commonError: 'Using the wrong sign for $\\mathbf{v}$, causing catastrophic cancellation.',
      symptom: 'For $x_1 = 5$, $\\|\\mathbf{x}\\|=5.001$: student uses $\\mathbf{v} = \\mathbf{x} - \\|\\mathbf{x}\\|\\mathbf{e}_1$, giving $v_1 = 5-5.001 = -0.001$ (catastrophic cancellation — 3 significant digits lost).',
      whyItHappened: 'The formula $H\\mathbf{x} = \\|\\mathbf{x}\\|\\mathbf{e}_1$ (positive) seems more natural, leading to $\\mathbf{v} = \\mathbf{x} - \\|\\mathbf{x}\\|\\mathbf{e}_1$ — which cancels when $x_1 \\approx \\|\\mathbf{x}\\|$.',
      repairStrategy: 'Always use $\\mathbf{v} = \\mathbf{x} + \\text{sign}(x_1)\\|\\mathbf{x}\\|\\mathbf{e}_1$. Then $v_1 = x_1 + \\text{sign}(x_1)\\|\\mathbf{x}\\|$ has $|v_1| = |x_1| + \\|\\mathbf{x}\\| \\geq \\|\\mathbf{x}\\|$ — never near zero. Accept that $H\\mathbf{x}$ will be $-\\text{sign}(x_1)\\|\\mathbf{x}\\|\\mathbf{e}_1$, which is fine for QR.',
    },
    {
      commonError: 'Applying the Givens rotation to the wrong pair of rows.',
      symptom: 'Student wants to zero $A(3,1)$ using $A(1,1)$, but applies the Givens rotation to rows 1 and 2 (using $A(2,1)$ instead of $A(3,1)$).',
      whyItHappened: 'Givens rotation $G(i,j,\\theta)$ affects rows $i$ and $j$. Students mix up which row to target (the one to be zeroed) vs which row to use (the pivot row).',
      repairStrategy: 'To zero entry $(j,k)$ using entry $(i,k)$ as pivot: apply $G(i,j,\\theta)$ with $c = A(i,k)/r$, $s = A(j,k)/r$, $r = \\sqrt{A(i,k)^2+A(j,k)^2}$. The resulting rows are: row $i$ gets $r$ in position $k$, row $j$ gets $0$ in position $k$. Always verify: which entry do you want to make zero?',
    },
  ],
};
