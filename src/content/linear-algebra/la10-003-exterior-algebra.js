export default {
  id: 'la10-003',
  slug: 'exterior-algebra',
  chapter: 'la10',
  order: 3,
  title: 'Exterior Algebra and Determinants',
  subtitle: 'The wedge product $\\mathbf{v}_1 \\wedge \\cdots \\wedge \\mathbf{v}_k$ measures oriented $k$-dimensional volume. The determinant is the top-degree wedge product. Differential forms are dual wedge products — the foundation of integration on manifolds.',
  tags: ['exterior algebra', 'wedge product', 'determinant', 'differential forms', 'volume form', 'alternating multilinear', 'Grassmann algebra', 'orientation'],
  aliases: 'exterior algebra wedge product alternating multilinear determinant volume form differential forms Grassmann algebra orientation integration manifold',

  hook: {
    question: "Why does the determinant satisfy $\\det(AB) = \\det(A)\\det(B)$ and $\\det$ changes sign when two rows are swapped? These properties aren\'t coincidences — they follow from a single algebraic structure: the exterior algebra.",
    realWorldContext: "The exterior algebra is the algebraic foundation of differential geometry and modern physics. Maxwell\'s equations in their natural form are written using differential forms (wedge products on spacetime). The integral theorems (Green\'s, Stokes\', Gauss\') become a single formula $\\int_M d\\omega = \\int_{\\partial M} \\omega$. In robotics and computer vision, the wedge product computes cross products and oriented areas. In algebraic topology, homology groups are computed using the exterior algebra.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**The need for orientation.** The area of a parallelogram spanned by $\\mathbf{u}$ and $\\mathbf{v}$ is $\\|\\mathbf{u} \\times \\mathbf{v}\\|$. But we want a signed area that captures orientation: counterclockwise is positive, clockwise is negative. The wedge product $\\mathbf{u} \\wedge \\mathbf{v}$ encodes both magnitude and orientation.',
      '**The wedge product.** The wedge product is **alternating**: $\\mathbf{v} \\wedge \\mathbf{u} = -(\\mathbf{u} \\wedge \\mathbf{v})$. In particular, $\\mathbf{v} \\wedge \\mathbf{v} = 0$ (zero area for degenerate parallelogram). The wedge product of $k$ vectors lives in $\\Lambda^k V$ (the $k$-th exterior power). For $n$-dimensional $V$: $\\dim \\Lambda^k V = \\binom{n}{k}$. The top space $\\Lambda^n V$ has dimension 1 (the determinant lives here).',
      '**Determinant as volume.** For $n$ vectors $\\mathbf{v}_1, \\ldots, \\mathbf{v}_n$ in $\\mathbb{R}^n$: $\\mathbf{v}_1 \\wedge \\cdots \\wedge \\mathbf{v}_n = \\det[\\mathbf{v}_1 | \\cdots | \\mathbf{v}_n] \\cdot (\\mathbf{e}_1 \\wedge \\cdots \\wedge \\mathbf{e}_n)$. The signed volume of the parallelepiped is $\\det[\\mathbf{v}_1 | \\cdots | \\mathbf{v}_n]$. Sign = orientation (positive if the frame is right-handed, negative if left-handed).',
      '**Differential forms.** A $k$-form on $\\mathbb{R}^n$ is a smooth assignment of an element of $\\Lambda^k(\\mathbb{R}^n)^*$ to each point. Example: the 1-form $dx$ satisfies $dx(\\partial/\\partial x) = 1$, $dx(\\partial/\\partial y) = 0$. A 2-form like $dx \\wedge dy$ measures oriented area in the $xy$-plane. Integration of $k$-forms over $k$-dimensional surfaces gives the integral theorems.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Determinant from Wedge Product',
        body: 'The determinant is the unique alternating multilinear form on $\\mathbb{R}^n$ with $\\det(I) = 1$. Equivalently:\n\n$\\det A = $ coefficient of $\\mathbf{e}_1 \\wedge \\cdots \\wedge \\mathbf{e}_n$ in $A\\mathbf{e}_1 \\wedge \\cdots \\wedge A\\mathbf{e}_n$\n\nThe three determinant properties follow:\n- Alternating (swap rows → sign change): $\\mathbf{v}_i \\wedge \\mathbf{v}_j = -\\mathbf{v}_j \\wedge \\mathbf{v}_i$\n- Multilinear in each row\n- $\\det I = 1$',
      },
      {
        type: 'insight',
        title: 'Exterior Powers and Gram Determinant',
        body: 'The $k$-dimensional volume of the parallelepiped spanned by $\\mathbf{v}_1, \\ldots, \\mathbf{v}_k$ in $\\mathbb{R}^n$ is:\n\n$\\text{Vol}_k = \\|\\mathbf{v}_1 \\wedge \\cdots \\wedge \\mathbf{v}_k\\| = \\sqrt{\\det(V^\\top V)}$\n\nwhere $V = [\\mathbf{v}_1 | \\cdots | \\mathbf{v}_k]$ and $G = V^\\top V$ is the **Gram matrix**.\n\n$\\sqrt{\\det G}$ = Gram determinant. This formula appears in multi-variable integration (change of variables, Jacobians).',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Wedge Products and Determinants',
        mathBridge: 'Compute determinants as volumes and explore exterior algebra properties.',
        caption: 'Determinant = signed volume of parallelepiped = alternating multilinear form.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Determinant as oriented area',
              prose: ['Verify that the determinant gives signed area/volume and satisfies alternating property.'],
              code: `% 2D: det gives signed area of parallelogram
u = [3; 1]
v = [1; 2]
A = [u, v]

% Signed area = det
area_signed = det(A)
disp('Signed area of parallelogram (u,v):')
area_signed
area_unsigned = abs(area_signed)
disp('Unsigned area:')
area_unsigned

% Swap u and v: sign changes
area_swapped = det([v, u])
disp('Swapped (should negate):')
area_swapped

% 3D volume
a = [1;0;0]; b=[0;2;0]; c=[0;0;3]
vol = det([a,b,c])
disp('Volume of box (should be 1*2*3=6):')
vol
`,
            },
            {
              id: 2,
              cellTitle: 'Gram determinant for k-volume',
              prose: ['Compute the k-dimensional volume of a parallelotope using the Gram determinant.'],
              code: `% Volume of parallelogram in R^3 spanned by 2 vectors
% (result lives in a 2D plane, 2D volume)
v1 = [1; 2; 0]
v2 = [0; 1; 3]
V = [v1, v2]

% Gram matrix G = V^T V
G = V' * V
disp('Gram matrix:')
G

% k-dimensional volume = sqrt(det(G))
vol_2d = sqrt(det(G))
disp('2D volume (area) in R^3:')
vol_2d

% Cross-check via cross product (only works in R^3)
cross_prod = cross(v1, v2)
area_cross = norm(cross_prod)
disp('Area via cross product:')
area_cross

% They should agree
disp('Difference (should be 0):')
abs(vol_2d - area_cross)
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Exterior power basis.** For $V = \\mathbb{R}^n$ with basis $\\{\\mathbf{e}_1, \\ldots, \\mathbf{e}_n\\}$: the basis of $\\Lambda^k V$ is $\\{\\mathbf{e}_{i_1} \\wedge \\cdots \\wedge \\mathbf{e}_{i_k} : i_1 < \\cdots < i_k\\}$. This has $\\binom{n}{k}$ elements. Any $\\mathbf{v}_1 \\wedge \\cdots \\wedge \\mathbf{v}_k$ can be written as a linear combination of these basis elements, with coefficients equal to the $k \\times k$ minors of the matrix $[\\mathbf{v}_1 | \\cdots | \\mathbf{v}_k]$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Plücker Relations',
        body: 'The $k$-vectors (elements of $\\Lambda^k V$) that come from actual $k$-tuples of vectors in $V$ are called **decomposable**. A general element of $\\Lambda^k V$ may not be decomposable (for $k \\geq 2$, $n \\geq 4$).\n\nThe Plücker embedding identifies the Grassmannian $\\text{Gr}(k,n)$ (set of $k$-planes in $\\mathbb{R}^n$) with a subvariety of $\\mathbb{P}(\\Lambda^k \\mathbb{R}^n)$ via $W \\mapsto \\mathbf{w}_1 \\wedge \\cdots \\wedge \\mathbf{w}_k$ (for any basis $\\{\\mathbf{w}_i\\}$ of $W$).',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Stokes\' theorem unifies everything.** Let $\\omega$ be a smooth $(k-1)$-form and $M$ a compact $k$-dimensional manifold with boundary $\\partial M$. Then $\\int_M d\\omega = \\int_{\\partial M} \\omega$. This single formula specializes to: the fundamental theorem of calculus ($k=1$), Green\'s theorem ($k=2$ in $\\mathbb{R}^2$), classical Stokes\' theorem ($k=2$ in $\\mathbb{R}^3$), and the divergence theorem ($k=3$). The exterior derivative $d$ and the wedge product are the algebraic machinery behind all of these.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Hodge Star and Duality',
        body: 'On a Riemannian manifold with volume form $\\text{vol}$, the **Hodge star** $\\star: \\Lambda^k V \\to \\Lambda^{n-k} V$ satisfies $\\alpha \\wedge \\star\\beta = \\langle\\alpha,\\beta\\rangle \\cdot \\text{vol}$.\n\nIn $\\mathbb{R}^3$: $\\star(dx) = dy \\wedge dz$, $\\star(dy \\wedge dz) = dx$. The cross product $\\mathbf{u} \\times \\mathbf{v} = \\star(\\mathbf{u} \\wedge \\mathbf{v})$.\n\nHodge decomposition: every $k$-form = exact + co-exact + harmonic. Used in numerical PDE, fluid simulation, and the Laplacian on forms.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la10-003-1',
      title: 'Wedge product in $\\mathbb{R}^3$',
      problem: 'Compute $(2\\mathbf{e}_1 + \\mathbf{e}_2) \\wedge (\\mathbf{e}_1 + 3\\mathbf{e}_3)$ in $\\Lambda^2\\mathbb{R}^3$.',
      solution: 'Expand using bilinearity and $\\mathbf{e}_i \\wedge \\mathbf{e}_i = 0$, $\\mathbf{e}_j \\wedge \\mathbf{e}_i = -\\mathbf{e}_i \\wedge \\mathbf{e}_j$: $= 2\\mathbf{e}_1 \\wedge \\mathbf{e}_1 + 6\\mathbf{e}_1 \\wedge \\mathbf{e}_3 + \\mathbf{e}_2 \\wedge \\mathbf{e}_1 + 3\\mathbf{e}_2 \\wedge \\mathbf{e}_3 = 0 + 6\\mathbf{e}_1 \\wedge \\mathbf{e}_3 - \\mathbf{e}_1 \\wedge \\mathbf{e}_2 + 3\\mathbf{e}_2 \\wedge \\mathbf{e}_3$. Via Hodge star, this corresponds to the cross product $(2,1,0)^\\top \\times (1,0,3)^\\top = (3, -6, -1)^\\top$.',
    },
  ],

  challenges: [
    {
      id: 'ch-la10-003-1',
      title: 'Alternating property proves det swap',
      difficulty: 'medium',
      prompt: 'Using only the alternating property $\\mathbf{v} \\wedge \\mathbf{v} = 0$, prove that $\\mathbf{u} \\wedge \\mathbf{v} = -(\\mathbf{v} \\wedge \\mathbf{u})$. Then explain why swapping two rows of a determinant changes its sign.',
      hint: 'Expand $(\\mathbf{u} + \\mathbf{v}) \\wedge (\\mathbf{u} + \\mathbf{v}) = 0$ by linearity.',
      solution: 'By alternating: $(\\mathbf{u}+\\mathbf{v}) \\wedge (\\mathbf{u}+\\mathbf{v}) = 0$. Expand: $\\mathbf{u}\\wedge\\mathbf{u} + \\mathbf{u}\\wedge\\mathbf{v} + \\mathbf{v}\\wedge\\mathbf{u} + \\mathbf{v}\\wedge\\mathbf{v} = 0$. Since $\\mathbf{u}\\wedge\\mathbf{u} = \\mathbf{v}\\wedge\\mathbf{v} = 0$: $\\mathbf{u}\\wedge\\mathbf{v} + \\mathbf{v}\\wedge\\mathbf{u} = 0$, so $\\mathbf{u}\\wedge\\mathbf{v} = -(\\mathbf{v}\\wedge\\mathbf{u})$. For the determinant: swapping two rows in $[\\mathbf{v}_1|\\cdots|\\mathbf{v}_n]$ swaps the corresponding factors in $\\mathbf{v}_1 \\wedge \\cdots \\wedge \\mathbf{v}_n$, flipping the sign.',
    },
  ],

  mentalModel: [
    '$\\mathbf{u} \\wedge \\mathbf{v}$: oriented area. $\\mathbf{u} \\wedge \\mathbf{v} = -(\\mathbf{v} \\wedge \\mathbf{u})$. $\\mathbf{u} \\wedge \\mathbf{u} = 0$.',
    '$\\Lambda^k V$ has dimension $\\binom{n}{k}$. $\\Lambda^n V$ is 1D — determinant lives here.',
    'Determinant = top-degree wedge = signed $n$-volume. Properties follow from wedge product axioms.',
    'Gram determinant $\\sqrt{\\det V^\\top V}$ = $k$-dimensional volume in $\\mathbb{R}^n$.',
    'Differential forms = wedge products varying smoothly. Stokes\' theorem unifies all integral theorems.',
  ],

  checkpoints: [
    { id: 'cp-la10-003-1', question: 'What is $\\mathbf{v} \\wedge \\mathbf{v}$?', answer: '$0$ (zero, since the wedge product is alternating).' },
    { id: 'cp-la10-003-2', question: 'What is $\\dim \\Lambda^k V$ for $\\dim V = n$?', answer: '$\\binom{n}{k}$.' },
    { id: 'cp-la10-003-3', question: 'How is the determinant related to the wedge product?', answer: '$\\det[\\mathbf{v}_1|\\cdots|\\mathbf{v}_n]$ is the coefficient when $\\mathbf{v}_1 \\wedge \\cdots \\wedge \\mathbf{v}_n$ is expressed in terms of $\\mathbf{e}_1 \\wedge \\cdots \\wedge \\mathbf{e}_n$.' },
  ],

  assessment: 'For $\\mathbf{u} = (1,2,0)^\\top$ and $\\mathbf{v} = (0,1,3)^\\top$: (a) compute the Gram matrix and the 2D area they span in $\\mathbb{R}^3$; (b) verify this equals $\\|\\mathbf{u} \\times \\mathbf{v}\\|$.',

  quiz: [
    { id: 'q-la10-003-1', question: 'The wedge product $\\mathbf{u} \\wedge \\mathbf{v}$ satisfies:', options: ['$\\mathbf{u} \\wedge \\mathbf{v} = \\mathbf{v} \\wedge \\mathbf{u}$', '$\\mathbf{u} \\wedge \\mathbf{v} = -\\mathbf{v} \\wedge \\mathbf{u}$', '$\\mathbf{u} \\wedge \\mathbf{v} = \\|\\mathbf{u}\\|\\|\\mathbf{v}\\|$', '$\\mathbf{u} \\wedge \\mathbf{v} \\in \\mathbb{R}$'], answer: '$\\mathbf{u} \\wedge \\mathbf{v} = -\\mathbf{v} \\wedge \\mathbf{u}$' },
    { id: 'q-la10-003-2', question: '$\\dim \\Lambda^2(\\mathbb{R}^4)$ equals:', options: ['$2$', '$4$', '$6$', '$8$'], answer: '$6$' },
    { id: 'q-la10-003-3', question: 'The $k$-dimensional volume of vectors $\\mathbf{v}_1,\\ldots,\\mathbf{v}_k$ is:', options: ['$\\det[\\mathbf{v}_i]$', '$\\sqrt{\\det(V^\\top V)}$', '$\\|\\mathbf{v}_1\\|\\cdots\\|\\mathbf{v}_k\\|$', '$\\text{tr}(V^\\top V)$'], answer: '$\\sqrt{\\det(V^\\top V)}$' },
  ],
};
