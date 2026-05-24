export default {
  id: 'la6-003',
  slug: 'linear-transformations',
  chapter: 'la6',
  order: 3,
  title: 'Linear Transformations',
  subtitle: 'A linear transformation is any map between vector spaces that preserves addition and scalar multiplication — matrix multiplication is the coordinate version, but the concept is much broader.',
  tags: ['linear transformation', 'linear map', 'kernel', 'image', 'range', 'null space', 'rank-nullity', 'homomorphism', 'isomorphism'],
  aliases: 'linear transformation linear map kernel image range null space rank nullity homomorphism isomorphism injective surjective bijective',

  hook: {
    question: "Matrix multiplication maps $\\mathbb{R}^n \\to \\mathbb{R}^m$. But what about differentiation? Integration? Fourier transform? Are these the same kind of operation?",
    realWorldContext: "Linear transformations are the abstract generalization of matrix multiplication. Differentiation $D: P_n \\to P_{n-1}$ is a linear transformation: $D(f + g) = D(f) + D(g)$ and $D(cf) = cD(f)$. The Fourier transform is a linear map on $L^2$ that sends functions to their frequency representations. In quantum mechanics, every observable is a self-adjoint linear operator. Image compression (JPEG, wavelet) uses linear transformations. Understanding maps abstractly — without coordinates — gives geometric insight that raw matrix computation obscures.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**Definition.** A function $T: V \\to W$ between vector spaces is a **linear transformation** if:\n(1) $T(\\mathbf{u} + \\mathbf{v}) = T(\\mathbf{u}) + T(\\mathbf{v})$ (preserves addition)\n(2) $T(c\\mathbf{v}) = cT(\\mathbf{v})$ (preserves scalar multiplication)\n\nEquivalently: $T(c\\mathbf{u} + d\\mathbf{v}) = cT(\\mathbf{u}) + dT(\\mathbf{v})$ for all scalars $c, d$.',
      '**Key structural maps.** The **kernel** (or null space) of $T$ is $\\ker(T) = \\{\\mathbf{v} \\in V : T(\\mathbf{v}) = \\mathbf{0}_W\\}$ — the set of vectors that get mapped to zero. The **image** (or range) is $\\text{im}(T) = \\{T(\\mathbf{v}) : \\mathbf{v} \\in V\\} \\subseteq W$ — the set of all possible outputs. Both the kernel and image are subspaces (of $V$ and $W$ respectively).',
      '**Rank-nullity for linear transformations.** $\\dim(\\ker T) + \\dim(\\text{im } T) = \\dim V$. This is the abstract version of the rank-nullity theorem. The "rank" of $T$ is $\\dim(\\text{im } T)$ and the "nullity" is $\\dim(\\ker T)$.',
      '**From abstract to matrix.** Given a linear transformation $T: V \\to W$ and bases $\\mathcal{B}$ for $V$ and $\\mathcal{C}$ for $W$, there is a unique matrix $[T]_{\\mathcal{B}}^{\\mathcal{C}}$ that represents $T$ in those coordinates: $[T(\\mathbf{v})]_{\\mathcal{C}} = [T]_{\\mathcal{B}}^{\\mathcal{C}} [\\mathbf{v}]_{\\mathcal{B}}$. Every linear transformation between finite-dimensional spaces is represented by a matrix — once you pick bases.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Injective, Surjective, Bijective',
        body: '$T$ is **injective** (one-to-one) iff $\\ker(T) = \\{\\mathbf{0}\\}$ (distinct inputs give distinct outputs)\n$T$ is **surjective** (onto) iff $\\text{im}(T) = W$ (every output is reachable)\n$T$ is **bijective** (isomorphism) iff both — then $T$ has an inverse $T^{-1}: W \\to V$\n\nFor finite-dimensional $V$ and $W$ of the same dimension: injective $\\Leftrightarrow$ surjective $\\Leftrightarrow$ bijective.',
      },
      {
        type: 'insight',
        title: 'Differentiation as a Linear Map',
        body: '$D: P_n \\to P_{n-1}$, $D(p) = p\'$\n$\\ker(D) = P_0 = \\{$constants$\\}$ (dim 1 — constant polynomials have zero derivative)\n$\\text{im}(D) = P_{n-1}$ (dim $n$ — every polynomial of degree ≤ $n-1$ is a derivative)\nRank-Nullity: $1 + n = n+1 = \\dim P_n$ ✓',
      },
      {
        type: 'warning',
        title: 'Linear Does NOT Mean "Passes Through Origin"',
        body: 'Translation $T(\\mathbf{v}) = \\mathbf{v} + \\mathbf{c}$ (for $\\mathbf{c} \\neq \\mathbf{0}$) is NOT a linear transformation: $T(\\mathbf{0}) = \\mathbf{c} \\neq \\mathbf{0}$. A linear transformation must always satisfy $T(\\mathbf{0}) = \\mathbf{0}$. This eliminates all affine (but non-linear) maps.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Kernel and Image of a Linear Map',
        mathBridge: 'Find the kernel and image of matrix transformations.',
        caption: 'Kernel = what gets destroyed; image = what can be reached.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Kernel and image via RREF',
              prose: ['For T: R^4 -> R^3 given by matrix A, find ker(T) and im(T).'],
              code: `A = [1 2 -1 3;
     2 4  0 6;
     1 2  1 3]
disp('RREF of A:')
rref(A)
r = rank(A)
disp('Rank (= dim of image):')
r
disp('Nullity (= dim of kernel = n - rank):')
nullity = 4 - r
disp('Basis for kernel (null(A)):')
null(A)
disp('Basis for image (pivot columns of A):')
A(:, [1 3])
`,
            },
            {
              id: 2,
              cellTitle: 'Matrix representation of differentiation',
              prose: ['Represent D: P_3 -> P_2 (differentiation) as a matrix using standard bases.'],
              code: `% Basis for P_3: {1, x, x^2, x^3}  (columns)
% Basis for P_2: {1, x, x^2}         (rows)
% D(1) = 0, D(x) = 1, D(x^2) = 2x, D(x^3) = 3x^2
% In coordinate form:
% D(1) = [0;0;0], D(x) = [1;0;0], D(x^2) = [0;2;0], D(x^3) = [0;0;3]
D_matrix = [0 1 0 0;
            0 0 2 0;
            0 0 0 3]
disp('D_matrix: applies differentiation as matrix mult')
disp('D(x^3) in coordinates:')
D_matrix * [0;0;0;1]  % should be [0;0;3] = 3x^2
disp('Kernel: null space of D (constant polynomials)')
null(D_matrix)
disp('Rank of D = dim(image):')
rank(D_matrix)
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Proof that kernel is a subspace.** (1) $T(\\mathbf{0}) = T(0 \\cdot \\mathbf{0}) = 0 T(\\mathbf{0}) = \\mathbf{0}$, so $\\mathbf{0} \\in \\ker T$. (2) If $T(\\mathbf{u}) = T(\\mathbf{v}) = \\mathbf{0}$, then $T(\\mathbf{u}+\\mathbf{v}) = T(\\mathbf{u})+T(\\mathbf{v}) = \\mathbf{0}$. (3) $T(c\\mathbf{v}) = cT(\\mathbf{v}) = c\\mathbf{0} = \\mathbf{0}$.',
      '**Matrix representation.** Fix ordered bases $\\mathcal{B} = (\\mathbf{b}_1, \\ldots, \\mathbf{b}_n)$ for $V$ and $\\mathcal{C} = (\\mathbf{c}_1, \\ldots, \\mathbf{c}_m)$ for $W$. The matrix $[T]$ has $j$-th column = coordinate vector of $T(\\mathbf{b}_j)$ in the basis $\\mathcal{C}$. This is the **standard construction** that turns any linear map between finite-dimensional spaces into a matrix.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Rank-Nullity for Linear Maps',
        body: 'For $T: V \\to W$ with $V$ finite-dimensional:\n$\\dim(\\ker T) + \\dim(\\text{im } T) = \\dim V$\n\nThis generalizes the Rank-Nullity theorem for matrices to arbitrary linear maps.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Category theory perspective.** Linear transformations are the morphisms in the category **Vect**$_\\mathbb{F}$ of vector spaces. Isomorphisms are the invertible morphisms. The category has products ($V \\times W$), coproducts (direct sum $V \\oplus W$), and internal Hom-sets ($\\text{Hom}(V,W)$ — itself a vector space). The natural transformations between Hom functors correspond to bilinear maps, leading to tensor products.',
      '**Dual space.** The dual space $V^* = \\text{Hom}(V, \\mathbb{F})$ is the space of all linear functionals $\\phi: V \\to \\mathbb{F}$. For finite-dimensional $V$, $V^* \\cong V$ (non-canonically — requires a basis). For infinite-dimensional spaces, $V^*$ can be strictly larger. The dual map $T^*: W^* \\to V^*$ defined by $T^*(\\phi)(v) = \\phi(T(v))$ is the transpose operation at the abstract level.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Change of Basis and Similarity',
        body: 'If $T: V \\to V$ is a linear map and you change the basis from $\\mathcal{B}$ to $\\mathcal{B}\'$, the matrix representation changes by: $[T]_{\\mathcal{B}\'} = P^{-1} [T]_{\\mathcal{B}} P$ where $P$ is the change-of-basis matrix. This is the matrix similarity $A \\sim B$ you saw in diagonalization — two matrices represent the same linear map in different bases iff they are similar.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la6-003-1',
      title: 'Integration as a linear map',
      problem: 'Show that $T: P_2 \\to P_3$, $T(p) = \\int_0^x p(t)\\,dt$ is linear and find its matrix representation.',
      solution: 'Linearity: $T(ap+bq) = \\int_0^x (ap+bq)\\,dt = a\\int_0^x p\\,dt + b\\int_0^x q\\,dt = aT(p) + bT(q)$. Matrix (columns = $T(1), T(x), T(x^2)$ in basis $\\{1,x,x^2,x^3\\}$ for $P_3$): $T(1) = x, T(x) = x^2/2, T(x^2) = x^3/3$. Matrix $= \\begin{bmatrix}0&0&0\\\\1&0&0\\\\0&1/2&0\\\\0&0&1/3\\end{bmatrix}$.',
    },
  ],

  challenges: [
    {
      id: 'ch-la6-003-1',
      title: 'Rank-Nullity for differentiation',
      difficulty: 'easy',
      prompt: 'Let $T: P_5 \\to P_4$ be differentiation. Find $\\dim(\\ker T)$, $\\dim(\\text{im } T)$, and verify rank-nullity.',
      hint: 'What polynomials have zero derivative?',
      solution: '$\\ker T = P_0$ (constants), $\\dim(\\ker T) = 1$. $\\text{im } T = P_4$, $\\dim(\\text{im } T) = 5$. Rank-Nullity: $1 + 5 = 6 = \\dim P_5$. ✓',
    },
  ],

  mentalModel: [
    'Linear map = preserves addition and scalar multiplication.',
    'Kernel = what gets sent to zero (like null space for matrices).',
    'Image = set of all outputs (like column space for matrices).',
    'Every linear map between finite-dim spaces has a matrix representation (once you pick bases).',
    'Same map, different bases → similar matrices.',
  ],

  checkpoints: [
    { id: 'cp-la6-003-1', question: 'What two properties define a linear transformation?', answer: 'Preserves addition: $T(\\mathbf{u}+\\mathbf{v}) = T(\\mathbf{u})+T(\\mathbf{v})$; preserves scalar mult: $T(c\\mathbf{v}) = cT(\\mathbf{v})$.' },
    { id: 'cp-la6-003-2', question: 'Is the kernel of a linear map always a subspace?', answer: 'Yes — it contains 0 and is closed under addition and scalar multiplication.' },
    { id: 'cp-la6-003-3', question: 'What does the rank-nullity theorem say for linear maps?', answer: '$\\dim(\\ker T) + \\dim(\\text{im } T) = \\dim V$.' },
  ],

  assessment: 'For $T: P_3 \\to P_3$ defined by $T(p) = p + p\'$ (add derivative to the polynomial), find the matrix representation in the basis $\\{1, x, x^2, x^3\\}$, the kernel, and the image.',

  quiz: [
    { id: 'q-la6-003-1', question: 'A linear transformation must satisfy:', options: ['$T(\\mathbf{u} \\cdot \\mathbf{v}) = T(\\mathbf{u}) \\cdot T(\\mathbf{v})$', '$T(c\\mathbf{u}+d\\mathbf{v}) = cT(\\mathbf{u})+dT(\\mathbf{v})$', '$T(\\mathbf{u}+\\mathbf{v}) = T(\\mathbf{u}) \\cdot T(\\mathbf{v})$', '$T(\\mathbf{v}) = A\\mathbf{v}$ for some matrix'], answer: '$T(c\\mathbf{u}+d\\mathbf{v}) = cT(\\mathbf{u})+dT(\\mathbf{v})$' },
    { id: 'q-la6-003-2', question: '$T$ is injective iff:', options: ['$\\text{im}(T) = W$', '$\\ker(T) = \\{\\mathbf{0}\\}$', '$T$ is surjective', '$\\dim V = \\dim W$'], answer: '$\\ker(T) = \\{\\mathbf{0}\\}$' },
    { id: 'q-la6-003-3', question: 'Differentiation $D: P_5 \\to P_4$ has nullity:', options: ['0', '1', '4', '5'], answer: '1' },
  ],
};
