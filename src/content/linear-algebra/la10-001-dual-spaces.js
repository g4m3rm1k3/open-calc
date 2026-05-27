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
  },

  intuition: {
    prose: [
      'Where you are in the story: for nine chapters you have worked with vectors as columns of numbers, matrices as grids of numbers, and linear maps as matrix multiplications. This has been powerful, but it has obscured something subtle. When you write $\\mathbf{a}^\\top \\mathbf{x}$ — a row vector times a column vector — you are doing something conceptually different from $\\mathbf{a}^\\top$ times $\\mathbf{x}$: you are applying a function to a vector. The row vector is not a vector; it is a **linear functional** — a machine that eats a vector and produces a scalar. Chapter 10 lifts the entire subject into the abstract setting where this distinction becomes precise and powerful.',
      'Start with a concrete linear functional. Let $V = \\mathbb{R}^2$ and define $f(x,y) = 3x - 2y$. Check that $f$ is linear: $f(u+v) = f(u)+f(v)$ and $f(cv) = cf(v)$ both hold. The function $f$ takes a 2D vector and produces a single number. There are infinitely many such functions — one for each choice of coefficients $(a,b)$ in $f(x,y) = ax+by$. The collection of all linear functionals $V \\to \\mathbb{R}$ is itself a vector space, called the **dual space** $V^*$, with addition $(f+g)(v) = f(v)+g(v)$ and scalar multiplication $(cf)(v) = c f(v)$. A fundamental theorem: $\\dim V^* = \\dim V$.',
      'Every basis $\\{\\mathbf{e}_1, \\ldots, \\mathbf{e}_n\\}$ of $V$ has a corresponding **dual basis** $\\{e^1, \\ldots, e^n\\}$ of $V^*$ defined by $e^i(\\mathbf{e}_j) = \\delta^i_j$ (1 if $i=j$, 0 otherwise). For the standard basis of $\\mathbb{R}^2$: $e^1(x,y) = x$ (picks out the first component) and $e^2(x,y) = y$ (picks out the second). Any functional decomposes as $f = f(\\mathbf{e}_1)\\, e^1 + f(\\mathbf{e}_2)\\, e^2 + \\cdots$. So $f(x,y) = 3x-2y$ becomes $f = 3\\cdot e^1 + (-2)\\cdot e^2$ — the coefficients of $f$ in the dual basis are exactly the values of $f$ on the primal basis vectors.',
      'Now the reason for row vs column vectors becomes precise. A column vector $\\mathbf{x} \\in \\mathbb{R}^n$ represents a point in the original space $V$. A row vector $\\mathbf{a}^\\top$ represents an element of $V^*$ — a linear functional. The product $\\mathbf{a}^\\top \\mathbf{x}$ is the application of the functional $\\mathbf{a}^\\top$ to the vector $\\mathbf{x}$, producing a scalar. This is not just a notational distinction — it explains why the transpose arises so naturally. In physics, "bra" vectors $\\langle \\phi |$ live in the dual space; "ket" vectors $|\\psi\\rangle$ live in the original space; and the inner product $\\langle \\phi | \\psi \\rangle$ is a functional applied to a vector.',
      '**Predict before reading on:** Let $B = \\{\\mathbf{b}_1 = (1,1), \\mathbf{b}_2 = (1,-1)\\}$ be a basis of $\\mathbb{R}^2$. The dual basis vector $e^1_B$ must satisfy $e^1_B(\\mathbf{b}_1) = 1$ and $e^1_B(\\mathbf{b}_2) = 0$. If $e^1_B(x,y) = ax + by$, what are $a$ and $b$? Set up the equations and solve before reading on.',
      'The system $a + b = 1$, $a - b = 0$ gives $a = b = 1/2$, so $e^1_B(x,y) = \\frac{x+y}{2}$. In matrix language: if $B$ is the matrix with $\\mathbf{b}_1, \\mathbf{b}_2$ as columns, then the dual basis vectors are the rows of $B^{-1}$. This is the computational way to find dual bases: $\\text{dual\\_basis} = (B^{-1})^\\top$, whose rows are the dual basis vectors. Verification: $(B^{-1})^\\top B$ should be the identity — the Kronecker delta condition in matrix form.',
      'The **dual map** (or transpose) has a beautiful coordinate-free definition. If $T: V \\to W$ is linear, its dual map $T^*: W^* \\to V^*$ is defined by $(T^* g)(\\mathbf{v}) = g(T\\mathbf{v})$ — pre-compose with $T$. In matrix coordinates, if $T$ has matrix $A$, then $T^*$ has matrix $A^\\top$. This is the abstract definition of the transpose: not "flip along the diagonal" but "precompose the output functionals with $T$". The fundamental identity $\\langle T\\mathbf{v}, g \\rangle = \\langle \\mathbf{v}, T^*g \\rangle$ (where $\\langle \\cdot, \\cdot \\rangle$ is the dual pairing $g(\\mathbf{v})$) is the abstract adjoint relation that unifies the transpose, the Hermitian conjugate, and the adjoint operator in functional analysis.',
      'The **double dual** $V^{**} = (V^*)^*$ is the space of linear functionals on $V^*$. There is a natural map $\\iota: V \\to V^{**}$ defined by $\\iota(\\mathbf{v})(f) = f(\\mathbf{v})$ — a vector $\\mathbf{v}$ defines a functional on $V^*$ by evaluating each $f$ at $\\mathbf{v}$. For finite-dimensional $V$, this map is an isomorphism: $V \\cong V^{**}$. The word "natural" here is technical and important — the isomorphism $V \\cong V^*$ requires choosing an inner product (not natural), but $V \\cong V^{**}$ requires no extra structure at all. This is the first hint of category theory: isomorphisms that are "natural" in a precise sense.',
      'Where this is heading: the next lesson extends scalar-valued linear functionals to multilinear maps on multiple copies of $V$ and $V^*$ — that is, tensors. Tensors are how the dual space perspective on vectors naturally generalizes: stress tensors in mechanics, metric tensors in relativity, and the curvature tensor in differential geometry are all multilinear maps built from copies of $V$ and $V^*$. The abstract formalism you are building now is the foundation for all of it.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 5 — Advanced Theory',
        body: '**Previous (Chapter 9):** Iterative Solvers — Jacobi, CG, GMRES, preconditioning, sparse direct solvers.\n**This lesson:** Dual Spaces — linear functionals, dual basis, row vectors as covectors, dual map = transpose, double dual.\n**Next (Lesson 2):** Tensor Products — multilinear maps, tensor algebra, Kronecker product in computation.',
      },
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
        id: 'PythonNotebook',
        title: 'Dual Spaces in Python',
        mathBridge: 'Compute dual bases, verify the Kronecker delta property, and confirm that the matrix transpose is the dual map.',
        caption: 'Dual basis = rows of $B^{-1}$; the transpose is not a coincidence — it is the coordinate expression of the dual map.',
        initialProps: {
          initialCells: [
            {
              id: 1,

              cellTitle: 'Dual basis construction and verification',
              prose: 'Compute the dual basis for a non-standard basis of R^3 and verify the Kronecker delta property. Then express a linear functional in the dual basis.',
              code: `import numpy as np

# Basis for R^3: columns of B are basis vectors
B = np.array([[1, 1, 0],
              [0, 1, 1],
              [1, 0, 1]], dtype=float)

print("Basis B (columns are basis vectors):")
print(B)

# Dual basis: rows of B^{-T} = (B^{-1})^T
# Property: dual_basis[i] @ B[:, j] = delta_{ij}
B_inv = np.linalg.inv(B)
dual_basis = B_inv.T  # rows are dual basis vectors

print("\\nDual basis (rows are dual basis vectors):")
print(np.round(dual_basis, 4))

# Verify Kronecker delta: dual_basis @ B should be identity
check = dual_basis @ B
print("\\nVerification: dual_basis @ B =")
print(np.round(check, 10))
print(f"Is identity? {np.allclose(check, np.eye(3))}")

# Express a linear functional f(x,y,z) = 2x - y + 3z in dual basis
f_on_primal = np.array([2., -1., 3.])  # f(e1), f(e2), f(e3)... wait, these are coords
# f in coordinates: f(x,y,z) = 2x - y + 3z, so [2, -1, 3] is the covector
f_row = np.array([2., -1., 3.])

# To express in dual basis: coefficients are f applied to each primal basis vector
# f_coeff[i] = f(b_i) = f_row @ B[:, i]
f_coeffs = f_row @ B
print(f"\\nFunctional f = [2, -1, 3] in standard basis")
print(f"f(b1), f(b2), f(b3) = {f_coeffs}  (coordinates in dual basis)")

# Verify: reconstruct f from dual basis
f_reconstructed = sum(f_coeffs[i] * dual_basis[i] for i in range(3))
print(f"Reconstructed: {f_reconstructed}  (should match [2, -1, 3])")
`,
            },
            {
              id: 2,

              cellTitle: 'Transpose as the dual map',
              prose: 'Verify the abstract definition of the dual map: T*(g) = g ∘ T. Show that this forces T* to have matrix A^T.',
              code: `import numpy as np

# Linear map T: R^3 -> R^2, represented by matrix A
A = np.array([[1, 2, 3],
              [4, 5, 6]], dtype=float)

# The dual map T*: (R^2)* -> (R^3)* is T*(g) = g ∘ T
# In coordinates: if g is represented by row vector w^T,
# then T*(g) is represented by w^T A = (A^T w)^T
# So the matrix of T* is A^T (acting on column vectors of R^3*)

print("Matrix of T:", A.shape)
print(A)
print("\\nMatrix of dual map T* = A^T:", A.T.shape)
print(A.T)

# Verify adjoint identity: <Tv, g> = <v, T*g>
# i.e., g(Tv) = (T*g)(v) for all v ∈ R^3, g ∈ (R^2)*
v = np.array([1., 2., 3.])
g = np.array([1., -1.])   # linear functional on R^2: g(x,y) = x - y

Tv = A @ v
lhs = g @ Tv             # g applied to T(v) = <Tv, g>

T_star_g = A.T @ g       # T*(g) is the functional A^T g on R^3
rhs = T_star_g @ v       # (T*g) applied to v = <v, T*g>

print(f"\\n<T(v), g> = g(Av)  = {lhs}")
print(f"<v, T*(g)> = (A^T g)·v = {rhs}")
print(f"Equal? {np.isclose(lhs, rhs)}")
print("\\nConclusion: transpose is not an accident — it IS the dual map in coordinates.")
`,
            },
          ],
        },
      },
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
      title: 'Dual basis for a non-standard basis',
      problem: 'Find the dual basis of $B = \\{\\mathbf{b}_1=(1,1),\\, \\mathbf{b}_2=(1,-1)\\}$ in $\\mathbb{R}^2$. Then express the functional $f(x,y) = 5x + y$ in the dual basis.',
      steps: [
        { explanation: 'The dual basis vector $e^1_B$ must satisfy $e^1_B(\\mathbf{b}_1)=1$ and $e^1_B(\\mathbf{b}_2)=0$. Write $e^1_B(x,y) = ax+by$.' },
        { explanation: 'System: $a+b=1$ (from $e^1_B(1,1)=1$) and $a-b=0$ (from $e^1_B(1,-1)=0$). Solving: $a=\\tfrac{1}{2}$, $b=\\tfrac{1}{2}$, so $e^1_B(x,y) = \\tfrac{x+y}{2}$.' },
        { explanation: 'For $e^2_B$: $e^2_B(1,1)=0$ and $e^2_B(1,-1)=1$. System: $c+d=0$ and $c-d=1$, giving $c=\\tfrac{1}{2}$, $d=-\\tfrac{1}{2}$. So $e^2_B(x,y)=\\tfrac{x-y}{2}$.' },
        { explanation: 'Verify Kronecker delta: $e^1_B(1,1)=\\tfrac{2}{2}=1$ ✓, $e^1_B(1,-1)=0$ ✓, $e^2_B(1,1)=0$ ✓, $e^2_B(1,-1)=1$ ✓.' },
        { explanation: 'Express $f(x,y)=5x+y$ in dual basis: $f = f(\\mathbf{b}_1)\\cdot e^1_B + f(\\mathbf{b}_2)\\cdot e^2_B$. Compute $f(1,1)=6$, $f(1,-1)=4$. So $f = 6e^1_B + 4e^2_B$. Check: $6\\cdot\\tfrac{x+y}{2}+4\\cdot\\tfrac{x-y}{2} = 3(x+y)+2(x-y)=5x+y$ ✓.' },
      ],
    },
    {
      id: 'ex-la10-001-2',
      title: 'Dual map equals transpose',
      problem: 'Let $T: \\mathbb{R}^2 \\to \\mathbb{R}^2$ have matrix $A = \\begin{pmatrix}2&1\\\\0&3\\end{pmatrix}$. Let $g: \\mathbb{R}^2 \\to \\mathbb{R}$ be the functional $g(x,y) = x - y$. Compute the dual map $T^*(g)$ and verify it equals pre-composing: $(g \\circ T)(v)$.',
      steps: [
        { explanation: 'Dual map definition: $T^*(g) = g \\circ T$. So $(T^*(g))(v) = g(Tv)$ for any $v \\in \\mathbb{R}^2$.' },
        { explanation: 'Compute $T(x,y) = (2x+y,\\, 3y)$. Then $g(T(x,y)) = (2x+y) - (3y) = 2x - 2y$.' },
        { explanation: 'So $T^*(g) = $ the functional $h(x,y) = 2x - 2y$, which has row vector $[2, -2]$.' },
        { explanation: 'Matrix check: $g$ has row vector $[1,-1]$. The dual map $T^*$ uses matrix $A^\\top = \\begin{pmatrix}2&0\\\\1&3\\end{pmatrix}$. Then $A^\\top [1,-1]^\\top = [2\\cdot1+0\\cdot(-1),\\, 1\\cdot1+3\\cdot(-1)]^\\top = [2,-2]^\\top$ ✓.' },
      ],
    },
    {
      id: 'ex-la10-001-3',
      title: 'Annihilator and dimension count',
      problem: 'In $\\mathbb{R}^3$, let $W = \\text{span}\\{(1,0,0),(0,1,0)\\}$ (the $xy$-plane). Find the annihilator $W^0 \\subseteq (\\mathbb{R}^3)^*$ and verify $\\dim W + \\dim W^0 = \\dim \\mathbb{R}^3$.',
      steps: [
        { explanation: 'The annihilator $W^0 = \\{f \\in V^* : f(w)=0 \\text{ for all } w \\in W\\}$. Write $f(x,y,z) = ax+by+cz$.' },
        { explanation: '$f$ must vanish on $(1,0,0)$: $a=0$. And on $(0,1,0)$: $b=0$. So $f(x,y,z) = cz$ for any $c \\in \\mathbb{R}$.' },
        { explanation: '$W^0 = \\text{span}\\{e^3\\}$ where $e^3(x,y,z)=z$ — the functional that picks out the $z$-coordinate.' },
        { explanation: 'Dimension check: $\\dim W = 2$, $\\dim W^0 = 1$, $\\dim \\mathbb{R}^3 = 3$. Indeed $2+1=3$ ✓. The annihilator is the "orthogonal complement in dual space."' },
      ],
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
    { id: 'cp-la10-001-1', label: 'Read the concrete functional example', type: 'read' },
    { id: 'cp-la10-001-2', label: 'Read the dual basis Kronecker delta definition', type: 'read' },
    { id: 'cp-la10-001-3', label: 'Read how transpose equals the dual map', type: 'read' },
    { id: 'cp-la10-001-4', label: 'Work the dual basis computation in the notebook', type: 'lab' },
    { id: 'cp-la10-001-5', label: 'Verify adjoint property in the dual map cell', type: 'lab' },
    { id: 'cp-la10-001-6', label: 'Trace the non-standard basis dual basis example', type: 'example' },
    { id: 'cp-la10-001-7', label: 'Trace the transpose-as-dual-map example', type: 'example' },
    { id: 'cp-la10-001-8', label: 'Find the annihilator for a subspace of your choice', type: 'challenge' },
  ],

  assessment: 'For the basis $B = \\{(1,1), (1,-1)\\}$ of $\\mathbb{R}^2$: (a) find the dual basis $\\{e^1, e^2\\}$, (b) verify $e^i(e_j) = \\delta^i_j$, (c) express the linear functional $f(x,y) = 2x + 3y$ in terms of the dual basis.',

  quiz: [
    {
      id: 'q-la10-001-1',
      type: 'choice',
      text: 'The dual space $V^*$ consists of:',
      options: ['All subspaces of $V$', 'All linear maps $V \\to \\mathbb{F}$', 'The orthogonal complement of $V$', 'The set of invertible maps on $V$'],
      answer: 'All linear maps $V \\to \\mathbb{F}$',
      hints: ['A linear functional is a scalar-valued linear map.', 'The dual space collects ALL such maps.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-001-2',
      type: 'choice',
      text: 'For finite-dimensional $V$, what is $\\dim V^*$?',
      options: ['$0$', '$\\dim V - 1$', '$\\dim V$', '$(\\dim V)^2$'],
      answer: '$\\dim V$',
      hints: ['The dual basis has the same number of elements as the primal basis.', 'Each basis vector $e_i$ gives one dual basis vector $e^i$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-001-3',
      type: 'choice',
      text: 'For the standard basis $\\{e_1, e_2\\}$ of $\\mathbb{R}^2$, what is $e^1(e_2)$?',
      options: ['$1$', '$0$', '$-1$', 'Undefined'],
      answer: '$0$',
      hints: ['Dual basis satisfies $e^i(e_j) = \\delta^i_j$.', '$\\delta^1_2 = 0$ since $1 \\neq 2$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-001-4',
      type: 'choice',
      text: 'In $\\mathbb{R}^2$ with basis $\\{(1,1),(1,-1)\\}$, the dual functional $e^1_B$ must satisfy which pair of conditions?',
      options: [
        '$e^1_B(1,1)=1$ and $e^1_B(1,-1)=0$',
        '$e^1_B(1,1)=0$ and $e^1_B(1,-1)=1$',
        '$e^1_B(1,1)=1$ and $e^1_B(1,-1)=1$',
        '$e^1_B(1,0)=1$ and $e^1_B(0,1)=0$',
      ],
      answer: '$e^1_B(1,1)=1$ and $e^1_B(1,-1)=0$',
      hints: ['Dual basis satisfies $e^i(b_j) = \\delta^i_j$.', '$e^1_B$ must be 1 on $b_1$ and 0 on $b_2$.'],
      reviewSection: 'examples',
    },
    {
      id: 'q-la10-001-5',
      type: 'choice',
      text: 'The formula for $e^1_B(x,y)$ when $B = \\{(1,1),(1,-1)\\}$ is:',
      options: ['$\\frac{x+y}{2}$', '$\\frac{x-y}{2}$', '$x + y$', '$x - y$'],
      answer: '$\\frac{x+y}{2}$',
      hints: ['Solve: $a+b=1$, $a-b=0$ for $e^1_B(x,y)=ax+by$.', 'Adding: $2a=1$, so $a=b=\\frac{1}{2}$.'],
      reviewSection: 'examples',
    },
    {
      id: 'q-la10-001-6',
      type: 'choice',
      text: 'If $T: V \\to W$ has matrix $A$, the dual map $T^*: W^* \\to V^*$ has matrix:',
      options: ['$A$', '$A^{-1}$', '$A^\\top$', '$A^{-\\top}$'],
      answer: '$A^\\top$',
      hints: ['The dual map pre-composes with $T$: $T^*(g) = g \\circ T$.', 'In coordinates this gives the matrix transpose.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-001-7',
      type: 'choice',
      text: 'A row vector $\\mathbf{a}^\\top$ is best interpreted as:',
      options: ['A column vector laid sideways', 'An element of $(\\mathbb{R}^n)^*$ — a linear functional', 'The transpose of a square matrix', 'A gradient vector only'],
      answer: 'An element of $(\\mathbb{R}^n)^*$ — a linear functional',
      hints: ['$\\mathbf{a}^\\top \\mathbf{x}$ computes the value of the functional $\\mathbf{a}^\\top$ on $\\mathbf{x}$.', 'Row vectors and column vectors live in dual spaces of each other.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-001-8',
      type: 'choice',
      text: 'For $W \\subseteq V$ with $\\dim V = 5$ and $\\dim W = 2$, what is $\\dim W^0$ (the annihilator)?',
      options: ['$2$', '$3$', '$5$', '$7$'],
      answer: '$3$',
      hints: ['The annihilator theorem: $\\dim W + \\dim W^0 = \\dim V$.', '$5 - 2 = 3$.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la10-001-9',
      type: 'choice',
      text: 'The natural isomorphism $V \\cong V^{**}$ sends $\\mathbf{v}$ to:',
      options: [
        'The functional $f \\mapsto f(\\mathbf{v})$ in $V^{**}$',
        'The dual basis vector $e^i$ corresponding to $\\mathbf{v}$',
        'The projection onto the span of $\\mathbf{v}$',
        'The linear map $T: V \\to V$ that fixes $\\mathbf{v}$',
      ],
      answer: 'The functional $f \\mapsto f(\\mathbf{v})$ in $V^{**}$',
      hints: ['$V^{**} = (V^*)^*$ — functionals that eat functionals.', 'Evaluation: $\\iota(\\mathbf{v})$ eats $f \\in V^*$ and returns $f(\\mathbf{v})$.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la10-001-10',
      type: 'choice',
      text: 'The annihilator of the $xy$-plane in $\\mathbb{R}^3$ is spanned by:',
      options: [
        'The functional $f(x,y,z) = z$',
        'The functional $f(x,y,z) = x$',
        'The functional $f(x,y,z) = x + y$',
        'The zero functional',
      ],
      answer: 'The functional $f(x,y,z) = z$',
      hints: ['Annihilator: must vanish on all of $W = \\{z=0\\}$.', 'Only the $z$-component survives; $x$ and $y$ terms must be zero.'],
      reviewSection: 'examples',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Compute the dual basis for any given basis of $\\mathbb{R}^n$ by solving the Kronecker delta system; express any functional in the dual basis.',
    explainVerbally: 'Explain why row vectors are naturally dual to column vectors, and why the transpose is the coordinate form of the dual map.',
    detectIncorrectApplication: 'Catch the error of treating the dual basis as the same as the original basis, or confusing $V^*$ with an inner product orthogonal complement.',
    transferToUnfamiliar: 'Apply duality to identify the annihilator of a given subspace and verify the dimension formula $\\dim W + \\dim W^0 = \\dim V$.',
  },

  misconceptions: [
    {
      falseBelief: 'The dual basis is the same as the original basis.',
      whyStudentsThinkIt: 'For the standard basis $\\{e_1,e_2\\}$ of $\\mathbb{R}^2$, the dual basis functionals $e^1(x,y)=x$ and $e^2(x,y)=y$ look like they "extract $e_1$ and $e_2$," leading to confusion between basis vectors and dual basis functionals.',
      correctionExample: 'For basis $B=\\{(1,1),(1,-1)\\}$, the dual basis $e^1_B(x,y)=\\frac{x+y}{2}$ is NOT $(1,1)$. It\'s a functional, not a vector — it lives in a different space.',
      contrastCase: 'The standard basis dual IS coordinate projection, but only because $e_i$ is already orthonormal. For general bases, dual basis $\\neq$ primal basis.',
    },
    {
      falseBelief: 'Dual space is the same as orthogonal complement.',
      whyStudentsThinkIt: 'Both involve "vectors that vanish on $W$," and the annihilator $W^0$ sounds like $W^\\perp$. Students conflate dual space (no inner product needed) with orthogonal complement (inner product required).',
      correctionExample: 'The annihilator $W^0$ lives in $V^*$ (functional space), not in $V$. Without an inner product, there is no notion of perpendicularity — but there IS a notion of a functional vanishing on $W$.',
      contrastCase: 'In $\\mathbb{R}^n$ with the standard inner product, $W^0$ and $W^\\perp$ are related by the Riesz identification $V^* \\cong V$, but they live in different spaces conceptually.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You have a machine learning model that outputs $\\mathbf{w}^\\top \\mathbf{x}$ (a linear classifier). A colleague says "the weight vector and input are the same kind of thing." How would you respond using dual space language?',
      competingTechniques: ['Treat $\\mathbf{w}$ and $\\mathbf{x}$ as both column vectors in $\\mathbb{R}^n$', 'Recognize $\\mathbf{w}^\\top$ as an element of the dual space $(\\mathbb{R}^n)^*$'],
      whyThisTechniqueWins: 'Dual space language clarifies the type: $\\mathbf{x}$ is a data point (vector), $\\mathbf{w}^\\top$ is a decision functional (covector). This distinction matters when changing coordinates — a basis change transforms them differently (contravariant vs. covariant).',
    },
    {
      situation: 'A system $A\\mathbf{x} = \\mathbf{b}$ has a solution iff $\\mathbf{b}$ is in the column space of $A$. Use duality (annihilator) to reformulate this condition in terms of the left null space.',
      competingTechniques: ['Check column space membership directly (row reduce and verify)', 'Use the annihilator: $\\mathbf{b} \\in \\text{col}(A)$ iff $f(\\mathbf{b})=0$ for all $f \\in \\text{col}(A)^0$'],
      whyThisTechniqueWins: 'The dual condition is $A^\\top \\mathbf{y} = 0 \\Rightarrow \\mathbf{y}^\\top \\mathbf{b} = 0$ (Fredholm alternative), which is useful in theory and in sensitivity analysis — it characterizes solvability without explicitly constructing the column space.',
    },
  ],

  debugging: [
    {
      commonError: 'Writing the dual basis as column vectors instead of as functionals (linear maps).',
      symptom: 'Student computes $e^1_B = (\\frac{1}{2}, \\frac{1}{2})$ as a column vector, then tries to use it as a vector in $V$ instead of a functional on $V$.',
      whyItHappened: 'For $\\mathbb{R}^n$ with the standard inner product, the Riesz map identifies functionals with vectors, making them look the same. Students skip the conceptual distinction.',
      repairStrategy: 'Always write dual basis elements as functions: $e^1_B(x,y) = \\frac{x+y}{2}$. Test: apply it to a vector and confirm you get a scalar. If you\'re "adding" a dual basis element to a primal basis element, something went wrong.',
    },
    {
      commonError: 'Applying the dual map in the wrong direction — using $A$ instead of $A^\\top$ for the dual map.',
      symptom: 'Given $T: V \\to W$ with matrix $A$, student computes $T^*(g)$ by multiplying $A$ (not $A^\\top$) times the row vector of $g$.',
      whyItHappened: 'The dual map goes from $W^*$ to $V^*$ (reversed direction), which is easy to forget. Students apply $T$ when they should apply $T^*$.',
      repairStrategy: 'Remember: $T^*$ reverses direction and uses $A^\\top$. Always check dimensions: if $T: \\mathbb{R}^n \\to \\mathbb{R}^m$, then $T^*: (\\mathbb{R}^m)^* \\to (\\mathbb{R}^n)^*$, so the matrix must be $m \\times n$ (which is $A^\\top$, not $A$).',
    },
  ],
};
