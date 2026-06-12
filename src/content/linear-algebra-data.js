// Linear Algebra Reference — exhaustive first-semester coverage
// Each concept: id, name, category, plain, intuition, formal, example, exampleLatex, when, watchout, openmat

export const LA_CATEGORIES = [
  { id: 'vectors',         label: 'Vectors & Spaces',   color: 'blue'    },
  { id: 'matrices',        label: 'Matrices',            color: 'purple'  },
  { id: 'systems',         label: 'Linear Systems',      color: 'cyan'    },
  { id: 'determinants',    label: 'Determinants',        color: 'orange'  },
  { id: 'inverse',         label: 'Inverse & Rank',      color: 'emerald' },
  { id: 'eigenvalues',     label: 'Eigenvalues',         color: 'rose'    },
  { id: 'transformations', label: 'Transformations',     color: 'violet'  },
  { id: 'orthogonality',   label: 'Orthogonality',       color: 'teal'    },
]

export const LA_CONCEPTS = [

  // ── VECTORS & SPACES ──────────────────────────────────────────────────────

  {
    id: 'vector',
    name: 'Vector',
    category: 'vectors',
    plain: 'An ordered list of numbers. In two dimensions it describes a point or an arrow in the plane. In three dimensions it describes a point or direction in space. In n dimensions it is simply n numbers stacked on top of each other. The individual numbers are called components or entries.',
    intuition: 'Think of a vector as a set of instructions: "go 3 right, 1 back, 2 up." The vector (3, −1, 2) is those instructions written as a column. Two vectors are equal only when every corresponding instruction is the same.',
    formal: '\\mathbf{v} = \\begin{pmatrix} v_1 \\\\ v_2 \\\\ \\vdots \\\\ v_n \\end{pmatrix} \\in \\mathbb{R}^n',
    example: 'v = (3, −1, 2) lives in ℝ³. Its three components are 3, −1, and 2.',
    exampleLatex: '\\mathbf{v} = \\begin{pmatrix} 3 \\\\ -1 \\\\ 2 \\end{pmatrix}',
    when: 'Vectors are everywhere — they represent forces in physics, pixel colours in graphics, word meanings in AI, and data points in statistics. In linear algebra they are the fundamental objects that matrices act on.',
    watchout: 'A vector is not the same as a point, even though we write them the same way. A point has a fixed location; a vector is a displacement that can start anywhere. Context tells you which one is meant.',
    openmat: `% Create a column vector and inspect it
v = [3; -1; 2]
disp('Components:')
disp(v)
disp('Length of vector:')
disp(length(v))`,
  },
  {
    id: 'scalar',
    name: 'Scalar',
    category: 'vectors',
    plain: 'A plain number — not a vector or a matrix. When you multiply a vector by a scalar, every component gets multiplied by that number. The word "scalar" exists purely to distinguish plain numbers from the more complex objects (vectors, matrices) they operate on.',
    intuition: 'Scalar multiplication stretches or shrinks a vector. Multiplying by 2 doubles its length. Multiplying by −1 reverses its direction. Multiplying by 0 collapses it to the zero vector.',
    formal: 'c \\in \\mathbb{R}, \\qquad c\\,\\mathbf{v} = \\begin{pmatrix} cv_1 \\\\ cv_2 \\\\ \\vdots \\\\ cv_n \\end{pmatrix}',
    example: 'v = (2, −1, 3). Multiply by scalar c = 4: every entry is multiplied by 4.',
    exampleLatex: '4 \\begin{pmatrix} 2 \\\\ -1 \\\\ 3 \\end{pmatrix} = \\begin{pmatrix} 8 \\\\ -4 \\\\ 12 \\end{pmatrix}',
    when: 'Scalar multiplication appears in every linear combination, every eigenvalue equation (Av = λv), and every normalisation step (dividing by a length).',
    watchout: 'Do not confuse a 1×1 matrix with a scalar — they look the same numerically but behave differently in matrix algebra.',
    openmat: `v = [2; -1; 3]
c = 4
result = c * v
disp(result)`,
  },
  {
    id: 'magnitude',
    name: 'Magnitude (Norm)',
    category: 'vectors',
    plain: 'The length of a vector — the straight-line distance from the origin to the tip of the arrow. For a 2D vector it is the Pythagorean theorem. For higher dimensions the formula extends naturally: square every component, sum them, take the square root.',
    intuition: 'Imagine the vector as a rod from the origin. The magnitude is how long that rod is. Direction is separate from length — two vectors can point the same way but have different magnitudes.',
    formal: '\\|\\mathbf{v}\\| = \\sqrt{v_1^2 + v_2^2 + \\cdots + v_n^2}',
    example: 'v = (3, 4): ‖v‖ = √(9 + 16) = √25 = 5. The classic 3-4-5 right triangle.',
    exampleLatex: '\\|\\mathbf{v}\\| = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5',
    when: 'You use magnitude whenever you need a notion of "distance" or "size" — normalising vectors, computing angles, measuring errors in least squares, defining convergence in sequences.',
    watchout: 'The notation ‖v‖ (double bars) means magnitude. Single bars |x| mean absolute value for scalars. They are related — |x| = ‖x‖ when x is a 1D vector.',
    openmat: `v = [3; 4]
mag = norm(v)
disp('Magnitude:')
disp(mag)

% Also works in 3D
w = [1; 2; 2]
disp(norm(w))   % should be 3`,
  },
  {
    id: 'unit-vector',
    name: 'Unit Vector',
    category: 'vectors',
    plain: 'A vector with magnitude exactly 1. To convert any nonzero vector into a unit vector pointing the same direction, divide every component by the vector\'s magnitude. This is called normalising. Unit vectors are used when you care about direction but not scale.',
    intuition: 'Think of the unit vector as the "pure direction" of v, stripped of its length. All unit vectors in ℝ² lie on the unit circle; all unit vectors in ℝ³ lie on the unit sphere.',
    formal: '\\hat{\\mathbf{v}} = \\dfrac{\\mathbf{v}}{\\|\\mathbf{v}\\|}, \\qquad \\|\\hat{\\mathbf{v}}\\| = 1',
    example: 'v = (3, 4), ‖v‖ = 5. Unit vector: (3/5, 4/5) = (0.6, 0.8). Check: 0.6² + 0.8² = 0.36 + 0.64 = 1 ✓',
    exampleLatex: '\\hat{\\mathbf{v}} = \\frac{1}{5}\\begin{pmatrix}3\\\\4\\end{pmatrix} = \\begin{pmatrix}0.6\\\\0.8\\end{pmatrix}',
    when: 'Gram-Schmidt orthogonalisation, the columns of orthogonal matrices, normal vectors in geometry, and direction vectors in physics are all unit vectors.',
    watchout: 'The zero vector has no unit vector — you cannot normalise it because its magnitude is 0 and you would divide by zero.',
    openmat: `v = [3; 4]
u = v / norm(v)
disp('Unit vector:')
disp(u)
disp('Check magnitude = 1:')
disp(norm(u))`,
  },
  {
    id: 'dot-product',
    name: 'Dot Product',
    category: 'vectors',
    plain: 'A way to multiply two vectors that produces a single number (a scalar). Multiply corresponding components and sum the results. The dot product measures how much two vectors "agree in direction" — it is large and positive when they point the same way, zero when they are perpendicular, and negative when they point opposite ways.',
    intuition: 'Imagine shining a light perpendicular to v and measuring the shadow of u on v. The dot product is (length of shadow) × (length of v). When they are perpendicular, the shadow has zero length, and the dot product is zero.',
    formal: '\\mathbf{u}\\cdot\\mathbf{v} = \\sum_{i=1}^n u_i v_i = \\|\\mathbf{u}\\|\\,\\|\\mathbf{v}\\|\\cos\\theta',
    example: 'u = (1, 2, 3), v = (4, −5, 6): dot product = 1·4 + 2·(−5) + 3·6 = 4 − 10 + 18 = 12.',
    exampleLatex: '\\begin{pmatrix}1\\\\2\\\\3\\end{pmatrix}\\cdot\\begin{pmatrix}4\\\\-5\\\\6\\end{pmatrix} = 4-10+18 = 12',
    when: 'The dot product is the engine of projections, the definition of orthogonality, the formula for work in physics (F·d), and the core operation inside every neural network layer.',
    watchout: 'The dot product produces a scalar, not a vector. It is also only defined for vectors of the same length.',
    openmat: `u = [1; 2; 3]
v = [4; -5; 6]
d = dot(u, v)
disp('Dot product:')
disp(d)

% Angle between them
theta = acos(dot(u,v) / (norm(u)*norm(v)))
disp('Angle (radians):')
disp(theta)`,
  },
  {
    id: 'linear-combination',
    name: 'Linear Combination',
    category: 'vectors',
    plain: 'A new vector formed by scaling a set of vectors by numbers (scalars) and adding the results. This is the most fundamental operation in linear algebra. Almost every other concept — span, basis, linear independence, matrix-vector products — is defined in terms of linear combinations.',
    intuition: 'If you have two vectors and you can move as far as you like in each direction and add the results, every vector you can reach is a linear combination of those two. The set of all reachable vectors is the span.',
    formal: 'c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2 + \\cdots + c_k\\mathbf{v}_k, \\quad c_i \\in \\mathbb{R}',
    example: '3·(1,0) + (−2)·(0,1) = (3, 0) + (0, −2) = (3, −2). Any vector in ℝ² is a linear combination of (1,0) and (0,1).',
    exampleLatex: '3\\begin{pmatrix}1\\\\0\\end{pmatrix} + (-2)\\begin{pmatrix}0\\\\1\\end{pmatrix} = \\begin{pmatrix}3\\\\-2\\end{pmatrix}',
    when: 'Solving Ax = b asks: can b be written as a linear combination of the columns of A? Every matrix-vector product Ax is a linear combination of the columns of A with weights from x.',
    watchout: 'The scalars c₁, c₂, … can be any real numbers — positive, negative, zero, fractional. There is no restriction.',
    openmat: `v1 = [1; 0]
v2 = [0; 1]
c1 = 3
c2 = -2
result = c1*v1 + c2*v2
disp(result)`,
  },
  {
    id: 'span',
    name: 'Span',
    category: 'vectors',
    plain: 'The set of ALL possible linear combinations of a collection of vectors. It is everything you can reach using those vectors as building blocks, with any scalar weights. The span is always a subspace (it contains the zero vector, and it is closed under addition and scaling).',
    intuition: 'Two non-parallel vectors in ℝ³ span a plane through the origin — you can reach every point on that plane but nothing off it. Add a third vector not on the plane and the span grows to all of ℝ³.',
    formal: '\\operatorname{span}\\{\\mathbf{v}_1,\\ldots,\\mathbf{v}_k\\} = \\{c_1\\mathbf{v}_1 + \\cdots + c_k\\mathbf{v}_k : c_i \\in \\mathbb{R}\\}',
    example: 'span{(1,0), (0,1)} = all of ℝ². span{(1,0), (2,0)} = just the x-axis — both vectors are parallel so you can only reach one line.',
    exampleLatex: '\\operatorname{span}\\left\\{\\begin{pmatrix}1\\\\0\\end{pmatrix},\\begin{pmatrix}2\\\\0\\end{pmatrix}\\right\\} = \\left\\{\\begin{pmatrix}t\\\\0\\end{pmatrix}: t\\in\\mathbb{R}\\right\\}',
    when: 'The column space of a matrix A is the span of its columns. Asking "does Ax = b have a solution?" is the same as asking "is b in the span of the columns of A?"',
    watchout: 'Adding more vectors to a set never shrinks the span — it can only stay the same or grow. If the new vector is already in the span of the others, the span does not change.',
    openmat: `% The span of two vectors in R^3 is a plane
% Check if a target vector is in the span by solving for coefficients
A = [1 0; 0 1; 1 1]  % two vectors as columns
b = [3; 2; 5]        % target: is this in the span?
x = A \ b            % solve for coefficients
disp('Coefficients:')
disp(x)
disp('Reconstruction:')
disp(A*x)`,
  },
  {
    id: 'linear-independence',
    name: 'Linear Independence',
    category: 'vectors',
    plain: 'A set of vectors is linearly independent if no vector in the set can be built from the others using a linear combination. Equivalently: the only way to produce the zero vector from a linear combination of them is to multiply every vector by zero. If even one vector is redundant (reachable from the rest), the set is linearly dependent.',
    intuition: 'Think of linear independence as "no dead weight." Each vector in an independent set contributes a genuinely new direction. In a dependent set, at least one vector is a passenger — it adds nothing because the others already span that direction.',
    formal: 'c_1\\mathbf{v}_1+\\cdots+c_k\\mathbf{v}_k=\\mathbf{0} \\implies c_1=c_2=\\cdots=c_k=0',
    example: '(1,0) and (0,1) are independent. (1,0), (0,1), (2,1) are dependent because (2,1) = 2·(1,0) + 1·(0,1).',
    exampleLatex: '\\begin{pmatrix}2\\\\1\\end{pmatrix} = 2\\begin{pmatrix}1\\\\0\\end{pmatrix}+1\\begin{pmatrix}0\\\\1\\end{pmatrix} \\implies \\text{dependent}',
    when: 'You check linear independence to determine: whether a set of vectors forms a basis, whether a matrix is invertible (its columns are independent iff det ≠ 0), and whether a system Ax = 0 has only the trivial solution.',
    watchout: 'Linear independence is a property of a SET of vectors, not of individual vectors. A single nonzero vector is always independent. The zero vector makes any set dependent (since 1·0 = 0).',
    openmat: `% Check independence: form a matrix, check rank
v1 = [1; 0; 0]
v2 = [0; 1; 0]
v3 = [2; 1; 0]   % dependent: 2*v1 + 1*v2
A = [v1 v2 v3]
r = rank(A)
disp('Rank (= number of independent vectors):')
disp(r)           % will be 2, not 3`,
  },
  {
    id: 'basis',
    name: 'Basis',
    category: 'vectors',
    plain: 'A set of vectors that spans the entire space AND is linearly independent. "Spans the space" means you can build any vector in the space from them. "Linearly independent" means there is no redundancy — each vector in the basis contributes a unique direction. A basis is simultaneously the smallest possible spanning set and the largest possible independent set.',
    intuition: 'A basis is like a coordinate system. Once you have a basis, every vector in the space has exactly one way to be expressed as a linear combination of the basis vectors. Those coefficients are the coordinates of the vector in that basis.',
    formal: '\\mathcal{B} = \\{\\mathbf{b}_1,\\ldots,\\mathbf{b}_n\\} \\text{ spans } V \\text{ and is linearly independent}',
    example: 'Standard basis of ℝ²: {(1,0), (0,1)}. Another valid basis: {(1,1), (1,−1)}. Both span ℝ² with no redundancy. Infinitely many bases exist.',
    exampleLatex: 'e_1=\\begin{pmatrix}1\\\\0\\end{pmatrix},\\; e_2=\\begin{pmatrix}0\\\\1\\end{pmatrix} \\quad \\text{standard basis of }\\mathbb{R}^2',
    when: 'Bases appear everywhere: choosing coordinates, representing linear transformations as matrices, the columns of an invertible matrix form a basis for ℝⁿ, and eigenvectors of a diagonalisable matrix form a basis.',
    watchout: 'A space has infinitely many bases, but all of them have the same number of vectors — that number is the dimension of the space.',
    openmat: `% The standard basis vectors of R^3
e1 = [1; 0; 0]
e2 = [0; 1; 0]
e3 = [0; 0; 1]

% Express v = (5, -2, 3) in this basis: trivial, the coordinates are the components
v = [5; -2; 3]
% coordinates are just the entries: 5, -2, 3`,
  },
  {
    id: 'dimension',
    name: 'Dimension',
    category: 'vectors',
    plain: 'The number of vectors in any basis of a vector space. This is well-defined — every basis of the same space has the same number of vectors (this is a theorem). Intuitively, dimension is the number of independent directions you need to describe the space completely.',
    intuition: 'ℝ¹ is a line (1 direction). ℝ² is a plane (2 directions). ℝ³ is space (3 directions). A plane inside ℝ³ has dimension 2 even though it lives in a 3-dimensional world — it only has 2 independent directions within itself.',
    formal: '\\dim(V) = n \\text{ where } n = \\text{size of any basis of } V',
    example: 'ℝⁿ has dimension n. A plane through the origin in ℝ³ has dimension 2. A line through the origin has dimension 1. The zero space {0} has dimension 0.',
    exampleLatex: '\\dim(\\mathbb{R}^n)=n, \\quad \\dim(\\{\\mathbf{0}\\})=0',
    when: 'Dimension tells you how many equations you need to describe a solution set, how many basis vectors you need, and how much "freedom" exists in a system. The Rank-Nullity Theorem relates the dimensions of the column space and null space.',
    watchout: 'The dimension of a subspace is never larger than the dimension of the space it lives in.',
    openmat: `% Dimension of a subspace = rank of the matrix whose columns span it
A = [1 2 3; 0 1 2; 0 0 0]
d = rank(A)
disp('Dimension of column space:')
disp(d)    % 2: only 2 independent columns`,
  },
  {
    id: 'subspace',
    name: 'Subspace',
    category: 'vectors',
    plain: 'A subset of a vector space that is itself a vector space — it must contain the zero vector, be closed under addition (add two vectors from the subset, the result is still in the subset), and be closed under scalar multiplication (scale a vector from the subset, the result is still in the subset). These three rules ensure the subset "behaves like its own self-contained linear algebra world."',
    intuition: 'Any line or plane through the origin in ℝ³ is a subspace. A line NOT through the origin fails the zero vector test — move a vector to the origin and it is no longer on the line.',
    formal: 'W \\subseteq V \\text{ is a subspace if: } \\mathbf{0}\\in W,\\; \\mathbf{u}+\\mathbf{v}\\in W,\\; c\\mathbf{v}\\in W',
    example: 'The set of all (x, y, z) with x + y + z = 0 is a subspace of ℝ³ — it is a plane through the origin.',
    exampleLatex: 'W=\\{(x,y,z): x+y+z=0\\} \\subseteq \\mathbb{R}^3',
    when: 'The column space, null space, row space, and eigenspace of a matrix are all subspaces. Understanding subspaces is the foundation for understanding what matrices do geometrically.',
    watchout: 'A subspace MUST contain the zero vector. If someone gives you a set that does not contain 0, it is immediately NOT a subspace.',
    openmat: `% Test if a set of vectors spans a subspace
% A plane through origin: x + y + z = 0
% Basis: two vectors satisfying the constraint
b1 = [1; -1; 0]
b2 = [1; 0; -1]
% Any linear combination is also in the plane
c1 = 3; c2 = -2
v = c1*b1 + c2*b2
disp('In the plane (sum = 0)?')
disp(sum(v))    % should be 0`,
  },
  {
    id: 'vector-space',
    name: 'Vector Space',
    category: 'vectors',
    plain: 'Any set where you can add elements together and scale them by numbers, and where those operations satisfy eight natural rules. The rules include: addition is commutative and associative, there is a zero element, every element has an additive inverse, scalar multiplication distributes over addition, and so on. The important insight is that "vectors" do not have to be arrows — polynomials, matrices, functions, and sequences can all be vector spaces.',
    intuition: 'The eight axioms are just formalising "addition and scaling work sensibly." Any system where you can add and scale with no surprises is a vector space. The abstraction lets you apply linear algebra to many different mathematical objects at once.',
    formal: '(V,+,\\cdot) \\text{ satisfying the 8 vector space axioms (closure, assoc., comm., identity, inverses, scalar distributivity)}',
    example: 'ℝⁿ is the standard example. But P₂ (polynomials of degree ≤ 2) is also a vector space: you can add polynomials and scale them. So is M₂ₓ₂ (2×2 matrices).',
    exampleLatex: '\\mathbb{R}^n,\\quad P_2 = \\{a+bx+cx^2\\},\\quad M_{2\\times 2}',
    when: 'The moment you abstract from "lists of numbers" to "vector space," you can apply every linear algebra theorem to functions, polynomials, and matrices without rewriting the theory. This is the power of abstraction.',
    watchout: 'Not every set with addition and scaling is a vector space — you must verify all eight axioms. For standard ℝⁿ this is obvious; for exotic spaces it requires checking.',
    openmat: `% Polynomials form a vector space — openmat treats them as coefficient vectors
p = [1; 2; 3]    % represents 1 + 2x + 3x^2
q = [4; 0; -1]   % represents 4 + 0x - x^2
sum_pq = p + q   % 5 + 2x + 2x^2
disp(sum_pq)`,
  },

  // ── MATRICES ──────────────────────────────────────────────────────────────

  {
    id: 'matrix',
    name: 'Matrix',
    category: 'matrices',
    plain: 'A rectangular grid of numbers arranged in rows and columns. An m×n matrix has m rows and n columns. You can think of a matrix as: a table of data, a collection of column vectors placed side by side, or a description of a linear transformation. All three views are correct and useful at different times.',
    intuition: 'A matrix is a machine. You feed it a vector (on the right), and it produces a new vector. The matrix encodes HOW input vectors get transformed — stretched, rotated, projected, sheared.',
    formal: 'A \\in \\mathbb{R}^{m\\times n}: \\quad A = \\begin{pmatrix} a_{11}&\\cdots&a_{1n}\\\\ \\vdots&\\ddots&\\vdots\\\\ a_{m1}&\\cdots&a_{mn}\\end{pmatrix}',
    example: 'A 2×3 matrix has 2 rows and 3 columns. Entry a₂₃ is in row 2, column 3.',
    exampleLatex: 'A=\\begin{pmatrix}1&2&3\\\\4&5&6\\end{pmatrix}\\in\\mathbb{R}^{2\\times 3},\\quad a_{23}=6',
    when: 'Matrices are used to represent systems of equations, linear transformations, graphs (adjacency matrices), data (each row is a data point), and much more.',
    watchout: 'The notation m×n means m rows, n columns — rows first. When multiplying A (m×n) by B (n×p), the inner dimensions n must match.',
    openmat: `A = [1 2 3; 4 5 6]
disp('Size of A:')
disp(size(A))   % [2 3]
disp('Entry in row 2, col 3:')
disp(A(2,3))    % 6`,
  },
  {
    id: 'transpose',
    name: 'Transpose',
    category: 'matrices',
    plain: 'Flipping a matrix over its main diagonal — rows become columns and columns become rows. If A is m×n, then Aᵀ is n×m. The entry in row i, column j of Aᵀ equals the entry in row j, column i of A.',
    intuition: 'Imagine printing the matrix on paper and rotating it 90° clockwise, then flipping it horizontally. Row 1 becomes column 1, row 2 becomes column 2, and so on.',
    formal: '(A^T)_{ij} = A_{ji}',
    example: 'A is 2×3. After transposing: 3×2. Row 1 of A becomes column 1 of Aᵀ.',
    exampleLatex: '\\begin{pmatrix}1&2&3\\\\4&5&6\\end{pmatrix}^T=\\begin{pmatrix}1&4\\\\2&5\\\\3&6\\end{pmatrix}',
    when: 'Transpose appears in the formula for orthogonal projection (A(AᵀA)⁻¹Aᵀb), the normal equations for least squares (AᵀAx̂ = Aᵀb), and the definition of symmetric and orthogonal matrices.',
    watchout: '(AB)ᵀ = BᵀAᵀ — the order reverses on transpose. This catches many beginners.',
    openmat: `A = [1 2 3; 4 5 6]
AT = A'
disp(AT)
disp('Check: (AB)^T = B^T A^T')
B = [1 0; 0 1; 2 1]
disp(isequal((A*B)', B'*A'))`,
  },
  {
    id: 'symmetric-matrix',
    name: 'Symmetric Matrix',
    category: 'matrices',
    plain: 'A square matrix that equals its own transpose: A = Aᵀ. Every entry above the diagonal mirrors the entry below it. Symmetric matrices have special and beautiful properties: all their eigenvalues are real numbers, and their eigenvectors (for different eigenvalues) are always perpendicular to each other.',
    intuition: 'Symmetric matrices arise naturally when a relationship is mutual — if object i affects object j by amount aᵢⱼ, and the relationship is symmetric (j affects i the same amount), the matrix is symmetric. Covariance matrices in statistics are always symmetric.',
    formal: 'A = A^T \\quad\\Leftrightarrow\\quad a_{ij}=a_{ji} \\text{ for all } i,j',
    example: 'AᵀA is always symmetric for any matrix A, since (AᵀA)ᵀ = Aᵀ(Aᵀ)ᵀ = AᵀA.',
    exampleLatex: 'A=\\begin{pmatrix}1&2&3\\\\2&5&4\\\\3&4&6\\end{pmatrix}=A^T',
    when: 'Symmetric matrices appear in: covariance in statistics, stiffness matrices in engineering, the second-derivative test in multivariable calculus (the Hessian matrix), and the Spectral Theorem in advanced linear algebra.',
    watchout: 'Only square matrices can be symmetric — there is no such thing as a symmetric non-square matrix.',
    openmat: `A = [1 2 3; 2 5 4; 3 4 6]
disp('Is symmetric?')
disp(isequal(A, A'))   % true

% AᵀA is always symmetric
B = [1 2; 3 4; 5 6]
C = B'*B
disp('B^T B:')
disp(C)
disp(isequal(C, C'))`,
  },
  {
    id: 'identity-matrix',
    name: 'Identity Matrix',
    category: 'matrices',
    plain: 'The matrix equivalent of the number 1 — multiplying any matrix by the identity leaves it unchanged. It has 1s on the main diagonal and 0s everywhere else. Denoted Iₙ for the n×n identity. AI = IA = A for any compatible matrix A.',
    intuition: 'The identity matrix is the "do nothing" transformation. It takes every input vector and returns it unchanged. Every other matrix can be thought of as a modified identity.',
    formal: '(I_n)_{ij}=\\delta_{ij}=\\begin{cases}1&i=j\\\\0&i\\neq j\\end{cases}, \\quad AI=IA=A',
    example: 'I₂ = [[1,0],[0,1]]. Multiplying any 2D vector by I₂ returns the same vector unchanged.',
    exampleLatex: 'I_3=\\begin{pmatrix}1&0&0\\\\0&1&0\\\\0&0&1\\end{pmatrix}',
    when: 'The identity appears in the definition of matrix inverse (AA⁻¹ = I), in the characteristic polynomial det(A − λI), and as the starting point for Gauss-Jordan elimination to find inverses.',
    watchout: 'Iₙ only commutes with n×n square matrices. For non-square A (m×n), the left identity is Iₘ and the right identity is Iₙ — they are different sizes.',
    openmat: `I = eye(3)
disp(I)

A = [1 2; 3 4]
I2 = eye(2)
disp('A * I = A?')
disp(isequal(A*I2, A))   % true`,
  },
  {
    id: 'matrix-multiplication',
    name: 'Matrix Multiplication',
    category: 'matrices',
    plain: 'To multiply A (m×n) by B (n×p): the entry in row i, column j of the result is the dot product of row i of A with column j of B. The inner dimensions must match — A has n columns, B must have n rows. The result is m×p. Matrix multiplication represents composing two transformations — doing B first, then A.',
    intuition: 'AB means "apply B, then apply A." If B rotates and A scales, then AB rotates-then-scales. The ORDER matters: AB is generally not the same as BA.',
    formal: '(AB)_{ij}=\\sum_{k=1}^{n}a_{ik}b_{kj}, \\quad A\\in\\mathbb{R}^{m\\times n},\\; B\\in\\mathbb{R}^{n\\times p}',
    example: '2×2 times 2×2: each of the 4 entries in the result is a dot product. Result is 2×2.',
    exampleLatex: '\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}\\begin{pmatrix}5&6\\\\7&8\\end{pmatrix}=\\begin{pmatrix}19&22\\\\43&50\\end{pmatrix}',
    when: 'Composing transformations, solving systems (LU decomposition), graph problems (Aⁿ counts n-step paths), statistics (covariance: XᵀX/n), machine learning (every layer in a neural network).',
    watchout: 'AB ≠ BA in general. Also: AB = 0 does not mean A = 0 or B = 0 (unlike numbers). And the inner dimensions must match — (m×n)(n×p) works; (m×n)(p×n) does not.',
    openmat: `A = [1 2; 3 4]
B = [5 6; 7 8]
C = A * B
disp('A*B:')
disp(C)
disp('B*A (different!):')
disp(B*A)`,
  },
  {
    id: 'matrix-vector-product',
    name: 'Matrix-Vector Product',
    category: 'matrices',
    plain: 'Multiplying an m×n matrix A by an n×1 vector x gives an m×1 vector. There are two equivalent ways to see this: (1) the row picture — each output entry is a dot product of a row of A with x; (2) the column picture — Ax is a linear combination of the columns of A, with entries of x as weights. Both are correct; the column picture is usually more powerful.',
    intuition: 'Think of A as having columns a₁, a₂, …, aₙ. Then Ax = x₁a₁ + x₂a₂ + ⋯ + xₙaₙ. The matrix "mixes" its columns according to the recipe given by x.',
    formal: 'A\\mathbf{x}=x_1\\mathbf{a}_1+x_2\\mathbf{a}_2+\\cdots+x_n\\mathbf{a}_n \\quad \\text{(column picture)}',
    example: 'A 2×2 matrix times a 2-vector: Ax = x₁(column 1 of A) + x₂(column 2 of A).',
    exampleLatex: '\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}\\begin{pmatrix}x_1\\\\x_2\\end{pmatrix}=x_1\\begin{pmatrix}1\\\\3\\end{pmatrix}+x_2\\begin{pmatrix}2\\\\4\\end{pmatrix}',
    when: 'Every system of equations Ax = b is a matrix-vector product. Every linear transformation is a matrix-vector product. Neural networks evaluate each layer as a matrix-vector product.',
    watchout: 'The number of columns of A must equal the number of rows of x (the length of x). An m×n matrix requires an n-dimensional input vector.',
    openmat: `A = [1 2; 3 4]
x = [3; -1]
b = A * x
disp('Ax =')
disp(b)
% Column picture: 3*(col1) + (-1)*(col2)
disp(3*A(:,1) + (-1)*A(:,2))`,
  },

  // ── LINEAR SYSTEMS ────────────────────────────────────────────────────────

  {
    id: 'system-of-equations',
    name: 'System of Linear Equations',
    category: 'systems',
    plain: 'A collection of equations where each equation is linear in the unknowns — no x², no xy, no sin(x), just constants times unknowns added together. The goal is to find values of the unknowns that satisfy ALL equations simultaneously. Written compactly: Ax = b.',
    intuition: 'Each equation describes a hyperplane (a line in 2D, a plane in 3D). Solving the system finds the intersection of all those hyperplanes. Two lines can intersect in a point (one solution), be parallel (no solution), or be the same line (infinitely many).',
    formal: 'A\\mathbf{x}=\\mathbf{b}: \\quad \\sum_{j=1}^n a_{ij}x_j = b_i \\quad \\text{for } i=1,\\ldots,m',
    example: 'x + 2y = 5 and 3x − y = 1. Written as Ax = b: the matrix A encodes the coefficients, b encodes the right-hand sides.',
    exampleLatex: '\\begin{pmatrix}1&2\\\\3&-1\\end{pmatrix}\\begin{pmatrix}x\\\\y\\end{pmatrix}=\\begin{pmatrix}5\\\\1\\end{pmatrix}',
    when: 'Systems of linear equations arise in every quantitative field — circuit analysis (Kirchhoff\'s laws), structural engineering (equilibrium), economics (supply/demand), data fitting (least squares).',
    watchout: 'A system can have no solution, exactly one solution, or infinitely many solutions. It cannot have exactly two solutions — either there is one or infinitely many.',
    openmat: `A = [1 2; 3 -1]
b = [5; 1]
x = A \ b    % backslash solves Ax = b
disp('Solution:')
disp(x)
disp('Verify A*x = b:')
disp(A*x)`,
  },
  {
    id: 'augmented-matrix',
    name: 'Augmented Matrix',
    category: 'systems',
    plain: 'A compact notation for a system Ax = b: write the coefficient matrix A and the right-hand side vector b side by side, separated by a vertical bar. Every row of the augmented matrix represents one equation. Row operations on the augmented matrix correspond exactly to valid operations on the original system.',
    intuition: 'The augmented matrix lets you track both the coefficients AND the right-hand sides in one object. When you row-reduce it, you are solving the system step by step without having to rewrite variables each time.',
    formal: '[A\\mid\\mathbf{b}]=\\left(\\begin{array}{ccc|c}a_{11}&\\cdots&a_{1n}&b_1\\\\\\vdots&&\\vdots&\\vdots\\\\a_{m1}&\\cdots&a_{mn}&b_m\\end{array}\\right)',
    example: 'x + 2y = 5, 3x − y = 1 becomes [1 2 | 5; 3 −1 | 1].',
    exampleLatex: '\\left(\\begin{array}{cc|c}1&2&5\\\\3&-1&1\\end{array}\\right)',
    when: 'Every time you do Gaussian elimination by hand, you write the augmented matrix. It is also used to find matrix inverses via Gauss-Jordan: augment A with I and reduce.',
    watchout: 'The vertical bar is just notation — it has no algebraic meaning. Do not let it distract you from the fact that this is still just a matrix being row-reduced.',
    openmat: `% Represent augmented matrix and reduce
A = [1 2; 3 -1]
b = [5; 1]
aug = [A b]
disp('Augmented matrix:')
disp(aug)
disp('RREF:')
disp(rref(aug))`,
  },
  {
    id: 'row-operations',
    name: 'Elementary Row Operations',
    category: 'systems',
    plain: 'Three operations you can perform on the rows of a matrix that change its form without changing its solution set. Operation 1: swap two rows. Operation 2: multiply an entire row by a nonzero scalar. Operation 3: add a multiple of one row to another row. These three operations are the engine of Gaussian elimination.',
    intuition: 'Each row operation corresponds to a valid algebraic step on the original system of equations. Swapping rows reorders equations. Scaling a row multiplies an equation through. Adding a multiple of one row eliminates a variable from another equation.',
    formal: 'R_i\\leftrightarrow R_j, \\quad cR_i\\to R_i\\;(c\\neq0), \\quad R_i+cR_j\\to R_i',
    example: 'To eliminate x from equation 2: subtract 3 times row 1 from row 2. This is R₂ ← R₂ − 3R₁.',
    exampleLatex: 'R_2 \\leftarrow R_2 - 3R_1: \\quad \\begin{pmatrix}1&2\\\\3&-1\\end{pmatrix}\\to\\begin{pmatrix}1&2\\\\0&-7\\end{pmatrix}',
    when: 'Row operations are the core of: Gaussian elimination (solving systems), Gauss-Jordan elimination (finding inverses and RREF), computing determinants (via triangular form), and finding rank.',
    watchout: 'You must NEVER multiply or add to COLUMNS during row reduction — only rows. Column operations change the solution set.',
    openmat: `A = [1 2; 3 -1]
% Perform R2 = R2 - 3*R1
A(2,:) = A(2,:) - 3*A(1,:)
disp('After row operation:')
disp(A)`,
  },
  {
    id: 'rref',
    name: 'Reduced Row Echelon Form (RREF)',
    category: 'systems',
    plain: 'The completely reduced form of a matrix. In RREF: every pivot is 1, and each pivot is the ONLY nonzero entry in its column. This is unique — every matrix has exactly one RREF. Reading solutions directly from the RREF requires no back-substitution.',
    intuition: 'RREF is what you get when you push row reduction as far as it will go — not just forward (to upper triangular) but also backward (zeroing entries above each pivot). The result is as clean as possible.',
    formal: '\\text{Each pivot}=1,\\text{ each pivot column has zeros everywhere else}',
    example: 'From RREF you can read: which variables are determined (pivot columns), which are free (non-pivot columns), and what the solutions are.',
    exampleLatex: '\\left(\\begin{array}{ccc|c}1&0&2&3\\\\0&1&-1&1\\end{array}\\right)\\Rightarrow x_1=3-2x_3,\\; x_2=1+x_3',
    when: 'RREF is used to find all solutions to a system, determine rank, find the null space, and determine whether a set of vectors is linearly independent.',
    watchout: 'Row echelon form (REF) only goes forward — upper triangular, pivots not necessarily 1. RREF goes all the way. Most textbooks mean RREF when they say "solve the system."',
    openmat: `A = [1 2 3; 4 5 6; 7 8 9]
b = [1; 2; 3]
aug = [A b]
disp('RREF of augmented matrix:')
disp(rref(aug))`,
  },
  {
    id: 'pivot',
    name: 'Pivot & Free Variable',
    category: 'systems',
    plain: 'In the RREF of a matrix, a pivot is the leading 1 in a nonzero row. Columns containing a pivot are called pivot columns — the variables in these columns are basic variables (they are "determined" by the equations). Columns without a pivot are free variable columns — those variables can take any value, and the basic variables adjust accordingly. Free variables generate a family of infinitely many solutions.',
    intuition: 'Think of basic variables as "locked" (once you choose the free variables, the basic variables are forced). Free variables are the degrees of freedom in your solution set.',
    formal: '\\text{pivot column}\\Rightarrow\\text{basic variable};\\quad\\text{non-pivot column}\\Rightarrow\\text{free variable}',
    example: 'RREF has pivots in columns 1 and 3. Column 2 is free. Then x₂ can be anything; x₁ and x₃ are determined by x₂.',
    exampleLatex: '\\text{rank}=2,\\; n=3 \\Rightarrow \\text{nullity}=1 \\text{ (one free variable)}',
    when: 'Pivot analysis tells you the rank (number of pivots), nullity (number of free variables), and whether the system is consistent (no "0 = 1" rows).',
    watchout: 'The number of free variables equals the nullity of A. A unique solution has zero free variables.',
    openmat: `A = [1 2 3; 0 0 1; 0 0 0]
[R, pivot_cols] = rref(A)
disp('RREF:')
disp(R)
disp('Pivot columns:')
disp(pivot_cols)`,
  },
  {
    id: 'homogeneous',
    name: 'Homogeneous System',
    category: 'systems',
    plain: 'A system Ax = 0 where the right-hand side is all zeros. It always has at least one solution — x = 0, the trivial solution. If the rank of A is less than the number of unknowns, it has infinitely many solutions (the free variables can be anything). The solution set of a homogeneous system is always a subspace — it is the null space of A.',
    intuition: 'Homogeneous systems ask: "what inputs does A map to zero?" The answer is the null space. If A is invertible, only x = 0 maps to zero. If A has a nontrivial null space, A is "losing information" — multiple inputs give the same output.',
    formal: 'A\\mathbf{x}=\\mathbf{0} \\quad\\text{always has } \\mathbf{x}=\\mathbf{0}; \\quad\\text{nontrivial solutions when rank}(A)<n',
    example: 'Ax = 0 with A a 3×4 matrix: rank ≤ 3, so nullity ≥ 1 — guaranteed nontrivial solutions.',
    exampleLatex: '\\text{Null}(A)=\\{\\mathbf{x}: A\\mathbf{x}=\\mathbf{0}\\} \\text{ is always a subspace}',
    when: 'Homogeneous systems arise in: finding the null space, testing linear independence (are the only coefficients making a linear combination zero all zero?), finding eigenvectors (solve (A−λI)v = 0).',
    watchout: 'A homogeneous system is ALWAYS consistent — x = 0 is always a solution. The interesting question is whether there are others.',
    openmat: `A = [1 2 3; 4 5 6; 7 8 9]
disp('Null space basis:')
disp(null(A, 'r'))   % rational null space`,
  },

  // ── DETERMINANTS ──────────────────────────────────────────────────────────

  {
    id: 'determinant',
    name: 'Determinant',
    category: 'determinants',
    plain: 'A single number assigned to every square matrix that encodes how the matrix scales volumes. In 2D, |det(A)| is the area of the parallelogram formed by the columns of A. In 3D it is the volume of the parallelepiped. If det(A) = 0, the matrix "squashes" space flat — it is not invertible. If det(A) ≠ 0, the matrix is invertible.',
    intuition: 'The determinant tells you the "size" of the transformation. A determinant of 2 means areas double. A determinant of −1 means areas stay the same but orientation flips (like a mirror reflection). A determinant of 0 means the transformation collapses all of space into a lower dimension.',
    formal: '\\det(A)\\in\\mathbb{R},\\quad |\\det(A)|=\\text{volume scaling factor}',
    example: 'det([[a,b],[c,d]]) = ad − bc. If a=2, b=0, c=0, d=3: det = 6. The matrix scales areas by a factor of 6.',
    exampleLatex: '\\det\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}=ad-bc',
    when: 'Determinants tell you: invertibility (det ≠ 0 ↔ invertible), volume scaling in change-of-variables, eigenvalues via the characteristic polynomial, and Cramer\'s rule for systems.',
    watchout: 'det(A + B) ≠ det(A) + det(B). And det(cA) = cⁿ det(A) for an n×n matrix — not just c·det(A).',
    openmat: `A = [3 1; 2 4]
d = det(A)
disp('Determinant:')
disp(d)   % 3*4 - 1*2 = 10

B = [1 2 3; 4 5 6; 7 8 9]
disp(det(B))   % 0 — singular matrix`,
  },
  {
    id: 'cofactor-expansion',
    name: 'Cofactor Expansion',
    category: 'determinants',
    plain: 'A method to compute the determinant of an n×n matrix by expanding along any row or column. Pick a row; for each entry in that row, multiply it by its cofactor (a signed minor) and sum the results. For efficiency, choose the row or column with the most zeros.',
    intuition: 'Cofactor expansion reduces an n×n determinant to a sum of (n−1)×(n−1) determinants, which reduces to (n−2)×(n−2), and so on, until you reach 2×2 determinants you can compute directly.',
    formal: '\\det(A)=\\sum_{j=1}^n a_{ij}(-1)^{i+j}\\det(A_{ij})\\quad(\\text{expand along row }i)',
    example: 'Expanding a 3×3 along row 1: a₁₁C₁₁ + a₁₂C₁₂ + a₁₃C₁₃ where Cᵢⱼ = (−1)^(i+j) × minor.',
    exampleLatex: '\\det(A)=a_{11}\\det(A_{11})-a_{12}\\det(A_{12})+a_{13}\\det(A_{13})',
    when: 'Cofactor expansion is used for small matrices (2×2, 3×3) by hand. For large matrices, row reduction is far more efficient. It also gives the formula for the inverse via the adjugate matrix.',
    watchout: 'The signs alternate in a checkerboard pattern: +−+/−+−/+−+. The sign for position (i,j) is (−1)^(i+j).',
    openmat: `A = [2 1 3; 0 4 2; 1 0 5]
d = det(A)
disp('Determinant via built-in:')
disp(d)
% Verify by hand: expand along row 1
d_hand = 2*det([4 2; 0 5]) - 1*det([0 2; 1 5]) + 3*det([0 4; 1 0])
disp(d_hand)`,
  },
  {
    id: 'minor-cofactor',
    name: 'Minor & Cofactor',
    category: 'determinants',
    plain: 'The (i,j) minor Mᵢⱼ of a matrix A is the determinant of the submatrix formed by deleting row i and column j. The (i,j) cofactor Cᵢⱼ is the minor with a sign: Cᵢⱼ = (−1)^(i+j) Mᵢⱼ. The sign creates a checkerboard pattern (+−+/−+−/+−+) so that some entries are negated when expanding.',
    intuition: 'To compute the minor Mᵢⱼ: cover up row i and column j with your fingers and compute the determinant of what remains. The cofactor just attaches the checkerboard sign to that number.',
    formal: 'C_{ij}=(-1)^{i+j}M_{ij},\\quad M_{ij}=\\det(A\\text{ minus row }i,\\text{col }j)',
    example: 'For a 3×3: the (1,2) cofactor has sign (−1)^(1+2) = −1, so C₁₂ = −M₁₂.',
    exampleLatex: 'C_{ij}=(-1)^{i+j}\\det(A_{ij})',
    when: 'Minors and cofactors are used in cofactor expansion, in computing the adjugate (matrix of cofactors transposed) for the matrix inverse formula, and in Cramer\'s rule.',
    watchout: 'Students often forget the sign. Write out the checkerboard and look up the sign before computing.',
    openmat: `A = [1 2 3; 4 5 6; 7 8 9]
% Minor M12: delete row 1, col 2
sub = A([2,3],[1,3])
M12 = det(sub)
C12 = (-1)^(1+2) * M12
disp('Minor M12:'), disp(M12)
disp('Cofactor C12:'), disp(C12)`,
  },
  {
    id: 'det-properties',
    name: 'Properties of Determinants',
    category: 'determinants',
    plain: 'Key properties: (1) swapping two rows negates the determinant; (2) multiplying a row by c multiplies the determinant by c; (3) adding a multiple of one row to another does NOT change the determinant; (4) det(Aᵀ) = det(A); (5) det(AB) = det(A)·det(B). Property 3 is why Gaussian elimination barely changes the determinant — only row swaps and row scalings matter.',
    intuition: 'Properties 1–3 mirror the row operations. Property 5 says "det is a homomorphism" — the determinant of a composition equals the product of determinants. This is why det(A⁻¹) = 1/det(A).',
    formal: '\\det(A^T)=\\det(A),\\quad\\det(AB)=\\det(A)\\det(B),\\quad\\det(cA)=c^n\\det(A)',
    example: 'If a row of A is all zeros, det(A) = 0. If two rows are equal, det(A) = 0. If rows are linearly dependent, det(A) = 0.',
    exampleLatex: '\\det(A)=0\\Leftrightarrow\\text{rows of }A\\text{ are linearly dependent}',
    when: 'Property 5 is used constantly: to find det(A⁻¹), to show that orthogonal matrices have det = ±1, and to compute det of products without multiplying matrices.',
    watchout: 'det(A + B) ≠ det(A) + det(B) — determinants do NOT distribute over addition.',
    openmat: `A = [1 2; 3 4]
B = [5 6; 7 8]
disp('det(A)*det(B):'), disp(det(A)*det(B))
disp('det(A*B):'),     disp(det(A*B))   % same
disp('det(A^T):'),     disp(det(A'))    % same as det(A)`,
  },

  // ── INVERSE & RANK ────────────────────────────────────────────────────────

  {
    id: 'invertible-matrix',
    name: 'Invertible Matrix',
    category: 'inverse',
    plain: 'A square matrix A is invertible (also called non-singular) if there exists a matrix A⁻¹ such that AA⁻¹ = A⁻¹A = I. This is equivalent to: det(A) ≠ 0; the columns are linearly independent; the rows are linearly independent; Ax = b has a unique solution for every b; the null space is just {0}; rank = n. All of these are equivalent — any one implies all the others.',
    intuition: 'An invertible matrix is a transformation you can undo. If A rotates, A⁻¹ rotates back. If A scales, A⁻¹ unscales. A non-invertible (singular) matrix collapses space — information is lost and cannot be recovered.',
    formal: 'A\\text{ invertible}\\Leftrightarrow\\exists A^{-1}: AA^{-1}=A^{-1}A=I_n',
    example: '[[2,1],[5,3]]: det = 6−5 = 1 ≠ 0 → invertible. [[1,2],[2,4]]: det = 4−4 = 0 → not invertible.',
    exampleLatex: '\\det(A)\\neq 0\\Leftrightarrow A\\text{ invertible}',
    when: 'Invertibility matters for: solving Ax = b (unique solution iff A invertible), stability of numerical algorithms, the existence of eigenbases (diagonalisation).',
    watchout: 'Only SQUARE matrices can be invertible. A non-square matrix can have a left inverse or right inverse, but not both.',
    openmat: `A = [2 1; 5 3]
disp('Determinant:'), disp(det(A))
Ainv = inv(A)
disp('Inverse:'), disp(Ainv)
disp('A * A^-1:'), disp(A * Ainv)`,
  },
  {
    id: 'matrix-inverse',
    name: 'Matrix Inverse',
    category: 'inverse',
    plain: 'The inverse A⁻¹ of a square invertible matrix A. For 2×2: swap the diagonal entries, negate the off-diagonals, divide by the determinant. For larger matrices: use Gauss-Jordan elimination — augment A with the identity I and row-reduce until the left block becomes I; the right block is then A⁻¹.',
    intuition: 'The inverse "undoes" the transformation. If Av = b, then A⁻¹b = v. The Gauss-Jordan method works because you are performing the same row operations on I that reduce A — and whatever reduces A to I, when applied to I, gives A⁻¹.',
    formal: 'A^{-1}=\\frac{1}{ad-bc}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}\\quad(2\\times 2)',
    example: '[A | I] → row reduce → [I | A⁻¹]. The operations that clean up A automatically build up A⁻¹.',
    exampleLatex: '[A\\mid I]\\xrightarrow{\\text{RREF}}[I\\mid A^{-1}]',
    when: 'The inverse lets you solve Ax = b as x = A⁻¹b. But for a single system, Gaussian elimination is faster. The inverse formula is most useful when you need to solve many systems with the same A.',
    watchout: 'Never compute A⁻¹ just to solve one system — use Gaussian elimination or the backslash operator instead. Computing the inverse is expensive and numerically less stable.',
    openmat: `A = [1 2; 3 4]
Ainv = inv(A)
disp('Inverse:'), disp(Ainv)

% Gauss-Jordan: augment with identity
I2 = eye(2)
aug = [A I2]
disp('RREF of [A|I]:')
disp(rref(aug))   % right block = A^-1`,
  },
  {
    id: 'rank',
    name: 'Rank',
    category: 'inverse',
    plain: 'The rank of a matrix is the number of pivot columns in its RREF — equivalently, the dimension of its column space (the span of the columns). Rank measures how much "independent information" the matrix carries. A 5×7 matrix with rank 3 means only 3 of its 7 columns are truly independent; the other 4 are combinations of those 3.',
    intuition: 'Rank is the number of dimensions the matrix "uses." A rank-2 matrix in ℝ³×³ maps all of ℝ³ onto a 2D plane — it compresses the third dimension away.',
    formal: '\\operatorname{rank}(A)=\\dim(\\operatorname{Col}(A))=\\text{number of pivots in RREF}',
    example: 'A 3×4 matrix with RREF having pivots in columns 1 and 3: rank = 2.',
    exampleLatex: '\\operatorname{rank}(A)=2\\Rightarrow\\operatorname{Col}(A)\\text{ is 2-dimensional}',
    when: 'Rank determines: whether Ax = b is consistent (b must be in the column space), the dimension of the solution space, and whether A is invertible (rank = n for an n×n matrix).',
    watchout: 'rank(A) = rank(Aᵀ) — the row rank equals the column rank. This is non-obvious but always true.',
    openmat: `A = [1 2 3; 4 5 6; 7 8 9]
r = rank(A)
disp('Rank:'), disp(r)   % 2, not 3

B = [1 0; 0 1; 0 0]
disp(rank(B))             % 2`,
  },
  {
    id: 'nullity',
    name: 'Nullity',
    category: 'inverse',
    plain: 'The nullity of a matrix is the dimension of its null space — the number of free variables in the solution to Ax = 0. Nullity measures the "freedom" or "degeneracy" of the matrix: how many independent directions it collapses to zero.',
    intuition: 'If nullity = 0, the matrix loses no information — every input gives a unique output. If nullity = 2, the matrix collapses a 2-dimensional "slab" of inputs all to zero — you cannot distinguish those inputs from the output alone.',
    formal: '\\operatorname{nullity}(A)=\\dim(\\operatorname{Null}(A))=n-\\operatorname{rank}(A)',
    example: 'A 3×5 matrix with rank 3: nullity = 5 − 3 = 2. Two free variables. The null space is 2-dimensional.',
    exampleLatex: '\\operatorname{rank}(A)+\\operatorname{nullity}(A)=n',
    when: 'Nullity = 0 iff A is injective (one-to-one). Nullity > 0 means the system Ax = b either has no solution or infinitely many. In compression and data science, large nullity means redundant features.',
    watchout: 'Nullity is defined relative to the number of COLUMNS (n), not rows. A tall matrix (m > n) can still have nullity 0.',
    openmat: `A = [1 2 3 4; 5 6 7 8; 9 10 11 12]
r = rank(A)
n = size(A, 2)   % number of columns
nullity = n - r
disp('Rank:'), disp(r)
disp('Nullity:'), disp(nullity)
disp('Null space basis:')
disp(null(A, 'r'))`,
  },
  {
    id: 'rank-nullity',
    name: 'Rank-Nullity Theorem',
    category: 'inverse',
    plain: 'For any m×n matrix A: rank(A) + nullity(A) = n. The rank is the number of pivot columns (information kept). The nullity is the number of free columns (information lost). Together they account for every column. This is the fundamental conservation law of linear algebra — "information in equals information out plus information lost."',
    intuition: 'Every column is either a pivot column (contributing to the rank) or a free column (contributing to the nullity). There is no third option. Count them up: rank + nullity = total columns = n.',
    formal: '\\dim(\\operatorname{Col}(A))+\\dim(\\operatorname{Null}(A))=n',
    example: 'A 4×6 matrix can have rank at most 4 (only 4 rows). If rank = 3, nullity = 6 − 3 = 3.',
    exampleLatex: '\\operatorname{rank}(A)+\\operatorname{nullity}(A)=n\\quad(n=\\text{columns})',
    when: 'Use the Rank-Nullity Theorem to find the nullity without computing the null space explicitly (just subtract rank from n). Also used to prove many other theorems in linear algebra.',
    watchout: 'The theorem counts COLUMNS (n), not rows (m). rank ≤ min(m, n), so nullity ≥ n − min(m, n) = max(0, n−m).',
    openmat: `A = [1 2 3; 0 1 4; 5 6 0]
r = rank(A)
n = size(A, 2)
disp('rank + nullity = n:')
disp([r, n-r, n])`,
  },
  {
    id: 'column-space',
    name: 'Column Space',
    category: 'inverse',
    plain: 'The column space of A is the span of all its columns — all possible linear combinations of the columns. Equivalently, it is the set of all vectors Ax as x ranges over ℝⁿ. Also called the image or range of A. The column space lives in ℝᵐ (one entry per row of A).',
    intuition: 'The column space is the "landing zone" of A — the set of all vectors A can produce. A vector b is in the column space iff Ax = b has a solution. If b is outside the column space, A cannot reach it.',
    formal: '\\operatorname{Col}(A)=\\{A\\mathbf{x}:\\mathbf{x}\\in\\mathbb{R}^n\\}=\\operatorname{span}(\\text{columns of }A)',
    example: 'A 3×2 matrix: its column space is at most a 2D plane through the origin in ℝ³.',
    exampleLatex: '\\operatorname{Col}(A)\\subseteq\\mathbb{R}^m,\\quad\\dim(\\operatorname{Col}(A))=\\operatorname{rank}(A)',
    when: 'The question "does Ax = b have a solution?" is the same as "is b in Col(A)?" The column space is also the image of the corresponding linear transformation.',
    watchout: 'The column space is a subspace of ℝᵐ (number of rows), while the null space is a subspace of ℝⁿ (number of columns). They live in different spaces.',
    openmat: `A = [1 2; 3 4; 5 6]
disp('Dimension of column space:')
disp(rank(A))   % 2 — spans a plane in R^3

% Basis for column space: pivot columns of A
[R, pivot_cols] = rref(A)
disp('Pivot columns:'), disp(pivot_cols)
disp('Column space basis:')
disp(A(:, pivot_cols))`,
  },
  {
    id: 'null-space',
    name: 'Null Space',
    category: 'inverse',
    plain: 'The null space of A is the set of all vectors x such that Ax = 0. It is the "kernel" — all inputs the matrix sends to zero. The null space is always a subspace of ℝⁿ. A matrix is invertible if and only if its null space contains only the zero vector.',
    intuition: 'The null space is what A "cannot see." If x is in the null space, A treats x as if it were zero. Two inputs that differ by a null space vector produce the same output: A(u + v) = Au when v is in the null space.',
    formal: '\\operatorname{Null}(A)=\\{\\mathbf{x}\\in\\mathbb{R}^n:A\\mathbf{x}=\\mathbf{0}\\}',
    example: 'If A has rank 2 and 4 columns, the null space is 2-dimensional — there is a 2-parameter family of solutions to Ax = 0.',
    exampleLatex: '\\operatorname{Null}(A)=\\{\\mathbf{0}\\}\\Leftrightarrow A\\text{ invertible (injective)}',
    when: 'Finding the null space: solve the homogeneous system Ax = 0. The null space appears in: testing linear independence, finding eigenvectors (null space of A−λI), and describing all solutions to Ax = b (general solution = particular + null space).',
    watchout: 'The null space lives in ℝⁿ (domain space), NOT ℝᵐ. The null space and column space live in different spaces.',
    openmat: `A = [1 2 3; 4 5 6; 7 8 9]
N = null(A, 'r')   % rational null space basis
disp('Null space basis:')
disp(N)
disp('Verify A*N = 0:')
disp(A*N)`,
  },

  // ── EIGENVALUES ───────────────────────────────────────────────────────────

  {
    id: 'eigenvalue',
    name: 'Eigenvalue',
    category: 'eigenvalues',
    plain: 'A scalar λ such that there exists a nonzero vector v with Av = λv. The matrix A simply scales v — it does not rotate it or change its direction. Eigenvalues reveal the intrinsic "stretching factors" of the transformation A. They can be real or complex numbers.',
    intuition: 'Most vectors change both magnitude AND direction when A is applied. Eigenvectors are the special directions that only get scaled. The eigenvalue is the scale factor. Finding eigenvalues = finding which scales are possible.',
    formal: 'A\\mathbf{v}=\\lambda\\mathbf{v},\\quad\\mathbf{v}\\neq\\mathbf{0}',
    example: 'If A = diag(3, 5), then (1,0) is an eigenvector with eigenvalue 3 — A just multiplies it by 3.',
    exampleLatex: '\\begin{pmatrix}3&0\\\\0&5\\end{pmatrix}\\begin{pmatrix}1\\\\0\\end{pmatrix}=3\\begin{pmatrix}1\\\\0\\end{pmatrix}',
    when: 'Eigenvalues are central to: stability analysis of differential equations, principal component analysis (PCA) in data science, quantum mechanics (energy levels), Google\'s PageRank, and vibration analysis in engineering.',
    watchout: 'Eigenvalues can be complex even for real matrices. For symmetric matrices, all eigenvalues are guaranteed real.',
    openmat: `A = [4 1; 2 3]
lambda = eig(A)
disp('Eigenvalues:')
disp(lambda)`,
  },
  {
    id: 'eigenvector',
    name: 'Eigenvector',
    category: 'eigenvalues',
    plain: 'A nonzero vector that does not change direction when A is applied — it only gets scaled. Eigenvectors are the "natural axes" of a transformation. Any nonzero scalar multiple of an eigenvector is also an eigenvector for the same eigenvalue. To find eigenvectors for eigenvalue λ: solve (A − λI)v = 0.',
    intuition: 'Imagine applying A repeatedly. Most vectors spiral around chaotically. But eigenvectors just grow or shrink along a fixed line. They are the stable directions of the transformation.',
    formal: '(A-\\lambda I)\\mathbf{v}=\\mathbf{0},\\quad\\mathbf{v}\\neq\\mathbf{0}\\quad\\Rightarrow\\quad\\mathbf{v}\\in\\operatorname{Null}(A-\\lambda I)',
    example: 'For A = [[4,1],[2,3]], eigenvalue λ = 5: solve (A−5I)v = 0 to find v = (1,1) (up to scaling).',
    exampleLatex: '(A-\\lambda I)\\mathbf{v}=\\mathbf{0}\\Rightarrow\\mathbf{v}=\\text{null space of }(A-\\lambda I)',
    when: 'Eigenvectors form the columns of P in diagonalisation A = PDP⁻¹. They are the principal components in PCA. They are the stationary distributions in Markov chains.',
    watchout: 'The zero vector is NEVER an eigenvector — even though A·0 = λ·0 is always true. The definition requires v ≠ 0.',
    openmat: `A = [4 1; 2 3]
[V, D] = eig(A)
disp('Eigenvectors (columns of V):')
disp(V)
disp('Eigenvalues (diagonal of D):')
disp(diag(D))
% Verify: A*v1 = lambda1 * v1
disp(A*V(:,1))
disp(D(1,1)*V(:,1))`,
  },
  {
    id: 'characteristic-polynomial',
    name: 'Characteristic Polynomial',
    category: 'eigenvalues',
    plain: 'The polynomial p(λ) = det(A − λI) whose roots are exactly the eigenvalues of A. For an n×n matrix it is a degree-n polynomial. Finding eigenvalues means solving det(A − λI) = 0. For a 2×2 matrix: p(λ) = λ² − tr(A)·λ + det(A), where tr(A) is the trace (sum of diagonal entries).',
    intuition: 'Av = λv means (A − λI)v = 0 has a nonzero solution, which means (A − λI) is not invertible, which means det(A − λI) = 0. The characteristic polynomial captures all values of λ for which this fails.',
    formal: 'p(\\lambda)=\\det(A-\\lambda I)=0',
    example: 'A = [[4,1],[2,3]]: p(λ) = (4−λ)(3−λ) − 2 = λ² − 7λ + 10 = (λ−5)(λ−2). Eigenvalues: 5 and 2.',
    exampleLatex: '\\det\\begin{pmatrix}4-\\lambda&1\\\\2&3-\\lambda\\end{pmatrix}=(4-\\lambda)(3-\\lambda)-2=\\lambda^2-7\\lambda+10',
    when: 'Every eigenvalue computation starts with the characteristic polynomial. The trace equals the sum of eigenvalues; the determinant equals their product.',
    watchout: 'For matrices larger than 3×3, computing the characteristic polynomial by hand is tedious. In practice, numerical algorithms find eigenvalues directly.',
    openmat: `A = [4 1; 2 3]
% Characteristic polynomial coefficients
p = poly(A)     % coefficients of det(lambda*I - A)
disp('Characteristic polynomial coefficients:')
disp(p)
roots_p = roots(p)
disp('Eigenvalues:'), disp(roots_p)`,
  },
  {
    id: 'diagonalization',
    name: 'Diagonalization',
    category: 'eigenvalues',
    plain: 'Writing A = PDP⁻¹ where D is a diagonal matrix (eigenvalues on the diagonal) and P has the corresponding eigenvectors as columns. If A is diagonalizable, computations become easy: Aⁿ = PDⁿP⁻¹, and Dⁿ just raises each diagonal entry to the n-th power. Not every matrix is diagonalizable — it requires n linearly independent eigenvectors.',
    intuition: 'Diagonalization changes coordinates to the eigenvector basis, where A acts as a simple scaling. In this basis, A is diagonal and easy to work with. P is the change-of-basis matrix, D is A in the new basis.',
    formal: 'A=PDP^{-1},\\quad D=\\operatorname{diag}(\\lambda_1,\\ldots,\\lambda_n),\\quad P=[\\mathbf{v}_1\\cdots\\mathbf{v}_n]',
    example: 'A has eigenvalues 5, 2 with eigenvectors (1,1) and (1,−2). Then P = [[1,1],[1,−2]], D = diag(5,2).',
    exampleLatex: 'A^n=PD^nP^{-1},\\quad D^n=\\operatorname{diag}(\\lambda_1^n,\\ldots,\\lambda_n^n)',
    when: 'Diagonalization is used to: compute matrix powers (Markov chains, recurrences), solve systems of differential equations, understand long-term behaviour of iterative processes.',
    watchout: 'Not every matrix is diagonalizable. If an eigenvalue\'s geometric multiplicity < algebraic multiplicity, you cannot form an eigenbasis. Use Jordan form instead.',
    openmat: `A = [4 1; 2 3]
[P, D] = eig(A)
disp('P (eigenvectors):'), disp(P)
disp('D (eigenvalues):'), disp(D)
disp('Verify A = P D P^-1:')
disp(P * D * inv(P))`,
  },
  {
    id: 'multiplicity',
    name: 'Algebraic vs Geometric Multiplicity',
    category: 'eigenvalues',
    plain: 'Algebraic multiplicity of λ: how many times λ appears as a root of the characteristic polynomial (counting with repetition). Geometric multiplicity of λ: the dimension of the eigenspace — how many linearly independent eigenvectors exist for that eigenvalue. Geometric multiplicity ≤ algebraic multiplicity always. When they are equal for every eigenvalue, the matrix is diagonalizable.',
    intuition: 'Algebraic multiplicity says "λ appears this many times in the spectrum." Geometric multiplicity says "there are this many independent eigenvectors for λ." If geometric < algebraic, there is a "defect" — not enough eigenvectors to span the space.',
    formal: 'g.m.(\\lambda)=\\dim(E_\\lambda)\\leq a.m.(\\lambda)',
    example: 'If λ = 2 is a double root (a.m. = 2) but has only one independent eigenvector (g.m. = 1), A is not diagonalizable.',
    exampleLatex: 'g.m.(\\lambda)<a.m.(\\lambda)\\Rightarrow A\\text{ not diagonalizable}',
    when: 'This distinction matters whenever you check diagonalizability. If all eigenvalues are distinct, all multiplicities are automatically 1 and the matrix is diagonalizable.',
    watchout: 'Geometric multiplicity can never EXCEED algebraic multiplicity. If someone tells you g.m. > a.m., there is an error somewhere.',
    openmat: `% A matrix that is NOT diagonalizable
A = [2 1; 0 2]     % eigenvalue 2 with a.m.=2 but g.m.=1
lambda = eig(A)
disp('Eigenvalues:'), disp(lambda)  % both 2
N = null(A - 2*eye(2))
disp('Eigenspace dim:'), disp(size(N,2))  % 1, not 2`,
  },

  // ── LINEAR TRANSFORMATIONS ────────────────────────────────────────────────

  {
    id: 'linear-transformation',
    name: 'Linear Transformation',
    category: 'transformations',
    plain: 'A function T: ℝⁿ → ℝᵐ that preserves vector addition and scalar multiplication. Formally: T(u + v) = T(u) + T(v) and T(cv) = cT(v) for all vectors u, v and scalars c. These two rules together mean T preserves all linear combinations. Every linear transformation can be represented as multiplication by a matrix: T(x) = Ax.',
    intuition: 'Linear transformations are the "straight" functions of linear algebra — they preserve lines and the origin. Rotations, reflections, projections, and scalings are all linear. Translation (sliding everything over) is NOT linear because it moves the origin.',
    formal: 'T(c_1\\mathbf{u}+c_2\\mathbf{v})=c_1T(\\mathbf{u})+c_2T(\\mathbf{v})',
    example: 'Rotation by 90°: T(x,y) = (−y, x). Check: T((1,0)) = (0,1), T((0,1)) = (−1,0). Matrix: [[0,−1],[1,0]].',
    exampleLatex: 'T(\\mathbf{x})=A\\mathbf{x},\\quad A=\\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix}\\text{ (rotate 90°)}',
    when: 'Linear transformations are the central objects of study in linear algebra. Every matrix IS a linear transformation. Coordinate changes, projections, symmetries, and solutions to differential equations are all linear transformations.',
    watchout: 'T(0) must equal 0 for any linear transformation — this is a quick test. Translation (T(x) = x + b with b ≠ 0) is NOT linear because T(0) = b ≠ 0.',
    openmat: `% Rotation by 90 degrees
theta = pi/2
A = [cos(theta) -sin(theta); sin(theta) cos(theta)]
v = [1; 0]
Tv = A * v
disp('T(1,0) = (should be (0,1)):')
disp(Tv)`,
  },
  {
    id: 'kernel',
    name: 'Kernel (Null Space)',
    category: 'transformations',
    plain: 'The kernel of a linear transformation T is the set of all inputs that T maps to the zero vector: ker(T) = {v : T(v) = 0}. For T(x) = Ax, the kernel is exactly the null space of A. The kernel measures how much information T loses — if ker(T) = {0}, no information is lost (T is injective).',
    intuition: 'The kernel is everything T cannot distinguish from zero. If v is in the kernel, T cannot tell v apart from the zero vector. A large kernel means T is "many-to-one" in many directions.',
    formal: '\\ker(T)=\\{\\mathbf{v}:T(\\mathbf{v})=\\mathbf{0}\\}=\\operatorname{Null}(A)',
    example: 'Projection onto the x-axis: T(x,y) = (x,0). Kernel = {(0,y): y∈ℝ} = the y-axis.',
    exampleLatex: '\\dim(\\ker T)=\\operatorname{nullity}(A)=n-\\operatorname{rank}(A)',
    when: 'The kernel tells you: whether T is injective (ker = {0}), the dimension of the solution space of Ax = b, and what "gets lost" in the transformation.',
    watchout: 'Kernel and image (range) are dual concepts — the kernel is about what maps TO zero, the image is about what zero maps TO. They live in different spaces.',
    openmat: `% Projection onto x-axis
A = [1 0; 0 0]
disp('Null space (kernel) of projection:')
disp(null(A, 'r'))   % should be [0;1]`,
  },
  {
    id: 'image-range',
    name: 'Image (Range)',
    category: 'transformations',
    plain: 'The image (or range) of T is the set of all possible outputs: im(T) = {T(v) : v ∈ ℝⁿ}. For T(x) = Ax, the image is the column space of A. The image measures what T can produce — every vector in the image is reachable; vectors outside the image are not.',
    intuition: 'The image is the "output set" of T. If you imagine all possible inputs, the image is everything the transformation can produce. A transformation with small image has limited "reach."',
    formal: '\\operatorname{im}(T)=\\{T(\\mathbf{v}):\\mathbf{v}\\in\\mathbb{R}^n\\}=\\operatorname{Col}(A)',
    example: 'Projection onto the x-axis: every output is of the form (x, 0). Image = x-axis.',
    exampleLatex: '\\dim(\\operatorname{im}\\,T)=\\operatorname{rank}(A)',
    when: '"Is b achievable by T?" means "is b in im(T)?" If Ax = b has a solution, b ∈ im(T). The image determines what right-hand sides are possible.',
    watchout: 'The image lives in ℝᵐ (the codomain). The kernel lives in ℝⁿ (the domain). They are subspaces of different spaces.',
    openmat: `A = [1 2; 3 4; 5 6]
disp('Dimension of image (rank):')
disp(rank(A))

% Basis for image (column space):
[R, pvt] = rref(A)
disp('Image basis (pivot columns):')
disp(A(:, pvt))`,
  },
  {
    id: 'injective',
    name: 'Injective (One-to-One)',
    category: 'transformations',
    plain: 'T is injective (one-to-one) if different inputs always give different outputs: T(u) = T(v) implies u = v. Equivalently, ker(T) = {0}. For matrix transformations, T(x) = Ax is injective iff the columns of A are linearly independent iff rank(A) = n (number of columns).',
    intuition: 'Injective means "no collisions" — every output comes from at most one input. The transformation does not "crush" any two distinct inputs together.',
    formal: 'T\\text{ injective}\\Leftrightarrow T(\\mathbf{u})=T(\\mathbf{v})\\Rightarrow\\mathbf{u}=\\mathbf{v}\\Leftrightarrow\\ker(T)=\\{\\mathbf{0}\\}',
    example: 'T: ℝ² → ℝ³, T(x,y) = (x, y, 0) is injective — no two 2D vectors map to the same 3D vector.',
    exampleLatex: '\\ker(T)=\\{\\mathbf{0}\\}\\Leftrightarrow\\operatorname{rank}(A)=n\\Leftrightarrow T\\text{ injective}',
    when: 'Injective transformations preserve all information. A matrix is invertible iff the transformation it represents is both injective AND surjective.',
    watchout: 'For a map from ℝⁿ to ℝᵐ, injective requires n ≤ m — you cannot embed more dimensions into fewer without collisions.',
    openmat: `% Injective: columns are independent
A = [1 0; 0 1; 1 1]   % 3x2, rank 2 = n
disp('Is injective? (rank = n):')
disp(rank(A) == size(A,2))

% Not injective: columns dependent
B = [1 2; 2 4]
disp('Is injective?')
disp(rank(B) == size(B,2))`,
  },
  {
    id: 'surjective',
    name: 'Surjective (Onto)',
    category: 'transformations',
    plain: 'T is surjective (onto) if every possible output is achieved: for every b in ℝᵐ, there exists some x with T(x) = b. Equivalently, im(T) = ℝᵐ. For matrix transformations, T(x) = Ax is surjective iff the columns of A span ℝᵐ iff rank(A) = m (number of rows).',
    intuition: 'Surjective means "full coverage" — every output is reachable. The transformation leaves no gaps in the output space.',
    formal: 'T\\text{ surjective}\\Leftrightarrow\\operatorname{im}(T)=\\mathbb{R}^m\\Leftrightarrow\\operatorname{rank}(A)=m',
    example: 'T: ℝ³ → ℝ², T(x,y,z) = (x,y) is surjective — every (a,b) ∈ ℝ² is the image of (a,b,0).',
    exampleLatex: '\\operatorname{Col}(A)=\\mathbb{R}^m\\Leftrightarrow\\operatorname{rank}(A)=m\\Leftrightarrow T\\text{ surjective}',
    when: 'Surjectivity means Ax = b has a solution for EVERY b. If T is surjective and injective, it is an isomorphism and A is invertible.',
    watchout: 'For a map from ℝⁿ to ℝᵐ, surjective requires n ≥ m — you need at least as many input dimensions as output dimensions.',
    openmat: `% Surjective: columns span R^m
A = [1 2 3; 0 1 2]   % 2x3, rank 2 = m
disp('Is surjective? (rank = m):')
disp(rank(A) == size(A,1))`,
  },

  // ── ORTHOGONALITY ─────────────────────────────────────────────────────────

  {
    id: 'orthogonal-vectors',
    name: 'Orthogonal Vectors',
    category: 'orthogonality',
    plain: 'Two vectors are orthogonal if their dot product is zero. In 2D and 3D, orthogonal means perpendicular — they form a 90° angle. In higher dimensions, perpendicularity is defined BY the dot product, so "orthogonal" is the correct general term. The zero vector is orthogonal to every vector.',
    intuition: 'Orthogonal vectors "carry no information about each other" — knowing how large one is tells you nothing about the other. This is why orthogonal bases are so convenient: each coordinate is independently determined by a single dot product.',
    formal: '\\mathbf{u}\\perp\\mathbf{v}\\Leftrightarrow\\mathbf{u}\\cdot\\mathbf{v}=0',
    example: '(1, 0) and (0, 1) are orthogonal: 1·0 + 0·1 = 0. Also: (1, 1) and (1, −1): 1·1 + 1·(−1) = 0.',
    exampleLatex: '\\begin{pmatrix}1\\\\1\\end{pmatrix}\\cdot\\begin{pmatrix}1\\\\-1\\end{pmatrix}=1-1=0',
    when: 'Orthogonality is the foundation of: Fourier series, signal processing (decomposing signals into independent frequencies), QR decomposition, and the Gram-Schmidt process.',
    watchout: 'Orthogonal does not mean "unrelated" in a general sense — it has a precise algebraic meaning (dot product = 0). Two vectors can point in very different directions without being orthogonal.',
    openmat: `u = [1; 1]
v = [1; -1]
d = dot(u, v)
disp('Dot product:'), disp(d)   % 0 = orthogonal
disp('Are orthogonal:'), disp(d == 0)`,
  },
  {
    id: 'orthonormal',
    name: 'Orthonormal Set',
    category: 'orthogonality',
    plain: 'A set of vectors that are mutually orthogonal (every pair has dot product zero) AND each has magnitude 1. The standard basis {e₁, e₂, …, eₙ} is orthonormal. Orthonormal sets are the most convenient bases to work with: finding the coordinates of a vector in an orthonormal basis requires only dot products.',
    intuition: 'Orthonormal vectors are the "cleanest possible axes" — perpendicular unit directions. Working in an orthonormal basis is like working in a perfectly aligned, properly scaled coordinate system with no shearing.',
    formal: '\\mathbf{u}_i\\cdot\\mathbf{u}_j=\\delta_{ij}=\\begin{cases}1&i=j\\\\0&i\\neq j\\end{cases}',
    example: '{(1/√2, 1/√2), (1/√2, −1/√2)}: dot product = 0, each has magnitude 1. ✓',
    exampleLatex: '\\left\\{\\frac{1}{\\sqrt{2}}\\begin{pmatrix}1\\\\1\\end{pmatrix},\\frac{1}{\\sqrt{2}}\\begin{pmatrix}1\\\\-1\\end{pmatrix}\\right\\}',
    when: 'Orthonormal bases make coordinate computations trivial: the coefficient of basis vector uᵢ is just u·b (a dot product). QR decomposition produces orthonormal columns. The columns of orthogonal matrices are orthonormal.',
    watchout: 'Orthogonal = dot product 0. Orthonormal = dot product 0 AND each vector has magnitude 1. Orthonormal is the stronger condition.',
    openmat: `u1 = [1;1]/sqrt(2)
u2 = [1;-1]/sqrt(2)
disp('dot(u1,u2):'), disp(dot(u1,u2))    % 0
disp('norm(u1):'),  disp(norm(u1))         % 1
disp('norm(u2):'),  disp(norm(u2))         % 1`,
  },
  {
    id: 'projection',
    name: 'Orthogonal Projection',
    category: 'orthogonality',
    plain: 'The orthogonal projection of b onto a subspace W is the unique vector in W closest to b. It is the "shadow" of b on W — if you drew a line from b perpendicular to W, the shadow is where it lands. The error vector (b minus its projection) is always perpendicular to W.',
    intuition: 'Projection is how you "extract the W-component" of b. It answers: of all vectors in W, which one is closest to b? The answer is the projection, and the distance from b to W is ‖b − proj_W b‖.',
    formal: '\\operatorname{proj}_W\\mathbf{b}=A(A^TA)^{-1}A^T\\mathbf{b}\\quad(A\\text{ spans }W)',
    example: 'Project b = (1,1,1) onto span{(1,1,0)}: coeff = (1·1+1·1+1·0)/(1+1) = 1. Projection = 1·(1,1,0) = (1,1,0).',
    exampleLatex: '\\operatorname{proj}_{\\mathbf{a}}\\mathbf{b}=\\frac{\\mathbf{a}\\cdot\\mathbf{b}}{\\mathbf{a}\\cdot\\mathbf{a}}\\mathbf{a}',
    when: 'Projection is used in: least squares (project b onto Col(A)), Gram-Schmidt (subtract projections to orthogonalise), QR decomposition, and signal processing (extract frequency components).',
    watchout: 'The formula A(AᵀA)⁻¹Aᵀ projects onto the column space of A. For a single vector a, simplify to (aᵀb/aᵀa)a.',
    openmat: `a = [1; 1; 0]
b = [1; 1; 1]
proj = (dot(a,b)/dot(a,a)) * a
disp('Projection:'), disp(proj)
error = b - proj
disp('Error (should be perp to a):')
disp(dot(a, error))   % should be ~0`,
  },
  {
    id: 'gram-schmidt',
    name: 'Gram-Schmidt Process',
    category: 'orthogonality',
    plain: 'An algorithm that converts any linearly independent set of vectors into an orthonormal set spanning the same subspace. The idea: take each vector in turn, subtract its projections onto all previously orthogonalised vectors (removing the "shared direction"), then normalise. The result is a set of perpendicular unit vectors spanning the same space.',
    intuition: 'Start with v₁: normalise it to get e₁. Take v₂: subtract its e₁-component (the part pointing along e₁), leaving a vector perpendicular to e₁. Normalise that to get e₂. Repeat: at each step, subtract all previously found components and normalise.',
    formal: '\\mathbf{u}_k=\\mathbf{v}_k-\\sum_{j=1}^{k-1}\\frac{\\mathbf{v}_k\\cdot\\mathbf{u}_j}{\\|\\mathbf{u}_j\\|^2}\\mathbf{u}_j,\\quad\\mathbf{e}_k=\\frac{\\mathbf{u}_k}{\\|\\mathbf{u}_k\\|}',
    example: 'Start with {(1,1), (1,0)}. After Gram-Schmidt: {(1/√2, 1/√2), (1/√2, −1/√2)}.',
    exampleLatex: '\\mathbf{u}_2=\\mathbf{v}_2-\\frac{\\mathbf{v}_2\\cdot\\mathbf{u}_1}{\\|\\mathbf{u}_1\\|^2}\\mathbf{u}_1',
    when: 'Gram-Schmidt is the core of QR decomposition. QR decomposition is used for solving least squares problems, eigenvalue algorithms, and numerical stability.',
    watchout: 'Gram-Schmidt is numerically unstable for large problems — the modified Gram-Schmidt version is used in practice. The result is the same conceptually.',
    openmat: `v1 = [1; 1]
v2 = [1; 0]
% Step 1: normalise v1
e1 = v1 / norm(v1)
% Step 2: subtract e1-component from v2, normalise
u2 = v2 - dot(v2,e1)*e1
e2 = u2 / norm(u2)
disp('e1:'), disp(e1)
disp('e2:'), disp(e2)
disp('Orthogonal?'), disp(abs(dot(e1,e2)) < 1e-10)`,
  },
  {
    id: 'orthogonal-matrix',
    name: 'Orthogonal Matrix',
    category: 'orthogonality',
    plain: 'A square matrix Q whose columns form an orthonormal set. Equivalently, QᵀQ = QQᵀ = I, which means Qᵀ = Q⁻¹. Multiplying by Q preserves all lengths and all angles — it is a rigid motion (rotation or reflection). The determinant of an orthogonal matrix is always +1 (rotation) or −1 (reflection).',
    intuition: 'Orthogonal matrices are the "rigid" transformations — they do not stretch, shrink, or shear. They only rotate and reflect. The fact that Qᵀ = Q⁻¹ makes them numerically ideal — computing the inverse is free.',
    formal: 'Q^TQ=I\\Leftrightarrow Q^{-1}=Q^T,\\quad\\det(Q)=\\pm1',
    example: 'Rotation by θ: Q = [[cosθ,−sinθ],[sinθ,cosθ]]. Check: QᵀQ = I. det = cos²θ + sin²θ = 1.',
    exampleLatex: 'Q=\\begin{pmatrix}\\cos\\theta&-\\sin\\theta\\\\\\sin\\theta&\\cos\\theta\\end{pmatrix},\\quad Q^TQ=I',
    when: 'Orthogonal matrices appear in: QR decomposition (Q factor), rotations in computer graphics, the Spectral Theorem (symmetric matrices diagonalise with an orthogonal P), and numerical algorithms.',
    watchout: '"Orthogonal matrix" does NOT mean "a matrix whose entries are orthogonal." It means the COLUMNS form an orthonormal set.',
    openmat: `theta = pi/4
Q = [cos(theta) -sin(theta); sin(theta) cos(theta)]
disp('Q^T * Q (should be I):')
disp(Q'*Q)
disp('det(Q):'), disp(det(Q))   % 1`,
  },
  {
    id: 'least-squares',
    name: 'Least Squares',
    category: 'orthogonality',
    plain: 'When Ax = b has no exact solution (more equations than unknowns, overdetermined), the least-squares solution x̂ minimises ‖Ax − b‖² — the sum of squared errors. It finds the x that makes Ax as close as possible to b. Geometrically: project b onto the column space of A. Found by solving the normal equations AᵀAx̂ = Aᵀb.',
    intuition: 'You have more constraints than unknowns — the system is "over-specified" and no single point satisfies all equations. Least squares finds the best compromise: the point that is closest to satisfying everything simultaneously, in the squared-error sense.',
    formal: '\\hat{\\mathbf{x}}=(A^TA)^{-1}A^T\\mathbf{b}\\quad\\text{(normal equations: }A^TA\\hat{\\mathbf{x}}=A^T\\mathbf{b}\\text{)}',
    example: 'Fit a line y = mx + c to 3 data points (no exact solution exists). The normal equations give the best-fit m and c.',
    exampleLatex: 'A^TA\\hat{\\mathbf{x}}=A^T\\mathbf{b}\\Rightarrow\\hat{\\mathbf{x}}=(A^TA)^{-1}A^T\\mathbf{b}',
    when: 'Least squares is ubiquitous: linear regression, curve fitting, GPS (overdetermined position equations), control systems (overdetermined sensor data), and machine learning (training linear models).',
    watchout: 'The formula (AᵀA)⁻¹Aᵀ requires AᵀA to be invertible, which requires A to have independent columns (rank = n). If columns are dependent, use pseudoinverse or regularisation.',
    openmat: `% Fit a line y = mx + c to 3 points
x_data = [1; 2; 3]
y_data = [2.1; 3.9; 6.2]
A = [x_data ones(3,1)]   % each row: [x 1]
b = y_data
x_hat = (A'*A) \ (A'*b)  % normal equations
disp('Best fit [m; c]:')
disp(x_hat)`,
  },

]

// Attach category label and color to each concept
const categoryMap = Object.fromEntries(LA_CATEGORIES.map(c => [c.id, c]))
export const ALL_LA_CONCEPTS = LA_CONCEPTS.map(c => ({
  ...c,
  categoryLabel: categoryMap[c.category]?.label ?? c.category,
  color: categoryMap[c.category]?.color ?? 'blue',
}))
