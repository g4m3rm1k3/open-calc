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
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Linear Maps as Matrices',
        mathBridge: 'Build matrix representations of differentiation and integration, verify rank-nullity, and see how change-of-basis affects the matrix.',
        caption: 'Every linear map between finite-dimensional spaces is secretly a matrix.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cell_type: 'code',
              source: `import numpy as np

# Matrix representation of differentiation D: P_3 -> P_3, T(p) = p + p'
# Basis {1, x, x^2, x^3}
# T(1)    = 1 + 0    = 1 + 0x + 0x^2 + 0x^3    -> [1,0,0,0]
# T(x)    = x + 1    = 1 + 1x + 0x^2 + 0x^3    -> [1,1,0,0]
# T(x^2)  = x^2+2x   = 0 + 2x + 1x^2 + 0x^3   -> [0,2,1,0]
# T(x^3)  = x^3+3x^2 = 0 + 0x + 3x^2 + 1x^3   -> [0,0,3,1]

T_matrix = np.array([
    [1., 1., 0., 0.],   # columns = T(basis vectors) in terms of basis
    [0., 1., 2., 0.],
    [0., 0., 1., 3.],
    [0., 0., 0., 1.],
])

print("Matrix of T(p) = p + p' in basis {1, x, x^2, x^3}:")
print(T_matrix)
print()

# Apply T to p(x) = 2 + 3x - x^2
p_coords = np.array([2., 3., -1., 0.])
Tp_coords = T_matrix @ p_coords
print(f"p = 2 + 3x - x^2  in coordinates: {p_coords}")
print(f"T(p) in coordinates: {Tp_coords}")
print(f"  = {Tp_coords[0]} + {Tp_coords[1]}x + {Tp_coords[2]}x^2 + {Tp_coords[3]}x^3")
print()

# Verify: T(p) = p + p' = (2+3x-x^2) + (3-2x) = 5+x-x^2
print("Manual check: p + p' = (2+3x-x^2) + (3-2x) = 5 + 1x - 1x^2")
print("Matches:", np.allclose(Tp_coords, [5., 1., -1., 0.]))
`,
            },
            {
              id: 2,
              cell_type: 'code',
              source: `import numpy as np

# Rank-nullity for differentiation D: P_4 -> P_3
# Matrix of D in basis {1, x, x^2, x^3, x^4} for domain, {1,x,x^2,x^3} for codomain
# D(1)=0, D(x)=1, D(x^2)=2x, D(x^3)=3x^2, D(x^4)=4x^3

D = np.array([
    [0., 1., 0., 0., 0.],  # coefficient of 1 in D(basis_j)
    [0., 0., 2., 0., 0.],  # coefficient of x
    [0., 0., 0., 3., 0.],  # coefficient of x^2
    [0., 0., 0., 0., 4.],  # coefficient of x^3
])

print("Differentiation matrix D: P_4 -> P_3")
print(D)
print()

rank_D = np.linalg.matrix_rank(D)
nullity_D = D.shape[1] - rank_D  # n - rank

print(f"rank(D) = dim(im D) = {rank_D}  (= dim(P_3), D is surjective)")
print(f"nullity(D) = dim(ker D) = {nullity_D}  (= 1, only constants have zero derivative)")
print(f"rank + nullity = {rank_D + nullity_D} = {D.shape[1]} = dim(P_4) ✓")
print()

# Find kernel basis (null space)
U, S, Vt = np.linalg.svd(D)
kernel_basis = Vt[rank_D:].T
print("Kernel basis (should be constant polynomials [1,0,0,0,0]):")
print(kernel_basis.round(10))
`,
            },
          ],
        },
      },
    ],
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
      title: 'Integration as a linear map: matrix representation',
      problem: 'Show $T: P_2 \\to P_3$, $T(p) = \\int_0^x p(t)\\,dt$ is linear and find its matrix in the standard bases.',
      steps: [
        {
          expression: 'T(ap + bq) = \\int_0^x (ap+bq)\\,dt = a\\int_0^x p\\,dt + b\\int_0^x q\\,dt = aT(p) + bT(q)',
          annotation: 'Linearity follows from the linearity of integration. Both conditions (additive + scalar) are captured together.',
          strategyTitle: 'Verify linearity',
        },
        {
          expression: 'T(1) = \\int_0^x 1\\,dt = x, \\quad T(x) = \\int_0^x t\\,dt = \\frac{x^2}{2}, \\quad T(x^2) = \\int_0^x t^2\\,dt = \\frac{x^3}{3}',
          annotation: 'Apply $T$ to each basis vector of $P_2$.',
          strategyTitle: 'Compute $T$ on basis vectors',
        },
        {
          expression: '[T(1)]_{P_3} = \\begin{bmatrix}0\\\\1\\\\0\\\\0\\end{bmatrix}, \\quad [T(x)]_{P_3} = \\begin{bmatrix}0\\\\0\\\\1/2\\\\0\\end{bmatrix}, \\quad [T(x^2)]_{P_3} = \\begin{bmatrix}0\\\\0\\\\0\\\\1/3\\end{bmatrix}',
          annotation: 'Express each output in the basis $\\{1, x, x^2, x^3\\}$ of $P_3$. These become the columns of the matrix.',
          strategyTitle: 'Coordinate vectors in the output basis',
        },
        {
          expression: '[T] = \\begin{bmatrix}0&0&0\\\\1&0&0\\\\0&1/2&0\\\\0&0&1/3\\end{bmatrix}',
          annotation: 'Columns are the coordinate vectors of $T(1), T(x), T(x^2)$. This $4\\times 3$ matrix represents integration from $P_2$ to $P_3$.',
          strategyTitle: 'Assemble matrix',
          hints: ['Verify: $[T] \\cdot [2+3x-x^2] = [T] \\cdot [2,3,-1]^\\top = [0, 2, 3/2, -1/3]^\\top$, meaning $T(2+3x-x^2) = 2x + \\frac{3}{2}x^2 - \\frac{1}{3}x^3$. Check: $\\int_0^x (2+3t-t^2)dt = 2x + \\frac{3}{2}x^2 - \\frac{1}{3}x^3$ ✓'],
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la6-003-1',
      title: 'Rank-Nullity for $T(p) = p + p\'$',
      difficulty: 'medium',
      problem: 'For $T: P_3 \\to P_3$ defined by $T(p) = p + p\'$ (add derivative), find the matrix in the basis $\\{1,x,x^2,x^3\\}$, the kernel, the image, and verify rank-nullity.',
      hint: '$T(1) = 1$, $T(x) = x+1$, $T(x^2) = x^2+2x$, $T(x^3) = x^3+3x^2$. Write each as a coordinate vector in the same basis $\\{1,x,x^2,x^3\\}$.',
      walkthrough: [
        '**Matrix:** Columns = $[T(b_j)]$ in basis $\\{1,x,x^2,x^3\\}$: $[T] = \\begin{bmatrix}1&1&0&0\\\\0&1&2&0\\\\0&0&1&3\\\\0&0&0&1\\end{bmatrix}$.',
        '**Kernel:** Solve $[T]\\mathbf{c} = \\mathbf{0}$. Since $[T]$ is upper triangular with all diagonal entries $= 1$, its determinant is 1, so $[T]$ is invertible. The kernel is $\\{\\mathbf{0}\\}$.',
        '**Image:** Since $[T]$ is invertible ($\\det = 1$), the image is all of $\\mathbb{R}^4$ in coordinates, meaning $\\text{im}(T) = P_3$. $T$ is an isomorphism.',
        '**Rank-Nullity:** $\\dim(\\ker T) + \\dim(\\text{im } T) = 0 + 4 = 4 = \\dim P_3$ ✓.',
        '**Interpretation:** Adding the derivative of a polynomial never destroys information — you can always recover $p$ from $p + p\'$ (by inverting the operator $I + D$).',
      ],
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

  assessment: {
    questions: [
      {
        id: 'assess-la6-003-1',
        type: 'computation',
        text: 'For $T: P_2 \\to P_2$ defined by $T(p) = xp\'(x)$ (multiply derivative by $x$): (a) Show $T$ is linear. (b) Find the matrix in basis $\\{1,x,x^2\\}$. (c) Find $\\ker(T)$ and $\\text{im}(T)$.',
        answer: '(a) $T(ap+bq) = x(ap+bq)\' = x(ap\'+bq\') = axp\' + bxq\' = aT(p)+bT(q)$ ✓. (b) $T(1) = x \\cdot 0 = 0$, $T(x) = x \\cdot 1 = x$, $T(x^2) = x \\cdot 2x = 2x^2$. Matrix: $\\begin{bmatrix}0&0&0\\\\0&1&0\\\\0&0&2\\end{bmatrix}$. (c) $\\ker T = \\{$constants$\\}$ (constants have zero derivative), $\\dim(\\ker T) = 1$. $\\text{im}(T) = \\text{Span}\\{x, x^2\\}$, $\\dim = 2$. Rank-Nullity: $1 + 2 = 3 = \\dim P_2$ ✓.',
        hint: 'For part (b): $T$ maps 1 to 0, $x$ to $x$, $x^2$ to $2x^2$.',
      },
    ],
  },

  quiz: [
    {
      id: 'q-la6-003-1',
      type: 'choice',
      text: 'A linear transformation $T: V \\to W$ must satisfy:',
      options: [
        '$T(\\mathbf{u} \\cdot \\mathbf{v}) = T(\\mathbf{u}) \\cdot T(\\mathbf{v})$',
        '$T(c\\mathbf{u}+d\\mathbf{v}) = cT(\\mathbf{u})+dT(\\mathbf{v})$ for all scalars $c,d$',
        '$T(\\mathbf{u}+\\mathbf{v}) = T(\\mathbf{u}) \\cdot T(\\mathbf{v})$',
        '$T$ must be invertible',
      ],
      answer: '$T(c\\mathbf{u}+d\\mathbf{v}) = cT(\\mathbf{u})+dT(\\mathbf{v})$ for all scalars $c,d$',
      hints: ['The single condition $T(c\\mathbf{u}+d\\mathbf{v}) = cT(\\mathbf{u})+dT(\\mathbf{v})$ combines both linearity properties. Setting $d=0$ gives homogeneity; setting $c=d=1$ gives additivity.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-003-2',
      type: 'choice',
      text: '$T: V \\to W$ is injective (one-to-one) if and only if:',
      options: ['$\\text{im}(T) = W$', '$\\ker(T) = \\{\\mathbf{0}\\}$', '$T$ is surjective', '$\\dim V = \\dim W$'],
      answer: '$\\ker(T) = \\{\\mathbf{0}\\}$',
      hints: ['Injective means distinct inputs give distinct outputs. For linear maps this is equivalent to trivial kernel: if $T(\\mathbf{u}) = T(\\mathbf{v})$ then $T(\\mathbf{u}-\\mathbf{v}) = \\mathbf{0}$, so $\\mathbf{u}-\\mathbf{v} \\in \\ker T = \\{0\\}$, giving $\\mathbf{u}=\\mathbf{v}$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-003-3',
      type: 'choice',
      text: 'Differentiation $D: P_5 \\to P_4$ has nullity (dimension of kernel):',
      options: ['0', '1', '4', '5'],
      answer: '1',
      hints: ['$\\ker(D) = \\{$polynomials with zero derivative$\\} = \\{$constants$\\} = P_0$. $\\dim(P_0) = 1$. Rank-Nullity: $\\text{rank}(D) + 1 = 6 = \\dim(P_5)$, so $\\text{rank}(D) = 5 = \\dim(P_4)$ — $D$ is surjective.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-003-4',
      type: 'choice',
      text: 'Two matrix representations of the same linear map $T: V \\to V$ in different bases are related by:',
      options: ['$[T]_{\\mathcal{B}\'} = [T]_{\\mathcal{B}} + P$', '$[T]_{\\mathcal{B}\'} = P^{-1} [T]_{\\mathcal{B}} P$', '$[T]_{\\mathcal{B}\'} = P [T]_{\\mathcal{B}} P^\\top$', '$[T]_{\\mathcal{B}\'} = P [T]_{\\mathcal{B}}$'],
      answer: '$[T]_{\\mathcal{B}\'} = P^{-1} [T]_{\\mathcal{B}} P$',
      hints: ['This is matrix similarity: $A \\sim B$ iff $B = P^{-1}AP$ for some invertible $P$. Similarity means "same linear map, different coordinate systems." Diagonalization $A = PDP^{-1}$ is exactly finding the basis where $[T]$ is diagonal.'],
      reviewSection: 'rigor',
    },
  ],
};
