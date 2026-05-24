export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la2-001',
  slug: 'matrices-as-transformations',
  chapter: 'la2',
  order: 1,
  title: 'Matrices as Linear Transformations',
  subtitle: 'A matrix is not just a block of numbers—it is a machine that stretches, squishes, and rotates space.',
  tags: ['matrices', 'linear transformation', 'basis vectors', 'mapping', 'function'],
  aliases: 'matrix transformation linear mapping linear function warping space grid transformation',

  // ── Pedagogical Meta ───────────────────────────────────────────
  timeToComplete: 25,
  coreConcept: 'A matrix is a function that maps an input vector to an output vector. Geometrically, it transforms the entire coordinate space while keeping grid lines parallel and evenly spaced.',
  prerequisites: ['la1-002', 'la1-003'],
  nextLesson: 'matrix-multiplication',

  // ── Hook ───────────────────────────────────────────────────────
  hook: {
    question: "If you take a photo on your phone and want to skew it horizontally, how does the computer know where to move every single one of the 12 million pixels?",
    realWorldContext: "When an engineer designs a video game or an iPhone app, they don't write a loop that calculates the new position of every single pixel one by one. That would be far too slow. Instead, they define a 'Linear Transformation'—a single rule that universally twists and stretches the entire fabric of space. Because space is locked to a grid, the computer only needs to calculate where the two fundamental basis vectors move. Everything else just gets dragged along for the ride. The mathematical 'recipe' that holds the instructions for where those two basis vectors go is called a Matrix.",
    previewVisualizationId: 'LALesson04_Matrices',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      '**Where you are in the story:** Chapter 1 gave you static arrows living in a static space. Now we add verbs. We want to actively warp, stretch, rotate, and project those spaces. The mathematical verb is called a **matrix** — and it is the engine behind computer graphics, robotics, quantum mechanics, and your CNC machine.',
      'You may have seen matrices before as grids of data — like a spreadsheet. That is the database view. The **geometric view** is far more powerful: a matrix is a *function* that transforms every point in space simultaneously.',
      'Picture a rubber sheet covered in a grid. A matrix transformation grabs that sheet and stretches it, rotates it, or shears it into a new shape. Every point on the sheet moves with it. The key constraint of a **linear** transformation: the rubber sheet cannot crinkle, tear, or move the origin. Grid lines stay parallel and evenly spaced — just scaled, rotated, or skewed.',
      '**The basis vector shortcut.** Because the grid stays uniform, you do not need to track where every point goes. Track only two points: where $\\hat{i} = [1,0]$ and $\\hat{j} = [0,1]$ land. Once you know those, every other point is forced — because every vector is a linear combination of $\\hat{i}$ and $\\hat{j}$, and the combination rules do not change under a linear transformation.',
      '**The matrix is the cheat sheet.** A $2 \\times 2$ matrix stores exactly two pieces of information: the new coordinates of $\\hat{i}$ (first column) and the new coordinates of $\\hat{j}$ (second column). That is the whole secret.',
      '**CNC machine connection — G68 coordinate rotation.** On a CNC milling machine, parts are sometimes clamped at an angle. Rather than rewriting every coordinate in the G-code program, the operator uses `G68` (Coordinate Rotation). The CNC controller secretly multiplies every tool position by a rotation matrix:\n\n$$\\begin{bmatrix}X\' \\\\ Y\'\\end{bmatrix} = \\begin{bmatrix}\\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta\\end{bmatrix}\\begin{bmatrix}X \\\\ Y\\end{bmatrix}$$\n\nIf the part is clamped 5° off — the controller applies this matrix to every single move, invisibly rotating the entire work coordinate system. You write the G-code as if the part were perfectly aligned; the transformation matrix handles the rest.',
      '**Where this is heading:** Once we understand what ONE matrix does to space, we chain matrices together (Matrix Multiplication) and ask whether transformations can be undone (Matrix Inverses).',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of LA2 — Matrices & Transformations',
        body: '**Previous (LA1):** Static vectors, dot products, systems of equations, RREF.\n**This lesson:** Matrices as active functions that warp space — the "verb" to LA1\'s "nouns."\n**Next:** Matrix Multiplication — chaining two transformations into one.',
      },
      {
        type: 'insight',
        title: 'The Secret of the Columns',
        body: 'The columns of a matrix tell you **exactly** where the basis vectors $\\hat{i}$ and $\\hat{j}$ land:\n\n$$A = \\begin{bmatrix} | & | \\\\ \\hat{i}_{new} & \\hat{j}_{new} \\\\ | & | \\end{bmatrix}$$\n\nThis is the most crucial insight in all of linear algebra. Read every matrix you encounter this way from now on.',
      },
      {
        type: 'definition',
        title: 'What Makes a Transformation "Linear"?',
        body: 'Exactly two rules must hold for all vectors $\\mathbf{u}, \\mathbf{v}$ and scalars $c$:\n\n1. **Additivity:** $T(\\mathbf{u} + \\mathbf{v}) = T(\\mathbf{u}) + T(\\mathbf{v})$\n2. **Homogeneity:** $T(c\\mathbf{v}) = cT(\\mathbf{v})$\n\nTogether these imply $T(\\mathbf{0}) = \\mathbf{0}$ — the origin stays fixed. Any transformation that moves the origin (like "add 2 to every x-coordinate") is **not** linear (it is called affine).',
      },
      {
        type: 'warning',
        title: 'Affine vs. Linear — A Critical Distinction',
        body: 'CNC work offsets (G54, G55) **translate** the origin — they shift every coordinate by a constant amount. That is an **affine** transformation, not a linear one. G68 coordinate rotation **is** linear — it preserves the origin. In robotics and computer graphics, the standard workaround is homogeneous coordinates: embed the 2D plane in 3D and represent translations as matrix multiplications.',
      },
    ],
    visualizations: [
      {
        id: 'LALesson04_Matrices',
        title: 'Warping the Grid — Interactive',
        mathBridge: 'The red arrow is $\\hat{i}$ and the green arrow is $\\hat{j}$. Click the transformation buttons (Shear, Rotate, Scale, Reflect) and watch the entire grid morph. At all times, the final coordinates of the red and green arrows equal the first and second columns of the matrix that was applied. The grid stays a uniform grid — no crinkles, no tears.',
        caption: 'A linear transformation is completely determined by where it sends the two basis vectors.',
      },
      {
        id: 'BasisVectorProof',
        title: 'Why Columns Equal Basis Vector Destinations',
        mathBridge: 'This visualization proves the column secret geometrically. Set $\\mathbf{v} = 1 \\cdot \\hat{i} + 0 \\cdot \\hat{j}$, then apply a transformation $A$. By linearity, $A\\hat{i} = 1 \\cdot (\\text{first column})$. Drag the sliders to see how any vector is just a scaled sum of the two column vectors.',
        caption: 'The linear combination law forces column 1 = destination of î, column 2 = destination of ĵ.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      'A 2D linear transformation relies on $2 \\times 2$ matrices. When applying a matrix $A$ to an input vector $\\vec{v}$, the output vector is written as $A\\vec{v}$.',
      'Let\'s build a matrix $A$. Suppose we want to transform space such that $\\hat{i}$ lands at $[a, c]$ and $\\hat{j}$ lands at $[b, d]$. We simply paste those landing coordinates in as the *columns* of our matrix:',
      '$ A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} $',
      'Now, suppose we want to know where a specific input vector $\\vec{v} = \\begin{bmatrix} x \\\\ y \\end{bmatrix}$ lands. Remember that $\\vec{v}$ is just a set of instructions: "Take $x$ steps along $\\hat{i}$ and $y$ steps along $\\hat{j}$".',
      'Because the grid lines remain straight and evenly spaced, the new vector will just take $x$ steps along the *new* $\\hat{i}$ and $y$ steps along the *new* $\\hat{j}$. Algebraically, we are just taking a linear combination of the columns of the matrix:',
      '$ \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\end{bmatrix} = x\\begin{bmatrix} a \\\\ c \\end{bmatrix} + y\\begin{bmatrix} b \\\\ d \\end{bmatrix} $',
      'This equation is the definition of Matrix-Vector multiplication. It proves that a matrix just scales and adds its own columns based on the input vector\'s coordinates.'
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Matrix-Vector Product Formula',
        body: '$\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\end{bmatrix} = \\begin{bmatrix} ax + by \\\\ cx + dy \\end{bmatrix}$',
      },
      {
        type: 'strategy',
        title: 'Rows vs Columns',
        body: 'Many textbooks teach matrix multiplication as "multiply the rows by the columns" and taking a dot product. While true for computing, the "Linear Combination of Columns" perspective shown above is far better for geometric intuition.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'OpenMAT: Matrices as Transformations',
        mathBridge: 'MATLAB uses `*` for matrix multiplication and `[a b; c d]` syntax for 2×2 matrices. The columns of A tell you where î and ĵ go — verify this directly by multiplying A by [1;0] and [0;1].',
        caption: 'Four cells: matrix-vector multiply, common transforms, rotation derivation, and CNC G68.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Matrix-vector multiply — columns are destination of basis vectors',
              prose: [
                'In MATLAB/Octave, `*` multiplies matrices and vectors. A column vector is `[x; y]` (semicolons separate rows).',
                'The first column of A is where î = [1;0] goes. The second column is where ĵ = [0;1] goes. Verify this directly — multiply A by each basis vector.',
              ],
              code: `% 90° counter-clockwise rotation matrix
A = [0 -1; 1 0];

% Where does i-hat land?
i_hat = [1; 0];
disp('A * i-hat ='); disp(A * i_hat)   % should be [0; 1]

% Where does j-hat land?
j_hat = [0; 1];
disp('A * j-hat ='); disp(A * j_hat)   % should be [-1; 0]

% Apply to an arbitrary vector v = [3; 1]
v = [3; 1];
w = A * v;
fprintf('v = [%g; %g]  -->  Av = [%g; %g]\\n', v(1),v(2), w(1),w(2))

% Verify via linear combination: 3*(col1) + 1*(col2)
verify = 3*A(:,1) + 1*A(:,2);
disp('Linear combination check:'); disp(verify)`,
            },
            {
              id: 2,
              cellTitle: 'Common 2D transformations — all defined by their columns',
              prose: [
                'Every possible 2×2 matrix is some transformation. These are the geometric classics. For each one, figure out where î and ĵ go — that tells you the columns.',
              ],
              code: `% The four famous 2D transformation types
v = [2; 1];

% Horizontal shear: i-hat stays, j-hat slides to [1;1]
shear = [1 1; 0 1];
fprintf('Shear [2;1] --> [%g;%g]\\n', shear*v)

% Reflection over x-axis: i-hat stays, j-hat flips
reflect_x = [1 0; 0 -1];
fprintf('Reflect x-axis [2;1] --> [%g;%g]\\n', reflect_x*v)

% Uniform scale 2x: both basis vectors double
scale2 = [2 0; 0 2];
fprintf('Scale 2x [2;1] --> [%g;%g]\\n', scale2*v)

% Projection onto x-axis: j-hat goes to zero
proj_x = [1 0; 0 0];
fprintf('Project x-axis [2;1] --> [%g;%g]\\n', proj_x*v)

% Squish: stretch x, compress y
squish = [3 0; 0 0.5];
fprintf('Squish [2;1] --> [%g;%g]\\n', squish*v)`,
            },
            {
              id: 3,
              cellTitle: 'Rotation matrix — derived from tracking basis vectors',
              prose: [
                'Where does î = [1,0] go after rotating by angle θ? To [cos θ, sin θ]. Where does ĵ = [0,1] go? To [−sin θ, cos θ]. Paste those into the columns and you have the rotation matrix.',
                'The unit circle property: rotation is length-preserving. Every column has magnitude 1. The two columns are perpendicular.',
              ],
              code: `theta_deg = 45;
theta = theta_deg * pi / 180;

% Rotation matrix built from where i-hat and j-hat go
R = [cos(theta)  -sin(theta);
     sin(theta)   cos(theta)];

fprintf('Rotation matrix for %g degrees:\\n', theta_deg)
disp(R)

% Apply to unit vectors
i_new = R * [1; 0];
j_new = R * [0; 1];
fprintf('i-hat lands at [%.4f, %.4f]\\n', i_new(1), i_new(2))
fprintf('j-hat lands at [%.4f, %.4f]\\n', j_new(1), j_new(2))

% Verify rotation preserves lengths
fprintf('|R*i| = %.6f  (should be 1)\\n', norm(i_new))
fprintf('|R*j| = %.6f  (should be 1)\\n', norm(j_new))
fprintf('Dot product of columns: %.6f  (should be 0)\\n', dot(R(:,1), R(:,2)))`,
            },
            {
              id: 4,
              cellTitle: 'Application: CNC G68 coordinate rotation',
              prose: [
                'A machinist clamps a part at 5° off-axis. Rather than rewriting hundreds of G-code coordinates, they use G68 (Coordinate Rotation). The CNC controller silently pre-multiplies every tool position by a rotation matrix.',
                'Here we simulate that: original G-code coordinates → rotation matrix → corrected machine positions.',
              ],
              code: `% CNC part is clamped 5 degrees off-axis
theta = 5 * pi / 180;

% G68 rotation matrix (same formula as above)
R = [cos(theta) -sin(theta); sin(theta) cos(theta)];

% G-code tool path (as if the part were perfectly aligned)
% G01 X10 Y0, X10 Y5, X0 Y5, X0 Y0
path_program = [10 0; 10 5; 0 5; 0 0]';  % columns are points

% Apply rotation to each point
path_machine = R * path_program;

fprintf('%-20s %-20s\\n', 'Programmed (X,Y)', 'Machine actual (X,Y)')
fprintf('%-20s %-20s\\n', '-------------------', '-------------------')
for k = 1:size(path_program,2)
    fprintf('[%.3f, %.3f]       --> [%.3f, %.3f]\\n', ...
        path_program(1,k), path_program(2,k), ...
        path_machine(1,k), path_machine(2,k))
end

% Maximum positional error if you DIDN'T apply the rotation
raw_pt = path_program(:,2);  % [10; 5]
corrected_pt = path_machine(:,2);
error = norm(raw_pt - corrected_pt);
fprintf('\\nMax positional error without G68: %.4f mm\\n', error)`,
            },
          ]
        }
      },
      {
        id: 'PythonNotebook',
        title: 'Code: Matrices as Transformations',
        mathBridge: 'A @ v is matrix-vector multiplication. The columns of A tell you where î and ĵ land. fig.transformed_grid([[a,b],[c,d]]) draws the warped coordinate system.',
        caption: 'Apply transformations to vectors and visualize how the grid warps.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cellTitle: 'Matrix-vector multiplication — where does a vector land?',
              prose: [
                'The `@` operator is matrix multiplication in NumPy. `A @ v` applies transformation A to vector v.',
                'The columns of A tell you where î = [1,0] and ĵ = [0,1] land. Any other vector\'s destination is a linear combination of those columns.',
              ],
              code: `import numpy as np

# A rotation 90° counterclockwise: î→[0,1], ĵ→[-1,0]
A = np.array([[0.0, -1.0],
              [1.0,  0.0]])

# Where does each basis vector land?
i_hat = np.array([1.0, 0.0])
j_hat = np.array([0.0, 1.0])

print("î lands at:", A @ i_hat, " (first column of A)")
print("ĵ lands at:", A @ j_hat, " (second column of A)")
print()

# Where does v = [3, 1] land?
v = np.array([3.0, 1.0])
print(f"v = {v} lands at: {A @ v}")
print(f"Verify: 3 × (A@î) + 1 × (A@ĵ) = {3*(A@i_hat) + 1*(A@j_hat)}")`,
            },
            {
              id: 2,
              cellTitle: 'Visualize: the transformed grid',
              prose: [
                '`fig.transformed_grid(matrix)` draws the coordinate grid after the transformation.',
                'The red arrow shows where î lands; the green arrow shows where ĵ lands.',
                'Try changing the matrix below to a shear [[1,1],[0,1]] or a scale [[2,0],[0,0.5]] and re-run.',
              ],
              code: `from opencalc import quick_transform

# 90° rotation
rotation = [[0, -1], [1, 0]]
quick_transform(rotation, vector=[2, 1])`,
            },
            {
              id: 3,
              cellTitle: 'Common transformations',
              prose: [
                'Every 2×2 matrix is a transformation. Here are the most common ones — each described by where î and ĵ land.',
              ],
              code: `import numpy as np

transformations = {
    "90° rotation":  np.array([[0., -1.], [1., 0.]]),
    "Reflect x-axis": np.array([[1., 0.], [0., -1.]]),
    "Horizontal shear": np.array([[1., 1.], [0., 1.]]),
    "Scale 2x, 0.5y": np.array([[2., 0.], [0., 0.5]]),
    "Project to x-axis": np.array([[1., 0.], [0., 0.]]),
}

v = np.array([2.0, 1.0])
print(f"Input vector: {v}")
print()
for name, T in transformations.items():
    print(f"{name}: {T @ v}")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Build a transformation matrix',
              difficulty: 'medium',
              prompt: 'Build a matrix A that sends î = [1,0] to [2, 1] and ĵ = [0,1] to [-1, 3]. Then apply it to the vector [4, 2] and visualize the result using quick_transform.',
              code: `import numpy as np
from opencalc import quick_transform

# Columns of A are where î and ĵ land
A = np.array([[2., -1.],
              [1.,  3.]])

v = np.array([4.0, 2.0])

# Apply A to v
# Then visualize: quick_transform(A.tolist(), vector=v.tolist())
`,
              hint: 'The columns of A are directly the images of î and ĵ. A = [[2,-1],[1,3]] means first column is where î goes, second column is where ĵ goes. A.tolist() converts to plain lists for quick_transform.',
            },
          ]
        }
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      '**Formal definition of a linear map.** A function $T: V \\to W$ between vector spaces is called a **linear transformation** (or linear map) if and only if for all $\\mathbf{u}, \\mathbf{v} \\in V$ and all scalars $c$:\n\n1. **Additivity:** $T(\\mathbf{u} + \\mathbf{v}) = T(\\mathbf{u}) + T(\\mathbf{v})$\n2. **Homogeneity:** $T(c\\mathbf{v}) = cT(\\mathbf{v})$\n\nCombining these: $T(c\\mathbf{u} + d\\mathbf{v}) = cT(\\mathbf{u}) + dT(\\mathbf{v})$ for all scalars $c, d$. By induction, $T$ preserves arbitrary linear combinations: $T\\bigl(\\sum_i c_i \\mathbf{v}_i\\bigr) = \\sum_i c_i T(\\mathbf{v}_i)$.',
      '**Matrix representation theorem.** The critical fact: every linear transformation $T: \\mathbb{R}^n \\to \\mathbb{R}^m$ is uniquely represented by an $m \\times n$ matrix $A$ such that $T(\\mathbf{x}) = A\\mathbf{x}$ for all $\\mathbf{x}$. How do we find $A$? Apply $T$ to each standard basis vector $\\mathbf{e}_j$ and make the results the columns of $A$:\n\n$$A = \\begin{bmatrix} T(\\mathbf{e}_1) & T(\\mathbf{e}_2) & \\cdots & T(\\mathbf{e}_n) \\end{bmatrix}$$\n\nThis is the deepest reason the columns of a matrix are the destinations of the basis vectors.',
      '**Proof sketch.** For any $\\mathbf{x} = x_1 \\mathbf{e}_1 + \\cdots + x_n \\mathbf{e}_n$:\n\n$$T(\\mathbf{x}) = T(x_1 \\mathbf{e}_1 + \\cdots + x_n \\mathbf{e}_n) = x_1 T(\\mathbf{e}_1) + \\cdots + x_n T(\\mathbf{e}_n) = A\\mathbf{x}$$\n\nThe first equality uses the representation in the standard basis. The second uses linearity. The third uses the definition $A = [T(\\mathbf{e}_1) \\cdots T(\\mathbf{e}_n)]$.',
      '**The space of linear maps.** The set of all linear maps $T: \\mathbb{R}^n \\to \\mathbb{R}^m$ forms a vector space (called $\\mathcal{L}(\\mathbb{R}^n, \\mathbb{R}^m)$ or $\\text{Hom}(\\mathbb{R}^n, \\mathbb{R}^m)$), isomorphic to $\\mathbb{R}^{m \\times n}$. The identification $T \\leftrightarrow A$ is a linear isomorphism. This is the formal statement that matrices and linear maps are the same thing.',
      '**Kernel and image.** For $T: V \\to W$, the **kernel** (null space) is $\\ker(T) = \\{\\mathbf{v} \\in V : T(\\mathbf{v}) = \\mathbf{0}\\}$. The **image** (column space) is $\\text{im}(T) = \\{T(\\mathbf{v}) : \\mathbf{v} \\in V\\}$. Both are subspaces. The Rank-Nullity theorem (LA1-006 preview) states $\\dim(\\ker T) + \\dim(\\text{im}\\, T) = \\dim(V) = n$. The image of $A$ is exactly the span of $A$\'s columns — this is why column space matters.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Matrix Representation of Linear Maps',
        body: '**Theorem:** Every linear map $T: \\mathbb{R}^n \\to \\mathbb{R}^m$ has a unique matrix representation $A \\in \\mathbb{R}^{m \\times n}$ with $A_{ij} = [T(\\mathbf{e}_j)]_i$ (the $i$-th component of where the $j$-th basis vector goes).\n\n**Corollary:** The set of $m \\times n$ matrices is in bijection with the set of linear maps $\\mathbb{R}^n \\to \\mathbb{R}^m$. Matrix multiplication corresponds to function composition.',
      },
      {
        type: 'proof',
        title: 'The Origin Must Be Fixed',
        body: 'For any linear map $T$, $T(\\mathbf{0}) = T(0 \\cdot \\mathbf{0}) = 0 \\cdot T(\\mathbf{0}) = \\mathbf{0}$ by homogeneity. So $T(\\mathbf{0}) = \\mathbf{0}$ — the origin is always a fixed point of any linear transformation. A transformation that moves the origin (e.g., $f(\\mathbf{x}) = A\\mathbf{x} + \\mathbf{b}$ with $\\mathbf{b} \\neq \\mathbf{0}$) is called affine, not linear.',
      },
      {
        type: 'insight',
        title: 'Image = Column Space',
        body: 'The image of $T(\\mathbf{x}) = A\\mathbf{x}$ is the set of all possible outputs: $\\{A\\mathbf{x} : \\mathbf{x} \\in \\mathbb{R}^n\\}$. Expanding: $A\\mathbf{x} = x_1\\mathbf{a}_1 + \\cdots + x_n\\mathbf{a}_n$ where $\\mathbf{a}_j$ are the columns of $A$. So the image is exactly $\\text{span}(\\mathbf{a}_1, \\ldots, \\mathbf{a}_n)$ — the **column space** of $A$.\n\nIn other words: the columns of the matrix span the entire set of possible outputs.',
      },
      {
        type: 'warning',
        title: 'Composition Order Matters — Matrices Do Not Commute',
        body: 'Composing two linear maps corresponds to multiplying their matrices. But $AB \\neq BA$ in general — matrix multiplication is **not** commutative.\n\nGeometrically: "first rotate, then shear" gives a different result than "first shear, then rotate." Order matters because you are applying transformations to an already-warped space.',
      },
    ],
    visualizations: [
      {
        id: 'ProjectionMatrixViz',
        title: 'Projection — A Linear Map That Loses Information',
        mathBridge: 'Projection onto a line is a linear transformation whose matrix has rank 1. Drag the input vector and see it collapse onto the projection axis. The kernel (null space) consists of all vectors perpendicular to the projection direction — they map to zero. This visualizes both kernel and image for a concrete linear map.',
        caption: 'A rank-1 matrix collapses the plane onto a line. Many inputs share the same output — the kernel is all vectors perpendicular to the projection axis.',
      },
    ],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: "ex-1",
      title: "Applying a Matrix Transformation",
      problem: "Let $A = \\begin{bmatrix} 2 & -1 \\\\ 0 & 3 \\end{bmatrix}$. Find the transformed output of the vector $\\vec{v} = \\begin{bmatrix} 4 \\\\ 1 \\end{bmatrix}$.",
      steps: [
        {
          expression: "A\\vec{v} = \\begin{bmatrix} 2 & -1 \\\\ 0 & 3 \\end{bmatrix} \\begin{bmatrix} 4 \\\\ 1 \\end{bmatrix}",
          annotation: "Set up the multiplication.",
          strategyTitle: "Setup",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "= 4 \\begin{bmatrix} 2 \\\\ 0 \\end{bmatrix} + 1 \\begin{bmatrix} -1 \\\\ 3 \\end{bmatrix}",
          annotation: "Rewrite as a linear combination of the columns. The input vector's components act as the scalars.",
          strategyTitle: "Linear combination form",
          checkpoint: "What is 4 times the first column?",
          hints: ["4 * [2, 0] = [8, 0]"],
        },
        {
          expression: "= \\begin{bmatrix} 8 \\\\ 0 \\end{bmatrix} + \\begin{bmatrix} -1 \\\\ 3 \\end{bmatrix}",
          annotation: "Perform the scalar multiplication.",
          strategyTitle: "Scale",
          checkpoint: "Add the two resulting vectors together.",
          hints: [],
        },
        {
          expression: "= \\begin{bmatrix} 7 \\\\ 3 \\end{bmatrix}",
          annotation: "Add the vectors to find the final landing location.",
          strategyTitle: "Vector addition",
          checkpoint: "",
          hints: [],
        }
      ],
      conclusion: "The output vector lands at [7, 3]. Notice that we just took 4 of the new 'i-hat' vectors and 1 of the new 'j-hat' vectors."
    },
    {
      id: "ex-2",
      title: "Building a Matrix from Geometry",
      problem: "Construct a $2 \\times 2$ matrix that rotates the entire 2D plane $90^\\circ$ counter-clockwise.",
      steps: [
        {
          expression: "\\hat{i}_{new} = \\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix}",
          annotation: "Figure out where the horizontal basis vector [1, 0] lands after a 90-degree counter-clockwise turn. It points straight up.",
          strategyTitle: "Track i-hat",
          checkpoint: "Where does the vertical vector [0, 1] go if you rotate it 90 degrees CCW?",
          hints: ["It falls over to the left, landing on the negative x-axis."],
        },
        {
          expression: "\\hat{j}_{new} = \\begin{bmatrix} -1 \\\\ 0 \\end{bmatrix}",
          annotation: "Figure out where the vertical basis vector [0, 1] lands.",
          strategyTitle: "Track j-hat",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "A = \\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}",
          annotation: "Paste those two landing vectors in as the columns of the matrix.",
          strategyTitle: "Construct Matrix",
          checkpoint: "",
          hints: [],
        }
      ],
      conclusion: "This is the 90-degree rotation matrix. If you multiply ANY vector by this matrix, it will output a vector rotated perfectly by 90-degrees CCW."
    }
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: "ch-1",
      difficulty: "easy",
      problem: "Calculate the output of $\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix} \\begin{bmatrix} 5 \\\\ -2 \\end{bmatrix}$.",
      hint: "Take 5 times the first column [1, 3], and add it to -2 times the second column [2, 4].",
      walkthrough: [
        {
          expression: "5 \\begin{bmatrix} 1 \\\\ 3 \\end{bmatrix} + (-2) \\begin{bmatrix} 2 \\\\ 4 \\end{bmatrix}",
          annotation: "Write as a linear combination of the columns."
        },
        {
          expression: "\\begin{bmatrix} 5 \\\\ 15 \\end{bmatrix} + \\begin{bmatrix} -4 \\\\ -8 \\end{bmatrix}",
          annotation: "Scale the columns."
        },
        {
          expression: "\\begin{bmatrix} 1 \\\\ 7 \\end{bmatrix}",
          annotation: "Add them together."
        }
      ],
      answer: "\\begin{bmatrix} 1 \\\\ 7 \\end{bmatrix}"
    },
    {
      id: "ch-2",
      difficulty: "medium",
      problem: "Construct a matrix that shrinks space by half horizontally, but leaves everything unchanged vertically.",
      hint: "Where does [1,0] go? Where does [0,1] go? Make those your columns.",
      walkthrough: [
        {
          expression: "\\hat{i} \\to \\begin{bmatrix} 0.5 \\\\ 0 \\end{bmatrix}",
          annotation: "Since horizontal scale is halved, i-hat shrinks to 0.5."
        },
        {
          expression: "\\hat{j} \\to \\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix}",
          annotation: "Vertical scale is unchanged, so j-hat stays where it is."
        },
        {
          expression: "\\begin{bmatrix} 0.5 & 0 \\\\ 0 & 1 \\end{bmatrix}",
          annotation: "Paste into columns."
        }
      ],
      answer: "\\begin{bmatrix} 0.5 & 0 \\\\ 0 & 1 \\end{bmatrix}"
    }
  ],

  // ── Semantic Layer ───────────────────────────────────────────────
  semantics: {
    core: [
      {
        symbol: "A\\vec{v}",
        meaning: "Applying the transformation matrix A to the input vector v."
      },
      {
        symbol: "T(\\vec{v})",
        meaning: "A linear transformation function T acting on vector v. Functionally identical to a matrix multiplication."
      }
    ],
    rulesOfThumb: [
      "The columns of a matrix tell you where the standard basis vectors land.",
      "Matrix-vector multiplication is just a linear combination of the matrix's columns.",
      "If the grid lines curve after a transformation, it is NOT a linear transformation."
    ]
  },

  // ── Spiral Learning ──────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la1-002',
        label: 'Linear Combinations',
        note: 'If taking a linear combination of columns feels strange, review Lesson 2. Matrix multiplication is entirely built upon linear combinations.'
      }
    ],
    futureLinks: [
      {
        lessonId: 'la3-001',
        label: 'Eigenvectors',
        note: 'When you warp space with a matrix, most vectors get knocked off their original span. Eigenvectors are the rare, special vectors that miraculously stay on their own line during the warp.'
      }
    ]
  },

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: "assess-1",
        type: "input",
        text: "What matrix does absolutely nothing to space? (The Identity Matrix). Provide the top row first, then bottom row.",
        answer: "[[1, 0], [0, 1]]",
        hint: "Where must i-hat and j-hat go if nothing changes? i-hat stays at [1, 0] and j-hat stays at [0, 1]."
      }
    ]
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    "A matrix is a VERB. It is an action you perform on a space.",
    "First column = new home for horizontal unit vector.",
    "Second column = new home for vertical unit vector.",
    "Matrix multiplication = Linear combination of columns."
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
      text: "Geometrically, what do the columns of a 2x2 transformation matrix represent?",
      options: [
        "The coordinate destinations where the starting basis vectors (i-hat and j-hat) land.",
        "The x and y components of the output vector.",
        "The angle of rotation applied to the space.",
        "The eigenvalues of the matrix."
      ],
      answer: "The coordinate destinations where the starting basis vectors (i-hat and j-hat) land.",
      hints: ["The entire transformation is defined uniquely by tracking the basis vectors."],
      reviewSection: 'Intuition tab — The Secret of the Columns'
    },
    {
      id: 'quiz-2',
      type: 'choice',
      text: "Which of the following is NOT a requirement for a transformation to be considered 'Linear'?",
      options: [
        "The origin (0,0) must remain at (0,0).",
        "Grid lines must remain parallel and evenly spaced.",
        "The area of the space must remain unchanged.",
        "If you scale an input vector by 2, the output vector will also be scaled by 2."
      ],
      answer: "The area of the space must remain unchanged.",
      hints: ["A linear transformation can stretch or squish the area of the grid (we will measure this change in area later using Determinants). But it cannot bend the grid lines."],
      reviewSection: 'Intuition tab — Linear Transformation Definition'
    }
  ]
};
