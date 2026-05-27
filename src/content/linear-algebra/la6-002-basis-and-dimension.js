export default {
  id: 'la6-002',
  slug: 'basis-and-dimension',
  chapter: 'la6',
  order: 2,
  title: 'Basis and Dimension',
  subtitle: 'A basis is a minimal spanning set â€” or equivalently, a maximal independent set. The number of vectors in any basis is the dimension: an intrinsic property of the space that never changes.',
  tags: ['basis', 'dimension', 'spanning set', 'linear independence', 'coordinates', 'standard basis', 'infinite-dimensional', 'Hamel basis'],
  aliases: 'basis dimension spanning set linear independence coordinates standard basis infinite dimensional Hamel',

  hook: {
    question: "How many vectors do you need to describe every element of a vector space, with no redundancy? That number is the dimension â€” and it is the same no matter which basis you choose.",
    realWorldContext: "Dimension is one of the most fundamental quantities in mathematics. In machine learning, the dimensionality of your feature space determines model complexity and the curse of dimensionality. In quantum mechanics, the dimension of the Hilbert space is the number of independent quantum states. In signal processing, a bandlimited signal of bandwidth $W$ sampled over time $T$ lies in a vector space of dimension $\\approx 2WT$ (Nyquist-Shannon). In control theory, the number of state variables is the dimension of the state space â€” it determines how many sensors and actuators you need.",
  },

  intuition: {
    prose: [
      'Consider $P_2$ (polynomials of degree $\\leq 2$). Standard basis: $\\{1, x, x^2\\}$. Every polynomial $3 + 2x - 5x^2$ has a unique representation: coefficients $(3, 2, -5)$. Now try $\\{1+x,\\; 1-x,\\; x^2\\}$: solve $a(1+x) + b(1-x) + cx^2 = 3 + 2x - 5x^2$ by matching coefficients: $a+b=3$, $a-b=2$, $c=-5$, giving $a = 5/2$, $b = 1/2$, $c=-5$ â€” unique, different numbers but same polynomial. Both sets are bases: they span (every polynomial has a representation) and are independent (the representation is unique). Any basis of $P_2$ has exactly 3 vectors â€” no matter which 3 you choose. That count, 3, is the dimension.',
      '**Uniqueness of coefficients.** If $\\{\\mathbf{b}_1, \\ldots, \\mathbf{b}_n\\}$ is a basis, every $\\mathbf{v} \\in V$ can be written uniquely as $\\mathbf{v} = c_1 \\mathbf{b}_1 + \\cdots + c_n \\mathbf{b}_n$. The scalars $(c_1, \\ldots, c_n)$ are the **coordinates** of $\\mathbf{v}$ with respect to this basis. Different bases give different coordinate representations of the same vector.',
      '**Dimension is basis-independent.** The most important theorem about bases: every basis of a vector space has the same number of elements. This common number is the **dimension** of $V$. It does not matter which basis you use â€” any two bases have the same size. This is the theorem that makes "dimension" a well-defined property of $V$, not just of a particular basis.',
      '**Standard examples.** $\\dim \\mathbb{R}^n = n$ (standard basis $\\mathbf{e}_1, \\ldots, \\mathbf{e}_n$). $\\dim P_n = n+1$ (basis $1, x, x^2, \\ldots, x^n$). $\\dim M_{m\\times n} = mn$ (basis of matrices with a single 1 and rest 0s). $\\dim C[a,b] = \\infty$ (no finite basis exists).',
      '**Finding a basis for a subspace defined by a constraint.** Suppose $W = \\{(x,y,z,w) \\in \\mathbb{R}^4 : x - 2y + z = 0 \\text{ and } y + w = 0\\}$. Two equations, four unknowns: two free variables. Set $y = s$, $z = t$ (free), then $x = 2s - t$ and $w = -s$. The general element is $s(2,-1,0,1)^T \\cdot 0 + \\ldots$ â€” wait, parametrize: $(2s-t, s, t, -s)^T = s(2,1,0,-1)^T + t(-1,0,1,0)^T$. So a basis for $W$ is $\\{(2,1,0,-1)^T, (-1,0,1,0)^T\\}$ and $\\dim W = 2$. The rank-nullity theorem confirms: 4 variables, 2 independent equations â†’ $4 - 2 = 2$ free variables.',
      '**Coordinates change with the basis, but the vector does not.** The polynomial $p(x) = 3 + 2x - 5x^2$ is the same polynomial regardless of which basis you use to represent it. In the standard basis $\\{1, x, x^2\\}$, its coordinates are $(3, 2, -5)$. In a different basis $\\{1+x, 1-x, x^2\\}$, the coordinates are different numbers but describe the same function. Understanding that a vector and its coordinates are different objects â€” the vector is the mathematical reality, the coordinates are a choice of reference frame â€” is one of the key insights that separates abstract linear algebra from concrete computation.',
      '**Where this is heading.** The next lesson studies linear transformations â€” maps that preserve the vector space structure. Once you have dimension, you can count: a linear map from a $k$-dimensional space to an $m$-dimensional space is represented by an $m \\times k$ matrix, and the rank-nullity theorem constrains how much it can compress or expand information. Change of basis (Lesson 6 of this chapter) lets you choose the coordinate system that best reveals the structure of the transformation.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 6 â€” Abstract Vector Spaces',
        body: '**Previous:** Abstract Vector Spaces â€” the ten axioms that define what a vector space is.\n**This lesson:** Basis and Dimension â€” how to measure the size of any vector space, and why all bases have the same number of vectors.\n**Next:** Linear Transformations â€” maps between vector spaces that preserve the vector space structure.',
      },
      {
        type: 'theorem',
        title: 'All Bases Have the Same Size',
        body: 'If $V$ has a finite basis, then every basis of $V$ contains exactly the same number of vectors. This number is $\\dim V$.\n\nConsequently:\nâ€¢ Any spanning set of size $\\dim V$ is a basis\nâ€¢ Any independent set of size $\\dim V$ is a basis\nâ€¢ You only need to check ONE of the two conditions if you know the set has the right size',
      },
      {
        type: 'insight',
        title: 'Basis Hunting Strategy',
        body: 'To find a basis for a subspace $W$:\n**Method 1:** Find the null space or column space, extract pivot columns.\n**Method 2:** Write the general element with free parameters, pull out each coefficient vector.\n**Method 3:** Start with too many vectors, reduce using Gram-Schmidt or row reduction.',
      },
      {
        type: 'insight',
        title: 'Prediction',
        body: 'Before computing: the subspace $W = \\{p \\in P_3 : p(0) = 0\\}$ (degree $\\leq 3$ polynomials vanishing at $0$). How many free parameters does a polynomial in $W$ have? What is $\\dim(W)$? Name a basis for $W$ without computing â€” use the structure of the constraint.',
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
        caption: 'The dimension is the number of independent directions â€” regardless of the objects involved.',
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
        body: 'If $V$ is spanned by $m$ vectors, then any linearly independent set has at most $m$ vectors.\n\nConsequence: in a space of dimension $n$:\nâ€¢ Any $n+1$ vectors are linearly dependent\nâ€¢ Any $n$ independent vectors form a basis\nâ€¢ Any $n$ spanning vectors form a basis',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Bases, Coordinates, and Dimension',
        mathBridge: 'Find bases for abstract spaces numerically, compute coordinates in a non-standard basis, and verify the rank-nullity theorem.',
        caption: 'Every vector has a unique coordinate representation in any basis.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Rank-nullity theorem â€” null space basis via SVD',
              prose: 'The null space of $A$ is a subspace of $\\mathbb{R}^n$ (the number of columns). Its dimension is the nullity. The rank-nullity theorem: $\\text{rank}(A) + \\text{nullity}(A) = n$. We find the null space basis using SVD: the right singular vectors corresponding to zero singular values span the null space.',
              code: `import numpy as np

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
print(f"rank + nullity = {rank + A.shape[1] - rank} = {A.shape[1]} (columns) âœ“")
print()
print("Basis for null space:")
print(null_basis.round(6))
print()

# Verify: A @ null_basis â‰ˆ 0
print("Verification A @ null_basis (should be ~0):")
print((A @ null_basis).round(10))
`,
            },
            {
              id: 2,
              cellTitle: 'Coordinates in a non-standard basis',
              prose: 'Every vector has a unique coordinate representation in any basis. To find the $\\mathcal{B}$-coordinates of $\\mathbf{v}$, solve the linear system $[\\mathbf{b}_1 | \\mathbf{b}_2 | \\cdots] \\mathbf{c} = \\mathbf{v}$. The coordinates change with the basis, but the vector $\\mathbf{v}$ itself does not.',
              code: `import numpy as np

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
      '**Infinite-dimensional spaces.** Not every vector space has a finite basis. $P = \\bigcup_n P_n$ (all polynomials) has a countably infinite basis $\\{1, x, x^2, \\ldots\\}$, called a Hamel basis. $C[0,1]$ (continuous functions) also has a Hamel basis, but it requires the Axiom of Choice to prove its existence â€” no explicit basis can be written down. For analysis, the relevant notion is a Schauder basis (allowing infinite linear combinations), which relates to completeness of the space.',
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
          annotation: 'Only the trivial solution â€” the set is independent.',
          strategyTitle: 'Conclude independence',
        },
        {
          expression: '\\text{3 independent vectors in a 3D space} \\implies \\text{basis for } P_2 \\checkmark',
          annotation: 'By Steinitz: $n$ independent vectors in an $n$-dimensional space must span the whole space â€” so they form a basis.',
          strategyTitle: 'Apply dimension theorem',
        },
      ],
    },
    {
      id: 'ex-la6-002-2',
      title: 'Basis for a subspace defined by constraints',
      problem: 'Find a basis and dimension of $W = \\{p \\in P_3 : p(0) = 0 \\text{ and } p\'(0) = 0\\}$.',
      steps: [
        {
          expression: 'p(x) = a_0 + a_1x + a_2x^2 + a_3x^3',
          annotation: 'Write the general element of $P_3$ with four free parameters.',
          strategyTitle: 'Write general element',
        },
        {
          expression: 'p(0) = a_0 = 0 \\implies a_0 = 0',
          annotation: 'First constraint: the polynomial vanishes at $x=0$, so the constant term is zero.',
          strategyTitle: 'Apply constraint 1',
        },
        {
          expression: 'p\'(x) = a_1 + 2a_2x + 3a_3x^2, \\quad p\'(0) = a_1 = 0',
          annotation: 'Second constraint: the derivative vanishes at $x=0$, so the linear coefficient is zero.',
          strategyTitle: 'Apply constraint 2',
        },
        {
          expression: 'p(x) = a_2x^2 + a_3x^3 = a_2 \\cdot x^2 + a_3 \\cdot x^3',
          annotation: 'Two free parameters remain ($a_2, a_3$). Each basis vector corresponds to one free parameter.',
          strategyTitle: 'Identify free parameters',
        },
        {
          expression: '\\text{Basis: } \\{x^2,\\; x^3\\}, \\quad \\dim(W) = 2',
          annotation: 'Each constraint eliminates one dimension: $P_3$ starts at dimension 4, two constraints reduce it by 2 (if independent), giving dimension 2. Verify: $x^2 \\in W$ ($x^2|_0 = 0$, $(x^2)\'|_0 = 0$) âœ“; same for $x^3$.',
          strategyTitle: 'State basis and dimension',
          checkpoint: 'Each independent linear constraint on an $n$-dimensional space reduces dimension by exactly 1. Two independent constraints on $P_3$ (dim 4) give a subspace of dim 2.',
        },
      ],
    },
    {
      id: 'ex-la6-002-3',
      title: 'Coordinates in a non-standard basis',
      problem: 'In $\\mathbb{R}^2$, let $\\mathcal{B} = \\{\\mathbf{b}_1, \\mathbf{b}_2\\} = \\{(1,2)^\\top, (3,1)^\\top\\}$. Find the $\\mathcal{B}$-coordinates of $\\mathbf{v} = (7,5)^\\top$.',
      steps: [
        {
          expression: '\\mathbf{v} = c_1 \\mathbf{b}_1 + c_2 \\mathbf{b}_2: \\quad \\begin{bmatrix}7\\\\5\\end{bmatrix} = c_1\\begin{bmatrix}1\\\\2\\end{bmatrix} + c_2\\begin{bmatrix}3\\\\1\\end{bmatrix}',
          annotation: 'Finding coordinates = solving $B\\mathbf{c} = \\mathbf{v}$ where $B = [\\mathbf{b}_1|\\mathbf{b}_2]$.',
          strategyTitle: 'Set up the coordinate equation',
        },
        {
          expression: '\\begin{bmatrix}1&3\\\\2&1\\end{bmatrix}\\begin{bmatrix}c_1\\\\c_2\\end{bmatrix} = \\begin{bmatrix}7\\\\5\\end{bmatrix}',
          annotation: 'The change-of-basis matrix $B$ has basis vectors as columns.',
          strategyTitle: 'Write as linear system',
        },
        {
          expression: '\\det(B) = 1\\cdot1 - 3\\cdot2 = -5, \\quad B^{-1} = \\frac{1}{-5}\\begin{bmatrix}1&-3\\\\-2&1\\end{bmatrix}',
          annotation: 'Invert the $2\\times2$ matrix.',
          strategyTitle: 'Invert $B$',
        },
        {
          expression: '\\begin{bmatrix}c_1\\\\c_2\\end{bmatrix} = B^{-1}\\mathbf{v} = \\frac{1}{-5}\\begin{bmatrix}1\\cdot7 - 3\\cdot5\\\\-2\\cdot7 + 1\\cdot5\\end{bmatrix} = \\frac{1}{-5}\\begin{bmatrix}-8\\\\-9\\end{bmatrix} = \\begin{bmatrix}8/5\\\\9/5\\end{bmatrix}',
          annotation: 'The $\\mathcal{B}$-coordinates are $(8/5, 9/5)$. Verify: $(8/5)(1,2)^\\top + (9/5)(3,1)^\\top = (8/5+27/5,\\;16/5+9/5) = (35/5,25/5) = (7,5)^\\top$ âœ“.',
          strategyTitle: 'Compute coordinates',
          checkpoint: 'Coordinates depend on the basis. Same vector, different basis, different numbers â€” but they represent the same geometric object.',
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
    'Basis = independent spanning set. The two properties are always in tension: add a vector â†’ might lose independence; remove a vector â†’ might lose span.',
    'Dimension = number of vectors in any basis. It never changes regardless of which basis you choose.',
    'To find a basis of a subspace: parameterize with free variables and read off the spanning vectors.',
    'Dimension â‰¤ ambient dimension. Equality iff the subspace is the whole space.',
  ],

  checkpoints: [
    { id: 'cp-la6-002-1', label: 'Read intuition: basis and dimension examples', type: 'read' },
    { id: 'cp-la6-002-2', label: 'Read math: Steinitz exchange and basis extension', type: 'read' },
    { id: 'cp-la6-002-3', label: 'Read rigor: infinite-dimensional spaces', type: 'read' },
    { id: 'cp-la6-002-4', label: 'Run null space basis lab', type: 'lab' },
    { id: 'cp-la6-002-5', label: 'Run coordinates in non-standard basis lab', type: 'lab' },
    { id: 'cp-la6-002-6', label: 'Work example 1: polynomial basis check', type: 'example' },
    { id: 'cp-la6-002-7', label: 'Work example 2: constrained subspace basis', type: 'example' },
    { id: 'cp-la6-002-8', label: 'Solve challenge: dimension of intersection', type: 'challenge' },
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
    {
      id: 'q-la6-002-5',
      type: 'choice',
      text: 'Which of the following is a basis for $P_2$?',
      options: [
        '$\\{1, x, x^2, x^3\\}$',
        '$\\{1+x, 2+2x, x^2\\}$',
        '$\\{x, x^2\\}$',
        '$\\{1-x, 1+x, x^2\\}$',
      ],
      answer: '$\\{1-x, 1+x, x^2\\}$',
      hints: ['$\\{1,x,x^2,x^3\\}$ has 4 vectors in a 3-dimensional space â€” too many (linearly dependent). $\\{1+x, 2+2x, x^2\\}$ is dependent: $2+2x = 2(1+x)$. $\\{x, x^2\\}$ only has 2 vectors â€” cannot span the 3-dimensional $P_2$. $\\{1-x, 1+x, x^2\\}$: check independence â€” the only solution to $a(1-x)+b(1+x)+cx^2=0$ is $a=b=c=0$. âœ“'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-002-6',
      type: 'choice',
      text: 'The subspace $W = \\{(x,y,z) \\in \\mathbb{R}^3 : x - y + 2z = 0\\}$ has dimension:',
      options: ['1', '2', '3', '0'],
      answer: '2',
      hints: ['$W$ is the null space of the $1 \\times 3$ matrix $[1,-1,2]$. Rank-Nullity: $\\text{rank} + \\text{nullity} = 3$. Rank = 1 (one nonzero row), so nullity = 2. Or: $x = y - 2z$ leaves $y, z$ free â€” two parameters, dimension 2. Basis: set $(y,z)=(1,0)$ â†’ $(1,1,0)$; set $(y,z)=(0,1)$ â†’ $(-2,0,1)$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-002-7',
      type: 'choice',
      text: 'In quantum mechanics, the state of an $n$-level system is a vector in $\\mathbb{C}^n$. A measurement outcome corresponds to an eigenvalue of a Hermitian operator. The dimension of the system determines:',
      options: [
        'The maximum number of distinct measurement outcomes',
        'The probability of each outcome',
        'The energy of the ground state',
        'The speed of quantum operations',
      ],
      answer: 'The maximum number of distinct measurement outcomes',
      hints: ['A Hermitian operator on $\\mathbb{C}^n$ has at most $n$ distinct eigenvalues (the characteristic polynomial has degree $n$). The dimension of the state space bounds the number of distinguishable measurement outcomes â€” more dimensions = more information capacity.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-002-8',
      type: 'choice',
      text: 'The vector $\\mathbf{v} = (7, 5)^\\top$ in the basis $\\mathcal{B} = \\{(1,2)^\\top, (3,1)^\\top\\}$ has $\\mathcal{B}$-coordinates $(8/5, 9/5)$. What is the $\\mathcal{B}$-coordinate of $3\\mathbf{v}$?',
      options: [
        '$(3, 3)^\\top$',
        '$(24/5, 27/5)^\\top$',
        '$(8/5, 27/5)^\\top$',
        'Cannot determine without computing',
      ],
      answer: '$(24/5, 27/5)^\\top$',
      hints: ['Coordinate maps are linear: $[c\\mathbf{v}]_\\mathcal{B} = c[\\mathbf{v}]_\\mathcal{B}$. So $[3\\mathbf{v}]_\\mathcal{B} = 3(8/5, 9/5) = (24/5, 27/5)$. No need to redo the solve.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la6-002-9',
      type: 'choice',
      text: 'In machine learning, a model with $p$ features lives in a $p$-dimensional feature space. The "curse of dimensionality" refers to:',
      options: [
        'The determinant of the feature matrix becoming too large',
        'The volume of the $p$-dimensional unit hypercube shrinking to zero',
        'Data becoming increasingly sparse as dimension grows â€” exponentially more data needed to fill the space',
        'The basis vectors becoming linearly dependent in high dimensions',
      ],
      answer: 'Data becoming increasingly sparse as dimension grows â€” exponentially more data needed to fill the space',
      hints: ['In dimension $p$, to have $k$ samples per unit length in each dimension requires $k^p$ total samples. As $p$ grows, the space has exponentially more "volume" â€” any fixed dataset becomes increasingly sparse. This is purely a consequence of the dimension of the feature vector space.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-002-10',
      type: 'choice',
      text: 'If $A$ is a $5 \\times 8$ matrix with rank 3, what are the dimensions of the null space and column space?',
      options: [
        'Null space dim $= 5$, column space dim $= 3$',
        'Null space dim $= 5$, column space dim $= 8$',
        'Null space dim $= 5$, column space dim $= 5$',
        'Null space dim $= 5$, column space dim $= 3$',
      ],
      answer: 'Null space dim $= 5$, column space dim $= 3$',
      hints: ['Rank-Nullity: $\\text{rank}(A) + \\text{nullity}(A) = n = 8$ (columns). So nullity $= 8 - 3 = 5$. Column space has dimension = rank = 3. Note: the column space is a subspace of $\\mathbb{R}^5$ (the codomain), but has dimension 3.'],
      reviewSection: 'intuition',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Find a basis for a subspace defined by linear constraints on polynomials, matrices, or $\\mathbb{R}^n$; determine the dimension; and compute coordinates in a non-standard basis.',
    explainVerbally: 'Explain why all bases of a finite-dimensional space have the same size, and why knowing the count matches the dimension lets you test only independence or only spanning (not both).',
    detectIncorrectApplication: 'Catch misuse of the dimension theorem â€” e.g., $n+1$ vectors in dimension $n$ cannot be independent; $n-1$ vectors cannot span.',
    transferToUnfamiliar: 'Apply rank-nullity to determine the dimensions of any kernel/image pair; use the constraint-counting argument to find dimensions of subspaces in polynomial and matrix spaces.',
  },

  misconceptions: [
    {
      falseBelief: 'A spanning set is a basis.',
      whyStudentsThinkIt: 'Spanning is part of the definition â€” students focus on it and forget about independence.',
      correctionExample: '$\\{1, x, x^2, x+1\\}$ spans $P_2$ but is NOT a basis: it has 4 vectors in a 3-dimensional space, so at least one is redundant (and indeed $x+1 = 1+x$ is a combination of the others). A spanning set must also be independent to be a basis.',
      contrastCase: '$\\{1, x, x^2\\}$ spans $P_2$ AND is independent â€” it is a basis. To remove redundancy from a spanning set, keep reducing until independence holds.',
    },
    {
      falseBelief: 'Different bases of the same space have different sizes.',
      whyStudentsThinkIt: 'Students may think that some bases are "more efficient" than others and could have fewer vectors.',
      correctionExample: '$\\{(1,0), (0,1)\\}$ and $\\{(1,1), (1,-1)\\}$ are both bases for $\\mathbb{R}^2$ â€” both have exactly 2 vectors. The Steinitz exchange lemma guarantees any two bases of the same space have the same size, making "dimension" well-defined.',
      contrastCase: 'In $P_2$, any basis has exactly 3 vectors. You cannot find a 2-vector basis (it would only span a 2D subspace) or need more than 3 (they would be dependent).',
    },
  ],

  transferPrompts: [
    {
      situation: 'You need to determine how many independent parameters describe a family of matrices (e.g., symmetric, upper triangular).',
      competingTechniques: 'Count by inspection, enumerate all elements, use rank.',
      whyThisTechniqueWins: 'The dimension of the space equals the number of free parameters in the general element. Write the general element with unknowns, read off the number of free variables â€” that\'s the dimension. This avoids explicit basis construction.',
    },
    {
      situation: 'You want to check if a set of $n$ vectors is a basis for an $n$-dimensional space.',
      competingTechniques: 'Check both span and independence; compute the determinant.',
      whyThisTechniqueWins: 'By the dimension theorem, for a set of exactly $n$ vectors in an $n$-dimensional space, independence and spanning are equivalent â€” you only need to check one. For $\\mathbb{R}^n$, form the matrix of the vectors and check if it\'s invertible (det $\\neq 0$). This halves the work.',
    },
  ],

  debugging: [
    {
      commonError: 'Using a spanning set with too many vectors as a "basis."',
      symptom: 'The coordinate representation is not unique â€” different coefficient choices give the same vector.',
      whyItHappened: 'If the set is linearly dependent, some vector is a combination of others. The extra vector creates multiple representations: add and subtract it to redistribute coefficients.',
      repairStrategy: 'Row-reduce the matrix of basis candidates. Keep only the pivot columns (rows) â€” these form a maximally independent subset. The number of pivots = the rank = the dimension.',
    },
    {
      commonError: 'Confusing the dimension of the domain/codomain with the rank when applying rank-nullity.',
      symptom: 'For a $5 \\times 8$ matrix, student says nullity = $5 - \\text{rank}$ instead of $8 - \\text{rank}$.',
      whyItHappened: 'Rank-Nullity sums over COLUMNS ($n$), not rows ($m$). The null space lives in the domain $\\mathbb{R}^n$ (columns), not the codomain $\\mathbb{R}^m$ (rows).',
      repairStrategy: 'Remember: rank + nullity = number of COLUMNS. The null space is a subspace of the domain (columns). Write it as "pivot columns + free columns = total columns."',
    },
  ],
};
