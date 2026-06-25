import isomorphismBijectionUrl from '../diagrams/la-isomorphism-bijection.svg?url'

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
  },

  intuition: {
    blocks: [
      { type: 'prose', paragraphs: [
      'Consider the polynomial $p = 3 + 5x \\in P_1$ and the vector $(3, 5) \\in \\mathbb{R}^2$. Define $T: P_1 \\to \\mathbb{R}^2$ by $T(a + bx) = (a, b)$. Is this a bijective linear map? Linearity: $T((a+bx)+(c+dx)) = T((a+c)+(b+d)x) = (a+c, b+d) = (a,b)+(c,d) = T(a+bx)+T(c+dx)$ ✓. Injective: $T(a+bx) = (0,0)$ forces $a=0, b=0$, so only the zero polynomial maps to zero ✓. Surjective: any $(a,b) \\in \\mathbb{R}^2$ is hit by $a+bx$ ✓. Inverse: $T^{-1}(a,b) = a+bx$. So $P_1 \\cong \\mathbb{R}^2$ — same structure, different notation.',
      ] },
      { type: 'image', src: isomorphismBijectionUrl,
        alt: 'Left box P1 containing the polynomial 3 plus 5x, right box R2 containing the vector (3,5) drawn as an arrow, with a bidirectional arrow labeled T and T inverse connecting the two boxes',
        caption: "Same structure, different labels — T and T⁻¹ translate freely between them because dim P₁ = dim ℝ² = 2." },
      { type: 'prose', paragraphs: [
      '**The grand theorem.** For finite-dimensional vector spaces over the same field: $V \\cong W$ if and only if $\\dim V = \\dim W$. Dimension is the ONLY invariant — if two spaces have the same dimension, they are isomorphic. Every $n$-dimensional vector space over $\\mathbb{R}$ is isomorphic to $\\mathbb{R}^n$.',
      '**How to construct an isomorphism.** Given $V$ with basis $(\\mathbf{b}_1, \\ldots, \\mathbf{b}_n)$: define $T: V \\to \\mathbb{R}^n$ by $T(c_1\\mathbf{b}_1 + \\cdots + c_n\\mathbf{b}_n) = (c_1, \\ldots, c_n)^\\top$. This "coordinate map" is always an isomorphism. It is well-defined (because the basis representation is unique), linear (by direct verification), injective (only $\\mathbf{0}$ maps to $\\mathbf{0}$), and surjective (every coordinate vector is achieved).',
      '**Natural vs basis-dependent.** The coordinate isomorphism $V \\cong \\mathbb{R}^n$ requires a choice of basis. Change the basis, change the isomorphism. A **natural isomorphism** would work the same way regardless of basis. For example, $V \\cong V^{**}$ (double dual) is natural — no basis needed.',
      '**Isomorphism is an equivalence relation.** Every space is isomorphic to itself (identity map is an isomorphism). If $V \\cong W$ then $W \\cong V$ (the inverse of an isomorphism is an isomorphism). If $V \\cong W$ and $W \\cong X$ then $V \\cong X$ (composition of isomorphisms is an isomorphism). So "is isomorphic to" partitions the class of all vector spaces over $\\mathbb{F}$ into equivalence classes — and the classification theorem says exactly one invariant (dimension) determines which class a finite-dimensional space belongs to.',
      '**What isomorphisms let you do.** If you have a hard problem in an abstract space $V$, find an isomorphism $T: V \\to \\mathbb{R}^n$, translate the problem to $\\mathbb{R}^n$ using $T$, solve it there using matrices and Gaussian elimination, then translate the answer back using $T^{-1}$. This is the entire strategy of coordinate-based linear algebra: turn abstract problems into concrete matrix problems by choosing a basis, and understand that any two choices of basis give equivalent problems (just with different matrices representing the same map). The solution you compute is independent of which basis you used — only its coordinates change.',
      '**Where this is heading.** The last lesson in this chapter is change of basis — the practical mechanics of converting between coordinate systems. Once you can fluently change bases, you can always find the basis that makes a computation easiest: the eigenvector basis for a diagonalizable map, the SVD basis for any matrix, or the Gram-Schmidt basis for projection problems. Every important algorithm in numerical linear algebra is, at its core, a change of basis.',
      ] },
      { type: 'viz', id: 'OpenMatNotebook',
        title: 'Coordinate Isomorphism in Action',
        mathBridge: 'Use the coordinate map to translate between abstract and concrete linear algebra.',
        caption: 'The coordinate isomorphism converts abstract problems into matrix problems.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Isomorphism: P2 to R^3',
              prose: [
                'Show the coordinate map phi: P_2 -> R^3 is linear and invertible.',
                'Linearity check: `phi(p+q) = phi(p) + phi(q)` in MATLAB means `[a+c; b+d; e+f] == [a;b;e]+[c;d;f]` — always true by vector addition. `phi(s*p) = s*phi(p)` similarly. Invertibility: `phi_inv([a;b;c])` returns `a + b*x + c*x^2`. `phi(phi_inv(v)) = v` for any v in R^3.',
                'The identity `phi(phi_inv([2;-1;3]))` encodes then decodes `2-x+3x^2`: result should be `[2;-1;3]`. This round-trip confirms bijectivity. The key insight: isomorphisms preserve ALL linear algebra structure — linear independence, span, dimension, linear maps. Problems in P_2 can be solved in R^3 (where you have explicit matrix tools) and the answers translate back.',
              ],
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
              prose: [
                'Are p1 = 1+x, p2 = 1+x^2, p3 = x+x^2 linearly independent in P_2?',
                'Translate: `v1=[1;1;0]; v2=[1;0;1]; v3=[0;1;1]`. Build `M = [v1 v2 v3]`. Check `rank(M)` — if 3, the vectors are independent (so the polynomials are linearly independent). If < 3, `null(M)` gives the dependence relation.',
                'The dependence relation in polynomial terms: if `null(M) = [a;b;c]`, then `a*p1 + b*p2 + c*p3 = 0` in P_2. Verify: substitute x=0 and x=1 as spot checks. This is the power of the isomorphism: polynomial independence questions become rank questions on matrices — questions that MATLAB can answer instantly.',
              ],
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
    callouts: [
      {
        type: 'procedure',
        title: 'How to Verify a Map Is an Isomorphism (5 Steps)',
        body: '**Given:** A proposed map $T: V \\to W$.\n**Step 1.** Verify linearity: check $T(c\\mathbf{u}+d\\mathbf{v}) = cT(\\mathbf{u}) + dT(\\mathbf{v})$ for arbitrary vectors and scalars.\n**Step 2.** Find $\\ker(T)$: solve $T(\\mathbf{v}) = \\mathbf{0}$. If the only solution is $\\mathbf{v} = \\mathbf{0}$, then $T$ is injective.\n**Step 3.** Compare dimensions: if $\\dim V = \\dim W$, then injectivity alone implies surjectivity (by rank-nullity) → $T$ is an isomorphism.\n**Step 4.** If dimensions are equal and the matrix of $T$ is available, check $\\det([T]) \\neq 0$ — equivalent to bijectivity.\n**Step 5.** Write $T^{-1}$ explicitly and verify $T^{-1}(T(\\mathbf{v})) = \\mathbf{v}$ for a test vector.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 5 of 6 — Abstract Vector Spaces',
        body: '**Previous:** Matrix Representations — encoding linear maps as matrices in a chosen basis.\n**This lesson:** Isomorphisms — bijective linear maps that identify two vector spaces as structurally identical, with dimension as the complete invariant.\n**Next:** Coordinates and Change of Basis — the mechanics of converting between different coordinate systems.',
      },
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
      {
        type: 'insight',
        title: 'Prediction',
        body: 'Before reading the math section: $P_2$ has dimension 3 and $\\mathbb{R}^3$ has dimension 3. Can you write down an explicit bijective linear map $T: P_2 \\to \\mathbb{R}^3$ right now? What would $T(1 + 2x - x^2)$ equal under your map? Write down your candidate map and check it satisfies linearity before reading on.',
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
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Code: Isomorphisms and Coordinate Maps',
        mathBridge: 'Use the coordinate map to translate abstract linear independence problems into matrix rank problems. Verify isomorphism by checking injectivity and surjectivity via the matrix.',
        caption: 'Same dimension means isomorphic. Use the coordinate map to reduce abstract problems to linear systems.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Coordinate isomorphism: translate P_2 problems to R^3',
              prose: [
                'The coordinate map $\\phi: P_2 \\to \\mathbb{R}^3$, $\\phi(a + bx + cx^2) = (a,b,c)^T$, is an isomorphism. To check if polynomials in $P_2$ are linearly independent, just check if their coordinate vectors in $\\mathbb{R}^3$ are linearly independent (using rank).',
                'Encode each polynomial as a NumPy array: `p1 = np.array([1,1,0])` (1+x), `p2 = np.array([1,0,1])` (1+x²). Build `M = np.column_stack([p1, p2, p3])`. `np.linalg.matrix_rank(M)` — if it equals the number of polynomials, they are linearly independent.',
                'For a dependence relation: `null_space = scipy.linalg.null_space(M)`. The non-trivial null vector `[a,b,c]` means `a*p1 + b*p2 + c*p3 = 0` as polynomials. Verify by evaluating at several x values: `a*(1+x) + b*(1+x**2) + c*(x+x**2)` for x in range(5) should all be near zero. This demonstrates that the isomorphism correctly translates polynomial linear dependence into matrix rank.',
              ],
              code: `import numpy as np

# Translate a P_2 independence question to R^3
# Are p1 = 1 + x, p2 = 1 + x^2, p3 = x + x^2 linearly independent?
v1 = np.array([1., 1., 0.])   # 1 + x
v2 = np.array([1., 0., 1.])   # 1 + x^2
v3 = np.array([0., 1., 1.])   # x + x^2

M = np.column_stack([v1, v2, v3])
rank = np.linalg.matrix_rank(M)

print("Coordinate matrix M = [v1|v2|v3]:")
print(M)
print(f"rank(M) = {rank}")
print(f"Linearly independent: {rank == 3}")
print()

# If they span P_2 (rank 3), we can find coordinates of any polynomial
p_target = np.array([2., 5., -3.])   # 2 + 5x - 3x^2
coords = np.linalg.solve(M, p_target)
print(f"2 + 5x - 3x^2 = {coords[0]:.4f}*(1+x) + {coords[1]:.4f}*(1+x^2) + {coords[2]:.4f}*(x+x^2)")`,
            },
            {
              id: 2,
              cellTitle: 'Build an explicit isomorphism and verify it',
              prose: [
                'An isomorphism $T: V \\to W$ must be linear (matrix), injective (full column rank), and surjective (full row rank). When $\\dim V = \\dim W$, checking either injectivity or surjectivity alone suffices. Verify $T^{-1}$ is also linear.',
                'For T represented by matrix M (dim V = dim W = n): `np.linalg.matrix_rank(M) == n` is the single check for isomorphism (full rank ↔ invertible ↔ injective ↔ surjective when square). `T_inv = np.linalg.inv(M)`. Verify: `np.allclose(M @ T_inv, np.eye(n))` and `np.allclose(T_inv @ M, np.eye(n))`.',
                'Test with a non-isomorphism: build M_rank_deficient with `M[0] = M[1]`. `np.linalg.matrix_rank(M_rank_deficient) < n` — not full rank, not an isomorphism. `np.linalg.solve(M_rank_deficient, b)` will raise `LinAlgError`. This shows why dim(V) = dim(W) is necessary but not sufficient — you also need T to be injective.',
              ],
              code: `import numpy as np

# Isomorphism T: R^3 -> Sym(2x2) (2x2 symmetric matrices)
# Sym(2x2) has basis B1=[1,0;0,0], B2=[0,1;1,0], B3=[0,0;0,1]
# T(a,b,c) = a*B1 + b*B2 + c*B3 (as a 4-vector [a,b,b,c])

# Matrix of T (as flat 4-vector representation of Sym)
T_matrix = np.array([[1., 0., 0.],   # B1 flattened
                     [0., 1., 0.],   # B2_upper
                     [0., 1., 0.],   # B2_lower (symmetric)
                     [0., 0., 1.]])  # B3 flattened

print("T maps R^3 to flattened Sym(2x2) via matrix T:")
print(T_matrix)
print(f"rank(T) = {np.linalg.matrix_rank(T_matrix)}  (should be 3 = dim R^3)")
print()

# Apply T to vector (2, -1, 3)
v = np.array([2., -1., 3.])
T_v = T_matrix @ v
print(f"T({v}) = {T_v}  -> matrix [[{T_v[0]},{T_v[1]}],[{T_v[2]},{T_v[3]}]]")
print("This is: 2*B1 + (-1)*B2 + 3*B3 = [[2,-1],[-1,3]] ✓")`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Automorphisms.** An isomorphism $T: V \\to V$ (from a space to itself) is called an **automorphism**. The set of all automorphisms of $V$ forms a group under composition: the **general linear group** $GL(V)$. For $V = \\mathbb{R}^n$, $GL(\\mathbb{R}^n) \\cong GL(n, \\mathbb{R})$ = group of invertible $n\\times n$ real matrices. Automorphisms are the "symmetries" of the vector space.',
      '**Functorial isomorphisms.** The canonical isomorphism $V \\cong V^{**}$ sends $\\mathbf{v} \\mapsto (\\phi \\mapsto \\phi(\\mathbf{v}))$. This is a natural transformation between the identity functor and the double-dual functor, valid for all finite-dimensional $V$ simultaneously. In contrast, $V \\cong V^*$ requires choosing an inner product or a basis.',
      '**First isomorphism theorem as a source of isomorphisms.** The first isomorphism theorem ($V / \\ker T \\cong \\text{im}(T)$) is the standard machine for building isomorphisms. If you know the kernel and image of a linear map, you immediately get an isomorphism between the quotient and the image. For example: $\\mathbb{R}^3 / \\text{Span}\\{\\mathbf{e}_3\\} \\cong \\mathbb{R}^2$ (modding out the $z$-axis gives the $xy$-plane). More usefully: $P_3 / \\ker D \\cong P_2$ where $D$ is differentiation, saying the classes of polynomials that share the same derivative are isomorphic to the space of all lower-degree polynomials.',
      '**Infinite-dimensional isomorphisms.** The classification theorem fails for infinite-dimensional spaces: there exist non-isomorphic infinite-dimensional spaces over the same field (uncountable-dimensional vs countable-dimensional over $\\mathbb{Q}$, for example). For Hilbert spaces (complete inner product spaces), the correct invariant is the orthonormal dimension (cardinality of an orthonormal basis). All separable Hilbert spaces are isomorphic as Hilbert spaces — this is the content of the Riesz-Fischer theorem. The Fourier transform is the concrete isomorphism $L^2[0,2\\pi] \\cong \\ell^2$ (functions to square-summable sequences).',
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
    {
      id: 'ex-la6-005-2',
      title: 'Show $T: \\mathbb{R}^3 \\to P_2$ defined by $T(a,b,c) = a + bx + cx^2$ is an isomorphism',
      problem: 'Let $T: \\mathbb{R}^3 \\to P_2$ be defined by $T(a, b, c) = a + bx + cx^2$. Verify that $T$ is a linear map, then show it is both injective and surjective, concluding it is an isomorphism.',
      steps: [
        {
          expression: 'T((a_1,b_1,c_1)+(a_2,b_2,c_2)) = T(a_1+a_2,\\, b_1+b_2,\\, c_1+c_2) = (a_1+a_2)+(b_1+b_2)x+(c_1+c_2)x^2',
          annotation: 'Expanding confirms $T(\\mathbf{u}+\\mathbf{v}) = T(\\mathbf{u})+T(\\mathbf{v})$. Scalar multiplication is similar. So $T$ is linear.',
          strategyTitle: 'Step 1: Verify linearity',
        },
        {
          expression: '\\ker(T) = \\{(a,b,c) : a+bx+cx^2 = 0\\} = \\{(0,0,0)\\}',
          annotation: 'The zero polynomial has all zero coefficients, so $a = b = c = 0$. The kernel is trivial, meaning $T$ is injective.',
          strategyTitle: 'Step 2: Injectivity ($\\ker T = \\{\\mathbf{0}\\}$)',
        },
        {
          expression: '\\dim(\\mathbb{R}^3) = 3 = \\dim(P_2)',
          annotation: 'Both domain and codomain have dimension 3.',
          strategyTitle: 'Step 3: Dimension count',
        },
        {
          expression: '\\text{rank}(T) = \\dim(\\mathbb{R}^3) - \\dim(\\ker T) = 3 - 0 = 3 = \\dim(P_2)',
          annotation: 'By rank-nullity, the image has dimension 3, which equals $\\dim(P_2)$. So $T$ is surjective.',
          strategyTitle: 'Step 4: Surjectivity via rank-nullity',
        },
        {
          expression: 'T^{-1}(a + bx + cx^2) = (a, b, c)',
          annotation: 'The inverse simply reads off the polynomial coefficients. It is also linear: $T$ is an isomorphism with a clean inverse.',
          strategyTitle: 'Step 5: Write the inverse explicitly',
        },
      ],
    },
    {
      id: 'ex-la6-005-3',
      title: 'Isomorphism $M_{2\\times 1} \\cong \\mathbb{R}^2$ — the trivial case made explicit',
      problem: 'The space $M_{2\\times 1}$ of $2\\times 1$ column matrices looks different from $\\mathbb{R}^2$, but they are isomorphic. Write down the isomorphism, verify it is linear and bijective, and find its inverse.',
      steps: [
        {
          expression: '\\dim(M_{2\\times 1}) = 2, \\quad \\dim(\\mathbb{R}^2) = 2',
          annotation: '$M_{2\\times 1}$ has basis $\\left\\{\\begin{bmatrix}1\\\\0\\end{bmatrix}, \\begin{bmatrix}0\\\\1\\end{bmatrix}\\right\\}$. Same dimension as $\\mathbb{R}^2$ — isomorphism guaranteed.',
          strategyTitle: 'Check dimensions',
        },
        {
          expression: 'T\\left(\\begin{bmatrix}a\\\\b\\end{bmatrix}\\right) = (a, b)',
          annotation: 'The natural map strips the column-matrix notation and returns an ordered pair. This is both the "obvious" map and a valid isomorphism.',
          strategyTitle: 'Define $T: M_{2\\times 1} \\to \\mathbb{R}^2$',
        },
        {
          expression: 'T\\left(\\begin{bmatrix}a\\\\b\\end{bmatrix}+\\begin{bmatrix}c\\\\d\\end{bmatrix}\\right) = T\\begin{bmatrix}a+c\\\\b+d\\end{bmatrix} = (a+c, b+d) = (a,b)+(c,d) \\checkmark',
          annotation: 'Addition and scalar multiplication are both preserved. $T$ is linear.',
          strategyTitle: 'Verify linearity',
        },
        {
          expression: '\\ker(T) = \\left\\{\\begin{bmatrix}a\\\\b\\end{bmatrix} : (a,b) = (0,0)\\right\\} = \\left\\{\\begin{bmatrix}0\\\\0\\end{bmatrix}\\right\\}',
          annotation: 'Trivial kernel → injective. Same dimensions → also surjective. $T$ is an isomorphism.',
          strategyTitle: 'Injectivity and surjectivity',
        },
        {
          expression: 'T^{-1}(a, b) = \\begin{bmatrix}a\\\\b\\end{bmatrix}',
          annotation: 'The inverse wraps the pair back into a column matrix. This is the "identification" between $M_{2\\times 1}$ and $\\mathbb{R}^2$ that justifies using column vectors and ordered pairs interchangeably throughout linear algebra.',
          strategyTitle: 'Inverse and interpretation',
        },
      ],
    },
  ],

  // ── Walkthroughs ───────────────────────────────────────────────────────────
  walkthroughs: [
    {
      id: 'wt-la6-005-verify-isomorphism',
      title: 'Verifying That a Map Is an Isomorphism',
      prereqs: ['Linear maps', 'Kernel', 'Dimension'],
      problem: 'Show that $\\phi: \\mathcal{P}_2 \\to \\mathbb{R}^3$ defined by $\\phi(a+bx+cx^2) = [a,b,c]^\\top$ is an isomorphism.',
      steps: [
        {
          label: 'Verify $\\phi$ is linear',
          strategy: 'Check additivity and homogeneity.',
          explanation: '$\\phi((a+bx+cx^2)+(d+ex+fx^2)) = [a+d,b+e,c+f]^\\top = [a,b,c]^\\top+[d,e,f]^\\top = \\phi(p)+\\phi(q)$ ✓. $\\phi(cp) = [ca,cb,cc]^\\top = c[a,b,c]^\\top = c\\phi(p)$ ✓.',
          math: '\\phi(p+q)=\\phi(p)+\\phi(q)\\checkmark,\\quad \\phi(cp)=c\\phi(p)\\checkmark',
        },
        {
          label: 'Verify $\\phi$ is injective (one-to-one): $\\ker\\phi = \\{0\\}$',
          strategy: 'If $\\phi(p) = \\mathbf{0}$, then $[a,b,c]^\\top=[0,0,0]^\\top$, so $a=b=c=0$, meaning $p=0$.',
          explanation: '$\\ker(\\phi) = \\{0\\}$ ✓ — the only polynomial that maps to the zero vector is the zero polynomial.',
          math: '\\ker(\\phi) = \\{0\\} \\Rightarrow \\phi \\text{ is injective}',
        },
        {
          label: 'Verify $\\phi$ is surjective (onto): $\\text{im}(\\phi) = \\mathbb{R}^3$',
          strategy: 'Every $[a,b,c]^\\top \\in \\mathbb{R}^3$ is the image of $a+bx+cx^2 \\in \\mathcal{P}_2$.',
          explanation: 'For any target $[a,b,c]^\\top$, the preimage is $a+bx+cx^2 \\in \\mathcal{P}_2$. So every vector in $\\mathbb{R}^3$ is hit. $\\phi$ is surjective ✓.',
          math: '\\text{im}(\\phi) = \\mathbb{R}^3 \\Rightarrow \\phi \\text{ is surjective}',
          gotcha: 'By rank-nullity, if $\\dim(V) = \\dim(W)$ and a linear map $T: V\\to W$ is injective, it is automatically surjective. So for same-dimensional spaces, just check injectivity.',
        },
        {
          label: 'Conclude: $\\mathcal{P}_2 \\cong \\mathbb{R}^3$',
          strategy: 'Isomorphic spaces are "the same" up to renaming — they have the same dimension and structure.',
          explanation: '$\\mathcal{P}_2$ and $\\mathbb{R}^3$ are both 3-dimensional real vector spaces → they are isomorphic. This is why we can study $\\mathcal{P}_2$ using matrices: every computation in $\\mathcal{P}_2$ transfers to $\\mathbb{R}^3$ via $\\phi$.',
          math: '\\mathcal{P}_2 \\cong \\mathbb{R}^3',
        },
      ],
    },
    {
      id: 'wt-la6-005-dimension-determines-iso',
      title: 'Dimension Is the Complete Invariant of Finite-Dimensional Real Vector Spaces',
      prereqs: ['Isomorphism', 'Dimension'],
      problem: 'For each pair, determine whether the spaces are isomorphic: (a) $\\mathbb{R}^4$ and $M_{2\\times 2}(\\mathbb{R})$, (b) $\\mathcal{P}_3$ and $\\mathbb{R}^3$.',
      steps: [
        {
          label: 'Compute dimensions and compare',
          strategy: 'Two finite-dimensional real vector spaces are isomorphic if and only if they have the same dimension.',
          explanation: '(a) $\\dim(\\mathbb{R}^4)=4$; $\\dim(M_{2\\times 2})=4$ (four entries, each a free real number). Equal → isomorphic. (b) $\\dim(\\mathcal{P}_3)=4$ (coefficients $a_0,a_1,a_2,a_3$); $\\dim(\\mathbb{R}^3)=3$. Unequal → not isomorphic.',
          math: '(a)\\;4=4\\Rightarrow\\cong,\\quad (b)\\;4\\neq3\\Rightarrow\\not\\cong',
          gotcha: 'The "if and only if" is what makes this powerful: to prove two spaces are NOT isomorphic, you only need to show their dimensions differ. No need to check every possible map.',
        },
        {
          label: 'Exhibit an explicit isomorphism for (a)',
          strategy: 'Write down a bijective linear map $\\phi: \\mathbb{R}^4 \\to M_{2\\times 2}$.',
          explanation: '$\\phi(a,b,c,d) = \\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}$. This is linear and bijective — it just reshapes a column vector into a matrix.',
          math: '\\phi:\\begin{bmatrix}a\\\\b\\\\c\\\\d\\end{bmatrix}\\mapsto\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}',
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
    {
      id: 'ch-la6-005-3',
      title: 'Evaluation isomorphism and polynomial interpolation',
      difficulty: 'hard',
      problem: 'Let $T: P_2 \\to \\mathbb{R}^3$ be defined by $T(p) = (p(0), p(1), p(2))^\\top$. (a) Find the matrix of $T$ in the standard bases. (b) Compute $\\det([T])$ to verify $T$ is an isomorphism. (c) Find $T^{-1}(1, 3, 9)^\\top$ — the unique polynomial in $P_2$ satisfying $p(0)=1, p(1)=3, p(2)=9$.',
      hint: 'For part (a): apply $T$ to each basis polynomial $\\{1, x, x^2\\}$ and use the outputs as columns. For part (c): solve the resulting $3 \\times 3$ linear system.',
      walkthrough: [
        { expression: 'T(1) = (1,1,1)^\\top, \\quad T(x) = (0,1,2)^\\top, \\quad T(x^2) = (0,1,4)^\\top', annotation: 'Evaluate each basis polynomial at $x = 0, 1, 2$ to get the three columns.' },
        { expression: '[T] = \\begin{bmatrix}1&0&0\\\\1&1&1\\\\1&2&4\\end{bmatrix}', annotation: 'Vandermonde matrix for nodes 0, 1, 2. Its determinant equals the product of differences of nodes.' },
        { expression: '\\det([T]) = 1 \\cdot \\det\\begin{bmatrix}1&1\\\\2&4\\end{bmatrix} = 4-2 = 2 \\neq 0', annotation: 'Non-zero determinant → $T$ is invertible → $T$ is an isomorphism. In general, $\\det(\\text{Vandermonde}) = \\prod_{i>j}(x_i-x_j) = (1-0)(2-0)(2-1) = 2$.' },
        { expression: '\\begin{bmatrix}1&0&0\\\\1&1&1\\\\1&2&4\\end{bmatrix}\\begin{bmatrix}a\\\\b\\\\c\\end{bmatrix} = \\begin{bmatrix}1\\\\3\\\\9\\end{bmatrix} \\implies a=1, \\; b+c=2, \\; 2b+4c=8', annotation: 'Solve row by row: row 1 gives $a=1$; subtract row 1 from rows 2 and 3 to isolate $b$ and $c$.' },
        { expression: 'c = 2, \\; b = 0, \\; a = 1 \\implies p(x) = 1 + 2x^2', annotation: 'Verify: $p(0)=1$ ✓, $p(1)=3$ ✓, $p(2)=9$ ✓. The isomorphism $T^{-1}$ performs polynomial interpolation — finding the unique quadratic through three given points.' },
      ],
      answer: '$[T] = \\begin{bmatrix}1&0&0\\\\1&1&1\\\\1&2&4\\end{bmatrix}$, $\\det = 2 \\neq 0$ → isomorphism. $T^{-1}(1,3,9)^\\top = 1 + 2x^2$.',
    },
  ],

  mentalModel: [
    'Isomorphism = bijective linear map. Same structure, different packaging.',
    'Two finite-dim spaces over the same field are isomorphic iff they have the same dimension.',
    'Coordinate map = canonical isomorphism: pick basis → get $V \\cong \\mathbb{R}^n$.',
    'Isomorphisms preserve independence, bases, dimension, subspace structure — everything linear.',
  ],

  checkpoints: [
    { id: 'cp-la6-005-1', label: 'Read intuition section', type: 'read' },
    { id: 'cp-la6-005-2', label: 'Read math section', type: 'read' },
    { id: 'cp-la6-005-3', label: 'Read rigor section', type: 'read' },
    { id: 'cp-la6-005-4', label: 'Run coordinate isomorphism P2 to R^3 lab', type: 'lab' },
    { id: 'cp-la6-005-5', label: 'Run linear independence translation lab', type: 'lab' },
    { id: 'cp-la6-005-6', label: 'Work example 1: M_2x2 isomorphic to P3', type: 'example' },
    { id: 'cp-la6-005-7', label: 'Work example 2: R^3 to P2 isomorphism', type: 'example' },
    { id: 'cp-la6-005-8', label: 'Solve challenge: non-isomorphic spaces dimension argument', type: 'challenge' },
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
    {
      id: 'q-la6-005-5',
      type: 'choice',
      text: 'Which of the following maps $T: P_1 \\to \\mathbb{R}^2$ is an isomorphism?',
      options: ['$T(a+bx) = (a+b, 0)$', '$T(a+bx) = (a, b)$', '$T(a+bx) = (a^2, b)$', '$T(a+bx) = (a, a)$'],
      answer: '$T(a+bx) = (a, b)$',
      hints: ['Check each option for linearity and bijectivity. $T(a+bx) = (a+b, 0)$ is not injective (e.g., $1+x$ and $2$ both map to $(1,0)$ scaled). $T(a+bx)=(a^2,b)$ is not linear. $T(a+bx)=(a,a)$ is not surjective. Only $(a,b)$ is both linear and bijective.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-005-6',
      type: 'choice',
      text: 'For $T: V \\to W$ with $\\dim V = \\dim W = n$, which single condition is sufficient to conclude $T$ is an isomorphism?',
      options: ['$T$ is linear', '$\\ker T = \\{\\mathbf{0}\\}$', '$T$ maps some vector to $\\mathbf{0}$', '$T$ has an eigenvalue'],
      answer: '$\\ker T = \\{\\mathbf{0}\\}$',
      hints: ['When $\\dim V = \\dim W < \\infty$, injectivity alone ($\\ker T = \\{\\mathbf{0}\\}$) implies surjectivity via rank-nullity: $\\text{rank}(T) = n - 0 = n = \\dim W$. So injective = surjective = isomorphism in equal finite dimensions.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la6-005-7',
      type: 'choice',
      text: 'The automorphism group $GL(V)$ for a real $n$-dimensional space $V$ is isomorphic to:',
      options: ['$\\mathbb{R}^n$', '$GL(n, \\mathbb{R})$ (invertible $n\\times n$ real matrices)', '$\\mathbb{R}^{n^2}$', '$P_n$'],
      answer: '$GL(n, \\mathbb{R})$ (invertible $n\\times n$ real matrices)',
      hints: ['Choosing a basis for $V$ gives an isomorphism $V \\cong \\mathbb{R}^n$, which transports every automorphism of $V$ to an invertible matrix. The group of invertible $n\\times n$ matrices is $GL(n,\\mathbb{R})$.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la6-005-8',
      type: 'choice',
      text: 'Is $P_2 \\cong \\mathbb{R}^2$?',
      options: ['Yes, because both contain polynomials and vectors', 'No, because $\\dim P_2 = 3$ while $\\dim \\mathbb{R}^2 = 2$', 'Yes, because we can always find a linear map between any two spaces', 'No, because $P_2$ is not a subspace of $\\mathbb{R}^2$'],
      answer: 'No, because $\\dim P_2 = 3$ while $\\dim \\mathbb{R}^2 = 2$',
      hints: ['$P_2$ has basis $\\{1, x, x^2\\}$ so $\\dim P_2 = 3$. $\\mathbb{R}^2$ has dimension 2. Different dimensions → not isomorphic. There is no bijective linear map between spaces of different dimensions.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-005-9',
      type: 'choice',
      text: 'If $T: V \\to W$ is an isomorphism and $S \\subseteq V$ is a subspace of dimension $k$, what is $\\dim(T(S))$?',
      options: ['It could be anything from 0 to $k$', '$k$', '$\\dim W - k$', '0'],
      answer: '$k$',
      hints: ['Isomorphisms preserve dimension of subspaces. $T$ restricted to $S$ is still injective (kernel of $T$ is trivial) and maps $S$ to $T(S)$, so $\\dim T(S) = \\dim S = k$.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la6-005-10',
      type: 'choice',
      text: 'The "natural" isomorphism $V \\cong V^{**}$ (double dual) is distinguished from the coordinate isomorphism $V \\cong \\mathbb{R}^n$ because:',
      options: ['It does not require choosing a basis', 'It only works for $\\mathbb{R}^n$', 'It is not actually an isomorphism', 'It requires $V$ to be infinite-dimensional'],
      answer: 'It does not require choosing a basis',
      hints: ['The coordinate isomorphism $V \\to \\mathbb{R}^n$ requires picking an ordered basis — change the basis, change the map. The double-dual isomorphism $\\mathbf{v} \\mapsto (\\phi \\mapsto \\phi(\\mathbf{v}))$ is defined the same way for all $V$, with no basis choice. This is what "natural" means in category theory.'],
      reviewSection: 'rigor',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Given two finite-dimensional vector spaces, determine whether they are isomorphic by comparing dimensions, and if so, write down an explicit isomorphism and verify it satisfies linearity and bijectivity.',
    explainVerbally: 'Explain why dimension is the "complete invariant" of finite-dimensional vector spaces, and what it means for two spaces to be "structurally the same."',
    detectIncorrectApplication: 'Identify when a proposed map fails to be an isomorphism — whether it is not linear, not injective, or not surjective — and pinpoint which condition fails.',
    transferToUnfamiliar: 'Construct an isomorphism between two unfamiliar vector spaces (e.g., the space of $2\\times 2$ symmetric matrices and $\\mathbb{R}^3$) without being prompted on the definition.',
  },

  misconceptions: [
    {
      falseBelief: 'Two spaces are isomorphic only if they contain the same kinds of objects (e.g., both are spaces of vectors).',
      whyStudentsThinkIt: 'Students focus on the surface appearance of the elements rather than the algebraic structure. $P_2$ looks nothing like $\\mathbb{R}^3$, so it seems like they should not be "the same."',
      correctionExample: '$P_2 = \\{a+bx+cx^2\\}$ and $\\mathbb{R}^3 = \\{(a,b,c)\\}$ are isomorphic via $T(a+bx+cx^2) = (a,b,c)$. Their elements look different but the algebraic rules are identical.',
      contrastCase: '$P_2$ and $P_3$ are NOT isomorphic even though both are polynomial spaces — because their dimensions differ ($3 \\neq 4$).',
    },
    {
      falseBelief: 'Any linear map between equal-dimensional spaces is an isomorphism.',
      whyStudentsThinkIt: 'Students remember "same dimension means isomorphic" and confuse a property of the spaces with a property of any particular map between them.',
      correctionExample: '$T: \\mathbb{R}^2 \\to \\mathbb{R}^2$ defined by $T(a,b) = (a, 0)$ is linear but not injective (kernel = $y$-axis) and not surjective. It is NOT an isomorphism, even though $\\dim \\mathbb{R}^2 = \\dim \\mathbb{R}^2$.',
      contrastCase: '$T(a,b) = (a,b)$ (the identity) is an isomorphism. The existence of an isomorphism is guaranteed, but not every linear map between equal-dimensional spaces qualifies.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You need to prove that a property of $\\mathbb{R}^n$ (like having a unique solution to $A\\mathbf{x}=\\mathbf{b}$) holds for an abstract $n$-dimensional space $V$.',
      competingTechniques: 'Could try to reprove everything from scratch in the abstract setting.',
      whyThisTechniqueWins: 'Use the coordinate isomorphism $V \\cong \\mathbb{R}^n$ to translate the problem into $\\mathbb{R}^n$, apply the known result, then translate back. The isomorphism preserves all linear structure, so the result transfers automatically.',
    },
    {
      situation: 'Two matrix spaces are given and you want to know if they are "the same" for linear algebra purposes.',
      competingTechniques: 'Could try to find an explicit isomorphism directly, which can be complicated.',
      whyThisTechniqueWins: 'Just compute the dimensions. If dimensions match, an isomorphism exists (you can always construct one via bases). If dimensions differ, no isomorphism is possible — no need to search.',
    },
  ],

  semantics: {
    core: [
      { symbol: 'V \\cong W', meaning: 'V and W are isomorphic: there exists a bijective linear map T: V → W; the spaces are structurally identical' },
      { symbol: '\\phi_{\\mathcal{B}}: V \\xrightarrow{\\sim} \\mathbb{F}^n', meaning: 'Coordinate isomorphism: maps v to its B-coordinates; requires choosing an ordered basis B; changes with the basis choice' },
      { symbol: 'GL(V)', meaning: 'General linear group: all automorphisms (invertible linear maps V → V); for V = R^n this is GL(n, R)' },
      { symbol: 'V \\cong W \\Leftrightarrow \\dim V = \\dim W', meaning: 'Classification theorem for finite-dimensional spaces over the same field; dimension is the complete invariant' },
      { symbol: 'V \\cong V^{**}', meaning: 'Double dual isomorphism: v ↦ (φ ↦ φ(v)); natural — requires no basis choice; not available for infinite-dimensional spaces' },
    ],
    rulesOfThumb: [
      'Check dimensions first: if dim(V) ≠ dim(W), no isomorphism exists — stop there.',
      'To show T: V → W is an isomorphism when dim(V) = dim(W): just check ker(T) = {0} (injectivity implies surjectivity by rank-nullity).',
      'Computing det([T]) ≠ 0 is the fastest check when T has a matrix: invertible matrix = isomorphism.',
      'Coordinate isomorphism φ_B is NOT natural: it requires a basis B and changes when B changes. Natural isomorphisms exist without basis choices.',
      'First isomorphism theorem builds isomorphisms for free: V/ker(T) ≅ im(T) always.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { id: 'la6-002', label: 'Basis and Dimension', reason: 'The classification theorem uses dimension; the coordinate isomorphism requires choosing a basis' },
      { id: 'la6-003', label: 'Linear Transformations', reason: 'Isomorphisms are bijective linear maps; bijectivity tested via ker = {0} and rank-nullity' },
    ],
    futureLinks: [
      { id: 'la6-004', label: 'Matrix Representations', reason: 'An invertible matrix represents an isomorphism in coordinates; similar matrices represent the same isomorphism in different bases' },
      { id: 'la6-006', label: 'Change of Basis', reason: 'Two choices of basis give two coordinate isomorphisms; the change-of-basis matrix converts between them' },
    ],
  },

  debugging: [
    {
      commonError: 'Defining a map that is linear but not injective, then claiming it is an isomorphism.',
      symptom: 'The proposed $T$ passes the "linearity check" but $T(\\mathbf{v}) = T(\\mathbf{w})$ for $\\mathbf{v} \\neq \\mathbf{w}$, so $T^{-1}$ cannot be defined.',
      whyItHappened: 'Students focus on verifying linearity and forget to check injectivity (trivial kernel).',
      repairStrategy: 'After verifying linearity, always compute $\\ker T$. Set $T(\\mathbf{v}) = \\mathbf{0}$ and solve — if the only solution is $\\mathbf{v} = \\mathbf{0}$, $T$ is injective. With equal finite dimensions, this is sufficient for isomorphism.',
    },
    {
      commonError: 'Confusing "an isomorphism exists" with "every map is an isomorphism."',
      symptom: 'Student concludes that any linear map $T: V \\to W$ with $\\dim V = \\dim W$ is an isomorphism.',
      whyItHappened: 'Misreading the classification theorem: it guarantees that SOME isomorphism exists, not that EVERY linear map is one.',
      repairStrategy: 'The classification theorem says: there exist isomorphisms between $V$ and $W$ iff $\\dim V = \\dim W$. Any specific candidate map must still be checked for injectivity/surjectivity.',
    },
  ],
};
