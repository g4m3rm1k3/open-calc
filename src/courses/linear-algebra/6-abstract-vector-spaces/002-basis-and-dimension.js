import basisChangeCoordsUrl from '../diagrams/la-basis-change-coords.svg?url'

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
  },

  intuition: {
    blocks: [
      { type: 'prose', paragraphs: [
      'Consider $P_2$ (polynomials of degree $\\leq 2$). Standard basis: $\\{1, x, x^2\\}$. Every polynomial $3 + 2x - 5x^2$ has a unique representation: coefficients $(3, 2, -5)$. Now try $\\{1+x,\\; 1-x,\\; x^2\\}$: solve $a(1+x) + b(1-x) + cx^2 = 3 + 2x - 5x^2$ by matching coefficients: $a+b=3$, $a-b=2$, $c=-5$, giving $a = 5/2$, $b = 1/2$, $c=-5$ — unique, different numbers but same polynomial. Both sets are bases: they span (every polynomial has a representation) and are independent (the representation is unique). Any basis of $P_2$ has exactly 3 vectors — no matter which 3 you choose. That count, 3, is the dimension.',
      '**Uniqueness of coefficients.** If $\\{\\mathbf{b}_1, \\ldots, \\mathbf{b}_n\\}$ is a basis, every $\\mathbf{v} \\in V$ can be written uniquely as $\\mathbf{v} = c_1 \\mathbf{b}_1 + \\cdots + c_n \\mathbf{b}_n$. The scalars $(c_1, \\ldots, c_n)$ are the **coordinates** of $\\mathbf{v}$ with respect to this basis. Different bases give different coordinate representations of the same vector.',
      ] },
      { type: 'image', src: basisChangeCoordsUrl,
        alt: 'Left panel showing the standard basis axes with a dot labeled coordinates 3, 2, -5. Right panel showing skewed basis axes with the same dot labeled coordinates 5/2, 1/2, -5',
        caption: 'Same polynomial, same dot — only the ruler (basis) changes, and so do the numbers you read off it.' },
      { type: 'prose', paragraphs: [
      '**Dimension is basis-independent.** The most important theorem about bases: every basis of a vector space has the same number of elements. This common number is the **dimension** of $V$. It does not matter which basis you use — any two bases have the same size. This is the theorem that makes "dimension" a well-defined property of $V$, not just of a particular basis.',
      '**Standard examples.** $\\dim \\mathbb{R}^n = n$ (standard basis $\\mathbf{e}_1, \\ldots, \\mathbf{e}_n$). $\\dim P_n = n+1$ (basis $1, x, x^2, \\ldots, x^n$). $\\dim M_{m\\times n} = mn$ (basis of matrices with a single 1 and rest 0s). $\\dim C[a,b] = \\infty$ (no finite basis exists).',
      '**Finding a basis for a subspace defined by a constraint.** Suppose $W = \\{(x,y,z,w) \\in \\mathbb{R}^4 : x - 2y + z = 0 \\text{ and } y + w = 0\\}$. Two equations, four unknowns: two free variables. Set $y = s$, $z = t$ (free), then $x = 2s - t$ and $w = -s$. The general element is $s(2,-1,0,1)^T \\cdot 0 + \\ldots$ — wait, parametrize: $(2s-t, s, t, -s)^T = s(2,1,0,-1)^T + t(-1,0,1,0)^T$. So a basis for $W$ is $\\{(2,1,0,-1)^T, (-1,0,1,0)^T\\}$ and $\\dim W = 2$. The rank-nullity theorem confirms: 4 variables, 2 independent equations → $4 - 2 = 2$ free variables.',
      '**Coordinates change with the basis, but the vector does not.** The polynomial $p(x) = 3 + 2x - 5x^2$ is the same polynomial regardless of which basis you use to represent it. In the standard basis $\\{1, x, x^2\\}$, its coordinates are $(3, 2, -5)$. In a different basis $\\{1+x, 1-x, x^2\\}$, the coordinates are different numbers but describe the same function. Understanding that a vector and its coordinates are different objects — the vector is the mathematical reality, the coordinates are a choice of reference frame — is one of the key insights that separates abstract linear algebra from concrete computation.',
      '**Where this is heading.** The next lesson studies linear transformations — maps that preserve the vector space structure. Once you have dimension, you can count: a linear map from a $k$-dimensional space to an $m$-dimensional space is represented by an $m \\times k$ matrix, and the rank-nullity theorem constrains how much it can compress or expand information. Change of basis (Lesson 6 of this chapter) lets you choose the coordinate system that best reveals the structure of the transformation.',
      ] },
      { type: 'viz', id: 'OpenMatNotebook',
        title: 'Bases for Polynomial and Matrix Spaces',
        mathBridge: 'Find bases and compute coordinates in abstract spaces.',
        caption: 'The dimension is the number of independent directions — regardless of the objects involved.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Basis for the symmetric 2x2 matrices',
              prose: [
                'Symmetric 2x2 matrices form a 3-dimensional subspace of M_2x2. Find a basis.',
                'A general 2×2 symmetric matrix has the form `[a b; b c]` — three free parameters (a,b,c). Write it as `a*E1 + b*E2 + c*E3` where `E1=[1 0;0 0]`, `E2=[0 1;1 0]`, `E3=[0 0;0 1]`. These three matrices are the basis. Verify independence: if `a*E1+b*E2+c*E3 = 0` for all scalars, then reading off the (1,1) entry gives a=0, (1,2) gives b=0, (2,2) gives c=0.',
                'The dimension of the space of n×n symmetric matrices is `n*(n+1)/2`: n diagonal entries plus `n*(n-1)/2` upper-triangle entries. For 2×2: 2+1=3. For 3×3: 3+3=6. To confirm in MATLAB: `S = rand(3,3); S = (S+S\')/2; disp(rank([S(:) eye(9)]))` — a random symmetric 3×3 matrix has rank 6 in the 9-dimensional matrix space.',
              ],
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
              prose: [
                'Subspace W = {p in P_2 : p(1) = 0}. Find a basis.',
                'The constraint p(1)=0 means a+b+c=0, so a=-b-c. Parametrically: p(x) = b*(-1+x) + c*(-1+x²). The two polynomials (-1+x) and (-1+x²) form the basis. In MATLAB: `B = [-1 -1; 1 0; 0 1]` (columns are basis vectors as coefficients [a;b;c]). `rank(B)` is 2, confirming independence. Any p with p(1)=0 is `B * [s;t]` for some scalars s,t.',
                'This is a general technique: take the constraint equation(s), solve for the dependent variables in terms of free variables, then read off the basis from the parametric form. The number of free variables equals the dimension. Here: 1 constraint on 3 parameters → dim = 3-1 = 2. This is exactly `nullity` when the constraint is expressed as a matrix equation.',
              ],
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
    callouts: [
      {
        type: 'procedure',
        title: 'How to Find a Basis for a Subspace Defined by Constraints (5 Steps)',
        body: '**Given:** A subspace $W$ defined by linear constraints on a vector space $V$.\n**Step 1.** Write the general element of $V$ with all unknowns free: e.g., $p(x) = a_0 + a_1x + \\cdots$ or $\\mathbf{v} = (x_1, x_2, \\ldots)$.\n**Step 2.** Apply each constraint to eliminate variables. Each independent constraint removes one free parameter.\n**Step 3.** Express the remaining general element as a linear combination of coefficient vectors, one per free parameter.\n**Step 4.** Read off the coefficient vectors — these form the basis for $W$.\n**Step 5.** Count the basis vectors = $\\dim(W)$. Verify: $\\dim(W) = \\dim(V) - (\\text{number of independent constraints})$.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 2 of 6 — Abstract Vector Spaces',
        body: '**Previous:** Abstract Vector Spaces — the ten axioms that define what a vector space is.\n**This lesson:** Basis and Dimension — how to measure the size of any vector space, and why all bases have the same number of vectors.\n**Next:** Linear Transformations — maps between vector spaces that preserve the vector space structure.',
      },
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
        title: 'Prediction',
        body: 'Before computing: the subspace $W = \\{p \\in P_3 : p(0) = 0\\}$ (degree $\\leq 3$ polynomials vanishing at $0$). How many free parameters does a polynomial in $W$ have? What is $\\dim(W)$? Name a basis for $W$ without computing — use the structure of the constraint.',
      },
      {
        type: 'insight',
        title: 'Dimension Formulas',
        body: 'For a subspace $W \\subseteq V$:\n$\\dim W \\leq \\dim V$\n$\\dim W = \\dim V \\Leftrightarrow W = V$\n\nRank-Nullity: $\\text{rank}(A) + \\text{nullity}(A) = n$ (columns of $A$)\n$\\dim(W_1 + W_2) = \\dim W_1 + \\dim W_2 - \\dim(W_1 \\cap W_2)$',
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
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Rank-nullity theorem — null space basis via SVD',
              prose: [
                'The null space of $A$ is a subspace of $\\mathbb{R}^n$ (the number of columns). Its dimension is the nullity. The rank-nullity theorem: $\\text{rank}(A) + \\text{nullity}(A) = n$. We find the null space basis using SVD: the right singular vectors corresponding to zero singular values span the null space.',
                '`U, s, Vt = np.linalg.svd(A)`. Columns of `Vt.T` corresponding to near-zero singular values span the null space. `tol = 1e-10; null_basis = Vt[s < tol].T`. Verify: `np.allclose(A @ null_basis, 0)` should be True. `rank + nullity = n` means `len(s[s > tol]) + null_basis.shape[1] == A.shape[1]`.',
                'The SVD approach is more numerically stable than using RREF, which can have rounding errors for nearly-rank-deficient matrices. Compare: `scipy.linalg.null_space(A)` does exactly this SVD approach. For a 3×5 matrix with rank 2, nullity = 3 — the null space is 3-dimensional, and any linear combination of the 3 null-space basis vectors solves Ax=0.',
              ],
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
print(f"rank + nullity = {rank + A.shape[1] - rank} = {A.shape[1]} (columns) ✓")
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
              prose: [
                'Every vector has a unique coordinate representation in any basis. To find the $\\mathcal{B}$-coordinates of $\\mathbf{v}$, solve the linear system $[\\mathbf{b}_1 | \\mathbf{b}_2 | \\cdots] \\mathbf{c} = \\mathbf{v}$. The coordinates change with the basis, but the vector $\\mathbf{v}$ itself does not.',
                '`B = np.column_stack([b1, b2])` — each basis vector is a column. `coords = np.linalg.solve(B, v)` gives the B-coordinates. Verify: `B @ coords` should recover `v` exactly. The coordinates `[c1, c2]` mean `v = c1*b1 + c2*b2`.',
                'Plot both the standard-basis and B-basis coordinate grid overlaid in R^2. The same point v looks like (vx, vy) in standard coordinates but (c1, c2) in B-coordinates. The change-of-basis matrix B IS the translation map — multiplying by B converts B-coords to standard coords, and `np.linalg.inv(B)` does the reverse. This is the geometric meaning of basis change.',
              ],
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
      '**Infinite-dimensional spaces.** Not every vector space has a finite basis. $P = \\bigcup_n P_n$ (all polynomials) has a countably infinite basis $\\{1, x, x^2, \\ldots\\}$, called a Hamel basis. $C[0,1]$ (continuous functions) also has a Hamel basis, but it requires the Axiom of Choice to prove its existence — no explicit basis can be written down. For analysis, the relevant notion is a Schauder basis (allowing infinite linear combinations), which relates to completeness of the space.',
      '**The coordinate isomorphism.** Any $n$-dimensional vector space $V$ over $\\mathbb{F}$ is isomorphic to $\\mathbb{F}^n$. Given a basis $\\mathcal{B} = \\{\\mathbf{b}_1, \\ldots, \\mathbf{b}_n\\}$, the coordinate map $\\phi_{\\mathcal{B}}: V \\to \\mathbb{F}^n$ defined by $\\phi_{\\mathcal{B}}(\\mathbf{v}) = [\\mathbf{v}]_{\\mathcal{B}} = (c_1, \\ldots, c_n)^\\top$ is a vector space isomorphism (bijective and linear). This means all $n$-dimensional spaces over $\\mathbb{F}$ are "the same" — there is only one $n$-dimensional space per field, up to isomorphism. In particular, $P_n \\cong \\mathbb{R}^{n+1} \\cong M_{1\\times(n+1)}$, even though the objects look completely different.',
      '**Zorn\'s lemma and the existence of bases.** Every vector space — even infinite-dimensional ones — has a Hamel basis, but proving this requires Zorn\'s lemma (equivalent to the Axiom of Choice). The proof: the collection of all linearly independent subsets of $V$, partially ordered by inclusion, satisfies the hypotheses of Zorn\'s lemma. The maximal element of this poset is a basis. For finite-dimensional spaces the construction terminates in finitely many steps without Choice. Zorn\'s lemma also guarantees that every independent set extends to a basis and every spanning set contains a basis.',
      '**The replacement theorem (formal statement).** If $V$ is spanned by $m$ vectors and $\\{\\mathbf{u}_1, \\ldots, \\mathbf{u}_k\\}$ is linearly independent, then $k \\leq m$. Proof: since $\\mathbf{u}_1$ is in the span of the spanning set, we can replace one spanning vector with $\\mathbf{u}_1$ (by independence it contributes something new). Repeating for $\\mathbf{u}_2, \\ldots, \\mathbf{u}_k$: at each step we replace one spanning vector, using up one of the $m$ available replacements. The process requires $k \\leq m$ replacements, establishing $k \\leq m$. From this, if two bases both span $V$, applying the lemma in each direction gives $m \\leq n$ and $n \\leq m$, so $m = n$. This is the rigorous foundation for dimension being well-defined.',
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
          annotation: 'Each constraint eliminates one dimension: $P_3$ starts at dimension 4, two constraints reduce it by 2 (if independent), giving dimension 2. Verify: $x^2 \\in W$ ($x^2|_0 = 0$, $(x^2)\'|_0 = 0$) ✓; same for $x^3$.',
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
          annotation: 'The $\\mathcal{B}$-coordinates are $(8/5, 9/5)$. Verify: $(8/5)(1,2)^\\top + (9/5)(3,1)^\\top = (8/5+27/5,\\;16/5+9/5) = (35/5,25/5) = (7,5)^\\top$ ✓.',
          strategyTitle: 'Compute coordinates',
          checkpoint: 'Coordinates depend on the basis. Same vector, different basis, different numbers — but they represent the same geometric object.',
        },
      ],
    },
  ],

  // ── Walkthroughs ───────────────────────────────────────────────────────────
  walkthroughs: [
    {
      id: 'wt-la6-002-find-basis',
      title: 'Finding a Basis and Dimension of a Subspace',
      prereqs: ['Span', 'Linear independence', 'Row reduction'],
      problem: 'Find a basis for the subspace of $\\mathbb{R}^3$ spanned by $\\mathbf{v}_1=[1,2,1]^\\top$, $\\mathbf{v}_2=[2,4,2]^\\top$, $\\mathbf{v}_3=[1,0,-1]^\\top$.',
      steps: [
        {
          label: 'Spot redundancy before computing',
          strategy: 'Scan for proportional vectors. $\\mathbf{v}_2 = 2\\mathbf{v}_1$ — immediately redundant.',
          explanation: '$\\mathbf{v}_2 = 2\\mathbf{v}_1$, so it contributes nothing to the span. The candidates reduce to $\\{\\mathbf{v}_1, \\mathbf{v}_3\\}$.',
          math: '\\mathbf{v}_2 = 2\\mathbf{v}_1 \\Rightarrow \\text{redundant}',
          gotcha: 'Scanning for proportional pairs first is faster than immediately running row reduction. Row reduction is the fallback when no obvious linear dependence is visible.',
        },
        {
          label: 'Check whether $\\mathbf{v}_1$ and $\\mathbf{v}_3$ are independent',
          strategy: 'Two vectors are independent iff they are not proportional. Check $\\mathbf{v}_3 \\neq c\\mathbf{v}_1$ for any $c$.',
          explanation: '$\\mathbf{v}_3/\\mathbf{v}_1$ componentwise: $1/1=1$, $0/2=0$, $-1/1=-1$ — not constant. So $\\mathbf{v}_3$ and $\\mathbf{v}_1$ are independent.',
          math: '\\mathbf{v}_3 \\neq c\\mathbf{v}_1 \\Rightarrow \\{\\mathbf{v}_1,\\mathbf{v}_3\\}\\text{ independent}',
        },
        {
          label: 'State the basis and dimension',
          strategy: 'A basis = a linearly independent spanning set. Dimension = number of basis vectors.',
          explanation: '$\\{\\mathbf{v}_1, \\mathbf{v}_3\\} = \\{[1,2,1]^\\top, [1,0,-1]^\\top\\}$ is a basis. Dimension = 2.',
          math: '\\dim(\\text{span}) = 2,\\quad \\text{basis} = \\{[1,2,1]^\\top,\\,[1,0,-1]^\\top\\}',
        },
      ],
    },
    {
      id: 'wt-la6-002-dimension-theorem',
      title: 'Using the Dimension Theorem: Rank + Nullity = n',
      prereqs: ['Rank', 'Null space', 'Dimension'],
      problem: 'A linear map $T: \\mathbb{R}^5 \\to \\mathbb{R}^3$ has $\\text{rank}(T) = 2$. What is $\\dim(\\ker T)$?',
      steps: [
        {
          label: 'Apply the rank-nullity theorem',
          strategy: 'For any linear map $T: V \\to W$ from a finite-dimensional $V$: $\\dim(V) = \\text{rank}(T) + \\text{nullity}(T)$.',
          explanation: '$\\dim(\\mathbb{R}^5) = 5 = \\text{rank}(T) + \\text{nullity}(T) = 2 + \\text{nullity}(T)$. So $\\text{nullity}(T) = 3$.',
          math: '\\dim(\\ker T) = 5 - 2 = 3',
        },
        {
          label: 'Sanity check: what are the constraints on rank?',
          strategy: '$\\text{rank}(T) \\leq \\min(\\dim(V), \\dim(W))$.',
          explanation: '$\\text{rank}(T) \\leq \\min(5,3)=3$. The claimed rank 2 is valid. If $T$ were claimed to have rank 4, that would be impossible ($4 > 3$).',
          math: '\\text{rank}(T) \\leq \\min(5,3) = 3',
          gotcha: 'Rank is bounded by BOTH the domain and codomain dimensions. A 5→3 map cannot have rank greater than 3, regardless of how many dimensions the domain has.',
        },
        {
          label: 'Geometric interpretation',
          strategy: 'The kernel is the "collapsed" directions; the image is the "surviving" directions.',
          explanation: '$T$ takes 5-dimensional input, kills 3 dimensions (null space), and maps the remaining 2 dimensions faithfully into $\\mathbb{R}^3$. The image is a 2-dimensional plane inside $\\mathbb{R}^3$.',
          math: '\\mathbb{R}^5 \\xrightarrow{T} \\mathbb{R}^3:\\; \\underbrace{3}_{\\ker} + \\underbrace{2}_{\\text{image}} = 5',
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
    {
      id: 'ch-la6-002-2',
      title: 'Basis for upper triangular matrices',
      difficulty: 'easy',
      problem: 'Let $T = \\{A \\in M_{2\\times 2} : A \\text{ is upper triangular}\\}$. Show $T$ is a subspace of $M_{2\\times 2}$, find a basis, and state $\\dim(T)$.',
      hint: 'Write the general upper triangular matrix with free parameters and read off the basis vectors. The subspace test is quick — the sum and scalar multiple of upper triangular matrices are still upper triangular.',
      walkthrough: [
        { expression: 'A = \\begin{bmatrix}a & b \\\\ 0 & c\\end{bmatrix} \\in T, \\quad a, b, c \\in \\mathbb{R}', annotation: 'General element of $T$: the lower-left entry is always 0, giving 3 free parameters.' },
        { expression: '\\mathbf{0} \\in T, \\quad A + B = \\begin{bmatrix}a_1+a_2 & b_1+b_2 \\\\ 0 & c_1+c_2\\end{bmatrix} \\in T, \\quad kA \\in T \\checkmark', annotation: 'All three subspace conditions hold trivially — upper triangularity is preserved by addition and scaling.' },
        { expression: 'A = a\\underbrace{\\begin{bmatrix}1&0\\\\0&0\\end{bmatrix}}_{B_1} + b\\underbrace{\\begin{bmatrix}0&1\\\\0&0\\end{bmatrix}}_{B_2} + c\\underbrace{\\begin{bmatrix}0&0\\\\0&1\\end{bmatrix}}_{B_3}', annotation: 'Each free parameter corresponds to one basis matrix. Read off $B_1, B_2, B_3$ directly from the parameterization.' },
        { expression: '\\text{Basis: } \\left\\{\\begin{bmatrix}1&0\\\\0&0\\end{bmatrix},\\begin{bmatrix}0&1\\\\0&0\\end{bmatrix},\\begin{bmatrix}0&0\\\\0&1\\end{bmatrix}\\right\\}, \\quad \\dim(T) = 3', annotation: 'Three parameters → dimension 3. Check: $T \\oplus \\text{Skew}_{2\\times 2}$ does not reconstruct $M_{2\\times2}$ (dim 4), so $T$ is not a complement of skew matrices — upper triangular and symmetric are different subspaces.' },
      ],
      answer: '$T$ is a 3-dimensional subspace of $M_{2\\times2}$. Basis: $\\{E_{11}, E_{12}, E_{22}\\}$. These are linearly independent (each has its nonzero entry in a different position).',
    },
    {
      id: 'ch-la6-002-3',
      title: 'Redundant spanning set — find the basis',
      difficulty: 'hard',
      problem: 'The set $S = \\{1+x,\\; 1-x,\\; x+x^2,\\; 1+x+x^2\\}$ spans some subspace $W \\subseteq P_2$. Find a basis for $W$, state $\\dim(W)$, and express the dependent vector as a linear combination of the others.',
      hint: 'Write each polynomial as a coordinate vector in the basis $\\{1, x, x^2\\}$, form a $4\\times 3$ matrix (one row per polynomial), and row reduce.',
      walkthrough: [
        { expression: '\\begin{bmatrix}1&1&0\\\\1&-1&0\\\\0&1&1\\\\1&1&1\\end{bmatrix} \\xrightarrow{R_2-R_1,\\;R_4-R_1} \\begin{bmatrix}1&1&0\\\\0&-2&0\\\\0&1&1\\\\0&0&1\\end{bmatrix}', annotation: 'Coordinate vectors (rows): $1+x\\mapsto[1,1,0]$, $1-x\\mapsto[1,-1,0]$, $x+x^2\\mapsto[0,1,1]$, $1+x+x^2\\mapsto[1,1,1]$. Subtract row 1 from row 2 and row 4.' },
        { expression: '\\xrightarrow{R_2 \\div (-2)} \\begin{bmatrix}1&1&0\\\\0&1&0\\\\0&1&1\\\\0&0&1\\end{bmatrix} \\xrightarrow{R_1-R_2,\\;R_3-R_2} \\begin{bmatrix}1&0&0\\\\0&1&0\\\\0&0&1\\\\0&0&1\\end{bmatrix}', annotation: 'Pivot in row 2, then eliminate. Row 3 becomes $[0,0,1]$, same as row 4 — the 4th polynomial is now visibly redundant.' },
        { expression: '\\xrightarrow{R_4-R_3} \\begin{bmatrix}1&0&0\\\\0&1&0\\\\0&0&1\\\\0&0&0\\end{bmatrix}, \\quad \\text{rank} = 3', annotation: 'Row 4 zeros out. Rank = 3 = $\\dim(P_2)$, so $W = P_2$. The first 3 rows (polynomials) are the pivot rows.' },
        { expression: '1+x+x^2 = \\tfrac{1}{2}(1+x) + \\tfrac{1}{2}(1-x) + (x+x^2)', annotation: 'Read the dependency from the row operation $R_4 = R_1$. Verify: $\\tfrac{1}{2}(1+x)+\\tfrac{1}{2}(1-x)+(x+x^2) = 1+x+x^2$ ✓. The 4th vector is a combination of the first three.' },
      ],
      answer: 'Basis for $W$: $\\{1+x, 1-x, x+x^2\\}$. $\\dim(W) = 3$, so $W = P_2$. Dependent vector: $1+x+x^2 = \\frac{1}{2}(1+x) + \\frac{1}{2}(1-x) + (x+x^2)$.',
    },
  ],

  mentalModel: [
    'Basis = independent spanning set. The two properties are always in tension: add a vector → might lose independence; remove a vector → might lose span.',
    'Dimension = number of vectors in any basis. It never changes regardless of which basis you choose.',
    'To find a basis of a subspace: parameterize with free variables and read off the spanning vectors.',
    'Dimension ≤ ambient dimension. Equality iff the subspace is the whole space.',
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
      hints: ['$\\{1,x,x^2,x^3\\}$ has 4 vectors in a 3-dimensional space — too many (linearly dependent). $\\{1+x, 2+2x, x^2\\}$ is dependent: $2+2x = 2(1+x)$. $\\{x, x^2\\}$ only has 2 vectors — cannot span the 3-dimensional $P_2$. $\\{1-x, 1+x, x^2\\}$: check independence — the only solution to $a(1-x)+b(1+x)+cx^2=0$ is $a=b=c=0$. ✓'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-002-6',
      type: 'choice',
      text: 'The subspace $W = \\{(x,y,z) \\in \\mathbb{R}^3 : x - y + 2z = 0\\}$ has dimension:',
      options: ['1', '2', '3', '0'],
      answer: '2',
      hints: ['$W$ is the null space of the $1 \\times 3$ matrix $[1,-1,2]$. Rank-Nullity: $\\text{rank} + \\text{nullity} = 3$. Rank = 1 (one nonzero row), so nullity = 2. Or: $x = y - 2z$ leaves $y, z$ free — two parameters, dimension 2. Basis: set $(y,z)=(1,0)$ → $(1,1,0)$; set $(y,z)=(0,1)$ → $(-2,0,1)$.'],
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
      hints: ['A Hermitian operator on $\\mathbb{C}^n$ has at most $n$ distinct eigenvalues (the characteristic polynomial has degree $n$). The dimension of the state space bounds the number of distinguishable measurement outcomes — more dimensions = more information capacity.'],
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
        'Data becoming increasingly sparse as dimension grows — exponentially more data needed to fill the space',
        'The basis vectors becoming linearly dependent in high dimensions',
      ],
      answer: 'Data becoming increasingly sparse as dimension grows — exponentially more data needed to fill the space',
      hints: ['In dimension $p$, to have $k$ samples per unit length in each dimension requires $k^p$ total samples. As $p$ grows, the space has exponentially more "volume" — any fixed dataset becomes increasingly sparse. This is purely a consequence of the dimension of the feature vector space.'],
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
    detectIncorrectApplication: 'Catch misuse of the dimension theorem — e.g., $n+1$ vectors in dimension $n$ cannot be independent; $n-1$ vectors cannot span.',
    transferToUnfamiliar: 'Apply rank-nullity to determine the dimensions of any kernel/image pair; use the constraint-counting argument to find dimensions of subspaces in polynomial and matrix spaces.',
  },

  misconceptions: [
    {
      falseBelief: 'A spanning set is a basis.',
      whyStudentsThinkIt: 'Spanning is part of the definition — students focus on it and forget about independence.',
      correctionExample: '$\\{1, x, x^2, x+1\\}$ spans $P_2$ but is NOT a basis: it has 4 vectors in a 3-dimensional space, so at least one is redundant (and indeed $x+1 = 1+x$ is a combination of the others). A spanning set must also be independent to be a basis.',
      contrastCase: '$\\{1, x, x^2\\}$ spans $P_2$ AND is independent — it is a basis. To remove redundancy from a spanning set, keep reducing until independence holds.',
    },
    {
      falseBelief: 'Different bases of the same space have different sizes.',
      whyStudentsThinkIt: 'Students may think that some bases are "more efficient" than others and could have fewer vectors.',
      correctionExample: '$\\{(1,0), (0,1)\\}$ and $\\{(1,1), (1,-1)\\}$ are both bases for $\\mathbb{R}^2$ — both have exactly 2 vectors. The Steinitz exchange lemma guarantees any two bases of the same space have the same size, making "dimension" well-defined.',
      contrastCase: 'In $P_2$, any basis has exactly 3 vectors. You cannot find a 2-vector basis (it would only span a 2D subspace) or need more than 3 (they would be dependent).',
    },
  ],

  transferPrompts: [
    {
      situation: 'You need to determine how many independent parameters describe a family of matrices (e.g., symmetric, upper triangular).',
      competingTechniques: 'Count by inspection, enumerate all elements, use rank.',
      whyThisTechniqueWins: 'The dimension of the space equals the number of free parameters in the general element. Write the general element with unknowns, read off the number of free variables — that\'s the dimension. This avoids explicit basis construction.',
    },
    {
      situation: 'You want to check if a set of $n$ vectors is a basis for an $n$-dimensional space.',
      competingTechniques: 'Check both span and independence; compute the determinant.',
      whyThisTechniqueWins: 'By the dimension theorem, for a set of exactly $n$ vectors in an $n$-dimensional space, independence and spanning are equivalent — you only need to check one. For $\\mathbb{R}^n$, form the matrix of the vectors and check if it\'s invertible (det $\\neq 0$). This halves the work.',
    },
  ],

  semantics: {
    core: [
      { symbol: '\\{\\mathbf{b}_1,\\ldots,\\mathbf{b}_n\\}', meaning: 'A basis for V: a linearly independent spanning set; the number of vectors n is dim(V)' },
      { symbol: '[\\mathbf{v}]_{\\mathcal{B}}', meaning: 'The coordinate vector of v in basis B: the unique (c1,...,cn) such that v = c1 b1 + ⋯ + cn bn' },
      { symbol: '\\dim(V)', meaning: 'Dimension of V: the number of vectors in any basis; invariant under change of basis and isomorphism' },
      { symbol: '\\text{rank}(A) + \\text{nullity}(A) = n', meaning: 'Rank-Nullity theorem: pivot columns + free columns = total columns (n); column count of A' },
      { symbol: '\\dim(W_1 + W_2) = \\dim W_1 + \\dim W_2 - \\dim(W_1 \\cap W_2)', meaning: 'Inclusion-exclusion for subspace dimensions; analogous to |A ∪ B| = |A| + |B| − |A ∩ B|' },
    ],
    rulesOfThumb: [
      'dim(P_n) = n+1, dim(M_{m×n}) = mn — each free entry or coefficient is one dimension.',
      'In an n-dimensional space, n vectors are a basis iff they are independent (OR iff they span) — checking one property is enough when the count matches.',
      'Each independent linear constraint on a subspace reduces dimension by exactly 1; k independent constraints give dim = n − k.',
      'Row-reduce the matrix of candidate basis vectors: pivot rows survive, zero rows are redundant — the rank equals the dimension of the span.',
      'Coordinates change with the basis; the vector does not. Changing basis = choosing a different reference frame, not a different mathematical object.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { id: 'la6-001', label: 'Abstract Vector Spaces', reason: 'Vector spaces and subspaces are the setting; the definition of basis requires knowing what a vector space is' },
      { id: 'la2-001', label: 'Null space and column space', reason: 'Concrete instances of basis and dimension: null space basis found via RREF free variables, column space via pivot columns' },
    ],
    futureLinks: [
      { id: 'la6-003', label: 'Linear Transformations', reason: 'Rank-nullity theorem appears here as dim(ker T) + dim(im T) = dim(domain); the proof uses bases directly' },
      { id: 'la6-006', label: 'Change of Basis', reason: 'The coordinate map [v]_B is the key object; switching bases is just changing the isomorphism F^n → V' },
    ],
  },

  debugging: [
    {
      commonError: 'Using a spanning set with too many vectors as a "basis."',
      symptom: 'The coordinate representation is not unique — different coefficient choices give the same vector.',
      whyItHappened: 'If the set is linearly dependent, some vector is a combination of others. The extra vector creates multiple representations: add and subtract it to redistribute coefficients.',
      repairStrategy: 'Row-reduce the matrix of basis candidates. Keep only the pivot columns (rows) — these form a maximally independent subset. The number of pivots = the rank = the dimension.',
    },
    {
      commonError: 'Confusing the dimension of the domain/codomain with the rank when applying rank-nullity.',
      symptom: 'For a $5 \\times 8$ matrix, student says nullity = $5 - \\text{rank}$ instead of $8 - \\text{rank}$.',
      whyItHappened: 'Rank-Nullity sums over COLUMNS ($n$), not rows ($m$). The null space lives in the domain $\\mathbb{R}^n$ (columns), not the codomain $\\mathbb{R}^m$ (rows).',
      repairStrategy: 'Remember: rank + nullity = number of COLUMNS. The null space is a subspace of the domain (columns). Write it as "pivot columns + free columns = total columns."',
    },
  ],
};
