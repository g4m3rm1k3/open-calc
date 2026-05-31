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
      'Take $[3, 1]^T$ and apply $A = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$. Output: $[-1, 3]^T$. Apply $A$ to $[5, 2]^T$: output is $[-2, 5]^T$. Apply $A$ to $[0, -4]^T$: output is $[4, 0]^T$. Every vector rotates 90° counter-clockwise. The matrix $A$ is not storing data — it is a **function** that warps the entire plane simultaneously. This lesson is about that shift: from matrix as spreadsheet to matrix as **verb** that transforms space.',
      'You may have seen matrices before as grids of data — like a spreadsheet. That is the database view. The **geometric view** is far more powerful: a matrix is a *function* that transforms every point in space simultaneously.',
      'Picture a rubber sheet covered in a grid. A matrix transformation grabs that sheet and stretches it, rotates it, or shears it into a new shape. Every point on the sheet moves with it. The key constraint of a **linear** transformation: the rubber sheet cannot crinkle, tear, or move the origin. Grid lines stay parallel and evenly spaced — just scaled, rotated, or skewed.',
      '**The basis vector shortcut.** Because the grid stays uniform, you do not need to track where every point goes. Track only two points: where $\\hat{i} = [1,0]$ and $\\hat{j} = [0,1]$ land. Once you know those, every other point is forced — because every vector is a linear combination of $\\hat{i}$ and $\\hat{j}$, and the combination rules do not change under a linear transformation.',
      '**The matrix is the cheat sheet.** A $2 \\times 2$ matrix stores exactly two pieces of information: the new coordinates of $\\hat{i}$ (first column) and the new coordinates of $\\hat{j}$ (second column). That is the whole secret.',
      '**Predict before reading on.** You have the shear matrix $S = \\begin{bmatrix}1&3\\\\0&1\\end{bmatrix}$. Without computing: what does $S$ send $\\hat{i} = [1,0]^T$ to? What does it send $\\hat{j} = [0,1]^T$ to? Where does the corner $(0,1)$ of the unit square end up? Write your prediction, then check it against Example 3.',
      '**CNC machine connection — G68 coordinate rotation.** On a CNC milling machine, parts are sometimes clamped at an angle. Rather than rewriting every coordinate in the G-code program, the operator uses `G68` (Coordinate Rotation). The CNC controller secretly multiplies every tool position by a rotation matrix:\n\n$$\\begin{bmatrix}X\' \\\\ Y\'\\end{bmatrix} = \\begin{bmatrix}\\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta\\end{bmatrix}\\begin{bmatrix}X \\\\ Y\\end{bmatrix}$$\n\nIf the part is clamped 5° off — the controller applies this matrix to every single move, invisibly rotating the entire work coordinate system. You write the G-code as if the part were perfectly aligned; the transformation matrix handles the rest.',
      '**Where this is heading:** Once we understand what ONE matrix does to space, we chain matrices together (Matrix Multiplication) and ask whether transformations can be undone (Matrix Inverses).',
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Procedure: Apply a Matrix to a Vector (Column Method)',
        body: 'Step 1. Write the input vector $\\mathbf{v} = [x, y]^T$ and identify its two components $x$ and $y$.\nStep 2. Read column 1 of $A$ — this is where $\\hat{i} = [1,0]^T$ lands after the transformation.\nStep 3. Read column 2 of $A$ — this is where $\\hat{j} = [0,1]^T$ lands.\nStep 4. Scale and add: $A\\mathbf{v} = x \\cdot (\\text{column 1}) + y \\cdot (\\text{column 2})$.\nStep 5. Verify with the row formula: row 1 of $A$ dotted with $\\mathbf{v}$ gives the first output component; row 2 dotted with $\\mathbf{v}$ gives the second.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 1 of 12 — Matrices & Transformations',
        body: '**Previous (Chapter 1):** Static vectors, dot products, systems of equations, RREF.\n**This lesson:** Matrices as active functions that warp space — the “verb” to LA1\'s “nouns.”\n**Next (Lesson 2):** Matrix Multiplication — chaining two transformations into one.',
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
      {
        type: 'strategy',
        title: 'When to Read a Matrix Geometrically',
        body: '**Use the column-reading method when you want to understand WHAT a matrix does:** Is it a rotation? A stretch? A shear? Does it collapse the plane onto a line?\n\n**Use the row-dot-column formula when you just need the number:** computing $A\\mathbf{v}$ for a specific $\\mathbf{v}$, or running machine computations.\n\n**The test for linearity:** if a transformation preserves the origin AND satisfies $T(\\mathbf{u}+\\mathbf{v})=T(\\mathbf{u})+T(\\mathbf{v})$, it can be represented as a matrix. If it moves the origin or bends grid lines, it cannot.',
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
      {
        id: 'TransformLab',
        title: 'Transform Lab — Place, Rotate, Mirror, Chain',
        mathBridge: 'Work through all four steps: place a shape, rotate it by entering a matrix, reflect it across an axis, then chain two transforms together. Each step reinforces the same core idea — a matrix tells the plane where to send $\\hat{i}$ and $\\hat{j}$, and everything else follows.',
        caption: 'Build hands-on intuition by constructing rotation, reflection, and composition matrices yourself.',
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
                '`A * i_hat` multiplies the $2 \\times 2$ matrix by the column vector $[1;0]$. This computes $0 \\cdot \\text{col}_1 + 1 \\cdot \\text{col}_2$... no: for `[1;0]` the result is $1 \\cdot \\text{col}_1 + 0 \\cdot \\text{col}_2$ = column 1 exactly. Similarly `A * [0;1]` returns column 2. This directly confirms: **the columns of a matrix are the destinations of the basis vectors**.',
                '`3*A(:,1) + 1*A(:,2)` computes the linear combination manually — 3 times the first column (destination of î) plus 1 times the second column (destination of ĵ). The `disp(verify)` line confirms this equals `A * v` where `v = [3;1]`. Every matrix-vector product is a weighted sum of the matrix columns, with weights equal to the input vector components.',
                '`det(A)` for this rotation matrix equals $1$ — rotation never stretches or squishes area. Verify by computing $(0)(0) - (-1)(1) = 1$ by hand. This is why rotating a machined part on a CNC table does not change the dimensions — the rotation matrix has $\\det = 1$, which means it is an **isometry**: lengths and areas are preserved exactly.',
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
                'Each transform is defined by two columns: shear `[1 1; 0 1]` — left column $[1,0]$ keeps î fixed, right column $[1,1]$ slides ĵ one unit right while keeping it at height 1. Reflection `[1 0; 0 -1]` — î unchanged, ĵ flips sign on its $y$-component (pointing down instead of up). Projection `[1 0; 0 0]` — î unchanged, ĵ maps to zero, so all $y$-information is permanently destroyed.',
                'Squish `[3 0; 0 0.5]`: left column $[3,0]$ means î triples in length; right column $[0,0.5]$ means ĵ shrinks to half. Before running: predict `squish * [2;1]` by computing $2 \\cdot [3,0] + 1 \\cdot [0,0.5]$ in your head. Then run the cell to check.',
                'The `fprintf` output for each transform follows the pattern: "name: [2;1] → [output]". For the projection `[1 0; 0 0]`, any vector maps to `[x; 0]` — the $y$-component is permanently destroyed, confirming $\\det = 0$ and rank $= 1$. The fact that information is lost is irreversible: given only the output `[2;0]`, you cannot reconstruct whether the input was `[2;1]`, `[2;5]`, or any `[2;y]`.',
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
                'After rotating by $\\theta$, î = $[1,0]$ (at angle $0°$ on the unit circle) moves to $[\\cos\\theta, \\sin\\theta]$ — column 1. ĵ = $[0,1]$ (at $90°$) moves to $[-\\sin\\theta, \\cos\\theta]$ — column 2. `cos(theta)` and `sin(theta)` in MATLAB compute those exact values when `theta` is in radians, which is why `theta_deg * pi / 180` converts degrees first.',
                '`norm(i_new)` computes $\\sqrt{\\cos^2\\theta + \\sin^2\\theta} = 1$ — the Pythagorean identity proves rotation preserves vector length. `dot(R(:,1), R(:,2))` computes $\\cos\\theta \\cdot (-\\sin\\theta) + \\sin\\theta \\cdot \\cos\\theta = 0$ — the two columns are always perpendicular. A matrix with unit-length, mutually perpendicular columns is called **orthogonal**; every rotation matrix is orthogonal.',
                'For an orthogonal matrix, $R^{-1} = R^\\top$ — invert a rotation by transposing. `R\'` in MATLAB is the transpose (for real matrices). Verify: `R * R\'` should equal the $2 \\times 2$ identity matrix. This is the mathematical reason "undo rotation" works: the transpose IS the reverse rotation by $-\\theta$, computed at zero extra cost compared to a general matrix inverse.',
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
                '`path_program` is a $2 \\times 4$ matrix — each column is one $(X,Y)$ tool position. `R * path_program` multiplies the $2 \\times 2$ rotation matrix by this $2 \\times 4$ matrix. MATLAB applies $R$ to each column independently: column $k$ of the result is $R \\cdot \\text{col}_k(\\text{path\\_program})$. One matrix multiply corrects all four points simultaneously — this is why matrix operations are used instead of looping over each coordinate.',
                '`norm(raw_pt - corrected_pt)` computes the Euclidean distance $\\sqrt{(x_1-x_2)^2 + (y_1-y_2)^2}$ between the uncorrected and G68-corrected positions for one point. This is the actual positional error you would measure in the machined part if the rotation correction were skipped. Even a 5° offset at 10mm from origin gives a noticeable error on tight-tolerance features.',
                'The loop `for k = 1:size(path_program, 2)` iterates over columns. Each column is one $(X, Y)$ waypoint; `R * path_program(:,k)` applies the $2 \\times 2$ rotation to that waypoint. In production code, you would write `R * path_program` (no loop) — MATLAB broadcasts the matrix multiply across all columns at once. The loop here makes the individual column-multiplication explicit so you can see each transformation happening independently.',
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
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Matrix-vector multiplication — where does a vector land?',
              prose: [
                '`A @ i_hat` is the NumPy matrix-vector product. For `i_hat = [1.0, 0.0]`, the formula gives $1 \\cdot \\text{col}_0(A) + 0 \\cdot \\text{col}_1(A) = $ column 0 of A exactly — confirming the "first column = destination of î" rule. `A @ j_hat` similarly returns column 1.',
                '`3*(A@i_hat) + 1*(A@j_hat)` computes the linear combination manually, weighted by the components of `v = [3.0, 1.0]`. The result must match `A @ v`, which `print(f"Verify: ...")` confirms. This is not a coincidence — it is the definition of matrix-vector multiplication. The plot makes it visual: the "After" panel shows all three vectors rotated exactly 90° CCW, with lengths unchanged.',
                '`np.linalg.det(A)` computes the determinant, which equals the signed area scaling factor of the transformation. For the 90° rotation matrix `[[0,-1],[1,0]]`, $\\det = (0)(0) - (-1)(1) = 1$ — rotation preserves area (and orientation). For a reflection, $\\det = -1$ — area is preserved but orientation flips. For a projection, $\\det = 0$ — area collapses to zero because the image is lower-dimensional.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

# A rotation 90 deg counterclockwise: i -> [0,1], j -> [-1,0]
A = np.array([[0.0, -1.0],
              [1.0,  0.0]])

i_hat = np.array([1.0, 0.0])
j_hat = np.array([0.0, 1.0])

print("i lands at:", A @ i_hat, " (first column of A)")
print("j lands at:", A @ j_hat, " (second column of A)")

v = np.array([3.0, 1.0])
print(f"v = {v} lands at: {A @ v}")
print(f"Verify: 3*(A@i) + 1*(A@j) = {3*(A@i_hat) + 1*(A@j_hat)}")

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
origin = np.zeros(2)

for ax, title, vecs in [
    (axes[0], "Before (original)", [(i_hat,’steelblue’,’i’), (j_hat,’darkorange’,’j’), (v,’green’,’v’)]),
    (axes[1], "After 90 deg rotation", [(A@i_hat,’steelblue’,"A*i"), (A@j_hat,’darkorange’,"A*j"), (A@v,’green’,"A*v")]),
]:
    ax.set_title(title, fontsize=12)
    for vec, color, lbl in vecs:
        ax.annotate(‘’, xy=vec, xytext=origin, arrowprops=dict(arrowstyle=’->’, color=color, lw=2.5))
        ax.text(vec[0]+0.08, vec[1]+0.08, lbl, color=color, fontsize=11, fontweight=’bold’)
    ax.set_xlim(-2, 4); ax.set_ylim(-2, 4)
    ax.set_aspect(‘equal’); ax.grid(True, alpha=0.3)
    ax.axhline(0, color=’k’, lw=0.5); ax.axvline(0, color=’k’, lw=0.5)

plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: 'Visualize: the transformed grid',
              prose: [
                '`quick_transform(matrix, vector)` is an OpenCalc helper that draws the coordinate grid before and after applying `matrix`. It applies the same $2 \\times 2$ matrix-vector product `A @ v` to a dense grid of sample points and plots both the original (gray) and transformed (colored) grids. The `vector` argument marks one specific input vector and its image as an arrow.',
                'Try replacing `[[0,-1],[1,0]]` with a shear `[[1,1],[0,1]]` — grid lines stay parallel but tilt. Try `[[1,0],[0,0]]` (projection) — the entire grid collapses onto the x-axis. Every matrix that keeps grid lines straight and evenly spaced is a linear transformation.',
                'What you are seeing geometrically is the **fundamental theorem of linear transformations**: any linear map is completely determined by what it does to the basis vectors. The `quick_transform` visualization makes this concrete — the entire transformed grid is determined solely by the two column vectors of the matrix. Change one column entry and the entire grid warps accordingly.',
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
                'Each entry in `transformations` maps a name to a $2 \\times 2$ NumPy array. `T @ v` applies that transformation to `v = [2.0, 1.0]` — a linear combination of `T`\'s columns weighted by 2 and 1. The loop runs the same formula for all five matrices; the output for each is determined entirely by the column structure of `T`.',
                'The 5-panel subplot shows the input vector (blue, faded) and output vector (red) side by side. For "Project x-axis", the red arrow always lies on the x-axis — the second column is zero, so the $y$-component is always destroyed. For "90 deg rotation", the output is perpendicular to the input at the same length. Read each matrix\'s columns before running — predict the output direction and length before the cell executes.',
                '`np.linalg.det(T)` for each transformation gives the signed area scaling factor. Shear: $\\det = 1$ (parallelogram area preserved). Reflection: $\\det = -1$ (orientation flips). Projection: $\\det = 0$ (collapses to a line, zero area). Scale: $\\det = \\text{scale}_x \\times \\text{scale}_y$ (area scales by the product of the scale factors). Rotation: $\\det = 1$ always (rotation never changes area). These determinant values are all computable from the column entries without running the code.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

transformations = {
    "90 deg rotation":  np.array([[0., -1.], [1., 0.]]),
    "Reflect x-axis": np.array([[1., 0.], [0., -1.]]),
    "Horiz. shear": np.array([[1., 1.], [0., 1.]]),
    "Scale 2x,0.5y": np.array([[2., 0.], [0., 0.5]]),
    "Project x-axis": np.array([[1., 0.], [0., 0.]]),
}

v = np.array([2.0, 1.0])
print(f"Input vector: {v}")
for name, T in transformations.items():
    print(f"  {name}: {T @ v}")

# Visualize all transformations in subplots
fig, axes = plt.subplots(1, 5, figsize=(14, 3))
origin = np.zeros(2)
for ax, (name, T) in zip(axes, transformations.items()):
    ax.set_title(name, fontsize=9)
    ax.annotate('', xy=v, xytext=origin, arrowprops=dict(arrowstyle='->', color='steelblue', lw=2, alpha=0.4))
    Tv = T @ v
    ax.annotate('', xy=Tv, xytext=origin, arrowprops=dict(arrowstyle='->', color='crimson', lw=2.5))
    ax.text(v[0]*0.5+0.05, v[1]*0.5+0.1, 'v', color='steelblue', fontsize=10, alpha=0.5)
    ax.text(Tv[0]*0.5+0.1, Tv[1]*0.5+0.1, 'Tv', color='crimson', fontsize=10, fontweight='bold')
    ax.set_xlim(-2.5, 3); ax.set_ylim(-2, 3)
    ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
    ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)

plt.suptitle("Common 2x2 Transformations applied to v=[2,1]", fontsize=11, y=1.02)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 4,
              cellTitle: 'Application: composing transformations for a robot arm',
              prose: [
                '`R @ S` multiplies the two transformation matrices together. Reading right to left: first `S` scales the vector, then `R` rotates it. The combined matrix `R @ S` does BOTH operations in one matrix-vector multiply — no need to apply them separately. This is the core efficiency of matrix composition: $n$ transformations applied to $m$ points requires one $O(n^3)$ matrix-multiplication step, then $m$ cheap $O(n^2)$ matrix-vector products.',
                '`np.linalg.det(R @ S)` equals `np.linalg.det(R) * np.linalg.det(S)` — the determinant of a product equals the product of the determinants. For rotation $\\det(R) = 1$ and for uniform scaling by $s$ the $\\det(S) = s^2$ in 2D. So the composed transform scales area by $s^2$ and preserves orientation — exactly what you would expect geometrically.',
                'Comparing `R @ S` vs `S @ R` in the output shows that the two matrices produce DIFFERENT results — the order of matrix multiplication matters. This non-commutativity is why "rotate then scale" and "scale then rotate" give different final configurations in a robot arm. In robotics, the order of joint transformations is fixed by the physical structure and must match exactly in the software.',
              ],
              code: `import numpy as np

# Robot arm: scale the tool reach, then rotate to target angle
s = 2.0      # tool reach scaled by 2
theta = np.pi / 4   # rotate 45 degrees

S = np.array([[s, 0],
              [0, s]])
R = np.array([[np.cos(theta), -np.sin(theta)],
              [np.sin(theta),  np.cos(theta)]])

RS = R @ S   # first scale, then rotate
SR = S @ R   # first rotate, then scale

v = np.array([1.0, 0.0])  # initial tool direction (pointing right)

print("R @ S applied to [1,0]:", RS @ v)
print("S @ R applied to [1,0]:", SR @ v)
print("Same result?", np.allclose(RS @ v, SR @ v))
print("det(R @ S) =", np.linalg.det(RS).round(4), "  det(R)*det(S) =", np.linalg.det(R)*np.linalg.det(S))
`,
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
      {
        id: 'LinearTransformationsViz',
        title: 'Linear Transformations — Step-by-Step T(x) = Ax',
        mathBridge: 'A five-tab module: Concept explains linearity (additivity + homogeneity), the standard matrix, kernel, image, rank-nullity; Canonical walks step-by-step through T(x) = Ax for preset transformations (rotation, projection, shear) showing each entry computed as a dot product; Real World shows a CNC coordinate transformation pipeline; Interactive lets you set any 2×2 matrix and input vector and animate the transformation; Practice has four problems.',
        caption: 'Every linear transformation is multiplication by its standard matrix — the columns are where the basis vectors land.',
      },
    ],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: 'la2-001-ex1',
      title: 'Apply a Matrix — Read the Output as a Linear Combination',
      problem: `Let $A = \\begin{bmatrix} 2 & -1 \\\\ 0 & 3 \\end{bmatrix}$. Where does the vector $\\mathbf{v} = \\begin{bmatrix} 4 \\\\ 1 \\end{bmatrix}$ land after the transformation?`,
      steps: [
        {
          expression: 'A\\mathbf{v} = \\begin{bmatrix} 2 & -1 \\\\ 0 & 3 \\end{bmatrix} \\begin{bmatrix} 4 \\\\ 1 \\end{bmatrix}',
          annotation: 'Set up the matrix-vector product $A\\mathbf{v}$. The matrix $A$ is a $2 \\times 2$ transformation; $\\mathbf{v}$ is a $2 \\times 1$ column vector. The result will also be $2 \\times 1$.',
          strategyTitle: 'Step 1: Set up $A\\mathbf{v}$',
        },
        {
          expression: '= 4 \\begin{bmatrix} 2 \\\\ 0 \\end{bmatrix} + 1 \\begin{bmatrix} -1 \\\\ 3 \\end{bmatrix}',
          annotation: `Rewrite as a **linear combination of the columns** of $A$: the first component of $\\mathbf{v}$ (which is 4) scales column 1 $= [2,0]^T$, and the second component (which is 1) scales column 2 $= [-1,3]^T$. This is the geometric interpretation — $\\mathbf{v}$ says "go 4 steps along new $\\hat{i}$ and 1 step along new $\\hat{j}$."`,
          strategyTitle: 'Step 2: Decompose as linear combination of columns',
          hints: ['Column 1 of $A$ = $[2,0]^T$ = where $\\hat{i}=[1,0]$ lands. Column 2 = $[-1,3]^T$ = where $\\hat{j}=[0,1]$ lands.'],
        },
        {
          expression: '= \\begin{bmatrix} 8 \\\\ 0 \\end{bmatrix} + \\begin{bmatrix} -1 \\\\ 3 \\end{bmatrix}',
          annotation: 'Scale: $4 \\cdot [2,0]^T = [8,0]^T$ and $1 \\cdot [-1,3]^T = [-1,3]^T$.',
          strategyTitle: 'Step 3: Scale each column',
        },
        {
          expression: '= \\begin{bmatrix} 7 \\\\ 3 \\end{bmatrix}',
          annotation: 'Add the scaled columns: $[8,0]^T + [-1,3]^T = [7,3]^T$. The vector $\\mathbf{v} = [4,1]^T$ lands at $[7,3]^T$ after transformation $A$.',
          strategyTitle: 'Step 4: Add → output vector',
          hints: ['Verify via row formula: row 1 dot $\\mathbf{v}$ = $2(4)+(-1)(1)=7$. Row 2 dot $\\mathbf{v}$ = $0(4)+3(1)=3$. ✓'],
        },
      ],
    },
    {
      id: 'la2-001-ex2',
      title: 'Build a Matrix from Geometry — 90° Rotation',
      problem: 'Construct the $2 \\times 2$ matrix that rotates every vector in the 2D plane $90^\\circ$ counter-clockwise.',
      steps: [
        {
          expression: '\\hat{i} = \\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix} \\xrightarrow{\\text{90° CCW}} \\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix}',
          annotation: 'Strategy: track only the two basis vectors. $\\hat{i} = [1,0]^T$ points right. After rotating 90° counter-clockwise it points straight up: $[0,1]^T$. This will become column 1 of the matrix.',
          strategyTitle: 'Step 1: Track $\\hat{i}$ under 90° CCW rotation',
          hints: ['Picture a clock hand pointing 3 o\'clock (positive x). Rotate it 90° CCW — it now points 12 o\'clock (positive y).'],
        },
        {
          expression: '\\hat{j} = \\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix} \\xrightarrow{\\text{90° CCW}} \\begin{bmatrix} -1 \\\\ 0 \\end{bmatrix}',
          annotation: '$\\hat{j} = [0,1]^T$ points up. After 90° CCW it points left: $[-1,0]^T$. This becomes column 2 of the matrix.',
          strategyTitle: 'Step 2: Track $\\hat{j}$ under 90° CCW rotation',
          hints: ['A hand at 12 o\'clock, rotated 90° CCW, now points 9 o\'clock (negative x).'],
        },
        {
          expression: 'R_{90} = \\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}',
          annotation: 'Paste the two landing vectors in as columns: column 1 = destination of $\\hat{i}$ = $[0,1]^T$, column 2 = destination of $\\hat{j}$ = $[-1,0]^T$. Every vector in the plane is rotated 90° CCW by this matrix.',
          strategyTitle: 'Step 3: Paste destinations → columns of the matrix',
        },
        {
          expression: 'R_{90} \\begin{bmatrix} 3 \\\\ 1 \\end{bmatrix} = 3\\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix} + 1\\begin{bmatrix} -1 \\\\ 0 \\end{bmatrix} = \\begin{bmatrix} -1 \\\\ 3 \\end{bmatrix}',
          annotation: 'Verify: apply $R_{90}$ to a test vector $[3,1]^T$. The result $[-1,3]^T$ should be $[3,1]^T$ rotated 90° CCW. Length preserved: $\\sqrt{9+1} = \\sqrt{1+9}$ ✓. Direction rotated 90° ✓.',
          strategyTitle: 'Step 4: Verify on a test vector',
          hints: ['General rotation matrix by angle $\\theta$: $R_\\theta = \\begin{bmatrix}\\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta\\end{bmatrix}$. At $\\theta = 90°$: $\\cos 90° = 0$, $\\sin 90° = 1$. Matches our matrix.'],
        },
      ],
    },
    {
      id: 'la2-001-ex3',
      title: 'Read a Matrix — Identify the Transformation Geometrically',
      problem: `Given $A = \\begin{bmatrix} 1 & 3 \\\\ 0 & 1 \\end{bmatrix}$, describe geometrically what this transformation does to the plane. Then apply it to the square with corners at $(0,0)$, $(1,0)$, $(1,1)$, $(0,1)$.`,
      steps: [
        {
          expression: '\\text{Column 1} = \\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix}, \\quad \\text{Column 2} = \\begin{bmatrix} 3 \\\\ 1 \\end{bmatrix}',
          annotation: 'Read the columns: $\\hat{i} = [1,0]^T$ stays at $[1,0]^T$ (unchanged). $\\hat{j} = [0,1]^T$ moves to $[3,1]^T$ — it slides 3 units to the right while staying at height 1. This is a **horizontal shear**.',
          strategyTitle: 'Step 1: Read column destinations — identify the transformation type',
          hints: ['When $\\hat{i}$ stays fixed but $\\hat{j}$ slides horizontally, it is a horizontal shear. The grid lines stay parallel and evenly spaced — just tilted.'],
        },
        {
          expression: 'A\\begin{bmatrix}1\\\\0\\end{bmatrix} = \\begin{bmatrix}1\\\\0\\end{bmatrix}, \\quad A\\begin{bmatrix}1\\\\1\\end{bmatrix} = \\begin{bmatrix}4\\\\1\\end{bmatrix}, \\quad A\\begin{bmatrix}0\\\\1\\end{bmatrix} = \\begin{bmatrix}3\\\\1\\end{bmatrix}',
          annotation: 'Apply $A$ to three corners of the unit square. The corner $(0,0)$ stays at $(0,0)$ (origin fixed). $(1,0) \\to (1,0)$ (on x-axis, unaffected). $(0,1) \\to (3,1)$. $(1,1) \\to (4,1)$.',
          strategyTitle: 'Step 2: Transform the corners of the unit square',
        },
        {
          expression: '\\text{Square} \\to \\text{Parallelogram with corners } (0,0),(1,0),(4,1),(3,1)',
          annotation: 'The unit square shears into a parallelogram. The bottom edge stays on the x-axis (unaffected). The top edge slides 3 units right. **Key insight:** area is preserved in this shear — the parallelogram has the same area as the original square ($= |\\det(A)| = |1\\cdot1 - 3\\cdot0| = 1$).',
          strategyTitle: 'Step 3: Describe the image — square becomes parallelogram',
          hints: ['Area of output = $|\\det(A)|$ × area of input. For this shear, $\\det = 1$, so area is unchanged. This is NOT always true — a scale matrix $[2,0;0,2]$ doubles lengths and quadruples area.'],
        },
      ],
    },
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: 'la2-001-ch1',
      difficulty: 'easy',
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
      id: 'la2-001-ch2',
      difficulty: 'medium',
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
      answer: '$\\begin{bmatrix} 0.5 & 0 \\\\ 0 & 1 \\end{bmatrix}$',
    },
    {
      id: 'la2-001-ch3',
      difficulty: 'hard',
      problem: 'A $2 \\times 2$ matrix $A$ maps $[1,0]^T \\to [2,3]^T$ and $[0,1]^T \\to [-1,4]^T$. (a) Write $A$. (b) Where does $A$ send the vector $[5, -2]^T$? (c) Is the transformation area-preserving? (Hint: compute $|\\det(A)|$.)',
      hint: 'Columns of $A$ are the destinations of the basis vectors. For (c): $\\det(A) = ad - bc$; $|\\det| = 1$ means area-preserving.',
      walkthrough: [
        { expression: 'A = \\begin{bmatrix} 2 & -1 \\\\ 3 & 4 \\end{bmatrix}', annotation: 'Paste destinations as columns: column 1 = $[2,3]^T$ (where $\\hat{i}$ lands), column 2 = $[-1,4]^T$ (where $\\hat{j}$ lands).' },
        { expression: 'A\\begin{bmatrix}5\\\\-2\\end{bmatrix} = 5\\begin{bmatrix}2\\\\3\\end{bmatrix} + (-2)\\begin{bmatrix}-1\\\\4\\end{bmatrix} = \\begin{bmatrix}10\\\\15\\end{bmatrix}+\\begin{bmatrix}2\\\\-8\\end{bmatrix} = \\begin{bmatrix}12\\\\7\\end{bmatrix}', annotation: 'Linear combination of columns: $5 \\times$ col 1 plus $-2 \\times$ col 2.' },
        { expression: '\\det(A) = (2)(4) - (-1)(3) = 8 + 3 = 11', annotation: 'The determinant equals 11, so $|\\det| = 11 \\neq 1$. The transformation scales area by a factor of 11 — it is NOT area-preserving. Regions expand to 11 times their original area.' },
      ],
      answer: '$A = \\begin{bmatrix} 2 & -1 \\\\ 3 & 4 \\end{bmatrix}$, $A[5,-2]^T = [12,7]^T$, and $|\\det(A)| = 11$ — the transformation scales area by 11.',
    },
  ],

  // ── Semantic Layer ───────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: 'A\\mathbf{v}', meaning: 'The image of v under transformation A — equals x times column 1 of A plus y times column 2, where [x,y] are the components of v' },
      { symbol: 'T(\\mathbf{v})', meaning: 'A linear transformation function T applied to v — identical to matrix multiplication A·v when T has a matrix representation' },
      { symbol: '\\hat{i},\\;\\hat{j}', meaning: 'Standard basis vectors [1,0] and [0,1] — their destinations are exactly the columns of the transformation matrix' },
      { symbol: '\\ker(T)', meaning: 'Kernel (null space) of T — all vectors v with T(v) = 0; measures how much information the transformation destroys' },
      { symbol: '\\text{im}(T)', meaning: 'Image (column space) of T — the set of all possible outputs; equals the span of the columns of the matrix' },
      { symbol: 'T(c\\mathbf{u}+d\\mathbf{v})=cT(\\mathbf{u})+dT(\\mathbf{v})', meaning: 'The linearity condition — a transformation is linear iff it preserves scaling and addition simultaneously' },
    ],
    rulesOfThumb: [
      "Columns of A = destinations of the basis vectors — read them to understand what the transformation does geometrically.",
      "Matrix-vector multiplication is a linear combination of columns — A·v = v₁·(col 1) + v₂·(col 2).",
      "A transformation that moves the origin is affine, not linear — matrices alone cannot represent translations.",
      "If grid lines stay parallel and evenly spaced, the transformation is linear — even if stretched or tilted.",
      "To build a matrix from geometry, track only where î and ĵ land — those destinations become the two columns.",
    ],
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
        id: 'la2-001-assess-1',
        type: 'choice',
        text: 'Which matrix performs NO transformation — leaving every vector exactly where it was?',
        options: [
          '$\\begin{bmatrix}1&0\\\\0&1\\end{bmatrix}$',
          '$\\begin{bmatrix}0&1\\\\1&0\\end{bmatrix}$',
          '$\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}$',
          '$\\begin{bmatrix}0&0\\\\0&0\\end{bmatrix}$',
        ],
        answer: '$\\begin{bmatrix}1&0\\\\0&1\\end{bmatrix}$',
        hints: ['The identity matrix sends î to $[1,0]^T$ (unchanged) and ĵ to $[0,1]^T$ (unchanged). Column 1 = destination of î = $[1,0]$; column 2 = destination of ĵ = $[0,1]$.'],
      },
      {
        id: 'la2-001-assess-2',
        type: 'choice',
        text: 'Compute $\\begin{bmatrix}3&1\\\\0&2\\end{bmatrix}\\begin{bmatrix}2\\\\4\\end{bmatrix}$ using the linear combination of columns.',
        options: [
          '$[10, 8]^T$',
          '$[6, 8]^T$',
          '$[7, 8]^T$',
          '$[10, 4]^T$',
        ],
        answer: '$[10, 8]^T$',
        hints: ['Linear combination: $2 \\cdot [3,0]^T + 4 \\cdot [1,2]^T = [6,0]^T + [4,8]^T = [10,8]^T$. Or row formula: row 1 · [2,4] = 6+4=10; row 2 · [2,4] = 0+8=8.'],
      },
      {
        id: 'la2-001-assess-3',
        type: 'choice',
        text: 'A transformation sends $\\hat{i} \\to [0,1]^T$ and $\\hat{j} \\to [-1,0]^T$. Which matrix represents it?',
        options: [
          '$\\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$',
          '$\\begin{bmatrix}0&1\\\\-1&0\\end{bmatrix}$',
          '$\\begin{bmatrix}1&0\\\\0&-1\\end{bmatrix}$',
          '$\\begin{bmatrix}-1&0\\\\0&1\\end{bmatrix}$',
        ],
        answer: '$\\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$',
        hints: ['Column 1 = destination of î = $[0,1]^T$. Column 2 = destination of ĵ = $[-1,0]^T$. Paste destinations into columns: $\\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$. This is the 90° CCW rotation matrix.'],
      },
      {
        id: 'la2-001-assess-4',
        type: 'choice',
        text: 'Why cannot a translation $T(\\mathbf{x}) = \\mathbf{x} + [3,2]^T$ be represented as a $2 \\times 2$ matrix multiplication?',
        options: [
          'It moves the origin — $T(\\mathbf{0}) = [3,2]^T \\neq \\mathbf{0}$, violating linearity',
          'It changes the dimension of the output',
          'It is not invertible',
          'It does not preserve vector lengths',
        ],
        answer: 'It moves the origin — $T(\\mathbf{0}) = [3,2]^T \\neq \\mathbf{0}$, violating linearity',
        hints: ['Every linear map must satisfy $T(\\mathbf{0}) = \\mathbf{0}$, because $T(\\mathbf{0}) = T(0 \\cdot \\mathbf{v}) = 0 \\cdot T(\\mathbf{v}) = \\mathbf{0}$. Translation moves the origin to $[3,2]$, so it fails this test. Such transformations are called affine (not linear).'],
      },
    ],
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
    { id: 'cp-la2-001-1', label: 'Read: State the column secret — what do the columns of a matrix represent', type: 'read' },
    { id: 'cp-la2-001-2', label: 'Read: Define a linear transformation — the two rules it must satisfy', type: 'read' },
    { id: 'cp-la2-001-3', label: 'Read: Explain why every linear map has a unique matrix representation', type: 'read' },
    { id: 'cp-la2-001-4', label: 'Run: OpenMAT cell 1 — verify where î and ĵ land under a rotation matrix', type: 'lab' },
    { id: 'cp-la2-001-5', label: 'Run: Python cell 1 — apply a matrix to vectors and confirm via linear combination', type: 'lab' },
    { id: 'cp-la2-001-6', label: 'Complete: Example 1 — apply a matrix using the column linear combination method', type: 'example' },
    { id: 'cp-la2-001-7', label: 'Complete: Example 2 — build the 90° rotation matrix from geometry', type: 'example' },
    { id: 'cp-la2-001-8', label: 'Attempt: Challenge 2 — construct a matrix purely from a geometric description', type: 'challenge' },
  ],

  quiz: [
    {
      id: 'la2-001-quiz-1',
      type: 'choice',
      text: 'Geometrically, what do the columns of a 2×2 transformation matrix represent?',
      options: [
        'The coordinate destinations where the basis vectors î and ĵ land after the transformation',
        'The x and y components of the output vector for a specific input',
        'The angle of rotation applied to the space',
        'The eigenvalues of the matrix',
      ],
      answer: 'The coordinate destinations where the basis vectors î and ĵ land after the transformation',
      hints: ['Every vector is a linear combination of î and ĵ. If you know where those two land, you know where every other vector lands.'],
      reviewSection: 'Intuition tab — The column secret',
    },
    {
      id: 'la2-001-quiz-2',
      type: 'choice',
      text: 'Which of the following is NOT required for a transformation to be linear?',
      options: [
        'The area of the space must remain unchanged',
        'The origin (0,0) must stay at (0,0)',
        'Grid lines must remain parallel and evenly spaced',
        'Scaling the input by c scales the output by c',
      ],
      answer: 'The area of the space must remain unchanged',
      hints: ['Area can change — a scale matrix doubles lengths and quadruples area, yet is still linear. What cannot change: the origin must be fixed, grid lines must stay parallel, and scaling must carry through.'],
      reviewSection: 'Intuition tab — What makes a transformation linear?',
    },
    {
      id: 'la2-001-quiz-3',
      type: 'choice',
      text: 'Compute $\\begin{bmatrix}3&1\\\\2&-1\\end{bmatrix}\\begin{bmatrix}2\\\\4\\end{bmatrix}$.',
      options: ['$[10, 0]^T$', '$[6, -4]^T$', '$[7, 3]^T$', '$[10, 4]^T$'],
      answer: '$[10, 0]^T$',
      hints: ['Linear combination: $2[3,2]^T + 4[1,-1]^T = [6,4]^T + [4,-4]^T = [10,0]^T$. Or row formula: row 1 · [2,4] = 6+4=10; row 2 · [2,4] = 4−4=0.'],
      reviewSection: 'Example 1 — apply a matrix using linear combination of columns',
    },
    {
      id: 'la2-001-quiz-4',
      type: 'choice',
      text: 'The matrix $\\begin{bmatrix}1&0\\\\0&-1\\end{bmatrix}$ sends î to $[1,0]^T$ and ĵ to $[0,-1]^T$. What geometric transformation does this represent?',
      options: [
        'Reflection over the x-axis — the y-coordinate flips sign',
        'Rotation 90° clockwise',
        'Horizontal shear',
        'Projection onto the x-axis',
      ],
      answer: 'Reflection over the x-axis — the y-coordinate flips sign',
      hints: ['î stays on the x-axis (unchanged). ĵ flips from pointing up to pointing down — y-coordinates flip sign. Compare with projection $[1,0;0,0]$ which sends ĵ to zero.'],
      reviewSection: 'Example 3 — read what a transformation does from its columns',
    },
    {
      id: 'la2-001-quiz-5',
      type: 'choice',
      text: 'Can a linear transformation ever move the origin (0,0) to a different point?',
      options: [
        'No — by homogeneity, T(0) = T(0·v) = 0·T(v) = 0 for any v',
        'Yes — if the matrix has a nonzero entry on its diagonal',
        'Yes — if the transformation is a translation',
        'Only if the matrix is not square',
      ],
      answer: 'No — by homogeneity, T(0) = T(0·v) = 0·T(v) = 0 for any v',
      hints: ['The origin is always fixed by any linear map. A transformation that moves the origin (like a translation) is called affine, not linear.'],
      reviewSection: 'Rigor tab — The origin must be fixed',
    },
    {
      id: 'la2-001-quiz-6',
      type: 'choice',
      text: 'If $T$ is linear and $T(\\mathbf{v}) = \\mathbf{w}$, what is $T(3\\mathbf{v})$?',
      options: ['$3\\mathbf{w}$', '$\\mathbf{w}^3$', '$\\mathbf{w} + 3$', '$3\\mathbf{v}$'],
      answer: '$3\\mathbf{w}$',
      hints: ['By homogeneity: $T(3\\mathbf{v}) = 3T(\\mathbf{v}) = 3\\mathbf{w}$. Scaling the input by 3 scales the output by 3.'],
      reviewSection: 'Intuition tab — What makes a transformation linear?',
    },
    {
      id: 'la2-001-quiz-7',
      type: 'choice',
      text: 'Which matrix represents a horizontal shear that leaves î fixed but sends ĵ to $[2, 1]^T$?',
      options: [
        '$\\begin{bmatrix}1&2\\\\0&1\\end{bmatrix}$',
        '$\\begin{bmatrix}2&0\\\\1&0\\end{bmatrix}$',
        '$\\begin{bmatrix}1&0\\\\2&1\\end{bmatrix}$',
        '$\\begin{bmatrix}0&2\\\\0&1\\end{bmatrix}$',
      ],
      answer: '$\\begin{bmatrix}1&2\\\\0&1\\end{bmatrix}$',
      hints: ['Column 1 = destination of î = $[1,0]^T$ (unchanged). Column 2 = destination of ĵ = $[2,1]^T$. Paste destinations into columns.'],
      reviewSection: 'Example 2 — build a matrix from geometry',
    },
    {
      id: 'la2-001-quiz-8',
      type: 'choice',
      text: 'A matrix $A$ maps $\\hat{i} \\to [0,-1]^T$ and $\\hat{j} \\to [1,0]^T$. What is $A[3,2]^T$?',
      options: [
        '$[2,-3]^T$',
        '$[-2,3]^T$',
        '$[3,2]^T$',
        '$[-3,2]^T$',
      ],
      answer: '$[2,-3]^T$',
      hints: ['$A = \\begin{bmatrix}0&1\\\\-1&0\\end{bmatrix}$ (column 1 = $[0,-1]$, column 2 = $[1,0]$). Then $A[3,2]^T = 3[0,-1]^T + 2[1,0]^T = [0,-3]^T + [2,0]^T = [2,-3]^T$.'],
      reviewSection: 'Example 1 — apply a matrix using linear combination of columns',
    },
    {
      id: 'la2-001-quiz-9',
      type: 'choice',
      text: 'The matrix $\\begin{bmatrix}1&0\\\\0&0\\end{bmatrix}$ is called a projection. What does it do to every vector $[x,y]^T$?',
      options: [
        'It collapses the vector onto the x-axis: $[x,y]^T \\to [x,0]^T$',
        'It reflects the vector over the x-axis: $[x,y]^T \\to [x,-y]^T$',
        'It leaves the vector unchanged',
        'It projects onto the y-axis: $[x,y]^T \\to [0,y]^T$',
      ],
      answer: 'It collapses the vector onto the x-axis: $[x,y]^T \\to [x,0]^T$',
      hints: ['Column 1 = $[1,0]^T$ (î unchanged). Column 2 = $[0,0]^T$ (ĵ sent to the origin). So $y$ information is destroyed — every vector is flattened onto the x-axis.'],
      reviewSection: 'Math tab — common 2D transformations',
    },
    {
      id: 'la2-001-quiz-10',
      type: 'choice',
      text: 'Why is a translation (shifting every point by $[3,2]^T$) NOT a linear transformation?',
      options: [
        'It moves the origin — $T(\\mathbf{0}) = [3,2]^T \\neq \\mathbf{0}$',
        'It does not preserve vector lengths',
        'It changes the number of dimensions',
        'It is not invertible',
      ],
      answer: 'It moves the origin — $T(\\mathbf{0}) = [3,2]^T \\neq \\mathbf{0}$',
      hints: ['Every linear map must satisfy $T(\\mathbf{0}) = \\mathbf{0}$. Translation sends the origin to $[3,2]^T$ — immediately disqualified. Translations are called affine transformations.'],
      reviewSection: 'Intuition tab — Affine vs. Linear',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'A matrix is just a grid of numbers — like a spreadsheet or a table of data.',
      whyStudentsThinkIt: 'Students first encounter matrices in contexts like storing grades or pixel colors. The geometric interpretation is never shown explicitly.',
      correctionExample: 'Every $2 \\times 2$ matrix is a function $f: \\mathbb{R}^2 \\to \\mathbb{R}^2$. The entry $a_{ij}$ is not data — it is the $i$-th component of where the $j$-th basis vector lands. $\\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$ rotates every point 90° CCW.',
      contrastCase: 'A spreadsheet stores independent rows of data with no relationship between them. A matrix has deeply coupled entries — changing one entry changes where an entire basis vector goes.',
    },
    {
      falseBelief: 'You need to compute $A\\mathbf{v}$ for every vector $\\mathbf{v}$ separately to understand what the matrix does.',
      whyStudentsThinkIt: 'Students treat each multiplication as an isolated computation, not realizing the matrix defines one rule that applies everywhere.',
      correctionExample: 'Read the columns once: $A = \\begin{bmatrix}2&0\\\\0&3\\end{bmatrix}$ stretches the $x$-direction by 2 and the $y$-direction by 3. You immediately know $A[5,4]^T = [10,12]^T$, $A[-1,2]^T = [-2,6]^T$, and any other input — without new computation.',
      contrastCase: 'Once you read the column destinations, you can reconstruct the output for ANY input vector as a linear combination of those columns.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A video game engine applies 60 rotations per second to every object in the scene. Each object has 100 vertices. How does the engine avoid computing a fresh rotation for each vertex?',
      competingTechniques: 'Rotate each vertex independently using trigonometry vs. build the rotation matrix once and multiply',
      whyThisTechniqueWins: 'Build the rotation matrix $R_\\theta$ once (2 trig calls). Then multiply every vertex position by $R_\\theta$ — pure matrix-vector products, no trig per vertex. At 60 fps with 1000 objects × 100 vertices, this is the difference between 6 million trig calls vs 6 million simple multiplications.',
    },
    {
      situation: 'A neural network applies a learned "weight matrix" $W$ to an input vector of pixel values. How is this a linear transformation, and what does the column interpretation tell you about what $W$ "learns"?',
      competingTechniques: 'Think of W as a table of weights to be added vs. think of W as a linear transformation between feature spaces',
      whyThisTechniqueWins: 'Column $j$ of $W$ tells you: "this is the direction in output space that input feature $j$ contributes to." Reading $W$ geometrically reveals what the layer has learned to detect — rather than just opaque multiplications.',
    },
  ],

  debugging: [
    {
      commonError: 'Interpreting a matrix as storing output values instead of destinations of basis vectors.',
      symptom: 'Student computes $A[3,1]^T$ and says "the matrix already told me the answer was $[a,c]$" (confusing column values with the output).',
      whyItHappened: 'Conflating "the first column is $[2,0]^T$" with "any input gives output $[2,0]^T$." The column is only the destination of $\\hat{i}$, not a universal output.',
      repairStrategy: 'Always multiply: "column 1 × (first component of input) + column 2 × (second component)." For $A = [2,-1;0,3]$ and $\\mathbf{v} = [4,1]^T$: $4[2,0]^T + 1[-1,3]^T = [7,3]^T$ — not $[2,0]^T$.',
    },
    {
      commonError: 'Building the matrix with destinations as rows instead of columns.',
      symptom: 'Student is told "î goes to $[2,3]^T$" and writes $A = \\begin{bmatrix}2&3\\\\\\cdots&\\cdots\\end{bmatrix}$ (row instead of column).',
      whyItHappened: 'Writing destination coordinates left-to-right feels natural. But the matrix-vector product formula demands column $j$ = destination of basis vector $j$.',
      repairStrategy: 'Verify immediately: multiply the matrix you built by $[1,0]^T$ (î). If the result is the destination of î, the column is correct. If not, transpose.',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Apply any $2 \\times 2$ matrix to any vector using the linear combination of columns method, and construct a matrix from a geometric description (rotation, reflection, shear, scale) by tracking where î and ĵ land.',
    explainVerbally: 'Explain why a linear transformation is completely determined by where it sends the basis vectors, and why a translation cannot be represented as a matrix multiplication.',
    detectIncorrectApplication: 'Identify when a student builds a matrix with destinations as rows (not columns), or mistakes the column entries for the output of an arbitrary input.',
    transferToUnfamiliar: 'Given a 3D transformation described geometrically (e.g., "rotate 90° around the z-axis"), construct the $3 \\times 3$ matrix by tracking where $\\hat{i}, \\hat{j}, \\hat{k}$ land.',
  },
};
