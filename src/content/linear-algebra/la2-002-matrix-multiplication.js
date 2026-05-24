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
    prose: [
      '**Where you are in the story:** You know that one matrix warps space. Now: what happens if you warp it, then warp it *again*? This lesson builds the algebra of chained transformations — the idea that unlocks 3D graphics, robotics, and every physics simulation running today.',
      '**The shortcut insight.** Imagine applying matrix $A$ to every point in the plane. The plane warps into a new shape. Now apply matrix $B$ to the already-warped plane. The plane warps again. You have performed two transformations. But since both warps are linear, the *combined* effect is itself a linear transformation. That means a single matrix could have done both steps at once. That single matrix is the **product** $BA$ (B after A).',
      '**Why right-to-left?** We write $B(A(\\mathbf{x}))$ because functions compose from inside to outside. The matrix closest to the vector $\\mathbf{x}$ acts first, like nested function calls in code: `B(A(x))`. Reading $BA\\mathbf{x}$ correctly means: A acts on $\\mathbf{x}$ first, then B acts on the result.',
      '**The Pixar connection.** When animating a character\'s arm wave, the studio must account for: shoulder rotation, elbow rotation relative to shoulder, wrist rotation relative to elbow. Every frame, every polygon on the arm needs all three transformations applied. If you applied them one at a time to millions of polygons, the movie would take decades to render. Instead: multiply the three matrices together *first* to get one master matrix. Apply that single matrix to every polygon. One matrix product replaces three passes.',
      '**CNC parallel.** A CNC machining center moving a 5-axis part from fixtured position to cutting position does the same thing. The post-processor (the software that converts CAD moves to G-code) computes a chain of transformation matrices: work coordinate offset → coordinate rotation (G68) → tool length compensation → machine kinematics. Each step is a matrix. The post-processor multiplies them together before outputting a single G-code block. The machine\'s controller never sees the individual steps — only the composite result.',
      '**Order is everything.** "First rotate 90°, then shear horizontally" warps space to a completely different shape than "first shear horizontally, then rotate 90°." In matrix language: $BA \\neq AB$ in general. This is called **non-commutativity**, and it is not an accident — it reflects the physical reality that the order of physical operations matters.',
      '**How to compute the product.** The $(i,j)$ entry of $AB$ is the dot product of row $i$ of $A$ with column $j$ of $B$. Geometrically: you are asking where the $j$-th basis vector goes under $B$, and then where *that* resulting vector goes under $A$. That landing coordinate is row $i$ of the result.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of LA2 — Matrices & Transformations',
        body: '**Previous:** A matrix is a linear transformation — its columns are where $\\hat{i}$ and $\\hat{j}$ land.\n**This lesson:** Multiplying matrices = composing transformations. The product $BA$ applies $A$ first, then $B$.\n**Next:** Determinants — how much does the transformation scale area?',
      },
      {
        type: 'warning',
        title: 'Read Right-to-Left — Always',
        body: 'The expression $CBA\\mathbf{v}$ applies transformations chronologically as $A$ first, then $B$, then $C$. The matrix physically closest to the vector acts first. This trips up students consistently — write it on a sticky note until it\'s automatic:\n\n$$CBA\\mathbf{v} = C\\bigl(B\\bigl(A(\\mathbf{v})\\bigr)\\bigr)$$',
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
    visualizations: [
      {
        id: 'LALesson05_MatrixMult',
        title: 'Composing Two Warps — Interactive',
        mathBridge: 'Two transformation buttons (Shear A, Rotate B) apply in sequence. Use the playback slider to watch the plane undergo shear first, then rotation. Notice that the final positions of $\\hat{i}$ and $\\hat{j}$ match the columns of the algebraically computed product $BA$. Also try applying them in reverse order ($AB$) to see non-commutativity.',
        caption: 'Applying A then B is the same as applying the single matrix BA. The product captures both transformations simultaneously.',
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
                'In MATLAB, `A * B` is matrix multiplication. Each entry (i,j) of the result is the dot product of row i of A with column j of B.',
                'CRITICAL: `A .* B` is element-wise multiplication — completely different! Always use `*` for matrix products.',
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
fprintf('Col 1 of AB via column view: [%g; %g]\\n', col1_of_AB(1), col1_of_AB(2))`,
            },
            {
              id: 2,
              cellTitle: 'Non-commutativity — order changes the result',
              prose: [
                '"Rotate then shear" is a physically different transformation than "shear then rotate." Verify this: compute both products and apply to the same vector.',
                'The two results will differ — different final positions for the same starting point.',
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
                'A 3-axis CNC program applies several coordinate transformations in sequence: work coordinate offset (G54), then coordinate rotation (G68), then cutting. The post-processor multiplies these matrices before outputting G-code — one product replaces three sequential operations.',
                'This is exactly why machining companies invest in expensive post-processor software. Getting the matrix multiplication wrong produces crashes and scrapped parts.',
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
        mathBridge: 'A @ B computes the product. (A @ B) @ v = A @ (B @ v): apply B first, then A. Matrix multiplication is NOT commutative: A @ B ≠ B @ A in general.',
        caption: 'Verify the composition property: chaining two transformations equals multiplying their matrices.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cellTitle: 'Matrix multiplication — the mechanics',
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

# Verify entry (0,0): row 0 of A · col 0 of B
r0 = A[0]      # [1, 2]
c0 = B[:, 0]   # [5, 7]
print(f"Entry (0,0) = {r0} · {c0} = {np.dot(r0, c0)}")`,
            },
            {
              id: 2,
              cellTitle: 'Not commutative — order matters geometrically',
              prose: [
                'AB ≠ BA in general. "Rotate then shear" is a different transformation than "shear then rotate".',
                'The order in which you compose transformations changes the final result.',
              ],
              code: `import numpy as np
from opencalc import quick_transform

rotate = np.array([[0., -1.], [1., 0.]])   # 90° CCW
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
                'This is the associativity property — you can group however you like, but you cannot change the order.',
              ],
              code: `import numpy as np

A = np.array([[2., 0.], [0., 0.5]])  # scale x2, shrink y
B = np.array([[0., -1.], [1., 0.]])  # 90° rotation
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
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: "ex-1",
      title: "Multiplying Two 2x2 Matrices",
      problem: "Let $A = \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}$ and $B = \\begin{bmatrix} 5 & 6 \\\\ 7 & 8 \\end{bmatrix}$. Find $AB$.",
      steps: [
        {
          expression: "AB = \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix} \\begin{bmatrix} 5 & 6 \\\\ 7 & 8 \\end{bmatrix}",
          annotation: "Set up the multiplication.",
          strategyTitle: "Setup",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "\\text{Top-Left} = (1)(5) + (2)(7) = 5 + 14 = 19",
          annotation: "Dot product of Row 1 of A and Column 1 of B.",
          strategyTitle: "Row 1 * Col 1",
          checkpoint: "What is the dot product of Row 1 of A and Col 2 of B?",
          hints: ["(1)(6) + (2)(8) = 6 + 16 = 22"],
        },
        {
          expression: "\\text{Top-Right} = 22",
          annotation: "Result of Row 1 dot Col 2.",
          strategyTitle: "Row 1 * Col 2",
          checkpoint: "Now do the bottom row. Row 2 * Col 1?",
          hints: ["(3)(5) + (4)(7) = 15 + 28 = 43"],
        },
        {
          expression: "\\text{Bottom-Left} = 43, \\quad \\text{Bottom-Right} = (3)(6) + (4)(8) = 18 + 32 = 50",
          annotation: "Complete the remaining two dot products.",
          strategyTitle: "Row 2 computations",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "AB = \\begin{bmatrix} 19 & 22 \\\\ 43 & 50 \\end{bmatrix}",
          annotation: "Assemble the final matrix.",
          strategyTitle: "Final Assembly",
          checkpoint: "",
          hints: [],
        }
      ],
      conclusion: "The final matrix [19, 22; 43, 50] represents a single transformation equivalent to applying B, and then A."
    },
    {
      id: "ex-2",
      title: "Proving Non-Commutativity",
      problem: "Using the same matrices from Example 1, calculate $BA$ and see if it equals $AB$.",
      steps: [
        {
          expression: "BA = \\begin{bmatrix} 5 & 6 \\\\ 7 & 8 \\end{bmatrix} \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}",
          annotation: "Set up the matrices in reverse order.",
          strategyTitle: "Reverse setup",
          checkpoint: "What is the new top-left element? (Row 1 of B dot Col 1 of A)",
          hints: ["(5)(1) + (6)(3) = 5 + 18 = 23"],
        },
        {
          expression: "\\text{Top-Left} = 23, \\quad \\text{Top-Right} = (5)(2) + (6)(4) = 10 + 24 = 34",
          annotation: "Calculate the top row of the new matrix.",
          strategyTitle: "Top Row",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "\\text{Bottom-Left} = (7)(1) + (8)(3) = 7 + 24 = 31, \\quad \\text{Bottom-Right} = (7)(2) + (8)(4) = 14 + 32 = 46",
          annotation: "Calculate the bottom row.",
          strategyTitle: "Bottom Row",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "BA = \\begin{bmatrix} 23 & 34 \\\\ 31 & 46 \\end{bmatrix}",
          annotation: "Assemble the new final matrix.",
          strategyTitle: "Final Assembly",
          checkpoint: "",
          hints: [],
        }
      ],
      conclusion: "BA = [23, 34; 31, 46]. As expected, $BA \\neq AB$ ([19, 22; 43, 50]). The order in which you apply transformations fundamentally alters where space ends up."
    }
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: "ch-1",
      difficulty: "easy",
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
      id: "ch-2",
      difficulty: "medium",
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
    }
  ],

  // ── Semantic Layer ───────────────────────────────────────────────
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
        id: "assess-1",
        type: "input",
        text: "If you have transformations A, B, and C, and you apply A first, B second, and C third to a vector v, how is this written algebraically? (Type the letters without spaces).",
        answer: "CBAv",
        hint: "Transformations are written as nested functions: C(B(A(v))). Right to left."
      }
    ]
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    "Matrices are verbs. Matrix multiplication is chaining verbs together.",
    "Read right to left.",
    "Non-commutative: Putting on socks then shoes is NOT putting on shoes then socks."
  ],

  // ── Checkpoints ──────────────────────────────────────────────────
  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
  ],

  // ── Final Quiz ─────────────────────────────────────────────────
  quiz: [
    {
      id: 'quiz-1',
      type: 'choice',
      text: "Geometrically, what does it mean that matrix multiplication is non-commutative (AB ≠ BA)?",
      options: [
        "The area of transformed space scales unpredictably depending on order.",
        "A spatial transformation followed by another (like rotate then shear) yields a different physical shape than if you reversed the order (shear then rotate).",
        "It is impossible to multiply rectangular matrices backwards.",
        "The origin (0,0) moves to different places."
      ],
      answer: "A spatial transformation followed by another (like rotate then shear) yields a different physical shape than if you reversed the order (shear then rotate).",
      hints: ["Think of putting on socks and shoes. The chronological order physically changes the outcome."],
      reviewSection: 'Intuition tab — Non-Commutativity'
    },
    {
      id: 'quiz-2',
      type: 'choice',
      text: "When you see the mathematical expression ABCv, in what chronological order do the transformations physically happen to the vector v?",
      options: [
        "A happens first, then B, then C.",
        "C happens first, then B, then A.",
        "They all happen simultaneously, blending into one average transformation.",
        "A and B happen first, C is ignored."
      ],
      answer: "A happens first, then B, then C.",
      hints: ["Transformations are applying functions. C(B(A(v))). The matrix closest to the vector hits it first."],
      reviewSection: 'Intuition tab — Right-to-Left'
    }
  ]
};
