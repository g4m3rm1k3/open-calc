export default {
  id: 'la10-001',
  slug: 'dual-spaces',
  chapter: 'la10',
  order: 1,
  title: 'Dual Spaces and Linear Functionals',
  subtitle: 'The dual space $V^*$ consists of all linear maps $V \\to \\mathbb{F}$. Every vector in $V$ has a dual counterpart; the canonical isomorphism $V \\cong V^{**}$ reveals deep structure. The transpose is the dual map.',
  tags: ['dual space', 'linear functional', 'dual basis', 'covector', 'natural isomorphism', 'transpose as dual', 'annihilator', 'duality'],
  aliases: 'dual space linear functional covector dual basis natural isomorphism double dual transpose duality annihilator row vector',

  hook: {
    question: "Why do physicists write row vectors differently from column vectors? Why does the transpose arise naturally in so many formulas? The answer is duality: row vectors and column vectors live in different (but related) spaces.",
    realWorldContext: "Duality is ubiquitous in mathematics and physics. In quantum mechanics, bra vectors $\\langle\\phi|$ (dual) and ket vectors $|\\psi\\rangle$ (original) are the foundation of the bra-ket formalism. In optimization (duality theory), the dual of a linear program gives a lower bound; strong duality means primal and dual optimal values coincide. In differential geometry, 1-forms (dual vectors) are the natural integrands in integration. In machine learning, support vectors in SVMs are dual variables.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**Linear functionals.** A **linear functional** on $V$ is a linear map $f: V \\to \\mathbb{F}$. Examples: (1) Evaluation functional: $\\text{ev}_t: p \\mapsto p(t)$ on the polynomial space $P_n$. (2) Integration: $I: f \\mapsto \\int_0^1 f(x)\\,dx$ on continuous functions. (3) In $\\mathbb{R}^n$: every linear functional has the form $f(\\mathbf{x}) = \\mathbf{a}^\\top \\mathbf{x}$ for some fixed $\\mathbf{a}$.',
      '**The dual space $V^*$.** The **dual space** of $V$ is $V^* = \\mathcal{L}(V, \\mathbb{F})$ — the set of all linear functionals on $V$. It is itself a vector space (pointwise addition and scalar multiplication). Key fact: $\\dim V^* = \\dim V$ for finite-dimensional spaces. The **dual basis** of a basis $\\{\\mathbf{e}_1, \\ldots, \\mathbf{e}_n\\}$ is $\\{\\mathbf{e}^1, \\ldots, \\mathbf{e}^n\\} \\subset V^*$ defined by $\\mathbf{e}^i(\\mathbf{e}_j) = \\delta^i_j$ (Kronecker delta). In coordinates: if $\\mathbf{v} = \\sum v_j \\mathbf{e}_j$ then $\\mathbf{e}^i(\\mathbf{v}) = v_i$ (picks out the $i$-th coordinate).',
      '**Row vectors as covectors.** In $\\mathbb{R}^n$, a column vector $\\mathbf{x}$ is a point in $\\mathbb{R}^n$. A row vector $\\mathbf{a}^\\top$ is a covector — an element of $(\\mathbb{R}^n)^*$. The action is $\\mathbf{a}^\\top(\\mathbf{x}) = \\mathbf{a}^\\top \\mathbf{x}$ (dot product). This is why $\\mathbf{a}^\\top\\mathbf{x}$ is well-typed: covector applied to vector.',
      '**The double dual $V^{**}$.** The dual of the dual: $V^{**} = (V^*)^*$. There is a natural (basis-independent) isomorphism $\\iota: V \\to V^{**}$ given by $\\iota(\\mathbf{v})(f) = f(\\mathbf{v})$ for $f \\in V^*$. This is an isomorphism for finite-dimensional $V$ (not for infinite-dimensional spaces in general).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Dual Basis Theorem',
        body: 'If $\\{\\mathbf{e}_1, \\ldots, \\mathbf{e}_n\\}$ is a basis of $V$, there exists a unique dual basis $\\{\\mathbf{e}^1, \\ldots, \\mathbf{e}^n\\}$ of $V^*$ satisfying $\\mathbf{e}^i(\\mathbf{e}_j) = \\delta^i_j$.\n\nEvery $f \\in V^*$ can be written $f = \\sum_i f(\\mathbf{e}_i)\\mathbf{e}^i$.\n\n$\\dim V = \\dim V^*$ (for finite-dimensional $V$).',
      },
      {
        type: 'insight',
        title: 'Transpose as the Dual Map',
        body: 'If $T: V \\to W$ is linear, the **dual map** (transpose) $T^*: W^* \\to V^*$ is defined by $T^*(g) = g \\circ T$ (pre-compose with $T$).\n\nIn matrix terms: if $T$ has matrix $A$, then $T^*$ has matrix $A^\\top$. This is the coordinate-free definition of the transpose.\n\nKey identity: $\\langle T\\mathbf{v}, \\mathbf{w}^* \\rangle = \\langle \\mathbf{v}, T^*\\mathbf{w}^* \\rangle$ (adjoint relation).',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Dual Basis and Linear Functionals',
        mathBridge: 'Compute dual basis vectors and verify the Kronecker delta property.',
        caption: 'Dual basis picks out coordinates: $e^i(e_j) = \\delta^i_j$.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Dual basis construction',
              prose: ['Construct the dual basis for a non-standard basis of R^3.'],
              code: `% Basis for R^3 (columns of B are basis vectors)
B = [1 1 0;
     0 1 1;
     1 0 1]
disp('Basis B (columns = basis vectors):')
B

% Dual basis: rows of B^{-T} = (B^{-1})^T
% Property: e^i(e_j) = delta_{ij}
Binv = inv(B)
dual_basis = Binv'  % rows of Binv^T = dual basis vectors (as rows)

disp('Dual basis vectors (rows):')
dual_basis

% Verify: dual_basis * B = I (Kronecker delta property)
check = dual_basis * B
disp('dual_basis * B (should be identity):')
check
`,
            },
            {
              id: 2,
              cellTitle: 'Dual map = transpose',
              prose: ['Verify that the dual map of a linear map T corresponds to the matrix transpose.'],
              code: `% Linear map T: R^3 -> R^2, matrix A
A = [1 2 3; 4 5 6]
disp('Matrix of T:')
A

% The dual map T*: (R^2)* -> (R^3)* has matrix A^T
AT = A'
disp('Matrix of dual map T* (= A^T):')
AT

% Test adjoint property: <T v, w*> = <v, T* w*>
% i.e., (Av)^T w = v^T (A^T w) for all v, w
v = [1;2;3]; w = [1;-1]
lhs = (A*v)' * w
rhs = v' * (AT*w)
disp('Adjoint check: (Av)^T w = v^T (A^T w):')
[lhs, rhs]
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Annihilator.** For a subspace $W \\subseteq V$, the **annihilator** is $W^0 = \\{f \\in V^* : f(\\mathbf{w}) = 0 \\text{ for all } \\mathbf{w} \\in W\\}$. It satisfies $\\dim W + \\dim W^0 = \\dim V$. For the matrix $A: \\mathbb{R}^n \\to \\mathbb{R}^m$: the annihilator of the column space of $A$ is the left null space (null space of $A^\\top$), confirming the rank-nullity theorem via duality.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Natural Isomorphism $V \\cong V^{**}$',
        body: 'For any finite-dimensional vector space $V$, the map $\\iota: V \\to V^{**}$ defined by $\\iota(\\mathbf{v})(f) = f(\\mathbf{v})$ is a (natural, basis-independent) isomorphism.\n\n"Natural" means: for any linear map $T: V \\to W$, the diagram $V \\xrightarrow{T} W \\xrightarrow{\\iota_W} W^{**}$ equals $V \\xrightarrow{\\iota_V} V^{**} \\xrightarrow{T^{**}} W^{**}$.\n\nFor infinite-dimensional spaces, $\\iota$ is injective but not surjective in general.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Duality in infinite dimensions.** For a Banach space $X$, the dual $X^* = \\mathcal{B}(X, \\mathbb{F})$ (bounded linear functionals). The bidual $X^{**}$ contains $X$ isometrically via $\\iota$, but $X$ may be a proper subspace of $X^{**}$ (a space for which $X = X^{**}$ is called **reflexive**). Examples: $L^p$ spaces for $1 < p < \\infty$ are reflexive; $L^1$, $L^\\infty$, and $\\ell^1$ are not. Hilbert spaces are always reflexive (Riesz representation theorem: $H^* \\cong H$).',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'LP Duality Connection',
        body: 'Linear programming duality: every LP $\\min\\mathbf{c}^\\top\\mathbf{x}$ s.t. $A\\mathbf{x} \\geq \\mathbf{b}$, $\\mathbf{x} \\geq 0$ has a dual $\\max\\mathbf{b}^\\top\\mathbf{y}$ s.t. $A^\\top\\mathbf{y} \\leq \\mathbf{c}$, $\\mathbf{y} \\geq 0$.\n\nThe dual variables $\\mathbf{y}$ are linear functionals on the constraint space.\n\nStrong duality (primal opt = dual opt when feasible) is the finite-dimensional version of the Hahn-Banach separation theorem.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la10-001-1',
      title: 'Evaluation functional',
      problem: 'In $P_2$ (polynomials of degree $\\leq 2$) with standard basis $\\{1, x, x^2\\}$, find the dual basis vector $\\mathbf{e}^2$ (which picks out the $x$ coefficient).',
      solution: '$\\mathbf{e}^2(a_0 + a_1 x + a_2 x^2) = a_1$. In terms of polynomial operations: $\\mathbf{e}^2 = $ "coefficient of $x$" functional. Explicit formula: $\\mathbf{e}^2(p) = p\'(0)$ (derivative at 0) — the dual basis vector is the derivative functional evaluated at 0.',
    },
  ],

  challenges: [
    {
      id: 'ch-la10-001-1',
      title: 'Row space is dual to column space',
      difficulty: 'medium',
      prompt: 'Show that the row space of $A$ is naturally identified with the dual of the column space of $A$ (modulo null space).',
      hint: 'Use the rank-nullity theorem and the annihilator relationship.',
      solution: 'The row space of $A$ is $\\text{rowspace}(A) = \\text{null}(A)^\\perp \\subset \\mathbb{R}^n$. Via the dual map, the row vectors act as linear functionals on $\\mathbb{R}^n$: $\\mathbf{a}_i^\\top: \\mathbf{x} \\mapsto \\mathbf{a}_i^\\top\\mathbf{x}$ vanishes on $\\text{null}(A)$. So row vectors descend to well-defined functionals on $\\mathbb{R}^n/\\text{null}(A) \\cong \\text{colspace}(A)$. Since both have dimension $r = \\text{rank}(A)$, the row space $\\cong$ dual of the column space.',
    },
  ],

  mentalModel: [
    'Dual space $V^* =$ all linear functionals $V \\to \\mathbb{F}$. Same dimension as $V$.',
    'Dual basis $\\{e^i\\}$ picks out coordinates: $e^i(e_j) = \\delta^i_j$.',
    'Row vectors are covectors — elements of $(\\mathbb{R}^n)^*$.',
    'Transpose $A^\\top$ = matrix of the dual map $T^*: W^* \\to V^*$.',
    'Double dual: $V \\cong V^{**}$ naturally (evaluation isomorphism) in finite dimensions.',
  ],

  checkpoints: [
    { id: 'cp-la10-001-1', question: 'What is the dual space $V^*$?', answer: 'The set of all linear functionals $f: V \\to \\mathbb{F}$, itself a vector space with $\\dim V^* = \\dim V$.' },
    { id: 'cp-la10-001-2', question: 'What is the dual basis?', answer: 'The basis $\\{e^1, \\ldots, e^n\\}$ of $V^*$ satisfying $e^i(e_j) = \\delta^i_j$ (Kronecker delta).' },
    { id: 'cp-la10-001-3', question: 'How is the transpose related to the dual map?', answer: 'The transpose $A^\\top$ is the matrix representation of the dual map $T^*: W^* \\to V^*$ of $T: V \\to W$.' },
  ],

  assessment: 'For the basis $B = \\{(1,1), (1,-1)\\}$ of $\\mathbb{R}^2$: (a) find the dual basis $\\{e^1, e^2\\}$, (b) verify $e^i(e_j) = \\delta^i_j$, (c) express the linear functional $f(x,y) = 2x + 3y$ in terms of the dual basis.',

  quiz: [
    { id: 'q-la10-001-1', question: 'The dual space $V^*$ consists of:', options: ['All subspaces of $V$', 'All linear maps $V \\to \\mathbb{F}$', 'The orthogonal complement of $V$', 'The inverse of $V$'], answer: 'All linear maps $V \\to \\mathbb{F}$' },
    { id: 'q-la10-001-2', question: 'For a finite-dimensional space $V$, $\\dim V^*$ equals:', options: ['$0$', '$\\dim V - 1$', '$\\dim V$', '$\\dim V^2$'], answer: '$\\dim V$' },
    { id: 'q-la10-001-3', question: 'The transpose $A^\\top$ is the matrix of:', options: ['The inverse of $T$', 'The dual map $T^*: W^* \\to V^*$', 'The adjoint in the usual inner product', 'The projection onto the column space'], answer: 'The dual map $T^*: W^* \\to V^*$' },
  ],
};
