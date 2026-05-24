export default {
  id: 'la6-002',
  slug: 'basis-and-dimension',
  chapter: 'la6',
  order: 2,
  title: 'Basis and Dimension',
  subtitle: 'A basis is a minimal spanning set — or equivalently, a maximal independent set. The number of vectors in any basis is the dimension: an intrinsic property of the space that never changes.',
  tags: ['basis', 'dimension', 'spanning set', 'linear independence', 'coordinates', 'standard basis', 'infinite-dimensional', 'Hamel basis'],
  aliases: 'basis dimension spanning set linear independence coordinates standard basis infinite dimensional Hamel',

  hook: {
    question: "How many vectors do you need to describe every element of a vector space, with no redundancy? That number is the dimension — and it is the same no matter which basis you choose.",
    realWorldContext: "Dimension is one of the most fundamental quantities in mathematics. In machine learning, the dimensionality of your feature space determines model complexity and the curse of dimensionality. In quantum mechanics, the dimension of the Hilbert space is the number of independent quantum states. In signal processing, a bandlimited signal of bandwidth $W$ sampled over time $T$ lies in a vector space of dimension $\\approx 2WT$ (Nyquist-Shannon). In control theory, the number of state variables is the dimension of the state space — it determines how many sensors and actuators you need.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**What a basis is.** A set $\\{\\mathbf{b}_1, \\ldots, \\mathbf{b}_n\\}$ of vectors in a vector space $V$ is a **basis** if (1) the set spans $V$ — every element of $V$ is a linear combination — and (2) the set is linearly independent — no element is a combination of the others. Either condition alone is not enough: a spanning set might have redundant vectors; an independent set might not reach all of $V$.',
      '**Uniqueness of coefficients.** If $\\{\\mathbf{b}_1, \\ldots, \\mathbf{b}_n\\}$ is a basis, every $\\mathbf{v} \\in V$ can be written uniquely as $\\mathbf{v} = c_1 \\mathbf{b}_1 + \\cdots + c_n \\mathbf{b}_n$. The scalars $(c_1, \\ldots, c_n)$ are the **coordinates** of $\\mathbf{v}$ with respect to this basis. Different bases give different coordinate representations of the same vector.',
      '**Dimension is basis-independent.** The most important theorem about bases: every basis of a vector space has the same number of elements. This common number is the **dimension** of $V$. It does not matter which basis you use — any two bases have the same size. This is the theorem that makes "dimension" a well-defined property of $V$, not just of a particular basis.',
      '**Standard examples.** $\\dim \\mathbb{R}^n = n$ (standard basis $\\mathbf{e}_1, \\ldots, \\mathbf{e}_n$). $\\dim P_n = n+1$ (basis $1, x, x^2, \\ldots, x^n$). $\\dim M_{m\\times n} = mn$ (basis of matrices with a single 1 and rest 0s). $\\dim C[a,b] = \\infty$ (no finite basis exists).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'All Bases Have the Same Size',
        body: 'If $V$ has a finite basis, then every basis of $V$ contains exactly the same number of vectors. This number is $\\dim V$.\n\nConsequently:\n• Any spanning set of size $\\dim V$ is a basis\n• Any independent set of size $\\dim V$ is a basis\n• You only need to check ONE of the two conditions if you know the set has the right size',
      },
      {
        type: 'insight',
        title: 'Basis Hunting Strategy',
        body: 'To find a basis for a subspace $W$:\n**Method 1:** Find the null space or column space, extract pivot columns.\n**Method 2:** Write the general element with free parameters, pull out each coefficient vector.\n**Method 3:** Start with too many vectors, reduce using Gram-Schmidt or row reduction.',
      },
      {
        type: 'insight',
        title: 'Dimension Formulas',
        body: 'For a subspace $W \\subseteq V$:\n$\\dim W \\leq \\dim V$\n$\\dim W = \\dim V \\Leftrightarrow W = V$\n\nRank-Nullity: $\\text{rank}(A) + \\text{nullity}(A) = n$ (columns of $A$)\n$\\dim(W_1 + W_2) = \\dim W_1 + \\dim W_2 - \\dim(W_1 \\cap W_2)$',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Bases for Polynomial and Matrix Spaces',
        mathBridge: 'Find bases and compute coordinates in abstract spaces.',
        caption: 'The dimension is the number of independent directions — regardless of the objects involved.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Basis for the symmetric 2x2 matrices',
              prose: ['Symmetric 2x2 matrices form a 3-dimensional subspace of M_2x2. Find a basis.'],
              code: `% General symmetric 2x2: [a b; b c]
% = a*[1 0;0 0] + b*[0 1;1 0] + c*[0 0;0 1]
B1 = [1 0; 0 0]
B2 = [0 1; 1 0]
B3 = [0 0; 0 1]
disp('Three basis matrices for Sym(2x2):')
B1
B2
B3
disp('Dimension of Sym(2x2): 3')
disp('Verify: any symmetric matrix is in span')
a = 3; b = -1; c = 2;
A = [a b; b c]
A_reconstructed = a*B1 + b*B2 + c*B3
`,
            },
            {
              id: 2,
              cellTitle: 'Finding the basis of a subspace via RREF',
              prose: ['Subspace W = {p in P_2 : p(1) = 0}. Find a basis.'],
              code: `% p(x) = a + bx + cx^2 with p(1) = a + b + c = 0
% So a = -b - c. General element: (-b-c) + bx + cx^2
%   = b(-1+x) + c(-1+x^2)
% Basis: {-1+x, -1+x^2} as coefficient vectors
p1 = [-1; 1; 0]  % -1 + x
p2 = [-1; 0; 1]  % -1 + x^2

disp('Check they span: any (-b-c, b, c) = b*p1 + c*p2')
b = 2; c = -3;
coef = (b)*p1 + (c)*p2
expected = [-b-c; b; c]
disp('Are they equal?')
norm(coef - expected) < 1e-9

disp('Dimension of W: 2')
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Proof that all bases have the same size (finite case).** Suppose $B = \\{\\mathbf{b}_1, \\ldots, \\mathbf{b}_m\\}$ and $C = \\{\\mathbf{c}_1, \\ldots, \\mathbf{c}_n\\}$ are both bases. We will show $m = n$. Since $B$ spans $V$ and $C$ is linearly independent, by the Steinitz Exchange Lemma, $n \\leq m$. Symmetrically, $m \\leq n$. Therefore $m = n$.',
      '**Extending to a basis.** Any linearly independent subset of a finite-dimensional vector space can be extended to a basis. Any spanning set can be reduced to a basis. Both operations preserve the eventual size $= \\dim V$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Steinitz Exchange Lemma',
        body: 'If $V$ is spanned by $m$ vectors, then any linearly independent set has at most $m$ vectors.\n\nConsequence: in a space of dimension $n$:\n• Any $n+1$ vectors are linearly dependent\n• Any $n$ independent vectors form a basis\n• Any $n$ spanning vectors form a basis',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Infinite-dimensional spaces.** Not every vector space has a finite basis. $P = \\bigcup_n P_n$ (all polynomials) has a countably infinite basis $\\{1, x, x^2, \\ldots\\}$, called a Hamel basis. $C[0,1]$ (continuous functions) also has a Hamel basis, but it requires the Axiom of Choice to prove its existence — no explicit basis can be written down. For analysis, the relevant notion is a Schauder basis (allowing infinite linear combinations), which relates to completeness of the space.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Basis vs Schauder Basis',
        body: 'Hamel basis: finite linear combinations only. Every vector space has one (AC).\nSchauder basis: infinite series allowed. Only makes sense in topological vector spaces (normed, Hilbert). Trigonometric functions $\\{1, \\cos(nx), \\sin(nx)\\}$ are a Schauder basis for $L^2[-\\pi, \\pi]$ but NOT a Hamel basis.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la6-002-1',
      title: 'Basis for $P_2$',
      problem: 'Is $\\{1+x, 1-x, x^2\\}$ a basis for $P_2$?',
      solution: 'Three vectors in a 3-dimensional space. Check independence: $a(1+x) + b(1-x) + cx^2 = 0$ gives $a+b = 0$, $a-b = 0$, $c = 0$, so $a = b = c = 0$. Independent! Size = dim = 3 → it\'s a basis.',
    },
  ],

  challenges: [
    {
      id: 'ch-la6-002-1',
      title: 'Dimension of intersection',
      difficulty: 'medium',
      prompt: 'Let $W_1 = \\text{Span}\\{\\mathbf{v}_1, \\mathbf{v}_2\\}$ and $W_2 = \\text{Span}\\{\\mathbf{v}_2, \\mathbf{v}_3\\}$ in $\\mathbb{R}^3$ where $\\mathbf{v}_1, \\mathbf{v}_2, \\mathbf{v}_3$ are linearly independent. Find $\\dim(W_1 + W_2)$ and $\\dim(W_1 \\cap W_2)$.',
      hint: 'Use the dimension formula $\\dim(W_1 + W_2) = \\dim W_1 + \\dim W_2 - \\dim(W_1 \\cap W_2)$.',
      solution: '$\\dim W_1 = 2$, $\\dim W_2 = 2$. $W_1 + W_2 = \\text{Span}\\{\\mathbf{v}_1, \\mathbf{v}_2, \\mathbf{v}_3\\} = \\mathbb{R}^3$, so $\\dim(W_1 + W_2) = 3$. Formula: $3 = 2 + 2 - \\dim(W_1 \\cap W_2)$, so $\\dim(W_1 \\cap W_2) = 1$. (Intersection is $\\text{Span}\\{\\mathbf{v}_2\\}$.)',
    },
  ],

  mentalModel: [
    'Basis = independent spanning set. The two properties are always in tension: add a vector → might lose independence; remove a vector → might lose span.',
    'Dimension = number of vectors in any basis. It never changes regardless of which basis you choose.',
    'To find a basis of a subspace: parameterize with free variables and read off the spanning vectors.',
    'Dimension ≤ ambient dimension. Equality iff the subspace is the whole space.',
  ],

  checkpoints: [
    { id: 'cp-la6-002-1', question: 'What are the two properties a basis must have?', answer: 'Spans $V$ and is linearly independent.' },
    { id: 'cp-la6-002-2', question: 'What is $\\dim P_4$ (polynomials of degree ≤ 4)?', answer: '5 (basis: $1, x, x^2, x^3, x^4$).' },
    { id: 'cp-la6-002-3', question: 'If $V$ has dimension $n$ and a set of $n$ vectors is linearly independent, is it a basis?', answer: 'Yes — independent set of size = dim is automatically spanning, hence a basis.' },
  ],

  assessment: 'Find a basis and the dimension of the subspace $W = \\{p \\in P_3 : p(0) = 0 \\text{ and } p\'(0) = 0\\}$ of polynomials with zero constant and linear terms.',

  quiz: [
    { id: 'q-la6-002-1', question: 'The dimension of $M_{3\\times 2}$ (all $3\\times 2$ real matrices) is:', options: ['3', '2', '5', '6'], answer: '6' },
    { id: 'q-la6-002-2', question: 'If $n$ vectors span an $n$-dimensional space, they:', options: ['May or may not be a basis', 'Are always a basis', 'Are always linearly dependent', 'Span a subspace'], answer: 'Are always a basis' },
    { id: 'q-la6-002-3', question: 'The Rank-Nullity theorem says rank$(A)$ + nullity$(A)$ equals:', options: ['$m$ (rows)', '$n$ (columns)', '$\\min(m,n)$', '$\\det(A)$'], answer: '$n$ (columns)' },
  ],
};
