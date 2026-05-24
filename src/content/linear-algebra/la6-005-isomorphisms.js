export default {
  id: 'la6-005',
  slug: 'isomorphisms',
  chapter: 'la6',
  order: 5,
  title: 'Isomorphisms of Vector Spaces',
  subtitle: 'Two vector spaces are isomorphic if there is a bijective linear map between them. Isomorphic spaces are structurally identical — you can transport every linear algebra fact between them.',
  tags: ['isomorphism', 'bijective', 'invertible linear map', 'coordinate isomorphism', 'natural isomorphism', 'same dimension', 'structure-preserving'],
  aliases: 'isomorphism bijective invertible linear map coordinate isomorphism natural isomorphism dimension structure preserving',

  hook: {
    question: "We said $P_2 \\cong \\mathbb{R}^3$ and $M_{2\\times 2} \\cong \\mathbb{R}^4$. But what does $\\cong$ actually mean — and why does having the same dimension guarantee it?",
    realWorldContext: "Isomorphisms are the mathematical notion of 'same structure, different labels.' In quantum mechanics, different representations of a quantum system (position space vs momentum space — related by the Fourier transform) are isomorphic Hilbert spaces. In data science, any feature vector space you work with is isomorphic to $\\mathbb{R}^n$ — which is why you can always do linear algebra on it. In cryptography, the isomorphism between the integers mod $p$ and $\\mathbb{F}_p$ is the foundation of almost all public-key systems. Understanding when two spaces are 'the same' prevents duplication of effort.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**Definition.** A linear transformation $T: V \\to W$ is an **isomorphism** if it is bijective (both injective and surjective). When an isomorphism exists, we write $V \\cong W$.',
      '**The grand theorem.** For finite-dimensional vector spaces over the same field: $V \\cong W$ if and only if $\\dim V = \\dim W$. Dimension is the ONLY invariant — if two spaces have the same dimension, they are isomorphic. Every $n$-dimensional vector space over $\\mathbb{R}$ is isomorphic to $\\mathbb{R}^n$.',
      '**How to construct an isomorphism.** Given $V$ with basis $(\\mathbf{b}_1, \\ldots, \\mathbf{b}_n)$: define $T: V \\to \\mathbb{R}^n$ by $T(c_1\\mathbf{b}_1 + \\cdots + c_n\\mathbf{b}_n) = (c_1, \\ldots, c_n)^\\top$. This "coordinate map" is always an isomorphism. It is well-defined (because the basis representation is unique), linear (by direct verification), injective (only $\\mathbf{0}$ maps to $\\mathbf{0}$), and surjective (every coordinate vector is achieved).',
      '**Natural vs basis-dependent.** The coordinate isomorphism $V \\cong \\mathbb{R}^n$ requires a choice of basis. Change the basis, change the isomorphism. A **natural isomorphism** would work the same way regardless of basis. For example, $V \\cong V^{**}$ (double dual) is natural — no basis needed.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Classification of Finite-Dimensional Spaces',
        body: 'Over the same field $\\mathbb{F}$:\n$V \\cong W \\Leftrightarrow \\dim V = \\dim W$\n\nConsequently: Every $n$-dimensional space over $\\mathbb{R}$ is isomorphic to $\\mathbb{R}^n$. Dimension is the COMPLETE invariant of finite-dimensional vector spaces.',
      },
      {
        type: 'insight',
        title: 'Isomorphisms Preserve All Linear Algebra',
        body: 'If $T: V \\to W$ is an isomorphism:\n• Linearly independent sets in $V$ map to linearly independent sets in $W$\n• Bases in $V$ map to bases in $W$\n• $\\dim V = \\dim W$\n• Subspaces correspond bijectively\n• Dimension of subspaces is preserved\n\nAn isomorphism is a "dictionary" that translates all linear algebra between the two spaces.',
      },
      {
        type: 'insight',
        title: 'Inverse of an Isomorphism',
        body: 'If $T: V \\to W$ is an isomorphism, then $T^{-1}: W \\to V$ is also a linear map (and an isomorphism). This is not obvious! Proof: for $T^{-1}(\\mathbf{u}+\\mathbf{v})$, write $\\mathbf{u} = T(\\mathbf{a})$, $\\mathbf{v} = T(\\mathbf{b})$. Then $T^{-1}(\\mathbf{u}+\\mathbf{v}) = T^{-1}(T(\\mathbf{a}+\\mathbf{b})) = \\mathbf{a}+\\mathbf{b} = T^{-1}(\\mathbf{u}) + T^{-1}(\\mathbf{v})$.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Coordinate Isomorphism in Action',
        mathBridge: 'Use the coordinate map to translate between abstract and concrete linear algebra.',
        caption: 'The coordinate isomorphism converts abstract problems into matrix problems.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Isomorphism: P2 to R^3',
              prose: ['Show the coordinate map phi: P_2 -> R^3 is linear and invertible.'],
              code: `% phi: a + bx + cx^2 -> [a; b; c]
% Basis for P_2: {1, x, x^2}

% phi(3 + 2x - x^2) = [3; 2; -1]
p = [3; 2; -1]

% phi^{-1}([3;2;-1]) = 3 + 2x - x^2 (abstract, shown as coeffs)
p_inv = p   % same thing in R^3

% Linearity: phi(p1 + p2) = phi(p1) + phi(p2)
p1 = [1; 2; 3];  p2 = [4; -1; 0]
phi_sum = p1 + p2
phi_p1_plus_p2 = p1 + p2
disp('phi(p1+p2) = phi(p1) + phi(p2):')
norm(phi_sum - phi_p1_plus_p2) < 1e-9

disp('Coordinate map is a bijection R^3 <-> P_2')
disp('Any computation in R^3 translates to P_2 and back')
`,
            },
            {
              id: 2,
              cellTitle: 'Translating a linear algebra question',
              prose: ['Are p1 = 1+x, p2 = 1+x^2, p3 = x+x^2 linearly independent in P_2?'],
              code: `% Translate via phi: coordinate vectors
v1 = [1; 1; 0]  % 1 + x
v2 = [1; 0; 1]  % 1 + x^2
v3 = [0; 1; 1]  % x + x^2

M = [v1, v2, v3]
disp('Matrix of coordinate vectors:')
M
disp('RREF to check independence:')
rref(M)
r = rank(M)
if r == 3
    disp('Rank 3 -> linearly independent in P_2!')
else
    disp('Rank < 3 -> linearly dependent')
end
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Proof of the classification theorem.** ($\\Rightarrow$) Isomorphisms preserve linear independence and spanning — so they map bases to bases, preserving dimension. ($\\Leftarrow$) If $\\dim V = \\dim W = n$, pick bases $\\mathcal{B}$ for $V$ and $\\mathcal{C}$ for $W$. Define $T: V \\to W$ by $T(\\mathbf{b}_j) = \\mathbf{c}_j$ and extend linearly. This $T$ maps a basis to a basis, so it is bijective. $\\square$',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Isomorphism Criterion for Linear Maps',
        body: 'For $T: V \\to W$ with $\\dim V = \\dim W < \\infty$, these are equivalent:\n1. $T$ is an isomorphism\n2. $T$ is injective ($\\ker T = \\{\\mathbf{0}\\}$)\n3. $T$ is surjective ($\\text{im } T = W$)\n4. $T$ maps a basis to a basis\n5. The matrix of $T$ (in any bases) is invertible',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Automorphisms.** An isomorphism $T: V \\to V$ (from a space to itself) is called an **automorphism**. The set of all automorphisms of $V$ forms a group under composition: the **general linear group** $GL(V)$. For $V = \\mathbb{R}^n$, $GL(\\mathbb{R}^n) \\cong GL(n, \\mathbb{R})$ = group of invertible $n\\times n$ real matrices. Automorphisms are the "symmetries" of the vector space.',
      '**Functorial isomorphisms.** The canonical isomorphism $V \\cong V^{**}$ sends $\\mathbf{v} \\mapsto (\\phi \\mapsto \\phi(\\mathbf{v}))$. This is a natural transformation between the identity functor and the double-dual functor, valid for all finite-dimensional $V$ simultaneously. In contrast, $V \\cong V^*$ requires choosing an inner product or a basis.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Every finite-dim space IS R^n, up to isomorphism',
        body: 'When you "pick a basis," you are literally constructing the coordinate isomorphism $V \\xrightarrow{\\sim} \\mathbb{R}^n$. The entire theory of $\\mathbb{R}^n$ — rank, null space, determinants, eigenvalues — applies to $V$ once you pick a basis. The choice of basis is a "gauge choice" that does not affect the underlying geometry.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la6-005-1',
      title: 'Isomorphism between $M_{2\\times 2}$ and $P_3$',
      problem: 'Construct an isomorphism $T: M_{2\\times 2} \\to P_3$.',
      solution: 'Use the standard bases: $E_{11} = \\begin{bmatrix}1&0\\\\0&0\\end{bmatrix}, E_{12}, E_{21}, E_{22}$ for $M_{2\\times 2}$ and $\\{1, x, x^2, x^3\\}$ for $P_3$. Define $T(E_{11}) = 1, T(E_{12}) = x, T(E_{21}) = x^2, T(E_{22}) = x^3$ and extend linearly. Both have dimension 4, so $T$ is an isomorphism.',
    },
  ],

  challenges: [
    {
      id: 'ch-la6-005-1',
      title: 'Non-isomorphic spaces',
      difficulty: 'easy',
      prompt: 'Explain why $P_2$ and $P_3$ are not isomorphic, even though both are spaces of polynomials.',
      hint: 'What is the dimension of each?',
      solution: '$\\dim P_2 = 3$ and $\\dim P_3 = 4$. Since the dimensions differ, they are not isomorphic. Any bijective linear map would have to preserve dimension (bijections map bases to bases), which is impossible.',
    },
    {
      id: 'ch-la6-005-2',
      title: 'Constructing an isomorphism',
      difficulty: 'medium',
      prompt: 'Let $W = \\{A \\in M_{2\\times 2} : A^\\top = A\\}$ (symmetric $2 \\times 2$ matrices). Find an isomorphism $T: W \\to \\mathbb{R}^3$.',
      hint: 'Find a basis for $W$ first, then map basis vectors to standard basis vectors of $\\mathbb{R}^3$.',
      solution: 'Basis for $W$: $B_1 = \\begin{bmatrix}1&0\\\\0&0\\end{bmatrix}, B_2 = \\begin{bmatrix}0&1\\\\1&0\\end{bmatrix}, B_3 = \\begin{bmatrix}0&0\\\\0&1\\end{bmatrix}$. Define $T(aB_1 + bB_2 + cB_3) = (a,b,c)^\\top$. This is linear and bijective — an isomorphism.',
    },
  ],

  mentalModel: [
    'Isomorphism = bijective linear map. Same structure, different packaging.',
    'Two finite-dim spaces over the same field are isomorphic iff they have the same dimension.',
    'Coordinate map = canonical isomorphism: pick basis → get $V \\cong \\mathbb{R}^n$.',
    'Isomorphisms preserve independence, bases, dimension, subspace structure — everything linear.',
  ],

  checkpoints: [
    { id: 'cp-la6-005-1', question: 'What must be true for two finite-dimensional vector spaces to be isomorphic?', answer: 'They must have the same dimension (over the same field).' },
    { id: 'cp-la6-005-2', question: 'Is $P_5 \\cong \\mathbb{R}^5$? Why or why not?', answer: 'No — $\\dim P_5 = 6$ while $\\dim \\mathbb{R}^5 = 5$. They are not isomorphic.' },
    { id: 'cp-la6-005-3', question: 'If $T: V \\to W$ is an isomorphism, is $T^{-1}$ linear?', answer: 'Yes — the inverse of a linear bijection is always linear.' },
  ],

  assessment: 'Prove that the map $T: P_2 \\to \\mathbb{R}^3$ defined by $T(p) = (p(0), p(1), p(-1))^\\top$ is an isomorphism. (Hint: find its matrix and check invertibility.)',

  quiz: [
    { id: 'q-la6-005-1', question: 'Two finite-dimensional real vector spaces are isomorphic iff:', options: ['They contain the same vectors', 'They have the same dimension', 'They have the same basis', 'One is a subspace of the other'], answer: 'They have the same dimension' },
    { id: 'q-la6-005-2', question: 'The coordinate map $T: V \\to \\mathbb{R}^n$ (sending $\\mathbf{v}$ to its coordinates in a fixed basis) is:', options: ['Always injective but not surjective', 'Always surjective but not injective', 'An isomorphism', 'Linear but not bijective'], answer: 'An isomorphism' },
    { id: 'q-la6-005-3', question: 'Is $M_{2\\times 3} \\cong P_5$?', options: ['Yes, both have dimension 6', 'No, $M_{2\\times 3}$ is not a vector space', 'Yes, any two matrix spaces are isomorphic', 'No, their dimensions differ'], answer: 'Yes, both have dimension 6' },
  ],
};
