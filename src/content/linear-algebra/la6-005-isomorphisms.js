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
      problem: 'Construct an explicit isomorphism $T: M_{2\\times 2} \\to P_3$ and verify it is bijective.',
      steps: [
        {
          expression: '\\dim(M_{2\\times 2}) = 4 = \\dim(P_3)',
          annotation: '$M_{2\\times 2}$ has 4 entries; $P_3$ has basis $\\{1, x, x^2, x^3\\}$ of size 4. Isomorphism exists iff dimensions match.',
          strategyTitle: 'Check dimensions',
        },
        {
          expression: 'T\\left(\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}\\right) = a + bx + cx^2 + dx^3',
          annotation: 'Map each matrix entry to a polynomial coefficient. This is the standard basis-to-basis mapping.',
          strategyTitle: 'Define the map',
        },
        {
          expression: 'T(A+B) = T(A)+T(B), \\quad T(cA) = cT(A) \\checkmark',
          annotation: 'Linearity follows because addition and scalar multiplication are coordinatewise in both spaces.',
          strategyTitle: 'Verify linearity',
        },
        {
          expression: '\\ker(T) = \\{0\\}: \\quad T(A) = 0 \\implies a=b=c=d=0 \\implies A = 0 \\checkmark',
          annotation: 'Injective: only the zero matrix maps to the zero polynomial.',
          strategyTitle: 'Verify injectivity (trivial kernel)',
        },
        {
          expression: '\\text{Injective} + \\dim(\\text{domain}) = \\dim(\\text{codomain}) \\implies \\text{bijective} \\implies T \\text{ is an isomorphism}',
          annotation: 'By rank-nullity: injective + same-dimension domain/codomain → surjective → isomorphism.',
          strategyTitle: 'Conclude isomorphism',
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la6-005-1',
      title: 'Non-isomorphic spaces',
      difficulty: 'easy',
      problem: 'Explain why $P_2$ and $P_3$ are not isomorphic, and why $M_{2\\times 3}$ and $P_5$ are isomorphic.',
      hint: 'Compute the dimension of each space.',
      walkthrough: [
        '**$P_2$ vs $P_3$:** $\\dim(P_2) = 3$ (basis $\\{1,x,x^2\\}$) and $\\dim(P_3) = 4$ (basis $\\{1,x,x^2,x^3\\}$). Since $3 \\neq 4$, there is no bijective linear map. Any isomorphism must map bases to bases, which would require equal-size bases.',
        '**$M_{2\\times 3}$ vs $P_5$:** $\\dim(M_{2\\times 3}) = 6$ and $\\dim(P_5) = 6$. Same dimension → isomorphic. Explicit isomorphism: map each matrix entry to a polynomial coefficient: $T\\begin{bmatrix}a_{11}&a_{12}&a_{13}\\\\a_{21}&a_{22}&a_{23}\\end{bmatrix} = a_{11} + a_{12}x + a_{13}x^2 + a_{21}x^3 + a_{22}x^4 + a_{23}x^5$.',
        '**Key theorem:** Two finite-dimensional vector spaces over the same field are isomorphic if and only if they have the same dimension. Dimension is the complete invariant.',
      ],
    },
    {
      id: 'ch-la6-005-2',
      title: 'Isomorphism from evaluation',
      difficulty: 'medium',
      problem: 'Show that $T: P_2 \\to \\mathbb{R}^3$ defined by $T(p) = (p(0), p(1), p(-1))^\\top$ is an isomorphism.',
      hint: 'Find the matrix of $T$ in the standard bases and check if it is invertible.',
      walkthrough: [
        '**Matrix of $T$:** Apply to basis $\\{1, x, x^2\\}$: $T(1) = (1,1,1)^\\top$, $T(x) = (0,1,-1)^\\top$, $T(x^2) = (0,1,1)^\\top$. Matrix: $A = \\begin{bmatrix}1&0&0\\\\1&1&1\\\\1&-1&1\\end{bmatrix}$.',
        '**Determinant:** $\\det(A) = 1(1-(-1)) = 2 \\neq 0$.',
        '**Conclusion:** $A$ is invertible → $T$ is bijective → $T$ is an isomorphism. Its inverse gives polynomial interpolation: given values at $0, 1, -1$, find the unique quadratic through those points.',
      ],
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

  assessment: {
    questions: [
      {
        id: 'assess-la6-005-1',
        type: 'proof',
        text: 'Prove that any bijective linear map $T: V \\to W$ has a linear inverse. That is, if $T$ is an isomorphism, then $T^{-1}: W \\to V$ is also linear.',
        answer: 'Let $T^{-1}: W \\to V$ be the set-theoretic inverse. For any $\\mathbf{w}_1, \\mathbf{w}_2 \\in W$ and scalar $c$: Let $\\mathbf{v}_i = T^{-1}(\\mathbf{w}_i)$, so $T(\\mathbf{v}_i) = \\mathbf{w}_i$. Then $T(c\\mathbf{v}_1 + \\mathbf{v}_2) = cT(\\mathbf{v}_1) + T(\\mathbf{v}_2) = c\\mathbf{w}_1 + \\mathbf{w}_2$ (by linearity of $T$). Applying $T^{-1}$: $c\\mathbf{v}_1 + \\mathbf{v}_2 = T^{-1}(c\\mathbf{w}_1 + \\mathbf{w}_2) = cT^{-1}(\\mathbf{w}_1) + T^{-1}(\\mathbf{w}_2)$. ✓',
        hint: 'Let $\\mathbf{v}_i = T^{-1}(\\mathbf{w}_i)$ and use linearity of $T$ to show $T(c\\mathbf{v}_1 + \\mathbf{v}_2) = c\\mathbf{w}_1 + \\mathbf{w}_2$, then apply $T^{-1}$.',
      },
    ],
  },

  quiz: [
    {
      id: 'q-la6-005-1',
      type: 'choice',
      text: 'Two finite-dimensional real vector spaces are isomorphic if and only if:',
      options: ['They contain the same vectors', 'They have the same dimension', 'They have the same basis', 'One is a subspace of the other'],
      answer: 'They have the same dimension',
      hints: ['Dimension is the complete invariant: $\\dim V = \\dim W \\Leftrightarrow V \\cong W$ (over the same field). $P_3 \\cong M_{2\\times 2} \\cong \\mathbb{R}^4$ — all have dimension 4, all are isomorphic to each other.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-005-2',
      type: 'choice',
      text: 'The coordinate map $\\phi_{\\mathcal{B}}: V \\to \\mathbb{R}^n$ (sending $\\mathbf{v}$ to its $\\mathcal{B}$-coordinates) is:',
      options: ['Always injective but not surjective', 'Always surjective but not injective', 'An isomorphism', 'Linear but not bijective'],
      answer: 'An isomorphism',
      hints: ['The coordinate map is injective (different vectors have different coordinate representations) and surjective (every tuple in $\\mathbb{R}^n$ corresponds to some vector). So it is bijective and linear — an isomorphism.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-005-3',
      type: 'choice',
      text: 'Is $M_{2\\times 3} \\cong P_5$?',
      options: ['Yes — both have dimension 6', 'No — $M_{2\\times 3}$ is not a vector space', 'Yes — any two matrix spaces are isomorphic', 'No — their dimensions differ'],
      answer: 'Yes — both have dimension 6',
      hints: ['$\\dim(M_{2\\times 3}) = 2 \\times 3 = 6$. $\\dim(P_5) = 6$ (basis: $1,x,x^2,x^3,x^4,x^5$). Same dimension → isomorphic. An explicit isomorphism maps the 6 matrix entries to the 6 polynomial coefficients.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-005-4',
      type: 'choice',
      text: 'If $T: V \\to W$ is an isomorphism and $\\{\\mathbf{b}_1,\\ldots,\\mathbf{b}_n\\}$ is a basis for $V$, then $\\{T(\\mathbf{b}_1),\\ldots,T(\\mathbf{b}_n)\\}$ is:',
      options: ['A spanning set for $W$ but not necessarily independent', 'A basis for $W$', 'An independent set in $W$ but not necessarily spanning', 'Only a basis if $V = W$'],
      answer: 'A basis for $W$',
      hints: ['Isomorphisms preserve bases: bijective linear maps send independent sets to independent sets and spanning sets to spanning sets. So the image of a basis is a basis.'],
      reviewSection: 'math',
    },
  ],
};
