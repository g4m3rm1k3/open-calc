import matrixCompositionUrl from '../diagrams/la-matrix-composition.svg?url'
import noncommutativeUrl from '../diagrams/la-noncommutative.svg?url'

export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la2-002',
  slug: 'matrix-multiplication',
  chapter: 'la2',
  order: 2,
  title: 'Matrix Multiplication as Composition',
  subtitle: 'Chaining spatial transformations together into a single, perfectly calculated movement.',
  tags: ['matrix multiplication', 'composition', 'non-commutative', 'chaining transformations', 'dot product'],
  aliases: 'multiplying matrices composing functions right-to-left AB BA transformation chain',

  // ── Pedagogical Meta ───────────────────────────────────────────
  timeToComplete: 20,
  coreConcept: 'Multiplying two matrices is mathematically identical to applying one linear transformation, and then applying a second linear transformation immediately after it.',
  prerequisites: ['la2-001'],
  nextLesson: 'inverse-matrices',

  // ── Hook ───────────────────────────────────────────────────────
  hook: {
    question: "If I rotate a photo by 90 degrees, and then shear it horizontally, how do I write that mathematically?",
    realWorldContext: "When an animator at Pixar makes an animated character wave, they aren't just applying one transformation. They rotate the shoulder, then they rotate the elbow relative to the shoulder, then the wrist relative to the elbow. If the computer literally transformed all the millions of polygons in the arm 3 separate times, the movie would take millennia to render. Instead, the computer multiplies the three matrices together *first* to create one single 'master' matrix. It then applies this master matrix to the millions of polygons just once. Matrix multiplication is the ultimate shortcut: squishing a sequence of complex instructions into a single math operation.",
    previewVisualizationId: 'LALesson05_MatrixMult',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    blocks: [
      { type: 'prose', paragraphs: [
      'Apply $R = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$ (90° CCW rotation) to $[3,1]^T$: result is $[-1,3]^T$. Now apply shear $S = \\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}$ to $[-1,3]^T$: result is $[2,3]^T$. Two steps: rotate then shear, and $[3,1]^T$ lands at $[2,3]^T$. The matrix that does BOTH steps at once is the product $SR = \\begin{bmatrix}0&-1\\\\1&1\\end{bmatrix}$ — a single matrix capturing both transformations. **Matrix multiplication IS transformation composition.** This lesson shows you how to compute that product and why the order of multiplication matches the order of applying transformations.',
      ] },
      { type: 'image', src: matrixCompositionUrl,
        alt: 'Vector v shown in gray, then the rotated vector Rv shown in blue with a curved connector labeled step 1 apply R, then the final vector SRv shown in green with a curved connector labeled step 2 apply S',
        caption: 'One matrix SR does both steps at once: SRv lands exactly where S(Rv) does.' },
      { type: 'prose', paragraphs: [
      '**The shortcut insight.** Imagine applying matrix $A$ to every point in the plane. The plane warps into a new shape. Now apply matrix $B$ to the already-warped plane. The plane warps again. You have performed two transformations. But since both warps are linear, the *combined* effect is itself a linear transformation. That means a single matrix could have done both steps at once. That single matrix is the **product** $BA$ (B after A).',
      '**Why right-to-left?** We write $B(A(\\mathbf{x}))$ because functions compose from inside to outside. The matrix closest to the vector $\\mathbf{x}$ acts first, like nested function calls in code: `B(A(x))`. Reading $BA\\mathbf{x}$ correctly means: A acts on $\\mathbf{x}$ first, then B acts on the result.',
      '**The Pixar connection.** When animating a character\'s arm wave, the studio must account for: shoulder rotation, elbow rotation relative to shoulder, wrist rotation relative to elbow. Every frame, every polygon on the arm needs all three transformations applied. If you applied them one at a time to millions of polygons, the movie would take decades to render. Instead: multiply the three matrices together *first* to get one master matrix. Apply that single matrix to every polygon. One matrix product replaces three passes.',
      '**CNC parallel.** A CNC machining center moving a 5-axis part from fixtured position to cutting position does the same thing. The post-processor (the software that converts CAD moves to G-code) computes a chain of transformation matrices: work coordinate offset → coordinate rotation (G68) → tool length compensation → machine kinematics. Each step is a matrix. The post-processor multiplies them together before outputting a single G-code block. The machine\'s controller never sees the individual steps — only the composite result.',
      '**Order is everything.** "First rotate 90°, then shear horizontally" warps space to a completely different shape than "first shear horizontally, then rotate 90°." In matrix language: $BA \\neq AB$ in general. This is called **non-commutativity**, and it is not an accident — it reflects the physical reality that the order of physical operations matters.',
      ] },
      { type: 'image', src: noncommutativeUrl,
        alt: 'Two panels showing the same starting vector [1,0]: left panel applies rotate-then-shear and ends at [1,1], right panel applies shear-then-rotate and ends at [0,1] — different final destinations',
        caption: 'BA ≠ AB: applying the same two matrices in opposite orders sends the same starting vector to different places.' },
      { type: 'prose', paragraphs: [
      '**Predict before reading on.** You want to apply $A = \\begin{bmatrix}2&0\\\\0&3\\end{bmatrix}$ (scale $x$ by 2, $y$ by 3) and then $B = \\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}$ (horizontal shear). What is the product $BA$? Without computing the full matrix, predict: where does $[1,0]^T$ end up after both transformations? Check your answer in Example 1.',
      '**How to compute the product.** The $(i,j)$ entry of $AB$ is the dot product of row $i$ of $A$ with column $j$ of $B$. Geometrically: you are asking where the $j$-th basis vector goes under $B$, and then where *that* resulting vector goes under $A$. That landing coordinate is row $i$ of the result.',
      ] },
      { type: 'viz', id: 'LALesson05_MatrixMult',
        title: 'Composing Two Warps — Interactive',
        mathBridge: 'Two transformation buttons (Shear A, Rotate B) apply in sequence. Use the playback slider to watch the plane undergo shear first, then rotation. Notice that the final positions of $\\hat{i}$ and $\\hat{j}$ match the columns of the algebraically computed product $BA$. Also try applying them in reverse order ($AB$) to see non-commutativity.',
        caption: 'Applying A then B is the same as applying the single matrix BA. The product captures both transformations simultaneously.' },
      { type: 'viz', id: 'LAMatrixAlgebraModule',
        title: 'Matrix Algebra — Concept to Graphics Pipeline',
        mathBridge: 'A five-tab module: Concept covers addition, multiplication, identity, inverse, and LU; Canonical walks through a 2×3 × 3×2 product entry by entry, a 2×2 inverse by row reduction, and an LU factorisation; Real World shows the 3D graphics pipeline and FEA usage; Interactive lets you enter any 2×2 matrices A and B and instantly computes AB, BA, det(A), A⁻¹, and A⁻¹b, plus a live graphics canvas with rotation/scale/shear sliders; Practice has five hand-calculation problems.',
        caption: 'The same math that renders every polygon in a 3D game — rotation, scale, and shear combined into a single matrix multiply.' },
      { type: 'viz', id: 'TransformLab',
        title: 'Transform Lab — Chaining Transforms',
        mathBridge: 'Jump straight to Step 4: Chain Transforms. Enter two matrices $A$ and $B$, apply them separately, then chain them as $BA$ in one step. This is exactly what matrix multiplication means geometrically — applying two linear maps in sequence collapses to a single matrix product.',
        caption: 'Matrix multiplication = geometry composition. The product BA encodes "apply A first, then B."',
        initialProps: { startStep: 3 } },
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Procedure: Multiply Two Matrices by Hand',
        body: 'Step 1. Check dimensions: $A$ is $m \\times k$, $B$ is $k \\times n$. The inner dimensions must match. The product $AB$ will be $m \\times n$.\nStep 2. For each entry $(i, j)$ of $AB$: take row $i$ of $A$ and column $j$ of $B$.\nStep 3. Multiply corresponding elements and sum: $(AB)_{ij} = \\sum_{k} A_{ik} B_{kj}$ (a dot product).\nStep 4. Repeat for all $(i,j)$ combinations — there are $m \\times n$ entries total.\nStep 5. Verify: column $j$ of $AB$ should equal $A$ applied to column $j$ of $B$.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 2 of 12 — Matrices & Transformations',
        body: '**Previous (Lesson 1):** A matrix is a linear transformation — its columns are where $\\hat{i}$ and $\\hat{j}$ land.\n**This lesson:** Multiplying matrices = composing transformations. The product $BA$ applies $A$ first, then $B$.\n**Next (Lesson 3):** Determinants — how much does the transformation scale area?',
      },
      {
        type: 'warning',
        title: 'Read Right-to-Left — Always',
        body: 'The expression $CBA\\mathbf{v}$ applies transformations chronologically as $A$ first, then $B$, then $C$. The matrix physically closest to the vector acts first. This trips up students consistently — write it on a sticky note until it\'s automatic:\n\n$$CBA\\mathbf{v} = C\\bigl(B\\bigl(A(\\mathbf{v})\\bigr)\\bigr)$$',
      },
      {
        type: 'strategy',
        title: 'When to Multiply Matrices',
        body: '**Multiply matrices when** you need one matrix that does what two (or more) matrices would do in sequence — e.g., a CNC post-processor pre-computing a compound transformation, or a graphics pipeline combining rotation + scale + shear into one draw call.\n\n**Do NOT multiply** if you only need to transform a single vector — just apply each matrix in sequence: `B @ (A @ v)` is the same work as `(B @ A) @ v` for one vector, but pre-computing `B @ A` pays off when you need to transform thousands of vectors.\n\n**Dimension check first:** $(m \\times k)(k \\times n) = (m \\times n)$. If inner dimensions do not match, the product is undefined.',
      },
      {
        type: 'insight',
        title: 'The Column-Chasing View of Matrix Multiply',
        body: 'Column $j$ of $AB$ equals $A$ applied to column $j$ of $B$:\n\n$$(AB)_{:,j} = A \\cdot B_{:,j}$$\n\nSo you can compute $AB$ by multiplying $A$ by each column of $B$ separately. This view makes explicit that the columns of $AB$ are the destinations of the basis vectors after first $B$ then $A$.',
      },
      {
        type: 'definition',
        title: 'Dimension Compatibility',
        body: 'You can only multiply $A \\times B$ if the number of **columns** in $A$ equals the number of **rows** in $B$.\n\n$$(m \\times k)(k \\times n) = (m \\times n)$$\n\nThe inner dimension $k$ must match. The result has the outer dimensions. Violating this is one of the most common errors in scientific computing — NumPy will throw a shape mismatch error.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
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
        mathBridge: 'In MATLAB, `A * B` is matrix multiplication (not element-wise — that would be `A .* B`). Composition: apply B first by writing `A * B` (right-to-left). Test commutativity directly.',
        caption: 'Three cells: mechanics, non-commutativity proof, and CNC multi-step transformation chain.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Matrix multiplication mechanics — dot product view',
              prose: [
                '`A * B` in MATLAB is matrix multiplication — `*` triggers the row-dot-column formula. `dot(A(1,:), B(:,1))` computes entry $(1,1)$ explicitly: `A(1,:)` selects row 1 of A as a row vector, `B(:,1)` selects column 1 of B as a column vector, and `dot` sums their element-wise products.',
                '`col1_of_AB = A * B(:,1)` applies A to the first column of B directly — this is the column interpretation of matrix multiplication: column $j$ of AB equals A applied to column $j$ of B. The `isequal` check confirms this matches the corresponding column of the full product `AB`. Note: `A .* B` would compute element-wise products (different operation entirely — never confuse these).',
                '`det(A*B)` equals `det(A)*det(B)` — verify this numerically in the output. For the $2\\times 2$ matrices here, $\\det(A) = 1\\cdot4 - 2\\cdot3 = -2$ and $\\det(B) = 5\\cdot8 - 6\\cdot7 = -2$, so $\\det(AB) = 4$. This multiplicativity of the determinant is the algebraic reason why "composing two volume-preserving transforms produces another volume-preserving transform."',
              ],
              code: `A = [1 2; 3 4];
B = [5 6; 7 8];

AB = A * B;
disp('A * B ='); disp(AB)

% Verify (1,1) entry manually: row 1 of A dot col 1 of B
entry_11 = dot(A(1,:), B(:,1));
fprintf('Entry (1,1) = row1(A) · col1(B) = %g\\n', entry_11)

% Column view: col j of AB = A * col j of B
col1_of_AB = A * B(:,1);
fprintf('Col 1 of AB via column view: [%g; %g]\\n', col1_of_AB(1), col1_of_AB(2))
fprintf('Matches AB(:,1)? %d\\n', isequal(col1_of_AB, AB(:,1)))

% Determinant multiplicativity: det(AB) = det(A)*det(B)
fprintf('det(A)=%g, det(B)=%g, det(A)*det(B)=%g = det(AB)=%g\\n', ...
    det(A), det(B), det(A)*det(B), det(AB))`,
            },
            {
              id: 2,
              cellTitle: 'Non-commutativity — order changes the result',
              prose: [
                '`S * R` computes the composition with R acting first (rotation), then S (shear) — R is right of S, so R acts on v first. `R * S` reverses the order: shear first, then rotation. The variable names (`rotate_then_shear = S * R`) can feel backwards at first; remember that in $BA\\mathbf{v}$, matrix A (right side) acts on v first.',
                '`isequal(rotate_then_shear, shear_then_rotate)` returns 0 (false) — the two matrices are genuinely different objects. `fprintf` with format `%d` prints the integer 0 directly. This is the non-commutativity proof: not just different outputs for one specific vector, but different transformation matrices with different columns.',
                'To build geometric intuition: shear-then-rotate takes the shear\'s parallelogram and rotates it 90° — the result is tilted. Rotate-then-shear first rotates the square to a square (still a square after 90°), then shears it — the result tilts a different way. Both processes transform the same square, but via different paths to different final positions. Non-commutativity in matrix multiplication reflects this order-dependence of geometric operations.',
              ],
              code: `% Rotation 90° CCW
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
              cellTitle: 'Application: CNC post-processor — chaining transformation matrices',
              prose: [
                '`composite = M_mirror * R_G68` pre-multiplies right-to-left: `R_G68` (7° rotation) acts first on any tool position, then `M_mirror` (x-axis flip) acts on the result. `composite * path_in` applies this combined transformation to all three path points simultaneously — `path_in` is $2 \\times 3$, so MATLAB applies the $2 \\times 2$ composite to each column independently.',
                '`norm(step2 - path_out) < 1e-10` verifies that applying the transformations sequentially (step 1: rotate, step 2: mirror) gives the same result as the single composite matrix. The `1e-10` threshold handles floating-point rounding errors. This is the fundamental property: one matrix product replaces an arbitrary chain of sequential transformations.',
                'Read the **columns** of `composite` to understand the transformation geometrically: column 1 is where $\\hat{i} = [1,0]^T$ lands after G68 then mirror, and column 2 is where $\\hat{j} = [0,1]^T$ lands. For the CNC programmer, these columns answer a critical question: if I program a move in the +X direction, which direction does the machine actually travel after applying the work rotation and mirror? The composite matrix\'s columns answer this directly — no need to mentally simulate two steps.',
              ],
              code: `% Simulate CNC post-processor matrix chain
% Each step: a 2×2 matrix acting on [X; Y] tool positions

% Step 1: G54 work coordinate system is offset by [100; 50] mm
% But offsets are NOT linear maps (they translate the origin).
% We handle them separately — here we focus on the rotation chain.

% Step 2: G68 coordinate rotation — part clamped 7° off-axis
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
path_in = [20 20 0; 0 10 0];  % 2x3: each column = [x; y] for one tool point
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
            {
              id: 4,
              cellTitle: 'Challenge: verify associativity and a 3-matrix chain',
              prose: [
                '`(A*B)*C` and `A*(B*C)` produce the same composite matrix — associativity holds. Each grouping is two matrix-matrix products (order of grouping does not change the left-to-right sequence of the three transforms). The `norm((A*B)*C - A*(B*C)) < 1e-12` check confirms this numerically.',
                'Applying three matrices to a vector $\\mathbf{v}$ costs 3 matrix-vector multiplications if done one at a time: $A(B(C\\mathbf{v}))$. Pre-computing $M = ABC$ costs one matrix-matrix product (done once), then every vector only needs $M\\mathbf{v}$ — one multiplication instead of three. `M * v` vs `A * (B * (C * v))` proves this gives the same result for any $\\mathbf{v}$.',
                '`norm(left_assoc - right_assoc) < 1e-12` checks associativity numerically — the residual is near machine epsilon ($\\sim 10^{-16}$), confirming that grouping doesn\'t change the result even in floating point. The practical upshot: MATLAB evaluates `A*B*C` left-to-right as `(A*B)*C` automatically. For $n \\times n$ matrices, each matrix-matrix product costs $O(n^3)$ operations. The grouping can matter for non-square chains — the **matrix chain multiplication** problem finds the optimal grouping to minimize total operations, a classic dynamic programming application.',
              ],
              code: `% Verify associativity: (A*B)*C = A*(B*C)
A = [2 1; 0 3];
B = [1 2; 3 1];
C = [0 1; 1 0];

v = [4; 2];

% Two groupings — should give identical composite matrices
left_assoc  = (A*B)*C;
right_assoc = A*(B*C);
fprintf('Associativity: norm diff = %.2e  (should be ~0)\\n', ...
    norm(left_assoc - right_assoc))

% Pre-compute the chain, then apply once vs three sequential steps
M = A * B * C;
result_pre  = M * v;
result_seq  = A * (B * (C * v));
fprintf('Pre-composed: [%.4g; %.4g]\\n', result_pre(1), result_pre(2))
fprintf('Sequential:   [%.4g; %.4g]\\n', result_seq(1), result_seq(2))
fprintf('Equal: %d\\n', norm(result_pre - result_seq) < 1e-12)`,
            },
          ]
        }
      },
      {
        id: 'PythonNotebook',
        title: 'Code: Matrix Multiplication as Composition',
        mathBridge: 'A @ B computes the product. (A @ B) @ v = A @ (B @ v): apply B first, then A. Matrix multiplication is NOT commutative: A @ B ≠ B @ A in general.',
        caption: 'Verify the composition property: chaining two transformations equals multiplying their matrices.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Matrix multiplication — the mechanics',
              prose: [
                '`A @ B` is NumPy matrix multiplication. `r0 = A[0]` extracts row 0 of A as a 1D array; `B[:, 0]` extracts column 0 of B as a 1D array. `np.dot(r0, c0)` computes their dot product $\\sum_k r0_k \\cdot c0_k$ — this is the formula for entry $(0,0)$ of the product.',
                'The heatmap shows A, B, and AB as color grids. Notice that AB entries (≈19–50) are much larger than A or B entries (1–8) — each entry accumulates products of multiple elements. `vmin=-60, vmax=60` normalizes all three plots to the same color scale so the magnitudes are visually comparable.',
                '`np.linalg.det(AB)` equals `np.linalg.det(A) * np.linalg.det(B)` — **determinant multiplicativity**: composing two transformations multiplies their area-scaling factors. For these matrices, $\\det(A) = 1\\cdot4 - 2\\cdot3 = -2$ (A flips orientation and scales area by 2) and $\\det(B) = 5\\cdot8 - 6\\cdot7 = -2$, so $\\det(AB) = 4$. This is why composing two rotation matrices (each with det = 1) always gives another rotation — the product of two 1s is still 1.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

A = np.array([[1., 2.],
              [3., 4.]])
B = np.array([[5., 6.],
              [7., 8.]])

AB = A @ B
print("A @ B =")
print(AB)

r0 = A[0]; c0 = B[:, 0]
print(f"Entry (0,0) = dot({r0}, {c0}) = {np.dot(r0, c0)}")

fig, axes = plt.subplots(1, 3, figsize=(11, 3))
for ax, M, title in zip(axes, [A, B, AB], ['A', 'B', 'A @ B']):
    im = ax.imshow(M, cmap='RdBu_r', aspect='equal', vmin=-60, vmax=60)
    ax.set_title(title, fontsize=13, fontweight='bold')
    for i in range(M.shape[0]):
        for j in range(M.shape[1]):
            ax.text(j, i, f'{M[i,j]:.0f}', ha='center', va='center', fontsize=14,
                    color='white' if abs(M[i,j]) > 30 else 'black')
    ax.set_xticks([]); ax.set_yticks([])

plt.suptitle("Matrix Multiplication: A @ B", fontsize=12)
plt.tight_layout()
plt.show()

# Determinant multiplicativity: det(A @ B) = det(A) * det(B)
dA, dB = np.linalg.det(A), np.linalg.det(B)
print(f"det(A)={dA:.1f}, det(B)={dB:.1f}, det(A)*det(B)={dA*dB:.1f}, det(A@B)={np.linalg.det(AB):.1f}")`,
            },
            {
              id: 2,
              cellTitle: 'Not commutative — order matters geometrically',
              prose: [
                '`shear @ rotate` computes S after R (shear second, rotate first) — R is on the right so it acts first. `rotate @ shear` reverses the order. `np.allclose(rotate_then_shear, shear_then_rotate)` returns `False` — the matrices are genuinely different.',
                '`transform_square(T)` builds a $2 \\times 5$ array of the unit square corners and applies `T @ pts` — multiplying the $2 \\times 2$ transform by the $2 \\times 5$ corner matrix, transforming all five points simultaneously. The filled polygon plot shows the unit square (blue) warped into different parallelograms (red) for each composition order — the same square ends up in visibly different positions, making non-commutativity geometric.',
                'Read the **columns** of each product matrix to trace where $\\hat{i}$ and $\\hat{j}$ land. Column 0 of `rotate_then_shear` is `rotate_then_shear @ [1,0]` = $[1, 1]^T$, meaning $\\hat{i}$ ends up at $(1,1)$ after rotate-then-shear. Column 0 of `shear_then_rotate` is $[0, 1]^T$, meaning $\\hat{i}$ ends up at $(0,1)$. These are exactly the rightmost corners of the two red polygons in the plot — the matrix columns ARE the transformed basis vectors, visible in the picture.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

rotate = np.array([[0., -1.], [1., 0.]])   # 90 deg CCW
shear  = np.array([[1.,  1.], [0., 1.]])   # horizontal shear

rotate_then_shear = shear @ rotate
shear_then_rotate = rotate @ shear

print("Rotate then shear:"); print(rotate_then_shear)
print("Shear then rotate:"); print(shear_then_rotate)
print("Equal?", np.allclose(rotate_then_shear, shear_then_rotate))

# Draw a unit square transformed by each composition
def transform_square(T):
    pts = np.array([[0,0],[1,0],[1,1],[0,1],[0,0]], dtype=float).T
    return T @ pts

fig, axes = plt.subplots(1, 2, figsize=(9, 4))
for ax, M, title in [(axes[0], rotate_then_shear, "Rotate THEN Shear"),
                     (axes[1], shear_then_rotate, "Shear THEN Rotate")]:
    orig = transform_square(np.eye(2))
    trans = transform_square(M)
    ax.fill(orig[0], orig[1], alpha=0.2, color='steelblue', label='original')
    ax.plot(orig[0], orig[1], 'steelblue', lw=1.5, linestyle='--')
    ax.fill(trans[0], trans[1], alpha=0.35, color='crimson', label='transformed')
    ax.plot(trans[0], trans[1], 'crimson', lw=2)
    ax.set_title(title, fontsize=12)
    ax.set_xlim(-2, 3); ax.set_ylim(-2, 3)
    ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
    ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
    ax.legend(fontsize=9)

plt.suptitle("AB != BA: Order changes the shape", fontsize=12)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 3,
              cellTitle: 'Composition: applying B then A',
              prose: [
                '`step1 = B @ v` applies B (rotation) to v first. `step2 = A @ step1` applies A (scale) to the rotated vector — two sequential matrix-vector products. `result = AB @ v` applies the pre-composed product in one step. `np.allclose(step2, result)` confirms both paths agree to floating-point precision: $(AB)\\mathbf{v} = A(B\\mathbf{v})$ is the associativity property.',
                'The efficiency argument: `AB = A @ B` is computed once (a matrix-matrix product). Then each vertex only needs `AB @ v` — one product instead of two. For a scene with millions of vertices rendered at 60 fps, pre-multiplying the transformation chain is what makes real-time rendering computationally feasible.',
                '`np.linalg.det(AB)` tells you how the composition scales area: $\\det(A) = 2 \\cdot 0.5 - 0 = 1$ (scale $x2$ then shrink $y \\times 0.5$ preserves area) and $\\det(B) = \\cos^2(90°) + \\sin^2(90°) = 1$ (all rotations preserve area), so $\\det(AB) = 1$. The arrow plot confirms: the three vectors change direction and length, but the signed area of any parallelogram they span is unchanged by $AB$. Composing two area-preserving transforms always gives another area-preserving transform — the determinant law guarantees this algebraically.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

A = np.array([[2., 0.], [0., 0.5]])  # scale x2, shrink y
B = np.array([[0., -1.], [1., 0.]])  # 90 deg rotation
v = np.array([3.0, 1.0])

step1 = B @ v          # apply B first
step2 = A @ step1      # then apply A
AB = A @ B
result = AB @ v        # apply composed matrix

print(f"B @ v = {step1}")
print(f"A @ (B @ v) = {step2}")
print(f"(A @ B) @ v = {result}")
print(f"Same result: {np.allclose(step2, result)}")

fig, ax = plt.subplots(figsize=(6, 5))
ax.set_title("Composition: B first, then A", fontsize=12)
origin = np.zeros(2)
for vec, color, lbl in [(v,'steelblue','v (original)'), (step1,'darkorange','B*v (after rotation)'),
                        (step2,'crimson','A*(B*v) (final)')]:
    ax.annotate('', xy=vec, xytext=origin, arrowprops=dict(arrowstyle='->', color=color, lw=2.5))
    ax.text(vec[0]+0.1, vec[1]+0.1, lbl, color=color, fontsize=9, fontweight='bold')
ax.set_xlim(-2, 4); ax.set_ylim(-2, 4)
ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 4,
              cellTitle: 'Application: 2D robot arm — composing joint rotations',
              prose: [
                '`rot2d(deg)` constructs the $2\\times2$ rotation matrix $R(\\theta)=\\begin{bmatrix}\\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta\\end{bmatrix}$ by substituting `np.radians(deg)` — NumPy trig functions expect radians. This is the same rotation matrix from la2-001; here we build two of them, one per joint, and multiply them together.',
                '`R_combined = R_shoulder @ R_elbow` is the forward kinematics composition: `R_elbow` acts first (rotates the forearm relative to the upper arm), then `R_shoulder` acts second (rotates everything into world coordinates). Reading right-to-left: $R_{\\text{shoulder}} R_{\\text{elbow}} \\mathbf{v}$ = "apply elbow rotation first, then shoulder rotation." `forearm_vec = R_combined @ np.array([L2, 0])` places the forearm endpoint by applying this composed rotation to a vector of length L2 pointing along the x-axis.',
                '`np.linalg.det(R_combined)` prints `1.0` — the composition of two rotations is still a rotation (det = 1 means area-preserving and orientation-preserving). This confirms det(AB) = det(A)·det(B): $1 \\times 1 = 1$. No matter how many pure rotations you chain, the result is always a pure rotation. The plot shows this: the arm bends, but no part of it is scaled or reflected.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

def rot2d(deg):
    rad = np.radians(deg)
    return np.array([[np.cos(rad), -np.sin(rad)],
                     [np.sin(rad),  np.cos(rad)]])

shoulder_angle = 30   # degrees from world x-axis
elbow_angle    = 45   # degrees relative to upper arm

L1 = 2.0  # upper arm length
L2 = 1.5  # forearm length

R_shoulder = rot2d(shoulder_angle)
R_elbow    = rot2d(elbow_angle)

# Forearm orientation = R_shoulder @ R_elbow: elbow acts first, shoulder second
R_combined = R_shoulder @ R_elbow

upper_arm_vec = R_shoulder @ np.array([L1, 0.0])
elbow_pos     = upper_arm_vec
forearm_vec   = R_combined @ np.array([L2, 0.0])
wrist_pos     = elbow_pos + forearm_vec

print(f"Elbow position: ({elbow_pos[0]:.3f}, {elbow_pos[1]:.3f})")
print(f"Wrist position: ({wrist_pos[0]:.3f}, {wrist_pos[1]:.3f})")
print(f"det(R_shoulder)={np.linalg.det(R_shoulder):.4f}, det(R_elbow)={np.linalg.det(R_elbow):.4f}")
print(f"det(R_combined)={np.linalg.det(R_combined):.4f}  (should be 1.0)")

fig, ax = plt.subplots(figsize=(6, 6))
origin = np.array([0.0, 0.0])
pts = np.array([origin, elbow_pos, wrist_pos])
ax.plot(pts[:, 0], pts[:, 1], 'o-', color='steelblue', lw=3, markersize=10)
for pos, label in [(origin, 'Shoulder'), (elbow_pos, 'Elbow'), (wrist_pos, 'Wrist')]:
    ax.annotate(label, pos, textcoords='offset points', xytext=(8, 5), fontsize=10)
ax.set_xlim(-1, 5); ax.set_ylim(-1, 5)
ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
ax.set_title(f'Robot Arm: shoulder={shoulder_angle}°, elbow={elbow_angle}°', fontsize=12)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Verify non-commutativity',
              difficulty: 'easy',
              prompt: 'Let A be a 45° rotation matrix [[cos45, -sin45],[sin45, cos45]] and B be a reflection across the x-axis [[1,0],[0,-1]]. Compute AB and BA. Show they are different and describe geometrically what each composition does to the vector [1, 0].',
              code: `import numpy as np

angle = np.radians(45)
A = np.array([[np.cos(angle), -np.sin(angle)],
              [np.sin(angle),  np.cos(angle)]])  # 45° rotation
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

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      '**Composition of linear maps.** Let $T_1: U \\to V$ and $T_2: V \\to W$ be linear maps with matrix representations $B$ and $A$ respectively (so $T_1(\\mathbf{x}) = B\\mathbf{x}$, $T_2(\\mathbf{y}) = A\\mathbf{y}$). The composition $T_2 \\circ T_1: U \\to W$ defined by $(T_2 \\circ T_1)(\\mathbf{x}) = T_2(T_1(\\mathbf{x})) = A(B\\mathbf{x})$ is itself a linear map. Its matrix is $AB$.',
      '**Why the formula is row-dot-column.** For any input $\\mathbf{x}$, $(AB)\\mathbf{x} = A(B\\mathbf{x})$. Writing out $B\\mathbf{x} = \\sum_k x_k \\mathbf{b}_k$ where $\\mathbf{b}_k$ are columns of $B$, then $A(B\\mathbf{x}) = \\sum_k x_k A\\mathbf{b}_k$. The $(i,j)$ entry of $AB$ is $(AB)_{ij} = (A(B\\mathbf{e}_j))_i = (A \\mathbf{b}_j)_i = \\sum_k A_{ik} B_{kj}$. This is the dot product of row $i$ of $A$ with column $j$ of $B$. The formula is derived, not defined.',
      '**Associativity from function composition.** Function composition is always associative: $(h \\circ g) \\circ f = h \\circ (g \\circ f)$. Since matrix multiplication represents composition, matrix multiplication is also associative: $(AB)C = A(BC)$. This is not a coincidence — it is the algebraic shadow of associativity of function composition.',
      '**Non-commutativity.** Function composition is not commutative in general. $f \\circ g \\neq g \\circ f$ even for linear functions. The classic counterexample: let $A$ rotate $90°$ CCW and $B$ reflect across the $x$-axis. Rotating then reflecting lands the point $(1,0)$ at $(0,-1)$. Reflecting then rotating lands it at $(0,1)$. Different results — non-commutative.',
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
        body: 'For matrices of compatible sizes:\n\n- **Associativity:** $(AB)C = A(BC)$ ✓\n- **Left distributivity:** $A(B+C) = AB + AC$ ✓\n- **Right distributivity:** $(B+C)A = BA + CA$ ✓\n- **Scalar:** $(cA)B = c(AB) = A(cB)$ ✓\n- **Commutativity:** $AB = BA$ ✗ (in general)\n\nThe set of $n \\times n$ matrices forms a **non-commutative ring** under addition and multiplication.',
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
        title: 'Matrix Algebra — Concept to Graphics Pipeline',
        mathBridge: 'A five-tab module: Concept covers addition, multiplication, identity, inverse, and LU; Canonical walks through a 2×3 × 3×2 product entry by entry, a 2×2 inverse by row reduction, and an LU factorisation; Real World shows the 3D graphics pipeline and FEA usage; Interactive lets you enter any 2×2 matrices A and B and instantly computes AB, BA, det(A), A⁻¹, and A⁻¹b, plus a live graphics canvas with rotation/scale/shear sliders; Practice has five hand-calculation problems.',
        caption: 'The same math that renders every polygon in a 3D game — rotation, scale, and shear combined into a single matrix multiply.',
      },
      {
        id: 'MatrixAlgebraViz',
        title: 'Matrix Algebra — Interactive Calculator & Stepper',
        mathBridge: 'A five-tab module: Concept covers addition, scalar multiplication, transpose, and the distributive/associative laws; Canonical steps through a 2×3 × 3×2 multiplication entry-by-entry showing the row-dot-column pattern; Real World applies matrix products to a CNC rotation-then-translation pipeline; Interactive lets you input any 2×2 matrices A and B and instantly shows AB, BA, det, inverse, and a live 2D transformation canvas; Practice has four hand-calculation problems.',
        caption: 'Matrix multiplication entry by entry — see why order matters and what each product encodes geometrically.',
      }
    ],
  },

  examples: [
    {
      id: 'la2-002-ex1',
      title: 'Compute $AB$ — Row-Dot-Column Method',
      problem: `Let $A = \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}$ and $B = \\begin{bmatrix} 5 & 6 \\\\ 7 & 8 \\end{bmatrix}$. Compute $AB$ and interpret which transformation acts first.`,
      steps: [
        {
          expression: 'AB = \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix} \\begin{bmatrix} 5 & 6 \\\\ 7 & 8 \\end{bmatrix}',
          annotation: 'Set up $AB$. The product $AB$ means $B$ acts on a vector first, then $A$ acts on the result. Dimension check: $A$ is $2 \\times 2$, $B$ is $2 \\times 2$ — inner dimensions match (2 = 2), so the product is defined and $2 \\times 2$.',
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
          annotation: 'Assemble. This single matrix is equivalent to first applying transformation $B$, then transformation $A$. One matrix — two sequential operations captured in one object.',
          strategyTitle: 'Step 4: Assemble result',
          hints: ['Verify column 1 = $A$ applied to column 1 of $B$: $A \\cdot [5,7]^T = [1 \\cdot 5 + 2 \\cdot 7, \\; 3 \\cdot 5 + 4 \\cdot 7]^T = [19, 43]^T$ ✓'],
        },
      ],
    },
    {
      id: 'la2-002-ex2',
      title: 'Non-Commutativity — Rotation Then Shear vs. Shear Then Rotation',
      problem: `Let $R = \\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}$ (90° CCW rotation) and $S = \\begin{bmatrix} 1 & 1 \\\\ 0 & 1 \\end{bmatrix}$ (horizontal shear). Compute $SR$ (shear after rotation) and $RS$ (rotation after shear). Show they are different.`,
      steps: [
        {
          expression: 'SR = \\begin{bmatrix} 1 & 1 \\\\ 0 & 1 \\end{bmatrix}\\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}',
          annotation: '$SR$ means $R$ (rotation) acts first, then $S$ (shear). To apply two transformations: first rotate the plane 90° CCW, then shear it horizontally.',
          strategyTitle: 'Step 1: Set up SR — rotation first, shear second',
        },
        {
          expression: 'SR = \\begin{bmatrix} (1)(0)+(1)(1) & (1)(-1)+(1)(0) \\\\ (0)(0)+(1)(1) & (0)(-1)+(1)(0) \\end{bmatrix} = \\begin{bmatrix} 1 & -1 \\\\ 1 & 0 \\end{bmatrix}',
          annotation: 'Compute each entry via row-dot-column. Geometric meaning: where does $\\hat{i} = [1,0]^T$ end up? Under $R$: $[0,1]^T$. Under $S$ applied to $[0,1]^T$: $[1,1]^T$. That is column 1 of $SR$ ✓.',
          strategyTitle: 'Step 2: Compute SR',
          hints: ['Column 1 of $SR$ = $S \\cdot$ (col 1 of $R$) = $S \\cdot [0,1]^T = [0+1, 0+1]^T = [1,1]^T$ ✓'],
        },
        {
          expression: 'RS = \\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}\\begin{bmatrix} 1 & 1 \\\\ 0 & 1 \\end{bmatrix} = \\begin{bmatrix} 0 & -1 \\\\ 1 & 1 \\end{bmatrix}',
          annotation: '$RS$ means $S$ (shear) acts first, then $R$ (rotation). Entry $(1,1)$: $0 \\cdot 1 + (-1) \\cdot 0 = 0$. Entry $(1,2)$: $0 \\cdot 1 + (-1) \\cdot 1 = -1$. Etc.',
          strategyTitle: 'Step 3: Compute RS — shear first, rotation second',
        },
        {
          expression: 'SR = \\begin{bmatrix} 1 & -1 \\\\ 1 & 0 \\end{bmatrix} \\neq \\begin{bmatrix} 0 & -1 \\\\ 1 & 1 \\end{bmatrix} = RS',
          annotation: 'The two products are different matrices — different transformations entirely. "Rotate the plane then shear it" leaves a different final configuration than "shear it then rotate." Order is not interchangeable.',
          strategyTitle: 'Step 4: Compare — $SR \\neq RS$',
          hints: ['Apply each to $\\hat{i} = [1,0]^T$: $SR \\cdot \\hat{i} = [1,1]^T$ (it moved to (1,1)). $RS \\cdot \\hat{i} = [0,1]^T$ (it moved to (0,1)). Different destinations — non-commutative.'],
        },
      ],
    },
    {
      id: 'la2-002-ex3',
      title: 'Dimension Compatibility — Multiplying Non-Square Matrices',
      problem: `Can you compute $AB$? Let $A = \\begin{bmatrix} 1 & 0 & -1 \\\\ 2 & 1 & 3 \\end{bmatrix}$ ($2 \\times 3$) and $B = \\begin{bmatrix} 4 & 1 \\\\ -1 & 2 \\\\ 0 & 3 \\end{bmatrix}$ ($3 \\times 2$). If yes, compute it and state the output size.`,
      steps: [
        {
          expression: 'A \\text{ is } 2 \\times 3, \\quad B \\text{ is } 3 \\times 2 \\quad \\Rightarrow \\quad (2 \\times \\underbrace{3)(3}_\\text{match} \\times 2) = 2 \\times 2',
          annotation: 'Dimension check: the inner dimensions are both 3 — they match. The product $AB$ is defined and will be $2 \\times 2$. (Rule: $(m \\times k)(k \\times n) = (m \\times n)$. Outer dimensions give the output size.)',
          strategyTitle: 'Step 1: Dimension check — inner dimensions must match',
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
          hints: ['Verify: $(2,1)$ = row 2 of $A = [2,1,3]$ dot col 1 of $B = [4,-1,0]^T$ = $8-1+0=7$ ✓. $(2,2)$ = $[2,1,3] \\cdot [1,2,3]^T = 2+2+9=13$ ✓.'],
        },
      ],
    },
  ],

  // ── Walkthroughs ───────────────────────────────────────────────────────────
  walkthroughs: [
    {
      id: 'wt-la2-002-row-dot-column',
      title: 'Matrix Multiplication — One Entry at a Time',
      prereqs: ['Dot product', 'Matrix dimensions'],
      problem: 'Compute $AB$ where $A = \\begin{bmatrix}1 & 2\\\\3 & 4\\end{bmatrix}$ and $B = \\begin{bmatrix}5 & 0\\\\1 & 3\\end{bmatrix}$.',
      steps: [
        {
          label: 'Check dimensions first',
          strategy: 'The product $AB$ requires that the number of columns of $A$ equals the number of rows of $B$.',
          explanation: 'Both are $2\\times 2$, so $AB$ is defined and the result is $2\\times 2$. For non-square matrices: $(m\\times k)(k\\times n) \\to m\\times n$. The inner dimensions ($k$) must match.',
          math: '(2\\times 2)(2\\times 2) \\to 2\\times 2',
        },
        {
          label: 'Entry $(AB)_{11}$: row 1 of $A$ $\\cdot$ column 1 of $B$',
          strategy: 'Each entry of $AB$ is a single dot product.',
          explanation: 'Row 1 of $A$: $[1,2]$. Column 1 of $B$: $[5,1]^\\top$. Dot: $1\\cdot5+2\\cdot1=7$.',
          math: '(AB)_{11} = 1\\cdot5+2\\cdot1 = 7',
        },
        {
          label: 'Entry $(AB)_{12}$: row 1 of $A$ $\\cdot$ column 2 of $B$',
          strategy: 'Keep row 1, advance to the next column.',
          explanation: 'Column 2 of $B$: $[0,3]^\\top$. Dot: $1\\cdot0+2\\cdot3=6$.',
          math: '(AB)_{12} = 1\\cdot0+2\\cdot3 = 6',
        },
        {
          label: 'Second row: move to row 2 of $A$, repeat for both columns of $B$',
          strategy: 'Systematic march: for each row of $A$, dot with every column of $B$.',
          explanation: 'Row 2 of $A$: $[3,4]$. Column 1: $3\\cdot5+4\\cdot1=19$. Column 2: $3\\cdot0+4\\cdot3=12$.',
          math: '(AB)_{21}=19 \\qquad (AB)_{22}=12',
        },
        {
          label: 'Assemble and sanity check',
          strategy: 'Fill entries in row-by-row order; verify that no entry was skipped.',
          explanation: 'The result is $\\begin{bmatrix}7&6\\\\19&12\\end{bmatrix}$. Quick sense-check: the top-left entry 7 is roughly "row 1 of $A$ scaled by column 1 of $B$" — both rows/columns have moderate magnitude, so 7 is plausible.',
          math: 'AB = \\begin{bmatrix}7&6\\\\19&12\\end{bmatrix}',
          gotcha: 'Matrix multiplication is NOT entry-by-entry. $AB \\neq \\begin{bmatrix}1\\cdot5&2\\cdot0\\\\3\\cdot1&4\\cdot3\\end{bmatrix}$. That operation (Hadamard product) exists but is rarely used.',
        },
      ],
    },
    {
      id: 'wt-la2-002-non-commutative',
      title: 'Why AB ≠ BA — Composition Order Changes Everything',
      prereqs: ['Matrix multiplication', 'Linear transformations'],
      problem: 'Let $A = \\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}$ (horizontal shear) and $B = \\begin{bmatrix}2&0\\\\0&1\\end{bmatrix}$ (horizontal stretch). Compute $AB$ and $BA$. Are they equal?',
      steps: [
        {
          label: 'Understand what each matrix does before multiplying',
          strategy: 'Identifying the geometry first helps you predict whether the order should matter.',
          explanation: '$B$ stretches: $x \\mapsto 2x$, $y \\mapsto y$. $A$ shears: $x \\mapsto x+y$, $y \\mapsto y$. Intuitively: stretching then shearing operates on already-stretched coordinates; shearing then stretching doubles the sheared $x$ directly.',
          math: 'B: x\\mapsto 2x \\qquad A: x\\mapsto x+y',
        },
        {
          label: 'Compute $AB$ — $B$ acts first, $A$ acts second (read right-to-left)',
          strategy: 'In the product $AB$, the right matrix is applied to the input first.',
          explanation: '$(AB)_{11}=1\\cdot2+1\\cdot0=2$, $(AB)_{12}=1\\cdot0+1\\cdot1=1$, $(AB)_{21}=0$, $(AB)_{22}=1$.',
          math: 'AB = \\begin{bmatrix}2&1\\\\0&1\\end{bmatrix}',
        },
        {
          label: 'Compute $BA$ — $A$ acts first, $B$ acts second',
          strategy: 'Swap the order and recompute.',
          explanation: '$(BA)_{11}=2\\cdot1+0\\cdot0=2$, $(BA)_{12}=2\\cdot1+0\\cdot1=2$, $(BA)_{21}=0$, $(BA)_{22}=1$.',
          math: 'BA = \\begin{bmatrix}2&2\\\\0&1\\end{bmatrix}',
        },
        {
          label: 'Compare: the $(1,2)$ entry differs — $1$ vs $2$',
          strategy: '$AB \\neq BA$ in general; matrices almost never commute.',
          explanation: 'The top-right entry differs: $AB$ has 1, $BA$ has 2. Geometrically: in $AB$, the shear factor is 1 (acting in unstretched space). In $BA$, the stretch doubles whatever shear offset was created first. The two pipelines produce different final states.',
          math: 'AB \\neq BA \\quad (\\text{shear factor } 1 \\neq 2)',
          gotcha: 'The order of operations reads right-to-left: $ABC$ means $C$ first, then $B$, then $A$. This matches function composition $f(g(h(x)))$.',
        },
      ],
    },
  ],

  // ── Challenges ─────────────────────────────────────────────────
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
      problem: 'Let $R = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$ (90° CCW) and $S = \\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}$ (shear). (a) Compute $SR$ and $RS$. (b) Show $SR \\neq RS$ by applying each to $[1,0]^T$. (c) Interpret geometrically: which vector does $SR$ map $\\hat{i}$ to, and what does that tell you about the shear being applied to an already-rotated space?',
      hint: 'For (a): compute row-by-column for each product. For (b): substitute $[1,0]^T$ into each. For (c): the first column of $SR$ is where $\\hat{i}$ lands after rotation then shear.',
      walkthrough: [
        { expression: 'SR = \\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}\\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix} = \\begin{bmatrix}0+1&-1+0\\\\0+1&0+0\\end{bmatrix} = \\begin{bmatrix}1&-1\\\\1&0\\end{bmatrix}', annotation: 'Entry (1,1): row 1 of $S$ = $[1,1]$ dot col 1 of $R$ = $[0,1]^T$ = 0+1=1. Entry (1,2): $[1,1]\\cdot[-1,0]^T = -1$. Row 2 similarly.' },
        { expression: 'RS = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix} = \\begin{bmatrix}0&-1\\\\1&1\\end{bmatrix}', annotation: 'Entry (1,1): $[0,-1]\\cdot[1,0]^T = 0$. Entry (1,2): $[0,-1]\\cdot[1,1]^T = -1$. Entry (2,1): $[1,0]\\cdot[1,0]^T = 1$. Entry (2,2): $[1,0]\\cdot[1,1]^T = 1$.' },
        { expression: 'SR\\begin{bmatrix}1\\\\0\\end{bmatrix} = \\begin{bmatrix}1\\\\1\\end{bmatrix}, \\quad RS\\begin{bmatrix}1\\\\0\\end{bmatrix} = \\begin{bmatrix}0\\\\1\\end{bmatrix}', annotation: '$\\hat{i}$ lands at different points under $SR$ vs $RS$. Non-commutativity confirmed: the two products are different transformations.' },
        { expression: '\\text{Geometric: column 1 of } SR = [1,1]^T', annotation: '$\\hat{i}$ under $SR$ goes to $[1,1]^T$: rotation first takes $\\hat{i}$ to $[0,1]^T$ (pointing up), then shear slides it one unit right to $[1,1]^T$. The shear acts on the already-rotated space — the same shear gives a different result than if applied first.' },
      ],
      answer: '$SR = \\begin{bmatrix}1&-1\\\\1&0\\end{bmatrix}$, $RS = \\begin{bmatrix}0&-1\\\\1&1\\end{bmatrix}$, $SR \\neq RS$. The geometric difference: $SR$ shears the rotated grid; $RS$ rotates the sheared grid.',
    },
  ],

  // ── Semantic Layer ───────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: 'AB', meaning: 'Composition of linear maps — apply B first, then A. Read right-to-left: B acts on the input, A acts on the result' },
      { symbol: 'A^2', meaning: 'Apply transformation A twice in a row — A composed with itself: A(A(v))' },
      { symbol: '(AB)_{ij} = \\sum_k A_{ik}B_{kj}', meaning: 'Row-dot-column formula — entry (i,j) of the product is row i of A dotted with column j of B' },
      { symbol: '(m\\times k)(k\\times n)=(m\\times n)', meaning: 'Dimension rule — inner dimensions must match; outer dimensions give the result size' },
      { symbol: 'AB \\neq BA', meaning: 'Non-commutativity — matrix multiplication order matters; swapping the order changes the result' },
      { symbol: '(AB)C = A(BC)', meaning: 'Associativity — matrix products can be grouped in any order as long as the left-to-right sequence is maintained' },
    ],
    rulesOfThumb: [
      'Read matrix products right-to-left: the matrix closest to the vector acts first.',
      'Check dimensions before multiplying: write sizes side by side — the inner pair must match.',
      'Pre-multiply a chain of matrices into one master matrix to save computation when transforming many vectors.',
      'Order always matters: "rotate then shear" warps space differently than "shear then rotate."',
      'Column j of AB is A applied to column j of B — use this to build geometric intuition for the product.',
    ],
  },

  // ── Spiral Learning ──────────────────────────────────────────────
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

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'la2-002-assess-1',
        type: 'choice',
        text: 'You apply transformation $A$ first, then $B$, then $C$ to a vector $\\mathbf{v}$. Which expression is correct?',
        options: ['$CBA\\mathbf{v}$', '$ABC\\mathbf{v}$', '$BAC\\mathbf{v}$', '$ACB\\mathbf{v}$'],
        answer: '$CBA\\mathbf{v}$',
        hints: ['The matrix closest to $\\mathbf{v}$ acts first. $A$ acts first → $A$ is rightmost: $\\ldots A\\mathbf{v}$. Then $B$: $\\ldots BA\\mathbf{v}$. Then $C$: $CBA\\mathbf{v}$. Read right-to-left, just like nested function calls $C(B(A(\\mathbf{v})))$.'],
      },
      {
        id: 'la2-002-assess-2',
        type: 'choice',
        text: 'Compute the $(1,1)$ entry (top-left) of $\\begin{bmatrix}2&3\\\\1&4\\end{bmatrix}\\begin{bmatrix}1&0\\\\2&1\\end{bmatrix}$.',
        options: ['$8$', '$5$', '$2$', '$4$'],
        answer: '$8$',
        hints: ['Entry $(1,1)$ = row 1 of the left matrix dotted with column 1 of the right matrix: $[2,3] \\cdot [1,2]^T = 2 \\cdot 1 + 3 \\cdot 2 = 2 + 6 = 8$.'],
      },
      {
        id: 'la2-002-assess-3',
        type: 'choice',
        text: 'Let $A = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$ (90° CCW rotation) and $B = \\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}$ (shear). Is $AB = BA$?',
        options: [
          'No — matrix multiplication is generally non-commutative; these produce different transformations',
          'Yes — rotation and shear always commute',
          'Yes — for 2×2 matrices, $AB$ always equals $BA$',
          'Only if $\\det(A) = \\det(B)$',
        ],
        answer: 'No — matrix multiplication is generally non-commutative; these produce different transformations',
        hints: ['Compute $AB$: apply B first (shear), then A (rotation). Compute $BA$: apply A first (rotation), then B (shear). Try applying each to $[1,0]^T$ — the results are different vectors, proving $AB \\neq BA$.'],
      },
      {
        id: 'la2-002-assess-4',
        type: 'choice',
        text: 'Can you multiply a $2 \\times 3$ matrix by a $3 \\times 4$ matrix? If yes, what are the dimensions of the result?',
        options: [
          'Yes — the result is $2 \\times 4$',
          'No — the matrices must be square to multiply',
          'Yes — the result is $3 \\times 3$',
          'No — the first matrix has more columns than rows',
        ],
        answer: 'Yes — the result is $2 \\times 4$',
        hints: ['Dimension rule: $(m \\times k)(k \\times n) = (m \\times n)$. Here $(2 \\times 3)(3 \\times 4)$: inner dimensions are both 3 (they match), outer dimensions are 2 and 4, giving a $2 \\times 4$ result.'],
      },
    ],
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    "Matrices are verbs. Matrix multiplication is chaining verbs together.",
    "Read right to left.",
    "Non-commutative: Putting on socks then shoes is NOT putting on shoes then socks."
  ],

  // ── Checkpoints ──────────────────────────────────────────────────
  checkpoints: [
    { id: 'cp-la2-002-1', label: 'Read: Explain why matrix multiplication is read right-to-left', type: 'read' },
    { id: 'cp-la2-002-2', label: 'Read: State the dimension rule — when is AB defined and what size is the result?', type: 'read' },
    { id: 'cp-la2-002-3', label: 'Read: Explain why matrix multiplication is non-commutative with a geometric example', type: 'read' },
    { id: 'cp-la2-002-4', label: 'Run: OpenMAT cell 2 — verify rotate-then-shear ≠ shear-then-rotate numerically', type: 'lab' },
    { id: 'cp-la2-002-5', label: 'Run: Python cell 1 — compute a matrix product and verify the (0,0) entry by hand', type: 'lab' },
    { id: 'cp-la2-002-6', label: 'Complete: Example 1 — trace each entry via row-dot-column', type: 'example' },
    { id: 'cp-la2-002-7', label: 'Complete: Example 2 — prove non-commutativity by computing both SR and RS', type: 'example' },
    { id: 'cp-la2-002-8', label: 'Attempt: Challenge 3 — compute SR and RS, explain the geometric difference', type: 'challenge' },
  ],

  quiz: [
    {
      id: 'la2-002-quiz-1',
      type: 'choice',
      text: 'Geometrically, what does it mean that matrix multiplication is non-commutative ($AB \\neq BA$)?',
      options: [
        'The order matters — "rotate then shear" leaves the plane in a different final shape than "shear then rotate"',
        'The area of transformed space scales unpredictably depending on order',
        'It is impossible to multiply rectangular matrices in reverse order',
        'The origin moves to different places depending on order',
      ],
      answer: 'The order matters — "rotate then shear" leaves the plane in a different final shape than "shear then rotate"',
      hints: ['Matrices represent transformations. Applying warps in a different order warp an already-warped space. The final configuration depends on which warp went first.'],
      reviewSection: 'Example 2 — non-commutativity',
    },
    {
      id: 'la2-002-quiz-2',
      type: 'choice',
      text: 'In the expression $ABC\\mathbf{v}$, which transformation acts on $\\mathbf{v}$ first?',
      options: [
        '$C$ acts first — the matrix closest to the vector acts first (right-to-left)',
        '$A$ acts first — read left to right like text',
        '$B$ acts first — it is in the middle',
        'All three act simultaneously',
      ],
      answer: '$C$ acts first — the matrix closest to the vector acts first (right-to-left)',
      hints: ['$ABC\\mathbf{v} = A(B(C(\\mathbf{v})))$: functions evaluate inside-out. $C$ first, then $B$ on the result, then $A$.'],
      reviewSection: 'Intuition tab — why right-to-left',
    },
    {
      id: 'la2-002-quiz-3',
      type: 'choice',
      text: 'Can you multiply a $3 \\times 4$ matrix by a $4 \\times 2$ matrix? If yes, what size is the result?',
      options: [
        'Yes — the result is $3 \\times 2$',
        'No — the matrices must be square to multiply',
        'Yes — the result is $4 \\times 4$',
        'No — the number of rows must match',
      ],
      answer: 'Yes — the result is $3 \\times 2$',
      hints: ['Rule: $(m \\times k)(k \\times n) = (m \\times n)$. Inner dimensions $k=4$ must match; they do. Result has outer dimensions $3 \\times 2$.'],
      reviewSection: 'Example 3 — dimension compatibility',
    },
    {
      id: 'la2-002-quiz-4',
      type: 'choice',
      text: 'You want to apply transformation $R$ first, then transformation $S$. Which product do you compute?',
      options: ['$SR$', '$RS$', '$R + S$', '$R^T S$'],
      answer: '$SR$',
      hints: ['$SR\\mathbf{v} = S(R(\\mathbf{v}))$: $R$ acts first (closest to $\\mathbf{v}$), then $S$. Writing $RS$ would apply $S$ first — the wrong order.'],
      reviewSection: 'Intuition tab — why right-to-left',
    },
    {
      id: 'la2-002-quiz-5',
      type: 'choice',
      text: 'Compute the top-left entry of $\\begin{bmatrix}2&3\\\\1&0\\end{bmatrix}\\begin{bmatrix}1&4\\\\2&-1\\end{bmatrix}$.',
      options: ['$8$', '$5$', '$2$', '$6$'],
      answer: '$8$',
      hints: ['Entry $(1,1)$ = row 1 · col 1 = $[2,3] \\cdot [1,2]^T = 2 + 6 = 8$.'],
      reviewSection: 'Example 1 — row-dot-column computation',
    },
    {
      id: 'la2-002-quiz-6',
      type: 'choice',
      text: 'What property does matrix multiplication share with function composition that addition does NOT have?',
      options: [
        'Non-commutativity — $AB \\neq BA$ just as $f \\circ g \\neq g \\circ f$ in general',
        'Distributivity — $A(B+C) = AB + AC$',
        'Associativity — $(AB)C = A(BC)$',
        'Closure — the product of two $n \\times n$ matrices is always $n \\times n$',
      ],
      answer: 'Non-commutativity — $AB \\neq BA$ just as $f \\circ g \\neq g \\circ f$ in general',
      hints: ['Function composition is not commutative (socks then shoes ≠ shoes then socks), and neither is matrix multiplication. Addition IS commutative: $A + B = B + A$.'],
      reviewSection: 'Intuition tab — non-commutativity',
    },
    {
      id: 'la2-002-quiz-7',
      type: 'choice',
      text: 'The identity matrix $I$ satisfies $IA = AI = A$ for any compatible $A$. This makes $I$ the matrix equivalent of which number in regular arithmetic?',
      options: ['$1$ (the multiplicative identity)', '$0$ (the additive identity)', '$-1$ (the additive inverse)', '$\\infty$'],
      answer: '$1$ (the multiplicative identity)',
      hints: ['Just as $1 \\times x = x$, $IA = A$. The identity matrix is the transformation that does nothing — every vector stays exactly where it is.'],
      reviewSection: 'Challenge 2 — the identity matrix',
    },
    {
      id: 'la2-002-quiz-8',
      type: 'choice',
      text: 'You multiply a $4 \\times 3$ matrix $A$ by a $3 \\times 5$ matrix $B$. What are the dimensions of $AB$?',
      options: ['$4 \\times 5$', '$3 \\times 3$', '$4 \\times 3$', '$5 \\times 4$'],
      answer: '$4 \\times 5$',
      hints: ['$(4 \\times 3)(3 \\times 5) = (4 \\times 5)$. Inner dimensions are both 3 (they match). Outer dimensions 4 and 5 give the result size.'],
      reviewSection: 'Example 3 — dimension compatibility',
    },
    {
      id: 'la2-002-quiz-9',
      type: 'choice',
      text: 'Is $(AB)C = A(BC)$ always true for matrices?',
      options: [
        'Yes — matrix multiplication is associative',
        'No — like commutativity, associativity also fails for matrices',
        'Only if all three matrices are square',
        'Only if $AB = BA$',
      ],
      answer: 'Yes — matrix multiplication is associative',
      hints: ['Matrix multiplication is NOT commutative but IS associative. $(AB)C = A(BC)$ always holds. You can group matrix products however you like — just maintain the left-to-right order.'],
      reviewSection: 'Math tab — Associativity vs Commutativity',
    },
    {
      id: 'la2-002-quiz-10',
      type: 'choice',
      text: 'A Pixar animator chains three transformations: shoulder rotation $A$, elbow rotation $B$, wrist rotation $C$. Applied in that order to a vertex $\\mathbf{v}$, the expression is $CBA\\mathbf{v}$. If the animator pre-multiplies to get one matrix $M = CBA$, how many matrix-vector multiplications are needed per vertex?',
      options: [
        '1 — one multiplication of $M$ times $\\mathbf{v}$',
        '3 — one multiplication per transformation',
        '6 — each matrix has 4 entries, divided by 2',
        'It depends on the number of vertices',
      ],
      answer: '1 — one multiplication of $M$ times $\\mathbf{v}$',
      hints: ['Pre-computing $M = CBA$ costs one matrix-matrix multiplication (done once). Then each vertex only needs one matrix-vector product $M\\mathbf{v}$. At millions of polygons per frame, this is the key performance optimization.'],
      reviewSection: 'Intuition tab — The Pixar connection',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'Matrix multiplication is commutative — $AB = BA$ always.',
      whyStudentsThinkIt: 'Number multiplication is commutative ($3 \\times 5 = 5 \\times 3$). Students assume matrices follow the same rule.',
      correctionExample: 'Let $A = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$ (rotate 90°) and $B = \\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}$ (shear). Then $AB = \\begin{bmatrix}0&-1\\\\1&1\\end{bmatrix}$ but $BA = \\begin{bmatrix}1&0\\\\1&0\\end{bmatrix}$ — different matrices entirely.',
      contrastCase: 'Addition IS commutative: $A + B = B + A$. And multiplication by a scalar is commutative: $2A = A \\cdot 2$. It is specifically matrix-matrix multiplication that breaks commutativity.',
    },
    {
      falseBelief: 'In $AB\\mathbf{v}$, $A$ acts on $\\mathbf{v}$ first because $A$ is written first (left to right).',
      whyStudentsThinkIt: 'English reads left-to-right. Students naturally read $AB\\mathbf{v}$ as "first $A$, then $B$."',
      correctionExample: '$AB\\mathbf{v} = A(B\\mathbf{v})$: first compute $B\\mathbf{v}$, then apply $A$ to the result. The matrix physically closest to $\\mathbf{v}$ (here $B$) acts first. Think of nested function calls: `A(B(v))` — the innermost function executes first.',
      contrastCase: 'Code analogy: `result = A.transform(B.transform(v))`. The innermost call `B.transform(v)` runs first. The outer call runs on the result.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A robotics arm has three joints. Each joint applies a rotation matrix $R_1$, $R_2$, $R_3$ to transform from the base frame to the end-effector frame. The controller must compute the end-effector position for 1000 different joint angle configurations per second. How does it minimize computation?',
      competingTechniques: 'Apply three matrix-vector products per configuration vs. pre-multiply the three matrices into one, then apply once per configuration',
      whyThisTechniqueWins: 'Pre-compute $M = R_3 R_2 R_1$ once per joint configuration update. Then apply $M \\mathbf{v}$ to each point. Three matrix-vector products per point → one. For complex models with thousands of points, this is a 3× speedup at the cost of one matrix-matrix multiplication.',
    },
    {
      situation: 'A student claims: "To undo a rotation by 90° followed by a shear, I just undo the shear and then undo the rotation — in any order." Is this correct?',
      competingTechniques: 'Undo in the same order (undo rotation first, then undo shear) vs. undo in reverse order (undo shear first, then undo rotation)',
      whyThisTechniqueWins: 'To undo $SR\\mathbf{v}$, you reverse: first undo $S$ (apply $S^{-1}$), then undo $R$ (apply $R^{-1}$). The inverse of $SR$ is $R^{-1} S^{-1}$ — reversed order. Undoing in the same order would be $(SR)^{-1} \\neq S^{-1} R^{-1}$.',
    },
  ],

  debugging: [
    {
      commonError: 'Multiplying matrices in the wrong order when composing transformations.',
      symptom: 'Student writes $AB$ when they want to "apply $A$ first, then $B$" — getting the transformation backwards.',
      whyItHappened: 'The natural reading order suggests $A$ goes first. But the right-to-left convention means $B$ must be closest to the vector.',
      repairStrategy: 'Draw an arrow: transformation $1 \\to$ transformation $2 \\to$ vector. Write them right-to-left. To apply $A$ first then $B$: write $BA\\mathbf{v}$. Always verify by testing a specific vector: $BA[1,0]^T$ should give the same result as first computing $A[1,0]^T$, then applying $B$ to the result.',
    },
    {
      commonError: 'Forgetting to check dimension compatibility before multiplying.',
      symptom: 'Student writes $AB$ where $A$ is $2 \\times 3$ and $B$ is $2 \\times 2$ — inner dimensions mismatch (3 ≠ 2), so $AB$ is undefined.',
      whyItHappened: 'Students focus on whether both matrices have numbers and forget the inner-dimension rule.',
      repairStrategy: 'Write the sizes explicitly: $(m \\times k)(k \\times n)$. The middle two numbers must match. Circle them. If $A$ is $2 \\times 3$ and $B$ is $2 \\times 2$: $(2 \\times \\underline{3})(\\underline{2} \\times 2)$ — 3 ≠ 2, undefined. Try $B^T$ (size $2 \\times 2$) — no, still wrong. You need $B$ to have 3 rows.',
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
