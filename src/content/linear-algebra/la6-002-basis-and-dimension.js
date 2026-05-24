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
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Bases, Coordinates, and Dimension',
        mathBridge: 'Find bases for abstract spaces numerically, compute coordinates in a non-standard basis, and verify the rank-nullity theorem.',
        caption: 'Every vector has a unique coordinate representation in any basis.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cell_type: 'code',
              source: `import numpy as np

# Find a basis for the null space of A (subspace of R^n)
A = np.array([[1., 2., 3., 4.],
              [2., 4., 7., 10.],
              [0., 0., 1., 2.]])

# Null space basis via SVD (most numerically stable)
U, S, Vt = np.linalg.svd(A)
rank = np.sum(S > 1e-10)
null_basis = Vt[rank:].T   # right singular vectors for zero singular values

print(f"A is {A.shape[0]}x{A.shape[1]}")
print(f"rank(A) = {rank}")
print(f"nullity(A) = {A.shape[1] - rank}")
print(f"rank + nullity = {rank + A.shape[1] - rank} = {A.shape[1]} (columns) ✓")
print()
print("Basis for null space:")
print(null_basis.round(6))
print()

# Verify: A @ null_basis ≈ 0
print("Verification A @ null_basis (should be ~0):")
print((A @ null_basis).round(10))
`,
            },
            {
              id: 2,
              cell_type: 'code',
              source: `import numpy as np

# Coordinates in a non-standard basis
# Basis B = {b1, b2} for R^2, find coordinates of v

b1 = np.array([1., 2.])
b2 = np.array([3., 1.])
v  = np.array([7., 5.])

# [v]_B = B^{-1} v where B = [b1 | b2]
B = np.column_stack([b1, b2])
coords_B = np.linalg.solve(B, v)

print("Standard coordinates of v:", v)
print("B-coordinates of v:", coords_B.round(6))
print(f"  v = {coords_B[0]:.4f}*b1 + {coords_B[1]:.4f}*b2")
print()

# Verify
reconstructed = coords_B[0]*b1 + coords_B[1]*b2
print("Reconstruction:", reconstructed, "== v?", np.allclose(reconstructed, v))
print()

# Standard basis: coordinates are just the components
e1 = np.array([1., 0.])
e2 = np.array([0., 1.])
B_std = np.column_stack([e1, e2])
coords_std = np.linalg.solve(B_std, v)
print("Standard coordinates of v:", coords_std, "(same as v itself)")
`,
            },
          ],
        },
      },
    ],
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
      title: 'Is $\\{1+x, 1-x, x^2\\}$ a basis for $P_2$?',
      problem: 'Determine whether $\\{1+x, 1-x, x^2\\}$ is a basis for $P_2$ (polynomials of degree $\\leq 2$).',
      steps: [
        {
          expression: '\\dim(P_2) = 3 \\quad \\text{and we have 3 vectors}',
          annotation: 'In a 3-dimensional space, 3 vectors form a basis iff they are linearly independent (OR span). We only need to check one condition.',
          strategyTitle: 'Count: same number as dimension',
        },
        {
          expression: 'a(1+x) + b(1-x) + cx^2 = 0 \\implies (a+b) + (a-b)x + cx^2 = 0',
          annotation: 'Set an arbitrary linear combination equal to zero and collect by powers of $x$.',
          strategyTitle: 'Set up independence condition',
        },
        {
          expression: 'a+b = 0, \\quad a-b = 0, \\quad c = 0',
          annotation: 'Match coefficients of $1, x, x^2$ separately (since $1, x, x^2$ are independent).',
          strategyTitle: 'Match coefficients',
        },
        {
          expression: 'a = b = c = 0 \\implies \\text{linearly independent}',
          annotation: 'Only the trivial solution — the set is independent.',
          strategyTitle: 'Conclude independence',
        },
        {
          expression: '\\text{3 independent vectors in a 3D space} \\implies \\text{basis for } P_2 \\checkmark',
          annotation: 'By Steinitz: $n$ independent vectors in an $n$-dimensional space must span the whole space — so they form a basis.',
          strategyTitle: 'Apply dimension theorem',
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la6-002-1',
      title: 'Dimension of intersection',
      difficulty: 'medium',
      problem: 'Let $W_1 = \\text{Span}\\{\\mathbf{v}_1, \\mathbf{v}_2\\}$ and $W_2 = \\text{Span}\\{\\mathbf{v}_2, \\mathbf{v}_3\\}$ in $\\mathbb{R}^3$ where $\\mathbf{v}_1, \\mathbf{v}_2, \\mathbf{v}_3$ are linearly independent. Find $\\dim(W_1 + W_2)$ and $\\dim(W_1 \\cap W_2)$.',
      hint: 'Use the dimension formula $\\dim(W_1 + W_2) = \\dim W_1 + \\dim W_2 - \\dim(W_1 \\cap W_2)$. First determine $W_1 + W_2$ directly.',
      walkthrough: [
        '**Individual dimensions:** $W_1 = \\text{Span}\\{\\mathbf{v}_1, \\mathbf{v}_2\\}$ has $\\dim W_1 = 2$ (two independent vectors). Similarly $\\dim W_2 = 2$.',
        '**Sum $W_1 + W_2$:** This is $\\text{Span}\\{\\mathbf{v}_1, \\mathbf{v}_2, \\mathbf{v}_3\\}$ (all three vectors). Since $\\mathbf{v}_1, \\mathbf{v}_2, \\mathbf{v}_3$ are independent in $\\mathbb{R}^3$, they span all of $\\mathbb{R}^3$. So $\\dim(W_1 + W_2) = 3$.',
        '**Apply the dimension formula:** $\\dim(W_1 + W_2) = \\dim W_1 + \\dim W_2 - \\dim(W_1 \\cap W_2)$. So $3 = 2 + 2 - \\dim(W_1 \\cap W_2)$, giving $\\dim(W_1 \\cap W_2) = 1$.',
        '**What is $W_1 \\cap W_2$?** A vector $\\mathbf{w} \\in W_1 \\cap W_2$ must be in both spans. $\\mathbf{w} \\in W_1 \\Rightarrow \\mathbf{w} = a\\mathbf{v}_1 + b\\mathbf{v}_2$; $\\mathbf{w} \\in W_2 \\Rightarrow \\mathbf{w} = c\\mathbf{v}_2 + d\\mathbf{v}_3$. Setting equal and using independence: $a = 0$, $d = 0$, $b = c$. So $\\mathbf{w} = b\\mathbf{v}_2$ and $W_1 \\cap W_2 = \\text{Span}\\{\\mathbf{v}_2\\}$.',
      ],
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

  assessment: {
    questions: [
      {
        id: 'assess-la6-002-1',
        type: 'computation',
        text: 'Find a basis and the dimension of $W = \\{p \\in P_3 : p(0) = 0 \\text{ and } p\'(0) = 0\\}$.',
        answer: 'A polynomial $p(x) = a_0 + a_1x + a_2x^2 + a_3x^3$ satisfies $p(0) = a_0 = 0$ and $p\'(0) = a_1 = 0$. So $W = \\{a_2x^2 + a_3x^3 : a_2, a_3 \\in \\mathbb{R}\\}$. Basis: $\\{x^2, x^3\\}$. Dimension: 2.',
        hint: 'Write $p(x) = a_0 + a_1x + a_2x^2 + a_3x^3$ and apply both conditions to constrain $a_0$ and $a_1$.',
      },
    ],
  },

  quiz: [
    {
      id: 'q-la6-002-1',
      type: 'choice',
      text: 'The dimension of $M_{3\\times 2}$ (all $3\\times 2$ real matrices) is:',
      options: ['3', '2', '5', '6'],
      answer: '6',
      hints: ['$M_{3\\times 2}$ has $3 \\times 2 = 6$ entries, each independently free. A basis consists of the 6 matrices $E_{ij}$ (1 in position $(i,j)$, zeros elsewhere). $\\dim(M_{m\\times n}) = mn$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-002-2',
      type: 'choice',
      text: 'If $n$ vectors span an $n$-dimensional space $V$, they:',
      options: ['May or may not be a basis', 'Are always a basis', 'Are always linearly dependent', 'Form a proper subspace'],
      answer: 'Are always a basis',
      hints: ['By the Steinitz exchange lemma: in dimension $n$, any spanning set of size $n$ is automatically independent (and vice versa). You only need to check one condition when the count matches the dimension.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la6-002-3',
      type: 'choice',
      text: 'The Rank-Nullity theorem states: $\\text{rank}(A) + \\text{nullity}(A) = ?$',
      options: ['$m$ (number of rows)', '$n$ (number of columns)', '$\\min(m,n)$', '$\\det(A)$'],
      answer: '$n$ (number of columns)',
      hints: ['The rank counts pivot columns (dimension of column space); nullity counts free variables (dimension of null space). Together they account for all $n$ columns. The number of rows $m$ is irrelevant.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-002-4',
      type: 'choice',
      text: 'For subspaces $W_1, W_2 \\subseteq V$, the formula $\\dim(W_1 + W_2) = \\dim W_1 + \\dim W_2 - \\dim(W_1 \\cap W_2)$ is called:',
      options: ['The Rank-Nullity theorem', 'The inclusion-exclusion formula for dimensions', 'The Steinitz exchange lemma', 'The spectral theorem'],
      answer: 'The inclusion-exclusion formula for dimensions',
      hints: ['This is the vector space analogue of the inclusion-exclusion principle for set cardinalities: $|A \\cup B| = |A| + |B| - |A \\cap B|$. Here union is replaced by sum and cardinality by dimension.'],
      reviewSection: 'math',
    },
  ],
};
