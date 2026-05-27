export default {
  // â”€â”€ Identity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  id: 'la2-002',
  slug: 'matrix-multiplication',
  chapter: 'la2',
  order: 2,
  title: 'Matrix Multiplication as Composition',
  subtitle: 'Chaining spatial transformations together into a single, perfectly calculated movement.',
  tags: ['matrix multiplication', 'composition', 'non-commutative', 'chaining transformations', 'dot product'],
  aliases: 'multiplying matrices composing functions right-to-left AB BA transformation chain',

  // â”€â”€ Pedagogical Meta â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  timeToComplete: 20,
  coreConcept: 'Multiplying two matrices is mathematically identical to applying one linear transformation, and then applying a second linear transformation immediately after it.',
  prerequisites: ['la2-001'],
  nextLesson: 'inverse-matrices',

  // â”€â”€ Hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  hook: {
    question: "If I rotate a photo by 90 degrees, and then shear it horizontally, how do I write that mathematically?",
    realWorldContext: "When an animator at Pixar makes an animated character wave, they aren't just applying one transformation. They rotate the shoulder, then they rotate the elbow relative to the shoulder, then the wrist relative to the elbow. If the computer literally transformed all the millions of polygons in the arm 3 separate times, the movie would take millennia to render. Instead, the computer multiplies the three matrices together *first* to create one single 'master' matrix. It then applies this master matrix to the millions of polygons just once. Matrix multiplication is the ultimate shortcut: squishing a sequence of complex instructions into a single math operation.",
    previewVisualizationId: 'LALesson05_MatrixMult',
  },

  // â”€â”€ Intuition â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  intuition: {
    prose: [
      'Apply $R = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$ (90Â° CCW rotation) to $[3,1]^T$: result is $[-1,3]^T$. Now apply shear $S = \\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}$ to $[-1,3]^T$: result is $[2,3]^T$. Two steps: rotate then shear, and $[3,1]^T$ lands at $[2,3]^T$. The matrix that does BOTH steps at once is the product $SR = \\begin{bmatrix}0&-1\\\\1&1\\end{bmatrix}$ â€” a single matrix capturing both transformations. **Matrix multiplication IS transformation composition.** This lesson shows you how to compute that product and why the order of multiplication matches the order of applying transformations.',
      '**The shortcut insight.** Imagine applying matrix $A$ to every point in the plane. The plane warps into a new shape. Now apply matrix $B$ to the already-warped plane. The plane warps again. You have performed two transformations. But since both warps are linear, the *combined* effect is itself a linear transformation. That means a single matrix could have done both steps at once. That single matrix is the **product** $BA$ (B after A).',
      '**Why right-to-left?** We write $B(A(\\mathbf{x}))$ because functions compose from inside to outside. The matrix closest to the vector $\\mathbf{x}$ acts first, like nested function calls in code: `B(A(x))`. Reading $BA\\mathbf{x}$ correctly means: A acts on $\\mathbf{x}$ first, then B acts on the result.',
      '**The Pixar connection.** When animating a character\'s arm wave, the studio must account for: shoulder rotation, elbow rotation relative to shoulder, wrist rotation relative to elbow. Every frame, every polygon on the arm needs all three transformations applied. If you applied them one at a time to millions of polygons, the movie would take decades to render. Instead: multiply the three matrices together *first* to get one master matrix. Apply that single matrix to every polygon. One matrix product replaces three passes.',
      '**CNC parallel.** A CNC machining center moving a 5-axis part from fixtured position to cutting position does the same thing. The post-processor (the software that converts CAD moves to G-code) computes a chain of transformation matrices: work coordinate offset â†’ coordinate rotation (G68) â†’ tool length compensation â†’ machine kinematics. Each step is a matrix. The post-processor multiplies them together before outputting a single G-code block. The machine\'s controller never sees the individual steps â€” only the composite result.',
      '**Order is everything.** "First rotate 90Â°, then shear horizontally" warps space to a completely different shape than "first shear horizontally, then rotate 90Â°." In matrix language: $BA \\neq AB$ in general. This is called **non-commutativity**, and it is not an accident â€” it reflects the physical reality that the order of physical operations matters.',
      '**Predict before reading on.** You want to apply $A = \\begin{bmatrix}2&0\\\\0&3\\end{bmatrix}$ (scale $x$ by 2, $y$ by 3) and then $B = \\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}$ (horizontal shear). What is the product $BA$? Without computing the full matrix, predict: where does $[1,0]^T$ end up after both transformations? Check your answer in Example 1.',
      '**How to compute the product.** The $(i,j)$ entry of $AB$ is the dot product of row $i$ of $A$ with column $j$ of $B$. Geometrically: you are asking where the $j$-th basis vector goes under $B$, and then where *that* resulting vector goes under $A$. That landing coordinate is row $i$ of the result.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 12 â€” Matrices & Transformations',
        body: '**Previous (Lesson 1):** A matrix is a linear transformation â€” its columns are where $\\hat{i}$ and $\\hat{j}$ land.\n**This lesson:** Multiplying matrices = composing transformations. The product $BA$ applies $A$ first, then $B$.\n**Next (Lesson 3):** Determinants â€” how much does the transformation scale area?',
      },
      {
        type: 'warning',
        title: 'Read Right-to-Left â€” Always',
        body: 'The expression $CBA\\mathbf{v}$ applies transformations chronologically as $A$ first, then $B$, then $C$. The matrix physically closest to the vector acts first. This trips up students consistently â€” write it on a sticky note until it\'s automatic:\n\n$$CBA\\mathbf{v} = C\\bigl(B\\bigl(A(\\mathbf{v})\\bigr)\\bigr)$$',
      },
      {
        type: 'strategy',
        title: 'When to Multiply Matrices',
        body: '**Multiply matrices when** you need one matrix that does what two (or more) matrices would do in sequence â€” e.g., a CNC post-processor pre-computing a compound transformation, or a graphics pipeline combining rotation + scale + shear into one draw call.\n\n**Do NOT multiply** if you only need to transform a single vector â€” just apply each matrix in sequence: `B @ (A @ v)` is the same work as `(B @ A) @ v` for one vector, but pre-computing `B @ A` pays off when you need to transform thousands of vectors.\n\n**Dimension check first:** $(m \\times k)(k \\times n) = (m \\times n)$. If inner dimensions do not match, the product is undefined.',
      },
      {
        type: 'insight',
        title: 'The Column-Chasing View of Matrix Multiply',
        body: 'Column $j$ of $AB$ equals $A$ applied to column $j$ of $B$:\n\n$$(AB)_{:,j} = A \\cdot B_{:,j}$$\n\nSo you can compute $AB$ by multiplying $A$ by each column of $B$ separately. This view makes explicit that the columns of $AB$ are the destinations of the basis vectors after first $B$ then $A$.',
      },
      {
        type: 'definition',
        title: 'Dimension Compatibility',
        body: 'You can only multiply $A \\times B$ if the number of **columns** in $A$ equals the number of **rows** in $B$.\n\n$$(m \\times k)(k \\times n) = (m \\times n)$$\n\nThe inner dimension $k$ must match. The result has the outer dimensions. Violating this is one of the most common errors in scientific computing â€” NumPy will throw a shape mismatch error.',
      },
    ],
    visualizations: [
      {
        id: 'LALesson05_MatrixMult',
        title: 'Composing Two Warps â€” Interactive',
        mathBridge: 'Two transformation buttons (Shear A, Rotate B) apply in sequence. Use the playback slider to watch the plane undergo shear first, then rotation. Notice that the final positions of $\\hat{i}$ and $\\hat{j}$ match the columns of the algebraically computed product $BA$. Also try applying them in reverse order ($AB$) to see non-commutativity.',
        caption: 'Applying A then B is the same as applying the single matrix BA. The product captures both transformations simultaneously.',
      },
      {
        id: 'LAMatrixAlgebraModule',
        title: 'Matrix Algebra â€” Concept to Graphics Pipeline',
        mathBridge: 'A five-tab module: Concept covers addition, multiplication, identity, inverse, and LU; Canonical walks through a 2Ã—3 Ã— 3Ã—2 product entry by entry, a 2Ã—2 inverse by row reduction, and an LU factorisation; Real World shows the 3D graphics pipeline and FEA usage; Interactive lets you enter any 2Ã—2 matrices A and B and instantly computes AB, BA, det(A), Aâ»Â¹, and Aâ»Â¹b, plus a live graphics canvas with rotation/scale/shear sliders; Practice has five hand-calculation problems.',
        caption: 'The same math that renders every polygon in a 3D game â€” rotation, scale, and shear combined into a single matrix multiply.',
      },
    ],
  },

  // â”€â”€ Math â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  math: {
    prose: [
      'There is a mechanical algorithm for multiplying two matrices $A$ and $B$ by hand. Note that to multiply two matrices, their inner dimensions must match: an $(m \\times n)$ matrix times an $(n \\times p)$ matrix creates an $(m \\times p)$ matrix.',
      'To find the entry in the $i$-th row and $j$-th column of the new matrix, you take the **Dot Product** of the $i$-th row of the left matrix and the $j$-th column of the right matrix.',
      'For a $2 \\times 2$ example:',
      '$ \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} \\begin{bmatrix} e & f \\\\ g & h \\end{bmatrix} = \\begin{bmatrix} (ae+bg) & (af+bh) \\\\ (ce+dg) & (cf+dh) \\end{bmatrix} $',
      'While computing dot products row-by-column is the fastest way for a human or computer to churn out the numbers, the geometric insight is different. The first column of the final matrix, $\\begin{bmatrix} ae+bg \\\\ ce+dg \\end{bmatrix}$, is exactly the result of applying the left matrix to the first column of the right matrix $\\begin{bmatrix} e \\\\ g \\end{bmatrix}$.'
    ],
    callouts: [
      {
        type: 'strategy',
        title: 'The Karate Chop Method',
        body: 'To multiply matrices by hand: take the first row of the left matrix, lift it up, physically rotate it 90 degrees like a karate chop, lay it over the first column of the right matrix, multiply the touching numbers, and add them up.',
      },
      {
        type: 'theorem',
        title: 'Associativity vs Commutativity',
        body: 'Matrix multiplication is explicitly NOT commutative ($AB \\neq BA$). But it IS perfectly associative: $(AB)C = A(BC)$. You can group multiplications however you want, as long as you strictly maintain the left-to-right order.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'OpenMAT: Matrix Multiplication as Composition',
        mathBridge: 'In MATLAB, `A * B` is matrix multiplication (not element-wise â€” that would be `A .* B`). Composition: apply B first by writing `A * B` (right-to-left). Test commutativity directly.',
        caption: 'Three cells: mechanics, non-commutativity proof, and CNC multi-step transformation chain.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Matrix multiplication mechanics â€” dot product view',
              prose: [
                'In MATLAB, `A * B` is matrix multiplication. Each entry (i,j) of the result is the dot product of row i of A with column j of B.',
                'CRITICAL: `A .* B` is element-wise multiplication â€” completely different! Always use `*` for matrix products.',
              ],
              code: `A = [1 2; 3 4];
B = [5 6; 7 8];

AB = A * B;
disp('A * B ='); disp(AB)

% Verify (1,1) entry manually: row 1 of A dot col 1 of B
entry_11 = dot(A(1,:), B(:,1));
fprintf('Entry (1,1) = row1(A) Â· col1(B) = %g\\n', entry_11)

% Column view: col j of AB = A * col j of B
col1_of_AB = A * B(:,1);
fprintf('Col 1 of AB via column view: [%g; %g]\\n', col1_of_AB(1), col1_of_AB(2))`,
            },
            {
              id: 2,
              cellTitle: 'Non-commutativity â€” order changes the result',
              prose: [
                '"Rotate then shear" is a physically different transformation than "shear then rotate." Verify this: compute both products and apply to the same vector.',
                'The two results will differ â€” different final positions for the same starting point.',
              ],
              code: `% Rotation 90Â° CCW
R = [0 -1; 1 0];
% Horizontal shear (shears along x-axis)
S = [1 1; 0 1];

v = [1; 0];  % the unit vector i-hat

% Rotate then shear (S after R = S*R)
rotate_then_shear = S * R;
result_1 = rotate_then_shear * v;
fprintf('Rotate then shear: v goes to [%g; %g]\\n', result_1(1), result_1(2))

% Shear then rotate (R after S = R*S)
shear_then_rotate = R * S;
result_2 = shear_then_rotate * v;
fprintf('Shear then rotate: v goes to [%g; %g]\\n', result_2(1), result_2(2))

% Are they equal?
fprintf('AB == BA? %d  (0 = NO = non-commutative)\\n', isequal(rotate_then_shear, shear_then_rotate))`,
            },
            {
              id: 3,
              cellTitle: 'Application: CNC post-processor â€” chaining transformation matrices',
              prose: [
                'A 3-axis CNC program applies several coordinate transformations in sequence: work coordinate offset (G54), then coordinate rotation (G68), then cutting. The post-processor multiplies these matrices before outputting G-code â€” one product replaces three sequential operations.',
                'This is exactly why machining companies invest in expensive post-processor software. Getting the matrix multiplication wrong produces crashes and scrapped parts.',
              ],
              code: `% Simulate CNC post-processor matrix chain
% Each step: a 2Ã—2 matrix acting on [X; Y] tool positions

% Step 1: G54 work coordinate system is offset by [100; 50] mm
% But offsets are NOT linear maps (they translate the origin).
% We handle them separately â€” here we focus on the rotation chain.

% Step 2: G68 coordinate rotation â€” part clamped 7Â° off-axis
theta = 7 * pi / 180;
R_G68 = [cos(theta) -sin(theta); sin(theta) cos(theta)];

% Step 3: Mirror the X axis (the fixture is mirrored)
M_mirror = [-1 0; 0 1];

% Composite: first apply G68, then apply mirror
% Reading right to left: M_mirror * R_G68 applies G68 first
composite = M_mirror * R_G68;
fprintf('Composite transformation matrix:\\n')
disp(composite)

% A programmed tool path (3 points, as columns)
path_in = [20 20 0; 0 10 0]';  % [x; y] for each point
path_out = composite * path_in;

fprintf('\\nProgrammed points vs Machine coordinates:\\n')
for k = 1:3
    fprintf('  [%.2f, %.2f]  -->  [%.2f, %.2f]\\n', ...
        path_in(1,k), path_in(2,k), path_out(1,k), path_out(2,k))
end

% Show that applying individually gives the same result
step1 = R_G68 * path_in;
step2 = M_mirror * step1;
fprintf('\\nSame result via two steps? %d\\n', norm(step2 - path_out) < 1e-10)`,
            },
          ]
        }
      },
      {
        id: 'PythonNotebook',
        title: 'Code: Matrix Multiplication as Composition',
        mathBridge: 'A @ B computes the product. (A @ B) @ v = A @ (B @ v): apply B first, then A. Matrix multiplication is NOT commutative: A @ B â‰  B @ A in general.',
        caption: 'Verify the composition property: chaining two transformations equals multiplying their matrices.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Matrix multiplication â€” the mechanics',
              prose: [
                '`A @ B` in NumPy computes the matrix product. Each entry (i,j) of the result is the dot product of row i of A with column j of B.',
                'The result is a new matrix representing the composition of the two transformations.',
              ],
              code: `import numpy as np

A = np.array([[1., 2.],
              [3., 4.]])
B = np.array([[5., 6.],
              [7., 8.]])

AB = A @ B
print("A @ B =")
print(AB)
print()

# Verify entry (0,0): row 0 of A Â· col 0 of B
r0 = A[0]      # [1, 2]
c0 = B[:, 0]   # [5, 7]
print(f"Entry (0,0) = {r0} Â· {c0} = {np.dot(r0, c0)}")`,
            },
            {
              id: 2,
              cellTitle: 'Not commutative â€” order matters geometrically',
              prose: [
                'AB â‰  BA in general. "Rotate then shear" is a different transformation than "shear then rotate".',
                'The order in which you compose transformations changes the final result.',
              ],
              code: `import numpy as np
from opencalc import quick_transform

rotate = np.array([[0., -1.], [1., 0.]])   # 90Â° CCW
shear  = np.array([[1.,  1.], [0., 1.]])   # horizontal shear

rotate_then_shear = shear @ rotate   # apply rotate first, shear second
shear_then_rotate = rotate @ shear

print("Rotate then shear:")
print(rotate_then_shear)
print()
print("Shear then rotate:")
print(shear_then_rotate)
print()
print("Equal?", np.allclose(rotate_then_shear, shear_then_rotate))`,
            },
            {
              id: 3,
              cellTitle: 'Composition: applying B then A',
              prose: [
                '(A @ B) @ v = A @ (B @ v). Applying the product matrix to v gives the same result as applying B first, then A.',
                'This is the associativity property â€” you can group however you like, but you cannot change the order.',
              ],
              code: `import numpy as np

A = np.array([[2., 0.], [0., 0.5]])  # scale x2, shrink y
B = np.array([[0., -1.], [1., 0.]])  # 90Â° rotation
v = np.array([3.0, 1.0])

# Method 1: apply B then A separately
step1 = B @ v
step2 = A @ step1

# Method 2: compose first, then apply
AB = A @ B
result = AB @ v

print(f"B @ v = {step1}")
print(f"A @ (B @ v) = {step2}")
print(f"(A @ B) @ v = {result}")
print(f"Same result: {np.allclose(step2, result)}")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Verify non-commutativity',
              difficulty: 'easy',
              prompt: 'Let A be a 45Â° rotation matrix [[cos45, -sin45],[sin45, cos45]] and B be a reflection across the x-axis [[1,0],[0,-1]]. Compute AB and BA. Show they are different and describe geometrically what each composition does to the vector [1, 0].',
              code: `import numpy as np

angle = np.radians(45)
A = np.array([[np.cos(angle), -np.sin(angle)],
              [np.sin(angle),  np.cos(angle)]])  # 45Â° rotation
B = np.array([[1., 0.], [0., -1.]])              # reflect x-axis

# Compute AB and BA
# Apply each to v = [1, 0] and compare
v = np.array([1.0, 0.0])
`,
              hint: 'AB = A @ B. Then (A@B)@v vs (B@A)@v. Print both results and note the different final vectors.',
            },
          ]
        }
      },
    ],
  },

  // â”€â”€ Rigor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  rigor: {
    prose: [
      '**Composition of linear maps.** Let $T_1: U \\to V$ and $T_2: V \\to W$ be linear maps with matrix representations $B$ and $A$ respectively (so $T_1(\\mathbf{x}) = B\\mathbf{x}$, $T_2(\\mathbf{y}) = A\\mathbf{y}$). The composition $T_2 \\circ T_1: U \\to W$ defined by $(T_2 \\circ T_1)(\\mathbf{x}) = T_2(T_1(\\mathbf{x})) = A(B\\mathbf{x})$ is itself a linear map. Its matrix is $AB$.',
      '**Why the formula is row-dot-column.** For any input $\\mathbf{x}$, $(AB)\\mathbf{x} = A(B\\mathbf{x})$. Writing out $B\\mathbf{x} = \\sum_k x_k \\mathbf{b}_k$ where $\\mathbf{b}_k$ are columns of $B$, then $A(B\\mathbf{x}) = \\sum_k x_k A\\mathbf{b}_k$. The $(i,j)$ entry of $AB$ is $(AB)_{ij} = (A(B\\mathbf{e}_j))_i = (A \\mathbf{b}_j)_i = \\sum_k A_{ik} B_{kj}$. This is the dot product of row $i$ of $A$ with column $j$ of $B$. The formula is derived, not defined.',
      '**Associativity from function composition.** Function composition is always associative: $(h \\circ g) \\circ f = h \\circ (g \\circ f)$. Since matrix multiplication represents composition, matrix multiplication is also associative: $(AB)C = A(BC)$. This is not a coincidence â€” it is the algebraic shadow of associativity of function composition.',
      '**Non-commutativity.** Function composition is not commutative in general. $f \\circ g \\neq g \\circ f$ even for linear functions. The classic counterexample: let $A$ rotate $90Â°$ CCW and $B$ reflect across the $x$-axis. Rotating then reflecting lands the point $(1,0)$ at $(0,-1)$. Reflecting then rotating lands it at $(0,1)$. Different results â€” non-commutative.',
      '**When does $AB = BA$?** Scalar multiples of the identity ($cI$) commute with everything. Matrices $A$ and $B$ commute if they share the same eigenvectors (have the same eigenspaces). Powers of the same matrix commute: $A^m A^n = A^{m+n}$. Commutativity is the exception, not the rule.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Composition Law for Linear Maps',
        body: '**Theorem:** If $T_1: U \\to V$ has matrix $B$ and $T_2: V \\to W$ has matrix $A$, then $T_2 \\circ T_1$ has matrix $AB$.\n\n**Proof:** $(T_2 \\circ T_1)(\\mathbf{x}) = A(B\\mathbf{x}) = (AB)\\mathbf{x}$.\n\nThe formula $(AB)_{ij} = \\sum_k A_{ik}B_{kj}$ follows from expanding the linear combination.',
      },
      {
        type: 'theorem',
        title: 'Ring Properties of Matrix Algebra',
        body: 'For matrices of compatible sizes:\n\n- **Associativity:** $(AB)C = A(BC)$ âœ“\n- **Left distributivity:** $A(B+C) = AB + AC$ âœ“\n- **Right distributivity:** $(B+C)A = BA + CA$ âœ“\n- **Scalar:** $(cA)B = c(AB) = A(cB)$ âœ“\n- **Commutativity:** $AB = BA$ âœ— (in general)\n\nThe set of $n \\times n$ matrices forms a **non-commutative ring** under addition and multiplication.',
      },
      {
        type: 'proof',
        title: 'Associativity of Matrix Multiplication',
        body: '$((AB)C)_{ij} = \\sum_l (AB)_{il} C_{lj} = \\sum_l \\left(\\sum_k A_{ik}B_{kl}\\right) C_{lj}$\n\n$= \\sum_k A_{ik} \\sum_l B_{kl} C_{lj} = \\sum_k A_{ik} (BC)_{kj} = (A(BC))_{ij}$\n\nThe interchange of summation order (Fubini for finite sums) is the key step.',
      },
    ],
    visualizations: [
      {
        id: 'LAMatrixAlgebraModule',
        title: 'Matrix Algebra â€” Concept to Graphics Pipeline',
        mathBridge: 'A five-tab module: Concept covers addition, multiplication, identity, inverse, and LU; Canonical walks through a 2Ã—3 Ã— 3Ã—2 product entry by entry, a 2Ã—2 inverse by row reduction, and an LU factorisation; Real World shows the 3D graphics pipeline and FEA usage; Interactive lets you enter any 2Ã—2 matrices A and B and instantly computes AB, BA, det(A), Aâ»Â¹, and Aâ»Â¹b, plus a live graphics canvas with rotation/scale/shear sliders; Practice has five hand-calculation problems.',
        caption: 'The same math that renders every polygon in a 3D game â€” rotation, scale, and shear combined into a single matrix multiply.',
      },
    ],
  },

  examples: [
    {
      id: 'la2-002-ex1',
      title: 'Compute $AB$ â€” Row-Dot-Column Method',
      problem: `Let $A = \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}$ and $B = \\begin{bmatrix} 5 & 6 \\\\ 7 & 8 \\end{bmatrix}$. Compute $AB$ and interpret which transformation acts first.`,
      steps: [
        {
          expression: 'AB = \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix} \\begin{bmatrix} 5 & 6 \\\\ 7 & 8 \\end{bmatrix}',
          annotation: 'Set up $AB$. The product $AB$ means $B$ acts on a vector first, then $A$ acts on the result. Dimension check: $A$ is $2 \\times 2$, $B$ is $2 \\times 2$ â€” inner dimensions match (2 = 2), so the product is defined and $2 \\times 2$.',
          strategyTitle: 'Step 1: Set up and dimension check',
        },
        {
          expression: '(AB)_{11} = \\text{row 1 of }A \\cdot \\text{col 1 of }B = (1)(5) + (2)(7) = 5 + 14 = 19',
          annotation: 'Entry $(1,1)$ = row 1 of $A$ dotted with column 1 of $B$. Row 1 of $A$ = $[1, 2]$, column 1 of $B$ = $[5, 7]^T$. Dot product: sum of element-wise products.',
          strategyTitle: 'Step 2: Compute entry (1,1)',
          hints: ['Checklist: (row 1, col 1) = $A_{1,1}B_{1,1} + A_{1,2}B_{2,1}$ = $1 \\cdot 5 + 2 \\cdot 7 = 19$.'],
        },
        {
          expression: '(AB)_{12} = (1)(6) + (2)(8) = 22, \\quad (AB)_{21} = (3)(5) + (4)(7) = 43, \\quad (AB)_{22} = (3)(6) + (4)(8) = 50',
          annotation: 'Compute the remaining three entries: $(1,2)$, $(2,1)$, $(2,2)$. Each entry $(i,j)$ = row $i$ of $A$ $\\cdot$ column $j$ of $B$.',
          strategyTitle: 'Step 3: Compute remaining entries',
          hints: ['$(1,2)$: row 1 of $A$ dot col 2 of $B$ = $1 \\cdot 6 + 2 \\cdot 8 = 22$. $(2,1)$: row 2 of $A$ dot col 1 of $B$ = $3 \\cdot 5 + 4 \\cdot 7 = 43$.'],
        },
        {
          expression: 'AB = \\begin{bmatrix} 19 & 22 \\\\ 43 & 50 \\end{bmatrix}',
          annotation: 'Assemble. This single matrix is equivalent to first applying transformation $B$, then transformation $A$. One matrix â€” two sequential operations captured in one object.',
          strategyTitle: 'Step 4: Assemble result',
          hints: ['Verify column 1 = $A$ applied to column 1 of $B$: $A \\cdot [5,7]^T = [1 \\cdot 5 + 2 \\cdot 7, \\; 3 \\cdot 5 + 4 \\cdot 7]^T = [19, 43]^T$ âœ“'],
        },
      ],
    },
    {
      id: 'la2-002-ex2',
      title: 'Non-Commutativity â€” Rotation Then Shear vs. Shear Then Rotation',
      problem: `Let $R = \\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}$ (90Â° CCW rotation) and $S = \\begin{bmatrix} 1 & 1 \\\\ 0 & 1 \\end{bmatrix}$ (horizontal shear). Compute $SR$ (shear after rotation) and $RS$ (rotation after shear). Show they are different.`,
      steps: [
        {
          expression: 'SR = \\begin{bmatrix} 1 & 1 \\\\ 0 & 1 \\end{bmatrix}\\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}',
          annotation: '$SR$ means $R$ (rotation) acts first, then $S$ (shear). To apply two transformations: first rotate the plane 90Â° CCW, then shear it horizontally.',
          strategyTitle: 'Step 1: Set up SR â€” rotation first, shear second',
        },
        {
          expression: 'SR = \\begin{bmatrix} (1)(0)+(1)(1) & (1)(-1)+(1)(0) \\\\ (0)(0)+(1)(1) & (0)(-1)+(1)(0) \\end{bmatrix} = \\begin{bmatrix} 1 & -1 \\\\ 1 & 0 \\end{bmatrix}',
          annotation: 'Compute each entry via row-dot-column. Geometric meaning: where does $\\hat{i} = [1,0]^T$ end up? Under $R$: $[0,1]^T$. Under $S$ applied to $[0,1]^T$: $[1,1]^T$. That is column 1 of $SR$ âœ“.',
          strategyTitle: 'Step 2: Compute SR',
          hints: ['Column 1 of $SR$ = $S \\cdot$ (col 1 of $R$) = $S \\cdot [0,1]^T = [0+1, 0+1]^T = [1,1]^T$ âœ“'],
        },
        {
          expression: 'RS = \\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}\\begin{bmatrix} 1 & 1 \\\\ 0 & 1 \\end{bmatrix} = \\begin{bmatrix} 0 & -1 \\\\ 1 & 1 \\end{bmatrix}',
          annotation: '$RS$ means $S$ (shear) acts first, then $R$ (rotation). Entry $(1,1)$: $0 \\cdot 1 + (-1) \\cdot 0 = 0$. Entry $(1,2)$: $0 \\cdot 1 + (-1) \\cdot 1 = -1$. Etc.',
          strategyTitle: 'Step 3: Compute RS â€” shear first, rotation second',
        },
        {
          expression: 'SR = \\begin{bmatrix} 1 & -1 \\\\ 1 & 0 \\end{bmatrix} \\neq \\begin{bmatrix} 0 & -1 \\\\ 1 & 1 \\end{bmatrix} = RS',
          annotation: 'The two products are different matrices â€” different transformations entirely. "Rotate the plane then shear it" leaves a different final configuration than "shear it then rotate." Order is not interchangeable.',
          strategyTitle: 'Step 4: Compare â€” $SR \\neq RS$',
          hints: ['Apply each to $\\hat{i} = [1,0]^T$: $SR \\cdot \\hat{i} = [1,1]^T$ (it moved to (1,1)). $RS \\cdot \\hat{i} = [0,1]^T$ (it moved to (0,1)). Different destinations â€” non-commutative.'],
        },
      ],
    },
    {
      id: 'la2-002-ex3',
      title: 'Dimension Compatibility â€” Multiplying Non-Square Matrices',
      problem: `Can you compute $AB$? Let $A = \\begin{bmatrix} 1 & 0 & -1 \\\\ 2 & 1 & 3 \\end{bmatrix}$ ($2 \\times 3$) and $B = \\begin{bmatrix} 4 & 1 \\\\ -1 & 2 \\\\ 0 & 3 \\end{bmatrix}$ ($3 \\times 2$). If yes, compute it and state the output size.`,
      steps: [
        {
          expression: 'A \\text{ is } 2 \\times 3, \\quad B \\text{ is } 3 \\times 2 \\quad \\Rightarrow \\quad (2 \\times \\underbrace{3)(3}_\\text{match} \\times 2) = 2 \\times 2',
          annotation: 'Dimension check: the inner dimensions are both 3 â€” they match. The product $AB$ is defined and will be $2 \\times 2$. (Rule: $(m \\times k)(k \\times n) = (m \\times n)$. Outer dimensions give the output size.)',
          strategyTitle: 'Step 1: Dimension check â€” inner dimensions must match',
          hints: ['What about $BA$? $B$ is $3 \\times 2$ and $A$ is $2 \\times 3$: inner dimensions are both 2, so $BA$ is also defined and is $3 \\times 3$. $AB \\neq BA$ in size even!'],
        },
        {
          expression: '(AB)_{11} = [1,0,-1] \\cdot [4,-1,0]^T = 4 + 0 + 0 = 4',
          annotation: 'Entry $(1,1)$ = row 1 of $A$ = $[1, 0, -1]$ dotted with column 1 of $B$ = $[4, -1, 0]^T$. Three-element dot product: $1 \\cdot 4 + 0 \\cdot (-1) + (-1) \\cdot 0 = 4$.',
          strategyTitle: 'Step 2: Compute entry (1,1)',
        },
        {
          expression: '(AB)_{12} = [1,0,-1] \\cdot [1,2,3]^T = 1+0-3 = -2',
          annotation: 'Entry $(1,2)$ = row 1 of $A$ dot column 2 of $B$ = $[1,2,3]^T$: $1 \\cdot 1 + 0 \\cdot 2 + (-1) \\cdot 3 = -2$.',
          strategyTitle: 'Step 3: Compute entry (1,2)',
        },
        {
          expression: 'AB = \\begin{bmatrix} 4 & -2 \\\\ 7 & 13 \\end{bmatrix}',
          annotation: 'Complete the bottom row: $(2,1) = 2 \\cdot 4 + 1 \\cdot (-1) + 3 \\cdot 0 = 7$. $(2,2) = 2 \\cdot 1 + 1 \\cdot 2 + 3 \\cdot 3 = 13$. Result: a $2 \\times 2$ matrix. $A$ maps $\\mathbb{R}^3 \\to \\mathbb{R}^2$; $B$ maps $\\mathbb{R}^2 \\to \\mathbb{R}^3$; their composition $AB$ maps $\\mathbb{R}^2 \\to \\mathbb{R}^2$.',
          strategyTitle: 'Step 4: Assemble the $2 \\times 2$ result',
          hints: ['Verify: $(2,1)$ = row 2 of $A = [2,1,3]$ dot col 1 of $B = [4,-1,0]^T$ = $8-1+0=7$ âœ“. $(2,2)$ = $[2,1,3] \\cdot [1,2,3]^T = 2+2+9=13$ âœ“.'],
        },
      ],
    },
  ],

  // â”€â”€ Challenges â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  challenges: [
    {
      id: 'la2-002-ch1',
      difficulty: 'easy',
      problem: "Compute $AB$ where $A = \\begin{bmatrix} 2 & 0 \\\\ 0 & 2 \\end{bmatrix}$ and $B = \\begin{bmatrix} 1 & 4 \\\\ -3 & 5 \\end{bmatrix}$.",
      hint: "Matrix A is just scalar multiplication (it scales the x and y axes by 2). This means you can just double everything in B.",
      walkthrough: [
        {
          expression: "AB = \\begin{bmatrix} (2)(1)+(0)(-3) & (2)(4)+(0)(5) \\\\ (0)(1)+(2)(-3) & (0)(4)+(2)(5) \\end{bmatrix}",
          annotation: "Perform the standard dot products."
        },
        {
          expression: "AB = \\begin{bmatrix} 2 & 8 \\\\ -6 & 10 \\end{bmatrix}",
          annotation: "Notice this is literally just 2 * B."
        }
      ],
      answer: "\\begin{bmatrix} 2 & 8 \\\\ -6 & 10 \\end{bmatrix}"
    },
    {
      id: 'la2-002-ch2',
      difficulty: 'medium',
      problem: "Multiply the Identity matrix $I = \\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}$ by $A = \\begin{bmatrix} 7 & -2 \\\\ 4 & 9 \\end{bmatrix}$. What is $IA$?",
      hint: "What happens when you apply a transformation that 'does nothing', followed by A?",
      walkthrough: [
        {
          expression: "IA = \\begin{bmatrix} (1)(7)+(0)(4) & (1)(-2)+(0)(9) \\\\ (0)(7)+(1)(4) & (0)(-2)+(1)(9) \\end{bmatrix}",
          annotation: "Set up the dot products."
        },
        {
          expression: "IA = \\begin{bmatrix} 7 & -2 \\\\ 4 & 9 \\end{bmatrix}",
          annotation: "The matrix remains completely unchanged."
        }
      ],
      answer: "\\begin{bmatrix} 7 & -2 \\\\ 4 & 9 \\end{bmatrix}"
    },
    {
      id: 'la2-002-ch3',
      difficulty: 'hard',
      problem: 'Let $R = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$ (90Â° CCW) and $S = \\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}$ (shear). (a) Compute $SR$ and $RS$. (b) Show $SR \\neq RS$ by applying each to $[1,0]^T$. (c) Interpret geometrically: which vector does $SR$ map $\\hat{i}$ to, and what does that tell you about the shear being applied to an already-rotated space?',
      hint: 'For (a): compute row-by-column for each product. For (b): substitute $[1,0]^T$ into each. For (c): the first column of $SR$ is where $\\hat{i}$ lands after rotation then shear.',
      walkthrough: [
        { expression: 'SR = \\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}\\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix} = \\begin{bmatrix}0+1&-1+0\\\\0+1&0+0\\end{bmatrix} = \\begin{bmatrix}1&-1\\\\1&0\\end{bmatrix}', annotation: 'Entry (1,1): row 1 of $S$ = $[1,1]$ dot col 1 of $R$ = $[0,1]^T$ = 0+1=1. Entry (1,2): $[1,1]\\cdot[-1,0]^T = -1$. Row 2 similarly.' },
        { expression: 'RS = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix} = \\begin{bmatrix}0&-1\\\\1&1\\end{bmatrix}', annotation: 'Entry (1,1): $[0,-1]\\cdot[1,0]^T = 0$. Entry (1,2): $[0,-1]\\cdot[1,1]^T = -1$. Entry (2,1): $[1,0]\\cdot[1,0]^T = 1$. Entry (2,2): $[1,0]\\cdot[1,1]^T = 1$.' },
        { expression: 'SR\\begin{bmatrix}1\\\\0\\end{bmatrix} = \\begin{bmatrix}1\\\\1\\end{bmatrix}, \\quad RS\\begin{bmatrix}1\\\\0\\end{bmatrix} = \\begin{bmatrix}0\\\\1\\end{bmatrix}', annotation: '$\\hat{i}$ lands at different points under $SR$ vs $RS$. Non-commutativity confirmed: the two products are different transformations.' },
        { expression: '\\text{Geometric: column 1 of } SR = [1,1]^T', annotation: '$\\hat{i}$ under $SR$ goes to $[1,1]^T$: rotation first takes $\\hat{i}$ to $[0,1]^T$ (pointing up), then shear slides it one unit right to $[1,1]^T$. The shear acts on the already-rotated space â€” the same shear gives a different result than if applied first.' },
      ],
      answer: '$SR = \\begin{bmatrix}1&-1\\\\1&0\\end{bmatrix}$, $RS = \\begin{bmatrix}0&-1\\\\1&1\\end{bmatrix}$, $SR \\neq RS$. The geometric difference: $SR$ shears the rotated grid; $RS$ rotates the sheared grid.',
    },
  ],

  // â”€â”€ Semantic Layer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  semantics: {
    core: [
      {
        symbol: "AB",
        meaning: "The composition of two linear transformations. Read right-to-left: evaluate B, then evaluate A on the result."
      },
      {
        symbol: "A^2",
        meaning: "Applying the transformation A twice in a row. A * A."
      }
    ],
    rulesOfThumb: [
      "Matrix multiplication is just chasing where basis vectors land across multiple chronological jumps.",
      "The dot-product method (row by column) is just the algorithmic way to calculate it.",
      "Order always matters. Rotating then moving is not moving then rotating."
    ]
  },

  // â”€â”€ Spiral Learning â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la1-003',
        label: 'Dot Products',
        note: 'The entire hand-computation of matrix multiplication is just performing dozens of dot products. Make sure you are comfortable quickly doing (Row X dot Column Y).'
      }
    ],
    futureLinks: [
      {
        lessonId: 'la2-003',
        label: 'Determinants',
        note: 'When you multiply two matrices, what happens to the area? The determinant (the scaling factor for area) of AB is exactly the determinant of A times the determinant of B!'
      }
    ]
  },

  // â”€â”€ Assessment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  assessment: {
    questions: [
      {
        id: 'q-la2-002-assess-1',
        type: 'input',
        text: 'If you apply transformation A first, B second, and C third to a vector v, how is this written algebraically? (Type the letters without spaces).',
        answer: 'CBAv',
        hint: 'Transformations compose right-to-left: C(B(A(v))). The matrix closest to v acts first.',
      },
    ],
  },

  // â”€â”€ Mental Model â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  mentalModel: [
    "Matrices are verbs. Matrix multiplication is chaining verbs together.",
    "Read right to left.",
    "Non-commutative: Putting on socks then shoes is NOT putting on shoes then socks."
  ],

  // â”€â”€ Checkpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  checkpoints: [
    { id: 'cp-la2-002-1', label: 'Read: Explain why matrix multiplication is read right-to-left', type: 'read' },
    { id: 'cp-la2-002-2', label: 'Read: State the dimension rule â€” when is AB defined and what size is the result?', type: 'read' },
    { id: 'cp-la2-002-3', label: 'Read: Explain why matrix multiplication is non-commutative with a geometric example', type: 'read' },
    { id: 'cp-la2-002-4', label: 'Run: OpenMAT cell 2 â€” verify rotate-then-shear â‰  shear-then-rotate numerically', type: 'lab' },
    { id: 'cp-la2-002-5', label: 'Run: Python cell 1 â€” compute a matrix product and verify the (0,0) entry by hand', type: 'lab' },
    { id: 'cp-la2-002-6', label: 'Complete: Example 1 â€” trace each entry via row-dot-column', type: 'example' },
    { id: 'cp-la2-002-7', label: 'Complete: Example 2 â€” prove non-commutativity by computing both SR and RS', type: 'example' },
    { id: 'cp-la2-002-8', label: 'Attempt: Challenge 3 â€” compute SR and RS, explain the geometric difference', type: 'challenge' },
  ],

  quiz: [
    {
      id: 'la2-002-quiz-1',
      type: 'choice',
      text: 'Geometrically, what does it mean that matrix multiplication is non-commutative ($AB \\neq BA$)?',
      options: [
        'The order matters â€” "rotate then shear" leaves the plane in a different final shape than "shear then rotate"',
        'The area of transformed space scales unpredictably depending on order',
        'It is impossible to multiply rectangular matrices in reverse order',
        'The origin moves to different places depending on order',
      ],
      answer: 'The order matters â€” "rotate then shear" leaves the plane in a different final shape than "shear then rotate"',
      hints: ['Matrices represent transformations. Applying warps in a different order warp an already-warped space. The final configuration depends on which warp went first.'],
      reviewSection: 'Example 2 â€” non-commutativity',
    },
    {
      id: 'la2-002-quiz-2',
      type: 'choice',
      text: 'In the expression $ABC\\mathbf{v}$, which transformation acts on $\\mathbf{v}$ first?',
      options: [
        '$C$ acts first â€” the matrix closest to the vector acts first (right-to-left)',
        '$A$ acts first â€” read left to right like text',
        '$B$ acts first â€” it is in the middle',
        'All three act simultaneously',
      ],
      answer: '$C$ acts first â€” the matrix closest to the vector acts first (right-to-left)',
      hints: ['$ABC\\mathbf{v} = A(B(C(\\mathbf{v})))$: functions evaluate inside-out. $C$ first, then $B$ on the result, then $A$.'],
      reviewSection: 'Intuition tab â€” why right-to-left',
    },
    {
      id: 'la2-002-quiz-3',
      type: 'choice',
      text: 'Can you multiply a $3 \\times 4$ matrix by a $4 \\times 2$ matrix? If yes, what size is the result?',
      options: [
        'Yes â€” the result is $3 \\times 2$',
        'No â€” the matrices must be square to multiply',
        'Yes â€” the result is $4 \\times 4$',
        'No â€” the number of rows must match',
      ],
      answer: 'Yes â€” the result is $3 \\times 2$',
      hints: ['Rule: $(m \\times k)(k \\times n) = (m \\times n)$. Inner dimensions $k=4$ must match; they do. Result has outer dimensions $3 \\times 2$.'],
      reviewSection: 'Example 3 â€” dimension compatibility',
    },
    {
      id: 'la2-002-quiz-4',
      type: 'choice',
      text: 'You want to apply transformation $R$ first, then transformation $S$. Which product do you compute?',
      options: ['$SR$', '$RS$', '$R + S$', '$R^T S$'],
      answer: '$SR$',
      hints: ['$SR\\mathbf{v} = S(R(\\mathbf{v}))$: $R$ acts first (closest to $\\mathbf{v}$), then $S$. Writing $RS$ would apply $S$ first â€” the wrong order.'],
      reviewSection: 'Intuition tab â€” why right-to-left',
    },
    {
      id: 'la2-002-quiz-5',
      type: 'choice',
      text: 'Compute the top-left entry of $\\begin{bmatrix}2&3\\\\1&0\\end{bmatrix}\\begin{bmatrix}1&4\\\\2&-1\\end{bmatrix}$.',
      options: ['$8$', '$5$', '$2$', '$6$'],
      answer: '$8$',
      hints: ['Entry $(1,1)$ = row 1 Â· col 1 = $[2,3] \\cdot [1,2]^T = 2 + 6 = 8$.'],
      reviewSection: 'Example 1 â€” row-dot-column computation',
    },
    {
      id: 'la2-002-quiz-6',
      type: 'choice',
      text: 'What property does matrix multiplication share with function composition that addition does NOT have?',
      options: [
        'Non-commutativity â€” $AB \\neq BA$ just as $f \\circ g \\neq g \\circ f$ in general',
        'Distributivity â€” $A(B+C) = AB + AC$',
        'Associativity â€” $(AB)C = A(BC)$',
        'Closure â€” the product of two $n \\times n$ matrices is always $n \\times n$',
      ],
      answer: 'Non-commutativity â€” $AB \\neq BA$ just as $f \\circ g \\neq g \\circ f$ in general',
      hints: ['Function composition is not commutative (socks then shoes â‰  shoes then socks), and neither is matrix multiplication. Addition IS commutative: $A + B = B + A$.'],
      reviewSection: 'Intuition tab â€” non-commutativity',
    },
    {
      id: 'la2-002-quiz-7',
      type: 'choice',
      text: 'The identity matrix $I$ satisfies $IA = AI = A$ for any compatible $A$. This makes $I$ the matrix equivalent of which number in regular arithmetic?',
      options: ['$1$ (the multiplicative identity)', '$0$ (the additive identity)', '$-1$ (the additive inverse)', '$\\infty$'],
      answer: '$1$ (the multiplicative identity)',
      hints: ['Just as $1 \\times x = x$, $IA = A$. The identity matrix is the transformation that does nothing â€” every vector stays exactly where it is.'],
      reviewSection: 'Challenge 2 â€” the identity matrix',
    },
    {
      id: 'la2-002-quiz-8',
      type: 'choice',
      text: 'You multiply a $4 \\times 3$ matrix $A$ by a $3 \\times 5$ matrix $B$. What are the dimensions of $AB$?',
      options: ['$4 \\times 5$', '$3 \\times 3$', '$4 \\times 3$', '$5 \\times 4$'],
      answer: '$4 \\times 5$',
      hints: ['$(4 \\times 3)(3 \\times 5) = (4 \\times 5)$. Inner dimensions are both 3 (they match). Outer dimensions 4 and 5 give the result size.'],
      reviewSection: 'Example 3 â€” dimension compatibility',
    },
    {
      id: 'la2-002-quiz-9',
      type: 'choice',
      text: 'Is $(AB)C = A(BC)$ always true for matrices?',
      options: [
        'Yes â€” matrix multiplication is associative',
        'No â€” like commutativity, associativity also fails for matrices',
        'Only if all three matrices are square',
        'Only if $AB = BA$',
      ],
      answer: 'Yes â€” matrix multiplication is associative',
      hints: ['Matrix multiplication is NOT commutative but IS associative. $(AB)C = A(BC)$ always holds. You can group matrix products however you like â€” just maintain the left-to-right order.'],
      reviewSection: 'Math tab â€” Associativity vs Commutativity',
    },
    {
      id: 'la2-002-quiz-10',
      type: 'choice',
      text: 'A Pixar animator chains three transformations: shoulder rotation $A$, elbow rotation $B$, wrist rotation $C$. Applied in that order to a vertex $\\mathbf{v}$, the expression is $CBA\\mathbf{v}$. If the animator pre-multiplies to get one matrix $M = CBA$, how many matrix-vector multiplications are needed per vertex?',
      options: [
        '1 â€” one multiplication of $M$ times $\\mathbf{v}$',
        '3 â€” one multiplication per transformation',
        '6 â€” each matrix has 4 entries, divided by 2',
        'It depends on the number of vertices',
      ],
      answer: '1 â€” one multiplication of $M$ times $\\mathbf{v}$',
      hints: ['Pre-computing $M = CBA$ costs one matrix-matrix multiplication (done once). Then each vertex only needs one matrix-vector product $M\\mathbf{v}$. At millions of polygons per frame, this is the key performance optimization.'],
      reviewSection: 'Intuition tab â€” The Pixar connection',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'Matrix multiplication is commutative â€” $AB = BA$ always.',
      whyStudentsThinkIt: 'Number multiplication is commutative ($3 \\times 5 = 5 \\times 3$). Students assume matrices follow the same rule.',
      correctionExample: 'Let $A = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$ (rotate 90Â°) and $B = \\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}$ (shear). Then $AB = \\begin{bmatrix}0&-1\\\\1&1\\end{bmatrix}$ but $BA = \\begin{bmatrix}1&0\\\\1&0\\end{bmatrix}$ â€” different matrices entirely.',
      contrastCase: 'Addition IS commutative: $A + B = B + A$. And multiplication by a scalar is commutative: $2A = A \\cdot 2$. It is specifically matrix-matrix multiplication that breaks commutativity.',
    },
    {
      falseBelief: 'In $AB\\mathbf{v}$, $A$ acts on $\\mathbf{v}$ first because $A$ is written first (left to right).',
      whyStudentsThinkIt: 'English reads left-to-right. Students naturally read $AB\\mathbf{v}$ as "first $A$, then $B$."',
      correctionExample: '$AB\\mathbf{v} = A(B\\mathbf{v})$: first compute $B\\mathbf{v}$, then apply $A$ to the result. The matrix physically closest to $\\mathbf{v}$ (here $B$) acts first. Think of nested function calls: `A(B(v))` â€” the innermost function executes first.',
      contrastCase: 'Code analogy: `result = A.transform(B.transform(v))`. The innermost call `B.transform(v)` runs first. The outer call runs on the result.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A robotics arm has three joints. Each joint applies a rotation matrix $R_1$, $R_2$, $R_3$ to transform from the base frame to the end-effector frame. The controller must compute the end-effector position for 1000 different joint angle configurations per second. How does it minimize computation?',
      competingTechniques: ['Apply three matrix-vector products per configuration', 'Pre-multiply the three matrices into one, then apply once per configuration'],
      whyThisTechniqueWins: 'Pre-compute $M = R_3 R_2 R_1$ once per joint configuration update. Then apply $M \\mathbf{v}$ to each point. Three matrix-vector products per point â†’ one. For complex models with thousands of points, this is a 3Ã— speedup at the cost of one matrix-matrix multiplication.',
    },
    {
      situation: 'A student claims: "To undo a rotation by 90Â° followed by a shear, I just undo the shear and then undo the rotation â€” in any order." Is this correct?',
      competingTechniques: ['Undo in the same order (undo rotation first, then undo shear)', 'Undo in reverse order (undo shear first, then undo rotation)'],
      whyThisTechniqueWins: 'To undo $SR\\mathbf{v}$, you reverse: first undo $S$ (apply $S^{-1}$), then undo $R$ (apply $R^{-1}$). The inverse of $SR$ is $R^{-1} S^{-1}$ â€” reversed order. Undoing in the same order would be $(SR)^{-1} \\neq S^{-1} R^{-1}$.',
    },
  ],

  debugging: [
    {
      commonError: 'Multiplying matrices in the wrong order when composing transformations.',
      symptom: 'Student writes $AB$ when they want to "apply $A$ first, then $B$" â€” getting the transformation backwards.',
      whyItHappened: 'The natural reading order suggests $A$ goes first. But the right-to-left convention means $B$ must be closest to the vector.',
      repairStrategy: 'Draw an arrow: transformation $1 \\to$ transformation $2 \\to$ vector. Write them right-to-left. To apply $A$ first then $B$: write $BA\\mathbf{v}$. Always verify by testing a specific vector: $BA[1,0]^T$ should give the same result as first computing $A[1,0]^T$, then applying $B$ to the result.',
    },
    {
      commonError: 'Forgetting to check dimension compatibility before multiplying.',
      symptom: 'Student writes $AB$ where $A$ is $2 \\times 3$ and $B$ is $2 \\times 2$ â€” inner dimensions mismatch (3 â‰  2), so $AB$ is undefined.',
      whyItHappened: 'Students focus on whether both matrices have numbers and forget the inner-dimension rule.',
      repairStrategy: 'Write the sizes explicitly: $(m \\times k)(k \\times n)$. The middle two numbers must match. Circle them. If $A$ is $2 \\times 3$ and $B$ is $2 \\times 2$: $(2 \\times \\underline{3})(\\underline{2} \\times 2)$ â€” 3 â‰  2, undefined. Try $B^T$ (size $2 \\times 2$) â€” no, still wrong. You need $B$ to have 3 rows.',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Compute the product of any two matrices by the row-dot-column method, check dimension compatibility, and write a composition of transformations in the correct matrix order.',
    explainVerbally: 'Explain why matrix multiplication is read right-to-left, why $AB \\neq BA$ in general, and why pre-multiplying a sequence of transformations saves computation.',
    detectIncorrectApplication: 'Identify when a student has computed $AB$ to mean "A first then B" (should be $BA$), or when they attempt to multiply incompatible dimensions.',
    transferToUnfamiliar: 'Given a chain of 3D rotations described in geometric order, write the matrix product in the correct right-to-left order and compute the composite matrix.',
  },
};
