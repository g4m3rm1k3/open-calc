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
  },

  intuition: {
    prose: [
      'Take differentiation $D: P_3 \\to P_3$, $D(p) = p\'$. Test linearity: $D(p+q) = (p+q)\' = p\'+q\' = D(p)+D(q)$ ✓; $D(cp) = (cp)\' = cp\' = cD(p)$ ✓. Now find the kernel: $D(p) = 0$ iff $p\' = 0$ iff $p$ is constant — $\\ker(D) = P_0$ (constants), dimension 1. Image: $D(a_0 + a_1x + a_2x^2 + a_3x^3) = a_1 + 2a_2x + 3a_3x^2$ — any polynomial of degree $\\leq 2$ appears, so $\\text{im}(D) = P_2$, dimension 3. Rank-Nullity: $1 + 3 = 4 = \\dim P_3$ ✓. Contrast: $T(p) = p^2$ is NOT linear — $T(p+q) = (p+q)^2 = p^2 + 2pq + q^2 \\neq p^2 + q^2$. Linearity is preserved-combinations, not any function.',
      '**Key structural maps.** The **kernel** (or null space) of $T$ is $\\ker(T) = \\{\\mathbf{v} \\in V : T(\\mathbf{v}) = \\mathbf{0}_W\\}$ — the set of vectors that get mapped to zero. The **image** (or range) is $\\text{im}(T) = \\{T(\\mathbf{v}) : \\mathbf{v} \\in V\\} \\subseteq W$ — the set of all possible outputs. Both the kernel and image are subspaces (of $V$ and $W$ respectively).',
      '**Rank-nullity for linear transformations.** $\\dim(\\ker T) + \\dim(\\text{im } T) = \\dim V$. This is the abstract version of the rank-nullity theorem. The "rank" of $T$ is $\\dim(\\text{im } T)$ and the "nullity" is $\\dim(\\ker T)$.',
      '**From abstract to matrix.** Given a linear transformation $T: V \\to W$ and bases $\\mathcal{B}$ for $V$ and $\\mathcal{C}$ for $W$, there is a unique matrix $[T]_{\\mathcal{B}}^{\\mathcal{C}}$ that represents $T$ in those coordinates: $[T(\\mathbf{v})]_{\\mathcal{C}} = [T]_{\\mathcal{B}}^{\\mathcal{C}} [\\mathbf{v}]_{\\mathcal{B}}$. Every linear transformation between finite-dimensional spaces is represented by a matrix — once you pick bases.',
      '**The composition of linear maps is linear.** If $S: U \\to V$ and $T: V \\to W$ are both linear, then $T \\circ S: U \\to W$ is also linear. Proof: $(T \\circ S)(\mathbf{u}+\\mathbf{v}) = T(S(\\mathbf{u}+\\mathbf{v})) = T(S(\\mathbf{u})+S(\\mathbf{v})) = T(S(\\mathbf{u}))+T(S(\\mathbf{v})) = (T \\circ S)(\\mathbf{u})+(T \\circ S)(\\mathbf{v})$. The corresponding matrix operation is matrix multiplication: $[T \\circ S] = [T][S]$. This is why matrix multiplication is defined the way it is — it is the coordinate version of function composition for linear maps.',
      '**Projection as a linear transformation.** The orthogonal projection $P_{\\mathbf{a}}: \\mathbb{R}^n \\to \\mathbb{R}^n$ onto a subspace spanned by $\\mathbf{a}$, given by $P_{\\mathbf{a}}(\\mathbf{v}) = \\frac{\\mathbf{v} \\cdot \\mathbf{a}}{\\mathbf{a} \\cdot \\mathbf{a}} \\mathbf{a}$, is linear. The corresponding matrix is $P = \\frac{\\mathbf{a}\\mathbf{a}^T}{\\mathbf{a}^T\\mathbf{a}}$. This is a special linear transformation: $P^2 = P$ (projecting twice = projecting once — idempotent) and $P^T = P$ (symmetric). The kernel is the orthogonal complement of $\\mathbf{a}$, and the image is the span of $\\mathbf{a}$.',
      '**CNC motion and linear transformations.** In CNC 5-axis machining, the relationship between joint space (angle vector $\\boldsymbol{\\theta}$) and Cartesian task space (position $\\mathbf{p}$) is given by forward kinematics $\\mathbf{p} = f(\\boldsymbol{\\theta})$. While $f$ itself is nonlinear, the Jacobian $J = \\partial f / \\partial \\boldsymbol{\\theta}$ is a linear map that approximates $f$ near each configuration: $\\delta\\mathbf{p} \\approx J \\delta\\boldsymbol{\\theta}$. The kernel of $J$ is the **null space of the Jacobian** — the set of joint velocity vectors that produce zero end-effector motion. These are the "self-motions" of a redundant robot: joint configurations it can change without moving the tool. The image of $J$ is the set of end-effector velocities the robot can currently achieve.',
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'How to Find the Kernel and Image of a Linear Map (5 Steps)',
        body: '**Given:** A linear map $T: V \\to W$.\n**Step 1.** Verify linearity: check $T(\\mathbf{u}+\\mathbf{v}) = T(\\mathbf{u})+T(\\mathbf{v})$ and $T(c\\mathbf{v}) = cT(\\mathbf{v})$ (or equivalently $T(c\\mathbf{u}+d\\mathbf{v}) = cT(\\mathbf{u})+dT(\\mathbf{v})$).\n**Step 2.** Find $\\ker(T)$: set $T(\\mathbf{v}) = \\mathbf{0}$ and solve. For a matrix $A$: find the null space via RREF.\n**Step 3.** Find $\\text{im}(T)$: apply $T$ to each basis vector of $V$. The span of the resulting vectors is the image.\n**Step 4.** State rank $= \\dim(\\text{im}\\,T)$ and nullity $= \\dim(\\ker T)$.\n**Step 5.** Verify rank-nullity: rank + nullity $= \\dim(V)$.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 3 of 6 — Abstract Vector Spaces',
        body: '**Previous:** Basis and Dimension — measuring the size of a vector space.\n**This lesson:** Linear Transformations — maps between vector spaces that preserve addition and scalar multiplication, with kernel and image as the key structural subspaces.\n**Next:** Matrix Representations — how to write any linear transformation as a matrix once you choose bases.',
      },
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
        type: 'insight',
        title: 'Prediction',
        body: 'Before reading on: the map $T: P_2 \\to P_3$ defined by $T(p) = \\int_0^x p(t)\\,dt$ — is it linear? What is $T(1)$, $T(x)$, $T(x^2)$? What is $\\ker(T)$? What is $\\dim(\\text{im}(T))$?',
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
              prose: [
                'For T: R^4 -> R^3 given by matrix A, find ker(T) and im(T).',
                'Kernel = null space of A: `[~,~,V] = svd(A); null_cols = V(:, rank(A)+1:end)`. Image = column space of A: `[Q,R,E] = qr(A,\'vector\'); im_basis = A(:,E(1:rank(A)))`. Or simply: `rank(A)` tells you dim(im(T)), and `size(A,2) - rank(A)` gives dim(ker(T)) via rank-nullity.',
                'The rank-nullity check: `disp(rank(A) + size(null_cols,2))` should equal `size(A,2)` (number of columns = domain dimension). Verify the kernel: `disp(norm(A * null_cols))` should be near zero. Verify the image: `disp(rank([A, b]))` — if it equals `rank(A)`, then b is in the image (the system Ax=b is consistent).',
              ],
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
              prose: [
                'Represent D: P_3 -> P_2 (differentiation) as a matrix using standard bases.',
                'For each basis vector of P_3 — namely 1, x, x², x³ — apply D and write the result in the P_2 basis {1, x, x²}. D(1)=0=[0;0;0], D(x)=1=[1;0;0], D(x²)=2x=[0;2;0], D(x³)=3x²=[0;0;3]. Stack as columns: `M = [0 1 0 0; 0 0 2 0; 0 0 0 3]`. This 3×4 matrix IS differentiation.',
                'Test: `p = [1;2;3;4]` encodes 1+2x+3x²+4x³. `M*p` should give [2;6;12] encoding 2+6x+12x² = D(1+2x+3x²+4x³) ✓. The kernel of M is the span of [1;0;0;0] (constants — their derivative is zero), confirming ker(D) = constants. The image of M is all of P_2 (rank=3=dim(P_2)), confirming D is surjective.',
              ],
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
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Matrix representation of T(p) = p + p\'',
              prose: [
                'To represent $T: P_3 \\to P_3$, $T(p) = p + p\'$ as a matrix: compute $T$ applied to each basis vector $\\{1, x, x^2, x^3\\}$, then write the result as a coordinate vector. These become the columns of the matrix $[T]$.',
                'Column-by-column: T(1) = 1+0 = 1 → [1,0,0,0]. T(x) = x+1 → [1,1,0,0]. T(x²) = x²+2x → [0,2,1,0]. T(x³) = x³+3x² → [0,0,3,1]. Stack as columns: `M = np.array([[1,1,0,0],[0,1,2,0],[0,0,1,3],[0,0,0,1]])`. The upper-bidiagonal structure reflects the "shift by one degree" that differentiation causes.',
                'Verify: `p_vec = np.array([1,2,3,4])` (encodes 1+2x+3x²+4x³). `T_p = M @ p_vec` should encode `(1+2x+3x²+4x³) + (2+6x+12x²)` = `3+8x+15x²+4x³` → [3,8,15,4]. Check: `np.allclose(M @ p_vec, [3,8,15,4])` ✓. This single matrix-vector multiplication captures both the polynomial and its derivative.',
              ],
              code: `import numpy as np

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
              cellTitle: 'Rank-nullity for differentiation D: P_4 → P_3',
              prose: [
                'Differentiation $D: P_4 \\to P_3$, $D(p) = p\'$. The kernel is the constants (only $p\'=0$ means $p$ is constant). The image is all of $P_3$ (every polynomial of degree $\\leq 3$ is the derivative of something). Verify rank + nullity = $\\dim(P_4) = 5$.',
                '`D = np.zeros((4,5)); D[range(4), range(1,5)] = np.arange(1,5)` builds the differentiation matrix. `np.linalg.matrix_rank(D)` is 4 (image = all of P_3). `scipy.linalg.null_space(D)` returns the 1-dimensional null space (constants). `4 + 1 == 5` confirms rank-nullity ✓.',
                'The bar chart of singular values visually shows rank: 4 non-zero values + 1 zero. This is the Rank-Nullity theorem in picture form. The non-zero singular values also show "how strongly" each frequency component (polynomial degree) gets mapped — D(x^n) = n*x^(n-1), so higher-degree terms produce larger singular values.',
              ],
              code: `import numpy as np

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
      '**First isomorphism theorem.** If $T: V \\to W$ is linear, then the quotient space $V / \\ker T$ is isomorphic to $\\text{im}(T)$: the map $\\tilde{T}(\\mathbf{v} + \\ker T) = T(\\mathbf{v})$ is well-defined, injective, and surjective onto $\\text{im}(T)$. Rank-nullity is the dimension count of this theorem: $\\dim(V / \\ker T) = \\dim(\\text{im}\\,T)$, so $\\dim V - \\dim \\ker T = \\dim(\\text{im}\\,T)$. The theorem also tells you $T$ is injective iff $V \\cong \\text{im}(T)$ (no information lost) and surjective iff $W \\cong V / \\ker T$.',
      '**Composition and functor of linear maps.** If $S: U \\to V$ and $T: V \\to W$ are linear, then $T \\circ S: U \\to W$ is linear and $[T \\circ S] = [T][S]$ (matrix product = function composition). This is why matrix multiplication is defined the way it is. Formally: the assignment $V \\mapsto V$ and $T \\mapsto [T]$ is a functor from the category of vector spaces to the category of matrices. Functoriality — $(T \\circ S)^* = S^* \\circ T^*$ for dual maps — is why the transpose of a product reverses order: $(AB)^\\top = B^\\top A^\\top$.',
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
    {
      id: 'ex-la6-003-2',
      title: 'Kernel and image of $T(p) = xp\'(x)$',
      problem: 'For $T: P_2 \\to P_2$ defined by $T(p) = x \\cdot p\'(x)$: (a) show $T$ is linear, (b) find the matrix in basis $\\{1,x,x^2\\}$, (c) find $\\ker(T)$ and $\\text{im}(T)$, (d) verify rank-nullity.',
      steps: [
        {
          expression: 'T(ap + bq) = x(ap+bq)\' = x(ap\'+bq\') = axp\' + bxq\' = aT(p) + bT(q) \\checkmark',
          annotation: 'Both linearity conditions are satisfied: $T$ distributes over addition and scalar multiplication.',
          strategyTitle: 'Verify linearity',
        },
        {
          expression: 'T(1) = x \\cdot 0 = 0, \\quad T(x) = x \\cdot 1 = x, \\quad T(x^2) = x \\cdot 2x = 2x^2',
          annotation: 'Apply $T$ to each basis vector. The derivative of $1$ is 0; derivative of $x$ is 1; derivative of $x^2$ is $2x$.',
          strategyTitle: 'Apply to basis vectors',
        },
        {
          expression: '[T] = \\begin{bmatrix}0&0&0\\\\0&1&0\\\\0&0&2\\end{bmatrix}',
          annotation: 'Columns are the coordinate vectors $[T(1)], [T(x)], [T(x^2)]$ in basis $\\{1,x,x^2\\}$. Diagonal — $T$ acts as a scaling on each basis vector.',
          strategyTitle: 'Assemble matrix',
        },
        {
          expression: '\\ker(T) = \\{p : T(p) = 0\\} = \\{\\text{constants}\\}, \\quad \\dim(\\ker T) = 1',
          annotation: '$T(p)=0$ iff $xp\'=0$ iff $p\'=0$ iff $p$ is constant.',
          strategyTitle: 'Find kernel',
        },
        {
          expression: '\\text{im}(T) = \\text{Span}\\{T(1), T(x), T(x^2)\\} = \\text{Span}\\{0, x, 2x^2\\} = \\text{Span}\\{x, x^2\\}, \\quad \\dim = 2',
          annotation: 'Rank-Nullity: $1 + 2 = 3 = \\dim P_2$ ✓. $T$ is neither injective (kernel nontrivial) nor surjective (image misses constants).',
          strategyTitle: 'Find image and verify rank-nullity',
          checkpoint: 'The diagonal matrix $\\text{diag}(0,1,2)$ shows $T$ kills the constant term (eigenvalue 0) and scales $x$ by 1 and $x^2$ by 2.',
        },
      ],
    },
    {
      id: 'ex-la6-003-3',
      title: 'Proving a map is NOT linear',
      problem: 'Show that $T: \\mathbb{R}^2 \\to \\mathbb{R}^2$ defined by $T(x,y) = (x+1, y)$ (horizontal translation by 1) is NOT a linear transformation.',
      steps: [
        {
          expression: 'T(\\mathbf{0}) = T(0,0) = (0+1, 0) = (1,0) \\neq (0,0)',
          annotation: 'A linear transformation must always send zero to zero: $T(\\mathbf{0}) = T(0\\cdot\\mathbf{v}) = 0T(\\mathbf{v}) = \\mathbf{0}$. Since $T(\\mathbf{0}) \\neq \\mathbf{0}$, $T$ is not linear.',
          strategyTitle: 'Check $T(\\mathbf{0}) = \\mathbf{0}$ first',
        },
        {
          expression: 'T((1,0)+(2,0)) = T(3,0) = (4,0)',
          annotation: 'Check additivity with a concrete pair.',
          strategyTitle: 'Check additivity',
        },
        {
          expression: 'T(1,0) + T(2,0) = (2,0) + (3,0) = (5,0) \\neq (4,0)',
          annotation: '$T(\\mathbf{u}+\\mathbf{v}) \\neq T(\\mathbf{u})+T(\\mathbf{v})$: the translation adds 1 each time, not just once.',
          strategyTitle: 'Demonstrate failure of additivity',
          checkpoint: 'The fastest test: compute $T(\\mathbf{0})$. Any function with $T(\\mathbf{0}) \\neq \\mathbf{0}$ fails linearity immediately. Translation, absolute value, and squaring all fail this test.',
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
    {
      id: 'ch-la6-003-2',
      title: 'Symmetrization map on matrices',
      difficulty: 'easy',
      problem: 'Let $T: M_{2\\times 2} \\to M_{2\\times 2}$ be defined by $T(A) = A + A^\\top$ (add the transpose). Show $T$ is linear, find $\\ker(T)$ and $\\text{im}(T)$, and verify rank-nullity.',
      hint: 'The kernel consists of matrices where $A = -A^\\top$ (skew-symmetric). The image consists of symmetric matrices, since $A + A^\\top$ is always symmetric.',
      walkthrough: [
        { expression: 'T(aA + bB) = (aA+bB) + (aA+bB)^\\top = a(A+A^\\top) + b(B+B^\\top) = aT(A)+bT(B) \\checkmark', annotation: 'Linearity holds because transposing is linear.' },
        { expression: '\\ker(T) = \\{A : A + A^\\top = 0\\} = \\{A : A^\\top = -A\\} = \\text{Skew}_{2\\times2}', annotation: 'T(A) = 0 iff A is skew-symmetric. A 2×2 skew-symmetric matrix has the form [[0,a],[-a,0]], one free parameter. $\\dim(\\ker T) = 1$.' },
        { expression: '\\text{im}(T) \\subseteq \\text{Sym}_{2\\times2} \\text{ (since } A+A^\\top \\text{ is always symmetric)}', annotation: 'Since $T(A)^\\top = (A+A^\\top)^\\top = A^\\top + A = T(A)$, every output is symmetric.' },
        { expression: 'T(E_{11}) = 2E_{11},\\; T(E_{12}) = E_{12}+E_{21},\\; T(E_{22}) = 2E_{22} \\implies \\text{im}(T) = \\text{Sym}_{2\\times2}', annotation: 'Apply T to the 4 standard basis matrices $E_{ij}$. The outputs span all symmetric matrices. $\\dim(\\text{im}\\,T) = 3$.' },
        { expression: '\\dim(\\ker T) + \\dim(\\text{im}\\,T) = 1 + 3 = 4 = \\dim(M_{2\\times2}) \\checkmark', annotation: 'Rank-Nullity holds. The skew-symmetric and symmetric subspaces are complementary: $M_{2\\times2} = \\text{Sym} \\oplus \\text{Skew}$, which is why rank + nullity = 4.' },
      ],
      answer: '$T$ is linear; $\\ker(T) = \\text{Skew}_{2\\times2}$ (dim 1); $\\text{im}(T) = \\text{Sym}_{2\\times2}$ (dim 3). Rank + Nullity $= 1 + 3 = 4 = \\dim(M_{2\\times2})$ ✓.',
    },
    {
      id: 'ch-la6-003-3',
      title: 'Constructing a map with prescribed kernel and image',
      difficulty: 'hard',
      problem: 'Construct a linear map $T: \\mathbb{R}^3 \\to \\mathbb{R}^3$ with $\\ker(T) = \\text{Span}\\{(1,1,0)^\\top, (0,1,1)^\\top\\}$ and $\\text{im}(T) = \\text{Span}\\{(1,2,1)^\\top\\}$. Find the matrix $A$ of $T$ and verify both conditions.',
      hint: 'Rank-Nullity requires rank = 1 and nullity = 2. A rank-1 matrix has the form $A = \\mathbf{v}\\mathbf{r}^\\top$. Choose $\\mathbf{v} = (1,2,1)^\\top$ (the image direction) and $\\mathbf{r}^\\top$ perpendicular to both kernel vectors.',
      walkthrough: [
        { expression: '\\text{rank} + \\text{nullity} = 1 + 2 = 3 = \\dim(\\mathbb{R}^3) \\checkmark', annotation: 'A rank-1 map: nullity = 2. This is consistent by rank-nullity.' },
        { expression: '\\mathbf{r} \\perp (1,1,0) \\text{ and } \\mathbf{r} \\perp (0,1,1): \\quad \\mathbf{r} = (1,1,0) \\times (0,1,1) = (1\\cdot1-0\\cdot1,\\; 0\\cdot0-1\\cdot1,\\; 1\\cdot1-1\\cdot0) = (1,-1,1)', annotation: 'The row direction $\\mathbf{r}$ must be orthogonal to both kernel vectors. Compute via cross product.' },
        { expression: 'A = \\mathbf{v}\\mathbf{r}^\\top = \\begin{bmatrix}1\\\\2\\\\1\\end{bmatrix}\\begin{bmatrix}1&-1&1\\end{bmatrix} = \\begin{bmatrix}1&-1&1\\\\2&-2&2\\\\1&-1&1\\end{bmatrix}', annotation: 'Outer product gives the matrix. All rows are multiples of $\\mathbf{r}^\\top$, so the rank is 1 and all columns are multiples of $\\mathbf{v}$.' },
        { expression: 'A(1,1,0)^\\top = (1-1, 2-2, 1-1)^\\top = (0,0,0)^\\top \\checkmark \\quad A(0,1,1)^\\top = (-1+1,-2+2,-1+1)^\\top = (0,0,0)^\\top \\checkmark', annotation: 'Both kernel vectors map to zero.' },
        { expression: 'A(1,0,0)^\\top = (1,2,1)^\\top \\checkmark \\quad \\text{col}(A) = \\text{Span}\\{(1,2,1)^\\top\\} \\checkmark', annotation: 'The first column of A is $(1,2,1)^\\top$; all columns are multiples of it — the image is the required span.' },
      ],
      answer: '$A = \\begin{bmatrix}1&-1&1\\\\2&-2&2\\\\1&-1&1\\end{bmatrix}$. Kernel = $\\text{Span}\\{(1,1,0)^\\top,(0,1,1)^\\top\\}$, image = $\\text{Span}\\{(1,2,1)^\\top\\}$. Rank = 1, nullity = 2, sum = 3 ✓.',
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
    { id: 'cp-la6-003-1', label: 'Read intuition: linearity examples and kernel/image', type: 'read' },
    { id: 'cp-la6-003-2', label: 'Read math: rank-nullity and matrix representation', type: 'read' },
    { id: 'cp-la6-003-3', label: 'Read rigor: dual space and change-of-basis similarity', type: 'read' },
    { id: 'cp-la6-003-4', label: 'Run kernel and image lab', type: 'lab' },
    { id: 'cp-la6-003-5', label: 'Run differentiation matrix lab', type: 'lab' },
    { id: 'cp-la6-003-6', label: 'Work example 1: integration as linear map', type: 'example' },
    { id: 'cp-la6-003-7', label: 'Work example 2: kernel and image of xp\'(x)', type: 'example' },
    { id: 'cp-la6-003-8', label: 'Solve challenge: rank-nullity for T(p) = p + p\'', type: 'challenge' },
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
    {
      id: 'q-la6-003-5',
      type: 'choice',
      text: 'Is $T: \\mathbb{R}^2 \\to \\mathbb{R}^2$ defined by $T(x,y) = (x+y, xy)$ a linear transformation?',
      options: [
        'Yes — it is defined on a vector space',
        'No — $T(\\mathbf{0}) = (0,0)$ so the zero test passes, but $xy$ is not linear',
        'Yes — it preserves addition since $(x+y)$ is linear',
        'No — its range is not a vector space',
      ],
      answer: 'No — $T(\\mathbf{0}) = (0,0)$ so the zero test passes, but $xy$ is not linear',
      hints: ['The zero test: $T(0,0) = (0,0)$ ✓ — passes. But the second component $xy$ is bilinear (quadratic), not linear. Check: $T((1,0)+(0,1)) = T(1,1) = (2,1)$, but $T(1,0)+T(0,1) = (1,0)+(1,0) = (2,0) \\neq (2,1)$. The zero test is necessary but not sufficient.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-003-6',
      type: 'choice',
      text: 'For $T: V \\to W$ with $\\dim V = 5$ and $\\dim(\\ker T) = 2$, the dimension of the image $\\text{im}(T)$ is:',
      options: ['2', '3', '5', '7'],
      answer: '3',
      hints: ['Rank-Nullity: $\\dim(\\ker T) + \\dim(\\text{im } T) = \\dim V$. So $2 + \\dim(\\text{im } T) = 5$, giving $\\dim(\\text{im } T) = 3$. This is independent of $\\dim W$ — the image could be a 3D subspace of a 100-dimensional $W$.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la6-003-7',
      type: 'choice',
      text: 'The matrix representation $[T]_{\\mathcal{B}}^{\\mathcal{C}}$ has its $j$-th column equal to:',
      options: [
        'The $j$-th basis vector of $V$ in standard coordinates',
        'The $\\mathcal{C}$-coordinates of $T(\\mathbf{b}_j)$',
        'The $\\mathcal{B}$-coordinates of $\\mathbf{c}_j$',
        'The standard coordinates of $T(\\mathbf{b}_j)$',
      ],
      answer: 'The $\\mathcal{C}$-coordinates of $T(\\mathbf{b}_j)$',
      hints: ['To build $[T]$: apply $T$ to the $j$-th basis vector of $V$, getting $T(\\mathbf{b}_j) \\in W$. Then express this vector in the basis $\\mathcal{C}$ of $W$. The resulting coordinate vector is the $j$-th column of $[T]$.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la6-003-8',
      type: 'choice',
      text: 'The Fourier transform maps a function $f(t)$ to its frequency representation $\\hat{f}(\\omega)$. It is a linear transformation because:',
      options: [
        '$\\widehat{af+bg}(\\omega) = a\\hat{f}(\\omega) + b\\hat{g}(\\omega)$ for all constants $a, b$',
        'The Fourier transform has an inverse',
        'It maps continuous functions to continuous functions',
        'It preserves the $L^2$ norm (Parseval\'s theorem)',
      ],
      answer: '$\\widehat{af+bg}(\\omega) = a\\hat{f}(\\omega) + b\\hat{g}(\\omega)$ for all constants $a, b$',
      hints: ['The Fourier transform $\\mathcal{F}[f](\\omega) = \\int_{-\\infty}^\\infty f(t)e^{-i\\omega t}dt$ is linear because the integral is linear: $\\mathcal{F}[af+bg] = a\\mathcal{F}[f] + b\\mathcal{F}[g]$. Invertibility (option b) and norm preservation (option d) are additional properties — not the definition of linearity.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-003-9',
      type: 'choice',
      text: 'For $T: P_3 \\to P_3$, $T(p) = p + p\'$ (add the derivative to the polynomial): is $T$ injective, surjective, both, or neither?',
      options: [
        'Neither — kernel is nontrivial and image is a proper subspace',
        'Injective only — kernel is trivial but image is a proper subspace',
        'Surjective only — image is all of $P_3$ but kernel is nontrivial',
        'Both (isomorphism) — kernel is trivial and image is all of $P_3$',
      ],
      answer: 'Both (isomorphism) — kernel is trivial and image is all of $P_3$',
      hints: ['The matrix $[T] = \\begin{bmatrix}1&1&0&0\\\\0&1&2&0\\\\0&0&1&3\\\\0&0&0&1\\end{bmatrix}$ is upper triangular with diagonal entries all = 1. Its determinant is 1 (product of diagonal) ≠ 0, so $[T]$ is invertible. Trivial kernel means injective; full image means surjective.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-003-10',
      type: 'choice',
      text: 'In image compression (e.g., JPEG), the image is transformed using a Discrete Cosine Transform (DCT). The DCT is linear because:',
      options: [
        'You can compress the image by keeping only the large coefficients',
        'Superimposing two images and transforming gives the same result as transforming and superimposing',
        'It maps 2D pixel arrays to 2D frequency arrays',
        'It is invertible (lossless before quantization)',
      ],
      answer: 'Superimposing two images and transforming gives the same result as transforming and superimposing',
      hints: ['Linearity: $\\text{DCT}(aX + bY) = a\\,\\text{DCT}(X) + b\\,\\text{DCT}(Y)$. This is exactly what "linear transformation" means. Compressibility (option a) uses the result of linearity but isn\'t the definition. Invertibility (option d) is a separate property.'],
      reviewSection: 'intuition',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Verify that a map between vector spaces is linear; find its matrix representation in given bases; compute kernel and image; apply rank-nullity.',
    explainVerbally: 'Explain why $T(\\mathbf{0}) = \\mathbf{0}$ is a necessary test for linearity and why two matrix representations of the same map are related by similarity.',
    detectIncorrectApplication: 'Catch non-linear maps (squaring, translating, absolute value) that pass some linearity tests but not others — especially those that pass the zero test.',
    transferToUnfamiliar: 'Identify differentiation, integration, and Fourier transform as linear maps; find their kernels and images; apply rank-nullity.',
  },

  misconceptions: [
    {
      falseBelief: 'Any map that looks linear (because it has "+" and scalar factors) is a linear transformation.',
      whyStudentsThinkIt: 'Students scan for addition and multiplication and conclude linearity without checking the superposition property.',
      correctionExample: '$T(x,y) = (x+1, y)$ has "addition" in it but is not linear: $T(\\mathbf{u}+\\mathbf{v}) = (u_1+v_1+1,\\ldots) \\neq T(\\mathbf{u})+T(\\mathbf{v}) = (u_1+1+v_1+1,\\ldots)$ — the translation adds 1 twice. Always verify the superposition condition algebraically.',
      contrastCase: '$T(x,y) = (x+y, x-y)$ is linear: $T(a\\mathbf{u}+b\\mathbf{v}) = aT(\\mathbf{u})+bT(\\mathbf{v})$ holds because both components are linear in $x, y$.',
    },
    {
      falseBelief: 'The kernel and image of $T: V \\to W$ are both subspaces of $W$.',
      whyStudentsThinkIt: 'Students confuse the two structural sets — both are subspaces, so which lives where?',
      correctionExample: 'For differentiation $D: P_3 \\to P_3$: $\\ker(D) = \\{$constants$\\} \\subseteq P_3$ (the domain/input space); $\\text{im}(D) = P_2 \\subseteq P_3$ (the codomain/output space). Kernel âŠ† domain; image âŠ† codomain.',
      contrastCase: 'For $T: \\mathbb{R}^3 \\to \\mathbb{R}^2$ given by a $2\\times3$ matrix: $\\ker(T) \\subseteq \\mathbb{R}^3$, $\\text{im}(T) \\subseteq \\mathbb{R}^2$. They live in different spaces.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You are building the matrix representation of a linear map between polynomial spaces.',
      competingTechniques: 'Directly compute the matrix by definition; use the adjoint/transpose.',
      whyThisTechniqueWins: 'Apply $T$ to each basis vector of the domain and express the result in the basis of the codomain — these become columns of $[T]$. This is the only systematic method and works for any linear map, including differentiation, integration, and evaluation.',
    },
    {
      situation: 'You need to verify that two similar matrices $A = P^{-1}BP$ represent the same linear map.',
      competingTechniques: 'Check all eigenvalues match; check rank and trace.',
      whyThisTechniqueWins: 'Similar matrices have the same characteristic polynomial, eigenvalues, trace, determinant, rank, and nullity — all of these are preserved by similarity. But the converse fails: matrices with the same eigenvalues are not necessarily similar (Jordan form distinguishes them). The geometric picture is "same map, rotated basis."',
    },
  ],

  semantics: {
    core: [
      { symbol: 'T(c\\mathbf{u}+d\\mathbf{v}) = cT(\\mathbf{u})+dT(\\mathbf{v})', meaning: 'Definition of a linear map T: V → W; preserves both addition and scalar multiplication in one condition' },
      { symbol: '\\ker(T)', meaning: 'Kernel (null space) of T: {v ∈ V : T(v) = 0}; always a subspace of the domain V' },
      { symbol: '\\text{im}(T)', meaning: 'Image (range) of T: {T(v) : v ∈ V}; always a subspace of the codomain W' },
      { symbol: '[T]_{\\mathcal{B}}^{\\mathcal{C}}', meaning: 'Matrix of T in bases B (domain) and C (codomain); j-th column = C-coordinates of T(b_j)' },
      { symbol: 'V/\\ker T \\cong \\text{im}(T)', meaning: 'First isomorphism theorem: the quotient by the kernel is isomorphic to the image; gives rank-nullity as a dimension equation' },
    ],
    rulesOfThumb: [
      'T(0) = 0 always — if a map fails this, stop: it is not linear. This eliminates all translations and affine maps.',
      'Kernel ⊆ domain (V), image ⊆ codomain (W) — they live in different spaces.',
      'rank + nullity = dim(domain) — always the number of COLUMNS (domain dimension), not rows.',
      'To build the matrix: apply T to each basis vector of V, express the result in the basis of W, stack as columns.',
      'Similar matrices A ~ B mean the same map in different bases; same rank, trace, determinant, eigenvalues.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { id: 'la6-001', label: 'Abstract Vector Spaces', reason: 'Kernel and image are subspaces — the subspace test from la6-001 applies to both' },
      { id: 'la6-002', label: 'Basis and Dimension', reason: 'Rank-nullity uses dimension; building the matrix requires choosing bases for domain and codomain' },
    ],
    futureLinks: [
      { id: 'la6-004', label: 'Matrix Representations', reason: 'The [T]_B^C construction is the central topic of la6-004 — how to compute and change the matrix' },
      { id: 'la6-005', label: 'Isomorphisms', reason: 'A linear map is an isomorphism iff it is bijective iff ker = {0} and im = W; la6-005 studies these invertible maps' },
    ],
  },

  debugging: [
    {
      commonError: 'Forgetting to express $T(\\mathbf{b}_j)$ in the OUTPUT basis $\\mathcal{C}$ when building the matrix.',
      symptom: 'The matrix representation gives wrong results when applied to coordinate vectors.',
      whyItHappened: 'After computing $T(\\mathbf{b}_j)$ (a vector in $W$), students write its standard coordinates instead of its $\\mathcal{C}$-coordinates. If $\\mathcal{C}$ is not the standard basis, these differ.',
      repairStrategy: 'Always write the full formula: $[T]_{\\mathcal{B}}^{\\mathcal{C}}$ — superscript $\\mathcal{C}$ means "express in $\\mathcal{C}$." After computing $T(\\mathbf{b}_j)$, solve $\\mathcal{C}$-coordinate vector: $\\mathbf{c} = C^{-1} T(\\mathbf{b}_j)$ where $C = [\\mathbf{c}_1 | \\ldots | \\mathbf{c}_m]$.',
    },
    {
      commonError: 'Applying rank-nullity as rank + nullity = number of rows instead of columns.',
      symptom: 'For a $3 \\times 5$ matrix, student computes nullity $= 3 - \\text{rank}$ instead of $5 - \\text{rank}$.',
      whyItHappened: 'Rank-Nullity is a theorem about the DOMAIN ($n$ = columns), not the codomain ($m$ = rows). The null space lives in the domain.',
      repairStrategy: 'Write it as: $\\text{rank}(T) + \\text{nullity}(T) = \\dim(\\text{domain}) = n$. The number of rows is the dimension of the codomain — unrelated to rank-nullity.',
    },
  ],
};
